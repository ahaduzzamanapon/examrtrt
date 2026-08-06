<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->nullable()->constrained('exams')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->json('answers')->nullable(); // {question_id: selected_option_key}
            $table->decimal('score', 8, 2)->default(0.00);
            $table->integer('time_taken_sec')->default(0);
            $table->integer('warning_count')->default(0);
            $table->tinyInteger('is_disqualified')->default(0);
            $table->integer('rank')->nullable(); // filled after processing
            $table->timestamp('submitted_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_submissions');
    }
};
