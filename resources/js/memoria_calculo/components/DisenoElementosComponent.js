import { handleImageChange } from "../utils/imageHandler.js";

export function createDisenoElementosComponent() {
  const CONFIG_ELEMENTOS = {
    losaAligerada: {
      nombre: "Losa Aligerada",
      metodoStore: "updateLosaAligeradaImage",
      imagenesPorSeccion: 4,
      prefijoArchivo: "losa_alig",
      groupKey: "losaImages",
    },
    viga: {
      nombre: "Viga",
      metodoStore: "updateVigaImage",
      imagenesPorSeccion: 4,
      prefijoArchivo: "viga",
      groupKey: "vigaImages",
    },
    columna: {
      nombre: "Columna",
      metodoStore: "updateColumnaImage",
      imagenesPorSeccion: 4,
      prefijoArchivo: "columna",
      groupKey: "columnaImages",
    },
    placa: {
      nombre: "Placa",
      metodoStore: "updatePlacaImage",
      imagenesPorSeccion: 4,
      prefijoArchivo: "placa",
      groupKey: "placaImages",
    },
    cimentacion: {
      nombre: "Cimentación",
      metodoStore: "updateCimentacionImage",
      imagenesPorSeccion: 4,
      prefijoArchivo: "ciment",
      groupKey: "cimentacionImages",
    },
    predim: {
      nombre: "Predim",
      metodoStore: "updatePredimImage",
      imagenesPorSeccion: 4,
      prefijoArchivo: "ciment",
      groupKey: "predimImages",
    },
  };
  return {
    showSection41: false,
    showSection42: false,
    showSection43: false,
    showSection44: false,
    showSection441: false,
    showSection442: false,
    showSection45: false,
    showSection46: false,
    showSection47: false,
    showSection48: false,
    showSection49: false,
    showSection410: false,
    showSection411: false,
    showSection412: false,

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    init() {
      console.log("✅ Componente Diseño de Elementos inicializado");
      this.initImageSlots();
      this.updateLosas();

      this.cargarImagenesDesdeLocalStorage();
    },

    cargarImagenesDesdeLocalStorage() {
      console.log("🔍 Buscando imágenes en localStorage...");

      // // Cargar imagen de cimiento corrido
      // const imagenCimiento = localStorage.getItem("cimiento_corrido_img");
      // if (imagenCimiento) {
      //   console.log("📸 Imagen de cimiento encontrada en localStorage");

      //   // Guardar en el store
      //   const store = this.$store.memoriaCalculo;

      //   // Asegurar que existe el array
      //   if (!store.previews.disenoSimientoCorridoImages) {
      //     store.previews.disenoSimientoCorridoImages = [];
      //   }

      //   // Guardar en el índice 0 (o el que prefieras)
      //   const indiceImagen = 0;
      //   store.previews.disenoSimientoCorridoImages[indiceImagen] = imagenCimiento;

      //   console.log("✅ Imagen de cimiento cargada al store");

      //   // Opcional: Mostrar notificación al usuario
      //   if (typeof toast !== "undefined") {
      //     toast.success("Imagen de cimiento corrido cargada automáticamente");
      //   }

      //   // Opcional: Limpiar localStorage después de cargar
      //   // localStorage.removeItem('cimiento_corrido_img');
      // }
      this.cargarImagenesCimientoCorrido();
      this.cargarImagenesLosaMacisa();

      // También puedes cargar imágenes de otros elementos si las necesitas
      // const imagenViga = localStorage.getItem('viga_temp');
      // etc... losas-macisas_img
    },

    // En createDisenoElementosComponent.js
    cargarImagenesCimientoCorrido() {
      console.log("🔍 Buscando imágenes de cimiento corrido...");

      // Cargar las 3 partes
      const grafico = localStorage.getItem("cimiento_corrido_grafico");
      const resultadosSup = localStorage.getItem("cimiento_corrido_resultados_sup");
      const resultadosInf = localStorage.getItem("cimiento_corrido_resultados_inf");

      const store = this.$store.memoriaCalculo;

      // Asegurar que existe el array (tamaño 6 como tienes definido)
      if (!store.previews.disenoSimientoCorridoImages) {
        store.previews.disenoSimientoCorridoImages = [];
      }

      // Guardar cada parte en una posición diferente
      if (grafico) {
        store.previews.disenoSimientoCorridoImages[0] = grafico;
        console.log("✅ Gráfico cargado en posición 0");
      }

      if (resultadosSup) {
        store.previews.disenoSimientoCorridoImages[1] = resultadosSup;
        console.log("✅ Resultados (superior) cargados en posición 1");
      }

      if (resultadosInf) {
        store.previews.disenoSimientoCorridoImages[2] = resultadosInf;
        console.log("✅ Resultados (inferior) cargados en posición 2");
      }

      // Cargar metadatos si existen
      const metadata = localStorage.getItem("cimiento_corrido_metadata");
      if (metadata) {
        this.metadataCimiento = JSON.parse(metadata);
        console.log("📊 Metadatos:", this.metadataCimiento);
      }
    },

    cargarImagenesLosaMacisa() {
      console.log("🔍 Buscando imágenes de cimiento corrido...");

      // Cargar las 3 partes
      const resultadosSup = localStorage.getItem("losa_maciza_resultados_sup");
      const resultadosInf = localStorage.getItem("losa_maciza_resultados_inf");

      const store = this.$store.memoriaCalculo;

      // Asegurar que existe el array (tamaño 6 como tienes definido)
      if (!store.previews.disenoLosaMacizaImages) {
        store.previews.disenoLosaMacizaImages = [];
      }

      // Guardar cada parte en una posición diferente

      if (resultadosSup) {
        store.previews.disenoLosaMacizaImages[4] = resultadosSup;
        console.log("✅ Resultados (superior) cargados en posición 4");
      }

      if (resultadosInf) {
        store.previews.disenoLosaMacizaImages[5] = resultadosInf;
        console.log("✅ Resultados (inferior) cargados en posición 5");
      }
    },

    get losa() {
      return this.$store?.memoriaCalculo?.sections?.disenoElementos?.losa || 1;
    },
    get viga() {
      return this.$store?.memoriaCalculo?.sections?.disenoElementos?.viga || 1;
    },
    get columna() {
      return this.$store?.memoriaCalculo?.sections?.disenoElementos?.columna || 1;
    },

    get cimentacion() {
      return this.$store?.memoriaCalculo?.sections?.disenoElementos?.cimentacion || 1;
    },

    get placa() {
      return this.$store?.memoriaCalculo?.sections?.disenoElementos?.placa || 1;
    },

    get predim() {
      return this.$store?.memoriaCalculo?.sections?.disenoElementos?.predim || 1;
    },

    get resultadoPredim() {
      return this.$store?.memoriaCalculo?.sections?.disenoElementos?.resultadoPredim || 1;
    },

    initImageSlots() {
      const store = this.$store.memoriaCalculo;

      // Asegurar que los arrays existen
      const imageGroups = [
        "predisionamientoImages", //8 imagenes
        "disenoLosaAligeradaImages", //1 (variable cantidad de losas) Ejem: 6 losas
        "disenoLosaMacizaImages", //6 imagenes
        "disenoLosaNervada1Images", //9 imagenes
        "disenoLosaNervada2Images", //9 imagenes
        "disenoVigaImages",
        "disenoMuroConcretoImages", //6 imagenes
        "disenoEscaleraImages", //5 imagenes
        "disenoCisternaImages", //6 imagenes
        "disenoSimientoCorridoImages", //6 imagenes
      ];

      imageGroups.forEach((group) => {
        if (!Array.isArray(store.images[group])) {
          store.images[group] = [];
        }
        if (!Array.isArray(store.previews[group])) {
          store.previews[group] = [];
        }
      });

      // Inicializar tamaños específicos
      this.ensureArraySize("predisionamientoImages", 8);
      this.ensureArraySize("disenoLosaAligeradaImages", 1);
      this.ensureArraySize("disenoLosaMacizaImages", 6);
      this.ensureArraySize("disenoLosaNervada1Images", 9);
      this.ensureArraySize("disenoLosaNervada2Images", 9);
      this.ensureArraySize("disenoVigaImages", 1);
      this.ensureArraySize("disenoMuroConcretoImages", 6);
      this.ensureArraySize("disenoEscaleraImages", 5);
      this.ensureArraySize("disenoCisternaImages", 6);
      this.ensureArraySize("disenoSimientoCorridoImages", 6);
    },

    ensureArraySize(groupKey, size) {
      const store = this.$store.memoriaCalculo;

      while (store.images[groupKey].length < size) {
        store.images[groupKey].push(null);
        store.previews[groupKey].push(null);
      }

      if (store.images[groupKey].length > size) {
        store.images[groupKey] = store.images[groupKey].slice(0, size);
        store.previews[groupKey] = store.previews[groupKey].slice(0, size);
      }
    },

    updateLosas(value) {
      // Convertir a número entero
      const numValue = parseInt(value) || 1;

      console.log("🔄 Actualizando losas a:", numValue);

      // Actualizar el store directamente (sin duplicar)
      this.$store.memoriaCalculo.updateLosas(numValue);
    },
    updateVigas(value) {
      const numValue = parseInt(value) || 1;
      console.log("🔄 Actualizando vigas a:", numValue);
      this.$store.memoriaCalculo.updateVigas(numValue);
    },
    updateColumnas(value) {
      const numValue = parseInt(value) || 1;
      console.log("🔄 Actualizando columnas a:", numValue);
      this.$store.memoriaCalculo.updateColumnas(numValue);
    },
    updateCimentaciones(value) {
      const numValue = parseInt(value) || 1;
      console.log("🔄 Actualizando cimentaciones a:", numValue);
      this.$store.memoriaCalculo.updateCimentaciones(numValue);
    },
    updatePlacas(value) {
      const numValue = parseInt(value) || 1;
      console.log("🔄 Actualizando placas a:", numValue);
      this.$store.memoriaCalculo.updatePlacas(numValue);
    },
    updatePredim(value) {
      const numValue = parseInt(value) || 1;
      console.log("🔄 Actualizando predim a:", numValue);
      this.$store.memoriaCalculo.updatePredim(numValue);
    },
    updateResultadoPredim(value) {
      const numValue = parseInt(value) || 1;
      console.log("🔄 Actualizando resultadoPredim a:", numValue);
      this.$store.memoriaCalculo.updateResultadoPredim(numValue);
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
          this.$store.memoriaCalculo.addError("images", error);
        },
      );

      console.log(`✅ Imagen guardada:`);
      console.log(`   - Grupo: ${groupKey}`);
      console.log(`   - Índice: ${index}`);
    },

    /**
     * Maneja el cambio de una imagen de losa
     * @param {number} index - Índice de la losa
     * @param {Event} event - Evento del input file
     */
    async handleLosaImageChange(seccionIndex, imagenIndex, event) {
      await handleImageChange(
        event,
        (file, dataUrl) => {
          // Usar updateArrayImage pero ahora con índices específicos
          // Necesitas crear un método específico o modificar el store
          this.$store.memoriaCalculo.updateLosaAligeradaImage(seccionIndex, imagenIndex, file, dataUrl);
        },
        (error) => {
          this.$store.memoriaCalculo.addError("images", error);
        },
      );
    },
    /**
     * Elimina una imagen de piso
     * @param {number} index - Índice del piso
     */
    removeLosaImage(seccionIndex, imagenIndex) {
      console.log(`🗑️ Eliminando imagen - Sección: ${seccionIndex + 1}, Imagen: ${imagenIndex + 1}`);
      this.$store.memoriaCalculo.removeLosaImage(seccionIndex, imagenIndex);
    },

    removeVigaImage(seccionIndex, imagenIndex) {
      console.log(`🗑️ Eliminando imagen de Viga - Sección: ${seccionIndex + 1}, Imagen: ${imagenIndex + 1}`);
      this.$store.memoriaCalculo.removeVigaImage(seccionIndex, imagenIndex);
    },

    removeColumnaImage(seccionIndex, imagenIndex) {
      console.log(`🗑️ Eliminando imagen de Columna - Sección: ${seccionIndex + 1}, Imagen: ${imagenIndex + 1}`);
      this.$store.memoriaCalculo.removeColumnaImage(seccionIndex, imagenIndex);
    },

    removeCimentacionImage(seccionIndex, imagenIndex) {
      console.log(`🗑️ Eliminando imagen de Columna - Sección: ${seccionIndex + 1}, Imagen: ${imagenIndex + 1}`);
      this.$store.memoriaCalculo.removeCimentacionImage(seccionIndex, imagenIndex);
    },
    removePlacaImage(seccionIndex, imagenIndex) {
      console.log(`🗑️ Eliminando imagen de Columna - Sección: ${seccionIndex + 1}, Imagen: ${imagenIndex + 1}`);
      this.$store.memoriaCalculo.removePlacaImage(seccionIndex, imagenIndex);
    },
    removePredimImage(seccionIndex, imagenIndex) {
      console.log(`🗑️ Eliminando imagen de Columna - Sección: ${seccionIndex + 1}, Imagen: ${imagenIndex + 1}`);
      this.$store.memoriaCalculo.removePredimImage(seccionIndex, imagenIndex);
    },

    /**
     * Maneja el pegado de imagen en un grupo e índice específico
     * @param {ClipboardEvent} event - Evento del portapapeles
     * @param {string} groupKey - Clave del grupo
     * @param {number} index - Índice
     */
    async handlePaste(event, groupKey, index) {
      event.preventDefault();
      event.stopPropagation();

      // if (document.activeElement !== event.target) {
      //   console.log(`⏭️ Ignorando ${groupKey}[${index}] - no tiene foco`);
      //   return;
      // }

      console.log(`📋 Detectado pegado para ${groupKey}[${index}]`);

      try {
        //USAR event.clipboardData (DATOS INMEDIATOS)
        const items = event.clipboardData?.items;

        if (!items) {
          console.log("No hay items en el portapapeles");
          return;
        }

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          if (item.type.indexOf("image") !== -1) {
            // ✅ Obtener el archivo directamente del evento (SINCRÓNICO)
            const file = item.getAsFile();

            if (file) {
              // Crear nombre único
              const fileName = `pegado_${Date.now()}.png`;
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
                  console.log(`✅ Imagen pegada INSTANTÁNEAMENTE en ${groupKey}[${index}]`);
                },
                (error) => {
                  this.$store.memoriaCalculo.addError("images", error);
                  console.error(`❌ Error al pegar:`, error);
                },
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
     * Elimina una imagen de array
     * @param {string} groupKey - Clave del grupo
     * @param {number} index - Índice
     */
    removeArrayImage(groupKey, index) {
      this.$store.memoriaCalculo.removeArrayImage(groupKey, index);

      switch (groupKey) {
        case "disenoSimientoCorridoImages":
          if (index === 0) {
            this.eliminarImagenCimiento("grafico");
          }
          if (index === 1) {
            this.eliminarImagenCimiento("resultados_sup");
          }
          if (index === 2) {
            this.eliminarImagenCimiento("resultados_inf");
          }
          break;
        case "disenoLosaMacizaImages":
          if (index === 4) {
            this.eliminarImagenLosaMaciza("losa_sup");
          }
          if (index === 5) {
            this.eliminarImagenLosaMaciza("losa_inf");
          }
          localStorage.removeItem("losas-macisas_img");
          console.log("🗑️ Imagen de losa macisa eliminada de localStorage");
          break;
        default:
          console.log(`No hay limpieza de localStorage definida para ${groupKey}`);
      }
    },

    eliminarImagenCimiento(tipo) {
      // tipo puede ser: 'grafico', 'resultados_sup', 'resultados_inf'

      const store = this.$store.memoriaCalculo;

      switch (tipo) {
        case "grafico":
          store.previews.disenoSimientoCorridoImages[0] = null;
          localStorage.removeItem("cimiento_corrido_grafico");
          console.log("🗑️ Gráfico eliminado");
          break;

        case "resultados_sup":
          store.previews.disenoSimientoCorridoImages[1] = null;
          localStorage.removeItem("cimiento_corrido_resultados_sup");
          console.log("🗑️ Resultados (superior) eliminados");
          break;

        case "resultados_inf":
          store.previews.disenoSimientoCorridoImages[2] = null;
          localStorage.removeItem("cimiento_corrido_resultados_inf");
          console.log("🗑️ Resultados (inferior) eliminados");
          break;

        default:
          console.log("Tipo no válido");
      }

      // Actualizar metadatos
      const metadata = JSON.parse(localStorage.getItem("cimiento_corrido_metadata") || "{}");
      metadata.eliminado = metadata.eliminado || [];
      metadata.eliminado.push(tipo);
      metadata.ultimaModificacion = new Date().toISOString();
      localStorage.setItem("cimiento_corrido_metadata", JSON.stringify(metadata));
    },

    eliminarImagenLosaMaciza(tipo) {
      // tipo puede ser: 'grafico', 'resultados_sup', 'resultados_inf'

      const store = this.$store.memoriaCalculo;

      switch (tipo) {
        case "losa_sup":
          store.previews.disenoLosaMacizaImages[4] = null;
          localStorage.removeItem("losa_maciza_resultados_sup");
          console.log("🗑️ Losa macisa superior eliminado");
          break;

        case "losa_inf":
          store.previews.disenoLosaMacizaImages[5] = null;
          localStorage.removeItem("losa_maciza_resultados_inf");
          console.log("🗑️ Losa macisa inferior eliminados");
          break;

        default:
          console.log("Tipo no válido");
      }

      // Actualizar metadatos
      const metadata = JSON.parse(localStorage.getItem("cimiento_corrido_metadata") || "{}");
      metadata.eliminado = metadata.eliminado || [];
      metadata.eliminado.push(tipo);
      metadata.ultimaModificacion = new Date().toISOString();
      localStorage.setItem("cimiento_corrido_metadata", JSON.stringify(metadata));
    },

    // Método para agregar más imágenes a una sección específica
    addMoreImagesToSection(groupKey, seccionIndex) {
      console.log(`➕ Agregando 1 imagen a ${groupKey}, sección ${seccionIndex}`);
      const newIndex = this.$store.memoriaCalculo.addMoreImagesToSection(groupKey, seccionIndex);

      // Forzar actualización de la vista
      this.$nextTick(() => {
        console.log(`✅ Nueva imagen agregada en índice ${newIndex}`);
        // Opcional: hacer scroll al nuevo slot
        setTimeout(() => {
          const newSlot = document.querySelector(`[data-image-slot="${groupKey}-${seccionIndex}-${newIndex}"]`);
          if (newSlot) {
            newSlot.scrollIntoView({ behavior: "smooth", block: "center" });
            newSlot.classList.add("ring-2", "ring-blue-500", "animate-pulse");
            setTimeout(() => {
              newSlot.classList.remove("ring-2", "ring-blue-500", "animate-pulse");
            }, 2000);
          }
        }, 100);
      });
    },

    // Método para eliminar la ÚLTIMA imagen (similar al de agregar)
    removeImagesToSection(groupKey, seccionIndex) {
      console.log(`➖ Eliminando última imagen de ${groupKey}, sección ${seccionIndex}`);

      const store = this.$store.memoriaCalculo;

      // Validar que la sección existe
      if (!store.images[groupKey]?.[seccionIndex]) {
        console.warn(`No existe la sección ${seccionIndex} en ${groupKey}`);
        if (typeof toast !== "undefined") {
          toast.warning("No hay imágenes para eliminar");
        }
        return;
      }

      const currentLength = store.images[groupKey][seccionIndex].length;

      if (currentLength <= 1) {
        if (typeof toast !== "undefined") {
          toast.warning("Debe haber al menos 1 slot por sección");
        } else {
          alert("Debe haber al menos 1 slot por sección");
        }
        return;
      }

      // Confirmar antes de eliminar
      if (confirm(`¿Eliminar la última imagen de la sección ${seccionIndex + 1}?`)) {
        const success = store.removeImagesToSection(groupKey, seccionIndex);

        if (success) {
          console.log(`✅ Última imagen eliminada de sección ${seccionIndex + 1}`);

          // Forzar actualización de la vista
          this.$nextTick(() => {
            console.log(`✅ Vista actualizada después de eliminar imagen`);

            // Opcional: mostrar notificación de éxito
            if (typeof toast !== "undefined") {
              toast.success(`Última imagen eliminada de la sección ${seccionIndex + 1}`);
            }
          });
        }
      }
    },

    /**
     * Maneja el pegado con configuración completa
     * @param {ClipboardEvent} event - Evento del portapapeles
     * @param {string} tipoElemento - Tipo de elemento
     * @param {number} seccionIndex - Índice de la sección
     * @param {number} imagenIndex - Índice de la imagen
     */
    async handlePasteElementoConfig(event, tipoElemento, seccionIndex, imagenIndex) {
      event.preventDefault();
      event.stopPropagation();

      const config = CONFIG_ELEMENTOS[tipoElemento];
      if (!config) {
        console.error(`❌ Tipo de elemento no configurado: ${tipoElemento}`);
        return;
      }

      // if (document.activeElement !== event.target) {
      //   console.log(`⏭️ Ignorando pegado - ${config.nombre}[${seccionIndex + 1}][${imagenIndex + 1}]`);
      //   return;
      // }

      console.log(`📋 Pegando en ${config.nombre} - Sección ${seccionIndex + 1}, Imagen ${imagenIndex + 1}`);

      try {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();

            if (file) {
              const timestamp = Date.now();
              const fileName = `${config.prefijoArchivo}_sec${seccionIndex + 1}_img${imagenIndex + 1}_${timestamp}.png`;
              const renamedFile = new File([file], fileName, { type: file.type });

              const mockEvent = {
                target: {
                  files: [renamedFile],
                },
                type: "change",
              };

              await handleImageChange(
                mockEvent,
                (file, dataUrl) => {
                  // Usar el método configurado
                  this.$store.memoriaCalculo[config.metodoStore](seccionIndex, imagenIndex, file, dataUrl);
                  console.log(`✅ Imagen guardada en ${config.nombre}[${seccionIndex}][${imagenIndex}]`);
                },
                (error) => {
                  this.$store.memoriaCalculo.addError("images", error);
                },
              );

              return;
            }
          }
        }
      } catch (error) {
        console.error(`Error en ${config.nombre}:`, error);
      }
    },

    /**
     * Función unificada para manejar input de archivos de cualquier tipo de elemento
     * @param {string} tipoElemento - Tipo de elemento
     * @param {number} seccionIndex - Índice de la sección
     * @param {number} imagenIndex - Índice de la imagen
     * @param {Event} event - Evento del input file
     */
    async handleElementoImageInput(tipoElemento, seccionIndex, imagenIndex, event) {
      const config = CONFIG_ELEMENTOS[tipoElemento];
      if (!config) {
        console.error(`❌ Tipo de elemento no configurado: ${tipoElemento}`);
        return;
      }

      await handleImageChange(
        event,
        (file, dataUrl) => {
          // Usar el método configurado del store
          this.$store.memoriaCalculo[config.metodoStore](seccionIndex, imagenIndex, file, dataUrl);
          console.log(`✅ Imagen guardada en ${config.nombre}[${seccionIndex + 1}][${imagenIndex + 1}]`);
        },
        (error) => {
          this.$store.memoriaCalculo.addError("images", error);
        },
      );
    },
  };
}
