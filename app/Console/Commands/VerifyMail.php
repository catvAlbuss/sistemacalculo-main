<?php

namespace App\Console\Commands;

use App\Services\MailConfiguration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class VerifyMail extends Command
{
    protected $signature = 'correo:verificar {--online : Validar token y buzón Hostinger sin enviar correos}';
    protected $description = 'Comprueba el proveedor de correo sin enviar mensajes ni mostrar credenciales';

    public function handle(MailConfiguration $configuration): int
    {
        $this->line('Proveedor: '.config('mail.default'));
        $errors = $configuration->errors();
        if (!filter_var(config('mail.admin_email'), FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Configura MAIL_ADMIN_ADDRESS para las notificaciones administrativas.';
        }
        foreach ($errors as $error) { $this->error($error); }
        $this->line('Cola de pagos: '.config('payments.queue_connection').' / payments. Requiere worker y scheduler activos.');
        if ($errors) { return self::FAILURE; }
        if ($this->option('online')) {
            if (config('mail.default') !== 'hostinger') {
                $this->error('--online está disponible para MAIL_MAILER=hostinger. Para SMTP usa correo:probar.');
                return self::FAILURE;
            }
            try {
                $response = Http::withToken(config('mail.mailers.hostinger.token'))->acceptJson()->connectTimeout(10)->timeout(20)
                    ->get('https://api.mail.hostinger.com/api/v1/me');
            } catch (\Throwable) {
                $this->error('No se pudo consultar Hostinger. No se enviaron mensajes.');
                return self::FAILURE;
            }
            if (!$response->successful()) {
                $this->error('Hostinger rechazó la consulta (HTTP '.$response->status().'). Revisa el token y sus permisos.');
                return self::FAILURE;
            }
            $mailboxes = $response->json('data.mailboxes');
            $matches = is_array($mailboxes) && collect($mailboxes)->contains(fn ($box) => is_array($box)
                && ($box['resourceId'] ?? '') === config('mail.mailers.hostinger.mailbox_id')
                && strcasecmp((string) ($box['address'] ?? ''), (string) config('mail.mailers.hostinger.address')) === 0);
            if (!$matches) {
                $this->error('El token no autoriza el ID y dirección de buzón configurados. Revisa HOSTINGER_MAILBOX_ID y HOSTINGER_MAILBOX_ADDRESS.');
                return self::FAILURE;
            }
            $this->info('Token y buzón Hostinger verificados sin enviar mensajes.');
        }
        $this->info('Configuración válida. No comprueba entrega en bandeja; usa correo:probar con un destinatario autorizado.');

        return self::SUCCESS;
    }
}
