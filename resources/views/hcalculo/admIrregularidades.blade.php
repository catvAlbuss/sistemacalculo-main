<!-- JHACK -->
<x-calc-layout title="Irregularidades Estructurales">
    <!DOCTYPE html>
    <html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Bootstrap CSS -->
        {{-- <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N" crossorigin="anonymous">
  <link href="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css" rel="stylesheet" /> --}}
        <title>{{ config('app.name', 'Laravel') }}</title>

        <link type="image/x-icon" href="{{ url('/assets/img/logo_rizabalAsociados.png') }}" rel="icon">
    </head>

    <body class="hold-transition sidebar-mini layout-fixed small">
        <div class="wrapper">
            <div class="content-wrapper">
                <!-- Content Header (Page header) -->
                <!-- <section class="content-header">
                    <div class="container-fluid">
                        <div class="row mb-2">
                            <div class="col-sm-6">
                                <h1>IRREGULARIDADES ESTRUCTURALES</h1>
                            </div>
                            <div class="col-sm-6">
                                <ol class="breadcrumb float-sm-right">
                                    <li class="breadcrumb-item"><a href="{{ route('dashboard') }}">Inicio</a></li>
                                    <li class="breadcrumb-item active">IRREGULARIDADES ESTRUCTURALES</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section> -->
                <section class="content">
                    <div class="container-fluid">
                        <!-- -------Irregularidad en altura------- -->
                        <div class="card card-info m-0 p-0">
                            <!-- <div class="card-header d-flex justify-content-between">
                                <h3 class="card-title">IRREGULARIDAD EN ALTURA | IA. "K", "V"</h3>
                                <button class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" data-target="content2">ver / ocultar</button>
                                <button
                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                    data-target="content2" onclick="toggleContent('content2')">
                                    ver / ocultar
                                </button>
                            </div> -->
                            <!-- Tablas interiores -->
                            <div class="card-body d-none m-0 p-0" class="collapsible-content" id="content2">
                                <!-- Tabla Análisis en Dirección "x" -->
                                <!-- <div class="card m-0" id="IRRRIPBXDiv">
                                    <div class="card-header d-flex justify-content-between">Análisis en dirección "X"
                                        <button class="collapsible-btn ml-auto mr-5" data-target="IRRX">ver /
                                            ocultar</button>
                                    </div>
                                    <div class="card-body collapsible-content d-none" id="IRRX">
                                        <div class="d-flex flex-column">

                                            <div class="d-flex flex-column mb-5">
                                                <div class="d-flex flex-column">
                                                    <div id="IRRRIPBX"></div>
                                                </div>
                                            </div>

                                            <div class="d-flex flex-column mb-5">
                                                <div class="d-flex justify-content-start">
                                                    <button class="btn btn-primary mt-3" id="IRRRIPBXBtn">Ver
                                                        resultados</button>

                                                    <button class="btn btn-primary ml-3 mt-3" id="IRRRIPBXNext"
                                                        data-target="IRRX">Siguiente</button>

                                                </div>
                                            </div>

                                            <div class="d-flex flex-column justify-content-center">
                                                <div class="table-container" id="IRRREPBX"></div>
                                            </div>

                                        </div>
                                    </div>
                                    <div class="mt-2 flex flex-wrap gap-2 text-xs">
                                        <a href="#sec-ia-kv-x"
                                            class="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 font-medium text-sky-700">Altura
                                            X</a>
                                        <a href="#sec-ia-kv-y"
                                            class="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700">Altura
                                            Y</a>
                                        <a href="#sec-ip-igv-x"
                                            class="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 font-medium text-sky-700">Planta
                                            X</a>
                                        <a href="#sec-ip-igv-y"
                                            class="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700">Planta
                                            Y</a>
                                        <a href="#sec-ip-it-xx"
                                            class="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 font-medium text-sky-700">Torsional
                                            XX</a>
                                        <a href="#sec-ip-it-yy"
                                            class="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700">Torsional
                                            YY</a>
                                    </div>
                                </div> -->

                                <div class="mt-2 space-y-2">

                                    <!-- IRREGULARIDAD EN ALTURA | IA. "K", "V" -->
                                    <section id="sec-ia-kv"
                                        class="scroll-mt-24 relative overflow-hidden rounded-3xl border border-sky-100 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm mx-70">

                                        <!-- Fondo decorativo -->
                                        <div class="pointer-events-none absolute inset-0">
                                            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl"></div>
                                            <div class="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl"></div>
                                            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                                        </div>

                                        <!-- HEADER -->
                                        <div
                                            class="relative flex items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50 to-indigo-50 px-6 py-5">
                                            <div class="flex items-start gap-4">
                                                <div
                                                    class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-600" fill="none"
                                                        viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                                            d="M8 17l4-4 4 4M8 7l4 4 4-4" />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <h2 class="text-lg font-bold tracking-tight text-slate-800 md:text-xl">
                                                        IRREGULARIDAD EN ALTURA
                                                    </h2>
                                                    <p class="mt-1 text-sm text-slate-500">
                                                        IA. "K", "V" | Evaluación por dirección estructural según NTE E.030
                                                    </p>
                                                </div>

                                            </div>

                                            <button type="button" onclick="toggleSection('content-ia-kv', this)"
                                                class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-sky-600" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M19 9l-7 7-7-7" />
                                                </svg>
                                                ver / ocultar
                                            </button>
                                        </div>

                                        <!-- CONTENIDO -->
                                        <div id="content-ia-kv" class="hidden relative p-6 space-y-6">

                                            <!-- DIRECCION X -->
                                            <div id="sec-ia-kv-x" class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                <div class="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                            Dirección X
                                                        </h3>
                                                        <p class="mt-1 text-xs text-slate-500">
                                                            Análisis de irregularidad en altura para la dirección X.
                                                        </p>
                                                    </div>

                                                    <!-- <div
                                                        class="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 md:block">
                                                        Análisis dinámico
                                                    </div> -->
                                                </div>

                                                <div id="IRRRIPBXDiv" class="mt-3">
                                                    <div class="mb-4 flex flex-wrap gap-3 justify-between">
                                                        <div>
                                                            <button id="IRRRIPBXBtn" type="button"
                                                                class="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 hover:shadow-md">
                                                                Verificar Resistencia
                                                            </button>

                                                            <button id="IRRRIPBXNext" type="button"
                                                                class="rounded-xl bg-slate-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md">
                                                                Versión Extrema
                                                            </button>
                                                        </div>
                                                        <button
                                                            data-capture="IRRRIPBX"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>

                                                    <div id="wrap-IRRRIPBX" class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRRIPBX" class="handsontable-container"></div>
                                                    </div>

                                                </div>

                                                <!-- VERSION EXTREMA -->
                                                <div id="IRRRIPBXEDiv" class="hidden mt-5">
                                                    <div class="mb-4 flex flex-wrap gap-3 justify-between">
                                                        <button id="IRRRIPBXENext" type="button"
                                                            class="rounded-xl bg-slate-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md">
                                                            Volver a Versión Base
                                                        </button>
                                                        <button
                                                            data-capture="IRRRIPBXE"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>

                                                    <div id="wrap-IRRRIPBXE" class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRRIPBXE" class="handsontable-container"></div>
                                                    </div>
                                                </div>

                                                <!-- RESULTADOS -->
                                                <div id="result-IRRREPBX" class="hidden mt-5 space-y-4">
                                                    <div class="mb-4 flex flex-wrap gap-3 justify-end">
                                                        <button
                                                            data-capture="IRRREPBX"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>

                                                    <div id="wrap-IRRREPBX" class=" overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRREPBX" class="handsontable-container"></div>
                                                    </div>

                                                    <!-- <div id="wrap-IRRREPBXE" class="hidden overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRREPBXE" class="handsontable-container"></div>
                                                    </div> -->
                                                </div>

                                                <div class="hidden mt-5 space-y-4">
                                                    <div id="wrap-IRRREPBXE" class="hidden overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRREPBXE" class="handsontable-container"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- DIRECCION Y -->
                                            <div id="sec-ia-kv-y" class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                <div class="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                                                            Dirección Y
                                                        </h3>
                                                        <p class="mt-1 text-xs text-slate-500">
                                                            Análisis de irregularidad en altura para la dirección Y.
                                                        </p>
                                                    </div>
                                                    <!-- <div
                                                        class="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 md:block">
                                                        Análisis dinámico
                                                    </div> -->
                                                </div>

                                                <div id="IRRRIPBYDiv" class="mt-3">
                                                    <div class="mb-4 flex flex-wrap gap-3 justify-between">
                                                        <div>
                                                            <button id="IRRRIPBYBtn" type="button"
                                                                class="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 hover:shadow-md">
                                                                Verificar Resistencia
                                                            </button>

                                                            <button id="IRRRIPBYNext" type="button"
                                                                class="rounded-xl bg-slate-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md">
                                                                Versión Extrema
                                                            </button>
                                                        </div>
                                                        <button
                                                            data-capture="IRRRIPBY"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>

                                                    <div id="wrap-IRRRIPBY" class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRRIPBY" class="handsontable-container"></div>
                                                    </div>
                                                </div>

                                                <!-- VERSION EXTREMA -->
                                                <div id="IRRRIPBYEDiv" class="hidden mt-5">
                                                    <div class="mb-4 flex flex-wrap gap-3 justify-between">
                                                        <button id="IRRRIPBYENext" type="button"
                                                            class="rounded-xl bg-slate-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md">
                                                            Volver a Versión Base
                                                        </button>
                                                        <button
                                                            data-capture="IRRRIPBYE"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>

                                                    <div id="wrap-IRRRIPBYE" class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRRIPBYE" class="handsontable-container"></div>
                                                    </div>

                                                </div>

                                                <!-- RESULTADOS -->
                                                <div id="result-IRRREPBY" class="hidden mt-5 space-y-4">
                                                    <div class="mb-4 flex flex-wrap gap-3 justify-end">
                                                        <button
                                                            data-capture="IRRREPBY"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>

                                                    <div id="wrap-IRRREPBY" class=" overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRREPBY" class="handsontable-container"></div>
                                                    </div>
                                                </div>

                                                <!-- RESULTADOS EXTREMO-->
                                                <div class="hidden mt-5 space-y-4">
                                                    <!-- <div id="wrap-IRRREPBY" class=" overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRREPBY" class="handsontable-container"></div>
                                                    </div> -->

                                                    <div id="wrap-IRRREPBYE" class="hidden overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRREPBYE" class="handsontable-container"></div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </section>

                                    <!-- IRREGULARIDAD EN ALTURA | MASA O PESO / Segun NTE E.030 - 2018 -->
                                    <section id="sec-ia-masa"
                                        class="scroll-mt-24 relative overflow-hidden rounded-3xl border border-sky-100 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm mx-70">

                                        <!-- Fondo decorativo -->
                                        <div class="pointer-events-none absolute inset-0">
                                            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl"></div>
                                            <div class="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl"></div>
                                            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                                        </div>

                                        <!-- HEADER -->
                                        <div class="relative flex items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50 to-indigo-50 px-6 py-5">
                                            <div class="flex items-start gap-4">
                                                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                                            d="M9 17v-6m3 6V7m3 10v-3m-9 7h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <h2 class="text-lg font-bold tracking-tight text-slate-800 md:text-xl">
                                                        IRREGULARIDAD EN ALTURA
                                                    </h2>
                                                    <p class="mt-1 text-sm text-slate-500">
                                                        MASA O PESO | Según NTE E.030 - 2018
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onclick="toggleSection('content-ia-masa', this)"
                                                class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M19 9l-7 7-7-7" />
                                                </svg>
                                                ver / ocultar
                                            </button>
                                        </div>

                                        <!-- CONTENIDO -->
                                        <div id="content-ia-masa" class="hidden relative p-6">
                                            <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                <div class="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                            Resultados del análisis
                                                        </h3>
                                                        <p class="mt-1 text-xs text-slate-500">
                                                            Evaluación de irregularidad de masa o peso por nivel estructural.
                                                        </p>
                                                    </div>

                                                    <!-- <div class="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 md:block">
                                                        Tabla dinámica
                                                    </div> -->
                                                    <button
                                                        data-capture="IRRMP"
                                                        class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                        Capturar IMG
                                                    </button>
                                                </div>

                                                <!-- <div class="w-full overflow-x-auto"> -->
                                                <!-- <div class="mx-auto w-max"> -->
                                                <div id="wrap-IRRMP" class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                    <div id="IRRMP" class="handsontable-container mt-1"></div>
                                                </div>
                                                <!-- </div> -->
                                                <!-- </div> -->


                                            </div>
                                        </div>
                                    </section>

                                    <!-- IRREGULARIDAD EN ALTURA | IGV, DSR -->
                                    <section id="sec-ia-igv"
                                        class="scroll-mt-24 relative overflow-hidden rounded-3xl border border-sky-100 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm mx-70">

                                        <!-- Fondo decorativo -->
                                        <div class="pointer-events-none absolute inset-0">
                                            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl"></div>
                                            <div class="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl"></div>
                                            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                                        </div>

                                        <!-- HEADER -->
                                        <div class="relative flex items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50 to-indigo-50 px-6 py-5">

                                            <div class="flex items-start gap-4">
                                                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                                            d="M9 17v-6m3 6V7m3 10v-3m-9 7h12" />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <h2 class="text-lg font-bold tracking-tight text-slate-800 md:text-xl">
                                                        IRREGULARIDAD EN ALTURA
                                                    </h2>
                                                    <p class="mt-1 text-sm text-slate-500">
                                                        IGV, DSR | Según NTE E.030 - 2018
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onclick="toggleSection('content-ia-igv', this)"
                                                class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M19 9l-7 7-7-7" />
                                                </svg>
                                                ver / ocultar
                                            </button>
                                        </div>

                                        <!-- CONTENIDO -->
                                        <div id="content-ia-igv" class="hidden relative p-6">

                                            <div class="space-y-6">

                                                <!-- BLOQUE 1 -->
                                                <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                    <div class="mb-4 flex items-center justify-between">
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                            Irregularidad Geometrica Vertical
                                                        </h3>
                                                        <!-- <span class="text-xs text-slate-500">Tabla dinámica</span> -->
                                                        <button
                                                            data-capture="IRRGV"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>
                                                    <div id="wrap-IRRGV" class="space-y-4">

                                                        <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                            <div id="IRRGVXY" class="handsontable-container"></div>
                                                        </div>

                                                        <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                            <div id="IRRGVXXYY" class="handsontable-container"></div>
                                                        </div>

                                                    </div>
                                                </div>

                                                <!-- BLOQUE 2 -->
                                                <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                    <div class="mb-4 flex items-center justify-between">
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                            Discontinuidad en los Sistemas Resistentes
                                                        </h3>
                                                        <!-- <span class="text-xs text-slate-500">Tabla dinámica</span> -->
                                                        <button
                                                            data-capture="DSV"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>

                                                    <!-- <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRGVXXYY" class="handsontable-container"></div>
                                                    </div> -->
                                                    <div id="wrap-DSV" class="space-y-4">

                                                        <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                            <div id="DSV1" class="handsontable-container"></div>
                                                        </div>

                                                        <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                            <div id="DSV2" class="handsontable-container"></div>
                                                        </div>

                                                    </div>
                                                </div>

                                                <!-- BLOQUE 3 -->
                                                <!-- <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                    <div class="mb-4 flex items-center justify-between">
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                                                            Desplazamientos DSR - Caso 1
                                                        </h3>
                                                        <span class="text-xs text-slate-500">Tabla dinámica</span>
                                                    </div>

                                                    <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="DSV1" class="handsontable-container"></div>
                                                    </div>
                                                </div> -->

                                                <!-- BLOQUE 4 -->
                                                <!-- <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                    <div class="mb-4 flex items-center justify-between">
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                                                            Desplazamientos DSR - Caso 2
                                                        </h3>
                                                        <span class="text-xs text-slate-500">Tabla dinámica</span>
                                                    </div>

                                                    <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="DSV2" class="handsontable-container"></div>
                                                    </div>
                                                </div> -->

                                            </div>

                                        </div>
                                    </section>

                                    <!-- IRREGULARIDAD EN PLANTA | IGV, DSR / Segun NTE E.030 - 2018 -->
                                    <section id="sec-ip-igv"
                                        class="scroll-mt-24 relative overflow-hidden rounded-3xl border border-sky-100 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm mx-70">

                                        <!-- Fondo decorativo -->
                                        <div class="pointer-events-none absolute inset-0">
                                            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl"></div>
                                            <div class="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl"></div>
                                            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                                        </div>

                                        <!-- HEADER -->
                                        <div class="relative flex items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50 to-indigo-50 px-6 py-5">
                                            <div class="flex items-start gap-4">
                                                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                                            d="M3 7h18M6 12h12M9 17h6" />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <h2 class="text-lg font-bold tracking-tight text-slate-800 md:text-xl">
                                                        IRREGULARIDAD EN PLANTA
                                                    </h2>
                                                    <p class="mt-1 text-sm text-slate-500">
                                                        IGV, DSR | Según NTE E.030 - 2018
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onclick="toggleSection('content-ip-igv', this)"
                                                class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M19 9l-7 7-7-7" />
                                                </svg>
                                                ver / ocultar
                                            </button>
                                        </div>

                                        <!-- CONTENIDO -->
                                        <div id="content-ip-igv" class="hidden relative p-6 space-y-6">

                                            <!-- SUBSECCION Irregularidad Geometrica Vertical -->
                                            <div id="sec-ip-igv-x"
                                                class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                <div class="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                            Irregularidad Geometrica Vertical
                                                        </h3>
                                                        <p class="mt-1 text-xs text-slate-500">
                                                            Presenta Irregularidad
                                                            Si: a/A > 0.20
                                                        </p>
                                                    </div>

                                                    <!-- <div class="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 md:block">
                                                        Tablas de análisis
                                                    </div> -->
                                                    <button
                                                        data-capture="IRRPGVXY"
                                                        class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                        Capturar IMG
                                                    </button>
                                                </div>

                                                <div id="wrap-IRRPGVXY" class="space-y-4">

                                                    <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRPGVXY" class="handsontable-container mt-1"></div>
                                                    </div>

                                                    <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRPGVXYXY" class="handsontable-container mt-1"></div>
                                                    </div>

                                                    <!-- <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRPDDA1" class="handsontable-container mt-1"></div>
                                                    </div>

                                                    <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRPDDD1" class="handsontable-container mt-1"></div>
                                                    </div> -->
                                                </div>
                                            </div>

                                            <!-- SUBSECCION Discontinuidad en los Sistemas Resistentes -->
                                            <div id="sec-ip-igv-y"
                                                class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                <div class="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                            Discontinuidad del Diafragma
                                                        </h3>
                                                        <!-- <p class="mt-1 text-xs text-slate-500">
                                                            Evaluación de irregularidad geométrica vertical y desplazamientos en la dirección Y.
                                                        </p> -->
                                                    </div>

                                                    <!-- <div class="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 md:block">
                                                        Tablas de análisis
                                                    </div> -->
                                                    <button
                                                        data-capture="IRRPDD"
                                                        class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                        Capturar IMG
                                                    </button>
                                                </div>

                                                <div id="wrap-IRRPDD" class="space-y-4">
                                                    <!-- <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="IRRPGVXYXY" class="handsontable-container mt-1"></div>
                                                    </div> -->

                                                    <div class="space-y-4 overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <p class="mt-1 text-xs text-slate-500">
                                                            : Area Construida (Techada)
                                                        </p>
                                                        <!-- <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2"> -->
                                                        <div id="IRRPDDA1" class="handsontable-container mt-1"></div>
                                                        <!-- </div> -->

                                                        <!-- <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2"> -->
                                                        <div id="IRRPDDD1" class="handsontable-container mt-1"></div>
                                                        <!-- </div> -->
                                                    </div>

                                                    <div class="space-y-4 overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <!-- <p class="mt-1 text-xs text-slate-500">
                                                            : Area Construida (Techada)
                                                        </p> -->
                                                        <!-- <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2"> -->
                                                        <div id="IRRPDDA2" class="handsontable-container mt-1"></div>
                                                        <!-- </div> -->

                                                        <!-- <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2"> -->
                                                        <div id="IRRPDDD2" class="handsontable-container mt-1"></div>
                                                        <!-- </div> -->
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    </section>

                                    <!-- IRREGULARIDAD EN PLANTA | Sistemas No Paralelos / Segun NTE E.030 - 2018 -->
                                    <section id="sec-ip-snp"
                                        class="scroll-mt-24 relative overflow-hidden rounded-3xl border border-sky-100 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm mx-70">

                                        <!-- Fondo decorativo -->
                                        <div class="pointer-events-none absolute inset-0">
                                            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl"></div>
                                            <div class="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl"></div>
                                            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                                        </div>

                                        <!-- HEADER -->
                                        <div class="relative flex items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50 to-indigo-50 px-6 py-5">

                                            <div class="flex items-start gap-4">
                                                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                                            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6v2m0 16v2m8-10h2M2 12H4m12.364-6.364l1.414 1.414M4.222 19.778l1.414-1.414m0-12.728L4.222 6.05m12.728 12.728l-1.414-1.414" />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <h2 class="text-lg font-bold tracking-tight text-slate-800 md:text-xl">
                                                        IRREGULARIDAD EN PLANTA
                                                    </h2>
                                                    <p class="mt-1 text-sm text-slate-500">
                                                        Sistemas No Paralelos | Según NTE E.030 - 2018
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onclick="toggleSection('content-ip-snp', this)"
                                                class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M19 9l-7 7-7-7" />
                                                </svg>
                                                ver / ocultar
                                            </button>
                                        </div>

                                        <!-- CONTENIDO -->
                                        <div id="content-ip-snp" class="hidden relative p-6">

                                            <div class="space-y-6">

                                                <!-- BLOQUE 1 -->
                                                <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                    <div class="mb-4 flex items-center justify-between">
                                                        <div>
                                                            <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                                Sistemas No Paralelos
                                                            </h3>
                                                            <p class="mt-1 text-xs text-slate-500">
                                                                Si el angulo entre ejes no paralelos
                                                                es mayor de 30°
                                                                Presenta Irregularidad
                                                            </p>
                                                        </div>
                                                        <!-- <span class="text-xs text-slate-500">Tabla dinámica</span> -->

                                                        <button
                                                            data-capture="SNPXY"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>

                                                    <div id="wrap-SNPXY" class="space-y-4">
                                                        <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                            <div id="SNPXY" class="handsontable-container"></div>
                                                        </div>
                                                        <div class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                            <div id="SNPXYXY" class="handsontable-container"></div>
                                                        </div>
                                                    </div>

                                                    <!-- <div id="wrap-SNPXY" class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="SNPXY" class="handsontable-container"></div>
                                                    </div> -->
                                                </div>

                                                <!-- BLOQUE 2 -->
                                                <!-- <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                    <div class="mb-4 flex items-center justify-between">
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                                                            Caso Combinado
                                                        </h3>
                                                        <span class="text-xs text-slate-500">Tabla dinámica</span>
                                                        <button
                                                            data-capture="SNPXYXY"
                                                            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                            Capturar IMG
                                                        </button>
                                                    </div>

                                                    <div id="wrap-SNPXYXY" class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                        <div id="SNPXYXY" class="handsontable-container"></div>
                                                    </div>
                                                </div> -->

                                            </div>

                                        </div>
                                    </section>

                                    <!-- IRREGULARIDAD EN PLANTA | TORSION - Segun NTE E.030 - 2018 -->
                                    <section id="sec-ip-it"
                                        class="scroll-mt-24 relative overflow-hidden rounded-3xl border border-sky-100 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm mx-70">

                                        <!-- Fondo decorativo -->
                                        <div class="pointer-events-none absolute inset-0">
                                            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl"></div>
                                            <div class="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl"></div>
                                            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                                        </div>

                                        <!-- HEADER -->
                                        <div class="relative flex items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50 to-indigo-50 px-6 py-5">
                                            <div class="flex items-start gap-4">
                                                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                                            d="M4 7h16M4 12h16M4 17h16" />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <h2 class="text-lg font-bold tracking-tight text-slate-800 md:text-xl">
                                                        IRREGULARIDAD EN PLANTA (lp)
                                                    </h2>
                                                    <p class="mt-1 text-sm text-slate-500">
                                                        TORSION | Según NTE E.030 - 2018
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onclick="toggleSection('content-ip-it', this)"
                                                class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M19 9l-7 7-7-7" />
                                                </svg>
                                                ver / ocultar
                                            </button>
                                        </div>

                                        <!-- CONTENIDO -->
                                        <div id="content-ip-it" class="hidden relative p-6 space-y-6">

                                            <!-- XX -->
                                            <div id="sec-ip-it-xx"
                                                class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                <div class="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                            Irregularidad Torsional XX
                                                        </h3>
                                                        <p class="mt-1 text-xs text-slate-500">
                                                            Presenta Irregularidad
                                                            No aplica en azoteas ni Sotanos
                                                        </p>
                                                    </div>

                                                    <!-- <div class="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 md:block">
                                                        Tabla dinámica
                                                    </div> -->

                                                    <button
                                                        data-capture="IRRTXX"
                                                        class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                        Capturar IMG
                                                    </button>
                                                </div>

                                                <div id="wrap-IRRTXX" class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                    <div id="IRRTXX" class="handsontable-container mt-1"></div>
                                                </div>
                                            </div>

                                            <!-- YY -->
                                            <div id="sec-ip-it-yy"
                                                class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                <div class="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                            Irregularidad Torsional YY
                                                        </h3>
                                                        <p class="mt-1 text-xs text-slate-500">
                                                            Presenta Irregularidad
                                                            No aplica en azoteas ni Sotanos
                                                        </p>
                                                    </div>

                                                    <!-- <div class="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 md:block">
                                                        Tabla dinámica
                                                    </div> -->
                                                    <button
                                                        data-capture="IRRTYY"
                                                        class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                        Capturar IMG
                                                    </button>
                                                </div>

                                                <div id="wrap-IRRTYY" class="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
                                                    <div id="IRRTYY" class="handsontable-container mt-1"></div>
                                                </div>
                                            </div>

                                        </div>
                                    </section>

                                    <!-- IRREGULARIDAD EN PLANTA | Irregularidad Torsional -->
                                    <section id="sec-ip-torsion"
                                        class="scroll-mt-24 relative overflow-hidden rounded-3xl border border-sky-100 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm mx-70">

                                        <!-- Fondo decorativo -->
                                        <div class="pointer-events-none absolute inset-0">
                                            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl"></div>
                                            <div class="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl"></div>
                                            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                                        </div>

                                        <!-- HEADER -->
                                        <div class="relative flex items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50 to-indigo-50 px-6 py-5">
                                            <div class="flex items-start gap-4">
                                                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                                            d="M8 9l4-4 4 4m0 6l-4 4-4-4M3 12h18" />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <h2 class="text-lg font-bold tracking-tight text-slate-800 md:text-xl">
                                                        IRREGULARIDAD TORSIONAL
                                                    </h2>
                                                    <p class="mt-1 text-sm text-slate-500">
                                                        Irregularidad Torsional
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onclick="toggleSection('content-ip-torsion', this)"
                                                class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M19 9l-7 7-7-7" />
                                                </svg>
                                                ver / ocultar
                                            </button>
                                        </div>

                                        <!-- CONTENIDO -->
                                        <div id="content-ip-torsion" class="hidden relative p-6 space-y-6">
                                            <div class="space-y-6">

                                                <div class="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                            Irregularidad Torsional
                                                        </h3>
                                                        <p class="mt-1 text-xs text-slate-500">
                                                            Se debe verificar irregularidad torsional
                                                        </p>
                                                    </div>

                                                    <!-- <div class="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 md:block">
                                                        Tabla dinámica
                                                    </div> -->

                                                    <button
                                                        data-capture="D"
                                                        class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100">
                                                        Capturar IMG
                                                    </button>
                                                </div>

                                                <div id="wrap-D" class="space-y-4 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-inner">
                                                    <!-- Panel de entrada -->
                                                    <div>

                                                        <!-- <div class="flex items-center justify-between hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 md:block">
                                                        Cálculo manual
                                                        </div> -->

                                                        <div class="mb-4 flex items-center justify-between gap-3">
                                                            <div>
                                                                <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                                    Datos de entrada
                                                                </h3>
                                                                <p class="mt-1 text-xs text-slate-500">
                                                                    Ingrese los parámetros para verificar la torsión en planta.
                                                                </p>
                                                            </div>

                                                            <!-- <div class="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 md:block">
                                                            Cálculo manual
                                                        </div> -->
                                                        </div>

                                                        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                            <label class="block rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                                                <span class="text-xs font-semibold uppercase tracking-wide text-slate-600">Deriva</span>
                                                                <input id="deriva" type="number" step="any"
                                                                    class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                                                            </label>

                                                            <label class="block rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                                                <span class="text-xs font-semibold uppercase tracking-wide text-slate-600">d1</span>
                                                                <input id="d1" type="number" step="any"
                                                                    class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                                                            </label>

                                                            <label class="block rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                                                <span class="text-xs font-semibold uppercase tracking-wide text-slate-600">d2</span>
                                                                <input id="d2" type="number" step="any"
                                                                    class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <!-- Panel de resultados -->
                                                    <div>
                                                        <div class="mb-4 flex items-center justify-between gap-3">
                                                            <div>
                                                                <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-700">
                                                                    Resultados
                                                                </h3>
                                                                <p class="mt-1 text-xs text-slate-500">
                                                                    Resumen de valores obtenidos para la verificación torsional.
                                                                </p>
                                                            </div>

                                                            <!-- <div class="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 md:block">
                                                            Respuesta automática
                                                        </div> -->
                                                        </div>

                                                        <div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                                                            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                                                <span class="block text-xs font-medium uppercase tracking-wide text-slate-500">dprom</span>
                                                                <span id="dprom" class="mt-2 block text-lg font-bold text-slate-800">0.000</span>
                                                            </div>

                                                            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                                                <span class="block text-xs font-medium uppercase tracking-wide text-slate-500">Permisible</span>
                                                                <span id="permisible" class="mt-2 block text-lg font-bold text-slate-800">0.000</span>
                                                            </div>

                                                            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                                                <span class="block text-xs font-medium uppercase tracking-wide text-slate-500">dmax</span>
                                                                <span id="dmax" class="mt-2 block text-lg font-bold text-slate-800">0.00</span>
                                                            </div>

                                                            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                                                <span class="block text-xs font-medium uppercase tracking-wide text-slate-500">1.3 x dprom</span>
                                                                <span id="torsional" class="mt-2 block text-lg font-bold text-slate-800">0.000</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </section>

                                </div>
                            </div>
                        </div>
                        <script>
                            function toggleSection(id, btn = null) {
                                const el = document.getElementById(id);
                                if (!el) return;

                                el.classList.toggle('hidden');
                            }

                            // PARA MOSTRAR VERSION EXTREMA X
                            document.addEventListener("DOMContentLoaded", () => {
                                const baseX = document.getElementById("IRRRIPBXDiv");
                                const extremaX = document.getElementById("IRRRIPBXEDiv");
                                const btnExtremaX = document.getElementById("IRRRIPBXNext");
                                const btnBaseX = document.getElementById("IRRRIPBXENext");

                                if (btnExtremaX && baseX && extremaX) {
                                    btnExtremaX.addEventListener("click", () => {
                                        baseX.classList.add("hidden");
                                        extremaX.classList.remove("hidden");
                                    });
                                }

                                if (btnBaseX && baseX && extremaX) {
                                    btnBaseX.addEventListener("click", () => {
                                        extremaX.classList.add("hidden");
                                        baseX.classList.remove("hidden");
                                    });
                                }
                            });
                            // PARA MOSTRAR VERSION EXTREMA Y
                            document.addEventListener("DOMContentLoaded", () => {
                                const baseY = document.getElementById("IRRRIPBYDiv");
                                const extremaY = document.getElementById("IRRRIPBYEDiv");
                                const btnExtremaY = document.getElementById("IRRRIPBYNext");
                                const btnBaseY = document.getElementById("IRRRIPBYENext");

                                if (btnExtremaY && baseY && extremaY) {
                                    btnExtremaY.addEventListener("click", () => {
                                        baseY.classList.add("hidden");
                                        extremaY.classList.remove("hidden");
                                    });
                                }

                                if (btnBaseY && baseY && extremaY) {
                                    btnBaseY.addEventListener("click", () => {
                                        extremaY.classList.add("hidden");
                                        baseY.classList.remove("hidden");
                                    });
                                }
                            });
                        </script>
                    </div>
                </section>
            </div>
        </div>

        @pushOnce('scripts')
        <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"
            integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous">
        </script>
        <script src="https://cdn.jsdelivr.net/npm/hyperformula/dist/hyperformula.full.min.js"></script>
        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js"></script>
        @vite('resources/js/irregularidades.js')
        @endpushOnce
        <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
</x-calc-layout>

<style>
    .handsontable th,
    .handsontable .htCore th,
    .ht_clone_top .htCore th {
        vertical-align: middle !important;
        line-height: 1.35 !important;
        padding-top: 10px !important;
        padding-bottom: 10px !important;
        height: auto !important;
        min-height: 38px !important;
        overflow: visible !important;
    }

    .ht_clone_top thead tr:first-child th {
        min-height: 44px !important;
        font-weight: 600 !important;
    }

    .ht_clone_top thead tr:nth-child(2) th,
    .ht_clone_top thead tr:nth-child(3) th {
        min-height: 36px !important;
    }
</style>