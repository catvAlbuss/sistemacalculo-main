# Revisión del catálogo de programas

La presentación pública utiliza una sola estructura para los 49 programas: descripción de aplicación, entradas, resultados, vista o demostración, proceso de trabajo y programas relacionados. Los datos descriptivos están en `config/program-details.php` y se contrastaron con los nombres de entradas y secciones de las hojas existentes. No se han validado fórmulas ni cambiado resultados de cálculo en esta revisión.

El contenido ocupa el 90 % del ancho disponible. En escritorio se distribuyen 9 columnas para la demostración y 3 para la ficha técnica. En tablet y móvil se apilan las secciones. El menú comparte los márgenes de las fichas. Botones principales, secundarios, filtros y enlaces utilizan el mismo azul corporativo en temas claro y oscuro.

## Hallazgos en las hojas

- **Diseño en madera** apuntaba a `hcalculo.diseno_en_madera_flexocompresion`, una vista inexistente. Se corrigió hacia `hcalculo.diseno_en_madera.flexo_compresion`, conservando la URL y el nombre de ruta.
- **Voladitos (CA V2)** contiene parámetros de suelo, fricción, cohesión y presión del terreno. Su ficha describe ese contenido, en lugar de atribuirle un cálculo genérico de voladizos.
- **Aligerados (CA V2)** incluye secciones de albañilería y cargas de muros, además de sus requisitos de sistema. Antes de promocionar verificaciones específicas de losas conviene revisar el contenido de `resources/views/hcalculo/CAV2/admAligerados.blade.php`. La ficha actual mantiene un alcance general de la hoja y no anuncia resultados que no se hayan confirmado.

Para ampliar el catálogo, agregar sus datos particulares en `config/program-details.php`. La prueba `test_each_program_has_specific_inputs_outputs_and_a_resolvable_calculation_view` comprueba que cada programa publicado tenga una ficha propia y un destino de cálculo existente.
