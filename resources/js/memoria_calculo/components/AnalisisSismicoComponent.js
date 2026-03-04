// AnalisisSismicoComponent.js - Alpine component for Análisis Sísmico section
export function createAnalisisSismicoComponent() {
    return {
        // Section 3.2 - Análisis Sísmico Estático (3 images)
        figura26: null, // Patrón de cargas sísmicas en "X"
        figura27: null, // Patrón de cargas sísmicas en "Y"
        figura28: null, // Peso sísmico

        // Section 3.3.1 - CONSIDERACIONES EN ETABS (2 images)
        figura29: null, // Datos del caso de carga en "X"
        figura30: null, // Datos del caso de carga en "Y"

        // Section 3.3.2 - MODOS DE VIBRACIÓN (3 images)
        figura31: null, // Datos de modos a su períodos
        figura32: null, // Modo de vibración 2-desplazamiento en "Y"
        figura33: null, // Modo de vibración 1-desplazamiento en "X"

        // Section 3.3.3 - FUERZA CORTANTE BASAL DINÁMICA (1 image)
        figura34: null, // Fuerza cortante en la base obtenida

        // Section 3.3.4 - DESPLAZAMIENTO PERMISIBLE (4 images)
        figura35: null, // Sismo Dinámico en dirección "X" Escalado
        figura36: null, // Sismo Dinámico en dirección "Y" Escalado
        figura37: null, // Sismo Dinámico en dirección "X"
        figura38: null, // Sismo Dinámico en dirección "Y"

        // Section 3.3.5 - DEFORMADAS (2 images)
        figura39: null, // Deformada en "X" debido a carga sísmica (mm)
        figura40: null, // Deformada en "Y" debido a carga sísmica (mm)

        // Accordion states for subsections
        showSection32: true,
        showSection33: true,
        showSection331: false,
        showSection332: false,
        showSection333: false,
        showSection334: false,
        showSection335: false,

        init() {
            console.log('AnalisisSismicoComponent initialized');

            // Listen for state restoration events
            this.$watch('$store.memoriaCalculoState.analisisSismico', (value) => {
                if (value) {
                    this.restoreState(value);
                }
            });
        },

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
                this.$dispatch('update-analisis-sismico', {
                    [imageKey]: e.target.result
                });

                // Also update Alpine store if available
                if (this.$store.memoriaCalculoState) {
                    if (!this.$store.memoriaCalculoState.analisisSismico) {
                        this.$store.memoriaCalculoState.analisisSismico = {};
                    }
                    this.$store.memoriaCalculoState.analisisSismico[imageKey] = e.target.result;
                }
            };

            reader.onerror = () => {
                alert('Error al cargar la imagen. Por favor intente nuevamente.');
            };

            reader.readAsDataURL(file);
        },

        removeImage(imageKey) {
            this[imageKey] = null;

            // Emit event to update parent state
            this.$dispatch('update-analisis-sismico', {
                [imageKey]: null
            });

            // Update Alpine store
            if (this.$store.memoriaCalculoState?.analisisSismico) {
                this.$store.memoriaCalculoState.analisisSismico[imageKey] = null;
            }

            // Clear the file input
            const input = this.$refs[`input_${imageKey}`];
            if (input) {
                input.value = '';
            }
        },

        restoreState(state) {
            const imageKeys = [
                'figura26', 'figura27', 'figura28', // Section 3.2
                'figura29', 'figura30', // Section 3.3.1
                'figura31', 'figura32', 'figura33', // Section 3.3.2
                'figura34', // Section 3.3.3
                'figura35', 'figura36', 'figura37', 'figura38', // Section 3.3.4
                'figura39', 'figura40' // Section 3.3.5
            ];

            imageKeys.forEach(key => {
                if (state[key]) {
                    this[key] = state[key];
                }
            });
        },

        getState() {
            return {
                figura26: this.figura26,
                figura27: this.figura27,
                figura28: this.figura28,
                figura29: this.figura29,
                figura30: this.figura30,
                figura31: this.figura31,
                figura32: this.figura32,
                figura33: this.figura33,
                figura34: this.figura34,
                figura35: this.figura35,
                figura36: this.figura36,
                figura37: this.figura37,
                figura38: this.figura38,
                figura39: this.figura39,
                figura40: this.figura40
            };
        }
    };
}
