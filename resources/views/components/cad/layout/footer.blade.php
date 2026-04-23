<!-- Footer -->
<footer class="cad-bg cad-border flex h-6 items-center justify-between border-t px-2 text-sm text-gray-600">
  <span x-text="currentState.info()"></span>

  <span
    x-text="`${statusCoordinates || 'X 0.00  Y 0.00  Z 0.00'} | Zoom: ${grid.scaleX.toFixed(2)}`"></span>
</footer>