<x-sheets.workbench sheet="cimentacion-v1" title="Cimentación v1" entry="resources/js/adm_zapatas_grafico.js"
    eyebrow="Herramientas de ingeniería / Cimentaciones" class="analysis-sheet foundation-compact" data-analysis-sheet
    description="Organiza las cargas, las propiedades y los contornos de la cimentación. Revisa los resultados gráficos del análisis y genera el reporte.">
    <x-sheets.panel title="Datos generales" number="01"
        description="Tablas compactas de cargas, propiedades y coordenadas." class="arco-input-panel">
        <form id="zapatasForm">
            @csrf
            <div class="foundation-input-grid">
                <x-sheets.section title="Cargas" note="Solicitaciones aplicadas a la cimentación."
                    class="foundation-input-card">
                    <div id="cargas" class="analysis-matrix"></div>
                </x-sheets.section>
                <x-sheets.section title="Propiedades" note="Área, inercias y profundidad de desplante."
                    class="foundation-input-card">
                    <div id="propiedades" class="analysis-matrix"></div>
                </x-sheets.section>
                <x-sheets.section title="Contorno exterior"
                    note="Ejemplo triangular con tres vértices. Edita las coordenadas o añade filas con +."
                    class="foundation-input-card">
                    <div id="poligonoExterior" class="analysis-matrix"></div>
                </x-sheets.section>
                @foreach (range(1, 5) as $index)
                    <x-sheets.section title="Interior {{ $index }}"
                        note="Hueco opcional: actívalo solo si forma parte de tu cimentación."
                        class="foundation-input-card">
                        <label class="foundation-hole-toggle" for="usarInterior{{ $index }}"><input
                                id="usarInterior{{ $index }}" type="checkbox"
                                data-polygon-toggle="poligonoInterior{{ $index }}">Usar este contorno
                            interior</label>
                        <div id="poligonoInterior{{ $index }}" class="analysis-matrix"></div>
                    </x-sheets.section>
                @endforeach
            </div>
            <div class="foundation-entry-note arco-note">Datos de ejemplo editables: todos los contornos incluyen tres
                vértices válidos. El área y las inercias iniciales corresponden al exterior sin huecos. Sustituye estos
                datos por los de tu proyecto; si activas interiores o cambias la geometría, actualiza también sus
                propiedades. Los interiores desactivados no se incluyen en el cálculo.</div>
            <div class="arco-calculate analysis-actions">
                <button class="pr-button" id="calcular" type="submit">Calcular cimentación <span
                        aria-hidden="true">→</span></button>
                <button class="pr-button pr-button-secondary" id="generarPDF" type="button">Exportar reporte</button>
            </div>
        </form>
    </x-sheets.panel>
    <section id="resultados" class="arco-results analysis-results" aria-label="Resultados del análisis de cimentación">
        <x-sheets.panel title="Resultados del análisis" number="02"
            description="Calcula la cimentación para consultar las distribuciones de presión por combinación de carga.">
            <p class="analysis-result-block arco-note">Los gráficos se organizan automáticamente según los resultados
                disponibles.</p>
        </x-sheets.panel>
        @foreach (range(1, 11) as $index)
            <x-sheets.panel title="Combinación {{ $index }}" :number="str_pad($index + 2, 2, '0', STR_PAD_LEFT)" class="analysis-combinations">
                <div id="zapata{{ $index }}" class="analysis-plot"></div>
            </x-sheets.panel>
        @endforeach
    </section>
</x-sheets.workbench>
