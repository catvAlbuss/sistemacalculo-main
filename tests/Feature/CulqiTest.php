<?php

namespace Tests\Feature;

use App\Http\Controllers\CulqiController;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Culqi;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class CulqiTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.culqi.enabled' => true, 'services.culqi.public_key' => 'pk_test_example',
            'services.culqi.secret_key' => 'sk_test_example', 'services.culqi.webhook_token' => str_repeat('a', 40),
        ]);
        Mail::fake();
        Http::preventStrayRequests();
        $this->withoutVite();
    }

    public function test_signup_with_culqi_requires_no_receipt_and_uses_a_signed_page(): void
    {
        Role::create(['name' => 'cliente', 'guard_name' => 'web']);
        Subscription::create(['name' => 'Prueba', 'slug' => 'prueba', 'price' => 0, 'duration_days' => 10, 'type' => 'trial', 'is_active' => true]);
        $plan = $this->plan();
        $this->get(route('planes.register', ['plan' => $plan->id]))->assertOk()->assertSee('Registrar y pagar');
        $response = $this->post(route('planes.store'), [
            'name' => 'Cliente', 'email' => 'cliente@example.com', 'phone' => '999999999',
            'subscription_plan_id' => $plan->id, 'payment_method' => 'culqi',
            'receipt_type' => 'boleta', 'document_type' => 'DNI', 'document_number' => '12345678',
        ])->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $this->assertSame('culqi', $payment->payment_method);
        $this->assertNull($payment->payment_proof);
        $this->assertStringContainsString('signature=', $response->headers->get('Location'));
        $this->get(route('culqi.pay', $payment))->assertForbidden();
        $this->get(CulqiController::paymentUrl($payment))->assertOk()->assertSee('Pagar con tarjeta o Yape');
        $this->get(URL::temporarySignedRoute('culqi.pay.legacy', now()->addDay(), ['paymentRequest' => $payment->id]))->assertOk();
        Http::assertNothingSent();
    }

    public function test_charge_uses_the_saved_amount_and_activates_only_once(): void
    {
        $payment = $this->payment();
        Http::fake(['*/charges' => Http::response($this->cargo($payment), 201), '*/charges/*' => Http::response($this->cargo($payment))]);
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_abc', 'amount' => 1])->assertOk()->assertJson(['ok' => true]);
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_other'])->assertOk();
        $this->webhook($payment)->assertOk();
        Http::assertSent(fn ($request) => $request->method() === 'POST' && $request['amount'] === 4990
            && $request['email'] === $payment->email && $request['currency_code'] === 'PEN'
            && $request->hasHeader('Authorization', 'Bearer sk_test_example'));
        $this->assertDatabaseHas('payment_requests', ['id' => $payment->id, 'status' => 'approved', 'gateway_state' => 'paid']);
        $this->assertDatabaseCount('user_subscriptions', 1);
        $this->assertDatabaseHas('user_subscriptions', ['payment_method' => 'culqi', 'amount_paid' => 49.90]);
        $this->assertNotNull($payment->user->fresh()->current_subscription_id);
    }

    public function test_yape_token_can_be_charged(): void
    {
        $payment = $this->payment();
        $cargo = $this->cargo($payment);
        $cargo['source']['id'] = 'ype_test_abc';
        Http::fake(['*' => Http::response($cargo)]);
        $this->postJson($this->chargeUrl($payment), ['token' => 'ype_test_abc'])->assertOk();
        Http::assertSent(fn ($request) => $request->method() === 'POST' && $request['source_id'] === 'ype_test_abc');
    }

    public function test_a_lost_response_blocks_retries_even_after_thirty_minutes(): void
    {
        $payment = $this->payment();
        $attempts = 0;
        $recovered = false;
        Http::fake(function () use (&$attempts, &$recovered, $payment) {
            $attempts++;
            if (!$recovered) {
                throw new ConnectionException('timeout');
            }

            return Http::response($this->cargo($payment));
        });
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_abc'])->assertStatus(422)->assertJson(['code' => 'uncertain']);
        $this->travel(60)->minutes();
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_other'])->assertStatus(422)->assertJson(['code' => 'uncertain']);
        $this->assertSame(1, $attempts);
        $this->assertDatabaseCount('user_subscriptions', 0);
        $recovered = true;
        $this->webhook($payment)->assertOk();
        $this->assertSame('approved', $payment->fresh()->status);
    }

    public function test_failed_lookup_never_activates_from_the_post_response(): void
    {
        $payment = $this->payment();
        Http::fake(['*/charges' => Http::response($this->cargo($payment), 201), '*/charges/*' => Http::response([], 503)]);
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_abc'])->assertStatus(422)->assertJson(['code' => 'uncertain']);
        $this->webhook($payment)->assertOk()->assertJson(['received' => true, 'queued' => true]);
        $this->assertDatabaseHas('payment_tasks', ['kind' => 'webhook', 'status' => 'pending', 'result' => 'retry_required']);
        $this->assertSame('pending', $payment->fresh()->status);
        $this->assertDatabaseCount('user_subscriptions', 0);
    }

    public function test_mismatched_declined_or_refunded_charges_never_activate(): void
    {
        $payment = $this->payment();
        foreach ([['amount' => 1], ['currency_code' => 'USD'], ['metadata' => ['payment_request_id' => '999', 'application' => 'rizabal']],
            ['outcome' => ['type' => 'venta_rechazada']], ['amount_refunded' => 1], ['capture' => false]] as $changes) {
            $this->assertFalse(app(Culqi::class)->confirm($payment, array_replace($this->cargo($payment), $changes)));
        }
        $this->assertDatabaseCount('user_subscriptions', 0);
    }

    public function test_3ds_requires_the_same_token_and_device_then_can_activate(): void
    {
        $payment = $this->payment();
        Http::fake([
            '*/charges' => Http::sequence()->push(['action_code' => 'REVIEW', 'user_message' => 'authenticate'], 200)->push($this->cargo($payment), 201),
            '*/charges/*' => Http::response($this->cargo($payment)),
        ]);
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_abc', 'device_id' => 'device123'])
            ->assertStatus(422)->assertJson(['code' => 'requires_3ds']);
        $auth = ['eci' => '05', 'xid' => 'abc', 'cavv' => 'abc', 'protocolVersion' => '2.1.0'];
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_other', 'device_id' => 'device123', 'authentication_3DS' => $auth])->assertStatus(422);
        Http::assertSentCount(1);
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_abc', 'device_id' => 'device123', 'authentication_3DS' => $auth])->assertOk();
        Http::assertSent(fn ($request) => $request->method() === 'POST' && ($request->data()['authentication_3DS'] ?? null) === $auth);
    }

    public function test_webhook_requires_its_secret_and_does_not_activate_manual_or_closed_payments(): void
    {
        $payment = $this->payment();
        $this->postJson('/webhooks/culqi/wrong', ['type' => 'charge.creation.succeeded'])->assertForbidden();
        Http::assertNothingSent();
        Http::fake(['*' => Http::response($this->cargo($payment))]);
        $payment->update(['payment_method' => 'yape']);
        $this->webhook($payment)->assertOk();
        $payment->update(['payment_method' => 'culqi', 'status' => 'rejected']);
        $this->webhook($payment)->assertOk();
        $this->assertDatabaseCount('user_subscriptions', 0);
    }

    public function test_disabled_or_mixed_keys_do_not_allow_charges(): void
    {
        $payment = $this->payment();
        config(['services.culqi.secret_key' => 'sk_live_example']);
        $this->assertFalse(app(Culqi::class)->enabled());
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_abc'])->assertStatus(503);
        config(['services.culqi.secret_key' => 'sk_test_example', 'services.culqi.enabled' => false]);
        $this->postJson($this->chargeUrl($payment), ['token' => 'tkn_test_abc'])->assertStatus(503);
        Http::assertNothingSent();
    }

    public function test_confirmed_payment_survives_a_mail_failure(): void
    {
        $payment = $this->payment();
        Mail::shouldReceive('send')->once()->andThrow(new \RuntimeException('SMTP unavailable'));
        $this->assertTrue(app(Culqi::class)->confirm($payment, $this->cargo($payment)));
        $this->assertSame('approved', $payment->fresh()->status);
        $this->assertDatabaseCount('user_subscriptions', 1);
    }

    public function test_verifier_is_offline_by_default_and_reports_invalid_configuration(): void
    {
        $this->artisan('culqi:verificar')->assertSuccessful();
        config(['services.culqi.public_key' => 'pk_live_example']);
        $this->artisan('culqi:verificar')->assertFailed();
        Http::assertNothingSent();
    }

    private function plan(): Subscription
    {
        return Subscription::create(['name' => 'Mensual', 'slug' => 'mensual', 'price' => 49.90, 'duration_days' => 30, 'type' => 'monthly', 'is_active' => true]);
    }

    private function payment(): PaymentRequest
    {
        return PaymentRequest::create([
            'user_id' => User::factory()->create()->id, 'subscription_plan_id' => $this->plan()->id,
            'name' => 'Cliente Prueba', 'email' => 'cliente@example.com', 'phone' => '+51999999999',
            'amount' => 49.90, 'status' => 'pending', 'token' => str_repeat('b', 32), 'payment_method' => 'culqi',
        ]);
    }

    private function cargo(PaymentRequest $payment): array
    {
        return ['object' => 'charge', 'id' => 'chr_test_abc', 'amount' => 4990, 'currency_code' => 'PEN',
            'source' => ['id' => 'tkn_test_abc'],
            'capture' => true, 'amount_refunded' => 0, 'outcome' => ['type' => 'venta_exitosa'],
            'metadata' => ['payment_request_id' => (string) $payment->id, 'payment_reference' => $payment->token, 'application' => 'rizabal']];
    }

    private function chargeUrl(PaymentRequest $payment): string
    {
        return URL::temporarySignedRoute('culqi.charge', now()->addDay(), ['paymentRequest' => $payment->id]);
    }

    private function webhook(PaymentRequest $payment)
    {
        return $this->postJson('/webhooks/culqi/'.str_repeat('a', 40), [
            'type' => 'charge.creation.succeeded', 'data' => json_encode(['id' => 'chr_test_abc']),
        ]);
    }
}
