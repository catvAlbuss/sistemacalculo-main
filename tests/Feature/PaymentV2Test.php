<?php

namespace Tests\Feature;

use App\Mail\RenewalReminder;
use App\Models\PaymentEvent;
use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserSubscription;
use App\Services\Culqi;
use App\Services\PaymentTasks;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class PaymentV2Test extends TestCase
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
        Role::create(['name' => 'root', 'guard_name' => 'web']);
        Subscription::create(['name' => 'Prueba', 'slug' => 'trial', 'type' => 'trial', 'price' => 0, 'duration_days' => 15, 'is_active' => true]);
        $this->plan = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'type' => 'monthly', 'price' => 49.90, 'duration_days' => 30, 'is_active' => true]);
    }

    private function data(array $changes = []): array
    {
        return array_replace(['checkout_key' => (string) Str::uuid(), 'checkout_form_version' => '2', 'accept_terms' => '1',
            'subscription_plan_id' => $this->plan->id, 'name' => 'Cliente', 'email' => 'cliente@example.com',
            'phone' => '999999999', 'receipt_type' => 'boleta', 'document_type' => 'DNI', 'document_number' => '00123456'], $changes);
    }

    private function signup(array $changes = []): PaymentRequest
    {
        $this->post(route('planes.store'), $this->data($changes))->assertSessionHasNoErrors()->assertRedirect();

        return PaymentRequest::latest('id')->firstOrFail();
    }

    private function charge(PaymentRequest $payment, string $id = 'chr_test_first'): array
    {
        return ['object' => 'charge', 'id' => $id, 'amount' => (int) round((float) $payment->amount * 100),
            'currency_code' => 'PEN', 'capture' => true, 'amount_refunded' => 0, 'outcome' => ['type' => 'venta_exitosa'],
            'metadata' => ['application' => 'rizabal', 'payment_request_id' => (string) $payment->id, 'payment_reference' => $payment->token]];
    }

    public function test_multi_month_purchase_is_calculated_and_frozen_with_included_tax(): void
    {
        $payment = $this->signup(['months' => 3, 'amount' => 1]);
        $this->assertSame('149.70', $payment->amount);
        $this->assertSame('126.86', $payment->subtotal);
        $this->assertSame('22.84', $payment->tax_amount);
        $this->assertSame(90, $payment->plan_snapshot['duration_days']);
        $this->assertSame('3 meses', $payment->plan_snapshot['duration_text']);
        $this->assertSame(1, $payment->events()->where('kind', 'terms_accepted_v1')->count());
        $this->assertTrue(app(Culqi::class)->confirm($payment, $this->charge($payment)));
        $subscription = UserSubscription::where('transaction_id', 'chr_test_first')->firstOrFail();
        $this->assertEquals(90, $subscription->starts_at->diffInDays($subscription->ends_at));
        $this->assertStringContainsString('3 meses', $payment->receipt()->first()->description);
    }

    public function test_new_form_validates_acceptance_months_and_annual_period(): void
    {
        $this->post(route('planes.store'), $this->data(['accept_terms' => null]))->assertSessionHasErrors('accept_terms');
        $this->post(route('planes.store'), $this->data(['months' => 13]))->assertSessionHasErrors('months');
        $this->post(route('planes.store'), $this->data(['months' => 3, 'billing_cycle' => 'yearly']))->assertSessionHasErrors('months');
        $this->assertDatabaseCount('payment_requests', 0);
    }

    public function test_two_early_renewals_append_paid_periods_and_keep_the_current_plan_until_then(): void
    {
        $first = $this->signup();
        app(Culqi::class)->confirm($first, $this->charge($first));
        $original = UserSubscription::where('transaction_id', 'chr_test_first')->firstOrFail();
        $this->actingAs($first->user);
        $this->travel(5)->days();
        $second = $this->signup();
        app(Culqi::class)->confirm($second, $this->charge($second, 'chr_test_second'));
        $third = $this->signup();
        app(Culqi::class)->confirm($third, $this->charge($third, 'chr_test_third'));
        app(Culqi::class)->confirm($third, $this->charge($third, 'chr_test_third'));
        $renewal = UserSubscription::where('transaction_id', 'chr_test_second')->firstOrFail();
        $last = UserSubscription::where('transaction_id', 'chr_test_third')->firstOrFail();
        $this->assertTrue($renewal->starts_at->equalTo($original->ends_at));
        $this->assertTrue($last->starts_at->equalTo($renewal->ends_at));
        $this->assertFalse($renewal->isActive());
        $this->assertSame($original->id, $first->user->fresh()->currentSubscription->id);
        $this->assertSame(3, UserSubscription::where('payment_method', 'culqi')->count());
        $this->get('/mi-plan')->assertOk()->assertSee('Programado');
        $this->travel(26)->days();
        $this->assertSame($renewal->id, $first->user->fresh()->currentSubscription->id);
    }

    public function test_suspended_account_cannot_buy_charge_or_be_reactivated_by_a_webhook(): void
    {
        $payment = $this->signup();
        $payment->user->update(['is_active' => false]);
        $this->actingAs($payment->user->fresh());
        $this->post(route('planes.store'), $this->data())->assertSessionHasErrors('email');
        $this->assertFalse(app(Culqi::class)->charge($payment, ['token' => 'tkn_test_one'])['ok']);
        $this->assertFalse(app(Culqi::class)->confirm($payment, $this->charge($payment)));
        $this->assertFalse($payment->user->fresh()->is_active);
        $this->assertDatabaseHas('payment_events', ['kind' => 'suspended_account_charge', 'severity' => 'warning']);
        $this->assertSame(0, UserSubscription::where('payment_method', 'culqi')->count());
        Http::assertNothingSent();
    }

    public function test_duplicate_charge_is_audited_once_without_another_activation(): void
    {
        $payment = $this->signup();
        app(Culqi::class)->confirm($payment, $this->charge($payment));
        $other = $this->charge($payment, 'chr_test_duplicate');
        $this->assertFalse(app(Culqi::class)->confirm($payment, $other));
        $this->assertFalse(app(Culqi::class)->confirm($payment, $other));
        $this->assertSame(1, PaymentEvent::where('kind', 'duplicate_charge')->count());
        $this->assertSame(1, UserSubscription::where('payment_method', 'culqi')->count());
        $this->assertDatabaseCount('billing_receipts', 1);
    }

    public function test_reconciliation_is_durable_deduplicated_and_only_queries_culqi(): void
    {
        $payment = $this->signup();
        $payment->update(['gateway_state' => 'uncertain', 'gateway_charge_id' => 'chr_test_first']);
        $this->travel(2)->minutes();
        $this->artisan('payments:reconcile', ['--dry-run' => true])->assertSuccessful();
        $this->assertSame(0, PaymentTask::where('kind', 'reconcile')->count());
        $this->artisan('payments:reconcile')->assertSuccessful();
        $this->artisan('payments:reconcile')->assertSuccessful();
        $this->assertSame(1, PaymentTask::where('kind', 'reconcile')->count());
        Http::fake(['*' => Http::response($this->charge($payment))]);
        app(PaymentTasks::class)->run(PaymentTask::where('kind', 'reconcile')->value('id'));
        $this->assertSame('approved', $payment->fresh()->status);
        Http::assertSentCount(1);
        Http::assertNotSent(fn ($request) => $request->method() === 'POST');
    }

    public function test_a_reconciliation_response_for_another_payment_is_not_applied(): void
    {
        $first = $this->signup();
        $second = $this->signup(['email' => 'segundo@example.com']);
        $task = app(PaymentTasks::class)->create('reconcile', $first, ['charge_id' => 'chr_test_first']);
        Http::fake(['*' => Http::response($this->charge($second))]);
        app(PaymentTasks::class)->run($task->id);
        $this->assertSame('review_required', $task->fresh()->result);
        $this->assertSame('pending', $first->fresh()->status);
        $this->assertSame('pending', $second->fresh()->status);
    }

    public function test_reminders_are_queued_once_and_stale_ones_do_not_send(): void
    {
        $payment = $this->signup();
        $subscription = $payment->user->subscriptions()->firstOrFail();
        $subscription->update(['ends_at' => today()->addDays(5)->setTime(12, 0)]);
        $this->artisan('subscriptions:remind', ['--dry-run' => true])->assertSuccessful();
        $this->assertSame(0, PaymentTask::where('kind', 'renewal_reminder')->count());
        $this->artisan('subscriptions:remind')->assertSuccessful();
        $this->artisan('subscriptions:remind')->assertSuccessful();
        $task = PaymentTask::where('kind', 'renewal_reminder')->firstOrFail();
        $this->assertSame(1, PaymentTask::where('kind', 'renewal_reminder')->count());
        app(PaymentTasks::class)->run($task->id);
        Mail::assertSent(RenewalReminder::class, fn ($mail) => $mail->hasTo($payment->email));
        $this->travel(3)->days();
        $this->artisan('subscriptions:remind')->assertSuccessful();
        $stale = PaymentTask::where('kind', 'renewal_reminder')->latest()->firstOrFail();
        $subscription->update(['ends_at' => now()->addMonth()]);
        app(PaymentTasks::class)->run($stale->id);
        $this->assertSame('superseded', $stale->fresh()->result);
        Mail::assertSent(RenewalReminder::class, 1);
    }

    public function test_my_plan_is_private_and_an_expired_user_can_renew_without_logout(): void
    {
        $first = $this->signup();
        $this->signup(['name' => 'Otro cliente privado', 'email' => 'otro@example.com']);
        $this->get('/mi-plan')->assertRedirect(route('login'));
        $first->user->subscriptions()->update(['ends_at' => now()->subDay()]);
        $this->actingAs($first->user)->get('/dashboard')->assertRedirect(route('plans.mine'));
        $this->assertAuthenticatedAs($first->user);
        $this->get('/mi-plan')->assertOk()->assertSee('cliente@example.com')->assertDontSee('Otro cliente privado');
        $this->get(route('planes.register', ['plan' => $this->plan->id]))->assertOk()->assertSee('00123456');
    }

    public function test_admin_panel_and_csv_require_role_and_review_does_not_approve_payment(): void
    {
        $payment = $this->signup(['name' => '=HYPERLINK("malicious")']);
        $warning = PaymentEvent::record($payment, 'uncertain', '', [], 'warning');
        $this->actingAs($payment->user)->get(route('payments.admin.index'))->assertForbidden();
        $this->post(route('payments.admin.review', $warning), ['note' => 'Revisado en Culqi'])->assertForbidden();
        $admin = User::factory()->create();
        $admin->assignRole('root');
        $this->actingAs($admin)->get(route('payments.admin.index'))->assertOk()->assertSee('Administración de pagos');
        $this->get(route('suscripciones.index'))->assertOk()->assertSee('Crear Plan')->assertSee('livewire', false);
        $this->get(route('payments.admin.show', $payment))->assertOk()->assertSee('uncertain')->assertDontSee($payment->token);
        $csv = $this->get(route('payments.admin.index', ['download' => 'csv']))->assertOk()->streamedContent();
        $this->assertStringContainsString("'=HYPERLINK", $csv);
        $this->post(route('payments.admin.review', $warning), ['note' => 'Revisado en Culqi'])->assertSessionHasNoErrors();
        $this->post(route('payments.admin.review', $warning), ['note' => 'Otra revisión'])->assertSessionHasNoErrors();
        $this->assertSame('Revisado en Culqi', $warning->fresh()->review_note);
        $this->assertSame($admin->id, $warning->fresh()->reviewed_by);
        $this->assertSame('pending', $payment->fresh()->status);
    }
}
