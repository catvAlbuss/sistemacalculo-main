@extends('layouts.landing')

@section('main')
    <main class="mx-auto w-full max-w-4xl px-4 py-12 text-gray-800 dark:text-gray-100">
        <h1 class="text-4xl font-bold">Hablemos de tu proyecto</h1>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">Te ayudamos con nuestras herramientas, servicios y opciones de acceso.</p>
        <section class="mt-8 grid gap-6 md:grid-cols-2" aria-label="Canales de contacto">
            <a href="mailto:{{ config('mail.admin_email') }}" class="rounded-2xl border border-gray-200 bg-white p-6 text-gray-800 shadow-lg">
                <i class="fas fa-envelope mb-4 text-3xl text-blue-600" aria-hidden="true"></i><h2 class="text-xl font-bold">Escríbenos por correo</h2><p class="mt-3 break-all text-gray-600">{{ config('mail.admin_email') }}</p>
            </a>
            <a href="https://wa.me/{{ preg_replace('/\D/', '', config('app.whatsapp_number', '51962999500')) }}" target="_blank" rel="noopener" class="rounded-2xl border border-gray-200 bg-white p-6 text-gray-800 shadow-lg">
                <i class="fab fa-whatsapp mb-4 text-3xl text-green-600" aria-hidden="true"></i><h2 class="text-xl font-bold">Conversemos por WhatsApp</h2><p class="mt-3 text-gray-600">Consulta sobre planes, pagos o soporte.</p>
            </a>
        </section>
        <section class="mt-8 rounded-2xl bg-blue-600 p-6 text-white">
            <h2 class="text-2xl font-bold">¿Quieres contratar un plan?</h2>
            <p class="mt-3">Revisa precios y herramientas, elige tu plan y continúa al registro y pago seguro.</p>
            <a href="{{ route('landing.plans') }}" class="mt-5 inline-block rounded-lg bg-white px-5 py-3 font-bold text-blue-700">Ver planes</a>
        </section>
    </main>
@endsection
