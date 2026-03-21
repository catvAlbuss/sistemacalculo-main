// AnalisisSismicoComponent.js - Alpine component for Análisis Sísmico section
export function createAnalisisSismicoComponent() {
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
    showSection32: false,
    showSection33: true,
    showSection331: false,
    showSection332: false,
    showSection333: false,
    showSection334: false,
    showSection335: false,

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
      this.loadFromStore();

      // DEBUG: Verificar estructura del store
      console.log("📦 Store disponible:", !!this.$store.memoriaCalculo);
      console.log("📦 previews:", this.$store.memoriaCalculo.previews);
    },

    initImageSlots() {
      const store = this.$store.memoriaCalculo;

      // Array groups necesarios
      const arrayGroups = [
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

    loadFromStore() {
      const store = this.$store.memoriaCalculo;
      if (!store) return;

      // Cargar figura26 y figura27 desde el store
      if (store.previews.estaticoConsideracionesETABS) {
        this.figura26 = store.previews.estaticoConsideracionesETABS[0] || null;
        this.figura27 = store.previews.estaticoConsideracionesETABS[1] || null;
        this.figura28 = store.previews.estaticoConsideracionesETABS[2] || null;
      }

      if (store.previews.dinamicoConsideracionesETABS) {
        this.figura29 = store.previews.dinamicoConsideracionesETABS[0] || null;
        this.figura30 = store.previews.dinamicoConsideracionesETABS[1] || null;
      }

      if (store.previews.modosVibracionImages) {
        this.figura31 = store.previews.modosVibracionImages[0] || null;
        this.figura32 = store.previews.modosVibracionImages[1] || null;
        this.figura33 = store.previews.modosVibracionImages[2] || null;
      }

      if (store.previews.cortanteBasalImages) {
        this.figura34 = store.previews.cortanteBasalImages[0] || null;
        this.figura35 = store.previews.cortanteBasalImages[1] || null;
        this.figura36 = store.previews.cortanteBasalImages[2] || null;
      }

      if (store.previews.desplazamientoImages) {
        this.figura37 = store.previews.desplazamientoImages[0] || null;
        this.figura38 = store.previews.desplazamientoImages[1] || null;
      }

      if (store.previews.deformadaImages) {
        this.figura39 = store.previews.deformadaImages[0] || null;
        this.figura40 = store.previews.deformadaImages[1] || null;
      }

      console.log("📦 Imágenes cargadas desde store");
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
