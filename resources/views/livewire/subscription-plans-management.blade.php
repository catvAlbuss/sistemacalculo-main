<div>
    <x-workspace-layout>
        <header class="wk-heading"><div><p class="pr-eyebrow">Administración / Catálogo</p><h1>Planes de suscripción</h1><p>Define precios, capacidad y características de los planes disponibles.</p></div></header>

        <div class="wk-existing-admin">
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

        @if ($showModal)
            <div class="wk-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="plan-modal-title" wire:click.self="closeModal"
                x-data="{}" x-trap.inert.noscroll="true" @keydown.escape.stop.prevent="$wire.closeModal()">
                <section class="wk-modal-panel wk-modal-wide">
                    <header class="wk-modal-header"><div><p class="pr-eyebrow">Administración / Catálogo</p><h2 id="plan-modal-title">{{ $isEditing ? 'Editar plan' : 'Crear plan' }}</h2><p>Organiza los datos comerciales y la capacidad incluida.</p></div><button type="button" wire:click="closeModal" class="wk-modal-close" aria-label="Cerrar formulario del plan">×</button></header>
                    <form wire:submit="{{ $isEditing ? 'update' : 'store' }}" class="wk-modal-form">
                        <fieldset class="wk-form-section"><legend>Datos del plan</legend><div class="wk-form-grid">
                            <div><label for="plan-name" class="pr-label">Nombre del plan</label><input type="text" id="plan-name" wire:model.live="name" class="pr-input" required maxlength="255">@error('name')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
                            <div><label for="plan-slug" class="pr-label">Identificador</label><input type="text" id="plan-slug" wire:model="slug" class="pr-input" required maxlength="255"><p class="pr-hint">Se genera a partir del nombre al crear el plan.</p>@error('slug')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
                            <div><label for="plan-type" class="pr-label">Tipo de cobertura</label><select id="plan-type" wire:model.live="type" class="pr-input"><option value="trial">Prueba</option><option value="monthly">Mensual</option><option value="yearly">Anual</option><option value="lifetime">De por vida</option></select>@error('type')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
                            <div><label for="plan-price" class="pr-label">Monto objetivo tras procesamiento (S/)</label><input type="number" id="plan-price" wire:model="price" class="pr-input" step="0.01" min="0" required @readonly($type === 'trial')><p class="pr-hint">El precio público cubre el procesamiento. Este monto todavía incluye el IGV del servicio.</p>@error('price')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
                            @if ($type !== 'lifetime')<div><label for="plan-duration" class="pr-label">Duración en días</label><input type="number" id="plan-duration" wire:model="duration_days" class="pr-input" min="1" required @readonly($type === 'trial')>@if($type === 'trial')<p class="pr-hint">Prueba única de 5 días, sin cobro.</p>@endif @error('duration_days')<p class="pr-field-error">{{ $message }}</p>@enderror</div>@else<p class="wk-notice">La cobertura de por vida no tiene fecha de vencimiento.</p>@endif
                            <div><label for="plan-order" class="pr-label">Orden de visualización</label><input type="number" id="plan-order" wire:model="sort_order" class="pr-input" min="0">@error('sort_order')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
                        </div></fieldset>
                        <fieldset class="wk-form-section"><legend>Capacidad incluida</legend><div class="wk-form-grid">
                            @foreach (['max_users' => 'Usuarios incluidos', 'max_projects' => 'Proyectos incluidos'] as $field => $label)
                                <div><label for="plan-{{ $field }}" class="pr-label">{{ $label }}</label><input type="number" id="plan-{{ $field }}" wire:model="{{ $field }}" min="1" required class="pr-input">@error($field)<p class="pr-field-error">{{ $message }}</p>@enderror</div>
                            @endforeach
                        </div></fieldset>
                        <div><label for="plan-description" class="pr-label">Descripción</label><textarea id="plan-description" wire:model="description" rows="3" class="pr-input"></textarea>@error('description')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
                        <fieldset class="wk-form-section"><legend>Características del plan</legend><div class="wk-feature-input"><input type="text" wire:model="featureInput" wire:keydown.enter.prevent="addFeature" aria-label="Nueva característica" placeholder="Escribe una característica" class="pr-input"><button type="button" wire:click="addFeature" class="pr-button pr-button-secondary">Agregar</button></div>
                            <ul class="wk-feature-list">@foreach ($features as $index => $feature)<li><span>{{ $feature }}</span><button type="button" wire:click="removeFeature({{ $index }})" aria-label="Eliminar característica {{ $feature }}">Quitar</button></li>@endforeach</ul>
                        </fieldset>
                        <label class="wk-choice"><input type="checkbox" wire:model="is_active"><span>Plan activo y disponible en el catálogo</span></label>
                        <footer class="wk-form-footer"><button type="button" wire:click="closeModal" class="pr-button pr-button-secondary">Cancelar</button><button type="submit" wire:loading.attr="disabled" wire:target="store,update" class="pr-button">{{ $isEditing ? 'Guardar cambios' : 'Crear plan' }}</button></footer>
                    </form>
                </section>
            </div>
        @endif
    </x-workspace-layout>
</div>
