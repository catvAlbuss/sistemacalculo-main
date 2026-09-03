// resources/js/cad/mixins/analysis/wallSectionDesigner.js
//
// Placas dibujadas en el Section Designer de ETABS: lista las secciones, las
// dibuja con su armado real, deja EDITAR sus propiedades y pide al motor la
// superficie de interacción en el formato de la tabla "Curve Data".
//
// DE DÓNDE SALEN LAS SECCIONES
//   Del `.e2k`, bloque `$ SECTION DESIGNER SECTIONS`. El importador guarda las
//   shapes crudas (concreto + armado) en `frameSection.sdShapes` y el catálogo
//   de varillas en `this.rebarDefinitions` — ver io/file-io/e2kSdSection.js.
//
// CÓMO SE EDITA
//   Sobre un BORRADOR: `wallDesignState.shapes` arranca como copia de las del
//   modelo y todo lo que se toca se aplica ahí. El modelo no se pisa y
//   "Restaurar" vuelve al original — igual que ETABS, que no cambia nada hasta
//   que das OK.
//
//   El motor devuelve, por varilla y por pieza, el ÍNDICE de la shape que la
//   generó (`bar.shape`), así que un clic en el dibujo se mapea de vuelta al
//   objeto que la definió.
//
// CÓDIGO DE DISEÑO
//   Cambia φ y con eso TODA la tabla: E.060 usa 0.70 en compresión y ACI 318
//   0.65, o sea 7.7% de diferencia directa (0.70/0.65 = 1.0769). El `.e2k` del
//   MODULO 01 declara `WALLPREFERENCE CODE "ACI 318-14"`, así que para comparar
//   contra la tabla de ETABS hay que elegir ACI; para diseñar en Perú, E.060.
//   Por eso el selector está a la vista y no escondido en una preferencia.
//
// VALIDACIÓN
//   Con la `PL1` del MODULO 01 en ACI: los 264 puntos de las 24 curvas contra la
//   tabla real, error medio 0.0126 tonf·m. Ver project-wall-design-module.

import { geometriaDeSeccion } from "../../lib/wallSectionGeometry.js";
import { crearEditorDeSeccion } from "../../lib/wallSectionCanvas.js";
import { filasDePier, piersDe, pisosDe, filtrar, aDemandas, aTexto, numerarEstiloEtabs }
  from "../../lib/pierForcesTable.js";

const KGCM2_A_PA = 98066.5;
const TONF = 9806.65; // N
const M2_A_CM2 = 1e4;

/** Malla del cálculo: fina al mostrar, más gruesa mientras se edita. */
const MALLA_FINA = 160;
const MALLA_EDICION = 100;

/**
 * Campos editables por tipo de shape, con los nombres del diálogo de ETABS.
 * `n` = número, `b` = casilla. El orden es el que muestra ETABS.
 */
const N = (clave, etiqueta) => ({ clave, etiqueta, tipo: "n" });
const B = (clave, etiqueta) => ({ clave, etiqueta, tipo: "b" });

const GEOM_LT = [N("D", "Height (D)"), N("B", "Width (B)"),
                 N("TF", "Flange Thick (TF)"), N("TW", "Web Thick (TW)")];
const UBIC = [N("XC", "X Center"), N("YC", "Y Center")];

const CAMPOS_POR_TIPO = {
  // La L tiene los dos espejos; la T solo el 3 (sobre el otro eje ya es simétrica).
  "CONC L": [...UBIC, N("rotation", "Rotation (deg)"), ...GEOM_LT,
             B("mirror2", "Mirror about 2"), B("mirror3", "Mirror about 3")],
  "CONC T": [...UBIC, N("rotation", "Rotation (deg)"), ...GEOM_LT, B("mirror3", "Mirror about 3")],
  "CONC TEE": [...UBIC, N("rotation", "Rotation (deg)"), ...GEOM_LT, B("mirror3", "Mirror about 3")],
  "CONC RECTANGULAR": [...UBIC, N("rotation", "Rotation (deg)"), N("D", "Height (D)"), N("B", "Width (B)")],
  "CONC RECTANGLE": [...UBIC, N("rotation", "Rotation (deg)"), N("D", "Height (D)"), N("B", "Width (B)")],
  "CONC CIRCLE": [...UBIC, N("diameter", "Diameter (m)")],
  REBAR: [N("XC", "X"), N("YC", "Y")],
  "LINE REBAR": [N("X1", "X1"), N("Y1", "Y1"), N("X2", "X2"), N("Y2", "Y2"),
                 N("SPACING", "Max Bar Spacing")],
  "RECT REBAR": [...UBIC, N("D", "Height (D)"), N("B", "Width (B)")],
  "CIRCLE REBAR": [...UBIC, N("rotation", "Rotation (deg)"), N("diameter", "Diameter (m)"),
                   N("numBars", "Number of Bars")],
  POLYGON: [], // los vértices se mueven en el lienzo
};

export const wallSectionDesignerMixin = {
  /** Estado del modal (lo lee wall-design-modal.blade.php). */
  wallDesignState: null,

  /** Secciones de placa disponibles: las SD del .e2k que traen armado. */
  getWallSections() {
    const secciones = this.frameSections?.sections || this.frameSections || [];
    return (Array.isArray(secciones) ? secciones : Object.values(secciones))
      .filter((s) => s && Array.isArray(s.sdShapes) && s.sdShapes.length)
      .map((s) => ({
        name: s.name,
        material: s.material,
        shapes: s.sdShapes.filter(Boolean),
        angle: s.sdAngle || 0,
        diseñable: !!s.sdDiseñable,
        resumen: resumenDeShapes(s.sdShapes),
      }));
  },

  /** Abre el editor de placas. `nombre` opcional: preselecciona esa sección. */
  openWallSectionDesigner(nombre = null) {
    const secciones = this.getWallSections();
    if (!secciones.length) {
      this.showMessage?.(
        "No hay secciones de Section Designer en el modelo. Importá un .e2k que las tenga.",
        "warning",
      );
      return;
    }
    this.wallDesignState = {
      secciones,
      seleccionada: nombre || secciones[0].name,
      shapes: [],        // borrador editable
      seleccion: [],     // índices de las shapes seleccionadas
      demandas: [],      // {nombre, P, M2, M3} en tonf y tonf·m
      demandasTexto: "",
      // Las tablas de ETABS traen TRACCIÓN positiva; la superficie, compresión
      // positiva. Por defecto se invierte P, que es lo que hace falta al pegar
      // Pier Forces.
      compresionNegativa: true,
      demandasIgnoradas: [],
      // Tabla de Pier Forces calculada por el motor (la alternativa a pegar a
      // mano). El filtro arranca en "solo combinaciones" a propósito: es contra
      // los combos que se diseña, no contra los casos sueltos.
      pierAbierto: false,
      pierFiltro: { pier: null, story: "__todos__", location: "Bottom", soloCombos: true },
      historial: [],     // para deshacer
      futuro: [],        // para rehacer
      modo: "con_phi",
      curva: 0,
      code: "ACI318",    // ACI para comparar contra ETABS; E060 para diseñar acá
      cargando: false,
      pendiente: false,     // hay cambios sin recalcular
      error: null,
      resultado: null,
      editado: false,
      snap: true,           // snap a vértices y grilla
      modoCanvas: "seleccionar",
      coords: null,         // lectura viva de la posición del cursor
    };
    this.cargarShapesDePlaca();
    window.dispatchEvent(new CustomEvent("open-wall-design-modal"));
    this.calcularSuperficieDePlaca();
  },

  /** Copia las shapes de la sección elegida al borrador. */
  cargarShapesDePlaca() {
    const st = this.wallDesignState;
    const sec = st?.secciones.find((s) => s.name === st.seleccionada);
    if (!sec) return;
    st.shapes = JSON.parse(JSON.stringify(sec.shapes));
    this.deducirEspejoDePlaca();
    st.seleccion = [];
    st.historial = [];
    st.futuro = [];
    st.editado = false;
  },

  /**
   * Fija el espejo de la L/T UNA sola vez, al cargar.
   *
   * El `.e2k` no exporta MIRROR2/MIRROR3 de una SDSECTION, así que hay que
   * deducirlo con la nube de varillas. Pero si se deduce en cada redibujo, la
   * forma se da vuelta sola al arrastrarla: apenas la pieza se aleja del armado,
   * otra orientación pasa a contener más varillas y gana. En ETABS la figura no
   * cambia de orientación por moverla, esté en el cuadrante que esté. Entonces
   * se deduce con la sección tal como vino y se escribe en la shape.
   */
  deducirEspejoDePlaca() {
    const st = this.wallDesignState;
    if (!st?.shapes?.length) return;
    const i = st.shapes.findIndex((s) =>
      ["CONC L", "CONC T", "CONC TEE"].includes(String(s?.shapeType || "").toUpperCase()));
    if (i < 0 || st.shapes[i].mirror2 !== undefined) return;
    const sinEspejo = st.shapes.map((s, k) => (k === i ? { ...s, mirror2: undefined } : s));
    const geo = geometriaDeSeccion(sinEspejo, this.getRebarCatalogForWalls());
    st.shapes[i].mirror2 = geo.mirror2;
    st.shapes[i].mirror3 = geo.mirror3;
  },

  /** Vuelve a las shapes originales del modelo. */
  resetWallShapes() {
    this.cargarShapesDePlaca();
    return this.calcularSuperficieDePlaca();
  },

  /** Pide la superficie al motor para el borrador actual. */
  async calcularSuperficieDePlaca(malla = MALLA_FINA) {
    const st = this.wallDesignState;
    if (!st) return;
    const sec = st.secciones.find((s) => s.name === st.seleccionada);
    if (!sec || !st.shapes.length) return;

    st.cargando = true;
    st.error = null;
    try {
      const resp = await fetch("/api/backend/wall-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shapes: st.shapes,
          rebarCatalog: this.getRebarCatalogForWalls(),
          fc: this.getWallFcPa(sec.material),
          fy: this.getWallFyPa(),
          code: st.code,
          tied: true,
          mesh: malla,
          modes: ["con_phi", "sin_phi"],
          // El motor arma la superficie triangulada UNA vez y corta un rayo por
          // demanda. Si no hay demandas ni la arma (cuesta unos segundos).
          demands: st.demandas.map((d) => ({
            name: d.nombre, P: d.P * TONF, M2: d.M2 * TONF, M3: d.M3 * TONF,
          })),
        }),
      });
      const data = await resp.json();
      if (!data.success) {
        // Los avisos traen el POR QUÉ (ej. "falta el catálogo para #4, #5"),
        // que es lo accionable; el error solo dice qué no se pudo hacer.
        throw new Error([data.error, ...(data.avisos || [])].filter(Boolean).join(" "));
      }
      st.resultado = data;
      st.pendiente = false;
      this.refrescarCanvasDePlaca();
      if (data.section.avisos?.length) st.error = data.section.avisos.join(" · ");
    } catch (e) {
      st.error = e.message || String(e);
      st.resultado = null;
    } finally {
      st.cargando = false;
    }
  },

  // ── Edición ───────────────────────────────────────────────────────────────

  /** Selecciona la shape `i` (clic en el dibujo o en la lista). */
  seleccionarShapeDePlaca(i, aditivo = false) {
    const st = this.wallDesignState;
    if (!st) return;
    if (i === null || i === undefined) { st.seleccion = []; }
    else if (aditivo) {
      // Ctrl/Shift: suma o saca de la selección.
      st.seleccion = st.seleccion.includes(i)
        ? st.seleccion.filter((k) => k !== i)
        : [...st.seleccion, i];
    } else {
      // Desde la lista, volver a tocar el mismo deselecciona.
      st.seleccion = (st.seleccion.length === 1 && st.seleccion[0] === i) ? [] : [i];
    }
    this.refrescarCanvasDePlaca();
  },

  /** Selección por ventana: reemplaza, o suma si venía con Ctrl/Shift. */
  seleccionarVariasShapesDePlaca(indices, aditivo = false) {
    const st = this.wallDesignState;
    if (!st) return;
    const nuevos = indices || [];
    st.seleccion = aditivo ? [...new Set([...st.seleccion, ...nuevos])] : nuevos;
    this.refrescarCanvasDePlaca();
  },

  /** Los campos editables de la shape seleccionada, ya con su valor. */
  getWallShapeFields() {
    const st = this.wallDesignState;
    const sh = st?.shapes?.[st?.seleccion?.length === 1 ? st.seleccion[0] : -1];
    if (!sh) return [];
    return (CAMPOS_POR_TIPO[sh.shapeType] || []).map((c) => ({
      ...c,
      valor: c.tipo === "b" ? !!sh[c.clave] : (sh[c.clave] ?? 0),
    }));
  },

  /** La shape seleccionada, para la cabecera del panel.
   *
   *  `numBars` y `actualSpacing` son DERIVADOS, igual que en el dialogo de
   *  ETABS: el dato que se guarda es el espaciamiento MAXIMO, y la cantidad
   *  sale de ceil(largo/espaciamiento). Se muestran de solo lectura porque su
   *  ausencia confunde — al alargar una linea 1 cm puede aparecer una varilla
   *  mas, y sin ver el conteo parece que el editor la invento. */
  getWallSelectedShape() {
    const st = this.wallDesignState;
    // El panel de propiedades solo tiene sentido con UNA shape: con varias no
    // se sabe qué valor mostrar. Con varias se puede mover y borrar, no editar.
    const i = st?.seleccion?.length === 1 ? st.seleccion[0] : null;
    if (i === null) return null;
    const sh = st.shapes[i];
    if (!sh) return null;

    const generadas = (st.resultado?.section?.bars || []).filter((b) => b.shape === i).length;
    let actualSpacing = null;
    if (sh.shapeType === "LINE REBAR" && generadas > 0) {
      const largo = Math.hypot((sh.X2 ?? 0) - (sh.X1 ?? 0), (sh.Y2 ?? 0) - (sh.Y1 ?? 0));
      const intervalos = String(sh.endBar || "NO").toUpperCase() === "YES"
        ? Math.max(1, generadas - 1)
        : generadas + 1;
      if (largo > 0) actualSpacing = largo / intervalos;
    }
    return {
      i,
      tipo: sh.shapeType,
      esArmado: String(sh.shapeType).includes("REBAR"),
      barSize: sh.barSize || "",
      endBar: String(sh.endBar || "NO").toUpperCase(),
      numBars: generadas,
      actualSpacing,
    };
  },

  /** Tamaños de varilla del catálogo, para el select. */
  getWallBarSizes() {
    return Object.keys(this.getRebarCatalogForWalls());
  },

  /** Cambia un campo NUMÉRICO del borrador y recalcula. */
  async setWallShapeField(clave, valor) {
    const st = this.wallDesignState;
    const sh = st?.shapes?.[st?.seleccion?.length === 1 ? st.seleccion[0] : -1];
    if (!sh) return;
    const num = parseFloat(valor);
    if (!Number.isFinite(num)) return;
    this._anotarEnHistorial();
    sh[clave] = num;
    st.editado = true;
    st.pendiente = true;
    this.refrescarCanvasDePlaca();
  },

  /** Cambia una CASILLA del borrador (los espejos). */
  setWallShapeBool(clave, valor) {
    const st = this.wallDesignState;
    const sh = st?.shapes?.[st?.seleccion?.length === 1 ? st.seleccion[0] : -1];
    if (!sh) return;
    this._anotarEnHistorial();
    sh[clave] = !!valor;
    st.editado = true;
    st.pendiente = true;
    this.refrescarCanvasDePlaca();
  },

  /** Cambia el tamaño de varilla o el ENDBAR del borrador y recalcula. */
  async setWallShapeBar(clave, valor) {
    const st = this.wallDesignState;
    const sh = st?.shapes?.[st?.seleccion?.length === 1 ? st.seleccion[0] : -1];
    if (!sh) return;
    this._anotarEnHistorial();
    sh[clave] = valor;
    st.editado = true;
    st.pendiente = true;
    this.refrescarCanvasDePlaca();
  },

  // ── Canvas interactivo ───────────────────────────────────────────────────

  /**
   * Monta el editor sobre el <canvas> del modal. Lo llama el modal cuando abre.
   *
   * El dibujo sale de la geometría JS (lib/wallSectionGeometry.js), no del
   * motor: arrastrar exige redibujar a 60 fps y no se puede ir al servidor en
   * cada movimiento. Al SOLTAR se recalcula en el motor, que es el que manda
   * para los números.
   */
  montarCanvasDePlaca(elemento) {
    if (!elemento) return;
    this._editorPlaca?.destruir?.();
    this._editorPlaca = crearEditorDeSeccion(elemento, {
      onSeleccionar: (i, aditivo) => this.seleccionarShapeDePlaca(i, aditivo),
      onSeleccionarVarios: (ix, aditivo) => this.seleccionarVariasShapesDePlaca(ix, aditivo),
      onArrastrar: (i, target, pos, delta) => this.aplicarArrastreDePlaca(i, target, pos, delta),
      onSoltar: () => {
        if (!this.wallDesignState) return;
        this.wallDesignState.pendiente = true;
        this.wallDesignState._arrastrando = false;   // cierra el grupo del historial
      },
      onColocar: (pos) => this.colocarVarillaDePlaca(pos),
      onPolilinea: (pts) => this.cerrarPolilineaDePlaca(pts),
      onCoordenadas: (c) => { if (this.wallDesignState) this.wallDesignState.coords = c; },
    });
    this._editorPlaca.setSnap(this.wallDesignState?.snap !== false);
    this.refrescarCanvasDePlaca(true);
  },

  /** Rehace la geometría del borrador y la manda al canvas. */
  refrescarCanvasDePlaca(encuadrar = false) {
    const st = this.wallDesignState;
    if (!this._editorPlaca || !st) return;
    const geo = geometriaDeSeccion(st.shapes, this.getRebarCatalogForWalls());
    this._editorPlaca.actualizar(geo, st.shapes, st.seleccion, encuadrar);
  },

  desmontarCanvasDePlaca() {
    this._editorPlaca?.destruir?.();
    this._editorPlaca = null;
  },

  /** Corre una shape entera por (dX, dY). */
  _moverShape(sh, delta) {
    if (!sh) return;
    const tipo = String(sh.shapeType || "").toUpperCase();
    if (tipo === "POLYGON") {
      (sh.corners || []).forEach((c) => {
        c.X = Number(c.X ?? c.x ?? 0) + delta.dX;
        c.Y = Number(c.Y ?? c.y ?? 0) + delta.dY;
      });
      return;
    }
    sh.XC = Number(sh.XC || 0) + delta.dX;
    sh.YC = Number(sh.YC || 0) + delta.dY;
    if (tipo === "LINE REBAR") {
      sh.X1 = Number(sh.X1 || 0) + delta.dX; sh.Y1 = Number(sh.Y1 || 0) + delta.dY;
      sh.X2 = Number(sh.X2 || 0) + delta.dX; sh.Y2 = Number(sh.Y2 || 0) + delta.dY;
    }
  },

  // ── Deshacer / rehacer ───────────────────────────────────────────────────
  // Instantáneas del borrador completo. Una sección son decenas de shapes
  // chicas: clonarlas cuesta nada al lado de lo que cuesta razonar un historial
  // de operaciones inversas, y esto no se puede equivocar.

  _anotarEnHistorial() {
    const st = this.wallDesignState;
    if (!st) return;
    st.historial = [...(st.historial || []), JSON.stringify(st.shapes)].slice(-50);
    st.futuro = [];   // una acción nueva corta la rama de rehacer
  },

  deshacerPlaca() {
    const st = this.wallDesignState;
    if (!st?.historial?.length) return false;
    st.futuro = [JSON.stringify(st.shapes), ...(st.futuro || [])];
    st.shapes = JSON.parse(st.historial.pop());
    st.seleccion = [];
    st.editado = true;
    st.pendiente = true;
    this.refrescarCanvasDePlaca();
    return true;
  },

  rehacerPlaca() {
    const st = this.wallDesignState;
    if (!st?.futuro?.length) return false;
    st.historial = [...(st.historial || []), JSON.stringify(st.shapes)];
    st.shapes = JSON.parse(st.futuro.shift());
    st.seleccion = [];
    st.editado = true;
    st.pendiente = true;
    this.refrescarCanvasDePlaca();
    return true;
  },

  puedeDeshacerPlaca() { return !!this.wallDesignState?.historial?.length; },
  puedeRehacerPlaca() { return !!this.wallDesignState?.futuro?.length; },

  /** Aplica un arrastre al borrador. `target` es "p1", "p2" o "shape". */
  aplicarArrastreDePlaca(i, target, pos, delta) {
    const st = this.wallDesignState;
    const sh = st?.shapes?.[i];
    if (!sh) return;
    if (!st._arrastrando) { this._anotarEnHistorial(); st._arrastrando = true; }

    // Arrastrar un objeto de un grupo mueve el grupo entero. Los extremos de
    // una línea son la excepción: ahí se está estirando ESA línea.
    if (target === "shape" && st.seleccion.length > 1 && st.seleccion.includes(i)) {
      for (const k of st.seleccion) this._moverShape(st.shapes[k], delta);
      st.editado = true;
      st.pendiente = true;
      this.refrescarCanvasDePlaca();
      return;
    }
    const tipo = String(sh.shapeType || "").toUpperCase();

    if (target === "p1") { sh.X1 = pos.X; sh.Y1 = pos.Y; }
    else if (target === "p2") { sh.X2 = pos.X; sh.Y2 = pos.Y; }
    else if (tipo === "REBAR") { sh.XC = pos.X; sh.YC = pos.Y; }
    else if (tipo === "POLYGON") {
      // Un polígono no tiene centro: se corren todos sus vértices.
      (sh.corners || []).forEach((c) => {
        c.X = Number(c.X ?? c.x ?? 0) + delta.dX;
        c.Y = Number(c.Y ?? c.y ?? 0) + delta.dY;
      });
    } else {
      sh.XC = Number(sh.XC || 0) + delta.dX;
      sh.YC = Number(sh.YC || 0) + delta.dY;
      if (tipo === "LINE REBAR") {
        sh.X1 = Number(sh.X1 || 0) + delta.dX; sh.Y1 = Number(sh.Y1 || 0) + delta.dY;
        sh.X2 = Number(sh.X2 || 0) + delta.dX; sh.Y2 = Number(sh.Y2 || 0) + delta.dY;
      }
    }
    st.editado = true;
    this.refrescarCanvasDePlaca();
  },

  /** Modo "colocar": cada clic deja una varilla nueva en el punto ajustado. */
  async colocarVarillaDePlaca(pos) {
    const st = this.wallDesignState;
    if (!st) return;
    this._anotarEnHistorial();
    st.shapes.push({
      shapeType: "REBAR",
      barSize: this.getWallBarSizes()[0] || null,
      XC: pos.X, YC: pos.Y,
    });
    st.seleccion = st.shapes.length - 1;
    st.editado = true;
    st.pendiente = true;
    this.refrescarCanvasDePlaca();
  },

  /** Prende/apaga el snap. */
  alternarSnapDePlaca() {
    const st = this.wallDesignState;
    if (!st) return;
    st.snap = !st.snap;
    this._editorPlaca?.setSnap(st.snap);
  },

  /** Cambia entre seleccionar y colocar varillas. */
  setModoCanvasDePlaca(m) {
    const st = this.wallDesignState;
    if (!st) return;
    st.modoCanvas = m;
    this._editorPlaca?.setModo(m);
  },

  /** Encuadra la sección en el canvas. */
  encuadrarCanvasDePlaca() { this._editorPlaca?.ajustar(); },

  // ── Agregar y borrar objetos ─────────────────────────────────────────────

  /** Tipos que se pueden agregar, para la barra de herramientas. */
  getWallShapeTypes() {
    return [
      { tipo: "CONC RECTANGULAR", etiqueta: "Rectángulo" },
      { tipo: "CONC L", etiqueta: "L" },
      { tipo: "CONC T", etiqueta: "T" },
      { tipo: "CONC CIRCLE", etiqueta: "Círculo" },
      { tipo: "REBAR", etiqueta: "Varilla" },
      { tipo: "LINE REBAR", etiqueta: "Línea" },
      { tipo: "RECT REBAR", etiqueta: "Jaula" },
      { tipo: "CIRCLE REBAR", etiqueta: "Varillas en círculo" },
    ];
  },

  /**
   * Agrega una shape del tipo pedido y la deja seleccionada.
   *
   * Nace en el CENTROIDE de la sección y con medidas chicas a propósito: la
   * idea no es acertarle de una al dibujar, sino tener el objeto y después
   * tipearle las coordenadas exactas en el panel — que es como se trabaja en
   * ETABS con una placa, donde las varillas van en posiciones calculadas, no
   * "a ojo".
   */
  async agregarShapeDePlaca(tipo) {
    const st = this.wallDesignState;
    if (!st) return;
    const c = st.resultado?.section?.centroid || { u: 0, v: 0 };
    const X = c.v, Y = c.u;               // el centroide, de vuelta en ejes SD
    const barra = this.getWallBarSizes()[0] || null;

    const plantillas = {
      REBAR: { shapeType: "REBAR", barSize: barra, XC: X, YC: Y },
      "LINE REBAR": {
        shapeType: "LINE REBAR", barSize: barra, SPACING: 0.15, endBar: "NO",
        X1: X - 0.15, Y1: Y, X2: X + 0.15, Y2: Y,
      },
      "RECT REBAR": {
        shapeType: "RECT REBAR", D: 0.3, B: 0.2, XC: X, YC: Y,
        edges: Array.from({ length: 4 }, () => ({ size: barra, spacing: 0.15 })),
        corners: Array.from({ length: 4 }, () => ({ size: barra })),
      },
      "CONC RECTANGULAR": { shapeType: "CONC RECTANGULAR", D: 0.5, B: 0.3, XC: X, YC: Y, rotation: 0 },
      "CONC CIRCLE": { shapeType: "CONC CIRCLE", diameter: 0.6, XC: X, YC: Y },
      // Nace sobre el círculo que esté seleccionado, si hay uno: es como se usa
      // en ETABS (se elige el círculo y se le reparten las varillas alrededor).
      "CIRCLE REBAR": (() => {
        const c = this._circuloDeReferencia();
        return {
          shapeType: "CIRCLE REBAR", barSize: barra, numBars: 8, rotation: 0,
          diameter: c ? Number(c.diameter) : 0.6,
          XC: c ? Number(c.XC) : X, YC: c ? Number(c.YC) : Y,
        };
      })(),
      // Espejo explícito desde que nace: si queda sin definir, lo deduce la nube
      // de varillas y la forma se da vuelta sola al moverla.
      "CONC L": { shapeType: "CONC L", D: 0.8, B: 0.6, TF: 0.25, TW: 0.25, XC: X, YC: Y,
                  rotation: 0, mirror2: false, mirror3: false },
      "CONC T": { shapeType: "CONC T", D: 0.8, B: 0.6, TF: 0.25, TW: 0.25, XC: X, YC: Y,
                  rotation: 0, mirror3: false },
    };
    const plantilla = plantillas[tipo];
    if (!plantilla) return;

    this._anotarEnHistorial();
    st.shapes.push(JSON.parse(JSON.stringify(plantilla)));
    st.seleccion = st.shapes.length - 1;
    st.editado = true;
    st.pendiente = true;
    this.refrescarCanvasDePlaca();
  },

  /** El círculo seleccionado (o el último que haya), para las varillas en círculo. */
  _circuloDeReferencia() {
    const st = this.wallDesignState;
    const es = (s) => ["CONC CIRCLE", "CIRCLE", "CONC CIRCULAR"]
      .includes(String(s?.shapeType || "").toUpperCase());
    const sel = st?.shapes?.[st?.seleccion];
    if (es(sel)) return sel;
    return (st?.shapes || []).filter(es).pop() || null;
  },

  /** Cierra una polilínea dibujada en el lienzo como pieza de concreto. */
  cerrarPolilineaDePlaca(pts) {
    const st = this.wallDesignState;
    if (!st || !pts || pts.length < 3) return;
    this._anotarEnHistorial();
    st.shapes.push({
      shapeType: "POLYGON",
      corners: pts.map((p) => ({ X: p.X, Y: p.Y })),
    });
    st.seleccion = st.shapes.length - 1;
    st.editado = true;
    st.pendiente = true;
    this.setModoCanvasDePlaca("seleccionar");
    this.refrescarCanvasDePlaca();
  },

  /** Duplica la shape seleccionada, corrida para que no quede encima. */
  async duplicarShapeDePlaca() {
    const st = this.wallDesignState;
    const sh = st?.shapes?.[st?.seleccion?.length === 1 ? st.seleccion[0] : -1];
    if (!sh) return;
    this._anotarEnHistorial();
    const copia = JSON.parse(JSON.stringify(sh));
    const paso = 0.05;
    for (const clave of ["XC", "X1", "X2"]) {
      if (typeof copia[clave] === "number") copia[clave] += paso;
    }
    st.shapes.push(copia);
    st.seleccion = st.shapes.length - 1;
    st.editado = true;
    st.pendiente = true;
    this.refrescarCanvasDePlaca();
  },

  /** Borra TODAS las shapes seleccionadas (botón Eliminar o tecla Supr). */
  eliminarShapeDePlaca() {
    const st = this.wallDesignState;
    if (!st?.seleccion?.length) return;
    this._anotarEnHistorial();
    // De mayor a menor, para que borrar no corra los índices que faltan.
    for (const i of [...st.seleccion].sort((a, b) => b - a)) st.shapes.splice(i, 1);
    st.seleccion = [];
    st.editado = true;
    st.pendiente = true;
    this.refrescarCanvasDePlaca();
  },

  // ── Demandas y ratio D/C ─────────────────────────────────────────────────

  /**
   * Lee las demandas pegadas. Entiende los dos formatos que se usan de verdad:
   *
   *   a) La tabla **Pier Forces** de ETABS, tal cual se copia:
   *        Story1  P1  01 1.4CM+1.7CV  Combination  Bottom  -92.5267  2.2526
   *        -0.8646  -0.8684  -8.5097  25.0923
   *      Los seis últimos números son P, V2, V3, T, M2, M3 EN ESE ORDEN.
   *
   *   b) Tres números sueltos por fila: P, M2, M3.
   *
   * DOS TRAMPAS, las dos silenciosas:
   *
   *   1. Los tres ÚLTIMOS números de una fila de Pier Forces son T, M2, M3 —
   *      no P, M2, M3. Tomar los tres últimos mete la TORSIÓN como carga axial.
   *
   *   2. ETABS reporta las fuerzas con TRACCIÓN POSITIVA: una placa comprimida
   *      sale con P negativo. La superficie de interacción es al revés
   *      (compresión positiva, lo dice la propia ventana de ETABS). Sin
   *      invertir, cada demanda se verifica contra el lado de TRACCIÓN de la
   *      superficie y el ratio no significa nada. Por eso `compresionNegativa`
   *      viene prendido: es lo que sale de ETABS.
   *
   * Todo en tonf y tonf·m; la conversión a SI la hace el payload.
   */
  parsearDemandasDePlaca(texto) {
    const st = this.wallDesignState;
    if (!st) return 0;
    st.demandasTexto = texto || "";
    const invertir = st.compresionNegativa !== false;
    const filas = [];
    const avisos = [];

    for (const linea of String(texto || "").split(/\r?\n/)) {
      const partes = linea.trim().split(/[\t;]+|\s{1,}/).filter(Boolean);
      if (partes.length < 3) continue;

      // Números del final hacia atrás, hasta toparse con texto.
      const cola = [];
      for (let i = partes.length - 1; i >= 0; i--) {
        const n = parseFloat(String(partes[i]).replace(",", "."));
        if (!Number.isFinite(n) || !/^[-+]?[\d.,]+([eE][-+]?\d+)?$/.test(partes[i])) break;
        cola.unshift(n);
      }

      let P, M2, M3;
      if (cola.length >= 6) {
        const [p6, , , , m2, m3] = cola.slice(-6);   // P V2 V3 T M2 M3
        P = p6; M2 = m2; M3 = m3;
      } else if (cola.length === 3) {
        [P, M2, M3] = cola;
      } else {
        if (cola.length) avisos.push(linea.trim().slice(0, 40));
        continue;
      }

      const nombre = partes.slice(0, partes.length - cola.length).join(" ").trim()
        || `Combo ${filas.length + 1}`;
      filas.push({ nombre, P: invertir ? -P : P, M2, M3 });
    }

    st.demandas = filas;
    st.demandasIgnoradas = avisos;
    st.pendiente = true;
    return filas.length;
  },

  // ── Pier Forces calculadas por el motor ──────────────────────────────────
  //
  // La alternativa a pegar la tabla a mano: el análisis sísmico ya devuelve
  // `pier_forces` (una fila por pier, piso, Top/Bottom y caso, más los combos
  // de E.060), así que acá solo hay que filtrar y pasarlo a demandas. Ver
  // python-backend/seismic/pier_forces.py.
  //
  // POR QUÉ NO SE PIDE APARTE: la tabla sale del MISMO análisis que ya corrió;
  // pedirla por separado obligaría a rehacer el modal y el RSA entero.

  /**
   * Filas de pier de TODOS los casos espectrales, no solo del activo.
   *
   * Cada Response Spectrum Case se corre por separado y devuelve su propia
   * tabla: la del caso SDX trae las filas de SDX y sus combos, la del SDY las
   * suyas. Quedarse con uno solo dejaba fuera la mitad de las combinaciones —
   * y como los casos gravitatorios salen repetidos en todos, hay que
   * deduplicar por (pier, piso, ubicación, caso).
   */
  getPierForcesFilas() {
    const porCaso = Object.values(this.seismicResultsByCase || {});
    const fuentes = porCaso.length ? porCaso : [this.seismicResults].filter(Boolean);
    const vistas = new Map();
    for (const r of fuentes) {
      for (const f of filasDePier(r?.pier_forces)) {
        // El PASO va en la clave: sin él, la fila Min pisaba a la Max del
        // mismo combo y la tabla salía con puros Min.
        vistas.set(`${f.pier}|${f.story}|${f.location}|${f.case}|${f.stepType}`, f);
      }
    }
    return numerarEstiloEtabs([...vistas.values()]);
  },

  /** ¿Hay tabla para mostrar? (modelo con muros con pier + análisis corrido) */
  hayPierForces() {
    return this.getPierForcesFilas().length > 0;
  },

  getPierForcesPiers() {
    return piersDe(this.getPierForcesFilas());
  },

  getPierForcesPisos() {
    const st = this.wallDesignState;
    return pisosDe(this.getPierForcesFilas(), st?.pierFiltro?.pier || null);
  },

  /** Las filas que se están mostrando, ya filtradas. */
  getPierForcesFiltradas() {
    const st = this.wallDesignState;
    if (!st) return [];
    const f = st.pierFiltro || {};
    // "__todos__" es el centinela del selector de piso: `null` en un <option>
    // llega como la cadena "null", y "" es un piso válido (modelo sin nombres
    // de piso), así que no sirven como "sin filtro".
    const story = (f.story == null || f.story === "__todos__") ? null : f.story;
    return filtrar(this.getPierForcesFilas(), { ...f, story });
  },

  /**
   * Abre la tabla. Si todavía no se eligió pier, arranca en el primero — sin
   * esto la tabla aparece vacía y parece que no hay resultados.
   */
  abrirPierForces() {
    const st = this.wallDesignState;
    if (!st) return;
    if (!st.pierFiltro.pier) st.pierFiltro.pier = this.getPierForcesPiers()[0] || null;
    st.pierAbierto = true;
  },

  cerrarPierForces() {
    if (this.wallDesignState) this.wallDesignState.pierAbierto = false;
  },

  /** Cambiar de pier invalida el piso elegido (los pisos son por pier). */
  elegirPierForcesPier(pier) {
    const st = this.wallDesignState;
    if (!st) return;
    st.pierFiltro.pier = pier || null;
    st.pierFiltro.story = "__todos__";
  },

  /**
   * Manda las filas visibles al diseño como demandas.
   *
   * Se escribe TAMBIÉN `demandasTexto` para que el cuadro de pegar muestre lo
   * mismo que se está usando: así lo calculado y lo pegado a mano son
   * comparables de un vistazo, que es justo lo que hace falta para cruzar
   * contra ETABS.
   */
  usarPierForcesComoDemandas() {
    const st = this.wallDesignState;
    if (!st) return 0;
    const filas = this.getPierForcesFiltradas();
    if (!filas.length) return 0;
    st.demandas = aDemandas(filas);
    st.demandasTexto = aTexto(filas);
    st.demandasIgnoradas = [];
    st.pendiente = true;
    st.pierAbierto = false;
    return st.demandas.length;
  },

  /** Invierte el signo de P (tracción positiva de ETABS ↔ compresión positiva). */
  alternarSignoDeDemandas() {
    const st = this.wallDesignState;
    if (!st) return;
    st.compresionNegativa = st.compresionNegativa === false;
    this.parsearDemandasDePlaca(st.demandasTexto);
  },

  /** Las filas con su D/C, ya cruzadas con lo que devolvió el motor. */
  getWallDemandRows() {
    const st = this.wallDesignState;
    const checks = st?.resultado?.demandChecks || [];
    return (st?.demandas || []).map((d, i) => ({
      ...d,
      ratio: checks[i]?.ratio ?? null,
      capacidadP: checks[i]?.capacity ? checks[i].capacity.P / TONF : null,
    }));
  },

  /** El D/C gobernante: el mayor de todos. */
  getWallGoverningRatio() {
    const ratios = this.getWallDemandRows().map((r) => r.ratio).filter((r) => r !== null);
    return ratios.length ? Math.max(...ratios) : null;
  },

  // ── Guardar ──────────────────────────────────────────────────────────────

  /**
   * Escribe el borrador en la sección del modelo, sobre sí misma.
   *
   * Hasta acá todo lo editado vivía solo en `wallDesignState.shapes` y se perdía
   * al cambiar de sección o recargar — igual que en ETABS, donde el Section
   * Designer no toca nada hasta que das OK. Esto es ese OK.
   */
  guardarSeccionDePlaca() {
    const st = this.wallDesignState;
    if (!st?.shapes?.length) return false;
    const destino = (this.frameSections?.sections || []).find((x) => x.name === st.seleccionada);
    if (!destino) {
      this.showMessage?.("No encuentro la sección en el modelo.", "error");
      return false;
    }
    this._volcarShapesEn(destino, st.shapes);
    st.secciones = this.getWallSections();
    st.editado = false;
    this.showMessage?.(`Sección "${destino.name}" guardada.`, "success");
    return true;
  },

  /** Guarda el borrador como una sección NUEVA y se pasa a ella. */
  guardarSeccionDePlacaComo(nombre) {
    const st = this.wallDesignState;
    const limpio = String(nombre || "").trim();
    if (!st?.shapes?.length || !limpio) return false;
    if (!this.frameSections) this.frameSections = { sections: [] };
    if (!Array.isArray(this.frameSections.sections)) this.frameSections.sections = [];
    if (this.frameSections.sections.some((x) => x.name === limpio)) {
      this.showMessage?.(`Ya existe una sección llamada "${limpio}".`, "warning");
      return false;
    }
    const base = st.secciones.find((x) => x.name === st.seleccionada);
    const nueva = { name: limpio, type: "sd", material: base?.material, description: limpio };
    this._volcarShapesEn(nueva, st.shapes);
    this.frameSections.sections.push(nueva);
    st.secciones = this.getWallSections();
    st.seleccionada = limpio;
    st.editado = false;
    this.showMessage?.(`Sección "${limpio}" creada.`, "success");
    return true;
  },

  /**
   * Vuelca las shapes en una sección del modelo, con sus propiedades.
   *
   * A/Iz/Iy/J salen del último cálculo del motor, porque una sección que aparece
   * en la lista de Frame Sections tiene que poder asignarse a una barra sin
   * romper el análisis. Si todavía no se calculó, quedan sin tocar y hay que
   * apretar Calcular antes de guardar.
   */
  _volcarShapesEn(destino, shapes) {
    destino.sdShapes = JSON.parse(JSON.stringify(shapes));
    destino.sdAngle = destino.sdAngle || 0;
    destino.sdDiseñable = shapes.some((x) => String(x?.shapeType || "").includes("REBAR"));
    const props = this.wallDesignState?.resultado?.section?.props;
    if (props) {
      destino.A = props.A;
      destino.area = props.A;
      destino.Iz = props.I33;   // eje 3 (el peralte)
      destino.Iy = props.I22;
      destino.J = destino.J || 0;
    }
  },

  /** ¿Se puede guardar? (hay borrador y ya se calculó al menos una vez) */
  puedeGuardarPlaca() {
    const st = this.wallDesignState;
    return !!(st?.shapes?.length && st?.resultado && !st?.pendiente);
  },

  // ── Lectura para la vista ────────────────────────────────────────────────

  /** Catálogo de varillas del .e2k (REBARDEFINITION), en m². */
  getRebarCatalogForWalls() {
    const cat = this.rebarDefinitions || {};
    const salida = {};
    for (const [nombre, v] of Object.entries(cat)) {
      const area = typeof v === "number" ? v : v?.area;
      if (area > 0) salida[nombre] = area;
    }
    return salida;
  },

  /** f'c en Pa. El nombre del material del .e2k suele traerlo: "f'c = 210 kg/cm²". */
  getWallFcPa(nombreMaterial) {
    const m = /(\d+(?:\.\d+)?)\s*kg\/cm/i.exec(String(nombreMaterial || ""));
    return (m ? parseFloat(m[1]) : 210) * KGCM2_A_PA;
  },

  /** fy en Pa. Del material del ACERO, no del concreto — ya nos mordió una vez. */
  getWallFyPa() {
    const acero = (this.materials || []).find((x) => /fy\s*=/i.test(x?.name || ""));
    const m = /(\d+(?:\.\d+)?)\s*kg\/cm/i.exec(String(acero?.name || ""));
    return (m ? parseFloat(m[1]) : 4200) * KGCM2_A_PA;
  },

  /** La curva elegida, en tonf y tonf·m, lista para la tabla. */
  getWallCurveRows() {
    const st = this.wallDesignState;
    const sup = st?.resultado?.surfaces?.[st.modo];
    if (!sup) return [];
    return (sup.curves[st.curva] || sup.curves[0]).points.map((p, i) => ({
      punto: i + 1,
      P: p.P / TONF,
      M2: p.M2 / TONF,
      M3: p.M3 / TONF,
      phi: p.phi,
    }));
  },

  /** Resumen de la sección para la cabecera del modal. */
  getWallSectionSummary() {
    const s = this.wallDesignState?.resultado?.section;
    if (!s) return null;
    return {
      Ag: s.Ag,
      As: s.As * M2_A_CM2,
      cuantia: s.Ag > 0 ? (s.As / s.Ag) * 100 : 0,
      varillas: s.bars.length,
      espejo: `${s.mirror2 ? "2" : ""}${s.mirror3 ? "3" : ""}` || "—",
      // Las mismas que muestra ETABS en "Section Properties" — verificadas
      // contra la PL2 a seis dígitos.
      I22: s.props?.I22,
      I33: s.props?.I33,
    };
  },

  /** ¿Está seleccionada esta shape? (lo usa la lista lateral) */
  estaSeleccionadaEnPlaca(i) { return !!this.wallDesignState?.seleccion?.includes(i); },

  /** Las shapes del borrador, para la lista lateral. */
  getWallShapeList() {
    return (this.wallDesignState?.shapes || []).map((s, i) => ({
      i,
      tipo: s.shapeType,
      detalle: detalleDeShape(s),
      esArmado: String(s.shapeType || "").includes("REBAR"),
      etiqueta: (i + 1) + ". " + s.shapeType,
    }));
  },
};

/** "1× conc l, 20× rebar, 4× line rebar" para la lista de secciones. */
function resumenDeShapes(shapes = []) {
  const cuenta = {};
  for (const s of shapes) if (s?.shapeType) cuenta[s.shapeType] = (cuenta[s.shapeType] || 0) + 1;
  return Object.entries(cuenta).map(([t, n]) => `${n}× ${t.toLowerCase()}`).join(", ");
}

/** Una línea corta que identifique la shape en la lista. */
function detalleDeShape(s) {
  const t = String(s?.shapeType || "");
  if (t === "POLYGON") return `${(s.corners || []).length} vértices`;
  if (t === "REBAR") return `${s.barSize || "?"} en (${fmt(s.XC)}, ${fmt(s.YC)})`;
  if (t === "LINE REBAR") return `${s.barSize || "?"} · sp ${fmt(s.SPACING)} · end ${s.endBar || "NO"}`;
  if (t === "RECT REBAR") return `${fmt(s.D)} × ${fmt(s.B)} en (${fmt(s.XC)}, ${fmt(s.YC)})`;
  return `${fmt(s.D)} × ${fmt(s.B)}`;
}

const fmt = (x) => (Number.isFinite(x) ? Number(x).toFixed(3) : "—");
