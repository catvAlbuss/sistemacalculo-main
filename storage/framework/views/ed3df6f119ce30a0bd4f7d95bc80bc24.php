<?php
  $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
  $secciones = array_map(function ($value) {
      return ['value' => $value];
  }, range(1, 62, 1));
?>

<?php if (! $__env->hasRenderedOnce('ba1b522f-53f2-4053-9467-77754ef3c4e9')): $__env->markAsRenderedOnce('ba1b522f-53f2-4053-9467-77754ef3c4e9');
$__env->startPush('initscripts'); ?>
  <?php echo app('Illuminate\Foundation\Vite')('resources/js/diseno_madera_data.js'); ?>
<?php $__env->stopPush(); endif; ?>

<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => 'Diseño En Madera | Flexotracción']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Diseño En Madera | Flexotracción']); ?>
  <div class="container mx-auto flex flex-row flex-wrap items-start space-x-4 py-12 md:flex-nowrap"
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
      <?php if (isset($component)) { $__componentOriginal88b47716cfb0ed7a9f4eb36669b34ad9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal88b47716cfb0ed7a9f4eb36669b34ad9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-select-calc','data' => ['name' => 'Sección','bind' => 'calcs.flexotraccionSeccion','unit' => '','options' => $secciones]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-select-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Sección','bind' => 'calcs.flexotraccionSeccion','unit' => '','options' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($secciones)]); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['name' => 'Axial','bind' => 'calcs.flexotraccionAxial','unit' => 'kg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Axial','bind' => 'calcs.flexotraccionAxial','unit' => 'kg']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['name' => 'Momento','bind' => 'calcs.flexotraccionMomento','unit' => 'kg-m']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Momento','bind' => 'calcs.flexotraccionMomento','unit' => 'kg-m']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <div class="mt-4 text-center">
        <button x-on:click="calcular()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Axial','bind' => 'calcs.flexotraccionAxial','unit' => 'kg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Axial','bind' => 'calcs.flexotraccionAxial','unit' => 'kg']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Momento','bind' => 'calcs.flexotraccionMomento','unit' => 'kg-m']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Momento','bind' => 'calcs.flexotraccionMomento','unit' => 'kg-m']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Seccion','bind' => 'calcs.flexotraccionSeccion']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Seccion','bind' => 'calcs.flexotraccionSeccion']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'b','bind' => 'calcs.flexotraccionB','unit' => 'pulg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'b','bind' => 'calcs.flexotraccionB','unit' => 'pulg']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'b','bind' => 'calcs.flexotraccionBcm','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'b','bind' => 'calcs.flexotraccionBcm','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'd','bind' => 'calcs.flexotraccionD','unit' => 'pulg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'd','bind' => 'calcs.flexotraccionD','unit' => 'pulg']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'd','bind' => 'calcs.flexotraccionDcm','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'd','bind' => 'calcs.flexotraccionDcm','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'A','bind' => 'calcs.flexotraccionA','unit' => 'cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'A','bind' => 'calcs.flexotraccionA','unit' => 'cm2']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Lx','bind' => 'calcs.flexotraccionLx','unit' => 'cm4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Lx','bind' => 'calcs.flexotraccionLx','unit' => 'cm4']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Zx','bind' => 'calcs.flexotraccionZx','unit' => 'cm3']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Zx','bind' => 'calcs.flexotraccionZx','unit' => 'cm3']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.table-result','data' => ['title' => '2.- Flexotracción']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('table-result'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => '2.- Flexotracción']); ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Factor','symbol' => '< 1','bind' => 'calcs.flexotraccionCambiarSeccion']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Factor','symbol' => '< 1','bind' => 'calcs.flexotraccionCambiarSeccion']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['name' => 'Usar','bind' => 'calcs.flexotraccionUsar','unit' => 'pulg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'Usar','bind' => 'calcs.flexotraccionUsar','unit' => 'pulg']); ?> <?php echo $__env->renderComponent(); ?>
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
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\hcalculo\diseno_en_madera\flexo_traccion.blade.php ENDPATH**/ ?>