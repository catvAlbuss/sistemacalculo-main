# Eliminar el encierro del agente en un módulo

Diagnóstico: el navegador siempre carga una plantilla fija de dos hojas del
módulo XIV. El nombre del proyecto se elige por el texto más alto de todo el
dibujo; el contexto se invalida solo por nombre de archivo y el historial puede
seguir hablando de otro módulo. La memoria describe escalas y composición de
la referencia como universales, sin exponer las distintas láminas estudiadas.

Objetivo: documento y vista actuales como fuente de identidad, geometría y
cantidades; referencias identificadas con procedencia y sin asumir formatos,
número de hojas ni cargas de otro caso. Sin dependencias ni cambios de rutas/API.

- [x] Probar selección de módulos I, II, VII, XIV y XV; separar series con números
  repetidos y no elegir una referencia solo por cercanía geométrica.
- [x] Exportar perfiles de las referencias disponibles, con sus láminas, títulos
  y detalles, sin inventar formatos físicos ni cargas que no estén registrados.
- [x] Componer hojas desde el contenido actual y su marco, sin copiar el rótulo,
  datos, parámetros ni detalle fijo de la plantilla de un módulo distinto.
- [x] Priorizar el título de la vista seleccionada y el marco local; reiniciar
  memoria e historial al cambiar de documento, incluso con el mismo nombre.
- [x] Dar al modelo la identidad y procedencia actuales, las variantes aprendidas
  y el paquete realmente generado. Cantidades desde el modelo actual; cargas no
  confirmadas como pendientes, no valores heredados de un expediente.
- [x] Ejecutar regresiones de planos, metrados, memoria e interfaz; compilar.

Límite de los datos disponibles: los perfiles guardados contienen códigos y
títulos, pero no dimensiones físicas del papel ni distribuciones completas de
todos los módulos. La composición nueva se deriva del marco y contenidos del
plano; no se presenta como reproducción exacta de formatos originales ausentes.

## Evidencia

- Se revisaron los inventarios CAD locales de los 26 pares disponibles y se
  exportaron sus perfiles (serie, módulo, códigos, títulos, detalles y marcos
  candidatos). El papel físico y las cargas no se deducen de esos marcos.
- Se observaron marcos distintos: VI de la primera serie 29.2 x 20.5 y XV
  58.4 x 41 metros de dibujo; la mayoría usa 41 x 28.7. Se selecciona el marco
  repetido de una referencia identificada, nunca el de un vecino arbitrario.
- Prueba determinista sobre las 26 arquitecturas: 25 componen paquetes propios;
  XI de la segunda serie, sin columnas verificables, se detiene sin dibujar.
- Se registran cantidades realmente generadas, separadas de las históricas.
  No se añaden hojas vacías para igualar el inventario original.
- 13 regresiones específicas pasan, incluidas las 26 arquitecturas, romanos con
  l minúscula, contexto antiguo, vistas de otro módulo y formatos diferentes.
- Batería de lectura, chat, memoria, interfaz y paquete: 54 pruebas pasan y una
  se omite por ausencia de su archivo de referencia. Una batería adicional de
  datos técnicos y aprendizaje pasó antes del ajuste final de títulos (55 pasan,
  dos referencias ausentes); la última modificación de títulos se comprobó con
  las regresiones de lectura y módulos.
- Los detalles sin referencia adaptable quedan pendientes y se informan;
  no se copian cortes fijos de otro expediente ni se afirma una reproducción
  exacta del detalle original. Esto no sustituye una validación estructural.
- Seis pruebas adicionales de metrados y exportación Excel pasan, incluida la
  comparación con el módulo XIV real. Total de la última batería y metrados:
  60 pruebas pasan y una referencia ausente se omite.
- Compilación final: `npm.cmd run build`, código 0 (2m42s). Se verificó en el
  bundle la composición adaptativa, el contexto de paquete real y la ausencia
  de carga obligatoria del DXF fijo. Persisten avisos de dependencias CAD y tamaño.
