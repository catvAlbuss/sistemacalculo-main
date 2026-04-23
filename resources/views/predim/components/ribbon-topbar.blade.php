{{-- Ribbon Topbar Compacto — Predim v2 --}}
<div class="predim-ribbon">

    {{-- TOP BAR --}}
    <div class="predim-topbar">
        <a href="{{ route('landing.home') }}">
            <img class="predim-logo" src="{{ Vite::asset('resources/img/logo_rizabalAsociados.png') }}" alt="Logo">
        </a>
        <span class="predim-title">Rizabal &amp; Asociados &mdash; Predimensionamiento Estructural</span>
        <button id="dark-mode-toggle" title="Cambiar Tema">
            <i class="ri-moon-line"></i>
        </button>
    </div>

    {{-- TABS --}}
    <div class="predim-ribbon-tabs">
        <button class="predim-ribbon-tab active" data-tab="archivo">Archivo</button>
        <button class="predim-ribbon-tab" data-tab="columnas">Columnas</button>
        <button class="predim-ribbon-tab" data-tab="vigas">Vigas</button>
        <button class="predim-ribbon-tab" data-tab="losas">Losas</button>
        <button class="predim-ribbon-tab" data-tab="cimentacion">Cimentaci&oacute;n</button>
        <button class="predim-ribbon-tab" data-tab="herramientas">Herramientas</button>
    </div>

    {{-- ═══════════ ARCHIVO ═══════════ --}}
    <div class="predim-ribbon-content active" data-tab-content="archivo">

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Archivo</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn" title="Nuevo">
                    <i class="ri-file-add-line"></i>
                    <span class="predim-tool-btn-label">Nuevo</span>
                </button>
                <button class="predim-tool-btn" title="Guardar">
                    <i class="ri-save-line"></i>
                    <span class="predim-tool-btn-label">Guardar</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">PDF</div>
            <div class="predim-ribbon-group-tools">
                <label for="upload-pdf" class="predim-tool-btn" title="Cargar PDF" style="cursor:pointer;">
                    <i class="ri-upload-cloud-line"></i>
                    <span class="predim-tool-btn-label">Cargar PDF</span>
                </label>
                <input id="upload-pdf" type="file" accept=".pdf" style="display:none">
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Exportar</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn" id="openModal" title="Reportes">
                    <i class="ri-file-list-3-line"></i>
                    <span class="predim-tool-btn-label">Reportes</span>
                </button>
                <button class="predim-tool-btn" id="imprimir_doc" title="Imprimir">
                    <i class="ri-printer-line"></i>
                    <span class="predim-tool-btn-label">Imprimir</span>
                </button>
                <button class="predim-tool-btn" id="btnCanvasPNG" title="Exportar PNG">
                    <i class="ri-image-line"></i>
                    <span class="predim-tool-btn-label">PNG</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Escala</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="lineaEscala" title="L&iacute;nea de Escala">
                    <i class="ri-ruler-line"></i>
                    <span class="predim-tool-btn-label">L&iacute;nea Escala</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Valores</div>
            <div class="predim-ribbon-group-tools gap-2" style="align-items:flex-end;">
                <div class="predim-input-group">
                    <label for="escalaVal">Medido</label>
                    <input id="escalaVal" type="number" value="1" min="1">
                </div>
                <div class="predim-input-group">
                    <label for="escalaplano">Plano</label>
                    <input id="escalaplano" type="number" value="1" min="1">
                </div>
                <button class="predim-tool-btn" id="calc" style="align-self:flex-end; height:22px; min-width:28px;" title="Calcular">
                    <i class="ri-calculator-line" style="font-size:12px;"></i>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Brillo</div>
            <div class="predim-ribbon-group-tools" style="align-items:center; padding:0 4px;">
                <input id="brightnessRange" type="range" value="1" min="0" max="4" step="0.1" style="width:90px; accent-color:var(--rb-accent);">
            </div>
        </div>

    </div>

    {{-- ═══════════ COLUMNAS ═══════════ --}}
    <div class="predim-ribbon-content" data-tab-content="columnas">

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Tipos de Columnas</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="rectangle" title="Columna Rectangular">
                    <i class="ri-rectangle-line"></i>
                    <span class="predim-tool-btn-label">Rectangular</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="cuadrado" title="Columna Cuadrada">
                    <i class="ri-square-line"></i>
                    <span class="predim-tool-btn-label">Cuadrada</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="circulo" title="Columna Circular">
                    <i class="ri-circle-line"></i>
                    <span class="predim-tool-btn-label">Circular</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="te" title="Columna T">
                    <i class="ri-t-box-line"></i>
                    <span class="predim-tool-btn-label">Columna T</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="ele" title="Columna L">
                    <i class="ri-ruler-2-line"></i>
                    <span class="predim-tool-btn-label">Columna L</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Par&aacute;metros</div>
            <div class="predim-ribbon-group-tools gap-2" style="align-items:flex-end;">
                <div class="predim-input-group">
                    <label for="npisos">N&deg; Pisos</label>
                    <input id="npisos" type="number" value="1" min="1" style="width:46px">
                </div>
                <div class="predim-input-group">
                    <label for="fc">F'c (kg/cm&sup2;)</label>
                    <input id="fc" type="number" value="210" style="width:56px">
                </div>
            </div>
        </div>

    </div>

    {{-- ═══════════ VIGAS ═══════════ --}}
    <div class="predim-ribbon-content" data-tab-content="vigas">

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Tipos de Vigas</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="cuadradovigas" title="Viga Principal">
                    <i class="ri-layout-line"></i>
                    <span class="predim-tool-btn-label">Principal</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="cuadradovigasse" title="Viga Secundaria">
                    <i class="ri-layout-2-line"></i>
                    <span class="predim-tool-btn-label">Secundaria</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="cuadradovigascimentacion" title="Viga Cimentaci&oacute;n">
                    <i class="ri-layout-3-line"></i>
                    <span class="predim-tool-btn-label">Cimentaci&oacute;n</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="vigaSobreVigas" title="Viga Sobre Vigas">
                    <i class="ri-layout-4-line"></i>
                    <span class="predim-tool-btn-label">Sobre Vigas</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="vigadeborde" title="Viga de Borde">
                    <i class="ri-layout-5-line"></i>
                    <span class="predim-tool-btn-label">Borde</span>
                </button>
            </div>
        </div>

    </div>

    {{-- ═══════════ LOSAS ═══════════ --}}
    <div class="predim-ribbon-content" data-tab-content="losas">

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Losas Aligeradas</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="losaligerada1" title="Losa Aligerada 1 Dir">
                    <i class="ri-grid-line"></i>
                    <span class="predim-tool-btn-label">Alig. 1 Dir</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="losaligerada2" title="Losa Aligerada 2 Dir">
                    <i class="ri-grid-fill"></i>
                    <span class="predim-tool-btn-label">Alig. 2 Dir</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Losas Macizas</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="losamaciza1" title="Losa Maciza 1 Dir">
                    <i class="ri-layout-grid-line"></i>
                    <span class="predim-tool-btn-label">Maciza 1 Dir</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="losamaciza2" title="Losa Maciza 2 Dir">
                    <i class="ri-layout-grid-fill"></i>
                    <span class="predim-tool-btn-label">Maciza 2 Dir</span>
                </button>
            </div>
        </div>

    </div>

    {{-- ═══════════ CIMENTACIÓN ═══════════ --}}
    <div class="predim-ribbon-content" data-tab-content="cimentacion">

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Elementos</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="cuadradozapata" title="Zapata Cuadrada">
                    <i class="ri-checkbox-blank-line"></i>
                    <span class="predim-tool-btn-label">Zapata</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="placas" title="Placas">
                    <i class="ri-layout-masonry-line"></i>
                    <span class="predim-tool-btn-label">Placas</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Par&aacute;m. Zapatas</div>
            <div class="predim-ribbon-group-tools gap-2" style="align-items:flex-end;">
                <div class="predim-input-group">
                    <label for="Zpisos">N&deg; Pisos</label>
                    <input id="Zpisos" type="number" value="0" min="0" style="width:46px">
                </div>
                <div class="predim-input-group">
                    <label for="Zsuelos">Cap. Suelo</label>
                    <input id="Zsuelos" type="number" value="0" min="0" style="width:56px">
                </div>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Par&aacute;m. Placas</div>
            <div class="predim-ribbon-group-tools gap-2" style="align-items:flex-end;">
                <div class="predim-input-group">
                    <label for="npisosPlacas">N&deg; Pisos</label>
                    <input id="npisosPlacas" type="number" value="1" min="1" style="width:42px">
                </div>
                <div class="predim-input-group">
                    <label for="placaZ">Z</label>
                    <input id="placaZ" type="number" value="1" style="width:36px">
                </div>
                <div class="predim-input-group">
                    <label for="placaU">U</label>
                    <input id="placaU" type="number" value="1" style="width:36px">
                </div>
                <div class="predim-input-group">
                    <label for="placaS">S</label>
                    <input id="placaS" type="number" value="1" style="width:36px">
                </div>
                <div class="predim-input-group">
                    <label for="placaR">R</label>
                    <input id="placaR" type="number" value="1" style="width:36px">
                </div>
                <div class="predim-input-group">
                    <label for="placafc">F'c</label>
                    <input id="placafc" type="number" value="210" style="width:46px">
                </div>
            </div>
        </div>

    </div>

    {{-- ═══════════ HERRAMIENTAS ═══════════ --}}
    <div class="predim-ribbon-content predim-ribbon-tools-grid" data-tab-content="herramientas">

        <div class="predim-ribbon-group predim-ribbon-group-compact">
            <div class="predim-ribbon-group-label">Dibujo</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="lapiz" title="L&aacute;piz">
                    <i class="ri-pencil-line"></i>
                    <span class="predim-tool-btn-label">L&aacute;piz</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="texto" title="Texto">
                    <i class="ri-text"></i>
                    <span class="predim-tool-btn-label">Texto</span>
                </button>
                <button class="predim-tool-btn" id="eliminar_grafico" title="Borrar">
                    <i class="ri-eraser-line"></i>
                    <span class="predim-tool-btn-label">Borrar</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group predim-ribbon-group-compact">
            <div class="predim-ribbon-group-label">Colores</div>
            <div class="predim-ribbon-group-tools">
                <div class="predim-color-palette">
                    <button class="predim-color-btn active" data-color="#0400ff" style="background-color:#0400ff;" title="Azul"></button>
                    <button class="predim-color-btn" data-color="#ff0400" style="background-color:#ff0400;" title="Rojo"></button>
                    <button class="predim-color-btn" data-color="#00ff04" style="background-color:#00c800;" title="Verde"></button>
                    <button class="predim-color-btn" data-color="#fbff00" style="background-color:#f5e000;" title="Amarillo"></button>
                    <button class="predim-color-btn" data-color="#ff9900" style="background-color:#ff9900;" title="Naranja"></button>
                    <button class="predim-color-btn" data-color="#000000" style="background-color:#111;" title="Negro"></button>
                    <button class="predim-color-btn" data-color="#ffffff" style="background-color:#ffffff; outline:1px solid #888;" title="Blanco"></button>
                    <button class="predim-color-btn" data-color="#808080" style="background-color:#808080;" title="Gris"></button>
                </div>
            </div>
        </div>

        <div class="predim-ribbon-group predim-ribbon-group-compact">
            <div class="predim-ribbon-group-label">Grosor L&iacute;nea</div>
            <div class="predim-ribbon-group-tools" id="grosorline" style="flex-direction:column; gap:3px; justify-content:center;">
                <button class="predim-tool-btn active" data-brush-width="2" style="height:14px; padding:0 6px; min-width:32px; justify-content:center;">
                    <span style="display:block; height:1.5px; width:22px; background:currentColor; border-radius:1px;"></span>
                </button>
                <button class="predim-tool-btn" data-brush-width="5" style="height:14px; padding:0 6px; min-width:32px; justify-content:center;">
                    <span style="display:block; height:3px; width:22px; background:currentColor; border-radius:1px;"></span>
                </button>
                <button class="predim-tool-btn" data-brush-width="10" style="height:14px; padding:0 6px; min-width:32px; justify-content:center;">
                    <span style="display:block; height:5px; width:22px; background:currentColor; border-radius:1px;"></span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group predim-ribbon-group-compact">
            <div class="predim-ribbon-group-label">Tama&ntilde;o Texto</div>
            <div class="predim-ribbon-group-tools" id="grosorletter" style="gap:2px;">
                <button class="predim-tool-btn" data-font-size="12" style="height:18px; min-width:28px; font-size:9px; padding:0 4px;">12</button>
                <button class="predim-tool-btn active" data-font-size="16" style="height:18px; min-width:28px; font-size:9px; padding:0 4px;">16</button>
                <button class="predim-tool-btn" data-font-size="20" style="height:18px; min-width:28px; font-size:9px; padding:0 4px;">20</button>
                <button class="predim-tool-btn" data-font-size="24" style="height:18px; min-width:28px; font-size:9px; padding:0 4px;">24</button>
            </div>
        </div>

        <div class="predim-ribbon-group predim-ribbon-group-compact predim-ribbon-group-visibility">
            <div class="predim-ribbon-group-label">Visualizaci&oacute;n</div>
            <div class="predim-visibility-panel-inline">
                <div class="predim-visibility-toolbar">
                    <button type="button" class="predim-tool-btn predim-tool-btn-inline" id="show-all-shapes">Todo</button>
                    <button type="button" class="predim-tool-btn predim-tool-btn-inline" id="hide-all-shapes">Nada</button>
                </div>
                <div style="width:1px; background:var(--rb-group-sep); align-self:stretch; margin:4px 3px;"></div>
                <div class="predim-visibility-groups-inline">
                    <div class="predim-visibility-group">
                        <div class="predim-visibility-group-title">Columnas</div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="rectangle" checked> Rectangular</label><button type="button" class="predim-visibility-solo" data-visibility-only="rectangle">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="cuadrado" checked> Cuadrada</label><button type="button" class="predim-visibility-solo" data-visibility-only="cuadrado">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="circulo" checked> Circular</label><button type="button" class="predim-visibility-solo" data-visibility-only="circulo">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="te" checked> T</label><button type="button" class="predim-visibility-solo" data-visibility-only="te">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="ele" checked> L</label><button type="button" class="predim-visibility-solo" data-visibility-only="ele">Solo</button></div>
                    </div>
                    <div class="predim-visibility-group">
                        <div class="predim-visibility-group-title">Vigas</div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="cuadradovigas" checked> Principal</label><button type="button" class="predim-visibility-solo" data-visibility-only="cuadradovigas">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="cuadradovigasse" checked> Secundaria</label><button type="button" class="predim-visibility-solo" data-visibility-only="cuadradovigasse">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="cuadradovigascimentacion" checked> Cimentaci&oacute;n</label><button type="button" class="predim-visibility-solo" data-visibility-only="cuadradovigascimentacion">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="vigaSobreVigas" checked> Sobre vigas</label><button type="button" class="predim-visibility-solo" data-visibility-only="vigaSobreVigas">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="vigadeborde" checked> Borde</label><button type="button" class="predim-visibility-solo" data-visibility-only="vigadeborde">Solo</button></div>
                    </div>
                    <div class="predim-visibility-group">
                        <div class="predim-visibility-group-title">Losas &amp; Cimentaci&oacute;n</div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="losaligerada1" checked> Alig. 1D</label><button type="button" class="predim-visibility-solo" data-visibility-only="losaligerada1">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="losaligerada2" checked> Alig. 2D</label><button type="button" class="predim-visibility-solo" data-visibility-only="losaligerada2">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="losamaciza1" checked> Maciza 1D</label><button type="button" class="predim-visibility-solo" data-visibility-only="losamaciza1">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="losamaciza2" checked> Maciza 2D</label><button type="button" class="predim-visibility-solo" data-visibility-only="losamaciza2">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="cuadradozapata" checked> Zapata</label><button type="button" class="predim-visibility-solo" data-visibility-only="cuadradozapata">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="placas" checked> Placas</label><button type="button" class="predim-visibility-solo" data-visibility-only="placas">Solo</button></div>
                    </div>
                    <div class="predim-visibility-group">
                        <div class="predim-visibility-group-title">Herramientas</div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="lapiz" checked> L&aacute;piz</label><button type="button" class="predim-visibility-solo" data-visibility-only="lapiz">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="texto" checked> Texto</label><button type="button" class="predim-visibility-solo" data-visibility-only="texto">Solo</button></div>
                        <div class="predim-visibility-item"><label><input type="checkbox" data-visibility-tool="lineaEscala" checked> L&iacute;nea escala</label><button type="button" class="predim-visibility-solo" data-visibility-only="lineaEscala">Solo</button></div>
                    </div>
                </div>
            </div>
        </div>

    </div><!-- /herramientas -->

</div><!-- /predim-ribbon -->

<script>
document.addEventListener('DOMContentLoaded', function () {

    /* ── Tabs ── */
    const tabs     = document.querySelectorAll('.predim-ribbon-tab');
    const contents = document.querySelectorAll('.predim-ribbon-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const target = document.querySelector(`[data-tab-content="${tab.dataset.tab}"]`);
            if (target) target.classList.add('active');
        });
    });

    /* ── Tool highlight ── */
    const toolBtns = document.querySelectorAll('.tool');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            toolBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    /* ── Color selection ── */
    document.querySelectorAll('.predim-color-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.predim-color-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    /* ── Dark-mode toggle ── */
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            const root = document.documentElement;
            const isDark = root.getAttribute('data-theme') !== 'light';
            root.setAttribute('data-theme', isDark ? 'light' : 'dark');
            const icon = this.querySelector('i');
            if (icon) icon.className = isDark ? 'ri-moon-line' : 'ri-sun-line';
        });
    }
});
</script>