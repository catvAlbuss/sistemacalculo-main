<!-- Footer -->
<footer class="cad-bg cad-border flex h-6 items-center justify-between border-t px-2 text-sm text-gray-600">
  <span x-text="currentState.info()"></span>
  <span
    x-text="`Zoom: ${grid.scaleX.toFixed(2)} | Posición (${mousePos.x.toFixed(2)}, ${mousePos.y.toFixed(2)})`"></span>
</footer>
