<!-- Side Panel -->
<aside class="cad-bg cad-border flex h-full basis-1/4 flex-col border-r-4">
    <x-cad.panel title="Items" init="isOpen = false">
        <ul>
            <li x-data="{ open: false }">
                <div class="collapsible m-1 flex items-center rounded-sm p-2 text-xs hover:bg-gray-300">
                    <svg class="collapse-icon h-4 w-4 transition-transform duration-200" @click="open = ! open"
                        :class="open ? '' : '-rotate-90'" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
                    </svg>
                    <span>Materiales</span>
                    <button>+</button>
                </div>
                <ul class="ml-4 mr-1 mt-2 text-xs" x-show="open" x-transition>
                    <template x-for="material in materiales">
                        <li class="rounded-md px-2 py-1 hover:bg-gray-300"
                            x-text="`Material ${material.id} E: ${material.E} A: ${material.A}`">
                        </li>
                    </template>
                </ul>
            </li>
        </ul>
        <ul>
            <li x-data="{ open: false }">
                <div class="collapsible m-1 flex items-center rounded-sm p-2 text-xs hover:bg-gray-300"
                    @click="open = ! open">
                    <svg class="collapse-icon h-4 w-4 transition-transform duration-200"
                        :class="open ? '' : '-rotate-90'" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
                    </svg>
                    <span>Nodos</span>
                </div>
                <ul class="ml-4 mr-1 mt-2 text-xs" x-show="open" x-transition>
                    <template x-for="node in nodes">
                        <li class="rounded-md px-2 py-1 hover:bg-gray-300" x-text="`NODO ${node.id}`"
                            @mouseover="node.style.hover()" @mouseout="node.style.default()"></li>
                    </template>
                </ul>
            </li>
        </ul>
        <ul>
            <li x-data="{ open: false }">
                <div class="collapsible m-1 flex items-center rounded-sm p-2 text-xs hover:bg-gray-300"
                    @click="open = ! open">
                    <svg class="collapse-icon h-4 w-4 transition-transform duration-200"
                        :class="open ? '' : '-rotate-90'" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
                    </svg>
                    <span>Barras</span>
                </div>
                <ul class="ml-4 mr-1 mt-2 text-xs" x-show="open" x-transition>
                    <template x-for="barra in shapes">
                        <li class="rounded-md px-2 py-1 hover:bg-gray-300" x-text="`BARRA ${barra.id}`"
                            @mouseover="barra.style.hover()" @mouseout="barra.style.default()"></li>
                    </template>
                </ul>
            </li>
        </ul>
    </x-cad.panel>
    <x-cad.panel title="Propiedades" init="isOpen = true">
        <template x-if="currentState === moveObjectState">
            <div class="flex flex-col gap-2 p-2">
                <x-cad.input-properties label="ID" bind="moveObjectState.selectedObject.id" handleInput=""
                    disabled="true"></x-cad.input-properties>
                <x-cad.panel-properties title="Posición">
                    <x-cad.input-properties label="X" bind="moveObjectState.selectedObject.position.x"
                        handleInput=""></x-cad.input-properties>
                    <x-cad.input-properties label="Y" bind="moveObjectState.selectedObject.position.y"
                        handleInput=""></x-cad.input-properties>
                </x-cad.panel-properties>
                <x-cad.panel-properties title="Fuerza">
                    <x-cad.load-select bind="moveObjectState.currentLoad"></x-cad.load-select>
                    <x-cad.input-properties label="Multiplicador"
                        bind="moveObjectState.selectedObject.force.loads[moveObjectState.currentLoad].multiplier"
                        handleInput=""></x-cad.input-properties>
                    <x-cad.input-properties label="Fx" bind="moveObjectState.nodeX"
                        handleInput=""></x-cad.input-properties>
                    <x-cad.input-properties label="Fy" bind="moveObjectState.nodeY"
                        handleInput=""></x-cad.input-properties>
                </x-cad.panel-properties>
                <x-cad.panel-properties title="Soporte">
                    <div class="flex flex-row justify-between">
                        <x-cad.ribbon-button clickHandler="moveObjectState.selectedObject.soporte = ''"
                            toggle="moveObjectState.selectedObject.soporte === ''"
                            label=""><x-cad.svg.sinsoporte></x-cad.svg.sinsoporte></x-cad.ribbon-button>
                        <x-cad.ribbon-button clickHandler="moveObjectState.selectedObject.soporte = 'soporteUno'"
                            toggle="moveObjectState.selectedObject.soporte === 'soporteUno'"
                            label=""><x-cad.svg.soporte1></x-cad.svg.soporte1></x-cad.ribbon-button>
                        <x-cad.ribbon-button clickHandler="moveObjectState.selectedObject.soporte = 'soporteDos'"
                            toggle="moveObjectState.selectedObject.soporte === 'soporteDos'"
                            label=""><x-cad.svg.soporte2></x-cad.svg.soporte2></x-cad.ribbon-button>
                        <x-cad.ribbon-button clickHandler="moveObjectState.selectedObject.soporte = 'soporteTres'"
                            toggle="moveObjectState.selectedObject.soporte === 'soporteTres'"
                            label=""><x-cad.svg.soporte3></x-cad.svg.soporte3></x-cad.ribbon-button>
                    </div>
                </x-cad.panel-properties>
            </div>
        </template>
        <template x-if="currentState === selectedNodesState">
            <div class="flex flex-col gap-2 p-2" x-data="{ fx: undefined, fy: undefined, selected: null }">
                <x-cad.panel-properties title="Fuerza">
                    <x-cad.input-properties label="Fx" bind="fx"
                        handleInput="currentState.selectedObjects.forEach((n) => {
                                      n.force.x = fx;
                                  })"></x-cad.input-properties>
                    <x-cad.input-properties label="Fy" bind="fy"
                        handleInput="currentState.selectedObjects.forEach((n) => {
                                  n.force.y = fy;
                              })"></x-cad.input-properties>
                </x-cad.panel-properties>
                <x-cad.panel-properties title="Soporte">
                    <div class="row flex">
                        <x-cad.ribbon-button
                            clickHandler="currentState.selectedObjects.forEach((n) => {
                                      n.soporte = '';
                                  });selected = ''"
                            toggle="selected === ''"
                            label=""><x-cad.svg.sinsoporte></x-cad.svg.sinsoporte></x-cad.ribbon-button>
                        <x-cad.ribbon-button
                            clickHandler="currentState.selectedObjects.forEach((n) => {
                                      n.soporte = 'soporteUno';
                                  });selected = 'soporteUno'"
                            toggle="selected === 'soporteUno'"
                            label=""><x-cad.svg.soporte1></x-cad.svg.soporte1></x-cad.ribbon-button>
                        <x-cad.ribbon-button
                            clickHandler="currentState.selectedObjects.forEach((n) => {
                                      n.soporte = 'soporteDos';
                                  });selected = 'soporteDos'"
                            toggle="selected === 'soporteDos'"
                            label=""><x-cad.svg.soporte2></x-cad.svg.soporte2></x-cad.ribbon-button>
                        <x-cad.ribbon-button
                            clickHandler="currentState.selectedObjects.forEach((n) => {
                                      n.soporte = 'soporteTres';
                                  });selected = 'soporteTres'"
                            toggle="selected === 'soporteTres'"
                            label=""><x-cad.svg.soporte3></x-cad.svg.soporte3></x-cad.ribbon-button>
                    </div>
                </x-cad.panel-properties>
            </div>
        </template>
        <template x-if="currentState === selectedBeamsState && selectedBeamsState.selectedObjects.length > 1">
            <div class="p-2" x-data="{
                E: undefined,
                A: undefined
            }">
                <x-cad.panel-properties title="Material">
                    <x-cad.input-properties label="Modulo Elástico" bind="E"
                        handleInput="currentState.selectedObjects.forEach((b) => {
                          b.E = E;
                      })"></x-cad.input-properties>
                    <x-cad.seccion-select bind="A"
                        handleInput="currentState.selectedObjects.forEach((b) => {
                        b.A = A;
                    })"></x-cad.seccion-select>
                    <x-cad.input-properties label="Área de la sección" bind="currentState.selectedObjects[0].A"
                        handleInput="" disabled="true"></x-cad.input-properties>
                </x-cad.panel-properties>
            </div>
        </template>
        <template x-if="currentState === selectedBeamsState && selectedBeamsState.selectedObjects.length === 1">
            <div class="p-2">
                <x-cad.input-properties label="ID" bind="selectedBeamsState.selectedObjects[0].id" handleInput=""
                    disabled="true"></x-cad.input-properties>
                <x-cad.panel-properties title="Material">
                    <x-cad.input-properties label="Modulo Elástico" bind="selectedBeamsState.selectedObjects[0].E"
                        handleInput=""></x-cad.input-properties>
                    <x-cad.seccion-select bind="selectedBeamsState.selectedObjects[0].A"
                        handleInput=""></x-cad.seccion-select>
                    <x-cad.input-properties label="Área de la sección" bind="selectedBeamsState.selectedObjects[0].A"
                        handleInput="" disabled="true"></x-cad.input-properties>
                </x-cad.panel-properties>
            </div>
        </template>
        <template
            x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects[0] instanceof Arco">
            <div class="p-2">
                <x-cad.panel-properties title="Parametros">
                    <x-cad.input-properties label="Longitud"
                        bind="selectedParametricState.selectedObjects[0].longitud"
                        handleInput="selectedParametricState.selectedObjects[0].build()"></x-cad.input-properties>
                    <x-cad.input-properties label="Flecha" bind="selectedParametricState.selectedObjects[0].flecha"
                        handleInput="selectedParametricState.selectedObjects[0].build()"></x-cad.input-properties>
                    <x-cad.input-properties label="Dovela" bind="selectedParametricState.selectedObjects[0].dovela"
                        handleInput="selectedParametricState.selectedObjects[0].build()" minimun="0.001"
                        step="0.1"></x-cad.input-properties>
                    <x-cad.input-properties label="Peralte" step="0.1"
                        bind="selectedParametricState.selectedObjects[0].peralte"
                        handleInput="selectedParametricState.selectedObjects[0].build()"></x-cad.input-properties>
                    <x-cad.load-select bind="selectedParametricState.currentLoad"></x-cad.load-select>
                    <x-cad.input-properties label="Multiplicador"
                        bind="selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].multiplier"
                        handleInput="selectedParametricState.selectedObjects[0].changeMultiplier(selectedParametricState.currentLoad)"></x-cad.input-properties>
                    <x-cad.input-properties label="#Fuerzas"
                        bind="selectedParametricState.selectedObjects[0].forceAmount"
                        handleInput="selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)"
                        minimun="0"></x-cad.input-properties>
                    <x-cad.input-properties label="Fx"
                        bind="selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fx"
                        handleInput="selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)"></x-cad.input-properties>
                    <x-cad.input-properties label="Fy"
                        bind="selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fy"
                        handleInput="selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)"></x-cad.input-properties>
                    <div class="flex-row">
                        <x-primary-button
                            @click="addToScene(selectedParametricState.selectedObjects[0])">Añadir</x-primary-button>
                        <x-secondary-button
                            @click="setState(editParametricState,{editingParametric: selectedParametricState.selectedObjects[0]})">Editar</x-secondary-button>
                    </div>
                </x-cad.panel-properties>
            </div>
        </template>
        <template
            x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects[0] instanceof Puente">
            <div class="p-2">
                <x-cad.panel-properties title="Parametros">
                    <x-cad.input-properties label="Alto" bind="selectedParametricState.selectedObjects[0].width"
                        handleInput="selectedParametricState.selectedObjects[0].build()"></x-cad.input-properties>
                    <x-cad.input-properties label="Anchó" bind="selectedParametricState.selectedObjects[0].height"
                        handleInput="selectedParametricState.selectedObjects[0].build()"></x-cad.input-properties>
                    <x-cad.input-properties label="Peralte" bind="selectedParametricState.selectedObjects[0].peralte"
                        handleInput="selectedParametricState.selectedObjects[0].build()"></x-cad.input-properties>
                    <x-cad.input-properties label="Dovela" bind="selectedParametricState.selectedObjects[0].dovela"
                        handleInput="selectedParametricState.selectedObjects[0].build()"></x-cad.input-properties>
                    <x-primary-button
                        @click="addToScene(selectedParametricState.selectedObjects[0])">Añadir</x-primary-button>
                </x-cad.panel-properties>
            </div>
        </template>
        <template
            x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects[0] instanceof Triangle">
            <div class="p-2">
                <x-cad.panel-properties title="Parametros">
                    <x-cad.input-properties label="Altura" bind="selectedParametricState.selectedObjects[0].altura"
                        handleInput="selectedParametricState.selectedObjects[0].build()"></x-cad.input-properties>
                    <x-cad.input-properties label="Base" bind="selectedParametricState.selectedObjects[0].base"
                        handleInput="selectedParametricState.selectedObjects[0].build()"></x-cad.input-properties>
                    <x-primary-button
                        @click="addToScene(selectedParametricState.selectedObjects[0])">Añadir</x-primary-button>
                </x-cad.panel-properties>
            </div>
        </template>
        <template x-if="currentState === editParametricState && currentState.editing">
            <div class="p-2">
                <x-cad.panel-properties title="Material">
                    <x-cad.input-properties label="Modulo Elástico" bind="currentState.editing[0].E"
                        handleInput="currentState.editing.forEach((b) => {
                          b.E = currentState.editing[0].E;
                      })"></x-cad.input-properties>
                    {{-- <x-cad.input-properties label="Área de la sección" bind="currentState.editing[0].A"
              handleInput="currentState.editing.forEach((b) => {
                          b.A = A;
                      })"></x-cad.input-properties> --}}
                    <x-cad.seccion-select bind="currentState.editing[0].A"
                        handleInput="currentState.editing.forEach(function (b) {b.A = currentState.editing[0].A;})"></x-cad.seccion-select>
                    <x-cad.input-properties label="Área de la Sección" bind="currentState.editing[0].A"
                        handleInput="" disabled="true"></x-cad.input-properties>
                </x-cad.panel-properties>
            </div>
        </template>
    </x-cad.panel>
</aside>
