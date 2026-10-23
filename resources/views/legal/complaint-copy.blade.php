@extends($admin ? 'layouts.workspace' : 'layouts.landing')
@push('styles')<meta name="robots" content="noindex, nofollow"><meta name="referrer" content="no-referrer"><style>@media print { nav, footer, .no-print { display:none !important } body, main, article { background:white !important; color:black !important } article { border:0 !important } }</style>@endpush
@section('main')
<main class="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 text-gray-800 dark:text-gray-100">
    @if(session('success'))<p role="status" class="no-print rounded-lg bg-green-50 p-4 text-green-800">{{ session('success') }}</p>@endif
    <article class="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 text-gray-800">
        <h1 class="text-3xl font-bold">Hoja de reclamación N.° {{ $complaint->code }}</h1>
        <p>{{ $complaint->provider['name'] }} @if($complaint->provider['ruc'] ?? null) · RUC {{ $complaint->provider['ruc'] }} @endif</p>
        <p>{{ $complaint->provider['address'] ?? '' }} · {{ $complaint->provider['email'] ?? '' }} · {{ $complaint->provider['phone'] ?? '' }}</p>
        <p>Fecha: {{ $complaint->created_at->timezone('America/Lima')->format('d/m/Y H:i') }} · Tipo: {{ ucfirst($complaint->type) }}</p>
        <p>Fecha máxima de atención y respuesta: <strong>{{ $complaint->due_on->format('d/m/Y') }}</strong> (15 días hábiles).</p>
        <h2 class="text-xl font-bold">1. Consumidor</h2>
        <p>{{ $complaint->name }} · {{ $complaint->document_type }} {{ $complaint->document_number }}</p>
        <p>{{ $complaint->address }} · {{ $complaint->phone }} · {{ $complaint->email }}</p>
        @if($complaint->minor)<p>Representante del menor: {{ $complaint->guardian_name }} · {{ $complaint->guardian_document }} · {{ $complaint->guardian_address }} · {{ $complaint->guardian_phone }}</p>@endif
        <h2 class="text-xl font-bold">2. Producto o servicio</h2>
        <p>{{ ucfirst($complaint->item_type) }} @if($complaint->amount !== null) · Monto reclamado: S/ {{ number_format($complaint->amount, 2) }} @endif</p>
        <p class="whitespace-pre-wrap">{{ $complaint->item_description }}</p>
        <h2 class="text-xl font-bold">3. Detalle y pedido</h2>
        <p class="whitespace-pre-wrap">{{ $complaint->detail }}</p>
        <p class="font-bold">Pedido del consumidor</p><p class="whitespace-pre-wrap">{{ $complaint->request }}</p>
        <h2 class="text-xl font-bold">4. Respuesta del proveedor</h2>
        @if($complaint->answered_at)
            <p>Respuesta registrada: {{ $complaint->answered_at->timezone('America/Lima')->format('d/m/Y H:i') }}</p>
            <p class="whitespace-pre-wrap">{{ $complaint->answer }}</p>
        @else<p>Pendiente de respuesta. Se comunicará al correo indicado en esta hoja.</p>@endif
        <p class="text-sm">Reclamo: disconformidad con el producto o servicio. Queja: disconformidad con la atención u otros aspectos. Presentar esta hoja no impide acudir a otras vías ni es requisito previo para denunciar ante el Indecopi. Declaración recibida electrónicamente. Versión de privacidad: {{ $complaint->legal_version }}.</p>
    </article>
    <button type="button" onclick="window.print()" class="no-print rounded-lg bg-blue-600 px-5 py-3 text-white">Imprimir / guardar PDF</button>
    @if($admin)
        <section class="no-print space-y-4 rounded-lg border p-5">
            <h2 class="text-xl font-bold">Gestión administrativa</h2>
            @foreach($tasks as $task)<p>{{ ['complaint_copy' => 'Copia al consumidor', 'complaint_admin' => 'Aviso interno', 'complaint_answer' => 'Respuesta al consumidor'][$task->kind] }}: {{ $task->status }} · Intentos: {{ $task->attempts }}</p>@endforeach
            @if($errors->any())<p role="alert">{{ $errors->first() }}</p>@endif
            @if($complaint->status === 'pending')
                <form method="POST" action="{{ route('complaints.admin.answer', $complaint) }}" class="space-y-4">@csrf
                    <label class="block">Respuesta que recibirá el consumidor<textarea name="answer" required minlength="10" maxlength="5000" rows="6" class="mt-2 block w-full rounded-lg border p-3 text-gray-800">{{ old('answer') }}</textarea></label>
                    <p>La primera respuesta se conserva con el usuario y fecha. El correo se envía mediante la cola.</p>
                    <button class="rounded-lg bg-blue-600 px-5 py-3 text-white">Registrar y enviar respuesta</button>
                </form>
            @endif
        </section>
    @endif
</main>
@endsection
