@php
    $p = [];
    $Mx = [];
    $My = [];

    for ($i = 0; $i < count($CargaCondicionServicio); $i++) {
        $p[] = $CargaCondicionServicio[$i][1];
    }
    for ($i = 0; $i < count($CargaCondicionServicio); $i++) {
        $Mx[] = $CargaCondicionServicio[$i][2];
    }
    for ($i = 0; $i < count($CargaCondicionServicio); $i++) {
        $My[] = $CargaCondicionServicio[$i][3];
    }
    $d = $dzapata;
    $H = ($d + 10) / 100;
    $AZapata = $l * $B;
    $PCime = round(2.4 * $l * $B * $H, 2, PHP_ROUND_HALF_UP);
    $Psu = round(+$ys * $AZapata * ($df - $H), 2, PHP_ROUND_HALF_UP);
    $cPortante = round($cps * 10, 2, PHP_ROUND_HALF_UP);
    $Eneto = round($cPortante - $ys * $df - 0.5, 2, PHP_ROUND_HALF_UP);
    $EsfuerzoNeto = round($cPortante * 0.8, 2, PHP_ROUND_HALF_UP);
    $LoT = sqrt($EsfuerzoNeto) + ($t - $b) / 2;
    $peralteEfectivo = $H - 0.1;
    $lvx = ($l - $t) / 2;
    $lvy = ($B - $b) / 2;

    $datos = 1;
    //CALCULO 1.4CM+1.7CV
    for ($i = 0; $i < $datos; $i++) {
        $P = round(1.4 * $p[$i] + 1.7 * $p[$i + 1], 2, PHP_ROUND_HALF_UP);
        $Ps[] = $P;

        $MX = round(1.4 * $Mx[$i] + 1.7 * $Mx[$i + 1], 2, PHP_ROUND_HALF_UP);
        $MXs[] = $MX;

        $MY = round(1.4 * $My[$i] + 1.7 * $My[$i + 1], 2, PHP_ROUND_HALF_UP);
        $MYs[] = $MY;
    }
    //CALCULO 1.25(CM+CV)+Sx
    for ($i = 0; $i < $datos; $i++) {
        $Pc = round(1.25 * ($p[$i] + $p[$i + 1]) + $p[$i + 2], 2, PHP_ROUND_HALF_UP);
        $Pcs[] = $Pc;

        $MXMsx = round(1.25 * ($Mx[$i] + $Mx[$i + 1]) + $Mx[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MXMsxs[] = $MXMsx;

        $MYMsx = round(1.25 * ($My[$i] + $My[$i + 1]) + $My[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MYMsxs[] = $MYMsx;
    }
    //CALCULO 1.25(CM+CV)-Sx
    for ($i = 0; $i < $datos; $i++) {
        $Pcn = round(1.25 * ($p[$i] + $p[$i + 1]) - $p[$i + 2], 2, PHP_ROUND_HALF_UP);
        $Pcns[] = $Pcn;

        $MXnsx = round(1.25 * ($Mx[$i] + $Mx[$i + 1]) - $Mx[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MXnsxs[] = $MXnsx;

        $MYnsx = round(1.25 * ($My[$i] + $My[$i + 1]) - $My[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MYnsxs[] = $MYnsx;
    }

    //CALCULO 1.25(CM+CV)+Sy
    for ($i = 0; $i < $datos; $i++) {
        $PSy = round(1.25 * ($p[$i] + $p[$i + 1]) + $p[$i + 3], 2, PHP_ROUND_HALF_UP);
        $PSys[] = $PSy;

        $MXSy = round(1.25 * ($Mx[$i] + $Mx[$i + 1]) + $Mx[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MXSys[] = $MXSy;

        $MYsy = round(1.25 * ($My[$i] + $My[$i + 1]) + $My[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MYsys[] = $MYsy;
    }

    //CALCULO  1.25(CM+CV)-Sy
    for ($i = 0; $i < $datos; $i++) {
        $PSny = round(1.25 * ($p[$i] + $p[$i + 1]) - $p[$i + 3], 2, PHP_ROUND_HALF_UP);
        $PSnys[] = $PSny;

        $MXnSy = round(1.25 * ($Mx[$i] + $Mx[$i + 1]) - $Mx[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MXnSys[] = $MXnSy;

        $MYnsy = round(1.25 * ($My[$i] + $My[$i + 1]) - $My[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MYnsys[] = $MYnsy;
    }

    //CALCULO  0.9CM+Sx
    for ($i = 0; $i < $datos; $i++) {
        $Pms = round(0.9 * $p[$i] + $p[$i + 2], 2, PHP_ROUND_HALF_UP);
        $Pmss[] = $Pms;

        $MxCmSx = round(0.9 * $Mx[$i] + $Mx[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MxCmSxs[] = $MxCmSx;

        $MyCmSx = round(0.9 * $My[$i] + $My[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MyCmSxs[] = $MyCmSx;
    }

    //CALCULO  0.9CM-Sx
    for ($i = 0; $i < $datos; $i++) {
        $Pmns = round(0.9 * $p[$i] - $p[$i + 2], 2, PHP_ROUND_HALF_UP);
        $Pmnss[] = $Pmns;

        $MxCmSxn = round(0.9 * $Mx[$i] - $Mx[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MxCmSxns[] = $MxCmSxn;

        $MyCmSxn = round(0.9 * $My[$i] - $My[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MyCmSxns[] = $MyCmSxn;
    }

    //CALCULO 0.9CM+Sy
    for ($i = 0; $i < $datos; $i++) {
        $Pmys = round(0.9 * $p[$i] + $p[$i + 3], 2, PHP_ROUND_HALF_UP);
        $Pmyss[] = $Pmys;

        $MxCmSxy = round(0.9 * $Mx[$i] + $Mx[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MxCmSxys[] = $MxCmSxy;

        $MyCmSxy = round(0.9 * $My[$i] + $My[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MyCmSxys[] = $MyCmSxy;
    }

    //CALCULO 0.9CM-Sy
    for ($i = 0; $i < $datos; $i++) {
        $Pmnys = round(0.9 * $p[$i] - $p[$i + 3], 2, PHP_ROUND_HALF_UP);
        $Pmnyss[] = $Pmnys;

        $MxCmSxny = round(0.9 * $Mx[$i] - $Mx[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MxCmSxnys[] = $MxCmSxny;

        $MyCmSxny = round(0.9 * $My[$i] - $My[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MyCmSxnys[] = $MyCmSxny;
    }

    //COMBINACION DE CARGA DE SERVICIO
    //CM+CV
    for ($i = 0; $i < $datos; $i++) {
        $pcc = round($p[$i] + $p[$i + 1], 2, PHP_ROUND_HALF_UP);
        $pccs[] = $pcc;

        $MXcc = round($Mx[$i] + $Mx[$i + 1], 2, PHP_ROUND_HALF_UP);
        $MXccs[] = $MXcc;

        $MYcc = round($My[$i] + $My[$i + 1], 2, PHP_ROUND_HALF_UP);
        $MYccs[] = $MYcc;
    }

    //CM+CV + 0.8Sx
    for ($i = 0; $i < $datos; $i++) {
        $Pcps = round($p[$i] + $p[$i + 1] + 0.8 * $p[$i + 2], 2, PHP_ROUND_HALF_UP);
        $Pcpss[] = $Pcps;

        $MXps = round($Mx[$i] + $Mx[$i + 1] + 0.8 * $Mx[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MXpss[] = $MXps;

        $MYps = round($My[$i] + $My[$i + 1] + 0.8 * $My[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MYpss[] = $MYps;
    }

    //CM+CV - 0.8Sx
    for ($i = 0; $i < $datos; $i++) {
        $Pcnsneg = round($p[$i] + $p[$i + 1] - 0.8 * $p[$i + 2], 2, PHP_ROUND_HALF_UP);
        $Pcnsnegs[] = $Pcnsneg;

        $MXnsneg = round($Mx[$i] + $Mx[$i + 1] - 0.8 * $Mx[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MXnsnegs[] = $MXnsneg;

        $MYnsneg = round($My[$i] + $My[$i + 1] - 0.8 * $My[$i + 2], 2, PHP_ROUND_HALF_UP);
        $MYnsnegs[] = $MYnsneg;
    }

    //CM+CV + 0.8Sy
    for ($i = 0; $i < $datos; $i++) {
        $Pcpys = round($p[$i] + $p[$i + 1] + 0.8 * $p[$i + 3], 2, PHP_ROUND_HALF_UP);
        $Pcpyss[] = $Pcpys;

        $MXpys = round($Mx[$i] + $Mx[$i + 1] + 0.8 * $Mx[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MXpyss[] = $MXpys;

        $MYpys = round($My[$i] + $My[$i + 1] + 0.8 * $My[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MYpyss[] = $MYpys;
    }

    //CM+CV - 0.8Sy
    for ($i = 0; $i < $datos; $i++) {
        $Pcnys = round($p[$i] + $p[$i + 1] - 0.8 * $p[$i + 3], 2, PHP_ROUND_HALF_UP);
        $Pcnyss[] = $Pcnys;

        $MXnys = round($Mx[$i] + $Mx[$i + 1] - 0.8 * $Mx[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MXnyss[] = $MXnys;

        $MYnys = round($My[$i] + $My[$i + 1] - 0.8 * $My[$i + 3], 2, PHP_ROUND_HALF_UP);
        $MYnyss[] = $MYnys;
    }

    //Preciones en el suelo en condiciones de servicio
    //CM+CV
    for ($i = 0; $i < $datos; $i++) {
        $CmCv = round($pcc / $AZapata, 2, PHP_ROUND_HALF_UP);
        $CmCvs[] = $CmCv;

        $CmCvmx = round((6 * abs($MXcc)) / ($l * pow($B, 2)), 3, PHP_ROUND_HALF_UP);
        $CmCvmxs[] = $CmCvmx;

        $CmCvmy = round((6 * abs($MYcc)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $CmCvmys[] = $CmCvmy;

        $tot = $CmCv + $CmCvmx + $CmCvmy;
        $tots[] = $tot;

        $Condicion = '';
        if ($tot < $cPortante) {
            $Condicion = 'Cumple';
        } else {
            $Condicion = 'No Cumple';
        }
        $Condicions[] = $Condicion;
    }
    //CM+CV + 0.8Sx
    for ($i = 0; $i < $datos; $i++) {
        $CmCvsx = round($Pcps / $AZapata, 2, PHP_ROUND_HALF_UP);
        $CmCvsxs[] = $CmCvsx;

        $CmCvsxmx = round((6 * ABS($MXps)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $CmCvsxmxs[] = $CmCvsxmx;

        $CmCvsxmy = round((6 * ABS($MYps)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $CmCvsxmys[] = $CmCvsxmy;

        $totsx = $CmCvsx + $CmCvsxmx + $CmCvsxmy;
        $totsxs[] = $totsx;
        $CPCC = $cPortante * 1.3;

        $Condicionsx = '';
        if ($totsx < $CPCC) {
            $Condicionsx = 'Cumple';
        } else {
            $Condicionsx = 'No Cumple';
        }
        $Condicionsxs[] = $Condicionsx;
    }
    // //CM+CV - 0.8Sx
    for ($i = 0; $i < $datos; $i++) {
        $CmCvnsx = round($Pcnsneg / $AZapata, 2, PHP_ROUND_HALF_UP);
        $CmCvnsxs[] = $CmCvnsx;

        $CmCvnsxmx = round((6 * ABS($MXnsneg)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $CmCvnsxmxs[] = $CmCvnsxmx;

        $CmCvnsxmy = round((6 * ABS($MYnsneg)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $CmCvnsxmys[] = $CmCvnsxmy;

        $totnsx = $CmCvsx + $CmCvsxmx + $CmCvsxmy;
        $totnsxs[] = $totnsx;
        $CPCCn = $cPortante * 1.3;

        $Condicionnsx = '';
        if ($totnsx < $CPCCn) {
            $Condicionnsx = 'Cumple';
        } else {
            $Condicionnsx = 'No Cumple';
        }
        $Condicionnsxs[] = $Condicionnsx;
    }
    //CM+CV + 0.8Sy
    for ($i = 0; $i < $datos; $i++) {
        $CmCvsy = round($Pcpys / $AZapata, 2, PHP_ROUND_HALF_UP);
        $CmCvsys[] = $CmCvsy;

        $CmCvsymx = round((6 * ABS($MXpys)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $CmCvsymxs[] = $CmCvsymx;

        $CmCvsymy = round((6 * ABS($MYpys)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $CmCvsymys[] = $CmCvsymy;

        $totsy = $CmCvsy + $CmCvsymx + $CmCvsymy;
        $totsys[] = $totsy;
        $CPCCy = $cPortante * 1.3;

        $Condicionsy = '';
        if ($totsy < $CPCCy) {
            $Condicionsy = 'Cumple';
        } else {
            $Condicionsy = 'No Cumple';
        }
        $Condicionsys[] = $Condicionsy;
    }
    //CM+CV - 0.8Sy
    for ($i = 0; $i < $datos; $i++) {
        $CmCvnsy = round($Pcnys / $AZapata, 2, PHP_ROUND_HALF_UP);
        $CmCvnsys[] = $CmCvnsy;

        $CmCvsnymx = round((6 * ABS($MXnys)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $CmCvsnymxs[] = $CmCvsnymx;

        $CmCvsnymy = round((6 * ABS($MYnys)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $CmCvsnymys[] = $CmCvsnymy;

        $totsny = $CmCvnsy + $CmCvsnymx + $CmCvsnymy;
        $totsnys[] = $totsny;
        $CPCCny = $cPortante * 1.3;

        $Condicionsny = '';
        if ($totsny < $CPCCny) {
            $Condicionsny = 'Cumple';
        } else {
            $Condicionsny = 'No Cumple';
        }
        $Condicionsnys[] = $Condicionsny;
    }

    //Presiones ultimos de diseño
    //1.4CM+1.7CV
    for ($i = 0; $i < $datos; $i++) {
        $cmv = round($P / $AZapata, 2, PHP_ROUND_HALF_UP);
        $cmvs[] = $cmv;

        $Cmvmx = round((6 * ABS($MX)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $Cmvmxs[] = $Cmvmx;

        $Cmvmy = round((6 * ABS($MY)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $Cmvmys[] = $Cmvmy;

        $totPD = $cmv + $Cmvmx + $Cmvmy;
        $totPDs[] = $totPD;
    }
    //1.25(CM+CV)+Sx
    for ($i = 0; $i < $datos; $i++) {
        $Cmvsx = round($Pc / $AZapata, 2, PHP_ROUND_HALF_UP);
        $Cmvsxs[] = $Cmvsx;

        $Cmvsxmx = round((6 * ABS($MXMsx)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $Cmvsxmxs[] = $Cmvsxmx;

        $Cmvsxmy = round((6 * ABS($MYMsx)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $Cmvsxmys[] = $Cmvsxmy;

        $totcv = $Cmvsx + $Cmvsxmx + $Cmvsxmy;
        $totcvs[] = $totcv;
    }
    //1.25(CM+CV)-Sx
    for ($i = 0; $i < $datos; $i++) {
        $Cmvnsx = round($Pcn / $AZapata, 2, PHP_ROUND_HALF_UP);
        $Cmvnsxs[] = $Cmvnsx;

        $Cmvnsxmx = round((6 * ABS($MXnsx)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $Cmvnsxmxs[] = $Cmvnsxmx;

        $Cmvnsxmy = round((6 * ABS($MYnsx)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $Cmvnsxmys[] = $Cmvnsxmy;

        $totcmx = $Cmvnsx + $Cmvnsxmx + $Cmvnsxmy;
        $totcmxs[] = $totcmx;
    }
    //1.25(CM+CV)+Sy
    for ($i = 0; $i < $datos; $i++) {
        $Cmvsy = round($PSy / $AZapata, 2, PHP_ROUND_HALF_UP);
        $Cmvsys[] = $Cmvsy;

        $Cmvsymx = round((6 * ABS($MXSy)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $Cmvsymxs[] = $Cmvsymx;

        $Cmvsymy = round((6 * ABS($MYsy)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $Cmvsymys[] = $Cmvsymy;

        $totcmsy = $Cmvsy + $Cmvsymx + $Cmvsymy;
        $totcmsys[] = $totcmsy;
    }
    //1.25(CM+CV)-Sy
    for ($i = 0; $i < $datos; $i++) {
        $Cmvnsy = round($PSny / $AZapata, 2, PHP_ROUND_HALF_UP);
        $Cmvnsys[] = $Cmvnsy;

        $Cmvsnymx = round((6 * ABS($MXnSy)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $Cmvsnymxs[] = $Cmvsnymx;

        $Cmvsnymy = round((6 * ABS($MYnsy)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $Cmvsnymys[] = $Cmvsnymy;

        $totcmny = $Cmvnsy + $Cmvsnymx + $Cmvsnymy;
        $totcmnys[] = $totcmny;
    }
    //0.9CM+Sx
    for ($i = 0; $i < $datos; $i++) {
        $ccx = round($Pms / $AZapata, 2, PHP_ROUND_HALF_UP);
        $ccxs[] = $ccx;

        $ccmx = round((6 * ABS($MxCmSx)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $ccmxs[] = $ccmx;

        $ccmy = round((6 * ABS($MyCmSx)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $ccmys[] = $ccmy;

        $cctot = $ccx + $ccmx + $ccmy;
        $cctots[] = $cctot;
    }
    //0.9CM-Sx
    for ($i = 0; $i < $datos; $i++) {
        $ccnx = round($Pmns / $AZapata, 2, PHP_ROUND_HALF_UP);
        $ccnxs[] = $ccnx;

        $ccnmx = round((6 * ABS($MxCmSxn)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $ccnmxs[] = $ccnmx;

        $ccnmy = round((6 * ABS($MyCmSxn)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $ccnmys[] = $ccnmy;

        $ccntot = $ccnx + $ccnmx + $ccnmy;
        $ccntots[] = $ccntot;
    }
    //0.9CM+Sy
    for ($i = 0; $i < $datos; $i++) {
        $ccyx = round($Pmys / $AZapata, 2, PHP_ROUND_HALF_UP);
        $ccyxs[] = $ccyx;

        $ccymx = round((6 * ABS($MxCmSxy)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $ccymxs[] = $ccymx;

        $ccymy = round((6 * ABS($MyCmSxy)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $ccymys[] = $ccymy;

        $ccytot = $ccyx + $ccymx + $ccymy;
        $ccytots[] = $ccytot;
    }
    //0.9CM-Sy
    for ($i = 0; $i < $datos; $i++) {
        $ccnyx = round($Pmnys / $AZapata, 2, PHP_ROUND_HALF_UP);
        $ccnyxs[] = $ccnyx;

        $ccnymx = round((6 * ABS($MxCmSxny)) / ($l * pow($B, 2)), 2, PHP_ROUND_HALF_UP);
        $ccnymxs[] = $ccnymx;

        $ccnymy = round((6 * ABS($MyCmSxny)) / (pow($l, 2) * $B), 2, PHP_ROUND_HALF_UP);
        $ccnymys[] = $ccnymy;

        $ccnytot = $ccnyx + $ccnymx + $ccnymy;
        $ccnytots[] = $ccnytot;
    }
    //ULTIMA
    $Pulti = max($totPD, $totcv, $totcmx, $totcmsy, $totcmny, $cctot, $ccntot, $ccytot, $ccnytot);

    //VERIFICACION DE EXTRENSIDADES
    //cm+cv 1
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteA = $CmCv + $CmCvmx + -$CmCvmy;
        $Resultanteb = $CmCv + $CmCvmx + $CmCvmy;

        $VrfEx = '';
        if ($ResultanteA >= 0 || $Resultanteb >= 0) {
            $VrfEx = 'Cumple';
        } else {
            $VrfEx = 'No Cumple';
        }
        $VrfExs[] = $VrfEx;
    }
    // cm+cv 2
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteA = $CmCv + -$CmCvmx + -$CmCvmy;
        $Resultanteb = $CmCv + -$CmCvmx + $CmCvmy;

        $VrfEx2 = '';
        if ($ResultanteA >= 0 || $Resultanteb >= 0) {
            $VrfEx2 = 'Cumple';
        } else {
            $VrfEx2 = 'No Cumple';
        }
        $VrfEx2s[] = $VrfEx2;
    }
    //CM+CV+0.8Sx 1
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteAx = $CmCvsx + $CmCvsxmx + -$CmCvsxmy;
        $Resultantebx = $CmCvsx + $CmCvsxmx + $CmCvsxmy;

        $VrfE = '';
        if ($ResultanteAx >= 0 || $Resultantebx >= 0) {
            $VrfE = 'Cumple';
        } else {
            $VrfE = 'No Cumple';
        }
        $VrfEs[] = $VrfE;
    }
    //CM+CV+0.8Sx 2
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteAx = $CmCvsx + -$CmCvsxmx + $CmCvsxmy;
        $Resultantebx = $CmCvsx + -$CmCvsxmx + $CmCvsxmy;

        $VrfE2 = '';
        if ($ResultanteAx >= 0 || $Resultantebx >= 0) {
            $VrfE2 = 'Cumple';
        } else {
            $VrfE2 = 'No Cumple';
        }
        $VrfE2s[] = $VrfE2;
    }
    //CM+CV-0.8Sx 1
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteASX = $CmCvnsx + $CmCvnsxmx + -$CmCvnsxmy;
        $ResultantebSX = $CmCvnsx + $CmCvnsxmx + $CmCvnsxmy;

        $VrfESX = '';
        if ($ResultanteASX >= 0 || $ResultantebSX >= 0) {
            $VrfESX = 'Cumple';
        } else {
            $VrfESX = 'No Cumple';
        }
        $VrfESXs[] = $VrfESX;
    }
    //CM+CV-0.8Sx 2
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteASX2 = $CmCvnsx + -$CmCvnsxmx + $CmCvnsxmy;
        $ResultantebSX2 = $CmCvnsx + -$CmCvnsxmx + $CmCvnsxmy;

        $VrfESX2 = '';
        if ($ResultanteASX >= 0 || $ResultantebSX >= 0) {
            $VrfESX2 = 'Cumple';
        } else {
            $VrfESX2 = 'No Cumple';
        }
        $VrfESX2s[] = $VrfESX2;
    }
    //CM+CV+0.8Sy 1
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteASy = $CmCvsy + $CmCvsymx + -$CmCvsymy;
        $ResultantebSy = $CmCvsy + $CmCvsymx + $CmCvsymy;

        $VrfESy = '';
        if ($ResultanteASy >= 0 || $ResultantebSy >= 0) {
            $VrfESy = 'Cumple';
        } else {
            $VrfESy = 'No Cumple';
        }
        $VrfESys[] = $VrfESy;
    }
    //CM+CV+0.8Sy 2
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteASy2 = $CmCvsy + -$CmCvsymx + -$CmCvsymy;
        $ResultantebSy2 = $CmCvsy + -$CmCvsymx + $CmCvsymy;

        $VrfESy2 = '';
        if ($ResultanteASy2 >= 0 || $ResultantebSy2 >= 0) {
            $VrfESy2 = 'Cumple';
        } else {
            $VrfESy2 = 'No Cumple';
        }
        $VrfESy2s[] = $VrfESy2;
    }
    //CM+CV-0.8Sy 1
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteASny = $CmCvnsy + $CmCvsnymx + -$CmCvsnymy;
        $ResultantebSny = $CmCvnsy + $CmCvsnymx + $CmCvsnymy;

        $VrfESny = '';
        if ($ResultanteASny >= 0 || $ResultantebSny >= 0) {
            $VrfESny = 'Cumple';
        } else {
            $VrfESny = 'No Cumple';
        }
        $VrfESnys[] = $VrfESny;
    }
    //CM+CV-0.8Sy 2
    for ($i = 0; $i < $datos; $i++) {
        $ResultanteASny2 = $CmCvnsy + -$CmCvsnymx + -$CmCvsnymy;
        $ResultantebSny2 = $CmCvnsy + -$CmCvsnymx + $CmCvsnymy;

        $VrfESny2 = '';
        if ($ResultanteASny2 >= 0 || $ResultantebSny2 >= 0) {
            $VrfESny2 = 'Cumple';
        } else {
            $VrfESny2 = 'No Cumple';
        }
        $VrfESny2s[] = $VrfESny2;
    }

    //Analisis por punzonamiento
    $FactorReduccionCortante = 0.85;
    for ($i = 0; $i < $datos; $i++) {
        $PUCargaServicio = max($pcc, $Pcps, $Pcns, $Pcpys, $Pcnys);
        $PUCargaUltima = max($P, $Pc, $Pcn, $PSy, $PSny, $Pms, $Pmns, $Pmys, $Pmnys);
        $PCorte = 2 * ($peralteEfectivo + $t) + 2 * ($peralteEfectivo + $b);
        $AefectivaP = ($peralteEfectivo + $b) * ($t + $peralteEfectivo);
        $RelacionLLCol = round(MAX($b, $t) / MIN($b, $t), 2, PHP_ROUND_HALF_UP);

        $FcortanteUltimo = round($PUCargaUltima - $Pulti * $AefectivaP, 2, PHP_ROUND_HALF_UP);
        $VC1 = round(
            $FactorReduccionCortante *
                0.53 *
                (1 + 2 / $RelacionLLCol) *
                sqrt($fc) *
                $PCorte *
                pow(10, 2) *
                $peralteEfectivo *
                pow(10, 2) *
                pow(10, -3),
            2,
            PHP_ROUND_HALF_UP,
        );
        $VCn2 = round(
            $FactorReduccionCortante *
                0.27 *
                (($columna * $peralteEfectivo) / $PCorte + 2) *
                sqrt($fc) *
                $PCorte *
                pow(10, 2) *
                $peralteEfectivo *
                pow(10, 2) *
                pow(10, -3),
            2,
            PHP_ROUND_HALF_UP,
        );
        $VCn3 = round(
            ($FactorReduccionCortante * 1.06 * sqrt($fc) * $PCorte * pow(10, 2) * $peralteEfectivo * pow(10, 2)) /
                pow(10, 3),
            2,
            PHP_ROUND_HALF_UP,
        );
        $ResistenciaNominal = min($VC1, $VCn2, $VCn3);
        $VerificarCN = '';
        if ($ResistenciaNominal <= $ResistenciaNominal) {
            $VerificarCN = 'CUMPLE';
        } else {
            $VerificarCN = 'No Cumple';
        }
    }

    //VERIFICACION DE CORTE POR FLEXION
    $PEfectivoCM = $peralteEfectivo * 100;
    $BASE = round($B * 100, 2, PHP_ROUND_HALF_UP);
    $BASE2 = round($l * 100, 2, PHP_ROUND_HALF_UP);
    $FCultimo = round($Pulti * $B * ($lvx - $PEfectivoCM / 100), 2, PHP_ROUND_HALF_UP);
    $FCultimo2 = round($Pulti * $l * ($lvy - $PEfectivoCM / 100), 2, PHP_ROUND_HALF_UP);
    $Rnominal1 = round(
        ($FactorReduccionCortante * 0.53 * sqrt($fc) * $BASE * $PEfectivoCM) / 1000,
        2,
        PHP_ROUND_HALF_UP,
    );
    $Rnominal2 = round(
        ($FactorReduccionCortante * 0.53 * sqrt($fc) * $BASE2 * $PEfectivoCM) / 1000,
        2,
        PHP_ROUND_HALF_UP,
    );
    $VerificarCN1 = '';
    if ($FCultimo <= $Rnominal1) {
        $VerificarCN1 = 'CUMPLE';
    } else {
        $VerificarCN1 = 'No Cumple';
    }
    $VerificarCN2 = '';
    if ($FCultimo2 <= $Rnominal2) {
        $VerificarCN2 = 'CUMPLE';
    } else {
        $VerificarCN2 = 'No Cumple';
    }

    //Diseño por flexion
    $FactorReduccionFlexion = 0.9;
    $MomentoUltimo = $Pulti * $l * $lvy * ($lvy / 2);
    $MomentoUltimo2 = round($Pulti * $B * $lvx * ($lvx / 2), 2, PHP_ROUND_HALF_UP);
    $BloqueComprimido = round(
        $PEfectivoCM -
            sqrt(
                pow($PEfectivoCM, 2) -
                    (2 * abs($MomentoUltimo * pow(10, 5))) / ($FactorReduccionFlexion * 0.85 * $fc * $BASE2),
            ),
        2,
        PHP_ROUND_HALF_UP,
    );
    $BloqueComprimido2 = round(
        $PEfectivoCM -
            sqrt(
                pow($PEfectivoCM, 2) -
                    (2 * abs($MomentoUltimo2 * pow(10, 5))) / ($FactorReduccionFlexion * 0.85 * $fc * $BASE),
            ),
        2,
        PHP_ROUND_HALF_UP,
    );
    $RCalculado = round((0.85 * $fc * $BASE2 * $BloqueComprimido) / $fy, 2, PHP_ROUND_HALF_UP);
    $RCalculado2 = round((0.85 * $fc * $BASE * $BloqueComprimido2) / $fy, 2, PHP_ROUND_HALF_UP);
    $Rminimo = round(0.0018 * $BASE2 * $PEfectivoCM, 2, PHP_ROUND_HALF_UP);
    $Rminimos = round(0.0018 * $BASE * $PEfectivoCM, 2, PHP_ROUND_HALF_UP);
    $AreaVarillax = '';
    if ($Varillax == 0) {
        $AreaVarillax = 'Ф';
    } elseif ($Varillax == 0.283) {
        $AreaVarillax = '6mm';
    } elseif ($Varillax == 0.503) {
        $AreaVarillax = '8mm';
    } elseif ($Varillax == 0.713) {
        $AreaVarillax = 'Ø 3/8';
    } elseif ($Varillax == 1.131) {
        $AreaVarillax = '12mm';
    } elseif ($Varillax == 1.267) {
        $AreaVarillax = 'Ø 1/2';
    } elseif ($Varillax == 1.979) {
        $AreaVarillax = 'Ø 5/8';
    } elseif ($Varillax == 2.85) {
        $AreaVarillax = 'Ф 3/4';
    } elseif ($Varillax == 5.067) {
        $AreaVarillax = 'Ф 1';
    }

    $AreaVarillay = '';
    if ($Varillay == 0) {
        $AreaVarillay = 'Ф';
    } elseif ($Varillay == 0.283) {
        $AreaVarillay = '6mm';
    } elseif ($Varillay == 0.503) {
        $AreaVarillay = '8mm';
    } elseif ($Varillay == 0.713) {
        $AreaVarillay = 'Ø 3/8';
    } elseif ($Varillay == 1.131) {
        $AreaVarillay = '12mm';
    } elseif ($Varillay == 1.267) {
        $AreaVarillay = 'Ø 1/2';
    } elseif ($Varillay == 1.979) {
        $AreaVarillay = 'Ø 5/8';
    } elseif ($Varillay == 2.85) {
        $AreaVarillay = 'Ф 3/4';
    } elseif ($Varillay == 5.067) {
        $AreaVarillay = 'Ф 1';
    }
    $NumVarrilla1 = ceil(MAX($RCalculado, $Rminimo) / $Varillax);
    $NumVarrilla2 = ceil(MAX($RCalculado2, $Rminimos) / $Varillay);
    $Rreal1 = round($NumVarrilla1 * $Varillax, 2, PHP_ROUND_HALF_UP);
    $Rreal2 = round($NumVarrilla2 * $Varillay, 2, PHP_ROUND_HALF_UP);
    $BCReal1 = round(($Rreal1 * $fy) / (0.85 * $fc * $BASE2), 2, PHP_ROUND_HALF_UP);
    $BCReal2 = round(($Rreal2 * $fy) / (0.85 * $fc * $BASE), 2, PHP_ROUND_HALF_UP);
    $Rnominal1 = round(
        ($FactorReduccionFlexion * $Rreal1 * $fy * ($PEfectivoCM - $BCReal1 / 2)) / pow(10, 5),
        2,
        PHP_ROUND_HALF_UP,
    );
    $Rnominal2 = round(
        ($FactorReduccionFlexion * $Rreal2 * $fy * ($PEfectivoCM - $BCReal2 / 2)) / pow(10, 5),
        2,
        PHP_ROUND_HALF_UP,
    );
    if ($Rreal1 > max($RCalculado, $Rminimo)) {
        $Vfelxion1 = 'CUMPLE';
    } else {
        $Vfelxion1 = 'No Cumple';
    }
    $Vfelxion2 = '';
    if ($Rreal2 > max($RCalculado2, $Rminimos)) {
        $Vfelxion2 = 'CUMPLE';
    } else {
        $Vfelxion2 = 'No Cumple';
    }
    $Pespaciamiento1 = round($BASE2 / $NumVarrilla1, 2, PHP_ROUND_HALF_UP);
    $Pespaciamiento2 = round($BASE / $NumVarrilla2, 2, PHP_ROUND_HALF_UP);
    $Sespaciamiento1 = round(($Varillax / (MAX($RCalculado, $Rminimo) / ($BASE2 / 100))) * 100, 2, PHP_ROUND_HALF_UP);
    $Sespaciamiento2 = round(($Varillay / (MAX($RCalculado2, $Rminimos) / ($BASE / 100))) * 100, 2, PHP_ROUND_HALF_UP);
    $Vespaciamiento1 = '';
    if ($espaciamientox <= round($Sespaciamiento1, 0) || $espaciamientox <= round($Pespaciamiento1, 0)) {
        $Vespaciamiento1 = 'CUMPLE';
    } else {
        $Vespaciamiento1 = 'No Cumple';
    }
    $Vespaciamiento2 = '';
    if ($espaciamientoy <= round($Sespaciamiento2, 0) || $espaciamientoy <= round($Pespaciamiento2, 0)) {
        $Vespaciamiento2 = 'CUMPLE';
    } else {
        $Vespaciamiento2 = 'No Cumple';
    }
@endphp
<div class="overflow-auto">
    <table id="desingcorte" class="min-w-full text-gray-800 dark:text-white">
        <!-- Requisitos de diseño vigas -->
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">1.- Combinaciones de carga ultimas</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col" colspan="4"></th>
                <th class="text-lg py-2 px-4" scope="col">P (Tonf)</th>
                <th class="text-lg py-2 px-4" scope="col">Mx (Tonf-m)</th>
                <th class="text-lg py-2 px-4" scope="col">My (Tonf-m)</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">1.4CM+1.7CV</td>
                @if (isset($Ps))
                    @foreach ($Ps as $P)
                        <td class='py-2 px-4'>{{ $P }}</td>
                    @endforeach
                @endif
                @if (isset($MXs))
                    @foreach ($MXs as $MX)
                        <td class='py-2 px-4'>{{ $MX }}</td>
                    @endforeach
                @endif
                @if (isset($MYs))
                    @foreach ($MYs as $MY)
                        <td class='py-2 px-4'>{{ $MY }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">1.25(CM+CV)+Sx</td>
                @if (isset($Pcs))
                    @foreach ($Pcs as $Pc)
                        <td class='py-2 px-4'>{{ $Pc }}</td>
                    @endforeach
                @endif
                @if (isset($MXMsxs))
                    @foreach ($MXMsxs as $MXMsx)
                        <td class='py-2 px-4'>{{ $MXMsx }}</td>
                    @endforeach
                @endif
                @if (isset($MYMsxs))
                    @foreach ($MYMsxs as $MYMsx)
                        <td class='py-2 px-4'>{{ $MYMsx }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">1.25(CM+CV)-Sx</td>
                @if (isset($Pcns))
                    @foreach ($Pcns as $Pcn)
                        <td class='py-2 px-4'>{{ $Pcn }}</td>
                    @endforeach
                @endif
                @if (isset($MXnsxs))
                    @foreach ($MXnsxs as $MXnsx)
                        <td class='py-2 px-4'>{{ $MXnsx }}</td>
                    @endforeach
                @endif
                @if (isset($MYnsxs))
                    @foreach ($MYnsxs as $MYnsx)
                        <td class='py-2 px-4'>{{ $MYnsx }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">1.25(CM+CV)+Sy</td>
                @if (isset($PSys))
                    @foreach ($PSys as $PSy)
                        <td class='py-2 px-4'>{{ $PSy }}</td>
                    @endforeach
                @endif
                @if (isset($MXSys))
                    @foreach ($MXSys as $MXSy)
                        <td class='py-2 px-4'>{{ $MXSy }}</td>
                    @endforeach
                @endif
                @if (isset($MYsys))
                    @foreach ($MYsys as $MYsy)
                        <td class='py-2 px-4'>{{ $MYsy }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">1.25(CM+CV)-Sy</td>
                @if (isset($PSnys))
                    @foreach ($PSnys as $PSny)
                        <td class='py-2 px-4'>{{ $PSny }}</td>
                    @endforeach
                @endif
                @if (isset($MXnSys))
                    @foreach ($MXnSys as $MXnSy)
                        <td class='py-2 px-4'>{{ $MXnSy }}</td>
                    @endforeach
                @endif
                @if (isset($MYnsys))
                    @foreach ($MYnsys as $MYnsy)
                        <td class='py-2 px-4'>{{ $MYnsy }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM+Sx</td>
                @if (isset($Pmss))
                    @foreach ($Pmss as $Pms)
                        <td class='py-2 px-4'>{{ $Pms }}</td>
                    @endforeach
                @endif
                @if (isset($MxCmSxs))
                    @foreach ($MxCmSxs as $MxCmSx)
                        <td class='py-2 px-4'>{{ $MxCmSx }}</td>
                    @endforeach
                @endif
                @if (isset($MyCmSxs))
                    @foreach ($MyCmSxs as $MyCmSx)
                        <td class='py-2 px-4'>{{ $MyCmSx }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sx</td>
                @if (isset($Pmnss))
                    @foreach ($Pmnss as $Pmns)
                        <td class='py-2 px-4'>{{ $Pmns }}</td>
                    @endforeach
                @endif
                @if (isset($MxCmSxns))
                    @foreach ($MxCmSxns as $MxCmSxn)
                        <td class='py-2 px-4'>{{ $MxCmSxn }}</td>
                    @endforeach
                @endif
                @if (isset($MyCmSxns))
                    @foreach ($MyCmSxns as $MyCmSxn)
                        <td class='py-2 px-4'>{{ $MyCmSxn }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM+Sy</td>
                @if (isset($Pmyss))
                    @foreach ($Pmyss as $Pmyss)
                        <td class='py-2 px-4'>{{ $Pmys }}</td>
                    @endforeach
                @endif
                @if (isset($MxCmSxys))
                    @foreach ($MxCmSxys as $MxCmSxy)
                        <td class='py-2 px-4'>{{ $MxCmSxy }}</td>
                    @endforeach
                @endif
                @if (isset($MyCmSxys))
                    @foreach ($MyCmSxys as $MyCmSxy)
                        <td class='py-2 px-4'>{{ $MyCmSxy }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sy</td>
                @if (isset($Pmnyss))
                    @foreach ($Pmnyss as $Pmnys)
                        <td class='py-2 px-4'>{{ $Pmnys }}</td>
                    @endforeach
                @endif
                @if (isset($MxCmSxnys))
                    @foreach ($MxCmSxnys as $MxCmSxny)
                        <td class='py-2 px-4'>{{ $MxCmSxny }}</td>
                    @endforeach
                @endif
                @if (isset($MyCmSxnys))
                    @foreach ($MyCmSxnys as $MyCmSxny)
                        <td class='py-2 px-4'>{{ $MyCmSxny }}</td>
                    @endforeach
                @endif
            </tr>
        </tbody>

        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">1.2.- Combinaciones de carga de servicio</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col" colspan="4"></th>
                <th class="text-lg py-2 px-4" scope="col">P (Tonf)</th>
                <th class="text-lg py-2 px-4" scope="col">Mx (Tonf-m)</th>
                <th class="text-lg py-2 px-4" scope="col">My (Tonf-m)</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">CM+CV</td>
                @if (isset($pccs))
                    @foreach ($pccs as $pcc)
                        <td class='py-2 px-4'>{{ $pcc }}</td>
                    @endforeach
                @endif
                @if (isset($MXccs))
                    @foreach ($MXccs as $MXcc)
                        <td class='py-2 px-4'>{{ $MXcc }}</td>
                    @endforeach
                @endif
                @if (isset($MYccs))
                    @foreach ($MYccs as $MYcc)
                        <td class='py-2 px-4'>{{ $MYcc }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">CM+CV + 0.8Sx</td>
                @if (isset($Pcpss))
                    @foreach ($Pcpss as $Pcps)
                        <td class='py-2 px-4'>{{ $Pcps }}</td>
                    @endforeach
                @endif
                @if (isset($MXpss))
                    @foreach ($MXpss as $MXps)
                        <td class='py-2 px-4'>{{ $MXps }}</td>
                    @endforeach
                @endif
                @if (isset($MYpss))
                    @foreach ($MYpss as $MYps)
                        <td class='py-2 px-4'>{{ $MYps }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sy</td>
                @if (isset($Pcnsnegs))
                    @foreach ($Pcnsnegs as $Pcnsneg)
                        <td class='py-2 px-4'>{{ $Pcnsneg }}</td>
                    @endforeach
                @endif
                @if (isset($MXnsnegs))
                    @foreach ($MXnsnegs as $MXnsneg)
                        <td class='py-2 px-4'>{{ $MXnsneg }}</td>
                    @endforeach
                @endif
                @if (isset($MYnsnegs))
                    @foreach ($MYnsnegs as $MYnsneg)
                        <td class='py-2 px-4'>{{ $MYnsneg }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sy</td>
                @if (isset($Pcpyss))
                    @foreach ($Pcpyss as $Pcpys)
                        <td class='py-2 px-4'>{{ $Pcpys }}</td>
                    @endforeach
                @endif
                @if (isset($MXpyss))
                    @foreach ($MXpyss as $MXpys)
                        <td class='py-2 px-4'>{{ $MXpys }}</td>
                    @endforeach
                @endif
                @if (isset($MYpyss))
                    @foreach ($MYpyss as $MYpys)
                        <td class='py-2 px-4'>{{ $MYpys }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sy</td>
                @if (isset($Pcnyss))
                    @foreach ($Pcnyss as $Pcnys)
                        <td class='py-2 px-4'>{{ $Pcnys }}</td>
                    @endforeach
                @endif
                @if (isset($MXnyss))
                    @foreach ($MXnyss as $MXnys)
                        <td class='py-2 px-4'>{{ $MXnys }}</td>
                    @endforeach
                @endif
                @if (isset($MYnyss))
                    @foreach ($MYnyss as $MYnys)
                        <td class='py-2 px-4'>{{ $MYnys }}</td>
                    @endforeach
                @endif
            </tr>
        </tbody>


        <!-- Preciones en el suelo en condiciones de servicio  -->
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">2.- Presiones en el suelo en condiciones de
                    servico</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Comb. cargas de servicio</th>
                <th class="text-lg py-2 px-4" scope="col">σ p (tonf/m<sup>2</sup>)</th>
                <th class="text-lg py-2 px-4" scope="col">σ Mx (tonf/m<sup>2</sup>)</th>
                <th class="text-lg py-2 px-4" scope="col">σ My (tonf/m<sup>2</sup>)</th>
                <th class="text-lg py-2 px-4" scope="col">σ tot. (tonf/m<sup>2</sup>)</th>
                <th class="text-lg py-2 px-4" scope="col">σ s (tonf/m<sup>2</sup>)</th>
                <th class="text-lg py-2 px-4" scope="col">Condicion</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4'>CM+CV</td>
                @if (isset($CmCvs))
                    @foreach ($CmCvs as $CmCv)
                        <td class='py-2 px-4'>{{ $CmCv }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvmxs))
                    @foreach ($CmCvmxs as $CmCvmx)
                        <td class='py-2 px-4'>{{ $CmCvmx }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvmys))
                    @foreach ($CmCvmys as $CmCvmy)
                        <td class='py-2 px-4'>{{ $CmCvmy }}</td>
                    @endforeach
                @endif
                @if (isset($tots))
                    @foreach ($tots as $tot)
                        <td class='py-2 px-4'>{{ $tot }}</td>
                    @endforeach
                @endif
                <td class='py-2 px-4'> {{ $cPortante }}</td>
                @if (isset($Condicions))
                    @foreach ($Condicions as $Condicion)
                        <td class='py-2 px-4'>{{ $Condicion }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4'>CM+CV + 0.8Sx</td>
                @if (isset($CmCvsxs))
                    @foreach ($CmCvsxs as $CmCvsx)
                        <td class='py-2 px-4'>{{ $CmCvsx }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvsxmxs))
                    @foreach ($CmCvsxmxs as $CmCvsxmx)
                        <td class='py-2 px-4'>{{ $CmCvsxmx }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvsxmys))
                    @foreach ($CmCvsxmys as $CmCvsxmy)
                        <td class='py-2 px-4'>{{ $CmCvsxmy }}</td>
                    @endforeach
                @endif
                @if (isset($totsxs))
                    @foreach ($totsxs as $totsx)
                        <td class='py-2 px-4'>{{ $totsx }}</td>
                    @endforeach
                @endif
                <td class='py-2 px-4'> {{ $CPCC }}</td>
                @if (isset($Condicions))
                    @foreach ($Condicions as $Condicion)
                        <td class='py-2 px-4'>{{ $Condicion }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4'>CM+CV - 0.8Sx</td>
                @if (isset($CmCvnsxs))
                    @foreach ($CmCvnsxs as $CmCvnsx)
                        <td class='py-2 px-4'>{{ $CmCvnsx }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvnsxmxs))
                    @foreach ($CmCvnsxmxs as $CmCvnsxmx)
                        <td class='py-2 px-4'>{{ $CmCvnsxmx }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvnsxmys))
                    @foreach ($CmCvnsxmys as $CmCvnsxmy)
                        <td class='py-2 px-4'>{{ $CmCvnsxmy }}</td>
                    @endforeach
                @endif
                @if (isset($totnsxs))
                    @foreach ($totnsxs as $totnsx)
                        <td class='py-2 px-4'>{{ $totnsx }}</td>
                    @endforeach
                @endif
                <td class='py-2 px-4'> {{ $CPCCn }}</td>
                @if (isset($Condicionnsxs))
                    @foreach ($Condicionnsxs as $Condicionnsx)
                        <td class='py-2 px-4'>{{ $Condicionnsx }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4'>CM+CV + 0.8Sy</td>
                @if (isset($CmCvsys))
                    @foreach ($CmCvsys as $CmCvsy)
                        <td class='py-2 px-4'>{{ $CmCvsy }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvsymxs))
                    @foreach ($CmCvsymxs as $CmCvsymx)
                        <td class='py-2 px-4'>{{ $CmCvsymx }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvsymys))
                    @foreach ($CmCvsymys as $CmCvsymy)
                        <td class='py-2 px-4'>{{ $CmCvsymy }}</td>
                    @endforeach
                @endif
                @if (isset($totsys))
                    @foreach ($totsys as $totsy)
                        <td class='py-2 px-4'>{{ $totsy }}</td>
                    @endforeach
                @endif
                <td class='py-2 px-4'> {{ $CPCCy }}</td>
                @if (isset($Condicionsys))
                    @foreach ($Condicionsys as $Condicionsy)
                        <td class='py-2 px-4'>{{ $Condicionsy }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4'>CM+CV - 0.8Sy</td>
                @if (isset($CmCvnsys))
                    @foreach ($CmCvnsys as $CmCvnsy)
                        <td class='py-2 px-4'>{{ $CmCvnsy }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvsnymxs))
                    @foreach ($CmCvsnymxs as $CmCvsnymx)
                        <td class='py-2 px-4'>{{ $CmCvsnymx }}</td>
                    @endforeach
                @endif
                @if (isset($CmCvsnymys))
                    @foreach ($CmCvsnymys as $CmCvsnymy)
                        <td class='py-2 px-4'>{{ $CmCvsnymy }}</td>
                    @endforeach
                @endif
                @if (isset($totsnys))
                    @foreach ($totsnys as $totsny)
                        <td class='py-2 px-4'>{{ $totsny }}</td>
                    @endforeach
                @endif
                <td class='py-2 px-4'> {{ $CPCCny }}</td>
                @if (isset($Condicionsnys))
                    @foreach ($Condicionsnys as $Condicionsny)
                        <td class='py-2 px-4'>{{ $Condicionsny }}</td>
                    @endforeach
                @endif
            </tr>
        </tbody>

        <!-- 2.1 presiones utlimos de diseño-->
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="7">2.1.- Presiones ultimos de diseño</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col" colspan="3">Comb. cargas de servicio</th>
                <th class="text-lg py-2 px-4" scope="col">σ p (tonf/m<sup>2</sup>)</th>
                <th class="text-lg py-2 px-4" scope="col">σ Mx (tonf/m<sup>2</sup>)</th>
                <th class="text-lg py-2 px-4" scope="col">σ My (tonf/m<sup>2</sup>)</th>
                <th class="text-lg py-2 px-4" scope="col">σ tot. (tonf/m<sup>2</sup>)</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">1.4CM+1.7CV</td>
                @if (isset($cmvs))
                    @foreach ($cmvs as $cmv)
                        <td class='py-2 px-4'>{{ $cmv }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvmxs))
                    @foreach ($Cmvmxs as $Cmvmx)
                        <td class='py-2 px-4'>{{ $Cmvmx }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvmys))
                    @foreach ($Cmvmys as $Cmvmy)
                        <td class='py-2 px-4'>{{ $Cmvmy }}</td>
                    @endforeach
                @endif
                @if (isset($totPDs))
                    @foreach ($totPDs as $totPD)
                        <td class='py-2 px-4'>{{ $totPD }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">1.25(CM+CV)+Sx</td>
                @if (isset($Cmvsxs))
                    @foreach ($Cmvsxs as $Cmvsx)
                        <td class='py-2 px-4'>{{ $Cmvsx }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvsxmxs))
                    @foreach ($Cmvsxmxs as $Cmvsxmx)
                        <td class='py-2 px-4'>{{ $Cmvsxmx }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvsxmys))
                    @foreach ($Cmvsxmys as $Cmvsxmy)
                        <td class='py-2 px-4'>{{ $Cmvsxmy }}</td>
                    @endforeach
                @endif
                @if (isset($totcvs))
                    @foreach ($totcvs as $totcv)
                        <td class='py-2 px-4'>{{ $totcv }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">1.25(CM+CV)-Sx</td>
                @if (isset($Cmvnsxs))
                    @foreach ($Cmvnsxs as $Cmvnsx)
                        <td class='py-2 px-4'>{{ $Cmvnsx }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvnsxmxs))
                    @foreach ($Cmvnsxmxs as $Cmvnsxmx)
                        <td class='py-2 px-4'>{{ $Cmvnsxmx }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvnsxmys))
                    @foreach ($Cmvnsxmys as $Cmvnsxmy)
                        <td class='py-2 px-4'>{{ $Cmvnsxmy }}</td>
                    @endforeach
                @endif
                @if (isset($totcmxs))
                    @foreach ($totcmxs as $totcmx)
                        <td class='py-2 px-4'>{{ $totcmx }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">1.25(CM+CV)+Sy</td>
                @if (isset($Cmvsys))
                    @foreach ($Cmvsys as $Cmvsy)
                        <td class='py-2 px-4'>{{ $Cmvsy }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvsymxs))
                    @foreach ($Cmvsymxs as $Cmvsymx)
                        <td class='py-2 px-4'>{{ $Cmvsymx }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvsymys))
                    @foreach ($Cmvsymys as $Cmvsymy)
                        <td class='py-2 px-4'>{{ $Cmvsymy }}</td>
                    @endforeach
                @endif
                @if (isset($totcmsys))
                    @foreach ($totcmsys as $totcmsy)
                        <td class='py-2 px-4'>{{ $totcmsy }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">1.25(CM+CV)-Sy</td>
                @if (isset($Cmvnsys))
                    @foreach ($Cmvnsys as $Cmvnsy)
                        <td class='py-2 px-4'>{{ $Cmvnsy }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvsnymxs))
                    @foreach ($Cmvsnymxs as $Cmvsnymx)
                        <td class='py-2 px-4'>{{ $Cmvsnymx }}</td>
                    @endforeach
                @endif
                @if (isset($Cmvsnymys))
                    @foreach ($Cmvsnymys as $Cmvsnymy)
                        <td class='py-2 px-4'>{{ $Cmvsnymy }}</td>
                    @endforeach
                @endif
                @if (isset($totcmnys))
                    @foreach ($totcmnys as $totcmny)
                        <td class='py-2 px-4'>{{ $totcmny }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">0.9CM+Sx</td>
                @if (isset($ccxs))
                    @foreach ($ccxs as $ccx)
                        <td class='py-2 px-4'>{{ $ccx }}</td>
                    @endforeach
                @endif
                @if (isset($ccmxs))
                    @foreach ($ccmxs as $ccmx)
                        <td class='py-2 px-4'>{{ $ccmx }}</td>
                    @endforeach
                @endif
                @if (isset($ccmys))
                    @foreach ($ccmys as $ccmy)
                        <td class='py-2 px-4'>{{ $ccmy }}</td>
                    @endforeach
                @endif
                @if (isset($cctots))
                    @foreach ($cctots as $cctot)
                        <td class='py-2 px-4'>{{ $cctot }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">0.9CM-Sx</td>
                @if (isset($ccnxs))
                    @foreach ($ccnxs as $ccnx)
                        <td class='py-2 px-4'>{{ $ccnx }}</td>
                    @endforeach
                @endif
                @if (isset($ccnmxs))
                    @foreach ($ccnmxs as $ccnmx)
                        <td class='py-2 px-4'>{{ $ccnmx }}</td>
                    @endforeach
                @endif
                @if (isset($ccnmys))
                    @foreach ($ccnmys as $ccnmy)
                        <td class='py-2 px-4'>{{ $ccnmy }}</td>
                    @endforeach
                @endif
                @if (isset($ccntots))
                    @foreach ($ccntots as $ccntot)
                        <td class='py-2 px-4'>{{ $ccntot }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">0.9CM+Sy</td>
                @if (isset($ccyxs))
                    @foreach ($ccyxs as $ccyx)
                        <td class='py-2 px-4'>{{ $ccyx }}</td>
                    @endforeach
                @endif
                @if (isset($ccymxs))
                    @foreach ($ccymxs as $ccymx)
                        <td class='py-2 px-4'>{{ $ccymx }}</td>
                    @endforeach
                @endif
                @if (isset($ccymys))
                    @foreach ($ccymys as $ccymy)
                        <td class='py-2 px-4'>{{ $ccymy }}</td>
                    @endforeach
                @endif
                @if (isset($ccytots))
                    @foreach ($ccytots as $ccytot)
                        <td class='py-2 px-4'>{{ $ccytot }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">0.9CM-Sy</td>
                @if (isset($ccnyxs))
                    @foreach ($ccnyxs as $ccnyx)
                        <td class='py-2 px-4'>{{ $ccnyx }}</td>
                    @endforeach
                @endif
                @if (isset($ccnymxs))
                    @foreach ($ccnymxs as $ccnymx)
                        <td class='py-2 px-4'>{{ $ccnymx }}</td>
                    @endforeach
                @endif
                @if (isset($ccnymys))
                    @foreach ($ccnymys as $ccnymy)
                        <td class='py-2 px-4'>{{ $ccnymy }}</td>
                    @endforeach
                @endif
                @if (isset($ccnytots))
                    @foreach ($ccnytots as $ccnytot)
                        <td class='py-2 px-4'>{{ $ccnytot }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td></td>
                <td></td>
                <td></td>
                <td class='py-2 px-4' colspan="3">σ últ (tonf/m<sup>2</sup>)</td>
                @if (isset($Pultis))
                    @foreach ($Pultis as $Pulti)
                        <td class='py-2 px-4'>{{ $Pulti }}</td>
                    @endforeach
                @endif
            </tr>
        </tbody>

    </table>
</div>
<div class="overflow-auto">
    <table class="min-w-full text-gray-800 dark:text-white">
        <!-- Verificacion por extensidades -->
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="10">3.- Verificacion de extensidades</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col"></th>
                <th class="text-lg py-2 px-4" colspan="2" scope="col">Fuerza axial</th>
                <th class="text-lg py-2 px-4" colspan="2" scope="col">Momento en X</th>
                <th class="text-lg py-2 px-4" colspan="2" scope="col">Momento en Y</th>
                <th class="text-lg py-2 px-4" colspan="2" scope="col">Resultante</th>
                <th class="text-lg py-2 px-4" scope="col"></th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            {{-- CM+ CV --}}
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV</td>
                <td class='py-2 px-4 text-center'>{{ $CmCv }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCv }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvmx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvmx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteA }}</td>
                <td class='py-2 px-4 text-center'>{{ $Resultanteb }}</td>
                @if (isset($VrfExs))
                    @foreach ($VrfExs as $VrfEx)
                        <td class='py-2 px-4'>{{ $VrfEx }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'>{{ $CmCv }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCv }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvmx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvmx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteA }}</td>
                <td class='py-2 px-4 text-center'>{{ $Resultanteb }}</td>
                @if (isset($VrfEx2s))
                    @foreach ($VrfEx2s as $VrfEx2)
                        <td class='py-2 px-4'>{{ $VrfEx2 }}</td>
                    @endforeach
                @endif
            </tr>
            {{-- CM+CV+0.8Sx --}}
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV+0.8Sx</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsxmx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsxmx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvsxmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsxmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteAx }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteAx }}</td>
                @if (isset($VrfEs))
                    @foreach ($VrfEs as $VrfE)
                        <td class='py-2 px-4'>{{ $VrfE }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'>{{ $CmCvsx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsxmx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsxmx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvsxmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsxmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteAx }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteAx }}</td>
                @if (isset($VrfE2s))
                    @foreach ($VrfE2s as $VrfE2)
                        <td class='py-2 px-4'>{{ $VrfE2 }}</td>
                    @endforeach
                @endif
            </tr>
            {{-- CM+CV-0.8Sx --}}
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV-0.8Sx</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsxmx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsxmx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvnsxmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsxmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteASX }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteASX }}</td>
                @if (isset($VrfESXs))
                    @foreach ($VrfESXs as $VrfESX)
                        <td class='py-2 px-4'>{{ $VrfESX }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'>{{ $CmCvnsx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsxmx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsxmx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvnsxmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsxmy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteASX2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultantebSX2 }}</td>
                @if (isset($VrfESX2s))
                    @foreach ($VrfESX2s as $VrfESX2)
                        <td class='py-2 px-4'>{{ $VrfESX2 }}</td>
                    @endforeach
                @endif
            </tr>
            {{-- CM+CV+0.8Sy --}}
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV+0.8Sy</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsymx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsymx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvsymy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsymy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteASy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultantebSy }}</td>
                @if (isset($VrfESys))
                    @foreach ($VrfESys as $VrfESy)
                        <td class='py-2 px-4'>{{ $VrfESy }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'>{{ $CmCvsy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsymx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsymx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvsymy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsymy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteASy2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultantebSy2 }}</td>
                @if (isset($VrfESy2s))
                    @foreach ($VrfESy2s as $VrfESy2)
                        <td class='py-2 px-4'>{{ $VrfESy2 }}</td>
                    @endforeach
                @endif
            </tr>
            {{-- CM+CV-0.8Sy --}}
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV-0.8Sy</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsnymx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsnymx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvsnymy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsnymy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteASny }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultantebSny }}</td>
                @if (isset($VrfESnys))
                    @foreach ($VrfESnys as $VrfESny)
                        <td class='py-2 px-4'>{{ $VrfESny }}</td>
                    @endforeach
                @endif
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'>{{ $CmCvnsy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvnsy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsnymx }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsnymx }}</td>
                <td class='py-2 px-4 text-center'>-{{ $CmCvsnymy }}</td>
                <td class='py-2 px-4 text-center'>{{ $CmCvsnymy }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultanteASny2 }}</td>
                <td class='py-2 px-4 text-center'>{{ $ResultantebSny2 }}</td>
                @if (isset($VrfESny2s))
                    @foreach ($VrfESny2s as $VrfESny2)
                        <td class='py-2 px-4'>{{ $VrfESny2 }}</td>
                    @endforeach
                @endif
            </tr>
        </tbody>

        <!-- Diseño por aceros para calcular el area por capas corte -->
        <thead class="bg-gray-200 dark:bg-gray-700"></thead>
        <tbody id="aceroscortes" class="py-2"></tbody>
    </table>
</div>
{{-- ANALISIS POR PUNZONAMIENTO --}}
<div class="overflow-auto">
    <table class="min-w-full text-gray-800 dark:text-white">
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="5">4.- Análisis por punzonamiento</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Simbolo</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultados</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>peralte efectivo</td>
                <td class='py-2 px-4 text-center' scope="col">d</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $peralteEfectivo }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>fuerza axial último</td>
                <td class='py-2 px-4 text-center' scope="col">Pu</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PUCargaUltima }} Tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>presión último en el suelo</td>
                <td class='py-2 px-4 text-center' scope="col">σu</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $Pulti }} tonf/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>perimetro de corte</td>
                <td class='py-2 px-4 text-center' scope="col">b o</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PCorte }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>área efectiva de punzonamiento</td>
                <td class='py-2 px-4 text-center' scope="col">A o</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $AefectivaP }} m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>relación del lado largo al lado corto de la sección de la columna</td>
                <td class='py-2 px-4 text-center' scope="col">β</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $RelacionLLCol }} </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>factor de reducción a cortante</td>
                <td class='py-2 px-4 text-center' scope="col">∅</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $FactorReduccionCortante }} </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>40 para columnas interiores, 30 para columnas de borde y 20 para columnas en
                    esquina</td>
                <td class='py-2 px-4 text-center' scope="col">α s</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $columna }} </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>fuerza cortante último</td>
                <td class='py-2 px-4 text-center' scope="col">Vu</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $FcortanteUltimo }} tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>NTP E.060 (11.12.2.1)</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c1</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $VC1 }} tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>NTP E.060 (11.12.2.1)</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c2</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $VCn2 }} tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>NTP E.060 (11.12.2.1)</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c3</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $VCn3 }} tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>resistencia nominal por punzonamiento del concreto</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $ResistenciaNominal }} tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>VERIFICACION</td>
                <td class='py-2 px-4 text-center' scope="col"></td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $VerificarCN }}</td>
            </tr>
        </tbody>

        {{-- Verificacion  de corte por flexion --}}
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="4">4.1.- Verificación de  corte</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Simbolo</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultados</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>peralte efectivo</td>
                <td class='py-2 px-4 text-center' scope="col">d</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $PEfectivoCM }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>dimensión de zapata en X</td>
                <td class='py-2 px-4 text-center' scope="col">l</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $l }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>dimensión de zapata en Y</td>
                <td class='py-2 px-4 text-center' scope="col">B</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $B }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>volado en X</td>
                <td class='py-2 px-4 text-center' scope="col">Lvx</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lvx }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>volado en Y</td>
                <td class='py-2 px-4 text-center' scope="col">Lvy</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lvy }} m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>factor de reducción a cortante</td>
                <td class='py-2 px-4 text-center' scope="col">∅</td>
                <td class='py-2 px-4 text-center'>{{ $FactorReduccionCortante }} </td>
                <td class='py-2 px-4 text-center'>{{ $FactorReduccionCortante }} </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>resistencia a compresión del concreto</td>
                <td class='py-2 px-4 text-center' scope="col">f'c</td>
                <td class='py-2 px-4 text-center'>{{ $fc }} kgf/cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'>{{ $fc }} kgf/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>peralte efectivo</td>
                <td class='py-2 px-4 text-center' scope="col">α s</td>
                <td class='py-2 px-4 text-center'>{{ $PEfectivoCM }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $PEfectivoCM }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>base</td>
                <td class='py-2 px-4 text-center' scope="col">b</td>
                <td class='py-2 px-4 text-center'>{{ $BASE }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $BASE2 }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>fuerza cortante último</td>
                <td class='py-2 px-4 text-center' scope="col">Vu</td>
                <td class='py-2 px-4 text-center'>{{ $FCultimo }} tonf</td>
                <td class='py-2 px-4 text-center'>{{ $FCultimo2 }} tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>resistencia nominal al cortante proporcionada por el concreto</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c</td>
                <td class='py-2 px-4 text-center'>{{ $Rnominal1 }} tonf</td>
                <td class='py-2 px-4 text-center'>{{ $Rnominal2 }} tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>Verificacion</td>
                <td class='py-2 px-4 text-center' scope="col"></td>
                <td class='py-2 px-4 text-center'>{{ $VerificarCN1 }}</td>
                <td class='py-2 px-4 text-center'>{{ $VerificarCN2 }}</td>
            </tr>
        </tbody>


        <!-- Diseño por aceros para calcular el area por capas corte -->
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="4">5.- Diseño por flexion</th>
            </tr>
            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                <th class="text-lg py-2 px-4" scope="col">Simbolo</th>
                <th class="text-lg py-2 px-4" scope="col" colspan="2">Resultados</th>
            </tr>
        </thead>
        <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>dimensión de zapata en X</td>
                <td class='py-2 px-4 text-center' scope="col">L</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $l }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>dimensión de zapata en Y</td>
                <td class='py-2 px-4 text-center' scope="col">B</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $B }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>volado en X</td>
                <td class='py-2 px-4 text-center' scope="col">Lvx</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $l }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>volado en Y</td>
                <td class='py-2 px-4 text-center' scope="col">Lvy</td>
                <td class='py-2 px-4 text-center' colspan="2">{{ $lvy }} m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'></td>
                <td class='py-2 px-4 text-center' scope="col"></td>
                <td class='py-2 px-4 text-center'>X</td>
                <td class='py-2 px-4 text-center'>Y</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>presión último en el suelo</td>
                <td class='py-2 px-4 text-center' scope="col">σ últ</td>
                <td class='py-2 px-4 text-center'>{{ $Pulti }} Tonf/m<sup>2</sup></td>
                <td class='py-2 px-4 text-center'>{{ $Pulti }} Tonf/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>momento Ultimo</td>
                <td class='py-2 px-4 text-center' scope="col">Mu</td>
                <td class='py-2 px-4 text-center'>{{ $MomentoUltimo }} tonf/m</td>
                <td class='py-2 px-4 text-center'>{{ $MomentoUltimo2 }} tonf/m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>base</td>
                <td class='py-2 px-4 text-center' scope="col">σ últ</td>
                <td class='py-2 px-4 text-center'>{{ $BASE2 }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $BASE }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>fluencia del acero</td>
                <td class='py-2 px-4 text-center' scope="col">fy</td>
                <td class='py-2 px-4 text-center'>{{ $fy }} kgf/cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'>{{ $fy }} kgf/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>resistencia a compresión del concreto</td>
                <td class='py-2 px-4 text-center' scope="col">f'c</td>
                <td class='py-2 px-4 text-center'>{{ $fc }} kgf/cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'>{{ $fc }} kgf/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>factor de reducción a cortante</td>
                <td class='py-2 px-4 text-center' scope="col">∅</td>
                <td class='py-2 px-4 text-center'>{{ $FactorReduccionFlexion }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $FactorReduccionFlexion }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>peralte efectivo</td>
                <td class='py-2 px-4 text-center' scope="col">d</td>
                <td class='py-2 px-4 text-center'>{{ $PEfectivoCM }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $PEfectivoCM }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>bloque comprimido</td>
                <td class='py-2 px-4 text-center' scope="col">a</td>
                <td class='py-2 px-4 text-center'>{{ $BloqueComprimido }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $BloqueComprimido2 }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>refuerzo calculado</td>
                <td class='py-2 px-4 text-center' scope="col">As</td>
                <td class='py-2 px-4 text-center'>{{ $RCalculado }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'>{{ $RCalculado2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>refuerzo mínimo</td>
                <td class='py-2 px-4 text-center' scope="col">A min</td>
                <td class='py-2 px-4 text-center'>{{ $Rminimo }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'>{{ $Rminimos }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>refuerzo a usar</td>
                <td class='py-2 px-4 text-center' scope="col">Ф Varilla</td>
                <td class='py-2 px-4 text-center'>{{ $AreaVarillax }}</td>
                <td class='py-2 px-4 text-center'>{{ $AreaVarillay }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>área del refuerzo</td>
                <td class='py-2 px-4 text-center' scope="col">As Varilla</td>
                <td class='py-2 px-4 text-center'>{{ $Varillax }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'>{{ $Varillay }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>Numero de varrillas</td>
                <td class='py-2 px-4 text-center' scope="col"># Varilla</td>
                <td class='py-2 px-4 text-center'>{{ $NumVarrilla1 }} varrillas</td>
                <td class='py-2 px-4 text-center'>{{ $NumVarrilla2 }} varrillas</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>refuerzo real</td>
                <td class='py-2 px-4 text-center' scope="col">As real</td>
                <td class='py-2 px-4 text-center'>{{ $Rreal1 }} cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'>{{ $Rreal2 }} cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>bloque comprimido real</td>
                <td class='py-2 px-4 text-center' scope="col">areal</td>
                <td class='py-2 px-4 text-center'>{{ $BCReal1 }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $BCReal2 }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>momento nominal</td>
                <td class='py-2 px-4 text-center' scope="col"> ϕMn</td>
                <td class='py-2 px-4 text-center'>{{ $Rnominal1 }} tonf-m</td>
                <td class='py-2 px-4 text-center'>{{ $Rnominal2 }} tonf-m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>verificacion</td>
                <td class='py-2 px-4 text-center' scope="col"></td>
                <td class='py-2 px-4 text-center'>{{ $Vfelxion1 }}</td>
                <td class='py-2 px-4 text-center'>{{ $Vfelxion2 }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>espaciamiento</td>
                <td class='py-2 px-4 text-center' scope="col">s</td>
                <td class='py-2 px-4 text-center'>{{ $Pespaciamiento1 }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $Pespaciamiento2 }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>espaciamiento</td>
                <td class='py-2 px-4 text-center' scope="col">s</td>
                <td class='py-2 px-4 text-center'>{{ $Sespaciamiento1 }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $Sespaciamiento2 }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>espaciamiento</td>
                <td class='py-2 px-4 text-center' scope="col">s</td>
                <td class='py-2 px-4 text-center'>{{ $espaciamientox }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $espaciamientoy }} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>verificacion</td>
                <td class='py-2 px-4 text-center' scope="col">s</td>
                <td class='py-2 px-4 text-center'>{{ $Vespaciamiento1 }} cm</td>
                <td class='py-2 px-4 text-center'>{{ $Vespaciamiento2 }} cm</td>
            </tr>
        </tbody>
    </table>
</div>
