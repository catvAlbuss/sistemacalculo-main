<?php

namespace Tests\Feature;

use App\Livewire\SubscriptionPlansManagement;
use App\Models\Subscription;
use App\Services\PlanPricing;
use Database\Seeders\SubscriptionPlansSeeder;
use Livewire\Livewire;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class PaymentPlansTest extends TestCase
{
    use RefreshPaymentsDatabase;

    public function test_seeded_annual_plan_matches_monthly_discount_and_has_real_capacity(): void
    {
        $this->withoutVite();
        $this->seed(SubscriptionPlansSeeder::class);
        $annual = Subscription::where('slug', 'plan-anual')->firstOrFail();
        $quote = app(PlanPricing::class)->quote($annual);
        $this->assertEquals(568.86, $quote['total']);
        $this->assertEquals(29.94, $quote['discount']);
        $this->get('/planes')->assertOk()->assertSee('568.86')->assertDontSee('20%')->assertDontSee('Por definir');
        $this->get(route('planes.register', ['plan' => $annual->id]))->assertOk()->assertSee('568.86')->assertSee('Usuarios incluidos');
        $monthly = Subscription::where('slug', 'plan-mensual')->firstOrFail();
        $monthly->update(['price' => 50]);
        $this->assertEquals(570, app(PlanPricing::class)->quote($annual)['total']);
    }

    public function test_admin_can_create_and_edit_plan_capacity_with_validation(): void
    {
        Livewire::test(SubscriptionPlansManagement::class)
            ->set('name', 'Nuevo Plan')->set('slug', 'nuevo-plan')->set('type', 'monthly')
            ->set('price', 49.90)->set('duration_days', 30)->set('max_users', 1)->set('max_projects', 10)
            ->call('store')->assertHasNoErrors();
        $plan = Subscription::where('slug', 'nuevo-plan')->firstOrFail();
        $this->assertSame(10, $plan->max_projects);
        Livewire::test(SubscriptionPlansManagement::class)->call('edit', $plan->id)
            ->set('max_projects', 0)->call('update')->assertHasErrors('max_projects')
            ->set('max_projects', 20)->call('update')->assertHasNoErrors();
        $this->assertSame(20, $plan->fresh()->max_projects);
    }
}
