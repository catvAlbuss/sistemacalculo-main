// content-processor-md.js - Procesador de contenido para Memoria Descriptiva

export class ContentProcessorMD {
  constructor(docxLib, data = {}) {
    this.docx = docxLib;
    this.data = data;
    if (!this.docx) {
      throw new Error("docx library not set. Provide window.docx.");
    }
  }

  async buildDocument(structure, images = {}) {
    const {
      Document,
      SectionType,
      Paragraph,
      TextRun,
      Header,
      Footer,
      AlignmentType,
      PageNumber,
      NumberFormat,
      TableOfContents,
      PageBreak,
      ImageRun,
      Table,
      TableRow,
      TableCell,
      WidthType,
      BorderStyle,
      VerticalAlign,
    } = this.docx;

    const coverChildren = await this.createCover(structure.cover, images);

    // Header con logo y texto
    let headerLogoContent = [];
    try {
      const logosrc = "/assets/img/rizabalasociados.png";
      const imageBuffer = await this.getImageBuffer(logosrc);
      if (imageBuffer) {
        headerLogoContent = [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: { width: 140, height: 50 },
              }),
            ],
            spacing: { before: 0, after: 0 },
          }),
        ];
      }
    } catch (e) {
      console.error("Error loading logo", e);
    }

    const headerText = (structure.cover.title || "MEMORIA DESCRIPTIVA").toUpperCase();

    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.SINGLE, size: 0, color: "cccccc" },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              children: headerLogoContent,
              verticalAlign: VerticalAlign.CENTER,
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE } },
            }),
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: headerText,
                      size: 12,
                      color: "888888",
                      font: "Arial",
                    }),
                  ],
                  spacing: { before: 0, after: 0 },
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 20, bottom: 20, left: 100, right: 100 },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE } },
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: "Correo: rizabalasociados.estructurales@gmail.com\nTeléfono: 953992277",
                      size: 12,
                      color: "888888",
                      font: "Arial",
                    }),
                  ],
                  spacing: { before: 0, after: 0 },
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE } },
            }),
          ],
        }),
      ],
    });

    const headerContent = new Paragraph({
      children: [headerTable],
      spacing: { before: 0, after: 0, line: 240 },
    });

    const documentChildren = [];

    // Índice
    documentChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "ÍNDICE GENERAL",
            bold: true,
            size: 32,
            font: "Arial",
            color: "000000",
          }),
        ],
        spacing: { before: 400, after: 600 },
      }),
    );

    documentChildren.push(
      new TableOfContents("Indice", {
        hyperlink: true,
        headingStyleRange: "1-3",
      }),
    );

    // Procesar secciones
    for (const section of structure.document.sections) {
      const sectionElements = await this.processSection(section);
      documentChildren.push(...sectionElements);
    }

    return new Document({
      sections: [
        {
          properties: {
            type: SectionType.NEXT_PAGE,
            pageNumber: { start: 0, format: NumberFormat.NONE },
          },
          headers: { default: new Header({ children: [headerContent] }) },
          footers: { default: new Footer({ children: [] }) },
          children: coverChildren,
        },
        {
          properties: {
            type: SectionType.NEXT_PAGE,
            pageNumber: { start: 1, format: NumberFormat.DECIMAL },
          },
          headers: { default: new Header({ children: [headerContent] }) },
          // Reemplaza la sección de footers en el segundo section

          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "MUNICIPALIDAD PROVINCIAL DE UCAYALI",
                      size: 16,
                      bold: true,
                      color: "333333",
                      font: "Arial",
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 100, after: 20 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Jr. Amazonas N° 307 - Contamana - Contamana - Ucayali - Loreto",
                      size: 14,
                      color: "555555",
                      font: "Arial",
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 30 },
                }),
                // Línea separadora
                new Paragraph({
                  children: [new TextRun({ text: " ", size: 1 })],  // ← Espacio invisible
                  alignment: AlignmentType.CENTER,
                  border: { bottom: { color: "cccccc", size: 6, style: "single" } },  // ← bottom en lugar de top
                  spacing: { before: 50, after: 50 },
                }),
                // Fila con número de página (derecha)
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Página ",
                      size: 16,
                      color: "555555",
                      font: "Arial"
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 16,
                      color: "555555",
                      font: "Arial"
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 20, after: 100 },
                }),
              ],
            }),
          },
          children: documentChildren,
        },
      ],
    });
  }

  async createCover(cover, images) {
    const { Paragraph, TextRun, AlignmentType, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign } = this.docx;
    const children = [];

    // 1. Título Principal
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: (cover.title || "MEMORIA DESCRIPTIVA").toUpperCase(),
            bold: true,
            size: 36,
            font: "Arial",
            color: "000000",
          }),
        ],
        spacing: { before: 800 },
      })
    );

    // 2. Subtítulo
    if (cover.subtitle) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: cover.subtitle.toUpperCase(),
              bold: true,
              size: 32,
              font: "Arial",
              color: "000000",
            }),
          ],
          spacing: { after: 600 },
        })
      );
    }

    // 3. Nombre del Proyecto
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: cover.project ? String(cover.project).toUpperCase() : "NOMBRE DEL PROYECTO NO DEFINIDO",
            bold: true,
            size: 22,
            font: "Arial",
            color: cover.project ? "000000" : "999999",
          }),
        ],
        spacing: { before: 400, after: 400 },
      })
    );

    // 4. IMAGEN DE PORTADA
    if (images.coverImage) {
      try {
        const coverBuffer = await this.dataUrlToArrayBuffer(images.coverImage);
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: coverBuffer,
                transformation: { width: 500, height: 380 },
              }),
            ],
            spacing: { before: 200, after: 400 },
          })
        );
      } catch (e) {
        console.error("Error processing cover image", e);
      }
    }

    // 5. DATOS INSTITUCIONALES EN TABLA DE 2 COLUMNAS
    const leftColumn = [];
    const rightColumn = [];

    if (cover.uei) leftColumn.push(`UNIDAD EJECUTORA (UEI): ${cover.uei}`);
    if (cover.unifiedCode) leftColumn.push(`CÓDIGO UNIFICADO: ${cover.unifiedCode}`);
    if (cover.ieName) leftColumn.push(`NOMBRE DE LA IE: ${cover.ieName}`);
    if (cover.localCode) leftColumn.push(`CÓDIGO DE LOCAL: ${cover.localCode}`);
    if (cover.modularCodes) leftColumn.push(`CÓDIGO(S) MODULAR(ES): ${cover.modularCodes}`);
    if (cover.region) rightColumn.push(`REGIÓN: ${cover.region}`);
    if (cover.province) rightColumn.push(`PROVINCIA: ${cover.province}`);
    if (cover.district) rightColumn.push(`DISTRITO: ${cover.district}`);
    if (cover.centerTown) rightColumn.push(`CENTRO POBLADO: ${cover.centerTown}`);

    // Crear filas para la tabla
    const maxRows = Math.max(leftColumn.length, rightColumn.length);
    const tableRows = [];

    for (let i = 0; i < maxRows; i++) {
      const leftText = leftColumn[i] || "";
      const rightText = rightColumn[i] || "";

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: leftText, size: 20, font: "Arial", bold: true })],
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: rightText, size: 20, font: "Arial", bold: true })],
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            }),
          ],
        })
      );
    }

    // Agregar tabla si hay datos
    if (tableRows.length > 0) {
      children.push(
        new Table({
          width: { size: 80, type: WidthType.PERCENTAGE },
          alignment: AlignmentType.CENTER,
          rows: tableRows,
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
          },
        })
      );
    }

    return children;
  }

  async processSection(section) {
    const elements = [];
    if (section.title && section.id !== "encabezado") {
      elements.push(this.createHeading(section.title, section.level));
    }
    for (const item of section.content) {
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
      case "pageBreak":
        return this.createPageBreak();
      default:
        console.warn(`Unknown content type: ${item.type}`);
        return null;
    }
  }

  createPageBreak() {
    const { Paragraph, PageBreak } = this.docx;

    return new Paragraph({
      children: [new PageBreak()],
    });
  }

  createHeading(text, level, underline = false) {
    const { Paragraph, TextRun, AlignmentType, HeadingLevel, UnderlineType } = this.docx;

    const levels = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };
    const sizes = { 1: 24, 2: 22, 3: 20, 4: 18 };

    let leftIndent = 0;
    if (level === 1) leftIndent = 0;
    if (level === 2) leftIndent = 432;
    if (level >= 3) leftIndent = 864;

    const processedText = this.replaceVariables(text);

    const headingProps = {
      text: processedText,
      bold: true,
      size: sizes[level] || 24,
      font: "Arial",
      color: "000000",
    };

    if (underline) {
      headingProps.underline = { type: UnderlineType.SINGLE };
    }

    return new Paragraph({
      heading: levels[level] || HeadingLevel.HEADING_1,
      children: [new TextRun(headingProps)],
      alignment: AlignmentType.LEFT,
      spacing: { before: level === 1 ? 400 : 240, after: level === 1 ? 200 : 120 },
      indent: { left: leftIndent },
      pageBreakBefore: level === 1,
    });
  }

  createParagraph(item) {
    const { Paragraph, TextRun, AlignmentType } = this.docx;

    let children = [];

    if (typeof item.text === "string") {
      const processedText = this.replaceVariables(item.text);
      children.push(
        new TextRun({
          text: processedText,
          font: "Arial",
          size: 22,
          color: "000000",
        }),
      );
    } else if (item.text && item.text.parts) {
      for (const part of item.text.parts) {
        const processedText = this.replaceVariables(part.text);
        children.push(
          new TextRun({
            text: processedText,
            font: "Arial",
            size: 22,
            color: "000000",
            bold: !!part.bold,
            italic: !!part.italic,
            underline: part.underline ? { type: this.docx.UnderlineType.SINGLE } : undefined,
          }),
        );
      }
    }

    return new Paragraph({
      children: children,
      alignment: this.getAlignment(item.alignment || "JUSTIFIED"),
      spacing: { after: 120, line: 276 },
      indent: { left: 1122 },
    });
  }

  createList(item) {
    const { Paragraph, TextRun, AlignmentType } = this.docx;
    const elements = [];

    for (let i = 0; i < item.items.length; i++) {
      const processedText = this.replaceVariables(item.items[i]);
      const prefix = item.listType === "numbered" ? `${i + 1}. ` : "• ";

      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: prefix + processedText,
              font: "Arial",
              size: 22,
              color: "000000",
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120, line: 276 },
          indent: { left: 1872, hanging: 360 },
        }),
      );
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

      let leftIndent = 1152;
      if (level === 1) leftIndent = 0;
      if (level === 2) leftIndent = 432;
      if (level >= 3) leftIndent = 1152;

      elements.push(
        new Paragraph({
          alignment: this.getAlignment(item.alignment || "CENTER"),
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: { width: item.width || 500, height: item.height || 400 },
            }),
          ],
          spacing: { before: item.verticalCenter ? 2400 : 240, after: item.verticalCenter ? 400 : 120 },
          indent: { left: item.alignment === "CENTER" || !item.alignment ? 0 : leftIndent },
          pageBreakBefore: item.pageBreakBefore || false,
        }),
      );

      if (item.caption) {
        elements.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: this.replaceVariables(item.caption),
                italics: true,
                size: 18,
                font: "Arial",
                color: "555555",
              }),
            ],
            spacing: { after: 240 },
            indent: { left: 0 },
          }),
        );
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
    const imageSrc = this.normalizeStaticImageSrc(src);
    try {
      const response = await fetch(imageSrc);
      if (!response.ok) throw new Error(`No se pudo cargar la imagen: ${imageSrc}`);
      return await response.arrayBuffer();
    } catch (error) {
      console.error("Error fetching static image:", error);
      return null;
    }
  }

  normalizeStaticImageSrc(src) {
    if (!src || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:")) {
      return src;
    }

    const normalized = src.replace(/^public\//, "");
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }

  async createTable(item) {
    const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle, AlignmentType, VerticalAlign, VerticalMergeType } = this.docx;

    const rows = [];

    if (item.title) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: item.columns?.length || 1,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: item.title, bold: true, size: 24, font: "Arial" })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: "F8C471" },
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
      );
    }

    if (item.columns) {
      rows.push(
        new TableRow({
          children: item.columns.map(
            (col) =>
              new TableCell({
                width: { size: col.width || 100 / item.columns.length, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: col.header,
                        bold: true,
                        size: 20,
                        font: "Arial",
                        color: (col.color || "000000").replace("#", ""),
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: (col.fill || "FDEBD0").replace("#", "") },
                verticalAlign: VerticalAlign.CENTER,
              }),
          ),
        }),
      );
    }

    const mergeCounters = new Array(item.columns ? item.columns.length : 10).fill(0);

    for (const rowData of item.rows || []) {
      const cells = [];

      for (let cIdx = 0; cIdx < rowData.length; cIdx++) {
        const cellData = rowData[cIdx];
        const isObj = typeof cellData === "object" && cellData !== null;

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

        let cellChildren = [];

        if (isObj && (cellData.type || cellData.stack)) {
          const contentToProcess = cellData.stack || [cellData];
          for (const subItem of contentToProcess) {
            const processed = await this.processContentItem(subItem);
            if (Array.isArray(processed)) cellChildren.push(...processed);
            else if (processed) cellChildren.push(processed);
          }
        } else {
          const rawText = isObj ? String(cellData.text ?? "") : String(cellData);
          const textColor = isObj ? cellData.color || "000000" : "000000";
          const bold = isObj ? !!cellData.bold : false;
          const size = isObj && cellData.size ? cellData.size : 18;
          const alignment = isObj && cellData.alignment ? this.getAlignment(cellData.alignment) : AlignmentType.CENTER;

          const processedText = this.replaceVariables(rawText);
          const lines = (processedText || "").split("\n");

          cellChildren.push(
            new Paragraph({
              alignment: alignment,
              spacing: cellData?.spacing || { after: 0 },
              children: lines.map(
                (line, idx) =>
                  new TextRun({
                    text: line,
                    size: size,
                  })
              )
            }),
          );
        }

        const bgColor = isObj ? cellData.fill : null;
        const vAlign = isObj && cellData.vAlign ? cellData.vAlign : VerticalAlign.CENTER;

        cells.push(
          new TableCell({
            children: cellChildren,
            shading: bgColor ? { fill: bgColor.replace("#", "") } : undefined,
            verticalAlign: vAlign,
            verticalMerge: vMerge,
            columnSpan: isObj ? cellData.columnSpan : undefined,
          }),
        );
      }

      rows.push(new TableRow({ children: cells }));
    }

    const borderStyle = item.noBorders ? BorderStyle.NONE : BorderStyle.SINGLE;
    const borderSize = item.noBorders ? 0 : 1;

    return new Table({
      width: { size: item.widthPercent || 80, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      rows: rows,
      borders: {
        top: { style: borderStyle, size: borderSize },
        bottom: { style: borderStyle, size: borderSize },
        left: { style: borderStyle, size: borderSize },
        right: { style: borderStyle, size: borderSize },
        insideHorizontal: { style: borderStyle, size: borderSize },
        insideVertical: { style: borderStyle, size: borderSize },
      },
      indent: { size: 0, type: WidthType.DXA },
    });
  }

  getAlignment(alignment) {
    const alignments = {
      LEFT: this.docx.AlignmentType.LEFT,
      CENTER: this.docx.AlignmentType.CENTER,
      RIGHT: this.docx.AlignmentType.RIGHT,
      JUSTIFIED: this.docx.AlignmentType.JUSTIFIED,
    };
    return alignments[alignment] || this.docx.AlignmentType.LEFT;
  }

  replaceVariables(text) {
    let processed = String(text ?? "");
    if (!processed) return "";
    return processed.replace(/{{(.*?)}}/g, (match, varName) => {
      const value = this.getValueByPath(this.data, varName.trim());
      return value !== undefined && value !== null ? value : match;
    });
  }

  getValueByPath(obj, path) {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
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
