<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'culqi' => [
        'enabled' => (bool) env('CULQI_ENABLED', false),
        'public_key' => env('CULQI_PUBLIC_KEY'),
        'secret_key' => env('CULQI_SECRET_KEY'),
        'webhook_token' => env('CULQI_WEBHOOK_TOKEN'),
        // Revisión de Culqi: permite llaves de integración en producción solo para las cuentas listadas.
        'review_mode' => (bool) env('CULQI_REVIEW_MODE', false),
        'reviewer_emails' => array_values(array_filter(array_map(fn ($e) => strtolower(trim($e)), explode(',', (string) env('CULQI_REVIEWER_EMAILS', ''))))),
        'api_url' => 'https://api.culqi.com/v2',
    ],
    'apiperu' => [
        'token' => env('API_PERU_TOKEN'),
    ],
    'python_backend' => [
        'url' => env('PYTHON_BACKEND_URL', 'http://127.0.0.1:5001'),
        // Carpeta del motor CLI en producción Linux (venv + cli_entry.py).
        // null → PythonEngineController usa base_path('python-backend').
        'engine_home' => env('PYTHON_ENGINE_HOME'),
    ],

];
