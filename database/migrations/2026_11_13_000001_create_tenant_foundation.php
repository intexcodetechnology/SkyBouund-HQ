<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            throw new RuntimeException('Tenant foundation requires MySQL.');
        }

        Schema::create('organisations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->timestampsTz();
        });
        Schema::create('branches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organisation_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->timestampsTz();
            $table->unique(['organisation_id', 'id']);
            $table->unique(['organisation_id', 'name']);
        });
        // Membership is provisioned by a privileged administrative process only.
        // The web role receives SELECT, never INSERT/UPDATE/DELETE, on this table.
        Schema::create('branch_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->uuid('organisation_id');
            $table->uuid('branch_id');
            $table->boolean('active')->default(true);
            $table->timestampsTz();
            $table->foreign(['organisation_id', 'branch_id'])->references(['organisation_id', 'id'])->on('branches')->restrictOnDelete();
            $table->unique(['user_id', 'organisation_id', 'branch_id']);
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('branch_memberships');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('organisations');
    }
};
