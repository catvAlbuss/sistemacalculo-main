@props(['id', 'label', 'value' => '', 'symbol' => '', 'unit' => '', 'options' => null, 'min' => '0', 'step' => 'any'])
<div class="pr-field">
    <label class="pr-label" for="{{ $id }}">{{ $label }} @if($symbol)<span class="arco-symbol">{{ $symbol }}</span>@endif</label>
    @if($options !== null)
        <select id="{{ $id }}" name="{{ $id }}" {{ $attributes->class(['pr-input']) }}>
            @foreach($options as $optionValue => $text)<option value="{{ $optionValue }}" @selected((string)$optionValue === (string)$value)>{{ $text }}</option>@endforeach
        </select>
    @else
        <div class="arco-input-wrap">
            <input id="{{ $id }}" name="{{ $id }}" type="number" inputmode="decimal" step="{{ $step }}" min="{{ $min }}"
                value="{{ $value }}" required @if($unit) aria-describedby="{{ $id }}-unit" @endif {{ $attributes->class(['pr-input']) }}>
            @if($unit)<span class="arco-unit" id="{{ $id }}-unit">{{ $unit }}</span>@endif
        </div>
    @endif
</div>
