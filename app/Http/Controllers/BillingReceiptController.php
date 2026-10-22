<?php

namespace App\Http\Controllers;

use App\Models\BillingReceipt;
use Illuminate\Http\Request;

class BillingReceiptController extends Controller
{
    public function show(Request $request, BillingReceipt $receipt)
    {
        $owner = $request->user() && $request->user()->id === $receipt->paymentRequest->user_id;
        abort_unless($owner || $request->hasValidSignature(), 403);

        return response()->view('billing.ticket', compact('receipt'))
            ->header('Cache-Control', 'private, no-store')
            ->header('Referrer-Policy', 'no-referrer')
            ->header('X-Robots-Tag', 'noindex, nofollow');
    }
}
