<?php

use App\Livewire\Actions\Logout;
use Illuminate\Support\Facades\Auth;

use function Livewire\Volt\rules;
use function Livewire\Volt\state;

state(['password' => '']);

rules(['password' => ['required', 'string', 'current_password']]);

$deleteUser = function (Logout $logout) {
    $this->validate();

    tap(Auth::user(), $logout(...))->delete();

    $this->redirect('/', navigate: true);
};

?>

<section>
    <p class="pr-hint">Al eliminar tu cuenta perderás el acceso y se eliminarán sus datos. Esta acción es permanente. <a class="en-inline-link" href="{{ route('backups.index') }}">Revisar mis respaldos</a></p>
    <button type="button" class="pr-button wk-danger mt-4" x-data="" x-on:click.prevent="$dispatch('open-modal', 'confirm-user-deletion')">Eliminar mi cuenta</button>
    <x-modal name="confirm-user-deletion" :show="$errors->isNotEmpty()" focusable>
        <form wire:submit="deleteUser" class="wk-modal-form" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
            <p class="pr-eyebrow">Mi cuenta / Confirmación</p><h2 id="delete-account-title" class="text-xl font-bold mt-3">¿Eliminar tu cuenta?</h2>
            <p class="pr-hint">Confirma tu contraseña para continuar. Antes de eliminar la cuenta, descarga la información que quieras conservar.</p>
            <div class="mt-6"><label class="pr-label" for="delete-account-password">Contraseña actual</label><input class="pr-input" wire:model="password" id="delete-account-password" name="password" type="password" autocomplete="current-password" required><x-input-error :messages="$errors->get('password')" class="mt-2" /></div>
            <footer class="wk-form-footer"><button type="button" class="pr-button pr-button-secondary" x-on:click="$dispatch('close')">Conservar mi cuenta</button><button type="submit" class="pr-button wk-danger" wire:loading.attr="disabled" wire:target="deleteUser">Eliminar definitivamente</button></footer>
        </form>
    </x-modal>
</section>
