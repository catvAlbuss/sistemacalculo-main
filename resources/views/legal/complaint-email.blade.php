<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"></head><body>
<h1>{{ $answered ? 'Respuesta a la hoja' : 'Registro de hoja' }} {{ $complaint->code }}</h1>
<p>{{ $complaint->provider['name'] }} · RUC {{ $complaint->provider['ruc'] ?? '' }}</p>
<p>{{ $complaint->provider['address'] ?? '' }} · {{ $complaint->provider['email'] ?? '' }} · {{ $complaint->provider['phone'] ?? '' }}</p>
<p>Fecha de registro: {{ $complaint->created_at->timezone('America/Lima')->format('d/m/Y H:i') }}. Tipo: {{ $complaint->type }}.</p>
<p>Consumidor: {{ $complaint->name }} · {{ $complaint->document_type }} {{ $complaint->document_number }}.</p>
<p>{{ $complaint->address }} · {{ $complaint->phone }} · {{ $complaint->email }}</p>
@if($complaint->minor)<p>Representante: {{ $complaint->guardian_name }} · {{ $complaint->guardian_document }} · {{ $complaint->guardian_address }} · {{ $complaint->guardian_phone }}</p>@endif
<h2>{{ ucfirst($complaint->item_type) }}</h2><p>{{ $complaint->item_description }}</p>
@if($complaint->amount !== null)<p>Monto reclamado: S/ {{ number_format($complaint->amount, 2) }}</p>@endif
<h2>Detalle</h2><p style="white-space:pre-wrap">{{ $complaint->detail }}</p>
<h2>Pedido</h2><p style="white-space:pre-wrap">{{ $complaint->request }}</p>
<p>Fecha máxima de atención y respuesta: {{ $complaint->due_on->format('d/m/Y') }} (15 días hábiles improrrogables).</p>
@if($answered)<h2>Respuesta del proveedor</h2><p>{{ $complaint->answered_at?->timezone('America/Lima')->format('d/m/Y H:i') }}</p><p style="white-space:pre-wrap">{{ $complaint->answer }}</p>@endif
<p><a href="{{ $complaint->copyUrl() }}">Ver e imprimir la hoja completa</a>. Este enlace contiene acceso privado a tu hoja: conserva la copia y evita compartirlo.</p>
<p>Presentar esta hoja no impide acudir a otras vías de solución ni es requisito previo para denunciar ante el Indecopi.</p>
</body></html>
