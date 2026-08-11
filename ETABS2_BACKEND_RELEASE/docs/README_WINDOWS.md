# ETABS 2 Backend API - Windows

## 1. Descripción general

Este paquete contiene el backend estructural de ETABS 2 empaquetado como ejecutable Windows.

El ejecutable levanta una API local mediante Flask + Waitress y utiliza OpenSeesPy para realizar análisis estructural.

La API queda disponible en:

http://127.0.0.1:5001

## 2. Estructura del paquete

ETABS2_BACKEND_RELEASE/
├── EJECUTAR_BACKEND_WINDOWS.bat
├── PROBAR_BACKEND_WINDOWS.bat
├── DETENER_BACKEND_WINDOWS.bat
├── windows_exe/
│   └── etabs2_backend/
│       ├── etabs2_backend.exe
│       └── _internal/
├── tests/
│   ├── healthcheck_windows.bat
│   ├── test_seismic_post_windows.bat
│   ├── payload_seismic.json
│   ├── response_seismic.json
│   └── response_seismic_from_release.json
└── docs/
    └── README_WINDOWS.md

## 3. Requisitos

No es necesario instalar Python para ejecutar el backend empaquetado.

El paquete debe mantenerse completo. No eliminar la carpeta:

windows_exe/etabs2_backend/_internal/

Esa carpeta contiene dependencias necesarias para que el ejecutable funcione.

## 4. Cómo ejecutar el backend

Abrir:

EJECUTAR_BACKEND_WINDOWS.bat

El backend iniciará en:

http://127.0.0.1:5001

Importante:

Mantener abierta la ventana del backend mientras el sistema esté en uso.  
Si se cierra la ventana, el backend se detiene.

## 5. Cómo probar el backend

Con el backend abierto, ejecutar:

PROBAR_BACKEND_WINDOWS.bat

Este script realiza tres pruebas:

1. GET /health
2. GET /api/opensees/status
3. POST /api/seismic/analyze

La respuesta del POST se guarda en:

tests/response_seismic_from_release.json

## 6. Cómo detener el backend

Se puede detener de dos formas:

Opción 1:

Ir a la ventana donde está corriendo el backend y presionar:

Ctrl + C

Opción 2:

Ejecutar:

DETENER_BACKEND_WINDOWS.bat

## 7. Endpoints principales

GET /health

Verifica que la API esté activa.

GET /api/opensees/status

Verifica que OpenSeesPy esté disponible.

POST /api/seismic/analyze

Ejecuta el análisis sísmico principal.

POST /api/seismic/modal

Ejecuta análisis modal.

POST /api/frame-forces

Calcula fuerzas internas en elementos.

POST /api/seismic/parse-spectrum

Permite procesar espectros sísmicos desde archivo o contenido enviado por request.

## 8. Validación realizada

El ejecutable Windows fue probado correctamente con:

- Inicio desde etabs2_backend.exe
- GET /health
- GET /api/opensees/status
- POST /api/seismic/analyze
- Respuesta final con success: true

La respuesta validada incluye resultados como:

- modal
- seismic
- static
- story_drifts
- story_shears
- effective_mass
- mass_source
- model_quality
- backend_health
- etabs_results
- envelope
- seismic_animation

## 9. Notas importantes

No copiar únicamente etabs2_backend.exe.

Debe entregarse toda la carpeta:

windows_exe/etabs2_backend/

incluyendo:

- etabs2_backend.exe
- _internal/

No incluir en entrega final carpetas de desarrollo como:

- venv/
- build/
- __pycache__/
- node_modules/

## 10. Alcance de este paquete: solo desarrollo local (Windows/Laragon)

Este ejecutable Windows es para desarrollo local únicamente. El hosting de
producción (Hostinger Business Web Hosting) es hosting compartido y no
permite procesos persistentes ni puertos propios (Python solo está
soportado por Hostinger en planes VPS), así que este `.exe` **no se sube al
servidor de producción**.

En producción, el mismo motor Python se instala directamente en la cuenta
de Hostinger y se invoca como subproceso corto por cada request (mismo
patrón ya usado en producción para Octave, vía `proc_open()`), sin
servidor Flask corriendo en segundo plano. Ver:

`ETABS2_BACKEND_RELEASE/docs/README_DEPLOY_HOSTINGER.md`

Para pruebas manuales en tu PC, ejecutar:

EJECUTAR_BACKEND_WINDOWS.bat

## 11. Comunicación con el frontend

El frontend debe consumir la API en:

http://127.0.0.1:5001

Laravel o el frontend deben enviar datos en formato JSON a los endpoints POST correspondientes.
