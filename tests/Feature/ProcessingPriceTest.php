<?php

namespace Tests\Feature;

use App\Models\ExchangeRate;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Services\Culqi;
use App\Services\PlanPricing;
use App\Services\ProcessingPrice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class ProcessingPriceTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private Subscription $plan;

    protected function setUp(): void
    {
        parent::setUp(); $this->withoutVite(); Http::preventStrayRequests(); Mail::fake(); Queue::fake();
        config(['payments.processing.enabled' => true, 'payments.processing.rate_percent' => '3.99',
            'payments.processing.fixed_usd' => '0.20', 'payments.processing.fixed_pen' => '0.80',
            'services.culqi.enabled' => true, 'services.culqi.public_key' => 'pk_test_example',
            'services.culqi.secret_key' => 'sk_test_example', 'services.culqi.webhook_token' => str_repeat('a', 40)]);
        Role::create(['name' => 'cliente', 'guard_name' => 'web']);
        $this->plan = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'type' => 'monthly',
            'price' => 49.90, 'duration_days' => 30, 'is_active' => true])->fresh();
    }

    private function data(array $changes = []): array
    {
        return array_replace(['checkout_key' => (string) Str::uuid(), 'subscription_plan_id' => $this->plan->id,
            'name' => 'Cliente', 'email' => 'cliente@example.test', 'phone' => '999999999',
            'receipt_type' => 'boleta', 'document_type' => 'DNI', 'document_number' => '12345678', 'accept_terms' => '1'], $changes);
    }

    public function test_gross_up_covers_percentage_on_the_final_charge_and_fixed_fee(): void
    {
        $quote = app(PlanPricing::class)->purchaseQuote($this->plan, null, 1);
        $this->assertSame(52.81, $quote['total']);
        $this->assertSame(49.90, $quote['plan_total']);
        $this->assertSame(2.91, $quote['processing_fee']);
        $this->assertSame(49.90, $quote['processing']['estimated_net']);
        $this->assertSame($quote['total'], round($quote['subtotal'] + $quote['tax_amount'], 2));
        foreach ([1, 299, 4990, 10000, 56886, 1000000] as $net) {
            $result = app(ProcessingPrice::class)->quote($net, 'PEN');
            $estimated = $result['gross_cents'] - (int) round($result['gross_cents'] * .0399) - 80;
            $this->assertGreaterThanOrEqual($net, $estimated);
            $this->assertLessThanOrEqual($net + 1, $estimated);
        }
    }

    public function test_current_exchange_rate_converts_the_fixed_usd_charge_without_affecting_free_access(): void
    {
        config(['payments.processing.fixed_pen' => null]);
        ExchangeRate::create(['date' => today('America/Lima'), 'sell' => 3.45, 'source' => 'Fixture SBS']);
        $quote = app(PlanPricing::class)->purchaseQuote($this->plan, null, 1);
        $this->assertSame(.69, $quote['processing']['fixed_amount']);
        $this->assertSame(52.70, $quote['total']);
        $this->assertGreaterThanOrEqual(49.90, $quote['processing']['estimated_net']);
        $this->assertSame(3.45, $quote['processing']['exchange_rate']);
        $usd = app(PlanPricing::class)->purchaseQuote($this->plan, null, 1, 'USD');
        $this->assertSame(.20, $usd['processing']['fixed_amount']);
        $this->assertSame('USD', $usd['processing']['currency']);
        $this->assertGreaterThanOrEqual(49.90, $usd['processing']['estimated_net'] * 3.45);
    }

    public function test_catalog_and_registration_show_the_same_final_price(): void
    {
        $this->get(route('landing.plans'))->assertOk()->assertSee('52.81')->assertSee('procesamiento incluidos');
        $this->get(route('planes.register', ['plan' => $this->plan->id]))->assertOk()
            ->assertSee('52.81')->assertSee('Procesamiento incluido en el precio')->assertSee('2.91');
        $annual = app(PlanPricing::class)->purchaseQuote($this->plan, 'yearly', 1);
        $this->assertSame(568.86, $annual['plan_total']);
        $this->assertSame(29.94, $annual['discount']);
        $this->assertGreaterThanOrEqual(568.86, $annual['processing']['estimated_net']);
    }

    public function test_missing_or_stale_fixed_fee_conversion_blocks_paid_orders_but_not_trials(): void
    {
        config(['payments.processing.fixed_pen' => null]);
        ExchangeRate::create(['date' => today('America/Lima')->subDays(8), 'sell' => 3.45, 'source' => 'Caducado']);
        $this->get(route('landing.plans'))->assertOk()->assertSee('Precio por confirmar');
        $this->post(route('planes.store'), $this->data())->assertSessionHasErrors('processing');
        $this->assertDatabaseCount('payment_requests', 0);
        $trial = Subscription::create(['name' => 'Prueba', 'slug' => 'trial', 'type' => 'trial', 'price' => 0, 'duration_days' => 15, 'is_active' => true]);
        $this->post(route('planes.store'), $this->data(['subscription_plan_id' => $trial->id]))->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $this->assertSame('free', $payment->payment_method);
        $this->assertSame('0.00', $payment->charge_amount);
        $this->assertNull($payment->plan_snapshot['processing']);
        Http::assertNothingSent();
    }

    public function test_checkout_freezes_price_and_gateway_cannot_use_client_supplied_or_new_config_values(): void
    {
        $quote = app(PlanPricing::class)->purchaseQuote($this->plan, null, 1);
        $this->post(route('planes.store'), $this->data(['checkout_form_version' => '5', 'pricing_key' => $quote['pricing_key'],
            'amount' => 1, 'charge_amount' => 1, 'processing_fee' => 0]))->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $this->assertSame('52.81', $payment->amount);
        $this->assertSame(49.90, $payment->plan_snapshot['plan_total']);
        config(['payments.processing.rate_percent' => '20', 'payments.processing.fixed_pen' => '5']);
        $charge = ['object' => 'charge', 'id' => 'chr_test_frozen', 'amount' => 5281, 'currency_code' => 'PEN',
            'capture' => true, 'amount_refunded' => 0, 'outcome' => ['type' => 'venta_exitosa'],
            'source' => ['id' => 'tkn_test_card'], 'metadata' => ['application' => 'rizabal',
                'payment_request_id' => (string) $payment->id, 'payment_reference' => $payment->token]];
        Http::fake(['*/charges' => Http::response($charge, 201), '*/charges/*' => Http::response($charge)]);
        $this->assertTrue(app(Culqi::class)->charge($payment, ['token' => 'tkn_test_card', 'device_id' => 'device'])['ok']);
        Http::assertSent(fn ($request) => $request->method() === 'POST' && $request['amount'] === 5281);
        $subscription = $payment->user->subscriptions()->firstOrFail();
        $this->assertSame('49.90', $subscription->credit_basis);
        $this->assertSame('52.81', $subscription->amount_paid);
        $this->assertSame('52.81', $payment->fresh()->receipt->total);
    }

    public function test_invalid_processing_percentage_fails_without_a_charge(): void
    {
        config(['payments.processing.rate_percent' => '99.9999']);
        $this->expectException(ValidationException::class);
        app(ProcessingPrice::class)->quote(4990, 'PEN');
    }

    public function test_upgrade_applies_credit_to_the_service_before_calculating_processing(): void
    {
        $user = \App\Models\User::factory()->create();
        $old = Subscription::create(['name' => 'Básico', 'slug' => 'basic', 'type' => 'monthly', 'price' => 20,
            'duration_days' => 30, 'is_active' => true]);
        $user->subscriptions()->create(['subscription_plan_id' => $old->id, 'status' => 'active',
            'starts_at' => now()->subDays(15), 'ends_at' => now()->addDays(15), 'amount_paid' => 22, 'credit_basis' => 20]);
        $quote = app(PlanPricing::class)->purchaseQuote($this->plan, 'monthly', 1, 'PEN', $user, 'upgrade');
        $this->assertSame(10, $quote['credit']);
        $this->assertSame(49.9, $quote['plan_total']);
        $this->assertSame(39.9, $quote['service_total']);
        $this->assertSame(39.9, $quote['processing']['target_net']);
        $this->assertGreaterThanOrEqual(39.9, $quote['processing']['estimated_net']);
    }
}
