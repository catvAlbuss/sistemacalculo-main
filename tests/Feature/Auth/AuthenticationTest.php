<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\Concerns\RefreshPaymentsDatabase;
use Spatie\Permission\Models\Role;
use Livewire\Volt\Volt;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Role::create(['name' => 'root', 'guard_name' => 'web']);
        Role::create(['name' => 'gerencia', 'guard_name' => 'web']);
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response
            ->assertOk()
            ->assertSeeVolt('login');
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $component = Volt::test('login')
            ->set('form.email', $user->email)
            ->set('form.password', 'password');

        $component->call('login');

        $component
            ->assertHasNoErrors()
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticated();
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $component = Volt::test('login')
            ->set('form.email', $user->email)
            ->set('form.password', 'wrong-password');

        $component->call('login');

        $component
            ->assertHasErrors('form.email')
            ->assertSee('No pudimos iniciar sesión')
            ->assertNoRedirect();

        $this->assertGuest();
    }

    public function test_navigation_menu_can_be_rendered(): void
    {
        $user = User::factory()->create();
        $user->assignRole('root');

        $this->actingAs($user);

        $response = $this->get('/dashboard');

        $response
            ->assertOk()
            ->assertSee('Navegación interna')->assertSee('bg-canvas', false);
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $component = Volt::test('layout.navigation');

        $component->call('logout');

        $component
            ->assertHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
    }

    public function test_admin_roles_do_not_need_a_commercial_subscription(): void
    {
        foreach (['root', 'gerencia'] as $role) {
            $user = User::factory()->create();
            $user->assignRole($role);
            $this->actingAs($user)->get('/dashboard')->assertOk();
            $this->assertTrue($user->canAccess('plans'));
            $this->assertTrue($user->canAccess('software'));
        }
    }

    public function test_legacy_plan_flag_does_not_block_enabled_admin_and_customer_can_view_dashboard_without_plan(): void
    {
        $admin = User::factory()->create(['is_active' => false]);
        $admin->assignRole('root');
        $this->actingAs($admin)->get('/dashboard')->assertOk()->assertSee('Panel administrativo');
        $this->assertTrue($admin->canAccess('plans'));
        $customer = User::factory()->create();
        $this->actingAs($customer)->get('/dashboard')->assertOk()->assertSee('Sin plan vigente')->assertSee('Requiere plan vigente')->assertDontSee('Panel administrativo');
        $this->assertAuthenticatedAs($customer);
    }

    public function test_login_works_through_a_normal_post_when_javascript_is_unavailable(): void
    {
        $user = User::factory()->create();
        $this->post(route('login.store'), ['email' => strtoupper($user->email), 'password' => 'password'])
            ->assertSessionHasNoErrors()->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_always_returns_to_dashboard_instead_of_an_old_plan_redirect(): void
    {
        $user=User::factory()->create();
        $this->withSession(['url.intended'=>route('plans.mine')])->post(route('login.store'),['email'=>$user->email,'password'=>'password'])
            ->assertRedirect(route('dashboard'));
        $this->get(route('dashboard'))->assertOk()->assertSee('Sin plan vigente');
    }

    public function test_normal_post_displays_invalid_credentials_and_shares_attempt_limit(): void
    {
        $user = User::factory()->create();
        for ($i = 0; $i < 5; $i++) {
            $this->from(route('login'))->post(route('login.store'), ['email' => $user->email, 'password' => 'incorrect'])
                ->assertSessionHasErrors('email');
        }
        $this->get(route('login'))->assertSee('No pudimos iniciar sesión');
        Volt::test('login')->set('form.email', $user->email)->set('form.password', 'password')->call('login')
            ->assertHasErrors('form.email')->assertSee('Demasiados intentos');
        $this->assertGuest();
    }
}
