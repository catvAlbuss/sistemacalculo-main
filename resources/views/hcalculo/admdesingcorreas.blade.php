@php($columns = '<tr><th scope="col">Parámetro</th><th scope="col">Símbolo</th><th scope="col">Fórmula</th><th scope="col">Resultado</th></tr>')
<x-sheets.workbench sheet="madera-correas" title="Diseño de correas" entry="resources/js/adm_correa.js" auto
  eyebrow="Herramientas de ingeniería / Estructuras de madera"
  description="Diseño de correas de madera: propiedades del grupo estructural, dimensionamiento y verificaciones de módulo de sección, deformaciones, corte, estabilidad lateral y longitud de apoyo.">
  <x-sheets.panel title="Datos generales" description="Madera, sección, luz y solicitaciones de la correa." number="01" class="arco-input-panel" data-sheet-inputs>
    <div class="arco-fields">
      <x-sheets.fieldset title="Madera y sección" note="Dimensiones comerciales de la escuadría.">
        <x-sheets.field id="selectabc" label="Grupo estructural" value="A" :options="['A' => 'A', 'B' => 'B', 'C' => 'C']" />
        <x-sheets.field id="base" label="Base" symbol="b" value="2" unit="pulg" min="0.01" />
        <x-sheets.field id="altura" label="Altura" symbol="h" value="4" unit="pulg" min="0.01" />
        <x-sheets.field id="luz" label="Luz" symbol="L" value="4.5" unit="m" min="0.01" />
      </x-sheets.fieldset>
      <x-sheets.fieldset title="Solicitaciones" note="Momento y cortante de diseño y deflexiones por carga muerta y viva.">
        <x-sheets.field id="momentoultimo" label="Momento" symbol="M" value="13.7" unit="kg·m" min="0" />
        <x-sheets.field id="vucortante" label="Cortante" symbol="V" value="22.71" unit="kg" min="0" />
        <x-sheets.field id="DCM" label="Deflexión por carga muerta" symbol="δCM" value="0.006" unit="m" min="0" />
        <x-sheets.field id="DCV" label="Deflexión por carga viva" symbol="δCV" value="0.0024" unit="m" min="0" />
      </x-sheets.fieldset>
    </div>
    <x-sheets.calculate type="button" id="desingButton" />
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de correas">
    <x-sheets.results-header status-id="correas-status" description="Propiedades, dimensionamiento y verificaciones de la correa." />
    <x-sheets.results id="correas_resultados">
      <section class="pr-panel arco-result-card">
        <div class="arco-table-scroll" role="region" aria-label="Resultados del diseño de correas" tabindex="0">
          <table class="arco-table beam-result-table" id="desingcorte">
            <thead><tr><th colspan="4" scope="colgroup">1. Propiedades del grupo estructural</th></tr>{!! $columns !!}</thead>
            <tbody id="predimenension"></tbody>
            <thead><tr><th colspan="4" scope="colgroup">2. Dimensionamiento</th></tr>{!! $columns !!}</thead>
            <tbody id="dimensionamiento"></tbody>
            <thead><tr><th colspan="4" scope="colgroup">3. Diseño en madera</th></tr></thead>
            <tbody id="desingFlexion"></tbody>
            <thead><tr><th colspan="4" scope="colgroup">3.1 Verificación del módulo de sección</th></tr>{!! $columns !!}</thead>
            <tbody id="modulo41"></tbody>
            <thead><tr><th colspan="4" scope="colgroup">3.2 Verificación de deformaciones</th></tr>{!! $columns !!}</thead>
            <tbody id="modulo42"></tbody>
            <thead><tr><th colspan="4" scope="colgroup">3.3 Verificación del esfuerzo cortante</th></tr>{!! $columns !!}</thead>
            <tbody id="modulo43"></tbody>
            <thead><tr><th colspan="4" scope="colgroup">3.4 Verificación de la estabilidad lateral</th></tr>{!! $columns !!}</thead>
            <tbody id="modulo44"></tbody>
            <thead><tr><th colspan="4" scope="colgroup">3.5 Longitud del apoyo</th></tr>{!! $columns !!}</thead>
            <tbody id="modulo45"></tbody>
          </table>
        </div>
      </section>
    </x-sheets.results>
  </section>
</x-sheets.workbench>
