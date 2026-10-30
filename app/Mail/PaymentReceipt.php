<?php

namespace App\Mail;

use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\UserSubscription;
use Illuminate\Mail\Mailable;

// Comprobante del pago confirmado: el cuerpo lo contiene completo, así sigue vigente aunque caduque el enlace.
class PaymentReceipt extends Mailable
{
    private const LINK_DAYS = 90;

    public function __construct(
        public PaymentRequest $payment,
        public Subscription $plan,
        public UserSubscription $subscription,
        public bool $forAdmin = false,
    ) {}

    public function build()
    {
        $receipt = $this->payment->receipt()->first();
        $reference = $receipt?->number ?? 'pago '.$this->payment->id;
        $replyTo = $this->forAdmin ? $this->payment->email : config('legal.provider.email');
        if ($replyTo) {
            $this->replyTo($replyTo);
        }

        return $this->subject($this->forAdmin
                ? 'Pago recibido '.$reference.' - '.$this->payment->name
                : 'Comprobante de pago '.$reference)
            ->view('planesUser.emails.payment-confirmed', [
                'receipt' => $receipt,
                'printUrl' => $receipt?->ticketUrl(self::LINK_DAYS),
                'adminUrl' => $this->forAdmin ? route('payments.admin.show', $this->payment) : null,
            ]);
    }
}
