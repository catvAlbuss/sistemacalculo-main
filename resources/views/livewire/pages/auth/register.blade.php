<?php

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

use function Livewire\Volt\layout;
use function Livewire\Volt\rules;
use function Livewire\Volt\state;

layout('layouts.guest');

state([
    'name' => '',
    'email' => '',
    'password' => '',
    'password_confirmation' => '',
]);

rules([
    'name' => ['required', 'string', 'max:255'],
    'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
    'password' => ['required', 'string', 'confirmed', Rules\Password::defaults()],
]);

$register = function () {
    $validated = $this->validate();

    $validated['password'] = Hash::make($validated['password']);

    event(new Registered(($user = User::create($validated))));

    Auth::login($user);

    $this->redirect(route('dashboard', absolute: false), navigate: true);
};

?>
<div>
    <x-app-layout>
        <x-header title="Gestión de Usuarios" />

        <div class="py-12">
            <div class="container mx-auto px-4">
                {{-- Mensajes Flash --}}
                @if (session()->has('message'))
                    <div class="mb-4 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {{ session('message') }}
                    </div>
                @endif

                {{-- Barra de búsqueda y botón crear --}}
                <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="relative flex-1 max-w-md">
                        <input type="text" wire:model.live.debounce.300ms="search"
                            placeholder="Buscar por nombre o email..."
                            class="w-full rounded-xl border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                        <svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button wire:click="openModal"
                        class="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20">
                        <span class="flex items-center gap-2">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                            Crear Usuario
                        </span>
                    </button>
                </div>

                {{-- Tabla de usuarios --}}
                <div class="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-800">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-slate-50 dark:bg-slate-900">
                                <tr>
                                    <th
                                        class="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                                        Usuario</th>
                                    <th
                                        class="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                                        Rol</th>
                                    <th
                                        class="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                                        Suscripción</th>
                                    <th
                                        class="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                                        Días Restantes</th>
                                    <th
                                        class="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                                        Estado</th>
                                    <th
                                        class="px-6 py-4 text-center text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                                        Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                                {{-- @forelse($users as $user)
                                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                        <td class="px-6 py-4">
                                            <div>
                                                <div class="font-semibold text-slate-900 dark:text-white">
                                                    {{ $user->name }}</div>
                                                <div class="text-sm text-slate-500 dark:text-slate-400">
                                                    {{ $user->email }}</div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span
                                                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold
                                                @if ($user->roles->first()?->name === 'root') bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400
                                                @elseif($user->roles->first()?->name === 'gerencia') bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400
                                                @elseif($user->roles->first()?->name === 'asistente') bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400
                                                @else bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 @endif">
                                                {{ ucfirst($user->roles->first()?->name ?? 'Sin rol') }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span
                                                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold
                                                @if ($user->subscription_type === 'premium') bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400
                                                @else bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 @endif">
                                                {{ $user->subscription_type === 'premium' ? 'Premium' : 'Prueba' }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            @php
                                                $days = $user->daysRemaining();
                                            @endphp
                                            <span
                                                class="font-medium
                                                @if ($days > 7) text-green-600 dark:text-green-400
                                                @elseif($days > 0) text-amber-600 dark:text-amber-400
                                                @else text-red-600 dark:text-red-400 @endif">
                                                {{ $days > 0 ? $days . ' días' : 'Expirado' }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <button wire:click="toggleStatus({{ $user->id }})"
                                                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-colors
                                                @if ($user->is_active) bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400
                                                @else bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 @endif">
                                                {{ $user->is_active ? 'Activo' : 'Inactivo' }}
                                            </button>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center justify-center gap-2">
                                                <button wire:click="edit({{ $user->id }})"
                                                    class="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                    title="Editar">
                                                    <svg class="h-5 w-5" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>

                                                @if ($user->subscription_type === 'trial')
                                                    <button wire:click="upgradeToPremium({{ $user->id }})"
                                                        class="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                                        title="Actualizar a Premium">
                                                        <svg class="h-5 w-5" fill="none" stroke="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                        </svg>
                                                    </button>
                                                @endif

                                                <button wire:click="extendSubscription({{ $user->id }}, 30)"
                                                    class="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                                    title="Extender suscripción 30 días">
                                                    <svg class="h-5 w-5" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>

                                                <button wire:click="delete({{ $user->id }})"
                                                    onclick="return confirm('¿Estás seguro de eliminar este usuario?')"
                                                    class="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    title="Eliminar">
                                                    <svg class="h-5 w-5" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="6"
                                            class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                @endforelse --}}
                            </tbody>
                        </table>
                    </div>

                    {{-- Paginación --}}
                    <div class="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
                        {{-- {{ $users->links() }} --}}
                    </div>
                </div>
            </div>
        </div>

        {{-- Modal --}}
        {{-- @if ($showModal)
            <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
                aria-modal="true">
                <div class="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" wire:click="closeModal">
                    </div>

                    <div
                        class="inline-block transform overflow-hidden rounded-xl bg-white text-left align-bottom shadow-xl transition-all dark:bg-slate-800 sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
                        <div class="bg-white px-4 pb-4 pt-5 dark:bg-slate-800 sm:p-6 sm:pb-4">
                            <div
                                class="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
                                <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
                                    {{ $isEditing ? 'Editar Usuario' : 'Crear Usuario' }}
                                </h3>
                                <button wire:click="closeModal"
                                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endif --}}
    </x-app-layout>
</div>
