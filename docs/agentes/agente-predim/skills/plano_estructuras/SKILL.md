---
name: plano_estructuras
description: Pasa de arquitectura a estructuras: con la planta de arquitectura abierta, dibuja debajo la lámina de estructuras (plano de cimentación, plano de aligerado, cuadro de columnas, notas y rótulo) sobre los mismos ejes y columnas. Úsalo para cualquier pedido de plano de estructuras o de estructurar el plano.
---

# plano_estructuras

Pasa de arquitectura a estructuras: con la planta de arquitectura abierta, dibuja debajo la lámina de estructuras (plano de cimentación, plano de aligerado, cuadro de columnas, notas y rótulo) sobre los mismos ejes y columnas. Úsalo para cualquier pedido de plano de estructuras o de estructurar el plano.

## Cuándo usarla

El usuario abrió una planta de arquitectura y pide el plano de estructuras ("estructura este plano", "genera las láminas de estructuras", "con platea", "con zapatas"). No pedir pisos ni cargas.

## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `vista` | string | Opcional: número o parte del título de la vista de arquitectura, ej. 'primer nivel' |
| `cimentacion` | string (auto, zapatas, platea) | Opcional: tipo de cimentación; por defecto auto |
| `conservar` | boolean | Opcional: true para dejar las láminas anteriores y agregar otras; por defecto se reemplazan |
| `hz` | number | Hz: peralte de platea o zapata en m (estudio de suelos), ej. 0.60 |
| `df` | number | Df: profundidad de desplante en m, ej. 2.50 |
| `zona` | integer | Zona sísmica E.030: 1 a 4 |
| `suelo` | string (S0, S1, S2, S3) | Perfil de suelo |
| `categoria` | string (A2, B, C) | Categoría: A2 esencial (colegio, hospital), B importante, C común (vivienda) |

## Qué devuelve

{ok, mensaje, laminas: ["E-01","E-02"], avisos[]}. Responder el mensaje tal cual y agregar los avisos.

## Implementación

resources/js/ingenieria/agente/skills/estructuraPlano.js → laminasPlantilla.js (cimentacionPlano, aligeradoPlano, porticoPlano, cuadroColumnas, rotulo, estiloLaminas, separarTextos)
