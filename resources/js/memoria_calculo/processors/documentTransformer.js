// processors/documentTransformer.js - Transformaciones dinámicas para exportación Word

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
        const generalidades = structure.document.sections.find(s => s.id === "generalidades");
        if (!generalidades) return;

        const idx12 = generalidades.content.findIndex(item =>
            item.type === "heading" && String(item.text || "").startsWith("1.2.")
        );

        if (idx12 === -1) return;

        const imgIdx = generalidades.content.findIndex((item, i) => i > idx12 && item.type === "image");
        if (imgIdx === -1) return;

        // Obtener datos de ubicación
        const deptName = this.cover.ubigeo.department || "HUANUCO";
        const provName = this.cover.ubigeo.province || "HUANUCO";
        const distSelected = this.cover.ubigeo.district || "";

        // Obtener distritos de la provincia
        const deptData = this.ubigeoData.find(d => d.name === deptName);
        const provData = deptData?.provinces.find(p => p.name === provName);
        const districtsList = provData && Array.isArray(provData.districts) && provData.districts.length > 0
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
                alignment: "LEFT"
            });

            // Zona Sísmica (Merged)
            if (index === 0) {
                row.push({ text: "2", rowSpan: districtsList.length, bold: true, size: 24 });
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
                { header: "ÁMBITO", width: 20 }
            ],
            rows: tableRows
        });
    }

    // ============================================
    // 2. IMÁGENES POR PISO (Sección 1.4)
    // ============================================
    transformImagenesPiso(structure) {
        const generalidades = structure.document.sections.find(s => s.id === "generalidades");
        if (!generalidades) return;

        const idx14 = generalidades.content.findIndex(item =>
            item.type === "heading" && String(item.text || "").startsWith("1.4.")
        );

        if (idx14 === -1) return;

        const insertPos = idx14 + 2;
        let currentInsertPos = insertPos;

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
            ["Techo", structuralDetails.roof]
        ];

        generalidades.content.splice(currentInsertPos, 0, {
            type: "table",
            title: "RESUMEN ESTRUCTURAL",
            columns: [
                { header: "PARÁMETRO", width: 20 },
                { header: "DESCRIPCIÓN", width: 80 }
            ],
            rows: tableRows
        });
    }

    // ============================================
    // 3. ZONIFICACIÓN SÍSMICA (Sección 1.3.1)
    // ============================================
    transformZonificacion(structure) {
        const generalidades = structure.document.sections.find(s => s.id === "generalidades");
        if (!generalidades) return;

        const idx131 = generalidades.content.findIndex(item =>
            item.type === "heading" && String(item.text || "").startsWith("1.3.1.")
        );

        if (idx131 === -1) return;

        const zoneFactorMap = {
            "1": "0.10",
            "2": "0.25",
            "3": "0.35",
            "4": "0.45"
        };

        const zone = String(this.cover.seismicZone || "").trim();
        const projectZone = Object.prototype.hasOwnProperty.call(zoneFactorMap, zone) ? zone : "2";
        const projectZFactor = zoneFactorMap[projectZone];

        // Actualizar cover
        this.cover.seismicZone = projectZone;
        this.cover.seismicZoneFactor = projectZFactor;

        const deptName = this.cover.ubigeo.department || "HUANUCO";
        const provName = this.cover.ubigeo.province || "HUANUCO";
        const distName = this.cover.ubigeo.district || "PILLCO MARCA";

        // Tabla de factores Z
        const zFactors = [
            { zone: "4", z: zoneFactorMap["4"] },
            { zone: "3", z: zoneFactorMap["3"] },
            { zone: "2", z: zoneFactorMap["2"] },
            { zone: "1", z: zoneFactorMap["1"] }
        ];

        const zTableRows = zFactors.map(f => [
            {
                text: f.zone,
                fill: f.zone === projectZone ? "00B0F0" : null,
                color: f.zone === projectZone ? "FFFFFF" : "000000",
                bold: f.zone === projectZone
            },
            {
                text: f.z,
                fill: f.zone === projectZone ? "00B0F0" : null,
                color: f.zone === projectZone ? "FFFFFF" : "000000",
                bold: f.zone === projectZone
            }
        ]);

        // Layout mezclado (mapa + info)
        const layoutTable = {
            type: "table",
            widthPercent: 100,
            indentSize: 0,
            noBorders: true,
            columns: [
                { width: 55 }, // Mapa
                { width: 45 }  // Info + Tabla Z
            ],
            rows: [
                [
                    // Celda Izquierda: Mapa
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/mapazonificacion.png",
                        width: 320,
                        height: 380,
                        alignment: "CENTER"
                    },
                    // Celda Derecha: Info + Tabla
                    {
                        stack: [
                            {
                                text: `DEPARTAMENTO: ${deptName}\nPROVINCIA: ${provName}\nDISTRITO: ${distName}`,
                                bold: true,
                                size: 16,
                                alignment: "LEFT",
                                spacing: { after: 200 }
                            },
                            {
                                type: "table",
                                title: "Tabla N°6\nFACTORES DE ZONA 'Z'",
                                widthPercent: 90,
                                columns: [
                                    { header: "ZONA", width: 50 },
                                    { header: "Z", width: 50 }
                                ],
                                rows: zTableRows
                            }
                        ]
                    }
                ]
            ]
        };

        // Actualizar párrafo
        const idx131Paragraph = generalidades.content.findIndex((item, i) =>
            i > idx131 && item.type === "paragraph"
        );
        if (idx131Paragraph !== -1) {
            generalidades.content[idx131Paragraph] = {
                type: "paragraph",
                text: `De acuerdo con el mapa del Reglamento Nacional de Edificaciones-Norma E.030, el área de estudio se localiza en la zona ${projectZone}, correspondiéndole un factor de Z=${projectZFactor}.`,
                alignment: "JUSTIFIED"
            };
        }

        // Reemplazar imagen
        const mapImgIdx = generalidades.content.findIndex((item, i) => i > idx131 && item.type === "image");
        if (mapImgIdx !== -1) {
            generalidades.content.splice(mapImgIdx, 1, layoutTable);
        }
    }

    // ============================================
    // 4. PARÁMETROS DE SUELO (Sección 1.3.2)
    // ============================================
    transformParametrosSuelo(structure) {
        const generalidades = structure.document.sections.find(s => s.id === "generalidades");
        if (!generalidades) return;

        const idx132 = generalidades.content.findIndex(item =>
            item.type === "heading" && String(item.text || "").startsWith("1.3.2.")
        );

        if (idx132 === -1) return;

        const projectZone = this.cover.seismicZone || "2";
        const zoneLabels = { "4": "Z4", "3": "Z3", "2": "Z2", "1": "Z1" };
        const currentZoneLabel = zoneLabels[projectZone] || "Z2";

        const selectedSoilFactor = (this.cover.soilFactor || "S2").toUpperCase();
        const selectedPeriod = this.cover.soilPeriod === "Tl" ? "Tl" : "Tp";
        const selectedS = ["S0", "S1", "S2", "S3"].includes(selectedSoilFactor) ? selectedSoilFactor : "S2";
        const selectedT = selectedPeriod;

        const soilFactorMatrix = {
            Z4: { S0: "0.80", S1: "1.00", S2: "1.05", S3: "1.10" },
            Z3: { S0: "0.80", S1: "1.00", S2: "1.15", S3: "1.20" },
            Z2: { S0: "0.80", S1: "1.00", S2: "1.20", S3: "1.40" },
            Z1: { S0: "0.80", S1: "1.00", S2: "1.60", S3: "2.00" }
        };

        const periodMatrix = {
            Tp: { S0: "0.3", S1: "0.4", S2: "0.6", S3: "1.0" },
            Tl: { S0: "3.0", S1: "2.5", S2: "2.0", S3: "1.6" }
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
        const idx132Paragraph = generalidades.content.findIndex((item, i) =>
            i > idx132 && item.type === "paragraph"
        );
        if (idx132Paragraph !== -1) {
            generalidades.content[idx132Paragraph] = {
                type: "paragraph",
                text: `Para efectos de la aplicación de la norma E-0.30 de diseño sismo-resistente, se adopta el perfil de suelo ${selectedS}. Para la zona ${projectZone}, el factor de suelo correspondiente es ${selectedSValue}. Asimismo, para el periodo seleccionado ${selectedT}, el valor correspondiente es ${selectedTValue}s según la Tabla N°4. Los valores de S, Tp y Tl se muestran en las Tablas N°3 y N°4 (NORMA E-030 - DISEÑO SISMORESISTENTE).`,
                alignment: "JUSTIFIED"
            };
        }

        // Generar tabla de factores de suelo
        const factorTableRows = ["Z4", "Z3", "Z2", "Z1"].map(zone => [
            {
                text: zone,
                fill: zone === currentZoneLabel ? lightRed : null,
                color: zone === currentZoneLabel ? hardRed : "000000",
                bold: zone === currentZoneLabel
            },
            ...["S0", "S1", "S2", "S3"].map(sKey => {
                const isRow = zone === currentZoneLabel;
                const isCol = sKey === selectedS;
                const isIntersection = isRow && isCol;
                return {
                    text: soilFactorMatrix[zone][sKey],
                    fill: isIntersection ? hardRed : (isRow || isCol ? lightRed : null),
                    color: isIntersection ? "FFFFFF" : (isRow || isCol ? hardRed : "000000"),
                    bold: isIntersection || isRow || isCol
                };
            })
        ]);

        // Generar tabla de periodos
        const periodTableRows = ["Tp", "Tl"].map(periodKey => [
            {
                text: periodKey === "Tp" ? "Tp(s)" : "Tl(s)",
                fill: periodKey === selectedT ? lightRed : null,
                color: periodKey === selectedT ? hardRed : "000000",
                bold: periodKey === selectedT
            },
            ...["S0", "S1", "S2", "S3"].map(sKey => {
                const isRow = periodKey === selectedT;
                const isCol = sKey === selectedS;
                const isIntersection = isRow && isCol;
                return {
                    text: periodMatrix[periodKey][sKey],
                    fill: isIntersection ? hardRed : (isRow || isCol ? lightRed : null),
                    color: isIntersection ? "FFFFFF" : (isRow || isCol ? hardRed : "000000"),
                    bold: isIntersection || isRow || isCol
                };
            })
        ]);

        const factorTable = {
            type: "table",
            title: "Tabla N° 3\nFACTOR DE SUELO \"S\"",
            widthPercent: 90,
            indentSize: 500,
            columns: [
                { header: "ZONA / SUELO", width: 22 },
                { header: "S0", width: 19.5, fill: selectedS === "S0" ? lightRed : null, color: selectedS === "S0" ? hardRed : "000000" },
                { header: "S1", width: 19.5, fill: selectedS === "S1" ? lightRed : null, color: selectedS === "S1" ? hardRed : "000000" },
                { header: "S2", width: 19.5, fill: selectedS === "S2" ? lightRed : null, color: selectedS === "S2" ? hardRed : "000000" },
                { header: "S3", width: 19.5, fill: selectedS === "S3" ? lightRed : null, color: selectedS === "S3" ? hardRed : "000000" }
            ],
            rows: factorTableRows
        };

        const periodTable = {
            type: "table",
            title: "Tabla N° 4\nPERÍODOS \"Tp\" Y \"TL\"",
            widthPercent: 90,
            indentSize: 500,
            columns: [
                { header: "Perfil de suelo", width: 22 },
                { header: "S0", width: 19.5, fill: selectedS === "S0" ? lightRed : null, color: selectedS === "S0" ? hardRed : "000000" },
                { header: "S1", width: 19.5, fill: selectedS === "S1" ? lightRed : null, color: selectedS === "S1" ? hardRed : "000000" },
                { header: "S2", width: 19.5, fill: selectedS === "S2" ? lightRed : null, color: selectedS === "S2" ? hardRed : "000000" },
                { header: "S3", width: 19.5, fill: selectedS === "S3" ? lightRed : null, color: selectedS === "S3" ? hardRed : "000000" }
            ],
            rows: periodTableRows
        };

        // Reemplazar imágenes por tablas
        const firstSoilImageIdx = generalidades.content.findIndex((item, i) =>
            i > idx132 && item.type === "image" && item.src === "/assets/img/memoriacalculos/factorsuelo.png"
        );
        const secondSoilImageIdx = generalidades.content.findIndex((item, i) =>
            i > idx132 && item.type === "image" && item.src === "/assets/img/memoriacalculos/periodos.png"
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
        const generalidades = structure.document.sections.find(s => s.id === "generalidades");
        if (!generalidades) return;

        const idx134 = generalidades.content.findIndex(item =>
            item.type === "heading" && String(item.text || "").startsWith("1.3.4.")
        );

        if (idx134 === -1) return;

        const factorByCategory = {
            A: "1.50",
            B: "1.30",
            C: "1.00",
            D: "Ver Nota 2"
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
                description: "Establecimientos de salud del segundo y tercer nivel; puertos, aeropuertos, centrales de comunicaciones, estaciones de bomberos, cuarteles de fuerzas armadas y policía; instalaciones de generación y transformación eléctrica; reservorios y plantas de tratamiento de agua; locales con función de refugio, instituciones educativas e instalaciones cuyo colapso implique riesgo adicional."
            },
            B: {
                title: "B - Edificaciones Importantes",
                description: "Edificaciones donde se reúnen gran cantidad de personas: cines, teatros, estadios, coliseos, centros comerciales, terminales de pasajeros, establecimientos penitenciarios y edificaciones que guardan patrimonio valioso (museos y bibliotecas). También incluye depósitos de granos y almacenes importantes para el abastecimiento."
            },
            C: {
                title: "C - Edificaciones Comunes",
                description: "Edificaciones comunes como viviendas, oficinas, hoteles, restaurantes, depósitos e instalaciones industriales cuyo fallo no acarree peligros adicionales de incendios o fugas de contaminantes."
            },
            D: {
                title: "D - Edificaciones Temporales",
                description: "Construcciones provisionales para depósitos, casetas y otras instalaciones similares."
            }
        };

        const selectedCategoryDetail = categoryDetails[validCategory] || categoryDetails.C;

        // Actualizar párrafo
        const idx134Paragraph = generalidades.content.findIndex((item, i) =>
            i > idx134 && item.type === "paragraph"
        );
        if (idx134Paragraph !== -1) {
            const factorText = validCategory === "D" ? "Ver Nota 2" : factorU;
            generalidades.content[idx134Paragraph] = {
                type: "paragraph",
                text: `Cada estructura debe ser clasificada de acuerdo con la categoría de uso. Para la categoría ${validCategory}, corresponde el factor de importancia U = ${factorText}.`,
                alignment: "JUSTIFIED"
            };
        }

        // Reemplazar imagen por tabla
        const categoryImageIdx = generalidades.content.findIndex((item, i) =>
            i > idx134 && item.type === "image" && item.src === "/assets/img/memoriacalculos/categoriaEdificaciones.png"
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
                    { header: "FACTOR U", width: 15 }
                ],
                rows: [[
                    { text: selectedCategoryDetail.title, bold: true },
                    { text: selectedCategoryDetail.description, alignment: "LEFT" },
                    {
                        text: validCategory === "D" ? "Ver Nota 2" : factorU,
                        bold: true,
                        alignment: "CENTER"
                    }
                ]]
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
        const generalidades = structure.document.sections.find(s => s.id === "generalidades");
        if (!generalidades) return;

        const idx15 = generalidades.content.findIndex(item =>
            item.type === "heading" && String(item.text || "").startsWith("1.5.")
        );

        if (idx15 === -1) return;

        const endPos15 = this.findNextHeadingIndex(generalidades.content, idx15);
        const materialInputs = this.sections.generalidades.structuralDetails.materialDesign || {};

        const aceroEstructural = materialInputs.aceroEstructural || {};
        const aceroCorrugado = materialInputs.aceroCorrugado || {};
        const concreto = materialInputs.concreto || {};

        const materialBlocks = [
            {
                type: "paragraph",
                text: "Se consideraron las siguientes caracteristicas de los materiales que conforman esta estructura",
                alignment: "JUSTIFIED"
            },
            {
                type: "paragraph",
                text: "Acero estructural (ASTM A36)",
                alignment: "JUSTIFIED"
            },
            {
                type: "list",
                listType: "bullet",
                items: [
                    `Fluencia: fy = ${aceroEstructural.fy || "4,200"} kg/cm2, Grado 60.`,
                    `Modulo de elasticidad: E = ${aceroEstructural.e || "2,038,901.92"} kg/cm2`
                ]
            },
            {
                type: "paragraph",
                text: "Acero Corrugado (ASTM A605)",
                alignment: "JUSTIFIED"
            },
            {
                type: "list",
                listType: "bullet",
                items: [
                    `Fluencia: fy = ${aceroCorrugado.fy || "4,200"} kg/cm2, Grado 60.`,
                    `Modulo de elasticidad: E = ${aceroCorrugado.e || "2,038,901.92"} kg/cm2`
                ]
            },
            {
                type: "paragraph",
                text: "Concreto",
                alignment: "JUSTIFIED"
            },
            {
                type: "list",
                listType: "bullet",
                items: [
                    `Resistencia nominal: f'c = ${concreto.fc || "210"} kg/cm2`,
                    `Modulo de elasticidad: E = ${concreto.e || "253,456.4"} kg/cm2`,
                    `Peso específico: 2.4 ton/m3`,
                    `Coeficiente de Poisson: u = 0.2`
                ]
            }
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
                caption: "figura 11-Propiedad de refuerzo fy=4200 kg/cm2"
            });
        }

        if (materialImages[1]) {
            materialBlocks.push({
                type: "image",
                src: materialImages[1],
                alignment: "CENTER",
                width: 480,
                height: 440,
                caption: "figura 12-Propiedad del concreto f'c=210kg/cm2"
            });
        }

        // La descripción general (Norma E.090)
        materialBlocks.push({
            type: "paragraph",
            text: "Para realizar el diseño de los elementos de la estructura metálica se tendrá que rescatar los máximos valores de la envolvente de cada elemento estructural de las combinaciones según la norma E.090. Del R.N.E. vigente que vienen a ser.",
            alignment: "JUSTIFIED",
            spacing: { before: 200 }
        });

        materialBlocks.push({
            type: "list",
            listType: "bullet",
            items: [
                "1.2D+1.6CVT+0.8CWP",
                "1.2D+1.6CVT+0.8CWN",
                "1.2D+0.5CVT+1.3CWP",
                "0.9D+1.3CWP",
                "0.9D+1.3CWN"
            ]
        });

        // Figura 13 al final
        if (materialImages[2]) {
            materialBlocks.push({
                type: "image",
                src: materialImages[2],
                alignment: "CENTER",
                width: 500,
                height: 260,
                caption: "figura 13-Propiedades del acero"
            });
        }

        generalidades.content.splice(idx15 + 1, endPos15 - (idx15 + 1), ...materialBlocks);
    }

    // ============================================
    // 8. ANÁLISIS DE CARGAS (Sección 2)
    // ============================================
    transformAnalisisCargas(structure) {
        const analisisCargas = structure.document.sections.find(s => s.id === "analisis_cargas");
        if (!analisisCargas) return;

        // 2.1 MODELO ESTRUCTURAL - Figura 14
        const idx21 = analisisCargas.content.findIndex(item =>
            item.type === "heading" && item.text === "2.1 MODELO ESTRUCTURAL"
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
                    caption: "figura 14-vista 3d modelo matematico"
                });
            }
        }

        // 2.2 CASOS DE CARGA - Figura 15 y 16
        const idx22 = analisisCargas.content.findIndex(item =>
            item.type === "heading" && item.text === "2.2 CASOS DE CARGA"
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
                    height: 280,
                    caption: "figura 15-Espectro de Pseudoaceleraciones en dirección “X”"
                });
            }
            if (espectros[1]) {
                espectroBlocks.push({
                    type: "image",
                    src: espectros[1],
                    alignment: "CENTER",
                    width: 500,
                    height: 280,
                    caption: "figura 16-Espectro de Pseudoaceleraciones en dirección “Y”"
                });
            }

            if (espectroBlocks.length > 0) {
                analisisCargas.content.splice(nextHeadingIdx, 0, ...espectroBlocks);
            }
        }

        // 2.4 METRADO DE CARGAS - Figura 18-21, Viento, Aproximadas, 22-25
        const idx24 = analisisCargas.content.findIndex(item =>
            item.type === "heading" && item.text === "2.4 METRADO DE CARGAS"
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
            const metradoCaptions = [
                "figura 18-Cargas muertas por metro cuadrado (tonf/m2)",
                "figura 19-Carga viva entrepiso por metro cuadrado (tonf/m2)",
                "figura 20-Carga viva techo por metro cuadrado (tonf/m2)",
                "figura 21-Carga muerta por metro lineal debido a tabiquería (tonf/m)"
            ];

            metradoImages.forEach((src, i) => {
                if (src && metradoCaptions[i]) {
                    dynamicContent.push({
                        type: "image",
                        src,
                        alignment: "CENTER",
                        width: 500,
                        height: 280,
                        caption: metradoCaptions[i]
                    });
                }
            });

            // 2. Sección de Viento
            const velocity = parseFloat(dataCasos.cargaviento) || 75;
            dynamicContent.push({
                type: "paragraph",
                text: "Para calcular o estimar las cargas que se aplicaran en la estructura se tomará las cargas referenciales acorde a la norma E.020 del R.N.E.",
                alignment: "JUSTIFIED",
                spacing: { before: 200 }
            });
            dynamicContent.push({
                type: "paragraph",
                text: `Carga viento: La carga de viento a utilizar está dada por el reglamento nacional de edificaciones tomando como referencia el mapa eólico del Perú, con una velocidad correspondiente a ${velocity} km/h como condición crítica.`,
                alignment: "JUSTIFIED"
            });

            // Mapa Eólico
            dynamicContent.push({
                type: "image",
                src: "/assets/img/memoriacalculos/cargaviento.png",
                alignment: "CENTER",
                width: 400,
                height: 380,
                caption: "Mapa eólico del Perú"
            });

            dynamicContent.push({
                type: "paragraph",
                text: "Además, se considerará los siguientes ítems provenientes de la norma E.020:",
                alignment: "JUSTIFIED",
                spacing: { before: 100 }
            });

            // Factores de Forma (Tabla 4)
            dynamicContent.push({
                type: "image",
                src: "/assets/img/memoriacalculos/factoresforma.png",
                alignment: "CENTER",
                width: 420,
                height: 380,
                caption: "Tabla de factores de forma"
            });

            // 3. Cargas Aproximadas (Heading + Tabla)
            dynamicContent.push({
                type: "heading",
                level: 3,
                text: "CARGAS APROXIMADAS"
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
                    { header: "UNIDAD", width: 30 }
                ],
                rows: [
                    ["3.1) CARGAS MUERTAS", "", "", ""],
                    ["Cubierta + Accesorios", "=", format(dataCasos.K5 || 10), "kgf/m2"],
                    [{ text: "CM", bold: true }, { text: "=", bold: true }, { text: format(dataCasos.K5 || 10), bold: true }, { text: "kgf/m2", bold: true }],
                    ["", "", "", ""],
                    ["3.2) CARGAS VIVAS", "", "", ""],
                    ["Techo inclinado", "=", format(dataCasos.K10 || 30), "kgf/m2"],
                    ["S/C por construcción", "=", format(dataCasos.K11 || 0), "kgf/m2"],
                    [{ text: "CV", bold: true }, { text: "=", bold: true }, { text: format(parseFloat(dataCasos.K10 || 30) + parseFloat(dataCasos.K11 || 0)), bold: true }, { text: "kgf/m2", bold: true }],
                    ["", "", "", ""],
                    ["3.3) CARGAS DE VIENTO", "", "", ""],
                    ["Velocidad del viento", "=", format(vel), "km/h"],
                    ["Altura sobre el terreno", "=", format(alt), "m"],
                    ["", "", "", ""],
                    [{ text: "Barlovento", bold: true, underline: true }, "", "", ""],
                    ["Vh", "=", format(vel * Math.pow(alt / 10, 0.22)), "km/h"],
                    ["C", "=", format(dataCasos.K21 || 0.30), ""],
                    ["Pv+", "=", format(qz * (dataCasos.K21 || 0.30) * 100), "kgf/m2"],
                    [{ text: "CW+", bold: true }, { text: "=", bold: true }, { text: Math.round(qz * (dataCasos.K21 || 0.30) * 100), bold: true }, { text: "kgf/m2", bold: true }],
                    ["", "", "", ""],
                    [{ text: "Sotavento", bold: true, underline: true }, "", "", ""],
                    ["C", "=", format(dataCasos.K32 || -0.60), ""],
                    ["Pv-", "=", format(qz * (dataCasos.K32 || -0.60) * 100), "kgf/m2"],
                    [{ text: "CW-", bold: true }, { text: "=", bold: true }, { text: Math.round(qz * (dataCasos.K32 || -0.60) * 100), bold: true }, { text: "kgf/m2", bold: true }]
                ]
            });

            // 4. Figuras 22-25 (Cargas Aproximadas)
            const approxImages = this.previews.cargasAproximadasImages || [];
            const approxCaptions = [
                "figura 22-Cargas muertas por metro cuadrado (kgf/m2)",
                "figura 23-Cargas viva techo metro cuadrado (kgf/m2)",
                "figura 24-Cargas viva viento positivo(kgf/m2)",
                "figura 25-Cargas viva viento negativo(kgf/m2)"
            ];

            approxImages.forEach((src, i) => {
                if (src && approxCaptions[i]) {
                    dynamicContent.push({
                        type: "image",
                        src,
                        alignment: "CENTER",
                        width: 500,
                        height: 280,
                        caption: approxCaptions[i]
                    });
                }
            });

            // Aplicar todos los cambios de 2.4 en una sola operación
            analisisCargas.content.splice(startReplacingAt, itemsToDelete, ...dynamicContent);
        }
    }
}

