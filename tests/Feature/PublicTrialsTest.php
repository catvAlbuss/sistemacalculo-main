<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class PublicTrialsTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Http::preventStrayRequests();
    }

    public function test_welcome_and_login_offer_both_tools_without_a_session(): void
    {
        foreach (['landing.home','login'] as $route) {
            $this->get(route($route))->assertOk()->assertSee('Explora nuestras herramientas')
                ->assertSee('Probar Predim')->assertSee('Abrir hoja de cálculo')
                ->assertSee(route('predim_v2'))->assertSee(route('calculadora.estudiante.arco_techo'))
                ->assertSee(route('landing.info.predim'))->assertSee(route('landing.info.arco_techo'));
        }
        $this->assertGuest();
    }

    public function test_trial_information_renders_its_description_and_direct_access_instead_of_the_service_quote(): void
    {
        $this->get(route('landing.info.predim'))->assertOk()->assertSee('Predim v1.0')
            ->assertSee('Probar Predim')->assertSee(route('predim_v2'))
            ->assertDontSee('Cotiza tu proyecto');
        $this->get(route('landing.info.arco_techo'))->assertOk()->assertSee('Techo Arco')
            ->assertSee('Abrir hoja de cálculo')->assertSee(route('calculadora.estudiante.arco_techo'))
            ->assertDontSee('Cotiza tu proyecto');
        $this->get(route('predim_v2'))->assertOk();
        $this->get(route('calculadora.estudiante.arco_techo'))->assertOk();
        $this->assertGuest();
    }

    public function test_arco_pilot_preserves_input_defaults_and_calculation_targets(): void
    {
        $response = $this->get(route('calculadora.estudiante.arco_techo'))->assertOk();
        $document = new \DOMDocument();
        @$document->loadHTML('<?xml encoding="UTF-8">'.$response->getContent());
        $xpath = new \DOMXPath($document);
        $fixture = json_decode(file_get_contents(base_path('tests/frontend/fixtures/arco-techo-baseline.json')), true)[0];
        foreach ($fixture['inputs'] as $id => $value) {
            $inputs = $xpath->query('//input[@id="'.$id.'"]');
            $this->assertCount(1, $inputs);
            $this->assertSame((string) $value, $inputs[0]->getAttribute('value'));
            $this->assertCount(1, $xpath->query('//label[@for="'.$id.'"]'));
        }
        foreach (array_keys($fixture['outputs']) as $id) {
            $this->assertCount(1, $xpath->query('//tbody[@id="'.$id.'"]'));
        }
        $this->assertCount(1, $xpath->query('//button[@id="desingButton"]'));
        $this->assertGuest();
    }
}
