<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            // ── BCS ────────────────────────────────────────────────────────
            [
                'exam_goal' => 'bcs', 'exam_type' => 'BCS', 'board_year' => '৪৫তম বিসিএস প্রিলিমিনারি',
                'subject' => 'বাংলা ভাষা ও সাহিত্য', 'difficulty_level' => 'HIGH',
                'question_text' => "'রোহিণী' ও 'গোবিন্দলাল' বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের কোন উপন্যাসের প্রধান চরিত্র?",
                'options' => ['a'=>'বিষবৃক্ষ','b'=>'কৃষ্ণকান্তের উইল','c'=>'কপালকুণ্ডলা','d'=>'দেবী চৌধুরানী'],
                'correct_answer' => 'b',
                'explanation' => "বঙ্কিমচন্দ্রের 'কৃষ্ণকান্তের উইল' (১৮৭৮) উপন্যাসের কেন্দ্রীয় চরিত্র গোবিন্দলাল, ভ্রমর ও বিধবা রোহিণী।",
            ],
            [
                'exam_goal' => 'bcs', 'exam_type' => 'BCS', 'board_year' => '৪৪তম বিসিএস প্রিলিমিনারি',
                'subject' => 'বাংলাদেশ বিষয়াবলী', 'difficulty_level' => 'MEDIUM',
                'question_text' => 'বাংলাদেশের সংবিধান কত তারিখে কার্যকর হয়?',
                'options' => ['a'=>'১৬ ডিসেম্বর ১৯৭২','b'=>'২৬ মার্চ ১৯৭২','c'=>'৪ নভেম্বর ১৯৭২','d'=>'১ জানুয়ারি ১৯৭৩'],
                'correct_answer' => 'a',
                'explanation' => 'বাংলাদেশের সংবিধান ১৯৭২ সালের ৪ নভেম্বর গণপরিষদে গৃহীত হয় এবং ১৬ ডিসেম্বর ১৯৭২ (বিজয় দিবস) থেকে কার্যকর হয়।',
            ],
            [
                'exam_goal' => 'bcs', 'exam_type' => 'BCS', 'board_year' => '৪৩তম বিসিএস প্রিলিমিনারি',
                'subject' => 'সাধারণ বিজ্ঞান', 'difficulty_level' => 'MEDIUM',
                'question_text' => 'মানবদেহের সবচেয়ে বড় গ্রন্থি কোনটি?',
                'options' => ['a'=>'অগ্ন্যাশয়','b'=>'প্লীহা','c'=>'যকৃৎ (লিভার)','d'=>'থাইরয়েড'],
                'correct_answer' => 'c',
                'explanation' => 'যকৃৎ (Liver) মানবদেহের সবচেয়ে বড় গ্রন্থি। এটি প্রোটিন সংশ্লেষণ, ডিটক্সিফিকেশন এবং পিত্ত উৎপাদন করে।',
            ],
            [
                'exam_goal' => 'bcs', 'exam_type' => 'BCS', 'board_year' => '৪৫তম বিসিএস প্রিলিমিনারি',
                'subject' => 'গণিত', 'difficulty_level' => 'HIGH',
                'question_text' => 'একটি বৃত্তের ব্যাসার্ধ ৫০% বৃদ্ধি পেলে ক্ষেত্রফল কত % বৃদ্ধি পাবে?',
                'options' => ['a'=>'৫০%','b'=>'১০০%','c'=>'১২৫%','d'=>'১৫০%'],
                'correct_answer' => 'c',
                'explanation' => 'ব্যাসার্ধ r থেকে 1.5r হলে ক্ষেত্রফল π(1.5r)² = 2.25πr²। বৃদ্ধি = (2.25-1)/1 × 100% = 125%।',
            ],
            [
                'exam_goal' => 'bcs', 'exam_type' => 'BCS', 'board_year' => '৪৪তম বিসিএস প্রিলিমিনারি',
                'subject' => 'আন্তর্জাতিক বিষয়াবলী', 'difficulty_level' => 'MEDIUM',
                'question_text' => 'জাতিসংঘ নিরাপত্তা পরিষদের স্থায়ী সদস্য দেশ কতটি?',
                'options' => ['a'=>'৩টি','b'=>'৪টি','c'=>'৫টি','d'=>'৬টি'],
                'correct_answer' => 'c',
                'explanation' => 'জাতিসংঘ নিরাপত্তা পরিষদে ৫টি স্থায়ী সদস্য: USA, UK, France, Russia, China।',
            ],

            // ── HSC ────────────────────────────────────────────────────────
            [
                'exam_goal' => 'hsc', 'exam_type' => 'HSC', 'board_year' => 'HSC 2024',
                'subject' => 'পদার্থবিজ্ঞান', 'difficulty_level' => 'HIGH',
                'question_text' => 'আলোর বেগ শূন্যমাধ্যমে কত?',
                'options' => ['a'=>'3×10⁸ m/s','b'=>'3×10⁶ m/s','c'=>'3×10¹⁰ m/s','d'=>'3×10⁴ m/s'],
                'correct_answer' => 'a',
                'explanation' => 'শূন্যমাধ্যমে আলোর বেগ c = 3×10⁸ m/s (প্রায় ৩ লক্ষ কিলোমিটার/সেকেন্ড)।',
            ],
            [
                'exam_goal' => 'hsc', 'exam_type' => 'HSC', 'board_year' => 'HSC 2024',
                'subject' => 'রসায়ন', 'difficulty_level' => 'MEDIUM',
                'question_text' => 'পানির আণবিক সংকেত কী?',
                'options' => ['a'=>'H₂O₂','b'=>'HO','c'=>'H₂O','d'=>'H₃O'],
                'correct_answer' => 'c',
                'explanation' => 'পানির রাসায়নিক সংকেত H₂O। এতে দুটি হাইড্রোজেন ও একটি অক্সিজেন পরমাণু আছে।',
            ],
            [
                'exam_goal' => 'hsc', 'exam_type' => 'HSC', 'board_year' => 'HSC 2023',
                'subject' => 'গণিত', 'difficulty_level' => 'HIGH',
                'question_text' => 'sin²θ + cos²θ = ?',
                'options' => ['a'=>'০','b'=>'১','c'=>'২','d'=>'sinθ·cosθ'],
                'correct_answer' => 'b',
                'explanation' => 'এটি মৌলিক ত্রিকোণমিতিক অভেদ (Pythagorean identity): sin²θ + cos²θ = 1।',
            ],

            // ── SSC ────────────────────────────────────────────────────────
            [
                'exam_goal' => 'ssc', 'exam_type' => 'SSC', 'board_year' => 'SSC 2024',
                'subject' => 'বাংলা', 'difficulty_level' => 'MEDIUM',
                'question_text' => '"অপু" চরিত্রটি বিভূতিভূষণ বন্দ্যোপাধ্যায়ের কোন উপন্যাসের?',
                'options' => ['a'=>'পথের পাঁচালী','b'=>'আরণ্যক','c'=>'ইছামতী','d'=>'মৌরীফুল'],
                'correct_answer' => 'a',
                'explanation' => "'পথের পাঁচালী' (১৯২৯) বিভূতিভূষণের বিখ্যাত উপন্যাস যেখানে অপু ও দুর্গা প্রধান চরিত্র।",
            ],
            [
                'exam_goal' => 'ssc', 'exam_type' => 'SSC', 'board_year' => 'SSC 2024',
                'subject' => 'গণিত', 'difficulty_level' => 'MEDIUM',
                'question_text' => 'একটি আয়তক্ষেত্রের দৈর্ঘ্য ১২ সেমি এবং প্রস্থ ৮ সেমি। পরিসীমা কত?',
                'options' => ['a'=>'৯৬ সেমি','b'=>'৪০ সেমি','c'=>'৪৮ সেমি','d'=>'২০ সেমি'],
                'correct_answer' => 'b',
                'explanation' => 'আয়তক্ষেত্রের পরিসীমা = 2(দৈর্ঘ্য + প্রস্থ) = 2(12+8) = 2×20 = 40 সেমি।',
            ],

            // ── Bank ────────────────────────────────────────────────────────
            [
                'exam_goal' => 'bank', 'exam_type' => 'Bank', 'board_year' => 'বাংলাদেশ ব্যাংক ২০২৪',
                'subject' => 'গণিত', 'difficulty_level' => 'HIGH',
                'question_text' => '৫% সরল সুদে কত বছরে ১০০০ টাকার সুদ ৩০০ টাকা হবে?',
                'options' => ['a'=>'৪ বছর','b'=>'৫ বছর','c'=>'৬ বছর','d'=>'৭ বছর'],
                'correct_answer' => 'c',
                'explanation' => 'সুদ = (মূলধন × সময় × হার)/১০০ ⟹ ৩০০ = (১০০০ × t × ৫)/১০০ ⟹ t = ৬ বছর।',
            ],
            [
                'exam_goal' => 'bank', 'exam_type' => 'Bank', 'board_year' => 'সোনালী ব্যাংক ২০২৪',
                'subject' => 'English', 'difficulty_level' => 'MEDIUM',
                'question_text' => 'Choose the correct synonym of "Eloquent":',
                'options' => ['a'=>'Silent','b'=>'Fluent','c'=>'Harsh','d'=>'Timid'],
                'correct_answer' => 'b',
                'explanation' => "'Eloquent' means fluent or persuasive in speaking or writing.",
            ],

            // ── Medical ─────────────────────────────────────────────────────
            [
                'exam_goal' => 'medical', 'exam_type' => 'MBBS Admission', 'board_year' => '২০২৩-২৪',
                'subject' => 'জীববিজ্ঞান', 'difficulty_level' => 'HIGH',
                'question_text' => 'মানুষের হৃদয়ে কতটি প্রকোষ্ঠ থাকে?',
                'options' => ['a'=>'২টি','b'=>'৩টি','c'=>'৪টি','d'=>'৫টি'],
                'correct_answer' => 'c',
                'explanation' => 'মানুষের হৃদয়ে ৪টি প্রকোষ্ঠ: বাম ও ডান অলিন্দ (Atrium) এবং বাম ও ডান নিলয় (Ventricle)।',
            ],

            // ── Primary ─────────────────────────────────────────────────────
            [
                'exam_goal' => 'primary', 'exam_type' => 'Primary School Teacher', 'board_year' => '২০২৩',
                'subject' => 'সাধারণ জ্ঞান', 'difficulty_level' => 'LOW',
                'question_text' => 'বাংলাদেশের জাতীয় ফুল কী?',
                'options' => ['a'=>'গোলাপ','b'=>'শাপলা','c'=>'কদম','d'=>'জুঁই'],
                'correct_answer' => 'b',
                'explanation' => 'শাপলা (Water Lily) বাংলাদেশের জাতীয় ফুল। এটি নদী ও বিলে জন্মায়।',
            ],
        ];

        foreach ($questions as $q) {
            Question::create($q + ['is_ai_generated' => false, 'is_active' => true]);
        }

        $this->command->info('✅ ' . count($questions) . ' sample questions seeded!');
    }
}
