<div class="mb-2 flex items-center">
  <label class="w-1/3 text-xs font-bold text-gray-700" for="input">
    {{ $label }}
  </label>
  <select
    class="w-4/5 rounded-md border bg-gray-50 px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
    id="input" name="input" @change="{!! $handleInput ?? '' !!}" x-model="{{ $bind }}"
    @disabled($disabled ?? false)>{{ $slot }}</select>
</div>
