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
{{-- AGREGADO (ver conversación): flex-1 min-h-0 -- <body> es "flex flex-col
     min-h-screen" (layouts/base.blade.php) pero <main> no tenia altura
     definida, asi que un hijo con h-full (ej. el sistema CAD) no tenia de
     que "100%" agarrarse y terminaba creciendo segun su propio contenido
     en vez de ajustarse a la pantalla real -- causaba scroll vertical
     inesperado, sobre todo al abrir/cerrar F12. flex-1 hace que <main>
     ocupe el espacio restante de la pantalla (min-h-screen ya reserva ese
     espacio); min-h-0 es necesario para que SI pueda encogerse a ese
     tamaño (por defecto un hijo flex no se encoge bajo el alto de su
     contenido). Para paginas normales (contenido mas alto que una
     pantalla, ej. formularios largos) esto no cambia nada -- solo importa
     para paginas con un hijo que dependa de una altura porcentual, como
     el CAD. --}}
<main class="min-h-0 flex-1">
  {{ $slot }}
</main>
@endsection
