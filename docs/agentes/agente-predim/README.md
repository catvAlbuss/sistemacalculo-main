# Agente NovaCad (paquete portable)

Agente de estructuras para planos de arquitectura peruanos (E.020, E.030, E.050, E.060, E.070). Recibe una planta de arquitectura (DWG/DXF) y devuelve las láminas de estructuras (cimentación, cimiento corrido, aligerado, pórticos y cuadros) con el criterio y el estilo de dibujo del despacho.

Versión de la memoria: **2026-11-06 · módulo XIV completo**. Este paquete se genera desde el código con `node scripts/agente/exportar-paquete.mjs`; no se edita a mano.

## Cómo está hecho

El agente tiene dos partes, y conviene no confundirlas:

1. **El modelo de lenguaje** (Ollama hoy; ChatGPT, Claude o Grok mañana) entiende el pedido, elige una herramienta y sus argumentos, y explica el resultado. Gasta tokens.
2. **Las herramientas (skills)** leen el plano y dibujan. Son código determinista, el mismo para cualquier modelo, y no gastan tokens.

Por eso, cambiar de modelo no cambia el dibujo. Para que el agente dibuje mejor y con más tipos de proyectos se mejora su **conocimiento** y sus **herramientas**: eso es el entrenamiento, ver abajo.

## Archivos

| Archivo | Para qué |
|---|---|
| `AGENTE.md` | Instrucciones del sistema completas: rol, reglas, memoria (criterios, estilo, vocabulario, límites) |
| `skills/<skill>/SKILL.md` | Ficha de cada herramienta: cuándo usarla, parámetros, qué devuelve, dónde está el código |
| `herramientas/openai.json` | Esquema de funciones para OpenAI, Ollama, Grok (xAI) y APIs compatibles |
| `herramientas/anthropic.json` | Esquema de herramientas para Claude (`tools` con `input_schema`) |
| `conocimiento/criterios.json` | Criterios de diseño del despacho (f'c, estribos, cimentación, losas, techos, vanos) |
| `conocimiento/datos-proyecto.json` | Datos del proyecto (Hz, Df, zona, suelo, categoría, niveles) y tablas E.030 |
| `conocimiento/estilo-despacho.json` | Capa y color de cada elemento por tipo de plano |
| `conocimiento/expedientes/*.json` | Lo aprendido de cada expediente de referencia |
| `conocimiento/resumen-expedientes.md` | Qué criterios se repiten y cuáles cambian entre expedientes |
| `evaluacion/casos.json` | Pedidos de prueba con la herramienta y los argumentos esperados |

## Uso con cada proveedor

Las herramientas corren en el visor (navegador), donde está el plano. El modelo solo recibe el pedido, elige la herramienta y lee su resumen.

- **Ollama (local):** `http://127.0.0.1:11434/v1/chat/completions` con `tools = herramientas/openai.json`. Recomendado: `qwen3-cad` o `qwen3.5:4b`, con el prompt corto, porque 8k de contexto no alcanzan para `AGENTE.md` completo.
- **ChatGPT (OpenAI) y Grok (xAI):** el mismo esquema `openai.json` y `AGENTE.md` como mensaje `system`.
- **Claude (Anthropic):** `herramientas/anthropic.json` en `tools` y `AGENTE.md` en `system`.
- **En el servidor:** la clave va en una ruta de Laravel (proxy), nunca en el navegador. Ver `docs/agentes/memoria-agente.md`.

Evaluar un modelo antes de usarlo: `AGENTE_URL=… AGENTE_MODEL=… node scripts/agente/evaluar-modelo.mjs`. Corre los casos de `evaluacion/casos.json` y dice cuántos acierta y en cuánto tiempo.

## Entrenamiento: cómo aprende el agente

1. **Aprender un expediente:** `node scripts/agente/aprender-expediente.mjs <estructuras.dwg> <nombre>`. Extrae el estilo (capas, colores, alturas), los criterios (f'c, estribos, varillas, Hz, Df, losa, vigas, recubrimientos, cobertura, sismo) y qué planos, cortes, detalles y cuadros incluye el ingeniero. Guarda `conocimiento/expedientes/<nombre>.json` y actualiza `resumen-expedientes.md`.
2. **Generalizar:**
   - lo que se repite en todos los expedientes pasa a ser criterio (`criteriosEstructurales.js`);
   - lo que cambia se vuelve regla (por ejemplo, espesor de losa según la luz) o dato del proyecto (por ejemplo, Hz y Df del estudio de suelos).
3. **Plantilla de láminas:** `node scripts/agente/generar-plantilla-estructuras.mjs <estructuras.dwg>` genera la plantilla del despacho a partir del expediente.
4. **Probar con un plano nuevo (generalización):**
   - `node scripts/agente/leer-arquitectura.mjs <arquitectura.dwg>` muestra qué entiende el agente: vistas, ejes, columnas y placas, columnetas;
   - `node scripts/agente/probar-laminas.mjs <arquitectura.dwg> "<vista>" salida.svg` genera las láminas completas y una vista previa;
   - se compara con el expediente del ingeniero, y cada diferencia se vuelve una regla general (`docs/agentes/criterios-estructuras.md`) con su prueba.
5. **Comprobar:** las pruebas (`node --test tests/frontend/etabs-*.test.mjs`) y la comparación en el visor contra el PDF del expediente.

Modelos evaluados: qwen3-cad (Recomendado: 4/4 pedidos bien, ~3.7 s por paso); qwen3.5:4b-q4_K_M (4/4 pedidos bien, ~3 s por paso; además lee imágenes (útil para planos escaneados)); qwen3:4b-instruct-2507-q4_K_M (Rápido (0.5 s) pero elige mal la herramienta (1/4)); coder-agent-8k (No llama herramientas (0/4): es un modelo para código); qwen2.5-coder:7b-instruct (No llama herramientas (0/4): es un modelo para código); gpt-oss:20b-cloud (Corre en la nube de Ollama (envía el pedido fuera del equipo; puede tener límites de uso)).
