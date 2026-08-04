@pushOnce('initscripts')
    @vite('resources/js/analisis_estructural_de_armaduras.js')
@endPushOnce

<div class="cad-text-color cad-bg cad-border flex h-full flex-col" x-id="['materiales']" x-data="cadSys"
    x-init="initSys($refs.cad, $refs.distanceInput, $id('materiales'));
    $el.scrollIntoView({ behavior: 'smooth' })">
    <x-cad.modals.new-model/>
    <x-cad.modals.my-models-modal/>
    <x-cad.modals.joint-restraints-modal/>
    <x-cad.modals.joint-diaphragms-modal/>
    <x-cad.modals.shell-diaphragms-modal/>
    <x-cad.modals.frame-local-axes-modal/>
    <x-cad.modals.joint-force-modal/>
    <x-cad.modals.frame-point-load-modal/>
    <x-cad.modals.frame-distributed-load-modal/>
    <x-cad.modals.frame-section-modal/>
    <x-cad.modals.slab-section-modal/>
    <x-cad.modals.wall-section-modal/>
    <x-cad.modals.area-uniform-load-modal/>
    <x-cad.modals.frame-releases-modal/>
    <x-cad.modals.frame-end-offsets-modal/>
    <x-cad.modals.joint-mass-modal/>
    <x-cad.modals.group-names-modal/>
    <x-cad.modals.point-springs-modal/>
    <x-cad.modals.import-plan-modal/>
    <x-cad.modals.generate-stories-modal/>
    <x-cad.modals.zapata-results-modal/>
    <!-- Se Agrego el modal de grid -->
    <x-cad.modals.diagonal-grid-modal/>
    <input id="_token" name="_token" type="hidden" value="{{ csrf_token() }}" />
    <x-cad.layout.toolbar></x-cad.layout.toolbar>
    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
        <x-cad.layout.side-panel></x-cad.layout.side-panel>
        <x-cad.layout.cad-area></x-cad.layout.cad-area>
    </div>
    <x-cad.layout.footer></x-cad.layout.footer>
<<<<<<< HEAD

    <x-cad.modals.new-model/>
    <x-cad.modals.set-elevation-view id="elevation-modal"/> 
</div>
=======
</div>
>>>>>>> 4a4f0e8713f895dfa286e9eeb2011a59afccb857
