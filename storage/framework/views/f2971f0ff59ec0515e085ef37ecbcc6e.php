<!-- Side Panel -->
<aside class="cad-bg cad-border flex h-full basis-1/4 flex-col border-r-4">
    <!-- Panel de Grillas Diagonales -->
    <?php if (isset($component)) { $__componentOriginale3e7a63da297dc0fc9b8062fd9d48470 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale3e7a63da297dc0fc9b8062fd9d48470 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel','data' => ['title' => 'Items','init' => 'isOpen = false']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel'); ?>
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
<?php if (isset($__attributesOriginale3e7a63da297dc0fc9b8062fd9d48470)): ?>
<?php $attributes = $__attributesOriginale3e7a63da297dc0fc9b8062fd9d48470; ?>
<?php unset($__attributesOriginale3e7a63da297dc0fc9b8062fd9d48470); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale3e7a63da297dc0fc9b8062fd9d48470)): ?>
<?php $component = $__componentOriginale3e7a63da297dc0fc9b8062fd9d48470; ?>
<?php unset($__componentOriginale3e7a63da297dc0fc9b8062fd9d48470); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginale3e7a63da297dc0fc9b8062fd9d48470 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale3e7a63da297dc0fc9b8062fd9d48470 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel','data' => ['title' => 'Propiedades','init' => 'isOpen = true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel'); ?>
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
                        <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'ID','bind' => 'moveObjectState.selectedObject.id','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'ID','bind' => 'moveObjectState.selectedObject.id','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    </template>
                    <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Posición']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Posición']); ?>
                        <template x-if="moveObjectState.selectedObject">
                            <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'X','bind' => 'moveObjectState.selectedObject.position.x','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'X','bind' => 'moveObjectState.selectedObject.position.x','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                        </template>
                        <template x-if="moveObjectState.selectedObject">
                            <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Y','bind' => 'moveObjectState.selectedObject.position.y','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Y','bind' => 'moveObjectState.selectedObject.position.y','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                        </template>
                        <!-- NUEVO: Campo Z -->
                        <template x-if="moveObjectState.selectedObject">
                            <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Z','bind' => 'moveObjectState.selectedObject.position.z','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Z','bind' => 'moveObjectState.selectedObject.position.z','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                        </template>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
                    <!-- SECCION DE FUERZA -->
                    <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Fuerza']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Fuerza']); ?>
                        <?php if (isset($component)) { $__componentOriginale51a0569e27e05a99200af5c7733d596 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale51a0569e27e05a99200af5c7733d596 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.load-select','data' => ['bind' => 'moveObjectState.currentLoad']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.load-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'moveObjectState.currentLoad']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale51a0569e27e05a99200af5c7733d596)): ?>
<?php $attributes = $__attributesOriginale51a0569e27e05a99200af5c7733d596; ?>
<?php unset($__attributesOriginale51a0569e27e05a99200af5c7733d596); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale51a0569e27e05a99200af5c7733d596)): ?>
<?php $component = $__componentOriginale51a0569e27e05a99200af5c7733d596; ?>
<?php unset($__componentOriginale51a0569e27e05a99200af5c7733d596); ?>
<?php endif; ?>
                        <template x-if="moveObjectState.selectedObject">
                            <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Multiplicador','bind' => 'moveObjectState.selectedObject.force.loads[moveObjectState.currentLoad].multiplier','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Multiplicador','bind' => 'moveObjectState.selectedObject.force.loads[moveObjectState.currentLoad].multiplier','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                        </template>
                        <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Fx','bind' => 'moveObjectState.nodeX','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fx','bind' => 'moveObjectState.nodeX','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Fy','bind' => 'moveObjectState.nodeY','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fy','bind' => 'moveObjectState.nodeY','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Fz','bind' => 'moveObjectState.nodeZ','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fz','bind' => 'moveObjectState.nodeZ','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
                    <!-- SECCION DE SOPORTE -->
                    <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Soporte']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Soporte']); ?>
                        <div class="flex flex-row justify-between">
                            <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'moveObjectState.selectedObject && (moveObjectState.selectedObject.soporte = \'\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'moveObjectState.selectedObject && (moveObjectState.selectedObject.soporte = \'\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']); ?>
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
<?php if (isset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $attributes = $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $component = $__componentOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'moveObjectState.selectedObject && (moveObjectState.selectedObject.soporte = \'soporteUno\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteUno\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'moveObjectState.selectedObject && (moveObjectState.selectedObject.soporte = \'soporteUno\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteUno\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']); ?>
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
<?php if (isset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $attributes = $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $component = $__componentOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'moveObjectState.selectedObject && (moveObjectState.selectedObject.soporte = \'soporteDos\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteDos\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'moveObjectState.selectedObject && (moveObjectState.selectedObject.soporte = \'soporteDos\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteDos\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']); ?>
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
<?php if (isset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $attributes = $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $component = $__componentOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'moveObjectState.selectedObject && (moveObjectState.selectedObject.soporte = \'soporteTres\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteTres\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'moveObjectState.selectedObject && (moveObjectState.selectedObject.soporte = \'soporteTres\')','toggle' => 'moveObjectState.selectedObject?.soporte === \'soporteTres\'','label' => '','class' => 'cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded']); ?>
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
<?php if (isset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $attributes = $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $component = $__componentOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
                        </div>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
                </div>
            </div>
        </template>
        <template x-if="currentState === selectedNodesState">
            <div class="flex flex-col gap-2 p-2" x-data="{ fx: undefined, fy: undefined, fz: undefined, selected: null }">
                <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Fuerza']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Fuerza']); ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Fx','bind' => 'fx','handleInput' => 'currentState.selectedObjects.forEach((n) => {
                                      n.force.x = fx;
                                  })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fx','bind' => 'fx','handleInput' => 'currentState.selectedObjects.forEach((n) => {
                                      n.force.x = fx;
                                  })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Fy','bind' => 'fy','handleInput' => 'currentState.selectedObjects.forEach((n) => {
                                  n.force.y = fy;
                              })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fy','bind' => 'fy','handleInput' => 'currentState.selectedObjects.forEach((n) => {
                                  n.force.y = fy;
                              })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <!-- NUEVO: Fz -->
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Fz','bind' => 'fz','handleInput' => 'currentState.selectedObjects.forEach((n) => { 
                                  n.force.z = fz;
                              })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fz','bind' => 'fz','handleInput' => 'currentState.selectedObjects.forEach((n) => { 
                                  n.force.z = fz;
                              })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Soporte']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Soporte']); ?>
                    <div class="row flex">
                        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'\';
                                  });selected = \'\'','toggle' => 'selected === \'\'','label' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'\';
                                  });selected = \'\'','toggle' => 'selected === \'\'','label' => '']); ?><?php if (isset($component)) { $__componentOriginal9cc99d2f7e4fb901b1869ed11f23383b = $component; } ?>
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
<?php endif; ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $attributes = $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $component = $__componentOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'soporteUno\';
                                  });selected = \'soporteUno\'','toggle' => 'selected === \'soporteUno\'','label' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
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
<?php if (isset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $attributes = $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $component = $__componentOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'soporteDos\';
                                  });selected = \'soporteDos\'','toggle' => 'selected === \'soporteDos\'','label' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
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
<?php if (isset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $attributes = $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $component = $__componentOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'currentState.selectedObjects.forEach((n) => {
                                      n.soporte = \'soporteTres\';
                                  });selected = \'soporteTres\'','toggle' => 'selected === \'soporteTres\'','label' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
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
<?php if (isset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $attributes = $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $component = $__componentOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
                    </div>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
            </div>
        </template>
        <template x-if="currentState === selectedBeamsState && selectedBeamsState.selectedObjects.length > 1">
            <div class="p-2" x-data="{
                E: undefined,
                A: undefined
            }">
                <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Material']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Material']); ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Modulo Elástico','bind' => 'E','handleInput' => 'currentState.selectedObjects.forEach((b) => {
                          b.E = E;
                      })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Modulo Elástico','bind' => 'E','handleInput' => 'currentState.selectedObjects.forEach((b) => {
                          b.E = E;
                      })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginal41441520abe2bff7fe3174c206c7af34 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal41441520abe2bff7fe3174c206c7af34 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.seccion-select','data' => ['bind' => 'A','handleInput' => 'currentState.selectedObjects.forEach((b) => {
                        b.A = A;
                    })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.seccion-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'A','handleInput' => 'currentState.selectedObjects.forEach((b) => {
                        b.A = A;
                    })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal41441520abe2bff7fe3174c206c7af34)): ?>
<?php $attributes = $__attributesOriginal41441520abe2bff7fe3174c206c7af34; ?>
<?php unset($__attributesOriginal41441520abe2bff7fe3174c206c7af34); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal41441520abe2bff7fe3174c206c7af34)): ?>
<?php $component = $__componentOriginal41441520abe2bff7fe3174c206c7af34; ?>
<?php unset($__componentOriginal41441520abe2bff7fe3174c206c7af34); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Área de la sección','bind' => 'currentState.selectedObjects[0].A','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Área de la sección','bind' => 'currentState.selectedObjects[0].A','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
            </div>
        </template>
        <template x-if="currentState === selectedBeamsState && selectedBeamsState.selectedObjects.length === 1">
            <div class="p-2">
                <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'ID','bind' => 'selectedBeamsState.selectedObjects[0].id','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'ID','bind' => 'selectedBeamsState.selectedObjects[0].id','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Material']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Material']); ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Modulo Elástico','bind' => 'selectedBeamsState.selectedObjects[0].E','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Modulo Elástico','bind' => 'selectedBeamsState.selectedObjects[0].E','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginal41441520abe2bff7fe3174c206c7af34 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal41441520abe2bff7fe3174c206c7af34 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.seccion-select','data' => ['bind' => 'selectedBeamsState.selectedObjects[0].A','handleInput' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.seccion-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'selectedBeamsState.selectedObjects[0].A','handleInput' => '']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal41441520abe2bff7fe3174c206c7af34)): ?>
<?php $attributes = $__attributesOriginal41441520abe2bff7fe3174c206c7af34; ?>
<?php unset($__attributesOriginal41441520abe2bff7fe3174c206c7af34); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal41441520abe2bff7fe3174c206c7af34)): ?>
<?php $component = $__componentOriginal41441520abe2bff7fe3174c206c7af34; ?>
<?php unset($__componentOriginal41441520abe2bff7fe3174c206c7af34); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Área de la sección','bind' => 'selectedBeamsState.selectedObjects[0].A','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Área de la sección','bind' => 'selectedBeamsState.selectedObjects[0].A','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
            </div>
        </template>
        <template
            x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects[0] instanceof Arco">
            <div class="p-2">
                <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Parametros']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Parametros']); ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Longitud','bind' => 'selectedParametricState.selectedObjects[0].longitud','handleInput' => 'selectedParametricState.selectedObjects[0].build()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Longitud','bind' => 'selectedParametricState.selectedObjects[0].longitud','handleInput' => 'selectedParametricState.selectedObjects[0].build()']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Flecha','bind' => 'selectedParametricState.selectedObjects[0].flecha','handleInput' => 'selectedParametricState.selectedObjects[0].build()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Flecha','bind' => 'selectedParametricState.selectedObjects[0].flecha','handleInput' => 'selectedParametricState.selectedObjects[0].build()']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Dovela','bind' => 'selectedParametricState.selectedObjects[0].dovela','handleInput' => 'selectedParametricState.selectedObjects[0].build()','minimun' => '0.001','step' => '0.1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Dovela','bind' => 'selectedParametricState.selectedObjects[0].dovela','handleInput' => 'selectedParametricState.selectedObjects[0].build()','minimun' => '0.001','step' => '0.1']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Peralte','step' => '0.1','bind' => 'selectedParametricState.selectedObjects[0].peralte','handleInput' => 'selectedParametricState.selectedObjects[0].build()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Peralte','step' => '0.1','bind' => 'selectedParametricState.selectedObjects[0].peralte','handleInput' => 'selectedParametricState.selectedObjects[0].build()']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginale51a0569e27e05a99200af5c7733d596 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale51a0569e27e05a99200af5c7733d596 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.load-select','data' => ['bind' => 'selectedParametricState.currentLoad']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.load-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'selectedParametricState.currentLoad']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale51a0569e27e05a99200af5c7733d596)): ?>
<?php $attributes = $__attributesOriginale51a0569e27e05a99200af5c7733d596; ?>
<?php unset($__attributesOriginale51a0569e27e05a99200af5c7733d596); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale51a0569e27e05a99200af5c7733d596)): ?>
<?php $component = $__componentOriginale51a0569e27e05a99200af5c7733d596; ?>
<?php unset($__componentOriginale51a0569e27e05a99200af5c7733d596); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Multiplicador','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].multiplier','handleInput' => 'selectedParametricState.selectedObjects[0].changeMultiplier(selectedParametricState.currentLoad)']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Multiplicador','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].multiplier','handleInput' => 'selectedParametricState.selectedObjects[0].changeMultiplier(selectedParametricState.currentLoad)']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => '#Fuerzas','bind' => 'selectedParametricState.selectedObjects[0].forceAmount','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)','minimun' => '0']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => '#Fuerzas','bind' => 'selectedParametricState.selectedObjects[0].forceAmount','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)','minimun' => '0']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Fx','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fx','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fx','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fx','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Fy','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fy','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fy','bind' => 'selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fy','handleInput' => 'selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
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
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
            </div>
        </template>
        <template
            x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects[0] instanceof Puente">
            <div class="p-2">
                <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Parametros']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Parametros']); ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Alto','bind' => 'selectedParametricState.selectedObjects[0].width','handleInput' => 'selectedParametricState.selectedObjects[0].build()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Alto','bind' => 'selectedParametricState.selectedObjects[0].width','handleInput' => 'selectedParametricState.selectedObjects[0].build()']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Anchó','bind' => 'selectedParametricState.selectedObjects[0].height','handleInput' => 'selectedParametricState.selectedObjects[0].build()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Anchó','bind' => 'selectedParametricState.selectedObjects[0].height','handleInput' => 'selectedParametricState.selectedObjects[0].build()']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Peralte','bind' => 'selectedParametricState.selectedObjects[0].peralte','handleInput' => 'selectedParametricState.selectedObjects[0].build()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Peralte','bind' => 'selectedParametricState.selectedObjects[0].peralte','handleInput' => 'selectedParametricState.selectedObjects[0].build()']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Dovela','bind' => 'selectedParametricState.selectedObjects[0].dovela','handleInput' => 'selectedParametricState.selectedObjects[0].build()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Dovela','bind' => 'selectedParametricState.selectedObjects[0].dovela','handleInput' => 'selectedParametricState.selectedObjects[0].build()']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
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
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
            </div>
        </template>
        <template
            x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects[0] instanceof Triangle">
            <div class="p-2">
                <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Parametros']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Parametros']); ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Altura','bind' => 'selectedParametricState.selectedObjects[0].altura','handleInput' => 'selectedParametricState.selectedObjects[0].build()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Altura','bind' => 'selectedParametricState.selectedObjects[0].altura','handleInput' => 'selectedParametricState.selectedObjects[0].build()']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Base','bind' => 'selectedParametricState.selectedObjects[0].base','handleInput' => 'selectedParametricState.selectedObjects[0].build()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Base','bind' => 'selectedParametricState.selectedObjects[0].base','handleInput' => 'selectedParametricState.selectedObjects[0].build()']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
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
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
            </div>
        </template>
        <template x-if="currentState === editParametricState && currentState.editing">
            <div class="p-2">
                <?php if (isset($component)) { $__componentOriginal9b80de87d5999c048534245dcddffdf7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9b80de87d5999c048534245dcddffdf7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.panel-properties','data' => ['title' => 'Material']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.panel-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Material']); ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Modulo Elástico','bind' => 'currentState.editing[0].E','handleInput' => 'currentState.editing.forEach((b) => {
                          b.E = currentState.editing[0].E;
                      })']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Modulo Elástico','bind' => 'currentState.editing[0].E','handleInput' => 'currentState.editing.forEach((b) => {
                          b.E = currentState.editing[0].E;
                      })']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                    
                    <?php if (isset($component)) { $__componentOriginal41441520abe2bff7fe3174c206c7af34 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal41441520abe2bff7fe3174c206c7af34 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.seccion-select','data' => ['bind' => 'currentState.editing[0].A','handleInput' => 'currentState.editing.forEach(function (b) {b.A = currentState.editing[0].A;})']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.seccion-select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'currentState.editing[0].A','handleInput' => 'currentState.editing.forEach(function (b) {b.A = currentState.editing[0].A;})']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal41441520abe2bff7fe3174c206c7af34)): ?>
<?php $attributes = $__attributesOriginal41441520abe2bff7fe3174c206c7af34; ?>
<?php unset($__attributesOriginal41441520abe2bff7fe3174c206c7af34); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal41441520abe2bff7fe3174c206c7af34)): ?>
<?php $component = $__componentOriginal41441520abe2bff7fe3174c206c7af34; ?>
<?php unset($__componentOriginal41441520abe2bff7fe3174c206c7af34); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalfe84b928e7c147f92bacfe110b145f66 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfe84b928e7c147f92bacfe110b145f66 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.input-properties','data' => ['label' => 'Área de la Sección','bind' => 'currentState.editing[0].A','handleInput' => '','disabled' => 'true']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.input-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Área de la Sección','bind' => 'currentState.editing[0].A','handleInput' => '','disabled' => 'true']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $attributes = $__attributesOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__attributesOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfe84b928e7c147f92bacfe110b145f66)): ?>
<?php $component = $__componentOriginalfe84b928e7c147f92bacfe110b145f66; ?>
<?php unset($__componentOriginalfe84b928e7c147f92bacfe110b145f66); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $attributes = $__attributesOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__attributesOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9b80de87d5999c048534245dcddffdf7)): ?>
<?php $component = $__componentOriginal9b80de87d5999c048534245dcddffdf7; ?>
<?php unset($__componentOriginal9b80de87d5999c048534245dcddffdf7); ?>
<?php endif; ?>
            </div>
        </template>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale3e7a63da297dc0fc9b8062fd9d48470)): ?>
<?php $attributes = $__attributesOriginale3e7a63da297dc0fc9b8062fd9d48470; ?>
<?php unset($__attributesOriginale3e7a63da297dc0fc9b8062fd9d48470); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale3e7a63da297dc0fc9b8062fd9d48470)): ?>
<?php $component = $__componentOriginale3e7a63da297dc0fc9b8062fd9d48470; ?>
<?php unset($__componentOriginale3e7a63da297dc0fc9b8062fd9d48470); ?>
<?php endif; ?>
</aside><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views/components/cad/layout/side-panel.blade.php ENDPATH**/ ?>