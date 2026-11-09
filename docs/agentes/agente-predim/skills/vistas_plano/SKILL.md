---
name: vistas_plano
description: Lista las vistas del plano abierto (plantas con su grilla de ejes: primer nivel, techo, cimentación…) con sus ejes y columnas. Úsalo cuando el archivo tiene varias láminas o vistas.
---

# vistas_plano

Lista las vistas del plano abierto (plantas con su grilla de ejes: primer nivel, techo, cimentación…) con sus ejes y columnas. Úsalo cuando el archivo tiene varias láminas o vistas.

## Cuándo usarla

El archivo tiene varias plantas o láminas y hay que elegir una (primer nivel, techo…).

## Parámetros

Sin parámetros.

## Qué devuelve

Lista de vistas con su título, ejes y columnas. Pasar luego "vista" a las otras herramientas.

## Implementación

resources/js/etabs/agente/skills/estructuraPlano.js
