// mixins/io/file-io/legacy-analysis.js — parte "legacy-analysis" de file-io
// (file-io.js se partió en sub-mixins por responsabilidad; barril en file-io.js).
import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../../../model/shapes.js";
import { read as readmat } from "mat-for-js";
import { axisToFixed, removeFromArray } from "../../../lib/utils.js";
import { Triangle, Puente, Arco } from "../../../model/parametricModels.js";
import { extrudeToNewFloor, selectAllNodes, activate3DDrawingMode } from "../../../3d/modeling3d.js";
import { toggleView3D } from "../../../3d/viewer3d.js";
import {
  serializeFrameForceModule,
  restoreFrameForceModule,
} from "../../../engine/frameForcePersistence.js";

export const legacyAnalysisMixin = {

  // ------------------------------------------------------------------
  // 8. MÉTODOS DE ANÁLISIS ESTRUCTURAL (Octave y OpenSees)
  // ------------------------------------------------------------------

  /**
   * Envía los datos del modelo actual a Octave para resolver la armadura 3D.
   * @param {Event} event - Evento del formulario.
   */
  calcularFuerzas(event) {
    event.preventDefault();

    this.nodes.forEach((node) => {
      if (!node.force) node.force = { loads: {} };
      if (!node.reaction) node.reaction = { x: 0, y: 0, z: 0 };
    });

    // Si no hay event.target válido, crear un formulario temporal
    let targetForm = event.target;
    if (!targetForm || !(targetForm instanceof HTMLFormElement)) {
      console.warn("⚠️ Evento sin formulario válido, creando formulario temporal...");
      targetForm = document.createElement("form");
    }

    const formData = new FormData(targetForm);

    // ============================================================
    // 1. NODOS: [id, x, y, z] - TODAS las coordenadas 3D
    // ============================================================
    const nodosStr = this.nodes
      .map((node, index) => {
        // IMPORTANTE: Babylon.js usa Y como altura, pero MATLAB usa Z como altura
        // En tu sistema, position.z es la altura (porque en 2D se usaba XY)
        const x = node.position.x;
        const y = node.position.y; // Coordenada Y del plano 2D
        const z = node.position.z || 0; // Altura (elevación)

        return [index + 1, x, y, z].join(",");
      })
      .join(";");

    formData.append("nodos", "[" + nodosStr + "]");

    // ============================================================
    // 2. BARRAS: [id, node_i, node_j]
    // ============================================================
    const barrasStr = this.shapes
      .map((beam, index) => {
        const node1Id = this.nodes.indexOf(beam.node1) + 1;
        const node2Id = this.nodes.indexOf(beam.node2) + 1;
        return [index + 1, node1Id, node2Id].join(",");
      })
      .join(";");

    formData.append("barras", "[" + barrasStr + "]");

    // ============================================================
    // 3. CARGAS: [node_id, fx, fy, fz]
    // ============================================================
    const cargasList = this.nodes
      .map((node, index) => ({ id: index + 1, node: node }))
      .filter(({ node }) => node.tieneCarga())
      .map(({ id, node }) => {
        const fx = node.cargaX ? (typeof node.cargaX === "function" ? node.cargaX() : node.cargaX) : 0;
        const fy = node.cargaY ? (typeof node.cargaY === "function" ? node.cargaY() : node.cargaY) : 0;
        const fz = node.cargaZ ? (typeof node.cargaZ === "function" ? node.cargaZ() : node.cargaZ) : 0;
        return [id, fx, fy, fz].join(",");
      })
      .join(";");

    formData.append("cargas", cargasList.length ? "[" + cargasList + "]" : "[]");

    // ============================================================
    // 4. RESTRICCIONES: [node_id, rx, ry, rz]
    // rx=1: fijo en X, ry=1: fijo en Y, rz=1: fijo en Z
    // ============================================================
    const restringidosStr = this.nodes
      .map((node, index) => {
        let rx = 0,
          ry = 0,
          rz = 0;

        if (node.soporte === "soporteUno") {
          // Completamente fijo
          rx = 1;
          ry = 1;
          rz = 1;
        } else if (node.soporte === "soporteDos") {
          // Fijo solo en Y (deslizador horizontal) + Z
          rx = 0;
          ry = 1;
          rz = 1;
        } else if (node.soporte === "soporteTres") {
          // Fijo solo en X + Z
          rx = 1;
          ry = 0;
          rz = 1;
        } else if (node.soporte === "soporteCuatro") {
          // Solo fijo en Z (rodillo)
          rx = 0;
          ry = 0;
          rz = 1;
        } else {
          // Libre
          rx = 0;
          ry = 0;
          rz = 0;
        }

        return [index + 1, rx, ry, rz].join(",");
      })
      .join(";");

    formData.append("restringidos", "[" + restringidosStr + "]");

    // ============================================================
    // 5. PROPIEDADES: [area, E_modulo] para cada barra
    // ============================================================
    const propiedadesStr = this.shapes
      .map((beam) => {
        const area = beam.A || beam.area || 0.01;
        const E = beam.E || beam.modulusElasticity || 210e9;
        return [area, E].join(",");
      })
      .join(";");

    formData.append("propiedades", "[" + propiedadesStr + "]");

    console.log("📤 DATOS ENVIADOS (3D):");
    console.log("  Nodos:", nodosStr);
    console.log("  Barras:", barrasStr);
    console.log("  Cargas:", cargasList);
    console.log("  Restringidos:", restringidosStr);
    console.log("  Propiedades:", propiedadesStr);

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
      },
      buttonsStyling: false,
    });

    const waitingPopup = swalTailwind.fire({
      title: "Calculando en 3D!",
      html: "Por favor espere...<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    fetch("/calcularFuerzasArmaduras", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/octet-stream")) {
          return response.arrayBuffer();
        } else {
          const error = await response.text();
          return Promise.reject(error);
        }
      })
      .then((matData) => {
        waitingPopup.hideLoading();
        const fuerzas = readmat(matData);
        console.log("📊 RESULTADOS RECIBIDOS:", fuerzas);

        const dataObject = fuerzas.data;

        // ============================================================
        // PROCESAR DESPLAZAMIENTOS (3D)
        // ============================================================
        if (dataObject.MatrizDesplazamiento) {
          this.matrizDesplazamiento = dataObject.MatrizDesplazamiento;
          console.log("📏 Desplazamientos 3D:", this.matrizDesplazamiento);

          // === VALIDACIÓN DE ESTABILIDAD ===
          let maxDisp = 0;
          let invalid = false;
          for (let i = 0; i < this.matrizDesplazamiento.length; i++) {
            const d = this.matrizDesplazamiento[i];
            for (let j = 0; j < 3; j++) {
              const val = d[j];
              if (isNaN(val) || !isFinite(val)) {
                invalid = true;
                break;
              }
              if (Math.abs(val) > maxDisp) maxDisp = Math.abs(val);
            }
            if (invalid) break;
          }

          // Umbral: si el desplazamiento máximo > 1e6 metros (1000 km), asumimos inestabilidad
          if (invalid || maxDisp > 1e6) {
            console.error("Estructura inestable: desplazamiento máximo =", maxDisp);
            Swal.fire({
              icon: "error",
              title: "Estructura inestable",
              html: `Los desplazamientos calculados son anormalmente grandes (${maxDisp.toExponential(2)} m).<br>
                   Esto indica que la estructura es un <strong>mecanismo</strong> (no es rígida).<br><br>
                   <b>Sugerencias:</b><br>
                   • Añada diagonales para rigidizar la estructura.<br>
                   • Verifique que todos los nodos tengan conexiones suficientes.<br>
                   • Revise los apoyos (debe haber al menos 6 restricciones independientes en 3D).`,
              confirmButtonText: "OK",
            });
            return; // Detener el procesamiento
          }
          // Fin validación

          // ✅ Siempre actualizar las posiciones originales con los nodos actuales
          this._originalPositions3D = this.nodes.map((node) => ({
            x: node.position.x,
            y: node.position.y,
            z: node.position.z || 0,
          }));

          this.calcularDeflecciones3D();
        }

        // ============================================================
        // PROCESAR FUERZAS AXIALES
        // ============================================================
        if (dataObject.resultados && dataObject.resultados.lines) {
          Object.values(dataObject.resultados.lines).forEach((line, idx) => {
            const fuerza = Array.isArray(line.fuerza) ? line.fuerza[0] : line.fuerza;
            const beam = this.shapes[idx];
            if (beam) {
              beam.fAxial = fuerza;

              // Asegurar que beam.style exista
              if (!beam.style) {
                beam.style = {
                  normal: () => { },
                  compresion: () => { },
                  traccion: () => { },
                  default: () => { },
                };
              }

              if (Math.abs(fuerza) < 0.001) {
                beam.style.normal();
              } else if (fuerza < 0) {
                beam.style.compresion();
              } else {
                beam.style.traccion();
              }
            }
          });
        }

        // ============================================================
        // PROCESAR REACCIONES
        // ============================================================
        if (dataObject.Reacciones) {
          this.nodes.forEach((n, idx) => {
            n.reaction = {
              x: dataObject.Reacciones[3 * idx] || 0,
              y: dataObject.Reacciones[3 * idx + 1] || 0,
              z: dataObject.Reacciones[3 * idx + 2] || 0,
            };
          });
        }

        this.K_Global_Reducido = dataObject.K_Global_Reducido;
        this.Fuerzas_Globales_Reducidas = dataObject.Fuerzas_Globales_Reducidas;
        this.D_Global_Reducido = dataObject.D_Global_Reducido;

        // ============================================================
        // AJUSTAR ESCALA DE DEFORMACIÓN
        // ============================================================
        if (this.matrizDesplazamiento && this.matrizDesplazamiento.length > 0) {
          let maxDisp = 0;
          for (let i = 0; i < this.matrizDesplazamiento.length; i++) {
            const dx = Math.abs(this.matrizDesplazamiento[i][0] || 0);
            const dy = Math.abs(this.matrizDesplazamiento[i][1] || 0);
            const dz = Math.abs(this.matrizDesplazamiento[i][2] || 0);
            maxDisp = Math.max(maxDisp, dx, dy, dz);
          }

          if (maxDisp > 0 && maxDisp < 0.1) {
            this.options.deflectionScale = Math.min(500, Math.max(50, 0.05 / maxDisp));
            console.log(`🎨 Escala de deformación ajustada a: ${this.options.deflectionScale}x`);
          }
        }

        this.options.showDeflection = true;

        // Forzar redibujado completo de la deformada
        if (this.options.showDeflection && this.desplazamientosPosition) {
          console.log("🎨 Actualizando vista 3D con deformada (escala " + this.options.deflectionScale + "x)");
          this.sync3D(); // esto llamará a drawIn3D nuevamente
        }

        // Sincronizar con vista 3D
        this.sync3D();
        this.redraw();

        // Después de todo el procesamiento, actualizar el estado global del análisis
        this.analysisOptions.analysisStatus = "completed";
        this.analysisOptions.completedAt = new Date().toISOString();

        // Crear un objeto de resultados resumido
        this.analysisResults = {
          status: "completed",
          ranAt: this.analysisOptions.completedAt,
          summary: {
            nodes: this.nodes.length,
            frames: this.shapes.length,
            loads: this.nodes.filter((n) => n.tieneCarga?.()).length,
            maxDisplacement: this.getMaxDisplacement ? this.getMaxDisplacement() : 0,
            maxAxial: Math.max(...this.shapes.map((s) => Math.abs(s.fAxial || 0))),
          },
        };

        if (!this.displayOptions) this.displayOptions = {};
        this.displayOptions.analysisResultsAvailable = true;
        this.displayOptions.lastAnalysisRun = {
          ranAt: this.analysisOptions.completedAt,
          status: "completed",
          maxDisplacement: this.analysisResults.summary.maxDisplacement,
          maxAxial: this.analysisResults.summary.maxAxial,
        };

        swalTailwind.fire({
          icon: "success",
          title: "¡Cálculo 3D completado!",
          html: `Desplazamiento máximo: ${this.getMaxDisplacement().toFixed(4)} m`,
          timer: 3000,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.error("❌ Error en cálculo 3D:", error);
        waitingPopup.hideLoading();
        swalTailwind.fire({
          icon: "error",
          title: "Error en el cálculo 3D",
          html: error,
          showConfirmButton: true,
        });
      });
  },

  // Metodo que calcula la deflexion en 2D
  // calcularFuerzas(event) {
  //   event.preventDefault();
  //   const formData = new FormData(event.target);
  //   formData.append(
  //     "nodos",
  //     "[" +
  //       this.nodes
  //         .map((node, index) => {
  //           const z = node.position.z || 0; // Si no hay coordenada z, se asume 0
  //           return [index + 1, node.position.x, node.position.y, z].join(",");
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   formData.append(
  //     "barras",
  //     "[" +
  //       this.shapes
  //         .map((beam, index) => {
  //           return [index + 1, this.nodes.indexOf(beam.node1) + 1, this.nodes.indexOf(beam.node2) + 1].join(",");
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   formData.append(
  //     "cargas",
  //     "[" +
  //       this.nodes
  //         .map((node, index) => {
  //           return { id: index + 1, node: node };
  //         })
  //         .filter(({ node: node }) => {
  //           return node.tieneCarga();
  //         })
  //         .map((value) => {
  //           return [value.id, value.node.cargaX(), value.node.cargaY(), 0].join(",");
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   formData.append(
  //     "restringidos",
  //     "[" +
  //       this.nodes
  //         .map((node, index) => {
  //           return { id: index + 1, node: node };
  //         })
  //         .map((value) => {
  //           let restriccion = [0, 0, 1];
  //           if (value.node.soporte === "soporteUno") {
  //             restriccion = [1, 1, 1];
  //           } else if (value.node.soporte === "soporteDos") {
  //             restriccion = [0, 1, 1];
  //           } else if (value.node.soporte === "soporteTres") {
  //             restriccion = [1, 0, 1];
  //           }
  //           return [value.id, ...restriccion];
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   formData.append(
  //     "propiedades",
  //     "[" +
  //       this.shapes
  //         .map((beam) => {
  //           return [beam.A, beam.E].join(",");
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   console.log(Object.fromEntries(formData));

  //   const swalTailwind = Swal.mixin({
  //     customClass: {
  //       confirmButton:
  //         "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
  //     },
  //     buttonsStyling: false,
  //   });
  //   const waitingPopup = swalTailwind.fire({
  //     title: "Calculando!",
  //     html: "Por favor espere!<br>",
  //     allowOutsideClick: false,
  //     didOpen: () => {
  //       Swal.showLoading();
  //     },
  //   });
  //   fetch("/calcularFuerzasArmaduras3d", {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then(async (response) => {
  //       const contentType = response.headers.get("Content-Type");
  //       if (contentType && contentType.includes("application/octet-stream")) {
  //         return response.arrayBuffer();
  //       } else {
  //         const error = await response.text();
  //         return Promise.reject(error);
  //       }
  //     })
  //     .then((matData) => {
  //       waitingPopup.hideLoading();
  //       const fuerzas = readmat(matData);
  //       console.log(fuerzas);
  //       const dataObject = fuerzas.data;
  //       this.matrizDesplazamiento = dataObject.MatrizDesplazamiento;
  //       this.calcularDeflecciones();
  //       Object.values(dataObject.resultados.lines).forEach(({ coords: _, fuerza: [f] }, index) => {
  //         this.shapes[index].fAxial = f;
  //         if (Math.abs(f) < 0.001) {
  //           this.shapes[index].style.normal();
  //         } else if (f < 0) {
  //           this.shapes[index].style.compresion();
  //         } else {
  //           this.shapes[index].style.traccion();
  //         }
  //       });
  //       this.nodes.forEach((n, index) => {
  //         const rX = dataObject.Reacciones[3 * index];
  //         const rY = dataObject.Reacciones[3 * index + 1];
  //         dataObject.Reacciones[3 * index + 2];
  //         n.reaction.x = Math.abs(rX) < 1.0e-8 ? 0 : rX;
  //         n.reaction.y = Math.abs(rY) < 1.0e-8 ? 0 : rY;
  //       });
  //       this.K_Global_Reducido = fuerzas.data.K_Global_Reducido;
  //       this.Fuerzas_Globales_Reducidas = fuerzas.data.Fuerzas_Globales_Reducidas;
  //       this.D_Global_Reducido = fuerzas.data.D_Global_Reducido;
  //       this.sync3D(); // ← AGREGAR
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       waitingPopup.hideLoading();
  //       swalTailwind.fire({
  //         icon: "error",
  //         html: `
  //           ${error}
  //         `,
  //         showConfirmButton: true,
  //       });
  //     });
  // },

  /**
   * Calcula las posiciones deformadas para la vista 3D (X, Y, Z) usando la escala actual.
   * Almacena en this.desplazamientosPosition y también actualiza this.deflecciones.
   */
  calcularDeflecciones3D() {
    if (!this.matrizDesplazamiento || !this.nodes) return;

    // Inicializar posiciones originales si no existen
    if (!this._originalPositions3D) {
      this._originalPositions3D = this.nodes.map((node) => ({
        x: node.position.x,
        y: node.position.y,
        z: node.position.z || 0,
      }));
    }

    const scale = this.options.deflectionScale || 1;
    this.desplazamientosPosition = this.matrizDesplazamiento
      .map((disp, index) => {
        const orig = this._originalPositions3D[index];
        if (!orig) return null;
        const dx = disp[0] || 0;
        const dy = disp[1] || 0;
        const dz = disp[2] || 0;
        // Evitar NaN
        if (isNaN(dx) || isNaN(dy) || isNaN(dz)) return null;
        return {
          x: orig.x + dx * scale,
          y: orig.y + dy * scale,
          z: orig.z + dz * scale,
        };
      })
      .filter((p) => p !== null);

    // Calcular deflecciones para cada barra usando las posiciones deformadas
    // Si alguna posición deformada no es válida, se usará la posición original del nodo
    this.deflecciones = this.shapes.map((b) => {
      const idx1 = this.nodes.indexOf(b.node1);
      const idx2 = this.nodes.indexOf(b.node2);
      if (idx1 >= 0 && idx2 >= 0 && this.desplazamientosPosition) {
        const p1 = this.desplazamientosPosition[idx1];
        const p2 = this.desplazamientosPosition[idx2];
        return {
          x: [p1.x, p2.x],
          y: [p1.y, p2.y],
          z: [p1.z, p2.z],
        };
      }
      return { x: [0, 0], y: [0, 0], z: [0, 0] };
    });
    // Si algún nodo no tiene desplazamiento válido, usar posición original
    if (this.desplazamientosPosition.length !== this.nodes.length) {
      console.warn("Algunos nodos no tienen desplazamiento válido, usando originales");
      this.desplazamientosPosition = this.nodes.map((node, i) => {
        return (
          this.desplazamientosPosition[i] || {
            x: node.position.x,
            y: node.position.y,
            z: node.position.z || 0,
          }
        );
      });
    }
  },

  /**
   * Calcula las posiciones deformadas para la vista 2D (solo X e Y).
   * Actualiza this.desplazamientosPosition y this.deflecciones.
   */
  calcularDeflecciones() {
    this.desplazamientosPosition = this.matrizDesplazamiento.map(([x, y, _], index) => {
      return {
        x: x * this.options.deflectionScale + this.nodes[index].position.x,
        y: y * this.options.deflectionScale + this.nodes[index].position.y,
      };
    });
    this.deflecciones = this.shapes.map((b) => {
      return {
        x: [this.desplazamientosPosition[b.node1.id - 1].x, this.desplazamientosPosition[b.node2.id - 1].x],
        y: [this.desplazamientosPosition[b.node1.id - 1].y, this.desplazamientosPosition[b.node2.id - 1].y],
      };
    });
  },

  /**
   * Actualiza la escala de deformación cuando el usuario mueve el slider.
   * Recalcula posiciones deformadas y refresca ambas vistas.
   */
  updateDeflectionScale() {
    if (this.isBabylonAnimating()) return; // No interferir con animación
    if (this.matrizDesplazamiento) {
      // console.log("Escala:", this.options.deflectionScale);
      // this.calcularDeflecciones(); // actualiza this.desplazamientosPosition
      // console.log("desplazamientosPosition (2D):", this.desplazamientosPosition);
      this.calcularDeflecciones3D(); // actualiza this.desplazamientosPosition
      // console.log("desplazamientosPosition (3D):", this.desplazamientosPosition);

      // && viewer.elements.length > 0
      const viewer = getViewer3DState();
      if (viewer?.initialized && viewer?.scene) {
        // drawIn3D(this, true); // true = solo actualizar posiciones
        this.updateNodePositionsOnly();
      } else {
        this.sync3D(); // modo completo
      }

      this.redraw(); // (opcional) refresca la vista 2D
    }
  },

  // Alterna la visualización de la deformada en ambas vistas
  showDeflections() {
    this.options.showDeflection = !this.options.showDeflection;
    this.sync3D();
    this.redraw();
  },

  /**
   * Obtiene el desplazamiento máximo (norma) de todos los nodos.
   * @returns {number} Desplazamiento máximo en metros.
   */
  getMaxDisplacement() {
    if (!this.matrizDesplazamiento) return 0;

    let maxDisp = 0;
    for (let i = 0; i < this.matrizDesplazamiento.length; i++) {
      const dx = Math.abs(this.matrizDesplazamiento[i][0] || 0);
      const dy = Math.abs(this.matrizDesplazamiento[i][1] || 0);
      const dz = Math.abs(this.matrizDesplazamiento[i][2] || 0);
      const total = Math.sqrt(dx * dx + dy * dy + dz * dz);
      maxDisp = Math.max(maxDisp, total);
    }
    return maxDisp;
  },

  // ========== NUEVAS FUNCIONES PARA OPENSEES ==========

  // Función principal que reemplazará a calcularFuerzas cuando esté listo
  async calcularFuerzasOpenSees(event) {
    if (event) event.preventDefault();

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton: "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    const waitingPopup = swalTailwind.fire({
      title: "Calculando con OpenSees!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Primero, verificar si OpenSeesPy está disponible
      const statusResponse = await fetch("/api/opensees/status");
      const status = await statusResponse.json();

      let results;

      if (status.status === "online") {
        // Usar OpenSeesPy
        results = await this.analyzeWithOpenSees();
      } else {
        // Fallback a Octave
        console.log("OpenSees no disponible, usando Octave...");
        waitingPopup.hideLoading();
        return this.calcularFuerzas(event);
      }

      waitingPopup.hideLoading();

      if (results.success) {
        this.processOpenSeesResults(results);
        swalTailwind.fire({
          icon: "success",
          title: "¡Cálculo completado!",
          html: "Los resultados se han actualizado correctamente.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(results.error || "Error en el cálculo");
      }
    } catch (error) {
      waitingPopup.hideLoading();
      console.error("Error:", error);
      swalTailwind
        .fire({
          icon: "error",
          title: "Error",
          html: error.message || "Hubo un problema al calcular las fuerzas. Usando Octave...",
          showConfirmButton: true,
        })
        .then(() => {
          // Fallback a Octave
          this.calcularFuerzas(event);
        });
    }
  },

  // Versión híbrida que intenta OpenSees primero y fallback a Octave
  async calcularFuerzasHybrid(event) {
    if (event) event.preventDefault();

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton: "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    const waitingPopup = swalTailwind.fire({
      title: "Calculando!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Intentar llamar a OpenSees directamente
      const results = await this.analyzeWithOpenSees();
      waitingPopup.hideLoading();

      if (results && results.success) {
        this.processOpenSeesResults(results);
        swalTailwind.fire({
          icon: "success",
          title: "¡Cálculo completado!",
          html: "Resultados de OpenSeesPy",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      } else if (results && results.error) {
        throw new Error(results.error);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error) {
      waitingPopup.hideLoading();
      console.error("Error en OpenSees:", error);

      // Fallback a Octave
      console.log("Usando Octave como fallback...");
      this.calcularFuerzas(event);
    }
  },

  async analyzeWithOpenSees() {
    // ============================================================
    // 1. CAPTURAR DATOS DE TU INTERFAZ
    // ============================================================

    // Nodos: posición (x, y) de cada nodo
    const nodes = this.nodes.map((node, index) => ({
      id: index + 1,
      x: node.position.x,
      y: node.position.y,
    }));

    // Elementos: conexiones entre nodos
    const elements = this.shapes.map((beam, index) => ({
      id: index + 1,
      node_i: beam.node1.id,
      node_j: beam.node2.id,
      area: beam.A || 0.01, // Área de la sección
      E: beam.E || 200e9, // Módulo de elasticidad
    }));

    // Apoyos: restricciones (1=fijo, 0=libre)
    const supports = this.nodes.map((node, index) => ({
      node: index + 1,
      ux: node.soporte === "soporteUno" || node.soporte === "soporteTres" ? 1 : 0,
      uy: node.soporte !== "" ? 1 : 0,
    }));

    // Cargas: fuerzas aplicadas
    const loads = this.nodes.map((node, index) => ({
      node: index + 1,
      fx: node.cargaX(),
      fy: node.cargaY(),
    }));

    // ============================================================
    // 2. MOSTRAR EN CONSOLA PARA DEPURAR
    // ============================================================
    console.log("📤 DATOS ENVIADOS A OPENSEES:");
    console.log("   Nodos:", nodes);
    console.log("   Elementos:", elements);
    console.log("   Apoyos:", supports);
    console.log("   Cargas:", loads);

    // ============================================================
    // 3. ENVIAR AL SERVIDOR PYTHON
    // ============================================================
    const response = await fetch("/api/backend/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nodes: nodes,
        elements: elements,
        supports: supports,
        loads: loads,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const results = await response.json();
    console.log("📥 RESULTADOS RECIBIDOS:", results);

    return results;
  },

  // Procesar resultados de OpenSees
  processOpenSeesResults(results) {
    // Procesar fuerzas axiales
    Object.entries(results.forces).forEach(([id, axialForce]) => {
      const beamIndex = parseInt(id) - 1;
      if (this.shapes[beamIndex]) {
        this.shapes[beamIndex].fAxial = axialForce;
        if (Math.abs(axialForce) < 0.001) {
          this.shapes[beamIndex].style.normal();
        } else if (axialForce < 0) {
          this.shapes[beamIndex].style.compresion();
        } else {
          this.shapes[beamIndex].style.traccion();
        }
      }
    });

    // Procesar desplazamientos
    this.matrizDesplazamiento = Object.values(results.displacements).map((d) => [d.dx, d.dy, 0]);
    this.calcularDeflecciones();

    // Procesar reacciones
    Object.entries(results.reactions).forEach(([id, reaction]) => {
      const nodeIndex = parseInt(id) - 1;
      if (this.nodes[nodeIndex]) {
        this.nodes[nodeIndex].reaction.x = reaction.rx;
        this.nodes[nodeIndex].reaction.y = reaction.ry;
      }
    });

    // Sincronizar vista 3D
    this.sync3D();

    if (results.displacements) {
      // Aplicar desplazamientos a la visualización 3D
      this.applyDeformationsTo3D(results.displacements);
    }

    console.log("✅ Resultados de OpenSees procesados:", results);
  },

  // Después de runOpenSeesAnalysis(), agrega:
  applyDeformationsTo3D(displacements, scale = 100) {
    if (!window.babylonScene || !this.nodes) return;

    console.log("🎨 Aplicando deformaciones a vista 3D...");

    // Guardar posiciones originales si no existen
    if (!this._originalPositions) {
      this._originalPositions = this.nodes.map((node) => ({
        x: node.position.x,
        y: node.position.y,
        z: node.position.z || 0,
      }));
    }

    // Aplicar desplazamientos escalados
    this.nodes.forEach((node, i) => {
      const nodeId = node.id;
      const disp = displacements[nodeId];

      if (disp) {
        // Posición original
        const orig = this._originalPositions[i];

        // Nueva posición = original + desplazamiento * escala
        node.position.x = orig.x + (disp.dx || 0) * scale;
        node.position.y = orig.y + (disp.dy || 0) * scale;
        node.position.z = (orig.z || 0) + (disp.dz || 0) * scale;
      }
    });

    // Redibujar la escena 3D
    this.drawIn3D();

    console.log("✅ Deformaciones aplicadas (escala: " + scale + "x)");
  },

  async analyze3DWithOpenSees() {
    // ============================================================
    // 1. CAPTURAR DATOS 3D DE TU INTERFAZ
    // ============================================================

    const nodes = this.nodes.map((node, index) => ({
      id: index + 1,
      x: node.position.x,
      y: node.position.y,
      z: node.position.z || 0, // ← Coordenada Z (altura)
    }));

    const elements = this.shapes.map((beam, index) => ({
      id: index + 1,
      node_i: beam.node1.id,
      node_j: beam.node2.id,
      area: beam.A || 0.01,
      E: beam.E || 200e9,
      Iz: 0.0001, // Momento de inercia Z
      Iy: 0.0001, // Momento de inercia Y
      J: 1e-6, // Constante de torsión
    }));

    const supports = this.nodes.map((node, index) => ({
      node: index + 1,
      ux: node.soporte === "soporteUno" ? 1 : 0,
      uy: node.soporte === "soporteUno" || node.soporte === "soporteTres" ? 1 : 0,
      uz: node.soporte === "soporteUno" ? 1 : 0,
      rx: node.soporte === "soporteUno" ? 1 : 0,
      ry: node.soporte === "soporteUno" ? 1 : 0,
      rz: 1,
    }));

    const loads = this.nodes.map((node, index) => ({
      node: index + 1,
      fx: node.cargaX(),
      fy: node.cargaY(),
      fz: node.cargaZ() || 0,
      mx: 0,
      my: 0,
      mz: 0,
    }));

    console.log("📤 DATOS 3D ENVIADOS:", { nodes, elements, supports, loads });

    const response = await fetch("/api/backend/analyze-3d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes, elements, supports, loads }),
    });

    return response.json();
  },

  // ------------------------------------------------------------------
  // 9. MODELADO 3D (creación de nodos y barras, extrusión, etc.)
  // ------------------------------------------------------------------

  /**
   * Crea un nodo estructural con carga y restricción.
   * @param {number} x - Coordenada X.
   * @param {number} y - Coordenada Y (profundidad).
   * @param {number} z - Coordenada Z (altura).
   * @param {number} cargaX - Fuerza en X (kN).
   * @param {number} cargaY - Fuerza en Y (kN).
   * @param {number} cargaZ - Fuerza en Z (kN).
   * @param {string} restriccion - Tipo de apoyo (soporteUno, soporteDos, etc.).
   * @returns {Node} Nodo creado.
   */
  crearNodo3D(x, y, z, cargaX = 0, cargaY = 0, cargaZ = 0, restriccion = "") {
    const node = this.getOrCreateStructuralNode({ x, y, z });

    if (cargaX !== 0) node.cargaX = () => cargaX;
    if (cargaY !== 0) node.cargaY = () => cargaY;
    if (cargaZ !== 0) node.cargaZ = () => cargaZ;

    node.soporte = restriccion;

    return node;
  },

  /**
   * Crea una barra 3D entre dos nodos.
   * @param {Node} node1 - Nodo inicial.
   * @param {Node} node2 - Nodo final.
   * @param {string|number} area - Identificador de sección o área en m².
   * @param {number} E - Módulo de elasticidad (Pa).
   * @returns {Beam} Barra creada.
   */
  crearBarra3D(node1, node2, area = "25x25-1.5", E = 210e9) {
    const beam = new Beam(this.globalE, this.globalA);
    beam.addNode(node1);
    beam.addNode(node2);
    beam._A = area;
    beam.E = E;
    beam.id = this.shapes.length + 1;
    this.shapes.push(beam);
    return beam;
  },

  activate3DDrawingMode() {
    return activate3DDrawingMode(this);
  },

  extrudeToNewFloor() {
    // La altura del piso nuevo debe respetar la definida en el modelo (modal
    // "Nuevo Modelo" o "Generar Pisos desde la Grilla" — ambos escriben en
    // referenceGrid.storyHeight, la misma fuente de verdad que usa el resto
    // del sistema de grilla/vistas). Antes se llamaba sin height, así que
    // SIEMPRE usaba el default de 3m de la función pura sin importar lo que
    // el usuario hubiera definido — el piso extruido quedaba desalineado de
    // la grilla en cuanto storyHeight era distinto de 3.
    const floorHeight = Number(this.referenceGrid?.storyHeight) > 0
      ? Number(this.referenceGrid.storyHeight)
      : 3;
    return extrudeToNewFloor(this, floorHeight);
  },

  extrudeTo3D(floorHeight = 3, numFloors = 1) {
    return extrudeTo3D(this, floorHeight, numFloors);
  },

  selectAllNodes() {
    return selectAllNodes(this);
  },

  selectNodesByHeight(minZ, maxZ) {
    return selectNodesByHeight(this, minZ, maxZ);
  },

  showTestFrame() {
    return showTestFrame(this);
  },

  // ------------------------------------------------------------------
  // 10. MÉTODOS DE VISUALIZACIÓN 3D (Babylon.js)
  // ------------------------------------------------------------------

  toggleView3D() {
    return toggleView3D(this);
  },
};
