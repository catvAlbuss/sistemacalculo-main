<?php
namespace Tests\Feature;
use App\Models\User;
use Illuminate\Support\Facades\Vite;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;
class Predim2IsolationTest extends TestCase
{
 use RefreshPaymentsDatabase;
 public function test_cad_view_does_not_load_the_legacy_foundation_engine(): void
 {
  Vite::useHotFile(storage_path('framework/testing/predim2-no-hot'));
  Role::findOrCreate('root','web');$user=User::factory()->create();$user->assignRole('root');
  $response=$this->actingAs($user)->get(route('software.etabs2'))->assertOk();
  $response->assertSee('id="cad-viewer-app"',false)->assertSee(basename(Vite::asset('resources/js/etabs/main.js')))->assertDontSee('adm_safecito')->assertDontSee('id="datosGenerales"',false);
 }
 public function test_legacy_foundation_keeps_its_own_engine_and_tables(): void
 {
  Vite::useHotFile(storage_path('framework/testing/predim2-no-hot'));
  Role::findOrCreate('root','web');$user=User::factory()->create();$user->assignRole('root');
  $response=$this->actingAs($user)->get(route('software.cimentacion-v2'))->assertOk();
  $response->assertSee('adm_safecito')->assertSee('id="datosGenerales"',false)->assertSee('id="combinacionDeCargas"',false);
 }
}
