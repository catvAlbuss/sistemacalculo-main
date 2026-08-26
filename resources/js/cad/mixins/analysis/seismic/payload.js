// mixins/analysis/seismic/payload.js — parte "payload" del análisis sísmico
// (seismic.js se partió en sub-mixins por responsabilidad; barril en seismic.js).
import Swal from "sweetalert2";
import {
  startBabylonSeismicAnimation,
  stopBabylonSeismicAnimation,
  isBabylonSeismicAnimating,
  setSeismicAnimationSpeed,
  setSeismicAnimationScale,
  showBabylonSeismicDeformedShape,
  resetBabylonSeismicPositions,
  showSeismicDisplacementLabels,
  clearSeismicDisplacementLabels,
  isSeismicDisplacementLabelsVisible,
  showSeismicDriftLabels,
  clearSeismicDriftLabels,
  isSeismicDriftLabelsVisible,
} from "../../../3d/viewer3d.js";
import {
  createMockSeismicResult,
  validateSeismicContract,
} from "../../../engine/seismicContract.js";
import { BACKEND_URL, USE_MOCK_SEISMIC, DRIFT_LIMITS } from "./_constants.js";
import { buildColumnEndOffsets } from "./columnEndOffsets.js";
import { wallGridPointsOnBeams } from "./wallMeshNodes.js";
import { splitBeamsAtInteriorNodes } from "./frameMeshAtIntersections.js";
import { getNodeRestraints } from "../../../model/nodeSupports.js";

// Tamano objetivo de elemento de muro para el modulo de DIAGRAMAS.
//
// 1.25 m NO esta ajustado a nuestro error: es el `WALLMESHMAXSIZE 1.25` que el
// propio .e2k declara en su bloque AUTOMESHOPTIONS, o sea con lo que ETABS
// malla sus muros. Elegir el tamano que MEJOR puntua seria sobreajustar (el
// mismo error contra el que advierte la calibracion de
// _WALL_TARGET_ELEMENT_SIZE_M en inputs.py): el error medio sobre las 9
// columnas de `muros modelo 2.1.e2k` NO converge con la malla
// (1.5 -> 0.590, 1.0 -> 0.414, 0.75 -> 0.565, 0.5 -> 0.442), porque las
// columnas de momento chico son residuos y su error relativo es ruido. Las de
// momento grande si son estables, y C20 mejora de forma monotona.
//
// Con 1.25 m: error medio 0.578 -> 0.460, 7 de 9 columnas mejoran, y el
// analisis pasa de 0.3 a 0.8 s (con 1.0 m serian 6.7 s).
//
// PENDIENTE: leerlo del .e2k. Hoy el import no parsea AUTOMESHOPTIONS; cuando
// lo haga, basta con dejar `seismicConfig.wallMeshSize`, que esta constante ya
// respeta como fallback.
//
// NO afecta al pipeline sismico: solo viaja cuando `meshBeamsAtIntersections`
// esta encendido, y ese flag lo enciende unicamente frameForceBackend.js para
// su propio payload.
const WALL_MESH_SIZE_DIAGRAMAS_M = 1.25;

export const seismicPayloadMixin = {

  // ─── D1: resolución de propiedades de material ──────────────────────────────
  // Normaliza un módulo a Pa: si viene < 1e7 se asume en MPa y se multiplica ×1e6;
  // si ya es grande (≥1e7) se asume en Pa. null si no es válido.
  _normalizeModulus(raw) {
    const v = Number(raw) || 0;
    if (v <= 0) return null;
    return v >= 1e7 ? v : v * 1e6;
  },

  // Resuelve E y G (en Pa) para una sección: busca su material por nombre en
  // cadSystem.materialProperties.materials. Si la sección no referencia material
  // pero hay exactamente uno definido, lo usa. Cae a acero por defecto.
  _resolveFrameMaterial(sec = {}, frame = {}) {
    const mats = this.materialProperties?.materials || [];
    const name = sec.material || sec.materialName || sec.materialProperty || sec.mat
      || frame.material || frame.materialName;
    let mat = name ? mats.find((m) => String(m.name) === String(name)) : null;
    if (!mat && mats.length === 1) mat = mats[0]; // único material → usarlo
    // Fallback robusto: si el nombre referenciado no existe (p.ej. "CONCRETO"
    // vs "CONC"), preferir un material de concreto antes de caer a acero.
    if (!mat) {
      mat = mats.find((m) =>
        String(m.designType || "").toLowerCase() === "concrete" ||
        /conc/i.test(String(m.name || "")));
    }

    const E = this._normalizeModulus(mat?.modulusElasticity ?? mat?.E ?? sec.E ?? sec.elasticModulus) ?? 200e9;
    const G = this._normalizeModulus(mat?.shearModulus ?? mat?.G ?? sec.G ?? sec.shearModulus) ?? 77e9;
    return { E, G, materialName: mat?.name || null };
  },

  // Resuelve E, G, poissonRatio y peso unitario (N/m³) para un MURO por el
  // nombre de su material (wall.section.material — string, ver
  // wall-sections-modal.blade.php). A diferencia de _resolveFrameMaterial no
  // hay indirección por "sección de frame"; el muro referencia el material
  // directo. G se deriva de E/poissonRatio cuando el material no trae G
  // explícito (isotrópico: G = E / (2·(1+ν))), necesario para el elemento
  // shell (ElasticIsotropic) en el motor.
  _resolveWallMaterial(materialName) {
    const mats = this.materialProperties?.materials || [];
    let mat = materialName ? mats.find((m) => String(m.name) === String(materialName)) : null;
    if (!mat && mats.length === 1) mat = mats[0];
    if (!mat) {
      mat = mats.find((m) =>
        String(m.designType || "").toLowerCase() === "concrete" ||
        /conc/i.test(String(m.name || "")));
    }

    const E = this._normalizeModulus(mat?.modulusElasticity ?? mat?.E) ?? 200e9;

    let poissonRatio = this._numberForSeismic(mat?.poissonRatio ?? mat?.poisson ?? mat?.u, null);
    if (poissonRatio === null || poissonRatio <= 0 || poissonRatio >= 0.5) poissonRatio = 0.2;

    const G = this._normalizeModulus(mat?.shearModulus ?? mat?.G) ?? (E / (2 * (1 + poissonRatio)));

    // Mismo criterio que _getFrameUnitWeightForSeismic: weightPerUnitVolume
    // del diálogo de materiales viene en N/mm³ (~2.4e-5) → ×1e9 = N/m³.
    const wNmm3 = this._numberForSeismic(mat?.weightPerUnitVolume, null) ?? this._numberForSeismic(mat?.weight, null);
    const unitWeightNPerM3 = (wNmm3 !== null && wNmm3 > 0 && wNmm3 < 1) ? wNmm3 * 1e9 : 24000;

    // designType (Concrete/Masonry/...) — el motor lo usa para decidir el
    // modificador de flexión fuera-de-plano del muro: la albañilería (tabique)
    // se excluye/reduce por práctica de diseño, independiente del espesor.
    return { E, G, poissonRatio, unitWeightNPerM3, designType: mat?.designType || null, name: mat?.name || materialName || null };
  },

  // ─── Diafragmas rígidos para análisis sísmico ─────────────────────────────
  _getNodeZForSeismic(node) {
    return Number(node?.position?.z ?? node?.z ?? 0);
  },

  _nodeHasSupportForSeismic(node) {
    if (!node) return false;

    if (node.soporte && String(node.soporte).trim() !== "") {
      return true;
    }

    const r = node.restraints || node.constraints || node.restraint || node.support;
    if (!r) return false;

    return Boolean(r.ux || r.uy || r.uz || r.rx || r.ry || r.rz);
  },

  _getNodeDiaphragmIdForSeismic(node) {
    return (
      node?.diaphragmId ||
      node?.diaphragm_id ||
      node?.diaphragmName ||
      node?.diaphragm?.id ||
      node?.assignment?.diaphragm?.id ||
      null
    );
  },

  /**
   * Grupos EXPLÍCITOS de diafragma (asignaciones del usuario), por piso.
   * Fuentes, con precedencia estilo ETABS:
   *  1. Joint directo (Assign ▸ Joint ▸ Diaphragms): manda sobre el área.
   *     `diaphragmMode:"none"` = Disconnect → el nudo queda excluido siempre.
   *  2. Área con diafragma (Assign ▸ Shell ▸ Diaphragms): los nudos del piso
   *     dentro del polígono lo heredan ("FromArea").
   * Cada instancia es POR PISO: D1 asignado en 5 pisos genera 5 diafragmas
   * independientes (D1@3, D1@6, ...) — un solo grupo amarraría los pisos entre
   * sí, rigidizando el edificio completo.
   * También lo consume el renderer 2D para dibujar la "araña" del diafragma.
   */
  getExplicitDiaphragmGroups(nodes) {
    const zKey = (z) => Math.round((Number(z) || 0) * 100) / 100;
    const groups = new Map(); // `${name}@${z}` → {id, name, z, nodeIds:Set}

    // Precedencia por nudo: asignación directa (nombre) o "none" (null).
    const directByNode = new Map();
    (nodes || []).forEach((node) => {
      const id = Number(node.id);
      if (!Number.isFinite(id)) return;
      const mode = node.diaphragmMode || node.assignment?.diaphragmMode || null;
      if (mode === "none") {
        directByNode.set(id, null);
        return;
      }
      const dId = this._getNodeDiaphragmIdForSeismic(node);
      if (dId) directByNode.set(id, String(dId));
    });

    const push = (name, node) => {
      const id = Number(node.id);
      if (!Number.isFinite(id)) return;
      // Un nudo empotrado no entra al diafragma (conflicto constraint/restraint).
      if (this._nodeHasSupportForSeismic?.(node)) return;
      const z = this._getNodeZForSeismic(node);
      const key = `${name}@${zKey(z)}`;
      if (!groups.has(key)) {
        groups.set(key, { id: key, name: String(name), source: "assignment", z, nodeIds: new Set() });
      }
      groups.get(key).nodeIds.add(id);
    };

    // 1) Joints con asignación directa.
    (nodes || []).forEach((node) => {
      const name = directByNode.get(Number(node.id));
      if (name) push(name, node);
    });

    // 2) Áreas con diafragma asignado → nudos cubiertos por el polígono.
    const tol = 0.05;
    (this.areas || []).forEach((a) => {
      const name = a.diaphragmName || a.diaphragm?.name || a.diaphragmId;
      if (!name) return;
      const pts = Array.isArray(a.points) ? a.points : [];
      if (pts.length < 3) return;
      const az = Number(a.z ?? pts[0]?.z) || 0;
      const poly = pts.map((p) => [Number(p.x) || 0, Number(p.y) || 0]);

      (nodes || []).forEach((node) => {
        const id = Number(node.id);
        if (!Number.isFinite(id)) return;
        if (directByNode.has(id)) return; // directo o "none" tienen precedencia
        if (Math.abs(this._getNodeZForSeismic(node) - az) > tol) return;
        const nx = Number(node.position?.x ?? node.x) || 0;
        const ny = Number(node.position?.y ?? node.y) || 0;
        if (this._pointInPolygonInclusive(nx, ny, poly)) push(String(name), node);
      });
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        nodeIds: [...group.nodeIds].sort((a, b) => a - b),
      }))
      .filter((group) => group.nodeIds.length >= 2)
      .sort((a, b) => a.z - b.z);
  },

  // Punto en polígono (ray casting) incluyendo el borde: un nudo que cae en
  // una arista o vértice de la losa cuenta como cubierto.
  _pointInPolygonInclusive(x, y, poly, eps = 1e-6) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      // Sobre el segmento (borde) → cubierto.
      const cross = (xj - xi) * (y - yi) - (yj - yi) * (x - xi);
      const within =
        Math.min(xi, xj) - eps <= x && x <= Math.max(xi, xj) + eps &&
        Math.min(yi, yj) - eps <= y && y <= Math.max(yi, yj) + eps;
      if (Math.abs(cross) <= eps && within) return true;
      const intersect =
        (yi > y) !== (yj > y) &&
        x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  },

  // Ids de nudos cubiertos por alguna losa (área), para que el diafragma rígido
  // SIGA LA LOSA y no todos los nudos del piso: una columna sin losa (ej. un
  // apéndice conectado por una viga larga) debe quedar LIBRE, como en ETABS.
  // Vacío si el modelo no tiene losas (bare frame → se agrupa por elevación).
  _slabCoveredNodeIds(nodes, tolerance = 0.05) {
    // Solo LOSAS — no muros. Los muros también viven en this.areas
    // (areaType === "wall") pero su polígono es un panel VERTICAL (p1-abajo,
    // p2-abajo, p2-arriba, p1-arriba), no una losa horizontal: sin este
    // filtro, cualquier nudo cerca del plano de un muro contaba como
    // "cubierto por losa", activando el filtro de diafragma (useSlabFilter)
    // y dejando SIN diafragma auto a pisos que en realidad no tienen ninguna
    // losa (bare frame con solo muros, p.ej. techo de armadura + muros de
    // fachada) — el diafragma debía caer al modo "agrupar por elevación"
    // pero quedaba atrapado en "sin losa = nudo libre" para TODOS los nudos.
    const areas = (Array.isArray(this.areas) ? this.areas : [])
      .filter((a) => (a?.areaType || a?.type || "slab") !== "wall");
    const covered = new Set();
    if (!areas.length) return covered;

    (nodes || []).forEach((node) => {
      const nx = Number(node.position?.x ?? node.x) || 0;
      const ny = Number(node.position?.y ?? node.y) || 0;
      const nz = this._getNodeZForSeismic(node);
      const id = Number(node.id);
      if (!Number.isFinite(id)) return;

      for (const a of areas) {
        const pts = Array.isArray(a?.points) ? a.points : [];
        if (pts.length < 3) continue;
        const az = Number(a.z ?? pts[0]?.z) || 0;
        if (Math.abs(nz - az) > tolerance) continue;
        const poly = pts.map((p) => [Number(p.x) || 0, Number(p.y) || 0]);
        if (this._pointInPolygonInclusive(nx, ny, poly)) {
          covered.add(id);
          break;
        }
      }
    });

    return covered;
  },

  _buildAutoDiaphragmsByStoryZ(nodes, tolerance = 0.05) {
    const validNodes = (nodes || [])
      .filter((node) => !this._nodeHasSupportForSeismic(node))
      .map((node) => ({
        id: Number(node.id),
        z: this._getNodeZForSeismic(node),
      }))
      .filter((node) => Number.isFinite(node.id));

    if (!validNodes.length) return [];

    const allZ = (nodes || []).map((node) => this._getNodeZForSeismic(node));
    const minZ = Math.min(...allZ);

    // Si hay losas, el diafragma SIGUE LA LOSA (nudos sin losa quedan libres).
    // Sin losas (bare frame), se agrupa por elevación como antes.
    const slabNodes = this._slabCoveredNodeIds(nodes, tolerance);
    const useSlabFilter = slabNodes.size > 0;

    const groups = [];

    validNodes.forEach((node) => {
      // No crear diafragma automático en la base.
      if (Math.abs(node.z - minZ) <= tolerance) return;

      // Nudo sin losa (apéndice) → libre, no entra al diafragma.
      if (useSlabFilter && !slabNodes.has(node.id)) return;

      let group = groups.find((item) => Math.abs(item.z - node.z) <= tolerance);

      if (!group) {
        group = {
          id: `D_Z_${groups.length + 1}`,
          source: "auto_by_z",
          z: node.z,
          nodeIds: [],
        };
        groups.push(group);
      }

      group.nodeIds.push(node.id);
    });

    return groups
      .map((group) => ({
        ...group,
        nodeIds: [...new Set(group.nodeIds)].sort((a, b) => a - b),
      }))
      .filter((group) => group.nodeIds.length >= 2)
      .sort((a, b) => a.z - b.z);
  },

  /**
   * Pisos REALES del modelo (this.stories) con los nodos de cada uno asignados
   * por ELEVACIÓN, en el formato que espera el motor (_group_nodes_by_story,
   * Caso 1 con nodeIds). Sin esto el motor no recibe pisos y los reconstruye
   * agrupando por cada Z distinto de los nodos → un edificio de 2 pisos con
   * techo de armadura salía con 11 "pisos" (uno por cada Z de la armadura) en
   * la tabla de derivas.
   *
   * Regla de asignación (estilo ETABS): un nodo pertenece al PRIMER piso cuya
   * elevación es >= z (el nivel en o inmediatamente sobre el nodo). Así todos
   * los nodos intermedios de una armadura (entre el piso N-1 y el nivel de
   * techo N) caen en el piso N, no en pisos ficticios propios.
   *
   * Se mandan TAMBIÉN los pisos que quedaron SIN NINGÚN NODO. Parece inútil,
   * pero el motor los usa como NIVELES para el lumping de masa
   * (`_lump_mass_to_story_levels`, que reparte tributariamente entre los dos
   * niveles adyacentes): si falta un nivel intermedio, el tramo tributario se
   * estira hasta el nivel siguiente y arrastra masa a un piso que no le toca.
   * Medido con MODULO 1 (.e2k con Base/Story1 3.2/Story2 6.4/Story3 9.8/
   * Story4 11.9, techo entre 6.6 y 8.7): filtrando los vacíos, el techo
   * repartía contra Story1 3.2 y dejaba Story1 +25% y Story3 −38% vs ETABS;
   * mandando los 5 niveles queda −4.5% / −8.4%.
   * Para las DERIVAS no molestan: `_group_nodes_by_story` (solver.py) hace
   * `continue` sobre los pisos sin nodos, así que no aparecen en las tablas —
   * igual que ETABS, que los lista con masa 0.
   */
  _buildSeismicStoriesForPayload(nodeList = [], tolerance = 0.05) {
    const sorted = (Array.isArray(this.stories) ? this.stories : [])
      .map((s) => ({
        name: String(s.name ?? s.label ?? "Story"),
        elevation: Number(s.elevation ?? s.z ?? 0),
      }))
      .filter((s) => Number.isFinite(s.elevation))
      .sort((a, b) => a.elevation - b.elevation);

    // Con menos de 2 niveles no hay derivas que calcular; se deja que el motor
    // agrupe por Z (comportamiento previo) en vez de forzar un piso único.
    if (sorted.length < 2) return [];

    const buckets = sorted.map((s) => ({
      name: s.name,
      elevation: s.elevation,
      nodeIds: [],
    }));
    const topIndex = sorted.length - 1;

    (nodeList || []).forEach((n) => {
      const id = Number(n.id);
      const z = Number(n.z ?? 0);
      if (!Number.isFinite(id)) return;

      // Primer piso cuya elevación >= z (dentro de tolerancia). Si el nodo
      // queda por encima del último nivel, se asigna al último.
      let idx = sorted.findIndex((s) => s.elevation >= z - tolerance);
      if (idx === -1) idx = topIndex;
      buckets[idx].nodeIds.push(id);
    });

    return buckets.map((b) => ({
      name: b.name,
      elevation: b.elevation,
      z: b.elevation,
      nodeIds: [...new Set(b.nodeIds)].sort((a, c) => a - c),
    }));
  },

  /**
   * CM REAL (con masas efectivas) de un diafragma, del último análisis, para
   * que la araña 2D se reubique como en ETABS. Devuelve {x, y} o null si no
   * hay resultados frescos (→ el renderer usa el centroide geométrico).
   * Empareja por nombre + elevación contra la tabla Centers of Mass and
   * Rigidity que devuelve el motor.
   */
  getDiaphragmCMForDraw(name, z) {
    if (this.analysisOptions?.analysisStatus === "outdated") return null;
    const rows =
      this.seismicResults?.tables?.centers_of_mass_rigidity ||
      this.seismicResults?.etabs_results?.tables?.centers_of_mass_rigidity ||
      [];
    if (!rows.length) return null;

    const target = rows.find(
      (r) =>
        Math.abs((Number(r.z_m) || 0) - (Number(z) || 0)) <= 0.05 &&
        (!name || String(r.diaphragm) === String(name)),
    ) || rows.find((r) => Math.abs((Number(r.z_m) || 0) - (Number(z) || 0)) <= 0.05);

    if (!target) return null;
    const x = Number(target.xcm_m);
    const y = Number(target.ycm_m);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  },

  _buildSeismicDiaphragms(cfg, nodes) {
    const useRigidDiaphragms = cfg?.useRigidDiaphragms ?? true;

    if (!useRigidDiaphragms) return [];

    // Asignaciones explícitas (joint directo + áreas) mandan siempre.
    const explicit = this.getExplicitDiaphragmGroups(nodes);

    if (explicit.length) {
      return explicit;
    }

    // SIN ninguna asignación explícita NO se inventan diafragmas. ETABS
    // tampoco lo hace: un modelo sin `DIAPH` asignado corre con las losas
    // dando la rigidez en el plano, no con un plano rígido por elevación.
    //
    // Medido con MODULO 6 (144 nudos, 10 muros, CERO losas, y su .e2k sin
    // ninguna asignación de diafragma), contra ETABS del mismo archivo:
    //             app con auto      app sin        ETABS
    //   modos     6                 15             15
    //   1er modo  0.1580 UX 4.7%    0.4129         0.272 UX 12.3%
    //   modo Y    0.0322 UY 89%     0.0824 UY 43%  0.080 UY 41.5%
    //   SumUY     100% en 4 modos   45% al 11      43% al 15
    // El agrupado automático metía 8 diafragmas rígidos (uno por cada cota de
    // la armadura) que dejaban el modo Y −60% y concentraban el 89% de la masa
    // donde ETABS reparte 41%. Sin ellos, ese modo calza a +3%.
    //
    // A los modelos CON losas no les cambia nada: MODULO 1 y MODULO 5 traen
    // grupos explícitos (`D1@…`) y ni siquiera llegan acá; y aun forzando el
    // caso, MODULO 1 se mueve <3% (0.4363→0.4387 en T1) porque sus 141 losas
    // malladas ya rigidizan el plano.
    //
    // Para recuperar el comportamiento anterior (útil en un modelo dibujado a
    // mano donde no se asignó nada y se espera piso rígido):
    //   cadSystem.seismicConfig.autoDiaphragms = true
    const autoDiaphragms = cfg?.autoDiaphragms ?? this.seismicConfig?.autoDiaphragms ?? false;

    if (!autoDiaphragms) return [];

    return this._buildAutoDiaphragmsByStoryZ(nodes);
  },

  // ─── Mass Source para análisis sísmico ─────────────────────────────
  _getDefaultSeismicMassSource() {
    if (typeof this.getDefaultMassSourceDefinition === "function") {
      return this.getDefaultMassSourceDefinition();
    }

    return {
      enabled: true,
      name: "MASS_SOURCE_1",
      includeSelfWeight: true,
      selfWeightMultiplier: 1.0,
      loadPatterns: [],
      convertWeightToMass: true,
      gravity: 9.81,
      distributeToDiaphragms: true,
      // OFF por defecto (opt-in): lumpear la masa al nivel del piso (ETABS
      // LUMPATSTORIES "Yes", motor: inputs.py _lump_mass_to_story_levels) es
      // un NO-OP en pisos planos normales (todo nodo ya está en su nivel),
      // pero en techos de armadura/inclinados concentra TODA la masa en los
      // pocos nudos que coinciden exactamente con la elevación del piso
      // (p.ej. solo la cumbrera). Validado (2026-07-31) con el payload real
      // de MODULO 5: T1 pasó de 0.243 (sin lumping, -32% vs ETABS 0.358) a
      // 0.474 (con lumping, +32% vs ETABS) — SOBRE-corrige en la dirección
      // opuesta, no lo arregla. Causa probable: un diafragma rígido solo
      // amarra los GDL en el plano (UX/UY/RZ), no el balanceo fuera del
      // plano (RX/RY) que gobierna este modo — concentrar TODA la masa en 2
      // nudos infla artificialmente esa inercia rotacional. Se deja como
      // opción (activable por modelo) hasta calibrar una regla mejor, no
      // como comportamiento por defecto.
      distributeToStoryNodes: false,
    };
  },

  _cloneForSeismicPayload(value, fallback = null) {
    try {
      return JSON.parse(JSON.stringify(value ?? fallback));
    } catch (error) {
      console.warn("No se pudo clonar dato para payload sísmico:", value, error);
      return fallback;
    }
  },

  _normalizeSeismicMassSource(rawMassSource = null) {
    const defaults = this._getDefaultSeismicMassSource();
    const raw = rawMassSource || this.massSource || defaults;

    const loadPatterns = Array.isArray(raw.loadPatterns)
      ? raw.loadPatterns
        .map((item) => ({
          name: String(item.name || item.id || item.loadCase || "").trim(),
          type: item.type || item.loadType || "Other",
          factor: Number(item.factor ?? item.multiplier ?? 0),
        }))
        .filter((item) => item.name && Number.isFinite(item.factor))
      : [];

    const gravity = Number(raw.gravity ?? raw.g ?? defaults.gravity ?? 9.81);

    return {
      ...defaults,
      ...this._cloneForSeismicPayload(raw, {}),

      enabled: raw.enabled !== false,

      name: raw.name || defaults.name || "MASS_SOURCE_1",

      includeSelfWeight: raw.includeSelfWeight !== false,
      selfWeightMultiplier: Number(raw.selfWeightMultiplier ?? raw.selfWeightFactor ?? 1.0),

      loadPatterns,

      convertWeightToMass: raw.convertWeightToMass !== false,
      gravity: Number.isFinite(gravity) && gravity > 0 ? gravity : 9.81,

      distributeToDiaphragms: raw.distributeToDiaphragms !== false,
      // Prioridad: elección explícita del usuario > flag LUMPATSTORIES del
      // .e2k importado (lumpLateralMassAtStoryLevels, lo guarda e2k-import) >
      // default OFF. Honrar el flag de ETABS es CLAVE en techos de armadura:
      // con la masa lumpeada al nivel de piso (como ETABS) y las diagonales
      // rígidas (sin modificador), la estructura modal completa calza con
      // ETABS (T1≈0.35 y modos locales SIN masa); sin lumpear, la masa
      // repartida en los nudos de la armadura crea modos locales con masa
      // que ETABS no tiene. Ver project_modulo5_period_calibration.
      distributeToStoryNodes:
        raw.distributeToStoryNodes ??
        raw.lumpLateralMassAtStoryLevels ??
        defaults.distributeToStoryNodes,
    };
  },

  _buildSeismicMassSourceForPayload() {
    const massSource = this._normalizeSeismicMassSource(this.massSource);

    // ── Peso propio estilo ETABS: lo controla el "Multiplicador de Peso Propio"
    // de los Load Patterns (Define ▸ Load Patterns, modal static-load-cases), NO
    // un check aparte. El motor recibe un multiplicador EFECTIVO de peso propio =
    // Σ (factor del Mass Source × SWM del patrón). Así el Mass Source solo SUMA
    // cargas (como ETABS INCLUDEELEMENTS "No") y el peso propio entra por CM
    // (SWM=1), sin doble conteo.
    // El store real de los Load Patterns es `staticLoadCases.items` (cada item con
    // `selfWeightMultiplier`); fallback al legacy `loadCases.cases` (check+value).
    // Solo se sobrescribe cuando al menos un patrón del Mass Source COINCIDE por
    // nombre con un Load Pattern (evita romper modelos con stores inconsistentes).
    const items =
      (Array.isArray(this.staticLoadCases?.items) && this.staticLoadCases.items.length
        ? this.staticLoadCases.items
        : (Array.isArray(this.loadCases?.cases) ? this.loadCases.cases : []));
    const msPatterns = massSource.loadPatterns || massSource.loadMultipliers || [];
    if (items.length && msPatterns.length) {
      const swmOf = (c) => {
        if (!c) return 0;
        if (c.selfWeightMultiplier !== undefined) return Number(c.selfWeightMultiplier) || 0;
        if (c.selfWeight !== undefined) return c.selfWeight ? (Number(c.value ?? 1) || 0) : 0;
        return 0;
      };
      let eff = 0;
      let matched = false;
      msPatterns.forEach((p) => {
        const name = String(p.name || p.load || "").trim();
        const item = items.find((x) => String(x.name).trim() === name);
        if (item) {
          matched = true;
          eff += (Number(p.factor ?? p.multiplier ?? 0) || 0) * swmOf(item);
        }
      });
      if (matched) {
        massSource.selfWeightMultiplier = eff;
        massSource.includeSelfWeight = eff > 0;
        massSource.elementSelfMass = eff > 0;
      }
    }

    // Guardamos una copia normalizada en el sistema para depuración.
    this.massSource = this._cloneForSeismicPayload(massSource, massSource);

    return massSource;
  },

  // ============================================================
  // B10.2 — Propiedades físicas reales para elementos
  // ============================================================

  _getFrameMaterialNameForSeismic(frame) {
    return (
      frame?.material ||
      frame?.materialName ||
      frame?.material_name ||
      frame?.section?.material ||
      frame?.section?.materialName ||
      frame?.properties?.material ||
      "CONCRETE"
    );
  },

  _getFrameSectionNameForSeismic(frame) {
    return (
      frame?.section ||
      frame?.sectionName ||
      frame?.section_name ||
      frame?.profile ||
      frame?.properties?.section ||
      "DEFAULT_SECTION"
    );
  },

  _getMaterialDefinitionForSeismic(materialName) {
    const name = String(materialName || "").trim();

    const sources = [
      // Colección REAL de la app (diálogos Define > Materials y file-io
      // escriben aquí). Las demás son legacy/fallback: sin esta entrada el
      // lookup fallaba silencioso y el peso específico caía al default.
      this.materialProperties?.materials,
      this.materials,
      this.materialDefinitions,
      this.frameMaterials,
      this.structuralMaterials,
    ];

    for (const source of sources) {
      if (!source) continue;

      if (Array.isArray(source)) {
        const found = source.find((item) => {
          return String(item?.name || item?.id || "").trim() === name;
        });

        if (found) return found;
      }

      if (typeof source === "object") {
        if (source[name]) return source[name];

        const found = Object.values(source).find((item) => {
          return String(item?.name || item?.id || "").trim() === name;
        });

        if (found) return found;
      }
    }

    return null;
  },

  _getSectionDefinitionForSeismic(sectionName) {
    const name = String(sectionName || "").trim();

    // OJO con la forma de cada fuente. `this.frameSections` NO es el array de
    // secciones: es `{ open, sections: [...], selectedSection }` — el modal lo
    // guarda así (ver cad_sys.js) y es donde el import del .e2k deja todo. Sin
    // `this.frameSections?.sections` en esta lista, el lookup probaba
    // `frameSections["C30X40"]` y recorría `Object.values` (que devuelve
    // `[false, Array, null]`, ninguno con `.name`) y terminaba en `null`
    // SIEMPRE.
    //
    // Consecuencia medida en "Nueva estructura p1.e2k": los brazos rígidos de
    // TODAS las vigas salían 0.173205 m, que es √A/2 = √0.12/2 — el lado de un
    // cuadrado equivalente en área — en vez de la cara real de la columna
    // C30X40 (0.15 m o 0.20 m según la dirección de la viga). El análisis no se
    // veía afectado (el área y las inercias vienen pegadas al frame), pero la
    // LUZ LIBRE de reporte sí, y con ella el M3 en la cara del apoyo.
    const sources = [
      this.sections,
      this.frameSections?.sections,
      this.frameSections,
      this.sectionDefinitions?.sections,
      this.sectionDefinitions,
      this.structuralSections?.sections,
      this.structuralSections,
      this.propertyDefinitions?.sections,
    ];

    for (const source of sources) {
      if (!source) continue;

      if (Array.isArray(source)) {
        const found = source.find((item) => {
          return String(item?.name || item?.id || "").trim() === name;
        });

        if (found) return found;
      }

      if (typeof source === "object") {
        if (source[name]) return source[name];

        const found = Object.values(source).find((item) => {
          return String(item?.name || item?.id || "").trim() === name;
        });

        if (found) return found;
      }
    }

    return null;
  },

  _numberForSeismic(value, fallback = null) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  },

  _getFrameUnitWeightForSeismic(frame) {
    const materialName = this._getFrameMaterialNameForSeismic(frame);
    const sectionName = this._getFrameSectionNameForSeismic(frame);

    const material = this._getMaterialDefinitionForSeismic(materialName);
    const section = this._getSectionDefinitionForSeismic(sectionName);

    const candidates = [
      frame?.unitWeight,
      frame?.unit_weight,
      frame?.unitWeightNPerM3,
      frame?.gamma,
      frame?.specificWeight,
      frame?.pesoEspecifico,
      frame?.materialUnitWeight,

      frame?.properties?.unitWeight,
      frame?.properties?.unit_weight,
      frame?.properties?.gamma,
      frame?.properties?.pesoEspecifico,

      section?.unitWeight,
      section?.unit_weight,
      section?.unitWeightNPerM3,
      section?.gamma,
      section?.specificWeight,
      section?.pesoEspecifico,
      section?.materialUnitWeight,

      material?.unitWeight,
      material?.unit_weight,
      material?.unitWeightNPerM3,
      material?.gamma,
      material?.specificWeight,
      material?.pesoEspecifico,
      material?.materialUnitWeight,
    ];

    for (const value of candidates) {
      const number = this._numberForSeismic(value, null);
      if (number !== null && number > 0) return number;
    }

    // Peso específico del diálogo de materiales, guardado en N/mm³ (~2.4e-5).
    // Sin esta lectura el payload caía SIEMPRE al default de abajo y editar
    // el peso del material NO afectaba la masa sísmica. Se convierte a N/m³.
    const wNmm3 =
      this._numberForSeismic(material?.weightPerUnitVolume, null) ??
      this._numberForSeismic(material?.weight, null);
    if (wNmm3 !== null && wNmm3 > 0 && wNmm3 < 1) return wNmm3 * 1e9;

    // Concreto armado aproximado: 24 kN/m³
    return 24000;
  },

  _buildFramePhysicalMetadataForSeismic(frame) {
    const materialName = this._getFrameMaterialNameForSeismic(frame);
    const sectionName = this._getFrameSectionNameForSeismic(frame);
    const material = this._getMaterialDefinitionForSeismic(materialName);
    const section = this._getSectionDefinitionForSeismic(sectionName);
    const unitWeight = this._getFrameUnitWeightForSeismic(frame);

    return {
      materialName,
      sectionName,
      unitWeight,
      unit_weight: unitWeight,
      unitWeightNPerM3: unitWeight,

      // Tipo de material (Steel / Concrete / ...) — el import lo guarda en
      // materialProperties.materials[].designType. El motor lo necesita para
      // tratar un techo METÁLICO como solo masa (ver steelRoofMassOnly en
      // inputs.py); antes solo viajaba el nombre y el peso específico, así que
      // no había forma de distinguir acero de concreto del lado del motor.
      designType: material?.designType || material?.type || null,

      material: {
        name: materialName,
        designType: material?.designType || material?.type || null,
        unitWeight,
        unit_weight: unitWeight,
        unitWeightNPerM3: unitWeight,
        E: this._numberForSeismic(material?.E ?? material?.young ?? material?.elasticModulus, null),
        G: this._numberForSeismic(material?.G ?? material?.shear ?? material?.shearModulus, null),
      },

      section: {
        name: sectionName,
        unitWeight,
        unit_weight: unitWeight,
        unitWeightNPerM3: unitWeight,
        A: this._numberForSeismic(section?.A ?? section?.area ?? section?.sectionArea, null),
        area: this._numberForSeismic(section?.area ?? section?.A ?? section?.sectionArea, null),
        Iy: this._numberForSeismic(section?.Iy ?? section?.I22 ?? section?.inertiaY, null),
        Iz: this._numberForSeismic(section?.Iz ?? section?.I33 ?? section?.inertiaZ, null),
        J: this._numberForSeismic(section?.J ?? section?.torsion ?? section?.torsionalConstant, null),
      },
    };
  },

  // ============================================================
  // B10.4 — Load Patterns reales para payload sísmico
  // ============================================================

  _normalizeLoadPatternNameForSeismic(value, fallback = "DEAD") {
    const text = String(value || "").trim();

    if (!text || text.toUpperCase() === "UNKNOWN" || text.toUpperCase() === "UNDEFINED") {
      return fallback;
    }

    return text;
  },

  _getLoadPatternTypeForSeismic(patternName = "DEAD") {
    const name = String(patternName || "").trim().toUpperCase();

    if (
      name.includes("DEAD") ||
      name === "D" ||
      name === "CM" ||
      name.includes("CARGA MUERTA") ||
      name.includes("MUERTA")
    ) {
      return "Dead";
    }

    // Techo/azotea antes que "viva" genérica: "CVT" (Carga Viva de Techo) y
    // variantes con "TECHO" contienen "VIVA" y calzarían con el chequeo de
    // Live de abajo si se evaluara después — el motor filtra Live vs
    // RoofLive por separado (run_static_analysis_by_type), así que una CVT
    // mal clasificada como "Other" queda fuera de AMBOS filtros y su carga
    // desaparece silenciosamente de Pv en el cálculo de cimentación.
    if (name === "CVT" || name.includes("ROOF") || name.includes("TECHO")) {
      return "RoofLive";
    }

    if (
      name.includes("LIVE") ||
      name === "L" ||
      name === "CV" ||
      name === "CVE" ||
      name.includes("CARGA VIVA") ||
      name.includes("VIVA")
    ) {
      return "Live";
    }

    if (name.includes("SX") || name.includes("SDX") || name.includes("SPEC_X")) {
      return "Quake";
    }

    if (name.includes("SY") || name.includes("SDY") || name.includes("SPEC_Y")) {
      return "Quake";
    }

    return "Other";
  },

  _getDefaultGravityLoadPatternForSeismic() {
    const sources = [
      this.loadPatterns,
      this.loadPatternDefinitions,
      this.loadCases?.patterns,
      this.loadCases?.cases,
      this.staticLoadCases?.items,
      this.availableLoads,
    ];

    for (const source of sources) {
      if (!source) continue;

      const items = Array.isArray(source) ? source : Object.values(source);

      const dead = items.find((item) => {
        const name = String(item?.name || item?.id || item?.loadCase || "").toUpperCase();
        const type = String(item?.type || item?.loadType || "").toUpperCase();

        return (
          name.includes("DEAD") ||
          name === "D" ||
          name === "CM" ||
          type.includes("DEAD")
        );
      });

      if (dead) {
        return String(dead.name || dead.id || dead.loadCase || "DEAD");
      }
    }

    return "DEAD";
  },

  _normalizePointLoadForSeismic(rawLoad = {}, node = null, index = 0) {
    const fallbackPattern = this._getDefaultGravityLoadPatternForSeismic();

    const patternName = this._normalizeLoadPatternNameForSeismic(
      rawLoad.loadCase ||
      rawLoad.load_case ||
      rawLoad.case ||
      rawLoad.pattern ||
      rawLoad.loadPattern ||
      rawLoad.load_pattern ||
      rawLoad.name ||
      rawLoad.loadName ||
      rawLoad.typeName,
      fallbackPattern
    );

    const rawAssignmentType = String(
      rawLoad.assignmentType ||
      rawLoad.assignment_type ||
      rawLoad.kind ||
      rawLoad.type ||
      rawLoad.loadType ||
      rawLoad.load_type ||
      "force"
    ).trim();

    const patternType = this._getLoadPatternTypeForSeismic(patternName);

    const nodeId = Number(
      rawLoad.node ||
      rawLoad.nodeId ||
      rawLoad.node_id ||
      rawLoad.joint ||
      rawLoad.jointId ||
      rawLoad.joint_id ||
      rawLoad.targetNode ||
      rawLoad.target_node ||
      node?.id
    );

    const forceObj = rawLoad.forces || rawLoad.force || rawLoad.values || {};

    const fx = Number(
      rawLoad.fx ??
      rawLoad.FX ??
      rawLoad.x ??
      rawLoad.Px ??
      rawLoad.px ??
      rawLoad.forceX ??
      rawLoad.force_x ??
      forceObj.fx ??
      forceObj.FX ??
      forceObj.x ??
      forceObj.Px ??
      0
    );

    const fy = Number(
      rawLoad.fy ??
      rawLoad.FY ??
      rawLoad.y ??
      rawLoad.Py ??
      rawLoad.py ??
      rawLoad.forceY ??
      rawLoad.force_y ??
      forceObj.fy ??
      forceObj.FY ??
      forceObj.y ??
      forceObj.Py ??
      0
    );

    const fz = Number(
      rawLoad.fz ??
      rawLoad.FZ ??
      rawLoad.z ??
      rawLoad.Pz ??
      rawLoad.pz ??
      rawLoad.p ??
      rawLoad.P ??
      rawLoad.forceZ ??
      rawLoad.force_z ??
      rawLoad.vertical ??
      rawLoad.gravity ??
      forceObj.fz ??
      forceObj.FZ ??
      forceObj.z ??
      forceObj.Pz ??
      0
    );

    const mx = Number(
      rawLoad.mx ??
      rawLoad.MX ??
      rawLoad.momentX ??
      rawLoad.moment_x ??
      forceObj.mx ??
      forceObj.MX ??
      0
    );

    const my = Number(
      rawLoad.my ??
      rawLoad.MY ??
      rawLoad.momentY ??
      rawLoad.moment_y ??
      forceObj.my ??
      forceObj.MY ??
      0
    );

    const mz = Number(
      rawLoad.mz ??
      rawLoad.MZ ??
      rawLoad.momentZ ??
      rawLoad.moment_z ??
      forceObj.mz ??
      forceObj.MZ ??
      0
    );

    // Conversión de unidades → SI (N, N·m) para el motor. Las cargas nodales
    // (joint forces) se guardan en la unidad de display declarada (p.ej. tonf);
    // el payload y el backend trabajan en Newtons (masa = abs(fz)·factor / g).
    // Si la carga no declara unidad, se asume ya en SI y no se convierte.
    const FORCE_TO_N = { tonf: 9806.65, tf: 9806.65, ton: 9806.65, kgf: 9.80665, kg: 9.80665, n: 1, newton: 1 };
    const declaredForceUnit = String(rawLoad.units?.force || rawLoad.forceUnit || "").toLowerCase().trim();
    const fFactor = FORCE_TO_N[declaredForceUnit] || 1;

    const fxSI = (Number.isFinite(fx) ? fx : 0) * fFactor;
    const fySI = (Number.isFinite(fy) ? fy : 0) * fFactor;
    const fzSI = (Number.isFinite(fz) ? fz : 0) * fFactor;
    const mxSI = (Number.isFinite(mx) ? mx : 0) * fFactor; // tonf-m → N·m (longitud en m)
    const mySI = (Number.isFinite(my) ? my : 0) * fFactor;
    const mzSI = (Number.isFinite(mz) ? mz : 0) * fFactor;

    return {
      id: rawLoad.id || `LOAD_${nodeId || "N"}_${index + 1}`,

      node: nodeId,
      nodeId,

      fx: fxSI,
      fy: fySI,
      fz: fzSI,

      mx: mxSI,
      my: mySI,
      mz: mzSI,

      // Unidad original conservada por trazabilidad.
      sourceForceUnit: declaredForceUnit || "SI",

      loadCase: patternName,
      load_case: patternName,
      pattern: patternName,
      loadPattern: patternName,
      name: patternName,

      type: patternType,
      loadType: patternType,
      patternType,

      assignmentType: rawAssignmentType,
      loadAssignmentType: rawAssignmentType,

      source: rawLoad.source || "node_load",
    };
  },

  // Convierte las cargas de área (kgf/m²) de las losas en fuerzas nodales (fz, N),
  // repartiendo cada panel a sus nodos de esquina (¼ c/u). Cuando los paneles
  // cubren el piso, esto da automáticamente el reparto por área tributaria.
  // El motor luego las vuelve masa vía la Fuente de Masa (factor del patrón).
  _buildSeismicAreaLoadsForPayload(areas = []) {
    const g = 9.81;
    const out = [];
    // Explícito por areaType — antes filtraba cualquier área con >=3 puntos y
    // los muros quedaban afuera solo por accidente (su proyección en planta
    // XY da área ~0, ver _planArea). Los muros van por su propio camino:
    // _buildSeismicWallsForPayload (shell elements), no por acá.
    const slabs = (areas || []).filter(
      (a) => (a.areaType || a.type || "slab") === "slab" && Array.isArray(a?.points) && a.points.length >= 3,
    );
    for (const slab of slabs) {
      const areaLoads = Array.isArray(slab.areaLoads)
        ? slab.areaLoads
        : Array.isArray(slab.loads)
          ? slab.loads
          : [];
      const uniform = areaLoads.filter(
        (l) => l && (l.type === "uniform" || l.type == null) && Number(l.value) > 0,
      ).map((l) => ({ value: Number(l.value), loadCase: l.loadCase || "CM" }));

      // Peso propio de la losa (de su Slab Section) → carga muerta CM automática.
      const sw = Number(slab.slabSelfWeightKgM2) || 0;
      if (sw > 0) uniform.push({ value: sw, loadCase: "CM" });

      if (!uniform.length) continue;

      const planArea = this._planArea(slab.points);
      if (!(planArea > 0)) continue;

      // Nodos del modelo que coinciden con las esquinas del panel.
      const cornerIds = [];
      for (const p of slab.points) {
        const match = (this.nodes || []).find((n) => {
          const nx = Number(n.position?.x ?? n.x) || 0;
          const ny = Number(n.position?.y ?? n.y) || 0;
          const nz = Number(n.position?.z ?? n.z) || 0;
          return (
            Math.abs(nx - (Number(p.x) || 0)) < 1e-3 &&
            Math.abs(ny - (Number(p.y) || 0)) < 1e-3 &&
            Math.abs(nz - (Number(p.z) || 0)) < 1e-3
          );
        });
        if (match) cornerIds.push(Number(match.id));
      }
      if (!cornerIds.length) continue;

      for (const l of uniform) {
        const totalN = Number(l.value) * g * planArea; // peso total del panel [N]
        const perNode = totalN / cornerIds.length;
        const loadCase = l.loadCase || "CM";
        // run_static_analysis_by_type (Python) filtra por type/loadType, no
        // por loadCase — mismo problema que tenía el peso propio de frames
        // (ver _buildSeismicFrameSelfWeightForPayload). Sin esto, cualquier
        // carga de losa (incluida su propio peso propio) quedaba fuera de
        // static_dead/static_live.
        const patternType = this._getLoadPatternTypeForSeismic(loadCase);
        for (const nid of cornerIds) {
          out.push({
            node: nid,
            fx: 0,
            fy: 0,
            fz: -perNode, // gravitatoria (−Z); el motor usa abs()
            loadCase,
            type: patternType,
            loadType: patternType,
            source: "area_load",
            // Id del panel: el motor lo usa para DESCARTAR esta carga nodal en
            // el análisis de diagramas cuando ese mismo panel ya viaja como
            // carga de tramo sobre sus vigas (memberLoads, source
            // "slab_to_beam"). Sin esto la losa se contaría dos veces. El
            // resto del pipeline —masa incluida— la sigue usando igual.
            slabId: slab.id ?? null,
          });
        }
      }
    }
    return out;
  },

  /**
   * Reparto de la carga de LOSA a las VIGAS del contorno — el "Area Load to
   * Frame" de ETABS.
   *
   * POR QUÉ EXISTE: `_buildSeismicAreaLoadsForPayload` manda la carga de área
   * ¼ a cada esquina del panel. Las esquinas suelen ser nudos de columna, así
   * que la carga se va derecho a los apoyos SIN pasar por las vigas: toda viga
   * salía con el momento de su peso propio y poco más. En un modelo real eso
   * es casi toda la carga de gravedad (MODELO (2)1.e2k: 0 LINELOAD contra 36
   * AREALOAD).
   *
   * En ETABS una losa `Membrane` no tiene rigidez a flexión — existe SOLO para
   * entregarle su carga a las vigas que la sostienen.
   *
   * CRITERIO (según el .e2k):
   *  - `oneWayLoadDist` (aligerado): la carga salva en la dirección
   *    `loadDistAngle` y aterriza en las vigas PERPENDICULARES a ella (son las
   *    que hacen de apoyo en los dos extremos de la luz). Reparto uniforme
   *    entre ellas, proporcional a su longitud.
   *  - dos sentidos: reparto entre las cuatro del contorno por área tributaria
   *    de la regla de 45°, aplicado como carga uniforme equivalente.
   *
   * En los dos casos se CONSERVA la carga total del panel (Σ w·L = q·A), que
   * es la propiedad que hace que las reacciones sigan cerrando. Para el caso
   * bidireccional, ETABS aplica el trapecio/triángulo real y acá va su
   * uniforme equivalente: el cortante y la reacción calzan, el momento de vano
   * queda levemente distinto. El caso de una vía —el de un aligerado— es
   * EXACTO, porque ahí la carga sobre la viga sí es uniforme.
   *
   * Va por `memberLoads`, así que solo lo consume el módulo de diagramas: el
   * camino nodal del que sale la MASA sísmica queda intacto (etapa 2).
   */
  _buildSeismicSlabToBeamLoadsForPayload(areas = [], frames = []) {
    const g = 9.81;
    const TOL = 0.02; // m — holgura para decir "este nudo está sobre el borde"

    const slabs = (areas || []).filter(
      (a) =>
        (a.areaType || a.type || "slab") === "slab" &&
        Array.isArray(a?.points) &&
        a.points.length >= 3,
    );

    if (!slabs.length) return [];

    // Vigas horizontales candidatas, con su geometría ya resuelta.
    const beams = [];
    (frames || []).forEach((f) => {
      const id = Number(f?.id ?? f?.frameId);
      if (!Number.isFinite(id)) return;

      const a = this._massNodeCoord(this._resolveMassNode(f.node1));
      const b = this._massNodeCoord(this._resolveMassNode(f.node2));
      if (!a || !b) return;

      const dz = Math.abs(b.z - a.z);
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (!(len > 1e-6) || dz > 1e-3) return; // solo vigas horizontales

      beams.push({ id, a, b, len, ux: (b.x - a.x) / len, uy: (b.y - a.y) / len });
    });

    if (!beams.length) return [];

    // ¿El punto p cae sobre algún lado del polígono?
    const onBoundary = (poly, p) => {
      for (let i = 0; i < poly.length; i += 1) {
        const q1 = poly[i];
        const q2 = poly[(i + 1) % poly.length];
        const vx = q2.x - q1.x;
        const vy = q2.y - q1.y;
        const L2 = vx * vx + vy * vy;
        if (L2 < 1e-12) continue;
        let t = ((p.x - q1.x) * vx + (p.y - q1.y) * vy) / L2;
        t = Math.min(Math.max(t, 0), 1);
        const dx = p.x - (q1.x + t * vx);
        const dy = p.y - (q1.y + t * vy);
        if (Math.hypot(dx, dy) <= TOL) return true;
      }
      return false;
    };

    const out = [];

    for (const slab of slabs) {
      const poly = slab.points.map((p) => ({
        x: Number(p.x) || 0,
        y: Number(p.y) || 0,
      }));
      const planArea = this._planArea(slab.points);
      if (!(planArea > 0)) continue;

      const zs = slab.points.map((p) => Number(p.z) || 0);
      const zSlab = zs.reduce((s, v) => s + v, 0) / zs.length;

      // Cargas del panel: las asignadas + su peso propio (mismo criterio que
      // el camino nodal, para que las dos rutas hablen de la misma carga).
      const areaLoads = Array.isArray(slab.areaLoads)
        ? slab.areaLoads
        : Array.isArray(slab.loads)
          ? slab.loads
          : [];
      const uniform = areaLoads
        .filter((l) => l && (l.type === "uniform" || l.type == null) && Number(l.value) > 0)
        .map((l) => ({ value: Number(l.value), loadCase: l.loadCase || "CM" }));

      const sw = Number(slab.slabSelfWeightKgM2) || 0;
      if (sw > 0) uniform.push({ value: sw, loadCase: "CM" });
      if (!uniform.length) continue;

      // Vigas del contorno: horizontales, a la cota del panel, con sus dos
      // extremos Y su punto medio sobre el perímetro (el punto medio descarta
      // una viga que cruce el panel de lado a lado como cuerda).
      const boundary = beams.filter((bm) => {
        if (Math.abs(bm.a.z - zSlab) > 0.05) return false;
        const mid = { x: (bm.a.x + bm.b.x) / 2, y: (bm.a.y + bm.b.y) / 2 };
        return onBoundary(poly, bm.a) && onBoundary(poly, bm.b) && onBoundary(poly, mid);
      });

      if (!boundary.length) continue;

      // ── A qué vigas les toca ────────────────────────────────────────────
      let receiving = boundary;

      if (slab.oneWayLoadDist === true) {
        const ang = ((Number(slab.loadDistAngle) || 0) * Math.PI) / 180;
        const dx = Math.cos(ang);
        const dy = Math.sin(ang);
        // La carga salva en (dx,dy) y se apoya en las vigas perpendiculares a
        // esa dirección. |u · d| < 0.34 ≈ más de 70° respecto de la luz.
        const perp = boundary.filter((bm) => Math.abs(bm.ux * dx + bm.uy * dy) < 0.34);
        // Si el ángulo no deja ninguna viga (panel girado, geometría rara),
        // mejor repartir entre todas que perder la carga en silencio.
        if (perp.length) receiving = perp;
      }

      const totalLen = receiving.reduce((s, bm) => s + bm.len, 0);
      if (!(totalLen > 0)) continue;

      for (const l of uniform) {
        const q = Number(l.value) * g;      // kgf/m² → N/m²
        const totalN = q * planArea;        // carga total del panel [N]
        const w = totalN / totalLen;        // N/m, igual en todas las receptoras
        const loadCase = l.loadCase || "CM";
        const patternType = this._getLoadPatternTypeForSeismic(loadCase);

        for (const bm of receiving) {
          out.push({
            element: bm.id,
            kind: "uniform",
            wx: 0,
            wy: 0,
            wz: -w,                          // gravitatoria (−Z global)
            loadCase,
            load_case: loadCase,
            pattern: loadCase,
            type: patternType,
            loadType: patternType,
            source: "slab_to_beam",
            slabId: slab.id ?? null,
          });
        }
      }
    }

    return out;
  },

  // Panel de muro → payload `walls[]` para el motor (shell elements). No pasa
  // por acá la masa/rigidez del frame — el backend malla cada muro con
  // ShellMITC4 y calcula su propia masa (área × espesor × peso unitario) y
  // rigidez (E, G, poissonRatio, espesor). Un muro SIN sección asignada
  // (wall.section == null) se omite: mismo criterio que una losa sin sección
  // no aporta peso propio.
  _buildSeismicWallsForPayload(areas = []) {
    const walls = (areas || []).filter(
      (a) => (a.areaType || a.type) === "wall" &&
        a.section &&
        Array.isArray(a.points) &&
        a.points.length === 4,
    );

    return walls
      .map((wall) => {
        const material = this._resolveWallMaterial(wall.section?.material);
        const thickness = (Number(wall.section?.thickness) || 0) / 1000; // mm → m

        return {
          id: Number(wall.id),
          corners: wall.points.map((p) => ({
            x: Number(p.x) || 0,
            y: Number(p.y) || 0,
            z: Number(p.z) || 0,
          })),
          thickness,
          material,
        };
      })
      .filter((w) => w.thickness > 0);
  },

  // Peso propio del muro (área real del panel × espesor × peso unitario) →
  // carga muerta CM, repartida ¼ a cada esquina — mismo criterio que
  // _buildSeismicAreaLoadsForPayload para losas.
  //
  // POR QUÉ EXISTE: `_buildSeismicWallsForPayload` solo manda geometría; el
  // backend malla el muro como shell y le calcula MASA (ops.mass, para modal)
  // pero NUNCA una fuerza de gravedad estática — ni run_frame_force_results
  // (diagramas/tabla "Frame Forces") ni run_static_analysis_by_type
  // (reacciones para zapatas) leen otra cosa que `data.loads`. Sin esto, toda
  // columna con un muro contiguo salía con P por debajo de ETABS en cualquier
  // combo de gravedad (déficit ~30% en C23, ver [[project_gravity_load_deficit]]).
  _buildSeismicWallSelfWeightLoadsForPayload(areas = []) {
    const out = [];
    const walls = (areas || []).filter(
      (a) =>
        (a.areaType || a.type) === "wall" &&
        a.section &&
        Array.isArray(a.points) &&
        a.points.length >= 3,
    );

    for (const wall of walls) {
      const material = this._resolveWallMaterial(wall.section?.material);
      const thickness = (Number(wall.section?.thickness) || 0) / 1000; // mm → m
      if (!(thickness > 0)) continue;
      const unitWeightNPerM3 = Number(material?.unitWeightNPerM3) || 24000;

      // Área REAL del panel (triangulación 3D, no la proyección en planta:
      // un muro es vertical, su proyección XY da ~0).
      const pts = wall.points;
      let area = 0;
      for (let i = 1; i < pts.length - 1; i += 1) {
        const a = pts[0], b = pts[i], c = pts[i + 1];
        const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
        const acx = c.x - a.x, acy = c.y - a.y, acz = c.z - a.z;
        const cx = aby * acz - abz * acy;
        const cy = abz * acx - abx * acz;
        const cz = abx * acy - aby * acx;
        area += 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
      }
      if (!(area > 0)) continue;

      const totalN = unitWeightNPerM3 * thickness * area; // peso total del panel [N]

      const cornerIds = [];
      for (const p of pts) {
        const match = (this.nodes || []).find((n) => {
          const nx = Number(n.position?.x ?? n.x) || 0;
          const ny = Number(n.position?.y ?? n.y) || 0;
          const nz = Number(n.position?.z ?? n.z) || 0;
          return (
            Math.abs(nx - (Number(p.x) || 0)) < 1e-3 &&
            Math.abs(ny - (Number(p.y) || 0)) < 1e-3 &&
            Math.abs(nz - (Number(p.z) || 0)) < 1e-3
          );
        });
        if (match) cornerIds.push(Number(match.id));
      }
      if (!cornerIds.length) continue;

      // Repartido solo entre los corners que SÍ calzaron con un nodo real
      // (no entre pts.length): si algún vértice del muro no matchea, el
      // peso no se diluye, se concentra en los que sí — mismo criterio que
      // _buildSeismicAreaLoadsForPayload.
      const perNode = totalN / cornerIds.length;

      const patternType = this._getLoadPatternTypeForSeismic("CM");
      for (const nid of cornerIds) {
        out.push({
          node: nid,
          fx: 0,
          fy: 0,
          fz: -perNode, // gravitatoria (−Z); el motor usa abs()
          loadCase: "CM",
          type: patternType,
          loadType: patternType,
          source: "wall_self_weight",
          wallId: wall.id ?? null,
        });
      }
    }
    return out;
  },

  // ─── Losas como shell (ShellMITC4) ────────────────────────────────────────

  // Una losa es INCLINADA (techo) si sus vértices no están todos a la misma
  // cota. 1 cm de tolerancia: muy por encima del ruido de coordenadas y muy
  // por debajo de cualquier pendiente real. Mismo criterio que
  // `_slab_is_sloped` en python-backend/seismic/inputs.py.
  _isSlopedAreaForSeismic(area) {
    const pts = Array.isArray(area?.points) ? area.points : [];
    if (pts.length < 3) return false;
    const zs = pts.map((p) => Number(p.z) || 0);
    return Math.max(...zs) - Math.min(...zs) > 0.01;
  },

  /**
   * Losas → payload `slabs[]` para que el motor las malle con ShellMITC4
   * (espejo de _buildSeismicWallsForPayload).
   *
   * `meshAsShell` se decide ACÁ (fuente de verdad única; el motor solo respeta
   * lo que llega). DEFAULT `"all"`: se mallan TODAS, igual que ETABS, que
   * mallea cada área del modelo.
   *
   * Antes el default era `"sloped"` (solo las inclinadas), para no meterle
   * flexión de placa a las losas de piso que ya viven en un diafragma rígido.
   * Se cambió con datos de MODULO 1 (2026-08-03): las losas planas son las que
   * conectan al pórtico partes de la estructura que las vigas no conectan —
   * ahí había una fila de 5 vigas en y=0 SIN ninguna columna ni apoyo, unida
   * al resto solo por las losas. Sin mallarlas, esa fila quedaba flotando: dos
   * modos de cuerpo rígido (T=18.4 s y 2.63 s con masa 0) y el análisis
   * ESTÁTICO reventaba con `factorization failed / matrix singular`. Mallando
   * todas: los dos modos desaparecen, el estático converge y T1-T3 quedan
   * 0.368/0.303/0.279 vs 0.441/0.363/0.288 de ETABS.
   *
   * `modelingType` viaja para que el motor no le meta flexión de placa a una
   * losa que ETABS modela como MEMBRANA (ver _resolveSlabModelingTypeForSeismic).
   *
   * Una losa SIN sección asignada se omite, igual que un muro sin sección: sin
   * espesor ni material no hay shell que armar.
   */
  _buildSeismicSlabsForPayload(areas = [], mode = "all") {
    const slabs = (areas || []).filter(
      (a) =>
        (a.areaType || a.type || "slab") === "slab" &&
        a.section &&
        Array.isArray(a.points) &&
        a.points.length >= 3,
    );

    return slabs
      .map((slab) => {
        const material = this._resolveWallMaterial(slab.section?.material);
        const thickness = (Number(slab.section?.thickness) || 0) / 1000; // mm → m
        const sloped = this._isSlopedAreaForSeismic(slab);

        return {
          id: Number(slab.id),
          points: slab.points.map((p) => ({
            x: Number(p.x) || 0,
            y: Number(p.y) || 0,
            z: Number(p.z) || 0,
          })),
          thickness,
          material,
          sloped,
          modelingType: this._resolveSlabModelingTypeForSeismic(slab),
          meshAsShell: mode === "off" ? false : mode === "sloped" ? sloped : true,
        };
      })
      .filter((s) => s.thickness > 0);
  },

  /**
   * "Membrane" / "Shell-Thin" / "Shell-Thick" de la sección de la losa — el
   * `MODELINGTYPE` que trae el .e2k y que el modal de Slab Sections también
   * deja elegir. El dato vive en la DEFINICIÓN de la sección (this.slabSections),
   * no en la copia que se guarda en el área (`slab.section`, que solo lleva
   * name/thickness/material), así que se resuelve por nombre.
   *
   * Fallback deliberado a shell completo (no a membrana): una losa dibujada a
   * mano en el CAD, sin sección importada, sigue comportándose como hasta
   * ahora — importa sobre todo para un techo inclinado, que se sostiene
   * justamente por su flexión de placa.
   */
  _resolveSlabModelingTypeForSeismic(slab) {
    const name = slab?.section?.name || slab?.slabSection;
    if (!name) return "Shell";

    const sections = Array.isArray(this.slabSections) ? this.slabSections : [];
    const sec = sections.find((s) => String(s?.name) === String(name));
    const raw = String(sec?.modelingType || "").trim();

    if (!raw) return "Shell";
    return /membrane/i.test(raw) ? "Membrane" : "Shell";
  },

  /**
   * Nudos que NO deben entrar a ningún diafragma rígido: los de las LOSAS
   * INCLINADAS. Es la mitad "sin constraint" del semi-rígido de ETABS — la
   * losa inclinada aporta rigidez como shell real, no amarrando sus nudos a un
   * plano horizontal rígido (que es justo la deformación que un techo a dos
   * aguas no tiene).
   *
   * DOS EXCEPCIONES, ambas por la misma razón: el nudo pertenece al entrepiso,
   * no al faldón.
   *  1. Está cubierto por una losa PLANA (el piso sobre el que apoya el
   *     techo). Sin esto, un techo apoyado en el último piso desconectaría
   *     todo el perímetro de ese diafragma.
   *  2. Tiene una asignación EXPLÍCITA de diafragma — del .e2k
   *     (`POINTASSIGN ... DIAPH "D1"`) o hecha a mano en Assign ▸ Joint ▸
   *     Diaphragms. Un dato explícito le gana siempre a esta heurística:
   *     si ETABS dice que ese nudo está en D1, va en D1. En MODULO 5 son los
   *     4 aleros que bajan hasta la cota del piso 1 (nudos 33, 34, 51, 52).
   */
  _slopedSlabFreeNodeIdsForSeismic(nodes = [], tolerance = 1e-3) {
    const areas = Array.isArray(this.areas) ? this.areas : [];
    const sloped = areas.filter(
      (a) =>
        (a.areaType || a.type || "slab") === "slab" &&
        Array.isArray(a.points) &&
        a.points.length >= 3 &&
        this._isSlopedAreaForSeismic(a),
    );

    if (!sloped.length) return [];

    const key = (x, y, z) =>
      `${Math.round(x / tolerance)}|${Math.round(y / tolerance)}|${Math.round(z / tolerance)}`;

    const slopedVertexKeys = new Set();
    sloped.forEach((a) =>
      a.points.forEach((p) =>
        slopedVertexKeys.add(key(Number(p.x) || 0, Number(p.y) || 0, Number(p.z) || 0)),
      ),
    );

    // Losas PLANAS: sus nudos conservan el diafragma de su piso.
    const flat = areas.filter(
      (a) =>
        (a.areaType || a.type || "slab") === "slab" &&
        Array.isArray(a.points) &&
        a.points.length >= 3 &&
        !this._isSlopedAreaForSeismic(a),
    );

    const out = [];

    (nodes || []).forEach((node) => {
      const id = Number(node.id);
      if (!Number.isFinite(id)) return;

      const nx = Number(node.position?.x ?? node.x) || 0;
      const ny = Number(node.position?.y ?? node.y) || 0;
      const nz = this._getNodeZForSeismic(node);

      if (!slopedVertexKeys.has(key(nx, ny, nz))) return;

      // Asignación explícita (del .e2k o del diálogo) → manda sobre la
      // heurística. `diaphragmMode: "none"` es lo contrario: sí queda fuera.
      const mode = node.diaphragmMode || node.assignment?.diaphragmMode || null;
      if (mode !== "none" && this._getNodeDiaphragmIdForSeismic(node)) return;

      const onFlatSlab = flat.some((a) => {
        const az = Number(a.z ?? a.points[0]?.z) || 0;
        if (Math.abs(nz - az) > 0.05) return false;
        const poly = a.points.map((p) => [Number(p.x) || 0, Number(p.y) || 0]);
        return this._pointInPolygonInclusive(nx, ny, poly);
      });

      if (!onFlatSlab) out.push(id);
    });

    return [...new Set(out)].sort((a, b) => a - b);
  },

  // Peso propio de columnas/vigas → carga muerta CM automática (mismo criterio
  // que el peso propio de losa en _buildSeismicAreaLoadsForPayload, línea ~904).
  // _getFrameUnitWeightForSeismic() ya calcula el peso específico del frame,
  // pero antes de esto SOLO se usaba para la masa sísmica (modal/RSA) — nunca
  // se convertía en una fuerza estática. Sin esto, run_static_analysis (que
  // solo aplica lo que llega en data.loads) calculaba reacciones "CM"/"CVE"
  // sin el peso propio de la estructura, subestimando pd1/pl1 en "Calcular
  // zapatas" (verificado contra un caso real de ETABS: ~54% del peso muerto
  // faltaba en las reacciones de base).
  // √A de cada columna (lado equivalente en planta) por nudo extremo — mismo
  // criterio que _build_column_depth_map en python-backend/seismic/inputs.py.
  /**
   * Brazos rígidos de nudo (end length offsets) de cada VIGA, en metros.
   *
   * ETABS los deduce solos de la geometría del nudo y **reporta y diseña sobre
   * la LUZ LIBRE**: en MODELO (2)1 las estaciones de una viga de 7.0 m van de
   * 0.225 a 6.775, o sea medio ancho de la columna C45x45 en cada extremo.
   * Nuestro motor reportaba de 0 a L (eje a eje), y el momento en el EJE
   * siempre es mayor que en la CARA — con lo cual el acero superior salía más
   * conservador de lo que da ETABS.
   *
   * OJO: esto NO cambia la rigidez del modelo (ETABS con rigid-zone factor 0
   * tampoco la cambia); solo mueve DÓNDE se reporta el diagrama. Las fuerzas
   * son las mismas, evaluadas en otra estación.
   *
   * El offset de un extremo es la mitad de la huella de la columna MEDIDA A LO
   * LARGO DE LA VIGA. Para una columna cuadrada da medio lado, sea cual sea su
   * rotación; para una rectangular se proyecta su huella (peralte `h` sobre el
   * eje local X y ancho `b` sobre el Y a θ=0, girando con `localAxisAngle` —
   * mismo convenio que la huella que dibuja el renderer 2D).
   */
  _buildBeamEndOffsetsForSeismic(frames = []) {
    const toMeters = (v) => {
      const n = Number(v);
      if (!(n > 0)) return 0;
      return n <= 3 ? n : n / 100; // ≤3 ya está en m; si no, viene en cm
    };

    // Columnas que concurren a cada nudo, con su huella en planta.
    const colsByNode = new Map();

    (frames || []).forEach((f) => {
      const a = this._massNodeCoord(this._resolveMassNode(f.node1));
      const b = this._massNodeCoord(this._resolveMassNode(f.node2));
      const dz = Math.abs(b.z - a.z);
      const horiz = Math.hypot(b.x - a.x, b.y - a.y);
      if (dz <= 1e-6 || dz < horiz) return; // no es columna

      const sec = this._getSectionDefinitionForSeismic(
        this._getFrameSectionNameForSeismic(f),
      ) || {};

      let bw = toMeters(sec.b ?? sec.width);
      let hh = toMeters(sec.h ?? sec.height);

      if (!(bw > 0) || !(hh > 0)) {
        // Sin dimensiones: se cae al lado equivalente por área, que es exacto
        // para una columna cuadrada (el caso normal).
        const A = Number(sec.A ?? sec.area ?? f.A ?? f._A) || 0;
        if (!(A > 0)) return;
        bw = Math.sqrt(A);
        hh = bw;
      }

      const t = ((Number(f.localAxisAngle) || 0) * Math.PI) / 180;
      const entry = { hh, bw, cos: Math.cos(t), sin: Math.sin(t) };

      [
        Number(this._resolveMassNode(f.node1)?.id ?? f.node1),
        Number(this._resolveMassNode(f.node2)?.id ?? f.node2),
      ].forEach((nid) => {
        if (!Number.isFinite(nid)) return;
        if (!colsByNode.has(nid)) colsByNode.set(nid, []);
        colsByNode.get(nid).push(entry);
      });
    });

    // Medio ancho de la columna proyectado sobre la dirección de la viga.
    const halfExtent = (nid, ux, uy) => {
      const cols = colsByNode.get(nid);
      if (!cols?.length) return 0;

      return cols.reduce((best, c) => {
        // Ejes de la huella: local X = (cos, sin) lleva el peralte `hh`.
        const alongX = Math.abs(ux * c.cos + uy * c.sin);
        const alongY = Math.abs(-ux * c.sin + uy * c.cos);
        const half = (c.hh / 2) * alongX + (c.bw / 2) * alongY;
        return Math.max(best, half);
      }, 0);
    };

    const offsets = new Map();

    (frames || []).forEach((f) => {
      const id = Number(f?.id ?? f?.frameId);
      if (!Number.isFinite(id)) return;

      const a = this._massNodeCoord(this._resolveMassNode(f.node1));
      const b = this._massNodeCoord(this._resolveMassNode(f.node2));
      const dz = Math.abs(b.z - a.z);
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (!(len > 1e-6) || dz > 1e-3) return; // solo vigas horizontales

      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;

      const n1 = Number(this._resolveMassNode(f.node1)?.id ?? f.node1);
      const n2 = Number(this._resolveMassNode(f.node2)?.id ?? f.node2);

      let oi = halfExtent(n1, ux, uy);
      let oj = halfExtent(n2, ux, uy);

      // Nunca dejar la luz libre por debajo de la mitad de la luz de ejes:
      // una viga muy corta entre columnas anchas quedaría sin diagrama.
      const maxTotal = 0.5 * len;
      if (oi + oj > maxTotal) {
        const k = maxTotal / (oi + oj);
        oi *= k;
        oj *= k;
      }

      if (oi > 0 || oj > 0) offsets.set(id, { i: oi, j: oj });
    });

    return offsets;
  },

  _buildColumnDepthMapForSeismic(frames = []) {
    const depth = new Map();

    (frames || []).forEach((frame) => {
      const a = this._massNodeCoord(this._resolveMassNode(frame.node1));
      const b = this._massNodeCoord(this._resolveMassNode(frame.node2));
      const dz = Math.abs(b.z - a.z);
      const horiz = Math.hypot(b.x - a.x, b.y - a.y);
      if (dz <= 1e-6 || dz < horiz) return; // no es columna (predominantemente vertical)

      const sectionName = this._getFrameSectionNameForSeismic(frame);
      const section = this._getSectionDefinitionForSeismic(sectionName);
      const A = Number(section?.A ?? section?.area ?? section?.sectionArea ?? frame.A ?? frame._A) || 0;
      if (!(A > 0)) return;

      const side = Math.sqrt(A);
      const node1Id = Number(this._resolveMassNode(frame.node1)?.id ?? frame.node1);
      const node2Id = Number(this._resolveMassNode(frame.node2)?.id ?? frame.node2);

      [node1Id, node2Id].forEach((nid) => {
        if (!Number.isFinite(nid)) return;
        if (side > (depth.get(nid) || 0)) depth.set(nid, side);
      });
    });

    return depth;
  },

  /**
   * Peso propio de barras como carga de TRAMO (`memberLoads[]`), espejo de
   * _buildSeismicFrameSelfWeightForPayload (que sigue emitiendo el equivalente
   * nodal para masa y estático global).
   *
   * El peso TOTAL es el mismo que el del equivalente nodal — incluida la
   * deducción de longitud libre en vigas — pero repartido uniformemente sobre
   * la longitud del elemento: w = totalN / L_centerline. Así el peso propio
   * flecta la viga (ETABS) sin cambiar la carga total que ya está calibrada.
   */
  _buildSeismicFrameSelfWeightMemberLoadsForPayload(frames = []) {
    const out = [];
    const colDepth = this._buildColumnDepthMapForSeismic(frames);

    (frames || []).forEach((frame) => {
      const frameId = Number(frame?.id ?? frame?.frameId ?? frame?.frame_id);
      if (!Number.isFinite(frameId)) return;

      const a = this._massNodeCoord(this._resolveMassNode(frame.node1));
      const b = this._massNodeCoord(this._resolveMassNode(frame.node2));
      const centerlineLength = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
      if (!(centerlineLength > 0)) return;

      const sectionName = this._getFrameSectionNameForSeismic(frame);
      const section = this._getSectionDefinitionForSeismic(sectionName);
      const A = Number(section?.A ?? section?.area ?? section?.sectionArea ?? frame.A ?? frame._A) || 0;
      if (!(A > 0)) return;

      const node1Id = Number(this._resolveMassNode(frame.node1)?.id ?? frame.node1);
      const node2Id = Number(this._resolveMassNode(frame.node2)?.id ?? frame.node2);

      const dz = Math.abs(b.z - a.z);
      const horiz = Math.hypot(b.x - a.x, b.y - a.y);
      const isColumn = dz > 1e-6 && dz >= horiz;

      const unitWeight = Number(this._getFrameUnitWeightForSeismic(frame)) || 0; // N/m3
      const w = unitWeight * A; // N/m — intensidad REAL del peso propio
      if (!(w > 0)) return;

      const comun = {
        element: frameId,
        loadCase: "CM",
        load_case: "CM",
        pattern: "CM",
        type: "Dead",
        loadType: "Dead",
        source: "frame_self_weight",
      };

      // Una columna se carga en TODA su longitud.
      if (isColumn) {
        out.push({ ...comun, kind: "uniform", wx: 0, wy: 0, wz: -w });
        return;
      }

      // ── Vigas: intensidad PLENA sobre la LUZ LIBRE ──
      //
      // ETABS aplica el peso propio con su intensidad real pero SOLO sobre la
      // luz libre — el tramo dentro del nudo ya lo cuenta la columna. Medido
      // en MINI1 (pórtico 6×4 de un vano, sin muros): P por columna
      // 7.0236 t = 28.872 − 0.778, y ese 0.778 es exactamente el peso de las
      // 4 vigas dentro de sus nudos.
      //
      // ANTES se repartía ese MISMO total sobre la longitud completa, o sea a
      // intensidad reducida (0.3996 en vez de 0.432 en una V30×60). El total
      // quedaba bien —por eso el axial siempre calzó al 0.02%— pero la
      // DISTRIBUCIÓN no, y el momento de empotramiento depende de dónde está
      // la carga: 0.432·3.55²/12 = 0.4536 contra 0.3834·4²/12 = 0.5112, 13%.
      //
      // En MINI1 el error de cada momento de columna resultó ser EXACTAMENTE
      // el error de carga de su viga: viga 0.9804 → M3 0.9813; viga 0.8875 →
      // M2 0.9039. En el modelo real con muros ese mismo error se amplifica
      // (a la columna le queda un residuo chico) y llega a invertir el signo.
      //
      // OpenSees NO soporta carga uniforme parcial: `eleLoad -beamUniform` con
      // argumentos de tramo los IGNORA EN SILENCIO (probado: devuelve el
      // uniforme completo, igual que `geomTransf -jntOffset`). Se arma
      // entonces como uniforme plena sobre toda la barra MENOS dos puntuales
      // hacia ARRIBA en los parches de nudo. Exacto en resultante y centroide;
      // el residuo es de orden (parche/L)² ≈ 0.1% para 0.225 m en 6 m.
      //
      // El TOTAL no cambia (w·L − w·a − w·b = w·(L−a−b)), así que el axial y
      // las reacciones quedan idénticos: esto solo mueve la distribución.
      // `a`/`b` ya son las coordenadas de los nudos en este scope.
      let dedI = 0.5 * (colDepth.get(node1Id) || 0);
      let dedJ = 0.5 * (colDepth.get(node2Id) || 0);

      // Mismo piso que antes: la luz libre nunca baja del 10% de la longitud.
      const dedMax = 0.9 * centerlineLength;
      if (dedI + dedJ > dedMax && dedI + dedJ > 0) {
        const k = dedMax / (dedI + dedJ);
        dedI *= k;
        dedJ *= k;
      }

      out.push({ ...comun, kind: "uniform", wx: 0, wy: 0, wz: -w });

      const TOL_M = 1e-4;
      if (dedI > TOL_M) {
        out.push({ ...comun, kind: "point", px: 0, py: 0, pz: w * dedI,
                   relDist: (0.5 * dedI) / centerlineLength });
      }
      if (dedJ > TOL_M) {
        out.push({ ...comun, kind: "point", px: 0, py: 0, pz: w * dedJ,
                   relDist: (centerlineLength - 0.5 * dedJ) / centerlineLength });
      }
    });

    return out;
  },

  _buildSeismicFrameSelfWeightForPayload(frames = []) {
    const out = [];
    const colDepth = this._buildColumnDepthMapForSeismic(frames);

    (frames || []).forEach((frame) => {
      const a = this._massNodeCoord(this._resolveMassNode(frame.node1));
      const b = this._massNodeCoord(this._resolveMassNode(frame.node2));
      const centerlineLength = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
      if (!(centerlineLength > 0)) return;

      const sectionName = this._getFrameSectionNameForSeismic(frame);
      const section = this._getSectionDefinitionForSeismic(sectionName);
      const A = Number(section?.A ?? section?.area ?? section?.sectionArea ?? frame.A ?? frame._A) || 0;
      if (!(A > 0)) return;

      const node1Id = Number(this._resolveMassNode(frame.node1)?.id ?? frame.node1);
      const node2Id = Number(this._resolveMassNode(frame.node2)?.id ?? frame.node2);

      // Vigas: longitud libre (centerline menos medio peralte de columna en
      // cada extremo apoyado en columna), igual que ETABS y que
      // _beam_self_weight_length en el backend — el peso propio de una viga
      // no incluye el tramo que ya "pertenece" a la columna. Columnas: sin
      // descuento (longitud centerline completa).
      const dz = Math.abs(b.z - a.z);
      const horiz = Math.hypot(b.x - a.x, b.y - a.y);
      const isColumn = dz > 1e-6 && dz >= horiz;

      let length = centerlineLength;
      if (!isColumn) {
        const deduction = 0.5 * (colDepth.get(node1Id) || 0) + 0.5 * (colDepth.get(node2Id) || 0);
        length = Math.max(centerlineLength - deduction, 0.1 * centerlineLength);
      }

      const unitWeight = Number(this._getFrameUnitWeightForSeismic(frame)) || 0; // N/m3
      const totalN = unitWeight * A * length; // peso total del elemento [N]
      if (!(totalN > 0)) return;

      // Reparto mitad-mitad a cada nudo extremo (consistente con una barra
      // prismática recta; no es una carga distribuida real sobre el elemento,
      // solo su equivalente nodal para el análisis estático).
      const perNode = totalN / 2;

      [node1Id, node2Id].forEach((nid) => {
        if (!Number.isFinite(nid)) return;

        out.push({
          node: nid,
          fx: 0,
          fy: 0,
          fz: -perNode,
          loadCase: "CM",
          // run_static_analysis_by_type (Python) filtra por type/loadType, no
          // por loadCase — sin esto el peso propio quedaba excluido de
          // static_dead (CM salía en 0 en "Reacciones por Caso").
          type: "Dead",
          loadType: "Dead",
          source: "frame_self_weight",
        });
      });
    });

    return out;
  },

  _buildSeismicLoadsForPayload(nodes = []) {
    const loads = [];

    const pushNormalizedLoad = (rawLoad, node = null, index = 0, source = "unknown") => {
      const load = this._normalizePointLoadForSeismic(
        {
          ...(rawLoad || {}),
          source: rawLoad?.source || source,
        },
        node,
        index
      );

      if (!Number.isFinite(load.node)) return;

      const hasForce =
        Math.abs(load.fx) > 0 ||
        Math.abs(load.fy) > 0 ||
        Math.abs(load.fz) > 0 ||
        Math.abs(load.mx || 0) > 0 ||
        Math.abs(load.my || 0) > 0 ||
        Math.abs(load.mz || 0) > 0;

      if (!hasForce) return;

      loads.push(load);
    };

    // 1) Cargas guardadas dentro de cada nodo
    (nodes || []).forEach((node) => {
      const rawLoads = [
        ...(Array.isArray(node?.pointLoads) ? node.pointLoads : []),
        ...(Array.isArray(node?.jointLoads) ? node.jointLoads : []),
        ...(Array.isArray(node?.loads) ? node.loads : []),
        ...(Array.isArray(node?.assignedLoads) ? node.assignedLoads : []),
        ...(Array.isArray(node?.loadAssignments) ? node.loadAssignments : []),
      ];

      // Caso: node.load como objeto único
      if (node?.load && typeof node.load === "object" && !Array.isArray(node.load)) {
        rawLoads.push(node.load);
      }

      // Caso: node.assignment.loads
      if (Array.isArray(node?.assignment?.loads)) {
        rawLoads.push(...node.assignment.loads);
      }

      // Caso: node.assignments.loads
      if (Array.isArray(node?.assignments?.loads)) {
        rawLoads.push(...node.assignments.loads);
      }

      rawLoads.forEach((rawLoad, index) => {
        pushNormalizedLoad(rawLoad, node, index, "node_load");
      });
    });

    // 2) Cargas globales del sistema CAD
    const globalLoadSources = [
      this.loads,
      this.pointLoads,
      this.jointLoads,
      this.nodalLoads,
      this.loadAssignments,
      this.assignedLoads,
      this.analysisLoads,
      this.modelLoads,
      this.cadLoads,
    ];

    globalLoadSources.forEach((source) => {
      if (!source) return;

      const list = Array.isArray(source) ? source : Object.values(source);

      list.forEach((rawLoad, index) => {
        if (!rawLoad || typeof rawLoad !== "object") return;

        const nodeId =
          rawLoad.node ||
          rawLoad.nodeId ||
          rawLoad.node_id ||
          rawLoad.joint ||
          rawLoad.jointId ||
          rawLoad.joint_id;

        const node = (nodes || []).find((item) => {
          return Number(item?.id) === Number(nodeId);
        });

        pushNormalizedLoad(rawLoad, node, index, "global_load");
      });
    });

    // 3) Eliminar duplicados simples
    const unique = [];
    const seen = new Set();

    loads.forEach((load) => {
      const key = [
        load.node,
        load.fx,
        load.fy,
        load.fz,
        load.loadCase,
        load.source,
      ].join("|");

      if (seen.has(key)) return;

      seen.add(key);
      unique.push(load);
    });

    return unique;
  },

  _buildLoadPatternsForSeismicPayload(loads = [], massSource = null) {
    const map = new Map();

    (loads || []).forEach((load) => {
      const name = this._normalizeLoadPatternNameForSeismic(
        load.loadCase || load.pattern || load.name,
        "DEAD"
      );

      if (!map.has(name)) {
        map.set(name, {
          name,
          type: load.type || this._getLoadPatternTypeForSeismic(name),
          source: "loads",
        });
      }
    });

    const msPatterns = massSource?.loadPatterns || massSource?.load_patterns || [];

    if (Array.isArray(msPatterns)) {
      msPatterns.forEach((item) => {
        const name = this._normalizeLoadPatternNameForSeismic(
          item.name || item.loadCase || item.pattern,
          "DEAD"
        );

        if (!map.has(name)) {
          map.set(name, {
            name,
            type: item.type || this._getLoadPatternTypeForSeismic(name),
            factor: Number(item.factor ?? item.multiplier ?? 0),
            source: "mass_source",
          });
        }
      });
    }

    if (!map.has("DEAD")) {
      map.set("DEAD", {
        name: "DEAD",
        type: "Dead",
        source: "default",
      });
    }

    return Array.from(map.values());
  },

  // ============================================================
  // B10.10 — Frame / Line Loads para payload sísmico
  // Convierte cargas de barra a cargas nodales equivalentes
  // ============================================================

  _getFrameNodePositionForSeismic(node = {}) {
    return {
      x: Number(node.position?.x ?? node.x ?? 0),
      y: Number(node.position?.y ?? node.y ?? 0),
      z: Number(node.position?.z ?? node.z ?? 0),
    };
  },

  _getFrameLengthForSeismic(frame = {}) {
    const ni = this._getFrameNodePositionForSeismic(frame.node1 || frame.iNode || {});
    const nj = this._getFrameNodePositionForSeismic(frame.node2 || frame.jNode || {});

    const dx = nj.x - ni.x;
    const dy = nj.y - ni.y;
    const dz = nj.z - ni.z;

    const L = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return Number.isFinite(L) && L > 0 ? L : 0;
  },

  _getFrameLoadPatternForSeismic(rawLoad = {}) {
    return this._normalizeLoadPatternNameForSeismic(
      rawLoad.loadCase ||
      rawLoad.load_case ||
      rawLoad.case ||
      rawLoad.pattern ||
      rawLoad.loadPattern ||
      rawLoad.load_pattern ||
      rawLoad.name ||
      "DEAD",
      "DEAD"
    );
  },

  _getFrameLoadDirectionForSeismic(rawLoad = {}) {
    return String(
      rawLoad.direction ||
      rawLoad.dir ||
      rawLoad.loadDirection ||
      rawLoad.load_direction ||
      rawLoad.axis ||
      rawLoad.component ||
      "GZ"
    ).trim().toUpperCase();
  },

  _getFrameLoadMagnitudeForSeismic(rawLoad = {}) {
    const start = Number(
      rawLoad.startValue ??
      rawLoad.start_value ??
      rawLoad.valueAtStart ??
      rawLoad.value_at_start
    );

    const end = Number(
      rawLoad.endValue ??
      rawLoad.end_value ??
      rawLoad.valueAtEnd ??
      rawLoad.value_at_end
    );

    if (Number.isFinite(start) && Number.isFinite(end)) {
      return (start + end) / 2;
    }

    if (Number.isFinite(start)) return start;
    if (Number.isFinite(end)) return end;

    return Number(
      rawLoad.w ??
      rawLoad.w1 ??
      rawLoad.value ??
      rawLoad.magnitude ??
      rawLoad.load ??
      rawLoad.force ??
      rawLoad.uniformLoad ??
      rawLoad.distributedLoad ??
      rawLoad.q ??
      0
    );
  },

  _normalizeFrameVerticalLoadValueForSeismic(value, direction = "GZ") {
    let number = Number(value);

    if (!Number.isFinite(number)) {
      return 0;
    }

    const dir = String(direction || "").toUpperCase();

    // Si la carga dice gravedad o Z, y el usuario puso positivo,
    // lo convertimos a negativo para dirección vertical hacia abajo.
    if (
      dir.includes("GRAV") ||
      dir.includes("GZ") ||
      dir === "Z" ||
      dir === "GLOBAL Z" ||
      dir === "GLOBAL-Z"
    ) {
      if (number > 0) {
        number = -Math.abs(number);
      }
    }

    return number;
  },

  _buildEquivalentJointLoadsFromFrameLoad(frame = {}, rawLoad = {}, index = 0) {
    const frameId = frame.id ?? `F_${index + 1}`;

    const nodeI = Number(frame.node1?.id ?? frame.node_i ?? frame.i ?? frame.iNode?.id);
    const nodeJ = Number(frame.node2?.id ?? frame.node_j ?? frame.j ?? frame.jNode?.id);

    if (!Number.isFinite(nodeI) || !Number.isFinite(nodeJ)) {
      return [];
    }

    const L = this._getFrameLengthForSeismic(frame);

    if (L <= 0) {
      return [];
    }

    const patternName = this._getFrameLoadPatternForSeismic(rawLoad);
    const patternType = this._getLoadPatternTypeForSeismic(patternName);
    const direction = this._getFrameLoadDirectionForSeismic(rawLoad);

    const loadKind = String(
      rawLoad.kind ||
      rawLoad.type ||
      rawLoad.loadType ||
      rawLoad.load_type ||
      "distributed"
    ).toLowerCase();

    const loads = [];

    // Caso 1: carga distribuida uniforme
    const isDistributed =
      loadKind.includes("distributed") ||
      loadKind.includes("uniform") ||
      rawLoad.w !== undefined ||
      rawLoad.w1 !== undefined ||
      rawLoad.uniformLoad !== undefined ||
      rawLoad.distributedLoad !== undefined ||
      rawLoad.q !== undefined;

    if (isDistributed) {
      const wRaw = this._getFrameLoadMagnitudeForSeismic(rawLoad);
      const w = this._normalizeFrameVerticalLoadValueForSeismic(wRaw, direction);

      if (Math.abs(w) <= 0) {
        return [];
      }

      const nodalFz = (w * L) / 2;

      loads.push({
        id: `FLOAD_${frameId}_${index + 1}_I`,
        node: nodeI,
        nodeId: nodeI,
        fx: 0,
        fy: 0,
        fz: nodalFz,
        mx: 0,
        my: 0,
        mz: 0,
        loadCase: patternName,
        load_case: patternName,
        pattern: patternName,
        loadPattern: patternName,
        name: patternName,
        type: patternType,
        loadType: patternType,
        patternType,
        assignmentType: "frame_distributed",
        loadAssignmentType: "frame_distributed",
        source: "frame_load_equivalent",
        frameId,
        frameLoadKind: "distributed",
        originalValue: wRaw,
        usedValue: w,
        tributaryLength: L / 2,
      });

      loads.push({
        id: `FLOAD_${frameId}_${index + 1}_J`,
        node: nodeJ,
        nodeId: nodeJ,
        fx: 0,
        fy: 0,
        fz: nodalFz,
        mx: 0,
        my: 0,
        mz: 0,
        loadCase: patternName,
        load_case: patternName,
        pattern: patternName,
        loadPattern: patternName,
        name: patternName,
        type: patternType,
        loadType: patternType,
        patternType,
        assignmentType: "frame_distributed",
        loadAssignmentType: "frame_distributed",
        source: "frame_load_equivalent",
        frameId,
        frameLoadKind: "distributed",
        originalValue: wRaw,
        usedValue: w,
        tributaryLength: L / 2,
      });

      return loads;
    }

    // Caso 2: carga puntual sobre barra
    const pRaw = Number(
      rawLoad.P ??
      rawLoad.p ??
      rawLoad.forceValue ??
      rawLoad.force_value ??
      rawLoad.magnitude ??
      rawLoad.value ??
      0
    );

    const P = this._normalizeFrameVerticalLoadValueForSeismic(pRaw, direction);

    if (Math.abs(P) <= 0) {
      return [];
    }

    const relativeDistance = Number(
      rawLoad.relativeDistance ??
      rawLoad.relative_distance ??
      rawLoad.relDist ??
      rawLoad.aOverL ??
      rawLoad.stationRatio ??
      0.5
    );

    const a = Number.isFinite(relativeDistance)
      ? Math.min(Math.max(relativeDistance, 0), 1)
      : 0.5;

    const fzI = P * (1 - a);
    const fzJ = P * a;

    loads.push({
      id: `FPOINT_${frameId}_${index + 1}_I`,
      node: nodeI,
      nodeId: nodeI,
      fx: 0,
      fy: 0,
      fz: fzI,
      mx: 0,
      my: 0,
      mz: 0,
      loadCase: patternName,
      load_case: patternName,
      pattern: patternName,
      loadPattern: patternName,
      name: patternName,
      type: patternType,
      loadType: patternType,
      patternType,
      assignmentType: "frame_point",
      loadAssignmentType: "frame_point",
      source: "frame_load_equivalent",
      frameId,
      frameLoadKind: "point",
      originalValue: pRaw,
      usedValue: P,
      relativeDistance: a,
    });

    loads.push({
      id: `FPOINT_${frameId}_${index + 1}_J`,
      node: nodeJ,
      nodeId: nodeJ,
      fx: 0,
      fy: 0,
      fz: fzJ,
      mx: 0,
      my: 0,
      mz: 0,
      loadCase: patternName,
      load_case: patternName,
      pattern: patternName,
      loadPattern: patternName,
      name: patternName,
      type: patternType,
      loadType: patternType,
      patternType,
      assignmentType: "frame_point",
      loadAssignmentType: "frame_point",
      source: "frame_load_equivalent",
      frameId,
      frameLoadKind: "point",
      originalValue: pRaw,
      usedValue: P,
      relativeDistance: a,
    });

    return loads;
  },

  // Cargas crudas asignadas a una barra, de-duplicadas. Extraído para que el
  // equivalente nodal (masa/estático global) y las cargas de miembro reales
  // (diagramas de fuerzas) partan EXACTAMENTE del mismo conjunto.
  _collectFrameRawLoadsForSeismic(frame = {}) {
    const frameId = Number(
      frame?.id ??
      frame?.frameId ??
      frame?.frame_id
    );

    const storeById = this.frameLoadAssignmentsById || {};

    const storedLoads = [
      ...(Array.isArray(storeById[String(frameId)]) ? storeById[String(frameId)] : []),
      ...(Array.isArray(storeById[frameId]) ? storeById[frameId] : []),
      ...(Array.isArray(this.frameLoadAssignments)
        ? this.frameLoadAssignments.filter(item => Number(item.frameId ?? item.frame_id) === frameId)
        : []),
    ];

    let rawLoads = [];

    // Si existe store global, usamos SOLO ese para no duplicar.
    if (storedLoads.length > 0) {
      rawLoads = storedLoads;
    } else {
      rawLoads = [
        ...(Array.isArray(frame?.frameLoads) ? frame.frameLoads : []),
        ...(Array.isArray(frame?.lineLoads) ? frame.lineLoads : []),
        ...(Array.isArray(frame?.loads) ? frame.loads : []),
        ...(Array.isArray(frame?.distributedLoads) ? frame.distributedLoads : []),
        ...(Array.isArray(frame?.pointLoads) ? frame.pointLoads : []),

        ...(Array.isArray(frame?.assignment?.loads) ? frame.assignment.loads : []),
        ...(Array.isArray(frame?.assignment?.frameLoads) ? frame.assignment.frameLoads : []),
        ...(Array.isArray(frame?.assignment?.lineLoads) ? frame.assignment.lineLoads : []),

        ...(Array.isArray(frame?.assignments?.loads) ? frame.assignments.loads : []),
        ...(Array.isArray(frame?.assignments?.frameLoads) ? frame.assignments.frameLoads : []),
        ...(Array.isArray(frame?.assignments?.lineLoads) ? frame.assignments.lineLoads : []),
      ];
    }

    const uniqueLoads = [];
    const seen = new Set();

    rawLoads.forEach((rawLoad) => {
      if (!rawLoad || typeof rawLoad !== "object") return;

      const key = [
        rawLoad.id,
        rawLoad.type,
        rawLoad.loadType,
        rawLoad.loadCase,
        rawLoad.pattern,
        rawLoad.direction,
        rawLoad.startValue,
        rawLoad.endValue,
        rawLoad.value,
        rawLoad.w,
        rawLoad.q,
      ].join("|");

      if (seen.has(key)) return;

      seen.add(key);
      uniqueLoads.push(rawLoad);
    });

    return uniqueLoads;
  },

  _buildSeismicFrameEquivalentLoadsForPayload(frames = []) {
    const loads = [];

    (frames || []).forEach((frame) => {
      this._collectFrameRawLoadsForSeismic(frame).forEach((rawLoad, index) => {
        const equivalentLoads = this._buildEquivalentJointLoadsFromFrameLoad(
          frame,
          rawLoad,
          index
        );

        loads.push(...equivalentLoads);
      });
    });

    return loads;
  },

  // Dirección de la carga como vector unitario GLOBAL. El motor lo proyecta a
  // ejes locales del elemento. Por defecto gravedad (−Z), igual que hoy.
  _frameLoadGlobalDirectionForSeismic(direction = "GZ") {
    const dir = String(direction || "").toUpperCase();

    if (dir === "X" || dir === "GX" || dir.includes("GLOBAL X") || dir.includes("GLOBAL-X")) {
      return [1, 0, 0];
    }

    if (dir === "Y" || dir === "GY" || dir.includes("GLOBAL Y") || dir.includes("GLOBAL-Y")) {
      return [0, 1, 0];
    }

    return [0, 0, 1]; // GZ / gravedad: el signo lo pone el valor normalizado
  },

  /**
   * Cargas de TRAMO (miembro) para el motor: `memberLoads[]`.
   *
   * Van EN PARALELO al equivalente nodal de `_buildEquivalentJointLoadsFromFrameLoad`,
   * que se mantiene intacto porque de ahí sale la masa (Fuente de Masa) y el
   * estático global. El motor usa uno u otro según el análisis: para los
   * diagramas de fuerzas (run_frame_force_results) aplica ESTAS con eleLoad y
   * descarta el equivalente nodal, que es lo que hacía que toda viga saliera
   * con M3 = 0 (el wL/2 en los nudos se va directo a los apoyos, sin flectar
   * la viga; ETABS carga el miembro).
   *
   * Magnitudes en unidades SI del motor: w en N/m, P en N, `relDist` en 0..1.
   */
  _buildSeismicFrameMemberLoadsForPayload(frames = []) {
    const out = [];

    (frames || []).forEach((frame) => {
      const frameId = Number(frame?.id ?? frame?.frameId ?? frame?.frame_id);
      if (!Number.isFinite(frameId)) return;

      const L = this._getFrameLengthForSeismic(frame);
      if (!(L > 0)) return;

      this._collectFrameRawLoadsForSeismic(frame).forEach((rawLoad, index) => {
        const patternName = this._getFrameLoadPatternForSeismic(rawLoad);
        const patternType = this._getLoadPatternTypeForSeismic(patternName);
        const direction = this._getFrameLoadDirectionForSeismic(rawLoad);
        const unit = this._frameLoadGlobalDirectionForSeismic(direction);

        const loadKind = String(
          rawLoad.kind ||
          rawLoad.type ||
          rawLoad.loadType ||
          rawLoad.load_type ||
          "distributed"
        ).toLowerCase();

        const isDistributed =
          loadKind.includes("distributed") ||
          loadKind.includes("uniform") ||
          rawLoad.w !== undefined ||
          rawLoad.w1 !== undefined ||
          rawLoad.uniformLoad !== undefined ||
          rawLoad.distributedLoad !== undefined ||
          rawLoad.q !== undefined;

        const common = {
          element: frameId,
          loadCase: patternName,
          load_case: patternName,
          pattern: patternName,
          type: patternType,
          loadType: patternType,
          source: "frame_load",
        };

        if (isDistributed) {
          // Trapezoidal → se promedia, igual que el equivalente nodal
          // (_getFrameLoadMagnitudeForSeismic). Mantener el mismo criterio
          // evita que los dos caminos difieran en carga total.
          const wRaw = this._getFrameLoadMagnitudeForSeismic(rawLoad);
          const w = this._normalizeFrameVerticalLoadValueForSeismic(wRaw, direction);

          if (!(Math.abs(w) > 0)) return;

          out.push({
            ...common,
            id: `MLOAD_${frameId}_${index + 1}`,
            kind: "uniform",
            wx: unit[0] * w,
            wy: unit[1] * w,
            wz: unit[2] * w,
          });

          return;
        }

        const pRaw = Number(
          rawLoad.P ??
          rawLoad.p ??
          rawLoad.forceValue ??
          rawLoad.force_value ??
          rawLoad.magnitude ??
          rawLoad.value ??
          0
        );

        const P = this._normalizeFrameVerticalLoadValueForSeismic(pRaw, direction);
        if (!(Math.abs(P) > 0)) return;

        const relRaw = Number(
          rawLoad.relativeDistance ??
          rawLoad.relative_distance ??
          rawLoad.relDist ??
          rawLoad.aOverL ??
          rawLoad.stationRatio ??
          0.5
        );

        const rel = Number.isFinite(relRaw) ? Math.min(Math.max(relRaw, 0), 1) : 0.5;

        out.push({
          ...common,
          id: `MLOAD_${frameId}_${index + 1}`,
          kind: "point",
          px: unit[0] * P,
          py: unit[1] * P,
          pz: unit[2] * P,
          relDist: rel,
        });
      });
    });

    return out;
  },

  // Vector vecxz (orientación del eje local) por elemento, para el motor.
  //  - Columnas (verticales): [0,1,0] → eje fuerte Iz resiste X (calibrado vs ETABS).
  //  - TODO lo demás (vigas horizontales, cabios de techo inclinado, diagonales):
  //    perpendicular HORIZONTAL a la proyección en planta → quedan "paradas"
  //    (peralte vertical), usando su Iz fuerte en el plano vertical del pórtico.
  //    Esa es la convención por defecto de ETABS para cualquier barra no vertical:
  //    el eje local 2 va en el plano vertical que contiene a la barra.
  //
  // Los INCLINADOS devolvían `null` y OpenSees los auto-orientaba a su antojo.
  // Medido contra ETABS en MODULO 1 (2026-08-10), eso salía como M2 y M3
  // CRUZADOS: las 12 vigas inclinadas del techo daban ratio M3 app/ETABS de
  // 0.06–0.36 mientras su M2 iba 3–12× ALTO. Con la regla de acá esas mismas
  // 12 pasan a mediana ~0.85 (B64 0.06→0.94, B18 0.06→0.90, B91 0.09→0.97).
  _frameVecxzForSeismic(f) {
    const a = this._massNodeCoord(this._resolveMassNode(f.node1));
    const b = this._massNodeCoord(this._resolveMassNode(f.node2));
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const L = Math.hypot(dx, dy, dz);
    if (!(L > 0)) return null;
    const vert = Math.abs(dz) / L;
    if (vert > 0.9) {
      // Columna: eje base [0,1,0] (Iz resiste X, calibrado vs ETABS). Si la
      // columna tiene rotación de eje local asignada, se gira ese vector en el
      // plano horizontal (θ + antihorario): [0,1,0] → [-sinθ, cosθ, 0].
      const angleDeg = Number(f.localAxisAngle || 0);
      if (angleDeg) {
        const t = (angleDeg * Math.PI) / 180;
        return [-Math.sin(t), Math.cos(t), 0];
      }
      return [0, 1, 0]; // columna sin rotación
    }
    const hx = dy, hy = -dx;             // perpendicular horizontal en planta
    const hl = Math.hypot(hx, hy);
    // Sin proyección en planta es vertical y no llegó al caso columna (vert
    // entre 0.9 y 1.0 por redondeo): que lo auto-oriente el motor, como antes.
    if (hl < 1e-9) return null;
    return [hx / hl, hy / hl, 0];        // barra "parada"
  },

  /**
   * Quita del payload los nodos SIN NINGUNA RIGIDEZ (no son extremo de barra,
   * ni esquina de muro, ni apoyo) y re-asigna sus cargas al nodo conectado más
   * cercano del mismo nivel. Ver el comentario en _buildSeismicPayload para el
   * porqué (matriz singular en OpenSees con losas subdivididas de un .e2k).
   *
   * Devuelve { nodes, loads, dropped }. Si no hay nodos sueltos, devuelve los
   * arreglos originales sin tocar (coste ~0 en modelos normales).
   */
  _dropUnsupportedNodesForSeismic(
    nodeList = [], elemList = [], supports = [], walls = [], loads = [], meshedSlabs = [],
  ) {
    const connected = new Set();

    (elemList || []).forEach((e) => {
      connected.add(Number(e.node_i));
      connected.add(Number(e.node_j));
    });
    (supports || []).forEach((s) => connected.add(Number(s.node)));

    const key = (x, y, z) => `${Math.round(x * 1000)}|${Math.round(y * 1000)}|${Math.round(z * 1000)}`;

    // Esquinas de muro: el motor las empareja por COORDENADA para coser la
    // malla del muro al pórtico (ver _build_wall_mesh_plan), así que esos
    // nodos deben seguir viajando aunque no tengan barra.
    if (walls?.length) {
      const wallCorners = new Set();
      walls.forEach((w) => (w.corners || []).forEach((c) => {
        wallCorners.add(key(Number(c.x) || 0, Number(c.y) || 0, Number(c.z) || 0));
      }));
      nodeList.forEach((n) => {
        if (wallCorners.has(key(n.x, n.y, n.z))) connected.add(Number(n.id));
      });
    }

    // Ídem para los vértices de las losas que SÍ se mallan como shell: desde
    // que la losa aporta rigidez, su vértice ya no es un nudo huérfano aunque
    // no tenga viga (caso típico de la cumbrera de un techo inclinado).
    // Solo las malladas — un vértice de losa plana sin barra sigue siendo
    // huérfano y debe salir, como hasta ahora.
    if (meshedSlabs?.length) {
      const slabVertices = new Set();
      meshedSlabs.forEach((s) => (s.points || []).forEach((p) => {
        slabVertices.add(key(Number(p.x) || 0, Number(p.y) || 0, Number(p.z) || 0));
      }));
      nodeList.forEach((n) => {
        if (slabVertices.has(key(n.x, n.y, n.z))) connected.add(Number(n.id));
      });
    }

    const orphans = nodeList.filter((n) => !connected.has(Number(n.id)));
    if (!orphans.length) return { nodes: nodeList, loads, dropped: 0 };

    // Nodo conectado más cercano (mismo nivel si lo hay; si no, el más cercano
    // en 3D) para heredar la carga del nodo suelto.
    const connectedNodes = nodeList.filter((n) => connected.has(Number(n.id)));
    if (!connectedNodes.length) return { nodes: nodeList, loads, dropped: 0 };

    const remap = new Map();
    orphans.forEach((o) => {
      let best = null;
      let bestScore = Infinity;
      for (const c of connectedNodes) {
        const sameLevel = Math.abs(c.z - o.z) <= 0.05 ? 0 : 1;
        const d = (c.x - o.x) ** 2 + (c.y - o.y) ** 2 + (c.z - o.z) ** 2;
        const score = sameLevel * 1e9 + d;
        if (score < bestScore) { bestScore = score; best = c; }
      }
      if (best) remap.set(Number(o.id), Number(best.id));
    });

    const remappedLoads = (loads || []).map((l) => {
      const nid = Number(l?.node ?? l?.nodeId ?? l?.node_id);
      if (!remap.has(nid)) return l;
      const target = remap.get(nid);
      return { ...l, node: target, nodeId: target, node_id: target };
    });

    return {
      nodes: connectedNodes,
      loads: remappedLoads,
      dropped: orphans.length,
    };
  },

  // ─── Construir payload para el backend ────────────────────────────────────
  _buildSeismicPayload(cfg, nodes, frames) {
    const nodeList = nodes.map(n => ({
      id: Number(n.id),
      x: Number(n.position?.x || 0),
      y: Number(n.position?.y || 0),
      z: Number(n.position?.z || 0),
      mass_x: Number(n.mass_x ?? n.mass?.x ?? n.mass ?? 0),
      mass_y: Number(n.mass_y ?? n.mass?.y ?? n.mass ?? 0),
      mass_z: Number(n.mass_z ?? n.mass?.z ?? 0),
    }));

    // Barras cuya sección NO aporta propiedades estructurales: caen a los
    // fallbacks (A=0.01, I=1e-4) y el análisis corre igual, en silencio, con
    // una barra de papel. Se juntan acá para avisarlo — ver el bloque de
    // advertencia después del map.
    const framesWithoutSection = [];

    // Brazos rígidos de nudo. Solo mueven DÓNDE se reporta el diagrama (a la
    // luz libre, como ETABS), no la rigidez del modelo. `useFrameEndOffsets:
    // false` en la config los apaga y se vuelve a reportar de eje a eje.
    const endOffsets =
      (cfg.useFrameEndOffsets ?? this.seismicConfig?.useFrameEndOffsets ?? true)
        ? this._buildBeamEndOffsetsForSeismic(frames)
        : new Map();

    // Las COLUMNAS también los llevan (ver columnEndOffsets.js). Sin esto
    // reportaban de eje a eje y su modal no calzaba con el de ETABS, que
    // reporta la luz libre entre paquetes de vigas.
    if (endOffsets.size || (cfg.useFrameEndOffsets ?? this.seismicConfig?.useFrameEndOffsets ?? true)) {
      buildColumnEndOffsets(this, frames).forEach((v, k) => {
        if (!endOffsets.has(k)) endOffsets.set(k, v);
      });
    }

    const elemList = frames.map(f => {
      const sec = f.frameSection || f.section || {};
      // D1: E/G se resuelven desde el MATERIAL referenciado por la sección
      // (con conversión MPa→Pa). A/Iz/Iy/J desde la sección si existen.
      const { E, G } = this._resolveFrameMaterial(sec, f);
      const A = Number(sec.A || sec.area || f.A || 0.01);   // m²
      const Iz = Number(sec.Iz || sec.iz || sec.I33 || f.Iz || 1e-4);  // m⁴
      const Iy = Number(sec.Iy || sec.iy || sec.I22 || f.Iy || 1e-4);  // m⁴
      const J = Number(sec.J || sec.torsional || f.J || 1e-6);      // m⁴

      // La sección tiene que aportar AL MENOS un área y una inercia; si no,
      // lo que viaja son los fallbacks (o la sección global del CAD, que es
      // una barra de armadura de 1.5 cm²).
      const sectionHasArea = Number(sec.A || sec.area) > 0;
      const sectionHasInertia = Number(sec.Iz || sec.iz || sec.I33) > 0;
      const sectionMissing = !sectionHasArea || !sectionHasInertia;
      if (sectionMissing) {
        framesWithoutSection.push({
          id: Number(f.id),
          seccion: typeof sec === "object" ? (sec.name ?? null) : String(sec),
          A,
          Iz,
          Iy,
        });
      }

      // Metadata física (peso unitario, material/sección) que requiere el motor.
      const physical = typeof this._buildFramePhysicalMetadataForSeismic === "function"
        ? this._buildFramePhysicalMetadataForSeismic(f)
        : {
          unitWeight: 24000,
          unit_weight: 24000,
          unitWeightNPerM3: 24000,
          materialName: "CONCRETE",
          sectionName: "DEFAULT_SECTION",
          material: {
            name: "CONCRETE",
            unitWeight: 24000,
            unit_weight: 24000,
            unitWeightNPerM3: 24000,
            E,
            G,
          },
          section: {
            name: "DEFAULT_SECTION",
            unitWeight: 24000,
            unit_weight: 24000,
            unitWeightNPerM3: 24000,
            A,
            area: A,
            Iy,
            Iz,
            J,
          },
        };

      // Orientación local (vecxz): columnas con eje fuerte calibrado tipo ETABS y
      // vigas "paradas" (peralte vertical → Iz fuerte en el plano del pórtico).
      // Sin esto el motor auto-orienta las vigas "acostadas" y sale demasiado flexible.
      const vecxz = this._frameVecxzForSeismic(f);

      return {
        id: Number(f.id),
        node_i: Number(f.node1.id),
        node_j: Number(f.node2.id),

        A, E, G, Iz, Iy, J,
        ...(vecxz ? { vecxz } : {}),

        // Clasificación ETABS (COLUMN/BEAM/BRACE, ver e2k-import.js kindLc) —
        // el motor la usa para decidir si un "brace" se modela como
        // elemento truss (pin-pin, solo axial) en vez de frame rígido.
        elementType: f.type || f.elementType || null,

        // Luz libre para el REPORTE de fuerzas (ver _buildBeamEndOffsetsForSeismic).
        ...(endOffsets.has(Number(f.id))
          ? {
              endOffsetI: endOffsets.get(Number(f.id)).i,
              endOffsetJ: endOffsets.get(Number(f.id)).j,
            }
          : {}),

        // Bandera para que el motor pueda avisar lo mismo en su consola (ver
        // build_model_3d): esta barra viaja con propiedades por defecto.
        ...(sectionMissing ? { sectionMissing: true } : {}),

        unitWeight: physical.unitWeight,
        unit_weight: physical.unit_weight,
        unitWeightNPerM3: physical.unitWeightNPerM3,

        materialName: physical.materialName,
        sectionName: physical.sectionName,

        material: physical.material,
        section: physical.section,
      };
    });

    // ── Barras SIN sección estructural ───────────────────────────────────
    // Una barra sin sección asignada no falla: viaja con los fallbacks
    // (A=0.01 m², I=1e-4 m⁴) o con la sección global del CAD ("25x25-1.5",
    // que es una barra de armadura de 1.5 cm²), y el análisis corre igual —
    // pero esa barra es de papel y el modelo entero sale flexible sin que
    // nada lo diga. Pasó con MODULO 1 (2026-08-03): 8 columnas dibujadas a
    // mano en el tramo 3.2→6.4 sin sección dejaban T1 en 1.74 s; con sección
    // real, 0.38 s (ETABS 0.44).
    if (framesWithoutSection.length) {
      const ids = framesWithoutSection.map((f) => f.id);
      console.warn(
        `⚠️ ${framesWithoutSection.length} barra(s) SIN sección estructural asignada — ` +
        "viajan con propiedades por defecto y ablandan el modelo. " +
        "Asignales una sección (Assign ▸ Frame ▸ Frame Sections):",
        framesWithoutSection,
      );
      this.showMessage?.(
        `⚠️ ${framesWithoutSection.length} barra(s) sin sección asignada ` +
        `(id ${ids.slice(0, 6).join(", ")}${ids.length > 6 ? "…" : ""}). ` +
        "El análisis las toma con propiedades por defecto.",
        "warning",
      );
    }

    // Los presets legacy (`soporteUno/Dos/Tres`) los resuelve
    // model/nodeSupports.js, compartido con el exportador .e2k — tenerlo
    // duplicado fue lo que dejó al .e2k exportando sin apoyos.
    const supports = nodes
      .map((n) => ({ node: Number(n.id), r: getNodeRestraints(n) }))
      .filter(({ r }) => r)
      .map(({ node, r }) => ({ node, ...r }));

    const massSource = this._buildSeismicMassSourceForPayload();
    const walls = this._buildSeismicWallsForPayload(this.areas || []);

    // ── Losas como shell + su exclusión del diafragma ────────────────────
    // Las dos mitades del comportamiento SEMI-RÍGIDO de ETABS para un techo
    // inclinado: rigidez real de shell (slabs[]) y sin constraint de plano
    // rígido (noDiaphragmNodes). Van juntas a propósito — el shell quedaría
    // cortocircuitado si sus nudos siguieran amarrados al diafragma.
    const slabShellMode = String(
      cfg.slabShellMode ?? this.seismicConfig?.slabShellMode ?? "all",
    ).toLowerCase();
    const slabs = this._buildSeismicSlabsForPayload(this.areas || [], slabShellMode);
    const noDiaphragmNodes =
      slabShellMode === "off" ? [] : this._slopedSlabFreeNodeIdsForSeismic(nodes);

    const meshedSlabs = slabs.filter((s) => s.meshAsShell);
    if (meshedSlabs.length || noDiaphragmNodes.length) {
      console.log("🔎 Losas como shell (ShellMITC4) para el motor:", {
        modo: slabShellMode,
        losasEnviadas: slabs.length,
        losasMalladas: meshedSlabs.length,
        inclinadas: slabs.filter((s) => s.sloped).length,
        nudosSinDiafragma: noDiaphragmNodes.length,
      });
    }

    // El motor tiene su PROPIO agrupado automático por Z: con `diaphragms: []`
    // pero sin esta bandera, rehacía los grupos que acá se acaban de descartar
    // (ver el chequeo de `autoDiaphragms` en _build_diaphragm_groups).
    const autoDiaphragms = cfg.autoDiaphragms ?? this.seismicConfig?.autoDiaphragms ?? false;

    const diaphragms = this._buildSeismicDiaphragms(cfg, nodes);

    // Los grupos se arman con TODOS los nudos del piso; acá se sacan los de
    // losa inclinada (el motor también filtra, esto mantiene coherente lo que
    // se ve en el payload y en la "araña" del diafragma).
    if (noDiaphragmNodes.length) {
      const excluded = new Set(noDiaphragmNodes);
      diaphragms.forEach((group) => {
        if (Array.isArray(group?.nodeIds)) {
          group.nodeIds = group.nodeIds.filter((id) => !excluded.has(Number(id)));
        }
      });
    }

    // B10.4 — Cargas normalizadas
    let loads = [];

    // Cargas de TRAMO (eleLoad). Viajan aparte de `loads`: el motor las usa en
    // los diagramas de fuerzas y descarta ahí el equivalente nodal, para no
    // contar dos veces. El resto del pipeline (masa, modal, reacciones) sigue
    // usando `loads` exactamente igual que antes.
    let memberLoads = [];

    try {
      if (typeof this._buildSeismicLoadsForPayload === "function") {
        loads = this._buildSeismicLoadsForPayload(nodes);
        const frameEquivalentLoads = this._buildSeismicFrameEquivalentLoadsForPayload(frames);
        const frameSelfWeightLoads = this._buildSeismicFrameSelfWeightForPayload(frames);
        const areaLoads = this._buildSeismicAreaLoadsForPayload(this.areas || []);
        const wallSelfWeightLoads = this._buildSeismicWallSelfWeightLoadsForPayload(this.areas || []);
        loads = [...loads, ...frameEquivalentLoads, ...frameSelfWeightLoads, ...areaLoads, ...wallSelfWeightLoads];

        const slabToBeamLoads = this._buildSeismicSlabToBeamLoadsForPayload(
          this.areas || [],
          frames,
        );

        memberLoads = [
          ...this._buildSeismicFrameMemberLoadsForPayload(frames),
          ...this._buildSeismicFrameSelfWeightMemberLoadsForPayload(frames),
          ...slabToBeamLoads,
        ];

        console.log("🔎 Carga de losa repartida a vigas (Area Load to Frame):", {
          slabToBeamCount: slabToBeamLoads.length,
          // Control rápido: esto tiene que dar lo mismo que la suma de las
          // cargas nodales de área (mismo panel, mismo total, otro camino).
          totalN: slabToBeamLoads.reduce((s, l) => s + Math.abs(l.wz), 0),
        });

        console.log("🔎 Peso propio de frames (columnas/vigas) para reacciones estáticas:", {
          frameSelfWeightLoadsCount: frameSelfWeightLoads.length,
        });

        console.log("🔎 Cargas de tramo (eleLoad) para diagramas de fuerzas:", {
          memberLoadsCount: memberLoads.length,
          memberLoads,
        });

        console.log("🔎 Cargas de área (losas) para masa sísmica:", {
          areaLoadsCount: areaLoads.length,
        });

        console.log("🔎 Peso propio de muros para reacciones estáticas:", {
          wallSelfWeightLoadsCount: wallSelfWeightLoads.length,
          totalN: wallSelfWeightLoads.reduce((s, l) => s + Math.abs(l.fz), 0),
        });

        console.log("🔎 Frame loads equivalentes para análisis sísmico:", {
          frameEquivalentLoadsCount: frameEquivalentLoads.length,
          frameEquivalentLoads,
        });

        console.log("🔎 Cargas detectadas para análisis sísmico:", {
          loadsCount: loads.length,
          loads,
          possibleSources: {
            thisLoads: Array.isArray(this.loads) ? this.loads.length : this.loads ? Object.keys(this.loads).length : 0,
            pointLoads: Array.isArray(this.pointLoads) ? this.pointLoads.length : this.pointLoads ? Object.keys(this.pointLoads).length : 0,
            jointLoads: Array.isArray(this.jointLoads) ? this.jointLoads.length : this.jointLoads ? Object.keys(this.jointLoads).length : 0,
            nodalLoads: Array.isArray(this.nodalLoads) ? this.nodalLoads.length : this.nodalLoads ? Object.keys(this.nodalLoads).length : 0,
            loadAssignments: Array.isArray(this.loadAssignments) ? this.loadAssignments.length : this.loadAssignments ? Object.keys(this.loadAssignments).length : 0,
          },
        });
      }
    } catch (error) {
      console.warn("⚠️ No se pudieron construir cargas sísmicas para payload:", error);
      loads = [];
      memberLoads = [];
    }

    // ── Nodos SIN RIGIDEZ fuera del payload ──────────────────────────────
    // Un nodo que no es extremo de ninguna barra, ni esquina de muro, ni
    // apoyo, no tiene NINGUNA rigidez: si viaja al motor, OpenSees falla con
    // "BandGen/FullGenLinLapackSolver::solve() - factorization failed, matrix
    // singular U(i,i) = 0". Aparecen al importar un .e2k cuyas losas vienen
    // subdivididas en muchos paneles (MODULO 1: 120 paneles por piso → 266
    // nodos de malla sin viga, más los de las franjas de techo inclinado).
    // OJO: el diafragma rígido NO los salva — solo amarra UX/UY/RZ, y UZ/RX/RY
    // quedan igual de libres.
    // La masa NO se pierde: la carga de esos nodos se re-asigna al nodo
    // CONECTADO más cercano del mismo nivel (que es además con el que
    // comparten diafragma, así que el reparto lateral es equivalente).
    const { nodes: nodeListConnected, loads: loadsRemapped, dropped: droppedNodeCount } =
      this._dropUnsupportedNodesForSeismic(nodeList, elemList, supports, walls, loads, meshedSlabs);

    // Los diafragmas se armaron con TODOS los nodos: quitarles los que ya no
    // viajan (el motor los buscaría y no existirían).
    if (droppedNodeCount > 0) {
      const keptIds = new Set(nodeListConnected.map((n) => Number(n.id)));
      for (const group of diaphragms) {
        if (Array.isArray(group?.nodeIds)) {
          group.nodeIds = group.nodeIds.filter((id) => keptIds.has(Number(id)));
        }
      }
    }

    if (droppedNodeCount > 0) {
      console.log(
        `🔎 Nodos sin rigidez excluidos del payload sísmico: ${droppedNodeCount} ` +
        `(de ${nodeList.length}). Sus cargas se re-asignaron al nodo conectado más cercano.`,
      );
    }

    // B10.4 — Load Patterns normalizados
    let loadPatterns = [];

    try {
      if (typeof this._buildLoadPatternsForSeismicPayload === "function") {
        loadPatterns = this._buildLoadPatternsForSeismicPayload(loads, massSource);
      }
    } catch (error) {
      console.warn("⚠️ No se pudieron construir Load Patterns para payload:", error);
      loadPatterns = [];
    }

    if (!Array.isArray(loadPatterns) || loadPatterns.length === 0) {
      loadPatterns = [
        {
          name: "DEAD",
          type: "Dead",
          source: "frontend_fallback",
        },
      ];
    }

    // ── Mallado en intersecciones (MESHATINTERSECTIONS de ETABS) ──────────
    // Parte las VIGAS en los nudos que ya caen sobre su tramo (esquinas de muro,
    // vértices de la malla de losa del .e2k). Sin esto la viga flota sobre el
    // muro en vez de apoyarse.
    //
    // DEFAULT **FALSE**, y no porque el mallado esté mal — la topología calza
    // exacto con ETABS, corte por corte. Medido en MODULO 1 (2026-08-10):
    //   Story1 (vigas sobre muro, el objetivo): 0.85 → 0.88, y ninguna queda
    //     bajo 0.35 (B16 0.31→0.65, B10 0.36→0.53, B1 0.37→0.54).
    //   Story3 (techo inclinado):               0.69 → 0.67, y las 12 barras
    //     inclinadas que el fix de vecxz acababa de dejar en ~1.0 se van a
    //     1.2–2.5 (B23 1.49→2.51, B21 1.41→2.37, B17 1.22→2.07).
    // O sea: mejora donde se lo esperaba y empeora donde HAY OTRO ERROR abierto
    // (la losa Membrane se modela con flexión de placa completa, ver
    // _SLAB_MEMBRANE_BENDING_MODIFIER en inputs.py). Atar mejor las vigas a una
    // losa demasiado rígida amplifica ese error. Encenderlo hoy sería congelar
    // una regresión causada por otra cosa.
    //
    // Se enciende con:
    //   cadSystem.seismicConfig.meshBeamsAtIntersections = true
    //
    // El mapa queda en `this._frameMeshMap` para que el módulo de diagramas
    // pueda volver a unir los sub-tramos en su barra (ver mergeMeshedFrameForces
    // en frameForceBackend.js). Mismo patrón que `_seismicCaseSkips`.
    const meshOn =
      cfg.meshBeamsAtIntersections ?? this.seismicConfig?.meshBeamsAtIntersections ?? false;

    // Malla de MURO pedida para ESTE payload. Va de la mano con `meshOn` porque
    // son la misma cosa: con la malla 1x1 del motor un muro no genera ningun
    // nudo intermedio, asi que no hay DONDE atarlo a la viga.
    //
    // Solo el modulo de diagramas manda estas dos; el pipeline sismico no, y el
    // motor sigue con su `_WALL_TARGET_ELEMENT_SIZE_M = 6.0`, que esta
    // calibrado contra los periodos. Ver `_wall_mesh_target` en inputs.py.
    const wallMeshSize = meshOn
      ? Number(cfg.wallMeshSize ?? this.seismicConfig?.wallMeshSize ?? WALL_MESH_SIZE_DIAGRAMAS_M)
      : 0;

    let elementsOut = elemList;
    let memberLoadsOut = memberLoads;
    this._frameMeshMap = null;

    if (meshOn) {
      // Adelantarle al motor los nudos de la grilla de muro que caen sobre una
      // viga. El motor REUSA por coordenada (`node_lookup` en
      // _build_wall_mesh_plan), asi que el panel queda cosido ahi, y
      // splitBeamsAtInteriorNodes parte la viga en esos mismos nudos.
      if (wallMeshSize > 0 && walls.length) {
        const nuevosNudosMuro = wallGridPointsOnBeams(walls, nodeListConnected, elemList, {
          objetivo: wallMeshSize,
          capX: 12,
          capY: 8, // mismos topes que `_wall_mesh_target` con override
        });

        if (nuevosNudosMuro.length) {
          let siguienteIdNudo =
            nodeListConnected.reduce((m, n) => Math.max(m, Number(n.id) || 0), 0) + 1;

          nuevosNudosMuro.forEach((q) => {
            const nodo = {
              id: siguienteIdNudo,
              x: q.x,
              y: q.y,
              z: q.z,
              mass_x: 0,
              mass_y: 0,
              mass_z: 0,
            };
            siguienteIdNudo += 1;
            nodeListConnected.push(nodo);

            // A cota de piso entra al diafragma, como cualquier punto del
            // entrepiso en ETABS. Sin esto queda suelto en el plano.
            diaphragms.forEach((g) => {
              if (Array.isArray(g?.nodeIds) && Math.abs(Number(g.z) - q.z) < 1e-6) {
                g.nodeIds.push(nodo.id);
              }
            });
          });

          console.log(
            `\u{1F9F1} Nudos de malla de muro sobre vigas: ${nuevosNudosMuro.length} ` +
              `(objetivo ${wallMeshSize} m).`,
          );
        }
      }

      const meshed = splitBeamsAtInteriorNodes(nodeListConnected, elemList, memberLoads);
      if (meshed.stats.split) {
        elementsOut = meshed.elements;
        memberLoadsOut = meshed.memberLoads;
        this._frameMeshMap = meshed.mesh;
        console.log(
          `🕸️ Mallado en intersecciones: ${meshed.stats.split} viga(s) partidas → ` +
          `${elementsOut.length} elementos (antes ${elemList.length}).`,
        );
      }
    }

    const payload = {
      nodes: nodeListConnected,
      elements: elementsOut,
      walls,

      // Solo viaja cuando el mallado esta encendido (modulo de diagramas). Sin
      // el campo, el motor usa su tamano calibrado y NADA cambia.
      ...(wallMeshSize > 0 ? { wallMeshSize } : {}),

      // Losas que el motor malla con ShellMITC4. `meshAsShell` viene decidido
      // desde acá (ver _buildSeismicSlabsForPayload); `slabShellMode` va
      // igual para que el motor pueda reportar bajo qué criterio corrió.
      slabs,
      slabShellMode,

      // Techo METÁLICO como solo masa: reubica la masa de los nudos exclusivos
      // del acero a las cabezas de columna. DEFAULT FALSE (fiel a ETABS, que
      // conserva la masa del techo y muestra su modo local). Activarlo sirve
      // para leer mejor los modos de un tijeral metálico:
      //   cadSystem.seismicConfig.steelRoofMassOnly = true
      // Ver _lump_steel_roof_mass_to_supports en inputs.py y el comparador
      // python-backend/comparar_steel_roof.py.
      steelRoofMassOnly:
        cfg.steelRoofMassOnly ?? this.seismicConfig?.steelRoofMassOnly ?? false,


      // Nudos excluidos de TODO diafragma rígido (losa inclinada = semi-rígido).
      noDiaphragmNodes,

      // Que el MOTOR tampoco invente diafragmas por Z cuando no llega ninguno.
      autoDiaphragms,

      supports,

      loads: loadsRemapped,
      // Cargas sobre el elemento (eleLoad). Solo las consume el módulo de
      // diagramas de fuerzas; el resto del motor las ignora.
      memberLoads: memberLoadsOut,
      member_loads: memberLoadsOut,
      loadPatterns,
      load_patterns: loadPatterns,

      useRigidDiaphragms: cfg.useRigidDiaphragms ?? true,
      // Diafragma rígido CON rotación (ops.rigidDiaphragm, amarra UX+UY+RZ) ->
      // captura el modo torsional. DEFAULT TRUE: la deriva del motor ahora se calcula
      // como CQC de las derivas modales por línea de nodos (no resta de promedios),
      // así que rigidDiaphragm da derivas correctas (validado vs equalDOF y ETABS:
      // X dominante para SDX, +13% por torsión) Y captura la torsión (T3≈0.808s).
      // Para volver a equalDOF: cadSystem.seismicConfig.rigidDiaphragmRotation = false
      rigidDiaphragmRotation:
        cfg.rigidDiaphragmRotation ??
        this.seismicConfig?.rigidDiaphragmRotation ??
        true,
      diaphragms,

      // Pisos REALES del modelo (Base + niveles definidos) con sus nodos por
      // elevación, para que el motor calcule derivas sobre los pisos correctos
      // en vez de reconstruir un "piso" por cada Z distinto (bug de las 11
      // filas en un modelo de 2 pisos con techo de armadura).
      stories: this._buildSeismicStoriesForPayload(nodeListConnected),

      massSource,
      mass_source: massSource,

      analysis: {
        useRigidDiaphragms: cfg.useRigidDiaphragms ?? true,
        massSourceEnabled: massSource.enabled === true,
        massSourceName: massSource.name,
      },

      spectrum_x: cfg.spectrumX,
      num_modes: cfg.numModes,
      combination: cfg.combination,
      damping_ratio: cfg.dampingRatio,
      sa_in_g: cfg.saInG,
      g: cfg.g,

      // Torsión accidental E.030 (opt-in). 0 = desactivada.
      // Viene del "Ecc. Ratio (All Diaph.)" del CASO RS (como ETABS ECCENRATIOTYPICAL),
      // no de un control global → una sola fuente de verdad, por caso.
      accidentalEccentricity: Number(cfg.eccRatio) || 0,
      // Método de torsión accidental:
      //  - "additive" (default): torque estático por modo — es el algoritmo
      //    interno de ETABS para casos RS; validado a ±3% vs ETABS en modelo
      //    simétrico e irregular (2026-07-16).
      //  - "both": máximo entre CM±e y aditivo — envolvente conservadora
      //    (+5-10% sobre ETABS en plantas irregulares, nunca por debajo).
      //  - "cm": solo CM±e (sufre cancelación CQC cuando el modo traslacional
      //    y el torsional tienen frecuencias cercanas).
      // Cambiar desde consola:
      //   cadSystem._initSeismic?.(); cadSystem.seismicConfig.accidentalTorsionMethod = "both"
      accidentalTorsionMethod:
        cfg.accidentalTorsionMethod ||
        this.seismicConfig?.accidentalTorsionMethod ||
        "additive",
    };

    if (cfg.spectrumY && cfg.spectrumY.length > 0) {
      payload.spectrum_y = cfg.spectrumY;
    }

    console.log("📤 Payload sísmico Motor A:", {
      nodes: payload.nodes.length,
      elements: payload.elements.length,
      supports: payload.supports.length,
      loads: payload.loads?.length || 0,
      loadPatterns: payload.loadPatterns || [],

      useRigidDiaphragms: payload.useRigidDiaphragms,
      diaphragms: payload.diaphragms,

      massSource: payload.massSource,
      massSourceEnabled: payload.massSource?.enabled,
      massSourcePatterns: payload.massSource?.loadPatterns?.length || 0,
    });

    this.seismicLastPayload = this._cloneForSeismicPayload(payload, payload);
    window.jhackSeismicLastPayload = this.seismicLastPayload;

    return payload;
  },

  // ════════════════════════════════════════════════════════════════════════
  //  Losas → masa sísmica de piso (D — losas en el análisis sísmico)
  // ════════════════════════════════════════════════════════════════════════

  // Área en planta de un polígono (fórmula del zapatero / shoelace) sobre x,y.
  _planArea(points = []) {
    if (!Array.isArray(points) || points.length < 3) return 0;
    let s = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      s += (Number(a.x) || 0) * (Number(b.y) || 0) - (Number(b.x) || 0) * (Number(a.y) || 0);
    }
    return Math.abs(s) / 2;
  },

  // Devuelve el nodo canónico (de this.nodes) referenciado por un frame, tanto
  // si node1/node2 es el objeto nodo como si es solo un id.
  _resolveMassNode(ref) {
    if (ref == null) return null;
    const id = typeof ref === "object" ? ref.id : ref;
    const found = (this.nodes || []).find((n) => String(n.id) === String(id));
    if (found) return found;
    return typeof ref === "object" ? ref : null;
  },

  // Coordenadas {x,y,z} de un nodo (soporta position:{} o x/y/z planos).
  _massNodeCoord(n) {
    const p = n && n.position ? n.position : n;
    return { x: Number(p?.x) || 0, y: Number(p?.y) || 0, z: Number(p?.z) || 0 };
  },

  // Densidad (kg/m³) del material por nombre. Los materiales por defecto
  // (CONC/STEEL) están en unidades kip-in (valores ~1e-7) que NO son kg/m³;
  // en ese caso se usa el fallback. massPerUnitVolume puede venir como string.
  _materialDensityKg(name, fallback) {
    const mats = this.materialProperties?.materials || [];
    const mat = name ? mats.find((m) => String(m.name) === String(name)) : null;
    const rho = Number(mat?.massPerUnitVolume);
    if (!Number.isFinite(rho) || rho < 50) return Number(fallback) || 2400;
    return rho;
  },

  // Densidad de respaldo (kg/m³) por tipo de sección: acero para perfiles
  // metálicos (W, canal, ángulo, tubo), concreto para el resto.
  _fallbackDensityForSection(frame, concreteDensity) {
    const t = String(frame?.frameSection?.type || frame?.frameSection?.sectionType || frame?.section?.type || "").toLowerCase();
    if (t === "wf" || t === "channel" || t === "angle" || t === "tube") return 7850;
    return Number(concreteDensity) || 2400;
  },

  // ¿El nodo está restringido lateralmente en X e Y (apoyo de base)? Su masa no
  // participa en la respuesta sísmica horizontal, así que no se le asigna.
  _isLaterallyRestrained(n) {
    const r = n?.restraints || n?.constraints;
    if (r && typeof r === "object") return !!(r.ux && r.uy);
    const s = n?.soporte;
    return s === "soporteUno" || s === "soporteDos"; // empotrado o articulado
  },

  // ─── Utilidades ────────────────────────────────────────────────────────────
  _getTotalModelMass() {
    return (this.nodes || []).reduce((sum, n) => {
      return sum + Number(n.mass_x ?? n.mass?.x ?? n.mass ?? 0);
    }, 0);
  },

  // Estima la masa sísmica que generará el motor (flujo ETABS): masas nodales
  // almacenadas + masa de las cargas de área × factor del patrón. El peso propio
  // (Element Self Mass) lo añade el motor, así que solo se marca como bandera.
  _estimateSeismicMassKg() {
    const g = 9.81;
    const ms = (typeof this._normalizeSeismicMassSource === "function")
      ? this._normalizeSeismicMassSource(this.massSource)
      : (this.massSource || {});
    const stored = this._getTotalModelMass();
    const enabled = ms.enabled !== false;

    // Factor del patrón (con alias CM↔DEAD, CV↔LIVE).
    const factorFor = (name) => {
      const n = String(name || "").toUpperCase();
      const pats = ms.loadPatterns || [];
      const find = (k) => {
        const p = pats.find((p) => String(p.name || "").toUpperCase() === k);
        return p ? (Number(p.factor) || 0) : null;
      };
      let f = find(n);
      if (f == null) {
        if (n === "CM") f = find("DEAD");
        else if (n === "CV") f = find("LIVE");
        else if (n === "DEAD") f = find("CM");
        else if (n === "LIVE") f = find("CV");
      }
      return f || 0;
    };

    let fromLoads = 0;
    if (enabled && typeof this._buildSeismicAreaLoadsForPayload === "function") {
      const areaLoads = this._buildSeismicAreaLoadsForPayload(this.areas || []);
      for (const l of areaLoads) {
        fromLoads += (Math.abs(Number(l.fz) || 0) * factorFor(l.loadCase)) / g;
      }
    }

    const hasSelfWeight = enabled && !!(ms.includeSelfWeight ?? ms.elementSelfMass);
    return { stored, fromLoads, hasSelfWeight, total: stored + fromLoads };
  },

  // ¿El análisis tendrá masa? (cualquiera de las fuentes: nodal, área, peso propio)
  _willHaveSeismicMass() {
    const est = this._estimateSeismicMassKg();
    return est.total > 0 || est.hasSelfWeight;
  },
};
