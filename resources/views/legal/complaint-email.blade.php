@php $pre = 'padding:10px 0;color:#374151;font-size:13px;line-height:1.6;white-space:pre-wrap;'; @endphp
<x-mail.layout :title="($answered ? 'Respuesta a la hoja ' : 'Registro de hoja ').$complaint->code" reference="Libro de Reclamaciones">
    <x-mail.section title="Proveedor">
        <x-mail.row label="Razón social">{{ $complaint->provider['name'] }}</x-mail.row>
        <x-mail.row label="RUC">{{ $complaint->provider['ruc'] ?? '' }}</x-mail.row>
        <x-mail.row label="Dirección">{{ $complaint->provider['address'] ?? '' }}</x-mail.row>
        <x-mail.row label="Contacto">{{ $complaint->provider['email'] ?? '' }} · {{ $complaint->provider['phone'] ?? '' }}</x-mail.row>
    </x-mail.section>
    <x-mail.section title="Registro">
        <x-mail.row label="Fecha de registro">{{ $complaint->created_at->timezone('America/Lima')->format('d/m/Y H:i') }}</x-mail.row>
        <x-mail.row label="Tipo">{{ $complaint->type }}</x-mail.row>
        <x-mail.row label="Fecha máxima de respuesta" strong>{{ $complaint->due_on->format('d/m/Y') }}</x-mail.row>
    </x-mail.section>
    <x-mail.section title="Consumidor">
        <x-mail.row label="Nombre">{{ $complaint->name }}</x-mail.row>
        <x-mail.row label="Documento">{{ $complaint->document_type }} {{ $complaint->document_number }}</x-mail.row>
        <x-mail.row label="Dirección">{{ $complaint->address }}</x-mail.row>
        <x-mail.row label="Contacto">{{ $complaint->phone }} · {{ $complaint->email }}</x-mail.row>
        @if ($complaint->minor)<x-mail.row label="Representante">{{ $complaint->guardian_name }} · {{ $complaint->guardian_document }} · {{ $complaint->guardian_address }} · {{ $complaint->guardian_phone }}</x-mail.row>@endif
    </x-mail.section>
    <x-mail.section :title="ucfirst($complaint->item_type)">
        <tr><td colspan="2" style="{{ $pre }}">{{ $complaint->item_description }}</td></tr>
        @if ($complaint->amount !== null)<x-mail.row label="Monto reclamado">S/ {{ number_format($complaint->amount, 2) }}</x-mail.row>@endif
    </x-mail.section>
    <x-mail.section title="Detalle"><tr><td style="{{ $pre }}">{{ $complaint->detail }}</td></tr></x-mail.section>
    <x-mail.section title="Pedido"><tr><td style="{{ $pre }}">{{ $complaint->request }}</td></tr></x-mail.section>
    @if ($answered)
        <x-mail.section title="Respuesta del proveedor">
            <x-mail.row label="Fecha de respuesta">{{ $complaint->answered_at?->timezone('America/Lima')->format('d/m/Y H:i') }}</x-mail.row>
            <tr><td colspan="2" style="{{ $pre }}">{{ $complaint->answer }}</td></tr>
        </x-mail.section>
    @endif
    <x-mail.actions><x-mail.button :href="$complaint->copyUrl()">Ver e imprimir la hoja completa</x-mail.button></x-mail.actions>
    <x-mail.note>Plazo de atención: 15 días hábiles improrrogables. El enlace contiene acceso privado a su hoja: conserve la copia y evite compartirlo. Presentar esta hoja no impide acudir a otras vías de solución ni es requisito previo para denunciar ante el Indecopi.</x-mail.note>
</x-mail.layout>
