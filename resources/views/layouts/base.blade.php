<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
  @section('head')
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'R&AIE') }}</title>
    <link rel="icon" type="image/x-icon" href="{{ Vite::asset('resources/img/logo_rizabalAsociados.png') }}">
    <!-- Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.bunny.net" rel="preconnect">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Styles -->
    @livewireStyles
    @vite('resources/css/app.css')
    @stack('styles')

    <!-- Scripts -->
    @vite('resources/js/app_begin.js')
    @stack('initscripts')
    @vite('resources/js/app_end.js')
  @show
</head>

<body class="flex min-h-screen flex-col bg-gray-100 font-sans antialiased dark:bg-gray-900">
  @yield('content')
  @livewireScriptConfig
  @stack('scripts')
</body>

</html>
