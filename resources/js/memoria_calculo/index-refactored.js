// index.js - Memoria de Cálculo - Versión Refactorizada con Arquitectura de Componentes
import { buildContentStructure, DEFAULT_MC_STRUCTURE } from "./content-structure-mc.js";
import { ContentProcessorMC } from "./content-processor-mc.js";
import ubigeoData from "./ubigeo.json";

// Importar store y componentes
import { createMemoriaCalculoStore } from "./stores/memoriaCalculoStore.js";
import { createGeneralidadesComponent } from "./components/GeneralidadesComponent.js";
import { createAnalisisCargasComponent } from "./components/AnalisisCargasComponent.js";
import { createAnalisisSismicoComponent } from "./components/AnalisisSismicoComponent.js";
import {createEstructuraMetalicaComponent} from "./components/EstructuraMetalicaComponent.js";
import {createDisenoElementosComponent} from "./components/DisenoElementosComponent.js";
import {createConclusionesComponent} from "./components/SimpleSectionComponent.js";

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

        document: JSON.parse(JSON.stringify(DEFAULT_MC_STRUCTURE.document)),

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
        // EXPORTACIÓN WORD
        // ============================================

        /**
         * Exporta el documento a Word
         */
        async exportWord() {
            try {
                console.log('📄 Iniciando exportación a Word...');
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
