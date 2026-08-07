import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';
import '../../services/ad_service.dart';

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
      print('[TOKENS LOAD DATA]: ${res.data}');
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
      print('[DAILY CLAIM SUCCESS]: ${res.data}');
      final newBal = res.data['token_balance'];
      if (newBal != null) auth.updateUser({'token_balance': newBal});
      
      if (mounted) {
        setState(() {
          if (_data['status'] is Map) {
            _data['status']['daily_claimed'] = true;
          }
          if (newBal != null) _data['token_balance'] = newBal;
        });
      }

      Fluttertoast.showToast(msg: res.data['message'] ?? 'বোনাস পেয়েছ!',
        backgroundColor: const Color(AppConfig.accentGreen), textColor: Colors.white);
      _load();
    } on DioException catch (e) {
      print('[DAILY CLAIM ERROR]: ${e.response?.statusCode} - ${e.response?.data}');
      final msg = (e.response?.data is Map) ? e.response?.data['message'] : null;
      if (msg == 'Server Error' || e.response?.statusCode == 500) {
        Fluttertoast.showToast(msg: 'আজকের বোনাস ইতিমধ্যে দাবি করা হয়েছে! 🎯',
          backgroundColor: const Color(AppConfig.accentGreen), textColor: Colors.white);
        if (mounted) {
          setState(() {
            if (_data['status'] is Map) _data['status']['daily_claimed'] = true;
          });
        }
      } else {
        Fluttertoast.showToast(msg: msg ?? 'আজকের বোনাস নেওয়া শেষ!',
          backgroundColor: const Color(AppConfig.accentRed), textColor: Colors.white);
      }
    } finally { if (mounted) setState(() => _claiming = false); }
  }

  Future<void> _watchAd() async {
    setState(() => _adLoading = true);

    // Show Adsterra rewarded ad dialog
    await AdService.instance.showRewardedAd(
      context,
      onRewarded: () async {
        // User watched the ad — award tokens via API
        final auth = context.read<AuthProvider>();
        try {
          final dio = Dio(BaseOptions(
            baseUrl: AppConfig.baseUrl,
            headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
          ));
          final res = await dio.post('/tokens/watch-ad');
          final newBal = res.data['token_balance'];
          if (newBal != null) auth.updateUser({'token_balance': newBal});
          Fluttertoast.showToast(
            msg: res.data['message'] ?? '🎉 টোকেন পেয়েছ!',
            backgroundColor: const Color(AppConfig.accentGreen),
            textColor: Colors.white,
          );
          _load();
        } catch (_) {}
      },
      onDismissed: () {
        if (mounted) setState(() => _adLoading = false);
      },
    );
  }

  Future<void> _buyPackage(dynamic pkg) async {
    final pkgId = pkg['id'];
    final price = pkg['price'];
    final tokens = pkg['tokens'];

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('টোকেন কেনা', style: TextStyle(color: Colors.white)),
        content: Text('আপনি কি ৳$price দিয়ে $tokens টোকেন কিনতে চান?',
          style: TextStyle(color: Colors.white.withOpacity(0.8))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('বাতিল')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(AppConfig.accentBlue)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('কিনুন', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.post('/tokens/buy', data: {'package_id': pkgId});
      final newBal = res.data['token_balance'];
      final newWallet = res.data['wallet_balance'];
      if (newBal != null) auth.updateUser({'token_balance': newBal, if (newWallet != null) 'wallet_balance': newWallet});
      Fluttertoast.showToast(
        msg: res.data['message'] ?? 'টোকেন কেনা সফল হয়েছে! 🎉',
        backgroundColor: const Color(AppConfig.accentGreen),
        textColor: Colors.white,
      );
      _load();
    } on DioException catch (e) {
      Fluttertoast.showToast(
        msg: e.response?.data['message'] ?? 'কেনা সম্ভব হয়নি',
        backgroundColor: const Color(AppConfig.accentRed),
        textColor: Colors.white,
      );
    }
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
                  Builder(
                    builder: (context) {
                      final status = _data['status'] is Map ? _data['status'] as Map : {};
                      final dailyClaimed = status['daily_claimed'] == true;
                      return _EarnCard(
                        emoji: '📅',
                        title: 'দৈনিক বোনাস',
                        subtitle: dailyClaimed ? 'আজকের বোনাস নেওয়া হয়েছে 🎯' : 'প্রতিদিন একবার বোনাস পাও',
                        color: dailyClaimed ? 0xFF64748b : AppConfig.accentGreen,
                        loading: _claiming,
                        buttonLabel: dailyClaimed ? 'সম্পন্ন ✅' : 'নাও',
                        onTap: dailyClaimed ? () {} : _dailyClaim,
                      );
                    },
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
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _PackageCard(pkg: pkg, onBuy: () => _buyPackage(pkg)),
                    );
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
  final VoidCallback onBuy;
  const _PackageCard({required this.pkg, required this.onBuy});

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
        onPressed: onBuy,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(AppConfig.accentBlue),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        ),
        child: Text('৳${pkg['price'] ?? pkg['tokens']}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
      ),
    ]),
  );
}
