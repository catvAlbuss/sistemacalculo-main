<?php

namespace App\Services;

use App\Models\BillingReceipt;
use App\Models\PaymentRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class Billing
{
    public function breakdown(float $total, ?float $rate = null): array
    {
        $rate ??= (float) config('billing.igv_rate', 18);
        if (!is_finite($rate) || $rate < 0 || $rate > 100 || !is_finite($total) || $total < 0) {
            throw new \InvalidArgumentException('Importe o tasa de IGV inválidos.');
        }
        $cents = (int) round($total * 100);
        $subtotal = (int) round($cents * 100 / (100 + $rate));

        return ['subtotal' => $subtotal / 100, 'tax_rate' => $rate, 'tax_amount' => ($cents - $subtotal) / 100, 'total' => $cents / 100];
    }

    public function validate(Request $request): array
    {
        $type = $request->input('document_type');

        $data = $request->validate([
            'receipt_type' => ['required', 'in:boleta,factura'],
            'document_type' => ['required', Rule::in($request->input('receipt_type') === 'factura' ? ['RUC'] : ['DNI'])],
            'document_number' => ['required', 'string', $type === 'RUC' ? 'regex:/^[0-9]{11}$/' : 'regex:/^[0-9]{8}$/'],
            'billing_address' => ['nullable', Rule::requiredIf($request->input('receipt_type') === 'factura'), 'string', 'max:255'],
            'billing_ubigeo' => ['nullable', Rule::requiredIf($request->input('receipt_type') === 'factura' && $request->input('checkout_form_version') === '3'), 'string', 'regex:/^[0-9]{6}$/', 'exists:ubigeos,codigo'],
        ], [
            'receipt_type.required' => 'Selecciona boleta o factura.',
            'document_type.in' => 'Selecciona RUC para factura o DNI para boleta.',
            'document_number.required' => 'Ingresa el DNI o RUC del receptor.',
            'document_number.regex' => 'El DNI debe tener 8 dígitos y el RUC 11 dígitos.',
            'billing_address.required' => 'Ingresa la dirección de facturación para la factura.',
            'billing_ubigeo.required' => 'Selecciona el distrito del domicilio fiscal.',
            'billing_ubigeo.exists' => 'Selecciona un ubigeo del catálogo.',
        ]);

        // Contact and billing share one identity; never trust a second recipient from the request.
        $location = !empty($data['billing_ubigeo']) ? \App\Models\Ubigeo::findOrFail($data['billing_ubigeo'])->toArray() : null;
        return array_merge($data, ['billing_location' => $location, 'billing_name' => $request->input('name'), 'billing_email' => $request->input('email')]);
    }

    /** Called inside the payment's locked transaction. Old payments without billing data are left unchanged. */
    public function issue(PaymentRequest $payment): ?BillingReceipt
    {
        if ($payment->status !== 'approved' || !$payment->receipt_type || !$payment->document_number || !$payment->billing_name) {
            return null;
        }

        $totals = $payment->subtotal !== null && $payment->tax_amount !== null && $payment->tax_rate !== null
            ? ['subtotal' => $payment->subtotal, 'tax_amount' => $payment->tax_amount, 'tax_rate' => $payment->tax_rate]
            : $this->breakdown((float) $payment->amount);
        $snapshot = $payment->plan_snapshot ?? [];
        $description = ($snapshot['name'] ?? $payment->plan->name).' · '.($snapshot['duration_text'] ?? $payment->plan->duration_text);
        if (isset($snapshot['max_users'], $snapshot['max_projects'])) {
            $description .= ' · '.$snapshot['max_users'].' usuario(s) · '.$snapshot['max_projects'].' proyectos';
        }

        return $payment->receipt()->firstOrCreate([], [
            'number' => 'INT-'.str_pad((string) $payment->id, 8, '0', STR_PAD_LEFT),
            'receipt_type' => $payment->receipt_type,
            'document_type' => $payment->document_type,
            'document_number' => $payment->document_number,
            'customer_name' => $payment->billing_name,
            'customer_address' => $payment->billing_address,
            'customer_location' => $payment->billing_location,
            'customer_email' => $payment->billing_email ?: $payment->email,
            'issuer' => config('billing.issuer'),
            'description' => mb_substr($description, 0, 255),
            'currency' => 'PEN', 'total' => $payment->amount,
            'subtotal' => $totals['subtotal'], 'tax_rate' => $totals['tax_rate'], 'tax_amount' => $totals['tax_amount'],
            'charge_id' => $payment->gateway_charge_id,
            'issued_at' => $payment->confirmed_at,
            'electronic_status' => 'not_sent',
        ]);
    }
}
