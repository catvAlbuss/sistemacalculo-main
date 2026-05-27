// content-structure-md.js - Estructura base para Memoria Descriptiva

export const DEFAULT_MD_STRUCTURE = {
  document: {
    title: "MEMORIA DESCRIPTIVA",
    sections: [
      {
        id: "generalidades",
        title: "1. GENERALIDADES",
        level: 1,
        content: [
          {
            type: "heading",
            level: 2,
            text: "1.1. ANTECEDENTES",
          },
          {
            type: "paragraph",
            text: "{{sections.generalidades.antecedentes.history}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "1.2. DATOS DEL PROYECTO",
          },
          {
            type: "paragraph",
            text: "{{cover.project}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "1.3. RELACIÓN DE DOCUMENTOS Y PLANOS",
          },
          {
            type: "heading",
            level: 2,
            text: "1.4. OBJETIVOS",
          },
          {
            type: "paragraph",
            text: "{{sections.generalidades.objetivos.general}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "1.5. MARCO NORMATIVO",
          },
        ],
      },
      {
        id: "descripcion_bloques",
        title: "2. DESCRIPCIÓN DE BLOQUES O EDIFICACIONES",
        level: 1,
        content: [],
      },
      {
        id: "marco_teorico",
        title: "3. MARCO TEÓRICO",
        level: 1,
        content: [
          {
            type: "heading",
            level: 2,
            text: "3.1. CONCEPTOS BÁSICOS",
          },
          {
            type: "paragraph",
            text: "{{sections.marcoTeorico.conceptosBasicos}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "3.2. CRITERIOS ESTRUCTURALES",
          },
          {
            type: "heading",
            level: 2,
            text: "3.3. ELECCIÓN DEL SISTEMA ESTRUCTURAL",
          },
          {
            type: "paragraph",
            text: "{{sections.marcoTeorico.eleccionSistema}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "3.4. ELEMENTOS ESTRUCTURALES",
          },
          {
            type: "heading",
            level: 2,
            text: "3.5. MATERIALES DE LOS ELEMENTOS ESTRUCTURALES",
          },
          {
            type: "heading",
            level: 2,
            text: "3.6. ACERO DE REFUERZO",
          },
          {
            type: "heading",
            level: 2,
            text: "3.7. CARGA MUERTA",
          },
          {
            type: "heading",
            level: 2,
            text: "3.8. CARGA VIVA",
          },
          {
            type: "heading",
            level: 2,
            text: "3.9. ELECCIÓN DEL SOFTWARE ESTRUCTURAL",
          },
          {
            type: "paragraph",
            text: "{{sections.marcoTeorico.software}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "3.10. PARÁMETROS SÍSMICOS",
          },
        ],
      },
      {
        id: "predimensionamiento",
        title: "4. PREDIMENSIONAMIENTO DE ELEMENTOS ESTRUCTURALES",
        level: 1,
        content: [],
      },
      {
        id: "demolicion",
        title: "5. ALCANCE DEL ESTUDIO DE DEMOLICIÓN",
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