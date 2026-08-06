<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FcmTokenController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        if ($request->user()) {
            $request->user()->update(['fcm_token' => $request->token]);
        }

        return response()->json(['ok' => true]);
    }
}
