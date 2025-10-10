<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CimientoCorridoController extends Controller
{
    public function cimientocorrido(Request $request)
    {
        $fc = $request->input('fc', 0);
        $fy = $request->input('fy', 0);
        $columna = $request->input('columna', 0);
        $re = $request->input('re', 0);
        $yalbaneria = $request->input('yalbañeria', 0);
        $ycsimple = $request->input('ycsimple', 0);
        $Carmado = $request->input('Carmado', 0);
        $esadterr = $request->input('esadterr', 0);
        $pdcimt = $request->input('pdcimt', 0);
        $yprom = $request->input('yprom', 0);
        $sc = $request->input('sc', 0);
        $esmuro = $request->input('esmuro', 0);
        $h = $request->input('h', 0);
        $CM = $request->input('CM', 0);
        $CV = $request->input('CV', 0);
        $l1 = $request->input('l1', 0);
        $l2 = $request->input('l2', 0);
        
        $h = 150;
        $b = 145; //floatval($_POST["b"]);
        $hCM = 50; //floatval($_POST["hCM"]);
        $conCiclo = 0.5; //floatval($_POST["conCiclo"]);

        return view('hcalculo.resultadoCimientoCorrido', compact(
            'fc',
            'fy',
            'columna',
            're',
            'yalbaneria',
            'ycsimple',
            'Carmado',
            'esadterr',
            'pdcimt',
            'yprom',
            'sc',
            'esmuro',
            'h',
            'CM',
            'CV',
            'l1',
            'l2',
            'b',
            'hCM',
            'conCiclo',
        ));
    }
}
