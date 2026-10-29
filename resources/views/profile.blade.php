<x-workspace-layout>
    @php($account = auth()->user())
    <header class="wk-heading"><div><p class="pr-eyebrow">Mi cuenta / Identidad y seguridad</p><h1>Perfil y seguridad</h1><p>Mantén tus datos al día y revisa cómo se protege el acceso a tu cuenta.</p></div></header>
    <div class="wk-account-list">
        <section class="pr-panel wk-account-item">
            <div><span class="en-card-number">01 / IDENTIDAD</span><h2>Datos de acceso</h2><p>El correo, los roles y los permisos los administra el equipo autorizado.</p></div>
            <div>
                <dl class="wk-profile-details">
                    <div><dt>Correo de registro</dt><dd>{{ $account->email }}</dd></div>
                    <div><dt>Roles asignados</dt><dd>{{ $account->getRoleNames()->implode(', ') ?: 'Sin rol asignado' }}</dd></div>
                    <div><dt>Estado de la cuenta</dt><dd>{{ $account->account_status === 'enabled' && ($account->is_active || $account->canManageUsers()) ? 'Habilitada' : 'Acceso restringido' }}</dd></div>
                    <div><dt>Fecha de registro</dt><dd>{{ $account->created_at?->format('d/m/Y') ?? '—' }}</dd></div>
                </dl>
                <details class="wk-profile-permissions"><summary>Ver permisos asignados</summary>
                    <p class="pr-hint">Los accesos a herramientas dependen de tus roles, permisos y la cobertura de tu plan.</p>
                    <div class="wk-permission-list">@forelse ($account->getAllPermissions()->sortBy('name') as $permission)<span class="wk-badge">{{ $permission->name }}</span>@empty<p class="pr-hint">No hay permisos adicionales registrados. Se aplican los accesos correspondientes a tus roles.</p>@endforelse</div>
                </details>
                <div class="wk-notice">Para corregir el correo o solicitar cambios de acceso, <a href="{{ route('account.support') }}">contacta con administración</a>. Estos datos no se modifican desde el perfil.</div>
                @if ($account->canManageUsers())<a class="en-inline-link wk-profile-admin-link" href="{{ route('planUser.index') }}">Administrar usuarios y accesos →</a>@endif
            </div>
        </section>
        <section class="pr-panel wk-account-item"><div><span class="en-card-number">02 / DATOS PERSONALES</span><h2>Información personal</h2><p>Puedes editar tu nombre y completar tu información de contacto y profesional.</p></div><div><livewire:profile.update-profile-information-form /></div></section>
        <section class="pr-panel wk-account-item"><div><span class="en-card-number">03 / SEGURIDAD</span><h2>Contraseña y acceso</h2><p>Cuenta personal de un solo titular. No compartas tus credenciales.</p></div><div><p class="wk-notice">Sesiones activas: <strong>{{ $account->accountSessions()->count() }} de 2</strong>. Un tercer acceso simultáneo cierra todas las sesiones y registra un aviso. Al cambiar tu contraseña se cierran las demás sesiones.</p><livewire:profile.update-password-form /><details class="wk-coverage-history"><summary>Últimos avisos de seguridad</summary>@forelse($account->securityEvents()->limit(5)->get() as $event)<p class="wk-notice"><strong>{{ $event->created_at->timezone('America/Lima')->format('d/m/Y H:i') }}</strong> · {{ $event->message }}</p>@empty<p class="pr-hint">No hay avisos de seguridad registrados.</p>@endforelse</details></div></section>
        <section class="pr-panel wk-account-item"><div><span class="en-card-number">04 / CUENTA</span><h2>Cierre de cuenta</h2><p>Descarga tus respaldos antes de solicitar cambios permanentes.</p></div><div><livewire:profile.delete-user-form /></div></section>
    </div>
</x-workspace-layout>
