import { sharedState } from './config.js';

export function calcularSeccionD() {
    const D = parseFloat(document.getElementById('in-A-0').value) || 0;
    const Ln = parseFloat(document.getElementById('in-A-2').value) || 0;
    const Fy = parseFloat(document.getElementById('in-A-3').value) || 0;
    const fc = parseFloat(document.getElementById('in-A-4').value) || 0;
    const Nu = parseFloat(document.getElementById('in-A-5').value) || 0;
    const db = parseFloat(document.getElementById('out-A-0').innerText) || 0;
    const de = parseFloat(document.getElementById('out-A-1').innerText) || 0;
    const Av = parseFloat(document.getElementById('out-A-2').innerText) || 0;
    const d = parseFloat(document.getElementById('out-A-3').innerText) || 0;
    const Ag = parseFloat(document.getElementById('out-A-4').innerText) || 0;
    const Ac = parseFloat(document.getElementById('out-A-5').innerText) || 0;
    const S3 = parseFloat(document.getElementById('in-D-0').value) || 10;
    const S2_300 = parseFloat(document.getElementById('in-D-1').value) || 30;
    const Lo3 = parseFloat(document.getElementById('in-D-2').value) || 50;
    const Mns = parseFloat(document.getElementById('in-D-3').value) || 0;
    const Mni = parseFloat(document.getElementById('in-D-4').value) || 0;
    const Nr = parseFloat(document.getElementById('in-D-5').value) || 0;

    const S1_8db = db * 8;
    const S2_bMin2 = D / 2;
    const S1_brMin2 = d / 2;
    const S1_16db = db * 16;
    const S1_48de = de * 48;
    const Lo1 = Ln > 0 ? (Ln * 100) / 6 : 0;
    const Lo2 = D;

    const Smin1 = Math.round(Math.min(S1_8db, S2_bMin2, S3));
    const Smin2 = Math.round(Math.min(S1_brMin2, S2_300, S1_16db, S1_48de, 20));
    const Lo = Math.max(Lo2, Lo3);
    const Lc = (Ln * 100) - (Lo * 2);
    const Mprs = Mns * 1.25;
    const Mpri = Mni * 1.25;
    const Vu1 = Ln > 0 ? (Mprs + Mpri) / Ln : 0;
    const Vu2 = sharedState.vu2;
    const st0V2 = sharedState.station0V2;
    const st0V3 = sharedState.station0V3;
    const maxV2S = sharedState.maxV2Sismo;
    const maxV3S = sharedState.maxV3Sismo;
    let Vu3 = 0;
    if (st0V2.length > 0 && st0V3.length > 0) {
        const len = Math.min(st0V2.length, st0V3.length);
        Vu3 = Math.abs(st0V3[0]);
        for (let i = 1; i < len; i++) {
            Vu3 = Math.max(Vu3, Math.abs(st0V3[i] + 1.5 * maxV3S));
        }
        Vu3 = Math.max(Vu3, Math.abs(st0V2[0]));
        for (let i = 1; i < len; i++) {
            Vu3 = Math.max(Vu3, Math.abs(st0V2[i] + 1.5 * maxV2S));
        }
    } else if (Vu2 > 0) {
        Vu3 = Vu2;
    }

    const Vumax = 2.6 * 0.85 * D * (D - 6) * Math.pow(fc, 0.5) / 1000;
    const ParaleloAB = 0.53 * Math.pow(fc, 0.5) * (1 + Nu / (140 * Ag)) * Ac / 1000;
    const Vs = Math.max(Vu1, Vu2, Vu3) / 0.85 - ParaleloAB;
    const S_SMC = Vs <= 0 ? 10 : Math.round((Av * Nr * Fy * (D - 6)) / (Vs * 1000) * 10) / 10;
    const Sfinal = Math.floor(Math.min(S_SMC, Smin2, Smin1) * 10) / 10;

    document.getElementById('out-D-0').innerText = S1_8db.toFixed(2);
    document.getElementById('out-D-1').innerText = S2_bMin2.toFixed(2);
    document.getElementById('out-D-2').innerText = S1_brMin2.toFixed(2);
    document.getElementById('out-D-3').innerText = S1_16db.toFixed(2);
    document.getElementById('out-D-4').innerText = S1_48de.toFixed(2);
    document.getElementById('out-D-5').innerText = Lo1.toFixed(2);
    document.getElementById('out-D-6').innerText = Lo2.toFixed(2);
    document.getElementById('out-D-7').innerText = Smin1.toFixed(2);
    document.getElementById('out-D-8').innerText = Smin2.toFixed(2);
    document.getElementById('out-D-9').innerText = Lo.toFixed(2);
    document.getElementById('out-D-10').innerText = Lc.toFixed(2);
    document.getElementById('out-D-11').innerText = Mprs.toFixed(4);
    document.getElementById('out-D-12').innerText = Mpri.toFixed(4);
    document.getElementById('out-D-13').innerText = Vu1.toFixed(4);
    document.getElementById('out-D-14').innerText = Vu2.toFixed(4);
    document.getElementById('out-D-15').innerText = Vu3.toFixed(4);
    document.getElementById('out-D-16').innerText = Vumax.toFixed(4);
    document.getElementById('out-D-17').innerText = Vs.toFixed(4);
    document.getElementById('out-D-18').innerText = ParaleloAB.toFixed(4);
    document.getElementById('out-D-19').innerText = S_SMC.toFixed(1);
    document.getElementById('out-D-20').innerText = Sfinal.toFixed(1);
}
