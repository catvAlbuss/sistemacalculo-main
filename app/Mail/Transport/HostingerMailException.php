<?php

namespace App\Mail\Transport;

use Symfony\Component\Mailer\Exception\TransportException;

class HostingerMailException extends TransportException
{
    public function __construct(string $message, public readonly string $deliveryResult, public readonly bool $retryable = false)
    {
        parent::__construct($message);
    }
}
