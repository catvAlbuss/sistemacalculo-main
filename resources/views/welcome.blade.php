@extends('layouts.landing')
@section('main')
    <!-- Main Content -->
    <main class="relative flex flex-1 flex-col justify-center overflow-hidden py-2">
        <!-- Fondo con patrón técnico -->
        <div
            class="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
        </div>
        <div class="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style="background-image: url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23000000%27 fill-opacity=%271%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
        </div>

        <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <!-- Grid mejorado con efecto glassmorphism -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">

                <!-- Columna izquierda: Información -->
                <div
                    class="group relative overflow-hidden rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:bg-slate-900/80 lg:p-10">
                    <!-- Borde decorativo animado -->
                    <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style="padding: 2px; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;">
                    </div>

                    <!-- Logo con efecto hover -->
                    <div class="mb-8 flex justify-center">
                        <div
                            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                            <img class="h-20 w-20 dark:invert sm:h-24 sm:w-24"
                                src="{{ Vite::asset('resources/img/logo_rizabalAsociados.png') }}"
                                alt="Rizabal Asociados Logo">
                        </div>
                    </div>

                    <!-- Descripción principal -->
                    <div class="space-y-6">
                        <p class="text-justify text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
                            En <strong class="font-semibold text-blue-600 dark:text-blue-400">Rizabal & Asociados</strong>,
                            ofrecemos programas avanzados de análisis y diseño estructural para edificaciones, puentes y
                            muros de sostenimiento. Simplifica tus proyectos, ahorra tiempo y garantiza precisión con
                            nuestras herramientas profesionales.
                        </p>

                        <!-- Features con iconos -->
                        <div class="space-y-4">
                            <!-- Feature 1 -->
                            <div
                                class="group/item flex items-start gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-4 transition-all duration-200 hover:shadow-md dark:from-blue-950/30 dark:to-cyan-950/30">
                                <div
                                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg">
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <h3 class="mb-1 font-semibold text-slate-900 dark:text-white">Resultados rápidos y
                                        precisos</h3>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">Diseña estructuras seguras y
                                        eficientes en minutos con cálculos validados.</p>
                                </div>
                            </div>

                            <!-- Feature 2 -->
                            <div
                                class="group/item flex items-start gap-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 p-4 transition-all duration-200 hover:shadow-md dark:from-cyan-950/30 dark:to-blue-950/30">
                                <div
                                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-lg">
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <h3 class="mb-1 font-semibold text-slate-900 dark:text-white">Interfaz intuitiva</h3>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">Diseñado para profesionales, fácil
                                        de aprender y usar desde el primer día.</p>
                                </div>
                            </div>

                            <!-- Feature 3 -->
                            <div
                                class="group/item flex items-start gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-4 transition-all duration-200 hover:shadow-md dark:from-blue-950/30 dark:to-cyan-950/30">
                                <div
                                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg">
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <h3 class="mb-1 font-semibold text-slate-900 dark:text-white">Cumplimiento normativo
                                    </h3>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">Actualizado con las normativas
                                        vigentes internacionales y locales.</p>
                                </div>
                            </div>
                        </div>

                        <!-- CTA -->
                        <div class="mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-center shadow-lg">
                            <p class="text-lg font-semibold text-white sm:text-xl">
                                ¡Eleva el nivel de tus proyectos estructurales!
                            </p>
                            <p class="mt-2 text-sm text-blue-100">
                                Únete a cientos de ingenieros que confían en nuestras soluciones
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Columna derecha: Login -->
                <div class="relative">
                    <livewire:login />
                </div>
            </div>

            <!-- Footer info -->
            <div class="mt-12 text-center">
                <div
                    class="inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm dark:bg-slate-900/80">
                    <svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Más de 500+ proyectos estructurales exitosos
                    </span>
                </div>
            </div>
        </div>
    </main>
@endsection
