<?php

return [
    'version' => '2026-10-28-v4',
    'provider' => [
        'name' => env('BILLING_ISSUER_NAME', 'Rizabal & Asociados'),
        'ruc' => env('BILLING_ISSUER_RUC'),
        'address' => env('BILLING_ISSUER_ADDRESS'),
        'email' => env('LEGAL_CONTACT_EMAIL') ?: env('BILLING_ISSUER_EMAIL') ?: env('MAIL_ADMIN_ADDRESS'),
        'phone' => env('LEGAL_CONTACT_PHONE') ?: '51962999500',
    ],
    // Condiciones comerciales de referencia de Gespro, adaptadas a Rizabal.
    'refund_incident_days' => 7,
    'refund_response_business_days' => 5,
    'complaint_response_business_days' => 15,
    // Fechas adicionales YYYY-MM-DD aplicables al establecimiento.
    'additional_holidays' => [],
];
