<nav class="engineering-nav wk-navigation" aria-label="Navegación interna" x-data="{ expanded: false }">
  <div class="en-nav-shell">
    <a class="en-brand" href="{{ route('dashboard') }}"><img class="dark:invert" src="{{ Vite::asset('resources/img/logo_rizabalAsociados.png') }}" alt=""><span><strong>Rizabal & Asociados</strong><small>ESPACIO DE TRABAJO</small></span></a>
    <button type="button" class="wk-menu-toggle xl:hidden" @click="expanded = !expanded" :aria-expanded="expanded.toString()" aria-expanded="false" aria-controls="workspace-navigation"><span class="sr-only">Abrir o cerrar menú interno</span><svg width="22" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 2h20M1 9h20M1 16h20"/></svg></button>
    <div id="workspace-navigation" class="w-full xl:block xl:w-auto" :class="expanded ? 'block' : 'hidden'" @keydown.escape="expanded = false">
      <ul class="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-2">
        <li><x-nav-link-landing :href="route('dashboard')" :active="request()->routeIs('dashboard')">Inicio</x-nav-link-landing></li>
        <li><x-nav-link-landing :href="route('dashboard').'#herramientas'" :active="false">Herramientas</x-nav-link-landing></li>
        @if(auth()->user()->hasRole(['root', 'gerencia']))
          <li><x-nav-link-sub-landing name="Administración" :active="request()->routeIs('administration.index', 'planUser.*', 'suscripciones.*', 'payments.admin.*', 'complaints.admin.*')">
            <ul>
              @foreach(['administration.index'=>'Resumen administrativo', 'planUser.index'=>'Usuarios y suscripciones', 'suscripciones.index'=>'Catálogo de planes', 'payments.admin.index'=>'Gestión de pagos', 'complaints.admin.index'=>'Gestión de reclamaciones'] as $destination=>$label)
                <li><x-nav-link-landing :href="route($destination)" :active="request()->routeIs($destination)">{{ $label }}</x-nav-link-landing></li>
              @endforeach
            </ul>
          </x-nav-link-sub-landing></li>
        @endif
        <li><x-nav-link-sub-landing name="Mi cuenta" class="en-account-trigger" :active="request()->routeIs('plans.*', 'backups.*', 'profile', 'account.*', 'planes.*', 'culqi.*')">
          <ul>
            <li class="wk-nav-identity"><strong>{{ auth()->user()->name }}</strong><span>{{ auth()->user()->email }}</span></li>
            @foreach(['plans.mine'=>'Mi plan y pagos', 'backups.index'=>'Mis respaldos', 'profile'=>'Perfil y seguridad', 'account.support'=>'Ayuda y soporte'] as $destination=>$label)
              <li><x-nav-link-landing :href="route($destination)" :active="$destination === 'backups.index' ? request()->routeIs('backups.*') : request()->routeIs($destination)">{{ $label }}</x-nav-link-landing></li>
            @endforeach
            <li class="mt-2 border-t pt-2"><form method="POST" action="{{ route('logout') }}">@csrf<button type="submit">Cerrar sesión</button></form></li>
          </ul>
        </x-nav-link-sub-landing></li>
      </ul>
    </div>
  </div>
</nav>
