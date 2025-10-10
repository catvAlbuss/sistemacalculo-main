<div class="result-item">
    <span class="result-name">{{ $namedato }}</span>
    <span class="result-label">{{ $label }} =</span>
    <span class="result-value" id="{{ $id }}">{{ $value }}</span>
    @if($units)
        <span class="result-units">{{ $units }}</span>
    @endif
</div>
