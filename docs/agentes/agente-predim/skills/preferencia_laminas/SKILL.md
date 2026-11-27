---
name: preferencia_laminas
description: Pedidos del cliente sobre lo que llevan las láminas: sin columnas, sin cotas, sin pórticos, sin tablas estándar o sin notas (y deshacerlos). Primero aconseja con la norma y ofrece opciones (la recomendada primero); con 'opcion' ejecuta la elegida, redibuja las láminas y la deja escrita en las notas y en el registro de decisiones. Úsalo para 'quiero mis láminas sin…', 'no dibujes…', 'quita las cotas', 'vuelve a poner…'.
---

# preferencia_laminas

Pedidos del cliente sobre lo que llevan las láminas: sin columnas, sin cotas, sin pórticos, sin tablas estándar o sin notas (y deshacerlos). Primero aconseja con la norma y ofrece opciones (la recomendada primero); con 'opcion' ejecuta la elegida, redibuja las láminas y la deja escrita en las notas y en el registro de decisiones. Úsalo para 'quiero mis láminas sin…', 'no dibujes…', 'quita las cotas', 'vuelve a poner…'.


## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `texto` | string | El pedido tal como lo dijo el cliente |
| `pedido` | string (sin_columnas, sin_cotas, sin_porticos, sin_tablas, sin_notas, tamano_texto, sin_achurado, sin_malla) | Pedido ya reconocido |
| `opcion` | string | Opción elegida por el cliente (id de la opción) o 'dejar' para no cambiar nada |
| `deshacer` | boolean | true para volver a dibujar lo que se había quitado |


