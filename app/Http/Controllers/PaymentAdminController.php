<?php

namespace App\Http\Controllers;

use App\Models\PaymentEvent;
use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use Illuminate\Http\Request;

class PaymentAdminController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => 'nullable|in:pending,approved,rejected', 'review' => 'nullable|in:1',
            'search' => 'nullable|string|max:100', 'download' => 'nullable|in:csv',
        ]);
        $payments = PaymentRequest::with('plan')->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where(fn ($group) => $group
                ->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%')
                ->orWhere('gateway_charge_id', 'like', '%'.$search.'%')))
            ->when($request->boolean('review'), fn ($q) => $q->whereHas('events', fn ($events) => $events->where('severity', 'warning')->whereNull('reviewed_at')))
            ->orderByDesc('id');
        if (($filters['download'] ?? '') === 'csv') {
            return response()->streamDownload(function () use ($payments) {
                $file = fopen('php://output', 'w');
                fwrite($file, "\xEF\xBB\xBF");
                fputcsv($file, ['Solicitud', 'Cliente', 'Correo', 'Plan', 'Estado', 'Total PEN', 'Cargo', 'Fecha']);
                $payments->chunk(200, function ($rows) use ($file) {
                    foreach ($rows as $payment) {
                        $values = [$payment->id, $payment->name, $payment->email, $payment->plan_snapshot['name'] ?? $payment->plan->name,
                            $payment->status, $payment->amount, $payment->gateway_charge_id, $payment->created_at->toIso8601String()];
                        fputcsv($file, array_map(fn ($value) => preg_match('/^[\s\x00-\x1f]*[=+@-]/u', (string) $value) ? "'".$value : $value, $values));
                    }
                });
                fclose($file);
            }, 'pagos-'.today()->toDateString().'.csv', ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'private, no-store']);
        }

        return response()->view('planesUser.payments.index', [
            'payments' => $payments->paginate(25)->withQueryString(),
            'pending' => PaymentRequest::where('status', 'pending')->where('payment_method', 'culqi')->count(),
            'reviews' => PaymentEvent::where('severity', 'warning')->whereNull('reviewed_at')->count(),
            'failedTasks' => PaymentTask::where('status', 'failed')->count(),
            'collected' => PaymentRequest::where('status', 'approved')->whereBetween('confirmed_at', [now()->startOfMonth(), now()->endOfMonth()])->sum('amount'),
        ])->header('Cache-Control', 'private, no-store');
    }

    public function show(PaymentRequest $paymentRequest)
    {
        return response()->view('planesUser.payments.show', [
            'payment' => $paymentRequest->load('plan', 'events', 'receipt'),
            'tasks' => PaymentTask::where('payment_request_id', $paymentRequest->id)->latest()->get(),
        ])->header('Cache-Control', 'private, no-store');
    }

    public function review(Request $request, PaymentEvent $event)
    {
        $data = $request->validate(['note' => 'required|string|min:5|max:500']);
        PaymentEvent::whereKey($event->id)->whereNull('reviewed_at')->update([
            'reviewed_by' => $request->user()->id, 'reviewed_at' => now(), 'review_note' => $data['note'],
        ]);

        return back()->with('success', 'Revisión registrada. El estado del pago no se ha modificado.');
    }
}
