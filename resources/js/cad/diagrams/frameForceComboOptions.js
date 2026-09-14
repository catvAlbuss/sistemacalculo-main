/**
 * Opciones de combo para los diagramas, respetando las ramas _Max/_Min.
 *
 * POR QUÉ EXISTE
 *   El selector se armaba con `results.combinations`, que trae el nombre BASE
 *   del combo ("02 1.25(CM+CV) +SDX"). Pero cuando un combo incluye un caso
 *   espectral, el motor lo parte en dos registros: "..._Max" y "..._Min" (el
 *   espectro no tiene signo, así que la envolvente es gravedad ± |espectro|).
 *   `getFrameForceIndex` cruza por igualdad EXACTA, de modo que elegir el
 *   nombre base no encontraba nada y el diálogo mostraba "esta barra no tiene
 *   resultados". Solo funcionaba el combo 01, que al ser pura gravedad no se
 *   parte.
 *
 *   ETABS resuelve lo mismo con su desplegable "Max and Min"; acá se listan las
 *   dos ramas para que el usuario elija cuál dibujar.
 */

/**
 * @param {{frameForces?: Array}} results  respuesta del motor
 * @param {Array<{id:string}>} combos      lista base (results.combinations)
 * @returns {Array<{id:string,label:string}>} ids REALES presentes en los registros
 */
export function expandComboOptions(results, combos) {
    const presentes = new Set(
        (results?.frameForces || [])
            .map((r) => (r?.comboId == null ? null : String(r.comboId)))
            .filter(Boolean)
    );

    const salida = [];
    for (const c of combos || []) {
        const base = String(c?.id ?? c ?? "");
        if (!base) continue;

        if (presentes.has(base)) {
            salida.push({ id: base, label: base });
            continue;
        }

        // Sin registro con el nombre base: buscar las ramas de envolvente.
        const ramas = [
            [`${base}_Max`, `${base}  (máx)`],
            [`${base}_Min`, `${base}  (mín)`],
        ].filter(([id]) => presentes.has(id));

        if (ramas.length) {
            for (const [id, label] of ramas) salida.push({ id, label });
        } else {
            // Ni base ni ramas: se deja igual para no ocultarlo en silencio.
            salida.push({ id: base, label: base });
        }
    }
    return salida;
}
