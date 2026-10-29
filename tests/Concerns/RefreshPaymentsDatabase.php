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
        // Legacy payment regression cases keep their original tariff. Processing-price tests enable the new policy explicitly.
        config(['payments.processing.enabled' => false]);
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
                'database/migrations/2026_10_22_000008_create_complaints_table.php',
                'database/migrations/2026_10_22_000009_add_currency_changes_and_backups.php',
                'database/migrations/2026_10_22_000010_add_project_restore_generation.php',
                'database/migrations/2026_10_23_000011_add_personal_profile_to_users.php',
                'database/migrations/2026_10_28_000012_create_showcase_videos_table.php',
                'database/migrations/2026_10_28_000013_create_media_table.php',
                'database/migrations/2026_10_28_000014_set_trial_plans_to_five_days.php',
                'database/migrations/2026_10_28_000015_add_youtube_to_showcase_videos.php',
                'database/migrations/2026_10_28_000016_add_account_access_control.php',
                'database/migrations/2026_03_24_205903_create_memoria_calculos_table.php',
                'database/migrations/2026_03_24_205941_create_memoria_imagenes_table.php',
                'database/migrations/2026_05_14_150725_create_memorias_descriptivas_table.php',
                'database/migrations/2026_07_14_120000_create_cad_models_table.php',
                'database/migrations/2026_08_27_211928_add_cad_model_id_to_memoria_calculos_and_descriptivas_table.php',
            ],
        ];
    }
}
