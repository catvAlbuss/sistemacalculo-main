<x-app-layout>
    <x-header :title="$title"></x-header>
    <x-mathjax-loader></x-mathjax-loader>
    <script>
        window.RZ_AUTH_USER_ID = @json(auth()->id() ?? 'guest');
    </script>
    {{ $slot }}
</x-app-layout>
