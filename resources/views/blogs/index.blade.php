<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Rizabal Asociados</title>
    <link rel="icon" type="image/x-icon" href="{{ url('/assets/img/logo_rizabalAsociados.png') }}">
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.css" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.js"></script>

</head>

<body class="antialiased bg-gray-100 dark:bg-gray-900">
    <!-- Navbar -->
    <nav class="border-gray-200">
        <div class="container mx-auto flex flex-wrap items-center justify-between">
            <div class="flex items-center justify-center space-x-2">
                 <style>
                    /* Estilo por defecto para el tema claro */
                    .logo {
                        filter: invert(0);
                    }

                    /* Estilo para el tema oscuro */
                    @media (prefers-color-scheme: dark) {
                        .logo {
                            filter: invert(1);
                        }
                    }
                </style>
                <a href="https://ryaie.com/" class="text-white text-lg font-bold py-2">
                    <img class="mx-auto h-10 w-10 logo" src="{{ url('/assets/img/logo_rizabalAsociados.png') }}" alt="author avatar">
                </a>
                <p class="text-gray-950 dark:text-gray-50">Rizabal & Asociados</p>
            </div>
            <button data-collapse-toggle="mobile-menu" type="button"
                class="md:hidden ml-3 text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg inline-flex items-center justify-center"
                aria-controls="mobile-menu-2" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clip-rule="evenodd"></path>
                </svg>
                <svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"></path>
                </svg>
            </button>
            <div class="hidden md:block w-full md:w-auto" id="mobile-menu">
                <ul class="flex-col md:flex-row flex md:space-x-8 mt-4 md:mt-0 md:text-sm md:font-medium">
                    <li>
                        <a href="https://ryaie.com/"
                            class="md:bg-transparent text-gray-950 dark:text-gray-100  dark:hover:text-white block pl-3 pr-4 py-2 md:text-blue-700 md:p-0 rounded focus:outline-none"
                            aria-current="page">Inicio</a>
                    </li>
                    <li>
                        <button id="dropdownNavbarLink" data-dropdown-toggle="dropdownNavbar"
                            class="text-gray-950 dark:text-gray-100  dark:hover:text-white border-b border-gray-100 md:hover:bg-transparent md:border-0 pl-3 pr-4 py-2 md:hover:text-blue-700 md:p-0 font-medium flex items-center justify-between w-full md:w-auto">Servicios
                            <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd"></path>
                            </svg></button>
                        <!-- Dropdown menu -->
                        <div id="dropdownNavbar"
                            class="hidden bg-white text-base z-10 list-none divide-y divide-gray-100 rounded shadow my-4 w-44">
                            <ul class="py-1" aria-labelledby="dropdownLargeButton">
                                <li>
                                    <a href="{{ url('admdesingestruct') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Diseño
                                        Estructural</a>
                                </li>
                                <li>
                                    <a href="{{ url('admdesofes') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Desarrollo de
                                        Software Estructural</a>
                                </li>
                                <li>
                                    <a href="{{ url('admlabplanos') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Elaboración de
                                        planos Estructurales</a>
                                </li>
                            </ul>
                            <div class="py-1">
                                <a href="{{ url('admelabmetra') }}"
                                    class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Elaboración de
                                    Metrados</a>
                            </div>
                        </div>
                    </li>
                    <li>
                        <a href="{{url('admcontactenos')}}" class="text-gray-950 dark:text-gray-100  dark:hover:text-white border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-blue-700 md:p-0">Contactenos</a>
                    </li>
                    <li>
                        <a href="{{ route('blogs.index') }}" class="text-gray-950 dark:text-gray-100 hover:text-gray-700 dark:hover:text-white py-2">
                            Blog
                        </a>
                    </li>
                    <li>
                        <button id="dropdownNavbarLink" data-dropdown-toggle="pruebaGratis"
                            class="bg-blue-500 rounded hover:bg-blue-600 text-gray-950 dark:text-gray-100  dark:hover:text-white border-b border-gray-100 md:hover:bg-transparent md:border-0 pl-3 pr-4 py-2 md:hover:text-blue-700 md:p-0 font-medium flex items-center justify-between w-full md:w-auto">Prueba
                            Gratis <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd"></path>
                            </svg></button>
                        <!-- Dropdown menu -->
                        <div id="pruebaGratis"
                            class="hidden bg-white text-base z-10 list-none divide-y divide-gray-100 rounded shadow my-4 w-44">
                            <ul class="py-1" aria-labelledby="dropdownLargeButton">
                                <li>
                                    <a href="{{ url('admPredim') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 text-center">Predim</a>
                                </li>
                                <li>
                                    <a href="{{ url('admarcotecho') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 text-center">Techo
                                        Arco</a>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="relative flex flex-col items-center justify-center min-h-screen py-2">
        <div class="max-w-7xl mx-auto p-6 lg:p-8">
            <!-- inspired by tailwindcss.com -->
            <ul class="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start p-8">
                @foreach ($blogs as $blog)
                    <li
                        class="relative flex flex-col sm:flex-row xl:flex-col items-start rounded-xl border-2 border-blue-300 hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white dark:bg-gray-800">
                        <div class="order-1 sm:ml-6 xl:ml-0 p-4">
                            <h3 class="mb-2 text-slate-900 dark:text-white font-semibold text-xl">
                                <span
                                    class="block text-indigo-500 dark:text-indigo-400 mb-2 text-sm">{{ $blog->titulo }}</span>
                            </h3>
                            <div class="prose prose-slate prose-sm text-slate-500 dark:text-slate-400 mb-4">
                                <p>{{ $blog->descripcion }}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
                                <div class="text-gray-950 dark:text-white">
                                    <p>{{ $blog->ubicacion }}</p>
                                </div>
                                <div class="text-gray-950 dark:text-white">
                                    <p>{{ \Carbon\Carbon::parse($blog->fecha_publicacion)->timezone('America/Lima')->format('d \d\e F \d\e Y') }}
                                    </p>
                                </div>
                            </div>
                            @if ($blog)
                                <a href="{{ route('blogs.show', $blog) }}"
                                    class="group inline-flex items-center mt-4 h-9 rounded-full text-sm font-semibold whitespace-nowrap px-6 py-2 focus:outline-none focus:ring-2 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-indigo-100 focus:ring-indigo-500 transition duration-300">
                                    Ver más
                                    <span class="sr-only">, {{ $blog->titulo }}</span>
                                    <svg class="overflow-visible ml-3 text-white group-hover:text-indigo-200"
                                        width="3" height="6" viewBox="0 0 3 6" fill="none"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M0 0L3 3L0 6"></path>
                                    </svg>
                                </a>
                            @else
                                <p>Error: Blog not found.</p>
                            @endif
                        </div>
                        <img src="{{ url('/assets/img/blog/' . $blog->imagenref) }}" alt="{{ $blog->titulo }} "
                            class="mb-4 sm:mb-0 shadow-lg rounded-xl bg-slate-50 dark:bg-slate-700 w-full sm:w-[17rem] xl:w-full xl:mb-6"
                            width="1216" height="640">
                    </li>
                @endforeach
            </ul>
        </div>
    </div <script src="https://unpkg.com/@themesberg/flowbite@1.1.1/dist/flowbite.bundle.js"></script>
</body>

</html>
