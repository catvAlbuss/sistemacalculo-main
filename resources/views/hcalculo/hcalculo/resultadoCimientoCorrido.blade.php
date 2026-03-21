@php
$ld1 = round($columna * 0.075 * $fy / pow($fc, 0.5), 2);
$ld2 = round(0.0044 * $fy * $columna, 2);
$r = $re;
$H = round(max($ld1, $ld2) + $r, 0);
//calculo de cargas
$calccua = 01.40 + 1.70;
$ultCM = 1.40;
$ultCV = 1.70;
$cu = $CM * $ultCM + $CV * $ultCV;
$on = round($esadterr * 10 - $pdcimt * $yprom - $sc, 2, PHP_ROUND_HALF_UP);
$Acim = round($cu / 1000 / $on, 2, PHP_ROUND_HALF_UP);

$B = round($Acim, 2, PHP_ROUND_HALF_UP);
$H2 = ($B * 100) + 2;

//verificacion
$qu = round(($cu / 1000) / ($b / 100), 2);
$Lv = round((($b / 100) - $esmuro) / 2 + ($esmuro / 2) / 2, 2);
$HVer = $H2 / 100;
$Verificacion = "";
if ($HVer < $Lv) { $Verificacion="<" ; } else { $Verificacion=">" ; } $VerFinal="" ; if ($HVer> $Lv) {
    $VerFinal = "Usar V Max";
    } else {
    $VerFinal = "Usar la distancia efectiva Lv-h";
    }

    $VuaTN = round($qu * $Lv * 1, 2, PHP_ROUND_HALF_UP);;
    $VuTN = round(($conCiclo * 0.53 * pow($fc, 0.5) * (1 * 100) * $H2) / 1000, 2, PHP_ROUND_HALF_UP);
    $ccmcca = "";
    if ($VuaTN < $VuTN) { $ccmcca="Cumple" ; } else { $ccmcca="Aumentar Altura" ; } $verh2=$H2 / 2; $verh2Div=$verh2 / 100; $verfCortPunzo="" ; if ($verh2Div> $Lv) {
        $verfCortPunzo = "No Aplica";
        } else {
        $verfCortPunzo = "Verificar por punzonamiento a H/2";
        }

        $acero = "";
        if ($columna == 0.60) {
        $acero = "6 mm";
        } else if ($columna == 0.80) {
        $acero = "8 mm";
        } else if ($columna == 0.95) {
        $acero = "3/8'";
        } else if ($columna == 1.20) {
        $acero = "12 mm";
        } else if ($columna == 1.27) {
        $acero = "1/2";
        } else if ($columna == 1.59) {
        $acero = "5/8";
        } else if ($columna == 1.91) {
        $acero = "3/4";
        } else if ($columna == 2.54) {
        $acero = "1";
        } else if ($columna == 3.49) {
        $acero = "1 3/8";
        }

        @endphp

        <table id="" class="min-w-full text-gray-800 dark:text-white">
            <!-- Requisitos de diseño vigas -->
            <thead class="bg-gray-200 dark:bg-gray-800">
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">1.- Requisitos de diseño</th>
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-lg py-2 px-4" scope="col" colspan="2">Nombre</th>
                    <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                    <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                </tr>
            </thead>
            <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8' colspan="2">Esfuerzo a compresion del concreto</td>
                    <td class='py-2 px-8 text-center'>f'c</td>
                    <td class='py-2 px-8 text-center'> {{$fc}}kg/cm<sup>2</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Esfuerzo de fluencia del acero</td>
                    <td class='py-2 px-4 text-center'>fy</td>
                    <td class='py-2 px-4 text-center'>{{$fy}} kg/cm<sup>2</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Altura de falso piso</td>
                    <td class='py-2 px-4 text-center'>L1</td>
                    <td class='py-2 px-4 text-center'>{{$l1}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Altura de sobrecimiento</td>
                    <td class='py-2 px-4 text-center'>L2</td>
                    <td class='py-2 px-4 text-center'>{{$l2}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2"> Diámetro de la barra de acero</td>
                    <td class='py-2 px-4 text-center'>db</td>
                    <td class='py-2 px-4 text-center'>{{$columna}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Diámetro del estribo de refuerzo</td>
                    <td class='py-2 px-4 text-center'>re</td>
                    <td class='py-2 px-4 text-center'>{{$re}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Densidad del material de albañilería</td>
                    <td class='py-2 px-4 text-center'>γ albanileria</td>
                    <td class='py-2 px-4 text-center'>{{$yalbaneria}} kg/cm<sup>3</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Densidad del concreto simple</td>
                    <td class='py-2 px-4 text-center'>γ C° simple</td>
                    <td class='py-2 px-4 text-center'>{{$ycsimple}} kg/cm<sup>3</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Densidad del concreto armado</td>
                    <td class='py-2 px-4 text-center'>γ C° armado</td>
                    <td class='py-2 px-4 text-center'> {{$Carmado}} kg/cm<sup>3</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2"> Esfuerzo admisible del terreno</td>
                    <td class='py-2 px-4 text-center'>σt</td>
                    <td class='py-2 px-4 text-center'>{{$esadterr}} kg/cm<sup>2</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Profundidad de la cimentación</td>
                    <td class='py-2 px-4 text-center'>Df</td>
                    <td class='py-2 px-4 text-center'>{{$pdcimt}} m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Densidad promedi</td>
                    <td class='py-2 px-4 text-center'>γ prom</td>
                    <td class='py-2 px-4 text-center'>{{$yprom}} Tn/m<sup>3</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Carga superficial</td>
                    <td class='py-2 px-4 text-center'>s/c</td>
                    <td class='py-2 px-4 text-center'>{{$sc}} Tn/m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Espesor del muro</td>
                    <td class='py-2 px-4 text-center'></td>
                    <td class='py-2 px-4 text-center'>{{$esmuro}} m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Carga muerta</td>
                    <td class='py-2 px-4 text-center'></td>
                    <td class='py-2 px-4 text-center'>{{$CM}} Tn/m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4' colspan="2">Carga viva</td>
                    <td class='py-2 px-4 text-center'></td>
                    <td class='py-2 px-4 text-center'>{{$CV}} Tn/m</td>
                </tr>
            </tbody>
            <thead class="bg-gray-200 dark:bg-gray-800">
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">2.- Longitud de desarrollo del acero de columnas</th>
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                    <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                    <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                    <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                </tr>
            </thead>
            <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Longitud de desarrollo art 12.3</td>
                    <td class='py-2 px-8 text-center'>ld1</td>
                    <td class='py-2 px-8 text-center'>( 0.075 *(fy / √f'c ))* db</td>
                    <td class='py-2 px-8 text-center'>{{$ld1}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Longitud de desarrollo art 12.3</td>
                    <td class='py-2 px-8 text-center'>ld2</td>
                    <td class='py-2 px-8 text-center'>( 0.0044 * fy) * db </td>
                    <td class='py-2 px-8 text-center'>{{$ld2}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Recubrimiento</td>
                    <td class='py-2 px-8 text-center'>r</td>
                    <td class='py-2 px-8 text-center'>re</td>
                    <td class='py-2 px-8 text-center'>{{$r}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Altura a considerar</td>
                    <td class='py-2 px-8 text-center'>H</td>
                    <td class='py-2 px-8 text-center'>MAX(ld1,ld2) + re)</td>
                    <td class='py-2 px-8 text-center'>{{$H}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8 text-center' colspan="6">La altura Mínima del cimiento corrido es de 30 cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td class='py-2 px-8 text-center'>H+2</td>
                    <td class='py-2 px-8 text-center'>H+2</td>
                    <td class='py-2 px-8 text-center'>{{$H + 2}} cm</td>
                </tr>
            </tbody>
            <thead class="bg-gray-200 dark:bg-gray-800">
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.- Calculo de cargas</th>
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                    <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                    <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                    <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.1.- Metrados de cargas por el ancho de influencia transformada</th>
                </tr>
            </thead>
            <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Carga Muerta</td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'>{{$CM}} kg/m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Carga Viva</td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'>{{$CV}} kg/m</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.2 Cálculo de Carga ultima amplificada</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Carga ultima amplificada</td>
                    <td class='py-2 px-8 text-center'>Cu</td>
                    <td class='py-2 px-8 text-center'>1.40 CM + 1.70 CV</td>
                    <td class='py-2 px-8 text-center'>{{$cu}} kg/m</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.3 Cálculo del esfuerzo neto del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Esfuerzo neto del suelo</td>
                    <td class='py-2 px-8 text-center'>σn</td>
                    <td class='py-2 px-8 text-center'>σt*10 - Df*γ prom -s/c</td>
                    <td class='py-2 px-8 text-center'>{{$on}} Tn/m<sup>2</sup></td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.4 Calculo de las dimensiones</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Calculo del acero</td>
                    <td class='py-2 px-8 text-center'>Acim</td>
                    <td class='py-2 px-8 text-center'>Cu/1000/σn</td>
                    <td class='py-2 px-8 text-center'>{{$Acim}} m<sup>2</sup></td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.5 El largo se asume de 1 m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Se asume el ancho</td>
                    <td class='py-2 px-8 text-center'>B</td>
                    <td class='py-2 px-8 text-center'>Acim</td>
                    <td class='py-2 px-8 text-center'>{{$B}} Tn/m<sup>2</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Ancho del cimiento corrido</td>
                    <td class='py-2 px-8 text-center'>B</td>
                    <td class='py-2 px-8 text-center'>B*100</td>
                    <td class='py-2 px-8 text-center'>{{$b}} cm</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.6 Por Seguridad H > B</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Altura el cimiento corrido</td>
                    <td class='py-2 px-8 text-center'>H</td>
                    <td class='py-2 px-8 text-center'>(B*100) + 2</td>
                    <td class='py-2 px-8 text-center'>{{$H2}} cm</td>
                </tr>
            </tbody>
            <thead class="bg-gray-200 dark:bg-gray-800">
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">4.- Verificacion</th>
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                    <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                    <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                    <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">4.1 Cálculo de reacción ultima del suelo</th>
                </tr>
            </thead>
            <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Carga Muerta</td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'>{{$CM}} kg/m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Carga ultima en el suelo</td>
                    <td class='py-2 px-8 text-center'>qu</td>
                    <td class='py-2 px-8 text-center'>(Cu / 1000) / (B / 100)</td>
                    <td class='py-2 px-8 text-center'>{{$qu}} tn/m<sup>2</sup></td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">4.2 Verificación por corte a flexión (Concreto ciclópeo)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Altura por punzonamiento</td>
                    <td class='py-2 px-8 text-center'>Lv</td>
                    <td class='py-2 px-8 text-center'>((B / 100) - Esp. muro) / 2 + (Esp. muro / 2) / 2</td>
                    <td class='py-2 px-8 text-center'>{{$Lv}} m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Ancho del cimiento corrido</td>
                    <td class='py-2 px-8 text-center'>H</td>
                    <td class='py-2 px-8 text-center'>H/100</td>
                    <td class='py-2 px-8 text-center'>{{$HVer}} cm</td>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Verificacion por Punzonamiento</td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'>
                        <table>
                            <tr class="bg-gray-100 dark:bg-gray-600">
                                <td style="border: none;">H</td>
                                <td style="border: none;"></td>
                                <td style="border: none;">Lv</td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-600">
                                <td style="border: none;">{{$HVer}}</td>
                                <td style="border: none;">{{$Verificacion}}</td>
                                <td style="border: none;">{{$Lv}}</td>
                            </tr>
                        </table>
                    </td>
                    <td class='py-2 px-8 text-center' rowspan="2">{{$VerFinal}}</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">4.3 Cálculo de cortante máxima</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Cortante máxima</td>
                    <td class='py-2 px-8 text-center'>Vua (TN)</td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'>{{$VuaTN}} </td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">4.4 Cálculo de cortante admisible</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Cortante admisible</td>
                    <td class='py-2 px-8 text-center'>Vu (TN)</td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'>{{$VuTN}} </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Verificacion por cortante</td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'>
                        <!-- Contenido de la celda -->
                        <table>
                            <tr class="bg-gray-100 dark:bg-gray-600">
                                <td style="border: none;">Vua (TN)</td>
                                <td style="border: none;">&lt;</td>
                                <td style="border: none;">Vu (TN)</td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-600">
                                <td style="border: none;">{{$VuaTN}}</td>
                                <td style="border: none;">&lt;</td>
                                <td style="border: none;">{{$VuTN}}</td>
                            </tr>
                        </table>
                    </td>
                    <td class='py-2 px-8 text-center'>{{$ccmcca}}</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">4.5 Verificación a corte por punzonamiento</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td class='py-2 px-8 text-center'>H/2</td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'>{{$verh2}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td colspan="2">Verificacion por punzonamiento</td>
                    <td class='py-2 px-8 text-center'>
                        <!-- Contenido de la celda -->
                        <table>
                            <tr class="bg-gray-100 dark:bg-gray-600">
                                <td style="border: none;">H/2</td>
                                <td style="border: none;">&gt;</td>
                                <td style="border: none;">Lv</td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-600">
                                <td style="border: none;">{{$verh2Div}}</td>
                                <td style="border: none;">&lt;</td>
                                <td style="border: none;">{{$Lv}}</td>
                            </tr>
                        </table>
                    </td>
                    <td class='py-2 px-8 text-center'> {{$verfCortPunzo}}</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">4.6 Dimensiones Finales</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Ancho final de cimiento corrido</td>
                    <td class='py-2 px-8 text-center'>B</td>
                    <td class='py-2 px-8 text-center'>B</td>
                    <td class='py-2 px-8 text-center'>{{$H2}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td>Alto final del cimiento corrido</td>
                    <td class='py-2 px-8 text-center'>H</td>
                    <td class='py-2 px-8 text-center'>H</td>
                    <td class='py-2 px-8 text-center'>{{$H2 + 5}} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'></td>
                    <td class='py-2 px-8 text-center'>Largo = Largo del muro</td>
                </tr>
            </tbody>
        </table>