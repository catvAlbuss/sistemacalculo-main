<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class SolicitudAdmin extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $plan;
    public $paymentRequest;
    protected $uploadedFile;

    /**
     * Create a new message instance.
     *
     * @param $user
     * @param $plan
     * @param $paymentRequest
     * @param $uploadedFile - UploadedFile object or null
     */
    public function __construct($user, $plan, $paymentRequest, $uploadedFile = null)
    {
        $this->user = $user;
        $this->plan = $plan;
        $this->paymentRequest = $paymentRequest;
        $this->uploadedFile = $uploadedFile;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $email = $this->view('planesUser.emails.payment-request-admin')
            ->subject('🔔 Nueva Solicitud de Pago - ' . $this->paymentRequest->name);

        // Preferir la copia persistente: el archivo temporal puede desaparecer
        // antes de completar un reintento de envío.
        $storedProof = $this->paymentRequest->payment_proof;

        if ($storedProof && Storage::disk('local')->exists($storedProof)) {
            $email->attach(Storage::disk('local')->path($storedProof), [
                'as' => 'comprobante_' . $this->paymentRequest->id . '.' . pathinfo($storedProof, PATHINFO_EXTENSION),
                'mime' => Storage::disk('local')->mimeType($storedProof),
            ]);
        } elseif ($this->uploadedFile && $this->uploadedFile->isValid()) {
            $email->attach(
                $this->uploadedFile->getRealPath(),
                [
                    'as' => 'comprobante_' . $this->paymentRequest->id . '.' . $this->uploadedFile->getClientOriginalExtension(),
                    'mime' => $this->uploadedFile->getMimeType(),
                ]
            );
        }

        return $email;
    }
}
