<?php

return [
    'queue_connection' => env('PAYMENTS_QUEUE_CONNECTION', 'payments'),
    // Explicit reference: unrelated annual products keep their configured price.
    'annual_bases' => ['plan-anual' => 'plan-mensual'],
    'processing' => [
        'enabled' => (bool) env('CULQI_INCLUDE_PROCESSING', true),
        'rate_percent' => env('CULQI_PROCESSING_PERCENT', '3.99'),
        'fixed_usd' => env('CULQI_PROCESSING_FIXED_USD', '0.20'),
        // Optional verified PEN equivalent from CulqiPanel; otherwise use the current exchange rate.
        'fixed_pen' => env('CULQI_PROCESSING_FIXED_PEN'),
    ],
];
