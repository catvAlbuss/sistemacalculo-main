<x-sheets.workbench sheet="losas-macizas" title="Diseño de losas macizas" entry="resources/js/adm_losas_macisas.js" auto
  description="Diseño por flexión y verificación por corte de una franja de losa maciza: peralte efectivo, acero requerido, acero mínimo y distribución del refuerzo.">
  <x-sheets.panel title="Datos generales" description="Materiales, sección de análisis y momento último." number="01" class="arco-input-panel" data-sheet-inputs>
    <form id="datosForm" method="post">
      <div class="arco-fields">
        <x-sheets.fieldset title="Materiales" note="Resistencias del concreto y del acero de refuerzo.">
          <x-sheets.field id="fc" label="Compresión del concreto" symbol="f′c" value="210" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="fy" label="Fluencia del acero" symbol="fy" value="4200" unit="kg/cm²" min="0.01" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Sección y solicitación" note="Franja de análisis de la losa.">
          <x-sheets.field id="b" label="Ancho de análisis" symbol="b" value="100" unit="cm" min="0.01" />
          <x-sheets.field id="t" label="Espesor de la losa" symbol="t" value="100" unit="cm" min="0.01" />
          <x-sheets.field id="mu" label="Momento último" symbol="Mu" value="1400000" unit="kg·cm" min="0" />
        </x-sheets.fieldset>
      </div>
      <x-sheets.calculate />
    </form>
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de losas macizas">
    <x-sheets.results-header status-id="losas-macizas-status"
      description="Requisitos de diseño, flexión y corte de la franja analizada."
      :exports="['btn_pdf_predim' => 'Exportar PDF', 'btn_captura_resultado' => 'Exportar imagen']" />
    <x-sheets.results id="losas_macizas">
      <section class="pr-panel arco-result-card">
        <div class="arco-table-scroll" role="region" aria-label="Resultados de losas macizas" tabindex="0">
          <table class="arco-table beam-result-table" id="desingcorte">
            <thead><tr><th colspan="4" scope="colgroup">1. Requisitos de diseño</th></tr>
              <tr><th scope="col">Parámetro</th><th scope="col">Símbolo</th><th scope="col">Fórmula</th><th scope="col">Resultado</th></tr></thead>
            <tbody id="resultadosiniciales"></tbody>
            <thead><tr><th colspan="4" scope="colgroup">2. Diseño por flexión</th></tr>
              <tr><th scope="col">Parámetro</th><th scope="col">Símbolo</th><th scope="col">Fórmula</th><th scope="col">Resultado</th></tr></thead>
            <tbody id="resultadoflexion"></tbody>
            <thead><tr><th colspan="4" scope="colgroup">3. Diseño por corte · cortante a una distancia d</th></tr>
              <tr><th scope="col">Parámetro</th><th scope="col">Símbolo</th><th scope="col">Fórmula</th><th scope="col">Resultado</th></tr></thead>
            <tbody id="resuladocorte"></tbody>
            <tbody id="resultados2"></tbody>
          </table>
        </div>
      </section>
    </x-sheets.results>
  </section>
</x-sheets.workbench>
