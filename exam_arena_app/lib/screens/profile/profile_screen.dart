import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';
import '../tokens/token_store_screen.dart';
import '../wallet/wallet_screen.dart';
import '../leaderboard/leaderboard_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _loading = true;
  List _recentTokens = [];

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.get('/profile');
      if (mounted) {
        setState(() {
          _recentTokens = res.data['recent_transactions'] ?? [];
          _loading = false;
        });
        auth.updateUser(res.data['user'] ?? {});
      }
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        title: const Text('লগআউট', style: TextStyle(color: Colors.white)),
        content: Text('আপনি কি লগআউট করতে চান?', style: TextStyle(color: Colors.white.withOpacity(0.7))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('বাতিল')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('লগআউট', style: TextStyle(color: Color(AppConfig.accentRed))),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      await context.read<AuthProvider>().logout();
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user ?? {};

    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      body: RefreshIndicator(
        onRefresh: _load,
        color: const Color(AppConfig.accentBlue),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 200,
              pinned: true,
              backgroundColor: const Color(AppConfig.bgColor),
              actions: [
                IconButton(
                  icon: const Icon(Icons.logout_rounded, color: Color(AppConfig.accentRed)),
                  onPressed: _logout,
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter, end: Alignment.bottomCenter,
                      colors: [Color(0xFF1a1f3a), Color(AppConfig.bgColor)],
                    ),
                  ),
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const SizedBox(height: 40),
                    // Avatar
                    Container(
                      width: 80, height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(AppConfig.accentBlue), Color(AppConfig.accentPurple)],
                        ),
                        boxShadow: [BoxShadow(color: const Color(AppConfig.accentBlue).withOpacity(0.4), blurRadius: 16)],
                      ),
                      child: Center(
                        child: Text(
                          (user['name']?.toString() ?? 'U').substring(0, 1).toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                        ),
                      ),
                    ).animate().scale(curve: Curves.elasticOut),
                    const SizedBox(height: 10),
                    Text(user['name']?.toString() ?? '', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                    Text(user['email']?.toString() ?? '', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
                  ]),
                ),
              ),
            ),

            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([

                  // Stats row
                  Row(children: [
                    _StatCard(label: 'টোকেন', value: '${user['token_balance'] ?? 0}', emoji: '🪙', color: AppConfig.accentGold),
                    const SizedBox(width: 10),
                    _StatCard(label: 'ব্যালেন্স', value: '৳${user['wallet_balance'] ?? 0}', emoji: '💰', color: AppConfig.accentGreen),
                    const SizedBox(width: 10),
                    _StatCard(label: 'লক্ষ্য', value: user['exam_goal']?.toString().toUpperCase() ?? 'N/A', emoji: '🎯', color: AppConfig.accentBlue),
                  ]).animate().fadeIn(delay: 100.ms),

                  const SizedBox(height: 20),

                  // Menu items
                  ...[
                    _MenuItem(icon: Icons.account_balance_wallet_outlined, label: 'ওয়ালেট', subtitle: 'টাকা জমা/তোলা',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen()))),
                    _MenuItem(icon: Icons.token_outlined, label: 'টোকেন স্টোর', subtitle: 'টোকেন কিনুন বা অর্জন করুন',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TokenStoreScreen()))),
                    _MenuItem(icon: Icons.leaderboard_outlined, label: 'লিডারবোর্ড', subtitle: 'র‍্যাংকিং দেখুন',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LeaderboardScreen()))),
                  ].asMap().entries.map((e) => e.value.animate(delay: (e.key * 80 + 200).ms).fadeIn().slideX(begin: 0.1, end: 0)),

                  const SizedBox(height: 20),

                  // Recent tokens
                  const Text('সাম্প্রতিক টোকেন লেনদেন',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                  const SizedBox(height: 12),

                  if (_loading)
                    const Center(child: CircularProgressIndicator(color: Color(AppConfig.accentBlue)))
                  else
                    ..._recentTokens.asMap().entries.map((e) {
                      final t = e.value;
                      final isPositive = (t['amount'] ?? 0) > 0;
                      return GlassCard(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        child: Row(children: [
                          Icon(isPositive ? Icons.add_circle : Icons.remove_circle,
                            color: isPositive ? const Color(AppConfig.accentGreen) : const Color(AppConfig.accentRed), size: 20),
                          const SizedBox(width: 12),
                          Expanded(child: Text(t['description']?.toString() ?? '',
                            style: const TextStyle(color: Colors.white, fontSize: 13))),
                          Text('${isPositive ? '+' : ''}${t['amount'] ?? 0} 🪙',
                            style: TextStyle(
                              color: isPositive ? const Color(AppConfig.accentGreen) : const Color(AppConfig.accentRed),
                              fontWeight: FontWeight.w800, fontSize: 13)),
                        ]),
                      ).animate(delay: (e.key * 60).ms).fadeIn();
                    }),

                  if (_recentTokens.isEmpty && !_loading)
                    GlassCard(child: Center(
                      child: Padding(padding: const EdgeInsets.all(16), child: Text('কোনো লেনদেন নেই',
                        style: TextStyle(color: Colors.white.withOpacity(0.5)))))),

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

class _StatCard extends StatelessWidget {
  final String label, value, emoji;
  final int color;
  const _StatCard({required this.label, required this.value, required this.emoji, required this.color});
  @override
  Widget build(BuildContext context) => Expanded(
    child: GlassCard(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Column(children: [
        Text(emoji, style: const TextStyle(fontSize: 20)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: Color(color), fontWeight: FontWeight.w900, fontSize: 14)),
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 10)),
      ]),
    ),
  );
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label, subtitle;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.label, required this.subtitle, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      child: Row(children: [
        Icon(icon, color: const Color(AppConfig.accentBlue), size: 22),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
          Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
        ])),
        const Icon(Icons.chevron_right, color: Color(AppConfig.textSecondary), size: 18),
      ]),
    ),
  );
}
