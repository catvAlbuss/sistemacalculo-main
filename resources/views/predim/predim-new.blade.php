<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Predimensionamiento Estructural - Rizabal &amp; Asociados</title>

    {{-- Remix Icons --}}
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.min.css" rel="stylesheet" />
    {{-- IBM Plex (fallback si Vite no lo inyecta) --}}
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

    {{-- Predim CSS --}}
    @vite(['resources/css/predim.css'])
</head>

<body>
<div class="predim-container">

    {{-- ═══ RIBBON ═══ --}}
    @include('predim.components.ribbon-topbar')

    {{-- ═══ WORKSPACE ═══ --}}
    <div class="predim-workspace">
        <div class="predim-canvas-area" style="position:relative;">
            <label data-id="{{ url('/assets/pdf/Escalado.pdf') }}" type="hidden"></label>
            <div class="predim-canvas-container">
                <canvas id="canvas" style="display:block; margin:8px auto; background:white;"></canvas>
            </div>
        </div>
    </div>

    {{-- ═══ STATUS BAR ═══ --}}
    <div class="predim-statusbar">
        <div class="predim-status-item">Herramienta: <span id="status-tool">—</span></div>
        <div class="predim-status-item">Escala: <span id="status-escala">1:1</span></div>
        <div class="predim-status-item">F'c: <span id="status-fc">210 kg/cm²</span></div>
        <div class="predim-status-item">N° Pisos: <span id="status-pisos">1</span></div>
        <div style="width:1px; background:var(--rb-group-sep); height:12px; margin:0 6px;"></div>
        <div class="predim-status-item" id="status-cursor">x: 0  y: 0</div>
    </div>

</div>

{{-- ═══ MODAL REPORTES ═══ --}}
<div class="predim-modal" id="myModal">
    <div class="predim-modal-content">
        <div class="predim-modal-header">
            <h2 class="predim-modal-title">Reportes de Predimensionamiento</h2>
            <button class="predim-modal-close" id="closeModalBtn">&times;</button>
        </div>

        {{-- Columna Rectangular --}}
        <div class="predim-table-container" data-file="tabla1-columna_rectangular">
            <h3>Columna Rectangular <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="rectangulo-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>AT</th><th>A Rect.</th><th>Base (b)</th><th>Lado</th></tr></thead><tbody id="Columna_rectangular"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla2-columna_cuadrada">
            <h3>Columna Cuadrada <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="cuadro-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>AT</th><th>A Cuad.</th><th>Lado</th></tr></thead><tbody id="Columna_Cuadrado"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla3-columna_circular">
            <h3>Columna Circular <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="circulo-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>AT</th><th>A Círculo</th><th>Radio</th></tr></thead><tbody id="Columna_Circular"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla4-columna_T">
            <h3>Columna T <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="te-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>AT</th><th>A</th><th>e</th><th>Lado</th></tr></thead><tbody id="Columna_Te"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla5-columna_L">
            <h3>Columna L <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="le-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>AT</th><th>A</th><th>e</th><th>Lado</th></tr></thead><tbody id="Columna_Le"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla6-vigas_principal">
            <h3>Vigas Principal <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="vigas-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>Luz (L)</th><th>Base (b)</th><th>Altura (h)</th></tr></thead><tbody id="vigas_principal"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla7-vigas_secundaria">
            <h3>Vigas Secundaria <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="vigasSeg-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>Luz (L)</th><th>Base (b)</th><th>Altura (h)</th></tr></thead><tbody id="vigas_Segundaria"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla8-vigas_cimentacion">
            <h3>Vigas Cimentación <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="vigasCimentacion-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>Luz (L)</th><th>Base (b)</th><th>Altura (h)</th></tr></thead><tbody id="vigas_Cimntacion"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla9-vigas_sobre_vigas">
            <h3>Vigas Sobre Vigas <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="vigasSSvigas-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>Luz (L)</th><th>Base (b)</th><th>Altura (h)</th></tr></thead><tbody id="vigas_sobrevigas"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla10-vigas_borde">
            <h3>Vigas de Borde <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="vigasbordes-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>Luz (L)</th><th>Base (b)</th><th>Altura (h)</th></tr></thead><tbody id="vigas_borde"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla11-losas_aligeradas_1_dir">
            <h3>Losas Aligerada 1 dir. <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="losas-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>Luz (L)</th><th>Espesor (e)</th></tr></thead><tbody id="losas_Cuadrada"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla12-losas_aligeradas_2_dir">
            <h3>Losas Aligerada 2 dir. <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="losasal2-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>Luz (L)</th><th>Espesor (e)</th></tr></thead><tbody id="losasAl2_Cuadrada"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla13-losas_maciza_1_dir">
            <h3>Losas Maciza 1 dir. <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="losamaciza1-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>Luz (L)</th><th>Espesor (e)</th></tr></thead><tbody id="losasMac1_Cuadrada"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla14-losas_maciza_2_dir">
            <h3>Losas Maciza 2 dir. <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="losamaciza2-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>Luz (L)</th><th>Espesor (e)</th></tr></thead><tbody id="losasMac2_Cuadrada"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla15-zapata_cuadrada">
            <h3>Zapata Cuadrada <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="zapata-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>AT</th><th>AC</th><th>AZ</th></tr></thead><tbody id="zapatas_cuadradas"></tbody></table>
        </div>
        <div class="predim-table-container" data-file="tabla16-placas">
            <h3>Placas <span style="font-size:13px; font-weight:400; color:var(--rb-muted);">Cantidad: <span id="placa-count">0</span></span></h3>
            <table class="predim-table"><thead><tr><th>N°</th><th>Fórmula</th><th>AT</th><th>Perímetro</th><th>Cortante</th><th>Espesor</th><th>Longitud</th></tr></thead><tbody id="placas_rp"></tbody></table>
        </div>

        <div style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
            <button class="predim-tool-btn" id="btn_png_predim" style="background:#15803d; color:#fff; border-color:#15803d;">
                <i class="ri-image-line"></i>
                <span class="predim-tool-btn-label">Exportar PNG</span>
            </button>
            <button class="predim-tool-btn" id="btn_pdf_predim" style="background:var(--rb-accent); color:#fff; border-color:var(--rb-accent);">
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

{{-- Modal script --}}
<script>
    document.getElementById('openModal').onclick  = () => document.getElementById('myModal').classList.add('active');
    document.getElementById('closeModalBtn').onclick = () => document.getElementById('myModal').classList.remove('active');
    document.getElementById('closeModal').onclick  = () => document.getElementById('myModal').classList.remove('active');
    document.getElementById('myModal').onclick = e => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('active'); };

    /* Status bar live update */
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.addEventListener('mousemove', e => {
                const r = canvas.getBoundingClientRect();
                document.getElementById('status-cursor').textContent =
                    'x: ' + Math.round(e.clientX - r.left) + '  y: ' + Math.round(e.clientY - r.top);
            });
        }

        /* Sync status labels when inputs change */
        const fc    = document.getElementById('fc');
        const pisos = document.getElementById('npisos');
        if (fc)    fc.addEventListener('input',    () => document.getElementById('status-fc').textContent    = fc.value    + ' kg/cm²');
        if (pisos) pisos.addEventListener('input', () => document.getElementById('status-pisos').textContent = pisos.value);

        document.querySelectorAll('.tool').forEach(btn => {
            btn.addEventListener('click', function () {
                const lbl = this.querySelector('.predim-tool-btn-label');
                if (lbl) document.getElementById('status-tool').textContent = lbl.textContent.trim();
            });
        });
    });
</script>

{{-- Ribbon adapter + main JS --}}
@vite(['resources/js/predim/ribbon-adapter.js'])
@vite(['resources/js/predim/index.js'])

</body>
</html>