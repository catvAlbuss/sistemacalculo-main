@extends('layouts.workspace')
@push('scripts')
    @vite('resources/js/dashboard-background.js')
@endpush
@section('main')
<div class="wk-dashboard">
    <canvas id="bg-canvas" aria-hidden="true"></canvas>
    <header class="wk-heading">
        <div><p class="pr-eyebrow">Inicio / Tu espacio de ingeniería</p><h1>Bienvenido, <span class="wk-welcome-name">{{ \Illuminate\Support\Str::title(\Illuminate\Support\Str::before($user->name, ' ')) }}</span></h1><p>Continúa con tus herramientas, revisa tu cobertura y administra tu cuenta desde un mismo lugar.</p></div>
        <a href="{{ route('profile') }}" class="pr-button pr-button-secondary">Ver mi cuenta <span aria-hidden="true">↗︎</span></a>
    </header>
    @if($alert)
        <div class="wk-notice" data-tone="{{ $alert['type'] }}" role="status">{{ $alert['message'] }} @if(!empty($alert['show_button']))<a href="{{ route('plans.mine') }}">Revisar mi plan</a>@endif</div>
    @endif
    <dl class="wk-stats">
        <div class="pr-panel wk-stat"><dt>Acceso actual</dt><dd>{{ $current?->plan->name ?? 'Administrativo' }}<small>{{ $current?->accessEndsAt() ? 'Vence el '.$current->accessEndsAt()->format('d/m/Y') : ($current ? 'Cobertura permanente' : 'Según tu rol de administración') }}</small></dd></div>
        <div class="pr-panel wk-stat"><dt>Proyectos en el servidor</dt><dd>{{ $projectCount }}<small>Modelos y memorias independientes</small></dd></div>
        <div class="pr-panel wk-stat"><dt>Solicitudes de pago pendientes</dt><dd>{{ $pendingPayments }}<small>Consulta su estado en Mi plan y pagos</small></dd></div>
        <div class="pr-panel wk-stat"><dt>Último respaldo</dt><dd>{{ $lastBackup ? $lastBackup->created_at->timezone('America/Lima')->format('d/m/Y') : 'Sin copias' }}<small>{{ $lastBackup ? 'Copia #'.$lastBackup->id.' de tus proyectos' : 'Crea una copia desde Mis respaldos' }}</small></dd></div>
    </dl>
    <div class="wk-grid">
        <article class="pr-panel wk-card"><span class="en-card-number">CUENTA / 01</span><h2>Mi plan y pagos</h2><p>Revisa tu cobertura, tus períodos contratados y el historial de pagos.</p><div class="wk-card-links"><a href="{{ route('plans.mine') }}">Consultar mi plan <span aria-hidden="true">↗︎</span></a></div></article>
        <article class="pr-panel wk-card"><span class="en-card-number">DATOS / 02</span><h2>Mis respaldos</h2><p>Crea copias de tus proyectos y revisa su contenido antes de restaurar.</p><div class="wk-card-links"><a href="{{ route('backups.index') }}">Gestionar mis copias <span aria-hidden="true">↗︎</span></a></div></article>
        <article class="pr-panel wk-card"><span class="en-card-number">ATENCIÓN / 03</span><h2>{{ $user->hasRole(['root','gerencia']) ? 'Administración' : 'Ayuda y soporte' }}</h2><p>{{ $user->hasRole(['root','gerencia']) ? 'Accede a usuarios, planes, pagos y atención de reclamaciones.' : 'Consulta los canales de atención para tu cuenta y herramientas.' }}</p><div class="wk-card-links"><a href="{{ route($user->hasRole(['root','gerencia']) ? 'administration.index' : 'account.support') }}">Abrir panel <span aria-hidden="true">↗︎</span></a></div></article>
    </div>
    <section id="herramientas" class="wk-section" aria-labelledby="tools-heading">
        <div class="wk-section-head"><h2 id="tools-heading">Herramientas de ingeniería</h2><p class="pr-eyebrow">Accesos por especialidad</p></div>
        @php($groups = [
            ['Memorias', 'Documentación técnica de tus proyectos.', null, [
                'calculadora.asistente.memoria-calculo'=>'Memoria de cálculo',
                'calculadora.asistente.memoria-descriptiva'=>'Memoria descriptiva']],
            ['Estudiante', 'Cálculos y herramientas para tu formación.', 'student', [
                'calculadora.estudiante.cav2.metrados'=>'Metrados',
                'calculadora.estudiante.cav2.escaleras'=>'Escaleras',
                'calculadora.estudiante.cav2.zapatas'=>'Zapatas',
                'calculadora.estudiante.cav2.distribucion-del-acero'=>'Distribución del acero',
                'calculadora.estudiante.arco_techo'=>'Arco techo']],
            ['Asistente', 'Diseño de elementos estructurales.', 'assistant', [
                'calculadora.asistente.vigas'=>'Diseño de vigas',
                'calculadora.asistente.vigas-general'=>'Vigas general',
                'calculadora.asistente.losas-macizas'=>'Losas macizas',
                'calculadora.asistente.columna'=>'Columnas',
                'calculadora.asistente.muros-de-contencion'=>'Muros de contención']],
            ['Diseñador', 'Modelado, análisis y diseño estructural.', 'software', [
                'software.predimv2'=>'Predim',
                'software.etabs2'=>'Modelado estructural',
                'software.aligerados-v2'=>'Aligerados v2.0',
                'software.cimentacion-v2'=>'Cimentación v2.0',
                'software.analisis-estructural-de-armaduras'=>'Análisis de armaduras']],
            ['Revisor', 'Herramientas de verificación de elementos.', 'software', [
                'software.predim-viga-v1'=>'Predimensionamiento de vigas',
                'software.verificacion-viga-v1'=>'Verificación de vigas',
                'software.anclaje-v1'=>'Anclaje',
                'calculadora.estudiante.cav2.hoja2'=>'VRD-ALIG']]
        ])
        <div class="wk-grid">
            @foreach($groups as [$title,$description,$permission,$links])
                @if(!$permission || $user->canAccess($permission))
                    <article class="pr-panel wk-card"><span class="en-card-number">{{ str_pad($loop->iteration,2,'0',STR_PAD_LEFT) }} / HERRAMIENTAS</span><h3>{{ $title }}</h3><p>{{ $description }}</p><div class="wk-card-links">@foreach($links as $destination=>$label)<a href="{{ route($destination) }}">{{ $label }} <span aria-hidden="true">↗︎</span></a>@endforeach</div></article>
                @endif
            @endforeach
        </div>
    </section>
</div>
@endsection
