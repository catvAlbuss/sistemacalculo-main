# Normativas estructurales del Agente NovaCad — Perú, EE. UU. y Europa

Estado investigado el 24/11/2026. Cada criterio que el agente use para diseñar debe salir de una norma
**vigente** y citar su artículo. Este documento dice qué norma rige, qué versión, qué está pendiente de
verificar contra el texto oficial y qué debe cambiar en el agente.

> Regla del agente: **una sola normativa por proyecto**, elegida por el país (y la versión que aplique por
> las disposiciones transitorias). Nunca mezclar criterios de dos normas en un mismo diseño. Las normas
> extranjeras sirven de referencia técnica solo donde la peruana no dice nada, y eso debe quedar escrito.

---

## 1. Perú — Reglamento Nacional de Edificaciones (obligatorio)

| Norma | Versión vigente | Estado | Qué usa el agente hoy |
|---|---|---|---|
| **E.030** Diseño sismorresistente | **2026** — RM 183-2026-VIVIENDA (abr./may. 2026); transitoria modificada por RM 217-2026-VIVIENDA (jun. 2026) | **Cambió.** Proyectos con licencia en trámite/aprobada o expediente aprobado en Invierte.pe siguen con la versión anterior. | Tablas **E.030-2018** (`criterios/datosProyecto.js`). **Desactualizado para proyectos nuevos.** |
| **E.060** Concreto armado | **2009** — DS 010-2009-VIVIENDA | Vigente. Hay propuesta de actualización (RM 066-2025 creó el grupo de trabajo; SENCICO la presentó en jul. 2026). **No aprobada** a la fecha. | E.060-2009. Correcto. |
| **E.050** Suelos y cimentaciones | **2018** — RM 406-2018-VIVIENDA | Vigente (no se encontró modificación posterior). EMS obligatorio con contenido mínimo. | Hz/Df del EMS; sin EMS usa criterio del despacho y lo advierte. Correcto. |
| **E.070** Albañilería | 2006 (una fuente secundaria menciona cambios en 2019; **sin confirmación oficial**) | Verificar en el portal del MVCS. | Criterios de muros/columnetas. Verificar. |
| **E.020** Cargas | 2006 | No se encontró modificación. | Cargas por defecto del predimensionamiento. |

### 1.1 Cambios de la E.030-2026 (lo confirmado y lo pendiente)

Confirmado en fuentes oficiales o de prensa oficial:
- La modificación existe y está vigente, con régimen transitorio (RM 183-2026 y RM 217-2026).
- Se exige considerar el **sismo en dos direcciones ortogonales simultáneamente**.
- Se detalla más la **clasificación de perfiles de suelo** y sus propiedades dinámicas.

Reportado por fuentes secundarias (blogs/transcripciones) — **verificar en el texto oficial antes de usar**:
- Se mantienen 4 zonas sísmicas; la zonificación sería distrital.
- Habría **seis perfiles de suelo** (la 2018 tiene S0–S4 con S4 = condiciones excepcionales).
- **TP y TL por intervalos** según Vs30 e interpolación lineal (S2: TP 0.4–0.6 s, TL 2.5–2.0 s; S3: TP 0.6–0.9 s, TL 2.0–1.6 s); sin Vs30 se usa el valor más desfavorable (S2: TP 0.6 / TL 2.0; S3: TP 0.9 / TL 1.6).
- No se pudo confirmar si cambiaron R0, las irregularidades ni los límites de deriva.

**Bloqueo:** el PDF oficial (gob.pe, NT E.030 2026) rechaza la descarga automática. Para cerrar este punto
hace falta el PDF oficial descargado a mano y guardado en `storage/app/private/normas/`; de ahí se
extraen las tablas exactas (Z, S, TP/TL, U, R0, Ia/Ip, derivas) para el agente.

### 1.2 Parámetros de diseño que el agente ya aplica (E.060-2009 / E.030-2018)

| Parámetro | Valor | Artículo |
|---|---|---|
| Combinaciones | 1.4CM + 1.7CV · 1.25(CM+CV) ± CS · 0.9CM ± CS | E.060 9.2 |
| Recubrimientos | Contra el suelo 7.5 cm · vigas y columnas 4 cm · losas y aligerados 2 cm | E.060 7.7.1 |
| Cuantía de columnas | 1 % a 6 % de Ag | E.060 10.9.1 y 21.6.3.1 |
| Deriva máxima (2018) | Concreto 0.007 · acero 0.010 · albañilería 0.005 · madera 0.010 | E.030-2018 tabla 11 |
| Factor U | A1/A2 1.5 · B 1.3 · C 1.0 | E.030-2018 tabla 5 |

---

## 2. Estados Unidos (referencia; obligatorio solo para obras allá)

| Documento | Versión vigente | Notas |
|---|---|---|
| **ACI 318** concreto | **ACI 318-25** (publicado ene. 2025; entrará en el IBC 2027). El IBC 2024 aún referencia ACI 318-19. | La E.060-2009 se basa en el ACI 318 de esa época: es la referencia natural cuando la E.060 no cubre algo. 318-25 cambia detallado sísmico, desarrollo de ganchos y barras con cabeza, empalmes mecánicos y anclajes. |
| **ASCE 7** cargas y sismo | **ASCE 7-22** (adoptado por el IBC 2024). ASCE 7-28 en preparación. | Introduce el espectro multiperiodo; se permite el de dos periodos para fuerza lateral equivalente. Hay un cambio aprobado (S102-25, IBC 2027) por el pico del espectro en periodos muy cortos. |
| **IBC** | 2024 (el 2027 adoptará ACI 318-25) | Adopción por cada estado/ciudad. |

Valores de referencia (ACI 318 / ASCE 7): combinaciones 1.4D · 1.2D+1.6L · 1.2D+1.0E+L · 0.9D+1.0E;
recubrimiento contra el suelo 75 mm, vigas/columnas interiores 38 mm, losas 19 mm; columnas 1–8 % (pórticos
especiales 1–6 %); deriva admisible 0.020·h (categoría de riesgo I-II), 0.015·h (III), 0.010·h (IV).

---

## 3. Europa — Eurocódigos (referencia; obligatorio solo para obras allá)

- **Segunda generación**: todas las partes deben estar implementadas a nivel nacional al **30/09/2027** y la
  primera generación se retira el **30/03/2028**. Entre 2023 y 2028 conviven ambas; no mezclar sin cuidado.
- Partes relevantes: EN 1990 (bases), EN 1991 (acciones), **EN 1992-1-1** (concreto, nueva versión 2023),
  EN 1996 (albañilería), **EN 1997** (geotecnia), **EN 1998** (sismo). Cada país fija valores en su Anexo Nacional.

Valores de referencia (primera generación, para comparar): combinación 1.35G + 1.5Q; sísmica G + AEd + ψ2Q;
recubrimiento cnom = cmin + 10 mm según clase de exposición; columnas As ≥ máx(0.10 NEd/fyd; 0.002 Ac) y
≤ 0.04 Ac; deriva dr·ν ≤ 0.005h / 0.0075h / 0.010h según los elementos no estructurales; clases de importancia
I–IV (γI 0.8 / 1.0 / 1.2 / 1.4).

---

## 4. Qué debe cambiar en el agente

1. **Perfil de normativa por proyecto** (`pais`, `versionE030`: 2018 | 2026 según la transitoria). El agente
   pregunta si el proyecto tiene licencia o expediente aprobado antes de la RM 183-2026; si no, usa la 2026.
2. **Tablas E.030-2026** en `criterios/datosProyecto.js` (mantener la 2018 para proyectos en transición), una
   vez extraídas del PDF oficial. Hasta entonces, el agente debe **advertir** en la lámina y en el chat que los
   parámetros sísmicos son de la E.030-2018.
3. **Sismo en dos direcciones** en el análisis (motor OpenSeesPy) y en la revisión de ingeniería.
4. **Cada criterio con su artículo** (ya lo hace `analizarProyecto`; extenderlo a recubrimientos, cuantías,
   derivas y combinaciones) para que el ingeniero pueda auditarlo.
5. **E.060 en observación**: cuando se apruebe la nueva versión, agregarla como otra versión seleccionable.
6. ACI/ASCE/Eurocódigos: solo como perfiles separados si el despacho hará obras fuera del Perú.

## Fuentes

- E.030-2026: [RM 183-2026-VIVIENDA (gob.pe)](https://www.gob.pe/institucion/vivienda/normas-legales/8081915-183-2026-vivienda) · [RM 217-2026 (El Peruano)](https://busquedas.elperuano.pe/dispositivo/NL/2521423-1) · [El Peruano](https://elperuano.pe/noticia/294936-tu-casa-resistira-un-sismo-nueva-norma-cambia-como-se-construye-en-peru) · [Proyecto RM 279-2025](https://www.gob.pe/institucion/vivienda/normas-legales/7356142-279-2025-vivienda) · secundarias: [Eximia Haus](https://eximiahaus.pe/blog/norma-e030-2026-diseno-sismorresistente-que-cambia), [CivilGeeks](https://civilgeeks.com/2026/05/04/ultima-actualizacion-de-la-norma-e-030-tus-disenos-deben-adaptarse/)
- E.060: [RM 066-2025-VIVIENDA](https://busquedas.elperuano.pe/dispositivo/NL/2377319-1) · [SENCICO, propuesta E.060](https://www.gob.pe/institucion/sencico/noticias/1422139-sencico-presenta-la-propuesta-de-norma-tecnica-e-060-concreto-armado)
- E.050: [RM 406-2018-VIVIENDA](https://busquedas.elperuano.pe/dispositivo/NL/1701667-1)
- E.070: [Constructivo](https://plataforma.constructivo.com/articulo/norma-tecnica-e070-albanileria) (secundaria)
- ACI 318-25: [ACI 318 Portal](https://www.concrete.org/aci318) · [ENR](https://www.enr.com/articles/61066-aci-318-25-structural-concrete-code-update-adds-sustainability-guide-performance-based-wind-design) · [STRUCTURE](https://www.structuremag.org/article/aci-318-25-changes-to-anchorage-and-reinforcing-bar-provisions/)
- ASCE 7-22 / IBC: [ICC – espectro de dos periodos](https://www.iccsafe.org/building-safety-journal/bsj-technical/is-continued-use-of-the-two-period-design-spectrum-in-the-equivalent-lateral-force-procedure-of-seismic-design-permitted-by-asce-7-22/) · [S.K. Ghosh](https://www.skghoshassociates.com/blog/understanding-the-multi-period-soil-modified-design-response-spectra-of-asce-7-22-key-insights-and-important-potential-consequences/) · [Simpson Strong-Tie](https://seblog.strongtie.com/2026/03/how-i-learned-to-stop-worrying-and-love-multi-period-seismic-design)
- Eurocódigos: [JRC – segunda generación](https://eurocodes.jrc.ec.europa.eu/second-generation-eurocodes) · [JRC – cronograma](https://eurocodes.jrc.ec.europa.eu/2nd-generation-evolution/timeline-eurocodes-second-generation)

---

## 5. Citas verificadas en el texto (27/11/2026)

Leídas en los PDF guardados en `storage/app/private/normas/` (privado): **E.060 DS 010-2009** y **E.050**
publicadas en gob.pe (colección del RNE de la Municipalidad de Santa María del Mar). La "E.060 2019" que
circula es una **propuesta** de SENCICO, no la norma vigente. La copia de la E.050 no indica si es la 2006 o
la modificada por la RM 406-2018: confirmar su numeración. Detalle en `resources/js/ingenieria/criterios/normasVerificadas.js`.

| Criterio | Artículo | Lo que dice |
|---|---|---|
| Contenido de los planos | E.060 1.2.4 | Normas, cargas vivas, f'c, acero, tamaño/ubicación/refuerzo de todos los elementos, anclajes y empalmes, juntas |
| Recubrimientos | E.060 7.7.1 | 70 mm contra el suelo · 40 mm vigas y columnas · 20 mm losas |
| Ganchos | E.060 7.1 | 180° + 4 db (≥ 65 mm) o 90° + 12 db |
| Combinaciones | E.060 9.2.1 y 9.2.3 | 1.4CM+1.7CV · 1.25(CM+CV)±CS · 0.9CM±CS |
| Peraltes mínimos | E.060 9.6.2.1 y Tabla 9.1 | Para no verificar deflexiones |
| Cuantía de columnas | E.060 10.9.1 (y 21.6.3.1) | 1 % a 6 % de Ag |
| Concreto sismorresistente | E.060 21.3.2.1 | f'c ≥ 21 MPa |
| Acero sismorresistente | E.060 21.3.3 | A706; A615 grados 280/420 con condiciones |
| Vigas de pórticos | E.060 21.5.1.3 · 21.5.2.1 · 21.5.2.3 | bw ≥ 250 mm y ≥ 0.25h · 2 barras corridas arriba y abajo · sin traslapes en nudos ni a < 2h |
| Estribos de vigas | E.060 21.5.3 | 2h; primero ≤ 50 mm; s ≤ d/4, 8 db, 24 de, 300 mm; fuera ≤ d/2 |
| Columnas de pórticos | E.060 21.6.3.2 · 21.6.4.2 · 21.6.4.5 | Traslapes en la mitad central · s ≤ b/3, 6 db, 100 mm · fuera ≤ 10 db y 250 mm |
| EMS | E.050 art. 3, 12, 17, 19 | Obligatoriedad, informe, presión admisible, Df ≥ 0.80 m en zapatas; platea con viga perimetral ≥ 0.40 m |

Corrección: el **21.4** de la E.060 es para sistemas de muros y duales tipo I; en **pórticos** rigen el
**21.5** (vigas) y el **21.6** (columnas). El agente citaba 21.4 para pórticos.

Hallazgo al verificar los valores: la distribución típica del despacho "1@0.05, 8@0.10, Rto.@0.20" **no
cumple** en vigas de 0.40 m (d ≈ 0.34 m → d/4 = 0.085 m y d/2 = 0.17 m; según la norma 1@0.05, 10@0.075,
Rto.@0.15), y "@0.10" en columnas con varillas de 5/8" pasa 6 db = 0.095 m. El agente lo informa con la
distribución que cumple; cambiar el estándar del despacho lo decide el ingeniero.
