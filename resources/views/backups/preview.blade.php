@extends('layouts.workspace')
@section('main')
<div class="wk-legacy-detail wk-stack">
<h1 class="text-3xl font-bold">Revisar restauración de la copia #{{ $backup->id }}</h1>
<p>Los proyectos volverán al estado del {{ $backup->created_at->timezone('America/Lima')->format('d/m/Y H:i') }}. Los registros posteriores se eliminarán y los modificados volverán a la copia. Antes de aplicar el cambio se guardará automáticamente el estado actual para poder recuperarlo.</p>
<p>Cierra las otras pestañas que estén editando estos proyectos. Al terminar, vuelve a abrirlos desde el servidor para evitar trabajar con datos antiguos del navegador.</p>
<div class="wk-table-scroll"><table class="wk-table"><thead><tr><th>Datos</th><th>Ahora</th><th>Después</th></tr></thead><tbody>@foreach($preview['counts'] as $table => $count)<tr class="border-t"><td class="py-3">{{ ['cad_models'=>'Modelos CAD','memoria_calculos'=>'Memorias de cálculo','memorias_descriptivas'=>'Memorias descriptivas','memoria_imagenes'=>'Imágenes'][$table] }}</td><td>{{ $preview['current'][$table] }}</td><td>{{ $count }}</td></tr>@endforeach</tbody></table></div>
@foreach($preview['projects'] as $table => $changes)
<section class="pr-panel wk-card"><h2 class="font-bold">{{ ['cad_models'=>'Modelos CAD','memoria_calculos'=>'Memorias de cálculo','memorias_descriptivas'=>'Memorias descriptivas'][$table] }}</h2>
<p>Quedarán con el contenido de la copia:</p><ul>@forelse($changes['restore'] as $project)<li>#{{ $project['id'] }} · {{ $project['name'] }}</li>@empty<li>Ninguno.</li>@endforelse</ul>
<p>Se quitarán por ser posteriores a la copia:</p><ul>@forelse($changes['remove'] as $project)<li>#{{ $project['id'] }} · {{ $project['name'] }}</li>@empty<li>Ninguno.</li>@endforelse</ul></section>
@endforeach
@if($errors->any())<p role="alert" class="rounded-lg bg-red-50 p-4 text-red-800">{{ $errors->first() }}</p>@endif
<form method="POST" action="{{ route('backups.restore', $backup) }}" class="pr-panel wk-card wk-stack">@csrf
<input type="hidden" name="revision" value="{{ $preview['revision'] }}">
<label class="flex items-start gap-3"><input type="checkbox" name="confirm" value="1" required><span>He revisado la fecha y el contenido. Confirmo reemplazar mis proyectos por esta copia.</span></label>
<label class="block">Contraseña actual<input type="password" name="password" required autocomplete="current-password" class="pr-input"></label>
<button class="pr-button wk-danger">Restaurar y guardar el estado anterior</button>
</form><a class="en-inline-link" href="{{ route('backups.index') }}">Volver sin restaurar</a>
</div>
@endsection
