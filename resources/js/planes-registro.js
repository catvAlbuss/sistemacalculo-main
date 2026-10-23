export function mountDocumentLookup(documentType, number, name, address, search, status, location = null) {
    if (!search || search.dataset.enabled !== 'true') return () => {};
    let requestId = 0;
    let controller = null;
    let busy = false;
    let loadedName = null;
    let loadedAddress = null;
    let loadedUbigeo = null;
    const reset = () => {
        requestId++;
        controller?.abort();
        busy = false;
        search.disabled = false;
        search.textContent = 'Buscar';
        // Remove only values populated by a lookup, preserving anything the user edited manually.
        if (loadedName !== null && name.value === loadedName) name.value = '';
        if (loadedAddress !== null && address.value === loadedAddress) address.value = '';
        if (location && loadedUbigeo !== null && location.value === loadedUbigeo) {
            location.value = '';
            location.dispatchEvent(new Event('input'));
        }
        loadedName = null;
        loadedAddress = null;
        loadedUbigeo = null;
        status.textContent = 'Busca el nombre o razón social del documento actual.';
    };
    number.addEventListener('input', reset);
    search.addEventListener('click', async () => {
        if (busy) return;
        const type = documentType.value;
        const value = number.value.trim();
        if (!(type === 'RUC' ? /^[0-9]{11}$/ : /^[0-9]{8}$/).test(value)) {
            status.textContent = type === 'RUC' ? 'Ingresa un RUC de 11 dígitos.' : 'Ingresa un DNI de 8 dígitos.';
            return;
        }
        number.value = value;
        const id = ++requestId;
        controller = new AbortController();
        busy = true;
        search.disabled = true;
        search.textContent = 'Buscando…';
        status.textContent = 'Consultando el documento…';
        const previousName = name.value;
        const previousAddress = address.value;
        const previousUbigeo = location?.value;
        try {
            const response = await fetch(search.dataset.url, {
                method: 'POST', credentials: 'same-origin', signal: controller.signal,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify({ document_type: type, document_number: value }),
            });
            const result = await response.json();
            if (id !== requestId || type !== documentType.value || value !== number.value.trim()) return;
            if (!response.ok || !result.success || typeof result.data?.name !== 'string' || !result.data.name.trim()) {
                status.textContent = response.status === 429 ? 'Hiciste varias consultas. Espera unos minutos o completa tus datos manualmente.'
                    : result.message || 'No se pudo buscar el documento. Puedes completar tus datos manualmente.';
                return;
            }
            if (name.value === previousName) {
                name.value = result.data.name;
                loadedName = result.data.name;
            }
            if (type === 'RUC' && typeof result.data.address === 'string' && result.data.address && address.value === previousAddress) {
                address.value = result.data.address;
                loadedAddress = result.data.address;
            }
            status.textContent = 'Datos encontrados. Revísalos y completa tu correo y teléfono.';
            if (location && type === 'RUC' && /^[0-9]{6}$/.test(result.data.ubigeo || '') && location.value === previousUbigeo) {
                location.value = result.data.ubigeo;
                loadedUbigeo = result.data.ubigeo;
                location.dispatchEvent(new Event('input'));
            }
        } catch {
            if (id === requestId) status.textContent = 'No se pudo buscar el documento. Puedes completar tus datos manualmente.';
        } finally {
            if (id === requestId) {
                busy = false;
                search.disabled = false;
                search.textContent = 'Buscar';
            }
        }
    });
    return reset;
}

export function mountPlanRegistration() {
    const form = document.getElementById('plan-registration');
    if (!form) return;
    const button = document.getElementById('registration-submit');
    const unavailable = button.dataset.paymentUnavailable === 'true';
    const label = button.textContent;
    const receiptType = document.getElementById('receipt-type');
    const documentType = document.getElementById('document-type');
    if (receiptType && documentType) {
        const number = document.getElementById('document-number');
        const name = document.getElementById('plan-name');
        const address = document.getElementById('billing-address');
        const ubigeo = document.getElementById('billing-ubigeo');
        const resetLookup = mountDocumentLookup(documentType, document.getElementById('document-number'),
            document.getElementById('plan-name'), document.getElementById('billing-address'),
            document.getElementById('document-search'), document.getElementById('document-lookup-status'), ubigeo);
        const syncBilling = () => {
            const invoice = receiptType.value === 'factura';
            documentType.value = invoice ? 'RUC' : 'DNI';
            number.maxLength = invoice ? 11 : 8;
            number.minLength = invoice ? 11 : 8;
            number.pattern = invoice ? '[0-9]{11}' : '[0-9]{8}';
            number.placeholder = invoice ? 'RUC de 11 dígitos' : 'DNI de 8 dígitos';
            address.required = invoice;
            if (ubigeo) {
                ubigeo.required = invoice;
                document.getElementById('billing-ubigeo-label').textContent = invoice ? 'Distrito del domicilio fiscal' : 'Distrito (opcional)';
            }
            address.placeholder = invoice ? 'Domicilio fiscal registrado en el RUC' : 'Tu dirección (opcional)';
            name.autocomplete = invoice ? 'organization' : 'name';
            name.placeholder = invoice ? 'Razón social registrada en el RUC' : 'Nombres y apellidos del titular del DNI';
            document.getElementById('billing-name-label').textContent = invoice ? 'Razón social' : 'Nombres y apellidos';
            document.getElementById('document-number-label').textContent = invoice ? 'Número de RUC' : 'Número de DNI';
            document.getElementById('billing-address-label').textContent = invoice ? 'Domicilio fiscal (obligatorio)' : 'Dirección (opcional)';
            document.getElementById('document-help').textContent = invoice ? 'Factura: ingresa un RUC de 11 dígitos.' : 'Boleta: ingresa un DNI de 8 dígitos.';
        };
        receiptType.addEventListener('change', () => {
            const previous = documentType.value;
            syncBilling();
            if (documentType.value !== previous) {
                resetLookup();
                // A different document represents another recipient; do not reuse the previous identity.
                number.value = '';
                name.value = '';
                address.value = '';
                if (ubigeo) ubigeo.value = '';
            }
        });
        syncBilling();
        if (ubigeo) {
            const showLocation = () => {
                const selected = Array.from(document.getElementById('billing-districts').options).find(option => option.value === ubigeo.value);
                document.getElementById('billing-location-help').textContent = selected
                    ? selected.label : 'Selecciona un distrito del catálogo y conserva su código de 6 dígitos.';
            };
            ubigeo.addEventListener('input', showLocation);
            showLocation();
        }
    }
    const cycle = document.getElementById('billing-cycle');
    const pricing = document.getElementById('plan-pricing');
    if (cycle && pricing) {
        const options = JSON.parse(pricing.textContent);
        const months = document.getElementById('plan-months');
        const syncPrice = () => {
            const quote = cycle.value === 'monthly' && months && options.monthly?.periods
                ? options.monthly.periods[months.value] : options[cycle.value];
            if (!quote) return;
            if (months) {
                months.disabled = cycle.value === 'yearly';
                document.getElementById('months-row').hidden = months.disabled;
            }
            const money = value => `S/ ${Number(value).toFixed(2)}`;
            document.getElementById('plan-duration').textContent = quote.duration_text;
            document.getElementById('plan-subtotal').textContent = money(quote.subtotal);
            document.getElementById('plan-tax').textContent = money(quote.tax_amount);
            document.getElementById('plan-total').textContent = money(quote.total);
            document.getElementById('plan-list-total').textContent = money(quote.list_total);
            document.getElementById('plan-discount').textContent = `− ${money(quote.discount)}`;
            const processing = document.getElementById('plan-processing');
            if (processing) {
                processing.textContent = money(quote.processing_fee || 0);
                document.getElementById('processing-row').hidden = !quote.processing_fee;
            }
            const pricingKey = document.getElementById('pricing-key');
            if (pricingKey) pricingKey.value = quote.pricing_key;
            const chargeTotal = document.getElementById('plan-charge-total');
            if (chargeTotal) chargeTotal.textContent = `Cobro: ${quote.currency === 'USD' ? 'US$' : 'S/'} ${Number(quote.charge_amount).toFixed(2)}`;
            const credit = document.getElementById('plan-credit');
            if (credit) credit.textContent = quote.credit ? `Saldo aplicado por tiempo no usado: S/ ${Number(quote.credit).toFixed(2)}. El nuevo plan empieza al confirmarse el pago.` : '';
            document.getElementById('annual-list-row').hidden = !quote.discount;
            document.getElementById('annual-discount-row').hidden = !quote.discount;
            document.getElementById('plan-payment-period').textContent = (cycle.value === 'yearly'
                ? 'Un solo cobro por todo el año.' : `Un solo cobro por ${quote.duration_text}.`) + ' La renovación es manual.';
        };
        cycle.addEventListener('change', syncPrice);
        months?.addEventListener('change', syncPrice);
        syncPrice();
    }
    let submitting = false;
    form.addEventListener('submit', (event) => {
        if (submitting || unavailable) { event.preventDefault(); return; }
        submitting = true;
        button.disabled = true;
        button.textContent = 'Guardando tu solicitud…';
    });
    window.addEventListener('pageshow', () => {
        submitting = false;
        button.disabled = unavailable;
        button.textContent = label;
    });
}

if (typeof document !== 'undefined') mountPlanRegistration();
