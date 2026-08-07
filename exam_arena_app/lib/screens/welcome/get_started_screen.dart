import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../config/app_config.dart';
import '../../widgets/clay_button.dart';
import '../../widgets/clay_card.dart';

class GetStartedScreen extends StatefulWidget {
  const GetStartedScreen({super.key});

  @override
  State<GetStartedScreen> createState() => _GetStartedScreenState();
}

class _GetStartedScreenState extends State<GetStartedScreen> {
  final PageController _pageCtrl = PageController();

  final List<Map<String, String>> _slides = [
    {
      'emoji': '🏆',
      'title': 'বাংলাদেশের সেরা লাইভ পরীক্ষা প্ল্যাটফর্ম',
      'desc': 'বিসিএস, ব্যাংক, মেডিকেল, এইচএসসি ও এসএসসি পরীক্ষার সেরা প্রস্তুতি নাও লাইভ কনটেস্টে!',
    },
    {
      'emoji': '⚔️',
      'title': '১v১ লাইভ যুদ্ধ ও সারভাইভাল মোড',
      'desc': 'বন্ধুদের সাথে ১v১ ফাইট করো এবং সারভাইভাল ডেথম্যাচে ৩ জীবন নিয়ে সবার উপরে ওঠো!',
    },
    {
      'emoji': '🎬',
      'title': 'আনলিমিটেড MCQ রিলস ও এআই হেল্প',
      'desc': 'টিকটকের মতো সোয়াইপ করে প্র্যাকটিস করো হাজার হাজার প্রশ্ন এবং এআই থেকে ব্যাখ্যা নাও!',
    },
  ];

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0b0f19),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            children: [
              // Top Brand Header
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1e293b),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(AppConfig.accentBlue).withOpacity(0.3)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('🛡️', style: TextStyle(fontSize: 16)),
                        SizedBox(width: 6),
                        Text(
                          'EXAM ARENA',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Page Slider with smooth 60fps performance
              Expanded(
                child: PageView.builder(
                  controller: _pageCtrl,
                  itemCount: _slides.length,
                  physics: const BouncingScrollPhysics(),
                  itemBuilder: (ctx, i) {
                    final s = _slides[i];
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // 3D Hero Clay Card
                        ClayCard(
                          color: const Color(0xFF1e293b),
                          borderRadius: 36,
                          depth: 8,
                          padding: const EdgeInsets.all(16),
                          child: Container(
                            width: 150,
                            height: 150,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                colors: [Color(AppConfig.accentBlue), Color(AppConfig.accentPurple)],
                              ),
                            ),
                            child: ClipOval(
                              child: Image.asset(
                                i == 0 ? 'assets/images/clay_student_3d.png' : 'assets/images/clay_trophy_3d.png',
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Center(
                                  child: Text(s['emoji']!, style: const TextStyle(fontSize: 64)),
                                ),
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 32),

                        Text(
                          s['title']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            height: 1.3,
                          ),
                        ),

                        const SizedBox(height: 12),

                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            s['desc']!,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.6),
                              fontSize: 13,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),

              // Smooth Indicator
              SmoothPageIndicator(
                controller: _pageCtrl,
                count: _slides.length,
                effect: const ExpandingDotsEffect(
                  activeDotColor: Color(AppConfig.accentBlue),
                  dotColor: Color(0xFF1e293b),
                  dotHeight: 8,
                  dotWidth: 8,
                  expansionFactor: 3,
                ),
              ),

              const SizedBox(height: 28),

              // Bottom Action Buttons
              ClayButton(
                label: 'শুরু করুন (Get Started) 🚀',
                color: const Color(AppConfig.accentBlue),
                onPressed: () => Navigator.pushReplacementNamed(context, '/register'),
              ),

              const SizedBox(height: 14),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'ইতিমধ্যে একাউন্ট আছে? ',
                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pushReplacementNamed(context, '/login'),
                    child: const Text(
                      'লগইন করুন',
                      style: TextStyle(
                        color: Color(AppConfig.accentBlue),
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }
}
