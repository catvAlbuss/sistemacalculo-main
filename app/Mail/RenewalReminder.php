<?php

namespace App\Mail;

use App\Models\UserSubscription;
use Illuminate\Mail\Mailable;

class RenewalReminder extends Mailable
{
    public function __construct(public UserSubscription $subscription) {}

    public function build()
    {
        return $this->subject('Tu plan está por vencer')->view('planesUser.emails.renewal-reminder');
    }
}
