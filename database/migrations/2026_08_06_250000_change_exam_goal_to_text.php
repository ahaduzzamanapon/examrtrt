<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change exam_goal from varchar(50) to text so it can store JSON arrays
        Schema::table('users', function (Blueprint $table) {
            $table->text('exam_goal')->nullable()->change();
        });

        // Convert existing single values to JSON arrays: 'bcs' → '["bcs"]'
        DB::statement("
            UPDATE users
            SET exam_goal = CONCAT('[\"', exam_goal, '\"]')
            WHERE exam_goal IS NOT NULL
              AND exam_goal != ''
              AND exam_goal NOT LIKE '[%'
        ");
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('exam_goal', 50)->nullable()->change();
        });
    }
};
