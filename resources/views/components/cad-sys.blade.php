@pushOnce('initscripts')
    @vite('resources/js/analisis_estructural_de_armaduras.js')
@endPushOnce

<div class="cad-text-color cad-bg cad-border flex h-screen flex-col" x-id="['materiales']" x-data="cadSys"
    x-init="initSys($refs.cad, $refs.distanceInput, $id('materiales'));
    $el.scrollIntoView({ behavior: 'smooth' })">
    <x-cad.modals.new-model/>
    <input id="_token" name="_token" type="hidden" value="{{ csrf_token() }}" />
    <x-cad.layout.toolbar></x-cad.layout.toolbar>
    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
        <x-cad.layout.side-panel></x-cad.layout.side-panel>
        <x-cad.layout.cad-area></x-cad.layout.cad-area>
    </div>
    <x-cad.layout.footer></x-cad.layout.footer>
</div>
