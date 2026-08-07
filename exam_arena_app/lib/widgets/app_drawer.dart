import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../config/app_config.dart';
import '../providers/auth_provider.dart';
import '../screens/leaderboard/leaderboard_screen.dart';
import '../screens/tokens/token_store_screen.dart';
import '../screens/wallet/wallet_screen.dart';
import '../screens/auth/onboarding_screen.dart';

class AppDrawer extends StatelessWidget {
  final Function(int)? onNavigateTab;

  const AppDrawer({super.key, this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user ?? {};
    final referralCode = user['referral_code'] ?? 'EXAMARENA';

    return Drawer(
      backgroundColor: const Color(0xFF0a0e23),
      child: SafeArea(
        child: Column(
          children: [
            // User Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1a2a6c), Color(AppConfig.accentPurple)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border(
                  bottom: BorderSide(
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: Colors.white.withOpacity(0.2),
                        backgroundImage: user['avatar'] != null
                            ? NetworkImage(user['avatar'])
                            : null,
                        child: user['avatar'] == null
                            ? Text(
                                user['name']?[0]?.toUpperCase() ?? 'U',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user['name'] ?? 'শিক্ষার্থী',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              user['email'] ?? '',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.6),
                                fontSize: 12,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Token & Wallet Balance Pills
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              const Text('🪙', style: TextStyle(fontSize: 14)),
                              const SizedBox(width: 6),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'টোকেন',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.5),
                                      fontSize: 10,
                                    ),
                                  ),
                                  Text(
                                    '${user['token_balance'] ?? 0}',
                                    style: const TextStyle(
                                      color: Color(AppConfig.accentGold),
                                      fontWeight: FontWeight.w800,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              const Text('💳', style: TextStyle(fontSize: 14)),
                              const SizedBox(width: 6),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'ওয়ালেট',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.5),
                                      fontSize: 10,
                                    ),
                                  ),
                                  Text(
                                    '৳${user['wallet_balance'] ?? 0}',
                                    style: const TextStyle(
                                      color: Color(AppConfig.accentGreen),
                                      fontWeight: FontWeight.w800,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Referral Card
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(AppConfig.accentBlue).withOpacity(0.12),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: const Color(AppConfig.accentBlue).withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  const Text('🎁', style: TextStyle(fontSize: 24)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'রেফারেল কোড',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          referralCode,
                          style: const TextStyle(
                            color: Color(AppConfig.accentBlue),
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy_rounded, color: Colors.white, size: 20),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: referralCode));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('রেফারেল কোড কপি করা হয়েছে! 🎁 (+২০ টোকেন বোনাস)'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Menu Items List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                children: [
                  _DrawerTile(
                    icon: Icons.home_rounded,
                    label: 'হোম ড্যাশবোর্ড',
                    color: const Color(AppConfig.accentBlue),
                    onTap: () {
                      Navigator.pop(context);
                      onNavigateTab?.call(0);
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.sports_kabaddi_rounded,
                    label: '১v১ যুদ্ধ (Battle 1v1)',
                    color: const Color(0xFFef4444),
                    badge: 'HOT 🔥',
                    onTap: () {
                      Navigator.pop(context);
                      onNavigateTab?.call(3); // Survival / Battle tab
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.play_circle_rounded,
                    label: 'এমসিকিউ রিলস (MCQ Reel)',
                    color: const Color(0xFF8b5cf6),
                    onTap: () {
                      Navigator.pop(context);
                      onNavigateTab?.call(1);
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.menu_book_rounded,
                    label: 'এমসিকিউ প্র্যাকটিস',
                    color: const Color(AppConfig.accentGreen),
                    onTap: () {
                      Navigator.pop(context);
                      onNavigateTab?.call(2);
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.workspace_premium_rounded,
                    label: 'সারভাইভাল ডেথম্যাচ',
                    color: const Color(0xFFec4899),
                    onTap: () {
                      Navigator.pop(context);
                      onNavigateTab?.call(3);
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.military_tech_rounded,
                    label: 'লিডারবোর্ড',
                    color: const Color(AppConfig.accentGold),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LeaderboardScreen()),
                      );
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.stars_rounded,
                    label: 'টোকেন স্টোর & স্পিন',
                    color: const Color(AppConfig.accentGold),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const TokenStoreScreen()),
                      );
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.account_balance_wallet_rounded,
                    label: 'মাই ওয়ালেট (ডিপোজিট / ক্যাশআউট)',
                    color: const Color(AppConfig.accentGreen),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const WalletScreen()),
                      );
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.track_changes_rounded,
                    label: 'আমার লক্ষ্য পরিবর্তন করুন',
                    color: const Color(0xFF06b6d4),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const OnboardingScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),

            const Divider(color: Color(0xFF1e293b)),

            // Logout Button
            Padding(
              padding: const EdgeInsets.all(12),
              child: ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                tileColor: const Color(AppConfig.accentRed).withOpacity(0.12),
                leading: const Icon(
                  Icons.logout_rounded,
                  color: Color(AppConfig.accentRed),
                ),
                title: const Text(
                  'লগআউট করুন',
                  style: TextStyle(
                    color: Color(AppConfig.accentRed),
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
                onTap: () async {
                  Navigator.pop(context);
                  await auth.logout();
                  if (context.mounted) {
                    Navigator.pushReplacementNamed(context, '/login');
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawerTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final String? badge;
  final VoidCallback onTap;

  const _DrawerTile({
    required this.icon,
    required this.label,
    required this.color,
    this.badge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
        trailing: badge != null
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badge!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              )
            : const Icon(
                Icons.chevron_right_rounded,
                color: Color(0xFF4a5568),
                size: 20,
              ),
        onTap: onTap,
      ),
    );
  }
}
