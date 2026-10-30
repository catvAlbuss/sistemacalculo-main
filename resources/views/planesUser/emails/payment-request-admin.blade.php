@php
    $method = $paymentRequest->payment_method;
    $phone = preg_replace('/\D/', '', (string) $paymentRequest->phone);
    $status = ['culqi' => 'Pendiente de pago en Culqi', 'free' => 'Prueba gratuita activada, sin pago', 'quote' => 'Por coordinar con el cliente'][$method] ?? 'Por verificar';
@endphp
<x-mail.layout title="Nueva solicitud registrada" :reference="'Solicitud N.° '.$paymentRequest->id" :preheader="$paymentRequest->name.' - '.$plan->name">
    <x-mail.section title="Cliente">
        <x-mail.row label="Nombre">{{ $paymentRequest->name }}</x-mail.row>
        <x-mail.row label="Correo">{{ $paymentRequest->email }}</x-mail.row>
        <x-mail.row label="Teléfono">{{ $paymentRequest->phone }}</x-mail.row>
        <x-mail.row label="ID de usuario">{{ $user->id }}</x-mail.row>
    </x-mail.section>

    <x-mail.section title="Solicitud">
        <x-mail.row label="Plan">{{ $plan->name }}</x-mail.row>
        <x-mail.row label="Duración">{{ $plan->duration_text }}</x-mail.row>
        <x-mail.row label="Usuarios">{{ $plan->max_users }}</x-mail.row>
        <x-mail.row label="Importe">S/ {{ number_format($paymentRequest->amount, 2) }}</x-mail.row>
        <x-mail.row label="Estado">{{ $status }}</x-mail.row>
        <x-mail.row label="Fecha">{{ $paymentRequest->created_at->timezone('America/Lima')->format('d/m/Y H:i') }}</x-mail.row>
    </x-mail.section>

    @if ($paymentRequest->message)
        <x-mail.section title="Mensaje del cliente">
            <tr><td style="padding:10px 0;color:#374151;font-size:13px;line-height:1.6;">{{ $paymentRequest->message }}</td></tr>
        </x-mail.section>
    @endif

    @if ($method === 'culqi')
        <x-mail.note>Pago en línea: la cobertura se activa sola cuando Culqi confirma el cargo. No requiere aprobación manual; recibirá otro aviso al confirmarse.</x-mail.note>
    @elseif ($paymentRequest->payment_proof)
        <x-mail.note>El comprobante enviado por el cliente se adjunta a este correo.</x-mail.note>
    @endif

    <x-mail.actions>
        <x-mail.button :href="route('payments.admin.show', $paymentRequest)">Abrir en administración</x-mail.button>
        <x-mail.button :href="'https://wa.me/'.$phone" secondary>Contactar por WhatsApp</x-mail.button>
    </x-mail.actions>
</x-mail.layout>
