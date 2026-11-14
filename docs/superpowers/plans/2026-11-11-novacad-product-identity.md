# Identidad de producto y avisos de terceros de NovaCad

Conservar la vista CAD, el motor y sus funciones. Diferenciar la presentación de NovaCad con nombres propios de pestañas/grupos, iconos originales, tratamiento visual y un identificador de producto en la barra de estado.

Crear «Acerca de NovaCad» con identidad de Rizabal, funciones propias y créditos/licencias accesibles. Registrar el comando `about` mediante la API pública, conservando y restaurando el comando original al desinstalar la integración. No modificar vendor ni falsificar la autoría del motor o el registro de una licencia comercial.

Generar con el build un inventario de paquetes incluidos y copias íntegras de sus avisos/licencias. Incluir explícitamente los paquetes de workers copiados. Mostrar versiones y enlaces a esos archivos desde los créditos.

Hallazgo: cad-viewer/cad-simple-viewer 1.7.6 son MIT. libredwg-converter 3.15.17 y libredwg-web 0.7.17 declaran GPL-3.0. Los avisos y el cambio visual no certifican cumplimiento de GPL ni sustituyen la revisión de código fuente correspondiente y condiciones de redistribución. Documentar este punto antes de producción; no retirar DWG ni atribuciones silenciosamente.

Validar comando Acerca de desde la interfaz real, créditos descargables, pestañas e iconos, modo claro/oscuro, móvil y continuidad de dibujo/cimentación/resultados. Compilar y verificar los archivos publicados.
