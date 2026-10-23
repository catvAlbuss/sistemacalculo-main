@extends('layouts.landing')
@section('main')
<main class="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 text-gray-800 dark:text-gray-100">
    <h1 class="text-3xl font-bold">Libro de Reclamaciones</h1>
    <section class="rounded-lg border border-gray-200 p-4" aria-label="Identificación del proveedor">
        <p class="font-bold">{{ config('legal.provider.name') }}</p>
        @if(config('legal.provider.ruc'))<p>RUC: {{ config('legal.provider.ruc') }}</p>@endif
        @if(config('legal.provider.address'))<p>Domicilio: {{ config('legal.provider.address') }}</p>@endif
        <p>Teléfono: +{{ preg_replace('/\D/', '', config('legal.provider.phone')) }} @if(config('legal.provider.email')) · Correo: {{ config('legal.provider.email') }} @endif</p>
    </section>
    <p>Registra tu reclamo o queja sin iniciar sesión. La hoja se guarda en este sitio y podrás imprimir una copia. La respuesta se enviará al correo que indiques, en un plazo máximo de 15 días hábiles improrrogables.</p>
    <p>Reclamo: disconformidad con un producto o servicio. Queja: disconformidad con la atención u otros aspectos no relacionados directamente con el producto o servicio.</p>
    <p>Presentar esta hoja no impide acudir a otras vías de solución ni es requisito previo para denunciar ante el Indecopi.</p>
    @if($errors->any())<div role="alert" class="rounded-lg bg-red-50 p-4 text-red-800"><p class="font-bold">Revisa los datos de tu hoja.</p><ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>@endif
    <form action="{{ route('complaints.store') }}" method="POST" class="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 text-gray-800">
        @csrf
        <input type="hidden" name="submission_key" value="{{ old('submission_key', $submissionKey) }}">
        <div hidden aria-hidden="true"><label>Sitio web<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <fieldset class="grid gap-4 md:grid-cols-2"><legend class="mb-4 text-xl font-bold">1. Identificación del consumidor</legend>
            <label>Tipo de hoja<select name="type" required class="mt-2 block w-full rounded-lg border p-3">@foreach(['reclamo' => 'Reclamo', 'queja' => 'Queja'] as $value => $label)<option value="{{ $value }}" @selected(old('type') === $value)>{{ $label }}</option>@endforeach</select></label>
            <label>Nombre completo<input name="name" value="{{ old('name') }}" required maxlength="150" autocomplete="name" class="mt-2 block w-full rounded-lg border p-3"></label>
            <label>Tipo de documento<select name="document_type" required class="mt-2 block w-full rounded-lg border p-3">@foreach(['DNI', 'CE', 'PASAPORTE', 'RUC'] as $type)<option @selected(old('document_type') === $type)>{{ $type }}</option>@endforeach</select></label>
            @foreach(['document_number' => ['Número de documento', 20, 'text'], 'address' => ['Domicilio', 255, 'text'], 'phone' => ['Teléfono', 20, 'tel'], 'email' => ['Correo para recibir copia y respuesta', 150, 'email']] as $field => [$label, $max, $type])
                <label>{{ $label }}<input name="{{ $field }}" type="{{ $type }}" value="{{ old($field) }}" required maxlength="{{ $max }}" class="mt-2 block w-full rounded-lg border p-3"></label>
            @endforeach
            <label>¿El consumidor es menor de edad?<select name="minor" required class="mt-2 block w-full rounded-lg border p-3"><option value="0" @selected(!old('minor'))>No</option><option value="1" @selected(old('minor'))>Sí, completar representante</option></select></label>
        </fieldset>
        <fieldset class="grid gap-4 md:grid-cols-2"><legend class="mb-4 text-xl font-bold">Representante del menor de edad</legend>
            <p class="md:col-span-2">Completa estos datos si el consumidor es menor de edad.</p>
            @foreach(['guardian_name' => ['Nombre del padre, madre o representante', 150], 'guardian_document' => ['Documento del representante', 20], 'guardian_address' => ['Domicilio del representante', 255], 'guardian_phone' => ['Teléfono del representante', 20]] as $field => [$label, $max])
                <label>{{ $label }}<input name="{{ $field }}" value="{{ old($field) }}" maxlength="{{ $max }}" class="mt-2 block w-full rounded-lg border p-3"></label>
            @endforeach
        </fieldset>
        <fieldset class="space-y-4"><legend class="mb-4 text-xl font-bold">2. Producto o servicio contratado</legend>
            <label class="block">Tipo<select name="item_type" required class="mt-2 block w-full rounded-lg border p-3"><option value="servicio" @selected(old('item_type', 'servicio') === 'servicio')>Servicio</option><option value="producto" @selected(old('item_type') === 'producto')>Producto</option></select></label>
            <label class="block">Monto reclamado en soles (opcional)<input name="amount" type="number" min="0" max="9999999.99" step="0.01" value="{{ old('amount') }}" class="mt-2 block w-full rounded-lg border p-3"></label>
            <label class="block">Descripción del producto o servicio<textarea name="item_description" required maxlength="500" rows="3" class="mt-2 block w-full rounded-lg border p-3">{{ old('item_description') }}</textarea></label>
        </fieldset>
        <fieldset class="space-y-4"><legend class="mb-4 text-xl font-bold">3. Detalle y pedido del consumidor</legend>
            <label class="block">Detalle del reclamo o queja<textarea name="detail" required minlength="10" maxlength="3000" rows="5" class="mt-2 block w-full rounded-lg border p-3">{{ old('detail') }}</textarea></label>
            <label class="block">¿Qué solución solicitas?<textarea name="request" required minlength="5" maxlength="2000" rows="4" class="mt-2 block w-full rounded-lg border p-3">{{ old('request') }}</textarea></label>
            <p class="text-sm">No incluyas contraseñas, códigos de seguridad ni números completos de tarjeta.</p>
        </fieldset>
        <label class="flex items-start gap-3"><input type="checkbox" name="accept_privacy" value="1" required @checked(old('accept_privacy')) class="mt-1"><span>Declaro que la información es verdadera y autorizo el uso de estos datos para atender esta hoja conforme a la <a class="text-blue-700 underline" target="_blank" rel="noopener" href="{{ route('legal.privacidad') }}">Política de privacidad</a>.</span></label>
        <button class="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white">Registrar hoja y obtener copia</button>
    </form>
</main>
@endsection
