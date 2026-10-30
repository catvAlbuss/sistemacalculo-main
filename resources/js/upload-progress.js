import '../css/upload-progress.css';

const MEGABYTE = 1024 * 1024;
const megabytes = bytes => `${(bytes / MEGABYTE).toFixed(1)} MB`;
const FAILURES = {
    413: 'El archivo supera el límite que acepta el servidor.',
    419: 'Tu sesión expiró. Recarga la página y vuelve a intentarlo.',
    429: 'Hiciste demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.',
};

function attach(dialog) {
    const form = dialog.closest('form');
    const part = name => dialog.querySelector(`[data-upload-${name}]`);
    const [title, detail, bar, percent, note, cancel, close] = ['title', 'detail', 'bar', 'percent', 'note', 'cancel', 'close'].map(part);
    const meter = bar.parentElement;
    const startNote = note.textContent;
    let request = null;

    const show = () => { if (!dialog.open) dialog.showModal(); };
    const progress = (loaded, total) => {
        const value = total ? Math.floor(loaded / total * 100) : 0;
        bar.value = value;
        percent.textContent = `${value}%`;
        detail.textContent = `${megabytes(loaded)} de ${megabytes(total)}`;
    };
    const fail = message => {
        request = null;
        title.textContent = 'La carga no terminó';
        detail.textContent = message;
        note.textContent = 'Tus datos siguen en el formulario.';
        meter.hidden = cancel.hidden = true;
        close.hidden = false;
        show();
    };
    const finished = xhr => {
        request = null;
        if (xhr.status >= 400) return fail(FAILURES[xhr.status] ?? 'El servidor no pudo completar la carga. Inténtalo otra vez.');
        let target = xhr.responseURL;
        try { target = JSON.parse(xhr.responseText).redirect ?? target; } catch { /* La sesión expirada termina en la página de ingreso. */ }
        window.location.assign(target);
    };
    const send = files => {
        title.textContent = dialog.dataset.title;
        note.textContent = startNote;
        meter.hidden = cancel.hidden = cancel.disabled = false;
        close.hidden = true;
        progress(0, files.reduce((sum, file) => sum + file.size, 0));
        show();

        const xhr = request = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', event => { if (event.lengthComputable) progress(event.loaded, event.total); });
        // Con todo recibido, abortar no detendría al servidor y la carga quedaría guardada.
        xhr.upload.addEventListener('load', () => {
            cancel.disabled = true;
            title.textContent = 'Guardando en el servidor';
            note.textContent = 'El archivo ya llegó y no se puede cancelar. Falta un momento.';
        });
        xhr.addEventListener('load', () => finished(xhr));
        xhr.addEventListener('error', () => fail('Se perdió la conexión con el servidor. Revisa tu internet e inténtalo otra vez.'));
        xhr.addEventListener('abort', () => { request = null; dialog.close(); });
        xhr.open('POST', form.action);
        xhr.setRequestHeader('X-Upload-Progress', '1');
        xhr.send(new FormData(form));
    };

    form.addEventListener('submit', event => {
        const files = [...form.querySelectorAll('input[type=file]:not(:disabled)')].flatMap(input => [...input.files]);
        if (!files.length) return;
        event.preventDefault();
        if (request) return;
        const limit = Number(dialog.dataset.maxBytes);
        const size = files.reduce((sum, file) => sum + file.size, 0);
        if (size > limit) return fail(`El archivo pesa ${megabytes(size)} y el máximo permitido es ${megabytes(limit)}.`);
        send(files);
    });
    cancel.addEventListener('click', () => request?.abort());
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', event => event.preventDefault());
    dialog.addEventListener('close', () => { if (request) dialog.showModal(); });
    window.addEventListener('beforeunload', event => { if (request) event.preventDefault(); });
}

export function initUploadProgress(root = document) {
    root.querySelectorAll('[data-upload-dialog]').forEach(attach);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initUploadProgress());
else initUploadProgress();
