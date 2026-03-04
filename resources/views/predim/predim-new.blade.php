<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Predimensionamiento Estructural - Rizabal & Asociados</title>

    {{-- Remix Icon --}}
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.min.css" rel="stylesheet" />

    {{-- Predim CSS --}}
    @vite(['resources/css/predim.css'])

    <style>
        /* Dark mode variables */
        :root[data-theme="dark"] {
            --predim-bg-main: #1a1a1a;
            --predim-bg-surface: #2d2d2d;
            --predim-bg-hover: #3d3d3d;
            --predim-text-primary: #ffffff;
            --predim-text-secondary: #a0a0a0;
            --predim-border: #404040;
        }

        :root[data-theme="dark"] body {
            background-color: var(--predim-bg-main);
            color: var(--predim-text-primary);
        }

        :root[data-theme="dark"] .predim-ribbon,
        :root[data-theme="dark"] .predim-topbar {
            background-color: var(--predim-bg-surface);
            border-color: var(--predim-border);
        }

        :root[data-theme="dark"] .predim-tool-btn {
            background-color: var(--predim-bg-hover);
            color: var(--predim-text-primary);
        }

        :root[data-theme="dark"] .predim-tool-btn:hover {
            background-color: #4d4d4d;
        }

        :root[data-theme="dark"] .predim-canvas-container {
            background: #1a1a1a !important;
        }
    </style>
</head>

<body>
    {{-- Main Container --}}
    <div class="predim-container">
        {{-- Ribbon Header with Tabs and Tools --}}
        @include('predim.components.ribbon-topbar')

        {{-- Workspace Area --}}
        <div class="predim-workspace">
            {{-- Canvas Area --}}
            <div class="predim-canvas-area" style="position: relative;">
                <label data-id="{{ url('/assets/pdf/Escalado.pdf') }}" type="hidden"></label>
                <div class="predim-canvas-container"
                    style="width: 100%; height: calc(100vh - 180px); overflow: auto; position: relative; background: #e5e7eb;">
                    <canvas id="canvas" style="display: block; margin: 0 auto; background: white;"></canvas>
                </div>
            </div>
        </div>
    </div>

    {{-- Modal for Reports --}}
    <div class="predim-modal" id="myModal">
        <div class="predim-modal-content">
            <div class="predim-modal-header">
                <h2 class="predim-modal-title">Reportes de Predimensionamiento</h2>
                <button class="predim-modal-close" id="closeModalBtn">&times;</button>
            </div>

            {{-- Columna Rectangular --}}
            <div class="predim-table-container">
                <h3>Columna Rectangular <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad:
                        <span id="rectangulo-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Área Tributaria (AT)</th>
                            <th>Área del Rectángulo (A)</th>
                            <th>Base (b)</th>
                            <th>Lado del Rectángulo</th>
                        </tr>
                    </thead>
                    <tbody id="Columna_rectangular"></tbody>
                </table>
            </div>

            {{-- Columna Cuadrada --}}
            <div class="predim-table-container">
                <h3>Columna Cuadrada <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad: <span
                            id="cuadro-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Área Tributaria (AT)</th>
                            <th>Área del Cuadrado (A)</th>
                            <th>Lado del Cuadrado</th>
                        </tr>
                    </thead>
                    <tbody id="Columna_Cuadrado"></tbody>
                </table>
            </div>

            {{-- Columna Circular --}}
            <div class="predim-table-container">
                <h3>Columna Circular <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad: <span
                            id="circulo-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Área Tributaria (AT)</th>
                            <th>Área del Círculo (A)</th>
                            <th>Radio</th>
                        </tr>
                    </thead>
                    <tbody id="Columna_Circular"></tbody>
                </table>
            </div>

            {{-- Columna T --}}
            <div class="predim-table-container">
                <h3>Columna T <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad: <span
                            id="te-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Área Tributaria (AT)</th>
                            <th>Área (A)</th>
                            <th>(e)</th>
                            <th>Lado</th>
                        </tr>
                    </thead>
                    <tbody id="Columna_Te"></tbody>
                </table>
            </div>

            {{-- Columna L --}}
            <div class="predim-table-container">
                <h3>Columna L <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad: <span
                            id="le-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Área Tributaria (AT)</th>
                            <th>Área (A)</th>
                            <th>(e)</th>
                            <th>Lado</th>
                        </tr>
                    </thead>
                    <tbody id="Columna_Le"></tbody>
                </table>
            </div>

            {{-- Vigas Principal --}}
            <div class="predim-table-container">
                <h3>Vigas Principal <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad: <span
                            id="vigas-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Luz (L)</th>
                            <th>Base (b)</th>
                            <th>Altura (h)</th>
                        </tr>
                    </thead>
                    <tbody id="vigas_principal"></tbody>
                </table>
            </div>

            {{-- Vigas Secundaria --}}
            <div class="predim-table-container">
                <h3>Vigas Secundaria <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad: <span
                            id="vigasSeg-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Luz (L)</th>
                            <th>Base (b)</th>
                            <th>Altura (h)</th>
                        </tr>
                    </thead>
                    <tbody id="vigas_Segundaria"></tbody>
                </table>
            </div>

            {{-- Vigas Cimentación --}}
            <div class="predim-table-container">
                <h3>Vigas Cimentación <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad:
                        <span id="vigasCimentacion-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Luz (L)</th>
                            <th>Base (b)</th>
                            <th>Altura (h)</th>
                        </tr>
                    </thead>
                    <tbody id="vigas_Cimntacion"></tbody>
                </table>
            </div>

            {{-- Vigas Sobre Vigas --}}
            <div class="predim-table-container">
                <h3>Vigas Sobre Vigas <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad:
                        <span id="vigasSSvigas-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Luz (L)</th>
                            <th>Base (b)</th>
                            <th>Altura (h)</th>
                        </tr>
                    </thead>
                    <tbody id="vigas_sobrevigas"></tbody>
                </table>
            </div>

            {{-- Vigas de Borde --}}
            <div class="predim-table-container">
                <h3>Vigas de Borde <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad: <span
                            id="vigasbordes-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Luz (L)</th>
                            <th>Base (b)</th>
                            <th>Altura (h)</th>
                        </tr>
                    </thead>
                    <tbody id="vigas_borde"></tbody>
                </table>
            </div>

            {{-- Losas Aligerada 1 dir --}}
            <div class="predim-table-container">
                <h3>Losas Aligerada 1 dir. <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad:
                        <span id="losas-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Luz (L)</th>
                            <th>Espesor (e)</th>
                        </tr>
                    </thead>
                    <tbody id="losas_Cuadrada"></tbody>
                </table>
            </div>

            {{-- Losas Aligerada 2 dir --}}
            <div class="predim-table-container">
                <h3>Losas Aligerada 2 dir. <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad:
                        <span id="losasal2-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Luz (L)</th>
                            <th>Espesor (e)</th>
                        </tr>
                    </thead>
                    <tbody id="losasAl2_Cuadrada"></tbody>
                </table>
            </div>

            {{-- Losas Maciza 1 dir --}}
            <div class="predim-table-container">
                <h3>Losas Maciza 1 dir. <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad:
                        <span id="losamaciza1-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Luz (L)</th>
                            <th>Espesor (e)</th>
                        </tr>
                    </thead>
                    <tbody id="losasMac1_Cuadrada"></tbody>
                </table>
            </div>

            {{-- Losas Maciza 2 dir --}}
            <div class="predim-table-container">
                <h3>Losas Maciza 2 dir. <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad:
                        <span id="losamaciza2-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Luz (L)</th>
                            <th>Espesor (e)</th>
                        </tr>
                    </thead>
                    <tbody id="losasMac2_Cuadrada"></tbody>
                </table>
            </div>

            {{-- Zapata Cuadrada --}}
            <div class="predim-table-container">
                <h3>Cimentación Zapata Cuadrada <span
                        style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad: <span
                            id="zapata-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Área Tributaria (AT)</th>
                            <th>(AC)</th>
                            <th>(AZ)</th>
                        </tr>
                    </thead>
                    <tbody id="zapatas_cuadradas"></tbody>
                </table>
            </div>

            {{-- Placas --}}
            <div class="predim-table-container">
                <h3>Placas <span style="font-size: 14px; font-weight: normal; color: #64748b;">Cantidad: <span
                            id="placa-count">0</span></span></h3>
                <table class="predim-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fórmula</th>
                            <th>Área Total (AT)</th>
                            <th>Perímetro (P)</th>
                            <th>Cortante (V)</th>
                            <th>Espesor</th>
                            <th>Longitud (L)</th>
                        </tr>
                    </thead>
                    <tbody id="placas_rp"></tbody>
                </table>
            </div>

            <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
                <button class="predim-tool-btn" id="btn_pdf_predim"
                    style="background: var(--predim-primary); color: white;">
                    <i class="ri-file-pdf-line"></i>
                    <span class="predim-tool-btn-label">Exportar PDF</span>
                </button>
                <button class="predim-tool-btn" id="closeModal">
                    <i class="ri-close-line"></i>
                    <span class="predim-tool-btn-label">Cerrar</span>
                </button>
            </div>
        </div>
    </div>

    {{-- External Scripts --}}
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/jasonday/printThis/printThis.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/vfs_fonts.js"></script>

    {{-- Modal Control Script --}}
    <script>
        document.getElementById('openModal').onclick = function() {
            document.getElementById('myModal').classList.add('active');
        }

        document.getElementById('closeModalBtn').onclick = function() {
            document.getElementById('myModal').classList.remove('active');
        }

        document.getElementById('closeModal').onclick = function() {
            document.getElementById('myModal').classList.remove('active');
        }

        document.getElementById('myModal').onclick = function(event) {
            if (event.target == document.getElementById('myModal')) {
                document.getElementById('myModal').classList.remove('active');
            }
        }
    </script>

    {{-- Ribbon Adapter Script (loads before main JS) --}}
    @vite(['resources/js/predim/ribbon-adapter.js'])

    {{-- Main Predim JavaScript --}}
    @vite(['resources/js/adm_predim_view.js'])
    {{-- TODO: Change to @vite(['resources/js/predim/index.js']) when refactoring is complete --}}

    <script>
        // Enhanced dark mode toggle with icon change
        document.addEventListener('DOMContentLoaded', function() {
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            const icon = darkModeToggle.querySelector('i');

            // Update icon based on current theme
            function updateIcon() {
                const theme = document.documentElement.getAttribute('data-theme');
                if (theme === 'dark') {
                    icon.className = 'ri-sun-line';
                } else {
                    icon.className = 'ri-moon-line';
                }
            }

            // Initialize icon
            updateIcon();

            // Listen for theme changes
            darkModeToggle.addEventListener('click', function() {
                setTimeout(updateIcon, 100);
            });
        });
    </script>
</body>

</html>
