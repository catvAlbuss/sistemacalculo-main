<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ValidateLegacyCalculation
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->route()?->getControllerClass() !== \App\Http\Controllers\OctavePlotController::class) { return $next($request); }
        $fields=match($request->route()->getActionMethod()) {
            'graficarFC','graficarAligerados'=>['fc','Fy','b','h','Lt','WD','WV','anchoTributario','frm','frv'],
            'graficarZapatas'=>['A','Ixx','Iyy','Df','PS','MXS','MYS','Pm','MXm','MYm','Pv','MXv','MYv','poligonos'],
            'graficarZapatas2'=>['poligonos','column','PD','PL','SISMO','Co','dF','pesoEspecifico'],
            'calcularFuerzasArmaduras','calcularFuerzasArmaduras3d'=>['nodos','barras','cargas','restringidos','propiedades'],
            'calcularSuelos'=>['q','df','B','L'],
            default=>[],
        };
        foreach($fields as $field){
            $value=$request->input($field);
            if(!is_string($value)&&!is_numeric($value)){ $this->reject($field); }
            $value=trim((string)$value);
            if(strlen($value)>2000000 || $value===''){ $this->reject($field); }
            if($field==='poligonos' && str_starts_with($value,'struct(')) {
                $pair="'[A-Za-z][A-Za-z0-9_]{0,100}'\\s*,\\s*\\[[0-9eE+.,;\\s\\[\\]\\-]*\\]";
                if(!preg_match('/\Astruct\(\s*(?:'.$pair.'(?:\s*,\s*'.$pair.')*)?\s*\)\z/D',$value)){ $this->reject($field); }
            } elseif($field==='Co') {
                $numeric=preg_replace('/\b(?:pm|pv|ps|mxm|mym|mxv|myv|mxs|mys)\b/i','0',$value);
                if(!preg_match('/\A[0-9eE+.,;*\/()\s\[\]\-]+\z/D',$numeric)){ $this->reject($field); }
            } elseif(!preg_match('/\A[0-9eE+.,;\s\[\]\-]+\z/D',$value)) { $this->reject($field); }
        }
        return $next($request);
    }

    private function reject(string $field): never
    {
        throw ValidationException::withMessages([$field=>'El campo debe contener datos numéricos o una matriz válida, sin instrucciones ejecutables.']);
    }
}
