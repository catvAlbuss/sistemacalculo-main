<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ZapatacombinadaController extends Controller
{
    public function zapataCombinada(Request $request)
    {
        //Distancia entre ejes de columnas
        $des = $request->input('des', 0);
        $qa = $request->input('qa', 0);
        $p_servicio = $request->input('p_servicio', 0);
        $fk = $request->input('fk', 0);
        //Dimensiones de la columna 1
        $t1_col1 = $request->input('t1_col1', 0);
        $t2_col1 = $request->input('t2_col1', 0);

        //Dimensiones de la columna 2
        $t1_col2 = $request->input('t1_col2', 0);
        $t2_col2 = $request->input('t2_col2', 0);


        $fc = $request->input('fc', 0);
        $fy = $request->input('fy', 0);
        $df = $request->input('df', 0);
        $sc = $request->input('sc', 0);
        $ym = $request->input('ym', 0);
        $hc = $request->input('hc', 0);
        $ot = $request->input('ot', 0);
        $hz = $request->input('hz', 0);
        $m1 = $request->input('m1', 0);
        $m2 = $request->input('m2', 0);
        $r = $request->input('r', 0);
        $rec = $request->input('rec', 0);
        $Le = $request->input('Le', 0);

        //Cargas Columna 1
        $dataCargaCol1 = $request->input('dataCargacol1', 0);
        // Decodificar los datos JSON en un array de PHP
        $dataCol1 = json_decode($dataCargaCol1, true);

        //Cargas Columna 1
        $dataCargaCol2 = $request->input('dataCargacol2', 0);
        // Decodificar los datos JSON en un array de PHP
        $dataCol2 = json_decode($dataCargaCol2, true);

        //Verificacion por cortante
        $preciones_Columna1 = $request->input('selectColumna1', 0);
        $preciones_Columna2 = $request->input('selectColumna2', 0);

        $fi_general = $request->input('fi_general', 0);
        // col1
        $d_col1 = $request->input('d_col1', 0);
        $lv_col1 = $request->input('lv_col1', 0);
        $pmin_col1 = $request->input('pmin_col1', 0);
        $VarillaX_Col1 = $request->input('VarillaX_Col1', 0);

        // col2
        $d_col2 = $request->input('d_col2', 0);
        $lv_col2 = $request->input('lv_col2', 0);
        $pmin_col2 = $request->input('pmin_col2', 0);
        $VarillaX_Col2 = $request->input('VarillaX_Col2', 0);

        $ovcp = $request->input('ovcp', 0);
        //col1
        $r_vc_col1 = $request->input('r_vc_col1', 0);
        $VarillaVC_Col1 = $request->input('VarillaVC_Col1', 0);

        $dvc_col1 = $request->input('dvc_col1', 0);
        $fa_Col1 = $request->input('fa_Col1', 0);


        //col 2
        $r_vc_col2 = $request->input('r_vc_col2', 0);
        $VarillaVC_Col2 = $request->input('VarillaVC_Col2', 0);

        $dvc_col2 = $request->input('dvc_col2', 0);
        $fa_Col2 = $request->input('fa_Col2', 0);


        //OBTENER LAS PRECIONES

        $selectVFColumna1 = $request->input('selectVFColumna1', 0);
        $selectVFColumna2 = $request->input('selectVFColumna2', 0);


        return view('hcalculo.resultadoZapataCombinada', compact(
            'des',
            'qa',
            'p_servicio',
            'fk',
            't1_col1',
            't2_col1',
            't1_col2',
            't2_col2',
            'fy',
            'fc',
            'df',
            'sc',
            'ym',
            'hc',
            'ot',
            'hz',
            'm1',
            'm2',
            'r',
            'rec',
            'Le',
            'dataCol1',
            'dataCol2',
            'preciones_Columna1',
            'preciones_Columna2',
            'fi_general',
            'd_col1',
            'lv_col1',
            'pmin_col1',
            'VarillaX_Col1',
            'd_col2',
            'lv_col2',
            'pmin_col2',
            'VarillaX_Col2',
            'ovcp',
            'r_vc_col1',
            'VarillaVC_Col1',
            'dvc_col1',
            'fa_Col1',
            'r_vc_col2',
            'VarillaVC_Col2',
            'dvc_col2',
            'fa_Col2',
            'selectVFColumna1',
            'selectVFColumna2',
        ));
    }
}
