<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['FREE', 'CONTEST']);
            $table->json('categories'); // ["BCS", "SSC"]
            $table->decimal('entry_fee', 10, 2)->default(0.00);
            $table->integer('total_marks');
            $table->integer('duration_minutes');
            $table->tinyInteger('negative_marking')->default(1);
            $table->decimal('negative_value', 4, 2)->default(0.25);
            $table->integer('anti_cheat_limit')->default(3);
            $table->dateTime('scheduled_at');
            $table->enum('status', ['SCHEDULED', 'LIVE', 'PROCESSING', 'COMPLETED'])->default('SCHEDULED');
            $table->decimal('admin_fee_percent', 5, 2)->default(10.00);
            $table->json('prize_distribution'); // [50.00, 25.00, 15.00]
            $table->json('questions_snapshot');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
