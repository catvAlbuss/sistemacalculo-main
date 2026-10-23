<?php

namespace Tests\Feature;

use App\Models\CadModel;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class WorkspaceNavigationTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Http::preventStrayRequests();
        foreach (['root','gerencia','cliente'] as $role) Role::create(['name'=>$role,'guard_name'=>'web']);
    }

    public function test_account_and_administration_pages_use_the_internal_layout_and_keep_public_pages_outside(): void
    {
        $user = User::factory()->create(); $user->assignRole('root');
        $this->actingAs($user);
        foreach (['dashboard','plans.mine','backups.index','profile','account.support','plans.catalog','administration.index','payments.admin.index','complaints.admin.index','suscripciones.index','planUser.index'] as $route) {
            $this->get(route($route))->assertOk()->assertSee('data-layout="workspace"',false)
                ->assertSee('Navegación interna')->assertDontSee('aria-label="Navegación principal"',false)
                ->assertDontSee('aria-label="Información legal"',false);
        }
        foreach (['landing.home','landing.plans','contacto.index','landing.services.structural_design','legal.terminos'] as $route) {
            $this->get(route($route))->assertOk()->assertSee('aria-label="Navegación principal"',false)
                ->assertDontSee('data-layout="workspace"',false)->assertDontSee('Gestión de pagos');
        }
        $paid = Subscription::create(['name'=>'Mensual','slug'=>'monthly','type'=>'monthly','price'=>49.90,'duration_days'=>30,'is_active'=>true]);
        $this->get(route('planes.register',['plan'=>$paid->id]))->assertOk()->assertSee('Navegación interna')
            ->assertSee(route('plans.catalog'));
    }

    public function test_guests_cannot_enter_internal_pages_and_customers_cannot_enter_administration(): void
    {
        foreach (['dashboard','plans.mine','backups.index','profile','account.support','plans.catalog','administration.index'] as $route) {
            $this->get(route($route))->assertRedirect(route('login'));
        }
        $user = User::factory()->create(); $user->assignRole('cliente');
        $this->actingAs($user)->get(route('plans.mine'))->assertOk()->assertSee('Navegación interna')->assertDontSee('Gestión de pagos');
        $this->get(route('administration.index'))->assertForbidden();
    }

    public function test_welcome_counts_only_owned_projects_and_keeps_the_animated_canvas(): void
    {
        $user = User::factory()->create(); $user->assignRole('root');
        $other = User::factory()->create();
        CadModel::create(['user_id'=>$user->id,'name'=>'Propio','data'=>'{}']);
        CadModel::create(['user_id'=>$other->id,'name'=>'Ajeno','data'=>'{}']);
        $this->actingAs($user)->get(route('dashboard'))->assertOk()->assertViewHas('projectCount',1)
            ->assertSee('id="bg-canvas"',false)->assertSee('Herramientas de ingeniería')
            ->assertDontSee('99.9%')->assertDontSee('10x')->assertDontSee('Ajeno');
    }
}
