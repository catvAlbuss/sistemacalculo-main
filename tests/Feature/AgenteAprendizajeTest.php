<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Las correcciones quedan pendientes y solo las aprobadas se comparten con el agente.
class AgenteAprendizajeTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private function aprobarUltimoSubmission(array $response): void
    {
        $id = $response['evento_id'];
        Storage::disk('local')->append('aprendizaje/eventos.jsonl', json_encode([
            'evento_id' => $id,
            'estado' => 'aprobado',
            'revisado_por' => auth()->id(),
            'fecha' => now()->toIso8601String(),
        ], JSON_UNESCAPED_UNICODE));
    }

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->withoutMiddleware();
        $this->actingAs(User::factory()->create());
    }

    public function test_team_submission_is_pending_and_not_shared_until_reviewed(): void
    {
        $response = $this->postJson(route('software.etabs.agente.aprendizaje.guardar'), [
            'tipo' => 'correccion', 'clave' => 'losa', 'valor' => 'maciza', 'propuesto' => 'aligerada',
            'rasgos' => ['niveles' => 2],
        ]);

        $response->assertOk()
            ->assertJson(['ok' => true, 'estado' => 'pendiente'])
            ->assertJsonStructure(['evento_id']);

        $eventos = $this->getJson(route('software.etabs.agente.aprendizaje.listar'))->assertOk()->json('eventos');
        $this->assertCount(0, $eventos);

        $linea = json_decode(trim(Storage::disk('local')->get('aprendizaje/eventos.jsonl')), true);
        $this->assertSame('pendiente', $linea['estado']);
        $this->assertNotEmpty($linea['evento_id']);
    }

    public function test_technical_engineer_with_direct_permission_can_approve_or_reject_with_audit(): void
    {
        $permission = Permission::findOrCreate('agente.aprendizaje.aprobar', 'web');

        $submit = $this->postJson(route('software.etabs.agente.aprendizaje.guardar'), [
            'tipo' => 'correccion', 'clave' => 'df', 'valor' => 2.4, 'rasgos' => ['niveles' => 1],
        ]);
        $submit->assertOk();
        $id = $submit->json('evento_id');

        $engineer = User::factory()->create();
        $engineer->givePermissionTo($permission);
        $this->actingAs($engineer);

        $this->getJson(route('software.etabs.agente.aprendizaje.pendientes'))
            ->assertOk()->assertJsonCount(1, 'eventos');

        $this->postJson(route('software.etabs.agente.aprendizaje.aprobar', ['id' => $id]))
            ->assertOk()->assertJson(['ok' => true, 'estado' => 'aprobado']);
        $this->assertSame(1, count($this->getJson(route('software.etabs.agente.aprendizaje.listar'))->json('eventos')));

        $this->postJson(route('software.etabs.agente.aprendizaje.rechazar', ['id' => $id]))
            ->assertOk()->assertJson(['ok' => true, 'estado' => 'rechazado']);
        $this->assertSame(0, count($this->getJson(route('software.etabs.agente.aprendizaje.listar'))->json('eventos')));

        $lines = array_filter(preg_split('/\R/', trim(Storage::disk('local')->get('aprendizaje/eventos.jsonl'))));
        $statusEvents = array_values(array_filter(array_map(fn ($line) => json_decode($line, true), $lines)));
        $statusEvents = array_values(array_filter($statusEvents, fn ($e) => ($e['evento_id'] ?? null) === $id && isset($e['estado']) && ! isset($e['clave'])));
        $this->assertSame('rechazado', $statusEvents[array_key_last($statusEvents)]['estado']);
        $this->assertSame($engineer->id, $statusEvents[array_key_last($statusEvents)]['revisado_por']);

    }

    public function test_review_permission_is_required(): void
    {
        Permission::findOrCreate('agente.aprendizaje.aprobar', 'web');
        $this->postJson(route('software.etabs.agente.aprendizaje.guardar'), [
            'tipo' => 'confirmacion', 'clave' => 'df', 'valor' => 2.0, 'rasgos' => [],
        ]);
        $id = json_decode(trim(Storage::disk('local')->get('aprendizaje/eventos.jsonl')), true)['evento_id'];

        $this->postJson(route('software.etabs.agente.aprendizaje.aprobar', ['id' => $id]))
            ->assertStatus(403);
    }

    public function test_legacy_events_remain_approved(): void
    {
        Storage::disk('local')->append('aprendizaje/eventos.jsonl', json_encode([
            'fecha' => now()->toIso8601String(), 'tipo' => 'confirmacion', 'clave' => 'df',
            'valor' => 1.8, 'propuesto' => null, 'motivo' => null, 'rasgos' => ['niveles' => 1],
        ], JSON_UNESCAPED_UNICODE));

        $this->assertCount(1, $this->getJson(route('software.etabs.agente.aprendizaje.listar'))->json('eventos'));
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

    public function test_guided_construction_decisions_are_accepted(): void
    {
        // Las decisiones que pregunta la construcción guiada (losa maciza en baños, malla o
        // bastones) antes daban 422 y la corrección del ingeniero se perdía.
        foreach ([['losaMaciza', true], ['mallaCimentacion', false]] as [$clave, $valor]) {
            $this->postJson(route('software.etabs.agente.aprendizaje.guardar'), [
                'tipo' => 'correccion', 'clave' => $clave, 'valor' => $valor, 'rasgos' => ['niveles' => 1],
            ])->assertOk()->assertJson(['ok' => true]);
        }
    }

    public function test_the_list_is_shared_without_who_made_the_correction(): void
    {
        $response = $this->postJson(route('software.etabs.agente.aprendizaje.guardar'), ['tipo' => 'correccion', 'clave' => 'df', 'valor' => 2.0, 'propuesto' => 2.5, 'rasgos' => ['niveles' => 1]])->assertOk()->json();
        $this->aprobarUltimoSubmission($response);
        $eventos = $this->getJson(route('software.etabs.agente.aprendizaje.listar'))->assertOk()->json('eventos');
        $this->assertCount(1, $eventos);
        $this->assertArrayNotHasKey('usuario', $eventos[0]);
        $this->assertEquals(2.0, $eventos[0]['valor']);
    }

    public function test_a_metrado_correction_keeps_the_row_and_field_and_needs_a_number(): void
    {
        $ruta = route('software.etabs.agente.aprendizaje.guardar');
        $response = $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'metrado', 'valor' => 3.78, 'propuesto' => 3.66,
            'partida' => '02.03.08.01', 'fila' => 'Eje Z´ C-pb (0.22x0.13)', 'campo' => 'alto', 'rasgos' => ['largo' => 3.73, 'columnas' => 4]])->assertOk()->json();
        $this->aprobarUltimoSubmission($response);
        $e = $this->getJson(route('software.etabs.agente.aprendizaje.listar'))->json('eventos.0');
        $this->assertSame(['02.03.08.01', 'Eje Z´ C-pb (0.22x0.13)', 'alto'], [$e['partida'], $e['fila'], $e['campo']]);
        $this->assertEquals(3.78, $e['valor']);

        // Sin fila o campo, con un campo que no es una medida o con un valor que no es número: no.
        $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'metrado', 'valor' => 1, 'partida' => '02.03.08.01', 'campo' => 'alto', 'rasgos' => []])->assertStatus(422);
        $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'metrado', 'valor' => 1, 'partida' => '02.03.08.01', 'fila' => 'x', 'campo' => 'descripcion', 'rasgos' => []])->assertStatus(422);
        $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'metrado', 'valor' => 'mucho', 'partida' => '02.03.08.01', 'fila' => 'x', 'campo' => 'alto', 'rasgos' => []])->assertStatus(422);
    }

    public function test_the_office_name_of_an_element_is_learned_as_a_template(): void
    {
        $ruta = route('software.etabs.agente.aprendizaje.guardar');
        $response = $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'termino', 'termino' => 'cimientoEje', 'valor' => 'Cimiento eje {eje}', 'propuesto' => 'Eje Y´', 'rasgos' => []])->assertOk()->json();
        $this->aprobarUltimoSubmission($response);
        $e = $this->getJson(route('software.etabs.agente.aprendizaje.listar'))->json('eventos.0');
        $this->assertSame(['termino', 'cimientoEje', 'Cimiento eje {eje}'], [$e['clave'], $e['termino'], $e['valor']]);
        // Un tipo de elemento que no existe o un nombre vacío: no.
        $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'termino', 'termino' => 'proyecto', 'valor' => 'x', 'rasgos' => []])->assertStatus(422);
        $this->postJson($ruta, ['tipo' => 'correccion', 'clave' => 'termino', 'termino' => 'platea', 'valor' => '  ', 'rasgos' => []])->assertStatus(422);
    }
}
