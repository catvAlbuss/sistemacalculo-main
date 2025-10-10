@php
    $fy = 4200;
    $pt1 = 24 * 0.9;
    $pt2 = 0;
    /*$vu = 11.76; */
    /* $mu = 55.62; */
    // Calcula algunas fórmulas simples con los datos del formulario
    $pm = round($pm / ($l * $t), 2); //
    $fa = round(0.2 * $fm * (1 - pow($h / (35 * $t), 2)), 2);

    $qfm = round($fm * 0.15, 2); // Longitud total centro del claro:
    $al = 0;
    if (($ve * $l) / $me > 1) {
        $al = 1;
    } else {
        $al = round(($ve * $l) / $me, 2);
    }

    /* 4 result */
    $vm = round(0.5 * $vdm * $al * $t * $l + 0.23 * $pg, 2); // Longitud total centro del claro:
    $qvm = round(0.55 * $vm, 2);
    $cond = '';
    if ($qvm > $ve) {
        $cond = 'No agrietado';
    } else {
        $cond = 'Agrietado';
    }
    $max = 0;
    $r1 = 0;
    $r2 = 0;
    if ($vm / $ve > 3) {
        $r1 = 3;
    } else {
        $r1 = round($vm / $ve, 2);
    }
    if ($vm / $ve < 2) {
        $r2 = 2;
    } else {
        $r2 = 0;
    }
    if ($r1 > $r2) {
        $max = round($r1, 2);
    } else {
        $max = round($r2, 2);
    }

    /* 5 result */
    $vu = round($max * $ve, 2);
    $mu = round($max * $me, 2);
    /* 6 result */
    $qqfm = round(0.05 * $fm, 2);
    $text = '';
    if ($pm > $qqfm) {
        $text = 'Refuerzo corrido';
    } else {
        $text = 'Solo mechas';
    }
    $cantB = 0;
    if ($nh == '2 hiladas') {
        $cantB = 5;
    } else {
        $cantB = 4;
    }
    $ph = 0;
    if ($db == '8 mm') {
        $ph = (0.5 * $cantB) / (100 * $t * 100);
    } else {
        $ph = (0.32 * $cantB) / (100 * $t * 100);
    }
    $arm = '';
    if ($ph > 0.001) {
        $arm = 'Ø ' . $db . ' @ ' . $nh;
    } else {
        $arm = 'No cumple';
    }

    /* 7 result */
    $m = round($mu - 0.5 * ($vm * $h), 2);
    $pc = $pg / $nc;
    $f = round($m / $l, 2);
    $ts1 = round(($vm * $lm) / ($l * ($nc - 1)), 2);
    $ts2 = round(($vm * $h) / $l - $pc, 2);
    $ts3 = round($pc - ($vm * $h) / (2 * $l), 2);
    $ts4 = round((1.5 * $vm * $lm) / ($l * ($nc + 1)), 2);
    $ts5 = round(abs($f - $pc - $pt1), 2);
    $ts6 = round($pc + $m + $pt1 + $pt2, 2);

    /* $tso1 = $vm*$lm/($l*($nc+1)); */
    /* 7.1 result */ /* 7.1 scnd table */
    $tso1 = 0;
    if (round(($ts1 * 1000) / (0.2 * $fdc * 0.85), 2) > 15 * $t * 100) {
        $tso1 = round(($ts1 * 1000) / (0.2 * $fdc * 0.85), 2);
    } else {
        $tso1 = 15 * $t * 100;
    }
    $tso2 = round(($ts1 * 1000) / ($fy * 1 * 0.85), 2);
    $tso3 = round(($ts2 * 1000) / ($fy * 0.85), 2);
    $tso4 = $tso2 + $tso3;
    $tso5 = (0.1 * $fdc * $tso1) / $fy;
    $use1 = '';
    if ($tso4 > $tso5) {
        $use1 = 'Usar As';
    } else {
        $use1 = 'Usar 4 Ø 8mm';
    }
    $tso6 = $tso4;

    $tso7 = 0;
    if (round(($ts4 * 1000) / (0.2 * $fdc * 0.85), 2) > 15 * $t * 100) {
        $tso7 = round(($ts4 * 1000) / (0.2 * $fdc * 0.85), 2);
    } else {
        $tso7 = 15 * $t * 100;
    }
    $tso8 = round(($ts4 * 1000) / ($fy * 1 * 0.85), 2);
    $tso9 = round(($ts5 * 1000) / ($fy * 0.85), 2);
    $tso10 = $tso8 + $tso9;
    $tso11 = (0.1 * $fdc * $tso7) / $fy;
    $use2 = '';
    if ($tso10 > $tso11) {
        $use2 = 'Usar As';
    } else {
        $use2 = 'Usar 4 Ø 8mm';
    }
    $tso12 = $tso10;

    /* 7.1 scnd table */
    $tsoo1 = 0.5;
    $tsoo2 = 4;
    $tsoo3 = 5.07 * pow($tsoo1, 2) * $tsoo2;
    $tsoo4 = 'Armado ' . $tsoo2 . ' Ø';
    $tsoo5 = $tsoo1;

    $tsoo6 = 0.5;
    $tsoo7 = 4;
    $tsoo8 = 5.07 * pow($tsoo6, 2) * $tsoo7;
    $tsoo9 = 'Armado ' . $tsoo7 . ' Ø';
    $tsoo10 = $tsoo6;

    /* 7.2 results */
    $tst1 = 15 * $t * 100;
    $tst2 = ($ts3 * 1000) / $pce - $tsoo3 * 4200;
    $tst3 = 0.85 * $dce * $fdc;
    $tst4 = $tsoo3 + $tst2 / $tst3;
    $tst5 = $tso1;
    $tst6 = 15 * $t * 100;
    $tst7 = ($ts6 * 1000) / $pci - $tsoo8 * 4200;
    $tst8 = 0.85 * $dci * $fdc;
    $tst9 = $tsoo8 + $tst7 / $tst8;
    $tst10 = $tso7;

    /* 7.3 values */
    $tstr1e = 0.58;
    $tstr2e = 7.16;
    $tstr3e = 12.89;
    $tstr4e = 10;
    $tstr5e = 6;

    $tstr1i = '0.58 cm2  = 6mm @';
    $tstr2i = 0.58;
    $tstr3i = 5.32;
    $tstr4i = 10;
    $tstr5i = 5;

    /* 8 values */
    $ts = ($vm * $l) / (2 * $l);
    $as = ($ts * 1000) / (0.9 * $fy);
    $peralte = 20;
    $barten = $as / (5.07 * pow($diameter, 2));
    $barfin = 4;

@endphp
<div class="overflow-x-auto">
    <table id="" class="min-w-full text-gray-800 dark:text-white">
        <!-- Requisitos de diseño vigas -->
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">1.- Requisitos de diseño</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col">Formula</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Descripción</td>
                <td class='py-2 px-4 text-center'>Des</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2"> {{ $desc }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Ubicación del diseño</td>
                <td class='py-2 px-4 text-center'>Ubic.</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $ubi }} </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Resistencia a la Compresión de la Albañilería</td>
                <td class='py-2 px-4 text-center'>F'm</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $fm }} Tn/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Longitud</td>
                <td class='py-2 px-4 text-center'>L</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $l }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Espesor </td>
                <td class='py-2 px-4 text-center'>t</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $t }} m</td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'> Altura</td>
                <td class='py-2 px-4 text-center'>h</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $h }} m</td>
            </tr>

            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">1.2.- Cargas y combinaciones para el diseño</td>
            </tr>

            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Carga de gravedad máxima</td>
                <td class='py-2 px-4 text-center'>Pm</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pm_e }} </td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Carga de gravedad</td>
                <td class='py-2 px-4 text-center'>Pg</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pg }} </td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Fuerza cortante producida por sismo moderado</td>
                <td class='py-2 px-4 text-center'>Ve</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $ve }} </td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Momento flector en el muro generado por sismo moderado</td>
                <td class='py-2 px-4 text-center'>Me</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2"> {{ $me }}</td>

            </tr>

            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">1.3.- Verificacion del agrietamiento en los muros
                    </td>
            </tr>

            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'> Resistencia característica corte de la albañileríao</td>
                <td class='py-2 px-4 text-center'>V'm</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $vdm }} m</td>

            </tr>

            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">1.4.- Verificacion de la necesidad de colocar
                    refuerzo horizontal</td>
            </tr>

            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Número de hilada</td>
                <td class='py-2 px-4 text-center'>Hiladas</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $nh }} Hiladas</td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Dimensión de barras</td>
                <td class='py-2 px-4 text-center'>Barras</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $db }}</td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Número de columnas de confinamiento</td>
                <td class='py-2 px-4 text-center'>Nc</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $nc }} </td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Resistencia característica corte de la albañilería
                </td>
                <td class='py-2 px-4 text-center'>F'c</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $fdc }} Kg/cm<sup>2</sup></td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>1/4 pg muro perdendicular*</td>
                <td class='py-2 px-4 text-center'>Pt1</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pt1_e }} </td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>1/4 pg muro perdendicular</td>
                <td class='py-2 px-4 text-center'>Pt2</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pt2 }}</td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Longitud del paño mayor a 0.5L</td>
                <td class='py-2 px-4 text-center'>Lm</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lm }}m</td>
            </tr>

            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">1.5.- Determinacion de la seccion de concreto
                    de la columna de confinamiento</td>
            </tr>

            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Ø Columna Exterior</td>
                <td class='py-2 px-4 text-center'>Ø Col. Ext.</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pce }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Ø Columna Interior</td>
                <td class='py-2 px-4 text-center'>Ø Col. Int.</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pci }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>δ Columna Exterior</td>
                <td class='py-2 px-4 text-center'>δ Col. Ext.</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $dce }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>δ Columna Interior</td>
                <td class='py-2 px-4 text-center'>δ Col. Int.</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $dci }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Peralte Col. Ext.</td>
                <td class='py-2 px-4 text-center'>PCE</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pcex }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Peralte Col. Int.</td>
                <td class='py-2 px-4 text-center'>PCI</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pcin }}</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">1.6.- Determinación de la sección de concreto
                    de la columna de confinamiento </td>
            </tr>

            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Diámetro </td>
                <td class='py-2 px-4 text-center'>D</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $diameter }}</td>
            </tr>
        </tbody>

        {{-- Cargas y combinacion para el diseño --}}
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">2.- Cargas y combinacion para el diseño</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col">Formula</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Pm </td>
                <td class='py-2 px-4 text-center'>D + L</td>
                <td class='py-2 px-4 text-center' colspan="2">27.82</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'> Carga de servicio (mas sobrecarga reducida) </td>
                <td class='py-2 px-4 text-center'>Pg </td>
                <td class='py-2 px-4 text-center'>D + 0.25l</td>
                <td class='py-2 px-4 text-center' colspan="2">23.72</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'> Fuerza cortante producida por sismo moderado </td>
                <td class='py-2 px-4 text-center'>Ve</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">3.92</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Momento flector en el muro generado por sismo moderado</td>
                <td class='py-2 px-4 text-center'>Me</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">18.54</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'> Fuerza cortante producida por sismo severo</td>
                <td class='py-2 px-4 text-center'>Vu </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $vu }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Momento flector en el muro generado por el sismo severo</td>
                <td class='py-2 px-4 text-center'>Mu</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $mu }}</td>
            </tr>
        </tbody>

        {{-- Verificacion por cargs verticales --}}
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">3.- Verificacion por cargas verticales</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col">Formula</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo Axial Máximo</td>
                <td class='py-2 px-4 text-center'>σm </td>
                <td class='py-2 px-4 text-center'> Pm/ (L * t), 2</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pm }} Tn/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo Admisible por Carga Vertical</td>
                <td class='py-2 px-4 text-center'>Fa </td>
                <td class='py-2 px-4 text-center'>0.2 * f'm * (1 - ( h / (35 * t)<sup>2</sup>, 2))</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $fa }} Tn/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Área tributaria - nudo exterior</td>
                <td class='py-2 px-4 text-center'>f'm</td>
                <td class='py-2 px-4 text-center'>f'm * 0.15, 2</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $qfm }} Tn/m<sup>2</sup></td>
            </tr>
        </tbody>

        {{-- Verificacion del agrietamiento en el muro --}}
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">4.- Verificación del agrietamiento en los muros
                    <br>(El muro debera agritarse ante la accion de sismos moderados, deberá comprobarse la relacion
                    siguiente)
                </th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col">Formula</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Resistencia característica corte de la albañilería</td>
                <td class='py-2 px-4 text-center'>Vm </td>
                <td class='py-2 px-4 text-center'> 0.5 * V'm * α * t * L + 0.23 * Pg</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $vm }} Tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>α</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2"> {{ $al }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Fuerza cortante asociada al agrietamiento diagonal</td>
                <td class='py-2 px-4 text-center'>V'm</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $vdm }} Tn/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Vm</td>
                <td class='py-2 px-4 text-center'>0.55 * Vm</td>
                <td class='py-2 px-4 text-center' colspan="2"> {{ $qvm }} Tn</td>
            </tr>

            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Fuerza cortante producida por sismo moderado</td>
                <td class='py-2 px-4 text-center'>Ve</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">Ve = {{ $ve }} </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Condición</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>---</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $cond }}</td>
            </tr>
        </tbody>

        {{-- Obtencion del cortante y momento por el sismo severo --}}
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">5.- Obtención del cortante y momentos por el
                    sismo severo</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col">Formula</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Vu </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $vu }} Tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Mu </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $mu }} Tn-m</td>
            </tr>
        </tbody>

        {{-- Veificacion  de la necesidad de colocar refuerzo horizontal --}}
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">6.- Verificacion de la necesidad de colocar
                    refuerzo horiozntal</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col">Formula</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Vu </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $vu }} Tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Resistencia característica corte de la albañilería</td>
                <td class='py-2 px-4 text-center'>Vm </td>
                <td class='py-2 px-4 text-center'>round(0.5 * V'm * α * t * L + 0.23 * Pg, 2)</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $vm . ' Tn' }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo Axial Máximo</td>
                <td class='py-2 px-4 text-center'>σm </td>
                <td class='py-2 px-4 text-center'>round(Pm/ (L * t), 2);</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pm . ' Tn/m ' }}<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>f'm </td>
                <td class='py-2 px-4 text-center'>0.05 * f'm </td>
                <td class='py-2 px-4 text-center' colspan="2"> {{ $qqfm . ' Tn/m' }}<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>La cuantía mínima a ser considerada es: </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'><span>ρAs/(s.t)≥0.001</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $text }}</td>
            </tr>

            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Distribución del acero de refuerzo horizontal en el muro:</td>
                <td class='py-2 px-4 text-center'> </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">ph = 0.0019230769230769</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>N Hiladas</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $nh }}</td>

            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>barra</td>
                <td class='py-2 px-4 text-center'> </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $db }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'> N barras</td>
                <td class='py-2 px-4 text-center'> </td>
                <td class='py-2 px-4 text-center'>---</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $cantB }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Armado</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>---</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $arm }}</td>
            </tr>
        </tbody>

        {{-- Diseño de las columnas de confinamiento --}}
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">7.- Diseño de las columnas de confinamiento
                </th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col">Formula</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Mu </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $mu }} Tn-m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>M </td>
                <td class='py-2 px-4 text-center'>Mu - 0.5 * (Vm * h)</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $m }} Tn-m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Fuerza axial en las columnas extremas producidas por "M"</td>
                <td class='py-2 px-4 text-center'>F</td>
                <td class='py-2 px-4 text-center'>M / L</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $f }} Tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Número de columnas de confinamiento</td>
                <td class='py-2 px-4 text-center'>Nc </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $nc }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Lm </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lm }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Resistencia característica corte de la albañilería</td>
                <td class='py-2 px-4 text-center'>F'c</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $fdc }} Kg/cm<sub>2</sub></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo de fluencia del acero</td>
                <td class='py-2 px-4 text-center'>Fy </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $fy }} Kg/cm<sub>2</sub></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Pc</td>
                <td class='py-2 px-4 text-center'>Pg / Nc</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pc }} Tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Vm</td>
                <td class='py-2 px-4 text-center'>0.5 * V'm * α * t * L + 0.23 * Pg</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $vm }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Pt1</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pt1 }} 1/4 pg muro</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>L </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $l }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Pt2</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pt2 }} 1/4 pg muro</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>H </td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $h }}</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <td class='py-2 px-8'>Descripción</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>Col. Exterior</td>
                <td class='py-2 px-4 text-center'>Col. Interior</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>cortante</td>
                <td class='py-2 px-4 text-center'>Vc</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $ts1 }}</td>
                <td class='py-2 px-4 text-center'>{{ $ts2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Tracción</td>
                <td class='py-2 px-4 text-center'>T</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $ts2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $ts5 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Compresión</td>
                <td class='py-2 px-4 text-center'>C</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $ts3 }}</td>
                <td class='py-2 px-4 text-center'>{{ $ts6 }}</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">7.1.- Diseño por corte fricción y tracción
                    combinada</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Resistencia característica corte de la albañilería</td>
                <td class='py-2 px-4 text-center'>F'c</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $fdc }} Kg/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo de fluencia del acero</td>
                <td class='py-2 px-4 text-center'>Fy</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $fy }} Kg/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <td class='py-2 px-8'>Descripción</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>Col. Exterior</td>
                <td class='py-2 px-4 text-center'>Col. Interior</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Acf</td>
                <td class='py-2 px-4 text-center'>Vc/(0.2 * F'c * 0.85) >= Ac >= 15 * t</td>
                <td class='py-2 px-4 text-center'>{{ $tso1 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tso7 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Asf</td>
                <td class='py-2 px-4 text-center'>Acf * 1000 / (Fy * 1 * 0.85)</td>
                <td class='py-2 px-4 text-center'>{{ $tso2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tso8 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Ast</td>
                <td class='py-2 px-4 text-center'>Asf * 1000 / (Fy * 0.85)</td>
                <td class='py-2 px-4 text-center'>{{ $tso3 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tso9 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>As</td>
                <td class='py-2 px-4 text-center'>Asf + Ast</td>
                <td class='py-2 px-4 text-center'>{{ $tso4 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tso10 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>0.1*F'c*Ac/Fy</td>
                <td class='py-2 px-4 text-center'>{{ $tso5 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tso11 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Comparación</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $use1 }}</td>
                <td class='py-2 px-4 text-center'>{{ $use2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Final</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>Asf + Ast</td>
                <td class='py-2 px-4 text-center'>{{ $tso6 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tso12 }}</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <td class='py-2 px-8'>Descripción</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>Col. Exterior</td>
                <td class='py-2 px-4 text-center'>Col. Interior</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Barras</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tsoo1 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tsoo6 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Número</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tsoo2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tsoo7 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>As colocado</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tsoo3 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tsoo8 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Armado</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tsoo4 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tsoo9 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Final</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tsoo5 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tsoo10 }}</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">7.2 Determinación de la Sección de Concreto de
                    la Columna de Confinamiento</th>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <td class='py-2 px-8'>Descripción</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>Col. Exterior</td>
                <td class='py-2 px-4 text-center'>Col. Interior</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Ø</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $pce }}</td>
                <td class='py-2 px-4 text-center'>{{ $pci }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>δ</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $dce }}</td>
                <td class='py-2 px-4 text-center'>{{ $dci }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>15 x t * 100</td>
                <td class='py-2 px-4 text-center'>{{ $tst1 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tst6 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>C/Ø-Asfy</td>
                <td class='py-2 px-4 text-center'>{{ $tst1 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tst6 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>0.85*δ*fc</td>
                <td class='py-2 px-4 text-center'>{{ $tst3 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tst8 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>An</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tst4 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tst9 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Acf</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tst5 }}</td>
                <td class='py-2 px-4 text-center'>{{ $tst10 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Peralte de columna Exterior</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pcex }} </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Peralte de columna Interior</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pcin }} </td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">7.3 Determinación de los Estribos de
                    Confinamiento</th>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <td class='py-2 px-8'>Descripción</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>Col. Exterior</td>
                <td class='py-2 px-4 text-center'>Col. Interior</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>S1</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tstr1e }}</td>
                <td class='py-2 px-4 text-center'>{{ $tstr1i }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>S2</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tstr2e }}</td>
                <td class='py-2 px-4 text-center'>{{ $tstr2i }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>S3</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tstr3e }}</td>
                <td class='py-2 px-4 text-center'>{{ $tstr3i }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>S4</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tstr4e }}</td>
                <td class='py-2 px-4 text-center'>{{ $tstr4i }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>S</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>{{ $tstr5e }}</td>
                <td class='py-2 px-4 text-center'>{{ $tstr5i }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Av. col. exterior</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">s [ ] 0.58 cm2 = 6mm @ : 1 @ 5, 7.5 @ 6, Rto. @ 25
                </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Av. col. exterior</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">s [ ] 0.58 cm2 = 6mm @ : 1 @ 5, 9 @ 5, Rto. @ 25</td>
            </tr>
        </tbody>

        {{-- Diseño de las vigas de confinamiento --}}
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="6">7.1.- Diseño de las vigas de confinamiento</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col">Formula</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>Ts</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $ts }} Tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center'>As</td>
                <td class='py-2 px-4 text-center'>T * 1000 / (0.9 * Fy)</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $as }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Peralte</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo $peralte; ?>Tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Diámetro</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo $diameter; ?></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Barras Tentativas</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>----</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo $barten; ?> </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Barras finales</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo $barfin; ?> </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>As viga</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2"> <?php echo $barfin . ' Ø' . $diameter; ?></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Av viga</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo ' [ ] 6mm: 1 @ 5, 4 @ 10, Rto @ 25'; ?></td>
            </tr>
        </tbody>
    </table>
</div>
