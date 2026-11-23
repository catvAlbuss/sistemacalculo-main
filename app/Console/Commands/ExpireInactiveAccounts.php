<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AccountAccess;
use App\Services\PaymentTasks;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Baja automática de cuentas cuyo plan venció y no se renovó.
 *
 * - Día (vencimiento + días − 1): aviso "mañana su cuenta será dada de baja".
 * - Día (vencimiento + días) o después: baja LÓGICA (account_status = deleted, como la baja
 *   administrativa), se cierran sus sesiones y se le avisa. No se borran proyectos ni datos: un
 *   administrador puede reactivar la cuenta.
 *
 * Solo cuentas habilitadas que tuvieron algún plan y no tienen uno vigente; nunca el personal
 * interno (roles de config('subscriptions.roles_protegidos')).
 */
class ExpireInactiveAccounts extends Command
{
    protected $signature = 'accounts:expire {--dry-run}';
    protected $description = 'Avisa un día antes y da de baja (lógica) las cuentas con el plan vencido hace N días sin renovar';

    public function handle(PaymentTasks $tasks, AccountAccess $access): int
    {
        if (!config('subscriptions.baja_automatica', true)) {
            $this->info('Baja automática desactivada (SUBSCRIPTIONS_BAJA_AUTOMATICA=false).');

            return self::SUCCESS;
        }
        $dias = max(1, (int) config('subscriptions.dias_para_baja', 7));
        $protegidos = (array) config('subscriptions.roles_protegidos', ['root', 'gerencia', 'asistente']);
        $simulacion = (bool) $this->option('dry-run');
        $avisos = 0;
        $bajas = 0;

        User::where('account_status', 'enabled')
            ->whereHas('subscriptions')
            ->whereDoesntHave('currentSubscription')
            ->whereDoesntHave('roles', fn ($q) => $q->whereIn('name', $protegidos))
            ->chunkById(100, function ($usuarios) use ($tasks, $access, $dias, $simulacion, &$avisos, &$bajas) {
                foreach ($usuarios as $usuario) {
                    // Último término de plan (el más reciente, vigente o no).
                    $fin = $usuario->subscriptions()->whereNotNull('ends_at')->max('ends_at');
                    if (!$fin) {
                        continue;
                    }
                    $vencio = \Illuminate\Support\Carbon::parse($fin)->startOfDay();
                    // Carbon 3 devuelve días con decimales: se redondea a días enteros.
                    $diasVencido = (int) round($vencio->diffInDays(today(), false));
                    if ($diasVencido === $dias - 1) {
                        $avisos++;
                        if (!$simulacion) {
                            $task = $tasks->create('account_deletion_notice', null,
                                ['user_id' => $usuario->id, 'ends_at' => $vencio->toDateString(), 'baja' => $vencio->copy()->addDays($dias)->toDateString()],
                                'baja-aviso:'.$usuario->id.':'.$vencio->toDateString());
                            $tasks->dispatch($task);
                        }
                    } elseif ($diasVencido >= $dias) {
                        $bajas++;
                        if (!$simulacion) {
                            DB::transaction(function () use ($usuario, $access, $dias) {
                                $u = User::lockForUpdate()->find($usuario->id);
                                if ($u->account_status !== 'enabled' || $u->currentSubscription()->exists()) {
                                    return;
                                }
                                $u->forceFill(['account_status' => 'deleted', 'is_active' => false,
                                    'account_status_reason' => "Baja automática: plan vencido hace {$dias} días sin renovación"])->save();
                                $access->revoke($u);
                                $access->record($u, 'account_expired', "Baja automática tras {$dias} días sin renovar el plan.");
                            });
                            $task = $tasks->create('account_deleted', null, ['user_id' => $usuario->id], 'baja:'.$usuario->id.':'.$vencio->toDateString());
                            $tasks->dispatch($task);
                        }
                    }
                }
            });

        $this->info(($simulacion ? 'Simulación. ' : '')."Avisos de baja: {$avisos}. Bajas: {$bajas}.");

        return self::SUCCESS;
    }
}
