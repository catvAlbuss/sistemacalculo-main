<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Aprendizaje del dibujo con el cliente: cada usuario guarda sus correcciones y solo ve las suyas.
class AgenteAprendizajeDibujoTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->withoutMiddleware();
    }

    private function muestra(bool $etiqueta, bool $regla = true): array
    {
        return ['rasgos' => ['largo' => 3.2, 'dBorde' => 0.05, 'platea' => 1, 'nombre' => 'PROYECTO X'], 'regla' => $regla, 'etiqueta' => $etiqueta, 'largo' => 3.2];
    }

    public function test_guarda_solo_numeros_por_usuario_y_reemplaza_el_modulo(): void
    {
        $ana = User::factory()->create();
        $this->actingAs($ana)->postJson(route('software.etabs.agente.aprendizaje.dibujo.guardar'), [
            'decision' => 'muro-cimentacion', 'modulo' => 'a1b2c3', 'muestras' => [$this->muestra(true), $this->muestra(false)],
        ])->assertOk()->assertJson(['ok' => true, 'modulos' => 1, 'muestras' => 2]);
        // La misma lámina corregida otra vez reemplaza a la anterior.
        $this->actingAs($ana)->postJson(route('software.etabs.agente.aprendizaje.dibujo.guardar'), [
            'decision' => 'muro-cimentacion', 'modulo' => 'a1b2c3', 'muestras' => [$this->muestra(false)],
        ])->assertOk()->assertJson(['modulos' => 1]);

        $datos = $this->actingAs($ana)->getJson(route('software.etabs.agente.aprendizaje.dibujo.datos', ['decision' => 'muro-cimentacion']))->assertOk()->json();
        $this->assertCount(1, $datos['cliente']);
        $this->assertSame('a1b2c3', $datos['cliente'][0]['modulo']);
        $this->assertArrayNotHasKey('nombre', $datos['cliente'][0]['rasgos'], 'solo rasgos numéricos conocidos');
        $this->assertSame(0.0, (float) $datos['cliente'][0]['rasgos']['dEje']);

        // Otro usuario no ve las correcciones de Ana.
        $beto = User::factory()->create();
        $this->assertCount(0, $this->actingAs($beto)->getJson(route('software.etabs.agente.aprendizaje.dibujo.datos', ['decision' => 'muro-cimentacion']))->json('cliente'));

        // Olvidar: vuelve a la regla.
        $this->actingAs($ana)->deleteJson(route('software.etabs.agente.aprendizaje.dibujo.olvidar', ['decision' => 'muro-cimentacion']))->assertOk();
        $this->assertCount(0, $this->actingAs($ana)->getJson(route('software.etabs.agente.aprendizaje.dibujo.datos', ['decision' => 'muro-cimentacion']))->json('cliente'));
    }

    public function test_base_del_despacho_y_validacion(): void
    {
        Storage::disk('local')->put('agente/dibujo/base-muro-cimentacion.json', json_encode(['muestras' => [$this->muestra(true)]]));
        $u = User::factory()->create();
        $this->assertCount(1, $this->actingAs($u)->getJson(route('software.etabs.agente.aprendizaje.dibujo.datos', ['decision' => 'muro-cimentacion']))->json('base'));
        $this->actingAs($u)->postJson(route('software.etabs.agente.aprendizaje.dibujo.guardar'), ['decision' => 'otra', 'modulo' => 'x', 'muestras' => [$this->muestra(true)]])->assertStatus(422);
        $this->actingAs($u)->postJson(route('software.etabs.agente.aprendizaje.dibujo.guardar'), ['decision' => 'muro-cimentacion', 'modulo' => '../x', 'muestras' => [$this->muestra(true)]])->assertStatus(422);
    }
}
