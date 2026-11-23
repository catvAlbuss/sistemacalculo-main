# NovaCad: identidad, componentes y distribución

La personalización de la interfaz no cambia la titularidad ni la licencia de los componentes de terceros. La identidad NovaCad corresponde a la integración y las herramientas de Rizabal; no constituye una afirmación de autoría exclusiva del motor CAD ni una certificación de registro del software.

## Verificado en los paquetes instalados

- `@mlightcad/cad-viewer` y `@mlightcad/cad-simple-viewer` 1.7.6: MIT, Copyright (c) 2026 mlightcad. MIT permite modificación y redistribución sujetas a conservar el aviso de copyright y el texto de permiso.
- `@mlightcad/libredwg-converter` 3.15.17 y `@mlightcad/libredwg-web` 0.7.17: metadatos GPL-3.0. Se distribuyen JavaScript/worker y WASM al navegador. El paquete npm de libredwg-web no incluye avisos propios en su raíz; se conserva una copia canónica de GPL y se señala esa carencia para revisión.
- `@mlightcad/dxf-json` 1.2.8: GPL-3.0 en metadatos y archivo LICENSE instalado. La revisión pendiente también afecta al lector DXF, no solamente a DWG.
- El inventario del build completo incluye `mat-for-js` 1.1.0 (GPL-3.0-or-later), utilizado en otras partes de la aplicación. Revisar su distribución además de los componentes CAD.
- `seedrandom` y `javascript-natural-sort` no incluyen un archivo de licencia en su raíz. Se conservan las cabeceras originales cuando están presentes en su módulo principal; sus avisos siguen marcados para revisión, sin reconstruir atribuciones ni dar por completo un permiso parcial.

Fuentes primarias: https://github.com/mlightcad/cad-viewer/blob/main/LICENSE y https://github.com/mlightcad/libredwg-web/blob/master/COPYING. El inventario del build registra las versiones realmente instaladas.

## Trabajo aplicado

- «Acerca de NovaCad» identifica al proveedor de la aplicación y ofrece créditos separados. Los textos de autoría/licencia de los componentes se conservan en archivos descargables.
- El build recopila los paquetes identificados en sus chunks y los paquetes de workers que se copian por separado. Publica `/build/licenses/inventory.json`, `/build/licenses/THIRD-PARTY-NOTICES.txt` y los textos de licencia originales por paquete.
- Los paquetes con copyleft, licencia no identificada o avisos ausentes se marcan para revisión. Este mecanismo no analiza jurídicamente combinaciones de componentes ni certifica los avisos de dependencias embebidas por proveedores dentro de sus bundles.

## Pendiente antes de distribuir comercialmente

Revisar la integración y forma de distribución de todos los componentes GPL identificados, así como el código fuente correspondiente de las versiones/binarios servidos y sus instrucciones de construcción. Un enlace al repositorio general, o ejecutar el parser en un worker, no prueba por sí solo que todas las obligaciones estén cubiertas. No se ha preparado ni validado un paquete de código fuente correspondiente del WASM instalado.

Determinar con asesoría competente qué obligaciones aplican a la integración y cómo cumplirlas; si se elige otra solución de lectura DWG, hacerlo con una licencia apropiada y una migración explícita. No se ha eliminado la funcionalidad DWG ni se han suprimido atribuciones para ocultar este punto. No afirmar que NovaCad está libre de obligaciones GPL o que los cambios visuales eliminan riesgos legales.
