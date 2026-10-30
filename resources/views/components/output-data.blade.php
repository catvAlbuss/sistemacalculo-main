@props(['description' => 'Los valores se actualizan con los datos generales.'])
<section class="arco-results" aria-label="Resultados del diseño">
  <x-sheets.panel title="Resultados del diseño" :description="$description" number="02" class="arco-results-head" />
  <div class="arco-result-sections">{{ $slot }}</div>
</section>
