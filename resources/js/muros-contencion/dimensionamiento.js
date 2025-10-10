import { ValidationManager } from './utils/validation.js';
import { NotificationManager } from './utils/notifications.js';

export function Dimensionamiento() {
    return {
        mode: 'edit',
        showgraficoverificacion: true,
        predimData: null,

        concretoArmadoData: {
            pantalla: null,
            punta: null,
            talon: null,
            key: null
        },

        get isPredimensionamientoCompleto() {
            return Alpine.store('systemState').predimensionamientoCompleto;
        },

        get datosPredimensionamiento() {
            return Alpine.store('systemState').resultadosPredimensionamiento;
        },

        datosdim: {
            // Verificaciones
            C92: '2.18',
            C93: 'desde',
            C94: 'pantallazapatatalud',
            C95: 'SI',
            C96: 'SI',
            FSVe: 1.5,
            FSDe: 1.5,
            FSQadme: 1,

            FSVd: 1.2,
            FSDd: 1.2,
            FSQadmd: 1,


            // Parámetros geométricos y de cálculo
            C74: 0.2,
            E74: 0.64,
            E79: 6.65,
            E86: 0.74,
            F86: 0.75,
            D88: 2.71,
            D89: 3,
            B88: 0.9,
            B90: 5.70,
            A88: 1.73,
            A89: 1.8,
            A82: 0.54,
            A83: 0.7,

            // Parámetros del diente
            F91: 0.9,
            G93: 0.74,
            G94: 1,
            F95: 0.2,
        },

        resultados: {},
        errors: [],
        isCalculating: false,
        lastInputHash: '',

        verfsismo: {
            accesorios: [
                { tipo: 'FSV', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'FSD', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: '1/3B', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Qadm', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Qadm', cantidad: 0, leq: 0, max: 0, fs: true },

                { tipo: 'Pantalla', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Punta', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Talon', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Key', cantidad: 0, leq: 0, max: 0, fs: true },
            ],
        },

        init() {
            //console.log('🔄 Inicializando dimensionamiento module...');
            this.setupStoreObservers();
            this.loadSavedData();
        },

        setupStoreObservers() {
            // Observar cambios en el store de predimensionamiento
            Alpine.effect(() => {
                const store = Alpine.store('systemState');
                if (store.predimensionamientoCompleto && store.resultadosPredimensionamiento) {
                    this.predimData = store.resultadosPredimensionamiento;
                }
            });

            // Escuchar el evento que indica que el predimensionamiento está listo
            document.addEventListener('predimensionamiento-calculated', (event) => {
                //console.log(event.detail);
                if (event.detail) {
                    this.predimData = {
                        inputValues: { ...event.detail.inputValues },
                        resultados: { ...event.detail.resultados }
                    };
                    this.actualizarCamposConPredimensionamiento();
                }
            });

            document.addEventListener('verificaciones-updated', (event) => {
                //console.log('📥 Verificaciones actualizadas:', event.detail);
                const verificaciones = event.detail; // Ya viene con la estructura {tablasVerificaciones: { ... }}
                if (verificaciones && verificaciones.tablasVerificaciones) {
                    this.actualizarAccesoriosDesdeVerificaciones(verificaciones.tablasVerificaciones);
                    //console.log('📦 Accesorios actualizados:', this.verfsismo.accesorios);
                }
            });

            document.addEventListener('concretoArmado-updated', (event) => {
                //console.log('📥 Verificaciones actualizadas:', event.detail);
                const elementData = event.detail;
                //console.log(elementData);
                if (elementData.tipo && ['pantalla', 'punta', 'talon', 'key'].includes(elementData.tipo)) {
                    this.procesarElementoConcretoArmado(elementData.tipo, elementData.seccion, elementData);
                } else {
                    this.procesarConcretoArmadoCompleto(elementData);
                }
            });
        },

        procesarConcretoArmadoCompleto(data) {
            try {
                ['pantalla', 'punta', 'talon', 'key'].forEach(tipo => {
                    if (data[tipo] && data[tipo] !== null) {
                        this.procesarElementoConcretoArmado(tipo, 'principal', data[tipo]);
                    }
                });

                //console.log('✅ Datos de concreto armado procesados');
                //this.verificarYRenderizar();

            } catch (error) {
                this.agregarError('concreto_armado_completo', `Error procesando concreto armado: ${error.message}`);
            }
        },

        procesarElementoConcretoArmado(tipo, seccion, elementoData) {
            //console.log(elementoData);
            try {
                this.concretoArmadoData[tipo] = {
                    tipo: tipo,
                    seccion: seccion,
                    datosGrafico: this.extraerDatosRelevantes(tipo, seccion, elementoData),
                    timestamp: Date.now()
                };

            } catch (error) {
                console.error(`❌ Error procesando elemento ${tipo}:`, error);
                this.agregarError('elemento_concreto', `Error procesando ${tipo}: ${error.message}`);
            }
        },

        extraerDatosRelevantes(tipo, seccion, elementoData) {
            const datosRelevantes = {
                datos: {}
            };
            try {
                if (elementoData.datos) {
                    // console.log(elementoData.resultados.corte);
                    datosRelevantes.datos = {
                        C305: this.obtenerValorNumerico(elementoData.resultados.corte, 'C305'),
                        C306: this.obtenerValorNumerico(elementoData.resultados.corte, 'C306'),
                        C307: this.obtenerValorNumerico(elementoData.resultados.corte, 'C307', 1),
                        C308: this.obtenerValorNumerico(elementoData.resultados.corte, 'C308', 1),
                        C309: this.obtenerValorNumerico(elementoData.resultados.corte, 'C309', 1),
                        C310: this.obtenerValorNumerico(elementoData.resultados.corte, 'C310', 1)
                    };
                }

                if (elementoData.resultados) {
                    datosRelevantes.resultados = { ...elementoData.resultados };
                }

                return datosRelevantes;

            } catch (error) {
                console.error(`❌ Error extrayendo datos de ${tipo}:`, error);
                return datosRelevantes;
            }
        },

        obtenerValorNumerico(objeto, propiedad, valorDefecto = 0) {
            try {
                if (objeto && objeto[propiedad] !== undefined) {
                    const valor = objeto[propiedad];
                    const numeroConvertido = parseFloat(valor);
                    return isNaN(numeroConvertido) ? valorDefecto : numeroConvertido;
                }
                return valorDefecto;
            } catch (error) {
                console.warn(`⚠️ Error obteniendo valor numérico ${propiedad}:`, error);
                return valorDefecto;
            }
        },

        loadSavedData() {
            const storedData = localStorage.getItem('murosContencionData');
            if (storedData) {
                const data = JSON.parse(storedData);
                if (data?.dimensionamiento) {
                    this.datosdim = { ...this.datosdim, ...data.dimensionamiento.inputValues };
                    this.resultados = data.dimensionamiento.resultados || {};
                    this.errors = data.dimensionamiento.errors || [];
                }

                // Cargar datos de predimensionamiento si existen
                if (data?.predimensionamiento?.isCalculated) {
                    this.predimData = {
                        inputValues: data.predimensionamiento.inputValues,
                        resultados: data.predimensionamiento.resultados
                    };
                    // Al cargar, sí actualizamos con datos de predimensionamiento para poblar los campos,
                    // pero sin disparar un cálculo automático.
                    this.actualizarCamposConPredimensionamiento();
                }
            }
        },

        actualizarCamposConPredimensionamiento() {
            if (this.predimData) {
                const predim = this.predimData.inputValues;
                const datosdim = this.datosdim;
                this.datosdim.E79 = this.formatValue(predim.B21 - datosdim.F86)
                this.datosdim.E86 = this.formatValue(predim.B21 / predim.D49)
                const B69 = predim.B21 / predim.D47;
                const B70 = predim.D51 * predim.B21;
                const A69 = B70 / 3;
                const A63 = B69 - predim.C55;
                this.datosdim.D88 = this.formatValue(B70 - A69 - B69);
                this.datosdim.B88 = this.formatValue(datosdim.C74 + datosdim.A83);
                this.datosdim.B90 = this.formatValue(datosdim.A89 + (datosdim.C74 + datosdim.A83) + datosdim.D89);
                this.datosdim.A88 = this.formatValue(A69);
                this.datosdim.A82 = this.formatValue(A63);
                // Puedes agregar más mapeos si es necesario

                document.dispatchEvent(new CustomEvent('dimensionamiento-data-updated', {
                    detail: {
                        datosdim: this.datosdim,
                        predimData: this.predimData
                    }
                }));
            }
        },

        actualizarAccesoriosDesdeVerificaciones(tablasVerificaciones) {
            //console.log('📦 Datos de verificación recibidos:', tablasVerificaciones);
            if (!tablasVerificaciones) return;

            const { estabilidadVolteo, estabilidadDeslizamiento, presionesAdmisibles } = tablasVerificaciones;
            const pantallacorte = this.concretoArmadoData['pantalla'].datosGrafico.datos || 0;
            const puntacorte = this.concretoArmadoData['punta'].datosGrafico.datos || 0;
            const taloncorte = this.concretoArmadoData['talon'].datosGrafico.datos || 0;
            const keycorte = this.concretoArmadoData['key'].datosGrafico.datos || 0;

            //console.log(this.concretoArmadoData['pantalla'].datosGrafico.datos);
            // Restablece los accesorios a su estado inicial para asegurar que todos los tipos estén presentes
            // y que los valores se sobrescriban correctamente
            const nuevosAccesorios = [
                { tipo: 'FSV', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'FSD', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: '1/3B', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Qadm', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Qadms', cantidad: 0, leq: 0, max: 0, fs: true },

                { tipo: 'Pantalla', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Punta', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Talon', cantidad: 0, leq: 0, max: 0, fs: true },
                { tipo: 'Key', cantidad: 0, leq: 0, max: 0, fs: true },
            ];

            // === FSV desde estabilidadVolteo
            // === FSV desde estabilidadVolteo
            const filaFSV = estabilidadVolteo.find(f => f.description === 'FSV=');
            if (filaFSV) {
                const acc = nuevosAccesorios.find(a => a.tipo === 'FSV');
                const cb1 = parseFloat(filaFSV.comb1) || 0;
                const cb2 = parseFloat(filaFSV.comb2) || 0;
                const cb3 = parseFloat(filaFSV.comb3) || 0;
                const cb4 = parseFloat(filaFSV.comb4) || 0;
                const cb5 = parseFloat(filaFSV.comb5) || 0;
                // Asignamos directamente las combinaciones
                acc.cantidad = this.datosdim.FSVe;
                acc.leq = this.datosdim.FSVd;
                // Calculamos el máximo de las tres combinaciones
                acc.max = Math.max(cb1, cb2, cb5, cb4, cb5);
                acc.fs = ((acc.cantidad || acc.leq) > 0) ? true : false;

            }

            // === FSD desde estabilidadDeslizamiento
            const filaFSD = estabilidadDeslizamiento.find(f => f.description === 'FSD='); // Corrección aquí
            if (filaFSD) {
                const acc = nuevosAccesorios.find(a => a.tipo === 'FSD');
                const cbfsd1 = parseFloat(filaFSD.comb1) || 0;
                const cbfsd2 = parseFloat(filaFSD.comb2) || 0;
                const cbfsd3 = parseFloat(filaFSD.comb3) || 0;
                const cbfsd4 = parseFloat(filaFSD.comb4) || 0;
                const cbfsd5 = parseFloat(filaFSD.comb5) || 0;

                acc.cantidad = this.datosdim.FSDe;
                acc.leq = this.datosdim.FSDd;
                //acc.comb3 = parseFloat(filaFSD.comb3) || 0;
                acc.max = Math.max(cbfsd1, cbfsd2, cbfsd3, cbfsd4, cbfsd5);
                acc.fs = ((acc.cantidad || acc.leq) > 0) ? true : false;
            }

            // === Qadm desde presionesAdmisibles
            const filaQadm = presionesAdmisibles.find(f => f.description === 's1='); // Corrección aquí
            if (filaQadm) {
                const acc = nuevosAccesorios.find(a => a.tipo === 'Qadm');
                const cbs1 = parseFloat(filaQadm.comb1) || 0;
                const cbs2 = parseFloat(filaQadm.comb2) || 0;
                const cbs3 = parseFloat(filaQadm.comb3) || 0;
                const cbs4 = parseFloat(filaQadm.comb4) || 0;
                const cbs5 = parseFloat(filaQadm.comb5) || 0;

                acc.cantidad = this.datosdim.FSQadme;
                acc.leq = this.datosdim.FSQadmd;
                //acc.comb3 = parseFloat(filaQadm.comb3) || 0;
                acc.max = Math.max(cbs1, cbs2, cbs3, cbs4, cbs5);
                acc.fs = ((acc.cantidad || acc.leq) > 0) ? true : false;
            }

            const filaQadms = presionesAdmisibles.find(f => f.description === 's2='); // Corrección aquí
            if (filaQadms) {
                const acc = nuevosAccesorios.find(a => a.tipo === 'Qadms');
                const cbs1 = parseFloat(filaQadms.comb1) || 0;
                const cbs2 = parseFloat(filaQadms.comb2) || 0;
                const cbs3 = parseFloat(filaQadms.comb3) || 0;
                const cbs4 = parseFloat(filaQadms.comb4) || 0;
                const cbs5 = parseFloat(filaQadms.comb5) || 0;

                acc.cantidad = this.datosdim.FSQadme;
                acc.leq = this.datosdim.FSQadmd;
                //acc.comb3 = parseFloat(filaQadm.comb3) || 0;
                acc.max = Math.max(cbs1, cbs2, cbs3, cbs4, cbs5);
                acc.fs = ((acc.cantidad || acc.leq) > 0) ? true : false;
            }

            // === 1/3B desde presionesAdmisibles
            const fila13B = presionesAdmisibles.find(f => f.description === '1/3B='); // Corrección aquí
            if (fila13B) {
                const acc = nuevosAccesorios.find(a => a.tipo === '1/3B');
                acc.cantidad = parseFloat(fila13B.comb1) || 0;
                acc.leq = parseFloat(fila13B.comb2) || 0;
                //acc.comb3 = parseFloat(fila13B.comb3) || 0;
                acc.max = Math.max(acc.cantidad, acc.leq);
            }

            // Verificar si hay una 'pantalla' en los nuevosAccesorios
            const pantallaAccesorio = nuevosAccesorios.find(a => a.tipo === 'Pantalla');
            if (pantallaAccesorio) {
                pantallaAccesorio.cantidad = 0;
                pantallaAccesorio.leq = 0;
                pantallaAccesorio.max = this.formatValue(pantallacorte.C309);
                pantallaAccesorio.fs = (pantallaAccesorio.max < 100) ? true : false;
            }

            const puntaAccesorio = nuevosAccesorios.find(a => a.tipo === 'Punta');
            if (puntaAccesorio) {
                puntaAccesorio.cantidad = 0;
                puntaAccesorio.leq = 0;
                puntaAccesorio.max = this.formatValue(puntacorte.C309);
                puntaAccesorio.fs = (puntaAccesorio.max < 100) ? true : false;
            }

            const talonAccesorio = nuevosAccesorios.find(a => a.tipo === 'Talon');
            if (talonAccesorio) {
                talonAccesorio.cantidad = 0;
                talonAccesorio.leq = 0;
                talonAccesorio.max = this.formatValue(taloncorte.C309);
                talonAccesorio.fs = (talonAccesorio.max < 100) ? true : false;
            }

            const keyAccesorio = nuevosAccesorios.find(a => a.tipo === 'Key');
            if (keyAccesorio) {
                keyAccesorio.cantidad = 0;
                keyAccesorio.leq = 0;
                keyAccesorio.max = this.formatValue(keycorte.C309);
                keyAccesorio.fs = (keyAccesorio.max < 100) ? true : false;
            }

            // Asigna la nueva array a this.verfsismo.accesorios para que Alpine.js detecte el cambio
            this.verfsismo.accesorios = nuevosAccesorios;
        },

        validateNumber(value, id, label, defaultValue = 0) {
            const num = typeof value === 'string' ? parseFloat(value) : Number(value);

            if (isNaN(num)) {
                this.addError(`validation_${id}`, `${label} debe ser un número válido.`);
                return defaultValue;
            }

            if (num < 0) {
                this.addError(`validation_${id}`, `${label} no puede ser negativo.`);
                return defaultValue;
            }

            this.removeError(`validation_${id}`);
            return num;
        },

        getTableValue(table, key, columnIndex, defaultValue = 0) {
            const row = table[key];
            if (!row || !Array.isArray(row)) {
                this.addError(`table_${key}`, `Fila no encontrada: ${key}`);
                return defaultValue;
            }

            const value = row[columnIndex - 1];
            if (typeof value === 'undefined' || isNaN(value)) {
                this.addError(`table_${key}_${columnIndex}`, `Valor inválido en ${key}, columna ${columnIndex}`);
                return defaultValue;
            }

            return value;
        },

        calcularCoeficientesEmpuje(phi, beta) {
            const phiRad = (phi * Math.PI) / 180;
            const betaRad = (beta * Math.PI) / 180;

            const cosBeta = Math.cos(betaRad);
            const cosPhi2 = Math.cos(phiRad) ** 2;
            const cosBeta2 = cosBeta ** 2;

            const discriminant = Math.max(0, cosBeta2 - cosPhi2);
            const sqrtDiscriminant = Math.sqrt(discriminant);

            const ka = ((cosBeta - sqrtDiscriminant) / (cosBeta + sqrtDiscriminant)) * cosBeta;
            const kp = ((cosBeta + sqrtDiscriminant) / (cosBeta - sqrtDiscriminant)) * cosBeta;
            const kpCohesion = 1 - Math.sin(phiRad);

            return { ka, kp, kpCohesion };
        },

        generarTablasDatos(params) {
            const { B19, F86, G94, B100, B11, B112 } = params;

            // Tabla de datos de predimensionamiento
            const datapredimTable = {
                'desde': [
                    (B19 + G94) * B112 / 2,
                    B112 * (G94 + B19),
                    G94 + B19,
                    B19 - F86,
                    (B19 - F86) * B100 * B11,
                    B19 * B100 * B11,
                    (B19 + G94) * B100 * B11,
                    (B19 + G94) / 3
                ],
                'DESDECIMEN': [
                    (F86 + G94) * B112 / 2,
                    B112 * (G94 + F86),
                    G94 + F86,
                    0,
                    0,
                    F86 * B100 * B11,
                    (G94 + F86) * B100 * B11,
                    (F86 + G94) / 3
                ],
                'DESDEELKEY': [
                    G94 * B112 / 2,
                    B112 * G94,
                    G94,
                    0,
                    0,
                    0,
                    G94 * B100 * B11,
                    G94 / 3
                ],
                'CORTADOENLACIM': [
                    (B100 * B11 * B19 + B112 * (B19 + G94)) * (B19 + G94) / 2,
                    B112 * (B19 + G94),
                    B19 + G94,
                    B19 - F86,
                    (B19 - F86) * B100 * B11,
                    B19 * B100 * B11,
                    (B19 + G94) * B100 * B11,
                    (F86 + G94) / 3
                ],
                'CORTADOENELKEY': [
                    (B100 * B11 * B19 + B112 * G94) * G94 / 2,
                    B112 * G94,
                    G94,
                    0,
                    0,
                    B19 * B100 * B11,
                    (B19 + G94) * B100 * B11,
                    G94 / 3
                ],
                'no': [0, 0, 0, 0, 0, 0, 0, 0]
            };

            return { datapredimTable };
        },

        generarTablaAlturas(params) {
            const { E79, F86, E74, G94 } = params;

            const paTable = {
                'solopantalla': [E79, E79 / 3 + F86],
                'Pantallazapata': [E79 + F86, (E79 + F86) / 3],
                'pantallazapatatalud': [F86 + E79 + E74, (F86 + E79 + E74) / 3],
                'Pantallazapatataludkey': [E74 + E79 + F86 + G94, (E74 + E79 + F86 + G94) / 3],
                'Pantallazapatakey': [G94 + F86 + E79, (G94 + F86 + E79) / 3]
            };

            return { paTable };
        },

        // Función principal que coordina todos los cálculos
        calcularTodo() {
            this.clearErrors();
            this.isCalculating = true;

            if (!this.predimData?.inputValues) {
                this.addError('calculo_general', 'No se han recibido datos de predimensionamiento. Asegúrese de que el predimensionamiento esté completo.');
                this.isCalculating = false;
                NotificationManager.showError('Datos de predimensionamiento incompletos.');
                return;
            }

            try {
                // Realizar cálculos con los datos de predimensionamiento
                const resultado = this.calcularEstructural();

                // Actualizar el estado global
                Alpine.store('systemState').dimensionamientoCompleto = true;

                // Guardar en localStorage
                const currentData = localStorage.getItem('murosContencionData');
                const data = currentData ? JSON.parse(currentData) : {};
                data.dimensionamiento = {
                    inputValues: this.datosdim,
                    resultados: resultado,
                    isCalculated: true,
                    errors: this.errors
                };
                localStorage.setItem('murosContencionData', JSON.stringify(data));

                // Emitir evento de cálculo completado
                document.dispatchEvent(new CustomEvent('dimensionamiento-calculated', {
                    detail: {
                        inputValues: this.datosdim,
                        resultados: resultado,
                        predimData: this.predimData,
                        isCalculated: true
                    }
                }));

                this.resultados = resultado;
                this.isCalculating = false;

                if (this.errors.length === 0) {
                    NotificationManager.showSuccess('Cálculo de dimensionamiento completado exitosamente.');
                } else {
                    NotificationManager.showWarning('Cálculo de dimensionamiento completado con advertencias/errores.');
                }
            } catch (error) {
                console.error('Error en cálculo:', error);
                this.addError('calculo_general', 'Error en el cálculo: ' + error.message);
                this.isCalculating = false;
                NotificationManager.showError('Error al realizar el cálculo. Verifique los datos de entrada.');
            }
        },

        // Función para cálculos estructurales complejos (empujes, fuerzas, etc.)
        calcularEstructural() {
            const datapredim = this.predimData.inputValues;
            const datosdim = this.datosdim;

            const inputHash = JSON.stringify({
                predim: this.predimData.inputValues,
                dim: this.datosdim
            });

            if (this.lastInputHash === inputHash && this.errors.length === 0 && Object.keys(this.resultados).length > 0) {
                NotificationManager.showInfo('Los datos no han cambiado. Usando resultados previos.');
                return this.resultados;
            }
            this.lastInputHash = inputHash;


            try {
                const predim = this.predimData.inputValues;
                // Validar datos de predimensionamiento
                const B12 = this.validateNumber(predim.B12, 'B12', 'Ángulo de fricción', 26.9);
                const B20 = this.validateNumber(predim.B20, 'B20', 'Ángulo de inclinación', 12);
                const B18 = this.validateNumber(predim.B18, 'B18', 'Altura del muro', 6.4);
                const B11 = this.validateNumber(predim.B11, 'B11', 'Peso específico', 1.83);
                const B25 = this.validateNumber(predim.B25, 'B25', 'Sobrecarga', 0.4);
                const B13 = this.validateNumber(predim.B13, 'B13', 'Cohesión', 0.05);
                const B19 = this.validateNumber(predim.B19, 'B19', 'Profundidad cimentación', 1.0);
                const B21 = this.validateNumber(predim.B21, 'B21', 'Altura total', B18 + B19);
                const B29 = this.validateNumber(predim.B29, 'B29', 'Coeficiente sísmico', 0.3);

                // Validar datos de dimensionamiento
                const F86 = this.validateNumber(this.datosdim.F86, 'F86', 'Altura de llave', 0.75);
                const D89 = this.validateNumber(this.datosdim.D89, 'D89', 'Factor D89', 3);
                const G94 = this.validateNumber(this.datosdim.G94, 'G94', 'Profundidad llave', 1);
                const G93 = this.validateNumber(this.datosdim.G93, 'G93', 'Factor G93', 0.74);

                //grafico validado  this.datosdim.E74 = this.datosdim.D89 * Math.tan(predim.inputValues.D20) //predim.resultados.altura_key || 0;
                this.datosdim.E79 = this.formatValue(predim.B21 - datosdim.F86)
                this.datosdim.E86 = this.formatValue(predim.B21 / predim.D49)
                const B69 = predim.B21 / predim.D47;
                const B70 = predim.D51 * predim.B21;
                const A69 = B70 / 3;
                const A63 = B69 - predim.D45;
                this.datosdim.D88 = this.formatValue(B70 - A69 - B69);
                this.datosdim.B88 = this.formatValue(datosdim.C74 + datosdim.A83);
                this.datosdim.B90 = this.formatValue(datosdim.A89 + (datosdim.C74 + datosdim.A83) + datosdim.D89);
                this.datosdim.A88 = this.formatValue(A69);
                this.datosdim.A82 = this.formatValue(A63);

                const C95 = datosdim.C95; // 'SI' / 'NO'
                const C96 = datosdim.C96; // 'SI' / 'NO'
                const C93_select = datosdim.C93; // Valor del select para datapredimTable
                const C94_select = datosdim.C94; // Valor del select para paTable

                // Cálculos de Ángulos y Constantes de Empuje
                const D12_rad = (B12 * Math.PI) / 180;
                const D20_rad = (B20 * Math.PI) / 180; // Ángulo de inclinación del muro en radianes

                const cosd = Math.cos(D20_rad);
                const cosPhi2 = Math.cos(D12_rad) ** 2;
                const cosd2 = cosd ** 2;

                const sqrt_cosd2_minus_cosPhi2 = Math.sqrt(Math.max(0, cosd2 - cosPhi2)); // Evitar NaN si cosPhi2 > cosd2

                const term1_num = cosd - sqrt_cosd2_minus_cosPhi2;
                const term1_den = cosd + sqrt_cosd2_minus_cosPhi2;
                const B99 = (term1_num / term1_den) * cosd; // Ka de Coulomb si se aplica

                const term2_num = cosd + sqrt_cosd2_minus_cosPhi2;
                const term2_den = cosd - sqrt_cosd2_minus_cosPhi2;
                const B100 = (term2_num / term2_den) * cosd; // Kp de Coulomb si se aplica (o similar)
                const B101 = 1 - Math.sin(D12_rad);
                const B98 = B25 / B11; // H equivalente de la sobrecarga
                const E74_calc = D89 * Math.atan(D20_rad); // E74 del gráfico (asumiendo que es B20 en radianes)
                const E79_calc = B21 - F86; // Altura del muro por encima de la zapata - altura de la llave

                const B112 = (C96 === "SI") ? 2 * B13 * Math.sqrt(B100) : 0; // Contribución de la cohesión al empuje pasivo
                const S78 = (B19 + G94) * B100 * B11;
                const S79 = (G94 + F86) * B100 * B11;
                const S80 = (G94) * B100 * B11;

                const P78 = B19 - F86
                const R78 = (B19) * B100 * B11;
                const Q78 = P78 * B100 * B11;
                const tablaDesde = {
                    // Columna 1 (M)(B19+G94)*S78/2
                    'desde': (B19 + G94) * S78 / 2, // M78 corregido si aplica
                    'DESDECIMEN': (F86 + G94) * S79 / 2, // M79 corregido si aplica
                    'DESDEELKEY': G94 * S80 / 2, // M80 corregido si aplica
                    'CORTADOENLACIM': (Q78 + S78) * (G93 + F86) / 2,//(B100 * B11 * (B19) + B112 * (B19 + G94)) * (B19 + G94) / 2, // Ajuste con Q81, S81, G93, F86
                    'CORTADOENELKEY': (R78 + S78) * G94 / 2,//(B100 * B11 * (B19) + B112 * (G94)) * G94 / 2, // Ajuste con R82, S82, G94
                    'no': 0,
                };

                const O_values = {
                    'desde': G94 + B19,
                    'DESDECIMEN': G94 + F86,
                    'DESDEELKEY': G94,
                    'CORTADOENLACIM': G94, // O81
                    'CORTADOENELKEY': G94, // O82
                    'no': 0,
                };

                const N_values = {
                    'desde': B112 * O_values.desde,
                    'DESDECIMEN': B112 * O_values.DESDECIMEN,
                    'DESDEELKEY': B112 * O_values.DESDEELKEY,
                    'CORTADOENLACIM': B112 * O_values.CORTADOENLACIM,
                    'CORTADOENELKEY': B112 * O_values.CORTADOENELKEY,
                    'no': 0,
                };

                const P_values = {
                    'desde': B19 - F86,
                    'DESDECIMEN': 0,
                    'DESDEELKEY': 0,
                    'CORTADOENLACIM': 0,
                    'CORTADOENELKEY': 0,
                    'no': 0,
                };

                const Q_values = {
                    'desde': (P_values.desde) * B100 * B11,
                    'DESDECIMEN': 0,
                    'DESDEELKEY': 0,
                    'CORTADOENLACIM': (P_values.desde) * B100 * B11, // Q81
                    'CORTADOENELKEY': 0, // Q82
                    'no': 0,
                };

                const R_values = {
                    'desde': (B19) * B100 * B11,
                    'DESDECIMEN': (F86) * B100 * B11,
                    'DESDEELKEY': 0,
                    'CORTADOENLACIM': (B19) * B100 * B11, // R81
                    'CORTADOENELKEY': (B19) * B100 * B11, // R82
                    'no': 0,
                };

                const S_values = {
                    'desde': (B19 + G94) * B100 * B11,
                    'DESDECIMEN': (G94 + F86) * B100 * B11,
                    'DESDEELKEY': (G94) * B100 * B11,
                    'CORTADOENLACIM': (B19 + G94) * B100 * B11, // S81
                    'CORTADOENELKEY': (B19 + G94) * B100 * B11, // S82
                    'no': 0,
                };

                const T_values = {
                    'desde': (B19 + G94) / 3,
                    'DESDECIMEN': (F86 + G94) / 3,
                    'DESDEELKEY': G94 / 3,
                    'CORTADOENLACIM': (F86 + G94) * (S_values.CORTADOENLACIM + 2 * Q_values.CORTADOENLACIM) / (S_values.CORTADOENLACIM + Q_values.CORTADOENLACIM) / 3,
                    'CORTADOENELKEY': (G94) * (S_values.CORTADOENELKEY + 2 * R_values.CORTADOENELKEY) / (S_values.CORTADOENELKEY + R_values.CORTADOENELKEY) / 3,
                    'no': 0,
                };

                const datapredimTable = {
                    'desde': [tablaDesde.desde, N_values.desde, O_values.desde, P_values.desde, Q_values.desde, R_values.desde, S_values.desde, T_values.desde],
                    'DESDECIMEN': [tablaDesde.DESDECIMEN, N_values.DESDECIMEN, O_values.DESDECIMEN, P_values.DESDECIMEN, Q_values.DESDECIMEN, R_values.DESDECIMEN, S_values.DESDECIMEN, T_values.DESDECIMEN],
                    'DESDEELKEY': [tablaDesde.DESDEELKEY, N_values.DESDEELKEY, O_values.DESDEELKEY, P_values.DESDEELKEY, Q_values.DESDEELKEY, R_values.DESDEELKEY, S_values.DESDEELKEY, T_values.DESDEELKEY],
                    'CORTADOENLACIM': [tablaDesde.CORTADOENLACIM, N_values.CORTADOENLACIM, O_values.CORTADOENLACIM, P_values.CORTADOENLACIM, Q_values.CORTADOENLACIM, R_values.CORTADOENLACIM, S_values.CORTADOENLACIM, T_values.CORTADOENLACIM],
                    'CORTADOENELKEY': [tablaDesde.CORTADOENELKEY, N_values.CORTADOENELKEY, O_values.CORTADOENELKEY, P_values.CORTADOENELKEY, Q_values.CORTADOENELKEY, R_values.CORTADOENELKEY, S_values.CORTADOENELKEY, T_values.CORTADOENELKEY],
                    'no': [tablaDesde.no, N_values.no, O_values.no, P_values.no, Q_values.no, R_values.no, S_values.no, T_values.no],
                };
                // --- Alturas Activas y Brazos (Tabla paTable) ---
                const N86_calc = E79_calc;
                const N87_calc = E79_calc + F86;
                const N88_calc = F86 + E79_calc + E74_calc; // Asumo E74_calc
                const N89_calc = E74_calc + E79_calc + F86 + G94;
                const N90_calc = G94 + F86 + E79_calc;
 
                const O86_calc = N86_calc / 3 + F86;
                const O87_calc = N87_calc / 3;
                const O88_calc = N88_calc / 3;
                const O89_calc = (N89_calc / 3 <= G94) ? G94 - N89_calc / 3 : N89_calc / 3 - G94;
                const O90_calc = (N90_calc / 3 <= G94) ? G94 - N90_calc / 3 : N90_calc / 3 - G94;

                const paTable = {
                    'solopantalla': [N86_calc, O86_calc],
                    'Pantallazapata': [N87_calc, O87_calc],
                    'pantallazapatatalud': [N88_calc, O88_calc],
                    'Pantallazapatataludkey': [N89_calc, O89_calc],
                    'Pantallazapatakey': [N90_calc, O90_calc],
                };

                // Función genérica para buscar valores en tablas por selección
                const buscarValorEnTabla = (tabla, valorSelect, columnaIndex, defaultVal = 0) => {
                    const fila = tabla[valorSelect];
                    if (!fila) {
                        this.addError(`select_value_${valorSelect}`, `Valor de selección inválido: ${valorSelect}`);
                        return defaultVal;
                    }
                    const valorBuscado = fila[columnaIndex - 1];
                    if (typeof valorBuscado === 'undefined' || isNaN(valorBuscado)) {
                        this.addError(`column_value_${valorSelect}_${columnaIndex}`, `Valor de columna no encontrado o inválido en ${valorSelect} (col: ${columnaIndex})`);
                        return defaultVal;
                    }
                    return valorBuscado;
                };

                // Cálculo de Empuje Pasivo del Suelo
                const B103 = buscarValorEnTabla(datapredimTable, C93_select, 2);
                const B104 = 0; // Asumiendo que sigue siendo 0 por la fórmula original
                const B105 = buscarValorEnTabla(datapredimTable, C93_select, 4);
                const B106 = buscarValorEnTabla(datapredimTable, C93_select, 5);
                const B107 = buscarValorEnTabla(datapredimTable, C93_select, 6);
                const B108 = buscarValorEnTabla(datapredimTable, C93_select, 1);
                const B109 = 0; // Asumiendo que sigue siendo 0
                const B110 = B108;
                const B113 = buscarValorEnTabla(datapredimTable, C93_select, 2);
                const B114 = (C96 === "SI") ? B113 * Math.sin(0) : 0; // Math.sin(0) es 0, por lo que B114 siempre es 0
                const B115 = B113;

                // Cálculo de Empuje Activo del Suelo
                const B119_val = buscarValorEnTabla(paTable, C94_select, 1);
                const B120_val = 0; // Asumiendo 0
                const B121_val = B11 * B99 * B119_val;
                const B122_val = B99 * B11 * (B119_val - F86);
                const B123_val = B121_val * B119_val / 2;
                const B124_val = (C95 === "SI") ? B123_val * Math.sin(D20_rad) : 0;
                const B125_val = B123_val * Math.cos(D20_rad);

                const B127_val = (C96 === "SI") ? 2 * B13 * Math.sqrt(B99) : 0;
                const B128_val = B127_val * B119_val / 2;
                const B129_val = (C95 === "SI") ? B128_val * Math.sin(D20_rad) : 0;
                const B130_val = -B128_val * Math.cos(D20_rad);

                // Cálculo de Empuje de Sobrecarga
                const B133_val = B25 * B99;
                const B134_val = B133_val;
                const B135_val = B134_val;
                const B136_val = B134_val * B119_val;
                const B137_val = (C95 === "SI") ? B136_val * Math.sin(D20_rad) : 0;
                const B138_val = B136_val * Math.cos(D20_rad);

                // Cálculos Sísmicos
                const C144_val = datapredim.B29 / 2; // Asumiendo B29 es una variable de datapredim
                const C145_val = datapredim.B29 * C144_val; // Asumo B29
                const C147_val = Math.tan(C144_val / (1 - C145_val)); // Esto podría dar NaN si (1 - C145_val) es 0 o negativo
                const B147_val = C147_val * (180 / Math.PI);
                const B148_val = B12;
                const B149_val = 0; // Asumo 0
                const B150_val = 0; // Asumo 0
                const B151_val = B20; // Asumo B20

                const C148_rad = (B148_val) * (Math.PI / 180);
                const C149_rad = (B149_val) * (Math.PI / 180);
                const C150_rad = (B150_val) * (Math.PI / 180);
                const C151_rad = 0; // Asumo 0
                const C152_val = 0; // Asumo 0

                const U157 = Math.sin(C150_rad + C148_rad);
                const U158 = Math.sin(C148_rad - C147_val - C151_rad);
                const U159 = Math.cos(C150_rad + C149_rad + C147_val);
                const U160 = Math.cos(C151_rad - C149_rad);
                const U161 = U159 * U160 !== 0 ? Math.sqrt(Math.max(0, U157 * U158 / (U159 * U160))) : 0; // Max(0) para evitar raíces negativas
                const B152_val = (1 + U161) ** 2;

                const T157_val = Math.cos(C148_rad - C147_val - C149_rad);
                const T158_val = Math.cos(C147_val) * (Math.cos(C149_rad) ** 3) * Math.cos(C149_rad + C150_rad + C147_val);

                const C153_val = T158_val !== 0 ? T157_val * T157_val / (B152_val * T158_val) : 0;
                const B154_val = B11;
                const B155_val = E79_calc;
                const B156_val = C145_val;
                const C157_val = 0.5 * B154_val * (1 - B156_val) * C153_val * B155_val * B155_val;
                const B158_val = B99;
                const C159_val = 0.5 * B154_val * B158_val * B155_val * B155_val;
                const C160_val = C157_val - C159_val;
                const C162_val = C157_val !== 0 ? (B155_val / 3 * C159_val + B155_val * 0.6 * C160_val) / C157_val : 0;
                const C163_val = C160_val * C162_val;

                const E172 = buscarValorEnTabla(paTable, C94_select, 2);
                const E175 = (buscarValorEnTabla(datapredimTable, C93_select, 2)) / 3;
                const Ht = B21 - F86;

                // Define dummy functions for calculations not provided in the original code snippet
                // You will need to implement the actual logic for these based on your full spreadsheet.
                const calcularVerificacionEstructural = (val) => val * 1.05; // Placeholder
                const calcularVerificacionEstabilidad = (val) => val * 1.1; // Placeholder
                const calcularVerificacionSeguridad = () => 1.5; // Placeholder
                const calcularVerificacionCarga = () => 6.0; // Placeholder
                const calcularDimensionDiente = (val) => val * 0.8; // Placeholder

                const resultados = {
                    B69,
                    B70,
                    A69,
                    A63,
                    E74: E74_calc,
                    B98: B98,
                    B99: B99,
                    B100: B100,
                    B101: B101,
                    B112: B112,
                    E79: E79_calc,
                    // Empuje pasivo del suelo
                    B103: B103,
                    B104: B104,
                    B105: B105,
                    B106: B106,
                    B107: B107,
                    B108: B108,
                    B109: B109,
                    B110: B110,
                    B113: B113,
                    B114: B114,
                    B115: B115,
                    // Empuje activo del suelo
                    B119: B119_val,
                    B120: B120_val,
                    B121: B121_val,
                    B122: B122_val,
                    B123: B123_val,
                    B124: B124_val,
                    B125: B125_val,
                    B127: B127_val,
                    B128: B128_val,
                    B129: B129_val,
                    B130: B130_val,
                    // Empuje de sobrecarga
                    B133: B133_val,
                    B134: B134_val,
                    B135: B135_val,
                    B136: B136_val,
                    B137: B137_val,
                    B138: B138_val,
                    // Carga sísmica
                    C144: C144_val,
                    C145: C145_val,
                    C147: C147_val,
                    B147: B147_val,
                    B148: B148_val,
                    B149: B149_val,
                    B150: B150_val,
                    B151: B151_val,
                    C148: C148_rad,
                    C149: C149_rad,
                    C150: C150_rad,
                    C151: C151_rad,
                    C152: C152_val,
                    U157: U157,
                    U158: U158,
                    U159: U159,
                    U160: U160,
                    U161: U161,
                    B152: B152_val,
                    T157: T157_val,
                    T158: T158_val,
                    C153: C153_val,
                    B154: B154_val,
                    B155: B155_val,
                    B156: B156_val,
                    C157: C157_val,
                    B158: B158_val,
                    C159: C159_val,
                    C160: C160_val,
                    C162: C162_val,
                    C163: C163_val,
                    E172: E172,
                    E175: E175,
                    E74: datosdim.C74 || 0, // Este E74 es del input directo, no el calculado

                    E79: Ht,
                    E86: B21 / (datosdim.D49 || 1), // Asegúrate de que D49 exista o tenga un default.

                    // Verificaciones estructurales
                    A88: calcularVerificacionEstructural(datosdim.A89 || 0),
                    D88: calcularVerificacionEstabilidad(datosdim.D89 || 0),
                    B88: calcularVerificacionSeguridad(),
                    B90: calcularVerificacionCarga(),

                    // Resultados del diente (si aplica)
                    F91: datosdim.F91 || 0,
                    G93: calcularDimensionDiente(datosdim.G94 || 0),
                    F95: datosdim.F95 || 0
                };

                // Limpiar errores si el cálculo fue exitoso.
                this.clearErrors();
                return resultados;

            } catch (error) {
                console.error("Error during structural calculation:", error);
                this.addError('structural_calc_error', `Error en el cálculo estructural: ${error.message}`);
                throw error; // Re-lanza para que el catch superior lo capture y notifique.
            }
        },

        // Helper para agregar errores
        addError(id, message) {
            if (!this.errors.some(error => error.id === id)) {
                this.errors.push({ id, message });
                NotificationManager.showError(message);
            }
        },

        // Helper para remover errores
        removeError(id) {
            this.errors = this.errors.filter(error => error.id !== id);
        },

        // Helper para limpiar todos los errores
        clearErrors() {
            this.errors = [];
            ValidationManager.clearAllErrors(); // Si ValidationManager tiene un método para esto
        },

        get hasErrors() {
            return this.errors.length > 0;
        },

        // Funciones dummy (¡DEBES IMPLEMENTAR LA LÓGICA REAL AQUÍ!)
        calcularVerificacionEstructural(val) {
            // Lógica real para A88
            console.warn('calcularVerificacionEstructural no implementada. Usando valor dummy.');
            return val * 1.1;
        },
        calcularVerificacionEstabilidad(val) {
            // Lógica real para D88
            console.warn('calcularVerificacionEstabilidad no implementada. Usando valor dummy.');
            return val * 1.2;
        },
        calcularVerificacionSeguridad() {
            // Lógica real para B88
            console.warn('calcularVerificacionSeguridad no implementada. Usando valor dummy.');
            return 2.0;
        },
        calcularVerificacionCarga() {
            // Lógica real para B90
            console.warn('calcularVerificacionCarga no implementada. Usando valor dummy.');
            return 7.0;
        },
        calcularDimensionDiente(val) {
            // Lógica real para G93
            console.warn('calcularDimensionDiente no implementada. Usando valor dummy.');
            return val * 0.9;
        },

        calcularCoeficienteSismico(phi, beta, deltaTheta) {
            const phiRad = (phi * Math.PI) / 180;
            const betaRad = (beta * Math.PI) / 180;

            const term1 = Math.cos(phiRad - deltaTheta - betaRad);
            const term2 = Math.cos(deltaTheta) * Math.cos(betaRad) ** 3 * Math.cos(betaRad + deltaTheta);

            return Math.max(0, (term1 ** 2) / (4 * term2));
        },

        // Métodos de utilidad
        addError(id, message) {
            if (!this.errors.find(e => e.id === id)) {
                this.errors.push({ id, message });
            }
        },

        removeError(id) {
            this.errors = this.errors.filter(e => e.id !== id);
        },

        clearErrors() {
            this.errors = [];
        },

        sendDatadimensionamiento() {
            const data = {
                inputValues: { ...this.datosdim },
                predimData: this.predimData,
                resultados: { ...this.resultados },
                errors: [...this.errors],
                isCalculated: this.errors.length === 0 && Object.keys(this.resultados).length > 0
            };

            //console.log('📤 Enviando datos de dimensionamiento:', data);

            try {
                document.dispatchEvent(new CustomEvent('dimensionamiento-updated', {
                    detail: data,
                    bubbles: true
                }));
            } catch (error) {
                console.error('❌ Error enviando datos:', error);
            }
        },

        // Métodos de interfaz
        toggleMode() {
            this.mode = this.mode === 'edit' ? 'view' : 'edit';
        },

        formatValue(value, decimals = 2) {
            if (value === null || value === undefined || value === '') return '-';
            if (typeof value !== 'number') return value;
            return value.toFixed(decimals);
        },

        formatDisplayValue(value, type, decimals = 2) {
            if (type === 'checkbox') {
                return value ? '✓ Activo' : '✗ Inactivo';
            }
            return this.formatValue(value, decimals);
        },

        // Getters
        get hasErrors() {
            return this.errors.length > 0;
        },

        get isReady() {
            return this.predimData?.inputValues && Object.keys(this.predimData.inputValues).length > 0;
        }
    }
}