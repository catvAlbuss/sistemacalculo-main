@props(['title', 'note' => ''])
<fieldset {{ $attributes->class(['arco-fieldset']) }}>
    <legend>{{ $title }}</legend>
    @if($note)<p class="arco-note">{{ $note }}</p>@endif
    <div class="arco-field-grid">{{ $slot }}</div>
</fieldset>
