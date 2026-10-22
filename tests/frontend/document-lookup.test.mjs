import test from 'node:test';
import assert from 'node:assert/strict';
import { mountDocumentLookup } from '../../resources/js/planes-registro.js';

function setup(type = 'RUC', value = '20131312955', location = null) {
    const events = {};
    const number = { value, addEventListener: (event, fn) => { events.input = fn; } };
    const documentType = { value: type };
    const name = { value: '' };
    const address = { value: '' };
    const search = { dataset: { enabled: 'true', url: '/planes/consultar-documento' }, addEventListener: (event, fn) => { events.click = fn; } };
    const status = {};
    globalThis.document = { querySelector: () => ({ content: 'csrf-value' }) };
    mountDocumentLookup(documentType, number, name, address, search, status, location);
    return { events, number, documentType, name, address, search, status };
}

test('RUC lookup fills a catalog location and clears only an untouched automatic value', async () => {
    const location = { value: '', dispatchEvent() {} };
    const ui = setup('RUC', '20131312955', location);
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ success: true, data: { name: 'Empresa', address: 'Av. Ejemplo', ubigeo: '150101' } }) });
    await ui.events.click();
    assert.equal(location.value, '150101');
    ui.events.input();
    assert.equal(location.value, '');
    await ui.events.click();
    location.value = '070101';
    ui.events.input();
    assert.equal(location.value, '070101');
});

test('lookup fills only name and address and sends document and CSRF', async () => {
    const ui = setup();
    let body;
    globalThis.fetch = async (url, options) => {
        body = JSON.parse(options.body);
        assert.equal(options.headers['X-CSRF-TOKEN'], 'csrf-value');
        return { ok: true, status: 200, json: async () => ({ success: true, data: { name: 'Empresa Ejemplo', address: 'Av. Ejemplo' } }) };
    };
    await ui.events.click();
    assert.deepEqual(body, { document_type: 'RUC', document_number: '20131312955' });
    assert.equal(ui.name.value, 'Empresa Ejemplo');
    assert.equal(ui.address.value, 'Av. Ejemplo');
    ui.number.value = '20131312956';
    ui.events.input();
    assert.equal(ui.name.value, '');
    assert.equal(ui.address.value, '');
});

test('a response for a previous document never overwrites the current fields', async () => {
    const ui = setup();
    let resolve;
    globalThis.fetch = () => new Promise((done) => { resolve = done; });
    const pending = ui.events.click();
    ui.number.value = '20131312956';
    ui.events.input();
    ui.name.value = 'Datos actuales';
    resolve({ ok: true, status: 200, json: async () => ({ success: true, data: { name: 'Datos anteriores', address: 'Antes' } }) });
    await pending;
    assert.equal(ui.name.value, 'Datos actuales');
    assert.equal(ui.address.value, '');
});

test('invalid number does not query and provider failure leaves manual data editable', async () => {
    const ui = setup('DNI', '123');
    let calls = 0;
    globalThis.fetch = async () => { calls++; throw new Error('timeout'); };
    await ui.events.click();
    assert.equal(calls, 0);
    ui.number.value = '00123456';
    ui.name.value = 'Nombre ingresado';
    await ui.events.click();
    assert.equal(calls, 1);
    assert.equal(ui.name.value, 'Nombre ingresado');
    assert.equal(ui.search.disabled, false);
    assert.match(ui.status.textContent, /manualmente/);
});

test('manual edits made during a lookup are preserved', async () => {
    const ui = setup();
    let resolve;
    globalThis.fetch = () => new Promise((done) => { resolve = done; });
    const pending = ui.events.click();
    ui.name.value = 'Nombre corregido';
    ui.address.value = 'Dirección corregida';
    resolve({ ok: true, status: 200, json: async () => ({ success: true, data: { name: 'Nombre API', address: 'Dirección API' } }) });
    await pending;
    assert.equal(ui.name.value, 'Nombre corregido');
    assert.equal(ui.address.value, 'Dirección corregida');
});
