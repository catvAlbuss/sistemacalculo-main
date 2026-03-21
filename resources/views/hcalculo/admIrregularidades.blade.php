<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N" crossorigin="anonymous">
  <link href="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css" rel="stylesheet" />
  <title>{{ config('app.name', 'R&AIE') }}</title>

  <link type="image/x-icon" href="{{ url('/assets/img/logo_rizabalAsociados.png') }}" rel="icon">
</head>

<body class="hold-transition sidebar-mini layout-fixed small">
  <div class="wrapper">
    <div class="content-wrapper">
      <!-- Content Header (Page header) -->
      <section class="content-header">
        <div class="container-fluid">
          <div class="row mb-2">
            <div class="col-sm-6">
              <h1>IRREGULARIDADES ESTRUCTURALES</h1>
            </div>
            <div class="col-sm-6">
              <ol class="breadcrumb float-sm-right">
                <li class="breadcrumb-item"><a href="../adm_principal.php">Inicio</a></li>
                <li class="breadcrumb-item active">IRREGULARIDADES ESTRUCTURALES</li>
              </ol>
            </div>
          </div>
        </div><!-- /.container-fluid -->
      </section>
      <section class="content">
        <div class="container-fluid">
          <!-- -------Irregularidad en altura------- -->
          <div class="card card-info m-0 p-0">
            <div class="card-header d-flex justify-content-between">
              <h3 class="card-title">IRREGULARIDAD EN ALTURA | IA. "K", "V"</h3>
              <button class="collapsible-btn ml-auto" data-target="content2">ver / ocultar</button>
            </div>
            <!-- Tablas interiores -->
            <div class="card-body d-none m-0 p-0" class="collapsible-content" id="content2">
              <!-- Tabla Análisis en Dirección "x" -->
              <div class="card m-0" id="IRRRIPBXDiv">
                <div class="card-header d-flex justify-content-between">Análisis en dirección "X" <button
                    class="collapsible-btn ml-auto mr-5" data-target="IRRX">ver / ocultar</button></div>
                <div class="card-body collapsible-content d-none" id="IRRX">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRRIPBX"></div>
                      </div>
                    </div>
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex justify-content-start">
                        <button class="btn btn-primary mt-3" id="IRRRIPBXBtn">Ver resultados</button>
                        <button class="btn btn-primary ml-3 mt-3" id="IRRRIPBXNext"
                          data-target="IRRX">Siguiente</button>
                      </div>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                      <div class="table-container" id="IRRREPBX"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card d-none m-0" id="IRRRIPBXEDiv">
                <div class="card-header d-flex justify-content-between">Análisis Extrema en dirección "X" <button
                    class="collapsible-btn ml-auto mr-5" data-target="IRREX">ver / ocultar</button></div>
                <div class="card-body collapsible-content" id="IRREX">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRRIPBXE"></div>
                      </div>
                    </div>
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex justify-content-start">
                        <button class="btn btn-primary mt-3" id="IRRREPBXEBtn">Ver resultados</button>
                        <button class="btn btn-primary ml-3 mt-3" id="IRRRIPBXENext"
                          data-target="IRRX">Anterior</button>
                      </div>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                      <div class="table-container" id="IRRREPBXE"></div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Tabla Análisis en Dirección "Y" -->
              <div class="card m-0" id="IRRRIPBYDiv">
                <div class="card-header d-flex justify-content-between">Análisis en dirección "Y" <button
                    class="collapsible-btn ml-auto mr-5" data-target="IRRY">ver / ocultar</button></div>
                <div class="card-body collapsible-content d-none" id="IRRY">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRRIPBY"></div>
                      </div>
                    </div>
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex justify-content-start">
                        <button class="btn btn-primary mt-3" id="IRRRIPBYBtn">Ver resultados</button>
                        <button class="btn btn-primary ml-3 mt-3" id="IRRRIPBYNext"
                          data-target="IRRY">Siguiente</button>
                      </div>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                      <div class="table-container" id="IRRREPBY"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card d-none m-0" id="IRRRIPBYEDiv">
                <div class="card-header d-flex justify-content-between">Análisis Extrema en dirección "Y" <button
                    class="collapsible-btn ml-auto mr-5" data-target="IRREY">ver / ocultar</button></div>
                <div class="card-body collapsible-content" id="IRREY">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRRIPBYE"></div>
                      </div>
                    </div>
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex justify-content-start">
                        <button class="btn btn-primary mt-3" id="IRRRIPBYEBtn">Ver resultados</button>
                        <button class="btn btn-primary ml-3 mt-3" id="IRRRIPBYENext"
                          data-target="IRREY">Anterior</button>
                      </div>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                      <div class="table-container" id="IRRREPBYE"></div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Tabla Análisis en Dirección "y" -->
              <!-- <div class="card m-0">
                            <div class="card-header d-flex justify-content-between">Análisis en dirección "Y" <button class="collapsible-btn ml-auto mr-5" data-target="IRRY">ver / ocultar</button></div>
                            <div class="card-body collapsible-content d-none" id="IRRY">
                                <div class="d-flex flex-column">
                                    <div class="d-flex flex-column mb-5">
                                        <div class="d-flex flex-column">
                                            <div id="IRRRIPBY"></div>
                                        </div>
                                        <div class="d-flex justify-content-start">
                                            <button class="btn btn-primary mt-3" id="">Siguiente</button>
                                        </div>
                                    </div>
                                    <div class="d-flex flex-column mb-5">
                                        <div class="table-container" id="flexDesingT2X"></div>
                                        <div class="d-flex justify-content-start">
                                            <button class="btn btn-primary mt-3" id="IRRRIPBYBtn">Ver resultados</button>
                                        </div>
                                    </div>
                                    <div class="d-flex flex-column justify-content-center">
                                        <div class="table-container" id="IRRREPBY"></div>
                                    </div>
                                </div>
                            </div>
                        </div> -->
            </div>
          </div>
          <!-- -------end Irregularidad en altura------- -->
          <!-- -------Irregularidad masa o peso------- -->
          <div class="card card-info m-0 p-0">
            <div class="card-header d-flex justify-content-between">
              <h3 class="card-title">IRREGULARIDAD EN ALTURA | MASA O PESO / Según NTE E.030 - 2018</h3>
              <button class="collapsible-btn ml-auto" data-target="content3">ver / ocultar</button>
            </div>
            <!-- Tablas interiores -->
            <div class="card-body d-none m-0 p-0" class="collapsible-content" id="content3">
              <!-- Masa o peso -->
              <div class="card m-0">
                <div class="card-header d-flex justify-content-between"><button class="collapsible-btn ml-auto mr-5"
                    data-toggle="collapse" data-target="IRRMPSNTE030">ver / ocultar</button></div>
                <div class="card-body collapsible-content d-none" id="IRRMPSNTE030">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRMP"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- -------end Irregularidad masa o peso------- -->
          <!-- -------Irregularidad igv/dsr------- -->
          <div class="card card-info m-0 p-0">
            <div class="card-header d-flex justify-content-between">
              <h3 class="card-title">IRREGULARIDAD EN ALTURA | IGV, DSR / Según NTE E.030 - 2018</h3>
              <button class="collapsible-btn ml-auto" data-target="content4">ver / ocultar</button>
            </div>
            <!-- Tablas interiores -->
            <div class="card-body d-none m-0 p-0" class="collapsible-content" id="content4">
              <!-- G.V -->
              <div class="card m-0">
                <div class="card-header d-flex justify-content-between">Irregularidad Geometrica Vertical<button
                    class="collapsible-btn ml-auto mr-5" data-toggle="collapse" data-target="IGV">ver /
                    ocultar</button></div>
                <div class="card-body collapsible-content d-none mb-3" id="IGV">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRGVXY"></div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column">
                      <div class="d-flex flex-column">
                        <div id="IRRGVXXYY"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-header d-flex justify-content-between">Discontinuidad en los Sistemas
                  Resistentes<button class="collapsible-btn ml-auto mr-5" data-toggle="collapse"
                    data-target="DSV">ver / ocultar</button></div>
                <div class="card-body collapsible-content d-none mb-3" id="DSV">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="DSV1"></div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column">
                      <div class="d-flex flex-column">
                        <div id="DSV2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- -------end Irregularidad igv/dsr------- -->
          <!-- -------Irregularidad igv/dsr------- -->
          <div class="card card-info m-0 p-0">
            <div class="card-header d-flex justify-content-between">
              <h3 class="card-title">IRREGULARIDAD EN PLANTA | IGV, DSR / Según NTE E.030 - 2018</h3>
              <button class="collapsible-btn ml-auto" data-target="content5">ver / ocultar</button>
            </div>
            <!-- Tablas interiores -->
            <div class="card-body d-none m-0 p-0" class="collapsible-content" id="content5">
              <!-- G.V -->
              <div class="card m-0">
                <div class="card-header d-flex justify-content-between">Irregularidad Geometrica Vertical<button
                    class="collapsible-btn ml-auto mr-5" data-toggle="collapse" data-target="IRRPIGV">ver /
                    ocultar</button></div>
                <div class="card-body collapsible-content d-none mb-3" id="IRRPIGV">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRPGVXY"></div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column">
                      <div class="d-flex flex-column">
                        <div id="IRRPGVXYXY"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-header d-flex justify-content-between">Discontinuidad en los Sistemas
                  Resistentes<button class="collapsible-btn ml-auto mr-5" data-toggle="collapse"
                    data-target="IRRPDSV">ver / ocultar</button></div>
                <div class="card-body collapsible-content d-none mb-3" id="IRRPDSV">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRPDDA1"></div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column">
                      <div class="d-flex flex-column">
                        <div id="IRRPDDD1"></div>
                      </div>
                    </div>
                  </div>
                  <hr>
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRPDDA2"></div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column">
                      <div class="d-flex flex-column">
                        <div id="IRRPDDD2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- -------end Irregularidad igv/dsr------- -->
          <!-- -------Irregularidad snp------- -->
          <div class="card card-info m-0 p-0">
            <div class="card-header d-flex justify-content-between">
              <h3 class="card-title">IRREGULARIDAD EN PLANTA | Sistemas No Paralelos / Según NTE E.030 - 2018</h3>
              <button class="collapsible-btn ml-auto" data-target="content6">ver / ocultar</button>
            </div>
            <!-- Tablas interiores -->
            <div class="card-body d-none m-0 p-0" class="collapsible-content" id="content6">
              <!-- G.V -->
              <div class="card m-0">
                <div class="card-header d-flex justify-content-between"><button class="collapsible-btn ml-auto mr-5"
                    data-toggle="collapse" data-target="IRRPSNP">ver / ocultar</button></div>
                <div class="card-body collapsible-content d-none mb-3" id="IRRPSNP">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="SNPXY"></div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column">
                      <div class="d-flex flex-column">
                        <div id="SNPXYXY"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- -------end Irregularidad snp------- -->
          <!-- -------Irregularidad torsion------- -->
          <div class="card card-info m-0 p-0">
            <div class="card-header d-flex justify-content-between">
              <h3 class="card-title">IRREGULARIDAD EN PLANTA | TORSIÓN - Según NTE E.030 - 2018</h3>
              <button class="collapsible-btn ml-auto" data-target="content7">ver / ocultar</button>
            </div>
            <!-- Tablas interiores -->
            <div class="card-body d-none m-0 p-0" class="collapsible-content" id="content7">
              <!-- G.V -->
              <div class="card m-0">
                <div class="card-header d-flex justify-content-between"><button class="collapsible-btn ml-auto mr-5"
                    data-toggle="collapse" data-target="IRRPT">ver / ocultar</button></div>
                <div class="card-body collapsible-content d-none mb-3" id="IRRPT">
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column mb-5">
                      <div class="d-flex flex-column">
                        <div id="IRRTXX"></div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-column">
                      <div class="d-flex flex-column">
                        <div id="IRRTYY"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- -------end Irregularidad torsion------- -->
          <!-- -------Irregularidad Torsional------- -->
          <div class="card card-info m-0 p-0">
            <div class="card-header d-flex justify-content-between">
              <h3 class="card-title">IRREGULARIDAD EN PLANTA | Irregularidad Torsional</h3>
              <button class="collapsible-btn ml-auto" data-target="content8">ver / ocultar</button>
            </div>
            <!-- Tablas interiores -->
            <div class="card-body d-none m-0 p-0" class="collapsible-content" id="content8">
              <!-- G.V -->
              <div class="card m-0">
                <div class="card-header d-flex justify-content-between"><button class="collapsible-btn ml-auto mr-5"
                    data-toggle="collapse" data-target="IRRTORSION">ver / ocultar</button></div>
                <div class="card-body collapsible-content d-none mb-3" id="IRRTORSION">
                  <div class="d-flex flex-column">
                    <div class="col-md-12 justify-content-center">
                      <div class="input-group w-50 mx-auto mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text">deriva=</span>
                        </div>
                        <input class="form-control" id="deriva" name="deriva" type="number" value="0,012" />
                      </div>
                      <div class="input-group w-50 mx-auto mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text">D1=</span>
                        </div>
                        <input class="form-control" id="d1" name="" type="number" value="1,962" />
                        <div class="input-group-prepend">
                          <span class="input-group-text">mm</span>
                        </div>
                      </div>
                      <div class="input-group w-50 mx-auto mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text">D2=</span>
                        </div>
                        <input class="form-control" id="d2" name="B5" type="number" value="2,04" />
                        <div class="input-group-prepend">
                          <span class="input-group-text">mm</span>
                        </div>
                      </div>
                      <div class="input-group w-50 mx-auto mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text">Dprom</span>
                        </div>
                        <div class="input-group-prepend">
                          <span class="input-group-text">&gt;</span>
                        </div>
                        <div class="input-group-prepend">
                          <span class="input-group-text">0,5D permisible</span>
                        </div>
                      </div>
                      <div class="input-group w-50 mx-auto mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="dprom">2.001</span>
                        </div>
                        <div class="input-group-prepend">
                          <span class="input-group-text">&gt;</span>
                        </div>
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="permisible">0.006</span>
                        </div>
                      </div>
                      <div class="input-group w-50 mx-auto mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text">Se debe verificar irregularidad torsional</span>
                        </div>
                        <div class="input-group mx-auto mb-3 w-80">
                          <div class="input-group-prepend">
                            <span class="input-group-text">Dmax</span>
                          </div>
                          <div class="input-group-prepend">
                            <span class="input-group-text">&gt;</span>
                          </div>
                          <div class="input-group-prepend">
                            <span class="input-group-text">1,3D promedio</span>
                          </div>
                        </div>
                        <div class="input-group w-50 mx-auto mb-3">
                          <div class="input-group-prepend">
                            <span class="input-group-text" id="dmax">2.001</span>
                          </div>
                          <div class="input-group-prepend">
                            <span class="input-group-text">&gt;</span>
                          </div>
                          <div class="input-group-prepend">
                            <span class="input-group-text" id="torsional">0.006</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- -------end Irregularidad torsion------- -->
          </div>
        </div>
      </section>
    </div>
    <!-- Option 1: jQuery and Bootstrap Bundle (includes Popper) -->
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"
      integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/hyperformula/dist/hyperformula.full.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js"></script>
    @vite('resources/js/irregularidades.js')
  </div>
</body>

</html>
