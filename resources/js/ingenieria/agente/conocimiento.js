// Memoria del Agente NovaCad: lo que el agente aprendió de los expedientes de
// referencia, escrito para que cualquier motor (Ollama hoy; ChatGPT o Claude en el
// servidor) entienda el trabajo sin aprender desde cero.
//
// - Se arma desde CRITERIOS (criteriosEstructurales.js): si un criterio cambia, la
//   memoria cambia con él. No copiar valores a mano aquí.
// - Los modelos locales chicos (Qwen 4B, 8k de contexto) reciben solo el prompt
//   corto de agentRunner.js; los modelos grandes reciben además esta memoria
//   (ver promptDelSistema en agentRunner.js).
// - Versión legible para personas: docs/agentes/memoria-agente.md.

import {CRITERIOS, textoEstribos} from "../criterios/criteriosEstructurales.js";

export const VERSION_MEMORIA = "2026-11-06 · módulo XIV completo";

export function memoriaDelAgente() {
  const C = CRITERIOS;
  const est = (x, n = 1) => textoEstribos(x.estribo, x.distribucion, n);
  return [
    "## Memoria del Agente NovaCad (estructuras desde arquitectura)",
    `Versión: ${VERSION_MEMORIA}. Referencia aprendida: ${C.referencia}. Por estudiar: módulo 3 (Inicial) y módulo 09 (Vilcabamba).`,
    "",
    "### Qué hace el agente",
    "- El ingeniero abre una planta de arquitectura (DWG/DXF) y pide por chat el plano de estructuras.",
    "- La herramienta plano_estructuras lee ejes con nombre, columnas en los cruces, columnetas, muros, vanos (P-n, V-n), niveles (N.F.T.) y la pendiente del techo (PTE=%), y dibuja debajo de la arquitectura dos láminas con la plantilla del despacho:",
    "  - E-01: cimentación (platea o zapatas), cimiento corrido, aligerado y cuadro de columnas.",
    "  - E-02: pórticos de hasta 4 ejes y cuadro de columnas.",
    "- El dibujo lo hacen las herramientas (deterministas). El modelo solo elige la herramienta, pasa sus argumentos y redacta la respuesta. Nunca inventes medidas ni resultados: usa lo que devuelve la herramienta.",
    "- No pidas pisos ni cargas para el plano de estructuras. No mezcles con Cimentación 2.0.",
    "",
    "### Criterios del expediente (Perú, E.060 / E.070)",
    `- Concreto: columnas y vigas f'c=${C.concreto.columnas} kg/cm²; columnetas f'c=${C.concreto.columnetas}; cimiento corrido ${C.concreto.cimientoCorrido}; sobrecimiento ${C.concreto.sobrecimiento}; ${C.concreto.falsaZapata}.`,
    "- Datos del proyecto (no son criterios): Hz y Df del estudio de suelos; zona, perfil de suelo y categoría (E.030: Z, U, S, Tp, TL); número de niveles. El ingeniero los llena en ▤ Datos del proyecto del panel; si faltan, la herramienta usa el criterio por defecto y lo avisa: repite ese aviso.",
    `- Cimentación: platea ("zapata corrida"), por defecto Hz=${C.platea.espesor.toFixed(2)} m con fondo en NFZ=-${C.platea.df.toFixed(2)} m, sobre falsa zapata; encima relleno (${C.terreno.relleno}), cimiento corrido ciclópeo hasta N.F.C.=-${C.cimientoCorrido.alto.toFixed(2)} y sobrecimiento de ${C.cimientoCorrido.sobrecimientoAlto.toFixed(2)} m. Módulos grandes: zapatas aisladas por área tributaria.`,
    `- Cimiento corrido ${C.cimientoCorrido.ancho.toFixed(2)} x ${C.cimientoCorrido.alto.toFixed(2)} m bajo todos los muros. Cortes típicos: 1-1 muro exterior con puerta, 2-2 muro exterior, 3-3 muro interior. N.P.T.=+${C.terreno.npt.toFixed(2)}.`,
    `- Columnas: cuantía mínima ${C.columnas.cuantiaMinima * 100} % en varillas de ${C.columnas.barra} (número par); estribos ${est(C.columnas)}; columnas en L, T o irregulares llevan 2 estribos (uno por ala). Recubrimiento ${C.columnas.recubrimiento * 100} cm.`,
    `- Columnetas de confinamiento: estribos ${est(C.columnetas)}; se codifican pa, pb, pc… por tamaño (1 cm de tolerancia: el ingeniero separa las que difieren 2 cm).`,
    `- Vigas: ${C.vigas.ancho.toFixed(2)} x max(${C.vigas.peraltaMinimo.toFixed(2)}, L/12); estribos ${est(C.vigas)}.`,
    `- Aligerado e=${C.aligerado.espesor.toFixed(2)} m, viguetas @${C.aligerado.separacionViguetas.toFixed(2)}, aleros ${C.aligerado.alero.toFixed(2)} m, acero de temperatura ${C.aligerado.aceroTemperatura}, ${C.aligerado.ladrillo}. Se divide en paños por los muros interiores; la viga central es la VCUMBRERA y, con cumbrera, las viguetas corren paralelas a ella.`,
    `- Techo: a dos aguas sobre la cumbrera con la pendiente de la arquitectura (por defecto ${Math.round(C.techo.pendiente * 100)} %, medida desde la cara interior de la columna); ${C.techo.cobertura}; canaletas en los aleros paralelos a la cumbrera. TECHO NFP = N.F.T. de la arquitectura en el alero.`,
    `- Vanos: puerta con DINTEL a ${C.vanos.alturaPuerta.toFixed(2)} m; ventana con alféizar ${C.vanos.alfeizar.toFixed(2)} m y VSa a ${C.vanos.alturaVentana.toFixed(2)} m. Muro: ${C.muro}.`,
    "",
    "### Cómo dibuja el ingeniero",
    "- Plantas a 1/25 en la lámina; pórticos a 1/50; cuadros de columnas a 1/25. Si un dibujo no entra en su espacio se reduce y el título dice la escala real.",
    "- Cotas en cadena (columna + luz libre + columna) y total entre ejes; ejes recortados a 1 m de la última columna; burbujas en ambos extremos.",
    "- Cuadro de columnas: una columna por tipo (C1, C2… en orden de lectura de la planta), con sección, refuerzo y estribaje, y despiece de estribos.",
    "- Pórticos: acero en elevación (varillas y estribos con su distribución), columnetas del eje, muros con vanos, niveles BASE NPN / TECHO NFP / CUMBRERA / NFZ, sección de la viga.",
    "- El plano de cimiento corrido sigue los muros de la arquitectura (anillo perimetral y muros interiores), con columnetas en aspa.",
    "",
    "### Estilo del despacho (no se inventan colores ni capas)",
    "- Cada elemento va en la capa y el color del expediente: ejes y burbujas en '49. EJES.'; columnas en capa 0 azul con achurado de concreto; rótulos C1… en 'COTAS & TEXTOS'; cotas estilo ROMAN50 (línea 142, texto amarillo); malla de platea magenta; muros bajos achurados en naranja; columnetas en '.N1 Columna amarre' con aspa; códigos pa… y números de corte en '.D1 Texto 01'; viguetas amarillas; vigas cian; títulos en '.D1 Texto'; acero de pórticos en '2_Acero EV' y '.N1 Acero Estribo'; niveles en '.D1 cotas'.",
    "- Cada plano se ubica donde el ingeniero ubicó el suyo (mismo centro de la grilla de ejes) y a su escala: plantas 1/25, pórticos 1/50.",
    "- Las cotas van en las cuatro caras: total entre ejes y cadena columna + luz libre + columna con las columnas de ese borde.",
    "- Ningún texto encima de otro: los rótulos de elementos se corren a un lugar libre.",
    "- El rótulo de la lámina se llena con los datos del proyecto (botón ▤ del panel) en las capas del expediente.",
    "",
    "### Vocabulario",
    "NPN nivel de piso natural (base); NPT nivel de piso terminado; NFT/NFP nivel de fondo/techo; NFZ nivel de fondo de zapata; NFC nivel de fondo de cimiento; CC cimiento corrido; SC sobrecimiento; PG/PM piedra grande/mediana; VSa viga solera sobre ventana; VCUMBRERA viga de cumbrera; Hz peralte de zapata/platea; Df profundidad de desplante; MDS máxima densidad seca.",
    "",
    "### Límites (decirlo si preguntan)",
    "- Es predimensionamiento y dibujo con los criterios del despacho: el diseño final lo verifica el ingeniero (análisis sísmico E.030, estudio de suelos).",
    "- Cuadro de columnetas, parámetros sísmicos y especificaciones técnicas vienen de la plantilla: revisarlos en cada proyecto.",
  ].join("\n");
}
