---
name: leer_estructura
description: Lee la planta de arquitectura abierta: ejes con su nombre (también inclinados), columnas en los cruces de ejes (aunque estén dentro de bloques) y sus tipos C1, C2…; las rotula en el plano.
---

# leer_estructura

Lee la planta de arquitectura abierta: ejes con su nombre (también inclinados), columnas en los cruces de ejes (aunque estén dentro de bloques) y sus tipos C1, C2…; las rotula en el plano.

## Cuándo usarla

El usuario quiere ver o verificar ejes y columnas detectados, sin generar láminas.

## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `vista` | string | Opcional: número o parte del título de la vista, ej. 'primer nivel' |
| `capas` | string | Opcional: capas de columnas separadas por coma (solo si el plano no tiene ejes con nombre) |

## Qué devuelve

Ejes con nombre, columnas por tipo (C1, C2…) y columnetas.

## Implementación

resources/js/ingenieria/lectura/lectorPlano.js
