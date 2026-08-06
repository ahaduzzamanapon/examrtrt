<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('battle_invites', function (Blueprint $table) {
            $table->timestamp('last_ping_at')->nullable()->after('status');
            $table->timestamp('updated_at')->nullable()->after('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('battle_invites', function (Blueprint $table) {
            $table->dropColumn(['last_ping_at', 'updated_at']);
        });
    }
};
