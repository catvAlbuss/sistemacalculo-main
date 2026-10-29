<?php

namespace Tests\Feature;

use App\Mail\SolicitudAdmin;
use App\Mail\SolicitudCliente;
use App\Models\Subscription;
use App\Models\PaymentRequest;
use Tests\Concerns\RefreshPaymentsDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ContactPaymentTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.culqi.enabled' => false]);
        Role::create(['name' => 'cliente', 'guard_name' => 'web']);
    }

    public function test_trial_can_be_requested_without_payment_proof(): void
    {
        Mail::fake();
        $trial = $this->createPlan('trial', 0, 10);

        $response = $this->post(route('contacto.store'), $this->requestData($trial));

        $response->assertRedirect(route('landing.success'));
        $this->assertDatabaseHas('payment_requests', [
            'subscription_plan_id' => $trial->id,
            'email' => 'cliente@example.com',
        ]);
        $this->assertDatabaseHas('user_subscriptions', [
            'subscription_plan_id' => $trial->id,
            'status' => 'active',
        ]);
        Mail::assertSent(SolicitudCliente::class);
        Mail::assertSent(SolicitudAdmin::class);
    }

    public function test_plans_and_contact_have_separate_public_views(): void
    {
        $this->withoutVite();
        $this->createPlan('monthly', 49.90, 30)->update(['name' => 'Plan Mensual Visible']);
        $this->createPlan('yearly', 479.90, 365)->update(['name' => 'Plan Oculto', 'is_active' => false]);

        $this->get('/planes')->assertOk()->assertSee('Plan Mensual Visible')->assertSee('49.90')
            ->assertDontSee('Plan Oculto')->assertDontSee('No hay planes disponibles');
        $this->get('/contacto')->assertOk()->assertSee('Hablemos de tu proyecto')->assertSee('Ver planes')
            ->assertDontSee('Plan Mensual Visible')->assertDontSee('plan-registration');
    }

    public function test_registration_preserves_the_chosen_plan_and_posts_to_the_plans_url(): void
    {
        $this->withoutVite();
        $plan = $this->createPlan('monthly', 49.90, 30);
        $this->get(route('planes.register', ['plan' => $plan->id]))->assertOk()
            ->assertSee(route('planes.store'), false)->assertSee('49.90')->assertSee('Tarjeta o Yape en línea')
            ->assertSee('data-payment-unavailable="true"', false)->assertDontSee('type="file"', false)->assertDontSee('Yape con comprobante');
        $this->get(route('planes.register'))->assertRedirect(route('landing.plans'));
        $plan->update(['is_active' => false]);
        $this->get(route('planes.register', ['plan' => $plan->id]))->assertNotFound();
    }

    public function test_free_plan_registers_through_the_new_url_without_a_receipt(): void
    {
        Mail::fake();
        $plan = $this->createPlan('trial', 0, 15);
        $this->post(route('planes.store'), $this->requestData($plan))->assertRedirect(route('landing.success'));
        $this->assertDatabaseHas('payment_requests', ['subscription_plan_id' => $plan->id, 'amount' => 0]);
    }

    public function test_registration_keeps_input_and_selected_plan_after_a_validation_error(): void
    {
        $this->withoutVite();
        $plan = $this->createPlan('monthly', 49.90, 30);
        $url = route('planes.register', ['plan' => $plan->id]);
        $this->from($url)->post(route('planes.store'), array_replace($this->requestData($plan), ['phone' => '']))
            ->assertRedirect($url)->assertSessionHasErrors('phone');
        $this->get($url)->assertOk()->assertSee('cliente@example.com')->assertSee('Cliente Prueba')->assertSee('49.90');
    }

    public function test_empty_plan_catalog_displays_an_explanation(): void
    {
        $this->withoutVite();
        $this->get('/planes')->assertOk()->assertSee('No hay planes disponibles en este momento');
    }

    public function test_zero_price_plan_never_requires_payment_proof(): void
    {
        Mail::fake();
        $freePlan = $this->createPlan('trial', 0, 5);

        $response = $this->post(route('contacto.store'), $this->requestData($freePlan));

        $response->assertRedirect(route('landing.success'));
        $this->assertDatabaseHas('payment_requests', [
            'subscription_plan_id' => $freePlan->id,
            'amount' => 0,
        ]);
        $this->assertDatabaseHas('user_subscriptions', [
            'subscription_plan_id' => $freePlan->id,
            'status' => 'active',
        ]);
    }

    public function test_paid_request_uses_culqi_by_default_without_a_receipt(): void
    {
        Mail::fake();
        config([
            'services.culqi.enabled' => true, 'services.culqi.public_key' => 'pk_test_example',
            'services.culqi.secret_key' => 'sk_test_example', 'services.culqi.webhook_token' => str_repeat('a', 40),
        ]);
        $this->createPlan('trial', 0, 10);
        $paid = $this->createPlan('monthly', 49.90, 30);
        $response = $this->post(route('contacto.store'), $this->requestData($paid))->assertSessionHasNoErrors();
        $this->assertStringContainsString('/planes/pagar/', $response->headers->get('Location'));
        $this->assertDatabaseHas('payment_requests', [
            'subscription_plan_id' => $paid->id,
            'amount' => 49.90,
            'payment_method' => 'culqi',
            'payment_proof' => null,
            'status' => 'pending',
        ]);
    }

    public function test_manual_yape_and_uploaded_receipts_are_rejected(): void
    {
        Storage::fake('local');
        $paid = $this->createPlan('monthly', 49.90, 30);
        $this->post(route('planes.store'), $this->requestData($paid) + ['payment_method' => 'yape'])
            ->assertSessionHasErrors('payment_method');
        $this->post(route('planes.store'), $this->requestData($paid) + ['payment_proof' => UploadedFile::fake()->image('comprobante.jpg')])
            ->assertSessionHasErrors('payment_proof');
        $this->assertDatabaseCount('payment_requests', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());
    }

    public function test_unavailable_culqi_does_not_fall_back_to_manual_payment(): void
    {
        $paid = $this->createPlan('monthly', 49.90, 30);
        $this->post(route('planes.store'), $this->requestData($paid))->assertSessionHasErrors('payment_method');
        $this->assertDatabaseCount('payment_requests', 0);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_mail_failure_does_not_rollback_the_request(): void
    {
        $trial = $this->createPlan('trial', 0, 10);
        config(['mail.delivery_attempts' => 1]);
        Mail::shouldReceive('to')->twice()->andThrow(new \RuntimeException('SMTP unavailable'));

        $response = $this->post(route('contacto.store'), $this->requestData($trial));

        $response->assertRedirect(route('landing.success'))
            ->assertSessionHas('success');
        $this->assertDatabaseHas('payment_tasks', ['kind' => 'signup_client', 'status' => 'pending']);
        $this->assertDatabaseHas('payment_requests', [
            'subscription_plan_id' => $trial->id,
            'email' => 'cliente@example.com',
        ]);
        $this->assertDatabaseHas('users', ['email' => 'cliente@example.com']);
    }

    public function test_admin_mail_failure_does_not_report_client_confirmation_as_failed(): void
    {
        $trial = $this->createPlan('trial', 0, 10);
        config(['mail.delivery_attempts' => 1]);

        Mail::shouldReceive('to')
            ->once()
            ->with('cliente@example.com')
            ->andReturnSelf();
        Mail::shouldReceive('send')
            ->once()
            ->with(\Mockery::type(SolicitudCliente::class));
        Mail::shouldReceive('to')
            ->once()
            ->with(config('mail.admin_email'))
            ->andThrow(new \RuntimeException('Admin SMTP unavailable'));

        $response = $this->post(route('contacto.store'), $this->requestData($trial));

        $response->assertRedirect(route('landing.success'))
            ->assertSessionHas('success')
            ->assertSessionMissing('warning');
    }

    private function createPlan(string $type, float $price, ?int $days): Subscription
    {
        return Subscription::create([
            'name' => ucfirst($type),
            'slug' => 'plan-' . $type,
            'price' => $price,
            'duration_days' => $days,
            'type' => $type,
            'is_active' => true,
            'sort_order' => 1,
        ]);
    }

    private function requestData(Subscription $plan): array
    {
        return [
            'name' => 'Cliente Prueba',
            'email' => 'cliente@example.com',
            'phone' => '999999999',
            'subscription_plan_id' => $plan->id,
            'receipt_type' => 'boleta',
            'document_type' => 'DNI',
            'document_number' => '12345678',
        ];
    }
}
