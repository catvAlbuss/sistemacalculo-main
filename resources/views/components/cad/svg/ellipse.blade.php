<svg viewBox="0 0 100 45" width="40" height="40" xmlns="http://w3.org">
    <!-- Relleno semitransparente entre los dos arcos -->
    <path d="M 5,35 A 45,20 0 0,1 95,35 L 92,30 A 42,17 0 0,0 8,30 Z" 
          fill="rgba(80,80,80,0.4)" />

    <!-- Cordón Superior -->
    <path d="M 8,30 A 42,17 0 0,1 92,30" 
          fill="none" 
          stroke="white" 
          stroke-width="1.5" />

    <!-- Cordón Inferior -->
    <path d="M 5,35 A 45,20 0 0,1 95,35" 
          fill="none" 
          stroke="white" 
          stroke-width="1.5" />

    <!-- Celosía interna (Zig-Zag) -->
    <path d="M 8,30 L 12,34 L 17,29 L 22,33 L 27,27 L 33,32 L 40,26 L 47,31 L 54,25 L 61,31 L 68,26 L 75,32 L 81,27 L 87,33 L 92,30" 
          fill="none" 
          stroke="white" 
          stroke-width="1" 
          stroke-linejoin="round" />

    <!-- Detalles de los extremos -->
    <line x1="5" y1="35" x2="8" y2="30" stroke="white" stroke-width="1.5" />
    <line x1="95" y1="35" x2="92" y2="30" stroke="white" stroke-width="1.5" />
</svg>
