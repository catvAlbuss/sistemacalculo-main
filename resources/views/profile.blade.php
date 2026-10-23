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
                    <div><dt>Estado de la cuenta</dt><dd>{{ $account->is_active ? 'Activa' : 'Inactiva' }}</dd></div>
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
        <section class="pr-panel wk-account-item"><div><span class="en-card-number">03 / SEGURIDAD</span><h2>Contraseña y acceso</h2><p>Usa una contraseña exclusiva para esta cuenta y evita compartirla.</p></div><div><p class="wk-notice">Dispositivos con actividad en los últimos 30 minutos: <strong>{{ $account->activeSessions()->count() }}</strong>. Si no reconoces un acceso, cambia tu contraseña y contacta con soporte.</p><livewire:profile.update-password-form /></div></section>
        <section class="pr-panel wk-account-item"><div><span class="en-card-number">04 / CUENTA</span><h2>Cierre de cuenta</h2><p>Descarga tus respaldos antes de solicitar cambios permanentes.</p></div><div><livewire:profile.delete-user-form /></div></section>
    </div>
</x-workspace-layout>
