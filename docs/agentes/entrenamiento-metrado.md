# Entrenamiento del agente: dibujo y metrado

Meta: 90 % de las partidas a nivel ingeniero (±5 % del metrado del especialista) en cualquier
plano, y 95 % con las correcciones de los especialistas en producción.

## Cómo se mide

```
node scripts/agente/comparar-metrado.mjs <plano.dwg> <metrado del ingeniero.xlsx> "<hoja>"
```

Imprime cada partida contra la del ingeniero, el **nivel ingeniero (±5 %)**, el porcentaje dentro de
±15 % y la lista "Por entrenar" ordenada por diferencia. Solo se compara un plano con **su propio**
metrado: un metrado de otro proyecto con el mismo número de módulo no es el mismo edificio.

## Dónde estamos (2026-11-18)

| Plano | ±5 % | ±15 % | Nota |
|---|---|---|---|
| Módulo 14 (1 nivel, caseta) | 55 % | 85 % | el que más se entrenó |
| Módulo 1 (3 niveles, no visto antes) | 21 % | 36 % | la medida real en un tipo nuevo |

## Qué aprendió de las planillas del despacho (15 módulos)

`node scripts/agente/aprender-metrados.mjs <planillas.xlsx…>` genera
`resources/js/ingenieria/metrado/referenciaDespacho.js`. Contiene los rangos del despacho por
elemento (kg de acero por m³, m² de encofrado por m³, factor de losa, ladrillos por m²) y el
catálogo de 91 partidas, sin datos del proyecto. Con eso, cada metrado muestra el **contraste con
el despacho** y avisa lo que se sale de rango, en cualquier tipo de plano.

Criterios adoptados con evidencia en varios módulos:

- **Platea:** dos capas contadas una vez cada una. El módulo 14 de la planilla las cuenta dos veces
  (error de esa planilla). Gancho 0.50 por varilla (5 de 9 plateas).
- **Empalme:** 0.60 m cuando la varilla pasa de 9 m (largo comercial).
- **Viga de borde:** 6Ø1/2", gancho 0.60, estribos Ø3/8" cada ~0.14 m.
- **Viga cumbrera:** 7Ø1/2", gancho 0.50, estribos Ø3/8" cada ~0.07 m.
- **Placas y columnas:** se metran en partidas separadas (02.03.05 y 02.03.06).

## Por entrenar (prioridad por impacto, módulo 1)

1. **Clasificación placa / columna.** El despacho llama placas a las PL (en L) y columnas a las CT
   (en T). Concreto total −3 %, pero el reparto sale −59 % placas y +71 % columnas.
2. **Losa de techo en edificios de varios niveles.** El módulo 1 lleva losa en el último nivel
   (175 m² con aleros); el agente decidió cobertura. Es una decisión aprendible (`losaDeTecho`).
3. **Losa maciza en parte de cada nivel** (baños y pasadizos: 28.42 m², e = 0.25) y espesor de
   aligerado (el agente tomó 0.30; el despacho usa 0.20).
4. **Acero de vigas** (−47 % en el módulo 1, −33 % en el 14). El despacho cuenta dos vigas en
   los ejes largos del módulo 14 ("simil 2"): falta entender el criterio.
5. **VSa en edificios de varios niveles** (no aparecen en el módulo 1) y su largo (−50 % en el 14).
6. **Canaleta y correas** cuando hay losa de techo.
7. **Df del estudio de suelos:** con el Df correcto (2.00 en el módulo 1) excavación y relleno
   cuadran. Lo confirma el especialista en el formulario; no es un error del cálculo.

## Aprendizaje en producción

- Cada corrección del especialista en la vista previa del metrado, cada nombre que cambia
  (terminología) y cada decisión que corrige se guarda en el servidor:
  `storage/app/private/aprendizaje/eventos.jsonl`, fuera de git; los despliegues no lo pisan.
- El agente lo usa enseguida: correcciones de metrado en planos parecidos, terminología en
  todos los planos y decisiones en la propuesta de estructura.
- **Para reentrenar:** bajar `eventos.jsonl` del servidor y correr
  `scripts/agente/aprender-pares.mjs`. Con cada metrado nuevo del despacho, volver a correr
  `aprender-metrados.mjs` y `comparar-metrado.mjs`.
- **Para subir el porcentaje:** sumar pares plano + metrado del mismo edificio de otros tipos
  (viviendas, varios niveles, zapatas) en `storage/app/private/entrenamiento/estructuras/`.
