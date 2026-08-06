<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->integer('id')->default(1)->primary();
            $table->tinyInteger('ai_generator_active')->default(0);
            $table->integer('daily_practice_limit')->default(5);
            $table->decimal('min_deposit_amount', 10, 2)->default(20.00);
            $table->decimal('min_withdrawal_amount', 10, 2)->default(50.00);
            $table->decimal('withdrawal_fee_percent', 5, 2)->default(2.00);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Seed default row
        DB::table('system_settings')->insert([
            'id' => 1,
            'ai_generator_active' => 0,
            'daily_practice_limit' => 5,
            'min_deposit_amount' => 20.00,
            'min_withdrawal_amount' => 50.00,
            'withdrawal_fee_percent' => 2.00,
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
