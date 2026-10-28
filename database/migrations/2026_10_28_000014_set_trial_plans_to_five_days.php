<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        foreach (DB::table('subscriptions')->where('type', 'trial')->where('price', 0)->get() as $plan) {
            DB::table('subscriptions')->where('id', $plan->id)->update([
                'duration_days' => 5,
                'description' => str_replace('15 días', '5 días', $plan->description ?? ''),
                'features' => str_replace('15 días', '5 días', $plan->features ?? '[]'),
            ]);
        }
    }

    public function down(): void { /* Commercial history is not rewritten on rollback. */ }
};
