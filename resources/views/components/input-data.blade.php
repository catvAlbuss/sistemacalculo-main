@props(['title' => 'Datos generales', 'description' => 'Datos del elemento y de las solicitaciones.'])
{{-- Panel de entrada de las hojas reactivas (Alpine). Marcado compartido con x-sheets.panel. --}}
<x-sheets.panel :title="$title" :description="$description" number="01" class="arco-input-panel" data-sheet-inputs>
  <div class="arco-fields">
    <div class="arco-field-grid">{{ $slot }}</div>
  </div>
  @isset($actions)
    <div class="arco-calculate">{{ $actions }}</div>
  @endisset
</x-sheets.panel>
