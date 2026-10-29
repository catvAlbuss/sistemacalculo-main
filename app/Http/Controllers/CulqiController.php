<?php

namespace App\Http\Controllers;

use App\Models\PaymentRequest;
use App\Services\Culqi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class CulqiController extends Controller
{
    public static function paymentUrl(PaymentRequest $payment): string
    {
        return URL::temporarySignedRoute('culqi.pay', now()->addDay(), ['paymentRequest' => $payment->id]);
    }

    public function pay(PaymentRequest $paymentRequest, Culqi $culqi, Request $request)
    {
        if (isset($paymentRequest->plan_snapshot['lifetime_quote']) && !$request->user()) {
            return redirect()->guest(route('login'));
        }
        abort_unless($paymentRequest->payment_method === 'culqi', 404);
        abort_if($request->user() && $request->user()->id !== $paymentRequest->user_id, 403);
        $expiry = min(now()->addDay()->timestamp, (int) $request->query('expires', now()->addDay()->timestamp));

        return response()->view('landing.culqi', [
            'payment' => $paymentRequest->load('plan'),
            'enabled' => $culqi->enabled() && !$this->expiredQuote($paymentRequest),
            'offerExpired' => $this->expiredQuote($paymentRequest),
            'publicKey' => config('services.culqi.public_key'),
            'chargeUrl' => URL::temporarySignedRoute('culqi.charge', \Illuminate\Support\Carbon::createFromTimestamp($expiry), ['paymentRequest' => $paymentRequest->id]),
            'receiptUrl' => $paymentRequest->receipt()->first()?->ticketUrl(),
        ])->header('Referrer-Policy', 'no-referrer')->header('Cache-Control', 'private, no-store');
    }

    public function charge(Request $request, PaymentRequest $paymentRequest, Culqi $culqi)
    {
        if (isset($paymentRequest->plan_snapshot['lifetime_quote'])) {
            abort_unless($request->user() && $request->user()->id === $paymentRequest->user_id, 403);
            $request->validate(['accept_terms'=>'required|accepted'],['accept_terms.accepted'=>'Acepta las condiciones antes de pagar.']);
            \Illuminate\Support\Facades\DB::transaction(function() use($paymentRequest){
                $row=PaymentRequest::whereKey($paymentRequest->id)->lockForUpdate()->firstOrFail();
                if($row->status==='pending' && empty($row->plan_snapshot['legal_acceptance'])) {
                    $row->update(['plan_snapshot'=>array_merge($row->plan_snapshot,['legal_acceptance'=>app(\App\Services\LegalDocuments::class)->acceptance()])]);
                    \App\Models\PaymentEvent::record($row,'legal_accepted',config('legal.version'));
                }
            });
        }
        abort_unless($culqi->enabled(), 503, 'El pago en línea no está disponible.');
        abort_if($request->user() && $request->user()->id !== $paymentRequest->user_id, 403);
        $data = $request->validate([
            'token' => ['required', 'string', 'max:100', 'regex:/^(tkn|ype)_(test|live)_[A-Za-z0-9_]+$/'],
            'device_id' => [\Illuminate\Validation\Rule::requiredIf($paymentRequest->checkout_key && is_string($request->input('token')) && str_starts_with($request->input('token'), 'tkn_')), 'nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/'],
            'authentication_3DS' => ['sometimes', 'array:eci,xid,cavv,protocolVersion,directoryServerTransactionId'],
            'authentication_3DS.eci' => ['required_with:authentication_3DS', 'string', 'max:10'],
            'authentication_3DS.xid' => ['required_with:authentication_3DS', 'string', 'max:255'],
            'authentication_3DS.cavv' => ['required_with:authentication_3DS', 'string', 'max:255'],
            'authentication_3DS.protocolVersion' => ['required_with:authentication_3DS', 'string', 'max:20'],
            'authentication_3DS.directoryServerTransactionId' => ['sometimes', 'string', 'max:100'],
        ]);
        $test = str_starts_with((string) config('services.culqi.public_key'), 'pk_test_');
        abort_unless(preg_match($test ? '/^(tkn|ype)_test_/' : '/^(tkn|ype)_live_/', $data['token']), 422);
        $result = $culqi->charge($paymentRequest, $data);
        if ($result['ok']) {
            $result['receipt_url'] = $paymentRequest->receipt()->first()?->ticketUrl();
        }

        return response()->json($result, $result['ok'] ? 200 : 422);
    }

    public function webhook(Request $request, string $token, Culqi $culqi)
    {
        $secret = (string) config('services.culqi.webhook_token');
        abort_unless($secret !== '' && hash_equals($secret, $token), 403);
        abort_unless($culqi->configurationErrors() === [], 503);
        if ($request->input('type') !== 'charge.creation.succeeded') {
            return response()->json(['received' => true]);
        }
        $data = $request->input('data');
        $data = is_string($data) ? json_decode($data, true) : $data;
        $id = is_array($data) ? ($data['id'] ?? null) : null;
        if (!is_string($id) || strlen($id) > 100 || !preg_match('/^chr_[A-Za-z0-9_]+$/', $id)) {
            return response()->json(['received' => true]);
        }
        // Persist before acknowledging. Only the queue consults and trusts Culqi's own response.
        $tasks = app(\App\Services\PaymentTasks::class);
        $task = $tasks->create('webhook', null, ['charge_id' => $id]);
        $tasks->dispatch($task);

        return response()->json(['received' => true, 'queued' => true]);
    }

    public function cancel(Request $request, PaymentRequest $paymentRequest)
    {
        abort_unless($paymentRequest->user_id === $request->user()->id && $paymentRequest->payment_method === 'culqi', 404);
        $lock = \Illuminate\Support\Facades\Cache::lock('culqi:payment:'.$paymentRequest->id, 120);
        if (!$lock->get()) {
            return back()->withErrors(['payment' => 'El pago se está procesando. Revisa el resultado antes de cerrar la solicitud.']);
        }
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($paymentRequest) {
                $row = PaymentRequest::whereKey($paymentRequest->id)->lockForUpdate()->firstOrFail();
                if ($row->status !== 'pending') { return; }
                if ($row->gateway_charge_id || !in_array($row->gateway_state, [null, 'declined', 'authentication'], true)) {
                    throw \Illuminate\Validation\ValidationException::withMessages(['payment' => 'El cobro tiene un resultado pendiente de verificar. No puede cerrarse ni repetirse.']);
                }
                $row->update(['status' => 'rejected', 'gateway_state' => 'cancelled', 'rejected_at' => now(),
                    'gateway_context' => null, 'rejection_reason' => 'Solicitud cerrada por su titular antes de cobrar.']);
                app(\App\Services\PlanChanges::class)->release($row);
                \App\Models\PaymentEvent::record($row, 'cancelled_unpaid');
            });
        } finally { $lock->release(); }
        return back()->with('success', 'Solicitud cerrada sin efectuar un cobro ni una devolución.');
    }

    private function expiredQuote(PaymentRequest $payment): bool
    {
        $until=$payment->plan_snapshot['lifetime_quote']['valid_until'] ?? null;
        return $payment->status==='pending' && $until && \Illuminate\Support\Carbon::parse($until)->isPast();
    }
}
