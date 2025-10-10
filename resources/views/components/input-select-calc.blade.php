<tr class="bg-white dark:bg-gray-800">
  <th class="py-2">{{ $name ?? '-' }}</th>
  <th class="py-2">{{ $symbol ?? '-' }}</th>
  <th class="py-2">
    <select class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      x-model="{{ $bind ?? '' }}" required>
      @foreach ($options as $option)
        <option value='{{ $option['value'] }}' @selected($option['selected'] ?? false)>{{ $option['name'] ?? $option['value'] }}
        </option>
      @endforeach
    </select>
  </th>
  <th class="py-2{{--  pl-1 text-left --}}">{{ $unit ?? '-' }}</th>
</tr>
