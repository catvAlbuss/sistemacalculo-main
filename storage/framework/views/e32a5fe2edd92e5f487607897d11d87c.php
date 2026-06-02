<?php if (isset($component)) { $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54 = $attributes; } ?>
<?php $component = App\View\Components\AppLayout::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('app-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\AppLayout::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
    <?php if (isset($component)) { $__componentOriginalfd1f218809a441e923395fcbf03e4272 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfd1f218809a441e923395fcbf03e4272 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.header','data' => ['title' => 'Cimentacion 2.0']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Cimentacion 2.0']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfd1f218809a441e923395fcbf03e4272)): ?>
<?php $attributes = $__attributesOriginalfd1f218809a441e923395fcbf03e4272; ?>
<?php unset($__attributesOriginalfd1f218809a441e923395fcbf03e4272); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfd1f218809a441e923395fcbf03e4272)): ?>
<?php $component = $__componentOriginalfd1f218809a441e923395fcbf03e4272; ?>
<?php unset($__componentOriginalfd1f218809a441e923395fcbf03e4272); ?>
<?php endif; ?>
    <?php if (! $__env->hasRenderedOnce('6e284aaf-5ce5-47c6-b747-312ce637144d')): $__env->markAsRenderedOnce('6e284aaf-5ce5-47c6-b747-312ce637144d');
$__env->startPush('styles'); ?>
        <link href="https://netdna.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.css" rel="stylesheet">
    <?php $__env->stopPush(); endif; ?>

    <div class="py-2">
        <div class="mx-auto w-full">
            <div class="">
                <!-- Formulario -->
                <div class="w-full">
                    <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                        <div class="mb-5">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Define los parametros, importa
                                reacciones, selecciona 3 combos y luego completa coordenadas.</p>
                        </div>
                        <form id="zapatas2Form" class="space-y-6">
                            <?php echo csrf_field(); ?>
                            <div
                                class="grid gap-4 lg:grid-cols-[minmax(160px,1fr)_minmax(220px,1fr)_minmax(320px,1.25fr)]">
                                <div
                                    class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                    <div class="space-y-2">
                                        <label for="dF"
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300">Df</label>
                                        <input
                                            class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                            id="dF" name="dF" type="number" value="2" step="any"
                                            required>
                                    </div>
                                </div>
                                <div
                                    class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                    <div class="space-y-2">
                                        <label for="pesoEspecifico"
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso
                                            Específico (𝛾<sub>e</sub>)</label>
                                        <input
                                            class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                            id="pesoEspecifico" name="pesoEspecifico" type="number" value="1.8"
                                            step="any" required>
                                    </div>
                                </div>
                                <div
                                    class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                    <div class="mb-2 flex items-center justify-between gap-3">
                                        <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">1. Excel de
                                            reacciones</p>
                                        <span
                                            class="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">Joint
                                            Reactions</span>
                                    </div>
                                    <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                                        <input id="excelFile" name="excelFile" type="file" accept=".xlsx"
                                            class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                        <button type="button" id="importarExcel"
                                            class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:border-blue-500 hover:bg-blue-400">Importar</button>
                                    </div>
                                </div>
                            </div>

                            <div id="excelCombosContainer"
                                class="hidden rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-gray-900">
                                <div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p class="font-semibold text-gray-800 dark:text-gray-200">2. Selecciona 3
                                            combinaciones</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Se eliminan duplicados de la
                                            columna D desde la fila 5.</p>
                                    </div>
                                    <p id="excelCombosStatus"
                                        class="text-sm font-medium text-gray-600 dark:text-gray-400">Selecciona 3
                                        combinaciones.</p>
                                </div>
                                <div id="excelCombosList"
                                    class="grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-4">
                                </div>
                            </div>

                            <div id="connectivityExcelContainer"
                                class="hidden rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-gray-900">
                                <div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p class="font-semibold text-gray-800 dark:text-gray-200">3. Excel de
                                            coordenadas</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Cruza la columna C del
                                            primer Excel con la columna A de Point Object Connectivity.</p>
                                    </div>
                                    <span
                                        class="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-200">F
                                        = X, G = Y</span>
                                </div>
                                <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                                    <input id="connectivityExcelFile" name="connectivityExcelFile" type="file"
                                        accept=".xlsx" disabled
                                        class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                    <button type="button" id="importarConnectivityExcel" disabled
                                        class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:border-blue-500 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60">Importar
                                        coordenadas</button>
                                </div>
                            </div>

                            <div id="propiedadesSection"
                                class="hidden rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p class="font-semibold text-gray-800 dark:text-gray-200">Propiedades</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Revisa aquí las propiedades
                                        dinámicas y combinaciones de carga.</p>
                                </div>
                                <div class="grid gap-4 lg:grid-cols-2">
                                    <div id="datosGenerales"
                                        class="min-h-[120px] rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                    </div>
                                    <div id="combinacionDeCargas"
                                        class="min-h-[120px] rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                    </div>
                                </div>
                            </div>

                            <div id="calculoActions" class="hidden grid gap-4 sm:grid-cols-2">
                                <button
                                    class="w-full rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                                    id="calcular" type="submit">CARGAR</button>
                                <button
                                    class="w-full rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                                    id="generarPDF" type="button">PDF</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Resultados -->
                <div class="mt-4 w-full px-4">
                    <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                        <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>

                        <div class="overflow-x-auto" id="resultados">
                            <table class="min-w-full text-gray-800 dark:text-white">
                                <thead>
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Analisis
                                            Estructural
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-4 py-2" id="plot" colspan="4">
                                            <!-- GUI -->
                                            <div>
                                                <form>
                                                    <textarea class="hidden" name="coords" readonly></textarea>
                                                    <input class="hidden" name="zoom" type="range"
                                                        min="5" max="40">
                                                </form>
                                                <ul class="mb-2 flex items-center gap-4">
                                                    <li id="arrows"><i class="fa fa-arrows" title="M: Mover"></i>
                                                    <li id="pencil"><i class="fa fa-pencil" title="L: Linea"></i>
                                                    <li class="hidden" id="plus"><i class="fa fa-plus"
                                                            title="A: Add"></i>
                                                    <li id="scissors"><i class="fa fa-eraser"
                                                            title="C: Eliminar"></i>
                                                    <li id="copy"><i class="fa fa-clone" title="D: Copiar"></i>
                                                    <li class="hidden" id="eye-slash"><i class="fa fa-eye-slash"
                                                            title="V: Toggle Visibility"></i>
                                                    <li id="anchor"><i class="fa fa-anchor"
                                                            title="S: Toggle Grid Snap"></i>
                                                    </li>
                                                    <li><input
                                                            class="form-control w-20 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                            id="snap" name="snap" type="number"
                                                            value="0.5" step="0.1" min="0" required>
                                                    </li>
                                                    <li id="crosshairs"><i class="fa fa-crosshairs"
                                                            title="O: Editar Punto"></i>
                                                    <li><label for="x">X: </label>
                                                        <input
                                                            class="form-control w-20 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                            id="x" name="x" type="number"
                                                            placeholder="0" step="any" required>
                                                    </li>
                                                    <li><label for="y">Y: </label><input
                                                            class="form-control w-20 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                            id="y" name="y" type="number"
                                                            placeholder="0" step="any" required>
                                                    </li>
                                                </ul>
                                                <ul class="hidden gap-4">
                                                    <li id="undo"><i class="fa fa-undo" title="U: Undo"></i>
                                                    <li id="redo"><i class="fa fa-repeat" title="R: Redo"></i>
                                                    <li id="refresh"><i class="fa fa-trash-o"
                                                            title="Delete All"></i>
                                                    </li>
                                                </ul>
                                                
                                                <ul class="hidden">
                                                    <li id="color:1" style="background-color:#2020FF"><i
                                                            class="fa fa-paint-brush" title="Color: BLUE"></i>
                                                    <li id="color:2" style="background-color:#FFFFFF"><i
                                                            class="fa fa-paint-brush" title="Color: WHITE"></i>
                                                    <li id="color:3" style="background-color:#00FF00"><i
                                                            class="fa fa-paint-brush" title="Color: GREEN"></i>
                                                    <li id="color:4" style="background-color:#FFFF00"><i
                                                            class="fa fa-paint-brush" title="Color: YELLOW"></i>
                                                    <li id="color:5" style="background-color:#FF0000"><i
                                                            class="fa fa-paint-brush" title="Color: RED"></i>
                                                    <li id="color:6" style="background-color:#00FFFF"><i
                                                            class="fa fa-paint-brush" title="Color: CYAN"></i>
                                                    <li id="color:7" style="background-color:#FF00FF"><i
                                                            class="fa fa-paint-brush" title="Color: MAGENTA"></i>
                                                    <li id="color:8" style="background-color:#008080"><i
                                                            class="fa fa-paint-brush" title="Color: CYAN_DK"></i>
                                                </ul>
                                                <ul class="hidden">
                                                    <li id="color:9" style="background-color:#E55300"><i
                                                            class="fa fa-paint-brush" title="Color: ORANGE"></i>
                                                    <li id="color:10" style="background-color:#8B4513"><i
                                                            class="fa fa-paint-brush" title="Color: BROWN"></i>
                                                    <li id="color:11" style="background-color:#808000"><i
                                                            class="fa fa-paint-brush" title="Color: YELLOW_DK"></i>
                                                    <li id="color:12" style="background-color:#808080"><i
                                                            class="fa fa-paint-brush" title="Color: GRAY"></i>
                                                    <li id="color:13" style="background-color:#404040"><i
                                                            class="fa fa-paint-brush" title="Color: GRAY_DK"></i>
                                                    <li id="color:14" style="background-color:#87CEFA"><i
                                                            class="fa fa-paint-brush" title="Color: LIGHTSKYBLUE"></i>
                                                    <li id="color:15" style="background-color:#1E90FF"><i
                                                            class="fa fa-paint-brush" title="Color: DODGERBLUE"></i>
                                                    <li id="color:16" style="background-color:#ADD8E6"><i
                                                            class="fa fa-paint-brush" title="Color: LIGHTBLUE"></i>
                                                </ul>
                                                <ul class="hidden gap-4">

                                                    <li id="clipboard"><i class="fa fa-clipboard"
                                                            title="Select array text"></i>
                                                </ul>
                                            </div>
                                            <div class="relative h-[640px] w-full" id="editor"><canvas
                                                    class="h-full w-full"></canvas>
                                            </div>
                                            <form id="calcularZapatas2">
                                                <?php echo csrf_field(); ?>
                                                <button
                                                    class="mt-2 rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                                                    type="submit">CALCULAR</button>
                                            </form>
                                        </td>
                                    </tr>
                                </thead>
                                <tbody id="polygons">
                                </tbody>
                                <tbody id="graficos">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-4 py-2" colspan="4">
                                            <div id="zapata1"></div>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-4 py-2" colspan="4">
                                            <div id="zapata2"></div>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-4 py-2" colspan="4">
                                            <div id="zapata3"></div>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-4 py-2" colspan="4">
                                            <div id="zapata4"></div>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-4 py-2" colspan="4">
                                            <div id="zapata5"></div>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-4 py-2" colspan="4">
                                            <div id="zapata6"></div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php if (! $__env->hasRenderedOnce('b31eb2c4-e59e-41bc-bb71-acbb4fc615fb')): $__env->markAsRenderedOnce('b31eb2c4-e59e-41bc-bb71-acbb4fc615fb');
$__env->startPush('scripts'); ?>
        <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>
        <?php echo app('Illuminate\Foundation\Vite')('resources/js/adm_safecito.js'); ?>
    <?php $__env->stopPush(); endif; ?>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $attributes = $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $component = $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\matlab\admSafecito.blade.php ENDPATH**/ ?>