<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMail extends Command
{
    protected $signature = 'correo:probar {destino?}';

    protected $description = 'Envía un correo de prueba por el proveedor configurado; sin destino usa MAIL_ADMIN_ADDRESS';

    public function handle(): int
    {
        $to = $this->argument('destino') ?: config('mail.admin_email');
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $this->error('Indica un destinatario de correo válido.');
            return self::FAILURE;
        }
        $errors = app(\App\Services\MailConfiguration::class)->errors();
        if ($errors) {
            foreach ($errors as $error) { $this->error($error); }
            return self::FAILURE;
        }
        $this->line('Proveedor: '.config('mail.default').' · Remitente: '.config('mail.from.address'));
        try {
            Mail::raw('Prueba de envío de '.config('app.url').'. Confirma la recepción en la bandeja de entrada o spam.',
                fn ($message) => $message->to($to)->subject('Prueba de correo del sistema'));
        } catch (\Throwable) {
            $this->error('El proveedor no confirmó el envío. Revisa correo:verificar y los registros de Hostinger antes de reintentarlo.');

            return self::FAILURE;
        }
        $this->info('Aceptado por el proveedor. Comprueba que llegó a '.$to.' y que no está en spam.');

        return self::SUCCESS;
    }
}
