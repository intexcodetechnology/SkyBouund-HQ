<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE product_models ADD CONSTRAINT product_nonnegative_price CHECK (monthly_price >= 0)');
        DB::statement('ALTER TABLE customer_products ADD CONSTRAINT installation_date_order CHECK (installed_on IS NULL OR expires_on IS NULL OR expires_on >= installed_on)');
        DB::statement('ALTER TABLE customer_products ADD CONSTRAINT installation_positive_contract CHECK (contract_months IS NULL OR contract_months > 0)');
        foreach (['customers', 'leads', 'tasks', 'product_models'] as $table) {
            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT {$table}_positive_version CHECK (version > 0)");
        }
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT task_completion_time CHECK ((status = 'completed' AND completed_at IS NOT NULL) OR (status <> 'completed' AND completed_at IS NULL))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE product_models DROP CHECK product_nonnegative_price');
        DB::statement('ALTER TABLE customer_products DROP CHECK installation_date_order');
        DB::statement('ALTER TABLE customer_products DROP CHECK installation_positive_contract');
        foreach (['customers', 'leads', 'tasks', 'product_models'] as $table) {
            DB::statement("ALTER TABLE {$table} DROP CHECK {$table}_positive_version");
        }
        DB::statement('ALTER TABLE tasks DROP CHECK task_completion_time');
    }
};
