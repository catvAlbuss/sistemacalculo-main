<?php

namespace App\Mail;

use App\Models\UserSubscription;
use Illuminate\Mail\Mailable;

class RenewalReminder extends Mailable
{
    // dias: días que faltan (el último aviso, 1, explica la desactivación y la baja posterior).
    public function __construct(public UserSubscription $subscription, public int $dias = 0) {}

    public function build()
    {
        return $this->subject($this->dias === 1 ? 'Mañana vence su plan' : 'Aviso de vencimiento de su plan')->view('planesUser.emails.renewal-reminder');
    }
}
