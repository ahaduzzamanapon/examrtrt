<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PushSubscriptionController extends Controller
{
    /**
     * Store or update a push subscription (called from frontend after permission granted).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint'   => 'required|url',
            'p256dh_key' => 'nullable|string',
            'auth_token' => 'nullable|string',
        ]);

        PushSubscription::updateOrCreate(
            [
                'user_id'  => $request->user()->id,
                'endpoint' => $request->endpoint,
            ],
            [
                'p256dh_key' => $request->p256dh_key,
                'auth_token' => $request->auth_token,
                'user_agent' => $request->userAgent(),
            ]
        );

        return response()->json(['status' => 'subscribed']);
    }

    /**
     * Remove a push subscription (user revoked permission).
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate(['endpoint' => 'required|url']);

        PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint', $request->endpoint)
            ->delete();

        return response()->json(['status' => 'unsubscribed']);
    }

    /**
     * Return the VAPID public key for the frontend to subscribe with.
     */
    public function vapidKey(): JsonResponse
    {
        return response()->json([
            'public_key' => config('webpush.vapid.public_key'),
        ]);
    }
}
