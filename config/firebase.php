<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Firebase Project Configuration
    |--------------------------------------------------------------------------
    | Download your service account JSON from:
    | Firebase Console → Project Settings → Service Accounts → Generate new private key
    |
    | Place the file at: storage/app/firebase-service-account.json
    | Then set FIREBASE_CREDENTIALS in .env to the path.
    */
    'credentials' => env('FIREBASE_CREDENTIALS', storage_path('app/firebase-service-account.json')),

    'project_id'  => env('FIREBASE_PROJECT_ID', ''),

    /*
    |--------------------------------------------------------------------------
    | FCM Web Push VAPID Key
    |--------------------------------------------------------------------------
    | Get this from: Firebase Console → Project Settings → Cloud Messaging
    | → Web configuration → Web Push certificates → Key pair
    */
    'vapid_public_key' => env('FIREBASE_VAPID_PUBLIC_KEY', ''),
];
