import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/arco-techo-baseline.json', import.meta.url)));
const source = readFileSync('resources/js/adm_Arcotecho_general.js', 'utf8').replace(/^import .*;\r?\n/gm, '');

function mount(inputs) {
    const element = (value = '') => ({
        value: String(value), innerHTML: '', dataset: {}, listeners: {},
        addEventListener(event, callback) { (this.listeners[event] ??= []).push(callback); },
        emit(event) { for (const callback of this.listeners[event] ?? []) callback({ preventDefault() {} }); },
    });
    const elements = Object.fromEntries(Object.entries(inputs).map(([id, value]) => [id, element(value)]));
    for (const id of [...Object.keys(fixtures[0].outputs), 'desingButton', 'arco-status']) elements[id] = element();
    runInNewContext(source, { document: {
        addEventListener: (event, callback) => callback(),
        getElementById: id => elements[id],
        querySelectorAll: () => Object.keys(inputs).map(id => elements[id]),
    } });
    return elements;
}

for (const [index, { inputs, outputs }] of fixtures.entries()) {
    test(`conserva todos los resultados anteriores al rediseño: escenario ${index + 1}`, () => {
        const elements = mount(inputs);
        elements.desingButton.emit('click');
        for (const [id, expected] of Object.entries(outputs)) {
            const actual = [...elements[id].innerHTML.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)]
                .map(row => [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].at(-1)[1]);
            assert.deepEqual(actual, expected, id);
        }
    });
}

test('los cambios avisan que hay resultados pendientes y recalcular los actualiza', () => {
    const elements = mount(fixtures[0].inputs);
    elements.desingButton.emit('click');
    assert.equal(elements['arco-status'].dataset.state, 'ready');
    const before = elements.datosgeometricos.innerHTML;
    elements.luz.value = '28';
    elements.luz.emit('input');
    assert.equal(elements['arco-status'].dataset.state, 'pending');
    assert.equal(elements.datosgeometricos.innerHTML, before);
    elements.desingButton.emit('click');
    assert.notEqual(elements.datosgeometricos.innerHTML, before);
    assert.equal(elements['arco-status'].dataset.state, 'ready');
});
