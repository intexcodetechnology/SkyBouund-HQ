<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branch_memberships', function (Blueprint $table) {
            $table->unique(['organisation_id', 'branch_id', 'user_id'], 'membership_scope_user');
        });
        Schema::create('customers', function (Blueprint $table) {
            $this->scoped($table);
            $table->string('display_name');
            $table->string('phone', 20);
            $table->text('ic')->nullable();
            $table->string('ic_last_four', 4)->nullable();
            $table->text('address')->nullable();
            $table->string('legacy_hp_code', 60)->nullable();
            $table->string('lifecycle_status', 40)->default('pending');
            $table->boolean('do_not_call')->default(false);
            $table->unsignedInteger('version')->default(1);
            $table->softDeletesTz();
            $table->index(['organisation_id', 'branch_id', 'display_name'], 'customer_name_scope');
            $table->index(['organisation_id', 'branch_id', 'phone'], 'customer_phone_scope');
        });
        Schema::create('customer_products', function (Blueprint $table) {
            $this->scoped($table);
            $table->uuid('customer_id');
            $table->string('legacy_product_name');
            $table->date('installed_on')->nullable();
            $table->date('expires_on')->nullable();
            $table->unsignedSmallInteger('contract_months')->nullable();
            $table->foreign(['organisation_id', 'branch_id', 'customer_id'], 'installation_customer_scope')->references(['organisation_id', 'branch_id', 'id'])->on('customers')->restrictOnDelete();
        });
        Schema::create('leads', function (Blueprint $table) {
            $this->scoped($table);
            $table->uuid('customer_id');
            $table->string('action_status', 40)->default('new');
            $table->text('remark')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->foreign(['organisation_id', 'branch_id', 'customer_id'], 'lead_customer_scope')->references(['organisation_id', 'branch_id', 'id'])->on('customers')->restrictOnDelete();
            $table->index(['organisation_id', 'branch_id', 'action_status'], 'lead_status_scope');
        });
        Schema::create('tasks', function (Blueprint $table) {
            $this->scoped($table);
            $table->uuid('lead_id');
            $table->unsignedBigInteger('assigned_user_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status', 30)->default('open');
            $table->date('due_on');
            $table->timestamp('completed_at')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->foreign(['organisation_id', 'branch_id', 'lead_id'], 'task_lead_scope')->references(['organisation_id', 'branch_id', 'id'])->on('leads')->restrictOnDelete();
            $table->foreign(['organisation_id', 'branch_id', 'assigned_user_id'], 'task_assignee_scope')->references(['organisation_id', 'branch_id', 'user_id'])->on('branch_memberships')->restrictOnDelete();
            $table->index(['organisation_id', 'branch_id', 'status', 'due_on'], 'task_due_scope');
        });
        Schema::create('product_categories', function (Blueprint $table) {
            $this->scoped($table, false);
            $table->string('name', 100);
            $table->unique(['organisation_id', 'name']);
        });
        Schema::create('product_models', function (Blueprint $table) {
            $this->scoped($table, false);
            $table->uuid('category_id');
            $table->string('name');
            $table->string('model_code', 60);
            $table->decimal('monthly_price', 12, 2);
            $table->char('currency', 3)->default('MYR');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('version')->default(1);
            $table->unique(['organisation_id', 'model_code']);
            $table->foreign(['organisation_id', 'category_id'])->references(['organisation_id', 'id'])->on('product_categories')->restrictOnDelete();
        });
        Schema::create('audit_events', function (Blueprint $table) {
            $this->scoped($table);
            $table->foreignId('actor_user_id')->constrained('users')->restrictOnDelete();
            $table->string('action', 100);
            $table->string('entity_type', 80);
            $table->uuid('entity_id')->nullable();
            $table->json('metadata')->nullable();
            $table->index(['organisation_id', 'branch_id', 'created_at'], 'audit_scope_time');
        });
    }

    private function scoped(Blueprint $table, bool $branch = true): void
    {
        $table->uuid('id')->primary();
        $table->foreignUuid('organisation_id')->constrained()->restrictOnDelete();
        if ($branch) {
            $table->uuid('branch_id');
            $table->foreign(['organisation_id', 'branch_id'])->references(['organisation_id', 'id'])->on('branches')->restrictOnDelete();
            $table->unique(['organisation_id', 'branch_id', 'id']);
        } else {
            $table->unique(['organisation_id', 'id']);
        }
        $table->timestampsTz();
    }

    public function down(): void
    {
        foreach (['audit_events', 'product_models', 'product_categories', 'tasks', 'leads', 'customer_products', 'customers'] as $table) {
            Schema::dropIfExists($table);
        }
        // InnoDB may choose the newer covering index for the pre-existing branch FK.
        Schema::table('branch_memberships', fn (Blueprint $table) => $table->dropForeign(['organisation_id', 'branch_id']));
        Schema::table('branch_memberships', fn (Blueprint $table) => $table->dropUnique('membership_scope_user'));
        Schema::table('branch_memberships', fn (Blueprint $table) => $table->foreign(['organisation_id', 'branch_id'])->references(['organisation_id', 'id'])->on('branches')->restrictOnDelete());
    }
};
