<?php if (! $__env->hasRenderedOnce('9df07e17-7460-411b-9acb-b8ee5a2aa182')): $__env->markAsRenderedOnce('9df07e17-7460-411b-9acb-b8ee5a2aa182');
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