<?php

namespace Tests\Feature;

use App\Models\MemoriaDescriptiva;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Endurecimiento previo a producción: cabeceras, límite de cálculos, imágenes de Memoria y rutas retiradas.
class SecurityHardeningTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private function root(): User
    {
        Role::findOrCreate('root', 'web');
        $user = User::factory()->create();
        $user->assignRole('root');

        return $user;
    }

    public function test_responses_send_security_headers(): void
    {
        $this->withoutVite();
        $response = $this->get(route('landing.plans'))->assertOk();

        $response->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('Permissions-Policy')
            ->assertHeader('Content-Security-Policy', "object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
        $this->assertFalse($response->headers->has('X-Powered-By'));
    }

    public function test_calculation_posts_are_rate_limited_per_user_but_pages_are_not(): void
    {
        $this->withoutVite();
        $this->actingAs($this->root());
        $data = ['fc' => '210', 'fy' => '4200', 'ys' => '2', 'df' => '1', 't' => '1', 'b' => '1', 'l' => '1', 'DZY' => '1', 'cps' => '2',
            'dzapata' => '60', 'Columna' => '40', 'VarillaX' => '1.979', 'VarillaY' => '1.979', 'espaciamientox' => '15', 'espaciamientoy' => '15',
            'dataFromHandsontable' => '[["CM",10,1,1],["CV",5,0,0],["CSX",1,1,1],["CSY",1,1,1]]'];

        for ($i = 0; $i < 60; $i++) {
            $this->post(route('zapataGenCon'), $data)->assertOk();
        }
        $this->post(route('zapataGenCon'), $data)->assertStatus(429);
        // Las páginas de las hojas no cuentan para el límite.
        $this->get(route('calculadora.asistente.zapata-general'))->assertOk();
    }

    public function test_memoria_attachments_accept_only_images(): void
    {
        $user = $this->root();
        $memoria = MemoriaDescriptiva::create(['user_id' => $user->id, 'data' => []]);
        $url = '/software/memoria-descriptiva/'.$memoria->id.'/attachments';
        $png = 'data:image/png;base64,'.base64_encode('png-bytes');

        $this->actingAs($user)->postJson($url, ['key' => 'losa', 'image_base64' => $png])->assertOk();
        foreach (['data:text/html;base64,PHNjcmlwdD4=', 'data:image/png;base64,AAA"><script>', 'javascript:alert(1)'] as $payload) {
            $this->postJson($url, ['key' => 'losa', 'image_base64' => $payload])->assertUnprocessable();
        }
    }

    public function test_retired_public_file_routes_are_gone(): void
    {
        // /storage/{path} queda en la ruta firmada del disco local de Laravel (403 sin firma).
        $this->assertFalse(\Illuminate\Support\Facades\Route::has('get.firma'));
        $this->assertFalse(\Illuminate\Support\Facades\Route::has('download.proof'));
        $this->get('/storage/firmas/x.png')->assertForbidden();
        $this->get('/download-proof/1')->assertNotFound();
    }
}
