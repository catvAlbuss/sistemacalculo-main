@props(['name' => null, 'symbol' => null, 'attr' => [], 'bind' => '', 'unit' => null])
{{-- Adaptador de las hojas Alpine (madera y acero) sobre x-sheets.field. --}}
<x-sheets.field :id="'campo-'.\Illuminate\Support\Str::slug(str_replace('.', '-', $bind))" :label="$name" :symbol="$symbol"
  :unit="$unit" :bind="$bind" {{ $attributes->merge($attr) }} />
