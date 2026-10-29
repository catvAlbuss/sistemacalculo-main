<?php
use App\Livewire\Forms\LoginForm;
use Illuminate\Support\Facades\Session;
use function Livewire\Volt\form;
use function Livewire\Volt\layout;
form(LoginForm::class);
$login = function () {
    $this->validate();
    $this->form->authenticate();
    Session::regenerate();
    Session::forget('url.intended');
    $this->redirect(route('dashboard'), navigate: false);
};
?>
<section class="pr-panel en-login-card" aria-labelledby="login-heading">
    <header class="pr-plan-head">
        <p class="pr-eyebrow">Acceso a tu cuenta / Rizabal</p>
        <h2 id="login-heading">Acceso profesional</h2>
        <p class="pr-plan-description">Ingresa a tu espacio de diseño estructural.</p>
    </header>
    <div class="en-login-form">
        @if(session('status'))<p class="en-notice" role="status">{{ session('status') }}</p>@endif
        @if(session('error'))<div class="pr-error" role="alert"><p>{{ session('error') }}</p><a href="{{ route('landing.plans') }}" class="en-inline-link">Revisar opciones de acceso</a></div>@endif
        <form wire:submit='login' method="POST" action="{{ route('login.store') }}" style="display:grid;gap:22px">
            @csrf
            <div>
                <label for="email" class="pr-label">Correo electrónico</label>
                <input class="pr-input" id="email" name="email" type="email" wire:model='form.email' value="{{ old('email') }}" required @if(request()->routeIs('login')) autofocus @endif autocomplete="username" placeholder="ingeniero@ejemplo.com" aria-describedby="login-email-error" aria-invalid="{{ $errors->has('form.email') || $errors->has('email') ? 'true' : 'false' }}">
                <div id="login-email-error"><x-input-error class="pr-field-error" :messages="array_merge($errors->get('form.email'), $errors->get('email'))" /></div>
            </div>
            <div>
                <div class="en-label-row"><label for="password" class="pr-label">Contraseña</label><a href="{{ route('password.request') }}">¿Olvidaste tu contraseña?</a></div>
                <input class="pr-input" id="password" name="password" type="password" wire:model='form.password' required autocomplete="current-password" placeholder="Tu contraseña" aria-describedby="login-password-error" aria-invalid="{{ $errors->has('form.password') || $errors->has('password') ? 'true' : 'false' }}">
                <div id="login-password-error"><x-input-error class="pr-field-error" :messages="array_merge($errors->get('form.password'), $errors->get('password'))" /></div>
            </div>
            <label for="remember_me" class="en-check"><input id="remember_me" name="remember" type="checkbox" wire:model="form.remember"><span>Mantener sesión iniciada</span></label>
            <button type="submit" class="pr-button" wire:loading.attr="disabled" wire:target="login"><span wire:loading.remove wire:target="login">Iniciar sesión <span aria-hidden="true">↗︎</span></span><span wire:loading wire:target="login">Validando acceso…</span></button>
        </form>
    </div>
    <div class="en-login-bottom"><p>¿Aún no tienes cuenta?</p><a href="{{ route('landing.plans') }}" class="en-inline-link">Explora los planes y empieza tu registro ↗︎</a></div>
</section>
