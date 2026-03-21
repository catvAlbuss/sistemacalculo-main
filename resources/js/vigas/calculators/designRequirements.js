import { StructuralUtils, CONCRETE_CONSTANTS } from "./SharedCalculatorUtils.js";

export class DesignRequirementsCalculator {
    constructor(data) {
        this.parametros = data.parametros; // { fc, fy, numTramos }
        this.datos = data.datos;
    }

    calculate() {
        const { fc, fy, numTramos } = this.parametros;
        // Default to parameters if not in datos, handling potential object structure
        const base = this.datos?.base || this.parametros.base;
        const altura = this.datos?.altura || this.parametros.altura;
        
        // Calculations using Utils
        const beta1 = StructuralUtils.calculateBeta1(fc);
        const epsilonY = StructuralUtils.calculateEpsilonY(fy);
        const phi = CONCRETE_CONSTANTS.PHI_FLEXION;
        const epsilonCu = CONCRETE_CONSTANTS.ECU;

        // Estructura de columnas dinámicas
        const columnGroups = [];
        for (let i = 1; i <= numTramos; i++) {
            columnGroups.push({
                title: `TRAMO ${i}`,
                columns: ["START", "MIDDLE", "END"]
            });
        }

        // Helper to generate rows with per-tramo data support
        const generateRow = (name, symbol, value, unit, decimals = 2) => {
            const values = [];
            for (let i = 1; i <= numTramos; i++) {
                let val = value;
                // Si el valor es un objeto con claves tramoX, obtener el valor específico
                if (value && typeof value === 'object' && `tramo${i}` in value) {
                    val = value[`tramo${i}`];
                }

                // Format the value
                const formattedVal = typeof val === 'number' ? StructuralUtils.round(val, decimals) : val;

                // Por cada tramo, 3 valores (Start, Middle, End) -> suponiendo constantes por tramo para Propiedades
                values.push(
                    { value: formattedVal, unit: unit }, // Start
                    { value: formattedVal, unit: unit }, // Middle
                    { value: formattedVal, unit: unit }  // End
                );
            }
            return { name, symbol, values };
        };

        return {
            title: "1.- Requisitos de diseño",
            columnGroups: columnGroups,
            rows: [
                generateRow("Esfuerzo de fluencia del acero", "fy", fy, "kg/cm²"),
                generateRow("Esfuerzo de compresión del concreto", "f'c", fc, "kg/cm²"),
                generateRow("Base de la Viga", "b", base, "cm"), // Pass original object/value to support per-tramo
                generateRow("Altura de la Viga", "h", altura, "cm"), // Pass original object/value
                generateRow("Parámetro función resistencia concreto", "β1", beta1, "-", 4),
                generateRow("Deformación última del concreto", "εcu", epsilonCu, "-", 4),
                generateRow("Deformación de fluencia del acero", "εy", epsilonY, "-", 5),
                generateRow("Factor de reducción a flexión", "Ф", phi, "-")
            ]
        };
    }
}
