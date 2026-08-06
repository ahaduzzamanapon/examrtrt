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
            $table->string('exam_goal', 50)->index();   // ssc, hsc, bcs ...
            $table->string('exam_type', 100)->nullable(); // "BCS", "45th BCS Prelim"
            $table->string('board_year', 150)->nullable(); // "৪৫তম বিসিএস প্রিলিমিনারি"
            $table->string('subject', 150)->nullable();
            $table->text('question');
            $table->string('image_url', 500)->nullable();
            $table->string('option_a');
            $table->string('option_b');
            $table->string('option_c');
            $table->string('option_d');
            $table->enum('correct_option', ['a', 'b', 'c', 'd']);
            $table->text('explanation')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'high'])->default('medium');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
