<?php if (! $__env->hasRenderedOnce('fc403b91-f9ec-4a85-9cbe-bdeeb73882e0')): $__env->markAsRenderedOnce('fc403b91-f9ec-4a85-9cbe-bdeeb73882e0');
$__env->startPush('initscripts'); ?>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/analisis_estructural_de_armaduras.js'); ?>
<?php $__env->stopPush(); endif; ?>

<div class="cad-text-color cad-bg cad-border flex h-screen flex-col" x-id="['materiales']" x-data="cadSys"
    x-init="initSys($refs.cad, $refs.distanceInput, $id('materiales'));
    $el.scrollIntoView({ behavior: 'smooth' })">
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
    <?php if (isset($component)) { $__componentOriginal4b5e379039aff0e55fb4fe086f6ec50b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal4b5e379039aff0e55fb4fe086f6ec50b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.my-models-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.my-models-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal4b5e379039aff0e55fb4fe086f6ec50b)): ?>
<?php $attributes = $__attributesOriginal4b5e379039aff0e55fb4fe086f6ec50b; ?>
<?php unset($__attributesOriginal4b5e379039aff0e55fb4fe086f6ec50b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal4b5e379039aff0e55fb4fe086f6ec50b)): ?>
<?php $component = $__componentOriginal4b5e379039aff0e55fb4fe086f6ec50b; ?>
<?php unset($__componentOriginal4b5e379039aff0e55fb4fe086f6ec50b); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal80e5b1f5808c649cc167e93e37c59ecf = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal80e5b1f5808c649cc167e93e37c59ecf = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.joint-restraints-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.joint-restraints-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal80e5b1f5808c649cc167e93e37c59ecf)): ?>
<?php $attributes = $__attributesOriginal80e5b1f5808c649cc167e93e37c59ecf; ?>
<?php unset($__attributesOriginal80e5b1f5808c649cc167e93e37c59ecf); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal80e5b1f5808c649cc167e93e37c59ecf)): ?>
<?php $component = $__componentOriginal80e5b1f5808c649cc167e93e37c59ecf; ?>
<?php unset($__componentOriginal80e5b1f5808c649cc167e93e37c59ecf); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal425dc49a41cbd04bd79c254cdab172f9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal425dc49a41cbd04bd79c254cdab172f9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.joint-diaphragms-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.joint-diaphragms-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal425dc49a41cbd04bd79c254cdab172f9)): ?>
<?php $attributes = $__attributesOriginal425dc49a41cbd04bd79c254cdab172f9; ?>
<?php unset($__attributesOriginal425dc49a41cbd04bd79c254cdab172f9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal425dc49a41cbd04bd79c254cdab172f9)): ?>
<?php $component = $__componentOriginal425dc49a41cbd04bd79c254cdab172f9; ?>
<?php unset($__componentOriginal425dc49a41cbd04bd79c254cdab172f9); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal8dd854aabf51930597a59c5ef9041c13 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8dd854aabf51930597a59c5ef9041c13 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.shell-diaphragms-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.shell-diaphragms-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8dd854aabf51930597a59c5ef9041c13)): ?>
<?php $attributes = $__attributesOriginal8dd854aabf51930597a59c5ef9041c13; ?>
<?php unset($__attributesOriginal8dd854aabf51930597a59c5ef9041c13); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8dd854aabf51930597a59c5ef9041c13)): ?>
<?php $component = $__componentOriginal8dd854aabf51930597a59c5ef9041c13; ?>
<?php unset($__componentOriginal8dd854aabf51930597a59c5ef9041c13); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginaleffbe6d417bf7d67c0072b0b27f274ae = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginaleffbe6d417bf7d67c0072b0b27f274ae = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.frame-local-axes-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.frame-local-axes-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginaleffbe6d417bf7d67c0072b0b27f274ae)): ?>
<?php $attributes = $__attributesOriginaleffbe6d417bf7d67c0072b0b27f274ae; ?>
<?php unset($__attributesOriginaleffbe6d417bf7d67c0072b0b27f274ae); ?>
<?php endif; ?>
<?php if (isset($__componentOriginaleffbe6d417bf7d67c0072b0b27f274ae)): ?>
<?php $component = $__componentOriginaleffbe6d417bf7d67c0072b0b27f274ae; ?>
<?php unset($__componentOriginaleffbe6d417bf7d67c0072b0b27f274ae); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal164f8521d0f689b84a5c7ce69da91cd4 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal164f8521d0f689b84a5c7ce69da91cd4 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.joint-force-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.joint-force-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal164f8521d0f689b84a5c7ce69da91cd4)): ?>
<?php $attributes = $__attributesOriginal164f8521d0f689b84a5c7ce69da91cd4; ?>
<?php unset($__attributesOriginal164f8521d0f689b84a5c7ce69da91cd4); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal164f8521d0f689b84a5c7ce69da91cd4)): ?>
<?php $component = $__componentOriginal164f8521d0f689b84a5c7ce69da91cd4; ?>
<?php unset($__componentOriginal164f8521d0f689b84a5c7ce69da91cd4); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginalce116cd4c621932c920cff6b3bc069b7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalce116cd4c621932c920cff6b3bc069b7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.frame-point-load-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.frame-point-load-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalce116cd4c621932c920cff6b3bc069b7)): ?>
<?php $attributes = $__attributesOriginalce116cd4c621932c920cff6b3bc069b7; ?>
<?php unset($__attributesOriginalce116cd4c621932c920cff6b3bc069b7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalce116cd4c621932c920cff6b3bc069b7)): ?>
<?php $component = $__componentOriginalce116cd4c621932c920cff6b3bc069b7; ?>
<?php unset($__componentOriginalce116cd4c621932c920cff6b3bc069b7); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginalfcd8d459ab88c57b9a7e801b182d513d = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfcd8d459ab88c57b9a7e801b182d513d = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.frame-distributed-load-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.frame-distributed-load-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfcd8d459ab88c57b9a7e801b182d513d)): ?>
<?php $attributes = $__attributesOriginalfcd8d459ab88c57b9a7e801b182d513d; ?>
<?php unset($__attributesOriginalfcd8d459ab88c57b9a7e801b182d513d); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfcd8d459ab88c57b9a7e801b182d513d)): ?>
<?php $component = $__componentOriginalfcd8d459ab88c57b9a7e801b182d513d; ?>
<?php unset($__componentOriginalfcd8d459ab88c57b9a7e801b182d513d); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal148cf21bf41dfce5eafb6db4cac357c2 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal148cf21bf41dfce5eafb6db4cac357c2 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.frame-section-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.frame-section-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal148cf21bf41dfce5eafb6db4cac357c2)): ?>
<?php $attributes = $__attributesOriginal148cf21bf41dfce5eafb6db4cac357c2; ?>
<?php unset($__attributesOriginal148cf21bf41dfce5eafb6db4cac357c2); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal148cf21bf41dfce5eafb6db4cac357c2)): ?>
<?php $component = $__componentOriginal148cf21bf41dfce5eafb6db4cac357c2; ?>
<?php unset($__componentOriginal148cf21bf41dfce5eafb6db4cac357c2); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal9636c419182beb9ecb979d1af6b2906c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9636c419182beb9ecb979d1af6b2906c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.slab-section-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.slab-section-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9636c419182beb9ecb979d1af6b2906c)): ?>
<?php $attributes = $__attributesOriginal9636c419182beb9ecb979d1af6b2906c; ?>
<?php unset($__attributesOriginal9636c419182beb9ecb979d1af6b2906c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9636c419182beb9ecb979d1af6b2906c)): ?>
<?php $component = $__componentOriginal9636c419182beb9ecb979d1af6b2906c; ?>
<?php unset($__componentOriginal9636c419182beb9ecb979d1af6b2906c); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal1c754ebf1dcda921004e6c1a24ce8bfa = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1c754ebf1dcda921004e6c1a24ce8bfa = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.area-uniform-load-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.area-uniform-load-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1c754ebf1dcda921004e6c1a24ce8bfa)): ?>
<?php $attributes = $__attributesOriginal1c754ebf1dcda921004e6c1a24ce8bfa; ?>
<?php unset($__attributesOriginal1c754ebf1dcda921004e6c1a24ce8bfa); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1c754ebf1dcda921004e6c1a24ce8bfa)): ?>
<?php $component = $__componentOriginal1c754ebf1dcda921004e6c1a24ce8bfa; ?>
<?php unset($__componentOriginal1c754ebf1dcda921004e6c1a24ce8bfa); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal18ae8e4d6abaf64b198a941180f2d135 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal18ae8e4d6abaf64b198a941180f2d135 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.frame-releases-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.frame-releases-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal18ae8e4d6abaf64b198a941180f2d135)): ?>
<?php $attributes = $__attributesOriginal18ae8e4d6abaf64b198a941180f2d135; ?>
<?php unset($__attributesOriginal18ae8e4d6abaf64b198a941180f2d135); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal18ae8e4d6abaf64b198a941180f2d135)): ?>
<?php $component = $__componentOriginal18ae8e4d6abaf64b198a941180f2d135; ?>
<?php unset($__componentOriginal18ae8e4d6abaf64b198a941180f2d135); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginald343fad3f5497283f8b86e0cdb24e3ea = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald343fad3f5497283f8b86e0cdb24e3ea = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.frame-end-offsets-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.frame-end-offsets-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald343fad3f5497283f8b86e0cdb24e3ea)): ?>
<?php $attributes = $__attributesOriginald343fad3f5497283f8b86e0cdb24e3ea; ?>
<?php unset($__attributesOriginald343fad3f5497283f8b86e0cdb24e3ea); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald343fad3f5497283f8b86e0cdb24e3ea)): ?>
<?php $component = $__componentOriginald343fad3f5497283f8b86e0cdb24e3ea; ?>
<?php unset($__componentOriginald343fad3f5497283f8b86e0cdb24e3ea); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal83317544aca1cf157ee997f26eaace01 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal83317544aca1cf157ee997f26eaace01 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.joint-mass-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.joint-mass-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal83317544aca1cf157ee997f26eaace01)): ?>
<?php $attributes = $__attributesOriginal83317544aca1cf157ee997f26eaace01; ?>
<?php unset($__attributesOriginal83317544aca1cf157ee997f26eaace01); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal83317544aca1cf157ee997f26eaace01)): ?>
<?php $component = $__componentOriginal83317544aca1cf157ee997f26eaace01; ?>
<?php unset($__componentOriginal83317544aca1cf157ee997f26eaace01); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginala2ef3e9e4d5b9cedcd384157135beb2f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala2ef3e9e4d5b9cedcd384157135beb2f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.group-names-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.group-names-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala2ef3e9e4d5b9cedcd384157135beb2f)): ?>
<?php $attributes = $__attributesOriginala2ef3e9e4d5b9cedcd384157135beb2f; ?>
<?php unset($__attributesOriginala2ef3e9e4d5b9cedcd384157135beb2f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala2ef3e9e4d5b9cedcd384157135beb2f)): ?>
<?php $component = $__componentOriginala2ef3e9e4d5b9cedcd384157135beb2f; ?>
<?php unset($__componentOriginala2ef3e9e4d5b9cedcd384157135beb2f); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginalf15ae427511bdd2f0af8d808515e799f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf15ae427511bdd2f0af8d808515e799f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.point-springs-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.point-springs-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf15ae427511bdd2f0af8d808515e799f)): ?>
<?php $attributes = $__attributesOriginalf15ae427511bdd2f0af8d808515e799f; ?>
<?php unset($__attributesOriginalf15ae427511bdd2f0af8d808515e799f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf15ae427511bdd2f0af8d808515e799f)): ?>
<?php $component = $__componentOriginalf15ae427511bdd2f0af8d808515e799f; ?>
<?php unset($__componentOriginalf15ae427511bdd2f0af8d808515e799f); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal04643c527de12a20ce78ecb3ec167cd6 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal04643c527de12a20ce78ecb3ec167cd6 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.import-plan-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.import-plan-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal04643c527de12a20ce78ecb3ec167cd6)): ?>
<?php $attributes = $__attributesOriginal04643c527de12a20ce78ecb3ec167cd6; ?>
<?php unset($__attributesOriginal04643c527de12a20ce78ecb3ec167cd6); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal04643c527de12a20ce78ecb3ec167cd6)): ?>
<?php $component = $__componentOriginal04643c527de12a20ce78ecb3ec167cd6; ?>
<?php unset($__componentOriginal04643c527de12a20ce78ecb3ec167cd6); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal90dd22fcdd4395a70ddc7013687049dc = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal90dd22fcdd4395a70ddc7013687049dc = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.generate-stories-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.generate-stories-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal90dd22fcdd4395a70ddc7013687049dc)): ?>
<?php $attributes = $__attributesOriginal90dd22fcdd4395a70ddc7013687049dc; ?>
<?php unset($__attributesOriginal90dd22fcdd4395a70ddc7013687049dc); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal90dd22fcdd4395a70ddc7013687049dc)): ?>
<?php $component = $__componentOriginal90dd22fcdd4395a70ddc7013687049dc; ?>
<?php unset($__componentOriginal90dd22fcdd4395a70ddc7013687049dc); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginalb0eff727dd9f4217ea5fbb0553b4ea9d = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb0eff727dd9f4217ea5fbb0553b4ea9d = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.zapata-results-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.zapata-results-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalb0eff727dd9f4217ea5fbb0553b4ea9d)): ?>
<?php $attributes = $__attributesOriginalb0eff727dd9f4217ea5fbb0553b4ea9d; ?>
<?php unset($__attributesOriginalb0eff727dd9f4217ea5fbb0553b4ea9d); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb0eff727dd9f4217ea5fbb0553b4ea9d)): ?>
<?php $component = $__componentOriginalb0eff727dd9f4217ea5fbb0553b4ea9d; ?>
<?php unset($__componentOriginalb0eff727dd9f4217ea5fbb0553b4ea9d); ?>
<?php endif; ?>
    <!-- Se Agrego el modal de grid -->
    <?php if (isset($component)) { $__componentOriginal10074ea6e2498d0a9fd9f1711561b84c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal10074ea6e2498d0a9fd9f1711561b84c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.diagonal-grid-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.diagonal-grid-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal10074ea6e2498d0a9fd9f1711561b84c)): ?>
<?php $attributes = $__attributesOriginal10074ea6e2498d0a9fd9f1711561b84c; ?>
<?php unset($__attributesOriginal10074ea6e2498d0a9fd9f1711561b84c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal10074ea6e2498d0a9fd9f1711561b84c)): ?>
<?php $component = $__componentOriginal10074ea6e2498d0a9fd9f1711561b84c; ?>
<?php unset($__componentOriginal10074ea6e2498d0a9fd9f1711561b84c); ?>
<?php endif; ?>
    <input id="_token" name="_token" type="hidden" value="<?php echo e(csrf_token()); ?>" />
    <?php if (isset($component)) { $__componentOriginal10c612dbc9002e5c5da245d736999e0e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal10c612dbc9002e5c5da245d736999e0e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.layout.toolbar','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.layout.toolbar'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal10c612dbc9002e5c5da245d736999e0e)): ?>
<?php $attributes = $__attributesOriginal10c612dbc9002e5c5da245d736999e0e; ?>
<?php unset($__attributesOriginal10c612dbc9002e5c5da245d736999e0e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal10c612dbc9002e5c5da245d736999e0e)): ?>
<?php $component = $__componentOriginal10c612dbc9002e5c5da245d736999e0e; ?>
<?php unset($__componentOriginal10c612dbc9002e5c5da245d736999e0e); ?>
<?php endif; ?>
    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
        <?php if (isset($component)) { $__componentOriginal8b721c7d5b9e3bf301c7efc954957aeb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8b721c7d5b9e3bf301c7efc954957aeb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.layout.side-panel','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.layout.side-panel'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8b721c7d5b9e3bf301c7efc954957aeb)): ?>
<?php $attributes = $__attributesOriginal8b721c7d5b9e3bf301c7efc954957aeb; ?>
<?php unset($__attributesOriginal8b721c7d5b9e3bf301c7efc954957aeb); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8b721c7d5b9e3bf301c7efc954957aeb)): ?>
<?php $component = $__componentOriginal8b721c7d5b9e3bf301c7efc954957aeb; ?>
<?php unset($__componentOriginal8b721c7d5b9e3bf301c7efc954957aeb); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal5060f46e4b59f3bd1852544f0856ca84 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5060f46e4b59f3bd1852544f0856ca84 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.layout.cad-area','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.layout.cad-area'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5060f46e4b59f3bd1852544f0856ca84)): ?>
<?php $attributes = $__attributesOriginal5060f46e4b59f3bd1852544f0856ca84; ?>
<?php unset($__attributesOriginal5060f46e4b59f3bd1852544f0856ca84); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5060f46e4b59f3bd1852544f0856ca84)): ?>
<?php $component = $__componentOriginal5060f46e4b59f3bd1852544f0856ca84; ?>
<?php unset($__componentOriginal5060f46e4b59f3bd1852544f0856ca84); ?>
<?php endif; ?>
    </div>
    <?php if (isset($component)) { $__componentOriginal8da35c20e1083c8a7b2ffec1b3e3166a = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8da35c20e1083c8a7b2ffec1b3e3166a = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.layout.footer','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.layout.footer'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8da35c20e1083c8a7b2ffec1b3e3166a)): ?>
<?php $attributes = $__attributesOriginal8da35c20e1083c8a7b2ffec1b3e3166a; ?>
<?php unset($__attributesOriginal8da35c20e1083c8a7b2ffec1b3e3166a); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8da35c20e1083c8a7b2ffec1b3e3166a)): ?>
<?php $component = $__componentOriginal8da35c20e1083c8a7b2ffec1b3e3166a; ?>
<?php unset($__componentOriginal8da35c20e1083c8a7b2ffec1b3e3166a); ?>
<?php endif; ?>
</div><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad-sys.blade.php ENDPATH**/ ?>