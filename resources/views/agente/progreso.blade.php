{{-- Tablero de progreso del agente: métricas internas (scripts/agente/progreso.mjs y evaluar-norma.mjs)
     y la nota del ingeniero, que es la referencia real. AgenteProgresoController. --}}
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Progreso del agente — NovaCad y Análisis Estructural</h2>
    </x-slot>

    @php
        $color = fn ($v) => $v === null ? 'bg-gray-300' : ($v >= 85 ? 'bg-emerald-500' : ($v >= 60 ? 'bg-amber-400' : 'bg-red-400'));
        $ultimaNota = fn ($modulo) => collect($notas)->where('modulo', $modulo)->last();
    @endphp

    <div class="py-8">
        <div class="max-w-6xl mx-auto px-4 space-y-6">
            @if (session('status'))
                <div class="rounded bg-emerald-50 border border-emerald-300 px-4 py-2 text-sm text-emerald-800">{{ session('status') }}</div>
            @endif

            @if (! $progreso)
                <div class="rounded bg-amber-50 border border-amber-300 p-4 text-sm text-amber-900">
                    Aún no hay mediciones. En el servidor de desarrollo: <code>node scripts/agente/progreso.mjs --completo</code>.
                </div>
            @else
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ $progreso['aviso'] }} Medido el {{ \Illuminate\Support\Carbon::parse($progreso['fecha'])->format('d/m/Y H:i') }}.</p>

                <div class="grid md:grid-cols-2 gap-6">
                    @foreach (['novacad' => 'NovaCad (láminas desde la arquitectura)', 'analisis' => 'Análisis Estructural'] as $clave => $titulo)
                        @php $m = $progreso[$clave]; $nota = $ultimaNota($clave); @endphp
                        <section class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5">
                            <div class="flex items-baseline justify-between mb-1">
                                <h3 class="font-semibold text-gray-900 dark:text-white">{{ $titulo }}</h3>
                                <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ $m['promedio'] ?? '—' }} %</span>
                            </div>
                            <p class="text-xs text-gray-500 mb-4">
                                Promedio de las métricas internas ·
                                <strong>Nota del ingeniero:</strong> {{ $nota ? $nota['nota'].' % ('.$nota['fecha'].')' : 'sin registrar' }}
                            </p>
                            <ul class="space-y-3">
                                @foreach ($m['indicadores'] as $i)
                                    <li>
                                        <div class="flex justify-between text-sm text-gray-800 dark:text-gray-100">
                                            <span>{{ $i['nombre'] }}</span><span class="font-semibold shrink-0 whitespace-nowrap ml-2">{{ $i['valor'] !== null ? $i['valor'].' %' : '—' }}</span>
                                        </div>
                                        <div class="h-2 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden" role="img" aria-label="{{ $i['nombre'] }}: {{ $i['valor'] ?? 'sin dato' }} %">
                                            <div class="h-2 {{ $color($i['valor']) }}" style="width: {{ $i['valor'] ?? 0 }}%"></div>
                                        </div>
                                        <p class="text-[11px] text-gray-500 mt-0.5">{{ $i['mide'] }} <span class="italic">({{ $i['fuente'] }})</span></p>
                                    </li>
                                @endforeach
                            </ul>
                        </section>
                    @endforeach
                </div>

                @if ($norma)
                    <section class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5">
                        <div class="flex items-baseline justify-between mb-1">
                            <h3 class="font-semibold text-gray-900 dark:text-white">Láminas contra la norma (15 puntos del revisor)</h3>
                            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ $norma['promedio'] }} %</span>
                        </div>
                        <p class="text-xs text-gray-500 mb-4">Promedio en {{ $norma['planos'] }} planos, con los datos del formulario y sin análisis. Mide si la lámina TIENE lo que pide la norma (GE.020, E.060, E.030-2026, E.050), no si el dibujo está bien hecho.</p>
                        <div class="grid md:grid-cols-3 gap-x-6 gap-y-2">
                            @foreach ($norma['porPunto'] as $p)
                                <div class="text-xs">
                                    <div class="flex justify-between gap-2"><span>{{ $p['id'] }}. {{ $p['titulo'] }}</span><span class="font-semibold shrink-0 whitespace-nowrap">{{ $p['cumple'] }} %</span></div>
                                    <div class="h-1.5 rounded bg-gray-100 dark:bg-gray-700"><div class="h-1.5 rounded {{ $color($p['cumple']) }}" style="width: {{ $p['cumple'] }}%"></div></div>
                                </div>
                            @endforeach
                        </div>
                    </section>
                @endif

                <section class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5">
                    <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Evolución del dibujo (NovaCad)</h3>
                    <table class="text-xs w-full">
                        <thead><tr class="text-left text-gray-500"><th class="py-1">Fecha</th><th>Dibujo estructural</th><th>Por tipo de elemento</th></tr></thead>
                        <tbody>
                            @foreach (collect($progreso['novacad']['evolucion'])->filter(fn ($e) => $e['dibujo'] !== null)->unique('fecha') as $e)
                                <tr class="border-t border-gray-100 dark:border-gray-700"><td class="py-1">{{ $e['fecha'] }}</td><td>{{ $e['dibujo'] ?? '—' }} %</td><td>{{ $e['porElemento'] ?? '—' }} %</td></tr>
                            @endforeach
                        </tbody>
                    </table>
                </section>
            @endif

            <section class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Registrar la nota del ingeniero</h3>
                <p class="text-xs text-gray-500 mb-3">Es la referencia real: las métricas internas solo sirven si se acercan a esta nota.</p>
                <form method="POST" action="{{ route('software.etabs.agente.progreso.nota') }}" class="flex flex-wrap items-end gap-3 text-sm">
                    @csrf
                    <label class="flex flex-col">Módulo
                        <select name="modulo" class="rounded border-gray-300 text-sm"><option value="novacad">NovaCad</option><option value="analisis">Análisis Estructural</option></select>
                    </label>
                    <label class="flex flex-col">Nota (0–100)
                        <input type="number" name="nota" min="0" max="100" required class="w-24 rounded border-gray-300 text-sm">
                    </label>
                    <label class="flex flex-col flex-1 min-w-[200px]">Comentario
                        <input type="text" name="comentario" maxlength="500" class="rounded border-gray-300 text-sm" placeholder="Qué falta o qué mejoró">
                    </label>
                    <button class="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">Guardar</button>
                </form>
                @if (count($notas))
                    <ul class="mt-3 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        @foreach (array_reverse(array_slice($notas, -6)) as $n)
                            <li>{{ $n['fecha'] }} · {{ $n['modulo'] === 'novacad' ? 'NovaCad' : 'Análisis Estructural' }}: <strong>{{ $n['nota'] }} %</strong>{{ $n['comentario'] ? ' — '.$n['comentario'] : '' }}</li>
                        @endforeach
                    </ul>
                @endif
            </section>
        </div>
    </div>
</x-app-layout>
