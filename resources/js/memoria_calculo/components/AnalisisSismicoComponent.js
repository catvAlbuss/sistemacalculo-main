// AnalisisSismicoComponent.js - Alpine component for Análisis Sísmico section
import { handleImageChange } from "../utils/imageHandler.js";

export function createAnalisisSismicoComponent() {
  // const CONFIG_ELEMENTOS = {
  //   seccion1: {
  //     nombre: "Losa Aligerada",
  //     metodoStore: "updateLosaAligeradaImage",
  //     imagenesPorSeccion: 2,
  //     prefijoArchivo: "losa_alig",
  //     groupKey: "seccion1Images",
  //   },
  //   seccion2: {
  //     nombre: "Viga",
  //     metodoStore: "updateVigaImage",
  //     imagenesPorSeccion: 2,
  //     prefijoArchivo: "viga",
  //     groupKey: "seccion2Images",
  //   },
  //   seccion3: {
  //     nombre: "Columna",
  //     metodoStore: "updateColumnaImage",
  //     imagenesPorSeccion: 4,
  //     prefijoArchivo: "columna",
  //     groupKey: "seccion3Images",
  //   },
  //   seccion4: {
  //     nombre: "Placa",
  //     metodoStore: "updatePlacaImage",
  //     imagenesPorSeccion: 4,
  //     prefijoArchivo: "placa",
  //     groupKey: "seccion4Images",
  //   },
  //   seccion5: {
  //     nombre: "Cimentación",
  //     metodoStore: "updateCimentacionImage",
  //     imagenesPorSeccion: 4,
  //     prefijoArchivo: "ciment",
  //     groupKey: "seccion5Images",
  //   },
  //   seccion6: {
  //     nombre: "Predim",
  //     metodoStore: "updatePredimImage",
  //     imagenesPorSeccion: 2,
  //     prefijoArchivo: "ciment",
  //     groupKey: "seccion6Images",
  //   },
  //   seccion7: {
  //     nombre: "Predim",
  //     metodoStore: "updatePredimImage",
  //     imagenesPorSeccion: 2,
  //     prefijoArchivo: "ciment",
  //     groupKey: "seccion7Images",
  //   },
  //   seccion8: {
  //     nombre: "Predim",
  //     metodoStore: "updatePredimImage",
  //     imagenesPorSeccion: 2,
  //     prefijoArchivo: "ciment",
  //     groupKey: "seccion8Images",
  //   },
  //   seccion9: {
  //     nombre: "Predim",
  //     metodoStore: "updatePredimImage",
  //     imagenesPorSeccion: 2,
  //     prefijoArchivo: "ciment",
  //     groupKey: "seccion9Images",
  //   },
  //   seccion10: {
  //     nombre: "Predim",
  //     metodoStore: "updatePredimImage",
  //     imagenesPorSeccion: 2,
  //     prefijoArchivo: "ciment",
  //     groupKey: "seccion10Images",
  //   },
  //   seccion11: {
  //     nombre: "Predim",
  //     metodoStore: "updatePredimImage",
  //     imagenesPorSeccion: 2,
  //     prefijoArchivo: "ciment",
  //     groupKey: "seccion11Images",
  //   },
  // };

  return {
    // Section 3.2 - Análisis Sísmico Estático (3 images)
    figura26: null, // Patrón de cargas sísmicas en "X"
    figura27: null, // Patrón de cargas sísmicas en "Y"
    figura28: null, // Peso sísmico

    // Section 3.3.1 - CONSIDERACIONES EN ETABS (2 images)
    figura29: null, // Datos del caso de carga en "X"
    figura30: null, // Datos del caso de carga en "Y"

    // Section 3.3.2 - MODOS DE VIBRACIÓN (3 images)
    figura31: null, // Datos de modos a su períodos
    figura32: null, // Modo de vibración 2-desplazamiento en "Y"
    figura33: null, // Modo de vibración 1-desplazamiento en "X"

    // Section 3.3.3 - FUERZA CORTANTE BASAL DINÁMICA (1 image)
    figura34: null, // Fuerza cortante en la base obtenida

    // Section 3.3.4 - DESPLAZAMIENTO PERMISIBLE (4 images)
    figura35: null, // Sismo Dinámico en dirección "X" Escalado
    figura36: null, // Sismo Dinámico en dirección "Y" Escalado
    figura37: null, // Sismo Dinámico en dirección "X"
    figura38: null, // Sismo Dinámico en dirección "Y"

    // Section 3.3.5 - DEFORMADAS (2 images)
    figura39: null, // Deformada en "X" debido a carga sísmica (mm)
    figura40: null, // Deformada en "Y" debido a carga sísmica (mm)

    // Accordion states for subsections
    showSection31: false,
    showSection311: false,
    showSection312: false,
    showSection313: false,
    showSection314: false,
    showSection315: false,
    showSection316: false,
    showSection317: false,
    showSection318: false,
    showSection319: false,
    showSection3110: false,
    showSection3111: false,

    showSection32: false,
    showSection321: false,
    showSection322: false,
    showSection323: false,
    showSection324: false,
    showSection325: false,
    showSection326: false,
    showSection327: false,

    showSection33: false,
    showSection34: false,
    showSection341: false,
    showSection342: false,
    showSection343: false,
    showSection344: false,
    showSection345: false,


    imageMappings: {
      // Sección 3.2 - Análisis Sísmico Estático
      figura26: {
        type: "array",
        key: "estaticoConsideracionesETABS",
        index: 0,
        caption: 'figura 26-Patrón de cargas sísmicas en "X"',
      },
      figura27: {
        type: "array",
        key: "estaticoConsideracionesETABS",
        index: 1,
        caption: 'figura 27-Patrón de cargas sísmicas en "Y"',
      },
      figura28: {
        type: "array",
        key: "estaticoConsideracionesETABS",
        index: 2,
        caption: "figura 28-Peso Sismico",
      },

      // Sección 3.3.1 - CONSIDERACIONES EN ETABS
      figura29: {
        type: "array",
        key: "dinamicoConsideracionesETABS",
        index: 0,
        caption: 'figura 29-Datos del caso de carga en "X"',
      },
      figura30: {
        type: "array",
        key: "dinamicoConsideracionesETABS",
        index: 1,
        caption: 'figura 30-Datos del caso de carga en "Y"',
      },

      // Sección 3.3.2 - MODOS DE VIBRACIÓN
      figura31: {
        type: "array",
        key: "modosVibracionImages",
        index: 0,
        caption: "figura 31-Datos de modos a su períodos",
      },
      figura32: {
        type: "array",
        key: "modosVibracionImages",
        index: 1,
        caption: 'figura 32-Modo de vibración 2-desplazamiento en "Y"',
      },
      figura33: {
        type: "array",
        key: "modosVibracionImages",
        index: 2,
        caption: 'figura 33-Modo de vibración 1-desplazamiento en "X"',
      },

      // Sección 3.3.3 - FUERZA CORTANTE BASAL
      figura34: {
        type: "array",
        key: "cortanteBasalImages",
        index: 0,
        caption: "figura 34-Fuerza cortante en la base obtenida",
      },
      figura35: {
        type: "array",
        key: "cortanteBasalImages",
        index: 1,
        caption: 'figura 35-Sismo Dinámico en dirección "X" Escalado',
      },
      figura36: {
        type: "array",
        key: "cortanteBasalImages",
        index: 2,
        caption: 'figura 36-Sismo Dinámico en dirección "Y" Escalado',
      },
      // Sección 3.3.4 - DESPLAZAMIENTO PERMISIBLE
      figura37: {
        type: "array",
        key: "desplazamientoImages",
        index: 0,
        caption: 'figura 37-Sismo Dinámico en dirección "X"',
      },
      figura38: {
        type: "array",
        key: "desplazamientoImages",
        index: 1,
        caption: 'figura 38-Sismo Dinámico en dirección "Y"',
      },

      // Sección 3.3.5 - DEFORMADAS
      figura39: {
        type: "array",
        key: "deformadaImages",
        index: 0,
        caption: 'figura 39-Deformada en "X" debido a carga sísmica (mm)',
      },
      figura40: {
        type: "array",
        key: "deformadaImages",
        index: 1,
        caption: 'figura 40-Deformada en "Y" debido a carga sísmica (mm)',
      },
    },

    init() {
      console.log("AnalisisSismicoComponent initialized");

      // Listen for state restoration events
      // this.$watch('$store.memoriaCalculoState.analisisSismico', (value) => {
      //     if (value) {
      //         this.restoreState(value);
      //     }
      // });

      // VERIFICACIÓN CRÍTICA: ¿El store existe?
      if (!this.$store.memoriaCalculo) {
        console.error("❌ Store memoriaCalculo no encontrado");
        return;
      }

      this.initImageSlots();

      // DEBUG: Verificar estructura del store
      console.log("📦 Store disponible:", !!this.$store.memoriaCalculo);
      console.log("📦 previews:", this.$store.memoriaCalculo.previews);
    },

    initImageSlots() {
      const store = this.$store.memoriaCalculo;

      // Array groups necesarios
      const arrayGroups = [
        "irregularidadImages",
        "analisisEstructuralImages",
        "estaticoConsideracionesETABS",
        "dinamicoConsideracionesETABS",
        "modosVibracionImages",
        "cortanteBasalImages",
        "desplazamientoImages",
        "deformadaImages",
      ];

      // Crear arrays si no existen
      arrayGroups.forEach((group) => {
        if (!Array.isArray(store.images[group])) {
          store.images[group] = [];
        }
        if (!Array.isArray(store.previews[group])) {
          store.previews[group] = [];
        }
      });

      // Tamaños requeridos
      const arraySizes = {
        irregularidadImages: 17,
        analisisEstructuralImages: 22,
        estaticoConsideracionesETABS: 3,
        dinamicoConsideracionesETABS: 2,
        modosVibracionImages: 3,
        cortanteBasalImages: 3,
        desplazamientoImages: 2,
        deformadaImages: 2,
      };

      // Asegurar tamaños
      Object.entries(arraySizes).forEach(([arrayName, size]) => {
        // Images
        while (store.images[arrayName].length < size) {
          store.images[arrayName].push(null);
        }
        if (store.images[arrayName].length > size) {
          store.images[arrayName] = store.images[arrayName].slice(0, size);
        }

        // Previews
        while (store.previews[arrayName].length < size) {
          store.previews[arrayName].push(null);
        }
        if (store.previews[arrayName].length > size) {
          store.previews[arrayName] = store.previews[arrayName].slice(0, size);
        }
      });

      // const simpleVars = ["cortanteBasalImages"];

      // simpleVars.forEach((key) => {
      //   if (!store.images.hasOwnProperty(key)) store.images[key] = null;
      //   if (!store.previews.hasOwnProperty(key)) store.images[key] = null;
      // });
    },

    async handleImageUpload(event, figura) {
      const file = event.target.files[0];
      if (!file) return;

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        alert("Por favor seleccione un archivo de imagen válido");
        return;
      }

      const mapping = this.imageMappings[figura];
      if (!mapping) {
        console.error(`❌ No hay mapeo para ${figura}`);
        return;
      }

      // Convertir a DataURL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;

        // Actualizar propiedad local
        this[figura] = dataUrl;

        if (mapping.type === "array") {
          // Guardar en el store PRINCIPAL
          if (!Array.isArray(this.$store.memoriaCalculo.images[mapping.key])) {
            this.$store.memoriaCalculo.images[mapping.key] = [];
          }
          if (!Array.isArray(this.$store.memoriaCalculo.previews[mapping.key])) {
            this.$store.memoriaCalculo.previews[mapping.key] = [];
          }

          this.$store.memoriaCalculo.images[mapping.key][mapping.index] = file;
          this.$store.memoriaCalculo.previews[mapping.key][mapping.index] = dataUrl;

          // Disparar evento para actualizar la UI
          this.$store.memoriaCalculo.previews = { ...this.$store.memoriaCalculo.previews };

          console.log(`✅ ${figura} guardada en ${mapping.key}[${mapping.index}]`);
        } else {
          this.$store.memoriaCalculo.images[mapping.key] = file;
          this.$store.memoriaCalculo.previews[mapping.key] = dataUrl;
          console.log(`✅ ${figura} guardada como VARIABLE ${mapping.key}`);
        }

        // DEBUG: Verificar que se guardó
        console.log(
          "📦 Store después de guardar:",
          this.$store.memoriaCalculo.previews[mapping.key][mapping.index] ? "OK" : "ERROR",
        );
      };

      reader.onerror = () => {
        alert("Error al cargar la imagen");
      };

      reader.readAsDataURL(file);
    },

    /**
     * Maneja el evento de pegado (Ctrl+V) para imágenes
     * @param {ClipboardEvent} event - Evento del portapapeles
     * @param {string} figura - Nombre de la figura (ej: 'figura26')
     */
    handlePaste(event, figura) {
      // Prevenir comportamiento default
      event.preventDefault();
      event.stopPropagation();

      // Obtener items del portapapeles
      const items = event.clipboardData?.items;
      if (!items) return;

      // Buscar imagen en el portapapeles
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Verificar si es una imagen
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            // Procesar como si fuera un input file
            this.handleImageUploadFromPaste(file, figura);
            break;
          }
        }
      }
    },

    /**
     * Procesa imagen pegada desde el portapapeles
     * @param {File} file - Archivo de imagen
     * @param {string} figura - Nombre de la figura
     */
    async handleImageUploadFromPaste(file, figura) {
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        alert("El portapapeles no contiene una imagen válida");
        return;
      }

      const mapping = this.imageMappings[figura];
      if (!mapping) {
        console.error(`❌ No hay mapeo para ${figura}`);
        return;
      }

      // Convertir a DataURL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;

        // Actualizar propiedad local
        this[figura] = dataUrl;

        // Guardar en el store
        if (mapping.type === "array") {
          if (!Array.isArray(this.$store.memoriaCalculo.images[mapping.key])) {
            this.$store.memoriaCalculo.images[mapping.key] = [];
          }
          if (!Array.isArray(this.$store.memoriaCalculo.previews[mapping.key])) {
            this.$store.memoriaCalculo.previews[mapping.key] = [];
          }

          this.$store.memoriaCalculo.images[mapping.key][mapping.index] = file;
          this.$store.memoriaCalculo.previews[mapping.key][mapping.index] = dataUrl;

          // Forzar actualización de UI
          this.$store.memoriaCalculo.previews = { ...this.$store.memoriaCalculo.previews };

          console.log(`✅ ${figura} pegada en ${mapping.key}[${mapping.index}]`);
        }
      };

      reader.onerror = () => {
        alert("Error al procesar la imagen del portapapeles");
      };

      reader.readAsDataURL(file);
    },

    removeImage(figura) {
      const mapping = this.imageMappings[figura];
      if (!mapping) return;

      // Limpiar propiedad local
      this[figura] = null;

      if (mapping.type === "array") {
        // Limpiar del store PRINCIPAL
        if (this.$store.memoriaCalculo.images[mapping.key]) {
          this.$store.memoriaCalculo.images[mapping.key][mapping.index] = null;
        }
        if (this.$store.memoriaCalculo.previews[mapping.key]) {
          this.$store.memoriaCalculo.previews[mapping.key][mapping.index] = null;
        }
      } else {
        // Limpiar del store PRINCIPAL
        if (this.$store.memoriaCalculo.images[mapping.key]) {
          this.$store.memoriaCalculo.images[mapping.key][mapping.index] = null;
        }
        if (this.$store.memoriaCalculo.previews[mapping.key]) {
          this.$store.memoriaCalculo.previews[mapping.key][mapping.index] = null;
        }
      }

      // Disparar evento para actualizar la UI
      this.$store.memoriaCalculo.previews = { ...this.$store.memoriaCalculo.previews };

      // Limpiar input
      const input = this.$refs?.[`input_${figura}`];
      if (input) input.value = "";

      console.log(`🗑️ ${figura} eliminada`);
    },

    toggleSection(section) {
      this[section] = !this[section];
    },

    /**
     * Maneja el cambio de una imagen en array
     * @param {string} groupKey - Clave del grupo
     * @param {number} index - Índice
     * @param {Event} event - Evento del input file
     */
    async handleArrayImageChange(groupKey, index, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          this.$store.memoriaCalculo.updateArrayImage(groupKey, index, file, dataUrl);
        },
        (error) => {
          this.$store.memoriaCalculo.addError("images", error);
        },
      );

      console.log(`✅ Imagen guardada:`);
      console.log(`   - Grupo: ${groupKey}`);
      console.log(`   - Índice: ${index}`);
    },

    /**
     * Maneja el pegado de imagen en un grupo e índice específico
     * @param {ClipboardEvent} event - Evento del portapapeles
     * @param {string} groupKey - Clave del grupo
     * @param {number} index - Índice
     */
    async handlePasteArray(event, groupKey, index) {
      event.preventDefault();
      event.stopPropagation();

      // if (document.activeElement !== event.target) {
      //   console.log(`⏭️ Ignorando ${groupKey}[${index}] - no tiene foco`);
      //   return;
      // }

      console.log(`📋 Detectado pegado para ${groupKey}[${index}]`);

      try {
        //USAR event.clipboardData (DATOS INMEDIATOS)
        const items = event.clipboardData?.items;

        if (!items) {
          console.log("No hay items en el portapapeles");
          return;
        }

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          if (item.type.indexOf("image") !== -1) {
            // ✅ Obtener el archivo directamente del evento (SINCRÓNICO)
            const file = item.getAsFile();

            if (file) {
              // Crear nombre único
              const fileName = `pegado_${Date.now()}.png`;
              const renamedFile = new File([file], fileName, { type: file.type });

              // Crear evento simulado
              const mockEvent = {
                target: {
                  files: [renamedFile],
                },
                type: "change",
              };

              // Usar el mismo handler que la selección de archivos
              await handleImageChange(
                mockEvent,
                (file, dataUrl) => {
                  this.$store.memoriaCalculo.updateArrayImage(groupKey, index, file, dataUrl);
                  console.log(`✅ Imagen pegada INSTANTÁNEAMENTE en ${groupKey}[${index}]`);
                },
                (error) => {
                  this.$store.memoriaCalculo.addError("images", error);
                  console.error(`❌ Error al pegar:`, error);
                },
              );

              return;
            }
          }
        }

        console.log("No se encontró una imagen en el portapapeles");
      } catch (error) {
        console.error("Error al pegar:", error);
      }
    },

    /**
     * Elimina una imagen de array
     * @param {string} groupKey - Clave del grupo
     * @param {number} index - Índice
     */
    removeArrayImage(groupKey, index) {
      this.$store.memoriaCalculo.removeArrayImage(groupKey, index);
    },

    getState() {
      return {
        figura26: this.figura26,
        figura27: this.figura27,
        figura28: this.figura28,
        figura29: this.figura29,
        figura30: this.figura30,
        figura31: this.figura31,
        figura32: this.figura32,
        figura33: this.figura33,
        figura34: this.figura34,
        figura35: this.figura35,
        figura36: this.figura36,
        figura37: this.figura37,
        figura38: this.figura38,
        figura39: this.figura39,
        figura40: this.figura40,
      };
    },
  };
}
