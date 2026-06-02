// components/SimpleSectionMdComponent.js - Componente base para secciones simples

export function createSimpleSectionMdComponent(sectionId, sectionName) {
  return {
    sectionId,
    sectionName,

    init() {
      console.log(`✅ Componente ${this.sectionName} inicializado`);
    },

    updateData(field, value) {
      const section = this.$store.memoriaDescriptiva.sections[this.sectionId];
      if (section) {
        section[field] = value;
      }
    },

    getData(field) {
      return this.$store.memoriaDescriptiva.sections[this.sectionId]?.[field];
    },

    validate() {
      return { valid: true, errors: [] };
    },
  };
}

// Componente para Análisis de Cargas (Sección 2)
export function createAnalisisCargasMdComponent() {
  return {
    ...createSimpleSectionMdComponent('analisisCargas', 'Análisis de Cargas'),

    init() {
      console.log('✅ Componente Análisis de Cargas MD inicializado');
      this.initData();
    },

    initData() {
      const store = this.$store.memoriaDescriptiva;
      if (!store.sections.analisisCargas) {
        store.sections.analisisCargas = {
          cargas: {
            muerta: 0,
            viva: 0,
            viento: 75,
          },
          descripciones: [],
        };
      }
    },
  };
}

// Componente para Análisis Sísmico (Sección 3)
export function createAnalisisSismicoMdComponent() {
  return {
    ...createSimpleSectionMdComponent('analisisSismico', 'Análisis Sísmico'),

    init() {
      console.log('✅ Componente Análisis Sísmico MD inicializado');
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
          },
          irregularidades: {
            altura: false,
            planta: false,
          },
        };
      }
    },
  };
}

// Componente para Diseño de Elementos (Sección 4)
export function createDisenoElementosMdComponent() {
  return {
    ...createSimpleSectionMdComponent('disenoElementos', 'Diseño de Elementos'),

    init() {
      console.log('✅ Componente Diseño de Elementos MD inicializado');
      this.initData();
    },

    initData() {
      const store = this.$store.memoriaDescriptiva;
      if (!store.sections.disenoElementos) {
        store.sections.disenoElementos = {
          losas: [],
          vigas: [],
          columnas: [],
          placas: [],
          cimentaciones: [],
        };
      }
    },
  };
}

// Componente para Estructura Metálica (Sección 5)
export function createEstructuraMetalicaMdComponent() {
  return {
    ...createSimpleSectionMdComponent('estructuraMetalica', 'Estructura Metálica'),

    init() {
      console.log('✅ Componente Estructura Metálica MD inicializado');
      this.initData();
    },

    initData() {
      const store = this.$store.memoriaDescriptiva;
      if (!store.sections.estructuraMetalica) {
        store.sections.estructuraMetalica = {
          elementos: [],
          descripcion: "",
        };
      }
    },
  };
}