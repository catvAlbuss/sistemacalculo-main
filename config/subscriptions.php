<?php

// Ciclo de vida de las cuentas de clientes cuando su plan vence sin renovarse.
return [
    // Baja lógica automática (account_status = deleted; no se borran proyectos ni datos).
    'baja_automatica' => env('SUBSCRIPTIONS_BAJA_AUTOMATICA', true),
    // Días después del vencimiento del plan para dar de baja la cuenta (se avisa un día antes).
    'dias_para_baja' => (int) env('SUBSCRIPTIONS_DIAS_PARA_BAJA', 7),
    // El personal interno nunca se da de baja automáticamente.
    'roles_protegidos' => ['root', 'gerencia', 'asistente'],
];
