<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DesingLosaController extends Controller
{
    public function losasAligeradas(Request $request)
    {
        Log::info('Datos recibidos en losasAligeradas:', $request->all());
        $fc = $request->input('fc', 0);
        $fy = $request->input('fy', 0);
        $num_tramos = $request->input('num_tramos', 0);

        // Obtener los valores generados dinámicamente
        $luzLibre = [];
        $cargaMuerta = [];
        $cargaViva = [];
        $altura = [];
        $base = [];
        $eje = [];
        $b = [];
        $Mi = [];
        $Md = [];
        $did1 = [];
        $did2 = [];
        $did3 = [];
        $Cv = [];
        $CM = [];
        $bp = [];

        for ($i = 1; $i <= $num_tramos; $i++) {
            $base[$i] = $request->input("BASE$i", 0);
            $altura[$i] = $request->input("ALTURA$i", 0);
            $Cv[$i] = $request->input("Cviva$i", 0);
            $CM[$i] = $request->input("CMuerta$i", 0);
            $luzLibre[$i] = $request->input("Luz_Libre$i", 0);
            $Mi[$i] = $request->input("Mi$i", 0);
            $Md[$i] = $request->input("Md$i", 0);
            $did1[$i] = $request->input("δ1$i", 0);
            $did2[$i] = $request->input("δ2$i", 0);
            $did3[$i] = $request->input("δ3$i", 0);
            $bp[$i] = $request->input("EVB$i", 0);

            $Bases = $base[$i];
            $Altura = $altura[$i];
            $MoIzq = $Mi[$i];
            $Moder = $Md[$i];
            $DefelxioncargaMuerta = $did1[$i];
            $DefelxioncargaViva = $did2[$i];
            $DefelxioncargaVivaporcentaje = $did3[$i];
            $cargaMuerta[$i] = $request->input("CMuerta$i", 0);
            $cargaViva[$i] = $request->input("Cviva$i", 0);
            $bpeque[$i] = $request->input("EVB$i", 0);
        }

        // Mu negativos
        $mu = [];
        $vu = [];
        $tu = [];
        $Vultimonegativo = 0;
        $tUltimoNegativo = 0;
        for ($i = 1; $i <= $num_tramos * 3; $i++) {
            $mu[$i] = $request->input("MomentoUltimo-$i", 0);
            $vu[$i] = $request->input("Vu-$i", 0);
            $tu[$i] = $request->input("Tu-$i", 0);
            $Vultimonegativo = $request->input("Vu-$i", 0);
            $tUltimoNegativo = $request->input("Tu-$i", 0);
        }

        // Mu positivos
        $mu_ = [];
        $vu_ = [];
        $tu_ = [];
        $VultimoPositivo = 0;
        $tUltimoPositiva = 0;
        for ($i = 1; $i <= $num_tramos * 3; $i++) {
            $mu_[$i] = $request->input("MomentoUltimo+$i", 0);
            $vu_[$i] = $request->input("Vu+$i", 0);
            $tu_[$i] = $request->input("Tu+$i", 0);
            $VultimoPositivo = $request->input("Vu+$i", 0);
            $tUltimoPositiva = $request->input("Tu+$i", 0);
        }
        // Retornar la vista con los datos procesados
        return view('hcalculo.resultadoLosasAligerdas', compact(
            'fc',
            'fy',
            'num_tramos',
            'luzLibre',
            'cargaMuerta',
            'cargaViva',
            'altura',
            'base',
            'eje',
            'b',
            'Mi',
            'Md',
            'did1',
            'did2',
            'did3',
            'Cv',
            'CM',
            'bp',
            'mu',
            'vu',
            'tu',
            'Vultimonegativo',
            'tUltimoNegativo',
            'mu_',
            'vu_',
            'tu_',
            'VultimoPositivo',
            'tUltimoPositiva'
        ));
    }
}
