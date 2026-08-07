import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/clay_card.dart';
import '../../widgets/clay_button.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  double _progress = 0.0;
  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    _startFlow();
  }

  Future<void> _startFlow() async {
    // Wait for auth to finish loading from secure storage
    final auth = context.read<AuthProvider>();

    // Run progress animation and auth load in parallel
    final animFuture = () async {
      for (int i = 1; i <= 10; i++) {
        await Future.delayed(const Duration(milliseconds: 180));
        if (mounted) setState(() => _progress = i / 10);
      }
    }();

    // Wait for both: animation done AND auth loaded
    await animFuture;

    // If auth is still loading (shouldn't normally happen), wait a bit more
    int retries = 0;
    while (auth.loading && retries < 20) {
      await Future.delayed(const Duration(milliseconds: 100));
      retries++;
    }

    if (!mounted || _navigated) return;
    _navigateNext();
  }

  void _navigateNext() {
    if (_navigated) return;
    _navigated = true;

    final auth = context.read<AuthProvider>();
    if (auth.isLoggedIn) {
      if (auth.needsOnboarding) {
        Navigator.pushReplacementNamed(context, '/onboarding');
      } else {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } else {
      Navigator.pushReplacementNamed(context, '/get-started');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070a14),
      body: Stack(
        children: [
          // Background 3D Clay Glow Orbs
          Positioned(
            top: -60,
            left: -40,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(AppConfig.accentBlue).withOpacity(0.2),
              ),
            ).animate(onPlay: (c) => c.repeat(reverse: true))
             .scale(begin: const Offset(1, 1), end: const Offset(1.3, 1.3), duration: 2500.ms),
          ),
          Positioned(
            bottom: -80,
            right: -50,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(AppConfig.accentPurple).withOpacity(0.2),
              ),
            ).animate(onPlay: (c) => c.repeat(reverse: true))
             .scale(begin: const Offset(1, 1), end: const Offset(1.2, 1.2), duration: 2000.ms),
          ),

          SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Spacer(),

                    // 3D Clay Trophy & Shield Hero Container
                    ClayCard(
                      color: const Color(0xFF161f33),
                      borderRadius: 40,
                      depth: 18,
                      padding: const EdgeInsets.all(20),
                      child: Container(
                        width: 170,
                        height: 170,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1d4ed8), Color(0xFF7e22ce)],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(AppConfig.accentBlue).withOpacity(0.5),
                              blurRadius: 25,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            'assets/images/clay_app_logo_3d.png',
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Image.asset(
                              'assets/images/clay_trophy_3d.png',
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Center(
                                child: Text('🏆', style: TextStyle(fontSize: 80)),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ).animate(onPlay: (c) => c.repeat(reverse: true))
                     .scale(begin: const Offset(0.96, 0.96), end: const Offset(1.04, 1.04), duration: 1600.ms, curve: Curves.easeInOut),

                    const SizedBox(height: 36),

                    // 3D Brand Badge
                    ClayCard(
                      color: const Color(0xFF1e293b),
                      borderRadius: 24,
                      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                      depth: 10,
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('🛡️', style: TextStyle(fontSize: 22)),
                          SizedBox(width: 10),
                          Text(
                            'EXAM ARENA',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 26,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 3,
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.3, end: 0),

                    const SizedBox(height: 12),

                    Text(
                      'বাংলাদেশের সেরা ৩ডি পরীক্ষা প্রস্তুতি প্ল্যাটফর্ম 🎯',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ).animate().fadeIn(delay: 400.ms),

                    const Spacer(),

                    // Progress indicator bar
                    Column(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: LinearProgressIndicator(
                            value: _progress,
                            minHeight: 8,
                            backgroundColor: const Color(0xFF1e293b),
                            valueColor: const AlwaysStoppedAnimation(Color(AppConfig.accentBlue)),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'প্রস্তুতি লোড হচ্ছে... ${(_progress * 100).toInt()}%',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.4),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Skip / Continue Button if user wants instant entry
                    ClayButton(
                      label: 'প্রবেশ করুন (Get Started) 🚀',
                      height: 48,
                      color: const Color(AppConfig.accentBlue),
                      onPressed: _navigateNext,
                    ).animate().fadeIn(delay: 600.ms),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
