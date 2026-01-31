import { SYSTEM_CONSTANTS } from '../config/constants.js'
import Swal from 'sweetalert2';

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

    static showLoading(title = 'Procesando...') {
        return Swal.fire({
            title: title,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })
    }

    static hideLoading() {
        Swal.close()
    }
}