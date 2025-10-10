@php
    //Cargas muertas COLUMNA 1
    $CM_P = $dataCol1[0][1];
    $CM_Mx = $dataCol1[0][2];
    $CM_My = $dataCol1[0][3];

    //Cargas vivas
    $CV_P = $dataCol1[1][1];
    $CV_Mx = $dataCol1[1][2];
    $CV_My = $dataCol1[1][3];

    //Cargas sismo x
    $CSx_P = $dataCol1[2][1];
    $CSx_Mx = $dataCol1[2][2];
    $CSx_My = $dataCol1[2][3];

    //Cargas sismo y
    $CSy_P = $dataCol1[3][1];
    $CSy_Mx = $dataCol1[3][2];
    $CSy_My = $dataCol1[3][3];

    //Cargar muertas COLUMNA 2
    //Cargas muertas
    $CM_P2 = $dataCol2[0][1];
    $CM_Mx2 = $dataCol2[0][2];
    $CM_My2 = $dataCol2[0][3];

    //Cargas vivas
    $CV_P2 = $dataCol2[1][1];
    $CV_Mx2 = $dataCol2[1][2];
    $CV_My2 = $dataCol2[1][3];

    //Cargas sismo x
    $CSx_P2 = $dataCol2[2][1];
    $CSx_Mx2 = $dataCol2[2][2];
    $CSx_My2 = $dataCol2[2][3];

    //Cargas sismo y
    $CSy_P2 = $dataCol2[3][1];
    $CSy_Mx2 = $dataCol2[3][2];
    $CSy_My2 = $dataCol2[3][3];

    //VERIFICACION POR CORTANTE
    if ($preciones_Columna1 === 'fila1_col1') {
        $preciones_Columna1_dato = '1.4CM+1.7CV';
    } elseif ($preciones_Columna1 === 'fila2_col1') {
        $preciones_Columna1_dato = '1.25(CM+CV)+Sx';
    } elseif ($preciones_Columna1 === 'fila3_col1') {
        $preciones_Columna1_dato = '1.25(CM+CV)-Sx';
    } elseif ($preciones_Columna1 === 'fila4_col1') {
        $preciones_Columna1_dato = '1.25(CM+CV)+Sy';
    } elseif ($preciones_Columna1 === 'fila5_col1') {
        $preciones_Columna1_dato = '1.25(CM+CV)-Sy';
    } elseif ($preciones_Columna1 === 'fila6_col1') {
        $preciones_Columna1_dato = '0.9CM+Sx';
    } elseif ($preciones_Columna1 === 'fila7_col1') {
        $preciones_Columna1_dato = '0.9CM-Sx';
    } elseif ($preciones_Columna1 === 'fila8_col1') {
        $preciones_Columna1_dato = '0.9CM+Sy';
    } elseif ($preciones_Columna1 === 'fila9_col1') {
        $preciones_Columna1_dato = '0.9CM-Sy';
    }

    if ($preciones_Columna2 === 'fila1_col2') {
        $preciones_Columna2_dato = '1.4CM+1.7CV';
    } elseif ($preciones_Columna2 === 'fila2_col2') {
        $preciones_Columna2_dato = '1.25(CM+CV)+Sx';
    } elseif ($preciones_Columna2 === 'fila3_col2') {
        $preciones_Columna2_dato = '1.25(CM+CV)-Sx';
    } elseif ($preciones_Columna2 === 'fila4_col2') {
        $preciones_Columna2_dato = '1.25(CM+CV)+Sy';
    } elseif ($preciones_Columna2 === 'fila5_col2') {
        $preciones_Columna2_dato = '1.25(CM+CV)-Sy';
    } elseif ($preciones_Columna2 === 'fila6_col2') {
        $preciones_Columna2_dato = '0.9CM+Sx';
    } elseif ($preciones_Columna2 === 'fila7_col2') {
        $preciones_Columna2_dato = '0.9CM-Sx';
    } elseif ($preciones_Columna2 === 'fila8_col2') {
        $preciones_Columna2_dato = '0.9CM+Sy';
    } elseif ($preciones_Columna2 === 'fila9_col2') {
        $preciones_Columna2_dato = '0.9CM-Sy';
    }

    //DISEÑO POR FLEXION
    $opcionesvar = [
        '0' => 'Ø 0"',
        '0.28' => '6mm',
        '0.5' => '8mm',
        '0.71' => 'Ø 3/8"',
        '1.13' => '12mm',
        '1.29' => 'Ø 1/2"',
        '1.99' => 'Ø 5/8"',
        '2.84' => 'Ø 3/4"',
        '5.1' => 'Ø 1"',
        '10.06' => 'Ø 1 3/8"',
    ];
    //COLUMNA 1
    if (isset($opcionesvar[$VarillaX_Col1])) {
        $Varilla1texto = $opcionesvar[$VarillaX_Col1];
    }
    //COLUMNA 2
    if (isset($opcionesvar[$VarillaX_Col2])) {
        $Varilla22texto = $opcionesvar[$VarillaX_Col2];
    }

    //VERIFICACION POR CORTE Y PUNZONAMIENTO
    $opciones_columnas = [
        '40' => 'Columnas Interiores',
        '30' => 'Columnas de Borde',
        '20' => 'Columnas de Esquina',
    ];

    //COLUMNA 1
    if (isset($opcionesvar[$VarillaVC_Col1])) {
        $VarillaVC1texto = $opcionesvar[$VarillaVC_Col1];
    }
    if (isset($opciones_columnas[$fa_Col1])) {
        $texto_columna_fa1 = $opciones_columnas[$fa_Col1];
    }
    //COLUMNA 2
    if (isset($opcionesvar[$VarillaVC_Col2])) {
        $VarillaVC2texto = $opcionesvar[$VarillaVC_Col2];
    }
    if (isset($opciones_columnas[$fa_Col2])) {
        $texto_columna_fa2 = $opciones_columnas[$fa_Col2];
    }

    //CALCULOS MATEMATICOS DE LA HOJA
    $Az = round($p_servicio / ($qa * $fk), 2);
    $B = $t2_col1 + $m1 + $m1;
    $L = 0.5 * $t1_col1 + $Le + 0.5 * $t1_col2 + $m2;
    //CALCULOS PARA LA COLUMNA 1
    //Combinaciones de cargas de servicio

    //CM+CV
    $CM_CV_P = round($CM_P + $CV_P, 2);
    $CM_CV_MX = round($CM_Mx + $CV_Mx, 2);
    $CM_CV_MY = round($CM_My + $CV_My, 2);

    //CM+CV+0.8Sx
    $CM_CV_8SX_sumP = round($CM_P + $CV_P + 0.8 * $CSx_P, 2);
    $CM_CV_8SX_sumMX = round($CM_Mx + $CV_Mx + 0.8 * $CSx_Mx, 2);
    $CM_CV_8SX_sumMY = round($CM_My + $CV_My + 0.8 * $CSx_My, 2);

    //CM+CV-0.8Sx
    $CM_CV_8SX_restP = round($CM_P + $CV_P - 0.8 * $CSx_P, 2);
    $CM_CV_8SX_restMX = round($CM_Mx + $CV_Mx - 0.8 * $CSx_Mx, 2);
    $CM_CV_8SX_restMY = round($CM_My + $CV_My - 0.8 * $CSx_My, 2);

    //CM+CV+0.8Sy
    $CM_CV_8SY_sumP = round($CM_P + $CV_P + 0.8 * $CSy_P, 2);
    $CM_CV_8SY_sumMX = round($CM_Mx + $CV_Mx + 0.8 * $CSy_Mx, 2);
    $CM_CV_8SY_sumMY = round($CM_My + $CV_My + 0.8 * $CSy_My, 2);

    //CM+CV-0.8Sy
    $CM_CV_8SY_restP = round($CM_P + $CV_P - 0.8 * $CSy_P, 2);
    $CM_CV_8SY_restMX = round($CM_Mx + $CV_Mx - 0.8 * $CSy_Mx, 2);
    $CM_CV_8SY_restMY = round($CM_My + $CV_My - 0.8 * $CSy_My, 2);

    //COMBINACIONES DE CARGA ÚLTIMAS

    //1.4CM+1.7CV
    $CCU1_P = round(1.4 * $CM_P + 1.7 * $CV_P, 2);
    $CCC1_MX = round(1.4 * $CM_Mx + 1.7 * $CV_Mx, 2);
    $CCC1_MY = round(1.4 * $CM_My + 1.7 * $CV_My, 2);

    //1.25(CM+CV) + Sx
    $CCC2_P = round(1.25 * ($CM_P + $CV_P) + $CSx_P, 2);
    $CCC2_MX = round(1.25 * ($CM_Mx + $CV_Mx) + $CSx_Mx, 2);
    $CCC2_MY = round(1.25 * ($CM_My + $CV_My) + $CSx_My, 2);

    //1.25(CM+CV)-Sx
    $CCC3_P = round(1.25 * ($CM_P + $CV_P) - $CSx_P, 2);
    $CCC3_MX = round(1.25 * ($CM_Mx + $CV_Mx) - $CSx_Mx, 2);
    $CCC3_MY = round(1.25 * ($CM_My + $CV_My) - $CSx_My, 2);

    //1.25(CM+CV) + Sy
    $CCC4_P = round(1.25 * ($CM_P + $CV_P) + $CSy_P, 2);
    $CCC4_MX = round(1.25 * ($CM_Mx + $CV_Mx) + $CSy_Mx, 2);
    $CCC4_MY = round(1.25 * ($CM_My + $CV_My) + $CSy_My, 2);

    //1.25(CM+CV) - Sy
    $CCC5_P = round(1.25 * ($CM_P + $CV_P) - $CSy_P, 2);
    $CCC5_MX = round(1.25 * ($CM_Mx + $CV_Mx) - $CSy_Mx, 2);
    $CCC5_MY = round(1.25 * ($CM_My + $CV_My) - $CSy_My, 2);

    //0.9CM + Sx
    $CCC6_P = round(0.9 * $CM_P + $CSx_P, 2);
    $CCC6_MX = round(0.9 * $CM_Mx + $CSx_Mx, 2);
    $CCC6_MY = round(0.9 * $CM_My + $CSx_My, 2);

    //0.9CM - Sx
    $CCC7_P = round(0.9 * $CM_P - $CSx_P, 2);
    $CCC7_MX = round(0.9 * $CM_Mx - $CSx_Mx, 2);
    $CCC7_MY = round(0.9 * $CM_My - $CSx_My, 2);

    //0.9CM + Sy
    $CCC8_P = round(0.9 * $CM_P + $CSy_P, 2);
    $CCC8_MX = round(0.9 * $CM_Mx + $CSy_Mx, 2);
    $CCC8_MY = round(0.9 * $CM_My + $CSy_My, 2);

    //0.9CM - Sy
    $CCC9_P = round(0.9 * $CM_P - $CSy_P, 2);
    $CCC9_MX = round(0.9 * $CM_Mx - $CSy_Mx, 2);
    $CCC9_MY = round(0.9 * $CM_My - $CSy_My, 2);
    $ot = $qa;
    //PRESIONES EN EL SUELO EN CONDICIONES DE SERVICIO

    //CM + CV
    $PSCS1_OP = round($CM_CV_P / $Az, 2);
    $PSCS1_OMX = round((6 * abs($CM_CV_MX)) / ($L * pow($B, 2)), 2);
    $PSCS1_OMY = round((6 * abs($CM_CV_MY)) / (pow($L, 2) * $B), 2);
    $PSCS1_OTOT = round($PSCS1_OP + $PSCS1_OMX + $PSCS1_OMY, 2);
    $PSCS1_OS = $ot;
    if ($PSCS1_OTOT < $PSCS1_OS) {
        $PSCS1_COND = 'Cumple';
    } else {
        $PSCS1_COND = 'No cumple';
    }

    //CM+CV+0.8Sx
    $PSCS2_OP = round($CM_CV_8SX_sumP / $Az, 2);
    $PSCS2_OMX = round((6 * abs($CM_CV_8SX_sumMX)) / ($L * pow($B, 2)), 2);
    $PSCS2_OMY = round((6 * abs($CM_CV_8SX_sumMY)) / (pow($L, 2) * $B), 2);
    $PSCS2_OTOT = round($PSCS2_OP + $PSCS2_OMX + $PSCS2_OMY, 2);
    $PSCS2_OS = $ot * 1.3;
    if ($PSCS2_OTOT < $PSCS2_OS) {
        $PSCS2_COND = 'Cumple';
    } else {
        $PSCS2_COND = 'No cumple';
    }

    //CM+CV - 0.8Sx
    $PSCS3_OP = round($CM_CV_8SX_restP / $Az, 2);
    $PSCS3_OMX = round((6 * abs($CM_CV_8SX_restMX)) / ($L * pow($B, 2)), 2);
    $PSCS3_OMY = round((6 * abs($CM_CV_8SX_restMY)) / (pow($L, 2) * $B), 2);
    $PSCS3_OTOT = round($PSCS3_OP - $PSCS3_OMX - $PSCS3_OMY, 2);
    $PSCS3_OS = $ot * 1.3;
    if ($PSCS3_OTOT < $PSCS3_OS) {
        $PSCS3_COND = 'Cumple';
    } else {
        $PSCS3_COND = 'No cumple';
    }

    //CM+CV+0.8Sy
    $PSCS4_OP = round($CM_CV_8SY_sumP / $Az, 2);
    $PSCS4_OMX = round((6 * abs($CM_CV_8SY_sumMX)) / ($L * pow($B, 2)), 2);
    $PSCS4_OMY = round((6 * abs($CM_CV_8SY_sumMY)) / (pow($L, 2) * $B), 2);
    $PSCS4_OTOT = round($PSCS4_OP + $PSCS4_OMX + $PSCS4_OMY, 2);
    $PSCS4_OS = $ot * 1.3;
    if ($PSCS4_OTOT < $PSCS4_OS) {
        $PSCS4_COND = 'Cumple';
    } else {
        $PSCS4_COND = 'No cumple';
    }

    //CM+CV-0.8Sy
    $PSCS5_OP = round($CM_CV_8SY_restP / $Az, 2);
    $PSCS5_OMX = round((6 * abs($CM_CV_8SY_restMX)) / ($L * pow($B, 2)), 2);
    $PSCS5_OMY = round((6 * abs($CM_CV_8SY_restMY)) / (pow($L, 2) * $B), 2);
    $PSCS5_OTOT = round($PSCS5_OP - $PSCS5_OMX - $PSCS5_OMY, 2);
    $PSCS5_OS = $ot * 1.3;
    if ($PSCS5_OTOT < $PSCS5_OS) {
        $PSCS5_COND = 'Cumple';
    } else {
        $PSCS5_COND = 'No cumple';
    }

    //PRESIONES ÚLTIMOS DE DISEÑO

    //1.4CM+1.7CV
    $PUD1_OP = round($CCU1_P / $Az, 2);
    $PUD1_OMX = round((6 * abs($CCC1_MX)) / ($L * pow($B, 2)), 2);
    $PUD1_OMY = round((6 * abs($CCC1_MY)) / (pow($L, 2) * $B), 2);
    $PUD1_OTOT = round($PUD1_OP + $PUD1_OMX + $PUD1_OMY, 2);

    //1.25(CM+CV) + Sx
    $PUD2_OP = round($CCC2_P / $Az, 2);
    $PUD2_OMX = round((6 * abs($CCC2_MX)) / ($L * pow($B, 2)), 2);
    $PUD2_OMY = round((6 * abs($CCC2_MY)) / (pow($L, 2) * $B), 2);
    $PUD2_OTOT = round($PUD2_OP + $PUD2_OMX + $PUD2_OMY, 2);

    //1.25(CM+CV)-Sx
    $PUD3_OP = round($CCC3_P / $Az, 2);
    $PUD3_OMX = round((6 * abs($CCC3_MX)) / ($L * pow($B, 2)), 2);
    $PUD3_OMY = round((6 * abs($CCC3_MY)) / (pow($L, 2) * $B), 2);
    $PUD3_OTOT = round($PUD3_OP + $PUD3_OMX + $PUD3_OMY, 2);

    //1.25(CM+CV) + Sy
    $PUD4_OP = round($CCC4_P / $Az, 2);
    $PUD4_OMX = round((6 * abs($CCC4_MX)) / ($L * pow($B, 2)), 2);
    $PUD4_OMY = round((6 * abs($CCC4_MY)) / (pow($L, 2) * $B), 2);
    $PUD4_OTOT = round($PUD4_OP + $PUD4_OMX + $PUD4_OMY, 2);

    //1.25(CM+CV) - Sy
    $PUD5_OP = round($CCC5_P / $Az, 2);
    $PUD5_OMX = round((6 * abs($CCC5_MX)) / ($L * pow($B, 2)), 2);
    $PUD5_OMY = round((6 * abs($CCC5_MY)) / (pow($L, 2) * $B), 2);
    $PUD5_OTOT = round($PUD5_OP + $PUD5_OMX + $PUD5_OMY, 2);

    //0.9CM + Sx
    $PUD6_OP = round($CCC6_P / $Az, 2);
    $PUD6_OMX = round((6 * abs($CCC6_MX)) / ($L * pow($B, 2)), 2);
    $PUD6_OMY = round((6 * abs($CCC6_MY)) / (pow($L, 2) * $B), 2);
    $PUD6_OTOT = round($PUD6_OP + $PUD6_OMX + $PUD6_OMY, 2);

    //0.9CM - Sx
    $PUD7_OP = round($CCC7_P / $Az, 2);
    $PUD7_OMX = round((6 * abs($CCC7_MX)) / ($L * pow($B, 2)), 2);
    $PUD7_OMY = round((6 * abs($CCC7_MY)) / (pow($L, 2) * $B), 2);
    $PUD7_OTOT = round($PUD7_OP + $PUD7_OMX + $PUD7_OMY, 2);

    //0.9CM + Sy
    $PUD8_OP = round($CCC8_P / $Az, 2);
    $PUD8_OMX = round((6 * abs($CCC8_MX)) / ($L * pow($B, 2)), 2);
    $PUD8_OMY = round((6 * abs($CCC8_MY)) / (pow($L, 2) * $B), 2);
    $PUD8_OTOT = round($PUD8_OP + $PUD8_OMX + $PUD8_OMY, 2);

    //0.9CM - Sy
    $PUD9_OP = round($CCC9_P / $Az, 2);
    $PUD9_OMX = round((6 * abs($CCC9_MX)) / ($L * pow($B, 2)), 2);
    $PUD9_OMY = round((6 * abs($CCC9_MY)) / (pow($L, 2) * $B), 2);
    $PUD9_OTOT = round($PUD9_OP + $PUD9_OMX + $PUD9_OMY, 2);

    $OT_ULT = max(
        $PUD1_OTOT,
        $PUD2_OTOT,
        $PUD3_OTOT,
        $PUD4_OTOT,
        $PUD5_OTOT,
        $PUD6_OTOT,
        $PUD7_OTOT,
        $PUD8_OTOT,
        $PUD9_OTOT,
    );

    //CALCULO DE LAS FUERZAS ULTIMAS EN LA BASE DE LA ZAPATA

    //Qu(1.4D+1.7)(ton-m)
    $CFUBZ1 = $PUD1_OTOT * $B;

    //Qu(1.25*(D+L)+EQX)(ton-m)
    $CFUBZ2_MAX = round(max($PUD2_OTOT, $PUD3_OTOT) * $B, 2);
    $CFUBZ2_MIN = round(min($PUD2_OTOT, $PUD3_OTOT) * $B, 2);

    //Qu(1.25*(D+L)+EQY)(ton-m)
    $CFUBZ3_MAX = round(max($PUD4_OTOT, $PUD5_OTOT) * $B, 2);
    $CFUBZ3_MIN = round(min($PUD4_OTOT, $PUD5_OTOT) * $B, 2);

    //VERIFICACION DE EXCENTRICIDAADES
    //CM+CV
    //FA
    $VE1_FA1 = $PSCS1_OP;
    $VE1_FA2 = $PSCS1_OP;
    $VE1_FA3 = $PSCS1_OP;
    $VE1_FA4 = $PSCS1_OP;

    //MX
    $VE1_MX1 = $PSCS1_OMX;
    $VE1_MX2 = $PSCS1_OMX;
    $VE1_MX3 = -1 * $PSCS1_OMX;
    $VE1_MX4 = -1 * $PSCS1_OMX;

    //MY
    $VE1_MY1 = -1 * $PSCS1_OMY;
    $VE1_MY2 = $PSCS1_OMY;
    $VE1_MY3 = -1 * $PSCS1_OMY;
    $VE1_MY4 = $PSCS1_OMY;

    //RESULTANTE
    $VE1_R1 = $VE1_FA1 + $VE1_MX1 + $VE1_MY1;
    $VE1_R2 = $VE1_FA2 + $VE1_MX2 + $VE1_MY2;
    $VE1_R3 = $VE1_FA3 + $VE1_MX3 + $VE1_MY3;
    $VE1_R4 = $VE1_FA4 + $VE1_MX4 + $VE1_MY4;

    if ($VE1_R1 >= 0 && $VE1_R2 >= 0) {
        $VE_TEXT_F1 = 'cumple';
    } else {
        $VE_TEXT_F1 = 'No Cumple';
    }

    if ($VE1_R3 >= 0 && $VE1_R4 >= 0) {
        $VE_TEXT_F2 = 'cumple';
    } else {
        $VE_TEXT_F2 = 'No Cumple';
    }

    //CM+CV+0.8Sx
    //FA
    $VE2_FA1 = $PSCS2_OP;
    $VE2_FA2 = $PSCS2_OP;
    $VE2_FA3 = $PSCS2_OP;
    $VE2_FA4 = $PSCS2_OP;

    //MX
    $VE2_MX1 = $PSCS2_OMX;
    $VE2_MX2 = $PSCS2_OMX;
    $VE2_MX3 = -1 * $PSCS2_OMX;
    $VE2_MX4 = -1 * $PSCS2_OMX;

    //MY
    $VE2_MY1 = -1 * $PSCS2_OMY;
    $VE2_MY2 = $PSCS2_OMY;
    $VE2_MY3 = -1 * $PSCS2_OMY;
    $VE2_MY4 = $PSCS2_OMY;

    //RESULTANTE
    $VE2_R1 = $VE2_FA1 + $VE2_MX1 + $VE2_MY1;
    $VE2_R2 = $VE2_FA2 + $VE2_MX2 + $VE2_MY2;
    $VE2_R3 = $VE2_FA3 + $VE2_MX3 + $VE2_MY3;
    $VE2_R4 = $VE2_FA4 + $VE2_MX4 + $VE2_MY4;

    if ($VE2_R1 >= 0 && $VE2_R2 >= 0) {
        $VE_TEXT_F3 = 'Cumple';
    } else {
        $VE_TEXT_F3 = 'No Cumple';
    }

    if ($VE2_R3 >= 0 && $VE2_R4 >= 0) {
        $VE_TEXT_F4 = 'Cumple';
    } else {
        $VE_TEXT_F4 = 'No cumple';
    }

    //CM+CV-0.8Sx
    //FA
    $VE3_FA1 = $PSCS3_OP;
    $VE3_FA2 = $PSCS3_OP;
    $VE3_FA3 = $PSCS3_OP;
    $VE3_FA4 = $PSCS3_OP;

    //MX
    $VE3_MX1 = $PSCS3_OMX;
    $VE3_MX2 = $PSCS3_OMX;
    $VE3_MX3 = -1 * $PSCS3_OMX;
    $VE3_MX4 = -1 * $PSCS3_OMX;

    //MY
    $VE3_MY1 = -1 * $PSCS3_OMY;
    $VE3_MY2 = $PSCS3_OMY;
    $VE3_MY3 = -1 * $PSCS3_OMY;
    $VE3_MY4 = $PSCS3_OMY;

    //RESULTANTE
    $VE3_R1 = $VE3_FA1 + $VE3_MX1 + $VE3_MY1;
    $VE3_R2 = $VE3_FA2 + $VE3_MX2 + $VE3_MY2;
    $VE3_R3 = $VE3_FA3 + $VE3_MX3 + $VE3_MY3;
    $VE3_R4 = $VE3_FA4 + $VE3_MX4 + $VE3_MY4;

    if ($VE3_R1 >= 0 && $VE3_R2 >= 0) {
        $VE_TEXT_F5 = 'Cumple';
    } else {
        $VE_TEXT_F5 = 'No Cumple';
    }

    if ($VE3_R3 >= 0 && $VE3_R4 >= 0) {
        $VE_TEXT_F6 = 'Cumple';
    } else {
        $VE_TEXT_F6 = 'No Cumple';
    }

    //CM+CV+0.8Sy
    //FA
    $VE4_FA1 = $PSCS4_OP;
    $VE4_FA2 = $PSCS4_OP;
    $VE4_FA3 = $PSCS4_OP;
    $VE4_FA4 = $PSCS4_OP;

    //MX
    $VE4_MX1 = $PSCS4_OMX;
    $VE4_MX2 = $PSCS4_OMX;
    $VE4_MX3 = -1 * $PSCS4_OMX;
    $VE4_MX4 = -1 * $PSCS4_OMX;

    //MY
    $VE4_MY1 = -1 * $PSCS4_OMY;
    $VE4_MY2 = $PSCS4_OMY;
    $VE4_MY3 = -1 * $PSCS4_OMY;
    $VE4_MY4 = $PSCS4_OMY;

    //RESULTANTE
    $VE4_R1 = $VE4_FA1 + $VE4_MX1 + $VE4_MY1;
    $VE4_R2 = $VE4_FA2 + $VE4_MX2 + $VE4_MY2;
    $VE4_R3 = $VE4_FA3 + $VE4_MX3 + $VE4_MY3;
    $VE4_R4 = $VE4_FA4 + $VE4_MX4 + $VE4_MY4;

    if ($VE4_R1 >= 0 && $VE4_R2 >= 0) {
        $VE_TEXT_F7 = 'Cumple';
    } else {
        $VE_TEXT_F7 = 'No Cumple';
    }

    if ($VE4_R3 >= 0 && $VE4_R4 >= 0) {
        $VE_TEXT_F8 = 'Cumple';
    } else {
        $VE_TEXT_F8 = 'No Cumple';
    }

    //CM+CV-0.8Sy
    //FA
    $VE5_FA1 = $PSCS5_OP;
    $VE5_FA2 = $PSCS5_OP;
    $VE5_FA3 = $PSCS5_OP;
    $VE5_FA4 = $PSCS5_OP;

    //MX
    $VE5_MX1 = $PSCS5_OMX;
    $VE5_MX2 = $PSCS5_OMX;
    $VE5_MX3 = -1 * $PSCS5_OMX;
    $VE5_MX4 = -1 * $PSCS5_OMX;

    //MY
    $VE5_MY1 = -1 * $PSCS5_OMY;
    $VE5_MY2 = $PSCS5_OMY;
    $VE5_MY3 = -1 * $PSCS5_OMY;
    $VE5_MY4 = $PSCS5_OMY;

    //RESULTANTE
    $VE5_R1 = $VE5_FA1 + $VE5_MX1 + $VE5_MY1;
    $VE5_R2 = $VE5_FA2 + $VE5_MX2 + $VE5_MY2;
    $VE5_R3 = $VE5_FA3 + $VE5_MX3 + $VE5_MY3;
    $VE5_R4 = $VE5_FA4 + $VE5_MX4 + $VE5_MY4;

    if ($VE5_R1 >= 0 && $VE5_R2 >= 0) {
        $VE_TEXT_F9 = 'Cumple';
    } else {
        $VE_TEXT_F9 = 'No cumple';
    }

    if ($VE5_R3 >= 0 && $VE5_R4 >= 0) {
        $VE_TEXT_F10 = 'Cumple';
    } else {
        $VE_TEXT_F10 = 'No Cumple';
    }

    //CALCULOS PARA COLUMNA 2
    //Combinaciones de cargas de servicio

    //CM+CV
    $CM_CV_P2 = round($CM_P2 + $CV_P2, 2);
    $CM_CV_MX2 = round($CM_Mx2 + $CV_Mx2, 2);
    $CM_CV_MY2 = round($CM_My2 + $CV_My2, 2);

    //CM+CV+0.8Sx
    $CM_CV_8SX_sumP2 = round($CM_P2 + $CV_P2 + 0.8 * $CSx_P2, 2);
    $CM_CV_8SX_sumMX2 = round($CM_Mx2 + $CV_Mx2 + 0.8 * $CSx_Mx2, 2);
    $CM_CV_8SX_sumMY2 = round($CM_My2 + $CV_My2 + 0.8 * $CSx_My2, 2);

    //CM+CV-0.8Sx
    $CM_CV_8SX_restP2 = round($CM_P2 + $CV_P2 - 0.8 * $CSx_P2, 2);
    $CM_CV_8SX_restMX2 = round($CM_Mx2 + $CV_Mx2 - 0.8 * $CSx_Mx2, 2);
    $CM_CV_8SX_restMY2 = round($CM_My2 + $CV_My2 - 0.8 * $CSx_My2, 2);

    //CM+CV+0.8Sy
    $CM_CV_8SY_sumP2 = round($CM_P2 + $CV_P2 + 0.8 * $CSy_P2, 2);
    $CM_CV_8SY_sumMX2 = round($CM_Mx2 + $CV_Mx2 + 0.8 * $CSy_Mx2, 2);
    $CM_CV_8SY_sumMY2 = round($CM_My2 + $CV_My2 + 0.8 * $CSy_My2, 2);

    //CM+CV-0.8Sy
    $CM_CV_8SY_restP2 = round($CM_P2 + $CV_P2 - 0.8 * $CSy_P2, 2);
    $CM_CV_8SY_restMX2 = round($CM_Mx2 + $CV_Mx2 - 0.8 * $CSy_Mx2, 2);
    $CM_CV_8SY_restMY2 = round($CM_My2 + $CV_My2 - 0.8 * $CSy_My2, 2);

    //COMBINACIONES DE CARGA ÚLTIMAS

    //1.4CM+1.7CV
    $CCU1_P2 = round(1.4 * $CM_P2 + 1.7 * $CV_P2, 2);
    $CCC1_MX2 = round(1.4 * $CM_Mx2 + 1.7 * $CV_Mx2, 2);
    $CCC1_MY2 = round(1.4 * $CM_My2 + 1.7 * $CV_My2, 2);

    //1.25(CM+CV) + Sx
    $CCC2_P2 = round(1.25 * ($CM_P2 + $CV_P2) + $CSx_P2, 2);
    $CCC2_MX2 = round(1.25 * ($CM_Mx2 + $CV_Mx2) + $CSx_Mx2, 2);
    $CCC2_MY2 = round(1.25 * ($CM_My2 + $CV_My2) + $CSx_My2, 2);

    //1.25(CM+CV)-Sx
    $CCC3_P2 = round(1.25 * ($CM_P2 + $CV_P2) - $CSx_P2, 2);
    $CCC3_MX2 = round(1.25 * ($CM_Mx2 + $CV_Mx2) - $CSx_Mx2, 2);
    $CCC3_MY2 = round(1.25 * ($CM_My2 + $CV_My2) - $CSx_My2, 2);

    //1.25(CM+CV) + Sy
    $CCC4_P2 = round(1.25 * ($CM_P2 + $CV_P2) + $CSy_P2, 2);
    $CCC4_MX2 = round(1.25 * ($CM_Mx2 + $CV_Mx2) + $CSy_Mx2, 2);
    $CCC4_MY2 = round(1.25 * ($CM_My2 + $CV_My2) + $CSy_My2, 2);

    //1.25(CM+CV) - Sy
    $CCC5_P2 = round(1.25 * ($CM_P2 + $CV_P2) - $CSy_P2, 2);
    $CCC5_MX2 = round(1.25 * ($CM_Mx2 + $CV_Mx2) - $CSy_Mx2, 2);
    $CCC5_MY2 = round(1.25 * ($CM_My2 + $CV_My2) - $CSy_My2, 2);

    //0.9CM + Sx
    $CCC6_P2 = round(0.9 * $CM_P2 + $CSx_P2, 2);
    $CCC6_MX2 = round(0.9 * $CM_Mx2 + $CSx_Mx2, 2);
    $CCC6_MY2 = round(0.9 * $CM_My2 + $CSx_My2, 2);

    //0.9CM - Sx
    $CCC7_P2 = round(0.9 * $CM_P2 - $CSx_P2, 2);
    $CCC7_MX2 = round(0.9 * $CM_Mx2 - $CSx_Mx2, 2);
    $CCC7_MY2 = round(0.9 * $CM_My2 - $CSx_My2, 2);

    //0.9CM + Sy
    $CCC8_P2 = round(0.9 * $CM_P2 + $CSy_P2, 2);
    $CCC8_MX2 = round(0.9 * $CM_Mx2 + $CSy_Mx2, 2);
    $CCC8_MY2 = round(0.9 * $CM_My2 + $CSy_My2, 2);

    //0.9CM - Sy
    $CCC9_P2 = round(0.9 * $CM_P2 - $CSy_P2, 2);
    $CCC9_MX2 = round(0.9 * $CM_Mx2 - $CSy_Mx2, 2);
    $CCC9_MY2 = round(0.9 * $CM_My2 - $CSy_My2, 2);

    // $B2 = 1.80;
    // $L2 = 27.28;
    // $ot2 = 6;
    // $Az2 = 49.10;

    $B2 = $B;
    $L2 = $L;
    $ot2 = $qa;
    $Az2 = $Az;

    //PRESIONES EN EL SUELO EN CONDICIONES DE SERVICIO

    //CM + CV
    $PSCS1_OP2 = round($CM_CV_P2 / $Az2, 2);
    $PSCS1_OMX2 = round((6 * abs($CM_CV_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PSCS1_OMY2 = round((6 * abs($CM_CV_MY2)) / (pow($L2, 2) * $B2), 2);
    $PSCS1_OTOT2 = round($PSCS1_OP2 + $PSCS1_OMX2 + $PSCS1_OMY2, 2);
    $PSCS1_OS2 = $ot2;
    if ($PSCS1_OTOT2 < $PSCS1_OS2) {
        $PSCS1_COND2 = 'Cumple';
    } else {
        $PSCS1_COND2 = 'No Cumple';
    }

    //CM+CV+0.8Sx
    $PSCS2_OP2 = round($CM_CV_8SX_sumP2 / $Az2, 2);
    $PSCS2_OMX2 = round((6 * abs($CM_CV_8SX_sumMX2)) / ($L2 * pow($B2, 2)), 2);
    $PSCS2_OMY2 = round((6 * abs($CM_CV_8SX_sumMY2)) / (pow($L2, 2) * $B2), 2);
    $PSCS2_OTOT2 = round($PSCS2_OP2 + $PSCS2_OMX2 + $PSCS2_OMY2, 2);
    $PSCS2_OS2 = $ot2 * 1.3;
    if ($PSCS2_OTOT2 < $PSCS2_OS2) {
        $PSCS2_COND2 = 'Cumple';
    } else {
        $PSCS2_COND2 = 'No Cumple';
    }

    //CM+CV - 0.8Sx
    $PSCS3_OP2 = round($CM_CV_8SX_restP2 / $Az2, 2);
    $PSCS3_OMX2 = round((6 * abs($CM_CV_8SX_restMX2)) / ($L2 * pow($B2, 2)), 2);
    $PSCS3_OMY2 = round((6 * abs($CM_CV_8SX_restMY2)) / (pow($L2, 2) * $B2), 2);
    $PSCS3_OTOT2 = round($PSCS3_OP2 - $PSCS3_OMX2 - $PSCS3_OMY2, 2);
    $PSCS3_OS2 = $ot2 * 1.3;
    if ($PSCS3_OTOT2 < $PSCS3_OS2) {
        $PSCS3_COND2 = 'Cumple';
    } else {
        $PSCS3_COND2 = 'No cumple';
    }

    //CM+CV+0.8Sy
    $PSCS4_OP2 = round($CM_CV_8SY_sumP2 / $Az2, 2);
    $PSCS4_OMX2 = round((6 * abs($CM_CV_8SY_sumMX2)) / ($L2 * pow($B2, 2)), 2);
    $PSCS4_OMY2 = round((6 * abs($CM_CV_8SY_sumMY2)) / (pow($L2, 2) * $B2), 2);
    $PSCS4_OTOT2 = round($PSCS4_OP2 + $PSCS4_OMX2 + $PSCS4_OMY2, 2);
    $PSCS4_OS2 = $ot2 * 1.3;
    if ($PSCS4_OTOT2 < $PSCS4_OS2) {
        $PSCS4_COND2 = 'Cumple';
    } else {
        $PSCS4_COND2 = 'No cumple';
    }

    //CM+CV-0.8Sy
    $PSCS5_OP2 = round($CM_CV_8SY_restP2 / $Az2, 2);
    $PSCS5_OMX2 = round((6 * abs($CM_CV_8SY_restMX2)) / ($L2 * pow($B2, 2)), 2);
    $PSCS5_OMY2 = round((6 * abs($CM_CV_8SY_restMY2)) / (pow($L2, 2) * $B2), 2);
    $PSCS5_OTOT2 = round($PSCS5_OP2 + $PSCS5_OMX2 - $PSCS5_OMY2, 2);
    $PSCS5_OS2 = $ot2 * 1.3;
    if ($PSCS5_OTOT2 < $PSCS5_OS2) {
        $PSCS5_COND2 = 'Cumple';
    } else {
        $PSCS5_COND2 = 'No cumple';
    }

    // PRESIONES ÚLTIMOS DE DISEÑO

    // 1.4CM+1.7CV
    $PUD1_OP2 = round($CCU1_P2 / $Az2, 2);
    $PUD1_OMX2 = round((6 * abs($CCC1_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PUD1_OMY2 = round((6 * abs($CCC1_MY2)) / (pow($L2, 2) * $B2), 2);
    $PUD1_OTOT2 = round($PUD1_OP2 + $PUD1_OMX2 + $PUD1_OMY2, 2);

    // 1.25(CM+CV) + Sx
    $PUD2_OP2 = round($CCC2_P2 / $Az2, 2);
    $PUD2_OMX2 = round((6 * abs($CCC2_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PUD2_OMY2 = round((6 * abs($CCC2_MY2)) / (pow($L2, 2) * $B2), 2);
    $PUD2_OTOT2 = round($PUD2_OP2 + $PUD2_OMX2 + $PUD2_OMY2, 2);

    // 1.25(CM+CV)-Sx
    $PUD3_OP2 = round($CCC3_P2 / $Az2, 2);
    $PUD3_OMX2 = round((6 * abs($CCC3_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PUD3_OMY2 = round((6 * abs($CCC3_MY2)) / (pow($L2, 2) * $B2), 2);
    $PUD3_OTOT2 = round($PUD3_OP2 + $PUD3_OMX2 + $PUD3_OMY2, 2);

    // 1.25(CM+CV) + Sy
    $PUD4_OP2 = round($CCC4_P2 / $Az2, 2);
    $PUD4_OMX2 = round((6 * abs($CCC4_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PUD4_OMY2 = round((6 * abs($CCC4_MY2)) / (pow($L2, 2) * $B2), 2);
    $PUD4_OTOT2 = round($PUD4_OP2 + $PUD4_OMX2 + $PUD4_OMY2, 2);

    // 1.25(CM+CV) - Sy
    $PUD5_OP2 = round($CCC5_P2 / $Az2, 2);
    $PUD5_OMX2 = round((6 * abs($CCC5_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PUD5_OMY2 = round((6 * abs($CCC5_MY2)) / (pow($L2, 2) * $B2), 2);
    $PUD5_OTOT2 = round($PUD5_OP2 + $PUD5_OMX2 + $PUD5_OMY2, 2);

    // 0.9CM + Sx
    $PUD6_OP2 = round($CCC6_P2 / $Az2, 2);
    $PUD6_OMX2 = round((6 * abs($CCC6_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PUD6_OMY2 = round((6 * abs($CCC6_MY2)) / (pow($L2, 2) * $B2), 2);
    $PUD6_OTOT2 = round($PUD6_OP2 + $PUD6_OMX2 + $PUD6_OMY2, 2);

    // 0.9CM - Sx
    $PUD7_OP2 = round($CCC7_P2 / $Az2, 2);
    $PUD7_OMX2 = round((6 * abs($CCC7_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PUD7_OMY2 = round((6 * abs($CCC7_MY2)) / (pow($L2, 2) * $B2), 2);
    $PUD7_OTOT2 = round($PUD7_OP2 + $PUD7_OMX2 + $PUD7_OMY2, 2);

    // 0.9CM + Sy
    $PUD8_OP2 = round($CCC8_P2 / $Az2, 2);
    $PUD8_OMX2 = round((6 * abs($CCC8_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PUD8_OMY2 = round((6 * abs($CCC8_MY2)) / (pow($L2, 2) * $B2), 2);
    $PUD8_OTOT2 = round($PUD8_OP2 + $PUD8_OMX2 + $PUD8_OMY2, 2);

    // 0.9CM - Sy
    $PUD9_OP2 = round($CCC9_P2 / $Az2, 2);
    $PUD9_OMX2 = round((6 * abs($CCC9_MX2)) / ($L2 * pow($B2, 2)), 2);
    $PUD9_OMY2 = round((6 * abs($CCC9_MY2)) / (pow($L2, 2) * $B2), 2);
    $PUD9_OTOT2 = round($PUD9_OP2 + $PUD9_OMX2 + $PUD9_OMY2, 2);

    $OT_ULT2 = max(
        $PUD1_OTOT2,
        $PUD2_OTOT2,
        $PUD3_OTOT2,
        $PUD4_OTOT2,
        $PUD5_OTOT2,
        $PUD6_OTOT2,
        $PUD7_OTOT2,
        $PUD8_OTOT2,
        $PUD9_OTOT2,
    );

    // CÁLCULO DE LAS FUERZAS ÚLTIMAS EN LA BASE DE LA ZAPATA

    // Qu(1.4D+1.7)(ton-m)
    $CFUBZ1_2 = $PUD1_OTOT2 * $B2;

    // Qu(1.25*(D+L)+EQX)(ton-m)
    $CFUBZ2_MAX_2 = round(max($PUD2_OTOT2, $PUD3_OTOT2) * $B2, 2);
    $CFUBZ2_MIN_2 = round(min($PUD2_OTOT2, $PUD3_OTOT2) * $B2, 2);

    // Qu(1.25*(D+L)+EQY)(ton-m)
    $CFUBZ3_MAX_2 = round(max($PUD4_OTOT2, $PUD5_OTOT2) * $B2, 2);
    $CFUBZ3_MIN_2 = round(min($PUD4_OTOT2, $PUD5_OTOT2) * $B2, 2);

    // VERIFICACIÓN DE EXCENTRICIDADES
    // CM+CV
    // FA
    $VE1_FA1_2 = $PSCS1_OP2;
    $VE1_FA2_2 = $PSCS1_OP2;
    $VE1_FA3_2 = $PSCS1_OP2;
    $VE1_FA4_2 = $PSCS1_OP2;

    // MX
    $VE1_MX1_2 = $PSCS1_OMX2;
    $VE1_MX2_2 = $PSCS1_OMX2;
    $VE1_MX3_2 = -1 * $PSCS1_OMX2;
    $VE1_MX4_2 = -1 * $PSCS1_OMX2;

    // MY
    $VE1_MY1_2 = -1 * $PSCS1_OMY2;
    $VE1_MY2_2 = $PSCS1_OMY2;
    $VE1_MY3_2 = -1 * $PSCS1_OMY2;
    $VE1_MY4_2 = $PSCS1_OMY2;

    // RESULTANTE
    $VE1_R1_2 = $VE1_FA1_2 + $VE1_MX1_2 + $VE1_MY1_2;
    $VE1_R2_2 = $VE1_FA2_2 + $VE1_MX2_2 + $VE1_MY2_2;
    $VE1_R3_2 = $VE1_FA3_2 + $VE1_MX3_2 + $VE1_MY3_2;
    $VE1_R4_2 = $VE1_FA4_2 + $VE1_MX4_2 + $VE1_MY4_2;

    if ($VE1_R1_2 >= 0 && $VE1_R2_2 >= 0) {
        $VE_TEXT_F1_2 = 'Cumple';
    } else {
        $VE_TEXT_F1_2 = 'No Cumple';
    }

    if ($VE1_R3_2 >= 0 && $VE1_R4_2 >= 0) {
        $VE_TEXT_F2_2 = 'Cumple';
    } else {
        $VE_TEXT_F2_2 = 'No Cumple';
    }

    // CM+CV+0.8Sx
    // FA
    $VE2_FA1_2 = $PSCS2_OP2;
    $VE2_FA2_2 = $PSCS2_OP2;
    $VE2_FA3_2 = $PSCS2_OP2;
    $VE2_FA4_2 = $PSCS2_OP2;

    // MX
    $VE2_MX1_2 = $PSCS2_OMX2;
    $VE2_MX2_2 = $PSCS2_OMX2;
    $VE2_MX3_2 = -1 * $PSCS2_OMX2;
    $VE2_MX4_2 = -1 * $PSCS2_OMX2;

    // MY
    $VE2_MY1_2 = -1 * $PSCS2_OMY2;
    $VE2_MY2_2 = $PSCS2_OMY2;
    $VE2_MY3_2 = -1 * $PSCS2_OMY2;
    $VE2_MY4_2 = $PSCS2_OMY2;

    // RESULTANTE
    $VE2_R1_2 = $VE2_FA1_2 + $VE2_MX1_2 + $VE2_MY1_2;
    $VE2_R2_2 = $VE2_FA2_2 + $VE2_MX2_2 + $VE2_MY2_2;
    $VE2_R3_2 = $VE2_FA3_2 + $VE2_MX3_2 + $VE2_MY3_2;
    $VE2_R4_2 = $VE2_FA4_2 + $VE2_MX4_2 + $VE2_MY4_2;

    if ($VE2_R1_2 >= 0 && $VE2_R2_2 >= 0) {
        $VE_TEXT_F3_2 = 'Cumple';
    } else {
        $VE_TEXT_F3_2 = 'No Cumple';
    }

    if ($VE2_R3_2 >= 0 && $VE2_R4_2 >= 0) {
        $VE_TEXT_F4_2 = 'Cumple';
    } else {
        $VE_TEXT_F4_2 = 'No cumple';
    }

    // CM+CV-0.8Sx
    // FA
    $VE3_FA1_2 = $PSCS3_OP2;
    $VE3_FA2_2 = $PSCS3_OP2;
    $VE3_FA3_2 = $PSCS3_OP2;
    $VE3_FA4_2 = $PSCS3_OP2;

    // MX
    $VE3_MX1_2 = $PSCS3_OMX2;
    $VE3_MX2_2 = $PSCS3_OMX2;
    $VE3_MX3_2 = -1 * $PSCS3_OMX2;
    $VE3_MX4_2 = -1 * $PSCS3_OMX2;

    // MY
    $VE3_MY1_2 = -1 * $PSCS3_OMY2;
    $VE3_MY2_2 = $PSCS3_OMY2;
    $VE3_MY3_2 = -1 * $PSCS3_OMY2;
    $VE3_MY4_2 = $PSCS3_OMY2;

    // RESULTANTE
    $VE3_R1_2 = $VE3_FA1_2 + $VE3_MX1_2 + $VE3_MY1_2;
    $VE3_R2_2 = $VE3_FA2_2 + $VE3_MX2_2 + $VE3_MY2_2;
    $VE3_R3_2 = $VE3_FA3_2 + $VE3_MX3_2 + $VE3_MY3_2;
    $VE3_R4_2 = $VE3_FA4_2 + $VE3_MX4_2 + $VE3_MY4_2;

    if ($VE3_R1_2 >= 0 && $VE3_R2_2 >= 0) {
        $VE_TEXT_F5_2 = 'Cumple';
    } else {
        $VE_TEXT_F5_2 = 'No Cumple';
    }

    if ($VE3_R3_2 >= 0 && $VE3_R4_2 >= 0) {
        $VE_TEXT_F6_2 = 'Cumple';
    } else {
        $VE_TEXT_F6_2 = 'No Cumple';
    }

    // CM+CV+0.8Sy
    // FA
    $VE4_FA1_2 = $PSCS4_OP2;
    $VE4_FA2_2 = $PSCS4_OP2;
    $VE4_FA3_2 = $PSCS4_OP2;
    $VE4_FA4_2 = $PSCS4_OP2;

    // MX
    $VE4_MX1_2 = $PSCS4_OMX2;
    $VE4_MX2_2 = $PSCS4_OMX2;
    $VE4_MX3_2 = -1 * $PSCS4_OMX2;
    $VE4_MX4_2 = -1 * $PSCS4_OMX2;

    // MY
    $VE4_MY1_2 = -1 * $PSCS4_OMY2;
    $VE4_MY2_2 = $PSCS4_OMY2;
    $VE4_MY3_2 = -1 * $PSCS4_OMY2;
    $VE4_MY4_2 = $PSCS4_OMY2;

    // RESULTANTE
    $VE4_R1_2 = $VE4_FA1_2 + $VE4_MX1_2 + $VE4_MY1_2;
    $VE4_R2_2 = $VE4_FA2_2 + $VE4_MX2_2 + $VE4_MY2_2;
    $VE4_R3_2 = $VE4_FA3_2 + $VE4_MX3_2 + $VE4_MY3_2;
    $VE4_R4_2 = $VE4_FA4_2 + $VE4_MX4_2 + $VE4_MY4_2;

    if ($VE4_R1_2 >= 0 && $VE4_R2_2 >= 0) {
        $VE_TEXT_F7_2 = 'Cumple';
    } else {
        $VE_TEXT_F7_2 = 'No Cumple';
    }

    if ($VE4_R3_2 >= 0 && $VE4_R4_2 >= 0) {
        $VE_TEXT_F8_2 = 'Cumple';
    } else {
        $VE_TEXT_F8_2 = 'No Cumple';
    }

    // CM+CV-0.8Sy
    // FA
    $VE5_FA1_2 = $PSCS5_OP2;
    $VE5_FA2_2 = $PSCS5_OP2;
    $VE5_FA3_2 = $PSCS5_OP2;
    $VE5_FA4_2 = $PSCS5_OP2;

    // MX
    $VE5_MX1_2 = $PSCS5_OMX2;
    $VE5_MX2_2 = $PSCS5_OMX2;
    $VE5_MX3_2 = -1 * $PSCS5_OMX2;
    $VE5_MX4_2 = -1 * $PSCS5_OMX2;

    // MY
    $VE5_MY1_2 = -1 * $PSCS5_OMY2;
    $VE5_MY2_2 = $PSCS5_OMY2;
    $VE5_MY3_2 = -1 * $PSCS5_OMY2;
    $VE5_MY4_2 = $PSCS5_OMY2;

    // RESULTANTE
    $VE5_R1_2 = $VE5_FA1_2 + $VE5_MX1_2 + $VE5_MY1_2;
    $VE5_R2_2 = $VE5_FA2_2 + $VE5_MX2_2 + $VE5_MY2_2;
    $VE5_R3_2 = $VE5_FA3_2 + $VE5_MX3_2 + $VE5_MY3_2;
    $VE5_R4_2 = $VE5_FA4_2 + $VE5_MX4_2 + $VE5_MY4_2;

    if ($VE5_R1_2 >= 0 && $VE5_R2_2 >= 0) {
        $VE_TEXT_F9_2 = 'Cumple';
    } else {
        $VE_TEXT_F9_2 = 'No Cumple';
    }

    if ($VE5_R3_2 >= 0 && $VE5_R4_2 >= 0) {
        $VE_TEXT_F10_2 = 'Cumple';
    } else {
        $VE_TEXT_F10_2 = 'No Cumple';
    }

    //DISEÑO POR FLEXION

    // Direccion XX
    // COL 1

    // $O_DIS_COL1 = 43.30;
    $O_DIS_COL1 = $OT_ULT;
    //lv
    $lv_sal_col1 = round($lv_col1 * $d_col1, 2);

    //b
    $b1_sal = round($d_col1 * $lv_col1 + $t1_col1 * 100, 2);

    //mu
    $MU_COL1 = round((($O_DIS_COL1 * $B * pow($lv_sal_col1 / 100, 2)) / 2) * 1000, 2);

    //p
    $RAIZ_COL = 1 - (2 * $MU_COL1) / ($fi_general * $B * pow($d_col1, 2) * 0.85 * $fc);
    $P_COL1 = ((0.85 * $fc) / $fy) * (1 - sqrt($RAIZ_COL));
    $P_COL1 = round($P_COL1, 4);

    //As
    $MAX_P_COL1 = max($P_COL1, $pmin_col1);
    $AS_COL1 = $MAX_P_COL1 * $B * 100 * $hz * 100;

    //Av
    $Avx_col1 = $VarillaX_Col1;

    //#var
    $num_var_col1 = round($AS_COL1 / $Avx_col1, 1);

    //Esp.  S
    $esp_sx_col1 = round(($B * 100) / $num_var_col1, 1);

    //usar
    $opcionesVarillas = [
        '0' => 'Ø 0"',
        '0.28' => '6mm',
        '0.5' => '8mm',
        '0.71' => 'Ø 3/8"',
        '1.13' => '12mm',
        '1.29' => 'Ø 1/2"',
        '1.99' => 'Ø 5/8"',
        '2.84' => 'Ø 3/4"',
        '5.1' => 'Ø 1"',
        '10.06' => 'Ø 1 3/8"',
    ];

    $textovarillaX1 = '';

    // Verificar si el valor buscado existe en el array y guardar el texto asociado
    if (array_key_exists($Avx_col1, $opcionesVarillas)) {
        $textovarillaX1 = $opcionesVarillas[$Avx_col1];
    }

    $usarX_col1 = ' ø ' . $textovarillaX1 . ' @ ' . $esp_sx_col1;

    // COL 2
    // $O_DIS_COL2 = 43.30;
    $O_DIS_COL2 = $OT_ULT2;
    //lv
    $lv_sal_col2 = $lv_col2 * $d_col2;

    //b
    $b2_sal = 2 * $d_col2 * $lv_col2 + $t1_col2 * 100;

    //mu
    $MU_COL2 = round((($O_DIS_COL2 * $B * pow($lv_sal_col2 / 100, 2)) / 2) * 1000, 2);

    //p
    $RAIZ_COL2 = 1 - (2 * $MU_COL2) / ($fi_general * $B * pow($d_col2, 2) * 0.85 * $fc);
    $P_COL2 = ((0.85 * $fc) / $fy) * (1 - sqrt($RAIZ_COL2));
    $P_COL2 = round($P_COL2, 4);

    //As
    $MAX_P_COL2 = max($P_COL2, $pmin_col2);
    $AS_COL2 = $MAX_P_COL2 * $B * 100 * $hz * 100;

    //Av
    $Avx_col2 = $VarillaX_Col2;

    //#var
    $num_var_col2 = round($AS_COL2 / $Avx_col2, 1);

    //Esp.  S
    $esp_sx_col2 = round(($B * 100) / $num_var_col2, 1);

    //usar

    $textovarillaX2 = '';

    // Verificar si el valor buscado existe en el array y guardar el texto asociado
    if (array_key_exists($Avx_col2, $opcionesVarillas)) {
        $textovarillaX2 = $opcionesVarillas[$Avx_col2];
    }

    $usarX_col2 = ' ø ' . $textovarillaX2 . ' @ ' . $esp_sx_col2;

    // Direccion YY
    // COL 1

    $O_DIS_COL1 = 43.3;
    //lv
    $lv_salY_col1 = $lv_sal_col1;

    //mu
    $MUY_COLY1 = round((($O_DIS_COL1 * $m1 * pow($b1_sal / 100, 2)) / 2) * 1000, 2);

    //p
    $RAIZY_COL = 1 - (2 * $MUY_COLY1) / ((($fi_general * $b1_sal) / 100) * pow($d_col1, 2) * 0.85 * $fc);
    $PY_COL1 = ((0.85 * $fc) / $fy) * (1 - sqrt($RAIZY_COL));
    $PY_COL1 = round($PY_COL1, 4);

    //As
    $MAXY_P_COL1 = max($PY_COL1, $pmin_col1);
    $ASY_COL1 = $MAXY_P_COL1 * $b1_sal * $hz * 100;

    //Av
    $Avy_col1 = $VarillaX_Col1;

    //#var
    $numY_var_col1 = round($ASY_COL1 / $Avy_col1, 1);

    //Esp.  S
    $esp_sy_col1 = round(($lv_sal_col1 + $t1_col1 * 100) / $numY_var_col1, 1);

    $textovarillaY1 = '';

    // Verificar si el valor buscado existe en el array y guardar el texto asociado
    if (array_key_exists($Avy_col1, $opcionesVarillas)) {
        $textovarillaY1 = $opcionesVarillas[$Avy_col1];
    }

    $usarY_col1 = ' ø ' . $textovarillaY1 . ' @ ' . $esp_sy_col1;

    // COL 2
    $O_DIS_COL2 = 43.3;
    //lv
    $lv_salY_col2 = $lv_sal_col1;

    //mu
    $MUY_COLY2 = round((($O_DIS_COL2 * $m2 * pow($b2_sal / 100, 2)) / 2) * 1000, 2);

    //p
    $RAIZY_COL2 = 1 - (2 * $MUY_COLY2) / ((($fi_general * $b2_sal) / 100) * pow($d_col2, 2) * 0.85 * $fc);
    $PY_COL2 = ((0.85 * $fc) / $fy) * (1 - sqrt($RAIZY_COL2));
    $PY_COL2 = round($PY_COL2, 4);

    //As
    $MAXY_P_COL2 = max($PY_COL2, $pmin_col2);
    $ASY_COL2 = $MAXY_P_COL2 * $b2_sal * $hz * 100;

    //Av
    $Avy_col2 = $VarillaX_Col2;

    //#var
    $numY_var_col2 = round($ASY_COL2 / $Avy_col2, 1);

    //Esp.  S
    $esp_sy_col2 = round($b2_sal / $numY_var_col2, 1);

    $textovarillaY2 = '';

    // Verificar si el valor buscado existe en el array y guardar el texto asociado
    if (array_key_exists($Avy_col2, $opcionesVarillas)) {
        $textovarillaY2 = $opcionesVarillas[$Avy_col2];
    }

    $usarY_col2 = ' ø ' . $textovarillaY2 . ' @ ' . $esp_sy_col2;

    //CORTE Y PUNZONAMIENTO
    //COL 1
    //area zapata
    $Areaz_col1 = $L * $B * 10000;

    //Perimetro por punzonamiento
    $PerimetroP_col1 = $t2_col1 * 100 + $dvc_col1 + 2 * ($t1_col1 * 100 + 0.5 * $dvc_col1);

    //Area por punzonamiento
    $AreaP_col1 = $PerimetroP_col1 * $dvc_col1;

    //COLUMNA 1
    if ($selectVFColumna1 === 'fila1_col1') {
        $P_COL1_CP = $CCU1_P;
        $MX_COL1_CP = $CCC1_MX;
        $MY_COL1_CP = $CCC1_MY;
        $texto_VFColumna1 = '1.4CM+1.7CV';
    } elseif ($selectVFColumna1 === 'fila2_col1') {
        $P_COL1_CP = $CCC2_P;
        $MX_COL1_CP = $CCC2_MX;
        $MY_COL1_CP = $CCC2_MY;
        $texto_VFColumna1 = '1.25(CM+CV)+Sx';
    } elseif ($selectVFColumna1 === 'fila3_col1') {
        $P_COL1_CP = $CCC3_P;
        $MX_COL1_CP = $CCC3_MX;
        $MY_COL1_CP = $CCC3_MY;
        $texto_VFColumna1 = '1.25(CM+CV)-Sx';
    } elseif ($selectVFColumna1 === 'fila4_col1') {
        $P_COL1_CP = $CCC4_P;
        $MX_COL1_CP = $CCC4_MX;
        $MY_COL1_CP = $CCC4_MY;
        $texto_VFColumna1 = '1.25(CM+CV)+Sy';
    } elseif ($selectVFColumna1 === 'fila5_col1') {
        $P_COL1_CP = $CCC5_P;
        $MX_COL1_CP = $CCC5_MX;
        $MY_COL1_CP = $CCC5_MY;
        $texto_VFColumna1 = '1.25(CM+CV)-Sy';
    } elseif ($selectVFColumna1 === 'fila6_col1') {
        $P_COL1_CP = $CCC6_P;
        $MX_COL1_CP = $CCC6_MX;
        $MY_COL1_CP = $CCC6_MY;
        $texto_VFColumna1 = '0.9CM+Sx';
    } elseif ($selectVFColumna1 === 'fila7_col1') {
        $P_COL1_CP = $CCC7_P;
        $MX_COL1_CP = $CCC7_MX;
        $MY_COL1_CP = $CCC7_MY;
        $texto_VFColumna1 = '0.9CM-Sx';
    } elseif ($selectVFColumna1 === 'fila8_col1') {
        $P_COL1_CP = $CCC8_P;
        $MX_COL1_CP = $CCC8_MX;
        $MY_COL1_CP = $CCC8_MY;
        $texto_VFColumna1 = '0.9CM+Sy';
    } elseif ($selectVFColumna1 === 'fila9_col1') {
        $P_COL1_CP = $CCC9_P;
        $MX_COL1_CP = $CCC9_MX;
        $MY_COL1_CP = $CCC9_MY;
        $texto_VFColumna1 = '0.9CM-Sy';
    }

    //COLUMNA 2
    if ($selectVFColumna2 === 'fila1_col2') {
        $P_COL2_CP = $CCU1_P2;
        $MX_COL2_CP = $CCC1_MX2;
        $MY_COL2_CP = $CCC1_MY2;
        $texto_VFColumna2 = '1.4CM+1.7CV';
    } elseif ($selectVFColumna2 === 'fila2_col2') {
        $P_COL2_CP = $CCC2_P2;
        $MX_COL2_CP = $CCC2_MX2;
        $MY_COL2_CP = $CCC2_MY2;
        $texto_VFColumna2 = '1.25(CM+CV)+Sx';
    } elseif ($selectVFColumna2 === 'fila3_col2') {
        $P_COL2_CP = $CCC3_P2;
        $MX_COL2_CP = $CCC3_MX2;
        $MY_COL2_CP = $CCC3_MY2;
        $texto_VFColumna2 = '1.25(CM+CV)-Sx';
    } elseif ($selectVFColumna2 === 'fila4_col2') {
        $P_COL2_CP = $CCC4_P2;
        $MX_COL2_CP = $CCC4_MX2;
        $MY_COL2_CP = $CCC4_MY2;
        $texto_VFColumna2 = '1.25(CM+CV)+Sy';
    } elseif ($selectVFColumna2 === 'fila5_col2') {
        $P_COL2_CP = $CCC5_P2;
        $MX_COL2_CP = $CCC5_MX2;
        $MY_COL2_CP = $CCC5_MY2;
        $texto_VFColumna2 = '1.25(CM+CV)-Sy';
    } elseif ($selectVFColumna2 === 'fila6_col2') {
        $P_COL2_CP = $CCC6_P2;
        $MX_COL2_CP = $CCC6_MX2;
        $MY_COL2_CP = $CCC6_MY2;
        $texto_VFColumna2 = '0.9CM+Sx';
    } elseif ($selectVFColumna2 === 'fila7_col2') {
        $P_COL2_CP = $CCC7_P2;
        $MX_COL2_CP = $CCC7_MX2;
        $MY_COL2_CP = $CCC7_MY2;
        $texto_VFColumna2 = '0.9CM-Sx';
    } elseif ($selectVFColumna2 === 'fila8_col2') {
        $P_COL2_CP = $CCC8_P2;
        $MX_COL2_CP = $CCC8_MX2;
        $MY_COL2_CP = $CCC8_MY2;
        $texto_VFColumna2 = '0.9CM+Sy';
    } elseif ($selectVFColumna2 === 'fila9_col2') {
        $P_COL2_CP = $CCC9_P2;
        $MX_COL2_CP = $CCC9_MX2;
        $MY_COL2_CP = $CCC9_MY2;
        $texto_VFColumna2 = '0.9CM-Sy';
    }
    $P_CP = $P_COL1_CP + $P_COL2_CP;
    $MX_CP = $MX_COL1_CP + $MX_COL2_CP;

    $B11_CP = 0.5 * $L - 0.5 * $t1_col1;
    $G11_CP = 0.5 * $L - ($m2 + 0.5 * $t1_col2);
    $MY_CP = -1 * $MY_COL1_CP - $MY_COL2_CP - $P_COL1_CP * $B11_CP + $P_COL2_CP * $G11_CP;

    // Utilizar el valor obtenido
    $CY_CP = $L / 2;
    $LX_CP = ($B * $L * $L * $L) / 12;
    $COL1_O_CP = $P_CP / ($B * $L) + ($MY_CP * $CY_CP) / $LX_CP;
    $COL2_O_CP = $P_CP / ($B * $L) - ($MY_CP * $CY_CP) / $LX_CP;
    $O_CP = max($COL1_O_CP, $COL2_O_CP);
    $OF_CP = round($O_CP * $B, 2);


    //Cortante Critico Por Punzonamiento
    $CortanteCP_col1 = ($P_COL1_CP * 1000) - ($OF_CP * 1000) * ($t2_col1 + ($dvc_col1 / 100)) * ($t1_col1 + (0.5 * $dvc_col1 / 100));
    $CortanteCP_col1 = round($CortanteCP_col1, 2);

    // var_dump($selectVFColumna1);
    // var_dump($selectVFColumna2);
    // var_dump($P_COL1_CP);
    // var_dump($OF_CP);
    // var_dump($dvc_col1);
    // var_dump($t1_col1);
    // var_dump($t2_col1);
    // $Vu= ;

    //Factor de DIm de la columna
    $Maxt1_t2_col1 = max($t1_col1, $t2_col1);
    $Mint1_t2_col1 = min($t1_col1, $t2_col1);
    $FactorDim_col1 = $Maxt1_t2_col1 / $Mint1_t2_col1;

    // Tipo de Columna y Factor α
    $fa_Col1 = $fa_Col1;
    $Raiz =
        sqrt($fc);
    //caso1
    $Vc = round(0.53 * $ovcp * (1 + (2 / $FactorDim_col1)) * $Raiz * $PerimetroP_col1 * $dvc_col1, 2);

    //resultado
    if ($Vc > $CortanteCP_col1) {
        $ResultadoCol1VC = "Cumple";
    } else {
        $ResultadoCol1VC = "No Cumple";
    }

    //caso2
    $Vc1 = round(1.06 * $ovcp * sqrt($fc) * $PerimetroP_col1 * $dvc_col1, 2);

    //resultado
    if ($Vc1 > $CortanteCP_col1) {
        $ResultadoCol1VC1 = "Cumple";
    } else {
        $ResultadoCol1VC1 = "No Cumple";
    }

    //caso3
    $Vc2 = round(0.27 * $ovcp * (2 + (($fa_Col1 * $dvc_col1) / $PerimetroP_col1)) * $Raiz * $PerimetroP_col1 * $dvc_col1, 2);

    //resultado
    if ($Vc2 > $CortanteCP_col1) {
        $ResultadoCol1VC2 = "Cumple";
    } else {
        $ResultadoCol1VC2 = "No Cumple";
    }

    //COL 2
    //area zapata
    $Areaz_col2 = $L * $B * 10000;

    //Perimetro por punzonamiento
    $PerimetroP_col2 = 2 * ($t1_col2 * 100 + $dvc_col2) + 2 * ($t2_col2 * 100 + $dvc_col2);

    //Area por punzonamiento
    $AreaP_col2 = $PerimetroP_col2 * $dvc_col1;

    //Cortante Critico Por Punzonamiento
    $CortanteCP_col2 = $P_COL2_CP * 1000 - $OF_CP * 1000 * ($t1_col1 + $dvc_col1 / 100) * ($t2_col2 + $dvc_col1 / 100);
    $CortanteCP_col2 = round($CortanteCP_col2, 2);
    //Factor de DIm de la columna
    $Maxt1_t2_col2 = max($t1_col2, $t2_col2);
    $Mint1_t2_col2 = min($t1_col2, $t2_col2);
    $FactorDim_col2 = $Maxt1_t2_col2 / $Mint1_t2_col2;

    // Tipo de Columna y Factor α
    $fa_Col2 = $fa_Col2;
    $Raiz = sqrt($fc);
    //caso1
    $Vc_c2 = round(0.53 * $ovcp * (1 + (2 / $FactorDim_col1)) * $Raiz * $PerimetroP_col1 * $dvc_col1, 2);

    //resultado
    if ($Vc_c2 > $CortanteCP_col2) {
        $ResultadoCol2VC = "Cumple";
    } else {
        $ResultadoCol2VC = "No Cumple";
    }

    //caso2
    $Vc1_c2 = round(1.06 * $ovcp * sqrt($fc) * $PerimetroP_col1 * $dvc_col1, 2);

    //resultado
    if ($Vc1_c2 > $CortanteCP_col2) {
        $ResultadoCol2VC1 = "Cumple";
    } else {
        $ResultadoCol2VC1 = "No Cumple";
    }

    //caso3
    $Vc2_c2 = round(0.27 * $ovcp * (2 + (($fa_Col2 * $dvc_col2) / $PerimetroP_col2)) * $Raiz * $PerimetroP_col1 * $dvc_col1, 2);

    //resultado
    if ($Vc2_c2 > $CortanteCP_col2) {
        $ResultadoCol2VC2 = "Cumple";
    } else {
        $ResultadoCol2VC2 = "No Cumple";
    }
@endphp
<div class="overflow-x-auto">
    <table id="" class="min-w-full text-gray-800 dark:text-white">
        <!-- Requisitos de diseño vigas -->
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">1.- Requisitos de diseño</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="5">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Descripción</td>
                <td class='py-2 px-4 text-center'>Des</td>
                <td class='py-2 px-4 text-center' colspan="5"> {{ $des }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>qa</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $qa }} Ton/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Presión de Servicio</td>
                <td class='py-2 px-4 text-center'>P servicio</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $p_servicio }} Ton</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Fluencia del acero</td>
                <td class='py-2 px-4 text-center'>fy</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $fy }} Kgf/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Resistencia a compresión del concreto</td>
                <td class='py-2 px-4 text-center'>fc</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $fc }} Kgf/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Profundidad de desplante</td>
                <td class='py-2 px-4 text-center'>Df</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $df }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>S/C</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $sc }} Kg/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>ym</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $ym }} Kg/m<sup>3</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>hc</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $hc }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>σt</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $ot }} Kg/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>hz</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $hz }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>m1</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $m1 }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>m2</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $m2 }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>r</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $r }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>rec</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $rec }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>Le</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $Le }} m</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">Medidas de la columna 1</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>t1</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $t1_col1 }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>t2</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $t2_col1 }} m</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">Medidas de la columna 2</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>t1</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $t1_col2 }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>t2</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $t2_col2 }} m</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">Combinación de cargas en la columna 1</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">P(tonf) </td>
                <td class='py-2 px-4 text-center'>Mx (tonf-m)</td>
                <td class='py-2 px-4 text-center' colspan="2">My (tonf-m)</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Carga Muerta</td>
                <td class='py-2 px-4 text-center'>CM</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CM_P }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_Mx }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CM_My }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Carga Viva</td>
                <td class='py-2 px-4 text-center'>CV</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CV_P }}</td>
                <td class='py-2 px-4 text-center'>{{ $CV_Mx }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CV_My }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Carga Sismo Ex</td>
                <td class='py-2 px-4 text-center'>CSx</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CSx_P }}</td>
                <td class='py-2 px-4 text-center'>{{ $CSx_Mx }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CSx_My }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Carga Sismo Ey</td>
                <td class='py-2 px-4 text-center'>CSy</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CSy_P }}</td>
                <td class='py-2 px-4 text-center'>{{ $CSy_Mx }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CSy_My }}</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">Combinación de cargas en la columna 2</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">P(tonf) </td>
                <td class='py-2 px-4 text-center'>Mx (tonf-m)</td>
                <td class='py-2 px-4 text-center' colspan="2">My (tonf-m)</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Carga Muerta</td>
                <td class='py-2 px-4 text-center'>CM</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CM_P2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_Mx2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CM_My2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Carga Viva</td>
                <td class='py-2 px-4 text-center'>CV</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CV_P2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CV_Mx2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CV_My2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Carga Sismo Ex</td>
                <td class='py-2 px-4 text-center'>CSx</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CSx_P2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CSx_Mx2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CSx_My2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Carga Sismo Ey</td>
                <td class='py-2 px-4 text-center'>CSy</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CSy_P2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CSy_Mx2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CSy_My2 }}</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">Verificación de cortante</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Columna 1 - Preciones</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $preciones_Columna1_dato }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Columna 2 - Preciones</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $preciones_Columna2_dato }} m</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">Diseño por Flexión de Zapatas</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 1</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 2</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>d</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $d_col1 }}</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $d_col2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>lv</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lv_col1 }}</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lv_col2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>pmin</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pmin_col1 }}</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $pmin_col2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>Ф Varilla</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $Varilla1texto }}</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $Varilla22texto }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>Preciones</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $texto_VFColumna1 }}</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $texto_VFColumna2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>φ</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $fi_general }}</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">Verificación por Corte y Punzonamiento</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 1</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 2</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>d</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $dvc_col1 }}</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $dvc_col2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>r</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $r_vc_col1 }}</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $r_vc_col2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>Ф Varilla</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $VarillaVC1texto }}</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $VarillaVC2texto }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Tipo de Columna y Factor α</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $texto_columna_fa1 . ' - ' . $fa_Col1 }}</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $texto_columna_fa2 . ' - ' . $fa_Col2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>-</td>
                <td class='py-2 px-4 text-center'>φ</td>
                <td class='py-2 px-4 text-center' colspan="5">{{ $ovcp }}</td>
            </tr>
        </tbody>

        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">2. Predimencionamiento de zapatas</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                <th class="text-lg py-2 px-4" scope="col">Formula</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="4">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Area de la Zapata</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center'>p servicio / (qa * fk)</td>
                <td class='py-2 px-4 text-center' colspan="4">{{ $Az }} m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>B</td>
                <td class='py-2 px-4 text-center'>t2 + m1 + t2</td>
                <td class='py-2 px-4 text-center'colspan="4" id="valor_b">{{ $B }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>L</td>
                <td class='py-2 px-4 text-center'>0.5 * t1(col1) + Le + 0.5 * t1(col2) + m2</td>
                <td class='py-2 px-4 text-center' colspan="4" id="valor_L">{{ $L }} m</td>
            </tr>
        </tbody>

        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">3. Combinaciónn de cargas</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="7">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Descripción</td>
                <td class='py-2 px-4 text-center' colspan="3">Columna 1</td>
                <td class='py-2 px-4 text-center' colspan="3">Columna 2</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Combinaciones de cargas de servicio</td>
                <td class='py-2 px-4 text-center'>P (tonf)</td>
                <td class='py-2 px-4 text-center'>Mx (tonf-m)</td>
                <td class='py-2 px-4 text-center'>My (tonf-m)</td>
                <td class='py-2 px-4 text-center'>P (tonf)</td>
                <td class='py-2 px-4 text-center'>Mx (tonf-m)</td>
                <td class='py-2 px-4 text-center'>My (tonf-m)</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_P }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_MX }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_MY }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_P2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_MX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_MY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV + 0.8 Sx</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_sumP }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_sumMX }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_sumMY }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_sumP2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_sumMX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_sumMY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8 Sx</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_restP }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_restMX }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_restMY }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_restP2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_restMX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SX_restMY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV + 0.8 Sy</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_sumP }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_sumMX }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_sumMY }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_sumP2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_sumMX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_sumMY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8 Sy</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_restP }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_restMX }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_restMY }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_restP2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_restMX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CM_CV_8SY_restMY2 }}</td>
            </tr>
        </tbody>

        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">3.2 Combinaciones de Carga Últimas</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="6">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            {{-- Columna 1 --}}
            <tr class="bg-gray-100 dark:bg-gray-500">
                <td class='py-2 px-4'>Descripción</td>
                <td class='py-2 px-4 text-center' colspan="6">Columna 1</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Combinaciones de cargas de servicio</td>
                <td colspan="2" class='py-2 px-4 text-center'>P (tonf)</td>
                <td colspan="2" class='py-2 px-4 text-center'>Mx (tonf-m)</td>
                <td colspan="2" class='py-2 px-4 text-center'>My (tonf-m)</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila1_col1">
                <td class='py-2 px-4'>1.4*CM + 1.7*CV</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCU1_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC1_MX }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC1_MY }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila2_col1">
                <td class='py-2 px-4'>1.25(CM+CV) + Sx</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC2_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC2_MX }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC2_MY }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila3_col1">
                <td class='py-2 px-4'>1.25(CM+CV) - Sx</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC3_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC3_MX }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC3_MY }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila4_col1">
                <td class='py-2 px-4'>1.25(CM+CV) + Sy</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC4_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC4_MX }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC4_MY }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila5_col1">
                <td class='py-2 px-4'>1.25(CM+CV) - Sy</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC5_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC5_MX }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC5_MY }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila6_col1">
                <td class='py-2 px-4'>0.9CM + Sx</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC6_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC6_MX }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC6_MY }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila7_col1">
                <td class='py-2 px-4'>0.9CM + Sx</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC7_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC7_MX }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC7_MY }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila8_col1">
                <td class='py-2 px-4'>0.9CM + Sy</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC8_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC8_MX }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC8_MY }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila9_col1">
                <td class='py-2 px-4'>0.9CM - Sy</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC9_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC9_MX }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC9_MY }}</td>
            </tr>
            {{-- Columna 2 --}}
            <tr class="bg-gray-100 dark:bg-gray-500">
                <td class='py-2 px-4'>Descripción</td>
                <td class='py-2 px-4 text-center' colspan="6">Columna 2</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Combinaciones de cargas de servicio</td>
                <td colspan="2" class='py-2 px-4 text-center'>P (tonf)</td>
                <td colspan="2" class='py-2 px-4 text-center'>Mx (tonf-m)</td>
                <td colspan="2" class='py-2 px-4 text-center'>My (tonf-m)</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila1_col2">
                <td class='py-2 px-4'>1.4*CM + 1.7*CV</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCU1_P2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC1_MX2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC1_MY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila2_col2">
                <td class='py-2 px-4'>1.25(CM+CV) + Sx</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC2_P2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC2_MX2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC2_MY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila3_col2">
                <td class='py-2 px-4'>1.25(CM+CV) - Sx</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC3_P }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC3_MX2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC3_MY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila4_col2">
                <td class='py-2 px-4'>1.25(CM+CV) + Sy</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC4_P2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC4_MX2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC4_MY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila5_col2">
                <td class='py-2 px-4'>1.25(CM+CV) - Sy</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC5_P2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC5_MX2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC5_MY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila6_col2">
                <td class='py-2 px-4'>0.9CM + Sx</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC6_P2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC6_MX2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC6_MY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila7_col2">
                <td class='py-2 px-4'>0.9CM - Sx</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC7_P2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC7_MX2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC7_MY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila8_col2">
                <td class='py-2 px-4'>0.9CM + Sy</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC8_P2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC8_MX2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC8_MY2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600" id="fila9_col2">
                <td class='py-2 px-4'>0.9CM - Sy</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC9_P2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC9_MX2 }}</td>
                <td colspan="2" class='py-2 px-4 text-center'>{{ $CCC9_MY2 }}</td>
            </tr>
        </tbody>

        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">3.2 Presiones en el Suelo en Condiciones de
                    Servicio</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="6">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-300 dark:bg-gray-500">
                <td class='py-2 px-4 text-center' colspan="7">Columna 1</td>
            </tr>
            <tr class="bg-gray-300 dark:bg-gray-500">
                <td class='py-2 px-4 text-center'>σ<sub>p</sub> (tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center'>σ<sub>Mx </sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center'>σ<sub>My</sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center' colspan="2">σ<sub>tot</sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center'>σ<sub>σ<sub>tot</sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center'>σ<sub>σ<sub>s</sub>(tonf/m<sup>2</sup> )</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS1_OP }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS1_OMX }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS1_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS1_OS }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS1_COND }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS2_OP }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS2_OMX }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS2_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS2_OS }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS2_COND }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS3_OP }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS3_OMX }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS3_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS3_OS }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS3_COND }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS4_OP }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS4_OMX }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS4_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS4_OS }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS4_COND }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS5_OP }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS5_OMX }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS5_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS5_OS }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS5_COND }}</td>
            </tr>
            <tr class="bg-gray-300 dark:bg-gray-500">
                <td class='py-2 px-4 text-center' colspan="7">Columna 2</td>
            </tr>
            <tr class="bg-gray-300 dark:bg-gray-500">
                <td class='py-2 px-4 text-center'>σ<sub>p</sub> (tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center'>σ<sub>Mx </sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center'>σ<sub>My</sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center' colspan="2">σ<sub>tot</sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center'>σ<sub>σ<sub>tot</sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center'>σ<sub>σ<sub>s</sub>(tonf/m<sup>2</sup> )</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS1_OP2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS1_OMX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS1_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS1_OS2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS1_COND2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS2_OP2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS2_OMX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS2_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS2_OS2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS2_COND2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS3_OP2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS3_OMX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS3_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS3_OS2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS3_COND2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS4_OP2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS4_OMX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS4_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS4_OS2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS4_COND2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>{{ $PSCS5_OP2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS5_OMX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS5_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PSCS1_OTOT2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS5_OS2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $PSCS5_COND2 }}</td>
            </tr>
        </tbody>

        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">3.4 Presiones Últimos de Diseño</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="6">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-300 dark:bg-gray-500">
                <td class='py-2 px-4 text-center' colspan="7">Columna 1</td>
            </tr>
            <tr class="bg-gray-300 dark:bg-gray-500">
                <td class='py-2 px-4 text-center'>Combinaciones de cargas de servicio</td>
                <td class='py-2 px-4 text-center'>σ<sub>p</sub> (tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center' colspan="1">σ<sub>Mx</sub> (tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center' colspan="2">σ<sub>My</sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center' colspan="2">σ<sub>tot</sub>(tonf/m<sup>2</sup> )</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.4CM + 1.7CV</td>
                <td class='py-2 px-4 text-center'>{{ $PUD1_OP }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD1_OMX }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD1_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD1_OTOT }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.25(CM+CV) + Sx</td>
                <td class='py-2 px-4 text-center'>{{ $PUD2_OP }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD2_OMX }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD2_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD2_OTOT }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.25(CM+CV) - Sx</td>
                <td class='py-2 px-4 text-center'>{{ $PUD3_OP }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD3_OMX }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD3_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD3_OTOT }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.25(CM+CV) + Sy</td>
                <td class='py-2 px-4 text-center'>{{ $PUD4_OP }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD4_OMX }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD4_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD4_OTOT }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.25(CM+CV) - Sy</td>
                <td class='py-2 px-4 text-center'>{{ $PUD5_OP }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD5_OMX }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD5_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD5_OTOT }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>0.9CM + Sx</td>
                <td class='py-2 px-4 text-center'>{{ $PUD6_OP }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD6_OMX }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD6_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD6_OTOT }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>0.9CM - Sx</td>
                <td class='py-2 px-4 text-center'>{{ $PUD7_OP }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD7_OMX }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD7_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD7_OTOT }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>0.9CM + Sy</td>
                <td class='py-2 px-4 text-center'>{{ $PUD8_OP }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD8_OMX }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD8_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD8_OTOT }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>0.9CM - Sy</td>
                <td class='py-2 px-4 text-center'>{{ $PUD9_OP }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD9_OMX }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD9_OMY }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD9_OTOT }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>σ<sub>ult</sub></td>
                <td class='py-2 px-4 text-center' colspan="6">{{ $OT_ULT }} tonf/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-300 dark:bg-gray-500">
                <td class='py-2 px-4 text-center' colspan="7">Columna 2</td>
            </tr>
            <tr class="bg-gray-300 dark:bg-gray-500">
                <td class='py-2 px-4 text-center'>Combinaciones de cargas de servicio</td>
                <td class='py-2 px-4 text-center'>σ<sub>p</sub> (tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center' colspan="1">σ<sub>Mx</sub> (tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center' colspan="2">σ<sub>My</sub>(tonf/m<sup>2</sup> )</td>
                <td class='py-2 px-4 text-center' colspan="2">σ<sub>tot</sub>(tonf/m<sup>2</sup> )</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.4CM + 1.7CV</td>
                <td class='py-2 px-4 text-center'>{{ $PUD1_OP2 }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD1_OMX2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD1_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD1_OTOT2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.25(CM+CV) + Sx</td>
                <td class='py-2 px-4 text-center'>{{ $PUD2_OP2 }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD2_OMX2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD2_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD2_OTOT2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.25(CM+CV) - Sx</td>
                <td class='py-2 px-4 text-center'>{{ $PUD3_OP2 }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD3_OMX2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD3_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD3_OTOT2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.25(CM+CV) + Sy</td>
                <td class='py-2 px-4 text-center'>{{ $PUD4_OP2 }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD4_OMX2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD4_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD4_OTOT2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>1.25(CM+CV) - Sy</td>
                <td class='py-2 px-4 text-center'>{{ $PUD5_OP2 }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD5_OMX2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD5_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD5_OTOT2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>0.9CM + Sx</td>
                <td class='py-2 px-4 text-center'>{{ $PUD6_OP2 }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD6_OMX2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD6_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD6_OTOT2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>0.9CM - Sx</td>
                <td class='py-2 px-4 text-center'>{{ $PUD7_OP2 }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD7_OMX2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD7_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD7_OTOT2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>0.9CM + Sy</td>
                <td class='py-2 px-4 text-center'>{{ $PUD8_OP2 }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD8_OMX2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD8_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD8_OTOT2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>0.9CM - Sy</td>
                <td class='py-2 px-4 text-center'>{{ $PUD9_OP2 }}</td>
                <td class='py-2 px-4 text-center' colspan="1">{{ $PUD9_OMX2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD9_OMY2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUD9_OTOT2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4 text-center'>σ<sub>ult</sub></td>
                <td class='py-2 px-4 text-center' colspan="6">{{ $OT_ULT2 }} tonf/m<sup>2</sup></td>
            </tr>
        </tbody>

        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">3.5 Cálculo de las Fuerzas Últimas en la Base
                    de la
                    Zapata</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="6">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4' colspan="3">Descripción</td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 1</td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 2</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4' colspan="3">Qu(1.4D+1.7)</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CFUBZ1 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CFUBZ1_2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4' colspan="3"></td>
                <td class='py-2 px-4 text-center'>MAX</td>
                <td class='py-2 px-4 text-center'>MIN</td>
                <td class='py-2 px-4 text-center'>MAX</td>
                <td class='py-2 px-4 text-center'>MIN</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4' colspan="3">Qu(1.25*(D+L)+EQX)</td>
                <td class='py-2 px-4 text-center'>{{ $CFUBZ2_MAX }}</td>
                <td class='py-2 px-4 text-center'>{{ $CFUBZ2_MIN }}</td>
                <td class='py-2 px-4 text-center'>{{ $CFUBZ2_MAX_2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CFUBZ2_MIN_2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4' colspan="3">Qu(1.25*(D+L)+EQY)</td>
                <td class='py-2 px-4 text-center'>{{ $CFUBZ3_MAX }}</td>
                <td class='py-2 px-4 text-center'>{{ $CFUBZ3_MIN }}</td>
                <td class='py-2 px-4 text-center'>{{ $CFUBZ3_MAX_2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $CFUBZ3_MIN_2 }}</td>
            </tr>
        </tbody>
    </table>
</div>
<div class="overflow-x-auto">
    <table class="min-w-full text-gray-800 dark:text-white">
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="10">3.6 Verificación de Excentricidades</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="9">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Descripción</td>
                <td class='py-2 px-4 text-center' colspan="9">Columna 1</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class="py-2 px-4 text-center" colspan="2">Fuerza axial</td>
                <td class="py-2 px-4 text-center" colspan="2">Momento en X</td>
                <td class="py-2 px-4 text-center" colspan="2">Momento en Y</td>
                <td class="py-2 px-4 text-center">R1</td>
                <td class="py-2 px-4 text-center">R2</td>
                <td class="py-2 px-4 text-center">Resultante</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM+CV Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE1_FA1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_FA2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MX1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MX2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MY1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MY2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_R1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_R2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F1 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM+CV Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE1_FA1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_FA2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MX1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MX2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MY1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MY2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_R1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_R2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F1_2 }}</td>
            </tr>

            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM+CV Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE1_FA3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_FA4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MX3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MX4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MY3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MY4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_R3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_R4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM+CV Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE1_FA3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_FA4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MX3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MX4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MY3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_MY4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_R3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE1_R4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F2_2 }}</td>
            </tr>
            <tr class="bg-gray-500 dark:bg-gray-950">
                <th colspan="9"></th>
            </tr>
            {{-- CM+CV+0.8Sx  --}}
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM+CV+0.8Sx Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE2_FA1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_FA2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MX1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MX2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MY1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MY2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_R1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_R2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F3 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM+CV+0.8Sx Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE2_FA1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_FA2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MX1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MX2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MY1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MY2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_R1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_R2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F3_2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM+CV+0.8Sx Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE2_FA3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_FA4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MX3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MX4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MY3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MY4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_R3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_R4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F4 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM+CV+0.8Sx Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE2_FA3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_FA4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MX3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MX4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MY3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_MY4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_R3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE2_R4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F4_2 }}</td>
            </tr>
            <tr class="bg-gray-500 dark:bg-gray-950">
                <th colspan="9"></th>
            </tr>
            {{-- CM + CV - 0.8Sx --}}
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8Sx Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F5 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8Sx Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F5_2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8Sx Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F6 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8Sx Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F6_2 }}</td>
            </tr>
            <tr class="bg-gray-500 dark:bg-gray-950">
                <th colspan="9"></th>
            </tr>
            {{-- CM + CV + 0.8Sy --}}
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV + 0.8Sy Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE4_FA1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_FA2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MX1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MX2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MY1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MY2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_R1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_R2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F7 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV + 0.8Sy Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE4_FA1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_FA2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MX1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MX2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MY1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MY2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_R1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_R2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F7_2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV + 0.8Sy Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE4_FA3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_FA4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MX3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MX4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MY3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MY4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_R3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_R4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F8 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV + 0.8Sy Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE4_FA3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_FA4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MX3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MX4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MY3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_MY4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_R3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE4_R4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F8_2 }}</td>
            </tr>
            <tr class="bg-gray-500 dark:bg-gray-950">
                <th colspan="9"></th>
            </tr>
            {{-- CM + CV - 0.8Sy --}}
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8Sy Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE5_FA1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_FA2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MX1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MX2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MY1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MY2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_R1 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_R2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F9 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8Sy Columna 1</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_FA2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MX2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_MY2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R1_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE3_R2_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F9_2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8Sy Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE5_FA3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_FA4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MX3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MX4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MY3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MY4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_R3 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_R4 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F10 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>CM + CV - 0.8Sy Columna 2</td>
                <td class="py-2 px-4 text-center">{{ $VE5_FA3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_FA4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MX3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MX4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MY3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_MY4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_R3_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE5_R4_2 }}</td>
                <td class="py-2 px-4 text-center">{{ $VE_TEXT_F10_2 }}</td>
            </tr>
        </tbody>
    </table>
</div>
<div class="overflow-x-auto">
    <table class="min-w-full text-gray-800 dark:text-white">
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="5">4.- Diseño por flexion de zapatas</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="4">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'>Descripción</td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 1</td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 2</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Lv</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lv_sal_col1 }}cm</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lv_sal_col2 }}cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>b</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $b1_sal }}cm</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $b2_sal }}cm</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="5">4.1 Dirección X-X</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'>Descripción</td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 1</td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 2</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Mu</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $MU_COL1 }} Kg-m</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $MU_COL2 }} Kg-m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>𝜌</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $P_COL1 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $P_COL2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>As</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $AS_COL1 }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $AS_COL2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Av</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $Avx_col1 }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $Avx_col2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Numero de varillas</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $num_var_col1 }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $num_var_col2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Esp. S</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $esp_sx_col1 }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $esp_sx_col2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Usar</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $usarX_col1 }} cm</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $usarX_col2 }} cm</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="5">4.2 Dirección Y-Y</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'>Descripción</td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 1</td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 2</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Mu</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $MUY_COLY1 }} Kg-m</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $MUY_COLY2 }} Kg-m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>𝜌</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PY_COL1 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PY_COL2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>As</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $ASY_COL1 }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $ASY_COL2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Av</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $Avy_col1 }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $Avy_col2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Numero de varillas</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $numY_var_col1 }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $numY_var_col2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Esp. S</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $esp_sy_col1 }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $esp_sy_col2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Usar</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $usarY_col1 }} cm</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $usarY_col2 }} cm</td>
            </tr>
        </tbody>
    </table>
</div>
<div class="overflow-x-auto">
    <table class="min-w-full text-gray-800 dark:text-white">
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">5.- Corte y Punzonamiento</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Simbolo</th>
                <th class="text-lg py-2 px-4" scope="col">formulas</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="4">Resultado</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'>Descripción</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 1</td>
                <td class='py-2 px-4 text-center' colspan="2">Columna 2</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Area de la Zapata</td>
                <td class='py-2 px-4 text-center'>Az</td>
                <td class='py-2 px-4 text-center'>LxB</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lv_sal_col1 }}cm</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lv_sal_col2 }}cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Perimetro Por Punzonamiento</td>
                <td class='py-2 px-4 text-center'>𝑏𝑜</td>
                <td class='py-2 px-4 text-center'>2∙(𝑡1+0.5𝑑)+2∙(𝑡2+𝑑)</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PerimetroP_col1 }}cm</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PerimetroP_col2 }}cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Area Por Punzonamiento</td>
                <td class='py-2 px-4 text-center'>𝐴𝑝𝑢𝑛</td>
                <td class='py-2 px-4 text-center'>𝑏𝑜(𝑑)</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $AreaP_col1 }}cm</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $AreaP_col2 }}cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Cortante Critico Por Punzonamiento</td>
                <td class='py-2 px-4 text-center'>V𝑢</td>
                <td class='py-2 px-4 text-center'>𝑃𝑢1−𝑊𝑢(𝑡2+𝑑)(𝑡1+0.5𝑑)</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CortanteCP_col1 }}cm</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $CortanteCP_col2 }}cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Factor de Dim de la Columna</td>
                <td class='py-2 px-4 text-center'>𝛽𝑐</td>
                <td class='py-2 px-4 text-center'>𝑡1/𝑡2</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $FactorDim_col1 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $FactorDim_col2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Tipo de Columna y Factor α</td>
                <td class='py-2 px-4 text-center'>α</td>
                <td class='py-2 px-4 text-center'></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $fa_Col1 }}cm</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $fa_Col2 }}cm</td>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>0,53∙∅∙(1+2/𝛽𝑐)∙√(𝑓^′ 𝑐)∙𝑏_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >Vu (Kgf)</td>
                <td class='py-2 px-4 text-center' > < </td>
                <td class='py-2 px-4 text-center' >Ø.Vc (Kgf)</td>
                <td class='py-2 px-4 text-center' >Resultado</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>0,53∙∅∙(1+2/𝛽𝑐)∙√(𝑓^′ 𝑐)∙𝑏_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >{{ $CortanteCP_col1 }}</td>
                <td class='py-2 px-4 text-center' ></td>
                <td class='py-2 px-4 text-center' >{{ $Vc }}</td>
                <td class='py-2 px-4 text-center' >{{ $ResultadoCol1VC }}</td>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>0,53∙∅∙(1+2/𝛽𝑐)∙√(𝑓^′ 𝑐)∙𝑏_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >Vu (Kgf)</td>
                <td class='py-2 px-4 text-center' > < </td>
                <td class='py-2 px-4 text-center' >Ø.Vc (Kgf)</td>
                <td class='py-2 px-4 text-center' >Resultado</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>0,53∙∅∙(1+2/𝛽𝑐)∙√(𝑓^′ 𝑐)∙𝑏_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >{{ $CortanteCP_col2 }}</td>
                <td class='py-2 px-4 text-center' ></td>
                <td class='py-2 px-4 text-center' >{{ $Vc_c2 }}</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $ResultadoCol2VC }}</td>
            </tr>

            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>1.06∙∅∙√(𝑓^′ 𝑐)∙𝑏_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >Vu (Kgf)</td>
                <td class='py-2 px-4 text-center' > < </td>
                <td class='py-2 px-4 text-center' >Ø.Vc (Kgf)</td>
                <td class='py-2 px-4 text-center' >Resultado</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>1.06∙∅∙√(𝑓^′ 𝑐)∙𝑏_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >{{ $CortanteCP_col1 }}</td>
                <td class='py-2 px-4 text-center' ></td>
                <td class='py-2 px-4 text-center' >{{ $Vc1 }}</td>
                <td class='py-2 px-4 text-center' >{{ $ResultadoCol2VC1 }}</td>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>1.06∙∅∙√(𝑓^′ 𝑐)∙𝑏_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >Vu (Kgf)</td>
                <td class='py-2 px-4 text-center' > < </td>
                <td class='py-2 px-4 text-center' >Ø.Vc (Kgf)</td>
                <td class='py-2 px-4 text-center' >Resultado</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>1.06∙∅∙√(𝑓^′ 𝑐)∙𝑏_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >{{ $CortanteCP_col2 }}</td>
                <td class='py-2 px-4 text-center' ></td>
                <td class='py-2 px-4 text-center' >{{ $Vc1 }}</td>
                <td class='py-2 px-4 text-center' >{{ $ResultadoCol2VC1 }}</td>
            </tr>


            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>0,27∙∅∙(2+(𝛼.𝑑)/𝛽𝑜)∙√(𝑓^′ 𝑐) 〖∙𝑏〗_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >Vu (Kgf)</td>
                <td class='py-2 px-4 text-center' > < </td>
                <td class='py-2 px-4 text-center' >Ø.Vc (Kgf)</td>
                <td class='py-2 px-4 text-center' >Resultado</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>0,27∙∅∙(2+(𝛼.𝑑)/𝛽𝑜)∙√(𝑓^′ 𝑐) 〖∙𝑏〗_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >{{ $CortanteCP_col1 }}</td>
                <td class='py-2 px-4 text-center' ></td>
                <td class='py-2 px-4 text-center' >{{ $Vc2 }}</td>
                <td class='py-2 px-4 text-center' >{{ $ResultadoCol1VC2 }}</td>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>0,27∙∅∙(2+(𝛼.𝑑)/𝛽𝑜)∙√(𝑓^′ 𝑐) 〖∙𝑏〗_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >Vu (Kgf)</td>
                <td class='py-2 px-4 text-center' > < </td>
                <td class='py-2 px-4 text-center' >Ø.Vc (Kgf)</td>
                <td class='py-2 px-4 text-center' >Resultado</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>∅𝑉𝑐</td>
                <td class='py-2 px-4 text-center'>1.06∙∅∙√(𝑓^′ 𝑐)∙𝑏_𝑜∙𝑑</td>
                <td class='py-2 px-4 text-center' >{{ $CortanteCP_col2 }}</td>
                <td class='py-2 px-4 text-center' ></td>
                <td class='py-2 px-4 text-center' >{{ $Vc2_c2 }}</td>
                <td class='py-2 px-4 text-center' >{{ $ResultadoCol2VC2 }}</td>
            </tr>
        </tbody>
    </table>
</div>