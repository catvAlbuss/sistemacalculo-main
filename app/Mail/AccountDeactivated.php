<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;

// Confirmación de la baja automática de la cuenta (baja lógica: se puede reactivar).
class AccountDeactivated extends Mailable
{
    public function __construct(public User $user, public int $dias) {}

    public function build()
    {
        return $this->subject('Su cuenta fue dada de baja')->view('planesUser.emails.account-deactivated');
    }
}
