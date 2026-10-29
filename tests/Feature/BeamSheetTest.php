<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\File;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class BeamSheetTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private function rootUser(): User
    {
        Role::findOrCreate('root', 'web');
        $user = User::factory()->create();
        $user->assignRole('root');
        return $user;
    }

    public function test_beam_pages_share_the_workbench_and_keep_engine_targets(): void
    {
        $this->withoutVite();
        $this->actingAs($this->rootUser());
        $this->get(route('calculadora.asistente.vigas'))->assertOk()
            ->assertSee('data-sheet="diseno-vigas"', false)->assertSee('id="predimenension"', false)
            ->assertSee('id="desingFlexion"', false)->assertSee('data-sheet-export', false);
        $this->get(route('calculadora.asistente.vigas-general'))->assertOk()
            ->assertSee('data-sheet="vigas-general"', false)->assertSee('id="tablaContainer"', false)
            ->assertSee('id="vigas_general"', false)->assertSee('id="exportImageButton"', false);
    }

    public function test_capture_requires_login_and_validates_input(): void
    {
        $this->postJson('/capturar-viga-fragmento', ['html'=>'test'])->assertUnauthorized();
        $this->actingAs($this->rootUser())->postJson('/capturar-viga-fragmento', ['theme'=>'invalid'])->assertUnprocessable();
    }

    public function test_capture_failures_keep_diagnostics_out_of_the_response(): void
    {
        config(['capture.node_binary'=>'nonexistent-capture-node-binary']);
        $this->actingAs($this->rootUser())->postJson('/capturar-viga-fragmento', ['html'=>'<div id="vigasgn">Resultado</div>'])
            ->assertStatus(500)->assertJson(['ok'=>false])->assertDontSee('nonexistent-capture-node-binary');
    }

    public function test_actual_capture_returns_a_private_png_without_puppeteer(): void
    {
        $this->actingAs($this->rootUser());
        $response = $this->postJson('/capturar-viga-fragmento', [
            'html'=>'<div id="vigasgn">Resultado de vigas</div>',
            'inlineStyles'=>'<style>#vigasgn{height:80px}</style>',
            'theme'=>'dark',
        ]);
        $response->assertOk()->assertHeader('content-type', 'image/png');
        $file = $response->baseResponse->getFile()->getPathname();
        try {
            $this->assertStringContainsString('/private/captures/', str_replace('\\', '/', $file));
            $this->assertSame("\x89PNG\r\n\x1a\n", file_get_contents($file, false, null, 0, 8));
        } finally { File::delete($file); }
    }
}
