// Español latino para el visor CAD (@mlightcad). El paquete solo trae en/zh/tr/cs/ar
// y su selector de idioma es una lista fija, así que se traduce el idioma "en" en
// sitio con el diccionario cadViewerEs.json (texto en inglés -> texto en español).
import dictionary from "./cadViewerEs.json" with { type: "json" };

export const CAD_LOCALE = "en";

// keywords.*.global define el alias que se teclea (la E de End) y el código lo
// compara literalmente: nunca se traduce.
const isProtectedKey = (key) => key === "global";

export function translateCadMessages(node, key, words = dictionary) {
  // Object.hasOwn: un texto como "constructor" no debe devolver métodos del prototipo.
  if (typeof node === "string") return isProtectedKey(key) || !Object.hasOwn(words, node) ? node : words[node];
  if (Array.isArray(node)) return node.map((item) => translateCadMessages(item, key, words));
  if (node && typeof node === "object") {
    return Object.fromEntries(Object.entries(node).map(([childKey, value]) => [childKey, translateCadMessages(value, childKey, words)]));
  }
  return node;
}

function translateInPlace(node) {
  if (!node || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === "string") node[key] = translateCadMessages(value, key);
    else translateInPlace(value);
  }
}

export function installSpanishCad({i18n, AcApI18n, settings}) {
  // Core prompts (command line, jigs) are read straight from AcApI18n.
  translateInPlace(AcApI18n.getLocaleMessage(CAD_LOCALE));
  const coreMerge = AcApI18n.mergeLocaleMessage.bind(AcApI18n);
  AcApI18n.mergeLocaleMessage = (locale, messages) => coreMerge(locale, locale === CAD_LOCALE ? translateCadMessages(messages) : messages);
  AcApI18n.setCurrentLocale(CAD_LOCALE);

  // Ribbon, dialogs and palettes use vue-i18n; plugins merge their texts later.
  const global = i18n.global;
  global.setLocaleMessage(CAD_LOCALE, translateCadMessages(global.getLocaleMessage(CAD_LOCALE)));
  const uiMerge = global.mergeLocaleMessage.bind(global);
  global.mergeLocaleMessage = (locale, messages) => uiMerge(locale, locale === CAD_LOCALE ? translateCadMessages(messages) : messages);

  // The selector would offer "English" for what is now Spanish.
  if (settings) settings.isShowLanguageSelector = false;
}
