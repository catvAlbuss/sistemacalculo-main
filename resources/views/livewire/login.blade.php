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

    $this->redirectIntended(default: route('dashboard', absolute: false), navigate: false);
};

?>

<div class="rounded bg-white p-6 py-32 text-gray-950 shadow dark:bg-gray-900 dark:text-gray-50">
  <!-- Session Status -->
  <x-auth-session-status class="mb-4" :status="session('status')" />
  <form wire:submit='login'>
    <!-- Email Address -->
    <div>
      <label class="text-gray-950 dark:text-gray-50">Correo</label>
      <x-text-input class="mt-1 block w-full" id="email" name="email" type="email" wire:model='form.email'
        :value="old('email')" required autofocus autocomplete="username" />
      <x-input-error class="mt-2" :messages="$errors->get('email')" />
    </div>
    <!-- Password -->
    <div class="mt-4">
      <label class="text-gray-950 dark:text-gray-50">Contraseña</label>
      <x-text-input class="mt-1 block w-full" id="password" name="password" type="password" wire:model='form.password'
        required autocomplete="current-password" />
      <x-input-error class="mt-2" :messages="$errors->get('password')" />
    </div>

    <!-- Remember Me -->
    <div class="mt-4 block">
      <label class="inline-flex items-center" for="remember_me">
        <input
          class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
          id="remember_me" name="remember" type="checkbox" wire:model="form.remember">
        <span class="ms-2 text-sm text-gray-950 dark:text-gray-50">{{ __('Recordar cuenta') }}</span>
      </label>
    </div>

    <div class="mt-4 flex items-center justify-end">
      <a class="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
        href="{{ route('landing.contact') }}">
        {{ __('Contactenos y adquiere tu CUENTA!!') }}
      </a>

      <x-primary-button class="ms-3">
        <strong>{{ __('Iniciar Session') }}</strong>
      </x-primary-button>
    </div>
  </form>
</div>
