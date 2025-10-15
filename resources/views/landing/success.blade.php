<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud Enviada - Tu Plataforma</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-screen flex items-center justify-center p-4">
    
    <div class="max-w-2xl w-full">
        <!-- Animación de éxito -->
        <div class="text-center mb-8 animate-bounce">
            <div class="inline-block">
                <div class="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <i class="fas fa-check text-white text-6xl"></i>
                </div>
            </div>
        </div>

        <!-- Tarjeta principal -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div class="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-center">
                <h1 class="text-3xl font-bold text-white mb-2">
                    ¡Solicitud Enviada Exitosamente!
                </h1>
                <p class="text-green-100">
                    Tu cuenta ha sido creada y está lista para usar
                </p>
            </div>

            <div class="p-8">
                <!-- Mensaje principal -->
                <div class="text-center mb-8">
                    <p class="text-lg text-gray-700 mb-4">
                        Hemos recibido tu solicitud y tu información ha sido registrada correctamente.
                    </p>
                </div>

                <!-- Pasos siguientes -->
                <div class="space-y-4 mb-8">
                    <div class="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    1
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="font-bold text-gray-800 mb-2">
                                    <i class="fas fa-envelope-open-text text-blue-600 mr-2"></i>
                                    Revisa tu Correo
                                </h3>
                                <p class="text-gray-600 text-sm">
                                    Te hemos enviado un email con tus credenciales de acceso y detalles de tu cuenta de prueba por 10 días.
                                </p>
                                <p class="text-xs text-gray-500 mt-2">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    No olvides revisar la carpeta de spam
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                    2
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="font-bold text-gray-800 mb-2">
                                    <i class="fas fa-clock text-green-600 mr-2"></i>
                                    Verificación de Pago
                                </h3>
                                <p class="text-gray-600 text-sm">
                                    Nuestro equipo verificará tu pago en las próximas 24-48 horas. Te notificaremos por email y WhatsApp.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                    3
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="font-bold text-gray-800 mb-2">
                                    <i class="fas fa-rocket text-purple-600 mr-2"></i>
                                    Comienza a Aprender
                                </h3>
                                <p class="text-gray-600 text-sm">
                                    Una vez confirmado el pago, tu cuenta será actualizada al plan seleccionado automáticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Información de contacto -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
                    <h3 class="font-bold text-gray-800 mb-4 text-center">
                        ¿Necesitas Ayuda?
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="mailto:soporte@tudominio.com" 
                           class="flex items-center justify-center bg-white rounded-lg p-4 hover:shadow-lg transition group">
                            <i class="fas fa-envelope text-blue-600 text-2xl mr-3 group-hover:scale-110 transition"></i>
                            <div>
                                <p class="text-xs text-gray-500">Email</p>
                                <p class="font-semibold text-gray-800">hyperiumtechr@gmail.com</p>
                            </div>
                        </a>
                        <a href="https://wa.me/51953992277" 
                           target="_blank"
                           class="flex items-center justify-center bg-white rounded-lg p-4 hover:shadow-lg transition group">
                            <i class="fab fa-whatsapp text-green-600 text-2xl mr-3 group-hover:scale-110 transition"></i>
                            <div>
                                <p class="text-xs text-gray-500">WhatsApp</p>
                                <p class="font-semibold text-gray-800">+51 953 992 277</p>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="/" 
                       class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg text-center transition">
                        <i class="fas fa-home mr-2"></i>
                        Ir al Inicio
                    </a>
                    <a href="/login" 
                       class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-center transition shadow-lg">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Iniciar Sesión
                    </a>
                </div>

                <!-- Mensaje adicional -->
                <div class="mt-8 text-center">
                    <p class="text-sm text-gray-500">
                        <i class="fas fa-shield-alt text-green-500 mr-1"></i>
                        Tu información está segura con nosotros
                    </p>
                </div>
            </div>
        </div>

        <!-- Tarjeta de cuenta de prueba -->
        <div class="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300">
            <div class="flex items-center justify-center mb-3">
                <i class="fas fa-gift text-yellow-600 text-3xl mr-3"></i>
                <h3 class="text-xl font-bold text-gray-800">
                    ¡Cuenta de Prueba Activada!
                </h3>
            </div>
            <p class="text-center text-gray-700 mb-2">
                Tienes <span class="font-bold text-yellow-600">10 días gratis</span> para explorar todo el contenido
            </p>
            <p class="text-center text-sm text-gray-600">
                El período de prueba comienza ahora mismo. ¡Aprovecha al máximo!
            </p>
        </div>
    </div>

    <script>
        // Confetti animation (opcional)
        setTimeout(() => {
            console.log('✨ ¡Bienvenido a nuestra plataforma!');
        }, 1000);
    </script>
</body>
</html>