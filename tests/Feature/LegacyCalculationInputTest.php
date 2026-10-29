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
