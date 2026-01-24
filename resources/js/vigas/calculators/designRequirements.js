export class DesignRequirementsCalculator {
    constructor(data) {
        this.parametros = data.parametros; // { fc, fy, numTramos }
        this.datos = data.datos;
    }

    calculate() {
        const { fc, fy, numTramos } = this.parametros;
        const base = this.datos?.base || this.parametros.base;
        const altura = this.datos?.altura || this.parametros.altura;

        // Estructura de columnas dinámicas
        const columnGroups = [];
        for (let i = 1; i <= numTramos; i++) {
            columnGroups.push({
                title: `TRAMO ${i}`,
                columns: ["START", "MIDDLE", "END"]
            });
        }

        // Generar filas con datos repetidos por tramo (ya que fc y fy son globales por ahora)
        const generateRow = (name, symbol, value, unit) => {
            const values = [];
            for (let i = 1; i <= numTramos; i++) {
                let val = value;
                // Si el valor es un objeto con claves tramoX, obtener el valor específico
                if (value && typeof value === 'object' && `tramo${i}` in value) {
                    val = value[`tramo${i}`];
                }

                // Por cada tramo, 3 valores (Start, Middle, End)
                values.push(
                    { value: val, unit: unit }, // Start
                    { value: val, unit: unit }, // Middle
                    { value: val, unit: unit }  // End
                );
            }
            return { name, symbol, values };
        };

        return {
            title: "1.- Requisitos de diseño",
            columnGroups: columnGroups, // Estructura para headers agrupados
            rows: [
                generateRow("Esfuerzo de fluencia del acero", "fy", fy, "kg/cm²"),
                generateRow("Esfuerzo de compresión del concreto", "f'c", fc, "kg/cm²"),
                generateRow("Base", "b", base, "cm"),
                generateRow("Altura", "h", altura, "cm")
            ]
        };
    }
}
