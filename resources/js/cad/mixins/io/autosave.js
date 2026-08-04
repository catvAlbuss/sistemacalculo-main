/**
 * autosave.js — Autoguardado local con IndexedDB (resistente a caídas de red).
 *
 * Motivo: si el usuario está dibujando y se cae internet / se refresca / crashea
 * el navegador, el modelo (en memoria: this.nodes/shapes/areas...) se perdería.
 * IndexedDB persiste TODO el modelo en el navegador → 100% offline, sin backend,
 * sin límite práctico de tamaño (los modelos pesan 2-5 MB).
 *
 * Estrategia:
 *  - Se dispara con DEBOUNCE (~2.5 s) tras cada cambio (enganchado a saveUndoState)
 *    + un TIMER de seguridad (~60 s) + al ocultar/cerrar la pestaña.
 *  - Reutiliza exportToJSON() (ya serializa el modelo completo) e importFromJSON().
 *  - Guarda SNAPSHOTS ROTATIVOS (últimos 5) por si uno se corrompe, más un puntero
 *    estable "current".
 *  - Al abrir la app NO interrumpe con ningún diálogo: la recuperación es manual
 *    desde Archivo ▸ Mis modelos.
 *
 * NO reemplaza el guardado manual a .json; es una red de seguridad.
 */

const AUTOSAVE_DB = "etabbs_v3_autosave";
const AUTOSAVE_STORE = "snapshots";
const AUTOSAVE_CURRENT_ID = "current"; // puntero estable al último autoguardado
const AUTOSAVE_DEBOUNCE_MS = 1200;     // ~cada cambio (colapsa ráfagas rápidas)
const AUTOSAVE_INTERVAL_MS = 60000;
const AUTOSAVE_MAX_SNAPSHOTS = 40;     // historial rotativo de cambios (etiquetados)

// ── Autoguardado a BASE DE DATOS (respaldo servidor + multi-dispositivo) ──────
// Complementa al IndexedDB offline. Debounce más largo para no saturar. El
// modelo se envía gzip+base64 (2-5 MB → ~0.5 MB). Requiere internet + sesión.
const SERVER_AUTOSAVE_URL = "/software/etabs/model/autosave";
const SERVER_LATEST_URL = "/software/etabs/model/latest";
const SERVER_MODELS_URL = "/software/etabs/models"; // Fase 2: CRUD "Mis modelos"
const SERVER_DEBOUNCE_MS = 12000;

// Comprime un string a gzip+base64 con la API nativa CompressionStream.
async function gzipToBase64(str) {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  writer.write(new TextEncoder().encode(str));
  writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000; // evita desbordar la pila con arrays grandes
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// Descomprime gzip+base64 de vuelta a string.
async function gunzipFromBase64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const buf = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(buf);
}

function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
}

export const autosaveMixin = {
  // ── IndexedDB helpers ─────────────────────────────────────────────────────
  _openAutosaveDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error("IndexedDB no disponible en este navegador"));
      const req = window.indexedDB.open(AUTOSAVE_DB, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(AUTOSAVE_STORE)) {
          db.createObjectStore(AUTOSAVE_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async _autosavePut(record) {
    const db = await this._openAutosaveDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUTOSAVE_STORE, "readwrite");
      tx.objectStore(AUTOSAVE_STORE).put(record);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  },

  async _autosaveGetAll() {
    const db = await this._openAutosaveDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUTOSAVE_STORE, "readonly");
      const req = tx.objectStore(AUTOSAVE_STORE).getAll();
      req.onsuccess = () => { db.close(); resolve(req.result || []); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  },

  async _autosaveDelete(id) {
    const db = await this._openAutosaveDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUTOSAVE_STORE, "readwrite");
      tx.objectStore(AUTOSAVE_STORE).delete(id);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  },

  // ── Ciclo de vida ─────────────────────────────────────────────────────────
  initAutosave() {
    if (this._autosaveInited) return;
    this._autosaveInited = true;
    this._autosaveDirty = false;
    this._autosaveTimer = null;

    // Estado del autoguardado a servidor (BD).
    this._serverDirty = false;
    this._serverTimer = null;
    this._serverModelId = null;
    this._serverVersion = 0;
    this._serverSaveInFlight = false;
    this._serverAvailable = typeof window.CompressionStream === "function";

    if (!window.indexedDB) {
      console.warn("⚠️ Autoguardado deshabilitado: IndexedDB no disponible.");
      return;
    }

    // Guardado periódico también al servidor (si hay cambios y conexión).
    this._serverInterval = window.setInterval(() => {
      if (this._serverDirty && navigator.onLine) this._doServerAutosave("periodic");
    }, SERVER_DEBOUNCE_MS);

    // Pide almacenamiento PERSISTENTE: sin esto el navegador PODRÍA borrar los
    // datos bajo presión de disco (modo "best-effort"). Con esto no los evita
    // salvo que el usuario borre datos del sitio a mano. El dato dura indefinido.
    try {
      navigator.storage?.persist?.().then((granted) => {
        console.log(granted
          ? "🔒 Autoguardado: almacenamiento persistente concedido."
          : "ℹ️ Autoguardado: almacenamiento best-effort (puede evictarse con disco lleno).");
      }).catch(() => {});
    } catch (_e) { /* noop */ }

    // Timer de seguridad: guarda si hay cambios pendientes.
    this._autosaveInterval = window.setInterval(() => {
      if (this._autosaveDirty) this._doAutosave("periodic");
    }, AUTOSAVE_INTERVAL_MS);

    // Guardar al ocultar la pestaña (más fiable que beforeunload para async).
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && this._autosaveDirty) {
        this._doAutosave("hidden");
      }
    });
    window.addEventListener("beforeunload", () => {
      // Best-effort: marca y lanza (puede no completar el async al cerrar).
      if (this._autosaveDirty) this._doAutosave("beforeunload");
      if (this._serverDirty && navigator.onLine) this._doServerAutosave("beforeunload");
    });

    // Sincroniza id/versión del último modelo del servidor. No ofrece recuperar
    // nada: para eso está Archivo ▸ Mis modelos.
    window.setTimeout(() => this._syncServerAutosaveState(), 1000);
  },

  /** Marca el modelo como sucio y agenda un autoguardado con debounce. */
  scheduleAutosave(label = "") {
    if (!this._autosaveInited || !window.indexedDB) return;
    this._autosaveDirty = true;
    this._autosaveLabel = label || this._autosaveLabel || "cambio";
    if (this._autosaveTimer) window.clearTimeout(this._autosaveTimer);
    this._autosaveTimer = window.setTimeout(() => this._doAutosave("debounce"), AUTOSAVE_DEBOUNCE_MS);

    // Autoguardado a servidor (BD): debounce más largo, solo si hay compresión.
    if (this._serverAvailable) {
      this._serverDirty = true;
      if (this._serverTimer) window.clearTimeout(this._serverTimer);
      this._serverTimer = window.setTimeout(() => {
        if (navigator.onLine) this._doServerAutosave("debounce");
      }, SERVER_DEBOUNCE_MS);
    }
  },

  async _doAutosave(reason = "auto") {
    try {
      if (typeof this.exportToJSON !== "function") return;
      const data = this.exportToJSON();
      if (!data) return;

      const nodeCount = data.model?.nodes?.length ?? data.nodes?.length ?? 0;
      // Guardia: no pisar un autoguardado bueno con un modelo vacío (p.ej. tras
      // "Nuevo"). El puntero "current" solo se refresca si hay contenido.
      const now = Date.now();
      const record = {
        savedAt: new Date().toISOString(),
        ts: now,
        reason,
        label: this._autosaveLabel || "cambio", // etiqueta de la acción (undo)
        name: this.currentFileName || "modelo",
        nodeCount,
        data,
      };

      // Snapshot rotativo (siempre) + puntero estable "current" (solo con contenido).
      await this._autosavePut({ ...record, id: `snap_${now}` });
      if (nodeCount > 0) {
        await this._autosavePut({ ...record, id: AUTOSAVE_CURRENT_ID });
      }

      this._autosaveDirty = false;
      this._autosaveLastTs = now;
      this._pruneAutosaveSnapshots();
      this._updateAutosaveIndicator(now);
      console.log("💾 Autoguardado local:", { reason, nodeCount, at: record.savedAt });
    } catch (error) {
      console.warn("⚠️ Autoguardado falló:", error);
    }
  },

  // Autoguardado a la BASE DE DATOS (respaldo servidor). Requiere conexión y
  // sesión. Envía el modelo gzip+base64. No bloquea el flujo (best-effort).
  // `silent=false` (usado por saveNow()) además avisa al usuario con showMessage.
  async _doServerAutosave(reason = "auto", { silent = true } = {}) {
    if (!this._serverAvailable) {
      if (!silent) this.showMessage?.("⚠️ Tu navegador no soporta el guardado en la nube.", "warning");
      return;
    }
    if (!navigator.onLine) {
      if (!silent) this.showMessage?.("⚠️ Sin conexión: no se pudo guardar en la nube.", "warning");
      return;
    }
    if (this._serverSaveInFlight) {
      // Ya hay un guardado en curso: el timer PERIÓDICO (cada SERVER_DEBOUNCE_MS)
      // y el debounce de edición corren en relojes independientes y pueden
      // superponerse. Si disparamos dos POST en paralelo, ambos parten de la
      // MISMA `version`; el que responde segundo llega con una versión ya
      // vieja y el servidor lo rechaza con 409 (aunque no hubo edición en
      // otra pestaña/dispositivo). Dejamos `_serverDirty` para que el
      // próximo timer recoja el cambio en vez de duplicar el request.
      this._serverDirty = true;
      return;
    }
    this._serverSaveInFlight = true;
    try {
      if (typeof this.exportToJSON !== "function") return;
      const model = this.exportToJSON();
      if (!model) return;
      const nodeCount = model.model?.nodes?.length ?? model.nodes?.length ?? 0;
      if (nodeCount < 1) {
        if (!silent) this.showMessage?.("⚠️ No hay modelo para guardar.", "warning");
        return; // no pisar el servidor con un modelo vacío
      }

      // El respaldo en la NUBE no necesita la geometría pesada del plano
      // importado (segments/vertices — pueden ser miles tras expandir bloques
      // de un DWG real). Subirla infla el payload, hace el POST más lento y
      // aumenta la chance de que dos autoguardados se crucen y choquen en
      // versión (409 Conflict). Se sube solo metadata liviana; la copia LOCAL
      // (IndexedDB, _doAutosave) sí guarda el plano completo — si el usuario
      // restaura desde la nube en otra máquina, tendría que reimportar el
      // archivo DXF/DWG (decisión aceptada explícitamente por el usuario).
      const importedPlan = model.model?.importedPlan;
      if (importedPlan) {
        model.model.importedPlan = {
          fileName: importedPlan.fileName,
          unitToMeters: importedPlan.unitToMeters,
          opacity: importedPlan.opacity,
          visible: importedPlan.visible,
          bounds: importedPlan.bounds,
        };
      }

      const compressed = await gzipToBase64(JSON.stringify(model));
      const resp = await fetch(SERVER_AUTOSAVE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken(),
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: this._serverModelId || null, // null → el servidor crea uno nuevo
          data: compressed,
          is_compressed: true,
          name: this.currentFileName || "modelo",
          node_count: nodeCount,
          version: this._serverVersion || 0,
        }),
      });

      if (resp.status === 409) {
        // Otra pestaña/dispositivo guardó una versión más nueva.
        const info = await resp.json().catch(() => ({}));
        this._serverVersion = info.server_version || this._serverVersion;
        console.warn("⚠️ Autoguardado servidor: versión más nueva en el servidor (conflicto).", info);
        if (!silent) this.showMessage?.("⚠️ Hay una versión más nueva en la nube (guardada desde otro dispositivo).", "warning");
        return;
      }
      if (resp.status === 401 || resp.status === 419) {
        // Sesión expirada / no autenticado → deshabilitar hasta recargar.
        this._serverAvailable = false;
        console.warn("ℹ️ Autoguardado servidor deshabilitado (sesión no válida).");
        if (!silent) this.showMessage?.("⚠️ Tu sesión expiró: recarga la página para guardar en la nube.", "warning");
        return;
      }
      if (!resp.ok) {
        console.warn("⚠️ Autoguardado servidor falló:", resp.status);
        if (!silent) this.showMessage?.(`⚠️ No se pudo guardar en la nube (${resp.status}).`, "warning");
        return;
      }

      const out = await resp.json();
      this._serverModelId = out.id ?? this._serverModelId;
      this._serverVersion = out.version ?? (this._serverVersion + 1);
      this._serverDirty = false;
      console.log("☁️ Autoguardado en servidor:", { reason, nodeCount, version: this._serverVersion });
      if (!silent) this.showMessage?.(`☁️ Modelo guardado en la nube ("${this.currentFileName || "modelo"}").`);
    } catch (error) {
      console.warn("⚠️ Autoguardado servidor error:", error);
      if (!silent) this.showMessage?.("⚠️ Error guardando en la nube: " + error.message, "warning");
    } finally {
      this._serverSaveInFlight = false;
    }
  },

  /** Guarda AHORA (manual) el modelo actual en la nube, con feedback visual. */
  async saveNow() {
    if (this._serverTimer) window.clearTimeout(this._serverTimer);
    await this._doServerAutosave("manual", { silent: false });
  },

  async _pruneAutosaveSnapshots() {
    try {
      const all = (await this._autosaveGetAll()).filter((r) => String(r.id).startsWith("snap_"));
      all.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      for (const old of all.slice(AUTOSAVE_MAX_SNAPSHOTS)) {
        await this._autosaveDelete(old.id);
      }
    } catch (error) {
      console.warn("No se pudieron podar snapshots de autoguardado:", error);
    }
  },

  // Historial de cambios guardados (newest-first, SIN el blob de datos).
  // Base para una futura UI "Historial de cambios" (restaurar cualquier punto).
  async getAutosaveHistory() {
    try {
      const all = await this._autosaveGetAll();
      return all
        .filter((r) => String(r.id).startsWith("snap_"))
        .map((r) => ({ id: r.id, ts: r.ts, savedAt: r.savedAt, label: r.label || "cambio", name: r.name, nodeCount: r.nodeCount || 0 }))
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));
    } catch (_e) {
      return [];
    }
  },

  // Restaura un snapshot concreto del historial por id.
  async restoreAutosaveSnapshot(id) {
    try {
      const all = await this._autosaveGetAll();
      const rec = all.find((r) => r.id === id);
      if (!rec || !rec.data || typeof this.importFromJSON !== "function") return false;
      this.importFromJSON(rec.data);
      this.currentFileName = rec.name || this.currentFileName;
      this.sync3D?.();
      this.render?.();
      this.showMessage?.(`↩️ Restaurado: "${rec.label || "cambio"}" (${new Date(rec.ts).toLocaleTimeString()})`);
      return true;
    } catch (error) {
      console.warn("No se pudo restaurar snapshot:", error);
      return false;
    }
  },

  _updateAutosaveIndicator(ts) {
    const el = document.getElementById("autosave-indicator");
    if (!el) return;
    const t = new Date(ts).toLocaleTimeString();
    el.textContent = `Autoguardado ${t}`;
    el.style.opacity = "1";
    if (this._autosaveIndicatorTimer) window.clearTimeout(this._autosaveIndicatorTimer);
    this._autosaveIndicatorTimer = window.setTimeout(() => { el.style.opacity = "0.4"; }, 2500);
  },

  /**
   * Al abrir, adopta el id/versión del último modelo del servidor para que el
   * autoguardado actualice ESE registro en vez de crear uno nuevo (y no choque
   * con un 409 por versión desfasada). No carga ni ofrece cargar nada: la
   * recuperación es manual desde Archivo ▸ Mis modelos.
   */
  async _syncServerAutosaveState() {
    try {
      if (!this._serverAvailable || !navigator.onLine) return;
      const server = await this._fetchServerLatest();
      if (!server) return;
      this._serverVersion = server.version || 0;
      this._serverModelId = server.id || null;
    } catch (error) {
      console.warn("No se pudo sincronizar el autoguardado del servidor:", error);
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  FASE 2 — "Mis modelos" (nube): listar / abrir / guardar como / renombrar /
  //  borrar. El modelo ACTUAL se identifica con `_serverModelId`; el autoguardado
  //  actualiza ese id (si es null, el servidor crea uno nuevo).
  // ══════════════════════════════════════════════════════════════════════════

  /** Abre el modal "Mis modelos". */
  openMyModels() {
    window.dispatchEvent(new CustomEvent("open-my-models-modal"));
  },

  _cloudHeaders(json = false) {
    const h = { "X-CSRF-TOKEN": csrfToken(), "X-Requested-With": "XMLHttpRequest", Accept: "application/json" };
    if (json) h["Content-Type"] = "application/json";
    return h;
  },

  /** Lista los modelos del usuario (sin el blob). */
  async listCloudModels() {
    const resp = await fetch(SERVER_MODELS_URL, { headers: this._cloudHeaders() });
    if (!resp.ok) throw new Error(`No se pudo listar (${resp.status})`);
    const out = await resp.json();
    return out.models || [];
  },

  /** Abre un modelo de la nube y lo carga en el CAD. */
  async openCloudModel(id) {
    const resp = await fetch(`${SERVER_MODELS_URL}/${id}`, { headers: this._cloudHeaders() });
    if (!resp.ok) throw new Error(`No se pudo abrir (${resp.status})`);
    const out = await resp.json();
    if (!out.data) throw new Error("El modelo no tiene datos.");
    const json = out.is_compressed ? await gunzipFromBase64(out.data) : out.data;
    const data = typeof json === "string" ? JSON.parse(json) : json;

    if (typeof this.importFromJSON !== "function") throw new Error("Import no disponible.");
    this.importFromJSON(data);
    this.currentFileName = out.name || this.currentFileName;
    // A partir de aquí el autoguardado actualiza ESTE modelo.
    this._serverModelId = out.id;
    this._serverVersion = out.version || 0;
    this._serverDirty = false;
    this.sync3D?.();
    this.render?.();
    this.showMessage?.(`☁️ Modelo "${out.name}" abierto desde la nube.`);
    return out;
  },

  /** Guarda el modelo actual como uno NUEVO en la nube (Guardar como). */
  async saveAsCloudModel(name) {
    if (!this._serverAvailable) throw new Error("Compresión no disponible en este navegador.");
    const model = this.exportToJSON?.();
    if (!model) throw new Error("No hay modelo para guardar.");
    const nodeCount = model.model?.nodes?.length ?? model.nodes?.length ?? 0;
    const compressed = await gzipToBase64(JSON.stringify(model));

    const resp = await fetch(SERVER_MODELS_URL, {
      method: "POST",
      headers: this._cloudHeaders(true),
      body: JSON.stringify({ data: compressed, is_compressed: true, name, node_count: nodeCount }),
    });
    if (!resp.ok) throw new Error(`No se pudo guardar (${resp.status})`);
    const out = await resp.json();
    // El modelo actual pasa a ser el recién creado.
    this._serverModelId = out.id;
    this._serverVersion = out.version || 1;
    this._serverDirty = false;
    this.currentFileName = out.name || name;
    this.showMessage?.(`Guardado en la nube como "${out.name}".`);
    return out;
  },

  /** Renombra un modelo de la nube. */
  async renameCloudModel(id, name) {
    const resp = await fetch(`${SERVER_MODELS_URL}/${id}`, {
      method: "PUT",
      headers: this._cloudHeaders(true),
      body: JSON.stringify({ name }),
    });
    if (!resp.ok) throw new Error(`No se pudo renombrar (${resp.status})`);
    const out = await resp.json();
    if (this._serverModelId === id) this.currentFileName = out.name;
    return out;
  },

  /** Borra un modelo de la nube. */
  async deleteCloudModel(id) {
    const resp = await fetch(`${SERVER_MODELS_URL}/${id}`, {
      method: "DELETE",
      headers: this._cloudHeaders(),
    });
    if (!resp.ok) throw new Error(`No se pudo borrar (${resp.status})`);
    // Si borré el modelo actual, el próximo autoguardado creará uno nuevo.
    if (this._serverModelId === id) { this._serverModelId = null; this._serverVersion = 0; }
    return true;
  },

  /** Desliga el modelo actual de la nube (el próximo autoguardado crea uno nuevo). */
  detachCloudModel() {
    this._serverModelId = null;
    this._serverVersion = 0;
  },

  // Lee el último modelo del usuario desde la BD y lo descomprime.
  async _fetchServerLatest() {
    try {
      const resp = await fetch(SERVER_LATEST_URL, {
        headers: { "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      });
      if (!resp.ok) return null;
      const out = await resp.json();
      if (!out || !out.exists || !out.data) return null;
      const json = out.is_compressed ? await gunzipFromBase64(out.data) : out.data;
      const data = typeof json === "string" ? JSON.parse(json) : json;
      return {
        source: "server",
        data,
        ts: out.last_saved_at ? new Date(out.last_saved_at).getTime() : 0,
        name: out.name || "modelo",
        nodeCount: out.node_count || (data.model?.nodes?.length ?? 0),
        version: out.version || 0,
        id: out.id || null,
      };
    } catch (e) {
      console.warn("No se pudo leer el modelo del servidor:", e);
      return null;
    }
  },
};
