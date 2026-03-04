// utils/imageHandler.js - Utilidades para manejo de imágenes

/**
 * Lee un archivo como Data URL
 * @param {File} file - Archivo a leer
 * @returns {Promise<string>} Data URL del archivo
 */
export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Convierte Data URL a ArrayBuffer
 * @param {string} dataUrl - Data URL
 * @returns {ArrayBuffer} ArrayBuffer
 */
export function dataUrlToArrayBuffer(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') {
        return null;
    }

    try {
        const parts = dataUrl.split(',');
        if (parts.length !== 2) {
            return null;
        }

        const base64 = parts[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes.buffer;
    } catch (error) {
        console.error('Error converting Data URL to ArrayBuffer:', error);
        return null;
    }
}

/**
 * Valida si un archivo es una imagen válida
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB (default: 10)
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateImageFile(file, maxSizeMB = 10) {
    if (!file) {
        return { valid: false, error: 'No se proporcionó ningún archivo' };
    }

    // Validar tipo MIME
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Formato no válido. Use JPG, PNG, GIF o WebP'
        };
    }

    // Validar tamaño
    const maxSize = maxSizeMB * 1024 * 1024; // Convertir a bytes
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `El archivo excede el tamaño máximo de ${maxSizeMB}MB`
        };
    }

    return { valid: true, error: null };
}

/**
 * Maneja el cambio de imagen desde un input file
 * @param {Event} event - Evento del input file
 * @param {Function} onSuccess - Callback con (file, dataUrl)
 * @param {Function} onError - Callback con (error)
 * @param {number} maxSizeMB - Tamaño máximo en MB
 */
export async function handleImageChange(event, onSuccess, onError, maxSizeMB = 10) {
    try {
        const file = event.target?.files?.[0];

        if (!file) {
            return;
        }

        // Validar archivo
        const validation = validateImageFile(file, maxSizeMB);
        if (!validation.valid) {
            if (onError) {
                onError(validation.error);
            }
            return;
        }

        // Leer archivo
        const dataUrl = await readFileAsDataURL(file);

        if (onSuccess) {
            onSuccess(file, dataUrl);
        }
    } catch (error) {
        console.error('Error handling image change:', error);
        if (onError) {
            onError('Error al procesar la imagen');
        }
    }
}

/**
 * Redimensiona una imagen manteniendo el aspect ratio
 * @param {string} dataUrl - Data URL de la imagen
 * @param {number} maxWidth - Ancho máximo
 * @param {number} maxHeight - Alto máximo
 * @returns {Promise<string>} Data URL de la imagen redimensionada
 */
export function resizeImage(dataUrl, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calcular nuevas dimensiones manteniendo aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = width * (maxHeight / height);
                    height = maxHeight;
                }
            }

            // Crear canvas y redimensionar
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a Data URL
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };

        img.onerror = reject;
        img.src = dataUrl;
    });
}
