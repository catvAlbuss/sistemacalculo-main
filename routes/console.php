<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('payments:dispatch-pending')->everyMinute()->withoutOverlapping();
Schedule::command('payments:reconcile')->everyFiveMinutes()->withoutOverlapping();
// Sin daemons en hosting compartido: cada minuto se vacía la cola y el proceso termina.
Schedule::command('queue:work', ['media', '--queue=media', '--stop-when-empty', '--tries=2', '--timeout=900'])->everyMinute()->withoutOverlapping(20)->runInBackground();
Schedule::command('subscriptions:remind')->dailyAt('08:30')->timezone('America/Lima')->withoutOverlapping();
Schedule::command('tipo-cambio:actualizar')->dailyAt('09:15')->timezone('America/Lima')->withoutOverlapping();
Schedule::command('project-backups:daily')->dailyAt('02:00')->timezone('America/Lima')->withoutOverlapping()->when(fn () => config('features.project_backups'));
Schedule::command('model:prune', ['--model' => [\App\Models\DocumentRecord::class]])->dailyAt('03:00')->timezone('America/Lima')->withoutOverlapping();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
