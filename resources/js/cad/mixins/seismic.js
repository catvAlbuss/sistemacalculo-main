/**
 * @mixin seismicMixin
 *
 * Análisis sísmico espectral (RSA) integrado con el backend Python/OpenSeesPy.
 *
 * Métodos públicos:
 *   openSeismicAnalysisDialog()   → diálogo principal de configuración y ejecución
 *   importSeismicSpectrum(dir)    → importar espectro desde archivo TXT/XLS
 *   runSeismicAnalysis()          → ejecutar el análisis sísmico completo
 *   showSeismicResults(result)    → mostrar tabla de resultados modales
 */

import Swal from "sweetalert2";
import {
  startBabylonSeismicAnimation,
  stopBabylonSeismicAnimation,
  isBabylonSeismicAnimating,
  setSeismicAnimationSpeed,
} from "../3d/viewer3d.js";

const BACKEND_URL = "http://localhost:5001";

export const seismicMixin = {

  // ─── Estado sísmico ────────────────────────────────────────────────────────
  _initSeismic() {
    if (this.seismicConfig) return;
    this.seismicConfig = {
      spectrumX: [],     // [{T, Sa}]
      spectrumY: [],     // [{T, Sa}] — opcional
      numModes: 6,
      combination: "CQC",
      dampingRatio: 0.05,
      saInG: true,
      g: 9.81,
      direction: "both", // "x", "y", "both"
      animScale: 100,    // factor de escala visual para animación sísmica
      useRigidDiaphragms: true, // agrupar nodos por piso como diafragma rígido tipo ETABS
    };
    this.seismicResults = null;
    this.seismicAnimationActive = false;
  },

  // ─── Dialogo principal ─────────────────────────────────────────────────────
  async openSeismicAnalysisDialog() {
    this._initSeismic();

    const cfg = this.seismicConfig;

    const html = `
      <div style="font-family:monospace; font-size:13px; text-align:left; max-width:500px">

        <!-- Espectros -->
        <fieldset style="border:1px solid #555; border-radius:6px; padding:10px 14px; margin-bottom:12px">
          <legend style="padding:0 6px; color:#7eb8f7; font-size:12px; font-weight:600">Espectros de Diseño</legend>

          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
            <label style="width:90px; color:#ccc">Dirección X:</label>
            <span id="spx-label" style="flex:1; color:${cfg.spectrumX.length ? '#7fc77f' : '#aaa'}">
              ${cfg.spectrumX.length ? `${cfg.spectrumX.length} puntos cargados` : 'Sin espectro'}
            </span>
            <button id="btn-import-x" style="background:#2d5a8e; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px">
              Importar...
            </button>
          </div>

          <div style="display:flex; gap:8px; align-items:center">
            <label style="width:90px; color:#ccc">Dirección Y:</label>
            <span id="spy-label" style="flex:1; color:${cfg.spectrumY.length ? '#7fc77f' : '#aaa'}">
              ${cfg.spectrumY.length ? `${cfg.spectrumY.length} puntos cargados` : 'Usar mismo que X'}
            </span>
            <button id="btn-import-y" style="background:#2d5a8e; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px">
              Importar...
            </button>
          </div>
        </fieldset>

        <!-- Parámetros modales -->
        <fieldset style="border:1px solid #555; border-radius:6px; padding:10px 14px; margin-bottom:12px">
          <legend style="padding:0 6px; color:#7eb8f7; font-size:12px; font-weight:600">Parámetros Modales</legend>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px">
            <div>
              <label style="color:#ccc; font-size:12px">Nº de modos:</label>
              <input id="seis-modes" type="number" min="1" max="30" value="${cfg.numModes}"
                style="width:100%; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; margin-top:3px">
            </div>
            <div>
              <label style="color:#ccc; font-size:12px">Amortiguamiento (ζ):</label>
              <input id="seis-damp" type="number" min="0.01" max="0.5" step="0.01" value="${cfg.dampingRatio}"
                style="width:100%; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; margin-top:3px">
            </div>
            <div>
              <label style="color:#ccc; font-size:12px">Combinación modal:</label>
              <select id="seis-combo" style="width:100%; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; margin-top:3px">
                <option value="CQC" ${cfg.combination === 'CQC' ? 'selected' : ''}>CQC</option>
                <option value="SRSS" ${cfg.combination === 'SRSS' ? 'selected' : ''}>SRSS</option>
              </select>
            </div>
            <div>
              <label style="color:#ccc; font-size:12px">Dirección sismo:</label>
              <select id="seis-dir" style="width:100%; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; margin-top:3px">
                <option value="both" ${cfg.direction === 'both' ? 'selected' : ''}>X e Y</option>
                <option value="x"    ${cfg.direction === 'x' ? 'selected' : ''}>Solo X</option>
                <option value="y"    ${cfg.direction === 'y' ? 'selected' : ''}>Solo Y</option>
              </select>
            </div>
          </div>

          <div style="margin-top:8px; display:flex; gap:16px; align-items:center; flex-wrap:wrap">
            <label style="color:#ccc; font-size:12px; display:flex; align-items:center; gap:6px">
              <input id="seis-ing" type="checkbox" ${cfg.saInG ? 'checked' : ''}> Sa en [g]
            </label>

            <label style="color:#ccc; font-size:12px">g =
              <input id="seis-g" type="number" min="1" max="20" step="0.01" value="${cfg.g}"
                style="width:70px; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px 5px">
              m/s²
            </label>

            <label style="color:#ccc; font-size:12px; display:flex; align-items:center; gap:6px">
              <input id="seis-rigid-diaphragms" type="checkbox" ${cfg.useRigidDiaphragms ? 'checked' : ''}>
              Diafragma rígido por piso
            </label>
          </div>
        </fieldset>

        <!-- Masas: resumen rápido -->
        <div id="seis-mass-info" style="color:#aaa; font-size:11px; padding:6px 10px; background:#1e293b; border-radius:4px">
          Leyendo masas del modelo...
        </div>
      </div>
    `;

    const result = await Swal.fire({
      title: "Análisis Sísmico Espectral",
      html,
      width: 580,
      background: "#1a2035",
      color: "#e2e8f0",
      showCancelButton: true,
      confirmButtonText: "Ejecutar Análisis",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1d4ed8",
      didOpen: () => {
        // Mostrar resumen de masas
        const massInfo = document.getElementById("seis-mass-info");
        const totalMass = this._getTotalModelMass();
        if (massInfo) {
          massInfo.textContent = totalMass > 0
            ? `Masa total del modelo: ${totalMass.toFixed(2)} kg (${(this.nodes || []).filter(n => (n.mass || n.mass_x || 0) > 0).length} nodos con masa)`
            : "Advertencia: Ningún nodo tiene masa asignada. Asigna masas en Assign > Assign Masses antes de correr el análisis sísmico.";
          massInfo.style.color = totalMass > 0 ? "#86efac" : "#fbbf24";
        }

        // Botones de importar espectro
        document.getElementById("btn-import-x")?.addEventListener("click", async (e) => {
          e.preventDefault();
          const data = await this._pickAndParseSpectrum("X");
          if (data) {
            this.seismicConfig.spectrumX = data;
            const el = document.getElementById("spx-label");
            if (el) { el.textContent = `${data.length} puntos cargados`; el.style.color = "#7fc77f"; }
          }
        });

        document.getElementById("btn-import-y")?.addEventListener("click", async (e) => {
          e.preventDefault();
          const data = await this._pickAndParseSpectrum("Y");
          if (data) {
            this.seismicConfig.spectrumY = data;
            const el = document.getElementById("spy-label");
            if (el) { el.textContent = `${data.length} puntos cargados`; el.style.color = "#7fc77f"; }
          }
        });
      },
      preConfirm: () => {
        return {
          numModes: parseInt(document.getElementById("seis-modes")?.value) || 6,
          dampingRatio: parseFloat(document.getElementById("seis-damp")?.value) || 0.05,
          combination: document.getElementById("seis-combo")?.value || "CQC",
          direction: document.getElementById("seis-dir")?.value || "both",
          saInG: document.getElementById("seis-ing")?.checked ?? true,
          g: parseFloat(document.getElementById("seis-g")?.value) || 9.81,
          useRigidDiaphragms: document.getElementById("seis-rigid-diaphragms")?.checked ?? true,
        };
      },
    });

    if (!result.isConfirmed) return;

    // Guardar config
    Object.assign(this.seismicConfig, result.value);

    if (!this.seismicConfig.spectrumX.length) {
      await Swal.fire({
        icon: "warning",
        title: "Falta espectro X",
        text: "Importa al menos el espectro de dirección X antes de ejecutar.",
        background: "#1a2035", color: "#e2e8f0",
      });
      return;
    }

    await this.runSeismicAnalysis();
  },

  // ─── Importar espectro desde archivo ──────────────────────────────────────
  async _pickAndParseSpectrum(label) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.csv,.xls,.xlsx";

      input.addEventListener("change", async () => {
        const file = input.files[0];
        if (!file) return resolve(null);

        Swal.showLoading?.();

        try {
          const formData = new FormData();
          formData.append("file", file);

          const resp = await fetch(`${BACKEND_URL}/api/seismic/parse-spectrum`, {
            method: "POST",
            body: formData,
          });
          const json = await resp.json();

          if (json.success) {
            this.showMessage?.(`Espectro ${label}: ${json.count} puntos importados desde "${file.name}"`, "success");
            resolve(json.spectrum);  // [{T, Sa}]
          } else {
            this.showMessage?.(`Error al leer el espectro: ${json.error}`, "error");
            resolve(null);
          }
        } catch (err) {
          const isOffline = err.message?.includes("Failed to fetch") || err.message?.includes("ERR_CONNECTION_REFUSED");
          if (isOffline) {
            Swal.fire({
              icon: "error",
              title: "Backend no disponible",
              html: `El servidor Python no está corriendo.<br><br>
                <code style="background:#0f172a;padding:6px 10px;border-radius:4px;font-size:12px;display:block;text-align:left">
                  cd python-backend<br>
                  venv\\Scripts\\python app.py
                </code>`,
              background: "#1a2035", color: "#e2e8f0",
            });
          } else {
            this.showMessage?.(`Error de conexión: ${err.message}`, "error");
          }
          resolve(null);
        } finally {
          Swal.hideLoading?.();
        }
      });

      input.click();
    });
  },

  // ─── Ejecutar análisis sísmico ─────────────────────────────────────────────
  async runSeismicAnalysis() {
    this._initSeismic();
    const cfg = this.seismicConfig;

    // Validaciones previas
    const nodes = (this.nodes || []);
    if (nodes.length === 0) {
      this.showMessage?.("El modelo no tiene nodos.", "error");
      return;
    }
    const frames = (this.shapes || []).filter(f => f?.node1 && f?.node2);
    if (frames.length === 0) {
      this.showMessage?.("El modelo no tiene elementos.", "error");
      return;
    }
    const totalMass = this._getTotalModelMass();
    if (totalMass <= 0) {
      const cont = await Swal.fire({
        icon: "warning",
        title: "Sin masas definidas",
        html: "Ningún nodo tiene masa asignada.<br>El análisis sísmico requiere masas.<br><br>¿Continuar de todas formas?",
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
        background: "#1a2035", color: "#e2e8f0",
      });
      if (!cont.isConfirmed) return;
    }

    // Progreso
    Swal.fire({
      title: "Ejecutando Análisis Sísmico...",
      html: "<div style='color:#94a3b8'>Análisis modal + espectro de respuesta (RSA)</div>",
      allowOutsideClick: false,
      background: "#1a2035", color: "#e2e8f0",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = this._buildSeismicPayload(cfg, nodes, frames);
      const resp = await fetch(`${BACKEND_URL}/api/seismic/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await resp.json();

      Swal.close();

      if (!result.success) {
        await Swal.fire({
          icon: "error",
          title: "Error en análisis sísmico",
          text: result.error || "Error desconocido",
          background: "#1a2035", color: "#e2e8f0",
        });
        return;
      }

      this.seismicResults = result;
      this._applySeismicResultsToModel(result);
      await this.showSeismicResults(result);

    } catch (err) {
      Swal.close();
      const isOffline = err.message?.includes("Failed to fetch") || err.message?.includes("ERR_CONNECTION_REFUSED");
      await Swal.fire({
        icon: "error",
        title: isOffline ? "Backend no disponible" : "Error de conexión",
        html: isOffline
          ? `El servidor Python (localhost:5001) no está corriendo.<br><br>
              <code style="background:#0f172a;padding:6px 10px;border-radius:4px;font-size:12px;display:block;text-align:left">
                cd python-backend<br>
                venv\\Scripts\\python app.py
              </code>`
          : `No se pudo conectar al backend Python.<br><small style="color:#94a3b8">${err.message}</small>`,
        background: "#1a2035", color: "#e2e8f0",
      });
    }
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

  _buildExplicitDiaphragmsFromNodes(nodes) {
    const groups = new Map();

    (nodes || []).forEach((node) => {
      const diaphragmId = this._getNodeDiaphragmIdForSeismic(node);
      if (!diaphragmId) return;

      const nodeId = Number(node.id);
      if (!Number.isFinite(nodeId)) return;

      if (!groups.has(diaphragmId)) {
        groups.set(diaphragmId, {
          id: String(diaphragmId),
          source: "node_assignment",
          nodeIds: [],
          z: this._getNodeZForSeismic(node),
        });
      }

      groups.get(diaphragmId).nodeIds.push(nodeId);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        nodeIds: [...new Set(group.nodeIds)].sort((a, b) => a - b),
      }))
      .filter((group) => group.nodeIds.length >= 2);
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

    const groups = [];

    validNodes.forEach((node) => {
      // No crear diafragma automático en la base.
      if (Math.abs(node.z - minZ) <= tolerance) return;

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

  _buildSeismicDiaphragms(cfg, nodes) {
    const useRigidDiaphragms = cfg?.useRigidDiaphragms ?? true;

    if (!useRigidDiaphragms) return [];

    const explicit = this._buildExplicitDiaphragmsFromNodes(nodes);

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

    return {
      id: rawLoad.id || `LOAD_${nodeId || "N"}_${index + 1}`,

      node: nodeId,
      nodeId,

      fx: Number.isFinite(fx) ? fx : 0,
      fy: Number.isFinite(fy) ? fy : 0,
      fz: Number.isFinite(fz) ? fz : 0,

      mx: Number.isFinite(mx) ? mx : 0,
      my: Number.isFinite(my) ? my : 0,
      mz: Number.isFinite(mz) ? mz : 0,

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

      const A = Number(sec.A || sec.area || f.A || 0.01);
      const E = Number(sec.E || sec.elasticModulus || f.E || 200e9);
      const G = Number(sec.G || sec.shearModulus || f.G || 77e9);
      const Iz = Number(sec.Iz || sec.iz || sec.I33 || f.Iz || 1e-4);
      const Iy = Number(sec.Iy || sec.iy || sec.I22 || f.Iy || 1e-4);
      const J = Number(sec.J || sec.torsional || f.J || 1e-6);

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

      return {
        id: Number(f.id),
        node_i: Number(f.node1.id),
        node_j: Number(f.node2.id),

        A, E, G, Iz, Iy, J,

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
        loads = [...loads, ...frameEquivalentLoads];

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

  // ─── Aplicar resultados al modelo CAD ────────────────────────────────────
  _applySeismicResultsToModel(result) {
    const envelope = result.envelope?.by_node || {};

    (this.nodes || []).forEach(n => {
      const nid = Number(n.id);
      const env = envelope[nid];
      if (!env) return;

      n.seismicDisplacement = {
        dx: env.dx, dy: env.dy, dz: env.dz,
      };
      // Magnitud para visualización de deflexión
      n.seismicDeflection = Math.sqrt(env.dx ** 2 + env.dy ** 2 + env.dz ** 2);
    });

    this.redraw?.();
    this.showMessage?.("Análisis sísmico completado. Resultados guardados en el modelo.", "success");
  },

  // ============================================================
  // B8 — VISOR DE RESULTADOS TIPO ETABS
  // ============================================================

  async openLastEtabsSeismicResultsDialog() {
    const result =
      this.seismicResults ||
      this.analysisResults?.seismic ||
      null;

    if (!result?.etabs_results) {
      this.showMessage?.("No hay resultados sísmicos tipo ETABS disponibles. Ejecuta primero el análisis.", "warning");
      console.warn("No hay resultados etabs_results disponibles:", result);
      return;
    }

    return this.openEtabsSeismicResultsDialog(result);
  },

  _getEtabsResultsPackage(result = null) {
    return (
      result?.etabs_results ||
      this.seismicResults?.etabs_results ||
      this.analysisResults?.seismic?.etabs_results ||
      null
    );
  },

  _formatEtabsCellValue(value) {
    if (value === null || value === undefined) return "";

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    }

    if (typeof value === "number") {
      if (!Number.isFinite(value)) return "";

      const abs = Math.abs(value);

      if (abs !== 0 && abs < 0.000001) {
        return value.toExponential(4);
      }

      if (abs >= 1000000) {
        return value.toExponential(4);
      }

      return Number(value.toFixed(6)).toString();
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (error) {
        return String(value);
      }
    }

    return String(value);
  },

  _humanizeEtabsColumnName(key) {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace("Kg", "kg")
      .replace("Kn", "kN")
      .replace("Hz", "Hz")
      .replace("Ux", "UX")
      .replace("Uy", "UY")
      .replace("Mx", "MX")
      .replace("My", "MY")
      .replace("Mz", "MZ")
      .replace("Rad S", "rad/s");
  },

  _buildEtabsTableHtml(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return `
        <div style="padding:18px; color:#94a3b8; font-size:12px; text-align:center;">
          No hay datos para mostrar en esta tabla.
        </div>
      `;
    }

    const columns = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row || {}).forEach((key) => set.add(key));
        return set;
      }, new Set())
    );

    const thead = columns
      .map((column) => {
        return `
          <th style="
            position:sticky;
            top:0;
            z-index:2;
            background:#111827;
            color:#e5e7eb;
            border:1px solid #334155;
            padding:6px 8px;
            white-space:nowrap;
            text-align:center;
            font-weight:600;
          ">
            ${this._humanizeEtabsColumnName(column)}
          </th>
        `;
      })
      .join("");

    const tbody = rows
      .map((row, rowIndex) => {
        const bg = rowIndex % 2 === 0 ? "#020617" : "#0f172a";

        return `
          <tr style="background:${bg};">
            ${columns
            .map((column) => {
              return `
                  <td style="
                    border:1px solid #334155;
                    padding:5px 8px;
                    white-space:nowrap;
                    color:#dbeafe;
                    text-align:${typeof row?.[column] === "number" ? "right" : "left"};
                  ">
                    ${this._formatEtabsCellValue(row?.[column])}
                  </td>
                `;
            })
            .join("")}
          </tr>
        `;
      })
      .join("");

    return `
      <div style="
        max-height:420px;
        overflow:auto;
        border:1px solid #334155;
        border-radius:6px;
        background:#020617;
      ">
        <table style="
          width:100%;
          border-collapse:collapse;
          font-size:12px;
          font-family:Consolas, monospace;
        ">
          <thead>
            <tr>${thead}</tr>
          </thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    `;
  },

  _mapEtabsRowsForDisplay(rows = [], columns = []) {
    if (!Array.isArray(rows)) return [];

    return rows.map((row) => {
      const mapped = {};

      columns.forEach((column) => {
        const key = column.key;
        const label = column.label || key;

        mapped[label] = row?.[key] ?? "";
      });

      return mapped;
    });
  },

  _getEtabsResultsTableDefinitions(pkg) {
    const tables = pkg?.tables || {};

    const appliedLoadColumns = [
      { key: "row", label: "Row" },
      { key: "source", label: "Source" },
      { key: "assignment_type", label: "Assignment" },
      { key: "load_case", label: "Load Case" },
      { key: "load_type", label: "Type" },
      { key: "node", label: "Node" },
      { key: "frame", label: "Frame" },
      { key: "direction", label: "Dir" },
      { key: "fz_N", label: "FZ (N)" },
      { key: "vertical_weight_N", label: "Weight (N)" },
    ];

    const jointLoadColumns = [
      { key: "row", label: "Row" },
      { key: "node", label: "Node" },
      { key: "load_case", label: "Load Case" },
      { key: "load_type", label: "Type" },
      { key: "direction", label: "Dir" },
      { key: "fx_N", label: "FX (N)" },
      { key: "fy_N", label: "FY (N)" },
      { key: "fz_N", label: "FZ (N)" },
      { key: "vertical_weight_N", label: "Weight (N)" },
    ];

    const frameLoadColumns = [
      { key: "row", label: "Row" },
      { key: "frame", label: "Frame" },
      { key: "load_case", label: "Load Case" },
      { key: "load_type", label: "Type" },
      { key: "frame_load_type", label: "Frame Load" },
      { key: "direction", label: "Dir" },
      { key: "value_N", label: "P (N)" },
      { key: "w_N_m", label: "w (N/m)" },
      { key: "relative_distance", label: "Rel. Dist." },
      { key: "tributary_length_m", label: "Trib. L (m)" },
      { key: "equivalent_method", label: "Method" },
    ];

    const equivalentJointColumns = [
      { key: "row", label: "Row" },
      { key: "frame", label: "Frame" },
      { key: "node", label: "Node" },
      { key: "load_case", label: "Load Case" },
      { key: "load_type", label: "Type" },
      { key: "frame_load_kind", label: "Kind" },
      { key: "direction", label: "Dir" },
      { key: "fz_N", label: "FZ (N)" },
      { key: "vertical_weight_N", label: "Weight (N)" },
    ];

    const loadSummaryColumns = [
      { key: "row", label: "Row" },
      { key: "load_case", label: "Load Case" },
      { key: "source", label: "Source" },
      { key: "assignment", label: "Assignment" },
      { key: "count", label: "Count" },
      { key: "total_fx_N", label: "Total FX (N)" },
      { key: "total_fy_N", label: "Total FY (N)" },
      { key: "total_fz_N", label: "Total FZ (N)" },
      { key: "total_weight_N", label: "Total Weight (N)" },
    ];

    return [
      { id: "modal_periods", label: "Modal Periods", rows: tables.modal_periods || [] },
      { id: "participating_mass_ratios", label: "Participating Mass", rows: tables.participating_mass_ratios || [] },
      { id: "base_shear", label: "Base Shear", rows: tables.base_shear || [] },

      // B10.14 / B10.15 — Applied Loads tipo ETABS
      {
        id: "load_summary",
        label: "Load Summary",
        rows: this._mapEtabsRowsForDisplay(tables.load_summary || [], loadSummaryColumns),
      },
      {
        id: "applied_loads",
        label: "Applied Loads",
        rows: this._mapEtabsRowsForDisplay(tables.applied_loads || [], appliedLoadColumns),
      },
      {
        id: "joint_loads",
        label: "Joint Loads",
        rows: this._mapEtabsRowsForDisplay(tables.joint_loads || [], jointLoadColumns),
      },
      {
        id: "frame_loads",
        label: "Frame Loads",
        rows: this._mapEtabsRowsForDisplay(tables.frame_loads || [], frameLoadColumns),
      },
      {
        id: "equivalent_joint_loads",
        label: "Equivalent Joint Loads",
        rows: this._mapEtabsRowsForDisplay(tables.equivalent_joint_loads || [], equivalentJointColumns),
      },

      { id: "story_drifts", label: "Story Drifts", rows: tables.story_drifts || [] },
      { id: "story_shears", label: "Story Shears", rows: tables.story_shears || [] },
      { id: "mass_source", label: "Mass Source", rows: tables.mass_source || [] },
      { id: "effective_mass", label: "Effective Mass", rows: tables.effective_mass || [] },
      { id: "diaphragm_summary", label: "Diaphragms", rows: tables.diaphragm_summary || [] },
      { id: "model_quality", label: "Model Quality", rows: tables.model_quality || [] },
      { id: "element_properties", label: "Element Properties", rows: tables.element_properties || [] },
    ];
  },

  _buildEtabsResultsSummaryHtml(pkg) {
    const summary = pkg?.summary || {};

    const cards = [
      ["Base Shear X", summary.base_shear_x_N, "N"],
      ["Base Shear Y", summary.base_shear_y_N, "N"],
      ["Max Drift X", summary.max_drift_x_ratio, "ratio"],
      ["Max Drift Y", summary.max_drift_y_ratio, "ratio"],
      ["Eff. Mass X", summary.total_effective_mx_kg, "kg"],
      ["Eff. Mass Y", summary.total_effective_my_kg, "kg"],
      ["Modes", summary.modal_modes, ""],
      ["Stories", summary.stories, ""],
    ];

    return `
      <div style="
        display:grid;
        grid-template-columns:repeat(4, minmax(0, 1fr));
        gap:8px;
        margin-bottom:12px;
      ">
        ${cards
        .map(([label, value, unit]) => {
          return `
              <div style="
                background:#0f172a;
                border:1px solid #334155;
                border-radius:6px;
                padding:8px;
              ">
                <div style="color:#94a3b8; font-size:11px;">${label}</div>
                <div style="color:#e2e8f0; font-size:14px; font-weight:700;">
                  ${this._formatEtabsCellValue(value)}
                  <span style="font-size:10px; color:#94a3b8;">${unit}</span>
                </div>
              </div>
            `;
        })
        .join("")}
      </div>
    `;
  },

  // ============================================================
  // B9 — EXPORTACIÓN DE RESULTADOS TIPO ETABS
  // ============================================================

  _sanitizeEtabsFileName(value = "resultados_sismicos") {
    return String(value || "resultados_sismicos")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase();
  },

  _downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  },

  _escapeCsvCell(value) {
    if (value === null || value === undefined) return "";

    let text = "";

    if (Array.isArray(value)) {
      text = value.join(" | ");
    } else if (typeof value === "object") {
      try {
        text = JSON.stringify(value);
      } catch (error) {
        text = String(value);
      }
    } else {
      text = String(value);
    }

    if (/[",\n\r;]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  },

  _tableRowsToCsv(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return "Sin datos\n";
    }

    const columns = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row || {}).forEach((key) => set.add(key));
        return set;
      }, new Set())
    );

    const header = columns.map((column) => this._escapeCsvCell(column)).join(";");

    const body = rows
      .map((row) => {
        return columns
          .map((column) => this._escapeCsvCell(row?.[column]))
          .join(";");
      })
      .join("\n");

    return `${header}\n${body}`;
  },

  _buildEtabsResultsCsv(pkg) {
    const tables = pkg?.tables || {};
    const summary = pkg?.summary || {};

    const sections = [];

    sections.push("JHACK - REPORTE SISMICO TIPO ETABS");
    sections.push(`Generated At;${this._escapeCsvCell(pkg?.generated_at || "")}`);
    sections.push(`Status;${this._escapeCsvCell(pkg?.status || "")}`);
    sections.push(`Version;${this._escapeCsvCell(pkg?.version || "")}`);
    sections.push("");

    sections.push("SUMMARY");
    sections.push(this._tableRowsToCsv(
      Object.entries(summary).map(([key, value]) => ({
        item: key,
        value,
      }))
    ));
    sections.push("");

    const tableDefs = this._getEtabsResultsTableDefinitions(pkg);

    tableDefs.forEach((table) => {
      sections.push(`TABLE: ${table.label}`);
      sections.push(this._tableRowsToCsv(table.rows || []));
      sections.push("");
    });

    return sections.join("\n");
  },

  _escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  _buildPrintableEtabsTableHtml(title, rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return `
        <h2>${this._escapeHtml(title)}</h2>
        <p class="empty">Sin datos.</p>
      `;
    }

    const columns = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row || {}).forEach((key) => set.add(key));
        return set;
      }, new Set())
    );

    const thead = columns
      .map((column) => `<th>${this._escapeHtml(this._humanizeEtabsColumnName(column))}</th>`)
      .join("");

    const tbody = rows
      .map((row) => {
        return `
          <tr>
            ${columns
            .map((column) => {
              return `<td>${this._escapeHtml(this._formatEtabsCellValue(row?.[column]))}</td>`;
            })
            .join("")}
          </tr>
        `;
      })
      .join("");

    return `
      <h2>${this._escapeHtml(title)}</h2>
      <table>
        <thead>
          <tr>${thead}</tr>
        </thead>
        <tbody>${tbody}</tbody>
      </table>
    `;
  },

  _buildPrintableEtabsReportHtml(pkg) {
    const summaryRows = Object.entries(pkg?.summary || {}).map(([key, value]) => ({
      item: this._humanizeEtabsColumnName(key),
      value,
    }));

    const tableDefs = this._getEtabsResultsTableDefinitions(pkg);

    return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte Sísmico Tipo ETABS - JHACK</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 24px;
            font-size: 12px;
          }

          h1 {
            font-size: 20px;
            margin: 0 0 4px 0;
          }

          h2 {
            font-size: 15px;
            margin: 22px 0 8px 0;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 4px;
          }

          .meta {
            color: #4b5563;
            margin-bottom: 12px;
          }

          .note {
            margin-top: 20px;
            color: #6b7280;
            font-size: 11px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            page-break-inside: auto;
          }

          th {
            background: #e5e7eb;
            font-weight: bold;
          }

          th, td {
            border: 1px solid #9ca3af;
            padding: 5px 6px;
            text-align: left;
            vertical-align: top;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .empty {
            color: #6b7280;
            font-style: italic;
          }

          @media print {
            body {
              margin: 12mm;
            }

            .no-print {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <button class="no-print" onclick="window.print()" style="margin-bottom:12px;">
          Imprimir / Guardar como PDF
        </button>

        <h1>Reporte Sísmico Tipo ETABS - JHACK</h1>

        <div class="meta">
          Paquete: ${this._escapeHtml(pkg?.type || "etabs_results_package")} |
          Versión: ${this._escapeHtml(pkg?.version || "")} |
          Estado: ${this._escapeHtml(pkg?.status || "")}<br>
          Generado: ${this._escapeHtml(pkg?.generated_at || "")}
        </div>

        ${this._buildPrintableEtabsTableHtml("Summary", summaryRows)}

        ${tableDefs
        .map((table) => this._buildPrintableEtabsTableHtml(table.label, table.rows || []))
        .join("")}

        <div class="note">
          Reporte generado desde resultados reales del Motor A: CAD → Flask/OpenSeesPy → etabs_results.tables.
        </div>
      </body>
      </html>
    `;
  },

  exportEtabsSeismicResultsJson(result = null) {
    const pkg = this._getEtabsResultsPackage(result);

    if (!pkg) {
      this.showMessage?.("No hay resultados tipo ETABS para exportar.", "warning");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `jhack_reporte_sismico_${timestamp}.json`;

    this._downloadTextFile(
      filename,
      JSON.stringify(pkg, null, 2),
      "application/json;charset=utf-8"
    );

    this.showMessage?.("Reporte JSON descargado.", "success");
  },

  exportEtabsSeismicResultsCsv(result = null) {
    const pkg = this._getEtabsResultsPackage(result);

    if (!pkg) {
      this.showMessage?.("No hay resultados tipo ETABS para exportar.", "warning");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `jhack_reporte_sismico_${timestamp}.csv`;

    this._downloadTextFile(
      filename,
      this._buildEtabsResultsCsv(pkg),
      "text/csv;charset=utf-8"
    );

    this.showMessage?.("Reporte CSV descargado.", "success");
  },

  printEtabsSeismicResultsReport(result = null) {
    const pkg = this._getEtabsResultsPackage(result);

    if (!pkg) {
      this.showMessage?.("No hay resultados tipo ETABS para imprimir.", "warning");
      return;
    }

    const html = this._buildPrintableEtabsReportHtml(pkg);
    const win = window.open("", "_blank", "width=1100,height=800");

    if (!win) {
      this.showMessage?.("El navegador bloqueó la ventana de impresión.", "warning");
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();

    win.focus();

    setTimeout(() => {
      win.print();
    }, 300);
  },

  async openEtabsSeismicResultsDialog(result = null) {
    const pkg = this._getEtabsResultsPackage(result);

    if (!pkg) {
      this.showMessage?.("No existe paquete etabs_results. Ejecuta primero el análisis sísmico.", "warning");
      console.warn("No existe etabs_results:", result || this.seismicResults);
      return;
    }

    const tableDefs = this._getEtabsResultsTableDefinitions(pkg);

    const tabsHtml = tableDefs
      .map((table, index) => {
        return `
          <button
            type="button"
            class="etabs-result-tab"
            data-tab="${table.id}"
            style="
              padding:7px 10px;
              border:1px solid #334155;
              border-radius:5px;
              background:${index === 0 ? "#2563eb" : "#0f172a"};
              color:#e2e8f0;
              cursor:pointer;
              font-size:12px;
              white-space:nowrap;
            "
          >
            ${table.label}
          </button>
        `;
      })
      .join("");

    const panelsHtml = tableDefs
      .map((table, index) => {
        return `
          <div
            class="etabs-result-panel"
            data-panel="${table.id}"
            style="display:${index === 0 ? "block" : "none"};"
          >
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <div style="font-size:13px; color:#e2e8f0; font-weight:700;">
                ${table.label}
              </div>
              <div style="font-size:11px; color:#94a3b8;">
                Filas: ${table.rows.length}
              </div>
            </div>

            ${this._buildEtabsTableHtml(table.rows)}
          </div>
        `;
      })
      .join("");

    await Swal.fire({
      title: "Resultados Sísmicos tipo ETABS",
      width: 1180,
      background: "#020617",
      color: "#e2e8f0",
      html: `
        <div style="text-align:left; font-family:Arial, sans-serif;">

          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:10px;">
            <div>
              <div style="font-size:12px; color:#94a3b8;">
                Paquete: <b>${pkg.type || "etabs_results_package"}</b> |
                Versión: <b>${pkg.version || "B7"}</b> |
                Estado: <b>${pkg.status || "ok"}</b>
              </div>
              <div style="font-size:11px; color:#64748b;">
                Generado: ${pkg.generated_at || ""}
              </div>
            </div>

            <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
              <button
                type="button"
                id="export-etabs-results-json"
                style="
                  padding:6px 10px;
                  border:1px solid #334155;
                  border-radius:5px;
                  background:#111827;
                  color:#e2e8f0;
                  cursor:pointer;
                  font-size:12px;
                "
              >
                Descargar JSON
              </button>

              <button
                type="button"
                id="export-etabs-results-csv"
                style="
                  padding:6px 10px;
                  border:1px solid #334155;
                  border-radius:5px;
                  background:#111827;
                  color:#e2e8f0;
                  cursor:pointer;
                  font-size:12px;
                "
              >
                Descargar CSV
              </button>

              <button
                type="button"
                id="print-etabs-results-report"
                style="
                  padding:6px 10px;
                  border:1px solid #334155;
                  border-radius:5px;
                  background:#111827;
                  color:#e2e8f0;
                  cursor:pointer;
                  font-size:12px;
                "
              >
                Imprimir / PDF
              </button>

              <button
                type="button"
                id="copy-etabs-results-json"
                style="
                  padding:6px 10px;
                  border:1px solid #334155;
                  border-radius:5px;
                  background:#111827;
                  color:#e2e8f0;
                  cursor:pointer;
                  font-size:12px;
                "
              >
                Copiar JSON
              </button>
            </div>
          </div>

          ${this._buildEtabsResultsSummaryHtml(pkg)}

          <div style="
            display:flex;
            flex-wrap:wrap;
            gap:6px;
            margin-bottom:10px;
            border-bottom:1px solid #334155;
            padding-bottom:8px;
          ">
            ${tabsHtml}
          </div>

          <div>
            ${panelsHtml}
          </div>

          <div style="margin-top:10px; color:#facc15; font-size:11px;">
            Datos mostrados desde Motor A real: Flask/OpenSeesPy → etabs_results.tables.
          </div>
        </div>
      `,
      showCancelButton: false,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#2563eb",

      didOpen: () => {
        const popup = Swal.getPopup();

        popup?.querySelectorAll(".etabs-result-tab").forEach((btn) => {
          btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");

            popup.querySelectorAll(".etabs-result-tab").forEach((item) => {
              item.style.background = "#0f172a";
            });

            btn.style.background = "#2563eb";

            popup.querySelectorAll(".etabs-result-panel").forEach((panel) => {
              panel.style.display = panel.getAttribute("data-panel") === tabId ? "block" : "none";
            });
          });
        });

        popup?.querySelector("#export-etabs-results-json")?.addEventListener("click", () => {
          this.exportEtabsSeismicResultsJson({ etabs_results: pkg });
        });

        popup?.querySelector("#export-etabs-results-csv")?.addEventListener("click", () => {
          this.exportEtabsSeismicResultsCsv({ etabs_results: pkg });
        });

        popup?.querySelector("#print-etabs-results-report")?.addEventListener("click", () => {
          this.printEtabsSeismicResultsReport({ etabs_results: pkg });
        });

        popup?.querySelector("#copy-etabs-results-json")?.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(JSON.stringify(pkg, null, 2));
            this.showMessage?.("JSON de resultados copiado.", "success");
          } catch (error) {
            console.warn("No se pudo copiar JSON:", error);
            this.showMessage?.("No se pudo copiar el JSON.", "warning");
          }
        });
      },
    });
  },

  // ─── Mostrar tabla de resultados modales ──────────────────────────────────
  async showSeismicResults(result) {

    // ============================================================
    // B8.2 — Resultado final tipo ETABS
    // ============================================================
    this.seismicResults = result;
    this.analysisResults = this.analysisResults || {};
    this.analysisResults.seismic = result;

    // B10.17 — Payload listo para animación sísmica
    if (result?.seismic_animation) {
      this.seismicAnimationPayload = result.seismic_animation;
      window.jhackSeismicAnimationPayload = result.seismic_animation;

      console.log("🎬 Payload de animación sísmica disponible:", {
        nodes: result.seismic_animation.nodes?.length || 0,
        elements: result.seismic_animation.elements?.length || 0,
        modes: result.seismic_animation.modes?.length || 0,
        payload: result.seismic_animation,
      });
    }

    // B10.18 — Contrato final backend disponible en navegador
    if (result?.api_contract) {
      this.seismicApiContract = result.api_contract;
      window.jhackSeismicApiContract = result.api_contract;

      console.log("📘 Contrato backend sísmico disponible:", {
        version: result.api_contract.version,
        status: result.api_contract.status,
        readyForAnimation: result.api_contract.current_animation_status?.ready_for_animation,
        contract: result.api_contract,
      });
    }

        // B10.19 — Health final backend / entrega
    if (result?.backend_health) {
      this.seismicBackendHealth = result.backend_health;
      window.jhackSeismicBackendHealth = result.backend_health;

      console.log("🟢 Backend seismic health:", {
        status: result.backend_health.status,
        readyForDelivery: result.backend_health.ready_for_delivery,
        errors: result.backend_health.errors || [],
        warnings: result.backend_health.warnings || [],
        health: result.backend_health,
      });
    }

    if (result?.etabs_results) {
      console.log("✅ Resultados sísmicos tipo ETABS recibidos:", result.etabs_results);

      await this.openEtabsSeismicResultsDialog(result);

      return;
    }

    const modes = result.modal?.modes || [];
    const seisX = result.seismic?.x;
    const seisY = result.seismic?.y;

    const fmt = (v, d = 4) => (v != null ? Number(v).toFixed(d) : "-");

    // Tabla de modos
    const rows = modes.map(m => `
      <tr style="border-bottom:1px solid #334155">
        <td style="padding:5px 8px; text-align:center">${m.mode}</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.period, 4)}</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.frequency, 3)}</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.mass_participation_x, 1)}%</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.cumulative_participation_x, 1)}%</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.mass_participation_y, 1)}%</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.cumulative_participation_y, 1)}%</td>
      </tr>`).join("");

    // Cortantes basales
    const Vx = seisX?.base_shear;
    const Vy = seisY?.base_shear;
    const shearHtml = [
      Vx != null ? `Cortante basal X: <strong>${fmt(Vx, 1)} N</strong>` : null,
      Vy != null ? `Cortante basal Y: <strong>${fmt(Vy, 1)} N</strong>` : null,
    ].filter(Boolean).join("&nbsp;&nbsp;|&nbsp;&nbsp;");

    const html = `
      <div style="font-family:monospace; font-size:12px; text-align:left">

        <!-- Resumen de cortante -->
        <div style="background:#1e293b; padding:8px 12px; border-radius:6px; margin-bottom:12px; color:#7dd3fc">
          ${shearHtml || "No se calculó cortante basal"}
        </div>

        <!-- Tabla modal -->
        <div style="overflow-x:auto">
          <table style="width:100%; border-collapse:collapse; color:#e2e8f0">
            <thead>
              <tr style="background:#1e3a5f; color:#7eb8f7">
                <th style="padding:6px 8px">Modo</th>
                <th style="padding:6px 8px">T (s)</th>
                <th style="padding:6px 8px">f (Hz)</th>
                <th style="padding:6px 8px">MP-X%</th>
                <th style="padding:6px 8px">Σ MP-X%</th>
                <th style="padding:6px 8px">MP-Y%</th>
                <th style="padding:6px 8px">Σ MP-Y%</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div style="color:#94a3b8; font-size:11px; margin-top:10px">
          Combinación: ${result.modal?.modes?.length ? this.seismicConfig?.combination || "CQC" : "-"} &nbsp;|&nbsp;
          ζ = ${this.seismicConfig?.dampingRatio ?? 0.05} &nbsp;|&nbsp;
          ${this.seismicConfig?.saInG ? "Sa en [g]" : "Sa en [m/s²]"}
        </div>
      </div>
    `;

    const swalResult = await Swal.fire({
      title: "Resultados: Análisis Sísmico Espectral",
      html,
      width: 700,
      background: "#1a2035",
      color: "#e2e8f0",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#1d4ed8",
      showDenyButton: true,
      denyButtonText: "Animar en 3D",
      denyButtonColor: "#0f766e",
    });

    if (swalResult.isDenied) {
      this.startSeismicAnimation();
    }
  },

  // ─── Animación sísmica 3D ──────────────────────────────────────────────────
  startSeismicAnimation() {
    this._initSeismic();

    if (!this.seismicResults) {
      this.showMessage?.("Ejecute primero el análisis sísmico para poder animar.", "warning");
      return;
    }

    const hasDisplacements = (this.nodes || []).some((n) => n.seismicDisplacement);
    if (!hasDisplacements) {
      this.showMessage?.("No hay desplazamientos sísmicos en el modelo. Vuelva a ejecutar el análisis.", "warning");
      return;
    }

    // Determinar modo dominante y periodo
    const modes = this.seismicResults.modal?.modes || [];
    const Vx = this.seismicResults.seismic?.x?.base_shear ?? 0;
    const Vy = this.seismicResults.seismic?.y?.base_shear ?? 0;
    const primaryDir = Vx >= Vy ? "x" : "y";
    const participationKey = primaryDir === "x" ? "mass_participation_x" : "mass_participation_y";

    const dominantMode = modes.reduce(
      (best, m) => (m[participationKey] > (best?.[participationKey] ?? 0) ? m : best),
      null,
    );

    const period = dominantMode?.period ?? 1.0;
    const scale = this.seismicConfig?.animScale ?? 100;
    const defaultSpeedFactor = 1;

    const ok = startBabylonSeismicAnimation(this, { period, scale, speedFactor: defaultSpeedFactor });
    if (!ok) {
      this.showMessage?.("No se pudo iniciar la animación. Verifique que la vista 3D esté activa y el modelo tenga masas.", "error");
      return;
    }

    this.seismicAnimationActive = true;

    const modeLabel = dominantMode ? `Modo ${dominantMode.mode} | T=${period.toFixed(2)}s` : "";
    const dirLabel = primaryDir.toUpperCase();
    this.showMessage?.(`Animación sísmica iniciada — Dir ${dirLabel} | ${modeLabel}`, "success");

    const speedOptions = [
      { factor: 0.25, label: "×¼" },
      { factor: 0.5, label: "×½" },
      { factor: 1, label: "×1" },
      { factor: 2, label: "×2" },
      { factor: 3, label: "×3" },
    ];

    const btnStyle = (active) =>
      `padding:3px 10px;border-radius:4px;border:none;color:#fff;cursor:pointer;` +
      `font-size:11px;transition:background .15s;background:${active ? "#1d4ed8" : "#374151"}`;

    const speedBtnsHtml = speedOptions
      .map((s) => `<button data-sf="${s.factor}" style="${btnStyle(s.factor === defaultSpeedFactor)}">${s.label}</button>`)
      .join("");

    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "info",
      title: "Animación sísmica activa",
      html: `
        <div style="font-size:12px;margin-bottom:6px">Dir. ${dirLabel} · ${modeLabel} · Escala ×${scale}</div>
        <div style="display:flex;align-items:center;gap:6px;justify-content:center">
          <span style="font-size:11px;color:#9ca3af">Velocidad:</span>
          <div id="seismic-speed-btns" style="display:flex;gap:4px">${speedBtnsHtml}</div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: "⏹ Detener",
      confirmButtonColor: "#dc2626",
      timer: null,
      background: "#1a2035",
      color: "#e2e8f0",
      showClass: { popup: "" },
      didOpen: (popup) => {
        popup.querySelector("#seismic-speed-btns")?.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-sf]");
          if (!btn) return;
          const sf = parseFloat(btn.dataset.sf);
          setSeismicAnimationSpeed(sf);
          popup.querySelectorAll("[data-sf]").forEach((b) => {
            b.style.background = parseFloat(b.dataset.sf) === sf ? "#1d4ed8" : "#374151";
          });
        });
      },
    }).then((r) => {
      if (r.isConfirmed) this.stopSeismicAnimation();
    });
  },

  stopSeismicAnimation() {
    if (!this.seismicAnimationActive) return;
    stopBabylonSeismicAnimation();
    this.seismicAnimationActive = false;
    setTimeout(() => this.sync3D?.(), 80);
    this.showMessage?.("Animación sísmica detenida");
  },

  isSeismicAnimating() {
    return isBabylonSeismicAnimating();
  },

  // ─── Utilidades ────────────────────────────────────────────────────────────
  _getTotalModelMass() {
    return (this.nodes || []).reduce((sum, n) => {
      return sum + Number(n.mass_x ?? n.mass?.x ?? n.mass ?? 0);
    }, 0);
  },
};
