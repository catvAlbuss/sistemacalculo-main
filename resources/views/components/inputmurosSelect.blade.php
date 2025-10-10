@props([
    'label' => 'Label',
    'id' => 'input-id',
    'name' => 'input-name',
    'disabled' => false,
    'multiple' => false
])



<div class="md:flex md:items-center mb-2">
    <div class="md:w-1/3">
        <label class="block text-xs text-gray-950 font-bold md:text-right mb-1 md:mb-0 pr-4" for="{{ $id }}">
            {{ $label }}
        </label>
    </div>
    <div class="md:w-2/3">
        <select id="{{ $id }}" name="{{ $name }}" {{ $disabled ? 'disabled' : '' }} {!! $attributes->merge(['class' => 'bg-white appearance-none border-2 border-gray-950 rounded-lg w-full py-2 px-4 text-gray-950 leading-tight focus:outline-none focus:bg-white focus:border-blue-500']) !!} {{ $multiple ? 'multiple' : '' }}>
            {{ $slot }}
        </select>

        {{-- <input
            class="bg-white appearance-none border-2 border-gray-950 rounded-lg w-full py-2 px-4 text-gray-950 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            id="{{ $id }}" name="{{ $name }}" type="{{ $type }}" value="{{ $value }}"> --}}
    </div>
</div>
