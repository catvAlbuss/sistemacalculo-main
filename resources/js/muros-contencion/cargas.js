import { ValidationManager } from './utils/validation.js';
import { NotificationManager } from './utils/notifications.js';

export function Cargas() {
    return {
        // Estado de visualización
        showCargasEmpuje: true,
        showCargaSismico: false,
        showParametros: true,
        showEmpujePasivo: false,
        showEmpujeActivo: false,
        showEmpujeSobrecarga: false,
        showTablaDetallada: false,

        // Datos recibidos
        predimData: null,
        resultados: {},
        errors: [],
        // Control de cambios
        lastInputHash: '',

        // Configuración de parámetros a mostrar
        parametrosBase: [
            { key: 'B98', label: 'Altura de sobrecarga', symbol: 'hs', unit: 'm' },
            { key: 'B99', label: 'Coeficiente activo', symbol: 'ka', unit: '-' },
            { key: 'B100', label: 'Coeficiente pasivo', symbol: 'kp', unit: '-' },
            { key: 'B101', label: 'Coeficiente reposo', symbol: 'ko', unit: '-' },
        ],

        empujePasivoParams: [
            { key: 'B103', label: 'Empuje cohesivo superior', symbol: 'h', unit: 'm' },
            { key: 'B104', label: 'Presion cota cero', symbol: 'Smin', unit: 'kg/m²' },
            { key: 'B105', label: 'Presion maxima en la pantalla del muro', symbol: 'Samx_pantalla', unit: 'kg/m²' },
            { key: 'B106', label: '', symbol: 'Samx_cimen', unit: 'kg/m²' },
            { key: 'B107', label: 'Presion cota final del muro', symbol: 'Smax', unit: 'kg/m²' },
            { key: 'B108', label: 'Empuje del terreno', symbol: 'P', unit: 'kg/m' },
            { key: 'B109', label: 'Empuje vertical del terreno', symbol: 'Pv', unit: 'kg/m' },
            { key: 'B110', label: 'Empuje horizaontal del terreno', symbol: 'Ph', unit: 'kg/m' },

            { key: 'B112', label: '', symbol: 'Smax', unit: 'kg/m²' },
            { key: 'B113', label: '', symbol: 'P', unit: 'kg/m' },
            { key: 'B114', label: '', symbol: 'Pv', unit: 'kg/m' },
            { key: 'B115', label: '', symbol: 'Ph', unit: 'kg/m' },
        ],

        empujeActivoParams: [
            { key: 'B119', label: '', symbol: 'H', unit: '' },
            { key: 'B120', label: 'presion cota cero', symbol: 'Smin', unit: 'kg/m²' },
            { key: 'B121', label: 'presion cota final del muro', symbol: 'Smax', unit: 'kg/m²' },
            { key: 'B122', label: 'presion maxima en la pantalla del muro', symbol: 'Smax_pantalla', unit: '' },
            { key: 'B123', label: 'Empuje del terreno', symbol: 'P', unit: 'kg/m' },
            { key: 'B124', label: 'empuje vertical del terreno', symbol: 'Pv', unit: 'kg/m' },
            { key: 'B125', label: 'empuje horizaontal del terreno', symbol: 'Ph', unit: 'kg/m' },

            { key: 'B127', label: '', symbol: 'Smax', unit: 'kg/m²' },
            { key: 'B128', label: '', symbol: 'P', unit: 'kg/m' },
            { key: 'B129', label: '', symbol: 'Pv', unit: 'kg/m' },
            { key: 'B130', label: '', symbol: 'Ph', unit: 'kg/m' },
        ],

        empujeSobrecargaParams: [
            { key: 'B133', label: 'presion cota cero', symbol: 'Smin', unit: 'kg/m²' },
            { key: 'B134', label: 'presion cota final del muro', symbol: 'Smax', unit: 'kg/m²' },
            { key: 'B135', label: 'presion maxima en la pantalla del muro', symbol: 'Smax_pantalla', unit: '' },
            { key: 'B136', label: 'Empuje del terreno', symbol: 'P', unit: 'kg/m' },
            { key: 'B137', label: 'empuje vertical del terreno', symbol: 'Pv', unit: 'kg/m' },
            { key: 'B138', label: 'empuje horizaontal del terreno', symbol: 'Ph', unit: 'kg/m' }
        ],

        cargaSismicos: [
            { key: 'C144', label: '', symbol: 'Kh', unit: '' },
            { key: 'C145', label: '', symbol: 'Kh', unit: '' },

            { key: 'C153', label: '', symbol: 'Kae', unit: '' },
            { key: 'B154', label: '', symbol: 'gs', unit: '' },
            { key: 'B155', label: '', symbol: 'H', unit: '' },
            { key: 'B156', label: '', symbol: 'Kv', unit: '' },
            { key: 'C157', label: '', symbol: 'Eae', unit: 'Tn' },
            { key: 'B158', label: '', symbol: 'Kah', unit: '' },
            { key: 'C159', label: '', symbol: 'Ea', unit: 'Tn' },
            { key: 'C160', label: '', symbol: 'DEae', unit: 'Tn' },
            { key: 'C162', label: '', symbol: 'Brazo', unit: 'm' },
            { key: 'C163', label: '', symbol: 'Mae', unit: 'Tn-m' },
        ],

        get cargasisicatable() {
            return [
                {
                    label: 'Θ=',
                    gradosKey: 'B147',
                    radianesKey: 'C147',
                    description: ''
                },
                {
                    label: 'Ø=',
                    gradosKey: 'B148',
                    radianesKey: 'C148',
                    description: 'SUELO'
                },
                {
                    label: 'BETA',
                    gradosKey: 'B149',
                    radianesKey: 'C149',
                    description: 'ANGULO VASTAGO'
                },
                {
                    label: 'd=',
                    gradosKey: 'B150',
                    radianesKey: 'C150',
                    description: 'ANGULO DE FRICCION'
                },
                {
                    label: 'I=',
                    gradosKey: 'B151',
                    radianesKey: 'C151',
                    description: 'ANGULO DEL TALUD'
                },
                {
                    label: 'y=',
                    gradosKey: 'B152',
                    radianesKey: '',
                    description: ''
                }
            ];
        },

        getValue(key) {
            if (this.resultados[key] !== undefined) return this.resultados[key];
            if (this.predimData?.resultados?.[key] !== undefined) return this.predimData.resultados[key];
            return null;
        },

        init() {
            //console.log('🔄 Inicializando módulo de Cargas...');
            this.configurarEventos();
            // Si hay datos en el store global al iniciar, los procesamos.
            const initialDimData = Alpine.store('systemState').resultadosDimensionamiento;
            if (Alpine.store('systemState').dimensionamientoCompleto && initialDimData) {
                this.handleDimensionamientoData({ detail: { resultados: initialDimData } });
            }
        },

        /**
         * Configura el listener para el evento que trae los datos de dimensionamiento.
         */
        configurarEventos() {
            document.addEventListener('dimensionamiento-calculated', (event) => this.handleDimensionamientoData(event));
        },

        /**
         * Maneja los datos recibidos del módulo de dimensionamiento.
         * Esta función ahora es el punto central para la actualización de datos.
         * @param {CustomEvent} event - El evento con los datos.
         */
        handleDimensionamientoData(event) {
            //console.log('📥 Recibiendo datos de dimensionamiento:', event.detail);

            if (!event.detail || !event.detail.resultados) {
                console.error('❌ Evento "dimensionamiento-calculated" no contiene resultados.');
                NotificationManager.showError('No se recibieron resultados de dimensionamiento.');
                return;
            }

            try {
                if (!event.detail) {
                    console.warn('No se recibieron datos del dimensionamiento');
                    return;
                }

                // Inicialización segura de objetos
                this.predimData = {
                    inputValues: event.detail.inputValues || {},
                    resultados: event.detail.resultados || {},
                    errors: Array.isArray(event.detail.errors) ? event.detail.errors : []
                };

                this.calcularResultados();
            } catch (error) {
                console.error('Error procesando datos del dimensionamiento:', error);
                this.addError('procesamiento_datos', 'Error procesando datos del dimensionamiento: ' + error.message);
            }
        },

        calcularResultados() {
            try {
                this.clearErrors();

                // Verificar que tenemos datos del predimensionamiento
                if (!this.predimData || !this.predimData.resultados) {
                    this.addError('datos_faltantes', 'No se han recibido datos del módulo de predimensionamiento');
                    return;
                }

                // Obtener B98 del predimensionamiento
                const b98 = this.getB98Value();
                if (!b98 || b98 === 0) {
                    this.addError('b98_invalido', 'El valor B98 (altura de sobrecarga) no es válido');
                }

                // Aquí irían los cálculos específicos usando B98 y otros parámetros
                this.calcularEmpujes();
                this.sendDataCargas();

            } catch (error) {
                this.addError('calculo_general', 'Error en el cálculo: ' + error.message);
                console.error('Error en cálculo de cargas:', error);
            }
        },

        calcularEmpujes() {
            try {
                const b98 = parseFloat(this.getB98Value());

                if (isNaN(b98) || b98 <= 0) {
                    //console.warn('B98 no válido para cálculos, usando valores por defecto');
                    return;
                }

                // Ejemplo de cálculos que dependen de B98
                // Estos son cálculos simplificados - reemplazar con fórmulas reales

                // Actualizar empuje de sobrecarga basado en B98
                const factor_sobrecarga = b98 / 2.0; // Factor simplificado
                this.resultados.empuje_sobrecarga_terreno = 32.1 * factor_sobrecarga;
                this.resultados.empuje_sobrecarga_horizontal = 31.6 * factor_sobrecarga;
                this.resultados.empuje_sobrecarga_total = this.resultados.empuje_sobrecarga_terreno;

                // Recalcular empuje resultante
                this.resultados.empuje_resultante =
                    this.resultados.empuje_pasivo_total -
                    this.resultados.empuje_activo_total -
                    this.resultados.empuje_sobrecarga_total;

                //console.log('Empujes calculados con B98 =', b98);

            } catch (error) {
                console.error('Error en cálculo de empujes:', error);
                this.addError('calculo_empujes', 'Error calculando empujes: ' + error.message);
            }
        },


        // Configuración de todos los resultados para la tabla detallada
        get todosLosResultados() {
            return [
                ...this.parametrosBase.map(p => ({ ...p, description: this.getDescripcion(p.key) })),
                ...this.empujePasivoParams.map(p => ({ ...p, description: this.getDescripcion(p.key) })),
                ...this.empujeActivoParams.map(p => ({ ...p, description: this.getDescripcion(p.key) })),
                ...this.empujeSobrecargaParams.map(p => ({ ...p, description: this.getDescripcion(p.key) })),
                {
                    key: 'empuje_pasivo_total',
                    label: 'Empuje Pasivo Total',
                    symbol: 'Ep_total',
                    unit: 'kN/m',
                    description: 'Suma de todos los empujes pasivos'
                },
                {
                    key: 'empuje_activo_total',
                    label: 'Empuje Activo Total',
                    symbol: 'Ea_total',
                    unit: 'kN/m',
                    description: 'Suma de todos los empujes activos'
                },
                {
                    key: 'empuje_sobrecarga_total',
                    label: 'Empuje Sobrecarga Total',
                    symbol: 'Es_total',
                    unit: 'kN/m',
                    description: 'Suma de todos los empujes de sobrecarga'
                },
                {
                    key: 'empuje_resultante',
                    label: 'Empuje Resultante',
                    symbol: 'E_result',
                    unit: 'kN/m',
                    description: 'Empuje neto sobre el muro'
                }
            ];
        },

        // Métodos utilitarios mejorados
        getB98Value() {
            if (this.predimData && this.predimData.resultados && this.predimData.resultados.B98 !== undefined) {
                return this.predimData.resultados.B98;
            }
            if (this.predimData && this.predimData.resultados && this.predimData.resultados.B99 !== undefined) {
                return this.predimData.resultados.B99;
            }
            if (this.predimData && this.predimData.resultados && this.predimData.resultados.B100 !== undefined) {
                return this.predimData.resultados.B100;
            }
            if (this.predimData && this.predimData.resultados && this.predimData.resultados.B101 !== undefined) {
                return this.predimData.resultados.B101;
            }
            if (this.predimData && this.predimData.resultados && this.predimData.resultados.B103 !== undefined) {
                return this.predimData.resultados.B103;
            }
            if (this.predimData && this.predimData.resultados && this.predimData.resultados.B104 !== undefined) {
                return this.predimData.resultados.B104;
            }
            return 0;
        },

        getValue(key) {
            // Primero buscar en resultados propios
            if (this.resultados[key] !== undefined) {
                return this.resultados[key];
            }

            // Luego buscar en datos del predimensionamiento
            if (this.predimData && this.predimData.resultados && this.predimData.resultados[key] !== undefined) {
                return this.predimData.resultados[key];
            }

            return null;
        },

        getParameterValue(key, unit) {
            const value = this.getValue(key);
            if (value === null || value === undefined) {
                return '-';
            }
            return this.formatValue(value) + (unit ? ' ' + unit : '');
        },

        getDescripcion(key) {
            const descripciones = {
                'B98': 'Altura equivalente de sobrecarga del terreno',
                'B99': 'Coeficiente de empuje activo de Rankine',
                'B100': 'Coeficiente de empuje pasivo de Rankine',
                'B101': 'Coeficiente de empuje en reposo',
                'B112': 'Cohesión equivalente del suelo',
                'E74': 'Desplazamiento horizontal del talud',
                'E79': 'Altura efectiva del muro',
                'N78': 'Empuje pasivo cohesivo en el tercio superior',
                'N79': 'Empuje pasivo cohesivo en el tercio medio',
                'N80': 'Empuje pasivo cohesivo en el tercio inferior',
                'S78': 'Empuje pasivo del terreno en el tercio superior',
                'S79': 'Empuje pasivo del terreno en el tercio medio',
                'S80': 'Empuje pasivo del terreno en el tercio inferior',
                'T78': 'Brazo de palanca para empuje superior',
                'T79': 'Brazo de palanca para empuje medio',
                'T80': 'Brazo de palanca para empuje inferior',
                'empuje_activo_terreno': 'Empuje activo total del terreno',
                'empuje_activo_vertical': 'Componente vertical del empuje activo',
                'empuje_activo_horizontal': 'Componente horizontal del empuje activo',
                'presion_activa_min': 'Presión activa mínima en la superficie',
                'presion_activa_max': 'Presión activa máxima en la base',
                'brazo_empuje_activo': 'Brazo de palanca del empuje activo',
                'empuje_sobrecarga_terreno': 'Empuje de sobrecarga del terreno',
                'empuje_sobrecarga_vertical': 'Componente vertical del empuje de sobrecarga',
                'empuje_sobrecarga_horizontal': 'Componente horizontal del empuje de sobrecarga',
                'presion_sobrecarga_min': 'Presión de sobrecarga mínima',
                'presion_sobrecarga_max': 'Presión de sobrecarga máxima',
                'brazo_empuje_sobrecarga': 'Brazo de palanca del empuje de sobrecarga'
            };
            return descripciones[key] || 'Parámetro calculado';
        },

        addError(id, message) {
            if (!this.errors.find(e => e.id === id)) {
                this.errors.push({ id, message });
            }
        },

        clearErrors() {
            this.errors = [];
        },

        formatValue(value) {
            if (value === null || value === undefined || value === '') return '-';
            if (typeof value === 'number') {
                return isNaN(value) ? '-' : value.toFixed(3); // Aumentado a 3 decimales para precisión
            }
            return String(value);
        },

        addError(id, message) {
            if (!this.errors.some(e => e.id === id)) {
                this.errors.push({ id, message });
                NotificationManager.showWarning(message); // Notifica al usuario
            }
        },

        clearErrors() {
            this.errors = [];
        },

        sendDataCargas() {
            const data = {
                resultados: { ...this.resultados },
                errors: [...this.errors],
                isCalculated: this.errors.length === 0 && this.isDataReady
            };

            document.dispatchEvent(new CustomEvent('cargas-updated', {
                detail: data,
                bubbles: true
            }));
            //console.log('🚀 Datos de cargas enviados.');
        },

        get hasErrors() {
            return this.errors.length > 0;
        },
    };
}