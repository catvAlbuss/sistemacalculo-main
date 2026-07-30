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
    const areas = Array.isArray(this.areas) ? this.areas : [];
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

    // Asignaciones explícitas del usuario (joint directo + áreas) mandan; sin
    // ninguna, se cae al agrupado automático por piso (siguiendo la losa).
    const explicit = this.getExplicitDiaphragmGroups(nodes);

    if (explicit.length) {
      return explicit;
    }

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
      distributeToStoryNodes: true,
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
      distributeToStoryNodes: raw.distributeToStoryNodes !== false,
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

    const sources = [
      this.sections,
      this.frameSections,
      this.sectionDefinitions,
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

      material: {
        name: materialName,
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

    if (name.includes("ROOF")) {
      return "RoofLive";
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
    const slabs = (areas || []).filter(
      (a) => Array.isArray(a?.points) && a.points.length >= 3,
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
          });
        }
      }
    }
    return out;
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

  _buildSeismicFrameEquivalentLoadsForPayload(frames = []) {
    const loads = [];

    (frames || []).forEach((frame) => {
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

      uniqueLoads.forEach((rawLoad, index) => {
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

  // Vector vecxz (orientación del eje local) por elemento, para el motor.
  //  - Columnas (verticales): [0,1,0] → eje fuerte Iz resiste X (calibrado vs ETABS).
  //  - Vigas (horizontales): perpendicular horizontal a la viga → quedan "paradas"
  //    (peralte vertical), usando su Iz fuerte en el plano vertical del pórtico.
  //  - Inclinados/diagonales: null → que el motor auto-oriente.
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
    if (vert < 0.1) {
      const hx = dy, hy = -dx;           // perpendicular horizontal a la viga
      const hl = Math.hypot(hx, hy) || 1;
      return [hx / hl, hy / hl, 0];      // viga "parada"
    }
    return null; // inclinado → auto
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

    const elemList = frames.map(f => {
      const sec = f.frameSection || f.section || {};
      // D1: E/G se resuelven desde el MATERIAL referenciado por la sección
      // (con conversión MPa→Pa). A/Iz/Iy/J desde la sección si existen.
      const { E, G } = this._resolveFrameMaterial(sec, f);
      const A = Number(sec.A || sec.area || f.A || 0.01);   // m²
      const Iz = Number(sec.Iz || sec.iz || sec.I33 || f.Iz || 1e-4);  // m⁴
      const Iy = Number(sec.Iy || sec.iy || sec.I22 || f.Iy || 1e-4);  // m⁴
      const J = Number(sec.J || sec.torsional || f.J || 1e-6);      // m⁴

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

        unitWeight: physical.unitWeight,
        unit_weight: physical.unit_weight,
        unitWeightNPerM3: physical.unitWeightNPerM3,

        materialName: physical.materialName,
        sectionName: physical.sectionName,

        material: physical.material,
        section: physical.section,
      };
    });

    const _soporteToRestraints = (soporte) => {
      if (soporte === "soporteUno") return { ux: 1, uy: 1, uz: 1, rx: 1, ry: 1, rz: 1 };
      if (soporte === "soporteDos") return { ux: 1, uy: 1, uz: 1, rx: 0, ry: 0, rz: 0 };
      if (soporte === "soporteTres") return { ux: 0, uy: 0, uz: 1, rx: 0, ry: 0, rz: 0 };

      return { ux: 0, uy: 0, uz: 0, rx: 0, ry: 0, rz: 0 };
    };

    const supports = nodes
      .filter(n => n.restraints || n.constraints || n.soporte)
      .map(n => {
        const r = n.restraints || n.constraints || _soporteToRestraints(n.soporte);

        return {
          node: Number(n.id),
          ux: r.ux ? 1 : 0,
          uy: r.uy ? 1 : 0,
          uz: r.uz ? 1 : 0,
          rx: r.rx ? 1 : 0,
          ry: r.ry ? 1 : 0,
          rz: r.rz ? 1 : 0,
        };
      });

    const diaphragms = this._buildSeismicDiaphragms(cfg, nodes);
    const massSource = this._buildSeismicMassSourceForPayload();

    // B10.4 — Cargas normalizadas
    let loads = [];

    try {
      if (typeof this._buildSeismicLoadsForPayload === "function") {
        loads = this._buildSeismicLoadsForPayload(nodes);
        const frameEquivalentLoads = this._buildSeismicFrameEquivalentLoadsForPayload(frames);
        const frameSelfWeightLoads = this._buildSeismicFrameSelfWeightForPayload(frames);
        const areaLoads = this._buildSeismicAreaLoadsForPayload(this.areas || []);
        loads = [...loads, ...frameEquivalentLoads, ...frameSelfWeightLoads, ...areaLoads];

        console.log("🔎 Peso propio de frames (columnas/vigas) para reacciones estáticas:", {
          frameSelfWeightLoadsCount: frameSelfWeightLoads.length,
        });

        console.log("🔎 Cargas de área (losas) para masa sísmica:", {
          areaLoadsCount: areaLoads.length,
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

    const payload = {
      nodes: nodeList,
      elements: elemList,
      supports,

      loads,
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
