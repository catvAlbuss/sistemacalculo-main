// mixins/io/file-io/e2k-import.js — parte "e2k-import" de file-io
// (file-io.js se partió en sub-mixins por responsabilidad; barril en file-io.js).
import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../../../model/shapes.js";
import { read as readmat } from "mat-for-js";
import { axisToFixed, removeFromArray } from "../../../lib/utils.js";
import { parseE2kLoadCombos, comboExpression } from "./e2k-load-combos.js";
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

  // Propiedades de un TUBO rectangular hueco (SHAPE "Steel Tube" / HSS). D=peralte,
  // B=ancho, TF=espesor pared arriba/abajo, TW=espesor pared lados (todo en m).
  // Sección hueca = exterior D×B menos el interior. J por Bredt (pared delgada
  // cerrada). Valida contra ETABS: 100x100x3mm → A=0.00116, I33=1.83e-6,
  // J=2.7e-6 (ETABS: 0.0012 / 0.000002 / 0.000003). Iz usa D³ (eje mayor 33),
  // Iy usa B³ (eje menor 22).
  _tubeSectionProps(D, B, TF, TW) {
    if (!(D > 0 && B > 0 && TF > 0 && TW > 0)) return null;
    const Di = Math.max(0, D - 2 * TF);
    const Bi = Math.max(0, B - 2 * TW);
    const A = B * D - Bi * Di;
    const Iz = (B * Math.pow(D, 3)) / 12 - (Bi * Math.pow(Di, 3)) / 12;
    const Iy = (D * Math.pow(B, 3)) / 12 - (Di * Math.pow(Bi, 3)) / 12;
    const t = (TF + TW) / 2;
    const Am = (D - TF) * (B - TW);
    const pm = 2 * ((D - TF) + (B - TW));
    const J = pm > 0 ? (4 * Am * Am * t) / pm : 0;
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

  // Propiedades de una sección "T" (Tee) de concreto (FRAMESECTION SHAPE
  // "Concrete Tee"). Ala superior de ancho B × espesor TF; alma debajo de
  // altura (D−TF), ancho TW en el ala y TWB en la punta (si difieren se usa el
  // promedio → alma rectangular equivalente; en columnas de concreto TW=TWB
  // casi siempre). Simétrica respecto al eje vertical central. Iz = eje fuerte
  // (flexión con D como peralte), Iy = eje débil (usa B). J por suma de
  // rectángulos (St-Venant, sección abierta), aproximada.
  _teeSectionProps(D, B, TF, TW, TWB) {
    D = Number(D) || 0; B = Number(B) || 0; TF = Number(TF) || 0;
    TW = Number(TW) || 0; TWB = Number(TWB) || TW;
    const tw = (TW + TWB) / 2; // ancho de alma equivalente
    if (D <= 0 || B <= 0 || TF <= 0 || tw <= 0 || TF >= D || tw > B) return null;

    const hw = D - TF;                 // altura del alma
    const Af = B * TF, Aw = tw * hw;   // áreas ala / alma
    const A = Af + Aw;
    if (A <= 0) return null;

    // Centroide medido desde el TOPE (y hacia abajo).
    const yf = TF / 2;                 // centroide del ala
    const yw = TF + hw / 2;            // centroide del alma
    const yc = (Af * yf + Aw * yw) / A;

    // Iz (eje horizontal centroidal = eje fuerte, usa el peralte D).
    const Iz =
      (B * Math.pow(TF, 3)) / 12 + Af * Math.pow(yc - yf, 2) +
      (tw * Math.pow(hw, 3)) / 12 + Aw * Math.pow(yc - yw, 2);
    // Iy (eje vertical centroidal = eje débil; ala y alma centradas en él).
    const Iy = (TF * Math.pow(B, 3)) / 12 + (hw * Math.pow(tw, 3)) / 12;
    // J: suma de rectángulos (sección abierta), aproximada.
    const J = (B * Math.pow(TF, 3) + hw * Math.pow(tw, 3)) / 3;

    return { A, area: A, Iz, Iy, J, cy: yc };
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
    const rebarDefMap = new Map(); // "#4" → {area, dia} (catálogo REBARDEFINITION, en m²/m)
    const concreteSectionMap = new Map(); // name → datos crudos de CONCRETESECTION (armado), fusiona a frameSecMap al final
    const slabSecMap = new Map();
    const pointCoords = new Map(); // pointId → {x,y}
    const lineConn = new Map(); // lineName → {kind, pi, pj}
    const areaConn = new Map(); // areaName → [ptIds]
    const areaStoryOffsets = new Map(); // areaName → [storyOffset por vértice]
    const areaKind = new Map(); // areaName → "wall" (PANEL) | "slab" (FLOOR)
    const diaphragmDefs = [];
    const loadPatternDefs = [];
    const massSourceLoads = [];
    let massSourceName = "MASS_SOURCE_1";
    // INCLUDEELEMENTS del MASSSOURCE: si el .e2k trae "No" (ETABS no suma peso
    // propio de barras a la masa sísmica, solo INCLUDELOADS con los factores
    // de MASSSOURCELOAD — normalmente porque el propio Load Pattern CM ya
    // incluye el peso propio con su SELFWEIGHT multiplier), se debe respetar:
    // hardcodearlo en true duplicaba/inflaba la masa vs ETABS (validado con
    // MODULO 5: sin este fix, 1838 kg en el techo vs 1051 kg reales de ETABS —
    // ver project_modulo5_period_calibration). Default true (ETABS lo trae
    // así por defecto si el .e2k no declara MASSSOURCE en absoluto).
    let massSourceIncludeElements = true;
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
          // TF/TW y flags de espejo (MIRROR2/3) se guardan para poder dibujar
          // la huella real en forma de L en las vistas de planta/stories.
          const mirror2 = /MIRROR2\s+"?Yes/i.test(line);
          const mirror3 = /MIRROR3\s+"?Yes/i.test(line);
          frameSecMap.set(name, props
            ? { name, type: "L", material, b: B * 100, h: D * 100,
                lFlangeThick: TF * 100, lWebThick: TW * 100, lMirror2: mirror2, lMirror3: mirror3,
                A: props.A, area: props.area, Iz: props.Iz, Iy: props.Iy, J: props.J, description: name }
            : { name, type: "general", material, A: 0.01, area: 0.01, Iz: 1e-4, Iy: 1e-4 });
        } else if (/concrete tee|(^|\s)tee($|\s)/i.test(shape)) {
          // Sección T (Tee) de concreto → type "tee" (el que reconoce el modal)
          // con propiedades reales de sección en T — antes caía al else y se
          // aproximaba como rectángulo macizo D×B (sobreestimaba área e inercia).
          // Dimensiones en cm para el modal. TWB opcional (ancho de alma en la
          // punta); si falta se asume = TW.
          const D = kvNum(line, "D", 0), B = kvNum(line, "B", 0);
          const TF = kvNum(line, "TF", 0), TW = kvNum(line, "TW", 0), TWB = kvNum(line, "TWB", TW);
          const props = this._teeSectionProps(D, B, TF, TW, TWB);
          frameSecMap.set(name, props
            ? {
                name, type: "tee", material,
                teeDepth: D * 100, teeWidth: B * 100,
                teeFlangeThick: TF * 100, teeWebThick: TW * 100, teeWebTipThick: TWB * 100,
                A: props.A, area: props.area, Iz: props.Iz, Iy: props.Iy, J: props.J,
                description: name,
              }
            : { name, type: "general", material, A: 0.01, area: 0.01, Iz: 1e-4, Iy: 1e-4 });
        } else if (/steel tube|(^|\s)tube($|\s)|\bhss\b/i.test(shape)) {
          // Tubo de acero hueco (HSS). Se importa como type "tube" (el que
          // reconoce el modal Frame Sections) con propiedades de sección HUECA
          // reales — NO como rectángulo macizo (antes caía al else y sobreestimaba
          // el área ~8×). Dimensiones guardadas en cm para el modal.
          const D = kvNum(line, "D", 0), B = kvNum(line, "B", 0);
          const TF = kvNum(line, "TF", 0), TW = kvNum(line, "TW", 0);
          const props = this._tubeSectionProps(D, B, TF, TW);
          frameSecMap.set(name, props
            ? {
                name, type: "tube", material,
                tubeDepth: D * 100, tubeWidth: B * 100,
                tubeFlangeThick: TF * 100, tubeWebThick: TW * 100,
                A: props.A, area: props.area, Iz: props.Iz, Iy: props.Iy, J: props.J,
                description: name,
              }
            : { name, type: "general", material, A: 1e-3, area: 1e-3, Iz: 1e-6, Iy: 1e-6 });
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
      } else if (/^REBARDEFINITION\s/i.test(line)) {
        // Catálogo de diámetros de varilla: "#4" → {area m², dia m}. Sirve para
        // resolver el diámetro real de LONGBARAREA/CONFINEBARAREA de
        // CONCRETESECTION (que solo trae el área, no el número de varilla).
        const name = quotedAll(line)[0];
        if (name) {
          rebarDefMap.set(name, { area: kvNum(line, "AREA", 0), dia: kvNum(line, "DIA", 0) });
        }
      } else if (/^CONCRETESECTION\s/i.test(line)) {
        // Datos de diseño/armado de una sección (columna o viga) que ETABS ya
        // trae resueltos — hoy se descartaban por completo. Guardados aparte
        // (no en frameSecMap todavía) porque CONCRETESECTION puede venir antes
        // o después de la FRAMESECTION del mismo nombre en el archivo; se
        // fusionan al final, mismo patrón que sdSectionMap/"sd-pending".
        const name = quotedAll(line)[0];
        if (name) {
          concreteSectionMap.set(name, {
            sectionType: q(line, "TYPE") || "", // "Column" | "Beam"
            patternRaw: q(line, "PATTERN") || "",
            cover: kvNum(line, "COVER", 0),
            coverTop: kvNum(line, "COVERTOP", 0),
            coverBottom: kvNum(line, "COVERBOTTOM", 0),
            longBarArea: kvNum(line, "LONGBARAREA", 0),
            confineBarArea: kvNum(line, "CONFINEBARAREA", 0),
            confineBarSpacing: kvNum(line, "CONFINEBARSPACING", 0),
            numConfineBars2: kvNum(line, "NUMCONFINEBARS2", 0),
            numConfineBars3: kvNum(line, "NUMCONFINEBARS3", 0),
            longBarMaterialName: q(line, "LONGBARMATERIAL") || "",
            confineBarMaterialName: q(line, "CONFINEBARMATERIAL") || "",
            // Armado longitudinal de VIGA (m²): A=superior/T=inferior en los
            // extremos I y J. ETABS los escribe en 0 cuando la sección está en
            // auto-diseño ("Reinforcement to be Designed"). Lo consume el tope
            // por resistencia de vigas del corte de columnas (ACI 318
            // §18.7.6.1.1 in fine, ver design/column_shear.py).
            beamAreaTopI: kvNum(line, "ATI", 0),
            beamAreaBotI: kvNum(line, "ABI", 0),
            beamAreaTopJ: kvNum(line, "ATJ", 0),
            beamAreaBotJ: kvNum(line, "ABJ", 0),
          });
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
          // Reparto de la carga de área a las vigas del contorno. En ETABS una
          // losa `Membrane` NO tiene rigidez a flexión: existe solo para
          // entregarle su carga a las vigas que la sostienen, y
          // ONEWAYLOADDIST decide si lo hace en una dirección (aligerado,
          // aporticado en un sentido) o en dos (regla de 45°). El ángulo del
          // sentido de armado viene por barra en AREAASSIGN ... ANG.
          oneWayLoadDist: /ONEWAYLOADDIST\s+"?Yes/i.test(line),
        });
      } else if (/^POINT\s/i.test(line)) {
        const id = quotedAll(line)[0];
        const nums = bareNums(line);
        // 3er valor (opcional) = offset Z del punto sobre la elevación del piso
        // al que se asigna el miembro. ETABS lo usa para geometría inclinada:
        // vértices de tijerales/armaduras de techo, rampas, etc. Sin capturarlo,
        // todo el techo se aplana a la elevación del piso (la armadura desaparece).
        if (id != null && nums.length >= 2) {
          pointCoords.set(id, {
            x: nums[0],
            y: nums[1],
            z: nums.length >= 3 ? nums[2] : null,
          });
        }
      } else if (/^LINE\s/i.test(line)) {
        const toks = quotedAll(line);
        const km = String(line).match(/"[^"]*"\s+(COLUMN|BEAM|BRACE)\b/i);
        if (toks[0] && toks[1] != null && toks[2] != null) {
          // El número final es cuántos PISOS abarca la línea hacia abajo desde
          // el piso al que se asigna: 0 en una viga (vive en su piso), 1 en
          // una columna normal (piso anterior → piso asignado), 2 o más en una
          // columna que atraviesa niveles intermedios.
          //   LINE "C35"  COLUMN  "20"  "308"  2   → de Story1 a Story3
          // Se asumía SIEMPRE 1 (belowElevOf) y esas columnas arrancaban un
          // piso demasiado arriba (MODULO 1: 6.4 en vez de 3.2).
          const span = bareNums(line)[0];
          lineConn.set(toks[0], {
            kind: km ? km[1].toUpperCase() : "BEAM",
            pi: toks[1],
            pj: toks[2],
            storySpan: Number.isFinite(span) && span >= 1 ? Math.round(span) : 1,
          });
        }
      } else if (/^AREA\s/i.test(line)) {
        const toks = quotedAll(line);
        const nums = bareNums(line);
        const nPts = nums.length ? nums[0] : toks.length - 1;
        const pts = toks.slice(1, 1 + nPts);
        if (toks[0] && pts.length >= 3) areaConn.set(toks[0], pts);
        // Los N números que siguen al conteo son el STORY OFFSET de cada
        // vértice: 0 = el piso al que se asigna el área, 1 = un piso abajo, …
        //   AREA "W14" PANEL 4 "95" "117" "58" "28"  1 0 0 1
        // Es como ETABS describe un muro (1,1,0,0 = de abajo hacia arriba) y
        // también el ALERO de un techo, cuyo borde baja al piso anterior.
        // Antes se descartaban y la cota del vértice se ADIVINABA
        // (pointExistsBelow); con el dato explícito no hay que adivinar.
        if (toks[0] && pts.length >= 3 && nums.length >= 1 + pts.length) {
          areaStoryOffsets.set(toks[0], nums.slice(1, 1 + pts.length).map((v) => Number(v) || 0));
        }
        // PANEL = muro (traza en planta que se extruye vertical por piso),
        // FLOOR = losa (polígono horizontal). Determina cómo se reconstruye la
        // geometría en AREAASSIGN.
        const kindM = String(line).match(/^\s*AREA\s+"[^"]*"\s+(PANEL|FLOOR)\b/i);
        if (toks[0] && kindM) areaKind.set(toks[0], /panel/i.test(kindM[1]) ? "wall" : "slab");
      } else if (/^LOADPATTERN\s/i.test(line)) {
        const name = quotedAll(line)[0];
        if (name) loadPatternDefs.push({ name, type: q(line, "TYPE") || "Other", selfWeightMultiplier: kvNum(line, "SELFWEIGHT", 0) });
      } else if (/^MASSSOURCE\s/i.test(line)) {
        massSourceName = quotedAll(line)[0] || massSourceName;
        if (/INCLUDEELEMENTS\s+"No"/i.test(line)) massSourceIncludeElements = false;
        else if (/INCLUDEELEMENTS\s+"Yes"/i.test(line)) massSourceIncludeElements = true;
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
        // Espectro en archivo aparte: los puntos NO están en el .e2k.
        if (hasKey(line, "FILE")) f.externalFile = q(line, "FILE") || f.externalFile;
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

    // ── Fusionar CONCRETESECTION (armado) en frameSecMap ──
    // Resuelve el diámetro real de la varilla longitudinal buscando en el
    // catálogo REBARDEFINITION el área más cercana a LONGBARAREA (solo trae el
    // área, no el número de varilla). PATTERN "R-n2-n3" (rectangular, esquinas
    // incluidas) o "C-n" (circular, n varillas en el perímetro). El orden
    // n2-luego-n3 (NO n3-n2, que es lo que decía la doc de CSI leída antes) se
    // confirmó contra el diálogo real "Frame Section Property Reinforcement
    // Data" de ETABS del usuario: para una C45x45 con PATTERN "R-5-3", ETABS
    // mostraba 3 varillas en la cara 3-dir y 5 en la 2-dir — invertido de lo
    // que asumíamos, ver project_rc_design_v2_v3_convention. Sin PATTERN
    // reconocido, se guarda type:"unknown" (el adaptador de columnas lo trata
    // como no-soportado, no intenta calcular).
    // Diametro EXACTO desde el area: d = sqrt(4A/pi). El area es el dato
    // autoritativo del .e2k y ya codifica el diametro sin perdida.
    //
    // Antes se buscaba la varilla mas cercana del catalogo REBARDEFINITION, y
    // eso METIA error cuando la varilla real no esta en ese catalogo. Caso
    // medido: el modelo trae el catalogo IMPERIAL (#2..#18) pero usa varillas
    // METRICAS de 20 y 10 mm, asi que 3.142E-4 m2 se aproximaba a #6 (19.05mm)
    // y 7.85E-5 a #3 (9.525mm).
    //
    // El diametro posiciona las varillas dentro de la seccion, asi que el error
    // se propaga al brazo de palanca. Verificado contra el "Column Element
    // Details" de ETABS, que reporta dc (cara -> centroide de la varilla) = 60 mm:
    //   catalogo -> 40 + 9.525 + 19.05/2 = 59.05 mm  (mal)
    //   exacto   -> 40 + 10.00 + 20.00/2 = 60.00 mm  (calza)
    const exactRebarDiameter = (area) => (area > 0 ? Math.sqrt((4 * area) / Math.PI) : 0);

    const parseRebarPattern = (raw) => {
      const rect = /^R-(\d+)-(\d+)$/i.exec(String(raw || "").trim());
      if (rect) return { type: "rectangular", n2: Number(rect[1]), n3: Number(rect[2]) };
      const circ = /^C-(\d+)$/i.exec(String(raw || "").trim());
      if (circ) return { type: "circular", n: Number(circ[1]) };
      return { type: "unknown", raw };
    };

    concreteSectionMap.forEach((cs, name) => {
      const sec = frameSecMap.get(name);
      if (!sec) return; // CONCRETESECTION sin FRAMESECTION geométrica: no hay a qué fusionar.

      sec.concreteDesignType = cs.sectionType; // "Column" | "Beam"
      sec.rebarPattern = parseRebarPattern(cs.patternRaw);
      sec.cover = cs.cover * 100 || cs.coverTop * 100 || 0; // cm (columnas: COVER; vigas: COVERTOP/COVERBOTTOM)
      sec.coverTop = cs.coverTop * 100 || 0;
      sec.coverBottom = cs.coverBottom * 100 || 0;
      sec.longBarArea = cs.longBarArea; // m² (se deja en SI, el motor de interacción trabaja en SI)
      sec.longBarDiameter = exactRebarDiameter(cs.longBarArea); // m
      sec.confineBarArea = cs.confineBarArea; // m²
      sec.confineBarDiameter = exactRebarDiameter(cs.confineBarArea); // m
      sec.confineBarSpacing = cs.confineBarSpacing * 100 || 0; // cm
      sec.numConfineBars2 = cs.numConfineBars2;
      sec.numConfineBars3 = cs.numConfineBars3;
      sec.longBarMaterialName = cs.longBarMaterialName;
      sec.confineBarMaterialName = cs.confineBarMaterialName;
      // Armado de viga por extremo (m², SI — el motor trabaja en SI). Quedan
      // en 0 si ETABS dejó la viga en auto-diseño: ahí no hay armado fijo que
      // traer, y el tope por vigas del corte de columna no se puede aplicar.
      sec.beamAreaTopI = cs.beamAreaTopI || 0;
      sec.beamAreaBotI = cs.beamAreaBotI || 0;
      sec.beamAreaTopJ = cs.beamAreaTopJ || 0;
      sec.beamAreaBotJ = cs.beamAreaBotJ || 0;
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
    const belowStoryNameOf = (name) => {
      const idx = storiesAsc.findIndex((s) => s.name === name);
      return idx <= 0 ? "Base" : storiesAsc[idx - 1].name;
    };
    // Elevación N pisos por debajo del indicado (N = story offset del vértice
    // en la línea AREA). N=0 → el propio piso. Se satura en la Base.
    const elevNStoriesBelow = (name, n) => {
      const idx = storiesAsc.findIndex((s) => s.name === name);
      if (idx < 0) return storyElev.get(name) ?? 0;
      const target = Math.max(0, idx - Math.max(0, Math.round(Number(n) || 0)));
      return storiesAsc[target]._elev;
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
    // En ETABS el 3er valor del POINT es la PROFUNDIDAD del punto BAJO la
    // elevación del piso al que se asigna el miembro. La elevación del piso
    // (p.ej. Story2 = 6.29) es el nivel de la CUMBRERA del techo: el punto de
    // la cumbrera trae offset ~0 (queda en 6.29, el más alto) y los aleros el
    // offset mayor (bajan). Por eso la cota real = elevPiso − offset, dando un
    // techo a dos aguas (gable) con el pico al centro — confirmado con la vista
    // de elevación de ETABS (joint de la cumbrera en X=5.675, Z=6.29). Los
    // puntos SIN offset quedan en la elevación del piso (la cumbrera).
    const frames = [];
    const areas = [];
    const frameByKey = new Map(); // "line|story" → frame
    const areaByKey = new Map(); // "area|story" → area

    // ── Pre-pase: resolver la COTA de cada punto que participa en la geometría
    // de techo (tijeral), para que TODOS los miembros la usen consistente.
    // Un tijeral se asigna a un piso (p.ej. Story2, elev 6.29) pero abarca del
    // cordón inferior (piso de abajo, belowElev 3.36) a la cumbrera (elev del
    // piso). Reglas por punto:
    //   - con offset  → ALFARDA: z = elevPiso − offset.
    //   - sin offset, extremo INFERIOR de un vertical (COLUMN) cuyo OTRO extremo
    //     es alfarda (con offset) → CORDÓN INFERIOR: z = belowElev.
    //   - sin offset y no marcado → CUMBRERA: z = elevPiso (se resuelve al colocar).
    // Sin esto los puntos sin offset caían todos en la elevación del piso y el
    // techo salía como zigzag (cordón inferior arriba, alfardas abajo).
    // Pisos en los que aparece cada punto (por LINEASSIGN / AREAASSIGN /
    // POINTASSIGN). Sirve para distinguir, entre los puntos de techo SIN
    // offset, la CUMBRERA (existe solo en el piso del techo → z = elevación
    // de ese piso) de un ALERO (existe TAMBIÉN en pisos inferiores porque es
    // el tope de una columna/muro donde apoya el techo → z = piso de abajo).
    // Sin esta distinción los aleros salían disparados a la elevación del
    // piso superior (MODULO 1: extremos del techo en los ejes 1 y 4).
    const pointStories = new Map(); // pointId → Set(nombre de piso)
    const addPointStory = (ptId, storyName) => {
      if (ptId == null || !storyName) return;
      let set = pointStories.get(ptId);
      if (!set) { set = new Set(); pointStories.set(ptId, set); }
      set.add(storyName);
    };
    lines.forEach((line) => {
      if (/^LINEASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        const c = lineConn.get(toks[0]);
        if (c) { addPointStory(c.pi, toks[1]); addPointStory(c.pj, toks[1]); }
      } else if (/^AREAASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        const c = areaConn.get(toks[0]);
        if (c) c.forEach((ptId) => addPointStory(ptId, toks[1]));
      } else if (/^POINTASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        addPointStory(toks[0], toks[1]);
      }
    });
    const pointExistsBelow = (ptId, storyName) => {
      const set = pointStories.get(ptId);
      if (!set) return false;
      const zRef = storyElev.get(storyName);
      if (zRef == null) return false;
      for (const s of set) {
        const zs = storyElev.get(s);
        if (zs != null && zs < zRef - 1e-6) return true;
      }
      return false;
    };

    // Pisos que CONTIENEN geometría de techo (algún elemento asignado a ese
    // piso usa un punto con offset). Solo dentro de ellos se aplica la regla
    // (b) de línea de techo sin offsets — ver isRoofLine abajo.
    const roofStories = new Set();
    lines.forEach((line) => {
      if (/^LINEASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        const c = lineConn.get(toks[0]);
        if (!c) return;
        if (pointCoords.get(c.pi)?.z != null || pointCoords.get(c.pj)?.z != null) roofStories.add(toks[1]);
      } else if (/^AREAASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        const c = areaConn.get(toks[0]);
        if (!c) return;
        if (c.some((ptId) => pointCoords.get(ptId)?.z != null)) roofStories.add(toks[1]);
      }
    });

    // Puntos que son extremo de ALGÚN vertical (COLUMN), incluido el pendolón
    // de cumbrera (self-loop "30"-"30" de MODULO 5). NO deben pasar por la
    // regla de ALERO: su cota ya la resuelve la regla de COLUMN (base →
    // belowElev) o el propio branch de columna al colocarlos. Sin esta
    // exclusión, la cumbrera —que también "existe abajo" porque el pendolón
    // arranca del cordón inferior— se resolvía a belowElev y las diagonales
    // del techo bajaban a 3.36 en vez de llegar al vértice en 6.29,
    // dejando el nodo de cumbrera suelto.
    const columnEndpointIds = new Set();
    lines.forEach((line) => {
      if (!/^LINE\s/i.test(line)) return;
      if (!/"[^"]*"\s+COLUMN\b/i.test(String(line))) return;
      const toks = quotedAll(line);
      if (toks[1] != null) columnEndpointIds.add(toks[1]);
      if (toks[2] != null) columnEndpointIds.add(toks[2]);
    });

    // ── Extrapolación de la PENDIENTE del techo ──────────────────────────
    // Un punto SIN offset en el extremo de una cadena de techo puede ser la
    // CUMBRERA (offset→0, z = elevación del piso) o un ALERO (offset máximo,
    // z = piso de abajo). "Existe en un piso inferior" NO los distingue: en
    // MODULO 5-vigas los tres (2 aleros + cumbrera) aparecen en Story1+Story2
    // y ninguno es extremo de columna. Lo que SÍ los distingue es la propia
    // geometría: los offsets varían linealmente a lo largo del faldón, así que
    // extrapolando el tramo vecino se obtiene el offset del extremo.
    // Verificado con los datos reales de MODULO 5-vigas (faldón izquierdo,
    // pendiente 0.4287/m): hacia la cumbrera (x=5.67) da offset≈0.001 → 6.29;
    // hacia el alero (x=-1.17) da 2.930 → 3.359. El resultado se AJUSTA al
    // nivel de piso más cercano (6.29 / 3.36) para que el nudo coincida
    // exactamente con el resto de la estructura y no quede a 1 mm.
    const roofAdj = new Map(); // `${story}|${pt}` → [{other, dist}]
    const planDist = (a, b) => Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
    lines.forEach((line) => {
      if (!/^LINEASSIGN\s/i.test(line)) return;
      const toks = quotedAll(line);
      const c = lineConn.get(toks[0]);
      if (!c || c.pi === c.pj) return;
      const pi = pointCoords.get(c.pi);
      const pj = pointCoords.get(c.pj);
      if (!pi || !pj) return;
      if (pi.z == null && pj.z == null) return; // sin geometría de techo
      const d = planDist(pi, pj);
      if (!(d > 1e-6)) return;
      const push = (a, b) => {
        const k = `${toks[1]}|${a}`;
        if (!roofAdj.has(k)) roofAdj.set(k, []);
        roofAdj.get(k).push({ other: b, dist: d });
      };
      push(c.pi, c.pj);
      push(c.pj, c.pi);
    });

    // Devuelve la z extrapolada (ya ajustada al nivel de piso más cercano) o
    // null si no hay dos puntos con offset encadenados para estimar pendiente.
    const extrapolateRoofZ = (ptId, storyName) => {
      const p = pointCoords.get(ptId);
      if (!p || p.z != null) return null;
      const zStoryLocal = storyElev.get(storyName);
      if (zStoryLocal == null) return null;
      const zBelowLocal = belowElevOf(storyName);

      for (const { other: qId, dist: dPQ } of roofAdj.get(`${storyName}|${ptId}`) || []) {
        const q = pointCoords.get(qId);
        if (!q || q.z == null) continue;
        for (const { other: rId, dist: dQR } of roofAdj.get(`${storyName}|${qId}`) || []) {
          if (rId === ptId) continue;
          const r = pointCoords.get(rId);
          if (!r || r.z == null || !(dQR > 1e-6)) continue;
          // offset(P) = offset(Q) + pendiente(R→Q) · distancia(Q→P)
          const offP = q.z + ((q.z - r.z) / dQR) * dPQ;
          const zP = zStoryLocal - offP;
          return Math.abs(zP - zStoryLocal) <= Math.abs(zP - zBelowLocal)
            ? zStoryLocal
            : zBelowLocal;
        }
      }
      return null;
    };

    const pointRoofZ = new Map(); // pointId → z absoluto resuelto
    // Piso en cuyo CONTEXTO se resolvió cada punto (el story del LINEASSIGN de
    // techo que lo tocó). Un mismo punto puede aparecer en POINTASSIGN de OTRO
    // piso (p.ej. "21" en "Base" para su restricción de apoyo real, además de
    // en "Story1"/"Story2" por su rol en el techo) — pointRoofZ solo debe
    // aplicarse cuando el story coincide, si no, un apoyo en Base terminaría
    // reubicado a la cota del techo (ver uso en POINTASSIGN más abajo).
    const pointRoofStory = new Map(); // pointId → nombre de piso
    lines.forEach((line) => {
      if (!/^LINEASSIGN\s/i.test(line)) return;
      const toks = quotedAll(line);
      const conn = lineConn.get(toks[0]);
      if (!conn) return;
      const pi = pointCoords.get(conn.pi);
      const pj = pointCoords.get(conn.pj);
      if (!pi || !pj) return;
      // ¿Es geometría de TECHO? Dos formas:
      //  a) algún extremo con offset (pendiente explícita), o
      //  b) en un piso QUE TIENE techo (roofStories), una línea que une un
      //     punto de techo (cumbrera: sin offset y exclusivo del piso) con un
      //     punto anclado abajo (alero) → es una limatesa/par inclinado aunque
      //     NINGÚN extremo traiga offset. Caso real MODULO 1 elevación F: la
      //     arista del hastial son B28 (eje 1 → cumbrera) y D6 (cumbrera →
      //     eje 4), ambas sin offsets: salían como una barra recta a 11.9 en
      //     vez de la "^" que va de Story3 a Story4 y de vuelta a Story3.
      // El caso (b) exige que los DOS extremos sean de clase distinta: una
      // viga plana normal (ambos extremos anclados abajo) NO entra, así que
      // los pisos con losa plana + techo conviven sin romperse.
      const isRoofPoint = (ptId, c) => c.z != null || !pointExistsBelow(ptId, toks[1]);
      const roofI = isRoofPoint(conn.pi, pi);
      const roofJ = isRoofPoint(conn.pj, pj);
      const isRoofLine =
        pi.z != null || pj.z != null ||
        (roofStories.has(toks[1]) && roofI !== roofJ);
      if (!isRoofLine) return;
      const zStory = storyElev.get(toks[1]) ?? 0;
      const zBelow = belowElevOf(toks[1]);
      if (pi.z != null) { pointRoofZ.set(conn.pi, zStory - pi.z); pointRoofStory.set(conn.pi, toks[1]); }
      if (pj.z != null) { pointRoofZ.set(conn.pj, zStory - pj.z); pointRoofStory.set(conn.pj, toks[1]); }
      // Vertical (COLUMN) con un extremo alfarda → el extremo sin offset es
      // cordón inferior (no lo pisa si ya se resolvió como alfarda).
      if (conn.kind === "COLUMN") {
        if (pi.z == null && pj.z != null && !pointRoofZ.has(conn.pi)) {
          pointRoofZ.set(conn.pi, zBelow);
          pointRoofStory.set(conn.pi, belowStoryNameOf(toks[1]));
        }
        if (pj.z == null && pi.z != null && !pointRoofZ.has(conn.pj)) {
          pointRoofZ.set(conn.pj, zBelow);
          pointRoofStory.set(conn.pj, belowStoryNameOf(toks[1]));
        }
      }
      // ALERO en viga/diagonal de techo: extremo SIN offset que TAMBIÉN
      // existe en un piso inferior = apoyo del techo sobre columna/muro de
      // ese nivel (ver pointExistsBelow). La CUMBRERA (punto exclusivo del
      // piso del techo) NO entra acá y conserva z = elevación del piso.
      // Extremo SIN offset: primero se intenta resolver por la PENDIENTE del
      // faldón (distingue cumbrera de alero, ver extrapolateRoofZ); si no hay
      // datos para extrapolar, se cae a la regla de alero por "existe abajo".
      [conn.pi, conn.pj].forEach((ptId) => {
        const p = pointCoords.get(ptId);
        if (!p || p.z != null || pointRoofZ.has(ptId)) return;

        const zExtrap = extrapolateRoofZ(ptId, toks[1]);
        if (zExtrap != null) {
          pointRoofZ.set(ptId, zExtrap);
          pointRoofStory.set(
            ptId,
            Math.abs(zExtrap - zStory) <= 1e-6 ? toks[1] : belowStoryNameOf(toks[1]),
          );
          return;
        }

        if (!columnEndpointIds.has(ptId) && pointExistsBelow(ptId, toks[1])) {
          pointRoofZ.set(ptId, zBelow);
          pointRoofStory.set(ptId, belowStoryNameOf(toks[1]));
        }
      });
    });

    // NOTA (2026-07-31): acá existía una "propagación por BEAM" — copiar la
    // cota de un extremo resuelto al otro extremo sin offset de cada viga,
    // iterativamente. La REEMPLAZA la regla de ALERO de arriba
    // (pointExistsBelow), que es más precisa porque distingue POR QUÉ un
    // punto no tiene offset: si existe en un piso inferior es un apoyo (va a
    // belowElev), si es exclusivo del piso del techo es la cumbrera (se queda
    // en la elevación del piso). La propagación no hacía esa distinción y
    // arrastraba la CUMBRERA hacia abajo con la cota de su vecino inclinado
    // (MODULO 1: cumbrera a 10.75 en vez de 11.90). Verificado con volcado
    // completo de geometría (nodos+frames+áreas): MODULO 5 y MODULO 6 salen
    // BIT A BIT IDÉNTICOS sin ella — ya no aporta nada que la regla de alero
    // no cubra.

    lines.forEach((line) => {
      if (/^POINTASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        const coords = pointCoords.get(toks[0]);
        if (!coords) return;
        // Si el punto es parte de la geometría de techo (pointRoofZ ya resuelto
        // por el pre-pase) Y este POINTASSIGN es del MISMO piso en cuyo
        // contexto se resolvió, usar ESA cota — no la elevación cruda del
        // piso. Sin esto, un POINTASSIGN de un punto de alfarda (p.ej. "104",
        // asignado a Story2 con USERJOINT) creaba un nodo HUÉRFANO en la
        // elevación del piso (6.29) además del nodo real ya colocado por
        // LINEASSIGN en su cota correcta (4.384).
        // El chequeo de piso es NECESARIO: un mismo punto puede tener OTRO
        // POINTASSIGN en un piso distinto (p.ej. "21" en "Base" con su
        // RESTRAINT de apoyo real, además de en "Story1" por su rol de base
        // del tijeral) — sin el chequeo, el apoyo de Base se reubicaba
        // incorrectamente a la cota del techo (3.36 en vez de 0).
        const zRoof = pointRoofZ.get(toks[0]);
        const roofStory = pointRoofStory.get(toks[0]);
        const z = (zRoof != null && roofStory === toks[1])
          ? zRoof
          : (storyElev.has(toks[1]) ? storyElev.get(toks[1]) : 0);
        const nd = nodes[getNode(coords.x, coords.y, z) - 1];
        const restr = q(line, "RESTRAINT");
        if (restr) {
          const r = { ux: 0, uy: 0, uz: 0, rx: 0, ry: 0, rz: 0 };
          restr.split(/\s+/).forEach((d) => { const k = d.toLowerCase(); if (k in r) r[k] = 1; });
          nd.restraints = r; nd.constraints = r; nd.hasRestraints = true;
          if (r.ux && r.uy && r.uz && r.rx && r.ry && r.rz) nd.soporte = "soporteUno";
        }
        // DIAPH del POINTASSIGN.
        //
        // "DISCONNECTED" es el estado DEFAULT que ETABS exporta para
        // cualquier nudo SIN asignación directa de diafragma a nivel de
        // joint — NO significa "excluido a propósito". Confirmado con dos
        // .e2k reales (2026-08-03/05): en MODULO 6 (sin losas) los nudos
        // DISCONNECTED no tienen NADA de qué heredar, así que da igual cómo
        // se traten; pero en MODULO 1 (4).e2k, los MISMOS 89 nudos
        // DISCONNECTED de Story1 (todos con USERJOINT "Yes", marca de
        // exportación estándar, no de una decisión del usuario) están
        // cubiertos por 61 losas con `DIAPH "D1"` — el diafragma real vive
        // en la ASIGNACIÓN DE ÁREA (ver más abajo, AREAASSIGN), no en el
        // joint. Un fix anterior trataba DISCONNECTED como exclusión CON
        // PRECEDENCIA sobre el área (ver getExplicitDiaphragmGroups) — eso
        // arreglaba MODULO 6 pero anulaba el D1 real de MODULO 1: el
        // diafragma llegaba vacío al motor pese a existir en el .e2k.
        //
        // Por eso DISCONNECTED se trata como NEUTRO: no toca nd.diaphragm* en
        // absoluto, dejando que la asignación de ÁREA (si existe) lo defina.
        // Sigue sin haber forma de "excluir a propósito" un nudo cubierto por
        // un área con diafragma vía .e2k — eso es Assign ▸ Joint ▸ Diaphragms
        // ▸ Disconnect DESDE LA APP (que sí escribe diaphragmMode="none" con
        // precedencia real, un caso distinto de este import).
        const diaph = q(line, "DIAPH");
        if (diaph && !/disconnect/i.test(diaph)) {
          nd.diaphragmName = diaph;
          nd.diaphragmId = diaph;
          nd.hasDiaphragm = true;
        }
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
        // Cota resuelta de cada extremo por el pre-pase de techo (pointRoofZ):
        // alfarda (elevPiso−offset), cordón inferior (belowElev) o cumbrera
        // (elevPiso). Si NINGÚN extremo es punto de techo, se usa la lógica
        // estándar (columna belowElev→storyElev, viga/brace horizontal al piso).
        //
        // Un self-loop de COLUMN (pi===pj, patrón ETABS de "columna de piso
        // completo": misma etiqueta de punto arriba y abajo, la vertical la
        // define el piso) SIEMPRE usa la lógica estándar de columna, NUNCA
        // pointRoofZ. Motivo: un self-loop no tiene "dos puntos" distintos que
        // resolver; si su punto resulta ser también base del tijeral (resuelto
        // en pointRoofZ a belowElev), ambos extremos tomarían esa misma cota y
        // la columna de SOPORTE real colapsaba a longitud cero (ej. "Columna T
        // 70x50x30cm" self-loop "24"-"24" en Story1 → quedaba 3.36→3.36 en vez
        // de Base 0→3.36).
        //
        // NOTA: para los NO-self-loop se usa pointRoofZ SIN chequear el piso a
        // propósito — un miembro de techo (brace/vertical asignado a Story2)
        // conecta legítimamente puntos resueltos en contextos de piso DISTINTOS
        // (la alfarda en "Story2", el cordón inferior en "Story1"=belowElev).
        // Chequear el piso aquí rompía el techo (el cordón inferior caía a la
        // cumbrera → zigzag). El chequeo de piso SÍ va, pero solo en
        // POINTASSIGN (para no reubicar apoyos de Base), no aquí.
        const zStory = storyElev.get(toks[1]) ?? 0;
        const isSelfLoopColumn = conn.kind === "COLUMN" && conn.pi === conn.pj;
        // La cota de techo de un punto SOLO aplica en el piso donde se
        // resolvió (o en el piso inmediatamente superior, que es donde vive la
        // línea cuando el punto quedó anclado al nivel de abajo — caso alero/
        // base de columna). Un ALERO existe también en pisos inferiores (ver
        // pointExistsBelow): sin este filtro, su cota de techo se aplicaba
        // TAMBIÉN a sus vigas de Story1/Story2 y esas vigas salían disparadas
        // al nivel del techo (MODULO 1, punto del eje 1).
        const roofZAppliesHere = (ptId) => {
          if (!pointRoofZ.has(ptId)) return false;
          const st = pointRoofStory.get(ptId);
          if (st == null) return true;
          return st === toks[1] || st === belowStoryNameOf(toks[1]);
        };
        const ziForced = isSelfLoopColumn || !roofZAppliesHere(conn.pi) ? null : pointRoofZ.get(conn.pi);
        const zjForced = isSelfLoopColumn || !roofZAppliesHere(conn.pj) ? null : pointRoofZ.get(conn.pj);

        // Base de la línea según su STORY SPAN (ver lineConn.storySpan): una
        // columna con span 2 arranca DOS pisos abajo, no uno.
        const zLineBottom = elevNStoriesBelow(toks[1], conn.storySpan ?? 1);

        // ── COLUMNA QUE ATRAVIESA VARIOS PISOS (span ≥ 2) ─────────────────
        // Se resuelve por la semántica explícita del .e2k y NO por la
        // heurística de techo (pointRoofZ): el extremo con offset Z va a
        // elevPiso − offset, y el que no tiene, a la base que marca el span.
        // Sin esto, MODULO 1 importaba sus 8 columnas C30X60cm de 6.4 a 7.55
        // en vez de 3.2 a 7.547 (ETABS, elevación E) — quedaba un hueco entre
        // Story1 y el techo y el modelo salía 4× más flexible.
        // Se exige span ≥ 2 a propósito: con span 1 (la columna normal, y los
        // parantes de armadura marcados COLUMN) manda la heurística de techo,
        // que es la que está calibrada — este camino solo atiende el caso que
        // esa heurística no puede conocer.
        const ziOffset = pointCoords.get(conn.pi)?.z;
        const zjOffset = pointCoords.get(conn.pj)?.z;
        if (
          conn.kind === "COLUMN" &&
          !isSelfLoopColumn &&
          (conn.storySpan ?? 1) >= 2 &&
          (ziOffset != null) !== (zjOffset != null)
        ) {
          n1 = getNode(pi.x, pi.y, ziOffset != null ? zStory - ziOffset : zLineBottom);
          n2 = getNode(pj.x, pj.y, zjOffset != null ? zStory - zjOffset : zLineBottom);
        } else if (ziForced != null || zjForced != null) {
          // Al menos un extremo es punto de techo resuelto. El extremo sin
          // resolver (cumbrera, punto sin offset no marcado) va a la elevación
          // del piso (nivel de cumbrera).
          n1 = getNode(pi.x, pi.y, ziForced != null ? ziForced : zStory);
          n2 = getNode(pj.x, pj.y, zjForced != null ? zjForced : zStory);
        } else if (conn.kind === "COLUMN") {
          n1 = getNode(pi.x, pi.y, zLineBottom);
          n2 = getNode(pi.x, pi.y, zStory);
        } else {
          n1 = getNode(pi.x, pi.y, zStory);
          n2 = getNode(pj.x, pj.y, zStory);
        }
        const kindLc = conn.kind === "COLUMN" ? "column" : conn.kind === "BRACE" ? "brace" : "beam";
        const secObj = frameSecMap.get(section) || { name: section };
        // Rotación del eje local (LINEASSIGN ... ANG 90): sin esto, una
        // columna T/L rotada quedaba con sus ejes fuerte/débil INTERCAMBIADOS
        // (rigidez X↔Y mal). El payload sísmico ya sabe girar el vecxz con
        // localAxisAngle (payload.js _frameVecxzForSeismic) — solo faltaba
        // que el import lo leyera. MODULO 5 y 6 traen columnas con ANG 90/270.
        const localAngle = kvNum(line, "ANG", 0);
        const frame = {
          id: frames.length + 1,
          // Identidad ORIGINAL en ETABS (LINEASSIGN "<Label>" "<Story>"). El id
          // de la app es un correlativo y no sirve para cruzar contra las
          // tablas que exporta ETABS, que van por Story + Label. Guardarlos acá
          // es lo que permite comparar barra por barra
          // (ver python-backend/comparar_frame_forces.py).
          e2kName: toks[0] || null,
          e2kStory: toks[1] || null,
          node1: n1, node2: n2, node1Id: n1, node2Id: n2,
          type: kindLc, elementType: kindLc, objectType: "frame",
          sectionName: section, sectionId: section,
          section: secObj, frameSection: secObj, hasAssignedSection: true,
          A: secObj.A ?? null, _A: secObj.A ?? null,
          material: secObj.material || null,
          ...(localAngle ? { localAxisAngle: localAngle } : {}),
          frameLoads: [], lineLoads: [], visible: true,
        };
        frames.push(frame);
        frameByKey.set(`${toks[0]}|${toks[1]}`, frame);
      } else if (/^AREAASSIGN\s/i.test(line)) {
        const toks = quotedAll(line);
        const conn = areaConn.get(toks[0]);
        if (!conn) return;
        const section = q(line, "SECTION") || "";
        const secDef = slabSecMap.get(section) || { name: section, thickness: 0, material: "CONC", kind: "Slab" };

        // Un AREA "PANEL" NO siempre es un muro: ETABS también usa PANEL para
        // FRANJAS INCLINADAS de techo (losa a dos aguas — MODULO 1: 48 PANELs
        // con sección de LOSA "Aligerado e=0.20" y 4 puntos únicos con offset
        // Z). Muro real = PANEL con sección de MURO, o con traza degenerada en
        // planta ([P1,P2,P2,P1] → 2 puntos únicos, la forma en que ETABS
        // exporta el muro por piso). PANEL con ≥3 puntos únicos y sección de
        // losa → superficie inclinada real: va por el camino de LOSA con las
        // cotas reales de sus puntos (offsets), NO extruido vertical.
        const uniqIdCount = new Set(conn).size;
        const isWallSection = /wall/i.test(secDef.kind || "");
        const isWall = areaKind.get(toks[0]) === "wall" && (isWallSection || uniqIdCount <= 2);

        // ── MURO (PANEL) ────────────────────────────────────────────────
        // El AREA "PANEL" trae la traza en planta (2 puntos únicos, repetidos
        // como [P1,P2,P2,P1]); se extruye vertical entre el piso de abajo y el
        // piso asignado — igual que ETABS dibuja el muro por piso. Sin esto,
        // el muro caía por el camino de losa: 4 puntos al MISMO Z (plano) con
        // solo 2 distintos → área cero, no se importaba nada.
        if (isWall) {
          const topZ = storyElev.get(toks[1]) ?? 0;
          const botZ = belowElevOf(toks[1]);
          // Geometría por VÉRTICE (perímetro ETABS: abajo, abajo, arriba,
          // arriba — mismo orden que WallDrawingState.createWallPanel):
          //  - punto CON offset → z = elevPiso − offset (tope siguiendo el
          //    techo inclinado: tímpanos/hastiales bajo una losa a dos aguas,
          //    p.ej. MODULO 1 W10: 2 puntos planos abajo + 2 con offset).
          //  - punto SIN offset → base (posiciones 0-1) o tope plano (2-3) —
          //    reproduce también la traza degenerada [P1,P2,P2,P1] clásica.
          let wpts = null;
          if (conn.length === 4) {
            const cs = conn.map((ptId) => pointCoords.get(ptId));
            if (cs.every(Boolean)) {
              wpts = cs.map((c, k) => ({
                x: round3(c.x),
                y: round3(c.y),
                z: round3(c.z != null ? topZ - c.z : (k < 2 ? botZ : topZ)),
                visible: true, color: null,
              }));
            }
          }
          if (!wpts) {
            const uniqPlan = [];
            const seen = new Set();
            for (const ptId of conn) {
              if (seen.has(ptId)) continue;
              seen.add(ptId);
              const c = pointCoords.get(ptId);
              if (c) uniqPlan.push({ x: round3(c.x), y: round3(c.y) });
            }
            if (uniqPlan.length < 2) return;
            const [pa, pb] = uniqPlan;
            wpts = [
              { x: pa.x, y: pa.y, z: round3(botZ), visible: true, color: null },
              { x: pb.x, y: pb.y, z: round3(botZ), visible: true, color: null },
              { x: pb.x, y: pb.y, z: round3(topZ), visible: true, color: null },
              { x: pa.x, y: pa.y, z: round3(topZ), visible: true, color: null },
            ];
          }
          wpts.forEach((p) => getNode(p.x, p.y, p.z));
          const wallMat = materialMap.get(secDef.material);
          const wallMpv = Number(wallMat?.massPerUnitVolume);
          const wallRho = wallMpv > 0 && wallMpv < 1e-3 ? wallMpv * 1e12 : 2400;
          const wallSelfWeightKgM2 = ((Number(secDef.thickness) || 0) / 1000) * wallRho;
          const wallArea = {
            id: areas.length + 1,
            type: "wall", areaType: "wall",
            points: wpts, z: round3(topZ),
            wallSection: section,
            wallSelfWeightKgM2,
            section: { name: section, thickness: secDef.thickness, material: secDef.material || "CONC" },
            areaLoads: [], loads: [], visible: true,
          };
          areas.push(wallArea);
          areaByKey.set(`${toks[0]}|${toks[1]}`, wallArea);
          return;
        }

        const z = storyElev.get(toks[1]) ?? 0;
        // Cota REAL por punto: el 3er valor del POINT es un offset BAJO la
        // elevación del piso (mismo esquema que las líneas de techo:
        // Z = elevPiso − offset). Losas planas normales (sin offset) quedan
        // exactamente como antes (z = elevPiso); las franjas de techo
        // inclinado (FLOOR o PANEL-losa con puntos con offset) salen con su
        // pendiente real en vez de aplanadas al nivel del piso.
        // ¿Es una franja de techo inclinado? (algún vértice con offset). Solo
        // ahí un vértice SIN offset puede ser un ALERO: si el punto existe
        // también en un piso inferior, apoya ahí (ver pointExistsBelow) —
        // si no, es cumbrera y se queda en la elevación del piso. En una losa
        // plana normal (ningún vértice con offset) nada de esto aplica.
        const areaHasOffset = conn.some((ptId) => pointCoords.get(ptId)?.z != null);
        const zBelowArea = belowElevOf(toks[1]);
        // Story offsets EXPLÍCITOS de la línea AREA (ver areaStoryOffsets):
        // dicen a qué piso pertenece cada vértice. Mandan sobre la heurística
        // de alero — es el dato de ETABS, no una suposición. Sin esto, el
        // borde bajo de un faldón (que ETABS marca con offset 1) se quedaba en
        // la elevación de la cumbrera y el panel salía casi VERTICAL
        // (MODULO 5: W14 y W20, los dos aleros del techo).
        const storyOffsets = areaStoryOffsets.get(toks[0]) || null;
        const pts = conn
          .map((ptId, i) => {
            const c = pointCoords.get(ptId);
            if (!c) return null;
            const so = storyOffsets ? Number(storyOffsets[i]) || 0 : 0;
            // Piso de ESTE vértice (el asignado, o N pisos más abajo).
            const zStoryPt = so > 0 ? elevNStoriesBelow(toks[1], so) : z;
            let zPt = zStoryPt;
            if (c.z != null) zPt = zStoryPt - c.z;
            else if (!storyOffsets && areaHasOffset && pointExistsBelow(ptId, toks[1])) {
              // Sin story offsets en el archivo (formatos viejos) se mantiene
              // la heurística anterior para no cambiar lo que ya funcionaba.
              zPt = zBelowArea;
            }
            return { x: round3(c.x), y: round3(c.y), z: round3(zPt), visible: true, color: null };
          })
          .filter(Boolean);
        if (pts.length < 3) return;
        pts.forEach((p) => getNode(p.x, p.y, p.z));
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
          // Cómo entrega la losa su carga a las vigas del contorno:
          //  - oneWay=true  → en un solo sentido (aligerado). El sentido lo da
          //    `loadDistAngle` (AREAASSIGN ... ANG, en grados desde +X).
          //  - oneWay=false → dos sentidos, regla de 45°.
          // Lo consume _buildSeismicSlabToBeamLoadsForPayload (payload.js).
          oneWayLoadDist: slab.oneWayLoadDist === true,
          loadDistAngle: kvNum(line, "ANG", 0),
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
        // INCLUDEELEMENTS del .e2k (ver arriba) — NO hardcodear true: si es
        // "No", el peso propio de barras NO debe sumarse a la masa sísmica
        // (solo INCLUDELOADS vía massSourceLoads/MASSSOURCELOAD arriba).
        includeSelfWeight: massSourceIncludeElements, selfWeightMultiplier: 1,
        loadPatterns: massSourceLoads,
        loadMultipliers: massSourceLoads.map((l) => ({ load: l.load, multiplier: l.multiplier })),
        convertWeightToMass: true, gravity: 9.81,
        includeLateralMass: true, includeVerticalMass: false,
        lumpLateralMassAtStoryLevels: true, specifiedLoadPatterns: true, elementSelfMass: massSourceIncludeElements,
      }
      : null;

    const materials = [...materialMap.values()];
    const frameSections = [...frameSecMap.values()];
    // Secciones de losa (PROPTYPE Slab/Deck; los muros van aparte, ver
    // wallSections abajo). Forma que espera la lista del modal Slab Sections
    // (this.slabSections).
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

    // Secciones de muro (SHELLPROP PROPTYPE "Wall" — WALL PROPERTIES en el
    // .e2k). Misma forma que espera el modal Wall Sections (this.wallSections,
    // ver wall-sections-modal.blade.php) — name/material/thickness(mm)/color.
    const wallSections = [...slabSecMap.values()]
      .filter((s) => /wall/i.test(s.kind || ""))
      .map((s) => ({
        name: s.name,
        material: s.material || "CONC",
        // El .e2k manda "ShellThin"/"ShellThick" (sin guion) — normalizar al
        // valor que usa el <select> del modal (wall-sections-modal.blade.php).
        modelingType: /thick/i.test(s.modelingType || "") ? "Shell-Thick" : "Shell-Thin",
        thickness: s.thickness, // mm
        color: "#78716c",
      }));

    // ── Combinaciones de carga (COMBO …) ──
    // Aplanadas: el .e2k permite que un combo referencie OTRO combo y el motor
    // solo entiende términos que apuntan a casos. Ver e2k-load-combos.js.
    const { combos: loadCombinations, skipped: skippedCombos } =
      parseE2kLoadCombos(lines);

    if (skippedCombos.length) {
      console.warn("⚠️ Combos del .e2k NO importados:", skippedCombos);
    }

    // ── Fase 3: funciones de espectro (USER con puntos) + casos Response Spectrum ──
    // Espectros que el .e2k referencia por ARCHIVO EXTERNO: la línea trae
    //   FUNCTION "Func1" FUNCTYPE "SPECTRUM" FILE "C:\...\Espectro.txt"
    // y los PUNTOS no viajan en el .e2k. Los casos que usen esa función se
    // quedan sin espectro y después desaparecen del selector de diagramas sin
    // explicación. Se avisa acá, que es donde se sabe el motivo real.
    const spectrumFilesMissing = [...rsFuncMap.values()].filter(
      (f) => /spectrum/i.test(f.functype || "") && f.externalFile && !(f.points || []).length,
    );

    if (spectrumFilesMissing.length) {
      console.warn(
        "⚠️ Espectros referenciados por ARCHIVO EXTERNO (sus puntos NO están en el .e2k):",
        spectrumFilesMissing.map((f) => `${f.name} → ${f.externalFile}`),
      );
    }

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

    // ── Marcar los términos de ESPECTRO como sin signo ──
    //
    // Un caso de espectro devuelve una MAGNITUD (CQC/SRSS), sin signo físico.
    // El motor necesita saberlo (`signless`) para aplicar esa magnitud en el
    // sentido ADVERSO de cada componente por separado.
    //
    // Sin la marca, el factor del .e2k (+1 / -1) se aplicaba como un signo
    // COMÚN a P, M2 y M3, y eso NO es la envolvente: en C20 del modelo de
    // referencia la rama "-SDX" daba el axial máximo (35.93 t) pero con los
    // momentos casi anulados (M2 = -0.54 donde ETABS reporta +0.99). Demanda
    // insegura. Ver _ff_compute_combo_entries en solver.py.
    //
    // Se hace ACÁ y no en e2k-load-combos.js porque el parser de combos no sabe
    // qué casos son de espectro; acá sí.
    //
    // OJO: NO se reescribe `t.case`. Los combos referencian el caso por NOMBRE
    // ("SDX ESCALADO") y de resolverlo ya se encarga `remapCombosToKeptCases`
    // (ver frameForceBackend.js), que además fusiona los casos duplicados. Un
    // intento previo de reescribir el id acá pisó ese mecanismo y dejó los
    // términos apuntando a un caso que el motor ya no tenía — el sismo volvía a
    // desaparecer del combo, en silencio.
    {
      const norm = (v) => String(v || "").trim().replace(/\s+/g, "_").toUpperCase();
      const espectro = new Set();
      responseSpectrumCases.forEach((c) => {
        if (c.id) espectro.add(norm(c.id));
        if (c.name) espectro.add(norm(c.name));
      });

      let marcados = 0;
      loadCombinations.forEach((combo) => {
        (combo.terms || []).forEach((t) => {
          if (espectro.has(norm(t.case)) && !t.signless) { t.signless = true; marcados += 1; }
        });
      });

      if (marcados) {
        console.info(`\u2139\ufe0f Combos: ${marcados} t\u00e9rmino(s) de espectro marcados como sin signo.`);
      }
    }

    console.log("📥 Import ETABS .e2k:", {
      stories: stories.length, nodes: nodes.length, frames: frames.length, areas: areas.length,
      materials: materials.length, sections: frameSections.length,
      rsFunctions: responseSpectrumFunctions.length, rsCases: responseSpectrumCases.length,
      combos: loadCombinations.length,
      espectrosSinPuntos: spectrumFilesMissing.length,
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
        wallSections,
        loadCases,
        staticLoadCases,
        diaphragms: diaphragmDefs,
        massSource,
        responseSpectrumFunctions,
        responseSpectrumCases,
        loadCombinations,
        // El modal Define ▸ Combinaciones lee `combinations` como texto.
        loadCombinationExpressions: loadCombinations.map((c) => ({
          name: c.id,
          expression: comboExpression(c),
        })),
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

      // Las secciones de losa/muro no viajan por importFromJSON: se asignan
      // directo a this.slabSections/this.wallSections (lo que leen los
      // modales Slab Sections / Wall Sections y renderModel3d).
      if (isReal && Array.isArray(data.definitions?.slabSections) && data.definitions.slabSections.length) {
        this.slabSections = data.definitions.slabSections;
      }
      if (isReal && Array.isArray(data.definitions?.wallSections) && data.definitions.wallSections.length) {
        this.wallSections = data.definitions.wallSections;
      }
      // Secciones de frame → store que lee el modal Frame Sections
      // (window.cadSystem.frameSections.sections) y del que el render 2D/3D
      // toma el color por sección. Sin esto, las secciones importadas no
      // aparecen en el modal para asignarles color.
      if (isReal && Array.isArray(data.definitions?.frameSections) && data.definitions.frameSections.length) {
        if (!this.frameSections) this.frameSections = {};
        this.frameSections.sections = data.definitions.frameSections;
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
