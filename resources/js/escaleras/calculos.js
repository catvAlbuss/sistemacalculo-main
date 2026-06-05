
export const DIAMETERS = {
    '6mm': 0.283,
    'Ø 1/4"': 0.317,
    '8mm': 0.503,
    'Ø 3/8"': 0.713,
    '12mm': 1.131,
    'Ø 1/2"': 1.267,
    'Ø 5/8"': 1.979,
    'Ø 3/4"': 2.850,
    'Ø 1"': 5.067
};

export function calculateMedidasEscalera(i, a, b, j, CP, P, t) {
    const L = i / 2 + a + b + j / 2;
    const beta_rad = Math.atan(CP / P);
    const beta_deg = beta_rad * 180 / Math.PI;
    const he = (t / Math.cos(beta_rad) + CP / 2);
    return { L, beta_rad, beta_deg, he };
}

export function calculateMetradoCargas(gamma_c, he, B, cm_acabados, sc_escalera, e) {
    const pp = gamma_c * he * 1.4 * B;
    const cm_gen = cm_acabados * 1.4 * B;
    const sc = sc_escalera * 1.7 * B;
    const ppd = e * gamma_c * 1.4 * B;
    const w1 = pp + cm_gen + sc;
    const w2 = cm_gen + sc + ppd;
    return { pp, cm_gen, sc, ppd, w1, w2 };
}

export function calculateAnalisiEstructural(w1, w2, a, i, b, j, L) {
    const a_prime = a + i / 2;
    const b_prime = b + j / 2;
    const rb = (w1 * Math.pow(a_prime, 2) / 2 + w2 * b_prime * (a_prime + b_prime / 2)) / L;
    const ra = w1 * a_prime + w2 * b_prime - rb;

    // Mu according to Excel formula: Mu = W1 * L^2 / 40
    const mu_excel = (w1 * Math.pow(L, 2)) / 40;

    let m_max = 0;
    const steps = 30;
    const points = [];
    for (let s = 0; s <= steps; s++) {
        const x = (s / steps) * L;
        let v, m;
        if (x <= a_prime) {
            v = ra - w1 * x;
            m = ra * x - w1 * Math.pow(x, 2) / 2;
        } else {
            const xr = x - a_prime;
            v = ra - w1 * a_prime - w2 * xr;
            m = ra * x - w1 * a_prime * (x - a_prime / 2) - w2 * Math.pow(xr, 2) / 2;
        }
        points.push({ x, v, m: -m }); // Negative m to match Excel diagram look
        if (Math.abs(m) > Math.abs(m_max)) m_max = Math.abs(m);
    }

    const vmax = Math.max(Math.abs(ra), Math.abs(rb));
    return { ra, rb, m_max, mu_excel, vmax, a_prime, b_prime, points, L };
}

export function calculateDisenoFlexion(B, t, r_prime, mu_to_use, phi_flexion, fc, fy, as_phi) {
    const b_flex = B * 100;
    const e_flex = t * 100;
    const d = e_flex - r_prime;
    
    // Asumiendo que el término dentro de la raíz es positivo
    const term = Math.pow(d, 2) - 2 * Math.abs(mu_to_use * 100000) / (phi_flexion * 0.85 * fc * b_flex);
    const a_bloque = d - Math.sqrt(Math.max(0, term));
    
    const as_req = (0.85 * fc * b_flex * a_bloque) / fy;
    const n_varillas = Math.ceil(as_req / as_phi);
    const as_min = 0.0018 * (B * 100) * d;
    const s_req = (as_phi / (as_req / B)) * 100;
    const s_real = n_varillas > 1 ? (b_flex - 2 * 2 - as_phi) / (n_varillas - 1) : 0;
    const as_real = as_phi * n_varillas;
    
    return { b_flex, e_flex, d, a_bloque, as_req, n_varillas, as_min, s_req, s_real, as_real };
}

export function calculateRefuerzoVolumetrico(t, r_prime, rho_min_input, as_phi, s_usar) {
    const vol_e = t * 100;
    const vol_d = vol_e - r_prime;
    const vol_as_min = rho_min_input * 100 * vol_d;
    const vol_s_req = (as_phi / vol_as_min) * 100;
    const vol_s_max = Math.min(3 * vol_e, 40, vol_s_req);
    
    // Formula for rho real output: (as_phi / s_usar) / vol_d
    const rho_real = (as_phi / (s_usar || 1)) / vol_d;
    
    return { vol_e, vol_d, vol_as_min, vol_s_req, vol_s_max, rho_real };
}

export function calculateDisenoCorte(phi_corte, fc, vol_d, vmax, beta_rad) {
    const phivc = phi_corte * (0.53 * Math.sqrt(fc) * vol_d * 100) / 1000;
    const phicosbetavu = vmax * Math.cos(beta_rad);
    return { phivc, phicosbetavu };
}
