// resources/js/cad/menus/draw-menu.js

function item(label, action, icon = "", extraClass = "") {
    return `
    <button
      class="w-full text-left px-3 py-2 text-sm hover:bg-[#2a2a2a] flex items-center gap-2 ${extraClass}"
      onclick="window.cadSystem && window.cadSystem.activateDrawMenuAction('${action}')"
      type="button"
    >
      <span class="inline-block w-5 text-center">${icon}</span>
      <span>${label}</span>
    </button>
  `;
}

function disabledItem(label, icon = "") {
    return `
    <div
      class="w-full text-left px-3 py-2 text-sm opacity-50 cursor-not-allowed flex items-center gap-2"
    >
      <span class="inline-block w-5 text-center">${icon}</span>
      <span>${label}</span>
    </div>
  `;
}

function submenu(label, icon, content) {
    return `
    <div class="relative group">
      <div class="w-full px-3 py-2 text-sm hover:bg-[#2a2a2a] flex items-center justify-between cursor-default">
        <div class="flex items-center gap-2">
          <span class="inline-block w-5 text-center">${icon}</span>
          <span>${label}</span>
        </div>
        <span>▶</span>
      </div>

      <div class="absolute left-full top-0 hidden group-hover:block min-w-[280px] bg-[#1f1f1f] border border-[#3a3a3a] shadow-xl z-[9999]">
        ${content}
      </div>
    </div>
  `;
}

function sectionTitle(text) {
    return `
    <div class="px-3 py-2 text-[11px] font-semibold tracking-wide uppercase text-[#4ea1ff] bg-[#162235] border-y border-[#2c3b52]">
      ${text}
    </div>
  `;
}

function divider() {
    return `<div class="border-t border-[#3a3a3a] my-1"></div>`;
}

export const drawMenu = {
    name: "draw",
    label: "Dibujar",

    getContent() {
        const lineSubmenu = `
      ${item("Dibujar barra / líneas", "draw-line-beam", "◻")}
      ${item("Dibujar arriostres / diagonales", "draw-line-brace", "╱")}
      ${item("Dibujar columna / elementos verticales", "draw-line-column", "│")}
    `;

        const areaSubmenu = `
      ${item("Dibujar losa / área", "draw-area-slab", "▭")}
      ${item("Dibujar muro / panel", "draw-area-wall", "▌")}
      ${item("Dibujar abertura", "draw-area-opening", "◫")}
    `;

        const snapSubmenu = `
      ${item("Ajustar a la cuadrícula ON", "snap-on", "🧲")}
      ${item("Ajustar a la cuadrícula OFF", "snap-off", "🚫")}
    `;

        return `
      <div class="py-1 min-w-[320px] bg-[#1f1f1f] text-[#e5e7eb]">
        ${sectionTitle("Selección y edición")}
        ${item("Seleccionar objeto", "select-object", "🖱")}
        ${item("Modificar objeto", "reshape-object", "🖍")}

        ${divider()}
        ${sectionTitle("Objetos puntuales")}
        ${item("Dibujar objetos de puntos", "draw-point", "📍")}

        ${divider()}
        ${sectionTitle("Objetos lineales")}
        ${submenu("Dibujar objetos lineales", "◻", lineSubmenu)}

        ${divider()}
        ${sectionTitle("Objetos de área")}
        ${submenu("Dibujar objetos de área", "▭", areaSubmenu)}

        ${divider()}
        ${sectionTitle("Otros")}
        ${item("Dibujar definición de elevación desarrollada...", "draw-developed-elevation", "↕")}
        ${disabledItem("Dibujar corte de sección...", "✂")}
        ${item("Dibujar línea de dimensión", "draw-dimension-line", "📐")}
        ${item("Dibujar punto de referencia", "draw-reference-point", "✳")}

        ${divider()}
        ${sectionTitle("Snap")}
        ${submenu("Ajustar a", "🧲", snapSubmenu)}
      </div>
    `;
    },
};