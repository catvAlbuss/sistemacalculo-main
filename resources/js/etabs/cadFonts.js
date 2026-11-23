// Reemplazos de fuentes para planos peruanos/latinoamericanos. Muchas TTF de
// Windows (Arial Negrita, Swiss, Century Gothic…) y variantes "__" de las SHX de
// AutoCAD no existen en el repositorio de fuentes del visor; sin mapeo, sus textos
// se dibujan con la fuente por defecto (otro ancho, cotas y rótulos descuadrados).
// Cada familia se lleva a la equivalente disponible más parecida.

const FAMILIAS = {
  arial: [
    "arialbd", "ariali", "arialbi", "arialn", "arialnb", "arialni", "arialnbi", "arialuni", "ariblk", "arial black", "arial narrow",
    "swiss", "swissb", "swissbo", "swissc", "swisscb", "swissci", "swisscl", "swissck", "swisse", "swissel", "swissi", "swissk", "swissl", "swisslc",
    "sanssb__", "sans serif", "gothic", "century gothic", "bahnschrift", "calibri", "verdana", "tahoma", "segoe ui", "helvetica", "stylu",
  ],
  times: ["timesbd", "timesi", "timesbi", "times new roman", "cambria", "cambria math", "georgia", "bod_r", "britanic", "pristina"],
  romand: ["romand__", "romand_"],
  romans: ["romans__", "romans_", "romab__", "romai__"],
  romanc: ["romanc__"],
  romant: ["romant__"],
  isocp: ["isocpeur", "isocpeui", "isocteur", "isocteui", "isoct", "iso", "isocp__"],
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const titulo = (texto) => texto.split(" ").map(capitalizar).join(" ");

// El visor compara el nombre tal como está en el estilo de texto ("GOTHIC.TTF",
// "arialbd.ttf", "ROMAND__"): se registran las variantes habituales.
export function buildFontMapping(familias = FAMILIAS) {
  const mapping = {};
  for (const [destino, originales] of Object.entries(familias)) {
    for (const original of originales) {
      for (const nombre of new Set([original, original.toUpperCase(), capitalizar(original), titulo(original)])) {
        for (const extension of ["", ".ttf", ".TTF", ".shx", ".SHX"]) mapping[nombre + extension] = destino;
      }
    }
  }
  return mapping;
}

// Los reemplazos que el usuario eligió en el visor (paleta de recursos) mandan.
export function installCadFontMapping(settings) {
  if (!settings) return;
  settings.fontMapping = {...buildFontMapping(), ...(settings.fontMapping ?? {})};
}
