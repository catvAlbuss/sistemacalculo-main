{{-- resources/views/components/cad/modals/set-elevation-view.blade.php --}}
<div id="elevation-modal" 
     x-data="elevationModal()"
     x-show="open" 
     x-cloak 
     @keydown.escape.window="closeModal()"
     style="display: none;"
     class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

  <div class="bg-gray-800 rounded-lg shadow-xl w-[400px] max-w-full border border-gray-700">
    <!-- Header -->
    <div class="flex justify-between items-center p-4 border-b border-gray-700">
      <h2 class="text-lg font-semibold text-white">Set Elevation View</h2>
      <button @click="closeModal()" class="text-gray-400 hover:text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="p-5 space-y-4">
      <!-- Tipo de Elevación -->
      <div class="flex gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" x-model="selectedElevationType" value="number" class="text-blue-500">
          <span class="text-white text-sm">Numerical (X-Z View)</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" x-model="selectedElevationType" value="letter" class="text-blue-500">
          <span class="text-white text-sm">Alphabetical (Y-Z View)</span>
        </label>
      </div>
      
      <!-- Lista de Elevaciones -->
      <div>
        <label class="block text-sm text-gray-400 mb-2">Elevations</label>
        <div class="grid grid-cols-4 gap-2">
          <template x-for="elev in currentElevations" :key="elev">
            <button @click="selectedElevation = elev"
                    :class="selectedElevation === elev ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'"
                    class="py-2 px-3 rounded text-white text-sm transition">
              <span x-text="elev"></span>
            </button>
          </template>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="border-t border-gray-700 pt-4 mt-2">
        <button @click="setElevation()" 
                class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm transition">
          Apply Elevation View
        </button>
      </div>
    </div>
  </div>
</div>

<script>
function elevationModal() {
  return {
    open: false,
    selectedElevation: '1',
    selectedElevationType: 'number',
    availableNumbers: ['1', '2', '3', '4', '5'],
    availableLetters: ['A', 'B', 'C', 'D', 'E'],
    
    get currentElevations() {
      if (this.selectedElevationType === 'number') {
        return this.availableNumbers;
      } else {
        return this.availableLetters;
      }
    },
    
    init() {
      console.log("Modal de elevación inicializado");
      // Escuchar evento personalizado
      window.addEventListener('open-elevation-modal', () => {
        this.openModal();
      });
    },
    
    openModal() {
      console.log("Abriendo modal de elevación");
      // Actualizar números y letras según el grid actual
      if (window.cadSystem && window.cadSystem.referenceGrid) {
        const grid = window.cadSystem.referenceGrid;
        this.availableNumbers = Array.from({ length: grid.xCount }, (_, i) => (i + 1).toString());
        this.availableLetters = grid.xLabels || ['A', 'B', 'C', 'D', 'E'];
        this.selectedElevation = this.availableNumbers[0] || '1';
      }
      this.open = true;
    },
    
    closeModal() {
      this.open = false;
    },
    
    setElevation() {
      console.log(`Aplicando elevación: ${this.selectedElevation} (${this.selectedElevationType})`);
      if (window.cadSystem && window.cadSystem.setElevationView) {
        window.cadSystem.setElevationView(this.selectedElevation, this.selectedElevationType);
      }
      this.closeModal();
    }
  };
}
</script>