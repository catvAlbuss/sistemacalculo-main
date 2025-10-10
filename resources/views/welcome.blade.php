@extends('layouts.landing')

@section('main')
  <!-- Main Content -->
  <main class="flex flex-1 flex-col justify-center py-6">
    <div class="mx-auto max-w-7xl p-6 lg:p-8">
      <!-- Grid 2x2 with Tailwind CSS -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- First row, first column (Logo) -->
        <div
          class="flex flex-col items-start justify-start rounded bg-white p-6 text-gray-950 shadow dark:bg-gray-900 dark:text-gray-50">
          <img class="m-auto h-20 w-20 dark:invert" src="{{ Vite::asset('resources/img/logo_rizabalAsociados.png') }}"
            alt="Rizabal Asociados Logo">
          <p class="mt-4 text-justify">
            En Rizabal & Asociados, ofrecemos programas avanzados de análisis y diseño estructural para
            edificaciones, puentes y muros de sostenimiento. Simplifica tus proyectos, ahorra tiempo y
            garantiza precisión con nuestras herramientas.
          </p>
          <p class="mt-4 pl-4 text-justify">
            ✔ Resultados rápidos y precisos: Diseña estructuras seguras y eficientes en minutos.
          </p>
          <p class="mt-4 pl-4 text-justify">
            ✔ Fácil de usar: Interfaz intuitiva para profesionales de la ingeniería.
          </p>
          <p class="mt-4 pl-4 text-justify">
            ✔ Cumplimiento normativo: Programas actualizados según las normativas vigentes.
          </p>
          <p class="mt-4 text-justify">
            ¡Eleva el nivel de tus proyectos con Rizabal & Asociados! ¡Empieza hoy!
          </p>
        </div>
        <!-- First row, second column -->
        <livewire:login />
      </div>
    </div>
  </main>
@endsection
