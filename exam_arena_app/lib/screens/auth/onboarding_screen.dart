import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/clay_button.dart';
import '../../widgets/clay_card.dart';

const _goals = [
  {'id': 'BCS',         'name': 'BCS প্রিলি',        'emoji': '🏛️', 'color': 0xFF4d6fff},
  {'id': 'HSC',         'name': 'HSC প্রস্তুতি',      'emoji': '📘', 'color': 0xFF10b981},
  {'id': 'SSC',         'name': 'SSC প্রস্তুতি',      'emoji': '📗', 'color': 0xFFf59e0b},
  {'id': 'MEDICAL',     'name': 'মেডিকেল এডমিশন',    'emoji': '⚕️', 'color': 0xFFef4444},
  {'id': 'ENGINEERING', 'name': 'ইঞ্জিনিয়ারিং',       'emoji': '⚙️', 'color': 0xFF8b5cf6},
  {'id': 'BANK',        'name': 'ব্যাংক জব',          'emoji': '🏦', 'color': 0xFFec4899},
  {'id': 'UNIVERSITY',  'name': 'ভার্সিটি ভর্তি',     'emoji': '🎓', 'color': 0xFF06b6d4},
  {'id': 'PRIMARY',     'name': 'প্রাইমারি শিক্ষক',   'emoji': '✏️', 'color': 0xFF84cc16},
  {'id': 'OTHER',       'name': 'সাধারণ জ্ঞান',       'emoji': '📋', 'color': 0xFF64748b},
];

const _streams = [
  {'id': 'science',  'label': '🔬 বিজ্ঞান',          'color': 0xFF3b82f6},
  {'id': 'arts',     'label': '🎨 মানবিক',          'color': 0xFFec4899},
  {'id': 'commerce', 'label': '💼 ব্যবসায় শিক্ষা',  'color': 0xFFf59e0b},
  {'id': 'general',  'label': '🌐 সাধারণ',          'color': 0xFF10b981},
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final Set<String> _selectedGoals = {'BCS'};
  String _selectedStream = 'science';
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>();
    final rawGoals = auth.user?['exam_goal']?.toString();
    if (rawGoals != null && rawGoals.isNotEmpty) {
      final clean = rawGoals.replaceAll('[', '').replaceAll(']', '').replaceAll('"', '').replaceAll("'", '').replaceAll('\\', '');
      _selectedGoals.clear();
      _selectedGoals.addAll(
        clean.split(',').map((e) => e.trim().toUpperCase()).where((e) => e.isNotEmpty),
      );
    }
    final stream = auth.user?['stream']?.toString();
    if (stream != null && stream.isNotEmpty) {
      _selectedStream = stream;
    }
  }

  Future<void> _save() async {
    if (_selectedGoals.isEmpty) {
      Fluttertoast.showToast(msg: 'কমপক্ষে ১টি পরীক্ষার লক্ষ্য নির্বাচন করুন');
      return;
    }
    setState(() => _loading = true);
    try {
      final goalStr = _selectedGoals.join(',');
      await context.read<AuthProvider>().saveOnboarding(goalStr, stream: _selectedStream);
      if (!mounted) return;
      Fluttertoast.showToast(
        msg: 'আপনার লক্ষ্য সফলভাবে পরিবর্তন করা হয়েছে!',
        backgroundColor: const Color(AppConfig.accentGreen),
        textColor: Colors.white,
      );
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      } else {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (_) {
      Fluttertoast.showToast(msg: 'তথ্য সেভ করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _toggleGoal(String id) {
    setState(() {
      if (_selectedGoals.contains(id)) {
        _selectedGoals.remove(id);
      } else {
        _selectedGoals.add(id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0b0f19),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header title
              const Text(
                'আপনার লক্ষ্য ও বিভাগ নির্বাচন করুন 🎯',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
              ).animate().fadeIn().slideY(begin: -0.2, end: 0),

              const SizedBox(height: 4),

              Text(
                'একাধিক লক্ষ্য (১টি বা একাধিক) এবং বিভাগ পছন্দ করুন:',
                style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
              ),

              const SizedBox(height: 16),

              const Text('পরীক্ষার লক্ষ্য নির্বাচন (একাধিক সিলেক্ট করা যাবে):',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),

              const SizedBox(height: 10),

              // Goals Multi-Select Grid
              Expanded(
                child: GridView.builder(
                  physics: const BouncingScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3, crossAxisSpacing: 10, mainAxisSpacing: 10,
                    childAspectRatio: 1.05,
                  ),
                  itemCount: _goals.length,
                  itemBuilder: (ctx, i) {
                    final g = _goals[i];
                    final id = g['id'] as String;
                    final isSel = _selectedGoals.contains(id);
                    return GestureDetector(
                      onTap: () => _toggleGoal(id),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          color: isSel ? const Color(AppConfig.accentBlue).withOpacity(0.2) : const Color(0xFF161f33),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: isSel ? const Color(AppConfig.accentBlue) : Colors.white10,
                            width: isSel ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(g['emoji'] as String, style: const TextStyle(fontSize: 26)),
                            const SizedBox(height: 6),
                            Text(
                              g['name'] as String,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: isSel ? Colors.white : Colors.white70,
                                fontSize: 11, fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Department / Stream Selector (Shown ONLY when HSC or SSC is selected)
              if (_selectedGoals.contains('HSC') || _selectedGoals.contains('SSC')) ...[
                const SizedBox(height: 12),
                ClayCard(
                  color: const Color(0xFF161f33),
                  borderRadius: 20,
                  depth: 6,
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('বিভাগ / গ্রুপ পছন্দ করুন (HSC/SSC):',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _streams.map((s) {
                          final isSel = _selectedStream == s['id'];
                          final color = Color(s['color'] as int);
                          return ChoiceChip(
                            label: Text(s['label'] as String,
                              style: TextStyle(
                                color: isSel ? Colors.white : Colors.white70,
                                fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                            selected: isSel,
                            selectedColor: color,
                            backgroundColor: const Color(0xFF1e293b),
                            onSelected: (_) => setState(() => _selectedStream = s['id'] as String),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ).animate().fadeIn().slideY(begin: 0.1, end: 0),
              ],

              // Save CTA Button
              ClayButton(
                label: 'পছন্দ সেভ করে শুরু করুন 🚀 (${_selectedGoals.length}টি সিলেক্টেড)',
                loading: _loading,
                color: const Color(AppConfig.accentBlue),
                onPressed: _save,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
