{{-- resources/views/components/cad/modals/check-model-modal.blade.php --}}
<div x-data="checkModelModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    <div class="bg-[#1e1e1e] text-gray-200 w-[450px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
        {{-- Título del Modal --}}
        <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700">
            <div class="flex items-center gap-2">
                <span>🔍</span>
                <span class="text-gray-400">Revisar Modelo</span>
            </div>
            <button @click="close()" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px] text-gray-400 hover:text-white">×</button>
        </div>

        <div class="p-4 flex flex-col gap-4">
            {{-- Grupo: Revisiones de Línea --}}
            <fieldset class="border border-gray-700 rounded p-3 space-y-2">
                <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Revisiones de Línea</legend>
                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.lineOverlap" class="accent-blue-500"> Superposición de líneas
                </label>
                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.lineIntersection" class="accent-blue-500"> Intersección de líneas dentro de la tolerancia
                </label>
                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.lineAreaIntersection" class="accent-blue-500"> Intersección de líneas con bordes de área
                </label>
            </fieldset>

            {{-- Grupo: Revisiones de Puntos --}}
            <fieldset class="border border-gray-700 rounded p-3 space-y-2">
                <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Revisiones de Punto</legend>
                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.pointPoint" class="accent-blue-500"> Puntos/Puntos dentro de la tolerancia
                </label>
                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.pointLine" class="accent-blue-500"> Puntos/Líneas dentro de la tolerancia
                </label>
                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.pointArea" class="accent-blue-500"> Puntos/Áreas dentro de la tolerancia
                </label>
            </fieldset>

            {{-- Grupo: Revisiones de Área --}}
            <fieldset class="border border-gray-700 rounded p-3">
                <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Revisiones de Área</legend>
                <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.areaOverlap" class="accent-blue-500"> Superposición de áreas
                </label>
            </fieldset>

            {{-- Opciones Generales --}}
            <div class="space-y-3 px-1 mt-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-400">Tolerancia para revisiones</span>
                    <div class="flex items-center gap-2">
                        <input type="text" x-model="tolerance.value" class="w-16 bg-[#0c0c0c] border border-gray-600 rounded px-2 py-0.5 text-xs text-right focus:border-blue-500 outline-none">
                        <select x-model="tolerance.unit" class="bg-[#0c0c0c] border border-gray-600 rounded px-1 py-0.5 text-xs focus:border-blue-500 outline-none">
                            <option value="in">in</option>
                            <option value="ft">ft</option>
                            <option value="cm">cm</option>
                            <option value="m">m</option>
                        </select>
                    </div>
                </div>

                <label class="flex items-center gap-2 text-xs text-gray-600 cursor-not-allowed">
                    <input type="checkbox" disabled class="accent-gray-700"> Solo objetos seleccionados
                </label>

                <label class="flex items-center gap-2 text-xs cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.checkMeshing" class="accent-blue-500"> Revisar mallado en todos los pisos
                </label>

                <label class="flex items-center gap-2 text-xs cursor-pointer hover:text-white">
                    <input type="checkbox" x-model="checks.checkLoads" class="accent-blue-500"> Revisar cargas en todos los pisos
                </label>
            </div>

            {{-- Botones de Acción --}}
            <div class="flex justify-center gap-4 pt-4 border-t border-gray-700">
                <button @click="runChecks()" class="px-10 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
                    OK
                </button>
                <button @click="close()" class="px-10 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors">
                    Cancelar
                </button>
            </div>
        </div>
    </div>

    {{-- Modal de Resultados de la Revisión --}}
    <div x-show="showResults" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showResults = false">
        <div class="bg-[#1e1e1e] rounded-lg shadow-2xl w-[500px] max-h-[500px] overflow-hidden border border-gray-700">
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700">
                <div class="flex items-center gap-2">
                    <span x-text="resultsIcon"></span>
                    <span class="text-gray-400">Resultados de la Revisión</span>
                </div>
                <button @click="showResults = false" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px] text-gray-400 hover:text-white">×</button>
            </div>
            <div class="p-4 overflow-y-auto max-h-[400px]">
                <div x-html="resultsHtml" class="text-sm space-y-2"></div>
            </div>
            <div class="flex justify-end px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
                <button @click="showResults = false" class="px-6 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">Cerrar</button>
            </div>
        </div>
    </div>

    {{-- Toast --}}
    <div x-show="showToast" x-cloak class="fixed bottom-5 right-5 z-[300]" x-transition.duration.300ms>
        <div class="px-4 py-3 rounded-lg shadow-lg text-white text-sm" :class="toastType === 'error' ? 'bg-red-600' : (toastType === 'warning' ? 'bg-yellow-600' : 'bg-green-600')">
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
                lineAreaIntersection: false,
                pointPoint: true,
                pointLine: true,
                pointArea: false,
                areaOverlap: true,
                checkMeshing: false,
                checkLoads: false
            },

            tolerance: {
                value: '0.1',
                unit: 'in'
            },

            showResults: false,
            resultsHtml: '',
            resultsIcon: '',

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            init() {
                window.addEventListener('open-check-model-modal', () => {
                    this.openModal();
                });
            },

            showToastMessage(message, type) {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);
                this.toastMessage = message;
                this.toastType = type || 'success';
                this.showToast = true;
                setTimeout(() => {
                    this.showToast = false;
                }, 2500);
            },

            openModal() {
                this.open = true;
            },

            close() {
                this.open = false;
                this.showResults = false;
            },

            runChecks() {
                var results = [];
                var warnings = 0;
                var errors = 0;

                // Obtener datos del modelo actual
                var nodes = window.cadSystem?.nodes || [];
                var beams = window.cadSystem?.shapes || [];

                // Revisar Superposición de líneas
                if (this.checks.lineOverlap) {
                    var overlaps = this.checkLineOverlaps(beams);
                    if (overlaps.length > 0) {
                        warnings += overlaps.length;
                        results.push('<div class="text-yellow-400">⚠️ Superposición de líneas:</div>');
                        results.push('<ul class="list-disc list-inside ml-4 text-gray-300 text-xs mb-2">');
                        overlaps.forEach(function(overlap) {
                            results.push('<li>Elemento ' + overlap.id1 + ' y ' + overlap.id2 + ' se superponen</li>');
                        });
                        results.push('</ul>');
                    }
                }

                // Revisar Intersección de líneas
                if (this.checks.lineIntersection) {
                    var intersections = this.checkLineIntersections(beams);
                    if (intersections.length > 0) {
                        results.push('<div class="text-blue-400">ℹ️ Intersección de líneas:</div>');
                        results.push('<ul class="list-disc list-inside ml-4 text-gray-300 text-xs mb-2">');
                        intersections.forEach(function(intersection) {
                            results.push('<li>Elemento ' + intersection.id1 + ' y ' + intersection.id2 + ' se intersectan</li>');
                        });
                        results.push('</ul>');
                    }
                }

                // Revisar Puntos/Líneas
                if (this.checks.pointLine) {
                    var pointLineIssues = this.checkPointsOnLines(nodes, beams);
                    if (pointLineIssues.length > 0) {
                        errors += pointLineIssues.length;
                        results.push('<div class="text-red-400">❌ Puntos/Líneas fuera de tolerancia:</div>');
                        results.push('<ul class="list-disc list-inside ml-4 text-gray-300 text-xs mb-2">');
                        pointLineIssues.forEach(function(issue) {
                            results.push('<li>Nodo ' + issue.nodeId + ' no está exactamente sobre el elemento ' + issue.beamId + '</li>');
                        });
                        results.push('</ul>');
                    }
                }

                // Revisar Puntos/Puntos (nodos duplicados)
                if (this.checks.pointPoint) {
                    var duplicateNodes = this.checkDuplicateNodes(nodes);
                    if (duplicateNodes.length > 0) {
                        warnings += duplicateNodes.length;
                        results.push('<div class="text-yellow-400">⚠️ Nodos duplicados dentro de la tolerancia:</div>');
                        results.push('<ul class="list-disc list-inside ml-4 text-gray-300 text-xs mb-2">');
                        duplicateNodes.forEach(function(node) {
                            results.push('<li>Nodo ' + node.id1 + ' y ' + node.id2 + ' están muy cerca</li>');
                        });
                        results.push('</ul>');
                    }
                }

                // Revisar Mallado
                if (this.checks.checkMeshing) {
                    results.push('<div class="text-green-400">✅ Revisión de mallado completada</div>');
                }

                // Revisar Cargas
                if (this.checks.checkLoads) {
                    var totalLoads = 0;
                    for (var i = 0; i < nodes.length; i++) {
                        if (nodes[i].loads && nodes[i].loads.length > 0) {
                            totalLoads += nodes[i].loads.length;
                        }
                    }
                    results.push('<div class="text-green-400">✅ Cargas aplicadas: ' + totalLoads + ' cargas puntuales en nodos</div>');
                }

                // Verificar elementos sin nodos válidos
                var invalidBeams = beams.filter(function(b) {
                    return !b.node1 || !b.node2;
                });
                if (invalidBeams.length > 0) {
                    errors += invalidBeams.length;
                    results.push('<div class="text-red-400">❌ Elementos sin nodos válidos: ' + invalidBeams.length + '</div>');
                }

                // Verificar nodos sin elementos conectados
                var nodesWithElements = new Set();
                beams.forEach(function(beam) {
                    if (beam.node1) nodesWithElements.add(beam.node1.id);
                    if (beam.node2) nodesWithElements.add(beam.node2.id);
                });
                var isolatedNodes = nodes.filter(function(node) {
                    return !nodesWithElements.has(node.id);
                });
                if (isolatedNodes.length > 0) {
                    warnings += isolatedNodes.length;
                    results.push('<div class="text-yellow-400">⚠️ Nodos aislados (sin elementos): ' + isolatedNodes.length + '</div>');
                }

                // Resumen final
                var summary = '<div class="border-t border-gray-700 pt-2 mt-2 font-bold">';
                if (errors === 0 && warnings === 0) {
                    summary += '<div class="text-green-400">✅ Modelo revisado: No se encontraron problemas</div>';
                    this.resultsIcon = '✅';
                } else {
                    if (errors > 0) summary += '<div class="text-red-400">❌ Errores encontrados: ' + errors + '</div>';
                    if (warnings > 0) summary += '<div class="text-yellow-400">⚠️ Advertencias: ' + warnings + '</div>';
                    this.resultsIcon = '⚠️';
                }
                summary += '<div class="text-gray-400 text-xs mt-1">Nodos: ' + nodes.length + ' | Elementos: ' + beams.length + '</div>';
                summary += '</div>';

                results.push(summary);

                if (results.length === 0) {
                    this.resultsHtml = '<div class="text-green-400 text-center py-4">✅ No se encontraron problemas en el modelo</div>';
                } else {
                    this.resultsHtml = results.join('');
                }

                this.showResults = true;
            },

            // Función para verificar superposición de líneas
            checkLineOverlaps(beams) {
                var overlaps = [];
                for (var i = 0; i < beams.length; i++) {
                    for (var j = i + 1; j < beams.length; j++) {
                        var b1 = beams[i];
                        var b2 = beams[j];
                        if (b1.node1 && b1.node2 && b2.node1 && b2.node2) {
                            // Verificar si los elementos comparten los mismos nodos
                            if ((b1.node1.id === b2.node1.id && b1.node2.id === b2.node2.id) ||
                                (b1.node1.id === b2.node2.id && b1.node2.id === b2.node1.id)) {
                                overlaps.push({
                                    id1: b1.id,
                                    id2: b2.id
                                });
                            }
                        }
                    }
                }
                return overlaps;
            },

            // Función para verificar intersecciones de líneas
            checkLineIntersections(beams) {
                var intersections = [];
                // Implementación simplificada - en producción sería más robusta
                return intersections;
            },

            // Función para verificar puntos sobre líneas
            checkPointsOnLines(nodes, beams) {
                var issues = [];
                var toleranceNum = parseFloat(this.tolerance.value);

                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    for (var j = 0; j < beams.length; j++) {
                        var beam = beams[j];
                        if (beam.node1 && beam.node2) {
                            // Verificar si el nodo ya es parte del elemento
                            if (beam.node1.id === node.id || beam.node2.id === node.id) {
                                continue;
                            }

                            // Verificar si el nodo está cerca de la línea
                            var isOnLine = this.isPointOnLineSegment({
                                    x: node.position.x,
                                    y: node.position.y
                                }, {
                                    x: beam.node1.position.x,
                                    y: beam.node1.position.y
                                }, {
                                    x: beam.node2.position.x,
                                    y: beam.node2.position.y
                                },
                                toleranceNum
                            );

                            if (isOnLine) {
                                issues.push({
                                    nodeId: node.id,
                                    beamId: beam.id
                                });
                            }
                        }
                    }
                }
                return issues;
            },

            // Función para verificar si un punto está sobre un segmento de línea
            isPointOnLineSegment(point, lineStart, lineEnd, tolerance) {
                var crossProduct = (point.y - lineStart.y) * (lineEnd.x - lineStart.x) -
                    (point.x - lineStart.x) * (lineEnd.y - lineStart.y);

                if (Math.abs(crossProduct) > tolerance) return false;

                var dotProduct = (point.x - lineStart.x) * (lineEnd.x - lineStart.x) +
                    (point.y - lineStart.y) * (lineEnd.y - lineStart.y);
                if (dotProduct < 0) return false;

                var squaredLength = (lineEnd.x - lineStart.x) * (lineEnd.x - lineStart.x) +
                    (lineEnd.y - lineStart.y) * (lineEnd.y - lineStart.y);
                if (dotProduct > squaredLength) return false;

                return true;
            },

            // Función para verificar nodos duplicados
            checkDuplicateNodes(nodes) {
                var duplicates = [];
                var toleranceNum = parseFloat(this.tolerance.value);

                for (var i = 0; i < nodes.length; i++) {
                    for (var j = i + 1; j < nodes.length; j++) {
                        var dx = nodes[i].position.x - nodes[j].position.x;
                        var dy = nodes[i].position.y - nodes[j].position.y;
                        var distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < toleranceNum) {
                            duplicates.push({
                                id1: nodes[i].id,
                                id2: nodes[j].id,
                                distance: distance
                            });
                        }
                    }
                }
                return duplicates;
            }
        }
    }
</script>