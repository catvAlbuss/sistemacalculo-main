<?php

namespace Tests\Feature;

use App\Mail\SolicitudCliente;
use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Culqi;
use App\Services\PaymentTasks;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class PaymentMailRecoveryTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private PaymentRequest $payment;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp(); $this->withoutVite(); Mail::fake(); Queue::fake(); Http::preventStrayRequests();
        foreach (['cliente', 'root'] as $role) { Role::findOrCreate($role, 'web'); }
        config(['services.culqi.enabled' => true, 'services.culqi.public_key' => 'pk_test_example',
            'services.culqi.secret_key' => 'sk_test_example', 'services.culqi.webhook_token' => str_repeat('a', 40)]);
        $plan = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'type' => 'monthly',
            'price' => 50, 'duration_days' => 30, 'is_active' => true]);
        $this->post(route('planes.store'), ['checkout_key' => (string) Str::uuid(), 'subscription_plan_id' => $plan->id,
            'name' => 'Cliente', 'email' => 'cliente@example.com', 'phone' => '999999999',
            'receipt_type' => 'boleta', 'document_type' => 'DNI', 'document_number' => '12345678'])
            ->assertSessionHasNoErrors();
        $this->payment = PaymentRequest::firstOrFail();
        $this->admin = User::factory()->create(); $this->admin->assignRole('root');
        config(['payments.queue_connection' => 'payments']);
        Queue::fake();
    }

    public function test_only_an_administrator_can_retry_a_failed_mail_and_repeated_posts_do_not_duplicate_it(): void
    {
        $task = PaymentTask::where('kind', 'signup_client')->firstOrFail();
        $task->update(['status' => 'failed', 'attempts' => 5]);
        $url = route('payments.admin.retry-mail', [$this->payment, $task]);
        $this->actingAs($this->payment->user)->post($url)->assertForbidden();
        $this->actingAs($this->admin)->post($url)->assertSessionHasNoErrors();
        $this->post($url);
        $this->assertSame('pending', $task->fresh()->status);
        $this->assertSame(0, $task->fresh()->attempts);
        $this->assertSame('pending', $this->payment->fresh()->status);
        Queue::assertPushed(\App\Jobs\ProcessPaymentTask::class, 1);
        Http::assertNothingSent();
    }

    public function test_receipt_resends_are_idempotent_and_keep_the_original_ticket_and_subscription(): void
    {
        $charge = ['object' => 'charge', 'id' => 'chr_test_mail', 'amount' => 5000, 'currency_code' => 'PEN',
            'capture' => true, 'amount_refunded' => 0, 'outcome' => ['type' => 'venta_exitosa'],
            'metadata' => ['application' => 'rizabal', 'payment_request_id' => (string) $this->payment->id,
                'payment_reference' => $this->payment->token]];
        $this->assertTrue(app(Culqi::class)->confirm($this->payment, $charge));
        $ticket = $this->payment->receipt()->firstOrFail()->id;
        $data = ['kind' => 'paid_client', 'resend_key' => (string) Str::uuid()];
        $url = route('payments.admin.resend-mail', $this->payment);
        $this->actingAs($this->admin)->post($url, $data)->assertSessionHasNoErrors();
        $this->post($url, $data)->assertSessionHasNoErrors();
        $this->assertSame(2, PaymentTask::where('kind', 'paid_client')->count());
        $this->assertSame($ticket, $this->payment->receipt()->firstOrFail()->id);
        $this->assertSame(1, $this->payment->user->subscriptions()->count());
        Http::assertNothingSent();
    }

    public function test_unpaid_orders_cannot_resend_a_receipt_or_retry_gateway_tasks(): void
    {
        $this->actingAs($this->admin)->post(route('payments.admin.resend-mail', $this->payment),
            ['kind' => 'paid_client', 'resend_key' => (string) Str::uuid()])->assertSessionHasErrors('kind');
        $task = app(PaymentTasks::class)->create('reconcile', $this->payment, ['charge_id' => 'chr_test_mail']);
        $task->update(['status' => 'failed']);
        $this->post(route('payments.admin.retry-mail', [$this->payment, $task]))->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_password_links_can_be_reissued_to_the_current_account_address_without_plain_passwords(): void
    {
        $this->payment->user->update(['email' => 'actual@example.com']);
        $this->actingAs($this->admin)->post(route('payments.admin.resend-mail', $this->payment),
            ['kind' => 'access_client', 'resend_key' => (string) Str::uuid()])->assertSessionHasNoErrors();
        $task = PaymentTask::where('kind', 'access_client')->firstOrFail();
        app(PaymentTasks::class)->run($task->id);
        Mail::assertSent(\App\Mail\AccountAccessLink::class, fn ($mail) => $mail->hasTo('actual@example.com')
            && str_contains($mail->activationUrl, '/reset-password/') && !isset($mail->password));
        $this->assertSame('completed', $task->fresh()->status);
    }

    public function test_recent_failed_mail_command_previews_then_recovers_only_mail(): void
    {
        $task = PaymentTask::where('kind', 'signup_client')->firstOrFail();
        $task->update(['status' => 'failed', 'attempts' => 5]);
        $gateway = app(PaymentTasks::class)->create('reconcile', $this->payment, ['charge_id' => 'chr_test_mail']);
        $gateway->update(['status' => 'failed']);
        $this->artisan('payments:retry-mails')->assertSuccessful();
        $this->assertSame('failed', $task->fresh()->status);
        $this->artisan('payments:retry-mails --apply')->assertSuccessful();
        $this->assertSame('pending', $task->fresh()->status);
        $this->assertSame('failed', $gateway->fresh()->status);
        Http::assertNothingSent();
    }

    public function test_production_does_not_mark_log_mail_as_successfully_sent(): void
    {
        $this->app['env'] = 'production'; config(['mail.default' => 'log']);
        $task = PaymentTask::where('kind', 'signup_client')->firstOrFail();
        try { app(PaymentTasks::class)->run($task->id); $this->fail('Log transport completed real mail.'); }
        catch (\RuntimeException $exception) { $this->assertStringNotContainsString('password', $exception->getMessage()); }
        $this->assertSame('pending', $task->fresh()->status);
        $this->assertSame('mail_configuration', $task->fresh()->result);
    }

    public function test_uncertain_hostinger_delivery_stops_automatic_retries_and_requires_review(): void
    {
        $task = PaymentTask::where('kind', 'signup_client')->firstOrFail();
        Mail::shouldReceive('to')->once()->andThrow(new \App\Mail\Transport\HostingerMailException(
            'Respuesta perdida.', 'delivery_uncertain'));
        try { app(PaymentTasks::class)->run($task->id); $this->fail('Uncertain delivery was completed.'); }
        catch (\RuntimeException) {}
        $this->assertSame('failed', $task->fresh()->status);
        $this->assertSame('delivery_uncertain', $task->fresh()->result);
        $this->artisan('payments:retry-mails --apply')->assertSuccessful();
        $this->assertSame('failed', $task->fresh()->status);
    }
}
