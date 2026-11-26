---
name: modelo_analisis
description: Arma el modelo de análisis estructural (.e2k de ETABS) desde la arquitectura leída: columnas, vigas y losas en sus ejes, pisos con sus alturas, cargas E.020, masa y espectro E.030, y combinaciones E.060. Lo descarga para ETABS y lo deja listo para abrir en Análisis Estructural. Úsalo para 'enviar a análisis', 'modelo para ETABS', 'exporta el .e2k', 'quiero analizar la estructura'.
---

# modelo_analisis

Arma el modelo de análisis estructural (.e2k de ETABS) desde la arquitectura leída: columnas, vigas y losas en sus ejes, pisos con sus alturas, cargas E.020, masa y espectro E.030, y combinaciones E.060. Lo descarga para ETABS y lo deja listo para abrir en Análisis Estructural. Úsalo para 'enviar a análisis', 'modelo para ETABS', 'exporta el .e2k', 'quiero analizar la estructura'.


## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `R0` | number | Coeficiente básico de reducción sísmica (E.030 Tabla 7): 8 pórticos, 7 dual, 6 muros, 3 albañilería. Solo si el ingeniero lo indica. |


