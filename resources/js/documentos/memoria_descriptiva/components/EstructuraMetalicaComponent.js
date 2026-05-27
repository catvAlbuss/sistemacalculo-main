// components/EstructuraMetalicaMdComponent.js - Componente para Estructura Metálica (Memoria Descriptiva)

import { handleImageChange } from "../utils/imageHandler.js";

export function createEstructuraMetalicaMdComponent() {
  return {
    // Estados para acordeones
    showModeloMatematico: false,
    showColumnas: false,
    showBridasSuperior: false,
    showBridasInferior: false,
    showParantes: false,
    showDiagonales: false,
    showCorreas: false,

    init() {
      console.log("✅ Componente Estructura Metálica MD inicializado");
      this.initData();
    },

    initData() {
      const store = this.$store.memoriaDescriptiva;
      
      if (!store.sections.estructuraMetalica) {
        store.sections.estructuraMetalica = {
          elementos: {
            columnaMetalica: { seccion: "", descripcion: "", imagenes: [] },
            bridaSuperior: { seccion: "", descripcion: "", imagenes: [] },
            bridaInferior: { seccion: "", descripcion: "", imagenes: [] },
            parante: { seccion: "", descripcion: "", imagenes: [] },
            diagonal: { seccion: "", descripcion: "", imagenes: [] },
            correaMetalica: { seccion: "", descripcion: "", imagenes: [] },
          },
          analisis: {
            modeloMatematico: null,
          },
        };
      }

      // Inicializar arrays de imágenes
      if (!store.images.disenoColumnaMetalica) store.images.disenoColumnaMetalica = [];
      if (!store.previews.disenoColumnaMetalica) store.previews.disenoColumnaMetalica = [];
      if (!store.images.disenoBridaSuperior) store.images.disenoBridaSuperior = [];
      if (!store.previews.disenoBridaSuperior) store.previews.disenoBridaSuperior = [];
      if (!store.images.disenoBridaInferior) store.images.disenoBridaInferior = [];
      if (!store.previews.disenoBridaInferior) store.previews.disenoBridaInferior = [];
      if (!store.images.disenoParante) store.images.disenoParante = [];
      if (!store.previews.disenoParante) store.previews.disenoParante = [];
      if (!store.images.disenoDiagonal) store.images.disenoDiagonal = [];
      if (!store.previews.disenoDiagonal) store.previews.disenoDiagonal = [];
      if (!store.images.disenoCorreaMetalica) store.images.disenoCorreaMetalica = [];
      if (!store.previews.disenoCorreaMetalica) store.previews.disenoCorreaMetalica = [];
    },

    get sections() {
      return this.$store?.memoriaDescriptiva?.sections || {};
    },

    get estructuraMetalica() {
      return this.sections.estructuraMetalica || {};
    },

    get previews() {
      return this.$store?.memoriaDescriptiva?.previews || {};
    },

    // ============================================
    // MÉTODOS - Modelo Matemático
    // ============================================
    async handleModeloMatematicoImageChange(event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          this.$store.memoriaDescriptiva.sections.estructuraMetalica.analisis.modeloMatematico = dataUrl;
        },
        (error) => {
          this.$store.memoriaDescriptiva.addError("images", error);
        },
      );
    },

    removeModeloMatematicoImage() {
      this.$store.memoriaDescriptiva.sections.estructuraMetalica.analisis.modeloMatematico = null;
    },

    // ============================================
    // MÉTODOS - Columna Metálica
    // ============================================
    updateColumnaMetalica(field, value) {
      this.$store.memoriaDescriptiva.sections.estructuraMetalica.elementos.columnaMetalica[field] = value;
    },

    async handleColumnaMetalicaImageChange(index, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          if (!this.$store.memoriaDescriptiva.previews.disenoColumnaMetalica) {
            this.$store.memoriaDescriptiva.previews.disenoColumnaMetalica = [];
          }
          this.$store.memoriaDescriptiva.previews.disenoColumnaMetalica[index] = dataUrl;
        },
        (error) => {
          this.$store.memoriaDescriptiva.addError("images", error);
        },
      );
    },

    removeColumnaMetalicaImage(index) {
      if (this.$store.memoriaDescriptiva.previews.disenoColumnaMetalica) {
        this.$store.memoriaDescriptiva.previews.disenoColumnaMetalica[index] = null;
      }
    },

    // ============================================
    // MÉTODOS - Brida Superior
    // ============================================
    updateBridaSuperior(field, value) {
      this.$store.memoriaDescriptiva.sections.estructuraMetalica.elementos.bridaSuperior[field] = value;
    },

    async handleBridaSuperiorImageChange(index, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          if (!this.$store.memoriaDescriptiva.previews.disenoBridaSuperior) {
            this.$store.memoriaDescriptiva.previews.disenoBridaSuperior = [];
          }
          this.$store.memoriaDescriptiva.previews.disenoBridaSuperior[index] = dataUrl;
        },
        (error) => {
          this.$store.memoriaDescriptiva.addError("images", error);
        },
      );
    },

    removeBridaSuperiorImage(index) {
      if (this.$store.memoriaDescriptiva.previews.disenoBridaSuperior) {
        this.$store.memoriaDescriptiva.previews.disenoBridaSuperior[index] = null;
      }
    },

    // ============================================
    // MÉTODOS - Brida Inferior
    // ============================================
    updateBridaInferior(field, value) {
      this.$store.memoriaDescriptiva.sections.estructuraMetalica.elementos.bridaInferior[field] = value;
    },

    async handleBridaInferiorImageChange(index, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          if (!this.$store.memoriaDescriptiva.previews.disenoBridaInferior) {
            this.$store.memoriaDescriptiva.previews.disenoBridaInferior = [];
          }
          this.$store.memoriaDescriptiva.previews.disenoBridaInferior[index] = dataUrl;
        },
        (error) => {
          this.$store.memoriaDescriptiva.addError("images", error);
        },
      );
    },

    removeBridaInferiorImage(index) {
      if (this.$store.memoriaDescriptiva.previews.disenoBridaInferior) {
        this.$store.memoriaDescriptiva.previews.disenoBridaInferior[index] = null;
      }
    },

    // ============================================
    // MÉTODOS - Parante
    // ============================================
    updateParante(field, value) {
      this.$store.memoriaDescriptiva.sections.estructuraMetalica.elementos.parante[field] = value;
    },

    async handleParanteImageChange(index, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          if (!this.$store.memoriaDescriptiva.previews.disenoParante) {
            this.$store.memoriaDescriptiva.previews.disenoParante = [];
          }
          this.$store.memoriaDescriptiva.previews.disenoParante[index] = dataUrl;
        },
        (error) => {
          this.$store.memoriaDescriptiva.addError("images", error);
        },
      );
    },

    removeParanteImage(index) {
      if (this.$store.memoriaDescriptiva.previews.disenoParante) {
        this.$store.memoriaDescriptiva.previews.disenoParante[index] = null;
      }
    },

    // ============================================
    // MÉTODOS - Diagonal
    // ============================================
    updateDiagonal(field, value) {
      this.$store.memoriaDescriptiva.sections.estructuraMetalica.elementos.diagonal[field] = value;
    },

    async handleDiagonalImageChange(index, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          if (!this.$store.memoriaDescriptiva.previews.disenoDiagonal) {
            this.$store.memoriaDescriptiva.previews.disenoDiagonal = [];
          }
          this.$store.memoriaDescriptiva.previews.disenoDiagonal[index] = dataUrl;
        },
        (error) => {
          this.$store.memoriaDescriptiva.addError("images", error);
        },
      );
    },

    removeDiagonalImage(index) {
      if (this.$store.memoriaDescriptiva.previews.disenoDiagonal) {
        this.$store.memoriaDescriptiva.previews.disenoDiagonal[index] = null;
      }
    },

    // ============================================
    // MÉTODOS - Correa Metálica
    // ============================================
    updateCorreaMetalica(field, value) {
      this.$store.memoriaDescriptiva.sections.estructuraMetalica.elementos.correaMetalica[field] = value;
    },

    async handleCorreaMetalicaImageChange(index, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          if (!this.$store.memoriaDescriptiva.previews.disenoCorreaMetalica) {
            this.$store.memoriaDescriptiva.previews.disenoCorreaMetalica = [];
          }
          this.$store.memoriaDescriptiva.previews.disenoCorreaMetalica[index] = dataUrl;
        },
        (error) => {
          this.$store.memoriaDescriptiva.addError("images", error);
        },
      );
    },

    removeCorreaMetalicaImage(index) {
      if (this.$store.memoriaDescriptiva.previews.disenoCorreaMetalica) {
        this.$store.memoriaDescriptiva.previews.disenoCorreaMetalica[index] = null;
      }
    },

    // Utilidades
    toggleSection(section) {
      this[section] = !this[section];
    },
  };
}