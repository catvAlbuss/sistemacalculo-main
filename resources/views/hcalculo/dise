@php
    $inputs = [];
@endphp

@pushOnce('initscripts')
    @vite('resources/js/diseno_acero_data.js')
@endPushOnce

<x-calc-layout title="Diseño En Acero | Compresion">
    <div class="container mx-auto flex flex-row flex-wrap space-x-4 py-12 md:flex-nowrap" x-data="diseño_acero">
        <x-input-data>
            <x-input-calc symbol="ΩC" bind="calcs.compresionOmegac"></x-input-calc>
            <x-input-calc bind="calcs.compresionPhic" symbol="∅C"></x-input-calc>
            <x-input-calc unit="Kg/cm2" symbol="Fy" bind="calcs.compresionFy"></x-input-calc>
            <x-input-calc bind="calcs.compresionE" unit="Kg/cm2" symbol="E"></x-input-calc>
            <x-input-calc bind="calcs.compresionA" symbol="A" unit="cm2"></x-input-calc>
            <x-input-calc bind="calcs.compresionKy" symbol="Ky"></x-input-calc>
            <x-input-calc bind="calcs.compresionLy" symbol="Ly" unit="cm"></x-input-calc>
            <x-input-calc bind="calcs.compresionRy" symbol="ry" unit="cm"></x-input-calc>
            <x-input-calc symbol="Kx" bind="calcs.compresionKx"></x-input-calc>
            <x-input-calc symbol="Lx" bind="calcs.compresionLx" unit="cm"></x-input-calc>
            <x-input-calc symbol="rx" bind="calcs.compresionRx" unit="cm"></x-input-calc>
        </x-input-data>
        <x-output-data>
            <x-table-result-input title="1.- Prerequisitos del Diseño">
                <x-output-calc-input symbol="ΩC" bind="calcs.compresionOmegac"></x-output-calc-input>
                <x-output-calc-input bind="calcs.compresionPhic" symbol="∅C"></x-output-calc-input>
                <x-output-calc-input unit="Kg/cm2" symbol="Fy" bind="calcs.compresionFy"></x-output-calc-input>
                <x-output-calc-input bind="calcs.compresionE" unit="Kg/cm2" symbol="E"></x-output-calc-input>
                <x-output-calc-input bind="calcs.compresionA" symbol="A" unit="cm2"></x-output-calc-input>
                <x-output-calc-input bind="calcs.compresionKy" symbol="Ky"></x-output-calc-input>
                <x-output-calc-input bind="calcs.compresionLy" symbol="Ly" unit="cm"></x-output-calc-input>
                <x-output-calc-input bind="calcs.compresionRy" symbol="ry" unit="cm"></x-output-calc-input>
                <x-output-calc-input bind="calcs.compresionKlRy" symbol="KL/ry"></x-output-calc-input>
                <x-output-calc-input symbol="Kx" bind="calcs.compresionKx"></x-output-calc-input>
                <x-output-calc-input symbol="Lx" bind="calcs.compresionLx" unit="cm"></x-output-calc-input>
                <x-output-calc-input symbol="rx" bind="calcs.compresionRx" unit="cm"></x-output-calc-input>
                <x-output-calc-input symbol="KL/rx" bind="calcs.compresionKlRx"></x-output-calc-input>
            </x-table-result-input>
            <x-table-result title="2.- Compresión">
                <x-output-calc formula="$$4.71\sqrt{\frac{E}{F_y}}$$" bind="calcs.compresionEfy"></x-output-calc>
                <x-output-calc symbol="KL/ry" bind="calcs.compresionKlRyMenorMayor"></x-output-calc>
                <x-output-calc symbol="$$Fe_y$$" bind="calcs.compresionFey" unit="Kg/cm2"></x-output-calc>
                <x-output-calc symbol="$$Fcr_y$$" bind="calcs.compresionFcry" unit="Kg/cm2"></x-output-calc>
                <x-output-calc symbol="$$Fe_x$$" bind="calcs.compresionFex" unit="Kg/cm2"></x-output-calc>
                <x-output-calc symbol="$$Fcr_x$$" bind="calcs.compresionFcrx" unit="Kg/cm2"></x-output-calc>
            </x-table-result>
            <x-table-result title="3.- Metodo LFRD">
                <x-output-calc formula="$$\phi F_{\text{cr}_y} A_g$$" symbol="$$\phi P_{n_y}$$"
                    bind="calcs.compresionLFRDFcrAgy" unit="Kg"></x-output-calc>
                <x-output-calc formula="$$\phi F_{\text{cr}_y} A_g$$" symbol="$$\phi P_{n_y}$$"
                    bind="calcs.compresionLFRDFcrAg1000y" unit="Tn"></x-output-calc>
                <x-output-calc formula="$$\phi F_{\text{cr}_x} A_g$$" symbol="$$\phi P_{n_x}$$"
                    bind="calcs.compresionLFRDFcrAgx" unit="Kg"></x-output-calc>
                <x-output-calc formula="$$\phi F_{\text{cr}_x} A_g$$" symbol="$$\phi P_{n_x}$$"
                    bind="calcs.compresionLFRDFcrAg1000x" unit="Tn"></x-output-calc>
            </x-table-result>
            <x-table-result title="4.- Metodo ASD">
                <x-output-calc formula="$$\frac{P_{n_y}}{\Omega t}$$" bind="calcs.compresionASDPnOmegaTy"
                    unit="Kg"></x-output-calc>
                <x-output-calc formula="$$\frac{P_{n_y}}{\Omega t}$$" bind="calcs.compresionASDPnOmegaT1000y"
                    unit="Tn"></x-output-calc>
                <x-output-calc formula="$$\frac{P_{n_x}}{\Omega t}$$" bind="calcs.compresionASDPnOmegaTx"
                    unit="Kg"></x-output-calc>
                <x-output-calc formula="$$\frac{P_{n_x}}{\Omega t}$$" bind="calcs.compresionASDPnOmegaT1000x"
                    unit="Tn"></x-output-calc>
            </x-table-result>
        </x-output-data>
    </div>
</x-calc-layout>
