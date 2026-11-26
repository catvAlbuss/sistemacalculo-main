<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// Las correcciones de un cliente pasan a la base del despacho solo con --confirmar, una sola vez.
class IncorporarCorreccionesAgenteTest extends TestCase
{
    public function test_incorpora_una_vez_y_solo_con_confirmacion(): void
    {
        Storage::fake('local');
        $muestra = ['rasgos' => ['largo' => 3], 'regla' => true, 'etiqueta' => false, 'largo' => 3];
        Storage::disk('local')->put('agente/dibujo/base-muro-cimentacion.json', json_encode(['muestras' => [$muestra]]));
        Storage::disk('local')->put('agente/dibujo/usuarios/7/muro-cimentacion.json', json_encode(['modulos' => [
            'm1' => ['fecha' => '2026-11-26T10:00:00Z', 'muestras' => [$muestra, $muestra]],
        ]]));

        $this->artisan('agente:incorporar-correcciones', ['--usuario' => [7]])->assertSuccessful();
        $this->assertCount(1, json_decode(Storage::disk('local')->get('agente/dibujo/base-muro-cimentacion.json'), true)['muestras'], 'sin --confirmar no cambia');

        $this->artisan('agente:incorporar-correcciones', ['--usuario' => [7], '--confirmar' => true])->assertSuccessful();
        $this->assertCount(3, json_decode(Storage::disk('local')->get('agente/dibujo/base-muro-cimentacion.json'), true)['muestras']);

        // Otra vez: ya incorporado, no se duplica.
        $this->artisan('agente:incorporar-correcciones', ['--todos' => true, '--confirmar' => true])->assertSuccessful();
        $this->assertCount(3, json_decode(Storage::disk('local')->get('agente/dibujo/base-muro-cimentacion.json'), true)['muestras']);
    }
}
