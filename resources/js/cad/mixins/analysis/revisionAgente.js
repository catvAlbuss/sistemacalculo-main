// mixins/analysis/revisionAgente.js — "Revisión del agente (E.030)": reúne el modelo, los resultados del
// análisis sísmico y del diseño y los pasa al motor de verificaciones (engine/revisionE030.js). La vista
// es modals/revision-agente-modal.blade.php (evento open-revision-agente-modal).
import {revisarModelo, revisarResultados, revisarIrregularidades, revisarDiseno, resumirRevision, rDelEspectro, mensajesExplicacion} from "../../engine/revisionE030.js";
import {nodeHasRestraints} from "../../model/nodeSupports.js";
import {DISENO_DEL_AGENTE, buscarArmado, paqueteParaAgente, ratioDe, totalDePatron, tipoDeSeccion} from "../../engine/disenoAgente.js";
import {armadosMayores} from "../../../ingenieria/diseno/patronColumna.js";
import {buildZapataColumnRows} from "../../engine/foundationContract.js";

const LIMITES = {concreto: 0.007, acero: 0.01, albanileria: 0.005, madera: 0.01, ductilidad_limitada: 0.005};
const esDeDireccion = (c, u) => Boolean(c?.spectra?.[u]?.functionId) || (u === "U1" ? /x/i : /y/i).test(String(c?.direction || ""));

export const revisionAgenteMixin = {
  // Datos del modelo que necesita la revisión (sin tocar nada).
  _datosRevisionModelo() {
    const barras = this.shapes || [];
    const sinSeccion = barras.filter((b) => !(b.section?.name || b.frameSection?.name || b.sectionName || b.sectionId)).length;
    const patrones = this.staticLoadCases?.items || this.loadCases?.cases || [];
    const tipo = (c) => String(c.type || c.patternType || "").toLowerCase();
    const casosRS = (this.responseSpectrumCases?.items || []).filter((c) => c && c.enabled !== false);
    const masa = this.massSource || {};
    return {
      apoyos: (this.nodes || []).filter((n) => nodeHasRestraints(n)).length,
      barras: barras.length, sinSeccion,
      cargas: {muerta: patrones.some((c) => /dead|muerta/.test(tipo(c)) || /^CM$/i.test(c.name)), viva: patrones.some((c) => /live|viva/.test(tipo(c)) || /^CV/i.test(c.name))},
      masa: masa.enabled !== false && Boolean((masa.loadPatterns || masa.loadMultipliers || []).length || masa.includeSelfWeight),
      espectroX: casosRS.some((c) => esDeDireccion(c, "U1")), espectroY: casosRS.some((c) => esDeDireccion(c, "U2")),
    };
  },

  // Resultado y espectro por dirección: el primer caso espectral de cada dirección con resultados.
  _datosRevisionSismo() {
    const porCaso = this.seismicResultsByCase || {};
    const casos = (this.responseSpectrumCases?.items || []).filter((c) => c && c.enabled !== false);
    const funciones = this.responseSpectrumFunctions?.items || [];
    const enG = this.seismicConfig?.saInG !== false;
    const direcciones = {};
    let R = null;
    for (const [dir, u] of [["X", "U1"], ["Y", "U2"]]) {
      const caso = casos.find((c) => esDeDireccion(c, u) && porCaso[c.id ?? c.name]) ?? casos.find((c) => esDeDireccion(c, u));
      const resultado = caso ? porCaso[caso.id ?? caso.name] ?? null : null;
      const espec = caso?.spectra?.[u] ?? {functionId: caso?.functionId, scaleFactor: caso?.scaleFactor};
      const funcion = funciones.find((f) => f.id === espec?.functionId || f.name === espec?.functionId);
      R ??= rDelEspectro(funcion);
      direcciones[dir] = {caso: caso?.name ?? caso?.id ?? null, resultado, espectro: {puntos: funcion?.points ?? [], factor: Number(espec?.scaleFactor ?? caso?.scaleFactor ?? 1), enG}};
    }
    // Sin casos por dirección (un solo resultado activo): se usa en las dos.
    if (!direcciones.X.resultado && !direcciones.Y.resultado && this.seismicResults) {
      for (const dir of ["X", "Y"]) direcciones[dir].resultado = this.seismicResults;
    }
    return {direcciones, R};
  },

  // Corre la revisión. opciones: {R, regularidad: "auto"|"regular"|"irregular", material}.
  calcularRevisionAgente(opciones = {}) {
    const modelo = revisarModelo(this._datosRevisionModelo());
    const {direcciones, R: Respectro} = this._datosRevisionSismo();
    const R = Number(opciones.R) > 0 ? Number(opciones.R) : Respectro;
    const material = opciones.material || "concreto";
    const hayResultados = Object.values(direcciones).some((d) => d.resultado);
    let irregularidad = {verificaciones: [], Ia: 1, Ip: 1, irregular: false};
    let sismo = {verificaciones: [], supuestos: [], parametros: {R: R ?? 8, regular: true, material}};
    if (hayResultados) {
      // Irregularidades con el factor de deriva regular (0.75·R) para decidir si aplican.
      irregularidad = revisarIrregularidades({direcciones, nodos: this.seismicLastPayload?.nodes || [], factorDeriva: 0.75 * (R ?? 8), limiteDeriva: LIMITES[material] ?? 0.007});
      const regularidad = opciones.regularidad || "auto";
      const regular = regularidad === "auto" ? !irregularidad.irregular : regularidad === "regular";
      sismo = revisarResultados({direcciones, R, regular, material});
      sismo.parametros.regularidad = regularidad;
      if (irregularidad.irregular && regularidad === "auto") {
        const Rred = Math.round((R ?? 8) * irregularidad.Ia * irregularidad.Ip * 100) / 100;
        sismo.verificaciones.unshift({grupo: "Irregularidad", titulo: "R con irregularidades", valor: `Ia = ${irregularidad.Ia}, Ip = ${irregularidad.Ip}`, estado: "observacion", norma: "E.030 art. 22",
          detalle: `Estructura irregular: las derivas y el cortante mínimo se revisaron como irregular (0.85·R, 90 %). Si el espectro usa R = ${R ?? 8} sin reducir, corresponde R = ${R ?? 8} × ${irregularidad.Ia} × ${irregularidad.Ip} = ${Rred}.`,
          accion: `Si el espectro no incluye Ia·Ip, recalcúlalo con R = ${Rred} y vuelve a analizar.`});
      }
    }
    const diseno = revisarDiseno({columnas: this.rcColumnDesignResults || null, viga: this.rcBeamDesign || null});
    const ajustadas = (this.rcColumnDesignResults || []).filter((c) => c.propuesta);
    if (ajustadas.length) {
      const bien = ajustadas.filter((c) => !c.propuesta.sinSolucion), mal = ajustadas.filter((c) => c.propuesta.sinSolucion);
      diseno.verificaciones.push({grupo: "Diseño", titulo: "Armado ajustado por el agente", valor: `${bien.length}/${ajustadas.length}`, norma: "E.060 art. 10.9",
        estado: mal.length ? "no_cumple" : "observacion",
        detalle: [...bien.map((c) => `${c.label}: ${c.propuesta.nAntes} → ${c.propuesta.n} varillas (ratio ${c.propuesta.ratioAntes.toFixed(2)} → ${c.propuesta.ratio.toFixed(2)}, ρ ${(c.propuesta.cuantia * 100).toFixed(1)} %)`),
          ...mal.map((c) => `${c.label}: ni con 4 % de cuantía cumple (ratio ${c.propuesta.ratio.toFixed(2)})`)].join("; "),
        accion: mal.length ? "Agranda la sección de esas columnas (o agrega placas) y vuelve a analizar." : "Envía el diseño al agente para que el cuadro de columnas lo dibuje."});
    }
    const verificaciones = [...modelo, ...irregularidad.verificaciones, ...sismo.verificaciones, ...diseno.verificaciones];
    return {
      verificaciones, supuestos: sismo.supuestos, parametros: sismo.parametros, hayResultados,
      irregularidad: {Ia: irregularidad.Ia, Ip: irregularidad.Ip, irregular: irregularidad.irregular},
      casos: Object.fromEntries(Object.entries(direcciones).map(([d, v]) => [d, v.caso])),
      resumen: resumirRevision(verificaciones),
    };
  },

  openRevisionAgente(opciones = {}) {
    const datos = this.calcularRevisionAgente({...(this.revisionAgente?.parametros || {}), ...opciones});
    this.revisionAgente = datos;
    window.dispatchEvent(new CustomEvent("open-revision-agente-modal", {detail: datos}));
    return datos;
  },

  // Diseña TODAS las columnas del modelo (no solo la selección) para que la revisión cubra el edificio.
  async disenarTodasLasColumnas() {
    const columnas = (this.shapes || []).filter((f) => /column/i.test(String(f.type || f.elementType || "")));
    if (!columnas.length) { this.showMessage?.("El modelo no tiene columnas.", "warning"); return false; }
    await this.openRcColumnDesignDialog?.(columnas);
    // Las que no cumplen: el agente busca el armado que sí (queda como propuesta en la revisión).
    try { await this.ajustarArmadoColumnas(); } catch (error) { console.warn("Ajuste de armado:", error); }
    return true;
  },

  // Columnas que no cumplen: el agente prueba armados mayores (dos varillas más del mismo diámetro
  // cada vez, hasta 4 % de cuantía) con el MISMO motor de interacción y las mismas demandas, y deja el
  // primero que cumple en `c.propuesta`. No cambia la sección del modelo: es la propuesta que viaja a
  // las láminas.
  async ajustarArmadoColumnas({limite = 1} = {}) {
    const columnas = this.rcColumnDesignResults || [];
    const fallan = columnas.filter((c) => !c.unsupported && c.geometry && ratioDe(c) > limite);
    const errores = [];
    // Una columna a la vez por dentro (cada armado depende de si el anterior cumplió), todas en paralelo.
    await Promise.all(fallan.map(async (c) => {
      const g = c.geometry;
      const nAntes = totalDePatron(g), ratioAntes = ratioDe(c);
      const puntos = [...(c.demandCandidates?.base || []), ...(c.demandCandidates?.top || [])];
      const nBase = (c.demandCandidates?.base || []).length;
      const opciones = armadosMayores({b: g.b, h: g.h, forma: g.shape, espesor: g.flangeThick, n: nAntes, areaBarra: g.barArea});
      const evaluar = async (o) => {
        const r = await this._rcFetchColumnInteraction({...g, n2: o.n2, n3: o.n3}, puntos);
        const checks = r.demandChecks || [];
        const base = this._rcMaxRatio(this._rcTagChecks(c.demandCandidates.base, checks.slice(0, nBase)));
        const top = this._rcMaxRatio(this._rcTagChecks(c.demandCandidates.top, checks.slice(nBase)));
        return Math.max(Number(base?.ratio) || 0, Number(top?.ratio) || 0);
      };
      let ultimo;
      try {
        const {opcion, ratio, mayor} = await buscarArmado(opciones, evaluar, {nAntes, ratioAntes, limite});
        const o = opcion ?? mayor;
        ultimo = o
          ? {sinSolucion: !opcion, n: o.total, nAntes, n2: o.n2, n3: o.n3, patron: o.patron, ratio, ratioAntes, cuantia: o.cuantia}
          : {sinSolucion: true, n: nAntes, nAntes, ratio: ratioAntes, ratioAntes, cuantia: 0};
      } catch (error) {
        // Motor caído o límite de pedidos: no se inventa una propuesta.
        errores.push(`${c.label}: ${error.message}`);
        return;
      }
      c.propuesta = ultimo;
    }));
    if (errores.length) this.showMessage?.(`El motor no respondió al buscar el armado de ${errores.length} columna(s); vuelve a intentarlo en un minuto. ${errores[0]}`, "warning");
    return fallan.length;
  },

  // Diseño verificado → agente (NovaCad): por tipo de columna, el armado que cumple y su ratio.
  enviarDisenoAlAgente() {
    const columnas = (this.rcColumnDesignResults || []).map((c) => {
      const frame = (this.shapes || []).find((f) => f.id === c.frameId);
      return {...c, sectionName: c.sectionName || frame?.frameSection?.name || frame?.sectionName || null};
    });
    if (!columnas.some((c) => tipoDeSeccion(c.sectionName))) {
      this.showMessage?.("Primero diseña las columnas del modelo del agente (Revisión del agente ▸ Diseñar todas las columnas).", "warning");
      return null;
    }
    const revision = this.revisionAgente || this.calcularRevisionAgente();
    // Reacciones de servicio en los apoyos de la base (CM y CV estáticos, sismo SRSS de SDX/SDY).
    let reacciones = [];
    try {
      const apoyos = (this.nodes || []).filter((n) => nodeHasRestraints(n) && n.position);
      reacciones = buildZapataColumnRows(apoyos, this).map((f) => ({x: f.x, y: f.y, pd: f.pd1, pl: f.pl1, ps: f.sismo1}))
        .filter((r) => r.pd + r.pl > 0);
    } catch (error) { console.warn("Reacciones para el agente:", error); }
    const paquete = paqueteParaAgente({columnas, revision, reacciones, modelo: this.modelName || this.currentModelName || ""});
    try { localStorage.setItem(DISENO_DEL_AGENTE, JSON.stringify(paquete)); } catch { /* sin almacenamiento */ }
    const tipos = Object.values(paquete.columnas);
    this.showMessage?.(`🤖 Diseño enviado al agente: ${tipos.length} tipo(s) de columna (${tipos.filter((t) => t.aumentado).length} con más acero) y ${paquete.reacciones.length} reacción(es) para las zapatas. Vuelve a NovaCad y pide «aplica el diseño».`, "success");
    return paquete;
  },

  // Explicación en lenguaje de ingeniero con la IA del servidor, solo sobre los hechos de la revisión.
  async explicarRevisionAgente() {
    const revision = this.revisionAgente || this.calcularRevisionAgente();
    const token = document.querySelector('meta[name="csrf-token"]')?.content ?? "";
    const respuesta = await fetch("/software/etabs/agente/llm/chat/completions", {
      method: "POST", credentials: "same-origin",
      headers: {"Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest", "X-CSRF-TOKEN": token},
      body: JSON.stringify({model: "servidor", messages: mensajesExplicacion(revision), temperature: 0.2, stream: false}),
    });
    if (!respuesta.ok) {
      let mensaje = "";
      try { mensaje = (await respuesta.json())?.error?.message ?? ""; } catch { /* sin cuerpo */ }
      throw new Error(mensaje || `El servidor del agente respondió ${respuesta.status}.`);
    }
    const datos = await respuesta.json();
    return String(datos?.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  },

  // Al terminar el análisis sísmico: aviso corto con lo que no cumple (la revisión completa, en el menú).
  _avisarRevisionAgente() {
    try {
      const datos = this.calcularRevisionAgente(this.revisionAgente?.parametros || {});
      this.revisionAgente = datos;
      const {noCumple} = datos.resumen;
      this.showMessage?.(
        noCumple
          ? `🤖 Revisión E.030: ${noCumple} verificación(es) no cumplen. Analizar ▸ Revisión del agente.`
          : "🤖 Revisión E.030: lo revisado cumple. Detalle en Analizar ▸ Revisión del agente.",
        noCumple ? "warning" : "success",
      );
    } catch (error) {
      console.warn("Revisión del agente:", error);
    }
  },
};
