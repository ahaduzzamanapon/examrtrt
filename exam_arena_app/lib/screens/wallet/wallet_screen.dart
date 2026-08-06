import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});
  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  bool _loading = true;
  Map _data = {};

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.get('/wallet');
      if (mounted) setState(() { _data = res.data; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      appBar: AppBar(title: const Text('ওয়ালেট')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(AppConfig.accentGreen)))
          : RefreshIndicator(
              onRefresh: _load,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  // Balance
                  GlassCard(
                    child: Column(children: [
                      const Text('💰', style: TextStyle(fontSize: 48)),
                      const SizedBox(height: 8),
                      Text('৳${_data['wallet_balance'] ?? 0}', style: const TextStyle(
                        color: Color(AppConfig.accentGreen), fontSize: 42, fontWeight: FontWeight.w900)),
                      Text('ওয়ালেট ব্যালেন্স', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                    ]),
                  ).animate().fadeIn(),

                  const SizedBox(height: 20),

                  Row(children: [
                    Expanded(child: _ActionBtn(
                      icon: Icons.add_circle_outline, label: 'ডিপোজিট',
                      color: AppConfig.accentGreen,
                      onTap: () => _showDepositSheet(context),
                    )),
                    const SizedBox(width: 12),
                    Expanded(child: _ActionBtn(
                      icon: Icons.arrow_circle_up_outlined, label: 'উইথড্র',
                      color: AppConfig.accentBlue,
                      onTap: () => _showWithdrawSheet(context),
                    )),
                  ]).animate().fadeIn(delay: 100.ms),

                  const SizedBox(height: 24),

                  const Text('লেনদেনের ইতিহাস', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                  const SizedBox(height: 12),

                  ...((_data['transactions'] as List?) ?? []).asMap().entries.map((e) {
                    final t = e.value;
                    final isDeposit = t['type'] == 'DEPOSIT';
                    return GlassCard(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      child: Row(children: [
                        Icon(isDeposit ? Icons.arrow_downward : Icons.arrow_upward,
                          color: isDeposit ? const Color(AppConfig.accentGreen) : const Color(AppConfig.accentRed), size: 20),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(isDeposit ? 'ডিপোজিট' : 'উইথড্র',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                          Text(t['status']?.toString() ?? '', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
                        ])),
                        Text('৳${t['amount'] ?? 0}',
                          style: TextStyle(
                            color: isDeposit ? const Color(AppConfig.accentGreen) : const Color(AppConfig.accentRed),
                            fontWeight: FontWeight.w800)),
                      ]),
                    ).animate(delay: (e.key * 60).ms).fadeIn();
                  }),

                  if ((_data['transactions'] as List?)?.isEmpty ?? true)
                    GlassCard(child: Center(
                      child: Padding(padding: const EdgeInsets.all(20), child: Column(children: [
                        const Text('💸', style: TextStyle(fontSize: 36)),
                        const SizedBox(height: 8),
                        Text('কোনো লেনদেন নেই', style: TextStyle(color: Colors.white.withOpacity(0.5))),
                      ])),
                    )),

                  const SizedBox(height: 80),
                ]),
              ),
            ),
    );
  }

  void _showDepositSheet(BuildContext ctx) {
    final amtCtrl  = TextEditingController();
    final methCtrl = TextEditingController();
    final trxCtrl  = TextEditingController();
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 20, right: 20, top: 20),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('ডিপোজিট করুন', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),
          TextField(controller: amtCtrl, keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(labelText: 'পরিমাণ (৳)', prefixIcon: Icon(Icons.money))),
          const SizedBox(height: 12),
          TextField(controller: methCtrl, style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(labelText: 'মাধ্যম (bKash/Nagad)', prefixIcon: Icon(Icons.payment))),
          const SizedBox(height: 12),
          TextField(controller: trxCtrl, style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(labelText: 'TrxID', prefixIcon: Icon(Icons.receipt_long))),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: () async {
              final auth = context.read<AuthProvider>();
              try {
                final dio = Dio(BaseOptions(
                  baseUrl: AppConfig.baseUrl,
                  headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
                ));
                await dio.post('/wallet/deposit', data: {
                  'amount': double.tryParse(amtCtrl.text) ?? 0,
                  'method': methCtrl.text,
                  'trx_id': trxCtrl.text,
                });
                Navigator.pop(ctx);
                Fluttertoast.showToast(msg: 'রিকোয়েস্ট পাঠানো হয়েছে', backgroundColor: const Color(AppConfig.accentGreen), textColor: Colors.white);
                _load();
              } catch (_) {}
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(AppConfig.accentGreen),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(vertical: 14)),
            child: const Text('পাঠাও', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
          )),
          const SizedBox(height: 20),
        ]),
      ),
    );
  }

  void _showWithdrawSheet(BuildContext ctx) {
    final amtCtrl  = TextEditingController();
    final methCtrl = TextEditingController();
    final accCtrl  = TextEditingController();
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 20, right: 20, top: 20),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('উইথড্র করুন', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),
          TextField(controller: amtCtrl, keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(labelText: 'পরিমাণ (৳)', prefixIcon: Icon(Icons.money))),
          const SizedBox(height: 12),
          TextField(controller: methCtrl, style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(labelText: 'মাধ্যম (bKash/Nagad)', prefixIcon: Icon(Icons.payment))),
          const SizedBox(height: 12),
          TextField(controller: accCtrl, style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(labelText: 'অ্যাকাউন্ট নম্বর', prefixIcon: Icon(Icons.phone))),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: () async {
              final auth = context.read<AuthProvider>();
              try {
                final dio = Dio(BaseOptions(
                  baseUrl: AppConfig.baseUrl,
                  headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
                ));
                await dio.post('/wallet/withdraw', data: {
                  'amount': double.tryParse(amtCtrl.text) ?? 0,
                  'method': methCtrl.text,
                  'account': accCtrl.text,
                });
                Navigator.pop(ctx);
                Fluttertoast.showToast(msg: 'রিকোয়েস্ট পাঠানো হয়েছে', backgroundColor: const Color(AppConfig.accentBlue), textColor: Colors.white);
                _load();
              } catch (_) {}
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(AppConfig.accentBlue),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(vertical: 14)),
            child: const Text('পাঠাও', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
          )),
          const SizedBox(height: 20),
        ]),
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final int color;
  final VoidCallback onTap;
  const _ActionBtn({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Color(color).withOpacity(0.12),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Color(color).withOpacity(0.3)),
      ),
      child: Column(children: [
        Icon(icon, color: Color(color), size: 24),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(color: Color(color), fontWeight: FontWeight.w700, fontSize: 12)),
      ]),
    ),
  );
}
