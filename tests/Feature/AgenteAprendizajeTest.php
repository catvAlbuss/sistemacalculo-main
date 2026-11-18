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

    public function test_a_metrado_correction_keeps_the_row_and_field_and_needs_a_number(): void
    {
        $ruta = route('software.etabs.agente.aprendizaje.guardar');
        $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'metrado', 'valor' => 3.78, 'propuesto' => 3.66,
            'partida' => '02.03.08.01', 'fila' => 'Eje Z´ C-pb (0.22x0.13)', 'campo' => 'alto', 'rasgos' => ['largo' => 3.73, 'columnas' => 4]])->assertOk();
        $e = $this->getJson(route('software.etabs.agente.aprendizaje.listar'))->json('eventos.0');
        $this->assertSame(['02.03.08.01', 'Eje Z´ C-pb (0.22x0.13)', 'alto'], [$e['partida'], $e['fila'], $e['campo']]);
        $this->assertEquals(3.78, $e['valor']);

        // Sin fila o campo, con un campo que no es una medida o con un valor que no es número: no.
        $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'metrado', 'valor' => 1, 'partida' => '02.03.08.01', 'campo' => 'alto', 'rasgos' => []])->assertStatus(422);
        $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'metrado', 'valor' => 1, 'partida' => '02.03.08.01', 'fila' => 'x', 'campo' => 'descripcion', 'rasgos' => []])->assertStatus(422);
        $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'metrado', 'valor' => 'mucho', 'partida' => '02.03.08.01', 'fila' => 'x', 'campo' => 'alto', 'rasgos' => []])->assertStatus(422);
    }
}
