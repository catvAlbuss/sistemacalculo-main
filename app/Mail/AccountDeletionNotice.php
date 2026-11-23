<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;

// Aviso un día antes de la baja automática de la cuenta por plan vencido sin renovar.
class AccountDeletionNotice extends Mailable
{
    public function __construct(public User $user, public string $vencio, public string $baja) {}

    public function build()
    {
        return $this->subject('Mañana se dará de baja su cuenta')->view('planesUser.emails.account-deletion-notice');
    }
}
