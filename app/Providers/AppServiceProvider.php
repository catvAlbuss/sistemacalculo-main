<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Auth\Notifications\ResetPassword::toMailUsing(fn ($user, string $token) => (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Restablecer contraseña')->view('emails.password-reset', [
                'name' => $user->name, 'minutes' => config('auth.passwords.users.expire'),
                'url' => url(route('password.reset', ['token' => $token, 'email' => $user->getEmailForPasswordReset()], false)),
            ]));
        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Logout::class, function ($event) {
            if (request()->hasSession() && $token = request()->session()->get('account_session')) {
                \Illuminate\Support\Facades\DB::table('account_sessions')->where('id', $token)
                    ->where('user_id', $event->user?->id)->delete();
                request()->session()->forget(['account_session', 'account_session_version', 'account_session_user']);
            }
        });
        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\PasswordReset::class, function ($event) {
            \Illuminate\Support\Facades\DB::transaction(function () use ($event) {
                $user = \App\Models\User::whereKey($event->user->id)->lockForUpdate()->firstOrFail();
                app(\App\Services\AccountAccess::class)->revoke($user);
                app(\App\Services\AccountAccess::class)->record($user,'password_reset','Contraseña restablecida. Se cerraron todas las sesiones anteriores.');
            });
        });
        \Livewire\Livewire::addPersistentMiddleware([
            \App\Http\Middleware\CheckSubscription::class,
            \Spatie\Permission\Middleware\RoleMiddleware::class,
            \Spatie\Permission\Middleware\PermissionMiddleware::class,
            \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
        \Illuminate\Support\Facades\RateLimiter::for('culqi-charge', function (\Illuminate\Http\Request $request) {
            $payment = $request->route('paymentRequest');
            $id = is_object($payment) ? $payment->id : (string) $payment;

            return \Illuminate\Cache\RateLimiting\Limit::perMinutes(10, 8)->by('culqi:'.$id.':'.$request->ip());
        });
        // Cálculos (Octave, OpenSeesPy y controladores de hojas): cada POST puede lanzar un proceso.
        // Limita por usuario para que un bucle no sature la CPU del hosting compartido. Las páginas (GET) no cuentan.
        \Illuminate\Support\Facades\RateLimiter::for('calculation', function (\Illuminate\Http\Request $request) {
            return $request->isMethodSafe()
                ? \Illuminate\Cache\RateLimiting\Limit::none()
                : \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by('calc:'.($request->user()?->id ?: $request->ip()));
        });
    }
}
