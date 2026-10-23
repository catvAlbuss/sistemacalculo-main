@extends('layouts.workspace')
@section('main')
<header class="wk-heading"><div><p class="pr-eyebrow">Administración / Operaciones</p><h1>Administración de pagos</h1><p>Consulta las solicitudes y los eventos de la pasarela. La revisión administrativa no sustituye la confirmación del cobro.</p></div><a class="pr-button pr-button-secondary" href="{{ route('administration.index') }}">Volver al resumen</a></header>
<dl class="wk-stats">
    <div class="pr-panel wk-stat"><dt>Pendientes Culqi</dt><dd>{{ $pending }}</dd></div>
    <div class="pr-panel wk-stat"><dt>Eventos por revisar</dt><dd>{{ $reviews }}</dd></div>
    <div class="pr-panel wk-stat"><dt>Tareas fallidas</dt><dd>{{ $failedTasks }}</dd></div>
    <div class="pr-panel wk-stat"><dt>Confirmado este mes</dt><dd>S/ {{ number_format($collected,2) }}</dd></div>
</dl>
<form class="pr-panel wk-filters" method="GET">
    <label>Buscar<input name="search" value="{{ request('search') }}" placeholder="Cliente, correo o cargo" class="pr-input"></label>
    <label>Estado<select name="status" class="pr-input"><option value="">Todos</option>@foreach(['pending'=>'Pendiente','approved'=>'Confirmado','rejected'=>'Cerrado'] as $value=>$label)<option value="{{ $value }}" @selected(request('status') === $value)>{{ $label }}</option>@endforeach</select></label>
    <label><input type="checkbox" name="review" value="1" @checked(request('review'))> Con alertas sin revisar</label>
    <button class="pr-button">Filtrar</button><button name="download" value="csv" class="pr-button pr-button-secondary">Exportar CSV</button>
</form>
<div class="wk-table-scroll"><table class="wk-table"><thead><tr><th>Solicitud / cliente</th><th>Plan</th><th>Total base PEN</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>
@forelse($payments as $payment)<tr><td><strong>#{{ $payment->id }} · {{ $payment->name }}</strong><br>{{ $payment->email }}</td><td>{{ $payment->plan_snapshot['name'] ?? $payment->plan->name }}</td><td>S/ {{ number_format($payment->amount,2) }}@if($payment->currency === 'USD')<br>Cobro: US$ {{ number_format($payment->charge_amount,2) }}@endif</td><td><span class="wk-badge">{{ ['pending'=>'Pendiente','approved'=>'Confirmado','rejected'=>'Cerrado'][$payment->status] ?? $payment->status }}</span><br>{{ $payment->gateway_state }}</td><td><a href="{{ route('payments.admin.show',$payment) }}">Ver eventos</a></td></tr>
@empty<tr><td colspan="5">No hay pagos para estos filtros.</td></tr>@endforelse
</tbody></table></div><div style="margin-top:20px">{{ $payments->links() }}</div>
@endsection
