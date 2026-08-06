<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $fillable = ['key', 'value'];

    /** Get a setting value (decoded if JSON) */
    public static function get(string $key, mixed $default = null): mixed
    {
        $row = static::where('key', $key)->first();
        if (!$row) return $default;
        $decoded = json_decode($row->value, true);
        return (json_last_error() === JSON_ERROR_NONE) ? $decoded : $row->value;
    }

    /** Set a setting value (encodes arrays/objects as JSON) */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], [
            'value' => is_array($value) || is_object($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : $value,
        ]);
    }

    /** Get the next Gemini API key using round-robin */
    public static function nextGeminiKey(): ?string
    {
        $keys = static::get('gemini_keys', []);
        if (empty($keys)) return null;

        $idx = (int) static::get('gemini_key_index', 0);
        $key = $keys[$idx % count($keys)] ?? $keys[0];

        // Advance index
        static::set('gemini_key_index', ($idx + 1) % count($keys));

        return $key;
    }
}
