<?php

namespace Tests\Feature;

use App\Http\Controllers\OctavePlotController;
use App\Http\Middleware\ValidateLegacyCalculation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class LegacyCalculationInputTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private function aligerados(array $overrides): Request
    {
        $data = array_merge(['fc'=>'210','Fy'=>'4200','b'=>'[10,10]','h'=>'[20,20]','Lt'=>'[3.5,4]','WD'=>'[0.4,0.4]','WV'=>'[0.2,0.2]',
            'anchoTributario'=>'0.4','frm'=>'1.4','frv'=>'1.7'], $overrides);
        $request = Request::create('/aligerados', 'POST', $data);
        $request->setRouteResolver(fn () => new Route('POST', 'aligerados', [OctavePlotController::class, 'graficarAligerados']));
        return $request;
    }

    public function test_aligerados_requires_at_least_one_span_with_matching_vectors(): void
    {
        $passes = app(ValidateLegacyCalculation::class)->handle($this->aligerados([]), fn () => response('ok'));
        $this->assertSame('ok', $passes->getContent());

        foreach ([[['b'=>'[]','h'=>'[]','Lt'=>'[]','WD'=>'[]','WV'=>'[]'], 'Lt'], [['Lt'=>'[3.5,0]'], 'Lt'], [['WV'=>'[0.2]'], 'WV']] as [$overrides, $field]) {
            try {
                app(ValidateLegacyCalculation::class)->handle($this->aligerados($overrides), fn () => response('unsafe'));
                $this->fail('Invalid spans were accepted.');
            } catch (ValidationException $exception) {
                $this->assertArrayHasKey($field, $exception->errors());
            }
        }
    }

    public function test_losas_aligeradas_results_are_grouped_by_span_with_example_inputs(): void
    {
        $this->withoutVite();
        Role::findOrCreate('root', 'web');
        $user = User::factory()->create();
        $user->assignRole('root');
        // Mismos nombres y valores de ejemplo que genera resources/js/losas-aligeradas/spanTables.js para 2 tramos.
        $data = ['fc' => '210', 'fy' => '4200', 'num_tramos' => '2'];
        foreach ([1, 2] as $t) {
            $data += ["Luz_Libre$t" => 4, "CMuerta$t" => 0.25, "Cviva$t" => 0.08, "BASE$t" => 40, "ALTURA$t" => 20, "EVB$t" => 10,
                "Mi$t" => 0.6, "Md$t" => 0.6, "δ1$t" => 0.5, "δ2$t" => 0.8, "δ3$t" => 0.5];
        }
        foreach (range(1, 6) as $p) {
            $i = ($p - 1) % 3;
            $data += ["EJE$p" => (string) $p, "MomentoUltimo-$p" => [0.6, 0, 0.6][$i], "Vu-$p" => [1.2, 0.2, 1.2][$i], "Tu-$p" => 0,
                "MomentoUltimo+$p" => [0, 0.45, 0][$i], "Vu+$p" => 0, "Tu+$p" => 0];
        }

        $html = $this->actingAs($user)->post(route('desingLosa'), $data)->assertOk()->getContent();

        $this->assertStringContainsString('class="sheet-span-table"', $html);
        $this->assertSame(7, substr_count($html, 'Tramo 2'));
        $this->assertStringContainsString('>Inicio<', $html);
        $this->assertStringNotContainsString('START', $html);
        $this->assertStringContainsString('id="casosSelectA6"', $html);
    }

    public function test_zapata_general_rejects_zero_bar_and_renders_with_zero_loads(): void
    {
        $this->withoutVite();
        Role::create(['name' => 'root', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('root');
        $data = ['fc'=>'215','fy'=>'4500','ys'=>'2','df'=>'1','t'=>'1','b'=>'3','l'=>'1','DZY'=>'2','cps'=>'2','dzapata'=>'1',
            'Columna'=>'40','VarillaX'=>'1.267','VarillaY'=>'0','espaciamientox'=>'14','espaciamientoy'=>'15','inercia'=>'Sregular','B'=>'1','By'=>'1',
            'dataFromHandsontable'=>'[["CM",0,0,0],["CV",0,0,0],["CSX",0,0,0],["CSY",0,0,0]]'];

        $this->actingAs($user)->postJson(route('zapataGenCon'), $data)
            ->assertStatus(422)->assertJsonValidationErrors(['VarillaY' => 'Selecciona un diámetro de varilla en Y.']);

        $this->post(route('zapataGenCon'), ['VarillaY' => '1.979'] + $data)->assertOk();
    }
}
