<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\Concerns\RefreshPaymentsDatabase;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Spatie\Permission\Models\Role;
use Livewire\Volt\Volt;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/profile');

        $response
            ->assertOk()
            ->assertSeeVolt('profile.update-profile-information-form')
            ->assertSeeVolt('profile.update-password-form')
            ->assertSeeVolt('profile.delete-user-form');
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $component = Volt::test('profile.update-profile-information-form')
            ->set('name', 'Test User')
            ->set('phone', '+51 962 999 500')
            ->set('profession', 'Ingeniero civil')->set('company', 'Mi empresa')
            ->set('city', 'Huánuco')->set('bio', 'Diseño de estructuras')
            ->call('updateProfileInformation');

        $component
            ->assertHasNoErrors()
            ->assertNoRedirect();

        $user->refresh();

        $this->assertSame('TEST USER', $user->name);
        $this->assertSame('+51 962 999 500', $user->phone);
        $this->assertSame('Ingeniero civil', $user->profession);
        $this->assertSame('Mi empresa', $user->company);
        $this->assertSame('Huánuco', $user->city);
        $this->assertSame('Diseño de estructuras', $user->bio);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $component = Volt::test('profile.update-profile-information-form')
            ->set('name', 'Test User')
            ->call('updateProfileInformation');

        $component
            ->assertHasNoErrors()
            ->assertNoRedirect();

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_email_cannot_be_changed_by_tampering_with_livewire_state(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->expectException(CannotUpdateLockedPropertyException::class);
        try {
            Volt::test('profile.update-profile-information-form')->set('email', 'otro@example.com');
        } finally {
            $this->assertSame($user->email, $user->fresh()->email);
            $this->assertNotNull($user->fresh()->email_verified_at);
        }
    }

    public function test_personal_data_validation_prevents_invalid_contact_information(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        Volt::test('profile.update-profile-information-form')
            ->set('phone', 'not a phone')->set('bio', str_repeat('x', 1001))
            ->call('updateProfileInformation')->assertHasErrors(['phone', 'bio']);
        $this->assertNull($user->fresh()->phone);
    }

    public function test_customers_cannot_change_email_roles_or_permissions_through_administration(): void
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
        $user->assignRole($role);
        $this->actingAs($user)->put(route('planUser.update', $user), [
            'name' => $user->name, 'email' => 'changed@example.com', 'roles' => ['root'],
            'permissions' => ['role-edit'], 'permissions_present' => '1',
        ])->assertForbidden();
        $this->assertSame($user->email, $user->fresh()->email);
        $this->assertSame(['cliente'], $user->fresh()->getRoleNames()->all());
        $this->assertCount(0, $user->fresh()->permissions);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $component = Volt::test('profile.delete-user-form')
            ->set('password', 'password')
            ->call('deleteUser');

        $component
            ->assertHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $component = Volt::test('profile.delete-user-form')
            ->set('password', 'wrong-password')
            ->call('deleteUser');

        $component
            ->assertHasErrors('password')
            ->assertNoRedirect();

        $this->assertNotNull($user->fresh());
    }
}
