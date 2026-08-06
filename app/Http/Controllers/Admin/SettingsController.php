<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $raw = AppSetting::get('gemini_keys', []);
        // Normalize: always send array to frontend
        if (is_string($raw) && $raw !== '') {
            $keys = [$raw];
        } elseif (is_array($raw)) {
            $keys = array_values(array_filter($raw));
        } else {
            $keys = [];
        }

        return Inertia::render('Admin/Settings', [
            'geminiKeys'         => $keys,
            'geminiModel'        => AppSetting::get('gemini_model', 'gemini-2.0-flash'),
            'adViewActive'       => (bool) AppSetting::get('ad_view_active', true),
            'tokenAdViewAmount'  => (int) AppSetting::get('token_ad_view_amount', 5),
            'tokenReferralBonus' => (int) AppSetting::get('token_referral_bonus', 10),
            'tokenDailyBonus'    => (int) AppSetting::get('token_daily_bonus', 10),
            'tokenModelTestCost' => (int) AppSetting::get('token_model_test_cost', 10),
            'adsterraScript'     => (string) AppSetting::get('adsterra_script', ''),
        ]);
    }

    public function save(Request $request)
    {
        $request->validate([
            'gemini_keys'            => 'nullable|array',
            'gemini_keys.*'          => 'string|min:10',
            'gemini_model'           => 'nullable|string|max:100',
            'ad_view_active'         => 'boolean',
            'token_ad_view_amount'   => 'integer|min:1|max:100',
            'token_referral_bonus'   => 'integer|min:1|max:100',
            'token_daily_bonus'      => 'integer|min:1|max:100',
            'token_model_test_cost'  => 'integer|min:1|max:100',
            'adsterra_script'        => 'nullable|string',
        ]);

        $keys = array_values(array_filter(array_map('trim', $request->gemini_keys ?? [])));
        AppSetting::set('gemini_keys',            $keys);
        AppSetting::set('gemini_model',           $request->gemini_model ?? 'gemini-2.0-flash');
        AppSetting::set('ad_view_active',         (bool) $request->ad_view_active);
        AppSetting::set('token_ad_view_amount',   (int) ($request->token_ad_view_amount ?? 5));
        AppSetting::set('token_referral_bonus',   (int) ($request->token_referral_bonus ?? 10));
        AppSetting::set('token_daily_bonus',      (int) ($request->token_daily_bonus ?? 10));
        AppSetting::set('token_model_test_cost',  (int) ($request->token_model_test_cost ?? 10));
        AppSetting::set('adsterra_script',        (string) $request->adsterra_script);

        // Reset round-robin index when keys change
        AppSetting::set('gemini_key_index', 0);

        return back()->with('success', 'Settings সফলভাবে সেভ হয়েছে।');
    }
}
