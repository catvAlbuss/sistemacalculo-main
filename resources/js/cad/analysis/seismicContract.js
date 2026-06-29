// resources/js/cad/analysis/seismicContract.js
//
// ════════════════════════════════════════════════════════════════════════
//  CONTRATO DE RESULTADOS SÍSMICOS  +  GENERADOR DE MOCK  (Bloque C0)
// ════════════════════════════════════════════════════════════════════════
//
// Este archivo es la FRONTERA entre el equipo de visualización (nosotros) y
// el equipo del motor (compañero).  Define la forma EXACTA del objeto `result`
// que consume toda la capa de visualización (panel, animación, derivas,
// cortante, reporte) y provee un generador `createMockSeismicResult(model)`
// que produce esa misma forma con datos SIMULADOS coherentes a partir del
// modelo real del CAD.
//
// REGLA DE ORO:
//   - La visualización SIEMPRE consume un objeto con esta forma.
//   - Da igual si viene del mock (hoy) o del motor real (`/api/seismic/analyze`).
//   - Conectar el motor real = cambiar una bandera, sin tocar la visualización.
//
// UNIDADES (SI):
//   longitud m · periodo s · frecuencia Hz · masa kg · fuerza N
//   participación % (0–100) · deriva adimensional (ratio)
//
// FORMA DEL CONTRATO (resumen — ver JSON validado por el equipo):
//   result = {
//     success,
//     modal:   { num_modes_requested, modes:[ {mode, omega, period, frequency,
//                  gamma_x, gamma_y, modal_mass_x, modal_mass_y,
//                  mass_participation_x, mass_participation_y,
//                  cumulative_participation_x, cumulative_participation_y} ] },
//     seismic: { x:{base_shear, displacements:{id:{dx,dy,dz}}, modal_disps_detail},
//                y:{...} },
//     static:  { success, displacements:{id:{dx,dy,dz,rx,ry,rz}}, reactions, forces },
//     envelope:{ by_node:{id:{dx,dy,dz}} },
//     stories: [ {level, name, z, height, node_ids} ],         // B1/B6
//     drifts:  { x:[{story,z,disp,drift_ratio,allowable,ok}], y:[...] },  // B1
//     story_shears: { x:[{story,z,shear}], y:[...] },           // B6
//     meta:    { combination, damping_ratio, num_modes, sa_in_g,
//                total_mass_x, total_mass_y,
//                sum_participation_x, sum_participation_y },
//   }
// ════════════════════════════════════════════════════════════════════════

const MOCK_DEFAULTS = {
  numModes: 6,
  combination: "CQC",
  dampingRatio: 0.05,
  saInG: true,
  g: 9.81,
  Sa: 0.1969,          // meseta del espectro por defecto (en g)
  driftAllowable: 0.007, // límite normativo por defecto (E.030 concreto)
  defaultNodeMass: 1000, // kg por nodo si el modelo no tiene masas
};

// Plantilla de participación modal por modo (se recorta a num_modes).
// dir: 'x' | 'y' | 'r' (rotacional/acoplado).  Suma ~ representativa.
const MODE_TEMPLATE = [
  { dir: "x", pX: 75, pY: 1, tFactor: 1.00 },
  { dir: "y", pX: 1, pY: 73, tFactor: 0.95 },
  { dir: "r", pX: 8, pY: 8, tFactor: 0.65 },
  { dir: "x", pX: 6, pY: 0, tFactor: 0.32 },
  { dir: "y", pX: 0, pY: 6, tFactor: 0.30 },
  { dir: "r", pX: 2, pY: 2, tFactor: 0.21 },
];

// ─────────────────────────────────────────────────────────────────────────
//  API pública
// ─────────────────────────────────────────────────────────────────────────

/**
 * Genera un `result` sísmico SIMULADO con la forma exacta del contrato.
 *
 * @param {object} model    El componente CAD (`this` de Alpine) o `{nodes, shapes}`.
 * @param {object} options  Sobre-escrituras: {numModes, combination, dampingRatio,
 *                           saInG, g, Sa, driftAllowable}.
 * @returns {object} result conforme al contrato.
 */
export function createMockSeismicResult(model, options = {}) {
  const cfg = { ...MOCK_DEFAULTS, ...readModelConfig(model), ...options };

  // Si llega un espectro, usar su Sa pico (meseta) para que el cortante refleje
  // el espectro importado en vez del valor por defecto.
  const specPeak = peakSa(options.spectrum);
  if (specPeak != null) cfg.Sa = specPeak;

  const nodes = extractNodes(model);
  if (nodes.length === 0) {
    // Sin modelo cargado: devolver un edificio sintético de 2 pisos para
    // poder desarrollar la visualización sin un modelo abierto.
    return createMockSeismicResult(syntheticModel(), options);
  }

  // 1) Niveles (stories) — eje vertical = el que tenga más cotas distintas.
  const vertical = pickVerticalAxis(nodes);
  const stories = buildStories(nodes, vertical);
  const base = stories[0];
  const roof = stories[stories.length - 1];
  const totalHeight = Math.max(1e-6, roof.z - base.z);
  const nAbove = Math.max(1, stories.length - 1);

  // 2) Masas / pesos
  const totalMass = sumMass(nodes, cfg.defaultNodeMass);
  const totalWeight = totalMass * cfg.g;

  // 3) Modos
  const numModes = clamp(cfg.numModes, 1, 12);
  const T1 = Math.max(0.12, 0.10 * nAbove); // estimación gruesa por nº de pisos
  const modes = buildModes(numModes, T1);
  attachModeShapes(modes, nodes, vertical, base.z, totalHeight); // forma modal φ por nodo

  // 4) Desplazamientos por nodo (perfil tipo voladizo) en X e Y
  // Dirección del caso: 'x' → domina X, 'y' → domina Y, 'both' → ambas.
  const dir = String(options.direction || "both").toLowerCase();
  const fX = dir === "y" ? 0.12 : 1; // la dir. secundaria queda pequeña (acople)
  const fY = dir === "x" ? 0.12 : 1;
  // El desplazamiento (y por tanto la deriva) escala con Sa, igual que el
  // cortante → así "escalado" amplifica derivas Y cortante de forma coherente.
  // Calibrado para que un espectro de diseño típico (~0.5 g) dé derivas
  // realistas (~3-4‰) y uno fuerte pueda superar los límites de norma.
  const saScale = clamp((cfg.Sa || 0.25) / 0.25, 0.25, 25);
  const dispXById = {};
  const dispYById = {};
  const roofDispX = 0.005 * nAbove * fX * saScale;          // crece con altura y con Sa
  const roofDispY = 0.005 * nAbove * 0.95 * fY * saScale;
  for (const n of nodes) {
    const h = (n[vertical] - base.z) / totalHeight; // 0 en base, 1 en techo
    const shape = Math.pow(clamp(h, 0, 1), 1.1);    // perfil voladizo suave
    dispXById[n.id] = roofDispX * shape;
    dispYById[n.id] = roofDispY * shape;
  }

  // 5) Desplazamiento medio por nivel (para derivas)
  const meanDispX = meanDispPerStory(stories, dispXById);
  const meanDispY = meanDispPerStory(stories, dispYById);

  // 6) Derivas de entrepiso
  const driftsX = buildDrifts(stories, meanDispX, cfg.driftAllowable);
  const driftsY = buildDrifts(stories, meanDispY, cfg.driftAllowable);

  // 7) Cortante basal y cortante por piso (patrón de fuerzas ~ m·z)
  const SaMs2 = cfg.Sa * (cfg.saInG ? cfg.g : 1);
  const baseShearX = SaMs2 * totalMass * 0.85 * fX;
  const baseShearY = SaMs2 * totalMass * 0.85 * 0.98 * fY;
  const storyShearsX = buildStoryShears(stories, nodes, vertical, baseShearX, cfg.defaultNodeMass);
  const storyShearsY = buildStoryShears(stories, nodes, vertical, baseShearY, cfg.defaultNodeMass);

  // 7b) Peso sísmico por piso y momento de volteo en la base (#3).
  const weights = buildStoryWeights(stories, nodes, cfg.g, cfg.defaultNodeMass);
  const totalSeismicWeight = weights.reduce((s, w) => s + w.weight, 0);
  const overturningX = overturningMoment(storyShearsX);
  const overturningY = overturningMoment(storyShearsY);

  // 8) Detalle modal de desplazamientos (para reporte)
  const modalDetailX = buildModalDetail(modes, dispXById, cfg.Sa);
  const modalDetailY = buildModalDetail(modes, dispYById, cfg.Sa);

  // 9) Estático + envolvente (valores pequeños, solo para completar el shape)
  const staticBlock = buildStatic(nodes, vertical, base.z);
  const envelope = buildEnvelope(nodes, dispXById, dispYById, staticBlock);

  // 10) Meta
  const sumX = modes.reduce((s, m) => s + m.mass_participation_x, 0);
  const sumY = modes.reduce((s, m) => s + m.mass_participation_y, 0);

  return {
    success: true,
    _mock: true, // marca de origen (la visualización puede mostrar "DATOS SIMULADOS")

    modal: {
      num_modes_requested: numModes,
      modes,
    },

    seismic: {
      x: {
        base_shear: round(baseShearX, 1),
        displacements: toDispMap(dispXById, "x"),
        modal_disps_detail: modalDetailX,
      },
      y: {
        base_shear: round(baseShearY, 1),
        displacements: toDispMap(dispYById, "y"),
        modal_disps_detail: modalDetailY,
      },
    },

    static: staticBlock,
    envelope,

    stories: stories.map((s) => ({
      level: s.level,
      name: s.name,
      z: round(s.z, 3),
      height: round(s.height, 3),
      node_ids: s.node_ids,
    })),

    drifts: { x: driftsX, y: driftsY },
    story_shears: { x: storyShearsX, y: storyShearsY },

    // Peso sísmico por piso + total, y momento de volteo en la base (#3).
    weights: {
      total: round(totalSeismicWeight, 1),
      by_story: weights.map((w) => ({ story: w.story, z: round(w.z, 3), weight: round(w.weight, 1) })),
    },
    overturning: { x: round(overturningX, 1), y: round(overturningY, 1) },

    meta: {
      combination: cfg.combination,
      damping_ratio: cfg.dampingRatio,
      num_modes: numModes,
      sa_in_g: cfg.saInG,
      total_mass_x: round(totalMass, 2),
      total_mass_y: round(totalMass, 2),
      sum_participation_x: round(sumX, 1),
      sum_participation_y: round(sumY, 1),
    },
  };
}

/**
 * Valida que un objeto cumple lo mínimo del contrato. Útil al conectar el
 * motor real: si el backend devuelve algo incompleto, lo detectamos temprano.
 *
 * @returns {{ok:boolean, missing:string[], warnings:string[]}}
 */
export function validateSeismicContract(result) {
  const missing = [];
  const warnings = [];
  const need = (cond, path) => { if (!cond) missing.push(path); };

  need(result && typeof result === "object", "result");
  if (!result) return { ok: false, missing, warnings };

  need(Array.isArray(result?.modal?.modes), "modal.modes[]");
  need(result?.seismic?.x?.displacements, "seismic.x.displacements");
  need(typeof result?.seismic?.x?.base_shear === "number", "seismic.x.base_shear");

  // Campos nuevos (B1/B6) — si faltan, solo advertencia: la UI los tolera.
  if (!Array.isArray(result?.stories)) warnings.push("stories[] (B1/B6 aún no implementado en el motor)");
  if (!result?.drifts?.x) warnings.push("drifts.x (B1 aún no implementado)");
  if (!result?.story_shears?.x) warnings.push("story_shears.x (B6 aún no implementado)");

  return { ok: missing.length === 0, missing, warnings };
}

// ─────────────────────────────────────────────────────────────────────────
//  Helpers internos
// ─────────────────────────────────────────────────────────────────────────

function readModelConfig(model) {
  const c = model?.seismicConfig || {};
  const out = {};
  if (c.numModes != null) out.numModes = Number(c.numModes);
  if (c.combination) out.combination = c.combination;
  if (c.dampingRatio != null) out.dampingRatio = Number(c.dampingRatio);
  if (c.saInG != null) out.saInG = Boolean(c.saInG);
  if (c.g != null) out.g = Number(c.g);
  return out;
}

function extractNodes(model) {
  const raw = model?.nodes || [];
  return raw
    .map((n) => ({
      id: Number(n.id),
      x: Number(n.position?.x ?? n.x ?? 0),
      y: Number(n.position?.y ?? n.y ?? 0),
      z: Number(n.position?.z ?? n.z ?? 0),
      mass: Number(n.mass_x ?? n.mass?.x ?? n.mass ?? 0),
    }))
    .filter((n) => Number.isFinite(n.id));
}

// Elige como vertical el eje (z o y) con más cotas distintas → más robusto
// para modelos 3D (z-up) y de elevación 2D (y-up).
function pickVerticalAxis(nodes) {
  const levelsZ = distinctLevels(nodes, "z").length;
  const levelsY = distinctLevels(nodes, "y").length;
  return levelsZ >= levelsY ? "z" : "y";
}

function distinctLevels(nodes, axis) {
  const set = new Set(nodes.map((n) => round(n[axis], 2)));
  return [...set].sort((a, b) => a - b);
}

function buildStories(nodes, axis) {
  const levels = distinctLevels(nodes, axis);
  return levels.map((z, i) => {
    const node_ids = nodes
      .filter((n) => round(n[axis], 2) === z)
      .map((n) => n.id);
    const height = i === 0 ? 0 : z - levels[i - 1];
    return {
      level: i,
      name: i === 0 ? "Base" : `Piso ${i}`,
      z,
      height,
      node_ids,
    };
  });
}

function sumMass(nodes, fallbackPerNode) {
  const total = nodes.reduce((s, n) => s + (n.mass > 0 ? n.mass : 0), 0);
  return total > 0 ? total : nodes.length * fallbackPerNode;
}

function buildModes(numModes, T1) {
  const modes = [];
  let cumX = 0;
  let cumY = 0;
  for (let i = 0; i < numModes; i++) {
    const tpl = MODE_TEMPLATE[i] || {
      dir: i % 2 ? "y" : "x",
      pX: i % 2 ? 0 : 1.5,
      pY: i % 2 ? 1.5 : 0,
      tFactor: 0.18 / (i + 1),
    };
    const period = round(T1 * tpl.tFactor, 4);
    const omega = period > 1e-9 ? round((2 * Math.PI) / period, 4) : 0;
    const frequency = period > 1e-9 ? round(1 / period, 4) : 0;
    cumX += tpl.pX;
    cumY += tpl.pY;
    modes.push({
      mode: i + 1,
      omega,
      period,
      frequency,
      gamma_x: round(tpl.pX > 1 ? 10 + tpl.pX * 0.05 : 0.02, 3),
      gamma_y: round(tpl.pY > 1 ? 10 + tpl.pY * 0.05 : 0.02, 3),
      modal_mass_x: round(tpl.pX * 90, 2),
      modal_mass_y: round(tpl.pY * 90, 2),
      mass_participation_x: round(tpl.pX, 2),
      mass_participation_y: round(tpl.pY, 2),
      cumulative_participation_x: round(cumX, 2),
      cumulative_participation_y: round(cumY, 2),
    });
  }
  return modes;
}

// Genera la forma modal φ por nodo para cada modo (vectores unitarios normalizados).
// Modos X/Y: perfil tipo viga en voladizo con k semiondas según el orden dentro de
// su dirección. Modos rotacionales: desplazamiento tangencial alrededor del centro
// en planta (giro). La animación usa estas formas para "Mode shape" individual.
function attachModeShapes(modes, nodes, axis, baseZ, totalHeight) {
  const cx = avg(nodes.map((n) => n.x));
  const cy = avg(nodes.map((n) => n.y));
  const Rmax = Math.max(1e-6, ...nodes.map((n) => Math.hypot(n.x - cx, n.y - cy)));

  let nX = 0, nY = 0, nR = 0; // contador de armónico por dirección
  for (const m of modes) {
    const tpl = MODE_TEMPLATE[m.mode - 1] || { dir: m.mode % 2 ? "x" : "y" };
    const dir = tpl.dir;
    const k = dir === "x" ? ++nX : dir === "y" ? ++nY : ++nR;

    const shape = {};
    let maxAbs = 1e-9;
    for (const n of nodes) {
      const h = clamp((n[axis] - baseZ) / totalHeight, 0, 1);
      const prof = Math.sin(((2 * k - 1) * Math.PI / 2) * h); // k semiondas en altura
      let dx = 0, dy = 0;
      if (dir === "x") dx = prof;
      else if (dir === "y") dy = prof;
      else { // rotacional → tangencial alrededor del centro en planta
        dx = (-(n.y - cy) / Rmax) * prof;
        dy = ((n.x - cx) / Rmax) * prof;
      }
      shape[String(n.id)] = { dx, dy, dz: 0 };
      maxAbs = Math.max(maxAbs, Math.abs(dx), Math.abs(dy));
    }
    for (const id in shape) {
      shape[id].dx = round(shape[id].dx / maxAbs, 5);
      shape[id].dy = round(shape[id].dy / maxAbs, 5);
    }
    m.shape = shape; // { "<nodeId>": {dx, dy, dz} } normalizado (máx = 1)
  }
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// Peso sísmico por piso = (Σ masa de los nodos del piso) · g  [N].
function buildStoryWeights(stories, nodes, g, fallbackMass) {
  return stories.filter((s) => s.level > 0).map((s) => {
    const massSum = (s.node_ids || []).reduce((acc, id) => {
      const n = nodes.find((x) => x.id === id);
      const m = n && n.mass > 0 ? n.mass : fallbackMass;
      return acc + m;
    }, 0);
    return { story: s.level, z: s.z, weight: massSum * g };
  });
}

// Momento de volteo en la base = Σ F_i · z_i, con F_i = fuerza lateral del piso
// (diferencia de cortantes entre pisos consecutivos).  [N·m]
function overturningMoment(storyShears) {
  const sorted = [...storyShears].sort((a, b) => a.story - b.story); // base → techo
  let M = 0;
  for (let i = 0; i < sorted.length; i++) {
    const F = (Number(sorted[i].shear) || 0) - (Number(sorted[i + 1]?.shear) || 0);
    M += F * (Number(sorted[i].z) || 0);
  }
  return M;
}

function meanDispPerStory(stories, dispById) {
  return stories.map((s) => {
    if (!s.node_ids.length) return 0;
    const sum = s.node_ids.reduce((acc, id) => acc + (dispById[id] || 0), 0);
    return sum / s.node_ids.length;
  });
}

function buildDrifts(stories, meanDisp, allowable) {
  const out = [];
  for (let i = 1; i < stories.length; i++) {
    const s = stories[i];
    const rel = meanDisp[i] - meanDisp[i - 1];
    const ratio = s.height > 1e-9 ? rel / s.height : 0;
    out.push({
      story: s.level,
      z: round(s.z, 3),
      disp: round(meanDisp[i], 6),
      drift_ratio: round(Math.abs(ratio), 6),
      allowable,
      ok: Math.abs(ratio) <= allowable,
    });
  }
  return out;
}

// Patrón de fuerzas laterales ~ m_i · z_i (primer modo). El cortante de un
// nivel es la suma de las fuerzas que están por encima o en él.
function buildStoryShears(stories, nodes, axis, baseShear, fallbackMass) {
  const above = stories.filter((s) => s.level > 0);
  const massOf = (s) =>
    s.node_ids.reduce((acc, id) => {
      const n = nodes.find((x) => x.id === id);
      const m = n && n.mass > 0 ? n.mass : fallbackMass;
      return acc + m;
    }, 0);

  const weights = above.map((s) => massOf(s) * s.z);
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;
  const forces = above.map((_, i) => (weights[i] / wSum) * baseShear);

  // Cortante acumulado desde el techo (de mayor a menor nivel).
  const out = [];
  for (let i = above.length - 1; i >= 0; i--) {
    const shear = forces.slice(i).reduce((a, b) => a + b, 0);
    out.push({
      story: above[i].level,
      z: round(above[i].z, 3),
      shear: round(shear, 1),
    });
  }
  return out; // ordenado de techo hacia base
}

function buildModalDetail(modes, dispById, Sa) {
  const maxDisp = Math.max(0, ...Object.values(dispById));
  return modes.map((m, i) => ({
    mode: m.mode,
    period: m.period,
    Sa: round(Sa, 4),
    disp_max: round(maxDisp / (i + 1), 6),
  }));
}

function buildStatic(nodes, axis, baseZ) {
  const displacements = {};
  const reactions = {};
  const forces = {};
  for (const n of nodes) {
    const isBase = round(n[axis], 2) === round(baseZ, 2);
    displacements[String(n.id)] = {
      dx: 0, dy: 0, dz: isBase ? 0 : -0.0006,
      rx: 0, ry: 0, rz: 0,
    };
    if (isBase) {
      reactions[String(n.id)] = {
        fx: 0, fy: 0, fz: round((nodes.length ? 1 : 0) * 3000, 1),
        mx: 0, my: 0, mz: 0,
      };
    }
  }
  return { success: true, displacements, reactions, forces };
}

function buildEnvelope(nodes, dispXById, dispYById, staticBlock) {
  const by_node = {};
  for (const n of nodes) {
    const sd = staticBlock.displacements[String(n.id)] || {};
    by_node[String(n.id)] = {
      dx: round(Math.max(Math.abs(dispXById[n.id] || 0), Math.abs(sd.dx || 0)), 6),
      dy: round(Math.max(Math.abs(dispYById[n.id] || 0), Math.abs(sd.dy || 0)), 6),
      dz: round(Math.abs(sd.dz || 0), 6),
    };
  }
  return { by_node };
}

// displacements: clave = node_id (string); la dirección secundaria va en 0.
function toDispMap(dispById, dir) {
  const map = {};
  for (const [id, v] of Object.entries(dispById)) {
    map[String(id)] = {
      dx: dir === "x" ? round(v, 6) : 0,
      dy: dir === "y" ? round(v, 6) : 0,
      dz: 0,
    };
  }
  return map;
}

// Edificio sintético de 2 pisos (4 columnas) si no hay modelo cargado.
function syntheticModel() {
  const nodes = [];
  let id = 1;
  const xs = [0, 4];
  const ys = [0, 4];
  const zs = [0, 3, 6];
  for (const z of zs) {
    for (const x of xs) {
      for (const y of ys) {
        nodes.push({
          id: id++,
          position: { x, y, z },
          mass: z === 0 ? 0 : 1795, // 4 nodos × 1795 ≈ 7180 kg por piso
        });
      }
    }
  }
  return { nodes };
}

// Sa pico (meseta) de un espectro [{T,Sa}] | [[T,Sa]]. null si no hay datos.
function peakSa(spectrum) {
  if (!Array.isArray(spectrum) || !spectrum.length) return null;
  let max = 0;
  for (const p of spectrum) {
    const sa = Array.isArray(p) ? Number(p[1]) : Number(p?.Sa ?? p?.sa);
    if (Number.isFinite(sa) && sa > max) max = sa;
  }
  return max > 0 ? max : null;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function round(v, d = 4) {
  const f = Math.pow(10, d);
  return Math.round((Number(v) || 0) * f) / f;
}

// ─────────────────────────────────────────────────────────────────────────
//  Helpers de consola para validar el mock en desarrollo
//    window.seismicMock.preview()  → imprime el result completo
//    window.seismicMock.validate() → corre validateSeismicContract sobre él
// ─────────────────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  window.seismicMock = {
    create: createMockSeismicResult,
    validate: validateSeismicContract,
    preview(model, options) {
      const m = model || window.cadSystem || {};
      const result = createMockSeismicResult(m, options);
      console.log("🧪 Mock seismic result:", result);
      console.log("📋 Validación contrato:", validateSeismicContract(result));
      return result;
    },
  };
}
