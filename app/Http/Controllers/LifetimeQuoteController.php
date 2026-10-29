<?php

namespace App\Http\Controllers;

use App\Models\PaymentEvent;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing;
use App\Services\ProcessingPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LifetimeQuoteController extends Controller
{
    public function create(User $user)
    {
        $this->authorizeAccount($user);
        return view('planesUser.payments.lifetime-quote', ['customer'=>$user,
            'previous'=>PaymentRequest::where('user_id',$user->id)->latest()->first(),
            'plans'=>Subscription::active()->where('type','lifetime')->ordered()->get(),
            'ubigeos'=>\App\Models\Ubigeo::orderBy('codigo')->get(), 'quoteKey'=>(string) Str::uuid()]);
    }

    public function store(Request $request, User $user)
    {
        $this->authorizeAccount($user);
        $data=$request->validate([
            'subscription_plan_id'=>['required',Rule::exists('subscriptions','id')->where('type','lifetime')->where('is_active',true)],
            'net_amount'=>'required|numeric|decimal:0,2|min:3|max:100000',
            'phone'=>['required','string','regex:/^(?:\+?51)?[0-9]{9}$/'], 'quote_key'=>'required|uuid',
        ]);
        // Identity and amount come from the authorized administrator, never from a public checkout.
        $request->merge(['name'=>$user->name,'email'=>$user->email,'checkout_form_version'=>'5']);
        $billing=app(Billing::class)->validate($request);
        $plan=Subscription::active()->findOrFail($data['subscription_plan_id']);
        $net=(int) round((float) $data['net_amount']*100);
        $processing=app(ProcessingPrice::class)->quote($net,'PEN');
        $totals=app(Billing::class)->breakdown($processing['gross_cents']/100);
        $key=hash_hmac('sha256','lifetime:'.auth()->id().':'.$data['quote_key'],config('app.key'));
        $fingerprint=hash('sha256',json_encode([$user->id,$plan->id,$net,$billing,$data['phone']],JSON_THROW_ON_ERROR));
        $payment=DB::transaction(function() use($user,$data,$plan,$net,$processing,$totals,$billing,$key,$fingerprint){
            $owner=User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $existing=PaymentRequest::where('checkout_key',$key)->first();
            if($existing){
                if(!hash_equals($existing->checkout_payload_hash,$fingerprint)) throw ValidationException::withMessages(['quote_key'=>'Este formulario ya generó otra propuesta. Abre un formulario nuevo.']);
                return $existing;
            }
            if($owner->account_status!=='enabled'||!$owner->is_active||$owner->hasPermanentCoverage()){
                throw ValidationException::withMessages(['subscription_plan_id'=>'La cuenta debe estar habilitada y no tener cobertura permanente.']);
            }
            $phone=preg_replace('/\D/','',$data['phone']);
            $payment=PaymentRequest::create(array_merge($billing,collect($totals)->except('total')->all(),[
                'user_id'=>$owner->id,'subscription_plan_id'=>$plan->id,'name'=>$owner->name,'email'=>$owner->email,
                'phone'=>'+'.(strlen($phone)===9?'51'.$phone:$phone),'amount'=>$totals['total'],'charge_amount'=>$totals['total'],
                'currency'=>'PEN','status'=>'pending','payment_method'=>'culqi','token'=>Str::random(32),
                'checkout_key'=>$key,'checkout_payload_hash'=>$fingerprint,
                'plan_snapshot'=>[
                    'name'=>$plan->name,'type'=>'lifetime','duration_text'=>'De por vida','duration_days'=>null,'duration_months'=>null,
                    'billing_cycle'=>'lifetime','features'=>$plan->features,'max_users'=>$plan->max_users,'max_projects'=>$plan->max_projects,
                    'plan_total'=>$net/100,'service_total'=>$net/100,'processing'=>$processing['details'],
                    'processing_fee'=>round($totals['total']-$net/100,2),'total'=>$totals['total'],
                    'lifetime_quote'=>['created_by'=>auth()->id(),'net_amount'=>$net/100,'valid_until'=>now()->addDays(7)->toIso8601String()],
                ],
            ]));
            PaymentEvent::record($payment,'lifetime_quoted','admin:'.auth()->id(),['amount'=>$totals['total'],'currency'=>'PEN']);
            return $payment;
        });
        return redirect()->route('payments.admin.show',$payment)->with('success','Propuesta creada. El cliente la encontrará en Mi plan y pagos. Solo un cobro confirmado por Culqi activa la cobertura.');
    }

    private function authorizeAccount(User $user): void
    {
        abort_unless(auth()->user()?->canManageUsers(),403);
        abort_if($user->hasRole('root')&&!auth()->user()->hasRole('root'),403);
        abort_if($user->account_status!=='enabled',422,'Primero habilita esta cuenta.');
    }
}
