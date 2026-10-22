<?php

namespace App\Jobs;

use App\Services\PaymentTasks;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPaymentTask implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;
    public int $timeout = 45;

    public function __construct(public int $taskId)
    {
        $this->onConnection(config('payments.queue_connection'))->onQueue('payments');
    }

    public function backoff(): array
    {
        return [30, 120, 300, 600];
    }

    public function handle(PaymentTasks $tasks): void
    {
        $tasks->run($this->taskId);
    }
}
