<?php

$showcase = [
    'max_upload_mb' => 200,
    'max_duration_seconds' => 300,
    'ffmpeg' => env('FFMPEG_PATH', 'ffmpeg'),
    'ffprobe' => env('FFPROBE_PATH', 'ffprobe'),
    'queue_connection' => env('MEDIA_QUEUE_CONNECTION', 'media'),
    'queue' => 'media',
    'products' => [
        'arco-techo' => ['name' => 'Arco Techo', 'category' => 'Modelado', 'route' => 'calculadora.estudiante.arco_techo', 'image' => 'resources/img/desingra/hojacalculopredim.png', 'description' => 'Explora la geometría y los resultados de un arco para techo.', 'features' => ['Datos generales del arco', 'Parámetros geométricos', 'Resultados organizados de la hoja de cálculo']],
        'predim' => ['name' => 'Predim', 'category' => 'Modelado', 'route' => 'software.predimv2', 'image' => 'resources/img/desingra/predim.png', 'description' => 'Explora el predimensionamiento gráfico de tus elementos estructurales.', 'features' => ['Columnas, vigas, zapatas y losas', 'Parámetros de entrada en un entorno gráfico', 'Una primera aproximación para desarrollar tu proyecto']],
        'modelador-estructural' => ['name' => 'Modelador estructural', 'category' => 'Modelado', 'route' => 'software.etabs2', 'image' => 'resources/img/desingra/desingEstructuralview.png', 'description' => 'Organiza la geometría de tu proyecto en un entorno de modelado estructural.', 'features' => ['Geometría y elementos del modelo', 'Herramientas de edición del proyecto', 'Continuidad del trabajo desde tu cuenta']],
        'aligerados-v2' => ['name' => 'Aligerados 2.0', 'category' => 'Concreto armado', 'route' => 'software.aligerados-v2', 'image' => 'resources/img/calc/momentos.png', 'description' => 'Del ingreso de cargas al detalle de acero de tus viguetas.', 'features' => ['Geometría, cargas y diagramas de análisis', 'Diseño a flexión y cortante', 'Diámetros editables conectados con la gráfica y el reporte']],
        'vigas' => ['name' => 'Vigas de concreto', 'category' => 'Concreto armado', 'route' => 'calculadora.asistente.vigas-general', 'image' => 'resources/img/calc/viga.png', 'description' => 'Desarrolla el diseño de vigas y revisa la disposición de acero.', 'features' => ['Diseño a flexión', 'Combinaciones de acero predefinidas y propias', 'Revisión de resultados por posición']],
        'columnas' => ['name' => 'Columnas', 'category' => 'Concreto armado', 'route' => 'calculadora.asistente.columna-ii', 'image' => 'resources/img/calc/columna.png', 'description' => 'Revisa los parámetros y resultados del diseño de columnas.', 'features' => ['Datos de sección y materiales', 'Solicitaciones del elemento', 'Resultados organizados para su revisión']],
        'losas-macizas' => ['name' => 'Losas macizas', 'category' => 'Concreto armado', 'route' => 'calculadora.asistente.losas-macizas', 'image' => 'resources/img/calc/hc.png', 'description' => 'Organiza el cálculo y diseño de losas macizas.', 'features' => ['Geometría y materiales', 'Parámetros de carga', 'Resultados de diseño']],
        'escaleras' => ['name' => 'Escaleras', 'category' => 'Concreto armado', 'route' => 'calculadora.asistente.escaleras', 'image' => 'resources/img/calc/d2.png', 'description' => 'Desarrolla el cálculo de escaleras de concreto armado.', 'features' => ['Geometría de la escalera', 'Cargas y materiales', 'Revisión del diseño']],
        'cimentacion-v2' => ['name' => 'Cimentación 2.0', 'category' => 'Cimentaciones', 'route' => 'software.cimentacion-v2', 'image' => 'resources/img/calc/hc.png', 'description' => 'Revisa el análisis y los resultados de tus cimentaciones.', 'features' => ['Datos de la cimentación', 'Solicitaciones y parámetros del suelo', 'Resultados gráficos y numéricos']],
        'zapatas' => ['name' => 'Zapatas', 'category' => 'Cimentaciones', 'route' => 'calculadora.asistente.zapata-general', 'image' => 'resources/img/calc/d2.png', 'description' => 'Revisa los parámetros y el diseño de zapatas.', 'features' => ['Geometría y condiciones del suelo', 'Cargas de diseño', 'Resultados de verificación']],
        'zapata-combinada' => ['name' => 'Zapata combinada', 'category' => 'Cimentaciones', 'route' => 'calculadora.asistente.zapata-combinada', 'image' => 'resources/img/calc/hc.png', 'description' => 'Desarrolla cimentaciones compartidas entre elementos.', 'features' => ['Ubicación de columnas', 'Parámetros de geometría y suelo', 'Revisión de resultados']],
        'muros-contencion' => ['name' => 'Muros de contención', 'category' => 'Cimentaciones', 'route' => 'calculadora.asistente.muros-de-contencionv2', 'image' => 'resources/img/calc/d2.png', 'description' => 'Evalúa los parámetros y las verificaciones de un muro de contención.', 'features' => ['Geometría del muro', 'Condiciones del suelo y cargas', 'Verificaciones y diseño']],
        'albanileria' => ['name' => 'Muros de albañilería', 'category' => 'Concreto armado', 'route' => 'calculadora.asistente.muros-de-albanieria', 'image' => 'resources/img/calc/hc.png', 'description' => 'Organiza las verificaciones de tus muros de albañilería.', 'features' => ['Propiedades del muro', 'Solicitaciones y parámetros', 'Resultados de verificación']],
        'armaduras' => ['name' => 'Análisis de armaduras', 'category' => 'Análisis', 'route' => 'software.analisis-estructural-de-armaduras', 'image' => 'resources/img/desingra/desingEstructuralview.png', 'description' => 'Explora el comportamiento de estructuras de barras.', 'features' => ['Geometría de la armadura', 'Apoyos y cargas', 'Resultados del análisis']],
        'espectro-sismico' => ['name' => 'Espectro sísmico', 'category' => 'Análisis', 'route' => 'calculadora.asistente.espectro-sismico', 'image' => 'resources/img/calc/momentos.png', 'description' => 'Configura los parámetros para revisar el espectro de tu proyecto.', 'features' => ['Parámetros sísmicos de entrada', 'Representación del espectro', 'Resultados para revisión técnica']],
        'acero' => ['name' => 'Columnas de acero', 'category' => 'Acero y madera', 'route' => 'calculadora.asistente.columna-de-acero', 'image' => 'resources/img/calc/columna.png', 'description' => 'Revisa el diseño de columnas de acero.', 'features' => ['Datos del perfil', 'Material y solicitaciones', 'Verificación del elemento']],
        'madera' => ['name' => 'Diseño en madera', 'category' => 'Acero y madera', 'route' => 'calculadora.asistente.diseno-en-madera', 'image' => 'resources/img/desingra/desingEstructuralview.png', 'description' => 'Organiza la revisión de elementos estructurales de madera.', 'features' => ['Propiedades y geometría', 'Solicitaciones de diseño', 'Revisión a flexocompresión']],
    ],
];

$showcase['products']['aligerados-v2']['homepage_image'] = 'resources/img/marketing/aligerados.svg';
$showcase['products']['cimentacion-v2']['homepage_image'] = 'resources/img/marketing/cimentacion.svg';

// Additional calculation sheets share the same presentation and upload workflow.
foreach ([
    ['vigas-simple', 'Diseño de vigas', 'Concreto armado', 'calculadora.asistente.vigas'],
    ['losas-aligeradas', 'Losas aligeradas', 'Concreto armado', 'calculadora.asistente.losas-aligeradas'],
    ['cimiento-corrido', 'Cimiento corrido', 'Cimentaciones', 'calculadora.asistente.cimiento-corrido'],
    ['zapata-conectada', 'Zapata conectada', 'Cimentaciones', 'calculadora.asistente.zapata-conectada'],
    ['placas-l', 'Placas en L', 'Concreto armado', 'calculadora.asistente.placas-L'],
    ['cerco-perimetrico', 'Cerco perimétrico', 'Concreto armado', 'calculadora.asistente.cerco-perimetrico'],
    ['irregularidades', 'Irregularidades', 'Análisis', 'calculadora.asistente.irregularidades'],
    ['viga-t', 'Viga T', 'Concreto armado', 'calculadora.estudiante.cav2.viga-t'],
    ['metrados', 'Metrados', 'Hojas de cálculo', 'calculadora.estudiante.cav2.metrados'],
    ['escaleras-cav2', 'Escaleras · CA V2', 'Hojas de cálculo', 'calculadora.estudiante.cav2.escaleras'],
    ['zapatas-cav2', 'Zapatas · CA V2', 'Hojas de cálculo', 'calculadora.estudiante.cav2.zapatas'],
    ['combinacion-cargas', 'Combinación de cargas', 'Hojas de cálculo', 'calculadora.estudiante.cav2.combinacion-de-cargas'],
    ['viguetas', 'Viguetas', 'Hojas de cálculo', 'calculadora.estudiante.cav2.viguetas'],
    ['voladitos', 'Voladitos', 'Hojas de cálculo', 'calculadora.estudiante.cav2.voladitos'],
    ['deflexiones', 'Verificación de deflexiones', 'Hojas de cálculo', 'calculadora.estudiante.cav2.verificacion-de-deflexiones'],
    ['aligerados-cav2', 'Aligerados · CA V2', 'Hojas de cálculo', 'calculadora.estudiante.cav2.aligerados'],
    ['distribucion-acero', 'Distribución del acero', 'Hojas de cálculo', 'calculadora.estudiante.cav2.distribucion-del-acero'],
    ['vigas-continuas', 'Vigas continuas', 'Hojas de cálculo', 'calculadora.estudiante.cav2.vigas-continuas'],
    ['esfuerzos-suelos', 'Distribución de esfuerzos', 'Cimentaciones', 'software.suelos.distribucion-de-esfuerzos'],
    ['anclaje', 'Longitud de anclaje', 'Verificaciones', 'software.anclaje-v1'],
    ['bases-dinamicas', 'Bases dinámicas', 'Verificaciones', 'software.base-dinamica-v1'],
    ['estribos-columna-placa', 'Estribos en columna y placa', 'Verificaciones', 'software.estribo-columna-placa-v1'],
    ['estribos-placa', 'Estribos en placas', 'Verificaciones', 'software.estribo-placa-v1'],
    ['predimensionamiento-viga', 'Predimensionamiento de vigas', 'Verificaciones', 'software.predim-viga-v1'],
    ['verificacion-viga', 'Verificación de vigas', 'Verificaciones', 'software.verificacion-viga-v1'],
    ['correas-madera', 'Correas de madera', 'Acero y madera', 'calculadora.asistente.diseno-en-madera.correas'],
    ['madera-flexocompresion', 'Madera a flexocompresión', 'Acero y madera', 'calculadora.asistente.diseno-en-madera.flexo-compresion'],
    ['madera-compresion', 'Madera a compresión', 'Acero y madera', 'calculadora.asistente.diseno-en-madera.compresion'],
    ['madera-traccion', 'Madera a tracción', 'Acero y madera', 'calculadora.asistente.diseno-en-madera.traccion'],
    ['madera-flexotraccion', 'Madera a flexotracción', 'Acero y madera', 'calculadora.asistente.diseno-en-madera.flexo-traccion'],
    ['acero-compresion', 'Acero a compresión', 'Acero y madera', 'calculadora.asistente.diseno-en-acero.compresion'],
    ['acero-traccion', 'Acero a tracción', 'Acero y madera', 'calculadora.asistente.diseno-en-acero.traccion'],
] as [$slug, $name, $category, $route]) {
    $showcase['products'][$slug] = [
        'name' => $name, 'category' => $category, 'route' => $route,
        'image' => 'resources/img/calc/hc.png',
        'description' => 'Desarrolla tu revisión de '.mb_strtolower($name).' en una herramienta dedicada.',
        'features' => ['Ingreso de los parámetros del elemento', 'Cálculo desde tu navegador', 'Resultados organizados para revisión técnica'],
    ];
}

return $showcase;
