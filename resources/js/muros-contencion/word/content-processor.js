// content-processor.js - Procesador de contenido dinámico para documentos Word
export class ContentProcessor {
    constructor(data, calculations, verifications, reinforcement) {
        this.data = data || {};
        this.calculations = calculations || {};
        this.verifications = verifications || {};
        this.reinforcement = reinforcement || {};
        this.docx = null;
    }

    setDocxLibrary(docxLib) {
        this.docx = docxLib;
    }

    // Procesa toda la estructura de contenido
    async processContent(contentStructure, principalImage = null, planoImage = null) {
        if (!this.docx) {
            throw new Error('docx library not set. Call setDocxLibrary() first.');
        }

        const { Document, Paragraph, TextRun, ImageRun, AlignmentType } = this.docx;
        const processedSections = [];

        // Crear la portada
        const coverPage = [
            new Paragraph({
                text: "",
                spacing: { before: 1000 }
            }),
        ];

        // Añadir imágenes si están disponibles
        if (principalImage) {
            coverPage.push(new Paragraph({
                children: [
                    new ImageRun({
                        data: principalImage,
                        transformation: {
                            width: 400,
                            height: 300
                        }
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }));
        }

        if (planoImage) {
            coverPage.push(new Paragraph({
                children: [
                    new ImageRun({
                        data: planoImage,
                        transformation: {
                            width: 400,
                            height: 300
                        }
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }));
        }

        // Agregar la portada al inicio de las secciones procesadas
        processedSections.push(...coverPage);

        // Procesar el resto del contenido
        for (const section of contentStructure.document.sections) {
            const processedSection = await this.processSection(section);
            processedSections.push(...processedSection);
        }

        return processedSections;
    }

    // Procesa una sección individual
    async processSection(section) {
        const { Paragraph, TextRun } = this.docx;
        const elements = [];

        // Título de la sección
        elements.push(this.createHeading(section.title, section.level));

        // Procesar contenido de la sección
        for (const contentItem of section.content) {
            const processedItems = await this.processContentItem(contentItem);
            if (Array.isArray(processedItems)) {
                elements.push(...processedItems);
            } else if (processedItems) {
                elements.push(processedItems);
            }
        }

        return elements;
    }

    // Procesa un elemento de contenido individual
    async processContentItem(item) {
        switch (item.type) {
            case 'heading':
                return this.createHeading(item.text, item.level, item.underline);

            case 'paragraph':
                return this.createParagraph(item);

            case 'list':
                return this.createList(item);

            case 'table':
                return this.createTable(item);

            case 'image':
                return this.createImage(item);

            case "captured-image":
                return await this.createCapturedImage(item);

            case 'dynamic-content':
                return await this.processDynamicContent(item);

            case 'calculation-result':
                return this.createCalculationResult(item);

            case 'verification-table':
                return this.createVerificationTable(item);

            case 'seismic-analysis-table':
                return this.createSeismicAnalysisTable(item);

            case 'soil-stress-table':
                return this.createSoilStressTable(item);

            case 'reinforcement-tables':
                return this.createReinforcementTables(item);

            case 'subsection':
                return await this.processSubsection(item);

            case 'calculation-block':
                return this.createCalculationBlock(item);

            default:
                console.warn(`Unknown content type: ${item.type}`);
                return null;
        }
    }

    // Crear heading
    createHeading(text, level, underline = false) {
        const { Paragraph, TextRun, AlignmentType, UnderlineType } = this.docx;

        // 🔹 Reemplazar variables si existen (no afecta a textos normales)
        const processedText = this.replaceVariables
            ? this.replaceVariables(text)
            : text;

        const headingProps = {
            text: processedText,
            bold: true,
            size: this.getHeadingSize(level),
            font: "Arial",
            color: "#000000"
        };

        if (underline) {
            headingProps.underline = { type: UnderlineType.SINGLE };
        }

        // Sangría por nivel
        let leftIndent = 0;
        if (level === 1) leftIndent = 363;   // 0.64 cm
        if (level === 2) leftIndent = 1077;  // 1.90 cm
        if (level === 4) leftIndent = 1077;

        return new Paragraph({
            children: [new TextRun(headingProps)],
            heading: this.getHeadingLevel(level),
            alignment: AlignmentType.LEFT,
            spacing: {
                before: level === 1 ? 400 : 240,
                after: level === 1 ? 200 : 120
            },
            indent: {
                left: leftIndent
            }
        });
    }

    // Crear párrafo
    createParagraph(item) {
        const { Paragraph, TextRun, AlignmentType } = this.docx;

        let children = [];

        if (typeof item.text === 'string') {
            // Procesar variables en el texto
            const processedText = this.replaceVariables(item.text);
            children.push(new TextRun({
                text: processedText,
                font: "Arial",
                size: 24,
                color: "#000000"
            }));
        } else if (item.text && item.text.parts) {
            // Párrafo con múltiples partes con formato diferente
            for (const part of item.text.parts) {
                const processedText = this.replaceVariables(part.text);
                children.push(new TextRun({
                    text: processedText,
                    font: "Arial",
                    size: 24,
                    color: "#000000",
                    bold: part.bold || false,
                    italic: part.italic || false,
                    underline: part.underline ? { type: this.docx.UnderlineType.SINGLE } : undefined
                }));
            }
        }

        return new Paragraph({
            children: children,
            alignment: this.getAlignment(item.alignment),
            spacing: {
                after: 120,
                line: 276
            },
            indent: {
                left: 1441
            }
        });
    }

    // Crear lista
    createList(item) {
        const { Paragraph, TextRun, AlignmentType } = this.docx;
        const elements = [];

        for (let i = 0; i < item.items.length; i++) {
            const processedText = this.replaceVariables(item.items[i]);

            let bulletText = "";
            if (item.listType === "bullet") {
                bulletText = "• ";
            } else if (item.listType === "numbered") {
                bulletText = `${i + 1}. `;
            }

            elements.push(new Paragraph({
                children: [
                    new TextRun({
                        text: bulletText + processedText,
                        font: "Arial",
                        size: 24,
                        color: "#000000"
                    })
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: {
                    after: 120,
                    line: 276
                },
                indent: {
                    left: 1441 // Indentación para listas
                }
            }));
        }

        return elements;
    }

    // Crear tabla
    createTable(item) {
        const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle, AlignmentType } = this.docx;

        const rows = [];

        // ✅ Fila de título con colspan
        if (item.title) {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            columnSpan: item.columns?.length || 1, // número de columnas
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: item.title,
                                            bold: true,
                                            font: "Arial",
                                            size: 26,
                                            color: "#000000"
                                        })
                                    ],
                                    alignment: AlignmentType.LEFT
                                })
                            ],
                            shading: { fill: "D3D3D3" } // color de fondo opcional
                        })
                    ]
                })
            );
        }

        // Fila de encabezados
        if (item.columns) {
            const headerCells = item.columns.map(col =>
                new TableCell({
                    width: { size: col.width, type: WidthType.PERCENTAGE },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: col.header,
                                    bold: true,
                                    font: "Arial",
                                    size: 22,
                                    color: "#000000"
                                })
                            ],
                            alignment: AlignmentType.CENTER
                        })
                    ],
                    shading: { fill: "E6E6FA" }
                })
            );
            rows.push(new TableRow({ children: headerCells }));
        }

        // Filas de datos
        if (item.rows) {
            for (const rowData of item.rows) {
                const cells = rowData.map(cellData => {
                    const processedText = this.replaceVariables(cellData.toString());
                    return new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: processedText,
                                        font: "Arial",
                                        size: 20,
                                        color: "#000000"
                                    })
                                ],
                                alignment: AlignmentType.CENTER
                            })
                        ]
                    });
                });
                rows.push(new TableRow({ children: cells }));
            }
        }

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows,
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "#000000" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "#000000" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "#000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "#000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "#000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "#000000" }
            }
        });
    }

    // Crear imagen
    async createImage(item) {
        const { Paragraph, TextRun, ImageRun, AlignmentType } = this.docx;

        let imageUrl = item.src;

        // Si es ruta interna (no empieza con http ni data:)
        if (!/^https?:|^data:/.test(item.src)) {
            imageUrl = new URL(item.src, import.meta.url).href;
        }

        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la imagen: ${imageUrl}`);
        }
        const imageBuffer = await response.arrayBuffer();

        return new Paragraph({
            children: [
                new ImageRun({
                    data: imageBuffer,
                    transformation: {
                        width: item.width || 1080,
                        height: item.height || 233
                    }
                })
            ],
            alignment: this.getAlignment(item.alignment || "CENTER"),
            spacing: { before: 200, after: 200 }
        });
    }

    // Procesar contenido dinámico
    async prepareGraphicsForCapture() {
        return new Promise((resolve) => {
            requestAnimationFrame(async () => {
                const graphElement = document.getElementById('grafico-verificaciones');

                if (graphElement) {
                    try {
                        // Asegurar visibilidad
                        graphElement.style.display = 'block';
                        graphElement.style.visibility = 'visible';
                        graphElement.style.opacity = '1';

                        // Buscar instancia de ECharts
                        const echartsInstance = window.echarts?.getInstanceByDom?.(graphElement);

                        if (echartsInstance && !echartsInstance.isDisposed()) {
                            console.log('Preparando ECharts para captura...');

                            // Forzar redimensionado
                            echartsInstance.resize();

                            // Esperar renderizado completo
                            await new Promise(renderResolve => {
                                setTimeout(() => {
                                    const canvas = graphElement.querySelector('canvas');
                                    if (canvas && canvas.width > 0 && canvas.height > 0) {
                                        console.log(`Canvas listo: ${canvas.width}x${canvas.height}`);
                                    }
                                    renderResolve();
                                }, 500);
                            });
                        } else {
                            console.log('Esperando renderizado estándar...');
                            await new Promise(resolve => setTimeout(resolve, 800));
                        }
                    } catch (error) {
                        console.warn('Error preparando gráfico:', error);
                        // Continuar con timeout estándar
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                resolve();
            });
        });
    }

    // 2. Método createErrorParagraph
    createErrorParagraph(message) {
        const { Paragraph, TextRun, AlignmentType } = this.docx;

        return new Paragraph({
            children: [
                new TextRun({
                    text: `⚠️ ${message}`,
                    font: "Arial",
                    size: 24,
                    color: "#FF0000",
                    bold: true
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 }
        });
    }

    // 3. Método mejorado createCapturedImage (reemplazar el existente)
    async createCapturedImage(item) {
        const { Paragraph, ImageRun, AlignmentType } = this.docx;

        try {
            console.log(`🖼️ Capturando elemento: ${item.elementId}`);

            // Usar captura dinámica por defecto
            let canvas;

            if (window.captureElementContentDynamic) {
                canvas = await window.captureElementContentDynamic(item.elementId, {
                    width: 1080,
                    height: item.height
                });
            } else if (window.captureElementBySections) {
                canvas = await window.captureElementBySections(item.elementId, {
                    width: 1080,
                    height: item.height
                });
            } else {
                throw new Error('Funciones de captura no disponibles');
            }

            if (!canvas || this.isCanvasEmpty(canvas)) {
                return this.createErrorParagraph('Error: No se pudo capturar el contenido');
            }

            // Convertir canvas a imagen
            const imageDataUrl = canvas.toDataURL('image/png', 0.8); // Reducir calidad para imágenes grandes
            const imageBuffer = await this.dataUrlToArrayBuffer(imageDataUrl);

            // Calcular dimensiones para Word (mantener proporciones)
            const wordDimensions = this.calculateWordImageDimensions(canvas.width, canvas.height, item);

            console.log(`✅ Imagen procesada: ${wordDimensions.width}x${wordDimensions.height}`);

            return new Paragraph({
                children: [
                    new ImageRun({
                        data: imageBuffer,
                        transformation: {
                            width: wordDimensions.width,
                            height: wordDimensions.height
                        }
                    })
                ],
                alignment: this.getAlignment(item.alignment || "CENTER"),
                spacing: { before: 200, after: 200 }
            });

        } catch (error) {
            console.error('❌ Error capturando imagen:', error);
            return this.createErrorParagraph(`Error: ${error.message}`);
        }
    }

    // Nuevo método para calcular dimensiones apropiadas para Word
    calculateWordImageDimensions(canvasWidth, canvasHeight, item) {
        const maxWordWidth = 900; // Ancho máximo en Word (aproximadamente)
        const maxWordHeight = 750; // Altura máxima recomendada por página

        let finalWidth = item.width || canvasWidth;
        let finalHeight = item.height || canvasHeight;

        // Si la imagen es muy alta, mantener proporciones pero ajustar
        if (finalHeight > maxWordHeight) {
            const ratio = maxWordHeight / finalHeight;
            finalHeight = maxWordHeight;
            finalWidth = finalWidth * ratio;
        }

        // Si aún es muy ancha, ajustar
        if (finalWidth > maxWordWidth) {
            const ratio = maxWordWidth / finalWidth;
            finalWidth = maxWordWidth;
            finalHeight = finalHeight * ratio;
        }

        return {
            width: Math.round(finalWidth),
            height: Math.round(finalHeight)
        };
    }

    // 4. Método tryEChartsNativeCapture mejorado (reemplazar el existente)
    async tryEChartsNativeCapture(element, item) {
        try {
            // Verificar que ECharts esté disponible
            if (typeof window.echarts === 'undefined') {
                console.log('ECharts no disponible globalmente');
                return null;
            }

            const echartsInstance = window.echarts.getInstanceByDom(element);

            if (!echartsInstance || echartsInstance.isDisposed()) {
                console.log('No hay instancia válida de ECharts');
                return null;
            }

            // Obtener imagen usando API nativa
            const imageDataUrl = echartsInstance.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                excludeComponents: ['toolbox', 'brush']
            });

            if (!imageDataUrl || imageDataUrl === 'data:,' || imageDataUrl.length < 100) {
                console.log('ECharts no retornó imagen válida');
                return null;
            }

            const imageBuffer = await this.dataUrlToArrayBuffer(imageDataUrl);
            const { Paragraph, ImageRun } = this.docx;

            return new Paragraph({
                children: [
                    new ImageRun({
                        data: imageBuffer,
                        transformation: {
                            width: item.width || 600,
                            height: item.height || 400
                        }
                    })
                ],
                alignment: this.getAlignment(item.alignment || "CENTER"),
                spacing: { before: 200, after: 200 }
            });

        } catch (error) {
            console.warn('Error en captura nativa ECharts:', error);
            return null;
        }
    }

    isCanvasEmpty(canvas) {
        try {
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                return true;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return true;
            }

            // Obtener datos de imagen
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Verificar si hay píxeles no transparentes
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] !== 0) { // Canal alpha > 0
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.warn('Error verificando canvas vacío:', error);
            return false; // Asumir que no está vacío si hay error
        }
    }

    async dataUrlToArrayBuffer(dataUrl) {
        try {
            // Verificar formato válido
            if (!dataUrl || !dataUrl.startsWith('data:')) {
                throw new Error('DataURL inválido');
            }

            // Método más eficiente sin fetch
            const base64 = dataUrl.split(',')[1];
            if (!base64) {
                throw new Error('DataURL sin datos base64');
            }

            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            return bytes.buffer;
        } catch (error) {
            console.warn('Error en conversión base64, usando método fetch:', error);

            // Fallback al método original
            try {
                const response = await fetch(dataUrl);
                if (!response.ok) {
                    throw new Error(`Fetch falló: ${response.status}`);
                }
                return await response.arrayBuffer();
            } catch (fetchError) {
                console.error('Error en ambos métodos de conversión:', fetchError);
                throw new Error(`Error convirtiendo imagen: ${fetchError.message}`);
            }
        }
    }


    resolveParams(params) {
        const resolved = {};
        for (const key in params) {
            let value = params[key];
            if (typeof value === "string") {
                value = value.replace(/{{(.*?)}}/g, (match, varName) => {
                    // Buscar en this.data por path
                    return this.getValueFromData(varName.trim(), this.data) ?? match;
                });
            }
            resolved[key] = value;
        }
        return resolved;
    }

    getValueFromData(path, dataObj) {
        // Soporta rutas tipo "geometria.altura"
        return path.split('.').reduce((acc, part) => acc?.[part], dataObj);
    }
    // Crear resultado de cálculo
    createCalculationResult(item) {
        const { Paragraph, TextRun, AlignmentType } = this.docx;

        let processedTemplate = item.template;

        // Reemplazar variables usando funciones de cálculo
        for (const [variable, functionName] of Object.entries(item.variables)) {
            const placeholder = `{{${variable}}}`;
            let value = "N/A";

            try {
                if (this.calculations[functionName]) {
                    value = this.calculations[functionName]();
                }
            } catch (error) {
                console.warn(`Error calculating ${functionName}:`, error);
            }

            processedTemplate = processedTemplate.replace(placeholder, value);
        }

        return new Paragraph({
            children: [
                new TextRun({
                    text: processedTemplate,
                    font: "Arial",
                    size: 24,
                    color: "#000000"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
                after: 120,
                line: 276
            }
        });
    }

    // Crear tabla de verificación
    async createVerificationTable(item) {
        // Generar la tabla usando el generador correspondiente
        const { CONTENT_GENERATORS } = await import('./content-structure.js');
        const tableData = CONTENT_GENERATORS.generateVerificationTable(item.params, this.data);
        return this.createTable(tableData);
    }

    // Crear tabla de análisis sísmico
    async createSeismicAnalysisTable(item) {
        const { CONTENT_GENERATORS } = await import('./content-structure.js');
        const tableData = CONTENT_GENERATORS.generateSeismicAnalysisTable(item.params, this.data);
        return this.createTable(tableData);
    }

    // Crear tabla de esfuerzos del suelo
    async createSoilStressTable(item) {
        const { CONTENT_GENERATORS } = await import('./content-structure.js');
        const tableData = CONTENT_GENERATORS.generateSoilStressTable(item.params, this.data);
        return this.createTable(tableData);
    }

    // Crear tablas de refuerzo
    async createReinforcementTables(item) {
        const { CONTENT_GENERATORS } = await import('./content-structure.js');
        const tablesData = CONTENT_GENERATORS.generateReinforcementTables(item.params, this.data);

        const elements = [];
        for (const tableData of tablesData) {
            elements.push(this.createTable(tableData));
            // Agregar espacio entre tablas
            elements.push(this.createSpacing());
        }

        return elements;
    }

    // Procesar subsección
    async processSubsection(item) {
        const elements = [];

        // Título de subsección
        elements.push(this.createHeading(item.title, 4));

        // Contenido de la subsección
        for (const contentItem of item.content) {
            const processedItems = await this.processContentItem(contentItem);
            if (Array.isArray(processedItems)) {
                elements.push(...processedItems);
            } else if (processedItems) {
                elements.push(processedItems);
            }
        }

        return elements;
    }

    // Crear bloque de cálculo
    createCalculationBlock(item) {
        const { Paragraph, TextRun, AlignmentType } = this.docx;
        const elements = [];

        // Título del bloque
        elements.push(new Paragraph({
            children: [
                new TextRun({
                    text: item.title,
                    bold: true,
                    font: "Arial",
                    size: 26,
                    color: "#000000"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
                before: 240,
                after: 120
            }
        }));

        // Cálculos individuales
        for (const calc of item.calculations) {
            // Fórmula
            elements.push(new Paragraph({
                children: [
                    new TextRun({
                        text: `${calc.description}: `,
                        bold: true,
                        font: "Arial",
                        size: 24,
                        color: "#000000"
                    }),
                    new TextRun({
                        text: calc.formula,
                        font: "Courier New",
                        size: 22,
                        color: "#000000"
                    })
                ],
                alignment: AlignmentType.LEFT,
                spacing: { after: 60 }
            }));

            // Resultado
            elements.push(new Paragraph({
                children: [
                    new TextRun({
                        text: `Resultado: ${this.replaceVariables(calc.result)}`,
                        font: "Arial",
                        size: 24,
                        color: "#000000"
                    })
                ],
                alignment: AlignmentType.LEFT,
                spacing: { after: 120 }
            }));
        }

        return elements;
    }

    // Crear espaciado
    createSpacing(spacing = 200) {
        const { Paragraph, TextRun } = this.docx;

        return new Paragraph({
            children: [new TextRun({ text: "" })],
            spacing: { after: spacing }
        });
    }

    // Reemplazar variables en el texto
    replaceVariables(text) {
        if (!text) return "";

        // Buscar patrones {{variable}}
        return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
            try {
                // Intentar obtener el valor de diferentes fuentes
                const value = this.getVariableValue(variable);
                return value !== null ? value.toString() : match;
            } catch (error) {
                console.warn(`Error replacing variable ${variable}:`, error);
                return match;
            }
        });
    }

    // Obtener valor de variable
    getVariableValue(variable) {
        // Buscar en datos directos
        if (this.data[variable] !== undefined) {
            return this.data[variable];
        }

        // Buscar en datos anidados usando notación de punto
        const parts = variable.split('.');
        let current = this.data;

        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                current = null;
                break;
            }
        }

        if (current !== null) {
            return current;
        }

        // Buscar en cálculos
        if (this.calculations[variable]) {
            if (typeof this.calculations[variable] === 'function') {
                return this.calculations[variable]();
            }
            return this.calculations[variable];
        }

        // Buscar en verificaciones
        if (this.verifications[variable]) {
            if (typeof this.verifications[variable] === 'function') {
                return this.verifications[variable]();
            }
            return this.verifications[variable];
        }

        // Buscar en refuerzo
        if (this.reinforcement[variable]) {
            if (typeof this.reinforcement[variable] === 'function') {
                return this.reinforcement[variable]();
            }
            return this.reinforcement[variable];
        }

        return null;
    }

    // Obtener tamaño de heading
    getHeadingSize(level) {
        const sizes = {
            1: 26, // 18pt
            2: 24, // 15pt
            3: 24, // 13pt
            4: 24  // 12pt
            // 1: 36, // 18pt
            // 2: 30, // 15pt
            // 3: 26, // 13pt
            // 4: 24  // 12pt
        };
        return sizes[level] || 24;
    }

    // Obtener nivel de heading
    getHeadingLevel(level) {
        const levels = {
            1: this.docx.HeadingLevel.HEADING_1,
            2: this.docx.HeadingLevel.HEADING_2,
            3: this.docx.HeadingLevel.HEADING_3,
            4: this.docx.HeadingLevel.HEADING_4
        };
        return levels[level] || this.docx.HeadingLevel.HEADING_4;
    }

    // Obtener alineación
    getAlignment(alignment) {
        const alignments = {
            "LEFT": this.docx.AlignmentType.LEFT,
            "CENTER": this.docx.AlignmentType.CENTER,
            "RIGHT": this.docx.AlignmentType.RIGHT,
            "JUSTIFIED": this.docx.AlignmentType.JUSTIFIED
        };
        return alignments[alignment] || this.docx.AlignmentType.LEFT;
    }

    // Actualizar datos
    updateData(newData) {
        this.data = { ...this.data, ...newData };
    }

    // Actualizar cálculos
    updateCalculations(newCalculations) {
        this.calculations = { ...this.calculations, ...newCalculations };
    }

    // Actualizar verificaciones
    updateVerifications(newVerifications) {
        this.verifications = { ...this.verifications, ...newVerifications };
    }

    // Actualizar refuerzo
    updateReinforcement(newReinforcement) {
        this.reinforcement = { ...this.reinforcement, ...newReinforcement };
    }
}