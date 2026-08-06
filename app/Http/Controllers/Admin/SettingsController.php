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
            'geminiKeys'  => $keys,
            'geminiModel' => AppSetting::get('gemini_model', 'gemini-2.0-flash'),
        ]);
    }

    public function save(Request $request)
    {
        $request->validate([
            'gemini_keys'  => 'nullable|array',
            'gemini_keys.*'=> 'string|min:10',
            'gemini_model' => 'nullable|string|max:100',
        ]);

        $keys = array_values(array_filter(array_map('trim', $request->gemini_keys ?? [])));
        AppSetting::set('gemini_keys',  $keys);
        AppSetting::set('gemini_model', $request->gemini_model ?? 'gemini-2.0-flash');
        // Reset round-robin index when keys change
        AppSetting::set('gemini_key_index', 0);

        return back()->with('success', 'Settings সেভ হয়েছে।');
    }
}
