<!-- Footer -->
<footer class="cad-bg cad-border flex h-6 items-center justify-between border-t px-2 text-sm text-gray-600">
  <span x-text="currentState.info()"></span>

  <div class="flex items-center gap-3">
    <span
      x-text="`${statusCoordinates || 'X 0.00  Y 0.00  Z 0.00'} | Zoom: ${grid.scaleX.toFixed(2)}`"></span>

    {{-- Selector de unidades estilo ETABS (fuerza, longitud) --}}
    <div
      x-data="{
        combo: (window.cadUnits?.force || 'tonf') + '-' + (window.cadUnits?.length || 'm'),
        apply() {
          const [force, length] = this.combo.split('-');
          window.cadUnits?.set(force, length);
        },
      }"
      class="flex items-center gap-1 border-l cad-border pl-2"
      title="Unidades de visualización (fuerza, longitud)"
    >
      <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
      </svg>
      <select
        x-model="combo"
        @change="apply()"
        class="bg-transparent text-xs text-gray-500 border border-transparent hover:border-gray-500 rounded px-1 py-0 cursor-pointer focus:outline-none"
        style="min-width: 84px"
      >
        <option value="tonf-m">tonf, m</option>
        <option value="tonf-cm">tonf, cm</option>
        <option value="kgf-m">kgf, m</option>
        <option value="kgf-cm">kgf, cm</option>
      </select>
    </div>
  </div>
</footer>
