<!DOCTYPE html>
<html lang="bn" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="theme-color" content="#0a0e23">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="mobile-web-app-capable" content="yes">

        {{-- SEO --}}
        <meta name="description" content="NXLY Exam Arena — বাংলাদেশের সেরা কম্পিটিটিভ পরীক্ষার প্ল্যাটফর্ম। BCS, HSC, SSC লাইভ কনটেস্ট ও ১-অন-১ ব্যাটেল।">
        <meta property="og:title" content="{{ config('app.name') }}">
        <meta property="og:description" content="লাইভ পরীক্ষা, ১-অন-১ কুইজ ব্যাটেল এবং AI-চালিত প্র্যাকটিস।">
        <meta property="og:type" content="website">

        <title inertia>{{ config('app.name', 'NXLY Exam Arena') }}</title>

        {{-- Favicon & Icons --}}
        <link rel="icon" type="image/png" href="/favicon.png?v=1">
        <link rel="apple-touch-icon" href="/favicon.png?v=1">
        <meta property="og:image" content="/logo.png?v=1">

        {{-- Google Fonts: Bengali + Latin --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

        {{-- Firebase config for FCM token registration (public values, safe to expose) --}}
        <script id="firebase-config" type="application/json">{"apiKey":"AIzaSyDp_Af0POFa-EekqDEFdgLzVLNSAtYbU10","authDomain":"exam-arena-6148c.firebaseapp.com","projectId":"exam-arena-6148c","storageBucket":"exam-arena-6148c.firebasestorage.app","messagingSenderId":"165082016850","appId":"1:165082016850:web:9fb8f973b6e20743b4038b"}</script>
        <span id="vapid-key" style="display:none">{{ env('FIREBASE_VAPID_PUBLIC_KEY', 'BKPEwvQSYwZhDuz0M3Bxodhf4Um980h5IvJJrIWcERJopbvV6JabGrSyk69lre_cOpqfRIAPsrhpMwVNvAjmWfc') }}</span>

        {{-- Scripts --}}
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased dark overscroll-none" style="background:#0a0e23; color:#e2e8f0;">
        @inertia
    </body>
</html>
