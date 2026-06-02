// components/DisenoElementosMdComponent.js - Componente para Diseño de Elementos (Memoria Descriptiva)

import { handleImageChange } from "../utils/imageHandler.js";
import { toNumber, roundNumber } from "../utils/dataValidator.js";

export function createDisenoElementosMdComponent() {
  return {
    init() {
      console.log("✅ Componente Diseño de Elementos MD inicializado");
      this.initData();
    },

    initData() {
      const store = this.$store.memoriaDescriptiva;
      
      if (!store.sections.disenoElementos) {
        store.sections.disenoElementos = {
          losas: {
            aligeradas: [],
            macizas: [],
            nervadas: [],
          },
          vigas: [],
          columnas: [],
          placas: [],
          cimentaciones: [],
          escaleras: [],
          cisternas: [],
        };
      }

      // Inicializar arrays de imágenes
      if (!store.images.losaImages) store.images.losaImages = [];
      if (!store.previews.losaImages) store.previews.losaImages = [];
      if (!store.images.vigaImages) store.images.vigaImages = [];
      if (!store.previews.vigaImages) store.previews.vigaImages = [];
      if (!store.images.columnaImages) store.images.columnaImages = [];
      if (!store.previews.columnaImages) store.previews.columnaImages = [];
      if (!store.images.placaImages) store.images.placaImages = [];
      if (!store.previews.placaImages) store.previews.placaImages = [];
      if (!store.images.cimentacionImages) store.images.cimentacionImages = [];
      if (!store.previews.cimentacionImages) store.previews.cimentacionImages = [];
    },

    get sections() {
      return this.$store?.memoriaDescriptiva?.sections || {};
    },

    get disenoElementos() {
      return this.sections.disenoElementos || {};
    },

    get previews() {
      return this.$store?.memoriaDescriptiva?.previews || {};
    },

    // ============================================
    // MÉTODOS - Losas
    // ============================================
    addLosa(tipo) {
      const key = `${tipo}Images`;
      this.$store.memoriaDescriptiva.sections.disenoElementos.losas[tipo].push({
        id: Date.now(),
        nombre: `${tipo} ${this.$store.memoriaDescriptiva.sections.disenoElementos.losas[tipo].length + 1}`,
        dimensiones: "",
        armado: "",
        imagenes: [],
      });
    },

    removeLosa(tipo, index) {
      this.$store.memoriaDescriptiva.sections.disenoElementos.losas[tipo].splice(index, 1);
    },

    // ============================================
    // MÉTODOS - Vigas
    // ============================================
    addViga() {
      this.$store.memoriaDescriptiva.sections.disenoElementos.vigas.push({
        id: Date.now(),
        nombre: `Viga ${this.$store.memoriaDescriptiva.sections.disenoElementos.vigas.length + 1}`,
        seccion: "",
        luz: "",
        armado: "",
        imagenes: [],
      });
    },

    removeViga(index) {
      this.$store.memoriaDescriptiva.sections.disenoElementos.vigas.splice(index, 1);
    },

    // ============================================
    // MÉTODOS - Columnas
    // ============================================
    addColumna() {
      this.$store.memoriaDescriptiva.sections.disenoElementos.columnas.push({
        id: Date.now(),
        nombre: `Columna ${this.$store.memoriaDescriptiva.sections.disenoElementos.columnas.length + 1}`,
        seccion: "",
        refuerzo: "",
        imagenes: [],
      });
    },

    removeColumna(index) {
      this.$store.memoriaDescriptiva.sections.disenoElementos.columnas.splice(index, 1);
    },

    // ============================================
    // MÉTODOS - Placas
    // ============================================
    addPlaca() {
      this.$store.memoriaDescriptiva.sections.disenoElementos.placas.push({
        id: Date.now(),
        nombre: `Placa ${this.$store.memoriaDescriptiva.sections.disenoElementos.placas.length + 1}`,
        espesor: "",
        longitud: "",
        armado: "",
        imagenes: [],
      });
    },

    removePlaca(index) {
      this.$store.memoriaDescriptiva.sections.disenoElementos.placas.splice(index, 1);
    },

    // ============================================
    // MÉTODOS - Cimentaciones
    // ============================================
    addCimentacion() {
      this.$store.memoriaDescriptiva.sections.disenoElementos.cimentaciones.push({
        id: Date.now(),
        nombre: `Cimentación ${this.$store.memoriaDescriptiva.sections.disenoElementos.cimentaciones.length + 1}`,
        tipo: "Zapata aislada",
        dimensiones: "",
        armado: "",
        imagenes: [],
      });
    },

    removeCimentacion(index) {
      this.$store.memoriaDescriptiva.sections.disenoElementos.cimentaciones.splice(index, 1);
    },

    // ============================================
    // MÉTODOS - Imágenes
    // ============================================
    async handleElementoImageChange(elemento, tipo, index, imageIndex, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          const seccion = this.$store.memoriaDescriptiva.sections.disenoElementos[elemento][tipo][index];
          if (!seccion.imagenes) seccion.imagenes = [];
          seccion.imagenes[imageIndex] = dataUrl;
        },
        (error) => {
          this.$store.memoriaDescriptiva.addError("images", error);
        },
      );
    },

    removeElementoImage(elemento, tipo, index, imageIndex) {
      const seccion = this.$store.memoriaDescriptiva.sections.disenoElementos[elemento][tipo][index];
      if (seccion && seccion.imagenes) {
        seccion.imagenes[imageIndex] = null;
      }
    },

    toNumber,
    roundNumber,
  };
}