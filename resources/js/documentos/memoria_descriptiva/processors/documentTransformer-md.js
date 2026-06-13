
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

        marcoTeorico.content.push({ type: "heading", level: 3, text: "Concreto estructural" });
        marcoTeorico.content.push({ type: "paragraph", text: c.descripcionGeneral || "", alignment: "JUSTIFIED" });

        // a. Resistencia a la compresión (f'c)
        marcoTeorico.content.push(
          { type: "paragraph", text: "a. Resistencia a la compresión (f'c)", bold: true, alignment: "JUSTIFIED" },
          { type: "paragraph", text: c.descripcionResistencia || "", alignment: "JUSTIFIED" }
        );

        // IMAGEN 1
        marcoTeorico.content.push({
          type: "image",
          src: "/assets/img/memoria_decriptiva/modulos/figura2CurvaEsfuerzo.png",
          width: 450,
          height: 300,
          caption: "Figura 2. Curvas esfuerzo – deformación de concreto de diferentes resistencias a la compresión.",
          alignment: "CENTER"
        });

        marcoTeorico.content.push({ type: "paragraph", text: `Para el diseño de los elementos estructurales se usará una resistencia a la compresión de f'c = ${c.fc || "210"} kg/cm2 y para obras hidráulicas f'c = 280 kg/cm2.`, alignment: "JUSTIFIED" });

        // b. Módulo de elasticidad (Ec)
        marcoTeorico.content.push(
          { type: "paragraph", text: "b. Módulo de elasticidad (Ec)", bold: true, alignment: "JUSTIFIED" },
          { type: "paragraph", text: c.descripcionModulo || "", alignment: "JUSTIFIED" }  // ← lee del store
        );

        // IMAGEN 2
        marcoTeorico.content.push({
          type: "image",
          src: "/assets/img/memoria_decriptiva/modulos/figura3ModuloElasticidad.png",
          width: 450,
          height: 300,
          caption: "Figura 3. Módulo de elasticidad representada como una tangente (Ec).",
          alignment: "CENTER"
        });

        marcoTeorico.content.push(
          { type: "paragraph", text: c.descripcionFormula || "De acuerdo con la NTE E.060 en el art. 8.5.2 especifica la determinación del módulo elasticidad del concreto, con un peso específico aproximado de 2300 kg/m3, mediante la siguiente fórmula:", alignment: "JUSTIFIED" },
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

      // Acero de refuerzo
      if (mt.materiales.acero) {
        const a = mt.materiales.acero;

        marcoTeorico.content.push(
          { type: "heading", level: 3, text: "Acero de refuerzo" },
          { type: "paragraph", text: a.descripcionGeneral || "", alignment: "JUSTIFIED" },
          { type: "paragraph", text: "Contiene principalmente hierro, carbono y otros elementos químicos, en esta aleación el carbono se encuentra en un porcentaje entre 0.2% y 0.3% en peso.", alignment: "JUSTIFIED" },
          { type: "paragraph", text: "El refuerzo corrugado debe cumplir las Normas ASTM A615 grado 60 / NTP 341.031 (aceros no soldables) o ASTM A706 grado 60 / NTP 339.186 (aceros soldables).", alignment: "JUSTIFIED" },
          { type: "paragraph", text: "La función principal del acero en el concreto armado es de tomar todos los esfuerzos a tracción, ya que el concreto posee una insignificante resistencia a la tracción. A continuación, definiremos algunas propiedades mecánicas y físicas del acero de refuerzo.", alignment: "JUSTIFIED" }
        );

        // a. Esfuerzo de fluencia (fy)
        marcoTeorico.content.push(
          { type: "paragraph", text: "a. Esfuerzo de fluencia (fy)", bold: true, alignment: "JUSTIFIED" },
          { type: "paragraph", text: a.descripcionFluencia || "", alignment: "JUSTIFIED" }
        );

        // IMAGEN 3
        marcoTeorico.content.push({
          type: "image",
          src: "/assets/img/memoria_decriptiva/modulos/figura4DiagramaAcero.png",
          width: 450,
          height: 350,
          caption: "Figura 4. Diagrama esfuerzo – deformación del acero (fy).",
          alignment: "CENTER"
        });

        marcoTeorico.content.push(
          { type: "paragraph", text: `En el presente proyecto se diseñará con acero corrugado de grado 60, es decir, fy = ${a.fy || "4200"} kg/cm2.`, alignment: "JUSTIFIED" }
        );

        // b. Módulo de elasticidad (Es)
        marcoTeorico.content.push(
          { type: "paragraph", text: "b. Módulo de elasticidad (Es)", bold: true, alignment: "JUSTIFIED" },
          { type: "paragraph", text: a.descripcionModulo || "", alignment: "JUSTIFIED" },
          { type: "paragraph", text: `Teniendo como valor Es = ${a.es || "2000000"} kg/cm2.`, alignment: "JUSTIFIED" }
        );

        // c. Peso específico (Y)
        marcoTeorico.content.push(
          { type: "paragraph", text: "c. Peso específico (Y)", bold: true, alignment: "JUSTIFIED" },
          { type: "paragraph", text: `El peso específico del acero es Y = ${a.peso || "7.85"} ton/m3 (NTE E.020).`, alignment: "JUSTIFIED" }
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

      // a. Esfuerzo de fluencia (fy) - TÍTULO COMPLETO EN NEGRITA
      marcoTeorico.content.push(
        { type: "paragraph", text: `a. Esfuerzo de fluencia (fy)`, bold: true, alignment: "JUSTIFIED" },
        { type: "paragraph", text: a.descripcionFluencia || "Es aquel esfuerzo donde, partir del cual el acero llega a una deformación unitaria de 0.0035, continúa deformándose sin necesidad de incrementar la fuerza de tensión. A continuación, mostramos el diagrama de esfuerzo – deformación del acero.", alignment: "JUSTIFIED" }
      );

      // IMAGEN - Diagrama esfuerzo-deformación del acero
      marcoTeorico.content.push({
        type: "image",
        src: "public/assets/img/memoria_decriptiva/modulos/figura4DiagramaEsfuerzo.png",
        width: 450,
        height: 350,
        caption: "Figura 4. Diagrama esfuerzo – deformación del acero (fy).",
        alignment: "CENTER"
      });

      // Valor de fy
      marcoTeorico.content.push(
        { type: "paragraph", text: `En el presente proyecto se diseñará con acero corrugado de grado 60, es decir, fy = ${a.fy || "4200"} kg/cm2.`, alignment: "JUSTIFIED" }
      );

      // b. Módulo de elasticidad (Es) - TÍTULO COMPLETO EN NEGRITA
      marcoTeorico.content.push(
        { type: "paragraph", text: `b. Módulo de elasticidad (Es)`, bold: true, alignment: "JUSTIFIED" },
        { type: "paragraph", text: a.descripcionModulo || "Viene a ser la pendiente de la curva en la zona lineal del diagrama esfuerzo - deformación del acero.", alignment: "JUSTIFIED" },
        { type: "paragraph", text: `Teniendo como valor Es = ${a.es || "2000000"} kg/cm2.`, alignment: "JUSTIFIED" }
      );

      // c. Peso específico (Y) - TÍTULO COMPLETO EN NEGRITA
      marcoTeorico.content.push(
        { type: "paragraph", text: `c. Peso específico (Y)`, bold: true, alignment: "JUSTIFIED" },
        { type: "paragraph", text: `El peso específico del acero es Y = ${a.peso || "7.85"} ton/m3 (NTE E.020).`, alignment: "JUSTIFIED" }
      );
    }


    // ========== g) CARGA MUERTA ==========
    if (mt.materiales && mt.materiales.cargaMuerta) {
      const cm = mt.materiales.cargaMuerta;

      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "g) CARGA MUERTA" },
        { type: "paragraph", text: cm.descripcion || "", alignment: "JUSTIFIED" },
        { type: "list", listType: "bullet", items: cm.items || [] }
      );
    }
    // ========== h) CARGA VIVA ==========
    if (mt.materiales && mt.materiales.cargaViva) {
      const cv = mt.materiales.cargaViva;

      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "h) CARGA VIVA" },
        { type: "paragraph", text: cv.descripcion || "", alignment: "JUSTIFIED" },
        { type: "list", listType: "bullet", items: cv.items || [] }
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

      // IMAGEN 1 - Tabla N°1
      marcoTeorico.content.push({
        type: "image",
        src: "/assets/img/memoria_decriptiva/modulos/tablaZona.png",
        width: 400,
        height: 200,
        caption: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
        alignment: "CENTER"
      });

      marcoTeorico.content.push({ type: "paragraph", text: ps.textoZonaUbicacion, alignment: "JUSTIFIED" });

      // IMAGEN 2 - Mapa sísmico (Figura 30)
      marcoTeorico.content.push({
        type: "image",
        src: "/assets/img/memoria_decriptiva/modulos/figura30MapaSismico.png",
        width: 500,
        height: 400,
        caption: "Figura 30: Distribución espacial sismicidad del Perú.",
        alignment: "CENTER"
      });

      marcoTeorico.content.push(
        { type: "heading", level: 3, text: "Condiciones geotécnicas" },
        { type: "paragraph", text: ps.textoGeotecnico, alignment: "JUSTIFIED" },
        { type: "heading", level: 3, text: "Periodo fundamental (T)" },
        { type: "paragraph", text: ps.textoPeriodo, alignment: "JUSTIFIED" },
        { type: "heading", level: 3, text: "Coeficiente de amplificación sísmica (C)" },
        { type: "paragraph", text: ps.textoCoeficiente, alignment: "JUSTIFIED" },
        { type: "list", listType: "bullet", items: ps.formulas },
        { type: "paragraph", text: ps.textoSiendo, alignment: "JUSTIFIED" },
        { type: "list", listType: "bullet", items: ps.textoListaSiendo },
        { type: "heading", level: 3, text: "Categoría de la edificación y factor de uso (U)" },
        { type: "paragraph", text: ps.textoCategoria, alignment: "JUSTIFIED" }
      );

      // IMAGEN 3 - Tabla N°5 (Categorías)
      marcoTeorico.content.push({
        type: "image",
        src: "/assets/img/memoria_decriptiva/modulos/tabla5.png",
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

      // IMAGEN 4 - Tabla N°8 (Irregularidades en altura)
      marcoTeorico.content.push({
        type: "image",
        src: "/assets/img/memoria_decriptiva/modulos/tabla8.png",
        width: 550,
        height: 400,
        caption: "Tabla N° 8 - IRREGULARIDADES ESTRUCTURALES EN ALTURA",
        alignment: "CENTER"
      });

      marcoTeorico.content.push(
        { type: "paragraph", text: ps.textoIrregularidadPlanta, bold: true, alignment: "JUSTIFIED" }
      );

      // IMAGEN 5 - Tabla N°9 (Irregularidades en planta)
      marcoTeorico.content.push({
        type: "image",
        src: "/assets/img/memoria_decriptiva/modulos/tabla9.png",
        width: 550,
        height: 400,
        caption: "Tabla N° 9 - IRREGULARIDADES ESTRUCTURALES EN PLANTA",
        alignment: "CENTER"
      });

      marcoTeorico.content.push(
        { type: "heading", level: 3, text: "Coeficiente de reducción de las fuerzas sísmicas (R)" }
      );

      // IMAGEN 6 - Tabla N°7 (Sistemas estructurales)
      marcoTeorico.content.push({
        type: "image",
        src: "/assets/img/memoria_decriptiva/modulos/tabla7.png",
        width: 550,
        height: 400,
        caption: "Tabla N° 7 - SISTEMAS ESTRUCTURALES",
        alignment: "CENTER"
      });

      marcoTeorico.content.push(
        { type: "paragraph", text: "Se determina mediante la siguiente expresión:", alignment: "JUSTIFIED" },
        { type: "paragraph", text: ps.textoFormulaR, bold: true, alignment: "CENTER" },
        { type: "paragraph", text: ps.textoDonde, alignment: "JUSTIFIED" },
        { type: "list", listType: "bullet", items: ps.listaDonde },
        { type: "paragraph", text: ps.textoFuenteTabla, alignment: "JUSTIFIED" },
        { type: "heading", level: 3, text: ps.textoTanque }
      );

      // IMAGEN 7 - Tabla ACI 350.3-06 (Tanque elevado)
      marcoTeorico.content.push({
        type: "image",
        src: "/assets/img/memoria_decriptiva/modulos/tabla4.png",
        width: 550,
        height: 300,
        caption: "Tabla 4.1.1(b) - Response modification factor R (ACI 350.3-06)",
        alignment: "CENTER"
      });

      marcoTeorico.content.push(
        { type: "paragraph", text: ps.textoFuenteTanque, alignment: "JUSTIFIED" }
      );
    }
    // ========== k) VERIFICAR LA FUERZA CORTANTE MINIMA ==========
    if (mt.verificaciones) {
      const v = mt.verificaciones;
      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "k) VERIFICAR LA FUERZA CORTANTE MINIMA" },
        { type: "paragraph", text: v.textoCortante || "", alignment: "JUSTIFIED" },
        { type: "paragraph", text: v.textoCortanteNorma || "", alignment: "JUSTIFIED" }
      );
    }

    // ========== l) VERIFICACION DE DERIVAS ==========
    if (mt.verificaciones) {
      const v = mt.verificaciones;
      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "l) VERIFICACION DE DERIVAS" },
        { type: "paragraph", text: v.textoDerivas || "", alignment: "JUSTIFIED" },
        { type: "paragraph", text: v.textoDerivasTabla || "", alignment: "JUSTIFIED" }
      );
    }

    // IMAGEN - Tabla N°11 (Límites para la distorsión del entrepiso)
    marcoTeorico.content.push({
      type: "image",
      src: "/assets/img/memoria_decriptiva/modulos/tabla11.png",
      width: 500,
      height: 250,
      caption: "Tabla N° 11 - LÍMITES PARA LA DISTORSIÓN DEL ENTREPISO",
      alignment: "CENTER"
    });

    // ========== m) JUNTA SISMICA ENTRE LOS MODULOS ==========
    if (mt.verificaciones) {
      const v = mt.verificaciones;
      marcoTeorico.content.push(
        { type: "heading", level: 2, text: "m) JUNTA SISMICA ENTRE LOS MODULOS" },
        { type: "paragraph", text: v.textoJunta || "", alignment: "JUSTIFIED" },
        { type: "paragraph", text: v.textoJuntaFormula || "", alignment: "JUSTIFIED" },
        { type: "paragraph", text: v.formulaJunta || "S = 0.006 h ≥ 0.03 m", bold: true, alignment: "CENTER" }
      );
    }
    console.log("✅ transformMarcoTeorico ejecutado");
  }

  transformConsideracionesGenerales(structure) {
    let consideraciones = structure.document.sections.find((s) => s.id === "consideraciones");

    if (!consideraciones) {
      consideraciones = {
        id: "consideraciones",
        title: "2. CONSIDERACIONES GENERALES DE DISEÑO",
        level: 1,
        content: []
      };
      const descIdx = structure.document.sections.findIndex((s) => s.id === "descripcion_bloques");
      if (descIdx !== -1) {
        structure.document.sections.splice(descIdx + 1, 0, consideraciones);
      } else {
        structure.document.sections.push(consideraciones);
      }
    }

    const consideracionesData = this.sections.consideraciones || {};
    const content = [];

    // Datos comunes (nivel raíz del store — no se repiten)
    const recubrimientos = consideracionesData.recubrimientos || [];
    const materiales = consideracionesData.materiales || [];
    const sobrecargasMuertas = consideracionesData.sobrecargasMuertas || [];
    const sobrecargasVivas = consideracionesData.sobrecargasVivas || [];

    // Nombres de los módulos (igual al store de descripcionModulos)
    const nombreModulos = [
      "MÓDULO I", "MÓDULO II", "MÓDULO III", "MÓDULO IV",
      "MÓDULO V", "MÓDULO VI", "MÓDULO VII", "MÓDULO VIII",
      "MÓDULO IX", "MÓDULO X", "MÓDULO XI", "MÓDULO XII",
      "MÓDULO XIII", "MÓDULO XIV", "MÓDULO XV", "MÓDULO XVI"
    ];

    // Numeración romana para subtítulos (2.1, 2.2 … 2.16)
    const romanos = [
      "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
      "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"
    ];

    // ========== 3 IMÁGENES INICIALES ==========
    content.push({
      type: "image",
      src: "/assets/img/memoria_decriptiva/consideraciones/imagen1.png",
      width: 550, height: 400, caption: "", alignment: "CENTER"
    });
    content.push({
      type: "image",
      src: "/assets/img/memoria_decriptiva/consideraciones/imagen2.png",
      width: 550, height: 400, caption: "", alignment: "CENTER"
    });
    content.push({
      type: "image",
      src: "/assets/img/memoria_decriptiva/consideraciones/imagen3.png",
      width: 550, height: 400, caption: "", alignment: "CENTER"
    });

    // ========== GENERAR LOS 16 MÓDULOS ==========
    for (let i = 1; i <= 16; i++) {
      const geotecnia = consideracionesData[i]?.geotecnia || null;
      const num = `2.${i}`;
      const romano = romanos[i - 1];

      // ── Título del módulo ──────────────────────────────────────────
      content.push({
        type: "heading", level: 2,
        text: `${num}. ${nombreModulos[i - 1]}`
      });

      // ── 2.X.1. CONDICIONES GEOTÉCNICAS ────────────────────────────
      content.push({
        type: "heading", level: 3,
        text: `${num}.1. CONDICIONES GEOTÉCNICAS`
      });

      if (geotecnia) {
        content.push({
          type: "table",
          widthPercent: 80,
          columns: [
            { header: "Parámetro", width: 45 },
            { header: "", width: 5 },
            { header: "Valor", width: 50 }
          ],
          rows: [
            ["Perfil del suelo", ":", geotecnia.perfilSuelo || ""],
            ["Capacidad Portante", ":", `${geotecnia.capacidadPortante || ""} kg/cm²`],
            ["Profundidad de cimentación", ":", `${geotecnia.profundidad || ""} m`],
            ["Agresividad de sulfatos", ":", geotecnia.agresividadSulfatos || ""],
            ["Prof. N.F.", ":", geotecnia.profNF || ""]
          ]
        });
      }

      // ── 2.X.2. CONDICIONES SÍSMICAS ───────────────────────────────
      content.push({
        type: "heading", level: 3,
        text: `${num}.2. CONDICIONES SÍSMICAS - PARÁMETROS SISMORESISTENTES`
      });
      content.push({
        type: "paragraph",
        text: "Los parámetros sísmicos considerados para el análisis de la estructura en estudio fueron los siguientes:",
        alignment: "JUSTIFIED"
      });

      const imagenesSismicas = ["imagen4.png", "imagen5.png", "imagen6.png", "imagen7.png"];
      for (const img of imagenesSismicas) {
        content.push({
          type: "image",
          src: `/assets/img/memoria_decriptiva/consideraciones/${img}`,
          width: 500, height: 400, caption: "", alignment: "CENTER"
        });
      }

      // ── 2.X.3. MÉTODO DE DISEÑO ───────────────────────────────────
      content.push({
        type: "heading", level: 3,
        text: `${num}.3. MÉTODO DE DISEÑO`
      });

      // 2.X.3.1. RECUBRIMIENTOS
      content.push({
        type: "heading", level: 4,
        text: `${num}.3.1. RECUBRIMIENTOS DE ELEMENTOS`
      });
      content.push({
        type: "paragraph",
        text: "Según el RNE 0.60 Concreto Armado, indica los recubrimientos mínimos en el Inciso 7.7:",
        alignment: "JUSTIFIED"
      });
      content.push({
        type: "paragraph",
        text: "Debe proporcionarse el siguiente recubrimiento mínimo de concreto al refuerzo, excepto cuando se requieran recubrimientos mayores según 7.7.5.1 ó se requiera protección especial contra el fuego:",
        alignment: "JUSTIFIED"
      });
      if (recubrimientos.length > 0) {
        content.push({ type: "list", listType: "bullet", items: recubrimientos });
      }

      // 2.X.3.2. MATERIALES
      content.push({
        type: "heading", level: 4,
        text: `${num}.3.2. MATERIALES DE DISEÑO`
      });
      content.push({
        type: "paragraph",
        text: "Se consideró las siguientes características de los materiales que conforman esta estructura.",
        alignment: "JUSTIFIED"
      });
      if (materiales.length > 0) {
        content.push({ type: "list", listType: "bullet", items: materiales });
      }

      // 2.X.3.3. SOBRECARGAS
      content.push({
        type: "heading", level: 4,
        text: `${num}.3.3. SOBRECARGAS EMPLEADAS`
      });
      content.push({
        type: "paragraph",
        text: "La estimación de cargas verticales se evaluará conforme a la norma de Cargas, E-020 que forma parte del Reglamento Nacional de Edificaciones.",
        alignment: "JUSTIFIED"
      });
      content.push({
        type: "paragraph",
        text: "Para el metrado de cargas en el diseño se utilizará las siguientes cargas:",
        alignment: "JUSTIFIED"
      });

      if (sobrecargasMuertas.length > 0) {
        content.push({ type: "paragraph", text: "Cargas muertas", bold: true, alignment: "JUSTIFIED" });
        content.push({ type: "list", listType: "bullet", items: sobrecargasMuertas });
      }

      if (sobrecargasVivas.length > 0) {
        content.push({ type: "paragraph", text: "Cargas vivas", bold: true, alignment: "JUSTIFIED" });
        content.push({ type: "list", listType: "bullet", items: sobrecargasVivas });
      }

      // Carga Sísmica — texto fijo igual en todos los módulos
      content.push({ type: "paragraph", text: "Carga Sísmica", bold: true, alignment: "JUSTIFIED" });
      content.push({
        type: "paragraph",
        text: "El análisis sísmico contempla un análisis estático y un análisis dinámico empleando un modelo pseudotridimensional, formado por pórticos planos más placas de concreto o muros de albañilería confinada, en ambas direcciones los cuales están unidos entre sí por medio de un diafragma plano en cada entrepiso para compatibilizar desplazamientos. Además, unido a estos diagramas de entrepiso se colocó la masa de cada nivel con tres coordenadas dinámicas por nivel. Para el modelo de los pórticos planos se tomó en cuenta las deformaciones por flexión, fuerza cortante y carga axial.",
        alignment: "JUSTIFIED"
      });
      content.push({
        type: "paragraph",
        text: "Para el análisis dinámico se realizó el método de superposición espectral, considerando como criterio de superposición la combinación cuadrática completa (C.Q.C.) de los modos necesarios.",
        alignment: "JUSTIFIED"
      });
      content.push({
        type: "paragraph",
        text: "El valor de las fuerzas sísmicas que actúan sobre las estructuras se calculó considerando los siguientes parámetros:",
        alignment: "JUSTIFIED"
      });
      content.push({
        type: "paragraph",
        text: "Factor de uso, U: La norma E-030 considera a este tipo de edificación como \"Edificaciones esencial\", correspondiéndole un factor de uso U = 1.5.",
        alignment: "JUSTIFIED"
      });
      content.push({
        type: "paragraph",
        text: "Coeficiente de reducción sísmica, R: En la dirección XX las estructuras estarán configuradas en base a columnas y muros estructurales, entonces le corresponde un factor de reducción de R = 6; y en la dirección YY las estructuras estarán configuradas en base a albañilería confinada, entonces le corresponde un factor de reducción de R = 3.",
        alignment: "JUSTIFIED"
      });

      // 2.X.3.4. MÉTODO DE DISEÑO — concreto armado
      content.push({
        type: "heading", level: 4,
        text: `${num}.3.4. MÉTODO DE DISEÑO`
      });
      content.push({
        type: "paragraph",
        text: "En el análisis por cargas verticales todos los elementos son capaces de resistir las cargas que se generan como consecuencia del uso requerido. Las cargas no exceden los esfuerzos según la norma de diseño correspondiente.",
        alignment: "JUSTIFIED"
      });
      content.push({
        type: "paragraph",
        text: "Las vigas, así como las columnas y placas, han sido diseñadas para soportar las cargas de gravedad transmitidas por las losas de techo, así como las cargas sísmicas que eventualmente se les impongan.",
        alignment: "JUSTIFIED"
      });
      content.push({ type: "paragraph", text: "CONCRETO ARMADO", bold: true, alignment: "JUSTIFIED" });
      content.push({
        type: "paragraph",
        text: "Para el diseño de estructuras de concreto armado (COLUMNAS, VIGAS, ZAPATAS, VIGAS DE CIMENTACION, PLACAS, ETC.) se utilizará el Diseño por Resistencia.",
        alignment: "JUSTIFIED"
      });
      content.push({
        type: "paragraph",
        text: "Deberá proporcionarse a todas las secciones de los elementos estructurales Resistencias de diseño (ΦRn) adecuadas, de acuerdo con las disposiciones de la Norma E.060, utilizando los factores de carga (amplificación) y los factores de reducción de resistencia, Φ, especificados en el Capítulo 9 de la RNE E.060.",
        alignment: "JUSTIFIED"
      });
      content.push({ type: "paragraph", text: "Combinaciones de carga:", alignment: "JUSTIFIED" });
      content.push({
        type: "list", listType: "bullet",
        items: [
          "C1: 1.4D + 1.7L",
          "C2: 1.25(D + L) + SX",
          "C3: 1.25(D + L) – SX",
          "C4: 1.25(D + L) + SY",
          "C5: 1.25(D + L) – SY",
          "C6: 0.9D + SX",
          "C7: 0.9D – SX",
          "C8: 0.9D + SY",
          "C9: 0.9D – SY"
        ]
      });
      content.push({ type: "paragraph", text: "Desplazamientos máximos permitidos:", bold: true, alignment: "JUSTIFIED" });
      content.push({
        type: "image",
        src: "/assets/img/memoria_decriptiva/consideraciones/UltimaTabla.png",
        width: 500,
        height: 300,
        caption: "",
        alignment: "CENTER"
      });

      // Salto de página entre módulos (excepto el último)
      if (i < 16) {
        content.push({ type: "pageBreak" });
      }
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