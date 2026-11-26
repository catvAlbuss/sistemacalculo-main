<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Tablero de progreso del agente: muestra las métricas y registra la nota del ingeniero.
class AgenteProgresoTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private function gerente(): User
    {
        $u = User::factory()->create();
        $u->assignRole(Role::findOrCreate('gerencia'));

        return $u;
    }

    public function test_muestra_metricas_y_guarda_la_nota_del_ingeniero(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('agente/progreso.json', json_encode([
            'fecha' => '2026-11-26T20:00:00Z', 'aviso' => 'Métricas internas.',
            'novacad' => ['promedio' => 71, 'indicadores' => [['nombre' => 'Dibujo estructural', 'valor' => 67, 'mide' => 'superposición', 'fuente' => 'evaluar-dibujo.mjs']], 'evolucion' => [['fecha' => '2026-11-19', 'dibujo' => 60, 'porElemento' => 40]]],
            'analisis' => ['promedio' => 86, 'indicadores' => [['nombre' => 'Motor igual a ETABS', 'valor' => 100, 'mide' => 'CSI', 'fuente' => 'pytest']]],
        ]));
        $g = $this->gerente();
        $this->actingAs($g)->get(route('software.etabs.agente.progreso'))->assertOk()
            ->assertSee('Dibujo estructural')->assertSee('Motor igual a ETABS')->assertSee('sin registrar');

        $this->actingAs($g)->post(route('software.etabs.agente.progreso.nota'), ['modulo' => 'novacad', 'nota' => 10, 'comentario' => 'falta detalle'])
            ->assertRedirect(route('software.etabs.agente.progreso'));
        $this->actingAs($g)->get(route('software.etabs.agente.progreso'))->assertSee('10 %')->assertSee('falta detalle');
        $this->actingAs($g)->post(route('software.etabs.agente.progreso.nota'), ['modulo' => 'novacad', 'nota' => 140])->assertSessionHasErrors('nota');
    }

    public function test_sin_rol_no_entra(): void
    {
        Storage::fake('local');
        // Sin rol: el grupo software redirige (302) o el rol lo prohíbe (403); nunca ve el tablero.
        $r = $this->actingAs(User::factory()->create())->get(route('software.etabs.agente.progreso'));
        $this->assertContains($r->status(), [302, 403]);
        $r->assertDontSee('Registrar la nota del ingeniero');
    }
}
