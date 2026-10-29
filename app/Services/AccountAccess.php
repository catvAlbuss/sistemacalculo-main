<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AccountAccess
{
    public const MAX_SESSIONS = 2;
    public const LIMIT_MESSAGE = 'Se detectó un tercer acceso simultáneo. Cerramos todas las sesiones para proteger tu cuenta personal. Vuelve a iniciar sesión y cambia tu contraseña si no reconoces estos accesos.';

    public function register(User $user, Request $request): bool
    {
        if (!$request->hasSession()) {
            $request->setLaravelSession(app('session.store'));
        }
        // Lock the account, not the PHP session: simultaneous logins must share the same limit.
        $token = DB::transaction(function () use ($user, $request) {
            $locked = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            if ($locked->account_status !== 'enabled') {
                return null;
            }
            DB::table('account_sessions')->where('user_id', $locked->id)
                ->where('last_seen_at', '<', now()->subMinutes(config('session.lifetime', 120)))->delete();
            $existing = $request->session()->get('account_session');
            if ($existing && DB::table('account_sessions')->where('id', $existing)->where('user_id', $locked->id)->where('version', $locked->session_version)->exists()) {
                return [$existing, $locked->session_version];
            }
            if (DB::table('account_sessions')->where('user_id', $locked->id)->count() >= self::MAX_SESSIONS) {
                $this->revoke($locked);
                $this->record($locked, 'concurrent_access', self::LIMIT_MESSAGE);
                return null;
            }
            $token = (string) Str::uuid();
            DB::table('account_sessions')->insert(['id' => $token, 'user_id' => $locked->id,
                'version' => $locked->session_version, 'last_seen_at' => now(), 'created_at' => now(), 'updated_at' => now()]);
            return [$token, $locked->session_version];
        });
        if (!$token) {
            return false;
        }
        $request->session()->put(['account_session' => $token[0], 'account_session_version' => $token[1], 'account_session_user' => $user->id]);
        return true;
    }

    // Caller holds the user row lock. Never clear payment history when revoking access.
    public function revoke(User $user): void
    {
        $user->forceFill(['session_version' => $user->session_version + 1, 'remember_token' => Str::random(60)])->save();
        DB::table('account_sessions')->where('user_id', $user->id)->delete();
        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
        }
    }

    public function record(User $user, string $type, string $message, ?int $actor = null): void
    {
        DB::table('account_security_events')->insert(['user_id' => $user->id, 'actor_id' => $actor,
            'type' => $type, 'message' => $message, 'created_at' => now()]);
    }
}
