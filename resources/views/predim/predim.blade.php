<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interfaz de Diseño Estructural</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.min.css" rel="stylesheet" />
    <style>
        body,
        html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background-color: #000000;
        }

        .header {
            border-bottom: 1px solid #ccc;
        }

        .main-menu {
            display: flex;
            align-items: center;
            padding: 5px;
            background-color: #000000;
        }

        .logo {
            width: 40px;
            height: 40px;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 5px;
            filter: invert(0);
        }

        .menu-group {
            position: relative;
            margin-left: 10px;
        }

        .menu-group-title {
            font-size: 15px;
            padding: 15px 20px;
            cursor: pointer;
            border-radius: 3px;
            background-color: #fff;
            border-radius: 10px;
            align-items: center;
        }

        .menu-group-title:hover {
            color: #ffffff;
            background-color: cornflowerblue;
        }

        .submenu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            border-radius: 3px;
            padding: 5px;
            z-index: 1000;
            width: max-content;
            border-radius: 10px;
            background-color: cornflowerblue;
        }

        .menu-group:hover .submenu {
            display: block;
        }

        .submenu-items {
            display: grid;
            flex-wrap: wrap;
            gap: 5px;
            max-width: 300px;
            align-items: center;
        }

        .btn {
            padding: 10px 15px;
            cursor: pointer;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-size: 12px;
            background-color: #f9f9f9;
            white-space: nowrap;
            border-radius: 10px
        }

        .textinp {
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
            font-size: 16px;
            color: #f9f9f9;
            font-weight: bold;
        }

        .btn:hover {
            color: #ffffff;
            background-color: rgb(61, 101, 175);
        }

        input[type="number"] {
            width: 60px;
            padding: 3px;
            border: 1px solid #ccc;
            border-radius: 8px;
        }

        .drawing-area {
            flex-grow: 1;
            border: 1px solid #ccc;
            margin: 10px;
            height: 600px;
            /* Limita la altura a 600px */
            overflow-y: scroll;
            /* Habilita el scroll vertical */
        }

        /* Estilo para los dropdowns */
        .dropdown {
            position: relative;
            display: inline-block;
        }

        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            background-color: cornflowerblue;
            min-width: 160px;
            box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
            z-index: 1;
            border-radius: 5px;
        }

        .dropdown-content a {
            color: black;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            border-radius: 10px;
        }

        .dropdown-content a:hover {
            background-color: rgb(61, 101, 175);
        }

        /* Mostrar el contenido del dropdown al hacer hover */
        .dropdown:hover .dropdown-content {
            display: block;
        }

        .menu-group-title i {
            margin-right: 25px;
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0, 0, 0);
            background-color: rgba(0, 0, 0, 0.4);
        }

        .modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
        }

        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }

        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }

        .table-responsive {
            overflow-x: auto;
            margin: 20px 0;
        }

        .styled-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 16px;
            border-radius: 5px;
            overflow: hidden;
        }

        .styled-table thead {
            background-color: #4CAF50;
            color: white;
        }

        .styled-table th,
        .styled-table td {
            padding: 12px 15px;
            text-align: left;
        }

        .styled-table tbody tr {
            border-bottom: 1px solid #dddddd;
        }

        .styled-table tbody tr:hover {
            background-color: #f1f1f1;
        }

        /* Aseguramos que los elementos estén alineados horizontalmente */
        .flex {
            display: flex;
            align-items: center;
            /* Alineación vertical */
            justify-content: center;
            /* Alineación horizontal */
        }

        /* Configuración de color para tema claro y oscuro */
        .text-gray-950 {
            color: #212121;
            /* Color oscuro para el texto en tema claro */
        }

        .text-gray-50 {
            color: #fafafa;
            /* Color claro para el texto en tema oscuro */
        }

        /* Cambios en el logo */
        .logo {
            object-fit: contain;
            /* Asegura que el logo no se deforme */
        }

        /* Estilo para el fondo y textos en modo oscuro */
        .dark {
            background-color: #2c2c2c;
            /* Fondo oscuro */
        }

        /* Si se usa preferencia de tema oscuro en el sistema */
        @media (prefers-color-scheme: dark) {
            .dark\:text-gray-50 {
                color: #fafafa;
            }

            .dark {
                background-color: #121212;
                /* Fondo oscuro más profundo */
            }

            /* Otros estilos del tema oscuro pueden ser añadidos aquí */
        }

        @media (max-width: 600px) {
            .styled-table thead {
                display: none;
            }

            .styled-table tbody tr {
                display: block;
                margin-bottom: 10px;
            }

            .styled-table tbody td {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                border-bottom: 1px solid #dddddd;
            }

            .styled-table tbody td::before {
                content: attr(data-label);
                font-weight: bold;
                margin-right: 10px;
            }
        }

        @media (max-width: 768px) {
            .main-menu {
                flex-wrap: wrap;
            }

            .menu-group {
                margin-bottom: 5px;
            }
        }

        @media (prefers-color-scheme: dark) {
            .logo {
                filter: invert(1);
            }
        }
    </style>
</head>

<body>
    <div class="modal" id="myModal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Columna Rectangular</h3>
                <h3 class="">Cantidad: <span id="rectangulo-count">0</span></h3>
                <table class="styled-table" id="tablaColRect">
                    <thead>
                        <tr>
                            <th class="" scope="col">N°</th>
                            <th class="" scope="col">Formula</th>
                            <th class="" scope="col">Área Tributaria (AT)</th>
                            <th class="" scope="col">Área del Rectángulo (A)</th>
                            <th class="" scope="col">Base (b)</th>
                            <th class="" scope="col">Lado del Rectángulo</th>
                        </tr>
                    </thead>
                    <tbody id="Columna_rectangular"></tbody>
                </table>
            </div>
            <br>
            {{-- COLUMNA CUADRADO --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Columna Cuadrada</h3>
                <h3 class="">Cantidad: <span id="cuadro-count">0</span></h3>
                <table class="styled-table" id="tablaColCuad">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Área Tributaria (AT)</th>
                        <th class="" scope="col">Área del Cuadrado (A)</th>
                        <th class="" scope="col">Lado del Cuadrado</th>
                    </thead>
                    <tbody id="Columna_Cuadrado"></tbody>
                </table>
            </div>
            <br>
            {{-- COLUMNA CIRCULO --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Columna Circular</h3>
                <h3 class="">Cantidad: <span id="circulo-count">0</span></h3>
                <table class="styled-table" id="tablaColCircle">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Área Tributaria (AT)</th>
                        <th class="" scope="col">Área del Circulo (A)</th>
                        <th class="" scope="col">Radio</th>
                    </thead>
                    <tbody id="Columna_Circular"></tbody>
                </table>
            </div>
            <br>
            {{-- COLUMNA T --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Columna T</h3>
                <h3 class="">Cantidad: <span id="te-count">0</span></h3>
                <table class="styled-table" id="tablaColTe">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Área Tributaria (AT)</th>
                        <th class="" scope="col">Área (A)</th>
                        <th class="" scope="col"> (e)</th>
                        <th class="" scope="col">Lado</th>
                    </thead>
                    <tbody id="Columna_Te"></tbody>
                </table>
            </div>
            <br>
            {{-- COLUMNA L --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Columna L</h3>
                <h3 class="">Cantidad: <span id="le-count">0</span></h3>
                <table class="styled-table" id="tablaColLe">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Área Tributaria (AT)</th>
                        <th class="" scope="col">Área (A)</th>
                        <th class="" scope="col">(e)</th>
                        <th class="" scope="col">Lado</th>
                    </thead>
                    <tbody id="Columna_Le"></tbody>
                </table>
            </div>
            <br> {{-- ==============VIGAS================= --}}
            {{-- VIGAS PRINCIPAL --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Vigas Principal</h3>
                <h3 class="">Cantidad: <span id="vigas-count">0</span></h3>
                <table class="styled-table" id="tablaVigasP">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Luz(L)</th>
                        <th class="" scope="col">Base(b)</th>
                        <th class="" scope="col">Altura(h)</th>
                    </thead>
                    <tbody id="vigas_principal"></tbody>
                </table>
            </div>
            <br>
            {{-- VIGAS SEGUNDARIA --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Vigas SEGUNDARIA</h3>
                <h3 class="">Cantidad: <span id="vigasSeg-count">0</span></h3>
                <table class="styled-table" id="tablaVigaSeg">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Luz(L)</th>
                        <th class="" scope="col">Base(b)</th>
                        <th class="" scope="col">Altura(h)</th>
                    </thead>
                    <tbody id="vigas_Segundaria"></tbody>
                </table>
            </div>
            <br>
            {{-- VIGAS CIMENTACION --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Vigas Cimentacion</h3>
                <h3 class="">Cantidad: <span id="vigasCimentacion-count">0</span></h3>
                <table class="styled-table" id="tablaCimen">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">luz(L)</th>
                        <th class="" scope="col">Base(b)</th>
                        <th class="" scope="col">Altura(h)</th>
                    </thead>
                    <tbody id="vigas_Cimntacion"></tbody>
                </table>
            </div>
            <br>
            {{-- VIGAS Sobre vigas --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Vigas Sobre Vigas</h3>
                <h3 class="">Cantidad: <span id="vigasSSvigas-count">0</span></h3>
                <table class="styled-table" id="tablaVigaSVigas">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Luz(L)</th>
                        <th class="" scope="col">Base(b)</th>
                        <th class="" scope="col">Altura(h)</th>
                    </thead>
                    <tbody id="vigas_sobrevigas"></tbody>
                </table>
            </div>
            <br>
            {{-- VIGAS de borde --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Vigas de Borde</h3>
                <h3 class="">Cantidad: <span id="vigasbordes-count">0</span></h3>
                <table class="styled-table" id="tablaVigaSBorde">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Luz(L)</th>
                        <th class="" scope="col">Base(b)</th>
                        <th class="" scope="col">Altura(h)</th>
                    </thead>
                    <tbody id="vigas_borde"></tbody>
                </table>
            </div>
            <br>
            {{-- LOSAS CUADRADAS --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Losas Aligerada 1 dir.</h3>
                <h3 class="">Cantidad: <span id="losas-count">0</span></h3>
                <table class="styled-table" id="tablaLosasCuad">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Luz(L)</th>
                        <th class="" scope="col">Espesor(e)</th>
                    </thead>
                    <tbody id="losas_Cuadrada"></tbody>
                </table>
            </div>
            <br>
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Losas Aligerada 2 dir</h3>
                <h3 class="">Cantidad: <span id="losasal2-count">0</span></h3>
                <table class="styled-table" id="tablaLosasAlig">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Luz(L)</th>
                        <th class="" scope="col">Espesor(e)</th>
                    </thead>
                    <tbody id="losasAl2_Cuadrada"></tbody>
                </table>
            </div>
            <br>
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Losas Maciza 1 dir</h3>
                <h3 class="">Cantidad: <span id="losamaciza1-count">0</span></h3>
                <table class="styled-table" id="tablaLosasMaci">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Luz(L)</th>
                        <th class="" scope="col">Espesor (e)</th>
                    </thead>
                    <tbody id="losasMac1_Cuadrada"></tbody>
                </table>
            </div>
            <br>
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Losas Maciza 2 dir</h3>
                <h3 class="">Cantidad: <span id="losamaciza2-count">0</span></h3>
                <table class="styled-table" id="tablaLosasMaci2">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Luz(L)</th>
                        <th class="" scope="col">Espesor(e)</th>
                    </thead>
                    <tbody id="losasMac2_Cuadrada"></tbody>
                </table>
            </div>
            <br>
            {{-- ZAPATA CUADRADA --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Cimentacion Zapata Cuadrada</h3>
                <h3 class="">Cantidad: <span id="zapata-count">0</span></h3>
                <table class="styled-table" id="tablaZapataCuad">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Área Tributaria (AT)</th>
                        <th class="" scope="col">(AC)</th>
                        <th class="" scope="col">(AZ)</th>
                    </thead>
                    <tbody id="zapatas_cuadradas"></tbody>
                </table>
            </div>
            <br>
            {{-- PLACAS --}}
            <div class="table-responsive relative overflow-x-auto">
                <h3 class="text-xl">Cimentacion Zapata Cuadrada</h3>
                <h3 class="">Cantidad: <span id="placa-count">0</span></h3>
                <table class="styled-table" id="tablaCimentacionZap">
                    <thead>
                        <th class="" scope="col">N°</th>
                        <th class="" scope="col">Formula</th>
                        <th class="" scope="col">Área Total (AT)</th>
                        <th class="" scope="col">Perimetro(P)</th>
                        <th class="" scope="col">Cortante(V)</th>
                        <th class="" scope="col">(Espesor)</th>
                        <th class="" scope="col">Longitd(L)</th>
                    </thead>
                    <tbody id="placas_rp"></tbody>
                </table>
            </div>
            <br>
            <button class="btn" id="btn_pdf_predim"><i class="ri-file-pdf-2-fill"></i> Reportes pdf</button>
            <button class="btn" id="closeModal">Cerrar</button>
        </div>
    </div>
    <div class="container">
        <div class="header">
            <div class="main-menu">
                <div class="flex items-center justify-center space-x-2">
                    <a class="py-2 text-lg font-bold text-white" href="{{ route('landing.home') }}">
                        <img class="logo mx-auto h-10 w-10"
                            src="{{ Vite::asset('resources/img/logo_rizabalAsociados.png') }}" alt="Logo">
                    </a>
                    <p class="text-gray-950 dark:text-gray-50">Rizabal & Asociados</p>
                </div>
                <div class="menu-group">
                    <div class="menu-group-title">Archivos</div>
                    <div class="submenu">
                        <div class="submenu-items">
                            <button class="btn"><i class="ri-file-pdf-2-line"></i> Nuevo</button>
                            <button class="btn"><i class="ri-save-line"></i> Guardar</button>
                            <button class="btn" id="imprimir_doc"><i class="ri-save-line"></i> Imprimir</button>
                            <button class="btn"><i class="ri-delete-bin-6-line"></i> Eliminar</button>
                            <button class="btn" id="openModal"><i class="ri-file-pdf-2-fill"></i>
                                Reportes</button>
                            <input id="upload-pdf" type="file" style="display: none" accept=".pdf" />
                            <label class="btn" for="upload-pdf"><i class="ri-chat-upload-line"></i> Cargar</label>
                            <button class="btn"><i class="ri-door-open-line"></i> Salir</button>
                        </div>
                    </div>
                </div>
                {{-- Escala --}}
                <div class="menu-group">
                    <div class="menu-group-title">Escala</div>
                    <div class="submenu">
                        <button class="btn tool" data-tool="lineaEscala" title="lineaEscala">
                            <i class="ri-ruler-line"></i> Linea Escala
                        </button>
                        <div>
                            <label class="textinp" for="npisos">Valor medido</label>
                            <input id="escalaVal" type="number" value="1" min="1" />
                        </div>
                        <div>
                            <label class="textinp" for="npisos">Valor del plano</label>
                            <input id="escalaplano" type="number" value="1" min="1" />
                        </div>
                        <div>
                            <button id="calc">ok</button>
                        </div>
                    </div>
                </div>
                {{-- Columna --}}
                <div class="menu-group">
                    <div class="menu-group-title">Columnas</div>
                    <div class="submenu">
                        <div class="submenu-items">
                            <button class="btn tool" data-tool="rectangle" title="Rectangular"><i
                                    class="ri-rectangle-line"></i>
                                Col. Rectangular</button>
                            <button class="btn tool" data-tool="cuadrado" title="Cuadrada"><i
                                    class="ri-square-line"></i>
                                Col. Cuadrada</button>
                            <button class="btn tool" data-tool="circulo" title="Circular"><i
                                    class="ri-circle-line"></i>
                                Col. Circular</button>
                            <button class="btn tool" data-tool="te" title="T"><i class="ri-t-box-line"></i>
                                Col. T</button>
                            <button class="btn tool" data-tool="ele" title="L"><i class="ri-ruler-2-line"></i>
                                Col. L</button>
                            <div>
                                <label class="textinp" for="npisos">N° pisos</label>
                                <input id="npisos" type="number" value="1" min="1" />
                            </div>
                            <div>
                                <label class="textinp" for="">F'c</label>
                                <input id="fc" name="fc" type="number" value="210">
                                <span style="font-size: 10px">Kg/cm<sup>2</sup></span>
                            </div>
                        </div>
                    </div>
                </div>
                {{-- Vigas --}}
                <div class="menu-group">
                    <div class="menu-group-title">Vigas</div>
                    <div class="submenu">
                        <div class="submenu-items">
                            <button class="btn tool" data-tool="cuadradovigas" title="Vigas Principal"><i
                                    class="ri-t-box-line"></i> Vigas Principal</button>
                            <button class="btn tool" data-tool="cuadradovigasse" title="Vigas Segundaria"><i
                                    class="ri-t-box-line"></i> Vigas Segundaria</button>
                            <button class="btn tool" data-tool="cuadradovigascimentacion"
                                title="Vigas Cimentación"><i class="ri-t-box-line"></i> Vigas Cimentación</button>

                            <button class="btn tool" data-tool="vigaSobreVigas" title="Vigas Sobre Vigas"><i
                                    class="ri-t-box-line"></i> Vigas Sobre Vigas</button>

                            <button class="btn tool" data-tool="vigadeborde" title="Vigas de borde"><i
                                    class="ri-t-box-line"></i>
                                Vigas de Borde</button>
                        </div>
                    </div>
                </div>
                {{-- Losas --}}
                <div class="menu-group">
                    <div class="menu-group-title">Losas</div>
                    <div class="submenu">
                        <div class="submenu-items">
                            <button class="btn tool" data-tool="losaligerada1" title="Losa Aligerada 1"><i
                                    class="ri-t-box-line"></i> Losa Aligerada 1 dir.</button>
                            <button class="btn tool" data-tool="losaligerada2" title="Losa Aligerada 2"><i
                                    class="ri-t-box-line"></i> Losa Aligerada 2 dir.</button>
                            <button class="btn tool" data-tool="losamaciza1" title="Losa Maciza 1"><i
                                    class="ri-t-box-line"></i>
                                Losa Maciza 1 dir.</button>
                            <button class="btn tool" data-tool="losamaciza2" title="Losa Maciza 2"><i
                                    class="ri-t-box-line"></i>
                                Losa Maciza 2 dir.</button>
                        </div>
                    </div>
                </div>
                {{-- Cimentacion --}}
                <div class="menu-group">
                    <div class="menu-group-title">Cimentación</div>
                    <div class="submenu">
                        <div class="submenu-items">
                            <button class="btn tool" data-tool="cuadradozapata" title="Zapata Cuadrada"><i
                                    class="ri-square-line"></i> Cimentación</button>
                            <div>
                                <label class="textinp" for="Zpisos">N° pisos</label>
                                <input id="Zpisos" type="number" value="0" min="0" />
                            </div>
                            <div>
                                <label class="textinp" for="Zsuelos">Cap. suelos</label>
                                <input id="Zsuelos" type="number" value="0" min="0" />
                                <span style="font-size: 10px">Kg/cm<sup>2</sup></span>
                            </div>
                        </div>
                    </div>
                </div>
                {{-- Placas --}}
                <div class="menu-group">
                    <div class="menu-group-title">Placas</div>
                    <div class="submenu">
                        <div class="submenu-items">
                            <button class="btn tool" data-tool="placas" title="placas"><i
                                    class="ri-square-line"></i>
                                Placas</button>
                            <div>
                                <label class="textinp" for="npisosPlacas">N° pisos</label>
                                <input id="npisosPlacas" type="number" value="1" min="1" />
                            </div>
                            <div>
                                <label class="textinp" for="placaZ">Z</label>
                                <input id="placaZ" type="number" value="1" min="1" />
                            </div>
                            <div>
                                <label class="textinp" for="placaU">U</label>
                                <input id="placaU" type="number" value="1" min="0" />
                            </div>
                            <div>
                                <label class="textinp" for="placaS">S</label>
                                <input id="placaS" type="number" value="1" min="0" />
                            </div>
                            <div>
                                <label class="textinp" for="placaR">R</label>
                                <input id="placaR" type="number" value="1" min="0" />
                            </div>
                            <div>
                                <label class="textinp" for="placafc">fc</label>
                                <input id="placafc" type="number" value="210" min="0" />
                                <span style="font-size: 10px">Kg/cm<sup>2</sup> </span>
                            </div>
                        </div>
                    </div>
                </div>
                {{-- Herramientas --}}
                <div class="menu-group">
                    <div class="menu-group-title">Herramientas</div>
                    <div class="submenu">
                        <div class="submenu-items-herramientas">
                            <button class="btn tool" data-tool="lapiz"><i class="ri-pencil-line"></i>
                                Lápiz</button>
                            <button class="btn" id="eliminar_grafico"> <i class="ri-eraser-line"></i>
                                Borrar</button>
                            <button class="btn tool" data-tool="texto"><i class="ri-font-family"></i>
                                Texto</button>

                            <!-- Dropdown Capas -->
                            <div class="dropdown">
                                <button class="btn"><i class="ri-stack-line" title="Capas"></i>
                                    Capas</button>
                                <div class="dropdown-content">
                                    <a>
                                        <input id="colRect" name="colRect" type="checkbox" value="">
                                        <label class="textinp" for="checkbox-item-11">Columna Rectangular</label>
                                    </a>
                                    <a>
                                        <input id="colCuad" name="colCuad" type="checkbox" value="">
                                        <label class="textinp" for="checkbox-item-11">Columna Cuadrado</label>
                                    </a>
                                    <a>
                                        <input id="colCircle" name="colCircle" type="checkbox" value="">
                                        <label class="textinp" for="checkbox-item-11">Columna Circulo</label>
                                    </a>
                                    <a>
                                        <input id="colT" name="colT" type="checkbox" value="">
                                        <label class="textinp" for="checkbox-item-11">Columna T</label>
                                    </a>
                                    <a>
                                        <input id="colL" name="colL" type="checkbox" value="">
                                        <label class="textinp" for="checkbox-item-11">Columna L</label>
                                    </a>
                                    <a>
                                        <input id="vigaPrin" name="vigaPrin" type="checkbox" value="">
                                        <label class="textinp" for="checkbox-item-11">Viga Principal</label>
                                    </a>
                                    <a>
                                        <input id="vigaCimen" name="vigaCimen" type="checkbox" value="">
                                        <label class="textinp" for="checkbox-item-11">Viga Cimentación</label>
                                    </a>
                                    <a>
                                        <input id="losaCuad" name="losaCuad" type="checkbox" value="">
                                        <label class="textinp" for="checkbox-item-11">Losa Cuadrada</label>
                                    </a>
                                    <a>
                                        <input id="zapataCuad" name="zapataCuad" type="checkbox" value="">
                                        <label class="textinp" for="checkbox-item-11">Zapata Cauadrada</label>
                                    </a>
                                </div>
                            </div>

                            <!-- Dropdown Brillo -->
                            <div class="dropdown">
                                <button class="btn"><i class="ri-sun-line"></i> Brillo</button>
                                <div class="dropdown-content">
                                    <a> <input id="brightnessRange" type="range" value="1" min="0"
                                            max="4" step="0.1"></a>
                                </div>
                            </div>

                            <!-- Dropdown Tamaño Linea -->
                            <div class="dropdown">
                                <button class="btn"><i class="ri-sun-line"></i> Tamaño Linea</button>
                                <div class="dropdown-content">
                                    <a id="grosor-2" data-brush-width="2" href="#">2</a>
                                    <a id="grosor-5" data-brush-width="5" href="#">5</a>
                                    <a id="grosor-10" data-brush-width="10" href="#">10</a>
                                </div>
                            </div>

                            <!-- Dropdown Tamaño Letra -->
                            <div class="dropdown">
                                <button class="btn"><i class="ri-sun-line"></i> Tamaño Letra</button>
                                <div class="dropdown-content">
                                    <a id="font-size-12" data-font-size="12" href="#">12</a>
                                    <a id="font-size-14" data-font-size="14" href="#">14</a>
                                    <a id="font-size-16" data-font-size="16" href="#">16</a>
                                    <a id="font-size-20" data-font-size="20" href="#">20</a>
                                    <a id="font-size-24" data-font-size="24" href="#">24</a>
                                    <a id="font-size-28" data-font-size="28" href="#">28</a>
                                    <a id="font-size-32" data-font-size="32" href="#">32</a>
                                    <a id="font-size-36" data-font-size="36" href="#">36</a>
                                    <a id="font-size-40" data-font-size="40" href="#">40</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {{-- Colores --}}
                <div class="menu-group">
                    <div class="menu-group-title">Colores</div>
                    <div class="submenu">
                        <div class="submenu-items-herramientas">
                            <a class="btn" id="red-color" data-color="#ff0400" type="button"
                                style="background-color: red; width: 20px; height: 20px;"></a>
                            <a class="btn" id="blue-color" data-color="#0400ff"
                                style="background-color: blue; width: 20px; height: 20px;"></a>
                            <a class="btn" id="yellow-color" data-color="#fbff00"
                                style="background-color: yellow; width: 20px; height: 20px;"></a>
                            <a class="btn" id="orange-color" data-color="#ff9900"
                                style="background-color: orange; width: 20px; height: 20px;"></a>
                            <a class="btn" id="green-color" data-color="#00ff04"
                                style="background-color: green; width: 20px; height: 20px;"></a>
                            <a class="btn" id="black-color" data-color="#000000"
                                style="background-color: rgb(0, 0, 0); width: 20px; height: 20px;"></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <label data-id="{{ url('/assets/pdf/Escalado.pdf') }}" type="hidden"></label>
        <div class="drawing-area">
            <canvas class="border" id="canvas"></canvas>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/jasonday/printThis/printThis.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/vfs_fonts.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.1/dist/flowbite.min.js"></script>
    <script src="https://unpkg.com/@themesberg/flowbite@1.2.0/dist/flowbite.bundle.js"></script>
    <script>
        document.getElementById('openModal').onclick = function() {
            document.getElementById('myModal').style.display = 'block';
        }

        document.querySelector('.close').onclick = function() {
            document.getElementById('myModal').style.display = 'none';
        }

        document.getElementById('closeModal').onclick = function() {
            document.getElementById('myModal').style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == document.getElementById('myModal')) {
                document.getElementById('myModal').style.display = 'none';
            }
        }
    </script>
    @vite(['resources/js/adm_predim_view.js'])
</body>

</html>
