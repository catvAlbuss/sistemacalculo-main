<?php
    $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
    $secciones = array_map(function ($value) {
        return ['value' => $value];
    }, range(1, 62, 1));
?>

<?php if (! $__env->hasRenderedOnce('77d1bb36-1208-4543-9cb5-0ba8466b2e01')): $__env->markAsRenderedOnce('77d1bb36-1208-4543-9cb5-0ba8466b2e01');
$__env->startPush('initscripts'); ?>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/diseno_madera_data.js'); ?>
<?php $__env->stopPush(); endif; ?>

<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => 'Diseño En Madera | Flexocompresion']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Diseño En Madera | Flexocompresion']); ?>
    <div class="container mx-auto flex flex-row flex-wrap items-start space-x-2 py-2 md:flex-nowrap"
        x-data="diseño_madera">
        <?php if (isset($component)) { $__componentOriginal972b1b5c97475366ed0a22d1c711afd2 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal972b1b5c97475366ed0a22d1c711afd2 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-data','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-data'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
            <div class="mb-4 w-full">
                <?php if (isset($component)) { $__componentOriginal88b47716cfb0ed7a9f4eb36669b34ad9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal88b47716cfb0ed7a9f4eb36669b34ad9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-select-calc','data' => ['name' => 'Grupo','bind' => 'calcs.grupo','unit' => 'Kg/cm2','options' => $grupos]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-select-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Grupo','bind' => 'calcs.grupo','unit' => 'Kg/cm2','options' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($grupos)]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal88b47716cfb0ed7a9f4eb36669b34ad9)): ?>
<?php $attributes = $__attributesOriginal88b47716cfb0ed7a9f4eb36669b34ad9; ?>
<?php unset($__attributesOriginal88b47716cfb0ed7a9f4eb36669b34ad9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal88b47716cfb0ed7a9f4eb36669b34ad9)): ?>
<?php $component = $__componentOriginal88b47716cfb0ed7a9f4eb36669b34ad9; ?>
<?php unset($__componentOriginal88b47716cfb0ed7a9f4eb36669b34ad9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['name' => 'Longitud efectiva','symbol' => 'lef','bind' => 'calcs.diseñoLef','unit' => 'm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Longitud efectiva','symbol' => 'lef','bind' => 'calcs.diseñoLef','unit' => 'm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['name' => 'Axial','bind' => 'calcs.flexocompresionAxial','unit' => 'kg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Axial','bind' => 'calcs.flexocompresionAxial','unit' => 'kg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['name' => 'Momento','bind' => 'calcs.flexocompresionMomento','unit' => 'kg-m']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Momento','bind' => 'calcs.flexocompresionMomento','unit' => 'kg-m']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal88b47716cfb0ed7a9f4eb36669b34ad9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal88b47716cfb0ed7a9f4eb36669b34ad9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-select-calc','data' => ['name' => 'Sección','bind' => 'calcs.flexocompresionSeccion','unit' => 'cm3','options' => $secciones]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-select-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Sección','bind' => 'calcs.flexocompresionSeccion','unit' => 'cm3','options' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($secciones)]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal88b47716cfb0ed7a9f4eb36669b34ad9)): ?>
<?php $attributes = $__attributesOriginal88b47716cfb0ed7a9f4eb36669b34ad9; ?>
<?php unset($__attributesOriginal88b47716cfb0ed7a9f4eb36669b34ad9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal88b47716cfb0ed7a9f4eb36669b34ad9)): ?>
<?php $component = $__componentOriginal88b47716cfb0ed7a9f4eb36669b34ad9; ?>
<?php unset($__componentOriginal88b47716cfb0ed7a9f4eb36669b34ad9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['symbol' => 'A','bind' => 'calcs.flexocompresionA','unit' => 'cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'A','bind' => 'calcs.flexocompresionA','unit' => 'cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['symbol' => 'Lx','bind' => 'calcs.flexocompresionLx','unit' => 'cm4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Lx','bind' => 'calcs.flexocompresionLx','unit' => 'cm4']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['symbol' => 'Zx','bind' => 'calcs.flexocompresionZx','unit' => 'cm3']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Zx','bind' => 'calcs.flexocompresionZx','unit' => 'cm3']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
            </div>
            <div class="mb-4 w-full">
                <button type="button" @click="calcular()"
                    class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Calcular
                </button>
            </div>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal972b1b5c97475366ed0a22d1c711afd2)): ?>
<?php $attributes = $__attributesOriginal972b1b5c97475366ed0a22d1c711afd2; ?>
<?php unset($__attributesOriginal972b1b5c97475366ed0a22d1c711afd2); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal972b1b5c97475366ed0a22d1c711afd2)): ?>
<?php $component = $__componentOriginal972b1b5c97475366ed0a22d1c711afd2; ?>
<?php unset($__componentOriginal972b1b5c97475366ed0a22d1c711afd2); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-data','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-data'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
            <?php if (isset($component)) { $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.table-result','data' => ['title' => '1.- Prerequisitos del Diseño']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('table-result'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => '1.- Prerequisitos del Diseño']); ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Grupo','bind' => 'calcs.grupo']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Grupo','bind' => 'calcs.grupo']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Modulo de elasticidad minimo','symbol' => 'Emin','bind' => 'calcs.diseñoEmin','unit' => 'Kg/cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Modulo de elasticidad minimo','symbol' => 'Emin','bind' => 'calcs.diseñoEmin','unit' => 'Kg/cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Esfuerzo admisible a la flexión','symbol' => 'Fm','bind' => 'calcs.diseñoFm','unit' => 'Kg/cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Esfuerzo admisible a la flexión','symbol' => 'Fm','bind' => 'calcs.diseñoFm','unit' => 'Kg/cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Esfuerzo admisible ala compresion paralela','symbol' => 'Fc','bind' => 'calcs.diseñoFc','unit' => 'Kg/cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Esfuerzo admisible ala compresion paralela','symbol' => 'Fc','bind' => 'calcs.diseñoFc','unit' => 'Kg/cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Esfuerzo admisible a la Traccion paralela','symbol' => 'Ft','bind' => 'calcs.diseñoFt','unit' => 'Kg/cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Esfuerzo admisible a la Traccion paralela','symbol' => 'Ft','bind' => 'calcs.diseñoFt','unit' => 'Kg/cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Esfuerzo admisible al corte parealela','symbol' => 'Fv','bind' => 'calcs.diseñoFv','unit' => 'Kg/cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Esfuerzo admisible al corte parealela','symbol' => 'Fv','bind' => 'calcs.diseñoFv','unit' => 'Kg/cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Longitud efectiva','symbol' => 'lef','bind' => 'calcs.diseñoLef','unit' => 'm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Longitud efectiva','symbol' => 'lef','bind' => 'calcs.diseñoLef','unit' => 'm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Axial','bind' => 'calcs.flexocompresionAxial','unit' => 'kg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Axial','bind' => 'calcs.flexocompresionAxial','unit' => 'kg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Momento','bind' => 'calcs.flexocompresionMomento','unit' => 'kg-m']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Momento','bind' => 'calcs.flexocompresionMomento','unit' => 'kg-m']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Seccion','bind' => 'calcs.flexocompresionSeccion']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Seccion','bind' => 'calcs.flexocompresionSeccion']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'A','bind' => 'calcs.flexocompresionA','unit' => 'cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'A','bind' => 'calcs.flexocompresionA','unit' => 'cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'Lx','bind' => 'calcs.flexocompresionLx','unit' => 'cm4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Lx','bind' => 'calcs.flexocompresionLx','unit' => 'cm4']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'Zx','bind' => 'calcs.flexocompresionZx','unit' => 'cm3']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Zx','bind' => 'calcs.flexocompresionZx','unit' => 'cm3']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $attributes = $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $component = $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
            <?php if (isset($component)) { $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.table-result','data' => ['title' => '2.- Flexocompresion']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('table-result'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => '2.- Flexocompresion']); ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'b','bind' => 'calcs.flexocompresionB','unit' => 'pulg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'b','bind' => 'calcs.flexocompresionB','unit' => 'pulg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'b','bind' => 'calcs.flexocompresionBcm','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'b','bind' => 'calcs.flexocompresionBcm','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'd','bind' => 'calcs.flexocompresionD','unit' => 'pulg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'd','bind' => 'calcs.flexocompresionD','unit' => 'pulg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'd','bind' => 'calcs.flexocompresionDcm','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'd','bind' => 'calcs.flexocompresionDcm','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'A','bind' => 'calcs.flexocompresionA','unit' => 'cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'A','bind' => 'calcs.flexocompresionA','unit' => 'cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'Ix','bind' => 'calcs.flexocompresionLx','unit' => 'cm4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Ix','bind' => 'calcs.flexocompresionLx','unit' => 'cm4']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'Zx','bind' => 'calcs.flexocompresionZx','unit' => 'cm3']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Zx','bind' => 'calcs.flexocompresionZx','unit' => 'cm3']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Esbeltez','formula' => '$$\lambda_x = \frac{l_{\text{ef}}}{d}$$','bind' => 'calcs.flexocompresionEsbeltez']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Esbeltez','formula' => '$$\lambda_x = \frac{l_{\text{ef}}}{d}$$','bind' => 'calcs.flexocompresionEsbeltez']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Esbeltez','bind' => 'calcs.flexocompresionColumnaTipo']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Esbeltez','bind' => 'calcs.flexocompresionColumnaTipo']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'Ck','bind' => 'calcs.flexocompresionCk']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Ck','bind' => 'calcs.flexocompresionCk']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Columnas cortas','formula' => '$$N_{\text{adm}} = f_c \cdot A$$','symbol' => 'λ < 10','bind' => 'calcs.flexocompresionColumnasCortas']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Columnas cortas','formula' => '$$N_{\text{adm}} = f_c \cdot A$$','symbol' => 'λ < 10','bind' => 'calcs.flexocompresionColumnasCortas']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Columnas intermedias','formula' => '$$N_{\text{adm}} = f_c \cdot A \cdot \left[ 1 - \frac{1}{3}\left(\frac{\lambda}{C_k}\right)^4 \right]$$','symbol' => '10< λ <Ck','bind' => 'calcs.flexocompresionColumnasIntermedias']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Columnas intermedias','formula' => '$$N_{\text{adm}} = f_c \cdot A \cdot \left[ 1 - \frac{1}{3}\left(\frac{\lambda}{C_k}\right)^4 \right]$$','symbol' => '10< λ <Ck','bind' => 'calcs.flexocompresionColumnasIntermedias']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Columnas largas','formula' => '$$N_{\text{adm}} = 0.329 \frac{E \cdot A}{\lambda^2}$$','symbol' => 'Ck< λ <50','bind' => 'calcs.flexocompresionColumnasLargas']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Columnas largas','formula' => '$$N_{\text{adm}} = 0.329 \frac{E \cdot A}{\lambda^2}$$','symbol' => 'Ck< λ <50','bind' => 'calcs.flexocompresionColumnasLargas']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Nadm','bind' => 'calcs.flexocompresionNadm','unit' => 'kg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Nadm','bind' => 'calcs.flexocompresionNadm','unit' => 'kg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['bind' => 'calcs.flexocompresionOk']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.flexocompresionOk']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Carga crítica de Euler para pandeo en la dirección en que se aplican los momentos de flexión','formula' => '$$N_{\text{cr}} = \frac{\pi^2 E I}{l_{\text{ef}}^2}$$','bind' => 'calcs.flexocompresionNer']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Carga crítica de Euler para pandeo en la dirección en que se aplican los momentos de flexión','formula' => '$$N_{\text{cr}} = \frac{\pi^2 E I}{l_{\text{ef}}^2}$$','bind' => 'calcs.flexocompresionNer']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Cuando existen flexión y compresión combinadas, los momentos flectores se amplifican por acción de cargas axiales','formula' => '$$k_m = \frac{1}{1 - 1.5 \frac{N}{N_{\text{cr}}}}$$','bind' => 'calcs.flexocompresionKm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Cuando existen flexión y compresión combinadas, los momentos flectores se amplifican por acción de cargas axiales','formula' => '$$k_m = \frac{1}{1 - 1.5 \frac{N}{N_{\text{cr}}}}$$','bind' => 'calcs.flexocompresionKm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Entonces se Tiene','formula' => '$$\frac{N}{N_{\text{adm}}} + \frac{k_m M}{Z f_m}$$','bind' => 'calcs.flexocompresionEntonces','unit' => 'ok']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Entonces se Tiene','formula' => '$$\frac{N}{N_{\text{adm}}} + \frac{k_m M}{Z f_m}$$','bind' => 'calcs.flexocompresionEntonces','unit' => 'ok']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'El espaciamiento entre correas, para garantizar una esbeltez fuera del plano de la cuerda (λy) igual o menor a la del plano (λx), será igual a:','formula' => '$$l_c = \lambda_x\, b$$','symbol' => 'lc','bind' => 'calcs.flexocompresionLc','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'El espaciamiento entre correas, para garantizar una esbeltez fuera del plano de la cuerda (λy) igual o menor a la del plano (λx), será igual a:','formula' => '$$l_c = \lambda_x\, b$$','symbol' => 'lc','bind' => 'calcs.flexocompresionLc','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Usar','bind' => 'calcs.flexocompresionUsar','unit' => 'pulg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Usar','bind' => 'calcs.flexocompresionUsar','unit' => 'pulg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $attributes = $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $component = $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5)): ?>
<?php $attributes = $__attributesOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5; ?>
<?php unset($__attributesOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5)): ?>
<?php $component = $__componentOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5; ?>
<?php unset($__componentOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5); ?>
<?php endif; ?>
    </div>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald56ab98830c2b53982542500711782ee)): ?>
<?php $attributes = $__attributesOriginald56ab98830c2b53982542500711782ee; ?>
<?php unset($__attributesOriginald56ab98830c2b53982542500711782ee); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald56ab98830c2b53982542500711782ee)): ?>
<?php $component = $__componentOriginald56ab98830c2b53982542500711782ee; ?>
<?php unset($__componentOriginald56ab98830c2b53982542500711782ee); ?>
<?php endif; ?>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\hcalculo\diseno_en_madera\flexo_compresion.blade.php ENDPATH**/ ?>