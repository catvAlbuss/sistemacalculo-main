<?php
    $p = [0, 0, 0, 0];
    $Mx = [0, 0, 0, 0];
    $My = [0, 0, 0, 0];
    $Ps = [];
    $MXs = [];
    $MYs = [];

    if (!empty($CargaCondicionServicio) && is_array($CargaCondicionServicio) && count($CargaCondicionServicio) >= 4) {
        $p = [];
        $Mx = [];
        $My = [];
        for ($i = 0; $i < count($CargaCondicionServicio); $i++) {
            $p[] = $CargaCondicionServicio[$i][1] ?? 0;
        }
        for ($i = 0; $i < count($CargaCondicionServicio); $i++) {
            $Mx[] = $CargaCondicionServicio[$i][2] ?? 0;
        }
        for ($i = 0; $i < count($CargaCondicionServicio); $i++) {
            $My[] = $CargaCondicionServicio[$i][3] ?? 0;
        }
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

    if (count($p) >= 4) {
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
        $Sespaciamiento1 = round(
            ($Varillax / (MAX($RCalculado, $Rminimo) / ($BASE2 / 100))) * 100,
            2,
            PHP_ROUND_HALF_UP,
        );
        $Sespaciamiento2 = round(
            ($Varillay / (MAX($RCalculado2, $Rminimos) / ($BASE / 100))) * 100,
            2,
            PHP_ROUND_HALF_UP,
        );
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
    }
?>
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
                <?php if(isset($Ps)): ?>
                    <?php $__currentLoopData = $Ps; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $P): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($P); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXs)): ?>
                    <?php $__currentLoopData = $MXs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MX): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MX); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYs)): ?>
                    <?php $__currentLoopData = $MYs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MY): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MY); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">1.25(CM+CV)+Sx</td>
                <?php if(isset($Pcs)): ?>
                    <?php $__currentLoopData = $Pcs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pc): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pc); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXMsxs)): ?>
                    <?php $__currentLoopData = $MXMsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MXMsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MXMsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYMsxs)): ?>
                    <?php $__currentLoopData = $MYMsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MYMsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MYMsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">1.25(CM+CV)-Sx</td>
                <?php if(isset($Pcns)): ?>
                    <?php $__currentLoopData = $Pcns; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pcn): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pcn); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXnsxs)): ?>
                    <?php $__currentLoopData = $MXnsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MXnsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MXnsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYnsxs)): ?>
                    <?php $__currentLoopData = $MYnsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MYnsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MYnsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">1.25(CM+CV)+Sy</td>
                <?php if(isset($PSys)): ?>
                    <?php $__currentLoopData = $PSys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $PSy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($PSy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXSys)): ?>
                    <?php $__currentLoopData = $MXSys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MXSy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MXSy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYsys)): ?>
                    <?php $__currentLoopData = $MYsys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MYsy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MYsy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">1.25(CM+CV)-Sy</td>
                <?php if(isset($PSnys)): ?>
                    <?php $__currentLoopData = $PSnys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $PSny): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($PSny); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXnSys)): ?>
                    <?php $__currentLoopData = $MXnSys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MXnSy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MXnSy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYnsys)): ?>
                    <?php $__currentLoopData = $MYnsys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MYnsy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MYnsy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM+Sx</td>
                <?php if(isset($Pmss)): ?>
                    <?php $__currentLoopData = $Pmss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pms): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pms); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MxCmSxs)): ?>
                    <?php $__currentLoopData = $MxCmSxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MxCmSx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MxCmSx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MyCmSxs)): ?>
                    <?php $__currentLoopData = $MyCmSxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MyCmSx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MyCmSx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sx</td>
                <?php if(isset($Pmnss)): ?>
                    <?php $__currentLoopData = $Pmnss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pmns): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pmns); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MxCmSxns)): ?>
                    <?php $__currentLoopData = $MxCmSxns; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MxCmSxn): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MxCmSxn); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MyCmSxns)): ?>
                    <?php $__currentLoopData = $MyCmSxns; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MyCmSxn): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MyCmSxn); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM+Sy</td>
                <?php if(isset($Pmyss)): ?>
                    <?php $__currentLoopData = $Pmyss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pmyss): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pmys); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MxCmSxys)): ?>
                    <?php $__currentLoopData = $MxCmSxys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MxCmSxy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MxCmSxy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MyCmSxys)): ?>
                    <?php $__currentLoopData = $MyCmSxys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MyCmSxy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MyCmSxy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sy</td>
                <?php if(isset($Pmnyss)): ?>
                    <?php $__currentLoopData = $Pmnyss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pmnys): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pmnys); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MxCmSxnys)): ?>
                    <?php $__currentLoopData = $MxCmSxnys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MxCmSxny): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MxCmSxny); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MyCmSxnys)): ?>
                    <?php $__currentLoopData = $MyCmSxnys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MyCmSxny): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MyCmSxny); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
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
                <?php if(isset($pccs)): ?>
                    <?php $__currentLoopData = $pccs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $pcc): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($pcc); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXccs)): ?>
                    <?php $__currentLoopData = $MXccs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MXcc): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MXcc); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYccs)): ?>
                    <?php $__currentLoopData = $MYccs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MYcc): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MYcc); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">CM+CV + 0.8Sx</td>
                <?php if(isset($Pcpss)): ?>
                    <?php $__currentLoopData = $Pcpss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pcps): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pcps); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXpss)): ?>
                    <?php $__currentLoopData = $MXpss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MXps): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MXps); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYpss)): ?>
                    <?php $__currentLoopData = $MYpss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MYps): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MYps); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sy</td>
                <?php if(isset($Pcnsnegs)): ?>
                    <?php $__currentLoopData = $Pcnsnegs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pcnsneg): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pcnsneg); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXnsnegs)): ?>
                    <?php $__currentLoopData = $MXnsnegs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MXnsneg): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MXnsneg); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYnsnegs)): ?>
                    <?php $__currentLoopData = $MYnsnegs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MYnsneg): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MYnsneg); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sy</td>
                <?php if(isset($Pcpyss)): ?>
                    <?php $__currentLoopData = $Pcpyss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pcpys): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pcpys); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXpyss)): ?>
                    <?php $__currentLoopData = $MXpyss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MXpys): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MXpys); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYpyss)): ?>
                    <?php $__currentLoopData = $MYpyss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MYpys): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MYpys); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="4">0.9CM-Sy</td>
                <?php if(isset($Pcnyss)): ?>
                    <?php $__currentLoopData = $Pcnyss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pcnys): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pcnys); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MXnyss)): ?>
                    <?php $__currentLoopData = $MXnyss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MXnys): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MXnys); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($MYnyss)): ?>
                    <?php $__currentLoopData = $MYnyss; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $MYnys): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($MYnys); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
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
                <?php if(isset($CmCvs)): ?>
                    <?php $__currentLoopData = $CmCvs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCv): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCv); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvmxs)): ?>
                    <?php $__currentLoopData = $CmCvmxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvmx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvmx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvmys)): ?>
                    <?php $__currentLoopData = $CmCvmys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvmy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvmy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($tots)): ?>
                    <?php $__currentLoopData = $tots; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $tot): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($tot); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <td class='py-2 px-4'> <?php echo e($cPortante); ?></td>
                <?php if(isset($Condicions)): ?>
                    <?php $__currentLoopData = $Condicions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Condicion): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Condicion); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4'>CM+CV + 0.8Sx</td>
                <?php if(isset($CmCvsxs)): ?>
                    <?php $__currentLoopData = $CmCvsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvsxmxs)): ?>
                    <?php $__currentLoopData = $CmCvsxmxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvsxmx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvsxmx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvsxmys)): ?>
                    <?php $__currentLoopData = $CmCvsxmys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvsxmy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvsxmy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($totsxs)): ?>
                    <?php $__currentLoopData = $totsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $totsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($totsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <td class='py-2 px-4'> <?php echo e($CPCC); ?></td>
                <?php if(isset($Condicions)): ?>
                    <?php $__currentLoopData = $Condicions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Condicion): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Condicion); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4'>CM+CV - 0.8Sx</td>
                <?php if(isset($CmCvnsxs)): ?>
                    <?php $__currentLoopData = $CmCvnsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvnsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvnsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvnsxmxs)): ?>
                    <?php $__currentLoopData = $CmCvnsxmxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvnsxmx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvnsxmx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvnsxmys)): ?>
                    <?php $__currentLoopData = $CmCvnsxmys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvnsxmy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvnsxmy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($totnsxs)): ?>
                    <?php $__currentLoopData = $totnsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $totnsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($totnsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <td class='py-2 px-4'> <?php echo e($CPCCn); ?></td>
                <?php if(isset($Condicionnsxs)): ?>
                    <?php $__currentLoopData = $Condicionnsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Condicionnsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Condicionnsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4'>CM+CV + 0.8Sy</td>
                <?php if(isset($CmCvsys)): ?>
                    <?php $__currentLoopData = $CmCvsys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvsy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvsy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvsymxs)): ?>
                    <?php $__currentLoopData = $CmCvsymxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvsymx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvsymx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvsymys)): ?>
                    <?php $__currentLoopData = $CmCvsymys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvsymy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvsymy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($totsys)): ?>
                    <?php $__currentLoopData = $totsys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $totsy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($totsy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <td class='py-2 px-4'> <?php echo e($CPCCy); ?></td>
                <?php if(isset($Condicionsys)): ?>
                    <?php $__currentLoopData = $Condicionsys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Condicionsy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Condicionsy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4'>CM+CV - 0.8Sy</td>
                <?php if(isset($CmCvnsys)): ?>
                    <?php $__currentLoopData = $CmCvnsys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvnsy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvnsy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvsnymxs)): ?>
                    <?php $__currentLoopData = $CmCvsnymxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvsnymx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvsnymx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($CmCvsnymys)): ?>
                    <?php $__currentLoopData = $CmCvsnymys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $CmCvsnymy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($CmCvsnymy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($totsnys)): ?>
                    <?php $__currentLoopData = $totsnys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $totsny): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($totsny); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <td class='py-2 px-4'> <?php echo e($CPCCny); ?></td>
                <?php if(isset($Condicionsnys)): ?>
                    <?php $__currentLoopData = $Condicionsnys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Condicionsny): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Condicionsny); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
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
                <?php if(isset($cmvs)): ?>
                    <?php $__currentLoopData = $cmvs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cmv): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($cmv); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvmxs)): ?>
                    <?php $__currentLoopData = $Cmvmxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvmx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvmx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvmys)): ?>
                    <?php $__currentLoopData = $Cmvmys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvmy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvmy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($totPDs)): ?>
                    <?php $__currentLoopData = $totPDs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $totPD): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($totPD); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">1.25(CM+CV)+Sx</td>
                <?php if(isset($Cmvsxs)): ?>
                    <?php $__currentLoopData = $Cmvsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvsxmxs)): ?>
                    <?php $__currentLoopData = $Cmvsxmxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvsxmx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvsxmx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvsxmys)): ?>
                    <?php $__currentLoopData = $Cmvsxmys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvsxmy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvsxmy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($totcvs)): ?>
                    <?php $__currentLoopData = $totcvs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $totcv): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($totcv); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">1.25(CM+CV)-Sx</td>
                <?php if(isset($Cmvnsxs)): ?>
                    <?php $__currentLoopData = $Cmvnsxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvnsx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvnsx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvnsxmxs)): ?>
                    <?php $__currentLoopData = $Cmvnsxmxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvnsxmx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvnsxmx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvnsxmys)): ?>
                    <?php $__currentLoopData = $Cmvnsxmys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvnsxmy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvnsxmy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($totcmxs)): ?>
                    <?php $__currentLoopData = $totcmxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $totcmx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($totcmx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">1.25(CM+CV)+Sy</td>
                <?php if(isset($Cmvsys)): ?>
                    <?php $__currentLoopData = $Cmvsys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvsy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvsy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvsymxs)): ?>
                    <?php $__currentLoopData = $Cmvsymxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvsymx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvsymx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvsymys)): ?>
                    <?php $__currentLoopData = $Cmvsymys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvsymy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvsymy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($totcmsys)): ?>
                    <?php $__currentLoopData = $totcmsys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $totcmsy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($totcmsy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">1.25(CM+CV)-Sy</td>
                <?php if(isset($Cmvnsys)): ?>
                    <?php $__currentLoopData = $Cmvnsys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvnsy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvnsy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvsnymxs)): ?>
                    <?php $__currentLoopData = $Cmvsnymxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvsnymx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvsnymx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($Cmvsnymys)): ?>
                    <?php $__currentLoopData = $Cmvsnymys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Cmvsnymy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Cmvsnymy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($totcmnys)): ?>
                    <?php $__currentLoopData = $totcmnys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $totcmny): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($totcmny); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">0.9CM+Sx</td>
                <?php if(isset($ccxs)): ?>
                    <?php $__currentLoopData = $ccxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccmxs)): ?>
                    <?php $__currentLoopData = $ccmxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccmx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccmx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccmys)): ?>
                    <?php $__currentLoopData = $ccmys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccmy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccmy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($cctots)): ?>
                    <?php $__currentLoopData = $cctots; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cctot): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($cctot); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">0.9CM-Sx</td>
                <?php if(isset($ccnxs)): ?>
                    <?php $__currentLoopData = $ccnxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccnx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccnx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccnmxs)): ?>
                    <?php $__currentLoopData = $ccnmxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccnmx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccnmx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccnmys)): ?>
                    <?php $__currentLoopData = $ccnmys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccnmy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccnmy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccntots)): ?>
                    <?php $__currentLoopData = $ccntots; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccntot): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccntot); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">0.9CM+Sy</td>
                <?php if(isset($ccyxs)): ?>
                    <?php $__currentLoopData = $ccyxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccyx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccyx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccymxs)): ?>
                    <?php $__currentLoopData = $ccymxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccymx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccymx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccymys)): ?>
                    <?php $__currentLoopData = $ccymys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccymy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccymy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccytots)): ?>
                    <?php $__currentLoopData = $ccytots; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccytot): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccytot); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4' colspan="3">0.9CM-Sy</td>
                <?php if(isset($ccnyxs)): ?>
                    <?php $__currentLoopData = $ccnyxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccnyx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccnyx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccnymxs)): ?>
                    <?php $__currentLoopData = $ccnymxs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccnymx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccnymx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccnymys)): ?>
                    <?php $__currentLoopData = $ccnymys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccnymy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccnymy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
                <?php if(isset($ccnytots)): ?>
                    <?php $__currentLoopData = $ccnytots; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ccnytot): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($ccnytot); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td></td>
                <td></td>
                <td></td>
                <td class='py-2 px-4' colspan="3">σ últ (tonf/m<sup>2</sup>)</td>
                <?php if(isset($Pultis)): ?>
                    <?php $__currentLoopData = $Pultis; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $Pulti): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($Pulti); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
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
            
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV</td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCv); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCv); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvmx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvmx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteA); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($Resultanteb); ?></td>
                <?php if(isset($VrfExs)): ?>
                    <?php $__currentLoopData = $VrfExs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfEx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfEx); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'><?php echo e($CmCv); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCv); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvmx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvmx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteA); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($Resultanteb); ?></td>
                <?php if(isset($VrfEx2s)): ?>
                    <?php $__currentLoopData = $VrfEx2s; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfEx2): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfEx2); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV+0.8Sx</td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsxmx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsxmx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvsxmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsxmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteAx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteAx); ?></td>
                <?php if(isset($VrfEs)): ?>
                    <?php $__currentLoopData = $VrfEs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfE): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfE); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsxmx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsxmx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvsxmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsxmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteAx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteAx); ?></td>
                <?php if(isset($VrfE2s)): ?>
                    <?php $__currentLoopData = $VrfE2s; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfE2): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfE2); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV-0.8Sx</td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsxmx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsxmx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvnsxmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsxmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteASX); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteASX); ?></td>
                <?php if(isset($VrfESXs)): ?>
                    <?php $__currentLoopData = $VrfESXs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfESX): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfESX); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsxmx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsxmx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvnsxmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsxmy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteASX2); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultantebSX2); ?></td>
                <?php if(isset($VrfESX2s)): ?>
                    <?php $__currentLoopData = $VrfESX2s; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfESX2): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfESX2); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV+0.8Sy</td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsymx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsymx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvsymy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsymy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteASy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultantebSy); ?></td>
                <?php if(isset($VrfESys)): ?>
                    <?php $__currentLoopData = $VrfESys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfESy): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfESy); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsymx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsymx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvsymy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsymy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteASy2); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultantebSy2); ?></td>
                <?php if(isset($VrfESy2s)): ?>
                    <?php $__currentLoopData = $VrfESy2s; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfESy2): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfESy2); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8' rowspan="2">CM+CV-0.8Sy</td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsnymx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsnymx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvsnymy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsnymy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteASny); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultantebSny); ?></td>
                <?php if(isset($VrfESnys)): ?>
                    <?php $__currentLoopData = $VrfESnys; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfESny): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfESny); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvnsy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsnymx); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsnymx); ?></td>
                <td class='py-2 px-4 text-center'>-<?php echo e($CmCvsnymy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($CmCvsnymy); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultanteASny2); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($ResultantebSny2); ?></td>
                <?php if(isset($VrfESny2s)): ?>
                    <?php $__currentLoopData = $VrfESny2s; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $VrfESny2): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class='py-2 px-4'><?php echo e($VrfESny2); ?></td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </tr>
        </tbody>

        <!-- Diseño por aceros para calcular el area por capas corte -->
        <thead class="bg-gray-200 dark:bg-gray-700"></thead>
        <tbody id="aceroscortes" class="py-2"></tbody>
    </table>
</div>

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
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($peralteEfectivo); ?> m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>fuerza axial último</td>
                <td class='py-2 px-4 text-center' scope="col">Pu</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($PUCargaUltima); ?> Tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>presión último en el suelo</td>
                <td class='py-2 px-4 text-center' scope="col">σu</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($Pulti); ?> tonf/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>perimetro de corte</td>
                <td class='py-2 px-4 text-center' scope="col">b o</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($PCorte); ?> m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>área efectiva de punzonamiento</td>
                <td class='py-2 px-4 text-center' scope="col">A o</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($AefectivaP); ?> m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>relación del lado largo al lado corto de la sección de la columna</td>
                <td class='py-2 px-4 text-center' scope="col">β</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($RelacionLLCol); ?> </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>factor de reducción a cortante</td>
                <td class='py-2 px-4 text-center' scope="col">∅</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($FactorReduccionCortante); ?> </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>40 para columnas interiores, 30 para columnas de borde y 20 para columnas en
                    esquina</td>
                <td class='py-2 px-4 text-center' scope="col">α s</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($columna); ?> </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>fuerza cortante último</td>
                <td class='py-2 px-4 text-center' scope="col">Vu</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($FcortanteUltimo); ?> tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>NTP E.060 (11.12.2.1)</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c1</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($VC1); ?> tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>NTP E.060 (11.12.2.1)</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c2</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($VCn2); ?> tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>NTP E.060 (11.12.2.1)</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c3</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($VCn3); ?> tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>resistencia nominal por punzonamiento del concreto</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($ResistenciaNominal); ?> tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>VERIFICACION</td>
                <td class='py-2 px-4 text-center' scope="col"></td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($VerificarCN); ?></td>
            </tr>
        </tbody>

        
        <thead class="bg-gray-200 dark:bg-gray-800">
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xl py-2 px-4 text-left" colspan="4">4.1.- Verificación de corte</th>
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
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($PEfectivoCM); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>dimensión de zapata en X</td>
                <td class='py-2 px-4 text-center' scope="col">l</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($l); ?> m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>dimensión de zapata en Y</td>
                <td class='py-2 px-4 text-center' scope="col">B</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($B); ?> m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>volado en X</td>
                <td class='py-2 px-4 text-center' scope="col">Lvx</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($lvx); ?> m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>volado en Y</td>
                <td class='py-2 px-4 text-center' scope="col">Lvy</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($lvy); ?> m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>factor de reducción a cortante</td>
                <td class='py-2 px-4 text-center' scope="col">∅</td>
                <td class='py-2 px-4 text-center'><?php echo e($FactorReduccionCortante); ?> </td>
                <td class='py-2 px-4 text-center'><?php echo e($FactorReduccionCortante); ?> </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>resistencia a compresión del concreto</td>
                <td class='py-2 px-4 text-center' scope="col">f'c</td>
                <td class='py-2 px-4 text-center'><?php echo e($fc); ?> kgf/cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'><?php echo e($fc); ?> kgf/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>peralte efectivo</td>
                <td class='py-2 px-4 text-center' scope="col">α s</td>
                <td class='py-2 px-4 text-center'><?php echo e($PEfectivoCM); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($PEfectivoCM); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>base</td>
                <td class='py-2 px-4 text-center' scope="col">b</td>
                <td class='py-2 px-4 text-center'><?php echo e($BASE); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($BASE2); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>fuerza cortante último</td>
                <td class='py-2 px-4 text-center' scope="col">Vu</td>
                <td class='py-2 px-4 text-center'><?php echo e($FCultimo); ?> tonf</td>
                <td class='py-2 px-4 text-center'><?php echo e($FCultimo2); ?> tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>resistencia nominal al cortante proporcionada por el concreto</td>
                <td class='py-2 px-4 text-center' scope="col">∅V c</td>
                <td class='py-2 px-4 text-center'><?php echo e($Rnominal1); ?> tonf</td>
                <td class='py-2 px-4 text-center'><?php echo e($Rnominal2); ?> tonf</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>Verificacion</td>
                <td class='py-2 px-4 text-center' scope="col"></td>
                <td class='py-2 px-4 text-center'><?php echo e($VerificarCN1); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($VerificarCN2); ?></td>
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
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($l); ?> m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>dimensión de zapata en Y</td>
                <td class='py-2 px-4 text-center' scope="col">B</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($B); ?> m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>volado en X</td>
                <td class='py-2 px-4 text-center' scope="col">Lvx</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($l); ?> m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>volado en Y</td>
                <td class='py-2 px-4 text-center' scope="col">Lvy</td>
                <td class='py-2 px-4 text-center' colspan="2"><?php echo e($lvy); ?> m</td>
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
                <td class='py-2 px-4 text-center'><?php echo e($Pulti); ?> Tonf/m<sup>2</sup></td>
                <td class='py-2 px-4 text-center'><?php echo e($Pulti); ?> Tonf/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>momento Ultimo</td>
                <td class='py-2 px-4 text-center' scope="col">Mu</td>
                <td class='py-2 px-4 text-center'><?php echo e($MomentoUltimo); ?> tonf/m</td>
                <td class='py-2 px-4 text-center'><?php echo e($MomentoUltimo2); ?> tonf/m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>base</td>
                <td class='py-2 px-4 text-center' scope="col">σ últ</td>
                <td class='py-2 px-4 text-center'><?php echo e($BASE2); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($BASE); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>fluencia del acero</td>
                <td class='py-2 px-4 text-center' scope="col">fy</td>
                <td class='py-2 px-4 text-center'><?php echo e($fy); ?> kgf/cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'><?php echo e($fy); ?> kgf/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>resistencia a compresión del concreto</td>
                <td class='py-2 px-4 text-center' scope="col">fc</td>
                <td class='py-2 px-4 text-center'><?php echo e($fc); ?> kgf/cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'><?php echo e($fc); ?> kgf/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>factor de reducción a cortante</td>
                <td class='py-2 px-4 text-center' scope="col">∅</td>
                <td class='py-2 px-4 text-center'><?php echo e($FactorReduccionFlexion); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($FactorReduccionFlexion); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>peralte efectivo</td>
                <td class='py-2 px-4 text-center' scope="col">d</td>
                <td class='py-2 px-4 text-center'><?php echo e($PEfectivoCM); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($PEfectivoCM); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>bloque comprimido</td>
                <td class='py-2 px-4 text-center' scope="col">a</td>
                <td class='py-2 px-4 text-center'><?php echo e($BloqueComprimido); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($BloqueComprimido2); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>refuerzo calculado</td>
                <td class='py-2 px-4 text-center' scope="col">As</td>
                <td class='py-2 px-4 text-center'><?php echo e($RCalculado); ?> cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'><?php echo e($RCalculado2); ?> cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>refuerzo mínimo</td>
                <td class='py-2 px-4 text-center' scope="col">A min</td>
                <td class='py-2 px-4 text-center'><?php echo e($Rminimo); ?> cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'><?php echo e($Rminimos); ?> cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>refuerzo a usar</td>
                <td class='py-2 px-4 text-center' scope="col">Ф Varilla</td>
                <td class='py-2 px-4 text-center'><?php echo e($AreaVarillax); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($AreaVarillay); ?></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>área del refuerzo</td>
                <td class='py-2 px-4 text-center' scope="col">As Varilla</td>
                <td class='py-2 px-4 text-center'><?php echo e($Varillax); ?> cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'><?php echo e($Varillay); ?> cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>Numero de varrillas</td>
                <td class='py-2 px-4 text-center' scope="col"># Varilla</td>
                <td class='py-2 px-4 text-center'><?php echo e($NumVarrilla1); ?> varrillas</td>
                <td class='py-2 px-4 text-center'><?php echo e($NumVarrilla2); ?> varrillas</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>refuerzo real</td>
                <td class='py-2 px-4 text-center' scope="col">As real</td>
                <td class='py-2 px-4 text-center'><?php echo e($Rreal1); ?> cm<sup>2</sup></td>
                <td class='py-2 px-4 text-center'><?php echo e($Rreal2); ?> cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>bloque comprimido real</td>
                <td class='py-2 px-4 text-center' scope="col">areal</td>
                <td class='py-2 px-4 text-center'><?php echo e($BCReal1); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($BCReal2); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>momento nominal</td>
                <td class='py-2 px-4 text-center' scope="col"> ϕMn</td>
                <td class='py-2 px-4 text-center'><?php echo e($Rnominal1); ?> tonf-m</td>
                <td class='py-2 px-4 text-center'><?php echo e($Rnominal2); ?> tonf-m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>verificacion</td>
                <td class='py-2 px-4 text-center' scope="col"></td>
                <td class='py-2 px-4 text-center'><?php echo e($Vfelxion1); ?></td>
                <td class='py-2 px-4 text-center'><?php echo e($Vfelxion2); ?></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>espaciamiento</td>
                <td class='py-2 px-4 text-center' scope="col">s</td>
                <td class='py-2 px-4 text-center'><?php echo e($Pespaciamiento1); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($Pespaciamiento2); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>espaciamiento</td>
                <td class='py-2 px-4 text-center' scope="col">s</td>
                <td class='py-2 px-4 text-center'><?php echo e($Sespaciamiento1); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($Sespaciamiento2); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>espaciamiento</td>
                <td class='py-2 px-4 text-center' scope="col">s</td>
                <td class='py-2 px-4 text-center'><?php echo e($espaciamientox); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($espaciamientoy); ?> cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600 text-center">
                <td class='py-2 px-8'>verificacion</td>
                <td class='py-2 px-4 text-center' scope="col">s</td>
                <td class='py-2 px-4 text-center'><?php echo e($Vespaciamiento1); ?> cm</td>
                <td class='py-2 px-4 text-center'><?php echo e($Vespaciamiento2); ?> cm</td>
            </tr>
        </tbody>
    </table>
</div>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\hcalculo\resultadoZapataGeneral.blade.php ENDPATH**/ ?>