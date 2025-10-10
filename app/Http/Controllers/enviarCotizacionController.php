<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\FormularioEnviado;

class enviarCotizacionController extends Controller
{
    public function enviarCotizacion(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'celular' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'archivo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240', // máximo 10MB
        ]);
//'archivo' => 'required|file|mimes:pdf|image|max:10240', // máximo 10MB
        $archivoPath = $request->file('archivo')->store('archivos_formulario');

        $datos = $request->only(['nombre', 'celular', 'email']);
        $datos['archivo_path'] = $archivoPath;

        Mail::to('admon.construyehco@gmail.com')
            ->send(new FormularioEnviado($datos));

        return back()->with('success', 'Formulario enviado con éxito.');
    }
}