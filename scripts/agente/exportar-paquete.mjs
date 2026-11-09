// Paquete portable del Agente Predim: todo lo que otra IA (Ollama, ChatGPT, Claude,
// Grok…) necesita para entender y replicar el agente, generado desde el código:
//
//   node scripts/agente/exportar-paquete.mjs
//
// docs/agentes/agente-predim/
//   README.md                    qué es, cómo se usa con cada proveedor, cómo se entrena
//   AGENTE.md                    instrucciones del sistema completas (prompt + memoria)
//   skills/<skill>/SKILL.md      una ficha por herramienta: cuándo usarla, parámetros, qué devuelve
//   herramientas/openai.json     esquema de funciones (OpenAI, Ollama, Grok, compatibles)
//   herramientas/anthropic.json  esquema de herramientas (Claude)
//   conocimiento/criterios.json  criterios de diseño del despacho (criteriosEstructurales.js)
//   conocimiento/estilo-despacho.json  capas y colores por tipo de plano (estiloLaminas.js)
//   conocimiento/expedientes/*.json    lo aprendido de cada expediente (aprender-expediente.mjs)
//   evaluacion/casos.json        pedidos de prueba con la herramienta y argumentos esperados
//
// Los archivos se regeneran siempre desde el código: no se editan a mano.

import {writeFileSync, mkdirSync, readdirSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SKILLS, toolDefinitions} from '../../resources/js/ingenieria/agente/skills/index.js';
import {SYSTEM_PROMPT} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {memoriaDelAgente, VERSION_MEMORIA} from '../../resources/js/ingenieria/agente/conocimiento.js';
import {CRITERIOS} from '../../resources/js/ingenieria/criterios/criteriosEstructurales.js';
import {ESTILOS, CAPAS_DESPACHO} from '../../resources/js/ingenieria/criterios/estiloLaminas.js';
import {EVALUACION_MODELOS} from '../../resources/js/ingenieria/agente/modelosAgente.js';
import {CASOS_EVALUACION} from './casos-evaluacion.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const base = resolve(raiz, 'docs/agentes/agente-predim');
const escribir = (ruta, contenido) => { mkdirSync(dirname(resolve(base, ruta)), {recursive: true}); writeFileSync(resolve(base, ruta), typeof contenido === 'string' ? contenido : JSON.stringify(contenido, null, 2)); };

// Notas de uso por skill (lo que el esquema no dice): cuándo usarla y qué devuelve.
const NOTAS = {
  plano_estructuras: {
    cuando: 'El usuario abrió una planta de arquitectura y pide el plano de estructuras ("estructura este plano", "genera las láminas de estructuras", "con platea", "con zapatas"). No pedir pisos ni cargas.',
    devuelve: '{ok, mensaje, laminas: ["E-01","E-02"], avisos[]}. Responder el mensaje tal cual y agregar los avisos.',
    codigo: 'resources/js/ingenieria/agente/skills/estructuraPlano.js → laminasPlantilla.js (cimentacionPlano, aligeradoPlano, porticoPlano, cuadroColumnas, rotulo, estiloLaminas, separarTextos)',
  },
  vistas_plano: {cuando: 'El archivo tiene varias plantas o láminas y hay que elegir una (primer nivel, techo…).', devuelve: 'Lista de vistas con su título, ejes y columnas. Pasar luego "vista" a las otras herramientas.', codigo: 'resources/js/ingenieria/agente/skills/estructuraPlano.js'},
  leer_estructura: {cuando: 'El usuario quiere ver o verificar ejes y columnas detectados, sin generar láminas.', devuelve: 'Ejes con nombre, columnas por tipo (C1, C2…) y columnetas.', codigo: 'resources/js/ingenieria/lectura/lectorPlano.js'},
};

// ---------- README ----------
const herramientas = SKILLS.filter((s) => s.name !== 'zapatas_desde_plano');
escribir('README.md', `# Agente Predim (paquete portable)

Agente de estructuras para planos de arquitectura peruanos (E.020, E.030, E.050, E.060, E.070). Recibe una planta de arquitectura (DWG/DXF) y devuelve las láminas de estructuras (cimentación, cimiento corrido, aligerado, pórticos y cuadros) con el criterio y el estilo de dibujo del despacho.

Versión de la memoria: **${VERSION_MEMORIA}**. Este paquete se genera desde el código con \`node scripts/agente/exportar-paquete.mjs\`; no se edita a mano.

## Cómo está hecho

El agente tiene dos partes, y conviene no confundirlas:

1. **El modelo de lenguaje** (Ollama hoy; ChatGPT, Claude o Grok mañana) entiende el pedido, elige una herramienta y sus argumentos, y explica el resultado. Gasta tokens.
2. **Las herramientas (skills)** leen el plano y dibujan. Son código determinista, el mismo para cualquier modelo, y no gastan tokens.

Por eso, cambiar de modelo no cambia el dibujo. Para que el agente dibuje mejor y con más tipos de proyectos se mejora su **conocimiento** y sus **herramientas**: eso es el entrenamiento, ver abajo.

## Archivos

| Archivo | Para qué |
|---|---|
| \`AGENTE.md\` | Instrucciones del sistema completas: rol, reglas, memoria (criterios, estilo, vocabulario, límites) |
| \`skills/<skill>/SKILL.md\` | Ficha de cada herramienta: cuándo usarla, parámetros, qué devuelve, dónde está el código |
| \`herramientas/openai.json\` | Esquema de funciones para OpenAI, Ollama, Grok (xAI) y APIs compatibles |
| \`herramientas/anthropic.json\` | Esquema de herramientas para Claude (\`tools\` con \`input_schema\`) |
| \`conocimiento/criterios.json\` | Criterios de diseño del despacho (f'c, estribos, cimentación, losas, techos, vanos) |
| \`conocimiento/estilo-despacho.json\` | Capa y color de cada elemento por tipo de plano |
| \`conocimiento/expedientes/*.json\` | Lo aprendido de cada expediente de referencia |
| \`conocimiento/resumen-expedientes.md\` | Qué criterios se repiten y cuáles cambian entre expedientes |
| \`evaluacion/casos.json\` | Pedidos de prueba con la herramienta y los argumentos esperados |

## Uso con cada proveedor

Las herramientas corren en el visor (navegador), donde está el plano. El modelo solo recibe el pedido, elige la herramienta y lee su resumen.

- **Ollama (local):** \`http://127.0.0.1:11434/v1/chat/completions\` con \`tools = herramientas/openai.json\`. Recomendado: \`qwen3-cad\` o \`qwen3.5:4b\`, con el prompt corto, porque 8k de contexto no alcanzan para \`AGENTE.md\` completo.
- **ChatGPT (OpenAI) y Grok (xAI):** el mismo esquema \`openai.json\` y \`AGENTE.md\` como mensaje \`system\`.
- **Claude (Anthropic):** \`herramientas/anthropic.json\` en \`tools\` y \`AGENTE.md\` en \`system\`.
- **En el servidor:** la clave va en una ruta de Laravel (proxy), nunca en el navegador. Ver \`docs/agentes/memoria-agente.md\`.

Evaluar un modelo antes de usarlo: \`AGENTE_URL=… AGENTE_MODEL=… node scripts/agente/evaluar-modelo.mjs\`. Corre los casos de \`evaluacion/casos.json\` y dice cuántos acierta y en cuánto tiempo.

## Entrenamiento: cómo aprende el agente

1. **Aprender un expediente:** \`node scripts/agente/aprender-expediente.mjs <estructuras.dwg> <nombre>\`. Extrae el estilo (capas, colores, alturas), los criterios (f'c, estribos, varillas, Hz, Df, losa, vigas, recubrimientos, cobertura, sismo) y qué planos, cortes, detalles y cuadros incluye el ingeniero. Guarda \`conocimiento/expedientes/<nombre>.json\` y actualiza \`resumen-expedientes.md\`.
2. **Generalizar:**
   - lo que se repite en todos los expedientes pasa a ser criterio (\`criteriosEstructurales.js\`);
   - lo que cambia se vuelve regla (por ejemplo, espesor de losa según la luz) o dato del proyecto (por ejemplo, Hz y Df del estudio de suelos).
3. **Plantilla de láminas:** \`node scripts/agente/generar-plantilla-estructuras.mjs <estructuras.dwg>\` genera la plantilla del despacho a partir del expediente.
4. **Probar con un plano nuevo (generalización):**
   - \`node scripts/agente/leer-arquitectura.mjs <arquitectura.dwg>\` muestra qué entiende el agente: vistas, ejes, columnas y placas, columnetas;
   - \`node scripts/agente/probar-laminas.mjs <arquitectura.dwg> "<vista>" salida.svg\` genera las láminas completas y una vista previa;
   - se compara con el expediente del ingeniero, y cada diferencia se vuelve una regla general (\`docs/agentes/criterios-estructuras.md\`) con su prueba.
5. **Comprobar:** las pruebas (\`node --test tests/frontend/etabs-*.test.mjs\`) y la comparación en el visor contra el PDF del expediente.

Modelos evaluados: ${Object.entries(EVALUACION_MODELOS).map(([m, n]) => `${m} (${n.nota})`).join('; ')}.
`);

// ---------- AGENTE.md ----------
escribir('AGENTE.md', `# Instrucciones del sistema del Agente Predim

Usar como mensaje \`system\`. Los modelos chicos (4B) usan solo la primera sección.

## Instrucciones

${SYSTEM_PROMPT.replace('\n/no_think', '')}

${memoriaDelAgente()}
`);

// ---------- Skills ----------
for (const s of herramientas) {
  const props = Object.entries(s.parameters?.properties ?? {});
  const nota = NOTAS[s.name] ?? {};
  escribir(`skills/${s.name}/SKILL.md`, `---
name: ${s.name}
description: ${s.description.replace(/\n/g, ' ')}
---

# ${s.name}

${s.description}

${nota.cuando ? `## Cuándo usarla\n\n${nota.cuando}\n` : ''}
## Parámetros

${props.length ? `| Parámetro | Tipo | Descripción |\n|---|---|---|\n${props.map(([k, v]) => `| \`${k}\` | ${v.type}${v.enum ? ` (${v.enum.join(', ')})` : ''} | ${v.description ?? ''} |`).join('\n')}` : 'Sin parámetros.'}

${nota.devuelve ? `## Qué devuelve\n\n${nota.devuelve}\n` : ''}
${nota.codigo ? `## Implementación\n\n${nota.codigo}\n` : ''}`);
}
escribir('herramientas/openai.json', toolDefinitions(herramientas));
escribir('herramientas/anthropic.json', herramientas.map(({name, description, parameters}) => ({name, description, input_schema: parameters ?? {type: 'object', properties: {}}})));

// ---------- Conocimiento ----------
const sinFunciones = (o) => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === 'function' ? `(regla) ${v.toString().slice(0, 160)}` : v)));
escribir('conocimiento/criterios.json', sinFunciones(CRITERIOS));
escribir('conocimiento/estilo-despacho.json', {capas: CAPAS_DESPACHO, porTipoDePlano: ESTILOS, nota: 'Clave: capa semántica del agente → {geo|texto|circulo|achurado|solido: {capa, color}}. Color 256 = el de la capa.'});
escribir('evaluacion/casos.json', CASOS_EVALUACION);

const expedientes = existsSync(resolve(base, 'conocimiento/expedientes')) ? readdirSync(resolve(base, 'conocimiento/expedientes')).filter((f) => f.endsWith('.json')) : [];
console.log(`Paquete en docs/agentes/agente-predim: ${herramientas.length} skills, ${expedientes.length} expedientes aprendidos, ${CASOS_EVALUACION.length} casos de evaluación.`);
