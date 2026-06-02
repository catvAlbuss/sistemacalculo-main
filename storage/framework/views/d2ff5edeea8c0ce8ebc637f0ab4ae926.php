<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">

<head>
  <?php $__env->startSection('head'); ?>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

    <title><?php echo e(config('app.name', 'R&AIE')); ?></title>
    <link rel="icon" type="image/x-icon" href="<?php echo e(asset('img/logo_rizabalAsociados.png')); ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.bunny.net" rel="preconnect">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Styles -->
    <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::styles(); ?>

    <?php echo app('Illuminate\Foundation\Vite')('resources/css/app.css'); ?>
    <?php echo $__env->yieldPushContent('styles'); ?>

    <!-- Scripts -->
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/app_begin.js'); ?>
    <?php echo $__env->yieldPushContent('initscripts'); ?>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/app_end.js'); ?>
  <?php echo $__env->yieldSection(); ?>
</head>

<body class="flex min-h-screen flex-col bg-gray-100 font-sans antialiased dark:bg-gray-900">
  <?php echo $__env->yieldContent('content'); ?>
  <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::scriptConfig(); ?>

  <?php echo $__env->yieldPushContent('scripts'); ?>
</body>

</html><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views/layouts/base.blade.php ENDPATH**/ ?>