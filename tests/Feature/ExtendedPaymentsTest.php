<?php

namespace Tests\Feature;

use App\Models\ExchangeRate;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Culqi;
use App\Services\PlanPricing;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class ExtendedPaymentsTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private Subscription $plan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Http::preventStrayRequests();
        Mail::fake(); Queue::fake();
        config(['payments.queue_connection' => 'payments', 'services.culqi.enabled' => true,
            'services.culqi.public_key' => 'pk_test_example', 'services.culqi.secret_key' => 'sk_test_example',
            'services.culqi.webhook_token' => str_repeat('a', 40)]);
        Role::create(['name' => 'cliente', 'guard_name' => 'web']);
        Subscription::create(['name' => 'Prueba', 'slug' => 'trial', 'type' => 'trial', 'price' => 0, 'duration_days' => 15, 'is_active' => true]);
        $this->plan = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'type' => 'monthly', 'price' => 49.90, 'duration_days' => 30, 'is_active' => true]);
    }

    private function data(array $changes = []): array
    {
        return array_replace(['checkout_key' => (string) Str::uuid(), 'name' => 'Cliente', 'email' => 'cliente@example.test',
            'phone' => '999999999', 'subscription_plan_id' => $this->plan->id, 'receipt_type' => 'boleta',
            'document_type' => 'DNI', 'document_number' => '00123456', 'accept_terms' => '1'], $changes);
    }

    private function register(array $changes = []): PaymentRequest
    {
        $this->post(route('planes.store'), $this->data($changes))->assertSessionHasNoErrors()->assertRedirect();
        return PaymentRequest::latest('id')->firstOrFail();
    }

    private function charge(PaymentRequest $payment, string $id = 'chr_test_first'): array
    {
        return ['object' => 'charge', 'id' => $id, 'amount' => (int) round((float) ($payment->charge_amount ?? $payment->amount) * 100),
            'currency_code' => $payment->currency, 'capture' => true, 'amount_refunded' => 0, 'outcome' => ['type' => 'venta_exitosa'],
            'metadata' => ['application' => 'rizabal', 'payment_request_id' => (string) $payment->id, 'payment_reference' => $payment->token],
            'source' => ['id' => 'tkn_test_card']];
    }

    private function paidUser(): array
    {
        $user = User::factory()->create(['email' => 'cliente@example.test']);
        $old = Subscription::create(['name' => 'Básico', 'slug' => 'basic', 'type' => 'monthly', 'price' => 20, 'duration_days' => 30, 'is_active' => true]);
        $period = $user->subscriptions()->create(['subscription_plan_id' => $old->id, 'status' => 'active',
            'starts_at' => now()->subDays(15), 'ends_at' => now()->addDays(15), 'amount_paid' => 20, 'credit_basis' => 20]);
        $this->actingAs($user);
        return [$user, $period];
    }

    public function test_usd_is_frozen_and_server_uses_it_for_charge_verification_and_ticket(): void
    {
        ExchangeRate::create(['date' => today('America/Lima'), 'sell' => 3.75, 'source' => 'Prueba']);
        $payment = $this->register(['currency' => 'USD', 'amount' => 1, 'charge_amount' => 1]);
        $this->assertSame('49.90', $payment->amount);
        $this->assertSame('13.31', $payment->charge_amount);
        $this->get(\App\Http\Controllers\CulqiController::paymentUrl($payment))->assertOk()
            ->assertSee('Pagar con tarjeta en USD')->assertSee('"currency":"USD"', false);
        ExchangeRate::query()->update(['sell' => 4.0]);
        $charge = $this->charge($payment);
        Http::fake(['*/charges' => Http::response($charge), '*/charges/chr_test_first' => Http::response($charge)]);
        $this->assertTrue(app(Culqi::class)->charge($payment, ['token' => 'tkn_test_card', 'device_id' => 'device'])['ok']);
        Http::assertSent(fn ($request) => $request->method() === 'POST' && $request['amount'] === 1331 && $request['currency_code'] === 'USD');
        $this->assertSame('3.7500', $payment->fresh()->exchange_rate);
        $this->get($payment->receipt()->first()->ticketUrl())->assertOk()->assertSee('US$ 13.31')->assertSee('49.90');
    }

    public function test_missing_or_stale_exchange_rate_never_creates_a_usd_order(): void
    {
        $this->post(route('planes.store'), $this->data(['currency' => 'USD']))->assertSessionHasErrors('currency');
        ExchangeRate::create(['date' => today('America/Lima')->subDays(8), 'sell' => 3.75, 'source' => 'Prueba']);
        $this->post(route('planes.store'), $this->data(['currency' => 'USD']))->assertSessionHasErrors('currency');
        $this->assertDatabaseCount('payment_requests', 0);
        Http::assertNothingSent();
    }

    public function test_new_form_rejects_an_outdated_quote_or_missing_key_before_creating_an_order(): void
    {
        ExchangeRate::create(['date' => today('America/Lima'), 'sell' => 3.75, 'source' => 'Prueba']);
        $quote = app(PlanPricing::class)->purchaseQuote($this->plan, 'monthly', 1, 'USD');
        ExchangeRate::query()->update(['sell' => 3.8]);
        $this->post(route('planes.store'), $this->data(['currency' => 'USD', 'checkout_form_version' => '5', 'pricing_key' => $quote['pricing_key']]))
            ->assertSessionHasErrors('pricing_key');
        $this->post(route('planes.store'), $this->data(['checkout_form_version' => '5']))->assertSessionHasErrors('pricing_key');
        $this->assertDatabaseCount('payment_requests', 0);
    }

    public function test_yape_is_rejected_for_usd_and_currency_mismatch_never_activates(): void
    {
        ExchangeRate::create(['date' => today('America/Lima'), 'sell' => 3.75, 'source' => 'Prueba']);
        $payment = $this->register(['currency' => 'USD']);
        $this->assertFalse(app(Culqi::class)->charge($payment, ['token' => 'ype_test_yape'])['ok']);
        $charge = $this->charge($payment); $charge['currency_code'] = 'PEN';
        $this->assertFalse(app(Culqi::class)->confirm($payment, $charge));
        Http::assertNothingSent();
    }

    public function test_upgrade_credits_unused_and_future_periods_and_activates_only_once(): void
    {
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-10-22 17:00', 'UTC'));
        [$user, $old] = $this->paidUser();
        $future = $user->subscriptions()->create(['subscription_plan_id' => $old->subscription_plan_id, 'status' => 'active',
            'starts_at' => $old->ends_at, 'ends_at' => $old->ends_at->copy()->addDays(30), 'amount_paid' => 20, 'credit_basis' => 20]);
        $this->get(route('planes.register', ['plan' => $this->plan->id, 'purchase_mode' => 'upgrade']))->assertOk()
            ->assertSee('Saldo aplicado por tiempo no usado: S/ 30.00')->assertSee('name="purchase_mode" value="upgrade"', false);
        $payment = $this->register(['purchase_mode' => 'upgrade']);
        $this->assertSame('19.90', $payment->amount);
        $this->assertSame(30, $payment->plan_snapshot['credit']);
        $this->assertSame('active', $old->fresh()->status);
        $charge = $this->charge($payment);
        $this->assertTrue(app(Culqi::class)->confirm($payment, $charge));
        $this->assertTrue(app(Culqi::class)->confirm($payment, $charge));
        $this->assertSame('cancelled', $old->fresh()->status);
        $this->assertSame('cancelled', $future->fresh()->status);
        $new = $user->subscriptions()->where('transaction_id', $charge['id'])->sole();
        $this->assertEqualsWithDelta(now()->timestamp, $new->starts_at->timestamp, 1);
        $this->assertSame('49.90', $new->credit_basis);
        $this->assertTrue($user->fresh()->is_active);
    }

    public function test_changed_coverage_is_detected_before_any_upgrade_charge(): void
    {
        [$user, $old] = $this->paidUser();
        $payment = $this->register(['purchase_mode' => 'upgrade']);
        $old->update(['ends_at' => now()->addDays(40)]);
        $this->assertFalse(app(Culqi::class)->charge($payment, ['token' => 'tkn_test_card', 'device_id' => 'device'])['ok']);
        $this->assertSame('active', $old->fresh()->status);
        Http::assertNothingSent();
    }

    public function test_an_uncertain_payment_blocks_other_orders_of_that_customer(): void
    {
        $first = $this->register();
        $this->actingAs($first->user);
        $second = $this->register();
        Http::fake(['*' => Http::response([], 503)]);
        $this->assertFalse(app(Culqi::class)->charge($first, ['token' => 'tkn_test_card', 'device_id' => 'device'])['ok']);
        $this->assertFalse(app(Culqi::class)->charge($second, ['token' => 'tkn_test_card', 'device_id' => 'device'])['ok']);
        Http::assertSentCount(1);
        $this->assertSame($first->id, $first->user->fresh()->payment_in_progress_id);
    }

    public function test_downgrade_cannot_be_forced_into_an_immediate_upgrade(): void
    {
        [$user, $old] = $this->paidUser();
        $this->plan->update(['price' => 10]);
        $this->post(route('planes.store'), $this->data(['purchase_mode' => 'upgrade']))->assertSessionHasErrors('purchase_mode');
        $payment = $this->register();
        $this->assertTrue(app(Culqi::class)->confirm($payment, $this->charge($payment)));
        $new = $user->subscriptions()->where('transaction_id', 'chr_test_first')->firstOrFail();
        $this->assertTrue($new->starts_at->equalTo($old->ends_at));
    }

    public function test_exchange_command_validates_provider_date_and_does_not_repeat_a_paid_lookup(): void
    {
        config(['services.apiperu.token' => 'test_token']);
        $date = today('America/Lima')->toDateString();
        Http::fake(['*' => Http::response(['success' => true, 'data' => ['fecha_busqueda' => $date, 'fecha_sunat' => $date, 'venta' => 3.75]])]);
        $this->artisan('tipo-cambio:actualizar')->assertSuccessful();
        $this->artisan('tipo-cambio:actualizar')->assertSuccessful();
        Http::assertSentCount(1);
        $this->assertDatabaseCount('exchange_rates', 1);
        $this->artisan('tipo-cambio:actualizar', ['--venta' => '0', '--fuente' => 'Inválida'])->assertFailed();
        $this->assertSame('3.7500', ExchangeRate::first()->sell);
    }

    public function test_owner_can_close_an_uncharged_authentication_but_never_an_uncertain_charge(): void
    {
        $payment = $this->register();
        $this->actingAs($payment->user);
        $payment->update(['gateway_state' => 'authentication']);
        $payment->user->forceFill(['payment_in_progress_id' => $payment->id])->save();
        $this->post(route('payments.cancel-unpaid', $payment))->assertSessionHasNoErrors();
        $this->assertSame('rejected', $payment->fresh()->status);
        $this->assertNull($payment->user->fresh()->payment_in_progress_id);
        $second = $this->register();
        $second->update(['gateway_state' => 'uncertain']);
        $this->post(route('payments.cancel-unpaid', $second))->assertSessionHasErrors('payment');
        $this->assertSame('pending', $second->fresh()->status);
        Http::assertNothingSent();
    }

    public function test_downgrade_checks_saved_project_capacity_without_deleting_any_project(): void
    {
        [$user, $old] = $this->paidUser();
        $this->plan->update(['price' => 10, 'max_projects' => 1]);
        foreach (['Primero', 'Segundo'] as $name) {
            \App\Models\CadModel::create(['user_id' => $user->id, 'name' => $name, 'data' => '{}']);
        }
        $this->post(route('planes.store'), $this->data())->assertSessionHasErrors('subscription_plan_id');
        $this->assertDatabaseCount('cad_models', 2);
        $this->assertDatabaseCount('payment_requests', 0);
    }
}
