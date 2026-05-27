// stores/memoriaDescriptivaStore.js - Store central para Memoria Descriptiva

export function createMemoriaDescriptivaStore() {
  return {
    // ============================================
    // ESTADO - Datos del Cover/Portada
    // ============================================
    cover: {
      title: "MEMORIA DESCRIPTIVA",
      subtitle: "ESPECIALIDAD ESTRUCTURAS",
      project: "",
      uei: "",
      unifiedCode: "",
      ieName: "",
      localCode: "",
      modularCodes: "",
      region: "",
      province: "",
      district: "",
      centerTown: "",
      este: "",
      norte: "",
      altitud: "",
      colindanciaNorte: "",
      colindanciaSur: "",
      colindanciaEste: "",
      colindanciaOeste: "",
      ubigeo: {
        department: "",
        province: "",
        district: "",
      },
      date: new Date().toISOString().split("T")[0],
      preparedBy: "",
      reportType: "MODULOS",
    },

    // ============================================
    // ESTADO - Secciones del Documento
    // ============================================
    sections: {
      // Sección 1: Generalidades
      generalidades: {
        antecedentes: {
          history: "",
          demandInitial: "",
          demandPrimary: "",
          accessRoads: "",
          textoCompleto: "",
          viasAccesoTexto: "",
        },
        datosProyecto: {
          uei: "",
          localidad: "",
          distrito: "",
          provincia: "",
          region: "",
          este: "",
          norte: "",
          altitud: "",
          colindanciaNorte: "",
          colindanciaSur: "",
          colindanciaEste: "",
          colindanciaOeste: "",
        },
        acceso: {
          limaHuanuco: { distancia: "410", tiempo: "8:00:00" },
          huanucoTingo: { distancia: "120", tiempo: "3:00:00" },
          tingoPucallpa: { distancia: "254", tiempo: "5:45:00" },
          pucallpaContamana: { distancia: "248", tiempo: "8:00:00" },
          total: { distancia: "1032", tiempo: "24h y 45 min" },
        },
        objetivos: {
          general: "",
          especificos: [],
        },
        marcoNormativo: [],
      },

      // Sección: Relación de Documentos y Planos
      documentosPlanos: {
        documentos: [],
        planos: [],
      },

      // Sección: Descripción de Módulos (16 módulos)
      descripcionModulos: {
        modulos: [
          { id: 1, nombre: "MÓDULO I", uso: "Grupo electrógeno, cuarto de tablero, maestranza, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Sistema de Albañilería confinada", elementosVerticales: "Placa L (PL 100x50x30x30 cm), Columnas CT (70x50x30x30cm), Muros de albañilería e=24cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [] },
          { id: 2, nombre: "MÓDULO II", uso: "1° Piso: SUM., Comedor / 2° Piso: Módulo de conectividad, depósito AIP y AIP", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
          { id: 3, nombre: "MÓDULO III", uso: "1° Piso: Biblioteca / 2° Piso: Taller creativo y depósito", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
          { id: 4, nombre: "MÓDULO IV", uso: "Escalera", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Muro Portante e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x50 cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada e=20cm (2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
          { id: 5, nombre: "MÓDULO V", uso: "Aulas", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Placa PT (50x100x30x30cm), Albañilería portante e=24cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en X de V30x50cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada e=20cm (2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
          { id: 6, nombre: "MÓDULO VI", uso: "Aulas y Escalera", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Placa PL (50x50x30x30 cm), Placa PL (65x50x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada e=20cm (2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
          { id: 7, nombre: "MÓDULO VII", uso: "Cocina, Almacén de alimentos, Cuarto de limpieza, Dep. combustible, etc.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas (30x30 cm), Muro portante e=13cm, Placa e=13cm", elementosHorizontales: "Vigas en X de V30x40cm, Vigas en Y de V30x40cm", techo: "Losa aligerada a una sola agua e=20cm", imagenes: [] },
          { id: 8, nombre: "MÓDULO VIII", uso: "1° Piso: Residuos sólidos, Sala de Docentes, Tópico, secretaria, dirección y SS.HH. / 2° Piso: Sala de Docentes, Sala de Reuniones, archivo, Deposito de materiales, Estar y Bienestar.", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Columna CL (50x50x30x30 cm), Placa PT (100x50x30x30cm), Placa 20x200cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
          { id: 9, nombre: "MÓDULO IX", uso: "Aulas, deposito, almacén, SS.HH, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Albañilería confinada", elementosVerticales: "Placa PT (100x50x30x30 cm), Columnas CT (70x50x30x30cm)", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [] },
          { id: 10, nombre: "MÓDULO X", uso: "Cocina, depósitos, Comedor, SS.HH, etc.", pisos: 1, sistemaX: "Sistema de Dual", sistemaY: "Sistema de Muros Estructurales", elementosVerticales: "Placas PL (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Placas e=15cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [] },
          { id: 11, nombre: "MÓDULO XI", uso: "Área de juego", pisos: 1, sistemaX: "Pórticos Ordinarios Resistentes a Momentos (OMF)", sistemaY: "Pórticos Especiales Resistentes a Momentos (SMF)", elementosVerticales: "Columna cuadrada metálico C30x30cm2 e=8mm.", elementosHorizontales: "Vigas W 10x45 en el eje Y y correas de 2x3x3mm. Tijerales en el eje X tubo HSS 4X4X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [] },
          { id: 12, nombre: "MÓDULO XII", uso: "Cuarto de bombas y/o tanque elevado", pisos: 4, sistemaX: "", sistemaY: "", elementosVerticales: "Columnas CL 60x60x25x25 cm", elementosHorizontales: "Vigas en X de V25x60cm, Vigas en Y de V25x60cm", techo: "Losa maciza e=20cm", imagenes: [] },
          { id: 13, nombre: "MÓDULO XIII", uso: "Rampa", pisos: 3, sistemaX: "Muros estructurales", sistemaY: "Muros estructurales", elementosVerticales: "Columna rectangular (30x40cm), Placas e=30cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en Y de V30x60cm", techo: "Losa en rampa de 15cm, Losa aligerada de 20cm a dos aguas (Techo)", imagenes: [] },
          { id: 14, nombre: "MÓDULO XIV", uso: "Guardianía y SS.HH.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas CL (40x40x25x25 cm)", elementosHorizontales: "Vigas en X de V25x40cm, Vigas en Y de V25x40cm", techo: "Losa aligerada a un agua e=20cm", imagenes: [] },
          { id: 15, nombre: "MÓDULO XV", uso: "SS.HH.", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Columna CL (50x50x30x30 cm), Placas e=20cm, Albañilería e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa maciza e=20cm (1° Nivel), Losa maciza e=20cm (2° Nivel), Losa aligerada en dos direcciones a dos aguas e=20cm (Techo)", imagenes: [] },
          { id: 16, nombre: "MÓDULO XVI", uso: "SUM EXTERIOR", pisos: 1, sistemaX: "Pórticos", sistemaY: "Pórticos", elementosVerticales: "Columna cuadrada de concreto armado C30x30cm2", elementosHorizontales: "Viga de concreto de 30x40cm2 en X. Tijerales en el eje Y tubo HSS 4X6X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [] }
        ]
      },

      // Sección: Consideraciones de Diseño (16 módulos)
      consideraciones: {},

      // Sección: Marco Teórico
      marcoTeorico: {
        conceptosBasicos: "",
        criteriosEstructurales: [],
        eleccionSistema: "",
        elementosEstructurales: [],
        materiales: {
          concreto: { fc: "210", ec: "217370.65", peso: "2.4", poisson: "0.20" },
          acero: { fy: "4200", es: "2000000", peso: "7.85" },
          albanileria: { fm: "85", vm: "9.2", em: "500", poisson: "0.25" },
        },
        software: "ETABS V16, SAP 2000, SAFE 2016",
        parametrosSismicos: {
          zona: "2",
          factorZ: "0.25",
          perfilSuelo: "S3",
          factorS: "1.40",
          tp: "1.00",
          tl: "1.60",
          categoria: "A",
          factorU: "1.50",
          ro: "",
          irregularidades: { altura: "", planta: "" },
        },
      },

      // Sección: Predimensionamiento (15 módulos)
      predimensionamiento: {},

      // Sección: Demolición
      demolicion: {
        alcance: "",
        modulosADemoler: [],
        obrasExterioresADemoler: [],
      },
    },

    // ============================================
    // ESTADO - Imágenes
    // ============================================
    images: {
      coverImage: null,
      coverImage2: null,
      ubicacionImage: null,
      demandaInicialImage: null,
      demandaPrimariaImage: null,
      moduloImages: [],
      demolicionImages: [],
    },

    previews: {
      coverImage: null,
      coverImage2: null,
      ubicacionImage: null,
      demandaInicialImage: null,
      demandaPrimariaImage: null,
      moduloImages: [],
      demolicionImages: [],
      predimLosaImage: {},
      predimVigaImage: {},
      predimColumnaImage: {},
    },

    // ============================================
    // ESTADO - UI
    // ============================================
    ui: {
      activeSection: "section-generalidades",
      isExporting: false,
      errors: [],
    },

    // ============================================
    // MÉTODOS - Generales
    // ============================================
    updateCover(data) {
      this.cover = { ...this.cover, ...data };
    },

    updateSection(sectionId, data) {
      if (this.sections[sectionId]) {
        this.sections[sectionId] = { ...this.sections[sectionId], ...data };
      }
    },

    addObjetivoEspecifico() {
      this.sections.generalidades.objetivos.especificos.push("");
    },

    removeObjetivoEspecifico(index) {
      this.sections.generalidades.objetivos.especificos.splice(index, 1);
    },

    addMarcoNormativo() {
      this.sections.generalidades.marcoNormativo.push("");
    },

    removeMarcoNormativo(index) {
      this.sections.generalidades.marcoNormativo.splice(index, 1);
    },

    addModulo() {
      this.sections.descripcionModulos.modulos.push({
        id: Date.now(),
        nombre: `MÓDULO ${String(this.sections.descripcionModulos.modulos.length + 1).padStart(2, '0')}`,
        uso: "",
        pisos: 1,
        sistemaX: "",
        sistemaY: "",
        elementosVerticales: "",
        elementosHorizontales: "",
        techo: "",
        imagenes: [],
      });
    },

    removeModulo(index) {
      this.sections.descripcionModulos.modulos.splice(index, 1);
    },

    // ============================================
    // MÉTODOS - Imágenes
    // ============================================
    updateImage(key, file, preview) {
      this.images[key] = file;
      this.previews[key] = preview;
    },

    removeImage(key) {
      this.images[key] = null;
      this.previews[key] = null;
    },

    async handleImageChange(key, event) {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione un archivo de imagen válido');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo excede el tamaño máximo de 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.updateImage(key, file, e.target.result);
        console.log(`✅ Imagen ${key} cargada`);
      };
      reader.readAsDataURL(file);
    },

    updateArrayImage(groupKey, index, file, preview) {
      if (!Array.isArray(this.images[groupKey])) this.images[groupKey] = [];
      if (!Array.isArray(this.previews[groupKey])) this.previews[groupKey] = [];
      this.images[groupKey][index] = file;
      this.previews[groupKey][index] = preview;
    },

    removeArrayImage(groupKey, index) {
      if (Array.isArray(this.images[groupKey])) this.images[groupKey][index] = null;
      if (Array.isArray(this.previews[groupKey])) this.previews[groupKey][index] = null;
    },

    updateModuloImage(moduloIndex, imageIndex, file, preview) {
      if (!Array.isArray(this.images.moduloImages[moduloIndex])) {
        this.images.moduloImages[moduloIndex] = [];
        this.previews.moduloImages[moduloIndex] = [];
      }
      this.images.moduloImages[moduloIndex][imageIndex] = file;
      this.previews.moduloImages[moduloIndex][imageIndex] = preview;
    },

    removeModuloImage(moduloIndex, imageIndex) {
      if (Array.isArray(this.images.moduloImages[moduloIndex])) {
        this.images.moduloImages[moduloIndex][imageIndex] = null;
      }
      if (Array.isArray(this.previews.moduloImages[moduloIndex])) {
        this.previews.moduloImages[moduloIndex][imageIndex] = null;
      }
    },

    // Predimensionamiento - Imágenes
    async handlePredimLosaImageChange(modulo, event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!this.previews.predimLosaImage) this.previews.predimLosaImage = {};
        this.previews.predimLosaImage[modulo] = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removePredimLosaImage(modulo) {
      if (this.previews.predimLosaImage) {
        delete this.previews.predimLosaImage[modulo];
      }
    },

    async handlePredimVigaImageChange(modulo, event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!this.previews.predimVigaImage) this.previews.predimVigaImage = {};
        this.previews.predimVigaImage[modulo] = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removePredimVigaImage(modulo) {
      if (this.previews.predimVigaImage) {
        delete this.previews.predimVigaImage[modulo];
      }
    },

    async handlePredimColumnaImageChange(modulo, event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!this.previews.predimColumnaImage) this.previews.predimColumnaImage = {};
        this.previews.predimColumnaImage[modulo] = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removePredimColumnaImage(modulo) {
      if (this.previews.predimColumnaImage) {
        delete this.previews.predimColumnaImage[modulo];
      }
    },

    // Demolición - Imágenes
    async handleDemolicionImageChange(index, event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!this.previews.demolicionImages) this.previews.demolicionImages = [];
        this.previews.demolicionImages[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeDemolicionImage(index) {
      if (this.previews.demolicionImages) {
        this.previews.demolicionImages[index] = null;
      }
    },

    addDemolicionImage() {
      if (!this.previews.demolicionImages) this.previews.demolicionImages = [];
      this.previews.demolicionImages.push(null);
    },

    // ============================================
    // MÉTODOS - Validación
    // ============================================
    addError(category, message) {
      this.ui.errors.push({ category, message, timestamp: Date.now() });
    },

    clearErrors() {
      this.ui.errors = [];
    },

    clearErrorsByCategory(category) {
      this.ui.errors = this.ui.errors.filter(e => e.category !== category);
    },

    // ============================================
    // MÉTODOS - Exportación
    // ============================================
    startExport() {
      this.ui.isExporting = true;
      this.clearErrors();
    },

    endExport() {
      this.ui.isExporting = false;
    },

    getExportData() {
      return {
        cover: this.cover,
        sections: this.sections,
        images: this.images,
        previews: this.previews,
      };
    },
  };
}