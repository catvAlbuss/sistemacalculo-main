<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

// Solicitud de cotización de la web: llega al administrador con el plano adjunto.
class FormularioEnviado extends Mailable
{
    public function __construct(public array $datos)
    {
    }

    public function build()
    {
        return $this->subject('Solicitud de cotización - '.$this->datos['nombre'])
            ->replyTo($this->datos['email'], $this->datos['nombre'])
            ->view('emails.formulario')
            ->attachFromStorage($this->datos['archivo_path'], 'plano.'.pathinfo($this->datos['archivo_path'], PATHINFO_EXTENSION));
    }
}
