<?php

namespace Tests\Feature;

use App\Models\PaymentTask;
use App\Services\PaymentMailRecovery;
use App\Services\PaymentTasks;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class PaymentQueueBacklogTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['payments.queue_connection' => 'payments']);
        Mail::fake(); Http::preventStrayRequests();
    }

    private function task(): PaymentTask
    {
        return PaymentTask::create(['task_key' => hash('sha256', (string) Str::uuid()),
            'kind' => 'renewal_reminder', 'payload' => ['subscription_id' => 999999, 'ends_at' => today()->toDateString()],
            'status' => 'pending', 'available_at' => now()]);
    }

    public function test_scheduler_does_not_accumulate_duplicate_jobs_while_the_worker_is_stopped(): void
    {
        $task = $this->task();
        foreach ([0, 20, 40, 2880] as $minutes) {
            $this->travelTo($task->created_at->copy()->addMinutes($minutes)->addSecond());
            $this->artisan('payments:dispatch-pending')->assertSuccessful();
        }
        $this->assertSame(1, DB::table('jobs')->where('queue', 'payments')->count());
        $this->assertSame('pending', $task->fresh()->status);
        Mail::assertNothingSent(); Http::assertNothingSent();
    }

    public function test_different_tasks_remain_independently_dispatchable(): void
    {
        $first = $this->task(); $second = $this->task();
        app(PaymentTasks::class)->dispatch($first);
        app(PaymentTasks::class)->dispatch($second);
        $this->assertSame(2, DB::table('jobs')->where('queue', 'payments')->count());
    }

    public function test_processing_releases_the_unique_lock_so_a_failed_task_can_be_recovered(): void
    {
        $task = $this->task();
        app(PaymentTasks::class)->dispatch($task);
        $this->artisan('queue:work payments --queue=payments --once --tries=1')->assertSuccessful();
        $this->assertSame('completed', $task->fresh()->status);
        $this->assertSame(0, DB::table('jobs')->count());
        $task->update(['status' => 'failed', 'payload' => ['subscription_id' => 999999, 'ends_at' => today()->toDateString()]]);
        $this->assertTrue(app(PaymentMailRecovery::class)->retry($task->fresh()));
        $this->assertSame(1, DB::table('jobs')->where('queue', 'payments')->count());
        Mail::assertNothingSent(); Http::assertNothingSent();
    }
}
