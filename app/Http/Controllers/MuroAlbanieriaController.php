<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MuroAlbanieriaController extends Controller
{
    public function muroAlbanieria(Request $request)
    {
        $desc = $request->input('desc', 0);
        $ubi = $request->input('ubi', 0);
        $fm = $request->input('fm', 0);
        $l = $request->input('l', 0);
        $t = $request->input('t', 0);
        $h = $request->input('h', 0);

        /* 2 values */
        $pm_e = $request->input('pm', 0);
        $pm = $request->input('pm', 0);
        $pg = $request->input('pg', 0);
        $ve = $request->input('ve', 0);
        $me = $request->input('me', 0);


        /* 4 values */
        $vdm = $request->input('vdm', 0);

        /* 6 values */
        $nh = $_POST["nh"] . " hiladas";
        $db = $_POST["db"] . " mm";

        /* 7 result */
        $nc = $request->input('nc', 0);
        $fdc = $request->input('fdc', 0);
        $pt1_e = $request->input('pt1', 0);
        $pt1 = $request->input('pt1', 0);
        $pt2 = $request->input('pt2', 0);
        $lm = $l/*$request->input('lm"]) */;

        /* 7.2 params */
        $pce = $request->input('pce', 0);
        $pci = $request->input('pci', 0);
        $dce = $request->input('dce', 0);
        $dci = $request->input('dci', 0);

        $pcex = $request->input('pcex', 0);
        $pcin = $request->input('pcin', 0);

        /* 8 value */
        // $diameter_e = $request->input('dmtr', 0);
        $diameter = $request->input('dmtr', 0);

        return view('hcalculo.resultadoMalbanieria', compact(
            'desc',
            'ubi',
            'fm',
            'l',
            't',
            'h',
            'pm_e',
            'pm',
            'pg',
            've',
            'me',
            'vdm',
            'nh',
            'db',
            'nc',
            'fdc',
            'pt1_e',
            'pt1',
            'pt2',
            'lm',
            'pce',
            'pci',
            'dce',
            'dci',
            'pcex',
            'pcin',
            'diameter',
        ));
    }
}
