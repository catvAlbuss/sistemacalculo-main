@extends('layouts.landing')

@section('main')
    <main class="mx-auto w-full max-w-2xl px-4 py-12">
        <section class="rounded-2xl border border-gray-200 bg-white p-8 text-gray-800 shadow-lg">
            <i class="fas fa-check-circle text-5xl text-green-600" aria-hidden="true"></i>
            <h1 class="mt-5 text-3xl font-bold">Tu solicitud está registrada</h1>
            @if (session('warning'))
                <p class="mt-4 rounded-lg bg-yellow-50 p-4 text-yellow-800" role="alert">{{ session('warning') }}</p>
            @endif
            @if (session('registration'))
                <p class="mt-4 text-lg">Plan: <strong>{{ session('registration.plan') }}</strong></p>
                @if (session('registration.free'))
                    <p class="mt-3 text-gray-600">Tu acceso gratuito está listo. Duración: {{ session('registration.duration') }}. No necesitas enviar comprobante de pago.</p>
                @elseif (session('registration.custom'))
                    <p class="mt-3 text-gray-600">Te contactaremos para coordinar el precio y las condiciones de tu acceso.</p>
                @else
                    <p class="mt-3 text-gray-600">Revisa tu correo para continuar con el pago seguro mediante Culqi. Tu plan se activa cuando se confirma el cobro.</p>
                @endif
            @else
                <p class="mt-4 text-gray-600">Si ya enviaste una solicitud, revisa tu correo para conocer su estado y la información de acceso.</p>
            @endif
            <p class="mt-4 text-sm text-gray-600">Revisa también la carpeta de spam. Si necesitas ayuda con tu acceso, contáctanos.</p>
            <p class="mt-3 text-sm text-gray-600">Si tu cuenta es nueva, recibirás un enlace para crear tu contraseña. Los correos pueden tardar unos minutos.</p>
            <div class="mt-6 flex flex-wrap gap-3">
                <a href="{{ route('login') }}" class="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white">Ingresar a mi cuenta</a>
                <a href="{{ route('landing.plans') }}" class="rounded-lg border border-blue-200 px-5 py-3 font-semibold text-blue-700">Ver planes</a>
                <a href="{{ route('contacto.index') }}" class="rounded-lg border border-gray-200 px-5 py-3 text-gray-600">Contacto</a>
            </div>
        </section>
    </main>
@endsection
