<x-workspace-layout>
<div class="wk-user-admin" x-data="userManagement()">
    <header class="wk-heading"><div><p class="pr-eyebrow">Administración / Control de acceso</p><h1>Usuarios y suscripciones</h1><p>Gestiona la identidad, la cobertura contratada y la seguridad de cada cuenta.</p></div><button type="button" class="pr-button" @click="openCreateModal()">+ Crear usuario</button></header>
    @if(session('success'))<p class="wk-notice" role="status">{{ session('success') }}</p>@endif
    @if(session('error'))<p class="wk-notice" data-tone="danger" role="alert">{{ session('error') }}</p>@endif
    @if($errors->any() && old('form_context') !== 'user')<div class="wk-notice" data-tone="danger" role="alert"><strong>No se guardaron los cambios.</strong><ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>@endif
    <dl class="wk-stats wk-admin-stats">
        <div class="pr-panel wk-stat"><dt>Cuentas registradas</dt><dd>{{ $summary['total'] }}<small>Excluye las cuentas dadas de baja</small></dd></div>
        <div class="pr-panel wk-stat"><dt>Con cobertura vigente</dt><dd>{{ $summary['covered'] }}<small>Planes activos en este momento</small></dd></div>
        <div class="pr-panel wk-stat"><dt>Cuentas restringidas</dt><dd>{{ $summary['restricted'] }}<small>Bloqueadas o vetadas por administración</small></dd></div>
        <div class="pr-panel wk-stat"><dt>Política de acceso</dt><dd>1 titular<small>Máximo 2 sesiones; el tercer acceso cierra todas</small></dd></div>
    </dl>
    <section class="pr-panel wk-admin-panel" aria-label="Listado de usuarios">
        <form method="GET" action="{{ route('planUser.index') }}" class="wk-admin-search"><label for="user-search" class="sr-only">Buscar por nombre o correo</label><input id="user-search" class="pr-input" type="search" name="search" value="{{ request('search') }}" placeholder="Buscar por nombre o correo…"><button class="pr-button">Buscar</button>@if(request('search'))<a class="pr-button pr-button-secondary" href="{{ route('planUser.index') }}">Limpiar</a>@endif</form>
        <div class="wk-table-scroll"><table class="wk-table wk-users-table"><caption class="sr-only">Identidad, plan, estado y sesiones de cada usuario</caption><thead><tr><th scope="col">Usuario</th><th scope="col">Rol</th><th scope="col">Cobertura</th><th scope="col">Cuenta</th><th scope="col">Sesiones</th><th scope="col">Gestión</th></tr></thead><tbody>
        @forelse($users as $user)
            @php($canManage = auth()->user()->hasRole('root') || !$user->hasRole('root'))
            <tr class="{{ $user->account_status !== 'enabled' || (!$user->is_active && !$user->canManageUsers()) ? 'wk-row-disabled' : '' }}">
                <td><div class="wk-user-identity"><span class="wk-avatar" aria-hidden="true">{{ mb_substr($user->name,0,2) }}</span><div><strong>{{ $user->name }}</strong><span>{{ $user->email }}</span></div></div></td>
                <td><div class="wk-role-list">@forelse($user->getRoleNames()->sortBy(fn($role) => \App\Services\RoleHierarchy::rank($role)) as $role)<span class="wk-badge">{{ $role }}</span>@empty<span class="wk-muted">Sin rol</span>@endforelse</div></td>
                <td>@if($user->currentSubscription)<strong>{{ $user->currentSubscription->plan->name }}</strong><small class="wk-cell-detail">{{ $user->currentSubscription->accessEndsAt() ? 'Hasta '.$user->currentSubscription->accessEndsAt()->format('d/m/Y') : 'Permanente' }}</small>@else<span class="wk-badge" data-tone="warning">Sin cobertura vigente</span>@endif</td>
                <td><span class="wk-badge" data-tone="{{ $user->account_status === 'enabled' && ($user->is_active || $user->canManageUsers()) ? 'success' : 'muted' }}">{{ $user->account_status === 'enabled' ? (($user->is_active || $user->canManageUsers()) ? 'Habilitada' : 'Acceso inactivo') : (['blocked'=>'Bloqueada','banned'=>'Vetada'][$user->account_status] ?? $user->account_status) }}</span></td>
                <td><strong>{{ $user->account_sessions_count }} / 2</strong><small class="wk-cell-detail">sesiones activas</small></td>
                <td><div class="wk-row-actions">@if($canManage)<button type="button" class="wk-action" @click="openEditModal(details[{{ $user->id }}])">Editar</button><button type="button" class="wk-action" @click="openSubscriptionModal(details[{{ $user->id }}])">Plan e historial</button>@if(auth()->id() !== $user->id)<button type="button" class="wk-action" @click="openAccessModal(details[{{ $user->id }}])">Acceso</button>@endif @else<span class="wk-muted">Solo root</span>@endif</div></td>
            </tr>
        @empty<tr><td colspan="6"><p class="wk-empty">No se encontraron usuarios con estos datos.</p></td></tr>@endforelse
        </tbody></table></div>
        @if($users->hasPages())<div class="wk-pagination">{{ $users->links() }}</div>@endif
    </section>
    <section class="wk-section" aria-labelledby="security-events-heading"><div class="wk-section-head"><h2 id="security-events-heading">Actividad de seguridad y administración</h2><span class="wk-muted">Últimos 8 eventos</span></div><div class="wk-table-scroll"><table class="wk-table"><thead><tr><th scope="col">Fecha</th><th scope="col">Cuenta</th><th scope="col">Evento</th></tr></thead><tbody>@forelse($securityEvents as $event)<tr><td>{{ $event->created_at->timezone('America/Lima')->format('d/m/Y H:i') }}</td><td>{{ $event->user?->email ?? 'Cuenta dada de baja' }}</td><td>{{ $event->message }}</td></tr>@empty<tr><td colspan="3" class="wk-empty">Todavía no hay incidencias registradas.</td></tr>@endforelse</tbody></table></div></section>
    @include('planesUser.usersus.modal-create-edit')
    @include('planesUser.usersus.modal-subscription')
    <div x-show="showAccessModal" class="wk-modal-overlay" style="display:none" role="dialog" aria-modal="true" aria-labelledby="access-modal-title" x-trap.inert.noscroll="showAccessModal" @keydown.escape.stop.prevent="showAccessModal = false" @click.self="showAccessModal = false">
        <section class="wk-modal-panel"><header class="wk-modal-header"><div><p class="pr-eyebrow">Administración / Seguridad</p><h2 id="access-modal-title">Acceso a la cuenta</h2><p x-text="accessData.email"></p></div><button class="wk-modal-close" type="button" @click="showAccessModal = false" aria-label="Cerrar">×</button></header>
        <form :action="'{{ url('planUser') }}/'+accessData.id+'/account-status'" method="POST" class="wk-modal-form">@csrf @method('PATCH')
            <label class="pr-label" for="account-status">Estado de acceso</label><select class="pr-input" id="account-status" name="status" x-model="accessData.account_status" required><option value="enabled">Habilitada</option><option value="blocked">Bloqueada temporalmente</option><option value="banned">Vetada por incumplimiento</option></select>
            <div><label class="pr-label" for="account-reason">Motivo del cambio</label><textarea class="pr-input" id="account-reason" name="reason" required minlength="5" maxlength="1000" rows="3" placeholder="Explica el motivo para el registro de administración."></textarea></div>
            <p class="wk-notice">El cambio cierra las sesiones abiertas. Bloquear o vetar impide el acceso; no cancela ni devuelve cargos de Culqi. Al habilitar, se conserva el vencimiento original del plan.</p>
            <footer class="wk-form-footer"><button class="pr-button pr-button-secondary" type="button" @click="showAccessModal = false">Cancelar</button><button class="pr-button">Guardar estado</button></footer>
        </form>
        <div class="wk-modal-danger"><h3>Dar de baja la cuenta</h3><p>Retira el acceso y cancela la cobertura. Conserva los pagos y el correo registrado para mantener la trazabilidad.</p><form :action="'{{ url('planUser') }}/'+accessData.id" method="POST" onsubmit="return confirm('¿Dar de baja esta cuenta? Se cerrarán sus sesiones y se cancelará su cobertura. Los pagos se conservarán.');">@csrf @method('DELETE')<button class="pr-button wk-danger">Dar de baja</button></form></div></section>
    </div>
</div>
<script>
function userManagement() {
    return {
        details: @js($userDetails), showUserModal: false, showSubscriptionModal: false, showAccessModal: false,
        showExtendForm: false, isEditMode: false, modalTitle: '', formAction: '',
        userData: {name:'',email:'',roles:[],permissions:[]}, userPassword:'', userPasswordConfirmation:'', subscriptionData:{}, accessData:{},
        init() {
            const previous = @js(session()->getOldInput());
            if (@js($errors->any()) && previous.form_context === 'user') {
                const id = Number(previous.editing_user_id);
                this.isEditMode = Number.isSafeInteger(id) && id > 0;
                this.modalTitle = this.isEditMode ? 'Editar usuario' : 'Crear usuario';
                this.formAction = this.isEditMode ? '{{ url('planUser') }}/'+id : '{{ route('planUser.store') }}';
                this.userData = {id, name:previous.name||'',email:previous.email||'',roles:previous.roles||[],permissions:previous.permissions||[],protected_root:this.details[id]?.protected_root||false};
                this.showUserModal = true;
            }
        },
        openCreateModal() { this.isEditMode=false; this.modalTitle='Crear usuario'; this.formAction='{{ route('planUser.store') }}'; this.userData={name:'',email:'',roles:[],permissions:[]}; this.userPassword='';this.userPasswordConfirmation='';this.showUserModal=true; },
        openEditModal(user) { this.isEditMode=true; this.modalTitle='Editar usuario';this.formAction='{{ url('planUser') }}/'+user.id;this.userData={...user,roles:user.roles.map(r=>r.name),permissions:user.permissions.map(p=>p.name)};this.userPassword='';this.userPasswordConfirmation='';this.showUserModal=true; },
        openSubscriptionModal(user) { this.subscriptionData=user;this.showExtendForm=false;this.showSubscriptionModal=true; },
        openAccessModal(user) { this.accessData={...user};this.showAccessModal=true; },
        closeModals() { this.showUserModal=false;this.showSubscriptionModal=false;this.showAccessModal=false; }
    };
}
</script>
</x-workspace-layout>
