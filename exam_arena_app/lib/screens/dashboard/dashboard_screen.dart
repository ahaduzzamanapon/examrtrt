import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';
import '../tokens/token_store_screen.dart';
import '../leaderboard/leaderboard_screen.dart';
import '../practice/practice_screen.dart';
import '../survival/survival_screen.dart';
import '../reel/reel_screen.dart';
import '../wallet/wallet_screen.dart';
import '../auth/onboarding_screen.dart';

import '../../widgets/clay_card.dart';

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
      if (mounted) {
        setState(() {
          _exams = res.data['upcoming_exams'] ?? [];
          _stats = res.data['stats'] ?? {};
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showBattleModal() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Text('⚔️', style: TextStyle(fontSize: 24)),
            SizedBox(width: 10),
            Text('১v১ যুদ্ধ (Battle 1v1)', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('বন্ধুকে চ্যালেঞ্জ করো অথবা র্যান্ডম প্লেয়ারের সাথে লাইভ ১v১ লড়াই শুরু করো!',
              style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13, height: 1.5)),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFef4444),
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('⚡ ১v১ রুম তৈরি হচ্ছে... খুব শীঘ্রই লাইভ ম্যাচ শুরু হবে!')),
                );
              },
              icon: const Icon(Icons.bolt_rounded, color: Colors.white),
              label: const Text('লাইভ যুদ্ধ শুরু করো 🔥', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }

  void _showModelTestModal() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Text('📝', style: TextStyle(fontSize: 24)),
            SizedBox(width: 10),
            Text('মডেল টেস্ট', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('আপনার গোল অনুযায়ী সম্পূর্ণ সময়ভিত্তিক মডেল টেস্ট পরীক্ষা দিন!',
              style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13, height: 1.5)),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppConfig.accentBlue),
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const PracticeScreen()));
              },
              icon: const Icon(Icons.play_arrow_rounded, color: Colors.white),
              label: const Text('মডেল টেস্ট শুরু করো 🚀', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user ?? {};
    final referralCode = user['referral_code'] ?? 'EXAMARENA';

    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      body: RefreshIndicator(
        color: const Color(AppConfig.accentBlue),
        backgroundColor: const Color(AppConfig.cardColor),
        onRefresh: _load,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // ── Redesigned Header ─────────────────────────────────────────
            SliverAppBar(
              expandedHeight: 160,
              pinned: true,
              backgroundColor: const Color(AppConfig.bgColor),
              automaticallyImplyLeading: false,
              elevation: 0,
              flexibleSpace: FlexibleSpaceBar(
                collapseMode: CollapseMode.pin,
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Color(0xFF0f1535),
                        Color(0xFF0a0e23),
                      ],
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 52, 16, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Row(
                          children: [
                            // Avatar
                            Container(
                              width: 48, height: 48,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: const LinearGradient(
                                  colors: [Color(AppConfig.accentBlue), Color(AppConfig.accentPurple)],
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(AppConfig.accentBlue).withOpacity(0.4),
                                    blurRadius: 12,
                                  ),
                                ],
                              ),
                              child: user['avatar_url'] != null
                                  ? ClipOval(child: Image.network(user['avatar_url'].toString(), fit: BoxFit.cover, errorBuilder: (_, __, ___) => Center(child: Text((user['name']?[0] ?? 'U').toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)))))
                                  : Center(
                                      child: Text(
                                        (user['name']?[0] ?? 'U').toUpperCase(),
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20),
                                      ),
                                    ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'স্বাগতম, ${user['name']?.toString().split(' ').first ?? 'শিক্ষার্থী'}! 👋',
                                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, height: 1.2),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: const Color(AppConfig.accentBlue).withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(20),
                                          border: Border.all(color: const Color(AppConfig.accentBlue).withOpacity(0.4)),
                                        ),
                                        child: Text(
                                          '🎯 ${user['exam_goal']?.toString().toUpperCase() ?? 'BCS'}',
                                          style: const TextStyle(color: Color(AppConfig.accentBlue), fontSize: 10, fontWeight: FontWeight.w800),
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: const Color(0x260f1535),
                                          borderRadius: BorderRadius.circular(20),
                                          border: Border.all(color: const Color(0x4Df97316)),
                                        ),
                                        child: Text(
                                          '🔥 ${_stats['streak_count'] ?? 1} দিন',
                                          style: const TextStyle(color: Color(0xFFf97316), fontSize: 10, fontWeight: FontWeight.w800),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.notifications_outlined, color: Color(0xFF94a3b8), size: 22),
                              onPressed: () {},
                              padding: EdgeInsets.zero,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _QuickPill(
                              emoji: '🪙',
                              value: '${user['token_balance'] ?? 0}',
                              color: const Color(AppConfig.accentGold),
                              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TokenStoreScreen())),
                            ),
                            const SizedBox(width: 8),
                            _QuickPill(
                              emoji: '💰',
                              value: '৳${user['wallet_balance'] ?? 0}',
                              color: const Color(AppConfig.accentGreen),
                              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen())),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([

                  // ── Referral Banner ──────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1e1b4b), Color(0xFF312e81)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(AppConfig.accentPurple).withOpacity(0.4)),
                    ),
                    child: Row(
                      children: [
                        const Text('🎁', style: TextStyle(fontSize: 28)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('বন্ধুকে উপহার দাও +২০ টোকেন পাও!',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
                              const SizedBox(height: 2),
                              Text('রেফারেল কোড: $referralCode',
                                style: const TextStyle(color: Color(AppConfig.accentGold), fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1)),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(AppConfig.accentPurple),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: referralCode));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('🎁 রেফারেল কোড কপি হয়েছে!')),
                            );
                          },
                          icon: const Icon(Icons.copy_rounded, size: 16, color: Colors.white),
                          label: const Text('কপি', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ── 3D Clay Daily Streak & Weak Subject Analytics ─────────────
                  Row(
                    children: [
                      // Daily Streak Badge
                      Expanded(
                        child: ClayCard(
                          color: const Color(0xFF1e1b4b),
                          borderRadius: 20,
                          depth: 10,
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text('🔥', style: TextStyle(fontSize: 20)),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      '${_stats['streak_count'] ?? 1} Days',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(color: Color(0xFFf97316), fontWeight: FontWeight.w900, fontSize: 15),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              const Text('দৈনিক স্টাডি স্ট্রিক', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 11)),
                              Text('প্রতিদিন পড়ুন ও স্ট্রিক বাড়ান!', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 9)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      // Target goal badge
                      Expanded(
                        child: ClayCard(
                          color: const Color(0xFF064e3b),
                          borderRadius: 20,
                          depth: 10,
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text('🎯', style: TextStyle(fontSize: 20)),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      user['exam_goal']?.toString().toUpperCase() ?? 'BCS',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(color: Color(0xFF34d399), fontWeight: FontWeight.w900, fontSize: 15),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              const Text('লক্ষ্য অর্জনের পথ', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 11)),
                              Text('পছন্দের লক্ষ্য অনুযায়ী প্রশ্ন', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 9)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Weak Subjects Analytics Card
                  ClayCard(
                    color: const Color(0xFF161f33),
                    borderRadius: 24,
                    depth: 10,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Text('📊', style: TextStyle(fontSize: 20)),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'দুর্বল বিষয় অ্যানালিটিক্স (Weak Subjects)',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text('যে বিষয়গুলোতে প্রশ্ন বেশি ভুল হচ্ছে (অনুশীলন বাড়ান):',
                          style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
                        const SizedBox(height: 12),

                        ...((_stats['weak_subjects'] as List?) ?? [
                          {'name': 'English Grammar', 'accuracy': 45, 'emoji': '🔤'},
                          {'name': 'গাণিতিক যুক্তি', 'accuracy': 58, 'emoji': '🔢'},
                          {'name': 'কম্পিউটার ও প্রযুক্তি', 'accuracy': 64, 'emoji': '💻'},
                        ]).map((s) {
                          final acc = (s['accuracy'] as num? ?? 50).toDouble();
                          final color = acc < 50 ? const Color(0xFFef4444) : (acc < 60 ? const Color(0xFFf59e0b) : const Color(0xFF10b981));
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('${s['emoji'] ?? '📚'} ${s['name']}',
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
                                    Text('সঠিকতা: ${acc.toInt()}%',
                                      style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 12)),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(6),
                                  child: LinearProgressIndicator(
                                    value: acc / 100,
                                    minHeight: 8,
                                    backgroundColor: const Color(0xFF0f172a),
                                    valueColor: AlwaysStoppedAnimation(color),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ).animate().fadeIn(delay: 180.ms),

                  const SizedBox(height: 20),

                  // ── Feature Grid Section Header ──────────────────────────
                  const Text('সকল মোড ও গেমস্পেস',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 12),

                  // ── 6 Main Feature Cards Grid ────────────────────────────
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.3,
                    children: [
                      // 1v1 Battle
                      _FeatureGridCard(
                        emoji: '⚔️',
                        title: '১v১ যুদ্ধ (Battle)',
                        subtitle: 'লাইভ ১v১ ফাইট',
                        color: 0xFFef4444,
                        badge: 'HOT 🔥',
                        onTap: _showBattleModal,
                      ),
                      // Model Test
                      _FeatureGridCard(
                        emoji: '📝',
                        title: 'মডেল টেস্ট',
                        subtitle: 'পূর্ণাঙ্গ সময় টেস্ট',
                        color: 0xFF4d6fff,
                        onTap: _showModelTestModal,
                      ),
                      // MCQ Practice
                      _FeatureGridCard(
                        emoji: '📖',
                        title: 'এমসিকিউ প্র্যাকটিস',
                        subtitle: 'বিষয়ভিত্তিক প্র্যাকটিস',
                        color: 0xFF10b981,
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PracticeScreen())),
                      ),
                      // Survival Deathmatch
                      _FeatureGridCard(
                        emoji: '🔥',
                        title: 'সারভাইভাল মোড',
                        subtitle: '৩ জীবন ডেথম্যাচ',
                        color: 0xFFec4899,
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SurvivalScreen())),
                      ),
                      // MCQ Reel
                      _FeatureGridCard(
                        emoji: '🎬',
                        title: 'এমসিকিউ রিলস',
                        subtitle: 'সোয়াইপ এমসিকিউ',
                        color: 0xFF8b5cf6,
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReelScreen())),
                      ),
                      // Leaderboard
                      _FeatureGridCard(
                        emoji: '🏆',
                        title: 'লিডারবোর্ড',
                        subtitle: 'সেরা র‍্যাংকিং',
                        color: 0xFFf59e0b,
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LeaderboardScreen())),
                      ),
                    ],
                  ).animate().fadeIn(delay: 150.ms),

                  const SizedBox(height: 20),

                  // ── Wallet & Store Quick Bar ────────────────────────────
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TokenStoreScreen())),
                          child: GlassCard(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                const Text('🪙', style: TextStyle(fontSize: 22)),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('টোকেন স্টোর', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
                                      Text('ফ্রি টোকেন ও প্যাক', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen())),
                          child: GlassCard(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                const Text('💳', style: TextStyle(fontSize: 22)),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('মাই ওয়ালেট', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
                                      Text('ডিপোজিট / ক্যাশআউট', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ).animate().fadeIn(delay: 250.ms),

                  const SizedBox(height: 20),

                  // ── Goal Change Banner ──────────────────────────────────
                  GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const OnboardingScreen())),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF06b6d4).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF06b6d4).withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          const Text('🎯', style: TextStyle(fontSize: 22)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('পরীক্ষার লক্ষ্য পরিবর্তন করুন', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
                                Text('বর্তমান: ${user['exam_goal']?.toString().toUpperCase() ?? 'BCS'} (পরিবর্তন করতে ট্যাপ করো)', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right_rounded, color: Color(0xFF06b6d4)),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 300.ms),

                  const SizedBox(height: 24),

                  // ── Upcoming Exams Section ──────────────────────────────
                  const Text('আসন্ন পরীক্ষা ও প্রতিযোগিতা',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
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
                            Text('এখন কোনো পরীক্ষা লাইভ নেই',
                              style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                          ]),
                        ),
                      ),
                    )
                  else
                    ..._exams.asMap().entries.map((e) => _ExamCard(exam: e.value)
                      .animate(delay: (e.key * 80).ms).fadeIn().slideX(begin: 0.1, end: 0)),

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

class _FeatureGridCard extends StatefulWidget {
  final String emoji, title, subtitle;
  final int color;
  final String? badge;
  final VoidCallback onTap;

  const _FeatureGridCard({
    required this.emoji,
    required this.title,
    required this.subtitle,
    required this.color,
    this.badge,
    required this.onTap,
  });

  @override
  State<_FeatureGridCard> createState() => _FeatureGridCardState();
}

class _FeatureGridCardState extends State<_FeatureGridCard> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 120));
    _scale = Tween(begin: 1.0, end: 0.94).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _ctrl.forward(),
      onTapUp: (_) { _ctrl.reverse(); widget.onTap(); },
      onTapCancel: () => _ctrl.reverse(),
      child: AnimatedBuilder(
        animation: _scale,
        builder: (_, child) => Transform.scale(scale: _scale.value, child: child),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(widget.color).withOpacity(0.18),
                Color(widget.color).withOpacity(0.08),
              ],
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Color(widget.color).withOpacity(0.35)),
            boxShadow: [
              BoxShadow(color: Color(widget.color).withOpacity(0.12), blurRadius: 16, offset: const Offset(0, 4)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(widget.emoji, style: const TextStyle(fontSize: 28)),
                  if (widget.badge != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: [Color(widget.color), Color(widget.color).withOpacity(0.7)]),
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [BoxShadow(color: Color(widget.color).withOpacity(0.4), blurRadius: 8)],
                      ),
                      child: Text(widget.badge!, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900)),
                    ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.title,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 3),
                  Text(widget.subtitle,
                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickPill extends StatelessWidget {
  final String emoji, value;
  final Color color;
  final VoidCallback onTap;
  const _QuickPill({required this.emoji, required this.value, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 13)),
            const SizedBox(width: 5),
            Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 13)),
          ],
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
