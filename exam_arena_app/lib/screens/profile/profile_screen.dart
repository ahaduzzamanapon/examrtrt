import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/feedback_dialog.dart';
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
      final res = await dio.get('/profile');
      if (mounted) {
        setState(() {
          _recentTokens = res.data['recent_transactions'] ?? [];
          _loading = false;
        });
        auth.updateUser(res.data['user'] ?? {});
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _cleanGoalStr(dynamic raw) {
    if (raw == null) return 'BCS';
    return raw.toString()
        .replaceAll('[', '')
        .replaceAll(']', '')
        .replaceAll('"', '')
        .replaceAll("'", '')
        .replaceAll('\\', '')
        .toUpperCase();
  }

  Future<void> _updateProfile(Map<String, dynamic> data) async {
    final auth = context.read<AuthProvider>();
    try {
      if (data.containsKey('exam_goal')) {
        await auth.saveOnboarding(
          data['exam_goal'].toString(),
          stream: data['stream']?.toString(),
        );
      } else {
        final dio = Dio(BaseOptions(
          baseUrl: AppConfig.baseUrl,
          headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
        ));
        final res = await dio.patch('/profile', data: data);
        if (res.data['user'] != null) {
          auth.updateUser(res.data['user']);
        }
      }
      if (mounted) {
        setState(() {});
        Fluttertoast.showToast(
          msg: 'আপনার তথ্য সফলভাবে সেভ হয়েছে!',
          backgroundColor: const Color(AppConfig.accentGreen),
          textColor: Colors.white,
        );
      }
    } catch (_) {
      Fluttertoast.showToast(msg: 'আপডেট করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
    }
  }

  // Change Exam Goal & Department Sheet
  void _showGoalDialog() {
    final auth = context.read<AuthProvider>();
    final user = auth.user ?? {};

    final rawGoalStr = (user['exam_goal'] ?? 'BCS').toString();
    final cleanGoalStr = rawGoalStr.replaceAll('[', '').replaceAll(']', '').replaceAll('"', '').replaceAll("'", '').replaceAll('\\', '');
    final Set<String> selectedGoals = cleanGoalStr.split(',').map((e) => e.trim().toUpperCase()).where((e) => e.isNotEmpty).toSet();
    String selectedStream = (user['stream'] ?? 'science').toString();

    final goals = [
      {'id': 'BCS',         'name': 'BCS প্রিলি',        'emoji': '🏛️'},
      {'id': 'HSC',         'name': 'HSC প্রস্তুতি',      'emoji': '📘'},
      {'id': 'SSC',         'name': 'SSC প্রস্তুতি',      'emoji': '📗'},
      {'id': 'MEDICAL',     'name': 'মেডিকেল এডমিশন',    'emoji': '⚕️'},
      {'id': 'ENGINEERING', 'name': 'ইঞ্জিনিয়ারিং',       'emoji': '⚙️'},
      {'id': 'BANK',        'name': 'ব্যাংক জব',          'emoji': '🏦'},
      {'id': 'UNIVERSITY',  'name': 'ভার্সিটি ভর্তি',     'emoji': '🎓'},
      {'id': 'PRIMARY',     'name': 'প্রাইমারি শিক্ষক',   'emoji': '✏️'},
      {'id': 'NTRCA',       'name': 'NTRCA শিক্ষক নিবন্ধন', 'emoji': '📜'},
      {'id': 'OTHER',       'name': 'সাধারণ জ্ঞান',       'emoji': '📋'},
    ];

    final streams = [
      {'id': 'science',  'label': '🔬 বিজ্ঞান'},
      {'id': 'arts',     'label': '🎨 মানবিক'},
      {'id': 'commerce', 'label': '💼 ব্যবসায় শিক্ষা'},
      {'id': 'general',  'label': '🌐 সাধারণ'},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => SizedBox(
          height: MediaQuery.of(context).size.height * 0.75,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('🎯 লক্ষ্য ও বিভাগ পরিবর্তন',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text('এক বা একাধিক লক্ষ্য এবং আপনার বিভাগ বেছে নিন:',
                  style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12)),

                const SizedBox(height: 12),

                const Text('পরীক্ষার লক্ষ্য (একাধিক পছন্দ করা যাবে):',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),

                Expanded(
                  child: ListView(
                    physics: const BouncingScrollPhysics(),
                    children: goals.map((g) {
                      final id = g['id']!;
                      final sel = selectedGoals.contains(id);
                      return CheckboxListTile(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        tileColor: sel ? const Color(AppConfig.accentBlue).withOpacity(0.15) : const Color(0xFF1e293b),
                        dense: true,
                        activeColor: const Color(AppConfig.accentBlue),
                        secondary: Text(g['emoji']!, style: const TextStyle(fontSize: 22)),
                        title: Text(g['name']!, style: TextStyle(
                          color: sel ? Colors.white : Colors.white.withOpacity(0.8),
                          fontWeight: sel ? FontWeight.w800 : FontWeight.w600,
                        )),
                        value: sel,
                        onChanged: (val) {
                          setModalState(() {
                            if (val == true) {
                              selectedGoals.add(id);
                            } else {
                              selectedGoals.remove(id);
                            }
                          });
                        },
                      );
                    }).toList(),
                  ),
                ),

                // Department / Stream Selector (Shown ONLY when HSC or SSC is selected)
                if (selectedGoals.contains('HSC') || selectedGoals.contains('SSC')) ...[
                  const SizedBox(height: 10),
                  const Text('বিভাগ / গ্রুপ (HSC/SSC এর জন্য):', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: streams.map((s) {
                      final sel = selectedStream == s['id'];
                      return ChoiceChip(
                        label: Text(s['label']!, style: TextStyle(
                          color: sel ? Colors.white : Colors.white70,
                          fontSize: 11, fontWeight: sel ? FontWeight.w800 : FontWeight.w500,
                        )),
                        selected: sel,
                        selectedColor: const Color(AppConfig.accentBlue),
                        backgroundColor: const Color(0xFF1e293b),
                        onSelected: (_) => setModalState(() => selectedStream = s['id']!),
                      );
                    }).toList(),
                  ),
                ],

                const SizedBox(height: 12),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(AppConfig.accentBlue),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () async {
                      if (selectedGoals.isEmpty) {
                        Fluttertoast.showToast(
                          msg: 'কমপক্ষে ১টি লক্ষ সিলেক্ট করুন',
                          backgroundColor: const Color(AppConfig.accentRed),
                          textColor: Colors.white,
                        );
                        return;
                      }
                      Navigator.pop(ctx);
                      final goalStr = selectedGoals.join(',');
                      await _updateProfile({'exam_goal': goalStr, 'stream': selectedStream});
                    },
                    child: Text('সেভ করুন (${selectedGoals.length}টি সিলেক্টেড) 🚀',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Change / Set Password Dialog
  void _showPasswordDialog() {
    final auth = context.read<AuthProvider>();
    final user = auth.user ?? {};
    final bool hasPassword = user['has_password'] == true;

    final currCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();

    bool updating = false;
    String? errMessage;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF111827),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              Icon(hasPassword ? Icons.lock_reset_rounded : Icons.lock_outline_rounded, color: const Color(AppConfig.accentBlue)),
              const SizedBox(width: 10),
              Text(hasPassword ? 'পাসওয়ার্ড পরিবর্তন' : 'নতুন পাসওয়ার্ড সেট করুন', style: const TextStyle(color: Colors.white, fontSize: 16)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (!hasPassword)
                  Container(
                    padding: const EdgeInsets.all(10),
                    margin: const EdgeInsets.only(bottom: 14),
                    decoration: BoxDecoration(
                      color: const Color(AppConfig.accentGreen).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(AppConfig.accentGreen).withOpacity(0.3)),
                    ),
                    child: const Text('✨ Google দিয়ে লগইন করায় কোনো পুরাতন পাসওয়ার্ড নেই। সরাসরি নতুন পাসওয়ার্ড সেট করুন।',
                      style: TextStyle(color: Colors.white, fontSize: 11, height: 1.4)),
                  ),

                if (errMessage != null) ...[
                  Text(errMessage!, style: const TextStyle(color: Color(AppConfig.accentRed), fontSize: 12)),
                  const SizedBox(height: 8),
                ],

                if (hasPassword) ...[
                  AppTextField(controller: currCtrl, label: 'পুরাতন পাসওয়ার্ড', hint: 'বর্তমান পাসওয়ার্ড', obscureText: true, icon: Icons.lock),
                  const SizedBox(height: 12),
                ],

                AppTextField(controller: newCtrl, label: 'নতুন পাসওয়ার্ড', hint: 'কমপক্ষে ৮ অক্ষর', obscureText: true, icon: Icons.vpn_key),
                const SizedBox(height: 12),
                AppTextField(controller: confirmCtrl, label: 'পাসওয়ার্ড নিশ্চিতকরণ', hint: 'নতুন পাসওয়ার্ডটি আবার লিখুন', obscureText: true, icon: Icons.check),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: updating ? null : () => Navigator.pop(ctx),
              child: const Text('বাতিল', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppConfig.accentBlue),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: updating ? null : () async {
                if (newCtrl.text.length < 8) {
                  setDialogState(() => errMessage = 'কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন');
                  return;
                }
                if (newCtrl.text != confirmCtrl.text) {
                  setDialogState(() => errMessage = 'পাসওয়ার্ড দুটি মিলছে না');
                  return;
                }

                setDialogState(() { updating = true; errMessage = null; });

                try {
                  final dio = Dio(BaseOptions(
                    baseUrl: AppConfig.baseUrl,
                    headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
                  ));

                  final payload = <String, dynamic>{'password': newCtrl.text};
                  if (hasPassword) payload['current_password'] = currCtrl.text;

                  final res = await dio.patch('/profile', data: payload);
                  auth.updateUser(res.data['user'] ?? {});

                  if (ctx.mounted) Navigator.pop(ctx);
                  Fluttertoast.showToast(msg: 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! 🎉');
                } on DioException catch (e) {
                  setDialogState(() {
                    updating = false;
                    errMessage = e.response?.data['message'] ?? 'পাসওয়ার্ড আপডেট করা যায়নি';
                  });
                }
              },
              child: updating
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('সংরক্ষণ করুন', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
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
                    _StatCard(label: 'টোকেন', value: '${user['token_balance'] ?? 0}', emoji: '🪙', color: AppConfig.accentGold, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TokenStoreScreen()))),
                    const SizedBox(width: 10),
                    _StatCard(label: 'ব্যালেন্স', value: '৳${user['wallet_balance'] ?? 0}', emoji: '💰', color: AppConfig.accentGreen, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen()))),
                    const SizedBox(width: 10),
                    _StatCard(label: 'লক্ষ্য (Edit)', value: _cleanGoalStr(user['exam_goal']), emoji: '🎯', color: AppConfig.accentBlue, onTap: _showGoalDialog),
                  ]).animate().fadeIn(delay: 100.ms),

                  const SizedBox(height: 20),

                  // Profile action items
                  _MenuItem(
                    icon: Icons.track_changes_rounded,
                    label: 'পরীক্ষার লক্ষ্য পরিবর্তন',
                    subtitle: 'বর্তমান: ${_cleanGoalStr(user['exam_goal'])}',
                    onTap: _showGoalDialog,
                  ).animate(delay: 150.ms).fadeIn(),

                  _MenuItem(
                    icon: Icons.lock_reset_rounded,
                    label: user['has_password'] == true ? 'পাসওয়ার্ড পরিবর্তন' : 'নতুন পাসওয়ার্ড সেট করুন (Google User)',
                    subtitle: user['has_password'] == true ? 'আপনার পাসওয়ার্ড আপডেট করুন' : 'গুগল দিয়ে লগইন করেছেন — একটি নতুন পাসওয়ার্ড সেট করুন',
                    onTap: _showPasswordDialog,
                  ).animate(delay: 200.ms).fadeIn(),

                  // Menu items
                  ...[
                    _MenuItem(icon: Icons.chat_bubble_outline_rounded, label: 'ফিডব্যাক ও মতামত', subtitle: 'আপনার রেটিং ও পরামর্শ জানান',
                      onTap: () => showDialog(context: context, builder: (_) => const FeedbackDialog())),
                    _MenuItem(icon: Icons.account_balance_wallet_outlined, label: 'ওয়ালেট', subtitle: 'টাকা জমা/তোলা',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen()))),
                    _MenuItem(icon: Icons.token_outlined, label: 'টোকেন স্টোর', subtitle: 'টোকেন কিনুন বা অর্জন করুন',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TokenStoreScreen()))),
                    _MenuItem(icon: Icons.leaderboard_outlined, label: 'লিডারবোর্ড', subtitle: 'র‍্যাংকিং দেখুন',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LeaderboardScreen()))),
                  ].asMap().entries.map((e) => e.value.animate(delay: (e.key * 80 + 250).ms).fadeIn().slideX(begin: 0.1, end: 0)),

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
  final VoidCallback? onTap;
  const _StatCard({required this.label, required this.value, required this.emoji, required this.color, this.onTap});
  @override
  Widget build(BuildContext context) => Expanded(
    child: GestureDetector(
      onTap: onTap,
      child: GlassCard(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Column(children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: Color(color), fontWeight: FontWeight.w900, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
          Text(label, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 10)),
        ]),
      ),
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
    child: Container(
      margin: const EdgeInsets.only(bottom: 8),
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
    ),
  );
}
