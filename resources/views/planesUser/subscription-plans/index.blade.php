<x-app-layout>
    <div class="py-2">
        <div class="container mx-auto px-4">
             @if (session('success'))
                <div class="mb-4 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {{ session('success') }}
                </div>
            @endif

            @if (session('error'))
                <div class="mb-4 rounded-xl bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {{ session('error') }}
                </div>
            @endif

            <div class="mb-6 flex justify-end">
                <a href="{{ route('suscripciones.create') }}"
                    class="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700">
                    Crear Plan
                </a>
            </div>

            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                @forelse($suscripciones as $plan)
                    <div
                        class="group relative overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-800 {{ !$plan['is_active'] ? 'opacity-60' : '' }}">
                        <div class="absolute right-4 top-4 z-10">
                            <span
                                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold
                            @if ($plan['type'] === 'trial') bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400
                            @elseif($plan['type'] === 'monthly') bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400
                            @elseif($plan['type'] === 'yearly') bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400
                            @else bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 @endif">
                                {{ ucfirst($plan['type']) }}
                            </span>
                        </div>

                        <div class="p-6">
                            <h3 class="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                                {{ $plan['name'] }}
                            </h3>

                            @if ($plan['description'])
                                <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">
                                    {{ $plan['description'] }}
                                </p>
                            @endif

                            <div class="mb-4 border-b border-slate-200 pb-4 dark:border-slate-700">
                                <div class="flex items-baseline gap-2">
                                    <span class="text-4xl font-bold text-slate-900 dark:text-white">
                                        {{ $plan['formatted_price'] }}
                                    </span>
                                    @if (!$plan['is_lifetime'] && $plan['price'] > 0)
                                        <span class="text-slate-600 dark:text-slate-400">
                                            / {{ $plan['duration_text'] }}
                                        </span>
                                    @endif
                                </div>
                                @if ($plan['is_lifetime'])
                                    <p class="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                                        Acceso de por vida
                                    </p>
                                @else
                                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        {{ $plan['duration_text'] }} de acceso
                                    </p>
                                @endif
                            </div>

                            @if (!empty($plan['features']))
                                <div class="mb-4">
                                    <h4 class="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                                        Características:
                                    </h4>
                                    <ul class="space-y-2">
                                        @foreach ($plan['features'] as $feature)
                                            <li
                                                class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="none"
                                                    stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{{ $feature }}</span>
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif

                            <div class="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-slate-600 dark:text-slate-400">Suscripciones activas:</span>
                                    <span class="font-semibold text-slate-900 dark:text-white">
                                        {{ $plan['active_subscriptions_count'] }}
                                    </span>
                                </div>
                            </div>

                            <div class="mb-4">
                                <form action="{{ route('suscripciones.toggle-status', $plan['id']) }}" method="POST">
                                    @csrf
                                    @method('PATCH')
                                    <button type="submit"
                                        class="w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors
                                    @if ($plan['is_active']) bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400
                                    @else bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 @endif">
                                        {{ $plan['is_active'] ? '✓ Activo' : '✗ Inactivo' }}
                                    </button>
                                </form>
                            </div>

                            <!--<div class="flex gap-2">
                                <a href="{{ route('suscripciones.edit', $plan['id']) }}"
                                    class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700">
                                    Editar
                                </a>
                                <form action="{{ route('suscripciones.destroy', $plan['id']) }}" method="POST"
                                    onsubmit="return confirm('¿Estás seguro de eliminar este plan?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit"
                                        class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700">
                                        Eliminar
                                    </button>
                                </form>
                            </div>-->
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
        </div>
    </div>
</x-app-layout>
