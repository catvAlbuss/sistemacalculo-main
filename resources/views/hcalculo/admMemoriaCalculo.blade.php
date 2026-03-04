<x-calc-layout title="">
    {{-- Estilos globales --}}
    @include('hcalculo.memoria_calculo.partials.styles')

    <div class="py-2" x-data="memoriaCalculo">
        <div class="container mx-auto px-2 max-w-full">

            {{-- Cabecera de página --}}
            @include('hcalculo.memoria_calculo.partials.page-header')

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {{-- Sidebar de navegación --}}
                <div class="lg:col-span-3 space-y-4">
                    @include('hcalculo.memoria_calculo.partials.sidebar-nav')
                </div>

                {{-- Contenido principal: Secciones --}}
                <div class="lg:col-span-9 space-y-4">
                    @include('hcalculo.memoria_calculo.sections.informacion-general')
                    @include('hcalculo.memoria_calculo.sections.ubicacion')
                    @include('hcalculo.memoria_calculo.sections.parametros-sismicos')
                    @include('hcalculo.memoria_calculo.sections.tabla-resumen')
                    @include('hcalculo.memoria_calculo.sections.material-diseno')
                    @include('hcalculo.memoria_calculo.sections.analisis-cargas')
                    @include('hcalculo.memoria_calculo.sections.analisis-sismico')
                    @include('hcalculo.memoria_calculo.sections.diseno-elementos')
                </div>
            </div>

            {{-- Botón de exportación --}}
            @include('hcalculo.memoria_calculo.partials.export-button')
        </div>
    </div>

    {{-- Scripts --}}
    @pushOnce('initscripts')
        <script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        @vite('resources/js/memoria_calculo/index-refactored.js')
    @endPushOnce

</x-calc-layout>
