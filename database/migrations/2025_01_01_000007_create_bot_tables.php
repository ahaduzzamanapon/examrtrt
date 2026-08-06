<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bot_knowledge_base', function (Blueprint $table) {
            $table->id();
            $table->string('category', 50); // PLATFORM_GUIDE, CHIT_CHAT, EXAM_RULES
            $table->json('keywords'); // ["1v1", "battle", "এক এক লড়াই"]
            $table->text('question_pattern');
            $table->text('answer_text');
            $table->tinyInteger('is_admin_verified')->default(1);
            $table->timestamps();
        });

        Schema::create('bot_chat_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('user_message');
            $table->text('bot_response');
            $table->text('admin_corrected_response')->nullable();
            $table->tinyInteger('is_reviewed')->default(0);
            $table->tinyInteger('is_fed_to_model')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bot_chat_logs');
        Schema::dropIfExists('bot_knowledge_base');
    }
};
