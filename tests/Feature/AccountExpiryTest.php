<?php

namespace Tests\Feature;

use App\Mail\AccountDeactivated;
use App\Mail\AccountDeletionNotice;
use App\Mail\RenewalReminder;
use App\Models\PaymentTask;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserSubscription;
use App\Services\PaymentTasks;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Cuentas con el plan vencido sin renovar: aviso un día antes de la baja y baja lógica a los 7 días.
class AccountExpiryTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private Subscription $plan;

    protected function setUp(): void
    {
        parent::setUp();
        config(['payments.queue_connection' => 'payments', 'subscriptions.baja_automatica' => true, 'subscriptions.dias_para_baja' => 7]);
        Queue::fake();
        Mail::fake();
        $this->withoutVite();
        Role::create(['name' => 'cliente', 'guard_name' => 'web']);
        Role::create(['name' => 'root', 'guard_name' => 'web']);
        $this->plan = Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'type' => 'monthly', 'price' => 49.90, 'duration_days' => 30, 'is_active' => true]);
    }

    private function cliente(int $diasVencido, string $rol = 'cliente', string $email = 'cliente@example.com'): User
    {
        $user = User::factory()->create(['email' => $email]);
        $user->assignRole($rol);
        UserSubscription::create(['user_id' => $user->id, 'subscription_plan_id' => $this->plan->id, 'status' => 'active',
            'starts_at' => now()->subDays(30 + $diasVencido), 'ends_at' => today()->subDays($diasVencido)->setTime(12, 0), 'amount_paid' => 49.90]);

        return $user;
    }

    private function correrTareas(): void
    {
        foreach (PaymentTask::whereIn('kind', ['account_deletion_notice', 'account_deleted'])->pluck('id') as $id) {
            app(PaymentTasks::class)->run($id);
        }
    }

    public function test_one_day_before_the_deactivation_the_client_is_warned_and_nothing_is_deleted(): void
    {
        $user = $this->cliente(6);
        $this->artisan('accounts:expire')->assertSuccessful();
        $this->artisan('accounts:expire')->assertSuccessful();
        $this->assertSame(1, PaymentTask::where('kind', 'account_deletion_notice')->count(), 'one notice, not duplicated');
        $this->correrTareas();
        Mail::assertSent(AccountDeletionNotice::class, fn ($mail) => $mail->hasTo($user->email));
        $this->assertSame('enabled', $user->fresh()->account_status);
    }

    public function test_after_seven_days_without_renewal_the_account_is_logically_deleted_and_notified(): void
    {
        $user = $this->cliente(7);
        $this->artisan('accounts:expire', ['--dry-run' => true])->assertSuccessful();
        $this->assertSame('enabled', $user->fresh()->account_status, 'dry run changes nothing');
        $this->artisan('accounts:expire')->assertSuccessful();
        $fresh = $user->fresh();
        $this->assertSame('deleted', $fresh->account_status);
        $this->assertFalse((bool) $fresh->is_active);
        $this->assertStringContainsString('Baja automática', $fresh->account_status_reason);
        $this->assertSame(1, UserSubscription::where('user_id', $user->id)->count(), 'data is kept (logical deletion)');
        $this->correrTareas();
        Mail::assertSent(AccountDeactivated::class, fn ($mail) => $mail->hasTo($user->email));
    }

    public function test_staff_renewed_accounts_and_accounts_without_plans_are_never_touched(): void
    {
        $root = $this->cliente(20, 'root', 'root@example.com');
        $renovado = $this->cliente(20, 'cliente', 'renovado@example.com');
        UserSubscription::create(['user_id' => $renovado->id, 'subscription_plan_id' => $this->plan->id, 'status' => 'active',
            'starts_at' => now()->subDay(), 'ends_at' => now()->addDays(29), 'amount_paid' => 49.90]);
        $sinPlan = User::factory()->create(['email' => 'sinplan@example.com']);
        $this->artisan('accounts:expire')->assertSuccessful();
        $this->assertSame('enabled', $root->fresh()->account_status);
        $this->assertSame('enabled', $renovado->fresh()->account_status);
        $this->assertSame('enabled', $sinPlan->fresh()->account_status);
    }

    public function test_the_last_day_renewal_reminder_explains_the_deactivation_and_the_deletion(): void
    {
        $user = $this->cliente(0);
        $sub = $user->subscriptions()->first();
        $sub->update(['starts_at' => now()->subDays(29), 'ends_at' => today()->addDay()->setTime(12, 0)]);
        $html = (new RenewalReminder($sub->fresh(), 1))->render();
        $this->assertStringContainsString('Mañana se desactiva', $html);
        $this->assertStringContainsString('7 días después del vencimiento', $html);
        $this->assertStringNotContainsString('Mañana se desactiva', (new RenewalReminder($sub->fresh(), 5))->render());
    }
}
