<x-calc-layout title="Diseño de Escaleras">
    <style>
        #escaleras-app .bg-gespro-panel { background-color: #1a1f2c; }
        #escaleras-app .bg-gespro-input { background-color: #242938; }
        #escaleras-app .bg-gespro-header { background-color: #373d4d; }
        #escaleras-app .border-gespro-border { border-color: #282e3f; }
        #escaleras-app .text-gespro-text { color: #e2e8f0; }
        #escaleras-app .text-gespro-muted { color: #a0aabf; }
    </style>
    <div id="escaleras-app" class="min-h-screen bg-[#131722] text-white">
    <div class="container mx-auto flex flex-wrap py-6">
        <!-- Formulario -->
        <div class="w-full px-4 md:w-1/3">
            <div class="w-full overflow-auto rounded-lg border border-gespro-border bg-gespro-panel p-6 shadow-xl">
                <h3 class="mb-4 text-lg font-bold text-white border-b border-gespro-border pb-3">Datos Generales</h3>
                <table class="w-full table-fixed text-sm">
                    <thead>
                        <tr class="text-center text-[11px] uppercase tracking-wider text-gespro-muted">
                            <th class="px-1 py-2 font-medium w-2/5">Descripción</th>
                            <th class="px-1 py-2 font-medium w-1/5">Simb.</th>
                            <th class="px-1 py-2 font-medium w-1/5">Entrada</th>
                            <th class="px-1 py-2 font-medium leading-tight w-1/5">Unidad<br>Medida</th>
                        </tr>
                    </thead>
                    <tbody class="text-center">
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Ancho tributario de la escalera</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">B</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="ancho_tributario" name="ancho_tributario" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">i</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">i</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="i" name="i" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">j</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">j</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="j" name="j" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Espesor del descanso</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">e</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="espesor_descanso" name="espesor_descanso" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Espesor de la garganta recomendado</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">er</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="espesor_garganta_rec" name="espesor_garganta_rec" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Espesor de la garganta</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">t</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="espesor_garganta" name="espesor_garganta" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Paso</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">P</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="paso" name="paso" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Contrapaso</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">CP</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="contrapaso" name="contrapaso" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">a</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">a</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="a" name="a" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Ancho del descanso</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">b</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="ancho_descanso" name="ancho_descanso" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Resistencia del concreto</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">fc</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="fc" name="fc" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">kgf/cm2</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Fluencia del acero</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">fy</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="fy" name="fy" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">kgf/cm2</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Peso específico del concreto</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">γc</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="gamma_c" name="gamma_c" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">ton/m3</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Sobrecarga acabados</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">CM<sub>general</sub></th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="cm_acabados" name="cm_acabados" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">ton/m2</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Sobrecarga en escalera</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">S/C<sub>escalera</sub></th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="sc_escalera" name="sc_escalera" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">ton/m2</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Recubrimiento</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">r'</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="r_prime" name="r_prime" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">cm</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Momento último</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">Mu</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="mu" name="mu" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">tonf-m</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Factor de reducción a flexión sin carga axial</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">Ø</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="phi_flexion" name="phi_flexion" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">-</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Espaciamiento a usar(Flexión)</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">S</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="s_usar" name="s_usar" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">cm</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Refuerzo a usar</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">Ф</th>
                            <th class="py-3 px-1">
                                <select class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors appearance-none" id="diameter_flexion" name="diameter_flexion" required>
                                    <option value="" disabled selected></option>
                                    <option value="6mm">6mm</option>
                                    <option value="Ø 1/4&quot;">Ø 1/4"</option>
                                    <option value="8mm">8mm</option>
                                    <option value="Ø 3/8&quot;">Ø 3/8"</option>
                                    <option value="12mm">12mm</option>
                                    <option value="Ø 1/2&quot;">Ø 1/2"</option>
                                    <option value="Ø 5/8&quot;">Ø 5/8"</option>
                                    <option value="Ø 3/4&quot;">Ø 3/4"</option>
                                    <option value="Ø 1&quot;">Ø 1"</option>
                                </select>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">-</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Ancho por 1m lineal</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">b</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="b_lineal" name="b_lineal" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">cm</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">E.060(9.7.2)</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">ρ <sub>mín</sub></th>
                            <th class="py-3 px-1">
                                <div class="relative flex items-center">
                                    <input class="w-full rounded bg-gespro-input pl-2 pr-6 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="rho_min" name="rho_min" type="text" min="0" required>
                                    <span class="absolute right-2 text-gespro-muted text-xs">%</span>
                                </div>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted"></th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Ф</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">Ф</th>
                            <th class="py-3 px-1">
                                <select class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors appearance-none" id="diameter" name="diameter" required>
                                    <option value="" disabled selected></option>
                                    <option value="6mm">6mm</option>
                                    <option value="Ø 1/4&quot;">Ø 1/4"</option>
                                    <option value="8mm">8mm</option>
                                    <option value="Ø 3/8&quot;">Ø 3/8"</option>
                                    <option value="12mm">12mm</option>
                                    <option value="Ø 1/2&quot;">Ø 1/2"</option>
                                    <option value="Ø 5/8&quot;">Ø 5/8"</option>
                                    <option value="Ø 3/4&quot;">Ø 3/4"</option>
                                    <option value="Ø 1&quot;">Ø 1"</option>
                                </select>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">-</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Espaciamiento a usar</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">S</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="s_vol_usar" name="s_vol_usar" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">cm</th>
                        </tr>
                        <tr class="border-b border-gespro-border last:border-0">
                            <th class="py-3 text-left text-xs font-normal text-gespro-text pr-2">Factor de reducción cortante</th>
                            <th class="py-3 text-center text-xs font-semibold text-white">Ф</th>
                            <th class="py-3 px-1">
                                <input class="w-full rounded bg-gespro-input px-2 py-1.5 text-center text-sm text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors" id="phi_corte" name="phi_corte" type="text" min="0" required>
                            </th>
                            <th class="py-3 text-center text-xs font-normal text-gespro-muted">-</th>
                        </tr>
                        <tr>
                            <th class="pt-6" colspan="4">
                                <button class="w-full rounded-md bg-[#2563eb] px-4 py-2.5 font-bold text-white transition-all hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg" id="desingButton" type="button">DISEÑAR</button>
                            </th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
            <div class="w-full overflow-auto rounded-lg border border-gespro-border bg-gespro-panel p-6 shadow-xl">
                <h3 class="mb-4 text-lg font-bold text-white border-b border-gespro-border pb-3">Resultados</h3>
                
                <div class="space-y-8">
                    <div class="rounded-lg border border-gespro-border overflow-x-auto">
                        <table class="min-w-[650px] w-full text-white table-fixed">
                            <thead>
                                <tr class="bg-gespro-panel">
                                    <th class="px-4 py-3 text-left text-base font-bold text-white" colspan="3">1.- Medidas de escalera</th>
                                </tr>
                                <tr class="bg-gespro-header">
                                    <th class="border-b border-gespro-border px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gespro-text w-2/4" scope="col">Descripción</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Símbolo</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Resultado</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm font-medium" id="medidas-escalera">
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Longitud de la escalera</td><td class="px-4 py-3 text-center text-[13px] text-white">L</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_L">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Ángulo de la escalera</td><td class="px-4 py-3 text-center text-[13px] text-white">β</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_beta">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Espesor efectiva de la escalera</td><td class="px-4 py-3 text-center text-[13px] text-white">he</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_he">-</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="rounded-lg border border-gespro-border overflow-x-auto">
                        <table class="min-w-[650px] w-full text-white table-fixed">
                            <thead>
                                <tr class="bg-gespro-panel">
                                    <th class="px-4 py-3 text-left text-base font-bold text-white" colspan="3">2.- Metrado de cargas para diseño</th>
                                </tr>
                                <tr class="bg-gespro-header">
                                    <th class="border-b border-gespro-border px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gespro-text w-2/4" scope="col">Descripción</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Símbolo</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Resultado</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm font-medium" id="metrado-cargas">
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Peso propio</td><td class="px-4 py-3 text-center text-[13px] text-white">PP</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_pp">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Carga general</td><td class="px-4 py-3 text-center text-[13px] text-white">CM<sub>general</sub></td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_cm_general">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Sobrecarga</td><td class="px-4 py-3 text-center text-[13px] text-white">S/C<sub>escalera</sub></td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_sc_escalera">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Peso propio del descanso</td><td class="px-4 py-3 text-center text-[13px] text-white">PPd</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_ppd">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Carga tramo a'</td><td class="px-4 py-3 text-center text-[13px] text-white">W1</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_w1">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Carga tramo b'</td><td class="px-4 py-3 text-center text-[13px] text-white">W2</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_w2">-</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- 3.- Diagrama de momentos y cortantes -->
                    <div class="rounded-lg border border-gespro-border bg-gespro-panel overflow-hidden shadow-lg">
                        <div class="bg-gespro-panel px-4 py-3 border-b border-gespro-border">
                            <h3 class="text-base font-bold text-white">3.- Diagrama de momentos y cortantes</h3>
                        </div>
                        
                        <!-- Tabla de Análisis Estructural dentro de la sección 3 -->
                        <div class="overflow-x-auto">
                            <table class="min-w-[650px] w-full text-white table-fixed">
                                <thead>
                                    <tr class="bg-gespro-header">
                                        <th class="border-b border-gespro-border px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gespro-text w-2/4" scope="col">Descripción</th>
                                        <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Símbolo</th>
                                        <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm font-medium" id="analisis-estructural">
                                    <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Longitud del tramo a'</td><td class="px-4 py-3 text-center text-[13px] text-white">a'</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_a_prime">-</td></tr>
                                    <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Longitud del tramo b'</td><td class="px-4 py-3 text-center text-[13px] text-white">b'</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_b_prime">-</td></tr>
                                    <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Reacción A</td><td class="px-4 py-3 text-center text-[13px] text-white">RA</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_ra">-</td></tr>
                                    <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Reacción B</td><td class="px-4 py-3 text-center text-[13px] text-white">RB</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_rb">-</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Gráfico -->
                        <div class="p-4 bg-gespro-panel">
                            <div class="flex h-48 items-center justify-center rounded-lg border border-gespro-border bg-[#151922] text-gespro-muted text-sm" id="diagrama_container">
                                Espacio para Diagrama de Momentos y Cortantes
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-gespro-border overflow-x-auto">
                        <table class="min-w-[650px] w-full text-white table-fixed">
                            <thead>
                                <tr class="bg-gespro-panel">
                                    <th class="px-4 py-3 text-left text-base font-bold text-white" colspan="3">4.- Diseño por flexión</th>
                                </tr>
                                <tr class="bg-gespro-header">
                                    <th class="border-b border-gespro-border px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gespro-text w-2/4" scope="col">Descripción</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Símbolo</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Resultado</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm font-medium" id="diseno-flexion">
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Ancho de la escalera</td><td class="px-4 py-3 text-center text-[13px] text-white">b</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_b_flex">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Espesor de la garganta</td><td class="px-4 py-3 text-center text-[13px] text-white">e</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_e_flex">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Peralte efectivo</td><td class="px-4 py-3 text-center text-[13px] text-white">d</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_d_flex">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Bloque de concreto comprimido</td><td class="px-4 py-3 text-center text-[13px] text-white">a</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_a_bloque">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Área de refuerzo requerido</td><td class="px-4 py-3 text-center text-[13px] text-white">As</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_as_req">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Refuerzo a usar</td><td class="px-4 py-3 text-center text-[13px] text-white">Ø</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_refuerzo_usar">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Número de varillas</td><td class="px-4 py-3 text-center text-[13px] text-white">N</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_n_varillas">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Área de refuerzo mínimo</td><td class="px-4 py-3 text-center text-[13px] text-white">As<sub>min</sub></td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_as_min">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Espaciamiento requerido</td><td class="px-4 py-3 text-center text-[13px] text-white">S</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_s_req">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Espaciamiento real</td><td class="px-4 py-3 text-center text-[13px] text-white">S</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_s_real">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Área de refuerzo real</td><td class="px-4 py-3 text-center text-[13px] text-white">As<sub>real</sub></td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_as_real">-</td></tr>
                            </tbody>
                        </table>
                        <div class="p-4 bg-gespro-panel border-t border-gespro-border">
                            <div class="flex h-32 items-center justify-center rounded-lg border border-gespro-border bg-[#151922] text-gespro-muted text-sm" id="reinf_container">
                                Esquema de Refuerzo
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-gespro-border overflow-x-auto">
                        <table class="min-w-[650px] w-full text-white table-fixed">
                            <thead>
                                <tr class="bg-gespro-panel">
                                    <th class="px-4 py-3 text-left text-base font-bold text-white" colspan="3">5.- Refuerzo por cambios volumétricos</th>
                                </tr>
                                <tr class="bg-gespro-header">
                                    <th class="border-b border-gespro-border px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gespro-text w-2/4" scope="col">Descripción</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Símbolo</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Resultado</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm font-medium" id="refuerzo-volumetrico">
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Espesor de la garganta</td><td class="px-4 py-3 text-center text-[13px] text-white">e</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_vol_e">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Peralte efectivo</td><td class="px-4 py-3 text-center text-[13px] text-white">d</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_vol_d">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Acero mínimo por temperatura</td><td class="px-4 py-3 text-center text-[13px] text-white">As<sub>min</sub></td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_vol_as_min">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Área del refuerzo</td><td class="px-4 py-3 text-center text-[13px] text-white">As</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_vol_as">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Espaciamiento requerido</td><td class="px-4 py-3 text-center text-[13px] text-white">S</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_vol_s_req">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Espaciamiento máximo</td><td class="px-4 py-3 text-center text-[13px] text-white">S<sub>max</sub></td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_vol_s_max">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">ρ <sub>mín</sub></td><td class="px-4 py-3 text-center text-[13px] text-white">ρ <sub>mín</sub></td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_vol_rho_min">-</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="rounded-lg border border-gespro-border overflow-x-auto">
                        <table class="min-w-[650px] w-full text-white table-fixed">
                            <thead>
                                <tr class="bg-gespro-panel">
                                    <th class="px-4 py-3 text-left text-base font-bold text-white" colspan="3">6.- Diseño por corte</th>
                                </tr>
                                <tr class="bg-gespro-header">
                                    <th class="border-b border-gespro-border px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gespro-text w-2/4" scope="col">Descripción</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Símbolo</th>
                                    <th class="border-b border-gespro-border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-gespro-text w-1/4" scope="col">Resultado</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm font-medium" id="diseno-corte">
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Espesor de la garganta</td><td class="px-4 py-3 text-center text-[13px] text-white">e</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_corte_e">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Peralte efectivo</td><td class="px-4 py-3 text-center text-[13px] text-white">d</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_corte_d">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">ФVc</td><td class="px-4 py-3 text-center text-[13px] text-white">ФVc</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_corte_phivc">-</td></tr>
                                <tr class="border-b border-gespro-border bg-gespro-panel hover:bg-[#1f2536] transition-colors"><td class="px-4 py-3 text-left text-[13px] font-bold text-gespro-text">Фcos(β)Vu</td><td class="px-4 py-3 text-center text-[13px] text-white">Фcos(β)Vu</td><td class="px-4 py-3 text-center text-[13px] text-white" id="res_corte_phicosbetavu">-</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>

    @pushOnce('scripts')
        @vite(['resources/js/desingescaleras.js'])
    @endPushOnce
</x-calc-layout>
