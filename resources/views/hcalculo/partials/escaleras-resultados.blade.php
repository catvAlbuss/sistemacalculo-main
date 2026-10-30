<div>
        <table class="arco-table beam-result-table">
            <thead>
                <tr>
                    <th colspan="3">1.- Medidas de escalera</th>
                </tr>
                <tr>
                    <th scope="col">Descripción</th>
                    <th scope="col">Símbolo</th>
                    <th scope="col">Resultado</th>
                </tr>
            </thead>
            <tbody id="medidas-escalera">
                <tr><td>Longitud de la escalera</td><td>L</td><td id="res_L">-</td></tr>
                <tr><td>Ángulo de la escalera</td><td>β</td><td id="res_beta">-</td></tr>
                <tr><td>Espesor efectiva de la escalera</td><td>he</td><td id="res_he">-</td></tr>
            </tbody>
        </table>
    </div>
    <div>
        <table class="arco-table beam-result-table">
            <thead>
                <tr>
                    <th colspan="3">2.- Metrado de cargas para diseño</th>
                </tr>
                <tr>
                    <th scope="col">Descripción</th>
                    <th scope="col">Símbolo</th>
                    <th scope="col">Resultado</th>
                </tr>
            </thead>
            <tbody id="metrado-cargas">
                <tr><td>Peso propio</td><td>PP</td><td id="res_pp">-</td></tr>
                <tr><td>Carga general</td><td>CM<sub>general</sub></td><td id="res_cm_general">-</td></tr>
                <tr><td>Sobrecarga</td><td>S/C<sub>escalera</sub></td><td id="res_sc_escalera">-</td></tr>
                <tr><td>Peso propio del descanso</td><td>PPd</td><td id="res_ppd">-</td></tr>
                <tr><td>Carga tramo a'</td><td>W1</td><td id="res_w1">-</td></tr>
                <tr><td>Carga tramo b'</td><td>W2</td><td id="res_w2">-</td></tr>
            </tbody>
        </table>
    </div>
    <!-- 3.- Diagrama de momentos y cortantes -->
    <div>
        <div>
            <h3>3.- Diagrama de momentos y cortantes</h3>
        </div>
        <!-- Tabla de Análisis Estructural dentro de la sección 3 -->
        <div>
            <table class="arco-table beam-result-table">
                <thead>
                    <tr>
                        <th scope="col">Descripción</th>
                        <th scope="col">Símbolo</th>
                        <th scope="col">Resultado</th>
                    </tr>
                </thead>
                <tbody id="analisis-estructural">
                    <tr><td>Longitud del tramo a'</td><td>a'</td><td id="res_a_prime">-</td></tr>
                    <tr><td>Longitud del tramo b'</td><td>b'</td><td id="res_b_prime">-</td></tr>
                    <tr><td>Reacción A</td><td>RA</td><td id="res_ra">-</td></tr>
                    <tr><td>Reacción B</td><td>RB</td><td id="res_rb">-</td></tr>
                </tbody>
            </table>
        </div>
        <!-- Gráfico -->
        <div>
            <div id="diagrama_container" class="sheet-figure-body"></div>
        </div>
    </div>
    <div>
        <table class="arco-table beam-result-table">
            <thead>
                <tr>
                    <th colspan="3">4.- Diseño por flexión</th>
                </tr>
                <tr>
                    <th scope="col">Descripción</th>
                    <th scope="col">Símbolo</th>
                    <th scope="col">Resultado</th>
                </tr>
            </thead>
            <tbody id="diseno-flexion">
                <tr><td>Ancho de la escalera</td><td>b</td><td id="res_b_flex">-</td></tr>
                <tr><td>Espesor de la garganta</td><td>e</td><td id="res_e_flex">-</td></tr>
                <tr><td>Peralte efectivo</td><td>d</td><td id="res_d_flex">-</td></tr>
                <tr><td>Bloque de concreto comprimido</td><td>a</td><td id="res_a_bloque">-</td></tr>
                <tr><td>Área de refuerzo requerido</td><td>As</td><td id="res_as_req">-</td></tr>
                <tr><td>Refuerzo a usar</td><td>Ø</td><td id="res_refuerzo_usar">-</td></tr>
                <tr><td>Número de varillas</td><td>N</td><td id="res_n_varillas">-</td></tr>
                <tr><td>Área de refuerzo mínimo</td><td>As<sub>min</sub></td><td id="res_as_min">-</td></tr>
                <tr><td>Espaciamiento requerido</td><td>S</td><td id="res_s_req">-</td></tr>
                <tr><td>Espaciamiento real</td><td>S</td><td id="res_s_real">-</td></tr>
                <tr><td>Área de refuerzo real</td><td>As<sub>real</sub></td><td id="res_as_real">-</td></tr>
            </tbody>
        </table>
        <div>
            <div id="reinf_container" class="sheet-figure-body"></div>
        </div>
    </div>
    <div>
        <table class="arco-table beam-result-table">
            <thead>
                <tr>
                    <th colspan="3">5.- Refuerzo por cambios volumétricos</th>
                </tr>
                <tr>
                    <th scope="col">Descripción</th>
                    <th scope="col">Símbolo</th>
                    <th scope="col">Resultado</th>
                </tr>
            </thead>
            <tbody id="refuerzo-volumetrico">
                <tr><td>Espesor de la garganta</td><td>e</td><td id="res_vol_e">-</td></tr>
                <tr><td>Peralte efectivo</td><td>d</td><td id="res_vol_d">-</td></tr>
                <tr><td>Acero mínimo por temperatura</td><td>As<sub>min</sub></td><td id="res_vol_as_min">-</td></tr>
                <tr><td>Área del refuerzo</td><td>As</td><td id="res_vol_as">-</td></tr>
                <tr><td>Espaciamiento requerido</td><td>S</td><td id="res_vol_s_req">-</td></tr>
                <tr><td>Espaciamiento máximo</td><td>S<sub>max</sub></td><td id="res_vol_s_max">-</td></tr>
                <tr><td>ρ <sub>mín</sub></td><td>ρ <sub>mín</sub></td><td id="res_vol_rho_min">-</td></tr>
            </tbody>
        </table>
    </div>
    <div>
        <table class="arco-table beam-result-table">
            <thead>
                <tr>
                    <th colspan="3">6.- Diseño por corte</th>
                </tr>
                <tr>
                    <th scope="col">Descripción</th>
                    <th scope="col">Símbolo</th>
                    <th scope="col">Resultado</th>
                </tr>
            </thead>
            <tbody id="diseno-corte">
                <tr><td>Espesor de la garganta</td><td>e</td><td id="res_corte_e">-</td></tr>
                <tr><td>Peralte efectivo</td><td>d</td><td id="res_corte_d">-</td></tr>
                <tr><td>ФVc</td><td>ФVc</td><td id="res_corte_phivc">-</td></tr>
                <tr><td>Фcos(β)Vu</td><td>Фcos(β)Vu</td><td id="res_corte_phicosbetavu">-</td></tr>
            </tbody>
        </table>
    </div>
</div>
