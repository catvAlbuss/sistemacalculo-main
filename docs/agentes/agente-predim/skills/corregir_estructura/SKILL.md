---
name: corregir_estructura
description: Anota una corrección del ingeniero a una decisión de la estructura propuesta (cimentación, tipo o espesor de losa, losa en el último nivel, f'c, estribos, Hz, Df…). El agente la aprende para este plano y los parecidos. Úsalo cuando el ingeniero diga que algo de la propuesta o de las láminas es distinto (ej. 'la losa es maciza', 'usa zapatas', 'el aligerado es de 20').
---

# corregir_estructura

Anota una corrección del ingeniero a una decisión de la estructura propuesta (cimentación, tipo o espesor de losa, losa en el último nivel, f'c, estribos, Hz, Df…). El agente la aprende para este plano y los parecidos. Úsalo cuando el ingeniero diga que algo de la propuesta o de las láminas es distinto (ej. 'la losa es maciza', 'usa zapatas', 'el aligerado es de 20').


## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `decision` | string (cimentacion, cimientoCorrido, hz, df, losa, espesorLosa, losaDeTecho, fcColumnas, fcColumnetas, estribos, columnasComoArquitectura) | Qué decisión corrige |
| `valor` | string | El valor correcto, como lo dijo el ingeniero (ej. 'maciza', '0.20', 'zapatas', 'no') |
| `motivo` | string | Opcional: el motivo, solo si el ingeniero lo dijo |


