@props(['label' => 'Calcular diseño', 'note' => 'Recalcula después de editar los datos.', 'type' => 'submit'])
<div class="arco-calculate">
    <button {{ $attributes->class(['pr-button'])->merge(['type' => $type]) }}>{{ $label }} <span aria-hidden="true">→</span></button>
    @if($note)<p class="arco-note">{{ $note }}</p>@endif
</div>
