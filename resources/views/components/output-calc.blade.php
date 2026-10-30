@props(['name' => null, 'symbol' => null, 'formula' => null, 'bind', 'unit' => null])
<tr>
  <td>{{ $name }}</td>
  <td>{{ $symbol }}</td>
  <td>{{ $formula }}</td>
  <td><span class="{{ $bind }}" x-text='format("{{ $bind }}",{{ $bind }})' x-effect="highlight($el, {{ $bind }})"></span>@if($unit) <span class="sheet-unit">{{ $unit }}</span>@endif</td>
</tr>
