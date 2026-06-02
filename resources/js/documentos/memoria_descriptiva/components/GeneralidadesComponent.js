// components/GeneralidadesMdComponent.js - Componente para Generalidades

import { handleImageChange } from "../utils/imageHandler.js";
import { toNumber, roundNumber } from "../utils/dataValidator.js";

export function createGeneralidadesMdComponent() {
  return {
    init() {
      console.log("✅ Componente Generalidades MD inicializado");
      this.initArrays();
    },

    initArrays() {
      const store = this.$store.memoriaDescriptiva;
      
      if (!store.sections.generalidades.objetivos.especificos.length) {
        store.sections.generalidades.objetivos.especificos = [""];
      }
      
      if (!store.sections.generalidades.marcoNormativo.length) {
        store.sections.generalidades.marcoNormativo = this.getDefaultMarcoNormativo();
      }
    },

    getDefaultMarcoNormativo() {
      return [
        "Norma Técnica de Edificaciones E.020 \"Cargas\"",
        "Norma Técnica de Edificaciones E.030 \"Diseño Sismo-Resistente\"",
        "Norma Técnica de Edificaciones E.050 \"Suelos\"",
        "Norma Técnica de Edificaciones E.060 \"Concreto Armado\"",
        "Norma Técnica de Edificaciones E.070 \"Albañilería\"",
        "Norma Técnica de Edificaciones E.090 \"Estructuras Metálicas\"",
        "Norma Técnica de Edificaciones ACI 318",
      ];
    },

    addObjetivoEspecifico() {
      this.$store.memoriaDescriptiva.sections.generalidades.objetivos.especificos.push("");
    },

    removeObjetivoEspecifico(index) {
      this.$store.memoriaDescriptiva.sections.generalidades.objetivos.especificos.splice(index, 1);
    },

    addMarcoNormativo() {
      this.$store.memoriaDescriptiva.sections.generalidades.marcoNormativo.push("");
    },

    removeMarcoNormativo(index) {
      this.$store.memoriaDescriptiva.sections.generalidades.marcoNormativo.splice(index, 1);
    },

    get cover() {
      return this.$store?.memoriaDescriptiva?.cover || {};
    },

    get sections() {
      return this.$store?.memoriaDescriptiva?.sections || {};
    },

    get previews() {
      return this.$store?.memoriaDescriptiva?.previews || {};
    },

    async handleImageChange(key, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          this.$store.memoriaDescriptiva.updateImage(key, file, dataUrl);
        },
        (error) => {
          this.$store.memoriaDescriptiva.addError("images", error);
        },
      );
    },

    removeImage(key) {
      this.$store.memoriaDescriptiva.removeImage(key);
    },

    toNumber,
    roundNumber,
  };
}