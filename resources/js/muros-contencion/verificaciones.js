import { ValidationManager } from './utils/validation.js';
import { NotificationManager } from './utils/notifications.js';

export function Verificaciones() {
    return {
        // Estado de visualización
        showCombinacioncero: true,
        showCombinacioncargas: true,
        showEstabilidadVolteo: false,
        showEstabilidadDeslizamiento: false,
        showpresionesAdmisibles: false,
        showGrafico: false,

        // Datos recibidos
        datosDimensionamiento: {},
        datosCargas: {},
        datosVerificaciones: {},
        datosCalculados: {},
        predimData: null,
        resultados: {},
        errors: [],
        chartInstance: null,

        // Datos de combinaciones de cargas (editables)
        combinacionCargas: [
            { id: '1', comb1: 0, comb2: 0.7, comb3: 0.525, comb4: 0, comb5: 1 },
            { id: '2', comb1: 1, comb2: 1, comb3: 1, comb4: 1, comb5: 1 },
            { id: '3', comb1: 1, comb2: 1, comb3: 1, comb4: 1, comb5: 1 },
            { id: '4', comb1: 1, comb2: 0, comb3: 0.75, comb4: 1, comb5: 1 },
            { id: '5', comb1: 0.6, comb2: 0.6, comb3: 0.6, comb4: 1, comb5: 1 },
            { id: '6', comb1: 0.6, comb2: 0.6, comb3: 0.6, comb4: 1, comb5: 1 },
            { id: '7', comb1: 1, comb2: 1, comb3: 0.75, comb4: 1, comb5: 1 },
            { id: '8', comb1: 1, comb2: 0, comb3: 0.75, comb4: 1, comb5: 1 },
            { id: '9', comb1: 0.6, comb2: 0.6, comb3: 0.6, comb4: 1, comb5: 1 },
            { id: '10', comb1: 0.6, comb2: 0.6, comb3: 0.6, comb4: 1, comb5: 1 },
            { id: '11', comb1: 1, comb2: 1, comb3: 0.75, comb4: 1, comb5: 1 },
            { id: '12', comb1: 1, comb2: 1, comb3: 0.75, comb4: 1, comb5: 1 },
            { id: '13', comb1: 1, comb2: 1, comb3: 0.75, comb4: 1, comb5: 1 },
            { id: '14', comb1: 1, comb2: 1, comb3: 0.75, comb4: 1, comb5: 1 },
            { id: '15', comb1: 1, comb2: 1, comb3: 0.75, comb4: 1, comb5: 1 },
        ],

        // Instancias de tablas
        tableInstances: {},
        isCalculating: false,

        init() {
            //console.log('🔄 Inicializando módulo de vERIFICACIONES...');
            this.configurarEventos();
            // Si hay datos en el store global al iniciar, los procesamos.
            const initialDimData = Alpine.store('systemState').resultadosDimensionamiento;
            if (Alpine.store('systemState').dimensionamientoCompleto && initialDimData) {
                this.handleDimensionamientoData({ detail: { resultados: initialDimData } });
            }
            this.$nextTick(() => {
                this.graficover();
            });
        },

        configurarEventos() {
            document.addEventListener('dimensionamiento-calculated', (event) => this.handleDimensionamientoData(event));
        },

        handleDimensionamientoData(event) {
            //console.log('🔄 Inicializando módulo de vERIFICACIONES... ', event.detail);
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

                // Almacenar los datos recibidos en las propiedades correspondientes
                this.datosCargas = event.detail.inputValues || {};
                this.datosDimensionamiento = event.detail.resultados || {};
                this.predimData = event.detail.predimData || {};

                // Inicializar datos calculados
                this.datosCalculados = {};

                // console.log('Datos cargados:', {
                //     dim: this.datosCargas,
                //     datosDimensionamiento: this.datosDimensionamiento,
                //     predim: this.predimData.inputValues
                // });

                this.calcularVerificaciones();
            } catch (error) {
                console.error('Error procesando datos del dimensionamiento:', error);
                this.addError('procesamiento_datos', 'Error procesando datos del dimensionamiento: ' + error.message);
            }
        },

        calcularVerificaciones() {
            if (this.isCalculating) return;

            this.isCalculating = true;
            try {
                this.clearErrors();
                //console.log('Iniciando cálculos de verificaciones...');

                // Calcular componentes y actualizar datos
                this.calcularComponentes();

                // Crear y actualizar todas las tablas
                this.createTableCombinacionCargas();
                this.createTableEstabilidadVolteo();
                this.createTableEstabilidadDeslizamiento();
                this.createTablePresionesAdmisibles();
                this.graficover();

                // Actualizar visualización
                this.showEstabilidadVolteo = true;
                this.showEstabilidadDeslizamiento = true;
                this.showpresionesAdmisibles = true;
                this.showGrafico = true;
                // Notificar cambios
                this.enviarDatosVerificaciones();

                //console.log('Cálculos completados:', this.datosCalculados);
            } catch (error) {
                console.error('Error en cálculos de verificaciones:', error);
                this.addError('calculo', 'Error en los cálculos de verificaciones: ' + error.message);
            } finally {
                this.isCalculating = false;
            }
        },

        // Define the component configurations
        get combinacionestable() {
            const baseConfig = [
                { key: 'componente1', label: '2', areaKey: 'B171', pesoKey: 'C171', fxKey: 'D171', brazoYKey: 'E171', brazoXKey: 'F171', momentoKey: 'G171', friccionKey: 'H171', description: 'Empuje sismico' },
                { key: 'componente2', label: '3', areaKey: 'B172', pesoKey: 'C172', fxKey: 'D172', brazoYKey: 'E172', brazoXKey: 'F172', momentoKey: 'G172', friccionKey: 'H172', description: 'Empuje ACTIVO' },
                { key: 'componente3', label: '', areaKey: 'B173', pesoKey: 'C173', fxKey: 'D173', brazoYKey: 'E173', brazoXKey: 'F173', momentoKey: 'G173', friccionKey: 'H173', description: 'Emp ACTI COH' },
                { key: 'componente4', label: '5', areaKey: 'B174', pesoKey: 'C174', fxKey: 'D174', brazoYKey: 'E174', brazoXKey: 'F174', momentoKey: 'G174', friccionKey: 'H174', description: 'Empuje s/c' },
                { key: 'componente5', label: '4', areaKey: 'B175', pesoKey: 'C175', fxKey: 'D175', brazoYKey: 'E175', brazoXKey: 'F175', momentoKey: 'G175', friccionKey: 'H175', description: 'EMPUJE PASIVO' },
                { key: 'componente6', label: '', areaKey: 'B176', pesoKey: 'C176', fxKey: 'D176', brazoYKey: 'E176', brazoXKey: 'F176', momentoKey: 'G176', friccionKey: 'H176', description: 'Emp PASI COH' },
                { key: 'componente7', label: '1', areaKey: 'B177', pesoKey: 'C177', fxKey: 'D177', brazoYKey: 'E177', brazoXKey: 'F177', momentoKey: 'G177', friccionKey: 'H177', description: 'CARGA PUNTUA' },
                { key: 'componente8', label: '6', areaKey: 'B178', pesoKey: 'C178', fxKey: 'D178', brazoYKey: 'E178', brazoXKey: 'F178', momentoKey: 'G178', friccionKey: 'H178', description: 'S/C' },
                { key: 'componente9', label: '7', areaKey: 'B179', pesoKey: 'C179', fxKey: 'D179', brazoYKey: 'E179', brazoXKey: 'F179', momentoKey: 'G179', friccionKey: 'H179', description: 'SUELO TALUD' },
                { key: 'componente10', label: '8', areaKey: 'B180', pesoKey: 'C180', fxKey: 'D180', brazoYKey: 'E180', brazoXKey: 'F180', momentoKey: 'G180', friccionKey: 'H180', description: 'SUELO' },
                { key: 'componente11', label: '9', areaKey: 'B181', pesoKey: 'C181', fxKey: 'D181', brazoYKey: 'E181', brazoXKey: 'F181', momentoKey: 'G181', friccionKey: 'H181', description: 'BASE' },
                { key: 'componente12', label: '10', areaKey: 'B182', pesoKey: 'C182', fxKey: 'D182', brazoYKey: 'E182', brazoXKey: 'F182', momentoKey: 'G182', friccionKey: 'H182', description: 'CUÑA' },
                { key: 'componente13', label: '11', areaKey: 'B183', pesoKey: 'C183', fxKey: 'D183', brazoYKey: 'E183', brazoXKey: 'F183', momentoKey: 'G183', friccionKey: 'H183', description: 'PANTALLA' },
                { key: 'componente14', label: '12', areaKey: 'B184', pesoKey: 'C184', fxKey: 'D184', brazoYKey: 'E184', brazoXKey: 'F184', momentoKey: 'G184', friccionKey: 'H184', description: 'DIENTE' },
                { key: 'componente15', label: '', areaKey: 'B185', pesoKey: 'C185', fxKey: 'D185', brazoYKey: 'E185', brazoXKey: 'F185', momentoKey: 'G185', friccionKey: 'H185', description: 'Cof. Cohes' }
            ];

            // Dynamically generate additional components if needed
            const additionalComponents = Array.from({ length: 4 }, (_, i) => ({
                key: `componente${16 + i}`,
                label: '',
                areaKey: `B${185 + i}`,
                pesoKey: `C${185 + i}`,
                fxKey: `D${185 + i}`,
                brazoYKey: `E${185 + i}`,
                brazoXKey: `F${185 + i}`,
                momentoKey: `G${185 + i}`,
                friccionKey: `H${185 + i}`,
                description: `Component ${16 + i}`,
            }));

            return [...baseConfig,];
        },

        // Helper to safely get values from different data sources
        getValue(key, defaultValue = 0) {
            if (this.datosCalculados && this.datosCalculados[key] !== undefined) {
                return this.datosCalculados[key];
            }
            if (this.datosDimensionamiento && this.datosDimensionamiento[key] !== undefined) {
                return this.datosDimensionamiento[key];
            }
            if (this.datosCargas && this.datosCargas[key] !== undefined) {
                return this.datosCargas[key];
            }
            return defaultValue;
        },

        parseNumericValue(value) {
            if (value === null || value === undefined || value === '') return 0;
            const numValue = parseFloat(value);
            return isNaN(numValue) ? 0 : numValue;
        },

        formatearValor(value) {
            if (value === null || value === undefined) return '0.0000';
            const num = parseFloat(value);
            return isNaN(num) ? '0.0000' : num.toFixed(4);
        },

        calcularComponentes() {
            // Initialize calculated data
            // Usar los datos almacenados
            // Helper para convertir a número seguro
            const toNum = (val) => {
                const n = parseFloat(val);
                return isNaN(n) ? 0 : n;
            };

            const gv = this.datosCargas || {};
            const materiales = this.predimData?.inputValues || {};
            const resultados = this.datosDimensionamiento || {};

            const c96 = gv?.C96 ?? '';

            const commonValues = {
                B90: toNum(gv.B90),
                F172: toNum(gv.A89) + toNum(gv.B88),
                E173: toNum(this.getValue('B119')) / 2,
                F177: toNum(gv.C74) / 2 + toNum(gv.A83) + toNum(gv.A89),
                F178: toNum(gv.D89) / 2 + toNum(gv.B88) + toNum(gv.A89),
                C178: toNum(materiales.B25) * toNum(gv.D89),

                //-- 
                B179: toNum(gv.D89) * toNum(gv.E74),
                F179: 2 * toNum(gv.D89) / 3 + toNum(gv.A89) + toNum(gv.B88),

                //-- 
                B180: toNum(gv.D89) * toNum(gv.E79),
                C180: toNum(gv.D89) * toNum(gv.E79) * toNum(materiales.B11),
                F180: toNum(gv.D89) / 2 + toNum(gv.B88) + toNum(gv.A89),
                G180: (toNum(gv.D89) * toNum(gv.E79) * toNum(materiales.B11)) *
                    (toNum(gv.D89) / 2 + toNum(gv.B88) + toNum(gv.A89)),
                H180: (toNum(gv.D89) * toNum(gv.E79) * toNum(materiales.B11)) * toNum(materiales.B14),

                //-- 
                B181: toNum(gv.B90) * toNum(gv.F86),
                C181: (toNum(gv.B90) * toNum(gv.F86)) * toNum(materiales.B6),
                F181: toNum(gv.B90) / 2,
                G181: ((toNum(gv.B90) * toNum(gv.F86)) * toNum(materiales.B6)) * (toNum(gv.B90) / 2),
                H181: ((toNum(gv.B90) * toNum(gv.F86)) * toNum(materiales.B6)) * toNum(materiales.B14),

                //-- 
                B182: toNum(gv.A83) * toNum(gv.E79) * 0.5,
                C182: (toNum(gv.A83) * toNum(gv.E79) * 0.5) * toNum(materiales.B6),
                F182: 2 * toNum(gv.A83) / 3 + toNum(gv.A89),
                G182: ((toNum(gv.A83) * toNum(gv.E79) * 0.5) * toNum(materiales.B6)) *
                    (2 * toNum(gv.A83) / 3 + toNum(gv.A89)),
                H182: ((toNum(gv.A83) * toNum(gv.E79) * 0.5) * toNum(materiales.B6)) * toNum(materiales.B14),

                //-- 
                B183: toNum(gv.C74) * toNum(gv.E79),
                C183: (toNum(gv.C74) * toNum(gv.E79)) * toNum(materiales.B6),
                F183: toNum(gv.C74) / 2 + toNum(gv.A83) + toNum(gv.A89),
                G183: ((toNum(gv.C74) * toNum(gv.E79)) * toNum(materiales.B6)) *
                    (toNum(gv.C74) / 2 + toNum(gv.A83) + toNum(gv.A89)),
                H183: (toNum(gv.F95) + toNum(gv.F91)) * toNum(gv.G94) / 2,

                //-- 
                B184: (toNum(gv.F95) + toNum(gv.F91)) * toNum(gv.G94) / 2,
                C184: (((toNum(gv.F95) + toNum(gv.F91)) * toNum(gv.G94) / 2)) * toNum(materiales.B6),
                F184: toNum(gv.C92),
                G184: (((toNum(gv.F95) + toNum(gv.F91)) * toNum(gv.G94) / 2) * toNum(materiales.B6)) * toNum(gv.C92),
                H184: (((toNum(gv.F95) + toNum(gv.F91)) * toNum(gv.G94) / 2) * toNum(materiales.B6)) * toNum(materiales.B14),

                //-- 
                H185: (gv?.C96 === "SI") ? (toNum(materiales.B13) * toNum(gv.B90)) : 0,
            };

            // Component-specific calculations
            const calculations = [
                {
                    areaKey: 'B171', area: 0.00, peso: 0, fx: this.getValue('C160'), brazoY: this.getValue('C162'), brazoX: 0,
                    momento: () => this.datosCalculados.D171 * this.datosCalculados.E171, friccion: () => this.datosCalculados.D171,
                },
                {
                    areaKey: 'B172', area: 0.00, peso: this.getValue('B124'), fx: this.getValue('B125'), brazoY: this.getValue('E172'), brazoX: commonValues.F172,
                    momento: () => this.datosCalculados.E172 * this.datosCalculados.D172 - this.datosCalculados.C172 * this.datosCalculados.F172,
                    friccion: () => this.datosCalculados.D172,
                },
                {
                    areaKey: 'B173', area: 0.00, peso: this.getValue('B129'), fx: this.getValue('B130'), brazoY: commonValues.E173, brazoX: commonValues.F172,
                    momento: () => this.datosCalculados.E173 * this.datosCalculados.D173 - this.datosCalculados.C173 * this.datosCalculados.F173,
                    friccion: () => this.datosCalculados.D173,
                },
                {
                    areaKey: 'B174', area: 0.00, peso: this.getValue('B137'), fx: this.getValue('B138'), brazoY: commonValues.E173, brazoX: commonValues.F172,
                    momento: () => this.datosCalculados.E174 * this.datosCalculados.D174 - this.datosCalculados.C174 * this.datosCalculados.F174,
                    friccion: () => this.datosCalculados.D174,
                },
                {
                    areaKey: 'B175', area: 0.00, peso: 0.00, fx: this.getValue('B110'), brazoY: this.getValue('E175'), brazoX: 0.00,
                    momento: () => this.datosCalculados.D175 * this.datosCalculados.E175, friccion: () => this.datosCalculados.D175,
                },
                {
                    areaKey: 'B176', area: 0.00, peso: 0.00, fx: this.getValue('B115'), brazoY: this.getValue('E175'), brazoX: 0.00,
                    momento: () => this.datosCalculados.D176 * this.datosCalculados.E176, friccion: () => this.datosCalculados.D176,
                },
                {
                    areaKey: 'B177', area: 0.00, peso: 0.00, fx: 0.00, brazoY: 0.00,
                    brazoX: () => commonValues.F177,
                    momento: () => 0 * commonValues.F177,
                    friccion: () => 0 * (materiales?.B14 ?? 0),
                },
                {
                    areaKey: 'B178', area: 0,
                    peso: () => commonValues.C178, fx: 0.00, brazoY: 0.00,
                    brazoX: () => commonValues.F178,
                    momento: () => commonValues.C178 * commonValues.F178,
                    friccion: () => commonValues.C178 * (materiales?.B14 ?? 0)
                },
                {
                    areaKey: 'B179',
                    area: () => commonValues.B179,
                    peso: () => commonValues.B179 * (materiales?.B11 ?? 0),
                    fx: 0.00, brazoY: 0.00,
                    brazoX: () => commonValues.F179,
                    momento: () => commonValues.B179 * (materiales?.B11 ?? 0) * commonValues.F179,
                    friccion: () => (commonValues.B179 * (materiales?.B11 ?? 0)) * (materiales?.B14 ?? 0)
                },
                { areaKey: 'B180', area: () => commonValues.B180, peso: () => commonValues.C180, fx: 0.00, brazoY: 0.00, brazoX: () => commonValues.F180, momento: () => commonValues.G180, friccion: () => commonValues.H180 },
                { areaKey: 'B181', area: () => commonValues.B181, peso: () => commonValues.C181, fx: 0.00, brazoY: 0.00, brazoX: () => commonValues.F181, momento: () => commonValues.G181, friccion: () => commonValues.H181 },
                { areaKey: 'B182', area: () => commonValues.B182, peso: () => commonValues.C182, fx: 0.00, brazoY: 0.00, brazoX: () => commonValues.F182, momento: () => commonValues.G182, friccion: () => commonValues.H182 },
                { areaKey: 'B183', area: () => commonValues.B183, peso: () => commonValues.C183, fx: 0.00, brazoY: 0.00, brazoX: () => commonValues.F183, momento: () => commonValues.G183, friccion: () => commonValues.H183 },
                { areaKey: 'B184', area: () => commonValues.B184, peso: () => commonValues.C184, fx: 0.00, brazoY: 0.00, brazoX: () => commonValues.F184, momento: () => commonValues.G184, friccion: () => commonValues.H184 },
                { areaKey: 'B185', area: 0.00, peso: 0.00, fx: 0.00, brazoY: 0.00, brazoX: 0.00, momento: () => 0.00, friccion: () => commonValues.H185 },
            ];

            const resolve = val => (typeof val === 'function' ? val() : val);

            // Primera pasada: cargar valores base (área, peso, fx, brazoY, brazoX)
            calculations.forEach(calc => {
                const id = calc.areaKey.slice(1);

                this.datosCalculados[calc.areaKey] = resolve(calc.area);
                this.datosCalculados[calc.pesoKey || `C${id}`] = resolve(calc.peso); // <- corregido
                this.datosCalculados[calc.fxKey || `D${id}`] = calc.fx;
                this.datosCalculados[calc.brazoYKey || `E${id}`] = calc.brazoY;
                this.datosCalculados[calc.brazoXKey || `F${id}`] = typeof calc.brazoX === 'function' ? calc.brazoX() : calc.brazoX;
            });

            // Segunda pasada: evaluar momento y fricción cuando datos ya están cargados
            calculations.forEach(calc => {
                const id = calc.areaKey.slice(1);

                const momento = typeof calc.momento === 'function' ? calc.momento() : calc.momento;
                const friccion = typeof calc.friccion === 'function' ? calc.friccion() : calc.friccion;

                this.datosCalculados[calc.momentoKey || `G${id}`] = momento;
                this.datosCalculados[calc.friccionKey || `H${id}`] = friccion;

                // console.log(`Calculado para ${id}:`, {
                //     momento: this.datosCalculados[`G${id}`],
                //     friccion: this.datosCalculados[`H${id}`]
                // });
            });

            // Cálculo de verificaciones totales
            this.calcularVerificacionesTotal();

            // Sort combinacionestable by momento in descending order
            this.combinacionestable.sort((a, b) => {
                const momentoA = this.datosCalculados[a.momentoKey] || 0;
                const momentoB = this.datosCalculados[b.momentoKey] || 0;
                return momentoB - momentoA;
            });
            this.createTableEstabilidadVolteo();
        },

        calcularVerificacionesTotal() {
            // C186: Suma de toda la columna pesos (C171 a C185)
            let sumaPesos = 0;
            for (let i = 171; i <= 185; i++) {
                sumaPesos += this.datosCalculados[`C${i}`] || 0;
            }

            this.datosCalculados.C186 = this.formatearValor(sumaPesos);

            // G186: Suma de momentos desde la fila 6 hasta la fila 12 (G177 a G183)
            let sumaMomentos = 0;
            for (let i = 177; i <= 183; i++) {
                sumaMomentos += this.datosCalculados[`G${i}`] || 0;
            }
            this.datosCalculados.G186 = this.formatearValor(sumaMomentos);

            // C187: Suma de fricción desde la fila 9 hasta la 12 (H180 a H183)
            let sumaFriccion = 0;
            for (let i = 181; i <= 184; i++) {
                sumaFriccion += this.datosCalculados[`B${i}`] || 0;
            }
            //console.log(sumaFriccion);
            this.datosCalculados.C187 = this.formatearValor(sumaFriccion);
        },

        getBaseColumns() {
            const columns = [
                { title: "D+L+(Hó0.6H)", field: "comb1", editor: "number", headerSort: false, cssClass: "text-center", visible: this.predimData?.inputValues?.D35 ?? true },
                { title: "D+(Hó0.6H)+0.70E", field: "comb2", editor: "number", headerSort: false, cssClass: "text-center", visible: this.predimData?.inputValues?.D36 ?? true },
                { title: "0.75D+0.75L+0.525E+0.6H", field: "comb3", editor: "number", headerSort: false, cssClass: "text-center", visible: this.predimData?.inputValues?.D37 ?? true },
                { title: "D+L+H", field: "comb4", editor: "number", headerSort: false, cssClass: "text-center", visible: this.predimData?.inputValues?.D38 ?? true },
                { title: "D+L+H+E", field: "comb5", editor: "number", headerSort: false, cssClass: "text-center font-semibold text-blue-600", visible: this.predimData?.inputValues?.D39 ?? true },
            ];
            return columns;
        },

        // Método para actualizar la visibilidad de las columnas en todas las tablas
        updateColumnVisibility() {
            const tables = [
                'combinacion-cargas',
                'estabilidad-volteo',
                'estabilidad-deslizamiento',
                'presiones-admisibles'
            ];

            tables.forEach(tableKey => {
                const table = this.tableInstances[tableKey];
                if (table) {
                    ['comb1', 'comb2', 'comb3', 'comb4', 'comb5'].forEach((combField, index) => {
                        const dField = `D${35 + index}`;
                        const isVisible = this.predimData?.inputValues?.[dField] ?? true;
                        table.getColumn(combField)?.toggle(isVisible);
                    });
                }
            });
        },

        createTableCombinacionCargas() {
            const container = document.getElementById("table-combinacion-cargas");
            if (!container) {
                console.error("Contenedor 'table-combinacion-cargas' no encontrado");
                return;
            }

            if (this.tableInstances['combinacion-cargas']) {
                this.tableInstances['combinacion-cargas'].destroy();
                delete this.tableInstances['combinacion-cargas'];
            }

            if (typeof Tabulator === 'undefined') {
                console.error('Tabulator no está definido. Asegúrese de incluir la biblioteca Tabulator.');
                return;
            }

            this.tableInstances['combinacion-cargas'] = new Tabulator(container, {
                data: this.combinacionCargas,
                tableBuilt: () => {
                    this.updateColumnVisibility();
                    this.recalcularVerificaciones();
                },
                layout: "fitColumns",
                responsiveLayout: "hide",
                pagination: false,
                columns: this.getBaseColumns(),
                cssClass: "tabulator-modern",
                spreadsheet: true,
                spreadsheetRows: 17,
                spreadsheetColumns: 40,
                editTriggerEvent: "dblclick",
                editorEmptyValue: undefined,
                selectable: true,
                selectableRange: true,
                selectableRangeColumns: true,
                clipboard: true,
                clipboardCopyStyled: false,
                clipboardCopyConfig: { rowHeaders: false, columnHeaders: false },
                clipboardCopyRowRange: "range",
                clipboardPasteParser: "range",
                clipboardPasteAction: "range",
                cellEdited: (cell) => {
                    const rowData = cell.getRow().getData();
                    const field = cell.getField();
                    const value = cell.getValue();
                    const rowIndex = this.combinacionCargas.findIndex(row => row.id === rowData.id);
                    if (rowIndex !== -1) {
                        this.combinacionCargas[rowIndex][field] = this.parseNumericValue(value);
                        //console.log(`Combinación de cargas actualizada: ${field} = ${value} en fila ${rowData.id}`);
                        // Al editar la tabla de combinaciones, recalcular todo el flujo
                        this.recalcularVerificaciones();
                    }
                },
            });
        },

        createTableEstabilidadVolteo() {
            this.crearTablaResultados(
                'table-Estabilidad-Volteo',
                'estabilidad-volteo',
                'momentos',
                'Estabilidad a Volteo'
            );
        },

        createTableEstabilidadDeslizamiento() {
            this.crearTablaResultados(
                'table-Estabilidad-Deslizamiento',
                'estabilidad-deslizamiento',
                'fricciones',
                'Estabilidad a Deslizamiento'
            );
        },

        createTablePresionesAdmisibles() {
            this.crearTablaResultados(
                'table-Presiones-Admisibles',
                'presiones-admisibles',
                'pesos',
                'Presiones Admisibles'
            );
        },

        crearTablaResultados(containerId, tableKey, dataKey, tableName) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Contenedor '${containerId}' no encontrado`);
                return;
            }

            if (this.tableInstances[tableKey]) {
                this.tableInstances[tableKey].destroy();
            }

            if (typeof Tabulator === 'undefined') {
                console.error('Tabulator no está definido. Asegúrese de incluir la biblioteca Tabulator.');
                return;
            }

            const tableData = this.generarDatosTabla(dataKey);
            //console.log(`Generando tabla ${tableName} con datos:`, tableData);

            this.tableInstances[tableKey] = new Tabulator(container, {
                data: tableData,
                layout: "fitDataFill",
                //responsiveLayout: "hide",
                pagination: false,
                columns: [
                    { title: "Componente", field: "description", cssClass: "text-left font-medium", headerSort: false },
                    { title: "COMB1", field: "comb1", cssClass: "text-center", formatter: "number", formatterParams: { precision: 4 }, visible: this.predimData?.inputValues?.D35 ?? true },
                    { title: "COMB2", field: "comb2", cssClass: "text-center", formatter: "number", formatterParams: { precision: 4 }, visible: this.predimData?.inputValues?.D36 ?? true },
                    { title: "COMB3", field: "comb3", cssClass: "text-center", formatter: "number", formatterParams: { precision: 4 }, visible: this.predimData?.inputValues?.D37 ?? true },
                    { title: "COMB4", field: "comb4", cssClass: "text-center", formatter: "number", formatterParams: { precision: 4 }, visible: this.predimData?.inputValues?.D38 ?? true },
                    { title: "COMB5", field: "comb5", cssClass: "text-center font-semibold text-blue-600", formatter: "number", formatterParams: { precision: 4 }, visible: this.predimData?.inputValues?.D39 ?? true },
                ],
                cssClass: "tabulator-modern",
                height: "400px",
                layout: "fitDataFill",
            });
            //console.log(`Tabla ${tableName} creada con datos:`, tableData);
        },

        generarDatosTabla(dataKey) {
            const componentes = this.obtenerComponentes();
            //console.log("los datos a procesar son ", componentes)
            // Mapear la clave de datos a la clave real de cada componente
            // momentos -> Gxxx, fricciones -> Hxxx, pesos -> Cxxx
            let keyPrefix = '';
            if (dataKey === 'momentos') keyPrefix = 'G';
            else if (dataKey === 'fricciones') keyPrefix = 'H';
            else if (dataKey === 'pesos') keyPrefix = 'C';

            // Generar filas normales
            const filas = componentes.map((componente, index) => {
                const valorKey = keyPrefix + componente.key.slice(1);
                //console.log("los datos a valorKey son ", valorKey);
                //console.log('Obteniendo valor para:', valorKey, 'de datosCalculados:', this.datosCalculados[valorKey]);

                const baseValue = this.datosCalculados[valorKey] || 0;
                //console.log("los datos a baseValue son ", baseValue);
                const row = {
                    id: `comp${index + 1}`,
                    description: componente.description,
                };

                // Aplicar coeficientes de combinación
                this.combinacionCargas.forEach((combinacion, combIndex) => {
                    const coeficiente = this.obtenerCoeficienteCombinacion(`comb${combIndex + 1}`, index);
                    const resultado = baseValue * coeficiente;
                    row[`comb${combIndex + 1}`] = this.formatearValor(resultado);
                });

                return row;
            });

            //console.log("los datos a filas son ", filas)
            // Si es la tabla de momentos (volteo), agregar filas estáticas
            if (dataKey === 'momentos' || dataKey === 'fricciones' || dataKey === 'pesos') {
                // Índices para Mr/Rr (EMPUJE PASIVO a Cof. Cohes)
                const idxRrStart = componentes.findIndex(f => f.description === 'EMPUJE PASIVO');
                const idxRrEnd = componentes.findIndex(f => f.description === 'Cof. Cohes');
                // Índices para Mv/Rv (Empuje sismico a Empuje s/c)
                const idxRvStart = componentes.findIndex(f => f.description === 'Empuje sismico');
                const idxRvEnd = componentes.findIndex(f => f.description === 'Empuje s/c');
                const combs = ['comb1', 'comb2', 'comb3', 'comb4', 'comb5'];

                // Declarar filaMrMv fuera del bloque condicional
                let filaMrMv = {};

                // Para momentos (volteo)
                if (dataKey === 'momentos') {
                    const Mr = {}, Mv = {};
                    combs.forEach(combId => {
                        let sumaMr = 0, sumaMv = 0;
                        for (let i = idxRrStart; i <= idxRrEnd; i++) sumaMr += parseFloat(filas[i][combId].replace(/,/g, '')) || 0;
                        for (let i = idxRvStart; i <= idxRvEnd; i++) sumaMv += parseFloat(filas[i][combId].replace(/,/g, '')) || 0;
                        Mr[combId] = sumaMr;
                        Mv[combId] = sumaMv;
                    });
                    const filaMr = { id: 'filaMr', description: 'Mr=' };
                    const filaMv = { id: 'filaMv', description: 'Mv=' };
                    const filaFSV = { id: 'filaFSV', description: 'FSV=' };
                    filaMrMv = { id: 'filaMrMv', description: 'Mr-Mv=' };
                    combs.forEach(combId => {
                        filaMr[combId] = this.formatearValor(Mr[combId]);
                        filaMv[combId] = this.formatearValor(Mv[combId]);
                        filaFSV[combId] = this.formatearValor(Mv[combId] !== 0 ? Mr[combId] / Mv[combId] : 0);
                        filaMrMv[combId] = this.formatearValor(Mr[combId] - Mv[combId]);
                    });
                    filas.push(filaMr, filaMv, filaFSV, filaMrMv);
                    //console.log('filaMrMv calculado en momentos:', filaMrMv);
                }

                // Para fricciones (deslizamiento)
                if (dataKey === 'fricciones') {
                    const Rr = {}, Rv = {};
                    combs.forEach(combId => {
                        let sumaRr = 0, sumaRv = 0;
                        for (let i = idxRrStart; i <= idxRrEnd; i++) sumaRr += parseFloat(filas[i][combId].replace(/,/g, '')) || 0;
                        for (let i = idxRvStart; i <= idxRvEnd; i++) sumaRv += parseFloat(filas[i][combId].replace(/,/g, '')) || 0;
                        Rr[combId] = sumaRr;
                        Rv[combId] = sumaRv;
                    });
                    const filaRr = { id: 'filaRr', description: 'Rr=' };
                    const filaRv = { id: 'filaRv', description: 'Rv=' };
                    const filaFSD = { id: 'filaFSD', description: 'FSD=' };
                    combs.forEach(combId => {
                        filaRr[combId] = this.formatearValor(Rr[combId]);
                        filaRv[combId] = this.formatearValor(Rv[combId]);
                        filaFSD[combId] = this.formatearValor(Rv[combId] !== 0 ? Rr[combId] / Rv[combId] : 0);
                    });
                    filas.push(filaRr, filaRv, filaFSD);
                }

                // Para presiones admisibles
                if (dataKey === 'pesos') {
                    const Rv = {};
                    combs.forEach(combId => {
                        let sumaRv = 0;
                        for (let i = idxRrStart; i <= idxRrEnd; i++) sumaRv += parseFloat(filas[i][combId].replace(/,/g, '')) || 0;
                        Rv[combId] = sumaRv;
                    });

                    // Obtener Mr-Mv de la tabla volteo - múltiples intentos
                    let MrMvVolteo = {};

                    // Método 1: Desde tableInstances
                    if (this.tableInstances && this.tableInstances['estabilidad-volteo']) {
                        const datosVolteo = this.tableInstances['estabilidad-volteo'].getData();
                        const filaMrMvVolteo = datosVolteo.find(row => row.id === 'filaMrMv');
                        if (filaMrMvVolteo) {
                            MrMvVolteo = { ...filaMrMvVolteo };
                            //console.log('filaMrMv obtenido de volteo (método 1):', MrMvVolteo);
                        }
                    }

                    // Método 2: Regenerar datos de momentos si no se encontraron
                    if (!MrMvVolteo.comb1) {
                        //console.log('Regenerando datos de momentos para obtener Mr-Mv...');
                        const datosMomentos = this.generarDatosTabla('momentos');
                        const filaMrMvMomentos = datosMomentos.find(row => row.id === 'filaMrMv');
                        if (filaMrMvMomentos) {
                            MrMvVolteo = { ...filaMrMvMomentos };
                            //console.log('filaMrMv obtenido regenerando momentos:', MrMvVolteo);
                        }
                    }

                    // Método 3: Calcular directamente si aún no se tiene
                    if (!MrMvVolteo.comb1) {
                        //console.log('Calculando Mr-Mv directamente...');
                        //console.log('Índices - RrStart:', idxRrStart, 'RrEnd:', idxRrEnd, 'RvStart:', idxRvStart, 'RvEnd:', idxRvEnd);

                        // Verificar que los índices sean válidos
                        if (idxRrStart === -1 || idxRrEnd === -1 || idxRvStart === -1 || idxRvEnd === -1) {
                            //console.error('Índices no válidos para el cálculo de Mr-Mv');
                            // Usar valores por defecto o buscar de otra manera
                            MrMvVolteo = { id: 'filaMrMv', description: 'Mr-Mv=' };
                            combs.forEach(combId => {
                                MrMvVolteo[combId] = '0.00';
                            });
                        } else {
                            const Mr = {}, Mv = {};
                            combs.forEach(combId => {
                                let sumaMr = 0, sumaMv = 0;

                                // Calcular Mr (momentos resistentes)
                                for (let i = idxRrStart; i <= idxRrEnd; i++) {
                                    if (filas[i]) {
                                        const valor = parseFloat(filas[i][combId].replace(/,/g, '')) || 0;
                                        sumaMr += valor;
                                        //console.log(`Mr[${combId}] += ${valor} (fila ${i})`);
                                    }
                                }

                                // Calcular Mv (momentos volcantes)
                                for (let i = idxRvStart; i <= idxRvEnd; i++) {
                                    if (filas[i]) {
                                        const valor = parseFloat(filas[i][combId].replace(/,/g, '')) || 0;
                                        sumaMv += valor;
                                        //console.log(`Mv[${combId}] += ${valor} (fila ${i})`);
                                    }
                                }

                                Mr[combId] = sumaMr;
                                Mv[combId] = sumaMv;
                                //console.log(`${combId}: Mr=${sumaMr}, Mv=${sumaMv}, Mr-Mv=${sumaMr - sumaMv}`);
                            });

                            MrMvVolteo = { id: 'filaMrMv', description: 'Mr-Mv=' };
                            combs.forEach(combId => {
                                MrMvVolteo[combId] = this.formatearValor(Mr[combId] - Mv[combId]);
                            });
                            //console.log('filaMrMv calculado directamente:', MrMvVolteo);
                        }
                    }

                    // B y e
                    const gv = this.datosCargas;
                    const B = gv?.B90 ?? 0;

                    // Crear filas para presiones admisibles
                    const filaRv = { id: 'filaRv', description: 'Rv=' };
                    const filaE = { id: 'filaE', description: 'e=' };
                    const filaB = { id: 'filaB', description: 'B=' };
                    const filaL3 = { id: 'filaL3', description: 'L/3=' };
                    const fila2L3 = { id: 'fila2L3', description: '2L/3=' };
                    const filaS1 = { id: 'filaS1', description: 's1=' };
                    const filaS2 = { id: 'filaS2', description: 's2=' };

                    combs.forEach(combId => {
                        const rv = Rv[combId];
                        // Usar los valores de MrMvVolteo para calcular e
                        const mrmv = MrMvVolteo[combId] ? parseFloat(MrMvVolteo[combId].replace(/,/g, '')) : 0;
                        //console.log(`Combinación ${combId}: rv=${rv}, mrmv=${mrmv}`);

                        const e = rv !== 0 ? mrmv / rv : 0;
                        filaRv[combId] = this.formatearValor(rv);
                        filaE[combId] = this.formatearValor(e);
                        filaB[combId] = this.formatearValor(B);
                        filaL3[combId] = this.formatearValor(B / 3);
                        fila2L3[combId] = this.formatearValor(2 * B / 3);

                        // s1 = (4*B-6*e)*Rv/(B*B)
                        const s1 = B !== 0 ? ((4 * B - 6 * e) * rv) / (B * B) : 0;
                        // s2 = (-2*B+6*e)*Rv/(B*B)
                        const s2 = B !== 0 ? ((-2 * B + 6 * e) * rv) / (B * B) : 0;
                        filaS1[combId] = this.formatearValor(s1);
                        filaS2[combId] = this.formatearValor(s2);
                    });

                    filas.push(filaRv, filaE, filaB, filaL3, fila2L3, filaS1, filaS2);
                }
            }
            return filas;
        },

        graficover() {
            // Generar datos de la tabla de pesos para obtener s1 y s2
            const datosPesos = this.generarDatosTabla('pesos');

            // Encontrar las filas s1 y s2
            const filaS1 = datosPesos.find(row => row.id === 'filaS1');
            const filaS2 = datosPesos.find(row => row.id === 'filaS2');
            const filaB = datosPesos.find(row => row.id === 'filaB');

            if (!filaS1 || !filaS2 || !filaB) {
                console.error('No se encontraron las filas s1, s2 o B');
                return;
            }

            // Obtener el valor de B (ancho de la zapata)
            const B = parseFloat(filaB.comb1.replace(/,/g, '')) || 0;

            // Preparar datos para cada combinación
            const combinaciones = ['comb1', 'comb2', 'comb3', 'comb4', 'comb5'];
            const series = [];
            const colores = ['#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];

            combinaciones.forEach((comb, index) => {
                const s1 = parseFloat(filaS1[comb]?.replace(/,/g, '')) || 0;
                const s2 = parseFloat(filaS2[comb]?.replace(/,/g, '')) || 0;

                // Calcular puntos para el diagrama de presiones
                // Punto inicial (x=0, y=s1)
                // Punto final (x=B, y=s2)
                const data = [
                    [0, -s1],
                    [B, -s2],
                    [B, 0],
                ];

                series.push({
                    name: `Comb ${index + 1}`,
                    type: 'line',
                    data: data,
                    lineStyle: {
                        color: colores[index],
                        width: 2
                    },
                    symbol: 'circle',
                    symbolSize: 4,
                    itemStyle: {
                        color: colores[index]
                    }
                });
            });

            // Configuración del gráfico
            const option = {
                title: {
                    text: 'Diagrama de Presiones en la Base',
                    left: 'center',
                    textStyle: {
                        fontSize: 14,
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        let result = `Posición: ${params[0].data[0].toFixed(2)} m<br/>`;
                        params.forEach(param => {
                            result += `${param.seriesName}: ${param.data[1].toFixed(2)} t/m²<br/>`;
                        });
                        return result;
                    }
                },
                legend: {
                    data: combinaciones.map((_, i) => `Comb ${i + 1}`),
                    bottom: 10
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    name: 'Posición (m)',
                    nameLocation: 'middle',
                    nameGap: 30,
                    min: 0,
                    max: B > 0 ? B : 5,
                    axisLine: {
                        lineStyle: {
                            color: '#666'
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'dashed',
                            color: '#e0e0e0'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Presión (t/m²)',
                    nameLocation: 'middle',
                    nameGap: 40,
                    axisLine: {
                        lineStyle: {
                            color: '#666'
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'dashed',
                            color: '#e0e0e0'
                        }
                    },
                    // Agregar línea en y=0 si hay valores negativos
                    axisPointer: {
                        type: 'line'
                    }
                },
                series: series,
                // Agregar línea de referencia en y=0
                graphic: {
                    elements: [{
                        type: 'line',
                        shape: {
                            x1: 0,
                            y1: 0,
                            x2: B,
                            y2: 0
                        },
                        style: {
                            stroke: '#333',
                            lineWidth: 1,
                            lineDash: [5, 5]
                        }
                    }]
                }
            };

            // Inicializar o actualizar el gráfico
            const chartContainer = document.getElementById('grafico-verificaciones');
            if (chartContainer) {
                // Inicializar ECharts si no existe
                if (!this.chartInstance) {
                    this.chartInstance = echarts.init(chartContainer);
                }

                // Actualizar gráfico
                this.chartInstance.setOption(option, true);

                // Redimensionar gráfico cuando cambie el tamaño de ventana
                window.addEventListener('resize', () => {
                    if (this.chartInstance) {
                        this.chartInstance.resize();
                    }
                });
            } else {
                console.error('No se encontró el contenedor del gráfico con ID: presionesChart');
            }
        },

        obtenerComponentes() {
            // Los componentes deben tener la misma estructura que combinacionestable
            return [
                { key: 'B171', label: '2', areaKey: 'B171', pesoKey: 'C171', fxKey: 'D171', brazoYKey: 'E171', brazoXKey: 'F171', momentoKey: 'G171', friccionKey: 'H171', description: 'Empuje sismico' },
                { key: 'B172', label: '3', areaKey: 'B172', pesoKey: 'C172', fxKey: 'D172', brazoYKey: 'E172', brazoXKey: 'F172', momentoKey: 'G172', friccionKey: 'H172', description: 'Empuje ACTIVO' },
                { key: 'B173', label: '', areaKey: 'B173', pesoKey: 'C173', fxKey: 'D173', brazoYKey: 'E173', brazoXKey: 'F173', momentoKey: 'G173', friccionKey: 'H173', description: 'Emp ACTI COH' },
                { key: 'B174', label: '5', areaKey: 'B174', pesoKey: 'C174', fxKey: 'D174', brazoYKey: 'E174', brazoXKey: 'F174', momentoKey: 'G174', friccionKey: 'H174', description: 'Empuje s/c' },
                { key: 'B175', label: '4', areaKey: 'B175', pesoKey: 'C175', fxKey: 'D175', brazoYKey: 'E175', brazoXKey: 'F175', momentoKey: 'G175', friccionKey: 'H175', description: 'EMPUJE PASIVO' },
                { key: 'B176', label: '', areaKey: 'B176', pesoKey: 'C176', fxKey: 'D176', brazoYKey: 'E176', brazoXKey: 'F176', momentoKey: 'G176', friccionKey: 'H176', description: 'Emp PASI COH' },
                { key: 'B177', label: '1', areaKey: 'B177', pesoKey: 'C177', fxKey: 'D177', brazoYKey: 'E177', brazoXKey: 'F177', momentoKey: 'G177', friccionKey: 'H177', description: 'CARGA PUNTUA' },
                { key: 'B178', label: '6', areaKey: 'B178', pesoKey: 'C178', fxKey: 'D178', brazoYKey: 'E178', brazoXKey: 'F178', momentoKey: 'G178', friccionKey: 'H178', description: 'S/C' },
                { key: 'B179', label: '7', areaKey: 'B179', pesoKey: 'C179', fxKey: 'D179', brazoYKey: 'E179', brazoXKey: 'F179', momentoKey: 'G179', friccionKey: 'H179', description: 'SUELO TALUD' },
                { key: 'B180', label: '8', areaKey: 'B180', pesoKey: 'C180', fxKey: 'D180', brazoYKey: 'E180', brazoXKey: 'F180', momentoKey: 'G180', friccionKey: 'H180', description: 'SUELO' },
                { key: 'B181', label: '9', areaKey: 'B181', pesoKey: 'C181', fxKey: 'D181', brazoYKey: 'E181', brazoXKey: 'F181', momentoKey: 'G181', friccionKey: 'H181', description: 'BASE' },
                { key: 'B182', label: '10', areaKey: 'B182', pesoKey: 'C182', fxKey: 'D182', brazoYKey: 'E182', brazoXKey: 'F182', momentoKey: 'G182', friccionKey: 'H182', description: 'CUÑA' },
                { key: 'B183', label: '11', areaKey: 'B183', pesoKey: 'C183', fxKey: 'D183', brazoYKey: 'E183', brazoXKey: 'F183', momentoKey: 'G183', friccionKey: 'H183', description: 'PANTALLA' },
                { key: 'B184', label: '12', areaKey: 'B184', pesoKey: 'C184', fxKey: 'D184', brazoYKey: 'E184', brazoXKey: 'F184', momentoKey: 'G184', friccionKey: 'H184', description: 'DIENTE' },
                { key: 'B185', label: '', areaKey: 'B185', pesoKey: 'C185', fxKey: 'D185', brazoYKey: 'E185', brazoXKey: 'F185', momentoKey: 'G185', friccionKey: 'H185', description: 'Cof. Cohes' }
            ];
        },

        obtenerCoeficienteCombinacion(combId, rowIndex) {
            if (rowIndex >= this.combinacionCargas.length) {
                return 0;
            }

            const combinacion = this.combinacionCargas[rowIndex];
            return parseFloat(combinacion[combId]) || 0;
        },

        actualizarTablasResultados() {
            if (!this.datosVerificaciones.momentos) {
                //console.log('No hay datos de verificación disponibles');
                return;
            }

            //console.log('Actualizando tablas de resultados...');

            if (this.tableInstances['estabilidad-volteo']) {
                const datosVolteo = this.generarDatosTabla('momentos');
                this.tableInstances['estabilidad-volteo'].setData(datosVolteo);
            }

            if (this.tableInstances['estabilidad-deslizamiento']) {
                // Usar 'fricciones' para la tabla de deslizamiento y multiplicar por coeficientes
                const datosDeslizamiento = this.generarDatosTabla('fricciones');
                //console.log('Datos de deslizamiento:', datosDeslizamiento);
                this.tableInstances['estabilidad-deslizamiento'].setData(datosDeslizamiento);
            }

            if (this.tableInstances['presiones-admisibles']) {
                const datosPresiones = this.generarDatosTabla('pesos');
                this.tableInstances['presiones-admisibles'].setData(datosPresiones);
            }
        },

        updateAllTables() {
            this.actualizarTablasResultados();
        },

        recalcularVerificaciones() {
            if (this.isCalculating) return;

            try {
                this.isCalculating = true;
                this.clearErrors();

                //console.log('Recalculando verificaciones...');

                if (!this.datosDimensionamiento.resultados || !this.datosCargas.resultados) {
                    //console.log('Esperando datos completos...');
                    return;
                }

                // Primero calcular componentes, luego extraer datos de verificación
                this.calcularComponentes();
                this.extraerDatosVerificacion();
                this.actualizarTablasResultados();
                this.enviarDatosVerificaciones();
                this.graficover();

            } catch (error) {
                console.error('Error en recálculo de verificaciones:', error);
                this.addError('calculo', 'Error en recálculo: ' + error.message);
            } finally {
                this.isCalculating = false;
            }
        },

        extraerDatosVerificacion() {
            //console.log('Extrayendo datos de verificación...');

            this.datosVerificaciones = {
                fx: {
                    D171: this.getValue('D171', 0),
                    D172: this.getValue('D172', 0),
                    D173: this.getValue('D173', 0),
                    D174: this.getValue('D174', 0),
                    D175: this.getValue('D175', 0),
                    D176: this.getValue('D176', 0),
                    D177: this.getValue('D177', 0),
                    D178: this.getValue('D178', 0),
                    D179: this.getValue('D179', 0),
                    D180: this.getValue('D180', 0),
                    D181: this.getValue('D181', 0),
                    D182: this.getValue('D182', 0),
                    D183: this.getValue('D183', 0),
                    D184: this.getValue('D184', 0),
                    D185: this.getValue('D185', 0),
                },
                momentos: {
                    G171: this.getValue('G171', 0),
                    G172: this.getValue('G172', 0),
                    G173: this.getValue('G173', 0),
                    G174: this.getValue('G174', 0),
                    G175: this.getValue('G175', 0),
                    G176: this.getValue('G176', 0),
                    G177: this.getValue('G177', 0),
                    G178: this.getValue('G178', 0),
                    G179: this.getValue('G179', 0),
                    G180: this.getValue('G180', 0),
                    G181: this.getValue('G181', 0),
                    G182: this.getValue('G182', 0),
                    G183: this.getValue('G183', 0),
                    G184: this.getValue('G184', 0),
                    G185: this.getValue('G185', 0),
                },
                fricciones: {
                    H171: this.getValue('H171', 0),
                    H172: this.getValue('H172', 0),
                    H173: this.getValue('H173', 0),
                    H174: this.getValue('H174', 0),
                    H175: this.getValue('H175', 0),
                    H176: this.getValue('H176', 0),
                    H177: this.getValue('H177', 0),
                    H178: this.getValue('H178', 0),
                    H179: this.getValue('H179', 0),
                    H180: this.getValue('H180', 0),
                    H181: this.getValue('H181', 0),
                    H182: this.getValue('H182', 0),
                    H183: this.getValue('H183', 0),
                    H184: this.getValue('H184', 0),
                    H185: this.getValue('H185', 0),
                },
                pesos: {
                    C171: this.getValue('C171', 0),
                    C172: this.getValue('C172', 0),
                    C173: this.getValue('C173', 0),
                    C174: this.getValue('C174', 0),
                    C175: this.getValue('C175', 0),
                    C176: this.getValue('C176', 0),
                    C177: this.getValue('C177', 0),
                    C178: this.getValue('C178', 0),
                    C179: this.getValue('C179', 0),
                    C180: this.getValue('C180', 0),
                    C181: this.getValue('C181', 0),
                    C182: this.getValue('C182', 0),
                    C183: this.getValue('C183', 0),
                    C184: this.getValue('C184', 0),
                    C185: this.getValue('C185', 0),
                }
            };

            //console.log('Datos de verificación extraídos:', this.datosVerificaciones);
        },

        enviarDatosVerificaciones() {
            // Generar datos de las tablas
            const datosVolteo = this.generarDatosTabla('momentos');
            const datosDeslizamiento = this.generarDatosTabla('fricciones');
            const datosPresiones = this.generarDatosTabla('pesos');

            const data = {
                inputValues: {
                    combinacionCargas: this.combinacionCargas
                },
                datosDimensionamiento: this.datosDimensionamiento,
                datosCargas: this.datosCargas,
                datosVerificaciones: this.datosVerificaciones,
                datosCalculados: this.datosCalculados,
                resultados: this.resultados,
                tablasVerificaciones: {
                    estabilidadVolteo: datosVolteo,
                    estabilidadDeslizamiento: datosDeslizamiento,
                    presionesAdmisibles: datosPresiones
                },
                errors: this.errors
            };

            //console.log('Enviando datos de verificaciones:', data);
            document.dispatchEvent(new CustomEvent('verificaciones-updated', { detail: data }));
        },

        addError(id, message) {
            if (!this.errors.find(e => e.id === id)) {
                this.errors.push({ id, message });
                console.error(`Error añadido: ${id} - ${message}`);
            }
        },

        clearErrors() {
            this.errors = [];
        },

        formatearValor(valor) {
            if (valor === null || valor === undefined || valor === '') {
                return '0.00';
            }
            if (typeof valor === 'number') {
                return isNaN(valor) ? '0.00' : valor.toFixed(2);
            }
            return valor.toString();
        },

        formatValue(value) {
            if (value === null || value === undefined || value === '') return '-';
            if (typeof value === 'number') {
                return isNaN(value) ? '-' : value.toFixed(2);
            }
            return value;
        },

        get hasErrors() {
            return this.errors.length > 0;
        },
    }
}