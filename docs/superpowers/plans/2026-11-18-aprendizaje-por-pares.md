# Paired Structural Drawing Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Learn from the available architecture/structure pairs to generate geometry-adaptive structural-plan drafts, measure geometric agreement, and improve shared learning only from engineer-approved corrections.

**Architecture:** Keep DWG reading and learned-artifact generation local. Extract anonymized, axis-aligned geometry and decisions from each pair; use deterministic CAD drawing code for output; measure held-out module geometry with category-level F1; store corrections as pending until an authorized technical engineer approves them.

**Tech Stack:** Laravel/PHP, Vue 3, JavaScript ES modules, `node:test`, `@mlightcad/data-model`, existing Laravel private storage and Spatie permissions.

**Spec:** `docs/superpowers/specs/2026-11-18-agente-aprendizaje-por-pares-design.md`

## Global Constraints

- Process original DWGs locally in the engineer’s environment; do not send them to an AI provider.
- Only include reviewed, minimal derived descriptors in deployable artifacts; omit personal names and client identifiers.
- Preserve existing user changes in the worktree; never stage or commit unrelated/generated files.
- `public/build/` already contains user changes; inspect build output and stage generated bundles only if this task explicitly requires them.
- Use deterministic CAD routines for geometry; keep the engineer’s approval mandatory regardless of measured F1.
- Keep current metrado behavior compatible; verify its 15-module reference rather than rebuilding it unnecessarily.
- Report initial results as module-held-out transfer within one project, not proof of generalization to new projects.
- Count only independent project groups as evidence for autonomous learned customs; modules from one group count as one project.
- A local manifest must group source pairs by project and module; if more than one DWG pair maps to the same module in one group, stop and request explicit selection rather than overwrite or mix projects.

## Review Focus

- **A module pair uses inconsistent names or singular/plural “estructura”:** the correct architecture and structure must still pair; test in Task 1.
- **Different projects reuse a module number, or module 14 has multiple candidate pairs:** training must preserve project grouping and require explicit local selection within a group; test in Task 1.
- **Architecture and structure use different scale/origin:** normalized geometry must compare by named axes; test in Tasks 2–3.
- **A view has multiple levels or an open/unclassified area:** the tool must not silently reuse the module-14 layout or claim unsupported geometry; tests in Task 4.
- **A correction is submitted but not approved:** it must not become shared learned behavior; test in Task 5.

---

### Task 1: Discover and Pair Training Drawings Safely

**Files:**
- Create: `scripts/agente/pares-entrenamiento.mjs`
- Modify: `scripts/agente/aprender-pares.mjs`
- Create: `tests/agente/pares-entrenamiento.test.mjs`
- Local-only input when needed: `storage/app/private/entrenamiento/estructuras/pares.json`

**Interfaces:**
- Produces `descubrirPares(archivos, manifiesto) -> { pares, ambiguos, faltantes }`.
- Each `pares` entry is `{ grupo, id, arquitectura, estructura }`; `grupo` and module `id` come from an opaque local manifest, not a location or customer name.
- The private manifest at `storage/app/private/entrenamiento/estructuras/pares.json` selects exact source basenames and keeps projects with repeated module numbers distinct.
- Manifest shape: `{ "proyecto-01": [{ "id": "modulo-01", "arquitectura": "<basename>", "estructura": "<basename>", "metrado": "<optional xlsx basename>" }] }`.

- [ ] **Step 1: Write failing tests** for the module-1 singular `ESTRUCTURA.dwg` name, case/spacing/hyphen variants, missing partners, repeated module numbers across groups, and duplicate module-14 candidates within one group.
- [ ] **Step 2: Run the focused tests** with `node --test tests/agente/pares-entrenamiento.test.mjs`; confirm they fail before implementation.
- [ ] **Step 3: Implement** a pure pair-discovery helper that normalizes module names and suffixes, respects opaque project groups from the private manifest, returns diagnostics, and requires exact local selection for duplicate IDs within one group.
- [ ] **Step 4: Connect the CLI** in `aprender-pares.mjs`; fail with actionable candidate names if pairs are missing or ambiguous, instead of silently skipping or overwriting.
- [ ] **Step 5: Re-run the focused tests** and confirm all naming and collision cases pass.
- [ ] **Step 6: Commit only the helper, CLI, and test files** after review.

### Task 2: Learn Anonymized Geometry from Each Selected Pair

**Files:**
- Modify: `scripts/agente/aprender-pares.mjs`
- Modify: `resources/js/ingenieria/aprendizaje/casos.js`
- Modify/generated: `resources/js/ingenieria/aprendizaje/casosAprendidos.js`
- Test: `tests/frontend/etabs-aprendizaje-casos.test.mjs`
- Test: `tests/agente/pares-entrenamiento.test.mjs`

**Interfaces:**
- Each generated case keeps existing `nombre`, `rasgos`, and `decisiones` and adds a `geometria` object with normalized, comparable element groups and an explicit `null`/unsupported state for data the reader cannot verify.
- Geometry is aligned by named axes and scale-normalized; source paths, project names, title-block data, and raw drawing text are not part of the generated case.

- [ ] **Step 1: Add failing fixture tests** asserting that paired architecture/structure fixtures produce separate level/view descriptors and geometry for recognized structural elements without personal identifiers.
- [ ] **Step 2: Run** `node --test tests/agente/pares-entrenamiento.test.mjs tests/frontend/etabs-aprendizaje-casos.test.mjs`; confirm the new assertions fail.
- [ ] **Step 3: Extend pair extraction** to derive geometry only from entities the CAD reader can identify, preserving axis names and normalizing coordinates to meters; keep unknown elements explicitly unknown.
- [ ] **Step 4: Update the generated case serializer** to emit only the sanitized schema and prevent duplicate module IDs from replacing one another.
- [ ] **Step 5: Run fixture tests** and verify existing decision-learning tests remain green.
- [ ] **Step 6: Run the local training CLI** against the manifest group containing the 15 target modules, after explicitly selecting any ambiguous pair. Confirm the report lists 15 unique modules; audit the generated artifact for names, client identifiers, and duplicate IDs before retaining it.
- [ ] **Step 7: Verify metrado coverage** against the 15 selected module spreadsheets using `scripts/agente/aprender-metrados.mjs`; rerun it only if `referenciaDespacho.js` does not already represent the selected set.
- [ ] **Step 8: Commit only reviewed sanitized learned artifacts and directly related source/tests.**

### Task 3: Measure Geometry Agreement with Held-Out Modules

**Files:**
- Create: `resources/js/ingenieria/aprendizaje/geometria.js`
- Create: `tests/frontend/etabs-aprendizaje-geometria.test.mjs`
- Modify: `resources/js/ingenieria/aprendizaje/casos.js`

**Interfaces:**
- `compararGeometria(esperada, generada, tolerancias)` returns per-category `{ tp, fp, fn, precision, recall, f1 }`, `f1Macro`, and truth/output/view coverage.
- Categories are axes, columns, walls/openings, and slabs. The 0.90 target is withheld if any required category is unverified on any view, absent from generated output, or unmatched by semantic view identity.
- `evaluarLeaveOneModuleOut` uses only examples from the target's explicit project group and excludes every example for the target module ID; it does not mix repeated module numbers across projects.

- [ ] **Step 1: Write failing tests** for exact matches, missing and extra elements, equivalent geometry at a different origin/scale, and a category absent from the reference.
- [ ] **Step 2: Run** `node --test tests/frontend/etabs-aprendizaje-geometria.test.mjs`; confirm the tests fail.
- [ ] **Step 3: Implement** category matching and F1 aggregation without treating unrecognized geometry as a match.
- [ ] **Step 4: Add a leave-one-module-out evaluator** that excludes the target module from its own learned examples and reports each module/category separately.
- [ ] **Step 5: Verify** with `node --test tests/frontend/etabs-aprendizaje-geometria.test.mjs tests/frontend/etabs-aprendizaje-casos.test.mjs`.
- [ ] **Step 6: Commit only the evaluator and tests.**

### Task 4: Generate Plans from the Current Architecture, Not a Fixed Module

**Files:**
- Modify: `resources/js/ingenieria/agente/skills/estructuraPlano.js`
- Modify: `resources/js/ingenieria/laminas/laminasPlantilla.js`
- Modify: `resources/js/ingenieria/aprendizaje/casos.js`
- Test: `tests/frontend/etabs-lector-plano.test.mjs`
- Test: `tests/frontend/etabs-aprendizaje-geometria.test.mjs`

**Interfaces:**
- Preserve the current `laminasConPlantilla({ lectura, items, caja, k, config, cimentacion, datos, fecha, estructura })` entry point.
- Pass the selected learned case and its confidence/unknown groups through `estructura`; output geometry remains based on the currently open architecture and existing CAD primitives.

- [ ] **Step 1: Add failing tests** for a one-level module, a multi-level module, and a module with an open/unclassified area; assert the output follows the current architecture and warns rather than fabricating unsupported elements.
- [ ] **Step 2: Run** `node --test tests/frontend/etabs-lector-plano.test.mjs tests/frontend/etabs-aprendizaje-geometria.test.mjs`; confirm the new generation assertions fail.
- [ ] **Step 3: Integrate learned geometry and confidence** into `propuestaDelPlano` and the existing deterministic drawing call; keep the module-14 template for common title-block/details only.
- [ ] **Step 4: Extend the sheet generator** to represent recognized levels/elements from the selected view and route unsupported/low-confidence geometry into explicit review notices.
- [ ] **Step 5: Run the focused tests**, including the real-DWG cases available locally; verify existing module-14 drawing behavior remains intact.
- [ ] **Step 6: Commit only the drawing, proposal, and test changes.**

### Task 5: Require Engineer Approval Before Sharing Corrections

**Files:**
- Modify: `app/Http/Controllers/AgenteAprendizajeController.php`
- Modify: `routes/web.php`
- Modify: `database/seeders/RolesAndPermissionsSeeder.php`
- Modify: `resources/js/ingenieria/aprendizaje/registro.js`
- Modify: `resources/js/etabs/components/AgentePredimPanel.vue`
- Modify: `tests/Feature/AgenteAprendizajeTest.php`
- Modify: `tests/frontend/etabs-aprendizaje-casos.test.mjs`

**Interfaces:**
- New submissions receive an event id and pending status; legacy events without a status remain approved for backward compatibility.
- Existing agent-facing listing returns only approved events.
- Add `pendientes()`, `aprobar($id)`, and `rechazar($id)` controller methods at `GET /etabs/agente/aprendizaje/pendientes` (`etabs.agente.aprendizaje.pendientes`), `POST /etabs/agente/aprendizaje/{id}/aprobar` (`etabs.agente.aprendizaje.aprobar`), and `POST /etabs/agente/aprendizaje/{id}/rechazar` (`etabs.agente.aprendizaje.rechazar`); approval/rejection requires the `agente.aprendizaje.aprobar` permission.
- The review UI allows the team to submit corrections and users with that permission to approve or reject them. Only approved corrections feed shared future proposals.
- Append status events `{ evento_id, estado, revisado_por, fecha }`; when resolving status, the latest event for an id wins, and legacy rows with no status remain approved.
- Agent-facing `GET /etabs/agente/aprendizaje` returns `{ eventos: [...] }` with approved corrections only; submission and review actions return `{ ok: true, estado: "pendiente"|"aprobado"|"rechazado" }`.

- [ ] **Step 1: Add failing feature tests** for pending submission, approved-only agent listing, approval/rejection audit, permission denial, and legacy-event compatibility.
- [ ] **Step 2: Run** `php artisan test --filter=AgenteAprendizajeTest`; confirm the new workflow tests fail.
- [ ] **Step 3: Implement** append-only event status handling in private storage and the three permission-protected review endpoints; preserve existing payload validation and personal-data filtering.
- [ ] **Step 4: Update permission seeding** to register `agente.aprendizaje.aprobar`, grant it only to `root` by default, and make it assignable to the designated technical engineer through the existing role/permission management flow.
- [ ] **Step 5: Add review controls** to `AgentePredimPanel.vue`; keep unapproved corrections out of the agent’s shared case list.
- [ ] **Step 6: Run** `php artisan test --filter=AgenteAprendizajeTest` and `node --test tests/frontend/etabs-aprendizaje-casos.test.mjs`.
- [ ] **Step 7: Commit only the controller, routes, permission, UI, and tests.**

### Task 6: Produce a Client-Shareable Evaluation and Update Guidance

**Files:**
- Create: `scripts/agente/evaluar-geometria.mjs`
- Modify: `docs/agentes/memoria-agente.md`
- Modify: `docs/agentes/entrenamiento-metrado.md`
- Test: `tests/frontend/etabs-aprendizaje-geometria.test.mjs`

- [ ] **Step 1: Add failing tests** for the evaluation report schema, the ≥0.90 macro-F1 target, per-category results, and explicit failure reporting when the target is missed.
- [ ] **Step 2: Run** `node --test tests/frontend/etabs-aprendizaje-geometria.test.mjs`; confirm the report assertions fail.
- [ ] **Step 3: Implement** the local evaluation command to write a sanitized report under `storage/app/private/entrenamiento/evaluaciones/` and show a concise summary; include the test scope and state clearly that same-project module holdout does not prove cross-project generalization.
- [ ] **Step 4: Update the two docs** with the local training, duplicate-pair selection, approval, validation, and client-report workflow.
- [ ] **Step 5: Run final focused verification:** `node --test tests/agente/pares-entrenamiento.test.mjs tests/frontend/etabs-aprendizaje-geometria.test.mjs tests/frontend/etabs-aprendizaje-casos.test.mjs tests/frontend/etabs-lector-plano.test.mjs`, `php artisan test --filter=AgenteAprendizajeTest`, and `npm run build -- --outDir "$env:TEMP\novacad-aprendizaje-build" --emptyOutDir` in PowerShell so the existing dirty `public/build/` is not overwritten.
- [ ] **Step 6: Run local pair training and geometric evaluation** on the selected source set. Report actual F1 by category; if it is below 0.90, identify the gaps and do not claim the client target is met.
- [ ] **Step 7: Commit only reviewed docs, report tooling, and tests; leave the generated private evaluation report and original DWGs untracked/private.**
