// mixins/analysis/revisionAgente.js — "Revisión del agente (E.030)": reúne el modelo y los resultados
// del análisis sísmico y los pasa al motor de verificaciones (engine/revisionE030.js). La vista es
// modals/revision-agente-modal.blade.php (evento open-revision-agente-modal).
import {revisarModelo, revisarResultados, resumirRevision, rDelEspectro} from "../../engine/revisionE030.js";
import {nodeHasRestraints} from "../../model/nodeSupports.js";

export const revisionAgenteMixin = {
  // Datos del modelo que necesita la revisión (sin tocar nada).
  _datosRevisionModelo() {
    const barras = this.shapes || [];
    const sinSeccion = barras.filter((b) => !(b.section?.name || b.frameSection?.name || b.sectionName || b.sectionId)).length;
    const patrones = this.staticLoadCases?.items || this.loadCases?.cases || [];
    const tipo = (c) => String(c.type || c.patternType || "").toLowerCase();
    const casosRS = (this.responseSpectrumCases?.items || []).filter((c) => c && c.enabled !== false);
    const tieneDir = (u) => casosRS.some((c) => c.spectra?.[u]?.functionId || (u === "U1" ? /x/i : /y/i).test(String(c.direction || "")));
    const masa = this.massSource || {};
    return {
      apoyos: (this.nodes || []).filter((n) => nodeHasRestraints(n)).length,
      barras: barras.length, sinSeccion,
      cargas: {muerta: patrones.some((c) => /dead|muerta/.test(tipo(c)) || /^CM$/i.test(c.name)), viva: patrones.some((c) => /live|viva/.test(tipo(c)) || /^CV/i.test(c.name))},
      masa: masa.enabled !== false && Boolean((masa.loadPatterns || masa.loadMultipliers || []).length || masa.includeSelfWeight),
      espectroX: tieneDir("U1"), espectroY: tieneDir("U2"),
    };
  },

  // Resultado y espectro por dirección: el primer caso espectral de cada dirección que tenga resultados.
  _datosRevisionSismo() {
    const porCaso = this.seismicResultsByCase || {};
    const casos = (this.responseSpectrumCases?.items || []).filter((c) => c && c.enabled !== false);
    const funciones = this.responseSpectrumFunctions?.items || [];
    const enG = this.seismicConfig?.saInG !== false;
    const direcciones = {};
    let R = null;
    for (const [dir, u] of [["X", "U1"], ["Y", "U2"]]) {
      const caso = casos.find((c) => (c.spectra?.[u]?.functionId || (u === "U1" ? /x/i : /y/i).test(String(c.direction || ""))) && porCaso[c.id ?? c.name])
        ?? casos.find((c) => c.spectra?.[u]?.functionId || (u === "U1" ? /x/i : /y/i).test(String(c.direction || "")));
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

  // Corre la revisión con los parámetros de la vista (R, regular, material).
  calcularRevisionAgente(opciones = {}) {
    const modelo = revisarModelo(this._datosRevisionModelo());
    const {direcciones, R} = this._datosRevisionSismo();
    const hayResultados = Object.values(direcciones).some((d) => d.resultado);
    const sismo = hayResultados
      ? revisarResultados({direcciones, R: Number(opciones.R) > 0 ? Number(opciones.R) : R, regular: opciones.regular !== false, material: opciones.material || "concreto"})
      : {verificaciones: [], supuestos: [], parametros: {R: Number(opciones.R) > 0 ? Number(opciones.R) : R ?? 8, regular: opciones.regular !== false, material: opciones.material || "concreto"}};
    const verificaciones = [...modelo, ...sismo.verificaciones];
    return {
      verificaciones, supuestos: sismo.supuestos, parametros: sismo.parametros, hayResultados,
      casos: Object.fromEntries(Object.entries(direcciones).map(([d, v]) => [d, v.caso])),
      resumen: resumirRevision(verificaciones),
    };
  },

  openRevisionAgente(opciones = {}) {
    const datos = this.calcularRevisionAgente(opciones);
    this.revisionAgente = datos;
    window.dispatchEvent(new CustomEvent("open-revision-agente-modal", {detail: datos}));
    return datos;
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
