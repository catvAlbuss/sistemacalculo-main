// index.js - Memoria de Cálculo - Versión Refactorizada con Arquitectura de Componentes
import { buildContentStructure, DEFAULT_MC_STRUCTURE } from "./content-structure-mc.js";
import { ContentProcessorMC } from "./content-processor-mc.js";
import ubigeoData from "./ubigeo.json";

// Importar store y componentes
import { createMemoriaCalculoStore } from "./stores/memoriaCalculoStore.js";
import { createGeneralidadesComponent } from "./components/GeneralidadesComponent.js";
import { createAnalisisCargasComponent } from "./components/AnalisisCargasComponent.js";
import { createAnalisisSismicoComponent } from "./components/AnalisisSismicoComponent.js";
import { createDisenoElementosComponent } from "./components/DisenoElementosComponent.js";
import {createEstructuraMetalicaComponent} from "./components/EstructuraMetalicaComponent.js";
import {
    createConclusionesComponent
} from "./components/SimpleSectionComponent.js";

// Importar transformador de documentos
import { DocumentTransformer } from "./processors/documentTransformer.js";

// Inicializar store globalmente si no existe
if (typeof Alpine !== 'undefined' && !Alpine.store('memoriaCalculo')) {
    Alpine.store('memoriaCalculo', createMemoriaCalculoStore());
}

/**
 * Componente principal Alpine.js para Memoria de Cálculo
 * Orquesta todos los componentes de secciones
 */
function memoriaCalculo() {
    return {
        // ============================================
        // GETTERS PARA COMPATIBILIDAD CON VISTAS
        // ============================================
        get cover() { return this.$store?.memoriaCalculo?.cover || {}; },
        get sections() { return this.$store?.memoriaCalculo?.sections || {}; },
        get images() { return this.$store?.memoriaCalculo?.images || {}; },
        get previews() { return this.$store?.memoriaCalculo?.previews || {}; },
        get ui() { return this.$store?.memoriaCalculo?.ui || { errors: [] }; },
        get errors() { return this.ui.errors; },
        get isExporting() { return this.ui.isExporting; },

        // Proxies para compatibilidad con sidebar y otros partials
        get floors() { return this.sections.generalidades?.floors || 1; },
        get structuralDetails() {
            return this.sections.generalidades?.structuralDetails || {
                materialDesign: {
                    aceroEstructural: {},
                    aceroCorrugado: {},
                    concreto: {}
                }
            };
        },

        get losa() { return this.sections.disenoElementos?.losa || 1; },


        document: JSON.parse(JSON.stringify(DEFAULT_MC_STRUCTURE.document)),

        showErrorModal: false,
        validationErrors: [],

        // ============================================
        // INICIALIZACIÓN
        // ============================================
        init() {
            console.log('🚀 Inicializando Memoria de Cálculo');

            // Asegurar que el store tenga los datos de ubigeo
            if (this.$store.memoriaCalculo && ubigeoData) {
                this.$store.memoriaCalculo.ubigeoData = ubigeoData;
            }

            console.log('✅ Inicialización completa');
        },

        // ============================================
        // MÉTODOS - Validación de Campos de Texto
        // ============================================
        
        /**
         * Valida todos los campos de texto requeridos
         * @returns {object} { valid: boolean, errors: string[] }
         */
        validateTextFields() {
            const errors = [];
            const sections = this.$store.memoriaCalculo.sections;
            const store = this.$store.memoriaCalculo;
            
            // 1. Validar Uso por Pisos (Sección 1.4)
            const usageText = sections.generalidades.structuralDetails.usage || "";
            const floors = sections.generalidades.floors || 1;
            const usageLines = usageText.split('\n').filter(line => line.trim() !== '').length;
            
            if (usageLines !== floors) {
                errors.push({
                    field: "Uso por Pisos",
                    message: `El campo de pisos debe tener ${floors} líneas (una por cada piso). Actualmente tiene ${usageLines}.`
                });
            }
            
            // 2. Validar Descripción de Losas Aligeradas (Sección 4.2)
            const losaDescripcion = sections.disenoElementos?.lista;
            if (!losaDescripcion || losaDescripcion.trim() === "") {
                errors.push({
                    field: "Descripción de Losas Aligeradas",
                    message: "El campo de losas aligeradas es obligatorio"
                });
            }
            
            // 3. Validar Descripción de Vigas (Sección 4.4)
            const vigaDescripcion = sections.disenoElementos?.nameVigas;
            if (!vigaDescripcion || vigaDescripcion.trim() === "") {
                errors.push({
                    field: "Descripción de Vigas",
                    message: "El campo de vigas es obligatorio"
                });
            }
            
            // 4. Validar Descripción de Columnas (Sección 4.5)
            const columnaDescripcion = sections.disenoElementos?.nameColumna;
            if (!columnaDescripcion || columnaDescripcion.trim() === "") {
                errors.push({
                    field: "Descripción de Columnas",
                    message: "El campo de columnas es obligatorio"
                });
            }
            
            // 5. Validar Descripción de Placas (Sección 4.6)
            const placaDescripcion = sections.disenoElementos?.namePlaca;
            if (!placaDescripcion || placaDescripcion.trim() === "") {
                errors.push({
                    field: "Descripción de Placas",
                    message: "El campo de placas es obligatorio"
                });
            }
            
            // 6. Validar Descripción de Cimentaciones (Sección 4.11)
            const cimentacionDescripcion = sections.disenoElementos?.nameCimentacion;
            if (!cimentacionDescripcion || cimentacionDescripcion.trim() === "") {
                errors.push({
                    field: "Descripción de Cimentaciones",
                    message: "Este campo de cimentaciones es obligatorio"
                });
            }
            
            // // 7. Validar Estructura Metálica - Columna
            // const columnaMetalica = sections.estructuraMetalica?.descripcion?.ColumnaMetalica;
            // if (!columnaMetalica || columnaMetalica.trim() === "") {
            //     errors.push({
            //         field: "Columna Metálica",
            //         message: "Este campo es obligatorio"
            //     });
            // }
            
            // // 8. Validar Estructura Metálica - Brida Superior
            // const bridaSuperior = sections.estructuraMetalica?.descripcion?.BridaSuperior;
            // if (!bridaSuperior || bridaSuperior.trim() === "") {
            //     errors.push({
            //         field: "Brida Superior",
            //         message: "Este campo es obligatorio"
            //     });
            // }
            
            // // 9. Validar Estructura Metálica - Brida Inferior
            // const bridaInferior = sections.estructuraMetalica?.descripcion?.BridaInferior;
            // if (!bridaInferior || bridaInferior.trim() === "") {
            //     errors.push({
            //         field: "Brida Inferior",
            //         message: "Este campo es obligatorio"
            //     });
            // }
            
            // // 10. Validar Estructura Metálica - Parante
            // const parante = sections.estructuraMetalica?.descripcion?.Parante;
            // if (!parante || parante.trim() === "") {
            //     errors.push({
            //         field: "Parante",
            //         message: "Este campo es obligatorio"
            //     });
            // }
            
            // // 11. Validar Estructura Metálica - Diagonal
            // const diagonal = sections.estructuraMetalica?.descripcion?.Diagonal;
            // if (!diagonal || diagonal.trim() === "") {
            //     errors.push({
            //         field: "Diagonal",
            //         message: "Este campo es obligatorio"
            //     });
            // }
            
            // // 12. Validar Estructura Metálica - Correa Metálica
            // const correaMetalica = sections.estructuraMetalica?.descripcion?.CorreaMetalica;
            // if (!correaMetalica || correaMetalica.trim() === "") {
            //     errors.push({
            //         field: "Correa Metálica",
            //         message: "Este campo es obligatorio"
            //     });
            // }
            
            // // 13. Validar Conclusiones
            // const conclusiones = sections.conclusiones?.descripcion;
            // if (!conclusiones || conclusiones.trim() === "") {
            //     errors.push({
            //         field: "Conclusiones",
            //         message: "Este campo es obligatorio"
            //     });
            // }
            
            // // 14. Validar Recomendaciones
            // const recomendaciones = sections.recomendaciones?.descripcion;
            // if (!recomendaciones || recomendaciones.trim() === "") {
            //     errors.push({
            //         field: "Recomendaciones",
            //         message: "Este campo es obligatorio"
            //     });
            // }
            
            // Limpiar errores anteriores y agregar nuevos
            this.$store.memoriaCalculo.clearErrorsByCategory("validation");
            errors.forEach((error) => {
                this.$store.memoriaCalculo.addError("validation", error.message);
            });
            
            return {
                valid: errors.length === 0,
                errors: errors
            };
        },

        /**
         * Muestra el modal con los errores
         */
        showValidationModal() {
            const validation = this.validateTextFields();
            
            if (!validation.valid) {
                this.validationErrors = validation.errors;
                this.showErrorModal = true;
                console.log('❌ Errores encontrados:', validation.errors);
            } else {
                // Si no hay errores, exportar directamente
                this.exportWord();
            }
        },
        
        /**
         * Cierra el modal de errores
         */
        closeErrorModal() {
            this.showErrorModal = false;
            this.validationErrors = [];
        },
        
        /**
         * Exportar después de cerrar el modal (si se corrigieron errores)
         */
        retryExport() {
            this.closeErrorModal();
            // Pequeño delay para que el modal se cierre antes de reintentar
            setTimeout(() => {
                this.showValidationModal();
            }, 100);
        },

        // ============================================
        // EXPORTACIÓN WORD
        // ============================================

        /**
         * Exporta el documento a Word
         */
        async exportWord() {
            try {
                console.log('📄 Iniciando exportación a Word...');

                // 👇 VALIDAR ANTES DE EXPORTAR
                const validation = this.validateTextFields();
                
                if (!validation.valid) {
                    console.warn('⚠️ Validación fallida:', validation.errors);
                    // Los errores ya se agregaron al store, se mostrarán en la UI
                    this.$store.memoriaCalculo.ui.isExporting = false;
                    return; // 👈 SALIR SIN EXPORTAR, SIN RECARGAR PÁGINA
                }

                this.$store.memoriaCalculo.startExport();

                // Validar librerías requeridas
                if (!window.docx) {
                    this.$store.memoriaCalculo.addError("libs", "La librería 'docx' no se ha cargado correctamente.");
                    this.$store.memoriaCalculo.endExport();
                    return;
                }

                if (!window.saveAs) {
                    this.$store.memoriaCalculo.addError("libs", "La librería 'FileSaver' no está disponible.");
                    this.$store.memoriaCalculo.endExport();
                    return;
                }

                // Obtener datos desde el store
                const exportData = this.$store.memoriaCalculo.getExportData();

                // Construir estructura para procesador
                const structure = buildContentStructure({
                    cover: exportData.cover,
                    sections: exportData.sections,
                    document: JSON.parse(JSON.stringify(this.document))
                });

                // Aplicar transformaciones dinámicas usando el transformer
                console.log('🔄 Aplicando transformaciones dinámicas...');
                const transformer = new DocumentTransformer(exportData, ubigeoData);
                transformer.applyAll(structure);

                // Procesar y generar documento
                console.log('📝 Generando documento Word...');
                const processor = new ContentProcessorMC(window.docx, exportData);
                const allImages = {
                    ...exportData.images,
                    ...exportData.previews
                };

                const doc = await processor.buildDocument(structure, allImages);

                // Generar y descargar
                console.log('💾 Descargando archivo...');
                const blob = await window.docx.Packer.toBlob(doc);
                const fileName = this.generateFileName(exportData.cover);
                window.saveAs(blob, fileName);

                console.log('✅ Exportación completada');
                this.$store.memoriaCalculo.endExport();

            } catch (error) {
                console.error('❌ Error en exportación:', error);
                this.$store.memoriaCalculo.addError('export', `Error al generar documento: ${error.message}`);
                this.$store.memoriaCalculo.endExport();
            }
        },

        /**
         * Genera nombre de archivo para exportación
         */
        generateFileName(cover) {
            const projectName = cover.project || 'memoria_calculo';
            const sanitized = projectName
                .toLowerCase()
                .replace(/[áàäâã]/g, 'a')
                .replace(/[éèëê]/g, 'e')
                .replace(/[íìïî]/g, 'i')
                .replace(/[óòöôõ]/g, 'o')
                .replace(/[úùüû]/g, 'u')
                .replace(/ñ/g, 'n')
                .replace(/[^a-z0-9]+/g, '_')
                .substring(0, 50);

            const date = new Date().toISOString().split('T')[0];
            return `${sanitized}_${date}.docx`;
        }
    };
}

// Exportar función principal y componentes al ámbito global
window.memoriaCalculo = memoriaCalculo;
window.createGeneralidadesComponent = createGeneralidadesComponent;
window.createAnalisisCargasComponent = createAnalisisCargasComponent;
window.createAnalisisSismicoComponent = createAnalisisSismicoComponent;
window.createDisenoElementosComponent = createDisenoElementosComponent;
window.createEstructuraMetalicaComponent = createEstructuraMetalicaComponent;
window.createConclusionesComponent = createConclusionesComponent;

export default memoriaCalculo;