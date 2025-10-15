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
<div
    class="group relative overflow-hidden rounded-2xl bg-white/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:bg-slate-900/80">
    <!-- Borde decorativo animado -->
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style="padding: 2px; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;">
    </div>

    <!-- Contenedor del formulario -->
    <div class="relative p-8 lg:p-10">
        <!-- Header del formulario -->
        <div class="mb-8 text-center">
            <div
                class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Acceso Profesional
            </h2>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Ingresa a tu panel de diseño estructural
            </p>
        </div>

        <!-- Session Status -->
        <x-auth-session-status class="mb-4" :status="session('status')" />

        @if (session('error'))
            <div class="mb-4 p-4 rounded-lg border-l-4 border-red-400 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-medium"
                role="alert">
                <div class="flex items-center">
                    <i class="fas fa-times-circle text-xl mr-3"></i>
                    <p>{{ session('error') }}</p>
                </div>
                <a href="{{ route('contacto.index') }}"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition duration-300 flex items-center">Actualizar
                    cuenta</a>
            </div>
        @endif

        <form wire:submit='login' class="space-y-6">
            <!-- Email Address -->
            <div class="group/input">
                <label class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white" for="email">
                    Correo Electrónico
                </label>
                <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg class="h-5 w-5 text-slate-400 transition-colors group-focus-within/input:text-blue-600"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <x-text-input
                        class="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                        id="email" name="email" type="email" wire:model='form.email' :value="old('email')" required
                        autofocus autocomplete="username" placeholder="ingeniero@ejemplo.com" />
                </div>
                <x-input-error class="mt-2 text-sm" :messages="$errors->get('email')" />
            </div>

            <!-- Password -->
            <div class="group/input">
                <label class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white" for="password">
                    Contraseña
                </label>
                <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg class="h-5 w-5 text-slate-400 transition-colors group-focus-within/input:text-blue-600"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <x-text-input
                        class="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                        id="password" name="password" type="password" wire:model='form.password' required
                        autocomplete="current-password" placeholder="••••••••" />
                </div>
                <x-input-error class="mt-2 text-sm" :messages="$errors->get('password')" />
            </div>

            <!-- Remember Me -->
            <div class="flex items-center">
                <label class="group flex cursor-pointer items-center" for="remember_me">
                    <input
                        class="h-5 w-5 cursor-pointer rounded-lg border-slate-300 text-blue-600 transition-all duration-200 focus:ring-2 focus:ring-blue-600/20 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-blue-600/20 dark:focus:ring-offset-slate-900"
                        id="remember_me" name="remember" type="checkbox" wire:model="form.remember">
                    <span
                        class="ml-3 text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                        {{ __('Mantener sesión iniciada') }}
                    </span>
                </label>
            </div>

            <!-- Divider -->
            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
            </div>

            <!-- Actions -->
            <div class="space-y-4">
                <!-- Login Button -->
                <x-primary-button
                    class="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/25 focus:ring-2 focus:ring-blue-600/20 focus:ring-offset-2 active:scale-[0.98] dark:focus:ring-offset-slate-900">
                    <span class="relative z-10 flex items-center justify-center gap-2">
                        <svg class="h-5 w-5 transition-transform group-hover:scale-110" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        {{ __('Iniciar Sesión') }}
                    </span>
                    <div
                        class="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-cyan-600 to-blue-600 transition-transform duration-300 group-hover:translate-x-0">
                    </div>
                </x-primary-button>

                <!-- Contact Link -->
                <div
                    class="rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 p-4 text-center dark:from-slate-800 dark:to-blue-950/30">
                    <p class="mb-2 text-sm font-medium text-slate-900 dark:text-white">
                        ¿Aún no tienes cuenta?
                    </p>
                    <a class="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-cyan-600 dark:text-blue-400 dark:hover:text-cyan-400"
                        href="{{ route('contacto.index') }}">
                        <svg class="h-4 w-4 transition-transform group-hover:scale-110" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {{ __('Contáctanos y adquiere tu licencia') }}
                        <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>
        </form>

        <!-- Security Badge -->
        <div class="mt-6 flex items-center justify-center gap-2 text-center">
            <svg class="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd" />
            </svg>
            <span class="text-xs font-medium text-slate-600 dark:text-slate-400">
                Conexión segura y encriptada
            </span>
        </div>
    </div>
</div>
