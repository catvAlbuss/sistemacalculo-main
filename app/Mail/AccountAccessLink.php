<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class AccountAccessLink extends Mailable
{
    public function __construct(public string $name, public string $activationUrl) {}

    public function build()
    {
        return $this->subject('Crear o restablecer tu contraseña')->view('emails.password-reset', [
            'name' => $this->name, 'minutes' => config('auth.passwords.users.expire'), 'url' => $this->activationUrl,
        ]);
    }
}
