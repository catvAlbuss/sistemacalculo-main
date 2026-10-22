<?php

namespace Tests\Feature;

use App\Models\BillingReceipt;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Culqi;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class BillingTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Http::preventStrayRequests();
        $this->withoutVite();
        config([
            'services.culqi.enabled' => true, 'services.culqi.public_key' => 'pk_test_example',
            'services.culqi.secret_key' => 'sk_test_example', 'services.culqi.webhook_token' => str_repeat('a', 40),
            'billing.issuer.legal_name' => 'Emisor Prueba', 'billing.issuer.ruc' => '20123456789',
            'billing.issuer.address' => 'Dirección del emisor',
            'billing.igv_rate' => 18,
        ]);
        Role::create(['name' => 'cliente', 'guard_name' => 'web']);
        Subscription::create(['name' => 'Prueba', 'slug' => 'prueba', 'price' => 0, 'duration_days' => 15, 'type' => 'trial', 'is_active' => true]);
        $this->plan = Subscription::create(['name' => 'Mensual', 'slug' => 'mensual', 'price' => 49.90, 'duration_days' => 30, 'type' => 'monthly', 'is_active' => true]);
    }

    private Subscription $plan;

    private function data(array $changes = []): array
    {
        return array_replace([
            'name' => 'Cliente de la boleta', 'email' => 'usuario@example.com', 'phone' => '999999999',
            'subscription_plan_id' => $this->plan->id,
            'receipt_type' => 'boleta', 'document_type' => 'DNI', 'document_number' => '00123456',
        ], $changes);
    }

    private function charge(PaymentRequest $payment): array
    {
        return ['object' => 'charge', 'id' => 'chr_test_billing', 'amount' => 4990, 'currency_code' => 'PEN',
            'source' => ['id' => 'tkn_test_billing'],
            'capture' => true, 'amount_refunded' => 0, 'outcome' => ['type' => 'venta_exitosa'],
            'metadata' => ['payment_request_id' => (string) $payment->id, 'payment_reference' => $payment->token, 'application' => 'rizabal']];
    }

    public function test_billing_is_saved_and_ticket_is_created_only_once_after_payment(): void
    {
        $this->post(route('planes.store'), $this->data())->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $this->assertSame('00123456', $payment->document_number);
        $this->assertSame('42.29', $payment->subtotal);
        $this->assertSame('7.61', $payment->tax_amount);
        config(['billing.igv_rate' => 10]);
        $this->assertDatabaseCount('billing_receipts', 0);
        $charge = $this->charge($payment);
        $this->assertTrue(app(Culqi::class)->confirm($payment, $charge));
        $this->assertTrue(app(Culqi::class)->confirm($payment, $charge));
        $this->assertDatabaseCount('billing_receipts', 1);
        $receipt = BillingReceipt::firstOrFail();
        $this->assertSame('49.90', $receipt->total);
        $this->assertSame('42.29', $receipt->subtotal);
        $this->assertSame('7.61', $receipt->tax_amount);
        $this->assertSame('18.00', $receipt->tax_rate);
        $this->assertSame('not_sent', $receipt->electronic_status);
        $this->assertSame('00123456', $receipt->document_number);
        config(['billing.issuer.legal_name' => 'Emisor cambiado']);
        $payment->update(['billing_name' => 'Cliente cambiado', 'amount' => 999]);
        $this->plan->update(['name' => 'Plan cambiado']);
        $response = $this->get($receipt->ticketUrl())->assertOk()->assertSee('Emisor Prueba')->assertSee('Cliente de la boleta')
            ->assertSee('Mensual')->assertSee('49.90')->assertDontSee('Cliente cambiado')->assertDontSee('Plan cambiado')
            ->assertSee('width: 80mm', false)->assertSee('sin validez tributaria');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('private', $response->headers->get('Cache-Control'));
    }

    public function test_invoice_requires_ruc_name_and_address(): void
    {
        $this->post(route('planes.store'), $this->data(['receipt_type' => 'factura']))
            ->assertSessionHasErrors(['document_type', 'billing_address']);
        $this->post(route('planes.store'), $this->data(['document_number' => '123']))->assertSessionHasErrors('document_number');
        $this->post(route('planes.store'), $this->data(['document_type' => 'RUC', 'document_number' => '12345678']))->assertSessionHasErrors('document_number');
        $this->post(route('planes.store'), $this->data(['name' => '']))->assertSessionHasErrors('name');
        $this->assertDatabaseCount('payment_requests', 0);
        $this->post(route('planes.store'), $this->data([
            'receipt_type' => 'factura', 'document_type' => 'RUC', 'document_number' => '20123456789',
            'name' => 'Empresa Cliente', 'billing_address' => 'Av. Ejemplo 123', 'email' => 'contabilidad@example.com',
        ]))->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        app(Culqi::class)->confirm($payment, $this->charge($payment));
        $this->get($payment->receipt->ticketUrl())->assertOk()->assertSee('FACTURA')->assertSee('Empresa Cliente')->assertSee('contabilidad@example.com');
    }

    public function test_included_igv_breakdown_preserves_the_price_to_the_cent(): void
    {
        foreach ([[49.90, 42.29, 7.61], [479.90, 406.69, 73.21], [3.00, 2.54, 0.46], [0, 0, 0], [0.03, 0.03, 0]] as [$total, $subtotal, $tax]) {
            $breakdown = app(\App\Services\Billing::class)->breakdown($total);
            $this->assertEquals($subtotal, $breakdown['subtotal']);
            $this->assertEquals($tax, $breakdown['tax_amount']);
            $this->assertEquals($total, $breakdown['total']);
            $this->assertSame((int) round($total * 100), (int) round(($breakdown['subtotal'] + $breakdown['tax_amount']) * 100));
        }
    }

    public function test_new_invoice_form_requires_a_catalog_district_and_freezes_its_location(): void
    {
        $data = $this->data(['receipt_type' => 'factura', 'document_type' => 'RUC', 'document_number' => '20123456789',
            'billing_address' => 'Av. Ejemplo 123', 'checkout_form_version' => '3', 'accept_terms' => '1']);
        $this->post(route('planes.store'), $data)->assertSessionHasErrors('billing_ubigeo');
        $this->post(route('planes.store'), array_merge($data, ['billing_ubigeo' => '000000']))->assertSessionHasErrors('billing_ubigeo');
        $this->post(route('planes.store'), array_merge($data, ['billing_ubigeo' => '150101', 'billing_location' => ['distrito' => 'Dato alterado']]))
            ->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $this->assertSame('150101', $payment->billing_ubigeo);
        $this->assertSame('LIMA', $payment->billing_location['distrito']);
        $this->assertTrue(app(Culqi::class)->confirm($payment, $this->charge($payment)));
        \App\Models\Ubigeo::whereKey('150101')->update(['distrito' => 'Distrito modificado']);
        $receipt = $payment->receipt()->firstOrFail();
        $this->assertSame('LIMA', $receipt->customer_location['distrito']);
        $this->get($receipt->ticketUrl())->assertOk()->assertSee('150101')->assertSee('LIMA')->assertDontSee('Distrito modificado');
    }

    public function test_boleta_still_allows_no_location_and_new_form_retains_the_district_catalog(): void
    {
        $this->post(route('planes.store'), $this->data(['checkout_form_version' => '3', 'accept_terms' => '1']))->assertSessionHasNoErrors();
        $this->assertNull(PaymentRequest::firstOrFail()->billing_location);
        $this->get(route('planes.register', ['plan' => $this->plan->id]))->assertOk()->assertSee('billing-districts')->assertSee('150101');
        $this->assertSame(1893, \App\Models\Ubigeo::count());
    }

    public function test_contact_identity_is_reused_for_billing_and_messages_are_not_accepted(): void
    {
        $this->post(route('planes.store'), $this->data(['message' => 'Mensaje no permitido']))->assertSessionHasErrors('message');
        $this->assertDatabaseCount('payment_requests', 0);
        $this->post(route('planes.store'), $this->data([
            'billing_name' => 'Otro receptor', 'billing_email' => 'ajeno@example.com',
        ]))->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $this->assertSame($payment->name, $payment->billing_name);
        $this->assertSame($payment->email, $payment->billing_email);
        $this->assertNull($payment->message);
        app(Culqi::class)->confirm($payment, $this->charge($payment));
        $this->assertSame($payment->name, $payment->receipt->customer_name);
        $this->assertSame($payment->email, $payment->receipt->customer_email);
    }

    public function test_ticket_access_requires_owner_or_valid_signature(): void
    {
        $this->post(route('planes.store'), $this->data())->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        app(Culqi::class)->confirm($payment, $this->charge($payment));
        $receipt = $payment->receipt()->firstOrFail();
        $url = route('billing.ticket', $receipt);
        $this->get($url)->assertForbidden();
        $signed = $receipt->ticketUrl();
        $this->get($signed)->assertOk();
        $this->travel(8)->days();
        $this->get($signed)->assertForbidden();
        $this->actingAs(User::factory()->create())->get($url)->assertForbidden();
        $this->actingAs($payment->user)->get($url)->assertOk();
    }

    public function test_a_declined_charge_does_not_create_a_ticket(): void
    {
        $this->post(route('planes.store'), $this->data())->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $charge = $this->charge($payment);
        $charge['outcome']['type'] = 'venta_rechazada';
        $this->assertFalse(app(Culqi::class)->confirm($payment, $charge));
        $this->assertDatabaseCount('billing_receipts', 0);
    }

    public function test_charge_response_and_webhook_both_provide_the_same_ticket(): void
    {
        $this->post(route('planes.store'), $this->data())->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        Http::fake(['*' => Http::response($this->charge($payment))]);
        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute('culqi.charge', now()->addDay(), ['paymentRequest' => $payment->id]);
        $this->postJson($url, ['token' => 'tkn_test_billing', 'device_id' => 'device123'])->assertOk()->assertJsonStructure(['receipt_url']);
        $this->postJson('/webhooks/culqi/'.str_repeat('a', 40), ['type' => 'charge.creation.succeeded', 'data' => ['id' => 'chr_test_billing']])->assertOk();
        $this->assertDatabaseCount('billing_receipts', 1);
        $this->get(\App\Http\Controllers\CulqiController::paymentUrl($payment))->assertOk()->assertSee('Ver e imprimir ticket');
    }
}
