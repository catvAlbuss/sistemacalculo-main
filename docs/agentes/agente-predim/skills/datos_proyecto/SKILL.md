---
name: datos_proyecto
description: Guarda o consulta los datos del proyecto que usan las láminas de estructuras: Hz y Df del estudio de suelos, zona sísmica, perfil de suelo y categoría. Úsalo cuando el usuario dé o pregunte esos datos.
---

# datos_proyecto

Guarda o consulta los datos del proyecto que usan las láminas de estructuras: Hz y Df del estudio de suelos, zona sísmica, perfil de suelo y categoría. Úsalo cuando el usuario dé o pregunte esos datos.


## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `hz` | number | Hz: peralte de platea o zapata en m (estudio de suelos), ej. 0.60 |
| `df` | number | Df: profundidad de desplante en m, ej. 2.50 |
| `zona` | integer | Zona sísmica E.030: 1 a 4 |
| `suelo` | string (S0, S1, S2, S3) | Perfil de suelo |
| `categoria` | string (A2, B, C) | Categoría: A2 esencial (colegio, hospital), B importante, C común (vivienda) |


