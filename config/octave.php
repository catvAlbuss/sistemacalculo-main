<?php

// Motor Octave de las hojas antiguas (OctavePlotController). Se elige solo según el sistema:
//   Linux (servidor): paquete snap de Octave en snap_path.
//   Windows (local):  octave-cli.exe nativo si existe; si no, el mismo paquete Linux ejecutado con WSL.
return [
    'version' => env('OCTAVE_VERSION', '8.0.0'),

    // Carpeta con las funciones .m.
    'matlab_path' => env('OCTAVE_MATLAB_PATH', public_path('assets/matlab')),

    // Servidor Linux: paquete snap de Octave.
    'snap_path' => env('OCTAVE_SNAP_PATH', '/home/u112634954/domains/ryaie.com/octave'),

    // Windows: octave-cli.exe nativo (opcional). Sin valor se buscan las instalaciones habituales.
    'windows_cli' => env('OCTAVE_WINDOWS_CLI_PATH', env('OCTAVE_CLI_PATH')),

    // Windows sin Octave nativo: paquete Linux local ejecutado dentro de WSL.
    'wsl' => [
        'enabled' => (bool) env('OCTAVE_USE_WSL', true),
        'distro' => env('OCTAVE_WSL_DISTRO'),
        'snap_path' => env('OCTAVE_WSL_SNAP_PATH', 'C:\\laragon\\www\\octave'),
    ],
];
