import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import '../../config/app_config.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/reel/reel_screen.dart';
import '../screens/practice/practice_screen.dart';
import '../screens/survival/survival_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../widgets/app_drawer.dart';
import '../widgets/subject_selector_sheet.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  List<String> _selectedSubjects = [];

  // GlobalKeys so we can call reload on screens after subject selection
  final _reelKey = GlobalKey<ReelScreenState>();
  final _practiceKey = GlobalKey<PracticeScreenState>();
  final _survivalKey = GlobalKey<SurvivalScreenState>();

  void _showSubjectSelector(int tabIndex) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SubjectSelectorSheet(
        selectedSubjects: _selectedSubjects,
        onConfirm: (subs) {
          setState(() => _selectedSubjects = subs);
          // Reload the relevant screen with new subjects
          if (tabIndex == 1) _reelKey.currentState?.reloadWithSubjects(subs);
          if (tabIndex == 2) _practiceKey.currentState?.updateSubjects(subs);
          if (tabIndex == 3) _survivalKey.currentState?.reloadWithSubjects(subs);
        },
      ),
    );
  }

  void _onNavTap(int i) {
    if (i == _currentIndex) return;
    HapticFeedback.selectionClick();
    setState(() => _currentIndex = i);

    // Show subject selector when entering Reel, Practice, or Survival
    if (i == 1 || i == 2 || i == 3) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showSubjectSelector(i);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: AppDrawer(
        onNavigateTab: (i) {
          setState(() => _currentIndex = i);
          if (i == 1 || i == 2 || i == 3) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              _showSubjectSelector(i);
            });
          }
        },
      ),
      backgroundColor: const Color(AppConfig.bgColor),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          const DashboardScreen(),
          ReelScreen(key: _reelKey, initialSubjects: _selectedSubjects),
          PracticeScreen(key: _practiceKey, initialSubjects: _selectedSubjects),
          SurvivalScreen(key: _survivalKey, initialSubjects: _selectedSubjects),
          const ProfileScreen(),
        ],
      ),
      bottomNavigationBar: _BottomNav(
        currentIndex: _currentIndex,
        onTap: _onNavTap,
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
      _NavItem(icon: Icons.home_rounded,                   activeIcon: Icons.home_rounded,         label: 'হোম',        color: const Color(0xFF60a5fa)),
      _NavItem(icon: Icons.play_circle_outline_rounded,    activeIcon: Icons.play_circle_rounded,  label: 'রিল',        color: const Color(0xFFa78bfa)),
      _NavItem(icon: Icons.menu_book_outlined,             activeIcon: Icons.menu_book_rounded,    label: 'প্র্যাকটিস', color: const Color(0xFF34d399)),
      _NavItem(icon: Icons.local_fire_department_outlined, activeIcon: Icons.local_fire_department_rounded, label: 'সারভাইভাল', color: const Color(0xFFfb923c)),
      _NavItem(icon: Icons.person_outline_rounded,         activeIcon: Icons.person_rounded,       label: 'প্রোফাইল',  color: const Color(0xFFf472b6)),
    ];

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0d1225).withOpacity(0.92),
            border: Border(
              top: BorderSide(color: Colors.white.withOpacity(0.08), width: 0.5),
            ),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 30, offset: const Offset(0, -5)),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                children: List.generate(items.length, (i) {
                  final selected = currentIndex == i;
                  final item = items[i];
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => onTap(i),
                      behavior: HitTestBehavior.opaque,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        curve: Curves.easeOutCubic,
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                        decoration: BoxDecoration(
                          color: selected ? item.color.withOpacity(0.15) : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                          border: selected
                              ? Border.all(color: item.color.withOpacity(0.25), width: 1)
                              : null,
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 200),
                              child: selected
                                  ? _GlowIcon(icon: item.activeIcon, color: item.color, key: ValueKey('active_$i'))
                                  : Icon(item.icon, size: 22, color: const Color(0xFF475569), key: ValueKey('inactive_$i')),
                            ),
                            const SizedBox(height: 4),
                            AnimatedDefaultTextStyle(
                              duration: const Duration(milliseconds: 200),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: selected ? FontWeight.w800 : FontWeight.w500,
                                color: selected ? item.color : const Color(0xFF475569),
                                letterSpacing: selected ? 0.2 : 0,
                              ),
                              child: Text(item.label),
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
        ),
      ),
    );
  }
}

class _GlowIcon extends StatelessWidget {
  final IconData icon;
  final Color color;
  const _GlowIcon({required this.icon, required this.color, super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36, height: 36,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(colors: [color.withOpacity(0.3), Colors.transparent]),
      ),
      child: Icon(icon, size: 24, color: color),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final Color color;
  _NavItem({required this.icon, required this.activeIcon, required this.label, required this.color});
}
