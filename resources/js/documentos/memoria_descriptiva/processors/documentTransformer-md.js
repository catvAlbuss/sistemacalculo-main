// processors/documentTransformer-md.js - Transformaciones dinámicas para Memoria Descriptiva

export class DocumentTransformerMD {
  constructor(exportData, ubigeoData) {
    this.exportData = exportData;
    this.ubigeoData = ubigeoData;
    this.cover = exportData.cover;
    this.sections = exportData.sections;
    this.previews = exportData.previews;
  }

  /**
   * Aplica todas las transformaciones a la estructura
   */
  applyAll(structure) {
    this.transformUbicacion(structure);
    this.transformDocumentosPlanos(structure);
    this.transformDescripcionModulos(structure);
    this.transformMarcoTeorico(structure);
    this.transformPredimensionamiento(structure);
    this.transformDemolicion(structure);
  }

  /**
   * Encuentra el índice del siguiente heading después de startIdx
   */
  findNextHeadingIndex(content, startIdx) {
    const nextIdx = content.findIndex((item, i) => i > startIdx && item.type === "heading");
    return nextIdx === -1 ? content.length : nextIdx;
  }

  /**
   * Normaliza texto para comparaciones
   */
  normalizeText(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[-]/g, " ")
      .replace(/\s+/g, " ");
  }

  findDepartment(departmentName) {
    const deptNorm = this.normalizeText(departmentName);
    return (this.ubigeoData || []).find((d) => this.normalizeText(d.name) === deptNorm);
  }

  findProvince(departmentName, provinceName) {
    const dept = this.findDepartment(departmentName);
    if (!dept) return null;
    const provNorm = this.normalizeText(provinceName);
    return (dept.provinces || []).find((p) => this.normalizeText(p.name) === provNorm);
  }

  findDistrictData(departmentName, provinceName, districtName) {
    const province = this.findProvince(departmentName, provinceName);
    if (!province) return null;
    const distNorm = this.normalizeText(districtName);
    return (province.districts || []).find((d) => {
      if (typeof d === "string") return this.normalizeText(d) === distNorm;
      return this.normalizeText(d.name) === distNorm;
    });
  }

  getSeismicData(departmentName, provinceName, districtName) {
    const zoneFactorMap = { 1: "0.10", 2: "0.25", 3: "0.35", 4: "0.45" };
    const districtData = this.findDistrictData(departmentName, provinceName, districtName);
    if (districtData && typeof districtData === "object") {
      return {
        zone: String(districtData.zone || "2"),
        zFactor: String(districtData.zFactor || zoneFactorMap[districtData.zone] || "0.25"),
        ambito: String(districtData.ambito || "TODOS LOS DISTRITOS"),
      };
    }
    return { zone: "2", zFactor: "0.25", ambito: "TODOS LOS DISTRITOS" };
  }

  /**
   * Transformación: Ubicación con tabla de distritos (Sección 1.2)
   */
  transformUbicacion(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const idx12 = generalidades.content.findIndex(
      (item) => item.type === "heading" && String(item.text || "").startsWith("1.2.")
    );
    if (idx12 === -1) return;

    const imgIdx = generalidades.content.findIndex((item, i) => i > idx12 && item.type === "image");
    if (imgIdx === -1) return;

    const deptName = this.cover.ubigeo?.department || "HUANUCO";
    const provName = this.cover.ubigeo?.province || "HUANUCO";
    const distSelected = this.cover.ubigeo?.district || "";

    const provData = this.findProvince(deptName, provName);
    const districtsList = provData && Array.isArray(provData.districts) && provData.districts.length > 0
      ? provData.districts.map(d => typeof d === "string" ? d : d.name)
      : [distSelected || "NO DEFINIDO"];

    const seismicData = this.getSeismicData(deptName, provName, distSelected);
    const zonaSeleccionada = seismicData.zone || "2";
    const ambitoSeleccionado = seismicData.ambito || "TODOS LOS DISTRITOS";

    const tableRows = [];
    districtsList.forEach((district, index) => {
      const row = [];
      const isSelected = this.normalizeText(district) === this.normalizeText(distSelected);

      if (index === 0) {
        row.push({ text: deptName, rowSpan: districtsList.length, bold: true, alignment: "CENTER", verticalAlign: "CENTER" });
      } else {
        row.push({ text: "" });
      }

      if (index === 0) {
        row.push({ text: provName, rowSpan: districtsList.length, bold: true, alignment: "CENTER", verticalAlign: "CENTER" });
      } else {
        row.push({ text: "" });
      }

      row.push({ text: district, color: isSelected ? "FF0000" : "000000", bold: isSelected, alignment: "LEFT", verticalAlign: "CENTER" });

      if (index === 0) {
        row.push({ text: zonaSeleccionada, rowSpan: districtsList.length, bold: true, size: 24, alignment: "CENTER", verticalAlign: "CENTER" });
      } else {
        row.push({ text: "" });
      }

      if (index === 0) {
        row.push({ text: ambitoSeleccionado, rowSpan: districtsList.length, size: 16, alignment: "CENTER", verticalAlign: "CENTER" });
      } else {
        row.push({ text: "" });
      }

      tableRows.push(row);
    });

    generalidades.content.splice(imgIdx, 1, {
      type: "table",
      widthPercent: 95,
      indentSize: 500,
      columns: [
        { header: "REGIÓN\n(DPTO.)", width: 20 },
        { header: "PROVINCIA", width: 25 },
        { header: "DISTRITO", width: 25 },
        { header: "ZONA\nSÍSMICA", width: 10 },
        { header: "ÁMBITO", width: 20 },
      ],
      rows: tableRows,
    });
  }

  /**
   * Transformación: Relación de Documentos y Planos (Sección 1.3)
   */
  transformDocumentosPlanos(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const idx13 = generalidades.content.findIndex(
      (item) => item.type === "heading" && String(item.text || "").startsWith("1.3.")
    );
    if (idx13 === -1) return;

    const documentos = this.sections.documentosPlanos?.documentos || [];
    const planos = this.sections.documentosPlanos?.planos || [];

    if (documentos.length > 0) {
      generalidades.content.splice(idx13 + 2, 0, {
        type: "list",
        listType: "bullet",
        items: documentos,
      });
    }

    if (planos.length > 0) {
      const planosTable = {
        type: "table",
        title: "RELACIÓN DE PLANOS DEL PROYECTO",
        widthPercent: 95,
        columns: [
          { header: "N°", width: 10 },
          { header: "DESCRIPCIÓN", width: 70 },
          { header: "LÁMINA", width: 20 },
        ],
        rows: planos.map((p, idx) => [String(idx + 1), p.descripcion || p, p.lamina || "E-" + String(idx + 1).padStart(2, '0')]),
      };
      generalidades.content.splice(idx13 + 3 + (documentos.length > 0 ? 1 : 0), 0, planosTable);
    }
  }

  /**
   * Transformación: Descripción de Módulos (Sección 2)
   */
  transformDescripcionModulos(structure) {
    const descripcionModulos = structure.document.sections.find((s) => s.id === "descripcion_bloques");
    if (!descripcionModulos) return;

    const modulos = this.sections.descripcionModulos?.modulos || [];
    const moduloImages = this.previews.moduloImages || [];

    if (modulos.length === 0) {
      descripcionModulos.content.push({
        type: "paragraph",
        text: "No se han definido módulos. Por favor, agregue los módulos en el formulario.",
        alignment: "CENTER",
      });
      return;
    }

    const content = [];

    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];
      const imagenes = moduloImages[i] || [];

      content.push({ type: "heading", level: 2, text: `MÓDULO ${String(i + 1).padStart(2, '0')}` });

      // Tabla de características del módulo
      content.push({
        type: "table",
        widthPercent: 90,
        columns: [
          { header: "PARÁMETRO", width: 30 },
          { header: "DESCRIPCIÓN", width: 70 },
        ],
        rows: [
          ["USO", modulo.uso || "No especificado"],
          ["#pisos", `${modulo.pisos || 1} piso${modulo.pisos !== 1 ? 's' : ''}`],
          ["Sistema estructural en X", modulo.sistemaX || "No especificado"],
          ["Sistema estructural en Y", modulo.sistemaY || "No especificado"],
          ["Elementos verticales", modulo.elementosVerticales || "No especificado"],
          ["Elementos horizontales", modulo.elementosHorizontales || "No especificado"],
          ["Techo", modulo.techo || "No especificado"],
        ],
      });

      // Imágenes del módulo (hasta 2)
      for (let imgIdx = 0; imgIdx < Math.min(imagenes.length, 2); imgIdx++) {
        if (imagenes[imgIdx]) {
          content.push({
            type: "image",
            src: imagenes[imgIdx],
            alignment: "CENTER",
            width: 500,
            height: 380,
            caption: `Figura ${i + 1}.${imgIdx + 1} - Distribución Arquitectónica del Módulo ${String(i + 1).padStart(2, '0')}`,
            pageBreakBefore: imgIdx === 0 && i > 0,
          });
        }
      }

      if (i < modulos.length - 1) {
        content.push({ type: "paragraph", text: "" });
      }
    }

    // Obras exteriores adicionales
    content.push({ type: "heading", level: 2, text: "OBRAS EXTERIORES" });

    const obrasExteriores = [
      { nombre: "OBRAS EXTERIORES I - CERCO PERIMETRICO", uso: "Cerco Perimetral", descripcion: "Conformado por muros de contención, columnas, vigas y ladrillo." },
      { nombre: "OBRAS EXTERIORES II - PORTADA PRIMARIA", uso: "Portada principal primaria", descripcion: "Conformación por muros y columnas" },
      { nombre: "OBRAS EXTERIORES III - PORTADA INICIAL", uso: "Portada principal inicial", descripcion: "Conformación por muros y columnas" },
      { nombre: "OBRAS EXTERIORES IV - DETALLE DE SARDINEL", uso: "Sardinel: Soportes o cerco de jardinería", descripcion: "" },
      { nombre: "OBRAS EXTERIORES V - DETALLE DE RAMPA EL SUELO", uso: "Ingreso, paso peatonal (rampas)", descripcion: "Apoyado sobre el suelo" },
    ];

    for (const obra of obrasExteriores) {
      content.push({ type: "heading", level: 3, text: obra.nombre });
      content.push({
        type: "table",
        widthPercent: 90,
        columns: [
          { header: "USO", width: 30 },
          { header: "DESCRIPCIÓN", width: 70 },
        ],
        rows: [[obra.uso, obra.descripcion]],
      });
    }

    descripcionModulos.content = content;
  }

  /**
   * Transformación: Marco Teórico (Sección 3)
   */
  transformMarcoTeorico(structure) {
    const marcoTeorico = structure.document.sections.find((s) => s.id === "marco_teorico");
    if (!marcoTeorico) return;

    const mt = this.sections.marcoTeorico;
    if (!mt) return;

    // 3.2 CRITERIOS ESTRUCTURALES
    const idx32 = marcoTeorico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.2. CRITERIOS ESTRUCTURALES"
    );
    if (idx32 !== -1 && mt.criteriosEstructurales?.length > 0) {
      const criteriosItems = mt.criteriosEstructurales.map(c => 
        typeof c === "string" ? c : `${c.nombre || ""}: ${c.descripcion || ""}`
      );
      marcoTeorico.content.splice(idx32 + 1, 0, {
        type: "list",
        listType: "bullet",
        items: criteriosItems,
      });
    }

    // 3.4 ELEMENTOS ESTRUCTURALES
    const idx34 = marcoTeorico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.4. ELEMENTOS ESTRUCTURALES"
    );
    if (idx34 !== -1 && mt.elementosEstructurales?.length > 0) {
      marcoTeorico.content.splice(idx34 + 1, 0, {
        type: "list",
        listType: "bullet",
        items: mt.elementosEstructurales,
      });
    }

    // 3.5 MATERIALES DE LOS ELEMENTOS ESTRUCTURALES
    const idx35 = marcoTeorico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.5. MATERIALES DE LOS ELEMENTOS ESTRUCTURALES"
    );
    if (idx35 !== -1 && mt.materiales) {
      const concreto = mt.materiales.concreto || {};
      const acero = mt.materiales.acero || {};
      const albanileria = mt.materiales.albanileria || {};

      const materialesContent = [
        {
          type: "paragraph",
          text: "Concreto estructural",
          alignment: "JUSTIFIED",
          bold: true,
        },
        {
          type: "list",
          listType: "bullet",
          items: [
            `Resistencia a la compresión (f'c): ${concreto.fc || "210"} kg/cm²`,
            `Módulo de elasticidad (Ec): ${concreto.ec || "217,370.65"} kg/cm²`,
            `Peso específico (γc): ${concreto.peso || "2.4"} ton/m³`,
            `Coeficiente de Poisson (μ): ${concreto.poisson || "0.20"}`,
          ],
        },
        {
          type: "paragraph",
          text: "Acero de refuerzo",
          alignment: "JUSTIFIED",
          bold: true,
        },
        {
          type: "list",
          listType: "bullet",
          items: [
            `Esfuerzo de fluencia (fy): ${acero.fy || "4,200"} kg/cm²`,
            `Módulo de elasticidad (Es): ${acero.es || "2,000,000"} kg/cm²`,
            `Peso específico (γ): ${acero.peso || "7.85"} ton/m³`,
          ],
        },
      ];

      if (albanileria.fm) {
        materialesContent.push(
          { type: "paragraph", text: "Albañilería", alignment: "JUSTIFIED", bold: true },
          {
            type: "list",
            listType: "bullet",
            items: [
              `Resistencia de pilas (f'm): ${albanileria.fm} kg/cm²`,
              `Resistencia de muretes (v'm): ${albanileria.vm || "9.2"} kg/cm²`,
              `Módulo de elasticidad (Ealb): ${albanileria.em || "500(f'm)"} kg/cm²`,
            ],
          }
        );
      }

      marcoTeorico.content.splice(idx35 + 1, 0, ...materialesContent);
    }

    // 3.10 PARÁMETROS SÍSMICOS
    const idx310 = marcoTeorico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.10. PARÁMETROS SÍSMICOS"
    );
    if (idx310 !== -1 && mt.parametrosSismicos) {
      const ps = mt.parametrosSismicos;
      const paramsContent = [
        {
          type: "paragraph",
          text: `Factor zona (Z): ${ps.factorZ || "0.25"} (Zona ${ps.zona || "2"})`,
          alignment: "JUSTIFIED",
        },
        {
          type: "paragraph",
          text: `Condiciones geotécnicas: Perfil de suelo "${ps.perfilSuelo || "S3"}", factor S = ${ps.factorS || "1.40"}, Tp = ${ps.tp || "1.00"} s, Tl = ${ps.tl || "1.60"} s`,
          alignment: "JUSTIFIED",
        },
        {
          type: "paragraph",
          text: `Categoría de la edificación: ${ps.categoria || "A"} (Edificaciones Esenciales), factor de uso U = ${ps.factorU || "1.50"}`,
          alignment: "JUSTIFIED",
        },
      ];

      if (ps.irregularidades) {
        paramsContent.push({
          type: "paragraph",
          text: `Irregularidades: ${ps.irregularidades.altura || "Regular"} en altura, ${ps.irregularidades.planta || "Regular"} en planta.`,
          alignment: "JUSTIFIED",
        });
      }

      marcoTeorico.content.splice(idx310 + 1, 0, ...paramsContent);
    }
  }

  /**
   * Transformación: Predimensionamiento (Sección 4)
   */
  transformPredimensionamiento(structure) {
    const predimensionamiento = structure.document.sections.find((s) => s.id === "predimensionamiento");
    if (!predimensionamiento) return;

    const modulosPredim = this.sections.predimensionamiento?.modulos || [];

    if (modulosPredim.length === 0) {
      predimensionamiento.content.push({
        type: "paragraph",
        text: "No se han definido datos de predimensionamiento.",
        alignment: "CENTER",
      });
      return;
    }

    const content = [
      {
        type: "paragraph",
        text: "Se definirá las dimensiones de los elementos estructurales en base a ciertos criterios establecidos y/o recomendados. Luego se verificarán durante el análisis y diseño.",
        alignment: "JUSTIFIED",
      },
      {
        type: "list",
        listType: "bullet",
        items: [
          "Pre dimensionamiento de losa aligerada: El espesor de losa aligerada no debe permitir deflexiones fuera de los límites establecidos.",
          "Pre dimensionamiento de vigas peraltadas: Para su predimensionamiento se considera la luz libre entre valores recomendados (L/10, L/11 o L/12).",
        ],
      },
    ];

    for (const modulo of modulosPredim) {
      content.push({ type: "heading", level: 2, text: modulo.nombre || "Módulo" });

      if (modulo.losas) {
        content.push({ type: "heading", level: 3, text: "Pre dimensionamiento de los techos" });
        if (modulo.losas.imagen) {
          content.push({
            type: "image",
            src: modulo.losas.imagen,
            alignment: "CENTER",
            width: 500,
            height: 300,
            caption: `Pre-dimensionamiento losa aligerado ${modulo.nombre}`,
          });
        }
        if (modulo.losas.descripcion) {
          content.push({
            type: "paragraph",
            text: modulo.losas.descripcion,
            alignment: "JUSTIFIED",
          });
        }
      }

      if (modulo.vigas) {
        content.push({ type: "heading", level: 3, text: "Pre dimensionamiento de una viga" });
        if (modulo.vigas.imagen) {
          content.push({
            type: "image",
            src: modulo.vigas.imagen,
            alignment: "CENTER",
            width: 500,
            height: 300,
            caption: `Pre-dimensionamiento viga ${modulo.nombre}`,
          });
        }
        if (modulo.vigas.descripcion) {
          content.push({
            type: "paragraph",
            text: modulo.vigas.descripcion,
            alignment: "JUSTIFIED",
          });
        }
      }
    }

    content.push({
      type: "paragraph",
      text: "Nota: Las dimensiones finales de todos los elementos estructurales serán verificadas mediante el análisis estructural detallado.",
      alignment: "JUSTIFIED",
      italic: true,
    });

    predimensionamiento.content = content;
  }

  /**
   * Transformación: Demolición (Sección 5)
   */
  transformDemolicion(structure) {
    const demolicion = structure.document.sections.find((s) => s.id === "demolicion");
    if (!demolicion) return;

    const demo = this.sections.demolicion;
    if (!demo) return;

    const content = [];

    if (demo.alcance) {
      content.push({
        type: "paragraph",
        text: demo.alcance,
        alignment: "JUSTIFIED",
      });
    }

    if (demo.modulosADemoler && demo.modulosADemoler.length > 0) {
      content.push({
        type: "heading",
        level: 2,
        text: "Módulos a Demoler",
      });
      content.push({
        type: "list",
        listType: "numbered",
        items: demo.modulosADemoler,
      });
    }

    if (demo.obrasExterioresADemoler && demo.obrasExterioresADemoler.length > 0) {
      content.push({
        type: "heading",
        level: 2,
        text: "Obras Exteriores a Demoler",
      });
      content.push({
        type: "list",
        listType: "numbered",
        items: demo.obrasExterioresADemoler,
      });
    }

    const demolicionImages = this.previews.demolicionImages || [];
    for (let i = 0; i < demolicionImages.length; i++) {
      if (demolicionImages[i]) {
        content.push({
          type: "image",
          src: demolicionImages[i],
          alignment: "CENTER",
          width: 500,
          height: 380,
          caption: `Evidencia de demolición ${i + 1}`,
          pageBreakBefore: i > 0 && i % 2 === 0,
        });
      }
    }

    if (content.length > 0) {
      demolicion.content = content;
    } else {
      demolicion.content = [{
        type: "paragraph",
        text: "No se han definido elementos para demolición.",
        alignment: "CENTER",
      }];
    }
  }
}