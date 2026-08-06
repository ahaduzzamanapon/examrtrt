import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_button.dart';

const _goals = [
  {'id': 'bcs',         'name': 'BCS প্রিলি',        'emoji': '🏛️', 'color': 0xFF4d6fff},
  {'id': 'hsc',         'name': 'HSC প্রস্তুতি',      'emoji': '📘', 'color': 0xFF10b981},
  {'id': 'ssc',         'name': 'SSC প্রস্তুতি',      'emoji': '📗', 'color': 0xFFf59e0b},
  {'id': 'medical',     'name': 'মেডিকেল এডমিশন',    'emoji': '⚕️', 'color': 0xFFef4444},
  {'id': 'engineering', 'name': 'ইঞ্জিনিয়ারিং',       'emoji': '⚙️', 'color': 0xFF8b5cf6},
  {'id': 'bank',        'name': 'ব্যাংক জব',          'emoji': '🏦', 'color': 0xFFec4899},
  {'id': 'university',  'name': 'ভার্সিটি ভর্তি',     'emoji': '🎓', 'color': 0xFF06b6d4},
  {'id': 'primary',     'name': 'প্রাইমারি শিক্ষক',   'emoji': '✏️', 'color': 0xFF84cc16},
  {'id': 'other',       'name': 'সাধারণ জ্ঞান',       'emoji': '📋', 'color': 0xFF64748b},
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  String? _selected;
  bool _loading = false;

  Future<void> _save() async {
    if (_selected == null) return;
    setState(() => _loading = true);
    try {
      await context.read<AuthProvider>().saveOnboarding(_selected!);
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/home');
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              ShaderMask(
                shaderCallback: (b) => const LinearGradient(
                  colors: [Color(AppConfig.accentBlue), Color(AppConfig.accentPurple)],
                ).createShader(b),
                child: const Text('তোমার লক্ষ্য কী?',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white)),
              ).animate().fadeIn().slideY(begin: -0.2, end: 0),
              const SizedBox(height: 6),
              Text('সঠিক প্রশ্ন পেতে তোমার পরীক্ষার ধরন বেছে নাও',
                style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
              ).animate().fadeIn(delay: 100.ms),
              const SizedBox(height: 24),

              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12,
                    childAspectRatio: 1.4,
                  ),
                  itemCount: _goals.length,
                  itemBuilder: (ctx, i) {
                    final g = _goals[i];
                    final isSelected = _selected == g['id'];
                    final color = Color(g['color'] as int);
                    return GestureDetector(
                      onTap: () => setState(() => _selected = g['id'] as String),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isSelected ? color.withOpacity(0.15) : const Color(0xFF111827),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? color : const Color(AppConfig.borderColor),
                            width: isSelected ? 2 : 1,
                          ),
                          boxShadow: isSelected ? [BoxShadow(color: color.withOpacity(0.2), blurRadius: 12)] : [],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(g['emoji'] as String, style: const TextStyle(fontSize: 28)),
                            const SizedBox(height: 6),
                            Text(g['name'] as String,
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.white.withOpacity(0.7),
                                fontWeight: FontWeight.w700, fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate(delay: (i * 60).ms).fadeIn().scale(begin: const Offset(0.9, 0.9));
                  },
                ),
              ),

              const SizedBox(height: 16),
              AppButton(
                label: 'শুরু করো',
                loading: _loading,
                onPressed: _selected == null ? null : _save,
                icon: Icons.arrow_forward_rounded,
              ).animate().fadeIn(delay: 400.ms),
            ],
          ),
        ),
      ),
    );
  }
}
