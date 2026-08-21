// mixins/io/file-io/e2k-load-combos.js
//
// Combinaciones de carga del .e2k de ETABS.
//
// Formato: una línea por dato, todas empezando con el nombre del combo.
//
//   COMBO "01 1.4CM+1.7CV"  TYPE "Linear Add"
//   COMBO "01 1.4CM+1.7CV"  DESIGN "Concrete"  COMBOTYPE "Strength"
//   COMBO "01 1.4CM+1.7CV"  LOADCASE  "CM"  SF 1.4
//   COMBO "01 1.4CM+1.7CV"  LOADCOMBO "CV"  SF 1.7      <-- referencia a OTRO combo
//
// **Lo que hay que resolver acá es el anidamiento.** ETABS deja que un combo
// referencie otro (`LOADCOMBO`), pero el motor solo entiende términos que
// apuntan a CASOS (`terms: [{case, factor}]`, ver `_ff_compute_combo_entries`
// en solver.py). Así que se APLANA multiplicando factores:
//
//   CV        = CVE·1 + CVT·1
//   01 …      = CM·1.4 + CV·1.7   →   CM·1.4 + CVE·1.7 + CVT·1.7
//
// Sobre el SIGNO de los casos sísmicos: los casos de espectro devuelven
// MAGNITUDES (CQC/SRSS), sin signo físico. ETABS escribe las dos ramas por
// separado (`SF 1` en "+SDX" y `SF -1` en "-SDX"), pero esas dos ramas NO son
// "una suma y la otra resta" aplicadas por igual a P, M2 y M3: cada rama toma
// el sentido ADVERSO de CADA componente. Su combo "+SDX" da el axial máximo Y
// los momentos máximos a la vez.
//
// Por eso los términos de espectro SÍ se marcan `signless` — lo hace
// e2k-import.js, que es donde se sabe qué casos son de espectro — y el motor
// aplica la magnitud por componente (ver _ff_compute_combo_entries en
// solver.py). El factor del .e2k conserva su rol: su SIGNO decide si la
// magnitud se suma o se resta, así la pareja ±SDX sigue cubriendo el axial
// máximo y el mínimo.
//
// NO marca ramas duplicadas: el motor solo desdobla en _Max/_Min los combos
// tipo ENVELOPE, no los ADD.

const NUM = /SF\s+(-?[\d.]+(?:[eE][-+]?\d+)?)/;

function quoted(line) {
    return [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
}

/** Une términos repetidos del mismo caso: CM·1.0 + CM·0.5 → CM·1.5 */
function mergeTerms(terms) {
    const by = new Map();
    terms.forEach(({ case: c, factor }) => {
        by.set(c, (by.get(c) || 0) + factor);
    });
    return [...by.entries()]
        .filter(([, f]) => Math.abs(f) > 1e-9)
        .map(([c, f]) => ({ case: c, factor: Number(f.toFixed(6)) }));
}

/**
 * Lee las líneas `COMBO` de un .e2k y devuelve combos APLANADOS, en el formato
 * que consume el motor.
 *
 * @param {string[]} lines  líneas del archivo
 * @returns {{combos: Array, skipped: Array}}
 *   combos  → [{id, name, type:"ADD", terms:[{case,factor}], design, comboType}]
 *   skipped → [{id, reason}] para poder avisar en consola qué no se trajo
 */
export function parseE2kLoadCombos(lines = []) {
    const raw = new Map(); // nombre → {type, design, comboType, refs:[{kind, ref, sf}]}

    lines.forEach((line) => {
        if (!/^\s*COMBO\s/i.test(line)) return;

        const q = quoted(line);
        const name = q[0];
        if (!name) return;

        if (!raw.has(name)) {
            raw.set(name, { type: "", design: "", comboType: "", refs: [] });
        }
        const c = raw.get(name);

        if (/\bTYPE\s+"/i.test(line)) c.type = q[1] || "";
        if (/\bDESIGN\s+"/i.test(line)) c.design = q[1] || "";
        if (/\bCOMBOTYPE\s+"/i.test(line)) {
            c.comboType = q[q.length - 1] || "";
        }

        const sf = NUM.exec(line);
        if (/\bLOADCASE\s+"/i.test(line)) {
            c.refs.push({ kind: "case", ref: q[1], sf: sf ? Number(sf[1]) : 1 });
        } else if (/\bLOADCOMBO\s+"/i.test(line)) {
            c.refs.push({ kind: "combo", ref: q[1], sf: sf ? Number(sf[1]) : 1 });
        }
    });

    const skipped = [];

    /** Aplana a términos de CASO. `stack` corta referencias circulares. */
    function flatten(name, factor, stack) {
        const c = raw.get(name);
        if (!c) return [{ case: name, factor }]; // referencia a algo que no es combo

        if (stack.includes(name)) {
            skipped.push({ id: name, reason: "referencia circular entre combos" });
            return [];
        }

        const out = [];
        c.refs.forEach((r) => {
            if (r.kind === "case") {
                out.push({ case: r.ref, factor: factor * r.sf });
            } else {
                out.push(...flatten(r.ref, factor * r.sf, [...stack, name]));
            }
        });
        return out;
    }

    const combos = [];

    raw.forEach((c, name) => {
        // ETABS "Envelope" envuelve OTROS COMBOS, que es un concepto distinto del
        // ENVELOPE del motor (ese genera las ramas ±). El motor ya publica
        // "ENV Max"/"ENV Min" sobre todos los combos, así que traer este además
        // sería confuso y además necesitaría soporte nuevo. Se avisa y se omite.
        if (/envelope/i.test(c.type)) {
            skipped.push({ id: name, reason: "TYPE Envelope (el motor ya da ENV Max/Min)" });
            return;
        }

        if (!c.refs.length) {
            skipped.push({ id: name, reason: "sin términos" });
            return;
        }

        const terms = mergeTerms(flatten(name, 1, []));
        if (!terms.length) {
            skipped.push({ id: name, reason: "quedó sin términos al aplanar" });
            return;
        }

        combos.push({
            id: name,
            name,
            type: "ADD",
            terms,
            ...(c.design ? { design: c.design } : {}),
            ...(c.comboType ? { comboType: c.comboType } : {}),
            source: "e2k",
        });
    });

    // Orden estable por nombre: ETABS los numera ("01 …", "02 …") y así el
    // selector del panel sale en el mismo orden que en ETABS.
    combos.sort((a, b) => String(a.id).localeCompare(String(b.id), "es", { numeric: true }));

    return { combos, skipped };
}

/**
 * Reapunta los términos de los combos cuando un caso sísmico fue fusionado.
 *
 * `dedupeSeismicCases` (frameForceBackend.js) junta casos con el MISMO espectro
 * y se queda con el de nombre más corto: "SDX ESCALADO" desaparece a favor de
 * "SDX". Un combo importado que referencia el descartado se quedaría sin datos y
 * saldría en cero sin avisar. Acá se lo reapunta al que quedó.
 *
 * @param {Array} combos   combos importados
 * @param {Array} merged   [{kept, descartados:[...]}] que devuelve dedupeSeismicCases
 */
export function remapCombosToKeptCases(combos = [], merged = []) {
    if (!combos.length || !merged.length) return combos;

    const alias = new Map();
    merged.forEach(({ kept, descartados }) => {
        (descartados || []).forEach((d) => alias.set(String(d), String(kept)));
    });
    if (!alias.size) return combos;

    return combos.map((c) => {
        const reasignados = (c.terms || []).map((t) => ({
            case: alias.get(String(t.case)) || t.case,
            factor: Number(t.factor) || 0,
            signless: t.signless === true,
        }));

        // `mergeTerms` reconstruye los terminos como {case, factor} y perderia
        // el flag `signless` (lo pone e2k-import.js para los casos de espectro,
        // y el motor lo necesita para aplicar la magnitud en el sentido adverso
        // de cada componente). Se reatacha por caso despues de fusionar.
        const sinSigno = new Set(
            reasignados.filter((t) => t.signless).map((t) => String(t.case)),
        );

        return {
            ...c,
            terms: mergeTerms(reasignados).map((t) =>
                sinSigno.has(String(t.case)) ? { ...t, signless: true } : t,
            ),
        };
    });
}

/**
 * Texto legible de un combo, para el modal Define ▸ Combinaciones, que muestra
 * `expression` como string ("1.4 CM + 1.7 CVE").
 */
export function comboExpression(combo) {
    return (combo?.terms || [])
        .map((t, i) => {
            const f = Number(t.factor) || 0;
            const sign = f < 0 ? "- " : i === 0 ? "" : "+ ";
            const mag = Math.abs(f);
            return `${sign}${mag === 1 ? "" : `${mag} `}${t.case}`;
        })
        .join(" ")
        .trim();
}
