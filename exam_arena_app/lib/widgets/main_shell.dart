import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../dashboard/dashboard_screen.dart';
import '../reel/reel_screen.dart';
import '../practice/practice_screen.dart';
import '../survival/survival_screen.dart';
import '../profile/profile_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    DashboardScreen(),
    ReelScreen(),
    PracticeScreen(),
    SurvivalScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: _BottomNav(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  final int currentIndex;
  final void Function(int) onTap;

  const _BottomNav({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final items = [
      _NavItem(icon: Icons.home_rounded,        label: 'হোম'),
      _NavItem(icon: Icons.play_circle_rounded,  label: 'রিল'),
      _NavItem(icon: Icons.book_rounded,         label: 'প্র্যাকটিস'),
      _NavItem(icon: Icons.local_fire_department_rounded, label: 'সারভাইভাল'),
      _NavItem(icon: Icons.person_rounded,       label: 'প্রোফাইল'),
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0d1225),
        border: Border(top: BorderSide(color: const Color(AppConfig.borderColor))),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 20),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 62,
          child: Row(
            children: List.generate(items.length, (i) {
              final selected = currentIndex == i;
              return Expanded(
                child: GestureDetector(
                  onTap: () => onTap(i),
                  behavior: HitTestBehavior.opaque,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Animated indicator dot
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: selected ? 24 : 0,
                          height: 3,
                          margin: const EdgeInsets.only(bottom: 4),
                          decoration: BoxDecoration(
                            color: const Color(AppConfig.accentBlue),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        Icon(
                          items[i].icon,
                          size: 22,
                          color: selected
                              ? const Color(AppConfig.accentBlue)
                              : const Color(0xFF4a5568),
                        ),
                        const SizedBox(height: 3),
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 200),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                            color: selected
                                ? const Color(AppConfig.accentBlue)
                                : const Color(0xFF4a5568),
                          ),
                          child: Text(items[i].label),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  _NavItem({required this.icon, required this.label});
}
