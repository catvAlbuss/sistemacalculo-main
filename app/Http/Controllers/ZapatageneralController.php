<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ZapatageneralController extends Controller
{
    public function zapataGeneral(Request $request)
    {
        $fc = $request->input('fc', 0);
        $fy = $request->input('fy', 0);
        $ys = $request->input('ys', 0);
        $df = $request->input('df', 0);
        $t = $request->input('t', 0);
        $b = $request->input('b', 0);
        $dzapata = $request->input('dzapata', 0);
        $l = $request->input('l', 0);
        $B = $request->input('DZY', 0);
        $cps = $request->input('cps', 0);
        $columna = $request->input('Columna', 0);
        $Varillax = $request->input('VarillaX', 0);
        $Varillay = $request->input('VarillaY', 0);
        $espaciamientox = $request->input('espaciamientox', 0);
        $espaciamientoy = $request->input('espaciamientoy', 0);
        $CargaCondicionServicio = json_decode($request->input('dataFromHandsontable'), true);

        return view('hcalculo.resultadoZapataGeneral',compact(
            'fc',
            'fy',
            'ys',
            'df',
            't',
            'b',
            'dzapata',
            'l',
            'B',
            'cps',
            'columna',
            'Varillax',
            'Varillay',
            'espaciamientox',
            'espaciamientoy',
            'CargaCondicionServicio',
        ));
    }
}
