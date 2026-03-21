<?php

namespace App\Http\Controllers;

use App\Mail\SolicitudAdmin;
use App\Mail\SolicitudCliente;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;


class ContactPaymentController extends Controller
{
    /**
     * Display a listing of the resource.resources/views/landing/contact.blade.php
     */
    public function index()
    {
        $plans = Subscription::active()->ordered()->get();

        return view('landing.contact', compact('plans'));
    }

    /**
     * Procesar solicitud de suscripción
     */
    public function store(Request $request)
    {
        //Log::info('datos solicitado', $request->all());
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'subscription_plan_id' => 'required|exists:subscriptions,id',
            'payment_proof' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'message' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'El nombre es obligatorio',
            'email.required' => 'El correo es obligatorio',
            'email.email' => 'Ingrese un correo válido',
            'phone.required' => 'El teléfono es obligatorio',
            'subscription_plan_id.required' => 'Debe seleccionar un plan',
            'payment_proof.image' => 'El comprobante debe ser una imagen',
            'payment_proof.max' => 'La imagen no debe superar los 2MB',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $plan = Subscription::findOrFail($request->subscription_plan_id);

                // Verificar si el usuario ya existe
                $user = User::where('email', $request->email)->first();

                if (!$user) {
                    // Crear usuario con cuenta de prueba
                    $temporaryPassword = Str::random(12);

                    $user = User::create([
                        'name' => $request->name,
                        'email' => $request->email,
                        'password' => Hash::make($temporaryPassword),
                        'is_active' => true,
                    ]);

                    // Asignar rol por defecto
                    $user->assignRole('cliente');

                    // Crear suscripción de prueba de 10 días
                    $trialSubscription = $user->subscriptions()->create([
                        'subscription_plan_id' => 1,
                        'status' => 'active',
                        'starts_at' => now(),
                        'ends_at' => now()->addDays(10),
                        'amount_paid' => 0,
                        'payment_method' => 'trial',
                        'notes' => 'Cuenta de prueba por 10 días',
                    ]);

                    $user->update([
                        'current_subscription_id' => $trialSubscription->id,
                        'subscription_ends_at' => $trialSubscription->ends_at,
                    ]);
                }

                // Guardar comprobante de pago si existe
                $paymentProofPath = null;
                $uploadedFile = null;

                if ($request->hasFile('payment_proof')) {
                    $paymentProofPath = $request->file('payment_proof')->store('payment_proofs', 'local');
                    $uploadedFile = $request->file('payment_proof');
                }

                // Crear solicitud de pago
                $paymentRequest = PaymentRequest::create([
                    'user_id' => $user->id,
                    'subscription_plan_id' => 1,
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => '+51' . ltrim($request->phone, '0'),
                    'amount' => $plan->price,
                    'payment_proof' => $paymentProofPath,
                    'message' => $request->message,
                    'status' => 'pending',
                    'token' => Str::random(32),
                ]);

                // Enviar correos
                $this->sendEmailNotifications(
                    $user,
                    $plan,
                    $paymentRequest,
                    $uploadedFile,
                    $request->password ?? $temporaryPassword ?? null
                );

                // Enviar notificación a WhatsApp
                $this->sendWhatsAppNotification($paymentRequest);
            });

            return redirect()->route('landing.success')
                ->with('success', '¡Solicitud enviada exitosamente! Revisa tu correo para más información.');
        } catch (\Exception $e) {
            //Log::error('Error al procesar solicitud: ' . $e->getMessage());
            return back()->withInput()
                ->with('error', 'Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.');
        }
    }

    /**
     * Enviar notificaciones por correo
     */
    private function sendEmailNotifications($user, $plan, $paymentRequest, $uploadedFile = null, $password = null)
    {
        // 1. Email al cliente (Usando Mailable)
        $mailableClient = new SolicitudCliente($user, $plan, $paymentRequest, $password);
        Mail::to($user->email)->send($mailableClient);

        // 2. Email al administrador (Usando Mailable) - Con archivo adjunto
        $adminEmail = config('mail.admin_email', 'admon.construyehco@gmail.com');
        $mailableAdmin = new SolicitudAdmin($user, $plan, $paymentRequest, $uploadedFile);
        Mail::to($adminEmail)->send($mailableAdmin);
    }

    /**
     * Enviar notificación a WhatsApp
     */
    private function sendWhatsAppNotification($paymentRequest)
    {
        $whatsappNumber = config('app.whatsapp_number', '51959422042');
        $message = "🔔 *Nueva Solicitud de Pago*\n\n";
        $message .= "👤 *Cliente:* {$paymentRequest->name}\n";
        $message .= "📧 *Email:* {$paymentRequest->email}\n";
        $message .= "📱 *Teléfono:* {$paymentRequest->phone}\n";
        $message .= "📦 *Plan:* {$paymentRequest->plan->name}\n";
        $message .= "💰 *Monto:* S/ {$paymentRequest->amount}\n";

        if ($paymentRequest->payment_proof) {
            $message .= "✅ *Comprobante:* Adjunto en correo\n";
        } else {
            $message .= "⚠️ *Comprobante:* No enviado\n";
        }

        $message .= "\n📊 Verifica los detalles en el panel de administración.";

        // Log::info('WhatsApp notification queued', [
        //     'phone' => $whatsappNumber,
        //     'message' => $message
        // ]);
    }

    // private function sendEmailNotifications($user, $plan, $paymentRequest, $password = null)
    // {
    //     // Email al cliente
    //     Mail::send('emails.payment-request-client', [
    //         'user' => $user,
    //         'plan' => $plan,
    //         'paymentRequest' => $paymentRequest,
    //         'password' => $password,
    //     ], function ($message) use ($user) {
    //         $message->to($user->email)
    //             ->subject('Solicitud de Suscripción Recibida');
    //     });

    //     // Email al administrador 
    //     $adminEmail = config('mail.admin_email', 'admon.construyehco@gmail.com');
    //     Mail::send('emails.payment-request-admin', [
    //         'user' => $user,
    //         'plan' => $plan,
    //         'paymentRequest' => $paymentRequest,
    //     ], function ($message) use ($adminEmail) {
    //         $message->to($adminEmail)
    //             ->subject('Nueva Solicitud de Pago');
    //     });
    // }

    /**
     * Página de éxito
     */
    public function success()
    {
        return view('contacto.success');
    }

    /**
     * Confirmar pago (desde el panel admin)
     */
    public function confirmPayment(Request $request, PaymentRequest $paymentRequest)
    {
        try {
            DB::transaction(function () use ($paymentRequest) {
                $user = $paymentRequest->user;
                $plan = $paymentRequest->plan;

                // Cancelar suscripción de prueba si existe
                $trialSubscription = $user->subscriptions()
                    ->where('status', 'trial')
                    ->first();

                if ($trialSubscription) {
                    $trialSubscription->update(['status' => 'cancelled']);
                }

                // Crear suscripción paga
                $endsAt = $plan->isLifetime() ? null : now()->addDays($plan->duration_days);

                $newSubscription = $user->subscriptions()->create([
                    'subscription_plan_id' => $plan->id,
                    'status' => 'active',
                    'starts_at' => now(),
                    'ends_at' => $endsAt,
                    'amount_paid' => $paymentRequest->amount,
                    'payment_method' => 'yape',
                    'notes' => 'Pago confirmado por administrador',
                ]);

                $user->update([
                    'current_subscription_id' => $newSubscription->id,
                    'subscription_ends_at' => $endsAt,
                    'is_active' => true,
                ]);

                // Actualizar estado de la solicitud
                $paymentRequest->update([
                    'status' => 'approved',
                    'confirmed_at' => now(),
                ]);

                // Enviar email de confirmación
                Mail::send('emails.payment-confirmed', [
                    'user' => $user,
                    'plan' => $plan,
                    'subscription' => $newSubscription,
                ], function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('¡Pago Confirmado! Tu suscripción está activa');
                });
            });

            return redirect()->back()
                ->with('success', 'Pago confirmado exitosamente. El usuario ha sido notificado.');
        } catch (\Exception $e) {
            //Log::error('Error al confirmar pago: ' . $e->getMessage());
            return back()->with('error', 'Error al confirmar el pago.');
        }
    }
}
