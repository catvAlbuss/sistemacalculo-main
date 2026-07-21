{{-- resources/views/components/cad/menu-bar.blade.php — contenedor delgado: cada menú vive en cad/menu/<slug>.blade.php (Fase 1 reestructuración) --}}
<div class="cad-bg cad-border border-b shadow-lg">

    <div class="flex items-center px-2 py-1 gap-4 border-t border-gray-700">
        {{-- ============================================================
                                LOGO Y VERSIÓN
        ============================================================ --}}
        <div class="cad-text-logo-color font-bold text-sm px-2 whitespace-nowrap border-r border-gray-600">
           ANALISIS ESTRUCTURAL
        </div>


        {{-- Archivo --}}
        @include('components.cad.menu.file')

        {{-- Editar --}}
        @include('components.cad.menu.edit')

        {{-- Vista --}}
        @include('components.cad.menu.view')

        {{-- Define --}}
        @include('components.cad.menu.define')

        {{-- Dibujar --}}
        @include('components.cad.menu.draw')

        {{-- Seleccionar --}}
        @include('components.cad.menu.select')

        {{-- Asignar --}}
        @include('components.cad.menu.assign')

        {{-- Analizar --}}
        @include('components.cad.menu.analyze')

        {{-- Mostrar --}}
        @include('components.cad.menu.display')

        {{-- Diseñar --}}
        @include('components.cad.menu.design')

        {{-- Opciones --}}
        @include('components.cad.menu.options')

    </div>
</div>

<style>
    /*
    |--------------------------------------------------------------------------
    | ESTILO GENERAL DEL MENÚ SUPERIOR CAD / ETABS
    |--------------------------------------------------------------------------
    */

    .cad-menu-panel {
        width: max-content;
        min-width: 320px;
        max-width: none !important;
        max-height: none !important;
        overflow: visible !important;
    }

    /*
    |--------------------------------------------------------------------------
    | Fuerza al contenedor padre del dropdown a no crear scroll interno
    |--------------------------------------------------------------------------
    */
    div.absolute:has(.cad-menu-panel),
    div[x-show]:has(.cad-menu-panel),
    div:has(> .cad-menu-panel) {
        max-height: none !important;
        overflow: visible !important;
    }

    /*
    |--------------------------------------------------------------------------
    | Encabezados internos
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .px-3.py-1.text-xs.font-semibold.text-blue-400.uppercase.bg-gray-800 {
        font-weight: 600;
        color: #60a5fa;
        background-color: #1f2937;
    }

    /*
    |--------------------------------------------------------------------------
    | Botones del menú
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .dropdown-item {
        width: 100%;
        display: flex !important;
        align-items: center;
        gap: 8px;
        overflow: visible !important;
        white-space: nowrap;
    }

    .cad-menu-panel .dropdown-item:hover {
        background-color: #374151;
    }

    /*
    |--------------------------------------------------------------------------
    | Íconos
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .dropdown-item>span:first-child {
        width: 24px;
        min-width: 24px;
        flex-shrink: 0;
        text-align: center;
    }

    /*
    |--------------------------------------------------------------------------
    | Textos con truncate
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .truncate {
        min-width: 0;
    }

    /*
    |--------------------------------------------------------------------------
    | Submenús laterales
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .submenu {
        position: relative;
    }

    .cad-menu-panel .submenu-panel {
        display: none;
        position: absolute;
        top: 0;
        left: 100%;
        min-width: 280px;
        width: max-content;
        max-width: none !important;
        max-height: none !important;
        overflow: visible !important;
        background-color: #1f2937;
        border: 1px solid #374151;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        z-index: 99999;
        padding-top: 4px;
        padding-bottom: 4px;
    }

    .cad-menu-panel .submenu:hover>.submenu-panel {
        display: block;
    }
</style>