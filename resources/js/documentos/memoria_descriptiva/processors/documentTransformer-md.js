
import incompatibilidadesData from "../data/incompatibilidades.json";
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
    this.transformImagenesGeneralidades(structure);
    //this.transformUbicacion(structure);//
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
  // SECCIÓN 1.1 - ANTECEDENTES (ya lo tienes)
  // ============================================
  transformImagenesGeneralidades(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const addParagraph = (content, text, bold = false, alignment = "LEFT") => {
      content.push({ type: "paragraph", text, bold, alignment });
    };

    const addImage = (content, previewKey, width, height, caption, pageBreakBefore = false) => {
      if (this.previews[previewKey]) {
        content.push({ type: "image", src: this.previews[previewKey], width, height, caption, alignment: "CENTER", pageBreakBefore });
      }
    };

    const addBulletLine = (content, label, value, padding = 22) => {
      content.push({ type: "paragraph", text: `• ${label.padEnd(padding, ' ')}: ${value}` });
    };

    // ========== 1. TEXTO DE ANTECEDENTES ==========
    const historyText = this.sections.generalidades?.antecedentes?.history || "";
    const textoPlaceholderIndex = generalidades.content.findIndex(
      (item) => item.type === "paragraph" && item.text?.includes("{{sections.generalidades.antecedentes.textoCompleto}}")
    );
    if (textoPlaceholderIndex !== -1 && historyText) {
      generalidades.content[textoPlaceholderIndex].text = historyText;
    }

    // ========== 2. TABLA DE VÍAS DE ACCESO ==========
    const tablaPlaceholder = generalidades.content.findIndex(
      (item) => item.type === "paragraph" && item.text?.includes("{{TABLA_VIAS_ACCESO}}")
    );
    const tablaViasAcceso = this.getTablaViasAcceso();
    if (tablaPlaceholder !== -1 && tablaViasAcceso) {
      generalidades.content.splice(tablaPlaceholder, 1, tablaViasAcceso);
    }

    // ========== 3. IMÁGENES DE DEMANDA ==========
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

    // ========== 4. IMÁGENES DE UBICACIÓN ==========
    const imagenesUbicacionPlaceholder = generalidades.content.findIndex(
      (item) => item.type === "paragraph" && item.text?.includes("{{IMAGENES_UBICACION}}")
    );

    if (imagenesUbicacionPlaceholder !== -1) {
      const contenidoUbicacion = [];

      // FIGURA 1 - Grande
      addImage(contenidoUbicacion, "ubicacionImage1", 550, 650, "Figura 1: Ubicación del área del proyecto", true);
      // FIGURA 2 - Mediana
      addImage(contenidoUbicacion, "ubicacionImage2", 450, 350, "Figura 2: Plano de Ubicación");

      generalidades.content.splice(imagenesUbicacionPlaceholder, 1, ...contenidoUbicacion);
    }
  }

  getTablaViasAcceso() {
    const acceso = this.sections.generalidades?.acceso || {};

    return {
      type: "table",
      widthPercent: 85,
      title: "Vías de Acceso",
      columns: [
        { header: "TRAMO", width: 35 },
        { header: "DISTANCIA (km)", width: 20 },
        { header: "TIEMPO", width: 25 },
        { header: "CARRETERA", width: 20 }
      ],
      rows: [
        ["Lima - Huánuco", acceso.limaHuanuco?.distancia || "410", acceso.limaHuanuco?.tiempo || "8:00:00", "Asfaltada"],
        ["Huánuco - Tingo María", acceso.huanucoTingo?.distancia || "120", acceso.huanucoTingo?.tiempo || "3:00:00", "Asfaltada"],
        ["Tingo María - Pucallpa", acceso.tingoPucallpa?.distancia || "254", acceso.tingoPucallpa?.tiempo || "5:45:00", "Asfaltada"],
        ["Pucallpa - Contamana", acceso.pucallpaContamana?.distancia || "248", acceso.pucallpaContamana?.tiempo || "8:00:00", "Rápido (Barco)"],
        ["Total", acceso.total?.distancia || "1032", acceso.total?.tiempo || "24h y 45 min", ""]
      ]
    };
  }

  // ============================================
  // SECCIÓN 1.2 - UBICACIÓN (ya lo tienes)
  // ============================================
  transformUbicacion(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const idx12 = generalidades.content.findIndex(
      (item) => item.type === "heading" && String(item.text || "").startsWith("1.2.")
    );
    if (idx12 === -1) return;

    const imgIdx = generalidades.content.findIndex((item, i) => i > idx12 && item.type === "image");
    if (imgIdx === -1) return;

    const deptName = this.cover.ubigeo?.department || "LORETO";
    const provName = this.cover.ubigeo?.province || "UCAYALI";
    const distSelected = this.cover.ubigeo?.district || "CONTAMANA";
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

  // ============================================
  // SECCIÓN 1.3 - DOCUMENTOS Y PLANOS (ya lo tienes)
  // ============================================
  transformDocumentosPlanos(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const documentos = this.sections.documentosPlanos?.documentos || [];
    const planos = this.sections.documentosPlanos?.planos || [];

    console.log("📄 DOCUMENTOS encontrados:", documentos);
    console.log("📄 PLANOS encontrados:", planos);
    console.log("📄 Longitud documentos:", documentos.length);
    console.log("📄 Longitud planos:", planos.length);


    // ========== 1. BUSCAR Y REEMPLAZAR {{LISTA_DOCUMENTOS}} ==========
    const documentosPlaceholder = generalidades.content.findIndex(
      (item) => item.type === "paragraph" && item.text === "{{LISTA_DOCUMENTOS}}"
    );

    if (documentosPlaceholder !== -1) {
      if (documentos.length > 0 && documentos.some(d => d && d.trim() !== "")) {
        const documentosFiltrados = documentos.filter(d => d && d.trim() !== "");
        generalidades.content.splice(documentosPlaceholder, 1, {
          type: "list",
          listType: "bullet",
          items: documentosFiltrados,
        });
      } else {
        // Si no hay documentos, mostrar mensaje
        generalidades.content[documentosPlaceholder].text = "No se han definido documentos.";
      }
    }

    // ========== 2. BUSCAR Y REEMPLAZAR {{TABLA_PLANOS}} ==========
    const planosPlaceholder = generalidades.content.findIndex(
      (item) => item.type === "paragraph" && item.text === "{{TABLA_PLANOS}}"
    );

    if (planosPlaceholder !== -1) {
      if (planos.length > 0 && planos.some(p => p.descripcion?.trim() !== "")) {
        const planosFiltrados = planos.filter(p => p.descripcion?.trim() !== "");
        const nombreProyecto = this.cover.project || "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL Y PRIMARIA DE LA I.E.I.P. N° 64193 CONTAMANA";

        // Calcular números correctamente (los encabezados no tienen número)
        let numeroCorrelativo = 1;
        const rowsConNumeros = [];

        for (let i = 0; i < planosFiltrados.length; i++) {
          const p = planosFiltrados[i];
          if (p.esEncabezado) {
            rowsConNumeros.push(["", p.descripcion, p.lamina || ""]);
          } else {
            rowsConNumeros.push([String(numeroCorrelativo), p.descripcion, p.lamina || `E-${String(numeroCorrelativo).padStart(2, '0')}`]);
            numeroCorrelativo++;
          }
        }

        const planosTable = {
          type: "table",
          title: `RELACION DE PLANOS DE PROYECTO: "${nombreProyecto}"`,
          widthPercent: 95,
          columns: [
            { header: "N°", width: 10 },
            { header: "DESCRIPCIÓN", width: 70 },
            { header: "LÁMINA", width: 20 },
          ],
          rows: rowsConNumeros,
        };
        generalidades.content.splice(planosPlaceholder, 1, planosTable);
      } else {
        generalidades.content[planosPlaceholder].text = "No se han definido planos.";
      }
    }
  }
  // ============================================
  // SECCIÓN 1.4 - OBJETIVOS (NUEVO)
  // ============================================
  transformObjetivosLista(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    // Reemplazar objetivo general
    const objetivoGeneral = this.sections.generalidades?.objetivos?.general ||
      "Realizar el modelamiento, análisis y cálculo estructural de la edificación, así como verificaciones posteriores.";

    const generalPlaceholderIndex = generalidades.content.findIndex(
      (item) => item.type === "paragraph" &&
        item.text?.includes("{{sections.generalidades.objetivos.general}}")
    );

    if (generalPlaceholderIndex !== -1) {
      generalidades.content[generalPlaceholderIndex].text = objetivoGeneral;
    }

    // Reemplazar lista de objetivos específicos
    const objetivos = this.sections.generalidades?.objetivos?.especificos || [];
    const objetivosValidos = objetivos.filter(obj => obj && obj.trim() !== "");

    const objectivesPlaceholderIndex = generalidades.content.findIndex(
      (item) => item.type === "paragraph" &&
        item.text?.includes("{{LISTA_OBJETIVOS_ESPECIFICOS}}")
    );

    if (objectivesPlaceholderIndex !== -1) {
      if (objetivosValidos.length > 0) {
        generalidades.content.splice(objectivesPlaceholderIndex, 1, {
          type: "list",
          listType: "numbered",
          items: objetivosValidos
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
          item.num,
          item.descripcion,
          item.dispositivoLegal,
          item.compatibilizacion
        ])
      };
      generalidades.content.splice(placeholderIndex, 1, tablaIncompatibilidades);
    }
  }
  // ============================================
  // SECCIÓN 1.4 - MARCO NORMATIVO (NUEVO)
  // ============================================
  transformMarcoNormativoLista(structure) {
    const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
    if (!generalidades) return;

    const marcoNormativo = this.sections.generalidades?.marcoNormativo || [];
    const normasValidas = marcoNormativo.filter(n => n && n.trim() !== "");

    const placeholderIndex = generalidades.content.findIndex(
      (item) => item.type === "paragraph" &&
        item.text?.includes("{{LISTA_MARCO_NORMATIVO}}")
    );

    if (placeholderIndex !== -1) {
      if (normasValidas.length > 0) {
        generalidades.content.splice(placeholderIndex, 1, {
          type: "list",
          listType: "bullet",
          items: normasValidas
        });
      } else {
        generalidades.content[placeholderIndex].text = "No se ha definido marco normativo.";
      }
    }
  }

  // ============================================
  // 1.5  - DESCRIPCIÓN DE BLOQUES
  // ============================================
  transformDescripcionModulos(structure) {
    const descripcionModulos = structure.document.sections.find((s) => s.id === "descripcion_bloques");
    if (!descripcionModulos) return;

    // ========== 1. IMÁGENES DE PLANTA GENERAL ==========
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
            src: "/assets/img/memoria_decriptiva/modulos/descripcionBloques.png",
            width: 550,
            height: 350,
            caption: "Figura 31. Planta general del Primer Nivel del Proyecto",
            alignment: "CENTER"
          },
          {
            type: "image",
            src: "/assets/img/memoria_decriptiva/modulos/figura31PlantaGeneral.png",
            width: 550,
            height: 350,
            caption: "Figura 32. Distribución Arquitectónica",
            alignment: "CENTER"
          }
        ];
        descripcionModulos.content.splice(parrafoIndex + 1, 0, ...imagenesPlanta);
      }
    }

    // 🔥 TOMAR DATOS DEL STORE (NO datos fijos)
    const modulos = this.sections.descripcionModulos?.modulos || [];
    const mapeoImagenes = this.sections.descripcionModulos?.mapeoImagenes || {};
    const obrasExtInt = this.sections.descripcionModulos?.obrasExtInt || [];

    if (modulos.length === 0) return;

    // Buscar el heading 1.5.2
    let heading152Index = descripcionModulos.content.findIndex(
      (item) => item.type === "heading" && item.text === "1.5.2. Descripción por bloque o edificación"
    );

    if (heading152Index === -1) {
      heading152Index = descripcionModulos.content.findIndex(
        (item) => item.type === "heading" && item.text?.includes("Descripción por bloque")
      );
    }

    if (heading152Index === -1) return;

    // Eliminar todo el contenido DESPUÉS del heading
    descripcionModulos.content.splice(heading152Index + 1, descripcionModulos.content.length - (heading152Index + 1));

    const nuevosModulos = [];

    // ========== SECCIÓN: MÓDULOS 01 al 16 ==========
    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];
      const numeroModulo = i + 1;
      const numeroModuloStr = String(numeroModulo).padStart(2, '0');

      const infoImagenes = mapeoImagenes[numeroModulo];

      // Título
      nuevosModulos.push({
        type: "heading",
        level: 3,
        text: `1.5.2.${numeroModulo}. MÓDULO ${numeroModuloStr}`
      });

      // IMÁGENES (desde el store)
      if (infoImagenes && infoImagenes.archivos && infoImagenes.archivos.length > 0) {
        for (let imgIdx = 0; imgIdx < infoImagenes.archivos.length; imgIdx++) {
          const archivo = infoImagenes.archivos[imgIdx];
          const numeroFigura = infoImagenes.figuras[imgIdx];
          const subtitulo = infoImagenes.subtitulos[imgIdx] || "";

          nuevosModulos.push({
            type: "image",
            src: `/assets/img/memoria_decriptiva/modulos/${archivo}`,
            width: 500,
            height: 380,
            caption: `Figura ${numeroFigura}${subtitulo}. Distribución Arquitectónica del Módulo ${numeroModuloStr}`,
            alignment: "CENTER"
          });
        }
      }

      // TABLA del módulo
      nuevosModulos.push({
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

      if (i < modulos.length - 1) {
        nuevosModulos.push({ type: "paragraph", text: "" });
        nuevosModulos.push({ type: "pageBreak" });
      }
    }

    // ========== SECCIÓN: OBRAS EXTERIORES E INTERIORES ==========
    if (obrasExtInt.length > 0) {
      nuevosModulos.push({ type: "pageBreak" });

      for (let i = 0; i < obrasExtInt.length; i++) {
        const obra = obrasExtInt[i];

        // Título
        nuevosModulos.push({
          type: "heading",
          level: 3,
          text: `1.5.2.${obra.numero}. ${obra.nombre}`
        });

        // IMÁGENES (desde el store)
        if (obra.tieneImagen && obra.archivos && obra.archivos.length > 0) {
          for (let imgIdx = 0; imgIdx < obra.archivos.length; imgIdx++) {
            const archivo = obra.archivos[imgIdx];
            const numeroFigura = obra.figuras[imgIdx];
            const subtitulo = obra.subtitulos[imgIdx] || "";

            nuevosModulos.push({
              type: "image",
              src: `/assets/img/memoria_decriptiva/modulos/${archivo}`,
              width: 500,
              height: 380,
              caption: `Figura ${numeroFigura}${subtitulo}. ${obra.nombre}`,
              alignment: "CENTER"
            });
          }
        }

        // TABLA según el tipo
        if (obra.tipoTabla === "cincoFilas") {
          nuevosModulos.push({
            type: "table",
            widthPercent: 90,
            columns: [
              { header: "PARÁMETRO", width: 30 },
              { header: "DESCRIPCIÓN", width: 70 },
            ],
            rows: [
              ["USO", obra.uso],
              ["#pisos", obra.nropisos],
              ["Sistema estructural", obra.sistemaEstructural],
              ["Descripción", obra.descripcion],
              ["Techo", obra.techo],
            ],
          });
        } else if (obra.tipoTabla === "cuatroFilas") {
          nuevosModulos.push({
            type: "table",
            widthPercent: 90,
            columns: [
              { header: "PARÁMETRO", width: 30 },
              { header: "DESCRIPCIÓN", width: 70 },
            ],
            rows: [
              ["USO", obra.uso],
              ["#pisos", obra.nropisos],
              ["Descripción", obra.descripcion],
              ["Techo", obra.techo],
            ],
          });
        } else if (obra.tipoTabla === "dosFilas") {
          nuevosModulos.push({
            type: "table",
            widthPercent: 90,
            columns: [
              { header: "PARÁMETRO", width: 30 },
              { header: "DESCRIPCIÓN", width: 70 },
            ],
            rows: [
              ["USO", obra.uso],
              ["#pisos", obra.nropisos],
            ],
          });
        } else {
          // unaFila
          nuevosModulos.push({
            type: "table",
            widthPercent: 90,
            columns: [
              { header: "PARÁMETRO", width: 30 },
              { header: "DESCRIPCIÓN", width: 70 },
            ],
            rows: [["USO", obra.uso]],
          });
        }

        if (i < obrasExtInt.length - 1) {
          nuevosModulos.push({ type: "paragraph", text: "" });
          nuevosModulos.push({ type: "pageBreak" });
        }
      }
    }

    // Insertar los nuevos módulos (SOLO UNA VEZ)
    descripcionModulos.content.splice(heading152Index + 1, 0, ...nuevosModulos);
  }

  transformMarcoTeorico(structure) {
    const marcoTeorico = structure.document.sections.find((s) => s.id === "marco_teorico");
    if (!marcoTeorico) return;

    const mt = this.sections.marcoTeorico || {};

    // Limpiar contenido existente
    marcoTeorico.content = [];

    // ========== a) CONCEPTOS BASICOS ==========
    if (mt.conceptosBasicos) {
      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "a) CONCEPTOS BASICOS" },
        { type: "paragraph", text: mt.conceptosBasicos, alignment: "JUSTIFIED" }
      );
    }

    // ========== b) CRITERIOS ESTRUCTURALES ==========
    if (mt.criteriosEstructurales && mt.criteriosEstructurales.length > 0) {
      marcoTeorico.content.push({ type: "heading", level: 2, text: "b) CRITERIOS ESTRUCTURALES" });

      const letras = ["a", "b", "c", "d", "e", "f"];
      for (let i = 0; i < mt.criteriosEstructurales.length; i++) {
        const criterio = mt.criteriosEstructurales[i];
        const dosPuntosIndex = criterio.indexOf(":");
        if (dosPuntosIndex !== -1) {
          const titulo = criterio.substring(0, dosPuntosIndex).trim();
          const descripcion = criterio.substring(dosPuntosIndex + 1).trim();
          marcoTeorico.content.push(
            { type: "paragraph", text: `${letras[i]}. ${titulo}`, bold: true, alignment: "JUSTIFIED" },
            { type: "paragraph", text: descripcion, alignment: "JUSTIFIED" }
          );
        }
      }
    }
    // ========== c) ELECCIÓN DEL SISTEMA ESTRUCTURAL ==========
    if (mt.eleccionSistema) {
      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "c) ELECCIÓN DEL SISTEMA ESTRUCTURAL" },
        { type: "paragraph", text: mt.eleccionSistema, alignment: "JUSTIFIED" }
      );
    }

    // ========== d) ELEMENTOS ESTRUCTURALES ==========
    if (mt.elementosEstructurales && mt.elementosEstructurales.length > 0) {
      marcoTeorico.content.push({ type: "heading", level: 2, text: "d) ELEMENTOS ESTRUCTURALES" });

      const letrasElementos = ["a", "b", "c", "d", "e", "f"];
      for (let i = 0; i < mt.elementosEstructurales.length; i++) {
        const elemento = mt.elementosEstructurales[i];
        const dosPuntosIndex = elemento.indexOf(":");
        if (dosPuntosIndex !== -1) {
          const titulo = elemento.substring(0, dosPuntosIndex).trim();
          const descripcion = elemento.substring(dosPuntosIndex + 1).trim();
          marcoTeorico.content.push(
            { type: "paragraph", text: `${letrasElementos[i]}. ${titulo}`, bold: true, alignment: "JUSTIFIED" },
            { type: "paragraph", text: descripcion, alignment: "JUSTIFIED" }
          );
        }
      }
    }

    // ========== e) MATERIALES DE LOS ELEMENTOS ESTRUCTURALES ==========
    if (mt.materiales) {
      marcoTeorico.content.push({ type: "heading", level: 2, text: "e) MATERIALES DE LOS ELEMENTOS ESTRUCTURALES" });

      // Concreto estructural
      if (mt.materiales.concreto) {
        const c = mt.materiales.concreto;

        // Título Concreto estructural
        marcoTeorico.content.push({ type: "heading", level: 3, text: "Concreto estructural" });

        // Descripción general del concreto
        marcoTeorico.content.push({ type: "paragraph", text: c.descripcionGeneral || "", alignment: "JUSTIFIED" });

        // a. Resistencia a la compresión (f'c)
        marcoTeorico.content.push(
          { type: "paragraph", text: "a. Resistencia a la compresión (f'c)", bold: true, alignment: "JUSTIFIED" },
          { type: "paragraph", text: c.descripcionResistencia || "", alignment: "JUSTIFIED" }
        );

        // IMAGEN 1 - Curvas esfuerzo-deformación del concreto
        marcoTeorico.content.push({
          type: "image",
          src: "/assets/img/memoria_decriptiva/modulos/figura2CurvaEsfuerzo.png",
          width: 450,
          height: 300,
          caption: "Figura 2. Curvas esfuerzo – deformación de concreto de diferentes resistencias a la compresión.",
          alignment: "CENTER"
        });

        // Texto después de la imagen de resistencia
        marcoTeorico.content.push({ type: "paragraph", text: `Para el diseño de los elementos estructurales se usará una resistencia a la compresión de f’c = 210 Kg/cm2 y para obras hidráulicas f’c=280 kg/cm2.`, alignment: "JUSTIFIED" });

        // b. Módulo de elasticidad (Ec)
        marcoTeorico.content.push(
          { type: "paragraph", text: "b. Módulo de elasticidad (Ec)", bold: true, alignment: "JUSTIFIED" },
          { type: "paragraph", text: "Viene a ser la tangente en la zona elástica de la curva esfuerzo – deformación unitaria.", alignment: "JUSTIFIED" }
        );

        // IMAGEN 2 - Módulo de elasticidad (ANTES de la fórmula)
        marcoTeorico.content.push({
          type: "image",
          src: "/assets/img/memoria_decriptiva/modulos/figura3ModuloElasticidad.png",
          width: 450,
          height: 300,
          caption: "Figura 3. Módulo de elasticidad representada como una tangente (Ec).",
          alignment: "CENTER"
        });


        // Fórmula de Ec
        marcoTeorico.content.push(
          { type: "paragraph", text: "De acuerdo con la NTE E.060 en el art. 8.5.2 especifica la determinación del módulo elasticidad del concreto, con un peso específico aproximado de 2300 kg/m3, mediante la siguiente fórmula:", alignment: "JUSTIFIED" },
          { type: "paragraph", text: "Ec = 15000 √(f'c)", bold: true, alignment: "CENTER" },
          { type: "paragraph", text: `En el presente diseño usaremos f'c = ${c.fc || "210"} kg/cm2, entonces obtenemos como módulo de elasticidad Ec = ${c.ec || "217370.65"} kg/cm2.`, alignment: "JUSTIFIED" }
        );

        // c. Peso específico (ϒc)
        marcoTeorico.content.push(
          { type: "paragraph", text: "c. Peso específico (ϒc)", bold: true, alignment: "JUSTIFIED" },
          { type: "paragraph", text: "El peso específico para concreto simple es 2300 kg/m3 de acuerdo con la NTE E.020 especificada en el anexo 1 (pesos unitarios). Así mismo para concreto armado agregamos 100 kg/m3 obteniendo 2400 kg/m3, el cual será considerado para el análisis de cargas estáticas de la estructura.", alignment: "JUSTIFIED" },
          { type: "paragraph", text: `Entre otras propiedades mecánicas tenemos el coeficiente de Poisson (u = ${c.poisson || "0.20"}), módulo de corte (G = 90571.10 kg/cm2), entre otros.`, alignment: "JUSTIFIED" }
        );
      }
    }

    // ========== f) ACERO DE REFUERZO ==========
    if (mt.materiales && mt.materiales.acero) {
      const a = mt.materiales.acero;

      marcoTeorico.content.push({ type: "heading", level: 2, text: "f) ACERO DE REFUERZO" });

      // Descripción general del acero
      marcoTeorico.content.push(
        { type: "paragraph", text: a.descripcionGeneral || "Es un acero corrugado laminado en caliente que posee una gran ductilidad, así mismo posee corrugas o resaltes que tienen la finalidad de adherirse mejor al concreto.", alignment: "JUSTIFIED" },
        { type: "paragraph", text: "Contiene principalmente hierro, carbono y otros elementos químicos, en esta aleación el carbono se encuentra en un porcentaje entre 0.2% y 0.3% en peso.", alignment: "JUSTIFIED" },
        { type: "paragraph", text: "El refuerzo corrugado debe cumplir las Normas ASTM A615 grado 60 / NTP 341.031 (aceros no soldables) o ASTM A706 grado 60 / NTP 339.186 (aceros soldables).", alignment: "JUSTIFIED" },
        { type: "paragraph", text: "La función principal del acero en el concreto armado es de tomar todos los esfuerzos a tracción, ya que el concreto posee una insignificante resistencia a la tracción. A continuación, definiremos algunas propiedades mecánicas y físicas del acero de refuerzo.", alignment: "JUSTIFIED" }
      );

      // a. Esfuerzo de fluencia (fy)
      marcoTeorico.content.push(
        { type: "paragraph", text: "a. Esfuerzo de fluencia (fy)", bold: true, alignment: "JUSTIFIED" },
        { type: "paragraph", text: a.descripcionFluencia || "Es aquel esfuerzo donde, partir del cual el acero llega a una deformación unitaria de 0.0035, continúa deformándose sin necesidad de incrementar la fuerza de tensión. A continuación, mostramos el diagrama de esfuerzo – deformación del acero.", alignment: "JUSTIFIED" }
      );

      // IMAGEN - Diagrama esfuerzo-deformación del acero
      marcoTeorico.content.push({
        type: "image",
        src: "/assets/img/memoria_decriptiva/modulos/figura4DiagramaEsfuerzo.png",
        width: 450,
        height: 350,
        caption: "Figura 4. Diagrama esfuerzo – deformación del acero (fy).",
        alignment: "CENTER"
      });

      // Valor de fy
      marcoTeorico.content.push(
        { type: "paragraph", text: `En el presente proyecto se diseñará con acero corrugado de grado 60, es decir, fy = ${a.fy || "4200"} kg/cm2.`, alignment: "JUSTIFIED" }
      );

      // b. Módulo de elasticidad (Es)
      marcoTeorico.content.push(
        { type: "paragraph", text: "b. Módulo de elasticidad (Es)", bold: true, alignment: "JUSTIFIED" },
        { type: "paragraph", text: a.descripcionModulo || "Viene a ser la pendiente de la curva en la zona lineal del diagrama esfuerzo - deformación del acero.", alignment: "JUSTIFIED" },
        { type: "paragraph", text: `Teniendo como valor Es = ${a.es || "2000000"} kg/cm2.`, alignment: "JUSTIFIED" }
      );

      // c. Peso específico (Y)
      marcoTeorico.content.push(
        { type: "paragraph", text: "c. Peso específico (Y)", bold: true, alignment: "JUSTIFIED" },
        { type: "paragraph", text: `El peso específico del acero es Y = ${a.peso || "7.85"} ton/m3 (NTE E.020).`, alignment: "JUSTIFIED" }
      );
    }

    // ========== g) CARGA MUERTA ==========
    if (mt.cargaMuerta) {
      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "g) CARGA MUERTA" },
        { type: "paragraph", text: mt.cargaMuerta.descripcion || "", alignment: "JUSTIFIED" },
        { type: "list", listType: "bullet", items: mt.cargaMuerta.items || [] }
      );
    }
    // ========== h) CARGA VIVA ==========
    if (mt.cargaViva) {
      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "h) CARGA VIVA" },
        { type: "paragraph", text: mt.cargaViva.descripcion || "", alignment: "JUSTIFIED" },
        { type: "list", listType: "bullet", items: mt.cargaViva.items || [] }
      );
    }


    // ========== i) ELECCIÓN DEL SOFTWARE ESTRUCTURAL ==========
    if (mt.software) {
      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "i) ELECCIÓN DEL SOFTWARE ESTRUCTURAL" },
        { type: "paragraph", text: mt.software, alignment: "JUSTIFIED" }
      );

      // IMAGEN después del texto
      marcoTeorico.content.push({
        type: "image",
        src: "public/assets/img/memoria_decriptiva/modulos/figura28VentanaPresentacion.png",
        width: 500,
        height: 350,
        caption: "Figura. Ventana de presentación del programa ETABS V16.",
        alignment: "CENTER"
      });
    }

    // ========== j) PARÁMETROS SÍSMICOS ==========
    if (mt.parametrosSismicos) {
      const ps = mt.parametrosSismicos;

      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "j) PARÁMETROS SÍSMICOS" },
        { type: "paragraph", text: ps.textoIntro, alignment: "JUSTIFIED" },
        { type: "heading", level: 3, text: "Factor zona (Z)" },
        { type: "paragraph", text: ps.textoFactorZona, alignment: "JUSTIFIED" }
      );

      // IMAGEN 1
      marcoTeorico.content.push({
        type: "image",
        src: "public/assets/img/memoria_decriptiva/modulos/tablaZona.png",
        width: 400,
        height: 200,
        caption: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
        alignment: "CENTER"
      });

      marcoTeorico.content.push({ type: "paragraph", text: ps.textoZonaUbicacion, alignment: "JUSTIFIED" });

      // IMAGEN 2
      marcoTeorico.content.push({
        type: "image",
        src: "public/assets/img/memoria_decriptiva/modulos/figura30MapaSismico.png",
        width: 500,
        height: 400,
        caption: "Figura 30: Distribución espacial sismicidad del Perú.",
        alignment: "CENTER"
      });

      marcoTeorico.content.push(
        { type: "heading", level: 3, text: "Condiciones geotécnicas" },
        { type: "paragraph", text: ps.textoGeotecnico, alignment: "JUSTIFIED" }
      );

      // IMAGEN 3
      marcoTeorico.content.push({
        type: "image",
        src: "public/assets/img/memoria_decriptiva/modulos/tablaCategoriaEdificaciones.png",
        width: 500,
        height: 250,
        caption: "Tabla N° 3 - FACTOR DE SUELO \"S\"",
        alignment: "CENTER"
      });

      // IMAGEN 4
      marcoTeorico.content.push({
        type: "image",
        src: "public/assets/img/memoria_decriptiva/modulos/tablaIrregularidades.png",
        width: 500,
        height: 200,
        caption: "Tabla N° 4 - PERÍODOS \"Tp\" Y \"TL\"",
        alignment: "CENTER"
      });

      marcoTeorico.content.push(
        { type: "heading", level: 3, text: "Periodo fundamental (T)" },
        { type: "paragraph", text: ps.textoPeriodo, alignment: "JUSTIFIED" },
        { type: "heading", level: 3, text: "Coeficiente de amplificación sísmica (C)" },
        { type: "paragraph", text: ps.textoCoeficiente, alignment: "JUSTIFIED" },
        { type: "list", listType: "bullet", items: ps.formulas },
        { type: "paragraph", text: "Siendo:", alignment: "JUSTIFIED" },
        { type: "list", listType: "bullet", items: ["T = periodo fundamental de la estructura."] },
        { type: "heading", level: 3, text: "Categoría de la edificación y factor de uso (U)" },
        { type: "paragraph", text: ps.textoCategoria, alignment: "JUSTIFIED" }
      );

      // IMAGEN 5
      marcoTeorico.content.push({
        type: "image",
        src: "public/assets/img/memoria_decriptiva/modulos/tablaIrregularidades2.png",
        width: 550,
        height: 350,
        caption: "Tabla N° 5 - CATEGORÍA DE LAS EDIFICACIONES Y FACTOR \"U\"",
        alignment: "CENTER"
      });

      marcoTeorico.content.push(
        { type: "paragraph", text: ps.textoProyecto, alignment: "JUSTIFIED" },
        { type: "heading", level: 3, text: "Irregularidades" },
        { type: "paragraph", text: ps.textoIrregularidadAltura, bold: true, alignment: "JUSTIFIED" }
      );

      // IMAGEN 6
      marcoTeorico.content.push({
        type: "image",
        src: "public/assets/img/memoria_decriptiva/modulos/tablaSistemas.png",
        width: 550,
        height: 400,
        caption: "Tabla N° 8 - IRREGULARIDADES ESTRUCTURALES EN ALTURA",
        alignment: "CENTER"
      });

      marcoTeorico.content.push(
        { type: "paragraph", text: ps.textoIrregularidadPlanta, bold: true, alignment: "JUSTIFIED" }
      );

      // IMAGEN 7
      marcoTeorico.content.push({
        type: "image",
        src: "public/assets/img/memoria_decriptiva/modulos/tablaResponse.png",
        width: 550,
        height: 400,
        caption: "Tabla N° 9 - IRREGULARIDADES ESTRUCTURALES EN PLANTA",
        alignment: "CENTER"
      });
    }
    console.log("✅ transformMarcoTeorico ejecutado");
  }
  // ============================================
  // SECCIÓN 2 - CONSIDERACIONES GENERALES (NUEVA SECCIÓN)
  // ============================================
  transformConsideracionesGenerales(structure) {
    // Buscar o crear la sección
    let consideraciones = structure.document.sections.find((s) => s.id === "consideraciones");

    if (!consideraciones) {
      consideraciones = {
        id: "consideraciones",
        title: "2. CONSIDERACIONES GENERALES DE DISEÑO",
        level: 1,
        content: []
      };
      // Insertar después de descripcion_bloques
      const descIdx = structure.document.sections.findIndex((s) => s.id === "descripcion_bloques");
      if (descIdx !== -1) {
        structure.document.sections.splice(descIdx + 1, 0, consideraciones);
      } else {
        structure.document.sections.push(consideraciones);
      }
    }

    const consideracionesData = this.sections.consideraciones || {};
    const content = [];

    content.push({
      type: "paragraph",
      text: "A continuación se presentan las condiciones geotécnicas, parámetros sísmicos y método de diseño para cada módulo del proyecto.",
      alignment: "JUSTIFIED"
    });

    // Recorrer los 16 módulos
    for (let i = 1; i <= 16; i++) {
      const modulo = consideracionesData[i];

      // 🔥 Si no hay datos para este módulo, saltar (sin fallbacks)
      if (!modulo) continue;

      content.push({ type: "heading", level: 2, text: `MÓDULO ${String(i).padStart(2, '0')}` });

      // Condiciones Geotécnicas
      if (modulo.geotecnia) {
        content.push({ type: "heading", level: 3, text: "CONDICIONES GEOTÉCNICAS" });
        content.push({
          type: "table",
          widthPercent: 80,
          columns: [{ header: "Parámetro", width: 40 }, { header: "Valor", width: 60 }],
          rows: [
            ["Perfil del suelo", modulo.geotecnia.perfilSuelo || ""],
            ["Capacidad Portante", modulo.geotecnia.capacidadPortante ? `${modulo.geotecnia.capacidadPortante} kg/cm²` : ""],
            ["Profundidad de cimentación", modulo.geotecnia.profundidad ? `${modulo.geotecnia.profundidad} m` : ""],
            ["Agresividad de sulfatos", modulo.geotecnia.agresividadSulfatos || ""],
            ["Prof. N.F.", modulo.geotecnia.profNF || ""]
          ]
        });
      }

      // Parámetros Sísmicos
      if (modulo.sismico) {
        content.push({ type: "heading", level: 3, text: "CONDICIONES SÍSMICAS - PARÁMETROS SISMORESISTENTES" });
        content.push({
          type: "table",
          widthPercent: 80,
          columns: [{ header: "Parámetro", width: 40 }, { header: "Valor", width: 60 }],
          rows: [
            ["Zona sísmica", modulo.sismico.zona || ""],
            ["Factor Z", modulo.sismico.factorZ || ""],
            ["Perfil de suelo", modulo.sismico.perfilSuelo || ""],
            ["Factor S", modulo.sismico.factorS || ""],
            ["Tp (s)", modulo.sismico.tp || ""],
            ["Tl (s)", modulo.sismico.tl || ""],
            ["Categoría", modulo.sismico.categoria || ""],
            ["Factor U", modulo.sismico.factorU || ""],
            ["Coeficiente de reducción (R)", modulo.sismico.coeficienteR || ""]
          ]
        });
      }

      // Sobrecargas
      if (modulo.sobrecargas) {
        content.push({ type: "heading", level: 3, text: "SOBRECARGAS EMPLEADAS" });
        const sobrecargasList = modulo.sobrecargas.split('\n').filter(s => s.trim());
        if (sobrecargasList.length > 0) {
          content.push({ type: "list", listType: "bullet", items: sobrecargasList });
        }
      }

      // Método de diseño
      content.push({ type: "heading", level: 3, text: "MÉTODO DE DISEÑO" });

      if (modulo.recubrimientos) {
        content.push({ type: "heading", level: 4, text: "RECUBRIMIENTOS DE ELEMENTOS" });
        const recubrimientosList = modulo.recubrimientos.split('\n').filter(r => r.trim());
        if (recubrimientosList.length > 0) {
          content.push({ type: "list", listType: "bullet", items: recubrimientosList });
        }
      }

      if (modulo.materiales) {
        content.push({ type: "heading", level: 4, text: "MATERIALES DE DISEÑO" });
        const materialesList = modulo.materiales.split('\n').filter(m => m.trim());
        if (materialesList.length > 0) {
          content.push({ type: "list", listType: "bullet", items: materialesList });
        }
      }

      if (i < 16) content.push({ type: "pageBreak" });
    }

    consideraciones.content = content;
  }

  // ============================================
  // SECCIÓN 3 - PREDIMENSIONAMIENTO (MEJORADO)
  // ============================================
  transformPredimensionamiento(structure) {
    let predimSection = structure.document.sections.find((s) => s.id === "predimensionamiento");

    if (!predimSection) {
      predimSection = {
        id: "predimensionamiento",
        title: "4. PREDIMENSIONAMIENTO DE ELEMENTOS ESTRUCTURALES",
        level: 1,
        content: []
      };
      structure.document.sections.push(predimSection);
    }

    const predimData = this.sections.predimensionamiento || {};
    const previews = this.previews || {};
    const content = [];

    content.push({
      type: "paragraph",
      text: "Se definirá las dimensiones de los elementos estructurales en base a ciertos criterios establecidos y/o recomendados. Luego se verificarán durante el análisis y diseño.",
      alignment: "JUSTIFIED"
    });

    content.push({ type: "heading", level: 2, text: "Criterios Generales" });
    content.push({
      type: "list",
      listType: "bullet",
      items: [
        "Pre dimensionamiento de losa aligerada: h = L/25 para losas aligeradas.",
        "Pre dimensionamiento de vigas peraltadas: h = L/10, L/11 o L/12.",
        "Pre dimensionamiento de columnas: según carga tributaria, mínimo 25x25 cm."
      ]
    });

    // Recorrer los 15 módulos - SIN valores por defecto
    for (let i = 1; i <= 15; i++) {
      const modulo = predimData[i];

      // 🔥 Si no hay datos para este módulo, saltar
      if (!modulo) continue;

      content.push({ type: "heading", level: 2, text: `MÓDULO ${String(i).padStart(2, '0')}` });

      // Techos
      if (modulo.techos) {
        content.push({ type: "heading", level: 3, text: "Pre dimensionamiento de los techos" });
        const relacion = (parseFloat(modulo.techos.luz) / parseFloat(modulo.techos.espesor)).toFixed(1);
        content.push({
          type: "table",
          widthPercent: 70,
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
        content.push({
          type: "image",
          src: losaImage,
          width: 500,
          height: 300,
          caption: `Pre-dimensionamiento losa aligerado Módulo ${String(i).padStart(2, '0')}`,
          alignment: "CENTER"
        });
      }

      // Vigas
      if (modulo.vigas?.principal) {
        content.push({ type: "heading", level: 3, text: "Pre dimensionamiento de vigas" });
        const v = modulo.vigas.principal;
        content.push({
          type: "table",
          widthPercent: 90,
          title: "Vigas Principales",
          columns: [
            { header: "Eje", width: 15 }, { header: "b (cm)", width: 20 },
            { header: "h (cm)", width: 20 }, { header: "Luz (m)", width: 20 },
            { header: "Relación b/h", width: 25 }
          ],
          rows: [
            ["A", v.ejeA?.b || "", v.ejeA?.h || "", v.ejeA?.luz || "",
              (parseFloat(v.ejeA?.b || 0) / parseFloat(v.ejeA?.h || 1)).toFixed(2)],
            ["B", v.ejeB?.b || "", v.ejeB?.h || "", v.ejeB?.luz || "",
              (parseFloat(v.ejeB?.b || 0) / parseFloat(v.ejeB?.h || 1)).toFixed(2)],
            ["C", v.ejeC?.b || "", v.ejeC?.h || "", v.ejeC?.luz || "",
              (parseFloat(v.ejeC?.b || 0) / parseFloat(v.ejeC?.h || 1)).toFixed(2)]
          ]
        });
      }

      const vigaImage = previews.predimVigaImage?.[i];
      if (vigaImage) {
        content.push({
          type: "image",
          src: vigaImage,
          width: 500,
          height: 300,
          caption: `Pre-dimensionamiento viga Módulo ${String(i).padStart(2, '0')}`,
          alignment: "CENTER"
        });
      }

      // Columnas
      if (modulo.columnas) {
        content.push({ type: "heading", level: 3, text: "Pre dimensionamiento de columnas" });
        const c = modulo.columnas;
        content.push({
          type: "table",
          widthPercent: 90,
          title: "Columnas",
          columns: [
            { header: "Columna", width: 20 }, { header: "b (cm)", width: 20 },
            { header: "h (cm)", width: 20 }, { header: "Área (cm²)", width: 20 },
            { header: "Observación", width: 20 }
          ],
          rows: [
            ["C1 (esquina)", c.c1?.b || "", c.c1?.h || "",
              (parseFloat(c.c1?.b || 0) * parseFloat(c.c1?.h || 0)).toFixed(0), c.c1?.obs || ""],
            ["C2 (borde)", c.c2?.b || "", c.c2?.h || "",
              (parseFloat(c.c2?.b || 0) * parseFloat(c.c2?.h || 0)).toFixed(0), c.c2?.obs || ""],
            ["C3 (central)", c.c3?.b || "", c.c3?.h || "",
              (parseFloat(c.c3?.b || 0) * parseFloat(c.c3?.h || 0)).toFixed(0), c.c3?.obs || ""]
          ]
        });
      }

      if (modulo.observaciones) {
        content.push({ type: "paragraph", text: modulo.observaciones, alignment: "JUSTIFIED", italic: true });
      }

      if (i < 15) content.push({ type: "pageBreak" });
    }

    content.push({
      type: "paragraph",
      text: "Nota: Las dimensiones finales de todos los elementos estructurales serán verificadas mediante el análisis estructural detallado.",
      alignment: "JUSTIFIED",
      italic: true
    });

    predimSection.content = content;
  }

  // ============================================
  // SECCIÓN 4 - DEMOLICIÓN (MEJORADO)
  // ============================================
  transformDemolicion(structure) {
    let demSection = structure.document.sections.find((s) => s.id === "demolicion");

    if (!demSection) {
      demSection = {
        id: "demolicion",
        title: "5. ALCANCE DEL ESTUDIO DE DEMOLICIÓN",
        level: 1,
        content: []
      };
      structure.document.sections.push(demSection);
    }

    const demData = this.sections.demolicion || {};
    const previews = this.previews || {};
    const content = [];

    const alcance = demData.alcance || "Las edificaciones a intervenir son todas las existentes en el terreno de la I.E.I.P. N° 64193 Contamana, las cuales presentan patologías constructivas y no cumplen con los requisitos estructurales vigentes.";

    content.push({ type: "paragraph", text: alcance, alignment: "JUSTIFIED" });

    // Módulos a demoler
    const modulosADemoler = (demData.modulosADemoler || []).filter(m => m && m.trim() !== "");
    content.push({ type: "heading", level: 2, text: "Módulos a Demoler" });

    if (modulosADemoler.length > 0) {
      content.push({ type: "list", listType: "numbered", items: modulosADemoler });
    } else {
      content.push({
        type: "list",
        listType: "numbered",
        items: [
          "MÓDULO I (Biblioteca, Almacén de Alimentos, Dirección) - DEMOLICIÓN TOTAL",
          "MÓDULO II (ALMACÉN) - DEMOLICIÓN TOTAL",
          "MÓDULO III (AULAS DE SEGUNDO, TERCERO Y CUARTO) - DEMOLICIÓN TOTAL",
          "MÓDULO IV (AULA INICIAL DE 5 AÑOS) - DEMOLICIÓN TOTAL",
          "MÓDULO V (DEPÓSITO DE MOBILIARIOS) - DEMOLICIÓN TOTAL",
          "MÓDULO VI (AULAS DE INICIAL) - DEMOLICIÓN TOTAL",
          "MÓDULO VII (SERVICIOS HIGIÉNICOS) - DEMOLICIÓN TOTAL"
        ]
      });
    }

    // Obras exteriores a demoler
    const obrasExteriores = (demData.obrasExterioresADemoler || []).filter(o => o && o.trim() !== "");
    content.push({ type: "heading", level: 2, text: "Obras Exteriores a Demoler" });

    if (obrasExteriores.length > 0) {
      content.push({ type: "list", listType: "numbered", items: obrasExteriores });
    } else {
      content.push({
        type: "list",
        listType: "numbered",
        items: [
          "OBRAS EXTERIORES N°1 (PATIO DE FORMACIÓN) - DEMOLICIÓN TOTAL",
          "OBRAS EXTERIORES N°2 (LOSA DEPORTIVA) - DEMOLICIÓN TOTAL",
          "OBRAS EXTERIORES N°3 (SARDINELES, CUNETAS Y VEREDAS) - DEMOLICIÓN TOTAL",
          "OBRAS EXTERIORES N°4 (CERCO PERIMÉTRICO) - DEMOLICIÓN TOTAL",
          "OBRAS EXTERIORES N°5 (ANTENA) - REUBICACIÓN"
        ]
      });
    }

    // Evidencia fotográfica
    const demolicionImages = (previews.demolicionImages || []).filter(img => img && img !== null);
    if (demolicionImages.length > 0) {
      content.push({ type: "heading", level: 2, text: "Evidencia Fotográfica" });

      const imageRows = [];
      for (let i = 0; i < demolicionImages.length; i += 2) {
        const row = [];
        row.push({
          type: "image",
          src: demolicionImages[i],
          width: 250,
          height: 200,
          caption: `Evidencia ${i + 1}`,
          alignment: "CENTER"
        });
        if (demolicionImages[i + 1]) {
          row.push({
            type: "image",
            src: demolicionImages[i + 1],
            width: 250,
            height: 200,
            caption: `Evidencia ${i + 2}`,
            alignment: "CENTER"
          });
        } else {
          row.push({ type: "paragraph", text: "" });
        }
        imageRows.push(row);
      }

      if (imageRows.length > 0) {
        content.push({
          type: "table",
          widthPercent: 95,
          noBorders: true,
          columns: [{ width: 50 }, { width: 50 }],
          rows: imageRows
        });
      }
    }

    demSection.content = content;
  }


  // ============================================
  // MÉTODOS AUXILIARES (ya los tienes)
  // ============================================
  findNextHeadingIndex(content, startIdx) {
    const nextIdx = content.findIndex((item, i) => i > startIdx && item.type === "heading");
    return nextIdx === -1 ? content.length : nextIdx;
  }

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
}