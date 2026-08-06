<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('battle_invites', function (Blueprint $table) {
            $table->unsignedBigInteger('receiver_id')->nullable()->change();
        });

        Schema::table('battle_sessions', function (Blueprint $table) {
            $table->unsignedBigInteger('receiver_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('battle_invites', function (Blueprint $table) {
            $table->unsignedBigInteger('receiver_id')->nullable(false)->change();
        });

        Schema::table('battle_sessions', function (Blueprint $table) {
            $table->unsignedBigInteger('receiver_id')->nullable(false)->change();
        });
    }
};
