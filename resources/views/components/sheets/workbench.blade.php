@props(['sheet', 'title', 'description', 'entry', 'eyebrow' => 'Herramientas de ingeniería / Concreto armado'])
<x-app-layout>
    <x-mathjax-loader />
    <script>window.RZ_AUTH_USER_ID = @json(auth()->id() ?? 'guest');</script>
    <div {{ $attributes->class(['engineering-surface arco-sheet beam-sheet']) }} data-sheet="{{ $sheet }}">
        <div class="pr-shell">
            <x-engineering-header :eyebrow="$eyebrow" :title="$title" :description="$description" />
            <div class="arco-workbench beam-workbench">
                {{ $slot }}
            </div>
        </div>
    </div>
    @pushOnce('scripts')
        @vite($entry)
    @endpushOnce
</x-app-layout>
