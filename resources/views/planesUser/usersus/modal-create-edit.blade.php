<div x-show="showUserModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50" style="display: none;">
    <div class="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg" @click.away="showUserModal = false">
        <h2 class="text-xl font-bold mb-4" x-text="modalTitle"></h2>
        
        <form :action="formAction" method="POST">
            @csrf
            <template x-if="isEditMode">
                @method('PUT')
            </template>
            
            <div class="mb-4">
                <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" name="name" id="name" :value="userData.name" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" :value="userData.email" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            <div class="mb-4">
                <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" name="password" id="password" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" :required="!isEditMode">
                <p x-show="isEditMode" class="text-xs text-gray-500 mt-1">Dejar en blanco para no cambiarla.</p>
            </div>
            <div class="mb-4">
                <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input type="password" name="password_confirmation" id="password_confirmation" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Roles</label>
                <div class="mt-2 grid grid-cols-2 gap-4">
                    @foreach($roles as $role)
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="roles[]" value="{{ $role->name }}" :checked="userData.roles && userData.roles.includes('{{ $role->name }}')"
                                   class="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-200">
                            <span class="ml-2 text-sm text-gray-600">{{ $role->name }}</span>
                        </label>
                    @endforeach
                </div>
            </div>

            <div class="flex justify-end pt-4">
                <button type="button" @click="showUserModal = false" class="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button>
                <button type="submit" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Guardar</button>
            </div>
        </form>
    </div>
</div>