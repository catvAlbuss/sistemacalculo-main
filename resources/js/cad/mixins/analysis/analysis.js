import Swal from "sweetalert2";

/**
 * @mixin analysisMixin
 *
 * Configuración y ejecución del análisis estructural.
 *
 * Coordina la comunicación con el backend de análisis (Python/OpenSeesPy en
 * localhost:5001 o Octave), prepara los datos del modelo CAD para enviarlos
 * y procesa los resultados que luego muestran los mixins de display.
 *
 * Responsabilidades:
 * - ensureRunAnalysisOptions()            → inicializa analysisOptions con valores por defecto
 * - performInitialRunAnalysis(options)    → ejecuta el análisis y guarda resultados en
 *                                           this.analysisResults
 * - openRunAnalysisDialog()              → diálogo con opciones antes de correr el análisis
 * - openModalAnalysisOptionsDialog()     → configura parámetros dinámicos (modos, ritz, etc.)
 * - openStaticAnalysisOptionsDialog()    → configura análisis estático
 * - openPDeltaOptionsDialog()            → configura efectos P-Delta
 * - openDatabaseAccessOptionsDialog()    → opciones de acceso a base de datos de resultados
 */
export const analysisMixin = {
  ensureRunAnalysisOptions() {
    if (!this.analysisOptions) {
      this.analysisOptions = {};
    }

    this.analysisOptions = {
      enabled: this.analysisOptions.enabled ?? true,
      analysisType: this.analysisOptions.analysisType || "full3d",
      solverType: this.analysisOptions.solverType || "linear_static",
      runStaticAnalysis: this.analysisOptions.runStaticAnalysis ?? true,
      considerSelfWeight: this.analysisOptions.considerSelfWeight ?? true,
      analysisStatus: this.analysisOptions.analysisStatus || "not_run",

      dof: {
        ux: this.analysisOptions.dof?.ux ?? true,
        uy: this.analysisOptions.dof?.uy ?? true,
        uz: this.analysisOptions.dof?.uz ?? true,
        rx: this.analysisOptions.dof?.rx ?? true,
        ry: this.analysisOptions.dof?.ry ?? true,
        rz: this.analysisOptions.dof?.rz ?? true,
      },

      dynamicAnalysis: {
        enabled: this.analysisOptions.dynamicAnalysis?.enabled ?? true,
      },

      dynamicParams: {
        ...(this.dynamicParams || {}),
        ...(this.analysisOptions.dynamicParams || {}),
      },

      pDelta: {
        enabled: this.analysisOptions.pDelta?.enabled ?? false,
      },

      pDeltaParams: {
        method: this.analysisOptions.pDeltaParams?.method || "iterative",
        maxIterations: Number(this.analysisOptions.pDeltaParams?.maxIterations || 1),
        tolerance: this.analysisOptions.pDeltaParams?.tolerance || "1.000E-03",
        loads: Array.isArray(this.analysisOptions.pDeltaParams?.loads)
          ? this.analysisOptions.pDeltaParams.loads
          : [{ name: "DEAD", scale: 1 }],
      },

      dbAccess: {
        enabled: this.analysisOptions.dbAccess?.enabled ?? false,
        filename: this.analysisOptions.dbAccess?.filename || "analysis_output",
      },

      lastModelCheck: this.analysisOptions.lastModelCheck || null,
      updatedAt: this.analysisOptions.updatedAt || null,
    };

    return this.analysisOptions;
  },

  getRunAnalysisNodes() {
    return Array.isArray(this.nodes) ? this.nodes : [];
  },

  getRunAnalysisFrames() {
    return (this.shapes || []).filter((frame) => {
      return frame?.node1 && frame?.node2;
    });
  },

  getRunAnalysisPoint(obj) {
    const p = obj?.position || obj || {};

    return {
      x: Number(p.x || 0),
      y: Number(p.y || 0),
      z: Number(p.z || 0),
    };
  },

  getRunAnalysisDistance(p1, p2) {
    const dx = Number(p2.x || 0) - Number(p1.x || 0);
    const dy = Number(p2.y || 0) - Number(p1.y || 0);
    const dz = Number(p2.z || 0) - Number(p1.z || 0);

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  getRunAnalysisFrameLength(frame) {
    if (!frame?.node1?.position || !frame?.node2?.position) return 0;

    return this.getRunAnalysisDistance(this.getRunAnalysisPoint(frame.node1), this.getRunAnalysisPoint(frame.node2));
  },

  nodeHasRunAnalysisRestraint(node) {
    // 1. Revisar si existen restraints/constraints explícitos
    const r = node?.restraints || node?.constraints;
    if (r && (r.ux === true || r.uy === true || r.uz === true || r.rx === true || r.ry === true || r.rz === true)) {
      return true;
    }

    // 2. Revisar la propiedad antigua "soporte"
    if (node?.soporte) {
      // Cualquier valor no vacío cuenta como apoyo
      return true;
    }

    return false;
  },

  nodeHasRunAnalysisSpring(node) {
    const springs = node?.pointSprings || node?.springs;
    const k = springs?.stiffness;

    if (!k) return false;

    return (
      Number(k.ux || 0) !== 0 ||
      Number(k.uy || 0) !== 0 ||
      Number(k.uz || 0) !== 0 ||
      Number(k.rx || 0) !== 0 ||
      Number(k.ry || 0) !== 0 ||
      Number(k.rz || 0) !== 0
    );
  },

  getRunAnalysisLoadSummary() {
    const nodes = this.getRunAnalysisNodes();
    const frames = this.getRunAnalysisFrames();

    let jointLoads = 0;
    let frameLoads = 0;
    let legacyForces = 0;

    const countUniqueLoads = (object, fields) => {
      const seen = new Set();

      fields.forEach((field) => {
        const loads = object?.[field];

        if (!Array.isArray(loads)) return;

        loads.forEach((load) => {
          seen.add(
            JSON.stringify({
              id: load?.id || null,
              type: load?.type || null,
              loadCase: load?.loadCase || null,
              forces: load?.forces || null,
              value: load?.value ?? null,
              startValue: load?.startValue ?? null,
              endValue: load?.endValue ?? null,
              direction: load?.direction || null,
            }),
          );
        });
      });

      return seen.size;
    };

    nodes.forEach((node) => {
      jointLoads += countUniqueLoads(node, ["pointLoads", "jointLoads", "loads"]);

      const f = node.force || {};
      const hasLegacyForce =
        Number(f.fx || f.Fx || 0) !== 0 ||
        Number(f.fy || f.Fy || 0) !== 0 ||
        Number(f.fz || f.Fz || 0) !== 0 ||
        Number(f.mx || f.Mx || 0) !== 0 ||
        Number(f.my || f.My || 0) !== 0 ||
        Number(f.mz || f.Mz || 0) !== 0;

      if (hasLegacyForce) legacyForces++;
    });

    frames.forEach((frame) => {
      frameLoads += countUniqueLoads(frame, ["frameLoads", "lineLoads", "loads"]);
    });

    return {
      jointLoads,
      frameLoads,
      legacyForces,
      totalLoads: jointLoads + frameLoads + legacyForces,
    };
  },

  getRunAnalysisReadiness() {
    const nodes = this.getRunAnalysisNodes();
    const frames = this.getRunAnalysisFrames();
    const areas = Array.isArray(this.areas) ? this.areas : [];

    const errors = [];
    const warnings = [];

    if (this.modelCheck && this.modelCheck.canRunAnalysis === false) {
      errors.push("Check Model tiene errores. Corrige el modelo antes de ejecutar Run Analysis.");
    }

    if (nodes.length === 0 && frames.length === 0 && areas.length === 0) {
      errors.push("El modelo está vacío. No hay nodos, barras ni áreas para analizar.");
    }

    const invalidFrames = (this.shapes || []).filter((frame) => {
      return !frame?.node1 || !frame?.node2;
    });

    if (invalidFrames.length > 0) {
      errors.push(`Existen ${invalidFrames.length} elemento(s) Frame / Line sin nodos válidos.`);
    }

    const zeroLengthFrames = frames.filter((frame) => {
      return this.getRunAnalysisFrameLength(frame) <= 0.000001;
    });

    if (zeroLengthFrames.length > 0) {
      errors.push(`Existen ${zeroLengthFrames.length} elemento(s) Frame / Line con longitud cero.`);
    }

    const supports = nodes.filter((node) => {
      return this.nodeHasRunAnalysisRestraint(node) || this.nodeHasRunAnalysisSpring(node);
    });

    if (frames.length > 0 && supports.length === 0) {
      errors.push("No se encontraron apoyos, restricciones o resortes. El modelo puede ser inestable.");
    }

    const loadSummary = this.getRunAnalysisLoadSummary();

    if (frames.length > 0 && loadSummary.totalLoads === 0) {
      warnings.push("No se encontraron cargas asignadas. El análisis se ejecutará con resultados mínimos.");
    }

    return {
      canRun: errors.length === 0,
      errors,
      warnings,
      nodes,
      frames,
      areas,
      supports,
      loadSummary,
    };
  },

  async runAnalysis() {
    this.ensureRunAnalysisOptions();

    const readiness = this.getRunAnalysisReadiness();

    if (!readiness.canRun) {
      this.analysisOptions.analysisStatus = "failed";

      const html = `
        <div style="text-align:left; font-size:13px;">
            <p>Run Analysis no puede continuar por los siguientes errores:</p>
            <ul style="margin-top:10px; padding-left:18px;">
                ${readiness.errors.map((error) => `<li>${error}</li>`).join("")}
            </ul>
            <p style="margin-top:12px; color:#777;">
                Recomendación: ejecute Analyze &gt; Check Model y corrija los errores del modelo.
            </p>
        </div>
        `;

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: "error",
          title: "Run Analysis bloqueado",
          html,
          confirmButtonText: "Entendido",
        });
      } else {
        this.showMessage?.("Run Analysis bloqueado. Revise Check Model.", "warning");
      }

      console.warn("❌ Analyze > Run Analysis bloqueado:", readiness);
      return false;
    }

    // =====================================================
    // Usar el formulario existente que ya funciona (con CSRF)
    // =====================================================
    const form = document.getElementById("run-analysis-form");
    if (form) {
      // Disparar el evento submit del formulario
      const event = new Event("submit", { cancelable: true, bubbles: true });
      form.dispatchEvent(event);
      this.showMessage?.("Análisis iniciado.");
      return true;
    } else {
      // Fallback: intentar crear un formulario con CSRF manualmente
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      if (!token) {
        this.showMessage?.("No se encontró el token CSRF. El análisis no se puede ejecutar.", "error");
        return false;
      }

      const dummyEvent = {
        preventDefault: () => {},
        target: (() => {
          const f = document.createElement("form");
          const csrfInput = document.createElement("input");
          csrfInput.type = "hidden";
          csrfInput.name = "_token";
          csrfInput.value = token;
          f.appendChild(csrfInput);
          return f;
        })(),
      };

      if (typeof this.calcularFuerzas === "function") {
        this.calcularFuerzas(dummyEvent);
        return true;
      } else {
        this.showMessage?.("No se pudo iniciar el análisis.", "error");
        return false;
      }
    }
  },

  performInitialRunAnalysis(readiness) {
    const options = this.ensureRunAnalysisOptions();

    const nodes = readiness.nodes;
    const frames = readiness.frames;

    const nodeResults = {};
    const frameResults = {};
    const reactions = {};

    const nodeConnectivity = new Map();

    nodes.forEach((node) => {
      nodeConnectivity.set(String(node.id), []);
    });

    frames.forEach((frame) => {
      if (frame.node1?.id !== undefined) {
        nodeConnectivity.get(String(frame.node1.id))?.push(frame);
      }

      if (frame.node2?.id !== undefined) {
        nodeConnectivity.get(String(frame.node2.id))?.push(frame);
      }
    });

    let maxDisplacement = 0;
    let maxAxial = 0;

    nodes.forEach((node, index) => {
      const nodeId = node.id || index + 1;

      const isSupported = this.nodeHasRunAnalysisRestraint(node) || this.nodeHasRunAnalysisSpring(node);

      const loadVector = this.getNodeResultantLoadForRunAnalysis(node);
      const connectedFrames = nodeConnectivity.get(String(node.id)) || [];

      const stiffnessBase = Math.max(connectedFrames.length, 1) * 10000;

      const loadMagnitude = Math.sqrt(
        loadVector.fx * loadVector.fx + loadVector.fy * loadVector.fy + loadVector.fz * loadVector.fz,
      );

      const factor = isSupported ? 0 : loadMagnitude / stiffnessBase;

      const displacement = {
        ux: options.dof.ux ? factor * Math.sign(loadVector.fx || 0) : 0,
        uy: options.dof.uy ? factor * Math.sign(loadVector.fy || 0) : 0,
        uz: options.dof.uz ? factor * Math.sign(loadVector.fz || 0) : 0,
        rx: options.dof.rx ? factor * 0.001 : 0,
        ry: options.dof.ry ? factor * 0.001 : 0,
        rz: options.dof.rz ? factor * 0.001 : 0,
      };

      const displacementMagnitude = Math.sqrt(
        displacement.ux * displacement.ux + displacement.uy * displacement.uy + displacement.uz * displacement.uz,
      );

      maxDisplacement = Math.max(maxDisplacement, displacementMagnitude);

      nodeResults[nodeId] = {
        nodeId,
        position: this.getRunAnalysisPoint(node),
        displacement,
        displacementMagnitude,
        loadVector,
        supported: isSupported,
      };

      node.analysisDisplacement = { ...displacement };
      node.displacement = { ...displacement };
      node.deflection = displacementMagnitude;

      if (isSupported) {
        reactions[nodeId] = {
          nodeId,
          rxnFx: -loadVector.fx,
          rxnFy: -loadVector.fy,
          rxnFz: -loadVector.fz,
          rxnMx: -loadVector.mx,
          rxnMy: -loadVector.my,
          rxnMz: -loadVector.mz,
        };

        node.reaction = reactions[nodeId];
      }
    });

    frames.forEach((frame, index) => {
      const frameId = frame.id || index + 1;
      const length = Math.max(this.getRunAnalysisFrameLength(frame), 0.000001);

      const frameLoad = this.getFrameResultantLoadForRunAnalysis(frame);

      const n1 = nodeResults[frame.node1?.id];
      const n2 = nodeResults[frame.node2?.id];

      const area = this.getFrameAreaForRunAnalysis(frame);
      const elasticModulus = this.getFrameElasticModulusForRunAnalysis(frame);

      const relativeDisp = (n2?.displacementMagnitude || 0) - (n1?.displacementMagnitude || 0);

      const axialFromDeformation = elasticModulus * area * (relativeDisp / length);

      const axialFromLoads = frameLoad.total / Math.max(length, 1);

      const axial = axialFromDeformation + axialFromLoads;
      const shear2 = frameLoad.vertical * 0.5;
      const shear3 = frameLoad.horizontal * 0.5;
      const moment2 = (shear2 * length) / 4;
      const moment3 = (shear3 * length) / 4;
      const torsion = frameLoad.torsion || 0;

      maxAxial = Math.max(maxAxial, Math.abs(axial));

      const result = {
        frameId,
        length,
        axial,
        shear2,
        shear3,
        moment2,
        moment3,
        torsion,
        load: frameLoad,
        section: frame.sectionName || frame.sectionId || frame.frameSection?.name || "Sin sección",
      };

      frameResults[frameId] = result;

      frame.fAxial = axial;
      frame.analysisForces = { ...result };
      frame.internalForces = { ...result };
    });

    const modalResults = this.calculateInitialModalRunResults(nodes, frames, options);

    return {
      type: "initial-analysis-results",
      status: "completed",
      solverType: options.solverType,
      analysisType: options.analysisType,
      runStaticAnalysis: options.runStaticAnalysis,
      dynamicAnalysis: options.dynamicAnalysis,
      pDelta: options.pDelta,
      ranAt: new Date().toISOString(),

      summary: {
        nodes: nodes.length,
        frames: frames.length,
        areas: readiness.areas.length,
        stories: (this.stories || []).length,
        loads: readiness.loadSummary.totalLoads,
        supports: readiness.supports.length,
        maxDisplacement,
        maxAxial,
        warnings: readiness.warnings,
      },

      nodes: nodeResults,
      frames: frameResults,
      reactions,
      modalResults,
    };
  },

  getNodeResultantLoadForRunAnalysis(node) {
    const result = {
      fx: 0,
      fy: 0,
      fz: 0,
      mx: 0,
      my: 0,
      mz: 0,
    };

    const addForceObject = (forces = {}) => {
      result.fx += Number(forces.fx ?? forces.Fx ?? 0);
      result.fy += Number(forces.fy ?? forces.Fy ?? 0);
      result.fz += Number(forces.fz ?? forces.Fz ?? 0);
      result.mx += Number(forces.mx ?? forces.Mx ?? 0);
      result.my += Number(forces.my ?? forces.My ?? 0);
      result.mz += Number(forces.mz ?? forces.Mz ?? 0);
    };

    if (node?.force) {
      addForceObject(node.force);
    }

    const loads = [
      ...(Array.isArray(node?.pointLoads) ? node.pointLoads : []),
      ...(Array.isArray(node?.jointLoads) ? node.jointLoads : []),
      ...(Array.isArray(node?.loads) ? node.loads : []),
    ];

    const seen = new Set();

    loads.forEach((load) => {
      const key = JSON.stringify(load);
      if (seen.has(key)) return;
      seen.add(key);

      if (load.type === "force" && load.forces) {
        addForceObject(load.forces);
      }

      if (load.type === "ground-displacement" && load.displacements) {
        result.fx += Number(load.displacements.ux || 0) * 1000;
        result.fy += Number(load.displacements.uy || 0) * 1000;
        result.fz += Number(load.displacements.uz || 0) * 1000;
      }

      if (load.type === "temperature" && load.temperature) {
        result.fz += Number(load.temperature.deltaT || 0) * 0.1;
      }
    });

    return result;
  },

  getFrameResultantLoadForRunAnalysis(frame) {
    const result = {
      total: 0,
      vertical: 0,
      horizontal: 0,
      torsion: 0,
    };

    const length = Math.max(this.getRunAnalysisFrameLength(frame), 1);

    const loads = [
      ...(Array.isArray(frame?.frameLoads) ? frame.frameLoads : []),
      ...(Array.isArray(frame?.lineLoads) ? frame.lineLoads : []),
      ...(Array.isArray(frame?.loads) ? frame.loads : []),
    ];

    const seen = new Set();

    loads.forEach((load) => {
      const key = JSON.stringify(load);
      if (seen.has(key)) return;
      seen.add(key);

      if (load.type === "point") {
        const value = Number(load.value || 0);
        result.total += Math.abs(value);

        if (
          String(load.direction || "")
            .toUpperCase()
            .includes("Z")
        ) {
          result.vertical += value;
        } else {
          result.horizontal += value;
        }
      }

      if (load.type === "distributed") {
        const w1 = Number(load.startValue ?? load.value ?? 0);
        const w2 = Number(load.endValue ?? load.value ?? 0);
        const total = ((w1 + w2) / 2) * length;

        result.total += Math.abs(total);

        if (
          String(load.direction || "")
            .toUpperCase()
            .includes("Z")
        ) {
          result.vertical += total;
        } else {
          result.horizontal += total;
        }
      }

      if (load.type === "temperature") {
        result.total += Math.abs(Number(load.temperature?.deltaT || 0)) * 0.1;
      }
    });

    return result;
  },

  getFrameAreaForRunAnalysis(frame) {
    const section = frame?.frameSection || frame?.section || frame?.assignment?.frameSection || null;

    const sectionArea = Number(section?.A ?? section?.area ?? section?.Area ?? 0);

    if (sectionArea > 0) return sectionArea;

    const frameArea = Number(frame?.A ?? frame?._A ?? 0);

    if (frameArea > 0) return frameArea;

    return 0.01;
  },

  getFrameElasticModulusForRunAnalysis(frame) {
    const section = frame?.frameSection || frame?.section || null;

    const eValue = Number(frame?.E ?? section?.E ?? section?.elasticModulus ?? this.globalE ?? 210000);

    return Number.isFinite(eValue) && eValue > 0 ? eValue : 210000;
  },

  calculateInitialModalRunResults(nodes, frames, options) {
    if (!options.dynamicAnalysis?.enabled) {
      return {
        enabled: false,
        modes: [],
      };
    }

    const numModes = Math.max(1, Number(options.dynamicParams?.numModes || this.dynamicParams?.numModes || 3));

    const totalMass = Math.max(nodes.length, 1);
    const totalStiffness = Math.max(frames.length, 1) * 10000;

    const baseFrequency = Math.sqrt(totalStiffness / totalMass) / (2 * Math.PI);

    const modes = [];

    for (let i = 1; i <= numModes; i++) {
      const frequency = baseFrequency * i;
      const period = frequency > 0 ? 1 / frequency : 0;

      modes.push({
        mode: i,
        frequency,
        period,
        massParticipationX: Math.min(100, (100 / numModes) * i),
        massParticipationY: Math.min(100, (95 / numModes) * i),
        massParticipationZ: Math.min(100, (80 / numModes) * i),
      });
    }

    return {
      enabled: true,
      analysisType: options.dynamicParams?.analysisType || "eigenvectors",
      numModes,
      modes,
    };
  },

  applyInitialRunAnalysisResults(results) {
    this.analysisResults = JSON.parse(JSON.stringify(results));

    this.K_Global_Reducido = [
      {
        type: "initial-global-stiffness-summary",
        frames: results.summary.frames,
        estimatedStiffness: Math.max(results.summary.frames, 1) * 10000,
      },
    ];

    this.Fuerzas_Globales_Reducidas = [
      {
        type: "initial-global-force-summary",
        totalLoads: results.summary.loads,
        maxAxial: results.summary.maxAxial,
      },
    ];

    this.D_Global_Reducido = Object.values(results.nodes || {}).map((nodeResult) => {
      return {
        nodeId: nodeResult.nodeId,
        ...nodeResult.displacement,
      };
    });

    const nodeResultsList = Object.values(results.nodes || {});

    this.deflecciones = nodeResultsList.map((nodeResult) => {
      const d = nodeResult.displacement || {};

      return {
        nodeId: nodeResult.nodeId,
        id: nodeResult.nodeId,

        value: Number(nodeResult.displacementMagnitude || 0),

        displacement: {
          ux: Number(d.ux || 0),
          uy: Number(d.uy || 0),
          uz: Number(d.uz || 0),
          rx: Number(d.rx || 0),
          ry: Number(d.ry || 0),
          rz: Number(d.rz || 0),
        },

        // Compatibilidad con renderers que esperan arrays
        displacements: [Number(d.ux || 0), Number(d.uy || 0), Number(d.uz || 0)],

        desplazamiento: [Number(d.ux || 0), Number(d.uy || 0), Number(d.uz || 0)],

        dx: Number(d.ux || 0),
        dy: Number(d.uy || 0),
        dz: Number(d.uz || 0),

        ux: Number(d.ux || 0),
        uy: Number(d.uy || 0),
        uz: Number(d.uz || 0),
      };
    });

    this.desplazamientosPosition = Object.values(results.nodes || {}).map((nodeResult) => {
      const p = nodeResult.position || {};
      const d = nodeResult.displacement || {};

      return {
        nodeId: nodeResult.nodeId,
        x: Number(p.x || 0) + Number(d.ux || 0),
        y: Number(p.y || 0) + Number(d.uy || 0),
        z: Number(p.z || 0) + Number(d.uz || 0),
      };
    });

    this.matrizDesplazamiento = this.D_Global_Reducido.map((item) => {
      return [item.nodeId, item.ux || 0, item.uy || 0, item.uz || 0, item.rx || 0, item.ry || 0, item.rz || 0];
    });

    this.displayOptions = {
      ...(this.displayOptions || {}),
      analysisResultsAvailable: true,
      lastAnalysisRun: {
        ranAt: results.ranAt,
        status: results.status,
        maxDisplacement: results.summary.maxDisplacement,
        maxAxial: results.summary.maxAxial,
      },
    };

    if (!this.options) {
      this.options = {};
    }

    this.displayOptions.showDeformedShape = false;
    this.displayOptions.showModeShape = false;

    this.options.showDeflection = false;
    this.options.showFAxiales = false;
    this.options.showFAxialesValues = true;
  },

  // =================================================
  // ========== ANALYZE > RESULT STATUS ==============
  // =================================================

  hasCompletedAnalysisResults() {
    return (
      this.analysisOptions?.analysisStatus === "completed" &&
      this.analysisResults &&
      this.displayOptions?.analysisResultsAvailable === true
    );
  },

  showRunAnalysisRequiredMessage(actionLabel = "Display Results") {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "warning",
        title: "Run Analysis required",
        html: `
        <div style="text-align:left; font-size:13px;">
          <p>Para usar <b>${actionLabel}</b>, primero debes ejecutar:</p>
          <ol style="margin-top:10px; padding-left:18px;">
            <li>Analyze &gt; Check Model...</li>
            <li>Analyze &gt; Run Analysis</li>
          </ol>
          <p style="margin-top:12px; color:#777;">
            Esto evita mostrar resultados inexistentes o desactualizados.
          </p>
        </div>
      `,
        confirmButtonText: "Entendido",
      });
    } else {
      this.showMessage?.("Primero ejecuta Analyze > Run Analysis.", "warning");
    }
  },

  markAnalysisResultsOutdated(reason = "Model changed") {
    if (!this.analysisOptions) {
      this.analysisOptions = {};
    }

    const hadResults = this.analysisResults || this.analysisOptions.analysisStatus === "completed";

    if (!hadResults) return;

    this.analysisOptions.analysisStatus = "outdated";
    this.analysisOptions.outdatedReason = reason;
    this.analysisOptions.outdatedAt = new Date().toISOString();

    if (!this.displayOptions) {
      this.displayOptions = {};
    }

    this.displayOptions.analysisResultsAvailable = false;
    this.displayOptions.showDeformedShape = false;
    this.displayOptions.showModeShape = false;
    this.displayOptions.showMemberForces = false;

    if (!this.options) {
      this.options = {};
    }

    this.options.showDeflection = false;
    this.options.showFAxiales = false;
    this.options.showFAxialesValues = false;

    this.redraw?.();

    console.warn("⚠️ Analyze results marked as outdated:", {
      reason,
      analysisStatus: this.analysisOptions.analysisStatus,
    });
  },

  runConstructionSequenceAnalysis() {
    this.showMessage("🏗️ Ejecutando análisis de secuencia de construcción...");
    // Verificar si hay casos de construcción secuencial definidos
    if (
      window.cadSystem &&
      window.cadSystem.sequentialConstruction &&
      window.cadSystem.sequentialConstruction.items &&
      window.cadSystem.sequentialConstruction.items.length > 0
    ) {
      this.showMessage("🏗️ Análisis de secuencia de construcción iniciado");
    } else {
      this.showMessage(
        "⚠️ No hay casos de construcción secuencial definidos. Vaya a Define → Añadir Caso de Construcción Secuencial",
        "warning",
      );
    }
  },

  // Métodos para Ritz
  selectAvailableLoad(idx) {
    this.selectedAvailableLoad = idx;
  },

  selectRitzLoad(idx) {
    this.selectedRitzLoad = idx;
  },

  addToRitzVectors() {
    if (this.selectedAvailableLoad !== null) {
      var loadToAdd = this.availableLoads[this.selectedAvailableLoad];
      // Verificar si ya existe
      var exists = false;
      for (var i = 0; i < this.ritzLoads.length; i++) {
        if (this.ritzLoads[i].name === loadToAdd.name) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        this.ritzLoads.push({ ...loadToAdd });
      }
      this.selectedAvailableLoad = null;
    }
  },

  removeFromRitzVectors() {
    if (this.selectedRitzLoad !== null) {
      this.ritzLoads.splice(this.selectedRitzLoad, 1);
      this.selectedRitzLoad = null;
    }
  },

  // Cargar opciones dinámicas desde cadSystem
  loadDynamicOptions() {
    if (window.cadSystem && window.cadSystem.dynamicParams) {
      this.dynamicParams = window.cadSystem.dynamicParams;
    }
    // Cargar cargas disponibles desde cadSystem
    if (window.cadSystem && window.cadSystem.loadCases && window.cadSystem.loadCases.cases) {
      this.availableLoads = window.cadSystem.loadCases.cases.map((c) => ({ name: c.name, type: c.type }));
    }
  },

  // Guardar parámetros dinámicos
  saveDynamicParams() {
    // Guardar en cadSystem
    if (window.cadSystem) {
      window.cadSystem.dynamicParams = {
        numModes: this.dynamicParams.numModes,
        analysisType: this.dynamicParams.analysisType,
        freqShift: this.dynamicParams.freqShift,
        cutoffFrequency: this.dynamicParams.cutoffFrequency,
        tolerance: this.dynamicParams.tolerance,
        includeResidualModes: this.dynamicParams.includeResidualModes,
        ritzLoads: this.dynamicParams.ritzLoads,
      };
    }
    this.showDynamicParamsDialog = false;
    this.showToastMessage("Parámetros dinámicos guardados", "success");
  },

  loadOptions() {
    if (window.cadSystem && window.cadSystem.analysisOptions) {
      var opts = window.cadSystem.analysisOptions;
      this.analysisType = opts.analysisType || "full3d";
      this.dof = opts.dof || { ux: true, uy: true, uz: true, rx: true, ry: true, rz: true };
      this.dynamicAnalysis = opts.dynamicAnalysis || { enabled: true };
      // Cargar parámetros dinámicos
      if (opts.dynamicParams) {
        this.dynamicParams = opts.dynamicParams;
      }
      this.pDelta = opts.pDelta || { enabled: false };
      this.pDeltaParams = opts.pDeltaParams || {
        iterations: 10,
        tolerance: "1.000E-04",
        includeLargeDisplacements: false,
      };
      this.dbAccess = opts.dbAccess || { enabled: false, filename: "analysis_output" };
    }

    // Cargar cargas disponibles
    if (window.cadSystem && window.cadSystem.loadCases && window.cadSystem.loadCases.cases) {
      this.availableLoads = window.cadSystem.loadCases.cases.map((c) => ({ name: c.name, type: c.type }));
    }
  },

  openDynamicParamsDialog() {
    if (this.dynamicAnalysis.enabled) {
      // Cargar los vectores Ritz existentes
      if (window.cadSystem && window.cadSystem.dynamicParams && window.cadSystem.dynamicParams.ritzLoads) {
        this.dynamicParams.ritzLoads = [...window.cadSystem.dynamicParams.ritzLoads];
      } else {
        this.dynamicParams.ritzLoads = [];
      }
      this.selectedAvailableLoad = null;
      this.selectedRitzLoad = null;
      this.showDynamicParamsDialog = true;
    }
  },


};
