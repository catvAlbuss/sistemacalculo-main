@props([
    'label' => 'Label',
    'id' => 'input-id',
    'name' => 'input-name',
    'disabled' => false
])

<div class="md:flex md:items-center mb-2">
    <div class="w-1/7">
        <input type="checkbox" 
            id="{{ $id }}"
            name="{{ $name }}"
            {{ $disabled ? 'disabled' : '' }}
            {{ $attributes->merge(['class' => 'rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-500 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800']) }}>
    </div>
    <div class="w-5/7">
        <label class="block text-xs text-gray-50 px-2 dark:text-gray-950 font-bold md:text-left " for="{{ $id }}">
            {{ $label }}
        </label>
    </div>

</div>
