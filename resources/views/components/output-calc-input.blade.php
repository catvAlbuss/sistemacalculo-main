<tr class="bg-gray-100 text-center dark:bg-gray-600">
  <td class="py-2 pl-4 text-left">{{ $name ?? '-' }}</td>
  <td class="py-2">{{ $symbol ?? '-' }}</td>
  <td class="py-2"><span class='{{ $bind }}' x-text='format("{{ $bind }}",{{ $bind }})'
      x-effect="highlight($el, {{ $bind }})"></span>
  </td>
  <td class="py-2">{{ $unit ?? '' }}</td>
</tr>
