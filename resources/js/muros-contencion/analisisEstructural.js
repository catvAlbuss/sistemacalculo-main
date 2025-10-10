// analisisEstructural.js
import { ValidationManager } from './utils/validation.js';
import { NotificationManager } from './utils/notifications.js';
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

        // Estado de la interfaz
        activeElement: 'pantalla',
        showDetails: false,
        isCalculating: false,

        // Inicialización del componente
        init() {
            //console.log('🏗️ Análisis Estructural inicializado');
            this.validarDatos();
        },

        // Métodos de validación
        validarEntrada(valor, campo) {
            if (!ValidationManager.isNumeric(valor)) {
                NotificationManager.showError(`${campo} debe ser un número válido`);
                return false;
            }
            return true;
        },

        // Actualizar datos de un elemento específico
        actualizarDato(elemento, campo, valor) {
            if (this.validarEntrada(valor, campo)) {
                this[elemento].datos[campo] = parseFloat(valor) || 0;
                this.calcular(elemento);
                NotificationManager.showSuccess(`${campo} actualizado`);
                return true;
            }
            return false;
        },

        // Calcular resultados para cada elemento
        calcular(elemento) {
            this.isCalculating = true;

            try {
                switch (elemento) {
                    case 'pantalla':
                        this.calcularPantalla();
                        break;
                    case 'punta':
                        this.calcularPunta();
                        break;
                    case 'talon':
                        this.calcularTalon();
                        break;
                    case 'key':
                        this.calcularKey();
                        break;
                }
            } catch (error) {
                console.error(`Error calculando ${elemento}:`, error);
                NotificationManager.showError(`Error en cálculos de ${elemento}`);
            } finally {
                this.isCalculating = false;
            }
        },

        calcularPantalla() {
            // --- Utilidades tipo Excel ---
            const ABS = Math.abs;
            const SUMA = (...nums) => nums.reduce((acc, n) => acc + (n || 0), 0);
            const SI = (cond, valSi, valNo) => cond ? valSi : valNo;

            // --- Constantes mapeadas desde Excel ---
            const AQ279 = 0.16; // q1 SIN SISMO
            const AQ280 = 5.03; // q2 SIN SISMO
            const AR279 = 1.31; // q1 CON SISMO
            const AR280 = 5.03; // q2 CON SISMO
            const B280 = 0;
            const C163 = 5.84;
            // Geometría / propiedades
            const I230 = 6.65;
            const E306 = 0.3;
            const B349 = 4;

            // Variables de referencia
            const O229 = 2.39;

            // --- Cálculos de máximos ---
            const AS279 = Math.max(AQ279, AR279);
            const AS280 = Math.max(AQ280, AR280);

            // --- Selección según H236 ---
            const H236 = "CON SISMO"; // futuro: tomar de datos
            const clave = { "SIN SISMO": "sin", "CON SISMO": "con", "MAXIMO": "max" }[H236] || "max";

            const buscarH = (q) => {
                const tabla = {
                    q1: { sin: AQ279, con: AR279, max: AS279 },
                    q2: { sin: AQ280, con: AR280, max: AS280 }
                };
                return tabla[q][clave];
            };

            // --- Valores seleccionados ---
            const AT279 = buscarH("q1"); // q1 final
            const AT280 = buscarH("q2"); // q2 final

            // --- Diferencias y derivados ---
            const E280 = AT280 - AT279;
            const E281 = (B280 * E280) / I230; // 
            const E282 = E280 - E281;

            // --- Cálculos estructurales ---
            const B286 = AT279 * (E306 - I230);
            const C286 = (E282 * E306) + (E281 * E306 / 2) - (E280 * I230 / 2);
            const D286 = ABS(SUMA(B286, C286));
            const E286 = SI(H236 === "SIN SISMO", 0, O229);

            const B287 = AT279 * ((I230 ** 2) / 2);
            const C287 = (E282 * 0 / 2) + (E281 * 0 / 3) - (E280 * I230 * 0 / 2) + (E280 * (I230 ** 2) / 6);
            const D287 = SUMA(B287, C287);
            const E287 = SI(H236 === "SIN SISMO", 0, C163 - E286 * B280);

            const B288 = AT279 * (B349 * B349 + I230 * I230 - 2 * I230 * B349) / 2;
            const C288 = (E282 * B349 * B349 / 2) + (E281 * B349 * B349 / 3) - (E280 * I230 * B349 / 2) + E280 * I230 * I230 / 6;
            const D288 = SUMA(B288, C288);
            const E288 = SI(H236 === "SIN SISMO", 0, C163 - E286 * B349);

            const B290 = (1.7 * D287) + E287;
            const B291 = (1.7 * D286) + E286;

            // --- Guardar ---
            this.pantalla.resultados = this.pantalla.resultados || {};
            Object.assign(this.pantalla.resultados, {
                AT279, AT280, E280, E281, E282,
                B286, C286, D286, E286,
                B287, C287, D287, E287,
                B288, C288, D288, E288,
                B290, B291
            });
        },

        calcularPunta() {
            const ABS = Math.abs;
            const SUMA = (...nums) => nums.reduce((acc, n) => acc + (n || 0), 0);
            const SI = (cond, valSi, valNo) => cond ? valSi : valNo;

            const res = this.punta.resultados;

            // --- Constantes mapeadas desde Excel ---
            const AQ282 = 3.24;  // peso propio
            const AQ283 = 13.50; // q1 SIN SISMO
            const AQ284 = 16.51; // q2 SIN SISMO

            const AR282 = 3.24;  // peso propio
            const AR283 = 13.89; // q1 CON SISMO
            const AR284 = 17.59; // q2 CON SISMO

            const As282 = Math.max(AQ282, AR282); // peso propio
            const As283 = Math.max(AQ283, AR283); // q1
            const As284 = Math.max(AQ284, AR284); // q2

            // --- Selección según H236 ---
            const H236 = "CON SISMO"; // futuro: tomar de datos
            const clave = { "SIN SISMO": "sin", "CON SISMO": "con", "MAXIMO": "max" }[H236] || "max";

            const buscarH = (q) => {
                const tabla = {
                    pesoPropio: { sin: AQ282, con: AR282, max: As282 },
                    q1: { sin: AQ283, con: AR283, max: As283 },
                    q2: { sin: AQ284, con: AR284, max: As284 }
                };
                return tabla[q][clave];
            };

            // --- Valores seleccionados ---
            const AT282 = buscarH("pesoPropio"); // peso propio
            const AT283 = buscarH("q1");         // q1 final
            const AT284 = buscarH("q2");         // q2 final

            const I231 = 1.8;
            const I305 = 65;
            // --- Guardar en las celdas correspondientes ---
            res.H277 = AT282;
            res.H278 = AT283;
            res.H279 = AT284;
            res.H280 = I231;
            res.H281 = 0;
            res.H282 = I305 / 100;
            res.K280 = AT284 - AT283;
            res.K281 = (AT284 - AT283) * res.H281 / res.H280;

            //tabla
            res.H287 = res.H278 * (res.H282 - res.H280);
            res.I287 = (res.K281 * res.H282 - res.K280 * res.H280) / 2;
            res.J287 = SUMA(res.H287, res.I287);
            res.K287 = ABS(res.H277 * (res.H282 - res.H280));

            res.H288 = res.H278 * (res.H281 * res.H281 + res.H280 * res.H280 - 2 * res.H280 * res.H281) / 2;
            res.I288 = (res.K280 * res.H280 * res.H280 / 3) + (res.K281 * res.H281 * res.H281 / 6) - (res.K280 * res.H280 * res.H281 / 2);
            res.J288 = -SUMA(res.H288, res.I288);
            res.K288 = res.H277 * (res.H281 * res.H281 + res.H280 * res.H280 - 2 * res.H280 * res.H281) / 2;

            res.H290 = ABS(1.7 * res.J288 - 1.4 * res.K288);
            res.H291 = ABS(1.7 * res.J287 + -1.4 * res.K287);
        },

        calcularTalon() {
            const ABS = Math.abs;
            const SUMA = (...nums) => nums.reduce((acc, n) => acc + (n || 0), 0);
            const SI = (cond, valSi, valNo) => cond ? valSi : valNo;

            const res = this.talon.resultados;

            // --- Constantes mapeadas desde Excel ---
            const AQ286 = 5.40;  // peso propio
            const AQ287 = 13.34;  // p. Terreno
            const AQ288 = 6.97; // q1 SIN SISMO
            const AQ289 = 11.49; // q2 SIN SISMO

            const AR286 = 5.40;  // peso propio
            const AR287 = 13.34;  // peso Terreno
            const AR288 = 5.89; // q1 CON SISMO
            const AR289 = 11.43; // q2 CON SISMO

            const As286 = Math.max(AQ286, AR286); // peso propio
            const As287 = Math.max(AQ287, AR287); // peso terreno
            const As288 = Math.max(AQ288, AR288); // q1
            const As289 = Math.max(AQ289, AR289); // q2

            // --- Selección según H236 ---
            const H236 = "CON SISMO"; // futuro: tomar de datos
            const clave = { "SIN SISMO": "sin", "CON SISMO": "con", "MAXIMO": "max" }[H236] || "max";

            const buscarH = (q) => {
                const tabla = {
                    pPropio: { sin: AQ286, con: AR286, max: As286 },
                    pterreno: { sin: AQ287, con: AR287, max: As287 },
                    q1: { sin: AQ288, con: AR288, max: As288 },
                    q2: { sin: AQ289, con: AR289, max: As289 }
                };
                return tabla[q][clave];
            };

            // --- Valores seleccionados ---
            const AT286 = buscarH("pPropio"); // peso propio
            const AT287 = buscarH("pterreno"); // peso terreno
            const AT288 = buscarH("q1");         // q1 final
            const AT289 = buscarH("q2");         // q2 final

            const I232 = 3;
            const O305 = 75;
            const N349 = 2;
            const N312 = 0;

            res.N277 = AT286;
            res.N278 = AT287;
            res.N279 = AT288;
            res.N280 = AT289;
            res.N281 = I232;
            res.N282 = 0;
            res.N283 = O305 / 100;
            res.N284 = N349;

            res.Q280 = res.N280 - res.N279;
            res.Q281 = res.N283 * res.Q280 / res.N281;
            res.Q282 = res.Q280 - res.Q281;
            res.Q284 = N312;
            //tabla 
            res.N286 = res.N279 * (res.Q284 - res.N281);
            res.O286 = res.Q282 * res.Q284 + res.Q281 * res.Q284 / 2 - res.Q280 * res.N281 / 2;
            res.P286 = SUMA(res.N286, res.O286);
            res.Q286 = ABS(res.N277 * (res.Q284 - res.N281));
            res.R286 = ABS(res.N278 * (res.Q284 - res.N281));

            res.N287 = res.N279 * (res.N283 - res.N281);
            res.O287 = res.Q282 * res.N283 + res.Q281 * res.N283 / 2 - res.Q280 * res.N281 / 2;
            res.P287 = SUMA(res.N287, res.O287);
            res.Q287 = ABS(res.N277 * (res.N283 - res.N281));
            res.R287 = ABS(res.N278 * (res.N283 - res.N281));

            res.N288 = res.N279 * (res.N282 * res.N282 + res.N281 * res.N281 - 2 * res.N281 * res.N282) / 2;
            res.O288 = (res.Q282 * res.N282 * res.N282 / 2) + (res.Q281 * res.N282 * res.N282 / 3) - (res.Q280 * res.N281 * res.N282 / 2) + res.Q280 * res.N281 * res.N281 / 6;
            res.P288 = -SUMA(res.N288, res.O288);
            res.Q288 = res.N277 * (res.N282 * res.N282 + res.N281 * res.N281 - 2 * res.N281 * res.N282) / 2;
            res.R288 = res.N278 * (res.N282 * res.N282 + res.N281 * res.N281 - 2 * res.N281 * res.N282) / 2;

            res.N289 = res.N279 * (res.N284 * res.N284 + res.N281 * res.N281 - 2 * res.N281 * res.N284) / 2;
            res.O289 = (res.Q282 * res.N284 * res.N284 / 2) + (res.Q281 * res.N284 * res.N284 / 3) - (res.Q280 * res.N281 * res.N284 / 2) + res.Q280 * res.N281 * res.N281 / 6;
            res.P289 = -SUMA(res.N289, res.O289)
            res.Q289 = res.N277 * (res.N284 * res.N284 + res.N281 * res.N281 - 2 * res.N281 * res.N284) / 2;
            res.R289 = res.N278 * (res.N284 * res.N284 + res.N281 * res.N281 - 2 * res.N281 * res.N284) / 2;

            //resultadoos
            res.N290 = 1.7 * res.P288 + 1.4 * res.Q288 + 1.7 * res.R288;
            res.N291 = 1.7 * res.P287 + 1.4 * res.Q287 + 1.7 * res.R287;
        },

        calcularKey() {
            const ABS = Math.abs;
            const SUMA = (...nums) => nums.reduce((acc, n) => acc + (n || 0), 0);
            const SI = (cond, valSi, valNo) => cond ? valSi : valNo;

            const res = this.key.resultados;

            // --- Constantes mapeadas desde Excel ---
            const AQ291 = 5.57; // q1 SIN SISMO
            const AQ292 = 6.31; // q2 SIN SISMO

            const AR291 = 5.57; // q1 CON SISMO
            const AR292 = 6.31; // q2 CON SISMO

            const As291 = Math.max(AQ291, AR291); // q1
            const As292 = Math.max(AQ292, AR292); // q2

            // --- Selección según H236 ---
            const H236 = "CON SISMO"; // futuro: tomar de datos
            const clave = { "SIN SISMO": "sin", "CON SISMO": "con", "MAXIMO": "max" }[H236] || "max";

            const buscarH = (q) => {
                const tabla = {
                    q1: { sin: AQ291, con: AR291, max: As291 },
                    q2: { sin: AQ292, con: AR292, max: As292 }
                };
                return tabla[q][clave];
            };

            const I233 = 1;
            const AT291 = buscarH("q1");         // q1 final
            const AT292 = buscarH("q2");         // q2 final

            res.U277 = AT291;
            res.U278 = AT292;
            res.U279 = I233;

            res.U284 = res.U277 * res.U279;
            res.V284 = (res.U278 - res.U277) * res.U279 / 2;
            res.W284 = SUMA(res.U284, res.V284);

            res.U285 = res.U284 * res.U279 / 2;
            res.V285 = res.V284 * 2 * res.U279 / 3;
            res.W285 = SUMA(res.U285, res.V285);

            res.U287 = 1.7 * res.W285;
            res.U288 = 1.7 * res.W284;


        },

        // Validar todos los datos
        validarDatos() {
            const elementos = ['pantalla', 'punta', 'talon', 'key'];
            elementos.forEach(elemento => {
                this.calcular(elemento);
            });
        },

        // Exportar resultados
        exportarResultados() {
            const resultados = {
                timestamp: new Date().toISOString(),
                proyecto: 'Análisis Estructural - Muro de Contención',
                elementos: {
                    pantalla: this.pantalla,
                    punta: this.punta,
                    talon: this.talon,
                    key: this.key
                },
                resumen: this.obtenerResumen()
            };

            const blob = new Blob([JSON.stringify(resultados, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analisis_estructural_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            NotificationManager.showSuccess('Resultados exportados exitosamente');
        },

        // Resetear todos los cálculos
        resetearCalculos() {
            if (confirm('¿Está seguro de resetear todos los cálculos?')) {
                // Restaurar valores por defecto
                this.pantalla.datos = {
                    tn: 1.31, qr: 5.03, L: 6.65, X1: 0, X2: 0.3, X3: 4, w: 3.71, g: 0.00, b: 3.71
                };
                this.punta.datos = {
                    pesoPropio: 3.24, qr: 13.89, qr2: 17.59, L: 1.8, X1: 0, X2: 0.65, w: 3.69, g: 0
                };
                this.talon.datos = {
                    pesoPropio: 5.40, pTerreno: 13.34, qr: 5.68, qr2: 11.43, L: 3, X1: 0, X2: 0.75, X3: 1, w: 5.5, g: 1.4, b: 4.2
                };
                this.key.datos = {
                    qr: 5.03, qr2: 6.65, L: 1.00, VX2: 1.4, MX1: 29.04, MX3: 4.61, V: 5.57, M: 2.79
                };

                this.validarDatos();
                NotificationManager.showInfo('Cálculos reseteados a valores iniciales');
            }
        },

        // Obtener resumen de resultados
        obtenerResumen() {
            return {
                pantalla: {
                    momento_ultimo: this.pantalla.resultados.Mu,
                    cortante_ultimo: this.pantalla.resultados.Vu
                },
                punta: {
                    momento_ultimo: this.punta.resultados.Mu,
                    cortante_ultimo: this.punta.resultados.Vu
                },
                talon: {
                    momento_ultimo: this.talon.resultados.Mu,
                    cortante_ultimo: this.talon.resultados.Vu
                },
                key: {
                    momento_techo: this.key.resultados.Mu_techo,
                    cortante_techo: this.key.resultados.Vu_techo
                }
            };
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
            return parseFloat(numero).toFixed(decimales);
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