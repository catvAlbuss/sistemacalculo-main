<?php

return [
    // Los precios publicados ya incluyen IGV; el desglose nunca agrega un recargo.
    'igv_rate' => (float) env('BILLING_IGV_RATE', 18),
    'issuer' => [
        'legal_name' => env('BILLING_ISSUER_NAME', 'Rizabal & Asociados'),
        'ruc' => env('BILLING_ISSUER_RUC'),
        'address' => env('BILLING_ISSUER_ADDRESS'),
        'ubigeo' => env('BILLING_ISSUER_UBIGEO'),
        'email' => env('BILLING_ISSUER_EMAIL'),
    ],
];
