@props([
    'label' => 'Label',
    'id' => 'input-id',
    'name' => 'input-name',
    'value' => '',
    'type' => 'text',
])

<div class="md:flex md:items-center mb-1">
    <div class="md:w-1/3">
        <label class="block text-xs text-gray-950 font-bold md:text-right mb-4 md:mb-0 pr-2" for="{{ $id }}">
            {{ $label }}
        </label>
    </div>
    <div class="md:w-2/3">
        <input
            class="bg-white text-xs appearance-none border-2 border-gray-950 rounded-lg w-full py-1 px-2 text-gray-950 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            id="{{ $id }}" name="{{ $name }}" type="{{ $type }}" value="{{ $value }}">
    </div>
</div>
