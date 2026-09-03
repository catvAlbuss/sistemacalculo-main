/**
 * Canvas interactivo del Section Designer de placas: grilla, ejes, zoom, snap,
 * selección y arrastre. Autónomo — no depende del CAD del modelo.
 *
 * POR QUÉ NO REUSA `canvas2d/renderer.js`
 *   Ese es el canvas del MODELO (nudos, barras, losas, vistas de planta y
 *   elevación) y está atado al estado del CAD. Una sección es otro plano, con
 *   otras unidades y otras entidades. Meterlo ahí lo habría ensuciado y ya es un
 *   archivo enorme; acá son ~300 líneas sin dependencias.
 *
 * COORDENADAS
 *   Mundo = (X, Y) del Section Designer, en metros. Pantalla = píxeles, con Y
 *   invertida (en el mundo Y crece hacia arriba).
 *
 * INTERACCIÓN
 *   - rueda                 zoom sobre el cursor
 *   - botón derecho/rueda   pan (el izquierdo nunca mueve la vista)
 *   - clic                  seleccionar (varilla, extremo de línea o pieza)
 *   - arrastrar desde vacío VENTANA de selección; con Ctrl/Shift suma
 *   - arrastrar objeto      mover; si hay varios seleccionados, se mueven todos
 *   - modo "colocar"        cada clic deja una varilla nueva
 *   - modo "polilínea"      clic por vértice, doble clic para cerrar
 *   - snap                  a vértices/varillas primero, y si no a la grilla
 */

const COLOR = {
  fondo: "#0f172a",
  grillaFina: "#1e293b",
  grillaGruesa: "#334155",
  eje: "#22d3ee",
  concreto: "rgba(148,163,184,0.22)",
  concretoBorde: "#cbd5e1",
  varilla: "#f87171",
  varillaBorde: "#7f1d1d",
  seleccion: "#38bdf8",
  hover: "#fbbf24",
  snap: "#4ade80",
  texto: "#94a3b8",
};

/** Paso de grilla "lindo" (1, 2, 5 × 10^n) para que entren ~25 divisiones. */
function pasoDeGrilla(anchoMundo) {
  const crudo = anchoMundo / 25;
  const exp = Math.floor(Math.log10(Math.max(crudo, 1e-9)));
  const base = Math.pow(10, exp);
  const n = crudo / base;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * base;
}

export function crearEditorDeSeccion(canvas, cbs = {}) {
  const ctx = canvas.getContext("2d");
  let geo = { piezas: [], barras: [] };
  let shapes = [];
  let seleccion = new Set();   // indices de shape seleccionadas
  let ventana = null;          // rectangulo de seleccion en curso
  let modo = "seleccionar"; // "colocar" | "polilinea"
  let poli = [];             // vertices de la polilinea en curso
  let snapActivo = true;

  // Transformación mundo → pantalla
  let escala = 400;              // px por metro
  let ox = 0, oy = 0;            // origen del mundo, en píxeles
  let hover = null;              // { tipo, i, target }
  let arrastre = null;
  let cursor = null;             // { X, Y } del mouse, en mundo
  let ultimoSnap = null;

  const aPantalla = (X, Y) => ({ x: ox + X * escala, y: oy - Y * escala });
  const aMundo = (x, y) => ({ X: (x - ox) / escala, Y: (oy - y) / escala });

  function tamano() {
    const r = canvas.getBoundingClientRect();
    if (canvas.width !== Math.round(r.width) || canvas.height !== Math.round(r.height)) {
      canvas.width = Math.round(r.width);
      canvas.height = Math.round(r.height);
    }
    return { w: canvas.width, h: canvas.height };
  }

  /** Encuadra la sección con un margen. */
  function ajustar() {
    const { w, h } = tamano();
    const pts = geo.piezas.flatMap((p) => p.pts).concat(geo.barras);
    if (!pts.length) { escala = 400; ox = w / 2; oy = h / 2; return; }
    const xs = pts.map((p) => p.X), ys = pts.map((p) => p.Y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);
    const m = 40;
    escala = Math.min((w - 2 * m) / Math.max(x1 - x0, 1e-6), (h - 2 * m) / Math.max(y1 - y0, 1e-6));
    ox = w / 2 - ((x0 + x1) / 2) * escala;
    oy = h / 2 + ((y0 + y1) / 2) * escala;
  }

  // ── Snap ──────────────────────────────────────────────────────────────────
  /** Vértices de las piezas y centros de varilla: los puntos "reconocibles". */
  function candidatosDeSnap() {
    const out = [];
    for (const p of geo.piezas) for (const v of p.pts) out.push(v);
    for (const b of geo.barras) out.push(b);
    for (const s of shapes) {
      if (String(s?.shapeType).toUpperCase() === "LINE REBAR") {
        out.push({ X: Number(s.X1), Y: Number(s.Y1) });
        out.push({ X: Number(s.X2), Y: Number(s.Y2) });
      }
    }
    return out;
  }

  /** Punto ajustado: primero a un vértice cercano, si no a la grilla. */
  function aplicarSnap(P, paso) {
    if (!snapActivo) { ultimoSnap = null; return P; }
    const tol = 10 / escala; // 10 px
    let mejor = null, dMin = tol;
    for (const c of candidatosDeSnap()) {
      const d = Math.hypot(c.X - P.X, c.Y - P.Y);
      if (d < dMin) { dMin = d; mejor = c; }
    }
    if (mejor) { ultimoSnap = { ...mejor, tipo: "vertice" }; return { X: mejor.X, Y: mejor.Y }; }
    const ajustado = { X: Math.round(P.X / paso) * paso, Y: Math.round(P.Y / paso) * paso };
    ultimoSnap = { ...ajustado, tipo: "grilla" };
    return ajustado;
  }

  // ── Detección de qué hay bajo el cursor ───────────────────────────────────
  function objetoEn(P) {
    const tolPx = 8, tol = tolPx / escala;
    // 1) extremos de LINE REBAR (tienen prioridad: son los manijas finas)
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      if (String(s?.shapeType).toUpperCase() !== "LINE REBAR") continue;
      if (Math.hypot(Number(s.X1) - P.X, Number(s.Y1) - P.Y) < tol) return { i, target: "p1" };
      if (Math.hypot(Number(s.X2) - P.X, Number(s.Y2) - P.Y) < tol) return { i, target: "p2" };
    }
    // 2) varillas
    for (let k = geo.barras.length - 1; k >= 0; k--) {
      const b = geo.barras[k];
      if (Math.hypot(b.X - P.X, b.Y - P.Y) < tol) return { i: b.shape, target: "shape" };
    }
    // 3) piezas de concreto
    for (let k = geo.piezas.length - 1; k >= 0; k--) {
      const p = geo.piezas[k];
      let dentro = false;
      for (let a = 0, b = p.pts.length - 1; a < p.pts.length; b = a++) {
        const xi = p.pts[a].X, yi = p.pts[a].Y, xj = p.pts[b].X, yj = p.pts[b].Y;
        if ((yi > P.Y) !== (yj > P.Y) && P.X < ((xj - xi) * (P.Y - yi)) / (yj - yi) + xi) dentro = !dentro;
      }
      if (dentro) return { i: p.shape, target: "shape" };
    }
    return null;
  }

  /**
   * Shapes que caen dentro del rectángulo. Una pieza entra si TODOS sus
   * vértices están adentro y una varilla si su centro lo está — el criterio de
   * "ventana" de cualquier CAD: encierra el objeto entero, no lo toca.
   */
  function shapesEnVentana(v) {
    const x0 = Math.min(v.x0, v.x1), x1 = Math.max(v.x0, v.x1);
    const y0 = Math.min(v.y0, v.y1), y1 = Math.max(v.y0, v.y1);
    const dentro = (P) => P.X >= x0 && P.X <= x1 && P.Y >= y0 && P.Y <= y1;
    const out = new Set();
    for (const b of geo.barras) if (dentro(b)) out.add(b.shape);
    for (const p of geo.piezas) if (p.pts.every(dentro)) out.add(p.shape);
    // Una varilla suelta de una LINE REBAR encerrada a medias no cuenta: la
    // shape es la línea entera, y moverla a medias no significa nada.
    for (const [i, sh] of shapes.entries()) {
      if (String(sh?.shapeType).toUpperCase() !== "LINE REBAR") continue;
      const p1 = { X: Number(sh.X1), Y: Number(sh.Y1) }, p2 = { X: Number(sh.X2), Y: Number(sh.Y2) };
      if (!(dentro(p1) && dentro(p2))) out.delete(i);
    }
    return [...out];
  }

  // ── Dibujo ────────────────────────────────────────────────────────────────
  function dibujar() {
    const { w, h } = tamano();
    ctx.fillStyle = COLOR.fondo;
    ctx.fillRect(0, 0, w, h);

    const paso = pasoDeGrilla(w / escala);
    const esq0 = aMundo(0, h), esq1 = aMundo(w, 0);

    // grilla
    ctx.lineWidth = 1;
    for (let n = Math.floor(esq0.X / paso); n <= Math.ceil(esq1.X / paso); n++) {
      const x = aPantalla(n * paso, 0).x;
      ctx.strokeStyle = n % 5 === 0 ? COLOR.grillaGruesa : COLOR.grillaFina;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let n = Math.floor(esq0.Y / paso); n <= Math.ceil(esq1.Y / paso); n++) {
      const y = aPantalla(0, n * paso).y;
      ctx.strokeStyle = n % 5 === 0 ? COLOR.grillaGruesa : COLOR.grillaFina;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // ejes X e Y
    const o = aPantalla(0, 0);
    ctx.strokeStyle = COLOR.eje; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, o.y); ctx.lineTo(w, o.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, h); ctx.stroke();
    ctx.fillStyle = COLOR.eje; ctx.font = "11px ui-monospace, monospace";
    ctx.fillText("X", w - 14, o.y - 6);
    ctx.fillText("Y", o.x + 6, 14);

    // piezas de concreto
    for (const p of geo.piezas) {
      const sel = seleccion.has(p.shape), hov = hover?.i === p.shape;
      ctx.beginPath();
      p.pts.forEach((v, k) => {
        const s = aPantalla(v.X, v.Y);
        k ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y);
      });
      ctx.closePath();
      ctx.fillStyle = COLOR.concreto; ctx.fill();
      ctx.strokeStyle = sel ? COLOR.seleccion : hov ? COLOR.hover : COLOR.concretoBorde;
      ctx.lineWidth = sel ? 2.5 : 1.5;
      ctx.stroke();
    }

    // varillas (radio proporcional al área, con piso para que se puedan tocar)
    const aMax = Math.max(...geo.barras.map((b) => b.area), 1e-9);
    for (const b of geo.barras) {
      const sel = seleccion.has(b.shape), hov = hover?.i === b.shape;
      const s = aPantalla(b.X, b.Y);
      const r = Math.max(3, 2.5 + 3.2 * Math.sqrt(b.area / aMax));
      ctx.beginPath(); ctx.arc(s.x, s.y, sel ? r + 1.5 : r, 0, Math.PI * 2);
      ctx.fillStyle = sel ? COLOR.seleccion : hov ? COLOR.hover : COLOR.varilla;
      ctx.fill();
      ctx.strokeStyle = COLOR.varillaBorde; ctx.lineWidth = 0.8; ctx.stroke();
    }

    // manijas de los extremos de cada LINE REBAR
    shapes.forEach((sh, i) => {
      if (String(sh?.shapeType).toUpperCase() !== "LINE REBAR") return;
      for (const [t, X, Y] of [["p1", Number(sh.X1), Number(sh.Y1)], ["p2", Number(sh.X2), Number(sh.Y2)]]) {
        const s = aPantalla(X, Y);
        const act = hover?.i === i && hover?.target === t;
        ctx.beginPath(); ctx.rect(s.x - 3.5, s.y - 3.5, 7, 7);
        ctx.fillStyle = act ? COLOR.hover : seleccion.has(i) ? COLOR.seleccion : "#64748b";
        ctx.fill();
      }
    });

    // polilinea en curso
    if (poli.length) {
      ctx.strokeStyle = COLOR.snap; ctx.lineWidth = 1.8;
      ctx.beginPath();
      poli.forEach((v, k) => { const q = aPantalla(v.X, v.Y); k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
      if (cursor) { const q = aPantalla(cursor.X, cursor.Y); ctx.lineTo(q.x, q.y); }
      ctx.stroke();
      ctx.setLineDash([4, 4]);
      if (poli.length > 1 && cursor) {
        const a_ = aPantalla(cursor.X, cursor.Y), b_ = aPantalla(poli[0].X, poli[0].Y);
        ctx.beginPath(); ctx.moveTo(a_.x, a_.y); ctx.lineTo(b_.x, b_.y); ctx.stroke();
      }
      ctx.setLineDash([]);
      for (const v of poli) {
        const q = aPantalla(v.X, v.Y);
        ctx.fillStyle = COLOR.snap;
        ctx.beginPath(); ctx.arc(q.x, q.y, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = COLOR.texto; ctx.font = "10px ui-monospace, monospace";
      ctx.fillText(`${poli.length} vértice(s) — doble clic para cerrar`, 8, 16);
    }

    // ventana de seleccion
    if (ventana) {
      const p0 = aPantalla(ventana.x0, ventana.y0), p1 = aPantalla(ventana.x1, ventana.y1);
      const x = Math.min(p0.x, p1.x), y = Math.min(p0.y, p1.y);
      const an = Math.abs(p1.x - p0.x), al = Math.abs(p1.y - p0.y);
      ctx.fillStyle = "rgba(56,189,248,0.12)";
      ctx.fillRect(x, y, an, al);
      ctx.strokeStyle = COLOR.seleccion; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
      ctx.strokeRect(x, y, an, al);
      ctx.setLineDash([]);
    }

    // marca de snap
    if (ultimoSnap && cursor) {
      const s = aPantalla(ultimoSnap.X, ultimoSnap.Y);
      ctx.strokeStyle = COLOR.snap; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(s.x, s.y, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s.x - 10, s.y); ctx.lineTo(s.x + 10, s.y);
      ctx.moveTo(s.x, s.y - 10); ctx.lineTo(s.x, s.y + 10);
      ctx.stroke();
    }

    // paso de grilla, abajo a la izquierda
    ctx.fillStyle = COLOR.texto; ctx.font = "10px ui-monospace, monospace";
    ctx.fillText(`grilla ${paso.toFixed(paso < 0.1 ? 3 : 2)} m`, 8, h - 8);
  }

  // ── Eventos ───────────────────────────────────────────────────────────────
  function posEvento(ev) {
    const r = canvas.getBoundingClientRect();
    return aMundo(ev.clientX - r.left, ev.clientY - r.top);
  }

  function onWheel(ev) {
    ev.preventDefault();
    const r = canvas.getBoundingClientRect();
    const px = ev.clientX - r.left, py = ev.clientY - r.top;
    const antes = aMundo(px, py);
    escala *= ev.deltaY < 0 ? 1.15 : 1 / 1.15;
    escala = Math.min(Math.max(escala, 20), 20000);
    const despues = aMundo(px, py);
    ox += (despues.X - antes.X) * escala;
    oy -= (despues.Y - antes.Y) * escala;
    dibujar();
  }

  function onDown(ev) {
    // SOLO el boton izquierdo dibuja o selecciona. La rueda (1) y el derecho (2)
    // hacen PAN: apretarlos no puede colocar una varilla ni arrastrar un objeto,
    // que es lo que pasaba antes.
    if (ev.button === 1 || ev.button === 2) {
      arrastre = { pan: true, x: ev.clientX, y: ev.clientY };
      canvas.setPointerCapture?.(ev.pointerId);
      ev.preventDefault();
      return;
    }
    if (ev.button !== 0) return;

    const P = posEvento(ev);
    const paso = pasoDeGrilla(canvas.width / escala);

    if (modo === "colocar") {
      cbs.onColocar?.(aplicarSnap(P, paso));
      return;
    }
    if (modo === "polilinea") {
      // Cada clic agrega un vertice; doble clic o Enter la cierra. Es el flujo
      // de cualquier CAD y evita tener que acertarle al primer punto.
      poli.push(aplicarSnap(P, paso));
      dibujar();
      return;
    }
    const obj = objetoEn(P);
    if (obj) {
      // Si ya estaba seleccionado, no se pisa la selección: así se puede
      // arrastrar un grupo entero agarrándolo de cualquiera de sus objetos.
      if (!seleccion.has(obj.i)) cbs.onSeleccionar?.(obj.i, ev.ctrlKey || ev.shiftKey);
      arrastre = { ...obj, desde: P, movido: false };
    } else {
      // Vacío + izquierdo = VENTANA de selección. El pan quedó en el botón
      // derecho y en la rueda.
      ventana = { x0: P.X, y0: P.Y, x1: P.X, y1: P.Y, aditivo: ev.ctrlKey || ev.shiftKey };
      arrastre = { ventana: true };
    }
    canvas.setPointerCapture?.(ev.pointerId);
  }

  function onMove(ev) {
    const P = posEvento(ev);
    cursor = P;
    const paso = pasoDeGrilla(canvas.width / escala);

    if (arrastre?.pan) {
      ox += ev.clientX - arrastre.x;
      oy += ev.clientY - arrastre.y;
      arrastre.x = ev.clientX; arrastre.y = ev.clientY;
      dibujar();
      return;
    }
    if (arrastre?.ventana && ventana) {
      ventana.x1 = P.X; ventana.y1 = P.Y;
      cbs.onCoordenadas?.({ ...P, snap: null });
      dibujar();
      return;
    }
    if (arrastre) {
      const dest = aplicarSnap(P, paso);
      const delta = { dX: dest.X - arrastre.desde.X, dY: dest.Y - arrastre.desde.Y };
      if (Math.abs(delta.dX) > 1e-9 || Math.abs(delta.dY) > 1e-9) {
        arrastre.movido = true;
        cbs.onArrastrar?.(arrastre.i, arrastre.target, dest, delta);
        arrastre.desde = dest;
      }
      cbs.onCoordenadas?.({ ...dest, snap: ultimoSnap?.tipo || null });
      dibujar();
      return;
    }
    hover = objetoEn(P);
    canvas.style.cursor = modo === "colocar" ? "crosshair" : hover ? "move" : "default";
    aplicarSnap(P, paso);
    cbs.onCoordenadas?.({ ...P, snap: ultimoSnap?.tipo || null });
    dibujar();
  }

  function onUp(ev) {
    if (arrastre?.ventana && ventana) {
      const chica = Math.abs(ventana.x1 - ventana.x0) * escala < 3
                 && Math.abs(ventana.y1 - ventana.y0) * escala < 3;
      // Un clic suelto en el vacío (ventana de casi cero) deselecciona.
      cbs.onSeleccionarVarios?.(chica ? [] : shapesEnVentana(ventana), ventana.aditivo);
      ventana = null;
      arrastre = null;
      canvas.releasePointerCapture?.(ev.pointerId);
      dibujar();
      return;
    }
    const movido = arrastre && !arrastre.pan && arrastre.movido;
    arrastre = null;
    canvas.releasePointerCapture?.(ev.pointerId);
    if (movido) cbs.onSoltar?.();
  }

  function onLeave() { cursor = null; ultimoSnap = null; hover = null; cbs.onCoordenadas?.(null); dibujar(); }

  // La rueda apretada suele venir con "auxclick"/scroll del navegador: se corta.
  const onAux = (ev) => { if (ev.button === 1) ev.preventDefault(); };

  // Sin menu contextual: el boton derecho acá es para mover la vista.
  const onContexto = (ev) => ev.preventDefault();

  canvas.addEventListener("contextmenu", onContexto);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  function onDoble(ev) {
    if (modo !== "polilinea") return;
    ev.preventDefault();
    if (poli.length >= 3) cbs.onPolilinea?.(poli.slice());
    poli = [];
    dibujar();
  }

  canvas.addEventListener("dblclick", onDoble);
  canvas.addEventListener("auxclick", onAux);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointerleave", onLeave);

  return {
    /** Carga geometría nueva. `encuadrar` recalcula el zoom. */
    actualizar(nuevaGeo, nuevasShapes, nuevaSeleccion, encuadrar = false) {
      geo = nuevaGeo || { piezas: [], barras: [] };
      shapes = nuevasShapes || [];
      seleccion = new Set(Array.isArray(nuevaSeleccion) ? nuevaSeleccion
        : (nuevaSeleccion === null || nuevaSeleccion === undefined ? [] : [nuevaSeleccion]));
      if (encuadrar) ajustar();
      dibujar();
    },
    ajustar() { ajustar(); dibujar(); },
    setSnap(v) { snapActivo = !!v; dibujar(); },
    setModo(m) {
      modo = m;
      poli = [];
      canvas.style.cursor = (m === "colocar" || m === "polilinea") ? "crosshair" : "default";
      dibujar();
    },
    /** Descarta la polilinea en curso (Esc). */
    cancelarPolilinea() { const habia = poli.length > 0; poli = []; dibujar(); return habia; },
    /** Qué modo está activo (lo consulta el manejo de Esc). */
    getModo() { return modo; },
    destruir() {
      canvas.removeEventListener("contextmenu", onContexto);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDoble);
      canvas.removeEventListener("auxclick", onAux);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    },
  };
}
