<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// El agente aprende de cada corrección del ingeniero: se guarda solo la geometría del plano y
// la decisión corregida, nunca datos personales; y se comparte con todo el despacho.
class AgenteAprendizajeTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->withoutMiddleware();
        $this->actingAs(User::factory()->create());
    }

    public function test_a_correction_is_stored_with_only_the_plan_geometry(): void
    {
        $this->postJson(route('software.etabs.agente.aprendizaje.guardar'), [
            'tipo' => 'correccion', 'clave' => 'losa', 'valor' => 'maciza', 'propuesto' => 'aligerada',
            'motivo' => 'baño con losa maciza',
            'rasgos' => ['niveles' => 2, 'luzLosa' => 5.84, 'columnas' => 6, 'proyecto' => 'I.E. Nombre Real', 'cip' => '123456'],
        ])->assertOk()->assertJson(['ok' => true]);

        $linea = json_decode(trim(Storage::disk('local')->get('aprendizaje/eventos.jsonl')), true);
        $this->assertSame('losa', $linea['clave']);
        $this->assertSame('maciza', $linea['valor']);
        $this->assertSame(['niveles' => 2, 'luzLosa' => 5.84, 'columnas' => 6], $linea['rasgos']);
    }

    public function test_unknown_decisions_and_long_values_are_rejected(): void
    {
        $this->postJson(route('software.etabs.agente.aprendizaje.guardar'), ['tipo' => 'correccion', 'clave' => 'proyecto', 'valor' => 'x', 'rasgos' => ['niveles' => 1]])->assertStatus(422);
        $this->postJson(route('software.etabs.agente.aprendizaje.guardar'), ['tipo' => 'correccion', 'clave' => 'losa', 'valor' => str_repeat('a', 80), 'rasgos' => ['niveles' => 1]])->assertStatus(422);
        $this->assertFalse(Storage::disk('local')->exists('aprendizaje/eventos.jsonl'));
    }

    public function test_the_list_is_shared_without_who_made_the_correction(): void
    {
        $this->postJson(route('software.etabs.agente.aprendizaje.guardar'), ['tipo' => 'correccion', 'clave' => 'df', 'valor' => 2.0, 'propuesto' => 2.5, 'rasgos' => ['niveles' => 1]])->assertOk();
        $eventos = $this->getJson(route('software.etabs.agente.aprendizaje.listar'))->assertOk()->json('eventos');
        $this->assertCount(1, $eventos);
        $this->assertArrayNotHasKey('usuario', $eventos[0]);
        $this->assertEquals(2.0, $eventos[0]['valor']);
    }
}
