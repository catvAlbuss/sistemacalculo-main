<x-sheets.workbench legacy art="retaining-wall" class="retaining-wall-sheet" data-analysis-sheet sheet="muros-contencion-v2" title="Diseño de muros de contención V2"
  eyebrow="Herramientas de ingeniería / Concreto armado"
  description="Diseño de muros de contención con presiones de servicio, resistencia última y presión sísmica, verificaciones de estabilidad y memoria de cálculo.">
    @pushOnce('styles')
        <link href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
            integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
            crossorigin="anonymous" referrerpolicy="no-referrer" />
    @endpushOnce

    @pushOnce('initscripts')
        @vite('resources/js/muros-contencion/init.js')
    @endpushOnce



    <div id="app" x-data="mainSystem" x-cloak>
        @include('muros-contencion.components.workflow-tabs')

        <!-- Main Content -->
        <main class="p-2">
            @include('muros-contencion.components.sections.predimensionamiento')
            @include('muros-contencion.components.sections.dimensionamiento')
            @include('muros-contencion.components.sections.cargas')
            @include('muros-contencion.components.sections.verificaciones')
            @include('muros-contencion.components.sections.analisis-estructural')
            @include('muros-contencion.components.sections.diseno-estructural')
            @include('muros-contencion.components.sections.planos')
            @include('muros-contencion.components.sections.metrado')
            @include('muros-contencion.components.sections.memoria-calculo')
        </main>


    </div>



    @pushOnce('scripts')
        <script src="https://unpkg.com/konva@9/konva.min.js"></script>
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    @endpushOnce

</x-sheets.workbench>
