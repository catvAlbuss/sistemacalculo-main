// stores/memoriaCalculoStore.js - Store centralizado para Memoria de Cálculo

/**
 * Store global de Alpine.js para gestionar el estado de la Memoria de Cálculo
 * Este store centraliza el estado de todas las secciones y facilita la comunicación entre componentes
 */
export function createMemoriaCalculoStore() {
  return {
    // ============================================
    // ESTADO - Datos del Cover/Portada
    // ============================================
    cover: {
      title: "MEMORIA DE CÁLCULO",
      subtitle: "ESPECIALIDAD ESTRUCTURA",
      project:
        "VIVIENDA MULTIFAMILIAR EN AV. JUAN VELASCO ALVARADO Nro 1493 Mz A Lt 01 URBANIZACIÓN SAN JUAN II, DISTRITO DE PILLCO MARCA, PROVINCIA Y REGION DE HUANUCO",
      code: "",
      client: "",
      location: "",
      ubigeo: {
        department: "HUANUCO",
        province: "",
        district: "",
      },
      date: new Date().toISOString().split("T")[0],
      preparedBy: "",
      extraLines: [],
      soilFactor: "S2",
      soilPeriod: "Tp",
      seismicZone: "2",
      seismicZoneFactor: "0.25",
      buildingCategory: "C",
      importanceFactorU: "1.00",
      structuralSystemDescription: "Dual, Muros de Concreto Armado",
      soilValue: "1.20",
      soilPeriodValue: "0.6",
      reportType: "CASA", // 'CASA' o 'MODULOS'
    },

    // ============================================
    // ESTADO - Secciones del Documento
    // ============================================
    sections: {
      // Sección 1: Generalidades
      generalidades: {
        floors: 1,
        structuralDetails: {
          usage: "Piso 1",
          structuralSystemX: "Sistema Dual",
          structuralSystemY: "Sistema Dual",
          verticalElements: "Columnas y Placas de Concreto Armado",
          horizontalElements: "Vigas de Concreto Armado",
          roof: "Losa aligerada e=20cm",
          materialDesign: {
            aceroEstructural: { fy: "4200", e: "2038901.92", fc: "" },
            aceroCorrugado: { fy: "4200", e: "2038901.92", fc: "" },
            concreto: { fy: "", e: "253456.4", fc: "210" },
          },
          generalDescription: "",
          combinacionesCarga: {
            comb1: true, // 1,4 CM + 1,7 CV
            comb2: true, // 1,25 (CM + CV +/- CVi)
            comb3: true, // 0,9 CM +/- 1,25 CVi
            comb4: true, // 1,25(CM + CV) +/- CS
            comb5: true, // 0,9 CM +/- CS
            comb6: true, // 1,4 CM + 1,7 CV + 1,7 CE
            comb7: true, // 0,9 CM + 1,7 CE
            comb8: true, // 1,4 CM + 1,7 CV + 1,4 CL
            comb9: true, // 1,05 CM + 1,25 CV + 1,05 CT
          },
        },
      },

      // Sección 2: Análisis de Cargas
      analisisCargas: {
        casoscarga: {
          cargaviento: "75",
          K5: "10",
          K10: "20",
          K11: "10",
          K17: "15.85",
          K21: "0.30",
          K26: "-0.70",
          K32: "-0.60",
        },
        // descripcionesModelo: [""],
        // descripcionesEspectro: ["", ""],
        descripcionesCargaViva: ["", "", "", ""],
        descripcionesCargaMuerta: ["", "", "", ""],
      },

      // Sección 3: Análisis Sísmico
      analisisSismico: {},

      // Sección 4: Diseño de Elementos
      disenoElementos: {
        resultadoPredim: 1,
        predim: 1,
        losa: 1,
        lista: "Lista 1",
        viga: 1,
        nameVigas: "Viga 1",
        columna: 1,
        nameColumna: "Columna 1",
        descriptionColumna: [],
        cimentacion: 1,
        nameCimentacion: "Cimentacion 1",
        placa: 1,
        namePlaca: "Placa 1",
      },

      // Sección 5: Estructura Metálica
      estructuraMetalica: {
        descripcion: {
          ColumnaMetalica: "",
          BridaSuperior: "",
          BridaInferior: "",
          Parante: "",
          Diagonal: "",
          CorreaMetalica: "",
        },
      },

      // Sección 6: Conclusiones
      conclusiones: {
        descripcion: "",
      },

      // Sección 7: Recomendaciones
      recomendaciones: {
        descripcion: "",
      },
    },

    // ============================================
    // ESTADO - Imágenes
    // ============================================
    images: {
      // Imágenes de portada
      coverImage: null,
      coverImage2: null,

      // Imágenes por piso
      floorImages: [],

      // Imagenes de las losas de cada seccion
      losaImages: [],

      // Imágenes de materiales
      materialImages: [null, null, null],

      // Imágenes de análisis
      modeloMatematico3DImages: [null], // Fig 14
      espectroPseudoaceleracionesImages: [null, null], // Fig 15, 16
      metradoCargasImages: [null, null, null, null], // Fig 18-21
      cargasAproximadasImages: [null, null, null, null], // Fig 22-25
      estaticoConsideracionesETABS: [null, null, null], //26-27-28
      dinamicoConsideracionesETABS: [null, null], //29,30
      modosVibracionImages: [null, null, null],
      cortanteBasalImages: [null, null, null],
      desplazamientoImages: [null, null],
      deformadaImages: [null, null],

      //imagenes para el diseño de elementos estructurales
      predisionamientoImages: [null, null, null, null, null, null, null, null],
      disenoLosaAligeradaImages: [null],
      disenoLosaMacizaImages: [null, null, null, null, null, null],
      disenoLosaNervada1Images: [null, null, null, null, null, null, null, null, null],
      disenoLosaNervada2Images: [null, null, null, null, null, null, null, null, null],
      disenoVigaImages: [null],
      disenoMuroConcretoImages: [null, null, null, null, null, null],
      disenoEscaleraImages: [null, null, null, null, null],
      disenoCisternaImages: [null, null, null, null, null, null],
      disenoSimientoCorridoImages: [null, null, null, null, null, null],

      // imagenes para la seccion de analisis estructural
      analisisEstructuralImages: [null],

      disenoColumnaMetalica: [null, null],
      disenoBridaSuperior: [null, null],
      disenoBridaInferior: [null, null],
      disenoParante: [null, null],
      disenoDiagonal: [null, null],
      disenoCorreaMetalica: [null, null],
    },

    // Previews de imágenes (data URLs)
    previews: {
      coverImage: null,
      coverImage2: null,
      floorImages: [],
      losaImages: [],
      vigaImages: [],
      columnaImages: [],
      cimentacionImages: [],
      placaImages: [],
      predimImages: [],

      materialImages: [null, null, null],
      modeloMatematico3DImages: [null],
      espectroPseudoaceleracionesImages: [null, null],
      metradoCargasImages: [null, null, null, null],
      cargasAproximadasImages: [null, null, null, null],
      estaticoConsideracionesETABS: [null, null, null], //26-27-28
      dinamicoConsideracionesETABS: [null, null], //29,30
      modosVibracionImages: [null, null, null],
      cortanteBasalImages: [null, null, null],
      desplazamientoImages: [null, null],
      deformadaImages: [null, null],

      //imagenes para el diseño de elementos estructurales
      predisionamientoImages: [null, null, null, null, null, null, null, null],
      disenoLosaAligeradaImages: [null],
      disenoLosaMacizaImages: [null, null, null, null, null, null],
      disenoLosaNervada1Images: [null, null, null, null, null, null, null, null, null],
      disenoLosaNervada2Images: [null, null, null, null, null, null, null, null, null],
      disenoVigaImages: [null], // 1 img
      disenoMuroConcretoImages: [null, null, null, null, null, null],
      disenoEscaleraImages: [null, null, null, null, null],
      disenoCisternaImages: [null, null, null, null, null, null],
      disenoSimientoCorridoImages: [null, null, null, null, null, null],

      // imagenes para la seccion de analisis estructural
      analisisEstructuralImages: [null],

      disenoColumnaMetalica: [null, null],
      disenoBridaSuperior: [null, null],
      disenoBridaInferior: [null, null],
      disenoParante: [null, null],
      disenoDiagonal: [null, null],
      disenoCorreaMetalica: [null, null],
    },

    // ============================================
    // ESTADO - UI / Control de Interfaz
    // ============================================
    ui: {
      activeSection: "section-info-general",
      isExporting: false,
      errors: [],
    },

    // ============================================
    // MÉTODOS - Gestión de Secciones
    // ============================================

    /**
     * Actualiza los datos de una sección específica
     * @param {string} sectionId - ID de la sección
     * @param {object} data - Datos a actualizar
     */
    updateSection(sectionId, data) {
      if (this.sections[sectionId]) {
        this.sections[sectionId] = {
          ...this.sections[sectionId],
          ...data,
        };
      }
    },

    /**
     * Actualiza los datos del cover
     * @param {object} data - Datos a actualizar
     */
    updateCover(data) {
      this.cover = { ...this.cover, ...data };
    },

    /**
     * Cambia la sección activa
     * @param {string} sectionId - ID de la sección
     */
    setActiveSection(sectionId) {
      this.ui.activeSection = sectionId;
    },

    /**
     * Obtiene los datos completos de una sección
     * @param {string} sectionId - ID de la sección
     * @returns {object} Datos de la sección
     */
    getSection(sectionId) {
      return this.sections[sectionId] || {};
    },

    // ============================================
    // MÉTODOS - Gestión de Imágenes
    // ============================================

    /**
     * Actualiza una imagen individual
     * @param {string} key - Clave de la imagen
     * @param {File|null} file - Archivo de imagen
     * @param {string|null} preview - Data URL de preview
     */
    updateImage(key, file, preview) {
      this.images[key] = file;
      this.previews[key] = preview;
    },

    /**
     * Actualiza una imagen en un array
     * @param {string} groupKey - Clave del grupo de imágenes
     * @param {number} index - Índice en el array
     * @param {File|null} file - Archivo de imagen
     * @param {string|null} preview - Data URL de preview
     */
    updateArrayImage(groupKey, index, file, preview) {
      if (!Array.isArray(this.images[groupKey])) {
        this.images[groupKey] = [];
      }
      if (!Array.isArray(this.previews[groupKey])) {
        this.previews[groupKey] = [];
      }

      this.images[groupKey][index] = file;
      this.previews[groupKey][index] = preview;
    },

    /**
     * Elimina una imagen
     * @param {string} key - Clave de la imagen
     */
    removeImage(key) {
      this.images[key] = null;
      this.previews[key] = null;
    },

    /**
     * Elimina una imagen de un array
     * @param {string} groupKey - Clave del grupo
     * @param {number} index - Índice
     */
    removeArrayImage(groupKey, index) {
      if (Array.isArray(this.images[groupKey])) {
        this.images[groupKey][index] = null;
      }
      if (Array.isArray(this.previews[groupKey])) {
        this.previews[groupKey][index] = null;
      }
    },

    // ============================================
    // MÉTODOS - Gestión de Pisos
    // ============================================

    /**
     * Actualiza el número de pisos
     * @param {number} count - Número de pisos
     */
    updateFloors(count) {
      const floorCount = parseInt(count) || 1;
      this.sections.generalidades.floors = floorCount;

      // Ajustar arrays de imágenes de pisos
      while (this.images.floorImages.length < floorCount) {
        this.images.floorImages.push(null);
        this.previews.floorImages.push(null);
      }
      if (this.images.floorImages.length > floorCount) {
        this.images.floorImages = this.images.floorImages.slice(0, floorCount);
        this.previews.floorImages = this.previews.floorImages.slice(0, floorCount);
      }
    },

    // ============================================
    // MÉTODOS - Gestión de Losas
    // ============================================

    /**
     * Actualiza el número de losas/secciones
     * @param {number} count - Número de losas
     */
    updateLosas(count) {
      const losaCount = parseInt(count) || 1;
      console.log(`🔄 Actualizando número de losas a: ${losaCount}`);

      // Actualizar el valor en sections
      if (!this.sections.disenoElementos) {
        this.sections.disenoElementos = {};
      }
      this.sections.disenoElementos.losa = losaCount;

      // Asegurar que los arrays existen
      if (!Array.isArray(this.images.losaImages)) {
        this.images.losaImages = [];
      }
      if (!Array.isArray(this.previews.losaImages)) {
        this.previews.losaImages = [];
      }

      // Ajustar tamaño del array principal
      while (this.images.losaImages.length < losaCount) {
        // Cada losa tiene un array de 4 imágenes
        this.images.losaImages.push([null, null, null, null]);
        this.previews.losaImages.push([null, null, null, null]);
      }

      if (this.images.losaImages.length > losaCount) {
        this.images.losaImages = this.images.losaImages.slice(0, losaCount);
        this.previews.losaImages = this.previews.losaImages.slice(0, losaCount);
      }

      console.log(`✅ Arrays de losas ajustados: ${this.images.losaImages.length} losas con 4 imágenes cada una`);
    },

    // /**
    //  * Actualiza una imagen específica de una losa
    //  * @param {number} seccionIndex - Índice de la sección
    //  * @param {number} imagenIndex - Índice de la imagen (0-3)
    //  * @param {File} file - Archivo de imagen
    //  * @param {string} preview - Data URL
    //  */
    // updateLosaAligeradaImage(seccionIndex, imagenIndex, file, preview) {

    //   if (!Array.isArray(this.previews.losaImages)) {
    //     this.previews.losaImages = [];
    //   }

    //   if (!Array.isArray(this.previews.losaImages[seccionIndex])) {
    //     this.previews.losaImages[seccionIndex] = [null, null, null, null];
    //   }

    //   this.previews.losaImages[seccionIndex][imagenIndex] = preview;

    //   console.log(`✅ Imagen guardada en previews.losaImages[${seccionIndex}][${imagenIndex}]`, {
    //     tienePreview: !!preview,
    //     previewLength: preview?.length,
    //   });
    // },

    /**
     * Elimina una imagen específica
     * @param {number} seccionIndex - Índice de la sección
     * @param {number} imagenIndex - Índice de la imagen
     */
    removeLosaImage(seccionIndex, imagenIndex) {
      if (Array.isArray(this.images.losaImages[seccionIndex])) {
        this.images.losaImages[seccionIndex][imagenIndex] = null;
      }
      if (Array.isArray(this.previews.losaImages[seccionIndex])) {
        this.previews.losaImages[seccionIndex][imagenIndex] = null;
      }
    },

    /**
     * Método base para actualizar imágenes de cualquier tipo
     * @param {string} groupKey - Clave del grupo en previews
     * @param {number} seccionIndex - Índice de la sección
     * @param {number} imagenIndex - Índice de la imagen
     * @param {File} file - Archivo de imagen
     * @param {string} preview - Data URL
     */
    updateElementoImage(groupKey, seccionIndex, imagenIndex, file, preview) {
      // Asegurar que existe el array principal
      if (!Array.isArray(this.previews[groupKey])) {
        this.previews[groupKey] = [];
      }

      // Asegurar que existe el array para esta sección
      if (!Array.isArray(this.previews[groupKey][seccionIndex])) {
        this.previews[groupKey][seccionIndex] = [null, null, null, null];
      }

      // Guardar la imagen
      this.previews[groupKey][seccionIndex][imagenIndex] = preview;

      // También guardar en images si es necesario
      if (!Array.isArray(this.images[groupKey])) {
        this.images[groupKey] = [];
      }
      if (!Array.isArray(this.images[groupKey][seccionIndex])) {
        this.images[groupKey][seccionIndex] = [null, null, null, null];
      }
      this.images[groupKey][seccionIndex][imagenIndex] = file;

      console.log(`✅ Imagen guardada en ${groupKey}[${seccionIndex}][${imagenIndex}]`);
    },

    // Métodos específicos para cada tipo
    updateLosaAligeradaImage(seccionIndex, imagenIndex, file, preview) {
      this.updateElementoImage("losaImages", seccionIndex, imagenIndex, file, preview);
    },

    // ============================================
    // MÉTODOS - Gestión de Vigas
    // ============================================

    /**
     * Actualiza el número de losas/secciones
     * @param {number} count - Número de losas
     */
    updateVigas(count) {
      const vigaCount = parseInt(count) || 1;
      console.log(`🔄 Actualizando número de vigas a: ${vigaCount}`);

      // Actualizar el valor en sections
      if (!this.sections.disenoElementos) {
        this.sections.disenoElementos = {};
      }
      this.sections.disenoElementos.viga = vigaCount;

      // Asegurar que los arrays existen
      if (!Array.isArray(this.images.vigaImages)) {
        this.images.vigaImages = [];
      }
      if (!Array.isArray(this.previews.vigaImages)) {
        this.previews.vigaImages = [];
      }

      // Ajustar tamaño del array principal
      while (this.images.vigaImages.length < vigaCount) {
        // Cada vigas tiene un array de 4 imágenes
        this.images.vigaImages.push([null, null, null, null]);
        this.previews.vigaImages.push([null, null, null, null]);
      }

      if (this.images.vigaImages.length > vigaCount) {
        this.images.vigaImages = this.images.vigaImages.slice(0, vigaCount);
        this.previews.vigaImages = this.previews.vigaImages.slice(0, vigaCount);
      }

      console.log(`✅ Arrays de vigas ajustados: ${this.images.vigaImages.length} losas con 4 imágenes cada una`);
    },

    // Métodos específicos para cada tipo
    updateVigaImage(seccionIndex, imagenIndex, file, preview) {
      this.updateElementoImage("vigaImages", seccionIndex, imagenIndex, file, preview);
    },

    /**
     * Elimina una imagen específica
     * @param {number} seccionIndex - Índice de la sección
     * @param {number} imagenIndex - Índice de la imagen
     */
    removeVigaImage(seccionIndex, imagenIndex) {
      if (Array.isArray(this.images.vigaImages[seccionIndex])) {
        this.images.vigaImages[seccionIndex][imagenIndex] = null;
      }
      if (Array.isArray(this.previews.vigaImages[seccionIndex])) {
        this.previews.vigaImages[seccionIndex][imagenIndex] = null;
      }
    },

    // ============================================
    // MÉTODOS - Gestión de Columnas
    // ============================================

    /**
     * Actualiza el número de losas/secciones
     * @param {number} count - Número de losas
     */
    updateColumnas(count) {
      const columnaCount = parseInt(count) || 1;
      console.log(`🔄 Actualizando número de columnas a: ${columnaCount}`);

      // Actualizar el valor en sections
      if (!this.sections.disenoElementos) {
        this.sections.disenoElementos = {};
      }
      this.sections.disenoElementos.columna = columnaCount;

      // Asegurar que los arrays existen
      if (!Array.isArray(this.images.columnaImages)) {
        this.images.columnaImages = [];
      }
      if (!Array.isArray(this.previews.columnaImages)) {
        this.previews.columnaImages = [];
      }

      // Ajustar tamaño del array principal
      while (this.images.columnaImages.length < columnaCount) {
        // Cada vigas tiene un array de 4 imágenes
        this.images.columnaImages.push([null, null, null, null, null]);
        this.previews.columnaImages.push([null, null, null, null, null]);
      }

      if (this.images.columnaImages.length > columnaCount) {
        this.images.columnaImages = this.images.columnaImages.slice(0, columnaCount);
        this.previews.columnaImages = this.previews.columnaImages.slice(0, columnaCount);
      }

      console.log(`✅ Arrays de columnas ajustados: ${this.images.columnaImages.length} losas con 4 imágenes cada una`);
    },

    updateColumnaImage(seccionIndex, imagenIndex, file, preview) {
      this.updateElementoImage("columnaImages", seccionIndex, imagenIndex, file, preview);
    },

    /**
     * Elimina una imagen específica
     * @param {number} seccionIndex - Índice de la sección
     * @param {number} imagenIndex - Índice de la imagen
     */
    removeColumnaImage(seccionIndex, imagenIndex) {
      if (Array.isArray(this.images.columnaImages[seccionIndex])) {
        this.images.columnaImages[seccionIndex][imagenIndex] = null;
      }
      if (Array.isArray(this.previews.columnaImages[seccionIndex])) {
        this.previews.columnaImages[seccionIndex][imagenIndex] = null;
      }
    },

    // ============================================
    // MÉTODOS - Gestión de Placas
    // ============================================

    /**
     * Actualiza el número de losas/secciones
     * @param {number} count - Número de losas
     */
    updatePlacas(count) {
      const placaCount = parseInt(count) || 1;
      console.log(`🔄 Actualizando número de placas a: ${placaCount} desde el store`);

      // Actualizar el valor en sections
      if (!this.sections.disenoElementos) {
        this.sections.disenoElementos = {};
      }
      this.sections.disenoElementos.placa = placaCount;

      // Asegurar que los arrays existen
      if (!Array.isArray(this.images.placaImages)) {
        this.images.placaImages = [];
      }
      if (!Array.isArray(this.previews.placaImages)) {
        this.previews.placaImages = [];
      }

      // Ajustar tamaño del array principal
      while (this.images.placaImages.length < placaCount) {
        // Cada vigas tiene un array de 4 imágenes
        this.images.placaImages.push([null, null, null, null]);
        this.previews.placaImages.push([null, null, null, null]);
      }

      if (this.images.placaImages.length > placaCount) {
        this.images.placaImages = this.images.placaImages.slice(0, placaCount);
        this.previews.placaImages = this.previews.placaImages.slice(0, placaCount);
      }

      console.log(`✅ Arrays de Placas ajustados: ${this.images.placaImages.length} placas con 4 imágenes cada una`);
    },

    updatePlacaImage(seccionIndex, imagenIndex, file, preview) {
      this.updateElementoImage("placaImages", seccionIndex, imagenIndex, file, preview);
    },

    /**
     * Elimina una imagen específica
     * @param {number} seccionIndex - Índice de la sección
     * @param {number} imagenIndex - Índice de la imagen
     */
    removePlacaImage(seccionIndex, imagenIndex) {
      if (Array.isArray(this.images.placaImages[seccionIndex])) {
        this.images.placaImages[seccionIndex][imagenIndex] = null;
      }
      if (Array.isArray(this.previews.placaImages[seccionIndex])) {
        this.previews.placaImages[seccionIndex][imagenIndex] = null;
      }
    },

    // ============================================
    // MÉTODOS - Gestión de Cimentaciones
    // ============================================

    /**
     * Actualiza el número de losas/secciones
     * @param {number} count - Número de losas
     */
    updateCimentaciones(count) {
      const cimentacionCount = parseInt(count) || 1;
      console.log(`🔄 Actualizando número de cimentaciones a: ${cimentacionCount}`);

      // Actualizar el valor en sections
      if (!this.sections.disenoElementos) {
        this.sections.disenoElementos = {};
      }
      this.sections.disenoElementos.cimentacion = cimentacionCount;

      // Asegurar que los arrays existen
      if (!Array.isArray(this.images.cimentacionImages)) {
        this.images.cimentacionImages = [];
      }
      if (!Array.isArray(this.previews.cimentacionImages)) {
        this.previews.cimentacionImages = [];
      }

      // Ajustar tamaño del array principal
      while (this.images.cimentacionImages.length < cimentacionCount) {
        // Cada vigas tiene un array de 4 imágenes
        this.images.cimentacionImages.push([null, null, null, null, null, null, null, null]);
        this.previews.cimentacionImages.push([null, null, null, null, null, null, null, null]);
        this.images.cimentacionImages.push([null, null, null, null]);
        this.previews.cimentacionImages.push([null, null, null, null]);
      }

      if (this.images.cimentacionImages.length > cimentacionCount) {
        this.images.cimentacionImages = this.images.cimentacionImages.slice(0, cimentacionCount);
        this.previews.cimentacionImages = this.previews.cimentacionImages.slice(0, cimentacionCount);
      }

      console.log(
        `✅ Arrays de Cimentaciones ajustados: ${this.images.cimentacionImages.length} cimentacion con 4 imágenes cada una`,
      );
    },

    updateCimentacionImage(seccionIndex, imagenIndex, file, preview) {
      this.updateElementoImage("cimentacionImages", seccionIndex, imagenIndex, file, preview);
    },
    /**
     * Elimina una imagen específica
     * @param {number} seccionIndex - Índice de la sección
     * @param {number} imagenIndex - Índice de la imagen
     */
    removeCimentacionImage(seccionIndex, imagenIndex) {
      if (Array.isArray(this.images.cimentacionImages[seccionIndex])) {
        this.images.cimentacionImages[seccionIndex][imagenIndex] = null;
      }
      if (Array.isArray(this.previews.cimentacionImages[seccionIndex])) {
        this.previews.cimentacionImages[seccionIndex][imagenIndex] = null;
      }
    },

    // ============================================
    // MÉTODOS - Gestión de Predim
    // ============================================

    updatePredim(count) {
      const predimCount = parseInt(count) || 1;
      console.log(`🔄 Actualizando número de predim a: ${predimCount}`);
      // Actualizar el valor en sections
      if (!this.sections.disenoElementos) {
        this.sections.disenoElementos = {};
      }
      this.sections.disenoElementos.predim = predimCount;

      // Asegurar que los arrays existen
      if (!Array.isArray(this.images.predimImages)) {
        this.images.predimImages = [];
      }
      if (!Array.isArray(this.previews.predimImages)) {
        this.previews.predimImages = [];
      }

      // Ajustar tamaño del array principal
      while (this.images.predimImages.length < predimCount) {
        // Cada vigas tiene un array de 4 imágenes
        this.images.predimImages.push([null]);
        this.previews.predimImages.push([null]);
      }

      if (this.images.predimImages.length > predimCount) {
        this.images.predimImages = this.images.predimImages.slice(0, predimCount);
        this.previews.predimImages = this.previews.predimImages.slice(0, predimCount);
      }

      console.log(
        `✅ Arrays de Cimentaciones ajustados: ${this.images.predimImages.length} cimentacion con 4 imágenes cada una`,
      );
    },
    updatePredimImage(seccionIndex, imagenIndex, file, preview) {
      this.updateElementoImage("predimImages", seccionIndex, imagenIndex, file, preview);
    },
    /**
     * Elimina una imagen específica
     * @param {number} seccionIndex - Índice de la sección
     * @param {number} imagenIndex - Índice de la imagen
     */
    removePredimImage(seccionIndex, imagenIndex) {
      if (Array.isArray(this.images.predimImages[seccionIndex])) {
        this.images.predimImages[seccionIndex][imagenIndex] = null;
      }
      if (Array.isArray(this.previews.predimImages[seccionIndex])) {
        this.previews.predimImages[seccionIndex][imagenIndex] = null;
      }
    },
    addMoreImagesToSection(groupKey, seccionIndex) {
      if (!Array.isArray(this.images[groupKey])) {
        this.images[groupKey] = [];
      }
      if (!Array.isArray(this.previews[groupKey])) {
        this.previews[groupKey] = [];
      }

      // Asegurar que la sección existe
      if (!Array.isArray(this.images[groupKey][seccionIndex])) {
        this.images[groupKey][seccionIndex] = [];
        this.previews[groupKey][seccionIndex] = [];
      }

      // Agregar nuevos slots vacíos
      this.images[groupKey][seccionIndex].push(null);
      this.previews[groupKey][seccionIndex].push(null);

      console.log(
        `✅ Agregada 1 imagen a ${groupKey}[${seccionIndex}], total: ${this.images[groupKey][seccionIndex].length}`,
      );

      return this.images[groupKey][seccionIndex].length - 1;
    },

    // Método para eliminar la ÚLTIMA imagen (similar al de agregar)
    removeImagesToSection(groupKey, seccionIndex) {
      console.log(`➖ Eliminando última imagen de ${groupKey}, sección ${seccionIndex}`);

      // Validar que los arrays existen
      if (!Array.isArray(this.images[groupKey])) {
        console.warn(`No existe el array ${groupKey}`);
        return false;
      }

      if (!Array.isArray(this.images[groupKey][seccionIndex])) {
        console.warn(`No existe la sección ${seccionIndex} en ${groupKey}`);
        return false;
      }

      const currentLength = this.images[groupKey][seccionIndex].length;

      // No permitir eliminar por debajo de 1 slot (mantener al menos 1)
      if (currentLength <= 1) {
        console.warn(`No se puede eliminar el último slot. Debe haber al menos 1 slot por sección.`);
        return false;
      }

      // Eliminar el último slot
      this.images[groupKey][seccionIndex].pop();
      this.previews[groupKey][seccionIndex].pop();

      console.log(
        `✅ Última imagen eliminada de ${groupKey}[${seccionIndex}], total restante: ${this.images[groupKey][seccionIndex].length}`,
      );

      return true;
    },

    // ============================================
    // MÉTODOS - Gestión de Errores
    // ============================================

    /**
     * Agrega un error
     * @param {string} category - Categoría del error
     * @param {string} message - Mensaje de error
     */
    addError(category, message) {
      this.ui.errors.push({ category, message, timestamp: Date.now() });
    },

    /**
     * Limpia todos los errores
     */
    clearErrors() {
      this.ui.errors = [];
    },

    /**
     * Limpia errores de una categoría específica
     * @param {string} category - Categoría
     */
    clearErrorsByCategory(category) {
      this.ui.errors = this.ui.errors.filter((e) => e.category !== category);
    },

    // ============================================
    // MÉTODOS - Exportación
    // ============================================

    /**
     * Obtiene todos los datos para exportación
     * @returns {object} Objeto con todos los datos
     */
    getExportData() {
      return {
        cover: this.cover,
        sections: this.sections,
        images: this.images,
        previews: this.previews,
      };
    },

    /**
     * Marca el inicio de la exportación
     */
    startExport() {
      this.ui.isExporting = true;
      this.clearErrors();
    },

    /**
     * Marca el fin de la exportación
     */
    endExport() {
      this.ui.isExporting = false;
    },
  };
}
