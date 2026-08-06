<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add token_balance to users
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('token_balance')->default(0)->after('free_contest_passes');
        });

        // Token transactions — full history of every earn/spend
        Schema::create('token_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->enum('type', [
                'DAILY_BONUS',    // প্রতিদিন বিনামূল্যে
                'REFERRAL',       // বন্ধু রেফার করলে
                'AD_VIEW',        // বিজ্ঞাপন দেখলে
                'PURCHASE',       // টাকা দিয়ে কিনলে
                'STREAK_BONUS',   // ধারাবাহিকতা বোনাস
                'PRACTICE_SPEND', // প্র্যাকটিস টেস্ট খরচ
                'EXAM_SPEND',     // মডেল টেস্ট খরচ
                'ADMIN_GRANT',    // অ্যাডমিন কর্তৃক প্রদান
            ]);

            $table->integer('amount');               // positive = earn, negative = spend
            $table->unsignedInteger('balance_after'); // snapshot after transaction
            $table->string('description')->nullable();
            $table->string('reference_id')->nullable(); // e.g. exam_id, ad_id
            $table->json('meta')->nullable();            // extra data
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('type');
        });

        // Daily token claim tracker — prevents double-claiming
        Schema::create('daily_token_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('claimed_date');
            $table->unsignedInteger('tokens_earned')->default(10);
            $table->timestamps();
            $table->unique(['user_id', 'claimed_date']);
        });

        // Ad view tracker — limits ad views per day per user
        Schema::create('ad_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('ad_id')->nullable();
            $table->unsignedInteger('tokens_earned')->default(5);
            $table->date('view_date');
            $table->timestamps();
            $table->index(['user_id', 'view_date']);
        });

        // Token packages — configurable from admin
        Schema::create('token_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');               // e.g. "ছোট প্যাক"
            $table->unsignedInteger('tokens');    // 100
            $table->decimal('price', 8, 2);       // ৳10.00
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('token_balance'));
        Schema::dropIfExists('ad_views');
        Schema::dropIfExists('daily_token_claims');
        Schema::dropIfExists('token_transactions');
        Schema::dropIfExists('token_packages');
    }
};
