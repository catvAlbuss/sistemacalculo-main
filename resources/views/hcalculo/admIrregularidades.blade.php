<x-calc-layout title="Diseno irregularidades">
    @pushOnce('styles')
        <link href="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css" rel="stylesheet" />
    @endpushOnce

    <div class="py-2">
        <div class="container mx-auto px-2 max-w-full mt-2">
            <div class="sticky top-2 z-30 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
                <div class="flex flex-wrap gap-2 text-sm">
                    <a href="#sec-ia-kv"
                        class="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200">IA.
                        "K" y "V"</a>
                    <a href="#sec-ia-masa"
                        class="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200">IA.
                        Masa o Peso</a>
                    <a href="#sec-ia-igv"
                        class="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200">IA.
                        IGV, DSR</a>
                    <a href="#sec-ip-igv"
                        class="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200">IP.
                        IGV, DSR</a>
                    <a href="#sec-ip-snp"
                        class="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200">IP.
                        Sistemas No Paralelos</a>
                    <a href="#sec-ip-torsion"
                        class="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200">IP.
                        Torsion</a>
                    <a href="#sec-ip-it"
                        class="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200">IP.
                        Irregularidad Torsional</a>
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
            </div>

            <div class="mt-2 space-y-2">
                <section id="sec-ia-kv" class="scroll-mt-24 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h2 class="text-lg font-semibold text-slate-800">IRREGULARIDAD EN ALTURA | IA. "K", "V"</h2>

                    <div id="sec-ia-kv-x" class="mt-4 rounded-lg border border-slate-200 bg-white p-3 scroll-mt-24">
                        <h3 class="text-sm font-semibold text-sky-700">Direccion X</h3>

                        <div id="IRRRIPBXDiv" class="mt-3">
                            <div class="mb-2 flex flex-wrap gap-2">
                                <button id="IRRRIPBXBtn" type="button"
                                    class="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700">Verificar
                                    Resistencia</button>
                                <button id="IRRRIPBXNext" type="button"
                                    class="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Version
                                    Extrema</button>
                            </div>
                            <div id="IRRRIPBX" class="handsontable-container"></div>
                        </div>

                        <div id="IRRRIPBXEDiv" class="d-none mt-3">
                            <div class="mb-2">
                                <button id="IRRRIPBXENext" type="button"
                                    class="rounded-lg bg-slate-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">Volver
                                    a Version Base</button>
                            </div>
                            <div id="IRRRIPBXE" class="handsontable-container"></div>
                        </div>

                        <div id="IRRREPBX" class="handsontable-container mt-3"></div>
                        <div id="IRRREPBXE" class="handsontable-container mt-3"></div>
                    </div>

                    <div id="sec-ia-kv-y" class="mt-4 rounded-lg border border-slate-200 bg-white p-3 scroll-mt-24">
                        <h3 class="text-sm font-semibold text-emerald-700">Direccion Y</h3>

                        <div id="IRRRIPBYDiv" class="mt-3">
                            <div class="mb-2 flex flex-wrap gap-2">
                                <button id="IRRRIPBYBtn" type="button"
                                    class="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Verificar
                                    Resistencia</button>
                                <button id="IRRRIPBYNext" type="button"
                                    class="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Version
                                    Extrema</button>
                            </div>
                            <div id="IRRRIPBY" class="handsontable-container"></div>
                        </div>

                        <div id="IRRRIPBYEDiv" class="d-none mt-3">
                            <div class="mb-2">
                                <button id="IRRRIPBYENext" type="button"
                                    class="rounded-lg bg-slate-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">Volver
                                    a Version Base</button>
                            </div>
                            <div id="IRRRIPBYE" class="handsontable-container"></div>
                        </div>

                        <div id="IRRREPBY" class="handsontable-container mt-3"></div>
                        <div id="IRRREPBYE" class="handsontable-container mt-3"></div>
                    </div>
                </section>

                <section id="sec-ia-masa" class="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-4">
                    <h2 class="text-lg font-semibold text-slate-800">IRREGULARIDAD EN ALTURA | MASA O PESO / Segun NTE
                        E.030 - 2018</h2>
                    <div id="IRRMP" class="handsontable-container mt-3"></div>
                </section>

                <section id="sec-ia-igv" class="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-4">
                    <h2 class="text-lg font-semibold text-slate-800">IRREGULARIDAD EN ALTURA | IGV, DSR / Segun NTE
                        E.030 - 2018</h2>
                    <div id="IRRGVXY" class="handsontable-container mt-3"></div>
                    <div id="IRRGVXXYY" class="handsontable-container mt-3"></div>
                    <div id="DSV1" class="handsontable-container mt-3"></div>
                    <div id="DSV2" class="handsontable-container mt-3"></div>
                </section>

                <section id="sec-ip-igv" class="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-4">
                    <h2 class="text-lg font-semibold text-slate-800">IRREGULARIDAD EN PLANTA | IGV, DSR / Segun NTE
                        E.030 - 2018</h2>

                    <div id="sec-ip-igv-x"
                        class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 scroll-mt-24">
                        <h3 class="text-sm font-semibold text-sky-700">Subseccion X</h3>
                        <div id="IRRPGVXY" class="handsontable-container mt-2"></div>
                        <div id="IRRPDDA1" class="handsontable-container mt-3"></div>
                        <div id="IRRPDDD1" class="handsontable-container mt-3"></div>
                    </div>

                    <div id="sec-ip-igv-y"
                        class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 scroll-mt-24">
                        <h3 class="text-sm font-semibold text-emerald-700">Subseccion Y</h3>
                        <div id="IRRPGVXYXY" class="handsontable-container mt-2"></div>
                        <div id="IRRPDDA2" class="handsontable-container mt-3"></div>
                        <div id="IRRPDDD2" class="handsontable-container mt-3"></div>
                    </div>
                </section>

                <section id="sec-ip-snp" class="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-4">
                    <h2 class="text-lg font-semibold text-slate-800">IRREGULARIDAD EN PLANTA | Sistemas No Paralelos /
                        Segun NTE E.030 - 2018</h2>
                    <div id="SNPXY" class="handsontable-container mt-3"></div>
                    <div id="SNPXYXY" class="handsontable-container mt-3"></div>
                </section>

                <section id="sec-ip-torsion" class="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-4">
                    <h2 class="text-lg font-semibold text-slate-800">IRREGULARIDAD EN PLANTA | TORSION - Segun NTE
                        E.030 - 2018</h2>

                    <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <label class="block">
                            <span class="text-xs font-semibold text-slate-600">Deriva</span>
                            <input id="deriva" type="number" step="any"
                                class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        </label>
                        <label class="block">
                            <span class="text-xs font-semibold text-slate-600">d1</span>
                            <input id="d1" type="number" step="any"
                                class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        </label>
                        <label class="block">
                            <span class="text-xs font-semibold text-slate-600">d2</span>
                            <input id="d2" type="number" step="any"
                                class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        </label>
                    </div>

                    <div class="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3"><span
                                class="block text-xs text-slate-500">dprom</span><span id="dprom"
                                class="font-semibold text-slate-800">0.000</span></div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3"><span
                                class="block text-xs text-slate-500">Permisible</span><span id="permisible"
                                class="font-semibold text-slate-800">0.000</span></div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3"><span
                                class="block text-xs text-slate-500">dmax</span><span id="dmax"
                                class="font-semibold text-slate-800">0.00</span></div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3"><span
                                class="block text-xs text-slate-500">1.3 x dprom</span><span id="torsional"
                                class="font-semibold text-slate-800">0.000</span></div>
                    </div>
                </section>

                <section id="sec-ip-it" class="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-4">
                    <h2 class="text-lg font-semibold text-slate-800">IRREGULARIDAD EN PLANTA | Irregularidad Torsional
                    </h2>

                    <div id="sec-ip-it-xx" class="scroll-mt-24">
                        <h3 class="mt-3 text-sm font-semibold text-sky-700">XX</h3>
                        <div id="IRRTXX" class="handsontable-container mt-2"></div>
                    </div>

                    <div id="sec-ip-it-yy" class="scroll-mt-24">
                        <h3 class="mt-4 text-sm font-semibold text-emerald-700">YY</h3>
                        <div id="IRRTYY" class="handsontable-container mt-2"></div>
                    </div>
                </section>
            </div>
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
</x-calc-layout>
