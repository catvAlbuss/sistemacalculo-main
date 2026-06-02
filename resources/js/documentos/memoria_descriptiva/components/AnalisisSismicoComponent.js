// components/AnalisisSismicoMdComponent.js - Componente para Análisis Sísmico (Memoria Descriptiva)

import { handleImageChange } from "../utils/imageHandler.js";
import { toNumber, roundNumber } from "../utils/dataValidator.js";

export function createAnalisisSismicoMdComponent() {
  return {
    init() {
      console.log("✅ Componente Análisis Sísmico MD inicializado");
      this.initData();
    },

    initData() {
      const store = this.$store.memoriaDescriptiva;
      
      if (!store.sections.analisisSismico) {
        store.sections.analisisSismico = {
          parametros: {
            zona: "2",
            factorZ: "0.25",
            perfilSuelo: "S3",
            factorS: "1.40",
            tp: "1.00",
            tl: "1.60",
            categoria: "A",
            factorU: "1.50",
            ro: null,
            irregularidades: {
              altura: false,
              planta: false,
            },
          },
          coeficientes: {
            ia: 1.0,
            ip: 1.0,
            r: null,
          },
          derivas: {
            maxima: 0,
            permisible: 0.006,
          },
          separacion: {
            juntaSismica: 0,
          },
        };
      }
    },

    get sections() {
      return this.$store?.memoriaDescriptiva?.sections || {};
    },

    get analisisSismico() {
      return this.sections.analisisSismico || {};
    },

    // Actualizar parámetros
    updateParametro(param, value) {
      this.$store.memoriaDescriptiva.sections.analisisSismico.parametros[param] = value;
      this.calcularFactorR();
    },

    updateIrregularidad(tipo, value) {
      this.$store.memoriaDescriptiva.sections.analisisSismico.parametros.irregularidades[tipo] = value;
      this.calcularFactorR();
    },

    // Calcular coeficiente de reducción R
    calcularFactorR() {
      const params = this.analisisSismico.parametros;
      const ro = params.ro || this.getRoPorSistema();
      const ia = params.irregularidades?.altura ? 0.75 : 1.0;
      const ip = params.irregularidades?.planta ? 0.75 : 1.0;
      
      const r = ro * ia * ip;
      
      this.$store.memoriaDescriptiva.sections.analisisSismico.coeficientes = {
        ia, ip, r: roundNumber(r, 2)
      };
      
      return r;
    },

    getRoPorSistema() {
      // Valores por defecto según sistema estructural
      return 7; // Dual
    },

    // Calcular período fundamental aproximado
    calcularPeriodoFundamental(altura, sistema) {
      const ct = sistema === 'muros' ? 0.05 : 0.07;
      return ct * Math.pow(altura, 0.75);
    },

    // Verificar derivas máximas
    verificarDerivas(derivaCalculada) {
      const permisible = 0.006;
      const cumple = derivaCalculada <= permisible;
      return { cumple, permisible, calculada: derivaCalculada };
    },

    toNumber,
    roundNumber,
  };
}