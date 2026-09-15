# Fusión de cimentación: cimentacion-v1 + cimentacion-v2 → CAD principal

Este directorio documenta el trabajo de fusionar `/software/cimentacion-v1`
(Octave `zapatas.m`, soporta hasta 5 huecos interiores fijos) y
`/software/cimentacion-v2` (Octave/PHP `zapatas2`, multi-columna) dentro del
módulo CAD principal (`/software/analisis-estructural-de-armaduras`), con el
objetivo puntual de que el CAD acepte **zapatas recortadas** (con huecos/
aberturas) usando la feature `opening` que el CAD ya tiene para dibujar.

Se eligió la **Opción A**: reutilizar el tipo de área `opening` que ya existe
en `cad_sys.js`, en vez de construir un editor de huecos nuevo.

## Reportes por etapa

- [Etapa 1 — Huecos en la presión de contacto (/zapatas2)](etapa-1-huecos-presion-contacto.md) — ✅ completa
- [Etapa 2 — Huecos en el FEM shell (momentos/cortantes)](etapa-2-huecos-fem-shell.md) — ✅ parcial (combinada completa; aislada de 1 columna documentada como no soportada)
- [Etapa 3 — Conectar el `opening` del CAD al pipeline de zapatas](etapa-3-conectar-opening-cad.md) — ✅ completa (presión y FEM de losa 2D; viga recta/L simple con hueco se fuerza por el camino FEM desde el fix del 2026-09-08 — solo la aislada de 1 columna queda con gap, ya avisado en el modal)
- [Etapa 4 — Validación cruzada interna (sin ETABS todavía)](etapa-4-validacion-cruzada.md) — 🟡 parcial a propósito: las 4 implementaciones (PHP, Octave nuevo, Octave viejo, FEM Python) coinciden exactamente entre sí; validación contra ETABS real y retiro de `/cimentacion-v1`/`/cimentacion-v2` quedan pendientes (bloqueados por falta de un caso real, confirmado con Jack)

## Alcance general (para no perderlo de vista entre etapas)

- **Etapa 1** resuelve la presión de contacto (rígida, la que ya usan
  cimentacion-v1/v2): geometría neta (área/centroide/inercias exterior menos
  huecos) y exclusión de puntos dentro del hueco.
- **Etapa 2** resuelve momentos/cortantes vía FEM shell (lo que usa el CAD
  principal, `zapata_shell_solver_*`), que es un cálculo totalmente distinto
  (malla de elementos finitos, no nube de puntos analítica).
- **Etapa 3** es puramente de plomería: detectar el `opening` dibujado dentro
  de una zapata y mandarlo como hueco a los 3 endpoints (`zapatas2`,
  `shell-poligono-combinada-design`, `shell-poligono-design`).
- **Etapa 4** es el cierre: validar un caso real con hueco contra ETABS (con
  el mismo rigor que las demás validaciones del proyecto) antes de apagar las
  rutas viejas.
