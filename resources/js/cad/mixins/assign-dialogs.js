import Swal from "sweetalert2";

/**
 * @mixin assignDialogsMixin
 *
 * Todos los diálogos de asignación de propiedades a objetos del modelo.
 *
 * Cada método `openAssign*Dialog()` abre un diálogo Swal con un formulario
 * para que el usuario defina propiedades y las aplica a los objetos
 * seleccionados. El patrón es siempre el mismo:
 *   1. Verifica que haya objetos seleccionados.
 *   2. Muestra el diálogo con los valores actuales precargados.
 *   3. Al confirmar, actualiza obj.assignment y llama a redraw/sync3D.
 *
 * Responsabilidades (por categoría):
 *
 * Joints / Puntos:
 * - openAssignJointRestraintsDialog()       → apoyos y condiciones de frontera
 * - openAssignJointDiaphragmsDialog()       → diafragmas rígidos
 * - openAssignPointSpringsDialog()          → resortes puntuales
 * - openAssignJointPointForceDialog()       → cargas puntuales en nudos
 * - openAssignJointGroundDisplacementDialog() → desplazamientos de apoyo
 * - openAssignJointTemperatureDialog()      → temperatura en nudos
 *
 * Frames / Líneas:
 * - openAssignFrameSectionDialog()          → sección transversal
 * - openAssignFrameReleasesDialog()         → liberaciones de extremo (rótulas)
 * - openAssignFrameEndOffsetsDialog()       → excentricidades de extremo
 * - openAssignFramePointLoadDialog()        → carga puntual en tramo
 * - openAssignFrameDistributedLoadDialog()  → carga distribuida en tramo
 * - openAssignFrameTemperatureLoadDialog()  → carga de temperatura en tramo
 *
 * Grupos:
 * - openAssignGroupNamesDialog()            → asigna objetos a grupos con nombre
 * - showSelectedAssignmentsSummary()        → muestra un resumen de las asignaciones
 *
 * Auxiliares:
 * - getDefaultFrameSectionsForAssign()      → lista de secciones disponibles
 * - getAvailableFrameSectionsForAssign()    → secciones filtradas para asignación
 * - getSelectedFramesForAssign()            → frames seleccionados para asignación
 */
export const assignDialogsMixin = {

  // Default ETABS load patterns (para compatibilidad con importación/exportación)
  getEtabsReferenceLoadPatterns() {
    return [
      { name: "CM", type: "DEAD", implemented: true },
      { name: "CVE", type: "LIVE", implemented: true },
      { name: "CVT", type: "LIVE", implemented: true },

      // Pendientes para completar el flujo tipo ETABS
      { name: "SEX", type: "Seismic X", implemented: false },
      { name: "SEY", type: "Seismic Y", implemented: false },
    ];
  },

  getDefaultFrameSectionsForAssign() {
    return [
      {
        id: "VIGA_25X50",
        name: "VIGA 25x50",
        type: "concrete-rectangular",
        b: 0.25,
        h: 0.5,
        A: 0.125,
      },
      {
        id: "COLUMNA_30X30",
        name: "COLUMNA 30x30",
        type: "concrete-rectangular",
        b: 0.3,
        h: 0.3,
        A: 0.09,
      },
      {
        id: "VIGA_30X60",
        name: "VIGA 30x60",
        type: "concrete-rectangular",
        b: 0.3,
        h: 0.6,
        A: 0.18,
      },
    ];
  },

  getAvailableFrameSectionsForAssign() {
    const definedSections = this.frameSections?.sections;

    if (Array.isArray(definedSections) && definedSections.length > 0) {
      return definedSections.map((section, index) => {
        const id = section.id || section.sectionId || section.name || section.nombre || `SECTION_${index + 1}`;

        const name = section.name || section.nombre || section.sectionName || String(id);

        const b = Number(section.b ?? section.width ?? section.base ?? 0);
        const h = Number(section.h ?? section.height ?? section.peralte ?? 0);
        const A = Number(section.A ?? section.area ?? (b && h ? b * h : 0));

        const Iz = section.Iz ?? section.Izz ?? null;
        const Iy = section.Iy ?? section.Iyy ?? null;
        const J = section.J ?? null;

        return {
          ...section,
          id,
          name,
          b,
          h,
          A,
          Iz,
          Iy,
          J,
        };
      });
    }

    return this.getDefaultFrameSectionsForAssign();
  },

  getFrameSectionForAssignById(sectionId) {
    return (
      this.getAvailableFrameSectionsForAssign().find((section) => {
        return (
          String(section.id) === String(sectionId) ||
          String(section.name) === String(sectionId) ||
          String(section.sectionName) === String(sectionId)
        );
      }) || null
    );
  },

  getSelectedFramesForAssign() {
    const isFrame = (obj) => {
      if (!obj) return false;

      const type = String(obj.elementType || obj.type || obj.objectType || obj.constructor?.name || "").toLowerCase();

      const hasFrameGeometry = obj.node1 && obj.node2;

      return (
        hasFrameGeometry ||
        type === "beam" ||
        type === "column" ||
        type === "brace" ||
        type === "secondary-beam" ||
        type === "secondarybeam" ||
        type === "frame" ||
        type === "line"
      );
    };

    // La asignación NO debe depender de la vista 2D activa: en el 3D se
    // seleccionan vigas de varios pisos con Ctrl + clic izquierdo, y
    // getSelectedObjects() filtra por vista activa (respectActiveView:true),
    // descartándolas. Aquí se toma la selección de edición SIN ese filtro y se
    // refuerza con la lista de multiselección (2D/3D).
    const sources = [];

    if (typeof this.getEditSelectedObjects === "function") {
      sources.push(...this.getEditSelectedObjects({ respectActiveView: false }));
    } else {
      sources.push(...(this.getSelectedObjects?.() || []));
    }

    if (Array.isArray(this.multiSelectedFrames)) {
      sources.push(...this.multiSelectedFrames);
    }

    const result = [];
    const seen = new Set();

    sources.forEach((obj) => {
      if (!isFrame(obj)) return;

      const key = obj.id != null ? String(obj.id) : obj;
      if (seen.has(key)) return;

      seen.add(key);
      result.push(obj);
    });

    return result;
  },

  async openAssignFrameSectionDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const sections = this.getAvailableFrameSectionsForAssign();

    if (!sections.length) {
      this.showMessage?.("No hay secciones disponibles. Primero crea una sección en Define.", "warning");
      return;
    }

    const inputOptions = {};

    sections.forEach((section) => {
      inputOptions[section.id] = `${section.name}${section.A ? ` | A=${section.A}` : ""}`;
    });

    const result = await Swal.fire({
      title: "Assign Frame Section",
      input: "select",
      inputOptions,
      inputPlaceholder: "Selecciona una sección",
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameSectionToSelected(result.value);
  },

  assignFrameSectionToSelected(sectionId) {
    const section = this.getFrameSectionForAssignById(sectionId);

    if (!section) {
      this.showMessage?.("La sección seleccionada no existe.", "warning");
      console.warn("Frame Section no encontrada:", sectionId);
      return;
    }

    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    selectedFrames.forEach((frame) => {
      frame.sectionId = section.id;
      frame.sectionName = section.name;
      frame.frameSection = { ...section };

      // Compatibilidad con exportación, selección y cálculo
      frame.section = { ...section };

      frame.A = section.A ?? section.area ?? frame.A ?? null;
      frame._A = section.A ?? section.area ?? frame._A ?? null;

      // Inercias y torsión: el motor sísmico (seismic_analysis.py) las lee
      // por elemento (Iz/Iy/J). Sin esto el frame se analiza con la rigidez
      // por defecto del motor en vez de la de la sección asignada.
      frame.Iz = section.Iz ?? section.Izz ?? frame.Iz ?? null;
      frame.Iy = section.Iy ?? section.Iyy ?? frame.Iy ?? null;
      frame.J = section.J ?? frame.J ?? null;

      // Módulo elástico tomado del MATERIAL de la sección (antes quedaba en el
      // globalE viejo y el panel mostraba un valor desfasado del que definiste).
      const matRes = this._resolveFrameMaterial?.(section, frame);
      if (matRes && Number.isFinite(matRes.E)) {
        frame.E = matRes.E;
        if (matRes.materialName) frame.materialName = matRes.materialName;
      }

      frame.hasAssignedSection = true;

      // Para que sea fácil verificar en tablas o depuración
      frame.assignment = {
        ...(frame.assignment || {}),
        frameSection: {
          id: section.id,
          name: section.name,
        },
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    // Evitamos sync3D directo si te genera parpadeo o zoom automático.
    // Pero si tu 3D ya está estable, puedes descomentar:
    // this.sync3D?.();

    this.showMessage?.(`Se asignó ${section.name} a ${selectedFrames.length} elemento(s) Frame / Line.`);

    console.log("✅ Frame Section asignada:", {
      section,
      selectedFrames,
    });
  },

  // =====================================================
  // PROPAGACIÓN AUTOMÁTICA  material → sección → frame
  // (al editar un material o una sección, los elementos que la usan se
  //  actualizan solos, sin tener que volver a seleccionarlos y re-asignar)
  // =====================================================

  // Todos los frames del modelo (líneas con dos nodos).
  _allFramesForPropagation() {
    return (this.shapes || []).filter((f) => f && f.node1 && f.node2);
  },

  // ¿El frame usa esta sección? (por id o por cualquiera de los nombres)
  _frameUsesSection(frame, section) {
    const sid = section.id, sname = section.name;
    return (
      (sid != null && String(frame.sectionId) === String(sid)) ||
      (sname && (
        String(frame.sectionName) === String(sname) ||
        String(frame.frameSection?.name) === String(sname) ||
        String(frame.section?.name) === String(sname)))
    );
  },

  // Re-aplica geometría de la sección + E del material a TODOS los frames que la
  // usan. Llamar al editar la sección. Devuelve cuántos frames se actualizaron.
  refreshFramesForSection(section) {
    if (!section) return 0;
    let n = 0;
    this._allFramesForPropagation().forEach((frame) => {
      if (!this._frameUsesSection(frame, section)) return;

      frame.frameSection = { ...section };
      frame.section = { ...section };
      frame.sectionId = section.id ?? frame.sectionId;
      frame.sectionName = section.name ?? frame.sectionName;
      frame.A = section.A ?? section.area ?? frame.A;
      frame._A = frame.A;
      frame.Iz = section.Iz ?? section.Izz ?? frame.Iz;
      frame.Iy = section.Iy ?? section.Iyy ?? frame.Iy;
      frame.J = section.J ?? frame.J;

      const matRes = this._resolveFrameMaterial?.(section, frame);
      if (matRes && Number.isFinite(matRes.E)) {
        frame.E = matRes.E;
        if (matRes.materialName) frame.materialName = matRes.materialName;
      }
      n++;
    });
    if (n) {
      this.markAnalysisResultsOutdated?.("Se editó una sección usada por elementos del modelo.");
      this.redraw?.();
    }
    return n;
  },

  // Al editar un MATERIAL: refresca las secciones que lo usan y, en cadena, los
  // frames de esas secciones. Devuelve cuántos frames se actualizaron.
  refreshFramesForMaterial(materialName) {
    if (!materialName) return 0;
    const sections = (this.frameSections?.sections || []).filter((s) =>
      String(s.material ?? s.materialName ?? s.materialProperty ?? s.mat ?? "") === String(materialName));

    let n = 0;
    sections.forEach((s) => { n += this.refreshFramesForSection(s); });

    // Frames que referencian el material directamente (sin sección con material).
    this._allFramesForPropagation().forEach((frame) => {
      if (String(frame.materialName ?? "") !== String(materialName)) return;
      const matRes = this._resolveFrameMaterial?.(frame.frameSection || frame.section || {}, frame);
      if (matRes && Number.isFinite(matRes.E)) { frame.E = matRes.E; n++; }
    });

    if (n) {
      this.markAnalysisResultsOutdated?.("Se editó un material usado por elementos del modelo.");
      this.redraw?.();
    }
    return n;
  },

  // =====================================================
  // ASSIGN > FRAME / LINE > FRAME RELEASES / PARTIAL FIXITY
  // =====================================================

  getDefaultFrameReleases() {
    return {
      iEnd: {
        axial: false,
        shear2: false,
        shear3: false,
        torsion: false,
        moment22: false,
        moment33: false,
      },
      jEnd: {
        axial: false,
        shear2: false,
        shear3: false,
        torsion: false,
        moment22: false,
        moment33: false,
      },
      partialFixity: {
        enabled: false,
        iEnd: {
          axial: null,
          shear2: null,
          shear3: null,
          torsion: null,
          moment22: null,
          moment33: null,
        },
        jEnd: {
          axial: null,
          shear2: null,
          shear3: null,
          torsion: null,
          moment22: null,
          moment33: null,
        },
      },
    };
  },

  async openAssignFrameReleasesDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Assign Frame Releases / Partial Fixity",
      width: 760,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:10px;">
          Selecciona los grados de libertad liberados en el extremo I y/o J del elemento Frame / Line.
        </p>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Grado de libertad</th>
              <th style="border:1px solid #555; padding:6px;">Extremo I</th>
              <th style="border:1px solid #555; padding:6px;">Extremo J</th>
            </tr>
          </thead>

          <tbody>
            ${this.buildFrameReleaseRow("Axial / P", "axial")}
            ${this.buildFrameReleaseRow("Shear 2 / V2", "shear2")}
            ${this.buildFrameReleaseRow("Shear 3 / V3", "shear3")}
            ${this.buildFrameReleaseRow("Torsion / T", "torsion")}
            ${this.buildFrameReleaseRow("Moment 22 / M2", "moment22")}
            ${this.buildFrameReleaseRow("Moment 33 / M3", "moment33")}
          </tbody>
        </table>

        <div style="margin-top:14px; padding:10px; border:1px solid #555; border-radius:6px;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input id="partial-fixity-enabled" type="checkbox">
            Activar Partial Fixity / Resortes rotacionales iniciales
          </label>

          <p style="font-size:12px; color:#777; margin-top:6px;">
            En esta primera versión se guardará la configuración, pero el cálculo estructural lo usará después cuando conectemos el motor de análisis.
          </p>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Elementos seleccionados: <b>${selectedFrames.length}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readFrameReleasesFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameReleasesToSelected(result.value);
  },

  buildFrameReleaseRow(label, key) {
    return `
    <tr>
      <td style="border:1px solid #555; padding:6px;">${label}</td>
      <td style="border:1px solid #555; padding:6px; text-align:center;">
        <input type="checkbox" id="release-i-${key}">
      </td>
      <td style="border:1px solid #555; padding:6px; text-align:center;">
        <input type="checkbox" id="release-j-${key}">
      </td>
    </tr>
  `;
  },

  readFrameReleasesFromDialog() {
    const keys = ["axial", "shear2", "shear3", "torsion", "moment22", "moment33"];

    const releases = this.getDefaultFrameReleases();

    keys.forEach((key) => {
      releases.iEnd[key] = document.getElementById(`release-i-${key}`)?.checked === true;
      releases.jEnd[key] = document.getElementById(`release-j-${key}`)?.checked === true;
    });

    releases.partialFixity.enabled = document.getElementById("partial-fixity-enabled")?.checked === true;

    return releases;
  },

  assignFrameReleasesToSelected(releases) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    selectedFrames.forEach((frame) => {
      frame.releases = JSON.parse(JSON.stringify(releases));

      // Nombre compatible con ETABS / depuración
      frame.frameReleases = JSON.parse(JSON.stringify(releases));

      frame.assignment = {
        ...(frame.assignment || {}),
        frameReleases: JSON.parse(JSON.stringify(releases)),
      };

      frame.hasFrameReleases = this.frameHasAnyRelease(releases);
    });

    this.redraw?.();

    this.showMessage?.(`Frame Releases asignado a ${selectedFrames.length} elemento(s) Frame / Line.`);

    console.log("✅ Frame Releases asignados:", {
      releases,
      selectedFrames,
    });
  },

  frameHasAnyRelease(releases) {
    if (!releases) return false;

    const keys = ["axial", "shear2", "shear3", "torsion", "moment22", "moment33"];

    const hasIRelease = keys.some((key) => releases.iEnd?.[key] === true);
    const hasJRelease = keys.some((key) => releases.jEnd?.[key] === true);

    return hasIRelease || hasJRelease || releases.partialFixity?.enabled === true;
  },

  // =====================================================
  // ASSIGN > FRAME / LINE > END (LENGTH) OFFSETS
  // =====================================================

  getDefaultFrameEndOffsets() {
    return {
      autoOffset: false,

      iEnd: {
        offsetLength: 0,
        rigidZoneFactor: 0,
      },

      jEnd: {
        offsetLength: 0,
        rigidZoneFactor: 0,
      },

      useRigidZoneFactor: false,
    };
  },

  async openAssignFrameEndOffsetsDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const current =
      selectedFrames[0]?.endOffsets || selectedFrames[0]?.frameEndOffsets || this.getDefaultFrameEndOffsets();

    const result = await Swal.fire({
      title: "Assign End (Length) Offsets",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna offsets de longitud en los extremos I y J del elemento Frame / Line.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input id="offset-auto" type="checkbox" ${current.autoOffset ? "checked" : ""}>
            Automatic from Connectivity
          </label>

          <p style="font-size:12px; color:#777; margin-top:6px;">
            En esta versión inicial, esta opción solo queda guardada como propiedad del elemento.
          </p>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Extremo</th>
              <th style="border:1px solid #555; padding:6px;">Offset Length</th>
              <th style="border:1px solid #555; padding:6px;">Rigid Zone Factor</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">I-End</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="offset-i-length" type="number" step="0.001"
                  value="${current.iEnd?.offsetLength ?? 0}"
                  style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="offset-i-rigid" type="number" step="0.01" min="0" max="1"
                  value="${current.iEnd?.rigidZoneFactor ?? 0}"
                  style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">J-End</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="offset-j-length" type="number" step="0.001"
                  value="${current.jEnd?.offsetLength ?? 0}"
                  style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="offset-j-rigid" type="number" step="0.01" min="0" max="1"
                  value="${current.jEnd?.rigidZoneFactor ?? 0}"
                  style="width:100%; padding:5px;">
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:12px;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input id="offset-use-rigid-zone" type="checkbox" ${current.useRigidZoneFactor ? "checked" : ""}>
            Use Rigid Zone Factor
          </label>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Elementos seleccionados: <b>${selectedFrames.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readFrameEndOffsetsFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameEndOffsetsToSelected(result.value);
  },

  readFrameEndOffsetsFromDialog() {
    return {
      autoOffset: document.getElementById("offset-auto")?.checked === true,

      iEnd: {
        offsetLength: Number(document.getElementById("offset-i-length")?.value || 0),
        rigidZoneFactor: Number(document.getElementById("offset-i-rigid")?.value || 0),
      },

      jEnd: {
        offsetLength: Number(document.getElementById("offset-j-length")?.value || 0),
        rigidZoneFactor: Number(document.getElementById("offset-j-rigid")?.value || 0),
      },

      useRigidZoneFactor: document.getElementById("offset-use-rigid-zone")?.checked === true,
    };
  },

  assignFrameEndOffsetsToSelected(endOffsets) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    selectedFrames.forEach((frame) => {
      frame.endOffsets = JSON.parse(JSON.stringify(endOffsets));
      frame.frameEndOffsets = JSON.parse(JSON.stringify(endOffsets));

      frame.assignment = {
        ...(frame.assignment || {}),
        frameEndOffsets: JSON.parse(JSON.stringify(endOffsets)),
      };

      frame.hasEndOffsets = this.frameHasEndOffsets(endOffsets);
    });

    this.redraw?.();

    this.showMessage?.(`End Offsets asignado a ${selectedFrames.length} elemento(s) Frame / Line.`);

    console.log("✅ End Offsets asignados:", {
      endOffsets,
      selectedFrames,
    });
  },

  frameHasEndOffsets(endOffsets) {
    if (!endOffsets) return false;

    const iLength = Number(endOffsets.iEnd?.offsetLength || 0);
    const jLength = Number(endOffsets.jEnd?.offsetLength || 0);

    const iRigid = Number(endOffsets.iEnd?.rigidZoneFactor || 0);
    const jRigid = Number(endOffsets.jEnd?.rigidZoneFactor || 0);

    return (
      endOffsets.autoOffset === true ||
      endOffsets.useRigidZoneFactor === true ||
      iLength > 0 ||
      jLength > 0 ||
      iRigid > 0 ||
      jRigid > 0
    );
  },

  // =====================================================
  // ASSIGN > JOINT / POINT > RESTRAINTS (SUPPORTS)
  // =====================================================

  getSelectedJointsForAssign() {
    const selectedObjects = this.getSelectedObjects?.() || [];

    return selectedObjects.filter((obj) => {
      if (!obj) return false;

      const type = String(obj.objectType || obj.type || obj.elementType || obj.constructor?.name || "").toLowerCase();

      const hasPosition = !!obj.position;
      const isFrame = obj.node1 && obj.node2;

      return (
        !isFrame &&
        (hasPosition ||
          obj.isNode === true ||
          type === "node" ||
          type === "structuralnode" ||
          type === "joint" ||
          type === "point")
      );
    });
  },

  getJointRestraintPreset(preset = "fixed") {
    const presets = {
      fixed: {
        name: "Fixed",
        ux: true,
        uy: true,
        uz: true,
        rx: true,
        ry: true,
        rz: true,
      },

      pinned: {
        name: "Pinned",
        ux: true,
        uy: true,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      rollerX: {
        name: "Roller X",
        ux: false,
        uy: true,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      rollerY: {
        name: "Roller Y",
        ux: true,
        uy: false,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      free: {
        name: "Free",
        ux: false,
        uy: false,
        uz: false,
        rx: false,
        ry: false,
        rz: false,
      },
    };

    return presets[preset] || presets.fixed;
  },

  getJointRestraintTypeFromValues(restraints) {
    if (!restraints) return "custom";

    const keys = ["ux", "uy", "uz", "rx", "ry", "rz"];
    const presets = ["fixed", "pinned", "rollerX", "rollerY", "free"];

    for (const preset of presets) {
      const presetValues = this.getJointRestraintPreset(preset);
      const isSame = keys.every((key) => {
        return Boolean(restraints[key]) === Boolean(presetValues[key]);
      });

      if (isSame) return preset;
    }

    return "custom";
  },

  async openAssignJointRestraintsDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const current =
      selectedJoints[0]?.restraints || selectedJoints[0]?.constraints || this.getJointRestraintPreset("fixed");

    const currentType = this.getJointRestraintTypeFromValues(current);

    const result = await Swal.fire({
      title: "Assign Restraints / Supports",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna restricciones de apoyo a los nodos seleccionados.
        </p>

        <div style="margin-bottom:12px;">
          <label style="display:block; margin-bottom:5px;">Tipo de apoyo</label>

          <select id="joint-restraint-preset" style="width:100%; padding:7px;">
            <option value="fixed">Fixed</option>
            <option value="pinned">Pinned</option>
            <option value="rollerX">Roller X</option>
            <option value="rollerY">Roller Y</option>
            <option value="free">Free</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Grado de libertad</th>
              <th style="border:1px solid #555; padding:6px;">Restringido</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">U1 / UX - Traslación X</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-ux" type="checkbox" ${current.ux ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U2 / UY - Traslación Y</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-uy" type="checkbox" ${current.uy ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U3 / UZ - Traslación Z</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-uz" type="checkbox" ${current.uz ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R1 / RX - Rotación X</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-rx" type="checkbox" ${current.rx ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R2 / RY - Rotación Y</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-ry" type="checkbox" ${current.ry ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R3 / RZ - Rotación Z</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-rz" type="checkbox" ${current.rz ? "checked" : ""}>
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Nodos seleccionados: <b>${selectedJoints.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const presetSelect = document.getElementById("joint-restraint-preset");
        presetSelect.value = currentType;

        const applyPreset = (preset) => {
          if (preset === "custom") return;

          const values = this.getJointRestraintPreset(preset);

          document.getElementById("restraint-ux").checked = values.ux;
          document.getElementById("restraint-uy").checked = values.uy;
          document.getElementById("restraint-uz").checked = values.uz;
          document.getElementById("restraint-rx").checked = values.rx;
          document.getElementById("restraint-ry").checked = values.ry;
          document.getElementById("restraint-rz").checked = values.rz;
        };

        presetSelect.addEventListener("change", (event) => {
          applyPreset(event.target.value);
        });

        const checkboxes = [
          "restraint-ux",
          "restraint-uy",
          "restraint-uz",
          "restraint-rx",
          "restraint-ry",
          "restraint-rz",
        ];

        checkboxes.forEach((id) => {
          document.getElementById(id)?.addEventListener("change", () => {
            presetSelect.value = "custom";
          });
        });
      },

      preConfirm: () => {
        return this.readJointRestraintsFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignJointRestraintsToSelected(result.value);
  },

  readJointRestraintsFromDialog() {
    const restraints = {
      ux: document.getElementById("restraint-ux")?.checked === true,
      uy: document.getElementById("restraint-uy")?.checked === true,
      uz: document.getElementById("restraint-uz")?.checked === true,
      rx: document.getElementById("restraint-rx")?.checked === true,
      ry: document.getElementById("restraint-ry")?.checked === true,
      rz: document.getElementById("restraint-rz")?.checked === true,
    };

    const preset = document.getElementById("joint-restraint-preset")?.value || "custom";

    return {
      ...restraints,
      type: preset,
      name: preset === "custom" ? "Custom" : this.getJointRestraintPreset(preset).name,
    };
  },

  assignJointRestraintsToSelected(restraints) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    selectedJoints.forEach((joint) => {
      joint.restraints = JSON.parse(JSON.stringify(restraints));

      // Compatibilidad con tu exportación actual
      joint.constraints = JSON.parse(JSON.stringify(restraints));

      joint.assignment = {
        ...(joint.assignment || {}),
        restraints: JSON.parse(JSON.stringify(restraints)),
      };

      joint.hasRestraints = this.jointHasAnyRestraint(restraints);
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    this.showMessage?.(`Restraints asignados a ${selectedJoints.length} nodo(s).`);

    console.log("✅ Joint Restraints asignados:", {
      restraints,
      selectedJoints,
    });
  },

  // Empotra automáticamente todos los nodos de la base (la cota Z mínima del
  // modelo). Escribe restraints (objeto) + soporte (string) para que el apoyo
  // se guarde, se vea en 3D y lo lea el motor sísmico por ambos caminos.
  autoFixBaseRestraints() {
    const nodes = this.nodes || [];
    if (!nodes.length) {
      this.showMessage?.("El modelo no tiene nodos.", "warning");
      return;
    }

    const zOf = (n) => Number(n.position?.z ?? n.z) || 0;
    const zmin = Math.min(...nodes.map(zOf));
    const baseNodes = nodes.filter((n) => Math.abs(zOf(n) - zmin) < 0.05);
    if (!baseNodes.length) {
      this.showMessage?.("No se encontraron nodos en la base.", "warning");
      return;
    }

    const fixed = this.getJointRestraintPreset("fixed"); // {name:'Fixed', ux..rz=true}
    baseNodes.forEach((joint) => {
      joint.restraints = JSON.parse(JSON.stringify(fixed));
      joint.constraints = JSON.parse(JSON.stringify(fixed));
      joint.assignment = {
        ...(joint.assignment || {}),
        restraints: JSON.parse(JSON.stringify(fixed)),
      };
      joint.hasRestraints = true;
      joint.soporte = "soporteUno"; // empotrado, para el camino 'soporte' (3D / payload)
    });

    this.markAnalysisResultsOutdated?.("Se empotró la base automáticamente.");
    this.redraw?.();
    this.sync3D?.();
    this.showMessage?.(
      `Base empotrada: ${baseNodes.length} nodo(s) en z = ${zmin} m con apoyo fijo.`,
      "success",
    );
  },

  jointHasAnyRestraint(restraints) {
    if (!restraints) return false;

    return (
      restraints.ux === true ||
      restraints.uy === true ||
      restraints.uz === true ||
      restraints.rx === true ||
      restraints.ry === true ||
      restraints.rz === true
    );
  },

  // =====================================================
  // ASSIGN > JOINT / POINT > DIAPHRAGMS
  // =====================================================

  getDefaultDiaphragmsForAssign() {
    return [
      {
        id: "D1",
        name: "D1",
        type: "rigid",
        description: "Diafragma rígido por defecto",
      },
    ];
  },

  getAvailableDiaphragmsForAssign() {
    const definedDiaphragms = this.diaphragms?.items;

    if (Array.isArray(definedDiaphragms) && definedDiaphragms.length > 0) {
      return definedDiaphragms.map((diaphragm, index) => {
        const id = diaphragm.id || diaphragm.name || diaphragm.diaphragmId || `D${index + 1}`;

        const name = diaphragm.name || diaphragm.diaphragmName || String(id);

        return {
          ...diaphragm,
          id,
          name,
          type: diaphragm.type || "rigid",
        };
      });
    }

    return this.getDefaultDiaphragmsForAssign();
  },

  getDiaphragmForAssignById(diaphragmId) {
    return (
      this.getAvailableDiaphragmsForAssign().find((diaphragm) => {
        return String(diaphragm.id) === String(diaphragmId) || String(diaphragm.name) === String(diaphragmId);
      }) || null
    );
  },

  ensureDefaultDiaphragmExists() {
    if (!this.diaphragms) {
      this.diaphragms = {
        items: [],
        selectedDiaphragm: null,
      };
    }

    if (!Array.isArray(this.diaphragms.items)) {
      this.diaphragms.items = [];
    }

    const exists = this.diaphragms.items.some((d) => {
      return String(d.id || d.name) === "D1";
    });

    if (!exists) {
      this.diaphragms.items.push({
        id: "D1",
        name: "D1",
        type: "rigid",
        description: "Diafragma rígido por defecto",
      });
    }
  },

  async openAssignJointDiaphragmsDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    this.ensureDefaultDiaphragmExists();

    const diaphragms = this.getAvailableDiaphragmsForAssign();

    const inputOptions = {
      NONE: "None / Sin diafragma",
    };

    diaphragms.forEach((diaphragm) => {
      inputOptions[diaphragm.id] = `${diaphragm.name} (${diaphragm.type || "rigid"})`;
    });

    const currentId = selectedJoints[0]?.diaphragmId || selectedJoints[0]?.diaphragm?.id || "D1";

    const result = await Swal.fire({
      title: "Assign Diaphragm",
      width: 520,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Asigna un diafragma a los nodos seleccionados.
        </p>

        <label style="display:block; margin-bottom:6px;">Diaphragm</label>

        <select id="assign-diaphragm-id" style="width:100%; padding:7px;">
          ${Object.entries(inputOptions)
          .map(([value, label]) => {
            const selected = String(value) === String(currentId) ? "selected" : "";
            return `<option value="${value}" ${selected}>${label}</option>`;
          })
          .join("")}
        </select>

        <div style="margin-top:14px; padding:10px; border:1px solid #555; border-radius:6px;">
          <b>Tipo:</b> Rigid Diaphragm<br>
          <span style="font-size:12px; color:#777;">
            En esta versión inicial se guarda la asignación. Luego el motor de análisis podrá usarla para restricciones de piso.
          </span>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Nodos seleccionados: <b>${selectedJoints.length}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return document.getElementById("assign-diaphragm-id")?.value || "NONE";
      },
    });

    if (!result.isConfirmed) return;

    this.assignJointDiaphragmToSelected(result.value);
  },

  assignJointDiaphragmToSelected(diaphragmId) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    if (String(diaphragmId) === "NONE") {
      selectedJoints.forEach((joint) => {
        joint.diaphragmId = null;
        joint.diaphragmName = null;
        joint.diaphragm = null;
        joint.hasDiaphragm = false;

        joint.assignment = {
          ...(joint.assignment || {}),
          diaphragm: null,
        };
      });

      this.redraw?.();

      this.showMessage?.(`Diafragma removido de ${selectedJoints.length} nodo(s).`);

      return;
    }

    const diaphragm = this.getDiaphragmForAssignById(diaphragmId);

    if (!diaphragm) {
      this.showMessage?.("El diafragma seleccionado no existe.", "warning");
      console.warn("Diaphragm no encontrado:", diaphragmId);
      return;
    }

    selectedJoints.forEach((joint) => {
      joint.diaphragmId = diaphragm.id;
      joint.diaphragmName = diaphragm.name;
      joint.diaphragm = JSON.parse(JSON.stringify(diaphragm));
      joint.hasDiaphragm = true;

      joint.assignment = {
        ...(joint.assignment || {}),
        diaphragm: {
          id: diaphragm.id,
          name: diaphragm.name,
          type: diaphragm.type || "rigid",
        },
      };
    });

    this.redraw?.();

    this.showMessage?.(`Diafragma ${diaphragm.name} asignado a ${selectedJoints.length} nodo(s).`);

    console.log("✅ Joint Diaphragm asignado:", {
      diaphragm,
      selectedJoints,
    });
  },

  // =====================================================
  // ASSIGN > JOINT / POINT > POINT SPRINGS
  // =====================================================

  getDefaultPointSprings() {
    return {
      name: "Point Spring",
      coordinateSystem: "Global",

      stiffness: {
        ux: 0,
        uy: 0,
        uz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
      },
    };
  },

  getPointSpringPreset(preset = "custom") {
    const presets = {
      custom: this.getDefaultPointSprings(),

      vertical: {
        name: "Vertical Spring",
        coordinateSystem: "Global",
        stiffness: {
          ux: 0,
          uy: 0,
          uz: 10000,
          rx: 0,
          ry: 0,
          rz: 0,
        },
      },

      horizontal: {
        name: "Horizontal Springs",
        coordinateSystem: "Global",
        stiffness: {
          ux: 10000,
          uy: 10000,
          uz: 0,
          rx: 0,
          ry: 0,
          rz: 0,
        },
      },

      soil: {
        name: "Soil Springs XYZ",
        coordinateSystem: "Global",
        stiffness: {
          ux: 10000,
          uy: 10000,
          uz: 10000,
          rx: 0,
          ry: 0,
          rz: 0,
        },
      },

      rotational: {
        name: "Rotational Springs",
        coordinateSystem: "Global",
        stiffness: {
          ux: 0,
          uy: 0,
          uz: 0,
          rx: 1000,
          ry: 1000,
          rz: 1000,
        },
      },
    };

    return JSON.parse(JSON.stringify(presets[preset] || presets.custom));
  },

  async openAssignPointSpringsDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const current = selectedJoints[0]?.pointSprings || selectedJoints[0]?.springs || this.getDefaultPointSprings();

    const k = current.stiffness || {};

    const result = await Swal.fire({
      title: "Assign Point Springs",
      width: 700,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna rigideces de resorte a los nodos seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Preset</label>
            <select id="point-spring-preset" style="width:100%; padding:7px;">
              <option value="custom">Custom</option>
              <option value="vertical">Vertical Spring</option>
              <option value="horizontal">Horizontal Springs</option>
              <option value="soil">Soil Springs XYZ</option>
              <option value="rotational">Rotational Springs</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Coordinate System</label>
            <select id="point-spring-csys" style="width:100%; padding:7px;">
              <option value="Global">Global</option>
              <option value="Local">Local</option>
            </select>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">DOF</th>
              <th style="border:1px solid #555; padding:6px;">Stiffness</th>
              <th style="border:1px solid #555; padding:6px;">Unidad referencial</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">U1 / UX</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-ux" type="number" step="0.001" value="${Number(k.ux || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN/m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U2 / UY</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-uy" type="number" step="0.001" value="${Number(k.uy || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN/m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U3 / UZ</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-uz" type="number" step="0.001" value="${Number(k.uz || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN/m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R1 / RX</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-rx" type="number" step="0.001" value="${Number(k.rx || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN·m/rad</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R2 / RY</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-ry" type="number" step="0.001" value="${Number(k.ry || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN·m/rad</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R3 / RZ</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-rz" type="number" step="0.001" value="${Number(k.rz || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN·m/rad</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Nodos seleccionados: <b>${selectedJoints.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Asignar",
      denyButtonText: "Remover",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        document.getElementById("point-spring-csys").value = current.coordinateSystem || "Global";

        const applyPreset = (preset) => {
          if (preset === "custom") return;

          const values = this.getPointSpringPreset(preset);
          const stiffness = values.stiffness;

          document.getElementById("spring-ux").value = stiffness.ux;
          document.getElementById("spring-uy").value = stiffness.uy;
          document.getElementById("spring-uz").value = stiffness.uz;
          document.getElementById("spring-rx").value = stiffness.rx;
          document.getElementById("spring-ry").value = stiffness.ry;
          document.getElementById("spring-rz").value = stiffness.rz;
        };

        document.getElementById("point-spring-preset")?.addEventListener("change", (event) => {
          applyPreset(event.target.value);
        });
      },

      preConfirm: () => {
        return this.readPointSpringsFromDialog();
      },
    });

    if (result.isDenied) {
      this.removePointSpringsFromSelected();
      return;
    }

    if (!result.isConfirmed || !result.value) return;

    this.assignPointSpringsToSelected(result.value);
  },

  readPointSpringsFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    const preset = document.getElementById("point-spring-preset")?.value || "custom";

    return {
      name: preset === "custom" ? "Point Spring" : this.getPointSpringPreset(preset).name,

      preset,

      coordinateSystem: document.getElementById("point-spring-csys")?.value || "Global",

      stiffness: {
        ux: readNumber("spring-ux"),
        uy: readNumber("spring-uy"),
        uz: readNumber("spring-uz"),
        rx: readNumber("spring-rx"),
        ry: readNumber("spring-ry"),
        rz: readNumber("spring-rz"),
      },
    };
  },

  assignPointSpringsToSelected(pointSprings) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    selectedJoints.forEach((joint) => {
      joint.pointSprings = JSON.parse(JSON.stringify(pointSprings));

      // Alias para compatibilidad futura
      joint.springs = JSON.parse(JSON.stringify(pointSprings));

      joint.assignment = {
        ...(joint.assignment || {}),
        pointSprings: JSON.parse(JSON.stringify(pointSprings)),
      };

      joint.hasPointSprings = this.jointHasPointSprings(pointSprings);
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    this.showMessage?.(`Point Springs asignado a ${selectedJoints.length} nodo(s).`);

    console.log("✅ Point Springs asignados:", {
      pointSprings,
      selectedJoints,
    });
  },

  removePointSpringsFromSelected() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    selectedJoints.forEach((joint) => {
      joint.pointSprings = null;
      joint.springs = null;
      joint.hasPointSprings = false;

      joint.assignment = {
        ...(joint.assignment || {}),
        pointSprings: null,
      };
    });

    this.redraw?.();

    this.showMessage?.(`Point Springs removido de ${selectedJoints.length} nodo(s).`);
  },

  jointHasPointSprings(pointSprings) {
    if (!pointSprings?.stiffness) return false;

    const k = pointSprings.stiffness;

    return (
      Number(k.ux || 0) !== 0 ||
      Number(k.uy || 0) !== 0 ||
      Number(k.uz || 0) !== 0 ||
      Number(k.rx || 0) !== 0 ||
      Number(k.ry || 0) !== 0 ||
      Number(k.rz || 0) !== 0
    );
  },

  // =====================================================
  // ASSIGN > JOINT / POINT LOADS > FORCE
  // ETABS style: Joint Load Assignment - Force
  // =====================================================

  getAvailableLoadCasesForAssign() {
    // Para entrega final: solo mostramos los patrones oficiales del proyecto.
    // No mezclar aquí DEAD, LIVE, WIND_X, EQ_X, etc.
    return this.getEtabsReferenceLoadPatterns();
  },

  getDefaultJointPointForceLoad() {
    return {
      id: `JLOAD_${Date.now()}`,
      type: "force",

      // En ETABS el campo visible es Load Pattern Name.
      loadPattern: "CM",

      // Alias para compatibilidad con el código existente.
      loadCase: "CM",

      coordinateSystem: "Global",
      operation: "replace",

      fx: 0,
      fy: 0,
      fz: 0,

      mxx: 0,
      myy: 0,
      mzz: 0,

      punchingX: 0,
      punchingY: 0,

      units: {
        force: "tonf",
        moment: "tonf-m",
        length: "m",
      },

      forces: {
        fx: 0,
        fy: 0,
        fz: 0,
        mx: 0,
        my: 0,
        mz: 0,
      },
    };
  },

  _getJointAssignId(joint) {
    return String(
      joint?.id ??
      joint?.jointId ??
      joint?.nodeId ??
      joint?.name ??
      joint?._id ??
      ""
    );
  },

  _escapeAssignHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  getUnifiedAssignTheme() {
    return {
      bg: "#1a2035",
      panel: "#0f172a",
      border: "#475569",
      text: "#e2e8f0",
      label: "#cbd5e1",
      muted: "#94a3b8",
      legend: "#7eb8f7",
      accent: "#1d4ed8",
      accentAlt: "#2563eb",
      secondary: "#64748b",
      disabledBg: "#111827",
      disabledText: "#64748b",
    };
  },

  getUnifiedAssignWrapperStyle() {
    const t = this.getUnifiedAssignTheme();
    return `
    text-align:left;
    font-size:13px;
    font-family:monospace;
    color:${t.text};
  `;
  },

  getUnifiedAssignSectionStyle() {
    const t = this.getUnifiedAssignTheme();
    return `
    border:1px solid ${t.border};
    border-radius:6px;
    padding:10px 12px;
    background:${t.bg};
  `;
  },

  getUnifiedAssignFieldsetStyle() {
    const t = this.getUnifiedAssignTheme();
    return `
    border:1px solid ${t.border};
    border-radius:6px;
    padding:10px 12px;
    margin:0;
    background:${t.bg};
  `;
  },

  getUnifiedAssignLegendStyle() {
    const t = this.getUnifiedAssignTheme();
    return `
    padding:0 6px;
    color:${t.legend};
    font-size:12px;
    font-weight:600;
  `;
  },

  getUnifiedAssignLabelStyle() {
    const t = this.getUnifiedAssignTheme();
    return `
    display:block;
    margin-bottom:4px;
    color:${t.label};
  `;
  },

  getUnifiedAssignFieldStyle(disabled = false) {
    const t = this.getUnifiedAssignTheme();
    return `
    width:100%;
    padding:6px 8px;
    background:${disabled ? t.disabledBg : t.panel};
    color:${disabled ? t.disabledText : t.text};
    border:1px solid ${t.border};
    border-radius:4px;
    box-sizing:border-box;
  `;
  },

  getUnifiedAssignNoteStyle() {
    const t = this.getUnifiedAssignTheme();
    return `
    color:${t.muted};
    font-size:11px;
    margin-top:8px;
  `;
  },

  getUnifiedAssignButtonStyle(type = "primary") {
    const t = this.getUnifiedAssignTheme();

    const bg = type === "primary" ? t.accent : t.secondary;

    return `
    min-width:100px;
    height:42px;
    padding:0 18px;
    border:none;
    border-radius:6px;
    background:${bg};
    color:white;
    font-size:13px;
    font-weight:600;
    cursor:pointer;
  `;
  },

  async openAssignJointPointForceDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const current = this.getDefaultJointPointForceLoad();
    const t = this.getUnifiedAssignTheme();

    // Para entrega final: patrón inicial fijo del proyecto.
    current.loadPattern = "CM";
    current.loadCase = "CM";

    // Usa el catálogo cerrado del proyecto:
    // CM, CVE, CVT, SEX pendiente, SEY pendiente.
    const patternOptions =
      typeof this.buildLoadPatternOptionsHtml === "function"
        ? this.buildLoadPatternOptionsHtml("CM")
        : `
        <option value="CM" selected>CM (DEAD)</option>
        <option value="CVE">CVE (LIVE)</option>
        <option value="CVT">CVT (LIVE)</option>
        <option value="SEX">SEX (Seismic X) - Pendiente</option>
        <option value="SEY">SEY (Seismic Y) - Pendiente</option>
      `;

    await Swal.fire({
      title: "Joint Load Assignment - Force",
      width: 620,
      background: t.bg,
      color: t.text,
      showConfirmButton: false,
      showCancelButton: false,
      allowOutsideClick: false,
      html: `
      <div style="${this.getUnifiedAssignWrapperStyle()}">

        <div style="${this.getUnifiedAssignSectionStyle()}; margin-bottom:12px;">
          <label style="${this.getUnifiedAssignLabelStyle()}">Load Pattern Name</label>
          <select id="joint-force-loadpattern" style="${this.getUnifiedAssignFieldStyle()}">
            ${patternOptions}
          </select>
        </div>

        <div style="
          display:grid;
          grid-template-columns: 1.3fr 1fr;
          gap:12px;
          margin-bottom:12px;
        ">
          <fieldset style="${this.getUnifiedAssignFieldsetStyle()}">
            <legend style="${this.getUnifiedAssignLegendStyle()}">Loads</legend>

            ${this.buildJointForceInputRow("Force Global X", "joint-force-fx", current.fx, "tonf")}
            ${this.buildJointForceInputRow("Force Global Y", "joint-force-fy", current.fy, "tonf")}
            ${this.buildJointForceInputRow("Force Global Z", "joint-force-fz", current.fz, "tonf")}
            ${this.buildJointForceInputRow("Moment Global XX", "joint-force-mxx", current.mxx, "tonf-m")}
            ${this.buildJointForceInputRow("Moment Global YY", "joint-force-myy", current.myy, "tonf-m")}
            ${this.buildJointForceInputRow("Moment Global ZZ", "joint-force-mzz", current.mzz, "tonf-m")}
          </fieldset>

          <fieldset style="${this.getUnifiedAssignFieldsetStyle()}">
            <legend style="${this.getUnifiedAssignLegendStyle()}">Options</legend>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px; color:${t.text};">
              <input type="radio" name="joint-force-operation" value="add">
              Add to Existing Loads
            </label>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px; color:${t.text};">
              <input type="radio" name="joint-force-operation" value="replace" checked>
              Replace Existing Loads
            </label>

            <label style="display:flex; align-items:center; gap:8px; color:${t.text};">
              <input type="radio" name="joint-force-operation" value="delete">
              Delete Existing Loads
            </label>
          </fieldset>
        </div>

        <fieldset style="${this.getUnifiedAssignFieldsetStyle()}; margin-bottom:12px;">
          <legend style="${this.getUnifiedAssignLegendStyle()}">Size of Load for Punching Shear</legend>

          ${this.buildJointForceInputRow("X Dimension", "joint-force-punching-x", current.punchingX, "m")}
          ${this.buildJointForceInputRow("Y Dimension", "joint-force-punching-y", current.punchingY, "m")}
        </fieldset>

        <div style="${this.getUnifiedAssignNoteStyle()}">
          Nodos seleccionados: <b style="color:${t.text};">${selectedJoints.length}</b>
        </div>

        <div style="
          display:flex;
          justify-content:center;
          gap:14px;
          margin-top:18px;
        ">
          <button id="joint-force-ok" style="${this.getUnifiedAssignButtonStyle("primary")}">OK</button>
          <button id="joint-force-close" style="${this.getUnifiedAssignButtonStyle("secondary")}">Close</button>
          <button id="joint-force-apply" style="${this.getUnifiedAssignButtonStyle("primary")}">Apply</button>
        </div>
      </div>
    `,

      didOpen: () => {
        const applyAssignment = (shouldClose = false) => {
          const load = this.readJointPointForceFromDialog();

          if (!load) return;

          const patternName = load.loadPattern || load.loadCase || "CM";

          if (
            typeof this.isLoadPatternImplemented === "function" &&
            !this.isLoadPatternImplemented(patternName)
          ) {
            this.showMessage?.(
              `El patrón ${patternName} existe como referencia ETABS, pero su implementación está pendiente.`,
              "warning"
            );
            return;
          }

          this.assignJointPointForceToSelected(load);

          if (shouldClose) {
            Swal.close();
          }
        };

        document.getElementById("joint-force-ok")?.addEventListener("click", () => {
          applyAssignment(true);
        });

        document.getElementById("joint-force-apply")?.addEventListener("click", () => {
          applyAssignment(false);
        });

        document.getElementById("joint-force-close")?.addEventListener("click", () => {
          Swal.close();
        });

        const updateDeleteState = () => {
          const operation =
            document.querySelector('input[name="joint-force-operation"]:checked')?.value || "replace";

          const disabled = operation === "delete";

          [
            "joint-force-fx",
            "joint-force-fy",
            "joint-force-fz",
            "joint-force-mxx",
            "joint-force-myy",
            "joint-force-mzz",
            "joint-force-punching-x",
            "joint-force-punching-y",
          ].forEach((id) => {
            const input = document.getElementById(id);

            if (input) {
              input.disabled = disabled;
              input.style.background = disabled ? t.disabledBg : t.panel;
              input.style.color = disabled ? t.disabledText : t.text;
            }
          });
        };

        document.querySelectorAll('input[name="joint-force-operation"]').forEach((radio) => {
          radio.addEventListener("change", updateDeleteState);
        });

        updateDeleteState();
      },
    });
  },

  buildJointForceInputRow(label, id, value, unit, disabled = false) {
    const t = this.getUnifiedAssignTheme();

    return `
    <div style="
      display:grid;
      grid-template-columns:130px 1fr 55px;
      align-items:center;
      gap:8px;
      margin-bottom:8px;
    ">
      <label for="${id}" style="color:${t.label};">${label}</label>

      <input
        id="${id}"
        type="number"
        step="any"
        value="${Number(value || 0)}"
        ${disabled ? "disabled" : ""}
        style="${this.getUnifiedAssignFieldStyle(disabled)}"
      >

      <span style="color:${t.text}; font-size:12px;">${unit}</span>
    </div>
  `;
  },

  getEtabsDialogButtonStyle(type = "primary") {
    return this.getUnifiedAssignButtonStyle(type);
  },

  readJointPointForceFromDialog() {
    const readNumber = (id) => {
      const raw = document.getElementById(id)?.value;
      const value = Number(raw === "" || raw == null ? 0 : raw);
      return Number.isFinite(value) ? value : 0;
    };

    const loadPattern = String(
      document.getElementById("joint-force-loadpattern")?.value ||
      document.getElementById("joint-force-loadcase")?.value ||
      "CM"
    ).trim();

    const operation =
      document.querySelector('input[name="joint-force-operation"]:checked')?.value ||
      document.getElementById("joint-force-operation")?.value ||
      "replace";

    const fx = readNumber("joint-force-fx");
    const fy = readNumber("joint-force-fy");
    const fz = readNumber("joint-force-fz");

    const mxx = readNumber("joint-force-mxx");
    const myy = readNumber("joint-force-myy");
    const mzz = readNumber("joint-force-mzz");

    const punchingX = readNumber("joint-force-punching-x");
    const punchingY = readNumber("joint-force-punching-y");

    return {
      id: `JLOAD_${Date.now()}`,
      type: "force",

      loadPattern,
      loadCase: loadPattern,

      coordinateSystem: "Global",
      operation,

      fx,
      fy,
      fz,

      mxx,
      myy,
      mzz,

      // Alias antiguos para compatibilidad.
      mx: mxx,
      my: myy,
      mz: mzz,

      punchingX,
      punchingY,

      punching: {
        x: punchingX,
        y: punchingY,
      },

      units: {
        force: "tonf",
        moment: "tonf-m",
        length: "m",
      },

      forces: {
        fx,
        fy,
        fz,
        mx: mxx,
        my: myy,
        mz: mzz,
      },
    };
  },

  jointPointForceHasValues(load) {
    if (!load) return false;

    const f = load.forces || {};

    return (
      Number(load.fx ?? f.fx ?? 0) !== 0 ||
      Number(load.fy ?? f.fy ?? 0) !== 0 ||
      Number(load.fz ?? f.fz ?? 0) !== 0 ||
      Number(load.mxx ?? f.mx ?? 0) !== 0 ||
      Number(load.myy ?? f.my ?? 0) !== 0 ||
      Number(load.mzz ?? f.mz ?? 0) !== 0 ||
      Number(load.punchingX ?? load.punching?.x ?? 0) !== 0 ||
      Number(load.punchingY ?? load.punching?.y ?? 0) !== 0
    );
  },

  normalizeJointForceLoad(load) {
    const fx = Number(load.fx ?? load.forces?.fx ?? 0);
    const fy = Number(load.fy ?? load.forces?.fy ?? 0);
    const fz = Number(load.fz ?? load.forces?.fz ?? 0);

    const mxx = Number(load.mxx ?? load.mx ?? load.forces?.mx ?? 0);
    const myy = Number(load.myy ?? load.my ?? load.forces?.my ?? 0);
    const mzz = Number(load.mzz ?? load.mz ?? load.forces?.mz ?? 0);

    const punchingX = Number(load.punchingX ?? load.punching?.x ?? 0);
    const punchingY = Number(load.punchingY ?? load.punching?.y ?? 0);

    const loadPattern = load.loadPattern || load.loadCase || "CM";

    const clean = {
      ...JSON.parse(JSON.stringify(load)),

      id: load.id || `JLOAD_${Date.now()}`,
      type: "force",

      loadPattern,
      loadCase: loadPattern,

      coordinateSystem: load.coordinateSystem || "Global",

      fx,
      fy,
      fz,

      mxx,
      myy,
      mzz,

      mx: mxx,
      my: myy,
      mz: mzz,

      punchingX,
      punchingY,

      punching: {
        x: punchingX,
        y: punchingY,
      },

      units: {
        force: "tonf",
        moment: "tonf-m",
        length: "m",
        ...(load.units || {}),
      },

      forces: {
        fx,
        fy,
        fz,
        mx: mxx,
        my: myy,
        mz: mzz,
      },
    };

    delete clean.operation;

    return clean;
  },

  mergeJointForceLoads(existing, incoming) {
    const a = this.normalizeJointForceLoad(existing);
    const b = this.normalizeJointForceLoad(incoming);

    const merged = {
      ...a,
      id: a.id || b.id || `JLOAD_${Date.now()}`,

      fx: Number(a.fx || 0) + Number(b.fx || 0),
      fy: Number(a.fy || 0) + Number(b.fy || 0),
      fz: Number(a.fz || 0) + Number(b.fz || 0),

      mxx: Number(a.mxx || 0) + Number(b.mxx || 0),
      myy: Number(a.myy || 0) + Number(b.myy || 0),
      mzz: Number(a.mzz || 0) + Number(b.mzz || 0),

      // Las dimensiones de punzonamiento no se suman; se reemplazan.
      punchingX: Number(b.punchingX || 0),
      punchingY: Number(b.punchingY || 0),
    };

    merged.mx = merged.mxx;
    merged.my = merged.myy;
    merged.mz = merged.mzz;

    merged.forces = {
      fx: merged.fx,
      fy: merged.fy,
      fz: merged.fz,
      mx: merged.mxx,
      my: merged.myy,
      mz: merged.mzz,
    };

    merged.punching = {
      x: merged.punchingX,
      y: merged.punchingY,
    };

    return merged;
  },

  isSameJointForcePattern(item, loadPattern) {
    return (
      item &&
      item.type === "force" &&
      String(item.loadPattern || item.loadCase) === String(loadPattern)
    );
  },

  assignJointPointForceToSelected(load) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadPattern = load.loadPattern || load.loadCase || "CM";
    const cleanIncoming = this.normalizeJointForceLoad(load);

    selectedJoints.forEach((joint) => {
      if (!Array.isArray(joint.pointLoads)) joint.pointLoads = [];
      if (!Array.isArray(joint.jointLoads)) joint.jointLoads = [];

      const existingForceLoads = joint.pointLoads.filter((item) => {
        return this.isSameJointForcePattern(item, loadPattern);
      });

      const otherPointLoads = joint.pointLoads.filter((item) => {
        return !this.isSameJointForcePattern(item, loadPattern);
      });

      const otherJointLoads = joint.jointLoads.filter((item) => {
        return !this.isSameJointForcePattern(item, loadPattern);
      });

      let finalLoadsForPattern = [];

      if (operation === "delete") {
        finalLoadsForPattern = [];
      }

      if (operation === "replace") {
        if (this.jointPointForceHasValues(cleanIncoming)) {
          finalLoadsForPattern = [cleanIncoming];
        }
      }

      if (operation === "add") {
        if (this.jointPointForceHasValues(cleanIncoming)) {
          if (existingForceLoads.length > 0) {
            const base = existingForceLoads.reduce((acc, item) => {
              return acc ? this.mergeJointForceLoads(acc, item) : this.normalizeJointForceLoad(item);
            }, null);

            finalLoadsForPattern = [
              this.mergeJointForceLoads(base, cleanIncoming),
            ];
          } else {
            finalLoadsForPattern = [cleanIncoming];
          }
        } else {
          finalLoadsForPattern = existingForceLoads.map((item) => {
            return this.normalizeJointForceLoad(item);
          });
        }
      }

      joint.pointLoads = [
        ...otherPointLoads,
        ...finalLoadsForPattern,
      ];

      joint.jointLoads = [
        ...otherJointLoads,
        ...finalLoadsForPattern,
      ];

      joint.hasPointLoads = joint.pointLoads.length > 0;
      joint.hasJointLoads = joint.jointLoads.length > 0;

      joint.assignment = {
        ...(joint.assignment || {}),
        pointLoads: JSON.parse(JSON.stringify(joint.pointLoads)),
        jointLoads: JSON.parse(JSON.stringify(joint.jointLoads)),
      };

      this._syncJointLoadAssignmentStoreForJoint?.(joint);
    });

    this.markAnalysisResultsOutdated?.("Se modificaron cargas puntuales en nodos.");
    // this.redraw?.();
    this.displayOptions = {
      ...(this.displayOptions || {}),
      showJointLoads: true,
      jointLoadPattern: load.loadPattern || load.loadCase || "CM",
      jointLoadDisplayType: "force",
    };

    this.redraw?.();
    this.sync3D?.();

    const actionText =
      operation === "delete"
        ? "eliminadas"
        : operation === "add"
          ? "agregadas"
          : "asignadas";

    this.showMessage?.(
      `Cargas Joint / Point Force ${actionText} en ${selectedJoints.length} nodo(s).`,
      "success"
    );

    console.log("✅ Joint Load Assignment - Force:", {
      operation,
      loadPattern,
      load: cleanIncoming,
      selectedJoints,
      jointLoadAssignments: this.jointLoadAssignments,
    });
  },

  _syncJointLoadAssignmentStoreForJoint(joint) {
    if (!joint) return;

    const jointId = this._getJointAssignId(joint);
    if (!jointId) return;

    if (!Array.isArray(this.jointLoadAssignments)) {
      this.jointLoadAssignments = [];
    }

    // Quitar cargas anteriores de este nodo.
    this.jointLoadAssignments = this.jointLoadAssignments.filter((item) => {
      return String(item.jointId) !== String(jointId);
    });

    const loads = Array.isArray(joint.jointLoads)
      ? joint.jointLoads
      : Array.isArray(joint.pointLoads)
        ? joint.pointLoads
        : [];

    const forceLoads = loads
      .filter((load) => load && load.type === "force")
      .map((load) => {
        const clean = this.normalizeJointForceLoad(load);

        return {
          ...clean,
          jointId,
          nodeId: jointId,
        };
      });

    this.jointLoadAssignments.push(...forceLoads);
  },

  buildLoadPatternOptionsHtml(selectedName = "CM") {
    const patterns = this.getAvailableLoadCasesForAssign();

    return patterns.map((lp) => {
      const selected = String(lp.name) === String(selectedName) ? "selected" : "";
      const suffix = lp.implemented ? "" : " - Pendiente";

      return `
      <option value="${lp.name}" ${selected}>
        ${lp.name} (${lp.type})${suffix}
      </option>
    `;
    }).join("");
  },

  isLoadPatternImplemented(name) {
    const patterns = this.getAvailableLoadCasesForAssign();
    const found = patterns.find((p) => String(p.name) === String(name));
    return found ? found.implemented !== false : true;
  },

  // =====================================================
  // ASSIGN > SHELL / AREA LOADS > UNIFORM  (como ETABS)
  // =====================================================

  // Áreas/losas seleccionadas (objetos con 'points', no frames ni nodos).
  getSelectedAreasForAssign() {
    const isArea = (obj) =>
      obj && !(obj.node1 && obj.node2) && Array.isArray(obj.points) && obj.points.length >= 3;

    // La asignación NO debe depender de la vista 2D activa: al seleccionar losas
    // por propiedad (o en 3D) se eligen de varios pisos, y getSelectedObjects()
    // filtra por vista activa (respectActiveView:true), descartándolas. Se toma
    // la selección de edición SIN ese filtro + el estado propio de áreas.
    const sources = [];

    if (typeof this.getEditSelectedObjects === "function") {
      sources.push(...this.getEditSelectedObjects({ respectActiveView: false }));
    } else {
      sources.push(...(this.getSelectedObjects?.() || []));
    }

    sources.push(...(this.selectedAreasState?.selectedObjects || []));

    const result = [];
    const seen = new Set();

    sources.forEach((a) => {
      if (!isArea(a)) return;
      const key = a.id != null ? String(a.id) : a;
      if (seen.has(key)) return;
      seen.add(key);
      result.push(a);
    });

    return result;
  },

  async openAssignAreaUniformLoadDialog() {
    const r2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
    const slabZ = (a) =>
      r2(a.z ?? (a.points.reduce((s, p) => s + (Number(p.z) || 0), 0) / a.points.length));

    const selected = this.getSelectedAreasForAssign();
    const allSlabs = (this.areas || []).filter(
      (a) => (a.areaType || a.type || "slab") === "slab" && Array.isArray(a.points) && a.points.length >= 3,
    );
    if (!allSlabs.length) {
      this.showMessage?.("No hay losas en el modelo. Dibuja losas primero.", "warning");
      return;
    }

    // Losas por piso (z) para el alcance "por piso".
    const byZ = new Map();
    allSlabs.forEach((a) => {
      const z = slabZ(a);
      if (!byZ.has(z)) byZ.set(z, []);
      byZ.get(z).push(a);
    });
    const floors = [...byZ.keys()].sort((a, b) => a - b);

    // Opciones de alcance (como ETABS: selección / todo / por piso).
    const scopeOpts = [];
    if (selected.length) scopeOpts.push(`<option value="selected">Losas seleccionadas (${selected.length})</option>`);
    scopeOpts.push(`<option value="all">Todas las losas (${allSlabs.length})</option>`);
    floors.forEach((z) => scopeOpts.push(`<option value="z:${z}">Piso z=${z} m (${byZ.get(z).length} losa/s)</option>`));

    const loadCases = this.getAvailableLoadCasesForAssign();
    const result = await Swal.fire({
      title: "Asignar Carga de Área — Uniforme (Shell)",
      width: 560,
      background: "#1a2035",
      color: "#e2e8f0",
      html: `
        <div style="text-align:left; font-size:13px; font-family:monospace">
          <div style="margin-bottom:10px">
            <label style="display:block; margin-bottom:4px; color:#cbd5e1">Aplicar a</label>
            <select id="area-load-scope" style="width:100%; padding:6px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px">
              ${scopeOpts.join("")}
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
            <div>
              <label style="display:block; margin-bottom:4px; color:#cbd5e1">Patrón de carga</label>
              <select id="area-load-case" style="width:100%; padding:6px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px">
                ${loadCases.map((lc) => `<option value="${lc.name}">${lc.name} (${lc.type})</option>`).join("")}
              </select>
            </div>
            <div>
              <label style="display:block; margin-bottom:4px; color:#cbd5e1">Valor (kgf/m²)</label>
              <input id="area-load-value" type="number" step="10" min="0" value="300" style="width:100%; padding:6px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px">
            </div>
          </div>
          <div style="margin-top:10px">
            <label style="display:block; margin-bottom:4px; color:#cbd5e1">Operación</label>
            <select id="area-load-op" style="width:100%; padding:6px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px">
              <option value="replace">Reemplazar cargas del mismo patrón</option>
              <option value="add">Agregar a las existentes</option>
              <option value="delete">Eliminar cargas del patrón</option>
            </select>
          </div>
          <div style="color:#64748b; font-size:11px; margin-top:8px">
            La carga se convierte en masa vía la Fuente de Masa (multiplicador del patrón). Típico: CM losa≈300, acabados≈100, tabiquería≈150; CV≈200–250.
          </div>
        </div>`,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1d4ed8",
      preConfirm: () => ({
        scope: document.getElementById("area-load-scope")?.value || "all",
        loadCase: document.getElementById("area-load-case")?.value || (loadCases[0]?.name ?? "CM"),
        value: Math.max(0, parseFloat(document.getElementById("area-load-value")?.value) || 0),
        operation: document.getElementById("area-load-op")?.value || "replace",
      }),
    });
    if (!result.isConfirmed) return;

    // Resolver el conjunto destino según el alcance elegido.
    let target;
    const scope = result.value.scope;
    if (scope === "selected") target = selected;
    else if (scope === "all") target = allSlabs;
    else if (scope.startsWith("z:")) target = byZ.get(Number(scope.slice(2))) || [];
    else target = allSlabs;

    this.assignAreaUniformLoadToAreas(target, result.value);
  },

  // Guarda la carga uniforme en area.areaLoads[] de cada losa.
  assignAreaUniformLoadToAreas(areas, cfg) {
    const { loadCase, value, operation } = cfg;
    let count = 0;
    areas.forEach((area) => {
      if (!Array.isArray(area.areaLoads)) area.areaLoads = [];
      // Quitar las del mismo patrón si replace/delete
      if (operation === "replace" || operation === "delete") {
        area.areaLoads = area.areaLoads.filter(
          (l) => !(l.type === "uniform" && l.loadCase === loadCase),
        );
      }
      if (operation !== "delete" && value > 0) {
        area.areaLoads.push({ type: "uniform", loadCase, value, dir: "gravity" });
      }
      area.hasAreaLoads = area.areaLoads.length > 0;
      area.loads = area.areaLoads; // alias compatible
      count++;
    });

    this.markAnalysisResultsOutdated?.("Se modificaron cargas de área.");
    this.redraw?.();
    const verb = operation === "delete" ? "eliminadas" : "asignadas";
    this.showMessage?.(`Cargas de área ${verb} (${loadCase} = ${value} kgf/m²) en ${count} losa(s).`);
  },

  // =====================================================
  // ASSIGN > SHELL > SLAB SECTION  (como ETABS)
  // =====================================================
  async openAssignSlabSectionDialog() {
    const r2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
    const slabZ = (a) =>
      r2(a.z ?? (a.points.reduce((s, p) => s + (Number(p.z) || 0), 0) / a.points.length));

    const selected = this.getSelectedAreasForAssign();
    const allSlabs = (this.areas || []).filter(
      (a) => (a.areaType || a.type || "slab") === "slab" && Array.isArray(a.points) && a.points.length >= 3,
    );
    if (!allSlabs.length) {
      this.showMessage?.("No hay losas en el modelo. Dibuja losas primero.", "warning");
      return;
    }

    const sections = Array.isArray(this.slabSections) ? this.slabSections : [];
    if (!sections.length) {
      const ask = await Swal.fire({
        icon: "info", title: "Sin secciones de losa",
        text: "No hay secciones de losa definidas. ¿Abrir Define → Slab Sections para crearlas?",
        showCancelButton: true, confirmButtonText: "Definir", cancelButtonText: "Cancelar",
        background: "#1a2035", color: "#e2e8f0", confirmButtonColor: "#1d4ed8",
      });
      if (ask.isConfirmed) window.dispatchEvent(new CustomEvent("open-slab-sections-modal"));
      return;
    }

    // Alcance (selección / todo / por piso)
    const byZ = new Map();
    allSlabs.forEach((a) => { const z = slabZ(a); if (!byZ.has(z)) byZ.set(z, []); byZ.get(z).push(a); });
    const floors = [...byZ.keys()].sort((a, b) => a - b);
    const scopeOpts = [];
    if (selected.length) scopeOpts.push(`<option value="selected">Losas seleccionadas (${selected.length})</option>`);
    scopeOpts.push(`<option value="all">Todas las losas (${allSlabs.length})</option>`);
    floors.forEach((z) => scopeOpts.push(`<option value="z:${z}">Piso z=${z} m (${byZ.get(z).length})</option>`));

    const secOpts = sections.map((s) =>
      `<option value="${s.name}">${s.name} (${s.thickness} mm)</option>`).join("") +
      `<option value="__none__">None (sin sección)</option>`;

    const result = await Swal.fire({
      title: "Asignar Sección de Losa (Shell)",
      width: 460,
      background: "#1a2035", color: "#e2e8f0",
      html: `
        <div style="text-align:left; font-size:13px; font-family:monospace">
          <label style="display:block; margin-bottom:4px; color:#cbd5e1">Aplicar a</label>
          <select id="slabsec-scope" style="width:100%; padding:6px; margin-bottom:10px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px">
            ${scopeOpts.join("")}
          </select>
          <label style="display:block; margin-bottom:4px; color:#cbd5e1">Sección de Losa</label>
          <select id="slabsec-name" style="width:100%; padding:6px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px">
            ${secOpts}
          </select>
          <div style="color:#64748b; font-size:11px; margin-top:8px">
            El espesor de la sección define el <b>peso propio</b> de la losa (CM automática). "Modify/Show" edita las definiciones.
          </div>
        </div>`,
      showDenyButton: true,
      denyButtonText: "Modify/Show Definitions...",
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cerrar",
      confirmButtonColor: "#1d4ed8",
      denyButtonColor: "#475569",
      preConfirm: () => ({
        scope: document.getElementById("slabsec-scope")?.value || "all",
        name: document.getElementById("slabsec-name")?.value || "__none__",
      }),
    });

    if (result.isDenied) { window.dispatchEvent(new CustomEvent("open-slab-sections-modal")); return; }
    if (!result.isConfirmed) return;

    const { scope, name } = result.value;
    let target;
    if (scope === "selected") target = selected;
    else if (scope === "all") target = allSlabs;
    else if (scope.startsWith("z:")) target = byZ.get(Number(scope.slice(2))) || [];
    else target = allSlabs;

    const sec = name === "__none__" ? null : sections.find((s) => s.name === name);
    target.forEach((slab) => {
      slab.slabSection = sec ? sec.name : null;
      // Peso propio de la losa (kgf/m²). Usa el de la sección si lo trae; si no,
      // lo calcula aquí: espesor(m) × densidad del material. Así no depende de
      // que la sección se haya re-guardado por el modal de Slab Sections.
      slab.slabSelfWeightKgM2 = sec ? this._slabSectionSelfWeightKgM2(sec) : 0;
      slab.section = sec ? { name: sec.name, thickness: sec.thickness, material: sec.material } : null;
    });
    this.markAnalysisResultsOutdated?.("Se asignó sección de losa.");
    this.redraw?.();
    this.showMessage?.(`Sección "${name === "__none__" ? "None" : name}" asignada a ${target.length} losa(s).`);
  },

  // Peso propio de una sección de losa en kgf/m² = espesor(m) × densidad(kg/m³).
  // Usa selfWeightKgM2 si la sección lo trae; si no, lo calcula del material.
  _slabSectionSelfWeightKgM2(sec) {
    if (!sec) return 0;
    const explicit = Number(sec.selfWeightKgM2);
    if (explicit > 0) return explicit;
    const t = (Number(sec.thickness) || 0) / 1000; // mm → m
    const mats = this.materialProperties?.materials || [];
    const mat = mats.find((m) => m.name === sec.material);
    const mpv = Number(mat?.massPerUnitVolume); // ton/mm³ (ETABS N-mm) → ×1e12 = kg/m³
    const rho = (mpv > 0 && mpv < 1e-3) ? mpv * 1e12 : 2400;
    return t * rho;
  },

  // =====================================================
  // ASSIGN > JOINT / POINT LOADS > GROUND DISPLACEMENT
  // =====================================================

  getDefaultJointGroundDisplacementLoad() {
    return {
      id: `JDISP_${Date.now()}`,
      type: "ground-displacement",
      loadCase: "DEAD",
      coordinateSystem: "Global",

      displacements: {
        ux: 0,
        uy: 0,
        uz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
      },
    };
  },

  // Joint > Point Loads > Ground Displacement
  async openAssignJointGroundDisplacementDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const current = this.getDefaultJointGroundDisplacementLoad();
    current.loadCase = "CM";

    const t = this.getUnifiedAssignTheme();

    await Swal.fire({
      title: "Joint Load Assignment - Ground Displacement",
      width: 620,
      background: t.bg,
      color: t.text,
      showConfirmButton: false,
      showCancelButton: false,
      allowOutsideClick: false,
      html: `
      <div style="${this.getUnifiedAssignWrapperStyle()}">

        <div style="${this.getUnifiedAssignSectionStyle()}; margin-bottom:12px;">
          <label style="${this.getUnifiedAssignLabelStyle()}">Load Pattern Name</label>
          <select id="joint-disp-loadpattern" style="${this.getUnifiedAssignFieldStyle()}">
            ${this.buildLoadPatternOptionsHtml(current.loadCase)}
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 1.3fr 1fr; gap:12px; margin-bottom:12px;">
          <fieldset style="${this.getUnifiedAssignFieldsetStyle()}">
            <legend style="${this.getUnifiedAssignLegendStyle()}">Displacements</legend>

            ${this.buildJointForceInputRow("Translation X", "joint-disp-ux", 0, "m")}
            ${this.buildJointForceInputRow("Translation Y", "joint-disp-uy", 0, "m")}
            ${this.buildJointForceInputRow("Translation Z", "joint-disp-uz", 0, "m")}
            ${this.buildJointForceInputRow("Rotation about XX", "joint-disp-rx", 0, "rad")}
            ${this.buildJointForceInputRow("Rotation about YY", "joint-disp-ry", 0, "rad")}
            ${this.buildJointForceInputRow("Rotation about ZZ", "joint-disp-rz", 0, "rad")}
          </fieldset>

          <fieldset style="${this.getUnifiedAssignFieldsetStyle()}">
            <legend style="${this.getUnifiedAssignLegendStyle()}">Options</legend>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px; color:${t.text};">
              <input type="radio" name="joint-disp-operation" value="add">
              Add to Existing Loads
            </label>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px; color:${t.text};">
              <input type="radio" name="joint-disp-operation" value="replace" checked>
              Replace Existing Loads
            </label>

            <label style="display:flex; align-items:center; gap:8px; color:${t.text};">
              <input type="radio" name="joint-disp-operation" value="delete">
              Delete Existing Loads
            </label>
          </fieldset>
        </div>

        <div style="${this.getUnifiedAssignNoteStyle()}">
          Nodos seleccionados: <b style="color:${t.text};">${selectedJoints.length}</b>
        </div>

        <div style="display:flex; justify-content:center; gap:14px; margin-top:18px;">
          <button id="joint-disp-ok" style="${this.getUnifiedAssignButtonStyle("primary")}">OK</button>
          <button id="joint-disp-close" style="${this.getUnifiedAssignButtonStyle("secondary")}">Close</button>
          <button id="joint-disp-apply" style="${this.getUnifiedAssignButtonStyle("primary")}">Apply</button>
        </div>
      </div>
    `,
      didOpen: () => {
        const applyAssignment = (shouldClose = false) => {
          const load = this.readJointGroundDisplacementFromDialog();
          if (!load) return;

          if (!this.isLoadPatternImplemented(load.loadCase)) {
            this.showMessage?.(
              `El patrón ${load.loadCase} existe como referencia ETABS, pero su implementación está pendiente.`,
              "warning"
            );
            return;
          }

          this.assignJointGroundDisplacementToSelected(load);
          if (shouldClose) Swal.close();
        };

        document.getElementById("joint-disp-ok")?.addEventListener("click", () => applyAssignment(true));
        document.getElementById("joint-disp-apply")?.addEventListener("click", () => applyAssignment(false));
        document.getElementById("joint-disp-close")?.addEventListener("click", () => Swal.close());

        const updateDeleteState = () => {
          const operation =
            document.querySelector('input[name="joint-disp-operation"]:checked')?.value || "replace";

          const disabled = operation === "delete";

          [
            "joint-disp-ux",
            "joint-disp-uy",
            "joint-disp-uz",
            "joint-disp-rx",
            "joint-disp-ry",
            "joint-disp-rz",
          ].forEach((id) => {
            const input = document.getElementById(id);
            if (input) {
              input.disabled = disabled;
              input.style.background = disabled ? t.disabledBg : t.panel;
              input.style.color = disabled ? t.disabledText : t.text;
            }
          });
        };

        document.querySelectorAll('input[name="joint-disp-operation"]').forEach((radio) => {
          radio.addEventListener("change", updateDeleteState);
        });

        updateDeleteState();
      },
    });
  },

  readJointGroundDisplacementFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    return {
      id: `JDISP_${Date.now()}`,
      type: "ground-displacement",

      loadCase: document.getElementById("joint-disp-loadpattern")?.value || "CM",
      loadPattern: document.getElementById("joint-disp-loadpattern")?.value || "CM",

      coordinateSystem: "Global",

      operation:
        document.querySelector('input[name="joint-disp-operation"]:checked')?.value || "replace",

      displacements: {
        ux: readNumber("joint-disp-ux"),
        uy: readNumber("joint-disp-uy"),
        uz: readNumber("joint-disp-uz"),
        rx: readNumber("joint-disp-rx"),
        ry: readNumber("joint-disp-ry"),
        rz: readNumber("joint-disp-rz"),
      },
    };
  },



  jointGroundDisplacementHasValues(load) {
    if (!load?.displacements) return false;

    const d = load.displacements;

    return (
      Number(d.ux || 0) !== 0 ||
      Number(d.uy || 0) !== 0 ||
      Number(d.uz || 0) !== 0 ||
      Number(d.rx || 0) !== 0 ||
      Number(d.ry || 0) !== 0 ||
      Number(d.rz || 0) !== 0
    );
  },

  assignJointGroundDisplacementToSelected(load) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedJoints.forEach((joint) => {
      if (!Array.isArray(joint.pointLoads)) {
        joint.pointLoads = [];
      }

      if (!Array.isArray(joint.jointLoads)) {
        joint.jointLoads = [];
      }

      if (operation === "delete") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "ground-displacement" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "ground-displacement" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "ground-displacement" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "ground-displacement" && item.loadCase === loadCase);
        });

        if (this.jointGroundDisplacementHasValues(load)) {
          const cleanLoad = {
            ...JSON.parse(JSON.stringify(load)),
            operation: undefined,
          };

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.jointGroundDisplacementHasValues(load)) {
          const cleanLoad = {
            ...JSON.parse(JSON.stringify(load)),
            operation: undefined,
          };

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      joint.hasPointLoads = Array.isArray(joint.pointLoads) && joint.pointLoads.length > 0;
      joint.hasJointLoads = joint.hasPointLoads;

      joint.assignment = {
        ...(joint.assignment || {}),
        pointLoads: joint.pointLoads,
        jointLoads: joint.jointLoads,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    // this.redraw?.();
    this.displayOptions = {
      ...(this.displayOptions || {}),
      showJointLoads: true,
      jointLoadPattern: load.loadPattern || load.loadCase || "CM",
      jointLoadDisplayType: "ground-displacement",
    };

    this.redraw?.();
    this.sync3D?.();

    const actionText = operation === "delete" ? "removidos" : "asignados";

    this.showMessage?.(`Ground Displacements ${actionText} en ${selectedJoints.length} nodo(s).`);

    console.log("✅ Joint / Point Ground Displacement asignado:", {
      load,
      selectedJoints,
    });
  },

  // =====================================================
  // ASSIGN > JOINT / POINT LOADS > TEMPERATURE
  // =====================================================

  getDefaultJointTemperatureLoad() {
    return {
      id: `JTEMP_${Date.now()}`,
      type: "temperature",
      loadCase: "DEAD",
      coordinateSystem: "Global",

      temperature: {
        deltaT: 0,
        initialTemperature: 20,
        finalTemperature: 20,
      },
    };
  },

  assignJointTemperatureToSelected(load) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedJoints.forEach((joint) => {
      if (!Array.isArray(joint.pointLoads)) {
        joint.pointLoads = [];
      }

      if (!Array.isArray(joint.jointLoads)) {
        joint.jointLoads = [];
      }

      if (operation === "delete") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        if (this.jointTemperatureHasValues(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.jointTemperatureHasValues(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      joint.hasPointLoads = Array.isArray(joint.pointLoads) && joint.pointLoads.length > 0;
      joint.hasJointLoads = joint.hasPointLoads;

      joint.assignment = {
        ...(joint.assignment || {}),
        pointLoads: joint.pointLoads,
        jointLoads: joint.jointLoads,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    // this.redraw?.();
    this.displayOptions = {
      ...(this.displayOptions || {}),
      showJointLoads: true,
      jointLoadPattern: load.loadPattern || load.loadCase || "CM",
      jointLoadDisplayType: "temperature",
    };

    this.redraw?.();
    this.sync3D?.();

    const actionText = operation === "delete" ? "removidas" : "asignadas";

    this.showMessage?.(`Cargas de temperatura ${actionText} en ${selectedJoints.length} nodo(s).`);

    console.log("✅ Joint / Point Temperature asignado:", {
      load,
      selectedJoints,
    });
  },

  // =====================================================
  // ASSIGN > FRAME / LINE LOADS > POINT
  // =====================================================

  getDefaultFramePointLoad() {
    return {
      id: `FPOINT_${Date.now()}`,
      type: "point",
      loadCase: "DEAD",
      coordinateSystem: "Global",

      loadType: "force", // force | moment
      direction: "FZ",

      distanceType: "relative", // relative | absolute
      relativeDistance: 0.5,
      absoluteDistance: 0,

      value: -10,
    };
  },

  async openAssignFramePointLoadDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const loadCases = this.getAvailableLoadCasesForAssign();
    const current = this.getDefaultFramePointLoad();

    if (loadCases.length > 0) {
      current.loadCase = loadCases[0].name;
    }

    const result = await Swal.fire({
      title: "Assign Frame / Line Loads - Point",
      width: 760,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna una carga puntual sobre los elementos Frame / Line seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Case</label>
            <select id="frame-point-loadcase" style="width:100%; padding:7px;">
              ${loadCases
          .map(
            (lc) => `
                <option value="${lc.name}">${lc.name} (${lc.type})</option>
              `,
          )
          .join("")}
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Coordinate System</label>
            <select id="frame-point-csys" style="width:100%; padding:7px;">
              <option value="Global">Global</option>
              <option value="Local">Local</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="frame-point-operation" style="width:100%; padding:7px;">
              <option value="replace">Replace Existing Loads</option>
              <option value="add">Add to Existing Loads</option>
              <option value="delete">Delete Existing Loads</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Type</label>
            <select id="frame-point-loadtype" style="width:100%; padding:7px;">
              <option value="force">Force</option>
              <option value="moment">Moment</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Direction</label>
            <select id="frame-point-direction" style="width:100%; padding:7px;">
              <option value="FX">FX</option>
              <option value="FY">FY</option>
              <option value="FZ" selected>FZ</option>
              <option value="MX">MX</option>
              <option value="MY">MY</option>
              <option value="MZ">MZ</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Value</label>
            <input id="frame-point-value" type="number" step="0.001" value="-10"
              style="width:100%; padding:7px;">
          </div>
        </div>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Load Location
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">Distance Type</label>
              <select id="frame-point-distance-type" style="width:100%; padding:7px;">
                <option value="relative">Relative Distance</option>
                <option value="absolute">Absolute Distance from I-End</option>
              </select>
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Relative Distance</label>
              <input id="frame-point-relative-distance" type="number" step="0.01" min="0" max="1" value="0.5"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Absolute Distance</label>
              <input id="frame-point-absolute-distance" type="number" step="0.001" min="0" value="0"
                style="width:100%; padding:7px;">
            </div>
          </div>

          <p style="font-size:12px; color:#777; margin-top:8px;">
            Relative Distance: 0 = extremo I, 1 = extremo J.
          </p>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Elementos Frame / Line seleccionados: <b>${selectedFrames.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readFramePointLoadFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFramePointLoadToSelected(result.value);
  },

  readFramePointLoadFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    let relativeDistance = readNumber("frame-point-relative-distance");

    if (relativeDistance < 0) relativeDistance = 0;
    if (relativeDistance > 1) relativeDistance = 1;

    return {
      id: `FPOINT_${Date.now()}`,
      type: "point",

      loadCase: document.getElementById("frame-point-loadcase")?.value || "DEAD",

      coordinateSystem: document.getElementById("frame-point-csys")?.value || "Global",

      operation: document.getElementById("frame-point-operation")?.value || "replace",

      loadType: document.getElementById("frame-point-loadtype")?.value || "force",

      direction: document.getElementById("frame-point-direction")?.value || "FZ",

      distanceType: document.getElementById("frame-point-distance-type")?.value || "relative",

      relativeDistance,

      absoluteDistance: readNumber("frame-point-absolute-distance"),

      value: readNumber("frame-point-value"),
    };
  },

  framePointLoadHasValue(load) {
    return Number(load?.value || 0) !== 0;
  },

  assignFramePointLoadToSelected(load) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedFrames.forEach((frame) => {
      if (!Array.isArray(frame.frameLoads)) {
        frame.frameLoads = [];
      }

      if (!Array.isArray(frame.lineLoads)) {
        frame.lineLoads = [];
      }

      if (operation === "delete") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "point" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "point" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "point" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "point" && item.loadCase === loadCase);
        });

        if (this.framePointLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.framePointLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      frame.hasFrameLoads = Array.isArray(frame.frameLoads) && frame.frameLoads.length > 0;

      frame.hasLineLoads = frame.hasFrameLoads;

      frame.assignment = {
        ...(frame.assignment || {}),
        frameLoads: frame.frameLoads,
        lineLoads: frame.lineLoads,
      };

      this._syncFrameLoadAssignmentStoreForFrame?.(frame);
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    const actionText = operation === "delete" ? "removidas" : "asignadas";

    this.showMessage?.(`Cargas puntuales ${actionText} en ${selectedFrames.length} elemento(s) Frame / Line.`);

    console.log("✅ Frame / Line Point Load asignado:", {
      load,
      selectedFrames,
    });
  },

  // =====================================================
  // ASSIGN > FRAME / LINE LOADS > DISTRIBUTED
  // =====================================================

  getDefaultFrameDistributedLoad() {
    return {
      id: `FDIST_${Date.now()}`,
      type: "distributed",
      loadCase: "DEAD",
      coordinateSystem: "Global",

      loadType: "force", // force | moment
      direction: "Gravity", // Gravity | X | Y | Z (dirección de aplicación estilo ETABS)

      distributionType: "uniform", // uniform | trapezoidal

      distanceType: "relative", // relative | absolute

      startRelativeDistance: 0,
      endRelativeDistance: 1,

      startAbsoluteDistance: 0,
      endAbsoluteDistance: 0,

      startValue: -5,
      endValue: -5,
    };
  },

  async openAssignFrameDistributedLoadDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const loadCases = this.getAvailableLoadCasesForAssign();
    const current = this.getDefaultFrameDistributedLoad();

    if (loadCases.length > 0) {
      current.loadCase = loadCases[0].name;
    }

    const hasCM = loadCases.some((lc) => String(lc.name).toUpperCase() === "CM");

    // Etiqueta de unidad de carga distribuida según el selector global (units.js):
    // "tonf/m", "kgf/cm", etc. El modal se adapta a las unidades activas.
    const distLabel = window.cadUnits?.labels?.().distLoad || "tonf/m";

    const result = await Swal.fire({
      title: "Frame Load Assignment - Distributed",
      width: 640,
      background: "#1a2035",
      color: "#e2e8f0",
      confirmButtonColor: "#1d4ed8",
      html: `
      <style>
        #fdist-body input, #fdist-body select {
          background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px;
        }
        #fdist-body fieldset { color:#e2e8f0; }
        #fdist-body legend { color:#7eb8f7; }
        #fdist-body th { color:#94a3b8; font-weight:600; }
      </style>
      <div id="fdist-body" style="text-align:left; font-size:13px; color:#e2e8f0;">

        <!-- Load Pattern Name -->
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <label style="min-width:150px; font-weight:600;">Load Pattern Name</label>
          <select id="frame-dist-loadcase" style="flex:1; padding:7px;">
            ${loadCases
          .map(
            (lc) => `
              <option value="${lc.name}" ${
              (hasCM && String(lc.name).toUpperCase() === "CM") ? "selected" : ""
            }>${lc.name}</option>
            `,
          )
          .join("")}
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:14px;">

          <!-- Load Type and Direction -->
          <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px 12px; margin:0;">
            <legend style="padding:0 6px; font-weight:600;">Load Type and Direction</legend>

            <div style="display:flex; gap:20px; margin-bottom:12px;">
              <label style="display:flex; align-items:center; gap:6px;">
                <input type="radio" name="frame-dist-loadtype" value="force" checked> Forces
              </label>
              <label style="display:flex; align-items:center; gap:6px;">
                <input type="radio" name="frame-dist-loadtype" value="moment"> Moments
              </label>
            </div>

            <label style="display:block; margin-bottom:5px;">Direction of Load Application</label>
            <select id="frame-dist-direction" style="width:100%; padding:7px;">
              <option value="Gravity" selected>Gravity</option>
              <option value="X">X</option>
              <option value="Y">Y</option>
              <option value="Z">Z</option>
            </select>
          </fieldset>

          <!-- Options -->
          <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px 12px; margin:0;">
            <legend style="padding:0 6px; font-weight:600;">Options</legend>

            <label style="display:flex; align-items:center; gap:6px; margin-bottom:9px;">
              <input type="radio" name="frame-dist-operation" value="add"> Add to Existing Loads
            </label>
            <label style="display:flex; align-items:center; gap:6px; margin-bottom:9px;">
              <input type="radio" name="frame-dist-operation" value="replace" checked> Replace Existing Loads
            </label>
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="frame-dist-operation" value="delete"> Delete Existing Loads
            </label>
          </fieldset>
        </div>

        <!-- Trapezoidal Loads -->
        <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px 12px; margin:0 0 14px;">
          <legend style="padding:0 6px; font-weight:600;">Trapezoidal Loads</legend>

          <table style="width:100%; border-collapse:collapse; text-align:center; font-size:12.5px;">
            <thead>
              <tr style="color:#94a3b8;">
                <th style="width:70px;"></th><th>1.</th><th>2.</th><th>3.</th><th>4.</th><th style="width:56px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align:left; padding:3px 0;">Distance</td>
                <td><input id="frame-dist-d1" type="number" step="0.01" value="0"  style="width:64px; padding:5px;"></td>
                <td><input id="frame-dist-d2" type="number" step="0.01" value="0.25" style="width:64px; padding:5px;"></td>
                <td><input id="frame-dist-d3" type="number" step="0.01" value="0.75" style="width:64px; padding:5px;"></td>
                <td><input id="frame-dist-d4" type="number" step="0.01" value="1"  style="width:64px; padding:5px;"></td>
                <td></td>
              </tr>
              <tr>
                <td style="text-align:left; padding:3px 0;">Load</td>
                <td><input id="frame-dist-l1" type="number" step="0.001" value="0" style="width:64px; padding:5px;"></td>
                <td><input id="frame-dist-l2" type="number" step="0.001" value="0" style="width:64px; padding:5px;"></td>
                <td><input id="frame-dist-l3" type="number" step="0.001" value="0" style="width:64px; padding:5px;"></td>
                <td><input id="frame-dist-l4" type="number" step="0.001" value="0" style="width:64px; padding:5px;"></td>
                <td style="color:#94a3b8;">${distLabel}</td>
              </tr>
            </tbody>
          </table>

          <div style="display:flex; gap:20px; margin-top:12px;">
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="frame-dist-distance-type" value="relative" checked> Relative Distance from End-I
            </label>
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="frame-dist-distance-type" value="absolute"> Absolute Distance from End-I
            </label>
          </div>
        </fieldset>

        <!-- Uniform Load -->
        <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px 12px; margin:0;">
          <legend style="padding:0 6px; font-weight:600;">Uniform Load</legend>
          <div style="display:flex; align-items:center; gap:10px;">
            <label style="min-width:56px;">Load</label>
            <input id="frame-dist-uniform" type="number" step="0.001" value="0" style="width:120px; padding:7px;">
            <span style="color:#94a3b8;">${distLabel}</span>
          </div>
        </fieldset>

        <div style="margin-top:12px; color:#94a3b8; font-size:12px;">
          Frames seleccionados: <b>${selectedFrames.length}</b>. Para <b>Gravity</b> ingresa el valor positivo
          (la carga actúa hacia abajo). Si usas <b>Uniform Load</b> tiene prioridad sobre la tabla trapezoidal.
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Close",

      didOpen: () => {
        // Al escribir en Uniform Load, se limpian los valores trapezoidales
        // (y viceversa), como en ETABS: se usa una forma u otra, no ambas.
        const uniform = document.getElementById("frame-dist-uniform");
        const trapLoads = ["frame-dist-l1", "frame-dist-l2", "frame-dist-l3", "frame-dist-l4"]
          .map((id) => document.getElementById(id));

        uniform?.addEventListener("input", () => {
          if (Number(uniform.value) !== 0) {
            trapLoads.forEach((el) => { if (el) el.value = "0"; });
          }
        });

        trapLoads.forEach((el) => {
          el?.addEventListener("input", () => {
            if (Number(el.value) !== 0 && uniform) uniform.value = "0";
          });
        });
      },

      preConfirm: () => {
        return this.readFrameDistributedLoadFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameDistributedLoadToSelected(result.value);
  },

  readFrameDistributedLoadFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    const readRadio = (name) =>
      document.querySelector(`input[name="${name}"]:checked`)?.value;

    // El usuario escribe en la unidad activa del selector (units.js): tonf/m,
    // kgf/cm, etc. El motor consume la carga distribuida en N/m, así que se
    // convierte con cadUnits (1 tonf/m = 9806.65 N/m, 1 kgf/cm = 980.665 N/m…).
    // Fallback a tonf/m (×9806.65) si el módulo de unidades no está disponible.
    const dispUnit = window.cadUnits?.labels?.().distLoad || "tonf/m";
    const toNPerM = (v) =>
      typeof window.cadUnits?.distLoadDispToNPerM === "function"
        ? window.cadUnits.distLoadDispToNPerM(v)
        : (Number(v) || 0) * 9806.65;

    const loadCase = document.getElementById("frame-dist-loadcase")?.value || "DEAD";
    const loadType = readRadio("frame-dist-loadtype") || "force";
    const direction = document.getElementById("frame-dist-direction")?.value || "Gravity";
    const operation = readRadio("frame-dist-operation") || "replace";
    const distanceType = readRadio("frame-dist-distance-type") || "relative";

    // Uniform Load tiene prioridad; si es 0 se usa la tabla trapezoidal.
    const uniformDisp = readNumber("frame-dist-uniform");

    const dist = [
      readNumber("frame-dist-d1"),
      readNumber("frame-dist-d2"),
      readNumber("frame-dist-d3"),
      readNumber("frame-dist-d4"),
    ];
    const loadDisp = [
      readNumber("frame-dist-l1"),
      readNumber("frame-dist-l2"),
      readNumber("frame-dist-l3"),
      readNumber("frame-dist-l4"),
    ];

    let distributionType;
    let startDistance;
    let endDistance;
    let startValueDisp;
    let endValueDisp;

    if (Math.abs(uniformDisp) > 0) {
      // Carga uniforme sobre todo el tramo (End-I → End-J).
      distributionType = "uniform";
      startDistance = 0;
      endDistance = 1;
      startValueDisp = uniformDisp;
      endValueDisp = uniformDisp;
    } else {
      // Trapezoidal: se toman los puntos extremos (1 y 4) de la tabla.
      distributionType = "trapezoidal";
      startDistance = dist[0];
      endDistance = dist[3];
      startValueDisp = loadDisp[0];
      endValueDisp = loadDisp[3];
    }

    // Conversión de la unidad activa → N/m para el motor.
    const startValue = toNPerM(startValueDisp);
    const endValue = toNPerM(endValueDisp);

    const isRelative = distanceType === "relative";

    let startRelativeDistance = isRelative ? startDistance : 0;
    let endRelativeDistance = isRelative ? endDistance : 1;

    startRelativeDistance = Math.max(0, Math.min(1, startRelativeDistance));
    endRelativeDistance = Math.max(0, Math.min(1, endRelativeDistance));

    if (endRelativeDistance < startRelativeDistance) {
      const temp = startRelativeDistance;
      startRelativeDistance = endRelativeDistance;
      endRelativeDistance = temp;
    }

    return {
      id: `FDIST_${Date.now()}`,
      type: "distributed",

      loadCase,
      coordinateSystem: "Global",
      operation,
      loadType,
      direction,
      distributionType,
      distanceType,

      startRelativeDistance,
      endRelativeDistance,

      startAbsoluteDistance: isRelative ? 0 : startDistance,
      endAbsoluteDistance: isRelative ? 0 : endDistance,

      // Valores en N/m (unidad interna del motor). Se guarda también el valor
      // en la unidad de display y su etiqueta por trazabilidad / edición futura.
      startValue,
      endValue,
      startValueDisp,
      endValueDisp,
      displayUnit: dispUnit,
    };
  },

  frameDistributedLoadHasValue(load) {
    return Number(load?.startValue || 0) !== 0 || Number(load?.endValue || 0) !== 0;
  },

  _syncFrameLoadAssignmentStoreForFrame(frame) {
    if (!frame) return;

    const frameId = Number(
      frame.id ??
      frame.frameId ??
      frame.frame_id ??
      frame.objectId ??
      frame.object_id
    );

    if (!Number.isFinite(frameId)) return;

    if (!this.frameLoadAssignmentsById || typeof this.frameLoadAssignmentsById !== "object") {
      this.frameLoadAssignmentsById = {};
    }

    const rawLoads = [
      ...(Array.isArray(frame.frameLoads) ? frame.frameLoads : []),
      ...(Array.isArray(frame.lineLoads) ? frame.lineLoads : []),
      ...(Array.isArray(frame.loads) ? frame.loads : []),
      ...(Array.isArray(frame.distributedLoads) ? frame.distributedLoads : []),
      ...(Array.isArray(frame.pointLoads) ? frame.pointLoads : []),
      ...(Array.isArray(frame.assignment?.frameLoads) ? frame.assignment.frameLoads : []),
      ...(Array.isArray(frame.assignment?.lineLoads) ? frame.assignment.lineLoads : []),
      ...(Array.isArray(frame.assignments?.frameLoads) ? frame.assignments.frameLoads : []),
      ...(Array.isArray(frame.assignments?.lineLoads) ? frame.assignments.lineLoads : []),
    ];

    const unique = [];
    const seen = new Set();

    rawLoads.forEach((load) => {
      if (!load || typeof load !== "object") return;

      const clean = JSON.parse(JSON.stringify(load));
      clean.frameId = frameId;
      clean.frame_id = frameId;

      const key = [
        clean.id,
        clean.type,
        clean.loadCase,
        clean.direction,
        clean.startValue,
        clean.endValue,
        clean.value,
        clean.relativeDistance,
      ].join("|");

      if (seen.has(key)) return;

      seen.add(key);
      unique.push(clean);
    });

    if (unique.length > 0) {
      this.frameLoadAssignmentsById[String(frameId)] = unique;
    } else {
      delete this.frameLoadAssignmentsById[String(frameId)];
    }

    this.frameLoadAssignments = Object.entries(this.frameLoadAssignmentsById)
      .flatMap(([id, loads]) => {
        return (loads || []).map(load => ({
          ...load,
          frameId: Number(id),
          frame_id: Number(id),
        }));
      });

    console.log("✅ Store global de cargas Frame actualizado:", {
      frameId,
      loads: this.frameLoadAssignmentsById[String(frameId)] || [],
      frameLoadAssignments: this.frameLoadAssignments,
    });
  },

  assignFrameDistributedLoadToSelected(load) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedFrames.forEach((frame) => {
      if (!Array.isArray(frame.frameLoads)) {
        frame.frameLoads = [];
      }

      if (!Array.isArray(frame.lineLoads)) {
        frame.lineLoads = [];
      }

      if (operation === "delete") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "distributed" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "distributed" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "distributed" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "distributed" && item.loadCase === loadCase);
        });

        if (this.frameDistributedLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.frameDistributedLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      frame.hasFrameLoads = Array.isArray(frame.frameLoads) && frame.frameLoads.length > 0;

      frame.hasLineLoads = frame.hasFrameLoads;

      frame.assignment = {
        ...(frame.assignment || {}),
        frameLoads: frame.frameLoads,
        lineLoads: frame.lineLoads,
      };

      this._syncFrameLoadAssignmentStoreForFrame?.(frame);
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    const actionText = operation === "delete" ? "removidas" : "asignadas";

    this.showMessage?.(`Cargas distribuidas ${actionText} en ${selectedFrames.length} elemento(s) Frame / Line.`);

    console.log("✅ Frame / Line Distributed Load asignado:", {
      load,
      selectedFrames,
    });
  },

  // =====================================================
  // ASSIGN > FRAME > LOCAL AXES (ROTACIÓN)
  // Rotación del eje local en planta. Para columnas rectangulares define
  // hacia dónde apunta el peralte (eje fuerte Iz). El motor lo usa en
  // _frameVecxzForSeismic; la vista en planta dibuja el rectángulo girado.
  // =====================================================
  async openAssignFrameLocalAxesDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero una o más columnas / elementos Frame.", "warning");
      return;
    }

    const current = Number(selectedFrames[0]?.localAxisAngle || 0);

    const result = await Swal.fire({
      title: "Frame Local Axes - Rotation",
      width: 470,
      background: "#1a2035",
      color: "#e2e8f0",
      confirmButtonColor: "#1d4ed8",
      html: `
        <div style="text-align:left; font-size:13px; color:#e2e8f0;">
          <p style="color:#94a3b8; margin-bottom:14px;">
            Ángulo de rotación del eje local en planta. En columnas rectangulares
            define hacia dónde apunta el peralte (eje fuerte Iz). Positivo = antihorario.
          </p>

          <div style="display:flex; align-items:center; gap:10px;">
            <label style="min-width:110px; font-weight:600;">Angle (deg)</label>
            <input id="frame-localaxis-angle" type="number" step="1" value="${current}"
              style="width:120px; padding:7px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px;">
            <span style="color:#94a3b8;">°</span>
          </div>

          <div style="margin-top:14px; color:#94a3b8; font-size:12px;">
            Frames seleccionados: <b>${selectedFrames.length}</b>. 90° intercambia el eje fuerte entre X e Y.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Close",
      preConfirm: () => {
        const v = Number(document.getElementById("frame-localaxis-angle")?.value);
        return { angle: Number.isFinite(v) ? v : 0 };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameLocalAxesToSelected(result.value.angle);
  },

  assignFrameLocalAxesToSelected(angle) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame seleccionados.", "warning");
      return;
    }

    // Normaliza a [0, 360)
    let a = Number(angle) || 0;
    a = ((a % 360) + 360) % 360;

    selectedFrames.forEach((frame) => {
      frame.localAxisAngle = a;
      frame.assignment = {
        ...(frame.assignment || {}),
        localAxisAngle: a,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó la rotación de eje local de un frame.");
    this.redraw?.();

    this.showMessage?.(`Rotación de eje local (${a}°) asignada a ${selectedFrames.length} frame(s).`);

    console.log("✅ Frame Local Axes (rotación) asignado:", {
      angle: a,
      selectedFrames: selectedFrames.map((f) => f.id),
    });
  },

  // =====================================================
  // ASSIGN > FRAME / LINE LOADS > TEMPERATURE
  // =====================================================

  // Joint > Point Loads > Temperature
  async openAssignJointTemperatureDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const t = this.getUnifiedAssignTheme();

    await Swal.fire({
      title: "Joint Load Assignment - Temperature",
      width: 620,
      background: t.bg,
      color: t.text,
      showConfirmButton: false,
      showCancelButton: false,
      allowOutsideClick: false,
      html: `
      <div style="${this.getUnifiedAssignWrapperStyle()}">

        <div style="${this.getUnifiedAssignSectionStyle()}; margin-bottom:12px;">
          <label style="${this.getUnifiedAssignLabelStyle()}">Load Pattern Name</label>
          <select id="joint-temp-loadpattern" style="${this.getUnifiedAssignFieldStyle()}">
            ${this.buildLoadPatternOptionsHtml("CM")}
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 1.3fr 1fr; gap:12px; margin-bottom:12px;">
          <fieldset style="${this.getUnifiedAssignFieldsetStyle()}">
            <legend style="${this.getUnifiedAssignLegendStyle()}">Temperature</legend>
            ${this.buildJointForceInputRow("Temperature", "joint-temp-value", 0, "C")}
          </fieldset>

          <fieldset style="${this.getUnifiedAssignFieldsetStyle()}">
            <legend style="${this.getUnifiedAssignLegendStyle()}">Options</legend>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px; color:${t.text};">
              <input type="radio" name="joint-temp-operation" value="add">
              Add to Existing Values
            </label>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px; color:${t.text};">
              <input type="radio" name="joint-temp-operation" value="replace" checked>
              Replace Existing Values
            </label>

            <label style="display:flex; align-items:center; gap:8px; color:${t.text};">
              <input type="radio" name="joint-temp-operation" value="delete">
              Delete Existing Values
            </label>
          </fieldset>
        </div>

        <div style="${this.getUnifiedAssignNoteStyle()}">
          Nodos seleccionados: <b style="color:${t.text};">${selectedJoints.length}</b>
        </div>

        <div style="display:flex; justify-content:center; gap:14px; margin-top:18px;">
          <button id="joint-temp-ok" style="${this.getUnifiedAssignButtonStyle("primary")}">OK</button>
          <button id="joint-temp-close" style="${this.getUnifiedAssignButtonStyle("secondary")}">Close</button>
          <button id="joint-temp-apply" style="${this.getUnifiedAssignButtonStyle("primary")}">Apply</button>
        </div>
      </div>
    `,
      didOpen: () => {
        const applyAssignment = (shouldClose = false) => {
          const load = this.readJointTemperatureFromDialog();
          if (!load) return;

          if (!this.isLoadPatternImplemented(load.loadCase)) {
            this.showMessage?.(
              `El patrón ${load.loadCase} existe como referencia ETABS, pero su implementación está pendiente.`,
              "warning"
            );
            return;
          }

          this.assignJointTemperatureToSelected(load);
          if (shouldClose) Swal.close();
        };

        document.getElementById("joint-temp-ok")?.addEventListener("click", () => applyAssignment(true));
        document.getElementById("joint-temp-apply")?.addEventListener("click", () => applyAssignment(false));
        document.getElementById("joint-temp-close")?.addEventListener("click", () => Swal.close());

        const updateDeleteState = () => {
          const operation =
            document.querySelector('input[name="joint-temp-operation"]:checked')?.value || "replace";

          const disabled = operation === "delete";
          const input = document.getElementById("joint-temp-value");

          if (input) {
            input.disabled = disabled;
            input.style.background = disabled ? t.disabledBg : t.panel;
            input.style.color = disabled ? t.disabledText : t.text;
          }
        };

        document.querySelectorAll('input[name="joint-temp-operation"]').forEach((radio) => {
          radio.addEventListener("change", updateDeleteState);
        });

        updateDeleteState();
      },
    });
  },

  readJointTemperatureFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    const tempValue = readNumber("joint-temp-value");

    return {
      id: `JTEMP_${Date.now()}`,
      type: "temperature",

      loadCase: document.getElementById("joint-temp-loadpattern")?.value || "CM",
      loadPattern: document.getElementById("joint-temp-loadpattern")?.value || "CM",

      operation:
        document.querySelector('input[name="joint-temp-operation"]:checked')?.value || "replace",

      temperature: {
        value: tempValue,
        deltaT: tempValue,
        initialTemperature: 0,
        finalTemperature: tempValue,
      },
    };
  },

  jointTemperatureHasValues(load) {
    if (!load?.temperature) return false;

    const t = load.temperature;

    return (
      Number(t.value || 0) !== 0 ||
      Number(t.deltaT || 0) !== 0 ||
      Number(t.initialTemperature || 0) !== Number(t.finalTemperature || 0)
    );
  },

  getDefaultFrameTemperatureLoad() {
    return {
      id: `FTEMP_${Date.now()}`,
      type: "temperature",
      loadCase: "DEAD",
      operation: "replace",

      temperatureType: "uniform", // uniform | gradient2 | gradient3 | combined

      temperature: {
        initialTemperature: 20,
        finalTemperature: 30,
        deltaT: 10,

        gradient2: 0,
        gradient3: 0,
      },
    };
  },

  async openAssignFrameTemperatureLoadDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const loadCases = this.getAvailableLoadCasesForAssign();
    const current = this.getDefaultFrameTemperatureLoad();

    if (loadCases.length > 0) {
      current.loadCase = loadCases[0].name;
    }

    const result = await Swal.fire({
      title: "Assign Frame / Line Loads - Temperature",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna carga de temperatura a los elementos Frame / Line seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Case</label>
            <select id="frame-temp-loadcase" style="width:100%; padding:7px;">
              ${loadCases
          .map(
            (lc) => `
                <option value="${lc.name}">${lc.name} (${lc.type})</option>
              `,
          )
          .join("")}
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Temperature Type</label>
            <select id="frame-temp-type" style="width:100%; padding:7px;">
              <option value="uniform">Uniform Temperature Change</option>
              <option value="gradient2">Temperature Gradient 2</option>
              <option value="gradient3">Temperature Gradient 3</option>
              <option value="combined">Combined</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="frame-temp-operation" style="width:100%; padding:7px;">
              <option value="replace">Replace Existing Loads</option>
              <option value="add">Add to Existing Loads</option>
              <option value="delete">Delete Existing Loads</option>
            </select>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Dato</th>
              <th style="border:1px solid #555; padding:6px;">Valor</th>
              <th style="border:1px solid #555; padding:6px;">Unidad</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">Initial Temperature</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-initial" type="number" step="0.001" value="20" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Final Temperature</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-final" type="number" step="0.001" value="30" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Temperature Change ΔT</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-delta" type="number" step="0.001" value="10" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Gradient 2</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-gradient2" type="number" step="0.001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C/m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Gradient 3</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-gradient3" type="number" step="0.001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C/m</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          <span style="font-size:12px; color:#777;">
            En esta versión inicial se guarda la temperatura uniforme y gradientes. Luego el motor de análisis podrá usar estos datos.
          </span>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Elementos Frame / Line seleccionados: <b>${selectedFrames.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const initialInput = document.getElementById("frame-temp-initial");
        const finalInput = document.getElementById("frame-temp-final");
        const deltaInput = document.getElementById("frame-temp-delta");
        const typeSelect = document.getElementById("frame-temp-type");
        const gradient2Input = document.getElementById("frame-temp-gradient2");
        const gradient3Input = document.getElementById("frame-temp-gradient3");

        const updateDelta = () => {
          const ti = Number(initialInput?.value || 0);
          const tf = Number(finalInput?.value || 0);
          deltaInput.value = tf - ti;
        };

        const updateByType = () => {
          const type = typeSelect?.value || "uniform";

          if (type === "uniform") {
            gradient2Input.value = 0;
            gradient3Input.value = 0;
          }

          if (type === "gradient2") {
            deltaInput.value = 0;
            gradient3Input.value = 0;
          }

          if (type === "gradient3") {
            deltaInput.value = 0;
            gradient2Input.value = 0;
          }
        };

        initialInput?.addEventListener("input", updateDelta);
        finalInput?.addEventListener("input", updateDelta);
        typeSelect?.addEventListener("change", updateByType);
      },

      preConfirm: () => {
        return this.readFrameTemperatureLoadFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameTemperatureLoadToSelected(result.value);
  },

  readFrameTemperatureLoadFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    const initialTemperature = readNumber("frame-temp-initial");
    const finalTemperature = readNumber("frame-temp-final");

    return {
      id: `FTEMP_${Date.now()}`,
      type: "temperature",

      loadCase: document.getElementById("frame-temp-loadcase")?.value || "DEAD",

      operation: document.getElementById("frame-temp-operation")?.value || "replace",

      temperatureType: document.getElementById("frame-temp-type")?.value || "uniform",

      temperature: {
        initialTemperature,
        finalTemperature,
        deltaT: readNumber("frame-temp-delta"),
        gradient2: readNumber("frame-temp-gradient2"),
        gradient3: readNumber("frame-temp-gradient3"),
      },
    };
  },

  frameTemperatureLoadHasValue(load) {
    if (!load?.temperature) return false;

    const t = load.temperature;

    return (
      Number(t.deltaT || 0) !== 0 ||
      Number(t.gradient2 || 0) !== 0 ||
      Number(t.gradient3 || 0) !== 0 ||
      Number(t.initialTemperature || 0) !== Number(t.finalTemperature || 0)
    );
  },

  assignFrameTemperatureLoadToSelected(load) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedFrames.forEach((frame) => {
      if (!Array.isArray(frame.frameLoads)) {
        frame.frameLoads = [];
      }

      if (!Array.isArray(frame.lineLoads)) {
        frame.lineLoads = [];
      }

      if (operation === "delete") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        if (this.frameTemperatureLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.frameTemperatureLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      frame.hasFrameLoads = Array.isArray(frame.frameLoads) && frame.frameLoads.length > 0;

      frame.hasLineLoads = frame.hasFrameLoads;

      frame.assignment = {
        ...(frame.assignment || {}),
        frameLoads: frame.frameLoads,
        lineLoads: frame.lineLoads,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó una carga de temperatura en Frame / Line.");
    this.redraw?.();

    const actionText = operation === "delete" ? "removidas" : "asignadas";

    this.showMessage?.(`Cargas de temperatura ${actionText} en ${selectedFrames.length} elemento(s) Frame / Line.`);

    console.log("✅ Frame / Line Temperature Load asignado:", {
      load,
      selectedFrames,
    });
  },

  // =====================================================
  // ASSIGN > GROUP NAMES
  // =====================================================

  ensureGroupsContainer() {
    if (!this.groups) {
      this.groups = {
        items: [],
        selectedGroup: null,
      };
    }

    if (!Array.isArray(this.groups.items)) {
      this.groups.items = [];
    }
  },

  getDefaultGroupsForAssign() {
    return [
      {
        id: "G1",
        name: "G1",
        description: "Grupo general",
        members: [],
      },
    ];
  },

  getAvailableGroupsForAssign() {
    this.ensureGroupsContainer();

    if (this.groups.items.length === 0) {
      this.groups.items.push(...this.getDefaultGroupsForAssign());
    }

    return this.groups.items.map((group, index) => {
      const id = group.id || group.name || `G${index + 1}`;

      const name = group.name || group.groupName || String(id);

      return {
        ...group,
        id,
        name,
        members: Array.isArray(group.members) ? group.members : [],
      };
    });
  },

  getSelectedObjectsForGroupAssign() {
    return this.getSelectedObjects?.() || [];
  },

  getAssignableObjectType(obj) {
    if (!obj) return "unknown";

    const type = String(obj.objectType || obj.elementType || obj.type || obj.constructor?.name || "").toLowerCase();

    if (obj.node1 && obj.node2) {
      return "frame";
    }

    if (
      obj.position ||
      obj.isNode === true ||
      type === "node" ||
      type === "structuralnode" ||
      type === "joint" ||
      type === "point"
    ) {
      return "joint";
    }

    if (Array.isArray(obj.points) || type === "area" || type === "slab" || type === "wall" || type === "opening") {
      return "area";
    }

    return type || "object";
  },

  getAssignableObjectId(obj) {
    if (!obj) return null;

    return obj.id || obj._id || obj.name || null;
  },

  getAssignableObjectDescriptor(obj) {
    return {
      objectType: this.getAssignableObjectType(obj),
      id: this.getAssignableObjectId(obj),
    };
  },

  createGroupForAssign(name = "G1") {
    this.ensureGroupsContainer();

    const cleanName = String(name || "").trim();

    if (!cleanName) {
      this.showMessage?.("El nombre del grupo no puede estar vacío.", "warning");
      return null;
    }

    const exists = this.groups.items.find((group) => {
      return String(group.id || group.name) === cleanName;
    });

    if (exists) {
      return exists;
    }

    const newGroup = {
      id: cleanName,
      name: cleanName,
      description: "",
      members: [],
    };

    this.groups.items.push(newGroup);

    return newGroup;
  },

  async openAssignGroupNamesDialog() {
    const selectedObjects = this.getSelectedObjectsForGroupAssign();

    if (!selectedObjects.length) {
      this.showMessage?.("Selecciona primero uno o más objetos.", "warning");
      return;
    }

    const groups = this.getAvailableGroupsForAssign();

    const groupRows = groups
      .map((group, index) => {
        return `
      <label style="display:flex; align-items:center; gap:8px; padding:6px; border-bottom:1px solid #444;">
        <input type="checkbox" class="assign-group-checkbox" value="${group.id}">
        <span>${group.name}</span>
      </label>
    `;
      })
      .join("");

    const result = await Swal.fire({
      title: "Assign Group Names",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna los objetos seleccionados a uno o más grupos.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="assign-group-operation" style="width:100%; padding:7px;">
              <option value="add">Add to Groups</option>
              <option value="replace">Replace Groups</option>
              <option value="remove">Remove from Groups</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">New Group Name</label>
            <input id="assign-group-new-name" type="text" placeholder="Ej: Vigas_Piso_1"
              style="width:100%; padding:7px;">
          </div>
        </div>

        <button id="assign-group-create-btn"
          style="padding:7px 12px; background:#2563eb; color:white; border:none; border-radius:5px; margin-bottom:12px;">
          Crear grupo
        </button>

        <div style="border:1px solid #555; border-radius:6px; max-height:220px; overflow:auto;">
          <div id="assign-group-list">
            ${groupRows}
          </div>
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          Objetos seleccionados: <b>${selectedObjects.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const createBtn = document.getElementById("assign-group-create-btn");
        const input = document.getElementById("assign-group-new-name");
        const list = document.getElementById("assign-group-list");

        createBtn?.addEventListener("click", () => {
          const name = input?.value?.trim();

          if (!name) {
            this.showMessage?.("Escribe un nombre de grupo.", "warning");
            return;
          }

          const group = this.createGroupForAssign(name);

          if (!group) return;

          const alreadyRendered = list.querySelector(`input[value="${group.id}"]`);

          if (!alreadyRendered) {
            const wrapper = document.createElement("label");
            wrapper.style.cssText =
              "display:flex; align-items:center; gap:8px; padding:6px; border-bottom:1px solid #444;";

            wrapper.innerHTML = `
            <input type="checkbox" class="assign-group-checkbox" value="${group.id}" checked>
            <span>${group.name}</span>
          `;

            list.appendChild(wrapper);
          }

          input.value = "";
        });
      },

      preConfirm: () => {
        const checked = Array.from(document.querySelectorAll(".assign-group-checkbox:checked")).map(
          (item) => item.value,
        );

        const operation = document.getElementById("assign-group-operation")?.value || "add";

        if (!checked.length) {
          Swal.showValidationMessage("Selecciona al menos un grupo.");
          return false;
        }

        return {
          operation,
          groupIds: checked,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignGroupNamesToSelected(result.value);
  },

  assignGroupNamesToSelected(config) {
    const selectedObjects = this.getSelectedObjectsForGroupAssign();

    if (!selectedObjects.length) {
      this.showMessage?.("No hay objetos seleccionados.", "warning");
      return;
    }

    this.ensureGroupsContainer();

    const operation = config.operation || "add";
    const groupIds = config.groupIds || [];

    const groups = this.getAvailableGroupsForAssign().filter((group) => {
      return groupIds.includes(String(group.id));
    });

    if (!groups.length) {
      this.showMessage?.("No se encontraron grupos válidos.", "warning");
      return;
    }

    selectedObjects.forEach((obj) => {
      if (!Array.isArray(obj.groupIds)) {
        obj.groupIds = [];
      }

      if (!Array.isArray(obj.groupNames)) {
        obj.groupNames = [];
      }

      if (operation === "replace") {
        obj.groupIds = [];
        obj.groupNames = [];
      }

      if (operation === "remove") {
        obj.groupIds = obj.groupIds.filter((id) => !groupIds.includes(String(id)));
        obj.groupNames = obj.groupNames.filter((name) => !groupIds.includes(String(name)));
      }

      if (operation === "add" || operation === "replace") {
        groups.forEach((group) => {
          if (!obj.groupIds.includes(group.id)) {
            obj.groupIds.push(group.id);
          }

          if (!obj.groupNames.includes(group.name)) {
            obj.groupNames.push(group.name);
          }
        });
      }

      obj.groups = obj.groupIds.map((id) => {
        const group = this.getAvailableGroupsForAssign().find((g) => String(g.id) === String(id));
        return group ? { id: group.id, name: group.name } : { id, name: id };
      });

      obj.hasGroups = obj.groupIds.length > 0;

      obj.assignment = {
        ...(obj.assignment || {}),
        groups: obj.groups,
      };
    });

    this.rebuildGroupMemberships();

    this.redraw?.();

    const actionText = operation === "remove" ? "removidos" : "asignados";

    this.showMessage?.(`Group Names ${actionText} en ${selectedObjects.length} objeto(s).`);

    console.log("✅ Group Names asignados:", {
      operation,
      groups,
      selectedObjects,
      allGroups: this.groups.items,
    });
  },

  rebuildGroupMemberships() {
    this.ensureGroupsContainer();

    this.groups.items.forEach((group) => {
      group.members = [];
    });

    const objects = this.getSelectableObjects?.() || [];

    objects.forEach((obj) => {
      const groupIds = obj.groupIds || [];

      groupIds.forEach((groupId) => {
        let group = this.groups.items.find((g) => {
          return String(g.id || g.name) === String(groupId);
        });

        if (!group) {
          group = {
            id: groupId,
            name: groupId,
            description: "",
            members: [],
          };

          this.groups.items.push(group);
        }

        if (!Array.isArray(group.members)) {
          group.members = [];
        }

        const descriptor = this.getAssignableObjectDescriptor(obj);

        const exists = group.members.some((member) => {
          return (
            String(member.objectType) === String(descriptor.objectType) && String(member.id) === String(descriptor.id)
          );
        });

        if (!exists) {
          group.members.push(descriptor);
        }
      });
    });
  },

  // =====================================================
  // ASSIGNMENTS SUMMARY / RESUMEN DE ASIGNACIONES
  // =====================================================

  getAssignmentObjectType(obj) {
    if (!obj) return "unknown";

    if (typeof this.getAssignableObjectType === "function") {
      return this.getAssignableObjectType(obj);
    }

    if (obj.node1 && obj.node2) return "frame";
    if (obj.position || obj.isNode) return "joint";

    return obj.objectType || obj.elementType || obj.type || obj.constructor?.name || "object";
  },

  getAssignmentObjectId(obj) {
    if (!obj) return null;
    return obj.id || obj._id || obj.name || "sin-id";
  },

  getFrameLoadsSummary(frame) {
    const loads = frame?.frameLoads || frame?.lineLoads || frame?.assignment?.frameLoads || [];

    return {
      total: loads.length,
      point: loads.filter((l) => l.type === "point").length,
      distributed: loads.filter((l) => l.type === "distributed").length,
      temperature: loads.filter((l) => l.type === "temperature").length,
    };
  },

  getJointLoadsSummary(joint) {
    const loads = joint?.pointLoads || joint?.jointLoads || joint?.assignment?.pointLoads || [];

    return {
      total: loads.length,
      force: loads.filter((l) => l.type === "force").length,
      groundDisplacement: loads.filter((l) => l.type === "ground-displacement").length,
      temperature: loads.filter((l) => l.type === "temperature").length,
    };
  },

  getObjectAssignmentsSummary(obj) {
    if (!obj) return null;

    const type = this.getAssignmentObjectType(obj);
    const id = this.getAssignmentObjectId(obj);

    const base = {
      id,
      type,
      selected: obj.selected === true,
      groups: obj.groupNames || obj.groupIds || obj.groups?.map((g) => g.name || g.id) || [],
    };

    // ===============================
    // FRAME / LINE
    // ===============================
    if (type === "frame" || (obj.node1 && obj.node2)) {
      const section = obj.sectionName || obj.frameSection?.name || obj.section?.name || obj.sectionId || "Sin sección";

      const material = obj.materialName || obj.material?.name || obj.materialId || "Sin material";

      return {
        ...base,

        section,
        material,

        hasFrameSection: !!(obj.sectionId || obj.sectionName || obj.frameSection || obj.section),

        hasReleases: !!(obj.hasFrameReleases || obj.frameReleases || obj.releases),

        hasEndOffsets: !!(obj.hasEndOffsets || obj.frameEndOffsets || obj.endOffsets),

        frameLoads: this.getFrameLoadsSummary(obj),

        raw: {
          section: obj.frameSection || obj.section || null,
          releases: obj.frameReleases || obj.releases || null,
          endOffsets: obj.frameEndOffsets || obj.endOffsets || null,
          loads: obj.frameLoads || obj.lineLoads || [],
        },
      };
    }

    // ===============================
    // JOINT / POINT
    // ===============================
    if (type === "joint" || type === "point" || type === "node" || type === "structuralnode" || obj.position) {
      const restraints =
        obj.restraints?.name || obj.constraints?.name || obj.restraints?.type || obj.constraints?.type || "Sin apoyo";

      const diaphragm = obj.diaphragmName || obj.diaphragm?.name || obj.diaphragmId || "Sin diafragma";

      return {
        ...base,

        restraints,
        diaphragm,

        hasRestraints: !!(obj.hasRestraints || obj.restraints || obj.constraints),

        hasDiaphragm: !!(obj.hasDiaphragm || obj.diaphragm || obj.diaphragmId),

        hasPointSprings: !!(obj.hasPointSprings || obj.pointSprings || obj.springs),

        jointLoads: this.getJointLoadsSummary(obj),

        raw: {
          restraints: obj.restraints || obj.constraints || null,
          diaphragm: obj.diaphragm || null,
          springs: obj.pointSprings || obj.springs || null,
          loads: obj.pointLoads || obj.jointLoads || [],
        },
      };
    }

    // ===============================
    // OTROS OBJETOS
    // ===============================
    return {
      ...base,
      assignment: obj.assignment || null,
    };
  },

  getSelectedAssignmentsSummary() {
    const selectedObjects = this.getSelectedObjects?.() || [];

    return selectedObjects.map((obj) => {
      return this.getObjectAssignmentsSummary(obj);
    });
  },

  logSelectedAssignmentsSummary() {
    const summary = this.getSelectedAssignmentsSummary();

    console.table(
      summary.map((item) => ({
        id: item.id,
        type: item.type,
        section: item.section || "",
        material: item.material || "",
        restraints: item.restraints || "",
        diaphragm: item.diaphragm || "",
        releases: item.hasReleases || false,
        offsets: item.hasEndOffsets || false,
        frameLoads: item.frameLoads?.total || 0,
        jointLoads: item.jointLoads?.total || 0,
        springs: item.hasPointSprings || false,
        groups: Array.isArray(item.groups) ? item.groups.join(", ") : "",
      })),
    );

    console.log("Resumen completo de asignaciones:", summary);

    this.showMessage?.(`Resumen generado para ${summary.length} objeto(s) seleccionado(s).`);

    return summary;
  },

  showSelectedAssignmentsSummary() {
    const summary = this.getSelectedAssignmentsSummary();

    if (!summary.length) {
      this.showMessage?.("Selecciona uno o más objetos para ver sus asignaciones.", "warning");
      return;
    }

    const rows = summary
      .map((item) => {
        const isFrame = item.type === "frame";

        return `
      <tr>
        <td style="border:1px solid #555; padding:6px;">${item.id}</td>
        <td style="border:1px solid #555; padding:6px;">${item.type}</td>
        <td style="border:1px solid #555; padding:6px;">
          ${isFrame
            ? `Sección: ${item.section}<br>Material: ${item.material}<br>Releases: ${item.hasReleases ? "Sí" : "No"}<br>Offsets: ${item.hasEndOffsets ? "Sí" : "No"}`
            : `Apoyo: ${item.restraints}<br>Diafragma: ${item.diaphragm}<br>Springs: ${item.hasPointSprings ? "Sí" : "No"}`
          }
        </td>
        <td style="border:1px solid #555; padding:6px;">
          ${isFrame
            ? `Point: ${item.frameLoads?.point || 0}<br>Distributed: ${item.frameLoads?.distributed || 0}<br>Temp: ${item.frameLoads?.temperature || 0}`
            : `Force: ${item.jointLoads?.force || 0}<br>Ground Disp: ${item.jointLoads?.groundDisplacement || 0}<br>Temp: ${item.jointLoads?.temperature || 0}`
          }
        </td>
        <td style="border:1px solid #555; padding:6px;">
          ${Array.isArray(item.groups) && item.groups.length ? item.groups.join(", ") : "Sin grupos"}
        </td>
      </tr>
    `;
      })
      .join("");

    Swal.fire({
      title: "Selected Object Assignments",
      width: 900,
      html: `
      <div style="text-align:left; font-size:12px; max-height:480px; overflow:auto;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">ID</th>
              <th style="border:1px solid #555; padding:6px;">Tipo</th>
              <th style="border:1px solid #555; padding:6px;">Asignaciones</th>
              <th style="border:1px solid #555; padding:6px;">Cargas</th>
              <th style="border:1px solid #555; padding:6px;">Grupos</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `,
      confirmButtonText: "Cerrar",
    });

    return summary;
  },

  activateOptionsMenuAction(action) {
    switch (action) {
      // OPCIONES DE PREFERENCIAS
      case "dimensions-tolerances":
        this.openDimensionsTolerancesDialog();
        break;

      case "output-decimals":
        this.openOutputDecimalsDialog();
        break;

      case "steel-frame-design":
        this.openSteelFrameDesignDialog();
        break;

      case "reinforcement-bar-sizes":
        this.openReinforcementBarSizesDialog();
        break;

      // OPCIONES DE COLORES
      case "theme-dark":
        this.setCanvasTheme("dark");
        break;

      case "theme-light":
        this.setCanvasTheme("light");
        break;

      // case "display-colors":
      //   this.openDisplayColorsDialog();
      //   break;

      // OPCIÓN DE LAYOUT DE VENTANAS
      case "window-one":
        this.setWindowLayout("one");
        break;

      case "window-two-vertical":
        this.setWindowLayout("two-vertical");
        break;

      case "window-two-horizontal":
        this.setWindowLayout("two-horizontal");
        break;
    }

    this.redraw?.();
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  ASSIGN JOINT MASS
  // ─────────────────────────────────────────────────────────────────────────

  async openAssignJointMassDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona al menos un nodo antes de asignar masas.", "warning");
      return;
    }

    // Leer masa actual del primer nodo seleccionado como valores por defecto
    const first = selectedJoints[0];
    const curMx = Number(first.mass_x ?? first.mass?.x ?? first.mass ?? 0);
    const curMy = Number(first.mass_y ?? first.mass?.y ?? curMx);
    const curMz = Number(first.mass_z ?? first.mass?.z ?? 0);
    const curSame = curMx === curMy;

    const result = await Swal.fire({
      title: "Assign Joint Mass",
      background: "#1a2035",
      color: "#e2e8f0",
      html: `
        <div style="font-family:monospace; font-size:13px; text-align:left">

          <div style="color:#94a3b8; font-size:12px; margin-bottom:12px">
            Nodos seleccionados: <strong style="color:#e2e8f0">${selectedJoints.length}</strong>
          </div>

          <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px 14px; margin-bottom:12px">
            <legend style="padding:0 6px; color:#7eb8f7; font-size:12px; font-weight:600">Masa traslacional (kg)</legend>

            <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center; margin-bottom:8px">
              <label style="color:#cbd5e1">U1 (X):</label>
              <input id="mass-ux" type="number" min="0" step="any" value="${curMx}"
                style="background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px; width:100%">
            </div>
            <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center; margin-bottom:8px">
              <label style="color:#cbd5e1">U2 (Y):</label>
              <input id="mass-uy" type="number" min="0" step="any" value="${curMy}"
                style="background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px; width:100%">
            </div>
            <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center; margin-bottom:4px">
              <label style="color:#cbd5e1">U3 (Z):</label>
              <input id="mass-uz" type="number" min="0" step="any" value="${curMz}"
                style="background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px; width:100%">
            </div>

            <label style="display:flex; align-items:center; gap:8px; margin-top:10px; color:#94a3b8; font-size:12px; cursor:pointer">
              <input id="mass-same-xy" type="checkbox" ${curSame ? "checked" : ""}>
              Igual en X e Y (isótropo horizontal)
            </label>
          </fieldset>

          <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px 14px">
            <legend style="padding:0 6px; color:#7eb8f7; font-size:12px; font-weight:600">Inercia rotacional (kg·m²)</legend>
            <div style="color:#64748b; font-size:11px; margin-bottom:6px">Normalmente 0 para masas puntuales de pisos</div>
            <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center; margin-bottom:8px">
              <label style="color:#cbd5e1">R1 (XX):</label>
              <input id="mass-rx" type="number" min="0" step="any" value="0"
                style="background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px; width:100%">
            </div>
            <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center; margin-bottom:8px">
              <label style="color:#cbd5e1">R2 (YY):</label>
              <input id="mass-ry" type="number" min="0" step="any" value="0"
                style="background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px; width:100%">
            </div>
            <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center">
              <label style="color:#cbd5e1">R3 (ZZ):</label>
              <input id="mass-rz" type="number" min="0" step="any" value="0"
                style="background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px; width:100%">
            </div>
          </fieldset>

        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1d4ed8",
      didOpen: () => {
        const uxInput = document.getElementById("mass-ux");
        const uyInput = document.getElementById("mass-uy");
        const sameChk = document.getElementById("mass-same-xy");

        // Sincronizar UX → UY cuando está marcado "igual en X e Y"
        uxInput?.addEventListener("input", () => {
          if (sameChk?.checked) uyInput.value = uxInput.value;
        });
        sameChk?.addEventListener("change", () => {
          if (sameChk.checked) uyInput.value = uxInput.value;
        });
      },
      preConfirm: () => {
        const mx = parseFloat(document.getElementById("mass-ux")?.value) || 0;
        const my = parseFloat(document.getElementById("mass-uy")?.value) || 0;
        const mz = parseFloat(document.getElementById("mass-uz")?.value) || 0;
        const rx = parseFloat(document.getElementById("mass-rx")?.value) || 0;
        const ry = parseFloat(document.getElementById("mass-ry")?.value) || 0;
        const rz = parseFloat(document.getElementById("mass-rz")?.value) || 0;
        if (mx < 0 || my < 0 || mz < 0) {
          Swal.showValidationMessage("Las masas no pueden ser negativas");
          return false;
        }
        return { mx, my, mz, rx, ry, rz };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignJointMassToSelected(result.value);
  },

  assignJointMassToSelected({ mx, my, mz, rx, ry, rz }) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    selectedJoints.forEach((joint) => {
      // Propiedades directas (usadas por el mixin sísmico)
      joint.mass_x = mx;
      joint.mass_y = my;
      joint.mass_z = mz;
      joint.mass = mx;  // compatibilidad con código legado

      // Objeto masa completo
      joint.massAssignment = { mx, my, mz, rx, ry, rz };

      // Compatibilidad con assignment genérico
      joint.assignment = {
        ...(joint.assignment || {}),
        mass: { mx, my, mz, rx, ry, rz },
      };

      joint.hasMass = mx > 0 || my > 0 || mz > 0;
    });

    this.markAnalysisResultsOutdated?.("Assign Mass");
    this.redraw?.();

    const total = selectedJoints.reduce((s, j) => s + j.mass_x, 0);
    this.showMessage?.(
      `Masa asignada a ${selectedJoints.length} nodo(s). Total masa X: ${total.toFixed(1)} kg`,
      "success"
    );
  },

};
