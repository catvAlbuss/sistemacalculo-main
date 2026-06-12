// stores/memoriaDescriptivaStore.js - Store central para Memoria Descriptiva
// Texto → localStorage | Imágenes → IndexedDB (sin límite de cuota)

const STORAGE_KEY = 'memoriaDescriptiva_v1';
const IDB_NAME = 'memoriaDescriptiva_imgDB';
const IDB_STORE = 'images';
let _idb = null;

function getStorageKey() { return `${STORAGE_KEY}_${getStorageOwner()}`; }
function getStorageOwner() { return String(window.RZ_AUTH_USER_ID || 'guest'); }

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

function openIDB() {
    if (_idb) return Promise.resolve(_idb);
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
        req.onsuccess = e => { _idb = e.target.result; resolve(_idb); };
        req.onerror = () => reject(req.error);
    });
}

async function saveImagesToIDB(userId, data) {
    const cleanData = {};

    if (data.previews) {
        cleanData.previews = {};
        Object.keys(data.previews).forEach(key => {
            const value = data.previews[key];
            if (typeof value === 'string') {
                cleanData.previews[key] = value;
            }
        });
    }

    if (data.generalidadesImages) {
        cleanData.generalidadesImages = {};
        Object.keys(data.generalidadesImages).forEach(key => {
            const value = data.generalidadesImages[key];
            if (typeof value === 'string') {
                cleanData.generalidadesImages[key] = value;
            }
        });
    }

    if (data.moduloImagenes && Array.isArray(data.moduloImagenes)) {
        cleanData.moduloImagenes = data.moduloImagenes.map(modulo => {
            if (Array.isArray(modulo)) {
                return modulo.filter(img => typeof img === 'string' && img.startsWith('data:image'));
            }
            return [];
        });
    } else {
        cleanData.moduloImagenes = [];
    }

    if (data.coverImage && typeof data.coverImage === 'string') {
        cleanData.coverImage = data.coverImage;
    }

    cleanData.demolicionImagenes = data.demolicionImagenes || {};

    try {
        const db = await openIDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            const store = tx.objectStore(IDB_STORE);
            const putRequest = store.put(cleanData, userId);
            putRequest.onerror = (e) => reject(e.target.error);
            tx.oncomplete = () => resolve(true);
            tx.onerror = (e) => reject(e.target.error);
        });
    } catch (e) {
        console.warn('IDB error:', e);
        return false;
    }
}

async function loadImagesFromIDB(userId) {
    try {
        const db = await openIDB();
        return new Promise(resolve => {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get(userId);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    } catch (e) { return null; }
}

// ─── Secciones sin imágenes (para localStorage) ───────────────────────────────
// FIX: También limpia modulo.imagenes para evitar QuotaExceededError

function sectionsWithoutImages(sections) {
    const s = JSON.parse(JSON.stringify(sections));

    if (s.demolicion) {
        s.demolicion.modulosImagenes = {};
    }

    // FIX CRÍTICO: Limpiar imágenes base64 de módulos antes de guardar en localStorage
    if (s.descripcionModulos && Array.isArray(s.descripcionModulos.modulos)) {
        s.descripcionModulos.modulos = s.descripcionModulos.modulos.map(m => ({
            ...m,
            imagenes: (m.imagenes || []).map(() => null)
        }));
    }

    return s;
}

// ─── Extrae imágenes del state para guardar en IDB ───────────────────────────

function extractImagesFromState(state) {
    const moduloImagenes = [];
    const modulos = state.sections?.descripcionModulos?.modulos || [];

    for (let i = 0; i < modulos.length; i++) {
        const modulo = modulos[i];
        const imagenesModulo = [];

        if (modulo.imagenes && Array.isArray(modulo.imagenes)) {
            for (let j = 0; j < modulo.imagenes.length; j++) {
                const img = modulo.imagenes[j];
                if (typeof img === 'string' && img.startsWith('data:image')) {
                    imagenesModulo.push(img);
                } else {
                    imagenesModulo.push(null);
                }
            }
        }
        moduloImagenes.push(imagenesModulo);
    }

    return {
        previews: state.previews || {},
        moduloImagenes: moduloImagenes,
        demolicionImagenes: state.sections?.demolicion?.modulosImagenes || {},
        generalidadesImages: state.cover?.generalidadesImages || {},
        coverImage: state.cover?.coverImage || null,
    };
}

// ─── Aplica imágenes cargadas desde IDB al objeto de datos ───────────────────

function applyImagesToData(data, images) {
    if (!images) return;
    if (images.previews) data.previews = images.previews;
    if (images.moduloImagenes && data.sections?.descripcionModulos?.modulos) {
        images.moduloImagenes.forEach((imgs, i) => {
            const m = data.sections.descripcionModulos.modulos[i];
            if (m && Array.isArray(imgs) && imgs.length) m.imagenes = imgs;
        });
    }
    if (images.demolicionImagenes && data.sections?.demolicion) {
        data.sections.demolicion.modulosImagenes = images.demolicionImagenes;
    }
    if (images.generalidadesImages) {
        if (!data.cover.generalidadesImages) data.cover.generalidadesImages = {};
        Object.assign(data.cover.generalidadesImages, images.generalidadesImages);
    }
    if (images.coverImage) {
        data.cover.coverImage = images.coverImage;
    }
}

// ─── Extrae cover sin imágenes para localStorage ──────────────────────────────

function coverWithoutImages(cover) {
    const c = { ...cover };
    delete c.coverImage;
    delete c.generalidadesImages;
    return c;
}

// ─── localStorage: solo texto ─────────────────────────────────────────────────

function loadFromStorage() {
    try {
        const storageKey = getStorageKey();
        const raw = localStorage.getItem(storageKey);

        if (raw) {
            const data = JSON.parse(raw);
            // Imágenes SIEMPRE vienen de IDB, nunca de localStorage
            if (data.cover) {
                delete data.cover.coverImage;
                delete data.cover.generalidadesImages;
            }
            if (data.previews) {
                const imgs = extractImagesFromState(data);
                saveImagesToIDB(getStorageOwner(), imgs).then(() => {
                    try {
                        const clean = { cover: coverWithoutImages(data.cover || {}), sections: sectionsWithoutImages(data.sections) };
                        localStorage.setItem(storageKey, JSON.stringify(clean));
                        localStorage.removeItem(storageKey + '_images');
                    } catch (_) { }
                });
            }
            return data;
        }

        const legacy = localStorage.getItem(STORAGE_KEY);
        if (!legacy) return null;
        const data = JSON.parse(legacy);
        if (data.cover) {
            delete data.cover.coverImage;
            delete data.cover.generalidadesImages;
        }
        try {
            const clean = { cover: coverWithoutImages(data.cover || {}), sections: sectionsWithoutImages(data.sections) };
            localStorage.setItem(storageKey, JSON.stringify(clean));
            localStorage.setItem(`${STORAGE_KEY}_owner`, getStorageOwner());
            localStorage.removeItem(STORAGE_KEY);
            saveImagesToIDB(getStorageOwner(), extractImagesFromState(data)).catch(() => { });
        } catch (_) { }
        return data;
    } catch (e) {
        console.warn('Error leyendo store desde localStorage:', e);
        return null;
    }
}

function saveToStorage(state) {
    const storageKey = getStorageKey();
    try {
        const toSave = { cover: coverWithoutImages(state.cover), sections: sectionsWithoutImages(state.sections) };
        localStorage.setItem(storageKey, JSON.stringify(toSave));
        localStorage.setItem(`${STORAGE_KEY}_owner`, getStorageOwner());
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            console.warn('localStorage lleno. Intentando limpiar datos antiguos...');
            try {
                const minimal = {
                    cover: coverWithoutImages(state.cover),
                    sections: sectionsWithoutImages(state.sections)
                };
                localStorage.setItem(storageKey, JSON.stringify(minimal));
            } catch (e2) {
                console.error('No se pudo guardar ni la versión mínima:', e2);
            }
        } else {
            console.warn('Error guardando store en localStorage:', e);
        }
        return false;
    }
    saveImagesToIDB(getStorageOwner(), extractImagesFromState(state)).catch(() => { });
    return true;
}

function readImageFileAsDataUrl(file, maxWidth = 1400, maxHeight = 1000, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.onload = (event) => {
            const originalDataUrl = event.target.result;
            const img = new Image();
            img.onerror = () => resolve(originalDataUrl);
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                const scale = Math.min(1, maxWidth / width, maxHeight / height);

                if (scale === 1 && file.size <= 1024 * 1024) {
                    resolve(originalDataUrl);
                    return;
                }

                width = Math.round(width * scale);
                height = Math.round(height * scale);

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                let output = canvas.toDataURL('image/jpeg', quality);
                let currentQuality = quality;
                while (output.length > 700000 && currentQuality > 0.45) {
                    currentQuality -= 0.08;
                    output = canvas.toDataURL('image/jpeg', currentQuality);
                }
                resolve(output);
            };
            img.src = originalDataUrl;
        };
        reader.readAsDataURL(file);
    });
}

export function createMemoriaDescriptivaStore() {

    const defaults = {
        cover: {
            title: "MEMORIA DESCRIPTIVA",
            subtitle: "ESPECIALIDAD ESTRUCTURAS",
            project: "",
            uei: "",
            unifiedCode: "",
            ieName: "",
            localCode: "",
            modularCodes: "",
            region: "",
            province: "",
            district: "",
            centerTown: "",
            este: "",
            norte: "",
            altitud: "",
            colindanciaNorte: "",
            colindanciaSur: "",
            colindanciaEste: "",
            colindanciaOeste: "",
            ubigeo: { department: "", province: "", district: "" },
            date: new Date().toISOString().split("T")[0],
            preparedBy: "",
            reportType: "MODULOS",
        },

        sections: {
            generalidades: {
                antecedentes: {
                    history: "",
                    demandInitial: "",
                    demandPrimary: "",
                    accessRoads: "",
                    textoCompleto: "",
                    viasAccesoTexto: "",
                },
                datosProyecto: {
                    uei: "",
                    localidad: "",
                    distrito: "",
                    provincia: "",
                    region: "",
                    este: "",
                    norte: "",
                    altitud: "",
                    colindanciaNorte: "",
                    colindanciaSur: "",
                    colindanciaEste: "",
                    colindanciaOeste: "",
                    nombre: "",
                },
                acceso: {
                    limaHuanuco: { tramo: "Lima - Huanuco", distancia: "410", tiempo: "8:00:00", tipo: "Asfaltada" },
                    huanucoTingo: { tramo: "Huanuco - Tingo Maria", distancia: "120", tiempo: "3:00:00", tipo: "Asfaltada" },
                    tingoPucallpa: { tramo: "Tingo Maria - Pucallpa", distancia: "254", tiempo: "5:45:00", tipo: "Asfaltada" },
                    pucallpaContamana: { tramo: "Pucallpa - Contamana", distancia: "248", tiempo: "8:00:00", tipo: "Rapido (Barco)" },
                    total: { tramo: "Total", distancia: "1032", tiempo: "24h y 45 min", tipo: "" },
                },
                objetivos: { general: "", especificos: [] },
                marcoNormativo: [],
            },

            documentosPlanos: {
                documentos: [],
                planos: [
                    { descripcion: "ESTRUCTURA", lamina: "", esEncabezado: true },
                    { descripcion: "PLANO GENERAL DE CIMENTACION GENERAL", lamina: "PG-1" },
                    { descripcion: "PLANO GENERAL DE CIMENTACION GENERAL", lamina: "PG-2" },
                    { descripcion: "PLANO GENERAL DE ALIGERADOS PRIMER NIVEL", lamina: "PG-3" },
                    { descripcion: "PLANO GENERAL DE ALIGERADOS SEGUNDO NIVEL", lamina: "PG-4" },
                    { descripcion: "PLANO GENERAL DE ALIGERADOS TERCER NIVEL", lamina: "PG-5" },
                    { descripcion: "PLANO GENERAL DE ALIGERADOS CUARTO NIVEL", lamina: "PG-6" },
                    { descripcion: "PLANTA GENERAL DE EXPLANACIONES", lamina: "PG-7" },
                    { descripcion: "DETALLES GENERALES MODULO I", lamina: "E-01" },
                    { descripcion: "PLANO DE CIMENTACION MODULO I", lamina: "E-02" },
                    { descripcion: "DETALLE DE CIMENTACION MODULO I", lamina: "E-03" },
                    { descripcion: "PLANO DE ALIGERADO MODULO I", lamina: "E-04" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-05" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-06" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-07" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-08" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-09" },
                    { descripcion: "DETALLES GENERALES MODULO II", lamina: "E-10" },
                    { descripcion: "PLANO DE CIMENTACION MODULO II", lamina: "E-11" },
                    { descripcion: "PLANO DE CIMENTACION MODULO II", lamina: "E-12" },
                    { descripcion: "PLANO DE ALIGERADO MODULO II", lamina: "E-13" },
                ]
            },
            descripcionModulos: {
                modulos: [
                    { id: 1, nombre: "MÓDULO I", uso: "Grupo electrógeno, cuarto de tablero, maestranza, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Sistema de Albañilería confinada", elementosVerticales: "Placa L (PL 100x50x30x30 cm), Columnas CT (70x50x30x30cm), Muros de albañilería e=24cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 2, nombre: "MÓDULO II", uso: "1° Piso: SUM., Comedor / 2° Piso: Módulo de conectividad, depósito AIP y AIP", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 3, nombre: "MÓDULO III", uso: "1° Piso: Biblioteca / 2° Piso: Taller creativo y depósito", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 4, nombre: "MÓDULO IV", uso: "Escalera", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Muro Portante e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x50 cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 5, nombre: "MÓDULO V", uso: "Aulas", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Placa PT (50x100x30x30cm), Albañilería portante e=24cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en X de V30x50cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 6, nombre: "MÓDULO VI", uso: "Aulas y Escalera", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Placa PL (50x50x30x30 cm), Placa PL (65x50x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 7, nombre: "MÓDULO VII", uso: "Cocina, Almacén de alimentos, Cuarto de limpieza, Dep. combustible, etc.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas (30x30 cm), Muro portante e=13cm, Placa e=13cm", elementosHorizontales: "Vigas en X de V30x40cm, Vigas en Y de V30x40cm", techo: "Losa aligerada a una sola agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 8, nombre: "MÓDULO VIII", uso: "1° Piso: Residuos sólidos, Sala de Docentes, Tópico, secretaria, dirección y SS.HH. / 2° Piso: Sala de Docentes, Sala de Reuniones", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Columna CL (50x50x30x30 cm), Placa PT (100x50x30x30cm), Placa 20x200cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 9, nombre: "MÓDULO IX", uso: "Aulas, deposito, almacén, SS.HH, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Albañilería confinada", elementosVerticales: "Placa PT (100x50x30x30 cm), Columnas CT (70x50x30x30cm)", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 10, nombre: "MÓDULO X", uso: "Cocina, depósitos, Comedor, SS.HH, etc.", pisos: 1, sistemaX: "Sistema de Dual", sistemaY: "Sistema de Muros Estructurales", elementosVerticales: "Placas PL (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Placas e=15cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 11, nombre: "MÓDULO XI", uso: "Área de juego", pisos: 1, sistemaX: "Pórticos Ordinarios Resistentes a Momentos (OMF)", sistemaY: "Pórticos Especiales Resistentes a Momentos (SMF)", elementosVerticales: "Columna cuadrada metálico C30x30cm2 e=8mm.", elementosHorizontales: "Vigas W 10x45 en el eje Y y correas de 2x3x3mm. Tijerales en el eje X tubo HSS 4X4X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [], subtitulosImagenes: [] },
                    { id: 12, nombre: "MÓDULO XII", uso: "Cuarto de bombas y/o tanque elevado", pisos: 4, sistemaX: "", sistemaY: "", elementosVerticales: "Columnas CL 60x60x25x25 cm", elementosHorizontales: "Vigas en X de V25x60cm, Vigas en Y de V25x60cm", techo: "Losa maciza e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 13, nombre: "MÓDULO XIII", uso: "Rampa", pisos: 3, sistemaX: "Muros estructurales", sistemaY: "Muros estructurales", elementosVerticales: "Columna rectangular (30x40cm), Placas e=30cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en Y de V30x60cm", techo: "Losa en rampa de 15cm, Losa aligerada de 20cm a dos aguas (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 14, nombre: "MÓDULO XIV", uso: "Guardianía y SS.HH.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas CL (40x40x25x25 cm)", elementosHorizontales: "Vigas en X de V25x40cm, Vigas en Y de V25x40cm", techo: "Losa aligerada a un agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 15, nombre: "MÓDULO XV", uso: "SS.HH.", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Columna CL (50x50x30x30 cm), Placas e=20cm, Albañilería e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa maciza e=20cm (1° y 2° Nivel), Losa aligerada en dos direcciones a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 16, nombre: "MÓDULO XVI", uso: "SUM EXTERIOR", pisos: 1, sistemaX: "Pórticos", sistemaY: "Pórticos", elementosVerticales: "Columna cuadrada de concreto armado C30x30cm2", elementosHorizontales: "Viga de concreto de 30x40cm2 en X. Tijerales en el eje Y tubo HSS 4\"X6\"X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [], subtitulosImagenes: [] }
                ],
                mapeoImagenes: {
                    1: { archivos: ["figura32M1.png"], figuras: [33], subtitulos: [""] },
                    2: { archivos: ["figura33.png", "figura34M2.png"], figuras: [33, 34], subtitulos: [" (Planta)", " (Elevación)"] },
                    3: { archivos: ["figura35.png", "figura36.png"], figuras: [35, 36], subtitulos: [" (Planta)", " (Elevación)"] },
                    4: { archivos: ["figura37.png", "figura38.png", "figura39.png"], figuras: [37, 38, 39], subtitulos: [" (Planta)", " (Elevación)", " (Sección)"] },
                    5: { archivos: ["figura10M5.png", "figura11M5.png", "figura12M5.png"], figuras: [38, 39, 40], subtitulos: [" (Planta)", " (Elevación)", " (Sección)"] },
                    6: { archivos: ["figura13M6.png", "figura14M6.png", "figura15M6.png"], figuras: [39, 40, 41], subtitulos: [" (Planta)", " (Elevación)", " (Sección)"] },
                    7: { archivos: ["figura39.png"], figuras: [40], subtitulos: [""] },
                    8: { archivos: ["figura417M8.png", "figura418M8.png"], figuras: [41, 42], subtitulos: [" (Planta)", " (Elevación)"] },
                    9: { archivos: ["figura19M9.png"], figuras: [43], subtitulos: [""] },
                    10: { archivos: ["figura20M10.png"], figuras: [44], subtitulos: [""] },
                    11: { archivos: ["figura21M11.png"], figuras: [45], subtitulos: [""] },
                    12: { archivos: ["figura22M12.png"], figuras: [46], subtitulos: [""] },
                    13: { archivos: ["figura23M13.png", "figura24M13.png", "figura25M13.png"], figuras: [47, 48, 49], subtitulos: [" (Vista 1)", " (Vista 2)", " (Vista 3)"] },
                    14: { archivos: ["figura26M14.png"], figuras: [50], subtitulos: [""] },
                    15: { archivos: ["figura27M15.png", "figura28M15.png", "figura29M15.png"], figuras: [51, 52, 53], subtitulos: [" (Vista 1)", " (Vista 2)", " (Vista 3)"] },
                    16: { archivos: ["figura30M16.png"], figuras: [54], subtitulos: [""] }
                },
                obrasExtInt: [
                    { numero: 17, nombre: "OBRAS EXTERIORES I - CERCO PERIMETRICO", tipoTabla: "cincoFilas", uso: "Cerco Perimetral", nropisos: "1 piso", sistemaEstructural: "Albañilería Confinada", descripcion: "Conformado por muros de contención, columnas, vigas y ladrillo.", techo: "No cuenta con techo.", tieneImagen: true, archivos: ["figura31PlanoElevacion.png"], figuras: [55], subtitulos: [""] },
                    { numero: 18, nombre: "OBRAS EXTERIORES II - PORTADA PRIMARIA", tipoTabla: "cuatroFilas", uso: "Portada principal primaria", nropisos: "1 piso", descripcion: "Conformación por muros y columnas", techo: "No cuenta con techo.", tieneImagen: true, archivos: ["figura32PlanoPortico.png"], figuras: [56], subtitulos: [""] },
                    { numero: 19, nombre: "OBRAS EXTERIORES III - PORTADA INICIAL", tipoTabla: "cuatroFilas", uso: "Portada principal inicial", nropisos: "1 piso", descripcion: "Conformación por muros y columnas", techo: "No cuenta con techo", tieneImagen: true, archivos: ["figura33PlanoPortico.png"], figuras: [57], subtitulos: [""] },
                    { numero: 20, nombre: "OBRAS EXTERIORES IV - DETALLE DE SARDINEL", tipoTabla: "unaFila", uso: "Sardinel: Soportes o cerco de jardinería", tieneImagen: true, archivos: ["figura34PlanoPlanta.png", "figura35PlanoPlanta.png", "figura36PlanoPlanta.png"], figuras: [58, 59, 60], subtitulos: [" (Vista 1)", " (Vista 2)", " (Vista 3)"] },
                    { numero: 21, nombre: "OBRAS EXTERIORES V - DETALLE DE RAMPA EL SUELO", tipoTabla: "dosFilas", uso: "Ingreso, paso peatonal (rampas)", nropisos: "Apoyado sobre el suelo.", tieneImagen: true, archivos: ["figura37PlanoPlanta.png"], figuras: [61], subtitulos: [""] },
                    { numero: 22, nombre: "OBRAS INTERIORES I - DETALLE DE COCINA", tipoTabla: "unaFila", uso: "Detalles de concreto armado\n-Mesa de concreto: Mesada de concreto armado f´c=140 kg/cm2 con acabados el espesor será e=10cm en Cocina Primaria e Inicial.", tieneImagen: true, archivos: ["figura38PlanoPlanta.png", "figura39PlanoPlanta.png"], figuras: [62, 63], subtitulos: [" (Vista 1)", " (Vista 2)"] },
                    { numero: 23, nombre: "OBRAS INTERIORES II - DETALLE DE LAVADERO", tipoTabla: "unaFila", uso: "Detalles de concreto armado\n-Lavandería de concreto armado.", tieneImagen: true, archivos: ["figura40PlanoCuarta.png", "figura41PlanoCuarta.png", "figura42PlanoServicio.png"], figuras: [64, 65, 66], subtitulos: [" (Vista 1)", " (Vista 2)", " (Vista 3)"] }
                ]
            },
            marcoTeorico: {
                conceptosBasicos: "Las edificaciones de los centros educativos, considerada una estructura esencial de clase A, deben distribuirse los elementos estructurales de manera adecuada.",
                criteriosEstructurales: [],
                eleccionSistema: "",
                elementosEstructurales: [],
                materiales: {
                    concreto: { fc: "210", ec: "217370.65", peso: "2.4", poisson: "0.20", descripcionGeneral: "", descripcionResistencia: "", descripcionModulo: "", descripcionFormula: "" },
                    acero: { fy: "4200", es: "2000000", peso: "7.85", descripcionGeneral: "", descripcionFluencia: "", descripcionModulo: "" },
                    cargaMuerta: { descripcion: "", items: [] },
                    cargaViva: { descripcion: "", items: [] },
                    albanileria: { fm: "85", vm: "9.2", em: "500", poisson: "0.25" }
                },
                software: "",
                parametrosSismicos: {
                    zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                    tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", ro: "7",
                    irregularidades: { altura: false, planta: false },
                    textoIntro: "", textoFactorZona: "", textoZonaUbicacion: "",
                    textoGeotecnico: "", textoPeriodo: "", textoCoeficiente: "",
                    formulas: [], textoSiendo: "", textoListaSiendo: [],
                    textoCategoria: "", textoProyecto: "", textoIrregularidadAltura: "",
                    textoIrregularidadPlanta: "", textoFormulaR: "R = R₀ * Ia * Ip",
                    textoDonde: "", listaDonde: [], textoFuenteTabla: "",
                    textoTanque: "", textoFuenteTanque: ""
                },
                verificaciones: {
                    textoCortante: "", textoCortanteNorma: "", textoDerivas: "",
                    textoDerivasTabla: "", textoJunta: "", textoJuntaFormula: "",
                    formulaJunta: "S = 0.006 h ≥ 0.03 m"
                }
            },
            consideraciones: {},
            predimensionamiento: {},
            demolicion: {
                alcance: "",
                modulosADemoler: [],
                obrasExterioresADemoler: [],
                modulosImagenes: {},
            },
        },

        previews: {
            coverImage: null,
            coverImage2: null,
            ubicacionImage: null,
            ubicacionImage1: null,
            ubicacionImage2: null,
            demandaInicialImage: null,
            demandaPrimariaImage: null,
            marcoTeoricoImages: [null, null, null, null],
            moduloImages: Array.from({ length: 16 }, () => [null, null]),
            demolicionImages: [],
            predimLosaImage: {},
            predimVigaImage: {},
            predimColumnaImage: {},
        },

        ui: {
            activeSection: "section-generalidades",
            isExporting: false,
            errors: [],
        },
    };

    const saved = loadFromStorage();
    const initialState = saved
        ? deepMerge(defaults, saved)
        : defaults;
    normalizeViasAcceso(initialState);
    normalizeConsideraciones(initialState);

    const store = {
        ...initialState,

        images: {
            coverImage: null,
            coverImage2: null,
            ubicacionImage: null,
            ubicacionImage1: null,
            ubicacionImage2: null,
            demandaInicialImage: null,
            demandaPrimariaImage: null,
            moduloImages: Array.from({ length: 16 }, () => [null, null]),
            demolicionImages: [],
        },

        getModuleImage(idx) {
            return this.sections.demolicion.modulosImagenes?.[idx] || null;
        },

        save() {
            return saveToStorage(this);
        },

        resetAll() {
            localStorage.removeItem(getStorageKey());
            localStorage.removeItem(`${STORAGE_KEY}_owner`);
            window.location.reload();
        },

        updateCover(data) {
            this.cover = { ...this.cover, ...data };
            this.save();
        },

        updateSection(sectionId, data) {
            if (this.sections[sectionId]) {
                this.sections[sectionId] = { ...this.sections[sectionId], ...data };
                this.save();
            }
        },

        addObjetivoEspecifico() {
            this.sections.generalidades.objetivos.especificos.push("");
            this.save();
        },
        removeObjetivoEspecifico(index) {
            this.sections.generalidades.objetivos.especificos.splice(index, 1);
            this.save();
        },

        addMarcoNormativo() {
            this.sections.generalidades.marcoNormativo.push("");
            this.save();
        },
        removeMarcoNormativo(index) {
            this.sections.generalidades.marcoNormativo.splice(index, 1);
            this.save();
        },

        // ─── Módulos: métodos unificados (SIN DUPLICADOS) ─────────────────────

        getDefaultModulos() {
            return [
                { id: 1, nombre: "MÓDULO I", uso: "Grupo electrógeno, cuarto de tablero, maestranza, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Sistema de Albañilería confinada", elementosVerticales: "Placa L (PL 100x50x30x30 cm), Columnas CT (70x50x30x30cm), Muros de albañilería e=24cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 2, nombre: "MÓDULO II", uso: "1° Piso: SUM., Comedor / 2° Piso: Módulo de conectividad, depósito AIP y AIP", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 3, nombre: "MÓDULO III", uso: "1° Piso: Biblioteca / 2° Piso: Taller creativo y depósito", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 4, nombre: "MÓDULO IV", uso: "Escalera", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Muro Portante e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x50 cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 5, nombre: "MÓDULO V", uso: "Aulas", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Placa PT (50x100x30x30cm), Albañilería portante e=24cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en X de V30x50cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 6, nombre: "MÓDULO VI", uso: "Aulas y Escalera", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Placa PL (50x50x30x30 cm), Placa PL (65x50x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 7, nombre: "MÓDULO VII", uso: "Cocina, Almacén de alimentos, Cuarto de limpieza, Dep. combustible, etc.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas (30x30 cm), Muro portante e=13cm, Placa e=13cm", elementosHorizontales: "Vigas en X de V30x40cm, Vigas en Y de V30x40cm", techo: "Losa aligerada a una sola agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 8, nombre: "MÓDULO VIII", uso: "1° Piso: Residuos sólidos, Sala de Docentes, Tópico, secretaria, dirección y SS.HH. / 2° Piso: Sala de Docentes, Sala de Reuniones", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Columna CL (50x50x30x30 cm), Placa PT (100x50x30x30cm), Placa 20x200cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 9, nombre: "MÓDULO IX", uso: "Aulas, deposito, almacén, SS.HH, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Albañilería confinada", elementosVerticales: "Placa PT (100x50x30x30 cm), Columnas CT (70x50x30x30cm)", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 10, nombre: "MÓDULO X", uso: "Cocina, depósitos, Comedor, SS.HH, etc.", pisos: 1, sistemaX: "Sistema de Dual", sistemaY: "Sistema de Muros Estructurales", elementosVerticales: "Placas PL (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Placas e=15cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 11, nombre: "MÓDULO XI", uso: "Área de juego", pisos: 1, sistemaX: "Pórticos Ordinarios Resistentes a Momentos (OMF)", sistemaY: "Pórticos Especiales Resistentes a Momentos (SMF)", elementosVerticales: "Columna cuadrada metálico C30x30cm2 e=8mm.", elementosHorizontales: "Vigas W 10x45 en el eje Y y correas de 2x3x3mm. Tijerales en el eje X tubo HSS 4X4X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [], subtitulosImagenes: [] },
                { id: 12, nombre: "MÓDULO XII", uso: "Cuarto de bombas y/o tanque elevado", pisos: 4, sistemaX: "", sistemaY: "", elementosVerticales: "Columnas CL 60x60x25x25 cm", elementosHorizontales: "Vigas en X de V25x60cm, Vigas en Y de V25x60cm", techo: "Losa maciza e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 13, nombre: "MÓDULO XIII", uso: "Rampa", pisos: 3, sistemaX: "Muros estructurales", sistemaY: "Muros estructurales", elementosVerticales: "Columna rectangular (30x40cm), Placas e=30cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en Y de V30x60cm", techo: "Losa en rampa de 15cm, Losa aligerada de 20cm a dos aguas (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 14, nombre: "MÓDULO XIV", uso: "Guardianía y SS.HH.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas CL (40x40x25x25 cm)", elementosHorizontales: "Vigas en X de V25x40cm, Vigas en Y de V25x40cm", techo: "Losa aligerada a un agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 15, nombre: "MÓDULO XV", uso: "SS.HH.", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Columna CL (50x50x30x30 cm), Placas e=20cm, Albañilería e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa maciza e=20cm (1° y 2° Nivel), Losa aligerada en dos direcciones a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 16, nombre: "MÓDULO XVI", uso: "SUM EXTERIOR", pisos: 1, sistemaX: "Pórticos", sistemaY: "Pórticos", elementosVerticales: "Columna cuadrada de concreto armado C30x30cm2", elementosHorizontales: "Viga de concreto de 30x40cm2 en X. Tijerales en el eje Y tubo HSS 4\"X6\"X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [], subtitulosImagenes: [] }
            ];
        },

        // FIX: Método único addModulo sin duplicado
        addModulo() {
            const modulosActuales = this.sections.descripcionModulos.modulos;

            const romanoANumero = (romano) => {
                const m = { 'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10,'XI':11,'XII':12,'XIII':13,'XIV':14,'XV':15,'XVI':16 };
                return m[String(romano).toUpperCase()] || null;
            };

            const extraerNumero = (nombre) => {
                if (!nombre) return null;
                const partes = String(nombre).trim().split(/\s+/);
                const ultimo = partes[partes.length - 1];
                const n = parseInt(ultimo, 10);
                return Number.isFinite(n) ? n : romanoANumero(ultimo);
            };

            const numerosExistentes = modulosActuales
                .map(m => extraerNumero(m.nombre))
                .filter(n => n !== null)
                .sort((a, b) => a - b);

            let numeroFaltante = null;
            for (let i = 1; i <= 16; i++) {
                if (!numerosExistentes.includes(i)) { numeroFaltante = i; break; }
            }

            const nuevoNumero = numeroFaltante !== null
                ? numeroFaltante
                : Math.max(0, ...numerosExistentes) + 1;

            let nuevoModulo;
            if (nuevoNumero <= 16) {
                const predefinido = this.getDefaultModulos()[nuevoNumero - 1];
                nuevoModulo = predefinido
                    ? { ...predefinido, id: Date.now(), imagenes: [], subtitulosImagenes: [] }
                    : { id: Date.now(), nombre: `MÓDULO ${nuevoNumero}`, uso: "", pisos: 1, sistemaX: "", sistemaY: "", elementosVerticales: "", elementosHorizontales: "", techo: "", imagenes: [], subtitulosImagenes: [] };
            } else {
                nuevoModulo = { id: Date.now(), nombre: `MÓDULO ${nuevoNumero}`, uso: "", pisos: 1, sistemaX: "", sistemaY: "", elementosVerticales: "", elementosHorizontales: "", techo: "", imagenes: [], subtitulosImagenes: [] };
            }

            modulosActuales.push(nuevoModulo);
            modulosActuales.sort((a, b) => (extraerNumero(a.nombre) || 99) - (extraerNumero(b.nombre) || 99));
            this.save();
        },

        // FIX: Método único removeModulo sin duplicado
        removeModulo(idx) {
            if (this.sections?.descripcionModulos?.modulos?.[idx] !== undefined) {
                this.sections.descripcionModulos.modulos.splice(idx, 1);
                if (Array.isArray(this.images?.moduloImages)) this.images.moduloImages.splice(idx, 1);
                if (Array.isArray(this.previews?.moduloImages)) this.previews.moduloImages.splice(idx, 1);
                this.save();
            }
        },

        romanoANumero(romano) {
            const m = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10,'XI':11,'XII':12,'XIII':13,'XIV':14,'XV':15,'XVI':16};
            return m[String(romano || '').toUpperCase()] || null;
        },

        extraerNumeroModulo(nombre) {
            if (!nombre) return null;
            const partes = String(nombre).trim().split(/\s+/);
            const ultimo = partes[partes.length - 1];
            const n = parseInt(ultimo, 10);
            return Number.isFinite(n) ? n : this.romanoANumero(ultimo);
        },

        numeroARomano(num) {
            const m = {1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X',11:'XI',12:'XII',13:'XIII',14:'XIV',15:'XV',16:'XVI'};
            return m[num] || String(num).padStart(2, '0');
        },

        sincronizarImagenesPorPisos(moduloIndex) {
            const modulos = this.sections.descripcionModulos.modulos;
            const modulo = modulos[moduloIndex];
            if (!modulo) return;

            const pisos = parseInt(modulo.pisos) || 1;
            modulo.pisos = pisos;

            if (!modulo.imagenes) modulo.imagenes = [];
            if (!modulo.subtitulosImagenes) modulo.subtitulosImagenes = [];
            while (modulo.imagenes.length < pisos) modulo.imagenes.push(null);
            while (modulo.subtitulosImagenes.length < pisos) modulo.subtitulosImagenes.push("");

            this.save();
        },

        async subirImagenModulo(moduloIndex, nivelIndex, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { alert('Seleccione una imagen válida'); return; }
            if (file.size > 10 * 1024 * 1024) { alert('El archivo excede 10 MB'); return; }

            const modulos = this.sections.descripcionModulos.modulos;
            const modulo = modulos[moduloIndex];
            if (!modulo.imagenes) modulo.imagenes = [];
            while (modulo.imagenes.length <= nivelIndex) modulo.imagenes.push(null);

            try {
                modulo.imagenes[nivelIndex] = await readImageFileAsDataUrl(file);
                this.save();
                if (event.target) event.target.value = '';
            } catch (error) {
                console.error('Error al procesar imagen de modulo:', error);
                alert('No se pudo procesar la imagen seleccionada');
            }
        },

        eliminarImagenModulo(moduloIndex, nivelIndex) {
            const modulo = this.sections.descripcionModulos.modulos[moduloIndex];
            if (modulo && modulo.imagenes) {
                modulo.imagenes[nivelIndex] = null;
                this.save();
            }
        },

        // ─── Demolición ────────────────────────────────────────────────────────
        addModuloADemoler() {
            if (!this.sections.demolicion.modulosADemoler) this.sections.demolicion.modulosADemoler = [];
            if (!this.sections.demolicion.modulosImagenes) this.sections.demolicion.modulosImagenes = {};
            this.sections.demolicion.modulosADemoler.push("");
            this.save();
        },

        removeModuloADemoler(idx) {
            if (this.sections.demolicion.modulosADemoler) {
                this.sections.demolicion.modulosADemoler.splice(idx, 1);
                if (this.sections.demolicion.modulosImagenes) {
                    delete this.sections.demolicion.modulosImagenes[idx];
                }
                this.save();
            }
        },

        addObraExteriorADemoler() {
            if (!this.sections.demolicion.obrasExterioresADemoler) this.sections.demolicion.obrasExterioresADemoler = [];
            this.sections.demolicion.obrasExterioresADemoler.push("");
            this.save();
        },

        removeObraExteriorADemoler(idx) {
            if (this.sections.demolicion.obrasExterioresADemoler) {
                this.sections.demolicion.obrasExterioresADemoler.splice(idx, 1);
                this.save();
            }
        },

        triggerImageUpload(idx) {
            const input = document.getElementById(`modulo-img-${idx}`);
            if (input) input.click();
        },

        async handleModuleImageUpload(idx, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { alert('Selecciona una imagen válida'); return; }
            if (file.size > 10 * 1024 * 1024) { alert('La imagen no puede superar los 10MB'); return; }
            try {
                const dataUrl = await readImageFileAsDataUrl(file);
                if (!this.sections.demolicion.modulosImagenes) this.sections.demolicion.modulosImagenes = {};
                this.sections.demolicion.modulosImagenes[idx] = dataUrl;
                this.save();
                if (event.target) event.target.value = '';
            } catch (error) {
                console.error('Error al procesar imagen:', error);
                alert('No se pudo procesar la imagen seleccionada');
            }
        },

        removeModuleImage(idx) {
            if (this.sections.demolicion.modulosImagenes) {
                delete this.sections.demolicion.modulosImagenes[idx];
                this.save();
            }
        },

        // ─── Imágenes simples ──────────────────────────────────────────────────
        updateImage(key, file, preview) {
            this.images[key] = file;
            this.previews[key] = preview;
            if (key === 'coverImage') this.cover.coverImage = preview;
            this.save();
        },

        removeImage(key) {
            this.images[key] = null;
            this.previews[key] = null;
            if (key === 'coverImage') this.cover.coverImage = null;
            const imagenesGeneralidades = ['demandaInicialImage', 'demandaPrimariaImage', 'ubicacionImage1', 'ubicacionImage2', 'ubicacionImage'];
            if (imagenesGeneralidades.includes(key) && this.cover.generalidadesImages) {
                delete this.cover.generalidadesImages[key];
            }
            this.save();
        },

        async handleImageChange(key, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { alert('Seleccione una imagen válida'); return; }
            if (file.size > 10 * 1024 * 1024) { alert('El archivo excede 10 MB'); return; }
            try {
                const dataUrl = await readImageFileAsDataUrl(file);
                this.images[key] = file;
                this.previews[key] = dataUrl;
                if (key === 'coverImage') this.cover.coverImage = dataUrl;
                const imagenesGeneralidades = ['demandaInicialImage', 'demandaPrimariaImage', 'ubicacionImage1', 'ubicacionImage2', 'ubicacionImage'];
                if (imagenesGeneralidades.includes(key)) {
                    if (!this.cover.generalidadesImages) this.cover.generalidadesImages = {};
                    this.cover.generalidadesImages[key] = dataUrl;
                }
                this.save();
                if (event.target) event.target.value = '';
            } catch (error) {
                console.error('Error al procesar imagen:', error);
                alert('No se pudo procesar la imagen seleccionada');
            }
        },

        async handleModuloImageChange(moduloIndex, imageIndex, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { alert('Seleccione una imagen válida'); return; }
            if (file.size > 10 * 1024 * 1024) { alert('El archivo excede 10 MB'); return; }
            try {
                const dataUrl = await readImageFileAsDataUrl(file);
                this.updateModuloImage(moduloIndex, imageIndex, file, dataUrl);
                if (event.target) event.target.value = '';
            } catch (error) {
                alert('No se pudo procesar la imagen seleccionada');
            }
        },

        updateModuloImage(moduloIndex, imageIndex, file, dataUrl) {
            if (!Array.isArray(this.images.moduloImages[moduloIndex])) this.images.moduloImages[moduloIndex] = [];
            if (!Array.isArray(this.previews.moduloImages[moduloIndex])) this.previews.moduloImages[moduloIndex] = [];
            this.images.moduloImages[moduloIndex][imageIndex] = file;
            this.previews.moduloImages[moduloIndex][imageIndex] = dataUrl;
            this.save();
        },

        removeModuloImage(moduloIndex, imageIndex) {
            if (Array.isArray(this.images.moduloImages?.[moduloIndex]))
                this.images.moduloImages[moduloIndex][imageIndex] = null;
            if (Array.isArray(this.previews.moduloImages?.[moduloIndex]))
                this.previews.moduloImages[moduloIndex][imageIndex] = null;
            this.save();
        },

        async handleDemolicionImageChange(index, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const dataUrl = await readImageFileAsDataUrl(file);
                if (!this.previews.demolicionImages) this.previews.demolicionImages = [];
                this.previews.demolicionImages[index] = dataUrl;
                this.save();
                if (event.target) event.target.value = '';
            } catch (error) {
                console.error('Error al procesar imagen demolición:', error);
            }
        },
        removeDemolicionImage(index) {
            if (this.previews.demolicionImages) {
                this.previews.demolicionImages[index] = null;
                this.save();
            }
        },
        addDemolicionImage() {
            if (!this.previews.demolicionImages) this.previews.demolicionImages = [];
            this.previews.demolicionImages.push(null);
            this.save();
        },

        async handlePredimLosaImageChange(modulo, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const dataUrl = await readImageFileAsDataUrl(file);
                if (!this.previews.predimLosaImage) this.previews.predimLosaImage = {};
                this.previews.predimLosaImage[modulo] = dataUrl;
                this.save();
                if (event.target) event.target.value = '';
            } catch (error) { console.error(error); }
        },
        removePredimLosaImage(modulo) {
            if (this.previews.predimLosaImage) { delete this.previews.predimLosaImage[modulo]; this.save(); }
        },
        async handlePredimVigaImageChange(modulo, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const dataUrl = await readImageFileAsDataUrl(file);
                if (!this.previews.predimVigaImage) this.previews.predimVigaImage = {};
                this.previews.predimVigaImage[modulo] = dataUrl;
                this.save();
                if (event.target) event.target.value = '';
            } catch (error) { console.error(error); }
        },
        removePredimVigaImage(modulo) {
            if (this.previews.predimVigaImage) { delete this.previews.predimVigaImage[modulo]; this.save(); }
        },

        initModuloImages() {
            if (!Array.isArray(this.images.moduloImages)) this.images.moduloImages = [];
            if (!Array.isArray(this.previews.moduloImages)) this.previews.moduloImages = [];
            for (let i = 0; i < 16; i++) {
                if (!Array.isArray(this.images.moduloImages[i])) this.images.moduloImages[i] = [null, null];
                if (!Array.isArray(this.previews.moduloImages[i])) this.previews.moduloImages[i] = [null, null];
            }
        },

        // ─── UI ────────────────────────────────────────────────────────────────
        addError(category, message) {
            this.ui.errors.push({ category, message, timestamp: Date.now() });
        },
        clearErrors() { this.ui.errors = []; },
        startExport() { this.ui.isExporting = true; this.clearErrors(); },
        endExport() { this.ui.isExporting = false; },
        getExportData() {
            return {
                cover: this.cover,
                sections: this.sections,
                images: this.images,
                previews: this.previews,
            };
        },

        async exportWord() {
            if (!window.docx || !window.saveAs) {
                alert('Las librerías no están cargadas. Recarga la página e intenta de nuevo.');
                return;
            }
            try {
                const [
                    { buildContentStructure, DEFAULT_MD_STRUCTURE },
                    { ContentProcessorMD },
                    { DocumentTransformerMD },
                    ubigeoModule
                ] = await Promise.all([
                    import('../content-structure-md.js'),
                    import('../content-processor-md.js'),
                    import('../processors/documentTransformer-md.js'),
                    import('../ubigeo.json')
                ]);

                const ubigeoData = ubigeoModule.default || ubigeoModule;
                const exportData = this.getExportData();

                const structure = buildContentStructure({
                    cover: exportData.cover,
                    sections: exportData.sections,
                    document: JSON.parse(JSON.stringify(DEFAULT_MD_STRUCTURE.document))
                });

                const transformer = new DocumentTransformerMD(exportData, ubigeoData);
                transformer.applyAll(structure);

                const processor = new ContentProcessorMD(window.docx, exportData);
                const allImages = { ...exportData.images, ...exportData.previews };
                const doc = await processor.buildDocument(structure, allImages);

                const blob = await window.docx.Packer.toBlob(doc);
                const date = new Date().toISOString().split('T')[0];
                const project = (exportData.cover.project || 'memoria_descriptiva')
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '_')
                    .substring(0, 40);
                window.saveAs(blob, `${project}_${date}.docx`);
            } catch (error) {
                console.error('Error exportando:', error);
                alert('Error al exportar: ' + error.message);
            }
        },

        // FIX CRÍTICO: init() asíncrono manejado correctamente
        // Se expone como método separado para llamar desde Alpine x-init
        async loadImages() {
            try { localStorage.removeItem(getStorageKey() + '_images'); } catch (_) { }

            const images = await loadImagesFromIDB(getStorageOwner());
            if (!images) return;

            if (images.generalidadesImages) {
                if (!this.cover.generalidadesImages) this.cover.generalidadesImages = {};
                Object.assign(this.cover.generalidadesImages, images.generalidadesImages);
                Object.keys(images.generalidadesImages).forEach(key => {
                    this.previews[key] = images.generalidadesImages[key];
                });
            }

            if (images.coverImage) {
                this.cover.coverImage = images.coverImage;
                this.previews.coverImage = images.coverImage;
            }

            if (images.previews) {
                Object.keys(images.previews).forEach(key => {
                    if (!this.previews[key]) this.previews[key] = images.previews[key];
                });
            }

            if (images.moduloImagenes && this.sections?.descripcionModulos?.modulos) {
                images.moduloImagenes.forEach((imgs, i) => {
                    const m = this.sections.descripcionModulos.modulos[i];
                    if (m && Array.isArray(imgs) && imgs.some(x => x)) m.imagenes = imgs;
                });
            }
            if (images.demolicionImagenes && this.sections?.demolicion) {
                Object.assign(this.sections.demolicion.modulosImagenes, images.demolicionImagenes);
            }
        },

        // Mantener init() por compatibilidad pero ahora es síncrono
        // La carga de imágenes se hace via loadImages() llamado desde Alpine
        init() {
            this.loadImages().catch(e => console.warn('Error cargando imágenes desde IDB:', e));
        },

        // ─── Análisis sísmico ──────────────────────────────────────────────────
        inicializarAnalisisModulo(moduloId) {
            const modulo = this.sections.consideraciones[moduloId];
            if (!modulo) return;
            if (!modulo.analisisX || !modulo.analisisX.factorZ) {
                modulo.analisisX = { factorZ: "0.25", factorU: "1.50", factorS: "1.40", tp: "1.00", tl: "1.60", c: "2.50", t: "6.00", r: "6.00", cr: "0.2188" };
            }
            if (!modulo.analisisY || !modulo.analisisY.factorZ) {
                modulo.analisisY = { factorZ: "0.25", factorU: "1.50", factorS: "1.40", tp: "1.00", tl: "1.60", c: "2.50", t: "6.00", r: "6.00", cr: "0.359" };
            }
            this.save();
        },
    };

    store.initModuloImages();

    return store;
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

function deepMerge(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    output[key] = source[key];
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else if (Array.isArray(source[key]) && source[key].length > 0) {
                output[key] = source[key];
            } else if (source[key] !== null && source[key] !== undefined && source[key] !== "") {
                output[key] = source[key];
            }
        });
    }
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

function normalizeViasAcceso(state) {
    const acceso = state.sections?.generalidades?.acceso;
    if (!isObject(acceso)) return;
    const defaults = {
        limaHuanuco: { tramo: "Lima - Huanuco", distancia: "410", tiempo: "8:00:00", tipo: "Asfaltada" },
        huanucoTingo: { tramo: "Huanuco - Tingo Maria", distancia: "120", tiempo: "3:00:00", tipo: "Asfaltada" },
        tingoPucallpa: { tramo: "Tingo Maria - Pucallpa", distancia: "254", tiempo: "5:45:00", tipo: "Asfaltada" },
        pucallpaContamana: { tramo: "Pucallpa - Contamana", distancia: "248", tiempo: "8:00:00", tipo: "Rapido (Barco)" },
        total: { tramo: "Total", distancia: "1032", tiempo: "24h y 45 min", tipo: "" },
    };
    Object.entries(defaults).forEach(([key, fallback]) => {
        acceso[key] = { ...fallback, ...(isObject(acceso[key]) ? acceso[key] : {}) };
    });
}

function normalizeConsideraciones(state) {
    if (!state.sections) state.sections = {};
    if (!isObject(state.sections.consideraciones)) state.sections.consideraciones = {};

    const defaultGeotecnia = { perfilSuelo: "TIPO III -- SUELOS BLANDOS", capacidadPortante: "0.50", profundidad: "1.40", agresividadSulfatos: "Ataque no perjudicial", profNF: "A 1.40m y 1.50m" };
    const defaultSismico = { zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40", tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "6", coeficienteR_X: "6", coeficienteR_Y: "6", sistemaX: "placas", sistemaY: "placas" };
    const defaultAnalisis = { factorZ: "0.25", factorU: "1.50", factorS: "1.40", tp: "1.00", tl: "1.60", c: "2.50", t: "6.00", r: "6.00", cr: "0.2188" };
    const defaultCombinaciones = { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true };

    for (let i = 1; i <= 16; i++) {
        const actual = isObject(state.sections.consideraciones[i])
            ? state.sections.consideraciones[i]
            : {};
        actual.geotecnia = deepMerge(defaultGeotecnia, actual.geotecnia || {});
        actual.sismico = deepMerge(defaultSismico, actual.sismico || {});
        actual.analisisX = isObject(actual.analisisX) ? deepMerge(defaultAnalisis, actual.analisisX) : { ...defaultAnalisis };
        actual.analisisY = isObject(actual.analisisY) ? deepMerge({ ...defaultAnalisis, cr: "0.359" }, actual.analisisY) : { ...defaultAnalisis, cr: "0.359" };
        actual.combinaciones = deepMerge(defaultCombinaciones, actual.combinaciones || {});
        if (!actual.sobrecargas) actual.sobrecargas = "- Sobrecarga en Aulas: 250 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2";
        if (!actual.recubrimientos) actual.recubrimientos = "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm";
        if (!actual.materiales) actual.materiales = "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2";
        state.sections.consideraciones[i] = actual;
    }
}