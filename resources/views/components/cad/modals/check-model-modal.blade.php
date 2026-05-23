{{-- resources/views/components/cad/modals/check-model-modal.blade.php --}}
<div x-data="checkModelModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    style="display: none;"
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.escape.window="close()">

    {{-- MODAL PRINCIPAL --}}
    <div class="bg-[#1e1e1e] text-gray-200 w-[620px] max-w-[95vw] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">

        {{-- Header --}}
        <div class="bg-[#2d2d2d] px-3 py-2 text-xs flex justify-between items-center border-b border-gray-700">
            <div class="flex items-center gap-2">
                <span>🔍</span>
                <span class="text-gray-300 font-semibold">Check Model</span>
            </div>

            <button @click="close()"
                class="w-5 h-5 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-gray-400 hover:text-white text-xs">
                ×
            </button>
        </div>

        {{-- Body --}}
        <div class="p-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

            {{-- Revisiones de línea --}}
            <fieldset class="border border-gray-700 rounded p-3 space-y-2">
                <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Line Checks</legend>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.lineOverlap" class="accent-blue-500">
                    Check overlapping frame / line objects
                </label>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.lineIntersection" class="accent-blue-500">
                    Check line intersections in same plane
                </label>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.zeroLengthFrames" class="accent-blue-500">
                    Check zero-length frame / line objects
                </label>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.invalidFrames" class="accent-blue-500">
                    Check frame / line objects with invalid end nodes
                </label>
            </fieldset>

            {{-- Revisiones de punto --}}
            <fieldset class="border border-gray-700 rounded p-3 space-y-2">
                <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Point Checks</legend>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.pointPoint" class="accent-blue-500">
                    Check duplicate joints / points using X, Y and Z
                </label>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.pointLine" class="accent-blue-500">
                    Check unconnected joints located on frame / line objects
                </label>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.isolatedNodes" class="accent-blue-500">
                    Check isolated joints / points
                </label>
            </fieldset>

            {{-- Revisiones de área --}}
            <fieldset class="border border-gray-700 rounded p-3 space-y-2">
                <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Area Checks</legend>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.areaOverlap" class="accent-blue-500">
                    Check duplicate / overlapping areas
                </label>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.checkMeshing" class="accent-blue-500">
                    Check basic floor meshing
                </label>
            </fieldset>

            {{-- Revisiones para análisis --}}
            <fieldset class="border border-gray-700 rounded p-3 space-y-2">
                <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Analysis Readiness Checks</legend>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.checkSupports" class="accent-blue-500">
                    Check restraints / supports
                </label>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.checkLoads" class="accent-blue-500">
                    Check assigned loads
                </label>

                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.checkFrameSections" class="accent-blue-500">
                    Check assigned frame sections
                </label>
            </fieldset>

            {{-- Opciones generales --}}
            <div class="space-y-3 px-1 mt-1">
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-400">Tolerance</span>

                    <div class="flex items-center gap-2">
                        <input type="text"
                            x-model="tolerance.value"
                            class="w-20 bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-xs text-right focus:border-blue-500 outline-none">

                        <select x-model="tolerance.unit"
                            class="bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none">
                            <option value="m">m</option>
                            <option value="cm">cm</option>
                            <option value="ft">ft</option>
                            <option value="in">in</option>
                        </select>
                    </div>
                </div>

                <div class="text-[11px] text-gray-500">
                    The model currently uses meters internally. The selected tolerance will be converted before checking.
                </div>

                <label class="flex items-center gap-2 text-xs text-gray-600 cursor-not-allowed">
                    <input type="checkbox" disabled class="accent-gray-700">
                    Selected objects only
                    <span class="italic">(pending)</span>
                </label>
            </div>

            {{-- Botones --}}
            <div class="flex justify-center gap-4 pt-4 border-t border-gray-700">
                <button @click="runChecks()"
                    class="px-10 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
                    OK
                </button>

                <button @click="close()"
                    class="px-10 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    </div>

    {{-- MODAL RESULTADOS --}}
    <div x-show="showResults"
        x-cloak
        style="display: none;"
        class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80">

        <div class="bg-[#1e1e1e] rounded-lg shadow-2xl w-[720px] max-w-[95vw] max-h-[80vh] overflow-hidden border border-gray-700">
            <div class="bg-[#2d2d2d] px-3 py-2 text-xs flex justify-between items-center border-b border-gray-700">
                <div class="flex items-center gap-2">
                    <span x-text="resultsIcon"></span>
                    <span class="text-gray-300 font-semibold">Check Model Results</span>
                </div>

                <button @click="showResults = false"
                    class="w-5 h-5 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-gray-400 hover:text-white text-xs">
                    ×
                </button>
            </div>

            <div class="p-4 overflow-y-auto max-h-[62vh]">
                <div x-html="resultsHtml" class="text-sm space-y-2"></div>
            </div>

            <div class="flex justify-between items-center px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
                <div class="text-[11px] text-gray-500">
                    Result saved in <span class="text-gray-300">window.cadSystem.modelCheck</span>
                </div>

                <button @click="showResults = false"
                    class="px-6 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
                    Close
                </button>
            </div>
        </div>
    </div>

    {{-- Toast --}}
    <div x-show="showToast"
        x-cloak
        style="display: none;"
        class="fixed bottom-5 right-5 z-[500]"
        x-transition.duration.300ms>

        <div class="px-4 py-3 rounded-lg shadow-lg text-white text-sm"
            :class="toastType === 'error' ? 'bg-red-600' : (toastType === 'warning' ? 'bg-yellow-600' : 'bg-green-600')">
            <span x-text="toastMessage"></span>
        </div>
    </div>

    <style>
        [x-cloak] {
            display: none !important;
        }
    </style>
</div>

<script>
    function checkModelModal() {
        return {
            open: false,

            checks: {
                lineOverlap: true,
                lineIntersection: true,
                zeroLengthFrames: true,
                invalidFrames: true,

                pointPoint: true,
                pointLine: true,
                isolatedNodes: true,

                areaOverlap: true,
                checkMeshing: false,

                checkSupports: true,
                checkLoads: true,
                checkFrameSections: true
            },

            tolerance: {
                value: '0.001',
                unit: 'm'
            },

            showResults: false,
            resultsHtml: '',
            resultsIcon: '🔍',

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            init() {
                window.addEventListener('open-check-model-modal', () => {
                    this.openModal();
                });
            },

            openModal() {
                this.open = true;
            },

            close() {
                this.open = false;
                this.showResults = false;
            },

            showToastMessage(message, type = 'success') {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);

                this.toastMessage = message;
                this.toastType = type;
                this.showToast = true;

                this.toastTimeout = setTimeout(() => {
                    this.showToast = false;
                }, 2500);
            },

            getToleranceInMeters() {
                const rawValue = Number(this.tolerance.value);

                if (!Number.isFinite(rawValue) || rawValue <= 0) {
                    return 0.001;
                }

                const unit = this.tolerance.unit || 'm';

                if (unit === 'm') return rawValue;
                if (unit === 'cm') return rawValue / 100;
                if (unit === 'ft') return rawValue * 0.3048;
                if (unit === 'in') return rawValue * 0.0254;

                return rawValue;
            },

            getCadModel() {
                const cad = window.cadSystem || {};

                return {
                    cad,
                    nodes: Array.isArray(cad.nodes) ? cad.nodes : [],
                    frames: Array.isArray(cad.shapes) ? cad.shapes : [],
                    areas: Array.isArray(cad.areas) ? cad.areas : [],
                    stories: Array.isArray(cad.stories) ? cad.stories : []
                };
            },

            getPoint3D(nodeOrPoint) {
                const p = nodeOrPoint?.position || nodeOrPoint || {};

                return {
                    x: Number(p.x || 0),
                    y: Number(p.y || 0),
                    z: Number(p.z || 0)
                };
            },

            distance3D(p1, p2) {
                const dx = Number(p1.x || 0) - Number(p2.x || 0);
                const dy = Number(p1.y || 0) - Number(p2.y || 0);
                const dz = Number(p1.z || 0) - Number(p2.z || 0);

                return Math.sqrt(dx * dx + dy * dy + dz * dz);
            },

            frameLength(frame) {
                if (!frame?.node1?.position || !frame?.node2?.position) return 0;

                return this.distance3D(
                    this.getPoint3D(frame.node1),
                    this.getPoint3D(frame.node2)
                );
            },

            samePoint(p1, p2, tolerance) {
                return this.distance3D(p1, p2) <= tolerance;
            },

            getFrameId(frame, index = 0) {
                return frame?.id || frame?.name || `Frame_${index + 1}`;
            },

            getNodeId(node, index = 0) {
                return node?.id || node?.name || `Node_${index + 1}`;
            },

            addResult(items, level, title, message, data = {}) {
                items.push({
                    level,
                    title,
                    message,
                    data
                });
            },

            runChecks() {
                const tolerance = this.getToleranceInMeters();
                const model = this.getCadModel();

                const nodes = model.nodes;
                const frames = model.frames;
                const areas = model.areas;

                const items = [];

                let errors = 0;
                let warnings = 0;
                let info = 0;

                const pushItems = (newItems) => {
                    newItems.forEach((item) => {
                        items.push(item);

                        if (item.level === 'error') errors++;
                        else if (item.level === 'warning') warnings++;
                        else info++;
                    });
                };

                if (nodes.length === 0 && frames.length === 0 && areas.length === 0) {
                    pushItems([{
                        level: 'error',
                        title: 'Empty model',
                        message: 'The model does not contain nodes, frame objects or area objects. Run Analysis cannot continue.',
                        data: {}
                    }]);
                }

                if (this.checks.invalidFrames) {
                    pushItems(this.checkInvalidFrames(frames));
                }

                if (this.checks.zeroLengthFrames) {
                    pushItems(this.checkZeroLengthFrames(frames, tolerance));
                }

                if (this.checks.lineOverlap) {
                    pushItems(this.checkLineOverlaps(frames, tolerance));
                }

                if (this.checks.lineIntersection) {
                    pushItems(this.checkLineIntersections(frames, tolerance));
                }

                if (this.checks.pointPoint) {
                    pushItems(this.checkDuplicateNodes(nodes, tolerance));
                }

                if (this.checks.pointLine) {
                    pushItems(this.checkPointsOnLines(nodes, frames, tolerance));
                }

                if (this.checks.isolatedNodes) {
                    pushItems(this.checkIsolatedNodes(nodes, frames));
                }

                if (this.checks.areaOverlap) {
                    pushItems(this.checkDuplicateAreas(areas, tolerance));
                }

                if (this.checks.checkMeshing) {
                    pushItems(this.checkBasicMeshing(areas));
                }

                if (this.checks.checkSupports) {
                    pushItems(this.checkSupports(nodes, frames));
                }

                if (this.checks.checkLoads) {
                    pushItems(this.checkLoads(nodes, frames));
                }

                if (this.checks.checkFrameSections) {
                    pushItems(this.checkFrameSections(frames));
                }

                const canRunAnalysis = errors === 0;

                this.saveModelCheckResult({
                    errors,
                    warnings,
                    info,
                    canRunAnalysis,
                    items,
                    tolerance,
                    summary: {
                        nodes: nodes.length,
                        frames: frames.length,
                        areas: areas.length,
                        stories: model.stories.length
                    }
                });

                this.resultsIcon = canRunAnalysis ?
                    (warnings > 0 ? '⚠️' : '✅') :
                    '❌';

                this.resultsHtml = this.buildResultsHtml({
                    errors,
                    warnings,
                    info,
                    canRunAnalysis,
                    items,
                    tolerance,
                    nodes,
                    frames,
                    areas,
                    stories: model.stories
                });

                this.showResults = true;

                if (canRunAnalysis) {
                    this.showToastMessage('Check Model completed.', warnings > 0 ? 'warning' : 'success');
                } else {
                    this.showToastMessage('Check Model found errors.', 'error');
                }
            },

            saveModelCheckResult(result) {
                const cleanResult = JSON.parse(JSON.stringify({
                    ...result,
                    checkedAt: new Date().toISOString()
                }));

                if (window.cadSystem) {
                    window.cadSystem.modelCheck = cleanResult;

                    if (!window.cadSystem.analysisOptions) {
                        window.cadSystem.analysisOptions = {};
                    }

                    window.cadSystem.analysisOptions.lastModelCheck = {
                        checkedAt: cleanResult.checkedAt,
                        errors: cleanResult.errors,
                        warnings: cleanResult.warnings,
                        info: cleanResult.info,
                        canRunAnalysis: cleanResult.canRunAnalysis
                    };

                    window.cadSystem.showMessage?.(
                        cleanResult.canRunAnalysis ?
                        `Check Model completado: ${cleanResult.errors} errores, ${cleanResult.warnings} advertencias.` :
                        `Check Model encontró ${cleanResult.errors} error(es). Corrige antes de ejecutar Run Analysis.`
                    );
                }

                console.log('✅ Analyze > Check Model:', cleanResult);
            },

            buildResultsHtml(payload) {
                const {
                    errors,
                    warnings,
                    info,
                    canRunAnalysis,
                    items,
                    tolerance,
                    nodes,
                    frames,
                    areas,
                    stories
                } = payload;

                const html = [];

                html.push(`
                    <div class="grid grid-cols-4 gap-2 mb-4 text-center">
                        <div class="bg-gray-900 border border-gray-700 rounded p-2">
                            <div class="text-lg font-bold text-gray-200">${nodes.length}</div>
                            <div class="text-[11px] text-gray-500">Nodes</div>
                        </div>
                        <div class="bg-gray-900 border border-gray-700 rounded p-2">
                            <div class="text-lg font-bold text-gray-200">${frames.length}</div>
                            <div class="text-[11px] text-gray-500">Frames</div>
                        </div>
                        <div class="bg-gray-900 border border-gray-700 rounded p-2">
                            <div class="text-lg font-bold text-gray-200">${areas.length}</div>
                            <div class="text-[11px] text-gray-500">Areas</div>
                        </div>
                        <div class="bg-gray-900 border border-gray-700 rounded p-2">
                            <div class="text-lg font-bold text-gray-200">${stories.length}</div>
                            <div class="text-[11px] text-gray-500">Stories</div>
                        </div>
                    </div>
                `);

                html.push(`
                    <div class="border border-gray-700 rounded p-3 mb-4 bg-gray-900">
                        <div class="${canRunAnalysis ? 'text-green-400' : 'text-red-400'} font-bold">
                            ${canRunAnalysis ? '✅ Model can continue to Run Analysis' : '❌ Model has errors. Run Analysis should be blocked.'}
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            Tolerance used: ${tolerance.toExponential(3)} m
                        </div>
                        <div class="text-xs text-gray-400 mt-2">
                            Errors: <span class="text-red-400">${errors}</span> |
                            Warnings: <span class="text-yellow-400">${warnings}</span> |
                            Info: <span class="text-blue-400">${info}</span>
                        </div>
                    </div>
                `);

                if (!items.length) {
                    html.push(`
                        <div class="text-green-400 text-center py-4">
                            ✅ No model issues were found.
                        </div>
                    `);

                    return html.join('');
                }

                const grouped = {
                    error: items.filter((item) => item.level === 'error'),
                    warning: items.filter((item) => item.level === 'warning'),
                    info: items.filter((item) => item.level === 'info')
                };

                html.push(this.buildGroupHtml('error', '❌ Errors', grouped.error));
                html.push(this.buildGroupHtml('warning', '⚠️ Warnings', grouped.warning));
                html.push(this.buildGroupHtml('info', 'ℹ️ Information', grouped.info));

                return html.join('');
            },

            buildGroupHtml(level, title, items) {
                if (!items.length) return '';

                const colorClass = level === 'error' ?
                    'text-red-400' :
                    (level === 'warning' ? 'text-yellow-400' : 'text-blue-400');

                const limitedItems = items.slice(0, 50);
                const extraCount = items.length - limitedItems.length;

                return `
                    <div class="mb-4">
                        <div class="${colorClass} font-semibold mb-2">${title}: ${items.length}</div>

                        <ul class="list-disc list-inside ml-3 text-xs text-gray-300 space-y-1">
                            ${limitedItems.map((item) => `
                                <li>
                                    <span class="font-semibold">${item.title}:</span>
                                    ${item.message}
                                </li>
                            `).join('')}

                            ${extraCount > 0 ? `
                                <li class="text-gray-500 italic">
                                    ${extraCount} additional item(s) hidden to keep the report readable.
                                </li>
                            ` : ''}
                        </ul>
                    </div>
                `;
            },

            checkInvalidFrames(frames) {
                const items = [];

                frames.forEach((frame, index) => {
                    if (!frame?.node1 || !frame?.node2) {
                        items.push({
                            level: 'error',
                            title: 'Invalid frame',
                            message: `Frame ${this.getFrameId(frame, index)} does not have valid end nodes.`,
                            data: {
                                frameId: this.getFrameId(frame, index)
                            }
                        });
                    }
                });

                return items;
            },

            checkZeroLengthFrames(frames, tolerance) {
                const items = [];

                frames.forEach((frame, index) => {
                    if (!frame?.node1?.position || !frame?.node2?.position) return;

                    const length = this.frameLength(frame);

                    if (length <= tolerance) {
                        items.push({
                            level: 'error',
                            title: 'Zero-length frame',
                            message: `Frame ${this.getFrameId(frame, index)} has length ${length.toExponential(3)} m.`,
                            data: {
                                frameId: this.getFrameId(frame, index),
                                length
                            }
                        });
                    }
                });

                return items;
            },

            checkLineOverlaps(frames, tolerance) {
                const items = [];

                for (let i = 0; i < frames.length; i++) {
                    const a = frames[i];
                    if (!a?.node1?.position || !a?.node2?.position) continue;

                    const a1 = this.getPoint3D(a.node1);
                    const a2 = this.getPoint3D(a.node2);

                    for (let j = i + 1; j < frames.length; j++) {
                        const b = frames[j];
                        if (!b?.node1?.position || !b?.node2?.position) continue;

                        const b1 = this.getPoint3D(b.node1);
                        const b2 = this.getPoint3D(b.node2);

                        const sameDirection =
                            this.samePoint(a1, b1, tolerance) &&
                            this.samePoint(a2, b2, tolerance);

                        const oppositeDirection =
                            this.samePoint(a1, b2, tolerance) &&
                            this.samePoint(a2, b1, tolerance);

                        if (sameDirection || oppositeDirection) {
                            items.push({
                                level: 'warning',
                                title: 'Overlapping frames',
                                message: `Frame ${this.getFrameId(a, i)} and Frame ${this.getFrameId(b, j)} overlap or have the same end points.`,
                                data: {
                                    frame1: this.getFrameId(a, i),
                                    frame2: this.getFrameId(b, j)
                                }
                            });
                        }
                    }
                }

                return items;
            },

            checkLineIntersections(frames, tolerance) {
                const items = [];

                for (let i = 0; i < frames.length; i++) {
                    const a = frames[i];
                    if (!a?.node1?.position || !a?.node2?.position) continue;

                    const a1 = this.getPoint3D(a.node1);
                    const a2 = this.getPoint3D(a.node2);

                    for (let j = i + 1; j < frames.length; j++) {
                        const b = frames[j];
                        if (!b?.node1?.position || !b?.node2?.position) continue;

                        if (a.node1 === b.node1 || a.node1 === b.node2 || a.node2 === b.node1 || a.node2 === b.node2) {
                            continue;
                        }

                        const b1 = this.getPoint3D(b.node1);
                        const b2 = this.getPoint3D(b.node2);

                        const sameZPlane =
                            Math.abs(a1.z - a2.z) <= tolerance &&
                            Math.abs(b1.z - b2.z) <= tolerance &&
                            Math.abs(a1.z - b1.z) <= tolerance;

                        if (!sameZPlane) continue;

                        if (this.segmentsIntersect2D(a1, a2, b1, b2, tolerance)) {
                            items.push({
                                level: 'warning',
                                title: 'Line intersection',
                                message: `Frame ${this.getFrameId(a, i)} and Frame ${this.getFrameId(b, j)} intersect in plan without sharing a joint.`,
                                data: {
                                    frame1: this.getFrameId(a, i),
                                    frame2: this.getFrameId(b, j)
                                }
                            });
                        }
                    }
                }

                return items;
            },

            segmentsIntersect2D(p1, p2, q1, q2, tolerance) {
                const orient = (a, b, c) => {
                    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
                };

                const onSegment = (a, b, c) => {
                    return (
                        Math.min(a.x, c.x) - tolerance <= b.x &&
                        b.x <= Math.max(a.x, c.x) + tolerance &&
                        Math.min(a.y, c.y) - tolerance <= b.y &&
                        b.y <= Math.max(a.y, c.y) + tolerance
                    );
                };

                const o1 = orient(p1, p2, q1);
                const o2 = orient(p1, p2, q2);
                const o3 = orient(q1, q2, p1);
                const o4 = orient(q1, q2, p2);

                if (
                    ((o1 > tolerance && o2 < -tolerance) || (o1 < -tolerance && o2 > tolerance)) &&
                    ((o3 > tolerance && o4 < -tolerance) || (o3 < -tolerance && o4 > tolerance))
                ) {
                    return true;
                }

                if (Math.abs(o1) <= tolerance && onSegment(p1, q1, p2)) return true;
                if (Math.abs(o2) <= tolerance && onSegment(p1, q2, p2)) return true;
                if (Math.abs(o3) <= tolerance && onSegment(q1, p1, q2)) return true;
                if (Math.abs(o4) <= tolerance && onSegment(q1, p2, q2)) return true;

                return false;
            },

            checkDuplicateNodes(nodes, tolerance) {
                const items = [];

                for (let i = 0; i < nodes.length; i++) {
                    const p1 = this.getPoint3D(nodes[i]);

                    for (let j = i + 1; j < nodes.length; j++) {
                        const p2 = this.getPoint3D(nodes[j]);
                        const distance = this.distance3D(p1, p2);

                        if (distance <= tolerance) {
                            items.push({
                                level: 'warning',
                                title: 'Duplicate joints',
                                message: `Node ${this.getNodeId(nodes[i], i)} and Node ${this.getNodeId(nodes[j], j)} are within tolerance. Distance: ${distance.toExponential(3)} m.`,
                                data: {
                                    node1: this.getNodeId(nodes[i], i),
                                    node2: this.getNodeId(nodes[j], j),
                                    distance
                                }
                            });
                        }
                    }
                }

                return items;
            },

            checkPointsOnLines(nodes, frames, tolerance) {
                const items = [];

                nodes.forEach((node, nodeIndex) => {
                    const point = this.getPoint3D(node);

                    frames.forEach((frame, frameIndex) => {
                        if (!frame?.node1?.position || !frame?.node2?.position) return;

                        if (frame.node1 === node || frame.node2 === node) return;
                        if (frame.node1?.id === node?.id || frame.node2?.id === node?.id) return;

                        const a = this.getPoint3D(frame.node1);
                        const b = this.getPoint3D(frame.node2);

                        const result = this.distancePointToSegment3D(point, a, b);

                        if (
                            result.distance <= tolerance &&
                            result.t > 0.001 &&
                            result.t < 0.999
                        ) {
                            items.push({
                                level: 'warning',
                                title: 'Unconnected joint on frame',
                                message: `Node ${this.getNodeId(node, nodeIndex)} appears to lie on Frame ${this.getFrameId(frame, frameIndex)} but is not connected to it.`,
                                data: {
                                    node: this.getNodeId(node, nodeIndex),
                                    frame: this.getFrameId(frame, frameIndex),
                                    distance: result.distance
                                }
                            });
                        }
                    });
                });

                return items;
            },

            distancePointToSegment3D(point, a, b) {
                const ab = {
                    x: b.x - a.x,
                    y: b.y - a.y,
                    z: b.z - a.z
                };

                const ap = {
                    x: point.x - a.x,
                    y: point.y - a.y,
                    z: point.z - a.z
                };

                const ab2 = ab.x * ab.x + ab.y * ab.y + ab.z * ab.z;

                if (ab2 <= 1e-12) {
                    return {
                        distance: this.distance3D(point, a),
                        t: 0
                    };
                }

                let t = (ap.x * ab.x + ap.y * ab.y + ap.z * ab.z) / ab2;
                t = Math.max(0, Math.min(1, t));

                const projection = {
                    x: a.x + ab.x * t,
                    y: a.y + ab.y * t,
                    z: a.z + ab.z * t
                };

                return {
                    distance: this.distance3D(point, projection),
                    t,
                    projection
                };
            },

            checkIsolatedNodes(nodes, frames) {
                const connectedNodeIds = new Set();

                frames.forEach((frame) => {
                    if (frame?.node1?.id !== undefined) connectedNodeIds.add(String(frame.node1.id));
                    if (frame?.node2?.id !== undefined) connectedNodeIds.add(String(frame.node2.id));
                });

                return nodes
                    .filter((node) => !connectedNodeIds.has(String(node?.id)))
                    .map((node, index) => ({
                        level: 'warning',
                        title: 'Isolated joint',
                        message: `Node ${this.getNodeId(node, index)} is not connected to any frame / line object.`,
                        data: {
                            node: this.getNodeId(node, index)
                        }
                    }));
            },

            checkDuplicateAreas(areas, tolerance) {
                const items = [];
                const signatures = new Map();

                areas.forEach((area, index) => {
                    if (!Array.isArray(area?.points) || area.points.length < 3) return;

                    const signature = area.points
                        .map((p) => {
                            const point = this.getPoint3D(p);
                            return [
                                Math.round(point.x / tolerance),
                                Math.round(point.y / tolerance),
                                Math.round(point.z / tolerance)
                            ].join(',');
                        })
                        .sort()
                        .join('|');

                    if (signatures.has(signature)) {
                        const previous = signatures.get(signature);

                        items.push({
                            level: 'warning',
                            title: 'Duplicate area',
                            message: `Area ${previous.id} and Area ${area.id || index + 1} have very similar boundary points.`,
                            data: {
                                area1: previous.id,
                                area2: area.id || index + 1
                            }
                        });
                    } else {
                        signatures.set(signature, {
                            id: area.id || index + 1
                        });
                    }
                });

                return items;
            },

            checkBasicMeshing(areas) {
                const items = [];

                if (!areas.length) {
                    items.push({
                        level: 'info',
                        title: 'Meshing',
                        message: 'No area objects were found. Floor meshing check skipped.',
                        data: {}
                    });

                    return items;
                }

                const invalidAreas = areas.filter((area) => {
                    return !Array.isArray(area?.points) || area.points.length < 3;
                });

                if (invalidAreas.length > 0) {
                    invalidAreas.forEach((area, index) => {
                        items.push({
                            level: 'warning',
                            title: 'Invalid area',
                            message: `Area ${area?.id || index + 1} has less than three points.`,
                            data: {
                                area: area?.id || index + 1
                            }
                        });
                    });
                } else {
                    items.push({
                        level: 'info',
                        title: 'Meshing',
                        message: `Basic area check completed. Areas found: ${areas.length}.`,
                        data: {
                            areas: areas.length
                        }
                    });
                }

                return items;
            },

            checkSupports(nodes, frames) {
                const items = [];

                if (!nodes.length || !frames.length) {
                    items.push({
                        level: 'info',
                        title: 'Supports',
                        message: 'Support check skipped because the model has no structural frame system.',
                        data: {}
                    });

                    return items;
                }

                const supportedNodes = nodes.filter((node) => {
                    return this.nodeHasRestraint(node) || this.nodeHasSpring(node);
                });

                if (supportedNodes.length === 0) {
                    items.push({
                        level: 'error',
                        title: 'No supports',
                        message: 'No restrained joints or point springs were found. Static analysis may be unstable.',
                        data: {}
                    });
                } else {
                    items.push({
                        level: 'info',
                        title: 'Supports',
                        message: `${supportedNodes.length} supported joint(s) found.`,
                        data: {
                            supportedNodes: supportedNodes.length
                        }
                    });
                }

                return items;
            },

            nodeHasRestraint(node) {
                const r = node?.restraints || node?.constraints;

                if (!r) return false;

                return (
                    r.ux === true ||
                    r.uy === true ||
                    r.uz === true ||
                    r.rx === true ||
                    r.ry === true ||
                    r.rz === true
                );
            },

            nodeHasSpring(node) {
                const springs = node?.pointSprings || node?.springs;
                const k = springs?.stiffness;

                if (!k) return false;

                return (
                    Number(k.ux || 0) !== 0 ||
                    Number(k.uy || 0) !== 0 ||
                    Number(k.uz || 0) !== 0 ||
                    Number(k.rx || 0) !== 0 ||
                    Number(k.ry || 0) !== 0 ||
                    Number(k.rz || 0) !== 0
                );
            },

            checkLoads(nodes, frames) {
                const items = [];

                const nodeLoadCount = nodes.reduce((sum, node) => {
                    return sum + this.countUniqueLoads(node, ['pointLoads', 'jointLoads', 'loads']);
                }, 0);

                const frameLoadCount = frames.reduce((sum, frame) => {
                    return sum + this.countUniqueLoads(frame, ['frameLoads', 'lineLoads', 'loads']);
                }, 0);

                const legacyNodeForces = nodes.filter((node) => this.hasLegacyForce(node)).length;

                const totalLoads = nodeLoadCount + frameLoadCount + legacyNodeForces;

                if (totalLoads === 0) {
                    items.push({
                        level: 'warning',
                        title: 'No loads',
                        message: 'No joint loads, frame loads or legacy nodal forces were found.',
                        data: {}
                    });
                } else {
                    items.push({
                        level: 'info',
                        title: 'Loads',
                        message: `Loads found: ${totalLoads}. Joint/Point: ${nodeLoadCount}, Frame/Line: ${frameLoadCount}, legacy nodal force objects: ${legacyNodeForces}.`,
                        data: {
                            totalLoads,
                            nodeLoadCount,
                            frameLoadCount,
                            legacyNodeForces
                        }
                    });
                }

                return items;
            },

            countUniqueLoads(object, fields) {
                const seen = new Set();

                fields.forEach((field) => {
                    const loads = object?.[field];

                    if (!Array.isArray(loads)) return;

                    loads.forEach((load) => {
                        const key = JSON.stringify({
                            id: load?.id || null,
                            type: load?.type || null,
                            loadCase: load?.loadCase || null,
                            value: load?.value ?? null,
                            forces: load?.forces || null,
                            displacements: load?.displacements || null,
                            temperature: load?.temperature || null,
                            startValue: load?.startValue ?? null,
                            endValue: load?.endValue ?? null
                        });

                        seen.add(key);
                    });
                });

                return seen.size;
            },

            hasLegacyForce(node) {
                const force = node?.force;

                if (!force || typeof force !== 'object') return false;

                const values = [
                    force.fx,
                    force.fy,
                    force.fz,
                    force.Fx,
                    force.Fy,
                    force.Fz,
                    force.mx,
                    force.my,
                    force.mz,
                    force.Mx,
                    force.My,
                    force.Mz
                ];

                return values.some((value) => Number(value || 0) !== 0);
            },

            checkFrameSections(frames) {
                const items = [];

                const structuralFrames = frames.filter((frame) => {
                    return frame?.node1 && frame?.node2;
                });

                const framesWithoutSection = structuralFrames.filter((frame) => {
                    return !(
                        frame.sectionId ||
                        frame.sectionName ||
                        frame.frameSection ||
                        frame.section ||
                        frame.assignment?.frameSection ||
                        frame._A ||
                        frame.A
                    );
                });

                if (framesWithoutSection.length > 0) {
                    framesWithoutSection.forEach((frame, index) => {
                        items.push({
                            level: 'warning',
                            title: 'Frame section not assigned',
                            message: `Frame ${this.getFrameId(frame, index)} has no explicit frame section assigned.`,
                            data: {
                                frame: this.getFrameId(frame, index)
                            }
                        });
                    });
                } else if (structuralFrames.length > 0) {
                    items.push({
                        level: 'info',
                        title: 'Frame sections',
                        message: `All structural frame objects have section data or fallback area data.`,
                        data: {
                            frames: structuralFrames.length
                        }
                    });
                }

                return items;
            }
        };
    }
</script>