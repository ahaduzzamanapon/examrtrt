<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // FCM token (web browser OR mobile device — same column used for both)
            $table->text('fcm_token')->nullable();
            // Legacy Web Push fields (kept for fallback)
            $table->text('endpoint')->nullable();
            $table->string('p256dh_key', 512)->nullable();
            $table->string('auth_token', 512)->nullable();
            // Device info
            $table->enum('platform', ['WEB', 'ANDROID', 'IOS'])->default('WEB');
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
