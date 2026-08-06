import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});
  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  bool _loading = true;
  List _users = [];

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.get('/leaderboard');
      if (mounted) setState(() { _users = res.data['leaderboard'] ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      appBar: AppBar(title: const Text('লিডারবোর্ড 🏆')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(AppConfig.accentGold)))
          : RefreshIndicator(
              onRefresh: _load,
              child: Column(
                children: [
                  // Top 3 podium
                  if (_users.length >= 3)
                    _Podium(users: _users.take(3).toList()).animate().fadeIn(),

                  // Rest of the list
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _users.length > 3 ? _users.length - 3 : 0,
                      itemBuilder: (ctx, i) {
                        final rank = i + 4;
                        final u = _users[i + 3];
                        return _UserRow(rank: rank, user: u)
                          .animate(delay: (i * 50).ms).fadeIn().slideX(begin: 0.1, end: 0);
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

class _Podium extends StatelessWidget {
  final List users;
  const _Podium({required this.users});

  @override
  Widget build(BuildContext context) {
    final medals = ['🥇', '🥈', '🥉'];
    final colors = [AppConfig.accentGold, 0xFFa1a1aa, 0xFFcd7c2f];

    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2nd place
          Expanded(child: _PodiumItem(user: users[1], medal: medals[1], color: Color(colors[1]), height: 80)),
          const SizedBox(width: 8),
          // 1st place
          Expanded(child: _PodiumItem(user: users[0], medal: medals[0], color: Color(colors[0]), height: 110)),
          const SizedBox(width: 8),
          // 3rd place
          Expanded(child: _PodiumItem(user: users[2], medal: medals[2], color: Color(colors[2]), height: 60)),
        ],
      ),
    );
  }
}

class _PodiumItem extends StatelessWidget {
  final dynamic user;
  final String medal;
  final Color color;
  final double height;
  const _PodiumItem({required this.user, required this.medal, required this.color, required this.height});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(medal, style: const TextStyle(fontSize: 28)),
      const SizedBox(height: 4),
      Text(user['name']?.toString().split(' ').first ?? '?',
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
      const SizedBox(height: 4),
      Container(
        height: height,
        decoration: BoxDecoration(
          color: color.withOpacity(0.2),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
          border: Border.all(color: color.withOpacity(0.5)),
        ),
        child: Center(
          child: Text('🪙${user['token_balance'] ?? 0}',
            style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 12)),
        ),
      ),
    ]);
  }
}

class _UserRow extends StatelessWidget {
  final int rank;
  final dynamic user;
  const _UserRow({required this.rank, required this.user});

  @override
  Widget build(BuildContext context) => GlassCard(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
    child: Row(children: [
      SizedBox(
        width: 30,
        child: Text('$rank', style: const TextStyle(color: Color(AppConfig.textSecondary), fontWeight: FontWeight.w700)),
      ),
      const SizedBox(width: 8),
      CircleAvatar(
        radius: 18,
        backgroundColor: const Color(AppConfig.accentBlue).withOpacity(0.2),
        child: Text(user['name']?.toString().substring(0, 1).toUpperCase() ?? '?',
          style: const TextStyle(color: Color(AppConfig.accentBlue), fontWeight: FontWeight.w900)),
      ),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(user['name']?.toString() ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
        Text(user['exam_goal']?.toString() ?? '', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
      ])),
      Text('🪙 ${user['token_balance'] ?? 0}',
        style: const TextStyle(color: Color(AppConfig.accentGold), fontWeight: FontWeight.w800)),
    ]),
  );
}
