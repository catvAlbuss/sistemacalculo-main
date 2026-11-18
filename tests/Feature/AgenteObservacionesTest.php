<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Observaciones del ingeniero con fotos: privadas, validadas y listas para entrenar.
class AgenteObservacionesTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->withoutMiddleware();
        $this->actingAs(User::factory()->create());
    }

    public function test_an_observation_with_photos_is_stored_privately_with_only_the_plan_geometry(): void
    {
        $r = $this->post(route('software.etabs.agente.observaciones.guardar'), [
            'texto' => 'La viga del eje 9 debe ser 30x50',
            'fotos' => [UploadedFile::fake()->image('lamina.jpg', 800, 600)],
            'rasgos' => json_encode(['niveles' => 2, 'luzLosa' => 5.84, 'vista' => 'MÓDULO IX - nombre real']),
        ])->assertOk()->assertJson(['ok' => true, 'fotos' => 1]);
        $indice = json_decode(trim(Storage::disk('local')->get('agente/observaciones.jsonl')), true);
        $this->assertSame(['niveles' => 2, 'luzLosa' => 5.84], $indice['rasgos']);
        $this->assertCount(1, $indice['fotos']);
        $this->assertStringStartsWith('agente/observaciones/', $indice['fotos'][0]);
        Storage::disk('local')->assertExists($indice['fotos'][0]);

        $lista = $this->getJson(route('software.etabs.agente.observaciones.listar'))->assertOk()->json('observaciones');
        $this->assertArrayNotHasKey('usuario', $lista[0]);
        $this->get($lista[0]['fotos'][0])->assertOk();
        $this->get(route('software.etabs.agente.observaciones.foto', ['ruta' => '../../.env']))->assertNotFound();
        $this->assertNotEmpty($r->json('id'));
    }

    public function test_empty_observations_and_non_images_are_rejected(): void
    {
        $this->postJson(route('software.etabs.agente.observaciones.guardar'), ['texto' => ' '])->assertStatus(422);
        $this->post(route('software.etabs.agente.observaciones.guardar'), ['fotos' => [UploadedFile::fake()->create('virus.php', 10)]], ['Accept' => 'application/json'])->assertStatus(422);
    }
}
