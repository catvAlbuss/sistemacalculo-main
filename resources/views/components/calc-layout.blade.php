<x-app-layout>
  <x-header :title="$title"></x-header>
  <x-mathjax-loader></x-mathjax-loader>
  {{ $slot }}
  @pushOnce('scripts')
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3.0.1/es5/tex-mml-chtml.js"></script>
  @endpushOnce
</x-app-layout>
