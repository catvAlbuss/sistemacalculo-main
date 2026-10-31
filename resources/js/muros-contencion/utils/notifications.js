import { SYSTEM_CONSTANTS } from '../config/constants.js'
import BaseSwal from 'sweetalert2';

const Swal = BaseSwal.mixin({ customClass: { popup: 'wall-notification' } });

export class NotificationManager {
    static showSuccess(title, text = '', callback = null) {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            confirmButtonText: 'Continuar',
            timer: SYSTEM_CONSTANTS.NOTIFICATION_TIMERS.SUCCESS,
            timerProgressBar: true
        }).then((result) => {
            if (callback && result.isConfirmed) {
                callback()
            }
        })
    }

    static showError(title, text = '') {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: text,
            confirmButtonText: 'Entendido',
            timer: SYSTEM_CONSTANTS.NOTIFICATION_TIMERS.ERROR
        })
    }

    static showWarning(title, text = '') {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: text,
            confirmButtonText: 'Entendido',
            timer: SYSTEM_CONSTANTS.NOTIFICATION_TIMERS.WARNING,
            timerProgressBar: true
        })
    }

    static showCalculationSuccess(title, text, callback = null) {
        return Swal.fire({
            icon: 'success',
            title: `✅ ${title}`,
            text: text,
            confirmButtonText: 'Continuar',
            showCancelButton: !!callback,
            cancelButtonText: 'Quedarme aquí',
            timer: SYSTEM_CONSTANTS.NOTIFICATION_TIMERS.SUCCESS,
            timerProgressBar: true
        }).then((result) => {
            if (result.isConfirmed && callback) {
                callback()
            }
        })
    }

    static showAccessDenied(message, callback = null) {
        return Swal.fire({
            icon: 'warning',
            title: 'Acceso Restringido',
            text: message,
            confirmButtonText: 'Ir a la sección requerida',
            showCancelButton: true,
            cancelButtonText: 'Entendido',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed && callback) {
                callback()
            }
        })
    }

    static showConfirmReset(callback) {
        return Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará todos los datos calculados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, resetear',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed && callback) {
                callback()
            }
        })
    }

    static showLoading(title = 'Procesando...', text = '') {
        return Swal.fire({
            title: title,
            text: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })
    }

    // Deja pintar el aviso antes de que el trabajo pesado ocupe el hilo principal.
    static async showProgress(title, text = '') {
        this.showLoading(title, text);
        await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 60)));
    }

    static async updateProgress(text) {
        const container = Swal.getHtmlContainer();
        if (container) container.textContent = text;
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    static hideLoading() {
        Swal.close()
    }
}
