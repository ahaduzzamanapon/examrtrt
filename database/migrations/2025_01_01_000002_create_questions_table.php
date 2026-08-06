<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->string('subject', 100);
            $table->string('exam_type', 50);
            $table->string('board_year', 100);
            $table->enum('difficulty_level', ['MEDIUM', 'HIGH'])->default('HIGH');
            $table->text('question_text');
            $table->string('image_url', 500)->nullable();
            $table->json('options'); // {"a": "...", "b": "...", "c": "...", "d": "..."}
            $table->string('correct_answer', 10);
            $table->text('explanation');
            $table->tinyInteger('is_ai_generated')->default(1);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
