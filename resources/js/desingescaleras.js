import * as Calc from './escaleras/calculos.js';
import * as Graph from './escaleras/graficos.js';

(function setupEnterNavigation() {
    const inputs = document.querySelectorAll('.bg-gespro-input');
    const arr = Array.from(inputs);
    arr.forEach((el, i) => {
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const next = arr[i + 1];
                if (next) next.focus();
            }
        });
    });
})();

document.getElementById('desingButton').addEventListener('click', function() {
    // Inputs
    const B = parseFloat(document.getElementById('ancho_tributario').value);
    const i = parseFloat(document.getElementById('i').value);
    const j = parseFloat(document.getElementById('j').value);
    const e = parseFloat(document.getElementById('espesor_descanso').value);
    const t = parseFloat(document.getElementById('espesor_garganta').value);
    const P = parseFloat(document.getElementById('paso').value);
    const CP = parseFloat(document.getElementById('contrapaso').value);
    const a = parseFloat(document.getElementById('a').value);
    const b = parseFloat(document.getElementById('ancho_descanso').value);
    const fc = parseFloat(document.getElementById('fc').value);
    const fy = parseFloat(document.getElementById('fy').value);
    const gamma_c = parseFloat(document.getElementById('gamma_c').value);
    const cm_acabados = parseFloat(document.getElementById('cm_acabados').value);
    const sc_escalera = parseFloat(document.getElementById('sc_escalera').value);
    const r_prime = parseFloat(document.getElementById('r_prime').value);
    const phi_flexion = parseFloat(document.getElementById('phi_flexion').value);
    const s_usar_flexion = parseFloat(document.getElementById('s_usar').value);
    const diameter_flexion_symbol = document.getElementById('diameter_flexion').value;
    const rho_min_input = parseFloat(document.getElementById('rho_min').value) / 100;
    const diameter_symbol = document.getElementById('diameter').value;
    const s_vol_usar = parseFloat(document.getElementById('s_vol_usar').value);
    const phi_corte = parseFloat(document.getElementById('phi_corte').value);

    const as_phi_flexion = Calc.DIAMETERS[diameter_flexion_symbol] || 1.267;
    const as_phi_vol = Calc.DIAMETERS[diameter_symbol] || 1.267;

    // 1.- Medidas de escalera
    const medidas = Calc.calculateMedidasEscalera(i, a, b, j, CP, P, t);
    updateText('res_L', medidas.L.toFixed(3) + ' m');
    updateText('res_beta', medidas.beta_deg.toFixed(3) + ' °');
    updateText('res_he', medidas.he.toFixed(3) + ' m');

    // 2.- Metrado de cargas
    const cargas = Calc.calculateMetradoCargas(gamma_c, medidas.he, B, cm_acabados, sc_escalera, e);
    updateText('res_pp', cargas.pp.toFixed(3) + ' ton/m');
    updateText('res_cm_general', cargas.cm_gen.toFixed(3) + ' ton/m');
    updateText('res_sc_escalera', cargas.sc.toFixed(3) + ' ton/m');
    updateText('res_ppd', cargas.ppd.toFixed(3) + ' ton/m');
    updateText('res_w1', cargas.w1.toFixed(3) + ' ton/m');
    updateText('res_w2', cargas.w2.toFixed(3) + ' ton/m');

    // 3.- Analisi estructural
    const analisi = Calc.calculateAnalisiEstructural(cargas.w1, cargas.w2, a, i, b, j, medidas.L);
    document.getElementById('mu').value = analisi.mu_excel.toFixed(3);
    
    updateText('res_a_prime', analisi.a_prime.toFixed(3) + ' m');
    updateText('res_b_prime', analisi.b_prime.toFixed(3) + ' m');
    updateText('res_ra', analisi.ra.toFixed(3) + ' ton');
    updateText('res_rb', analisi.rb.toFixed(3) + ' ton');

    // 4.- Diseño por flexión
    const mu_to_use = parseFloat(document.getElementById('mu').value) || analisi.mu_excel;
    const flexion = Calc.calculateDisenoFlexion(B, t, r_prime, mu_to_use, phi_flexion, fc, fy, as_phi_flexion);
    updateText('res_b_flex', flexion.b_flex.toFixed(2) + ' cm');
    updateText('res_e_flex', flexion.e_flex.toFixed(2) + ' cm');
    updateText('res_d_flex', flexion.d.toFixed(2) + ' cm');
    updateText('res_a_bloque', flexion.a_bloque.toFixed(4) + ' cm');
    updateText('res_as_req', flexion.as_req.toFixed(3) + ' cm2');
    updateText('res_refuerzo_usar', as_phi_flexion.toFixed(3) + ' cm2');
    updateText('res_n_varillas', flexion.n_varillas + ' varillas');
    updateText('res_as_min', flexion.as_min.toFixed(3) + ' cm2');
    updateText('res_s_req', flexion.s_req.toFixed(2) + ' cm');
    updateText('res_s_real', flexion.s_real.toFixed(2) + ' cm');
    updateText('res_as_real', flexion.as_real.toFixed(3) + ' cm2');

    // 5.- Refuerzo volumétrico
    const vol = Calc.calculateRefuerzoVolumetrico(t, r_prime, rho_min_input, as_phi_vol, s_vol_usar);
    updateText('res_vol_e', vol.vol_e.toFixed(2) + ' cm');
    updateText('res_vol_d', vol.vol_d.toFixed(2) + ' cm');
    updateText('res_vol_as_min', vol.vol_as_min.toFixed(3) + ' cm2');
    updateText('res_vol_as', as_phi_vol.toFixed(3) + ' cm2');
    updateText('res_vol_s_req', vol.vol_s_req.toFixed(2) + ' cm');
    updateText('res_vol_s_max', vol.vol_s_max.toFixed(2) + ' cm');
    updateText('res_vol_rho_min', (vol.rho_real * 100).toFixed(3) + ' %');

    // 6.- Diseño por corte
    const corte = Calc.calculateDisenoCorte(phi_corte, fc, vol.vol_d, analisi.vmax, medidas.beta_rad);
    updateText('res_corte_e', vol.vol_e.toFixed(2) + ' cm');
    updateText('res_corte_d', vol.vol_d.toFixed(2) + ' cm');
    updateText('res_corte_phivc', corte.phivc.toFixed(3) + ' tonf');
    updateText('res_corte_phicosbetavu', corte.phicosbetavu.toFixed(3) + ' tonf');

    // Gráficos
    Graph.drawDiagrams('diagrama_container', {
        points: analisi.points,
        ra: analisi.ra,
        rb: analisi.rb,
        L: medidas.L
    });

    Graph.drawReinforcement('reinf_container', {
        diameter: diameter_flexion_symbol,
        spacing: s_usar_flexion
    });
});

function updateText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}
