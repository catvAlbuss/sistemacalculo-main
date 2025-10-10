@extends('layouts.landing')

@section('main')
  <main class="flex flex-1 flex-col items-center justify-center py-6">
    <div class="mx-auto max-w-7xl p-6 lg:p-8">
      <!-- Grid 2x2 with Tailwind CSS -->
      <div class="grid grid-cols-[1fr] gap-4 md:grid-cols-3">
        <!-- First row, first column (Logo) -->
        <div
          class="row-span-2 flex flex-col items-center justify-center rounded bg-gray-50 p-6 text-gray-950 shadow md:col-span-2 dark:bg-gray-900 dark:text-gray-50">
          @yield('mid')
        </div>
        <!-- First row, second column -->
        <div class="hidden rounded bg-white p-6 shadow md:block">
          @yield('top_left')
        </div>
        <div class="rounded bg-white p-6 shadow">
          <h3 class="text-center font-bold text-gray-950 dark:text-gray-950">Cotiza tu proyecto</h3>
          <!-- Session Status -->
          <form method="POST" action="{{ route('cotizarplano') }}" enctype="multipart/form-data">
            @csrf
            <!-- Nombre -->
            <div>
              <x-input-label for="nombre" :value="__('Nombre')" />
              <x-text-input class="mt-1 block w-full" id="nombre" name="nombre" type="text" :value="old('nombre')"
                required autofocus />
              <x-input-error class="mt-2" :messages="$errors->get('nombre')" />
            </div>
            <!-- Celular -->
            <div class="mt-4">
              <x-input-label for="celular" :value="__('Celular')" />
              <x-text-input class="mt-1 block w-full" id="celular" name="celular" type="tel" :value="old('celular')"
                required />
              <x-input-error class="mt-2" :messages="$errors->get('celular')" />
            </div>
            <!-- Correo Electrónico -->
            <div class="mt-4">
              <x-input-label for="email" :value="__('Correo Electrónico')" />
              <x-text-input class="mt-1 block w-full" id="email" name="email" type="email" :value="old('email')"
                required />
              <x-input-error class="mt-2" :messages="$errors->get('email')" />
            </div>
            <!-- Archivo -->
            <div class="mt-4">
              <x-input-label for="archivo" :value="__('Adjunta tu plano en formato PDF')" />
              <input class="mt-1 block w-full" id="archivo" name="archivo" type="file" accept="application/pdf"
                required />
              <x-input-error class="mt-2" :messages="$errors->get('archivo')" />
            </div>
            <div class="mt-4 flex items-center justify-end">
              <x-primary-button class="ms-3">
                {{ __('Enviar') }}
              </x-primary-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
@endsection
