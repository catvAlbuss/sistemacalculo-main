<?php

$primaryHost = env('MAIL_HOST', 'smtp.mailgun.org');
$primaryPassword = env('MAIL_PASSWORD');
$backupHost = env('MAIL_BACKUP_HOST');
$backupPassword = env('MAIL_BACKUP_PASSWORD');

// Google muestra las contraseñas de aplicación separadas en grupos de cuatro.
// Symfony las envía literalmente, por lo que Gmail rechaza las que conservan espacios.
if (is_string($primaryPassword) && str_contains(strtolower((string) $primaryHost), 'gmail.com')) {
    $primaryPassword = preg_replace('/\s+/', '', $primaryPassword);
}

if (is_string($backupPassword) && str_contains(strtolower((string) $backupHost), 'gmail.com')) {
    $backupPassword = preg_replace('/\s+/', '', $backupPassword);
}

$failoverMailers = ['smtp'];

if (filled($backupHost)) {
    $failoverMailers[] = 'smtp_backup';
}

return [

    /*
    |--------------------------------------------------------------------------
    | Default Mailer
    |--------------------------------------------------------------------------
    |
    | This option controls the default mailer that is used to send all email
    | messages unless another mailer is explicitly specified when sending
    | the message. All additional mailers can be configured within the
    | "mailers" array. Examples of each type of mailer are provided.
    |
    */

    'default' => env('MAIL_MAILER', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Mailer Configurations
    |--------------------------------------------------------------------------
    |
    | Here you may configure all of the mailers used by your application plus
    | their respective settings. Several examples have been configured for
    | you and you are free to add your own as your application requires.
    |
    | Laravel supports a variety of mail "transport" drivers that can be used
    | when delivering an email. You may specify which one you're using for
    | your mailers below. You may also add additional mailers if needed.
    |
    | Supported: "smtp", "sendmail", "mailgun", "ses", "ses-v2",
    |            "postmark", "resend", "log", "array",
    |            "failover", "roundrobin"
    |
    */

    'mailers' => [

        'smtp' => [
            'transport' => 'smtp',
            'url' => env('MAIL_URL'),
            'host' => $primaryHost,
            'port' => env('MAIL_PORT', 587),
            'encryption' => env('MAIL_ENCRYPTION', 'tls'),
            'username' => env('MAIL_USERNAME'),
            'password' => $primaryPassword,
            'timeout' => env('MAIL_TIMEOUT', 10),
            'local_domain' => env('MAIL_EHLO_DOMAIN'),
        ],

        'smtp_backup' => [
            'transport' => 'smtp',
            'host' => $backupHost,
            'port' => env('MAIL_BACKUP_PORT', 587),
            'encryption' => env('MAIL_BACKUP_ENCRYPTION', 'tls'),
            'username' => env('MAIL_BACKUP_USERNAME'),
            'password' => $backupPassword,
            'timeout' => env('MAIL_BACKUP_TIMEOUT', 10),
            'local_domain' => env('MAIL_BACKUP_EHLO_DOMAIN'),
        ],

        'ses' => [
            'transport' => 'ses',
        ],

        'postmark' => [
            'transport' => 'postmark',
            // 'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
            // 'client' => [
            //     'timeout' => 5,
            // ],
        ],

        'resend' => [
            'transport' => 'resend',
        ],

        'sendmail' => [
            'transport' => 'sendmail',
            'path' => env('MAIL_SENDMAIL_PATH', '/usr/sbin/sendmail -bs -i'),
        ],

        'log' => [
            'transport' => 'log',
            'channel' => env('MAIL_LOG_CHANNEL'),
        ],

        'array' => [
            'transport' => 'array',
        ],

        'failover' => [
            'transport' => 'failover',
            'mailers' => $failoverMailers,
        ],

        'roundrobin' => [
            'transport' => 'roundrobin',
            'mailers' => [
                'ses',
                'postmark',
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Global "From" Address
    |--------------------------------------------------------------------------
    |
    | You may wish for all emails sent by your application to be sent from
    | the same address. Here you may specify a name and address that is
    | used globally for all emails that are sent by your application.
    |
    */

    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
        'name' => env('MAIL_FROM_NAME', 'Example'),
    ],

    'admin_email' => env('MAIL_ADMIN_ADDRESS', env('MAIL_FROM_ADDRESS', 'hello@example.com')),
    'delivery_attempts' => (int) env('MAIL_DELIVERY_ATTEMPTS', 2),
    'retry_delay_ms' => (int) env('MAIL_RETRY_DELAY_MS', 250),

];
