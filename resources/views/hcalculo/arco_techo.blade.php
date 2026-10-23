<x-calc-plain-layout :public-navigation="true">
    @php
        $groups = [
            ['title' => 'Geometría del techo', 'note' => 'Dimensiones de la cubierta y sus apoyos.', 'fields' => [
                ['alturacolumna', 'Altura de columna', 'h', '8', 'm'],
                ['longitudtransversal', 'Longitud transversal', 'LB', '45.8', 'm'],
                ['luz', 'Luz', 'L', '35', 'm'],
                ['flecha', 'Flecha', 'f', '7', 'm'],
            ]],
            ['title' => 'Cargas de entrada', 'note' => 'Peso propio, sobrecargas y acciones climáticas.', 'fields' => [
                ['pesopropio', 'Peso propio', 'P.P.', '19.8', 'kg/m²'],
                ['luminarias', 'Luminarias', 'P.M.', '0', 'kg/m²'],
                ['cargaviva', 'Carga viva de techo', 'CVT', '30', 'kg/m²'],
                ['cargaviento', 'Velocidad del viento', 'V', '75', 'km/h'],
                ['Ps', 'Carga de nieve', 'Ps', '40', 'kg/m²'],
            ]],
            ['title' => 'Parámetros sísmicos', 'note' => 'Factores empleados en el coeficiente ZUCS/R.', 'fields' => [
                ['Z', 'Zona', 'Z', '0.35', '—'],
                ['U', 'Categoría', 'U', '1.5', '—'],
                ['S', 'Tipo de suelo', 'S', '1.2', '—'],
                ['C', 'Factor C', 'C', '2.5', '—'],
                ['R', 'Coeficiente de ductilidad', 'R', '8', '—'],
            ]],
        ];
        $sections = [
            ['datosgeometricos', 'Propiedades geométricas', 'Radio, longitud, área y centros de gravedad.'],
            ['calculocargas', 'Carga muerta', 'Componentes y esfuerzo axial por peso propio.'],
            ['cargavivas', 'Carga viva', 'Componentes y esfuerzo axial por sobrecarga.'],
            ['coeficientesismico', 'Carga sísmica', 'Peso sísmico, coeficiente y componentes.'],
            ['cargadeviento', 'Carga de viento', 'Velocidad, presión, barlovento y sotavento.'],
            ['carganieve', 'Carga de nieve', 'Carga superficial, componentes y esfuerzo axial.'],
        ];
    @endphp
    <main class="engineering-surface arco-sheet" data-sheet="arco-techo">
        <div class="pr-shell">
            <x-engineering-header eyebrow="Herramientas de ingeniería / Cubiertas"
                title="Arco Techo"
                description="Define la geometría y las cargas de la cubierta. Consulta los resultados organizados por cada acción de diseño." />
            <div class="arco-workbench">
                <section class="pr-panel arco-input-panel" aria-labelledby="arco-input-title">
                    <div class="pr-section-head">
                        <span class="pr-section-number">01</span>
                        <div><h2 id="arco-input-title">Datos generales</h2><p class="arco-note">Revisa los valores y sus unidades antes de calcular.</p></div>
                    </div>
                    <div class="arco-fields">
                        @foreach ($groups as $group)
                            <fieldset class="arco-fieldset">
                                <legend>{{ $group['title'] }}</legend>
                                <p class="arco-note">{{ $group['note'] }}</p>
                                <div class="arco-field-grid">
                                    @foreach ($group['fields'] as [$id, $label, $symbol, $value, $unit])
                                        <div class="pr-field">
                                            <label class="pr-label" for="{{ $id }}">{{ $label }} <span class="arco-symbol">{{ $symbol }}</span></label>
                                            <div class="arco-input-wrap">
                                                <input class="pr-input" type="text" inputmode="decimal" name="{{ $id }}" id="{{ $id }}"
                                                    value="{{ $value }}" min="0" required aria-describedby="{{ $id }}-unit"
                                                    @if (!in_array($id, ['alturacolumna', 'longitudtransversal', 'luz']))
                                                        oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                                                    @endif>
                                                <span class="arco-unit" id="{{ $id }}-unit">{{ $unit }}</span>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </fieldset>
                        @endforeach
                    </div>
                    <div class="arco-calculate">
                        <button id="desingButton" class="pr-button" type="button">Calcular resultados <span aria-hidden="true">→</span></button>
                        <p class="arco-note">Actualiza el cálculo cuando cambies los datos.</p>
                    </div>
                </section>
                <section class="arco-results" aria-labelledby="arco-results-title">
                    <div class="pr-panel arco-results-head">
                        <div class="pr-section-head">
                            <span class="pr-section-number">02</span>
                            <div><h2 id="arco-results-title">Resultados del cálculo</h2><p class="arco-note">Geometría y acciones sobre la cubierta.</p></div>
                        </div>
                        <p id="arco-status" class="arco-status" role="status" aria-live="polite">Pendiente de calcular · utiliza los datos de la izquierda.</p>
                        <nav class="arco-result-nav" aria-label="Secciones de resultados">
                            @foreach ($sections as [$id, $title, $description])
                                <a href="#section-{{ $id }}">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }} {{ $title }}</a>
                            @endforeach
                        </nav>
                    </div>
                    <div id="desingcorte" class="arco-result-sections">
                        @foreach ($sections as [$id, $title, $description])
                            <section class="pr-panel arco-result-card" id="section-{{ $id }}" aria-labelledby="title-{{ $id }}">
                                <div class="arco-result-heading">
                                    <span class="arco-result-number">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</span>
                                    <div><h3 id="title-{{ $id }}">{{ $title }}</h3><p class="arco-note">{{ $description }}</p></div>
                                </div>
                                <div class="arco-table-scroll" role="region" aria-label="{{ $title }}" tabindex="0">
                                    <table class="arco-table">
                                        <thead><tr><th scope="col">Parámetro</th><th scope="col">Símbolo</th><th scope="col">Fórmula</th><th scope="col">Resultado</th></tr></thead>
                                        <tbody id="{{ $id }}"><tr><td colspan="4" class="arco-empty">Los resultados aparecerán al calcular.</td></tr></tbody>
                                    </table>
                                </div>
                            </section>
                        @endforeach
                    </div>
                </section>
            </div>
        </div>
    </main>
    @pushOnce('scripts')
        @vite('resources/js/adm_Arcotecho_general.js')
    @endpushOnce
</x-calc-plain-layout>
