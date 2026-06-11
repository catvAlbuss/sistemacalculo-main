import incompatibilidadesData from "../data/incompatibilidades.json";

// FIX: Helper centralizado para rutas de assets
// En producción Laravel, las rutas deben ser /assets/... sin el prefijo public/
function assetUrl(path) {
    // Eliminar cualquier prefijo public/ o /public/ si existe
    return path.replace(/^(\/)?public\//, '/');
}

export class DocumentTransformerMD {
    constructor(exportData, ubigeoData) {
        this.exportData = exportData;
        this.ubigeoData = ubigeoData;
        this.cover = exportData.cover;
        this.sections = exportData.sections;
        this.previews = exportData.previews;
    }

    applyAll(structure) {
        this.transformImagenesGeneralidades(structure);
        this.transformIncompatibilidades(structure);
        this.transformDocumentosPlanos(structure);
        this.transformObjetivosLista(structure);
        this.transformMarcoNormativoLista(structure);
        this.transformDescripcionModulos(structure);
        this.transformMarcoTeorico(structure);
        this.transformConsideracionesGenerales(structure);
        this.transformPredimensionamiento(structure);
        this.transformDemolicion(structure);
    }

    // ============================================
    // SECCIÓN 1.1 - ANTECEDENTES
    // ============================================
    transformImagenesGeneralidades(structure) {
        const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
        if (!generalidades) return;

        const addParagraph = (content, text, bold = false, alignment = "LEFT") => {
            content.push({ type: "paragraph", text, bold, alignment });
        };

        const addImage = (content, previewKey, width, height, caption, pageBreakBefore = false) => {
            let src = null;
            if (previewKey === 'coverImage' && this.cover.coverImage) {
                src = this.cover.coverImage;
            } else if (this.cover.generalidadesImages && this.cover.generalidadesImages[previewKey]) {
                src = this.cover.generalidadesImages[previewKey];
            } else if (this.previews[previewKey]) {
                src = this.previews[previewKey];
            }
            if (src) {
                content.push({ type: "image", src, width, height, caption, alignment: "CENTER", pageBreakBefore });
            }
        };

        const historyText = this.sections.generalidades?.antecedentes?.history || "";
        const textoPlaceholderIndex = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text?.includes("{{sections.generalidades.antecedentes.textoCompleto}}")
        );
        if (textoPlaceholderIndex !== -1 && historyText) {
            generalidades.content[textoPlaceholderIndex].text = historyText;
        }

        const tablaPlaceholder = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text?.includes("{{TABLA_VIAS_ACCESO}}")
        );
        const tablaViasAcceso = this.getTablaViasAcceso();
        if (tablaPlaceholder !== -1 && tablaViasAcceso) {
            generalidades.content.splice(tablaPlaceholder, 1, tablaViasAcceso);
        }

        const imagenesDemandaPlaceholder = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text?.includes("{{IMAGENES_DEMANDA}}")
        );
        if (imagenesDemandaPlaceholder !== -1) {
            const contenidoDemanda = [];
            addParagraph(contenidoDemanda, "DEMANDA INICIAL", true, "CENTER");
            addImage(contenidoDemanda, "demandaInicialImage", 550, 180, "Cuadro 1: Demanda de Inicial Ciclo II");
            addParagraph(contenidoDemanda, "", false, "CENTER");
            addParagraph(contenidoDemanda, "DEMANDA PRIMARIA", true, "CENTER");
            addImage(contenidoDemanda, "demandaPrimariaImage", 550, 220, "Cuadro 2: Demanda de Primaria");
            generalidades.content.splice(imagenesDemandaPlaceholder, 1, ...contenidoDemanda);
        }

        const imagenesUbicacionPlaceholder = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text?.includes("{{IMAGENES_UBICACION}}")
        );
        if (imagenesUbicacionPlaceholder !== -1) {
            const contenidoUbicacion = [];
            addImage(contenidoUbicacion, "ubicacionImage1", 550, 650, "Figura 1: Ubicación del área del proyecto", true);
            addImage(contenidoUbicacion, "ubicacionImage2", 450, 350, "Figura 2: Plano de Ubicación");
            generalidades.content.splice(imagenesUbicacionPlaceholder, 1, ...contenidoUbicacion);
        }
    }

    getTablaViasAcceso() {
        const acceso = this.sections.generalidades?.acceso || {};
        const getVia = (key, fallback) => {
            const via = acceso[key] || {};
            return [
                via.tramo || fallback.tramo,
                via.distancia || fallback.distancia,
                via.tiempo || fallback.tiempo,
                via.tipo || fallback.tipo
            ];
        };
        return {
            type: "table",
            widthPercent: 85,
            title: "Vias de Acceso",
            columns: [
                { header: "TRAMO", width: 35 },
                { header: "DISTANCIA (km)", width: 20 },
                { header: "TIEMPO", width: 25 },
                { header: "CARRETERA", width: 20 }
            ],
            rows: [
                getVia("limaHuanuco", { tramo: "Lima - Huanuco", distancia: "410", tiempo: "8:00:00", tipo: "Asfaltada" }),
                getVia("huanucoTingo", { tramo: "Huanuco - Tingo Maria", distancia: "120", tiempo: "3:00:00", tipo: "Asfaltada" }),
                getVia("tingoPucallpa", { tramo: "Tingo Maria - Pucallpa", distancia: "254", tiempo: "5:45:00", tipo: "Asfaltada" }),
                getVia("pucallpaContamana", { tramo: "Pucallpa - Contamana", distancia: "248", tiempo: "8:00:00", tipo: "Rapido (Barco)" }),
                getVia("total", { tramo: "Total", distancia: "1032", tiempo: "24h y 45 min", tipo: "" })
            ]
        };
    }

    // ============================================
    // SECCIÓN 1.3 - DOCUMENTOS Y PLANOS
    // ============================================
    transformDocumentosPlanos(structure) {
        const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
        if (!generalidades) return;

        const documentos = this.sections.documentosPlanos?.documentos || [];
        const planos = this.sections.documentosPlanos?.planos || [];

        const documentosPlaceholder = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text === "{{LISTA_DOCUMENTOS}}"
        );
        if (documentosPlaceholder !== -1) {
            const documentosFiltrados = documentos.filter(d => d && d.trim() !== "");
            if (documentosFiltrados.length > 0) {
                generalidades.content.splice(documentosPlaceholder, 1, {
                    type: "list", listType: "bullet", items: documentosFiltrados,
                });
            } else {
                generalidades.content[documentosPlaceholder].text = "No se han definido documentos.";
            }
        }

        const planosPlaceholder = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text === "{{TABLA_PLANOS}}"
        );
        if (planosPlaceholder !== -1) {
            const planosFiltrados = planos.filter(p => p.descripcion?.trim() !== "");
            if (planosFiltrados.length > 0) {
                const nombreProyecto = this.cover.project || "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL Y PRIMARIA";
                let numeroCorrelativo = 1;
                const rowsConNumeros = planosFiltrados.map(p => {
                    if (p.esEncabezado) return ["", p.descripcion, p.lamina || ""];
                    return [String(numeroCorrelativo++), p.descripcion, p.lamina || `E-${String(numeroCorrelativo - 1).padStart(2, '0')}`];
                });
                generalidades.content.splice(planosPlaceholder, 1, {
                    type: "table",
                    title: `RELACION DE PLANOS DE PROYECTO: "${nombreProyecto}"`,
                    widthPercent: 95,
                    columns: [{ header: "N°", width: 10 }, { header: "DESCRIPCIÓN", width: 70 }, { header: "LÁMINA", width: 20 }],
                    rows: rowsConNumeros,
                });
            } else {
                generalidades.content[planosPlaceholder].text = "No se han definido planos.";
            }
        }
    }

    // ============================================
    // SECCIÓN 1.4 - OBJETIVOS
    // ============================================
    transformObjetivosLista(structure) {
        const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
        if (!generalidades) return;

        const objetivoGeneral = this.sections.generalidades?.objetivos?.general || "";
        const generalPlaceholderIndex = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text?.includes("{{sections.generalidades.objetivos.general}}")
        );
        if (generalPlaceholderIndex !== -1) {
            generalidades.content[generalPlaceholderIndex].text = objetivoGeneral;
        }

        const objetivos = this.sections.generalidades?.objetivos?.especificos || [];
        const objetivosValidos = objetivos.filter(obj => obj && obj.trim() !== "");
        const objectivesPlaceholderIndex = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text?.includes("{{LISTA_OBJETIVOS_ESPECIFICOS}}")
        );
        if (objectivesPlaceholderIndex !== -1) {
            if (objetivosValidos.length > 0) {
                generalidades.content.splice(objectivesPlaceholderIndex, 1, {
                    type: "list", listType: "numbered", items: objetivosValidos
                });
            } else {
                generalidades.content[objectivesPlaceholderIndex].text = "No se han definido objetivos específicos.";
            }
        }
    }

    transformIncompatibilidades(structure) {
        const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
        if (!generalidades) return;

        const placeholderIndex = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text?.includes("{{TABLA_INCOMPATIBILIDADES}}")
        );
        if (placeholderIndex !== -1) {
            const tablaIncompatibilidades = {
                type: "table",
                widthPercent: 95,
                columns: [
                    { header: "N°", width: 5 },
                    { header: "Incompatibilidad por cercanía de las IE", width: 40 },
                    { header: "Dispositivo Legal (39)", width: 30 },
                    { header: "Compatibilización", width: 25 }
                ],
                rows: incompatibilidadesData.map(item => [
                    item.num, item.descripcion, item.dispositivoLegal, item.compatibilizacion
                ])
            };
            generalidades.content.splice(placeholderIndex, 1, tablaIncompatibilidades);
        }
    }

    // ============================================
    // SECCIÓN 1.5 - MARCO NORMATIVO
    // ============================================
    transformMarcoNormativoLista(structure) {
        const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
        if (!generalidades) return;

        const marcoNormativo = this.sections.generalidades?.marcoNormativo || [];
        const normasValidas = marcoNormativo.filter(n => n && n.trim() !== "");
        const placeholderIndex = generalidades.content.findIndex(
            (item) => item.type === "paragraph" && item.text?.includes("{{LISTA_MARCO_NORMATIVO}}")
        );
        if (placeholderIndex !== -1) {
            if (normasValidas.length > 0) {
                generalidades.content.splice(placeholderIndex, 1, {
                    type: "list", listType: "bullet", items: normasValidas
                });
            } else {
                generalidades.content[placeholderIndex].text = "No se ha definido marco normativo.";
            }
        }
    }

    // ============================================
    // 1.5 - DESCRIPCIÓN DE BLOQUES
    // ============================================
    transformDescripcionModulos(structure) {
        const descripcionModulos = structure.document.sections.find((s) => s.id === "descripcion_bloques");
        if (!descripcionModulos) return;

        const parrafoIndex = descripcionModulos.content.findIndex(
            (item) => item.type === "paragraph" && item.text === "El Proyecto consta de 16 módulos, a continuación, se detallan los módulos."
        );

        if (parrafoIndex !== -1) {
            const tieneImagenes = descripcionModulos.content.some(
                (item) => item.type === "image" && item.caption?.includes("Planta general")
            );
            if (!tieneImagenes) {
                const imagenesPlanta = [
                    {
                        type: "image",
                        // FIX: ruta correcta sin prefijo public/
                        src: "/assets/img/memoria_decriptiva/modulos/descripcionBloques.png",
                        width: 550, height: 350,
                        caption: "Figura 31. Planta general del Primer Nivel del Proyecto",
                        alignment: "CENTER"
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoria_decriptiva/modulos/figura31PlantaGeneral.png",
                        width: 550, height: 350,
                        caption: "Figura 32. Distribución Arquitectónica",
                        alignment: "CENTER"
                    }
                ];
                descripcionModulos.content.splice(parrafoIndex + 1, 0, ...imagenesPlanta);
            }
        }

        const modulos = this.sections.descripcionModulos?.modulos || [];
        const mapeoImagenes = this.sections.descripcionModulos?.mapeoImagenes || {};
        const obrasExtInt = this.sections.descripcionModulos?.obrasExtInt || [];

        if (modulos.length === 0) return;

        let heading152Index = descripcionModulos.content.findIndex(
            (item) => item.type === "heading" && item.text === "1.5.2. Descripción por bloque o edificación"
        );
        if (heading152Index === -1) {
            heading152Index = descripcionModulos.content.findIndex(
                (item) => item.type === "heading" && item.text?.includes("Descripción por bloque")
            );
        }
        if (heading152Index === -1) return;

        descripcionModulos.content.splice(heading152Index + 1, descripcionModulos.content.length - (heading152Index + 1));

        const nuevosModulos = [];

        for (let i = 0; i < modulos.length; i++) {
            const modulo = modulos[i];
            const numeroModulo = this.extraerNumeroModulo?.(modulo.nombre) || i + 1;
            const numeroModuloStr = String(numeroModulo).padStart(2, '0');
            const infoImagenes = mapeoImagenes[numeroModulo];

            nuevosModulos.push({
                type: "heading", level: 3,
                text: `1.5.2.${numeroModulo}. ${modulo.nombre}`
            });

            const imagenesOriginales = infoImagenes?.archivos || [];
            const imagenesSubidas = modulo.imagenes || [];
            const subtitulosSubidos = modulo.subtitulosImagenes || [];
            const totalImagenes = Math.max(modulo.pisos || 1, imagenesOriginales.length);

            for (let imgIdx = 0; imgIdx < totalImagenes; imgIdx++) {
                let src = "";
                let numeroFigura = "";
                let subtitulo = "";
                let esImagenSubida = false;

                if (imagenesSubidas[imgIdx]) {
                    src = imagenesSubidas[imgIdx];
                    if (imagenesOriginales[imgIdx]) {
                        numeroFigura = infoImagenes.figuras[imgIdx];
                        subtitulo = subtitulosSubidos[imgIdx] || infoImagenes.subtitulos[imgIdx] || "";
                    } else {
                        const ultimaFigura = infoImagenes?.figuras?.slice(-1)[0] || 54;
                        numeroFigura = ultimaFigura + (imgIdx - (imagenesOriginales.length - 1)) + 1;
                        subtitulo = subtitulosSubidos[imgIdx] || ` (Nivel ${imgIdx + 1})`;
                    }
                    esImagenSubida = true;
                } else if (imagenesOriginales[imgIdx]) {
                    // FIX: usar assetUrl para garantizar ruta correcta en producción
                    src = assetUrl(`/assets/img/memoria_decriptiva/modulos/${imagenesOriginales[imgIdx]}`);
                    numeroFigura = infoImagenes.figuras[imgIdx];
                    subtitulo = infoImagenes.subtitulos[imgIdx] || "";
                    esImagenSubida = false;
                } else {
                    continue;
                }

                nuevosModulos.push({
                    type: "image", src, width: 500, height: 380,
                    caption: `Figura ${numeroFigura}${subtitulo}. Distribución Arquitectónica del Módulo ${numeroModuloStr}${esImagenSubida && !imagenesOriginales[imgIdx] ? ' (Imagen adicional)' : ''}`,
                    alignment: "CENTER"
                });
            }

            nuevosModulos.push({
                type: "table", widthPercent: 90,
                columns: [{ header: "PARÁMETRO", width: 30 }, { header: "DESCRIPCIÓN", width: 70 }],
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

            if (i < modulos.length - 1) {
                nuevosModulos.push({ type: "paragraph", text: "" });
                nuevosModulos.push({ type: "pageBreak" });
            }
        }

        if (obrasExtInt.length > 0) {
            nuevosModulos.push({ type: "pageBreak" });
            for (let i = 0; i < obrasExtInt.length; i++) {
                const obra = obrasExtInt[i];
                nuevosModulos.push({ type: "heading", level: 3, text: `1.5.2.${obra.numero}. ${obra.nombre}` });

                if (obra.tieneImagen && obra.archivos && obra.archivos.length > 0) {
                    for (let imgIdx = 0; imgIdx < obra.archivos.length; imgIdx++) {
                        nuevosModulos.push({
                            type: "image",
                            // FIX: usar assetUrl
                            src: assetUrl(`/assets/img/memoria_decriptiva/modulos/${obra.archivos[imgIdx]}`),
                            width: 500, height: 380,
                            caption: `Figura ${obra.figuras[imgIdx]}${obra.subtitulos[imgIdx] || ""}. ${obra.nombre}`,
                            alignment: "CENTER"
                        });
                    }
                }

                const baseTable = { type: "table", widthPercent: 90, columns: [{ header: "PARÁMETRO", width: 30 }, { header: "DESCRIPCIÓN", width: 70 }], rows: [] };
                if (obra.tipoTabla === "cincoFilas") {
                    baseTable.rows = [["USO", obra.uso], ["#pisos", obra.nropisos], ["Sistema estructural", obra.sistemaEstructural], ["Descripción", obra.descripcion], ["Techo", obra.techo]];
                } else if (obra.tipoTabla === "cuatroFilas") {
                    baseTable.rows = [["USO", obra.uso], ["#pisos", obra.nropisos], ["Descripción", obra.descripcion], ["Techo", obra.techo]];
                } else if (obra.tipoTabla === "dosFilas") {
                    baseTable.rows = [["USO", obra.uso], ["#pisos", obra.nropisos]];
                } else {
                    baseTable.rows = [["USO", obra.uso]];
                }
                nuevosModulos.push(baseTable);

                if (i < obrasExtInt.length - 1) {
                    nuevosModulos.push({ type: "paragraph", text: "" });
                    nuevosModulos.push({ type: "pageBreak" });
                }
            }
        }

        descripcionModulos.content.splice(heading152Index + 1, 0, ...nuevosModulos);
    }

    transformMarcoTeorico(structure) {
        const marcoTeorico = structure.document.sections.find((s) => s.id === "marco_teorico");
        if (!marcoTeorico) return;

        const mt = this.sections.marcoTeorico || {};
        marcoTeorico.content = [];

        if (mt.conceptosBasicos) {
            marcoTeorico.content.push(
                { type: "heading", level: 2, text: "a) CONCEPTOS BASICOS" },
                { type: "paragraph", text: mt.conceptosBasicos, alignment: "JUSTIFIED" }
            );
        }

        if (mt.criteriosEstructurales && mt.criteriosEstructurales.length > 0) {
            marcoTeorico.content.push({ type: "heading", level: 2, text: "b) CRITERIOS ESTRUCTURALES" });
            const letras = ["a", "b", "c", "d", "e", "f"];
            mt.criteriosEstructurales.forEach((criterio, i) => {
                const dosPuntosIndex = criterio.indexOf(":");
                if (dosPuntosIndex !== -1) {
                    marcoTeorico.content.push(
                        { type: "paragraph", text: `${letras[i] || i}. ${criterio.substring(0, dosPuntosIndex).trim()}`, bold: true, alignment: "JUSTIFIED" },
                        { type: "paragraph", text: criterio.substring(dosPuntosIndex + 1).trim(), alignment: "JUSTIFIED" }
                    );
                }
            });
        }

        if (mt.eleccionSistema) {
            marcoTeorico.content.push(
                { type: "heading", level: 2, text: "c) ELECCIÓN DEL SISTEMA ESTRUCTURAL" },
                { type: "paragraph", text: mt.eleccionSistema, alignment: "JUSTIFIED" }
            );
        }

        if (mt.elementosEstructurales && mt.elementosEstructurales.length > 0) {
            marcoTeorico.content.push({ type: "heading", level: 2, text: "d) ELEMENTOS ESTRUCTURALES" });
            const letrasElementos = ["a", "b", "c", "d", "e", "f"];
            mt.elementosEstructurales.forEach((elemento, i) => {
                const dosPuntosIndex = elemento.indexOf(":");
                if (dosPuntosIndex !== -1) {
                    marcoTeorico.content.push(
                        { type: "paragraph", text: `${letrasElementos[i] || i}. ${elemento.substring(0, dosPuntosIndex).trim()}`, bold: true, alignment: "JUSTIFIED" },
                        { type: "paragraph", text: elemento.substring(dosPuntosIndex + 1).trim(), alignment: "JUSTIFIED" }
                    );
                }
            });
        }

        if (mt.materiales) {
            marcoTeorico.content.push({ type: "heading", level: 2, text: "e) MATERIALES DE LOS ELEMENTOS ESTRUCTURALES" });

            if (mt.materiales.concreto) {
                const c = mt.materiales.concreto;
                marcoTeorico.content.push(
                    { type: "heading", level: 3, text: "Concreto estructural" },
                    { type: "paragraph", text: c.descripcionGeneral || "", alignment: "JUSTIFIED" },
                    { type: "paragraph", text: "a. Resistencia a la compresión (f'c)", bold: true, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: c.descripcionResistencia || "", alignment: "JUSTIFIED" },
                    // FIX: ruta correcta sin public/
                    { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/figura2CurvaEsfuerzo.png"), width: 450, height: 300, caption: "Figura 2. Curvas esfuerzo – deformación de concreto.", alignment: "CENTER" },
                    { type: "paragraph", text: `Para el diseño de los elementos estructurales se usará una resistencia a la compresión de f'c = ${c.fc || "210"} kg/cm2 y para obras hidráulicas f'c = 280 kg/cm2.`, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: "b. Módulo de elasticidad (Ec)", bold: true, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: c.descripcionModulo || "", alignment: "JUSTIFIED" },
                    { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/figura3ModuloElasticidad.png"), width: 450, height: 300, caption: "Figura 3. Módulo de elasticidad (Ec).", alignment: "CENTER" },
                    { type: "paragraph", text: c.descripcionFormula || "", alignment: "JUSTIFIED" },
                    { type: "paragraph", text: "Ec = 15000 √(f'c)", bold: true, alignment: "CENTER" },
                    { type: "paragraph", text: `En el presente diseño usaremos f'c = ${c.fc || "210"} kg/cm2, entonces obtenemos Ec = ${c.ec || "217370.65"} kg/cm2.`, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: "c. Peso específico (ϒc)", bold: true, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: "El peso específico para concreto simple es 2300 kg/m3 y para concreto armado 2400 kg/m3.", alignment: "JUSTIFIED" },
                    { type: "paragraph", text: `Entre otras propiedades mecánicas tenemos el coeficiente de Poisson (u = ${c.poisson || "0.20"}).`, alignment: "JUSTIFIED" }
                );
            }

            if (mt.materiales.acero) {
                const a = mt.materiales.acero;
                marcoTeorico.content.push(
                    { type: "heading", level: 3, text: "Acero de refuerzo" },
                    { type: "paragraph", text: a.descripcionGeneral || "", alignment: "JUSTIFIED" },
                    { type: "paragraph", text: "a. Esfuerzo de fluencia (fy)", bold: true, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: a.descripcionFluencia || "", alignment: "JUSTIFIED" },
                    { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/figura4DiagramaEsfuerzo.png"), width: 450, height: 350, caption: "Figura 4. Diagrama esfuerzo – deformación del acero (fy).", alignment: "CENTER" },
                    { type: "paragraph", text: `En el presente proyecto se diseñará con acero corrugado de grado 60, es decir, fy = ${a.fy || "4200"} kg/cm2.`, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: "b. Módulo de elasticidad (Es)", bold: true, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: a.descripcionModulo || "", alignment: "JUSTIFIED" },
                    { type: "paragraph", text: `Teniendo como valor Es = ${a.es || "2000000"} kg/cm2.`, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: "c. Peso específico (Y)", bold: true, alignment: "JUSTIFIED" },
                    { type: "paragraph", text: `El peso específico del acero es Y = ${a.peso || "7.85"} ton/m3 (NTE E.020).`, alignment: "JUSTIFIED" }
                );
            }

            if (mt.materiales.cargaMuerta) {
                const cm = mt.materiales.cargaMuerta;
                marcoTeorico.content.push(
                    { type: "heading", level: 2, text: "g) CARGA MUERTA" },
                    { type: "paragraph", text: cm.descripcion || "", alignment: "JUSTIFIED" },
                    { type: "list", listType: "bullet", items: cm.items || [] }
                );
            }

            if (mt.materiales.cargaViva) {
                const cv = mt.materiales.cargaViva;
                marcoTeorico.content.push(
                    { type: "heading", level: 2, text: "h) CARGA VIVA" },
                    { type: "paragraph", text: cv.descripcion || "", alignment: "JUSTIFIED" },
                    { type: "list", listType: "bullet", items: cv.items || [] }
                );
            }
        }

        if (mt.software) {
            marcoTeorico.content.push(
                { type: "heading", level: 2, text: "i) ELECCIÓN DEL SOFTWARE ESTRUCTURAL" },
                { type: "paragraph", text: mt.software, alignment: "JUSTIFIED" },
                // FIX: ruta correcta
                { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/figura28VentanaPresentacion.png"), width: 500, height: 350, caption: "Figura. Ventana de presentación del programa ETABS V16.", alignment: "CENTER" }
            );
        }

        if (mt.parametrosSismicos) {
            const ps = mt.parametrosSismicos;
            marcoTeorico.content.push(
                { type: "heading", level: 2, text: "j) PARÁMETROS SÍSMICOS" },
                { type: "paragraph", text: ps.textoIntro || "", alignment: "JUSTIFIED" },
                { type: "heading", level: 3, text: "Factor zona (Z)" },
                { type: "paragraph", text: ps.textoFactorZona || "", alignment: "JUSTIFIED" },
                { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/tablaZona.png"), width: 400, height: 200, caption: "Tabla N° 1 - FACTORES DE ZONA \"Z\"", alignment: "CENTER" },
                { type: "paragraph", text: ps.textoZonaUbicacion || "", alignment: "JUSTIFIED" },
                { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/figura30MapaSismico.png"), width: 500, height: 400, caption: "Figura 30: Distribución espacial sismicidad del Perú.", alignment: "CENTER" },
                { type: "heading", level: 3, text: "Condiciones geotécnicas" },
                { type: "paragraph", text: ps.textoGeotecnico || "", alignment: "JUSTIFIED" },
                { type: "heading", level: 3, text: "Periodo fundamental (T)" },
                { type: "paragraph", text: ps.textoPeriodo || "", alignment: "JUSTIFIED" },
                { type: "heading", level: 3, text: "Coeficiente de amplificación sísmica (C)" },
                { type: "paragraph", text: ps.textoCoeficiente || "", alignment: "JUSTIFIED" },
                { type: "list", listType: "bullet", items: ps.formulas || [] },
                { type: "paragraph", text: ps.textoSiendo || "", alignment: "JUSTIFIED" },
                { type: "list", listType: "bullet", items: ps.textoListaSiendo || [] },
                { type: "heading", level: 3, text: "Categoría de la edificación y factor de uso (U)" },
                { type: "paragraph", text: ps.textoCategoria || "", alignment: "JUSTIFIED" },
                { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/tabla5.png"), width: 550, height: 350, caption: "Tabla N° 5 - CATEGORÍA DE LAS EDIFICACIONES Y FACTOR \"U\"", alignment: "CENTER" },
                { type: "paragraph", text: ps.textoProyecto || "", alignment: "JUSTIFIED" },
                { type: "heading", level: 3, text: "Irregularidades" },
                { type: "paragraph", text: ps.textoIrregularidadAltura || "", bold: true, alignment: "JUSTIFIED" },
                { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/tabla8.png"), width: 550, height: 400, caption: "Tabla N° 8 - IRREGULARIDADES ESTRUCTURALES EN ALTURA", alignment: "CENTER" },
                { type: "paragraph", text: ps.textoIrregularidadPlanta || "", bold: true, alignment: "JUSTIFIED" },
                { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/tabla9.png"), width: 550, height: 400, caption: "Tabla N° 9 - IRREGULARIDADES ESTRUCTURALES EN PLANTA", alignment: "CENTER" },
                { type: "heading", level: 3, text: "Coeficiente de reducción de las fuerzas sísmicas (R)" },
                { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/tabla7.png"), width: 550, height: 400, caption: "Tabla N° 7 - SISTEMAS ESTRUCTURALES", alignment: "CENTER" },
                { type: "paragraph", text: "Se determina mediante la siguiente expresión:", alignment: "JUSTIFIED" },
                { type: "paragraph", text: ps.textoFormulaR || "R = R₀ * Ia * Ip", bold: true, alignment: "CENTER" },
                { type: "paragraph", text: ps.textoDonde || "", alignment: "JUSTIFIED" },
                { type: "list", listType: "bullet", items: ps.listaDonde || [] },
                { type: "paragraph", text: ps.textoFuenteTabla || "", alignment: "JUSTIFIED" },
                { type: "heading", level: 3, text: ps.textoTanque || "" },
                { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/tabla4.png"), width: 550, height: 300, caption: "Tabla 4.1.1(b) - Response modification factor R (ACI 350.3-06)", alignment: "CENTER" },
                { type: "paragraph", text: ps.textoFuenteTanque || "", alignment: "JUSTIFIED" }
            );
        }

        if (mt.verificaciones) {
            const v = mt.verificaciones;
            marcoTeorico.content.push(
                { type: "heading", level: 2, text: "k) VERIFICAR LA FUERZA CORTANTE MINIMA" },
                { type: "paragraph", text: v.textoCortante || "", alignment: "JUSTIFIED" },
                { type: "paragraph", text: v.textoCortanteNorma || "", alignment: "JUSTIFIED" },
                { type: "heading", level: 2, text: "l) VERIFICACION DE DERIVAS" },
                { type: "paragraph", text: v.textoDerivas || "", alignment: "JUSTIFIED" },
                { type: "paragraph", text: v.textoDerivasTabla || "", alignment: "JUSTIFIED" },
                { type: "image", src: assetUrl("/assets/img/memoria_decriptiva/modulos/tabla11.png"), width: 500, height: 250, caption: "Tabla N° 11 - LÍMITES PARA LA DISTORSIÓN DEL ENTREPISO", alignment: "CENTER" },
                { type: "heading", level: 2, text: "m) JUNTA SISMICA ENTRE LOS MODULOS" },
                { type: "paragraph", text: v.textoJunta || "", alignment: "JUSTIFIED" },
                { type: "paragraph", text: v.textoJuntaFormula || "", alignment: "JUSTIFIED" },
                { type: "paragraph", text: v.formulaJunta || "S = 0.006 h ≥ 0.03 m", bold: true, alignment: "CENTER" }
            );
        }
    }

    transformConsideracionesGenerales(structure) {
        let consideraciones = structure.document.sections.find((s) => s.id === "consideraciones");
        if (!consideraciones) {
            consideraciones = { id: "consideraciones", title: "2. CONSIDERACIONES GENERALES DE DISEÑO", level: 1, content: [] };
            const descIdx = structure.document.sections.findIndex((s) => s.id === "descripcion_bloques");
            if (descIdx !== -1) {
                structure.document.sections.splice(descIdx + 1, 0, consideraciones);
            } else {
                structure.document.sections.push(consideraciones);
            }
        }

        const consideracionesData = this.sections.consideraciones || {};
        const content = [];
        const nombreModulos = ["MÓDULO I","MÓDULO II","MÓDULO III","MÓDULO IV","MÓDULO V","MÓDULO VI","MÓDULO VII","MÓDULO VIII","MÓDULO IX","MÓDULO X","MÓDULO XI","MÓDULO XII","MÓDULO XIII","MÓDULO XIV","MÓDULO XV","MÓDULO XVI"];

        // FIX: rutas correctas
        content.push({ type: "image", src: assetUrl("/assets/img/memoria_decriptiva/consideraciones/imagen1.png"), width: 550, height: 400, caption: "", alignment: "CENTER" });
        content.push({ type: "image", src: assetUrl("/assets/img/memoria_decriptiva/consideraciones/imagen2.png"), width: 550, height: 400, caption: "", alignment: "CENTER" });
        content.push({ type: "image", src: assetUrl("/assets/img/memoria_decriptiva/consideraciones/imagen3.png"), width: 550, height: 400, caption: "", alignment: "CENTER" });

        for (let i = 1; i <= 16; i++) {
            const moduloData = consideracionesData[i] || {};
            const geotecnia = moduloData.geotecnia || null;
            const num = `2.${i}`;

            content.push({ type: "heading", level: 2, text: `${num}. ${nombreModulos[i - 1]}` });
            content.push({ type: "heading", level: 3, text: `${num}.1. CONDICIONES GEOTÉCNICAS` });

            if (geotecnia) {
                content.push({
                    type: "table", widthPercent: 80,
                    columns: [{ header: "Parámetro", width: 45 }, { header: "", width: 5 }, { header: "Valor", width: 50 }],
                    rows: [
                        ["Perfil del suelo", ":", geotecnia.perfilSuelo || ""],
                        ["Capacidad Portante", ":", `${geotecnia.capacidadPortante || ""} kg/cm²`],
                        ["Profundidad de cimentación", ":", `${geotecnia.profundidad || ""} m`],
                        ["Agresividad de sulfatos", ":", geotecnia.agresividadSulfatos || ""],
                        ["Prof. N.F.", ":", geotecnia.profNF || ""]
                    ]
                });
            }

            content.push({ type: "heading", level: 3, text: `${num}.2. CONDICIONES SÍSMICAS - PARÁMETROS SISMORESISTENTES` });
            content.push({ type: "paragraph", text: "Los parámetros sísmicos considerados para el análisis de la estructura en estudio fueron los siguientes:", alignment: "JUSTIFIED" });
            content.push({ type: "paragraph", text: "Tabla N° 1 - FACTORES DE ZONA \"Z\"", bold: true, alignment: "CENTER" });
            content.push({
                type: "table", widthPercent: 50, alignment: "CENTER",
                rows: [
                    [{ text: "ZONA", shading: { fill: "0A1929" }, color: "FFFFFF", bold: true, alignment: "CENTER" }, { text: "Z", shading: { fill: "0A1929" }, color: "FFFFFF", bold: true, alignment: "CENTER" }],
                    [{ text: "4", alignment: "CENTER" }, { text: "0,45", alignment: "CENTER" }],
                    [{ text: "3", alignment: "CENTER" }, { text: "0,35", alignment: "CENTER" }],
                    [{ text: "2", alignment: "CENTER" }, { text: "0,25", alignment: "CENTER" }],
                    [{ text: "1", alignment: "CENTER" }, { text: "0,10", alignment: "CENTER" }]
                ]
            });

            // Tabla análisis X
            content.push({ type: "paragraph", text: "ANÁLISIS EN DIRECCIÓN X", bold: true, alignment: "CENTER" });
            const axData = moduloData.analisisX || {};
            const filasX = [
                [{ text: "PARÁMETRO", shading: { fill: "0A1929" }, color: "FFFFFF", bold: true, alignment: "CENTER" }, { text: "VALOR", shading: { fill: "0A1929" }, color: "FFFFFF", bold: true, alignment: "CENTER" }, { text: "UNIDAD", shading: { fill: "0A1929" }, color: "FFFFFF", bold: true, alignment: "CENTER" }],
                [{ text: "Factor Z", alignment: "LEFT" }, { text: axData.factorZ || "0.25", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "Factor U", alignment: "LEFT" }, { text: axData.factorU || "1.50", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "Factor S", alignment: "LEFT" }, { text: axData.factorS || "1.40", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "Tp", alignment: "LEFT" }, { text: axData.tp || "1.00", alignment: "CENTER" }, { text: "s", alignment: "CENTER" }],
                [{ text: "Tl", alignment: "LEFT" }, { text: axData.tl || "1.60", alignment: "CENTER" }, { text: "s", alignment: "CENTER" }],
                [{ text: "C", alignment: "LEFT" }, { text: axData.c || "2.50", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "T", alignment: "LEFT" }, { text: axData.t || "6.00", alignment: "CENTER" }, { text: "s", alignment: "CENTER" }],
                [{ text: "R", alignment: "LEFT" }, { text: axData.r || "6.00", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "C/R", alignment: "LEFT" }, { text: axData.cr || "0.2188", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
            ];
            content.push({ type: "table", widthPercent: 75, alignment: "CENTER", rows: filasX });

            // Tabla análisis Y
            content.push({ type: "paragraph", text: "ANÁLISIS EN DIRECCIÓN Y", bold: true, alignment: "CENTER" });
            const ayData = moduloData.analisisY || {};
            const filasY = [
                [{ text: "PARÁMETRO", shading: { fill: "0A1929" }, color: "FFFFFF", bold: true, alignment: "CENTER" }, { text: "VALOR", shading: { fill: "0A1929" }, color: "FFFFFF", bold: true, alignment: "CENTER" }, { text: "UNIDAD", shading: { fill: "0A1929" }, color: "FFFFFF", bold: true, alignment: "CENTER" }],
                [{ text: "Factor Z", alignment: "LEFT" }, { text: ayData.factorZ || "0.25", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "Factor U", alignment: "LEFT" }, { text: ayData.factorU || "1.50", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "Factor S", alignment: "LEFT" }, { text: ayData.factorS || "1.40", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "Tp", alignment: "LEFT" }, { text: ayData.tp || "1.00", alignment: "CENTER" }, { text: "s", alignment: "CENTER" }],
                [{ text: "Tl", alignment: "LEFT" }, { text: ayData.tl || "1.60", alignment: "CENTER" }, { text: "s", alignment: "CENTER" }],
                [{ text: "C", alignment: "LEFT" }, { text: ayData.c || "2.50", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "T", alignment: "LEFT" }, { text: ayData.t || "6.00", alignment: "CENTER" }, { text: "s", alignment: "CENTER" }],
                [{ text: "R", alignment: "LEFT" }, { text: ayData.r || "6.00", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
                [{ text: "C/R", alignment: "LEFT" }, { text: ayData.cr || "0.359", alignment: "CENTER" }, { text: "", alignment: "CENTER" }],
            ];
            content.push({ type: "table", widthPercent: 75, alignment: "CENTER", rows: filasY });

            content.push({ type: "heading", level: 3, text: `${num}.3. MÉTODO DE DISEÑO` });
            content.push({ type: "heading", level: 4, text: `${num}.3.1. RECUBRIMIENTOS DE ELEMENTOS` });
            if (moduloData.recubrimientosIntro) {
                moduloData.recubrimientosIntro.split('\n').filter(p => p.trim()).forEach(p => content.push({ type: "paragraph", text: p, alignment: "JUSTIFIED" }));
            }
            if (moduloData.recubrimientosLista?.length > 0) {
                content.push({ type: "list", listType: "bullet", items: moduloData.recubrimientosLista });
            }

            content.push({ type: "heading", level: 4, text: `${num}.3.2. MATERIALES DE DISEÑO` });
            if (moduloData.materialesIntro) {
                moduloData.materialesIntro.split('\n').filter(p => p.trim()).forEach(p => content.push({ type: "paragraph", text: p, alignment: "JUSTIFIED" }));
            }
            if (moduloData.materialesLista?.length > 0) {
                content.push({ type: "list", listType: "bullet", items: moduloData.materialesLista });
            }

            content.push({ type: "heading", level: 4, text: `${num}.3.3. SOBRECARGAS EMPLEADAS` });
            const sobrecargasIntro = moduloData.sobrecargasIntro || "La estimación de cargas verticales se evaluará conforme a la norma E-020.";
            sobrecargasIntro.split('\n').filter(p => p.trim()).forEach(p => content.push({ type: "paragraph", text: p, alignment: "JUSTIFIED" }));
            if (moduloData.sobrecargasMuertas?.length > 0) {
                content.push({ type: "paragraph", text: "Cargas muertas", bold: true, alignment: "JUSTIFIED" });
                content.push({ type: "list", listType: "bullet", items: moduloData.sobrecargasMuertas });
            }
            if (moduloData.sobrecargasVivas?.length > 0) {
                content.push({ type: "paragraph", text: "Cargas vivas", bold: true, alignment: "JUSTIFIED" });
                content.push({ type: "list", listType: "bullet", items: moduloData.sobrecargasVivas });
            }
            if (moduloData.cargaSismicaTexto) {
                content.push({ type: "paragraph", text: "Carga Sísmica", bold: true, alignment: "JUSTIFIED" });
                moduloData.cargaSismicaTexto.split('\n').filter(p => p.trim()).forEach(p => content.push({ type: "paragraph", text: p, alignment: "JUSTIFIED" }));
            }

            const sismicoModulo = moduloData.sismico || {};
            const rX = sismicoModulo.coeficienteR_X || "6";
            const rY = sismicoModulo.coeficienteR_Y || "3";
            const sistX = sismicoModulo.sistemaX || "columnas y muros estructurales";
            const sistY = sismicoModulo.sistemaY || "albañilería confinada";
            content.push({ type: "paragraph", text: `Coeficiente de reducción sísmica, R: En la dirección XX las estructuras estarán configuradas en base a ${sistX}, entonces le corresponde un factor de reducción de R = ${rX}; y en la dirección YY las estructuras estarán configuradas en base a ${sistY}, entonces le corresponde un factor de reducción de R = ${rY}.`, alignment: "JUSTIFIED" });

            content.push({ type: "heading", level: 4, text: `${num}.3.4. MÉTODO DE DISEÑO` });
            const metodoDisenoTexto = moduloData.metodoDisenoTexto || moduloData["metodoDiseñoTexto"] || "";
            if (metodoDisenoTexto) {
                metodoDisenoTexto.split('\n').filter(p => p.trim()).forEach(p => {
                    const esTitulo = p === p.toUpperCase() && p.length < 50;
                    content.push({ type: "paragraph", text: p, bold: esTitulo, alignment: "JUSTIFIED" });
                });
            }

            if (i === 1) {
                content.push({ type: "paragraph", text: "Desplazamientos máximos permitidos:", bold: true, alignment: "JUSTIFIED" });
                content.push({ type: "image", src: assetUrl("/assets/img/memoria_decriptiva/consideraciones/ultimaTabla.png"), width: 500, height: 300, caption: "", alignment: "CENTER" });
            }

            if (i < 16) content.push({ type: "pageBreak" });
        }

        consideraciones.content = content;
    }

    // ============================================
    // SECCIÓN 3 - PREDIMENSIONAMIENTO
    // ============================================
    transformPredimensionamiento(structure) {
        let predimSection = structure.document.sections.find((s) => s.id === "predimensionamiento");
        if (!predimSection) {
            predimSection = { id: "predimensionamiento", title: "4. PREDIMENSIONAMIENTO DE ELEMENTOS ESTRUCTURALES", level: 1, content: [] };
            structure.document.sections.push(predimSection);
        }

        const predimData = this.sections.predimensionamiento || {};
        const previews = this.previews || {};
        const content = [];

        content.push({ type: "paragraph", text: "Se definirá las dimensiones de los elementos estructurales en base a ciertos criterios establecidos y/o recomendados.", alignment: "JUSTIFIED" });
        content.push({ type: "heading", level: 2, text: "Criterios Generales" });
        content.push({ type: "list", listType: "bullet", items: ["Pre dimensionamiento de losa aligerada: h = L/25.", "Pre dimensionamiento de vigas peraltadas: h = L/10, L/11 o L/12.", "Pre dimensionamiento de columnas: según carga tributaria, mínimo 25x25 cm."] });

        for (let i = 1; i <= 15; i++) {
            const modulo = predimData[i];
            if (!modulo) continue;

            content.push({ type: "heading", level: 2, text: `MÓDULO ${String(i).padStart(2, '0')}` });

            if (modulo.techos) {
                content.push({ type: "heading", level: 3, text: "Pre dimensionamiento de los techos" });
                const relacion = modulo.techos.espesor && parseFloat(modulo.techos.espesor) > 0
                    ? (parseFloat(modulo.techos.luz) / parseFloat(modulo.techos.espesor)).toFixed(1)
                    : "N/A";
                content.push({
                    type: "table", widthPercent: 70,
                    columns: [{ header: "Parámetro", width: 40 }, { header: "Valor", width: 60 }],
                    rows: [
                        ["Tipo de techo", modulo.techos.tipo || ""],
                        ["Luz mayor", modulo.techos.luz ? `${modulo.techos.luz} m` : ""],
                        ["Espesor propuesto", modulo.techos.espesor ? `${modulo.techos.espesor} m` : ""],
                        ["Relación L/h", relacion]
                    ]
                });
            }

            const losaImage = previews.predimLosaImage?.[i];
            if (losaImage) {
                content.push({ type: "image", src: losaImage, width: 500, height: 300, caption: `Pre-dimensionamiento losa aligerado Módulo ${String(i).padStart(2, '0')}`, alignment: "CENTER" });
            }

            if (modulo.vigas?.principal) {
                content.push({ type: "heading", level: 3, text: "Pre dimensionamiento de vigas" });
                const v = modulo.vigas.principal;
                content.push({
                    type: "table", widthPercent: 90, title: "Vigas Principales",
                    columns: [{ header: "Eje", width: 15 }, { header: "b (cm)", width: 20 }, { header: "h (cm)", width: 20 }, { header: "Luz (m)", width: 20 }, { header: "Relación b/h", width: 25 }],
                    rows: [
                        ["A", v.ejeA?.b || "", v.ejeA?.h || "", v.ejeA?.luz || "", (parseFloat(v.ejeA?.b || 0) / parseFloat(v.ejeA?.h || 1)).toFixed(2)],
                        ["B", v.ejeB?.b || "", v.ejeB?.h || "", v.ejeB?.luz || "", (parseFloat(v.ejeB?.b || 0) / parseFloat(v.ejeB?.h || 1)).toFixed(2)],
                        ["C", v.ejeC?.b || "", v.ejeC?.h || "", v.ejeC?.luz || "", (parseFloat(v.ejeC?.b || 0) / parseFloat(v.ejeC?.h || 1)).toFixed(2)]
                    ]
                });
            }

            const vigaImage = previews.predimVigaImage?.[i];
            if (vigaImage) {
                content.push({ type: "image", src: vigaImage, width: 500, height: 300, caption: `Pre-dimensionamiento viga Módulo ${String(i).padStart(2, '0')}`, alignment: "CENTER" });
            }

            if (modulo.columnas) {
                content.push({ type: "heading", level: 3, text: "Pre dimensionamiento de columnas" });
                const c = modulo.columnas;
                content.push({
                    type: "table", widthPercent: 90, title: "Columnas",
                    columns: [{ header: "Columna", width: 20 }, { header: "b (cm)", width: 20 }, { header: "h (cm)", width: 20 }, { header: "Área (cm²)", width: 20 }, { header: "Observación", width: 20 }],
                    rows: [
                        ["C1 (esquina)", c.c1?.b || "", c.c1?.h || "", (parseFloat(c.c1?.b || 0) * parseFloat(c.c1?.h || 0)).toFixed(0), c.c1?.obs || ""],
                        ["C2 (borde)", c.c2?.b || "", c.c2?.h || "", (parseFloat(c.c2?.b || 0) * parseFloat(c.c2?.h || 0)).toFixed(0), c.c2?.obs || ""],
                        ["C3 (central)", c.c3?.b || "", c.c3?.h || "", (parseFloat(c.c3?.b || 0) * parseFloat(c.c3?.h || 0)).toFixed(0), c.c3?.obs || ""]
                    ]
                });
            }

            if (modulo.observaciones) {
                content.push({ type: "paragraph", text: modulo.observaciones, alignment: "JUSTIFIED", italic: true });
            }

            if (i < 15) content.push({ type: "pageBreak" });
        }

        content.push({ type: "paragraph", text: "Nota: Las dimensiones finales serán verificadas mediante el análisis estructural detallado.", alignment: "JUSTIFIED", italic: true });
        predimSection.content = content;
    }

    // ============================================
    // SECCIÓN 4 - DEMOLICIÓN
    // ============================================
    transformDemolicion(structure) {
        let demSection = structure.document.sections.find((s) => s.id === "demolicion");
        if (!demSection) {
            demSection = { id: "demolicion", title: "5. ALCANCE DEL ESTUDIO DE DEMOLICIÓN", level: 1, content: [] };
            structure.document.sections.push(demSection);
        }

        const demData = this.sections.demolicion || {};
        const previews = this.previews || {};
        const content = [];

        content.push({ type: "paragraph", text: demData.alcance || "", alignment: "JUSTIFIED" });

        const modulosADemoler = (demData.modulosADemoler || []).filter(m => m && m.trim() !== "");
        content.push({ type: "heading", level: 2, text: "Módulos a Demoler" });
        content.push({ type: "list", listType: "numbered", items: modulosADemoler.length > 0 ? modulosADemoler : ["Sin módulos definidos"] });

        const obrasExteriores = (demData.obrasExterioresADemoler || []).filter(o => o && o.trim() !== "");
        content.push({ type: "heading", level: 2, text: "Obras Exteriores a Demoler" });
        content.push({ type: "list", listType: "numbered", items: obrasExteriores.length > 0 ? obrasExteriores : ["Sin obras exteriores definidas"] });

        const demolicionImages = (previews.demolicionImages || []).filter(img => img && img !== null);
        if (demolicionImages.length > 0) {
            content.push({ type: "heading", level: 2, text: "Evidencia Fotográfica" });
            demolicionImages.forEach((src, i) => {
                content.push({ type: "image", src, width: 500, height: 350, caption: `Evidencia fotográfica ${i + 1}`, alignment: "CENTER" });
            });
        }

        demSection.content = content;
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================
    normalizeText(value) {
        return String(value || "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-]/g, " ").replace(/\s+/g, " ");
    }

    romanoANumero(romano) {
        const m = {I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,XI:11,XII:12,XIII:13,XIV:14,XV:15,XVI:16};
        return m[String(romano || "").toUpperCase()] || null;
    }

    extraerNumeroModulo(nombre) {
        if (!nombre) return null;
        const partes = String(nombre).trim().split(/\s+/);
        const ultimo = partes[partes.length - 1];
        const numero = parseInt(ultimo, 10);
        return Number.isFinite(numero) ? numero : this.romanoANumero(ultimo);
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
}