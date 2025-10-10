<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Inicio') }}
        </h2>
    </x-slot>

    <div class="py-2">
        <div class="max-w-12xl mx-auto sm:px-6 lg:px-8 space-y-4">
            <!-- Tarjeta de bienvenida -->
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <h2 class="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <span>🏗</span> Bienvenido a R&AIE
                    </h2>
                    <p class="mt-3 text-gray-700 dark:text-gray-300">
                        Tu centro digital de herramientas estructurales confiables y gratuitas.
                    </p>
                </div>
            </div>

            <!-- Beneficios -->
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <span>✨</span> ¿Qué puedes lograr con nuestras herramientas?
                    </h3>
                    <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1">✅</span>
                            <span>Optimizar tiempos de diseño estructural</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1">✅</span>
                            <span>Mejorar la precisión de tus cálculos</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1">✅</span>
                            <span>Cumplir con normas como ACI, EHE, NTC y más</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1">✅</span>
                            <span>Obtener resultados claros, rápidos y exportables (PDF, Excel, etc.)</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Funcionalidades -->
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <span>🔧</span> Funcionalidades disponibles
                    </h3>
                    <ul class="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
                        <li class="flex items-start gap-2">
                            <span class="text-blue-500 mt-1">•</span>
                            <span>Diseñar elementos de concreto, acero, madera y más</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-blue-500 mt-1">•</span>
                            <span>Verificar secciones, encofrados, refuerzos y estabilidad</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-blue-500 mt-1">•</span>
                            <span>Generar reportes técnicos profesionales en PDF</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-blue-500 mt-1">•</span>
                            <span>Acceso 24/7 desde cualquier dispositivo</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Público objetivo -->
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <span>🎯</span> Ideal para
                    </h3>
                    <div class="flex flex-wrap gap-3">
                        <span class="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                            Ingenieros estructurales
                        </span>
                        <span class="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
                            Estudiantes de ingeniería civil
                        </span>
                        <span class="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium">
                            Profesionales de la construcción
                        </span>
                        <span class="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-sm font-medium">
                            Docentes y capacitadores técnicos
                        </span>
                    </div>
                </div>
            </div>

            <!-- Llamado a la acción -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 text-center shadow-sm">
                <p class="text-gray-800 dark:text-gray-200 mb-4">
                    👉 <strong>¡Empieza ahora!</strong> Explora nuestras herramientas desde el menú superior o selecciona un programa a continuación.
                </p>
            </div>

            <!-- Contacto -->
            <div class="text-center text-gray-600 dark:text-gray-400 text-sm">
                ¿Tienes sugerencias o quieres colaborar? <a href="" class="text-blue-600 hover:underline dark:text-blue-400">¡Contáctanos!</a>
            </div>
        </div>
    </div>
</x-app-layout>