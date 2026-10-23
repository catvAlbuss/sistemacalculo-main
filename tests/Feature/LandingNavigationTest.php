<?php

namespace Tests\Feature;

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

class LandingNavigationTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Http::preventStrayRequests();
        Mail::fake();
        Queue::fake();
        foreach (['cliente', 'root', 'gerencia'] as $role) {
            Role::create(['name' => $role, 'guard_name' => 'web']);
        }
    }

    private function navigation(): string
    {
        return view('components.navigation-landing')->render();
    }

    public function test_guests_have_public_navigation_and_login_without_account_or_admin_links(): void
    {
        $html = $this->navigation();
        $this->assertStringContainsString('Prueba gratis', $html);
        $this->assertStringContainsString(route('login'), $html);
        $this->assertStringNotContainsString('Mi cuenta', $html);
        $this->assertStringNotContainsString('Administración', $html);
        $this->assertStringNotContainsString('Blog', $html);
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $this->assertCount(2, (new \DOMXPath($document))->query('//*[@id="landing-menu-prueba-gratis"]//a'));
    }

    public function test_public_pages_and_free_tools_share_one_guest_navigation(): void
    {
        foreach (['landing.home', 'login', 'password.request', 'landing.plans', 'contacto.index',
            'landing.services.structural_design', 'landing.services.structural_software',
            'landing.services.structural_blueprint', 'landing.services.metrados',
            'landing.info.predim', 'landing.info.arco_techo', 'legal.terminos',
            'predim_v2', 'calculadora.estudiante.arco_techo'] as $route) {
            $html = $this->get(route($route))->assertOk()->getContent();
            $document = new \DOMDocument();
            @$document->loadHTML('<?xml encoding="UTF-8">'.$html);
            $xpath = new \DOMXPath($document);
            $nav = '//nav[@data-navigation="public"]';
            $this->assertCount(1, $xpath->query($nav), $route);
            foreach (['landing.home', 'landing.plans', 'contacto.index', 'login', 'predim_v2', 'calculadora.estudiante.arco_techo'] as $destination) {
                $this->assertGreaterThan(0, $xpath->query($nav.'//a[@href="'.route($destination).'"]')->length, $route.' → '.$destination);
            }
            $this->assertStringNotContainsString('landing-menu-administracion', $html);
            $this->assertStringNotContainsString('landing-menu-mi-cuenta', $html);
        }
        $this->assertGuest();
    }

    public function test_free_tools_mark_the_current_tool_in_the_shared_menu(): void
    {
        foreach (['predim_v2', 'calculadora.estudiante.arco_techo'] as $route) {
            $document = new \DOMDocument();
            @$document->loadHTML($this->get(route($route))->assertOk()->getContent());
            $xpath = new \DOMXPath($document);
            $this->assertCount(1, $xpath->query('//nav[@data-navigation="public"]//a[@href="'.route($route).'"][@aria-current="page"]'));
        }
    }

    public function test_customers_have_account_actions_but_cannot_see_or_open_administration(): void
    {
        $user = User::factory()->create();
        $user->assignRole('cliente');
        $this->actingAs($user);
        $html = $this->navigation();
        $this->assertStringContainsString('Mi espacio de trabajo', $html);
        $this->assertStringNotContainsString('Mi cuenta', $html);
        $html = view('components.navigation-workspace')->render();
        foreach (['Mi cuenta', 'Mi plan y pagos', 'Herramientas', 'Mis respaldos', 'Perfil', 'Cerrar sesión'] as $label) {
            $this->assertStringContainsString($label, $html);
        }
        $this->assertSame(1, substr_count($html, 'href="'.route('backups.index').'"'));
        $this->assertStringNotContainsString('Prueba gratis', $html);
        $this->assertStringNotContainsString('Administración', $html);
        $this->get(route('payments.admin.index'))->assertForbidden();
        $this->get(route('complaints.admin.index'))->assertForbidden();
    }

    public function test_both_administrator_roles_get_distinct_accessible_submenus(): void
    {
        foreach (['root', 'gerencia'] as $role) {
            $user = User::factory()->create();
            $user->assignRole($role);
            $this->actingAs($user);
            $html = view('components.navigation-workspace')->render();
            $this->assertStringContainsString('Gestión de pagos', $html);
            $this->assertStringContainsString('Gestión de reclamaciones', $html);
            preg_match_all('/\bid="([^"]+)"/', $html, $matches);
            $this->assertCount(count(array_unique($matches[1])), $matches[1]);
            foreach (['administracion', 'mi-cuenta'] as $id) {
                $this->assertStringContainsString('aria-controls="landing-menu-'.$id.'"', $html);
                $this->assertStringContainsString('aria-labelledby="landing-menu-'.$id.'-button"', $html);
            }
            $this->assertStringNotContainsString('aria-current="$aria_current()"', $html);
        }
    }

    public function test_account_logout_ends_the_session_and_protected_pages_require_login(): void
    {
        $this->actingAs(User::factory()->create())->post(route('logout'))->assertRedirect('/');
        $this->assertGuest();
        $this->get(route('plans.mine'))->assertRedirect(route('login'));
        $this->get(route('backups.index'))->assertRedirect(route('login'));
    }

    public function test_guest_home_has_login_and_never_includes_private_navigation(): void
    {
        $this->get(route('landing.home'))->assertOk()->assertSeeVolt('login')
            ->assertDontSee('landing-menu-administracion', false)
            ->assertDontSee('landing-menu-mi-cuenta', false)
            ->assertSee('Iniciar sesión')->assertSee('Prueba gratis');
    }

    public function test_authenticated_home_identifies_the_session_instead_of_showing_the_login_form(): void
    {
        $user = User::factory()->create();
        $user->assignRole('root');
        $this->actingAs($user)->get(route('landing.home'))->assertOk()
            ->assertSee('Sesión iniciada')->assertSee($user->email)
            ->assertDontSee('wire:submit=\'login\'', false)
            ->assertDontSee('name="password"', false)
            ->assertDontSee('landing-menu-administracion', false)->assertDontSee('landing-menu-mi-cuenta', false)
            ->assertSee('Mi espacio de trabajo');
        $this->post(route('logout'))->assertRedirect('/');
        $this->get(route('landing.home'))->assertOk()->assertSeeVolt('login')
            ->assertDontSee('landing-menu-administracion', false)
            ->assertDontSee('landing-menu-mi-cuenta', false)->assertDontSee($user->email);
    }

    public function test_html_with_session_dependent_navigation_cannot_be_shared_or_reused_from_cache(): void
    {
        foreach (['landing.home', 'landing.services.structural_design', 'legal.terminos'] as $route) {
            $response = $this->get(route($route))->assertOk();
            $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
            $this->assertStringContainsString('private', $response->headers->get('Cache-Control'));
            $this->assertContains('Cookie', $response->baseResponse->getVary());
        }
    }

    public function test_administratively_granted_permanent_access_has_no_renewal_and_blocks_paid_orders(): void
    {
        $user = User::factory()->create();
        $permanent = Subscription::create(['name' => 'De por vida', 'slug' => 'permanent', 'type' => 'lifetime', 'price' => 0, 'is_active' => true]);
        $monthly = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'type' => 'monthly', 'price' => 49.90, 'duration_days' => 30, 'is_active' => true]);
        $this->actingAs($user);
        $data = ['checkout_key' => (string) Str::uuid(), 'name' => $user->name, 'email' => $user->email,
            'phone' => '999999999', 'subscription_plan_id' => $monthly->id, 'receipt_type' => 'boleta',
            'document_type' => 'DNI', 'document_number' => '00123456', 'accept_terms' => '1'];
        // An order may exist before an administrator grants permanent access.
        $this->post(route('planes.store'), $data)->assertSessionHasNoErrors();
        $payment = \App\Models\PaymentRequest::firstOrFail();
        $period = $user->subscriptions()->create(['subscription_plan_id' => $permanent->id, 'status' => 'active',
            'starts_at' => now()->subDay(), 'ends_at' => null, 'amount_paid' => 0, 'payment_method' => 'admin']);
        $this->get(route('plans.mine'))->assertOk()->assertSee('Tu acceso es permanente')
            ->assertDontSee('Renovar con')->assertDontSee('Puedes renovar antes del vencimiento')
            ->assertSee('data-pdf-enabled="false"', false);
        $this->get(route('planes.register', ['plan' => $monthly->id]))->assertRedirect(route('plans.mine'));
        $data['checkout_key'] = (string) Str::uuid();
        $this->post(route('planes.store'), $data)->assertSessionHasErrors('subscription_plan_id');
        $this->assertDatabaseCount('payment_requests', 1);
        $this->assertFalse(app(Culqi::class)->charge($payment, ['token' => 'tkn_test_card', 'device_id' => 'device'])['ok']);
        Http::assertNothingSent();
        // Cancelled permanent coverage must not block a normal renewal.
        $period->update(['status' => 'cancelled']);
        $this->assertFalse($user->hasPermanentCoverage());
    }
}
