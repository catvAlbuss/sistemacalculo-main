@props(['statusId', 'exports' => [], 'sections' => [], 'description' => 'Revisa los resultados antes de exportarlos.'])
<x-sheets.panel title="Resultados del diseño" :description="$description" number="02" class="arco-results-head">
    <x-slot:actions>
        @foreach($exports as $id => $label)<button type="button" class="pr-button pr-button-secondary" id="{{ $id }}" data-sheet-export disabled>{{ $label }}</button>@endforeach
    </x-slot:actions>
    <p id="{{ $statusId }}" class="arco-status" data-sheet-status data-state="pending" role="status" aria-live="polite">Pendiente de calcular · completa los datos generales.</p>
    @if($sections)<nav class="arco-result-nav" aria-label="Secciones del diseño">
        @foreach($sections as $id => $label)<a href="#{{ $id }}">{{ $label }}</a>@endforeach
    </nav>@endif
</x-sheets.panel>
