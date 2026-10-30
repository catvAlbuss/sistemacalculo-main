<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SolicitudCliente extends Mailable
{
    use Queueable, SerializesModels;

    public $user, $plan, $paymentRequest, $password;
    public ?string $activationUrl;

    public function __construct($user, $plan, $paymentRequest, $password = null, ?string $activationUrl = null)
    {
        // Asignación de datos a propiedades públicas resources/views/planesUser/emails/payment-request-client.blade.php
        $this->user = $user;
        $this->plan = $plan;
        $this->paymentRequest = $paymentRequest;
        $this->password = $password;
        $this->activationUrl = $activationUrl;
    }

    public function build()
    {
        return $this->view('planesUser.emails.payment-request-client') // Usas esta vista
            ->subject('Solicitud registrada - '.$this->plan->name);
    }
}
