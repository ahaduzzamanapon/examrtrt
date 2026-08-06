<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add stream to questions
        if (!Schema::hasColumn('questions', 'stream')) {
            Schema::table('questions', function (Blueprint $table) {
                $table->string('stream', 30)->default('general')->after('exam_goal')->index();
                // science | arts | commerce | general
            });
        }

        // 2. Add target_streams to exams
        if (!Schema::hasColumn('exams', 'target_streams')) {
            Schema::table('exams', function (Blueprint $table) {
                $table->json('target_streams')->nullable()->after('categories');
                // ["science","arts","commerce"] or null = all
            });
        }

        // 3. Add stream to users
        if (!Schema::hasColumn('users', 'stream')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('stream', 30)->nullable()->after('exam_goal');
                // science | arts | commerce | null (for non-SSC/HSC goals)
            });
        }

        // 4. Auto-tag existing questions with stream based on subject
        $this->autoTagExistingQuestions();
    }

    private function autoTagExistingQuestions(): void
    {
        // HSC/SSC Science subjects
        $scienceSubjects = [
            'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান', 'উচ্চতর গণিত',
            'গণিত', 'বীজগণিত', 'তথ্য ও যোগাযোগ প্রযুক্তি',
            'কম্পিউটার ও তথ্যপ্রযুক্তি', 'সাধারণ বিজ্ঞান', 'বিজ্ঞান',
        ];

        // HSC/SSC Commerce subjects
        $commerceSubjects = [
            'হিসাববিজ্ঞান', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা',
            'ফিন্যান্স, ব্যাংকিং ও বিমা', 'মার্কেটিং', 'ব্যবসায় উদ্যোগ',
            'অর্থনীতি',
        ];

        // HSC Arts subjects
        $artsSubjects = [
            'পৌরনীতি ও সুশাসন', 'ইসলামের ইতিহাস ও সংস্কৃতি', 'ইতিহাস',
            'ভূগোল', 'সমাজকর্ম', 'মনোবিজ্ঞান', 'সমাজবিজ্ঞান',
            'ইতিহাস ও বিশ্বসভ্যতা', 'ভূগোল ও পরিবেশ',
        ];

        // Goals where stream applies
        $streamGoals = ['hsc', 'ssc'];

        DB::table('questions')
            ->whereIn('exam_goal', $streamGoals)
            ->get()
            ->each(function ($q) use ($scienceSubjects, $commerceSubjects, $artsSubjects) {
                $subject = $q->subject ?? '';
                if (in_array($subject, $scienceSubjects)) {
                    $stream = 'science';
                } elseif (in_array($subject, $commerceSubjects)) {
                    $stream = 'commerce';
                } elseif (in_array($subject, $artsSubjects)) {
                    $stream = 'arts';
                } else {
                    // Common subjects (বাংলা, ইংরেজি, ধর্ম) → general (visible to all)
                    $stream = 'general';
                }

                DB::table('questions')->where('id', $q->id)->update(['stream' => $stream]);
            });
    }

    public function down(): void
    {
        Schema::table('questions', fn($t) => $t->dropColumn('stream'));
        Schema::table('exams',     fn($t) => $t->dropColumn('target_streams'));
        Schema::table('users',     fn($t) => $t->dropColumn('stream'));
    }
};
