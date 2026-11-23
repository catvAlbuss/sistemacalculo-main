# Diseño: aprendizaje por pares para planos estructurales

## Intención

NovaCad debe leer plantas de arquitectura distintas, proponer y dibujar una estructura útil como primer borrador, y dejar visibles para revisión técnica los elementos o criterios inciertos. El usuario busca aproximadamente 90% de funcionalidad inicial y que las correcciones del ingeniero mejoren el aprendizaje compartido del despacho.

Los 15 módulos DWG de arquitectura/estructura y sus planillas son la base inicial. No se debe presentar el entrenamiento como ajuste de pesos del modelo: el aprendizaje será estructurado, comprobable y aplicable por el generador CAD.

## Estado confirmado

- `scripts/agente/aprender-pares.mjs` obtiene rasgos de arquitectura y algunas decisiones estructurales, pero no aprende la geometría completa que debe dibujarse.
- `resources/js/ingenieria/agente/skills/estructuraPlano.js` genera con una plantilla fija derivada del módulo 14.
- `resources/js/ingenieria/aprendizaje/casosAprendidos.js` contiene actualmente los módulos 03 y 14, no los 15 pares disponibles.
- La detección de pares exige el sufijo `estructuras.dwg`; el archivo de estructura del módulo 1 está nombrado en singular (`ESTRUCTURA.dwg`) y queda fuera de esa búsqueda.
- La carpeta de entrenamiento también contiene otros proyectos con números de módulo repetidos y hay más de un par candidato para el módulo 14. La ingesta debe separar grupos de proyecto y requerir selección local explícita ante una colisión, en vez de sobreescribir un caso con el otro.
- El aprendizaje por correcciones actual cubre decisiones y partidas de metrado, no ediciones geométricas detalladas del dibujo.
- Los DWG de entrenamiento residen en `storage/app/private/entrenamiento/`; deben seguir privados y no enviarse a proveedores de IA.

## Enfoques considerados

1. **Ajustar la plantilla del módulo 14.** Es el menor cambio, pero mantiene el principal límite: planos con diferente número de niveles, geometría o áreas libres se fuerzan a una sola referencia.
2. **Delegar el dibujo al modelo de IA.** Puede sugerir decisiones, pero no ofrece geometría CAD repetible ni una comparación fiable; además puede inventar dimensiones.
3. **Aprendizaje estructurado por pares (elegido).** Relacionar cada arquitectura con su estructura, extraer geometría y decisiones verificables, dibujar mediante el motor CAD determinista y usar la plantilla solo para los elementos gráficos que realmente sean comunes. Los ejemplos parecidos orientan; los casos no cubiertos se reportan como inciertos para el ingeniero. Las correcciones autorizadas alimentan el conjunto compartido.

Se elige la tercera ruta porque responde al objetivo de generalizar sin depender del módulo 14 ni confiar medidas a una respuesta libre del LLM.

## Flujo propuesto

1. **Ingesta y diagnóstico del conjunto:** emparejar arquitectura/estructura aunque los nombres varíen en mayúsculas, guiones, espacios o el singular/plural de “estructura”; separar grupos de proyecto y módulos mediante un manifiesto local; informar pares faltantes, duplicados y módulos que no se pudieron leer. Las planillas seguirán alimentando el metrado, no se tomarán como geometría.
2. **Aprendizaje verificable:** por par, leer vistas y niveles, ejes, columnas, muros/vanos y espacios abiertos de la arquitectura; comparar contra la estructura correspondiente para aprender ubicación, secciones y elementos dibujados. Normalizar escala y coordenadas a ejes/niveles, conservar procedencia del módulo y no inferir datos que no estén en los archivos.
3. **Propuesta y dibujo:** analizar todas las vistas relevantes, distinguir un nivel, varios niveles y áreas libres, y generar geometría desde la lectura actual y reglas/ejemplos estructurados. Reutilizar marcos, rótulos y detalles gráficos comunes, pero no copiar la geometría del módulo 14 como si fuera la del proyecto nuevo. Ante baja confianza o información ausente, indicar la duda y dejar la decisión al ingeniero en vez de fabricar un resultado.
4. **Corrección continua:** guardar las correcciones confirmadas del ingeniero como diferencias acotadas (elemento, rasgos geométricos necesarios, valor propuesto y valor corregido), evitando datos personales y DWG completos. Integrarlas solo a futuras propuestas; nunca convertir automáticamente una corrección particular en regla universal.
5. **Evaluación por módulos no vistos:** generar y comparar dejando fuera un módulo completo en cada iteración. Medir precisión, exhaustividad y F1 por grupo geométrico (ejes, columnas, muros/vanos y losas) con tolerancias explícitas; reportar fallos y cobertura. La meta inicial acordada es F1 macro ≥ 0.90. Como estos 15 módulos pertenecen a un mismo proyecto, esa prueba mide transferencia entre sus módulos, no generalización demostrada a proyectos nuevos. Al incorporar más proyectos, añadir una prueba que deje fuera el proyecto completo.

6. **Autonomía basada en evidencia:** para automatizar una costumbre aprendida o validar una regla derivada de casos, exigir respaldo de al menos tres grupos de proyecto independientes. Varios módulos del mismo grupo cuentan como un solo proyecto; con un único proyecto, sus casos pueden orientar y evaluar transferencia entre módulos, pero no bastan para automatizar decisiones particulares del despacho.

## Objetivos

- Incorporar los 15 pares válidos, incluidos módulos de un nivel, varios niveles y áreas abiertas presentes en los ejemplos.
- Evitar que un plano nuevo se resuelva copiando la geometría de un único módulo.
- Producir una propuesta CAD coherente con la arquitectura y explicar qué falta revisar.
- Permitir que correcciones técnicas mejoren el aprendizaje común con datos mínimos y auditables.
- Entregar una evaluación de generalización que no mida un módulo contra sí mismo.
- Permitir que cualquier miembro del equipo registre una corrección, pero exigir la aprobación del ingeniero técnico antes de incorporarla al conocimiento compartido.

## No objetivos y límites

- No entrenar ni ajustar pesos de un LLM con DWG del despacho.
- No prometer que el sistema resuelve tipologías ausentes del conjunto sin revisión.
- No sustituir cálculo, normas, estudio de suelos ni aprobación profesional. Todo plano es una propuesta para revisión y aprobación del ingeniero, incluso si cumple la meta geométrica del 90%; el 10% restante es margen de corrección, no permiso para omitir la revisión.
- No publicar ni transmitir los expedientes privados; no cambiar el proceso de despliegue de producción.
- No cambiar la UX de metrado salvo lo necesario para mantener compatibles sus resultados.

## Restricciones y decisiones para implementación

- Seguir el lector DWG/DXF, las primitivas CAD y las pruebas actuales; mantener el motor determinista para geometría.
- Procesar los DWG originales localmente en el equipo del ingeniero, manteniéndolos privados. Publicar mediante el despliegue habitual solo descriptores derivados y aprobados que no incluyan nombres personales, códigos de cliente ni geometría identificable innecesaria.
- El equipo puede registrar correcciones en el servidor privado; solo las aprobadas por el ingeniero técnico se exportan al aprendizaje común. La incorporación de DWG y la generación del artefacto aprendido se ejecutan localmente, sin daemon ni envío a proveedores externos.
- Mantener compatibilidad con los eventos de aprendizaje ya persistidos.
- El trabajo incluye validar el descubrimiento real de los 15 pares, generar el conjunto aprendido, integrar la geometría al flujo de dibujo y agregar pruebas pequeñas de lectura/entrenamiento y de generalización.
- El constructor puede elegir la representación interna de geometría, los umbrales de confianza y la forma de mostrar advertencias, siempre que los haga verificables y no convierta incertidumbre en éxito silencioso.

## Decisiones acordadas

- “90%” significa F1 macro de al menos 0.90 para geometría estructural coincidente, reportado por grupo de elementos y con tolerancias explícitas.
- El técnico usa el margen restante para evaluar y corregir. La revisión profesional sigue siendo obligatoria para todos los planos.
- Todo el equipo puede registrar correcciones; el ingeniero técnico las aprueba antes de compartirlas como conocimiento.
- Los DWG se procesan localmente. Solo el aprendizaje derivado y aprobado se incorpora al despliegue habitual.
- La validación inicial deja fuera un módulo cada vez, pero no se presentará como prueba de generalización entre proyectos hasta incorporar proyectos distintos.
