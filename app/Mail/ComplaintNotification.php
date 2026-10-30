<?php

namespace App\Mail;

use App\Models\Complaint;
use Illuminate\Mail\Mailable;

class ComplaintNotification extends Mailable
{
    public function __construct(public Complaint $complaint, public bool $answered = false)
    {
    }

    public function build()
    {
        return $this->subject(($this->answered ? 'Respuesta a su hoja ' : 'Hoja registrada ').$this->complaint->code)
            ->view('legal.complaint-email');
    }
}
