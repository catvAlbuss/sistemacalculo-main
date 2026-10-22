<?php

namespace Tests\Concerns;

use Illuminate\Foundation\Testing\RefreshDatabase;

trait RefreshPaymentsDatabase
{
    use RefreshDatabase {
        refreshDatabase as private refreshPaymentDatabase;
    }

    public function refreshDatabase(): void
    {
        // Payment tests never migrate or truncate the local business database.
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        config(['payments.queue_connection' => 'sync']);
        $this->refreshPaymentDatabase();
    }

    protected function migrateFreshUsing(): array
    {
        return [
            '--path' => [
                'database/migrations/0001_01_01_000000_create_users_table.php',
                'database/migrations/0001_01_01_000002_create_jobs_table.php',
                'database/migrations/2025_10_13_221136_create_permission_tables.php',
                'database/migrations/2025_10_13_232203_create_subscriptions_table.php',
                'database/migrations/2025_10_13_235518_create_user_subscriptions_table.php',
                'database/migrations/2025_10_14_000514_add_subscription_fields_to_users_table.php',
                'database/migrations/2025_10_15_005705_payment_requests.php',
                'database/migrations/2026_10_14_000001_add_culqi_to_payment_requests.php',
                'database/migrations/2026_10_14_000002_add_billing_receipts.php',
                'database/migrations/2026_10_14_000003_add_tax_breakdown_to_payments.php',
                'database/migrations/2026_10_14_000004_harden_payment_processing.php',
                'database/migrations/2026_10_16_000005_add_plan_capacity.php',
                'database/migrations/2026_10_21_000006_add_payment_events.php',
                'database/migrations/2026_10_21_000007_add_billing_ubigeo.php',
            ],
        ];
    }
}
