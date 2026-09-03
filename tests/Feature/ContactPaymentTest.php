<?php

namespace Tests\Feature;

use App\Mail\SolicitudAdmin;
use App\Mail\SolicitudCliente;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ContactPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
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

    public function test_paid_request_keeps_selected_plan_and_requires_proof(): void
    {
        Mail::fake();
        Storage::fake('local');
        $this->createPlan('trial', 0, 10);
        $paid = $this->createPlan('monthly', 49.90, 30);

        $this->from(route('contacto.index'))
            ->post(route('contacto.store'), $this->requestData($paid))
            ->assertRedirect(route('contacto.index'))
            ->assertSessionHasErrors('payment_proof');

        $response = $this->post(route('contacto.store'), $this->requestData($paid) + [
            'payment_proof' => UploadedFile::fake()->image('comprobante.jpg'),
        ]);

        $response->assertRedirect(route('landing.success'));
        $this->assertDatabaseHas('payment_requests', [
            'subscription_plan_id' => $paid->id,
            'amount' => 49.90,
        ]);
    }

    public function test_mail_failure_does_not_rollback_the_request(): void
    {
        $trial = $this->createPlan('trial', 0, 10);
        Mail::shouldReceive('to')->once()->andThrow(new \RuntimeException('SMTP unavailable'));

        $response = $this->post(route('contacto.store'), $this->requestData($trial));

        $response->assertRedirect(route('landing.success'))
            ->assertSessionHas('warning');
        $this->assertDatabaseHas('payment_requests', [
            'subscription_plan_id' => $trial->id,
            'email' => 'cliente@example.com',
        ]);
        $this->assertDatabaseHas('users', ['email' => 'cliente@example.com']);
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
        ];
    }
}
