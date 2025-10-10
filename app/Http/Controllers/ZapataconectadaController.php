<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ZapataconectadaController extends Controller
{
    public function zapataConectada(Request $request)
    {
        //dimensiones de las columnas
        $c1 = $request->input('anchoCol1', 0);
        $c_1 = $request->input('anchoCol2', 0);
        //luz libre entre columnas
        $ln = $request->input('lndiseno', 0);

        //columna 1
        $PD1 = $request->input('PD1', 0);
        $PL1 = $request->input('PL1', 0);
        $PSX1 = $request->input('PSX1', 0);
        $PSY1 = $request->input('PSY1', 0);
        $MDx1 = $request->input('MDx1', 0);
        $MLx1 = $request->input('MLx1', 0);
        $MDy1 = $request->input('MDy1', 0);
        $MLy1 = $request->input('MLy1', 0);
        $MSX1 = $request->input('MSX1', 0);
        $MSY1 = $request->input('MSY1', 0);

        //columna 2
        $PD2 = $request->input('PD2', 0);
        $PL2 = $request->input('PL2', 0);
        $PSX2 = $request->input('PSX2', 0);
        $PSY2 = $request->input('PSY2', 0);
        $MDx2 = $request->input('MDx2', 0);
        $MLx2 = $request->input('MLx2', 0);
        $MDy2 = $request->input('MDy2', 0);
        $MLy2 = $request->input('MLy2', 0);
        $MSX2 = $request->input('MSX2', 0);
        $MSY2 = $request->input('MSY2', 0);

        $qneta = $request->input('qneta', 0);

        //Anchos de cada cimentación
        $b1 = $request->input('b1', 0);
        $b2 = $request->input('b2', 0);
        $L1 = 0;
        $L2 = $request->input('l2', 0);

        //preciones amplificadas
        $facm = $request->input('fact_ampli_cm', 0);
        $facv = $request->input('fact_ampli_cv', 0);

        //preciones amplificadas caso 2
        $facmc2 = $request->input('fact_ampli_cm_c2', 0);
        $facvc2 = $request->input('fact_ampli_cv_c2', 0);

        return view('hcalculo.resultadoZapataConectada', compact(
            'c1',
            'c_1',
            'ln',
            'PD1',
            'PL1',
            'PSX1',
            'PSY1',
            'MDx1',
            'MLx1',
            'MDy1',
            'MLy1',
            'MSX1',
            'MSY1',
            'PD2',
            'PL2',
            'PSX2',
            'PSY2',
            'MDx2',
            'MLx2',
            'MDy2',
            'MLy2',
            'MSX2',
            'MSY2',
            'qneta',
            'b1',
            'b2',
            'L1',
            'L2',
            'facm',
            'facv',
            'facmc2',
            'facvc2',
        ));
    }
}
