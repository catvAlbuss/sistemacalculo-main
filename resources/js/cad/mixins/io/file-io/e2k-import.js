// mixins/io/file-io/e2k-import.js — parte "e2k-import" de file-io
// (file-io.js se partió en sub-mixins por responsabilidad; barril en file-io.js).
import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../../../model/shapes.js";
import { read as readmat } from "mat-for-js";
import { axisToFixed, removeFromArray } from "../../../lib/utils.js";
import { Triangle, Puente, Arco } from "../../../model/parametricModels.js";
import { extrudeToNewFloor, selectAllNodes, activate3DDrawingMode } from "../../../3d/modeling3d.js";
import { toggleView3D } from "../../../3d/viewer3d.js";
import {
  serializeFrameForceModule,
  restoreFrameForceModule,
} from "../../../engine/frameForcePersistence.js";

export const e2kImportMixin = {

  // Import methods
  openTextFileForImport(accept = ".txt,.e2k") {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");

      input.type = "file";
      input.accept = accept;

      input.onchange = async (event) => {
        try {
          const file = event.target.files?.[0];

          if (!file) {
            resolve(null);
            return;
          }

          const text = await file.text();

          resolve({
            file,
            text,
          });
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    });
  },

  getQuotedValue(line, key) {
    const regex = new RegExp(`${key}\\s+"([^"]*)"`, "i");
    const match = String(line || "").match(regex);

    return match ? match[1] : null;
  },

  getNumericValue(line, key, fallback = 0) {
    const regex = new RegExp(`${key}\\s+(-?\\d+(?:\\.\\d+)?)`, "i");
    const match = String(line || "").match(regex);

    if (!match) return fallback;

    const value = Number(match[1]);

    return Number.isFinite(value) ? value : fallback;
  },

  getWordValue(line, key, fallback = "") {
    const regex = new RegExp(`${key}\\s+([^\\s]+)`, "i");
    const match = String(line || "").match(regex);

    return match ? match[1] : fallback;
  },

  parseJSONAfterData(line) {
    const marker = " DATA ";
    const index = String(line || "").indexOf(marker);

    if (index < 0) return null;

    try {
      return JSON.parse(line.slice(index + marker.length));
    } catch (error) {
      console.warn("No se pudo leer DATA JSON en línea E2K:", line, error);
      return null;
    }
  },

  // FUNCION AUXILIAR PARA IMPORTAR: DEVUELVE UNA ESTRUCTURA DE CARGAS POR NODO CON VALORES POR DEFECTO (0) PARA LOS DISTINTOS TIPOS DE CARGA
  getDefaultNodeForceForImport() {
    return {
      loads: {
        CM: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CV: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CVVM: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CVVP: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CN: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CLL: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
      },
    };
  },

  parseInitialE2KText(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("$"));

    const stories = [];
    const xGrids = [];
    const yGrids = [];
    const generalGrids = [];
    const materials = [];
    const frameSections = [];
    const nodes = [];
    const frames = [];
    const areas = [];

    const nodeMap = new Map();
    const frameMap = new Map();

    const frameSectionAssignments = new Map();

    lines.forEach((line) => {
      // ===============================
      // STORIES
      // STORY "Piso 1" ID 1 ELEV 3
      // ===============================
      if (line.startsWith("STORY ")) {
        const name = this.getQuotedValue(line, "STORY") || "Story";
        const id = this.getNumericValue(line, "ID", stories.length);
        const elevation = this.getNumericValue(line, "ELEV", 0);

        stories.push({
          id,
          name,
          elevation,
        });

        return;
      }

      // ===============================
      // GRIDLINE
      // GRIDLINE DIR X ID "A" ORD 0 VISIBLE YES BUBBLE "End"
      // ===============================
      if (line.startsWith("GRIDLINE ")) {
        const dir = this.getWordValue(line, "DIR", "").toUpperCase();
        const id = this.getQuotedValue(line, "ID") || "";
        const ordinate = this.getNumericValue(line, "ORD", 0);
        const visible = !/VISIBLE\s+NO/i.test(line);
        const bubbleLoc = this.getQuotedValue(line, "BUBBLE") || (dir === "X" ? "End" : "Start");

        const gridData = {
          id,
          ordinate,
          visible,
          bubbleLoc,
        };

        if (dir === "X") {
          xGrids.push(gridData);
        }

        if (dir === "Y") {
          yGrids.push(gridData);
        }

        return;
      }

      // ===============================
      // GENERAL GRID
      // GENERALGRID "A" X1 0 Y1 0 X2 0 Y2 10 SOURCE "x" VISIBLE YES
      // ===============================
      if (line.startsWith("GENERALGRID ")) {
        const id = this.getQuotedValue(line, "GENERALGRID") || `G${generalGrids.length + 1}`;

        generalGrids.push({
          id,
          label: id,
          x1: this.getNumericValue(line, "X1", 0),
          y1: this.getNumericValue(line, "Y1", 0),
          x2: this.getNumericValue(line, "X2", 0),
          y2: this.getNumericValue(line, "Y2", 0),
          source: this.getQuotedValue(line, "SOURCE") || "custom",
          visible: !/VISIBLE\s+NO/i.test(line),
          bubbleLoc: "End",
        });

        return;
      }

      // ===============================
      // MATERIAL
      // MATERIAL "STEEL" NAME "STEEL" TYPE "Isotropic" E 210000
      // ===============================
      if (line.startsWith("MATERIAL ")) {
        const id = this.getQuotedValue(line, "MATERIAL") || `MAT_${materials.length + 1}`;
        const name = this.getQuotedValue(line, "NAME") || id;
        const type = this.getQuotedValue(line, "TYPE") || "Other";
        const E = this.getNumericValue(line, "E", 0);

        materials.push({
          id,
          name,
          type,
          E,
        });

        return;
      }

      // ===============================
      // FRAME SECTION
      // FRAMESECTION "W10X12" NAME "W10X12" TYPE "wf" A 3.54
      // ===============================
      if (line.startsWith("FRAMESECTION ")) {
        const id = this.getQuotedValue(line, "FRAMESECTION") || `SEC_${frameSections.length + 1}`;
        const name = this.getQuotedValue(line, "NAME") || id;
        const type = this.getQuotedValue(line, "TYPE") || "General";
        const A = this.getNumericValue(line, "A", 0);

        frameSections.push({
          id,
          name,
          type,
          A,
          area: A,
        });

        return;
      }

      // ===============================
      // POINT
      // POINT "1" X 0 Y 0 Z 0
      // ===============================
      if (line.startsWith("POINT ")) {
        const id = Number(this.getQuotedValue(line, "POINT") || nodes.length + 1);

        const nodeData = {
          id,
          x: this.getNumericValue(line, "X", 0),
          y: this.getNumericValue(line, "Y", 0),
          z: this.getNumericValue(line, "Z", 0),

          visible: true,

          constraints: null,
          restraints: null,
          hasRestraints: false,

          pointLoads: [],
          jointLoads: [],
          hasPointLoads: false,
          hasJointLoads: false,

          groupIds: [],
          groupNames: [],
          groups: [],
          hasGroups: false,

          assignment: {},

          // Importante para que renderer.drawForce() no reviente
          force: this.getDefaultNodeForceForImport(),
          reaction: {
            x: 0,
            y: 0,
            z: 0,
          },
        };

        nodes.push(nodeData);
        nodeMap.set(String(id), nodeData);

        return;
      }

      // ===============================
      // FRAME
      // FRAME "1" I "1" J "2" TYPE "beam" SECTION "W10X12"
      // ===============================
      if (line.startsWith("FRAME ")) {
        const id = Number(this.getQuotedValue(line, "FRAME") || frames.length + 1);
        const node1Id = this.getQuotedValue(line, "I");
        const node2Id = this.getQuotedValue(line, "J");
        const type = this.getQuotedValue(line, "TYPE") || "beam";
        const sectionName = this.getQuotedValue(line, "SECTION");

        const section =
          frameSections.find(
            (item) => String(item.id) === String(sectionName) || String(item.name) === String(sectionName),
          ) || null;

        const frameData = {
          id,
          node1: Number(node1Id),
          node2: Number(node2Id),
          node1Id: Number(node1Id),
          node2Id: Number(node2Id),
          type,
          elementType: type,
          objectType: "frame",
          sectionId: section && sectionName !== "NONE" ? section.id : null,
          sectionName: section && sectionName !== "NONE" ? section.name : null,
          section: section && sectionName !== "NONE" ? { ...section } : null,
          frameSection: section && sectionName !== "NONE" ? { ...section } : null,
          hasAssignedSection: Boolean(section && sectionName !== "NONE"),
          A: section?.A ?? null,
          _A: section?.A ?? null,
          frameLoads: [],
          lineLoads: [],
          assignment: {},
        };

        frames.push(frameData);
        frameMap.set(String(id), frameData);

        return;
      }

      // ===============================
      // AREA
      // AREA "1" TYPE "area" P1(0,0,0) P2(...)
      // Versión básica: por ahora guarda línea como metadata.
      // ===============================
      if (line.startsWith("AREA ")) {
        const id = Number(this.getQuotedValue(line, "AREA") || areas.length + 1);
        const type = this.getQuotedValue(line, "TYPE") || "area";

        areas.push({
          id,
          type,
          areaType: type,
          points: [],
          raw: line,
          assignment: {},
        });

        return;
      }

      // ===============================
      // ASSIGN FRAME
      // ASSIGN FRAME "2" SECTION "W10X12"
      // ===============================
      if (line.startsWith("ASSIGN FRAME ")) {
        const frameId = this.getQuotedValue(line, "FRAME");
        const sectionName = this.getQuotedValue(line, "SECTION");

        if (frameId && sectionName) {
          frameSectionAssignments.set(String(frameId), sectionName);
        }

        return;
      }

      // ===============================
      // JOINT LOAD
      // JOINTLOAD POINT "1" CASE "DEAD" TYPE "force" DATA {...}
      // ===============================
      if (line.startsWith("JOINTLOAD ")) {
        const nodeId = this.getQuotedValue(line, "POINT");
        const loadData = this.parseJSONAfterData(line);

        if (nodeId && loadData && nodeMap.has(String(nodeId))) {
          const node = nodeMap.get(String(nodeId));

          node.pointLoads.push(loadData);
          node.jointLoads.push(loadData);
          node.hasPointLoads = true;
          node.hasJointLoads = true;
          node.assignment.pointLoads = node.pointLoads;
          node.assignment.jointLoads = node.jointLoads;
        }

        return;
      }

      // ===============================
      // FRAME LOAD
      // FRAMELOAD FRAME "2" CASE "DEAD" TYPE "distributed" DATA {...}
      // ===============================
      if (line.startsWith("FRAMELOAD ")) {
        const frameId = this.getQuotedValue(line, "FRAME");
        const loadData = this.parseJSONAfterData(line);

        if (frameId && loadData && frameMap.has(String(frameId))) {
          const frame = frameMap.get(String(frameId));

          frame.frameLoads.push(loadData);
          frame.lineLoads.push(loadData);
          frame.hasFrameLoads = true;
          frame.hasLineLoads = true;
          frame.assignment.frameLoads = frame.frameLoads;
          frame.assignment.lineLoads = frame.lineLoads;
        }

        return;
      }
    });

    // Reaplicar asignaciones de sección explícitas.
    frameSectionAssignments.forEach((sectionName, frameId) => {
      const frame = frameMap.get(String(frameId));

      if (!frame) return;

      const section =
        frameSections.find(
          (item) => String(item.id) === String(sectionName) || String(item.name) === String(sectionName),
        ) || null;

      if (!section || sectionName === "NONE") return;

      frame.sectionId = section.id;
      frame.sectionName = section.name;
      frame.section = { ...section };
      frame.frameSection = { ...section };
      frame.A = section.A ?? section.area ?? null;
      frame._A = section.A ?? section.area ?? null;
      frame.hasAssignedSection = true;

      frame.assignment = {
        ...(frame.assignment || {}),
        frameSection: {
          id: section.id,
          name: section.name,
        },
      };
    });

    // Si el archivo no trae stories, crear Base por defecto.
    if (!stories.length) {
      stories.push({
        id: 0,
        name: "Base",
        elevation: 0,
      });
    }

    // Calcular storyCount y storyHeight.
    const sortedStories = [...stories].sort((a, b) => Number(a.elevation || 0) - Number(b.elevation || 0));

    const storyCount = Math.max(0, sortedStories.length - 1);

    const storyHeight =
      sortedStories.length > 1 ? Number(sortedStories[1].elevation || 0) - Number(sortedStories[0].elevation || 0) : 3;

    // Si no hay grillas, crear una grilla mínima a partir de nodos.
    if (!xGrids.length) {
      const xs = [...new Set(nodes.map((node) => Number(node.x || 0)))].sort((a, b) => a - b);

      xs.forEach((x, index) => {
        xGrids.push({
          id: String.fromCharCode(65 + index),
          ordinate: x,
          visible: true,
          bubbleLoc: "End",
        });
      });
    }

    if (!yGrids.length) {
      const ys = [...new Set(nodes.map((node) => Number(node.y || 0)))].sort((a, b) => a - b);

      ys.forEach((y, index) => {
        yGrids.push({
          id: String(index + 1),
          ordinate: y,
          visible: true,
          bubbleLoc: "Start",
        });
      });
    }

    return {
      app: "JHACK-ETABS-WEB",
      fileType: "internal-model-json-imported-from-e2k-initial",
      schemaVersion: "1.0.0",
      importedAt: new Date().toISOString(),

      model: {
        referenceGrid: {
          xGrids,
          yGrids,
          generalGrids,
          xPositions: [],
          yPositions: [],
          xLabels: [],
          yLabels: [],
          storyCount,
          storyHeight,
        },

        stories: sortedStories,
        nodes,
        frames,
        beams: frames,
        shapes: frames,
        areas,

        // B10.11 — Store global de cargas Frame / Line Loads
        frameLoadAssignmentsById: clean(frameLoadStore.frameLoadAssignmentsById, {}),
        frameLoadAssignments: clean(frameLoadStore.frameLoadAssignments, []),

        activeViewIndex: 0,
        activeStory: 0,
        currentViewMode: "plan",
        currentStory: "BASE",
        currentElevationX: "none",
        currentElevationZ: "none",

        referencePlanes: [],
        referencePoints: [],
        dimensionLines: [],
      },

      definitions: {
        materials,
        frameSections,
        loadCases: this.loadCases?.cases || [],
        loadCombinations: this.loadCombinations?.combinations || this.loadCombinations?.items || [],
        diaphragms: this.diaphragms?.items || [],
        groups: this.groups?.items || [],
        massSource: this.massSource || null,
      },

      options: {
        displayOptions: this.displayOptions || {},
        designOptions: this.designOptions || {},
        preferences: this.preferences || {},
        outputDecimals: this.outputDecimals || {},
        steelFrameDesign: this.steelFrameDesign || {},
        reinforcementBarSizes: this.reinforcementBarSizes || [],
        dynamicParams: this.dynamicParams || {},
        analysisOptions: this.analysisOptions || null,
        canvasTheme: this.activeCanvasTheme || "dark",
      },

      results: {},
    };
  },

  // ¿El texto es un .e2k REAL de ETABS (formato por pisos) y no el nuestro viejo?
  isRealETABS_E2K(text) {
    const t = String(text || "");
    return /\$\s*POINT COORDINATES/i.test(t) ||
      (/PROGRAM\s+"ETABS"/i.test(t) && /\$\s*LINE CONNECTIVITIES/i.test(t));
  },

  // Propiedades de una sección rectangular b×h (en metros): A, Iz, Iy, J.
  // Iz = eje fuerte (peralte h). J = fórmula de torsión de Saint-Venant.
  _rectSectionProps(b, h) {
    const A = b * h;
    const Iz = (b * Math.pow(h, 3)) / 12;
    const Iy = (h * Math.pow(b, 3)) / 12;
    const t1 = Math.min(b, h);
    const t2 = Math.max(b, h);
    const J = Math.pow(t1, 3) * t2 * (1 / 3 - 0.21 * (t1 / t2) * (1 - Math.pow(t1, 4) / (12 * Math.pow(t2, 4))));
    return { A, area: A, Iz, Iy, J };
  },

  // Propiedades de una sección "L" de concreto (FRAMESECTION SHAPE "Concrete L" /
  // SDSECTION SHAPETYPE "CONC L"). D=peralte total, B=ancho total, TF=espesor
  // del ala horizontal, TW=espesor del alma vertical. Origen (0,0) en la
  // esquina exterior donde se unen las dos alas. Iz/Iy se calculan sobre los
  // ejes horizontal/vertical (NO se rota a ejes principales: se ignora el
  // producto de inercia Iyz, aproximación consistente con el resto del
  // importador para secciones no simétricas). J por fórmula de pared delgada
  // abierta (suma de las dos alas), aproximada. Devuelve también {cx,cy}: el
  // centroide relativo a esa esquina, para poder trasladarlo en una SDSECTION.
  _lSectionProps(D, B, TF, TW) {
    D = Number(D) || 0; B = Number(B) || 0; TF = Number(TF) || 0; TW = Number(TW) || 0;
    if (D <= 0 || B <= 0 || TF <= 0 || TW <= 0 || TW >= B || TF >= D) return null;

    const A1 = TW * D; // ala vertical (alma)
    const A2 = (B - TW) * TF; // ala horizontal (resto, sin duplicar la esquina)
    const A = A1 + A2;
    if (A <= 0) return null;

    const cx1 = TW / 2, cy1 = D / 2;
    const cx2 = (TW + B) / 2, cy2 = TF / 2;
    const cx = (A1 * cx1 + A2 * cx2) / A;
    const cy = (A1 * cy1 + A2 * cy2) / A;

    const Ixx1 = (TW * Math.pow(D, 3)) / 12, Iyy1 = (D * Math.pow(TW, 3)) / 12;
    const Ixx2 = ((B - TW) * Math.pow(TF, 3)) / 12, Iyy2 = (TF * Math.pow(B - TW, 3)) / 12;
    const Iz = Ixx1 + A1 * Math.pow(cy1 - cy, 2) + Ixx2 + A2 * Math.pow(cy2 - cy, 2); // eje horizontal (usa D)
    const Iy = Iyy1 + A1 * Math.pow(cx1 - cx, 2) + Iyy2 + A2 * Math.pow(cx2 - cx, 2); // eje vertical (usa B)
    const J = (D * Math.pow(TW, 3) + B * Math.pow(TF, 3)) / 3; // aprox. pared delgada abierta

    return { A, area: A, Iz, Iy, J, cx, cy };
  },

  // Combina las piezas de concreto de una SDSECTION (ETABS Section Designer:
  // placas/columnas con forma compuesta, p.ej. muros en L) en propiedades
  // elásticas equivalentes sobre el centroide del conjunto. Ignora el acero de
  // refuerzo (SHAPETYPE REBAR/LINE REBAR): para análisis elástico sin
  // agrietamiento se usa la sección bruta de concreto, igual que el resto del
  // modelo (ver memoria de calibración ETABS: NO agrietamiento). Cada pieza ya
  // viene trasladada a coordenadas de la SDSECTION: {A,Iz,Iy,J,X,Y}.
  _sdCompositeProps(pieces) {
    const parts = (pieces || []).filter((p) => p && p.A > 0);
    if (!parts.length) return null;
    const Atot = parts.reduce((s, p) => s + p.A, 0);
    const Xc = parts.reduce((s, p) => s + p.A * p.X, 0) / Atot;
    const Yc = parts.reduce((s, p) => s + p.A * p.Y, 0) / Atot;
    let Iz = 0, Iy = 0, J = 0;
    parts.forEach((p) => {
      Iz += p.Iz + p.A * Math.pow(p.Y - Yc, 2);
      Iy += p.Iy + p.A * Math.pow(p.X - Xc, 2);
      J += p.J || 0;
    });
    return { A: Atot, area: Atot, Iz, Iy, J };
  },

  // ============================================================
  //  IMPORTACIÓN .e2k NATIVA DE ETABS (Fases 1+2: geometría + cargas)
  //  Expande la representación por pisos de ETABS (POINT en planta +
  //  ASSIGN por Story) al modelo 3D explícito del CAD. Inverso del export.
  //  Entrada en TONF·M → se convierte a las unidades internas del app.
  // ============================================================
  parseETABS_E2K(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("$"));

    const TONF_TO_N = 9806.65;
    const TONFM2_TO_MPA = 0.00980665; // 1 tonf/m² = 0.00980665 MPa
    const round3 = (v) => Math.round((Number(v) || 0) * 1000) / 1000;

    const quotedAll = (line) => [...String(line).matchAll(/"([^"]*)"/g)].map((m) => m[1]);
    const bareNums = (line) =>
      [...String(line).replace(/"[^"]*"/g, " ").matchAll(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)].map((m) => Number(m[0]));
    const q = (line, key) => this.getQuotedValue(line, key);
    // Extracción numérica con límite de palabra (evita que la "E" de
    // WEIGHTPERVOLUME capture el número, etc.).
    const kvNum = (line, key, fb = 0) => {
      const m = String(line).match(new RegExp(`(?:^|\\s)${key}\\s+(-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)`, "i"));
      return m ? Number(m[1]) : fb;
    };
    const hasKey = (line, key) => new RegExp(`(?:^|\\s)${key}\\s`, "i").test(line);

    // ── Acumuladores de definiciones ──
    const storyOrder = []; // top-down: {name, height, elev|null}
    const xGrids = [];
    const yGrids = [];
    const materialMap = new Map();
    const frameSecMap = new Map();
    const sdSectionMap = new Map(); // name → {angle, pieces:[{A,Iz,Iy,J,X,Y}]} (Section Designer)
    const slabSecMap = new Map();
    const pointCoords = new Map(); // pointId → {x,y}
    const lineConn = new Map(); // lineName → {kind, pi, pj}
    const areaConn = new Map(); // areaName → [ptIds]
    const diaphragmDefs = [];
    const loadPatternDefs = [];
    const massSourceLoads = [];
    let massSourceName = "MASS_SOURCE_1";
    // Fase 3 (sísmico): funciones de espectro + casos Response Spectrum.
    const rsFuncMap = new Map(); // name → {name, id, points:[{T,Sa}], damping, spectype}
    const rsCaseMap = new Map(); // name → {name, type, spectra, damping, eccRatio}

    // ── PASO 1: definiciones (orden de aparición) ──
    lines.forEach((line) => {
      if (/^STORY\s/i.test(line)) {
        storyOrder.push({
          name: quotedAll(line)[0] || "Story",
          height: kvNum(line, "HEIGHT", 0),
          elev: hasKey(line, "ELEV") ? kvNum(line, "ELEV", 0) : null,
        });
      } else if (/^GRID\s/i.test(line)) {
        const dir = (q(line, "DIR") || "").toUpperCase();
        const g = {
          id: q(line, "LABEL") || "",
          ordinate: kvNum(line, "COORD", 0),
          visible: !/VISIBLE\s+"?No/i.test(line),
          bubbleLoc: q(line, "BUBBLELOC") || (dir === "X" ? "End" : "Start"),
        };
        if (dir === "X") xGrids.push(g);
        else if (dir === "Y") yGrids.push(g);
      } else if (/^DIAPHRAGM\s/i.test(line)) {
        const name = quotedAll(line)[0];
        if (name) diaphragmDefs.push({ name, rigidity: /RIGID/i.test(line) ? "Rigid" : "Semi Rigid", description: `Diafragma ${name}` });
      } else if (/^MATERIAL\s/i.test(line)) {
        const name = quotedAll(line)[0];
        if (!name) return;
        let m = materialMap.get(name);
        if (!m) { m = { name, type: "Isotropic", designType: "Other" }; materialMap.set(name, m); }
        // TYPE con límite de palabra: evita capturar HYSTYPE/SYMTYPE/SSTYPE/PROPTYPE.
        const typeMatch = line.match(/(?:^|\s)TYPE\s+"([^"]*)"/i);
        const type = typeMatch ? typeMatch[1] : null;
        if (type) m.designType = /concrete/i.test(type) ? "Concrete" : /steel/i.test(type) ? "Steel" : /rebar/i.test(type) ? "Rebar" : /tendon/i.test(type) ? "Tendon" : /masonry/i.test(type) ? "Masonry" : type;
        if (hasKey(line, "WEIGHTPERVOLUME")) {
          const wpv = kvNum(line, "WEIGHTPERVOLUME", 0); // tonf/m³
          m.unitWeight = wpv * TONF_TO_N; // N/m³ (lo que lee el mass source)
          m.weightPerUnitVolume = (wpv * TONF_TO_N) / 1e9; // N/mm³ (convención del app)
          m.weight = m.weightPerUnitVolume;
          m.massPerUnitVolume = wpv * 1e-9; // ton/mm³ (densidad; _densityFor ×1e12 → kg/m³)
        }
        if (hasKey(line, "E")) { const E = kvNum(line, "E", 0) * TONFM2_TO_MPA; if (E) { m.E = E; m.modulusElasticity = E; } }
        if (hasKey(line, "U")) { const U = kvNum(line, "U", 0); m.poisson = U; m.poissonRatio = U; }
        // A en la línea SYMTYPE = coeficiente de expansión térmica.
        if (hasKey(line, "SYMTYPE") && hasKey(line, "A")) m.thermalExpansion = kvNum(line, "A", 0);
        if (hasKey(line, "FC")) { m.fc = kvNum(line, "FC", 0) * TONFM2_TO_MPA; m.fpc = m.fc; }
        if (hasKey(line, "FY")) { m.fy = kvNum(line, "FY", 0) * TONFM2_TO_MPA; m.fys = m.fy; }
        if (m.E != null && m.poisson != null) m.shearModulus = m.E / (2 * (1 + m.poisson));
      } else if (/^FRAMESECTION\s/i.test(line)) {
        const name = quotedAll(line)[0];
        const shape = q(line, "SHAPE");
        // Líneas de MODIFICADOR sin SHAPE (p.ej. `FRAMESECTION "X" JMOD 0.001`)
        // son continuaciones de una sección YA definida arriba en el archivo:
        // si se procesaban igual, pisaban la definición buena con una vacía
        // (A=0, sección "general" sin Iz/Iy). Se ignoran.
        if (!shape) return;
        const material = q(line, "MATERIAL") || "";
        if (/rectangular/i.test(shape)) {
          const D = kvNum(line, "D", 0); // peralte m
          const B = kvNum(line, "B", 0); // ancho m
          frameSecMap.set(name, { name, type: "rect", material, b: B * 100, h: D * 100, ...this._rectSectionProps(B, D), description: name });
        } else if (/^concrete l$/i.test(shape)) {
          const D = kvNum(line, "D", 0), B = kvNum(line, "B", 0), TF = kvNum(line, "TF", 0), TW = kvNum(line, "TW", 0);
          const props = this._lSectionProps(D, B, TF, TW);
          frameSecMap.set(name, props
            ? { name, type: "L", material, b: B * 100, h: D * 100, A: props.A, area: props.area, Iz: props.Iz, Iy: props.Iy, J: props.J, description: name }
            : { name, type: "general", material, A: 0.01, area: 0.01, Iz: 1e-4, Iy: 1e-4 });
        } else if (/sd section/i.test(shape)) {
          // Sección de Section Designer (muros/columnas de forma compuesta):
          // se resuelve después de leer todas las SDSECTION del archivo.
          frameSecMap.set(name, { name, type: "sd-pending", material });
        } else {
          // Perfiles no modelados a detalle (Steel Tube, Concrete Tee, etc.):
          // mejor una sección rectangular MACIZA equivalente D×B (sobreestima
          // algo la rigidez de perfiles huecos) que quedar prácticamente sin
          // rigidez — antes caían aquí con A=0 por no traer campo AREA.
          const D = kvNum(line, "D", 0), B = kvNum(line, "B", 0);
          if (D > 0 && B > 0) {
            frameSecMap.set(name, { name, type: "rect-approx", material, b: B * 100, h: D * 100, ...this._rectSectionProps(B, D), description: name });
          } else {
            const A = kvNum(line, "AREA", 0);
            frameSecMap.set(name, { name, type: "general", material, A, area: A });
          }
        }
      } else if (/^SDSECTION\s/i.test(line)) {
        const name = quotedAll(line)[0];
        if (!name) return;
        let sd = sdSectionMap.get(name);
        if (!sd) { sd = { angle: 0, pieces: [] }; sdSectionMap.set(name, sd); }

        const shapeLine = /(?:^|\s)SHAPE\s+\d/i.test(line); // "SHAPE 1" (bare) = pieza; si no, es la cabecera
        if (!shapeLine) {
          if (hasKey(line, "ANGLE")) sd.angle = kvNum(line, "ANGLE", 0);
          return;
        }

        const shapeType = q(line, "SHAPETYPE") || "";
        if (!/^conc/i.test(shapeType)) return; // ignora acero de refuerzo (REBAR / LINE REBAR)

        const XC = kvNum(line, "XC", 0), YC = kvNum(line, "YC", 0);
        if (/^conc rectangular$|^conc rectangle$/i.test(shapeType)) {
          const D = kvNum(line, "D", 0), B = kvNum(line, "B", 0);
          const p = this._rectSectionProps(B, D);
          if (p.A > 0) sd.pieces.push({ A: p.A, Iz: p.Iz, Iy: p.Iy, J: p.J, X: XC, Y: YC });
        } else if (/^conc l$/i.test(shapeType)) {
          const D = kvNum(line, "D", 0), B = kvNum(line, "B", 0), TF = kvNum(line, "TF", 0), TW = kvNum(line, "TW", 0);
          const p = this._lSectionProps(D, B, TF, TW);
          if (p) sd.pieces.push({ A: p.A, Iz: p.Iz, Iy: p.Iy, J: p.J, X: XC + p.cx, Y: YC + p.cy });
        }
        // Otras formas de concreto (CONC CIRCLE, CONC I, CONC T, CONC CROSS...)
        // no están implementadas: se ignoran (la sección queda con las piezas
        // que sí se pudieron leer, o sin ninguna si no había ninguna soportada).
      } else if (/^SHELLPROP\s/i.test(line)) {
        const name = quotedAll(line)[0];
        const proptype = q(line, "PROPTYPE") || "Slab";
        const thM = /WALL/i.test(proptype)
          ? kvNum(line, "WALLTHICKNESS", 0)
          : kvNum(line, "SLABTHICKNESS", kvNum(line, "DECKSLABDEPTH", 0));
        slabSecMap.set(name, {
          name,
          thickness: thM * 1000,
          material: q(line, "MATERIAL") || q(line, "CONCMATERIAL") || "CONC",
          kind: proptype,
          modelingType: q(line, "MODELINGTYPE") || "Membrane",
        });
      } else if (/^POINT\s/i.test(line)) {
        const id = quotedAll(line)[0];
        const nums = bareNums(line);
        if (id != null && nums.length >= 2) pointCoords.set(id, { x: nums[0], y: nums[1] });
      } else if (/^LINE\s/i.test(line)) {
        const toks = quotedAll(line);
        const km = String(line).match(/"[^"]*"\s+(COLUMN|BEAM|BRACE)\b/i);
        if (toks[0] && toks[1] != null && toks[2] != null) {
          lineConn.set(toks[0], { kind: km ? km[1].toUpperCase() : "BEAM", pi: toks[1], pj: toks[2] });
        }
      } else if (/^AREA\s/i.test(line)) {
        const toks = quotedAll(line);
        const nums = bareNums(line);
        const nPts = nums.length ? nums[0] : toks.length - 1;
        const pts = toks.slice(1, 1 + nPts);
        if (toks[0] && pts.length >= 3) areaConn.set(toks[0], pts);
      } else if (/^LOADPATTERN\s/i.test(line)) {
        const name = quotedAll(line)[0];
        if (name) loadPatternDefs.push({ name, type: q(line, "TYPE") || "Other", selfWeightMultiplier: kvNum(line, "SELFWEIGHT", 0) });
      } else if (/^MASSSOURCE\s/i.test(line)) {
        massSourceName = quotedAll(line)[0] || massSourceName;
      } else if (/^MASSSOURCELOAD\s/i.test(line)) {
        const toks = quotedAll(line);
        const nums = bareNums(line);
        const pat = toks[1];
        const factor = nums.length ? nums[nums.length - 1] : 1;
        if (pat) massSourceLoads.push({ load: pat, name: pat, multiplier: factor, factor, type: "Other" });
      } else if (/^FUNCTION\s/i.test(line)) {
        const name = quotedAll(line)[0];
        if (!name) return;
        let f = rsFuncMap.get(name);
        if (!f) { f = { name, id: name, type: "response-spectrum", units: "Sa en g", damping: 0.05, spectype: "", functype: "", points: [] }; rsFuncMap.set(name, f); }
        if (hasKey(line, "FUNCTYPE")) f.functype = q(line, "FUNCTYPE") || f.functype;
        if (hasKey(line, "DAMPRATIO")) f.damping = kvNum(line, "DAMPRATIO", 0.05);
        const spectype = q(line, "SPECTYPE");
        if (spectype) f.spectype = spectype;
        if (hasKey(line, "TIMEVAL")) {
          // Los pares "T Sa T Sa..." van DENTRO de las comillas de TIMEVAL, así
          // que se extraen del contenido citado (bareNums quita lo entrecomillado).
          const tv = q(line, "TIMEVAL") || "";
          const nums = [...tv.matchAll(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)].map((mm) => Number(mm[0]));
          for (let i = 0; i + 1 < nums.length; i += 2) f.points.push({ T: nums[i], Sa: nums[i + 1] });
        }
      } else if (/^LOADCASE\s/i.test(line)) {
        const name = quotedAll(line)[0];
        if (!name) return;
        let c = rsCaseMap.get(name);
        if (!c) { c = { name, type: "", spectra: {}, damping: 0.05, eccRatio: 0 }; rsCaseMap.set(name, c); }
        const typeMatch = line.match(/(?:^|\s)TYPE\s+"([^"]*)"/i);
        if (typeMatch) c.type = typeMatch[1];
        if (hasKey(line, "MAXMODES")) c.maxModes = kvNum(line, "MAXMODES", 0);
        if (hasKey(line, "ACCEL")) {
          const dir = q(line, "ACCEL"); // U1/U2/U3
          const func = q(line, "FUNC");
          const sf = kvNum(line, "SF", 1);
          if (dir && func) c.spectra[dir === "U3" ? "UZ" : dir] = { functionId: func, scaleFactor: sf };
        }
        if (hasKey(line, "CONSTDAMP")) c.damping = kvNum(line, "CONSTDAMP", 0.05);
        if (hasKey(line, "ECCENRATIOTYPICAL")) c.eccRatio = kvNum(line, "ECCENRATIOTYPICAL", 0);
        const combo = q(line, "MODALCOMBO");
        if (combo) c.modalCombination = combo;
      }
    });

    // ── Resolver secciones "SD Section" (Section Designer) pendientes ──
    // Se combinan las piezas de concreto de la SDSECTION correspondiente en
    // A/Iz/Iy/J equivalentes. Si ANGLE≈90 (mod 180), los ejes locales de la
    // sección están rotados 90° respecto a como se definieron las piezas →
    // se intercambian Iz/Iy (dentro de la misma aproximación de ejes no
    // principales usada en _lSectionProps/_sdCompositeProps).
    frameSecMap.forEach((sec, name) => {
      if (sec.type !== "sd-pending") return;
      const sd = sdSectionMap.get(name);
      const props = sd ? this._sdCompositeProps(sd.pieces) : null;
      if (props) {
        const angleMod = (((sd.angle % 180) + 180) % 180);
        const swap = Math.abs(angleMod - 90) < 1e-6;
        frameSecMap.set(name, {
          name, type: "sd", material: sec.material,
          A: props.A, area: props.area,
          Iz: swap ? props.Iy : props.Iz,
          Iy: swap ? props.Iz : props.Iy,
          J: props.J,
          description: name,
        });
      } else {
        console.warn(`⚠️ SDSECTION "${name}" sin piezas de concreto reconocidas (CONC L/CONC RECTANGULAR) — sección con rigidez mínima de respaldo.`);
        frameSecMap.set(name, { name, type: "general", material: sec.material, A: 0.01, area: 0.01, Iz: 1e-4, Iy: 1e-4 });
      }
    });

    // ── Completar campos de material que ETABS deja implícitos ──
    materialMap.forEach((m) => {
      m.type = "Isotropic";
      if (m.designType === "Concrete" && m.fy == null) { m.fy = 420; m.fys = 420; } // acero de refuerzo estándar (MPa)
      if (m.fys == null) m.fys = m.fy ?? null;
      if (m.fpc == null) m.fpc = m.fc ?? 0;
      if (m.thermalExpansion == null) m.thermalExpansion = 9.9e-6;
      if (m.shearModulus == null && m.E != null) m.shearModulus = m.E / (2 * (1 + (m.poisson ?? 0.2)));
      m.lightweight = false;
      m.shearReduce = false;
      m.color = m.color || "#888888";
      m.descripcion = m.descripcion || m.name;
    });

    // ── Elevaciones de piso (acumular de abajo hacia arriba) ──
    const storiesAsc = storyOrder.slice().reverse(); // Base primero
    const storyElev = new Map();
    let elev = 0;
    storiesAsc.forEach((s, i) => {
      elev = i === 0 ? (s.elev != null ? s.elev : 0) : elev + (s.height || 0);
      s._elev = elev;
      storyElev.set(s.name, elev);
    });
    const belowElevOf = (name) => {
      const idx = storiesAsc.findIndex((s) => s.name === name);
      return idx <= 0 ? 0 : storiesAsc[idx - 1]._elev;
    };

    // ── Nodos (dedup por x,y,z) ──
    const nodes = [];
    const nodeIdByKey = new Map();
    const getNode = (x, y, z) => {
      const k = `${round3(x)}|${round3(y)}|${round3(z)}`;
      if (nodeIdByKey.has(k)) return nodeIdByKey.get(k);
      const id = nodes.length + 1;
      nodes.push({ id, x: round3(x), y: round3(y), z: round3(z), visible: true });
      nodeIdByKey.set(k, id);
      return id;
    };

    // ── PASO 2: asignaciones + cargas ──
    const frames = [];
    const areas = [];
    const frameByKey = new Map(); // "line|story" → frame
    const areaByKey = new Map(); // "area|story" → area

    lines.forEach((line) => {
      if (/^POINTASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        const coords = pointCoords.get(toks[0]);
        if (!coords) return;
        const z = storyElev.has(toks[1]) ? storyElev.get(toks[1]) : 0;
        const nd = nodes[getNode(coords.x, coords.y, z) - 1];
        const restr = q(line, "RESTRAINT");
        if (restr) {
          const r = { ux: 0, uy: 0, uz: 0, rx: 0, ry: 0, rz: 0 };
          restr.split(/\s+/).forEach((d) => { const k = d.toLowerCase(); if (k in r) r[k] = 1; });
          nd.restraints = r; nd.constraints = r; nd.hasRestraints = true;
          if (r.ux && r.uy && r.uz && r.rx && r.ry && r.rz) nd.soporte = "soporteUno";
        }
        const diaph = q(line, "DIAPH");
        if (diaph && !/none/i.test(diaph)) { nd.diaphragmName = diaph; nd.hasDiaphragm = true; }
      } else if (/^LINEASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        const conn = lineConn.get(toks[0]);
        if (!conn) return;
        const pi = pointCoords.get(conn.pi);
        const pj = pointCoords.get(conn.pj);
        if (!pi || !pj) return;
        const section = q(line, "SECTION") || "";
        let n1;
        let n2;
        if (conn.kind === "COLUMN") {
          n1 = getNode(pi.x, pi.y, belowElevOf(toks[1]));
          n2 = getNode(pi.x, pi.y, storyElev.get(toks[1]) ?? 0);
        } else {
          const z = storyElev.get(toks[1]) ?? 0;
          n1 = getNode(pi.x, pi.y, z);
          n2 = getNode(pj.x, pj.y, z);
        }
        const kindLc = conn.kind === "COLUMN" ? "column" : conn.kind === "BRACE" ? "brace" : "beam";
        const secObj = frameSecMap.get(section) || { name: section };
        const frame = {
          id: frames.length + 1,
          node1: n1, node2: n2, node1Id: n1, node2Id: n2,
          type: kindLc, elementType: kindLc, objectType: "frame",
          sectionName: section, sectionId: section,
          section: secObj, frameSection: secObj, hasAssignedSection: true,
          A: secObj.A ?? null, _A: secObj.A ?? null,
          material: secObj.material || null,
          frameLoads: [], lineLoads: [], visible: true,
        };
        frames.push(frame);
        frameByKey.set(`${toks[0]}|${toks[1]}`, frame);
      } else if (/^AREAASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        const conn = areaConn.get(toks[0]);
        if (!conn) return;
        const z = storyElev.get(toks[1]) ?? 0;
        const pts = conn
          .map((ptId) => { const c = pointCoords.get(ptId); return c ? { x: round3(c.x), y: round3(c.y), z: round3(z), visible: true, color: null } : null; })
          .filter(Boolean);
        if (pts.length < 3) return;
        pts.forEach((p) => getNode(p.x, p.y, z));
        const section = q(line, "SECTION") || "";
        const slab = slabSecMap.get(section) || { name: section, thickness: 0, material: "CONC" };
        // Peso propio de la losa (kgf/m² = espesor(m) × densidad). ETABS lo incluye
        // vía SELFWEIGHT del patrón CM (losa membrana); el motor lo lee de este
        // campo. Sin esto la masa sale ~9% baja y los periodos ~5% cortos.
        const slabMat = materialMap.get(slab.material);
        const slabMpv = Number(slabMat?.massPerUnitVolume);
        const slabRho = slabMpv > 0 && slabMpv < 1e-3 ? slabMpv * 1e12 : 2400; // kg/m³
        const slabSelfWeightKgM2 = ((Number(slab.thickness) || 0) / 1000) * slabRho;
        // Diafragma asignado a la losa en ETABS (DIAPH "D1") → los nudos lo
        // heredan "From Area" (getExplicitDiaphragmGroups en seismic.js).
        const areaDiaph = q(line, "DIAPH");
        const areaDiaphName = areaDiaph && !/none/i.test(areaDiaph) ? areaDiaph : null;
        const area = {
          id: areas.length + 1,
          type: "slab", areaType: "slab",
          points: pts, z: round3(z),
          slabSection: section,
          slabSelfWeightKgM2,
          diaphragmName: areaDiaphName,
          diaphragmId: areaDiaphName,
          diaphragm: areaDiaphName ? { id: areaDiaphName, name: areaDiaphName, type: "rigid" } : null,
          section: { name: section, thickness: slab.thickness, material: slab.material || "CONC" },
          areaLoads: [], loads: [], visible: true,
        };
        areas.push(area);
        areaByKey.set(`${toks[0]}|${toks[1]}`, area);
      } else if (/^POINTLOAD\s/i.test(line)) {
        const toks = quotedAll(line);
        const coords = pointCoords.get(toks[0]);
        if (!coords) return;
        const z = storyElev.get(toks[1]) ?? 0;
        const nd = nodes[getNode(coords.x, coords.y, z) - 1];
        const lc = q(line, "LC") || "CM";
        const fx = kvNum(line, "FX", 0), fy = kvNum(line, "FY", 0), fz = kvNum(line, "FZ", 0);
        const mx = kvNum(line, "MX", 0), my = kvNum(line, "MY", 0), mz = kvNum(line, "MZ", 0);
        if (!nd.pointLoads) nd.pointLoads = [];
        nd.pointLoads.push({
          id: `JLOAD_${Date.now()}_${nd.pointLoads.length}`,
          type: "force", loadCase: lc, loadPattern: lc, coordinateSystem: "Global",
          fx, fy, fz, mx, my, mz, mxx: mx, myy: my, mzz: mz,
          units: { force: "tonf", moment: "tonf-m", length: "m" },
          forces: { fx, fy, fz, mx, my, mz },
        });
        nd.hasPointLoads = true;
        nd.hasJointLoads = true;
      } else if (/^LINELOAD\s/i.test(line)) {
        const toks = quotedAll(line);
        const frame = frameByKey.get(`${toks[0]}|${toks[1]}`);
        if (!frame) return;
        const lc = q(line, "LC") || "CM";
        const fval = kvNum(line, "FVAL", 0); // tonf/m
        const load = {
          id: `FDIST_${Date.now()}_${frame.frameLoads.length}`,
          type: "distributed", loadCase: lc, coordinateSystem: "Global",
          loadType: "force", direction: "Gravity", distributionType: "uniform",
          distanceType: "relative", startRelativeDistance: 0, endRelativeDistance: 1,
          startAbsoluteDistance: 0, endAbsoluteDistance: 0,
          startValue: fval * TONF_TO_N, endValue: fval * TONF_TO_N,
          startValueDisp: fval, endValueDisp: fval, displayUnit: "tonf/m",
        };
        frame.frameLoads.push(load);
        frame.lineLoads.push(load);
        frame.hasFrameLoads = true;
      } else if (/^AREALOAD\s/i.test(line)) {
        const toks = quotedAll(line);
        const area = areaByKey.get(`${toks[0]}|${toks[1]}`);
        if (!area) return;
        const lc = q(line, "LC") || "CM";
        const fval = kvNum(line, "FVAL", 0); // tonf/m²
        const load = { type: "uniform", loadCase: lc, value: fval * 1000, dir: "gravity" }; // kgf/m²
        area.areaLoads.push(load);
        area.loads.push(load);
      }
    });

    // ── Ensamblado del modelo interno ──
    const stories = storiesAsc.map((s, i) => ({ id: i, name: s.name, elevation: s._elev }));

    const loadCases = loadPatternDefs.map((p) => {
      const t = String(p.type || "").toUpperCase();
      const type = t.includes("DEAD") ? "Dead" : t.includes("ROOF") ? "Live" : t.includes("LIVE") ? "Live" : t.includes("SEISMIC") ? "Seismic" : "Other";
      const swm = Number(p.selfWeightMultiplier) || 0;
      // Forma que espera el modal Load Patterns: selfWeight (check) + value (mult).
      // ETABS SELFWEIGHT del patrón → Self Weight Multiplier que controla el peso propio.
      return { name: p.name, type, selfWeight: swm > 0, value: swm || 1, selfWeightMultiplier: swm, autoLateralLoad: "0" };
    });
    // Store REAL del modal Define ▸ Load Patterns (static-load-cases-modal):
    // items con `selfWeightMultiplier` directo. Este es el que lee el motor para
    // el peso propio estilo ETABS (ver seismic.js _buildSeismicMassSourceForPayload).
    const staticLoadCases = loadPatternDefs.map((p) => {
      const t = String(p.type || "").toUpperCase();
      const type = t.includes("DEAD") ? "DEAD" : t.includes("ROOF") ? "LIVE" : t.includes("LIVE") ? "LIVE" : t.includes("SEISMIC") ? "SEISMIC" : "OTHER";
      return {
        name: p.name, type,
        selfWeightMultiplier: Number(p.selfWeightMultiplier) || 0,
        autoLateralLoad: /seismic/i.test(t) ? "User Coefficient" : "0",
      };
    });

    const massSource = massSourceLoads.length
      ? {
        enabled: true, name: massSourceName,
        includeSelfWeight: true, selfWeightMultiplier: 1,
        loadPatterns: massSourceLoads,
        loadMultipliers: massSourceLoads.map((l) => ({ load: l.load, multiplier: l.multiplier })),
        convertWeightToMass: true, gravity: 9.81,
        includeLateralMass: true, includeVerticalMass: false,
        lumpLateralMassAtStoryLevels: true, specifiedLoadPatterns: true, elementSelfMass: true,
      }
      : null;

    const materials = [...materialMap.values()];
    const frameSections = [...frameSecMap.values()];
    // Secciones de losa (PROPTYPE Slab/Deck; los muros van aparte). Forma que
    // espera la lista del modal Wall/Slab Sections (this.slabSections).
    const slabSections = [...slabSecMap.values()]
      .filter((s) => !/wall/i.test(s.kind || ""))
      .map((s) => ({
        name: s.name,
        material: s.material || "CONC",
        modelingType: s.modelingType || "Membrane",
        type: "Slab",
        thickness: s.thickness, // mm
        color: "#9ca3af",
      }));

    // ── Fase 3: funciones de espectro (USER con puntos) + casos Response Spectrum ──
    const responseSpectrumFunctions = [...rsFuncMap.values()]
      .filter((f) => /spectrum/i.test(f.functype || "") && Array.isArray(f.points) && f.points.length >= 2)
      .map((f) => ({ id: f.id, name: f.name, type: "response-spectrum", units: f.units, damping: f.damping, points: f.points }));

    const responseSpectrumCases = [...rsCaseMap.values()]
      .filter((c) => /response\s*spectrum/i.test(c.type) && Object.keys(c.spectra).length)
      .map((c) => {
        const u1 = c.spectra.U1?.scaleFactor || 0;
        const u2 = c.spectra.U2?.scaleFactor || 0;
        const direction = u1 >= u2 ? "X" : "Y";
        return {
          id: String(c.name).replace(/\s+/g, "_").toUpperCase(),
          name: c.name, enabled: true,
          damping: c.damping ?? 0.05,
          modalCombination: c.modalCombination || "CQC",
          f1: 0, f2: 0,
          directionalCombination: "SRSS", orthogonalSF: 1, excitationAngle: 0,
          eccRatio: c.eccRatio ?? 0,
          spectra: c.spectra,
          functionId: (direction === "X" ? c.spectra.U1 : c.spectra.U2)?.functionId || Object.values(c.spectra)[0]?.functionId || "",
          direction, scaleFactor: Math.max(u1, u2) || 1,
        };
      });

    console.log("📥 Import ETABS .e2k:", {
      stories: stories.length, nodes: nodes.length, frames: frames.length, areas: areas.length,
      materials: materials.length, sections: frameSections.length,
      rsFunctions: responseSpectrumFunctions.length, rsCases: responseSpectrumCases.length,
    });

    return {
      app: "JHACK-ETABS-WEB",
      fileType: "internal-model-json-imported-from-etabs-e2k",
      schemaVersion: "1.0.0",
      importedAt: new Date().toISOString(),
      model: {
        referenceGrid: {
          xGrids, yGrids, generalGrids: [],
          xPositions: xGrids.map((g) => g.ordinate), yPositions: yGrids.map((g) => g.ordinate),
          xLabels: xGrids.map((g) => g.id), yLabels: yGrids.map((g) => g.id),
          storyCount: Math.max(0, stories.length - 1), storyHeight: storiesAsc[1]?.height || 3,
        },
        stories,
        nodes, frames, beams: frames, shapes: frames, areas,
        activeViewIndex: 0, activeStory: 0, currentViewMode: "plan", currentStory: "BASE",
        currentElevationX: "none", currentElevationZ: "none",
        referencePlanes: [], referencePoints: [], dimensionLines: [],
      },
      definitions: {
        materials, frameSections,
        slabSections,
        loadCases,
        staticLoadCases,
        diaphragms: diaphragmDefs,
        massSource,
        responseSpectrumFunctions,
        responseSpectrumCases,
        groups: [],
      },
      options: {
        preferences: this.preferences || {},
        canvasTheme: this.activeCanvasTheme || "dark",
      },
      results: {},
    };
  },

  async importETABS_E2K() {
    try {
      const selected = await this.openTextFileForImport(".e2k,.txt");

      if (!selected) return;

      // Auto-detectar: .e2k REAL de ETABS (por pisos) vs nuestro viejo formato.
      const isReal = this.isRealETABS_E2K(selected.text);
      const data = isReal
        ? this.parseETABS_E2K(selected.text)
        : this.parseInitialE2KText(selected.text);

      const loaded = this.loadFromJSON(data);

      if (!loaded) {
        this.showMessage?.("❌ No se pudo importar el .e2k.", "error");
        return;
      }

      // Las secciones de losa no viajan por importFromJSON: se asignan directo a
      // this.slabSections (lo que lee el modal Wall/Slab Sections y renderModel3d).
      if (isReal && Array.isArray(data.definitions?.slabSections) && data.definitions.slabSections.length) {
        this.slabSections = data.definitions.slabSections;
      }

      this.currentFileName = selected.file.name.replace(/\.[^/.]+$/, "") + "_importado_desde_e2k.json";

      this.showMessage?.(
        isReal
          ? `📥 Importación .e2k de ETABS completada: ${selected.file.name}`
          : `📥 Importación .e2k (formato interno) completada: ${selected.file.name}`,
      );

      console.log("📥 Import E2K inicial/no oficial:", {
        fileName: selected.file.name,
        nodes: this.nodes?.length || 0,
        frames: this.shapes?.length || 0,
        areas: this.areas?.length || 0,
        stories: this.stories?.length || 0,
        referenceGrid: this.referenceGrid,
      });
    } catch (error) {
      console.error("❌ Error importando E2K inicial:", error);

      this.showMessage?.("❌ Error al importar .e2k inicial/no oficial.", "error");
    }
  },

  showImportPending(formatName) {
    this.showMessage?.(
      `📥 Importar ${formatName} - pendiente. Por ahora está estable JSON interno y .e2k inicial/no oficial.`,
    );
    console.warn(`Import pendiente: ${formatName}`);
  },

  importETABS6() {
    this.showImportPending("ETABS6 Text File");
  },

  importETABS_EDB() {
    this.showImportPending("ETABS .edb. Formato propietario/binario");
  },

  importDXFGrid() {
    this.showImportPending("DXF Architectural Grid");
  },

  importDXFFloorPlan() {
    this.showImportPending("DXF Floor Plan");
  },

  importDXF3D() {
    this.showImportPending("DXF 3D Model");
  },

  importIFC() {
    this.showImportPending("IFC .ifc");
  },

  importIGES() {
    this.showImportPending("IGES .igs");
  },

  importCIS2() {
    this.showImportPending("CIS/2 .stp");
  },

  importRevit() {
    this.showImportPending("Revit Structure .exr");
  },

  importProSteel() {
    this.showImportPending("ProSteel .mdb");
  },

  importFrameworks() {
    this.showImportPending("Frameworks Plus .sfc");
  },

  importSTRUDL() {
    this.showImportPending("STRUDL/STAAD .gti/.std");
  },
};
