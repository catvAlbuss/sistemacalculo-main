<?php

namespace Tests\Feature;

use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Culqi;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class TrialAccessTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private Subscription $trial;
    private Subscription $paid;

    protected function setUp(): void
    {
        parent::setUp(); $this->withoutVite(); Http::preventStrayRequests(); Mail::fake(); Queue::fake();
        config(['payments.queue_connection' => 'payments', 'services.culqi.enabled' => false]);
        foreach (['cliente', 'root'] as $role) Role::create(['name' => $role, 'guard_name' => 'web']);
        $this->trial = Subscription::create(['name' => 'Prueba', 'slug' => 'trial', 'price' => 0, 'duration_days' => 10, 'type' => 'trial', 'is_active' => true]);
        $this->paid = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'price' => 49.9, 'duration_days' => 30, 'type' => 'monthly', 'is_active' => true]);
    }

    private function data(array $changes = []): array
    {
        return array_replace(['checkout_key' => (string) Str::uuid(), 'subscription_plan_id' => $this->trial->id,
            'name' => 'Cliente', 'email' => 'cliente@example.test', 'phone' => '999999999', 'accept_terms' => '1'], $changes);
    }

    private function signup(): PaymentRequest
    {
        $this->post(route('planes.store'), $this->data())->assertSessionHasNoErrors()->assertRedirect(route('landing.success'));
        return PaymentRequest::firstOrFail();
    }

    public function test_trial_is_confirmed_for_exactly_five_days_without_culqi_commission_or_receipt(): void
    {
        $data = $this->data();
        $this->post(route('planes.store'), $data)->assertSessionHasNoErrors()->assertSessionHas('registration.duration', '5 días');
        $this->post(route('planes.store'), $data)->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $subscription = $payment->user->subscriptions()->firstOrFail();
        $this->assertSame(5, (int) $subscription->starts_at->diffInDays($subscription->ends_at));
        $this->assertSame('approved', $payment->status);
        $this->assertSame('free', $payment->payment_method);
        $this->assertSame('0.00', $payment->charge_amount);
        $this->assertNull($payment->receipt); $this->assertNull($payment->gateway_charge_id);
        $this->assertDatabaseCount('payment_requests', 1); $this->assertDatabaseCount('user_subscriptions', 1);
        $this->get(route('planes.register', ['plan' => $this->trial->id]))->assertOk()
            ->assertSee('Sin comisión')->assertDontSee('id="receipt-type"', false)->assertDontSee('id="plan-processing"', false);
        Http::assertNothingSent();
    }

    public function test_an_existing_or_expired_trial_cannot_be_renewed_with_another_free_registration(): void
    {
        $payment = $this->signup(); $this->actingAs($payment->user);
        $this->post(route('planes.store'), $this->data())->assertSessionHasErrors('subscription_plan_id');
        $this->travel(6)->days();
        $this->post(route('planes.store'), $this->data())->assertSessionHasErrors('subscription_plan_id');
        $this->get(route('planes.register', ['plan' => $this->trial->id]))->assertRedirect(route('plans.mine'));
        $this->assertDatabaseCount('user_subscriptions', 1); $this->assertDatabaseCount('payment_requests', 1);
    }

    public function test_expiry_blocks_direct_tools_and_api_calls_but_keeps_account_and_purchase_available(): void
    {
        $payment = $this->signup(); $user = $payment->user; $this->actingAs($user);
        $end = $user->subscriptions()->firstOrFail()->ends_at;
        $this->travelTo($end->copy()->subSecond());
        $this->get(route('calculadora.estudiante.cav2.voladitos'))->assertOk();
        $this->get(route('calculadora.asistente.vigas-general'))->assertOk();
        $this->get(route('software.aligerados-v2'))->assertOk();
        $this->get(route('calculadora.asistente.memoria-calculo'))->assertForbidden();
        $this->travelTo($end);
        $this->get(route('calculadora.estudiante.cav2.voladitos'))->assertRedirect(route('plans.mine'));
        $this->get('/calculadora/asistente/memoria-descriptiva/portada')->assertRedirect(route('plans.mine'));
        $this->postJson('/software/etabs/model/autosave', [])->assertForbidden()->assertJsonPath('code', 'subscription_required');
        $this->postJson('/api/backend/column-shear', [])->assertForbidden();
        $this->postJson('/api/opensees/analyze', [])->assertForbidden();
        foreach (['plans.mine', 'plans.catalog', 'profile', 'backups.index', 'account.support'] as $route) $this->get(route($route))->assertOk();
        $this->get(route('plans.mine'))->assertSee('contrata un plan pagado');
        $this->assertAuthenticatedAs($user); Http::assertNothingSent();
        $this->get(route('predim_v2'))->assertRedirect(route('plans.mine'));
        $this->get(route('calculadora.estudiante.arco_techo'))->assertRedirect(route('plans.mine'));
    }

    public function test_paid_signup_does_not_grant_trial_and_access_returns_only_after_payment_confirmation(): void
    {
        config(['services.culqi.enabled' => true, 'services.culqi.public_key' => 'pk_test_example',
            'services.culqi.secret_key' => 'sk_test_example', 'services.culqi.webhook_token' => str_repeat('a', 40)]);
        $this->post(route('planes.store'), $this->data(['subscription_plan_id' => $this->paid->id,
            'receipt_type' => 'boleta', 'document_type' => 'DNI', 'document_number' => '12345678']))->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail(); $this->assertDatabaseCount('user_subscriptions', 0);
        $this->actingAs($payment->user)->get(route('calculadora.estudiante.cav2.voladitos'))->assertRedirect(route('plans.mine'));
        $charge = ['object' => 'charge', 'id' => 'chr_test_access', 'amount' => 4990, 'currency_code' => 'PEN', 'capture' => true,
            'amount_refunded' => 0, 'outcome' => ['type' => 'venta_exitosa'], 'source' => ['id' => 'tkn_test_card'],
            'metadata' => ['application' => 'rizabal', 'payment_request_id' => (string) $payment->id, 'payment_reference' => $payment->token]];
        $this->assertTrue(app(Culqi::class)->confirm($payment, $charge));
        $payment->user->refresh();
        $this->get(route('calculadora.estudiante.cav2.voladitos'))->assertOk();
    }

    public function test_administrative_access_does_not_require_a_commercial_plan(): void
    {
        $admin = User::factory()->create(); $admin->assignRole('root');
        $this->actingAs($admin)->get(route('calculadora.estudiante.cav2.voladitos'))->assertOk();
    }

    public function test_legacy_trials_cannot_bypass_the_five_day_limit_with_a_later_or_missing_end_date(): void
    {
        foreach ([now()->addMonth(), null] as $end) {
            $user = User::factory()->create(); $user->assignRole('cliente');
            $period = $user->subscriptions()->create(['subscription_plan_id' => $this->trial->id, 'status' => 'active',
                'starts_at' => now()->subDays(6), 'ends_at' => $end, 'payment_method' => 'trial', 'amount_paid' => 0]);
            $this->assertFalse($period->isActive()); $this->assertTrue($period->isExpired());
            $this->assertFalse($user->hasPermanentCoverage());
            $this->actingAs($user)->get(route('calculadora.estudiante.cav2.voladitos'))->assertRedirect(route('plans.mine'));
        }
    }
}
