const TiposAceroMap = {
    // Mapeo de tipos del sistema a tipos gráficos
    'principal': 'horizontal-inferior',
    'secundario': 'horizontal-superior',
    'transversal': 'vertical-izquierdo',
    'transversal2': 'vertical-derecho',
    'refuerzo': 'inclinado',
    'horizontal': 'horizontal-inferior',
    'vertical': 'vertical-izquierdo',
    'diagonal': 'inclinado',

    // Tipos directos
    'horizontal-inferior': 'horizontal-inferior',
    'horizontal-superior': 'horizontal-superior',
    'vertical-izquierdo': 'vertical-izquierdo',
    'vertical-derecho': 'vertical-derecho',
    'inclinado': 'inclinado'
};

class AceroManager {
    static extraerDatos(concretoArmadoData) {
        const configuracionesCompletas = [];

        Object.keys(concretoArmadoData).forEach(tipo => {
            if (['pantalla', 'punta', 'talon', 'key'].includes(tipo) && concretoArmadoData[tipo]) {
                const datosDelTipo = concretoArmadoData[tipo];
                console.log(datosDelTipo);
                const aceros = this.extraerAcerosDelTipo(tipo, datosDelTipo);

                if (aceros.length > 0) {
                    configuracionesCompletas.push({
                        tipo: tipo,
                        aceros: aceros
                    });
                }
            }
        });

        return configuracionesCompletas;
    }

    static extraerAcerosDelTipo(tipo, datosDelTipo) {
        const acerosData = [];

        // Buscar aceros en diferentes estructuras
        let aceros = null;
        if (datosDelTipo.datosOriginales?.aceros) {
            aceros = datosDelTipo.datosOriginales.aceros;
        } else if (datosDelTipo.aceros) {
            aceros = datosDelTipo.aceros;
        }

        if (aceros && Array.isArray(aceros)) {
            aceros.forEach((acero, index) => {
                const aceronData = this.procesarAcero(acero, index);
                if (aceronData) {
                    acerosData.push(aceronData);
                }
            });
        }

        return acerosData;
    }

    static procesarAcero(acero, index) {
        let cantidad, diametro, espaciamiento, tipoAcero;

        if (acero.configuracion) {
            const config = acero.configuracion;
            cantidad = config.cantidad || 0;
            diametro = config.diametro || "1/2";
            tipoAcero = acero.tipoAcero || `acero-${index}`;

            // Elegir el campo correcto de espaciamiento según tipoAcero
            switch (tipoAcero) {
                case 'principal':
                    espaciamiento = config.espaciamientoalgPrin ?? config.espaciamientoPrincipal ?? 15;
                    break;
                case 'secundario':
                    espaciamiento = config.espaciamientoalgoSecs ?? config.espaciamientoSecundario ?? 15;
                    break;
                case 'transversal':
                    espaciamiento = config.espaciamientoalgoritmoCT ?? config.espaciamientoCT ?? 15;
                    break;
                case 'transversal2':
                    espaciamiento = config.espaciamientoalgoritmoC ?? config.espaciamientoC ?? 15;
                    break;
                default:
                    espaciamiento = config.espaciamientoalgoritmo ?? config.espaciamientoPrincipal ?? 15;
                    break;
            }
        } else {
            cantidad = acero.cantidad || 0;
            diametro = acero.diametro || "1/2";
            espaciamiento = acero.espaciamiento || 15;
            tipoAcero = acero.tipoAcero || `acero-${index}`;
        }

        // CORRECCIÓN: Mapear el tipo de acero al sistema gráfico
        const tipoGrafico = TiposAceroMap[tipoAcero] || null;

        if (!tipoGrafico) {
            console.warn(`Tipo de acero '${tipoAcero}' no mapeado, usando tipo por defecto`);
            return null;
        }

        return {
            cantidad: Math.round(cantidad * 100) / 100,
            diametro: diametro.replace('Ø ', '').replace('"', ''),
            espaciamiento: Math.round(espaciamiento),
            tipoAcero: tipoAcero,
            tipoGrafico: tipoGrafico
        };
    }

}

export const Dibujo = () => {
    return {
        predimData: null,
        datosDimInput: {},
        datosResultados: {},
        datosCalculados: {},
        isExporting: false,
        exportStatus: '',
        planos: [],

        // Estados principales
        dimensionamientoData: null,
        concretoArmadoData: {
            pantalla: null,
            punta: null,
            talon: null,
            key: null
        },

        // Renderizador
        renderer: null,

        // Estados
        isReady: false,
        errors: [],
        dimensionamientoCompleto: false,

        // Configuración
        configDefecto: {
            inputHd: 1, basem: 3.60, b1graf: 2, hzgraf: 1,
            inputh: 8.5, epgraf: 0.15, egraf: 0.2, b2graf: 1.25,
            considerar: 'si', acertrans: 1.27, valor1: 5,
            acertransName: '1/2', asverftrans: 25
        },
        configActual: null,
        // Cache
        lastRenderHash: null,

        init() {
            //console.log("🎨 Dibujo CAD Inicializado");
            this.configurarEventos();
            // Si hay datos en el store global al iniciar, los procesamos
            const systemState = Alpine.store('systemState');
            if (systemState?.dimensionamientoCompleto && systemState?.resultadosDimensionamiento) {
                //console.log("📊 Procesando datos iniciales del store...");
                this.handleDimensionamientoData({
                    detail: {
                        resultados: systemState.resultadosDimensionamiento,
                        inputValues: systemState.inputValues || {},
                        predimData: systemState.predimData || {}
                    }
                });
            }
        },

        configurarEventos() {
            // Escuchar evento de dimensionamiento calculado
            document.addEventListener('dimensionamiento-calculated', (event) => {
                //console.log("📡 Evento dimensionamiento-calculated recibido");
                this.handleDimensionamientoData(event);
            });

            document.addEventListener('concretoArmado-updated', this.manejarConcretoArmado.bind(this));
        },

        handleDimensionamientoData(event) {
            try {
                // Almacenar los datos recibidos
                this.datosDimInput = event.detail.inputValues || {};
                this.datosResultados = event.detail.resultados || {};
                this.predimData = event.detail.predimData || {};

                // console.log('✅ Datos almacenados:', {
                //     predimData: Object.keys(this.predimData).length,
                //     datosDimInput: Object.keys(this.datosDimInput).length,
                //     datosResultados: Object.keys(this.datosResultados).length
                // });

                // Preparar datos calculados adicionales si es necesario
                this.prepararDatosCalculados();

                this.showNotification('success', 'Datos del dimensionamiento procesados correctamente. ¡Listo para exportar!');

            } catch (error) {
                console.error('❌ Error procesando datos del dimensionamiento:', error);
                this.showNotification('error', 'Error procesando datos: ' + error.message);
            }
        },

        manejarConcretoArmado(event) {
            // if (!this.dimensionamientoCompleto) {
            //     //console.warn('⚠️ Datos de concreto armado recibidos antes del dimensionamiento');
            //     return;
            // }
            const elementData = event.detail;
            if (elementData.tipo && ['pantalla', 'punta', 'talon', 'key'].includes(elementData.tipo)) {
                this.procesarElementoConcretoArmado(elementData.tipo, elementData.seccion, elementData);
            } else {
                this.procesarConcretoArmadoCompleto(elementData);
            }
        },

        prepararDatosCalculados() {
            // Calcular valores adicionales necesarios para el dibujo
            this.datosCalculados = {
                timestamp: new Date().toISOString(),
                hasValidData: this.validateData(),
                // Agregar más cálculos según sea necesario
            };
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

        procesarConcretoArmadoCompleto(data) {
            try {
                ['pantalla', 'punta', 'talon', 'key'].forEach(tipo => {
                    if (data[tipo] && data[tipo] !== null) {
                        this.procesarElementoConcretoArmado(tipo, 'principal', data[tipo]);
                    }
                });

                //console.log('✅ Datos de concreto armado procesados');
                this.verificarYRenderizar();

            } catch (error) {
                this.agregarError('concreto_armado_completo', `Error procesando concreto armado: ${error.message}`);
            }
        },

        procesarElementoConcretoArmado(tipo, seccion, elementoData) {
            try {
                this.concretoArmadoData[tipo] = {
                    tipo: tipo,
                    seccion: seccion,
                    datosOriginales: elementoData,
                    datosGrafico: this.extraerDatosRelevantes(tipo, seccion, elementoData),
                    timestamp: Date.now()
                };

                //console.log(`✅ Elemento ${tipo} procesado exitosamente`);
                this.verificarYRenderizar();

            } catch (error) {
                console.error(`❌ Error procesando elemento ${tipo}:`, error);
                this.agregarError('elemento_concreto', `Error procesando ${tipo}: ${error.message}`);
            }
        },

        extraerDatosRelevantes(tipo, seccion, elementoData) {
            const datosRelevantes = {
                tipo: tipo,
                seccion: seccion,
                aceros: [],
                datos: {},
                resultados: {}
            };

            try {
                if (elementoData.datos) {
                    datosRelevantes.datos = {
                        Mu: this.obtenerValorNumerico(elementoData.datos, 'Mu'),
                        Vu: this.obtenerValorNumerico(elementoData.datos, 'Vu'),
                        Fy: this.obtenerValorNumerico(elementoData.datos, 'Fy', 4200),
                        Fc: this.obtenerValorNumerico(elementoData.datos, 'Fc', 210),
                        b: this.obtenerValorNumerico(elementoData.datos, 'b', 100)
                    };
                }

                if (elementoData.resultados) {
                    datosRelevantes.resultados = { ...elementoData.resultados };
                }

                if (elementoData.aceros && Array.isArray(elementoData.aceros)) {
                    datosRelevantes.aceros = elementoData.aceros.map((acero, index) => {
                        return this.extraerDatosAcero(acero, index);
                    });
                }

                return datosRelevantes;

            } catch (error) {
                console.error(`❌ Error extrayendo datos de ${tipo}:`, error);
                return datosRelevantes;
            }
        },

        extraerDatosAcero(acero, index) {
            const datosAcero = {
                tipoAcero: acero.tipoAcero || 'desconocido',
                index: index,
                configuracion: {}
            };

            try {
                if (acero.configuracion) {
                    const config = acero.configuracion;
                    datosAcero.configuracion = {
                        cantidad: config.cantidad || 0,
                        diametro: config.diametro || '1/2',
                        elemento: config.elemento || '',
                        isSecundario: config.isSecundario || false,
                        As: this.obtenerValorSeguro(config, 'As'),
                        AsCaTe: this.obtenerValorSeguro(config, 'AsCaTe'),
                        as1: this.obtenerValorSeguro(config, 'as1'),
                        espaciamientoPrincipal: this.obtenerValorSeguro(config, 'espaciamientoPrincipal'),
                        espaciamientoSecundario: this.obtenerValorSeguro(config, 'espaciamientoSecundario'),
                        espaciamientoalgoritmo: this.obtenerValorSeguro(config, 'espaciamientoalgoritmo'),
                        AsRequerido: config._AsRequerido || 0,
                        rminArea: config._rminArea || 0,
                        rminAreas: config._rminAreas || 0
                    };
                }

                return datosAcero;

            } catch (error) {
                console.warn(`⚠️ Error extrayendo configuración de acero ${index}:`, error);
                return datosAcero;
            }
        },

        verificarYRenderizar() {
            const datosCompletos = this.verificarDatosCompletos();

            if (datosCompletos && !this.isReady) {
                this.isReady = true;
                //console.log('🎯 Todos los datos están listos, iniciando renderizado');
            }
        },

        verificarDatosCompletos() {
            const tieneDimensionamiento = this.dimensionamientoCompleto && !!this.dimensionamientoData;
            const tieneAlgunConcreto = Object.values(this.concretoArmadoData).some(data => data !== null);
            return tieneDimensionamiento;
        },

        obtenerValorSeguro(objeto, propiedad) {
            try {
                if (objeto && typeof objeto[propiedad] !== 'undefined') {
                    const valor = objeto[propiedad];
                    return typeof valor === 'function' ? valor() : valor;
                }
                return null;
            } catch (error) {
                console.warn(`⚠️ Error obteniendo ${propiedad}:`, error);
                return null;
            }
        },

        validateData() {
            // Validar que tenemos los datos mínimos necesarios
            const hasPreDim = this.predimData && Object.keys(this.predimData).length > 0;
            const hasDimInput = this.datosDimInput && Object.keys(this.datosDimInput).length > 0;
            const hasResults = this.datosResultados && Object.keys(this.datosResultados).length > 0;

            //console.log('🔍 Validación de datos:', { hasPreDim, hasDimInput, hasResults });
            return hasPreDim || hasDimInput || hasResults;
        },

        async exportardwg() {
            if (this.isExporting) {
                //console.log('⏳ Exportación ya en proceso...');
                return;
            }

            //console.log("🚀 Iniciando exportación a DXF...");
            this.isExporting = true;
            this.exportStatus = 'Preparando datos...';

            // Validar datos antes de exportar
            if (!this.validateData()) {
                this.showNotification('error', 'No hay datos válidos para exportar. Ejecuta primero el dimensionamiento.');
                this.isExporting = false;
                this.exportStatus = '';
                return;
            }

            try {
                this.exportStatus = 'Enviando al servidor...';
                const configuracionesAcero = AceroManager.extraerDatos(this.concretoArmadoData);
                console.log("Datos de la configuracion de acero   ", configuracionesAcero);
                // Preparar payload con todos los datos
                const payload = {
                    predim: this.predimData,
                    dimen: this.datosDimInput,
                    resultdim: this.datosResultados,
                    concretoArmadoData: configuracionesAcero,
                    x: 0, // Coordenada X del marco
                    y: 0, // Coordenada Y del marco
                    timestamp: new Date().toISOString()
                };

                // Hacer la petición al servidor
                //const response = await fetch('http://localhost:3000/exportar', {
                const response = await fetch('https://apinodecad.onrender.com/exportar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP ${response.status}`);
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `plano_muro_${Date.now()}.dxf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);

            } catch (error) {
                console.error('❌ Error en exportación:', error);

                this.exportStatus = 'Error';

                // Mostrar error específico
                let errorMessage = 'Error desconocido en la exportación.';

                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage = 'No se pudo conectar al servidor. Verifica que esté ejecutándose en http://localhost:3000';
                } else if (error.message.includes('HTTP')) {
                    errorMessage = `Error del servidor: ${error.message}`;
                } else {
                    errorMessage = error.message;
                }

                this.showNotification('error', errorMessage);

                // Limpiar estado de error después de un momento
                setTimeout(() => {
                    this.exportStatus = '';
                }, 5000);

            } finally {
                this.isExporting = false;
            }
        },

        showNotification(type, message, details = '') {
            // Usar el sistema de notificaciones disponible
            if (window.NotificationManager) {
                if (type === 'success') {
                    NotificationManager.showSuccess(message, details);
                } else {
                    NotificationManager.showError(message, details);
                }
            } else {
                // Fallback a alert si no hay sistema de notificaciones
                const fullMessage = details ? `${message}\n${details}` : message;
                if (type === 'success') {
                    alert(`✅ ${fullMessage}`);
                } else {
                    alert(`❌ ${fullMessage}`);
                }
            }
        },

        // Método para debug - mostrar estado actual
        debugInfo() {
            // console.log('🐛 Estado actual del componente Dibujo:', {
            //     predimData: this.predimData,
            //     datosDimInput: this.datosDimInput,
            //     datosResultados: this.datosResultados,
            //     datosCalculados: this.datosCalculados,
            //     isExporting: this.isExporting,
            //     exportStatus: this.exportStatus,
            //     isValidData: this.validateData()
            // });
        },

        // Getter para mostrar si está listo para exportar
        get canExport() {
            return this.validateData() && !this.isExporting;
        },

        // Getter para el texto del botón
        get exportButtonText() {
            if (this.isExporting) {
                return this.exportStatus || 'Exportando...';
            }
            if (!this.validateData()) {
                return 'Sin datos para exportar';
            }
            return 'Exportar a DXF';
        },

        // Getter para el estado CSS del botón
        get exportButtonClass() {
            const baseClass = 'px-4 py-2 rounded font-medium transition-all duration-200';

            if (this.isExporting) {
                return `${baseClass} bg-yellow-500 text-white cursor-wait`;
            }
            if (!this.validateData()) {
                return `${baseClass} bg-gray-400 text-gray-700 cursor-not-allowed`;
            }
            return `${baseClass} bg-blue-600 hover:bg-blue-700 text-white cursor-pointer`;
        },

        // Método para limpiar datos
        clearData() {
            this.predimData = null;
            this.datosDimInput = {};
            this.datosResultados = {};
            this.datosCalculados = {};
            this.exportStatus = '';
            //console.log('🧹 Datos del componente Dibujo limpiados');
        },

        // Método para recargar datos desde el store
        reloadFromStore() {
            const systemState = Alpine.store('systemState');
            if (systemState?.dimensionamientoCompleto) {
                this.handleDimensionamientoData({
                    detail: {
                        resultados: systemState.resultadosDimensionamiento,
                        inputValues: systemState.inputValues || {},
                        predimData: systemState.predimData || {}
                    }
                });
                this.showNotification('success', 'Datos recargados desde el store');
            } else {
                this.showNotification('error', 'No hay datos disponibles en el store');
            }
        }
    };
};