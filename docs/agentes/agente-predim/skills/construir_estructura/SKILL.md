---
name: construir_estructura
description: Construcción guiada paso a paso (lectura → suelo → cimentación → losas → dibujo): en cada etapa informa lo que leyó y decidió con su respaldo y pregunta SOLO lo dudoso, una pregunta a la vez, antes de dibujar. Úsalo para 'construye la estructura', 'paso a paso', 'guíame', o para responder la pregunta pendiente de la construcción (accion 'responder' con clave y valor).
---

# construir_estructura

Construcción guiada paso a paso (lectura → suelo → cimentación → losas → dibujo): en cada etapa informa lo que leyó y decidió con su respaldo y pregunta SOLO lo dudoso, una pregunta a la vez, antes de dibujar. Úsalo para 'construye la estructura', 'paso a paso', 'guíame', o para responder la pregunta pendiente de la construcción (accion 'responder' con clave y valor).


## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `accion` | string (iniciar, responder, dibujar) | iniciar (por defecto), responder la pregunta pendiente, o dibujar ya con lo recomendado |
| `clave` | string | Al responder: la clave de la pregunta pendiente (está en el estado) |
| `valor` | string | Al responder: el valor elegido por el ingeniero |
| `vista` | string | Opcional al iniciar: vista de arquitectura |


