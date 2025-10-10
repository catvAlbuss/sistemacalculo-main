<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Crear blog') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <!-- Formulario para crear un blog -->
                    <form action="{{ route('blogs.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf

                        <!-- Campo: Título -->
                        <div class="mb-6">
                            <label for="titulo" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Título
                            </label>
                            <input type="text" id="titulo" name="titulo"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Ingrese el título" required>
                        </div>

                        <!-- Campo: Descripción -->
                        <div class="mb-6">
                            <label for="descripcion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Descripción
                            </label>
                            <textarea id="descripcion" name="descripcion" rows="4"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Ingrese la descripción" required></textarea>
                        </div>

                        <!-- Campo: Fecha de Publicación -->
                        <div class="mb-6">
                            <label for="fecha_publicacion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Fecha de Publicación
                            </label>
                            <input type="date" id="fecha_publicacion" name="fecha_publicacion"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required>
                        </div>

                        <!-- Campo: Ubicación -->
                        <div class="mb-6">
                            <label for="ubicacion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Ubicación
                            </label>
                            <input type="text" id="ubicacion" name="ubicacion"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Ingrese la ubicación" required>
                        </div>

                        <!-- Campo: Imagen -->
                        <div class="mb-6">
                            <label for="imagenref" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Imagen
                            </label>
                            <input type="file" id="imagenref" name="imagenref"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                accept="image/*">
                        </div>

                        <!-- Botón de Enviar -->
                        <button type="submit"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Crear Blog
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>