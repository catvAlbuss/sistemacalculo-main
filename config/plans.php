<?php

// Imagen representativa de cada plan en /planes (requisito de catálogo de Culqi: cada producto con su imagen).
// Clave: slug del plan. 'image' es una ruta de resources/img (se publica con Vite).
return [
    'images' => [
        'prueba-gratuita' => ['image' => 'resources/img/desingra/hojacalculopredim.png', 'alt' => 'Hoja de cálculo de predimensionamiento incluida en la prueba gratuita'],
        'plan-mensual' => ['image' => 'resources/img/calc/viga.png', 'alt' => 'Diseño de vigas de concreto armado'],
        'plan-trimestral' => ['image' => 'resources/img/calc/columna.png', 'alt' => 'Diseño de columnas de concreto armado'],
        'plan-semestral' => ['image' => 'resources/img/marketing/cimentacion.svg', 'alt' => 'Diseño de cimentaciones'],
        'plan-anual' => ['image' => 'resources/img/desingra/desingEstructuralview.png', 'alt' => 'Modelador estructural'],
        'de-por-vida' => ['image' => 'resources/img/desingra/predim.png', 'alt' => 'Predimensionamiento gráfico de elementos estructurales'],
    ],
    'default_image' => ['image' => 'resources/img/desingra/hojacalculapre.png', 'alt' => 'Herramientas de diseño estructural de Rizabal'],
];
