<?php

namespace Tests\Feature;

use App\Livewire\SubscriptionPlansManagement;
use App\Models\User;
use Livewire\Livewire;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class AccountAdministrationTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        foreach (['root', 'gerencia', 'cliente', 'asistente'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }

    public function test_root_and_management_can_correct_email_roles_and_direct_permissions(): void
    {
        $permission = Permission::create(['name' => 'project-review', 'guard_name' => 'web']);
        foreach (['root', 'gerencia'] as $role) {
            $admin = User::factory()->create();
            $admin->assignRole($role);
            $user = User::factory()->create();
            $user->assignRole('cliente');
            $this->actingAs($admin)->put(route('planUser.update', $user), [
                'name' => $user->name, 'email' => $role.'-corrected@example.com',
                'roles' => ['asistente'], 'permissions_present' => '1', 'permissions' => [$permission->name],
            ])->assertRedirect(route('planUser.index'))->assertSessionHasNoErrors();
            $user->refresh();
            $this->assertSame($role.'-corrected@example.com', $user->email);
            $this->assertNull($user->email_verified_at);
            $this->assertSame(['asistente'], $user->getRoleNames()->all());
            $this->assertTrue($user->hasDirectPermission($permission));
        }
    }

    public function test_updating_an_unrelated_user_field_preserves_existing_direct_permissions(): void
    {
        $admin = User::factory()->create(); $admin->assignRole('root');
        $permission = Permission::create(['name' => 'project-review', 'guard_name' => 'web']);
        $user = User::factory()->create(); $user->assignRole('cliente'); $user->givePermissionTo($permission);
        $this->actingAs($admin)->put(route('planUser.update', $user), [
            'name' => 'Nuevo nombre', 'email' => $user->email, 'roles' => ['cliente'],
        ])->assertSessionHasNoErrors();
        $this->assertTrue($user->fresh()->hasDirectPermission($permission));
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_removing_direct_permissions_does_not_remove_inherited_role_permissions(): void
    {
        $admin = User::factory()->create(); $admin->assignRole('root');
        $permission = Permission::create(['name' => 'project-review', 'guard_name' => 'web']);
        Role::findByName('cliente')->givePermissionTo($permission);
        $user = User::factory()->create(); $user->assignRole('cliente'); $user->givePermissionTo($permission);
        $this->actingAs($admin)->put(route('planUser.update', $user), [
            'name' => $user->name, 'email' => $user->email, 'roles' => ['cliente'], 'permissions_present' => '1',
        ])->assertSessionHasNoErrors();
        $this->assertCount(0, $user->fresh()->permissions);
        $this->assertTrue($user->fresh()->hasPermissionTo($permission));
    }

    public function test_unknown_permissions_are_rejected_without_partially_updating_the_account(): void
    {
        $admin = User::factory()->create(); $admin->assignRole('root');
        $user = User::factory()->create(); $user->assignRole('cliente');
        $this->actingAs($admin)->put(route('planUser.update', $user), [
            'name' => $user->name, 'email' => 'changed@example.com', 'roles' => ['root'],
            'permissions_present' => '1', 'permissions' => ['invented-permission'],
        ])->assertSessionHasErrors('permissions.0');
        $this->assertSame($user->email, $user->fresh()->email);
        $this->assertSame(['cliente'], $user->fresh()->getRoleNames()->all());
    }

    public function test_customers_cannot_mount_the_plan_management_component_directly(): void
    {
        $user = User::factory()->create(); $user->assignRole('cliente');
        Livewire::actingAs($user)->test(SubscriptionPlansManagement::class)->assertForbidden();
    }

    public function test_enabled_root_with_a_legacy_inactive_flag_can_edit_users_and_manage_plans(): void
    {
        $root = User::factory()->create(['is_active'=>false]); $root->assignRole('root');
        $user = User::factory()->create(); $user->assignRole('cliente');
        $this->actingAs($root)->put(route('planUser.update',$user),['name'=>'Nombre corregido','email'=>$user->email,'roles'=>['cliente']])
            ->assertRedirect(route('planUser.index'))->assertSessionHasNoErrors();
        $this->assertSame('NOMBRE CORREGIDO',$user->fresh()->name);
        $this->put(route('planUser.update',$root),['name'=>$root->name,'email'=>$root->email,'roles'=>['root']])
            ->assertSessionHasNoErrors();
        Livewire::actingAs($root)->test(SubscriptionPlansManagement::class)->assertOk();
    }

    public function test_users_and_role_choices_are_ordered_from_root_to_customer(): void
    {
        $customer=User::factory()->create();$customer->assignRole('cliente');
        $assistant=User::factory()->create();$assistant->assignRole('asistente');
        $manager=User::factory()->create();$manager->assignRole('gerencia');
        $root=User::factory()->create();$root->assignRole('root');
        $this->actingAs($root)->get(route('planUser.index'))->assertOk()
            ->assertViewHas('users',fn($users)=>$users->pluck('id')->all()===[$root->id,$manager->id,$assistant->id,$customer->id])
            ->assertViewHas('roles',fn($roles)=>$roles->pluck('name')->all()===['root','gerencia','asistente','cliente'])
            ->assertDontSee('id="workspace-theme"',false)->assertDontSee('setWorkspaceTheme');
    }

    public function test_root_role_is_preserved_when_editing_an_existing_root_identity(): void
    {
        $root=User::factory()->create();$root->assignRole('root');
        $this->actingAs($root)->put(route('planUser.update',$root),['name'=>'Root corregido','email'=>$root->email,'roles'=>['cliente']])
            ->assertSessionHasNoErrors();
        $this->assertTrue($root->fresh()->hasRole('root'));
    }

    public function test_plan_dialog_has_trial_defaults_and_clears_the_previous_edit(): void
    {
        $admin = User::factory()->create(); $admin->assignRole('root');
        Livewire::actingAs($admin)->test(SubscriptionPlansManagement::class)
            ->set('name', 'Anterior')->set('featureInput', 'Pendiente')
            ->call('openModal')->assertSet('showModal', true)->assertSet('name', null)
            ->assertSet('duration_days', 5)->assertSet('price', 0)->assertSet('featureInput', '')
            ->set('type', 'yearly')->assertSet('duration_days', 365)
            ->set('type', 'lifetime')->assertSet('duration_days', null)
            ->call('closeModal')->assertSet('showModal', false);
    }
}
