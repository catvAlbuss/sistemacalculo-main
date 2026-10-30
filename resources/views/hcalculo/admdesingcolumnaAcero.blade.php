{{-- Los selects .formas y .aceros los llena el motor con el catálogo de perfiles y aceros; data-selected fija el valor inicial. --}}
<x-sheets.workbench sheet="columna-acero" title="Diseño de columnas de acero" entry="resources/js/adm_columnasAceros.js" auto
  eyebrow="Herramientas de ingeniería / Estructuras de acero"
  description="Diseño de columnas de perfiles W, S, M y HP: propiedades de la sección, longitud efectiva según las vigas y columnas que concurren, esbeltez, pandeo local y resistencia a flexocompresión.">
  <x-sheets.panel title="Datos generales" description="Perfil, solicitaciones, condiciones de apoyo y elementos que concurren al nudo." number="01" class="arco-input-panel" data-sheet-inputs>
    <div class="arco-fields">
      <x-sheets.fieldset title="Perfil y material">
        <x-sheets.field id="I8" name="psc" label="Perfil de la columna" :options="[]" class="formas" data-selected="W12X106" />
        <x-sheets.field id="I18" name="Ta" label="Tipo de acero" :options="[]" class="aceros" data-selected="A-572 Gr. 50" />
        <x-sheets.field id="I20" name="Es" label="Módulo de elasticidad" symbol="Es" value="2039432" unit="kg/cm²" min="0" />
        <x-sheets.field id="I21" name="G" label="Módulo de corte" symbol="G" value="787221" unit="kg/cm²" min="0" />
      </x-sheets.fieldset>
      <x-sheets.fieldset title="Solicitaciones de diseño">
        <x-sheets.field id="I9" name="pu" label="Carga axial a compresión" symbol="Pu" value="185.4" unit="t" />
        <x-sheets.field id="I10" name="Mux" label="Momento último en el eje X" symbol="Mux" value="6.2" unit="t·m" />
        <x-sheets.field id="I11" name="Muy" label="Momento último en el eje Y" symbol="Muy" value="4.1" unit="t·m" />
      </x-sheets.fieldset>
      <x-sheets.fieldset title="Apoyo y longitudes">
        <x-sheets.field id="I12" name="ca" label="Condición de apoyo en la base" value="Empotrado" :options="['Empotrado' => 'Empotrado', 'Articulado' => 'Articulado']" />
        <x-sheets.field id="I13" name="dlixx" label="Desplazamiento lateral impedido en X-X" value="No" :options="['Si' => 'Sí', 'No' => 'No']" />
        <x-sheets.field id="I14" name="dliyy" label="Desplazamiento lateral impedido en Y-Y" value="No" :options="['Si' => 'Sí', 'No' => 'No']" />
        <x-sheets.field id="I15" name="Lx" label="Longitud libre en X" symbol="Lx" value="3" unit="m" min="0" />
        <x-sheets.field id="I16" name="Ly" label="Longitud libre en Y" symbol="Ly" value="3" unit="m" min="0" />
      </x-sheets.fieldset>
      <x-sheets.fieldset title="Elementos en el nudo" note="Perfiles y longitudes de las vigas y de la columna que concurren.">
        @foreach ([['M24', 'v1', 'W16X36', 'M25', 'L1', 7], ['E30', 'v2', 'W16X36', 'E31', 'L2', 7], ['E24', 'v3', 'W14X26', 'E25', 'L3', 5], ['M30', 'v4', 'W14X26', 'M31', 'L4', 5]] as $n => [$perfilId, $perfil, $defecto, $longId, $long, $valor])
          <x-sheets.field :id="$perfilId" :name="$perfil" :label="'Viga '.($n + 1)" :options="[]" class="formas" :data-selected="$defecto" />
          <x-sheets.field :id="$longId" :name="$long" :label="'Longitud de la viga '.($n + 1)" :symbol="$long" :value="$valor" unit="m" min="0" />
        @endforeach
        <x-sheets.field id="I23" name="c2" label="Columna superior" :options="[]" class="formas" data-selected="W12X106" />
        <x-sheets.field id="I24" name="L5" label="Longitud de la columna superior" symbol="L5" value="3" unit="m" min="0" />
      </x-sheets.fieldset>
    </div>
    <p class="arco-note sheet-live-note">Los resultados se recalculan al editar los datos.</p>
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de columnas de acero">
    <x-sheets.results-header status-id="columna-acero-status" description="Requisitos, propiedades geométricas, esbeltez, pandeo local y resistencia."
      :exports="['btn_pdf_predim' => 'Exportar PDF']" />
    <x-sheets.results id="columnaAcero_pdf" ready>
      <section class="pr-panel arco-result-card">
        <div class="arco-table-scroll" role="region" aria-label="Resultados del diseño de columnas de acero" tabindex="0">
          @include('hcalculo.partials.columna-acero-resultados')
        </div>
      </section>
    </x-sheets.results>
  </section>
  @pushOnce('scripts')
    <script src="https://cdn.jsdelivr.net/npm/hyperformula@2.7.1/dist/hyperformula.full.min.js"></script>
  @endpushOnce
</x-sheets.workbench>
