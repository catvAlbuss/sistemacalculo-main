import { StorageManager } from './utils/storage.js';

// Merge stage data instead of replacing the entire project during autosave.
export function createSystemState() {
    return {
        predimensionamientoCompleto: false,
        dimensionamientoCompleto: false,
        resultadosPredimensionamiento: null,
        resultadosDimensionamiento: null,
        setResultadosPredimensionamiento(data) {
            this.resultadosPredimensionamiento = JSON.parse(JSON.stringify(data));
            this.predimensionamientoCompleto = data.isCalculated === true;
            this.guardarEnLocalStorage();
        },
        setResultadosDimensionamiento(data) {
            this.resultadosDimensionamiento = JSON.parse(JSON.stringify(data));
            this.dimensionamientoCompleto = data.isCalculated === true;
            this.guardarEnLocalStorage();
        },
        guardarEnLocalStorage() {
            const stored = StorageManager.loadData() || {};
            return StorageManager.saveData({
                ...stored,
                predimensionamiento: this.resultadosPredimensionamiento,
                dimensionamiento: this.resultadosDimensionamiento,
                systemState: {
                    ...stored.systemState,
                    predimensionamientoCompleto: this.predimensionamientoCompleto,
                    dimensionamientoCompleto: this.dimensionamientoCompleto,
                    predimensionamientoCalculado: this.predimensionamientoCompleto,
                    dimensionamientoCalculado: this.dimensionamientoCompleto,
                },
            });
        },
        cargarDeLocalStorage() {
            const data = StorageManager.loadData() || {};
            this.resultadosPredimensionamiento = data.predimensionamiento || null;
            this.resultadosDimensionamiento = data.dimensionamiento || null;
            if (this.resultadosDimensionamiento && !this.resultadosDimensionamiento.predimData) {
                this.resultadosDimensionamiento.predimData = data.predimensionamiento || null;
            }
            this.predimensionamientoCompleto = data.predimensionamiento?.isCalculated === true;
            this.dimensionamientoCompleto = data.dimensionamiento?.isCalculated === true;
        },
    };
}
