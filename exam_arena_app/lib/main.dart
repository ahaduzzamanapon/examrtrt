import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'config/app_config.dart';
import 'providers/auth_provider.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/auth/onboarding_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/reel/reel_screen.dart';
import 'screens/practice/practice_screen.dart';
import 'screens/survival/survival_screen.dart';
import 'screens/tokens/token_store_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/leaderboard/leaderboard_screen.dart';
import 'screens/wallet/wallet_screen.dart';
import 'widgets/main_shell.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotifications =
    FlutterLocalNotificationsPlugin();

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  // Status bar style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(AppConfig.bgColor),
  ));

  // Firebase init
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    await _initLocalNotifications();
    await _setupFCM();
  } catch (_) {
    // Firebase not configured yet — continue without it
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
      ],
      child: const ExamArenaApp(),
    ),
  );
}

Future<void> _initLocalNotifications() async {
  const AndroidInitializationSettings androidSettings =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  const InitializationSettings settings =
      InitializationSettings(android: androidSettings);
  await flutterLocalNotifications.initialize(settings);
}

Future<void> _setupFCM() async {
  final messaging = FirebaseMessaging.instance;
  await messaging.requestPermission(alert: true, badge: true, sound: true);

  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    final notification = message.notification;
    if (notification != null) {
      flutterLocalNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'exam_arena_channel',
            'Exam Arena Notifications',
            channelDescription: 'ExamArena push notifications',
            importance: Importance.high,
            priority: Priority.high,
            icon: '@mipmap/ic_launcher',
          ),
        ),
      );
    }
  });
}

class ExamArenaApp extends StatelessWidget {
  const ExamArenaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Exam Arena',
      debugShowCheckedModeBanner: false,
      theme: _buildTheme(),
      initialRoute: '/',
      routes: {
        '/':           (_) => const SplashScreen(),
        '/login':      (_) => const LoginScreen(),
        '/register':   (_) => const RegisterScreen(),
        '/onboarding': (_) => const OnboardingScreen(),
        '/home':       (_) => const MainShell(),
        '/reel':       (_) => const ReelScreen(),
        '/practice':   (_) => const PracticeScreen(),
        '/survival':   (_) => const SurvivalScreen(),
        '/tokens':     (_) => const TokenStoreScreen(),
        '/profile':    (_) => const ProfileScreen(),
        '/leaderboard':(_) => const LeaderboardScreen(),
        '/wallet':     (_) => const WalletScreen(),
      },
    );
  }

  ThemeData _buildTheme() {
    final base = ThemeData.dark();
    return base.copyWith(
      scaffoldBackgroundColor: const Color(AppConfig.bgColor),
      colorScheme: const ColorScheme.dark(
        primary:   Color(AppConfig.accentBlue),
        secondary: Color(AppConfig.accentPurple),
        surface:   Color(AppConfig.cardColor),
      ),
      textTheme: GoogleFonts.notoSansBengaliTextTheme(base.textTheme).copyWith(
        bodyMedium: GoogleFonts.notoSansBengali(color: Colors.white),
        bodyLarge:  GoogleFonts.notoSansBengali(color: Colors.white),
        titleLarge: GoogleFonts.notoSansBengali(
          color: Colors.white, fontWeight: FontWeight.w800,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(AppConfig.bgColor),
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.notoSansBengali(
          color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800,
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        systemOverlayStyle: SystemUiOverlayStyle.light,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF0d1225),
        selectedItemColor: Color(AppConfig.accentBlue),
        unselectedItemColor: Color(0xFF4a5568),
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF111827),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(AppConfig.borderColor)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFF1e293b)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(AppConfig.accentBlue), width: 2),
        ),
        labelStyle: const TextStyle(color: Color(0xFF94a3b8)),
        hintStyle: const TextStyle(color: Color(0xFF4a5568)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(AppConfig.accentBlue),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: GoogleFonts.notoSansBengali(
            fontSize: 16, fontWeight: FontWeight.w800,
          ),
          elevation: 0,
        ),
      ),
    );
  }
}
