// mixins/analysis/agenteCad.js — chat del agente dentro de Análisis Estructural, por su cuenta: trabaja
// sobre el modelo abierto (dibujado aquí, importado de ETABS o enviado por NovaCad) sin depender del
// panel de NovaCad. Los pedidos claros se ejecutan sin IA (engine/agenteCad.js → rutaCad); el resto
// lo responde la IA del servidor solo con los hechos del modelo y de la revisión.
// Vista: components/cad/ui/agente-cad-chat.blade.php (evento open-agente-cad-chat).
import {AYUDA, mensajesParaIA, responderDato, rutaCad, textoDisenoColumnas, textoRevision} from "../../engine/agenteCad.js";

export const agenteCadMixin = {
  // Lo que la IA necesita saber del modelo (sin datos del cliente).
  _hechosDelModeloAgente() {
    const m = this._datosRevisionModelo?.() ?? {};
    const secciones = [...new Set((this.shapes || []).map((f) => f.frameSection?.name || f.sectionName).filter(Boolean))];
    const casos = (this.responseSpectrumCases?.items || []).map((c) => c.name || c.id);
    return {
      nudos: this.nodes?.length ?? 0, barras: this.shapes?.length ?? 0, losas: this.areas?.length ?? 0,
      pisos: (this.stories || []).length, secciones: secciones.slice(0, 30), casosEspectrales: casos,
      apoyos: m.apoyos, cargas: m.cargas, fuenteDeMasa: m.masa,
      hayResultadosSismicos: Object.keys(this.seismicResultsByCase || {}).length > 0,
      columnasDisenadas: (this.rcColumnDesignResults || []).length,
    };
  },

  _revisionAgenteActual() {
    this.revisionAgente = this.calcularRevisionAgente(this.revisionAgente?.parametros || {});
    return this.revisionAgente;
  },

  // Responde un mensaje del chat. historial: [{role, content}] de la conversación.
  async agenteCadResponder(texto, historial = []) {
    const ruta = rutaCad(texto);
    if (!(this.nodes || []).length && ruta?.accion !== "abrirModeloAgente" && ruta?.accion !== "ayuda") {
      return {texto: "No hay un modelo abierto. Dibuja uno, importa un .e2k de ETABS (Archivo ▸ Importar) o pide «abre el modelo del agente» si NovaCad te envió uno.", accion: "sin_modelo"};
    }
    switch (ruta?.accion) {
      case "ayuda":
        return {texto: AYUDA, accion: "ayuda"};
      case "abrirModeloAgente": {
        const ok = this.importarModeloDelAgente?.({desdeMenu: true});
        return {texto: ok ? "Abrí el modelo que armó NovaCad. Revisa los supuestos (secciones, cargas, espectro) y pide «analiza el sismo»." : "No hay un modelo de NovaCad para abrir: en NovaCad pide «envía a análisis».", accion: "abrirModeloAgente"};
      }
      case "analizarSismo": {
        const casos = (this._getSeismicRunCases?.() || []).filter((c) => c.id !== "SISMO");
        if (!casos.length && !(this.seismicConfig?.spectrumX || []).length) {
          return {texto: "El modelo no tiene casos espectrales. Defínelos en Define ▸ Response Spectrum Cases (o abre Analizar ▸ Análisis Sísmico Espectral y carga el espectro) y vuelve a pedirlo.", accion: "analizarSismo"};
        }
        this._initSeismic?.();
        await this.runSeismicAnalysis();
        if (!Object.keys(this.seismicResultsByCase || {}).length) return {texto: "El análisis no devolvió resultados: revisa el aviso del motor.", accion: "analizarSismo"};
        return {texto: `Análisis sísmico listo.\n${textoRevision(this._revisionAgenteActual())}`, accion: "analizarSismo"};
      }
      case "revisar":
        return {texto: textoRevision(this._revisionAgenteActual()), accion: "revisar"};
      case "disenarColumnas": {
        if (!Object.keys(this.seismicResultsByCase || {}).length) return {texto: "Primero corre el análisis: pide «analiza el sismo».", accion: "disenarColumnas"};
        const ok = await this.disenarTodasLasColumnas();
        return {texto: ok ? textoDisenoColumnas(this.rcColumnDesignResults) : "El modelo no tiene columnas.", accion: "disenarColumnas"};
      }
      case "ajustarArmado": {
        if (!(this.rcColumnDesignResults || []).length) {
          if (!Object.keys(this.seismicResultsByCase || {}).length) return {texto: "Primero corre el análisis y diseña las columnas.", accion: "ajustarArmado"};
          await this.disenarTodasLasColumnas();
        } else await this.ajustarArmadoColumnas();
        return {texto: textoDisenoColumnas(this.rcColumnDesignResults), accion: "ajustarArmado"};
      }
      case "enviarDiseno": {
        const p = this.enviarDisenoAlAgente();
        return {texto: p ? `Diseño enviado: ${Object.keys(p.columnas).length} tipo(s) de columna y ${p.reacciones.length} reacciones. En NovaCad pide «aplica el diseño».` : "Primero diseña las columnas («diseña las columnas»).", accion: "enviarDiseno"};
      }
      case "dato": {
        const r = responderDato(texto, this._revisionAgenteActual());
        if (r) return {texto: r, accion: "dato"};
        break;
      }
      default:
    }
    return {texto: await this._preguntarIAAgenteCad(texto, historial), accion: "ia"};
  },

  async _preguntarIAAgenteCad(pregunta, historial) {
    const revision = Object.keys(this.seismicResultsByCase || {}).length ? this._revisionAgenteActual() : null;
    const token = document.querySelector('meta[name="csrf-token"]')?.content ?? "";
    const r = await fetch("/software/etabs/agente/llm/chat/completions", {
      method: "POST", credentials: "same-origin",
      headers: {"Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest", "X-CSRF-TOKEN": token},
      body: JSON.stringify({model: "servidor", temperature: 0.2, stream: false, messages: mensajesParaIA({pregunta, modelo: this._hechosDelModeloAgente(), revision, historial})}),
    });
    if (!r.ok) {
      let mensaje = "";
      try { mensaje = (await r.json())?.error?.message ?? ""; } catch { /* sin cuerpo */ }
      return `No pude consultar a la IA (${mensaje || `HTTP ${r.status}`}). Los pedidos directos siguen funcionando: escribe «ayuda».`;
    }
    const datos = await r.json();
    return String(datos?.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim() || "Sin respuesta.";
  },

  openAgenteCadChat() {
    window.dispatchEvent(new CustomEvent("open-agente-cad-chat"));
  },
};
