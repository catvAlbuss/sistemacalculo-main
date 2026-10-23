<a @if($active) aria-current="page" @endif {{ $attributes->merge(['class' => $get_class()]) }}>
  {{ $slot }}
</a>
