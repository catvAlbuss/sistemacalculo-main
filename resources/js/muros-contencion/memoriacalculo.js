// memoriacalculo.js - Versión actualizada con sistema de contenido modular

import { CONTENT_STRUCTURE } from './word/content-structure.js';
import { ContentProcessor } from './word/content-processor.js';

export function memoriacalculo() {
    return {
        predimData: null,
        datosDimensionamiento: {},
        datosCargas: {},
        datosverificacion: {},
        datosconcretoA: {},
        datosdim: {
            proyecto: 'MEJORAMIENTO DE LOS SERVICIOS EDUCATIVOS EN LA INSTITUCIÓN EDUCATIVA DEL NIVEL SECUNDARIA',
            codigo: '32478',
            fecha: new Date().toISOString().split('T')[0],
            cliente: 'MUNICIPALIDAD DISTRITAL DE SINGA',
            ubicacion: 'SANTA ROSA DE PAMPAN, DISTRITO DE SINGA, PROVINCIA DE HUAMALÍES, DEPARTAMENTO DE HUÁNUCO',
            ingeniero: '-'
        },
        errors: [],
        uploadedImages: {
            logo: null,
            escudo: null,
            logoPrin: null,
            firma: null
        },
        messages: [],
        isComplete: true,

        // Nuevas propiedades para el sistema modular
        contentProcessor: null,
        calculationData: {},
        verificationResults: {},
        reinforcementData: {},

        init() {
            console.log('🔄 Inicializando módulo de Memoria de calculos...');
            this.initializeContentProcessor();
            this.configurarEventos();
            // Si hay datos en el store global al iniciar, los procesamos.
            const initialDimData = Alpine.store('systemState').resultadosDimensionamiento;
            if (Alpine.store('systemState').dimensionamientoCompleto && initialDimData) {
                this.handleDimensionamientoData({ detail: { resultados: initialDimData } });
            }
        },

        initializeContentProcessor() {
            // Inicializar el procesador de contenido con los datos actuales
            this.contentProcessor = new ContentProcessor(
                this.getStructuredData(),
                this.getCalculationMethods(),
                this.getVerificationMethods(),
                this.getReinforcementMethods()
            );
        },

        // Estructurar los datos para el procesador
        getStructuredData() {
            return {
                proyecto: {
                    nombre: this.datosdim.proyecto,
                    codigo: this.datosdim.codigo,
                    ubicacion: this.datosdim.ubicacion,
                    cliente: this.datosdim.cliente,
                    ingeniero: this.datosdim.ingeniero,
                    fecha: this.datosdim.fecha
                },
                geometria: {
                    altura: this.predimData?.inputValues.B21 || 3.15,
                    adm: this.predimData?.inputValues.B10 || 18.40,
                    punta: this.predimData?.inputValues.D45 || 0.25,
                    bpantalla: this.predimData?.inputValues.D47 || 10,
                    pzapata: this.predimData?.inputValues.D49 || 10,
                    azapata: this.predimData?.inputValues.D51 || 0.7,

                    ancho_base: this.predimData?.ancho_base || 2.1,
                    espesor_pantalla: this.predimData?.espesor_pantalla || 0.25,
                    altura_talon: this.predimData?.altura_talon || 0.4,
                    ancho_talon: this.predimData?.ancho_talon || 1.4,
                    ancho_punta: this.predimData?.ancho_punta || 0.45
                },
                materiales: {
                    yc: this.predimData?.inputValues.B6 || 2.4, // kg/cm²
                    ys: this.predimData?.inputValues.B11 || 1, // kg/cm²
                    fc: this.predimData?.inputValues.B8 || 210, // kg/cm²
                    fy: this.predimData?.inputValues.B7 || 4200, // kg/cm²
                    B12: this.predimData?.inputValues.B12 || 26.30, //TETA
                    B13: this.predimData?.inputValues.B13 || 26.30, //COHESION
                    B20: this.predimData?.inputValues.B20 || 12, //Angulo talud

                    //cargas
                    B98: this.datosDimensionamiento?.B98,
                    B99: this.datosDimensionamiento?.B99,
                    B100: this.datosDimensionamiento?.B100,
                    B101: this.datosDimensionamiento?.B101,
                },
                verificaciones: this.datosverificacion.datosCalculados,
                suelo: {
                    peso_especifico: this.datosCargas?.gamma_suelo || 1800, // kg/m³
                    angulo_friccion: this.datosCargas?.phi || 30, // grados
                    cohesion: this.datosCargas?.cohesion || 0, // kg/cm²
                    capacidad_portante: this.datosCargas?.capacidad_portante || 2.5 // kg/cm²
                },
                cargas: {
                    sobrecarga: this.datosCargas?.sobrecarga || 500, // kg/m²
                    sismo: {
                        zona: this.datosCargas?.zona_sismica || 3,
                        factor_amplificacion: this.datosCargas?.factor_amplificacion || 1.25,
                        coeficiente_horizontal: this.datosCargas?.kh || 0.18
                    }
                },
                // Datos calculados que se irán actualizando
                resultados: this.calculationData
            };
        },

        // Métodos de cálculo
        getCalculationMethods() {
            return {
                // Factor de seguridad al deslizamiento
                factorSeguridadDeslizamiento: () => {
                    const data = this.getStructuredData();
                    const mu = Math.tan(data.suelo.angulo_friccion * Math.PI / 180);
                    const W = this.calcularPesoTotal();
                    const Fh = this.calcularEmpujeHorizontal();
                    return (W * mu / Fh).toFixed(2);
                },

                // Factor de seguridad al volteo
                factorSeguridadVolteo: () => {
                    const Mr = this.calcularMomentoResistente();
                    const Mv = this.calcularMomentoVolteo();
                    return (Mr / Mv).toFixed(2);
                },

                // Factor de seguridad a la sustentación
                factorSeguridadSustentacion: () => {
                    const data = this.getStructuredData();
                    const esfuerzo_max = this.calcularEsfuerzoMaximo();
                    const capacidad = data.suelo.capacidad_portante * 10; // Convertir a kg/m²
                    return (capacidad / esfuerzo_max).toFixed(2);
                },

                // Empuje activo
                empujeActivo: () => {
                    const data = this.getStructuredData();
                    const Ka = this.calcularKa();
                    const gamma = data.suelo.peso_especifico;
                    const H = data.geometria.altura;
                    return (0.5 * gamma * H * H * Ka).toFixed(0);
                },

                // Peso del muro
                pesoMuro: () => {
                    return this.calcularPesoTotal().toFixed(0);
                },

                // Empuje sísmico
                empujeSismico: () => {
                    const data = this.getStructuredData();
                    const kh = data.cargas.sismo.coeficiente_horizontal;
                    const Pa = parseFloat(this.getCalculationMethods().empujeActivo());
                    return (Pa * kh).toFixed(0);
                },

                // Factor de seguridad sísmico
                factorSeguridadSismico: () => {
                    const fs_estatico = parseFloat(this.getCalculationMethods().factorSeguridadDeslizamiento());
                    return (fs_estatico * 0.75).toFixed(2); // Reducción por sismo
                },

                // Esfuerzo en la punta
                esfuerzoPunta: () => {
                    const data = this.getStructuredData();
                    const W = this.calcularPesoTotal();
                    const B = data.geometria.ancho_base;
                    const e = this.calcularExcentricidad();
                    return (W / B * (1 + 6 * e / B)).toFixed(0);
                },

                // Esfuerzo en el talón
                esfuerzoTalon: () => {
                    const data = this.getStructuredData();
                    const W = this.calcularPesoTotal();
                    const B = data.geometria.ancho_base;
                    const e = this.calcularExcentricidad();
                    return (W / B * (1 - 6 * e / B)).toFixed(0);
                }
            };
        },

        // Métodos de verificación
        getVerificationMethods() {
            return {
                estadoDeslizamiento: () => {
                    const fs = parseFloat(this.getCalculationMethods().factorSeguridadDeslizamiento());
                    return fs >= 1.5 ? "CUMPLE" : "NO CUMPLE";
                },

                estadoVolteo: () => {
                    const fs = parseFloat(this.getCalculationMethods().factorSeguridadVolteo());
                    return fs >= 1.5 ? "CUMPLE" : "NO CUMPLE";
                },

                estadoSustentacion: () => {
                    const fs = parseFloat(this.getCalculationMethods().factorSeguridadSustentacion());
                    return fs >= 1.0 ? "CUMPLE" : "NO CUMPLE";
                }
            };
        },

        // Métodos de refuerzo
        getReinforcementMethods() {
            return {
                // Acero horizontal pantalla
                aceroHorizontal: () => {
                    const data = this.getStructuredData();
                    const Mu = this.calcularMomentoFlexion();
                    const b = 100; // cm (ancho unitario)
                    const d = data.geometria.espesor_pantalla * 100 - 5; // cm
                    const fc = data.materiales.fc;
                    const fy = data.materiales.fy;

                    // Fórmula simplificada
                    const As = Mu * 100000 / (0.9 * fy * 0.9 * d);
                    return As.toFixed(2);
                },

                // Acero vertical pantalla
                aceroVertical: () => {
                    const data = this.getStructuredData();
                    const As_temp = 0.002 * data.geometria.espesor_pantalla * 100 * 100; // As temp
                    return As_temp.toFixed(2);
                },

                // Acero mínimo horizontal
                aceroMinimoHorizontal: () => {
                    const data = this.getStructuredData();
                    const As_min = 0.0018 * data.geometria.espesor_pantalla * 100 * 100;
                    return As_min.toFixed(2);
                },

                // Acero mínimo vertical
                aceroMinimoVertical: () => {
                    const data = this.getStructuredData();
                    const As_min = 0.0012 * data.geometria.espesor_pantalla * 100 * 100;
                    return As_min.toFixed(2);
                },

                // Acero adoptado horizontal
                aceroAdoptadoHorizontal: () => {
                    const As_calc = parseFloat(this.getReinforcementMethods().aceroHorizontal());
                    const As_min = parseFloat(this.getReinforcementMethods().aceroMinimoHorizontal());
                    return Math.max(As_calc, As_min).toFixed(2);
                },

                // Acero adoptado vertical
                aceroAdoptadoVertical: () => {
                    const As_calc = parseFloat(this.getReinforcementMethods().aceroVertical());
                    const As_min = parseFloat(this.getReinforcementMethods().aceroMinimoVertical());
                    return Math.max(As_calc, As_min).toFixed(2);
                },

                // Distribución de barras
                diametroInterior: () => "12mm",
                separacionInterior: () => "25cm",
                longitudInterior: () => {
                    const data = this.getStructuredData();
                    return `${(data.geometria.altura * 100).toFixed(0)}cm`;
                },

                diametroExterior: () => "10mm",
                separacionExterior: () => "30cm",
                longitudExterior: () => {
                    const data = this.getStructuredData();
                    return `${(data.geometria.altura * 100).toFixed(0)}cm`;
                }
            };
        },

        // Métodos de cálculo auxiliares
        calcularKa() {
            const data = this.getStructuredData();
            const phi = data.suelo.angulo_friccion * Math.PI / 180;
            return Math.tan(Math.PI / 4 - phi / 2) ** 2;
        },

        calcularPesoTotal() {
            const data = this.getStructuredData();
            const gamma_c = data.materiales.gamma_concreto;

            // Peso pantalla
            const V_pantalla = data.geometria.altura * data.geometria.espesor_pantalla * 1;
            const W_pantalla = V_pantalla * gamma_c;

            // Peso base
            const V_base = data.geometria.ancho_base * data.geometria.altura_talon * 1;
            const W_base = V_base * gamma_c;

            // Peso del suelo sobre el talón
            const V_suelo = data.geometria.ancho_talon * (data.geometria.altura - data.geometria.altura_talon) * 1;
            const W_suelo = V_suelo * data.suelo.peso_especifico;

            return W_pantalla + W_base + W_suelo;
        },

        calcularEmpujeHorizontal() {
            const data = this.getStructuredData();
            const Ka = this.calcularKa();
            const gamma = data.suelo.peso_especifico;
            const H = data.geometria.altura;
            const q = data.cargas.sobrecarga;

            // Empuje del suelo
            const Pa_suelo = 0.5 * gamma * H * H * Ka;

            // Empuje de la sobrecarga
            const Pa_sobrecarga = q * H * Ka;

            return Pa_suelo + Pa_sobrecarga;
        },

        calcularMomentoResistente() {
            const data = this.getStructuredData();
            const gamma_c = data.materiales.gamma_concreto;

            // Momentos resistentes (respecto al punto de volteo - punta)
            let Mr = 0;

            // Momento del peso de la pantalla
            const W_pantalla = data.geometria.altura * data.geometria.espesor_pantalla * gamma_c;
            Mr += W_pantalla * (data.geometria.espesor_pantalla / 2 + data.geometria.ancho_punta);

            // Momento del peso de la base
            const W_base = data.geometria.ancho_base * data.geometria.altura_talon * gamma_c;
            Mr += W_base * (data.geometria.ancho_base / 2);

            // Momento del peso del suelo
            const W_suelo = data.geometria.ancho_talon * (data.geometria.altura - data.geometria.altura_talon) * data.suelo.peso_especifico;
            Mr += W_suelo * (data.geometria.ancho_punta + data.geometria.espesor_pantalla + data.geometria.ancho_talon / 2);

            return Mr;
        },

        calcularMomentoVolteo() {
            const Fh = this.calcularEmpujeHorizontal();
            const data = this.getStructuredData();
            const H = data.geometria.altura;

            // Momento de volteo (empuje horizontal * brazo de palanca)
            return Fh * (H / 3); // Asumiendo distribución triangular
        },

        calcularExcentricidad() {
            const data = this.getStructuredData();
            const Mr = this.calcularMomentoResistente();
            const Mv = this.calcularMomentoVolteo();
            const W = this.calcularPesoTotal();
            const B = data.geometria.ancho_base;

            return Math.abs((B / 2) - ((Mr - Mv) / W));
        },

        calcularEsfuerzoMaximo() {
            const data = this.getStructuredData();
            const W = this.calcularPesoTotal();
            const B = data.geometria.ancho_base;
            const e = this.calcularExcentricidad();

            return W / B * (1 + 6 * e / B);
        },

        calcularMomentoFlexion() {
            const data = this.getStructuredData();
            const Pa = this.calcularEmpujeHorizontal();
            const H = data.geometria.altura;

            // Momento máximo en la base de la pantalla
            return Pa * H / 6; // Simplificado
        },

        configurarEventos() {
            document.addEventListener('dimensionamiento-calculated', (event) => this.handleDimensionamientoData(event));
            document.addEventListener('cargas-updated', (event) => this.handlecargasData(event));
            document.addEventListener('verificaciones-updated', (event) => this.handleVerificacionesData(event));
        },

        handleDimensionamientoData(event) {
            if (!event.detail || !event.detail.resultados) {
                console.error('❌ Evento "dimensionamiento-calculated" no contiene resultados.');
                return;
            }

            try {
                if (!event.detail) {
                    console.warn('No se recibieron datos del dimensionamiento');
                    return;
                }

                this.datosCargas = event.detail.inputValues || {};
                this.datosDimensionamiento = event.detail.resultados || {};
                this.predimData = event.detail.predimData || {};
                this.datosCalculados = {};

                console.log('Datos cargados:', {
                    dim: this.datosCargas,
                    datosDimensionamiento: this.datosDimensionamiento,
                    predim: this.predimData.inputValues
                });

                // Actualizar el procesador de contenido con los nuevos datos
                this.updateContentProcessor();
                this.calcularVerificaciones();
            } catch (error) {
                console.error('Error procesando datos del dimensionamiento:', error);
                this.addError('procesamiento_datos', 'Error procesando datos del dimensionamiento: ' + error.message);
            }
        },

        handlecargasData(event) {
            if (event.detail) {
                this.datosCargas = { ...this.datosCargas, ...event.detail };
                this.updateContentProcessor();
            }
        },

        handleVerificacionesData(event) {
            if (event.detail) {
                this.datosverificacion = { ...this.datosverificacion, ...event.detail };
                this.updateContentProcessor();
            }
        },

        updateContentProcessor() {
            if (this.contentProcessor) {
                this.contentProcessor.updateData(this.getStructuredData());
                this.contentProcessor.updateCalculations(this.getCalculationMethods());
                this.contentProcessor.updateVerifications(this.getVerificationMethods());
                this.contentProcessor.updateReinforcement(this.getReinforcementMethods());
            }
        },

        calcularVerificaciones() {
            // Ejecutar todos los cálculos y almacenar resultados
            const calculations = this.getCalculationMethods();
            const verifications = this.getVerificationMethods();
            const reinforcement = this.getReinforcementMethods();

            this.calculationData = {
                fs_deslizamiento: calculations.factorSeguridadDeslizamiento(),
                fs_volteo: calculations.factorSeguridadVolteo(),
                fs_sustentacion: calculations.factorSeguridadSustentacion(),
                empuje_activo: calculations.empujeActivo(),
                peso_muro: calculations.pesoMuro(),
                empuje_sismico: calculations.empujeSismico(),
                fs_sismico: calculations.factorSeguridadSismico(),
                esfuerzo_punta: calculations.esfuerzoPunta(),
                esfuerzo_talon: calculations.esfuerzoTalon()
            };

            this.verificationResults = {
                estado_deslizamiento: verifications.estadoDeslizamiento(),
                estado_volteo: verifications.estadoVolteo(),
                estado_sustentacion: verifications.estadoSustentacion()
            };

            this.reinforcementData = {
                pantalla: {
                    as_horizontal: reinforcement.aceroHorizontal(),
                    as_vertical: reinforcement.aceroVertical(),
                    as_min_h: reinforcement.aceroMinimoHorizontal(),
                    as_min_v: reinforcement.aceroMinimoVertical(),
                    as_adopt_h: reinforcement.aceroAdoptadoHorizontal(),
                    as_adopt_v: reinforcement.aceroAdoptadoVertical(),
                    diam_int: reinforcement.diametroInterior(),
                    sep_int: reinforcement.separacionInterior(),
                    long_int: reinforcement.longitudInterior(),
                    diam_ext: reinforcement.diametroExterior(),
                    sep_ext: reinforcement.separacionExterior(),
                    long_ext: reinforcement.longitudExterior()
                },
                punta: {
                    // Similar structure for punta
                    as_horizontal: (parseFloat(reinforcement.aceroHorizontal()) * 0.7).toFixed(2),
                    as_vertical: (parseFloat(reinforcement.aceroVertical()) * 0.8).toFixed(2),
                    as_min_h: reinforcement.aceroMinimoHorizontal(),
                    as_min_v: reinforcement.aceroMinimoVertical(),
                    as_adopt_h: reinforcement.aceroAdoptadoHorizontal(),
                    as_adopt_v: reinforcement.aceroAdoptadoVertical(),
                    diam_int: "10mm",
                    sep_int: "30cm",
                    long_int: `${(this.getStructuredData().geometria.ancho_punta * 100).toFixed(0)}cm`,
                    diam_ext: "8mm",
                    sep_ext: "35cm",
                    long_ext: `${(this.getStructuredData().geometria.ancho_punta * 100).toFixed(0)}cm`
                },
                talon: {
                    // Similar structure for talon
                    as_horizontal: (parseFloat(reinforcement.aceroHorizontal()) * 0.6).toFixed(2),
                    as_vertical: (parseFloat(reinforcement.aceroVertical()) * 0.9).toFixed(2),
                    as_min_h: reinforcement.aceroMinimoHorizontal(),
                    as_min_v: reinforcement.aceroMinimoVertical(),
                    as_adopt_h: reinforcement.aceroAdoptadoHorizontal(),
                    as_adopt_v: reinforcement.aceroAdoptadoVertical(),
                    diam_int: "12mm",
                    sep_int: "25cm",
                    long_int: `${(this.getStructuredData().geometria.ancho_talon * 100).toFixed(0)}cm`,
                    diam_ext: "10mm",
                    sep_ext: "30cm",
                    long_ext: `${(this.getStructuredData().geometria.ancho_talon * 100).toFixed(0)}cm`
                }
            };

            console.log('Verificaciones calculadas:', this.calculationData);
        },

        previewImage(input, previewId, inputId) {
            const previewContainer = document.getElementById(previewId);
            const loadingDiv = document.getElementById(inputId + '-loading');

            if (input.files && input.files[0]) {
                const file = input.files[0];

                // Validar tamaño de archivo (5MB máximo)
                if (file.size > 5 * 1024 * 1024) {
                    this.addError('file_size', 'El archivo excede el tamaño máximo de 5MB');
                    return;
                }

                const reader = new FileReader();
                loadingDiv.classList.remove('hidden');
                previewContainer.innerHTML = '';

                const minLoadTime = 800;
                const startTime = Date.now();

                reader.onload = (e) => {
                    const loadTime = Date.now() - startTime;
                    const delay = Math.max(0, minLoadTime - loadTime);

                    setTimeout(() => {
                        loadingDiv.classList.add('hidden');

                        // Almacenar la imagen
                        const imageKey = inputId.replace('File', '');
                        this.uploadedImages[imageKey] = e.target.result;

                        // Crear preview mejorado
                        const previewWrapper = document.createElement('div');
                        previewWrapper.className = 'bg-white rounded-xl p-4 border border-gray-200 shadow-sm';

                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'w-full h-24 object-contain rounded-lg preview-image';

                        const fileInfo = document.createElement('div');
                        fileInfo.className = 'mt-3 text-xs text-gray-500 flex justify-between items-center';
                        fileInfo.innerHTML = `
                                    <span>${file.name}</span>
                                    <span>${(file.size / 1024).toFixed(1)} KB</span>
                                `;

                        const removeButton = document.createElement('button');
                        removeButton.className = 'mt-2 w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors duration-200';
                        removeButton.innerHTML = '<i class="fas fa-trash mr-2"></i>Eliminar';
                        removeButton.addEventListener('click', () => {
                            input.value = '';
                            previewContainer.innerHTML = '';
                            this.uploadedImages[imageKey] = null;
                        });

                        previewWrapper.appendChild(img);
                        previewWrapper.appendChild(fileInfo);
                        previewWrapper.appendChild(removeButton);
                        previewContainer.appendChild(previewWrapper);

                        // Mostrar notificación de éxito
                        this.showSuccess('Imagen cargada correctamente');
                    }, delay);
                };

                reader.readAsDataURL(file);
            } else {
                previewContainer.innerHTML = '';
                loadingDiv.classList.add('hidden');
            }
        },

        exportData() {
            if (!this.isComplete) {
                this.addError('incomplete_data', 'Complete todos los campos requeridos antes de exportar');
                return;
            }

            // Utilizar el nuevo sistema de generación de documentos
            //this.generateDocumentWithContentProcessor();
            this.exportWithGraphicsReady();
        },

        async exportWithGraphicsReady() {
            try {
                console.log('🔄 Iniciando exportación con verificación de gráficos...');

                // 1. Verificar que ECharts esté disponible
                if (typeof window.echarts === 'undefined') {
                    this.addError('echarts_error', 'ECharts no está disponible. Verifique que la biblioteca esté cargada.');
                    return;
                }

                // 2. Verificar que el elemento del gráfico exista
                const graphElement = document.getElementById('grafico-verificaciones');
                if (!graphElement) {
                    console.warn('Elemento grafico-verificaciones no encontrado, continuando sin gráfico...');
                } else {
                    console.log('✅ Elemento gráfico encontrado, preparando...');

                    // 3. Asegurar que el gráfico esté visible y renderizado
                    graphElement.style.display = 'block';
                    graphElement.style.visibility = 'visible';
                    graphElement.style.opacity = '1';

                    // 4. Buscar instancia de ECharts
                    const echartsInstance = window.echarts.getInstanceByDom(graphElement);
                    if (echartsInstance && !echartsInstance.isDisposed()) {
                        console.log('✅ Instancia ECharts encontrada, forzando renderizado...');

                        try {
                            // Forzar redimensionado y renderizado
                            echartsInstance.resize();

                            // Esperar a que termine el renderizado
                            await new Promise(resolve => {
                                setTimeout(() => {
                                    console.log('✅ Renderizado completado');
                                    resolve();
                                }, 1000);
                            });
                        } catch (renderError) {
                            console.warn('Error en renderizado ECharts:', renderError);
                            // Continuar con la exportación
                        }
                    } else {
                        console.log('No se encontró instancia ECharts válida');
                    }
                }

                // Preparar todos los elementos para captura
                await this.prepareElementsForCapture();

                // 5. Proceder con la generación del documento
                await this.generateDocumentWithContentProcessor();

            } catch (error) {
                console.error('Error en exportWithGraphicsReady:', error);
                this.addError('export_error', `Error en la exportación: ${error.message}`);
            }
        },

        async generateDocumentWithContentProcessor() {
            try {
                if (typeof docx === 'undefined') {
                    this.addError('library_error', 'Error: La biblioteca docx no se ha cargado correctamente');
                    return false;
                }

                console.log('🔄 Iniciando generación con sistema modular...');

                // Configurar el procesador con la biblioteca docx
                this.contentProcessor.setDocxLibrary(docx);

                // Procesar todo el contenido (el ContentProcessor maneja la captura de gráficos internamente)
                console.log('📄 Procesando contenido del documento...');
                const processedContent = await this.contentProcessor.processContent(CONTENT_STRUCTURE);

                // Generar el documento completo
                console.log('📝 Generando documento final...');
                const result = await this.generateCompleteDocument(processedContent);

                if (result) {
                    this.showSuccess('✅ Documento exportado correctamente');
                    console.log('🎉 Exportación completada exitosamente');
                } else {
                    this.addError('generation_error', 'Error al generar el documento');
                }

                return result;
            } catch (error) {
                console.error('❌ Error en generateDocumentWithContentProcessor:', error);
                this.addError('generation_error', `Error: ${error.message}`);
                return false;
            }
        },

        async generateCompleteDocument(processedContent) {
            try {
                const { Document, Paragraph, TextRun, Header, Footer, AlignmentType,
                    PageNumber, BorderStyle, SectionType, Table, TableRow, TableCell,
                    WidthType, ImageRun, UnderlineType, Packer, TabStopType,
                    LineRuleType, HeightRule, VerticalAlign } = docx;

                const nombreArchivoBase = "Memoria_Calculo_Muros_Contencion";

                // Obtener archivos de imagen
                const logoFile = document.getElementById('logoFile').files[0];
                const escudoFile = document.getElementById('escudoFile').files[0];
                const principalFile = document.getElementById('logoPrinFile').files[0];
                const planoFile = document.getElementById('logoPlanFile').files[0];
                const firmaFile = document.getElementById('firmaFile').files[0];

                // Procesar imágenes
                let logoDataUrl = null;
                let escudoDataUrl = null;
                let principalDataUrl = null;
                let planosDataUrl = null;
                let firmaDataUrl = null;

                if (logoFile) logoDataUrl = await this.readFileAsDataURL(logoFile);
                if (escudoFile) escudoDataUrl = await this.readFileAsDataURL(escudoFile);
                if (principalFile) principalDataUrl = await this.readFileAsDataURL(principalFile);
                if (planoFile) planosDataUrl = await this.readFileAsDataURL(planoFile);
                if (firmaFile) firmaDataUrl = await this.readFileAsDataURL(firmaFile);

                // Crear ImageRuns
                const logoImageRun = logoDataUrl ? new ImageRun({
                    data: logoDataUrl,
                    transformation: { width: 70, height: 70 },
                }) : null;

                const escudoImageRun = escudoDataUrl ? new ImageRun({
                    data: escudoDataUrl,
                    transformation: { width: 70, height: 70 },
                }) : null;

                const firmaImageRun = firmaDataUrl ? new ImageRun({
                    data: firmaDataUrl,
                    transformation: { width: 70, height: 70 },
                }) : null;

                // Crear header y footer
                const header = this.createDocumentHeader(logoImageRun, escudoImageRun);
                const footer = this.createDocumentFooter(firmaImageRun);

                // Crear secciones del documento
                const documentSections = [];

                // Sección 1: Portada
                const coverPageContent = await this.generateCoverPage(nombreArchivoBase, principalDataUrl, planosDataUrl);
                documentSections.push({
                    properties: this.getPageProperties(),
                    headers: { default: header },
                    footers: { default: footer },
                    children: coverPageContent
                });

                // Sección 2: Tabla de contenido
                documentSections.push({
                    properties: { ...this.getPageProperties(), type: SectionType.NEW_PAGE },
                    headers: { default: header },
                    footers: { default: footer },
                    children: this.generateTableOfContents()
                });

                // Sección 3: Contenido principal
                documentSections.push({
                    properties: { ...this.getPageProperties(), type: SectionType.CONTINUOUS },
                    headers: { default: header },
                    footers: { default: footer },
                    children: processedContent
                });

                // Crear documento
                const doc = new Document({
                    styles: this.getDocumentStyles(),
                    sections: documentSections
                });

                console.log('Documento creado, iniciando exportación...');

                // Exportar documento
                const blob = await Packer.toBlob(doc);
                saveAs(blob, `${nombreArchivoBase}_${new Date().toISOString().split('T')[0]}.docx`);

                console.log('Documento exportado exitosamente');
                return true;

            } catch (error) {
                console.error("Error al generar el documento completo:", error);
                throw error;
            }
        },

        // Agregar este método en el objeto que retorna memoriacalculo()
        async prepareElementsForCapture() {
            try {
                console.log('🔄 Preparando elementos para captura...');

                // Lista de elementos a preparar
                const elementsToCapture = [
                    { id: 'content-pantalla', type: 'alpine' },
                    { id: 'grafico-verificaciones', type: 'echarts' }
                ];

                for (const elementInfo of elementsToCapture) {
                    const element = document.getElementById(elementInfo.id);
                    if (element) {
                        console.log(`📋 Preparando ${elementInfo.id}...`);

                        if (elementInfo.type === 'alpine') {
                            // Preparar componente Alpine.js
                            await window.prepareElementForCapture(element);
                            await window.expandAlpineComponent(element);
                        } else if (elementInfo.type === 'echarts') {
                            // Preparar gráfico ECharts
                            await this.prepareEChartsElement(element);
                        }

                        console.log(`✅ ${elementInfo.id} preparado`);
                    } else {
                        console.warn(`⚠️ Elemento ${elementInfo.id} no encontrado`);
                    }
                }

                // Esperar renderizado final
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log('✅ Todos los elementos preparados');

            } catch (error) {
                console.warn('⚠️ Error preparando elementos:', error);
            }
        },

        // Agregar método específico para ECharts
        async prepareEChartsElement(element) {
            try {
                element.style.display = 'block';
                element.style.visibility = 'visible';
                element.style.opacity = '1';

                const echartsInstance = window.echarts?.getInstanceByDom?.(element);
                if (echartsInstance && !echartsInstance.isDisposed()) {
                    console.log('🎨 Preparando ECharts...');
                    echartsInstance.resize();
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                console.warn('Error preparando ECharts:', error);
            }
        },

        async prepareGraphicsForCapture(id) {
            return new Promise((resolve) => {
                requestAnimationFrame(async () => {
                    const graphElement = document.getElementById(id);
                    if (!graphElement) {
                        console.error(`Elemento con id ${id} no encontrado`);
                        return resolve(false);
                    }
                    graphElement.style.display = 'block';
                    await new Promise(r => setTimeout(r, 500));
                    resolve(true);
                });
            });
        },

        createDocumentHeader(logoImageRun, escudoImageRun) {
            const { Header, Table, TableRow, TableCell, Paragraph, TextRun,
                WidthType, BorderStyle, AlignmentType } = docx;

            return new Header({
                children: [
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        children: [new Paragraph({
                                            alignment: AlignmentType.LEFT,
                                            children: logoImageRun ? [logoImageRun] : [new TextRun("")]
                                        })],
                                        borders: {
                                            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                                            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }
                                        }
                                    }),
                                    new TableCell({
                                        width: { size: 70, type: WidthType.PERCENTAGE },
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [new TextRun({
                                                    text: this.datosdim.proyecto,
                                                    bold: true, size: 16, color: "#000000", font: "Arial"
                                                })]
                                            }),
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [new TextRun({
                                                    text: this.datosdim.codigo,
                                                    bold: true, size: 16, color: "#000000", font: "Arial"
                                                })]
                                            }),
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [new TextRun({
                                                    text: this.datosdim.cliente,
                                                    bold: true, size: 16, color: "#000000", font: "Arial"
                                                })]
                                            })
                                        ],
                                        borders: {
                                            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                                            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }
                                        }
                                    }),
                                    new TableCell({
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        children: [new Paragraph({
                                            alignment: AlignmentType.RIGHT,
                                            children: escudoImageRun ? [escudoImageRun] : [new TextRun("")]
                                        })],
                                        borders: {
                                            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                                            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }
                                        }
                                    })
                                ]
                            })
                        ]
                    }),
                    new Paragraph({
                        border: { bottom: { color: "#000000", space: 1, style: BorderStyle.SINGLE, size: 1 } },
                        children: [new TextRun("")]
                    })
                ]
            });
        },

        createDocumentFooter(firmaImageRun) {
            const { Footer, Paragraph, TextRun, AlignmentType, PageNumber } = docx;

            return new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: firmaImageRun ? [firmaImageRun] : []
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({ text: "Página ", bold: true, color: "#000000", font: "Arial" }),
                            new TextRun({ children: [PageNumber.CURRENT], bold: true, color: "#000000", font: "Arial" }),
                            new TextRun({ text: " | ", bold: true, color: "#000000", font: "Arial" }),
                            new TextRun({ children: [PageNumber.TOTAL_PAGES], bold: true, color: "#000000", font: "Arial" })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({
                            text: this.datosdim.cliente,
                            bold: true, color: "#000000", font: "Arial"
                        })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({
                            text: this.datosdim.ubicacion,
                            color: "#000000", font: "Arial"
                        })]
                    })
                ]
            });
        },

        getPageProperties() {
            const { SectionType } = docx;
            return {
                type: SectionType.NEW_PAGE,
                page: {
                    size: { width: 8.5 * 1440, height: 11 * 1440 },
                    margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
                }
            };
        },

        getDocumentStyles() {
            const { HeadingLevel } = docx;
            return {
                default: {
                    document: {
                        run: { font: "Arial", color: "#000000", size: 24 }
                    },
                    paragraph: { spacing: { line: 276 } }
                },
                paragraphStyles: [
                    {
                        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                        run: { font: "Arial", size: 36, bold: true, color: "#000000" },
                        paragraph: { spacing: { before: 240, after: 120 } }
                    },
                    {
                        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                        run: { font: "Arial", size: 30, bold: true, color: "#000000" },
                        paragraph: { spacing: { before: 240, after: 120 } }
                    },
                    {
                        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
                        run: { font: "Arial", size: 26, bold: true, color: "#000000" },
                        paragraph: { spacing: { before: 240, after: 120 } }
                    }
                ]
            };
        },

        async generateCoverPage(sectionName, principalDataUrl, planosDataUrl) {
            // Reutilizar la función existente pero adaptada
            return await this.generateCoverPageContent(sectionName, principalDataUrl, planosDataUrl);
        },

        generateTableOfContents() {
            const { Paragraph, TextRun, AlignmentType, HeadingLevel, TableOfContents } = docx;

            return [
                new Paragraph({
                    children: [new TextRun({
                        text: "TABLA DE CONTENIDO",
                        bold: true, font: "Arial", size: 24, color: "#000000"
                    })],
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 1000 }
                }),
                new TableOfContents("Tabla de Contenido", {
                    hyperlink: true,
                    headingStyleRange: "1-5",
                    size: 24,
                    color: "#000000"
                })
            ];
        },

        async generateCoverPageContent(sectionName, principalDataUrl, planosDataUrl) {
            const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
                BorderStyle, AlignmentType, UnderlineType, ImageRun,
                TabStopType, LineRuleType, HeightRule, VerticalAlign } = docx;

            const sections = [];

            // Título con subrayado
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${sectionName.toUpperCase()}`,
                            bold: true,
                            size: 44,
                            font: "Arial",
                            color: "#000000",
                            underline: {
                                type: UnderlineType.SINGLE,
                            },
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        after: 100,
                    },
                })
            );

            // Primera imagen técnica (diagrama del muro)
            if (principalDataUrl) {
                sections.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: principalDataUrl,
                                transformation: {
                                    width: 185, // Tamaño más grande para mejor visualización
                                    height: 255,
                                },
                            }),
                        ],
                        spacing: {
                            after: 200,
                        },
                    })
                );
            }

            // Información del proyecto
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "PROYECTO:",
                            bold: true,
                            font: "Arial",
                            size: 24,
                            color: "#000000",
                        }),
                        new TextRun({
                            text: "\t",
                            font: "Arial",
                            size: 24,
                        }),
                        new TextRun({
                            text: this.datosdim.proyecto + " " + this.datosdim.codigo + " " + this.datosdim.ubicacion,
                            font: "Arial",
                            size: 24,
                            color: "#000000",
                        }),
                    ],
                    tabStops: [
                        {
                            type: TabStopType.LEFT,
                            position: 1440,
                        },
                    ],
                    spacing: {
                        after: 300,
                        line: 345, // Ajustar el line spacing a 1.15
                        lineRule: LineRuleType.EXACT, // Usar line spacing exacto
                    },
                    style: {
                        font: {
                            name: "Arial",
                            size: 12, // Cambiar el tamaño de fuente a 12
                        },
                    },
                    alignment: AlignmentType.JUSTIFIED,
                })
            );

            // Primera imagen técnica (diagrama del muro)
            if (planosDataUrl) {
                sections.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: planosDataUrl,
                                transformation: {
                                    width: 325, // Tamaño más grande para mejor visualización
                                    height: 255,
                                },
                            }),
                        ],
                        spacing: {
                            after: 200,
                        },
                    })
                );
            }

            //sections.push(coverTable);
            return sections;
        },

        // Métodos auxiliares existentes
        async readFileAsDataURL(file) {
            return new Promise((resolve, reject) => {
                if (!file) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        },

        previewReport() {
            this.showSuccess('Generando vista previa...');
        },

        addError(id, message) {
            const existingError = this.errors.find(error => error.id === id);
            if (!existingError) {
                this.errors.push({ id, message });
            }
        },

        showSuccess(message) {
            console.log('✅ ' + message);
        },

        // Getters existentes
        get hasErrors() {
            return this.errors.length > 0;
        },

        get hasImages() {
            return Object.values(this.uploadedImages).some(img => img !== null);
        },

        get hasCalculations() {
            return Object.keys(this.calculationData).length > 0;
        },

        get completionPercentage() {
            let completed = 0;
            let total = 4;

            if (this.datosdim.proyecto) completed++;
            if (this.hasImages) completed++;
            if (this.hasCalculations) completed++;
            if (this.datosdim.ingeniero) completed++;

            return Math.round((completed / total) * 100);
        },

        get isComplete() {
            return this.completionPercentage === 100;
        }
    }
}