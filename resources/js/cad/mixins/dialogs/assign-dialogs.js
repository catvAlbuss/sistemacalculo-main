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

  // Migración Swal→Blade: HTML en components/cad/modals/frame-section-modal.blade.php.
  openAssignFrameSectionDialog() {
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

    const current = selectedFrames[0]?.sectionId ?? null;
    window.dispatchEvent(new CustomEvent("open-frame-section-modal", {
      detail: {
        sections: sections.map((s) => ({ id: s.id, label: `${s.name}${s.A ? ` | A=${s.A}` : ""}` })),
        current,
        count: selectedFrames.length,
      },
    }));
  },

  applyFrameSectionFromModal(sectionId) {
    this.saveUndoState?.("Asignar sección de frame");
    this.assignFrameSectionToSelected(sectionId);
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

  // Migración Swal→Blade: HTML en components/cad/modals/frame-releases-modal.blade.php.
  openAssignFrameReleasesDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const current = selectedFrames[0]?.releases || selectedFrames[0]?.frameReleases || this.getDefaultFrameReleases();
    window.dispatchEvent(new CustomEvent("open-frame-releases-modal", {
      detail: { current, count: selectedFrames.length },
    }));
  },

  applyFrameReleasesFromModal(v) {
    const keys = ["axial", "shear2", "shear3", "torsion", "moment22", "moment33"];
    const releases = this.getDefaultFrameReleases();
    keys.forEach((k) => {
      releases.iEnd[k] = !!v.iEnd?.[k];
      releases.jEnd[k] = !!v.jEnd?.[k];
    });
    releases.partialFixity.enabled = !!v.partialFixity;
    this.saveUndoState?.("Asignar frame releases");
    this.assignFrameReleasesToSelected(releases);
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

  // Migración Swal→Blade: HTML en components/cad/modals/frame-end-offsets-modal.blade.php.
  openAssignFrameEndOffsetsDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const current =
      selectedFrames[0]?.endOffsets || selectedFrames[0]?.frameEndOffsets || this.getDefaultFrameEndOffsets();
    window.dispatchEvent(new CustomEvent("open-frame-end-offsets-modal", {
      detail: { current, count: selectedFrames.length },
    }));
  },

  applyFrameEndOffsetsFromModal(v) {
    const endOffsets = {
      autoOffset: !!v.autoOffset,
      iEnd: { offsetLength: Number(v.iLen) || 0, rigidZoneFactor: Number(v.iRigid) || 0 },
      jEnd: { offsetLength: Number(v.jLen) || 0, rigidZoneFactor: Number(v.jRigid) || 0 },
      useRigidZoneFactor: !!v.useRigidZoneFactor,
    };
    this.saveUndoState?.("Asignar end offsets");
    this.assignFrameEndOffsetsToSelected(endOffsets);
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
    const isJoint = (obj) => {
      if (!obj) return false;
      if (obj.node1 && obj.node2) return false; // es un frame, no un nodo

      const type = String(obj.objectType || obj.type || obj.elementType || obj.constructor?.name || "").toLowerCase();

      return (
        !!obj.position ||
        obj.isNode === true ||
        type === "node" ||
        type === "structuralnode" ||
        type === "joint" ||
        type === "point"
      );
    };

    // La asignación NO debe depender de la vista 2D activa: los nodos se
    // seleccionan en 2D o 3D y pueden ser de varios pisos, y getSelectedObjects()
    // filtra por vista activa (respectActiveView:true), descartándolos. Se toma
    // la selección de edición SIN ese filtro + el estado propio de nodos.
    const sources = [];

    if (typeof this.getEditSelectedObjects === "function") {
      sources.push(...this.getEditSelectedObjects({ respectActiveView: false }));
    } else {
      sources.push(...(this.getSelectedObjects?.() || []));
    }

    sources.push(...(this.selectedNodesState?.selectedObjects || []));
    sources.push(...(this.selectedNodesState?.selectedNodes || []));

    const result = [];
    const seen = new Set();

    sources.forEach((n) => {
      if (!isJoint(n)) return;
      const key = n.id != null ? String(n.id) : n;
      if (seen.has(key)) return;
      seen.add(key);
      result.push(n);
    });

    return result;
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

  // PILOTO migración Swal→Blade (fase JS parte b): el HTML del diálogo vive en
  // components/cad/modals/joint-restraints-modal.blade.php (estilo ETABS "Joint
  // Assignment - Restraints" con Fast Restraints usando los soportes SVG). El
  // mixin solo valida la selección, dispara el evento y aplica lo que el modal
  // devuelve vía applyJointRestraintsFromModal().
  openAssignJointRestraintsDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const current =
      selectedJoints[0]?.restraints || selectedJoints[0]?.constraints || this.getJointRestraintPreset("fixed");

    window.dispatchEvent(new CustomEvent("open-joint-restraints-modal", {
      detail: { current: { ...current }, count: selectedJoints.length },
    }));
  },

  /**
   * Side-panel ▸ Soporte: setea el flag legacy Y los restraints equivalentes
   * en el nodo seleccionado, para que ambos caminos (side-panel y modal
   * Assign ▸ Joint ▸ Restraints) queden siempre consistentes entre sí.
   * key: "soporteUno" (empotrado) | "soporteDos" (articulado) |
   *      "soporteTres" (rodillo Z) | "" (libre).
   */
  setNodeSoporte(node, key) {
    if (!node) return;

    const map = {
      soporteUno: { ux: true, uy: true, uz: true, rx: true, ry: true, rz: true },
      soporteDos: { ux: true, uy: true, uz: true, rx: false, ry: false, rz: false },
      soporteTres: { ux: false, uy: false, uz: true, rx: false, ry: false, rz: false },
    };
    const r = map[key] || { ux: false, uy: false, uz: false, rx: false, ry: false, rz: false };
    const type = this.getJointRestraintTypeFromValues(r);
    const full = {
      ...r,
      type,
      name: type === "custom" ? "Custom" : this.getJointRestraintPreset(type).name,
    };

    this.saveUndoState?.("Asignar soporte");
    node.soporte = key || "";
    node.restraints = full;
    node.constraints = { ...full };
    node.assignment = { ...(node.assignment || {}), restraints: { ...full } };
    node.hasRestraints = this.jointHasAnyRestraint(full);

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();
    this.sync3D?.();
  },

  /** Aplica lo elegido en el modal Blade (OK/Apply). `r` = {ux..rz} booleanos. */
  applyJointRestraintsFromModal(r) {
    const type = this.getJointRestraintTypeFromValues(r);
    this.saveUndoState?.("Asignar restraints");
    this.assignJointRestraintsToSelected({
      ...r,
      type,
      name: type === "custom" ? "Custom" : this.getJointRestraintPreset(type).name,
    });
  },

  assignJointRestraintsToSelected(restraints) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    // Mantener el flag legacy `soporte` sincronizado: lo leen el side-panel
    // (toggles), el renderer 2D (ícono SVG) y varios caminos de export.
    const t = (restraints.ux ? 1 : 0) + (restraints.uy ? 1 : 0) + (restraints.uz ? 1 : 0);
    const rot = (restraints.rx ? 1 : 0) + (restraints.ry ? 1 : 0) + (restraints.rz ? 1 : 0);
    const soporteKey =
      t === 3 && rot === 3 ? "soporteUno"
      : t === 3 && rot === 0 ? "soporteDos"
      : restraints.uz && t === 1 && rot === 0 ? "soporteTres"
      : "";

    selectedJoints.forEach((joint) => {
      joint.restraints = JSON.parse(JSON.stringify(restraints));

      // Compatibilidad con tu exportación actual
      joint.constraints = JSON.parse(JSON.stringify(restraints));

      joint.assignment = {
        ...(joint.assignment || {}),
        restraints: JSON.parse(JSON.stringify(restraints)),
      };

      joint.hasRestraints = this.jointHasAnyRestraint(restraints);
      joint.soporte = soporteKey;
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    this.showMessage?.(`Restraints asignados a ${selectedJoints.length} nodo(s).`);

    console.log("✅ Joint Restraints asignados:", {
      restraints,
      selectedJoints,
    });
  },

  clearJointSupportAssignments(joints = []) {
    const targetJoints = (Array.isArray(joints) ? joints : [joints])
      .filter(Boolean);

    if (!targetJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    const freeRestraints = {
      ux: false,
      uy: false,
      uz: false,
      rx: false,
      ry: false,
      rz: false,
      type: "none",
      name: "None",
    };

    targetJoints.forEach((joint) => {
      // Soporte del panel de propiedades.
      joint.soporte = "";
      joint.supportType = "";

      // Restricciones explícitamente libres.
      joint.restraints = structuredClone(freeRestraints);
      joint.constraints = structuredClone(freeRestraints);
      joint.hasRestraints = false;

      // Mantener sincronizado el contenedor general.
      joint.assignment = {
        ...(joint.assignment || {}),
        restraints: structuredClone(freeRestraints),
      };
    });

    this.markAnalysisResultsOutdated?.(
      "Se eliminaron soportes y restricciones nodales."
    );

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(
      `Soporte removido de ${targetJoints.length} nodo(s).`,
      "success"
    );

    console.log("✅ Soportes removidos:", targetJoints);
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

  // Migración Swal→Blade (fase JS parte b): HTML en
  // components/cad/modals/joint-diaphragms-modal.blade.php.
  openAssignJointDiaphragmsDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    this.ensureDefaultDiaphragmExists();

    const diaphragms = this.getAvailableDiaphragmsForAssign();

    const options = [
      { id: "FROM_AREA", label: "From Area" },
      { id: "NONE", label: "None / Sin diafragma" },
      ...diaphragms.map((d) => ({ id: d.id, label: `${d.name} (${d.type || "rigid"})` })),
    ];

    const currentJoint = selectedJoints[0];
    const directDiaphragmId = currentJoint?.diaphragmId || currentJoint?.diaphragm?.id || null;
    const currentMode = String(
      currentJoint?.diaphragmMode || currentJoint?.assignment?.diaphragmMode ||
      (directDiaphragmId ? "direct" : "fromArea")
    ).trim().toLowerCase();
    const currentId =
      currentMode === "none" ? "NONE"
      : currentMode === "fromarea" ? "FROM_AREA"
      : directDiaphragmId || "FROM_AREA";

    window.dispatchEvent(new CustomEvent("open-joint-diaphragms-modal", {
      detail: { options, currentId, count: selectedJoints.length },
    }));
  },

  applyJointDiaphragmFromModal(diaphragmId) {
    this.saveUndoState?.("Asignar diafragma a nudos");
    this.assignJointDiaphragmToSelected(diaphragmId);
  },

  assignJointDiaphragmToSelected(diaphragmId) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.(
        "No hay nodos seleccionados.",
        "warning"
      );
      return;
    }

    const selectedValue = String(
      diaphragmId || "FROM_AREA"
    )
      .trim()
      .toUpperCase();

    // =====================================================
    // FROM AREA
    // El nodo obtiene el diafragma desde un objeto de área.
    // =====================================================
    if (selectedValue === "FROM_AREA") {
      selectedJoints.forEach((joint) => {
        joint.diaphragmMode = "fromArea";

        joint.diaphragmId = null;
        joint.diaphragmName = null;
        joint.diaphragm = null;
        joint.hasDiaphragm = false;

        joint.assignment = {
          ...(joint.assignment || {}),
          diaphragmMode: "fromArea",
          diaphragm: null,
        };
      });

      this.markAnalysisResultsOutdated?.(
        "Se modificó la asignación de diafragma nodal."
      );

      this.redraw?.();
      this.sync3D?.();

      this.showMessage?.(
        `From Area asignado a ${selectedJoints.length} nodo(s).`,
        "success"
      );

      console.log("✅ Joint Diaphragm: From Area", {
        selectedJoints,
      });

      return;
    }

    // =====================================================
    // NONE
    // El nodo queda explícitamente sin diafragma.
    // =====================================================
    if (selectedValue === "NONE") {
      selectedJoints.forEach((joint) => {
        joint.diaphragmMode = "none";

        joint.diaphragmId = null;
        joint.diaphragmName = null;
        joint.diaphragm = null;
        joint.hasDiaphragm = false;

        joint.assignment = {
          ...(joint.assignment || {}),
          diaphragmMode: "none",
          diaphragm: null,
        };
      });

      this.markAnalysisResultsOutdated?.(
        "Se eliminó la asignación de diafragma nodal."
      );

      this.redraw?.();
      this.sync3D?.();

      this.showMessage?.(
        `Diafragma removido de ${selectedJoints.length} nodo(s).`,
        "success"
      );

      console.log("✅ Joint Diaphragm: None", {
        selectedJoints,
      });

      return;
    }

    // =====================================================
    // DIRECT
    // Asignación directa: D1, D2, D3...
    // =====================================================
    const diaphragm =
      this.getDiaphragmForAssignById(diaphragmId);

    if (!diaphragm) {
      this.showMessage?.(
        "El diafragma seleccionado no existe.",
        "warning"
      );

      console.warn(
        "Diaphragm no encontrado:",
        diaphragmId
      );

      return;
    }

    selectedJoints.forEach((joint) => {
      joint.diaphragmMode = "direct";

      joint.diaphragmId = diaphragm.id;
      joint.diaphragmName = diaphragm.name;
      joint.diaphragm = JSON.parse(
        JSON.stringify(diaphragm)
      );
      joint.hasDiaphragm = true;

      joint.assignment = {
        ...(joint.assignment || {}),
        diaphragmMode: "direct",
        diaphragm: {
          id: diaphragm.id,
          name: diaphragm.name,
          type: diaphragm.type || "rigid",
        },
      };
    });

    this.markAnalysisResultsOutdated?.(
      "Se modificó la asignación de diafragma nodal."
    );

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(
      `Diafragma ${diaphragm.name} asignado a ${selectedJoints.length} nodo(s).`,
      "success"
    );

    // El motor aún no modela losa membrana/shell: un diafragma "Semi Rigid"
    // se analiza como RÍGIDO. Avisar para que la opción del Define no engañe.
    if (/semi/i.test(String(diaphragm.type || diaphragm.rigidity || ""))) {
      this.showMessage?.(
        `⚠️ "${diaphragm.name}" está definido como Semi Rígido, pero el motor lo tratará como RÍGIDO (losa membrana/shell aún no implementada).`,
        "warning",
      );
    }

    console.log("✅ Joint Diaphragm directo:", {
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

  // Migración Swal→Blade: HTML en components/cad/modals/point-springs-modal.blade.php.
  openAssignPointSpringsDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const current = selectedJoints[0]?.pointSprings || selectedJoints[0]?.springs || this.getDefaultPointSprings();
    window.dispatchEvent(new CustomEvent("open-point-springs-modal", {
      detail: { current, count: selectedJoints.length },
    }));
  },

  applyPointSpringsFromModal(v) {
    const preset = v.preset || "custom";
    this.saveUndoState?.("Asignar resortes");
    this.assignPointSpringsToSelected({
      name: preset === "custom" ? "Point Spring" : this.getPointSpringPreset(preset).name,
      preset,
      coordinateSystem: v.coordinateSystem || "Global",
      stiffness: { ...v.stiffness },
    });
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
    // BUG (ver conversación: "no veo mi Csuelo en Patrón de carga"): esto
    // devolvía SIEMPRE la lista de referencia hardcodeada de abajo,
    // ignorando por completo lo que el usuario define en Define > Patrones
    // de Carga (static-load-cases-modal.blade.php) — que además ya
    // documentaba, en su propio comentario, que ESTA función debía leer
    // `window.cadSystem.loadCases.cases`. Ahora sí lo hace: si el usuario
    // ya guardó patrones propios (aunque sea solo CM/CVE por defecto), se
    // usan esos; si nunca abrió ese diálogo en este modelo, se cae de
    // vuelta a la lista de referencia para no dejar el dropdown vacío.
    const userDefined = this.loadCases?.cases;
    if (Array.isArray(userDefined) && userDefined.length) {
      return userDefined.map((lc) => ({ name: lc.name, type: lc.type, implemented: true }));
    }
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

  // Migración Swal→Blade (fase JS parte b): HTML en
  // components/cad/modals/joint-force-modal.blade.php.
  openAssignJointPointForceDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();
    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }
    const patterns = this.getAvailableLoadCasesForAssign().map((lc) => ({
      name: lc.name, label: `${lc.name}${lc.type ? " (" + lc.type + ")" : ""}`,
    }));
    window.dispatchEvent(new CustomEvent("open-joint-force-modal", {
      detail: { patterns, current: patterns[0]?.name || "CM", count: selectedJoints.length },
    }));
  },

  applyJointForceFromModal(v) {
    const load = this.buildJointPointForceLoad(v);
    const patternName = load.loadPattern || load.loadCase || "CM";
    if (typeof this.isLoadPatternImplemented === "function" && !this.isLoadPatternImplemented(patternName)) {
      this.showMessage?.(`El patrón ${patternName} existe como referencia ETABS, pero su implementación está pendiente.`, "warning");
      return;
    }
    this.saveUndoState?.("Asignar fuerza en nudo");
    this.assignJointPointForceToSelected(load);
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

  buildJointPointForceLoad(v = {}) {
    const num = (x) => { const n = Number(x); return Number.isFinite(n) ? n : 0; };
    const loadPattern = String(v.loadPattern || v.loadCase || "CM").trim();
    const operation = v.operation || "replace";
    const fx = num(v.fx), fy = num(v.fy), fz = num(v.fz);
    const mxx = num(v.mxx), myy = num(v.myy), mzz = num(v.mzz);
    const punchingX = num(v.punchingX), punchingY = num(v.punchingY);
    return {
      id: `JLOAD_${Date.now()}`,
      type: "force",
      loadPattern, loadCase: loadPattern,
      coordinateSystem: "Global", operation,
      fx, fy, fz, mxx, myy, mzz,
      mx: mxx, my: myy, mz: mzz,
      punchingX, punchingY,
      punching: { x: punchingX, y: punchingY },
      units: { force: "tonf", moment: "tonf-m", length: "m" },
      forces: { fx, fy, fz, mx: mxx, my: myy, mz: mzz },
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
  // ──────────────────────────────────────────────────────────────────────────
  // ASSIGN > SHELL > DIAPHRAGMS (estilo ETABS: el diafragma se asigna a la
  // LOSA y los nudos que ésta cubre lo heredan "FromArea"; ver
  // getExplicitDiaphragmGroups en seismic.js, que arma los grupos por piso).
  // ──────────────────────────────────────────────────────────────────────────
  // Migración Swal→Blade (fase JS parte b): HTML en
  // components/cad/modals/shell-diaphragms-modal.blade.php.
  openAssignShellDiaphragmsDialog() {
    const selected = this.getSelectedAreasForAssign();
    const allAreas = (this.areas || []).filter(
      (a) => Array.isArray(a.points) && a.points.length >= 3,
    );
    if (!allAreas.length) {
      this.showMessage?.("No hay losas/áreas en el modelo. Dibuja losas primero.", "warning");
      return;
    }

    const floors = [...this._shellDiaphragmAreasByZ(allAreas).keys()].sort((a, b) => a - b);
    const byZ = this._shellDiaphragmAreasByZ(allAreas);

    const scopes = [];
    if (selected.length) scopes.push({ value: "selected", label: `Áreas seleccionadas (${selected.length})` });
    scopes.push({ value: "all", label: `Todas las áreas (${allAreas.length})` });
    floors.forEach((z) => scopes.push({ value: `z:${z}`, label: `Piso z=${z} m (${byZ.get(z).length} área/s)` }));

    this.ensureDefaultDiaphragmExists?.();
    const diaphragms = this.getAvailableDiaphragmsForAssign().map((d) => ({
      id: d.id, label: `${d.name} (${d.type || d.rigidity || "rigid"})`,
    }));

    window.dispatchEvent(new CustomEvent("open-shell-diaphragms-modal", {
      detail: { scopes, diaphragms, currentId: diaphragms[0]?.id || "__NONE__" },
    }));
  },

  // Agrupa áreas por elevación redondeada (compartido por el diálogo y el apply).
  _shellDiaphragmAreasByZ(areas) {
    const r2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
    const areaZ = (a) => r2(a.z ?? (a.points.reduce((s, p) => s + (Number(p.z) || 0), 0) / a.points.length));
    const byZ = new Map();
    (areas || []).forEach((a) => {
      const z = areaZ(a);
      if (!byZ.has(z)) byZ.set(z, []);
      byZ.get(z).push(a);
    });
    return byZ;
  },

  applyShellDiaphragmsFromModal(scope, diaphragmId) {
    const allAreas = (this.areas || []).filter(
      (a) => Array.isArray(a.points) && a.points.length >= 3,
    );
    let target;
    if (scope === "selected") target = this.getSelectedAreasForAssign();
    else if (String(scope).startsWith("z:")) target = this._shellDiaphragmAreasByZ(allAreas).get(Number(String(scope).slice(2))) || [];
    else target = allAreas;

    this.assignShellDiaphragmToTargets(target, diaphragmId);
  },

  assignShellDiaphragmToTargets(areas, diaphragmId) {
    if (!Array.isArray(areas) || !areas.length) {
      this.showMessage?.("No hay áreas a las que asignar.", "warning");
      return;
    }

    this.saveUndoState?.("Asignar diafragma a losas");

    if (diaphragmId === "__NONE__") {
      areas.forEach((a) => {
        a.diaphragm = null;
        a.diaphragmName = null;
        a.diaphragmId = null;
      });
      this.markAnalysisResultsOutdated?.("Cambió la asignación de diafragmas.");
      this.redraw?.();
      this.showMessage?.(`Diafragma removido de ${areas.length} área(s).`);
      return;
    }

    const diaphragm = this.getDiaphragmForAssignById(diaphragmId);
    if (!diaphragm) {
      this.showMessage?.(`Diafragma "${diaphragmId}" no encontrado. Defínelo en Define ▸ Diaphragms.`, "warning");
      return;
    }

    areas.forEach((a) => {
      a.diaphragmId = diaphragm.id;
      a.diaphragmName = diaphragm.name;
      a.diaphragm = {
        id: diaphragm.id,
        name: diaphragm.name,
        type: diaphragm.type || diaphragm.rigidity || "rigid",
      };
    });

    this.markAnalysisResultsOutdated?.("Cambió la asignación de diafragmas.");
    this.redraw?.();
    this.showMessage?.(`Diafragma ${diaphragm.name} asignado a ${areas.length} área(s).`);

    // El motor aún no modela losa membrana/shell: un diafragma "Semi Rigid"
    // se analiza como RÍGIDO. Avisar para que la opción del Define no engañe.
    if (/semi/i.test(String(diaphragm.type || diaphragm.rigidity || ""))) {
      this.showMessage?.(
        `⚠️ "${diaphragm.name}" está definido como Semi Rígido, pero el motor lo tratará como RÍGIDO (losa membrana/shell aún no implementada).`,
        "warning",
      );
    }
  },

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

  // Losas del modelo + opciones de alcance (selección/todas/por-piso) — compartido
  // por los diálogos de carga de área y sección de losa.
  // `types` acota qué áreas cuentan como "asignables" — por defecto solo
  // "slab" (comportamiento de siempre, usado por ej. por el diálogo de
  // Cargas de Área). El diálogo de Sección de Losa pasa explícitamente
  // ["slab", "zapata"] (ver openAssignSlabSectionDialog) para que las
  // zapatas también puedan recibir espesor + material — sin tocar este
  // valor por defecto, ningún otro diálogo cambia de comportamiento.
  _slabAssignData(types = ["slab"]) {
    const r2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
    const slabZ = (a) => r2(a.z ?? (a.points.reduce((s, p) => s + (Number(p.z) || 0), 0) / a.points.length));
    const selected = this.getSelectedAreasForAssign();
    const allSlabs = (this.areas || []).filter(
      (a) => types.includes(a.areaType || a.type || "slab") && Array.isArray(a.points) && a.points.length >= 3,
    );
    const byZ = new Map();
    allSlabs.forEach((a) => { const z = slabZ(a); if (!byZ.has(z)) byZ.set(z, []); byZ.get(z).push(a); });
    const floors = [...byZ.keys()].sort((a, b) => a - b);
    const isMixed = types.length > 1;
    const scopes = [];
    if (selected.length) scopes.push({ value: "selected", label: `${isMixed ? "Elementos" : "Losas"} seleccionados (${selected.length})` });
    scopes.push({ value: "all", label: `Todas las ${isMixed ? "losas/zapatas" : "losas"} (${allSlabs.length})` });
    floors.forEach((z) => scopes.push({ value: `z:${z}`, label: `Piso z=${z} m (${byZ.get(z).length} ${isMixed ? "elemento/s" : "losa/s"})` }));

    // Una entrada por CADA elemento individual — para asignar un valor
    // distinto por zapata (ej. cada una con su propio σmax) sin tener que
    // seleccionarla antes a mano en el canvas. El centro aproximado en la
    // etiqueta es solo para reconocerla contra el plano — no es la
    // propiedad geométrica exacta de Bloque 1 (esto corre ANTES de
    // "Calcular Zapatas", puede que ese cálculo ni exista todavía).
    allSlabs.forEach((a) => {
      const cx = r2((a.points || []).reduce((s, p) => s + (Number(p.x) || 0), 0) / (a.points?.length || 1));
      const cy = r2((a.points || []).reduce((s, p) => s + (Number(p.y) || 0), 0) / (a.points?.length || 1));
      const kind = a.areaType === "zapata" ? "Zapata" : "Losa";
      scopes.push({ value: `id:${a.id}`, label: `${kind} #${a.id} (≈${cx}, ${cy})` });
    });

    return { selected, allSlabs, byZ, scopes };
  },

  _resolveSlabScopeTarget(scope, types = ["slab"]) {
    const { selected, allSlabs, byZ } = this._slabAssignData(types);
    if (scope === "selected") return selected;
    if (String(scope).startsWith("z:")) return byZ.get(Number(String(scope).slice(2))) || [];
    if (String(scope).startsWith("id:")) {
      const id = Number(String(scope).slice(3));
      return allSlabs.filter((a) => Number(a.id) === id);
    }
    return allSlabs;
  },

  // Autocompletar Csuelo: si el "Aplicar a" elegido resuelve a UNA sola
  // zapata (por ID, o porque hay exactamente una seleccionada en el
  // canvas) y esa zapata ya tiene σmax guardado (de la última "Calcular
  // Zapatas", ver foundation.js), devuelve su valor ya convertido a
  // kgf/m² — listo para el campo "Valor". Si resuelve a varias (ej.
  // "Todas las zapatas") o a una losa, devuelve null a propósito: ahí el
  // usuario elige el valor a mano, como pidió explícitamente. Nunca toca
  // losas (areaType!=="zapata" siempre da null) — no cambia el flujo que
  // ya usa tu compañero para su análisis estructural.
  //
  // NEGATIVO a propósito: el único uso confirmado de esto (Csuelo, ver
  // conversación) es representar la reacción del suelo empujando hacia
  // ARRIBA contra la zapata — mismo truco de signo que ya usa el cliente
  // en ETABS ("Direction: Gravity" + valor negativo). Si el usuario
  // necesita otro signo para otro patrón, sigue pudiendo editarlo a mano
  // después de que se autocomplete — esto es un punto de partida, no un
  // candado.
  getZapataSigmaMaxKgfM2ForScope(scope) {
    const target = this._resolveSlabScopeTarget(scope, ["slab", "zapata"]);
    if (target.length !== 1) return null;

    const area = target[0];
    if (area.areaType !== "zapata") return null;

    const tonM2 = area._sigmaMaxTonM2;
    return Number.isFinite(tonM2) ? -Math.round(tonM2 * 1000) : null;
  },

  // Migración Swal→Blade: HTML en components/cad/modals/area-uniform-load-modal.blade.php.
  //
  // Incluye "zapata" además de "slab" (ver conversación: flujo de
  // validación cruzada del cliente contra ETABS — carga "Csuelo" aplicada
  // directo sobre el shell de la zapata, con signo negativo para que
  // empuje hacia arriba). Verificado seguro: _buildSeismicAreaLoadsForPayload
  // (payload.js) filtra por areaType==="slab" ANTES de mirar areaLoads, así
  // que una zapata con carga acá nunca se cuela en la masa sísmica del
  // edificio, sin importar qué se le asigne desde este diálogo.
  openAssignAreaUniformLoadDialog() {
    const { allSlabs, scopes } = this._slabAssignData(["slab", "zapata"]);
    if (!allSlabs.length) {
      this.showMessage?.("No hay losas ni zapatas en el modelo. Dibuja alguna primero.", "warning");
      return;
    }
    const loadCases = this.getAvailableLoadCasesForAssign().map((lc) => ({
      name: lc.name, label: `${lc.name}${lc.type ? " (" + lc.type + ")" : ""}`,
    }));
    window.dispatchEvent(new CustomEvent("open-area-uniform-load-modal", {
      detail: { scopes, loadCases },
    }));
  },

  applyAreaUniformLoadFromModal(v) {
    // Sin Math.max(0, ...): un valor negativo es válido a propósito (ver
    // comentario arriba) — mismo truco de signo que usa el cliente en
    // ETABS ("Direction: Gravity" + valor negativo = empuja hacia arriba).
    const value = Number(v.value) || 0;
    this.saveUndoState?.("Asignar carga de área");
    this.assignAreaUniformLoadToAreas(this._resolveSlabScopeTarget(v.scope, ["slab", "zapata"]), {
      loadCase: v.loadCase || "CM", value, operation: v.operation || "replace",
    });
  },

  // Guarda la carga uniforme en area.areaLoads[] de cada losa/zapata.
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
      // value !== 0 (no "value > 0"): un valor negativo es una carga real
      // (empuja hacia arriba), no algo para descartar como el 0 de "sin carga".
      if (operation !== "delete" && value !== 0) {
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
  // Migración Swal→Blade: HTML en components/cad/modals/slab-section-modal.blade.php.
  /**
   * Sentido de armado de la losa (una vía) — el `ANG` de ETABS.
   *
   * NO es un dato cosmético: decide a qué vigas les entrega la losa su carga.
   * Van las PERPENDICULARES a la flecha, que son las que hacen de apoyo en los
   * dos extremos de la luz (ver _buildSeismicSlabToBeamLoadsForPayload en
   * payload.js). Girarlo 90° manda la carga a las otras vigas, y como la carga
   * TOTAL se conserva, las reacciones cierran igual: por eso hace falta poder
   * verlo (la flecha) y poder corregirlo (este diálogo).
   */
  async openAssignSlabLoadDirectionDialog() {
    const { allSlabs, scopes } = this._slabAssignData();

    if (!allSlabs.length) {
      this.showMessage?.("No hay losas en el modelo.", "warning");
      return;
    }

    const scopeOptions = scopes
      .map((s) => `<option value="${s.value}">${s.label}</option>`)
      .join("");

    const { value: form } = await Swal.fire({
      title: "Sentido de armado de losa",
      html: `
        <div style="text-align:left;font-size:13px;color:#cbd5e1">
          <p style="margin-bottom:10px">
            La carga del panel va a las vigas <b>perpendiculares</b> a este sentido.
          </p>
          <label style="display:block;margin-bottom:4px">Aplicar a</label>
          <select id="sld-scope" class="swal2-select" style="width:100%;margin:0 0 12px">
            ${scopeOptions}
          </select>
          <label style="display:block;margin-bottom:4px">Ángulo (grados desde +X)</label>
          <input id="sld-ang" type="number" step="5" value="0" class="swal2-input"
                 style="width:100%;margin:0 0 12px">
          <label style="display:flex;align-items:center;gap:8px">
            <input id="sld-oneway" type="checkbox" checked>
            <span>Reparto en <b>una vía</b> (aligerado)</span>
          </label>
          <p style="margin-top:8px;font-size:12px;color:#94a3b8">
            Sin marcar, reparte a las cuatro vigas del contorno y no se dibuja flecha.
            0° = la carga salva en X · 90° = salva en Y.
          </p>
        </div>`,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      background: "#1a2035",
      color: "#e2e8f0",
      preConfirm: () => ({
        scope: document.getElementById("sld-scope")?.value || "all",
        ang: Number(document.getElementById("sld-ang")?.value) || 0,
        oneWay: document.getElementById("sld-oneway")?.checked !== false,
      }),
    });

    if (!form) return;

    const target = this._resolveSlabScopeTarget(form.scope);

    this.saveUndoState?.("Sentido de armado de losa");

    target.forEach((slab) => {
      slab.oneWayLoadDist = form.oneWay;
      slab.loadDistAngle = form.ang;
    });

    // Cambia a qué vigas les llega la carga → los diagramas guardados dejan de
    // valer. La firma del payload lo detecta sola, pero avisar es más honesto.
    this.markAnalysisResultsOutdated?.("Cambió el sentido de armado de una losa.");
    this.redraw?.();

    this.showMessage?.(
      form.oneWay
        ? `Sentido de armado ${form.ang}° en ${target.length} losa(s).`
        : `Reparto en dos vías en ${target.length} losa(s).`,
    );
  },

  /** Gira 90° el sentido de armado de las losas seleccionadas (o de todas). */
  rotateSlabLoadDirection() {
    const { selected, allSlabs } = this._slabAssignData();
    const target = selected.length ? selected : allSlabs;

    if (!target.length) {
      this.showMessage?.("No hay losas en el modelo.", "warning");
      return;
    }

    this.saveUndoState?.("Girar sentido de armado 90°");

    target.forEach((slab) => {
      slab.oneWayLoadDist = true;
      slab.loadDistAngle = ((Number(slab.loadDistAngle) || 0) + 90) % 180;
    });

    this.markAnalysisResultsOutdated?.("Cambió el sentido de armado de una losa.");
    this.redraw?.();

    this.showMessage?.(
      `Sentido de armado girado 90° en ${target.length} losa(s)` +
        `${selected.length ? "" : " (todas, no había selección)"}.`,
    );
  },

  openAssignSlabSectionDialog() {
    const { allSlabs, scopes } = this._slabAssignData(["slab", "zapata"]);
    if (!allSlabs.length) {
      this.showMessage?.("No hay losas ni zapatas en el modelo. Dibuja alguna primero.", "warning");
      return;
    }
    const sections = Array.isArray(this.slabSections) ? this.slabSections : [];
    if (!sections.length) {
      this.showMessage?.("No hay secciones de losa definidas. Ábrelas en Define → Slab Sections.", "warning");
      window.dispatchEvent(new CustomEvent("open-slab-sections-modal"));
      return;
    }
    window.dispatchEvent(new CustomEvent("open-slab-section-modal", {
      detail: {
        scopes,
        sections: sections.map((s) => ({ name: s.name, label: `${s.name} (${s.thickness} mm)` })),
      },
    }));
  },

  applySlabSectionFromModal(scope, name) {
    const sections = Array.isArray(this.slabSections) ? this.slabSections : [];
    const target = this._resolveSlabScopeTarget(scope, ["slab", "zapata"]);
    const sec = name === "__none__" ? null : sections.find((s) => s.name === name);

    this.saveUndoState?.("Asignar sección de losa");
    target.forEach((slab) => {
      slab.slabSection = sec ? sec.name : null;
      // Peso propio de la losa (kgf/m²): espesor(m) × densidad del material.
      slab.slabSelfWeightKgM2 = sec ? this._slabSectionSelfWeightKgM2(sec) : 0;
      slab.section = sec ? { name: sec.name, thickness: sec.thickness, material: sec.material } : null;

      // Reparto de la carga a las vigas. En ETABS este dato vive en la SECCIÓN
      // (`SHELLPROP ... ONEWAYLOADDIST`), así que acá se hereda igual: una losa
      // dibujada en la app y con sección asignada tiene que comportarse como
      // una importada del .e2k. Sin esto, la losa quedaba sin sentido de
      // armado, no dibujaba flecha y repartía la carga a las cuatro vigas.
      if (sec) {
        slab.oneWayLoadDist = this._slabSectionIsOneWay(sec);
        if (slab.loadDistAngle == null) slab.loadDistAngle = 0;
      }
    });
    this.markAnalysisResultsOutdated?.("Se asignó sección de losa.");
    this.redraw?.();
    this.showMessage?.(`Sección "${name === "__none__" ? "None" : name}" asignada a ${target.length} elemento(s).`);
  },

  /**
   * ¿La sección reparte su carga en UNA VÍA?
   *
   * Si la definición lo declara (`oneWayLoadDist`), manda eso — es el
   * equivalente del `ONEWAYLOADDIST` de ETABS. Si no lo declara (secciones
   * viejas, creadas antes de que existiera el campo), se deduce del NOMBRE:
   * un aligerado, un nervado o una losa de viguetas son de una vía por
   * definición constructiva, no por configuración. Una losa maciza no.
   *
   * El usuario siempre puede corregirlo en Asignar ▸ Losa ▸ Sentido de Armado.
   */
  _slabSectionIsOneWay(sec) {
    if (typeof sec?.oneWayLoadDist === "boolean") return sec.oneWayLoadDist;

    const name = String(sec?.name || "").toLowerCase();

    return /aligerad|nervad|vigueta|one\s*way|una\s*v[ií]a|unidireccional/.test(name);
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
  // ASSIGN > SHELL > WALL SECTION (espejo de SLAB SECTION arriba)
  // Espesor + material acá NO son solo decorativos como en una losa: definen
  // el panel shell que arma el motor sísmico (ver payload.js
  // _buildSeismicWallsForPayload) — sin sección asignada, el muro queda
  // fuera del análisis sísmico (mismo criterio que "losa sin sección").
  // =====================================================
  _wallAssignData() {
    const r2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
    const selected = this.getSelectedAreasForAssign().filter(
      (a) => (a.areaType || a.type) === "wall",
    );
    const allWalls = (this.areas || []).filter(
      (a) => (a.areaType || a.type) === "wall" && Array.isArray(a.points) && a.points.length >= 3,
    );
    const byZ = new Map();
    allWalls.forEach((a) => {
      const z = r2(a.z ?? (a.points.reduce((s, p) => s + (Number(p.z) || 0), 0) / a.points.length));
      if (!byZ.has(z)) byZ.set(z, []);
      byZ.get(z).push(a);
    });
    const floors = [...byZ.keys()].sort((a, b) => a - b);
    const scopes = [];
    if (selected.length) scopes.push({ value: "selected", label: `Muros seleccionados (${selected.length})` });
    scopes.push({ value: "all", label: `Todos los muros (${allWalls.length})` });
    floors.forEach((z) => scopes.push({ value: `z:${z}`, label: `Piso z=${z} m (${byZ.get(z).length} muro/s)` }));
    return { selected, allWalls, byZ, scopes };
  },

  _resolveWallScopeTarget(scope) {
    const { selected, allWalls, byZ } = this._wallAssignData();
    if (scope === "selected") return selected;
    if (String(scope).startsWith("z:")) return byZ.get(Number(String(scope).slice(2))) || [];
    return allWalls;
  },

  // Migración del patrón slab-section-modal: HTML en components/cad/modals/wall-section-modal.blade.php.
  openAssignWallSectionDialog() {
    const { allWalls, scopes } = this._wallAssignData();
    if (!allWalls.length) {
      this.showMessage?.("No hay muros en el modelo. Dibuja muros primero.", "warning");
      return;
    }
    const sections = Array.isArray(this.wallSections) ? this.wallSections : [];
    if (!sections.length) {
      this.showMessage?.("No hay secciones de muro definidas. Ábrelas en Define → Wall Sections.", "warning");
      window.dispatchEvent(new CustomEvent("open-wall-sections-modal"));
      return;
    }
    window.dispatchEvent(new CustomEvent("open-wall-section-modal", {
      detail: {
        scopes,
        sections: sections.map((s) => ({ name: s.name, label: `${s.name} (${s.thickness} mm)` })),
      },
    }));
  },

  applyWallSectionFromModal(scope, name) {
    const sections = Array.isArray(this.wallSections) ? this.wallSections : [];
    const target = this._resolveWallScopeTarget(scope);
    const sec = name === "__none__" ? null : sections.find((s) => s.name === name);

    this.saveUndoState?.("Asignar sección de muro");
    target.forEach((wall) => {
      wall.wallSection = sec ? sec.name : null;
      wall.wallSelfWeightKgM2 = sec ? this._wallSectionSelfWeightKgM2(sec) : 0;
      wall.section = sec ? { name: sec.name, thickness: sec.thickness, material: sec.material } : null;
    });
    this.markAnalysisResultsOutdated?.("Se asignó sección de muro.");
    this.redraw?.();
    this.showMessage?.(`Sección "${name === "__none__" ? "None" : name}" asignada a ${target.length} muro(s).`);
  },

  // Peso propio de una sección de muro en kgf/m² = espesor(m) × densidad(kg/m³).
  _wallSectionSelfWeightKgM2(sec) {
    if (!sec) return 0;
    const explicit = Number(sec.selfWeightKgM2);
    if (explicit > 0) return explicit;
    const t = (Number(sec.thickness) || 0) / 1000; // mm → m
    const mats = this.materialProperties?.materials || [];
    const mat = mats.find((m) => m.name === sec.material);
    const mpv = Number(mat?.massPerUnitVolume);
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

  // Migración Swal→Blade (fase JS parte b): HTML en
  // components/cad/modals/frame-point-load-modal.blade.php.
  openAssignFramePointLoadDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();
    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }
    const loadCases = this.getAvailableLoadCasesForAssign().map((lc) => ({
      name: lc.name, label: `${lc.name}${lc.type ? " (" + lc.type + ")" : ""}`,
    }));
    window.dispatchEvent(new CustomEvent("open-frame-point-load-modal", {
      detail: { loadCases, current: loadCases[0]?.name || "CM", count: selectedFrames.length },
    }));
  },

  applyFramePointLoadFromModal(v) {
    this.saveUndoState?.("Asignar carga puntual en frame");
    this.assignFramePointLoadToSelected(this.buildFramePointLoad(v));
  },

  buildFramePointLoad(v = {}) {
    const num = (x) => { const n = Number(x); return Number.isFinite(n) ? n : 0; };
    let relativeDistance = num(v.relativeDistance);
    relativeDistance = Math.max(0, Math.min(1, relativeDistance));
    return {
      id: `FPOINT_${Date.now()}`,
      type: "point",
      loadCase: v.loadCase || "CM",
      coordinateSystem: v.coordinateSystem || "Global",
      operation: v.operation || "replace",
      loadType: v.loadType || "force",
      direction: v.direction || "FZ",
      distanceType: v.distanceType || "relative",
      relativeDistance,
      absoluteDistance: num(v.absoluteDistance),
      value: num(v.value),
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

  // Migración Swal→Blade (fase JS parte b): HTML en
  // components/cad/modals/frame-distributed-load-modal.blade.php.
  openAssignFrameDistributedLoadDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();
    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }
    const loadCases = this.getAvailableLoadCasesForAssign().map((lc) => ({ name: lc.name }));
    window.dispatchEvent(new CustomEvent("open-frame-distributed-load-modal", {
      detail: {
        loadCases,
        current: loadCases.find((c) => String(c.name).toUpperCase() === "CM")?.name || loadCases[0]?.name || "CM",
        distLabel: window.cadUnits?.labels?.().distLoad || "tonf/m",
        count: selectedFrames.length,
      },
    }));
  },

  applyFrameDistributedLoadFromModal(v) {
    this.saveUndoState?.("Asignar carga distribuida en frame");
    this.assignFrameDistributedLoadToSelected(this.buildFrameDistributedLoad(v));
  },

  buildFrameDistributedLoad(v = {}) {
    const num = (x) => { const n = Number(x); return Number.isFinite(n) ? n : 0; };
    const dispUnit = v.distLabel || window.cadUnits?.labels?.().distLoad || "tonf/m";
    const toNPerM = (x) =>
      typeof window.cadUnits?.distLoadDispToNPerM === "function"
        ? window.cadUnits.distLoadDispToNPerM(x)
        : (Number(x) || 0) * 9806.65;

    const loadCase = v.loadCase || "CM";
    const loadType = v.loadType || "force";
    const direction = v.direction || "Gravity";
    const operation = v.operation || "replace";
    const distanceType = v.distanceType || "relative";

    const uniformDisp = num(v.uniform);
    const dist = (Array.isArray(v.dist) ? v.dist : [0, 0.25, 0.75, 1]).map(num);
    const loadDisp = (Array.isArray(v.load) ? v.load : [0, 0, 0, 0]).map(num);

    let distributionType, startDistance, endDistance, startValueDisp, endValueDisp;
    if (Math.abs(uniformDisp) > 0) {
      distributionType = "uniform";
      startDistance = 0; endDistance = 1;
      startValueDisp = uniformDisp; endValueDisp = uniformDisp;
    } else {
      distributionType = "trapezoidal";
      startDistance = dist[0]; endDistance = dist[3];
      startValueDisp = loadDisp[0]; endValueDisp = loadDisp[3];
    }

    const startValue = toNPerM(startValueDisp);
    const endValue = toNPerM(endValueDisp);
    const isRelative = distanceType === "relative";

    let startRelativeDistance = isRelative ? startDistance : 0;
    let endRelativeDistance = isRelative ? endDistance : 1;
    startRelativeDistance = Math.max(0, Math.min(1, startRelativeDistance));
    endRelativeDistance = Math.max(0, Math.min(1, endRelativeDistance));
    if (endRelativeDistance < startRelativeDistance) {
      const t = startRelativeDistance; startRelativeDistance = endRelativeDistance; endRelativeDistance = t;
    }

    return {
      id: `FDIST_${Date.now()}`,
      type: "distributed",
      loadCase, coordinateSystem: "Global", operation, loadType, direction,
      distributionType, distanceType,
      startRelativeDistance, endRelativeDistance,
      startAbsoluteDistance: isRelative ? 0 : startDistance,
      endAbsoluteDistance: isRelative ? 0 : endDistance,
      startValue, endValue, startValueDisp, endValueDisp,
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
  // Migración Swal→Blade (fase JS parte b): HTML en
  // components/cad/modals/frame-local-axes-modal.blade.php.
  openAssignFrameLocalAxesDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero una o más columnas / elementos Frame.", "warning");
      return;
    }

    window.dispatchEvent(new CustomEvent("open-frame-local-axes-modal", {
      detail: {
        current: Number(selectedFrames[0]?.localAxisAngle || 0),
        count: selectedFrames.length,
      },
    }));
  },

  applyFrameLocalAxesFromModal(angle) {
    this.saveUndoState?.("Rotación de eje local");
    this.assignFrameLocalAxesToSelected(angle);
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

  // Migración Swal→Blade: HTML en components/cad/modals/group-names-modal.blade.php.
  // El modal crea grupos llamando a createGroupForAssign / getAvailableGroupsForAssign.
  openAssignGroupNamesDialog() {
    const selectedObjects = this.getSelectedObjectsForGroupAssign();

    if (!selectedObjects.length) {
      this.showMessage?.("Selecciona primero uno o más objetos.", "warning");
      return;
    }

    window.dispatchEvent(new CustomEvent("open-group-names-modal", {
      detail: {
        groups: this.getAvailableGroupsForAssign().map((g) => ({ id: g.id, name: g.name })),
        count: selectedObjects.length,
      },
    }));
  },

  applyGroupNamesFromModal(v) {
    this.saveUndoState?.("Asignar grupos");
    this.assignGroupNamesToSelected({ operation: v.operation || "add", groupIds: v.groupIds || [] });
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

  // Migración Swal→Blade: HTML en components/cad/modals/joint-mass-modal.blade.php.
  openAssignJointMassDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona al menos un nodo antes de asignar masas.", "warning");
      return;
    }

    const first = selectedJoints[0];
    const ux = Number(first.mass_x ?? first.mass?.x ?? first.mass ?? 0);
    const uy = Number(first.mass_y ?? first.mass?.y ?? ux);
    const uz = Number(first.mass_z ?? first.mass?.z ?? 0);
    const m = first.massAssignment || {};
    window.dispatchEvent(new CustomEvent("open-joint-mass-modal", {
      detail: {
        current: { ux, uy, uz, rx: Number(m.rx) || 0, ry: Number(m.ry) || 0, rz: Number(m.rz) || 0 },
        count: selectedJoints.length,
      },
    }));
  },

  applyJointMassFromModal(v) {
    this.saveUndoState?.("Asignar masa en nudo");
    this.assignJointMassToSelected({
      mx: Number(v.ux) || 0, my: Number(v.uy) || 0, mz: Number(v.uz) || 0,
      rx: Number(v.rx) || 0, ry: Number(v.ry) || 0, rz: Number(v.rz) || 0,
    });
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
