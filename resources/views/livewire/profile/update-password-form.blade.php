<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

use function Livewire\Volt\rules;
use function Livewire\Volt\state;

state([
    'current_password' => '',
    'password' => '',
    'password_confirmation' => ''
]);

rules([
    'current_password' => ['required', 'string', 'current_password'],
    'password' => ['required', 'string', Password::defaults(), 'confirmed'],
]);

$updatePassword = function () {
    try {
        $validated = $this->validate();
    } catch (ValidationException $e) {
        $this->reset('current_password', 'password', 'password_confirmation');

        throw $e;
    }

    Auth::user()->update([
        'password' => Hash::make($validated['password']),
    ]);

    $this->reset('current_password', 'password', 'password_confirmation');

    $this->dispatch('password-updated');
};

?>

<section>
    <p class="pr-hint">Confirma tu contraseña actual para establecer una nueva. Usa al menos 8 caracteres.</p>
    <form wire:submit="updatePassword" class="wk-profile-form">
        <div class="wk-form-grid">
            @foreach ([['current_password', 'Contraseña actual', 'current-password'], ['password', 'Nueva contraseña', 'new-password'], ['password_confirmation', 'Confirmar nueva contraseña', 'new-password']] as [$field, $label, $autocomplete])
                <div @class(['wk-form-wide' => $field === 'current_password'])>
                    <label class="pr-label" for="security-{{ $field }}">{{ $label }}</label>
                    <input class="pr-input" wire:model="{{ $field }}" id="security-{{ $field }}" name="{{ $field }}" type="password" autocomplete="{{ $autocomplete }}" required>
                    <x-input-error :messages="$errors->get($field)" class="mt-2" />
                </div>
            @endforeach
        </div>
        <div class="wk-form-footer"><button type="submit" class="pr-button" wire:loading.attr="disabled" wire:target="updatePassword">Actualizar contraseña</button><x-action-message on="password-updated">Contraseña actualizada.</x-action-message></div>
    </form>
</section>
