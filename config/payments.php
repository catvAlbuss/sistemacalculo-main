<?php

return [
    'queue_connection' => env('PAYMENTS_QUEUE_CONNECTION', 'payments'),
    // Explicit reference: unrelated annual products keep their configured price.
    'annual_bases' => ['plan-anual' => 'plan-mensual'],
];
