# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A web application ("web-etabs") that reimplements a scoped subset of ETABS Ultimate (structural analysis software) as a Laravel + Vue web app, aimed at Peruvian/Latin American structural engineering practice (seismic design per local codes, RC element design, foundations). Core domains: cimentación (foundations), predimensionamiento, análisis sísmico (static + dynamic/modal), análisis estructural.

Production domain: `ryaie.com`, hosted on Hostinger **Business (shared) hosting** — this constraint drives several architectural decisions below. Deploys happen via Git autodeploy on push to the production branch; production deploys are the supervisor's responsibility, not something to do from this repo casually.

## Commands

Local dev (Laravel, from `composer.json` `dev` script — runs server, queue listener, log tailing, and Vite concurrently):
```
composer run dev
```
Or individually: `php artisan serve`, `npm run dev` (Vite on port 5173), `php artisan queue:listen`.

Build frontend assets:
```
npm run build
```

Run PHP tests (PHPUnit, suites defined in `phpunit.xml`: `tests/Unit`, `tests/Feature`):
```
php artisan test
# or
vendor/bin/phpunit
vendor/bin/phpunit --filter TestName
```

Laravel Pint (code style, available as dev dependency):
```
vendor/bin/pint
```

### Python structural engine (OpenSeesPy)

On Windows (local dev), the engine runs as a packaged Flask/Waitress executable, **not** the `python-backend/` source directly:
```
ETABS2_BACKEND_RELEASE\EJECUTAR_BACKEND_WINDOWS.bat   # start, serves http://127.0.0.1:5001
ETABS2_BACKEND_RELEASE\PROBAR_BACKEND_WINDOWS.bat     # smoke test (/health, opensees status, seismic analyze)
ETABS2_BACKEND_RELEASE\DETENER_BACKEND_WINDOWS.bat    # stop
```
Keep that window open while using seismic/structural-analysis features locally — closing it kills the backend. See `ETABS2_BACKEND_RELEASE/docs/README_WINDOWS.md`.

`python-backend/` is the actual engine source (Flask app, `cli_entry.py`, `seismic/` package) that gets deployed to production and invoked as a CLI subprocess there — see Architecture below.

### Octave engine (legacy, still used for some panels)

Requires a Windows `octave-cli.exe` locally, configured via `OCTAVE_WINDOWS_CLI_PATH`/`OCTAVE_CLI_PATH` env vars, or one of the hardcoded fallback paths in `OctavePlotController::runOctave()`. MATLAB/Octave `.m` functions live under `public/assets/matlab`.

## Architecture

### Dual-OS dispatch for compute engines (the central pattern here)

Hostinger Business is shared hosting: no persistent background servers or custom ports are allowed. Both structural-compute engines (Octave and Python/OpenSeesPy) solve this the same way, and both branch on `PHP_OS_FAMILY`:

- **Windows (local dev)**: talk to a long-running local process over HTTP/exe (the packaged Flask exe at `127.0.0.1:5001` for Python; a local `octave-cli.exe` for Octave).
- **Linux (production)**: no daemon. PHP spawns a **short-lived subprocess per request** via `proc_open()`, writes the payload to stdin, reads JSON from stdout, and the process exits. No port, no persistent state.

This pattern lives in:
- `app/Http/Controllers/PythonEngineController.php` — `run($mode, $payload)` is the single entry point other controllers/routes call; it picks HTTP-vs-CLI internally. Endpoint modes are declared in `HTTP_ENDPOINTS` and must have a matching case in `python-backend/cli_entry.py`.
- `app/Http/Controllers/OctavePlotController.php` — same idea, older/first implementation of the pattern (`runOctave()`).

When adding a new compute endpoint, follow this existing pattern rather than introducing a new persistent-service approach — a real daemon will not run in production.

`python-backend/` deploys with the rest of the repo via Git; production only needs its **venv built** once via `python-backend/deploy/hostinger_build.sh` (configured as Hostinger's Git "Build command"). See `ETABS2_BACKEND_RELEASE/docs/README_DEPLOY_HOSTINGER.md` for the full deploy story and current risks (OpenSeesPy wheel/Python version mismatches, per-request CPU cost, no request timeout on the Linux `proc_open` path).

`ETABS2_BACKEND_RELEASE/` is a **Windows-only packaged build for local dev**, not something deployed to the server — don't confuse it with `python-backend/`, which is the deployed source.

Frontend code must always call the Laravel-relative route (`/api/backend/...`, see the `api/backend` group in `routes/web.php`), never `127.0.0.1:5001` directly — the browser runs on the client's machine, not the dev machine.

### Frontend: many independent entry points, not a single SPA

`vite.config.js` registers a distinct set of JS/CSS entry points (see the `laravel-vite-plugin` `input` array) rather than one app bundle. Each calculation tool under `resources/js/<module>/` (e.g. `vigas`, `columnav2`, `muros-contencion`, `predim`, `espectro-sismico`, `documentos/memoria_calculo`, `documentos/memoria_descriptiva`, `cav2`) is its own mini-app, loaded per-Blade-view via `@vite([...])`. When adding a new tool/module, you'll typically need to add its entry to `vite.config.js` as well as create the Blade view that includes it.

**Two separate modules share "etabs" branding — don't conflate them:**

- `resources/js/cad/` — the actual ETABS-style structural CAD/modeler: Alpine.js component (`cad_sys.js`, registered as `Alpine.data("cadSys", ...)` from entry point `resources/js/analisis_estructural_de_armaduras.js`), 2D canvas + 3D via Babylon.js, mixins per domain (core/edit/grids/dialogs/analysis/io), talks to the seismic/structural analysis API and to `CadModelController` for autosave and named-model CRUD (`etabs/model/autosave`, `etabs/models*`). Mounted at routes `/software/etabs` and `/software/analisis-estructural-de-armaduras` (both serve view `matlab.admAnalisisEstructuralDeArmaduras`).
  **Read `resources/js/cad/ARCHITECTURE.md` before touching this module** — it's a maintained, accurate map of the mixin structure, the "engine vs mixins/analysis" naming split, the Swal→Blade modal migration pattern, and a symptom→file lookup table for debugging.
- `resources/js/etabs/` (`main.js` + `App.vue`) — an unrelated, separate Vue 3 app (Element Plus + the third-party `@mlightcad/cad-viewer` package) that mounts a generic DXF/DWG file viewer at `#cad-viewer-app`. Routed at `/software/predim2` (view `etabs.index`). Not Alpine, not `cad_sys.js`, no known link to the seismic pipeline as of this writing.

Routes under `hcalculo.*` (`routes/web.php`) map to individual Blade+JS design-tool pages (vigas, zapatas, columnas, muros, losas, escaleras, madera, acero, etc.) — this is the older/parallel set of calculators alongside the newer `etabs`/CAD module.

### Access control

`spatie/laravel-permission` roles (`root`, `gerencia`, `asistente`, ...) gate route groups via `role:` middleware in `routes/web.php`. A separate `CheckSubscription` middleware + `Subscription`/`UserSubscription` models gate the paid calculator routes — expect both role and subscription checks on protected features, not just Laravel auth.

### Data model

Beyond auth/subscriptions, persisted domain models are currently thin: `CadModel` (saved CAD/etabs models), `MemoriaCalculo`/`MemoriaDescriptiva`/`MemoriaImagen` (generated engineering report documents). Most calculators are stateless request/response (compute-and-render), not backed by their own DB tables.
