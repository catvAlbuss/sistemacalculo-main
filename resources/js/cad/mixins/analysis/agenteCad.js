// mixins/analysis/agenteCad.js — chat del agente dentro de Análisis Estructural, por su cuenta: trabaja
// sobre el modelo abierto (dibujado aquí, importado de ETABS o enviado por NovaCad) sin depender del
// panel de NovaCad. Los pedidos claros se ejecutan sin IA (engine/agenteCad.js → rutaCad); el resto
// lo responde la IA del servidor solo con los hechos del modelo y de la revisión.
// Vista: components/cad/ui/agente-cad-chat.blade.php (evento open-agente-cad-chat).
import {AYUDA, mensajesParaIA, responderDato, rutaCad, textoDisenoColumnas, textoRevision} from "../../engine/agenteCad.js";
import {modeloRapido, siguienteLado, exponenteDeriva} from "../../engine/modeloRapido.js";

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
    if (!(this.nodes || []).length && !["abrirModeloAgente", "ayuda", "crearModelo"].includes(ruta?.accion)) {
      return {texto: "No hay un modelo abierto. Dibuja uno, importa un .e2k de ETABS (Archivo ▸ Importar) o pide «abre el modelo del agente» si NovaCad te envió uno.", accion: "sin_modelo"};
    }
    switch (ruta?.accion) {
      case "ayuda":
        return {texto: AYUDA, accion: "ayuda"};
      case "crearModelo": {
        let g;
        try { g = modeloRapido(texto); } catch (e) { return {texto: `No pude armar el modelo: ${e.message}`, accion: "crearModelo"}; }
        const ok = this.importarE2kTexto(g.texto, `${g.nombre}.e2k`);
        if (!ok) return {texto: "Armé el modelo pero no se pudo abrir en el CAD.", accion: "crearModelo"};
        this._modeloRapido = {texto, columna: g.pedido.columna};
        const r = g.resumen, p = g.pedido;
        return {
          texto: [
            `Modelo listo: ${p.pisos} piso(s), ${p.nx}×${p.ny} vanos de ${p.luzX.toFixed(2)}×${p.luzY.toFixed(2)} m, h = ${p.altura.toFixed(2)} m · ${r.columnas} columnas, ${r.vigas} vigas, ${r.losas} paños de losa · secciones ${r.secciones.join(", ")}.`,
            r.sismo ? `Espectro E.030: Z = ${r.sismo.Z}, U = ${r.sismo.U}, S = ${r.sismo.S}, Tp = ${r.sismo.Tp}, TL = ${r.sismo.TL}, R = ${r.sismo.R}; ${r.combinaciones.length} combinaciones E.060.` : "",
            `Supuestos (revísalos): ${g.supuestos.join(" ")}`,
            "Siguiente: «analiza el sismo».",
          ].filter(Boolean).join("\n"),
          accion: "crearModelo",
        };
      }
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
      case "rigidizar":
        return {texto: await this._rigidizarPorDeriva(), accion: "rigidizar"};
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

  // Deriva inelástica máxima (X e Y) y su límite, de la revisión E.030.
  _derivaMaximaAgente() {
    const vs = (this._revisionAgenteActual().verificaciones || []).filter((v) => /Deriva inelástica/.test(v.titulo) && Number.isFinite(Number(v.valor)));
    if (!vs.length) return null;
    const limite = Number(this.revisionAgente?.parametros?.limiteDeriva) || 0.007;
    return {deriva: Math.max(...vs.map((v) => Number(v.valor))), limite};
  },

  // Agranda las columnas del modelo rápido hasta cumplir la deriva (hasta 4 vueltas de análisis).
  async _rigidizarPorDeriva() {
    if (!this._modeloRapido) return "Solo puedo rigidizar solo un modelo que creé aquí (pide «crea un edificio de …»). En un modelo importado, cambia las secciones en Define ▸ Frame Sections y vuelve a analizar.";
    if (!Object.keys(this.seismicResultsByCase || {}).length) {
      this._initSeismic?.();
      await this.runSeismicAnalysis();
    }
    // Horquilla + secante (modeloRapido.js → siguienteLado): el menor lado que cumple, sin pasarse.
    const historial = [], pasos = [];
    const abrir = async (lado) => {
      const g = modeloRapido(this._modeloRapido.texto, {ajustes: {columna: {b: lado, h: lado}}});
      if (!this.importarE2kTexto(g.texto, `${g.nombre}.e2k`)) throw new Error("No pude reabrir el modelo rigidizado.");
      this._modeloRapido.columna = {b: lado, h: lado};
      this._initSeismic?.();
      await this.runSeismicAnalysis();
    };
    let limite = 0.007;
    for (let vuelta = 0; vuelta < 7; vuelta++) {
      const d = this._derivaMaximaAgente();
      if (!d) return "No hay derivas en la revisión: corre «analiza el sismo».";
      limite = d.limite;
      const lado = Math.max(this._modeloRapido.columna.b, this._modeloRapido.columna.h);
      historial.push({lado, deriva: d.deriva});
      pasos.push(`${lado.toFixed(2)} m → ${d.deriva.toFixed(4)}${d.deriva <= d.limite ? " ✓" : ""}`);
      const s = siguienteLado(historial, d.limite);
      if (s.listo !== undefined && s.listo !== null) {
        if (Math.abs(s.listo - lado) > 1e-9) await abrir(s.listo); // dejar abierto el que cumple
        return [`Cumple la deriva (≤ ${d.limite}) con columnas ${s.listo.toFixed(2)}x${s.listo.toFixed(2)} m: el menor lado que cumple (a 5 cm).`, `Recorrido (lado → deriva): ${pasos.join(" · ")}.`, "Siguiente: «diseña las columnas»."].join("\n");
      }
      if (s.sinSolucion) break;
      await abrir(s.lado);
    }
    const final = this._modeloRapido.columna, d = this._derivaMaximaAgente();
    return [`Con columnas de ${final.b.toFixed(2)}x${final.h.toFixed(2)} m la deriva queda en ${d?.deriva.toFixed(4) ?? "—"} (límite ${limite}).`, `Recorrido (lado → deriva): ${pasos.join(" · ")}.`,
      historial.length > 1 && exponenteDeriva(historial) < 1.5
        ? "Las vigas también se deforman (agrandar columnas rinde poco): conviene peraltar las vigas o, mejor, agregar placas (muros de concreto) en los dos sentidos."
        : "Conviene agregar placas (muros de concreto) en los dos sentidos."].join("\n");
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

  // Ciclo que pide NovaCad («estructura y analiza»): análisis sísmico → revisión E.030 → diseño de
  // columnas (y el menor armado si alguna no cumple) → diseño de vuelta a NovaCad. Cada paso se cuenta
  // en el chat del agente (evento agente-cad-mensaje) para que el ingeniero vea qué hizo.
  async cicloAutomaticoAgente() {
    const decir = (texto) => window.dispatchEvent(new CustomEvent("agente-cad-mensaje", {detail: {texto}}));
    this.openAgenteCadChat();
    decir("NovaCad me envió el modelo: corro el ciclo completo (análisis, revisión E.030, diseño) y le devuelvo el diseño.");
    try {
      for (const pedido of ["analiza el sismo", "diseña las columnas"]) {
        decir(`▶ ${pedido}`);
        const r = await this.agenteCadResponder(pedido);
        decir(r.texto);
      }
      if ((this.rcColumnDesignResults || []).some((c) => !c.unsupported && Math.max(Number(c.check?.base?.ratio) || 0, Number(c.check?.top?.ratio) || 0) > 1)) {
        decir("▶ ajusta el acero");
        decir((await this.agenteCadResponder("ajusta el acero")).texto);
      }
      const r = await this.agenteCadResponder("envía el diseño a NovaCad");
      decir(`${r.texto} Puedes volver a la pestaña de NovaCad: allí aplico el diseño a las láminas.`);
      return true;
    } catch (error) {
      decir(`No pude completar el ciclo: ${error?.message ?? error}. Puedes seguir paso a paso en este chat.`);
      return false;
    }
  },

  openAgenteCadChat() {
    window.dispatchEvent(new CustomEvent("open-agente-cad-chat"));
  },
};
