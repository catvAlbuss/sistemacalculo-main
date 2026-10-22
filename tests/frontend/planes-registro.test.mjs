import test from 'node:test';
import assert from 'node:assert/strict';
import { mountPlanRegistration } from '../../resources/js/planes-registro.js';

function setup(unavailable = false) {
    const handlers = {};
    const button = { dataset: { paymentUnavailable: String(unavailable) }, disabled: unavailable, textContent: unavailable ? 'Pago en línea no disponible' : 'Registrar y pagar' };
    const form = { addEventListener: (event, fn) => { handlers[event] = fn; } };
    globalThis.document = { getElementById: (id) => id === 'plan-registration' ? form : id === 'registration-submit' ? button : null };
    globalThis.window = { addEventListener: (event, fn) => { handlers[event] = fn; } };
    mountPlanRegistration();
    return { button, handlers };
}

test('submission blocks double clicks and returning restores the payment button', () => {
    const ui = setup();
    let prevented = false;
    ui.handlers.submit({ preventDefault() { prevented = true; } });
    assert.equal(prevented, false);
    assert.equal(ui.button.disabled, true);
    ui.handlers.submit({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    ui.handlers.pageshow();
    assert.equal(ui.button.disabled, false);
    assert.equal(ui.button.textContent, 'Registrar y pagar');
});

test('unavailable Culqi remains blocked after returning to the page', () => {
    const ui = setup(true);
    let prevented = false;
    ui.handlers.submit({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    ui.handlers.pageshow();
    assert.equal(ui.button.disabled, true);
    assert.equal(ui.button.textContent, 'Pago en línea no disponible');
});

test('receipt determines a readonly document and resets identity without losing contact data', () => {
    const handlers = {};
    const elements = {
        'registration-submit': { dataset: {}, textContent: 'Registrar y pagar' },
        'receipt-type': { value: 'boleta', addEventListener(event, handler) { handlers.receipt = handler; } },
        'document-type': { value: 'DNI', readOnly: true },
        'document-number': { value: '12345678' }, 'billing-address': { value: 'Anterior' }, 'billing-name-label': {},
        'plan-name': { value: 'Anterior' }, 'document-number-label': {}, 'billing-address-label': {}, 'document-help': {},
        'plan-email': { value: 'cliente@example.com' }, 'plan-phone': { value: '999999999' },
        'plan-registration': { addEventListener() {} },
    };
    globalThis.document = { getElementById: (id) => elements[id] };
    globalThis.window = { addEventListener() {} };
    mountPlanRegistration();
    assert.equal(elements['document-number'].maxLength, 8);
    elements['receipt-type'].value = 'factura';
    handlers.receipt();
    assert.equal(elements['document-type'].value, 'RUC');
    assert.equal(elements['document-type'].readOnly, true);
    assert.equal(elements['document-number'].value, '');
    assert.equal(elements['plan-name'].value, '');
    assert.equal(elements['billing-name-label'].textContent, 'Razón social');
    assert.equal(elements['document-number'].pattern, '[0-9]{11}');
    assert.equal(elements['billing-address'].required, true);
    elements['receipt-type'].value = 'boleta';
    handlers.receipt();
    assert.equal(elements['document-type'].value, 'DNI');
    assert.equal(elements['document-number'].pattern, '[0-9]{8}');
    assert.equal(elements['billing-address'].required, false);
    assert.equal(elements['plan-email'].value, 'cliente@example.com');
    assert.equal(elements['plan-phone'].value, '999999999');
});

test('multiple months use server quotes and annual disables the month count with the full discount', () => {
    const handlers = {};
    const elements = {
        'plan-registration': { addEventListener() {} },
        'registration-submit': { dataset: {}, textContent: 'Registrar y pagar' },
        'billing-cycle': { value: 'monthly', addEventListener(event, fn) { handlers.cycle = fn; } },
        'plan-months': { value: '1', addEventListener(event, fn) { handlers.months = fn; } },
        'months-row': {},
        'plan-pricing': { textContent: JSON.stringify({
            monthly: { periods: {
                1: { total: 49.90, subtotal: 42.29, tax_amount: 7.61, list_total: 49.90, discount: 0, duration_text: '1 mes' },
                3: { total: 149.70, subtotal: 126.86, tax_amount: 22.84, list_total: 149.70, discount: 0, duration_text: '3 meses' },
            } },
            yearly: { total: 568.86, subtotal: 482.08, tax_amount: 86.78, list_total: 598.80, discount: 29.94, duration_text: '1 año' },
        }) },
    };
    for (const id of ['plan-duration', 'plan-subtotal', 'plan-tax', 'plan-total', 'plan-list-total', 'plan-discount', 'annual-list-row', 'annual-discount-row', 'plan-payment-period']) elements[id] = {};
    globalThis.document = { getElementById: id => elements[id] };
    globalThis.window = { addEventListener() {} };
    mountPlanRegistration();
    assert.equal(elements['plan-total'].textContent, 'S/ 49.90');
    assert.equal(elements['annual-discount-row'].hidden, true);
    elements['plan-months'].value = '3';
    handlers.months();
    assert.equal(elements['plan-total'].textContent, 'S/ 149.70');
    assert.equal(elements['plan-duration'].textContent, '3 meses');
    elements['billing-cycle'].value = 'yearly';
    handlers.cycle();
    assert.equal(elements['plan-total'].textContent, 'S/ 568.86');
    assert.equal(elements['plan-tax'].textContent, 'S/ 86.78');
    assert.equal(elements['annual-discount-row'].hidden, false);
    assert.equal(elements['plan-months'].disabled, true);
    assert.equal(elements['months-row'].hidden, true);
    assert.match(elements['plan-payment-period'].textContent, /todo el año/);
    elements['billing-cycle'].value = 'monthly';
    handlers.cycle();
    assert.equal(elements['plan-total'].textContent, 'S/ 149.70');
    assert.equal(elements['plan-months'].disabled, false);
    elements['plan-months'].value = '1';
    handlers.months();
    assert.equal(elements['plan-total'].textContent, 'S/ 49.90');
    assert.equal(elements['annual-discount-row'].hidden, true);
});
