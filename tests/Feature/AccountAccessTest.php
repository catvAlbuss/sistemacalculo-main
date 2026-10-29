<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use App\Models\UserSubscription;
use App\Services\AccountAccess;
use Illuminate\Http\Request;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class AccountAccessTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        foreach (['root', 'gerencia', 'cliente'] as $name) { Role::create(['name' => $name, 'guard_name' => 'web']); }
    }

    private function browser(): Request
    {
        $request = Request::create('/login', 'POST');
        $store = new Store('test', new ArraySessionHandler(120));
        $store->start();
        $request->setLaravelSession($store);
        return $request;
    }

    private function admin(string $role = 'root'): User
    {
        $user = User::factory()->create(); $user->assignRole($role); return $user;
    }

    private function plan(): Subscription
    {
        return Subscription::create(['name' => 'Mensual', 'slug' => 'monthly', 'price' => 49.9, 'type' => 'monthly', 'duration_days' => 30, 'is_active' => true]);
    }

    public function test_third_independent_session_revokes_every_session_and_records_a_notice(): void
    {
        $user = User::factory()->create();
        $service = app(AccountAccess::class);
        $first = $this->browser(); $second = $this->browser();
        $this->assertTrue($service->register($user, $first));
        $this->assertTrue($service->register($user, $first)); // The same browser is not counted twice.
        $this->assertTrue($service->register($user, $second));
        $this->assertDatabaseCount('account_sessions', 2);
        $this->assertFalse($service->register($user, $this->browser()));
        $this->assertDatabaseCount('account_sessions', 0);
        $this->assertSame(1, (int) $user->fresh()->session_version);
        $this->assertNotSame($user->remember_token, $user->fresh()->remember_token);
        $this->assertDatabaseHas('account_security_events', ['user_id' => $user->id, 'type' => 'concurrent_access']);
        $this->actingAs($user->fresh())->withSession($first->session()->all())->get(route('profile'))->assertRedirect(route('login'))->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->actingAs($user->fresh())->withSession($second->session()->all())->getJson(route('account.session'))
            ->assertUnauthorized()->assertJsonPath('code','account_access_revoked');
        $this->assertTrue($service->register($user->fresh(), $this->browser()));
    }

    public function test_expired_sessions_free_capacity_and_logout_releases_the_current_session(): void
    {
        $user = User::factory()->create(); $browser = $this->browser();
        app(AccountAccess::class)->register($user, $browser);
        DB::table('account_sessions')->update(['last_seen_at' => now()->subMinutes(config('session.lifetime') + 1)]);
        $this->assertTrue(app(AccountAccess::class)->register($user, $this->browser()));
        $this->assertDatabaseCount('account_sessions', 1);
        $current = $this->browser(); app(AccountAccess::class)->register($user, $current);
        $this->actingAs($user)->withSession($current->session()->all())->post(route('logout'))->assertRedirect('/');
        $this->assertDatabaseCount('account_sessions', 1);
    }

    public function test_root_and_management_can_block_and_enable_accounts_without_changing_paid_expiry(): void
    {
        foreach (['root','gerencia'] as $role) {
            $admin = $this->admin($role); $user = User::factory()->create();
            $subscription = UserSubscription::create(['user_id'=>$user->id,'subscription_plan_id'=>$this->planWithSlug($role)->id,'status'=>'active','starts_at'=>now(),'ends_at'=>now()->addDays(20),'amount_paid'=>49.9,'payment_method'=>'culqi']);
            $end = $subscription->ends_at->toDateTimeString();
            $this->actingAs($admin)->patch(route('planUser.accountStatus',$user),['status'=>'blocked','reason'=>'Acceso compartido detectado'])->assertSessionHasNoErrors();
            $this->assertSame('blocked',$user->fresh()->account_status);
            $user->fresh()->update(['is_active'=>true]); // An activation must never remove the block.
            $this->assertFalse($user->fresh()->is_active);
            $this->actingAs($admin)->patch(route('planUser.accountStatus',$user),['status'=>'enabled','reason'=>'Revisión de titularidad completada'])->assertSessionHasNoErrors();
            $this->assertTrue($user->fresh()->is_active);
            $this->assertSame($end,$subscription->fresh()->ends_at->toDateTimeString());
        }
    }

    private function planWithSlug(string $slug): Subscription
    {
        return Subscription::create(['name'=>'Mensual','slug'=>$slug,'price'=>49.9,'type'=>'monthly','duration_days'=>30,'is_active'=>true]);
    }

    public function test_restricted_accounts_cannot_log_in_or_remain_authenticated(): void
    {
        foreach (['blocked','banned','deleted'] as $status) {
            $user=User::factory()->create(); $user->forceFill(['account_status'=>$status])->save();
            $this->post(route('login.store'),['email'=>$user->email,'password'=>'password'])->assertSessionHasErrors('email');
            $this->assertGuest();
            $this->actingAs($user->fresh())->getJson(route('profile'))->assertUnauthorized()->assertJsonPath('code','account_access_revoked');
        }
    }

    public function test_customers_cannot_change_status_and_management_cannot_modify_root_or_grant_root(): void
    {
        $root=$this->admin(); $manager=$this->admin('gerencia'); $customer=User::factory()->create();
        $payload=['status'=>'banned','reason'=>'Incumplimiento verificado'];
        $this->actingAs($customer)->patch(route('planUser.accountStatus',$manager),$payload)->assertForbidden();
        $this->actingAs($manager)->patch(route('planUser.accountStatus',$root),$payload)->assertForbidden();
        $this->actingAs($manager)->put(route('planUser.update',$customer),['name'=>$customer->name,'email'=>$customer->email,'roles'=>['root']])->assertForbidden();
        $this->actingAs($root)->patch(route('planUser.accountStatus',$root),$payload)->assertForbidden();
        $this->delete(route('planUser.destroy',$root))->assertForbidden();
    }

    public function test_account_removal_preserves_financial_history_and_email_reservation(): void
    {
        $admin=$this->admin();$user=User::factory()->create();$plan=$this->plan();
        $sub=UserSubscription::create(['user_id'=>$user->id,'subscription_plan_id'=>$plan->id,'status'=>'active','starts_at'=>now(),'ends_at'=>now()->addDays(30),'amount_paid'=>49.9,'payment_method'=>'culqi']);
        $this->actingAs($admin)->delete(route('planUser.destroy',$user))->assertRedirect(route('planUser.index'));
        $this->assertSame('deleted',$user->fresh()->account_status);
        $this->assertSame('cancelled',$sub->fresh()->status);
        $this->assertSame('49.90',$sub->fresh()->amount_paid);
        $this->get(route('planUser.index'))->assertViewHas('users',fn($users)=>!$users->contains('id',$user->id));
        $this->assertDatabaseHas('users',['id'=>$user->id,'email'=>$user->email]);
    }

    public function test_administrative_renewal_preserves_coverage_and_does_not_invent_a_payment(): void
    {
        $admin=$this->admin();$user=User::factory()->create();$plan=$this->plan();
        $sub=UserSubscription::create(['user_id'=>$user->id,'subscription_plan_id'=>$plan->id,'status'=>'active','starts_at'=>now(),'ends_at'=>now()->addDays(12),'amount_paid'=>49.9,'payment_method'=>'culqi']);
        $this->actingAs($admin)->post(route('planUser.assignSubscription',$user),['subscription_plan_id'=>$plan->id,'assignment_mode'=>'renew'])->assertSessionHasNoErrors();
        $new=$user->subscriptions()->latest('id')->first();
        $this->assertSame('active',$sub->fresh()->status);
        $this->assertTrue($new->starts_at->equalTo($sub->ends_at));
        $this->assertSame('0.00',$new->amount_paid);
        $this->assertSame('manual',$new->payment_method);
        $this->assertDatabaseCount('payment_requests',0);
        $this->assertSame($sub->id,$user->fresh()->current_subscription_id);
    }

    public function test_suspended_coverage_remains_visible_for_administrative_reactivation(): void
    {
        $admin=$this->admin();$user=User::factory()->create();$plan=$this->plan();
        $sub=UserSubscription::create(['user_id'=>$user->id,'subscription_plan_id'=>$plan->id,'status'=>'suspended','starts_at'=>now(),'ends_at'=>now()->addDays(12),'amount_paid'=>49.9,'payment_method'=>'culqi']);
        $this->actingAs($admin)->get(route('planUser.index'))->assertOk()->assertViewHas('userDetails',fn($details)=>$details[$user->id]['current_subscription']['status']==='suspended');
        $this->patch(route('subscription.reactivate',$sub))->assertSessionHasNoErrors();
        $this->assertSame('active',$sub->fresh()->status);
    }

    public function test_cancelled_coverage_does_not_block_the_account_from_renewing(): void
    {
        $admin=$this->admin();$user=User::factory()->create();$plan=$this->plan();
        $sub=UserSubscription::create(['user_id'=>$user->id,'subscription_plan_id'=>$plan->id,'status'=>'active','starts_at'=>now(),'ends_at'=>now()->addDays(12),'amount_paid'=>49.9,'payment_method'=>'culqi']);
        $this->actingAs($admin)->delete(route('subscription.cancel',$sub))->assertSessionHasNoErrors();
        $this->assertTrue($user->fresh()->is_active);
        $this->actingAs($user->fresh())->get(route('plans.mine'))->assertOk()->assertSee('Renovar con Mensual');
    }

    public function test_reactivation_cannot_overlap_an_existing_paid_period(): void
    {
        $admin=$this->admin();$user=User::factory()->create();$plan=$this->plan();
        $sub=UserSubscription::create(['user_id'=>$user->id,'subscription_plan_id'=>$plan->id,'status'=>'suspended','starts_at'=>now(),'ends_at'=>now()->addDays(12),'amount_paid'=>49.9,'payment_method'=>'culqi']);
        UserSubscription::create(['user_id'=>$user->id,'subscription_plan_id'=>$plan->id,'status'=>'active','starts_at'=>now(),'ends_at'=>now()->addDays(30),'amount_paid'=>49.9,'payment_method'=>'culqi']);
        $this->actingAs($admin)->patch(route('subscription.reactivate',$sub))->assertSessionHasErrors('subscription_plan_id');
        $this->assertSame('suspended',$sub->fresh()->status);
    }
}
