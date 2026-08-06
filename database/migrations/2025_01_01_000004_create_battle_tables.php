<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('battle_invites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('stake_amount', 10, 2)->default(0.00); // 0, 10, or 20 BDT
            $table->enum('status', ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'])->default('PENDING');
            $table->json('questions_snapshot');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('battle_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invite_id')->constrained('battle_invites')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->integer('sender_score')->default(0);
            $table->integer('receiver_score')->default(0);
            $table->integer('current_question_index')->default(0);
            $table->enum('status', ['ACTIVE', 'COMPLETED', 'FORFEITED'])->default('ACTIVE');
            $table->foreignId('winner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('battle_sessions');
        Schema::dropIfExists('battle_invites');
    }
};
