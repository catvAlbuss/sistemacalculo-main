<div class="mb-2 flex items-center" x-data="{ value: {{ $bind ?? ($minimun ?? 0) }} }"
  @isset($bind)
    x-effect="value={{ $bind }}"
@endisset>
  <label class="w-1/3 text-xs font-bold text-gray-700" for="input">
    {{ $label }}
  </label>
  <input
    class="w-4/5 rounded-md border bg-gray-50 px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
    id="input" type="number" max='{{ $max ?? 'any' }}' step='{{ $step ?? 'any' }}' x-model.number="value"
    @if (isset($minimun) && isset($bind)) @input="if(value <{{ $minimun }}) { value={{ $minimun }}; } else { {{ $bind }} = value;{{ $handleInput }} }"
        @else
            @input="{{ $bind }} = value;{{ $handleInput }}" @endif
    @if (isset($disabled) ? $disabled : false) disabled @endif>
</div>
