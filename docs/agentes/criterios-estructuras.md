# Criterios de estructuras del Agente Predim

Este documento resume los criterios que usa el agente para pasar de una planta de arquitectura a las láminas de estructuras. Se tomaron de los expedientes de referencia en `storage/app/private/entrenamiento/estructuras/` (fuera de git; ver `scripts/agente/planos.mjs`). El código está en `resources/js/etabs/agente/criteriosEstructurales.js`. Cada valor de este documento corresponde a una entrada de ese archivo.

**Estado:** se aprendieron del módulo XIV (Churubamba), que está completo como primera muestra. La memoria para el modelo de chat está en `docs/agentes/memoria-agente.md`. Faltan contrastar con el módulo 3 (Inicial) y el módulo 09 (Vilcabamba).

## Cómo trabaja el agente

1. **Lee la arquitectura.**
   - Ejes con nombre, incluso inclinados o quebrados.
   - Columnas en los cruces de ejes, aunque estén dentro de bloques o en la capa 0.
   - Columnetas de confinamiento.
   - Muros sobre los ejes.
   - Niveles (N.F.T.).
2. **Copia la plantilla de láminas.** Contiene los detalles estándar del despacho (`public/assets/plantillas/estructuras-laminas.dxf`) y se genera desde el expediente de referencia con `node scripts/agente/generar-plantilla-estructuras.mjs`. No incluye datos del proyecto de referencia: nombre del especialista, CIP, CUI ni entidad.
3. **Genera lo propio del proyecto** y lo encaja en los espacios de la plantilla, a la escala de la lámina (1/25):

| Lámina | Contenido generado |
|---|---|
| E-01 | Plano de cimentación, plano de cimiento corrido, plano de aligerado, cuadro de columnas |
| E-02 | Pórticos de hasta 4 ejes, cuadro de columnas |

## Criterios del módulo XIV

### Concreto

| Elemento | Valor | Origen en el expediente |
|---|---|---|
| Columnas y vigas | f'c = 210 kg/cm² | Cuadro de columnas, detalle de canaleta |
| Columnetas | f'c = 175 kg/cm² | Cuadro de columnetas |
| Cimiento corrido | Ciclópeo f'c = 100 kg/cm² + 30 % PG | Pórticos y especificaciones técnicas |
| Sobrecimiento | Ciclópeo f'c = 100 kg/cm² + 25 % PM | Especificaciones técnicas |
| Falsa zapata | f'c = 100 kg/cm² | Pórticos |

### Cimentación

- **Módulo pequeño (huella menor de 30 m²):** platea con Hz = 0.70 m y Df = −2.00 m, apoyada en una falsa zapata hasta el NFZ. El ingeniero la rotula "ZAPATA CORRIDA Hz = 0.70 m, Df = −2.00 m".
- **Módulo grande:** zapatas aisladas predimensionadas por área tributaria.
- **Cimiento corrido:** 0.60 × 0.80 m como mínimo constructivo, con N.F.C. = −0.80. El ancho crece si la carga del muro lo pide.
- **Niveles:** N.P.T. = +0.15 y N.T.N. = ±0.00. El relleno es terreno natural compactado al 95 % de la MDS (Próctor modificado).

### Columnas

- **Refuerzo longitudinal:** cuantía mínima de 1 % (E.060), en varillas de 5/8" y en número par. Resultado en el módulo XIV:
  - C1 (L 0.40 × 0.40 × 0.25): 8Ø5/8";
  - columna de 0.25 × 0.38: 6Ø5/8";
  - columna de 0.40 × 0.37 × 0.25: 8Ø5/8".

  Coincide con el cuadro del ingeniero.
- **Estribos:** □ 3/8"Ø: 1@0.05, 9@0.10, Rto.@0.20 C/E. Las columnas en L, T o irregulares llevan **2 estribos**.
- **Recubrimiento:** 4 cm.
- **Columnetas:** estribos de 1/4"Ø: 1@0.05, 4@0.10, Rto.@0.20 C/E. Se codifican pa, pb, pc… según su tamaño.

### Vigas y losa

- **Vigas:** sección 0.25 × peralte; el peralte es L/12 redondeado a 5 cm, con mínimo 0.40. Estribos □ 3/8"Ø: 1@0.05, 8@0.10, Rto.@0.20 C/E. Recubrimiento de 4 cm.
- **Aligerado:**
  - espesor de 0.20 m hasta 5 m de luz;
  - viguetas cada 0.40 m en la dirección de la luz corta;
  - aleros de 0.60 m;
  - acero de temperatura Ø1/4" @0.25;
  - ladrillo de techo de 0.30 × 0.30 × 0.15.

### Dibujo

- Planos a 1/25 en la lámina, es decir, al doble de la arquitectura a 1/50.
- **Cotas en cadena:** columna + luz libre + columna, y en otra línea el total entre ejes.
- Ejes recortados a 1.0 m de la columna más alejada; burbujas de unos 0.24 m de radio.
- Títulos en el formato "<PROYECTO> - PLANO DE … / ESC: 1/25", subrayados.
- **Pórticos:**
  - niveles BASE NPN = +0.00, NFT, TECHO NFP y NFZ;
  - cotas verticales de cimentación y altura;
  - burbujas de los ejes que cruzan;
  - estribaje rotulado en columnas y vigas.
- **Platea:** malla dibujada cada 0.20 m en las dos direcciones de la grilla y rótulo en una línea ("Hz = 0.70 m  Df = -2.00 m"). Con platea no hay vigas de cimentación.
- **Cimiento corrido:** el plano dibuja los muros de la arquitectura tal como están (anillo perimetral y muros interiores), con los vanos de puerta cerrados porque el cimiento pasa por debajo. Cada muro lleva el rótulo "Cimiento corrido" y su marca de corte:
  - 1-1: muro exterior con puerta;
  - 2-2: muro exterior;
  - 3-3: muro interior.
- **Columnetas:** contorno con aspa y código pa, pb… Las medidas que difieren 3 cm o menos son la misma columneta.
- **Aligerado:**
  - la losa se divide en paños por los muros interiores largos; la viga central es la VCUMBRERA;
  - con cumbrera, las viguetas corren paralelas a ella y se apoyan en las vigas de los ejes que la cruzan;
  - las viguetas se cuentan sobre la losa con aleros (6 + 6 en el módulo XIV);
  - símbolo: bastón 1Ø3/8" a lo largo de la luz, trazos de viguetas junto a los apoyos y flecha;
  - "CANALETA" en los aleros paralelos a la cumbrera.
- **Cuadro de columnas:** una columna por tipo (C1, C2… en orden de lectura de la planta). Filas: sección con estribos y varillas, refuerzo y estribaje, despiece de estribos. Las columnas en L llevan un estribo por ala; los dos se cruzan en la esquina.
- **Pórticos a 1/50:**
  - acero en elevación: 2 varillas por columna y viga, y estribos con su distribución desde cada extremo;
  - columnetas del eje (PA, PB…);
  - sección de la viga arriba a la izquierda.
- **Escala bajo cada título:** la escribe el agente con la escala real; si el dibujo no entra en su espacio, se reduce y se indica.

## Generalización: módulos 3 y 09 (planos que el agente no conocía)

Se probaron con `scripts/agente/leer-arquitectura.mjs` (qué entiende el agente) y `scripts/agente/probar-laminas.mjs` (láminas completas y vista previa SVG), comparando con los expedientes de estructuras del ingeniero. Pruebas: `tests/frontend/etabs-generalizacion.test.mjs`.

**Lectura de la hoja (corregido):**
- Una hoja con plantas de 1.er y 2.º nivel, cortes, elevaciones y plano clave ya no se mezcla en una sola vista:
  - una grilla usa un solo tamaño de burbuja;
  - los ejes de burbuja suelta se prolongan a lo más un 30 %.
- El título de la vista es un texto grande debajo de la grilla, no una leyenda de acabados.
- Columnas:
  - se aceptan contornos de hasta 2.50 m, como las placas en L;
  - una polilínea cerrada repitiendo el primer vértice cuenta como cerrada;
  - los vértices alineados no cuentan;
  - lo que mide menos de 0.25 m no es columna;
  - en un cruce manda la capa estructural.

**Reglas aprendidas (se cumplen en los 3 expedientes):**

| Regla | Criterio | Ejemplos |
|---|---|---|
| Placa o columna | Placa (PL) si cada ala mide ≥ 3 × espesor; columna T (CT) si es T y no llega a placa; si no, columna (C). Espesor: A = t(b + h − t) | PL1 L 1.50x1.00x0.30 y L 0.90x0.90 · CT1 T 1.00x0.60x0.30 · C L 0.50x0.60 y 0.40x0.40 |
| Acero | Número par de Ø5/8" con cuantía ≥ 0.98 % | 20Ø5/8" en 0.39 m² · 12Ø5/8" en 0.24 m² · 8Ø5/8" en 0.1375 m² |
| Estribos de confinamiento | CT 12@0.10; placas y columnas ≥ 0.50 m 10@0.10; columnas menores 9@0.10 | — |
| Cuadro | Título: "CUADRO DE PLACA Y COLUMNA", "CUADRO DE PLACA" o "CUADRO DE COLUMNAS". Medidas de L/T con espesor | 1.00x0.60x0.30m |
| Cimentación | Platea con zapata corrida por defecto (los 3 módulos, suelo S3); siempre que haya placas | — |
| Losa | El espesor lo da la luz entre ejes (vigas), no entre muros | Módulo 09 con 5.8–6.1 m → 25 cm |
| Pórticos | Si hay más que espacios en la plantilla, la lámina de pórticos se copia a la derecha | Módulo 3 con 8 ejes → E-03 |

**Datos del proyecto, no reglas:**
- Hz y Df vienen del estudio de suelos: 0.60/2.50 en los módulos 3 y 09, 0.70/2.00 en el 14.
- U depende de la categoría: 1.5 en colegios, categoría A.

## Pendiente

- Edificios de 2 niveles: el módulo 09 tiene 2.º nivel. Falta la losa de entrepiso y los pórticos con dos niveles (NPN −3.05 / −0.05).
- Hz, Df y U como datos del proyecto en el panel.
- Al pórtico le falta detalle frente al del ingeniero:
  - secciones VB y sus llamadas;
  - canaleta;
  - correas;
  - cadena de cotas superior.
- Las hojas extra de pórticos copian la lámina de la plantilla por punto de inserción: algún detalle grande puede quedar fuera.

**Pórticos (resuelto):**
- la elevación sigue al ingeniero: platea abajo (de NFZ a NFZ + Hz) sobre la falsa zapata, y encima relleno compactado, CC hasta -0.80 y SC;
- techo a dos aguas cuando el eje cruza la cumbrera; la pendiente sale de la arquitectura (PTE=33 %) y se mide desde la cara interior de la columna. Da cumbrera +4.10; el ingeniero tiene +4.12;
- cobertura TR4 y canaletas;
- puertas con DINTEL y ventanas con VSa, leídas de la hoja de puerta y de los rótulos V-n;
- columnetas del eje medidas contra la línea de columnas.

**Vanos:** la altura usa el criterio por defecto (puerta 2.10, ventana 0.90–2.10) porque la arquitectura no la acota.

**Cimiento corrido:** muebles empotrados dibujados con capas de muro (por ejemplo, un poyo) aparecen como muro.

**Datos que se copian tal cual de la referencia:** el cuadro de columnetas, los parámetros sísmicos y las especificaciones técnicas. Hay que revisarlos en cada proyecto.
