@props([
    'id', 'label' => null, 'symbol' => null, 'unit' => null,
    'value' => '', 'min' => null, 'step' => 'any',
    'options' => null,
    'bind' => null,
    'name' => null,
    'show' => null,
    'type' => 'number',
])
{{-- Campo numérico o select de una hoja.
     options: ['A' => 'Texto'] o [['value' => 'A', 'name' => 'Texto', 'selected' => true]].
     bind:    expresión Alpine (x-model); sin bind, el campo usa value y name para formularios.
     min:     sin valor, el campo no limita el mínimo.
     type:    'number' (por defecto) o 'text'.
     show:    expresión Alpine para mostrar u ocultar el campo (x-show); el valor se sigue enviando. --}}
@php
    $choices = $options === null ? null : collect($options)->map(fn ($option, $key) => is_array($option)
        ? ['value' => $option['value'], 'text' => $option['name'] ?? $option['value'], 'selected' => ($option['selected'] ?? false) || (string) $option['value'] === (string) $value]
        : ['value' => $key, 'text' => $option, 'selected' => (string) $key === (string) $value])->values();
    $unitId = $unit ? $id.'-unit' : null;
@endphp
<div class="pr-field" @if($show) x-show="{{ $show }}" x-cloak @endif>
    <x-sheets.label :for="$id" :text="$label" :symbol="$symbol" />
    <div class="arco-input-wrap">
        @if($choices !== null)
            <select id="{{ $id }}" @if($bind) x-model="{{ $bind }}" @else name="{{ $name ?? $id }}" @endif required
                @if($unitId) aria-describedby="{{ $unitId }}" @endif {{ $attributes->class(['pr-input']) }}>
                @foreach($choices as $choice)<option value="{{ $choice['value'] }}" @selected($choice['selected'])>{{ $choice['text'] }}</option>@endforeach
            </select>
        @else
            <input id="{{ $id }}" type="{{ $type }}" @if($type === 'number') inputmode="decimal" step="{{ $step }}" @if($min !== null) min="{{ $min }}" @endif @endif required
                @if($bind) x-model.number="{{ $bind }}" @else name="{{ $name ?? $id }}" value="{{ $value }}" @endif
                @if($unitId) aria-describedby="{{ $unitId }}" @endif {{ $attributes->class(['pr-input']) }}>
        @endif
        @if($unit)<span class="arco-unit" id="{{ $unitId }}">{{ $unit }}</span>@endif
    </div>
</div>
