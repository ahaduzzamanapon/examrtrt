<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('questions');
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->string('exam_goal', 50)->index();     // 'bcs', 'hsc', 'ssc' etc.
            $table->string('exam_type', 150)->nullable();  // "BCS", "45th BCS"
            $table->string('board_year', 200)->nullable(); // "৪৫তম বিসিএস প্রিলিমিনারি"
            $table->string('subject', 200)->nullable();
            $table->text('question_text');
            $table->string('image_url', 500)->nullable();
            $table->json('options');                       // {"a":"..","b":"..","c":"..","d":".."}
            $table->enum('correct_answer', ['a','b','c','d']);
            $table->text('explanation')->nullable();
            $table->enum('difficulty_level', ['LOW','MEDIUM','HIGH'])->default('MEDIUM');
            $table->boolean('is_ai_generated')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
