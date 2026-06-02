{{-- resources/views/components/cad/modals/diagonal-grid-modal.blade.php --}}
<div x-data="diagonalGridModal()"
    x-show="open"
    x-cloak
    @keydown.escape.window="closeModal()"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    style="display: none;">

    <div class="bg-gray-800 rounded-lg shadow-xl w-[600px] max-w-full border border-gray-700">
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 class="text-lg font-semibold text-white">Definición de Grillas No Ortogonales</h2>
            <button @click="closeModal()" class="text-gray-400 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div class="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <!-- Instrucciones -->
            <div class="bg-blue-900/30 border border-blue-700 rounded p-3 text-sm text-blue-300">
                💡 Define grillas diagonales ingresando punto inicial, punto final y nombre del eje.
                Puedes agregar múltiples ejes en X (diagonales) y Y (diagonales).
            </div>

            <!-- Grillas Diagonales X (Ejes diagonales en dirección X) -->
            <div class="border border-gray-700 rounded-lg overflow-hidden">
                <div class="bg-gray-700 px-3 py-2 flex justify-between items-center">
                    <h3 class="text-sm font-semibold text-white">📐 Ejes Diagonales (Dirección X)</h3>
                    <button @click="addDiagonalX()" class="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded">
                        + Agregar Eje
                    </button>
                </div>
                <div class="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                    <template x-for="(grid, idx) in diagonalGridsX" :key="idx">
                        <div class="bg-gray-900/50 rounded p-2">
                            <div class="flex gap-2 items-center">
                                <div class="flex-1 grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <label class="text-xs text-gray-400 block">Nombre</label>
                                        <input type="text" x-model="grid.name" placeholder="Ej: D1"
                                            class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block">Punto Inicial (X,Y)</label>
                                        <div class="flex gap-1">
                                            <input type="number" step="0.1" x-model="grid.startX" placeholder="X"
                                                class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                            <input type="number" step="0.1" x-model="grid.startY" placeholder="Y"
                                                class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block">Punto Final (X,Y)</label>
                                        <div class="flex gap-1">
                                            <input type="number" step="0.1" x-model="grid.endX" placeholder="X"
                                                class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                            <input type="number" step="0.1" x-model="grid.endY" placeholder="Y"
                                                class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                        </div>
                                    </div>
                                </div>
                                <button @click="diagonalGridsX.splice(idx, 1)"
                                    class="text-red-400 hover:text-red-300 px-2">
                                    ✕
                                </button>
                            </div>
                        </div>
                    </template>
                    <div x-show="diagonalGridsX.length === 0" class="text-center text-gray-500 text-sm py-4">
                        No hay ejes diagonales X definidos. Haz clic en "+ Agregar Eje"
                    </div>
                </div>
            </div>

            <!-- Grillas Diagonales Y (Ejes diagonales en dirección Y) -->
            <div class="border border-gray-700 rounded-lg overflow-hidden">
                <div class="bg-gray-700 px-3 py-2 flex justify-between items-center">
                    <h3 class="text-sm font-semibold text-white">📐 Ejes Diagonales (Dirección Y)</h3>
                    <button @click="addDiagonalY()" class="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded">
                        + Agregar Eje
                    </button>
                </div>
                <div class="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                    <template x-for="(grid, idx) in diagonalGridsY" :key="idx">
                        <div class="bg-gray-900/50 rounded p-2">
                            <div class="flex gap-2 items-center">
                                <div class="flex-1 grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <label class="text-xs text-gray-400 block">Nombre</label>
                                        <input type="text" x-model="grid.name" placeholder="Ej: E1"
                                            class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block">Punto Inicial (X,Y)</label>
                                        <div class="flex gap-1">
                                            <input type="number" step="0.1" x-model="grid.startX" placeholder="X"
                                                class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                            <input type="number" step="0.1" x-model="grid.startY" placeholder="Y"
                                                class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block">Punto Final (X,Y)</label>
                                        <div class="flex gap-1">
                                            <input type="number" step="0.1" x-model="grid.endX" placeholder="X"
                                                class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                            <input type="number" step="0.1" x-model="grid.endY" placeholder="Y"
                                                class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                        </div>
                                    </div>
                                </div>
                                <button @click="diagonalGridsY.splice(idx, 1)"
                                    class="text-red-400 hover:text-red-300 px-2">
                                    ✕
                                </button>
                            </div>
                        </div>
                    </template>
                    <div x-show="diagonalGridsY.length === 0" class="text-center text-gray-500 text-sm py-4">
                        No hay ejes diagonales Y definidos. Haz clic en "+ Agregar Eje"
                    </div>
                </div>
            </div>

            <!-- Previsualización -->
            <div class="border border-gray-700 rounded-lg overflow-hidden">
                <div class="bg-gray-700 px-3 py-2">
                    <h3 class="text-sm font-semibold text-white">🔍 Previsualización</h3>
                </div>
                <div class="p-3">
                    <canvas id="diagonalGridPreview" width="300" height="200"
                        class="w-full bg-gray-900 rounded border border-gray-700"
                        style="height: 200px; background: #1a1a2e;">
                    </canvas>
                    <p class="text-xs text-gray-400 mt-2 text-center">
                        Vista previa de los ejes diagonales definidos
                    </p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 p-4 border-t border-gray-700">
            <button @click="closeModal()"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition">
                Cancelar
            </button>
            <button @click="createDiagonalGrids()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition">
                Aplicar Grillas Diagonales
            </button>
        </div>
    </div>
</div>

<script>
    function diagonalGridModal() {
        return {
            init() {
                window.addEventListener('open-diagonal-grid-modal', () => {
                    this.openModal();
                });

                // Observar cambios para actualizar preview
                this.$watch('diagonalGridsX', () => this.updatePreview(), {
                    deep: true
                });
                this.$watch('diagonalGridsY', () => this.updatePreview(), {
                    deep: true
                });
            },

            open: false,
            diagonalGridsX: [],
            diagonalGridsY: [],
            previewCtx: null,

            addDiagonalX() {
                this.diagonalGridsX.push({
                    name: `D${this.diagonalGridsX.length + 1}`,
                    startX: 0,
                    startY: 0,
                    endX: 10,
                    endY: 10
                });
                this.updatePreview();
            },

            addDiagonalY() {
                this.diagonalGridsY.push({
                    name: `E${this.diagonalGridsY.length + 1}`,
                    startX: 0,
                    startY: 10,
                    endX: 10,
                    endY: 0
                });
                this.updatePreview();
            },

            openModal() {
                this.diagonalGridsX = [];
                this.diagonalGridsY = [];
                this.open = true;
                setTimeout(() => this.updatePreview(), 100);
            },

            closeModal() {
                this.open = false;
            },

            updatePreview() {
                const canvas = document.getElementById('diagonalGridPreview');
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const width = canvas.width = 300;
                const height = canvas.height = 200;

                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, width, height);

                // Encontrar límites para escalar
                let minX = 0,
                    maxX = 10,
                    minY = 0,
                    maxY = 10;

                [...this.diagonalGridsX, ...this.diagonalGridsY].forEach(grid => {
                    minX = Math.min(minX, grid.startX, grid.endX);
                    maxX = Math.max(maxX, grid.startX, grid.endX);
                    minY = Math.min(minY, grid.startY, grid.endY);
                    maxY = Math.max(maxY, grid.startY, grid.endY);
                });

                const margin = 40;
                const scaleX = (width - margin * 2) / Math.max(maxX - minX, 0.1);
                const scaleY = (height - margin * 2) / Math.max(maxY - minY, 0.1);

                const toScreen = (x, y) => ({
                    x: margin + (x - minX) * scaleX,
                    y: height - margin - (y - minY) * scaleY
                });

                // Dibujar ejes diagonales X (color rojo)
                ctx.beginPath();
                ctx.strokeStyle = '#ff6666';
                ctx.lineWidth = 1.5;
                this.diagonalGridsX.forEach(grid => {
                    const p1 = toScreen(grid.startX, grid.startY);
                    const p2 = toScreen(grid.endX, grid.endY);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();

                    ctx.fillStyle = '#ff8888';
                    ctx.font = '9px monospace';
                    ctx.fillText(grid.name, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 5);
                });

                // Dibujar ejes diagonales Y (color verde)
                ctx.beginPath();
                ctx.strokeStyle = '#66ff66';
                ctx.lineWidth = 1.5;
                this.diagonalGridsY.forEach(grid => {
                    const p1 = toScreen(grid.startX, grid.startY);
                    const p2 = toScreen(grid.endX, grid.endY);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();

                    ctx.fillStyle = '#88ff88';
                    ctx.font = '9px monospace';
                    ctx.fillText(grid.name, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 5);
                });

                // Dibujar origen
                const origin = toScreen(0, 0);
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(origin.x, origin.y, 3, 0, 2 * Math.PI);
                ctx.fill();

                // Etiquetas de ejes
                ctx.fillStyle = '#888888';
                ctx.font = '8px monospace';
                ctx.fillText('X', width - 10, origin.y - 5);
                ctx.fillText('Y', origin.x + 5, 15);
            },

            createDiagonalGrids() {
                if (window.cadSystem && window.cadSystem.addDiagonalGrids) {
                    window.cadSystem.addDiagonalGrids({
                        diagonalX: this.diagonalGridsX,
                        diagonalY: this.diagonalGridsY
                    });
                }
                this.closeModal();
            }
        };
    }
</script>