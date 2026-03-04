{{-- partials/cover-images.blade.php - Imágenes de portada --}}
<div class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
        <div class="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Imágenes de Portada</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Fotografías principales del proyecto</p>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8"
        :class="cover.reportType === 'MODULOS' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'">
        {{-- Image 1 --}}
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-gray-700 dark:text-gray-300">
                    <span x-text="cover.reportType === 'MODULOS' ? 'Imagen de Módulo 1' : 'Imagen Principal'"></span>
                </label>
                <button type="button" x-show="previews.coverImage" @click="removeImage('coverImage')"
                    class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                </button>
            </div>
            <div class="relative group">
                <template x-if="previews.coverImage">
                    <div
                        class="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                        <img :src="previews.coverImage"
                            class="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105">
                    </div>
                </template>
                <template x-if="!previews.coverImage">
                    <label
                        class="flex flex-col items-center justify-center h-64 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                        <div
                            class="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Click para subir
                            imagen</span>
                        <span class="text-xs text-gray-500">PNG, JPG hasta 10MB</span>
                        <input type="file" accept="image/*" @change="handleImageChange('coverImage', $event)"
                            class="hidden">
                    </label>
                </template>
            </div>
        </div>

        {{-- Image 2 (Solo para MODULOS) --}}
        <div class="space-y-3" x-show="cover.reportType === 'MODULOS'" x-transition>
            <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen de Módulo 2</label>
                <button type="button" x-show="previews.coverImage2" @click="removeImage('coverImage2')"
                    class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                </button>
            </div>
            <div class="relative group">
                <template x-if="previews.coverImage2">
                    <div
                        class="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                        <img :src="previews.coverImage2"
                            class="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105">
                    </div>
                </template>
                <template x-if="!previews.coverImage2">
                    <label
                        class="flex flex-col items-center justify-center h-64 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                        <div
                            class="p-4 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Click para subir
                            imagen</span>
                        <span class="text-xs text-gray-500">PNG, JPG hasta 10MB</span>
                        <input type="file" accept="image/*" @change="handleImageChange('coverImage2', $event)"
                            class="hidden">
                    </label>
                </template>
            </div>
        </div>
    </div>
</div>
