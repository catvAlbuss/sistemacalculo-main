// content-processor-mc.js - Procesador de contenido para Memoria de Calculo
export class ContentProcessorMC {
    constructor(docxLib, data = {}) {
        this.docx = docxLib;
        this.data = data;
        if (!this.docx) {
            throw new Error("docx library not set. Provide window.docx.");
        }
    }

    async buildDocument(structure, images = {}) {
        const { Document, SectionType, Paragraph, TextRun, Header, Footer, AlignmentType, PageNumber, NumberFormat, TableOfContents, PageBreak } = this.docx;

        const coverChildren = await this.createCover(structure.cover, images);

        // El resto del documento (Indice + Secciones) en una sección con headers/footers
        const documentChildren = [];

        // 1. Indice en su propia página
        documentChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: "ÍNDICE GENERAL",
                    bold: true,
                    size: 32,
                    font: "Arial",
                    color: "000000"
                })
            ],
            spacing: { before: 400, after: 600 }
        }));

        documentChildren.push(new TableOfContents("Indice", {
            hyperlink: true,
            headingStyleRange: "1-3",
        }));

        // 2. Procesar Secciones
        for (const section of structure.document.sections) {
            const sectionElements = await this.processSection(section);
            documentChildren.push(...sectionElements);
        }

        return new Document({
            sections: [
                {
                    properties: { type: SectionType.NEXT_PAGE },
                    children: coverChildren
                },
                {
                    properties: {
                        type: SectionType.NEXT_PAGE,
                        pageNumber: {
                            start: 1,
                            format: NumberFormat.DECIMAL,
                        },
                    },
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: (structure.cover.project || "MEMORIA DE CÁLCULO").toUpperCase(),
                                            size: 14,
                                            color: "888888",
                                            font: "Arial"
                                        })
                                    ],
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { after: 200 },
                                    border: {
                                        bottom: { color: "cccccc", space: 1, style: "single", size: 6 }
                                    }
                                })
                            ]
                        })
                    },
                    footers: {
                        default: new Footer({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Página ",
                                            size: 18,
                                            color: "888888",
                                            font: "Arial"
                                        }),
                                        new TextRun({
                                            children: [PageNumber.CURRENT],
                                            size: 18,
                                            color: "888888",
                                            font: "Arial"
                                        }),
                                        new TextRun({
                                            text: " de ",
                                            size: 18,
                                            color: "888888",
                                            font: "Arial"
                                        }),
                                        new TextRun({
                                            children: [PageNumber.TOTAL_PAGES],
                                            size: 18,
                                            color: "888888",
                                            font: "Arial"
                                        })
                                    ],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 200 },
                                    border: {
                                        top: { color: "cccccc", space: 1, style: "single", size: 6 }
                                    }
                                })
                            ]
                        })
                    },
                    children: documentChildren
                }
            ]
        });
    }

    async createCover(cover, images) {
        const { Paragraph, TextRun, AlignmentType, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } = this.docx;
        const children = [];

        // Título Principal
        children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: (cover.title || "MEMORIA DE CÁLCULO").toUpperCase(),
                    bold: true,
                    size: 36,
                    font: "Arial",
                    color: "000000"
                })
            ],
            spacing: { before: 800 }
        }));

        if (cover.subtitle) {
            children.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: cover.subtitle.toUpperCase(),
                        bold: true,
                        size: 32,
                        font: "Arial",
                        color: "000000"
                    })
                ],
                spacing: { after: 600 }
            }));
        }

        // Nombre del Proyecto (Más prominente)
        children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: cover.project ? String(cover.project).toUpperCase() : "NOMBRE DEL PROYECTO NO DEFINIDO",
                    bold: true,
                    size: 26,
                    font: "Arial",
                    color: cover.project ? "000000" : "999999"
                })
            ],
            spacing: { before: 400, after: 800 }
        }));

        // Lógica de Imágenes según tipo
        if (cover.reportType === "MODULOS") {
            // Diseño de 2 fotos (Lado a lado en una tabla invisible o arriba/abajo)
            // Usamos tabla invisible para lado a lado
            const img1 = images.coverImage;
            const img2 = images.coverImage2;

            if (img1 && img2) {
                try {
                    const buf1 = await this.dataUrlToArrayBuffer(img1);
                    const buf2 = await this.dataUrlToArrayBuffer(img2);

                    children.push(new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [new ImageRun({ data: buf1, transformation: { width: 260, height: 440 } })]
                                        })]
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [new ImageRun({ data: buf2, transformation: { width: 260, height: 440 } })]
                                        })]
                                    })
                                ]
                            })
                        ]
                    }));
                } catch (e) { console.error(e); }
            } else if (img1 || img2) {
                // Si solo hay una en modo módulos, la ponemos grande
                try {
                    const buf = await this.dataUrlToArrayBuffer(img1 || img2);
                    children.push(new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new ImageRun({ data: buf, transformation: { width: 500, height: 440 } })]
                    }));
                } catch (e) { }
            }
        } else {
            // Diseño CASA (1 foto sola muy grande)
            if (images.coverImage) {
                try {
                    const coverBuffer = await this.dataUrlToArrayBuffer(images.coverImage);
                    children.push(new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: coverBuffer,
                                transformation: { width: 550, height: 460 }
                            })
                        ],
                        spacing: { before: 400, after: 600 }
                    }));
                } catch (e) {
                    console.error("Error processing cover image", e);
                }
            }
        }

        return children;
    }

    async processSection(section) {
        const elements = [];
        elements.push(this.createHeading(section.title, section.level));

        for (const item of section.content) {
            // Pasamos el nivel de la sección para el alineamiento de imágenes/tablas
            const processed = await this.processContentItem(item, section.level);
            if (Array.isArray(processed)) {
                elements.push(...processed);
            } else if (processed) {
                elements.push(processed);
            }
        }

        return elements;
    }

    async processContentItem(item, parentLevel = 1) {
        switch (item.type) {
            case "heading":
                return this.createHeading(item.text, item.level, item.underline);
            case "paragraph":
                return this.createParagraph(item);
            case "list":
                return this.createList(item);
            case "image":
                return await this.createImage(item, item.level || parentLevel);
            case "table":
                return await this.createTable(item);
            case "subsection":
                return await this.createSubsection(item);
            case "captured-image":
                return await this.createCapturedImage(item);
            default:
                console.warn(`Unknown content type: ${item.type}`);
                return null;
        }
    }

    createHeading(text, level, underline = false) {
        const { Paragraph, TextRun, AlignmentType, HeadingLevel, UnderlineType } = this.docx;

        const levels = {
            1: HeadingLevel.HEADING_1,
            2: HeadingLevel.HEADING_2,
            3: HeadingLevel.HEADING_3,
            4: HeadingLevel.HEADING_4
        };

        const sizes = { 1: 24, 2: 22, 3: 20, 4: 18 };

        // Sangría reducida para encabezados para mejor aprovechamiento de espacio
        let leftIndent = 0;
        if (level === 1) leftIndent = 0;      // Pegado al margen
        if (level === 2) leftIndent = 432;    // 0.76 cm
        if (level >= 3) leftIndent = 864;     // 1.52 cm

        const processedText = this.replaceVariables(text);

        const headingProps = {
            text: processedText,
            bold: true,
            size: sizes[level] || 24,
            font: "Arial",
            color: "000000"
        };

        if (underline) {
            headingProps.underline = { type: UnderlineType.SINGLE };
        }

        return new Paragraph({
            heading: levels[level] || HeadingLevel.HEADING_1,
            children: [new TextRun(headingProps)],
            alignment: AlignmentType.LEFT,
            spacing: {
                before: level === 1 ? 400 : 240,
                after: level === 1 ? 200 : 120
            },
            indent: {
                left: leftIndent
            },
            pageBreakBefore: level === 1
        });
    }

    createParagraph(item) {
        const { Paragraph, TextRun, AlignmentType } = this.docx;

        let children = [];

        if (typeof item.text === 'string') {
            const processedText = this.replaceVariables(item.text);
            children.push(new TextRun({
                text: processedText,
                font: "Arial",
                size: 22,
                color: "000000"
            }));
        } else if (item.text && item.text.parts) {
            for (const part of item.text.parts) {
                const processedText = this.replaceVariables(part.text);
                children.push(new TextRun({
                    text: processedText,
                    font: "Arial",
                    size: 22,
                    color: "000000",
                    bold: !!part.bold,
                    italic: !!part.italic,
                    underline: part.underline ? { type: this.docx.UnderlineType.SINGLE } : undefined
                }));
            }
        }

        return new Paragraph({
            children: children,
            alignment: this.getAlignment(item.alignment || "JUSTIFIED"),
            spacing: {
                after: 120,
                line: 276 // Interlineado 1.15
            },
            indent: {
                left: 1122 // Sangría base para párrafos de contenido
            }
        });
    }

    createList(item) {
        const { Paragraph, TextRun, AlignmentType } = this.docx;
        const elements = [];

        for (let i = 0; i < item.items.length; i++) {
            const processedText = this.replaceVariables(item.items[i]);
            const prefix = item.listType === "numbered" ? `${i + 1}. ` : "• ";

            elements.push(new Paragraph({
                children: [
                    new TextRun({
                        text: prefix + processedText,
                        font: "Arial",
                        size: 22,
                        color: "000000"
                    })
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 120, line: 276 },
                indent: { left: 1872, hanging: 360 } // Mayor sangría para listados
            }));
        }

        return elements;
    }

    async createSubsection(item) {
        const elements = [];
        elements.push(this.createHeading(item.title, 4));

        for (const contentItem of item.content) {
            const processed = await this.processContentItem(contentItem);
            if (Array.isArray(processed)) {
                elements.push(...processed);
            } else if (processed) {
                elements.push(processed);
            }
        }

        return elements;
    }

    async createImage(item, level = 1) {
        const { Paragraph, ImageRun, TextRun, AlignmentType } = this.docx;
        const src = this.replaceVariables(item.src);
        if (!src) return null;

        try {
            const imageBuffer = await this.getImageBuffer(src);
            if (!imageBuffer) return null;

            const elements = [];

            // Sangría para alinear con el texto del nivel correspondiente
            let leftIndent = 1152; // Sangría base de párrafos
            if (level === 1) leftIndent = 0;
            if (level === 2) leftIndent = 432;
            if (level >= 3) leftIndent = 1152;

            elements.push(new Paragraph({
                alignment: this.getAlignment(item.alignment || "CENTER"),
                children: [
                    new ImageRun({
                        data: imageBuffer,
                        transformation: {
                            width: item.width || 450,
                            height: item.height || 300
                        }
                    })
                ],
                spacing: {
                    before: item.verticalCenter ? 2400 : 240,
                    after: item.verticalCenter ? 400 : 120
                },
                indent: { left: (item.alignment === "CENTER" || !item.alignment) ? 0 : leftIndent },
                pageBreakBefore: item.pageBreakBefore || false
            }));

            // Si hay descripción (caption)
            if (item.caption) {
                elements.push(new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: this.replaceVariables(item.caption),
                            italics: true,
                            size: 18,
                            font: "Arial",
                            color: "555555"
                        })
                    ],
                    spacing: { after: 240 },
                    indent: { left: 0 }
                }));
            }

            return elements;
        } catch (e) {
            console.error("Error building image element", e);
            return null;
        }
    }

    async getImageBuffer(src) {
        if (src.startsWith("data:")) {
            return await this.dataUrlToArrayBuffer(src);
        }

        // Es una URL/Ruta de servidor
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(`No se pudo cargar la imagen: ${src}`);
            return await response.arrayBuffer();
        } catch (error) {
            console.error("Error fetching static image:", error);
            return null;
        }
    }

    async createCapturedImage(item) {
        const { Paragraph, ImageRun, AlignmentType } = this.docx;

        // Intentar usar las funciones de captura si están disponibles en window
        try {
            let canvas;
            if (window.captureElementContentDynamic) {
                canvas = await window.captureElementContentDynamic(item.elementId, {
                    width: 1080,
                    height: item.height
                });
            } else if (window.html2canvas) {
                const element = document.getElementById(item.elementId);
                if (element) {
                    canvas = await window.html2canvas(element);
                }
            }

            if (!canvas) throw new Error("Capture failed");

            const imageDataUrl = canvas.toDataURL('image/png');
            const imageBuffer = await this.dataUrlToArrayBuffer(imageDataUrl);

            return new Paragraph({
                alignment: this.getAlignment(item.alignment || "CENTER"),
                children: [
                    new ImageRun({
                        data: imageBuffer,
                        transformation: {
                            width: item.width || 500,
                            height: item.height || 480
                        }
                    })
                ],
                spacing: { before: 240, after: 240 }
            });
        } catch (e) {
            console.warn("Captured image failed, skipping", e);
            return null;
        }
    }

    async createTable(item) {
        const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle, AlignmentType, VerticalAlign, VerticalMergeType } = this.docx;

        const rows = [];

        // Fila de Título (opcional)
        if (item.title) {
            rows.push(new TableRow({
                children: [
                    new TableCell({
                        columnSpan: item.columns?.length || 1,
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: item.title, bold: true, size: 24, font: "Arial" })],
                                alignment: AlignmentType.CENTER
                            })
                        ],
                        shading: { fill: "F8C471" },
                        verticalAlign: VerticalAlign.CENTER
                    })
                ]
            }));
        }

        // Header
        if (item.columns) {
            rows.push(new TableRow({
                children: item.columns.map(col => new TableCell({
                    width: { size: col.width || 100 / item.columns.length, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({
                        children: [new TextRun({
                            text: col.header,
                            bold: true,
                            size: 20,
                            font: "Arial",
                            color: (col.color || "000000").replace("#", "")
                        })],
                        alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: (col.fill || "FDEBD0").replace("#", "") },
                    verticalAlign: VerticalAlign.CENTER
                }))
            }));
        }

        // Mapeo para manejar verticalMerge dinámicamente
        const mergeCounters = new Array(item.columns ? item.columns.length : 10).fill(0);

        // Rows
        for (const rowData of (item.rows || [])) {
            const cells = [];

            for (let cIdx = 0; cIdx < rowData.length; cIdx++) {
                const cellData = rowData[cIdx];
                const isObj = typeof cellData === 'object' && cellData !== null;

                // Lógica de Mezcla Vertical
                let vMerge = undefined;
                if (isObj && cellData.rowSpan > 1) {
                    vMerge = VerticalMergeType.RESTART;
                    mergeCounters[cIdx] = cellData.rowSpan - 1;
                } else if (mergeCounters[cIdx] > 0) {
                    vMerge = VerticalMergeType.CONTINUE;
                    mergeCounters[cIdx]--;
                }

                if (vMerge === VerticalMergeType.CONTINUE) {
                    cells.push(new TableCell({ verticalMerge: vMerge, children: [] }));
                    continue;
                }

                // --- PROCESAMIENTO DE CONTENIDO DE CELDA ---
                let cellChildren = [];

                if (isObj && (cellData.type || cellData.stack)) {
                    // Es un contenido complejo (imagen, tabla anidada, o un stack de cosas)
                    const contentToProcess = cellData.stack || [cellData];
                    for (const subItem of contentToProcess) {
                        const processed = await this.processContentItem(subItem);
                        if (Array.isArray(processed)) cellChildren.push(...processed);
                        else if (processed) cellChildren.push(processed);
                    }
                } else {
                    // Es texto simple u objeto con propiedades de texto
                    const rawText = isObj ? String(cellData.text ?? "") : String(cellData);
                    const textColor = isObj ? (cellData.color || "000000") : "000000";
                    const bold = isObj ? !!cellData.bold : false;
                    const size = isObj && cellData.size ? cellData.size : 18;
                    const alignment = isObj && cellData.alignment ? this.getAlignment(cellData.alignment) : AlignmentType.CENTER;

                    const processedText = this.replaceVariables(rawText);
                    const lines = (processedText || "").split("\n");

                    cellChildren.push(new Paragraph({
                        alignment: alignment,
                        spacing: cellData.spacing || { after: 0 },
                        children: lines.map((line, idx) => new TextRun({
                            text: line,
                            size: size,
                            font: "Arial",
                            color: textColor.replace("#", ""),
                            bold: bold,
                            break: idx > 0 ? 1 : 0
                        }))
                    }));
                }

                const bgColor = isObj ? cellData.fill : null;
                const vAlign = isObj && cellData.vAlign ? cellData.vAlign : VerticalAlign.CENTER;

                cells.push(new TableCell({
                    children: cellChildren,
                    shading: bgColor ? { fill: bgColor.replace("#", "") } : undefined,
                    verticalAlign: vAlign,
                    verticalMerge: vMerge,
                    columnSpan: isObj ? cellData.columnSpan : undefined
                }));
            }

            rows.push(new TableRow({ children: cells }));
        }

        const borderStyle = item.noBorders ? BorderStyle.NONE : BorderStyle.SINGLE;
        const borderSize = item.noBorders ? 0 : 1;

        return new Table({
            width: { size: item.widthPercent || 60, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: rows,
            borders: {
                top: { style: borderStyle, size: borderSize },
                bottom: { style: borderStyle, size: borderSize },
                left: { style: borderStyle, size: borderSize },
                right: { style: borderStyle, size: borderSize },
                insideHorizontal: { style: borderStyle, size: borderSize },
                insideVertical: { style: borderStyle, size: borderSize }
            },
            indent: { size: 0, type: WidthType.DXA }
        });
    }

    getAlignment(alignment) {
        const alignments = {
            LEFT: this.docx.AlignmentType.LEFT,
            CENTER: this.docx.AlignmentType.CENTER,
            RIGHT: this.docx.AlignmentType.RIGHT,
            JUSTIFIED: this.docx.AlignmentType.JUSTIFIED
        };
        return alignments[alignment] || this.docx.AlignmentType.LEFT;
    }

    replaceVariables(text) {
        let processed = String(text ?? "");
        if (!processed) return "";
        return processed.replace(/{{(.*?)}}/g, (match, varName) => {
            const value = this.getValueByPath(this.data, varName.trim());
            return value !== undefined ? value : match;
        });
    }

    getValueByPath(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    async dataUrlToArrayBuffer(dataUrl) {
        if (!dataUrl || !dataUrl.startsWith("data:")) return null;
        const b64 = dataUrl.split(",")[1];
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
