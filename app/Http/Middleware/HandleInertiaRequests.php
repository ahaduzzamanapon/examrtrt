<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            'firebase' => [
                'config' => [
                    'apiKey'            => config('services.firebase.api_key',            'AIzaSyDp_Af0POFa-EekqDEFdgLzVLNSAtYbU10'),
                    'authDomain'        => config('services.firebase.auth_domain',        'exam-arena-6148c.firebaseapp.com'),
                    'projectId'         => config('services.firebase.project_id',         'exam-arena-6148c'),
                    'storageBucket'     => config('services.firebase.storage_bucket',     'exam-arena-6148c.firebasestorage.app'),
                    'messagingSenderId' => config('services.firebase.messaging_sender_id','165082016850'),
                    'appId'             => config('services.firebase.app_id',             '1:165082016850:web:9fb8f973b6e20743b4038b'),
                ],
                'vapid_key' => config('webpush.vapid.public_key', ''),
            ],
        ];
    }
}
