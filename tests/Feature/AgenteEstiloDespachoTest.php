<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Estilo de dibujo aprendido de los planos terminados de cada usuario: solo fracciones y capas, y solo los suyos.
class AgenteEstiloDespachoTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->withoutMiddleware();
    }

    private function tipos(): array
    {
        return [
            'cimentacion' => ['vistas' => 1, 'clases' => [
                'muro' => ['fraccion' => 0.12, 'capa' => '.N1 Muros Altos'],
                'columna' => ['fraccion' => 1.7, 'capa' => '<script>0'],
                'texto' => ['fraccion' => 0.5, 'capa' => 'PROYECTO X'],
            ]],
            'portico' => ['vistas' => 1, 'clases' => []],
        ];
    }

    public function test_guarda_por_usuario_limpia_y_reemplaza_el_plano(): void
    {
        $ana = User::factory()->create();
        $this->actingAs($ana)->postJson(route('software.etabs.agente.aprendizaje.estilo.guardar'), ['modulo' => 'm1', 'tipos' => $this->tipos()])
            ->assertOk()->assertJson(['ok' => true, 'planos' => 1]);
        $this->actingAs($ana)->postJson(route('software.etabs.agente.aprendizaje.estilo.guardar'), ['modulo' => 'm1', 'tipos' => $this->tipos()])
            ->assertOk()->assertJson(['planos' => 1]);
        $this->actingAs($ana)->postJson(route('software.etabs.agente.aprendizaje.estilo.guardar'), ['modulo' => 'm2', 'tipos' => $this->tipos()])
            ->assertOk()->assertJson(['planos' => 2]);

        $planos = $this->actingAs($ana)->getJson(route('software.etabs.agente.aprendizaje.estilo.datos'))->assertOk()->json('planos');
        $this->assertCount(2, $planos);
        $cim = $planos[0]['tipos']['cimentacion']['clases'];
        $this->assertSame('.N1 Muros Altos', $cim['muro']['capa']);
        // Fracción acotada a [0, 1], capa sin caracteres raros, clases y plantas desconocidas fuera.
        $this->assertSame(1.0, (float) $cim['columna']['fraccion']);
        $this->assertSame('script0', $cim['columna']['capa']);
        $this->assertArrayNotHasKey('texto', $cim);
        $this->assertArrayNotHasKey('portico', $planos[0]['tipos']);

        // Otro usuario no ve el estilo de Ana.
        $beto = User::factory()->create();
        $this->assertCount(0, $this->actingAs($beto)->getJson(route('software.etabs.agente.aprendizaje.estilo.datos'))->json('planos'));

        $this->actingAs($ana)->deleteJson(route('software.etabs.agente.aprendizaje.estilo.olvidar'))->assertOk();
        $this->assertCount(0, $this->actingAs($ana)->getJson(route('software.etabs.agente.aprendizaje.estilo.datos'))->json('planos'));
    }

    public function test_validacion(): void
    {
        $u = User::factory()->create();
        $this->actingAs($u)->postJson(route('software.etabs.agente.aprendizaje.estilo.guardar'), ['modulo' => '../x', 'tipos' => $this->tipos()])->assertStatus(422);
        $this->actingAs($u)->postJson(route('software.etabs.agente.aprendizaje.estilo.guardar'), ['modulo' => 'm1', 'tipos' => ['portico' => ['clases' => []]]])->assertStatus(422);
    }
}
