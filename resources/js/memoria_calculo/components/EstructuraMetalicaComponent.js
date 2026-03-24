<<<<<<< HEAD
=======
// ============================================
// Crear archivo EstructuraMetalicaComponent.js
// ============================================

>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec
import { handleImageChange } from "../utils/imageHandler";


export function createEstructuraMetalicaComponent() {
    return {

        // INICIALIZACIÓN
        // ============================================
        init() {
            console.log('✅ Componente Estructura Metálica inicializado');

            // Listen for state restoration events
            // this.$watch('$store.memoriaCalculoState.estructuraMetalica', (value) => {
            //     if (value) {
            //         this.restoreState(value);
            //     }
            // });
        },

        // Accordion states for subsections
        showSectionx: true,

        showSectiony: false,
        showSectiony1: false,
        showSectiony2: false,
        showSectiony3: false,
        showSectiony4: false,
        showSectiony5: false,
        showSectiony6: false,

        // IMAGENES

<<<<<<< HEAD
=======
        /**
         * Maneja el pegado de imagen para cualquier grupo de imágenes
         * @param {ClipboardEvent} event - Evento del portapapeles
         * @param {string} groupKey - Clave del grupo de imágenes
         * @param {number} index - Índice de la imagen
         */
        async handlePaste(event, groupKey, index) {
            event.preventDefault();
            event.stopPropagation();

            console.log(`📋 Detectado pegado para ${groupKey}[${index}]`);

            try {
                const items = event.clipboardData?.items;

                if (!items) {
                    console.log("No hay items en el portapapeles");
                    return;
                }

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];

                    if (item.type.indexOf("image") !== -1) {
                        const file = item.getAsFile();

                        if (file) {
                            // Crear nombre único
                            const fileName = `${groupKey}_${index}_${Date.now()}.png`;
                            const renamedFile = new File([file], fileName, { type: file.type });

                            // Crear evento simulado
                            const mockEvent = {
                                target: {
                                    files: [renamedFile],
                                },
                                type: "change",
                            };

                            // Usar el mismo handler que la selección de archivos
                            await handleImageChange(
                                mockEvent,
                                (file, dataUrl) => {
                                    this.$store.memoriaCalculo.updateArrayImage(groupKey, index, file, dataUrl);
                                    console.log(`✅ Imagen pegada en ${groupKey}[${index}]`);
                                },
                                (error) => {
                                    this.$store.memoriaCalculo.addError('images', error);
                                    console.error(`❌ Error al pegar:`, error);
                                }
                            );

                            return;
                        }
                    }
                }

                console.log("No se encontró una imagen en el portapapeles");
            } catch (error) {
                console.error("Error al pegar:", error);
            }
        },

        /**
        * Maneja el cambio de una imagen en array
        * @param {string} groupKey - Clave del grupo
        * @param {number} index - Índice
        * @param {Event} event - Evento del input file
        */
        async handleArrayImageChange(groupKey, index, event) {
            await handleImageChange(
                event,
                (file, dataUrl) => {
                    this.$store.memoriaCalculo.updateArrayImage(groupKey, index, file, dataUrl);
                },
                (error) => {
                    this.$store.memoriaCalculo.addError('images', error);
                }
            );
            console.log('✅ Imagen guardada: ');
            console.log(`   - Grupo: ${groupKey}`);
            console.log(`   - Índice: ${index}`);
        },

        /**
         * Elimina una imagen de array
         * @param {string} groupKey - Clave del grupo
         * @param {number} index - Índice
         */
        removeArrayImage(groupKey, index) {
            this.$store.memoriaCalculo.removeArrayImage(groupKey, index);
        },
>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec

        handleImageUpload(event, imageKey) {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Por favor seleccione un archivo de imagen válido');
                return;
            }

            // Create FileReader to convert to base64
            const reader = new FileReader();
            reader.onload = (e) => {
                this[imageKey] = e.target.result;

                // Emit event to update parent state
                this.$dispatch('update-diseno-elementos', {
                    [imageKey]: e.target.result
                });

                // Also update Alpine store if available
                if (this.$store.memoriaCalculoState) {
                    if (!this.$store.memoriaCalculoState.estructuraMetalica) {
                        this.$store.memoriaCalculoState.estructuraMetalica = {};
                    }
                    this.$store.memoriaCalculoState.estructuraMetalica[imageKey] = e.target.result;
                }
            };

            reader.onerror = () => {
                alert('Error al cargar la imagen. Por favor intente nuevamente.');
            };

            reader.readAsDataURL(file);
        },

        /**
        * Maneja el cambio de una imagen en array
        * @param {string} groupKey - Clave del grupo
        * @param {number} index - Índice
        * @param {Event} event - Evento del input file
        */
        async handleArrayImageChange(groupKey, index, event) {
            await handleImageChange(
                event,
                (file, dataUrl) => {
                    this.$store.memoriaCalculo.updateArrayImage(groupKey, index, file, dataUrl);
                },
                (error) => {
                    this.$store.memoriaCalculo.addError('images', error);
                }
            );
            console.log('✅ Imagen guardada: ');
            console.log(`   - Grupo: ${groupKey}`);
            console.log(`   - Índice: ${index}`);
        },

        /**
         * Elimina una imagen de array
         * @param {string} groupKey - Clave del grupo
         * @param {number} index - Índice
         */
        removeArrayImage(groupKey, index) {
            this.$store.memoriaCalculo.removeArrayImage(groupKey, index);
        },

        restoreState(state) {
            const imageKeys = [
                'figurax',
                'figuray11', 'figuray12', // ●	DISEÑO DE COLUMNA METALICA
                'figuray21', 'figuray22', // ●	DISEÑO DE BRIDA SUPERIOR 
                'figuray31', 'figuray32', // ●	DISEÑO DE BRIDA INFERIOR 
                'figuray41', 'figuray42', // ●	DISEÑO DE PARANTE
                'figuray51', 'figuray52', // ●	DISEÑO DE DIAGONAL
                'figuray61', 'figuray62', // ●	DISEÑO DE CORREA METÁLICA
            ];

            imageKeys.forEach(key => {
                if (state[key]) {
                    this[key] = state[key];
                }
            });
        },

        getState() {
            return {
                figurax: this.figurax,

                figuray11: this.figuray11,
                figuray12: this.figuray12,

                figuray21: this.figuray21,
                figuray22: this.figuray22,

                figuray31: this.figuray31,
                figuray32: this.figuray32,

                figuray41: this.figuray41,
                figuray42: this.figuray42,

                figuray51: this.figuray51,
                figuray52: this.figuray52,

                figuray61: this.figuray61,
                figuray62: this.figuray62,
                // figura41: this.figura41,
                // figura42: this.figura42,
            };
        }
    };
}
<<<<<<< HEAD
=======

>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec
