<!-- Side Panel -->
<aside class="cad-bg cad-border relative flex h-full w-20 shrink-0 flex-col border-r-4" x-data="{ itemsPanelCollapsed: true }">
    
    <?php
    $qt = 'flex flex-col items-center justify-center gap-0.5 rounded p-1.5 text-[9px] leading-tight text-center hover:bg-blue-600 hover:text-white transition-colors';
    ?>

    
    <button @click="itemsPanelCollapsed = !itemsPanelCollapsed"
        title="Mostrar / ocultar panel de Items y Propiedades"
        class="flex items-center justify-center gap-1 border-b py-1.5 text-[9px] font-semibold uppercase tracking-wide text-gray-400 transition-colors hover:bg-gray-700 hover:text-white cad-border">
        <svg class="h-3.5 w-3.5 transition-transform duration-200" :class="itemsPanelCollapsed ? '' : 'rotate-180'"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span>Panel</span>
    </button>

    <div class="flex flex-1 flex-col overflow-y-auto">

        
        <div class="border-b border-gray-700/70 bg-gray-900/30 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400">Dibujar</div>

        <div class="flex flex-col gap-1">
            <button title="Columnas: clic en un vértice de grilla para una sola, o arrastra un rectángulo para varias (solo en planta)"
                @click="cadSystem.activateDrawMenuAction('create-columns-region-clicks')"
                :class="currentState === columnsRegionState ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="<?php echo e($qt); ?>">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 5h12a1 1 0 0 1 1 1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1a1 1 0 0 1 1-1m15-3v2H3V2zm-6 6h2v14h-2zM7 8h2v14H7zm4 0h2v14h-2z" />
                    </svg></span><span>Columna</span>
            </button>
            <button title="Dibujar frame / barra (funciona en 2D y 3D)"
                @click="cadSystem.activateDrawFrameTool()"
                :class="cadSystem?.activeDrawTool === 'frame' ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="<?php echo e($qt); ?>">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
                    </svg></span><span>Frame</span>
            </button>
            <button title="Vigas por región: clic cerca de un lado de grilla para una sola, o arrastra un rectángulo para varias (planta o elevación)"
                @click="cadSystem.activateDrawMenuAction('create-lines-region-clicks')"
                :class="currentState === createLinesRegionClicksState ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="<?php echo e($qt); ?>">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="3 2" />
                            <path d="M8 8h8M8 16h8" />
                        </g>
                    </svg></span><span>Vigas Reg.</span>
            </button>
            <button title="Dibujar losa / área clic por clic (formas irregulares). Funciona en 2D y en 3D: en el visor 3D se marcan los vértices sobre los nudos, y si están a distinta altura la losa sale inclinada (techos). Clic derecho o Enter cierra."
                @click="cadSystem.activateDrawMenuAction('draw-area-slab')"
                :class="(currentState === slabDrawingState || cadSystem?.activeDrawTool === 'slab') ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="<?php echo e($qt); ?>">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <rect fill="currentColor" width="7" height="7" x="3" y="3" rx="1" />
                            <rect fill="currentColor" width="7" height="7" x="14" y="3" rx="1" />
                            <rect fill="currentColor" width="7" height="7" x="14" y="14" rx="1" />
                            <rect fill="currentColor" width="7" height="7" x="3" y="14" rx="1" />
                        </g>
                    </svg></span><span>Losa</span>
            </button>
            <button title="Losa rectangular: 2 clics (esquinas opuestas)"
                @click="cadSystem.activateDrawMenuAction('draw-area-slab-rectangle')"
                :class="currentState === slabRegionState ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="<?php echo e($qt); ?>">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <rect fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="16" height="16" x="4" y="4" rx="1" />
                    </svg></span><span>Losa Rect.</span>
            </button>
            <button title="Muro: clic sobre una viga o un lado de grilla = muro completo en 1 clic. O 2 clics en vértices/nodos para un largo custom (solo desde un piso, no la Base)"
                @click="cadSystem.activateDrawMenuAction('draw-wall-segment')"
                :disabled="cadSystem.isBasePlanViewActive?.()"
                :class="currentState === wallSegmentDrawingState
                    ? 'bg-blue-600 text-white'
                    : (cadSystem.isBasePlanViewActive?.() ? 'text-gray-500 opacity-40 cursor-not-allowed' : 'text-gray-200')"
                class="<?php echo e($qt); ?>">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <rect x="3" y="4" width="18" height="16" rx="1" />
                            <path d="M3 10h18M3 16h18M9 4v6M15 10v6M9 16v4" />
                        </g>
                    </svg></span><span>Muro</span>
            </button>
            <button title="Zapata a mano alzada (dibuja el polígono alrededor de columnas)"
                @click="cadSystem.activateDrawMenuAction('draw-area-zapata')"
                :class="currentState === zapataDrawingState ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="<?php echo e($qt); ?>">
                <span class="text-base leading-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <!-- Base de concreto de la zapata aislada (Cimiento) -->
                        <path d="M4 17h16v4H4z" />

                        <!-- Columna única central -->
                        <path d="M10 17V7h4v10" />

                        <!-- Línea de carga / Eje vertical central -->
                        <path d="M12 3v4" />
                    </svg>
                </span><span>Zapata a mano alzada</span>
            </button>
            <button title="Ortho (F8): fuerza los lados a salir horizontal o vertical, tanto al dibujar una Zapata a mano alzada como al arrastrar un vértice para editarla."
                @click="cadSystem.options.orthoMode = !cadSystem.options.orthoMode"
                :class="cadSystem.options.orthoMode ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="<?php echo e($qt); ?>">
                <span class="text-base leading-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M4 4v16h16" />
                        <path d="M4 12h16M12 4v16" stroke-dasharray="2 2" />
                    </svg>
                </span><span>Ortho (F8)</span>
            </button>
        </div>

        
        <div class="border-y border-gray-700/70 bg-gray-900/30 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400">Apoyos</div>
        <div class="flex flex-col gap-1">
            <!-- <button title="Seleccionar objetos (frames / shells)"
                    @click="cadSystem.activateDrawMenuAction('select-object')"
                    :class="currentState === reshapeObjectState ? '' : ''"
                    class="<?php echo e($qt); ?> text-gray-200">
                    <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 4.1L12 6M5.1 8l-2.9-.8M6 12l-1.9 2M7.2 2.2L8 5.1m1.037 4.59a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/></svg></span><span>Seleccionar</span>
                </button> -->
            <button title="Asignar soportes / restraints a los nodos seleccionados"
                @click="cadSystem.activateAssignMenuAction('joint-restraints')"
                class="<?php echo e($qt); ?> text-gray-200">
                <span class="scale-90 cad-text-logo-color">
                    <?php if (isset($component)) { $__componentOriginal6bcd6d3af130c1c331a9a489740eb53e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.soporte1','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.soporte1'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e)): ?>
<?php $attributes = $__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e; ?>
<?php unset($__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6bcd6d3af130c1c331a9a489740eb53e)): ?>
<?php $component = $__componentOriginal6bcd6d3af130c1c331a9a489740eb53e; ?>
<?php unset($__componentOriginal6bcd6d3af130c1c331a9a489740eb53e); ?>
<?php endif; ?>
                </span><span>Soporte</span>
            </button>
        </div>

        
        <div class="border-y border-gray-700/70 bg-gray-900/30 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400">Cargas</div>
        <div class="flex flex-col gap-1">
            <button title="Carga distribuida en vigas / frames seleccionados"
                @click="cadSystem.activateAssignMenuAction('frame-load-distributed')"
                class="<?php echo e($qt); ?> text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 6l5 5l5-5M7 13l5 5l5-5" />
                    </svg></span><span>Viga</span>
            </button>
            <button title="Carga puntual (fuerza) en nodos seleccionados"
                @click="cadSystem.activateAssignMenuAction('joint-load-force')"
                class="<?php echo e($qt); ?> text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M22 12h-4M6 12H2m10-6V2m0 20v-4" />
                    </svg></span><span>Nodo</span>
            </button>
            <button title="Carga uniforme de área en losas seleccionadas"
                @click="cadSystem.activateAssignMenuAction('area-load-uniform')"
                class="<?php echo e($qt); ?> text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <rect width="18" height="18" x="3" y="3" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8m-4-4l4 4l4-4" />
                    </svg></span><span>Losa</span>
            </button>
        </div>

        
        <div class="border-y border-gray-700/70 bg-gray-900/30 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400">Secciones</div>
        <div class="flex flex-col gap-1">
            <button title="Asignar sección de frame a los frames seleccionados"
                @click="cadSystem.activateAssignMenuAction('frame-section')"
                class="<?php echo e($qt); ?> text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <rect width="20" height="12" x="2" y="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" rx="2" />
                    </svg></span><span>Frame Sec.</span>
            </button>
            <button title="Asignar sección de losa a las losas seleccionadas"
                @click="cadSystem.activateAssignMenuAction('area-slab-section')"
                class="<?php echo e($qt); ?> text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2m0 12c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2" />
                            <rect width="8" height="8" x="14" y="14" rx="2" />
                        </g>
                    </svg></span><span>Slab Sec.</span>
            </button>
        </div>
    </div>

    
    <div x-show="!itemsPanelCollapsed" x-cloak x-transition class="cad-bg cad-border absolute left-full top-0 z-20 flex h-full w-80 flex-col overflow-y-auto rounded-r-md border-r-4 shadow-2xl">

        <!-- Panel de Grillas Diagonales -->
        <?php if (isset($component)) { $__componentOriginal459fdb1625573d7d1c176936449fb749 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal459fdb1625573d7d1c176936449fb749 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel','data' => ['title' => 'Items','init' => 'isOpen = false']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Items','init' => 'isOpen = false']); ?>
            <ul>
                <li x-data="{ open: false }">
                    <div class="collapsible m-1 flex items-center rounded-sm p-2 text-xs hover:bg-gray-300">
                        <svg class="collapse-icon h-4 w-4 transition-transform duration-200" @click="open = ! open"
                            :class="open ? '' : '-rotate-90'" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
                        </svg>
                        <span>Materiales</span>
                        <button>+</button>
                    </div>
                    <ul class="ml-4 mr-1 mt-2 text-xs" x-show="open" x-transition>
                        <template x-for="material in materiales">
                            <li class="rounded-md px-2 py-1 hover:bg-gray-300"
                                x-text="`Material ${material.id} E: ${material.E} A: ${material.A}`">
                            </li>
                        </template>
                    </ul>
                </li>
            </ul>
            <ul>
                <li x-data="{ open: false }">
                    <div class="collapsible m-1 flex items-center rounded-sm p-2 text-xs hover:bg-gray-300"
                        @click="open = ! open">
                        <svg class="collapse-icon h-4 w-4 transition-transform duration-200"
                            :class="open ? '' : '-rotate-90'" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
                        </svg>
                        <span>Nodos</span>
                    </div>
                    <ul class="ml-4 mr-1 mt-2 text-xs" x-show="open" x-transition>
                        <template x-for="node in nodes">
                            <li class="rounded-md px-2 py-1 hover:bg-gray-300" x-text="`NODO ${node.id}`"
                                @mouseover="node.style.hover()" @mouseout="node.style.default()"></li>
                        </template>
                    </ul>
                </li>
            </ul>
            <ul>
                <li x-data="{ open: false }">
                    <div class="collapsible m-1 flex items-center rounded-sm p-2 text-xs hover:bg-gray-300"
                        @click="open = ! open">
                        <svg class="collapse-icon h-4 w-4 transition-transform duration-200"
                            :class="open ? '' : '-rotate-90'" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
                        </svg>
                        <span>Barras</span>
                    </div>
                    <ul class="ml-4 mr-1 mt-2 text-xs" x-show="open" x-transition>
                        <template x-for="barra in shapes">
                            <li class="rounded-md px-2 py-1 hover:bg-gray-300" x-text="`BARRA ${barra.id}`"
                                @mouseover="barra.style.hover()" @mouseout="barra.style.default()"></li>
                        </template>
                    </ul>
                </li>
            </ul>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal459fdb1625573d7d1c176936449fb749)): ?>
<?php $attributes = $__attributesOriginal459fdb1625573d7d1c176936449fb749; ?>
<?php unset($__attributesOriginal459fdb1625573d7d1c176936449fb749); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal459fdb1625573d7d1c176936449fb749)): ?>
<?php $component = $__componentOriginal459fdb1625573d7d1c176936449fb749; ?>
<?php unset($__componentOriginal459fdb1625573d7d1c176936449fb749); ?>
<?php endif; ?>

        <?php if (isset($component)) { $__componentOriginal459fdb1625573d7d1c176936449fb749 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal459fdb1625573d7d1c176936449fb749 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel','data' => ['title' => 'Propiedades','init' => 'isOpen = true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Propiedades','init' => 'isOpen = true']); ?>
            <!-- Se cambio el currentstate === moveObjectState -->
            <template x-if="currentState === moveObjectState">
                <div x-show="moveObjectState.selectedObject">
                    <div class="flex flex-col gap-2 p-2">
                        <template x-if="moveObjectState.selectedObject">
                            <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'ID','bind' => 'moveObjectState.selectedObject.id','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'ID','bind' => 'moveObjectState.selectedObject.id','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        </template>
                        <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Posición']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Posición']); ?>
                            <template x-if="moveObjectState.selectedObject">
                                <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'X','bind' => 'moveObjectState.selectedObject.position.x','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'X','bind' => 'moveObjectState.selectedObject.position.x','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                            </template>
                            <template x-if="moveObjectState.selectedObject">
                                <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Y','bind' => 'moveObjectState.selectedObject.position.y','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Y','bind' => 'moveObjectState.selectedObject.position.y','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                            </template>
                            <!-- NUEVO: Campo Z -->
                            <template x-if="moveObjectState.selectedObject">
                                <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Z','bind' => 'moveObjectState.selectedObject.position.z','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Z','bind' => 'moveObjectState.selectedObject.position.z','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                            </template>
                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                        <!-- SECCION DE FUERZA -->
                        <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Fuerza']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Fuerza']); ?>
                            <?php if (isset($component)) { $__componentOriginalfc2de9e2f3bad1f0a4b00941f34795f8 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfc2de9e2f3bad1f0a4b00941f34795f8 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.load-select','data' => ['bind' => 'moveObjectState.currentLoad']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.load-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'moveObjectState.currentLoad']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfc2de9e2f3bad1f0a4b00941f34795f8)): ?>
<?php $attributes = $__attributesOriginalfc2de9e2f3bad1f0a4b00941f34795f8; ?>
<?php unset($__attributesOriginalfc2de9e2f3bad1f0a4b00941f34795f8); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfc2de9e2f3bad1f0a4b00941f34795f8)): ?>
<?php $component = $__componentOriginalfc2de9e2f3bad1f0a4b00941f34795f8; ?>
<?php unset($__componentOriginalfc2de9e2f3bad1f0a4b00941f34795f8); ?>
<?php endif; ?>
                            <template x-if="moveObjectState.selectedObject">
                                <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Multiplicador','bind' => 'moveObjectState.selectedObject.force.loads[moveObjectState.currentLoad].multiplier','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Multiplicador','bind' => 'moveObjectState.selectedObject.force.loads[moveObjectState.currentLoad].multiplier','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                            </template>
                            <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Fx','bind' => 'moveObjectState.nodeX','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fx','bind' => 'moveObjectState.nodeX','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Fy','bind' => 'moveObjectState.nodeY','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fy','bind' => 'moveObjectState.nodeY','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Fz','bind' => 'moveObjectState.nodeZ','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fz','bind' => 'moveObjectState.nodeZ','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                        <!-- SECCION DE SOPORTE -->
                        <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Soporte']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Soporte']); ?>
                            <div class="flex flex-row justify-between">
                                <?php if (isset($component)) { $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.ribbon-button','data' => ['clickHandler' => 'cadSystem.clearJointSupportAssignments(moveObjectState.selectedObject)','toggle' => 'moveObjectState.selectedObject?.soporte === \'\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'cadSystem.clearJointSupportAssignments(moveObjectState.selectedObject)','toggle' => 'moveObjectState.selectedObject?.soporte === \'\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']); ?>
                                    <div class="flex flex-col items-center">
                                        <?php if (isset($component)) { $__componentOriginal9cc99d2f7e4fb901b1869ed11f23383b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9cc99d2f7e4fb901b1869ed11f23383b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.sinsoporte','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.sinsoporte'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9cc99d2f7e4fb901b1869ed11f23383b)): ?>
<?php $attributes = $__attributesOriginal9cc99d2f7e4fb901b1869ed11f23383b; ?>
<?php unset($__attributesOriginal9cc99d2f7e4fb901b1869ed11f23383b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9cc99d2f7e4fb901b1869ed11f23383b)): ?>
<?php $component = $__componentOriginal9cc99d2f7e4fb901b1869ed11f23383b; ?>
<?php unset($__componentOriginal9cc99d2f7e4fb901b1869ed11f23383b); ?>
<?php endif; ?>
                                    </div>
                                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $attributes = $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $component = $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
                                <?php if (isset($component)) { $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.ribbon-button','data' => ['clickHandler' => 'setNodeSoporte(moveObjectState.selectedObject, \'soporteUno\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteUno\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'setNodeSoporte(moveObjectState.selectedObject, \'soporteUno\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteUno\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']); ?>
                                    <div class="flex flex-col items-center">
                                        <?php if (isset($component)) { $__componentOriginal6bcd6d3af130c1c331a9a489740eb53e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.soporte1','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.soporte1'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e)): ?>
<?php $attributes = $__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e; ?>
<?php unset($__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6bcd6d3af130c1c331a9a489740eb53e)): ?>
<?php $component = $__componentOriginal6bcd6d3af130c1c331a9a489740eb53e; ?>
<?php unset($__componentOriginal6bcd6d3af130c1c331a9a489740eb53e); ?>
<?php endif; ?>
                                    </div>
                                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $attributes = $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $component = $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
                                <?php if (isset($component)) { $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.ribbon-button','data' => ['clickHandler' => 'setNodeSoporte(moveObjectState.selectedObject, \'soporteDos\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteDos\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'setNodeSoporte(moveObjectState.selectedObject, \'soporteDos\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteDos\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']); ?>
                                    <div class="flex flex-col items-center">
                                        <?php if (isset($component)) { $__componentOriginalfcdb6e291b70368cee76317d779d62d2 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfcdb6e291b70368cee76317d779d62d2 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.soporte2','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.soporte2'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfcdb6e291b70368cee76317d779d62d2)): ?>
<?php $attributes = $__attributesOriginalfcdb6e291b70368cee76317d779d62d2; ?>
<?php unset($__attributesOriginalfcdb6e291b70368cee76317d779d62d2); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfcdb6e291b70368cee76317d779d62d2)): ?>
<?php $component = $__componentOriginalfcdb6e291b70368cee76317d779d62d2; ?>
<?php unset($__componentOriginalfcdb6e291b70368cee76317d779d62d2); ?>
<?php endif; ?>
                                    </div>
                                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $attributes = $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $component = $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
                                <?php if (isset($component)) { $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.ribbon-button','data' => ['clickHandler' => 'setNodeSoporte(moveObjectState.selectedObject, \'soporteTres\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteTres\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'setNodeSoporte(moveObjectState.selectedObject, \'soporteTres\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteTres\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']); ?>
                                    <div class="flex flex-col items-center">
                                        <?php if (isset($component)) { $__componentOriginale10d039b076e34e6f6cbe9edc8373305 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale10d039b076e34e6f6cbe9edc8373305 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.soporte3','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.soporte3'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale10d039b076e34e6f6cbe9edc8373305)): ?>
<?php $attributes = $__attributesOriginale10d039b076e34e6f6cbe9edc8373305; ?>
<?php unset($__attributesOriginale10d039b076e34e6f6cbe9edc8373305); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale10d039b076e34e6f6cbe9edc8373305)): ?>
<?php $component = $__componentOriginale10d039b076e34e6f6cbe9edc8373305; ?>
<?php unset($__componentOriginale10d039b076e34e6f6cbe9edc8373305); ?>
<?php endif; ?>
                                    </div>
                                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $attributes = $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $component = $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
                            </div>
                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                    </div>
                </div>
            </template>
            <template x-if="currentState === selectedNodesState">
                <div class="flex flex-col gap-2 p-2" x-data="{ fx: undefined, fy: undefined, fz: undefined, selected: null }">
                    <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Fuerza']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Fuerza']); ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Fx','bind' => 'fx','handleInput' => 'currentState.selectedObjects.forEach((n) => {
                                      n.force.x = fx;
                                  })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fx','bind' => 'fx','handleInput' => 'currentState.selectedObjects.forEach((n) => {
                                      n.force.x = fx;
                                  })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Fy','bind' => 'fy','handleInput' => 'currentState.selectedObjects.forEach((n) => {
                                  n.force.y = fy;
                              })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fy','bind' => 'fy','handleInput' => 'currentState.selectedObjects.forEach((n) => {
                                  n.force.y = fy;
                              })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <!-- NUEVO: Fz -->
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Fz','bind' => 'fz','handleInput' => 'currentState.selectedObjects.forEach((n) => { 
                                  n.force.z = fz;
                              })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fz','bind' => 'fz','handleInput' => 'currentState.selectedObjects.forEach((n) => { 
                                  n.force.z = fz;
                              })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>

                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Soporte']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Soporte']); ?>
                        <div class="row flex">
                            <?php if (isset($component)) { $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.ribbon-button','data' => ['clickHandler' => 'cadSystem.clearJointSupportAssignments(
        Array.from(currentState.selectedObjects || [])
    ); selected = \'\'','toggle' => 'selected === \'\'','label' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'cadSystem.clearJointSupportAssignments(
        Array.from(currentState.selectedObjects || [])
    ); selected = \'\'','toggle' => 'selected === \'\'','label' => '']); ?>
                                <?php if (isset($component)) { $__componentOriginal9cc99d2f7e4fb901b1869ed11f23383b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9cc99d2f7e4fb901b1869ed11f23383b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.sinsoporte','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.sinsoporte'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9cc99d2f7e4fb901b1869ed11f23383b)): ?>
<?php $attributes = $__attributesOriginal9cc99d2f7e4fb901b1869ed11f23383b; ?>
<?php unset($__attributesOriginal9cc99d2f7e4fb901b1869ed11f23383b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9cc99d2f7e4fb901b1869ed11f23383b)): ?>
<?php $component = $__componentOriginal9cc99d2f7e4fb901b1869ed11f23383b; ?>
<?php unset($__componentOriginal9cc99d2f7e4fb901b1869ed11f23383b); ?>
<?php endif; ?>
                             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $attributes = $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $component = $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.ribbon-button','data' => ['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'soporteUno\';
                                  });selected = \'soporteUno\'','toggle' => 'selected === \'soporteUno\'','label' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'soporteUno\';
                                  });selected = \'soporteUno\'','toggle' => 'selected === \'soporteUno\'','label' => '']); ?><?php if (isset($component)) { $__componentOriginal6bcd6d3af130c1c331a9a489740eb53e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.soporte1','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.soporte1'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e)): ?>
<?php $attributes = $__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e; ?>
<?php unset($__attributesOriginal6bcd6d3af130c1c331a9a489740eb53e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6bcd6d3af130c1c331a9a489740eb53e)): ?>
<?php $component = $__componentOriginal6bcd6d3af130c1c331a9a489740eb53e; ?>
<?php unset($__componentOriginal6bcd6d3af130c1c331a9a489740eb53e); ?>
<?php endif; ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $attributes = $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $component = $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.ribbon-button','data' => ['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'soporteDos\';
                                  });selected = \'soporteDos\'','toggle' => 'selected === \'soporteDos\'','label' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'soporteDos\';
                                  });selected = \'soporteDos\'','toggle' => 'selected === \'soporteDos\'','label' => '']); ?><?php if (isset($component)) { $__componentOriginalfcdb6e291b70368cee76317d779d62d2 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfcdb6e291b70368cee76317d779d62d2 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.soporte2','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.soporte2'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfcdb6e291b70368cee76317d779d62d2)): ?>
<?php $attributes = $__attributesOriginalfcdb6e291b70368cee76317d779d62d2; ?>
<?php unset($__attributesOriginalfcdb6e291b70368cee76317d779d62d2); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfcdb6e291b70368cee76317d779d62d2)): ?>
<?php $component = $__componentOriginalfcdb6e291b70368cee76317d779d62d2; ?>
<?php unset($__componentOriginalfcdb6e291b70368cee76317d779d62d2); ?>
<?php endif; ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $attributes = $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $component = $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.ribbon-button','data' => ['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'soporteTres\';
                                  });selected = \'soporteTres\'','toggle' => 'selected === \'soporteTres\'','label' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'soporteTres\';
                                  });selected = \'soporteTres\'','toggle' => 'selected === \'soporteTres\'','label' => '']); ?><?php if (isset($component)) { $__componentOriginale10d039b076e34e6f6cbe9edc8373305 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale10d039b076e34e6f6cbe9edc8373305 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.soporte3','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.soporte3'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale10d039b076e34e6f6cbe9edc8373305)): ?>
<?php $attributes = $__attributesOriginale10d039b076e34e6f6cbe9edc8373305; ?>
<?php unset($__attributesOriginale10d039b076e34e6f6cbe9edc8373305); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale10d039b076e34e6f6cbe9edc8373305)): ?>
<?php $component = $__componentOriginale10d039b076e34e6f6cbe9edc8373305; ?>
<?php unset($__componentOriginale10d039b076e34e6f6cbe9edc8373305); ?>
<?php endif; ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $attributes = $__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__attributesOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924)): ?>
<?php $component = $__componentOriginale5ab7f77198f02f7c9ee0cc79b050924; ?>
<?php unset($__componentOriginale5ab7f77198f02f7c9ee0cc79b050924); ?>
<?php endif; ?>
                        </div>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                </div>
            </template>
            <template x-if="currentState === selectedBeamsState && selectedBeamsState.selectedObjects.length > 1">
                <div class="p-2" x-data="{
                E: undefined,
                A: undefined
            }">
                    <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Material']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Material']); ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Modulo Elástico','bind' => 'E','handleInput' => 'currentState.selectedObjects.forEach((b) => {
                          b.E = E;
                      })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Modulo Elástico','bind' => 'E','handleInput' => 'currentState.selectedObjects.forEach((b) => {
                          b.E = E;
                      })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.seccion-select','data' => ['bind' => 'A','handleInput' => 'currentState.selectedObjects.forEach((b) => {
                        b.A = A;
                    })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.seccion-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'A','handleInput' => 'currentState.selectedObjects.forEach((b) => {
                        b.A = A;
                    })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6)): ?>
<?php $attributes = $__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6; ?>
<?php unset($__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6)): ?>
<?php $component = $__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6; ?>
<?php unset($__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Área de la sección','bind' => 'currentState.selectedObjects[0].A','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Área de la sección','bind' => 'currentState.selectedObjects[0].A','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                </div>
            </template>
            <template x-if="currentState === selectedBeamsState && selectedBeamsState.selectedObjects.length === 1">
                <div class="p-2">
                    <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'ID','bind' => 'selectedBeamsState.selectedObjects[0].id','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'ID','bind' => 'selectedBeamsState.selectedObjects[0].id','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Material']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Material']); ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Modulo Elástico','bind' => 'selectedBeamsState.selectedObjects[0].E','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Modulo Elástico','bind' => 'selectedBeamsState.selectedObjects[0].E','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.seccion-select','data' => ['bind' => 'selectedBeamsState.selectedObjects[0].A','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.seccion-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'selectedBeamsState.selectedObjects[0].A','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6)): ?>
<?php $attributes = $__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6; ?>
<?php unset($__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6)): ?>
<?php $component = $__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6; ?>
<?php unset($__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Área de la sección','bind' => 'selectedBeamsState.selectedObjects[0].A','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Área de la sección','bind' => 'selectedBeamsState.selectedObjects[0].A','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                </div>
            </template>
            <template
                x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects.length > 0 && selectedParametricState.selectedObjects[0] instanceof Arco">
                <div class="p-2">
                    <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Parametros']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Parametros']); ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Longitud','bind' => 'selectedParametricState.selectedObjects[0].longitud','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Longitud','bind' => 'selectedParametricState.selectedObjects[0].longitud','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Flecha','bind' => 'selectedParametricState.selectedObjects[0].flecha','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Flecha','bind' => 'selectedParametricState.selectedObjects[0].flecha','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Dovela','bind' => 'selectedParametricState.selectedObjects[0].dovela','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])','minimun' => '0.001','step' => '0.1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Dovela','bind' => 'selectedParametricState.selectedObjects[0].dovela','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])','minimun' => '0.001','step' => '0.1']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Peralte','step' => '0.1','bind' => 'selectedParametricState.selectedObjects[0].peralte','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Peralte','step' => '0.1','bind' => 'selectedParametricState.selectedObjects[0].peralte','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalfc2de9e2f3bad1f0a4b00941f34795f8 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfc2de9e2f3bad1f0a4b00941f34795f8 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.load-select','data' => ['bind' => 'selectedParametricState.currentLoad']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.load-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'selectedParametricState.currentLoad']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfc2de9e2f3bad1f0a4b00941f34795f8)): ?>
<?php $attributes = $__attributesOriginalfc2de9e2f3bad1f0a4b00941f34795f8; ?>
<?php unset($__attributesOriginalfc2de9e2f3bad1f0a4b00941f34795f8); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfc2de9e2f3bad1f0a4b00941f34795f8)): ?>
<?php $component = $__componentOriginalfc2de9e2f3bad1f0a4b00941f34795f8; ?>
<?php unset($__componentOriginalfc2de9e2f3bad1f0a4b00941f34795f8); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Multiplicador','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].multiplier','handleInput' => 'selectedParametricState.selectedObjects[0].changeMultiplier(selectedParametricState.currentLoad)']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Multiplicador','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].multiplier','handleInput' => 'selectedParametricState.selectedObjects[0].changeMultiplier(selectedParametricState.currentLoad)']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => '#Fuerzas','bind' => 'selectedParametricState.selectedObjects[0].forceAmount','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)','minimun' => '0']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => '#Fuerzas','bind' => 'selectedParametricState.selectedObjects[0].forceAmount','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)','minimun' => '0']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Fx','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fx','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fx','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fx','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Fy','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fy','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fy','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fy','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <div class="flex-row">
                            <?php if (isset($component)) { $__componentOriginald411d1792bd6cc877d687758b753742c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald411d1792bd6cc877d687758b753742c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.primary-button','data' => ['@click' => 'addToScene(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('primary-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'addToScene(selectedParametricState.selectedObjects[0])']); ?>Añadir <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald411d1792bd6cc877d687758b753742c)): ?>
<?php $attributes = $__attributesOriginald411d1792bd6cc877d687758b753742c; ?>
<?php unset($__attributesOriginald411d1792bd6cc877d687758b753742c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald411d1792bd6cc877d687758b753742c)): ?>
<?php $component = $__componentOriginald411d1792bd6cc877d687758b753742c; ?>
<?php unset($__componentOriginald411d1792bd6cc877d687758b753742c); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginal3b0e04e43cf890250cc4d85cff4d94af = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3b0e04e43cf890250cc4d85cff4d94af = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.secondary-button','data' => ['@click' => 'setState(editParametricState,{editingParametric: selectedParametricState.selectedObjects[0]})']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('secondary-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'setState(editParametricState,{editingParametric: selectedParametricState.selectedObjects[0]})']); ?>Editar <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3b0e04e43cf890250cc4d85cff4d94af)): ?>
<?php $attributes = $__attributesOriginal3b0e04e43cf890250cc4d85cff4d94af; ?>
<?php unset($__attributesOriginal3b0e04e43cf890250cc4d85cff4d94af); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3b0e04e43cf890250cc4d85cff4d94af)): ?>
<?php $component = $__componentOriginal3b0e04e43cf890250cc4d85cff4d94af; ?>
<?php unset($__componentOriginal3b0e04e43cf890250cc4d85cff4d94af); ?>
<?php endif; ?>
                        </div>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                </div>
            </template>
            <template
                x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects.length > 0 && selectedParametricState.selectedObjects[0] instanceof Puente">
                <div class="p-2">
                    <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Parametros']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Parametros']); ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Alto','bind' => 'selectedParametricState.selectedObjects[0].width','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Alto','bind' => 'selectedParametricState.selectedObjects[0].width','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Anchó','bind' => 'selectedParametricState.selectedObjects[0].height','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Anchó','bind' => 'selectedParametricState.selectedObjects[0].height','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Peralte','bind' => 'selectedParametricState.selectedObjects[0].peralte','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Peralte','bind' => 'selectedParametricState.selectedObjects[0].peralte','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Dovela','bind' => 'selectedParametricState.selectedObjects[0].dovela','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Dovela','bind' => 'selectedParametricState.selectedObjects[0].dovela','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginald411d1792bd6cc877d687758b753742c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald411d1792bd6cc877d687758b753742c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.primary-button','data' => ['@click' => 'addToScene(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('primary-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'addToScene(selectedParametricState.selectedObjects[0])']); ?>Añadir <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald411d1792bd6cc877d687758b753742c)): ?>
<?php $attributes = $__attributesOriginald411d1792bd6cc877d687758b753742c; ?>
<?php unset($__attributesOriginald411d1792bd6cc877d687758b753742c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald411d1792bd6cc877d687758b753742c)): ?>
<?php $component = $__componentOriginald411d1792bd6cc877d687758b753742c; ?>
<?php unset($__componentOriginald411d1792bd6cc877d687758b753742c); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                </div>
            </template>
            <template
                x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects.length > 0 && selectedParametricState.selectedObjects[0] instanceof Triangle">
                <div class="p-2">
                    <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Parametros']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Parametros']); ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Altura','bind' => 'selectedParametricState.selectedObjects[0].altura','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Altura','bind' => 'selectedParametricState.selectedObjects[0].altura','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Base','bind' => 'selectedParametricState.selectedObjects[0].base','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Base','bind' => 'selectedParametricState.selectedObjects[0].base','handleInput' => 'selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginald411d1792bd6cc877d687758b753742c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald411d1792bd6cc877d687758b753742c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.primary-button','data' => ['@click' => 'addToScene(selectedParametricState.selectedObjects[0])']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('primary-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'addToScene(selectedParametricState.selectedObjects[0])']); ?>Añadir <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald411d1792bd6cc877d687758b753742c)): ?>
<?php $attributes = $__attributesOriginald411d1792bd6cc877d687758b753742c; ?>
<?php unset($__attributesOriginald411d1792bd6cc877d687758b753742c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald411d1792bd6cc877d687758b753742c)): ?>
<?php $component = $__componentOriginald411d1792bd6cc877d687758b753742c; ?>
<?php unset($__componentOriginald411d1792bd6cc877d687758b753742c); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                </div>
            </template>
            <template x-if="currentState === editParametricState && currentState.editing">
                <div class="p-2">
                    <?php if (isset($component)) { $__componentOriginal6a133fecb4c5789b4efce93bcc69f426 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.panel-properties','data' => ['title' => 'Material']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Material']); ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Modulo Elástico','bind' => 'currentState.editing[0].E','handleInput' => 'currentState.editing.forEach((b) => {
                          b.E = currentState.editing[0].E;
                      })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Modulo Elástico','bind' => 'currentState.editing[0].E','handleInput' => 'currentState.editing.forEach((b) => {
                          b.E = currentState.editing[0].E;
                      })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                        
                        <?php if (isset($component)) { $__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.seccion-select','data' => ['bind' => 'currentState.editing[0].A','handleInput' => 'currentState.editing.forEach(function (b) {b.A = currentState.editing[0].A;})']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.seccion-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'currentState.editing[0].A','handleInput' => 'currentState.editing.forEach(function (b) {b.A = currentState.editing[0].A;})']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6)): ?>
<?php $attributes = $__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6; ?>
<?php unset($__attributesOriginalfeffd5f5b0d8fe47a3d82477277ddfa6); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6)): ?>
<?php $component = $__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6; ?>
<?php unset($__componentOriginalfeffd5f5b0d8fe47a3d82477277ddfa6); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ui.input-properties','data' => ['label' => 'Área de la Sección','bind' => 'currentState.editing[0].A','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ui.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Área de la Sección','bind' => 'currentState.editing[0].A','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $attributes = $__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__attributesOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9)): ?>
<?php $component = $__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9; ?>
<?php unset($__componentOriginalc9f2aa2ecd05fceb1311b2f4c974e6e9); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $attributes = $__attributesOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__attributesOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426)): ?>
<?php $component = $__componentOriginal6a133fecb4c5789b4efce93bcc69f426; ?>
<?php unset($__componentOriginal6a133fecb4c5789b4efce93bcc69f426); ?>
<?php endif; ?>
                </div>
            </template>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal459fdb1625573d7d1c176936449fb749)): ?>
<?php $attributes = $__attributesOriginal459fdb1625573d7d1c176936449fb749; ?>
<?php unset($__attributesOriginal459fdb1625573d7d1c176936449fb749); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal459fdb1625573d7d1c176936449fb749)): ?>
<?php $component = $__componentOriginal459fdb1625573d7d1c176936449fb749; ?>
<?php unset($__componentOriginal459fdb1625573d7d1c176936449fb749); ?>
<?php endif; ?>
    </div>
</aside><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad/layout/side-panel.blade.php ENDPATH**/ ?>