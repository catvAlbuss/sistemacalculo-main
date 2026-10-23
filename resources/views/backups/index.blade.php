@extends('layouts.workspace')
@section('main')
<header class="wk-heading"><div><p class="pr-eyebrow">Mi cuenta / Protección de proyectos</p><h1>Mis respaldos</h1><p>Gestiona las copias privadas de tus modelos y memorias guardados en el servidor.</p></div><form method="POST" action="{{ route('backups.store') }}">@csrf<button class="pr-button">Crear copia ahora</button></form></header>
<div class="wk-stack">
    @if(session('success'))<p role="status" class="wk-notice">{{ session('success') }}</p>@endif
    @if($errors->any())<p role="alert" class="wk-notice" data-tone="danger">{{ $errors->first() }}</p>@endif
    <div class="wk-grid-two">
        <section class="pr-panel wk-card"><p class="pr-eyebrow">Contenido de las copias</p><h2>Tus proyectos en el servidor</h2><p>Incluyen modelos CAD, memorias de cálculo, sus imágenes y memorias descriptivas. No incluyen borradores que solo estén en el navegador, archivos externos o archivos generados. Restaurar no cambia tu cuenta, contraseña, pagos o reclamaciones.</p></section>
        <section class="pr-panel wk-card"><p class="pr-eyebrow">Conservación y descarga</p><h2>Copias privadas</h2><p>Se conservan siete copias diarias, las de los últimos cuatro domingos y cuatro copias previas a restaurar. Descargar entrega un archivo JSON comprimido; en el servidor las copias se guardan cifradas.</p></section>
    </div>
    <section aria-labelledby="backup-list-heading">
        <div class="wk-section-head"><h2 id="backup-list-heading">Copias disponibles</h2><p class="pr-eyebrow">Revisa antes de restaurar</p></div>
        <div class="wk-table-scroll"><table class="wk-table"><thead><tr><th>Copia</th><th>Contenido</th><th>Acciones</th></tr></thead><tbody>
        @forelse($backups as $backup)<tr><td><strong>#{{ $backup->id }}</strong> · {{ $backup->created_at->timezone('America/Lima')->format('d/m/Y H:i') }}<br><span class="wk-muted">{{ $backup->safety ? 'Anterior a una restauración' : 'Copia de proyectos' }}</span></td><td>@foreach($backup->counts as $table=>$count){{ ['cad_models'=>'Modelos CAD','memoria_calculos'=>'Memorias de cálculo','memorias_descriptivas'=>'Memorias descriptivas','memoria_imagenes'=>'Imágenes'][$table] }}: {{ $count }}<br>@endforeach</td><td><a href="{{ route('backups.download',$backup) }}">Descargar</a><br><a href="{{ route('backups.preview',$backup) }}">Revisar restauración</a></td></tr>
        @empty<tr><td colspan="3">Todavía no tienes copias. Guarda primero tus proyectos en el servidor y crea una copia.</td></tr>@endforelse
        </tbody></table></div><div style="margin-top:18px">{{ $backups->links() }}</div>
    </section>
    <section><div class="wk-section-head"><h2>Actividad reciente</h2></div><div class="wk-stack">
    @forelse($events as $event)<p class="wk-detail">{{ $event->created_at }} · {{ $event->kind === 'restore' ? 'Restauración' : 'Descarga' }} de la copia #{{ $event->backup_id }} @if($event->safety_backup_id) · Estado anterior en #{{ $event->safety_backup_id }} @endif</p>@empty<p class="pr-panel wk-empty">No hay descargas ni restauraciones registradas.</p>@endforelse
    </div></section>
</div>
@endsection
