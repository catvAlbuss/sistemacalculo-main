<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMail extends Command
{
    protected $signature = 'correo:probar {destino?}';

    protected $description = 'Envía un correo de prueba por el SMTP configurado; sin destino usa MAIL_ADMIN_ADDRESS';

    public function handle(): int
    {
        $to = $this->argument('destino') ?: config('mail.admin_email');
        $this->line('Remitente: '.config('mail.from.address').' · Servidor: '.config('mail.mailers.smtp.host').':'.config('mail.mailers.smtp.port'));
        try {
            Mail::raw('Prueba de envío de '.config('app.url').'. Si lo recibes en la bandeja de entrada, el SMTP funciona.',
                fn ($message) => $message->to($to)->subject('Prueba de correo del sistema'));
        } catch (\Throwable $exception) {
            $this->error('No se pudo enviar: '.$exception->getMessage());

            return self::FAILURE;
        }
        $this->info('Aceptado por el servidor SMTP. Comprueba que llegó a '.$to.' y que no está en spam.');

        return self::SUCCESS;
    }
}
