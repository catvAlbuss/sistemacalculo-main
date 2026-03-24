import { buildContentStructure, DEFAULT_MC_STRUCTURE } from "./content-structure-mc.js";
import { ContentProcessorMC } from "./content-processor-mc.js";
import ubigeoData from "../memoria_calculo/ubigeo.json";

function memoriaCalculo() {
  return {
    cover: {
      title: "MEMORIA DE CÁLCULO",
      subtitle: "ESPECIALIDAD ESTRUCTURA",
      project:
        "VIVIENDA MULTIFAMILIAR EN AV. JUAN VELASCO ALVARADO Nro 1493 Mz A Lt 01 URBANIZACIÓN SAN JUAN II, DISTRITO DE PILLCO MARCA, PROVINCIA Y REGION DE HUANUCO",
      code: "",
      client: "",
      location: "",
      ubigeo: {
        department: "HUANUCO",
        province: "",
        district: "",
      },
      date: new Date().toISOString().split("T")[0],
      preparedBy: "",
      extraLines: [],
      soilFactor: "S2",
      soilPeriod: "Tp",
      seismicZone: "2",
      seismicZoneFactor: "0.25",
      buildingCategory: "C",
      importanceFactorU: "1.00",
      structuralSystemDescription: "Dual, Muros de Concreto Armado",
      soilValue: "1.20",
      soilPeriodValue: "0.6",
      reportType: "CASA", // 'CASA' o 'MODULOS'
    },

    structuralDetails: {
      usage: "",
      structuralSystemX: "Sistema Dual",
      structuralSystemY: "Sistema Dual",
      verticalElements: "Columnas y Placas de Concreto Armado",
      horizontalElements: "Vigas de Concreto Armado",
      roof: "Losa aligerada e=20cm",
      materialDesign: {
        aceroEstructural: {
          fy: "4200",
          e: "2038901.92",
          fc: "",
        },
        aceroCorrugado: {
          fy: "4200",
          e: "2038901.92",
          fc: "",
        },
        concreto: {
          fy: "",
          e: "253456.4",
          fc: "210",
        },
<<<<<<< HEAD

        document: JSON.parse(JSON.stringify(DEFAULT_MC_STRUCTURE.document)),

        images: {
            coverImage: null,
            coverImage2: null,
            floorImages: [],
            materialImage1: null,
            materialImage2: null,
            materialImage3: null,
            modeloMatematico3DImages: [null],
            espectroPseudoaceleracionesImages: [null, null],
            metradoCargasImages: [null, null, null, null],
            cargasAproximadasImages: [null, null, null, null],

            // CREAR NUEVA ENTRADA DE IMAGENES

            estaticoConsideracionesETABS: [null, null],
            estaticoCpesoSismico: [null],

            dinamicoConsideracionesETABS: [null, null],
            dinamicoModosVibracion: [null, null, null],
            dinamicofuerzaCortante: [null],
            dinamicoDesplazamientoPermisible: [null, null, null, null],
            dinamicaDeformadas: [null, null],

            
        },

        previews: {
            coverImage: null,
            coverImage2: null,
            floorImages: [],
            materialImage1: null,
            materialImage2: null,
            materialImage3: null,
            modeloMatematico3DImages: [null],
            espectroPseudoaceleracionesImages: [null, null],
            metradoCargasImages: [null, null, null, null],
            cargasAproximadasImages: [null, null, null, null],

            // ANALISIS SISMICO (SECCION 3)

            //ANALISIS SISMICO ESTATICO
            estaticoConsideracionesETABS: [null, null],
            estaticoCpesoSismico: [null],

        },

        floors: 1,
        errors: [],
        isExporting: false,
        ubigeoData: ubigeoData,

        init() {
            this.updateFloors();
            this.initAnalysisImageSlots();
            this.updateLocation();
            this.updateBuildingCategory();
        },

        get cargasAproximadas() {
            const cm = this.toNumber(this.casoscarga.K5);
            const cv = this.toNumber(this.casoscarga.K10) + this.toNumber(this.casoscarga.K11);
            const velocidad = this.toNumber(this.casoscarga.cargaviento);
            const altura = this.toNumber(this.casoscarga.K17);
            const qz = velocidad > 0 ? (velocidad * velocidad) / 18000 : 0;

            return {
                cm: this.roundNumber(cm),
                cv: this.roundNumber(cv),
                velocidad: this.roundNumber(velocidad),
                altura: this.roundNumber(altura),
                qz: this.roundNumber(qz, 2),
                cwMas1: this.roundNumber(qz * this.toNumber(this.casoscarga.K21) * 100),
                cwMas2: this.roundNumber(qz * this.toNumber(this.casoscarga.K26) * 100),
                cwMenos: this.roundNumber(qz * this.toNumber(this.casoscarga.K32) * 100)
            };
        },

        get departments() {
            return this.ubigeoData.map(d => d.name).sort();
        },

        get provinces() {
            const dept = this.ubigeoData.find(d => d.name === this.cover.ubigeo.department);
            return dept ? dept.provinces.map(p => p.name).sort() : [];
        },

        get districts() {
            const dept = this.ubigeoData.find(d => d.name === this.cover.ubigeo.department);
            if (!dept) return [];
            const prov = dept.provinces.find(p => p.name === this.cover.ubigeo.province);
            return prov ? prov.districts.sort() : [];
        },

        updateLocation() {
            const { department, province, district } = this.cover.ubigeo;
            let loc = "";
            if (department) loc += department;
            if (province) loc += `, ${province}`;
            if (district) loc += `, ${district}`;
            this.cover.location = loc;
        },

        updateFloors() {
            const count = parseInt(this.floors) || 1;
            // Ajustar el tamaÃ±o del array de imÃ¡genes manteniendo las existentes
            while (this.images.floorImages.length < count) {
                this.images.floorImages.push(null);
                this.previews.floorImages.push(null);
            }
            if (this.images.floorImages.length > count) {
                this.images.floorImages = this.images.floorImages.slice(0, count);
                this.previews.floorImages = this.previews.floorImages.slice(0, count);
            }
        },

        initAnalysisImageSlots() {
            if (!Array.isArray(this.images.modeloMatematico3DImages)) this.images.modeloMatematico3DImages = [];
            if (!Array.isArray(this.previews.modeloMatematico3DImages)) this.previews.modeloMatematico3DImages = [];
            if (!Array.isArray(this.images.espectroPseudoaceleracionesImages)) this.images.espectroPseudoaceleracionesImages = [];
            if (!Array.isArray(this.previews.espectroPseudoaceleracionesImages)) this.previews.espectroPseudoaceleracionesImages = [];
            if (!Array.isArray(this.images.metradoCargasImages)) this.images.metradoCargasImages = [];
            if (!Array.isArray(this.previews.metradoCargasImages)) this.previews.metradoCargasImages = [];
            if (!Array.isArray(this.images.cargasAproximadasImages)) this.images.cargasAproximadasImages = [];
            if (!Array.isArray(this.previews.cargasAproximadasImages)) this.previews.cargasAproximadasImages = [];
            // ANALISIS SISMICO (SECCION 3)
            // 3.1 ANALISIS SISMICO ESTATICO 
            if (!Array.isArray(this.images.estaticoConsideracionesETABS))this.images.estaticoConsideracionesETABS=[];
            if (!Array.isArray(this.previews.estaticoConsideracionesETABS))this.previews.estaticoConsideracionesETABS=[];

            if (!Array.isArray(this.images.estaticoCpesoSismico))this.images.estaticoCpesoSismico=[];
            if (!Array.isArray(this.previews.estaticoCpesoSismico))this.previews.estaticoCpesoSismico=[];


            while (this.images.modeloMatematico3DImages.length < 1) this.images.modeloMatematico3DImages.push(null);
            while (this.previews.modeloMatematico3DImages.length < 1) this.previews.modeloMatematico3DImages.push(null);
            while (this.images.espectroPseudoaceleracionesImages.length < 2) this.images.espectroPseudoaceleracionesImages.push(null);
            while (this.previews.espectroPseudoaceleracionesImages.length < 2) this.previews.espectroPseudoaceleracionesImages.push(null);
            while (this.images.metradoCargasImages.length < 4) this.images.metradoCargasImages.push(null);
            while (this.previews.metradoCargasImages.length < 4) this.previews.metradoCargasImages.push(null);
            while (this.images.cargasAproximadasImages.length < 4) this.images.cargasAproximadasImages.push(null);
            while (this.previews.cargasAproximadasImages.length < 4) this.previews.cargasAproximadasImages.push(null);
            // ANALISIS SISMICO (SECCION 3)
            // 3.1 ANALISIS SISMICO ESTATICO
            while(this.images.estaticoConsideracionesETABS.length<4)this.images.estaticoConsideracionesETABS.push(null);
            while(this.previews.estaticoConsideracionesETABS.length<4)this.previews.estaticoConsideracionesETABS.push(null);

            while(this.images.estaticoCpesoSismico.length<1)this.images.estaticoCpesoSismico.push(null);
            while(this.previews.estaticoCpesoSismico.length<1)this.previews.estaticoCpesoSismico.push(null);

            this.images.modeloMatematico3DImages = this.images.modeloMatematico3DImages.slice(0, 1);
            this.previews.modeloMatematico3DImages = this.previews.modeloMatematico3DImages.slice(0, 1);
            this.images.espectroPseudoaceleracionesImages = this.images.espectroPseudoaceleracionesImages.slice(0, 2);
            this.previews.espectroPseudoaceleracionesImages = this.previews.espectroPseudoaceleracionesImages.slice(0, 2);
            this.images.metradoCargasImages = this.images.metradoCargasImages.slice(0, 4);
            this.previews.metradoCargasImages = this.previews.metradoCargasImages.slice(0, 4);
            this.images.cargasAproximadasImages = this.images.cargasAproximadasImages.slice(0, 4);
            this.previews.cargasAproximadasImages = this.previews.cargasAproximadasImages.slice(0, 4);
        },

        updateBuildingCategory() {
            const factorByCategory = {
                A: "1.50",
                B: "1.30",
                C: "1.00",
                D: "Ver Nota 2"
            };
            const category = String(this.cover.buildingCategory || "").toUpperCase();
            this.cover.buildingCategory = Object.prototype.hasOwnProperty.call(factorByCategory, category) ? category : "C";
            this.cover.importanceFactorU = factorByCategory[this.cover.buildingCategory];
        },

        addSection(level = 1) {
            const id = `section_${Date.now()}`;
            this.document.sections.push({
                id,
                title: level === 1 ? "NUEVA SECCIÃ“N" : "NUEVA SUBSECCIÃ“N",
                level,
                content: []
            });
        },

        removeSection(index) {
            this.document.sections.splice(index, 1);
        },

        addContentItem(sectionIndex, type) {
            const section = this.document.sections[sectionIndex];
            let item = { type };

            if (type === 'paragraph' || type === 'heading') {
                item.text = "";
                item.alignment = "JUSTIFIED";
                if (type === 'heading') item.level = section.level + 1;
            } else if (type === 'list') {
                item.listType = "bullet";
                item.items = [""];
            } else if (type === 'image') {
                item.src = null;
                item.width = 500;
                item.height = 480;
            } else if (type === 'table') {
                item.columns = [{ header: "Col 1", width: 50 }, { header: "Col 2", width: 50 }];
                item.rows = [["", ""]];
            }

            section.content.push(item);
        },

        removeContentItem(sectionIndex, itemIndex) {
            this.document.sections[sectionIndex].content.splice(itemIndex, 1);
        },

        addListItem(sectionIndex, itemIndex) {
            this.document.sections[sectionIndex].content[itemIndex].items.push("");
        },

        removeListItem(sectionIndex, itemIndex, listItemIndex) {
            this.document.sections[sectionIndex].content[itemIndex].items.splice(listItemIndex, 1);
        },

        addExtraLine() {
            this.cover.extraLines.push({
                text: "",
                alignment: "CENTER",
                bold: false,
                italic: false
            });
        },

        removeExtraLine(index) {
            this.cover.extraLines.splice(index, 1);
        },

        async handleImageChange(key, event) {
            const file = event.target.files?.[0] || null;
            if (!file) return;
            this.images[key] = file;
            this.previews[key] = await this.readFileAsDataURL(file);
        },

        removeImage(key) {
            this.images[key] = null;
            this.previews[key] = null;
        },

        async handleContentImageChange(sectionIndex, itemIndex, event) {
            const file = event.target.files?.[0] || null;
            if (!file) return;
            const dataUrl = await this.readFileAsDataURL(file);
            this.document.sections[sectionIndex].content[itemIndex].src = dataUrl;
        },

        handleFloorImageChange(index, event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.images.floorImages[index] = file;
                this.previews.floorImages[index] = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        removeFloorImage(index) {
            this.images.floorImages[index] = null;
            this.previews.floorImages[index] = null;
        },

        handleMaterialImageChange(index, event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!Array.isArray(this.images.materialImages)) this.images.materialImages = [];
            if (!Array.isArray(this.previews.materialImages)) this.previews.materialImages = [];

            const reader = new FileReader();
            reader.onload = (e) => {
                this.images.materialImages[index] = file;
                this.previews.materialImages[index] = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        removeMaterialImage(index) {
            if (Array.isArray(this.images.materialImages)) this.images.materialImages[index] = null;
            if (Array.isArray(this.previews.materialImages)) this.previews.materialImages[index] = null;
        },

        handleAnalisisImageChange(key, event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.images[key] = file;
                this.previews[key] = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        removeAnalisisImage(key) {
            this.images[key] = null;
            this.previews[key] = null;
        },

        async handleArrayImageChange(groupKey, index, event) {
            const file = event.target.files?.[0] || null;
            if (!file) return;
            const dataUrl = await this.readFileAsDataURL(file);

            if (!Array.isArray(this.images[groupKey])) this.images[groupKey] = [];
            if (!Array.isArray(this.previews[groupKey])) this.previews[groupKey] = [];

            this.images[groupKey][index] = file;
            this.previews[groupKey][index] = dataUrl;
        },

        removeArrayImage(groupKey, index) {
            if (Array.isArray(this.images[groupKey])) this.images[groupKey][index] = null;
            if (Array.isArray(this.previews[groupKey])) this.previews[groupKey][index] = null;
        },

        toNumber(value) {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : 0;
        },

        roundNumber(value, decimals = 0) {
            const factor = Math.pow(10, decimals);
            return Math.round((this.toNumber(value) + Number.EPSILON) * factor) / factor;
        },

        findNextHeadingIndex(content, startIndex) {
            let current = startIndex + 1;
            while (current < content.length) {
                const item = content[current];
                if (item?.type === "heading" && item?.level === 2) break;
                current++;
            }
            return current;
        },

        getInternalVientoMapaImage() {
            // Retorna la ruta a la imagen local del mapa de viento
            return "/assets/img/memoriacalculos/cargaviento.png";
        },

        getInternalFactoresFormaImage() {
            // Retorna la ruta a la imagen local de factores de forma
            return "/assets/img/memoriacalculos/factoresforma.png";
        },

        async exportWord() {
            try {
                console.log("ðŸš€ Iniciando exportWord...");
                this.isExporting = true;
                this.errors = [];

                console.log("ðŸ“¦ LibrerÃ­as detectadas:", {
                    docx: !!window.docx,
                    saveAs: !!window.saveAs,
                    windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('docx'))
                });

                if (!window.docx) {
                    this.addError("libs", "La librerÃ­a 'docx' no se ha cargado correctamente desde el servidor externo.");
                    return;
                }

                if (!window.saveAs) {
                    this.addError("libs", "La librerÃ­a 'FileSaver' (saveAs) no estÃ¡ disponible.");
                    return;
                }

                const structure = buildContentStructure({
                    cover: this.cover,
                    document: this.document
                });

                // --- 1. UBICACIÃ“N DINÃMICA (SecciÃ³n 1.2) ---
                const generalidades = structure.document.sections.find(s => s.id === "generalidades");
                if (generalidades) {
                    const idx12 = generalidades.content.findIndex(item =>
                        item.type === "heading" && String(item.text || "").startsWith("1.2.")
                    );

                    if (idx12 !== -1) {
                        // Encontrar la imagen estÃ¡tica que sigue al encabezado 1.2 o al pÃ¡rrafo siguiente
                        const imgIdx = generalidades.content.findIndex((item, i) => i > idx12 && item.type === "image");

                        if (imgIdx !== -1) {
                            // Generar la tabla de ubicaciÃ³n
                            const deptName = this.cover.ubigeo.department || "HUANUCO";
                            const provName = this.cover.ubigeo.province || "HUANUCO";
                            const distSelected = this.cover.ubigeo.district || "";

                            // Obtener distritos de la provincia actual
                            const deptData = this.ubigeoData.find(d => d.name === deptName);
                            const provData = deptData?.provinces.find(p => p.name === provName);
                            const districtsList = provData && Array.isArray(provData.districts) && provData.districts.length > 0
                                ? provData.districts
                                : [distSelected || "NO DEFINIDO"];

                            const tableRows = [];
                            districtsList.forEach((district, index) => {
                                const row = [];

                                // RegiÃ³n (Merged)
                                if (index === 0) {
                                    row.push({ text: deptName, rowSpan: districtsList.length, bold: true });
                                } else {
                                    row.push({ text: "" }); // Placeholder para merge
                                }

                                // Provincia (Merged)
                                if (index === 0) {
                                    row.push({ text: provName, rowSpan: districtsList.length, bold: true });
                                } else {
                                    row.push({ text: "" }); // Placeholder para merge
                                }

                                // Distrito (Coloreado)
                                row.push({
                                    text: district,
                                    color: district === distSelected ? "FF0000" : "000000",
                                    bold: district === distSelected,
                                    alignment: "LEFT"
                                });

                                // Zona SÃ­smica (Merged)
                                if (index === 0) {
                                    row.push({ text: "2", rowSpan: districtsList.length, bold: true, size: 24 });
                                } else {
                                    row.push({ text: "" }); // Placeholder para merge
                                }

                                // Ãmbito (Merged)
                                if (index === 0) {
                                    row.push({ text: "TODOS LOS DISTRITOS", rowSpan: districtsList.length, size: 16 });
                                } else {
                                    row.push({ text: "" }); // Placeholder para merge
                                }

                                tableRows.push(row);
                            });

                            // Reemplazar la imagen por la tabla
                            generalidades.content.splice(imgIdx, 1, {
                                type: "table",
                                widthPercent: 95,
                                indentSize: 500,
                                columns: [
                                    { header: "REGIÃ“N\n(DPTO.)", width: 20 },
                                    { header: "PROVINCIA", width: 25 },
                                    { header: "DISTRITO", width: 25 },
                                    { header: "ZONA\nSÃSMICA", width: 10 },
                                    { header: "ÃMBITO", width: 20 }
                                ],
                                rows: tableRows
                            });
                        }
                    }

                    // --- 2. IMÃGENES POR PISO (SecciÃ³n 1.4) ---
                    const idx14 = generalidades.content.findIndex(item =>
                        item.type === "heading" && String(item.text || "").startsWith("1.4.")
                    );

                    if (idx14 !== -1) {
                        const insertPos = idx14 + 2;
                        let currentInsertPos = insertPos;

                        this.previews.floorImages.forEach((imgData, i) => {
                            if (imgData) {
                                generalidades.content.splice(currentInsertPos++, 0, {
                                    type: "image",
                                    src: imgData,
                                    alignment: "CENTER",
                                    width: 500,
                                    height: 480,
                                    caption: `Esquema general en planta ${i + 1}Â°nivel`,
                                    pageBreakBefore: true,
                                    verticalCenter: true
                                });
                            }
                        });

                        const tableRows = [
                            ["USO", this.structuralDetails.usage || "Residencial"],
                            ["#pisos", `${this.floors} pisos`],
                            ["Sistema estructural en X", this.structuralDetails.structuralSystemX],
                            ["Sistema estructural en Y", this.structuralDetails.structuralSystemY],
                            ["Elementos verticales", this.structuralDetails.verticalElements],
                            ["Elementos horizontales", this.structuralDetails.horizontalElements],
                            ["Techo", this.structuralDetails.roof]
                        ];

                        generalidades.content.splice(currentInsertPos, 0, {
                            type: "table",
                            title: "RESUMEN ESTRUCTURAL",
                            columns: [
                                { header: "PARÃMETRO", width: 20 },
                                { header: "DESCRIPCIÃ“N", width: 80 }
                            ],
                            rows: tableRows
                        });
                    }
                    const selectedSoilFactor = (this.cover.soilFactor || "S2").toUpperCase();
                    const selectedPeriod = this.cover.soilPeriod === "Tl" ? "Tl" : "Tp";
                    const zoneFactorMap = {
                        "1": "0.10",
                        "2": "0.25",
                        "3": "0.35",
                        "4": "0.45"
                    };
                    const getProjectZone = () => {
                        const zone = String(this.cover.seismicZone || "").trim();
                        return Object.prototype.hasOwnProperty.call(zoneFactorMap, zone) ? zone : "2";
                    };
                    const projectZone = getProjectZone();
                    const projectZFactor = zoneFactorMap[projectZone];
                    this.cover.seismicZone = projectZone;
                    this.cover.seismicZoneFactor = projectZFactor;

                    // --- 3. ZONIFICACIÃ“N SÃSMICA (SecciÃ³n 1.3.1) ---
                    const idx131 = generalidades.content.findIndex(item =>
                        item.type === "heading" && String(item.text || "").startsWith("1.3.1.")
                    );

                    if (idx131 !== -1) {
                        // Encontrar la imagen del mapa que suele seguir
                        const mapImgIdx = generalidades.content.findIndex((item, i) => i > idx131 && item.type === "image");

                        if (mapImgIdx !== -1) {
                            const deptName = this.cover.ubigeo.department || "HUANUCO";
                            const provName = this.cover.ubigeo.province || "HUANUCO";
                            const distName = this.cover.ubigeo.district || "PILLCO MARCA";

                            // Datos de la tabla de factores Z (Norma E.030)
                            const zFactors = [
                                { zone: "4", z: zoneFactorMap["4"] },
                                { zone: "3", z: zoneFactorMap["3"] },
                                { zone: "2", z: zoneFactorMap["2"] },
                                { zone: "1", z: zoneFactorMap["1"] }
                            ];

                            const zTableRows = zFactors.map(f => [
                                {
                                    text: f.zone,
                                    fill: f.zone === projectZone ? "00B0F0" : null, // Celeste/Azul como en la imagen
                                    color: f.zone === projectZone ? "FFFFFF" : "000000",
                                    bold: f.zone === projectZone
                                },
                                {
                                    text: f.z,
                                    fill: f.zone === projectZone ? "00B0F0" : null,
                                    color: f.zone === projectZone ? "FFFFFF" : "000000",
                                    bold: f.zone === projectZone
                                }
                            ]);

                            // Crear la estructura "mezclada" usando una tabla invisible de 2 columnas
                            const layoutTable = {
                                type: "table",
                                widthPercent: 100,
                                indentSize: 0,
                                noBorders: true, // Necesitamos soporte para tablas sin bordes en el procesador
                                columns: [
                                    { width: 55 }, // Columna para el mapa
                                    { width: 45 }  // Columna para info + tabla Z
                                ],
                                rows: [
                                    [
                                        // Celda Izquierda: Mapa
                                        {
                                            type: "image",
                                            src: "/assets/img/memoriacalculos/mapazonificacion.png",
                                            width: 320,
                                            height: 380,
                                            alignment: "CENTER"
                                        },
                                        // Celda Derecha: Info UbicaciÃ³n + Tabla Z
                                        {
                                            stack: [
                                                // Bloque de UbicaciÃ³n
                                                {
                                                    text: `DEPARTAMENTO: ${deptName}\nPROVINCIA: ${provName}\nDISTRITO: ${distName}`,
                                                    bold: true,
                                                    size: 16,
                                                    alignment: "LEFT",
                                                    spacing: { after: 200 }
                                                },
                                                // Mini Tabla de Factores Z
                                                {
                                                    type: "table",
                                                    title: "Tabla NÂ°6\nFACTORES DE ZONA 'Z'",
                                                    widthPercent: 90,
                                                    columns: [
                                                        { header: "ZONA", width: 50 },
                                                        { header: "Z", width: 50 }
                                                    ],
                                                    rows: zTableRows
                                                }
                                            ]
                                        }
                                    ]
                                ]
                            };

                            const idx131Paragraph = generalidades.content.findIndex((item, i) =>
                                i > idx131 && item.type === "paragraph"
                            );
                            if (idx131Paragraph !== -1) {
                                generalidades.content[idx131Paragraph] = {
                                    type: "paragraph",
                                    text: `De acuerdo con el mapa del Reglamento Nacional de Edificaciones-Norma E.030, el Ã¡rea de estudio se localiza en la zona ${projectZone}, correspondiÃ©ndole un factor de Z=${projectZFactor}.`,
                                    alignment: "JUSTIFIED"
                                };
                            }

                            // Reemplazar la imagen simple por este nuevo layout
                            generalidades.content.splice(mapImgIdx, 1, layoutTable);
                        }
                    }

                    // --- 4. PARÃMETROS DE SUELO (SecciÃ³n 1.3.2) ---
                    const idx132 = generalidades.content.findIndex(item =>
                        item.type === "heading" && String(item.text || "").startsWith("1.3.2.")
                    );

                    if (idx132 !== -1) {
                        const zoneLabels = { "4": "Z4", "3": "Z3", "2": "Z2", "1": "Z1" };
                        const currentZoneLabel = zoneLabels[projectZone] || "Z2";
                        const selectedS = ["S0", "S1", "S2", "S3"].includes(selectedSoilFactor) ? selectedSoilFactor : "S2";
                        const selectedT = selectedPeriod;

                        const soilFactorMatrix = {
                            Z4: { S0: "0.80", S1: "1.00", S2: "1.05", S3: "1.10" },
                            Z3: { S0: "0.80", S1: "1.00", S2: "1.15", S3: "1.20" },
                            Z2: { S0: "0.80", S1: "1.00", S2: "1.20", S3: "1.40" },
                            Z1: { S0: "0.80", S1: "1.00", S2: "1.60", S3: "2.00" }
                        };
                        const periodMatrix = {
                            Tp: { S0: "0.3", S1: "0.4", S2: "0.6", S3: "1.0" },
                            Tl: { S0: "3.0", S1: "2.5", S2: "2.0", S3: "1.6" }
                        };

                        const selectedSValue = soilFactorMatrix[currentZoneLabel][selectedS];
                        const selectedTValue = periodMatrix[selectedT][selectedS];
                        const lightRed = "FDE2E2";
                        const hardRed = "C00000";

                        // Valores para texto dinÃ¡mico con placeholders en content-structure-mc.js
                        this.cover.seismicZone = projectZone;
                        this.cover.soilFactor = selectedS;
                        this.cover.soilPeriod = selectedT;
                        this.cover.soilValue = selectedSValue;
                        this.cover.soilPeriodValue = selectedTValue;

                        const idx132Paragraph = generalidades.content.findIndex((item, i) =>
                            i > idx132 && item.type === "paragraph"
                        );
                        if (idx132Paragraph !== -1) {
                            generalidades.content[idx132Paragraph] = {
                                type: "paragraph",
                                text: `Para efectos de la aplicaciÃ³n de la norma E-0.30 de diseÃ±o sismo-resistente, se adopta el perfil de suelo ${selectedS}. Para la zona ${projectZone}, el factor de suelo correspondiente es ${selectedSValue}. Asimismo, para el periodo seleccionado ${selectedT}, el valor correspondiente es ${selectedTValue}s segÃºn la Tabla NÂ°4. Los valores de S, Tp y Tl se muestran en las Tablas NÂ°3 y NÂ°4 (NORMA E-030 - DISEÃ‘O SISMORESISTENTE).`,
                                alignment: "JUSTIFIED"
                            };
                        }

                        const factorTableRows = ["Z4", "Z3", "Z2", "Z1"].map(zone => [
                            {
                                text: zone,
                                fill: zone === currentZoneLabel ? lightRed : null,
                                color: zone === currentZoneLabel ? hardRed : "000000",
                                bold: zone === currentZoneLabel
                            },
                            ...["S0", "S1", "S2", "S3"].map(sKey => {
                                const isRow = zone === currentZoneLabel;
                                const isCol = sKey === selectedS;
                                const isIntersection = isRow && isCol;
                                return {
                                    text: soilFactorMatrix[zone][sKey],
                                    fill: isIntersection ? hardRed : (isRow || isCol ? lightRed : null),
                                    color: isIntersection ? "FFFFFF" : (isRow || isCol ? hardRed : "000000"),
                                    bold: isIntersection || isRow || isCol
                                };
                            })
                        ]);

                        const periodTableRows = ["Tp", "Tl"].map(periodKey => [
                            {
                                text: periodKey === "Tp" ? "Tp(s)" : "Tl(s)",
                                fill: periodKey === selectedT ? lightRed : null,
                                color: periodKey === selectedT ? hardRed : "000000",
                                bold: periodKey === selectedT
                            },
                            ...["S0", "S1", "S2", "S3"].map(sKey => {
                                const isRow = periodKey === selectedT;
                                const isCol = sKey === selectedS;
                                const isIntersection = isRow && isCol;
                                return {
                                    text: periodMatrix[periodKey][sKey],
                                    fill: isIntersection ? hardRed : (isRow || isCol ? lightRed : null),
                                    color: isIntersection ? "FFFFFF" : (isRow || isCol ? hardRed : "000000"),
                                    bold: isIntersection || isRow || isCol
                                };
                            })
                        ]);

                        const factorTable = {
                            type: "table",
                            title: "Tabla NÂ° 3\nFACTOR DE SUELO \"S\"",
                            widthPercent: 90,
                            indentSize: 500,
                            columns: [
                                { header: "ZONA / SUELO", width: 22 },
                                { header: "S0", width: 19.5, fill: selectedS === "S0" ? lightRed : null, color: selectedS === "S0" ? hardRed : "000000" },
                                { header: "S1", width: 19.5, fill: selectedS === "S1" ? lightRed : null, color: selectedS === "S1" ? hardRed : "000000" },
                                { header: "S2", width: 19.5, fill: selectedS === "S2" ? lightRed : null, color: selectedS === "S2" ? hardRed : "000000" },
                                { header: "S3", width: 19.5, fill: selectedS === "S3" ? lightRed : null, color: selectedS === "S3" ? hardRed : "000000" }
                            ],
                            rows: factorTableRows
                        };

                        const periodTable = {
                            type: "table",
                            title: "Tabla NÂ° 4\nPERÃODOS \"Tp\" Y \"TL\"",
                            widthPercent: 90,
                            indentSize: 500,
                            columns: [
                                { header: "Perfil de suelo", width: 22 },
                                { header: "S0", width: 19.5, fill: selectedS === "S0" ? lightRed : null, color: selectedS === "S0" ? hardRed : "000000" },
                                { header: "S1", width: 19.5, fill: selectedS === "S1" ? lightRed : null, color: selectedS === "S1" ? hardRed : "000000" },
                                { header: "S2", width: 19.5, fill: selectedS === "S2" ? lightRed : null, color: selectedS === "S2" ? hardRed : "000000" },
                                { header: "S3", width: 19.5, fill: selectedS === "S3" ? lightRed : null, color: selectedS === "S3" ? hardRed : "000000" }
                            ],
                            rows: periodTableRows
                        };

                        const firstSoilImageIdx = generalidades.content.findIndex((item, i) =>
                            i > idx132 && item.type === "image" && item.src === "/assets/img/memoriacalculos/factorsuelo.png"
                        );
                        const secondSoilImageIdx = generalidades.content.findIndex((item, i) =>
                            i > idx132 && item.type === "image" && item.src === "/assets/img/memoriacalculos/periodos.png"
                        );

                        if (firstSoilImageIdx !== -1) {
                            generalidades.content.splice(firstSoilImageIdx, 1, factorTable);
                        }
                        if (secondSoilImageIdx !== -1) {
                            generalidades.content.splice(secondSoilImageIdx, 1, periodTable);
                        }
                    }

                    // --- 5. CATEGORÃAS DE LAS EDIFICACIONES (SecciÃ³n 1.3.4) ---
                    const idx134 = generalidades.content.findIndex(item =>
                        item.type === "heading" && String(item.text || "").startsWith("1.3.4.")
                    );

                    if (idx134 !== -1) {
                        this.updateBuildingCategory();
                        const category = this.cover.buildingCategory;
                        const factorU = this.cover.importanceFactorU;

                        const categoryDetails = {
                            A: {
                                title: "A - Edificaciones Esenciales",
                                description: "Establecimientos de salud del segundo y tercer nivel; puertos, aeropuertos, centrales de comunicaciones, estaciones de bomberos, cuarteles de fuerzas armadas y policÃ­a; instalaciones de generaciÃ³n y transformaciÃ³n elÃ©ctrica; reservorios y plantas de tratamiento de agua; locales con funciÃ³n de refugio, instituciones educativas e instalaciones cuyo colapso implique riesgo adicional."
                            },
                            B: {
                                title: "B - Edificaciones Importantes",
                                description: "Edificaciones donde se reÃºnen gran cantidad de personas: cines, teatros, estadios, coliseos, centros comerciales, terminales de pasajeros, establecimientos penitenciarios y edificaciones que guardan patrimonio valioso (museos y bibliotecas). TambiÃ©n incluye depÃ³sitos de granos y almacenes importantes para el abastecimiento."
                            },
                            C: {
                                title: "C - Edificaciones Comunes",
                                description: "Edificaciones comunes como viviendas, oficinas, hoteles, restaurantes, depÃ³sitos e instalaciones industriales cuyo fallo no acarree peligros adicionales de incendios o fugas de contaminantes."
                            },
                            D: {
                                title: "D - Edificaciones Temporales",
                                description: "Construcciones provisionales para depÃ³sitos, casetas y otras instalaciones similares."
                            }
                        };

                        const selectedCategoryDetail = categoryDetails[category] || categoryDetails.C;

                        const idx134Paragraph = generalidades.content.findIndex((item, i) =>
                            i > idx134 && item.type === "paragraph"
                        );
                        if (idx134Paragraph !== -1) {
                            const factorText = category === "D" ? "Ver Nota 2" : factorU;
                            generalidades.content[idx134Paragraph] = {
                                type: "paragraph",
                                text: `Cada estructura debe ser clasificada de acuerdo con la categorÃ­a de uso. Para la categorÃ­a ${category}, corresponde el factor de importancia U = ${factorText}.`,
                                alignment: "JUSTIFIED"
                            };
                        }

                        const categoryImageIdx = generalidades.content.findIndex((item, i) =>
                            i > idx134 && item.type === "image" && item.src === "/assets/img/memoriacalculos/categoriaEdificaciones.png"
                        );

                        if (categoryImageIdx !== -1) {
                            const categoryTable = {
                                type: "table",
                                title: "CATEGORÃA DE LAS EDIFICACIONES",
                                widthPercent: 95,
                                indentSize: 250,
                                columns: [
                                    { header: "CATEGORÃA", width: 20 },
                                    { header: "DESCRIPCIÃ“N", width: 65 },
                                    { header: "FACTOR U", width: 15 }
                                ],
                                rows: [[
                                    { text: selectedCategoryDetail.title, bold: true },
                                    { text: selectedCategoryDetail.description, alignment: "LEFT" },
                                    {
                                        text: category === "D" ? "Ver Nota 2" : factorU,
                                        bold: true,
                                        alignment: "CENTER"
                                    }
                                ]]
                            };

                            generalidades.content.splice(categoryImageIdx, 1, categoryTable);
                        }
                    }
                }

                if (generalidades) {
                    const idx15 = generalidades.content.findIndex(item =>
                        item.type === "heading" && String(item.text || "").startsWith("1.5.")
                    );

                    if (idx15 !== -1) {
                        const endPos15 = this.findNextHeadingIndex(generalidades.content, idx15);
                        const materialInputs = this.structuralDetails.materialDesign || {};

                        const aceroEstructural = materialInputs.aceroEstructural || {};
                        const aceroCorrugado = materialInputs.aceroCorrugado || {};
                        const concreto = materialInputs.concreto || {};

                        const materialBlocks = [
                            {
                                type: "paragraph",
                                text: "Se consideraron las siguientes caracteristicas de los materiales que conforman esta estructura",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "paragraph",
                                text: "Acero estructural (ASTM A36)",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "list",
                                listType: "bullet",
                                items: [
                                    `Fluencia: fy = ${aceroEstructural.fy || "-"} kg/cm2, Grado 60`,
                                    `Modulo de elasticidad: E = ${aceroEstructural.e || "-"} kg/cm2`,
                                    `Resistencia nominal: f'c = ${aceroEstructural.fc || "-"} kg/cm2`
                                ]
                            },
                            {
                                type: "paragraph",
                                text: "Acero corrugado (ASTM A605)",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "list",
                                listType: "bullet",
                                items: [
                                    `Fluencia: fy = ${aceroCorrugado.fy || "-"} kg/cm2, Grado 60`,
                                    `Modulo de elasticidad: E = ${aceroCorrugado.e || "-"} kg/cm2`,
                                    `Resistencia nominal: f'c = ${aceroCorrugado.fc || "-"} kg/cm2`
                                ]
                            },
                            {
                                type: "paragraph",
                                text: "Concreto",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "list",
                                listType: "bullet",
                                items: [
                                    `Resistencia nominal: f'c = ${concreto.fc || "-"} kg/cm2`,
                                    `Modulo de elasticidad: E = ${concreto.e || "-"} kg/cm2`,
                                    `Fluencia: fy = ${concreto.fy || "-"} kg/cm2`
                                ]
                            }
                        ];

                        if (this.previews.materialImage1) {
                            materialBlocks.push({
                                type: "image",
                                src: this.previews.materialImage1,
                                alignment: "CENTER",
                                width: 500,
                                height: 260,
                                caption: "figura 11-Propiedad de refuerzo fy=4200 kg/cm2"
                            });
                        }

                        if (this.previews.materialImage2) {
                            materialBlocks.push({
                                type: "image",
                                src: this.previews.materialImage2,
                                alignment: "CENTER",
                                width: 500,
                                height: 260,
                                caption: "figura 12-Propiedad del concreto f'c=210kg/cm2"
                            });
                        }

                        const descripcionGeneral = String(this.structuralDetails.generalDescription || "").trim();
                        if (descripcionGeneral) {
                            materialBlocks.push({
                                type: "paragraph",
                                text: descripcionGeneral,
                                alignment: "JUSTIFIED"
                            });
                        }

                        if (this.previews.materialImage3) {
                            materialBlocks.push({
                                type: "image",
                                src: this.previews.materialImage3,
                                alignment: "CENTER",
                                width: 500,
                                height: 260,
                                caption: "figura 13-Propiedades del acero"
                            });
                        }

                        generalidades.content.splice(idx15 + 1, endPos15 - (idx15 + 1), ...materialBlocks);
                    }
                }

                const analisisCargas = structure.document.sections.find(s => s.id === "analisis_cargas");
                if (analisisCargas) {
                    const modelo3DImages = (this.previews.modeloMatematico3DImages || []).filter(Boolean);
                    const espectroImages = (this.previews.espectroPseudoaceleracionesImages || []).filter(Boolean);
                    const metradoImages = (this.previews.metradoCargasImages || []).filter(Boolean);
                    const vientoMapaImage = this.getInternalVientoMapaImage();
                    const factoresFormaImage = this.getInternalFactoresFormaImage();
                    const cargasAproximadasImages = (this.previews.cargasAproximadasImages || []).filter(Boolean);

                    const idx21 = analisisCargas.content.findIndex(item =>
                        item.type === "heading" && item.text === "2.1 MODELO ESTRUCTURAL"
                    );
                    if (idx21 !== -1 && modelo3DImages.length > 0) {
                        const insertPos21 = this.findNextHeadingIndex(analisisCargas.content, idx21);
                        const imageBlocks21 = modelo3DImages.map((src) => ({
                            type: "image",
                            src,
                            alignment: "CENTER",
                            width: 500,
                            height: 280,
                            caption: "Figura 14-Modelo matemático en 3D"
                        }));
                        analisisCargas.content.splice(insertPos21, 0, ...imageBlocks21);
                    }

                    const idx22 = analisisCargas.content.findIndex(item =>
                        item.type === "heading" && item.text === "2.2 CASOS DE CARGA"
                    );
                    if (idx22 !== -1 && espectroImages.length > 0) {
                        const insertPos22 = this.findNextHeadingIndex(analisisCargas.content, idx22);
                        const espectroCaptions = [
                            "Figura 15-Espectro de Pseudoaceleraciones en dirección X",
                            "Figura 16-Espectro de Pseudoaceleraciones en dirección Y"
                        ];
                        const imageBlocks22 = espectroImages.map((src, idx) => ({
                            type: "image",
                            src,
                            alignment: "CENTER",
                            width: 500,
                            height: 280,
                            caption: espectroCaptions[idx] || `Figura espectro ${idx + 1}`
                        }));
                        analisisCargas.content.splice(insertPos22, 0, ...imageBlocks22);
                    }

                    const idx24 = analisisCargas.content.findIndex(item =>
                        item.type === "heading" && String(item.text || "").startsWith("2.4")
                    );
                    if (idx24 !== -1) {
                        let insertPos24 = this.findNextHeadingIndex(analisisCargas.content, idx24);
                        const ca = this.cargasAproximadas;
                        const vientoTexto = this.casoscarga.cargaviento || "-";
                        const metradoCaptions = [
                            "Figura 18-Cargas muertas por metro cuadrado (tonf/m2)",
                            "Figura 19-Carga viva entrepiso por metro cuadrado (tonf/m2)",
                            "Figura 20-Carga viva techo por metro cuadrado (tonf/m2)",
                            "Figura 21-Carga muerta por metro lineal debido a tabiquería (tonf/m)"
                        ];
                        const cargasAproximadasCaptions = [
                            "Figura 22-Cargas muertas por metro cuadrado (kgf/m2)",
                            "Figura 23-Cargas viva techo metro cuadrado (kgf/m2)",
                            "Figura 24-Cargas viva viento positivo(kgf/m2)",
                            "Figura 25-Cargas viva viento negativo(kgf/m2)"
                        ];

                        if (metradoImages.length > 0) {
                            const imageBlocks24 = metradoImages.map((src, idx) => ({
                                type: "image",
                                src,
                                alignment: "CENTER",
                                width: 500,
                                height: 260,
                                caption: metradoCaptions[idx] || `Metrado de cargas ${idx + 1}`
                            }));
                            analisisCargas.content.splice(insertPos24, 0, ...imageBlocks24);
                            insertPos24 += imageBlocks24.length;
                        }

                        const cargasAproximadasBlocks = [
                            {
                                type: "heading",
                                level: 2,
                                text: "2.5 CARGA DE VIENTO"
                            },
                            {
                                type: "paragraph",
                                text: `Se adopta una velocidad de viento de ${vientoTexto} km/h para el desarrollo de cargas de viento del proyecto.`,
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "image",
                                src: "/assets/img/memoriacalculos/cargaviento.png",
                                alignment: "CENTER",
                                width: 500,
                                height: 280,
                                caption: "Figura referencial - Mapa eólico (Norma E.020)"
                            },
                            {
                                type: "image",
                                src: "/assets/img/memoriacalculos/factoresforma.png",
                                alignment: "CENTER",
                                width: 500,
                                height: 260,
                                caption: "Figura referencial - Factores de forma (C)"
                            },
                            {
                                type: "heading",
                                level: 2,
                                text: "2.6 CARGAS APROXIMADAS"
                            },
                            {
                                type: "table",
                                title: "CARGAS APROXIMADAS",
                                widthPercent: 92,
                                columns: [
                                    { header: "PARÃƒÂMETRO", width: 20 },
                                    { header: "EXPRESIÃƒâ€œN", width: 45 },
                                    { header: "RESULTADO", width: 35 }
                                ],
                                rows: [
                                    ["CM", "Cubierta + accesorios (K5)", `${ca.cm} kgf/m2`],
                                    ["CV", "Techo inclinado + S/C construcciÃƒÂ³n (K10 + K11)", `${ca.cv} kgf/m2`],
                                    ["V", "Velocidad de viento", `${ca.velocidad} km/h`],
                                    ["h", "Altura sobre el terreno", `${ca.altura} m`],
                                    ["qz", "(V^2)/18000", `${ca.qz}`],
                                    ["CW+", "qz x Cw(+) x 100  [K21]", `${ca.cwMas1} kgf/m2`],
                                    ["CW+", "qz x Cw(+) x 100  [K26]", `${ca.cwMas2} kgf/m2`],
                                    ["CW-", "qz x Cw(-) x 100  [K32]", `${ca.cwMenos} kgf/m2`],
                                    ["OBS", "Espacio para completar memoria de cÃƒÂ¡lculo final", "____________________"]
                                ]
                            }
                        ];
                        analisisCargas.content.splice(insertPos24, 0, ...cargasAproximadasBlocks);
                        insertPos24 += cargasAproximadasBlocks.length;

                        if (cargasAproximadasImages.length > 0) {
                            const imageBlocksFinal24 = cargasAproximadasImages.map((src, idx) => ({
                                type: "image",
                                src,
                                alignment: "CENTER",
                                width: 500,
                                height: 260,
                                caption: cargasAproximadasCaptions[idx] || `Figura ${idx + 22}`,
                                pageBreakBefore: idx === 2
                            }));
                            analisisCargas.content.splice(insertPos24, 0, ...imageBlocksFinal24);
                        }
                    }
                }

                const processor = new ContentProcessorMC(window.docx, {
                    cover: this.cover,
                    document: this.document
                });

                const images = {
                    coverImage: this.previews.coverImage,
                    coverImage2: this.previews.coverImage2,
                    floorImages: this.previews.floorImages
                };

                const doc = await processor.buildDocument(structure, images);
                const blob = await window.docx.Packer.toBlob(doc);
                const filename = `Memoria_Calculo_${new Date().toISOString().split("T")[0]}.docx`;
                window.saveAs(blob, filename);
            } catch (error) {
                console.error("âŒ Error en exportWord:", error);
                this.addError("export", error.message || "Error exportando Word.");
            } finally {
                this.isExporting = false;
            }
        },

        addError(id, message) {
            const exists = this.errors.find(err => err.id === id);
            if (!exists) this.errors.push({ id, message });
        },

        readFileAsDataURL(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
=======
      },
      generalDescription:
        "Para realizar el diseno de los elementos de la estructura metalica se tendra que rescatar los maximos valores de la envolvente de cada elemento estructural de las combinaciones segun la norma E.090 del R.N.E. vigente que vienen a ser:\n- 1.2D+1.6CVT+0.8CWP\n- 1.2D+1.6CVT+0.8CWN\n- 1.2D+0.5CVT+1.3CWP\n- 0.9D+1.3CWP\n- 0.9D+1.3CWN",
    },

    casoscarga: {
      cargaviento: "75",
      K5: "10",
      K10: "20",
      K11: "10",
      K17: "15.85",
      K21: "0.30",
      K26: "-0.70",
      K32: "-0.60",
    },

    document: JSON.parse(JSON.stringify(DEFAULT_MC_STRUCTURE.document)),

    images: {
      coverImage: null,
      coverImage2: null,
      floorImages: [],
      materialImage1: null,
      materialImage2: null,
      materialImage3: null,
      modeloMatematico3DImages: [null],
      espectroPseudoaceleracionesImages: [null, null],
      metradoCargasImages: [null, null, null, null],
      cargasAproximadasImages: [null, null, null, null],
      estaticoConsideracionesETABS: [null, null, null],
    },

    previews: {
      coverImage: null,
      coverImage2: null,
      floorImages: [],
      materialImage1: null,
      materialImage2: null,
      materialImage3: null,
      modeloMatematico3DImages: [null],
      espectroPseudoaceleracionesImages: [null, null],
      metradoCargasImages: [null, null, null, null],
      cargasAproximadasImages: [null, null, null, null],
      estaticoConsideracionesETABS: [null, null, null],
    },

    floors: 1,
    errors: [],
    isExporting: false,
    ubigeoData: ubigeoData,

    init() {
      this.updateFloors();
      this.initAnalysisImageSlots();
      this.updateLocation();
      this.updateBuildingCategory();
    },

    get cargasAproximadas() {
      const cm = this.toNumber(this.casoscarga.K5);
      const cv = this.toNumber(this.casoscarga.K10) + this.toNumber(this.casoscarga.K11);
      const velocidad = this.toNumber(this.casoscarga.cargaviento);
      const altura = this.toNumber(this.casoscarga.K17);
      const qz = velocidad > 0 ? (velocidad * velocidad) / 18000 : 0;

      return {
        cm: this.roundNumber(cm),
        cv: this.roundNumber(cv),
        velocidad: this.roundNumber(velocidad),
        altura: this.roundNumber(altura),
        qz: this.roundNumber(qz, 2),
        cwMas1: this.roundNumber(qz * this.toNumber(this.casoscarga.K21) * 100),
        cwMas2: this.roundNumber(qz * this.toNumber(this.casoscarga.K26) * 100),
        cwMenos: this.roundNumber(qz * this.toNumber(this.casoscarga.K32) * 100),
      };
    },

    get departments() {
      return this.ubigeoData.map((d) => d.name).sort();
    },

    get provinces() {
      const dept = this.ubigeoData.find((d) => d.name === this.cover.ubigeo.department);
      return dept ? dept.provinces.map((p) => p.name).sort() : [];
    },

    get districts() {
      const dept = this.ubigeoData.find((d) => d.name === this.cover.ubigeo.department);
      if (!dept) return [];
      const prov = dept.provinces.find((p) => p.name === this.cover.ubigeo.province);
      return prov ? prov.districts.sort() : [];
    },

    updateLocation() {
      const { department, province, district } = this.cover.ubigeo;
      let loc = "";
      if (department) loc += department;
      if (province) loc += `, ${province}`;
      if (district) loc += `, ${district}`;
      this.cover.location = loc;
    },

    updateFloors() {
      const count = parseInt(this.floors) || 1;
      // Ajustar el tamaÃ±o del array de imÃ¡genes manteniendo las existentes
      while (this.images.floorImages.length < count) {
        this.images.floorImages.push(null);
        this.previews.floorImages.push(null);
      }
      if (this.images.floorImages.length > count) {
        this.images.floorImages = this.images.floorImages.slice(0, count);
        this.previews.floorImages = this.previews.floorImages.slice(0, count);
      }
    },

    initAnalysisImageSlots() {
      if (!Array.isArray(this.images.modeloMatematico3DImages)) this.images.modeloMatematico3DImages = [];
      if (!Array.isArray(this.previews.modeloMatematico3DImages)) this.previews.modeloMatematico3DImages = [];
      if (!Array.isArray(this.images.espectroPseudoaceleracionesImages))
        this.images.espectroPseudoaceleracionesImages = [];
      if (!Array.isArray(this.previews.espectroPseudoaceleracionesImages))
        this.previews.espectroPseudoaceleracionesImages = [];
      if (!Array.isArray(this.images.metradoCargasImages)) this.images.metradoCargasImages = [];
      if (!Array.isArray(this.previews.metradoCargasImages)) this.previews.metradoCargasImages = [];
      if (!Array.isArray(this.images.cargasAproximadasImages)) this.images.cargasAproximadasImages = [];
      if (!Array.isArray(this.previews.cargasAproximadasImages)) this.previews.cargasAproximadasImages = [];
      if (!Array.isArray(this.images.estaticoConsideracionesETABS)) this.images.estaticoConsideracionesETABS = [];
      if (!Array.isArray(this.previews.estaticoConsideracionesETABS)) this.previews.estaticoConsideracionesETABS = [];

      while (this.images.modeloMatematico3DImages.length < 1) this.images.modeloMatematico3DImages.push(null);
      while (this.previews.modeloMatematico3DImages.length < 1) this.previews.modeloMatematico3DImages.push(null);
      while (this.images.espectroPseudoaceleracionesImages.length < 2)
        this.images.espectroPseudoaceleracionesImages.push(null);
      while (this.previews.espectroPseudoaceleracionesImages.length < 2)
        this.previews.espectroPseudoaceleracionesImages.push(null);
      while (this.images.metradoCargasImages.length < 4) this.images.metradoCargasImages.push(null);
      while (this.previews.metradoCargasImages.length < 4) this.previews.metradoCargasImages.push(null);
      while (this.images.cargasAproximadasImages.length < 4) this.images.cargasAproximadasImages.push(null);
      while (this.previews.cargasAproximadasImages.length < 4) this.previews.cargasAproximadasImages.push(null);
      while (this.images.estaticoConsideracionesETABS.length < 3) this.images.estaticoConsideracionesETABS.push(null);
      while (this.previews.estaticoConsideracionesETABS.length < 3)
        this.previews.estaticoConsideracionesETABS.push(null);

      this.images.modeloMatematico3DImages = this.images.modeloMatematico3DImages.slice(0, 1);
      this.previews.modeloMatematico3DImages = this.previews.modeloMatematico3DImages.slice(0, 1);
      this.images.espectroPseudoaceleracionesImages = this.images.espectroPseudoaceleracionesImages.slice(0, 2);
      this.previews.espectroPseudoaceleracionesImages = this.previews.espectroPseudoaceleracionesImages.slice(0, 2);
      this.images.metradoCargasImages = this.images.metradoCargasImages.slice(0, 4);
      this.previews.metradoCargasImages = this.previews.metradoCargasImages.slice(0, 4);
      this.images.cargasAproximadasImages = this.images.cargasAproximadasImages.slice(0, 4);
      this.previews.cargasAproximadasImages = this.previews.cargasAproximadasImages.slice(0, 4);
      this.images.estaticoConsideracionesETABS = this.images.estaticoConsideracionesETABS.slice(0, 3);
      this.previews.estaticoConsideracionesETABS = this.previews.estaticoConsideracionesETABS.slice(0, 3);
    },

    updateBuildingCategory() {
      const factorByCategory = {
        A: "1.50",
        B: "1.30",
        C: "1.00",
        D: "Ver Nota 2",
      };
      const category = String(this.cover.buildingCategory || "").toUpperCase();
      this.cover.buildingCategory = Object.prototype.hasOwnProperty.call(factorByCategory, category) ? category : "C";
      this.cover.importanceFactorU = factorByCategory[this.cover.buildingCategory];
    },

    addSection(level = 1) {
      const id = `section_${Date.now()}`;
      this.document.sections.push({
        id,
        title: level === 1 ? "NUEVA SECCIÃ“N" : "NUEVA SUBSECCIÃ“N",
        level,
        content: [],
      });
    },

    removeSection(index) {
      this.document.sections.splice(index, 1);
    },

    addContentItem(sectionIndex, type) {
      const section = this.document.sections[sectionIndex];
      let item = { type };

      if (type === "paragraph" || type === "heading") {
        item.text = "";
        item.alignment = "JUSTIFIED";
        if (type === "heading") item.level = section.level + 1;
      } else if (type === "list") {
        item.listType = "bullet";
        item.items = [""];
      } else if (type === "image") {
        item.src = null;
        item.width = 500;
        item.height = 480;
      } else if (type === "table") {
        item.columns = [
          { header: "Col 1", width: 50 },
          { header: "Col 2", width: 50 },
        ];
        item.rows = [["", ""]];
      }

      section.content.push(item);
    },

    removeContentItem(sectionIndex, itemIndex) {
      this.document.sections[sectionIndex].content.splice(itemIndex, 1);
    },

    addListItem(sectionIndex, itemIndex) {
      this.document.sections[sectionIndex].content[itemIndex].items.push("");
    },

    removeListItem(sectionIndex, itemIndex, listItemIndex) {
      this.document.sections[sectionIndex].content[itemIndex].items.splice(listItemIndex, 1);
    },

    addExtraLine() {
      this.cover.extraLines.push({
        text: "",
        alignment: "CENTER",
        bold: false,
        italic: false,
      });
    },

    removeExtraLine(index) {
      this.cover.extraLines.splice(index, 1);
    },

    async handleImageChange(key, event) {
      const file = event.target.files?.[0] || null;
      if (!file) return;
      this.images[key] = file;
      this.previews[key] = await this.readFileAsDataURL(file);
    },

    removeImage(key) {
      this.images[key] = null;
      this.previews[key] = null;
    },

    async handleContentImageChange(sectionIndex, itemIndex, event) {
      const file = event.target.files?.[0] || null;
      if (!file) return;
      const dataUrl = await this.readFileAsDataURL(file);
      this.document.sections[sectionIndex].content[itemIndex].src = dataUrl;
    },

    handleFloorImageChange(index, event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.images.floorImages[index] = file;
        this.previews.floorImages[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeFloorImage(index) {
      this.images.floorImages[index] = null;
      this.previews.floorImages[index] = null;
    },

    handleMaterialImageChange(index, event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!Array.isArray(this.images.materialImages)) this.images.materialImages = [];
      if (!Array.isArray(this.previews.materialImages)) this.previews.materialImages = [];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.images.materialImages[index] = file;
        this.previews.materialImages[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeMaterialImage(index) {
      if (Array.isArray(this.images.materialImages)) this.images.materialImages[index] = null;
      if (Array.isArray(this.previews.materialImages)) this.previews.materialImages[index] = null;
    },

    handleAnalisisImageChange(key, event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.images[key] = file;
        this.previews[key] = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeAnalisisImage(key) {
      this.images[key] = null;
      this.previews[key] = null;
    },

    async handleArrayImageChange(groupKey, index, event) {
      const file = event.target.files?.[0] || null;
      if (!file) return;
      const dataUrl = await this.readFileAsDataURL(file);

      if (!Array.isArray(this.images[groupKey])) this.images[groupKey] = [];
      if (!Array.isArray(this.previews[groupKey])) this.previews[groupKey] = [];

      this.images[groupKey][index] = file;
      this.previews[groupKey][index] = dataUrl;
    },

    removeArrayImage(groupKey, index) {
      if (Array.isArray(this.images[groupKey])) this.images[groupKey][index] = null;
      if (Array.isArray(this.previews[groupKey])) this.previews[groupKey][index] = null;
    },

    toNumber(value) {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },

    roundNumber(value, decimals = 0) {
      const factor = Math.pow(10, decimals);
      return Math.round((this.toNumber(value) + Number.EPSILON) * factor) / factor;
    },

    findNextHeadingIndex(content, startIndex) {
      let current = startIndex + 1;
      while (current < content.length) {
        const item = content[current];
        if (item?.type === "heading" && item?.level === 2) break;
        current++;
      }
      return current;
    },

    getInternalVientoMapaImage() {
      // Retorna la ruta a la imagen local del mapa de viento
      return "/assets/img/memoriacalculos/cargaviento.png";
    },

    getInternalFactoresFormaImage() {
      // Retorna la ruta a la imagen local de factores de forma
      return "/assets/img/memoriacalculos/factoresforma.png";
    },

    async exportWord() {
      try {
        console.log("ðŸš€ Iniciando exportWord...");
        this.isExporting = true;
        this.errors = [];

        console.log("ðŸ“¦ LibrerÃ­as detectadas:", {
          docx: !!window.docx,
          saveAs: !!window.saveAs,
          windowKeys: Object.keys(window).filter((k) => k.toLowerCase().includes("docx")),
        });

        if (!window.docx) {
          this.addError("libs", "La librerÃ­a 'docx' no se ha cargado correctamente desde el servidor externo.");
          return;
>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec
        }

        if (!window.saveAs) {
          this.addError("libs", "La librerÃ­a 'FileSaver' (saveAs) no estÃ¡ disponible.");
          return;
        }

        const structure = buildContentStructure({
          cover: this.cover,
          document: this.document,
        });

        // --- 1. UBICACIÃ“N DINÃMICA (SecciÃ³n 1.2) ---
        const generalidades = structure.document.sections.find((s) => s.id === "generalidades");
        if (generalidades) {
          const idx12 = generalidades.content.findIndex(
            (item) => item.type === "heading" && String(item.text || "").startsWith("1.2."),
          );

          if (idx12 !== -1) {
            // Encontrar la imagen estÃ¡tica que sigue al encabezado 1.2 o al pÃ¡rrafo siguiente
            const imgIdx = generalidades.content.findIndex((item, i) => i > idx12 && item.type === "image");

            if (imgIdx !== -1) {
              // Generar la tabla de ubicaciÃ³n
              const deptName = this.cover.ubigeo.department || "HUANUCO";
              const provName = this.cover.ubigeo.province || "HUANUCO";
              const distSelected = this.cover.ubigeo.district || "";

              // Obtener distritos de la provincia actual
              const deptData = this.ubigeoData.find((d) => d.name === deptName);
              const provData = deptData?.provinces.find((p) => p.name === provName);
              const districtsList =
                provData && Array.isArray(provData.districts) && provData.districts.length > 0
                  ? provData.districts
                  : [distSelected || "NO DEFINIDO"];

              const tableRows = [];
              districtsList.forEach((district, index) => {
                const row = [];

                // RegiÃ³n (Merged)
                if (index === 0) {
                  row.push({ text: deptName, rowSpan: districtsList.length, bold: true });
                } else {
                  row.push({ text: "" }); // Placeholder para merge
                }

                // Provincia (Merged)
                if (index === 0) {
                  row.push({ text: provName, rowSpan: districtsList.length, bold: true });
                } else {
                  row.push({ text: "" }); // Placeholder para merge
                }

                // Distrito (Coloreado)
                row.push({
                  text: district,
                  color: district === distSelected ? "FF0000" : "000000",
                  bold: district === distSelected,
                  alignment: "LEFT",
                });

                // Zona SÃ­smica (Merged)
                if (index === 0) {
                  row.push({ text: "2", rowSpan: districtsList.length, bold: true, size: 24 });
                } else {
                  row.push({ text: "" }); // Placeholder para merge
                }

                // Ãmbito (Merged)
                if (index === 0) {
                  row.push({ text: "TODOS LOS DISTRITOS", rowSpan: districtsList.length, size: 16 });
                } else {
                  row.push({ text: "" }); // Placeholder para merge
                }

                tableRows.push(row);
              });

              // Reemplazar la imagen por la tabla
              generalidades.content.splice(imgIdx, 1, {
                type: "table",
                widthPercent: 95,
                indentSize: 500,
                columns: [
                  { header: "REGIÃ“N\n(DPTO.)", width: 20 },
                  { header: "PROVINCIA", width: 25 },
                  { header: "DISTRITO", width: 25 },
                  { header: "ZONA\nSÃSMICA", width: 10 },
                  { header: "ÃMBITO", width: 20 },
                ],
                rows: tableRows,
              });
            }
          }

          // --- 2. IMÃGENES POR PISO (SecciÃ³n 1.4) ---
          const idx14 = generalidades.content.findIndex(
            (item) => item.type === "heading" && String(item.text || "").startsWith("1.4."),
          );

          if (idx14 !== -1) {
            const insertPos = idx14 + 2;
            let currentInsertPos = insertPos;

            this.previews.floorImages.forEach((imgData, i) => {
              if (imgData) {
                generalidades.content.splice(currentInsertPos++, 0, {
                  type: "image",
                  src: imgData,
                  alignment: "CENTER",
                  width: 500,
                  height: 480,
                  caption: `Esquema general en planta ${i + 1}Â°nivel`,
                  pageBreakBefore: true,
                  verticalCenter: true,
                });
              }
            });

            const tableRows = [
              ["USO", this.structuralDetails.usage || "Residencial"],
              ["#pisos", `${this.floors} pisos`],
              ["Sistema estructural en X", this.structuralDetails.structuralSystemX],
              ["Sistema estructural en Y", this.structuralDetails.structuralSystemY],
              ["Elementos verticales", this.structuralDetails.verticalElements],
              ["Elementos horizontales", this.structuralDetails.horizontalElements],
              ["Techo", this.structuralDetails.roof],
            ];

            generalidades.content.splice(currentInsertPos, 0, {
              type: "table",
              title: "RESUMEN ESTRUCTURAL",
              columns: [
                { header: "PARÃMETRO", width: 20 },
                { header: "DESCRIPCIÃ“N", width: 80 },
              ],
              rows: tableRows,
            });
          }
          const selectedSoilFactor = (this.cover.soilFactor || "S2").toUpperCase();
          const selectedPeriod = this.cover.soilPeriod === "Tl" ? "Tl" : "Tp";
          const zoneFactorMap = {
            1: "0.10",
            2: "0.25",
            3: "0.35",
            4: "0.45",
          };
          const getProjectZone = () => {
            const zone = String(this.cover.seismicZone || "").trim();
            return Object.prototype.hasOwnProperty.call(zoneFactorMap, zone) ? zone : "2";
          };
          const projectZone = getProjectZone();
          const projectZFactor = zoneFactorMap[projectZone];
          this.cover.seismicZone = projectZone;
          this.cover.seismicZoneFactor = projectZFactor;

          // --- 3. ZONIFICACIÃ“N SÃSMICA (SecciÃ³n 1.3.1) ---
          const idx131 = generalidades.content.findIndex(
            (item) => item.type === "heading" && String(item.text || "").startsWith("1.3.1."),
          );

          if (idx131 !== -1) {
            // Encontrar la imagen del mapa que suele seguir
            const mapImgIdx = generalidades.content.findIndex((item, i) => i > idx131 && item.type === "image");

            if (mapImgIdx !== -1) {
              const deptName = this.cover.ubigeo.department || "HUANUCO";
              const provName = this.cover.ubigeo.province || "HUANUCO";
              const distName = this.cover.ubigeo.district || "PILLCO MARCA";

              // Datos de la tabla de factores Z (Norma E.030)
              const zFactors = [
                { zone: "4", z: zoneFactorMap["4"] },
                { zone: "3", z: zoneFactorMap["3"] },
                { zone: "2", z: zoneFactorMap["2"] },
                { zone: "1", z: zoneFactorMap["1"] },
              ];

              const zTableRows = zFactors.map((f) => [
                {
                  text: f.zone,
                  fill: f.zone === projectZone ? "00B0F0" : null, // Celeste/Azul como en la imagen
                  color: f.zone === projectZone ? "FFFFFF" : "000000",
                  bold: f.zone === projectZone,
                },
                {
                  text: f.z,
                  fill: f.zone === projectZone ? "00B0F0" : null,
                  color: f.zone === projectZone ? "FFFFFF" : "000000",
                  bold: f.zone === projectZone,
                },
              ]);

              // Crear la estructura "mezclada" usando una tabla invisible de 2 columnas
              const layoutTable = {
                type: "table",
                widthPercent: 100,
                indentSize: 0,
                noBorders: true, // Necesitamos soporte para tablas sin bordes en el procesador
                columns: [
                  { width: 55 }, // Columna para el mapa
                  { width: 45 }, // Columna para info + tabla Z
                ],
                rows: [
                  [
                    // Celda Izquierda: Mapa
                    {
                      type: "image",
                      src: "/assets/img/memoriacalculos/mapazonificacion.png",
                      width: 320,
                      height: 380,
                      alignment: "CENTER",
                    },
                    // Celda Derecha: Info UbicaciÃ³n + Tabla Z
                    {
                      stack: [
                        // Bloque de UbicaciÃ³n
                        {
                          text: `DEPARTAMENTO: ${deptName}\nPROVINCIA: ${provName}\nDISTRITO: ${distName}`,
                          bold: true,
                          size: 16,
                          alignment: "LEFT",
                          spacing: { after: 200 },
                        },
                        // Mini Tabla de Factores Z
                        {
                          type: "table",
                          title: "Tabla NÂ°6\nFACTORES DE ZONA 'Z'",
                          widthPercent: 90,
                          columns: [
                            { header: "ZONA", width: 50 },
                            { header: "Z", width: 50 },
                          ],
                          rows: zTableRows,
                        },
                      ],
                    },
                  ],
                ],
              };

              const idx131Paragraph = generalidades.content.findIndex(
                (item, i) => i > idx131 && item.type === "paragraph",
              );
              if (idx131Paragraph !== -1) {
                generalidades.content[idx131Paragraph] = {
                  type: "paragraph",
                  text: `De acuerdo con el mapa del Reglamento Nacional de Edificaciones-Norma E.030, el Ã¡rea de estudio se localiza en la zona ${projectZone}, correspondiÃ©ndole un factor de Z=${projectZFactor}.`,
                  alignment: "JUSTIFIED",
                };
              }

              // Reemplazar la imagen simple por este nuevo layout
              generalidades.content.splice(mapImgIdx, 1, layoutTable);
            }
          }

          // --- 4. PARÃMETROS DE SUELO (SecciÃ³n 1.3.2) ---
          const idx132 = generalidades.content.findIndex(
            (item) => item.type === "heading" && String(item.text || "").startsWith("1.3.2."),
          );

          if (idx132 !== -1) {
            const zoneLabels = { 4: "Z4", 3: "Z3", 2: "Z2", 1: "Z1" };
            const currentZoneLabel = zoneLabels[projectZone] || "Z2";
            const selectedS = ["S0", "S1", "S2", "S3"].includes(selectedSoilFactor) ? selectedSoilFactor : "S2";
            const selectedT = selectedPeriod;

            const soilFactorMatrix = {
              Z4: { S0: "0.80", S1: "1.00", S2: "1.05", S3: "1.10" },
              Z3: { S0: "0.80", S1: "1.00", S2: "1.15", S3: "1.20" },
              Z2: { S0: "0.80", S1: "1.00", S2: "1.20", S3: "1.40" },
              Z1: { S0: "0.80", S1: "1.00", S2: "1.60", S3: "2.00" },
            };
            const periodMatrix = {
              Tp: { S0: "0.3", S1: "0.4", S2: "0.6", S3: "1.0" },
              Tl: { S0: "3.0", S1: "2.5", S2: "2.0", S3: "1.6" },
            };

            const selectedSValue = soilFactorMatrix[currentZoneLabel][selectedS];
            const selectedTValue = periodMatrix[selectedT][selectedS];
            const lightRed = "FDE2E2";
            const hardRed = "C00000";

            // Valores para texto dinÃ¡mico con placeholders en content-structure-mc.js
            this.cover.seismicZone = projectZone;
            this.cover.soilFactor = selectedS;
            this.cover.soilPeriod = selectedT;
            this.cover.soilValue = selectedSValue;
            this.cover.soilPeriodValue = selectedTValue;

            const idx132Paragraph = generalidades.content.findIndex(
              (item, i) => i > idx132 && item.type === "paragraph",
            );
            if (idx132Paragraph !== -1) {
              generalidades.content[idx132Paragraph] = {
                type: "paragraph",
                text: `Para efectos de la aplicaciÃ³n de la norma E-0.30 de diseÃ±o sismo-resistente, se adopta el perfil de suelo ${selectedS}. Para la zona ${projectZone}, el factor de suelo correspondiente es ${selectedSValue}. Asimismo, para el periodo seleccionado ${selectedT}, el valor correspondiente es ${selectedTValue}s segÃºn la Tabla NÂ°4. Los valores de S, Tp y Tl se muestran en las Tablas NÂ°3 y NÂ°4 (NORMA E-030 - DISEÃ‘O SISMORESISTENTE).`,
                alignment: "JUSTIFIED",
              };
            }

            const factorTableRows = ["Z4", "Z3", "Z2", "Z1"].map((zone) => [
              {
                text: zone,
                fill: zone === currentZoneLabel ? lightRed : null,
                color: zone === currentZoneLabel ? hardRed : "000000",
                bold: zone === currentZoneLabel,
              },
              ...["S0", "S1", "S2", "S3"].map((sKey) => {
                const isRow = zone === currentZoneLabel;
                const isCol = sKey === selectedS;
                const isIntersection = isRow && isCol;
                return {
                  text: soilFactorMatrix[zone][sKey],
                  fill: isIntersection ? hardRed : isRow || isCol ? lightRed : null,
                  color: isIntersection ? "FFFFFF" : isRow || isCol ? hardRed : "000000",
                  bold: isIntersection || isRow || isCol,
                };
              }),
            ]);

            const periodTableRows = ["Tp", "Tl"].map((periodKey) => [
              {
                text: periodKey === "Tp" ? "Tp(s)" : "Tl(s)",
                fill: periodKey === selectedT ? lightRed : null,
                color: periodKey === selectedT ? hardRed : "000000",
                bold: periodKey === selectedT,
              },
              ...["S0", "S1", "S2", "S3"].map((sKey) => {
                const isRow = periodKey === selectedT;
                const isCol = sKey === selectedS;
                const isIntersection = isRow && isCol;
                return {
                  text: periodMatrix[periodKey][sKey],
                  fill: isIntersection ? hardRed : isRow || isCol ? lightRed : null,
                  color: isIntersection ? "FFFFFF" : isRow || isCol ? hardRed : "000000",
                  bold: isIntersection || isRow || isCol,
                };
              }),
            ]);

            const factorTable = {
              type: "table",
              title: 'Tabla NÂ° 3\nFACTOR DE SUELO "S"',
              widthPercent: 90,
              indentSize: 500,
              columns: [
                { header: "ZONA / SUELO", width: 22 },
                {
                  header: "S0",
                  width: 19.5,
                  fill: selectedS === "S0" ? lightRed : null,
                  color: selectedS === "S0" ? hardRed : "000000",
                },
                {
                  header: "S1",
                  width: 19.5,
                  fill: selectedS === "S1" ? lightRed : null,
                  color: selectedS === "S1" ? hardRed : "000000",
                },
                {
                  header: "S2",
                  width: 19.5,
                  fill: selectedS === "S2" ? lightRed : null,
                  color: selectedS === "S2" ? hardRed : "000000",
                },
                {
                  header: "S3",
                  width: 19.5,
                  fill: selectedS === "S3" ? lightRed : null,
                  color: selectedS === "S3" ? hardRed : "000000",
                },
              ],
              rows: factorTableRows,
            };

            const periodTable = {
              type: "table",
              title: 'Tabla NÂ° 4\nPERÃODOS "Tp" Y "TL"',
              widthPercent: 90,
              indentSize: 500,
              columns: [
                { header: "Perfil de suelo", width: 22 },
                {
                  header: "S0",
                  width: 19.5,
                  fill: selectedS === "S0" ? lightRed : null,
                  color: selectedS === "S0" ? hardRed : "000000",
                },
                {
                  header: "S1",
                  width: 19.5,
                  fill: selectedS === "S1" ? lightRed : null,
                  color: selectedS === "S1" ? hardRed : "000000",
                },
                {
                  header: "S2",
                  width: 19.5,
                  fill: selectedS === "S2" ? lightRed : null,
                  color: selectedS === "S2" ? hardRed : "000000",
                },
                {
                  header: "S3",
                  width: 19.5,
                  fill: selectedS === "S3" ? lightRed : null,
                  color: selectedS === "S3" ? hardRed : "000000",
                },
              ],
              rows: periodTableRows,
            };

            const firstSoilImageIdx = generalidades.content.findIndex(
              (item, i) =>
                i > idx132 && item.type === "image" && item.src === "/assets/img/memoriacalculos/factorsuelo.png",
            );
            const secondSoilImageIdx = generalidades.content.findIndex(
              (item, i) =>
                i > idx132 && item.type === "image" && item.src === "/assets/img/memoriacalculos/periodos.png",
            );

            if (firstSoilImageIdx !== -1) {
              generalidades.content.splice(firstSoilImageIdx, 1, factorTable);
            }
            if (secondSoilImageIdx !== -1) {
              generalidades.content.splice(secondSoilImageIdx, 1, periodTable);
            }
          }

          // --- 5. CATEGORÃAS DE LAS EDIFICACIONES (SecciÃ³n 1.3.4) ---
          const idx134 = generalidades.content.findIndex(
            (item) => item.type === "heading" && String(item.text || "").startsWith("1.3.4."),
          );

          if (idx134 !== -1) {
            this.updateBuildingCategory();
            const category = this.cover.buildingCategory;
            const factorU = this.cover.importanceFactorU;

            const categoryDetails = {
              A: {
                title: "A - Edificaciones Esenciales",
                description:
                  "Establecimientos de salud del segundo y tercer nivel; puertos, aeropuertos, centrales de comunicaciones, estaciones de bomberos, cuarteles de fuerzas armadas y policÃ­a; instalaciones de generaciÃ³n y transformaciÃ³n elÃ©ctrica; reservorios y plantas de tratamiento de agua; locales con funciÃ³n de refugio, instituciones educativas e instalaciones cuyo colapso implique riesgo adicional.",
              },
              B: {
                title: "B - Edificaciones Importantes",
                description:
                  "Edificaciones donde se reÃºnen gran cantidad de personas: cines, teatros, estadios, coliseos, centros comerciales, terminales de pasajeros, establecimientos penitenciarios y edificaciones que guardan patrimonio valioso (museos y bibliotecas). TambiÃ©n incluye depÃ³sitos de granos y almacenes importantes para el abastecimiento.",
              },
              C: {
                title: "C - Edificaciones Comunes",
                description:
                  "Edificaciones comunes como viviendas, oficinas, hoteles, restaurantes, depÃ³sitos e instalaciones industriales cuyo fallo no acarree peligros adicionales de incendios o fugas de contaminantes.",
              },
              D: {
                title: "D - Edificaciones Temporales",
                description: "Construcciones provisionales para depÃ³sitos, casetas y otras instalaciones similares.",
              },
            };

            const selectedCategoryDetail = categoryDetails[category] || categoryDetails.C;

            const idx134Paragraph = generalidades.content.findIndex(
              (item, i) => i > idx134 && item.type === "paragraph",
            );
            if (idx134Paragraph !== -1) {
              const factorText = category === "D" ? "Ver Nota 2" : factorU;
              generalidades.content[idx134Paragraph] = {
                type: "paragraph",
                text: `Cada estructura debe ser clasificada de acuerdo con la categorÃ­a de uso. Para la categorÃ­a ${category}, corresponde el factor de importancia U = ${factorText}.`,
                alignment: "JUSTIFIED",
              };
            }

            const categoryImageIdx = generalidades.content.findIndex(
              (item, i) =>
                i > idx134 &&
                item.type === "image" &&
                item.src === "/assets/img/memoriacalculos/categoriaEdificaciones.png",
            );

            if (categoryImageIdx !== -1) {
              const categoryTable = {
                type: "table",
                title: "CATEGORÃA DE LAS EDIFICACIONES",
                widthPercent: 95,
                indentSize: 250,
                columns: [
                  { header: "CATEGORÃA", width: 20 },
                  { header: "DESCRIPCIÃ“N", width: 65 },
                  { header: "FACTOR U", width: 15 },
                ],
                rows: [
                  [
                    { text: selectedCategoryDetail.title, bold: true },
                    { text: selectedCategoryDetail.description, alignment: "LEFT" },
                    {
                      text: category === "D" ? "Ver Nota 2" : factorU,
                      bold: true,
                      alignment: "CENTER",
                    },
                  ],
                ],
              };

              generalidades.content.splice(categoryImageIdx, 1, categoryTable);
            }
          }
        }

        if (generalidades) {
          const idx15 = generalidades.content.findIndex(
            (item) => item.type === "heading" && String(item.text || "").startsWith("1.5."),
          );

          if (idx15 !== -1) {
            const endPos15 = this.findNextHeadingIndex(generalidades.content, idx15);
            const materialInputs = this.structuralDetails.materialDesign || {};

            const aceroEstructural = materialInputs.aceroEstructural || {};
            const aceroCorrugado = materialInputs.aceroCorrugado || {};
            const concreto = materialInputs.concreto || {};

            const materialBlocks = [
              {
                type: "paragraph",
                text: "Se consideraron las siguientes caracteristicas de los materiales que conforman esta estructura",
                alignment: "JUSTIFIED",
              },
              {
                type: "paragraph",
                text: "Acero estructural (ASTM A36)",
                alignment: "JUSTIFIED",
              },
              {
                type: "list",
                listType: "bullet",
                items: [
                  `Fluencia: fy = ${aceroEstructural.fy || "-"} kg/cm2, Grado 60`,
                  `Modulo de elasticidad: E = ${aceroEstructural.e || "-"} kg/cm2`,
                  `Resistencia nominal: f'c = ${aceroEstructural.fc || "-"} kg/cm2`,
                ],
              },
              {
                type: "paragraph",
                text: "Acero corrugado (ASTM A605)",
                alignment: "JUSTIFIED",
              },
              {
                type: "list",
                listType: "bullet",
                items: [
                  `Fluencia: fy = ${aceroCorrugado.fy || "-"} kg/cm2, Grado 60`,
                  `Modulo de elasticidad: E = ${aceroCorrugado.e || "-"} kg/cm2`,
                  `Resistencia nominal: f'c = ${aceroCorrugado.fc || "-"} kg/cm2`,
                ],
              },
              {
                type: "paragraph",
                text: "Concreto",
                alignment: "JUSTIFIED",
              },
              {
                type: "list",
                listType: "bullet",
                items: [
                  `Resistencia nominal: f'c = ${concreto.fc || "-"} kg/cm2`,
                  `Modulo de elasticidad: E = ${concreto.e || "-"} kg/cm2`,
                  `Fluencia: fy = ${concreto.fy || "-"} kg/cm2`,
                ],
              },
            ];

            if (this.previews.materialImage1) {
              materialBlocks.push({
                type: "image",
                src: this.previews.materialImage1,
                alignment: "CENTER",
                width: 500,
                height: 260,
                caption: "figura 11-Propiedad de refuerzo fy=4200 kg/cm2",
              });
            }

            if (this.previews.materialImage2) {
              materialBlocks.push({
                type: "image",
                src: this.previews.materialImage2,
                alignment: "CENTER",
                width: 500,
                height: 260,
                caption: "figura 12-Propiedad del concreto f'c=210kg/cm2",
              });
            }

            const descripcionGeneral = String(this.structuralDetails.generalDescription || "").trim();
            if (descripcionGeneral) {
              materialBlocks.push({
                type: "paragraph",
                text: descripcionGeneral,
                alignment: "JUSTIFIED",
              });
            }

            if (this.previews.materialImage3) {
              materialBlocks.push({
                type: "image",
                src: this.previews.materialImage3,
                alignment: "CENTER",
                width: 500,
                height: 260,
                caption: "figura 13-Propiedades del acero",
              });
            }

            generalidades.content.splice(idx15 + 1, endPos15 - (idx15 + 1), ...materialBlocks);
          }
        }

        const analisisCargas = structure.document.sections.find((s) => s.id === "analisis_cargas");
        if (analisisCargas) {
          const modelo3DImages = (this.previews.modeloMatematico3DImages || []).filter(Boolean);
          const espectroImages = (this.previews.espectroPseudoaceleracionesImages || []).filter(Boolean);
          const metradoImages = (this.previews.metradoCargasImages || []).filter(Boolean);
          const vientoMapaImage = this.getInternalVientoMapaImage();
          const factoresFormaImage = this.getInternalFactoresFormaImage();
          const cargasAproximadasImages = (this.previews.cargasAproximadasImages || []).filter(Boolean);

          const idx21 = analisisCargas.content.findIndex(
            (item) => item.type === "heading" && item.text === "2.1 MODELO ESTRUCTURAL",
          );
          if (idx21 !== -1 && modelo3DImages.length > 0) {
            const insertPos21 = this.findNextHeadingIndex(analisisCargas.content, idx21);
            const imageBlocks21 = modelo3DImages.map((src) => ({
              type: "image",
              src,
              alignment: "CENTER",
              width: 500,
              height: 280,
              caption: "Figura 14-Modelo matemático en 3D",
            }));
            analisisCargas.content.splice(insertPos21, 0, ...imageBlocks21);
          }

          const idx22 = analisisCargas.content.findIndex(
            (item) => item.type === "heading" && item.text === "2.2 CASOS DE CARGA",
          );
          if (idx22 !== -1 && espectroImages.length > 0) {
            const insertPos22 = this.findNextHeadingIndex(analisisCargas.content, idx22);
            const espectroCaptions = [
              "Figura 15-Espectro de Pseudoaceleraciones en dirección X",
              "Figura 16-Espectro de Pseudoaceleraciones en dirección Y",
            ];
            const imageBlocks22 = espectroImages.map((src, idx) => ({
              type: "image",
              src,
              alignment: "CENTER",
              width: 500,
              height: 280,
              caption: espectroCaptions[idx] || `Figura espectro ${idx + 1}`,
            }));
            analisisCargas.content.splice(insertPos22, 0, ...imageBlocks22);
          }

          const idx24 = analisisCargas.content.findIndex(
            (item) => item.type === "heading" && String(item.text || "").startsWith("2.4"),
          );
          if (idx24 !== -1) {
            let insertPos24 = this.findNextHeadingIndex(analisisCargas.content, idx24);
            const ca = this.cargasAproximadas;
            const vientoTexto = this.casoscarga.cargaviento || "-";
            const metradoCaptions = [
              "Figura 18-Cargas muertas por metro cuadrado (tonf/m2)",
              "Figura 19-Carga viva entrepiso por metro cuadrado (tonf/m2)",
              "Figura 20-Carga viva techo por metro cuadrado (tonf/m2)",
              "Figura 21-Carga muerta por metro lineal debido a tabiquería (tonf/m)",
            ];
            const cargasAproximadasCaptions = [
              "Figura 22-Cargas muertas por metro cuadrado (kgf/m2)",
              "Figura 23-Cargas viva techo metro cuadrado (kgf/m2)",
              "Figura 24-Cargas viva viento positivo(kgf/m2)",
              "Figura 25-Cargas viva viento negativo(kgf/m2)",
            ];

            if (metradoImages.length > 0) {
              const imageBlocks24 = metradoImages.map((src, idx) => ({
                type: "image",
                src,
                alignment: "CENTER",
                width: 500,
                height: 260,
                caption: metradoCaptions[idx] || `Metrado de cargas ${idx + 1}`,
              }));
              analisisCargas.content.splice(insertPos24, 0, ...imageBlocks24);
              insertPos24 += imageBlocks24.length;
            }

            const cargasAproximadasBlocks = [
              {
                type: "heading",
                level: 2,
                text: "2.5 CARGA DE VIENTO",
              },
              {
                type: "paragraph",
                text: `Se adopta una velocidad de viento de ${vientoTexto} km/h para el desarrollo de cargas de viento del proyecto.`,
                alignment: "JUSTIFIED",
              },
              {
                type: "image",
                src: "/assets/img/memoriacalculos/cargaviento.png",
                alignment: "CENTER",
                width: 500,
                height: 280,
                caption: "Figura referencial - Mapa eólico (Norma E.020)",
              },
              {
                type: "image",
                src: "/assets/img/memoriacalculos/factoresforma.png",
                alignment: "CENTER",
                width: 500,
                height: 260,
                caption: "Figura referencial - Factores de forma (C)",
              },
              {
                type: "heading",
                level: 2,
                text: "2.6 CARGAS APROXIMADAS",
              },
              {
                type: "table",
                title: "CARGAS APROXIMADAS",
                widthPercent: 92,
                columns: [
                  { header: "PARÃƒÂMETRO", width: 20 },
                  { header: "EXPRESIÃƒâ€œN", width: 45 },
                  { header: "RESULTADO", width: 35 },
                ],
                rows: [
                  ["CM", "Cubierta + accesorios (K5)", `${ca.cm} kgf/m2`],
                  ["CV", "Techo inclinado + S/C construcciÃƒÂ³n (K10 + K11)", `${ca.cv} kgf/m2`],
                  ["V", "Velocidad de viento", `${ca.velocidad} km/h`],
                  ["h", "Altura sobre el terreno", `${ca.altura} m`],
                  ["qz", "(V^2)/18000", `${ca.qz}`],
                  ["CW+", "qz x Cw(+) x 100  [K21]", `${ca.cwMas1} kgf/m2`],
                  ["CW+", "qz x Cw(+) x 100  [K26]", `${ca.cwMas2} kgf/m2`],
                  ["CW-", "qz x Cw(-) x 100  [K32]", `${ca.cwMenos} kgf/m2`],
                  ["OBS", "Espacio para completar memoria de cÃƒÂ¡lculo final", "____________________"],
                ],
              },
            ];
            analisisCargas.content.splice(insertPos24, 0, ...cargasAproximadasBlocks);
            insertPos24 += cargasAproximadasBlocks.length;

            if (cargasAproximadasImages.length > 0) {
              const imageBlocksFinal24 = cargasAproximadasImages.map((src, idx) => ({
                type: "image",
                src,
                alignment: "CENTER",
                width: 500,
                height: 260,
                caption: cargasAproximadasCaptions[idx] || `Figura ${idx + 22}`,
                pageBreakBefore: idx === 2,
              }));
              analisisCargas.content.splice(insertPos24, 0, ...imageBlocksFinal24);
            }
          }
        }

        // ====== SECCION DE ANALISIS SISMICO ================
        const analisisSismico = structure.document.sections.find((s) => s.id === "analisis_sismico");

        if (analisisSismico) {
          const staticImages = this.previews.estaticoConsideracionesETABS || [];

          // Usar analisisSismico
          const idx32 = analisisSismico.content.findIndex(
            (item) => item.type === "heading" && item.text === "3.2 ANÁLISIS SÍSMICO ESTATICO",
          );

          if (idx32 !== -1 && staticImages.length > 0) {
            // Encontrar el párrafo "Consideraciones en ETABS"
            const consideracionesParagraphIdx = analisisSismico.content.findIndex(
              (item, i) => i > idx32 && item.type === "paragraph" && item.text === "Consideraciones en ETABS",
            );

            if (consideracionesParagraphIdx !== -1) {
              const insertPos = consideracionesParagraphIdx + 1;
               // Eliminar contenido existente después del párrafo e insertar imágenes
              const nextHeadingIdx = this.findNextHeadingIndex(analisisSismico.content, consideracionesParagraphIdx);
              const itemsToDelete = nextHeadingIdx - insertPos;
              // CORRECCIÓN 3: Usar comillas estándar
              const imageBlock26y27 = [];

              if (staticImages[0]) {
                blocksFig26y27.push({
                  type: "image",
                  src: staticImages[0],
                  alignment: "CENTER",
                  width: 500,
                  height: 280,
                  caption: 'figura 26-Patrón de cargas sísmicas en "X"',
                });
              }

              if (staticImages[1]) {
                blocksFig26y27.push({
                  type: "image",
                  src: staticImages[1],
                  alignment: "CENTER",
                  width: 500,
                  height: 280,
                  caption: 'figura 27-Patrón de cargas sísmicas en "Y"',
                });
              }

              if (blocksFig26y27.length > 0) {
                analisisSismico.content.splice(insertPos, itemsToDelete, ...blocksFig26y27);
              }
            }

            //FIGURA 28
            const definPesoSisListIdx = analisisSismico.content.findIndex(
              (item, i) =>
                i > idx32 &&
                item.type === "list" &&
                item.items &&
                item.items[0] &&
                item.items[0].includes("DEFINICIÓN DEL PESO SÍSMICO"),
            );

            if (definPesoSisListIdx !== -1 && staticImages[2]) {
              analisisSismico.content.splice(definPesoSisListIdx + 1, 0, {
                type: "image",
                src: staticImages[2],
                alignment: "CENTER",
                width: 500,
                height: 280,
                caption: "figura 28-Peso Sísmico",
              });
            }
          }
        }

        //=============GENERAR DOCUMENTO===============
        const processor = new ContentProcessorMC(window.docx, {
          cover: this.cover,
          document: this.document,
        });

        const images = {
          coverImage: this.previews.coverImage,
          coverImage2: this.previews.coverImage2,
          floorImages: this.previews.floorImages,
        };

        const doc = await processor.buildDocument(structure, images);
        const blob = await window.docx.Packer.toBlob(doc);
        const filename = `Memoria_Calculo_${new Date().toISOString().split("T")[0]}.docx`;
        window.saveAs(blob, filename);
      } catch (error) {
        console.error("âŒ Error en exportWord:", error);
        this.addError("export", error.message || "Error exportando Word.");
      } finally {
        this.isExporting = false;
      }
    },

    addError(id, message) {
      const exists = this.errors.find((err) => err.id === id);
      if (!exists) this.errors.push({ id, message });
    },

    readFileAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    },
  };
}

export { memoriaCalculo };

// Registro para Alpine dinÃ¡mico
if (typeof window !== "undefined") {
  const register = () => {
    if (window.Alpine) {
      window.Alpine.data("memoriaCalculo", memoriaCalculo);
    }
  };

  if (window.Alpine) {
    register();
  } else {
    document.addEventListener("alpine:init", register);
  }
}
