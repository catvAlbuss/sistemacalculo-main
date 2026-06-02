// components/AnalisisCargasMdComponent.js - Componente para Análisis de Cargas (Memoria Descriptiva)

import { handleImageChange } from "../utils/imageHandler.js";
import { toNumber, roundNumber } from "../utils/dataValidator.js";

export function createAnalisisCargasMdComponent() {
  return {
    init() {
      console.log("✅ Componente Análisis de Cargas MD inicializado");
      this.initData();
    },

    initData() {
      const store = this.$store.memoriaDescriptiva;
      
      if (!store.sections.analisisCargas) {
        store.sections.analisisCargas = {
          cargas: {
            muerta: {
              concreto: 2400,
              albanileria: 1800,
              aligerado: 300,
              acabados: 200,
              tarrajeo: 2000,
            },
            viva: {
              techos: 50,
              corredores: 400,
              aulas: 250,
              depositos: 500,
              escaleras: 400,
            },
          },
          viento: {
            velocidad: 75,
            alturaReferencia: 10,
          },
          combinaciones: [],
        };
      }
    },

    get sections() {
      return this.$store?.memoriaDescriptiva?.sections || {};
    },

    get analisisCargas() {
      return this.sections.analisisCargas || {};
    },

    // Métodos para actualizar cargas
    updateCargaMuerta(tipo, valor) {
      this.$store.memoriaDescriptiva.sections.analisisCargas.cargas.muerta[tipo] = toNumber(valor);
    },

    updateCargaViva(tipo, valor) {
      this.$store.memoriaDescriptiva.sections.analisisCargas.cargas.viva[tipo] = toNumber(valor);
    },

    updateViento(valor) {
      this.$store.memoriaDescriptiva.sections.analisisCargas.viento.velocidad = toNumber(valor);
    },

    // Calcular presión de viento
    calcularPresionViento() {
      const v = this.analisisCargas.viento?.velocidad || 75;
      const qz = (v * v) / 18000;
      return {
        velocidad: v,
        qz: roundNumber(qz, 2),
        barlovento: roundNumber(qz * 0.3 * 100),
        sotavento: roundNumber(qz * -0.6 * 100),
      };
    },

    // Agregar combinación de carga
    addCombinacion() {
      const combos = this.$store.memoriaDescriptiva.sections.analisisCargas.combinaciones;
      combos.push({
        nombre: `Combinación ${combos.length + 1}`,
        expresion: "",
        factores: {},
      });
    },

    removeCombinacion(index) {
      this.$store.memoriaDescriptiva.sections.analisisCargas.combinaciones.splice(index, 1);
    },

    toNumber,
    roundNumber,
  };
}