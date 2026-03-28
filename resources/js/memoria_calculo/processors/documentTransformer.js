// processors/documentTransformer.js - Transformaciones dinámicas para exportación Word

import { forEach, i } from "mathjs";

/**
 * Clase para aplicar transformaciones dinámicas a la estructura del documento
 * antes de procesarlo para exportación Word
 */
export class DocumentTransformer {
  constructor(exportData, ubigeoData) {
    this.exportData = exportData;
    this.ubigeoData = ubigeoData;
    this.cover = exportData.cover;
    this.sections = exportData.sections;
    this.previews = exportData.previews;
  }

  /**
   * Aplica todas las transformaciones a la estructura
   * @param {object} structure - Estructura del documento
   */
  applyAll(structure) {
    this.transformUbicacion(structure);
    this.transformImagenesPiso(structure);
    this.transformZonificacion(structure);
    this.transformParametrosSuelo(structure);
    this.transformCategorias(structure);
    this.transformSistemasEstructurales(structure);
    this.transformMaterialDiseno(structure);
    this.transformAnalisisCargas(structure);
    this.transformAnalisisSismico(structure);
    this.transformDisenoElementosEstructurales(structure);
    this.transformEstructural(structure);
    this.transformConclusiones(structure);
    this.transformRecomendaciones(structure);
    this.renumerarSeccionesFinales(structure);
  }

  /**
   * Encuentra el índice del siguiente heading después de startIdx
   */
  findNextHeadingIndex(content, startIdx) {
    const nextIdx = content.findIndex((item, i) => i > startIdx && item.type === "heading");
    return nextIdx === -1 ? content.length : nextIdx;
  }

  // ============================================
  // 1. UBICACIÓN DINÁMICA (Sección 1.2)
  // ============================================
  transformUbicacion(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const idx12 = generalidades.content.findIndex(
      (item) => item.type === "heading" && String(item.text || "").startsWith("1.2."),
    );

    if (idx12 === -1) return;

    const imgIdx = generalidades.content.findIndex((item, i) => i > idx12 && item.type === "image");
    if (imgIdx === -1) return;

    // Obtener datos de ubicación
    const deptName = this.cover.ubigeo.department || "HUANUCO";
    const provName = this.cover.ubigeo.province || "HUANUCO";
    const distSelected = this.cover.ubigeo.district || "";

    // Obtener distritos de la provincia
    const deptData = this.ubigeoData.find((d) => d.name === deptName);
    const provData = deptData?.provinces.find((p) => p.name === provName);
    const districtsList =
      provData && Array.isArray(provData.districts) && provData.districts.length > 0
        ? provData.districts
        : [distSelected || "NO DEFINIDO"];

    // Generar filas de tabla
    const tableRows = [];
    districtsList.forEach((district, index) => {
      const row = [];

      // Región (Merged)
      if (index === 0) {
        row.push({ text: deptName, rowSpan: districtsList.length, bold: true });
      } else {
        row.push({ text: "" });
      }

      // Provincia (Merged)
      if (index === 0) {
        row.push({ text: provName, rowSpan: districtsList.length, bold: true });
      } else {
        row.push({ text: "" });
      }

      // Distrito (Coloreado)
      row.push({
        text: district,
        color: district === distSelected ? "FF0000" : "000000",
        bold: district === distSelected,
        alignment: "LEFT",
      });

      // Zona Sísmica (Merged)
      if (index === 0) {
        const deptData = this.ubigeoData.find((d) => d.name.toUpperCase() === deptName.toUpperCase());

        const zona = deptData?.seismicZone || "2";

        row.push({
          text: zona,
          rowSpan: districtsList.length,
          bold: true,
          size: 24,
        });
      } else {
        row.push({ text: "" });
      }

      // Ámbito (Merged)
      if (index === 0) {
        row.push({ text: "TODOS LOS DISTRITOS", rowSpan: districtsList.length, size: 16 });
      } else {
        row.push({ text: "" });
      }

      tableRows.push(row);
    });

    // Reemplazar imagen por tabla
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

  // ============================================
  // 2. IMÁGENES POR PISO (Sección 1.4)
  // ============================================
  transformImagenesPiso(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const idx14 = generalidades.content.findIndex(
      (item) => item.type === "heading" && String(item.text || "").startsWith("1.4."),
    );

    if (idx14 === -1) return;

    const insertPos = idx14 + 2;
    let currentInsertPos = insertPos;

    // Agregar tabla resumen estructural
    const structuralDetails = this.sections.generalidades.structuralDetails;
    const floors = this.sections.generalidades.floors;

    const tableRows = [
      ["USO", structuralDetails.usage || "Residencial"],
      ["#pisos", `${floors} pisos`],
      ["Sistema estructural en X", structuralDetails.structuralSystemX],
      ["Sistema estructural en Y", structuralDetails.structuralSystemY],
      ["Elementos verticales", structuralDetails.verticalElements],
      ["Elementos horizontales", structuralDetails.horizontalElements],
      ["Techo", structuralDetails.roof],
    ];

    generalidades.content.splice(currentInsertPos, 0, {
      type: "table",
      title: "RESUMEN ESTRUCTURAL",
      columns: [
        { header: "PARÁMETRO", width: 20 },
        { header: "DESCRIPCIÓN", width: 80 },
      ],
      rows: tableRows,
    });

    currentInsertPos++;

    // Insertar imágenes de pisos (2 por página si es posible)
    this.previews.floorImages.forEach((imgData, i) => {
      if (imgData) {
        generalidades.content.splice(currentInsertPos++, 0, {
          type: "image",
          src: imgData,
          alignment: "CENTER",
          width: 500,
          height: 380, // Reducido un poco para que quepan 2 por página (A4 ~842pt)
          caption: `Esquema general en planta ${i + 1}°nivel`,
          pageBreakBefore: i % 2 === 0, // Salto de página cada 2 imágenes
        });
      }
    });
  }

  // ============================================
  // 3. ZONIFICACIÓN SÍSMICA (Sección 1.3.1)
  // ============================================
  transformZonificacion(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const idx131 = generalidades.content.findIndex(
      (item) => item.type === "heading" && String(item.text || "").startsWith("1.3.1."),
    );

    if (idx131 === -1) return;

    const zoneFactorMap = {
      1: "0.10",
      2: "0.25",
      3: "0.35",
      4: "0.45",
    };

    const deptName = this.cover.ubigeo?.department || "HUANUCO";

    // Si en tu ubigeo.json ya agregaste seismicZone y zFactor por departamento
    const deptData = (this.ubigeoData || []).find(
      (d) =>
        String(d.name || "")
          .trim()
          .toUpperCase() === String(deptName).trim().toUpperCase(),
    );

    const projectZone = deptData?.seismicZone || String(this.cover.seismicZone || "2");
    const projectZFactor = deptData?.zFactor || zoneFactorMap[projectZone] || "0.25";

    // Actualizar cover
    this.cover.seismicZone = projectZone;
    this.cover.seismicZoneFactor = projectZFactor;

    // Tabla de factores Z
    const zFactors = [
      { zone: "4", z: zoneFactorMap["4"] },
      { zone: "3", z: zoneFactorMap["3"] },
      { zone: "2", z: zoneFactorMap["2"] },
      { zone: "1", z: zoneFactorMap["1"] },
    ];

    const zTableRows = zFactors.map((f) => [
      {
        text: f.zone,
        alignment: "CENTER",
        fill: f.zone === projectZone ? "00B0F0" : null,
        color: f.zone === projectZone ? "FFFFFF" : "000000",
        bold: f.zone === projectZone,
      },
      {
        text: f.z,
        alignment: "CENTER",
        fill: f.zone === projectZone ? "00B0F0" : null,
        color: f.zone === projectZone ? "FFFFFF" : "000000",
        bold: f.zone === projectZone,
      },
    ]);

    // Layout según la imagen: mapa a la izquierda y tabla a la derecha
    const layoutTable = {
      type: "table",
      widthPercent: 100,
      indentSize: 0,
      noBorders: true,
      columns: [{ width: 58 }, { width: 42 }],
      rows: [
        [
          {
            stack: [
              {
                type: "image",
                src: "/assets/img/memoriacalculos/mapazonificacion.png",
                width: 340,
                height: 420,
                alignment: "CENTER",
              },
              {
                type: "paragraph",
                text: "Mapa de Zonificación Sísmica.E-030",
                alignment: "CENTER",
                italic: true,
                size: 12,
                spacing: { before: 120 },
              },
            ],
          },
          {
            type: "table",
            title: "Tabla N°6\nFACTORES DE ZONA 'Z'",
            widthPercent: 95,
            columns: [{ width: 50 }, { width: 50 }],
            rows: [
              // [
              //   {
              //     text: "Tabla N°6 FACTORES DE\nZONA 'Z'",
              //     colSpan: 2,
              //     alignment: "CENTER",
              //     bold: true,
              //     fill: "EFBF72",
              //     size: 16,
              //   },
              // ],
              [
                {
                  text: "ZONA",
                  alignment: "CENTER",
                  bold: true,
                  fill: "F6E1B7",
                },
                {
                  text: "Z",
                  alignment: "CENTER",
                  bold: true,
                  fill: "F6E1B7",
                },
              ],
              ...zTableRows,
            ],
          },
        ],
      ],
    };

    // Actualizar párrafo descriptivo
    const idx131Paragraph = generalidades.content.findIndex((item, i) => i > idx131 && item.type === "paragraph");

    if (idx131Paragraph !== -1) {
      generalidades.content[idx131Paragraph] = {
        type: "paragraph",
        text: `De acuerdo con el mapa del Reglamento Nacional de Edificaciones, el proyecto se ubica en la zona sísmica ${projectZone}, correspondiéndole un factor de Z=${projectZFactor}.`,
        alignment: "JUSTIFIED",
      };
    }

    // Reemplazar imagen original por el nuevo layout
    const mapImgIdx = generalidades.content.findIndex((item, i) => i > idx131 && item.type === "image");

    if (mapImgIdx !== -1) {
      generalidades.content.splice(mapImgIdx, 1, layoutTable);
    } else {
      generalidades.content.splice(idx131 + 2, 0, layoutTable);
    }
  }

  // ============================================
  // 4. PARÁMETROS DE SUELO (Sección 1.3.2)
  // ============================================
  transformParametrosSuelo(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const idx132 = generalidades.content.findIndex(
      (item) => item.type === "heading" && String(item.text || "").startsWith("1.3.2."),
    );

    if (idx132 === -1) return;

    const projectZone = this.cover.seismicZone || "2";
    const zoneLabels = { 4: "Z4", 3: "Z3", 2: "Z2", 1: "Z1" };
    const currentZoneLabel = zoneLabels[projectZone] || "Z2";

    const selectedSoilFactor = (this.cover.soilFactor || "S2").toUpperCase();
    const selectedPeriod = this.cover.soilPeriod === "Tl" ? "Tl" : "Tp";
    const selectedS = ["S0", "S1", "S2", "S3"].includes(selectedSoilFactor) ? selectedSoilFactor : "S2";
    const selectedT = selectedPeriod;

    const soilFactorMatrix = {
      Z4: { S0: "0.80", S1: "1.00", S2: "1.05", S3: "1.10" },
      Z3: { S0: "0.80", S1: "1.00", S2: "1.15", S3: "1.20" },
      Z2: { S0: "0.80", S1: "1.00", S2: "1.20", S3: "1.40" },
      Z1: { S0: "0.80", S1: "1.00", S2: "1.60", S3: "2.00" },
    };

    const periodMatrix = {
      Tp: { S0: "0.3", S1: "0.4", S2: "0.6", S3: "1.0" },
      Tl: { S0: "3.0", S1: "2.5", S2: "2.0", S3: "1.6" },
    };

    const selectedSValue = soilFactorMatrix[currentZoneLabel][selectedS];
    const selectedTValue = periodMatrix[selectedT][selectedS];

    // Actualizar cover
    this.cover.soilFactor = selectedS;
    this.cover.soilPeriod = selectedT;
    this.cover.soilValue = selectedSValue;
    this.cover.soilPeriodValue = selectedTValue;

    const lightRed = "FDE2E2";
    const hardRed = "C00000";

    // Actualizar párrafo
    const idx132Paragraph = generalidades.content.findIndex((item, i) => i > idx132 && item.type === "paragraph");
    if (idx132Paragraph !== -1) {
      generalidades.content[idx132Paragraph] = {
        type: "paragraph",
        text: `Para efectos de la aplicación de la norma E-0.30 de diseño sismo-resistente, se adopta el perfil de suelo ${selectedS}. Para la zona ${projectZone}, el factor de suelo correspondiente es ${selectedSValue}. Asimismo, para el periodo seleccionado ${selectedT}, el valor correspondiente es ${selectedTValue}s según la Tabla N°4. Los valores de S, Tp y Tl se muestran en las Tablas N°3 y N°4 (NORMA E-030 - DISEÑO SISMORESISTENTE).`,
        alignment: "JUSTIFIED",
      };
    }

    // Generar tabla de factores de suelo
    const factorTableRows = ["Z4", "Z3", "Z2", "Z1"].map((zone) => [
      {
        text: zone,
        fill: zone === currentZoneLabel ? lightRed : null,
        color: zone === currentZoneLabel ? hardRed : "000000",
        bold: zone === currentZoneLabel,
      },
      ...["S0", "S1", "S2", "S3"].map((sKey) => {
        const isRow = zone === currentZoneLabel;
        const isCol = sKey === selectedS;
        const isIntersection = isRow && isCol;
        return {
          text: soilFactorMatrix[zone][sKey],
          fill: isIntersection ? hardRed : isRow || isCol ? lightRed : null,
          color: isIntersection ? "FFFFFF" : isRow || isCol ? hardRed : "000000",
          bold: isIntersection || isRow || isCol,
        };
      }),
    ]);

    // Generar tabla de periodos
    const periodTableRows = ["Tp", "Tl"].map((periodKey) => [
      {
        text: periodKey === "Tp" ? "Tp(s)" : "Tl(s)",
        fill: null,
        color: "000000",
        bold: false,
      },
      // "Tl(s)"
      ...["S0", "S1", "S2", "S3"].map((sKey) => {
        // const isRow = periodKey === selectedT;
        const isCol = sKey === selectedS;
        const isIntersection = isCol;
        return {
          text: periodMatrix[periodKey][sKey],
          fill: isIntersection ? hardRed : isCol ? lightRed : null,
          color: isIntersection ? "FFFFFF" : isCol ? hardRed : "000000",
          bold: isIntersection || isCol,
        };
      }),
    ]);

    const factorTable = {
      type: "table",
      title: 'Tabla N° 3\nFACTOR DE SUELO "S"',
      widthPercent: 90,
      indentSize: 500,
      columns: [
        { header: "ZONA / SUELO", width: 22 },
        {
          header: "S0",
          width: 19.5,
          fill: selectedS === "S0" ? lightRed : null,
          color: selectedS === "S0" ? hardRed : "000000",
        },
        {
          header: "S1",
          width: 19.5,
          fill: selectedS === "S1" ? lightRed : null,
          color: selectedS === "S1" ? hardRed : "000000",
        },
        {
          header: "S2",
          width: 19.5,
          fill: selectedS === "S2" ? lightRed : null,
          color: selectedS === "S2" ? hardRed : "000000",
        },
        {
          header: "S3",
          width: 19.5,
          fill: selectedS === "S3" ? lightRed : null,
          color: selectedS === "S3" ? hardRed : "000000",
        },
      ],
      rows: factorTableRows,
    };

    const periodTable = {
      type: "table",
      title: 'Tabla N° 4\nPERÍODOS "Tp" Y "TL"',
      widthPercent: 90,
      indentSize: 500,
      columns: [
        { header: "Perfil de suelo", width: 22 },
        {
          header: "S0",
          width: 19.5,
          fill: selectedS === "S0" ? lightRed : null,
          color: selectedS === "S0" ? hardRed : "000000",
        },
        {
          header: "S1",
          width: 19.5,
          fill: selectedS === "S1" ? lightRed : null,
          color: selectedS === "S1" ? hardRed : "000000",
        },
        {
          header: "S2",
          width: 19.5,
          fill: selectedS === "S2" ? lightRed : null,
          color: selectedS === "S2" ? hardRed : "000000",
        },
        {
          header: "S3",
          width: 19.5,
          fill: selectedS === "S3" ? lightRed : null,
          color: selectedS === "S3" ? hardRed : "000000",
        },
      ],
      rows: periodTableRows,
    };

    // Reemplazar imágenes por tablas
    const firstSoilImageIdx = generalidades.content.findIndex(
      (item, i) => i > idx132 && item.type === "image" && item.src === "/assets/img/memoriacalculos/factorsuelo.png",
    );
    const secondSoilImageIdx = generalidades.content.findIndex(
      (item, i) => i > idx132 && item.type === "image" && item.src === "/assets/img/memoriacalculos/periodos.png",
    );

    if (firstSoilImageIdx !== -1) {
      generalidades.content.splice(firstSoilImageIdx, 1, factorTable);
    }
    if (secondSoilImageIdx !== -1) {
      generalidades.content.splice(secondSoilImageIdx, 1, periodTable);
    }
  }

  // ============================================
  // 5. CATEGORÍAS DE EDIFICACIONES (Sección 1.3.4)
  // ============================================
  transformCategorias(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const idx134 = generalidades.content.findIndex(
      (item) => item.type === "heading" && String(item.text || "").startsWith("1.3.4."),
    );

    if (idx134 === -1) return;

    const factorByCategory = {
      A: "1.50",
      B: "1.30",
      C: "1.00",
      D: "Ver Nota 2",
    };

    const category = String(this.cover.buildingCategory || "").toUpperCase();
    const validCategory = Object.prototype.hasOwnProperty.call(factorByCategory, category) ? category : "C";
    const factorU = factorByCategory[validCategory];

    // Actualizar cover
    this.cover.buildingCategory = validCategory;
    this.cover.importanceFactorU = factorU;

    const categoryDetails = {
      A: {
        title: "A - Edificaciones Esenciales",
        description:
          "Establecimientos de salud del segundo y tercer nivel; puertos, aeropuertos, centrales de comunicaciones, estaciones de bomberos, cuarteles de fuerzas armadas y policía; instalaciones de generación y transformación eléctrica; reservorios y plantas de tratamiento de agua; locales con función de refugio, instituciones educativas e instalaciones cuyo colapso implique riesgo adicional.",
      },
      B: {
        title: "B - Edificaciones Importantes",
        description:
          "Edificaciones donde se reúnen gran cantidad de personas: cines, teatros, estadios, coliseos, centros comerciales, terminales de pasajeros, establecimientos penitenciarios y edificaciones que guardan patrimonio valioso (museos y bibliotecas). También incluye depósitos de granos y almacenes importantes para el abastecimiento.",
      },
      C: {
        title: "C - Edificaciones Comunes",
        description:
          "Edificaciones comunes como viviendas, oficinas, hoteles, restaurantes, depósitos e instalaciones industriales cuyo fallo no acarree peligros adicionales de incendios o fugas de contaminantes.",
      },
      D: {
        title: "D - Edificaciones Temporales",
        description: "Construcciones provisionales para depósitos, casetas y otras instalaciones similares.",
      },
    };

    const selectedCategoryDetail = categoryDetails[validCategory] || categoryDetails.C;

    // Actualizar párrafo
    const idx134Paragraph = generalidades.content.findIndex((item, i) => i > idx134 && item.type === "paragraph");
    if (idx134Paragraph !== -1) {
      const factorText = validCategory === "D" ? "Ver Nota 2" : factorU;
      generalidades.content[idx134Paragraph] = {
        type: "paragraph",
        text: `Cada estructura debe ser clasificada de acuerdo con la categoría de uso. Para la categoría ${validCategory}, corresponde el factor de importancia U = ${factorText}.`,
        alignment: "JUSTIFIED",
      };
    }

    // Reemplazar imagen por tabla
    const categoryImageIdx = generalidades.content.findIndex(
      (item, i) =>
        i > idx134 && item.type === "image" && item.src === "/assets/img/memoriacalculos/categoriaEdificaciones.png",
    );

    if (categoryImageIdx !== -1) {
      const categoryTable = {
        type: "table",
        title: "CATEGORÍA DE LAS EDIFICACIONES",
        widthPercent: 95,
        indentSize: 250,
        columns: [
          { header: "CATEGORÍA", width: 20 },
          { header: "DESCRIPCIÓN", width: 65 },
          { header: "FACTOR U", width: 15 },
        ],
        rows: [
          [
            { text: selectedCategoryDetail.title, bold: true },
            { text: selectedCategoryDetail.description, alignment: "LEFT" },
            {
              text: validCategory === "D" ? "Ver Nota 2" : factorU,
              bold: true,
              alignment: "CENTER",
            },
          ],
        ],
      };

      generalidades.content.splice(categoryImageIdx, 1, categoryTable);
    }
  }

  // ============================================
  // 6. SISTEMAS ESTRUCTURALES (Sección 1.3.5)
  // ============================================
  transformSistemasEstructurales(structure) {
    // Implementación similar si es necesario
    // Por ahora se mantiene la estructura original
  }

  // ============================================
  // 7. MATERIAL DE DISEÑO (Sección 1.5)
  // ============================================
  transformMaterialDiseno(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const idx15 = generalidades.content.findIndex(
      (item) => item.type === "heading" && String(item.text || "").startsWith("1.5."),
    );

    if (idx15 === -1) return;

    const endPos15 = this.findNextHeadingIndex(generalidades.content, idx15);
    const materialInputs = this.sections.generalidades.structuralDetails.materialDesign || {};

    const aceroEstructural = materialInputs.aceroEstructural || {};
    const aceroCorrugado = materialInputs.aceroCorrugado || {};
    const concreto = materialInputs.concreto || {};

    // obtener los checkbox
    const combinaciones = this.sections.generalidades.structuralDetails.combinacionesCarga || {
      comb1: true,
      comb2: true,
      comb3: true,
      comb4: true,
      comb5: true,
      comb6: true,
      comb7: true,
      comb8: true,
      comb9: true,
      comb10: true, //1,4 D
      comb11: true, //1,2D + 1,6L + 0,5(Lr ó S ó R)
      comb12: true, // 1,2D + 1,6(Lr ó S ó R) + (0,5Lr ó 0,8W)
      comb13: true, // 1,2D + 1,3W + 0,5L + 0,5(Lr ó S ó R)
      comb14: true, // 1,2D ± 1,0E + 0,5L + 0,2S
      comb15: true, // 0,9D ± (1,3W ó 1,0E)
      comb16: true, // D
      comb17: true, // D + L
      comb18: true, // D + (W ó 0,70E)
      comb19: true, // D + T
      comb20: true, // α[D + L +(W ó 0,70E)]
      comb21: true, // α[D + L + T]
      comb22: true, // α[D + (W ó 0,70E) + T]
      comb23: true, // α[D + L + (W ó 0,70E) + T]
    };

    const materialBlocks = [
      {
        type: "paragraph",
        text: "Se consideraron las siguientes caracteristicas de los materiales que conforman esta estructura",
        alignment: "JUSTIFIED",
      },
      {
        type: "paragraph",
        text: "Acero estructural (ASTM A36)",
        alignment: "JUSTIFIED",
      },
      {
        type: "list",
        listType: "bullet",
        items: [
          `Fluencia: fy = ${aceroEstructural.fy || "4,200"} kg/cm2, Grado 60.`,
          `Modulo de elasticidad: E = ${aceroEstructural.e || "2,038,901.92"} kg/cm2`,
        ],
      },
      {
        type: "paragraph",
        text: "Acero Corrugado (ASTM A605)",
        alignment: "JUSTIFIED",
      },
      {
        type: "list",
        listType: "bullet",
        items: [
          `Fluencia: fy = ${aceroCorrugado.fy || "4,200"} kg/cm2, Grado 60.`,
          `Modulo de elasticidad: E = ${aceroCorrugado.e || "2,038,901.92"} kg/cm2`,
        ],
      },
      {
        type: "paragraph",
        text: "Concreto",
        alignment: "JUSTIFIED",
      },
      {
        type: "list",
        listType: "bullet",
        items: [
          `Resistencia nominal: f'c = ${concreto.fc || "210"} kg/cm2`,
          `Modulo de elasticidad: E = ${concreto.e || "253,456.4"} kg/cm2`,
          `Peso específico: 2.4 ton/m3`,
          `Coeficiente de Poisson: u = 0.2`,
        ],
      },
    ];

    // Agregar imágenes 11 y 12 juntas
    const materialImages = this.previews.materialImages || [];

    if (materialImages[0]) {
      materialBlocks.push({
        type: "image",
        src: materialImages[0],
        alignment: "CENTER",
        width: 480,
        height: 440,
        caption: "figura 11-Propiedad de refuerzo fy=4200 kg/cm2",
      });
    }

    if (materialImages[1]) {
      materialBlocks.push({
        type: "image",
        src: materialImages[1],
        alignment: "CENTER",
        width: 480,
        height: 440,
        caption: "figura 12-Propiedad del concreto f'c=210kg/cm2",
      });
    }

    // MAPA DE COMBINACIONES CON NOMBRES MEJORADOS
    const mapaCombinaciones = {
      comb1: "1,4 CM + 1,7 CV",
      comb2: "1,25 (CM + CV ± CVi)",
      comb3: "0,9 CM ± 1,25 CVi",
      comb4: "1,25(CM + CV) ± CS",
      comb5: "0,9 CM ± CS",
      comb6: "1,4 CM + 1,7 CV + 1,7 CE",
      comb7: "0,9 CM + 1,7 CE",
      comb8: "1,4 CM + 1,7 CV + 1,4 CL",
      comb9: "1,05 CM + 1,25 CV + 1,05 CT",
      comb10: "1,4 D",
      comb11: "1,2D + 1,6L + 0,5(Lr ó S ó R)",
      comb12: "1,2D + 1,6(Lr ó S ó R) + (0,5Lr ó 0,8W)",
      comb13: "1,2D + 1,3W + 0,5L + 0,5(Lr ó S ó R)",
      comb14: "1,2D ± 1,0E + 0,5L + 0,2S",
      comb15: "0,9D ± (1,3W ó 1,0E)",
      comb16: "D",
      comb17: "D + L",
      comb18: "D + (W ó 0,70E)",
      comb19: "D + T",
      comb20: "α[D + L +(W ó 0,70E)]",
      comb21: "α[D + L + T]",
      comb22: "α[D + (W ó 0,70E) + T]",
      comb23: "α[D + L + (W ó 0,70E) + T]",
    };

    // Obtener combinaciones seleccionadas
    const combinacionesSeleccionadas = [];
    Object.entries(combinaciones).forEach(([key, valor]) => {
      if (valor === true && mapaCombinaciones[key]) {
        combinacionesSeleccionadas.push(mapaCombinaciones[key]);
      }
    });

    // Agregar lista con las combinaciones seleccionadas
    if (combinacionesSeleccionadas.length > 0) {
      materialBlocks.push({
        type: "paragraph",
        text: "Para el diseño de los elementos estructurales se utilizarán las siguientes combinaciones de carga según la Norma E.060 del Reglamento Nacional de Edificaciones:",
        alignment: "JUSTIFIED",
        spacing: { before: 200 },
      });

      materialBlocks.push({
        type: "list",
        listType: "bullet",
        items: combinacionesSeleccionadas,
      });
    }

    // Figura 13 al final
    if (materialImages[2]) {
      materialBlocks.push({
        type: "image",
        src: materialImages[2],
        alignment: "CENTER",
        width: 500,
        height: 260,
        caption: "figura 13-Propiedades del acero",
      });
    }

    generalidades.content.splice(idx15 + 1, endPos15 - (idx15 + 1), ...materialBlocks);
  }

  // ============================================
  // 8. ANÁLISIS DE CARGAS (Sección 2)
  // ============================================

  transformAnalisisCargas(structure) {
    const analisisCargas = structure.document.sections.find((s) => s.id === "analisis_cargas");
    if (!analisisCargas) return;

    // 2.1 MODELO ESTRUCTURAL - Figura 14
    const idx21 = analisisCargas.content.findIndex(
      (item) => item.type === "heading" && item.text === "2.1 MODELO ESTRUCTURAL",
    );
    if (idx21 !== -1) {
      const modelo3D = this.previews.modeloMatematico3DImages?.[0];
      if (modelo3D) {
        // Insertar después del párrafo que sigue al heading
        analisisCargas.content.splice(idx21 + 2, 0, {
          type: "image",
          src: modelo3D,
          alignment: "CENTER",
          width: 500,
          height: 440,
          caption: "figura 14-vista 3d modelo matematico",
        });
      }
    }

    // 2.2 CASOS DE CARGA - Figura 15 y 16
    const idx22 = analisisCargas.content.findIndex(
      (item) => item.type === "heading" && item.text === "2.2 CASOS DE CARGA",
    );
    if (idx22 !== -1) {
      const espectros = this.previews.espectroPseudoaceleracionesImages || [];
      // Buscamos el final de la sección 2.2 o el inicio de 2.3
      const nextHeadingIdx = this.findNextHeadingIndex(analisisCargas.content, idx22);

      const espectroBlocks = [];
      if (espectros[0]) {
        espectroBlocks.push({
          type: "image",
          src: espectros[0],
          alignment: "CENTER",
          width: 500,
          height: 600,
          caption: "figura 15-Espectro de Pseudoaceleraciones en dirección “X”",
        });
      }
      if (espectros[1]) {
        espectroBlocks.push({
          type: "image",
          src: espectros[1],
          alignment: "CENTER",
          width: 500,
          height: 600,
          caption: "figura 16-Espectro de Pseudoaceleraciones en dirección “Y”",
        });
      }

      if (espectroBlocks.length > 0) {
        analisisCargas.content.splice(nextHeadingIdx, 0, ...espectroBlocks);
      }
    }

    // 2.4 METRADO DE CARGAS - Figura 18-21, Viento, Aproximadas, 22-25
    const idx24 = analisisCargas.content.findIndex(
      (item) => item.type === "heading" && item.text === "2.4 METRADO DE CARGAS",
    );

    if (idx24 !== -1) {
      const dataCasos = this.sections.analisisCargas.casoscarga || {};

      // Determinar límites para reemplazo dinámico
      const nextHeadingIdx = this.findNextHeadingIndex(analisisCargas.content, idx24);
      const startReplacingAt = idx24 + 3; // Mantener Heading(0), Párrafo(1) y Lista(2)
      const itemsToDelete = nextHeadingIdx - startReplacingAt;

      const dynamicContent = [];

      // 1. Figuras 18-21 (Metrado de Cargas)
      const metradoImages = this.previews.metradoCargasImages || [];
      const metradoDescripciones = this.sections?.analisisCargas?.descripcionesCargaMuerta || [];

      const metradoCaptionsDefault = [
        "figura 18-Cargas muertas por metro cuadrado (tonf/m2)",
        "figura 19-Carga viva entrepiso por metro cuadrado (tonf/m2)",
        "figura 20-Carga viva techo por metro cuadrado (tonf/m2)",
        "figura 21-Carga muerta por metro lineal debido a tabiquería (tonf/m)",
      ];

      metradoImages.forEach((src, i) => {
        if (src) {
          dynamicContent.push({
            type: "image",
            src,
            alignment: "CENTER",
            width: 500,
            height: 280,
            caption: metradoDescripciones[i]?.trim() || metradoCaptionsDefault[i],
          });
        }
      });

      // 2. Sección de Viento
      const velocity = parseFloat(dataCasos.cargaviento) || 75;
      dynamicContent.push({
        type: "paragraph",
        text: "Para calcular o estimar las cargas que se aplicaran en la estructura se tomará las cargas referenciales acorde a la norma E.020 del R.N.E.",
        alignment: "JUSTIFIED",
        spacing: { before: 200 },
      });
      dynamicContent.push({
        type: "paragraph",
        text: `Carga viento: La carga de viento a utilizar está dada por el reglamento nacional de edificaciones tomando como referencia el mapa eólico del Perú, con una velocidad correspondiente a ${velocity} km/h como condición crítica.`,
        alignment: "JUSTIFIED",
      });

      // Mapa Eólico
      dynamicContent.push({
        type: "image",
        src: "/assets/img/memoriacalculos/cargaviento.png",
        alignment: "CENTER",
        width: 400,
        height: 380,
        caption: "Mapa eólico del Perú",
      });

      dynamicContent.push({
        type: "paragraph",
        text: "Además, se considerará los siguientes ítems provenientes de la norma E.020:",
        alignment: "JUSTIFIED",
        spacing: { before: 100 },
      });

      // Factores de Forma (Tabla 4)
      dynamicContent.push({
        type: "image",
        src: "/assets/img/memoriacalculos/factoresforma.png",
        alignment: "CENTER",
        width: 420,
        height: 380,
        caption: "Tabla de factores de forma",
      });

      // 3. Cargas Aproximadas (Heading + Tabla)
      dynamicContent.push({
        type: "heading",
        level: 3,
        text: "CARGAS APROXIMADAS",
      });

      const vel = parseFloat(dataCasos.cargaviento) || 75;
      const alt = parseFloat(dataCasos.K17) || 15.85;
      const qz = (vel * vel) / 18000;
      const format = (n) => parseFloat(n || 0).toFixed(2);

      dynamicContent.push({
        type: "table",
        widthPercent: 90,
        noBorders: true,
        columns: [
          { header: "CONCEPTO", width: 40 },
          { header: "OP", width: 10 },
          { header: "VALOR", width: 20 },
          { header: "UNIDAD", width: 30 },
        ],
        rows: [
          ["3.1) CARGAS MUERTAS", "", "", ""],
          ["Cubierta + Accesorios", "=", format(dataCasos.K5 || 10), "kgf/m2"],
          [
            { text: "CM", bold: true },
            { text: "=", bold: true },
            { text: format(dataCasos.K5 || 10), bold: true },
            { text: "kgf/m2", bold: true },
          ],
          ["", "", "", ""],
          ["3.2) CARGAS VIVAS", "", "", ""],
          ["Techo inclinado", "=", format(dataCasos.K10 || 30), "kgf/m2"],
          ["S/C por construcción", "=", format(dataCasos.K11 || 0), "kgf/m2"],
          [
            { text: "CV", bold: true },
            { text: "=", bold: true },
            { text: format(parseFloat(dataCasos.K10 || 30) + parseFloat(dataCasos.K11 || 0)), bold: true },
            { text: "kgf/m2", bold: true },
          ],
          ["", "", "", ""],
          ["3.3) CARGAS DE VIENTO", "", "", ""],
          ["Velocidad del viento", "=", format(vel), "km/h"],
          ["Altura sobre el terreno", "=", format(alt), "m"],
          ["", "", "", ""],
          [{ text: "Barlovento", bold: true, underline: true }, "", "", ""],
          ["Vh", "=", format(vel * Math.pow(alt / 10, 0.22)), "km/h"],
          ["C", "=", format(dataCasos.K21 || 0.3), ""],
          ["Pv+", "=", format(qz * (dataCasos.K21 || 0.3) * 100), "kgf/m2"],
          [
            { text: "CW+", bold: true },
            { text: "=", bold: true },
            { text: Math.round(qz * (dataCasos.K21 || 0.3) * 100), bold: true },
            { text: "kgf/m2", bold: true },
          ],
          ["", "", "", ""],
          [{ text: "Sotavento", bold: true, underline: true }, "", "", ""],
          ["C", "=", format(dataCasos.K32 || -0.6), ""],
          ["Pv-", "=", format(qz * (dataCasos.K32 || -0.6) * 100), "kgf/m2"],
          [
            { text: "CW-", bold: true },
            { text: "=", bold: true },
            { text: Math.round(qz * (dataCasos.K32 || -0.6) * 100), bold: true },
            { text: "kgf/m2", bold: true },
          ],
        ],
      });

      // 4. Figuras 22-25 (Cargas Aproximadas)
      const aproximadasImages = this.previews.cargasAproximadasImages || [];
      const approxDescripciones = this.sections?.analisisCargas?.descripcionesCargaViva || [];

      const approxCaptionsDefault = [
        "figura 22-Cargas muertas por metro cuadrado (kgf/m2)",
        "figura 23-Cargas viva techo metro cuadrado (kgf/m2)",
        "figura 24-Cargas viva viento positivo(kgf/m2)",
        "figura 25-Cargas viva viento negativo(kgf/m2)",
      ];

      aproximadasImages.forEach((src, i) => {
        if (src) {
          dynamicContent.push({
            type: "image",
            src,
            alignment: "CENTER",
            width: 500,
            height: 280,
            caption: approxDescripciones[i]?.trim() || approxCaptionsDefault[i],
          });
        }
      });

      // Aplicar todos los cambios de 2.4 en una sola operación
      analisisCargas.content.splice(startReplacingAt, itemsToDelete, ...dynamicContent);
    }
  }

  // ============================================
  // 9. ANÁLISIS SISMICO (Sección 3) - CORREGIDO
  // ============================================
  transformAnalisisSismico(structure) {
    console.log("=== DEBUG ANALISIS SISMICO ===");
    console.log("📦 Imágenes disponibles:", this.previews.estaticoConsideracionesETABS);
    console.log("1. Buscando sección 'analisis_sismico'");

    const analisisSismico = structure.document.sections.find((s) => s.id === "analisis_sismico");
    console.log("2. Sección encontrada:", !!analisisSismico);
    if (!analisisSismico) {
      console.warn("No se encontró la sección 'analisis_sismico'");
      return;
    }

    // console.log(
    //   "3. Contenido de la sección:",
    //   analisisSismico.content.map((c) => c.type),
    // );

    const idx31 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1 ANÁLISIS ESTRUCTURAL",
    );

    if (idx31 === -1) {
      console.warn("No se encontró el heading '3.1 ANÁLISIS ESTRUCTURAL'");
      return;
    }

    const analisisEstructuralImages = this.previews.analisisEstructuralImages || [];

    const idx311 = analisisSismico.content.findIndex(
      (item, i) => i > idx31 && item.type === "heading" && item.text === "3.1.1. Sistema Estructural",
    );

    if (idx311 === -1) {
      console.warn("No se encontró la sección '3.1.1. Sistema Estructural'");
      return;
    }

    const paragraphEstructuralIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx311 &&
        item.type === "paragraph" &&
        item.text ===
          "En la tabla N° 6 se definen los sistemas estructurales permitidos de acuerdo a la categoria de las edificaciones y a la zona sismica en la que se encuentra.",
    );

    // inserta la tabla N° 6
    const rowsTable6 = [
      [
        { text: "A1", fill: null, color: "000000", bold: false }, //cambie colspan
        { text: "4 y 3", fill: null, color: "000000", bold: false },
        {
          text: "Aislamiento Sísmico con cualquier sistema estructural.",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
      ],
      [
        { text: "A1", fill: null, color: "000000", bold: false },
        { text: "2 y 1", fill: null, color: "000000", bold: false },
        {
          text: "\nEstructuras de acero tipo SCBF y EBF.\nEstructuras de concreto: Sistema Dual, Muros de Concreto Armado.\nAlbañilería Armada o Confinada.\n",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
      ],
      [
        { text: "A2 (**)", fill: null, color: "000000", bold: false },
        { text: "4, 3 y 2", fill: null, color: "000000", bold: false },
        {
          text: "\nEstructuras de acero tipo SCBF y EBF.\nEstructuras de concreto: Sistema Dual, Muros de Concreto Armado.\nAlbañilería Armada o Confinada.\n",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
      ],
      [
        { text: "A2 (**)", fill: null, color: "000000", bold: false },
        { text: "1", fill: null, color: "000000", bold: false },
        { text: "Cualquier sistema.", fill: null, color: "000000", bold: false, alignment: "LEFT" },
      ],
      [
        { text: "B", fill: null, color: "000000", bold: false },
        { text: "4, 3 y 2", fill: null, color: "000000", bold: false },
        {
          text: "\nEstructuras de acero tipo SMF, IMF, SCBF, OCBF y EBF.\nEstructuras de concreto: Pórticos, Sistema Dual, Muros de Concreto Armado.\nAlbañilería Armada o Confinada.\nEstructuras de madera\n",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
      ],
      [
        { text: "B", fill: null, color: "000000", bold: false },
        { text: "1", fill: null, color: "000000", bold: false },
        { text: "Cualquier sistema.", fill: null, color: "000000", bold: false, alignment: "LEFT" },
      ],
      [
        { text: "C", fill: null, color: "000000", bold: false },
        { text: "4, 3, 2 y 1", fill: null, color: "000000", bold: false },
        { text: "Cualquier sistema.", fill: null, color: "000000", bold: false, alignment: "LEFT" },
      ],
    ];

    const table6 = {
      type: "table",
      title: "Tabla N° 6\nCATEGORÍA Y SISTEMA ESTRUCTURAL DE LAS EDIFICACIONES",
      widthPercent: 95,
      indentSize: 500,
      columns: [
        { header: "Categoría de la Edificación", width: 20 },
        { header: "Zona", width: 15 },
        { header: "Sistema Estructural", width: 60 },
      ],
      rows: rowsTable6,
    };

    if (paragraphEstructuralIdx !== -1) {
      console.warn("Se encontró el parrafo de 3.1.1. Sistema Estructural");
      let insertPos = paragraphEstructuralIdx + 1;
      analisisSismico.content.splice(insertPos, 0, table6);

      insertPos++;

      if (analisisEstructuralImages[0]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[0],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Sistema Estructural: imagen 1",
        });
        insertPos++;
      }

      if (analisisEstructuralImages[1]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[1],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Sistema Estructural: imagen 2",
        });
      }
    }

    const idx312 = analisisSismico.content.findIndex(
      (item) =>
        item.type === "heading" && item.text === "3.1.2. Coeficiente Básico de Reducción de Fuerzas Sísmicas, Ro",
    );

    if (idx312 === -1) {
      console.warn("No se encontró el heading '3.1.2. Coeficiente Básico de Reducción de Fuerzas Sísmicas, Ro");
      return;
    }

    const paragraphCoeficienteIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx312 &&
        item.type === "paragraph" &&
        item.text ===
          "De la tabla N° 7 se obtiene el valor del coeficiente Ro, que depende unicamente del sistema estructural",
    );

    const rowsTable7 = [
      [
        { text: "Acero:", fill: null, color: "000000", bold: true, alignment: "LEFT" },
        { text: "", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "  Pórticos Especiales Resistentes a Momentos (SMF)",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
        { text: "8", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "  Pórticos Intermedios Resistentes a Momentos (IMF)",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
        { text: "5", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "  Pórticos Ordinarios Resistentes a Momentos (OMF)",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
        { text: "4", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "  Pórticos Especiales Concéntricamente Arriostrados (SCBF)",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
        { text: "7", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "  Pórticos Ordinarios Concéntricamente Arriostrados (OCBF)",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
        { text: "4", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "  Pórticos Excéntricamente Arriostrados (EBF)",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
        { text: "8", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "Concreto Armado:", fill: null, color: "000000", bold: true, alignment: "LEFT" },
        { text: "", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "  Pórticos", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "8", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "  Dual", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "7", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "  De muros estructurales", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "6", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "  Muros de ductilidad limitada", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "4", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "Albañilería Armada o Confinada", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "3", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "Madera", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "7 (**)", fill: null, color: "000000", bold: false },
      ],
    ];

    const table7 = {
      type: "table",
      title: "Tabla N° 7\nSISTEMAS ESTRUCTURALES",
      widthPercent: 90,
      indentSize: 500,
      columns: [
        { header: "Sistema Estructural", width: 70 },
        { header: "Coeficiente Básico de Reducción R₀ (*)", width: 30 },
      ],
      rows: rowsTable7,
    };

    if (paragraphCoeficienteIdx !== -1) {
      console.warn("Se encontró el parrafo de 3.1.2. Coeficiente Básico de Reducción de Fuerzas Sísmicas, Ro");

      let insertPos = paragraphCoeficienteIdx + 1;

      analisisSismico.content.splice(insertPos, 0, table7);
      insertPos++;

      if (analisisEstructuralImages[2]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[2],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Coeficiente Básico: imagen 1",
        });
        insertPos++;
      }

      if (analisisEstructuralImages[3]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[3],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Coeficiente Básico: imagen 2",
        });
      }
    }

    const idx313 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1.3. Factores de Irregularidad (La, Lp)",
    );

    if (idx313 === -1) {
      console.warn("No se encontró el heading '3.1.3. Factores de Irregularidad (La, Lp)'");
      return;
    }

    const paragraphFactoresIrregularidadIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx313 &&
        item.type === "paragraph" &&
        item.text.includes(
          "La mayoría de los casos se puede determinar si una estructura es regular o irregular a partir de su configuración estructural,",
        ),
    );

    const rowsTable8 = [
      [
        {
          text: "\nIrregularidad de Rigidez - Piso Blando\nExiste irregularidad de rigidez cuando, en cualquiera de las direcciones de análisis, en un entrepiso la rigidez lateral es menor que 70% de la rigidez lateral del entrepiso inmediatamente superior, o es menor que 80% de la rigidez lateral promedio de los tres niveles superiores adyacentes.\nLas rigideces laterales pueden calcularse como la razón entre la fuerza cortante del entrepiso y el desplazamiento correspondiente relativo en el centro de masas, ambos evaluados para la misma condición de carga \n\nIrregularidades de Resistencia – Piso Débil\nExiste irregularidad de resistencia cuando, en cualquiera de las direcciones de análisis, la resistencia de un entrepiso frente a fuerzas cortantes es inferior a 80% de la resistencia del entrepiso inmediatamente superior\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,60", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "\nIrregularidad Extrema de Rigidez (Ver Tabla N° 10)\nExiste irregularidad extrema de rigidez cuando, en cualquiera de las direcciones de análisis, en un entrepiso la rigidez lateral es menor que 60% de la rigidez lateral del entrepiso inmediatamente superior, o es menor que 70% de la rigidez lateral promedio de los tres niveles superiores adyacentes.\nLas rigideces laterales pueden calcularse como la razón entre la fuerza cortante del entrepiso y el desplazamiento correspondiente relativo en el centro de masas, ambos evaluados para la misma condición de carga.\n\nIrregularidad Extrema de Resistencia (Ver Tabla N° 10)\nExiste irregularidad extrema de resistencia cuando, en cualquiera de las direcciones de análisis, la resistencia de un entrepiso frente a fuerzas cortantes es inferior a 65% de la resistencia del entrepiso inmediatamente superior\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,50", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "\nIrregularidad de Masa o Peso\nSe tiene irregularidad de masa (o peso) cuando el peso de un piso, determinado según el artículo 26, es mayor que 1,5 veces el peso de un piso adyacente. Este criterio no se aplica en azoteas ni en sótanos\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,90", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "\nIrregularidad Geométrica Vertical\nLa configuración es irregular cuando, en cualquiera de las direcciones de análisis, la dimensión en planta de la estructura resistente a cargas laterales es mayor que 1,3 veces la dimensión correspondiente en un piso adyacente. Este criterio no se aplica en azoteas ni en sótanos\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,90", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "\nDiscontinuidad en los Sistemas Resistentes\nSe califica a la estructura como irregular cuando en cualquier elemento que resista más de 10% de la fuerza cortante se tiene un desalineamiento vertical, tanto por un cambio de orientación, como por un desplazamiento del eje de magnitud mayor que 25% de la dimensión correspondiente del elemento\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,90", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "\nDiscontinuidad extrema de los Sistemas Resistentes (Ver Tabla N° 10)\nExiste discontinuidad extrema cuando la fuerza cortante que resisten los elementos discontinuos según se describen en el ítem anterior, supere el 25% de la fuerza cortante total.\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,60", fill: null, color: "000000", bold: false },
      ],
    ];

    const rowsTable9 = [
      [
        {
          text: "\nIrregularidad Torsional\nExiste irregularidad torsional cuando, en cualquiera de las direcciones de análisis, el máximo desplazamiento relativo de entrepiso en un extremo del edificio (Δmax) en esa dirección, calculado incluyendo excentricidad accidental, es mayor que 1,3 veces el desplazamiento relativo promedio de los extremos del mismo entrepiso para la misma condición de carga (Δprom).\nEste criterio sólo se aplica en edificios con diafragmas rígidos y sólo si el máximo desplazamiento relativo de entrepiso es mayor que 50% del desplazamiento permisible indicado en la Tabla N° 11.\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,75", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "\nIrregularidad Torsional Extrema (Ver Tabla N° 10)\nExiste irregularidad torsional extrema cuando, en cualquiera de las direcciones de análisis, el máximo desplazamiento relativo de entrepiso en un extremo del edificio (Δmax) en esa dirección, calculado incluyendo excentricidad accidental, es mayor que 1,5 veces el desplazamiento relativo promedio de los extremos del mismo entrepiso para la misma condición de carga (Δprom).\nEste criterio sólo se aplica en edificios con diafragmas rígidos y sólo si el máximo desplazamiento relativo de entrepiso es mayor que 50% del desplazamiento permisible indicado en la Tabla N° 11.\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,60", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "\nEsquinas Entrantes\nLa estructura se califica como irregular cuando tiene esquinas entrantes cuyas dimensiones en ambas direcciones son mayores que el 20% de la correspondiente dimensión total en planta.\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,90", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "\nDiscontinuidad del Diafragma\nLa estructura se califica como irregular cuando los diafragmas tienen discontinuidades abruptas o variaciones importantes en la rigidez, incluyendo aberturas mayores que el 50% del área bruta del diafragma. También existe irregularidad cuando, en cualquiera de los pisos y para cualquiera de las direcciones de análisis, se tiene alguna sección transversal del diafragma con un área neta resistente menor que 25% del área de la sección transversal total de la misma dirección calculada con las dimensiones totales de la planta.\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,85", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "\nSistema no Paralelos\nSe considera que existe irregularidad cuando en cualquiera de las direcciones de análisis los elementos resistentes a fuerzas laterales no son paralelos. No se aplica si los ejes de los pórticos o muros forman ángulos menores que 30° ni cuando los elementos no paralelos resisten menos que 10% de la fuerza cortante del piso.\n",
          fill: null,
          color: "000000",
          bold: false,
          colSpan: 2,
          alignment: "LEFT",
        },
        { text: "0,90", fill: null, color: "000000", bold: false },
      ],
    ];

    const table8 = {
      type: "table",
      title: "Tabla N° 8",
      widthPercent: 95,
      indentSize: 500,
      columns: [
        { header: "IRREGULARIDADES ESTRUCTURALES EN ALTURA", width: 80 },
        { header: "Factor de irregularidad la", width: 20 },
      ],
      rows: rowsTable8,
    };

    const table9 = {
      type: "table",
      title: "Tabla N° 9",
      widthPercent: 95,
      indentSize: 500,
      columns: [
        { header: "IRREGULARIDADES ESTRUCTURALES EN PLANTA", width: 80 },
        { header: "Factor de irregularidad Ip", width: 20 },
      ],
      rows: rowsTable9,
    };

    if (paragraphFactoresIrregularidadIdx !== -1) {
      console.warn("Se encontró el parrafo de 3.1.3. Factores de Irregularidad (La, Lp)");

      let insertPos = paragraphFactoresIrregularidadIdx + 1;

      analisisSismico.content.splice(insertPos, 0, table8);
      insertPos++;

      analisisSismico.content.splice(insertPos, 0, {
        type: "paragraph",
        text: "",
        alignment: "CENTER",
      });
      insertPos++;

      analisisSismico.content.splice(insertPos, 0, table9);
      insertPos++;

      if (analisisEstructuralImages[4]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[4],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Factores de Irregularidad: imagen 4",
        });
        insertPos++;
      }

      if (analisisEstructuralImages[5]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[5],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Factores de Irregularidad: imagen 5",
        });
      }
    }

    const idx314 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1.4. Restricciones a la Irregularidad",
    );

    if (idx314 === -1) {
      console.warn("No se encontró el heading '3.1.4. Restricciones a la Irregularidad'");
      return;
    }

    const paragraphRestriccionesIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx314 &&
        item.type === "paragraph" &&
        item.text.includes(
          "Verificar las restricciones a la irregularidad de acuerdo a la categoría y zona de la edificación en la Tabla N° 10.",
        ),
    );

    const rowsTable10 = [
      [
        { text: "A1 y A2", fill: null, color: "000000", bold: false },
        { text: "4, 3 y 2", fill: null, color: "000000", bold: false },
        { text: "No se permiten irregularidades", fill: null, color: "000000", bold: false, alignment: "LEFT" },
      ],
      [
        { text: "A1 y A2", fill: null, color: "000000", bold: false },
        { text: "1", fill: null, color: "000000", bold: false },
        {
          text: "No se permiten irregularidades extremas",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
      ],
      [
        { text: "B", fill: null, color: "000000", bold: false },
        { text: "4, 3 y 2", fill: null, color: "000000", bold: false },
        {
          text: "No se permiten irregularidades extremas",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
      ],
      [
        { text: "B", fill: null, color: "000000", bold: false },
        { text: "1", fill: null, color: "000000", bold: false },
        { text: "Sin restricciones", fill: null, color: "000000", bold: false, alignment: "LEFT" },
      ],
      [
        { text: "C", fill: null, color: "000000", bold: false },
        { text: "4 y 3", fill: null, color: "000000", bold: false },
        {
          text: "No se permiten irregularidades extremas",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
      ],
      [
        { text: "C", fill: null, color: "000000", bold: false },
        { text: "2", fill: null, color: "000000", bold: false },
        {
          text: "No se permiten irregularidades extremas excepto en edificios de hasta 2 pisos u 8 m de altura total",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
      ],
      [
        { text: "C", fill: null, color: "000000", bold: false },
        { text: "1", fill: null, color: "000000", bold: false },
        { text: "Sin restricciones", fill: null, color: "000000", bold: false, alignment: "LEFT" },
      ],
    ];

    const table10 = {
      type: "table",
      title: "Tabla N° 10\nCATEGORÍA Y REGULARIDAD DE LAS EDIFICACIONES",
      widthPercent: 90,
      indentSize: 500,
      columns: [
        { header: "Categoría de la Edificación", width: 25 },
        { header: "Zona", width: 20 },
        { header: "Restricciones", width: 55 },
      ],
      rows: rowsTable10,
    };

    if (paragraphRestriccionesIdx !== -1) {
      console.warn("Se encontró el parrafo de 3.1.4. Restricciones a la Irregularidad");
      let insertPos = paragraphRestriccionesIdx + 1;

      analisisSismico.content.splice(insertPos, 0, table10);
      insertPos++;

      if (analisisEstructuralImages[6]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[6],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Restricciones a la irregularidad: imagen 1",
        });
        insertPos++;
      }

      if (analisisEstructuralImages[7]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[7],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Restricciones a la irregularidad: imagen 2",
        });
      }
    }

    const idx315 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1.5. Coeficiente de Reducción de la Fuerza Sísmica (R)",
    );

    if (idx315 === -1) {
      console.warn("No se encontró el heading '3.1.5. Coeficiente de Reducción de la Fuerza Sísmica (R)'");
      return;
    }

    const paragraphCoeficienteReduccionIdx = analisisSismico.content.findIndex(
      (item, i) => i > idx315 && item.type === "paragraph" && item.text === "Se determina R = Ro.la.lp",
    );

    if (paragraphCoeficienteReduccionIdx !== -1) {
      console.warn("Se encontró el parrafo de 3.1.5. Coeficiente de Reducción de la Fuerza Sísmica (R)");
      let insertPos = paragraphCoeficienteReduccionIdx + 1;

      if (analisisEstructuralImages[8]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[8],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Coeficiente de Reducción de la Fuerza Sísmica: imagen 1",
        });
        insertPos++;
      }
      if (analisisEstructuralImages[9]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[9],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Coeficiente de Reducción de la Fuerza Sísmica: imagen 2",
        });
      }
    }

    const idx316 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1.6. Modelos de Análisis",
    );

    if (idx316 === -1) {
      console.warn("No se encontró el heading '3.1.6. Modelos de Análisis'");
      return;
    }

    const paragraphModelosIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx316 &&
        item.type === "paragraph" &&
        item.text ===
          "Desarrollar el modelo matemático de la estructura. Para estructuras de concreto armado y albañilería considerar las propiedades de las secciones brutas ignorando la fisuración y el refuerzo.",
    );

    if (paragraphModelosIdx !== -1) {
      console.warn("Se encontró el parrafo de la seccion '3.1.6. Modelos de Análisis'");
      let insertPos = paragraphModelosIdx + 1;
      if (analisisEstructuralImages[10]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[10],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Modelos de Análisis: imagen 1",
        });
        insertPos++;
      }

      if (analisisEstructuralImages[11]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[11],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Modelos de Análisis: imagen 2",
        });
      }
    }

    const idx317 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1.7. Estimación del Peso (P)",
    );

    if (idx317 === -1) {
      console.warn("No se encontró el heading '3.1.7. Estimación del Peso (P)'");
      return;
    }

    const paragraphEstimacionIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx317 &&
        item.type === "paragraph" &&
        item.text ===
          "Se determina el peso (P) para el cálculo de la fuerza sísmica adicionando a la carga permanente total un porcentaje de la carga viva que depende del uso y la categoría de la edificación, definido de acuerdo a lo indicado en este numeral.",
    );

    if (paragraphEstimacionIdx !== -1) {
      let insertPos = paragraphEstimacionIdx + 1;

      if (analisisEstructuralImages[12]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[12],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Estimación del Peso: imagen 1",
        });
        insertPos++;
      }

      if (analisisEstructuralImages[13]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[13],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Estimación del Peso: imagen 2",
        });
      }
    }

    const idx318 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1.8. Procedimientos de Análisis Sísmico",
    );

    if (idx318 === -1) {
      console.warn("No se encontró el heading '3.1.8. Procedimientos de Análisis Sísmico'");
      return;
    }

    const paragraphProcedimientos = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx318 &&
        item.type === "paragraph" &&
        item.text ===
          "Se definen los procedimientos de análisis considerados en esta Norma, que son análisis estático (artículo 28) y análisis dinámico modal espectral (artículo 29).",
    );

    if (paragraphProcedimientos !== -1) {
      let insertPos = paragraphProcedimientos + 1;
      if (analisisEstructuralImages[14]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[14],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Procedimientos de Análisis Sísmico: imagen 1",
        });
        insertPos++;
      }
      if (analisisEstructuralImages[15]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[15],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Procedimientos de Análisis Sísmico: imagen 2",
        });
      }
    }

    const idx319 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1.9. Determinación de Desplazamientos Laterales",
    );

    if (idx319 === -1) {
      console.warn("No se encontró el heading '3.1.9. Determinación de Desplazamientos Laterales'");
      return;
    }

    const paragraphDesplazamientosIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx319 &&
        item.type === "paragraph" &&
        item.text === "Se calculan los desplazamientos laterales de acuerdo a las indicaciones de este numeral.",
    );

    if (paragraphDesplazamientosIdx !== -1) {
      let insertPos = paragraphDesplazamientosIdx + 1;
      if (analisisEstructuralImages[16]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[16],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Determinación de Desplazamientos Laterales: imagen 1",
        });
        insertPos++;
      }
      if (analisisEstructuralImages[17]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[17],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Determinación de Desplazamientos Laterales: imagen 2",
        });
      }
    }

    const idx3110 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1.10. Distorsión Admisible",
    );

    if (idx3110 === -1) {
      console.warn("No se encontró el heading '3.1.10. Distorsión Admisible'");
      return;
    }

    const paragraphDistorsionIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx3110 &&
        item.type === "paragraph" &&
        item.text.includes(
          "Verifique que la distorsión máxima de entrepiso que se obtiene en la estructura con los desplazamientos calculados en el paso anterior sea menor que lo indicado en la Tabla N° 11.",
        ),
    );

    const rowsTable11 = [
      [
        { text: "Concreto Armado", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "0,007", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "Acero", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "0,010", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "Albañilería", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "0,005", fill: null, color: "000000", bold: false },
      ],
      [
        { text: "Madera", fill: null, color: "000000", bold: false, alignment: "LEFT" },
        { text: "0,010", fill: null, color: "000000", bold: false },
      ],
      [
        {
          text: "Edificios de concreto armado con muros de ductilidad limitada",
          fill: null,
          color: "000000",
          bold: false,
          alignment: "LEFT",
        },
        { text: "0,005", fill: null, color: "000000", bold: false },
      ],
    ];

    const table11 = {
      type: "table",
      title: "Tabla N° 11\nLÍMITES PARA LA DISTORSIÓN DEL ENTREPISO",
      widthPercent: 60,
      indentSize: 500,
      columns: [
        { header: "Material Predominante", width: 70 },
        { header: "Δi / hei", width: 30 },
      ],
      rows: rowsTable11,
    };

    if (paragraphDistorsionIdx !== -1) {
      let insertPos = paragraphDistorsionIdx + 1;

      analisisSismico.content.splice(insertPos, 0, table11);
      insertPos++;

      if (analisisEstructuralImages[18]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[18],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Distorsión Admisible: imagen 1",
        });
        insertPos++;
      }
      if (analisisEstructuralImages[19]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[19],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Distorsión Admisible: imagen 2",
        });
      }
    }

    const idx3111 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.1.11. Separacion entre edificios",
    );

    if (idx3111 === -1) {
      console.warn("No se encontró el heading '3.1.11. Separacion entre edificios'");
      return;
    }

    const paragraphSeparacionIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx3111 &&
        item.type === "paragraph" &&
        item.text ===
          "Determinar la separación mínima a otras edificaciones o al límite de propiedad de acuerdo a las indicaciones de este numeral.",
    );

    if (paragraphSeparacionIdx !== -1) {
      let insertPos = paragraphSeparacionIdx + 1;
      if (analisisEstructuralImages[20]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[20],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Distorsión Admisible: imagen 1",
        });
        insertPos++;
      }
      if (analisisEstructuralImages[21]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: analisisEstructuralImages[21],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Distorsión Admisible: imagen 2",
        });
      }
    }

    // ---------------------------- 3.2 PARÁMETROS SÍSMICOS (Norma E.030) -------------------------
    const idx32 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.2 PARÁMETROS SÍSMICOS (Norma E.030)",
    );

    if (idx32 === -1) {
      console.warn("No se encontró el heading '3.2 PARÁMETROS SÍSMICOS (Norma E.030)'");
      return;
    }

    const idx321 = analisisSismico.content.findIndex(
      (item, i) => i > idx32 && item.type === "heading" && item.text === "3.2.1. CÁLCULO DE IRREGULARIDADES EN ALTURA",
    );

    if (idx321 === -1) {
      console.warn("No se encontró el heading '3.2.1. CÁLCULO DE IRREGULARIDADES EN ALTURA'");
      return;
    }

    const listParametros1 = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx321 && item.type === "list" && item.items[0] && item.items[0].includes("Irregularidades en altura (IA."),
    );

    const irregularidadImages = this.previews.irregularidadImages || [];

    if (listParametros1 !== -1) {
      let insertPos = listParametros1 + 1;
      const caption = [
        "Irregularidad de Rigidez - Piso Blando X",
        "Irregularidad de Resistencia - Piso Debil X",
        "Irregularidad de Rigidez - Piso Blando Y",
        "Irregularidad de Resistencia - Piso Debil Y",
        "Irregularidad de Rigidez - Piso Blando (Extrema) X",
        "Irregularidad de Resistencia - Piso Debil (Extrema) X",
        "Irregularidad de Rigidez - Piso Blando (Extrema) Y",
        "Irregularidad de Resistencia - Piso Debil (Extrema) Y",
      ];
      for (let index = 0; index < 8; index++) {
        if (irregularidadImages[index]) {
          analisisSismico.content.splice(insertPos, 0, {
            type: "image",
            src: irregularidadImages[index],
            alignment: "CENTER",
            width: 500,
            height: 280,
            caption: caption[index],
          });
          insertPos++;
        }
      }
    }

    const listParametros2 = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx321 &&
        item.type === "list" &&
        item.items[0] &&
        item.items[0].includes("Irregularidades en altura (MASA O PESO / Según NTE E.030 - 2018)"),
    );

    if (listParametros2 !== -1) {
      if (irregularidadImages[8]) {
        analisisSismico.content.splice(listParametros2 + 1, 0, {
          type: "image",
          src: irregularidadImages[8],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "Resultado de analisis",
        });
      }
    }

    const listParametros3 = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx321 &&
        item.type === "list" &&
        item.items[0] &&
        item.items[0].includes("Irregularidades en altura (IGV, DSR/ Según NTE E.030 - 2018)"),
    );

    if (listParametros3 !== -1) {
      let insertPos = listParametros3 +1;
      if (irregularidadImages[9]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: irregularidadImages[9],
          alignment: "CENTER",
          width: 500,
          height: 350,
          caption: "Evaluacion IGV (X/Y)",
        });
        insertPos++;
      }
      if (irregularidadImages[10]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: irregularidadImages[10],
          alignment: "CENTER",
          width: 500,
          height: 350,
          caption: "Evaluacion combinado",
        });
      }
    }

    const idx322 = analisisSismico.content.findIndex(
      (item, i) => i > idx32 && item.type === "heading" && item.text === "3.2.2. CÁLCULO DE IRREGULARIDADES EN PLANTA",
    );

    if (idx322 === -1) {
      console.warn("No se encontró el heading '3.2.2. CÁLCULO DE IRREGULARIDADES EN PLANTA'");
      return;
    }

    const listPlanta1 = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx322 &&
        item.type === "list" &&
        item.items[0] &&
        item.items[0].includes("Irregularidades en planta (IGV, DSR/ Según NTE E.030 - 2018)"),
    );

    if (listPlanta1 !== -1) {
      let insertPos = listPlanta1 +1;
      if (irregularidadImages[11]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: irregularidadImages[11],
          alignment: "CENTER",
          width: 500,
          height: 350,
          caption: "Irregularidad geometrica vertical",
        });
        insertPos++;
      }
      if (irregularidadImages[12]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: irregularidadImages[12],
          alignment: "CENTER",
          width: 500,
          height: 350,
          caption: "Discontinuidad en los sistemas restantes",
        });
      }
    }

    const listPlanta2 = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx322 &&
        item.type === "list" &&
        item.items[0] &&
        item.items[0].includes("Irregularidades en planta (Sistemas No Paralelos / Según NTE E.030 - 2018)"),
    );

    if (listPlanta2 !== -1) {
      if (irregularidadImages[13]) {
        analisisSismico.content.splice(listPlanta2 + 1, 0, {
          type: "image",
          src: irregularidadImages[13],
          alignment: "CENTER",
          width: 500,
          height: 350,
          caption: "Caso combinado",
        });
      }
    }

    const listPlanta3 = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx322 &&
        item.type === "list" &&
        item.items[0] &&
        item.items[0].includes("Irregularidades en planta (TORSIÓN - Según NTE E.030 - 2018)"),
    );

    if (listPlanta3 !== -1) {
      if (irregularidadImages[14]) {
        analisisSismico.content.splice(listPlanta3 + 1, 0, {
          type: "image",
          src: irregularidadImages[14],
          alignment: "CENTER",
          width: 500,
          height: 350,
          caption: "Datos de entrada y resultado",
        });
      }
    }

    const listPlanta4 = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx322 &&
        item.type === "list" &&
        item.items[0] &&
        item.items[0].includes("Irregularidades en planta (Irregularidad Torsional)"),
    );

    if (listPlanta4 !== -1) {
      let insertPos = listPlanta4 +1;
      if (irregularidadImages[15]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: irregularidadImages[15],
          alignment: "CENTER",
          width: 500,
          height: 350,
          caption: "Direccion XX",
        });
        insertPos++;
      }
      if (irregularidadImages[16]) {
        analisisSismico.content.splice(insertPos, 0, {
          type: "image",
          src: irregularidadImages[16],
          alignment: "CENTER",
          width: 500,
          height: 350,
          caption: "Direccion YY",
        });
      }
    }

    // ---------------------------- "3.3 ANÁLISIS SÍSMICO ESTATICO" -------------------------
    const idx33 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.3 ANÁLISIS SÍSMICO ESTATICO",
    );

    console.log("4. Índice del heading 3.3:", idx33);
    console.log("5. Imágenes disponibles:", this.previews.estaticoConsideracionesETABS);

    if (idx33 === -1) {
      console.warn("No se encontró el heading '3.3 ANÁLISIS SÍSMICO ESTATICO'");
      return;
    }

    // Buscar dónde insertar las imágenes (después del párrafo "Consideraciones en ETABS")
    const consideracionesParagraphIdx = analisisSismico.content.findIndex(
      (item, i) => i > idx33 && item.type === "paragraph" && item.text === "Consideraciones en ETABS",
    );

    if (consideracionesParagraphIdx === -1) {
      console.warn("No se encontró el párrafo 'Consideraciones en ETABS'");
      return;
    }

    // OBRENEMOS LAS IMAGENES DEL STORE
    const staticImages = this.previews.estaticoConsideracionesETABS || [];

    // Posición de inserción (después del párrafo)
    const insertPosFig26y27 = consideracionesParagraphIdx + 1;

    // Eliminar imágenes placeholder si existen
    const nextHeadingIdx = this.findNextHeadingIndex(analisisSismico.content, consideracionesParagraphIdx);

    // Crear bloques de imagen
    const blocksFig26y27 = [];

    if (staticImages[0]) {
      blocksFig26y27.push({
        type: "image",
        src: staticImages[0],
        alignment: "CENTER",
        width: 500,
        height: 280,
        caption: 'figura 26-Patrón de cargas sísmicas en "X"',
      });
    } else {
      console.warn("No hay imagen para figura 26");
    }

    if (staticImages[1]) {
      blocksFig26y27.push({
        type: "image",
        src: staticImages[1],
        alignment: "CENTER",
        width: 500,
        height: 280,
        caption: 'figura 27-Patrón de cargas sísmicas en "Y"',
      });
    } else {
      console.warn("No hay imagen para figura 27");
    }

    // Insertar las imágenes
    if (blocksFig26y27.length > 0) {
      analisisSismico.content.splice(insertPosFig26y27, 0, ...blocksFig26y27);
      console.log(`Insertadas ${blocksFig26y27.length} imágenes en posición ${insertPosFig26y27}`);
    }

    // ===========Figura 28 - peso sismico===========
    const listaPesoIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx33 &&
        item.type === "list" &&
        item.items &&
        item.items[0] &&
        item.items[0].includes("DEFINICIÓN DEL PESO SÍSMICO:"),
    );

    if (listaPesoIdx !== -1 && staticImages[2]) {
      //insertamos la figura 28 despues de la lista
      analisisSismico.content.splice(listaPesoIdx + 1, 0, {
        type: "image",
        src: staticImages[2],
        alignment: "CENTER",
        width: 500,
        height: 280,
        caption: "figura 28-Peso Sismico",
      });
      console.log("Figura 28 agregado despues de la lista");
    } else {
      if (listaPesoIdx === -1) console.warn("❌ No se encontró la lista de peso sísmico");
      if (!staticImages[2]) console.warn("❌ No hay imagen para figura 28");
    }

    //=====================figura 29-30 ===========
    const dinamicoImages = this.previews.dinamicoConsideracionesETABS || [];
    const idx34 = analisisSismico.content.findIndex(
      (item) => item.type === "heading" && item.text === "3.4 ANÁLISIS SÍSMICO DINÁMICO",
    );

    if (idx34 === -1) {
      console.warn("⚠️ No se encontró heading 3.3");
      return;
    }

    // Buscar la lista "CONSIDERACIONES EN ETABS"
    const listaConsIdx = analisisSismico.content.findIndex(
      (item, i) => i > idx34 && item.type === "list" && item.items && item.items[0] === "CONSIDERACIONES EN ETABS",
    );

    // Insertar figuras después de la lista
    let insertPos = listaConsIdx + 1;

    // Figura 29
    if (dinamicoImages[0]) {
      analisisSismico.content.splice(insertPos, 0, {
        type: "image",
        src: dinamicoImages[0],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: 'figura 29-Datos del caso de carga en "X"',
      });
      console.log(`✅ Figura 29 insertada en posición ${insertPos}`);
      insertPos++; // Incrementar posición para la siguiente imagen
    }

    // Figura 30
    if (dinamicoImages[1]) {
      analisisSismico.content.splice(insertPos, 0, {
        type: "image",
        src: dinamicoImages[1],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: 'figura 30-Datos del caso de carga en "Y"',
      });
      console.log(`✅ Figura 30 insertada en posición ${insertPos}`);
    }

    // =========== Modos de vibracion 3 imagenes ====================0
    const vibracionImages = this.previews.modosVibracionImages || [];
    const listaModosIdx = analisisSismico.content.findIndex(
      (item, i) => i > idx34 && item.type === "list" && item.items && item.items[0].includes("MODOS DE VIBRACIÓN"),
    );

    if (listaModosIdx !== -1) {
      const contentVibracion = [];
      const vibracionCaptions = [
        "figura 31-Datos de modos a su períodos",
        "figura 32-Modo de vibración 2-desplazamiento en Y",
        "figura 33-Modo de vibración 1-desplazamiento en X",
      ];

      vibracionImages.forEach((src, i) => {
        if (src && vibracionCaptions[i]) {
          contentVibracion.push({
            type: "image",
            src,
            alignment: "CENTER",
            width: 500,
            height: 280,
            caption: vibracionCaptions[i],
          });
        }
      });

      analisisSismico.content.splice(listaModosIdx + 1, 0, ...contentVibracion);
    }

    //============== FUERZA CORTANTE BASAL ===========
    const basalImages = this.previews.cortanteBasalImages || [];
    const listaBasalIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx34 && item.type === "list" && item.items && item.items[0].includes("FUERZA CORTANTE BASAL DINÁMICA"),
    );

    if (listaBasalIdx === -1) {
      console.warn("No se encontró el párrafo 'Consideraciones en ETABS'");
      return;
    }

    const insertPost = listaBasalIdx + 1;

    if (listaBasalIdx !== -1) {
      analisisSismico.content.splice(insertPost, 0, {
        type: "image",
        src: basalImages[0],
        alignment: "CENTER",
        width: 500,
        height: 400,
        caption: "figura 34-fuerza cortante basal dinámica",
      });
      console.log(`✅ Figura 34 insertada en posición ${insertPos}`);
    }

    const listaFuerzasObtenidas = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx34 &&
        item.type === "paragraph" &&
        item.text.includes(
          "De acuerdo con lo que establece el Artículo 26.4 de la Norma E.030 de Diseño Sismorresistente",
        ),
    );

    if (listaFuerzasObtenidas !== -1) {
      analisisSismico.content.splice(listaFuerzasObtenidas + 1, 0, {
        type: "image",
        src: basalImages[1],
        alignment: "CENTER",
        width: 500,
        height: 400,
        caption: 'figura 35-Sismo Dinámico en dirección "X" Escalado',
      });

      analisisSismico.content.splice(listaFuerzasObtenidas + 2, 0, {
        type: "image",
        src: basalImages[2],
        alignment: "CENTER",
        width: 500,
        height: 400,
        caption: 'figura 36-Sismo Dinámico en dirección "Y" Escalado',
      });
    }
    //============== Desplazamiento ===================

    const desplazamientoImages = this.previews.desplazamientoImages || [];
    const listDesplazamientoIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx34 && item.type === "list" && item.items[0].includes("DESPLAZAMIENTO PERMISIBLE Artículo 28 E-030"),
    );

    if (listDesplazamientoIdx !== -1) {
      const contentDesplazamiento = [];
      const desplazamientoCaptions = [
        "figura 37-Sismo Dinámico en dirección 'X'",
        "figura 38-Sismo Dinámico en dirección 'Y'",
      ];
      desplazamientoImages.forEach((src, i) => {
        if (src && desplazamientoCaptions[i]) {
          contentDesplazamiento.push({
            type: "image",
            src,
            alignment: "CENTER",
            width: 500,
            height: 280,
            caption: desplazamientoCaptions[i],
          });
        }
      });

      analisisSismico.content.splice(listDesplazamientoIdx + 1, 0, ...contentDesplazamiento);
    }

    // ====================Deformada imagenes ======================
    const deformadaImages = this.previews.deformadaImages || [];
    const paragraphDeformadaIdx = analisisSismico.content.findIndex(
      (item, i) =>
        i > idx34 &&
        item.type === "paragraph" &&
        item.text.includes("De los resultados mostrados se puede concluir que las derivas obtenidas"),
    );

    if (paragraphDeformadaIdx !== -1) {
      const contentDeformada = [];
      const deformadaCaption = [
        "figura 39-Deformada en 'X' debido a carga sísmica (mm)",
        "figura 40-Deformada en 'Y' debido a carga sísmica (mm)",
      ];

      deformadaImages.forEach((src, i) => {
        if (src && deformadaCaption[i]) {
          contentDeformada.push({
            type: "image",
            src,
            alignment: "CENTER",
            width: 500,
            height: 280,
            caption: deformadaCaption[i],
          });
        }
      });

      analisisSismico.content.splice(paragraphDeformadaIdx + 1, 0, ...contentDeformada);
    }
  }

  // ============================================
  // 10. DISEÑO ELEMTOS ESTRUCTURALES (Sección 4)
  // ============================================
  transformDisenoElementosEstructurales(structure) {
    const disenoElementos = structure.document.sections.find((s) => s.id === "diseno_elementos");
    console.log("2. Sección encontrada:", !!disenoElementos);
    if (!disenoElementos) {
      console.warn("No se encontró la sección 'diseno_elementos'");
      return;
    }

    // =================== 4.1 PREDIMENSIONAMIENTO DE LOS ELEMENTOS ESTRUCTURALES =========================
    const idx41 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text === "4.1 PREDISIONAMIENTO DE LOS ELEMENTOS ESTRUCTURALES",
    );

    if (idx41 === -1) {
      console.warn("No se encontró el heading '4.1 4.1 PREDISIONAMIENTO DE LOS ELEMENTOS ESTRUCTURALES'");
      return;
    }

    const predisionamientoParagraphIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx41 &&
        item.type === "paragraph" &&
        item.text.includes("Se utiliza especialmente durante la fase de anteproyecto"),
    );

    if (predisionamientoParagraphIdx === -1) {
      console.warn("No se encontró el párrafo de introducción");
      return;
    }

    // OBTENER LAS SECCIONES SELECCIONADAS
    const predimSecciones = this.sections?.disenoElementos?.predimSecciones || {
      seleccionadas: new Array(16).fill(true),
      titulos: new Array(16).fill(""),
    };
    const predimImages = this.previews?.predimImages || [];

    // Filtrar solo las secciones seleccionadas
    const seccionesAExportar = [];
    for (let i = 0; i < 16; i++) {
      if (predimSecciones.seleccionadas[i]) {
        seccionesAExportar.push({
          index: i,
          titulo: predimSecciones.titulos[i] || `Sección ${i + 1}`,
          imagenes: predimImages[i] || [null, null],
        });
      }
    }

    console.log(`📦 Exportando ${seccionesAExportar.length} secciones seleccionadas de 16`);

    let indiceInsert = predisionamientoParagraphIdx + 1;

    // Si no hay secciones seleccionadas, mostrar un mensaje
    if (seccionesAExportar.length === 0) {
      disenoElementos.content.splice(indiceInsert, 0, {
        type: "paragraph",
        text: "No hay secciones seleccionadas para exportar. Por favor, seleccione al menos una sección en el formulario.",
        alignment: "CENTER",
        style: "warning",
      });
      return;
    }

    // Iterar sobre las secciones seleccionadas
    for (let idx = 0; idx < seccionesAExportar.length; idx++) {
      const seccion = seccionesAExportar[idx];
      const seccionNumero = idx + 1;
      const imagenesSeccion = seccion.imagenes;

      // Insertar título de la sección
      disenoElementos.content.splice(indiceInsert, 0, {
        type: "paragraph",
        text: seccion.titulo,
        alignment: "JUSTIFIED",
        bold: true,
        style: "subheading",
      });
      indiceInsert++;

      // Insertar las 2 imágenes fijas de la sección
      // Imagen 1: FIGURA / ESQUEMA
      const imagen1 = imagenesSeccion[0];
      if (imagen1 && typeof imagen1 === "string" && imagen1.startsWith("data:image")) {
        disenoElementos.content.splice(indiceInsert, 0, {
          type: "image",
          src: imagen1,
          alt: `${seccion.titulo} - Figura / Esquema`,
          width: 500,
          height: 350,
          caption: `${seccion.titulo} - Figura / Esquema`,
          alignment: "CENTER",
        });
        console.log(`   🖼️ Insertada imagen 1 (Figura) de "${seccion.titulo}"`);
      } else {
        disenoElementos.content.splice(indiceInsert, 0, {
          type: "paragraph",
          text: `[Figura / Esquema - No disponible para ${seccion.titulo}]`,
          style: "placeholder",
          alignment: "CENTER",
        });
      }
      indiceInsert++;

      // Imagen 2: TABLA / DETALLE
      const imagen2 = imagenesSeccion[1];
      if (imagen2 && typeof imagen2 === "string" && imagen2.startsWith("data:image")) {
        disenoElementos.content.splice(indiceInsert, 0, {
          type: "image",
          src: imagen2,
          alt: `${seccion.titulo} - Tabla / Detalle`,
          width: 600,
          height: 500,
          caption: `${seccion.titulo} - Tabla / Detalle`,
          alignment: "CENTER",
        });
        console.log(`   🖼️ Insertada imagen 2 (Tabla) de "${seccion.titulo}"`);
      } else {
        disenoElementos.content.splice(indiceInsert, 0, {
          type: "paragraph",
          text: `[Tabla / Detalle - No disponible para ${seccion.titulo}]`,
          style: "placeholder",
          alignment: "CENTER",
        });
      }
      indiceInsert++;

      // Agregar espacio entre secciones (excepto después de la última)
      if (idx < seccionesAExportar.length - 1) {
        disenoElementos.content.splice(indiceInsert, 0, {
          type: "paragraph",
          text: "",
        });
        indiceInsert++;
      }
    }

    console.log(`✅ Predimensionamiento transformado con ${seccionesAExportar.length} secciones`);
    // ==================== DISEÑO DE LOSA ALIGERADA ========================
    // Verificar que existe la sección
    if (!disenoElementos || !disenoElementos.content) {
      console.warn("⚠️ No se encontró la sección de diseño de elementos");
      return;
    }

    // Buscar el encabezado de la sección
    const idx42 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text && item.text.includes("4.2 DISEÑO DE LA LOSA ALIGERADA"),
    );

    if (idx42 === -1) {
      console.warn("⚠️ No se encontró el encabezado 4.2");
      return;
    }

    const paragraphLosaAligerada = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx42 &&
        item.type === "paragraph" &&
        item.text ===
          "Una losa aligerada es un tipo de techo o piso que usamos en construcción, hecha con concreto y varillas de acero, pero con materiales livianos en su interior, como bloques de poliestireno o ladrillos huecos. Esto permite que sea más liviana, pero igual de resistente.",
    );

    const disenoLosaAligeradaImages = this.previews?.disenoLosaAligeradaImages || [];

    if (paragraphLosaAligerada !== -1) {
      disenoElementos.content.splice(paragraphLosaAligerada + 1, 0, {
        type: "image",
        src: disenoLosaAligeradaImages[0],
        alt: "figura 45-TABLA DE PREDISIONAMIENTO ",
        width: 500,
        height: 300,
        caption: "figura 45-TABLA DE PREDISIONAMIENTO ",
        alignment: "CENTER",
      });
      console.warn("Se encontró el parrafo de losa aligerada");
    } else {
      disenoElementos.content.splice(paragraphLosaAligerada + 1, 0, {
        type: "paragraph",
        text: `[IMAGEN figura 45-TABLA DE PREDISIONAMIENTO  - Sin imagen disponible]`,
        style: "placeholder",
        alignment: "center",
      });
      console.warn("No Se encontró el parrafo de losa aligerada");
    }

    const metradoCargasListIdx = disenoElementos.content.findIndex(
      (item, i) => i > idx42 && item.type === "list" && item.items && item.items[0] === "METRADO DE CARGAS",
    );

    // Tabla de metrado de cargas - Versión con 4 columnas
    const tablaMetradoCargasDetallada = {
      type: "table",
      title: "METRADO DE CARGAS",
      columns: [
        { header: "DESCRIPCIÓN", width: 35 },
        { header: "FÓRMULA", width: 30 },
        { header: "VALOR", width: 15 },
        { header: "UNIDAD", width: 20 },
      ],
      rows: [
        ["Carga muerta", "CM = (0.200)(0.40)", "0.08", "tonf/m"],
        ["Losa aligerada e=20cm", "CM = (0.300)(0.40)", "0.12", "tonf/m"],
        ["Carga viva techo", "CV = (0.050)(0.40)", "0.02", "tonf/m"],
        ["", "", "", ""],
        ["CM TOTAL", "", "0.20", "tonf/m"],
        ["", "", "", ""],
        ["Wu = 1.4CM + 1.7CV", "1.4(0.20) + 1.7(0.02)", "0.314", "tonf/m"],
      ],
    };

    if (metradoCargasListIdx !== -1) {
      console.log("Se encontro la list de metrado de cargas para insertar la tabla.");
      disenoElementos.content.splice(metradoCargasListIdx + 1, 0, tablaMetradoCargasDetallada);

      // Obtener el texto de las secciones del store
      const listAligeradas = this.sections?.disenoElementos?.lista || "";

      if (!listAligeradas.trim()) {
        console.log("📝 No hay texto de losa aligerada para agregar");
      }

      if (listAligeradas.trim()) {
        // Convertir el texto en array de items
        const itemsArray = listAligeradas
          .split("\n")
          .map((linea) => linea.trim())
          .filter((linea) => linea.length > 0);

        if (itemsArray.length === 0) return;

        console.log(`📋 Insertando ${itemsArray.length} secciones de losa`);

        // Obtener las imágenes del store
        const losaImages = this.previews?.losaImages || [];
        console.log(`🖼️ Total de imágenes disponibles: ${losaImages.length} secciones con 4 imágenes cada una`);

        // INSERTAR las nuevas listas con sus imágenes
        let currentPosition = metradoCargasListIdx + 2;

        for (let index = 0; index < itemsArray.length; index++) {
          const item = itemsArray[index];

          // 1. Insertar la lista con el texto de la sección
          disenoElementos.content.splice(currentPosition, 0, {
            type: "list",
            listType: "bullet",
            items: [item],
          });
          console.log(`➕ Insertada lista ${index + 1}: "${item}" en posición ${currentPosition}`);
          currentPosition++;

          // 2. Insertar las 4 imágenes de esta sección (si existen)
          const imagenesSeccion = losaImages[index] || [];

          for (let imgIdx = 0; imgIdx < 4; imgIdx++) {
            const imagen = imagenesSeccion[imgIdx];

            if (imagen) {
              if (imgIdx === 0) {
                // Si hay imagen, insertarla
                disenoElementos.content.splice(currentPosition, 0, {
                  type: "image",
                  src: imagen, // Aquí va la URL de la imagen
                  alt: `Figura 4.2.${index + 1}.${imgIdx + 1} - ${item}`,
                  width: 500,
                  height: 300,
                  caption: `Figura 4.2.${index + 1}.${imgIdx + 1} - Detalle ${imgIdx + 1} de ${item}`,
                  alignment: "CENTER",
                });
                console.log(
                  `   🖼️ Insertada imagen ${imgIdx + 1} de sección ${index + 1} en posición ${currentPosition}`,
                );
              } else {
                // Si hay imagen, insertarla
                disenoElementos.content.splice(currentPosition, 0, {
                  type: "image",
                  src: imagen, // Aquí va la URL de la imagen
                  alt: `Figura 4.2.${index + 1}.${imgIdx + 1} - ${item}`,
                  width: 500,
                  height: 800,
                  caption: `Figura 4.2.${index + 1}.${imgIdx + 1} - Detalle ${imgIdx + 1} de ${item}`,
                  alignment: "CENTER",
                });
                console.log(
                  `   🖼️ Insertada imagen ${imgIdx + 1} de sección ${index + 1} en posición ${currentPosition}`,
                );
              }
            } else {
              // Si no hay imagen, insertar un placeholder o mensaje
              disenoElementos.content.splice(currentPosition, 0, {
                type: "paragraph",
                text: `[IMAGEN ${imgIdx + 1} - Sin imagen disponible]`,
                style: "placeholder",
              });
              console.log(
                `   ⚠️ Placeholder para imagen ${imgIdx + 1} de sección ${index + 1} en posición ${currentPosition}`,
              );
            }
            currentPosition++;
          }

          console.log(`✅ Sección ${index + 1} completada con sus 4 imágenes`);
        }
      }

      console.log("✅ Listas e imágenes de losa aligerada insertadas correctamente");
      console.log(`✅ Lista 'METRADO DE CARGAS' encontrada en índice: ${metradoCargasListIdx}`);
    } else {
      disenoElementos.content.splice(metradoCargasListIdx + 1, 0, {
        type: "paragraph",
        text: `[TABLA METRADOS DE CARGAS  - Sin tabla disponible]`,
        style: "placeholder",
        alignment: "center",
      });
      console.log("No Se encontro la list de metrado de cargas para insertar la tabla.");
    }
    // Buscar la lista "METRADO DE CARGAS"
    // const metradoCargasListIdx = disenoElementos.content.findIndex(
    //   (item, i) => i > idx42 && item.type === "list" && item.items && item.items[0] === "METRADO DE CARGAS",
    // );

    // ==================== DISEÑO DE LOZA MACIZA =======================0
    const idx43 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text === "4.3 DISEÑO DE LA LOSA MACIZA",
    );
    const disenoLosaParagraphIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx43 &&
        item.type === "paragraph" &&
        item.text.includes("A pesar de tener un mayor peso propio que otros tipos de losas como las aligeradas"),
    );

    const disenoLosaMacizaImages = this.previews.disenoLosaMacizaImages || [];
    if (disenoLosaParagraphIdx !== -1) {
      const contentLosaMaciza = [];
      const disenoLosaMacizaCaption = [
        "figura 52-M22(0.08TN-M)",
        "figura 53-M33(0.056TN-M)",
        "figura 54-V23 (0.52TN-M)",
        "figura 55-V13 (0.22TN-M)",
        "imagen Requisitos de diseño 1",
        "",
      ];

      disenoLosaMacizaImages.forEach((src, i) => {
        if (src) {
          if (i === 4 || i === 5) {
            contentLosaMaciza.push({
              type: "image",
              src,
              alignment: "CENTER",
              width: 600,
              height: 900,
              caption: disenoLosaMacizaCaption[i],
            });
          } else {
            contentLosaMaciza.push({
              type: "image",
              src,
              alignment: "CENTER",
              width: 500,
              height: 280,
              caption: disenoLosaMacizaCaption[i],
            });
          }
        }
      });

      disenoElementos.content.splice(disenoLosaParagraphIdx + 1, 0, ...contentLosaMaciza);
    }

    // ================== DISEÑO DE LOSA NERVADA 1 =======================
    const idx44 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text === "4.4 DISEÑO DE LOSA NERVADA",
    );
    const disenoLosaNervadaParagraphIdx = disenoElementos.content.findIndex(
      (item, i) => i > idx44 && item.type === "paragraph" && item.text === "Diseño de losa nervada 1 e=0.25",
    );
    const disenoLosaNervada1Images = this.previews.disenoLosaNervada1Images || [];

    if (disenoLosaNervadaParagraphIdx !== -1 && disenoLosaNervada1Images[0]) {
      disenoElementos.content.splice(disenoLosaNervadaParagraphIdx + 1, 0, {
        type: "image",
        src: disenoLosaNervada1Images[0],
        alignment: "CENTER",
        width: 500,
        height: 280,
        caption: "Ubicación de la losa para diseñar",
      });
    }

    const disenoLosaNervadaVerticalParagraphIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx44 && item.type === "paragraph" && item.text === "Diseño de Losa Nervada – Dirección Vertical",
    );

    if (disenoLosaNervadaVerticalParagraphIdx !== -1) {
      let insertIdx = disenoLosaNervadaVerticalParagraphIdx + 1;
      if (disenoLosaNervada1Images[1]) {
        disenoElementos.content.splice(insertIdx, 0, {
          type: "image",
          src: disenoLosaNervada1Images[1],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "",
        });
        insertIdx++;
      }
      if (disenoLosaNervada1Images[2]) {
        disenoElementos.content.splice(insertIdx, 0, {
          type: "image",
          src: disenoLosaNervada1Images[2],
          alignment: "CENTER",
          width: 500,
          height: 800,
          caption: "",
        });

        insertIdx++;
      }

      disenoElementos.content.splice(insertIdx, 0, {
        type: "paragraph",
        text: "Se usará acero 1Ø1/2”+1Ø3/8”",
        alignment: "JUSTIFIED",
      });
      insertIdx++;

      if (disenoLosaNervada1Images[3]) {
        disenoElementos.content.splice(insertIdx, 0, {
          type: "image",
          src: disenoLosaNervada1Images[3],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "",
        });
      }
      insertIdx++;

      if (disenoLosaNervada1Images[4]) {
        disenoElementos.content.splice(insertIdx, 0, {
          type: "image",
          src: disenoLosaNervada1Images[4],
          alignment: "CENTER",
          width: 500,
          height: 800,
          caption: "",
        });
      }
      insertIdx++;

      disenoElementos.content.splice(insertIdx, 0, {
        type: "paragraph",
        text: "Se usará acero 1Ø1/2”+1Ø3/8”",
        alignment: "JUSTIFIED",
      });
      insertIdx++;
    }

    const disenoLosaNervadaHorizontallParagraphIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx44 && item.type === "paragraph" && item.text === "Diseño de Losa Nervada – Dirección Horizontal",
    );

    if (disenoLosaNervadaHorizontallParagraphIdx !== -1) {
      let indiceInsercion = disenoLosaNervadaHorizontallParagraphIdx + 1;
      if (disenoLosaNervada1Images[5]) {
        disenoElementos.content.splice(indiceInsercion, 0, {
          type: "image",
          src: disenoLosaNervada1Images[5],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "",
        });
      }
      indiceInsercion++;
      if (disenoLosaNervada1Images[6]) {
        disenoElementos.content.splice(indiceInsercion, 0, {
          type: "image",
          src: disenoLosaNervada1Images[6],
          alignment: "CENTER",
          width: 500,
          height: 800,
          caption: "",
        });
      }
      indiceInsercion++;
      disenoElementos.content.splice(indiceInsercion, 0, {
        type: "paragraph",
        text: "Se usará acero 1Ø1/2”",
        alignment: "JUSTIFIED",
      });
      indiceInsercion++;

      if (disenoLosaNervada1Images[7]) {
        disenoElementos.content.splice(indiceInsercion, 0, {
          type: "image",
          src: disenoLosaNervada1Images[7],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "",
        });
      }
      indiceInsercion++;

      if (disenoLosaNervada1Images[8]) {
        disenoElementos.content.splice(indiceInsercion, 0, {
          type: "image",
          src: disenoLosaNervada1Images[8],
          alignment: "CENTER",
          width: 500,
          height: 800,
          caption: "",
        });
      }
      indiceInsercion++;
      disenoElementos.content.splice(indiceInsercion, 0, {
        type: "paragraph",
        text: "Se usará acero 1Ø1/2”",
        alignment: "JUSTIFIED",
      });
      indiceInsercion++;
    }

    // ===================== DISEÑO DE LOSA NERVADA 2 =================
    const disenoLosaNervada2ParagraphIdx = disenoElementos.content.findIndex(
      (item, i) => i > idx44 && item.type === "paragraph" && item.text === "Diseño de losa nervada 2 e=0.25",
    );
    const disenoLosaNervada2Images = this.previews.disenoLosaNervada2Images || [];

    if (disenoLosaNervada2ParagraphIdx !== -1 && disenoLosaNervada2Images[0]) {
      disenoElementos.content.splice(disenoLosaNervada2ParagraphIdx + 1, 0, {
        type: "image",
        src: disenoLosaNervada2Images[0],
        alignment: "CENTER",
        width: 500,
        height: 280,
        caption: "Ubicación de la losa para diseñar",
      });
    }

    const disenoLosaNervadaVertical2ParagraphIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx44 &&
        i > disenoLosaNervada2ParagraphIdx &&
        item.type === "paragraph" &&
        item.text === "Diseño de Losa Nervada – Dirección Vertical",
    );

    if (disenoLosaNervadaVertical2ParagraphIdx !== -1) {
      let indice2LosaNervada = disenoLosaNervadaVertical2ParagraphIdx + 1;

      if (disenoLosaNervada2Images[1]) {
        disenoElementos.content.splice(indice2LosaNervada, 0, {
          type: "image",
          src: disenoLosaNervada2Images[1],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "",
        });
      }

      indice2LosaNervada++;

      if (disenoLosaNervada2Images[2]) {
        disenoElementos.content.splice(indice2LosaNervada, 0, {
          type: "image",
          src: disenoLosaNervada2Images[2],
          alignment: "CENTER",
          width: 500,
          height: 700,
          caption: "",
        });
      }

      indice2LosaNervada++;

      disenoElementos.content.splice(indice2LosaNervada, 0, {
        type: "paragraph",
        text: "Se usará acero 1Ø1/2”+1Ø3/8”",
        alignment: "JUSTIFIED",
      });
      indice2LosaNervada++;

      if (disenoLosaNervada2Images[3]) {
        disenoElementos.content.splice(indice2LosaNervada, 0, {
          type: "image",
          src: disenoLosaNervada2Images[3],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "",
        });
      }
      indice2LosaNervada++;

      if (disenoLosaNervada2Images[4]) {
        disenoElementos.content.splice(indice2LosaNervada, 0, {
          type: "image",
          src: disenoLosaNervada2Images[4],
          alignment: "CENTER",
          width: 500,
          height: 700,
          caption: "",
        });
      }
      indice2LosaNervada++;
      disenoElementos.content.splice(indice2LosaNervada, 0, {
        type: "paragraph",
        text: "Se usará acero 1Ø1/2”+1Ø3/8”",
        alignment: "JUSTIFIED",
      });
      indice2LosaNervada++;
    }

    const disenoLosaNervadaHorizontall2ParagraphIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx44 &&
        i > disenoLosaNervada2ParagraphIdx &&
        item.type === "paragraph" &&
        item.text === "Diseño de Losa Nervada – Dirección Horizontal",
    );

    if (disenoLosaNervadaHorizontall2ParagraphIdx !== -1) {
      let indice2LosaNervadaHorizontal = disenoLosaNervadaHorizontall2ParagraphIdx + 1;
      if (disenoLosaNervada2Images[5]) {
        disenoElementos.content.splice(indice2LosaNervadaHorizontal, 0, {
          type: "image",
          src: disenoLosaNervada2Images[5],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "",
        });
      }
      indice2LosaNervadaHorizontal++;

      if (disenoLosaNervada2Images[6]) {
        disenoElementos.content.splice(indice2LosaNervadaHorizontal, 0, {
          type: "image",
          src: disenoLosaNervada2Images[6],
          alignment: "CENTER",
          width: 500,
          height: 800,
          caption: "",
        });
      }

      indice2LosaNervadaHorizontal++;

      disenoElementos.content.splice(indice2LosaNervadaHorizontal, 0, {
        type: "paragraph",
        text: "Se usará acero 1Ø1/2”",
        alignment: "JUSTIFIED",
      });
      indice2LosaNervadaHorizontal++;

      if (disenoLosaNervada2Images[7]) {
        disenoElementos.content.splice(indice2LosaNervadaHorizontal, 0, {
          type: "image",
          src: disenoLosaNervada2Images[7],
          alignment: "CENTER",
          width: 500,
          height: 280,
          caption: "",
        });
      }
      indice2LosaNervadaHorizontal++;

      if (disenoLosaNervada2Images[8]) {
        disenoElementos.content.splice(indice2LosaNervadaHorizontal, 0, {
          type: "image",
          src: disenoLosaNervada2Images[8],
          alignment: "CENTER",
          width: 500,
          height: 800,
          caption: "",
        });
      }
      indice2LosaNervadaHorizontal++;

      disenoElementos.content.splice(indice2LosaNervadaHorizontal, 0, {
        type: "paragraph",
        text: "Se usará acero 1Ø1/2”",
        alignment: "JUSTIFIED",
      });
      indice2LosaNervadaHorizontal++;
    }

    // ==================== DISEÑO DE VIGAS ========================
    console.log("🔍 ===== INICIANDO TRANSFORMACIÓN DE VIGAS =====");
    console.log("📦 this.previews.vigaImages:", this.previews?.vigaImages);
    console.log("📦 this.sections.disenoElementos.nameVigas:", this.sections?.disenoElementos?.nameVigas);

    if (!disenoElementos || !disenoElementos.content) {
      console.warn("⚠️ No se encontró la sección de diseño de elementos");
      return;
    }

    // Buscar el encabezado de la sección 4.5
    const idx45 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text && item.text.includes("4.5 DISEÑO DE VIGAS"),
    );

    console.log(`🔍 Índice del heading 4.5: ${idx45}`);

    if (idx45 === -1) {
      console.warn("⚠️ No se encontró el encabezado 4.5 DISEÑO DE VIGAS");
      return;
    }

    console.warn("Antes de encontrar la lista diseno por flexion");
    const listaDisenoFlexion = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx45 &&
        item.type === "list" &&
        item.items &&
        item.items[0].includes("Diseño por Flexión Artículo 9.2.3.1 de E.060"),
    );

    const disenoVigaImages = this.previews?.disenoVigaImages || [];

    if (listaDisenoFlexion !== -1) {
      disenoElementos.content.splice(listaDisenoFlexion + 1, 0, {
        type: "image",
        src: disenoVigaImages[0],
        alt: "Imagen Diseño por Flexion",
        width: 500,
        height: 300,
        caption: "figura 56-Consideraciones y términos para el diseño por flexión (tonf-m)",
        alignment: "CENTER",
      });
      console.warn("Se encontró la lista diseno por flexion");
    } else {
      disenoElementos.content.splice(listaDisenoFlexion, 0, {
        type: "paragraph",
        text: `[IMAGEN figura 56-Consideraciones y términos para el diseño por flexión (tonf-m) - Sin imagen disponible]`,
        style: "placeholder",
        alignment: "center",
      });
      console.warn("No Se encontró la lista diseno por flexion");
    }

    // Buscar la lista "Diseño de Viga de 25x45" que servirá como punto de referencia
    const listaReferenciaIdx = disenoElementos.content.findIndex(
      (item, i) => i > idx45 && item.type === "list" && item.items && item.items[0].includes("Diseño de Viga de 25x45"),
    );

    // Si no encontramos esa lista específica, buscar cualquier lista después del heading
    let puntoInsercion = idx45 + 1;
    if (listaReferenciaIdx !== -1) {
      puntoInsercion = listaReferenciaIdx + 1;
      console.log(`✅ Lista de referencia encontrada en índice: ${listaReferenciaIdx}`);
    } else {
      console.log(`📋 No se encontró lista específica, se insertará después del heading`);
    }

    // Obtener el texto de las vigas del store
    const listVigas = this.sections?.disenoElementos?.nameVigas || "";
    console.log("📋 listVigas raw:", JSON.stringify(listVigas));

    if (!listVigas.trim()) {
      console.log("📝 No hay texto de vigas para agregar");
    }

    if (listVigas.trim()) {
      // Convertir el texto en array de items
      const itemsArray = listVigas
        .split("\n")
        .map((linea) => linea.trim())
        .filter((linea) => linea.length > 0);

      console.log(`📋 itemsArray (${itemsArray.length} items):`, itemsArray);

      if (itemsArray.length === 0) return;

      // Obtener las imágenes del store
      const vigaImages = this.previews?.vigaImages || [];

      // INSERTAR las nuevas listas con sus imágenes (sin eliminar nada)
      let currentPosition = puntoInsercion;

      for (let index = 0; index < itemsArray.length; index++) {
        const item = itemsArray[index];
        // 1. Insertar la lista con el texto de la viga
        disenoElementos.content.splice(currentPosition, 0, {
          type: "list",
          listType: "bullet",
          items: [item],
        });
        currentPosition++;

        // 2. Insertar las 4 imágenes de esta viga
        const imagenesSeccion = vigaImages[index] || [];

        for (let imgIdx = 0; imgIdx < 4; imgIdx++) {
          const imagen = imagenesSeccion[imgIdx];

          if (imagen && typeof imagen === "string" && imagen.startsWith("data:image")) {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "image",
              src: imagen,
              alt: `Figura 4.5.${index + 1}.${imgIdx + 1} - ${item}`,
              width: 500,
              height: 700,
              caption: `Figura 4.5.${index + 1}.${imgIdx + 1} - Detalle ${imgIdx + 1} de ${item}`,
              alignment: "CENTER",
            });
            console.log(`   🖼️ Insertada imagen ${imgIdx + 1} en posición ${currentPosition}`);
          } else {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "paragraph",
              text: `[IMAGEN ${imgIdx + 1} - Sin imagen disponible]`,
              style: "placeholder",
              alignment: "center",
            });
            console.log(`   ⚠️ Placeholder imagen ${imgIdx + 1} en posición ${currentPosition}`);
          }
          currentPosition++;
        }

        // Espacio entre vigas
        if (index < itemsArray.length - 1) {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: "",
          });
          console.log(`   📄 Espacio insertado en posición ${currentPosition}`);
          currentPosition++;
        }

        console.log(`✅ Viga ${index + 1} completada`);
      }
    }

    console.log("✅ Listas e imágenes de vigas insertadas correctamente");
    // ==================== DISEÑO DE COLUMNA ========================
    console.log("🔍 ===== INICIANDO TRANSFORMACIÓN DE COLUMNAS =====");
    console.log("📦 this.previews.columnaImages:", this.previews?.columnaImages);
    console.log(
      "📦 this.sections.disenoElementos.descriptionColumna:",
      this.sections?.disenoElementos?.descriptionColumna,
    );

    // Buscar el encabezado de la sección 4.5
    const idx46 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text && item.text.includes("4.6 DISEÑO DE COLUMNA"),
    );

    console.log(`🔍 Índice del heading 4.5: ${idx46}`);

    if (idx46 === -1) {
      console.warn("⚠️ No se encontró el encabezado 4.5 DISEÑO DE COLUMNA");
      return;
    }

    // Buscar la lista "Diseño de Viga de 25x45" que servirá como punto de referencia
    const paragraphReferenciaIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx46 &&
        item.type === "paragraph" &&
        item.text.includes(
          "En pórticos o en elementos continuos deberá prestarse atención al efecto de las cargas no balanceadas de los pisos,",
        ),
    );

    // Si no encontramos esa lista específica, buscar cualquier lista después del heading
    let ptInsercion = idx46 + 1;
    if (paragraphReferenciaIdx !== -1) {
      ptInsercion = paragraphReferenciaIdx + 1;
      console.log(`✅ Parrafo de referencia encontrada en índice: ${paragraphReferenciaIdx}`);
    } else {
      console.log(`📋 No se encontró lista específica, se insertará después del heading`);
    }

    // Obtener el texto de las vigas del store
    const listColumna = this.sections?.disenoElementos?.nameColumna || "";
    console.log("📋 listColumna raw:", JSON.stringify(listColumna));

    if (!listColumna.trim()) {
      console.log("📝 No hay texto de vigas para agregar");
    }

    if (listColumna.trim()) {
      // Convertir el texto en array de items
      const itemsArray = listColumna
        .split("\n")
        .map((linea) => linea.trim())
        .filter((linea) => linea.length > 0);

      console.log(`📋 itemsArray (${itemsArray.length} items):`, itemsArray);

      if (itemsArray.length === 0) return;

      // Obtener las imágenes del store
      const columnaImages = this.previews?.columnaImages || [];

      // INSERTAR las nuevas listas con sus imágenes (sin eliminar nada)
      let currentPosition = ptInsercion;

      for (let index = 0; index < itemsArray.length; index++) {
        const item = itemsArray[index];
        // 1. Insertar la lista con el texto de la viga
        disenoElementos.content.splice(currentPosition, 0, {
          type: "list",
          listType: "bullet",
          items: [item],
        });
        currentPosition++;

        // 2. Insertar las 3 imágenes de esta viga
        const imagenesSeccion = columnaImages[index] || [];

        for (let imgIdx = 0; imgIdx < 3; imgIdx++) {
          const imagen = imagenesSeccion[imgIdx];

          if (imagen && typeof imagen === "string" && imagen.startsWith("data:image")) {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "image",
              src: imagen,
              alt: `Figura 4.6.${index + 1}.${imgIdx + 1} - ${item}`,
              width: 500,
              height: 300,
              caption: `Figura 4.6.${index + 1}.${imgIdx + 1} - Detalle ${imgIdx + 1} de ${item}`,
              alignment: "CENTER",
            });
            console.log(`   🖼️ Insertada imagen ${imgIdx + 1} en posición ${currentPosition}`);
          } else {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "paragraph",
              text: `[IMAGEN ${imgIdx + 1} - Sin imagen disponible]`,
              style: "placeholder",
              alignment: "center",
            });
            console.log(`   ⚠️ Placeholder imagen ${imgIdx + 1} en posición ${currentPosition}`);
          }
          currentPosition++;
        }

        const descriptionColumna = this.sections?.disenoElementos?.descriptionColumna || [];

        if (descriptionColumna[index]) {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: descriptionColumna[index],
            alignment: "JUSTIFIED",
          });
        } else {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: `Descripcion.${index + 1} - sin descripcion disponible`,
            alignment: "JUSTIFIED",
          });
        }

        currentPosition++;

        if (imagenesSeccion[3]) {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "image",
            src: imagenesSeccion[3],
            alt: `Figura diseño `,
            width: 200,
            height: 100,
            caption: `Formula 4.6.${index + 1}`,
          });
        } else {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: `Formula 4.6.${index + 1} figura diseño - sin imagen disponible`,
            style: "placeholder",
            alignment: "center",
          });
          console.log(`   ⚠️ Placeholder ubicación en posición ${currentPosition}`);
        }

        currentPosition++;
        disenoElementos.content.splice(currentPosition, 0, {
          type: "list",
          listType: "bullet",
          items: ["DISEÑO POR FLEXO COMPRESIÓN"],
        });
        currentPosition++;
        disenoElementos.content.splice(currentPosition, 0, {
          type: "paragraph",
          text: "A continuación se muestra los puntos que se utilizan en la construcción de los diagramas de interacción en ambas dirección",
          alignment: "JUSTIFIED",
        });
        currentPosition++;

        if (imagenesSeccion[4]) {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "image",
            src: imagenesSeccion[4],
            alt: `Figura diseño `,
            width: 500,
            height: 300,
            caption: `Figura 4.6.${index + 1} figura diseño`,
          });
        } else {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: `figura 4.6.${index + 1} figura diseño - sin imagen disponible`,
            style: "placeholder",
            alignment: "center",
          });
          console.log(`   ⚠️ Placeholder ubicación en posición ${currentPosition}`);
        }
        currentPosition++;
        console.log(`✅ Columna ${index + 1} completada`);
      }
    }

    console.log("✅ Listas e imágenes de vigas insertadas correctamente");

    // ==================== DISEÑO DE PLACAS ========================
    console.log("🔍 ===== INICIANDO TRANSFORMACIÓN DE PLACAS =====");
    console.log("📦 this.previews.placaImages:", this.previews?.placaImages);
    console.log("📦 this.sections.disenoElementos.namePlaca:", this.sections?.disenoElementos?.namePlaca);

    // Buscar el encabezado de la sección 4.7
    const idx47 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text && item.text.includes("4.7 DISEÑO DE PLACA"),
    );

    console.log(`🔍 Índice del heading 4.7: ${idx47}`);

    if (idx47 === -1) {
      console.warn("⚠️ No se encontró el encabezado 4.7 DISEÑO DE PLACA");
    }

    // Buscar el párrafo de referencia
    const paragraphPlacasIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx47 &&
        item.type === "paragraph" &&
        item.text?.includes(
          "El funcionamiento de las placas se centra en su capacidad para distribuir y transferir cargas",
        ),
    );

    // Determinar punto de inserción
    let pntInsercionPlacas = idx47 + 1;
    if (paragraphPlacasIdx !== -1) {
      pntInsercionPlacas = paragraphPlacasIdx + 1;
      console.log(`✅ Párrafo de placas encontrado en índice: ${paragraphPlacasIdx}`);
    } else {
      console.log(`📋 No se encontró el párrafo específico, se insertará después del heading`);
    }

    // Obtener el texto de las placas del store
    const listPlacas = this.sections?.disenoElementos?.namePlaca || "";
    console.log("📋 listPlacas raw:", JSON.stringify(listPlacas));

    if (!listPlacas.trim()) {
      console.log("📝 No hay texto de Placas para agregar");
    }

    // Convertir el texto en array de items
    const itemsArray = listPlacas
      .split("\n")
      .map((linea) => linea.trim())
      .filter((linea) => linea.length > 0);

    console.log(`📋 itemsArray (${itemsArray.length} items):`, itemsArray);

    if (itemsArray.length !== 0) {
      // Obtener las imágenes del store
      const placaImages = this.previews?.placaImages || [];
      console.log(`🖼️ placaImages length: ${placaImages.length}`);

      // INSERTAR las estructuras completas para cada placa
      let currentPosition = pntInsercionPlacas;

      for (let placaIdx = 0; placaIdx < itemsArray.length; placaIdx++) {
        const item = itemsArray[placaIdx];
        console.log(`\n📌 Procesando placa ${placaIdx + 1}: "${item}"`);

        const imagenesSeccion = placaImages[placaIdx] || [];

        // 1. Insertar la lista con el texto de la placa
        disenoElementos.content.splice(currentPosition, 0, {
          type: "list",
          listType: "bullet",
          items: [item],
        });
        console.log(`   ➕ Insertada lista en posición ${currentPosition}`);
        currentPosition++;

        // 2. Insertar imagen de ubicación (índice 0)
        if (imagenesSeccion[0]) {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "image",
            src: imagenesSeccion[0],
            alt: `Ubicación de placa ${placaIdx + 1}`,
            width: 500,
            height: 300,
            caption: `Ubicación de placa a diseñar - ${item}`,
            alignment: "CENTER",
          });
          console.log(`   🖼️ Insertada imagen ubicación en posición ${currentPosition}`);
        } else {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: "[IMAGEN DE UBICACIÓN - Sin imagen disponible]",
            style: "placeholder",
            alignment: "CENTER",
          });
          console.log(`   ⚠️ Placeholder ubicación en posición ${currentPosition}`);
        }
        currentPosition++;

        // 3. Insertar texto "Diseño de placa 1"
        disenoElementos.content.splice(currentPosition, 0, {
          type: "paragraph",
          text: "Diseño de placa 1",
          alignment: "justified",
          bold: true,
        });
        console.log(`   📝 Insertado texto "Diseño de placa 1" en posición ${currentPosition}`);
        currentPosition++;

        // 4. Insertar imágenes 1-7 (índices 1 a 7)
        for (let imgIdx = 1; imgIdx < 8; imgIdx++) {
          if (imagenesSeccion[imgIdx]) {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "image",
              src: imagenesSeccion[imgIdx],
              alt: `Diseño de placa ${placaIdx + 1} - Imagen ${imgIdx}`,
              width: 600,
              height: 300,
              caption: `Figura de diseño ${imgIdx} - ${item}`,
              alignment: "CENTER",
            });
            console.log(`   🖼️ Insertada imagen ${imgIdx} en posición ${currentPosition}`);
          } else {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "paragraph",
              text: `[IMAGEN ${imgIdx} - Sin imagen disponible]`,
              style: "placeholder",
              alignment: "CENTER",
            });
            console.log(`   ⚠️ Placeholder imagen ${imgIdx} en posición ${currentPosition}`);
          }
          currentPosition++;
        }

        // 5. Insertar texto "DISEÑO DE CORTE"
        disenoElementos.content.splice(currentPosition, 0, {
          type: "paragraph",
          text: "DISEÑO DE CORTE",
          alignment: "justified",
          bold: true,
        });
        console.log(`   📝 Insertado "DISEÑO DE CORTE" en posición ${currentPosition}`);
        currentPosition++;

        // 6. Insertar imagen de corte (índice 8)
        if (imagenesSeccion[8]) {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "image",
            src: imagenesSeccion[8],
            alt: `Diseño de corte - ${item}`,
            width: 500,
            height: 300,
            caption: `Diseño de corte - ${item}`,
            alignment: "CENTER",
          });
          console.log(`   🖼️ Insertada imagen de corte en posición ${currentPosition}`);
        } else {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: "[IMAGEN DE CORTE - Sin imagen disponible]",
            style: "placeholder",
            alignment: "CENTER",
          });
          console.log(`   ⚠️ Placeholder imagen de corte en posición ${currentPosition}`);
        }
        currentPosition++;

        // 7. Insertar texto "VERIFICACIÓN DE DIAGRAMA DE ITERACIÓN"
        disenoElementos.content.splice(currentPosition, 0, {
          type: "paragraph",
          text: "VERIFICACIÓN DE DIAGRAMA DE ITERACIÓN",
          alignment: "justified",
          bold: true,
        });
        console.log(`   📝 Insertado "VERIFICACIÓN DE DIAGRAMA" en posición ${currentPosition}`);
        currentPosition++;

        if (imagenesSeccion[9]) {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "image",
            src: imagenesSeccion[9],
            alt: `Verificación diagrama ${placaIdx + 1} - Imagen 10`,
            width: 450,
            height: 450,
            caption: `Verificación de diagrama 10 - ${item}`,
            alignment: "CENTER",
          });
          console.log(`   🖼️ Insertada imagen diagrama 9 en posición ${currentPosition}`);
        } else {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: `[IMAGEN DIAGRAMA 9 - Sin imagen disponible]`,
            style: "placeholder",
            alignment: "CENTER",
          });
          console.log(`   ⚠️ Placeholder diagrama 10 en posición ${currentPosition}`);
        }

        currentPosition++;

        // 8. Insertar imágenes 9-14 (índices 9 a 14)
        for (let imgIdx = 10; imgIdx < 14; imgIdx++) {
          if (imagenesSeccion[imgIdx]) {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "image",
              src: imagenesSeccion[imgIdx],
              alt: `Verificación diagrama ${placaIdx + 1} - Imagen ${imgIdx - 8}`,
              width: 600,
              height: 300,
              caption: `Verificación de diagrama ${imgIdx - 8} - ${item}`,
              alignment: "CENTER",
            });
            console.log(`   🖼️ Insertada imagen diagrama ${imgIdx - 8} en posición ${currentPosition}`);
          } else {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "paragraph",
              text: `[IMAGEN DIAGRAMA ${imgIdx - 8} - Sin imagen disponible]`,
              style: "placeholder",
              alignment: "CENTER",
            });
            console.log(`   ⚠️ Placeholder diagrama ${imgIdx - 8} en posición ${currentPosition}`);
          }
          currentPosition++;
        }

        // Espacio entre placas
        if (placaIdx < itemsArray.length - 1) {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: "",
          });
          console.log(`   📄 Espacio insertado en posición ${currentPosition}`);
          currentPosition++;
        }

        console.log(`✅ Placa ${placaIdx + 1} completada`);
      }

      console.log("✅ Listas e imágenes de placas insertadas correctamente");
    }

    // ======================== DISEÑO DE MURO DE CONCRETO ============================

    const idx48 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text === "4.8 DISEÑO DE MURO CONCRETO",
    );
    const disenoConcretoParagraphIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx48 &&
        item.type === "paragraph" &&
        item.text &&
        item.text.includes(
          "Estos muros se diseñan siguiendo normas técnicas como la Norma E.060 (Concreto Armado) y la Norma E.030 (Diseño Sismorresistente) del Reglamento Nacional de Edificaciones del Perú.",
        ),
    );
    const disenoMuroConcretoImages = this.previews.disenoMuroConcretoImages || [];

    if (disenoConcretoParagraphIdx !== -1) {
      let indice = disenoConcretoParagraphIdx + 1;
      const concretoCaption = ["M22(0.70TN-M)", "M33(0.71TN-M)", "V23(0.78TN-M)", "V13(0.025TN-M)"];

      for (let index = 0; index < 4; index++) {
        if (disenoMuroConcretoImages[index]) {
          disenoElementos.content.splice(indice, 0, {
            type: "image",
            src: disenoMuroConcretoImages[index],
            alignment: "CENTER",
            width: 500,
            height: 280,
            caption: concretoCaption[index],
          });
        } else {
          disenoElementos.content.splice(indice, 0, {
            type: "paragraph",
            text: `[IMAGEN  ${index} - Sin imagen disponible]`,
            style: "placeholder",
            alignment: "CENTER",
          });
          console.log(`   ⚠️ Placeholder diagrama ${index} en posición ${indice}`);
        }

        indice++;
      }

      for (let idx = 4; idx < 6; idx++) {
        if (disenoMuroConcretoImages[idx]) {
          disenoElementos.content.splice(indice, 0, {
            type: "image",
            src: disenoMuroConcretoImages[idx],
            alignment: "CENTER",
            width: 500,
            height: 750,
            caption: concretoCaption[idx],
          });
        } else {
          disenoElementos.content.splice(indice, 0, {
            type: "paragraph",
            text: `[IMAGEN  ${idx} - Sin imagen disponible]`,
            style: "placeholder",
            alignment: "CENTER",
          });
          console.log(`   ⚠️ Placeholder diagrama ${idx} en posición ${indice}`);
        }
        indice++;
      }
    }

    // ======================== DISEÑO DE ESCALERA ============================

    const idx49 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text === "4.9 DISEÑO DE ESCALERA",
    );
    const disenoEscaleraParagraphIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx49 &&
        item.type === "paragraph" &&
        item.text.includes(
          "El diseño estructural de una escalera tiene como finalidad garantizar la resistencia, estabilidad y seguridad del sistema de circulación vertical frente a las cargas que actúan sobre ella.",
        ),
    );
    const disenoEscaleraImages = this.previews.disenoEscaleraImages || [];

    if (disenoEscaleraParagraphIdx !== -1) {
      console.log("Parrafo encontrado");
      const escalerasCaption = ["M22 (1.23TN-M)", "M33 (0.12TN-M)", "V23 (1.47TN-M)", "V13 (1.66TN-M)"];
      let indice = disenoEscaleraParagraphIdx + 1;
      for (let index = 0; index < 4; index++) {
        if (disenoEscaleraImages[index]) {
          disenoElementos.content.splice(indice, 0, {
            type: "image",
            src: disenoEscaleraImages[index],
            alignment: "CENTER",
            width: 500,
            height: 280,
            caption: escalerasCaption[index],
          });
        } else {
          disenoElementos.content.splice(indice, 0, {
            type: "paragraph",
            text: `[IMAGEN  ${index} - Sin imagen disponible]`,
            style: "placeholder",
            alignment: "CENTER",
          });
          console.log(`   ⚠️ Placeholder diagrama ${index} en posición ${indice}`);
        }
        indice++;
      }
      disenoElementos.content.splice(indice, 0, {
        type: "image",
        src: disenoEscaleraImages[4],
        alignment: "CENTER",
        width: 500,
        height: 750,
        caption: "",
      });
    }

    // ======================== DISEÑO DE CISTERNA ============================

    const idx410 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text === "4.10 DISEÑO DE CISTERNA",
    );
    const disenoCisternaImages = this.previews.disenoCisternaImages || [];

    if (idx410 !== -1) {
      console.log("Headin diseño de cisterna encontrado");
      const cisternasCaption = ["M22 (08.75TN-M)", "M33(1.289TN-M2)", "V23 (0.0892TN)", "V13 (1.205TN)"];
      let indice = idx410 + 1;

      for (let index = 0; index < 4; index++) {
        if (disenoCisternaImages[index]) {
          disenoElementos.content.splice(indice, 0, {
            type: "image",
            src: disenoCisternaImages[index],
            alignment: "CENTER",
            width: 500,
            height: 280,
            caption: cisternasCaption[index],
          });
        } else {
          disenoElementos.content.splice(indice, 0, {
            type: "paragraph",
            text: `[IMAGEN diseño de cisterna ${index} - Sin imagen disponible]`,
            style: "placeholder",
            alignment: "CENTER",
          });
          console.log(`⚠️ Placeholder diagrama ${index} en posición ${indice}`);
        }
        indice++;
      }

      for (let idx = 4; idx < 6; idx++) {
        if (disenoCisternaImages[idx]) {
          disenoElementos.content.splice(indice, 0, {
            type: "image",
            src: disenoCisternaImages[idx],
            alignment: "CENTER",
            width: 500,
            height: 750,
            caption: "",
          });
        }
        indice++;
      }
    }

    // ======================== DISEÑO DE CIMIENTO CORRIDO ============================

    const idx411 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text === "4.11 DISEÑO DE CIMIENTO CORRIDO",
    );

    const disenoCimientoParagraphIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx411 &&
        item.type === "paragraph" &&
        item.text.includes(
          "El cimiento corrido es un tipo de cimentación superficial que se utiliza principalmente en edificaciones ligeras y viviendas de uno o dos pisos.",
        ),
    );

    const disenoSimientoCorridoImages = this.previews.disenoSimientoCorridoImages || [];

    if (disenoCimientoParagraphIdx !== -1) {
      console.log("Parrafo de cimiento corrido encontrado");
      const contentCimiento = [];
      const cimientoCaption = [];

      disenoSimientoCorridoImages.forEach((src, i) => {
        if (src) {
          if (i === 0) {
            contentCimiento.push({
              type: "image",
              src,
              alignment: "CENTER",
              width: 500,
              height: 280,
              caption: cimientoCaption[i],
            });
          } else {
            contentCimiento.push({
              type: "image",
              src,
              alignment: "CENTER",
              width: 600,
              height: 900,
              caption: cimientoCaption[i],
            });
          }
        }
      });
      disenoElementos.content.splice(disenoCimientoParagraphIdx + 1, 0, ...contentCimiento);

      console.log("FIN DE INGRESO DE LAS IMAGENES DE CIMIENTO CORRIDO");
    }

    // ==================== DISEÑO DE CIMENTACION ========================
    console.log("🔍 ===== INICIANDO TRANSFORMACIÓN DE CIMENTACION =====");
    console.log("📦 this.previews.cimentacionImages:", this.previews?.cimentacionImages);
    console.log("📦 this.sections.disenoElementos.nameCimentacion:", this.sections?.disenoElementos?.nameCimentacion);

    // Buscar el encabezado de la sección 4.5
    const idx412 = disenoElementos.content.findIndex(
      (item) => item.type === "heading" && item.text && item.text.includes("4.12 DISEÑO DE CIMENTACIÓN"),
    );

    console.log(`🔍 Índice del heading 4.12: ${idx412}`);

    if (idx412 === -1) {
      console.warn("⚠️ No se encontró el encabezado 4.12 DISEÑO DE CIMENTACIÓN");
      return;
    }

    // Buscar la lista "Diseño de Viga de 25x45" que servirá como punto de referencia
    const paragraphCimentacionIdx = disenoElementos.content.findIndex(
      (item, i) =>
        i > idx412 &&
        item.type === "paragraph" &&
        item.text.includes(
          "Del ítem 15.2.5 de la norma E.060. Para determinar los esfuerzos en el suelo o las fuerzas en pilotes, ",
        ),
    );

    // Si no encontramos esa lista específica, buscar cualquier lista después del heading
    let pntInsercion = idx412 + 1;
    if (paragraphCimentacionIdx !== -1) {
      pntInsercion = paragraphCimentacionIdx + 1;
      console.log(`✅ Parrafo de cimentacion encontrada en índice: ${paragraphCimentacionIdx}`);
    } else {
      console.log(`📋 No se encontró el parrafo específica, se insertará después del heading`);
    }

    // Obtener el texto de las vigas del store
    const listCimentacion = this.sections?.disenoElementos?.nameCimentacion || "";
    console.log("📋 listCimentacion raw:", JSON.stringify(listCimentacion));

    if (!listCimentacion.trim()) {
      console.log("📝 No hay texto de cimentcacion para agregar");
    }

    if (listCimentacion.trim()) {
      // Convertir el texto en array de items
      const itemsArray = listCimentacion
        .split("\n")
        .map((linea) => linea.trim())
        .filter((linea) => linea.length > 0);

      console.log(`📋 itemsArray (${itemsArray.length} items):`, itemsArray);

      if (itemsArray.length === 0) return;

      // Obtener las imágenes del store
      const cimentacionImages = this.previews?.cimentacionImages || [];

      // INSERTAR las nuevas listas con sus imágenes (sin eliminar nada)
      let currentPosition = pntInsercion;

      for (let index = 0; index < itemsArray.length; index++) {
        const item = itemsArray[index];
        // 1. Insertar la lista con el texto de la viga
        disenoElementos.content.splice(currentPosition, 0, {
          type: "list",
          listType: "bullet",
          items: [item],
        });
        currentPosition++;

        disenoElementos.content.splice(currentPosition, 0, {
          type: "paragraph",
          text: "Consideraciones Generales",
          alignment: "JUSTIFIED",
        });
        currentPosition++;

        // ingresamos los parrafos por defecto
        const parrafoLista = [
          "Según el estudio de suelos se mencionan las características y propiedades del terreno a cimentar:",
          "Tipo de cimentación: Zapatas ",
        ];

        for (let index = 0; index < 2; index++) {
          disenoElementos.content.splice(currentPosition, 0, {
            type: "paragraph",
            text: parrafoLista[index],
            alignment: "JUSTIFIED",
          });
          currentPosition++;
        }

        disenoElementos.content.splice(currentPosition, 0, {
          type: "paragraph",
          text: "Profundidad mínima de cimentación: Df=2.50m desde el NTN",
          alignment: "JUSTIFIED",
        });
        currentPosition++;
        disenoElementos.content.splice(currentPosition, 0, {
          type: "paragraph",
          text: "Capacidad portante admisible: qadm= 15 kg/cm2",
          alignment: "JUSTIFIED",
        });
        currentPosition++;

        // 2. Insertar las 4 imágenes de esta cimentacion
        const imagenesSeccion = cimentacionImages[index] || [];
        const cimentacionCaption = [
          "CARGA MUERTA",
          "CARGA VIVA",
          "CARGA VIVA",
          "SISMO DINÁMICO EN DIRECCIÓN Y",
          "RESULTADO 1",
          "RESULTADO 2",
          "RESULTADO 3",
          "RESULTADO 4",
        ];

        for (let imgIdx = 0; imgIdx < 8; imgIdx++) {
          const imagen = imagenesSeccion[imgIdx];

          if (imagen && typeof imagen === "string" && imagen.startsWith("data:image")) {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "image",
              src: imagen,
              alt: cimentacionCaption[imgIdx],
              width: 500,
              height: 750,
              caption: cimentacionCaption[imgIdx],
              alignment: "CENTER",
            });
            // console.log(`   🖼️ Insertada imagen ${imgIdx + 1} en posición ${currentPosition}`);
          } else {
            disenoElementos.content.splice(currentPosition, 0, {
              type: "paragraph",
              text: `[IMAGEN ${imgIdx + 1} - Sin imagen disponible]`,
              style: "placeholder",
              alignment: "CENTER",
            });
            console.log(`   ⚠️ Placeholder imagen ${imgIdx + 1} en posición ${currentPosition}`);
          }
          currentPosition++;
        }

        // Insertamos el ultimo parrafo de la seccion
        disenoElementos.content.splice(currentPosition, 0, {
          type: "paragraph",
          text: "La zapata Aislada de 2.00x2.00 se usará acero Ø5/8@15cm con su df 2.50 con su peralte de la zapata hz:60 cm ",
          alignment: "JUSTIFIED",
        });
        currentPosition++;
        console.log(`✅ Cimentacion ${index + 1} completada`);
      }
      console.log("✅ Listas e imágenes de vigas insertadas correctamente");
    }
  }

  // ============================================
  // 11. ANALISIS ESTRUCTURALES (Sección 5)
  // ============================================
  transformEstructural(structure) {
    // CONDICIONAR QUE APAREZCA A LA SECCIÓN 5
    const descripciones = this.sections?.estructuraMetalica?.descripcion || {};

    const hayDescripcion =
      (descripciones.ColumnaMetalica || "").trim() ||
      (descripciones.BridaSuperior || "").trim() ||
      (descripciones.BridaInferior || "").trim() ||
      (descripciones.Parante || "").trim() ||
      (descripciones.Diagonal || "").trim() ||
      (descripciones.CorreaMetalica || "").trim();

    const hayImagenAnalisis = !!this.previews.analisisEstructuralSingleImages?.[0];

    const hayImagenesDiseno =
      (this.previews.disenoColumnaMetalica || []).some(Boolean) ||
      (this.previews.disenoBridaSuperior || []).some(Boolean) ||
      (this.previews.disenoBridaInferior || []).some(Boolean) ||
      (this.previews.disenoParante || []).some(Boolean) ||
      (this.previews.disenoDiagonal || []).some(Boolean) ||
      (this.previews.disenoCorreaMetalica || []).some(Boolean);

    const hayContenidoSeccion5 = hayDescripcion || hayImagenAnalisis || hayImagenesDiseno;

    if (!hayContenidoSeccion5) {
      structure.document.sections = structure.document.sections.filter((s) => s.id !== "diseno_estructura");
      return;
    }

    // CONFIGURACIONES DE IMAGENES
    const analisisEstructural = structure.document.sections.find((s) => s.id === "diseno_estructura");
    if (!analisisEstructural) return;
    // FIGURA X
    const idx = analisisEstructural.content.findIndex(
      (item) => item.type === "heading" && item.text === "5.2 Análisis Estructural",
    );

    if (idx !== -1) {
      const img = this.previews.analisisEstructuralSingleImages?.[0];
      if (img) {
        // Insertar después del párrafo que sigue al heading
        analisisEstructural.content.splice(idx + 2, 0, {
          type: "image",
          src: img,
          alignment: "CENTER",
          width: 500,
          height: 440,
          caption: "figura x",
        });
      }
    }
    // FIGURA Y
    // FIGURA y1
    const dinamicoImagesy1 = this.previews.disenoColumnaMetalica || [];
    const idy1 = analisisEstructural.content.findIndex(
      (item) => item.type === "heading" && item.text === "5.2 Análisis Estructural",
    );

    if (idy1 === -1) {
      console.warn("⚠️ No se encontró heading 5.2");
      return;
    }

    // Buscar la lista "Diseño de Columna Metálica"
    const listaConsIdy1 = analisisEstructural.content.findIndex(
      (item, i) => i > idy1 && item.type === "list" && item.items && item.items[0] === "Diseño de Columna Metálica",
    );

    // Insertar figuras después de la lista
    let insertPosy1 = listaConsIdy1 + 1;

    // Figura y11
    if (dinamicoImagesy1[0]) {
      analisisEstructural.content.splice(insertPosy1, 0, {
        type: "image",
        src: dinamicoImagesy1[0],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
      insertPosy1++; // Incrementar posición para la siguiente imagen
    }

    // Figura y12
    if (dinamicoImagesy1[1]) {
      analisisEstructural.content.splice(insertPosy1, 0, {
        type: "image",
        src: dinamicoImagesy1[1],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
    }

    // Descripción breve y1
    const descripciony1 = this.sections?.estructuraMetalica?.descripcion?.ColumnaMetalica || "";

    if (descripciony1.trim()) {
      analisisEstructural.content.splice(insertPosy1 + (dinamicoImagesy1[1] ? 1 : 0), 0, {
        type: "paragraph",
        text: descripciony1,
        alignment: "JUSTIFIED",
      });
    }

    // FIGURA y2
    const dinamicoImagesy2 = this.previews.disenoBridaSuperior || [];
    const idy2 = analisisEstructural.content.findIndex(
      (item) => item.type === "heading" && item.text === "5.2 Análisis Estructural",
    );

    if (idy2 === -1) {
      console.warn("⚠️ No se encontró heading 5.2");
      return;
    }

    const listaConsIdy2 = analisisEstructural.content.findIndex(
      (item, i) => i > idy2 && item.type === "list" && item.items && item.items[0] === "Diseño de Brida Superior",
    );

    // Insertar figuras después de la lista
    let insertPosy2 = listaConsIdy2 + 1;

    // Figura y21
    if (dinamicoImagesy2[0]) {
      analisisEstructural.content.splice(insertPosy2, 0, {
        type: "image",
        src: dinamicoImagesy2[0],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
      insertPosy2++; // Incrementar posición para la siguiente imagen
    }

    // Figura y22
    if (dinamicoImagesy2[1]) {
      analisisEstructural.content.splice(insertPosy2, 0, {
        type: "image",
        src: dinamicoImagesy2[1],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
    }

    // Descripción breve y2
    const descripciony2 = this.sections?.estructuraMetalica?.descripcion?.BridaSuperior || "";

    if (descripciony2.trim()) {
      analisisEstructural.content.splice(insertPosy2 + (dinamicoImagesy2[1] ? 1 : 0), 0, {
        type: "paragraph",
        text: descripciony2,
        alignment: "JUSTIFIED",
      });
    }

    // FIGURA y3
    const dinamicoImagesy3 = this.previews.disenoBridaInferior || [];
    const idy3 = analisisEstructural.content.findIndex(
      (item) => item.type === "heading" && item.text === "5.2 Análisis Estructural",
    );

    if (idy3 === -1) {
      console.warn("⚠️ No se encontró heading 5.2");
      return;
    }

    const listaConsIdy3 = analisisEstructural.content.findIndex(
      (item, i) => i > idy3 && item.type === "list" && item.items && item.items[0] === "Diseño de Brida Inferior",
    );

    // Insertar figuras después de la lista
    let insertPosy3 = listaConsIdy3 + 1;

    // Figura y31
    if (dinamicoImagesy3[0]) {
      analisisEstructural.content.splice(insertPosy3, 0, {
        type: "image",
        src: dinamicoImagesy3[0],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
      insertPosy3++; // Incrementar posición para la siguiente imagen
    }

    // Figura y32
    if (dinamicoImagesy3[1]) {
      analisisEstructural.content.splice(insertPosy3, 0, {
        type: "image",
        src: dinamicoImagesy3[1],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
    }

    // Descripción breve y3
    const descripciony3 = this.sections?.estructuraMetalica?.descripcion?.BridaInferior || "";

    if (descripciony3.trim()) {
      analisisEstructural.content.splice(insertPosy3 + (dinamicoImagesy3[1] ? 1 : 0), 0, {
        type: "paragraph",
        text: descripciony3,
        alignment: "JUSTIFIED",
      });
    }

    // FIGURA y4
    const dinamicoImagesy4 = this.previews.disenoParante || [];
    const idy4 = analisisEstructural.content.findIndex(
      (item) => item.type === "heading" && item.text === "5.2 Análisis Estructural",
    );

    if (idy4 === -1) {
      console.warn("⚠️ No se encontró heading 5.2");
      return;
    }

    const listaConsIdy4 = analisisEstructural.content.findIndex(
      (item, i) => i > idy4 && item.type === "list" && item.items && item.items[0] === "Diseño de Parante",
    );

    // Insertar figuras después de la lista
    let insertPosy4 = listaConsIdy4 + 1;

    // Figura y41
    if (dinamicoImagesy4[0]) {
      analisisEstructural.content.splice(insertPosy4, 0, {
        type: "image",
        src: dinamicoImagesy4[0],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
      insertPosy4++; // Incrementar posición para la siguiente imagen
    }

    // Figura y42
    if (dinamicoImagesy4[1]) {
      analisisEstructural.content.splice(insertPosy4, 0, {
        type: "image",
        src: dinamicoImagesy4[1],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
    }

    // Descripción breve y4
    const descripciony4 = this.sections?.estructuraMetalica?.descripcion?.Parante || "";

    if (descripciony4.trim()) {
      analisisEstructural.content.splice(insertPosy4 + (dinamicoImagesy4[1] ? 1 : 0), 0, {
        type: "paragraph",
        text: descripciony4,
        alignment: "JUSTIFIED",
      });
    }

    // FIGURA y5
    const dinamicoImagesy5 = this.previews.disenoDiagonal || [];
    const idy5 = analisisEstructural.content.findIndex(
      (item) => item.type === "heading" && item.text === "5.2 Análisis Estructural",
    );

    if (idy5 === -1) {
      console.warn("⚠️ No se encontró heading 5.2");
      return;
    }

    const listaConsIdy5 = analisisEstructural.content.findIndex(
      (item, i) => i > idy5 && item.type === "list" && item.items && item.items[0] === "Diseño de Diagonal",
    );

    // Insertar figuras después de la lista
    let insertPosy5 = listaConsIdy5 + 1;

    // Figura y51
    if (dinamicoImagesy5[0]) {
      analisisEstructural.content.splice(insertPosy5, 0, {
        type: "image",
        src: dinamicoImagesy5[0],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
      insertPosy5++; // Incrementar posición para la siguiente imagen
    }

    // Figura y52
    if (dinamicoImagesy5[1]) {
      analisisEstructural.content.splice(insertPosy5, 0, {
        type: "image",
        src: dinamicoImagesy5[1],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
    }

    // Descripción breve y4
    const descripciony5 = this.sections?.estructuraMetalica?.descripcion?.Diagonal || "";

    if (descripciony5.trim()) {
      analisisEstructural.content.splice(insertPosy5 + (dinamicoImagesy5[1] ? 1 : 0), 0, {
        type: "paragraph",
        text: descripciony5,
        alignment: "JUSTIFIED",
      });
    }

    // FIGURA y6
    const dinamicoImagesy6 = this.previews.disenoCorreaMetalica || [];
    const idy6 = analisisEstructural.content.findIndex(
      (item) => item.type === "heading" && item.text === "5.2 Análisis Estructural",
    );

    if (idy6 === -1) {
      console.warn("⚠️ No se encontró heading 5.2");
      return;
    }

    const listaConsIdy6 = analisisEstructural.content.findIndex(
      (item, i) => i > idy6 && item.type === "list" && item.items && item.items[0] === "Diseño de Correa Metálica",
    );

    // Insertar figuras después de la lista
    let insertPosy6 = listaConsIdy6 + 1;

    // Figura y61
    if (dinamicoImagesy6[0]) {
      analisisEstructural.content.splice(insertPosy6, 0, {
        type: "image",
        src: dinamicoImagesy6[0],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
      insertPosy6++; // Incrementar posición para la siguiente imagen
    }

    // Figura y62
    if (dinamicoImagesy6[1]) {
      analisisEstructural.content.splice(insertPosy6, 0, {
        type: "image",
        src: dinamicoImagesy6[1],
        alignment: "CENTER",
        width: 500,
        height: 500,
        caption: "Por definir",
      });
    }

    // Descripción breve y4
    const descripciony6 = this.sections?.estructuraMetalica?.descripcion?.CorreaMetalica || "";

    if (descripciony6.trim()) {
      analisisEstructural.content.splice(insertPosy6 + (dinamicoImagesy6[1] ? 1 : 0), 0, {
        type: "paragraph",
        text: descripciony6,
        alignment: "JUSTIFIED",
      });
    }
  }

  // ============================================
  // 11. CONLCUSIONES (Sección 6)
  // ============================================
  transformConclusiones(structure) {
    const conclusionesSection = structure.document.sections.find((s) => s.id === "conclusiones");

    if (!conclusionesSection) return;

    const texto = this.sections?.conclusiones?.descripcion || "";

    if (!texto.trim()) return;

    const headingIndex = conclusionesSection.content.findIndex((item) => item.type === "heading");

    const listConclusionesIdx = conclusionesSection.content.findIndex(
      (item, i) =>
        i > headingIndex &&
        item.type === "list" &&
        item.items &&
        item.items[3] ===
          "El Proyecto Estructural cumple con lo indicado en la Norma Sísmica vigente y con las Normas Técnicas correspondientes por lo que concluimos que la Estructura tiene una buena rigidez y resistencia sísmica.",
    );

    const items = texto
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      .filter((linea) => linea !== "");

    const bloqueLista = {
      type: "list",
      listType: "bullet",
      items,
    };

    if (listConclusionesIdx === -1) {
      conclusionesSection.content = [bloqueLista];
      return;
    }

    conclusionesSection.content.splice(
      listConclusionesIdx + 1,
      conclusionesSection.content.length - (listConclusionesIdx + 1),
      bloqueLista,
    );
  }

  // RECOMENDACIONES
  transformRecomendaciones(structure) {
    const recomendacionesSection = structure.document.sections.find((s) => s.id === "recomendaciones");
    if (!recomendacionesSection) return;

    const texto = this.sections?.recomendaciones?.descripcion || "";

    if (!texto.trim()) return;

    const headingIndex = recomendacionesSection.content.findIndex((item) => item.type === "heading");

    const listRecomendacionesIdx = recomendacionesSection.content.findIndex(
      (item, i) =>
        i > headingIndex &&
        item.type === "list" &&
        item.items &&
        item.items[1] ===
          "A su vez, se recomienda tener en cuenta y respetar las juntas de separación establecidas por la normativa para evitar daños contiguos entre la edificación que se encuentren cercanos cuando se presenten fuerzas sísmicas. Asimismo, contemplar todos los protocolos de calidad para la edificación a construir y de esta forma garantizar un adecuado servicio.",
    );

    const items = texto
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      .filter((linea) => linea !== "");

    const bloqueLista = {
      type: "list",
      listType: "bullet",
      items,
    };

    if (listRecomendacionesIdx === -1) {
      recomendacionesSection.content = [bloqueLista];
      return;
    }

    recomendacionesSection.content.splice(
      listRecomendacionesIdx + 1,
      recomendacionesSection.content.length - (listRecomendacionesIdx + 1),
      bloqueLista,
    );
  }

  // RENUMERAR LAS SECCIONES
  renumerarSeccionesFinales(structure) {
    const existeSeccion5 = structure.document.sections.some((s) => s.id === "diseno_estructura");

    const conclusiones = structure.document.sections.find((s) => s.id === "conclusiones");

    const recomendaciones = structure.document.sections.find((s) => s.id === "recomendaciones");

    if (existeSeccion5) {
      if (conclusiones) conclusiones.title = "6. CONCLUSIONES";
      if (recomendaciones) recomendaciones.title = "7. RECOMENDACIONES";
    } else {
      if (conclusiones) conclusiones.title = "5. CONCLUSIONES";
      if (recomendaciones) recomendaciones.title = "6. RECOMENDACIONES";
    }
  }
}
