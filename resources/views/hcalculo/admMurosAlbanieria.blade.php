<x-sheets.workbench sheet="muros-albanileria" title="Diseño de muros de albañilería" entry="resources/js/adm_muros_albanieria.js" auto
  eyebrow="Herramientas de ingeniería / Albañilería"
  description="Diseño de muros de albañilería confinada: cargas y combinaciones, verificación del agrietamiento, necesidad de refuerzo horizontal y sección de las columnas de confinamiento.">
  <x-sheets.panel title="Datos generales" description="Identificación, geometría, cargas y datos de los elementos de confinamiento." number="01" class="arco-input-panel" data-sheet-inputs>
    <form id="datamurosAlb" action="{{ route('malbaCont') }}" method="post">
      @csrf
      <div class="arco-fields">
        <x-sheets.fieldset title="Identificación">
          <x-sheets.field id="desc" type="text" label="Descripción" value="desc" />
          <x-sheets.field id="ubi" type="text" label="Ubicación" value="ubi" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Muro">
          <x-sheets.field id="fm" label="Resistencia a compresión de la albañilería" symbol="f′m" value="700" unit="t/m²" min="0" />
          <x-sheets.field id="vdm" label="Resistencia característica a corte" symbol="v′m" value="81" unit="t/m²" min="0" />
          <x-sheets.field id="l" label="Longitud" symbol="L" value="5" unit="m" min="0.01" />
          <x-sheets.field id="t" label="Espesor" symbol="t" value="0.13" unit="m" min="0.01" />
          <x-sheets.field id="h" label="Altura" symbol="h" value="2.9" unit="m" min="0.01" />
          <x-sheets.field id="lm" label="Longitud del paño mayor a 0.5 L" symbol="Lm" value="5" unit="m" min="0" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Cargas de diseño" note="Carga de gravedad y solicitaciones por sismo moderado.">
          <x-sheets.field id="pm" label="Carga de gravedad máxima" symbol="Pm" value="27.82" />
          <x-sheets.field id="ve" label="Cortante por sismo moderado" symbol="Ve" value="3.92" />
          <x-sheets.field id="me" label="Momento por sismo moderado" symbol="Me" value="18.54" />
          <x-sheets.field id="pt1" label="1/4 de la carga de muro perpendicular 1" symbol="Pt1" value="6.02" />
          <x-sheets.field id="pt2" label="1/4 de la carga de muro perpendicular 2" symbol="Pt2" value="1" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Refuerzo horizontal y confinamiento">
          <x-sheets.field id="nh" label="Número de hiladas" value="2" :options="['2' => '2 hiladas', '3' => '3 hiladas']" />
          <x-sheets.field id="db" label="Barra del refuerzo horizontal" symbol="Ø" value="0.395" :options="['0.395' => '8 mm', '0.250' => '1/4″']" />
          <x-sheets.field id="nc" label="Número de columnas de confinamiento" symbol="Nc" value="2" min="0" step="1" />
          <x-sheets.field id="fdc" label="Compresión del concreto de confinamiento" symbol="f′c" value="210" unit="kg/cm²" min="0.01" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Columnas de confinamiento">
          <x-sheets.field id="pce" label="Factor Ø, columna exterior" value="0.7" min="0" />
          <x-sheets.field id="pci" label="Factor Ø, columna interior" value="0.7" min="0" />
          <x-sheets.field id="dce" label="Factor δ, columna exterior" value="1" min="0" />
          <x-sheets.field id="dci" label="Factor δ, columna interior" value="1" min="0" />
          <x-sheets.field id="pcex" label="Peralte de la columna exterior" value="0.15" unit="m" min="0" />
          <x-sheets.field id="pcin" label="Peralte de la columna interior" value="0.1" unit="m" min="0" />
          <x-sheets.field id="dmtr" label="Diámetro del refuerzo" symbol="Ø" value="0.71" :options="['0.71' => '3/8″']" />
        </x-sheets.fieldset>
      </div>
      <x-sheets.calculate />
    </form>
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de muros de albañilería">
    <x-sheets.results-header status-id="muros-albanileria-status" description="Cargas, agrietamiento, refuerzo horizontal y columnas de confinamiento."
      :exports="['btn_pdf_predim' => 'Exportar PDF']" />
    <div id="murosalba_pdf">
      <x-sheets.results id="resultadoMalba" />
    </div>
  </section>
</x-sheets.workbench>
