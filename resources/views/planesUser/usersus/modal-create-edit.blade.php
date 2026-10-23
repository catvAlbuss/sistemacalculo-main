<div x-show="showUserModal" class="wk-modal-overlay" style="display:none" role="dialog" aria-modal="true" aria-labelledby="user-modal-title"
    x-trap.inert.noscroll="showUserModal" @keydown.escape.stop.prevent="showUserModal = false" @click.self="showUserModal = false">
    <section class="wk-modal-panel" @click.stop>
        <header class="wk-modal-header"><div><p class="pr-eyebrow">Administración / Usuarios</p><h2 id="user-modal-title" x-text="modalTitle"></h2><p>Configura la identidad de acceso y los permisos de esta cuenta.</p></div><button type="button" class="wk-modal-close" @click="showUserModal = false" aria-label="Cerrar formulario de usuario">×</button></header>
        <form :action="formAction" method="POST" class="wk-modal-form">
            @csrf
            <input type="hidden" name="form_context" value="user">
            <input type="hidden" name="editing_user_id" :value="isEditMode ? userData.id : ''">
            @if ($errors->any() && old('form_context') === 'user')
                <div class="wk-notice" data-tone="danger" role="alert"><strong>Revisa los datos antes de guardar.</strong><ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>
            @endif
            <template x-if="isEditMode"><input type="hidden" name="_method" value="PUT"></template>
            <div class="wk-form-grid">
                <div><label for="admin-user-name" class="pr-label">Nombre completo</label><input class="pr-input" type="text" name="name" id="admin-user-name" x-model="userData.name" required maxlength="255" autocomplete="name"></div>
                <div><label for="admin-user-email" class="pr-label">Correo de acceso</label><input class="pr-input" type="email" name="email" id="admin-user-email" x-model="userData.email" required maxlength="255" autocomplete="off"><p class="pr-hint">Solo administración puede cambiar este correo.</p></div>
                <div><label for="admin-user-password" class="pr-label">Contraseña</label><input class="pr-input" type="password" name="password" id="admin-user-password" x-model="userPassword" :required="!isEditMode" minlength="8" autocomplete="new-password"><p class="pr-hint" x-show="isEditMode">Déjala vacía para conservar la actual.</p></div>
                <div><label for="admin-user-password-confirmation" class="pr-label">Confirmar contraseña</label><input class="pr-input" type="password" name="password_confirmation" id="admin-user-password-confirmation" x-model="userPasswordConfirmation" autocomplete="new-password" :required="!isEditMode || userPassword.length > 0"></div>
            </div>
            <fieldset class="wk-form-section"><legend>Roles de la cuenta</legend><p class="pr-hint">Selecciona al menos un rol. Los roles determinan las funciones disponibles.</p><div class="wk-choice-grid">
                @foreach ($roles as $role)
                    <label class="wk-choice"><input type="checkbox" name="roles[]" value="{{ $role->name }}" x-model="userData.roles"><span>{{ $role->name }}</span></label>
                @endforeach
            </div></fieldset>
            <details class="wk-form-section"><summary>Permisos adicionales</summary><p class="pr-hint">Se suman a los permisos del rol; desmarcarlos no elimina los permisos heredados.</p><input type="hidden" name="permissions_present" value="1"><div class="wk-choice-grid">
                @forelse ($permissions as $permission)
                    <label class="wk-choice"><input type="checkbox" name="permissions[]" value="{{ $permission->name }}" x-model="userData.permissions"><span>{{ $permission->name }}</span></label>
                @empty<p class="pr-hint">No hay permisos adicionales configurados.</p>@endforelse
            </div></details>
            <footer class="wk-form-footer"><button type="button" @click="showUserModal = false" class="pr-button pr-button-secondary">Cancelar</button><button type="submit" class="pr-button">Guardar usuario</button></footer>
        </form>
    </section>
</div>
