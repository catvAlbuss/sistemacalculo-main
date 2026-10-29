@extends('layouts.workspace')
@push('scripts')
    @vite('resources/js/dashboard-background.js')
@endpush
@section('main')
<div class="wk-dashboard" x-data="{ category:'Todos', search:'' }">
    <canvas id="bg-canvas" aria-hidden="true"></canvas>
    <div class="wk-role-context"><span class="wk-badge">{{ $isAdmin ? 'Panel administrativo' : 'Espacio profesional' }}</span>@forelse($roleNames as $role)<span>{{ ucfirst($role) }} · {{ \App\Services\RoleHierarchy::description($role) }}</span>@empty<span>Tu cuenta personal: proyectos, cobertura y soporte.</span>@endforelse</div>
    <header class="wk-heading"><div><p class="pr-eyebrow">Tu espacio de ingeniería</p><h1>Bienvenido, <span class="wk-welcome-name">{{ \Illuminate\Support\Str::title(\Illuminate\Support\Str::before($user->name, ' ')) }}</span></h1><p>Modelado, análisis y diseño estructural. Encuentra tus programas y continúa con tu trabajo.</p></div><a href="{{ route('plans.mine') }}" class="pr-button pr-button-secondary">Mi plan y pagos ↗</a></header>
    @if($alert)<div class="wk-notice" data-tone="{{ $alert['type'] }}" role="status">{{ $alert['message'] }} @if(!empty($alert['show_button']))<a href="{{ route('plans.mine') }}">Revisar mi plan</a>@endif</div>@endif
    @if($securityNotice = $user->securityEvents()->where('type', 'concurrent_access')->first())<p class="wk-notice" data-tone="warning" role="alert">Aviso de seguridad · {{ $securityNotice->created_at->timezone('America/Lima')->format('d/m/Y H:i') }}: {{ $securityNotice->message }} <a href="{{ route('profile') }}">Revisar seguridad</a></p>@endif
    <dl class="wk-stats">
        <div class="pr-panel wk-stat"><dt>Acceso actual</dt><dd>{{ $current?->plan->name ?? ($isAdmin ? 'Administrativo' : 'Sin plan vigente') }}<small>{{ $current?->accessEndsAt() ? 'Hasta el '.$current->accessEndsAt()->format('d/m/Y') : ($current ? 'Cobertura permanente' : ($isAdmin ? 'Acceso según tu rol, sin compra obligatoria' : 'Activa un plan para utilizar los programas')) }}</small></dd></div>
        <div class="pr-panel wk-stat"><dt>Proyectos en el servidor</dt><dd>{{ $projectCount }}<small>Modelos y memorias independientes</small></dd></div>
        <div class="pr-panel wk-stat"><dt>Pagos pendientes</dt><dd>{{ $pendingPayments }}<small>Consulta su estado en Mi plan y pagos</small></dd></div>
        <div class="pr-panel wk-stat"><dt>Último respaldo</dt><dd>{{ $lastBackup ? $lastBackup->created_at->timezone('America/Lima')->format('d/m/Y') : 'Sin copias' }}<small>{{ $lastBackup ? 'Copia #'.$lastBackup->id.' de tus proyectos' : 'Crea una copia desde Mis respaldos' }}</small></dd></div>
    </dl>
    @if($isAdmin)
        <section class="wk-admin-overview" aria-label="Operaciones de administración">
            <a class="pr-panel wk-admin-operation" href="{{ route('planUser.index') }}"><span>Usuarios y accesos</span><strong>{{ $adminMetrics['users'] }} cuentas</strong><small>{{ $adminMetrics['restricted'] }} restringidas · gestionar roles, cobertura y sesiones ↗</small></a>
            <a class="pr-panel wk-admin-operation" href="{{ route('payments.admin.index') }}"><span>Operaciones Culqi</span><strong>{{ $adminMetrics['payments'] }} pendientes</strong><small>Solicitudes, cargos y eventos de confirmación ↗</small></a>
            <a class="pr-panel wk-admin-operation" href="{{ route('suscripciones.index') }}"><span>Catálogo comercial</span><strong>Planes y capacidades</strong><small>Precios base, períodos y publicación de planes ↗</small></a>
        </section>
    @endif
    @php($programs = collect(config('showcase.products')))
    <div class="wk-workbench">
        <section id="herramientas" class="wk-program-library" aria-labelledby="tools-heading">
            <div class="wk-section-head"><h2 id="tools-heading">Herramientas de ingeniería</h2><span class="wk-muted">{{ $programs->count() }} herramientas por especialidad</span></div>
            <div class="wk-library-toolbar"><label class="sr-only" for="program-search">Buscar programa</label><input id="program-search" type="search" class="pr-input" x-model="search" placeholder="Buscar programa o especialidad…"><div class="wk-category-tabs" role="group" aria-label="Filtrar por especialidad">@foreach(collect(['Todos'])->merge($programs->pluck('category')->unique()) as $category)<button type="button" @click="category = @js($category)" :aria-pressed="(category === @js($category)).toString()">{{ $category }}</button>@endforeach</div></div>
            @foreach($programs->groupBy('category') as $category => $items)
                <section class="wk-program-group" x-show="(category === 'Todos' || category === @js($category)) && @js($items->map(fn($p) => mb_strtolower($p['name'].' '.$p['description'].' '.$p['category']))->values()).some(text => text.includes(search.toLocaleLowerCase().trim()))">
                    <h3>{{ $category }}</h3><div class="wk-program-grid">
                    @foreach($items as $slug => $program)
                        @php($info = app(\App\Services\ProgramInformation::class)->for($slug,$program))
                        <article class="pr-panel wk-program-card" x-show="@js(mb_strtolower($program['name'].' '.$program['description'].' '.$program['category'])).includes(search.toLocaleLowerCase().trim())">
                            <div class="wk-program-card-head"><span class="wk-program-symbol" aria-hidden="true">{{ str_pad($loop->iteration,2,'0',STR_PAD_LEFT) }}</span><a href="{{ route('showcase.show',$slug) }}" aria-label="Información de {{ $program['name'] }}" title="Ver información y demostración">ⓘ</a></div>
                            <h4>{{ $program['name'] }}</h4><p>{{ $info['purpose'] }}</p><details class="wk-program-information"><summary>Datos y resultados del programa</summary><strong>Datos de entrada</strong><ul>@foreach($info['inputs'] as $input)<li>{{ $input }}</li>@endforeach</ul><strong>Resultados</strong><ul>@foreach($info['outputs'] as $output)<li>{{ $output }}</li>@endforeach</ul></details>
                            <div class="wk-program-links">@if($canUseTools)<a href="{{ route($program['route']) }}">Abrir programa ↗</a>@else<button type="button" disabled title="Requiere un plan vigente">Requiere plan vigente</button>@endif<a href="{{ route('showcase.show',$slug) }}">Demostración</a></div>
                        </article>
                    @endforeach
                    </div>
                </section>
            @endforeach
            <p class="wk-empty" x-show="!@js($programs->map(fn($p) => ['category'=>$p['category'],'text'=>mb_strtolower($p['name'].' '.$p['description'].' '.$p['category'])])->values()).some(p => (category === 'Todos' || category === p.category) && p.text.includes(search.toLocaleLowerCase().trim()))" style="display:none" role="status">No hay programas que coincidan con tu búsqueda.</p>
        </section>
        <aside class="wk-workbench-account" aria-label="Resumen de cuenta">
            <section class="pr-panel wk-account-summary"><p class="pr-eyebrow">Mi espacio de trabajo</p><h2>{{ $user->name }}</h2><p>{{ $user->email }}</p><span class="wk-badge">{{ $current?->plan->name ?? ($isAdmin ? 'Acceso administrativo' : 'Sin plan vigente') }}</span><dl><div><dt>Cobertura</dt><dd>{{ $current?->accessEndsAt()?->format('d/m/Y') ?? ($current ? 'Permanente' : ($isAdmin ? 'Según tu rol administrativo' : 'Pendiente de contratación')) }}</dd></div><div><dt>Uso de la cuenta</dt><dd>Personal · 1 titular</dd></div></dl><a class="pr-button" href="{{ route('plans.mine') }}">{{ !$isAdmin && !$current ? 'Elegir un plan' : ($current && !$current->plan->isLifetime() ? 'Renovar o cambiar plan' : 'Ver cobertura y pagos') }}</a></section>
            <section class="pr-panel wk-account-shortcuts"><h2>Modelos recientes</h2>@forelse($recentModels as $model)<p class="wk-recent-model"><strong>{{ $model->name }}</strong><small>Actualizado {{ \Illuminate\Support\Carbon::parse($model->updated_at)->timezone('America/Lima')->format('d/m/Y H:i') }}</small></p>@empty<p class="pr-hint">Todavía no tienes modelos guardados en el servidor.</p>@endforelse</section>
            <section class="pr-panel wk-account-shortcuts"><h2>Cuenta y proyectos</h2><a href="{{ route('backups.index') }}">Mis respaldos y restauración ↗</a><a href="{{ route('profile') }}">Perfil y seguridad ↗</a><a href="{{ route('account.support') }}">Ayuda y soporte ↗</a>@if($user->canManageUsers())<a href="{{ route('administration.index') }}">Administración ↗</a><a href="{{ route('planUser.index') }}">Usuarios y suscripciones ↗</a>@endif</section>
            @if($user->hasRole(['root','gerencia','asistente']))<section class="pr-panel wk-account-shortcuts"><h2>Documentación técnica</h2><a href="{{ route('calculadora.asistente.memoria-calculo') }}">Memoria de cálculo ↗</a><a href="{{ route('calculadora.asistente.memoria-descriptiva') }}">Memoria descriptiva ↗</a></section>@endif
            <p class="wk-account-policy">Cuenta de uso individual. Se admiten hasta dos sesiones simultáneas; un tercer acceso cierra todas y registra una alerta de seguridad.</p>
        </aside>
    </div>
</div>
@endsection
