<?php

namespace App\Services;

class MailConfiguration
{
    public function errors(?string $mailer = null, array $visited = []): array
    {
        $mailer ??= config('mail.default');
        if (in_array($mailer, $visited, true)) {
            return ['La configuración de correo contiene un ciclo de transportes.'];
        }
        $visited[] = $mailer;
        $settings = config('mail.mailers.'.$mailer, []);
        $transport = $settings['transport'] ?? null;
        $errors = [];
        if (!filter_var(config('mail.from.address'), FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Configura MAIL_FROM_ADDRESS con el remitente real.';
        }
        if ($transport === 'hostinger') {
            if (empty($settings['token']) || empty($settings['mailbox_id'])
                || !preg_match('/^[A-Za-z0-9_-]+$/', (string) ($settings['mailbox_id'] ?? ''))) {
                $errors[] = 'Configura HOSTINGER_MAIL_API_TOKEN y HOSTINGER_MAILBOX_ID del buzón autorizado.';
            }
            if (!filter_var($settings['address'] ?? null, FILTER_VALIDATE_EMAIL)
                || strcasecmp((string) ($settings['address'] ?? ''), (string) config('mail.from.address')) !== 0) {
                $errors[] = 'HOSTINGER_MAILBOX_ADDRESS y MAIL_FROM_ADDRESS deben coincidir con el buzón autorizado.';
            }
        } elseif ($transport === 'smtp') {
            if (empty($settings['host']) || empty($settings['username']) || empty($settings['password'])) {
                $errors[] = 'Configura servidor, usuario y contraseña del correo SMTP seleccionado.';
            }
            if (str_contains(strtolower((string) ($settings['host'] ?? '')), 'hostinger.com')
                && strcasecmp((string) ($settings['username'] ?? ''), (string) config('mail.from.address')) !== 0) {
                $errors[] = 'En Hostinger SMTP, MAIL_FROM_ADDRESS debe coincidir con el usuario del buzón.';
            }
        } elseif (in_array($transport, ['failover', 'roundrobin'], true)) {
            $mailers = $settings['mailers'] ?? [];
            if (!$mailers) { $errors[] = 'Configura al menos un transporte de correo real.'; }
            foreach ($mailers as $child) {
                $errors = array_merge($errors, $this->errors($child, $visited));
            }
        } else {
            $errors[] = 'Selecciona correo real: MAIL_MAILER=hostinger o smtp. log/array no entregan mensajes.';
        }

        return array_values(array_unique($errors));
    }
}
