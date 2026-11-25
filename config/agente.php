<?php

/*
|--------------------------------------------------------------------------
| Agente NovaCad: biblioteca de detalles del despacho
|--------------------------------------------------------------------------
|
| La biblioteca publicable (storage/app/private/agente/biblioteca-publicable/<tipo>.json) la
| arma `php artisan agente:publicar-biblioteca` a partir de la biblioteca privada extraída de
| los DWG del despacho: sin nombres de proyecto, coordenadas a milímetros y sin entidades
| repetidas. El panel del agente la pide a /software/etabs/agente/biblioteca/{tipo}.
|
*/

$roles = trim((string) env('AGENTE_BIBLIOTECA_ROLES', 'root,gerencia,asistente'));

return [
    // false: el panel no pide la biblioteca y genera los pórticos con su propio generador.
    'biblioteca_activa' => (bool) env('AGENTE_BIBLIOTECA_ACTIVA', false),

    // Roles que pueden descargar la biblioteca; ['*'] = cualquier usuario con sesión.
    'biblioteca_roles' => $roles === '*'
        ? ['*']
        : array_values(array_filter(array_map('trim', explode(',', $roles)))),

    // Lista blanca de tipos servibles (también los que publica el comando).
    'biblioteca_tipos' => [
        'portico', 'corte_cimiento', 'corte_otro', 'escalera',
        'cuadro_columnas', 'cuadro_columnetas', 'notas', 'techo', 'estandar',
    ],

    // Detalles estándar del despacho (estribos, empalmes, nudo, isométrico del aligerado…): se
    // usan aunque la biblioteca de pórticos esté apagada; llenan la lámina como la del ingeniero.
    'estandar_activa' => (bool) env('AGENTE_ESTANDAR_ACTIVA', true),

    // Rutas relativas al disco local (storage/app/private).
    'biblioteca_origen' => 'entrenamiento/biblioteca',
    'biblioteca_publicable' => 'agente/biblioteca-publicable',
];
