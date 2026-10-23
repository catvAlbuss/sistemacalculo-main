@extends('layouts.landing')
@section('main')
<main class="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 text-gray-800 dark:text-gray-100">
    <h1 class="text-3xl font-bold">{{ $title }}</h1>
    <p class="text-sm">Versión {{ config('legal.version') }} · Servicio digital de Rizabal &amp; Asociados.</p>
    <div class="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 leading-relaxed text-gray-800">
        @include('legal.'.$document)
    </div>
    <a href="{{ route('landing.plans') }}" class="font-semibold text-blue-600 underline">Ver planes y precios</a>
</main>
@endsection
