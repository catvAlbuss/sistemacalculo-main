# Memoria del Agente Predim

Este documento resume lo que el agente ya sabe hacer y cómo cambiarle el motor de chat (de Ollama a ChatGPT o Claude) sin que empiece desde cero.

**Estado (2026-11-06):** el módulo XIV (Churubamba) está completo y es la primera muestra para el cliente. Desde una planta de arquitectura, el agente genera por chat:
- **E-01:** cimentación, cimiento corrido, aligerado y cuadro de columnas;
- **E-02:** pórticos con techo a dos aguas, vanos y acero en elevación.

**Siguiente paso:** estudiar los módulos 3 (Inicial) y 09 (Vilcabamba), y contrastar sus criterios con los del módulo XIV.

## Dónde vive la memoria

| Qué | Archivo | Quién lo lee |
|---|---|---|
| Criterios del despacho (valores) | `resources/js/ingenieria/criterios/criteriosEstructurales.js` | Las herramientas que dibujan |
| Memoria para el modelo de chat | `resources/js/ingenieria/agente/conocimiento.js` (`memoriaDelAgente()`) | El motor de chat, en el prompt del sistema |
| Criterios explicados para personas | `docs/agentes/criterios-estructuras.md` | El equipo |
| Plantilla de láminas del despacho | `public/assets/plantillas/estructuras-laminas.dxf/.json` | Las herramientas |
| Generador de la plantilla | `scripts/agente/generar-plantilla-estructuras.mjs` | El equipo, al cambiar de expediente de referencia |

La memoria del modelo se arma desde `CRITERIOS`. Si se corrige un criterio en `criteriosEstructurales.js`, el modelo lo recibe en el siguiente pedido; no hay que copiar valores a mano.

## Plantilla de láminas: cómo queda lista para otros proyectos

`scripts/agente/generar-plantilla-estructuras.mjs` convierte el expediente de referencia en una plantilla limpia:

- **Textos para el visor:**
  - los `\U+XXXX` del DXF R14 se escriben como carácter, porque el visor los leía mal ("2?/8" en vez de "2Ø3/8");
  - el ∅ pasa a Ø; %%c → Ø;
  - se quitan los códigos de párrafo (`\pxqc;`), que dejaban "ESCALA:\P1/25" literal;
  - se corrige la ortografía (ESPECIALISTA, DATOS DE LA I.E., Refuerzo, mínimo);
  - las directrices (MULTILEADER) pasan a líneas más MTEXT con su altura real, porque el visor las agrandaba y se encimaban.
- **Nada del proyecto de referencia:**
  - se quitan los planos, los títulos, la escala bajo cada título, las llamadas de acero que caían dentro de los planos y las secciones "CORTE 1-1" de su viga;
  - el cuadro de columnetas lo genera el agente desde las columnetas que detecta.
- **Espacios:** cada espacio donde dibuja el agente se recorta para no pisar los detalles de la plantilla.
- **Rótulo con campos con nombre:**
  - entidad, proyecto, especialista, cip, región, provincia, distrito, localidad, código local, código modular, plano, escala, fecha y lámina;
  - cada campo guarda su ancho, medido hasta el borde de su casilla (también en las diagonales).

Al llenar el rótulo (`rotulo.js`), cada texto se parte en renglones y se achica para no salirse de su casilla. Los datos salen, en este orden:
1. del formulario **▤ Datos del proyecto** del panel;
2. del rótulo de la arquitectura, si lo trae;
3. de lo que el agente ya sabe (módulo, plano, especialidad, escala, fecha).

Para usar otro expediente de referencia: `node scripts/agente/generar-plantilla-estructuras.mjs <referencia.dwg>`. Hay que revisar en el script las cajas de las láminas y los bloques de cada espacio.

## Estilo del despacho: capas, colores y ubicación

El agente no inventa capas ni colores. Cada plano se genera con capas semánticas (`primitives.js` → `L`), y `estiloLaminas.js` las lleva a la capa y al color con que el ingeniero dibuja cada cosa. Estos valores se midieron bloque por bloque en el expediente:

| Elemento | Capa y color |
|---|---|
| Ejes | `49. EJES.` |
| Columnas | capa `0`, color 5, con achurado AR-CONC (en el cimiento corrido, relleno sólido) |
| Cotas | estilo ROMAN50: línea 142, texto 2 |
| Malla de platea | color 6 |
| Muros bajos | achurado ANSI31 en `.N1 muros bajos` |
| Columnetas | `.N1 Columna amarre` |
| Cortes | `.D1 Corte`, con flecha sólida |
| Viguetas | `viguetas` en amarillo |
| Vigas | cian |
| Títulos | `.D1 Texto` |
| Acero de pórticos | `2_Acero EV` y `.N1 Acero Estribo` |
| Rótulo | capas `NCAMINO1`, `CAPA8` y `.` |

**Ubicación:** la plantilla guarda dónde puso el ingeniero las burbujas de ejes de cada plano. El agente ubica el suyo con el mismo centro de grilla y a la misma escala (plantas 1/25, pórticos 1/50). Solo reduce la escala si la grilla del proyecto nuevo es más grande que la del original.

**Textos:**
- `separarTextos.js` corre los rótulos de elementos que pisan otro texto; ejes, cotas y títulos no se mueven.
- En el visor, la orientación del MTEXT sale de `direction`, no de `rotation`; por eso el ejecutor fija las dos.
- En la plantilla, los MTEXT de varios renglones se parten en un texto por renglón, porque el visor a veces deja `\P` literal.

## Qué hace el modelo y qué no

- Las láminas las dibujan las herramientas (`skills/estructuraPlano.js` → `laminasPlantilla.js`, `cimentacionPlano.js`, `aligeradoPlano.js`, `porticoPlano.js`, `cuadroColumnas.js`). Son deterministas: el mismo plano da siempre las mismas láminas.
- El modelo entiende el pedido, elige la herramienta y sus argumentos (`vista`, `cimentacion`), y redacta la respuesta.

Por eso cambiar de motor no cambia el dibujo. Lo que cambia es cuánto entiende pedidos ambiguos, cómo explica los criterios y lo rápido que responde.

## Memoria según el motor

En la configuración del agente (⚙), la opción **Memoria del agente** tiene tres valores:

- **Automática** (por defecto):
  - los modelos locales chicos (Qwen 4B, 8k de contexto) reciben solo el prompt corto, porque con mucho texto se confunden;
  - los modelos grandes o en la nube (ChatGPT, Claude, gpt-oss, locales de 14B o más) reciben además la memoria completa: criterios, forma de dibujar, vocabulario y límites.
- **Completa** o **Corta**: fuerza una de las dos.

La decisión está en `usaMemoriaCompleta()` y `promptDelSistema()` de `agentRunner.js`.

## Evaluación de modelos (Ollama local, 2026-11-06)

Se probaron 4 pedidos típicos del chat; el selector de ⚙ muestra esta nota (`modelosAgente.js`).

| Modelo | Aciertos | Tiempo por paso | Uso |
|---|---|---|---|
| qwen3-cad (Qwen3 4B) | 4/4 | ~3.7 s | Recomendado hoy |
| qwen3.5:4b | 4/4 | ~3 s | Alternativa; además lee imágenes |
| qwen3:4b-instruct-2507 | 1/4 | 0.5 s | No sirve: elige mal la herramienta |
| qwen2.5-coder 7B / coder-agent-8k | 0/4 | — | No sirven: no llaman herramientas |

Al agregar un modelo, hay que evaluarlo con los mismos 4 pedidos y anotar el resultado en `EVALUACION_MODELOS`.

## Pasar a ChatGPT o Claude en el servidor

El agente habla el formato de OpenAI (`/chat/completions` con `tools`). Ese formato lo aceptan Ollama, OpenAI y la compatibilidad OpenAI de Anthropic. Por eso basta con cambiar la URL, el modelo y la clave; no hay que tocar el código del agente.

**Reglas para producción** (Hostinger es hosting compartido):

1. **La clave API nunca va al navegador.** Se agrega una ruta de Laravel, por ejemplo `POST /api/agente/v1/chat/completions` dentro del grupo con `auth` y la suscripción. Esa ruta reenvía el cuerpo al proveedor con la clave del `.env` (`AGENTE_PROVIDER_URL`, `AGENTE_API_KEY`, `AGENTE_MODEL`). En el panel, la URL queda en `/api/agente/v1` y la clave vacía. Con eso la memoria pasa a completa sola.
2. **Límite de uso:** cuota por usuario y por suscripción en esa ruta (tokens por día), y registro del uso (`usage` de cada respuesta).
3. **Sin daemon:** la ruta es una petición HTTP por pedido, igual que el resto del proyecto.
4. **Qué viaja al proveedor:**
   - el prompt;
   - la memoria;
   - el pedido del usuario;
   - los resúmenes de las herramientas, que no incluyen el plano.

   Los nombres del proyecto pueden ir en esos resúmenes; hay que avisarlo en los términos de uso.
5. **Ollama queda como modo local** para el equipo de desarrollo y como respaldo sin costo.

## Lo que sigue (entrenamiento con más expedientes)

1. Módulos 3 y 09: para cada criterio de `CRITERIOS`, anotar si se repite o cambia. Lo que cambie por tipo de módulo (aula, SS.HH., inicial) se vuelve una regla y deja de ser un valor fijo.
2. Generar plantillas por despacho o expediente con `generar-plantilla-estructuras.mjs`.
3. Pendientes conocidos del módulo XIV:
   - muebles empotrados dibujados en capas de muro aparecen como muro en el cimiento corrido;
   - la altura de vanos usa el criterio por defecto (puerta 2.10, ventana 0.90–2.10) porque la arquitectura no la acota;
   - los pórticos 10-10 y 8-8 salen a 1/53–1/70 porque sus espacios en la plantilla son chicos (el título dice la escala real).
