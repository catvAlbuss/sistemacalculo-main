@extends('layouts.landing')

@section('main')
    <main class="mx-auto w-full max-w-screen-xl px-4 py-12 text-gray-800 dark:text-gray-100">
        <header class="mx-auto mb-10 max-w-3xl text-center">
            <p class="mb-3 font-semibold text-blue-600">Herramientas para tus proyectos</p>
            <h1 class="text-4xl font-bold">Elige tu plan</h1>
            <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">Empieza con una prueba gratuita o elige el acceso que necesitas. Selecciona tu plan, registra tus datos y completa el pago.</p>
        </header>

        <section class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" aria-label="Planes disponibles">
            @forelse ($plans as $plan)
                @php($quote = app(\App\Services\PlanPricing::class)->quote($plan))
                <article class="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 text-gray-800 shadow-lg">
                    <span class="mb-4 text-sm font-semibold text-blue-700">{{ $plan->isFree() ? 'Empieza sin pagar' : ($plan->isLifetime() ? 'Acceso permanente' : 'Acceso completo') }}</span>
                    <h2 class="text-2xl font-bold">{{ $plan->name }}</h2>
                    <p class="mt-3 text-sm text-gray-600">{{ $plan->description }}</p>
                    <div class="my-6">
                        @if ($plan->isLifetime() && !$plan->isFree())
                            <p class="text-2xl font-bold">Consultar precio</p>
                            <p class="mt-1 text-sm text-gray-600">Coordinamos tu acceso contigo.</p>
                        @else
                            <p class="text-4xl font-bold">S/ {{ number_format($quote['total'], 2) }}</p>
                            <p class="mt-1 text-sm text-gray-600">{{ $plan->duration_text }}</p>
                            @if ($quote['discount_percent'])<p class="mt-2 text-sm font-semibold text-green-700">5 % de descuento · un cobro anual</p>@endif
                        @endif
                    </div>
                    <ul class="mb-6 space-y-3 text-sm text-gray-600">
                        <li>{{ $plan->max_users ?? 'Por definir' }} usuario(s) incluido(s)</li>
                        <li>{{ $plan->max_projects ?? 'Por definir' }} proyectos incluidos</li>
                        @foreach ($plan->features ?? [] as $feature)
                            <li class="flex items-start gap-2"><i class="fas fa-check mt-1 text-green-600" aria-hidden="true"></i><span>{{ $feature }}</span></li>
                        @endforeach
                    </ul>
                    <a href="{{ route('planes.register', ['plan' => $plan->id]) }}" class="mt-auto block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700">
                        {{ $plan->isFree() ? 'Empezar gratis' : ($plan->isLifetime() ? 'Solicitar información' : 'Elegir este plan') }}
                    </a>
                    @if ($plan->type === 'monthly' && !$plan->isFree())<a href="{{ route('planes.register', ['plan' => $plan->id, 'cycle' => 'yearly']) }}" class="mt-3 text-center text-sm font-semibold text-blue-700">Pagar anualmente y ahorrar 5 %</a>@endif
                </article>
            @empty
                <p class="col-span-full rounded-lg bg-white p-6 text-center text-gray-700" role="status">No hay planes disponibles en este momento. <a href="{{ route('contacto.index') }}" class="text-blue-700 underline">Contáctanos</a> para consultar las opciones de acceso.</p>
            @endforelse
        </section>

        <section class="mt-10 grid gap-4 md:grid-cols-3" aria-label="Cómo funciona">
            <div class="rounded-xl border border-gray-200 bg-white p-5 text-gray-800"><h2 class="font-bold">1. Elige tu acceso</h2><p class="mt-2 text-sm text-gray-600">El precio y la duración aparecen en cada plan.</p></div>
            <div class="rounded-xl border border-gray-200 bg-white p-5 text-gray-800"><h2 class="font-bold">2. Registra tus datos</h2><p class="mt-2 text-sm text-gray-600">Te enviamos la información de tu cuenta por correo.</p></div>
            <div class="rounded-xl border border-gray-200 bg-white p-5 text-gray-800"><h2 class="font-bold">3. Paga de forma segura</h2><p class="mt-2 text-sm text-gray-600">Paga con tarjeta o Yape en línea mediante Culqi. Tu plan se activa cuando la pasarela confirma el cobro.</p></div>
        </section>
        <div class="mt-10 rounded-2xl bg-blue-600 p-6 text-white">
            <h2 class="text-xl font-bold">¿Necesitas ayuda para elegir?</h2>
            <p class="mt-2">Cuéntanos qué herramientas necesitas para tus proyectos.</p>
            <a href="{{ route('contacto.index') }}" class="mt-4 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-blue-700">Hablar con nosotros</a>
        </div>
    </main>
@endsection
