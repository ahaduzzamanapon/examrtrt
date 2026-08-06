<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practice_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->json('categories');
            $table->json('questions_snapshot');
            $table->json('answers')->nullable();
            $table->decimal('score', 8, 2)->default(0.00);
            $table->integer('time_taken_sec')->default(0);
            $table->tinyInteger('completed')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['DEPOSIT', 'ENTRY_FEE', 'PRIZE_PAYOUT', 'WITHDRAWAL']);
            $table->decimal('gross_amount', 10, 2);
            $table->decimal('fee', 10, 2)->default(0.00);
            $table->decimal('net_amount', 10, 2);
            $table->string('trx_id')->nullable();
            $table->string('payment_method', 50)->nullable(); // bkash, nagad
            $table->string('payment_number', 50)->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->text('admin_note')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('question_disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('report_reason');
            $table->enum('status', ['PENDING', 'RESOLVED', 'REJECTED'])->default('PENDING');
            $table->text('admin_note')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_disputes');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('practice_tests');
    }
};
