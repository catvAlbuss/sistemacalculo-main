// js/cad/menus/index.js
// import { fileMenu } from './file-menu.js';
// import { editMenu } from './edit-menu.js';
// import { viewMenu } from './view-menu.js';
import { defineMenu } from './define-menu.js';
// import { drawMenu } from './draw-menu.js';
// import { selectMenu } from './select-menu.js';
// import { assignMenu } from './assign-menu.js';
// import { analyzeMenu } from './analyze-menu.js';
// import { displayMenu } from './display-menu.js';
// import { designMenu } from './design-menu.js';
// import { optionsMenu } from './options-menu.js';
// import { helpMenu } from './help-menu.js';

export const menus = {
    // file: fileMenu,
    // edit: editMenu,
    // view: viewMenu,
    define: defineMenu,
    // draw: drawMenu,
    // select: selectMenu,
    // assign: assignMenu,
    // analyze: analyzeMenu,
    // display: displayMenu,
    // design: designMenu,
    // options: optionsMenu,
    // help: helpMenu,
};

export const getMenuContent = (menuName, cadSystem) => {
    const menu = menus[menuName];
    if (menu && menu.getContent) {
        return menu.getContent(cadSystem);
    }
    return '<div class="py-1"><div class="px-4 py-2 text-gray-400">Menú no disponible</div></div>';
};