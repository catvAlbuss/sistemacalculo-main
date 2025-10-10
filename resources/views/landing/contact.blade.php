@extends('layouts.landing')

@section('main')
  <!-- Main Content -->
  <main class="flex flex-1 flex-col content-center items-center">
    <!-- Grid 2x2 with Tailwind CSS -->
    <div class="mx-auto grid max-w-7xl flex-1 grid-cols-1 gap-4 p-6 md:grid-cols-3 lg:p-8">
      <!-- First row, first column (Logo) -->
      <div
        class="col-span-2 flex flex-col items-center justify-center rounded bg-gray-50 p-6 text-gray-950 shadow dark:bg-gray-900 dark:text-gray-50">
        <!-- Detalles de contacto -->
        <div class="rounded bg-white p-6 text-gray-950 shadow-md dark:bg-gray-900 dark:text-gray-50">
          <h3 class="mb-4 text-2xl font-medium">Información de Contacto</h3>
          <p class="mb-2">📞 <strong>Teléfono:</strong> +51 953 992 277</p>
          <p class="mb-2">📧 <strong>Email:</strong> rizabalasociados.estructurales@gmail.com</p>
          <p class="mb-2">📍 <strong>Dirección:</strong> Av. Javier Heraud #110 – Amarilis – Huánuco</p>
        </div>
      </div>
      <!-- First row, second column -->
      <div class="rounded border border-gray-50 bg-white p-6 text-gray-950 shadow-md dark:bg-gray-900 dark:text-gray-50">
        <h3 class="mb-4 text-2xl font-medium">Contactenos y adquire su cuenta por tan solo S/: 50.00</h3>
        <!-- Session Status -->
        <form method="POST" action="{{ route('cotizarplano') }}" enctype="multipart/form-data">
          @csrf
          <!-- Nombre -->
          <div>
            <x-input-label for="nombre" :value="__('Nombres Completos:')" />
            <x-text-input class="mt-1 block w-full" id="nombre" name="nombre" type="text" :value="old('nombre')"
              required autofocus />
            <x-input-error class="mt-2" :messages="$errors->get('nombre')" />
          </div>
          <!-- Celular -->
          <div class="mt-4">
            <x-input-label for="celular" :value="__('Celular:')" />
            <x-text-input class="mt-1 block w-full" id="celular" name="celular" type="tel" :value="old('celular')"
              required />
            <x-input-error class="mt-2" :messages="$errors->get('celular')" />
          </div>
          <!-- Correo Electrónico -->
          <div class="mt-4">
            <x-input-label for="email" :value="__('Correo Electronico:')" />
            <x-text-input class="mt-1 block w-full" id="email" name="email" type="email" :value="old('email')"
              required />
            <x-input-error class="mt-2" :messages="$errors->get('email')" />
          </div>
          <!-- Archivo -->
          <div class="mt-4">
            <x-input-label for="archivo" :value="__('Adjunta tu FACTURA:')" />
            <input class="mt-1 block w-full" id="archivo" name="archivo" type="file" accept="application/pdf/jpg/png"
              required />
            <x-input-error class="mt-2" :messages="$errors->get('archivo')" />
          </div>
          <div class="mt-4 flex items-center justify-end">
            <x-primary-button class="ms-3">
              {{ __('Enviar') }}
            </x-primary-button>
          </div>
          <h4 class="text-gray-950 dark:text-gray-50">Revisa tu Correo Electronico donde se te enviara el usuario y
            contraseña</h4>
        </form>
      </div>
    </div>
  </main>
@endsection
