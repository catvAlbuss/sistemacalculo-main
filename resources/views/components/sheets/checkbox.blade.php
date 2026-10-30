@props(['id', 'label', 'checked' => false, 'note' => ''])
<div class="pr-field sheet-check">
    <label class="sheet-check-label" for="{{ $id }}">
        <input id="{{ $id }}" name="{{ $id }}" type="checkbox" value="1" @checked($checked) {{ $attributes->class(['sheet-check-input']) }}>
        <span>{{ $label }}</span>
    </label>
    @if($note)<p class="arco-note">{{ $note }}</p>@endif
</div>
