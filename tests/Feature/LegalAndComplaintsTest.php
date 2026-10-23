<?php

namespace Tests\Feature;

use App\Mail\ComplaintNotification;
use App\Models\Complaint;
use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use App\Models\Subscription;
use App\Models\User;
use App\Services\PaymentTasks;
use App\Services\PeruvianBusinessDays;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class LegalAndComplaintsTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Mail::fake();
        Queue::fake();
        Http::preventStrayRequests();
        config(['payments.queue_connection' => 'payments', 'legal.provider' => [
            'name' => 'Proveedor de prueba', 'ruc' => '20123456789', 'address' => 'Dirección de prueba 123',
            'email' => 'atencion@example.test', 'phone' => '51999999999',
        ]]);
        foreach (['cliente', 'root', 'gerencia'] as $role) {
            Role::create(['name' => $role, 'guard_name' => 'web']);
        }
    }

    private function data(array $changes = []): array
    {
        return array_replace(['submission_key' => (string) Str::uuid(), 'type' => 'reclamo', 'name' => 'Consumidor de prueba',
            'document_type' => 'DNI', 'document_number' => '00123456', 'address' => 'Domicilio de prueba',
            'phone' => '+51 999999999', 'email' => 'consumidor@example.test', 'minor' => '0',
            'item_type' => 'servicio', 'amount' => '49.90', 'item_description' => 'Plan mensual',
            'detail' => 'Mi pago se confirmó pero no recibí acceso al servicio.',
            'request' => 'Solicito revisar el pago y activar mi plan.', 'accept_privacy' => '1'], $changes);
    }

    private function register(array $data = []): Complaint
    {
        $this->post(route('complaints.store'), $this->data($data))->assertSessionHasNoErrors()->assertRedirect();

        return Complaint::latest('id')->firstOrFail();
    }

    public function test_public_legal_pages_and_book_have_provider_links_and_no_login_requirement(): void
    {
        foreach (['legal.terminos', 'legal.devoluciones', 'legal.privacidad', 'complaints.create', 'contacto.index'] as $route) {
            $this->get(route($route))->assertOk()->assertSee('Proveedor de prueba')->assertSee('20123456789')
                ->assertSee('Dirección de prueba 123')->assertSee(route('complaints.create'));
        }
        $this->get(route('legal.devoluciones'))->assertSee('7 días calendario')->assertSee('5 días hábiles');
        $this->get(route('complaints.create'))->assertSee('15 días hábiles')->assertSee('guardian_document');
    }

    public function test_sheet_is_saved_without_account_and_has_a_signed_printable_copy(): void
    {
        $complaint = $this->register();
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('payment_requests', 0);
        $this->assertDatabaseCount('complaints', 1);
        $this->assertDatabaseCount('payment_tasks', 2);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{6}$/', $complaint->code);
        $copy = $this->get($complaint->copyUrl())->assertOk()->assertSee($complaint->code)->assertSee('Imprimir / guardar PDF')
            ->assertHeader('Referrer-Policy', 'no-referrer');
        $this->assertTrue($copy->headers->hasCacheControlDirective('no-store'));
        $this->assertTrue($copy->headers->hasCacheControlDirective('private'));
        $this->get(route('complaints.copy', $complaint))->assertForbidden();
        $other = $this->register(['email' => 'otro@example.test']);
        $tampered = str_replace('/hojas/'.$complaint->id.'?', '/hojas/'.$other->id.'?', $complaint->copyUrl());
        $this->get($tampered)->assertForbidden();
    }

    public function test_repeated_submission_is_idempotent_and_changed_payload_is_rejected(): void
    {
        $data = $this->data();
        $first = $this->post(route('complaints.store'), $data)->assertSessionHasNoErrors();
        $second = $this->post(route('complaints.store'), $data)->assertSessionHasNoErrors();
        $this->assertSame($first->headers->get('Location'), $second->headers->get('Location'));
        $this->assertDatabaseCount('complaints', 1);
        $this->assertDatabaseCount('payment_tasks', 2);
        $this->post(route('complaints.store'), array_replace($data, ['detail' => 'Una descripción completamente distinta.']))
            ->assertSessionHasErrors('submission_key');
    }

    public function test_documents_privacy_and_guardian_are_validated_on_the_server(): void
    {
        $this->post(route('complaints.store'), $this->data(['accept_privacy' => null]))->assertSessionHasErrors('accept_privacy');
        $this->post(route('complaints.store'), $this->data(['document_number' => '123']))->assertSessionHasErrors('document_number');
        $this->post(route('complaints.store'), $this->data(['document_type' => 'RUC']))->assertSessionHasErrors('document_number');
        $this->post(route('complaints.store'), $this->data(['minor' => '1']))->assertSessionHasErrors(['guardian_name', 'guardian_document', 'guardian_address', 'guardian_phone']);
        $this->post(route('complaints.store'), $this->data(['website' => 'https://spam.test']))->assertSessionHasErrors('website');
        $this->assertDatabaseCount('complaints', 0);
    }

    public function test_minor_and_foreign_document_are_supported_and_status_is_server_owned(): void
    {
        $complaint = $this->register(['minor' => '1', 'document_type' => 'CE', 'document_number' => 'CE012345',
            'guardian_name' => 'Representante', 'guardian_document' => '00123456',
            'guardian_address' => 'Domicilio del representante', 'guardian_phone' => '999999999',
            'status' => 'answered', 'answer' => 'Respuesta falsa', 'due_on' => '2099-01-01']);
        $this->assertTrue($complaint->minor);
        $this->assertSame('Representante', $complaint->guardian_name);
        $this->assertSame('pending', $complaint->status);
        $this->assertNull($complaint->answer);
        $this->assertNotSame('2099-01-01', $complaint->due_on->toDateString());
    }

    public function test_notifications_use_the_frozen_provider_and_are_not_sent_twice_by_repeated_jobs(): void
    {
        $complaint = $this->register(['detail' => '<script>alert(1)</script> No tengo acceso al plan.']);
        config(['legal.provider.email' => 'cambio@example.test', 'legal.provider.name' => 'Otro proveedor']);
        foreach (PaymentTask::get() as $task) {
            app(PaymentTasks::class)->run($task->id);
            app(PaymentTasks::class)->run($task->id);
        }
        Mail::assertSent(ComplaintNotification::class, 2);
        Mail::assertSent(ComplaintNotification::class, fn ($mail) => $mail->hasTo('atencion@example.test'));
        $mail = new ComplaintNotification($complaint);
        $this->assertStringContainsString('&lt;script&gt;', $mail->render());
        $this->assertStringNotContainsString('<script>', $mail->render());
        $response = $this->get($complaint->copyUrl())->assertSee('Proveedor de prueba');
        preg_match('/<article[^>]*>([\s\S]*?)<\/article>/', $response->getContent(), $sheet);
        $this->assertStringNotContainsString('Otro proveedor', $sheet[1]);
    }

    public function test_mail_failure_keeps_sheet_and_durable_retry_without_claiming_delivery(): void
    {
        $complaint = $this->register();
        Mail::shouldReceive('to')->once()->andThrow(new \RuntimeException('SMTP failure'));
        $task = PaymentTask::where('kind', 'complaint_copy')->firstOrFail();
        try {
            app(PaymentTasks::class)->run($task->id);
            $this->fail('Debe marcarse el reintento.');
        } catch (\RuntimeException $e) {
            $this->assertStringNotContainsString('SMTP', $e->getMessage());
        }
        $this->assertSame('pending', $task->fresh()->status);
        $this->assertSame('retry_required', $task->fresh()->result);
        $this->assertTrue($task->fresh()->available_at->isFuture());
        $this->get($complaint->copyUrl())->assertOk();
        $this->assertDatabaseCount('complaints', 1);
    }

    public function test_only_authorized_admin_can_read_and_answer_and_first_answer_is_immutable(): void
    {
        $complaint = $this->register();
        $this->get(route('complaints.admin.index'))->assertRedirect(route('login'));
        $client = User::factory()->create();
        $client->assignRole('cliente');
        $this->actingAs($client)->get(route('complaints.admin.index'))->assertForbidden();
        $this->post(route('complaints.admin.answer', $complaint), ['answer' => 'Respuesta no autorizada'])->assertForbidden();
        $admin = User::factory()->create();
        $admin->assignRole('gerencia');
        $this->actingAs($admin)->get(route('complaints.admin.index'))->assertOk()->assertSee($complaint->code);
        $this->get(route('complaints.admin.show', $complaint))->assertOk()->assertSee('Copia al consumidor');
        $this->post(route('complaints.admin.answer', $complaint), ['answer' => 'Revisamos el cargo y gestionaremos la solución indicada.'])->assertSessionHasNoErrors();
        $answered = $complaint->fresh();
        $this->assertSame($admin->id, $answered->answered_by);
        $this->post(route('complaints.admin.answer', $complaint), ['answer' => 'No sobrescribir la primera respuesta registrada.'])->assertSessionHasNoErrors();
        $this->assertSame($answered->answer, $complaint->fresh()->answer);
        $this->assertSame(1, PaymentTask::where('kind', 'complaint_answer')->count());
        $task = PaymentTask::where('kind', 'complaint_answer')->first();
        app(PaymentTasks::class)->run($task->id);
        Mail::assertSent(ComplaintNotification::class, fn ($mail) => $mail->answered && $mail->hasTo($complaint->email));
        $this->get($complaint->copyUrl())->assertSee($answered->answer);
    }

    public function test_deadline_excludes_weekends_national_holidays_and_holy_week(): void
    {
        $calendar = app(PeruvianBusinessDays::class);
        $this->assertSame('2026-07-30', $calendar->deadline(CarbonImmutable::parse('2026-07-27', 'America/Lima'), 1));
        $this->assertSame('2026-04-06', $calendar->deadline(CarbonImmutable::parse('2026-04-01', 'America/Lima'), 1));
        $this->assertSame('2027-01-04', $calendar->deadline(CarbonImmutable::parse('2026-12-31', 'America/Lima'), 1));
        $this->assertSame('2026-11-12', $calendar->deadline(CarbonImmutable::parse('2026-10-22', 'America/Lima'), 15));
    }

    public function test_new_registration_requires_legal_acceptance_and_freezes_server_version(): void
    {
        $plan = Subscription::create(['name' => 'Prueba', 'slug' => 'trial', 'type' => 'trial', 'price' => 0,
            'duration_days' => 15, 'is_active' => true]);
        $data = ['checkout_key' => (string) Str::uuid(), 'checkout_form_version' => '4',
            'subscription_plan_id' => $plan->id, 'name' => 'Cliente', 'email' => 'registro@example.test', 'phone' => '999999999'];
        $this->post(route('planes.store'), $data)->assertSessionHasErrors('accept_terms');
        $this->post(route('planes.store'), array_merge($data, ['accept_terms' => '1', 'legal_version' => 'inventada']))->assertSessionHasNoErrors();
        $payment = PaymentRequest::firstOrFail();
        $snapshot = $payment->plan_snapshot['legal_acceptance'];
        $this->assertSame(config('legal.version'), $snapshot['version']);
        $this->assertCount(3, $snapshot['documents_sha256']);
        $this->assertSame(hash_file('sha256', resource_path('views/legal/terminos.blade.php')), $snapshot['documents_sha256']['terminos']);
        $this->assertSame('Proveedor de prueba', $snapshot['provider']['name']);
        config(['legal.version' => '2099-01-01']);
        $this->assertNotSame(config('legal.version'), $payment->fresh()->plan_snapshot['legal_acceptance']['version']);
        $this->assertSame(1, $payment->events()->where('kind', 'legal_accepted')->count());
    }

    public function test_legal_checker_reports_missing_configuration_without_changing_data(): void
    {
        $this->artisan('legal:verificar')->assertSuccessful();
        config(['legal.provider.ruc' => null, 'legal.provider.address' => null]);
        $this->artisan('legal:verificar')->expectsOutput('RUC: pendiente de configurar.')->assertFailed();
        $this->assertDatabaseCount('complaints', 0);
        $this->assertDatabaseCount('payment_tasks', 0);
        Mail::assertNothingSent();
    }

    public function test_version_four_still_requires_invoice_district_and_exposes_legal_links(): void
    {
        $plan = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'type' => 'monthly',
            'price' => 49.90, 'duration_days' => 30, 'is_active' => true]);
        $this->get(route('planes.register', ['plan' => $plan->id]))->assertOk()
            ->assertSee('name="checkout_form_version" value="5"', false)->assertSee(route('legal.terminos'))
            ->assertSee(route('legal.devoluciones'))->assertSee(route('legal.privacidad'));
        $this->post(route('planes.store'), ['checkout_form_version' => '4', 'accept_terms' => '1',
            'subscription_plan_id' => $plan->id, 'name' => 'Empresa de prueba', 'email' => 'empresa@example.test',
            'phone' => '999999999', 'receipt_type' => 'factura', 'document_type' => 'RUC',
            'document_number' => '20123456789', 'billing_address' => 'Domicilio fiscal de prueba'])
            ->assertSessionHasErrors('billing_ubigeo');
        $this->assertDatabaseCount('payment_requests', 0);
    }
}
