# Despliegue del motor Python (OpenSeesPy) en Hostinger Business Web Hosting

## 1. Por qué este documento existe

Hostinger Business Web Hosting es **hosting compartido**. Según la propia
documentación de Hostinger, Python como "aplicación web" (WSGI/Passenger,
puerto propio, proceso persistente) solo está soportado en sus **planes
VPS**, no en Business. No hay forma de correr `waitress.serve(...)` /
Flask como servidor de fondo ahí, sin importar la configuración.

Este proyecto ya resolvió exactamente este mismo problema para el motor
**Octave** (ver `app/Http/Controllers/OctavePlotController.php`): en vez de
un servidor persistente, PHP invoca un **subproceso corto por request** vía
`proc_open()`. `PythonEngineController.php` replica el mismo patrón para
OpenSeesPy — con una diferencia importante: el paquete Octave se subió una
vez a mano por SSH (es un binario portable pesado), mientras que
`python-backend/` **ya vive dentro de este repo** y se despliega solo, cada
vez que se hace push, a través del Git de Hostinger.

## 2. Arquitectura resultante

```
Navegador del usuario
   │  fetch('/api/backend/seismic/analyze')   (mismo dominio, HTTPS)
   ▼
Laravel (routes/web.php → PythonEngineController::run())
   │
   ├── Windows (dev local, Laragon):
   │     Http::post('http://127.0.0.1:5001/...')
   │     → backend Flask/Waitress ya empaquetado en
   │       ETABS2_BACKEND_RELEASE/windows_exe/etabs2_backend.exe
   │
   └── Linux (producción, Hostinger Business):
         proc_open("python-backend/venv/bin/python3 python-backend/cli_entry.py <modo>")
         → payload por stdin, JSON de resultado por stdout
         → el proceso termina, no hay puerto ni daemon
```

El frontend (`resources/js/cad/**`) llama **siempre** a rutas relativas
(`/api/backend/...`), nunca a `127.0.0.1:5001` directo: el navegador corre
en la PC del cliente, Laravel corre en el servidor.

## 3. Flujo de despliegue: 100% vía Git (sin SSH manual)

Tu repo de GitHub ya está enlazado al Git de Hostinger (autodeploy en cada
push). `python-backend/app.py`, `cli_entry.py`, `seismic/`, `requirements.txt`
y `deploy/hostinger_build.sh` viajan con el resto del código en cada push —
no hace falta copiar nada a mano.

Lo único que falta es decirle a Hostinger que, después de bajar el código,
prepare el entorno Python (crear el venv e instalar `openseespy`/`numpy`/
`flask`). Eso se configura **una sola vez** en hPanel:

1. hPanel → **Sitio web → Git** (o "Avanzado → Git", según el plan).
2. En la configuración del repositorio conectado, busca el campo
   **"Build command"** (o "Comandos de compilación").
3. Pega exactamente esto:

   ```
   sh python-backend/deploy/hostinger_build.sh
   ```

4. Guarda. A partir de aquí, cada `git push` a la rama de producción:
   - descarga el código nuevo (incluye `python-backend/`),
   - corre `hostinger_build.sh`, que:
     - crea `python-backend/venv/` **solo si no existe** (no lo recrea en
       cada deploy, así no alarga los pushes normales),
     - instala/actualiza dependencias con `pip install -r requirements.txt`,
     - verifica que `import openseespy.opensees` funcione,
     - verifica que `cli_entry.py` responda `health` correctamente.

Si el build command falla (por ejemplo, `openseespy` no tiene wheel para la
versión de Python del servidor), Hostinger normalmente muestra el log del
build en el mismo panel de Git — revisar ahí primero.

### Si tu plan no expone "Build command" en el panel de Git

Como alternativa (no requiere nada distinto en el código, solo el punto de
ejecución), se puede correr el mismo script una vez por SSH:

```bash
ssh <usuario>@<host>
cd domains/ryaie.com/public_html   # o la ruta real del deploy
sh python-backend/deploy/hostinger_build.sh
```

Con Business, SSH está disponible en hPanel → Avanzado → SSH Access si se
necesita para este diagnóstico puntual, pero no es parte del flujo normal
una vez configurado el Build command.

## 4. Configurar Laravel

No hace falta ninguna variable de entorno nueva: `PythonEngineController`
usa `python-backend/` (relativo a la raíz del proyecto) por defecto. Si en
algún momento el motor debe vivir en otra ruta, se puede sobreescribir con:

```
PYTHON_ENGINE_HOME=/ruta/alternativa
```

en el `.env` de producción (ese archivo no viaja por Git, se edita directo
en el servidor vía hPanel → Administrador de archivos, como ya se hace con
`DB_*` y `PYTHON_BACKEND_URL`).

## 5. Prueba end-to-end

```bash
curl -s -X POST https://ryaie.com/api/backend/seismic/modal \
  -H "Content-Type: application/json" \
  -d '{"nodes":[...],"elements":[...]}'
```

Debe responder JSON (`success: true` o un error de negocio legible), no un
error 500 genérico de Laravel ni un timeout.

## 6. Riesgos a monitorear (no aplican a Octave, sí a OpenSeesPy)

- **Wheel de OpenSeesPy**: si el Python del servidor no coincide con las
  versiones que openseespy publica en PyPI (manylinux, típicamente 3.9–3.11),
  el build command fallará en el paso de verificación. Revisar
  `python3 --version` en el servidor si esto ocurre.
- **CPU/memoria por request**: Hostinger aplica límites LVE dinámicos no
  publicados en shared hosting. Un análisis sísmico con muchos nodos puede
  ser más pesado que un script Octave típico — vigilar timeouts (`Http`
  usa 300s del lado Laravel para el modo Windows/dev; en Linux `proc_open`
  no impone timeout propio).
- **Concurrencia**: cada request activa su propio proceso Python (igual que
  Octave). Con varios usuarios simultáneos se multiplica el consumo de CPU
  — no hay problema de "puerto ocupado" pero sí de cuota de CPU compartida
  del plan.
