@php
    $method = $paymentRequest->payment_method;
    $currency = $paymentRequest->currency === 'USD' ? 'US$' : 'S/';
@endphp
<x-mail.layout title="Solicitud registrada" :reference="'Solicitud N.° '.$paymentRequest->id" :preheader="'Registramos su solicitud de '.$plan->name">
    <x-mail.text>Estimado(a) {{ $user->name }}:</x-mail.text>
    @if ($method === 'free')
        <x-mail.text>Su prueba gratuita se encuentra activa. Dispone de 5 días desde el registro, por una sola vez por cuenta; luego necesitará un plan pagado para continuar.</x-mail.text>
    @elseif ($method === 'culqi')
        <x-mail.text>Registramos su solicitud de {{ $plan->name }}. El acceso se activa cuando Culqi confirma el cobro.</x-mail.text>
    @else
        <x-mail.text>Registramos su solicitud. Nos comunicaremos con usted para coordinar el precio y las condiciones de su acceso.</x-mail.text>
    @endif

    <x-mail.section title="Detalle de la solicitud">
        <x-mail.row label="Plan">{{ $plan->name }}</x-mail.row>
        <x-mail.row label="Duración">{{ $plan->duration_text }}</x-mail.row>
        <x-mail.row label="Usuarios">{{ $plan->max_users }}</x-mail.row>
        @if ($plan->type !== 'lifetime')
            <x-mail.row label="Importe" strong>{{ $method === 'free' ? 'Sin costo' : $currency.' '.number_format($paymentRequest->charge_amount ?? $plan->price, 2) }}</x-mail.row>
        @endif
    </x-mail.section>

    @if ($activationUrl)
        <x-mail.section title="Acceso a su cuenta">
            <x-mail.row label="Usuario">{{ $user->email }}</x-mail.row>
        </x-mail.section>
        <x-mail.text>Por seguridad no enviamos contraseñas por correo. Defina la suya mediante el siguiente enlace personal. Si vence, solicite otro desde la opción de recuperar contraseña.</x-mail.text>
    @endif

    <x-mail.actions>
        @if ($activationUrl)<x-mail.button :href="$activationUrl">Crear mi contraseña</x-mail.button>@endif
        @if ($method === 'culqi')
            <x-mail.button :href="\App\Http\Controllers\CulqiController::paymentUrl($paymentRequest)" :secondary="(bool) $activationUrl">Completar el pago</x-mail.button>
        @elseif (!$activationUrl)
            <x-mail.button :href="url('/login')">Ingresar a mi cuenta</x-mail.button>
        @endif
    </x-mail.actions>
</x-mail.layout>
