<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ $title }}</title>
    <style>
        body { margin:0; padding:0; background:#0a0e23; font-family:'Segoe UI',Arial,sans-serif; }
        .wrap { max-width:600px; margin:0 auto; background:#0f1a3e; border-radius:16px; overflow:hidden; }
        .header { background:linear-gradient(135deg,#4d6fff,#7c3aed); padding:32px 32px 24px; text-align:center; }
        .header img { height:44px; }
        .body { padding:32px; color:#e2e8f0; }
        .title { font-size:22px; font-weight:800; color:#fff; margin:0 0 12px; line-height:1.35; }
        .message { font-size:15px; color:rgba(255,255,255,0.7); line-height:1.7; margin:0 0 24px; }
        .banner img { width:100%; border-radius:12px; margin-bottom:24px; }
        .cta { display:block; text-align:center; background:linear-gradient(135deg,#4d6fff,#7c3aed);
               color:#fff!important; text-decoration:none; padding:14px 32px; border-radius:12px;
               font-weight:700; font-size:15px; letter-spacing:0.02em; }
        .footer { padding:20px 32px; text-align:center; color:rgba(255,255,255,0.2); font-size:12px;
                  border-top:1px solid rgba(255,255,255,0.06); }
        .badge { display:inline-block; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12);
                 border-radius:6px; padding:2px 8px; font-size:11px; color:rgba(255,255,255,0.4); margin-bottom:16px; }
    </style>
</head>
<body>
    <div style="padding:24px 16px;">
        <div class="wrap">
            <!-- Header -->
            <div class="header">
                <img src="{{ url('/logo.png') }}" alt="NXLY Exam Arena" />
            </div>

            <!-- Body -->
            <div class="body">
                <div class="badge">📢 NXLY Exam Arena Announcement</div>

                <p class="title">{{ $title }}</p>
                <p class="message">{{ $body }}</p>

                @if($imageUrl)
                <div class="banner">
                    <img src="{{ $imageUrl }}" alt="notification banner" />
                </div>
                @endif

                <a href="{{ url($clickUrl) }}" class="cta">
                    এখনই দেখো →
                </a>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>এই ইমেইলটি NXLY Exam Arena থেকে পাঠানো হয়েছে।<br>
                তুমি এটি পেয়েছো কারণ তুমি আমাদের প্ল্যাটফর্মে নিবন্ধিত।</p>
                <p style="margin-top:8px;">
                    <a href="{{ url('/dashboard') }}" style="color:#4d6fff; text-decoration:none;">Dashboard</a>
                    &nbsp;·&nbsp;
                    <a href="{{ url('/profile') }}" style="color:#4d6fff; text-decoration:none;">Settings</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
