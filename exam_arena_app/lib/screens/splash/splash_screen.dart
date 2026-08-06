import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _navigate();
  }

  Future<void> _navigate() async {
    // Wait for auth to init
    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;

    final auth = context.read<AuthProvider>();
    // Wait until loading done
    while (auth.loading) {
      await Future.delayed(const Duration(milliseconds: 100));
    }

    await Future.delayed(const Duration(milliseconds: 2200));
    if (!mounted) return;

    if (!auth.isLoggedIn) {
      Navigator.pushReplacementNamed(context, '/login');
    } else if (auth.needsOnboarding) {
      Navigator.pushReplacementNamed(context, '/onboarding');
    } else {
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      body: Stack(
        children: [
          // Background grid
          _buildGrid(),

          // Main content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo glow ring
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (_, child) => Container(
                    width: 140 + (_pulseController.value * 8),
                    height: 140 + (_pulseController.value * 8),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          const Color(AppConfig.accentBlue).withOpacity(0.3),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    child: child,
                  ),
                  child: Container(
                    width: 120,
                    height: 120,
                    margin: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(28),
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Color(0xFF1a2a6c),
                          Color(AppConfig.accentPurple),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(AppConfig.accentBlue).withOpacity(0.5),
                          blurRadius: 30,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        '🏆',
                        style: TextStyle(fontSize: 60),
                      ),
                    ),
                  ),
                ).animate().scale(
                  duration: 600.ms,
                  curve: Curves.elasticOut,
                ),

                const SizedBox(height: 28),

                // App name
                ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    colors: [Color(AppConfig.accentBlue), Color(AppConfig.accentPurple)],
                  ).createShader(bounds),
                  child: const Text(
                    'Exam Arena',
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 1,
                    ),
                  ),
                ).animate().fadeIn(delay: 400.ms, duration: 600.ms).slideY(begin: 0.3, end: 0),

                const SizedBox(height: 8),

                Text(
                  'বাংলাদেশের সেরা পরীক্ষা প্রস্তুতি',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.5),
                    fontWeight: FontWeight.w500,
                  ),
                ).animate().fadeIn(delay: 600.ms, duration: 600.ms),

                const SizedBox(height: 60),

                // Loading dots
                _LoadingDots()
                    .animate()
                    .fadeIn(delay: 800.ms, duration: 400.ms),
              ],
            ),
          ),

          // Bottom version
          Positioned(
            bottom: 32,
            left: 0,
            right: 0,
            child: Text(
              'v1.0.0',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withOpacity(0.2),
                fontSize: 12,
              ),
            ).animate().fadeIn(delay: 1000.ms),
          ),
        ],
      ),
    );
  }

  Widget _buildGrid() {
    return CustomPaint(
      painter: _GridPainter(),
      size: MediaQuery.of(context).size,
    );
  }
}

class _LoadingDots extends StatefulWidget {
  @override
  State<_LoadingDots> createState() => _LoadingDotsState();
}

class _LoadingDotsState extends State<_LoadingDots>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  int _activeDot = 0;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    )..addStatusListener((s) {
        if (s == AnimationStatus.completed) {
          setState(() => _activeDot = (_activeDot + 1) % 3);
          _ctrl.reset();
          _ctrl.forward();
        }
      });
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(3, (i) {
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: _activeDot == i ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(4),
            color: _activeDot == i
                ? const Color(AppConfig.accentBlue)
                : const Color(AppConfig.accentBlue).withOpacity(0.3),
          ),
        );
      }),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.03)
      ..strokeWidth = 1;

    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(_) => false;
}
