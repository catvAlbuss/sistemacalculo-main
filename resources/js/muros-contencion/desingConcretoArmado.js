import { ValidationManager } from './utils/validation.js';
import { NotificationManager } from './utils/notifications.js';

class ConcretoArmadoCalculator {
    constructor() {
        this.elementos = new Map();
        this.observers = new Map();
        this.predimData = {
            materiales: { B6: 2.4, B7: 21, B8: 4200, B10: 20, B11: 1.83, B12: 26.9, B13: 0.05, B14: 0.51 },
            geometria: {},
            cargas: {},
            valpredim: {},
            inputValues: {}
        };
    }

    updatePredimData(newPredimData) {
        // Estructura correcta basada en los datos que llegan
        const estructuraCorrecta = {
            materiales: newPredimData.inputValues?.materiales || newPredimData.materiales || {},
            geometria: newPredimData.inputValues?.geometria || newPredimData.geometria || {},
            cargas: newPredimData.inputValues?.cargas || newPredimData.cargas || {},
            valpredim: newPredimData.inputValues?.valpredim || newPredimData.valpredim || {},
            resultados: newPredimData.resultados || {}
        };

        this.predimData = {
            ...this.predimData,
            ...estructuraCorrecta,
            materiales: { ...this.predimData.materiales, ...estructuraCorrecta.materiales },
            geometria: { ...this.predimData.geometria, ...estructuraCorrecta.geometria },
            cargas: { ...this.predimData.cargas, ...estructuraCorrecta.cargas },
            valpredim: { ...this.predimData.valpredim, ...estructuraCorrecta.valpredim },
            resultados: { ...this.predimData.resultados, ...estructuraCorrecta.resultados }
        };

        document.dispatchEvent(new CustomEvent('predimensionamiento-updated', {
            detail: this.predimData
        }));
    }

    registrarElemento(tipo, calculator) {
        this.elementos.set(tipo, calculator);
    }

    getElementoCalculator(tipoElemento) {
        const calculator = this.elementos.get(tipoElemento);
        if (!calculator) {
            throw new Error(`Calculadora no encontrada para: ${tipoElemento}`);
        }
        return calculator;
    }
}

class PantallaCalculator {
    calcular(datos, predimData) {
        const resultados = { datospant: {}, corte: {}, flexion: {} };
        const errors = [];

        try {
            const materiales = predimData?.materiales || {};
            const resultadosPredim = predimData?.resultados || {};
            const { Mu, Vu, b, t, d, mu } = datos;

            //inputs tipo number
            const A325 = 0
            const A329 = 0
            const B336 = 0
            const B349 = 0
            const B364 = 0
            //--- Aceros reutilizables para los input tipo select

            const B295 = 101.73;
            const B296 = 35.66;
            const B297 = materiales.B8 || datos.Fy;
            const B298 = materiales.B7 || datos.Fc;
            const B299 = 100;
            const B300 = 0.9 * 100;
            const B301 = B300 - 4;
            const B302 = B295 * 100000;

            resultados.datospant = {
                Mu: B295,
                Vu: B296,
                Fy: B297,
                Fc: B298,
                b: B299,
                t: B300,
                d: B301,
                mu: B302,
            };
            //**CORTES */
            const C305 = B301;
            const C306 = B296;
            const C307 = 0.53 * C305 * B299 * Math.pow(B298, 0.5) / 1000;
            const C308 = C307 * 0.85;
            const C309 = C306 / C308 * 100;
            const C310 = (C308 > C306) ? "OK" : "ESTA MAL";
            resultados.corte = { C305, C306, C307, C308, C309, C310 };
            /**FLEXION -cuantias*/
            const B318 = 0.002;
            const B319 = 0.0018;

            const C318 = B318 * B299 * B301;
            const C319 = B319 * B299 * B301;

            const B320 = B301 - Math.pow(Math.pow(B301, 2) - 2 * B302 / (0.85 * 0.9 * B298 * B299), 0.5);
            const B321 = B302 / (0.9 * B297 * (B301 - B320 / 2));
            const B322 = Math.max(B321, C319);
            /**FLEXION -DISTIBUCION DEL ACERO LONGITUDINAL PRINCIPAL*/
            // const C326 = aceros * A325;
            // const E325 = C326 * 100 / B322; //flexion
            resultados.flexion = { B318, B319, C318, C319, B320, B321, B322 }
        } catch (error) {
            errors.push({
                id: 'pantalla-calculo',
                message: `Error en cálculo de Pantalla: ${error.message}`
            });
        }

        return { resultados, errors };
    }
}

class PuntaCalculator {
    calcular(datos, predimData) {
        const resultados = { datospant: {}, corte: {}, flexion: {} };
        const errors = [];

        try {
            const materiales = predimData?.materiales || {};
            const resultadosPredim = predimData?.resultados || {};
            const { Mu, Vu, b, t, d, mu } = datos;

            //inputs tipo number
            const A325 = 0
            const A329 = 0
            const B336 = 0
            const B349 = 0
            const B364 = 0
            //--- Aceros reutilizables para los input tipo select

            const B295 = 52.39;
            const B296 = 38.03;
            const B297 = materiales.B8 || datos.Fy;
            const B298 = materiales.B7 || datos.Fc;
            const B299 = 100;
            const B300 = 0.75 * 100;
            const B301 = B300 - 10;
            const B302 = B295 * 100000;

            resultados.datospant = {
                Mu: B295,
                Vu: B296,
                Fy: B297,
                Fc: B298,
                b: B299,
                t: B300,
                d: B301,
                mu: B302,
            };
            //**CORTES */
            const C305 = B301;
            const C306 = B296;
            const C307 = 0.53 * C305 * B299 * Math.pow(B298, 0.5) / 1000;
            const C308 = C307 * 0.85;
            const C309 = C306 / C308 * 100;
            const C310 = (C308 > C306) ? "OK" : "ESTA MAL";
            resultados.corte = { C305, C306, C307, C308, C309, C310 };
            /**FLEXION -cuantias*/
            const B318 = 0.002;
            const B319 = 0.0018;

            const C318 = B318 * B299 * B301;
            const C319 = B319 * B299 * B301;

            const B320 = B301 - Math.pow(Math.pow(B301, 2) - 2 * B302 / (0.85 * 0.9 * B298 * B299), 0.5);
            const B321 = B302 / (0.9 * B297 * (B301 - B320 / 2));
            const B322 = Math.max(B321, C319);
            /**FLEXION -DISTIBUCION DEL ACERO LONGITUDINAL PRINCIPAL*/
            // const C326 = aceros * A325;
            // const E325 = C326 * 100 / B322; //flexion
            resultados.flexion = { B318, B319, C318, C319, B320, B321, B322 }
        } catch (error) {
            errors.push({
                id: 'pantalla-calculo',
                message: `Error en cálculo de Pantalla: ${error.message}`
            });
        }

        return { resultados, errors };
    }
}

class TalonCalculator {
    calcular(datos, predimData) {
        const resultados = { datospant: {}, corte: {}, flexion: {} };
        const errors = [];

        try {
            const materiales = predimData?.materiales || {};
            const resultadosPredim = predimData?.resultados || {};
            const { Mu, Vu, b, t, d, mu } = datos;

            //inputs tipo number
            const A325 = 0
            const A329 = 0
            const B336 = 0
            const B349 = 0
            const B364 = 0
            //--- Aceros reutilizables para los input tipo select

            const B295 = 76.84;
            const B296 = 38.84;
            const B297 = materiales.B8 || datos.Fy;
            const B298 = materiales.B7 || datos.Fc;
            const B299 = 100;
            const B300 = 0.75 * 100;
            const B301 = B300 - 10;
            const B302 = B295 * 100000;

            resultados.datospant = {
                Mu: B295,
                Vu: B296,
                Fy: B297,
                Fc: B298,
                b: B299,
                t: B300,
                d: B301,
                mu: B302,
            };
            //**CORTES */
            const C305 = B301;
            const C306 = B296;
            const C307 = 0.53 * C305 * B299 * Math.pow(B298, 0.5) / 1000;
            const C308 = C307 * 0.85;
            const C309 = C306 / C308 * 100;
            const C310 = (C308 > C306) ? "OK" : "ESTA MAL";
            resultados.corte = { C305, C306, C307, C308, C309, C310 };
            /**FLEXION -cuantias*/
            const B318 = 0.002;
            const B319 = 0.0018;

            const C318 = B318 * B299 * B301;
            const C319 = B319 * B299 * B301;

            const B320 = B301 - Math.pow(Math.pow(B301, 2) - 2 * B302 / (0.85 * 0.9 * B298 * B299), 0.5);
            const B321 = B302 / (0.9 * B297 * (B301 - B320 / 2));
            const B322 = Math.max(B321, C319);
            /**FLEXION -DISTIBUCION DEL ACERO LONGITUDINAL PRINCIPAL*/
            // const C326 = aceros * A325;
            // const E325 = C326 * 100 / B322; //flexion
            resultados.flexion = { B318, B319, C318, C319, B320, B321, B322 }
        } catch (error) {
            errors.push({
                id: 'pantalla-calculo',
                message: `Error en cálculo de Pantalla: ${error.message}`
            });
        }

        return { resultados, errors };
    }
}

class KeyCalculator {
    calcular(datos, predimData) {
        const resultados = { datospant: {}, corte: {}, flexion: {} };
        const errors = [];

        try {
            const materiales = predimData?.materiales || {};
            const resultadosPredim = predimData?.resultados || {};
            const { Mu, Vu, b, t, d, mu } = datos;

            //inputs tipo number
            const A325 = 0
            const A329 = 0
            const B336 = 0
            const B349 = 0
            const B364 = 0
            //--- Aceros reutilizables para los input tipo select

            const B295 = 5.15;
            const B296 = 10.10;
            const B297 = materiales.B8 || datos.Fy;
            const B298 = materiales.B7 || datos.Fc;
            const B299 = 100;
            const B300 = 0.9 * 100;
            const B301 = B300 - 10;
            const B302 = B295 * 100000;

            resultados.datospant = {
                Mu: B295,
                Vu: B296,
                Fy: B297,
                Fc: B298,
                b: B299,
                t: B300,
                d: B301,
                mu: B302,
            };
            //**CORTES */
            const C305 = B301;
            const C306 = B296;
            const C307 = 0.53 * C305 * B299 * Math.pow(B298, 0.5) / 1000;
            const C308 = C307 * 0.85;
            const C309 = C306 / C308 * 100;
            const C310 = (C308 > C306) ? "OK" : "ESTA MAL";
            resultados.corte = { C305, C306, C307, C308, C309, C310 };
            /**FLEXION -cuantias*/
            const B318 = 0.002;
            const B319 = 0.0018;

            const C318 = B318 * B299 * B301;
            const C319 = B319 * B299 * B301;

            const B320 = B301 - Math.pow(Math.pow(B301, 2) - 2 * B302 / (0.85 * 0.9 * B298 * B299), 0.5);
            const B321 = B302 / (0.9 * B297 * (B301 - B320 / 2));
            const B322 = Math.max(B321, C318);
            /**FLEXION -DISTIBUCION DEL ACERO LONGITUDINAL PRINCIPAL*/
            // const C326 = aceros * A325;
            // const E325 = C326 * 100 / B322; //flexion
            resultados.flexion = { B318, B319, C318, C319, B320, B321, B322 }
        } catch (error) {
            errors.push({
                id: 'pantalla-calculo',
                message: `Error en cálculo de Pantalla: ${error.message}`
            });
        }

        return { resultados, errors };
    }
}

let resultados = {};

const AceroManager = {
    tipos: [
        { label: "8 mm", value: 0.5 },
        { label: "3/8", value: 0.71 },
        { label: "12 mm", value: 1.13 },
        { label: "1/2", value: 1.27 },
        { label: "5/8", value: 2.0 },
        { label: "3/4", value: 2.85 },
        { label: "1", value: 5.07 },
        { label: "1 3/8", value: 10.06 }
    ],

    espaciamientoresult: Array.from({ length: 14 }, (_, i) => ({ value: 7.5 + i * 2.5 })),

    _cache: new Map(),

    // Valores por defecto según el tipo de elemento
    getValorPorDefectoTransversal(tipoElemento) {
        const valores = {
            'pantalla': 0.333333333333333,
            'punta': 0.50,
            'talon': 0.50,
            'key': 0.50
        };
        return valores[tipoElemento] || 0.333333333333333;
    },

    obtenerValor(diametro) {
        if (this._cache.has(diametro)) return this._cache.get(diametro);
        const acero = this.tipos.find(a => a.label === diametro);
        const valor = acero ? acero.value : 0;
        this._cache.set(diametro, valor);
        return valor;
    },

    calcularAs(cantidad, diametro) {
        return +(cantidad * this.obtenerValor(diametro)).toFixed(2);
    },

    calcularEspaciamientoBase(cantidad, diametro, refArea) {
        if (!cantidad || !diametro || !refArea || refArea <= 0) return 0;
        const areaBarra = this.obtenerValor(diametro);
        return Math.round(((areaBarra * cantidad) * 100) / refArea);
    },

    calcularEspaciamientoPrincipal(cantidad, diametro, AsRequerido) {
        return this.calcularEspaciamientoBase(cantidad, diametro, AsRequerido);
    },

    calcularEspaciamientoSecundarioDiferenciado(cantidad, diametro, elemento, rminarea, rminareas) {
        let valorReferencia;
        if (elemento === 'pantalla') {
            valorReferencia = rminareas;
        } else if (elemento === 'punta') {
            valorReferencia = rminarea;
        } else if (elemento === 'talon') {
            valorReferencia = rminarea;
        } else if (elemento === 'key') {
            valorReferencia = rminarea;
        } else {
            valorReferencia = rminareas;
        }
        return this.calcularEspaciamientoBase(cantidad, diametro, valorReferencia);
    },

    calcularAsCaTer(cantidad, diametro, elemento, rminarea, rminareas) {
        let valorReferencia;
        if (elemento === 'pantalla') {
            valorReferencia = rminarea;
        } else if (elemento === 'punta') {
            valorReferencia = rminareas;
        } else if (elemento === 'talon') {
            valorReferencia = rminarea;
        } else if (elemento === 'key') {
            valorReferencia = rminarea;
        } else {
            valorReferencia = rminareas;
        }
        return valorReferencia;
    },

    calcularEspaciamientoSecundario(cantidad, diametro, rminareas) {
        const es = this.calcularEspaciamientoBase(cantidad, diametro, rminareas);
        return es;
    },

    calcularAs1(cantidad, elemento, rminarea, rminareas) {
        const RminArea = this.calcularAsCaTer(cantidad, null, elemento, rminarea, rminareas);
        return cantidad > 0 && RminArea > 0 ? cantidad * RminArea : 0;
    },

    calcularCT(cantidad, diametro, elemento, rminarea, rminareas) {
        //return this.calcularEspaciamientoBase(1, diametro, cantidad * RminArea);
        const as1 = this.calcularAs1(cantidad, elemento, rminarea, rminareas);

        if (as1 <= 0) return 0;
        const areaBarra = this.obtenerValor(diametro);
        const espaciado = (areaBarra * 100) / as1;
        return Math.round(espaciado); // Redondea a 0 decimales
    },

    calcularAs1CaraLibre(cantidad, elemento, rminarea, rminareas) {
        const RminArea = this.calcularAsCaTer(cantidad, null, elemento, rminarea, rminareas);
        return cantidad > 0 && RminArea > 0 ? (1 - cantidad) * RminArea : 0;
    },

    calcularC(cantidad, diametro, elemento, rminarea, rminareas) {
        const As1libre = this.calcularAs1CaraLibre(cantidad, elemento, rminarea, rminareas);
        if (As1libre <= 0) return 0;
        const areaBarra = this.obtenerValor(diametro);
        const espaciado = (areaBarra * 100) / As1libre;
        return Math.round(espaciado);
    },

    calcularEspaciamientoAlgoritmico(valorCalculado) {
        const posibles = this.espaciamientoresult.filter(e => e.value <= valorCalculado).map(e => e.value);
        return posibles.length ? Math.max(...posibles) : this.espaciamientoresult[0].value;
    },

    calcularEspaciamientoAlgPrin(cantidad, diametro, AsRequerido) {
        const esprincipal = this.calcularEspaciamientoPrincipal(cantidad, diametro, AsRequerido) || 0;
        return this.calcularEspaciamientoAlgoritmico(esprincipal);
    },

    calcularEspaciamientoAlgSecDiferenciado(cantidad, diametro, elemento, rminarea, rminareas) {
        const esSec = this.calcularEspaciamientoSecundarioDiferenciado(cantidad, diametro, elemento, rminarea, rminareas) || 0;
        return this.calcularEspaciamientoAlgoritmico(esSec);
    },

    calcularEspaciamientoAlg(cantidad, diametro, AsRequerido) {
        const As = this.calcularAs(cantidad, diametro);
        const espaciamiento = (As * 100) / AsRequerido;
        return this.calcularEspaciamientoAlgoritmico(espaciamiento);
    },

    calcularEspaciamientoAlgCT(cantidad, diametro, elemento, rminarea, rminareas) {
        const as1 = this.calcularAs1(cantidad, elemento, rminarea, rminareas);

        if (as1 <= 0) return 0;

        const areaBarra = this.obtenerValor(diametro);
        const espaciamiento = (areaBarra * 100) / as1;

        return this.calcularEspaciamientoAlgoritmico(espaciamiento);
    },

    calcularEspaciamientoAlgC(cantidad, diametro, elemento, rminarea, rminareas) {
        const espaciado = this.calcularC(cantidad, diametro, elemento, rminarea, rminareas);
        return this.calcularEspaciamientoAlgoritmico(espaciado);
    },

    crearConfiguracion(cantidad = 2, diametro = '3/4', elemento = 'pantalla', isSecundario = false, configuracionPrincipal = null) {
        const config = {
            cantidad,
            diametro,
            elemento,
            isSecundario,
            configuracionPrincipal, // Referencia a la configuración principal para sincronizar
            _AsRequerido: 0,
            _rminArea: 0,
            _rminAreas: 0,

            get valor() {
                return AceroManager.obtenerValor(this.diametro);
            },

            get As() {
                return AceroManager.calcularAs(this.cantidad, this.diametro);
            },

            get espaciamientoPrincipal() {
                return AceroManager.calcularEspaciamientoPrincipal(this.cantidad, this.diametro, this._AsRequerido);
            },

            get espaciamientoSecundario() {
                return AceroManager.calcularEspaciamientoSecundarioDiferenciado(
                    this.cantidad,
                    this.diametro,
                    this.elemento,
                    this._rminArea,
                    this._rminAreas
                );
            },

            get AsCaTe() {
                return AceroManager.calcularAsCaTer(
                    this.cantidad,
                    this.diametro,
                    this.elemento,
                    this._rminArea,
                    this._rminAreas
                );
            },

            get espaciamientoalgoritmo() {
                return AceroManager.calcularEspaciamientoAlg(this.cantidad, this.diametro, this._AsRequerido);
            },

            get espaciamientoalgPrin() {
                return AceroManager.calcularEspaciamientoAlgPrin(this.cantidad, this.diametro, this._AsRequerido);
            },

            get espaciamientoalgoSecs() {
                return AceroManager.calcularEspaciamientoAlgSecDiferenciado(
                    this.cantidad,
                    this.diametro,
                    this.elemento,
                    this._rminArea,
                    this._rminAreas
                );
            },

            get espaciamientoCT() {
                return AceroManager.calcularCT(this.cantidad, this.diametro, this.elemento, this._rminArea, this._rminAreas);
                //return AceroManager.calcularCT(this.cantidad, this.diametro, this._rminArea);
            },

            get as1() {
                return AceroManager.calcularAs1(this.cantidad, this.elemento, this._rminArea, this._rminAreas);
            },

            get espaciamientoalgoritmoCT() {
                return AceroManager.calcularEspaciamientoAlgCT(this.cantidad, this.diametro, this.elemento, this._rminArea, this._rminAreas);
                //return AceroManager.calcularEspaciamientoAlgCT(this.cantidad, this.diametro, this._rminArea);
            },

            get as1Clibre() {
                // Si es secundario, usar la cantidad de la configuración principal
                const cantidadReferencia = this.isSecundario && this.configuracionPrincipal
                    ? this.configuracionPrincipal.cantidad
                    : this.cantidad;

                return AceroManager.calcularAs1CaraLibre(
                    cantidadReferencia,
                    this.elemento,
                    this._rminArea,
                    this._rminAreas
                );
            },

            get espaciamientoC() {
                const cantidadReferencia = this.isSecundario && this.configuracionPrincipal
                    ? this.configuracionPrincipal.cantidad
                    : this.cantidad;

                return AceroManager.calcularC(
                    cantidadReferencia,
                    this.diametro,
                    this.elemento,
                    this._rminArea,
                    this._rminAreas
                );
            },

            get espaciamientoalgoritmoC() {
                const cantidadReferencia = this.isSecundario && this.configuracionPrincipal
                    ? this.configuracionPrincipal.cantidad
                    : this.cantidad;

                return AceroManager.calcularEspaciamientoAlgC(
                    cantidadReferencia,
                    this.diametro,
                    this.elemento,
                    this._rminArea,
                    this._rminAreas
                );
            },

            actualizar(props = {}) {
                const oldValues = { cantidad: this.cantidad, diametro: this.diametro };
                Object.assign(this, props);
                if (oldValues.cantidad !== this.cantidad || oldValues.diametro !== this.diametro) {
                    this.notificarCambio();
                }
            },

            // Método para sincronizar con configuración principal
            sincronizarConPrincipal() {
                if (this.isSecundario && this.configuracionPrincipal) {
                    // Sincronizar cantidad y diámetro
                    this.cantidad = this.configuracionPrincipal.cantidad - 1; // Restar 1
                    this.diametro = this.configuracionPrincipal.diametro;
                    this.notificarCambio();
                }
            },

            setAsRequerido(value) {
                this._AsRequerido = value;
            },

            setRminArea(value) {
                this._rminArea = value;
            },

            setRminAreas(value) {
                this._rminAreas = value;
            },

            notificarCambio() {
                if (typeof CustomEvent !== 'undefined') {
                    document.dispatchEvent(new CustomEvent('acero-config-changed', {
                        detail: { config: this }
                    }));
                }
            }
        };
        return config;
    }
};

function createElementoModule(tipo, calculatorInstance, globalCalculator) {
    return () => ({
        tipo: tipo,
        calculator: calculatorInstance,
        globalCalculator: globalCalculator,
        datos: {},
        resultados: {},
        errors: [],
        predimData: globalCalculator.predimData,

        // Configuración de secciones
        secciones: {
            datos: true,
            corte: true,
            flexion: true,
            acero: true
        },

        // Configuraciones de acero reutilizables con sincronización
        aceros: (() => {
            const valorTransversal = AceroManager.getValorPorDefectoTransversal(tipo);

            // Crear configuración principal del transversal
            const transversal = AceroManager.crearConfiguracion(valorTransversal, '1/2', tipo, false);

            // Crear configuración secundaria que se sincroniza con la principal
            const transversal2 = AceroManager.crearConfiguracion(valorTransversal, '1/2', tipo, true, transversal);

            return {
                principal: AceroManager.crearConfiguracion(2, '3/4', tipo),
                secundario: AceroManager.crearConfiguracion(2, '5/8', tipo),
                transversal: transversal,
                transversal2: transversal2
            };
        })(),

        // Getter para obtener todos los tipos de acero disponibles
        get tiposAcero() {
            return AceroManager.tipos;
        },

        // Métodos para manejar acero
        actualizarAcero(tipo, props) {
            if (!this.aceros[tipo]) return;

            // Debounce para evitar cálculos excesivos
            clearTimeout(this.aceros[tipo]._updateTimeout);
            this.aceros[tipo]._updateTimeout = setTimeout(() => {
                this.aceros[tipo].actualizar(props);

                // Si es transversal, sincronizar con transversal2
                if (tipo === 'transversal' && this.aceros.transversal2) {
                    this.aceros.transversal2.sincronizarConPrincipal();
                }

                this.aceros[tipo].setAsRequerido(this.datosflexion.As || 0);
                this.aceros[tipo].setRminArea(this.datosflexion.rmincuans || 0);
                this.aceros[tipo].setRminAreas(this.datosflexion.rminareas || 0);
                this.notificarCambiosAcero(tipo);
            }, 200);
        },

        actualizarAsRequerido() {
            const AsRequerido = this.datosflexion.As || 0;
            const RminArea = this.datosflexion.rmincuans || 0;
            const RminAreas = this.datosflexion.rminareas || 0;

            Object.values(this.aceros).forEach(acero => {
                acero.setAsRequerido(AsRequerido);
                acero.setRminArea(RminArea);
                acero.setRminAreas(RminAreas);
            });
        },

        notificarCambiosAcero(tipo) {
            const event = new CustomEvent(`${this.tipo}-acero-${tipo}-updated`, {
                detail: {
                    tipo: this.tipo,
                    tipoAcero: tipo,
                    configuracion: this.aceros[tipo]
                }
            });
            ////console.log(event);
            document.dispatchEvent(event);
            this.notificarCambios();
        },

        // Método para sincronizar manualmente transversal2 con transversal
        sincronizarTransversales() {
            if (this.aceros.transversal2) {
                this.aceros.transversal2.sincronizarConPrincipal();
            }
        },

        // Inicialización
        init() {
            this.inicializarDatos();
            this.configurarEventos();
            this.calcular();
        },

        configurarEventos() {
            // Evento principal de predimensionamiento
            document.addEventListener('predimensionamiento-updated', (event) => {
                this.predimData = event.detail;
                this.actualizarDatosSegunPredim();
                this.calcular();
            });

            this.$watch('datos', () => {
                this.calcular();
            });

            // Observa cambios en aceros y sincroniza automáticamente
            Object.keys(this.aceros).forEach(tipo => {
                this.$watch(`aceros.${tipo}.cantidad`, () => {
                    this.actualizarAcero(tipo, { cantidad: this.aceros[tipo].cantidad });
                });
                this.$watch(`aceros.${tipo}.diametro`, () => {
                    this.actualizarAcero(tipo, { diametro: this.aceros[tipo].diametro });
                });
            });

            // Evento específico para sincronización de transversales
            document.addEventListener('acero-config-changed', (event) => {
                const config = event.detail.config;
                if (config && !config.isSecundario) {
                    // Si cambió una configuración principal, sincronizar secundarias
                    this.sincronizarTransversales();
                }
            });
        },

        inicializarDatos() {
            this.datos = this.getValoresDefecto();
            this.actualizarDatosSegunPredim();
        },

        actualizarDatosSegunPredim() {
            if (!this.predimData) {
                console.warn(`${this.tipo} - predimData no disponible`);
                return;
            }
            const resultadosPredim = this.predimData.inputValues || {};

            const FyOriginal = resultadosPredim.B8 || this.datos.Fy || 4200;
            const Fy = FyOriginal < 1000 ? FyOriginal * 10.197 : FyOriginal;

            const FcOriginal = resultadosPredim.B7 || this.datos.Fc || 21;
            const Fc = FcOriginal < 100 ? FcOriginal * 10.197 : FcOriginal;

            this.datos = {
                ...this.datos,
                Fy: resultadosPredim.B8 || this.datos.Fy,
                Fc: resultadosPredim.B7 || this.datos.Fc,
                mu: this.datos.Mu * 100000,
            };

            this.actualizarDimensiones(resultadosPredim);
        },

        actualizarDimensiones(resultadosPredim) {
            const configuraciones = {
                pantalla: {
                    t: () => resultadosPredim.espesor_base_pantalla * 100,
                    d: () => this.datos.t - 4,
                    b: () => 100
                },
                punta: {
                    t: () => 0.75 * 100,
                    d: () => this.datos.t - 10,
                    b: () => 100
                },
                talon: {
                    //t: () => resultadosPredim.peralte_zapata * 100,
                    t: () => 0.75 * 100,
                    d: () => this.datos.t - 10,
                    b: () => 100
                },
                key: {
                    t: () => 0.9 * 100,
                    d: () => this.datos.t - 10,
                    b: () => 100
                }
            };

            const config = configuraciones[this.tipo];
            if (config) {
                Object.keys(config).forEach(key => {
                    try {
                        const valor = config[key]();
                        if (!isNaN(valor) && valor > 0) {
                            this.datos[key] = valor;
                        }
                    } catch (error) {
                        console.warn(`Error actualizando ${key}:`, error);
                    }
                });
            }
        },

        getValoresDefecto() {
            const defaults = {
                pantalla: { Mu: 101.73, Vu: 35.9, Fy: 4200, Fc: 21, b: 100, t: 90, d: 86, mu: 10 },
                punta: { Mu: 52.39, Vu: 38.03, Fy: 4200, Fc: 21, b: 100, t: 60, d: 52.5, mu: 10 },
                talon: { Mu: 76.84, Vu: 37.54, Fy: 4200, Fc: 21, b: 100, t: 75, d: 67, mu: 10 },
                key: { Mu: 5.15, Vu: 10.10, Fy: 4200, Fc: 21, b: 100, t: 90, d: 80, mu: 10 }
            };
            return defaults[this.tipo] || defaults.pantalla;
        },

        calcular() {
            this.clearErrors();
            try {
                const resultado = this.calculator.calcular(this.datos, this.predimData);
                this.resultados = resultado.resultados;
                this.errors = resultado.errors;
                this.notificarCambios();
                if (typeof this.actualizarAsRequerido === 'function') {
                    this.actualizarAsRequerido();
                }
            } catch (error) {
                this.addError('calculo', `Error en el cálculo: ${error.message}`);
                console.error(`Error en el cálculo de ${this.tipo}:`, error);
            }
        },

        notificarCambios() {
            //console.log("el tipo usado es ", tipo)
            const acerosDetalles = Object.entries(this.aceros).map(([tipo, config]) => {
                // Clonamos la configuración para no modificar la original
                const configClon = { ...config };

                // Aseguramos que 'cantidad' sea un entero redondeado hacia arriba
                if (configClon.cantidad !== undefined) {
                    configClon.cantidad = Math.ceil(configClon.cantidad);
                }

                return {
                    tipoAcero: tipo,
                    configuracion: configClon,
                    seccion: this.tipo
                };
            });

            const eventDetail = {
                tipo: tipo, // This is the section type (pantalla, punta, talon, key)
                datos: this.datos,
                resultados: this.resultados,
                errors: this.errors,
                aceros: acerosDetalles,
                seccion: this.tipo // Explicitly add section type at root level
            };

            // Dispatch component-specific event
            document.dispatchEvent(new CustomEvent(`${this.tipo}-updated`, {
                detail: eventDetail
            }));
            //console.log("eventos de aceros actualizados en concreto Armado con actualizaciones, ", eventDetail)
            // Dispatch global event with same detail
            document.dispatchEvent(new CustomEvent('concretoArmado-updated', {
                detail: eventDetail
            }));
        },

        // notificarCambios() {
        //     const acerosDetalles = Object.entries(this.aceros).map(([tipo, config]) => ({
        //         tipoAcero: tipo,
        //         configuracion: config
        //     }));
        //     const event = new CustomEvent(`${this.tipo}-updated`, {
        //         detail: {
        //             tipo: this.tipo,
        //             datos: this.datos,
        //             resultados: this.resultados,
        //             errors: this.errors,
        //             //predimData: this.predimData,
        //             aceros: acerosDetalles
        //         }
        //     });
        //     //console.log("eventos de aceros actualizados en concreto Armado con actualizaciones, ", event.detail)
        //     //document.dispatchEvent(event);
        //     document.dispatchEvent(new CustomEvent('concretoArmado-updated', {
        //         detail: event.detail
        //     }));
        // },

        // Métodos auxiliares
        toggleSeccion(seccion) {
            this.secciones[seccion] = !this.secciones[seccion];
        },

        addError(id, message) {
            if (!this.errors.some(e => e.id === id)) {
                this.errors.push({ id, message });
            }
        },

        clearErrors() {
            this.errors = [];
        },

        formatValue(value, decimals = 2) {
            if (value === null || value === undefined || isNaN(value)) return '-';
            return parseFloat(value).toFixed(decimals);
        },

        // Getters
        get hasErrors() {
            return this.errors.length > 0;
        },

        get titulo() {
            const titulos = {
                pantalla: 'PANTALLA',
                punta: 'PUNTA',
                talon: 'TALÓN',
                key: 'DENTELLÓN'
            };
            return titulos[this.tipo] || this.tipo.toUpperCase();
        },

        get datoscorte() {
            const datosResultado = this.resultados.corte || {};
            return {
                d: datosResultado.C305 || 0,
                Vu: datosResultado.C306 || 0,
                Vc: datosResultado.C307 || 0,
                phi_Vc: datosResultado.C308 || 0,
                ratio: datosResultado.C309 || 0,
                verificacion: datosResultado.C310 || 0,
            };
        },

        get datosflexion() {
            const datosResultado = this.resultados.flexion || {};
            return {
                rmincuan: datosResultado.B318 || 0,
                rminarea: datosResultado.B319 || 0,
                rmincuans: datosResultado.C318 || 0,
                rminareas: datosResultado.C319 || 0,
                a: datosResultado.B320 || 0,
                as: datosResultado.B321 || 0,
                As: datosResultado.B322 || 0,
            };
        },

        get datosVisuales() {
            const datosResultado = this.resultados[`datos${this.tipo}`] || {};
            return {
                Mu: datosResultado.Mu || this.datos.Mu,
                Vu: datosResultado.Vu || this.datos.Vu,
                Fy: datosResultado.Fy || this.datos.Fy,
                Fc: datosResultado.Fc || this.datos.Fc,
                b: datosResultado.b || this.datos.b,
                t: datosResultado.t || this.datos.t,
                d: datosResultado.d || this.datos.d,
                mu: datosResultado.mu || this.datos.mu
            };
        }
    });
}

let globalConcretoArmadoCalculator;

// Función principal para generar el HTML completo
function generateMainHTML() {
    return `
        <div class="max-w-full mx-auto">
            <div class="cuaderno bg-white rounded-lg shadow-lg overflow-hidden">
                <!-- Contenido principal -->
                <div class="">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Módulo Pantalla -->
                        <div x-data="pantallaModule()" x-init="init()" id="content-pantalla">
                            ${generateElementoHTML('pantalla', 'PANTALLA', 'bg-gray-600')}
                        </div>
                        
                        <!-- Módulo Punta (cuando esté disponible) -->
                        <div x-data="puntaModule()" x-init="init()" id="content-punta" class="elemento-placeholder">
                            ${generateElementoHTML('punta', 'PUNTA', 'bg-gray-600')}
                        </div>
                        
                        <!-- Módulo Talón (cuando esté disponible) -->
                        <div x-data="talonModule()" x-init="init()" id="content-talon" class="elemento-placeholder">
                            ${generateElementoHTML('talon', 'TALÓN', 'bg-gray-600')}
                        </div>
                        
                        <!-- Módulo Dentellón (cuando esté disponible) -->
                        <div x-data="keyModule()" x-init="init()" id="content-key" class="elemento-placeholder">
                            ${generateElementoHTML('key', 'DENTELLÓN', 'bg-gray-600')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función para generar HTML de cada elemento estructural
function generateElementoHTML(tipo, titulo, colorHeader) {
    return `
        <div class="bg-white bg-transparent cuaderno border border-gray-300 rounded-lg shadow-md overflow-hidden">
            <!-- Header del elemento -->
            <div class="${colorHeader} bg-transparent text-white px-4 py-3">
                <h2 class="text-xl font-bold text-center">${titulo}</h2>
            </div>

            <!-- Sección de Datos -->
            <div class="border-b border-gray-200">
                <button @click="toggleSeccion('datos')" 
                        class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <h3 class="font-semibold text-gray-700">DATOS DE ENTRADA</h3>
                    <i class="fas fa-chevron-down transform transition-transform duration-200" 
                       :class="secciones.datos ? 'rotate-180' : ''"></i>
                </button>
                <div x-show="secciones.datos" x-transition:enter="transition ease-out duration-200" 
                     x-transition:enter-start="opacity-0 transform scale-95" 
                     x-transition:enter-end="opacity-100 transform scale-100" 
                     class="px-4 py-3 bg-transparent">
                    ${generateDatosSection()}
                </div>
            </div>

            <!-- Sección de Corte -->
            <div class="border-b border-gray-200">
                <button @click="toggleSeccion('corte')" 
                        class="w-full flex items-center justify-between px-4 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                    <h3 class="font-semibold">DISEÑO POR CORTE</h3>
                    <i class="fas fa-chevron-down transform transition-transform duration-200 text-white" 
                       :class="secciones.corte ? 'rotate-180' : ''"></i>
                </button>
                <div x-show="secciones.corte" x-transition:enter="transition ease-out duration-200" 
                     x-transition:enter-start="opacity-0 transform scale-95" 
                     x-transition:enter-end="opacity-100 transform scale-100" 
                     class="px-4 py-3 bg-transparent">
                    ${generateCorteSection()}
                </div>
            </div>

            <!-- Sección de Flexión -->
            <div class="border-b border-gray-200">
                <button @click="toggleSeccion('flexion')" 
                        class="w-full flex items-center justify-between px-4 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                    <h3 class="font-semibold">DISEÑO POR FLEXIÓN</h3>
                    <i class="fas fa-chevron-down transform transition-transform duration-200 text-white" 
                       :class="secciones.flexion ? 'rotate-180' : ''"></i>
                </button>
                <div x-show="secciones.flexion" x-transition:enter="transition ease-out duration-200" 
                     x-transition:enter-start="opacity-0 transform scale-95" 
                     x-transition:enter-end="opacity-100 transform scale-100" 
                     class="px-4 py-3 bg-transparent">
                    ${generateFlexionSection()}
                </div>
            </div>

            <!-- Sección de Distribución del Acero -->
            <div>
                <button @click="toggleSeccion('acero')" 
                        class="w-full flex items-center justify-between px-4 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                    <h3 class="font-semibold">DISTRIBUCIÓN DEL ACERO</h3>
                    <i class="fas fa-chevron-down transform transition-transform duration-200 text-white" 
                       :class="secciones.acero ? 'rotate-180' : ''"></i>
                </button>
                <div x-show="secciones.acero" x-transition:enter="transition ease-out duration-200" 
                     x-transition:enter-start="opacity-0 transform scale-95" 
                     x-transition:enter-end="opacity-100 transform scale-100" 
                     class="px-4 py-3 bg-transparent">
                    ${generateAceroSection()}
                    ${generateCaraTerreno()}
                    ${generateCaraLibre()}
                </div>
            </div>

            <!-- Sección de Errores -->
            <div x-show="hasErrors" class="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 class="text-red-800 font-semibold mb-2 flex items-center">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Errores de Cálculo:
                </h4>
                <template x-for="error in errors" :key="error.id">
                    <div class="text-red-700 text-sm mb-1" x-text="error.message"></div>
                </template>
            </div>
        </div>
    `;
}

// Función para generar la sección de datos
function generateDatosSection() {
    return `
        <div class="p-4 rounded-lg text-sm text-gray-800 bg-transparent space-y-4">
            <!-- Cabecera de la tabla -->
            <div class="grid grid-cols-3 gap-2 font-semibold text-gray-600 border-b pb-2 border-gray-300">
                <span>Parámetro</span>
                <span>Símbolo</span>
                <span>Valor</span>
            </div>

            <!-- Parámetros de Carga -->
            <div class="text-gray-800">
                <div class="text-xs text-gray-500 uppercase tracking-wide mt-4 mb-1">Carga</div>
                <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
                <span>Momento Último</span>
                <span class="font-mono text-gray-500">Mu</span>
                <span class="font-medium" x-text="formatValue(datosVisuales.Mu) + ' tm-m'"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
                <span>Fuerza Cortante</span>
                <span class="font-mono text-gray-500">Vu</span>
                <span class="font-medium" x-text="formatValue(datosVisuales.Vu) + ' tm'"></span>
                </div>
            </div>

            <!-- Parámetros Geométricos -->
            <div class="text-gray-800">
                <div class="text-xs text-gray-500 uppercase tracking-wide mt-4 mb-1">Geometría</div>
                <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
                <span>Ancho</span>
                <span class="font-mono text-gray-500">b</span>
                <span class="font-medium" x-text="formatValue(datosVisuales.b) + ' cm'"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
                <span>Espesor</span>
                <span class="font-mono text-gray-500">t</span>
                <span class="font-medium" x-text="formatValue(datosVisuales.t) + ' cm'"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
                <span>Peralte efectivo</span>
                <span class="font-mono text-gray-500">d</span>
                <span class="font-medium" x-text="formatValue(datos.d) + ' cm'"></span>
                </div>
            </div>

            <!-- Parámetros de Materiales -->
            <div class="text-gray-800">
                <div class="text-xs text-gray-500 uppercase tracking-wide mt-4 mb-1">Materiales</div>
                <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
                <span>Fluencia del acero</span>
                <span class="font-mono text-gray-500">Fy</span>
                <span class="font-medium" x-text="formatValue(datosVisuales.Fy) + ' kg/cm²'"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
                <span>Resistencia del concreto</span>
                <span class="font-mono text-gray-500">Fc</span>
                <span class="font-medium" x-text="formatValue(datosVisuales.Fc) + ' kg/cm²'"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
                <span>Momento Último</span>
                <span class="font-mono text-gray-500">Mu</span>
                <span class="font-medium" x-text="formatValue(datosVisuales.mu) + ' kg-cm'"></span>
                </div>
            </div>
        </div>
    `;
}

// Función para generar la sección de corte
function generateCorteSection() {
    return `
    <div class="p-4 rounded-lg text-sm text-gray-800 bg-transparent space-y-4">
      <!-- Datos principales -->
      <div class="text-gray-800">
        <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
          <span>Peralte efectivo</span>
          <span class="font-mono text-gray-500">d</span>
          <span class="font-medium" x-text="formatValue(datoscorte.d) + ' cm'"></span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
          <span>Fuerza cortante</span>
          <span class="font-mono text-gray-500">Vu</span>
          <span class="font-medium" x-text="formatValue(datoscorte.Vu) + ' tn'"></span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
          <span>Resistencia nominal</span>
          <span class="font-mono text-gray-500">Vc</span>
          <span class="font-medium" x-text="formatValue(datoscorte.Vc) + ' tn'"></span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
          <span>Resistencia de diseño</span>
          <span class="font-mono text-gray-500">ΦVc</span>
          <span class="font-medium" x-text="formatValue(datoscorte.phi_Vc) + ' tn'"></span>
        </div>
      </div>

      <!-- Verificación -->
      <div class="pt-4 border-t border-gray-300">
        <div class="text-sm text-gray-700 mb-1">Verificación: ¿ΦVc ≥ Vu?</div>
        <div class="mb-2">
          <span x-text="datoscorte.verificacion"
                class="inline-block px-4 py-1 rounded-full font-semibold text-sm"
                :class="datoscorte.verificacion === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
          </span>
        </div>
        <div>
          <span class="text-sm text-gray-600">Ratio de uso: </span>
          <span class="font-bold text-blue-600" x-text="formatValue(datoscorte.ratio) + '%'"></span>
        </div>
      </div>
    </div>
  `;
}

// Función para generar la sección de flexión
function generateFlexionSection() {
    return `
    <div class="p-4 rounded-lg text-sm text-gray-800 bg-transparent space-y-6">

      <!-- Cuantías y Áreas de Acero -->
      <div>
        <div class="text-base font-semibold text-gray-700 mb-2">Cuantías y Áreas de Acero</div>
        <div class="grid grid-cols-3 gap-2 font-semibold text-gray-600 border-b pb-2 border-gray-300">
          <span>Tipo</span>
          <span>Cuantía</span>
          <span>Área (cm²)</span>
        </div>

        <!-- Fila 1 -->
        <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
          <span class="text-gray-800">r mín (cuantía)</span>
          <span class="font-mono text-gray-600" x-text="formatValue(datosflexion.rmincuan, 4)"></span>
          <span class="font-mono font-medium" x-text="formatValue(datosflexion.rmincuans, 2)"></span>
        </div>

        <!-- Fila 2 -->
        <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
          <span class="text-gray-800">r mín (área)</span>
          <span class="font-mono text-gray-600" x-text="formatValue(datosflexion.rminarea, 4)"></span>
          <span class="font-mono font-medium" x-text="formatValue(datosflexion.rminareas, 2)"></span>
        </div>
      </div>

      <!-- Resultados del cálculo -->
      <div>
        <div class="text-base font-semibold text-gray-700 mb-2">Resultados del Cálculo</div>

        <div class="grid grid-cols-3 gap-2 font-semibold text-gray-600 border-b pb-2 border-gray-300">
          <span>Parámetro</span>
          <span>Símbolo</span>
          <span>Valor</span>
        </div>

        <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
          <span class="text-gray-800">Profundidad del bloque</span>
          <span class="font-mono text-gray-600">a</span>
          <span class="font-medium" x-text="formatValue(datosflexion.a) + ' cm'"></span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
          <span class="text-gray-800">As requerido</span>
          <span class="font-mono text-gray-600">As<sub>req</sub></span>
          <span class="font-medium" x-text="formatValue(datosflexion.as) + ' cm²'"></span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 rounded hover:bg-white/30 transition">
          <span class="text-gray-800">As a usar</span>
          <span class="font-mono text-gray-600">As</span>
          <span class="font-medium" x-text="formatValue(datosflexion.As) + ' cm²'"></span>
        </div>
      </div>
    </div>
  `;
}

// Función para generar la sección de distribución del acero
function generateAceroSection() {
    return `
        <div class="space-y-4">
            <template x-for="(tipoAcero, index) in ['principal', 'secundario']" :key="index">
                <div x-data="{ 
                    tipo: tipoAcero,
                    get configuracion() { return aceros[tipoAcero] },
                    get titulo() { 
                        const titulos = {
                            principal: 'Acero Longitudinal Principal',
                            secundario: 'Acero Longitudinal Secundario', 
                        };
                        return titulos[tipoAcero] || tipoAcero;
                    },
                    get colorHeader() {
                        const colores = {
                            principal: 'bg-transparent',
                            secundario: 'bg-transparent',
                        };
                        return colores[tipoAcero] || 'bg-gray-950';
                    },
                    get colorBg() {
                        const colores = {
                            principal: 'bg-transparent',
                            secundario: 'bg-transparent',
                        };
                        return colores[tipoAcero] || 'bg-gray-950';
                    }
                }">
                    <div :class="colorHeader" class="text-gray-950 font-bold px-3 py-2 text-sm uppercase" x-text="titulo"></div>
                    <div :class="colorBg" class="p-3 border border-gray-200 rounded-b-lg">
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <!-- Cantidad -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">Cantidad</label>
                                <input type="number" min="1" step="1" 
                                       class="w-full bg-yellow-100 text-center font-bold p-2 rounded border-2 border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                                       :value="configuracion.cantidad"
                                       @input="actualizarAcero(tipo, { cantidad: parseInt($event.target.value) || 1 })">
                            </div>
                            
                            <!-- Diámetro -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">Diámetro</label>
                                <select class="w-full p-2 bg-yellow-100 rounded border-2 border-yellow-300 text-center font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        :value="configuracion.diametro"
                                        @change="actualizarAcero(tipo, { diametro: $event.target.value })">
                                    <template x-for="opcion in tiposAcero" :key="opcion.label">
                                        <option :value="opcion.label" x-text="opcion.label"></option>
                                    </template>
                                </select>
                            </div>
                            
                            <!-- Área calculada -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">Área (cm²)</label>
                                <div class="w-full p-2 bg-white rounded border-2 border-blue-300 text-center font-bold text-blue-700"
                                     x-text="formatValue(configuracion.As)"></div>
                            </div>

                            <!-- Espaciamiento -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">Espaciamiento</label>
                                <template x-if="tipo === 'principal'">
                                    <div class="w-full p-2 bg-white rounded border-2 border-purple-300 text-center font-bold text-purple-700" 
                                         x-text="configuracion.espaciamientoPrincipal + ' cm'"></div>
                                </template>
                                <template x-if="tipo === 'secundario'">
                                    <div class="w-full p-2 bg-white rounded border-2 border-purple-300 text-center font-bold text-purple-700" 
                                         x-text="configuracion.espaciamientoSecundario + ' cm'"></div>
                                </template>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-4 gap-2 bg-blue-100 p-2 text-center">
                        <div class="p-1"><span x-text="formatValue(configuracion.cantidad)"></span></div>
                        <div class="p-1">Ø</div>
                        <div class="p-1"><span x-text="configuracion.diametro"></span></div>
                        <div class="p-1">@ <span x-text="tipo === 'principal' ? configuracion.espaciamientoalgPrin : configuracion.espaciamientoalgoSecs"></span></div>
                    </div>
                </div>
            </template>
        </div>
    `;
}

function generateCaraTerreno() {
    return `
        <div class="space-y-4">
            <template x-for="(tipoAcero, index) in ['transversal']" :key="index">
                <div x-data="{ 
                    tipo: tipoAcero,
                    get configuracion() { return aceros[tipoAcero] },
                    get titulo() { 
                        const titulos = {
                            transversal: 'DISTIBUCION DEL ACERO TRANSVERSAL  Cara del terreno',
                        };
                        return titulos[tipoAcero] || tipoAcero;
                    },
                    get colorHeader() {
                        const colores = {
                            transversal: 'bg-transparente',
                        };
                        return colores[tipoAcero] || 'bg-gray-600';
                    },
                    get colorBg() {
                        const colores = {
                            transversal: 'bg-transparente',
                        };
                        return colores[tipoAcero] || 'bg-gray-50';
                    }
                }">
                    <div :class="colorHeader" class="text-gray-950 font-bold px-3 py-2 text-sm uppercase" x-text="titulo"></div>
                    <div :class="colorBg" class="p-3 border border-gray-200 rounded-b-lg">
                        <div class="grid grid-cols-2 gap-4">
                            <!-- proporcion -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">PROPORCION: </label>
                                <input type="number" min="1" step="0.01"
                                       class="w-full bg-yellow-100 text-center font-bold p-2 rounded border-2 border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                                       :value="configuracion.cantidad"
                                       @input="actualizarAcero(tipo, { cantidad: parseInt($event.target.value) || 0.33 })">
                            </div>

                            <!-- As -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">As: </label>
                                <span x-text="formatValue(configuracion.AsCaTe) + ' cm²/m'"></span>
                            </div>

                            <!-- Diámetro -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">AREA DEL ACERO A USAR:</label>
                                <select class="w-full p-2 bg-yellow-100 rounded border-2 border-yellow-300 text-center font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        :value="configuracion.diametro"
                                        @change="actualizarAcero(tipo, { diametro: $event.target.value })">
                                    <template x-for="opcion in tiposAcero" :key="opcion.label">
                                        <option :value="opcion.label" x-text="opcion.label"></option>
                                    </template>
                                </select>
                            </div>

                            <!-- As1 -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">As1: </label>
                                <span x-text="formatValue(configuracion.as1) + ' cm²/m'"></span>
                            </div>

                            <!-- Área calculada -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">Área (cm²)</label>
                                <div class="w-full p-2 bg-white-100 rounded border-2 border-blue-300 text-center font-bold text-blue-700"
                                     x-text="formatValue(configuracion.valor)"></div>
                            </div>

                            <!-- Espaciamiento -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">Espaciamiento</label>
                                <div class="w-full p-2 bg-white-100 rounded border-2 border-purple-300 text-center font-bold text-purple-700" 
                                     x-text="(configuracion.espaciamientoCT) + ' cm'"></div>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-4 gap-2 bg-blue-100 p-2 text-center">
                        <div class="p-1"><span x-text="Math.ceil(configuracion.cantidad)"></span></div>
                        <div class="p-1">Ø</div>
                        <div class="p-1"><span x-text="configuracion.diametro"></span></div>
                        <div class="p-1">@ <span x-text="(configuracion.espaciamientoalgoritmoCT)"></span></div>
                    </div>
                </div>
            </template>
        </div>
    `;
}

function generateCaraLibre() {
    return `
        <div class="space-y-4">
            <template x-for="(tipoAcero, index) in ['transversal2']" :key="index">
                <div x-data="{ 
                    tipo: tipoAcero,
                    get configuracion() { return aceros[tipoAcero] },
                    get titulo() { 
                        const titulos = {
                            transversal2: 'DISTIBUCION DEL ACERO TRANSVERSAL  CARA LIBRE'
                        };
                        return titulos[tipoAcero] || tipoAcero;
                    },
                    get colorHeader() {
                        const colores = {
                            transversal2: 'bg-transparent'
                        };
                        return colores[tipoAcero] || 'bg-gray-600';
                    },
                    get colorBg() {
                        const colores = {
                            transversal2: 'bg-transparent'
                        };
                        return colores[tipoAcero] || 'bg-gray-50';
                    }
                }">
                    <div :class="colorHeader" class="text-gray-950 font-bold px-3 py-2 text-sm uppercase" x-text="titulo"></div>
                    <div :class="colorBg" class="p-3 border border-gray-200 rounded-b-lg">
                        <div class="grid grid-cols-2 gap-4">
                            <!-- proporcion -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">PROPORCION: </label>
                                <input type="number" min="1" step="0.01" 
                                       class="w-full bg-yellow-100 text-center font-bold p-2 rounded border-2 border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                                       :value="configuracion.cantidad"
                                       @input="actualizarAcero(tipo, { cantidad: parseInt($event.target.value) || 0.33 })">
                            </div>
                            
                            <!-- As1 -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">As1: </label>
                                <span x-text="formatValue(configuracion.as1Clibre) + ' cm²/m'"></span>
                            </div>

                            <!-- Diámetro -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">AREA DEL ACERO A USAR:</label>
                                <select class="w-full p-2 bg-yellow-100  rounded border-2 border-yellow-300 text-center font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        :value="configuracion.diametro"
                                        @change="actualizarAcero(tipo, { diametro: $event.target.value })">
                                    <template x-for="opcion in tiposAcero" :key="opcion.label">
                                        <option :value="opcion.label" x-text="opcion.label"></option>
                                    </template>
                                </select>
                            </div>
                            
                            <!-- Área calculada -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">Área (cm²)</label>
                                <div class="w-full p-2 bg-white rounded border-2 border-blue-300 text-center font-bold text-blue-700"
                                     x-text="formatValue(configuracion.valor)"></div>
                            </div>

                            <!-- Espaciamiento -->
                            <div class="text-center">
                                <label class="block text-xs text-gray-600 mb-1 font-medium">Espaciamiento</label>
                                <div class="w-full p-2 bg-white rounded border-2 border-purple-300 text-center font-bold text-purple-700" 
                                     x-text="(configuracion.espaciamientoC) + ' cm'"></div>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-4 gap-2 bg-blue-100 p-2 text-center">
                        <div class="p-1"><span x-text="Math.ceil(configuracion.cantidad)"></span></div>
                        <div class="p-1">Ø</div>
                        <div class="p-1"><span x-text="configuracion.diametro"></span></div>
                        <div class="p-1">@ <span x-text="(configuracion.espaciamientoalgoritmoC)"></span></div>
                    </div>
                </div>
            </template>
        </div>
    `;
}
// Apartado: Recorte de Refuerzo Longitudinal Principal (solo para pantalla, preparado para punta)
function generateRecorteRefuerzoLongitudinalPrincipal(tipo) {
                        // ${generateRecorteRefuerzoLongitudinalPrincipal(tipo)}
    if (tipo !== 'pantalla') return ''; // Mostrar solo para tipo 'pantalla'

    return `
        <div class="space-y-4">
            <div class="bg-gray-100 border border-gray-300 rounded-lg shadow-md p-4">
                <div class="font-bold text-lg text-gray-700 mb-2">PANTALLA (RECORTE DE REFUERZO LONGITUDINAL PRINCIPAL)</div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">L=</label>
                        <span class="font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">4</span>
                        <span class="text-xs text-gray-500">m</span>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Mu=</label>
                        <span class="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded" x-text="formatValue(datosVisuales.Mu)"></span>
                        <span class="text-xs text-gray-500">tm-m</span>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">t=</label>
                        <span class="font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded" x-text="formatValue(datosVisuales.t)"></span>
                        <span class="text-xs text-gray-500">cm</span>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">d=</label>
                        <span class="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded" x-text="formatValue(datosVisuales.d)"></span>
                        <span class="text-xs text-gray-500">cm</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Mu=</label>
                        <span class="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded" x-text="formatValue(datosVisuales.MuKg)"></span>
                        <span class="text-xs text-gray-500">kg-cm²</span>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Asmin</label>
                        <span class="font-bold text-green-700 bg-green-100 px-2 py-1 rounded" x-text="formatValue(datosVisuales.Asmin)"></span>
                    </div>
                </div>
                <div class="bg-black text-white font-bold px-2 py-1 mt-4 mb-2">DISEÑO POR FLEXION</div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">a=</label>
                        <span class="font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded" x-text="formatValue(datosVisuales.a)"></span>
                        <span class="text-xs text-gray-500">cm</span>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">As=</label>
                        <span class="font-bold text-green-700 bg-green-100 px-2 py-1 rounded" x-text="formatValue(datosVisuales.As)"></span>
                        <span class="text-xs text-gray-500">cm²</span>
                    </div>
                </div>
                <div class="bg-red-600 text-white font-bold px-2 py-1 mt-4 mb-2">ACERO LONGITUDINAL PRINCIPAL - RECORTE</div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Cantidad</label>
                       
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Diámetro</label>
                        <span class="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded" x-text="datosVisuales.diametroPrincipal"></span>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Área</label>
                        <span class="font-bold text-green-700 bg-green-100 px-2 py-1 rounded" x-text="formatValue(datosVisuales.AsPrincipal)"></span>
                        <span class="text-xs text-gray-500">cm²</span>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Espaciamiento</label>
                        <span class="font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded" x-text="datosVisuales.espaciamientoPrincipal + ' cm'"></span>
                    </div>
                </div>
                <div class="bg-red-500 text-white font-bold px-2 py-1 mt-4 mb-2">ACERO LONGITUDINAL SECUNDARIO</div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Cantidad</label>
                        
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Diámetro</label>
                        <span class="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded" x-text="datosVisuales.diametroSecundario"></span>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Área</label>
                        <span class="font-bold text-green-700 bg-green-100 px-2 py-1 rounded" x-text="formatValue(datosVisuales.AsSecundario)"></span>
                        <span class="text-xs text-gray-500">cm²</span>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1 font-medium">Espaciamiento</label>
                        <span class="font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded" x-text="datosVisuales.espaciamientoSecundario + ' cm'"></span>
                    </div>
                </div>
                <!-- Apartado para PUNTA (oculto/comentado, para futura implementación) -->
                <!--
                <div class="font-bold text-lg text-gray-700 mb-2">PUNTA (RECORTE DE REFUERZO LONGITUDINAL PRINCIPAL)</div>
                ...estructura similar, pero con datosRecortePunta...
                -->
            </div>
        </div>
    `;
}


export function Desing() {
    return {
        init() {
            //console.log('🔄 Inicializando módulo de vERIFICACIONES...');
            this.initConcretoArmadoModule();
        },

        initConcretoArmadoModule() {
            const container = document.getElementById('concretoArmado-content');
            ////console.log('🔄 Contenedor de DISEÑO...', container);
            if (!container) {
                console.error('Contenedor #concretoArmado-content no encontrado.');
                return;
            }

            if (!globalConcretoArmadoCalculator) {
                globalConcretoArmadoCalculator = new ConcretoArmadoCalculator();

                // Registrar calculadoras específicas
                globalConcretoArmadoCalculator.registrarElemento('pantalla', new PantallaCalculator());
                globalConcretoArmadoCalculator.registrarElemento('punta', new PuntaCalculator());
                globalConcretoArmadoCalculator.registrarElemento('talon', new TalonCalculator());
                globalConcretoArmadoCalculator.registrarElemento('key', new KeyCalculator());
            }

            // Asociar módulos de Alpine.js
            Alpine.data('pantallaModule', createElementoModule('pantalla',
                globalConcretoArmadoCalculator.getElementoCalculator('pantalla'),
                globalConcretoArmadoCalculator));
            Alpine.data('puntaModule', createElementoModule('punta',
                globalConcretoArmadoCalculator.getElementoCalculator('punta'),
                globalConcretoArmadoCalculator));
            Alpine.data('talonModule', createElementoModule('talon',
                globalConcretoArmadoCalculator.getElementoCalculator('talon'),
                globalConcretoArmadoCalculator));
            Alpine.data('keyModule', createElementoModule('key',
                globalConcretoArmadoCalculator.getElementoCalculator('key'),
                globalConcretoArmadoCalculator));

            // Generar HTML
            container.innerHTML = generateMainHTML();

            // Simular actualización inicial con datos de ejemplo
            setTimeout(() => {
                globalConcretoArmadoCalculator.updatePredimData({
                    inputValues: {
                        materiales: { B6: 2.4, B7: 210, B8: 4200, B10: 20, B11: 1.83, B12: 26.9, B13: 0.05, B14: 0.51 },
                        geometria: { B18: 6.4, B19: 1, B20: 12, B21: 7.4 },
                        valpredim: { D45: 0.2, D47: 10, D49: 10, D51: 0.7, D53: 10 }
                    },
                    resultados: {
                        ancho_corona: 0.2,
                        espesor_base_pantalla: 0.64,
                        peralte_zapata: 0.64,
                        ancho_zapata: 4.48,
                        altura_key: 0.64,
                        ancho_key: 0.6
                    }
                });
            }, 100);
        },
    };
}