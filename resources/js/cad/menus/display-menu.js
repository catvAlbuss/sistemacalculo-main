export const displayMenu = {
    getContent(cadSystem) {
        return `
      <div class="py-1" style="min-width: 260px; overflow-x: visible;">

        <!-- Show Undeformed Shape -->
        <button 
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
          onclick="window.cadSystem?.activateDisplayMenuAction?.('show-undeformed-shape')">
          <span>📐</span>
          <span>Show Undeformed Shape</span>
        </button>

        <!-- Show Loads -->
        <div class="relative group">
          <button 
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center justify-between">
            <span class="flex items-center gap-2">
              <span>📊</span>
              <span>Show Loads</span>
            </span>
            <span>▶</span>
          </button>

          <div 
            class="absolute left-full top-0 hidden group-hover:block bg-gray-800 border border-gray-700 rounded shadow-lg z-50"
            style="min-width: 220px;">
            
            <button 
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
              onclick="window.cadSystem?.activateDisplayMenuAction?.('show-joint-loads')">
              <span>⚫</span>
              <span>Joint / Point...</span>
            </button>

            <button 
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
              onclick="window.cadSystem?.activateDisplayMenuAction?.('show-frame-loads')">
              <span>━━</span>
              <span>Frame / Line...</span>
            </button>
          </div>
        </div>

        <!-- Show Deformed Shape -->
        <button 
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
          onclick="window.cadSystem?.activateDisplayMenuAction?.('show-deformed-shape')">
          <span>📈</span>
          <span>Show Deformed Shape...</span>
        </button>

        <!-- Show Mode Shape -->
        <button 
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
          onclick="window.cadSystem?.activateDisplayMenuAction?.('show-mode-shape')">
          <span>🎵</span>
          <span>Show Mode Shape...</span>
        </button>

        <div class="border-t border-gray-700 my-1"></div>

        <!-- Show Member Forces / Stress Diagram -->
        <button 
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
          onclick="window.cadSystem?.activateDisplayMenuAction?.('show-member-forces')">
          <span>📉</span>
          <span>Show Member Forces / Stress Diagram</span>
        </button>

      </div>
    `;
    },
};