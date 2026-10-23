<?php

use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

use function Livewire\Volt\state;

state([
    'name' => fn () => auth()->user()->name,
    'phone' => fn () => auth()->user()->phone,
    'profession' => fn () => auth()->user()->profession,
    'company' => fn () => auth()->user()->company,
    'city' => fn () => auth()->user()->city,
    'bio' => fn () => auth()->user()->bio,
]);
state(['email' => fn () => auth()->user()->email])->locked();

$updateProfileInformation = function () {
    $user = Auth::user();

    $validated = $this->validate([
        'name' => ['required', 'string', 'max:255'],
        'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+()\s.\-]*$/'],
        'profession' => ['nullable', 'string', 'max:120'],
        'company' => ['nullable', 'string', 'max:160'],
        'city' => ['nullable', 'string', 'max:120'],
        'bio' => ['nullable', 'string', 'max:1000'],
    ]);

    $user->fill($validated);

    $user->save();

    $this->dispatch('profile-updated', name: $user->name);
};

$sendVerification = function () {
    $user = Auth::user();

    if ($user->hasVerifiedEmail()) {
        $this->redirectIntended(default: route('dashboard', absolute: false));

        return;
    }

    $user->sendEmailVerificationNotification();

    Session::flash('status', 'verification-link-sent');
};

?>

<section>
    <form wire:submit="updateProfileInformation" class="wk-profile-form">
        <div class="wk-form-grid">
            @foreach ([['name', 'Nombre completo', 'text', 'name', 255], ['phone', 'Teléfono de contacto', 'tel', 'tel', 30], ['profession', 'Profesión o especialidad', 'text', 'organization-title', 120], ['company', 'Empresa o institución', 'text', 'organization', 160], ['city', 'Ciudad', 'text', 'address-level2', 120]] as [$field, $label, $type, $autocomplete, $length])
                <div>
                    <label class="pr-label" for="profile-{{ $field }}">{{ $label }} @if ($field !== 'name')<span class="wk-muted">(opcional)</span>@endif</label>
                    <input class="pr-input" wire:model="{{ $field }}" id="profile-{{ $field }}" name="{{ $field }}" type="{{ $type }}" autocomplete="{{ $autocomplete }}" maxlength="{{ $length }}" @required($field === 'name')>
                    <x-input-error :messages="$errors->get($field)" class="mt-2" />
                </div>
            @endforeach
            <div class="wk-form-wide">
                <label class="pr-label" for="profile-bio">Acerca de ti <span class="wk-muted">(opcional)</span></label>
                <textarea class="pr-input" wire:model="bio" id="profile-bio" name="bio" rows="3" maxlength="1000" placeholder="Cuéntanos sobre tu experiencia y el tipo de proyectos en los que trabajas."></textarea>
                <p class="pr-hint">Hasta 1000 caracteres. Estos datos pertenecen a tu perfil de cuenta.</p>
                <x-input-error :messages="$errors->get('bio')" class="mt-2" />
            </div>
        </div>
        <div class="wk-form-footer">
            <button type="submit" class="pr-button" wire:loading.attr="disabled" wire:target="updateProfileInformation">Guardar mis datos</button>
            <x-action-message on="profile-updated">Datos guardados correctamente.</x-action-message>
        </div>
    </form>
</section>
