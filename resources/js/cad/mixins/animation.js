import * as BABYLON from "@babylonjs/core";
import { startBabylonDeflectionAnimation, stopBabylonDeflectionAnimation, isBabylonDeflectionAnimating } from "../3d/viewer3d.js";

/**
 * @mixin animationMixin
 *
 * Animación de la forma deformada del modelo estructural.
 *
 * Implementa dos modos de animación:
 *  - "scale"   → modifica el factor de escala de la deflexión en el canvas 2D
 *                de forma cíclica (sin mover geometría real).
 *  - "babylon" → mueve los nodos 3D en Babylon.js con interpolación de cámara,
 *                usando startBabylonDeflectionAnimation de viewer3d.js.
 *
 * Responsabilidades:
 * - updateNodePositionsOnly()           → actualiza posiciones 3D sin redibujar todo
 * - toggleDeflectionAnimation()         → inicia o detiene la animación activa
 * - toggleDeflectionAnimationSpeed()    → cicla entre velocidades (lento/normal/rápido)
 * - toggleDeflectionAnimationMode()     → alterna entre modo "scale" y modo "babylon"
 * - startScaleAnimation()               → arranca el loop de animación por escala
 * - stopScaleAnimation()                → detiene el loop de animación por escala
 */
export const animationMixin = {
  updateNodePositionsOnly() {
    const viewer = getViewer3DState();
    if (!viewer?.scene) return;

    // Actualizar nodos existentes
    viewer.elements.forEach((mesh) => {
      if (mesh.metadata?.type === "node") {
        const nodeId = mesh.metadata?.nodeId || mesh.metadata?.id;
        const node = this.nodes.find((n) => n.id === nodeId);
        if (node) {
          // Obtener posición deformada o original
          let pos = this.getNodePosition3D(node);
          mesh.position = pos;
        }
      }
    });

    // Actualizar barras (recrear líneas con nuevos puntos)
    const beamsToUpdate = viewer.elements.filter((m) => m.metadata?.type === "beam");
    beamsToUpdate.forEach((beamMesh) => {
      const beamId = beamMesh.metadata?.id;
      const beam = this.shapes.find((b) => b.id === beamId);
      if (beam && beam.node1 && beam.node2) {
        const start = this.getNodePosition3D(beam.node1);
        const end = this.getNodePosition3D(beam.node2);
        const newLines = BABYLON.MeshBuilder.CreateLines(`beam_${beamId}`, { points: [start, end] }, viewer.scene);
        newLines.color = beamMesh.color;
        newLines.metadata = beamMesh.metadata;
        // Reemplazar en la lista
        const idx = viewer.elements.indexOf(beamMesh);
        if (idx !== -1) viewer.elements[idx] = newLines;
        beamMesh.dispose();
      }
    });
  },

  getNodePosition3D(node) {
    const useDeflection = this.options.showDeflection && this.desplazamientosPosition;
    if (useDeflection) {
      const idx = node.id - 1;
      if (idx >= 0 && idx < this.desplazamientosPosition.length) {
        const def = this.desplazamientosPosition[idx];
        if (def && typeof def.x === "number" && !isNaN(def.x)) {
          // Convertir: modelo (x, y, z) -> Babylon (x, z, y)
          return new BABYLON.Vector3(def.x, def.z, def.y);
        }
      }
    }
    return new BABYLON.Vector3(node.position.x, node.position.z || 0, node.position.y);
  },

  toggleDeflectionAnimationMode() {
    if (this.deflectionAnimationMode === "scale") {
      this.deflectionAnimationMode = "babylon";
      console.log("Modo cambiado a babylon");
      // Si la animación estaba activa, detenerla primero
      // if (this.deflectionAnimationActive) {
      //   this.stopDeflectionAnimation();
      //   this.deflectionAnimationActive = false;
      // }
      // this.showMessage?.("🎬 Modo animación: Babylon.js (interpolación suave)");
    } else {
      this.deflectionAnimationMode = "scale";
      // if (this.deflectionAnimationActive) {
      //   this.stopDeflectionAnimation();
      //   this.deflectionAnimationActive = false;
      // }
      // this.showMessage?.("🎬 Modo animación: Escalado automático");
      console.log("Modo cambiado a scale");
    }
    if (this.deflectionAnimationActive) this.stopDeflectionAnimation();
    this.showMessage?.(
      `🎬 Modo animación: ${this.deflectionAnimationMode === "babylon" ? "Babylon.js (interpolación suave)" : "Escalado automático"}`,
    );
  },

  toggleDeflectionAnimation() {
    console.log("🔄 toggleDeflectionAnimation, active actual:", this.deflectionAnimationActive);
    if (this.deflectionAnimationActive) {
      this.stopDeflectionAnimation();
    } else {
      this.startDeflectionAnimation();
    }
  },

  startDeflectionAnimation() {
    console.log("🎬 startDeflectionAnimation, modo:", this.deflectionAnimationMode);
    if (this.deflectionAnimationActive) return;

    // Verificar que hay datos de deflexión
    if (!this.matrizDesplazamiento || !this.matrizDesplazamiento.length) {
      this.showMessage?.("No hay datos de deflexión. Ejecute primero el análisis.", "warning");
      return;
    }

    // Asegurar que la deformada esté activada
    if (!this.options.showDeflection) {
      this.options.showDeflection = true;
      this.updateDeflectionScale();
    }

    this.deflectionAnimationActive = true;

    if (this.deflectionAnimationMode === "babylon") {
      console.log("➡️ Iniciando animación Babylon");
      this._startBabylonDeflectionAnimation();
    } else {
      console.log("➡️ Iniciando animación por escalado");
      this._startScaleDeflectionAnimation();
    }
  },

  stopDeflectionAnimation() {
    if (!this.deflectionAnimationActive) return;

    this.deflectionAnimationActive = false;

    if (this.deflectionAnimationMode === "babylon") {
      this._stopBabylonDeflectionAnimation();
    } else {
      this._stopScaleDeflectionAnimation();
    }

    this.showMessage?.("⏹️ Animación de deflexión detenida");
  },

  // ========== ANIMACIÓN DE LA DEFLEXION POR ESCALADO ==========
  _startScaleDeflectionAnimation() {
    // if (this.deflectionAnimationTimer) {
    //   clearTimeout(this.deflectionAnimationTimer);
    // }
    console.log("⚙️ _startScaleDeflectionAnimation llamado");
    if (this.deflectionAnimationRequestId) cancelAnimationFrame(this.deflectionAnimationRequestId);
    // Asegurar escala inicial válida
    if (isNaN(this.options.deflectionScale) || this.options.deflectionScale < 1) {
      this.options.deflectionScale = 1;
    }
    this.deflectionAnimationDirection = 1;
    this.deflectionAnimationActive = true;
    this._animateScaleDeflectionLoop();
    this.showMessage?.("🎬 Animación de deflexión por escalado iniciada");
  },

  _stopScaleDeflectionAnimation() {
    if (this.deflectionAnimationRequestId) {
      cancelAnimationFrame(this.deflectionAnimationRequestId);
      this.deflectionAnimationRequestId = null;
    }
    this.deflectionAnimationActive = false;
  },

  _animateScaleDeflectionLoop() {
    if (!this.deflectionAnimationActive || this.deflectionAnimationMode !== "scale") return;

    // Asegurar que la escala actual es un número válido
    let currentScale = Number(this.options.deflectionScale);
    if (isNaN(currentScale)) currentScale = 1;
    currentScale = Math.min(this.deflectionAnimationMaxScale, Math.max(this.deflectionAnimationMinScale, currentScale));

    // Determinar si debemos cambiar la dirección
    if (currentScale >= this.deflectionAnimationMaxScale) {
      this.deflectionAnimationDirection = -1;
      currentScale = this.deflectionAnimationMaxScale;
    } else if (currentScale <= this.deflectionAnimationMinScale) {
      this.deflectionAnimationDirection = 1;
      currentScale = this.deflectionAnimationMinScale;
    }

    // Incremento suave (ajustable con velocidad)
    const step = 4 * this.deflectionAnimationSpeed;
    let newScale = currentScale + step * this.deflectionAnimationDirection;

    // Limitar entre mín y máx
    newScale = Math.min(this.deflectionAnimationMaxScale, Math.max(this.deflectionAnimationMinScale, newScale));

    // Solo actualizar si cambió
    if (newScale !== currentScale) {
      this.options.deflectionScale = newScale;
      // console.log("📈 Escala actualizada:", this.options.deflectionScale);
      this.updateDeflectionScale();
    } else {
      // En los límites, invertir dirección manualmente para evitar quedarse pegado
      if (currentScale >= this.deflectionAnimationMaxScale) {
        this.deflectionAnimationDirection = -1;
      } else if (currentScale <= this.deflectionAnimationMinScale) {
        this.deflectionAnimationDirection = 1;
      }
    }

    this.deflectionAnimationRequestId = requestAnimationFrame(() => this._animateScaleDeflectionLoop());
  },

  // ========== ANIMACIÓN DE LA DEFLEXION CON BABYLON ==========
  _startBabylonDeflectionAnimation() {
    // Asegurar que tenemos posiciones originales guardadas

    startBabylonDeflectionAnimation(this, {
      frames: 60,
      duration: this.deflectionBabylonDuration,
      loop: this.deflectionBabylonLoop,
      easing: this.deflectionBabylonEasing,
    });

    this.showMessage?.("🎬 Animación de deflexión con Babylon.js iniciada");
  },

  _stopBabylonDeflectionAnimation() {
    stopBabylonDeflectionAnimation();

    // Opcional: restaurar la posición original después de detener
    const viewer = getViewer3DState();
    if (viewer?.originalPositions) {
      // Forzar una redraw completa para restaurar posiciones
      setTimeout(() => this.sync3D(), 50);
    }
  },

  isBabylonAnimating() {
    return isBabylonDeflectionAnimating ? isBabylonDeflectionAnimating() : false;
  },

  // ========== CONTROL DE VELOCIDAD PARA EL ESCALADO ==========
  setDeflectionAnimationSpeed(speed) {
    this.deflectionAnimationSpeed = speed;
    const speedNames = { 0.5: "lenta", 1: "normal", 2: "rápida" };
    this.showMessage?.(`⚡ Velocidad de animación: ${speedNames[speed] || "normal"}`);

    // Si la animación está activa en modo escalado, reiniciar el loop para aplicar nueva velocidad
    if (this.deflectionAnimationActive && this.deflectionAnimationMode === "scale") {
      this._stopScaleDeflectionAnimation();
      this._startScaleDeflectionAnimation();
    }
  },

  toggleDeflectionAnimationSpeed() {
    if (this.deflectionAnimationSpeed === 1) {
      this.setDeflectionAnimationSpeed(2);
    } else if (this.deflectionAnimationSpeed === 2) {
      this.setDeflectionAnimationSpeed(0.5);
    } else {
      this.setDeflectionAnimationSpeed(1);
    }
  },

  // Transforma los modelos definidos de arco, puente y triangulo en la vista
  // de elevacion.

  _ajustarModeloElevacion(modelo) {
    const view = this.viewSet?.[this.activeViewIndex];
    if (!view) return;

    if (view.type === "plan") {
      const zBase = this.getActivePlanElevation();
      modelo.nodes.forEach((node) => {
        node.position.z = zBase;
      });
      return;
    }

    if (view.type === "elevation") {
      const fixedCoord = Number(view.value ?? 0);

      if (view.axis === "Y") {
        modelo.nodes.forEach((node) => {
          const x = node.position.x;
          const y = node.position.y;
          node.position.x = x;
          node.position.y = fixedCoord;
          node.position.z = y;
        });
      } else if (view.axis === "X") {
        modelo.nodes.forEach((node) => {
          const x = node.position.x;
          const y = node.position.y;
          node.position.x = fixedCoord;
          node.position.y = x;
          node.position.z = y;
        });
      }

      // In elevation view, center the model at the mid-height of the story range so
      // the model appears fully visible in the canvas, not hidden at the base.
      // If there are no defined stories, fall back to currentZ.
      let targetZ = this.currentZ ?? 0;
      if (this.stories?.length > 0) {
        const elevations = this.stories.map((s) => Number(s.elevation ?? 0));
        const maxStoryZ = Math.max(...elevations);
        if (maxStoryZ > 0) targetZ = maxStoryZ / 2;
      }

      let minZ = Infinity;
      let maxZ = -Infinity;
      modelo.nodes.forEach((node) => {
        if (node.position.z < minZ) minZ = node.position.z;
        if (node.position.z > maxZ) maxZ = node.position.z;
      });
      const midModelZ = (minZ + maxZ) / 2;
      const deltaZ = targetZ - midModelZ;
      if (deltaZ !== 0) {
        modelo.nodes.forEach((node) => {
          node.position.z += deltaZ;
        });
      }

      this._centrarModeloEnVista(modelo);
    }
  },

  _centrarModeloEnVista(modelo) {
    if (!modelo.nodes.length) return;

    const view = this.viewSet?.[this.activeViewIndex];
    if (!view || view.type !== "elevation") return;

    const ref = this.referenceGrid;

    if (view.axis === "Y") {
      // Elevación Y: plano X-Z → eje horizontal = X
      // Centro basado en el span de columnas del grid de referencia (eje X)
      const xPositions = ref?.xPositions ?? [];
      if (xPositions.length === 0) return;

      const minGridX = Math.min(...xPositions);
      const maxGridX = Math.max(...xPositions);
      const centerGridX = (minGridX + maxGridX) / 2;

      let minX = Infinity, maxX = -Infinity;
      modelo.nodes.forEach((node) => {
        minX = Math.min(minX, node.position.x);
        maxX = Math.max(maxX, node.position.x);
      });
      const centerModelX = (minX + maxX) / 2;
      const deltaX = centerGridX - centerModelX;

      modelo.nodes.forEach((node) => {
        node.position.x += deltaX;
      });
    } else if (view.axis === "X") {
      // Elevación X: plano Y-Z → eje horizontal = Y
      // Centro basado en el span de filas del grid de referencia (eje Y)
      const yPositions = ref?.yPositions ?? [];
      if (yPositions.length === 0) return;

      const minGridY = Math.min(...yPositions);
      const maxGridY = Math.max(...yPositions);
      const centerGridY = (minGridY + maxGridY) / 2;

      let minY = Infinity, maxY = -Infinity;
      modelo.nodes.forEach((node) => {
        minY = Math.min(minY, node.position.y);
        maxY = Math.max(maxY, node.position.y);
      });
      const centerModelY = (minY + maxY) / 2;
      const deltaY = centerGridY - centerModelY;

      modelo.nodes.forEach((node) => {
        node.position.y += deltaY;
      });
    }
  },
};

