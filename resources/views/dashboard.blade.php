<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Inicio') }}
        </h2>
    </x-slot>

    <div class="py-2">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">

            @if ($alert)
                @php
                    $styles = [
                        'info' =>
                            'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200',
                        'warning' =>
                            'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-200',
                        'danger' =>
                            'bg-red-100 border-red-400 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-200',
                        'success' =>
                            'bg-green-100 border-green-400 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-200',
                    ];
                    $icon = [
                        'info' => 'fas fa-info-circle',
                        'warning' => 'fas fa-exclamation-triangle',
                        'danger' => 'fas fa-times-circle',
                        'success' => 'fas fa-check-circle',
                    ];
                    $alertClass = $styles[$alert['type']] ?? $styles['info'];
                    $alertIcon = $icon[$alert['type']] ?? $icon['info'];
                @endphp

                <div class="p-4 rounded-lg border-l-4 font-medium {{ $alertClass }}" role="alert">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex items-start gap-3">
                            <i class="{{ $alertIcon }} text-xl mt-1"></i>
                            <p class="text-sm leading-relaxed">{!! $alert['message'] !!}</p>
                        </div>

                        @if (!empty($alert['show_button']))
                            <a href="{{ route('contacto.index') }}"
                                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition">
                                <i class="fas fa-shopping-cart"></i>
                                Adquirir un Plan
                            </a>
                        @endif
                    </div>
                </div>
            @endif


            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <h2 class="text-3xl font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-3">
                        <span>🚀</span> Bienvenido a R&AIE
                    </h2>
                    <p class="mt-3 text-lg text-gray-700 dark:text-gray-300">
                        Tu centro digital de herramientas estructurales confiables y gratuitas.
                    </p>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h3
                        class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 border-b pb-2">
                        <span>✨</span> ¿Qué puedes lograr con nuestras herramientas?
                    </h3>
                    <ul class="space-y-3 text-gray-700 dark:text-gray-300">
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1 flex-shrink-0">✅</span>
                            <span>Optimizar tiempos de diseño estructural</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1 flex-shrink-0">✅</span>
                            <span>Mejorar la precisión de tus cálculos</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1 flex-shrink-0">✅</span>
                            <span>Cumplir con normas como ACI, EHE, NTC y más</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1 flex-shrink-0">✅</span>
                            <span>Obtener resultados claros, rápidos y exportables (PDF, Excel, etc.)</span>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    </div>
</x-app-layout>
