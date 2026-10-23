import test from 'node:test';
import assert from 'node:assert/strict';
import { mountCulqiPayment } from '../../resources/js/culqi-checkout.js';

function setup(responses, overrides = {}) {
    const events = {};
    const element = () => ({ hidden: false, disabled: false, textContent: '', handlers: {}, addEventListener(event, handler) { this.handlers[event] = handler; } });
    const elements = { 'pay-button': element(), 'refresh-button': element(), 'payment-message': element(), 'culqi-config': element() };
    elements['culqi-config'].textContent = JSON.stringify({ publicKey: 'pk_test_example', amount: 4990, email: 'cliente@example.com', title: 'Rizabal', chargeUrl: '/charge?signed', ...overrides });
    const requests = [];
    let checkout;
    const authTokens = [];
    globalThis.document = {
        getElementById: (id) => elements[id],
        querySelector: () => ({ content: 'csrf' }),
    };
    globalThis.window = {
        location: { origin: 'http://localhost', href: 'http://localhost/pay?signed', reload() {} },
        addEventListener: (event, handler) => { events[event] = handler; },
        CulqiCheckout: class {
            constructor(key, config) { this.config = config; checkout = this; }
            open() {}
            close() {}
        },
        Culqi3DS: { reset() {}, generateDevice: async () => 'device123', initAuthentication: (token) => authTokens.push(token) },
    };
    globalThis.fetch = async (url, options) => {
        requests.push({ url, options, body: JSON.parse(options.body) });
        const response = responses.shift();
        if (response instanceof Error) throw response;
        return { ok: response.ok, status: response.status ?? (response.ok ? 200 : 422), json: async () => response };
    };
    mountCulqiPayment();
    return { elements, requests, events, authTokens, get checkout() { return checkout; }, async start() {
        await elements['pay-button'].handlers.click();
        checkout.token = { id: 'tkn_test_abc' };
        checkout.culqi();
        await tick();
    } };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('successful payment sends token and CSRF then displays confirmation', async () => {
    const ui = setup([{ ok: true, message: 'Pago confirmado' }]);
    await ui.start();
    assert.equal(ui.requests.length, 1);
    assert.deepEqual(ui.requests[0].body, { token: 'tkn_test_abc', device_id: 'device123' });
    assert.equal(ui.requests[0].options.headers['X-CSRF-TOKEN'], 'csrf');
    assert.equal(ui.elements['payment-message'].textContent, 'Pago confirmado');
    assert.equal(ui.elements['pay-button'].hidden, true);
    ui.checkout.culqi();
    assert.equal(ui.requests.length, 1);
});

test('USD uses the frozen amount in Checkout and 3DS and does not offer Yape', async () => {
    const ui = setup([{ ok: true, message: 'Pago confirmado' }], { currency: 'USD', amount: 1331 });
    await ui.start();
    assert.equal(ui.checkout.config.settings.currency, 'USD');
    assert.equal(ui.checkout.config.settings.amount, 1331);
    assert.equal(window.Culqi3DS.settings.charge.currency, 'USD');
    assert.equal(window.Culqi3DS.settings.charge.totalAmount, 1331);
    assert.equal(ui.checkout.config.options.paymentMethods.yape, false);
    assert.deepEqual(ui.checkout.config.options.paymentMethodsSort, ['tarjeta']);
});

test('lost response blocks new charges and shows the refresh action', async () => {
    const ui = setup([new Error('timeout')]);
    await ui.start();
    assert.equal(ui.elements['pay-button'].disabled, true);
    assert.equal(ui.elements['refresh-button'].hidden, false);
    await ui.elements['pay-button'].handlers.click();
    ui.checkout.culqi();
    assert.equal(ui.requests.length, 1);
});

test('3DS sends the same token and device only after a message from the same origin', async () => {
    const ui = setup([{ ok: false, code: 'requires_3ds', message: 'Autenticar' }, { ok: true, message: 'Pago confirmado' }]);
    await ui.start();
    assert.deepEqual(ui.authTokens, ['tkn_test_abc']);
    const parameters3DS = { eci: '05', xid: 'abc', cavv: 'abc', protocolVersion: '2.1.0' };
    ui.events.message({ origin: 'https://other.example', data: { parameters3DS } });
    assert.equal(ui.requests.length, 1);
    ui.events.message({ origin: 'http://localhost', data: { parameters3DS } });
    await tick();
    assert.equal(ui.requests.length, 2);
    assert.equal(ui.requests[1].body.token, ui.requests[0].body.token);
    assert.equal(ui.requests[1].body.device_id, ui.requests[0].body.device_id);
    assert.deepEqual(ui.requests[1].body.authentication_3DS, parameters3DS);
    assert.equal(ui.elements['payment-message'].textContent, 'Pago confirmado');
});

test('a declined payment allows another attempt', async () => {
    const ui = setup([{ ok: false, code: 'declined', message: 'Pago rechazado' }]);
    await ui.start();
    assert.equal(ui.elements['pay-button'].disabled, false);
    assert.equal(ui.elements['payment-message'].textContent, 'Pago rechazado');
});

test('repeated opening reuses the checkout instead of creating concurrent instances', async () => {
    const ui = setup([]);
    await ui.elements['pay-button'].handlers.click();
    const firstCheckout = ui.checkout;
    await ui.elements['pay-button'].handlers.click();
    assert.equal(ui.checkout, firstCheckout);
    assert.equal(ui.requests.length, 0);
});
