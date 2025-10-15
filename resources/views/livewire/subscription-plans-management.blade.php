<div>
    <x-app-layout>
        <x-header title="Gestión de Planes de Suscripción" />

        <div class="py-12">
            <div class="container mx-auto px-4">
                {{-- Mensajes --}}
                @if (session()->has('message'))
                    <div class="mb-4 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {{ session('message') }}
                    </div>
                @endif

                @if (session()->has('error'))
                    <div class="mb-4 rounded-xl bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        {{ session('error') }}
                    </div>
                @endif

                {{-- Barra de búsqueda y botón crear --}}
                <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="relative flex-1 max-w-md">
                        <input type="text" wire:model.live.debounce.300ms="search" placeholder="Buscar planes..."
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
                            Crear Plan
                        </span>
                    </button>
                </div>

                {{-- Grid de planes --}}
                <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    @forelse($plans as $plan)
                        <div
                            class="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl dark:bg-slate-800 
                            {{ !$plan->is_active ? 'opacity-60' : '' }}">

                            {{-- Badge de tipo --}}
                            <div class="absolute right-4 top-4 z-10">
                                <span
                                    class="inline-flex rounded-full px-3 py-1 text-xs font-semibold
                                    @if ($plan->type === 'trial') bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400
                                    @elseif($plan->type === 'monthly') bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400
                                    @elseif($plan->type === 'yearly') bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400
                                    @else bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 @endif">
                                    {{ ucfirst($plan->type) }}
                                </span>
                            </div>

                            <div class="p-6">
                                {{-- Nombre del plan --}}
                                <h3 class="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                                    {{ $plan->name }}
                                </h3>

                                {{-- Descripción --}}
                                @if ($plan->description)
                                    <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">
                                        {{ $plan->description }}
                                    </p>
                                @endif

                                {{-- Precio --}}
                                <div class="mb-4 border-b border-slate-200 pb-4 dark:border-slate-700">
                                    <div class="flex items-baseline gap-2">
                                        <span class="text-4xl font-bold text-slate-900 dark:text-white">
                                            {{ $plan->formatted_price }}
                                        </span>
                                        @if (!$plan->isLifetime() && $plan->price > 0)
                                            <span class="text-slate-600 dark:text-slate-400">
                                                / {{ $plan->duration_text }}
                                            </span>
                                        @endif
                                    </div>
                                    @if ($plan->isLifetime())
                                        <p class="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                                            Acceso de por vida
                                        </p>
                                    @else
                                        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            {{ $plan->duration_text }} de acceso
                                        </p>
                                    @endif
                                </div>

                                {{-- Características --}}
                                @if ($plan->features && count($plan->features) > 0)
                                    <div class="mb-4">
                                        <h4 class="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                                            Características:</h4>
                                        <ul class="space-y-2">
                                            @foreach ($plan->features as $feature)
                                                <li
                                                    class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>{{ $feature }}</span>
                                                </li>
                                            @endforeach
                                        </ul>
                                    </div>
                                @endif

                                {{-- Estadísticas --}}
                                <div class="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
                                    <div class="flex items-center justify-between text-sm">
                                        <span class="text-slate-600 dark:text-slate-400">Suscripciones activas:</span>
                                        <span class="font-semibold text-slate-900 dark:text-white">
                                            {{ $plan->active_subscriptions_count }}
                                        </span>
                                    </div>
                                </div>

                                {{-- Estado --}}
                                <div class="mb-4">
                                    <button wire:click="toggleStatus({{ $plan->id }})"
                                        class="w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors
                                        @if ($plan->is_active) bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400
                                        @else bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 @endif">
                                        {{ $plan->is_active ? '✓ Activo' : '✗ Inactivo' }}
                                    </button>
                                </div>

                                {{-- Acciones --}}
                                <div class="flex gap-2">
                                    <button wire:click="edit({{ $plan->id }})"
                                        class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700">
                                        Editar
                                    </button>
                                    <button wire:click="delete({{ $plan->id }})"
                                        onclick="return confirm('¿Estás seguro de eliminar este plan?')"
                                        class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700">
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    @empty
                        <div class="col-span-full rounded-xl bg-white p-12 text-center shadow-lg dark:bg-slate-800">
                            <svg class="mx-auto h-16 w-16 text-slate-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p class="mt-4 text-lg text-slate-600 dark:text-slate-400">No se encontraron planes</p>
                        </div>
                    @endforelse
                </div>

                {{-- Paginación --}}
                <div class="mt-6">
                    {{ $plans->links() }}
                </div>
            </div>
        </div>

        {{-- Modal --}}
        @if ($showModal)
            <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
                aria-modal="true">
                <div class="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" wire:click="closeModal">
                    </div>

                    <div
                        class="inline-block transform overflow-hidden rounded-xl bg-white text-left align-bottom shadow-xl transition-all dark:bg-slate-800 sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle">
                        <div class="bg-white px-4 pb-4 pt-5 dark:bg-slate-800 sm:p-6 sm:pb-4">
                            <div
                                class="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
                                <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
                                    {{ $isEditing ? 'Editar Plan' : 'Crear Plan' }}
                                </h3>
                                <button wire:click="closeModal"
                                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form wire:submit.prevent="{{ $isEditing ? 'update' : 'store' }}" class="space-y-6">
                                <div class="grid gap-6 md:grid-cols-2">
                                    {{-- Nombre --}}
                                    <div>
                                        <label for="name"
                                            class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                            Nombre del plan *
                                        </label>
                                        <input type="text" wire:model.live="name" id="name"
                                            class="block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                        @error('name')
                                            <span class="mt-1 text-sm text-red-600">{{ $message }}</span>
                                        @enderror
                                    </div>

                                    {{-- Slug --}}
                                    <div>
                                        <label for="slug"
                                            class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                            Slug *
                                        </label>
                                        <input type="text" wire:model="slug" id="slug"
                                            class="block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                        @error('slug')
                                            <span class="mt-1 text-sm text-red-600">{{ $message }}</span>
                                        @enderror
                                    </div>

                                    {{-- Tipo --}}
                                    <div>
                                        <label for="type"
                                            class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                            Tipo de plan *
                                        </label>
                                        <select wire:model.live="type" id="type"
                                            class="block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                            <option value="trial">Prueba</option>
                                            <option value="monthly">Mensual</option>
                                            <option value="yearly">Anual</option>
                                            <option value="lifetime">De por vida</option>
                                        </select>
                                        @error('type')
                                            <span class="mt-1 text-sm text-red-600">{{ $message }}</span>
                                        @enderror
                                    </div>

                                    {{-- Precio --}}
                                    <div>
                                        <label for="price"
                                            class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                            Precio (S/) *
                                        </label>
                                        <input type="number" wire:model="price" id="price" step="0.01"
                                            min="0"
                                            class="block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                        @error('price')
                                            <span class="mt-1 text-sm text-red-600">{{ $message }}</span>
                                        @enderror
                                    </div>

                                    {{-- Duración --}}
                                    @if ($type !== 'lifetime')
                                        <div>
                                            <label for="duration_days"
                                                class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                                Duración (días) *
                                            </label>
                                            <input type="number" wire:model="duration_days" id="duration_days"
                                                min="1"
                                                class="block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                            @error('duration_days')
                                                <span class="mt-1 text-sm text-red-600">{{ $message }}</span>
                                            @enderror
                                        </div>
                                    @endif

                                    {{-- Orden --}}
                                    <div>
                                        <label for="sort_order"
                                            class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                            Orden de visualización
                                        </label>
                                        <input type="number" wire:model="sort_order" id="sort_order" min="0"
                                            class="block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                        @error('sort_order')
                                            <span class="mt-1 text-sm text-red-600">{{ $message }}</span>
                                        @enderror
                                    </div>
                                </div>

                                {{-- Descripción --}}
                                <div>
                                    <label for="description"
                                        class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Descripción
                                    </label>
                                    <textarea wire:model="description" id="description" rows="3"
                                        class="block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"></textarea>
                                    @error('description')
                                        <span class="mt-1 text-sm text-red-600">{{ $message }}</span>
                                    @enderror
                                </div>

                                {{-- Características --}}
                                <div>
                                    <label class="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Características del plan
                                    </label>
                                    <div class="flex gap-2">
                                        <input type="text" wire:model="featureInput"
                                            wire:keydown.enter.prevent="addFeature"
                                            placeholder="Agregar característica..."
                                            class="block flex-1 rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                        <button type="button" wire:click="addFeature"
                                            class="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700">
                                            Agregar
                                        </button>
                                    </div>

                                    @if (count($features) > 0)
                                        <ul class="mt-3 space-y-2">
                                            @foreach ($features as $index => $feature)
                                                <li
                                                    class="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 dark:bg-slate-900/50">
                                                    <span
                                                        class="text-sm text-slate-700 dark:text-slate-300">{{ $feature }}</span>
                                                    <button type="button"
                                                        wire:click="removeFeature({{ $index }})"
                                                        class="text-red-600 hover:text-red-700 dark:text-red-400">
                                                        <svg class="h-5 w-5" fill="none" stroke="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </li>
                                            @endforeach
                                        </ul>
                                    @endif
                                </div>

                                {{-- Estado Activo --}}
                                <div class="flex items-center gap-3">
                                    <input type="checkbox" wire:model="is_active" id="is_active"
                                        class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                    <label for="is_active"
                                        class="text-sm font-semibold text-slate-900 dark:text-white">
                                        Plan activo
                                    </label>
                                </div>

                                {{-- Botones --}}
                                <div
                                    class="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
                                    <button type="button" wire:click="closeModal"
                                        class="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                                        Cancelar
                                    </button>
                                    <button type="submit"
                                        class="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20">
                                        {{ $isEditing ? 'Actualizar' : 'Crear Plan' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        @endif
    </x-app-layout>

</div>
