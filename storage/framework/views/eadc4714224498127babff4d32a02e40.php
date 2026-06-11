<!-- Toolbar -->
<div>
  <?php if (isset($component)) { $__componentOriginalf824120e00066c06c4cc4b832d89e804 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf824120e00066c06c4cc4b832d89e804 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.menu-bar','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.menu-bar'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf824120e00066c06c4cc4b832d89e804)): ?>
<?php $attributes = $__attributesOriginalf824120e00066c06c4cc4b832d89e804; ?>
<?php unset($__attributesOriginalf824120e00066c06c4cc4b832d89e804); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf824120e00066c06c4cc4b832d89e804)): ?>
<?php $component = $__componentOriginalf824120e00066c06c4cc4b832d89e804; ?>
<?php unset($__componentOriginalf824120e00066c06c4cc4b832d89e804); ?>
<?php endif; ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'openNewModelDialog()','toggle' => 'false','label' => 'Nuevo Modelo']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'openNewModelDialog()','toggle' => 'false','label' => 'Nuevo Modelo']); ?>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
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
      <form class="flex flex-row" x-on:submit.prevent="calcularFuerzas" id="run-analysis-form">
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button-subitem','data' => ['clickHandler' => 'showForces()','label' => 'Fuerzas','toggle' => 'options.showForces']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'showForces()','label' => 'Fuerzas','toggle' => 'options.showForces']); ?>
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
            <input id="fCM" name="fCM" type="radio" value="CM" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCV">CV</label>
            <input id="fCV" name="fCV" type="radio" value="CV" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCVVM">CVV-</label>
            <input id="fCVVM" name="fCVVM" type="radio" value="CVVM" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCVVP">CVV+</label>
            <input id="fCVVP" name="fCVVP" type="radio" value="CVVP" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCN">CN</label>
            <input id="fCN" name="fCN" type="radio" value="CN" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCLL">CLL</label>
            <input id="fCLL" name="fCLL" type="radio" value="CLL" x-model="options.currentLoad" @change="sync3D()">
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button-subitem','data' => ['clickHandler' => 'showDeflections()','label' => 'Deflección','toggle' => 'options.showDeflection']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button-subitem'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'showDeflections()','label' => 'Deflección','toggle' => 'options.showDeflection']); ?>
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
            x-model="options.deflectionScale" @input="updateDeflectionScale()">
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'showReactions()','toggle' => 'options.showReactions','label' => 'Reacción']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'showReactions()','toggle' => 'options.showReactions','label' => 'Reacción']); ?>
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
    <!-- -------------------------APARTADO DE 3D ----------------------- -->

    <?php if (isset($component)) { $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-group','data' => ['title' => 'Grillas']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-group'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Grillas']); ?>
      <button
        id="btn-open-grid-editor"
        type="button"
        class="hover:bg-opacity-80 cad-text-logo-color flex min-w-[72px] flex-col items-center justify-center rounded px-3 py-2 text-xs transition hover:bg-gray-700">
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
        <span class="mt-1 text-[11px]">Editar</span>
      </button>
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

    <?php if (isset($component)) { $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-group','data' => ['title' => 'Vistas']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-group'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Vistas']); ?>
      <div class="flex flex-col px-2 py-1 text-xs text-white">
        <label class="mb-1 text-gray-300">Vista activa</label>

        <select
          class="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
          @change="setViewFromSet($event.target.value)">
          <template x-for="(view, index) in viewSet" :key="index">
            <option :value="index" x-text="view.name"></option>
          </template>
        </select>
      </div>
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

    <!-- Dentro del grupo "3D", añade: -->
    <?php if (isset($component)) { $__componentOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2f54f64a680554883b3f6b0c3c3b4d31 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-group','data' => ['title' => 'Edificio']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-group'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Edificio']); ?>
      <!-- <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'showTestFrame()','toggle' => 'false','label' => 'Pórtico Prueba']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'showTestFrame()','toggle' => 'false','label' => 'Pórtico Prueba']); ?>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18" />
        </svg>
       <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $attributes = $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__attributesOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877)): ?>
<?php $component = $__componentOriginalb8b1bca81d700db9d94581eefb1ea877; ?>
<?php unset($__componentOriginalb8b1bca81d700db9d94581eefb1ea877); ?>
<?php endif; ?> -->

      <!-- Elevar selección -->
      <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'elevateSelectedNodes()','toggle' => 'false','label' => 'Elevar +1m']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'elevateSelectedNodes()','toggle' => 'false','label' => 'Elevar +1m']); ?>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'testEdificioSismico()','toggle' => 'false','label' => 'Edificio Sísmico (Test)']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'testEdificioSismico()','toggle' => 'false','label' => 'Edificio Sísmico (Test)']); ?>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" />
        </svg>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'testTorreConCargaExcentrica()','toggle' => 'false','label' => 'Torre Carga Excentrica']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'testTorreConCargaExcentrica()','toggle' => 'false','label' => 'Torre Carga Excentrica']); ?>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6h13m0 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h3m7 0v6m-4 0h4" />
        </svg>
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

      <!-- Bajar selección -->
      <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'lowerSelectedNodes()','toggle' => 'false','label' => 'Bajar -1m']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'lowerSelectedNodes()','toggle' => 'false','label' => 'Bajar -1m']); ?>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
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

      <!-- Extruir a nuevo piso -->
      <?php if (isset($component)) { $__componentOriginalb8b1bca81d700db9d94581eefb1ea877 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb8b1bca81d700db9d94581eefb1ea877 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.ribbon-button','data' => ['clickHandler' => 'extrudeToNewFloor()','toggle' => 'false','label' => '+ Nuevo Piso']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.ribbon-button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['clickHandler' => 'extrudeToNewFloor()','toggle' => 'false','label' => '+ Nuevo Piso']); ?>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18" />
        </svg>
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
  </div>
  <!-- Modal para File > New Model -->
  <?php if (isset($component)) { $__componentOriginal6daf3514aefd5c5674d0056447e18f58 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6daf3514aefd5c5674d0056447e18f58 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.new-model','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.new-model'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6daf3514aefd5c5674d0056447e18f58)): ?>
<?php $attributes = $__attributesOriginal6daf3514aefd5c5674d0056447e18f58; ?>
<?php unset($__attributesOriginal6daf3514aefd5c5674d0056447e18f58); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6daf3514aefd5c5674d0056447e18f58)): ?>
<?php $component = $__componentOriginal6daf3514aefd5c5674d0056447e18f58; ?>
<?php unset($__componentOriginal6daf3514aefd5c5674d0056447e18f58); ?>
<?php endif; ?>

  <!-- Modal para el apartado de las vistas -->
  <?php if (isset($component)) { $__componentOriginal4948875c799abe139a88ab2fd15ba6f6 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal4948875c799abe139a88ab2fd15ba6f6 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.view-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.view-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal4948875c799abe139a88ab2fd15ba6f6)): ?>
<?php $attributes = $__attributesOriginal4948875c799abe139a88ab2fd15ba6f6; ?>
<?php unset($__attributesOriginal4948875c799abe139a88ab2fd15ba6f6); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal4948875c799abe139a88ab2fd15ba6f6)): ?>
<?php $component = $__componentOriginal4948875c799abe139a88ab2fd15ba6f6; ?>
<?php unset($__componentOriginal4948875c799abe139a88ab2fd15ba6f6); ?>
<?php endif; ?>


  <?php if (isset($component)) { $__componentOriginal45f4532ffd716f1f22a3d1b5a961835f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal45f4532ffd716f1f22a3d1b5a961835f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.material-properties-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.material-properties-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal45f4532ffd716f1f22a3d1b5a961835f)): ?>
<?php $attributes = $__attributesOriginal45f4532ffd716f1f22a3d1b5a961835f; ?>
<?php unset($__attributesOriginal45f4532ffd716f1f22a3d1b5a961835f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal45f4532ffd716f1f22a3d1b5a961835f)): ?>
<?php $component = $__componentOriginal45f4532ffd716f1f22a3d1b5a961835f; ?>
<?php unset($__componentOriginal45f4532ffd716f1f22a3d1b5a961835f); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginal789374333040eeb1e6efa669a565bd01 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal789374333040eeb1e6efa669a565bd01 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.frame-sections-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.frame-sections-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal789374333040eeb1e6efa669a565bd01)): ?>
<?php $attributes = $__attributesOriginal789374333040eeb1e6efa669a565bd01; ?>
<?php unset($__attributesOriginal789374333040eeb1e6efa669a565bd01); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal789374333040eeb1e6efa669a565bd01)): ?>
<?php $component = $__componentOriginal789374333040eeb1e6efa669a565bd01; ?>
<?php unset($__componentOriginal789374333040eeb1e6efa669a565bd01); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginal51bcaeb681b754bbee9f69cab5c89119 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal51bcaeb681b754bbee9f69cab5c89119 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.diaphragms-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.diaphragms-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal51bcaeb681b754bbee9f69cab5c89119)): ?>
<?php $attributes = $__attributesOriginal51bcaeb681b754bbee9f69cab5c89119; ?>
<?php unset($__attributesOriginal51bcaeb681b754bbee9f69cab5c89119); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal51bcaeb681b754bbee9f69cab5c89119)): ?>
<?php $component = $__componentOriginal51bcaeb681b754bbee9f69cab5c89119; ?>
<?php unset($__componentOriginal51bcaeb681b754bbee9f69cab5c89119); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginal2ebbc2a723cc7df4e49bf0b33312d115 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2ebbc2a723cc7df4e49bf0b33312d115 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.section-cuts-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.section-cuts-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2ebbc2a723cc7df4e49bf0b33312d115)): ?>
<?php $attributes = $__attributesOriginal2ebbc2a723cc7df4e49bf0b33312d115; ?>
<?php unset($__attributesOriginal2ebbc2a723cc7df4e49bf0b33312d115); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2ebbc2a723cc7df4e49bf0b33312d115)): ?>
<?php $component = $__componentOriginal2ebbc2a723cc7df4e49bf0b33312d115; ?>
<?php unset($__componentOriginal2ebbc2a723cc7df4e49bf0b33312d115); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginala3e8a56c221b98348f1909cdee600492 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala3e8a56c221b98348f1909cdee600492 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.response-spectrum-functions-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.response-spectrum-functions-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala3e8a56c221b98348f1909cdee600492)): ?>
<?php $attributes = $__attributesOriginala3e8a56c221b98348f1909cdee600492; ?>
<?php unset($__attributesOriginala3e8a56c221b98348f1909cdee600492); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala3e8a56c221b98348f1909cdee600492)): ?>
<?php $component = $__componentOriginala3e8a56c221b98348f1909cdee600492; ?>
<?php unset($__componentOriginala3e8a56c221b98348f1909cdee600492); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginalcd4da399896cf6bbc67a55f15d6cdd6e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcd4da399896cf6bbc67a55f15d6cdd6e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.static-load-cases-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.static-load-cases-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcd4da399896cf6bbc67a55f15d6cdd6e)): ?>
<?php $attributes = $__attributesOriginalcd4da399896cf6bbc67a55f15d6cdd6e; ?>
<?php unset($__attributesOriginalcd4da399896cf6bbc67a55f15d6cdd6e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcd4da399896cf6bbc67a55f15d6cdd6e)): ?>
<?php $component = $__componentOriginalcd4da399896cf6bbc67a55f15d6cdd6e; ?>
<?php unset($__componentOriginalcd4da399896cf6bbc67a55f15d6cdd6e); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginalf13c016975121f6abce7130cc5602db1 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf13c016975121f6abce7130cc5602db1 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.load-combinations-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.load-combinations-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf13c016975121f6abce7130cc5602db1)): ?>
<?php $attributes = $__attributesOriginalf13c016975121f6abce7130cc5602db1; ?>
<?php unset($__attributesOriginalf13c016975121f6abce7130cc5602db1); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf13c016975121f6abce7130cc5602db1)): ?>
<?php $component = $__componentOriginalf13c016975121f6abce7130cc5602db1; ?>
<?php unset($__componentOriginalf13c016975121f6abce7130cc5602db1); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginald494fff3d376581e3775a1a86cb3e5f0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald494fff3d376581e3775a1a86cb3e5f0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.mass-source-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.mass-source-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald494fff3d376581e3775a1a86cb3e5f0)): ?>
<?php $attributes = $__attributesOriginald494fff3d376581e3775a1a86cb3e5f0; ?>
<?php unset($__attributesOriginald494fff3d376581e3775a1a86cb3e5f0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald494fff3d376581e3775a1a86cb3e5f0)): ?>
<?php $component = $__componentOriginald494fff3d376581e3775a1a86cb3e5f0; ?>
<?php unset($__componentOriginald494fff3d376581e3775a1a86cb3e5f0); ?>
<?php endif; ?>
  <!-- Seccion de analisis -->
  <?php if (isset($component)) { $__componentOriginal650f65d17b15431e40a66c2bf88a7041 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal650f65d17b15431e40a66c2bf88a7041 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.analysis-options-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.analysis-options-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal650f65d17b15431e40a66c2bf88a7041)): ?>
<?php $attributes = $__attributesOriginal650f65d17b15431e40a66c2bf88a7041; ?>
<?php unset($__attributesOriginal650f65d17b15431e40a66c2bf88a7041); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal650f65d17b15431e40a66c2bf88a7041)): ?>
<?php $component = $__componentOriginal650f65d17b15431e40a66c2bf88a7041; ?>
<?php unset($__componentOriginal650f65d17b15431e40a66c2bf88a7041); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginal37b9b804acb195ff217fe9d592f3bd54 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal37b9b804acb195ff217fe9d592f3bd54 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.check-model-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.check-model-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal37b9b804acb195ff217fe9d592f3bd54)): ?>
<?php $attributes = $__attributesOriginal37b9b804acb195ff217fe9d592f3bd54; ?>
<?php unset($__attributesOriginal37b9b804acb195ff217fe9d592f3bd54); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal37b9b804acb195ff217fe9d592f3bd54)): ?>
<?php $component = $__componentOriginal37b9b804acb195ff217fe9d592f3bd54; ?>
<?php unset($__componentOriginal37b9b804acb195ff217fe9d592f3bd54); ?>
<?php endif; ?>
  <!-- Seccion del modal de diseño -->
  <?php if (isset($component)) { $__componentOriginal8a63a3bae79e504aa22ad0884444e0be = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8a63a3bae79e504aa22ad0884444e0be = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.select-design-combinations-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.select-design-combinations-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8a63a3bae79e504aa22ad0884444e0be)): ?>
<?php $attributes = $__attributesOriginal8a63a3bae79e504aa22ad0884444e0be; ?>
<?php unset($__attributesOriginal8a63a3bae79e504aa22ad0884444e0be); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8a63a3bae79e504aa22ad0884444e0be)): ?>
<?php $component = $__componentOriginal8a63a3bae79e504aa22ad0884444e0be; ?>
<?php unset($__componentOriginal8a63a3bae79e504aa22ad0884444e0be); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginal59fdc502e9daa528cbc0d02c981988b7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal59fdc502e9daa528cbc0d02c981988b7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.display-design-info-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.display-design-info-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal59fdc502e9daa528cbc0d02c981988b7)): ?>
<?php $attributes = $__attributesOriginal59fdc502e9daa528cbc0d02c981988b7; ?>
<?php unset($__attributesOriginal59fdc502e9daa528cbc0d02c981988b7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal59fdc502e9daa528cbc0d02c981988b7)): ?>
<?php $component = $__componentOriginal59fdc502e9daa528cbc0d02c981988b7; ?>
<?php unset($__componentOriginal59fdc502e9daa528cbc0d02c981988b7); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginal75938744f6f69a5adf28f48f3fc3757a = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal75938744f6f69a5adf28f48f3fc3757a = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.design-overwrites-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.design-overwrites-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal75938744f6f69a5adf28f48f3fc3757a)): ?>
<?php $attributes = $__attributesOriginal75938744f6f69a5adf28f48f3fc3757a; ?>
<?php unset($__attributesOriginal75938744f6f69a5adf28f48f3fc3757a); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal75938744f6f69a5adf28f48f3fc3757a)): ?>
<?php $component = $__componentOriginal75938744f6f69a5adf28f48f3fc3757a; ?>
<?php unset($__componentOriginal75938744f6f69a5adf28f48f3fc3757a); ?>
<?php endif; ?>
</div><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad/layout/toolbar.blade.php ENDPATH**/ ?>