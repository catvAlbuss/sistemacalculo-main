{{-- Ribbon-style Topbar with Tabs and Dropdowns --}}
<div class="predim-ribbon">
    {{-- Top Bar --}}
    <div class="predim-topbar">
        <a href="{{ route('landing.home') }}">
            <img class="predim-logo" src="{{ Vite::asset('resources/img/logo_rizabalAsociados.png') }}" alt="Logo">
        </a>
        <span class="predim-title">Rizabal & Asociados - Predimensionamiento Estructural</span>
        <button id="dark-mode-toggle" class="predim-tool-btn" style="margin-left: auto;" title="Cambiar Tema">
            <i class="ri-moon-line"></i>
        </button>
    </div>

    {{-- Ribbon Tabs --}}
    <div class="predim-ribbon-tabs">
        <button class="predim-ribbon-tab active" data-tab="archivo">
            Archivo
        </button>
        <button class="predim-ribbon-tab" data-tab="columnas">
            Columnas
        </button>
        <button class="predim-ribbon-tab" data-tab="vigas">
            Vigas
        </button>
        <button class="predim-ribbon-tab" data-tab="losas">
            Losas
        </button>
        <button class="predim-ribbon-tab" data-tab="cimentacion">
            Cimentación
        </button>
        <button class="predim-ribbon-tab" data-tab="herramientas">
            Herramientas
        </button>
    </div>

    {{-- Ribbon Content: Archivo Tab --}}
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
                <label for="upload-pdf" class="predim-tool-btn" title="Cargar PDF">
                    <i class="ri-upload-cloud-line"></i>
                    <span class="predim-tool-btn-label">Cargar PDF</span>
                </label>
                <input id="upload-pdf" type="file" accept=".pdf" style="display: none">
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Exportar</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn" id="openModal" title="Ver Reportes">
                    <i class="ri-file-list-3-line"></i>
                    <span class="predim-tool-btn-label">Reportes</span>
                </button>
                <button class="predim-tool-btn" id="imprimir_doc" title="Imprimir">
                    <i class="ri-printer-line"></i>
                    <span class="predim-tool-btn-label">Imprimir</span>
                </button>
                <button class="predim-tool-btn" id="btnCanvasPNG" title="png">
                    <span class="predim-tool-btn-label">PNG</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Escala</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="lineaEscala" title="Línea de Escala">
                    <i class="ri-ruler-line"></i>
                    <span class="predim-tool-btn-label">Línea Escala</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Valores</div>
            <div class="predim-ribbon-group-tools flex gap-2">
                <div class="predim-input-group">
                    <label for="escalaVal">Medido</label>
                    <input id="escalaVal" type="number" value="1" min="1">
                </div>
                <div class="predim-input-group">
                    <label for="escalaplano">Plano</label>
                    <input id="escalaplano" type="number" value="1" min="1">
                </div>
                <button class="predim-tool-btn" id="calc" style="align-self: flex-end;">
                    <i class="ri-calculator-line"></i>
                    <span class="predim-tool-btn-label">Calcular</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Brillo</div>
            <div class="predim-ribbon-group-tools">
                <input id="brightnessRange" type="range" value="1" min="0" max="4" step="0.1"
                    style="width: 120px;">
            </div>
        </div>
    </div>

    {{-- Ribbon Content: Columnas Tab --}}
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
            <div class="predim-ribbon-group-label">Parámetros</div>
            <div class="predim-ribbon-group-tools flex gap-2">
                <div class="predim-input-group">
                    <label for="npisos">N° Pisos</label>
                    <input id="npisos" type="number" value="1" min="1">
                </div>
                <div class="predim-input-group">
                    <label for="fc">F'c (kg/cm²)</label>
                    <input id="fc" type="number" value="210">
                </div>
            </div>
        </div>
    </div>

    {{-- Ribbon Content: Vigas Tab --}}
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
                <button class="predim-tool-btn tool" data-tool="cuadradovigascimentacion" title="Viga Cimentación">
                    <i class="ri-layout-3-line"></i>
                    <span class="predim-tool-btn-label">Cimentación</span>
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

    {{-- Ribbon Content: Losas Tab --}}
    <div class="predim-ribbon-content" data-tab-content="losas">
        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Losas Aligeradas</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="losaligerada1" title="Losa Aligerada 1 Dir">
                    <i class="ri-grid-line"></i>
                    <span class="predim-tool-btn-label">Aligerada 1 Dir</span>
                </button>
                <button class="predim-tool-btn tool" data-tool="losaligerada2" title="Losa Aligerada 2 Dir">
                    <i class="ri-grid-fill"></i>
                    <span class="predim-tool-btn-label">Aligerada 2 Dir</span>
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

    {{-- Ribbon Content: Cimentación Tab --}}
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
            <div class="predim-ribbon-group-label">Parámetros Zapatas</div>
            <div class="predim-ribbon-group-tools flex gap-2">
                <div class="predim-input-group">
                    <label for="Zpisos">N° Pisos</label>
                    <input id="Zpisos" type="number" value="0" min="0">
                </div>
                <div class="predim-input-group">
                    <label for="Zsuelos">Cap. Suelo</label>
                    <input id="Zsuelos" type="number" value="0" min="0">
                </div>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Parámetros Placas</div>
            <div class="predim-ribbon-group-tools flex gap-2">
                <div class="predim-input-group">
                    <label for="npisosPlacas">N° Pisos</label>
                    <input id="npisosPlacas" type="number" value="1" min="1">
                </div>
                <div class="predim-input-group">
                    <label for="placaZ">Z</label>
                    <input id="placaZ" type="number" value="1" min="1">
                </div>
                <div class="predim-input-group">
                    <label for="placaU">U</label>
                    <input id="placaU" type="number" value="1" min="0">
                </div>
                <div class="predim-input-group">
                    <label for="placaS">S</label>
                    <input id="placaS" type="number" value="1" min="0">
                </div>
                <div class="predim-input-group">
                    <label for="placaR">R</label>
                    <input id="placaR" type="number" value="1" min="0">
                </div>
                <div class="predim-input-group">
                    <label for="placafc">F'c</label>
                    <input id="placafc" type="number" value="210" min="0">
                </div>
            </div>
        </div>
    </div>

    {{-- Ribbon Content: Herramientas Tab --}}
    <div class="predim-ribbon-content" data-tab-content="herramientas">
        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Dibujo</div>
            <div class="predim-ribbon-group-tools">
                <button class="predim-tool-btn tool" data-tool="lapiz" title="Lápiz">
                    <i class="ri-pencil-line"></i>
                    <span class="predim-tool-btn-label">Lápiz</span>
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

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Colores</div>
            <div class="predim-color-palette">
                <button class="predim-color-btn active" data-color="#0400ff" style="background-color: #0400ff;"
                    title="Azul"></button>
                <button class="predim-color-btn" data-color="#ff0400" style="background-color: #ff0400;"
                    title="Rojo"></button>
                <button class="predim-color-btn" data-color="#00ff04" style="background-color: #00ff04;"
                    title="Verde"></button>
                <button class="predim-color-btn" data-color="#fbff00" style="background-color: #fbff00;"
                    title="Amarillo"></button>
                <button class="predim-color-btn" data-color="#ff9900" style="background-color: #ff9900;"
                    title="Naranja"></button>
                <button class="predim-color-btn" data-color="#000000" style="background-color: #000000;"
                    title="Negro"></button>
                <button class="predim-color-btn" data-color="#ffffff"
                    style="background-color: #ffffff; border-color: #ccc;" title="Blanco"></button>
                <button class="predim-color-btn" data-color="#808080" style="background-color: #808080;"
                    title="Gris"></button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Grosor Línea</div>
            <div class="predim-ribbon-group-tools" id="grosorline">
                <button class="predim-tool-btn" data-brush-width="2">
                    <span class="predim-tool-btn-label">2px</span>
                </button>
                <button class="predim-tool-btn" data-brush-width="5">
                    <span class="predim-tool-btn-label">5px</span>
                </button>
                <button class="predim-tool-btn" data-brush-width="10">
                    <span class="predim-tool-btn-label">10px</span>
                </button>
            </div>
        </div>

        <div class="predim-ribbon-group">
            <div class="predim-ribbon-group-label">Tamaño Texto</div>
            <div class="predim-ribbon-group-tools" id="grosorletter">
                <button class="predim-tool-btn" data-font-size="12">
                    <span class="predim-tool-btn-label">12</span>
                </button>
                <button class="predim-tool-btn" data-font-size="16">
                    <span class="predim-tool-btn-label">16</span>
                </button>
                <button class="predim-tool-btn" data-font-size="20">
                    <span class="predim-tool-btn-label">20</span>
                </button>
                <button class="predim-tool-btn" data-font-size="24">
                    <span class="predim-tool-btn-label">24</span>
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    // Ribbon Tab Switching
    document.addEventListener('DOMContentLoaded', function() {
        const tabs = document.querySelectorAll('.predim-ribbon-tab');
        const contents = document.querySelectorAll('.predim-ribbon-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                const targetContent = document.querySelector(`[data-tab-content="${tabName}"]`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });

        // Tool selection highlighting
        const toolButtons = document.querySelectorAll('.tool');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                toolButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Color selection
        const colorButtons = document.querySelectorAll('.predim-color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                colorButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    });
</script>
