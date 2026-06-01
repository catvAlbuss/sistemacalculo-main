// content-structure-md.js - Estructura base para Memoria Descriptiva (VERSIÓN COMPLETA)

export const DEFAULT_MD_STRUCTURE = {
  document: {
    title: "MEMORIA DESCRIPTIVA",
    sections: [
      {
        id: "generalidades",
        title: "1. GENERALIDADES",
        level: 1,
        content: [
          // ========== 1.1 ANTECEDENTES ==========
          {
            type: "heading",
            level: 2,
            text: "1.1. ANTECEDENTES",
          },
          {
            type: "paragraph",
            text: "{{sections.generalidades.antecedentes.textoCompleto}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "VÍAS DE ACCESO",
            alignment: "JUSTIFIED",
            bold: true,
          },
          {
            type: "paragraph",
            text: "{{TABLA_VIAS_ACCESO}}",
            alignment: "CENTER",
          },
          {
            type: "paragraph",
            text: "{{IMAGENES_DEMANDA}}",
            alignment: "CENTER",
          },

          // ========== 1.2 DATOS DEL PROYECTO ==========
          {
            type: "heading",
            level: 2,
            text: "1.2. DATOS DEL PROYECTO",
          },
          {
            type: "paragraph",
            text: "",
          },
          {
            type: "paragraph",
            text: "Nombre del proyecto",
            bold: true
          },
          {
            type: "paragraph",
            text: "{{sections.generalidades.datosProyecto.nombre}}",
          },
          {
            type: "paragraph",
            text: "",
          },
          {
            type: "paragraph",
            text: "Nombre de la UEI",
            bold: true
          },
          {
            type: "paragraph",
            text: "{{sections.generalidades.datosProyecto.uei}}",
          },
          {
            type: "paragraph",
            text: "",
          },
          {
            type: "paragraph",
            text: "UBICACIÓN",
            bold: true
          },
          {
            type: "paragraph",
            text: "",
          },
          {
            type: "paragraph",
            text: "Ubicación Política",
            bold: true
          },
          {
            type: "paragraph",
            text: "• Localidad              : {{sections.generalidades.datosProyecto.localidad}}",
          },
          {
            type: "paragraph",
            text: "• Distrito               : {{sections.generalidades.datosProyecto.distrito}}",
          },
          {
            type: "paragraph",
            text: "• Provincia              : {{sections.generalidades.datosProyecto.provincia}}",
          },
          {
            type: "paragraph",
            text: "• Región                 : {{sections.generalidades.datosProyecto.region}}",
          },
          {
            type: "paragraph",
            text: "",
          },
          {
            type: "paragraph",
            text: "Ubicación Geográfica coordenadas UTM",
            bold: true
          },
          {
            type: "paragraph",
            text: "• Este                   : {{sections.generalidades.datosProyecto.este}}",
          },
          {
            type: "paragraph",
            text: "• Norte                  : {{sections.generalidades.datosProyecto.norte}}",
          },
          {
            type: "paragraph",
            text: "• Altitud                : {{sections.generalidades.datosProyecto.altitud}} msnm",
          },
          {
            type: "paragraph",
            text: "",
          },
          {
            type: "paragraph",
            text: "Ubicación contextual",
            bold: true
          },
          {
            type: "paragraph",
            text: "Actualmente el colegio tiene las siguientes colindantes",
          },
          {
            type: "paragraph",
            text: "• Norte                  : {{sections.generalidades.datosProyecto.colindanciaNorte}}",
          },
          {
            type: "paragraph",
            text: "• Sur                    : {{sections.generalidades.datosProyecto.colindanciaSur}}",
          },
          {
            type: "paragraph",
            text: "• Este                   : {{sections.generalidades.datosProyecto.colindanciaEste}}",
          },
          {
            type: "paragraph",
            text: "• Oeste                  : {{sections.generalidades.datosProyecto.colindanciaOeste}}",
          },
          {
            type: "paragraph",
            text: "",
          },
          {
            type: "paragraph",
            text: "{{IMAGENES_UBICACION}}",
            alignment: "CENTER"
          },

          // ========== 1.3 RELACIÓN DE DOCUMENTOS Y PLANOS ==========
          {
            type: "heading",
            level: 2,
            text: "1.3. RELACIÓN DE DOCUMENTOS Y PLANOS",
          },
          {
            type: "paragraph",
            text: "{{LISTA_DOCUMENTOS}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "{{TABLA_PLANOS}}",
            alignment: "CENTER",
          },
          // ========== 1.3.3 OBJETIVOS ==========
          {
            type: "heading",
            level: 3,
            text: "1.3.3 OBJETIVOS",
          },
          {
            type: "heading",
            level: 4,
            text: "1.3.3.1 Objetivo General",
          },
          {
            type: "paragraph",
            text: "{{sections.generalidades.objetivos.general}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 4,
            text: "1.3.3.2 Objetivos Específicos",
          },
          {
            type: "paragraph",
            text: "{{LISTA_OBJETIVOS_ESPECIFICOS}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 4,
            text: "Tipo de Terreno e Incompatibilidad",
          },
          {
            type: "paragraph",
            text: "{{sections.generalidades.objetivos.tipoTerreno}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: ["{{sections.generalidades.objetivos.proyectoDetalle}}"],
          },
          {
            type: "paragraph",
            text: "{{TABLA_INCOMPATIBILIDADES}}",
            alignment: "CENTER",
          },

          // ========== 1.4 MARCO NORMATIVO ==========
          {
            type: "heading",
            level: 2,
            text: "1.4. MARCO NORMATIVO",
          },
          {
            type: "paragraph",
            text: "Se ha considerado como código básico para el diseño de estas estructuras el \"Reglamento Nacional de Edificaciones\" con las siguientes normas técnicas:",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "{{LISTA_MARCO_NORMATIVO}}",
            alignment: "JUSTIFIED",
          },
        ],
      },
      // ========== 1.5 DESCRIPCIÓN DE BLOQUES O EDIFICACIONES ==========
      {
        id: "descripcion_bloques",
        title: "1.5 DESCRIPCIÓN DE BLOQUES O EDIFICACIONES",
        level: 1,
        content: [
          {
            type: "heading",
            level: 2,
            text: "1.5.1. Plano de planta general de arquitectura",
          },
          {
            type: "paragraph",
            text: "El Proyecto consta de 16 módulos, a continuación, se detallan los módulos.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "1.5.2. Descripción por bloque o edificación",
          },
        ],
      },
      // ========== 1.6 MARCO TEÓRICO (CORREGIDO - AHORA VA AQUÍ) ==========
      {
        id: "marco_teorico",
        title: "1.6. MARCO TEÓRICO",
        level: 1,
        content: [
          {
            type: "heading",
            level: 2,
            text: "a) CONCEPTOS BASICOS",
          },
          {
            type: "paragraph",
            text: "{{sections.marcoTeorico.conceptosBasicos}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "b) CRITERIOS ESTRUCTURALES",
          },
          {
            type: "paragraph",
            text: "{{LISTA_CRITERIOS_ESTRUCTURALES}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "c) ELECCIÓN DEL SISTEMA ESTRUCTURAL",
          },
          {
            type: "paragraph",
            text: "{{sections.marcoTeorico.eleccionSistema}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "d) ELEMENTOS ESTRUCTURALES",
          },
          {
            type: "paragraph",
            text: "{{LISTA_ELEMENTOS_ESTRUCTURALES}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "e) MATERIALES DE LOS ELEMENTOS ESTRUCTURALES",
          },
          {
            type: "paragraph",
            text: "{{TABLA_MATERIALES}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "f) ACERO DE REFUERZO",
          },
          {
            type: "heading",
            level: 2,
            text: "g) CARGA MUERTA",
          },
          {
            type: "heading",
            level: 2,
            text: "h) CARGA VIVA",
          },
          {
            type: "heading",
            level: 2,
            text: "i) ELECCIÓN DEL SOFTWARE ESTRUCTURAL",
          },
          {
            type: "paragraph",
            text: "{{sections.marcoTeorico.software}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "j) PARÁMETROS SÍSMICOS",
          },
          {
            type: "paragraph",
            text: "{{TABLA_PARAMETROS_SISMICOS}}",
            alignment: "JUSTIFIED",
          },
        ],
      },
      // ========== 2. CONSIDERACIONES GENERALES DE DISEÑO ==========
      {
        id: "consideraciones",
        title: "2. CONSIDERACIONES GENERALES DE DISEÑO",
        level: 1,
        content: [],
      },
      // ========== 3. PREDIMENSIONAMIENTO ==========
      {
        id: "predimensionamiento",
        title: "3. PREDIMENSIONAMIENTO DE ELEMENTOS ESTRUCTURALES",
        level: 1,
        content: [],
      },
      // ========== 4. DEMOLICIÓN ==========
      {
        id: "demolicion",
        title: "4. ALCANCE DEL ESTUDIO DE DEMOLICIÓN",
        level: 1,
        content: [],
      },
    ],
  },
};

export function buildContentStructure(data) {
  return {
    cover: data?.cover || {},
    document: data?.document || DEFAULT_MD_STRUCTURE.document,
  };
}