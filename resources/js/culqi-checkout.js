const loadScript = (src, ready) => new Promise((resolve, reject) => {
    if (ready()) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => ready() ? resolve() : reject(new Error('script'));
    script.onerror = () => { script.remove(); reject(new Error('script')); };
    document.head.appendChild(script);
});

export function mountCulqiPayment() {
    const button = document.getElementById('pay-button');
    const refresh = document.getElementById('refresh-button');
    refresh?.addEventListener('click', () => window.location.reload());
    if (!button) return;
    const config = JSON.parse(document.getElementById('culqi-config').textContent);
    const currency = config.currency || 'PEN';
    const message = document.getElementById('payment-message');
    let busy = false;
    let blocked = false;
    let token = null;
    let device = null;
    let authenticating = false;
    let checkout = null;
    const show = (text) => { message.textContent = text; };
    const acceptance = document.getElementById('payment-accept-terms');
    const setBusy = (value) => { busy = value; button.disabled = value || blocked; };
    const uncertain = () => {
        blocked = true;
        refresh.hidden = false;
        show('Estamos confirmando tu pago. No pagues otra vez; revisa el estado o contáctanos.');
    };
    const send = async (authentication) => {
        if (busy || blocked) return;
        setBusy(true);
        show('Confirmando el pago…');
        try {
            const response = await fetch(config.chargeUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json', Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ token, device_id: device, ...(acceptance ? {accept_terms: acceptance.checked} : {}), ...(authentication ? { authentication_3DS: authentication } : {}) }),
            });
            const data = await response.json();
            if (response.ok && data.ok) {
                blocked = true;
                button.hidden = true;
                show(data.message);
                const receiptLink = document.getElementById('receipt-link');
                if (receiptLink && data.receipt_url) {
                    receiptLink.href = data.receipt_url;
                    receiptLink.hidden = false;
                }
            } else if (data.code === 'requires_3ds' && !authentication) {
                authenticating = true;
                show(data.message);
                window.Culqi3DS.initAuthentication(token);
            } else if (['uncertain', 'processing'].includes(data.code) || response.status >= 500) {
                uncertain();
            } else {
                show(data.message || (response.status === 419 || response.status === 403
                    ? 'La sesión o el enlace venció. Recarga la página o contáctanos.'
                    : 'No se pudo completar el pago. Revisa los datos o intenta más tarde.'));
            }
        } catch {
            uncertain();
        } finally {
            setBusy(authenticating);
        }
    };
    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin || !authenticating || !event.data || typeof event.data !== 'object') return;
        if (event.data.parameters3DS) {
            authenticating = false;
            setBusy(false);
            send(event.data.parameters3DS);
        } else if (event.data.error) {
            authenticating = false;
            setBusy(false);
            show('No se pudo autenticar la tarjeta. Intenta nuevamente.');
        }
    });
    button.addEventListener('click', async () => {
        if (busy || blocked) return;
        if (acceptance && !acceptance.checked) { show('Acepta las condiciones de la propuesta antes de pagar.'); acceptance.focus?.(); return; }
        if (checkout) {
            checkout.open();
            return;
        }
        setBusy(true);
        try {
            await Promise.all([
                loadScript('https://js.culqi.com/checkout-js', () => !!window.CulqiCheckout),
                loadScript('https://3ds.culqi.com', () => !!window.Culqi3DS),
            ]);
            window.Culqi3DS.reset();
            window.Culqi3DS.publicKey = config.publicKey;
            window.Culqi3DS.settings = {
                charge: { totalAmount: config.amount, currency, returnUrl: window.location.href },
                card: { email: config.email },
            };
            window.Culqi3DS.options = { closeModalAction: () => {
                authenticating = false;
                setBusy(false);
                show('La autenticación se cerró. Puedes intentar nuevamente.');
            } };
            device = await window.Culqi3DS.generateDevice();
            if (!device) throw new Error('device');
            checkout = new window.CulqiCheckout(config.publicKey, {
                settings: { title: config.title, currency, amount: config.amount },
                client: { email: config.email },
                options: {
                    lang: 'es', installments: false, modal: true,
                    paymentMethods: { tarjeta: true, yape: currency === 'PEN', bancaMovil: false, agente: false, billetera: false, cuotealo: false },
                    paymentMethodsSort: currency === 'PEN' ? ['tarjeta', 'yape'] : ['tarjeta'],
                },
                appearance: { theme: 'default', hiddenEmail: true, defaultStyle: { bannerColor: '#2563eb', buttonBackground: '#2563eb' } },
            });
            const activeCheckout = checkout;
            activeCheckout.culqi = () => {
                if (busy || blocked || activeCheckout !== checkout) return;
                if (activeCheckout.token?.id) {
                    token = activeCheckout.token.id;
                    activeCheckout.close();
                    checkout = null;
                    send();
                } else {
                    show(activeCheckout.error?.user_message || 'Revisa los datos del pago e intenta nuevamente.');
                }
            };
        } catch {
            show('No se pudo abrir el pago seguro. Revisa tu conexión e intenta nuevamente.');
        } finally {
            setBusy(false);
        }
        if (checkout) checkout.open();
    });
}

if (typeof document !== 'undefined') mountCulqiPayment();
