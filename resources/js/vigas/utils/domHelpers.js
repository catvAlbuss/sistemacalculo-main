import Swal from "sweetalert2";

export const getElementValue = (id, defaultValue = null) => {
    const el = document.getElementById(id);
    if (!el) return defaultValue;
    const val = el.value;
    return val === "" ? defaultValue : val;
};

export const getIntElementValue = (id, defaultValue = 0) => {
    const val = getElementValue(id);
    return val ? parseInt(val) : defaultValue;
};

export const getFloatElementValue = (id, defaultValue = 0.0) => {
    const val = getElementValue(id);
    return val ? parseFloat(val) : defaultValue;
};

export const showError = (title, message) => {
    Swal.fire(title, message, "error");
};

export const showSuccess = (title, message) => {
    Swal.fire(title, message, "success");
};

export const showConfirm = (title, text, confirmText = "Sí, continuar", cancelText = "Cancelar") => {
    return Swal.fire({
        title: title,
        text: text,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
    });
};
