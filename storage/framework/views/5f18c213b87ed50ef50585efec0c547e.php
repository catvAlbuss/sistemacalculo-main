<!-- Toolbar -->
<div class="cad-border flex items-center overflow-x-auto overflow-y-hidden border-b px-2">
    <!-- Add more toolbar buttons as needed -->
    <span class="cad-text-logo-color w-48 text-sm font-bold italic">Analisis Estructural De Armaduras</span>
    <!-- -------------------------APARTADO DE DISEÑAR-------------------------- -->
    <?php if (isset($component)) { $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-group','data' => ['title' => 'Diseñar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-group'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Diseñar']); ?>
        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'setState(trussDrawingState)','toggle' => 'currentState === trussDrawingState','label' => 'Barra']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'setState(trussDrawingState)','toggle' => 'currentState === trussDrawingState','label' => 'Barra']); ?>
            <?php if (isset($component)) { $__componentOriginal869317ad049f7c9e4f13279ee9ac95a0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal869317ad049f7c9e4f13279ee9ac95a0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.beam','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.beam'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal869317ad049f7c9e4f13279ee9ac95a0)): ?>
<?php $attributes = $__attributesOriginal869317ad049f7c9e4f13279ee9ac95a0; ?>
<?php unset($__attributesOriginal869317ad049f7c9e4f13279ee9ac95a0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal869317ad049f7c9e4f13279ee9ac95a0)): ?>
<?php $component = $__componentOriginal869317ad049f7c9e4f13279ee9ac95a0; ?>
<?php unset($__componentOriginal869317ad049f7c9e4f13279ee9ac95a0); ?>
<?php endif; ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'snap_enabled = !snap_enabled','toggle' => 'snap_enabled','label' => 'Snap']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'snap_enabled = !snap_enabled','toggle' => 'snap_enabled','label' => 'Snap']); ?>
            <?php if (isset($component)) { $__componentOriginalcac6e3fb4cc1a89b7d57308a85341c99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcac6e3fb4cc1a89b7d57308a85341c99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.grid-snap','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.grid-snap'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcac6e3fb4cc1a89b7d57308a85341c99)): ?>
<?php $attributes = $__attributesOriginalcac6e3fb4cc1a89b7d57308a85341c99; ?>
<?php unset($__attributesOriginalcac6e3fb4cc1a89b7d57308a85341c99); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcac6e3fb4cc1a89b7d57308a85341c99)): ?>
<?php $component = $__componentOriginalcac6e3fb4cc1a89b7d57308a85341c99; ?>
<?php unset($__componentOriginalcac6e3fb4cc1a89b7d57308a85341c99); ?>
<?php endif; ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'options.showGrid = !options.showGrid','toggle' => 'options.showGrid','label' => 'Grid']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'options.showGrid = !options.showGrid','toggle' => 'options.showGrid','label' => 'Grid']); ?>
            <?php if (isset($component)) { $__componentOriginal462377a995259b30318d6f1d869715f1 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal462377a995259b30318d6f1d869715f1 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.grid','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.grid'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal462377a995259b30318d6f1d869715f1)): ?>
<?php $attributes = $__attributesOriginal462377a995259b30318d6f1d869715f1; ?>
<?php unset($__attributesOriginal462377a995259b30318d6f1d869715f1); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal462377a995259b30318d6f1d869715f1)): ?>
<?php $component = $__componentOriginal462377a995259b30318d6f1d869715f1; ?>
<?php unset($__componentOriginal462377a995259b30318d6f1d869715f1); ?>
<?php endif; ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'fitContentToScreen','toggle' => 'false','label' => 'Centrar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'fitContentToScreen','toggle' => 'false','label' => 'Centrar']); ?>
            <?php if (isset($component)) { $__componentOriginalcfb2e8f101e614923466fa0434cd6b7b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcfb2e8f101e614923466fa0434cd6b7b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.center','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.center'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcfb2e8f101e614923466fa0434cd6b7b)): ?>
<?php $attributes = $__attributesOriginalcfb2e8f101e614923466fa0434cd6b7b; ?>
<?php unset($__attributesOriginalcfb2e8f101e614923466fa0434cd6b7b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcfb2e8f101e614923466fa0434cd6b7b)): ?>
<?php $component = $__componentOriginalcfb2e8f101e614923466fa0434cd6b7b; ?>
<?php unset($__componentOriginalcfb2e8f101e614923466fa0434cd6b7b); ?>
<?php endif; ?>
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
        
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $attributes = $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $component = $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
    <!-- -------------------------APARTADO DE TAREAS -------------------------- -->
    <?php if (isset($component)) { $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-group','data' => ['title' => 'Tareas']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-group'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Tareas']); ?>
        <form class="flex flex-row" x-on:submit="calcularFuerzas">
            <?php echo csrf_field(); ?>
            <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => '','toggle' => 'false','label' => 'Correr']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => '','toggle' => 'false','label' => 'Correr']); ?>
                <?php if (isset($component)) { $__componentOriginal4f2bee746337ac7d3e3d75822e8f06a0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal4f2bee746337ac7d3e3d75822e8f06a0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.run','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.run'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal4f2bee746337ac7d3e3d75822e8f06a0)): ?>
<?php $attributes = $__attributesOriginal4f2bee746337ac7d3e3d75822e8f06a0; ?>
<?php unset($__attributesOriginal4f2bee746337ac7d3e3d75822e8f06a0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal4f2bee746337ac7d3e3d75822e8f06a0)): ?>
<?php $component = $__componentOriginal4f2bee746337ac7d3e3d75822e8f06a0; ?>
<?php unset($__componentOriginal4f2bee746337ac7d3e3d75822e8f06a0); ?>
<?php endif; ?>
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
        </form>
        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'generarReporte','toggle' => 'false','label' => 'Reporte']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'generarReporte','toggle' => 'false','label' => 'Reporte']); ?>
            <?php if (isset($component)) { $__componentOriginal5e60b281127a24be9c04ae9bd3164d13 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5e60b281127a24be9c04ae9bd3164d13 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.pdf','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.pdf'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5e60b281127a24be9c04ae9bd3164d13)): ?>
<?php $attributes = $__attributesOriginal5e60b281127a24be9c04ae9bd3164d13; ?>
<?php unset($__attributesOriginal5e60b281127a24be9c04ae9bd3164d13); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5e60b281127a24be9c04ae9bd3164d13)): ?>
<?php $component = $__componentOriginal5e60b281127a24be9c04ae9bd3164d13; ?>
<?php unset($__componentOriginal5e60b281127a24be9c04ae9bd3164d13); ?>
<?php endif; ?>
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
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $attributes = $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $component = $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
    <!-- -------------------------APARTADO DE ESTRUCTURA ----------------------- -->
    <?php if (isset($component)) { $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-group','data' => ['title' => 'Estructura']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-group'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Estructura']); ?>
        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'options.showWireframe = !options.showWireframe','toggle' => 'options.showWireframe','label' => 'Wireframe']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'options.showWireframe = !options.showWireframe','toggle' => 'options.showWireframe','label' => 'Wireframe']); ?>
            <?php if (isset($component)) { $__componentOriginal91c4d59d9fddb6884d1d9b3d100d54c4 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal91c4d59d9fddb6884d1d9b3d100d54c4 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.wireframe','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.wireframe'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal91c4d59d9fddb6884d1d9b3d100d54c4)): ?>
<?php $attributes = $__attributesOriginal91c4d59d9fddb6884d1d9b3d100d54c4; ?>
<?php unset($__attributesOriginal91c4d59d9fddb6884d1d9b3d100d54c4); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal91c4d59d9fddb6884d1d9b3d100d54c4)): ?>
<?php $component = $__componentOriginal91c4d59d9fddb6884d1d9b3d100d54c4; ?>
<?php unset($__componentOriginal91c4d59d9fddb6884d1d9b3d100d54c4); ?>
<?php endif; ?>
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
        <!-- SECCION DE FUERZAZ -->
        <?php if (isset($component)) { $__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button-subitem','data' => ['clickHandler' => 'options.showForces = !options.showForces','label' => 'Fuerzas','toggle' => 'options.showForces']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'options.showForces = !options.showForces','label' => 'Fuerzas','toggle' => 'options.showForces']); ?>
             <?php $__env->slot('slot1', null, []); ?> <?php if (isset($component)) { $__componentOriginal1e9d81d34251949d47a1f26cd82c6a53 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1e9d81d34251949d47a1f26cd82c6a53 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.force','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.force'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1e9d81d34251949d47a1f26cd82c6a53)): ?>
<?php $attributes = $__attributesOriginal1e9d81d34251949d47a1f26cd82c6a53; ?>
<?php unset($__attributesOriginal1e9d81d34251949d47a1f26cd82c6a53); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1e9d81d34251949d47a1f26cd82c6a53)): ?>
<?php $component = $__componentOriginal1e9d81d34251949d47a1f26cd82c6a53; ?>
<?php unset($__componentOriginal1e9d81d34251949d47a1f26cd82c6a53); ?>
<?php endif; ?> <?php $__env->endSlot(); ?>
             <?php $__env->slot('slot2', null, []); ?> 
                <div class="flex flex-row justify-between gap-1">
                    <label for="fCM">CM</label>
                    <input id="fCM" name="fCM" type="radio" value="CM" x-model="options.currentLoad">
                    <label for="fCV">CV</label>
                    <input id="fCV" name="fCV" type="radio" value="CV" x-model="options.currentLoad">
                    <label for="fCVVM">CVV-</label>
                    <input id="fCVVM" name="fCVVM" type="radio" value="CVVM" x-model="options.currentLoad">
                    <label for="fCVVP">CVV+</label>
                    <input id="fCVVP" name="fCVVP" type="radio" value="CVVP" x-model="options.currentLoad">
                    <label for="fCN">CN</label>
                    <input id="fCN" name="fCN" type="radio" value="CN" x-model="options.currentLoad">
                    <label for="fCLL">CLL</label>
                    <input id="fCLL" name="fCLL" type="radio" value="CLL" x-model="options.currentLoad">
                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24)): ?>
<?php $attributes = $__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24; ?>
<?php unset($__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24)): ?>
<?php $component = $__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24; ?>
<?php unset($__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24); ?>
<?php endif; ?>
        <!-- SECCION DE MATERIALES -->
        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'options.showMaterials = !options.showMaterials','toggle' => 'options.showMaterials','label' => 'Materiales']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'options.showMaterials = !options.showMaterials','toggle' => 'options.showMaterials','label' => 'Materiales']); ?>
            <?php if (isset($component)) { $__componentOriginal9668575ec1542b32a754f370d3e1a9e6 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9668575ec1542b32a754f370d3e1a9e6 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.material','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.material'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9668575ec1542b32a754f370d3e1a9e6)): ?>
<?php $attributes = $__attributesOriginal9668575ec1542b32a754f370d3e1a9e6; ?>
<?php unset($__attributesOriginal9668575ec1542b32a754f370d3e1a9e6); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9668575ec1542b32a754f370d3e1a9e6)): ?>
<?php $component = $__componentOriginal9668575ec1542b32a754f370d3e1a9e6; ?>
<?php unset($__componentOriginal9668575ec1542b32a754f370d3e1a9e6); ?>
<?php endif; ?>
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
        <!-- SECCION ID -->
        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'options.showIDs = !options.showIDs','toggle' => 'options.showIDs','label' => 'ID']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'options.showIDs = !options.showIDs','toggle' => 'options.showIDs','label' => 'ID']); ?>
            <?php if (isset($component)) { $__componentOriginal1d760e808a9fb016fe19c71818421eab = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1d760e808a9fb016fe19c71818421eab = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.id','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.id'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1d760e808a9fb016fe19c71818421eab)): ?>
<?php $attributes = $__attributesOriginal1d760e808a9fb016fe19c71818421eab; ?>
<?php unset($__attributesOriginal1d760e808a9fb016fe19c71818421eab); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1d760e808a9fb016fe19c71818421eab)): ?>
<?php $component = $__componentOriginal1d760e808a9fb016fe19c71818421eab; ?>
<?php unset($__componentOriginal1d760e808a9fb016fe19c71818421eab); ?>
<?php endif; ?>
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
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $attributes = $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $component = $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
    <!-- -------------------------APARTADO DE LOS RESULTADOS------------------------ -->
    <?php if (isset($component)) { $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-group','data' => ['title' => 'Resultados']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-group'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Resultados']); ?>
        <?php if (isset($component)) { $__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button-subitem','data' => ['clickHandler' => 'options.showDeflection = !options.showDeflection','label' => 'Deflección','toggle' => 'options.showDeflection']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'options.showDeflection = !options.showDeflection','label' => 'Deflección','toggle' => 'options.showDeflection']); ?>
             <?php $__env->slot('slot1', null, []); ?> 
                <?php if (isset($component)) { $__componentOriginal752557d3ace796cdc038cf3e44a034ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal752557d3ace796cdc038cf3e44a034ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.deflection','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.deflection'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal752557d3ace796cdc038cf3e44a034ee)): ?>
<?php $attributes = $__attributesOriginal752557d3ace796cdc038cf3e44a034ee; ?>
<?php unset($__attributesOriginal752557d3ace796cdc038cf3e44a034ee); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal752557d3ace796cdc038cf3e44a034ee)): ?>
<?php $component = $__componentOriginal752557d3ace796cdc038cf3e44a034ee; ?>
<?php unset($__componentOriginal752557d3ace796cdc038cf3e44a034ee); ?>
<?php endif; ?>
             <?php $__env->endSlot(); ?>
             <?php $__env->slot('slot2', null, []); ?> 
                <input id="dEscala" name="dEscala" type="range" min="1" max="1000" step="1"
                    x-model="options.deflectionScale" x-on:input="calcularDeflecciones()">
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24)): ?>
<?php $attributes = $__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24; ?>
<?php unset($__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24)): ?>
<?php $component = $__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24; ?>
<?php unset($__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'options.showReactions = !options.showReactions','toggle' => 'options.showReactions','label' => 'Reacción']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'options.showReactions = !options.showReactions','toggle' => 'options.showReactions','label' => 'Reacción']); ?>
            <?php if (isset($component)) { $__componentOriginal83473dcebf713ef73009db4d4ecd0122 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal83473dcebf713ef73009db4d4ecd0122 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.reaction','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.reaction'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal83473dcebf713ef73009db4d4ecd0122)): ?>
<?php $attributes = $__attributesOriginal83473dcebf713ef73009db4d4ecd0122; ?>
<?php unset($__attributesOriginal83473dcebf713ef73009db4d4ecd0122); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal83473dcebf713ef73009db4d4ecd0122)): ?>
<?php $component = $__componentOriginal83473dcebf713ef73009db4d4ecd0122; ?>
<?php unset($__componentOriginal83473dcebf713ef73009db4d4ecd0122); ?>
<?php endif; ?>
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
        <?php if (isset($component)) { $__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button-subitem','data' => ['clickHandler' => 'options.showFAxiales = !options.showFAxiales','label' => 'Axial','toggle' => 'options.showFAxiales']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'options.showFAxiales = !options.showFAxiales','label' => 'Axial','toggle' => 'options.showFAxiales']); ?>
             <?php $__env->slot('slot1', null, []); ?> <?php if (isset($component)) { $__componentOriginal01e62c9404bcd8a28d537294160a21ac = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal01e62c9404bcd8a28d537294160a21ac = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.axial','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.axial'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal01e62c9404bcd8a28d537294160a21ac)): ?>
<?php $attributes = $__attributesOriginal01e62c9404bcd8a28d537294160a21ac; ?>
<?php unset($__attributesOriginal01e62c9404bcd8a28d537294160a21ac); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal01e62c9404bcd8a28d537294160a21ac)): ?>
<?php $component = $__componentOriginal01e62c9404bcd8a28d537294160a21ac; ?>
<?php unset($__componentOriginal01e62c9404bcd8a28d537294160a21ac); ?>
<?php endif; ?> <?php $__env->endSlot(); ?>
             <?php $__env->slot('slot2', null, []); ?> 
                <div class="flex flex-row justify-between gap-1">
                    <label for="fAxialesValues">Fuerzas</label>
                    <input id="fAxialesValues" name="fAxialesValues" type="checkbox" x-model="options.showFAxialesValues">
                </div>
             <?php $__env->endSlot(); ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24)): ?>
<?php $attributes = $__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24; ?>
<?php unset($__attributesOriginal61bbe411231f7dfd50aa8cc0d5919f24); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24)): ?>
<?php $component = $__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24; ?>
<?php unset($__componentOriginal61bbe411231f7dfd50aa8cc0d5919f24); ?>
<?php endif; ?>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $attributes = $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $component = $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
    <!-- -------------------------APARTADO DE PARAMETRIZADO ----------------------- -->
    <?php if (isset($component)) { $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-group','data' => ['title' => 'Parametrizado']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-group'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Parametrizado']); ?>
        <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'creaArco()','toggle' => 'false','label' => 'Arco']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'creaArco()','toggle' => 'false','label' => 'Arco']); ?>
            <?php if (isset($component)) { $__componentOriginald34b316c47645da59c3e2f382da37713 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald34b316c47645da59c3e2f382da37713 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.arco','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.arco'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald34b316c47645da59c3e2f382da37713)): ?>
<?php $attributes = $__attributesOriginald34b316c47645da59c3e2f382da37713; ?>
<?php unset($__attributesOriginald34b316c47645da59c3e2f382da37713); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald34b316c47645da59c3e2f382da37713)): ?>
<?php $component = $__componentOriginald34b316c47645da59c3e2f382da37713; ?>
<?php unset($__componentOriginald34b316c47645da59c3e2f382da37713); ?>
<?php endif; ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'creaTriangulo()','toggle' => 'false','label' => 'Triangulo']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'creaTriangulo()','toggle' => 'false','label' => 'Triangulo']); ?>
            <?php if (isset($component)) { $__componentOriginal2dca214981b1a47a3c1c65a625d6f54b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2dca214981b1a47a3c1c65a625d6f54b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.triangle','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.triangle'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2dca214981b1a47a3c1c65a625d6f54b)): ?>
<?php $attributes = $__attributesOriginal2dca214981b1a47a3c1c65a625d6f54b; ?>
<?php unset($__attributesOriginal2dca214981b1a47a3c1c65a625d6f54b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2dca214981b1a47a3c1c65a625d6f54b)): ?>
<?php $component = $__componentOriginal2dca214981b1a47a3c1c65a625d6f54b; ?>
<?php unset($__componentOriginal2dca214981b1a47a3c1c65a625d6f54b); ?>
<?php endif; ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'creaElipse()','toggle' => 'false','label' => 'Elipse']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'creaElipse()','toggle' => 'false','label' => 'Elipse']); ?>
            <?php if (isset($component)) { $__componentOriginal3d6381f680dd640f8ce7eea21670bd53 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3d6381f680dd640f8ce7eea21670bd53 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.svg.ellipse','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.svg.ellipse'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3d6381f680dd640f8ce7eea21670bd53)): ?>
<?php $attributes = $__attributesOriginal3d6381f680dd640f8ce7eea21670bd53; ?>
<?php unset($__attributesOriginal3d6381f680dd640f8ce7eea21670bd53); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3d6381f680dd640f8ce7eea21670bd53)): ?>
<?php $component = $__componentOriginal3d6381f680dd640f8ce7eea21670bd53; ?>
<?php unset($__componentOriginal3d6381f680dd640f8ce7eea21670bd53); ?>
<?php endif; ?>
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
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $attributes = $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $component = $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
    <!-- Agrega esto en tu toolbar para permitir la importación -->
    <?php if (isset($component)) { $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-group','data' => ['title' => 'CAD']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-group'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'CAD']); ?>
        <label class="cursor-pointer block px-4 py-2 text-sm hover:bg-gray-700">
            Importar DXF/DWG
            <input type="file" id="cad-file-input" accept=".dwg,.dxf" class="hidden" />
        </label>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $attributes = $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31)): ?>
<?php $component = $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31; ?>
<?php unset($__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31); ?>
<?php endif; ?>
</div><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\etabs\layout\toolbar.blade.php ENDPATH**/ ?>