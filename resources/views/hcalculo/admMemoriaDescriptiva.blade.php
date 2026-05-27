<x-calc-layout title="Memoria Descriptiva">
    <style>
        html { scroll-behavior: smooth; }
        
        /* Estilos sidebar */
        .section-active {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        .section-active .icon-container {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        /* Estilos cards */
        .card-seccion {
            scroll-margin-top: 2rem;
            border-radius: 1.5rem;
            background: white;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01);
            transition: all 0.3s ease;
        }
        .dark .card-seccion {
            background: #1f2937;
        }
        
        /* Tablas dinámicas */
        .tabla-modulo {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
        }
        .tabla-modulo th, .tabla-modulo td {
            border: 1px solid #e5e7eb;
            padding: 0.5rem;
            text-align: left;
        }
        .dark .tabla-modulo th, .dark .tabla-modulo td {
            border-color: #374151;
        }
        .tabla-modulo th {
            background-color: #f3f4f6;
            font-weight: bold;
        }
        .dark .tabla-modulo th {
            background-color: #374151;
        }
        
        /* Botón exportar */
        .btn-exportar {
            background: linear-gradient(135deg, #10b981, #059669);
            transition: all 0.3s ease;
        }
        .btn-exportar:hover {
            transform: scale(1.02);
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
        }
         /* Eliminar padding del contenedor principal */
    .container {
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        max-width: 100% !important;
    }
    
    /* Ajustar el main content */
    .py-2 {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }
    
    /* Sidebar pegado al borde */
    .w-64 {
        margin-left: -0.5rem;
    }
        
        /* Animaciones */
        .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
        .fade-enter-from, .fade-leave-to { opacity: 0; }
    </style>

    <div class="py-2" x-data="memoriaDescriptiva" x-init="initDefaultData()">
        <div class="container mx-auto px-4 max-w-7xl">

          

           <div class="flex gap-6">

    {{-- SIDEBAR --}}
    <div class="w-80 flex-shrink-0">
        <nav class="sticky top-6 flex flex-col gap-1" x-data="{ active: 'portada' }">
            
            {{-- Cabecera --}}
            <div class="mb-4 px-4 py-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Memoria</p>
                        <p class="text-base font-bold text-gray-800 dark:text-gray-200">Descriptiva</p>
                    </div>
                </div>
            </div>

            {{-- Portada --}}
            <a href="#portada" @click="active = 'portada'" 
               :class="active === 'portada' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'" 
               class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3">
                <span class="w-7 text-xl">📄</span>
                <span>Portada</span>
            </a>

            {{-- Generalidades --}}
            <a href="#generalidades" @click="active = 'generalidades'" 
               :class="active === 'generalidades' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'" 
               class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3">
                <span class="w-7 text-xl">📋</span>
                <span>1. Generalidades</span>
            </a>

            {{-- Ubicación --}}
            <a href="#ubicacion" @click="active = 'ubicacion'" 
               :class="active === 'ubicacion' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'" 
               class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3">
                <span class="w-7 text-xl">📍</span>
                <span>2. Ubicación</span>
            </a>

            {{-- Módulos --}}
            <a href="#modulos" @click="active = 'modulos'" 
               :class="active === 'modulos' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'" 
               class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3">
                <span class="w-7 text-xl">🏗️</span>
                <span>3. Módulos</span>
            </a>

            {{-- Marco Teórico --}}
            <a href="#marco-teorico" @click="active = 'marco-teorico'" 
               :class="active === 'marco-teorico' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'" 
               class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3">
                <span class="w-7 text-xl">📚</span>
                <span>4. Marco Teórico</span>
            </a>

            {{-- Predimensionamiento --}}
            <a href="#predimensionamiento" @click="active = 'predimensionamiento'" 
               :class="active === 'predimensionamiento' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'" 
               class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3">
                <span class="w-7 text-xl">📐</span>
                <span>5. Predimensionamiento</span>
            </a>

            {{-- Demolición --}}
            <a href="#demolicion" @click="active = 'demolicion'" 
               :class="active === 'demolicion' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'" 
               class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3">
                <span class="w-7 text-xl">💥</span>
                <span>6. Demolición</span>
            </a>

            {{-- Separador --}}
            <div class="my-3 mx-4 border-t border-gray-200 dark:border-gray-700"></div>

            {{-- Botón Exportar --}}
            <button @click="exportWord()" :disabled="isExporting" 
                class="mx-4 mt-2 py-2.5 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                :class="isExporting ? 'bg-gray-400' : 'bg-green-700 hover:bg-green-800'">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-base" x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
            </button>

            {{-- Resumen Card --}}
            <div class="mt-4 mx-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="font-semibold text-sm text-gray-600 dark:text-gray-400">Resumen</h3>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Módulos:</span>
                    <span class="font-bold" x-text="$store.memoriaDescriptiva?.sections?.descripcionModulos?.modulos?.length || 0"></span>
                </div>
            </div>
        </nav>
    </div>

    {{-- CONTENIDO PRINCIPAL --}}
    <div class="flex-1 space-y-6">

                   {{-- ==================== PORTADA ==================== --}}
                <section id="portada" class="card-seccion p-6">
                 <div class="flex items-center gap-3 mb-4">
                <div class="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600">
                     <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">Portada del Proyecto</h2>
            </div>

    {{-- TÍTULOS --}}
    <div class="space-y-2 mb-6">
        <div>
            <label class="text-xs font-semibold text-gray-500">Título</label>
            <input type="text" x-model="$store.memoriaDescriptiva.cover.title" class="w-full border rounded-lg p-2 text-sm">
        </div>
        <div>
            <label class="text-xs font-semibold text-gray-500">Subtítulo</label>
            <input type="text" x-model="$store.memoriaDescriptiva.cover.subtitle" class="w-full border rounded-lg p-2 text-sm">
        </div>
        <div>
            <label class="text-xs font-semibold text-gray-500">Nombre del Proyecto</label>
            <textarea x-model="$store.memoriaDescriptiva.cover.project" rows="3" class="w-full border rounded-lg p-2 text-sm"></textarea>
        </div>
    </div>

    {{-- IMAGEN (va antes de los datos) --}}
    <div class="mb-6">
        <label class="text-sm font-bold block mb-2">Imagen del Proyecto</label>
        <div class="relative">
            <template x-if="$store.memoriaDescriptiva.previews.coverImage">
                <div class="relative inline-block">
                    <img :src="$store.memoriaDescriptiva.previews.coverImage" class="max-h-48 object-contain border rounded-lg">
                    <button @click="$store.memoriaDescriptiva.removeImage('coverImage')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                </div>
            </template>
            <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50" x-show="!$store.memoriaDescriptiva.previews.coverImage">
                <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span class="text-xs text-gray-500">Click para subir imagen</span>
                <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('coverImage', $event)" class="hidden">
            </label>
        </div>
    </div>

    {{-- DATOS INSTITUCIONALES (debajo de la imagen, alineados) --}}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div><label class="text-xs font-semibold text-gray-500">UEI (Unidad Ejecutora)</label><input type="text" x-model="$store.memoriaDescriptiva.cover.uei" class="w-full border rounded-lg p-2 text-sm"></div>
        <div><label class="text-xs font-semibold text-gray-500">Código Unificado</label><input type="text" x-model="$store.memoriaDescriptiva.cover.unifiedCode" class="w-full border rounded-lg p-2 text-sm"></div>
        <div><label class="text-xs font-semibold text-gray-500">Nombre de la IE</label><input type="text" x-model="$store.memoriaDescriptiva.cover.ieName" class="w-full border rounded-lg p-2 text-sm"></div>
        <div><label class="text-xs font-semibold text-gray-500">Código de Local</label><input type="text" x-model="$store.memoriaDescriptiva.cover.localCode" class="w-full border rounded-lg p-2 text-sm"></div>
        <div><label class="text-xs font-semibold text-gray-500">Códigos Modulares</label><input type="text" x-model="$store.memoriaDescriptiva.cover.modularCodes" class="w-full border rounded-lg p-2 text-sm"></div>
        <div><label class="text-xs font-semibold text-gray-500">Región</label><input type="text" x-model="$store.memoriaDescriptiva.cover.region" class="w-full border rounded-lg p-2 text-sm"></div>
        <div><label class="text-xs font-semibold text-gray-500">Provincia</label><input type="text" x-model="$store.memoriaDescriptiva.cover.province" class="w-full border rounded-lg p-2 text-sm"></div>
        <div><label class="text-xs font-semibold text-gray-500">Distrito</label><input type="text" x-model="$store.memoriaDescriptiva.cover.district" class="w-full border rounded-lg p-2 text-sm"></div>
        <div><label class="text-xs font-semibold text-gray-500">Centro Poblado</label><input type="text" x-model="$store.memoriaDescriptiva.cover.centerTown" class="w-full border rounded-lg p-2 text-sm"></div>
    </div>
</section>

{{-- ==================== 1. GENERALIDADES ==================== --}}
<section id="generalidades" class="card-seccion p-6">
    <h2 class="text-xl font-bold mb-4 text-green-600">1. GENERALIDADES</h2>
    
    {{-- 1.1 ANTECEDENTES - TEXTO ÚNICO --}}
    <div class="mb-6">
        <h3 class="text-lg font-bold mb-2 border-l-4 border-green-500 pl-3">1.1. ANTECEDENTES</h3>
        <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.antecedentes.textoCompleto" 
                  rows="12" class="w-full border rounded-lg p-3 text-sm"></textarea>
    </div>

      {{-- VÍAS DE ACCESO (TEXTO + TABLA EDITABLE) --}}
    <div class="mb-6">
        <h4 class="font-bold text-md mb-2">VÍAS DE ACCESO</h4>  
        {{-- Tabla editable --}}
        <table class="w-full border-collapse border border-gray-300 text-sm">
            <thead><tr class="bg-gray-100"><th class="border p-2">TRAMO</th><th class="border p-2">DISTANCIA (km)</th><th class="border p-2">TIEMPO</th><th class="border p-2">CARRETERA</th></tr></thead>
            <tbody>
                <tr><td class="border p-2">Lima-Huánuco</td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.limaHuanuco.distancia" class="w-24 border rounded p-1"></td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.limaHuanuco.tiempo" class="w-24 border rounded p-1"></td><td class="border p-2">Asfaltada</td></tr>
                <tr><td class="border p-2">Huánuco – Tingo María</td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.huanucoTingo.distancia" class="w-24 border rounded p-1"></td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.huanucoTingo.tiempo" class="w-24 border rounded p-1"></td><td class="border p-2">Asfaltada</td></tr>
                <tr><td class="border p-2">Tingo María-Pucallpa</td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.tingoPucallpa.distancia" class="w-24 border rounded p-1"></td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.tingoPucallpa.tiempo" class="w-24 border rounded p-1"></td><td class="border p-2">Asfaltada</td></tr>
                <tr><td class="border p-2">Pucallpa-Contamana</td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.pucallpaContamana.distancia" class="w-24 border rounded p-1"></td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.pucallpaContamana.tiempo" class="w-24 border rounded p-1"></td><td class="border p-2">Rápido (Barco)</td></tr>
                <tr class="bg-gray-50"><td class="border p-2 font-bold">Total</td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.total.distancia" class="w-24 border rounded p-1 font-bold"></td><td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.total.tiempo" class="w-24 border rounded p-1 font-bold"></td><td class="border p-2"></td></tr>
            </tbody>
        </table>
    </div>

    {{-- DEMANDA INICIAL y DEMANDA PRIMARIA (2 imágenes lado a lado) --}}
<div class="grid grid-cols-2 gap-4 mb-6">
    {{-- DEMANDA INICIAL --}}
    <div>
        <h4 class="font-bold text-md mb-2">DEMANDA INICIAL</h4>
        <div class="relative">
            <template x-if="$store.memoriaDescriptiva.previews.demandaInicialImage">
                <div class="relative">
                    <img :src="$store.memoriaDescriptiva.previews.demandaInicialImage" class="w-full h-auto object-contain border rounded">
                    <button @click="$store.memoriaDescriptiva.removeImage('demandaInicialImage')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                </div>
            </template>
            <label class="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50" x-show="!$store.memoriaDescriptiva.previews.demandaInicialImage">
                <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span class="text-xs text-gray-500">Subir imagen</span>
                <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('demandaInicialImage', $event)" class="hidden">
            </label>
        </div>
        <p class="text-xs text-gray-400 mt-1 text-center">Cuadro 1: Demanda de Inicial Ciclo II</p>
    </div>

    {{-- DEMANDA PRIMARIA --}}
    <div>
        <h4 class="font-bold text-md mb-2">DEMANDA PRIMARIA</h4>
        <div class="relative">
            <template x-if="$store.memoriaDescriptiva.previews.demandaPrimariaImage">
                <div class="relative">
                    <img :src="$store.memoriaDescriptiva.previews.demandaPrimariaImage" class="w-full h-auto object-contain border rounded">
                    <button @click="$store.memoriaDescriptiva.removeImage('demandaPrimariaImage')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                </div>
            </template>
            <label class="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50" x-show="!$store.memoriaDescriptiva.previews.demandaPrimariaImage">
                <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span class="text-xs text-gray-500">Subir imagen</span>
                <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('demandaPrimariaImage', $event)" class="hidden">
            </label>
        </div>
        <p class="text-xs text-gray-400 mt-1 text-center">Cuadro 2: Demanda de Primaria</p>
    </div>
</div>


  {{-- ==================== 1.2. DATOS DEL PROYECTO ==================== --}}
<div class="mt-8 pt-4 border-t">
    <h3 class="text-lg font-bold mb-3 border-l-4 border-green-500 pl-3">1.2. DATOS DEL PROYECTO</h3>
    
    {{-- Nombre del Proyecto (se jala de la portada) --}}
    <div class="mb-4">
        <label class="font-semibold text-sm block mb-1">Nombre del Proyecto</label>
        <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm" x-text="$store.memoriaDescriptiva.cover.project"></div>
    </div>

    {{-- Nombre de la UEI --}}
    <div class="mb-4">
        <label class="font-semibold text-sm block mb-1">Nombre de la UEI</label>
        <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.uei" 
               class="w-full border rounded-lg p-2 text-sm">
    </div>

    {{-- Ubicación --}}
    <h4 class="font-bold text-md mb-2 mt-4">Ubicación</h4>
    
    {{-- Ubicación Política --}}
    <div class="mb-4">
        <label class="font-semibold text-sm block mb-2">Ubicación Política</label>
        <div class="grid grid-cols-2 gap-3">
            <div><span class="text-sm font-medium">Localidad:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.localidad" class="w-full border rounded p-1 text-sm mt-1"></div>
            <div><span class="text-sm font-medium">Distrito:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.distrito" class="w-full border rounded p-1 text-sm mt-1"></div>
            <div><span class="text-sm font-medium">Provincia:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.provincia" class="w-full border rounded p-1 text-sm mt-1"></div>
            <div><span class="text-sm font-medium">Región:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.region" class="w-full border rounded p-1 text-sm mt-1"></div>
        </div>
    </div>

    {{-- Ubicación Geográfica (UTM) --}}
    <div class="mb-4">
        <label class="font-semibold text-sm block mb-2">Ubicación Geográfica (UTM)</label>
        <div class="grid grid-cols-3 gap-3">
            <div><span class="text-sm font-medium">Este:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.este" class="w-full border rounded p-1 text-sm mt-1"></div>
            <div><span class="text-sm font-medium">Norte:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.norte" class="w-full border rounded p-1 text-sm mt-1"></div>
            <div><span class="text-sm font-medium">Altitud (msnm):</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.altitud" class="w-full border rounded p-1 text-sm mt-1"></div>
        </div>
    </div>

    {{-- Ubicación contextual (Colindancias) --}}
    <div class="mb-4">
        <label class="font-semibold text-sm block mb-2">Ubicación contextual (Colindancias)</label>
        <div class="grid grid-cols-2 gap-3">
            <div><span class="text-sm font-medium">Norte:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.colindanciaNorte" class="w-full border rounded p-1 text-sm mt-1"></div>
            <div><span class="text-sm font-medium">Sur:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.colindanciaSur" class="w-full border rounded p-1 text-sm mt-1"></div>
            <div><span class="text-sm font-medium">Este:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.colindanciaEste" class="w-full border rounded p-1 text-sm mt-1"></div>
            <div><span class="text-sm font-medium">Oeste:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.colindanciaOeste" class="w-full border rounded p-1 text-sm mt-1"></div>
        </div>
    </div>

    {{-- Plano de Ubicación (Figura 1) --}}
    <div class="mt-4">
        <label class="text-sm font-semibold block mb-2">Plano de Ubicación (Figura 1)</label>
        <div class="grid grid-cols-2 gap-4">
            <div class="relative">
                <template x-if="$store.memoriaDescriptiva.previews.ubicacionImage1">
                    <div class="relative">
                        <img :src="$store.memoriaDescriptiva.previews.ubicacionImage1" class="w-full h-auto object-contain border rounded">
                        <button @click="$store.memoriaDescriptiva.removeImage('ubicacionImage1')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                    </div>
                </template>
                <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer" x-show="!$store.memoriaDescriptiva.previews.ubicacionImage1">
                    <span class="text-xs">Subir Figura 1 - Ubicación</span>
                    <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('ubicacionImage1', $event)" class="hidden">
                </label>
            </div>
            <div class="relative">
                <template x-if="$store.memoriaDescriptiva.previews.ubicacionImage2">
                    <div class="relative">
                        <img :src="$store.memoriaDescriptiva.previews.ubicacionImage2" class="w-full h-auto object-contain border rounded">
                        <button @click="$store.memoriaDescriptiva.removeImage('ubicacionImage2')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                    </div>
                </template>
                <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer" x-show="!$store.memoriaDescriptiva.previews.ubicacionImage2">
                    <span class="text-xs">Subir Plano de Ubicación</span>
                    <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('ubicacionImage2', $event)" class="hidden">
                </label>
            </div>
        </div>
    </div>
</div>
</section>
                   

                    {{-- ==================== 2. UBICACIÓN ==================== --}}
                    <section id="ubicacion" class="card-seccion p-6">
                        <h2 class="text-xl font-bold mb-4 text-blue-600">2. UBICACIÓN</h2>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div><label class="font-semibold text-sm">Departamento</label><input type="text" x-model="$store.memoriaDescriptiva.cover.ubigeo.department" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="font-semibold text-sm">Provincia</label><input type="text" x-model="$store.memoriaDescriptiva.cover.ubigeo.province" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="font-semibold text-sm">Distrito</label><input type="text" x-model="$store.memoriaDescriptiva.cover.ubigeo.district" class="w-full border rounded-lg p-2 text-sm"></div>
                        </div>

                        <div class="grid grid-cols-4 gap-3 mb-4">
                            <div><label class="text-xs font-semibold">Este (X)</label><input type="text" x-model="$store.memoriaDescriptiva.cover.este" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="text-xs font-semibold">Norte (Y)</label><input type="text" x-model="$store.memoriaDescriptiva.cover.norte" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="text-xs font-semibold">Altitud</label><input type="text" x-model="$store.memoriaDescriptiva.cover.altitud" class="w-full border rounded-lg p-2 text-sm"></div>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div><label class="text-xs font-semibold">Colindancia Norte</label><input type="text" x-model="$store.memoriaDescriptiva.cover.colindanciaNorte" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="text-xs font-semibold">Colindancia Sur</label><input type="text" x-model="$store.memoriaDescriptiva.cover.colindanciaSur" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="text-xs font-semibold">Colindancia Este</label><input type="text" x-model="$store.memoriaDescriptiva.cover.colindanciaEste" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="text-xs font-semibold">Colindancia Oeste</label><input type="text" x-model="$store.memoriaDescriptiva.cover.colindanciaOeste" class="w-full border rounded-lg p-2 text-sm"></div>
                        </div>

                        <div class="mt-4">
                            <label class="text-sm font-semibold">Plano de Ubicación</label>
                            <div class="relative mt-2">
                                <template x-if="$store.memoriaDescriptiva.previews.ubicacionImage">
                                    <div><img :src="$store.memoriaDescriptiva.previews.ubicacionImage" class="max-h-40"><button @click="$store.memoriaDescriptiva.removeImage('ubicacionImage')" class="text-red-500 text-xs">Eliminar</button></div>
                                </template>
                                <label class="flex items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer" x-show="!$store.memoriaDescriptiva.previews.ubicacionImage">
                                    <span class="text-xs">Subir plano</span>
                                    <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('ubicacionImage', $event)" class="hidden">
                                </label>
                            </div>
                        </div>
                    </section>

                    {{-- ==================== 3. MÓDULOS ==================== --}}
                    <section id="modulos" class="card-seccion p-6">
                        <h2 class="text-xl font-bold mb-4 text-purple-600">3. DESCRIPCIÓN DE MÓDULOS</h2>
                        
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-sm text-gray-500">Total módulos: <span x-text="$store.memoriaDescriptiva.sections.descripcionModulos.modulos.length"></span></span>
                            <button @click="addModulo()" class="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm">+ Agregar Módulo</button>
                        </div>

                        <template x-for="(modulo, idx) in $store.memoriaDescriptiva.sections.descripcionModulos.modulos" :key="idx">
                            <div class="border rounded-lg p-4 mb-4">
                                <div class="flex justify-between items-center mb-3">
                                    <input type="text" x-model="modulo.nombre" class="font-bold border-b-2 border-purple-300 w-40 text-sm">
                                    <button @click="removeModulo(idx)" class="text-red-500 text-xs">Eliminar</button>
                                </div>
                                <div class="grid grid-cols-2 gap-3 text-sm">
                                    <div><label class="text-xs font-semibold">Uso</label><input type="text" x-model="modulo.uso" class="w-full border rounded p-1"></div>
                                    <div><label class="text-xs font-semibold"># Pisos</label><input type="number" x-model="modulo.pisos" class="w-full border rounded p-1"></div>
                                    <div><label class="text-xs font-semibold">Sistema X</label><input type="text" x-model="modulo.sistemaX" class="w-full border rounded p-1"></div>
                                    <div><label class="text-xs font-semibold">Sistema Y</label><input type="text" x-model="modulo.sistemaY" class="w-full border rounded p-1"></div>
                                    <div class="col-span-2"><label class="text-xs font-semibold">Elementos Verticales</label><input type="text" x-model="modulo.elementosVerticales" class="w-full border rounded p-1"></div>
                                    <div class="col-span-2"><label class="text-xs font-semibold">Elementos Horizontales</label><input type="text" x-model="modulo.elementosHorizontales" class="w-full border rounded p-1"></div>
                                    <div class="col-span-2"><label class="text-xs font-semibold">Techo</label><input type="text" x-model="modulo.techo" class="w-full border rounded p-1"></div>
                                </div>
                            </div>
                        </template>
                        
                        <div x-show="$store.memoriaDescriptiva.sections.descripcionModulos.modulos.length === 0" class="text-center py-8 text-gray-400">No hay módulos. Click en "Agregar Módulo"</div>
                    </section>

                    {{-- ==================== 4. MARCO TEÓRICO ==================== --}}
                    <section id="marco-teorico" class="card-seccion p-6">
                        <h2 class="text-xl font-bold mb-4 text-amber-600">4. MARCO TEÓRICO</h2>
                        
                        <div class="space-y-4">
                            <div><label class="font-semibold text-sm">Conceptos Básicos</label><textarea x-model="$store.memoriaDescriptiva.sections.marcoTeorico.conceptosBasicos" rows="4" class="w-full border rounded-lg p-2 text-sm"></textarea></div>
                            <div><label class="font-semibold text-sm">Software Utilizado</label><input type="text" x-model="$store.memoriaDescriptiva.sections.marcoTeorico.software" class="w-full border rounded-lg p-2 text-sm"></div>
                            
                            <div class="grid grid-cols-3 gap-3">
                                <div><label class="text-xs font-semibold">Zona</label><input type="text" x-model="$store.memoriaDescriptiva.sections.marcoTeorico.parametrosSismicos.zona" class="w-full border rounded p-1 text-sm"></div>
                                <div><label class="text-xs font-semibold">Factor Z</label><input type="text" x-model="$store.memoriaDescriptiva.sections.marcoTeorico.parametrosSismicos.factorZ" class="w-full border rounded p-1 text-sm"></div>
                                <div><label class="text-xs font-semibold">Perfil Suelo</label><input type="text" x-model="$store.memoriaDescriptiva.sections.marcoTeorico.parametrosSismicos.perfilSuelo" class="w-full border rounded p-1 text-sm"></div>
                                <div><label class="text-xs font-semibold">Factor S</label><input type="text" x-model="$store.memoriaDescriptiva.sections.marcoTeorico.parametrosSismicos.factorS" class="w-full border rounded p-1 text-sm"></div>
                                <div><label class="text-xs font-semibold">Tp (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.marcoTeorico.parametrosSismicos.tp" class="w-full border rounded p-1 text-sm"></div>
                                <div><label class="text-xs font-semibold">Tl (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.marcoTeorico.parametrosSismicos.tl" class="w-full border rounded p-1 text-sm"></div>
                                <div><label class="text-xs font-semibold">Categoría</label><input type="text" x-model="$store.memoriaDescriptiva.sections.marcoTeorico.parametrosSismicos.categoria" class="w-full border rounded p-1 text-sm"></div>
                                <div><label class="text-xs font-semibold">Factor U</label><input type="text" x-model="$store.memoriaDescriptiva.sections.marcoTeorico.parametrosSismicos.factorU" class="w-full border rounded p-1 text-sm"></div>
                            </div>
                        </div>
                    </section>

                    {{-- ==================== 5. PREDIMENSIONAMIENTO ==================== --}}
                    <section id="predimensionamiento" class="card-seccion p-6">
                        <h2 class="text-xl font-bold mb-4 text-cyan-600">5. PREDIMENSIONAMIENTO</h2>
                        <p class="text-gray-500 text-sm mb-4">Se definen las dimensiones preliminares de los elementos estructurales.</p>
                        
                        <div class="space-y-4">
                            <div><label class="font-semibold text-sm">Losa Aligerada (e=20cm)</label><input type="text" placeholder="Dimensiones típicas" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="font-semibold text-sm">Vigas (b x h)</label><input type="text" placeholder="Ej: 25x45 cm" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="font-semibold text-sm">Columnas</label><input type="text" placeholder="Ej: 25x25 cm, 25x45 cm" class="w-full border rounded-lg p-2 text-sm"></div>
                            <div><label class="font-semibold text-sm">Placas</label><input type="text" placeholder="Ej: e=25 cm" class="w-full border rounded-lg p-2 text-sm"></div>
                        </div>
                    </section>

                    {{-- ==================== 6. DEMOLICIÓN ==================== --}}
                    <section id="demolicion" class="card-seccion p-6">
                        <h2 class="text-xl font-bold mb-4 text-red-600">6. ALCANCE DE DEMOLICIÓN</h2>
                        
                        <div><label class="font-semibold text-sm">Descripción General</label><textarea x-model="$store.memoriaDescriptiva.sections.demolicion.alcance" rows="4" class="w-full border rounded-lg p-3 mt-1 text-sm"></textarea></div>
                        
                        <div class="mt-4">
                            <label class="font-semibold text-sm">Módulos a Demoler</label>
                            <div x-data="{ items: $store.memoriaDescriptiva.sections.demolicion.modulosADemoler }">
                                <template x-for="(item, idx) in items" :key="idx">
                                    <div class="flex gap-2 mt-2"><input type="text" x-model="items[idx]" class="flex-1 border rounded p-2 text-sm"><button @click="items.splice(idx,1)" class="text-red-500">✕</button></div>
                                </template>
                                <button @click="items.push('')" class="text-green-600 text-sm mt-2">+ Agregar</button>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    </div>

    <div x-show="showErrorModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" x-cloak>
        <div class="bg-white rounded-2xl p-6 max-w-md"><h3 class="text-xl font-bold text-red-600 mb-4">Errores</h3><ul class="list-disc pl-5 mb-6"><template x-for="error in validationErrors"><li class="text-red-500" x-text="error.message"></li></template></ul><button @click="closeErrorModal()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">Cerrar</button></div>
    </div>

    @pushOnce('initscripts')
        <script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        @vite('resources/js/documentos/memoria_descriptiva/index-refactored-md.js')
    @endPushOnce

</x-calc-layout>