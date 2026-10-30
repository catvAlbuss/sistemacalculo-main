<?php

namespace App\Mail;

use App\Models\UserSubscription;
use Illuminate\Mail\Mailable;

class RenewalReminder extends Mailable
{
    public function __construct(public UserSubscription $subscription) {}

    public function build()
    {
        return $this->subject('Aviso de vencimiento de su plan')->view('planesUser.emails.renewal-reminder');
    }
}
