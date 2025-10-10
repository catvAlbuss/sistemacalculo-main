<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ColumnaController extends Controller
{
    public function columna(Request $request)
    {
        $pisos = $request->input('piso', 0);
        $fc = $request->input('fc', 0);
        $fy = $request->input('fy', 0);
        $H = $request->input('altura', 0);
        $L1 = $request->input('L1', 0);
        $L2 = $request->input('L2', 0);
        $d = $request->input('d', 0);
        $CDEZ = $request->input('CDEsbelZ', 0);
        $SEstru = $request->input('SEstru', 0);
        $Tgrapas = $request->input('Tgrapas', 0);
        $AAceroTotal = $request->input('AAceroTotal', 0);
        $AEstribos = $request->input('AEstribos', 0);
        $AaceromaxLong = $request->input('AmaxLong', 0);
        $puinf = $request->input('puinf', 0);
        $pusup = $request->input('pusup', 0);
        $Mninf = $request->input('Mnsup', 0);
        $Mnsup = $request->input('fy', 0);
        $VudEtap = $request->input('VudEtaps', 0);

        $dataFromHandsontable = json_decode($request->input("dataFromHandsontable"), true);
        $dataFromHandsontables = array();
        $dataFromHandsontableLAX = json_decode($request->input("dataFromHandsontableLAX"), true);
        $dataFromHandsontablesLAX = array();
        $dataFromHandsontableLAY = json_decode($request->input("dataFromHandsontableLAY"), true);
        $dataFromHandsontablesLAY = array();

        $indiceQX = array();
        $LArx = array();
        $LAry = array();
        $tipoEstructuraX = array();
        $indiceQY = array();
        $tipoEstructuraY = array();
        $hx = array();
        $p = array();
        $vx = array();
        $vy = array();
        $topmx = array();
        $buttonmx = array();
        $topmy = array();
        $buttonmy = array();

        for ($i = count($dataFromHandsontableLAX) - 2; $i >= 0; $i--) {
            $indiceQX[] = $dataFromHandsontableLAX[$i][7];
        }
        //Longitud Arriostrada XX
        for ($i = count($dataFromHandsontableLAX) - 2; $i >= 0; $i--) {
            $LArx[] = $dataFromHandsontableLAX[$i][3];
        }

        for ($i = count($dataFromHandsontableLAX) - 2; $i >= 0; $i--) {
            $tipoEstructuraX[] = $dataFromHandsontableLAX[$i][9];
        }
        for ($i = count($dataFromHandsontableLAY) - 1; $i >= 0; $i--) {
            $indiceQY[] = $dataFromHandsontableLAY[$i][7];
        }
        // Longitud Arriostrada YY
        for ($i = count($dataFromHandsontableLAY) - 1; $i >= 0; $i--) {
            $LAry[] = $dataFromHandsontableLAY[$i][3];
        }
        //==============================================================
        for ($i = count($dataFromHandsontableLAY) - 1; $i >= 0; $i--) {
            // echo $i;
            $tipoEstructuraY[] = $dataFromHandsontableLAY[$i][9];
        }
        for ($i = count($dataFromHandsontableLAX) - 2; $i >= 0; $i--) {
            $hx[] = $dataFromHandsontableLAX[$i][1];
        }
        for ($i = 0; $i < count($dataFromHandsontable); $i++) {
            $p[] = $dataFromHandsontable[$i][2];
        }
        for ($i = 0; $i < count($dataFromHandsontable); $i++) {
            $vx[] = $dataFromHandsontable[$i][3];
        }
        for ($i = 0; $i < count($dataFromHandsontable); $i++) {
            $vy[] = $dataFromHandsontable[$i][4];
        }
        for ($i = 0; $i < count($dataFromHandsontable); $i++) {
            $topmx[] = $dataFromHandsontable[$i][5];
        }
        for ($i = 0; $i < count($dataFromHandsontable); $i++) {
            $buttonmx[] = $dataFromHandsontable[$i][6];
        }
        for ($i = 0; $i < count($dataFromHandsontable); $i++) {
            $topmy[] = $dataFromHandsontable[$i][7];
        }
        for ($i = 0; $i < count($dataFromHandsontable); $i++) {
            $buttonmy[] = $dataFromHandsontable[$i][8];
        }

        return view('hcalculo.resultadoColumna', compact(
            'pisos',
            'fc',
            'fy',
            'H',
            'L1',
            'L2',
            'd',
            'CDEZ',
            'SEstru',
            'Tgrapas',
            'AAceroTotal',
            'AEstribos',
            'AaceromaxLong',
            'puinf',
            'pusup',
            'Mninf',
            'Mnsup',
            'VudEtap',
            'indiceQX',
            'LArx',
            'LAry',
            'tipoEstructuraX',
            'indiceQY',
            'tipoEstructuraY',
            'hx',
            'p',
            'vx',
            'vy',
            'topmx',
            'buttonmx',
            'topmy',
            'buttonmy',
        ));
    }
}
