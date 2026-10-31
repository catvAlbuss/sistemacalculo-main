// analisisEstructural.js
import { DESIGN_CASES, analyzeRetainingWall, buildAnalysisInput, cutoffDesign, designDemands, internalForceSeries } from './structuralAnalysis.js';
import { forcesDiagramSVG, reinforcementSVG, wallGeometry } from './drawings.js';
import { steelDetail, steelLabel } from './word/concrete-report.js';
// Función principal para el análisis estructural compatible con Alpine.js
export function AnalisisEstructural() {
    return {
        // Estado reactivo para cada elemento estructural
        pantalla: {
            datos: {
                E306: 0.3,

            },
            resultados: {
                B277: 1.31,
                B278: 5.03,
                B279: 6.65,

                B280: 0,
                B281: 0.3,
                B282: 4,

                E280: 3.71,
                E281: 0.00,
                E282: 3.71,



                B286: 0,
                C286: 0,
                D286: 0,
                E286: 0,

                B287: 0,
                C287: 0,
                D287: 0,
                E287: 0,

                B288: 0,
                C288: 0,
                D288: 0,
                E288: 0,


                B290: 0,
                B291: 0,
            }
        },

        punta: {
            datos: {},
            resultados: {
                H277: 0,
                H278: 0,
                H279: 0,
                H280: 0,
                H281: 0,
                H282: 0,

                K280: 0,
                K281: 0,

                //tabla
                H287: 0,
                I287: 0,
                J287: 0,
                K287: 0,

                H288: 0,
                I288: 0,
                J288: 0,
                K288: 0,

                H290: 0,
                H291: 0,
            }
        },

        talon: {
            datos: {},
            resultados: {
                N277: 0,
                N278: 0,
                N279: 0,
                N280: 0,
                N281: 0,

                N282: 0,
                N283: 0,
                N284: 0,

                Q280: 0,
                Q281: 0,
                Q282: 0,
                Q284: 0,

                //tabla
                N286: 0,
                O286: 0,
                P286: 0,
                Q286: 0,
                R286: 0,

                N287: 0,
                O287: 0,
                P287: 0,
                Q287: 0,
                R287: 0,

                N288: 0,
                O288: 0,
                P288: 0,
                Q288: 0,
                R288: 0,

                N289: 0,
                O289: 0,
                P289: 0,
                Q289: 0,
                R289: 0,

                //resultados
                N290: 0,
                N291: 0,
            }
        },

        key: {
            datos: {},
            resultados: {
                U277: 5.03,
                U278: 6.65,
                U279: 1.00,


                //tabla 
                U284: 0,
                V284: 0,
                W284: 0,

                U285: 0,
                V285: 0,
                W285: 0,

                U287: 0,
                U288: 0,
            }
        },
        //entradas
        datosDimensionamiento: {},
        datosCargas: {},
        predimData: null,
        presiones: [],
        aceros: {},
        recortes: null,
        entradaAnalisis: null,

        // Criterios del análisis: H101, E175, B187, N193 y N186 del libro
        casosDiseno: DESIGN_CASES,
        criterios: { mode: 'MAXIMO', stemShearAt: 0.3, stemCutoff: 4, heelCutoff: 2, pedestal: 0 },

        // Estado de la interfaz
        activeElement: 'pantalla',
        showDetails: false,

        init() {
            this.configurarEventos();
            const initialDimData = Alpine.store('systemState').resultadosDimensionamiento;
            if (Alpine.store('systemState').dimensionamientoCompleto && initialDimData) {
                this.handleDimensionamientoData({ detail: initialDimData });
            }
        },

        configurarEventos() {
            document.addEventListener('dimensionamiento-calculated', (event) => this.handleDimensionamientoData(event));
            document.addEventListener('verificaciones-updated', (event) => this.handleVerificacionesData(event));
            document.addEventListener('concretoArmado-updated', (event) => {
                const { tipo, aceros } = event.detail || {};
                if (!tipo) return;
                this.aceros = { ...this.aceros, [tipo]: aceros };
                this.actualizarRecortes();
            });
        },

        handleDimensionamientoData(event) {
            if (!event.detail?.resultados) {
                console.error('❌ Evento "dimensionamiento-calculated" no contiene resultados.');
                return;
            }
            this.datosCargas = event.detail.inputValues || {};
            this.datosDimensionamiento = event.detail.resultados || {};
            this.predimData = event.detail.predimData || {};
            // Verificaciones escucha este evento antes y ya publicó sus presiones.
            this.calcularAnalisis();
        },

        // Los esfuerzos del terreno salen de Verificaciones: sin ellos punta y talón no tienen carga.
        handleVerificacionesData(event) {
            this.presiones = event.detail?.tablasVerificaciones?.presionesAdmisibles || [];
            this.calcularAnalisis();
        },

        calcularAnalisis() {
            if (!this.presiones.length || !this.predimData?.inputValues) return;
            this.entradaAnalisis = buildAnalysisInput({
                predim: this.predimData.inputValues,
                dimensions: this.datosCargas,
                results: this.datosDimensionamiento,
                pressures: this.presiones,
                options: this.criterios,
            });
            const analisis = analyzeRetainingWall(this.entradaAnalisis);
            ['pantalla', 'punta', 'talon', 'key'].forEach(elemento => {
                this[elemento].resultados = analisis[elemento];
            });
            const demandas = designDemands(analisis, this.datosCargas);
            Alpine.store('systemState').analisisEstructural = demandas;
            document.dispatchEvent(new CustomEvent('analisis-estructural-updated', { detail: demandas }));
            this.actualizarRecortes();
        },

        barraPrincipal(elemento) {
            const principal = this.aceros[elemento]?.find(item => item.tipoAcero === 'principal')?.configuracion;
            if (!principal?.cantidad) return null;
            return { cantidad: principal.cantidad, diametro: principal.diametro, area: principal.As / principal.cantidad };
        },

        actualizarRecortes() {
            if (!this.entradaAnalisis) return;
            const materiales = this.predimData.inputValues;
            this.recortes = cutoffDesign(this.entradaAnalisis, { pantalla: this.pantalla.resultados, talon: this.talon.resultados }, {
                fy: parseFloat(materiales.B8), fc: parseFloat(materiales.B7),
                crown: parseFloat(this.datosCargas.C74), batter: parseFloat(this.datosCargas.A83),
                bars: { pantalla: this.barraPrincipal('pantalla'), talon: this.barraPrincipal('talon') },
            });
        },

        get diagramaEsfuerzos() {
            return this.entradaAnalisis ? forcesDiagramSVG(internalForceSeries(this.entradaAnalisis), this.criterios.mode) : '';
        },

        get diagramaRefuerzo() {
            if (!this.entradaAnalisis) return '';
            const etiquetas = Object.fromEntries(['pantalla', 'punta', 'talon', 'key'].map(tipo => [tipo,
                Object.fromEntries(['principal', 'secundario', 'transversal', 'transversal2'].map(fila => [fila, steelLabel(this.aceros[tipo], fila)]))]));
            return reinforcementSVG(wallGeometry(this.datosCargas, this.predimData.inputValues), etiquetas, this.recortes);
        },

        get datosPlano() {
            if (!this.entradaAnalisis) return null;
            const materiales = this.predimData.inputValues;
            const filas = ['principal', 'secundario', 'transversal', 'transversal2'];
            return {
                geo: wallGeometry(this.datosCargas, materiales),
                cutoffs: this.recortes,
                materials: { fc: parseFloat(materiales.B7), fy: parseFloat(materiales.B8), qadm: parseFloat(materiales.B10) },
                steel: Object.fromEntries(['pantalla', 'punta', 'talon', 'key'].map(tipo => [tipo,
                    Object.fromEntries(filas.map(fila => [fila, steelDetail(this.aceros[tipo], fila)]))])),
            };
        },

        get reporteAnalisis() {
            return this.entradaAnalisis ? {
                modo: this.criterios.mode, pantalla: this.pantalla.resultados, punta: this.punta.resultados,
                talon: this.talon.resultados, key: this.key.resultados, recortes: this.recortes,
            } : null;
        },

        // Cambiar elemento activo
        cambiarElemento(elemento) {
            this.activeElement = elemento;
        },

        // Alternar detalles
        toggleDetails() {
            this.showDetails = !this.showDetails;
        },

        // Formatear número para mostrar
        formatearNumero(numero, decimales = 2) {
            const valor = parseFloat(numero);
            return Number.isFinite(valor) ? valor.toFixed(decimales) : '-';
        },

        // Obtener clase CSS según el elemento
        obtenerClaseElemento(elemento) {
            const clases = {
                pantalla: 'bg-yellow-100 border-yellow-400',
                punta: 'bg-orange-100 border-orange-400',
                talon: 'bg-blue-100 border-blue-400',
                key: 'bg-green-100 border-green-400'
            };
            return clases[elemento] || 'bg-gray-100 border-gray-400';
        },

        // Obtener color de header según el elemento
        obtenerColorHeader(elemento) {
            const colores = {
                pantalla: 'bg-yellow-200',
                punta: 'bg-orange-200',
                talon: 'bg-blue-200',
                key: 'bg-green-200'
            };
            return colores[elemento] || 'bg-gray-200';
        }
    };
}