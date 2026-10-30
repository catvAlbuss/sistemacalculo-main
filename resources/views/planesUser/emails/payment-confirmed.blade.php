@php
    $money = fn ($value) => 'S/ '.number_format((float) $value, 2);
    $date = fn ($value) => $value->timezone('America/Lima')->format('d/m/Y');
    $number = $receipt?->number ?? 'Pago '.$payment->id;
@endphp
<x-mail.layout :title="$forAdmin ? 'Pago recibido' : 'Comprobante de pago'" :reference="$number"
    :preheader="'Pago confirmado por '.$money($payment->amount).' - '.$plan->name">
    @if ($forAdmin)
        <x-mail.text>Culqi confirmó el pago de {{ $payment->name }} por {{ $plan->name }}. La cobertura ya quedó registrada; no se requiere ninguna aprobación.</x-mail.text>
    @else
        <x-mail.text>Estimado(a) {{ $payment->name }}:</x-mail.text>
        <x-mail.text>Confirmamos la recepción de su pago. {{ $subscription->starts_at->isFuture() ? 'Su suscripción a '.$plan->name.' iniciará el '.$date($subscription->starts_at).'; su cobertura actual se mantiene hasta esa fecha.' : 'Su suscripción a '.$plan->name.' se encuentra activa.' }} A continuación encontrará el detalle de la operación.</x-mail.text>
    @endif

    @if ($forAdmin)
        <x-mail.section title="Cliente">
            <x-mail.row label="Nombre">{{ $payment->name }}</x-mail.row>
            <x-mail.row label="Correo">{{ $payment->email }}</x-mail.row>
            <x-mail.row label="Teléfono">{{ $payment->phone }}</x-mail.row>
        </x-mail.section>
    @endif

    @if ($receipt)
        <x-mail.section title="Datos del comprobante">
            <x-mail.row label="Documento">{{ ucfirst($receipt->receipt_type) }} interna {{ $receipt->number }}</x-mail.row>
            <x-mail.row label="Fecha de emisión">{{ $receipt->issued_at->timezone('America/Lima')->format('d/m/Y H:i') }}</x-mail.row>
            <x-mail.row label="Receptor">{{ $receipt->customer_name }}</x-mail.row>
            <x-mail.row :label="$receipt->document_type">{{ $receipt->document_number }}</x-mail.row>
            @if ($receipt->customer_address)<x-mail.row label="Dirección">{{ $receipt->customer_address }}</x-mail.row>@endif
        </x-mail.section>
    @endif

    <x-mail.section title="Detalle del pago">
        <x-mail.row label="Concepto">{{ $receipt?->description ?? $plan->name }}</x-mail.row>
        @if ($receipt && $receipt->subtotal !== null && $receipt->tax_amount !== null)
            <x-mail.row label="Valor de venta">{{ $money($receipt->subtotal) }}</x-mail.row>
            <x-mail.row :label="'IGV ('.number_format((float) $receipt->tax_rate, 0).' %)'">{{ $money($receipt->tax_amount) }}</x-mail.row>
        @endif
        <x-mail.row label="Importe total" strong>{{ $money($payment->amount) }}</x-mail.row>
        @if ($payment->currency === 'USD')<x-mail.row label="Cargo en tarjeta">US$ {{ number_format((float) $payment->charge_amount, 2) }} (TC {{ $payment->exchange_rate }})</x-mail.row>@endif
    </x-mail.section>

    <x-mail.section title="Vigencia y operación">
        <x-mail.row label="Cobertura">{{ $date($subscription->starts_at) }} al {{ $subscription->ends_at ? $date($subscription->ends_at) : 'sin vencimiento' }}</x-mail.row>
        <x-mail.row label="Medio de pago">Culqi</x-mail.row>
        <x-mail.row label="N.° de operación">{{ $payment->gateway_charge_id }}</x-mail.row>
    </x-mail.section>

    <x-mail.actions>
        @if ($printUrl)<x-mail.button :href="$printUrl">Ver e imprimir comprobante</x-mail.button>@endif
        @if ($forAdmin)
            <x-mail.button :href="$adminUrl" secondary>Abrir en administración</x-mail.button>
        @else
            <x-mail.button :href="url('/dashboard')" secondary>Ingresar a mi cuenta</x-mail.button>
        @endif
    </x-mail.actions>

    @if ($receipt)<x-mail.note>Documento interno sin validez tributaria. Pendiente de emisión electrónica mediante SUNAT.</x-mail.note>@endif
</x-mail.layout>
