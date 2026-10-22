<?php

namespace App\Console\Commands;

use App\Models\UserSubscription;
use App\Services\PaymentTasks;
use Illuminate\Console\Command;

class RemindSubscriptionRenewals extends Command
{
    protected $signature = 'subscriptions:remind {--dry-run}';
    protected $description = 'Encola avisos de vencimiento a 10, 5, 2 y 1 días, sin suspender ni borrar datos';

    public function handle(PaymentTasks $tasks): int
    {
        $count = 0;
        foreach ([10, 5, 2, 1] as $days) {
            UserSubscription::where('status', 'active')->where('starts_at', '<=', now())
                ->whereDate('ends_at', today()->addDays($days))->with('user')->chunkById(100, function ($subscriptions) use ($tasks, $days, &$count) {
                    foreach ($subscriptions as $subscription) {
                        if (!$subscription->user->is_active || $subscription->user->currentSubscription?->id !== $subscription->id
                            || $subscription->user->subscriptions()->where('status', 'active')->where('amount_paid', '>', 0)
                                ->whereKeyNot($subscription->id)->where('starts_at', '>=', $subscription->ends_at)->exists()) {
                            continue;
                        }
                        $count++;
                        if (!$this->option('dry-run')) {
                            $identity = $subscription->id.':'.$subscription->ends_at->toDateString().':'.$days;
                            $task = $tasks->create('renewal_reminder', null, [
                                'subscription_id' => $subscription->id, 'ends_at' => $subscription->ends_at->toDateString(),
                            ], $identity);
                            $tasks->dispatch($task);
                        }
                    }
                });
        }
        $this->info(($this->option('dry-run') ? 'Simulación. ' : '').'Avisos previstos: '.$count);

        return self::SUCCESS;
    }
}
