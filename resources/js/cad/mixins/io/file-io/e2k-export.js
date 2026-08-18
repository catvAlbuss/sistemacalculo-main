// mixins/io/file-io/e2k-export.js — parte "e2k-export" de file-io
// (file-io.js se partió en sub-mixins por responsabilidad; barril en file-io.js).
import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../../../model/shapes.js";
import { read as readmat } from "mat-for-js";
import { axisToFixed, removeFromArray } from "../../../lib/utils.js";
import { e2kRestraintText } from "../../../model/nodeSupports.js";
import {
  buildStoryLevels,
  describeArea,
  describePointDrop,
  verticalSignature,
  isDegenerateInPlan,
  classifyArea,
  shellPropType,
} from "./e2kAreaGeometry.js";
import { Triangle, Puente, Arco } from "../../../model/parametricModels.js";
import { extrudeToNewFloor, selectAllNodes, activate3DDrawingMode } from "../../../3d/modeling3d.js";
import { toggleView3D } from "../../../3d/viewer3d.js";
import {
  serializeFrameForceModule,
  restoreFrameForceModule,
} from "../../../engine/frameForcePersistence.js";

export const e2kExportMixin = {

  // Export methods
  downloadTextFile(content, filename, mimeType = "text/plain") {
    const blob = new Blob([content], {
      type: `${mimeType};charset=utf-8`,
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  },

  getExportBaseName(defaultName = "modelo_estructura") {
    const rawName = this.currentFileName || defaultName;

    return (
      String(rawName)
        .replace(/\.[^/.]+$/, "")
        .replace(/[^\w\-]+/g, "_")
        .replace(/^_+|_+$/g, "") || defaultName
    );
  },

  formatE2KNumber(value, decimals = 6) {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return Number(number.toFixed(decimals));
  },

  // ============================================================
  //  EXPORTACIÓN .e2k NATIVA DE ETABS (Fases 1+2: geometría + cargas)
  //  Colapsa el modelo 3D explícito a la representación por pisos
  //  que usa ETABS (POINT en planta + ASSIGN por Story).
  //  Unidades de salida: TONF, M (como el .e2k de referencia).
  // ============================================================

  // Factor MPa → tonf/m² (unidad de fuerza/área del .e2k en TONF·M)
  _e2kMPaToTonfM2(v) {
    return Number(v || 0) * 101.9716213;
  },

  // Cadena de restricción ETABS ("UX UY UZ RX RY RZ") desde {ux..rz}
  // El texto RESTRAINT lo arma model/nodeSupports.js, que es la fuente única
  // (la comparte el payload del motor). Se conserva el método por si algún
  // llamador viejo le pasa el objeto de restricciones suelto.
  _e2kRestraintStr(r) {
    return e2kRestraintText({ restraints: r });
  },

  buildETABS_E2KText() {
    const data = this.exportToJSON?.() || {};
    const model = data.model || data;
    const definitions = data.definitions || {};

    const referenceGrid = model.referenceGrid || this.referenceGrid || {};
    const rawStories = model.stories || this.stories || [];
    const nodes = model.nodes || data.nodes || [];
    const frames = model.frames || model.beams || data.beams || [];
    const areas = model.areas || data.areas || [];

    const frameSections = definitions.frameSections || data.frameSections || this.frameSections?.sections || [];
    const materials = definitions.materials || data.materials || this.materialProperties?.materials || [];
    const loadCases = definitions.loadCases || data.loadCases || [];
    const diaphragms = definitions.diaphragms || data.diaphragms || [];
    const massSource = definitions.massSource || data.massSource || this.massSource || {};

    // ---- MASS SOURCE (preparación temprana para garantizar coherencia) ----
    const msName = massSource.name ? massSource.name.replace(/[^a-zA-Z0-9_]/g, "_") : "MsSrc1";
    let msLoads = massSource.loadMultipliers || massSource.loadPatterns || [];

    // Asegurar que todos los patrones de masa existan en loadCases ANTES de escribir $ LOAD PATTERNS
    const existingLoadCaseNames = new Set((loadCases || []).map(c => c.name));
    msLoads.forEach((l) => {
      const nm = l.load || l.name;
      if (nm && !existingLoadCaseNames.has(nm)) {
        loadCases.push({ name: nm, type: "Dead", selfWeight: 0 });
        existingLoadCaseNames.add(nm);
      }
    });

    // Fase 3 — sísmico: funciones de espectro + casos Response Spectrum.
    const rsFunctions =
      definitions.responseSpectrumFunctions || data.responseSpectrumFunctions ||
      this.responseSpectrumFunctions?.items || [];
    const rsCases =
      definitions.responseSpectrumCases || data.responseSpectrumCases ||
      this.responseSpectrumCases?.items || [];

    const fmt = (v, dec = 6) => this.formatE2KNumber(v, dec);
    const rnd = (v) => Number(Number(v || 0).toFixed(3));

    // ---- Pisos: elevación → nombre; helper dropForZ ----------------------
    const stories = rawStories.slice().sort((a, b) => (a.elevation || 0) - (b.elevation || 0));
    // Niveles de piso para resolver a qué piso "cuelga" cada punto (nodo de
    // LINE o vértice de AREA) y cuánto baja respecto de él. Antes cada bloque
    // usaba su propio criterio: AREA colgaba desde arriba (describeArea) pero
    // LINE (columnas/vigas) usaba `storyOfZ`, que asignaba el piso EN O POR
    // DEBAJO de z — funciona para nodos flat, pero una columna o viga
    // inclinada (que no llega al nivel pleno del piso, p.ej. un parante o
    // correa de techo a dos aguas) quedaba con el piso de ABAJO y drop 0:
    // salía plana. `describePointDrop` unifica el criterio con el de AREA
    // (validado contra un .e2k real de ETABS, ver su doc en e2kAreaGeometry).
    const storyLevels = buildStoryLevels(rawStories);
    const dropForZ = (z) => describePointDrop(z, storyLevels);

    // ---- Puntos en planta: (x,y) únicos ---------------------------------
    const planPoints = new Map(); // key → {name,x,y}
    let ppCounter = 0;
    // `drop` = cuánto BAJA el punto respecto de la elevación de su piso (el 3er
    // valor de POINT en el .e2k). Entra en la CLAVE, no solo en el valor: en
    // ETABS un mismo (x,y) con distinto descenso es otro POINT, y sin esto el
    // vértice bajo de un faldón pisaba al de la cumbrera y el techo salía plano.
    const getPlanPoint = (x, y, drop = 0) => {
      const d = Math.abs(drop) < 1e-4 ? 0 : rnd(drop);
      const k = `${rnd(x)}|${rnd(y)}|${d}`;
      if (!planPoints.has(k)) {
        ppCounter += 1;
        planPoints.set(k, { name: String(ppCounter), x: rnd(x), y: rnd(y), z: d });
      }
      return planPoints.get(k);
    };

    const nodeById = new Map();
    nodes.forEach((n) => nodeById.set(n.id, n));
    // El drop del nodo (0 si cae justo en un piso) entra en la clave del
    // punto, igual que en las áreas — un nodo de parante/correa inclinada
    // que no llega al nivel pleno de su piso necesita su PROPIO punto, no el
    // (x,y) plano de un nodo flat en ese mismo eje.
    const getNodePlanPoint = (n) => getPlanPoint(n.x, n.y, dropForZ(n.z).drop);
    nodes.forEach((n) => getNodePlanPoint(n));
    // Los vértices de área NO se pre-registran acá: su punto depende del
    // DESCENSO respecto del piso, que recién se conoce en `describeArea`.
    // Registrarlos con drop=0 dejaba un POINT fantasma por cada vértice
    // inclinado, además del bueno.

    // ---- Diafragma rígido (si existe en definiciones) -------------------
    const rigidDiaph = (diaphragms || []).find((d) => /rigid/i.test(d.rigidity || d.type || ""));
    const rigidDiaphName = rigidDiaph?.name || null;

    // ---- Colapso de LÍNEAS (columnas/vigas) -----------------------------
    const lineDefs = new Map(); // dedupKey → {name,kind,pi,pj}
    const lineAssigns = []; // {name, story, section, frame}
    let colN = 0;
    let beamN = 0;
    let braceN = 0;
    frames.forEach((f) => {
      const n1 = nodeById.get(f.node1 ?? f.node1Id);
      const n2 = nodeById.get(f.node2 ?? f.node2Id);
      if (!n1 || !n2) return;
      const pp1 = getNodePlanPoint(n1);
      const pp2 = getNodePlanPoint(n2);
      const et = String(f.elementType || f.type || "beam").toLowerCase();
      // Clasificación GEOMÉTRICA (no por etiqueta): un elemento vertical
      // (mismo (x,y), distinta Z) es SIEMPRE columna en ETABS. Se compara la
      // coordenada real, NO el nombre del punto: una columna inclinada (que
      // no llega al nivel pleno de su piso) tiene el mismo (x,y) arriba y
      // abajo pero cada extremo cae en un POINT distinto (drop distinto),
      // como en el .e2k real (LINE "C21" COLUMN "13" "301" 2).
      // Necesario porque +Nuevo Piso a veces duplica columnas como "beam".
      const sameXY = rnd(n1.x) === rnd(n2.x) && rnd(n1.y) === rnd(n2.y);
      const dz = Math.abs(rnd(n1.z) - rnd(n2.z)) > 1e-6;
      const kind = sameXY && dz ? "COLUMN" : et === "brace" ? "BRACE" : "BEAM";
      // El piso "dueño" de la barra es el de su extremo MÁS ALTO — igual que
      // ETABS asigna una columna inclinada de 2 pisos al piso de arriba
      // (LINEASSIGN "C21" "Story3") aunque su punto quede varios metros por
      // debajo de esa elevación. Antes usaba `storyOfZ`, que asigna el piso
      // EN O POR DEBAJO de z: para un nodo inclinado que no llega al nivel
      // pleno de su piso, eso lo hacía caer un piso entero más abajo — la
      // viga/columna salía en el story incorrecto y, al compartir story con
      // nodos flat de OTRO piso, se aplanaba.
      const story = dropForZ(Math.max(n1.z, n2.z)).storyName;
      const dedupKey = `${kind}|${[pp1.name, pp2.name].slice().sort().join("~")}`;
      if (!lineDefs.has(dedupKey)) {
        let name;
        if (kind === "COLUMN") { colN += 1; name = `C${colN}`; }
        else if (kind === "BRACE") { braceN += 1; name = `D${braceN}`; }
        else { beamN += 1; name = `B${beamN}`; }
        // El último número de LINE CONNECTIVITIES es cuántos PISOS abarca la
        // columna hacia abajo desde el piso al que se asigna (ver e2k-import.js,
        // mismo dato). Antes salía SIEMPRE "1" — una columna que atraviesa 2
        // pisos de corrido sin nudo intermedio (p.ej. del techo hasta Piso 1,
        // saltándose Piso 2) se reimportaba en ETABS como si arrancara un piso
        // más arriba, dejando un hueco sin conectar. Se mide por índice de
        // piso (Base=0), igual que ETABS: LINE "C21" COLUMN "13" "301" 2 va de
        // Story1(índice1) a Story3(índice3) ⇒ 3−1=2.
        let span = 1;
        if (kind === "COLUMN") {
          const storyIdx = (nm) => storyLevels.findIndex((s) => s.name === nm);
          const topIdx = storyIdx(story);
          const bottomIdx = storyIdx(dropForZ(Math.min(n1.z, n2.z)).storyName);
          if (topIdx >= 0 && bottomIdx >= 0 && topIdx > bottomIdx) span = topIdx - bottomIdx;
        }
        lineDefs.set(dedupKey, { name, kind, pi: pp1.name, pj: pp2.name, span });
      }
      const def = lineDefs.get(dedupKey);
      lineAssigns.push({ name: def.name, story, section: f.sectionName || f.sectionId || "", frame: f });
    });

    // ---- Colapso de ÁREAS (losas) ---------------------------------------
    const areaDefs = new Map(); // dedupKey → {name, pts:[names]}
    const areaAssigns = []; // {name, story, section, area}
    let areaN = 0;

    areas.forEach((a) => {
      const desc = describeArea(a, storyLevels);
      if (!desc) return;

      // El descenso de cada vértice viaja en su POINT (3er valor), así que se
      // pide el punto de planta CON ese dato.
      const pts = (a.points || []).map((p, i) => getPlanPoint(p.x, p.y, desc.drops[i]).name);
      if (isDegenerateInPlan(pts)) return;

      // La firma vertical entra en el dedup: un MURO proyecta en planta una
      // línea (2 puntos repetidos) y antes chocaba con cualquier área sobre esa
      // misma traza; dos faldones de igual planta y distinta pendiente, igual.
      const dedupKey = `A|${pts.slice().sort().join("~")}|${verticalSignature(desc)}`;

      if (!areaDefs.has(dedupKey)) {
        areaN += 1;
        areaDefs.set(dedupKey, {
          name: `${desc.kind === "wall" ? "W" : "F"}${areaN}`,
          pts,
          keyword: desc.keyword,
          offsets: desc.offsets,
        });
      }

      const def = areaDefs.get(dedupKey);
      areaAssigns.push({
        name: def.name,
        story: desc.storyName,
        section: a.section?.name || "",
        area: a,
        kind: desc.kind,
      });
    });

    // ---- Secciones / materiales realmente usados ------------------------
    const usedFrameSecs = new Map();
    frames.forEach((f) => {
      const nm = f.sectionName || f.sectionId;
      if (nm && !usedFrameSecs.has(nm)) {
        usedFrameSecs.set(nm, frameSections.find((s) => s.name === nm) || { name: nm });
      }
    });
    // Secciones de área, separadas por tipo: una sección usada por un muro
    // debe salir con PROPTYPE "Wall", no "Slab". Antes TODAS salían como Slab
    // y ETABS abría las placas como si fueran losas verticales.
    const slabSecs = new Map();
    areas.forEach((a) => {
      const s = a.section;
      if (s && s.name && !slabSecs.has(s.name)) {
        slabSecs.set(s.name, { ...s, _kind: classifyArea(a) });
      }
    });
    const matByName = new Map();
    (materials || []).forEach((m) => matByName.set(m.name, m));
    const usedMats = new Map();
    usedFrameSecs.forEach((s) => { const mn = s.material || "CONC"; if (!usedMats.has(mn)) usedMats.set(mn, matByName.get(mn) || { name: mn, designType: "Concrete" }); });
    slabSecs.forEach((s) => { const mn = s.material || "CONC"; if (!usedMats.has(mn)) usedMats.set(mn, matByName.get(mn) || { name: mn, designType: "Concrete" }); });
    if (usedMats.size === 0) usedMats.set("CONC", matByName.get("CONC") || { name: "CONC", designType: "Concrete" });

    const lines = [];

    // ---- Cabecera -------------------------------------------------------
    // La 1ª línea es la FIRMA que ETABS usa para validar el archivo:
    // "$ File <nombre> saved DD/MM/YYYY HH:MM:SS" (formato exacto obligatorio).
    const _now = new Date();
    const _p = (n) => String(n).padStart(2, "0");
    const _stamp =
      `${_p(_now.getDate())}/${_p(_now.getMonth() + 1)}/${_now.getFullYear()} ` +
      `${_p(_now.getHours())}:${_p(_now.getMinutes())}:${_p(_now.getSeconds())}`;
    lines.push(`$ File ${this.getExportBaseName()}.e2k saved ${_stamp}`);
    lines.push(" ");
    lines.push("$ PROGRAM INFORMATION");
    lines.push('  PROGRAM  "ETABS"  VERSION "22.7.0"  ');
    lines.push("");
    lines.push("$ CONTROLS");
    lines.push('  UNITS  "TONF"  "M"  "C"  ');
    lines.push('  TITLE1  "Exportado desde JHACK ETABS Web"  ');
    lines.push("  PREFERENCE  MERGETOL 0.001");
    lines.push("");

    // ---- STORIES (de arriba hacia abajo) --------------------------------
    lines.push("$ STORIES - IN SEQUENCE FROM TOP");
    const topDown = stories.slice().sort((a, b) => (b.elevation || 0) - (a.elevation || 0));
    topDown.forEach((story, idx) => {
      const name = story.name || `Story${story.id}`;
      const below = topDown[idx + 1];
      if (below) {
        const h = (story.elevation || 0) - (below.elevation || 0);
        lines.push(`  STORY "${name}"  HEIGHT ${fmt(h)} `);
      } else {
        lines.push(`  STORY "${name}"  ELEV ${fmt(story.elevation)} `);
      }
    });
    lines.push("");

    // ---- GRIDS ----------------------------------------------------------
    lines.push("$ GRIDS");
    lines.push('  GRIDSYSTEM "G1"  TYPE "CARTESIAN"  BUBBLESIZE 1.25 ');
    (referenceGrid.xGrids || []).forEach((g) => {
      lines.push(
        `  GRID "G1"  LABEL "${g.id}"  DIR "X"  COORD ${fmt(g.ordinate)} VISIBLE "${g.visible !== false ? "Yes" : "No"}"  BUBBLELOC "${g.bubbleLoc || "End"}"  `,
      );
    });
    (referenceGrid.yGrids || []).forEach((g) => {
      lines.push(
        `  GRID "G1"  LABEL "${g.id}"  DIR "Y"  COORD ${fmt(g.ordinate)} VISIBLE "${g.visible !== false ? "Yes" : "No"}"  BUBBLELOC "${g.bubbleLoc || "Start"}"  `,
      );
    });
    lines.push("");

    // ---- DIAPHRAGM NAMES ------------------------------------------------
    if (rigidDiaphName) {
      lines.push("$ DIAPHRAGM NAMES");
      lines.push(`  DIAPHRAGM "${rigidDiaphName}"    TYPE RIGID`);
      lines.push("");
    }

    // ---- MATERIAL PROPERTIES --------------------------------------------
    lines.push("$ MATERIAL PROPERTIES");
    usedMats.forEach((mat, name) => {
      const dt = String(mat.designType || mat.type || "Concrete");
      const etabsType = /steel/i.test(dt) ? "Steel" : /concrete/i.test(dt) ? "Concrete" : "Other";
      const isConcrete = etabsType === "Concrete";
      const wpv = isConcrete ? 2.4 : /steel/i.test(dt) ? 7.849 : 2.4;
      const E = this._e2kMPaToTonfM2(mat.E || mat.modulusElasticity || 0);
      const U = Number(mat.poisson ?? mat.poissonRatio ?? (isConcrete ? 0.2 : 0.3));
      const A = Number(mat.thermalExpansion || 0.0000099);
      lines.push(`  MATERIAL  "${name}"    TYPE "${etabsType}"    WEIGHTPERVOLUME ${fmt(wpv)}`);
      lines.push(`  MATERIAL  "${name}"    SYMTYPE "Isotropic"  E ${fmt(E)}  U ${fmt(U)}  A ${fmt(A)}`);
      if (isConcrete) {
        const fc = this._e2kMPaToTonfM2(mat.fc || mat.fpc || 21);
        lines.push(`  MATERIAL  "${name}"  FC ${fmt(fc)}`);
      } else if (/steel/i.test(dt)) {
        const fy = this._e2kMPaToTonfM2(mat.fy || mat.fys || 250);
        lines.push(`  MATERIAL  "${name}"  FY ${fmt(fy)}  FU ${fmt(fy * 1.3)}`);
      }
    });
    lines.push("");

    // ---- FRAME SECTIONS + CONCRETE SECTIONS -----------------------------
    lines.push("$ FRAME SECTIONS");
    const concreteFrameSecs = [];
    usedFrameSecs.forEach((s, name) => {
      const mat = s.material || "CONC";
      const type = String(s.type || "rect").toLowerCase();
      if (type === "rect") {
        const D = Number(s.h || 0) / 100;
        const B = Number(s.b || 0) / 100;
        lines.push(`  FRAMESECTION  "${name}"  MATERIAL "${mat}"  SHAPE "Concrete Rectangular"  D ${fmt(D)} B ${fmt(B)} `);
        concreteFrameSecs.push({ name, isColumn: /^c/i.test(name) });
      } else {
        // Perfil no rectangular: exporta como General con área (aprox.)
        lines.push(`  FRAMESECTION  "${name}"  MATERIAL "${mat}"  SHAPE "General"  AREA ${fmt(s.area || s.A || 0)} `);
      }
    });
    lines.push("");
    if (concreteFrameSecs.length) {
      lines.push("$ CONCRETE SECTIONS");
      concreteFrameSecs.forEach((s) => {
        const kind = s.isColumn ? "Column" : "Beam";
        lines.push(
          `  CONCRETESECTION  "${s.name}"  LONGBARMATERIAL "fy=4200 kg/cm2"  CONFINEBARMATERIAL "fy=4200 kg/cm2"  TYPE "${kind}"  COVER 0.04 `,
        );
      });
      lines.push("");
    }

    // ---- SLAB / WALL PROPERTIES -------------------------------------------
    // ETABS separa estos dos bloques con encabezados distintos ($ SLAB
    // PROPERTIES / $ WALL PROPERTIES, ver .e2k exportado real) — antes salían
    // todos bajo un único "$ SLAB PROPERTIES", aunque la línea SHELLPROP en sí
    // ya llevaba PROPTYPE "Wall" correcto.
    const slabList = [];
    const wallList = [];
    slabSecs.forEach((s, name) => {
      (shellPropType(s._kind) === "Wall" ? wallList : slabList).push([name, s]);
    });

    if (slabList.length) {
      lines.push("$ SLAB PROPERTIES");
      slabList.forEach(([name, s]) => {
        const mat = s.material || "CONC";
        const th = Number(s.thickness || 0) / 1000; // mm → m
        lines.push(
          `  SHELLPROP  "${name}"  PROPTYPE  "Slab"  MATERIAL "${mat}"  MODELINGTYPE "Membrane"  SLABTYPE "Slab"  SLABTHICKNESS ${fmt(th)} `,
        );
      });
      lines.push("");
    }

    if (wallList.length) {
      lines.push("$ WALL PROPERTIES");
      wallList.forEach(([name, s]) => {
        const mat = s.material || "CONC";
        const th = Number(s.thickness || 0) / 1000; // mm → m
        // El muro se declara con su espesor y como Shell-Thin: una placa SÍ
        // toma flexión fuera del plano, a diferencia de la losa Membrane.
        lines.push(
          `  SHELLPROP  "${name}"  PROPTYPE  "Wall"  MATERIAL "${mat}"  MODELINGTYPE "ShellThin"  WALLTHICKNESS ${fmt(th)} `,
        );
      });
      lines.push("");
    }

    // ---- POINT COORDINATES ----------------------------------------------
    lines.push("$ POINT COORDINATES");
    planPoints.forEach((p) => {
      // 3er valor = cuánto BAJA el punto respecto de su piso. Solo se escribe
      // cuando existe: es lo que sostiene las losas inclinadas y los aleros.
      const z = p.z ? ` ${fmt(p.z)}` : "";
      lines.push(`  POINT "${p.name}"  ${fmt(p.x)} ${fmt(p.y)}${z} `);
    });
    lines.push("");

    // ---- LINE CONNECTIVITIES --------------------------------------------
    lines.push("$ LINE CONNECTIVITIES");
    lineDefs.forEach((d) => {
      const flag = d.kind === "COLUMN" ? d.span : 0;
      lines.push(`  LINE  "${d.name}"  ${d.kind}  "${d.pi}"  "${d.pj}"  ${flag}`);
    });
    lines.push("");

    // ---- AREA CONNECTIVITIES --------------------------------------------
    lines.push("$ AREA CONNECTIVITIES");
    areaDefs.forEach((d) => {
      const pts = d.pts.map((n) => `"${n}"`).join("  ");
      // Story offset por vértice: 0 = el piso asignado, 1 = un piso abajo…
      // Antes iban todos en 0 y CUALQUIER muro o alero salía plano.
      const offs = d.offsets.join("  ");
      lines.push(`  AREA "${d.name}"  ${d.keyword}  ${d.pts.length}  ${pts}  ${offs}  `);
    });
    lines.push("");

    // ---- POINT ASSIGNS --------------------------------------------------
    lines.push("$ POINT ASSIGNS");
    nodes.forEach((n) => {
      const pp = getNodePlanPoint(n);
      const story = dropForZ(n.z).storyName;
      // NO se filtra por `n.hasRestraints`: esa bandera solo la setea el camino
      // de restricciones explícitas, así que un modelo cuyos apoyos vienen del
      // campo legacy `soporte` se exportaba SIN NINGÚN RESTRAINT y el .e2k
      // salía sin apoyos. `e2kRestraintText` mira los dos caminos, igual que el
      // payload del motor.
      const restr = e2kRestraintText(n);
      if (restr) {
        lines.push(`  POINTASSIGN  "${pp.name}"  "${story}"  RESTRAINT "${restr}"  `);
      } else {
        let l = `  POINTASSIGN  "${pp.name}"  "${story}"  USERJOINT  "Yes"  `;
        // Diafragma SOLO si el nodo lo tiene asignado explícitamente en los datos.
        // La acción de diafragma la aportan las losas membrana (como en el .e2k
        // de referencia); no se inyecta un D1 rígido para no sobre-restringir.
        const dName = n.diaphragmName || n.diaphragm?.name || null;
        if (dName && !/none/i.test(dName)) l += `DIAPH "${dName}"  `;
        lines.push(l);
      }
    });
    lines.push("");

    // ---- LINE ASSIGNS ---------------------------------------------------
    lines.push("$ LINE ASSIGNS");
    lineAssigns.forEach((a) => {
      lines.push(`  LINEASSIGN  "${a.name}"  "${a.story}"  SECTION "${a.section}"  MINNUMSTA 3 AUTOMESH "YES"  MESHATINTERSECTIONS "YES"  `);
    });
    lines.push("");

    // ---- AREA ASSIGNS ---------------------------------------------------
    lines.push("$ AREA ASSIGNS");
    areaAssigns.forEach((a) => {
      // Diafragma asignado a la losa (Assign ▸ Shell ▸ Diaphragms) → DIAPH,
      // igual que ETABS; los nudos lo heredan "From Area" al importar allá.
      const dName = a.area?.diaphragmName || a.area?.diaphragm?.name || null;
      const diaph = dName && !/none/i.test(dName) ? `DIAPH "${dName}"  ` : "";
      // CARDINALPOINT: ETABS referencia el muro por el MEDIO de su espesor
      // ("MIDDLE") y la losa por el TOPE ("TOP", cuelga hacia abajo desde el
      // piso). Antes salía "TOP" fijo para todo — un .e2k real de ETABS
      // (MODULO 1) confirma MIDDLE para AREA...PANEL de muro.
      const cardinal = a.kind === "wall" ? "MIDDLE" : "TOP";
      lines.push(`  AREAASSIGN  "${a.name}"  "${a.story}"  SECTION "${a.section}"  ${diaph}OBJMESHTYPE "DEFAULT"  ADDRESTRAINT "Yes"  CARDINALPOINT "${cardinal}"  TRANSFORMSTIFFNESSFOROFFSETS "No"  `);
    });
    lines.push("");

    // ---- LOAD PATTERNS --------------------------------------------------
    lines.push("$ LOAD PATTERNS");
    const patternType = (c) => {
      const t = String(c.type || "").toUpperCase();
      if (t.includes("DEAD")) return "Dead";
      if (t.includes("ROOF")) return "Roof Live";
      if (t.includes("LIVE")) return "Live";
      if (t.includes("SEISMIC") || t.includes("QUAKE")) return "Seismic";
      return "Other";
    };
    const staticCases = (loadCases || []).filter((c) => c && c.name);
    staticCases.forEach((c) => {
      const pt = patternType(c);
      const sw = pt === "Dead" ? 1 : 0;
      lines.push(`  LOADPATTERN "${c.name}"  TYPE  "${pt}"  SELFWEIGHT  ${sw}`);
    });
    lines.push("");

    // ---- POINT OBJECT LOADS ---------------------------------------------
    lines.push("$ POINT OBJECT LOADS");
    nodes.forEach((n) => {
      const pp = getNodePlanPoint(n);
      const story = dropForZ(n.z).storyName;
      (n.pointLoads || n.jointLoads || []).forEach((ld) => {
        const lc = ld.loadCase || ld.loadPattern || "CM";
        const comps = [];
        const push = (k, v) => { if (Math.abs(Number(v || 0)) > 1e-9) comps.push(`${k} ${fmt(v)}`); };
        push("FX", ld.fx); push("FY", ld.fy); push("FZ", ld.fz);
        push("MX", ld.mx ?? ld.mxx); push("MY", ld.my ?? ld.myy); push("MZ", ld.mz ?? ld.mzz);
        if (comps.length) {
          lines.push(`  POINTLOAD  "${pp.name}"  "${story}"  TYPE "FORCE"  LC "${lc}"    ${comps.join(" ")}`);
        }
      });
    });
    lines.push("");

    // ---- FRAME OBJECT LOADS ---------------------------------------------
    lines.push("$ FRAME OBJECT LOADS");
    lineAssigns.forEach((a) => {
      const f = a.frame;
      (f.frameLoads || f.lineLoads || []).forEach((ld) => {
        if (String(ld.type) !== "distributed") return;
        const lc = ld.loadCase || ld.loadPattern || "CM";
        const dir = /grav/i.test(ld.direction || "") ? "GRAV" : "GRAV";
        const val = ld.startValueDisp ?? (Number(ld.startValue || 0) / 9806.65);
        lines.push(`  LINELOAD  "${a.name}"  "${a.story}"  TYPE "UNIFF"  DIR "${dir}"  LC "${lc}"  FVAL ${fmt(val)}`);
      });
    });
    lines.push("");

    // ---- SHELL OBJECT LOADS ---------------------------------------------
    lines.push("$ SHELL OBJECT LOADS");
    areaAssigns.forEach((a) => {
      (a.area.areaLoads || a.area.loads || []).forEach((ld) => {
        if (String(ld.type) !== "uniform") return;
        const lc = ld.loadCase || ld.loadPattern || "CM";
        const val = ld.valueDisp ?? (Number(ld.value || 0) / 1000); // kgf/m² → tonf/m²
        lines.push(`  AREALOAD  "${a.name}"  "${a.story}"  TYPE "UNIFF"  DIR "GRAV"  LC "${lc}"  FVAL ${fmt(val)}`);
      });
    });
    lines.push("");

    // ---- ANALYSIS OPTIONS -----------------------------------------------
    lines.push("$ ANALYSIS OPTIONS");
    lines.push('  ACTIVEDOF "UX UY UZ RX RY RZ"  ');
    lines.push('  PDELTA  METHOD "NONE"  ');
    lines.push("");

    // ---- MASS SOURCE ----------------------------------------------------
    if (msLoads.length) {
      lines.push("$ MASS SOURCE");
      lines.push(
        `  MASSSOURCE  "${msName}"    INCLUDEELEMENTS "No"    INCLUDEADDEDMASS "No"    INCLUDELOADS "Yes"    LUMPATSTORIES "Yes"    ISDEFAULT "Yes"  `
      );
      msLoads.forEach((l) => {
        const nm = l.load || l.name;
        let factor = l.multiplier ?? l.factor ?? 1;
        const factorValue = Number.isInteger(factor) ? factor : Math.round(factor * 10) / 10;
        if (nm) lines.push(`  MASSSOURCELOAD  "${msName}"  "${nm}"  ${factorValue}`);
      });
      lines.push("");
    }

    // ---- FASE 3: FUNCTIONS (espectros de respuesta) ---------------------
    // Casos RS utilizables (habilitados y con al menos una dirección con función).
    const rsDirKeys = ["U1", "U2", "UZ", "U3"];
    const rsUsable = (rsCases || []).filter((c) => {
      if (!c || c.enabled === false) return false;
      const sp = c.spectra || {};
      return rsDirKeys.some((d) => sp[d]?.functionId) || c.functionId;
    });

    // Funciones realmente referenciadas por esos casos.
    const usedFuncIds = new Set();
    rsUsable.forEach((c) => {
      const sp = c.spectra || {};
      rsDirKeys.forEach((d) => { if (sp[d]?.functionId) usedFuncIds.add(sp[d].functionId); });
      if (c.functionId) usedFuncIds.add(c.functionId);
    });
    // Mapa functionId → nombre ETABS emitido (para referencias consistentes en ACCEL).
    const funcNameById = {};
    const rsFuncsUsed = (rsFunctions || []).filter(
      (f) => usedFuncIds.has(f.id) || usedFuncIds.has(f.name),
    );
    rsFuncsUsed.forEach((f) => { funcNameById[f.id] = f.name || f.id; });

    if (rsFuncsUsed.length) {
      lines.push("$ FUNCTIONS");
      rsFuncsUsed.forEach((f) => {
        const fname = f.name || f.id;
        const damp = Number(f.damping ?? 0.05);
        lines.push(`  FUNCTION "${fname}"  FUNCTYPE "SPECTRUM"  DAMPRATIO ${fmt(damp)}  SPECTYPE "USER"  `);
        const pts = f.points || [];
        // Pares planos "T  Sa" en chunks de ~8 por línea, como ETABS.
        const flat = pts.map((p) => `${fmt(p.T ?? p.t ?? 0)}  ${fmt(p.Sa ?? p.sa ?? 0)}`);
        for (let i = 0; i < flat.length; i += 8) {
          lines.push(`  FUNCTION "${fname}"  TIMEVAL "${flat.slice(i, i + 8).join("  ")}"  `);
        }
      });
      lines.push("");
    }

    // ---- LOAD CASES (Modal + estáticos + Response Spectrum) -------------
    // Un modelo ETABS válido siempre tiene casos de carga; sin esta sección
    // ETABS considera el archivo incompleto/no válido.
    lines.push("$ LOAD CASES");
    const maxModes = Math.max(3, 3 * Math.max(1, stories.length - 1));
    lines.push('  LOADCASE "Modal"  TYPE  "Modal - Eigen"  INITCOND  "PRESET"  ');
    lines.push(`  LOADCASE "Modal"  MAXMODES  ${maxModes} MINMODES  1 `);
    staticCases.forEach((c) => {
      lines.push(`  LOADCASE "${c.name}"  TYPE  "Linear Static"  INITCOND  "PRESET"  `);
      lines.push(`  LOADCASE "${c.name}"  LOADPAT  "${c.name}"  SF  1 `);
    });

    // Casos Response Spectrum (Fase 3). U1=X, U2=Y, UZ/U3=vertical.
    const rsDirToE2k = { U1: "U1", U2: "U2", UZ: "U3", U3: "U3" };
    rsUsable.forEach((c) => {
      const name = c.name || c.id;
      lines.push(`  LOADCASE "${name}"  TYPE  "Response Spectrum"  MODALCASE  "Modal"  `);
      const sp = c.spectra || {};
      const emitted = new Set();
      rsDirKeys.forEach((srcDir) => {
        const s = sp[srcDir];
        const e2kDir = rsDirToE2k[srcDir];
        if (!s || !s.functionId || emitted.has(e2kDir)) return;
        const fname = funcNameById[s.functionId] || s.functionId;
        const sf = Number(s.scaleFactor ?? c.scaleFactor ?? 1);
        lines.push(`  LOADCASE "${name}"  ACCEL  "${e2kDir}"  FUNC  "${fname}"  SF  ${fmt(sf)} `);
        emitted.add(e2kDir);
      });
      // Fallback: caso plano (functionId/direction sin spectra desglosado).
      if (emitted.size === 0 && c.functionId) {
        const fname = funcNameById[c.functionId] || c.functionId;
        const e2kDir = String(c.direction || "X").toUpperCase() === "Y" ? "U2" : "U1";
        lines.push(`  LOADCASE "${name}"  ACCEL  "${e2kDir}"  FUNC  "${fname}"  SF  ${fmt(Number(c.scaleFactor ?? 1))} `);
      }
      lines.push(`  LOADCASE "${name}"  MODALDAMPTYPE  "Constant"  CONSTDAMP  ${fmt(Number(c.damping ?? 0.05))} `);
      const ecc = Number(c.eccRatio ?? 0);
      if (ecc > 0) lines.push(`  LOADCASE "${name}"  ECCENRATIOTYPICAL  ${fmt(ecc)} `);
    });
    lines.push("");

    // ---- LOAD COMBINATIONS ------------------------------------------------
    // Fuente: `this.loadCombinations.items` DIRECTO, no `data.loadCombinations`
    // (el que arma exportToJSON): ese campo hace
    // `this.loadCombinations?.combinations || this.loadCombinations?.items`,
    // y como `.combinations` es un array (aunque sea el de 3 combos de
    // fábrica) SIEMPRE es truthy en JS — el `||` nunca cae a `.items`, que es
    // la forma ESTRUCTURADA que realmente escribe el modal Define ▸
    // Combinaciones (`{name, combinationType, loadCases:[{name,scale}]}`) o
    // que trae un combo importado de .e2k (`{name, type, terms:[{case,factor}]}`,
    // ver e2k-load-combos.js). El motor de fuerzas internas ya lee `.items`
    // directo por la misma razón (frameForceBackend.js).
    const comboTypeToE2k = (type) => {
      const t = String(type || "ADD").toUpperCase();
      if (t.startsWith("ENVE")) return "Envelope";
      if (t.startsWith("ABS")) return "Absolute Add";
      if (t === "SRSS") return "SRSS";
      return "Linear Add";
    };
    // Acepta las dos formas: `terms:[{case,factor}]` (import/e2k-load-combos.js)
    // o `loadCases:[{name,scale}]` (modal Define ▸ Combinaciones).
    const normalizeComboTerms = (combo) => {
      const src = Array.isArray(combo.terms) && combo.terms.length
        ? combo.terms.map((t) => ({ case: t.case ?? t.name, factor: t.factor ?? t.scale ?? t.sf }))
        : Array.isArray(combo.loadCases)
          ? combo.loadCases.map((t) => ({ case: t.name ?? t.case, factor: t.scale ?? t.factor ?? t.sf }))
          : [];
      return src
        .map((t) => ({ case: String(t.case || "").trim(), factor: Number(t.factor) }))
        .filter((t) => t.case && Number.isFinite(t.factor) && Math.abs(t.factor) > 1e-9);
    };

    // Nombres de LOADCASE realmente escritos en el .e2k (Modal + estáticos +
    // RS). Filtra referencias muertas: los combos de FÁBRICA del modal (los
    // que salen si el usuario nunca tocó Define ▸ Combinaciones) apuntan a
    // "DEAD Static Load"/"LIVE Static Load", que no son patrones reales de
    // este modelo — sin este filtro, ETABS rechazaría el combo al importar.
    const validCaseNames = new Set([
      "Modal",
      ...staticCases.map((c) => c.name),
      ...rsUsable.map((c) => c.name || c.id),
    ]);

    const rawCombos = this.loadCombinations?.items || [];
    const comboLines = [];
    rawCombos.forEach((combo) => {
      const name = String(combo.name || combo.id || "").trim();
      if (!name) return;
      const terms = normalizeComboTerms(combo).filter((t) => validCaseNames.has(t.case));
      if (!terms.length) return;

      comboLines.push(`  COMBO "${name}"  TYPE "${comboTypeToE2k(combo.type || combo.combinationType)}"  `);
      if (combo.design || combo.comboType) {
        comboLines.push(`  COMBO "${name}"  DESIGN "${combo.design || "Concrete"}"  COMBOTYPE "${combo.comboType || "Strength"}"  `);
      }
      terms.forEach((t) => {
        comboLines.push(`  COMBO "${name}"  LOADCASE "${t.case}"  SF ${fmt(t.factor)} `);
      });
    });
    if (comboLines.length) {
      lines.push("$ LOAD COMBINATIONS");
      lines.push(...comboLines);
      lines.push("");
    }

    // ---- PROJECT INFORMATION --------------------------------------------
    lines.push("$ PROJECT INFORMATION");
    lines.push(`  PROJECTINFO    MODELNAME "${this.getExportBaseName()}"  `);
    lines.push("");

    // ---- LOG ------------------------------------------------------------
    // ETABS valida la versión del archivo por la firma del LOG; incluir la
    // cadena "ETABS Ultimate  22.7.0 ..." es clave para que lo acepte.
    lines.push("$ LOG");
    lines.push("  STARTCOMMENTS  ");
    lines.push("");
    lines.push(`ETABS Ultimate  22.7.0 File saved as ${this.getExportBaseName()}.EDB at ${_stamp}`);
    lines.push("  ENDCOMMENTS  ");
    lines.push("");
    lines.push("  END");

    lines.push("$ END OF MODEL FILE");

    // ETABS requiere finales de línea Windows (CRLF); si no, rechaza el archivo.
    return lines.join("\r\n") + "\r\n";
  },

  exportETABS_E2K() {
    try {
      const content = this.buildETABS_E2KText();
      const filename = `${this.getExportBaseName()}.e2k`;

      this.downloadTextFile(content, filename, "text/plain");

      this.showMessage?.(`📤 Exportación .e2k (ETABS) generada: ${filename}`);
      console.log("📤 Export ETABS E2K:", {
        filename,
        nodes: this.nodes?.length || 0,
        frames: this.shapes?.length || 0,
        areas: this.areas?.length || 0,
      });
    } catch (error) {
      console.error("❌ Error exportando E2K:", error);
      this.showMessage?.("❌ Error al exportar E2K.", "error");
    }
  },

  exportSAFE_V8() {
    this.showMessage?.("📤 Exportar SAFE V8 .f2k - pendiente. Primero dejamos estable E2K.");
    console.warn("Export SAFE V8 pendiente.");
  },

  exportSAFE_V12() {
    this.showMessage?.("📤 Exportar SAFE V12 .f2k - pendiente. Primero dejamos estable E2K.");
    console.warn("Export SAFE V12 pendiente.");
  },

  exportETABS_EDB() {
    this.showMessage?.("📤 Exportar ETABS .edb - no disponible en navegador. Requiere formato binario propietario.");
    console.warn("Export ETABS EDB no implementado: formato binario propietario.");
  },

  exportProSteelMDB() {
    this.showMessage?.("📤 Exportar ProSteel .mdb - pendiente. Requiere estructura de base Access/MDB.");
    console.warn("Export ProSteel MDB pendiente.");
  },
};
