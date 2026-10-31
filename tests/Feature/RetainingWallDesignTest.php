<?php
namespace Tests\Feature;
use App\Models\User;
use Illuminate\Support\Facades\Vite;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;
class RetainingWallDesignTest extends TestCase
{
 use RefreshPaymentsDatabase;
 public function test_wall_has_single_stage_scope_and_retains_calculation_export_targets(): void
 {
  Vite::useHotFile(storage_path('framework/testing/wall-no-hot'));
  Role::findOrCreate('root','web');$user=User::factory()->create();$user->assignRole('root');
  $response=$this->actingAs($user)->get(route('calculadora.asistente.muros-de-contencionv2'))->assertOk();
  $html=$response->getContent();
  $response->assertSee('retaining-wall-sheet')->assertSee('wall-workflow')->assertSee('aria-label="Etapas del',false)->assertDontSee('resetSystem()')->assertDontSee('Sistema de Muros de');
  $this->assertSame(1,substr_count($html,'x-data="predimensionamiento"'));
  $this->assertSame(1,substr_count($html,'x-data="mainSystem"'));
  $this->assertStringNotContainsString('x-init="init()"',$html);
  foreach(['calculate-button','predimsMC','concretoArmado-content','grafico-verificaciones'] as $id) $this->assertSame(1,substr_count($html,'id="'.$id.'"'));
  $this->assertSame(1,substr_count($html,'https://html2canvas.hertzen.com/dist/'));
 }
}
