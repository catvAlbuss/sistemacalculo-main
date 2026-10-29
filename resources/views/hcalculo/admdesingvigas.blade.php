@php
    $groups = [
        ['title'=>'Materiales', 'note'=>'Resistencias del concreto y del acero de refuerzo.', 'fields'=>[
            ['fc','Compresión del concreto','f′c','210','kg/cm²'], ['fy','Fluencia del acero','fy','4200','kg/cm²'],
        ]],
        ['title'=>'Sección de la viga', 'note'=>'Dimensiones de la sección rectangular.', 'fields'=>[
            ['base','Base','b','40','cm'], ['altura','Altura','h','90','cm'],
        ]],
        ['title'=>'Solicitaciones', 'note'=>'Acciones últimas para el diseño a flexión y corte.', 'fields'=>[
            ['momentoultimo','Momento último','Mu','18','Tn·m'], ['vucortante','Cortante último','Vu','10','Tn'],
        ]],
    ];
    $sections = [
        ['requisitos','Requisitos de diseño','Materiales, geometría y parámetros empleados.',['predimenension']],
        ['flexion','Diseño por flexión','Área requerida, límites de refuerzo y combinación de barras.',['desingFlexion','calcared','acerosfinales']],
        ['corte','Diseño por corte','Resistencia al corte y disposición de estribos.',['diseñoCortes','aceroscortes']],
    ];
    $navigation = collect($sections)->mapWithKeys(fn($section)=>['beam-'.$section[0]=>$section[1]])->all();
@endphp
<x-sheets.workbench sheet="diseno-vigas" title="Diseño de vigas" entry="resources/js/adm_desing_vigas.js"
    description="Define los materiales, la sección y las solicitaciones. Revisa el refuerzo por flexión y corte, elige una combinación de acero o crea la tuya y exporta los resultados.">
    <x-sheets.panel title="Datos generales" description="Introduce los valores en las unidades indicadas." number="01" heading-id="beam-input-title" class="arco-input-panel" data-sheet-inputs>
        <div class="arco-fields">
            @foreach($groups as $group)
                <x-sheets.fieldset :title="$group['title']" :note="$group['note']">
                    @foreach($group['fields'] as [$id,$label,$symbol,$value,$unit])
                        <x-sheets.field :id="$id" :label="$label" :symbol="$symbol" :value="$value" :unit="$unit" :min="in_array($id,['momentoultimo','vucortante']) ? '0' : '0.01'" />
                    @endforeach
                </x-sheets.fieldset>
            @endforeach
            <x-sheets.fieldset title="Configuración del refuerzo" note="Selecciona las capas y el criterio de cuantía mínima.">
                <x-sheets.field id="capas" label="Capas de acero" value="1" :options="[1=>'1 capa',2=>'2 capas',3=>'3 capas']" />
                <x-sheets.field id="cuantias" label="Cuantía mínima" value="3" :options="[1=>'0.7 √f′c / fy',2=>'0.8 √f′c / fy',3=>'14 / fy']" />
            </x-sheets.fieldset>
        </div>
        <div class="arco-calculate">
            <button id="desingButton" class="pr-button" type="button">Calcular diseño <span aria-hidden="true">→</span></button>
            <p class="arco-note">Vuelve a calcular después de modificar los datos.</p>
        </div>
    </x-sheets.panel>
    <section class="arco-results" aria-label="Resultados del diseño de vigas">
        <x-sheets.results-header status-id="beam-status" :sections="$navigation"
            :exports="['btn_pdf_predim'=>'Exportar PDF','btn_captura_resultado'=>'Exportar imagen']" />
        <div id="vigasgn" class="arco-sheet beam-sheet beam-export">
            <div class="beam-report-title"><h2>Diseño de vigas</h2><p>Concreto armado · Requisitos, flexión y corte</p></div>
            <div id="desingcorte" class="arco-result-sections">
                @foreach($sections as [$id,$title,$description,$bodies])
                    <x-sheets.panel :title="$title" :description="$description" :number="str_pad($loop->iteration,2,'0',STR_PAD_LEFT)" class="arco-result-card" id="beam-{{ $id }}">
                        <x-sheets.table :label="$title">
                            @foreach($bodies as $body)
                                <tbody id="{{ $body }}">@if($loop->first)<tr><td colspan="4" class="arco-empty">Los resultados aparecerán al calcular.</td></tr>@endif</tbody>
                            @endforeach
                        </x-sheets.table>
                    </x-sheets.panel>
                @endforeach
            </div>
        </div>
    </section>
</x-sheets.workbench>
