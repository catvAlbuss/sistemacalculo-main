<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class CercoPerimetricoProductionTest extends TestCase
{
    use RefreshPaymentsDatabase;

    public function test_cerco_loads_with_the_production_manifest_and_missing_optional_figures(): void
    {
        Vite::useHotFile(storage_path('framework/testing/cerco-no-hot'));
        Role::findOrCreate('root', 'web');
        $user = User::factory()->create();
        $user->assignRole('root');

        $response = $this->actingAs($user)->get(route('calculadora.asistente.cerco-perimetrico'));
        $response->assertOk()->assertSee('data-sheet="cerco-perimetrico"', false)
            ->assertSee('id="datacercoperimetrico1"', false)
            ->assertSee('cerco-perimetrico-')->assertDontSee('localhost:5173');
        foreach (['ra1', 'ra2'] as $figure) {
            if (!is_file(resource_path('img/calc/'.$figure.'.png'))) {
                $response->assertDontSee('src="resources/img/calc/'.$figure.'.png', false);
            }
        }
        foreach (['resources/js/cerco-perimetrico.js', 'resources/img/calc/map.png', 'resources/img/calc/viga.png', 'resources/img/calc/columna.png', 'resources/img/calc/momentos.png', 'resources/img/calc/hc.png', 'resources/img/calc/d2.png'] as $asset) {
            $path = parse_url(Vite::asset($asset), PHP_URL_PATH);
            $this->assertFileExists(public_path(ltrim($path, '/')), $asset);
        }
    }

    public function test_the_installed_exception_renderer_preserves_the_original_error(): void
    {
        config(['app.debug'=>true]);
        Route::get('/__test/cerco-renderer', fn () => throw new \RuntimeException('cerco-renderer-regression'));
        $this->get('/__test/cerco-renderer')->assertStatus(500)
            ->assertSee('cerco-renderer-regression')->assertSee('RuntimeException');
    }
}
