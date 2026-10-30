<?php

namespace Tests\Feature;

use App\Mail\PaymentReceipt;
use App\Models\PaymentEvent;
use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserSubscription;
use App\Services\Culqi;
use App\Services\PaymentTasks;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Compras simultáneas: un cliente nunca paga dos veces lo mismo y ningún cliente queda bloqueado para siempre.
class PaymentConcurrencyTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private Subscription $plan;

    protected function setUp(): void
    {
        parent::setUp();
        config(['payments.queue_connection' => 'payments', 'services.culqi.enabled' => true,
            'services.culqi.public_key' => 'pk_test_example', 'services.culqi.secret_key' => 'sk_test_example',
            'services.culqi.webhook_token' => str_repeat('a', 40)]);
        Queue::fake();
        Mail::fake();
        Http::preventStrayRequests();
        $this->withoutVite();
        Role::create(['name' => 'cliente', 'guard_name' => 'web']);
        $this->plan = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'type' => 'monthly', 'price' => 49.90, 'duration_days' => 30, 'is_active' => true]);
    }

    private function form(array $overrides = []): array
    {
        return array_merge(['checkout_key' => (string) Str::uuid(), 'subscription_plan_id' => $this->plan->id,
            'name' => 'Cliente', 'email' => 'cliente@example.com', 'phone' => '999999999', 'receipt_type' => 'boleta',
            'document_type' => 'DNI', 'document_number' => '00123456'], $overrides);
    }

    private function order(array $overrides = []): PaymentRequest
    {
        $this->post(route('planes.store'), $this->form($overrides))->assertSessionHasNoErrors();

        return PaymentRequest::latest('id')->firstOrFail();
    }

    /** Second order of the same customer, with different data so it is not merged with the first. */
    private function secondOrder(PaymentRequest $first): PaymentRequest
    {
        $this->actingAs($first->user);

        return $this->order(['phone' => '988888888']);
    }

    private function charge(PaymentRequest $payment, string $id = 'chr_test_first', string $token = 'tkn_test_first'): array
    {
        return ['object' => 'charge', 'id' => $id, 'amount' => 4990, 'currency_code' => 'PEN', 'capture' => true,
            'amount_refunded' => 0, 'source' => ['id' => $token], 'outcome' => ['type' => 'venta_exitosa'],
            'metadata' => ['application' => 'rizabal', 'payment_request_id' => (string) $payment->id, 'payment_reference' => $payment->token]];
    }

    /** Http::fake stacks and the first stub wins, so one stub reads the current scenario. */
    private function culqi(?array &$list): void
    {
        Http::fake(function () use (&$list) {
            if ($list === null) {
                throw new ConnectionException('timeout');
            }

            return Http::response(['data' => $list]);
        });
    }

    private function pay(PaymentRequest $payment, string $token = 'tkn_test_first'): array
    {
        return app(Culqi::class)->charge($payment, ['token' => $token, 'device_id' => 'device123']);
    }

    public function test_two_tabs_with_the_same_purchase_share_one_order(): void
    {
        $this->actingAs($this->order()->user);
        $first = $this->order();
        $second = $this->order();

        $this->assertSame($first->id, $second->id);
        $this->assertSame(2, PaymentRequest::count(), 'El pedido del registro y uno solo de las dos pestañas.');
    }

    public function test_a_paid_order_closes_the_forgotten_tab_and_it_cannot_charge(): void
    {
        $first = $this->order();
        $second = $this->secondOrder($first);
        $this->assertNotSame($first->id, $second->id);
        Http::fake(fn () => Http::response($this->charge($first)));

        $this->assertTrue($this->pay($first)['ok']);
        $this->assertSame('rejected', $second->fresh()->status);
        $this->assertSame('superseded', $second->fresh()->gateway_state);

        $result = $this->pay($second, 'tkn_test_other');
        $this->assertSame('closed', $result['code']);
        $this->assertCount(2, Http::recorded(), 'Solo el cargo y su consulta: la segunda pestaña no llega a Culqi.');
        $this->assertSame(1, UserSubscription::where('payment_method', 'culqi')->count());
    }

    public function test_a_lifetime_proposal_survives_the_payment_of_another_order(): void
    {
        $first = $this->order();
        $quote = $this->secondOrder($first);
        $quote->update(['plan_snapshot' => array_merge($quote->plan_snapshot, ['lifetime_quote' => ['valid_until' => now()->addDay()->toIso8601String()]])]);
        Http::fake(fn () => Http::response($this->charge($first)));

        $this->assertTrue($this->pay($first)['ok']);
        $this->assertSame('pending', $quote->fresh()->status);
    }

    public function test_a_customer_with_a_payment_in_flight_cannot_start_another(): void
    {
        $first = $this->order();
        $second = $this->secondOrder($first);
        $first->update(['gateway_state' => 'uncertain']);
        $first->user->forceFill(['payment_in_progress_id' => $first->id])->save();
        Http::fake();

        $this->assertFalse($this->pay($second, 'tkn_test_other')['ok']);
        Http::assertNothingSent();
    }

    public function test_abandoned_3ds_stops_blocking_and_its_stale_tab_cannot_charge(): void
    {
        $first = $this->order();
        $second = $this->secondOrder($first);
        $first->forceFill(['gateway_state' => 'authentication', 'updated_at' => now()->subHour()])->saveQuietly();
        $first->user->forceFill(['payment_in_progress_id' => $first->id])->save();
        Http::fake(fn () => Http::response($this->charge($second, 'chr_test_second', 'tkn_test_second')));

        $this->assertTrue($this->pay($second, 'tkn_test_second')['ok']);
        $this->assertSame('rejected', $first->fresh()->status);
        $this->assertSame('closed', $this->pay($first, 'tkn_test_stale')['code']);
        $this->assertSame(1, UserSubscription::where('payment_method', 'culqi')->count());
    }

    public function test_recent_3ds_keeps_its_reservation(): void
    {
        $first = $this->order();
        $second = $this->secondOrder($first);
        $first->update(['gateway_state' => 'authentication']);
        $first->user->forceFill(['payment_in_progress_id' => $first->id])->save();
        Http::fake();

        $this->assertFalse($this->pay($second, 'tkn_test_other')['ok']);
        $this->assertSame('authentication', $first->fresh()->gateway_state);
    }

    public function test_failure_after_the_debit_is_never_reported_as_declined_and_cannot_repeat(): void
    {
        $payment = $this->order();
        Http::fake(function ($request) use ($payment) {
            if ($request->method() === 'GET') {
                throw new \RuntimeException('Caída inesperada');
            }

            return Http::response($this->charge($payment));
        });

        $result = $this->pay($payment);
        $this->assertSame('uncertain', $result['code']);
        $this->assertSame('chr_test_first', $payment->fresh()->gateway_charge_id);
        $this->assertSame('uncertain', $this->pay($payment, 'tkn_test_other')['code']);
        $this->assertCount(1, Http::recorded(fn ($request) => $request->method() === 'POST'));
    }

    public function test_reconcile_recovers_a_timed_out_charge_without_a_known_id(): void
    {
        $payment = $this->order();
        $list = null;
        $this->culqi($list);
        $this->assertSame('uncertain', $this->pay($payment)['code']);
        $payment->forceFill(['updated_at' => now()->subMinutes(10)])->saveQuietly();

        $list = [
            ['id' => 'chr_test_other', 'metadata' => ['application' => 'rizabal', 'payment_request_id' => '999999']],
            $this->charge($payment),
        ];
        $this->artisan('payments:reconcile')->assertSuccessful();

        $this->assertSame('chr_test_first', $payment->fresh()->gateway_charge_id);
        $this->assertSame('pending', $payment->fresh()->status);
        $this->assertCount(0, Http::recorded(fn ($request) => $request->method() === 'POST'), 'Conciliar nunca crea un cargo.');
    }

    public function test_a_charge_that_is_not_found_only_raises_an_alert(): void
    {
        $payment = $this->order();
        $list = null;
        $this->culqi($list);
        $this->pay($payment);
        $payment->forceFill(['updated_at' => now()->subHour()])->saveQuietly();
        $list = [];

        $this->artisan('payments:reconcile')->assertSuccessful();

        $this->assertSame('uncertain', $payment->fresh()->gateway_state);
        $this->assertSame($payment->id, (int) $payment->user->fresh()->payment_in_progress_id);
        $this->assertTrue(PaymentEvent::where('kind', 'charge_not_found')->where('severity', 'warning')->exists());
    }

    public function test_an_unresolved_payment_closes_only_with_explicit_confirmation(): void
    {
        $payment = $this->order();
        $list = null;
        $this->culqi($list);
        $this->pay($payment);
        $payment->forceFill(['updated_at' => now()->subHour()])->saveQuietly();

        $list = [$this->charge($payment)];
        $this->artisan('payments:close-uncharged', ['payment' => $payment->id, '--confirm' => true])->assertFailed();
        $this->assertSame('pending', $payment->fresh()->status);

        $list = [];
        $this->artisan('payments:close-uncharged', ['payment' => $payment->id])->assertFailed();
        $this->assertSame('pending', $payment->fresh()->status);

        $this->artisan('payments:close-uncharged', ['payment' => $payment->id, '--confirm' => true])->assertSuccessful();
        $this->assertSame('rejected', $payment->fresh()->status);
        $this->assertNull($payment->user->fresh()->payment_in_progress_id);
    }

    public function test_the_database_refuses_a_second_coverage_for_one_charge(): void
    {
        $user = User::factory()->create();
        $row = ['subscription_plan_id' => $this->plan->id, 'status' => 'active', 'starts_at' => now(),
            'ends_at' => now()->addMonth(), 'amount_paid' => 49.90, 'payment_method' => 'culqi', 'transaction_id' => 'chr_test_first'];
        $user->subscriptions()->create($row);

        $this->expectException(UniqueConstraintViolationException::class);
        $user->subscriptions()->create($row);
    }

    public function test_a_confirmed_payment_sends_its_receipt_to_customer_and_admin_once_each(): void
    {
        config(['mail.admin_email' => 'admin@example.com', 'billing.issuer.ruc' => '20609317061']);
        $payment = $this->order();
        Http::fake(fn () => Http::response($this->charge($payment)));
        $this->assertTrue($this->pay($payment)['ok']);
        $tasks = app(PaymentTasks::class);
        $ids = PaymentTask::whereIn('kind', ['paid_client', 'paid_admin'])->pluck('id');
        $this->assertCount(2, $ids);

        $ids->each(fn ($id) => $tasks->run($id));
        $ids->each(fn ($id) => $tasks->run($id));

        Mail::assertSent(PaymentReceipt::class, 2);
        Mail::assertSent(PaymentReceipt::class, fn ($mail) => $mail->hasTo('cliente@example.com') && ! $mail->forAdmin);
        Mail::assertSent(PaymentReceipt::class, fn ($mail) => $mail->hasTo('admin@example.com') && $mail->forAdmin);

        $paid = $payment->fresh();
        $customer = (new PaymentReceipt($paid, $paid->purchasedPlan(), UserSubscription::firstOrFail()))->render();
        $this->assertStringContainsString($paid->receipt()->first()->number, $customer);
        $this->assertStringContainsString('20609317061', $customer);
        $this->assertStringContainsString('49.90', $customer);
        $this->assertStringContainsString('sin validez tributaria', $customer);
        $this->assertStringNotContainsString('tudominio', $customer);
        $this->assertStringNotContainsString('administracion/pagos', $customer);
        $admin = (new PaymentReceipt($paid, $paid->purchasedPlan(), UserSubscription::firstOrFail(), true))->render();
        $this->assertStringContainsString('administracion/pagos', $admin);
    }

    public function test_a_failed_admin_copy_does_not_touch_the_customer_receipt(): void
    {
        $payment = $this->order();
        Http::fake(fn () => Http::response($this->charge($payment)));
        $this->pay($payment);
        $client = PaymentTask::where('kind', 'paid_client')->firstOrFail();
        $admin = PaymentTask::where('kind', 'paid_admin')->firstOrFail();
        app(PaymentTasks::class)->run($client->id);
        Mail::shouldReceive('to')->once()->andThrow(new \RuntimeException('SMTP caído'));

        try {
            app(PaymentTasks::class)->run($admin->id);
            $this->fail('La tarea debía fallar.');
        } catch (\RuntimeException) {
        }

        $this->assertSame('completed', $client->fresh()->status);
        $this->assertSame('pending', $admin->fresh()->status);
    }

    public function test_a_double_submit_waits_for_the_first_and_receives_its_order(): void
    {
        $form = $this->form();
        $first = $this->order($form);
        $lock = Cache::lock('checkout:email:'.hash('sha256', $form['email']), 1);
        $this->assertTrue($lock->get());

        $this->post(route('planes.store'), $form)->assertSessionHasNoErrors()->assertRedirect();

        $this->assertSame(1, PaymentRequest::count());
        $this->assertSame($first->id, PaymentRequest::firstOrFail()->id);
    }
}
