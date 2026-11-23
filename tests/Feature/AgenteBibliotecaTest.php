<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// La biblioteca del despacho se publica anónima y solo la descargan los roles autorizados.
class AgenteBibliotecaTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        // Las rutas del agente viven tras auth + suscripción; aquí se prueba el control del propio
        // controlador (sesión, rol y lista blanca), que no depende de esos middlewares.
        $this->withoutMiddleware();
        config([
            'agente.biblioteca_activa' => true,
            'agente.biblioteca_roles' => ['root', 'gerencia', 'asistente'],
        ]);
    }

    private function privada(string $grupo, string $tipo, int $n, array $pieza): void
    {
        Storage::disk('local')->put("entrenamiento/biblioteca/{$tipo}/{$grupo}-modulo-01-{$n}.json", json_encode($pieza));
    }

    private function pieza(string $proyecto, string $titulo, array $extra = []): array
    {
        return array_merge([
            'esquema' => 'BIBLIOTECA-DETALLES', 'proyecto' => $proyecto, 'modulo' => 'modulo-01', 'huella' => 'abc123',
            'tipo' => 'portico', 'titulo' => $titulo, 'escala' => 50, 'escalaLamina' => 50,
            'caja' => ['x0' => 0, 'y0' => 0, 'x1' => 10, 'y1' => 5],
            'niveles' => [['sigla' => 'NPN', 'cota' => 0, 'y' => -0.02249]],
            'parametros' => ['ejes' => [['nombre' => 'A', 'x' => 0], ['nombre' => 'B', 'x' => 5.12345]]],
            'entidades' => [
                ['tipo' => 'linea', 'capa' => 'CONCRETO', 'puntos' => [['x' => 0.00049, 'y' => 1.23456], ['x' => 5.0001, 'y' => 1.2344]]],
                ['tipo' => 'linea', 'capa' => 'CONCRETO', 'puntos' => [['x' => 5.0001, 'y' => 1.2344], ['x' => 0.0001, 'y' => 1.2346]]],
                ['tipo' => 'linea', 'capa' => 'CONCRETO', 'puntos' => [['x' => 1, 'y' => 1], ['x' => 1, 'y' => 1]]],
                ['tipo' => 'texto', 'capa' => '.D1 Texto', 'centro' => ['x' => 1, 'y' => 2], 'alto' => 0.1, 'texto' => 'PROYECTO VINCHOS'],
                ['tipo' => 'texto', 'capa' => '.D1 Texto', 'centro' => ['x' => 1, 'y' => 3], 'alto' => 0.1, 'texto' => 'EJE A'],
            ],
            'textos' => [$titulo, 'EJE A', 'EJE A', 'Vinchos módulo 1'],
            'capas' => ['CONCRETO', '.D1 Texto'],
            'textosDescartados' => ['VINCHOS - CLIENTE'],
        ], $extra);
    }

    private function publicar(): void
    {
        $this->privada('vinchos', 'portico', 1, $this->pieza('p-3246c2', 'PORTICO EJE 1-1 VINCHOS'));
        $this->privada('ilo', 'portico', 2, $this->pieza('p-ef4985', 'PORTICO EJE 2-2'));
        Storage::disk('local')->put('entrenamiento/biblioteca/indice.json', json_encode(['proyectos' => ['p-3246c2' => [], 'p-ef4985' => []]]));
        $this->artisan('agente:publicar-biblioteca', ['--tipo' => ['portico']])->assertSuccessful();
    }

    private function usuario(?string $rol): User
    {
        $user = User::factory()->create();
        if ($rol) {
            $user->assignRole(Role::findOrCreate($rol, 'web'));
        }

        return $user;
    }

    public function test_sin_sesion_responde_401(): void
    {
        $this->publicar();
        $this->getJson(route('software.etabs.agente.biblioteca', 'portico'))->assertStatus(401);
    }

    public function test_sin_rol_responde_403(): void
    {
        $this->publicar();
        $this->actingAs($this->usuario(null))
            ->getJson(route('software.etabs.agente.biblioteca', 'portico'))->assertStatus(403);
        $this->actingAs($this->usuario('cliente'))
            ->getJson(route('software.etabs.agente.biblioteca', 'portico'))->assertStatus(403);
    }

    public function test_con_rol_responde_200_anonima_y_liviana(): void
    {
        $this->publicar();
        $r = $this->actingAs($this->usuario('asistente'))
            ->getJson(route('software.etabs.agente.biblioteca', 'portico'))->assertOk();

        $this->assertNotEmpty($r->headers->get('ETag'));
        $contenido = $r->streamedContent();
        foreach (['vinchos', 'ilo', 'p-3246c2', 'p-ef4985', 'proyecto', 'huella', 'modulo-01', 'textosDescartados', 'escalaLamina', 'caja'] as $prohibido) {
            $this->assertDoesNotMatchRegularExpression('/\b'.preg_quote($prohibido, '/').'\b/i', $contenido, "La respuesta contiene {$prohibido}");
        }

        $j = json_decode($contenido, true);
        $this->assertSame('portico', $j['tipo']);
        $this->assertCount(2, $j['piezas']);
        $this->assertSame(['portico-001', 'portico-002'], array_column($j['piezas'], 'id'));
        $p = $j['piezas'][0];
        // Línea repetida (al revés) y degenerada fuera; texto con el grupo fuera; mm.
        $this->assertCount(2, $p['entidades']);
        $this->assertSame(['x' => 0, 'y' => 1.235], $p['entidades'][0]['puntos'][0]);
        $this->assertSame(5.123, $p['parametros']['ejes'][1]['x']);
        $this->assertSame(-0.022, $p['niveles'][0]['y']);
        $this->assertSame(['EJE A'], array_values(array_diff($p['textos'], [$p['titulo']])));

        // ETag: el mismo pedido con If-None-Match responde 304.
        $this->getJson(route('software.etabs.agente.biblioteca', 'portico'), ['If-None-Match' => $r->headers->get('ETag')])
            ->assertStatus(304);
    }

    public function test_con_gzip_sirve_el_comprimido(): void
    {
        $this->publicar();
        $r = $this->actingAs($this->usuario('root'))
            ->get(route('software.etabs.agente.biblioteca', 'portico'), ['Accept-Encoding' => 'gzip, deflate']);
        $r->assertOk()->assertHeader('Content-Encoding', 'gzip');
        $this->assertSame('portico', json_decode(gzdecode($r->streamedContent()), true)['tipo']);
    }

    public function test_tipo_invalido_o_no_publicado_responde_404(): void
    {
        $this->publicar();
        $this->actingAs($this->usuario('gerencia'));
        $this->getJson(route('software.etabs.agente.biblioteca', 'no_existe'))->assertStatus(404);
        $this->getJson(route('software.etabs.agente.biblioteca', 'escalera'))->assertStatus(404);
        $this->getJson('/software/etabs/agente/biblioteca/..%2F..%2F.env')->assertStatus(404);
    }

    public function test_asterisco_abre_a_todos_y_estado_expone_el_flag(): void
    {
        $this->publicar();
        $sinRol = $this->usuario(null);
        $this->actingAs($sinRol)->getJson(route('software.etabs.agente.llm.estado'))->assertJson(['biblioteca' => false]);

        config(['agente.biblioteca_roles' => ['*']]);
        $this->getJson(route('software.etabs.agente.biblioteca', 'portico'))->assertOk();
        $this->getJson(route('software.etabs.agente.llm.estado'))->assertJson(['biblioteca' => true]);

        config(['agente.biblioteca_activa' => false]);
        $this->getJson(route('software.etabs.agente.llm.estado'))->assertJson(['biblioteca' => false]);
    }
}
