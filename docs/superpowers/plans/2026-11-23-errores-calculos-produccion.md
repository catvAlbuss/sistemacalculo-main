# Corrección de errores de cálculo en producción

Objetivo: impedir los errores de sintaxis de vectores incompletos y el acceso a combinaciones inexistentes sin cambiar la API ni las fórmulas.

Diagnóstico: fuerzas_cortantes recorre seis columnas aunque un tramo produce dos y dos tramos producen cuatro. ValidateLegacyCalculation elimina separadores vacíos al contar elementos y permite entradas como [0.1,,]. Los fallos MySQL del registro corresponden a conexión en el hosting; no se dispone de acceso remoto para verificarlos. No hay errores Culqi en el adjunto.

1. Añadir regresiones PHP que rechacen celdas vacías y conserven vectores válidos.
2. Añadir prueba optativa con el motor Octave real para uno, dos y tres tramos y confirmar el fallo previo.
3. Validar la sintaxis de los vectores y recorrer size(MOMENT, 2).
4. Ejecutar regresiones, pruebas de pagos y comprobación de sintaxis. No modificar .env ni el hosting.

Caso adicional confirmado: zapatas2 inicia FBA como escalar; si no hay columnas interiores, falla al leer FBA(3,2). Reproducir con un polígono y una columna exterior, inicializar la matriz 3x4 en cero (igual que el acumulador PHP) y comprobar también una columna interior.
