<?php

use App\Livewire\Actions\Logout;

$logout = function (Logout $logout) {
    $logout();

    $this->redirect('/', navigate: true);
};

?>

@pushOnce('initscripts')
    @vite('resources/js/navigation.js')
@endPushOnce

@pushOnce('scripts')
    <script type="text/javascript" src="https://www.geogebra.org/apps/deployggb.js"></script>
@endpushOnce

<nav class="engineering-app-nav z-50 border-b" aria-label="Navegación interna" x-data="scientific_calculator_applet"
    x-init="initComponent($refs.calculator_dialog, $refs.applet_container)">
    <!-- Primary Navigation Menu -->
    <div class="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div class="app-nav-bar flex justify-between">
            <div class="app-nav-primary flex">
                <!-- Logo -->
                <div class="flex shrink-0 items-center">
                    <a href="{{ route('dashboard') }}" {{-- wire:navigate --}}>
                        <x-application-logo
                            class="flex h-9 w-auto flex-row gap-2 fill-current text-gray-800 dark:text-gray-200" />
                    </a>
                </div>

                <!-- Navigation Links -->
                <div class="hidden app-nav-category xl:flex">
                    <x-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')" {{-- wire:navigate --}}>
                        {{ __('Inicio') }}
                    </x-nav-link>
                </div>
                @php
                    $user = auth()->user();
                    $memoryRoutes = [
                        'calculadora.asistente.memoria-calculo',
                        'calculadora.asistente.memoria-descriptiva*',
                    ];
                    $reviewerRoutes = [
                        'software.anclaje-v1',
                        'software.base-dinamica-v1',
                        'software.estribo-columna-placa-v1',
                        'software.estribo-placa-v1',
                        'software.predim-viga-v1',
                        'software.verificacion-viga-v1',
                        'calculadora.estudiante.cav2.hoja2',
                    ];
                    $designerRoutes = [
                        'software.suelos.*',
                        'software.aligerados-v1',
                        'software.aligerados-v2',
                        'software.cimentacion-v1',
                        'software.cimentacion-v2',
                        'software.analisis-estructural-de-armaduras',
                        'software.etabs2',
                        'software.predimv2',
                        'calculadora.estudiante.arco_techo',
                    ];
                    $isMemoryActive = request()->routeIs($memoryRoutes);
                    $isReviewerActive = request()->routeIs($reviewerRoutes);
                    $isDesignerActive = request()->routeIs($designerRoutes);
                    $isStudentActive = request()->routeIs('calculadora.estudiante.*')
                        && !request()->routeIs(['calculadora.estudiante.arco_techo', 'calculadora.estudiante.cav2.hoja2']);
                    $isAssistantActive = request()->routeIs('calculadora.asistente.*') && ! $isMemoryActive;
                    $canManagePlans = $user?->hasRole(['root', 'gerencia']) ?? false;
                @endphp

                @if ($canManagePlans)
                    <div class="hidden app-nav-category xl:flex">
                        <x-dropdown-nav-item name="{{ __('Administración') }}" :active="request()->routeIs(['administration.index', 'planUser.*', 'suscripciones.*', 'payments.admin.*', 'complaints.admin.*'])">
                            <x-nav-link :href="route('administration.index')" :active="request()->routeIs('administration.index')">
                                {{ __('Resumen administrativo') }}
                            </x-nav-link>
                            <x-nav-link :href="route('planUser.index')" :active="request()->routeIs('planUser.index')">
                                {{ __('Gestion de Usuario') }}
                            </x-nav-link>
                            <x-nav-link :href="route('suscripciones.index')" :active="request()->routeIs('suscripciones.index')">
                                {{ __('Gestion de planes') }}
                            </x-nav-link>
<x-dropdown-link :href="route('payments.admin.index')" :active="request()->routeIs('payments.admin.*')">Gestión de pagos</x-dropdown-link>
                            <x-dropdown-link :href="route('complaints.admin.index')" :active="request()->routeIs('complaints.admin.*')">Gestión de reclamaciones</x-dropdown-link>

                        </x-dropdown-nav-item>
                    </div>
                @endif

                <div class="hidden app-nav-category xl:flex">
                    <x-dropdown-nav-item name="{{ __('Memoria') }}" :active="$isMemoryActive">
                        <x-dropdown-link :href="route('calculadora.asistente.memoria-calculo')" :active="request()->routeIs('calculadora.asistente.memoria-calculo')">
                            {{ __('Memoria Calculo') }}
                        </x-dropdown-link>
                        <x-dropdown-link :href="route('calculadora.asistente.memoria-descriptiva')" :active="request()->routeIs('calculadora.asistente.memoria-descriptiva*')">
                            {{ __('Memoria Descriptiva') }}
                        </x-dropdown-link>
                    </x-dropdown-nav-item>
                </div>
                <div class="hidden app-nav-category xl:flex">
                    <x-dropdown-nav-item name="{{ __('Estudiante') }}" :active="$isStudentActive">
                        <x-dropdown-sub label="{{ __('Concreto Armado') }}" :links="[
                            [
                                'url' => route('calculadora.estudiante.cav2.metrados'),
                                'label' => 'Metrados',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.escaleras'),
                                'label' => 'Escaleras',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.zapatas'),
                                'label' => 'Zapatas',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.combinacion-de-cargas'),
                                'label' => 'Combinacion de Cargas',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.viguetas'),
                                'label' => 'Viguetas',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.voladitos'),
                                'label' => 'Voladitos',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.verificacion-de-deflexiones'),
                                'label' => 'Verificacion de Deflexiones',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.aligerados'),
                                'label' => 'Aligerados',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.distribucion-del-acero'),
                                'label' => 'Distribución del Acero',
                            ],
                             [
                                 'url' => route('calculadora.estudiante.cav2.vigas-continuas'),
                                 'label' => 'Vigas Continuas',
                             ],
                             [
                                 'url' => route('calculadora.estudiante.cav2.viga-t'),
                                 'label' => 'Viga T',
                             ],
                         ]"></x-dropdown-sub>
                    </x-dropdown-nav-item>
                </div>
                <div class="hidden app-nav-category xl:flex">
                    <x-dropdown-nav-item name="{{ __('Asistente') }}" :active="$isAssistantActive">
                        <x-dropdown-sub label="{{ __('Vigas') }}" :links="[
                            ['url' => route('calculadora.asistente.vigas'), 'label' => 'Diseño de Vigas'],
                            [
                                'url' => route('calculadora.asistente.vigas-general'),
                                'label' => 'Diseño de Vigas General',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-link :href="route('calculadora.asistente.escaleras')" :active="request()->routeIs('calculadora.asistente.escaleras')" {{-- wire:navigate --}}>
                            {{ __('Escaleras') }}
                        </x-dropdown-link>
                        <x-dropdown-sub label="{{ __('Losas') }}" :links="[
                            [
                                'url' => route('calculadora.asistente.losas-macizas'),
                                'label' => 'Diseño de Losas Macizas',
                            ],
                            [
                                'url' => route('calculadora.asistente.losas-aligeradas'),
                                'label' => 'Diseño de Losas Aligeradas',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Muros') }}" :links="[
                            [
                                'url' => route('calculadora.asistente.muros-de-contencion'),
                                'label' => 'Diseño de Muros de Contención',
                            ],
                            [
                                'url' => route('calculadora.asistente.muros-de-albanieria'),
                                'label' => 'Diseño de Muros de Albañieria',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-link :href="route('calculadora.asistente.cimiento-corrido')" :active="request()->routeIs('calculadora.asistente.cimiento-corrido')" {{-- wire:navigate --}}>
                            {{ __('Cimiento Corrido') }}
                        </x-dropdown-link>
                        <x-dropdown-sub label="{{ __('Columnas') }}" :links="[
                            [
                                'url' => route('calculadora.asistente.columna-de-acero'),
                                'label' => 'Diseño de Columnas de Acero',
                            ],
                            [
                                'url' => route('calculadora.asistente.columna'),
                                'label' => 'Diseño de Columnas',
                            ],
                            [
                                'url' => route('calculadora.asistente.columna-ii'),
                                'label' => 'Diseño de Columnas II',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Zapatas') }}" :links="[
                            [
                                'url' => route('calculadora.asistente.zapata-combinada'),
                                'label' => 'Diseño de Zapata Combinada',
                            ],
                            [
                                'url' => route('calculadora.asistente.zapata-conectada'),
                                'label' => 'Diseño de Zapata Conectada',
                            ],
                            [
                                'url' => route('calculadora.asistente.zapata-general'),
                                'label' => 'Diseño de Zapata General',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Placas') }}" :links="[
                            [
                                'url' => route('calculadora.asistente.placas-L'),
                                'label' => 'Diseño de Placas L',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-link :href="route('calculadora.asistente.cerco-perimetrico')" :active="request()->routeIs('calculadora.asistente.cerco-perimetrico')" {{-- wire:navigate --}}>
                            {{ __('Diseño de Cerco Perimetrico') }}
                        </x-dropdown-link>
                        <x-dropdown-link :href="route('calculadora.asistente.irregularidades')" :active="request()->routeIs('calculadora.asistente.irregularidades')" {{-- wire:navigate --}}>
                            {{ __('Irregularidades') }}
                        </x-dropdown-link>
                        <x-dropdown-link :href="route('calculadora.asistente.espectro-sismico')" :active="request()->routeIs('calculadora.asistente.espectro-sismico')" {{-- wire:navigate --}}>
                            {{ __('Epectro Simico') }}
                        </x-dropdown-link>
                        <x-dropdown-sub label="{{ __('Diseño En Madera') }}" :links="[
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.correas'),
                                'label' => 'Diseño de Correas',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.flexo-compresion'),
                                'label' => 'Flexocompresion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.compresion'),
                                'label' => 'Compresion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.traccion'),
                                'label' => 'Traccion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.flexo-traccion'),
                                'label' => 'Flexotraccion',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Diseño En Acero') }}" :links="[
                            [
                                'url' => route('calculadora.asistente.diseno-en-acero.compresion'),
                                'label' => 'Compresion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-acero.traccion'),
                                'label' => 'Traccion',
                            ],
                        ]"></x-dropdown-sub>
                    </x-dropdown-nav-item>
                </div>
                <div class="hidden app-nav-category xl:flex">
                    <x-dropdown-nav-item name="{{ __('Diseñador') }}" :active="$isDesignerActive">
                        <x-dropdown-sub label="{{ __('Suelos') }}" :links="[
                            [
                                'url' => route('software.suelos.distribucion-de-esfuerzos'),
                                'label' => 'Distribucion de Esfuerzos',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Programas') }}" :links="[
                            ['url' => route('software.aligerados-v1'), 'label' => 'Aligerados v1.0'],
                            ['url' => route('software.aligerados-v2'), 'label' => 'Aligerados v2.0'],
                            ['url' => route('software.cimentacion-v1'), 'label' => 'Cimentacion v1.0'],
                            ['url' => route('software.cimentacion-v2'), 'label' => 'Cimentacion v2.0'],
                            [
                                'url' => route('software.analisis-estructural-de-armaduras'),
                                'label' => 'Analisis Estructural',
                            ],
                            ['url' => route('software.etabs2'), 'label' => 'Predim 2'],
                            [
                                'url' => route('calculadora.asistente.muros-de-contencionv2'),
                                'label' => 'Muros de Contencion V2',
                            ],
                        ]"></x-dropdown-sub>

                        <x-dropdown-link :href="route('software.predimv2')" :active="request()->routeIs('software.predimv2')">
                            {{ __('Predim') }}
                        </x-dropdown-link>
                        <x-dropdown-link :href="route('calculadora.estudiante.arco_techo')" :active="request()->routeIs('calculadora.estudiante.arco_techo')">
                            {{ __('Arco Techo') }}
                        </x-dropdown-link>
                    </x-dropdown-nav-item>
                </div>
                <div class="hidden app-nav-category xl:flex">
                    <x-dropdown-nav-item name="{{ __('Revisor') }}" :active="$isReviewerActive">

                        <x-dropdown-sub label="{{ __('Verificacion') }}" :links="[
                            ['url' => route('software.anclaje-v1'), 'label' => 'Anclaje'],
                            ['url' => route('software.base-dinamica-v1'), 'label' => 'Bases Dinamicas'],
                            ['url' => route('software.estribo-columna-placa-v1'), 'label' => 'Estribo Columna Placa'],
                            ['url' => route('software.estribo-placa-v1'), 'label' => 'Estribo de Placas'],
                            ['url' => route('software.predim-viga-v1'), 'label' => 'Predim Viga'],
                            ['url' => route('software.verificacion-viga-v1'), 'label' => 'Viga Verifica'],
                            ['url' => route('calculadora.estudiante.cav2.hoja2'), 'label' => 'VRD-ALIG'],
                        ]"></x-dropdown-sub>

                    </x-dropdown-nav-item>
                </div>

                <div class="hidden app-nav-category xl:flex">
                    <button type="button" class="app-nav-trigger" @click="toggle()" aria-label="Abrir calculadora científica"><x-svg.calculator class="h-5" /></button>
                </div>
            </div>

            <!-- Settings Dropdown -->
            @auth
                <div class="app-nav-account hidden xl:flex xl:items-center">
                    <x-dropdown align="right" width="48">
                        {{-- Botón del avatar --}}
                        <x-slot name="trigger">
                            <button
                                class="app-nav-account-button flex items-center focus:outline-none group"
                                type="button" aria-label="Mi cuenta" :aria-expanded="open.toString()" aria-expanded="false">

                                {{-- Avatar con iniciales --}}
                                <div
                                    class="app-nav-avatar flex items-center justify-center">
                                    {{ mb_strtoupper(mb_substr(auth()->user()->name, 0, 2)) }}
                                </div><span>Mi cuenta</span>
                            </button>
                        </x-slot>

                        {{-- Contenido del dropdown --}}
                        <x-slot name="content">
                            <div
                                class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <span x-data="{{ json_encode(['name' => auth()->user()->name]) }}" x-text="name"
                                    x-on:profile-updated.window="name = $event.detail.name"></span>
                            </div>

                            {{-- Enlace al perfil --}}
                            <x-dropdown-link :href="route('plans.mine')" :active="request()->routeIs('plans.mine')">Mi plan y pagos</x-dropdown-link>
                            <x-dropdown-link :href="route('backups.index')" :active="request()->routeIs('backups.*')">Mis respaldos</x-dropdown-link>
                            <x-dropdown-link :href="route('landing.home')">Sitio web</x-dropdown-link>
                            <x-dropdown-link :href="route('profile')">
                                {{ __('Perfil') }}
                            </x-dropdown-link>
                            <x-dropdown-link :href="route('account.support')" :active="request()->routeIs('account.support')">Ayuda y soporte</x-dropdown-link>

                            {{-- Logout --}}
                            <button type="button" class="app-nav-signout w-full text-start" wire:click="logout">Cerrar sesión</button>
                        </x-slot>
                    </x-dropdown>
                </div>
            @endauth

            <!-- Hamburger -->
            <div class="flex items-center xl:hidden">
                <button
                    class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                    type="button" aria-label="Abrir o cerrar menú de herramientas" aria-controls="workspace-mobile-menu" :aria-expanded="open.toString()" @click="open = ! open">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path class="inline-flex" :class="{ 'hidden': open, 'inline-flex': !open }"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                        <path class="hidden" :class="{ 'hidden': !open, 'inline-flex': open }" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Responsive Navigation Menu -->
    <div id="workspace-mobile-menu" class="app-nav-mobile hidden xl:hidden" :class="{ 'block': open, 'hidden': !open }">
        <div class="space-y-1 pb-3 pt-2">
            <x-responsive-nav-link component="responsive-nav-item" :href="route('dashboard')" :active="request()->routeIs('dashboard')"
                {{-- wire:navigate --}}>
                {{ __('Inicio') }}
            </x-responsive-nav-link>
        </div>
        @if ($canManagePlans)
            <div class="space-y-1 pb-3 pt-2">
                <x-dropdown-nav-item name="{{ __('Administración') }}" component="responsive-nav-item" :active="request()->routeIs(['administration.index', 'planUser.*', 'suscripciones.*', 'payments.admin.*', 'complaints.admin.*'])">
                    <x-dropdown-link :href="route('administration.index')" :active="request()->routeIs('administration.index')">
                        {{ __('Resumen administrativo') }}
                    </x-dropdown-link>
                    <x-dropdown-link :href="route('planUser.index')" :active="request()->routeIs('planUser.index')">
                        {{ __('Gestion de Usuario') }}
                    </x-dropdown-link>
                    <x-dropdown-link :href="route('suscripciones.index')" :active="request()->routeIs('suscripciones.index')">
                        {{ __('Gestion de planes') }}
                    </x-dropdown-link>
<x-dropdown-link :href="route('payments.admin.index')" :active="request()->routeIs('payments.admin.*')">Gestión de pagos</x-dropdown-link>
                            <x-dropdown-link :href="route('complaints.admin.index')" :active="request()->routeIs('complaints.admin.*')">Gestión de reclamaciones</x-dropdown-link>

                </x-dropdown-nav-item>
            </div>
        @endif
        <div class="space-y-1 pb-3 pt-2">
            <x-dropdown-nav-item name="{{ __('Memoria') }}" component="responsive-nav-item" :active="$isMemoryActive">
                <x-dropdown-link :href="route('calculadora.asistente.memoria-calculo')" :active="request()->routeIs('calculadora.asistente.memoria-calculo')">
                    {{ __('Memoria Calculo') }}
                </x-dropdown-link>
                <x-dropdown-link :href="route('calculadora.asistente.memoria-descriptiva')" :active="request()->routeIs('calculadora.asistente.memoria-descriptiva*')">
                    {{ __('Memoria Descriptiva') }}
                </x-dropdown-link>
            </x-dropdown-nav-item>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <x-dropdown-nav-item name="{{ __('Estudiante') }}" component="responsive-nav-item" :active="$isStudentActive">
                <x-dropdown-sub label="{{ __('Concreto Armado') }}" :links="[
                    [
                        'url' => route('calculadora.estudiante.cav2.metrados'),
                        'label' => 'Metrados',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.escaleras'),
                        'label' => 'Escaleras',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.zapatas'),
                        'label' => 'Zapatas',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.combinacion-de-cargas'),
                        'label' => 'Combinacion de Cargas',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.viguetas'),
                        'label' => 'Viguetas',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.voladitos'),
                        'label' => 'Voladitos',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.verificacion-de-deflexiones'),
                        'label' => 'Verificacion de Deflexiones',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.aligerados'),
                        'label' => 'Aligerados',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.distribucion-del-acero'),
                        'label' => 'Distribución del Acero',
                    ],
                     [
                         'url' => route('calculadora.estudiante.cav2.vigas-continuas'),
                         'label' => 'Vigas Continuas',
                     ],
                     [
                         'url' => route('calculadora.estudiante.cav2.viga-t'),
                         'label' => 'Viga T',
                     ],
                 ]"></x-dropdown-sub>
            </x-dropdown-nav-item>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <x-dropdown-nav-item name="{{ __('Asistente') }}" component="responsive-nav-item" :active="$isAssistantActive">
                <x-dropdown-sub label="{{ __('Vigas') }}" :links="[
                    ['url' => route('calculadora.asistente.vigas'), 'label' => 'Diseño de Vigas'],
                    ['url' => route('calculadora.asistente.vigas-general'), 'label' => 'Diseño de Vigas General'],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Losas') }}" :links="[
                    ['url' => route('calculadora.asistente.losas-macizas'), 'label' => 'Diseño de Losas Macizas'],
                    ['url' => route('calculadora.asistente.losas-aligeradas'), 'label' => 'Diseño de Losas Aligeradas'],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Muros') }}" :links="[
                    [
                        'url' => route('calculadora.asistente.muros-de-contencion'),
                        'label' => 'Diseño de Muros de Contención',
                    ],
                    [
                        'url' => route('calculadora.asistente.muros-de-albanieria'),
                        'label' => 'Diseño de Muros de Albañieria',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-link :href="route('calculadora.asistente.cimiento-corrido')" :active="request()->routeIs('calculadora.asistente.cimiento-corrido')" {{-- wire:navigate --}}>
                    {{ __('Cimiento Corrido') }}
                </x-dropdown-link>
                <x-dropdown-sub label="{{ __('Columnas') }}" :links="[
                    [
                        'url' => route('calculadora.asistente.columna-de-acero'),
                        'label' => 'Diseño de Columnas de Acero',
                    ],
                    [
                        'url' => route('calculadora.asistente.columna'),
                        'label' => 'Diseño de Columnas',
                    ],
                    [
                        'url' => route('calculadora.asistente.columna-ii'),
                        'label' => 'Diseño de Columnas II',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Zapatas') }}" :links="[
                    [
                        'url' => route('calculadora.asistente.zapata-combinada'),
                        'label' => 'Diseño de Zapata Combinada',
                    ],
                    [
                        'url' => route('calculadora.asistente.zapata-conectada'),
                        'label' => 'Diseño de Zapata Conectada',
                    ],
                    [
                        'url' => route('calculadora.asistente.zapata-general'),
                        'label' => 'Diseño de Zapata General',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Placas') }}" :links="[
                    [
                        'url' => route('calculadora.asistente.placas-L'),
                        'label' => 'Diseño de Placas L',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-link :href="route('calculadora.asistente.cerco-perimetrico')" :active="request()->routeIs('calculadora.asistente.cerco-perimetrico')" {{-- wire:navigate --}}>
                    {{ __('Diseño de Cerco Perimetrico') }}
                </x-dropdown-link>
                <x-dropdown-link :href="route('calculadora.asistente.irregularidades')" :active="request()->routeIs('calculadora.asistente.irregularidades')" {{-- wire:navigate --}}>
                    {{ __('Irregularidades') }}
                </x-dropdown-link>
                <x-dropdown-link :href="route('calculadora.asistente.espectro-sismico')" :active="request()->routeIs('calculadora.asistente.espectro-sismico')" {{-- wire:navigate --}}>
                    {{ __('Epectro Simico') }}
                </x-dropdown-link>
                <x-dropdown-sub label="{{ __('Diseño En Madera') }}" :links="[
                    ['url' => route('calculadora.asistente.diseno-en-madera.correas'), 'label' => 'Diseño de Correas'],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.flexo-compresion'),
                        'label' => 'Flexocompresion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.compresion'),
                        'label' => 'Compresion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.traccion'),
                        'label' => 'Traccion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.flexo-traccion'),
                        'label' => 'Flexotraccion',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Diseño En Acero') }}" :links="[
                    [
                        'url' => route('calculadora.asistente.diseno-en-acero.compresion'),
                        'label' => 'Compresion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-acero.traccion'),
                        'label' => 'Traccion',
                    ],
                ]"></x-dropdown-sub>
            </x-dropdown-nav-item>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <x-dropdown-nav-item name="{{ __('Diseñador') }}" component="responsive-nav-item" :active="$isDesignerActive">
                <x-dropdown-sub label="{{ __('Suelos') }}" :links="[
                    [
                        'url' => route('software.suelos.distribucion-de-esfuerzos'),
                        'label' => 'Distribucion de Esfuerzos',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Programas') }}" :links="[
                    ['url' => route('software.aligerados-v1'), 'label' => 'Aligerados v1.0'],
                    ['url' => route('software.aligerados-v2'), 'label' => 'Aligerados v2.0'],
                    ['url' => route('software.cimentacion-v1'), 'label' => 'Cimentacion v1.0'],
                    ['url' => route('software.cimentacion-v2'), 'label' => 'Cimentacion v2.0'],
                    ['url' => route('software.analisis-estructural-de-armaduras'), 'label' => 'Analisis Estructural'],
                    ['url' => route('software.etabs2'), 'label' => 'Etabs 2'],
                    [
                        'url' => route('calculadora.asistente.muros-de-contencionv2'),
                        'label' => 'Muros de Contencion V2',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-link :href="route('software.predimv2')" :active="request()->routeIs('software.predimv2')">
                    {{ __('Predim') }}
                </x-dropdown-link>
                <x-dropdown-link :href="route('calculadora.estudiante.arco_techo')" :active="request()->routeIs('calculadora.estudiante.arco_techo')">
                    {{ __('Arco Techo') }}
                </x-dropdown-link>
            </x-dropdown-nav-item>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <x-dropdown-nav-item name="{{ __('Revisor') }}" component="responsive-nav-item" :active="$isReviewerActive">
                <x-dropdown-sub label="{{ __('Verificacion') }}" :links="[
                    ['url' => route('software.anclaje-v1'), 'label' => 'Anclaje'],
                    ['url' => route('software.base-dinamica-v1'), 'label' => 'Bases Dinamicas'],
                    ['url' => route('software.estribo-columna-placa-v1'), 'label' => 'Estribo Columna Placa'],
                    ['url' => route('software.estribo-placa-v1'), 'label' => 'Estribo de Placas'],
                    ['url' => route('software.predim-viga-v1'), 'label' => 'Predim Viga'],
                    ['url' => route('software.verificacion-viga-v1'), 'label' => 'Viga Verifica'],
                    ['url' => route('calculadora.estudiante.cav2.hoja2'), 'label' => 'VRD-ALIG'],
                ]"></x-dropdown-sub>
            </x-dropdown-nav-item>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <button type="button" class="app-nav-trigger" @click="toggle()"><x-svg.calculator class="h-5" /><span>Calculadora científica</span></button>
        </div>

        <!-- Responsive Settings Options -->
        <div class="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
            @auth
                <div class="px-4">
                    <div class="text-base font-medium text-gray-800 dark:text-gray-200" x-data="{{ json_encode(['name' => auth()->user()->name]) }}"
                        x-text="name" x-on:profile-updated.window="name = $event.detail.name"></div>
                    <div class="text-sm font-medium text-gray-500">{{ auth()->user()->email }}</div>
                </div>
            @endauth
            <div class="mt-3 space-y-1">
                <x-responsive-nav-link :href="route('plans.mine')" :active="request()->routeIs('plans.mine')">Mi plan y pagos</x-responsive-nav-link>
                <x-responsive-nav-link :href="route('backups.index')" :active="request()->routeIs('backups.*')">Mis respaldos</x-responsive-nav-link>
                <x-responsive-nav-link :href="route('landing.home')">Sitio web</x-responsive-nav-link>
                <x-responsive-nav-link :href="route('profile')" {{-- wire:navigate --}}>
                    {{ __('Perfil') }}
                </x-responsive-nav-link>
                <x-responsive-nav-link :href="route('account.support')" :active="request()->routeIs('account.support')">Ayuda y soporte</x-responsive-nav-link>

                <!-- Authentication -->
                <button type="button" class="app-nav-signout w-full text-start" wire:click="logout">Cerrar sesión</button>
            </div>
        </div>
    </div>

    <div x-ref="calculator_dialog" style="display:none">
        <div style="min-width:800px;min-height:600px" x-ref="applet_container"></div>
    </div>
</nav>
