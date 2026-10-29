@extends('layouts.workspace')
@section('main')
<header class="wk-heading"><div><p class="pr-eyebrow">Administración / Propuesta comercial</p><h1>Plan de por vida</h1><p>Define el importe para {{ $customer->name }} · {{ $customer->email }}. Crear la propuesta no activa el plan ni efectúa un cobro.</p></div><a href="{{ route('planUser.index') }}" class="pr-button pr-button-secondary">Volver a usuarios</a></header>
@if($errors->any())<div class="wk-notice" data-tone="danger" role="alert">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
<form method="POST" action="{{ route('lifetime-quotes.store',$customer) }}" class="pr-panel wk-card" x-data="{ invoice: @js(old('receipt_type',$previous?->receipt_type)==='factura') }">@csrf
    <input type="hidden" name="quote_key" value="{{ old('quote_key',$quoteKey) }}">
    <div class="wk-form-grid">
        <div><label class="pr-label" for="lifetime-plan">Plan</label><select class="pr-input" id="lifetime-plan" name="subscription_plan_id" required>@foreach($plans as $plan)<option value="{{ $plan->id }}" @selected(old('subscription_plan_id')==$plan->id)>{{ $plan->name }}</option>@endforeach</select></div>
        <div><label class="pr-label" for="net-amount">Monto acordado del servicio (S/)</label><input class="pr-input" id="net-amount" type="number" name="net_amount" min="3" max="100000" step="0.01" value="{{ old('net_amount') }}" required><p class="pr-hint">Incluye el IGV del servicio. Se añade el procesamiento configurado para conservar este importe; el cliente verá el precio final antes de pagar.</p></div>
        <div><label class="pr-label" for="quote-phone">Teléfono del titular</label><input class="pr-input" id="quote-phone" type="tel" name="phone" value="{{ old('phone',$previous?->phone ?? $customer->phone) }}" required></div>
        <div><label class="pr-label" for="quote-receipt">Comprobante</label><select class="pr-input" id="quote-receipt" name="receipt_type" @change="invoice=$event.target.value==='factura'"><option value="boleta" @selected(old('receipt_type',$previous?->receipt_type)!=='factura')>Boleta</option><option value="factura" @selected(old('receipt_type',$previous?->receipt_type)==='factura')>Factura</option></select></div>
        <input type="hidden" name="document_type" :value="invoice ? 'RUC' : 'DNI'">
        <div><label class="pr-label" for="quote-document" x-text="invoice ? 'RUC del receptor' : 'DNI del receptor'">Documento del receptor</label><input class="pr-input" id="quote-document" name="document_number" value="{{ old('document_number',$previous?->document_number) }}" :pattern="invoice ? '[0-9]{11}' : '[0-9]{8}'" required></div>
        <div><label class="pr-label" for="quote-address">Dirección fiscal · obligatoria para factura</label><input class="pr-input" id="quote-address" name="billing_address" maxlength="255" value="{{ old('billing_address',$previous?->billing_address) }}" :required="invoice"></div>
        <div><label class="pr-label" for="quote-ubigeo">Distrito fiscal · obligatorio para factura</label><input class="pr-input" id="quote-ubigeo" name="billing_ubigeo" list="quote-districts" pattern="[0-9]{6}" value="{{ old('billing_ubigeo',$previous?->billing_ubigeo) }}" :required="invoice"><datalist id="quote-districts">@foreach($ubigeos as $ubigeo)<option value="{{ $ubigeo->codigo }}">{{ $ubigeo->distrito }} · {{ $ubigeo->provincia }} · {{ $ubigeo->departamento }}</option>@endforeach</datalist></div>
    </div>
    <p class="wk-notice">Validez de la propuesta: 7 días. El cliente debe iniciar sesión, revisar el total y aceptar las condiciones antes de pagar. Los cambios posteriores al catálogo no alteran esta propuesta.</p>
    <footer class="wk-form-footer"><button class="pr-button" @disabled($plans->isEmpty())>Crear propuesta de pago</button></footer>
</form>
@endsection
