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

        {{-- SEO Meta Tags --}}
        <meta name="google-site-verification" content="7ddWAYGCZPORQdN7a9hvQRADLSNwQkTNBKYALoenrzU" />
        <title inertia>{{ config('app.name', 'Exam Arena Bangladesh — BCS, NTRCA, Primary & Academic Model Test') }}</title>
        <meta name="description" content="বাংলাদেশের সেরা অনলাইন পরীক্ষা ও মডেল টেস্ট প্ল্যাটফর্ম Exam Arena। BCS প্রিলিমিনারি, NTRCA শিক্ষক নিবন্ধন, প্রাথমিক শিক্ষক নিয়োগ, ব্যাংক, মেডেল ও ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার ৫০,০০০+ সমাধানসহ প্রশ্ন ও লাইভ ব্যাটেল।">
        <meta name="keywords" content="Exam Arena, ExamArena, BCS model test, NTRCA question bank, Primary teacher exam, Bank exam preparation, HSC SSC MCQ live test, Bangladesh online exam, বিসিএস প্রিলিমিনারি মডেল টেস্ট, শিক্ষক নিবন্ধন প্রশ্ন ব্যাংক, প্রাথমিক সহকারী শিক্ষক নিয়োগ">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <link rel="canonical" href="https://exam-arena.nxly.online/">

        {{-- Open Graph / Facebook --}}
        <meta property="og:site_name" content="NXLY Exam Arena">
        <meta property="og:title" content="Exam Arena Bangladesh — BCS, NTRCA, Primary & Academic Model Test">
        <meta property="og:description" content="লাইভ কনটেস্ট, ১-অন-১ কুইজ ব্যাটেল, AI-চালিত প্র্যাকটিস এবং ৫০,০০০+ প্রকৃত অতীত প্রশ্নের ডিজিটাল ব্যাংক।">
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://exam-arena.nxly.online/">
        <meta property="og:image" content="https://exam-arena.nxly.online/logo.png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:locale" content="bn_BD">

        {{-- Twitter Card --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Exam Arena Bangladesh — BCS, NTRCA, Primary Model Test">
        <meta name="twitter:description" content="লাইভ কনটেস্ট, ১-অন-১ কুইজ ব্যাটেল, AI-চালিত প্র্যাকটিস এবং ৫০,০০০+ মূল পরীক্ষার প্রশ্ন ব্যাংক।">
        <meta name="twitter:image" content="https://exam-arena.nxly.online/logo.png">

        {{-- JSON-LD Schema.org Structured Data --}}
        @verbatim
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://exam-arena.nxly.online/#website",
              "url": "https://exam-arena.nxly.online/",
              "name": "Exam Arena Bangladesh",
              "description": "বাংলাদেশের সেরা কম্পিটিটিভ পরীক্ষা ও মডেল টেস্ট অনলাইন প্ল্যাটফর্ম",
              "inLanguage": "bn-BD",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://exam-arena.nxly.online/?s={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "EducationalApplication",
              "@id": "https://exam-arena.nxly.online/#application",
              "name": "NXLY Exam Arena",
              "operatingSystem": "Android, Web, iOS",
              "applicationCategory": "EducationalApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BDT"
              },
              "description": "BCS, NTRCA, Primary Teacher Exam, Bank Exam, Medical, Engineering, HSC, SSC পরীক্ষার অনলাইন মডেল টেস্ট ও প্র্যাকটিস অ্যাপ।"
            },
            {
              "@type": "Organization",
              "@id": "https://exam-arena.nxly.online/#organization",
              "name": "NXLY Exam Arena",
              "url": "https://exam-arena.nxly.online/",
              "logo": "https://exam-arena.nxly.online/logo.png"
            }
          ]
        }
        </script>
        @endverbatim

        {{-- Google Fonts: Bengali + Latin --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700;800&family=Anek+Bangla:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

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
