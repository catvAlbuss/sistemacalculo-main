<?php

// Funciones terminadas que se publican por etapas. Apagadas se ocultan sin borrar código ni datos.
return [
    // Versión 2.0: respaldos y restauración de proyectos.
    'project_backups' => (bool) env('PROJECT_BACKUPS_ENABLED', false),
];
