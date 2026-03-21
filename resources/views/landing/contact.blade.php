@extends('layouts.landing')

@section('main')
    <div class="" x-data="contactForm()">
        <div class="container mx-auto px-4 py-12">

            <!-- Hero Section -->
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
                    Elige tu Plan Perfecto
                </h2>
                <p class="text-xl text-gray-100 max-w-2xl mx-auto">
                    Accede a contenido exclusivo y mejora tus habilidades con nuestros planes diseñados para ti
                </p>
            </div>

            <!-- Plans Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                @foreach ($plans as $index => $plan)
                    <div
                        class="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden
                        {{ $plan->type === 'lifetime' ? 'ring-4 ring-yellow-400' : '' }}">

                        <!-- Badge para plan destacado -->
                        @if ($plan->type === 'lifetime')
                            <div class="bg-yellow-400 text-white text-center py-2 font-bold text-sm">
                                <i class="fas fa-crown mr-1"></i> MÁS POPULAR
                            </div>
                        @endif

                        <div class="p-8">
                            <!-- Icono del plan -->
                            <div class="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <i
                                    class="fas {{ $plan->type === 'lifetime' ? 'fa-infinity' : ($plan->type === 'trial' ? 'fa-clock' : 'fa-star') }} text-white text-2xl"></i>
                            </div>

                            <!-- Nombre del plan -->
                            <h3 class="text-2xl font-bold text-gray-800 text-center mb-2">
                                {{ $plan->name }}
                            </h3>

                            <!-- Descripción -->
                            @if ($plan->description)
                                <p class="text-gray-600 text-center mb-6 text-sm">
                                    {{ $plan->description }}
                                </p>
                            @endif

                            <!-- Precio -->
                            <div class="text-center mb-6">
                                @if ($plan->type === 'lifetime')
                                    <p class="text-sm text-gray-600 mb-2">Precio personalizado</p>
                                    <p class="text-lg font-semibold text-blue-600">Consultar vía Email/WhatsApp</p>
                                @else
                                    <div class="text-4xl font-bold text-gray-800">
                                        S/ {{ number_format($plan->price, 2) }}
                                    </div>
                                    <p class="text-gray-600 text-sm mt-1">{{ $plan->duration_text }}</p>
                                @endif
                            </div>

                            <!-- Features -->
                            @if ($plan->features)
                                <ul class="space-y-3 mb-8">
                                    @foreach ($plan->features as $feature)
                                        <li class="flex items-start">
                                            <i class="fas fa-check-circle text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                                            <span class="text-gray-700 text-sm">{{ $feature }}</span>
                                        </li>
                                    @endforeach
                                </ul>
                            @endif

                            <!-- Botón de selección -->
                            <button @click="selectPlan({{ json_encode($plan) }})"
                                class="w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105
                                   {{ $plan->type === 'lifetime' ? 'bg-yellow-400 hover:from-yellow-500 hover:to-orange-600' : 'bg-blue-600 hover:from-blue-700 hover:to-indigo-700' }}">
                                <i class="fas fa-arrow-right mr-2"></i>
                                Seleccionar Plan
                            </button>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Formulario de Contacto y Pago -->
            <div x-show="showForm" x-transition:enter="transition ease-out duration-300"
                x-transition:enter-start="opacity-0 transform scale-95"
                x-transition:enter-end="opacity-100 transform scale-100"
                class="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

                <div class="bg-blue-600 p-6">
                    <div class="flex items-center justify-between text-white">
                        <div>
                            <h3 class="text-2xl font-bold">Completa tu Información</h3>
                            <p class="text-blue-100 text-sm mt-1">Plan seleccionado: <span class="font-semibold"
                                    x-text="selectedPlan?.name"></span></p>
                        </div>
                        <button @click="showForm = false" class="text-white hover:text-gray-200">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                <form action="{{ route('contacto.store') }}" method="POST" enctype="multipart/form-data" class="p-8"
                    @submit="handleSubmit">
                    @csrf
                    <input type="hidden" name="subscription_plan_id" x-model="selectedPlan?.id">

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <!-- Columna Izquierda: Información Personal -->
                        <div class="space-y-6">
                            <h4 class="text-lg font-bold text-gray-800 border-b pb-2">
                                <i class="fas fa-user mr-2 text-blue-600"></i> Información Personal
                            </h4>

                            <!-- Nombre -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre Completo <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="name" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="Ej: Juan Pérez García">
                                @error('name')
                                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                                @enderror
                            </div>

                            <!-- Email -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Correo Electrónico <span class="text-red-500">*</span>
                                </label>
                                <input type="email" name="email" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="correo@ejemplo.com">
                                @error('email')
                                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                                @enderror
                            </div>

                            <!-- Teléfono -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono/WhatsApp <span class="text-red-500">*</span>
                                </label>
                                <input type="tel" name="phone" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="999 999 999">
                                @error('phone')
                                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                                @enderror
                            </div>

                            <!-- Mensaje -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Mensaje Adicional (Opcional)
                                </label>
                                <textarea name="message" rows="3"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                                    placeholder="Escribe cualquier consulta o comentario..."></textarea>
                            </div>
                        </div>

                        <!-- Columna Derecha: Información de Pago -->
                        <div class="space-y-6">
                            <h4 class="text-lg font-bold text-gray-800 border-b pb-2">
                                <i class="fas fa-credit-card mr-2 text-blue-600"></i> Información de Pago
                            </h4>

                            <!-- Mostrar solo si NO es lifetime -->
                            <template x-if="selectedPlan?.type !== 'lifetime'">
                                <div>
                                    <!-- Resumen del Plan -->
                                    <div class="bg-blue-50 rounded-lg p-4 mb-4">
                                        <div class="flex justify-between items-center mb-2">
                                            <span class="text-gray-700 font-medium">Plan:</span>
                                            <span class="font-bold text-gray-800" x-text="selectedPlan?.name"></span>
                                        </div>
                                        <div class="flex justify-between items-center mb-2">
                                            <span class="text-gray-700 font-medium">Duración:</span>
                                            <span class="font-bold text-gray-800"
                                                x-text="selectedPlan?.duration_text"></span>
                                        </div>
                                        <div class="flex justify-between items-center text-lg border-t pt-2 mt-2">
                                            <span class="text-gray-700 font-bold">Total a Pagar:</span>
                                            <span class="font-bold text-blue-600 text-2xl"
                                                x-text="'S/ ' + parseFloat(selectedPlan?.price || 0).toFixed(2)"></span>
                                        </div>
                                    </div>

                                    <!-- QR de Yape -->
                                    <div
                                        class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 text-center border-2 border-purple-200">
                                        <h5 class="font-bold text-gray-800 mb-3 flex items-center justify-center">
                                            <img src="https://cdn.sanity.io/images/whc4dqyy/production/c2db724d47ddb5294247a60336aa2c1e1ba0327e-1200x630.png/1200x630wa.png"
                                                alt="Yape" class="h-8 mr-2">
                                            Paga con Yape
                                        </h5>

                                        <!-- QR Code Placeholder -->
                                        <div class="bg-white p-4 rounded-lg inline-block mb-3">
                                            <img src="{{ Vite::asset('resources/img/qrcodeyapera.png') }}" alt="QR Yape"
                                                class="w-60 h-60">
                                        </div>

                                        <p class="text-sm text-gray-600 mb-2">
                                            <i class="fas fa-mobile-alt mr-1"></i>
                                            Escanea el código QR con tu app Yape
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            Nombre: <span class="font-bold">Luis A. Rizabal G.</span>
                                            Número: <span class="font-bold">+51 962 999 500</span>
                                        </p>
                                    </div>

                                    <!-- Subir Comprobante -->
                                    <div class="mt-4">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Comprobante de Pago
                                            <span class="text-red-500">*</span>
                                        </label>

                                        <!-- Zona de carga -->
                                        <div x-show="!uploadedFile && !isUploading"
                                            class="border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer"
                                            :class="dragOver ? 'border-blue-500 bg-blue-50' :
                                                'border-gray-300 hover:border-blue-400'"
                                            @click="$refs.fileInput.click()" @dragover.prevent="dragOver = true"
                                            @dragleave.prevent="dragOver = false" @drop.prevent="handleDrop($event)">
                                            <input type="file" name="payment_proof"
                                                accept="image/jpeg,image/jpg,image/png" class="hidden" x-ref="fileInput"
                                                @change="handleFileSelect($event)" required>
                                            <i class="fas fa-cloud-upload-alt text-5xl text-gray-400 mb-3"></i>
                                            <p class="text-sm text-gray-700 font-medium mb-1">
                                                Click para subir o arrastra tu captura aquí
                                            </p>
                                            <p class="text-xs text-gray-500">
                                                JPG, PNG (Máx. 2MB)
                                            </p>
                                        </div>

                                        <!-- Estado de carga -->
                                        <div x-show="isUploading"
                                            class="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
                                            <div class="flex flex-col items-center">
                                                <div class="relative w-16 h-16 mb-3">
                                                    <svg class="animate-spin h-16 w-16 text-blue-600"
                                                        xmlns="http://www.w3.org/2000/svg" fill="none"
                                                        viewBox="0 0 24 24">
                                                        <circle class="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" stroke-width="4"></circle>
                                                        <path class="opacity-75" fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                        </path>
                                                    </svg>
                                                </div>
                                                <p class="text-sm font-medium text-blue-700">Cargando imagen...</p>
                                                <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        :style="`width: ${uploadProgress}%`"></div>
                                                </div>
                                                <p class="text-xs text-gray-600 mt-2" x-text="`${uploadProgress}%`"></p>
                                            </div>
                                        </div>

                                        <!-- Archivo cargado -->
                                        <div x-show="uploadedFile && !isUploading"
                                            class="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center space-x-3 flex-1 min-w-0">
                                                    <div class="flex-shrink-0">
                                                        <img :src="previewUrl" alt="Preview"
                                                            class="w-16 h-16 rounded-lg object-cover border-2 border-green-300">
                                                    </div>
                                                    <div class="flex-1 min-w-0">
                                                        <p class="text-sm font-medium text-gray-800 truncate"
                                                            x-text="uploadedFile?.name"></p>
                                                        <p class="text-xs text-gray-600"
                                                            x-text="formatFileSize(uploadedFile?.size)"></p>
                                                        <div class="flex items-center mt-1">
                                                            <i class="fas fa-check-circle text-green-600 mr-1 text-xs"></i>
                                                            <span class="text-xs text-green-700 font-medium">Cargado
                                                                exitosamente</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="button" @click="removeFile()"
                                                    class="ml-3 flex-shrink-0 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full p-2 transition-all duration-200">
                                                    <i class="fas fa-trash-alt text-lg"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Mensaje de error -->
                                        <div x-show="fileError"
                                            class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div class="flex items-start">
                                                <i class="fas fa-exclamation-triangle text-red-600 mr-2 mt-0.5"></i>
                                                <p class="text-sm text-red-700" x-text="fileError"></p>
                                            </div>
                                        </div>

                                        @error('payment_proof')
                                            <p class="text-red-500 text-xs mt-2">{{ $message }}</p>
                                        @enderror
                                    </div>
                                </div>
                            </template>

                            <!-- Mensaje para plan Lifetime -->
                            <template x-if="selectedPlan?.type === 'lifetime'">
                                <div
                                    class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-300">
                                    <div class="text-center mb-4">
                                        <i class="fas fa-crown text-yellow-500 text-4xl mb-3"></i>
                                        <h5 class="font-bold text-gray-800 text-lg mb-2">Plan de Por Vida</h5>
                                        <p class="text-gray-600 text-sm">
                                            Este es un plan especial con precio personalizado
                                        </p>
                                    </div>

                                    <div class="bg-white rounded-lg p-4 space-y-3">
                                        <div class="flex items-center text-sm">
                                            <i class="fas fa-envelope text-blue-600 mr-3"></i>
                                            <span class="text-gray-700">Te contactaremos por email</span>
                                        </div>
                                        <div class="flex items-center text-sm">
                                            <i class="fab fa-whatsapp text-green-600 mr-3"></i>
                                            <span class="text-gray-700">Enviaremos información por WhatsApp</span>
                                        </div>
                                        <div class="flex items-center text-sm">
                                            <i class="fas fa-handshake text-purple-600 mr-3"></i>
                                            <span class="text-gray-700">Coordinaremos el método de pago</span>
                                        </div>
                                    </div>

                                    <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p class="text-xs text-blue-800">
                                            <i class="fas fa-info-circle mr-1"></i>
                                            Mientras tanto, recibirás una cuenta de prueba por 10 días
                                        </p>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Nota sobre cuenta de prueba -->
                    <div class="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <div class="flex items-start">
                            <i class="fas fa-gift text-green-600 text-xl mr-3 mt-1"></i>
                            <div>
                                <h5 class="font-bold text-green-800 mb-1">¡Acceso Inmediato!</h5>
                                <p class="text-sm text-green-700">
                                    Al enviar este formulario, crearemos automáticamente tu cuenta con
                                    <span class="font-bold">10 días de prueba gratis</span>.
                                    Recibirás tus credenciales por correo electrónico.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Términos y condiciones -->
                    <div class="mt-6">
                        <label class="flex items-start cursor-pointer">
                            <input type="checkbox" required
                                class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="ml-2 text-sm text-gray-600">
                                Acepto los
                                <a href="#" class="text-blue-600 hover:underline">términos y condiciones</a>
                                y la
                                <a href="#" class="text-blue-600 hover:underline">política de privacidad</a>
                            </span>
                        </label>
                    </div>

                    <!-- Botón de envío -->
                    <div class="mt-8">
                        <button type="submit" :disabled="isSubmitting"
                            class="w-full bg-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            <span x-show="!isSubmitting">
                                <i class="fas fa-paper-plane mr-2"></i>
                                Enviar Solicitud
                            </span>
                            <span x-show="isSubmitting">
                                <i class="fas fa-spinner fa-spin mr-2"></i>
                                Enviando...
                            </span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Sección de Beneficios -->
            <div class="mt-20 max-w-5xl mx-auto">
                <h3 class="text-3xl font-bold text-center text-gray-100 mb-12">
                    ¿Por qué Elegirnos?
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
                        <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-rocket text-blue-600 text-2xl"></i>
                        </div>
                        <h4 class="font-bold text-xl text-gray-800 mb-2">Acceso Inmediato</h4>
                        <p class="text-gray-600">
                            Comienza a aprender desde el primer día con tu cuenta de prueba
                        </p>
                    </div>

                    <div class="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
                        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-shield-alt text-green-600 text-2xl"></i>
                        </div>
                        <h4 class="font-bold text-xl text-gray-800 mb-2">Pago Seguro</h4>
                        <p class="text-gray-600">
                            Transacciones protegidas y verificación de pagos inmediata
                        </p>
                    </div>

                    <div class="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
                        <div class="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-headset text-purple-600 text-2xl"></i>
                        </div>
                        <h4 class="font-bold text-xl text-gray-800 mb-2">Soporte 24/7</h4>
                        <p class="text-gray-600">
                            Estamos aquí para ayudarte en todo momento vía email y WhatsApp
                        </p>
                    </div>
                </div>
            </div>

            <!-- FAQs -->
            <div class="mt-20 max-w-3xl mx-auto">
                <h3 class="text-3xl font-bold text-center text-gray-100 mb-12">
                    Preguntas Frecuentes
                </h3>
                <div class="space-y-4">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h4 class="font-bold text-gray-800 mb-2">
                            <i class="fas fa-question-circle text-blue-600 mr-2"></i>
                            ¿Cómo funciona el período de prueba?
                        </h4>
                        <p class="text-gray-600 text-sm">
                            Al registrarte, recibirás acceso completo por 10 días gratis. Podrás explorar todo el contenido
                            antes de confirmar tu pago.
                        </p>
                    </div>

                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h4 class="font-bold text-gray-800 mb-2">
                            <i class="fas fa-question-circle text-blue-600 mr-2"></i>
                            ¿Cuánto tiempo tarda la activación?
                        </h4>
                        <p class="text-gray-600 text-sm">
                            La cuenta de prueba se activa inmediatamente. Una vez confirmemos tu pago (24-48 horas),
                            actualizaremos tu plan al seleccionado.
                        </p>
                    </div>

                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h4 class="font-bold text-gray-800 mb-2">
                            <i class="fas fa-question-circle text-blue-600 mr-2"></i>
                            ¿Qué pasa si no subo el comprobante?
                        </h4>
                        <p class="text-gray-600 text-sm">
                            Para planes mensuales y anuales, el comprobante es obligatorio. Puedes tomar una captura de
                            pantalla
                            de tu transacción Yape y subirla antes de enviar el formulario.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <footer class="bg-gray-800 text-white mt-20 py-8">
            <div class="container mx-auto px-4 text-center">
                <div class="mb-4">
                    <a href="#" class="text-2xl mx-3 hover:text-blue-400 transition">
                        <i class="fab fa-facebook"></i>
                    </a>
                    <a href="#" class="text-2xl mx-3 hover:text-blue-400 transition">
                        <i class="fab fa-instagram"></i>
                    </a>
                    <a href="#" class="text-2xl mx-3 hover:text-green-400 transition">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                    <a href="#" class="text-2xl mx-3 hover:text-blue-400 transition">
                        <i class="fas fa-envelope"></i>
                    </a>
                </div>
                <p class="text-gray-400 text-sm">
                    &copy; 2025 Tu Plataforma. Todos los derechos reservados.
                </p>
            </div>
        </footer>

        <script>
            function contactForm() {
                return {
                    showForm: false,
                    selectedPlan: null,
                    uploadedFile: null,
                    previewUrl: null,
                    isUploading: false,
                    uploadProgress: 0,
                    fileError: null,
                    dragOver: false,
                    isSubmitting: false,

                    selectPlan(plan) {
                        this.selectedPlan = plan;
                        this.showForm = true;
                        this.resetFileUpload();

                        this.$nextTick(() => {
                            document.querySelector('[x-show="showForm"]')?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        });
                    },

                    handleFileSelect(event) {
                        const file = event.target.files[0];
                        if (file) {
                            this.validateAndUploadFile(file);
                        }
                    },

                    handleDrop(event) {
                        this.dragOver = false;
                        const file = event.dataTransfer.files[0];
                        if (file) {
                            this.validateAndUploadFile(file);
                        }
                    },

                    validateAndUploadFile(file) {
                        this.fileError = null;

                        // Validar tipo de archivo
                        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                        if (!validTypes.includes(file.type)) {
                            this.fileError = 'Solo se permiten archivos JPG y PNG';
                            return;
                        }

                        // Validar tamaño (2MB)
                        const maxSize = 2 * 1024 * 1024;
                        if (file.size > maxSize) {
                            this.fileError = 'El archivono debe superar los 2MB';
                            return;
                        }

                        // Validar que el archivo no esté corrupto
                        this.validateImageIntegrity(file);
                    },

                    validateImageIntegrity(file) {
                        const reader = new FileReader();

                        reader.onload = (e) => {
                            const img = new Image();

                            img.onload = () => {
                                // La imagen es válida
                                this.simulateUpload(file, e.target.result);
                            };

                            img.onerror = () => {
                                this.fileError = 'El archivo está corrupto o no es una imagen válida';
                                this.resetFileUpload();
                            };

                            img.src = e.target.result;
                        };

                        reader.onerror = () => {
                            this.fileError = 'Error al leer el archivo. Por favor, intenta con otro archivo';
                            this.resetFileUpload();
                        };

                        reader.readAsDataURL(file);
                    },

                    simulateUpload(file, dataUrl) {
                        this.isUploading = true;
                        this.uploadProgress = 0;

                        const interval = setInterval(() => {
                            this.uploadProgress += 10;

                            if (this.uploadProgress >= 100) {
                                clearInterval(interval);
                                this.isUploading = false;
                                this.uploadedFile = file;
                                this.previewUrl = dataUrl;
                            }
                        }, 100);
                    },

                    removeFile() {
                        this.uploadedFile = null;
                        this.previewUrl = null;
                        this.fileError = null;
                        this.$refs.fileInput.value = '';
                    },

                    resetFileUpload() {
                        this.uploadedFile = null;
                        this.previewUrl = null;
                        this.fileError = null;
                        this.isUploading = false;
                        this.uploadProgress = 0;
                        if (this.$refs.fileInput) {
                            this.$refs.fileInput.value = '';
                        }
                    },

                    formatFileSize(bytes) {
                        if (bytes === 0) return '0 Bytes';
                        const k = 1024;
                        const sizes = ['Bytes', 'KB', 'MB'];
                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
                    },

                    handleSubmit(event) {
                        // Validar que el comprobante sea obligatorio para planes no-lifetime
                        if (this.selectedPlan?.type !== 'lifetime' && !this.uploadedFile) {
                            event.preventDefault();
                            this.fileError = 'Debes subir el comprobante de pago para continuar';

                            // Scroll al campo de comprobante
                            this.$nextTick(() => {
                                const fileSection = document.querySelector('[name="payment_proof"]').closest('div')
                                    .parentElement;
                                fileSection?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center'
                                });
                            });
                            return false;
                        }

                        // Prevenir doble envío
                        if (this.isSubmitting) {
                            event.preventDefault();
                            return false;
                        }

                        this.isSubmitting = true;
                    }
                }
            }
        </script>
    </div>
@endsection
