<?php

namespace Tests\Feature;

use App\Jobs\ProcessPaymentTask;
use App\Mail\SolicitudCliente;
use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserSubscription;
use App\Services\Culqi;
use App\Services\PaymentTasks;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class PaymentSafetyTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private Subscription $plan;
    private $realQueue;

    protected function setUp(): void
    {
        parent::setUp();
        config(['payments.queue_connection' => 'payments', 'services.culqi.enabled' => true,
            'services.culqi.public_key' => 'pk_test_example', 'services.culqi.secret_key' => 'sk_test_example',
            'services.culqi.webhook_token' => str_repeat('a', 40)]);
        $this->realQueue = Queue::getFacadeRoot();
        Queue::fake();
        Mail::fake();
        Http::preventStrayRequests();
        $this->withoutVite();
        Role::create(['name' => 'cliente', 'guard_name' => 'web']);
        Subscription::create(['name' => 'Prueba', 'slug' => 'trial', 'type' => 'trial', 'price' => 0, 'duration_days' => 15, 'is_active' => true]);
        $this->plan = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'type' => 'monthly', 'price' => 49.90, 'duration_days' => 30, 'is_active' => true]);
    }

    private function data(string $email = 'cliente@example.com'): array
    {
        return ['checkout_key' => (string) Str::uuid(), 'subscription_plan_id' => $this->plan->id,
            'name' => 'Cliente', 'email' => $email, 'phone' => '999999999', 'receipt_type' => 'boleta',
            'document_type' => 'DNI', 'document_number' => '00123456'];
    }

    public function test_annual_purchase_uses_server_price_discount_and_frozen_capacity(): void
    {
        $this->plan->update(['max_users' => 1, 'max_projects' => 10, 'features' => ['Exportación de resultados']]);
        $data = array_merge($this->data(), ['billing_cycle' => 'yearly', 'amount' => 1, 'discount' => 99]);
        $this->post(route('planes.store'), $data)->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $this->assertSame('568.86', $payment->amount);
        $this->assertSame('482.08', $payment->subtotal);
        $this->assertSame('86.78', $payment->tax_amount);
        $this->assertEquals(29.94, $payment->plan_snapshot['discount']);
        $this->assertSame(10, $payment->plan_snapshot['max_projects']);
        $this->plan->update(['price' => 999, 'max_projects' => 100, 'features' => ['Otro beneficio']]);
        $charge = $this->charge($payment);
        $charge['amount'] = 56886;
        $this->assertTrue(app(Culqi::class)->confirm($payment, $charge));
        $subscription = UserSubscription::where('transaction_id', 'chr_test_first')->firstOrFail();
        $this->assertTrue($subscription->ends_at->equalTo($subscription->starts_at->copy()->addYearNoOverflow()));
        $this->get(\App\Http\Controllers\CulqiController::paymentUrl($payment))->assertOk()->assertSee('568.86')->assertSee('1 año');
        app(PaymentTasks::class)->run(PaymentTask::where('kind', 'signup_client')->value('id'));
        Mail::assertSent(SolicitudCliente::class, fn ($mail) => $mail->plan->max_projects === 10 && (float) $mail->plan->price === 568.86);
        Http::assertNothingSent();
    }

    public function test_receipt_document_pair_is_enforced_even_when_browser_is_tampered_with(): void
    {
        $this->post(route('planes.store'), array_merge($this->data(), ['document_type' => 'RUC', 'document_number' => '20123456789']))
            ->assertSessionHasErrors('document_type');
        $this->post(route('planes.store'), array_merge($this->data(), ['receipt_type' => 'factura', 'billing_address' => 'Av. Ejemplo 123']))
            ->assertSessionHasErrors('document_type');
        $this->assertDatabaseCount('payment_requests', 0);
    }

    public function test_billing_period_cannot_change_on_an_already_saved_intent(): void
    {
        $data = $this->data();
        $this->post(route('planes.store'), $data)->assertSessionHasNoErrors();
        $this->post(route('planes.store'), array_merge($data, ['billing_cycle' => 'yearly']))->assertSessionHasErrors('checkout_key');
        $this->assertDatabaseCount('payment_requests', 1);
        $this->assertSame('49.90', PaymentRequest::first()->amount);
    }

    public function test_real_database_queue_worker_completes_the_two_registration_tasks(): void
    {
        Queue::swap($this->realQueue);
        // The test owns an outer rollback transaction; let the worker in this process see the rows now.
        config(['queue.connections.payments.after_commit' => false]);
        $this->signup();
        $this->assertDatabaseCount('jobs', 2);
        for ($i = 0; $i < 2; $i++) {
            $this->artisan('queue:work', ['connection' => 'payments', '--queue' => 'payments', '--once' => true, '--sleep' => 0])->assertSuccessful();
        }
        $this->assertDatabaseCount('jobs', 0);
        $this->assertSame(2, PaymentTask::where('status', 'completed')->count());
        Mail::assertSent(SolicitudCliente::class);
        Http::assertNothingSent();
    }

    private function signup(string $email = 'cliente@example.com'): PaymentRequest
    {
        $this->post(route('planes.store'), $this->data($email))->assertSessionHasNoErrors()->assertRedirect();

        return PaymentRequest::where('email', $email)->latest('id')->firstOrFail();
    }

    private function charge(PaymentRequest $payment, string $id = 'chr_test_first', string $token = 'tkn_test_first'): array
    {
        return ['object' => 'charge', 'id' => $id, 'amount' => 4990, 'currency_code' => 'PEN', 'capture' => true,
            'amount_refunded' => 0, 'source' => ['id' => $token], 'outcome' => ['type' => 'venta_exitosa'],
            'metadata' => ['application' => 'rizabal', 'payment_request_id' => (string) $payment->id, 'payment_reference' => $payment->token]];
    }

    private function webhook(string $id = 'chr_test_first')
    {
        return $this->postJson('/webhooks/culqi/'.str_repeat('a', 40), ['type' => 'charge.creation.succeeded', 'data' => ['id' => $id]]);
    }

    public function test_repeated_registration_creates_one_order_one_user_and_two_notifications(): void
    {
        $data = $this->data();
        $this->post(route('planes.store'), $data)->assertSessionHasNoErrors();
        $this->post(route('planes.store'), $data)->assertSessionHasNoErrors();
        $this->assertDatabaseCount('payment_requests', 1);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('payment_tasks', 2);
        Queue::assertPushed(ProcessPaymentTask::class, 2);
        Mail::assertNothingSent();
        Http::assertNothingSent();
    }

    public function test_an_existing_intent_cannot_be_reused_with_another_identity(): void
    {
        $data = $this->data();
        $this->post(route('planes.store'), $data)->assertSessionHasNoErrors();
        $data['email'] = 'otro@example.com';
        $this->post(route('planes.store'), $data)->assertSessionHasErrors('checkout_key');
        $this->assertDatabaseCount('payment_requests', 1);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_using_an_existing_account_email_requires_its_authenticated_owner(): void
    {
        $owner = User::factory()->create(['email' => 'cliente@example.com']);
        $this->post(route('planes.store'), $this->data())->assertSessionHasErrors('email');
        $other = User::factory()->create(['email' => 'otro@example.com']);
        $this->actingAs($other)->post(route('planes.store'), $this->data())->assertSessionHasErrors('email');
        $this->assertDatabaseCount('payment_requests', 0);
        $this->actingAs($owner)->post(route('planes.store'), $this->data())->assertSessionHasNoErrors();
        $this->assertDatabaseHas('payment_requests', ['user_id' => $owner->id, 'email' => $owner->email]);
    }

    public function test_logged_in_user_cannot_charge_another_user_even_with_a_signed_link(): void
    {
        $payment = $this->signup();
        $this->actingAs(User::factory()->create())->get(\App\Http\Controllers\CulqiController::paymentUrl($payment))->assertForbidden();
        $url = URL::temporarySignedRoute('culqi.charge', now()->addDay(), ['paymentRequest' => $payment->id]);
        $this->postJson($url, ['token' => 'tkn_test_first', 'device_id' => 'device123'])->assertForbidden();
        Http::assertNothingSent();
    }

    public function test_card_device_and_payment_reference_are_required_for_new_orders(): void
    {
        $payment = $this->signup();
        $url = URL::temporarySignedRoute('culqi.charge', now()->addDay(), ['paymentRequest' => $payment->id]);
        $this->postJson($url, ['token' => 'tkn_test_first'])->assertUnprocessable()->assertJsonValidationErrors('device_id');
        Http::assertNothingSent();
        $charge = $this->charge($payment);
        unset($charge['metadata']['payment_reference']);
        $this->assertFalse(app(Culqi::class)->confirm($payment, $charge));
        $charge['metadata']['payment_reference'] = 'otra-referencia';
        $this->assertFalse(app(Culqi::class)->confirm($payment, $charge));
        $charge = $this->charge($payment, 'chr_live_wrong');
        $this->assertFalse(app(Culqi::class)->confirm($payment, $charge));
        $this->assertSame(0, UserSubscription::where('payment_method', 'culqi')->count());
    }

    public function test_expired_cache_lock_does_not_allow_a_second_charge_in_flight(): void
    {
        $payment = $this->signup();
        $nested = null;
        $posts = 0;
        Http::fake(function ($request) use ($payment, &$nested, &$posts) {
            if ($request->method() === 'POST') {
                $posts++;
                Cache::lock('culqi:payment:'.$payment->id)->forceRelease();
                $nested = app(Culqi::class)->charge($payment, ['token' => 'tkn_test_other', 'device_id' => 'device123']);
            }

            return Http::response($this->charge($payment));
        });
        $result = app(Culqi::class)->charge($payment, ['token' => 'tkn_test_first', 'device_id' => 'device123']);
        $this->assertTrue($result['ok']);
        $this->assertSame('uncertain', $nested['code']);
        $this->assertSame(1, $posts);
        $this->assertSame(1, UserSubscription::where('payment_method', 'culqi')->count());
    }

    public function test_interleaved_purchases_keep_each_customer_charge_and_receipt_separate(): void
    {
        $first = $this->signup('primero@example.com');
        $second = $this->signup('segundo@example.com');
        $secondResult = null;
        Http::fake(function ($request) use ($first, $second, &$secondResult) {
            if ($request->method() === 'POST' && $request['source_id'] === 'tkn_test_first') {
                $secondResult = app(Culqi::class)->charge($second, ['token' => 'tkn_test_second', 'device_id' => 'device-second']);
            }
            $isSecond = $request->method() === 'POST' ? $request['source_id'] === 'tkn_test_second' : str_ends_with($request->url(), 'chr_test_second');

            return Http::response($isSecond ? $this->charge($second, 'chr_test_second', 'tkn_test_second') : $this->charge($first));
        });
        $this->assertTrue(app(Culqi::class)->charge($first, ['token' => 'tkn_test_first', 'device_id' => 'device-first'])['ok']);
        $this->assertTrue($secondResult['ok']);
        $this->assertSame(2, UserSubscription::where('payment_method', 'culqi')->count());
        $this->assertSame('primero@example.com', $first->receipt()->first()->customer_email);
        $this->assertSame('segundo@example.com', $second->receipt()->first()->customer_email);
        $this->assertDatabaseHas('user_subscriptions', ['user_id' => $first->user_id, 'transaction_id' => 'chr_test_first']);
        $this->assertDatabaseHas('user_subscriptions', ['user_id' => $second->user_id, 'transaction_id' => 'chr_test_second']);
    }

    public function test_duplicate_webhooks_are_saved_once_and_do_no_http_in_the_receiver(): void
    {
        $payment = $this->signup();
        $this->webhook()->assertOk();
        $this->webhook()->assertOk();
        $this->assertSame(1, PaymentTask::where('kind', 'webhook')->count());
        Queue::assertPushed(ProcessPaymentTask::class, 3);
        Http::assertNothingSent();
        Http::fake(['*' => Http::response($this->charge($payment))]);
        $task = PaymentTask::where('kind', 'webhook')->firstOrFail();
        app(PaymentTasks::class)->run($task->id);
        app(PaymentTasks::class)->run($task->id);
        Http::assertSentCount(1);
        $this->assertSame('approved', $payment->fresh()->status);
        $this->assertDatabaseCount('billing_receipts', 1);
        $this->assertSame(1, PaymentTask::where('kind', 'paid_client')->count());
    }

    public function test_failed_webhook_lookup_is_retried_without_creating_a_charge(): void
    {
        $payment = $this->signup();
        $this->webhook()->assertOk();
        $task = PaymentTask::where('kind', 'webhook')->firstOrFail();
        Http::fake(['*' => Http::sequence()->push([], 503)->push($this->charge($payment))]);
        try {
            app(PaymentTasks::class)->run($task->id);
            $this->fail('The unavailable lookup must be retried.');
        } catch (\RuntimeException) {
            $this->assertSame('pending', $task->fresh()->status);
        }
        $this->travel(31)->seconds();
        app(PaymentTasks::class)->run($task->id);
        $this->assertSame('completed', $task->fresh()->status);
        $this->assertSame('approved', $payment->fresh()->status);
        Http::assertNotSent(fn ($request) => $request->method() === 'POST');
    }

    public function test_crossed_payment_reference_never_activates_another_customer(): void
    {
        $first = $this->signup('primero@example.com');
        $second = $this->signup('segundo@example.com');
        $charge = $this->charge($second);
        $charge['metadata']['payment_request_id'] = (string) $first->id;
        Http::fake(['*' => Http::response($charge)]);
        $this->webhook()->assertOk();
        app(PaymentTasks::class)->run(PaymentTask::where('kind', 'webhook')->value('id'));
        $this->assertSame(0, UserSubscription::where('payment_method', 'culqi')->count());
        $this->assertDatabaseHas('payment_tasks', ['kind' => 'webhook', 'result' => 'review_required']);
    }

    public function test_quote_period_is_frozen_and_new_accounts_use_password_setup_links(): void
    {
        $payment = $this->signup();
        $this->plan->update(['duration_days' => 365, 'name' => 'Otro plan']);
        $this->assertTrue(app(Culqi::class)->confirm($payment, $this->charge($payment)));
        $subscription = UserSubscription::where('transaction_id', 'chr_test_first')->firstOrFail();
        $this->assertEquals(30, $subscription->starts_at->diffInDays($subscription->ends_at));
        $this->assertStringContainsString('Mensual', $payment->receipt()->first()->description);
        $task = PaymentTask::where('kind', 'signup_client')->firstOrFail();
        $raw = \Illuminate\Support\Facades\DB::table('payment_tasks')->where('id', $task->id)->value('payload');
        $this->assertStringNotContainsString('new_account', $raw);
        app(PaymentTasks::class)->run($task->id);
        Mail::assertSent(SolicitudCliente::class, fn ($mail) => $mail->password === null && str_contains($mail->activationUrl, '/reset-password/'));
        $this->assertNull($task->fresh()->payload);
    }

    public function test_queue_failure_keeps_the_registration_and_pending_tasks_recoverable(): void
    {
        Queue::shouldReceive('push')->andThrow(new \RuntimeException('queue unavailable'));
        $this->post(route('planes.store'), $this->data())->assertSessionHasNoErrors()->assertRedirect();
        $this->assertDatabaseCount('payment_requests', 1);
        $this->assertSame(2, PaymentTask::where('status', 'pending')->whereNull('dispatched_at')->count());
        Http::assertNothingSent();
    }

    public function test_one_customers_attempt_limit_does_not_block_another_order(): void
    {
        $first = $this->signup('primero@example.com');
        $second = $this->signup('segundo@example.com');
        Http::fake(['*' => Http::response([], 503)]);
        $url = URL::temporarySignedRoute('culqi.charge', now()->addDay(), ['paymentRequest' => $first->id]);
        for ($i = 0; $i < 8; $i++) {
            $this->postJson($url, ['token' => 'tkn_test_first', 'device_id' => 'device123'])->assertStatus(422);
        }
        $this->postJson($url, ['token' => 'tkn_test_first', 'device_id' => 'device123'])->assertStatus(429);
        $secondUrl = URL::temporarySignedRoute('culqi.charge', now()->addDay(), ['paymentRequest' => $second->id]);
        $this->postJson($secondUrl, ['token' => 'tkn_test_second', 'device_id' => 'device123'])->assertStatus(422);
        Http::assertSentCount(2);
    }
}
