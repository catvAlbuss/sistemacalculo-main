import { getFloatElementValue, getIntElementValue, showError } from "../utils/domHelpers";
import { DEFAULT_VALUES } from "../config/constants";

export const collectData = (tabulatorInstance) => {
    console.log("Intentando recolectar datos...");

    if (!tabulatorInstance) {
        showError("Error", "No hay tabla disponible");
        return null;
    }

    // Validar que la instancia tenga el método getData
    if (typeof tabulatorInstance.getData !== 'function') {
        console.error("La instancia de tabla no tiene el método getData:", tabulatorInstance);
        showError("Error", "La tabla no está correctamente inicializada");
        return null;
    }

    const fc = getFloatElementValue("fc", DEFAULT_VALUES.FC);
    const fy = getFloatElementValue("fy", DEFAULT_VALUES.FY);
    const numTramos = getIntElementValue("num_tramos", DEFAULT_VALUES.NUM_TRAMOS);

    let tablaData;
    try {
        tablaData = tabulatorInstance.getData();
        console.log("Datos de la tabla:", tablaData);
    } catch (error) {
        console.error("Error al obtener datos:", error);
        showError("Error", "No se pudieron obtener los datos de la tabla");
        return null;
    }

    // Estructurar datos
    const datosEstructurados = {
        luz: {},
        base: {},
        altura: {},
        capas: { positivo: {}, negativo: {} },
        fuerzas: { positivo: {}, negativo: {} }
    };

    tablaData.forEach(row => {
        if (row._isLuzRow) {
            for (let i = 1; i <= numTramos; i++) {
                datosEstructurados.luz[`tramo${i}`] = parseFloat(row[`b${i}_a`]) || 0;
            }
        }
        else if (row._isBaseRow) {
            for (let i = 1; i <= numTramos; i++) {
                datosEstructurados.base[`tramo${i}`] = parseFloat(row[`b${i}_a`]) || 0;
            }
        }
        else if (row._isAlturaRow) {
            for (let i = 1; i <= numTramos; i++) {
                datosEstructurados.altura[`tramo${i}`] = parseFloat(row[`b${i}_a`]) || 0;
            }
        }
        else if (row._isCapasRow && row._mainGroup) {
            const mainGroup = row._mainGroup; // 'positivo' or 'negativo'
            if (!datosEstructurados.capas[mainGroup]) {
                datosEstructurados.capas[mainGroup] = {};
            }
            for (let i = 1; i <= numTramos; i++) {
                datosEstructurados.capas[mainGroup][`tramo${i}`] = parseFloat(row[`b${i}_a`]) || 0;
            }
        }
        else if (row._concepto && row._grupo && row._mainGroup) {
            const mainGroup = row._mainGroup;
            const grupo = row._grupo;
            const concepto = row._concepto;

            if (!datosEstructurados.fuerzas[mainGroup]) {
                datosEstructurados.fuerzas[mainGroup] = {};
            }

            if (!datosEstructurados.fuerzas[mainGroup][grupo]) {
                datosEstructurados.fuerzas[mainGroup][grupo] = {};
            }

            if (!datosEstructurados.fuerzas[mainGroup][grupo][concepto]) {
                datosEstructurados.fuerzas[mainGroup][grupo][concepto] = {};
            }

            for (let i = 1; i <= numTramos; i++) {
                datosEstructurados.fuerzas[mainGroup][grupo][concepto][`tramo${i}`] = {
                    a: parseFloat(row[`b${i}_a`]) || 0,
                    b: parseFloat(row[`b${i}_b`]) || 0,
                    c: parseFloat(row[`b${i}_c`]) || 0
                };
            }

            // Compatibility: Allow access somewhat like before if needed, OR just stick to new structure.
            // Old structure: fuerzas.ENV.M3 -> Now it is fuerzas.positivo['ENV max'].M3 etc.
            // We only collect strictly what is in the table.
        }
    });

    return {
        parametros: { fc, fy, numTramos },
        datos: datosEstructurados
    };
};
