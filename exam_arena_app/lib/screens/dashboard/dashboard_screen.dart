import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';
import '../tokens/token_store_screen.dart';
import '../leaderboard/leaderboard_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _loading = true;
  List _exams = [];
  Map _stats = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.get('/dashboard');
      if (mounted) setState(() {
        _exams = res.data['upcoming_exams'] ?? [];
        _stats = res.data['stats'] ?? {};
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user ?? {};

    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      body: RefreshIndicator(
        color: const Color(AppConfig.accentBlue),
        backgroundColor: const Color(AppConfig.cardColor),
        onRefresh: _load,
        child: CustomScrollView(
          slivers: [
            // App Bar
            SliverAppBar(
              expandedHeight: 130,
              pinned: true,
              backgroundColor: const Color(AppConfig.bgColor),
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  padding: const EdgeInsets.fromLTRB(20, 50, 20, 16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft, end: Alignment.bottomRight,
                      colors: [const Color(0xFF0a0e23), const Color(AppConfig.accentBlue).withOpacity(0.15)],
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text('স্বাগতম, ${user['name']?.split(' ').first ?? 'শিক্ষার্থী'} 👋',
                        style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                      const SizedBox(height: 4),
                      Text('আজ কি পড়ার প্রস্তুতি আছে?',
                        style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                    ],
                  ),
                ),
              ),
              actions: [
                // Token badge
                GestureDetector(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TokenStoreScreen())),
                  child: Container(
                    margin: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(AppConfig.accentGold).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(AppConfig.accentGold).withOpacity(0.4)),
                    ),
                    child: Row(
                      children: [
                        const Text('🪙', style: TextStyle(fontSize: 14)),
                        const SizedBox(width: 4),
                        Text('${user['token_balance'] ?? 0}',
                          style: const TextStyle(color: Color(AppConfig.accentGold), fontWeight: FontWeight.w800, fontSize: 14)),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([

                  // Quick actions
                  Row(children: [
                    _QuickAction(emoji: '📖', label: 'প্র্যাকটিস', color: AppConfig.accentGreen,
                      onTap: () {}),
                    const SizedBox(width: 10),
                    _QuickAction(emoji: '🔥', label: 'সারভাইভাল', color: AppConfig.accentRed,
                      onTap: () {}),
                    const SizedBox(width: 10),
                    _QuickAction(emoji: '🏆', label: 'লিডারবোর্ড', color: AppConfig.accentGold,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LeaderboardScreen()))),
                    const SizedBox(width: 10),
                    _QuickAction(emoji: '🪙', label: 'টোকেন', color: AppConfig.accentBlue,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TokenStoreScreen()))),
                  ]).animate().fadeIn(delay: 100.ms).slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 20),

                  // Upcoming exams
                  const Text('আসন্ন পরীক্ষা',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),

                  if (_loading)
                    _Shimmer()
                  else if (_exams.isEmpty)
                    GlassCard(
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(children: [
                            const Text('📅', style: TextStyle(fontSize: 40)),
                            const SizedBox(height: 8),
                            Text('এখন কোনো পরীক্ষা নেই',
                              style: TextStyle(color: Colors.white.withOpacity(0.5))),
                          ]),
                        ),
                      ),
                    )
                  else
                    ..._exams.asMap().entries.map((e) => _ExamCard(exam: e.value)
                      .animate(delay: (e.key * 80).ms).fadeIn().slideX(begin: 0.2, end: 0)),

                  const SizedBox(height: 80),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final String emoji, label;
  final int color;
  final VoidCallback onTap;
  const _QuickAction({required this.emoji, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: Color(color).withOpacity(0.12),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Color(color).withOpacity(0.25)),
          ),
          child: Column(children: [
            Text(emoji, style: const TextStyle(fontSize: 22)),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(color: Color(color), fontSize: 10, fontWeight: FontWeight.w700)),
          ]),
        ),
      ),
    );
  }
}

class _ExamCard extends StatelessWidget {
  final Map exam;
  const _ExamCard({required this.exam});
  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(children: [
        Container(
          width: 46, height: 46,
          decoration: BoxDecoration(
            color: const Color(AppConfig.accentBlue).withOpacity(0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.school_rounded, color: Color(AppConfig.accentBlue), size: 22),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(exam['title'] ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 4),
          Text('প্রবেশ ফি: ৳${exam['entry_fee'] ?? 0}',
            style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
        ])),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(AppConfig.accentBlue), Color(AppConfig.accentPurple)]),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Text('যোগ দাও', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
        ),
      ]),
    ).animate().fadeIn();
  }
}

class _Shimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(children: List.generate(3, (i) => Container(
      margin: const EdgeInsets.only(bottom: 12),
      height: 72,
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(16),
      ),
    ).animate(onPlay: (c) => c.repeat()).shimmer(duration: 1200.ms, color: const Color(0xFF1e293b))));
  }
}
