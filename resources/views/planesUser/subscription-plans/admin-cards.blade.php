<div class="wk-plan-admin-grid">
    @forelse($plans as $plan)
        <article class="pr-panel wk-plan-admin-card">
            <header><span class="wk-badge">{{ ['trial'=>'Prueba','monthly'=>'Mensual','yearly'=>'Anual','lifetime'=>'Permanente'][$plan->type] ?? $plan->type }}</span><span class="wk-badge" data-tone="{{ $plan->is_active ? 'success' : 'warning' }}">{{ $plan->is_active ? 'Publicado' : 'Inactivo' }}</span></header>
            <h2>{{ $plan->name }}</h2><p>{{ $plan->description }}</p>
            <div class="wk-plan-base"><strong>{{ $plan->formatted_price }}</strong><small>@if($plan->isLifetime())Importe por propuesta personalizada. Root o gerencia lo definen desde Usuarios y suscripciones.@else Monto base del servicio · {{ $plan->duration_text }}<br>El precio de venta incluye el procesamiento según la configuración.@endif</small></div>
            <ul>@foreach($plan->features ?? [] as $feature)<li>{{ $feature }}</li>@endforeach</ul>
            <dl class="wk-profile-details"><div><dt>Coberturas activas</dt><dd>{{ $plan->active_subscriptions_count }}</dd></div><div><dt>Proyectos incluidos</dt><dd>{{ $plan->max_projects ?? 'Sin límite definido' }}</dd></div></dl>
            <footer><button wire:click="edit({{ $plan->id }})" class="pr-button pr-button-secondary">Editar</button><button wire:click="toggleStatus({{ $plan->id }})" class="pr-button pr-button-secondary">{{ $plan->is_active ? 'Despublicar' : 'Publicar' }}</button><button wire:click="delete({{ $plan->id }})" wire:confirm="¿Eliminar este plan? Los planes con historial no se pueden eliminar." class="wk-action" aria-label="Eliminar plan {{ $plan->name }}">Eliminar</button></footer>
        </article>
    @empty<p class="pr-panel wk-empty">No se encontraron planes.</p>@endforelse
</div>
