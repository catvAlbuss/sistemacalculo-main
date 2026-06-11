
<div class="bg-gray-800 border-b border-gray-700 shadow-lg">

    <div class="flex items-center px-2 py-1 gap-4 border-t border-gray-700">
        
        <div class="text-blue-400 font-bold text-sm px-2 whitespace-nowrap border-r border-gray-600">
            ANALISIS 3D ESTRUCTURAL - v0.1.0-alpha
        </div>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Archivo']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Archivo']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16v12H4z M4 6h2 M18 6h2 M4 10h16" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 360px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Modelo
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openNewModelDialog()">
                        <span>📄</span>
                        <span class="flex-1 truncate">Nuevo Modelo...</span>
                        <span class="text-xs text-gray-500 italic">Grid</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Archivo interno del sistema
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openModel()">
                        <span>📂</span>
                        <span class="flex-1 truncate">Abrir modelo JSON...</span>
                        <span class="text-xs text-green-400 italic">Estable</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.saveAsModel()">
                        <span>💾</span>
                        <span class="flex-1 truncate">Guardar como JSON...</span>
                        <span class="text-xs text-green-400 italic">Estable</span>
                    </button>

                    <div class="px-3 py-1 text-[11px] text-gray-400 bg-gray-900">
                        Formato recomendado para guardar y recuperar completamente el modelo.
                    </div>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Intercambio / Importación
                    </div>

                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Importar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Importar']); ?>
                        <span>📥</span>

                         <?php $__env->slot('submenu', null, []); ?> 

                            
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                ETABS
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importETABS_E2K()">
                                <span>📄</span>
                                <span class="flex-1 truncate">Importar .e2k inicial...</span>
                                <span class="text-xs text-yellow-400 italic">Próximo</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importETABS6()">
                                <span>📄</span>
                                <span class="flex-1 truncate">ETABS6 Text File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importETABS_EDB()">
                                <span>🗄️</span>
                                <span class="flex-1 truncate">ETABS .edb File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                CAD / BIM
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importDXFGrid()">
                                <span>📐</span>
                                <span class="flex-1 truncate">DXF Architectural Grid...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importDXFFloorPlan()">
                                <span>🏢</span>
                                <span class="flex-1 truncate">DXF Floor Plan...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importDXF3D()">
                                <span>📦</span>
                                <span class="flex-1 truncate">DXF 3D Model...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importIFC()">
                                <span>🏗️</span>
                                <span class="flex-1 truncate">IFC .ifc File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importRevit()">
                                <span>🏛️</span>
                                <span class="flex-1 truncate">Revit Structure .exr...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Intercambio / Exportación
                    </div>

                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Exportar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Exportar']); ?>
                        <span>📤</span>

                         <?php $__env->slot('submenu', null, []); ?> 

                            
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                ETABS / SAFE
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportETABS_E2K()">
                                <span>📄</span>
                                <span class="flex-1 truncate">Exportar .e2k inicial / no oficial</span>
                                <span class="text-xs text-yellow-400 italic">Avance</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportSAFE_V8()">
                                <span>📄</span>
                                <span class="flex-1 truncate">SAFE V8 .f2k Text File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportSAFE_V12()">
                                <span>📄</span>
                                <span class="flex-1 truncate">SAFE V12 .f2k Text File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportETABS_EDB()">
                                <span>🗄️</span>
                                <span class="flex-1 truncate">ETABS .edb File...</span>
                                <span class="text-xs text-gray-500 italic">No disponible</span>
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                Otros formatos
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportProSteelMDB()">
                                <span>⚙️</span>
                                <span class="flex-1 truncate">ProSteel .mdb File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Salida
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.printGraphics()">
                        <span>🖨️</span>
                        <span class="flex-1 truncate">Imprimir Gráficos</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+P</span>
                    </button>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Editar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Editar']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 390px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Historial
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('undo')">
                        <span>↩️</span>
                        <span class="flex-1 min-w-0 truncate">Undo</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+Z</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('redo')">
                        <span>↪️</span>
                        <span class="flex-1 min-w-0 truncate">Redo</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+Y</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Portapapeles
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('cut')">
                        <span>✂️</span>
                        <span class="flex-1 min-w-0 truncate">Cut</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+X</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('copy')">
                        <span>📋</span>
                        <span class="flex-1 min-w-0 truncate">Copy</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+C</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('paste')">
                        <span>📌</span>
                        <span class="flex-1 min-w-0 truncate">Paste</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+V</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('delete')">
                        <span>🗑️</span>
                        <span class="flex-1 min-w-0 truncate">Delete</span>
                        <span class="text-xs text-gray-500 italic">Del</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Edición del Modelo
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('replicate')">
                        <span>🔄</span>
                        <span class="flex-1 min-w-0 truncate">Replicate...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Datos del Modelo
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('edit-grid-data')">
                        <span>📏</span>
                        <span class="flex-1 min-w-0 truncate">Edit Grid Data</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('edit-story-data')">
                        <span>🏢</span>
                        <span class="flex-1 min-w-0 truncate">Edit Story Data</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('edit-reference-planes')">
                        <span>📐</span>
                        <span class="flex-1 min-w-0 truncate">Edit Reference Planes...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('edit-reference-lines')">
                        <span>━━</span>
                        <span class="flex-1 min-w-0 truncate">Edit Reference Lines...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Herramientas Geométricas
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('merge-points')">
                        <span>🔗</span>
                        <span class="flex-1 min-w-0 truncate">Merge Points...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('align-points-lines-edges')">
                        <span>📍</span>
                        <span class="flex-1 min-w-0 truncate">Align Points/Lines/Edges...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('move-points-lines-areas')">
                        <span>↔️</span>
                        <span class="flex-1 min-w-0 truncate">Move Points/Lines/Areas...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('join-lines')">
                        <span>⛓️</span>
                        <span class="flex-1 min-w-0 truncate">Join Lines</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('divide-lines')">
                        <span>✂️</span>
                        <span class="flex-1 min-w-0 truncate">Divide Lines...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Extrusión
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('extrude-points-to-lines')">
                        <span>📍</span>
                        <span class="flex-1 min-w-0 truncate">Extrude Points to Lines...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('extrude-lines-to-areas')">
                        <span>▭</span>
                        <span class="flex-1 min-w-0 truncate">Extrude Lines to Areas...</span>
                    </button>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Vista']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Vista']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Configurar Vista
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('set-3d-view')">
                        <span>🎥</span>
                        Set 3D View...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('set-plan-view')">
                        <span>🗺️</span>
                        Set Plan View...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('set-elevation-view')">
                        <span>📐</span>
                        Set Elevation View...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Zoom
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('rubber-band-zoom')">
                        <span>🔍</span>
                        Rubber Band Zoom
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('restore-full-view')">
                        <span>🖼️</span>
                        Restore Full View
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('previous-zoom')">
                        <span>⏪</span>
                        Previous Zoom
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('zoom-in-one-step')">
                        <span>🔍+</span>
                        Zoom In One Step
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('zoom-out-one-step')">
                        <span>🔍-</span>
                        Zoom Out One Step
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Navegación
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('pan')">
                        <span>✋</span>
                        Pan
                    </button>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Define']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Define']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16v12H4z M8 6v12 M16 6v12" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 350px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Propiedades de Material
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openMaterialProperties()">
                        <span>📐</span>
                        Material Properties...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Secciones
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openFrameSections()">
                        <span>📐</span>
                        Frame Sections...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openWallSlabSections()">
                        <span>🧱</span>
                        Wall/Slab/Deck Sections...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openLinkProperties()">
                        <span>🔗</span>
                        Link Properties...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openHingeProperties()">
                        <span>🌀</span>
                        Frame Nonlinear Hinge Properties...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Elementos Estructurales
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openDiaphragms()">
                        <span>🏢</span>
                        Diaphragms...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openGroups()">
                        <span>👥</span>
                        Groups...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSectionCuts()">
                        <span>✂️</span>
                        Section Cuts...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Funciones de Carga
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openResponseSpectrumFunctions()">
                        <span>📊</span>
                        Response Spectrum Functions...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openTimeHistoryFunctions()">
                        <span>⏱️</span>
                        Time History Functions...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Casos de Carga
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openLoadCases()">
                        <span>⚖️</span>
                        Static Load Cases...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openResponseSpectrumCases()">
                        <span>🌊</span>
                        Response Spectrum Cases...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openTimeHistoryCases()">
                        <span>📈</span>
                        Time History Cases...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openPushoverCases()">
                        <span>📉</span>
                        Static Nonlinear/Pushover Cases...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSequentialConstruction()">
                        <span>🏗️</span>
                        Add Sequential Construction Case
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Combinaciones
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openLoadCombinations()">
                        <span>🔢</span>
                        Load Combinations...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.addDefaultDesignCombos()">
                        <span>📋</span>
                        Add Default Design Combos...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.convertCombosToNonlinear()">
                        <span>🔄</span>
                        Convert Combos to Nonlinear Cases...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSeismicEffects()">
                        <span>🌍</span>
                        Special Seismic Load Effects...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Masa
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openMassSource()">
                        <span>⚖️</span>
                        Mass Source...
                    </button>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Dibujar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Dibujar']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 20l4-1 9-9-3-3-9 9-1 4z" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Selección y edición
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('select-object')">
                        <span>🖱️</span> Seleccionar objeto
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('reshape-object')">
                        <span>✏️</span> Modificar objeto
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Objetos puntuales
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-point')">
                        <span>📍</span> Dibujar objetos de puntos
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Draw Line Objects
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawFrameTool()">
                        <span>📏</span> Draw Lines (Plan, Elev, 3D)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('create-lines-region-clicks')">
                        <span>▦</span> Create Lines in Region or at Clicks (Plan, Elev, 3D)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('create-columns-region-clicks')">
                        <span>│</span> Create Columns in Region or at Clicks (Plan)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('create-secondary-beams-region-clicks')">
                        <span>═</span> Create Secondary Beams in Region or at Clicks (Plan)
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Snap
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('snap-on')">
                        <span>🧲</span> Ajustar a la cuadrícula ON
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('snap-off')">
                        <span>🚫</span> Ajustar a la cuadrícula OFF
                    </button>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Seleccionar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Seleccionar']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Por Ubicación
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateSelectMenuAction('select-pointer-window')">
                        <span>🖱️</span>
                        En Puntero/En Ventana
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.selectByXYPlane()">
                        <span>📐</span>
                        en Plano XY
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.selectByXZPlane()">
                        <span>📐</span>
                        en Plano XZ
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.selectByYZPlane()">
                        <span>📐</span>
                        en Plano YZ
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Por Propiedades
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.selectByGroups()">
                        <span>👥</span>
                        por Grupos...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.selectByFrameSections()">
                        <span>📐</span>
                        por Secciones de Marco
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        General
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateSelectMenuAction('select-invert')">
                        <span>🔄</span>
                        Invertir
                    </button>

                    
                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Deseleccionar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Deseleccionar']); ?>
                        <span>❌</span>

                         <?php $__env->slot('submenu', null, []); ?> 

                            
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                Por Ubicación
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByPointer()">
                                <span>🖱️</span>
                                En Puntero/En Ventana
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByXYPlane()">
                                <span>📐</span>
                                en Plano XY
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByXZPlane()">
                                <span>📐</span>
                                en Plano XZ
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByYZPlane()">
                                <span>📐</span>
                                en Plano YZ
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                Por Propiedades
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByGroups()">
                                <span>👥</span>
                                por Grupos...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByFrameSections()">
                                <span>📐</span>
                                por Secciones de Pórtico...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                General
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.activateSelectMenuAction('select-none')">
                                <span>✅</span>
                                Todo
                            </button>

                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Asignar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Asignar']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Asignaciones a Objetos
                    </div>

                    
                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Joint / Point']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Joint / Point']); ?>
                        <span>⚫</span>

                         <?php $__env->slot('submenu', null, []); ?> 
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-diaphragms')">
                                <span>🏢</span>
                                Diaphragms...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-restraints')">
                                <span>⚓</span>
                                Restraints / Supports...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-springs')">
                                <span>➿</span>
                                Point Springs...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-mass')">
                                <span>⚖️</span>
                                Masses...
                            </button>
                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                    
                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Frame / Line']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Frame / Line']); ?>
                        <span>━━</span>

                         <?php $__env->slot('submenu', null, []); ?> 
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-section')">
                                <span>📐</span>
                                Frame Section...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-releases')">
                                <span>🔓</span>
                                Frame Releases / Partial Fixity...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-end-offsets')">
                                <span>📏</span>
                                End (Length) Offsets...
                            </button>
                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Cargas
                    </div>

                    
                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Joint / Point Loads']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Joint / Point Loads']); ?>
                        <span>🔴</span>

                         <?php $__env->slot('submenu', null, []); ?> 
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-load-force')">
                                <span>🎯</span>
                                Force...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-load-ground-displacement')">
                                <span>🌍</span>
                                Ground Displacement...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-load-temperature')">
                                <span>🌡️</span>
                                Temperature...
                            </button>
                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                    
                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Frame / Line Loads']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Frame / Line Loads']); ?>
                        <span>📊</span>

                         <?php $__env->slot('submenu', null, []); ?> 
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-load-point')">
                                <span>📍</span>
                                Point...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-load-distributed')">
                                <span>📊</span>
                                Distributed...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-load-temperature')">
                                <span>🌡️</span>
                                Temperature...
                            </button>
                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Grupos y Revisión
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateAssignMenuAction('group-names')">
                        <span>🧩</span>
                        Group Names...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateAssignMenuAction('show-selected-assignments')">
                        <span>📋</span>
                        Show Selected Assignments...
                    </button>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Analizar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Analizar']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Analysis Setup
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.setAnalysisOptions()">
                        <span>⚙️</span>
                        <span class="flex-1 truncate">Set Analysis Options...</span>
                        <span class="text-xs text-gray-500 italic">Options</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Model Validation
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.checkModel()">
                        <span>🔍</span>
                        <span class="flex-1 truncate">Check Model...</span>
                        <span class="text-xs text-gray-500 italic">Pre-run</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Analysis Run
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.runAnalysis()">
                        <span>▶️</span>
                        <span class="flex-1 truncate">Run Analysis</span>
                        <span class="text-xs text-gray-500 italic">F5</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openSeismicAnalysisDialog()">
                        <span>🌍</span>
                        <span class="flex-1 truncate">Seismic Spectral Analysis...</span>
                    </button>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Mostrar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Mostrar']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Modelo
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-undeformed-shape')">
                        <span>📐</span>
                        Show Undeformed Shape
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-reference-planes')">
                        <span>🟨</span>
                        Show Reference Planes
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Cargas
                    </div>

                    
                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Show Loads']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Show Loads']); ?>
                        <span>📊</span>

                         <?php $__env->slot('submenu', null, []); ?> 
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDisplayMenuAction('show-joint-loads')">
                                <span>⚫</span>
                                Joint / Point...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDisplayMenuAction('show-frame-loads')">
                                <span>━━</span>
                                Frame / Line...
                            </button>
                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Deformadas y Modos
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-deformed-shape')">
                        <span>📈</span>
                        Show Deformed Shape...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-mode-shape')">
                        <span>🎵</span>
                        Show Mode Shape...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Fuerzas y Diagramas
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-member-forces')">
                        <span>📉</span>
                        Show Member Forces / Stress Diagram
                    </button>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Diseñar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Diseñar']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 7h6m-6 4h6m-6 4h3m-7 4h14a2 2 0 002-2V7.828a2 2 0 00-.586-1.414l-3.828-3.828A2 2 0 0015.172 2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Diseño de Marcos de Acero
                    </div>

                    
                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Steel Frame Design']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Steel Frame Design']); ?>
                        <span>Ⅰ</span>

                         <?php $__env->slot('submenu', null, []); ?> 

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-select-combo') : cadSystem.showMessage?.('Design pendiente: Select Design Combo', 'warning')">
                                <span>📋</span>
                                Select Design Combo...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-overwrites') : cadSystem.showMessage?.('Design pendiente: View/Revise Overwrites', 'warning')">
                                <span>📝</span>
                                View/Revise Overwrites...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-start-check') : cadSystem.showMessage?.('Design pendiente: Start Design/Check', 'warning')">
                                <span>▶️</span>
                                Start Design/Check of Structure
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-display-info') : cadSystem.showMessage?.('Design pendiente: Display Design Info', 'warning')">
                                <span>📊</span>
                                Display Design Info...
                            </button>

                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Diseño de Joist de Acero
                    </div>

                    
                    <?php if (isset($component)) { $__componentOriginal004d07e9db4f299b47d6118b3775cb72 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal004d07e9db4f299b47d6118b3775cb72 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-subitem','data' => ['label' => 'Steel Joist Design']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Steel Joist Design']); ?>
                        <span>▰</span>

                         <?php $__env->slot('submenu', null, []); ?> 

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-select-combo') : cadSystem.showMessage?.('Steel Joist Design pendiente: Select Design Combo', 'warning')">
                                <span>📋</span>
                                Select Design Combo...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-overwrites') : cadSystem.showMessage?.('Steel Joist Design pendiente: View/Revise Overwrites', 'warning')">
                                <span>📝</span>
                                View/Revise Overwrites...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-start-using-similarity') : cadSystem.showMessage?.('Steel Joist Design pendiente: Start Design Using Similarity', 'warning')">
                                <span>▶️</span>
                                Start Design Using Similarity
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-start-without-similarity') : cadSystem.showMessage?.('Steel Joist Design pendiente: Start Design Without Similarity', 'warning')">
                                <span>▶️</span>
                                Start Design Without Similarity
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-display-info') : cadSystem.showMessage?.('Steel Joist Design pendiente: Display Design Info', 'warning')">
                                <span>📊</span>
                                Display Design Info...
                            </button>

                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $attributes = $__attributesOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__attributesOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal004d07e9db4f299b47d6118b3775cb72)): ?>
<?php $component = $__componentOriginal004d07e9db4f299b47d6118b3775cb72; ?>
<?php unset($__componentOriginal004d07e9db4f299b47d6118b3775cb72); ?>
<?php endif; ?>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

        
        <?php if (isset($component)) { $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-dropdown-item','data' => ['label' => 'Opciones']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-dropdown-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Opciones']); ?>

            
             <?php $__env->slot('slot', null, []); ?> 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.607 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
             <?php $__env->endSlot(); ?>

            
             <?php $__env->slot('dropdown', null, []); ?> 
                <div class="cad-menu-panel py-1" style="min-width: 340px;">

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Preferences
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('dimensions-tolerances')">
                        <span>📏</span>
                        Dimensions / Tolerances...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('output-decimals')">
                        <span>🔢</span>
                        Output Decimals...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('steel-frame-design')">
                        <span>🏗️</span>
                        Steel Frame Design...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('reinforcement-bar-sizes')">
                        <span>🔩</span>
                        Reinforcement Bar Sizes...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Colors
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('theme-dark')">
                        <span>🌙</span>
                        Dark Canvas
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('theme-light')">
                        <span>☀️</span>
                        Light Canvas
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Windows
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-one')">
                        <span>▣</span>
                        One
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-two-vertical')">
                        <span>▥</span>
                        Two Tiled Vertically
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-two-horizontal')">
                        <span>▤</span>
                        Two Tiled Horizontally
                    </button>

                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $attributes = $__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__attributesOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389)): ?>
<?php $component = $__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389; ?>
<?php unset($__componentOriginal1ea5f2cbbcd5bab7a31e910e6d629389); ?>
<?php endif; ?>

    </div>
</div>

<style>
    /*
    |--------------------------------------------------------------------------
    | ESTILO GENERAL DEL MENÚ SUPERIOR CAD / ETABS
    |--------------------------------------------------------------------------
    */

    .cad-menu-panel {
        width: max-content;
        min-width: 320px;
        max-width: none !important;
        max-height: none !important;
        overflow: visible !important;
    }

    /*
    |--------------------------------------------------------------------------
    | Fuerza al contenedor padre del dropdown a no crear scroll interno
    |--------------------------------------------------------------------------
    */
    div.absolute:has(.cad-menu-panel),
    div[x-show]:has(.cad-menu-panel),
    div:has(> .cad-menu-panel) {
        max-height: none !important;
        overflow: visible !important;
    }

    /*
    |--------------------------------------------------------------------------
    | Encabezados internos
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .px-3.py-1.text-xs.font-semibold.text-blue-400.uppercase.bg-gray-800 {
        font-weight: 600;
        color: #60a5fa;
        background-color: #1f2937;
    }

    /*
    |--------------------------------------------------------------------------
    | Botones del menú
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .dropdown-item {
        width: 100%;
        display: flex !important;
        align-items: center;
        gap: 8px;
        overflow: visible !important;
        white-space: nowrap;
    }

    .cad-menu-panel .dropdown-item:hover {
        background-color: #374151;
    }

    /*
    |--------------------------------------------------------------------------
    | Íconos
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .dropdown-item>span:first-child {
        width: 24px;
        min-width: 24px;
        flex-shrink: 0;
        text-align: center;
    }

    /*
    |--------------------------------------------------------------------------
    | Textos con truncate
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .truncate {
        min-width: 0;
    }

    /*
    |--------------------------------------------------------------------------
    | Submenús laterales
    |--------------------------------------------------------------------------
    */
    .cad-menu-panel .submenu {
        position: relative;
    }

    .cad-menu-panel .submenu-panel {
        display: none;
        position: absolute;
        top: 0;
        left: 100%;
        min-width: 280px;
        width: max-content;
        max-width: none !important;
        max-height: none !important;
        overflow: visible !important;
        background-color: #1f2937;
        border: 1px solid #374151;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        z-index: 99999;
        padding-top: 4px;
        padding-bottom: 4px;
    }

    .cad-menu-panel .submenu:hover>.submenu-panel {
        display: block;
    }
</style><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad/menu-bar.blade.php ENDPATH**/ ?>