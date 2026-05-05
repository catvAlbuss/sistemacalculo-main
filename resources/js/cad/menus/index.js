import { defineMenu } from './define-menu.js';
import { drawMenu } from './draw-menu.js';

export const menus = {
    define: defineMenu,
    draw: drawMenu,
};

export const getMenuContent = (menuName, cadSystem) => {
    const menu = menus[menuName];
    if (menu && menu.getContent) {
        return menu.getContent(cadSystem);
    }
    return '<div class="py-1"><div class="px-4 py-2 text-gray-400">Menú no disponible</div></div>';
};