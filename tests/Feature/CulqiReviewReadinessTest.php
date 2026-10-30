<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use App\Services\Culqi;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Observaciones de Culqi: catálogo con precio e imagen, cierre de compra activo y cuenta de prueba.
class CulqiReviewReadinessTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private function keys(string $env, array $extra = []): void
    {
        config(array_merge([
            'services.culqi.enabled' => true,
            'services.culqi.public_key' => "pk_{$env}_abc123",
            'services.culqi.secret_key' => "sk_{$env}_abc123",
            'services.culqi.webhook_token' => str_repeat('a', 40),
            'services.culqi.review_mode' => false,
            'services.culqi.reviewer_emails' => [],
        ], $extra));
    }

    public function test_review_mode_allows_test_keys_in_production_only_for_reviewers(): void
    {
        $this->app['env'] = 'production';
        $reviewer = User::factory()->create(['email' => 'revisor@example.com']);
        $customer = User::factory()->create();

        $this->keys('test');
        $this->assertNotEmpty(app(Culqi::class)->configurationErrors(), 'Sin modo revisión, las llaves test se rechazan en producción.');
        $this->assertFalse(app(Culqi::class)->enabledFor($reviewer));

        $this->keys('test', ['services.culqi.review_mode' => true]);
        $this->assertContains('El modo revisión requiere CULQI_REVIEWER_EMAILS con al menos una cuenta.', app(Culqi::class)->configurationErrors());

        $this->keys('test', ['services.culqi.review_mode' => true, 'services.culqi.reviewer_emails' => ['revisor@example.com']]);
        $culqi = app(Culqi::class);
        $this->assertSame([], $culqi->configurationErrors());
        $this->assertTrue($culqi->inReviewMode());
        $this->assertTrue($culqi->enabledFor($reviewer));
        $this->assertFalse($culqi->enabledFor($customer));
        $this->assertFalse($culqi->enabledFor(null));

        // Con llaves live el modo revisión no restringe a nadie.
        $this->keys('live', ['services.culqi.review_mode' => true, 'services.culqi.reviewer_emails' => ['revisor@example.com']]);
        $this->assertFalse(app(Culqi::class)->inReviewMode());
        $this->assertTrue(app(Culqi::class)->enabledFor($customer));
    }

    public function test_plan_catalog_shows_five_priced_plans_each_with_its_own_image(): void
    {
        $this->withoutVite();
        $this->artisan('db:seed', ['--class' => 'SubscriptionPlansSeeder'])->assertSuccessful();

        $html = $this->get(route('landing.plans'))->assertOk()->getContent();

        foreach (['Plan Mensual', 'Plan Trimestral', 'Plan Semestral', 'Plan Anual', 'De Por Vida'] as $name) {
            $this->assertStringContainsString($name, $html);
        }
        // Cinco planes con precio visible; De por vida se gestiona por contacto y no muestra importe.
        $this->assertSame(5, substr_count($html, '<small>S/</small>'));
        $this->assertStringContainsString('Contáctenos', $html);
        $this->assertStringNotContainsString('1,499.90', $html);
        $this->assertStringNotContainsString('Proyectos incluidos', $html);
        $this->assertStringNotContainsString('Certificado', $html);
        $this->assertSame(2, substr_count($html, 'Acceso exclusivo a nuevas herramientas y agentes de IA'));
        preg_match_all('/class="en-plan-image"/', $html, $images);
        preg_match_all('/<img src="([^"]+)" alt="([^"]+)" class="en-plan-image"/', $html, $sources);
        $this->assertCount(Subscription::active()->count(), $images[0]);
        $this->assertSame(count($sources[2]), count(array_unique($sources[2])), 'Cada plan debe tener su propia imagen.');
    }

    public function test_period_plans_are_the_monthly_plan_for_three_and_six_months(): void
    {
        $this->artisan('db:seed', ['--class' => 'SubscriptionPlansSeeder'])->assertSuccessful();
        $pricing = app(\App\Services\PlanPricing::class);
        $quote = fn (string $slug) => $pricing->quote(Subscription::where('slug', $slug)->firstOrFail());

        $this->assertEqualsWithDelta(50.00, $quote('plan-mensual')['list_total'], 0.001);
        $this->assertEqualsWithDelta(150.00, $quote('plan-trimestral')['list_total'], 0.001);
        $this->assertEqualsWithDelta(300.00, $quote('plan-semestral')['list_total'], 0.001);
        $this->assertEqualsWithDelta(570.00, $quote('plan-anual')['total'], 0.001);
        $this->assertSame(0, (int) $quote('plan-trimestral')['discount']);
        $this->assertSame(90, $quote('plan-trimestral')['duration_days']);
        $this->assertSame(180, $quote('plan-semestral')['duration_days']);

        // Si cambia el Plan Mensual, los planes por período lo siguen.
        Subscription::where('slug', 'plan-mensual')->update(['price' => 60]);
        $this->assertEqualsWithDelta(180.00, $quote('plan-trimestral')['list_total'], 0.001);
        $this->assertEqualsWithDelta(360.00, $quote('plan-semestral')['list_total'], 0.001);
    }

    public function test_reviewer_command_creates_a_verified_customer_account(): void
    {
        Role::findOrCreate('cliente', 'web');

        $this->artisan('culqi:revisor', ['email' => 'Revisor@Example.com'])->assertSuccessful();

        $user = User::where('email', 'revisor@example.com')->firstOrFail();
        $this->assertTrue($user->hasRole('cliente'));
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue((bool) $user->is_active);
    }
}
