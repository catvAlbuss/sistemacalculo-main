@props(['title' => null, 'publicNavigation' => false])

@extends('layouts.base')

@section('content')
  @if ($publicNavigation || auth()->guest())
    <x-navigation-landing />
  @endif
  @if (!empty($title))
    <x-header :title="$title"></x-header>
  @endif
  <x-mathjax-loader></x-mathjax-loader>
  {{ $slot }}
  @pushOnce('scripts')
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3.0.1/es5/tex-mml-chtml.js"></script>
  @endpushOnce
@endsection
