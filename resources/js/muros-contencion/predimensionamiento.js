import { ValidationManager } from './utils/validation.js';
import { NotificationManager } from './utils/notifications.js';
import { predimSectionSVG } from './drawings.js';

export function Predimensionamiento() {
    return {
        // Estados de la UI y datos de entrada
        mode: 'edit',
        showMateriales: true,
        showSuelos: false,
        showGeometria: false,
        showCargas: false,
        showCombinacion: false,
        showValPredim: false,
        isCalculating: false,
        chartInitialized: false,
        // Nuevo estado para indicar si los inputs han cambiado desde el último cálculo
        inputsChanged: true,
        hasCalculated: false,

        // Datos de entrada unificados
        datosinput: {
            B6: 2.4, B7: 210, B8: 4200, B10: 20.0, B11: 1.83, B12: 26.90, B13: 0.05, B14: 0.51,
            B18: 6.40, B19: 1.0, B20: 12, B21: 0, l: 9, // B21 se calculará
            B24: 'rankine', B25: 0.4, B26: 'rankine', B27: 'mononobe', B29: 0.3, B30: 0.3, B31: 0.4,
            D35: false, D36: false, D37: false, D38: false, D39: false, D40: false, D41: false, D42: false,
            D45: 0.2, D47: 10, D49: 10, D51: 0.7, D53: 10
        },

        // Resultados de los cálculos
        resultados: {
            ancho_corona: 0, espesor_base_pantalla: 0, peralte_zapata: 0, ancho_zapata: 0, altura_key: 0, Ht: 0
        },

        // Configuración de visualización de resultados
        resultadosConfig: {
            ancho_corona: { label: 'Ancho Corona', unit: 'm', decimals: 2 },
            espesor_base_pantalla: { label: 'Espesor Base Pantalla', unit: 'm', decimals: 3 },
            peralte_zapata: { label: 'Peralte Zapata', unit: 'm', decimals: 3 },
            ancho_zapata: { label: 'Ancho Zapata', unit: 'm', decimals: 2 },
            altura_key: { label: 'Altura Key', unit: 'm', decimals: 3 },
            Ht: { label: 'Altura Total', unit: 'm', decimals: 2 },
        },

        errors: [],

        // Inicialización
        init() {
            this.loadFromStore();
            this.graficopredimensionamiento(); // Asegura que el gráfico se dibuje al cargar
            this.$watch('datosinput', () => { this.inputsChanged = true; });
            console.log('✅ Predimensionamiento inicializado');
        },

        loadFromStore() {
            let systemData = Alpine.store('systemData');
            if (!systemData) {
                Alpine.store('systemData', { predimensionamiento: {} });
                systemData = Alpine.store('systemData');
            }
            if (systemData && systemData.predimensionamiento) {
                const predimData = systemData.predimensionamiento;
                if (predimData.inputValues) {
                    this.datosinput = { ...this.datosinput, ...predimData.inputValues };
                }
                if (predimData.resultados) {
                    this.resultados = predimData.resultados;
                }
                if (predimData.errors) {
                    this.errors = predimData.errors;
                }
                // Si hay resultados cargados, el estado no está "cambiado" al inicio
                this.inputsChanged = predimData.isCalculated !== true;
                this.hasCalculated = predimData.isCalculated === true;
            }
        },

        resetCalculationState() {
            this.hasCalculated = false;
            this.resultados = {};
            this.errors = [];
            this.inputsChanged = true; // Al resetear, claro que los inputs "han cambiado" respecto a un resultado previo
        },

        handleExternalDataUpdate(data) { },

        // ===== CÁLCULOS =====
        async calcular() {
            if (this.isCalculating) return;
            this.isCalculating = true;
            this.hasCalculated = false;
            this.errors = []; // Limpia errores previos al inicio del cálculo

            // Mostrar alerta de carga al INICIAR el cálculo
            NotificationManager.showLoading('Calculando predimensionamiento...');

            // Se usa setTimeout para simular una operación asíncrona y permitir que la UI se actualice
            setTimeout(() => {
                try {
                    // **Validaciones de datos de entrada se realizan AQUÍ, antes del cálculo.**
                    this.validateInputs(); // Nueva función de validación
                    if (this.errors.length > 0) {
                        // Si hay errores, mostrar la primera alerta y detener el proceso
                        NotificationManager.hideLoading();
                        NotificationManager.showError('Error de Validación', this.errors[0]);
                        this.isCalculating = false;
                        this.emitUpdate({
                            inputValues: this.datosinput,
                            resultados: {},
                            errors: this.errors,
                            isCalculated: false
                        });
                        return; // Detiene la ejecución si hay errores de validación
                    }

                    this.calcularDimensiones();
                    this.graficopredimensionamiento();

                    this.emitUpdate({
                        inputValues: this.datosinput,
                        resultados: this.resultados,
                        errors: [],
                        isCalculated: true
                    });

                    // Ocultar alerta de carga y mostrar alerta de éxito
                    NotificationManager.hideLoading();
                    NotificationManager.showSuccess('Predimensionamiento Completado', 'Los cálculos se han realizado exitosamente');
                    this.hasCalculated = true;
                    this.$nextTick(() => { this.inputsChanged = false; });
                    // console.log('✅ Cálculo completado:', this.resultados);

                } catch (error) {
                    // Ocultar alerta de carga y mostrar alerta de error
                    NotificationManager.hideLoading();
                    NotificationManager.showError('Error en Cálculo', error.message || 'Error desconocido en los cálculos');
                    this.errors.push(error.message); // Almacena el error
                    this.emitUpdate({
                        inputValues: this.datosinput,
                        resultados: {}, // Asegura que los resultados se reinicien en caso de error
                        errors: this.errors,
                        isCalculated: false
                    });
                } finally {
                    this.isCalculating = false;
                }
            }, 100);
        },

        // Nueva función para centralizar las validaciones
        validateInputs() {
            this.errors = []; // Limpiar errores antes de revalidar

            const H = this.validateNumber(this.datosinput.B18);
            if (!Number.isFinite(H) || H <= 0) {
                this.errors.push('La altura H (B18) debe ser un número positivo.');
            }

            const df = this.validateNumber(this.datosinput.B19);
            if (isNaN(df) || df < 0) {
                this.errors.push('La profundidad de cimentación df (B19) debe ser un número no negativo.');
            }

            const D47 = this.validateNumber(this.datosinput.D47);
            if (isNaN(D47) || D47 <= 0) {
                this.errors.push('El factor de espesor de pantalla (D47) debe ser un número positivo.');
            }

            const D49 = this.validateNumber(this.datosinput.D49);
            if (isNaN(D49) || D49 <= 0) {
                this.errors.push('El factor de peralte de zapata (D49) debe ser un número positivo.');
            }

            const D51 = this.validateNumber(this.datosinput.D51);
            if (isNaN(D51) || D51 <= 0) {
                this.errors.push('El factor de ancho de zapata (D51) debe ser un número positivo.');
            }

            const D53 = this.validateNumber(this.datosinput.D53);
            if (isNaN(D53) || D53 <= 0) {
                this.errors.push('El factor de altura de Key (D53) debe ser un número positivo.');
            }

            // Puedes añadir más validaciones según sea necesario para todos los inputs críticos.
            // Por ejemplo, para rangos específicos:
            if (this.datosinput.B7 < 150 || this.datosinput.B7 > 300) { // Ejemplo para f'c
                this.errors.push('f\'c (B7) debe estar entre 150 y 300 kg/cm².');
            }
            if (this.datosinput.B8 < 3000 || this.datosinput.B8 > 6000) { // Ejemplo para fy
                this.errors.push('fy (B8) debe estar entre 3000 y 6000 kg/cm².');
            }
        },

        validateNumber(value, defaultValue = NaN) {
            const num = Number(value);
            return value === '' || value === null || !Number.isFinite(num) ? defaultValue : num;
        },

        calcularDimensiones() {
            // Asegúrate de usar los valores validados o con valores por defecto
            const H = this.validateNumber(this.datosinput.B18, 6.4);
            const df = this.validateNumber(this.datosinput.B19, 1.0);
            const Ht = H + df;
            if (this.datosinput.B21 !== Ht) this.datosinput.B21 = Ht; // Actualizar B21 en datosinput

            const ancho_corona = this.validateNumber(this.datosinput.D45, 0.2);
            const espesor_base_pantalla = Ht / this.validateNumber(this.datosinput.D47, 10);
            const peralte_zapata = Ht / this.validateNumber(this.datosinput.D49, 10);
            const ancho_zapata = Ht * this.validateNumber(this.datosinput.D51, 0.7);
            const altura_key = Ht / this.validateNumber(this.datosinput.D53, 10);

            Object.assign(this.resultados, {
                ancho_corona,
                espesor_base_pantalla,
                peralte_zapata,
                ancho_zapata,
                altura_key,
                Ht
            });

            if (Alpine.store('systemState') && Alpine.store('systemState').setResultadosPredimensionamiento) {
                Alpine.store('systemState').setResultadosPredimensionamiento({
                    inputValues: this.datosinput,
                    resultados: this.resultados,
                    isCalculated: true
                });
            } else {
                console.warn("Alpine.store('systemState') o setResultadosPredimensionamiento no están definidos. No se pudo guardar el estado.");
            }


            // Emitir evento de cálculo completado (para otros módulos)
            document.dispatchEvent(new CustomEvent('predimensionamiento-calculated', {
                detail: {
                    inputValues: this.datosinput,
                    resultados: this.resultados
                }
            }));
        },

        calculopuntosmuros(H, e = 10) {
            const H_val = this.validateNumber(H, 6.4) + this.validateNumber(this.datosinput.B19, 1)
            const ZM1 = (this.datosinput.D51 * H_val * 2 / 3) - (H_val / this.datosinput.D47);
            // Asegúrate de que los valores de datosinput usados aquí sean numéricos y válidos
            const muro = [
                { x: 0, y: 0 },
                { x: this.datosinput.D51 * H_val, y: 0 },
                { x: this.datosinput.D51 * H_val, y: H_val / this.datosinput.D49 },

                { x: (this.datosinput.D51 * H_val / 3) + H_val / this.datosinput.D47, y: H_val / this.datosinput.D49 },
                { x: (this.datosinput.D51 * H_val / 3) + H_val / this.datosinput.D47, y: H_val },

                { x: (this.datosinput.D51 * H_val / 3) + H_val / this.datosinput.D47 - this.datosinput.D45, y: H_val },

                { x: (this.datosinput.D51 * H_val) / 3, y: H_val / this.datosinput.D49 },
                { x: 0, y: H_val / this.datosinput.D49 },
                { x: 0, y: 0 }
            ];

            const suelo = [
                { x: (this.datosinput.D51 * H_val / 3) + H_val / this.datosinput.D47, y: H_val },
                { x: this.datosinput.D51 * H_val, y: (H_val) + (ZM1 * Math.tan(this.datosinput.B20 * Math.PI / 180)) }
            ];

            const sueloDelante = [
                { x: ((this.datosinput.D51 * H_val) / 3), y: (this.datosinput.B19) },
                { x: 0, y: (this.datosinput.B19) }
            ];
            return { muro, suelo, sueloDelante };
        },

        // Métodos de gráfico se mantienen igual, pero se asegura que se llamen después de calcularDimensiones
        graficopredimensionamiento() {
            const container = document.getElementById('predimsMC');
            if (!container) {
                this.errors.push('Container #predimsMC not found in DOM');
                return;
            }
            const H = this.validateNumber(this.datosinput.B18, 6.4);
            container.innerHTML = predimSectionSVG(this.calculopuntosmuros(H), this.datosinput);
        },

        // ===== EMISIÓN DE EVENTOS =====
        emitUpdate(data) {
            let currentSystemData = Alpine.store('systemData');
            if (!currentSystemData) {
                Alpine.store('systemData', { predimensionamiento: {} });
                currentSystemData = Alpine.store('systemData');
            }
            currentSystemData.predimensionamiento = {
                ...currentSystemData.predimensionamiento,
                ...data
            };
            Alpine.store('systemData', currentSystemData);
            document.dispatchEvent(new CustomEvent('predimensionamiento-updated', {
                detail: data,
                bubbles: true
            }));
            // console.log('📡 Evento predimensionamiento-updated emitido:', data);
        },

        // ===== UTILIDADES =====
        limpiarFormulario() {
            this.datosinput = {
                B6: 2.4, B7: 210, B8: 4200, B10: 20.0, B11: 1.83, B12: 26.90, B13: 0.05, B14: 0.51,
                B18: 6.40, B19: 1.0, B20: 12, B21: 0,
                B24: 'rankine', B25: 0.4, B26: 'rankine', B27: 'mononobe', B29: 0.4, B30: 0.3, B31: 0.4,
                D35: false, D36: false, D37: false, D39: false, D40: false, D41: false, D42: false, D43: false,
                D45: 0.2, D47: 10, D49: 10, D51: 0.7, D53: 10
            }
            this.resultados = {}
            this.errors = []
            this.inputsChanged = false; // Al limpiar, no hay cambios pendientes
            this.emitUpdate({
                inputValues: this.datosinput,
                resultados: {},
                errors: [],
                isCalculated: false
            })
        },

        exportarResultados() {
            if (!this.resultados || Object.keys(this.resultados).length === 0) {
                NotificationManager.showWarning(
                    'Sin Resultados',
                    'No hay resultados para exportar. Realiza los cálculos primero.'
                )
                return
            }
            const exportData = {
                modulo: 'predimensionamiento',
                inputValues: this.datosinput,
                //resultados: this.resultados, // No es necesario exportar los resultados aquí si el objetivo es solo los inputs
                timestamp: new Date().toISOString()
            }
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `predimensionamiento-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
        },

        // ===== GETTERS REACTIVOS =====
        get tieneResultados() {
            return this.hasCalculated && this.resultados && Object.keys(this.resultados).length > 0
        },

        get tieneErrores() {
            return this.errors && this.errors.length > 0
        },

        get puedeCalcular() {
            return !this.isCalculating &&
                this.datosinput.B18 !== undefined && this.datosinput.B18 !== null && this.datosinput.B18 !== '' &&
                this.datosinput.B11 !== undefined && this.datosinput.B11 !== null && this.datosinput.B11 !== '' &&
                this.datosinput.B12 !== undefined && this.datosinput.B12 !== null && this.datosinput.B12 !== '';
        },

        get progreso() {
            const camposRequeridos = ['B18', 'B11', 'B12']; // Estos son ejemplos de campos críticos para el cálculo
            const camposCompletos = camposRequeridos.filter(campo =>
                this.datosinput[campo] !== undefined && this.datosinput[campo] !== null && this.datosinput[campo] !== ''
            ).length;
            return Math.round((camposCompletos / camposRequeridos.length) * 100);
        },

        getInputStep(id) {
            const defaultDecimals = 2;
            const inputConfig = this.resultadosConfig[id];
            if (inputConfig && typeof inputConfig.decimals === 'number') {
                // Genera el paso correctamente para números flotantes
                return inputConfig.decimals === 0 ? '1' : `0.${'0'.repeat(inputConfig.decimals - 1)}1`;
            }
            return `0.${'0'.repeat(defaultDecimals - 1)}1`;
        },

        formatValue(value, decimals = 2) {
            if (value === null || value === undefined || value === '') return '-';
            // Asegúrate de que el valor sea un número antes de intentar fixed
            const numValue = parseFloat(value);
            if (isNaN(numValue)) return '-'; // Manejar casos donde el valor no es numérico

            if (decimals === 0) {
                return Math.round(numValue).toString();
            }
            return numValue.toFixed(decimals);
        },

        get hasErrors() {
            return this.errors.length > 0;
        }
    };
}
