<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('payments:dispatch-pending')->everyMinute()->withoutOverlapping();
Schedule::command('payments:reconcile')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('subscriptions:remind')->dailyAt('08:30')->timezone('America/Lima')->withoutOverlapping();
Schedule::command('tipo-cambio:actualizar')->dailyAt('09:15')->timezone('America/Lima')->withoutOverlapping();
Schedule::command('project-backups:daily')->dailyAt('02:00')->timezone('America/Lima')->withoutOverlapping();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
