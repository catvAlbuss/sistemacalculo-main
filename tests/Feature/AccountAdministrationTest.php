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

    public function test_plan_dialog_has_trial_defaults_and_clears_the_previous_edit(): void
    {
        $admin = User::factory()->create(); $admin->assignRole('root');
        Livewire::actingAs($admin)->test(SubscriptionPlansManagement::class)
            ->set('name', 'Anterior')->set('featureInput', 'Pendiente')
            ->call('openModal')->assertSet('showModal', true)->assertSet('name', null)
            ->assertSet('duration_days', 15)->assertSet('price', 0)->assertSet('featureInput', '')
            ->set('type', 'yearly')->assertSet('duration_days', 365)
            ->set('type', 'lifetime')->assertSet('duration_days', null)
            ->call('closeModal')->assertSet('showModal', false);
    }
}
