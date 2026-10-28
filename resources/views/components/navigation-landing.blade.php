<nav class="engineering-nav" data-navigation="public" aria-label="Navegación principal" x-data="{ expanded: false }">
  <div class="en-nav-shell">
    <a class="en-brand" href="{{ route('landing.home') }}">
      <img class="h-8 dark:invert" src="{{ Vite::asset('resources/img/logo_rizabalAsociados.png') }}" alt="" />
      <span><strong>Rizabal & Asociados</strong><small>INGENIERÍA ESTRUCTURAL</small></span>
    </a>
    <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 xl:hidden dark:text-gray-200 dark:hover:bg-gray-700"
      @click="expanded = !expanded" :aria-expanded="expanded.toString()" aria-expanded="false" aria-controls="landing-navigation">
      <span class="sr-only">Abrir o cerrar menú principal</span>
      <svg class="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 17 14"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" /></svg>
    </button>
    <div id="landing-navigation" class="w-full xl:block xl:w-auto" :class="expanded ? 'block' : 'hidden'" @keydown.escape="expanded = false">
      <ul class="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-2">
        <li><x-nav-link-landing :href="route('landing.home')" :active="request()->routeIs('landing.home')">Inicio</x-nav-link-landing></li>
        <x-programs-menu />
        <li>
          <x-nav-link-sub-landing name="Servicios" :active="request()->routeIs('landing.services.*')">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              @foreach (['structural_design' => 'Diseño Estructural', 'structural_software' => 'Desarrollo de Software Estructural', 'structural_blueprint' => 'Elaboración de Planos Estructurales', 'metrados' => 'Elaboración de Metrados'] as $service => $label)
                <li><a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600" href="{{ route('landing.services.'.$service) }}">{{ $label }}</a></li>
              @endforeach
            </ul>
          </x-nav-link-sub-landing>
        </li>
        <li><x-nav-link-landing :href="route('landing.plans')" :active="request()->routeIs('landing.plans', 'planes.*', 'culqi.*')">Planes</x-nav-link-landing></li>
        <li><x-nav-link-landing :href="route('contacto.index')" :active="request()->routeIs('contacto.index')">Contacto</x-nav-link-landing></li>
        @auth
          <li><x-nav-link-landing :href="route('dashboard')" class="en-account-trigger" :active="false">Mi espacio de trabajo</x-nav-link-landing></li>
        @else
          <li><x-nav-link-landing :href="route('login')" class="en-nav-login" :active="request()->routeIs('login')">Iniciar sesión</x-nav-link-landing></li>
          <li>
            <x-nav-link-sub-landing name="Prueba gratis" :active="request()->routeIs('showcase.trial')" class="en-nav-cta">
              <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li><x-nav-link-landing :href="route('showcase.trial')" :active="false">Empezar prueba de 5 días</x-nav-link-landing></li>
                <li><x-nav-link-landing :href="route('showcase.index')" :active="false">Conocer los programas</x-nav-link-landing></li>
              </ul>
            </x-nav-link-sub-landing>
          </li>
        @endauth
      </ul>
    </div>
  </div>
</nav>
