// diagrams/frameForceUnits.js
//
// Unidades de PRESENTACIÓN de las fuerzas de barra. **Fuente única**: la usan el
// diálogo por barra, la tabla, el visor 2D y el 3D.
//
// El motor SIEMPRE devuelve kN y kN·m (contrato `jhack_frame_force_results`, ver
// frameForceResultsContract.js) y así se guardan. La conversión pasa únicamente
// acá, al momento de mostrar: si se convirtiera antes, los combos, los máximos y
// las comparaciones contra el motor quedarían mezclando unidades.
//
// El default es **tonf**, que es lo que usa ETABS en estos modelos y con lo que
// trabaja la práctica peruana — así las tablas se cruzan sin convertir a mano.

/** 1 tonf = 9.80665 kN (tonelada-fuerza, no tonelada métrica de masa). */
export const KN_PER_TONF = 9.80665;

const SYSTEMS = {
    tonf: { force: "tonf", moment: "tonf-m", factor: 1 / KN_PER_TONF },
    kN: { force: "kN", moment: "kN-m", factor: 1 },
};

let current = "tonf";

/** Sistema activo ("tonf" | "kN"). */
export function getFrameForceUnitSystem() {
    return current;
}

/** Cambia el sistema. Solo afecta lo que se MUESTRA, nunca lo que se guarda. */
export function setFrameForceUnitSystem(name) {
    if (SYSTEMS[name]) current = name;
    return current;
}

/** Factor para pasar de kN/kN·m (motor) al sistema activo. */
export function unitFactor() {
    return SYSTEMS[current].factor;
}

/**
 * Convierte un valor del motor al sistema activo.
 * Fuerzas y momentos comparten factor: 1 tonf = 9.80665 kN y
 * 1 tonf·m = 9.80665 kN·m.
 */
export function toDisplayUnits(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n * SYSTEMS[current].factor : n;
}

/** Etiqueta de la unidad para una componente ("P"/"V2"/… o "force"/"moment"). */
export function unitLabelFor(component) {
    const s = SYSTEMS[current];
    const c = String(component || "");
    const isMoment = c === "T" || c[0] === "M" || c === "moment";
    return isMoment ? s.moment : s.force;
}

/**
 * Decimales para las TABLAS (pantalla y CSV).
 *
 * En kN los valores de un pórtico normal van de 1 a 100 y con 2 decimales
 * alcanzaba. En tonf son ~10 veces más chicos y 2 decimales pierden mucho: la
 * torsión de columna (~0.022 tonf·m) cae entera en 0.01 → −10 % de error solo
 * por redondeo, y el M2 de los pisos altos (~0.028) se va +8 %. Con 4 sale la
 * misma precisión que muestra ETABS en sus tablas (0.0223, 3.0844).
 *
 * Los rótulos SOBRE el modelo no usan esto: ahí importa que se lean, y quien
 * necesita la cifra fina abre la tabla o el diálogo de la barra.
 */
export function tableDecimals() {
    return current === "tonf" ? 4 : 2;
}

/** Mapa {P,V2,V3,T,M2,M3} → etiqueta, para encabezados de tabla y CSV. */
export function unitLabelMap() {
    return {
        P: unitLabelFor("P"),
        V2: unitLabelFor("V2"),
        V3: unitLabelFor("V3"),
        T: unitLabelFor("T"),
        M2: unitLabelFor("M2"),
        M3: unitLabelFor("M3"),
    };
}
