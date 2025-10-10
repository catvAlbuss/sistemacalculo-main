@extends('layouts.base')

@section('content')
@section('navigation')
  <livewire:layout.navigation />
@show

<!-- Page Heading -->
@if (isset($header))
  <header class="bg-white shadow dark:bg-gray-800">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {{ $header }}
    </div>
  </header>
@endif

<!-- Page Content -->
<main>
  {{ $slot }}
</main>
@endsection
