<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('model_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('goal', 50);
            $table->string('stream', 50)->nullable();
            $table->string('subject', 100)->nullable();
            $table->integer('question_count')->default(20);
            $table->integer('duration_minutes')->default(20);
            $table->boolean('negative_marking')->default(false);
            $table->decimal('negative_value', 4, 2)->default(0.25);
            $table->json('questions_snapshot');
            $table->json('answers')->nullable();
            $table->decimal('score', 8, 2)->default(0.00);
            $table->integer('total_marks')->default(20);
            $table->integer('time_taken_sec')->default(0);
            $table->boolean('completed')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('model_tests');
    }
};
