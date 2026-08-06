<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f4ff; margin: 0; padding: 20px; }
        .wrap { max-width: 480px; margin: 0 auto; }
        .card { background: #0a0e23; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #4d6fff, #7c3aed); padding: 32px 24px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 800; }
        .header p { color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px; }
        .body { padding: 32px 24px; text-align: center; }
        .greeting { color: rgba(255,255,255,0.8); font-size: 15px; margin-bottom: 20px; }
        .otp-box { display: inline-flex; gap: 8px; margin: 16px 0 24px; }
        .otp-digit { width: 44px; height: 54px; background: rgba(255,255,255,0.08); border: 2px solid #4d6fff; border-radius: 12px; color: white; font-size: 24px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .otp-code { background: rgba(77,111,255,0.12); border: 1px solid rgba(77,111,255,0.3); border-radius: 16px; padding: 20px 32px; margin: 16px 0 24px; }
        .otp-number { font-size: 40px; font-weight: 900; color: white; letter-spacing: 8px; }
        .note { color: rgba(255,255,255,0.45); font-size: 12px; line-height: 1.6; }
        .footer { background: rgba(255,255,255,0.03); padding: 16px 24px; text-align: center; }
        .footer p { color: rgba(255,255,255,0.3); font-size: 11px; margin: 0; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            <div class="header">
                <h1>⚡ NXLY Exam Arena</h1>
                <p>ইমেইল যাচাইকরণ কোড</p>
            </div>
            <div class="body">
                <p class="greeting">হ্যালো <strong style="color:white">{{ $name }}</strong>, তোমার ভেরিফিকেশন কোড:</p>
                <div class="otp-code">
                    <div class="otp-number">{{ $otp }}</div>
                </div>
                <p class="note">
                    এই কোড <strong style="color:#fbbf24">৩০ মিনিট</strong> পর্যন্ত কার্যকর।<br>
                    কোড কাউকে শেয়ার করবে না।<br><br>
                    যদি তুমি নিবন্ধন না করে থাকো, এই ইমেইল উপেক্ষা করো।
                </p>
            </div>
            <div class="footer">
                <p>© 2026 NXLY Exam Arena. সর্বস্বত্ব সংরক্ষিত।</p>
            </div>
        </div>
    </div>
</body>
</html>
