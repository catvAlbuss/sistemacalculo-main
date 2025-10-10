<nav class="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
  <div class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
    <a class="flex items-center space-x-3 rtl:space-x-reverse" href="{{ route('landing.home') }}">
      <img class="h-8 dark:invert" src="{{ Vite::asset('resources/img/logo_rizabalAsociados.png') }}" alt="Logo" />
      <span class="self-center whitespace-nowrap text-lg dark:text-white">Rizabal & Asociados</span>
    </a>
    <div class="flex space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
      <div>
        <button
          class="inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          id="dropdownDefaultButton" data-dropdown-toggle="dropdown" type="button">Prueba Gratis<svg
            class="ms-3 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="m1 1 4 4 4-4" />
          </svg>
        </button>
        <div class="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:bg-gray-700"
          id="dropdown">
          <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
            <li>
              <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                href="{{ route('landing.info.predim') }}">Predim
                v1.0</a>
            </li>
            <li>
              <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                href="{{ route('landing.info.arco_techo') }}">Techo
                Arco</a>
            </li>
          </ul>
        </div>
      </div>
      <button
        class="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        data-collapse-toggle="navbar-multi-level" type="button" aria-controls="navbar-multi-level"
        aria-expanded="false">
        <span class="sr-only">Open main menu</span>
        <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M1 1h15M1 7h15M1 13h15" />
        </svg>
      </button>
    </div>
    <div class="hidden w-full md:block md:w-auto" id="navbar-multi-level">
      <ul
        class="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 rtl:space-x-reverse dark:border-gray-700 dark:bg-gray-800 md:dark:bg-gray-900">
        <li>
          <x-nav-link-landing :href="route('landing.home')" :active="request()->routeIs('landing.home')">{{ __('Inicio') }}</x-nav-link-landing>
        </li>
        <li>
          <x-nav-link-sub-landing name="{{ __('Servicios') }}" :active="request()->routeIs('landing.services.*')">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownNavbarLink">
              <li>
                <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  href="{{ route('landing.services.structural_design') }}">{{ __('Diseño Estructural') }}</a>
              </li>
              <li>
                <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  href="{{ route('landing.services.structural_software') }}">{{ __('Desarrollo de Software Estructural') }}</a>
              </li>
              <li>
                <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  href="{{ route('landing.services.structural_blueprint') }}">{{ __('Elaboración de Planos Estructurales') }}</a>
              </li>
              <li>
                <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  href="{{ route('landing.services.metrados') }}">{{ __('Elaboración de Metrados') }}</a>
              </li>
            </ul>
          </x-nav-link-sub-landing>
        </li>
        <li>
          <x-nav-link-landing :href="route('landing.contact')" :active="request()->routeIs('landing.contact')">{{ __('Contáctanos') }}</x-nav-link-landing>
        </li>
        <li>
          <x-nav-link-landing {{-- :href="route('blogs')" --}} :active="request()->routeIs('blogs')">{{ __('Blog') }}</x-nav-link-landing>
        </li>
      </ul>
    </div>
  </div>
</nav>
