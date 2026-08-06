import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';

class TokenStoreScreen extends StatefulWidget {
  const TokenStoreScreen({super.key});
  @override
  State<TokenStoreScreen> createState() => _TokenStoreScreenState();
}

class _TokenStoreScreenState extends State<TokenStoreScreen> {
  bool _loading = true;
  Map _data = {};
  bool _claiming = false;
  bool _adLoading = false;

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
      final res = await dio.get('/tokens');
      if (mounted) setState(() { _data = res.data; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _dailyClaim() async {
    setState(() => _claiming = true);
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.post('/tokens/daily-claim');
      final newBal = res.data['token_balance'];
      if (newBal != null) auth.updateUser({'token_balance': newBal});
      Fluttertoast.showToast(msg: res.data['message'] ?? 'বোনাস পেয়েছ!',
        backgroundColor: const Color(AppConfig.accentGreen), textColor: Colors.white);
      _load();
    } on DioException catch (e) {
      Fluttertoast.showToast(msg: e.response?.data['message'] ?? 'ব্যর্থ',
        backgroundColor: const Color(AppConfig.accentRed), textColor: Colors.white);
    } finally { if (mounted) setState(() => _claiming = false); }
  }

  Future<void> _watchAd() async {
    setState(() => _adLoading = true);
    await Future.delayed(const Duration(seconds: 2)); // simulate ad
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.post('/tokens/watch-ad');
      final newBal = res.data['token_balance'];
      if (newBal != null) auth.updateUser({'token_balance': newBal});
      Fluttertoast.showToast(msg: res.data['message'] ?? 'টোকেন পেয়েছ!',
        backgroundColor: const Color(AppConfig.accentGreen), textColor: Colors.white);
      _load();
    } catch (_) {} finally { if (mounted) setState(() => _adLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final balance = auth.user?['token_balance'] ?? 0;

    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      appBar: AppBar(title: const Text('টোকেন স্টোর')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(AppConfig.accentGold)))
          : RefreshIndicator(
              onRefresh: _load,
              color: const Color(AppConfig.accentGold),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

                  // Balance hero
                  GlassCard(
                    child: Column(children: [
                      const Text('🪙', style: TextStyle(fontSize: 48)),
                      const SizedBox(height: 8),
                      Text('$balance', style: const TextStyle(
                        color: Color(AppConfig.accentGold), fontSize: 48, fontWeight: FontWeight.w900)),
                      Text('টোকেন ব্যালেন্স', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                    ]),
                  ).animate().fadeIn().scale(begin: const Offset(0.9, 0.9)),

                  const SizedBox(height: 20),

                  // Earn section
                  const Text('টোকেন অর্জন করো', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                  const SizedBox(height: 12),

                  // Daily bonus
                  _EarnCard(
                    emoji: '📅',
                    title: 'দৈনিক বোনাস',
                    subtitle: 'প্রতিদিন একবার ৫ টোকেন পাও',
                    color: AppConfig.accentGreen,
                    loading: _claiming,
                    buttonLabel: 'নাও',
                    onTap: _dailyClaim,
                  ).animate().fadeIn(delay: 100.ms),
                  const SizedBox(height: 10),

                  // Watch ad
                  _EarnCard(
                    emoji: '📺',
                    title: 'বিজ্ঞাপন দেখো',
                    subtitle: '২ টোকেন পাবে প্রতিটি বিজ্ঞাপনে',
                    color: AppConfig.accentBlue,
                    loading: _adLoading,
                    buttonLabel: 'দেখো',
                    onTap: _watchAd,
                  ).animate().fadeIn(delay: 200.ms),

                  const SizedBox(height: 20),

                  // Packages
                  const Text('টোকেন কিনুন', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                  const SizedBox(height: 12),

                  ...((_data['packages'] as List?) ?? []).asMap().entries.map((e) {
                    final pkg = e.value;
                    return _PackageCard(pkg: pkg).animate(delay: (e.key * 80).ms).fadeIn().slideX(begin: 0.1, end: 0);
                  }),

                  // Referral
                  if (_data['referral_code'] != null) ...[
                    const SizedBox(height: 20),
                    const Text('রেফারেল', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                    const SizedBox(height: 12),
                    GlassCard(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('🎁 বন্ধুকে রেফার করো — ২০ টোকেন পাও',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0a0e23),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(_data['referral_code'] ?? '',
                            style: const TextStyle(color: Color(AppConfig.accentGold), fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 2)),
                        ),
                      ]),
                    ).animate().fadeIn(delay: 400.ms),
                  ],

                  const SizedBox(height: 80),
                ]),
              ),
            ),
    );
  }
}

class _EarnCard extends StatelessWidget {
  final String emoji, title, subtitle, buttonLabel;
  final int color;
  final bool loading;
  final VoidCallback onTap;

  const _EarnCard({
    required this.emoji, required this.title, required this.subtitle,
    required this.color, required this.buttonLabel, required this.onTap, required this.loading,
  });

  @override
  Widget build(BuildContext context) => GlassCard(
    padding: const EdgeInsets.all(14),
    child: Row(children: [
      Container(
        width: 44, height: 44,
        decoration: BoxDecoration(
          color: Color(color).withOpacity(0.15),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(child: Text(emoji, style: const TextStyle(fontSize: 22))),
      ),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
      ])),
      GestureDetector(
        onTap: loading ? null : onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: Color(color).withOpacity(0.2),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Color(color).withOpacity(0.4)),
          ),
          child: loading
              ? SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(color)))
              : Text(buttonLabel, style: TextStyle(color: Color(color), fontWeight: FontWeight.w800, fontSize: 13)),
        ),
      ),
    ]),
  );
}

class _PackageCard extends StatelessWidget {
  final dynamic pkg;
  const _PackageCard({required this.pkg});
  @override
  Widget build(BuildContext context) => GlassCard(
    padding: const EdgeInsets.all(16),
    child: Row(children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (pkg['badge'] != null)
          Container(
            margin: const EdgeInsets.only(bottom: 6),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(AppConfig.accentGold).withOpacity(0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(pkg['badge'].toString(), style: const TextStyle(color: Color(AppConfig.accentGold), fontSize: 10, fontWeight: FontWeight.w700)),
          ),
        Text(pkg['name']?.toString() ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
        Text('🪙 ${pkg['tokens']} টোকেন', style: const TextStyle(color: Color(AppConfig.accentGold), fontSize: 13, fontWeight: FontWeight.w700)),
      ])),
      ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(AppConfig.accentBlue),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        ),
        child: Text('৳${pkg['tokens']}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
      ),
    ]),
  );
}
