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

<nav class="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800" x-data="scientific_calculator_applet"
    x-init="initComponent($refs.calculator_dialog, $refs.applet_container)">
    <!-- Primary Navigation Menu -->
    <div class="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
            <div class="flex">
                <!-- Logo -->
                <div class="flex shrink-0 items-center">
                    <a href="{{ route('dashboard') }}" {{-- wire:navigate --}}>
                        <x-application-logo
                            class="flex h-9 w-auto flex-row gap-2 fill-current text-gray-800 dark:text-gray-200" />
                    </a>
                </div>

                <!-- Navigation Links -->
                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <x-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')" {{-- wire:navigate --}}>
                        {{ __('Dashboard') }}
                    </x-nav-link>
                </div>
                @php
                    $user = auth()->user();
                @endphp

                @if ($user->hasRole(['root', 'gerencia']))
                    <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                        <x-dropdown-nav-item name="{{ __('Planes/User') }}" :active="request()->routeIs('suscripciones.*')">
                            <x-nav-link :href="route('planUser.index')" :active="request()->routeIs('planUser.index')">
                                {{ __('Gestion de Usuario') }}
                            </x-nav-link>
                            <x-nav-link :href="route('suscripciones.index')" :active="request()->routeIs('suscripciones.index')">
                                {{ __('Gestion de planes') }}
                            </x-nav-link>
                        </x-dropdown-nav-item>
                    </div>
                @endif

                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <x-dropdown-nav-item name="{{ __('Estudiante') }}" :active="request()->routeIs('calculadora.estudiante.*')">
                        <x-dropdown-link :href="route('software.predim')" :active="request()->routeIs('software.predim')">
                            {{ __('Predim') }}
                        </x-dropdown-link>
                        <x-dropdown-link :href="route('calculadora.estudiante.arco_techo')" :active="request()->routeIs('calculadora.estudiante.arco_techo')">
                            {{ __('Arco Techo') }}
                        </x-dropdown-link>
                        <x-dropdown-sub label="{{ __('Concreto Armado') }}" :links="[
                            [
                                'url' => 'calculadora.estudiante.cav2.metrados',
                                'label' => 'Metrados',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.escaleras',
                                'label' => 'Escaleras',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.zapatas',
                                'label' => 'Zapatas',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.combinacion-de-cargas',
                                'label' => 'Combinacion de Cargas',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.viguetas',
                                'label' => 'Viguetas',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.voladitos',
                                'label' => 'Voladitos',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.verificacion-de-deflexiones',
                                'label' => 'Verificacion de Deflexiones',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.aligerados',
                                'label' => 'Aligerados',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.distribucion-del-acero',
                                'label' => 'Distribución del Acero',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.vigas-continuas',
                                'label' => 'Vigas Continuas',
                            ],
                            [
                                'url' => 'calculadora.estudiante.cav2.hoja2',
                                'label' => 'Hoja2',
                            ],
                        ]"></x-dropdown-sub>
                    </x-dropdown-nav-item>
                </div>
                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <x-dropdown-nav-item name="{{ __('Asistente') }}" :active="request()->routeIs('calculadora.asistente.*')">
                        <x-dropdown-sub label="{{ __('Vigas') }}" :links="[
                            ['url' => 'calculadora.asistente.vigas', 'label' => 'Diseño de Vigas'],
                            ['url' => 'calculadora.asistente.vigas-general', 'label' => 'Diseño de Vigas General'],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Losas') }}" :links="[
                            ['url' => 'calculadora.asistente.losas-macizas', 'label' => 'Diseño de Losas Macizas'],
                            [
                                'url' => 'calculadora.asistente.losas-aligeradas',
                                'label' => 'Diseño de Losas Aligeradas',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Muros') }}" :links="[
                            [
                                'url' => 'calculadora.asistente.muros-de-contencion',
                                'label' => 'Diseño de Muros de Contención',
                            ],
                            [
                                'url' => 'calculadora.asistente.muros-de-albañieria',
                                'label' => 'Diseño de Muros de Albañieria',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-link :href="route('calculadora.asistente.cimiento-corrido')" :active="request()->routeIs('calculadora.asistente.cimiento-corrido')" {{-- wire:navigate --}}>
                            {{ __('Cimiento Corrido') }}
                        </x-dropdown-link>
                        <x-dropdown-sub label="{{ __('Columnas') }}" :links="[
                            [
                                'url' => 'calculadora.asistente.columna-de-acero',
                                'label' => 'Diseño de Columnas de Acero',
                            ],
                            [
                                'url' => 'calculadora.asistente.columna',
                                'label' => 'Diseño de Columnas',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Zapatas') }}" :links="[
                            [
                                'url' => 'calculadora.asistente.zapata-combinada',
                                'label' => 'Diseño de Zapata Combinada',
                            ],
                            [
                                'url' => 'calculadora.asistente.zapata-conectada',
                                'label' => 'Diseño de Zapata Conectada',
                            ],
                            [
                                'url' => 'calculadora.asistente.zapata-general',
                                'label' => 'Diseño de Zapata General',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Placas') }}" :links="[
                            [
                                'url' => 'calculadora.asistente.placas-L',
                                'label' => 'Diseño de Placas L',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-link :href="route('calculadora.asistente.cerco-perimetrico')" :active="request()->routeIs('calculadora.asistente.cerco-perimetrico')" {{-- wire:navigate --}}>
                            {{ __('Diseño de Cerco Perimetrico') }}
                        </x-dropdown-link>
                        <x-dropdown-link :href="route('calculadora.asistente.irregularidades')" :active="request()->routeIs('calculadora.asistente.irregularidades')" {{-- wire:navigate --}}>
                            {{ __('Irregularidades') }}
                        </x-dropdown-link>
                        <x-dropdown-sub label="{{ __('Diseño En Madera') }}" :links="[
                            ['url' => 'calculadora.asistente.diseño-en-madera.correas', 'label' => 'Diseño de Correas'],
                            [
                                'url' => 'calculadora.asistente.diseño-en-madera.flexo-compresion',
                                'label' => 'Flexocompresion',
                            ],
                            [
                                'url' => 'calculadora.asistente.diseño-en-madera.compresion',
                                'label' => 'Compresion',
                            ],
                            [
                                'url' => 'calculadora.asistente.diseño-en-madera.traccion',
                                'label' => 'Traccion',
                            ],
                            [
                                'url' => 'calculadora.asistente.diseño-en-madera.flexo-traccion',
                                'label' => 'Flexotraccion',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Diseño En Acero') }}" :links="[
                            [
                                'url' => 'calculadora.asistente.diseño-en-acero.compresion',
                                'label' => 'Compresion',
                            ],
                            [
                                'url' => 'calculadora.asistente.diseño-en-acero.traccion',
                                'label' => 'Traccion',
                            ],
                        ]"></x-dropdown-sub>
                    </x-dropdown-nav-item>
                </div>
                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <x-dropdown-nav-item name="{{ __('Diseñador') }}" :active="request()->routeIs('software.*')">
                        <x-dropdown-sub label="{{ __('Suelos') }}" :links="[
                            [
                                'url' => 'software.suelos.distribucion-de-esfuerzos',
                                'label' => 'Distribucion de Esfuerzos',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Programas') }}" :links="[
                            ['url' => 'software.aligerados-v1', 'label' => 'Aligerados v1.0'],
                            ['url' => 'software.aligerados-v2', 'label' => 'Aligerados v2.0'],
                            ['url' => 'software.cimentacion-v1', 'label' => 'Cimentacion v1.0'],
                            ['url' => 'software.cimentacion-v2', 'label' => 'Cimentacion v2.0'],
                            ['url' => 'software.analisis-estructural-de-armaduras', 'label' => 'Analisis Estructural'],
                            [
                                'url' => 'calculadora.asistente.muros-de-contencionv2',
                                'label' => 'Diseño de Muros de Contención V 2.0',
                            ],
                        ]"></x-dropdown-sub>
                        <x-dropdown-sub label="{{ __('Verificacion') }}" :links="[
                            ['url' => 'software.anclaje-v1', 'label' => 'Anclaje'],
                            ['url' => 'software.base-dinamica-v1', 'label' => 'Bases Dinamicas'],
                            ['url' => 'software.estribo-columna-placa-v1', 'label' => 'Estribo Columna Placa'],
                            ['url' => 'software.estribo-placa-v1', 'label' => 'Estribo de Placas'],
                            ['url' => 'software.predim-viga-v1', 'label' => 'Predim Viga'],
                            ['url' => 'software.verificacion-viga-v1', 'label' => 'Viga Verifica'],
                        ]"></x-dropdown-sub>
                    </x-dropdown-nav-item>
                </div>
                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <x-nav-item @click="toggle()"><x-svg.calculator class="h-5"></x-svg.calculator></x-nav-item>
                </div>
            </div>

            <!-- Settings Dropdown -->
            @auth
                <div class="hidden sm:flex sm:items-center sm:ms-6">
                    <x-dropdown align="right" width="48">
                        {{-- Botón del avatar --}}
                        <x-slot name="trigger">
                            <button
                                class="flex items-center gap-3 rounded-full focus:outline-none transition duration-150 ease-in-out group"
                                aria-label="User menu" aria-haspopup="true">

                                {{-- Avatar con iniciales --}}
                                <div
                                    class="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold group-hover:scale-105 transition">
                                    {{ strtoupper(substr(auth()->user()->name, 0, 2)) }}
                                </div>
                            </button>
                        </x-slot>

                        {{-- Contenido del dropdown --}}
                        <x-slot name="content">
                            <div
                                class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <span x-data="{ name: '{{ auth()->user()->name }}' }" x-text="name"
                                    x-on:profile-updated.window="name = $event.detail.name"></span>
                            </div>

                            {{-- Enlace al perfil --}}
                            <x-dropdown-link :href="route('profile')">
                                {{ __('Perfil') }}
                            </x-dropdown-link>

                            {{-- Logout --}}
                            <button class="w-full text-start" wire:click="logout"> <x-dropdown-link> {{ __('Log Out') }}
                                </x-dropdown-link> </button>
                        </x-slot>
                    </x-dropdown>
                </div>
            @endauth

            <!-- Hamburger -->
            <div class="-me-2 flex items-center sm:hidden">
                <button
                    class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                    @click="open = ! open">
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
    <div class="hidden sm:hidden" :class="{ 'block': open, 'hidden': !open }">
        <div class="space-y-1 pb-3 pt-2">
            <x-responsive-nav-link component="responsive-nav-item" :href="route('dashboard')" :active="request()->routeIs('dashboard')"
                {{-- wire:navigate --}}>
                {{ __('Dashboard') }}
            </x-responsive-nav-link>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <x-dropdown-nav-item name="{{ __('Estudiante') }}" component="responsive-nav-item" :active="request()->routeIs('calculadora.estudiante.*')">
                <x-dropdown-link :href="route('software.predim')" :active="request()->routeIs('software.predim')">
                    {{ __('Predim') }}
                </x-dropdown-link>
                <x-dropdown-link :href="route('calculadora.estudiante.arco_techo')" :active="request()->routeIs('calculadora.estudiante.arco_techo')">
                    {{ __('Arco Techo') }}
                </x-dropdown-link>
                <x-dropdown-sub label="{{ __('Concreto Armado') }}" :links="[
                    [
                        'url' => 'calculadora.estudiante.cav2.metrados',
                        'label' => 'Metrados',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.escaleras',
                        'label' => 'Escaleras',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.zapatas',
                        'label' => 'Zapatas',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.combinacion-de-cargas',
                        'label' => 'Combinacion de Cargas',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.viguetas',
                        'label' => 'Viguetas',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.voladitos',
                        'label' => 'Voladitos',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.verificacion-de-deflexiones',
                        'label' => 'Verificacion de Deflexiones',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.aligerados',
                        'label' => 'Aligerados',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.distribucion-del-acero',
                        'label' => 'Distribución del Acero',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.vigas-continuas',
                        'label' => 'Vigas Continuas',
                    ],
                    [
                        'url' => 'calculadora.estudiante.cav2.hoja2',
                        'label' => 'Hoja2',
                    ],
                ]"></x-dropdown-sub>
            </x-dropdown-nav-item>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <x-dropdown-nav-item name="{{ __('Asistente') }}" component="responsive-nav-item" :active="request()->routeIs('calculadora.asistente.*')">
                <x-dropdown-sub label="{{ __('Vigas') }}" :links="[
                    ['url' => 'calculadora.asistente.vigas', 'label' => 'Diseño de Vigas'],
                    ['url' => 'calculadora.asistente.vigas-general', 'label' => 'Diseño de Vigas General'],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Losas') }}" :links="[
                    ['url' => 'calculadora.asistente.losas-macizas', 'label' => 'Diseño de Losas Macizas'],
                    ['url' => 'calculadora.asistente.losas-aligeradas', 'label' => 'Diseño de Losas Aligeradas'],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Muros') }}" :links="[
                    [
                        'url' => 'calculadora.asistente.muros-de-contencion',
                        'label' => 'Diseño de Muros de Contención',
                    ],
                    [
                        'url' => 'calculadora.asistente.muros-de-albañieria',
                        'label' => 'Diseño de Muros de Albañieria',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-link :href="route('calculadora.asistente.cimiento-corrido')" :active="request()->routeIs('calculadora.asistente.cimiento-corrido')" {{-- wire:navigate --}}>
                    {{ __('Cimiento Corrido') }}
                </x-dropdown-link>
                <x-dropdown-sub label="{{ __('Columnas') }}" :links="[
                    [
                        'url' => 'calculadora.asistente.columna-de-acero',
                        'label' => 'Diseño de Columnas de Acero',
                    ],
                    [
                        'url' => 'calculadora.asistente.columna',
                        'label' => 'Diseño de Columnas',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Zapatas') }}" :links="[
                    [
                        'url' => 'calculadora.asistente.zapata-combinada',
                        'label' => 'Diseño de Zapata Combinada',
                    ],
                    [
                        'url' => 'calculadora.asistente.zapata-conectada',
                        'label' => 'Diseño de Zapata Conectada',
                    ],
                    [
                        'url' => 'calculadora.asistente.zapata-general',
                        'label' => 'Diseño de Zapata General',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Placas') }}" :links="[
                    [
                        'url' => 'calculadora.asistente.placas-L',
                        'label' => 'Diseño de Placas L',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-link :href="route('calculadora.asistente.cerco-perimetrico')" :active="request()->routeIs('calculadora.asistente.cerco-perimetrico')" {{-- wire:navigate --}}>
                    {{ __('Diseño de Cerco Perimetrico') }}
                </x-dropdown-link>
                <x-dropdown-link :href="route('calculadora.asistente.irregularidades')" :active="request()->routeIs('calculadora.asistente.irregularidades')" {{-- wire:navigate --}}>
                    {{ __('Irregularidades') }}
                </x-dropdown-link>
                <x-dropdown-sub label="{{ __('Diseño En Madera') }}" :links="[
                    ['url' => 'calculadora.asistente.diseño-en-madera.correas', 'label' => 'Diseño de Correas'],
                    [
                        'url' => 'calculadora.asistente.diseño-en-madera.flexo-compresion',
                        'label' => 'Flexocompresion',
                    ],
                    [
                        'url' => 'calculadora.asistente.diseño-en-madera.compresion',
                        'label' => 'Compresion',
                    ],
                    [
                        'url' => 'calculadora.asistente.diseño-en-madera.traccion',
                        'label' => 'Traccion',
                    ],
                    [
                        'url' => 'calculadora.asistente.diseño-en-madera.flexo-traccion',
                        'label' => 'Flexotraccion',
                    ],
                ]"></x-dropdown-sub>
                <x-dropdown-sub label="{{ __('Diseño En Acero') }}" :links="[
                    [
                        'url' => 'calculadora.asistente.diseño-en-acero.compresion',
                        'label' => 'Compresion',
                    ],
                    [
                        'url' => 'calculadora.asistente.diseño-en-acero.traccion',
                        'label' => 'Traccion',
                    ],
                ]"></x-dropdown-sub>
            </x-dropdown-nav-item>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <x-dropdown-nav-item name="{{ __('Diseñador') }}" component="responsive-nav-item" :active="request()->routeIs('software.*')">
                <x-dropdown-sub label="{{ __('Programas') }}" :links="[
                    ['url' => 'software.aligerados-v1', 'label' => 'Aligerados v1.0'],
                    ['url' => 'software.aligerados-v2', 'label' => 'Aligerados v2.0'],
                    ['url' => 'software.cimentacion-v1', 'label' => 'Cimentacion v1.0'],
                    ['url' => 'software.cimentacion-v2', 'label' => 'Cimentacion v2.0'],
                    ['url' => 'software.analisis-estructural-de-armaduras', 'label' => 'Analisis Estructural'],
                ]"></x-dropdown-sub>
            </x-dropdown-nav-item>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <x-responsive-nav-item @click="toggle()"><x-svg.calculator
                    class="h-5"></x-svg.calculator></x-responsive-nav-item>
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
                <x-responsive-nav-link :href="route('profile')" {{-- wire:navigate --}}>
                    {{ __('Profile') }}
                </x-responsive-nav-link>

                <!-- Authentication -->
                <button class="w-full text-start" wire:click="logout">
                    <x-responsive-nav-link>
                        {{ __('Log Out') }}
                    </x-responsive-nav-link>
                </button>
            </div>
        </div>
    </div>

    <div x-ref="calculator_dialog">
        <div style="min-width:800px;min-height:600px" x-ref="applet_container"></div>
    </div>
</nav>
