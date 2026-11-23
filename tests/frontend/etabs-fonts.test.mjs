import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFontMapping, installCadFontMapping} from '../../resources/js/etabs/cadFonts.js';

test('fonts missing from the repository map to available equivalents in every spelling', () => {
  const mapping = buildFontMapping();
  for (const name of ['romand__', 'ROMAND__', 'arialbd', 'arialbd.ttf', 'ARIALNB.TTF', 'GOTHIC.TTF', 'swissl.ttf', 'Cambria Math.ttf', 'isocpeur.ttf']) {
    assert.ok(mapping[name], name);
  }
  assert.equal(mapping['romand__'], 'romand');
  assert.equal(mapping['arialbd.ttf'], 'arial');
  assert.equal(mapping['BOD_R.TTF'], 'times');
  assert.equal(mapping['arial'], undefined, 'fonts that exist are not remapped');
});

test('user replacements chosen in the viewer win over the defaults', () => {
  const settings = {fontMapping: {'arialbd.ttf': 'simplex'}};
  installCadFontMapping(settings);
  assert.equal(settings.fontMapping['arialbd.ttf'], 'simplex');
  assert.equal(settings.fontMapping['romand__'], 'romand');
});
