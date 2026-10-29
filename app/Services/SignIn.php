<?php

namespace App\Services;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SignIn
{
    public function authenticate(string $email, string $password, bool $remember, string $field = 'email'): void
    {
        $email = Str::lower(trim($email));
        $key = Str::transliterate($email.'|'.request()->ip());
        if (RateLimiter::tooManyAttempts($key, 5)) {
            event(new Lockout(request()));
            throw ValidationException::withMessages([$field => 'Demasiados intentos. Vuelve a intentarlo en '.RateLimiter::availableIn($key).' segundos.']);
        }
        if (!Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
            RateLimiter::hit($key);
            throw ValidationException::withMessages([$field => 'No pudimos iniciar sesión. Verifica el correo y la contraseña.']);
        }
        RateLimiter::clear($key);
        if (Auth::user()->account_status !== 'enabled') {
            Auth::logout();
            throw ValidationException::withMessages([$field => 'Esta cuenta está bloqueada o dada de baja. Contacta con soporte.']);
        }
        if (!app(AccountAccess::class)->register(Auth::user(), request())) {
            Auth::logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();
            throw ValidationException::withMessages([$field => AccountAccess::LIMIT_MESSAGE]);
        }
    }
}
