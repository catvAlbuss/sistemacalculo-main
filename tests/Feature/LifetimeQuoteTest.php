<?php

namespace Tests\Feature;

use App\Http\Controllers\CulqiController;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Culqi;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class LifetimeQuoteTest extends TestCase
{
    use RefreshPaymentsDatabase;
    private Subscription $plan;
    private User $customer;
    protected function setUp(): void
    {
        parent::setUp();$this->withoutVite();Mail::fake();Http::preventStrayRequests();
        foreach(['root','gerencia','cliente'] as $role){Role::create(['name'=>$role,'guard_name'=>'web']);}
        config(['services.culqi.enabled'=>true,'services.culqi.public_key'=>'pk_test_example','services.culqi.secret_key'=>'sk_test_example','services.culqi.webhook_token'=>str_repeat('a',40),
            'payments.processing.enabled'=>true,'payments.processing.fixed_pen'=>'0.70']);
        $this->plan=Subscription::create(['name'=>'De por vida','slug'=>'lifetime','type'=>'lifetime','price'=>0,'is_active'=>true,'max_users'=>1,'max_projects'=>50]);
        $this->customer=User::factory()->create();$this->customer->assignRole('cliente');
    }
    private function data(): array
    {
        return ['subscription_plan_id'=>$this->plan->id,'net_amount'=>'1000.00','phone'=>'999999999','receipt_type'=>'boleta','document_type'=>'DNI','document_number'=>'12345678','quote_key'=>(string) Str::uuid()];
    }
    private function admin(string $role='root'): User { $user=User::factory()->create();$user->assignRole($role);return $user; }
    private function quote(): PaymentRequest
    {
        $this->actingAs($this->admin())->post(route('lifetime-quotes.store',$this->customer),$this->data())->assertSessionHasNoErrors();
        return PaymentRequest::firstOrFail();
    }
    public function test_zero_price_lifetime_is_contact_only_and_cannot_create_a_free_account(): void
    {
        $this->assertFalse($this->plan->isFree());$this->assertSame('Contáctenos',$this->plan->formatted_price);
        $this->get(route('landing.plans'))->assertOk()->assertSee('Contáctenos')->assertDontSee(route('planes.register',['plan'=>$this->plan->id]),false);
        $this->get(route('planes.register',['plan'=>$this->plan->id]))->assertRedirect(route('contacto.index',['plan'=>'por-vida']));
        $this->post(route('planes.store'),['name'=>'Visitante','email'=>'guest@example.test','phone'=>'999999999','subscription_plan_id'=>$this->plan->id])->assertSessionHasErrors('subscription_plan_id');
        $this->assertDatabaseCount('user_subscriptions',0);$this->assertDatabaseCount('payment_requests',0);
        $this->assertDatabaseMissing('users',['email'=>'guest@example.test']);Http::assertNothingSent();
    }
    public function test_only_root_and_management_can_set_the_quote_amount(): void
    {
        $this->actingAs($this->customer)->post(route('lifetime-quotes.store',$this->customer),$this->data())->assertForbidden();
        foreach(['root','gerencia'] as $role){
            $this->actingAs($this->admin($role))->post(route('lifetime-quotes.store',$this->customer),$this->data())->assertSessionHasNoErrors();
        }
        $this->assertDatabaseCount('payment_requests',2);$this->assertDatabaseCount('user_subscriptions',0);
    }
    public function test_quote_freezes_price_and_is_idempotent_without_confirming_a_payment(): void
    {
        $admin=$this->admin();$data=$this->data();$this->actingAs($admin);
        $this->post(route('lifetime-quotes.store',$this->customer),$data)->assertSessionHasNoErrors();
        $payment=PaymentRequest::firstOrFail();$this->assertGreaterThan(1000,(float)$payment->amount);
        $this->assertSame('pending',$payment->status);$this->assertSame($admin->id,$payment->plan_snapshot['lifetime_quote']['created_by']);
        $this->plan->update(['price'=>9999]);
        $this->post(route('lifetime-quotes.store',$this->customer),$data)->assertSessionHasNoErrors();
        $this->assertDatabaseCount('payment_requests',1);$this->assertSame($payment->amount,$payment->fresh()->amount);
        $data['net_amount']='2.00';$this->post(route('lifetime-quotes.store',$this->customer),$data)->assertSessionHasErrors('net_amount');
        Http::assertNothingSent();
    }
    public function test_quote_requires_its_owner_and_acceptance_before_charging(): void
    {
        $payment=$this->quote();$url=URL::temporarySignedRoute('culqi.charge',now()->addDay(),['paymentRequest'=>$payment->id]);
        $this->actingAs($this->admin())->postJson($url,['token'=>'tkn_test_quote','device_id'=>'device','accept_terms'=>true])->assertForbidden();
        $this->actingAs($this->customer)->get(CulqiController::paymentUrl($payment))->assertOk()->assertSee('payment-accept-terms',false);
        $this->postJson($url,['token'=>'tkn_test_quote','device_id'=>'device'])->assertUnprocessable()->assertJsonValidationErrors('accept_terms');
        Http::assertNothingSent();$this->assertDatabaseCount('user_subscriptions',0);
    }
    public function test_expired_proposal_never_calls_the_gateway(): void
    {
        $payment=$this->quote();$snapshot=$payment->plan_snapshot;$snapshot['lifetime_quote']['valid_until']=now()->subMinute()->toIso8601String();$payment->update(['plan_snapshot'=>$snapshot]);
        $this->assertFalse(app(Culqi::class)->charge($payment,['token'=>'tkn_test_quote','device_id'=>'device'])['ok']);
        Http::assertNothingSent();$this->assertDatabaseCount('user_subscriptions',0);
    }
    public function test_gateway_confirmation_activates_permanent_access_with_the_frozen_amount(): void
    {
        $payment=$this->quote();
        $charge=['id'=>'chr_test_quote','object'=>'charge','capture'=>true,'amount_refunded'=>0,'amount'=>(int)round((float)$payment->amount*100),'currency_code'=>'PEN','source'=>['id'=>'tkn_test_quote'],
            'outcome'=>['type'=>'venta_exitosa'],'metadata'=>['application'=>'rizabal','payment_request_id'=>(string)$payment->id,'payment_reference'=>$payment->token]];
        Http::fake(['*'=>Http::response($charge)]);
        $this->actingAs($this->customer)->postJson(URL::temporarySignedRoute('culqi.charge',now()->addDay(),['paymentRequest'=>$payment->id]),['token'=>'tkn_test_quote','device_id'=>'device','accept_terms'=>true])->assertOk();
        $period=$this->customer->subscriptions()->firstOrFail();$this->assertNull($period->ends_at);$this->assertSame($payment->amount,$period->amount_paid);
        $this->assertSame('approved',$payment->fresh()->status);$this->assertNotEmpty($payment->fresh()->plan_snapshot['legal_acceptance']);
    }
}
