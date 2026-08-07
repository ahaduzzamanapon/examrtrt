import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/google_sign_in_button.dart';
import '../../widgets/clay_card.dart';
import '../../widgets/clay_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey   = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  bool _loading        = false;
  bool _googleLoading  = false;
  bool _passVisible    = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });

    try {
      await context.read<AuthProvider>().login(
        _emailCtrl.text.trim(),
        _passCtrl.text,
      );
      if (!mounted) return;
      final auth = context.read<AuthProvider>();
      if (auth.needsOnboarding) {
        Navigator.pushReplacementNamed(context, '/onboarding');
      } else {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } on DioException catch (e) {
      setState(() {
        _error = e.response?.data['message'] ??
            (e.response?.data['errors']?['email']?[0]) ??
            'লগইন ব্যর্থ হয়েছে।';
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _googleLogin() async {
    setState(() { _googleLoading = true; _error = null; });
    try {
      final googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
        serverClientId: '165082016850-cfgpm4jfeoloug7fdhf5rrbbl066lnl2.apps.googleusercontent.com',
      );
      final account = await googleSignIn.signIn();
      if (account == null) { setState(() => _googleLoading = false); return; }

      final auth = await account.authentication;
      final idToken = auth.idToken;
      final accessToken = auth.accessToken;
      print('GOOGLE SIGN IN OK: email=${account.email}, idToken=${idToken != null}, accessToken=${accessToken != null}');
      
      if (idToken == null && accessToken == null) {
        throw Exception('Google token পাওয়া যায়নি।');
      }

      if (!mounted) return;
      await context.read<AuthProvider>().googleLogin(idToken ?? '', accessToken: accessToken);

      if (!mounted) return;
      final authProv = context.read<AuthProvider>();
      if (authProv.needsOnboarding) {
        Navigator.pushReplacementNamed(context, '/onboarding');
      } else {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } on DioException catch (e) {
      print('GOOGLE API ERROR: ${e.response?.data}');
      setState(() => _error = e.response?.data['message'] ?? 'Google লগইন ব্যর্থ হয়েছে।');
    } catch (e) {
      print('GOOGLE SIGN IN EXCEPTION: $e');
      setState(() => _error = 'Google লগইন ব্যর্থ: ${e.toString().replaceAll("Exception: ", "")}');
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      body: Stack(
        children: [
          _GridBackground(),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),

                  // Logo + 3D Clay Avatar
                  Center(
                    child: Column(
                      children: [
                        ClayCard(
                          color: const Color(0xFF1e293b),
                          borderRadius: 32,
                          depth: 14,
                          padding: const EdgeInsets.all(12),
                          child: ClipOval(
                            child: Image.asset(
                              'assets/images/clay_student_3d.png',
                              width: 90,
                              height: 90,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Text('🏆', style: TextStyle(fontSize: 48)),
                            ),
                          ),
                        ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),

                        const SizedBox(height: 16),

                        ShaderMask(
                          shaderCallback: (b) => const LinearGradient(
                            colors: [Color(AppConfig.accentBlue), Color(AppConfig.accentPurple)],
                          ).createShader(b),
                          child: const Text(
                            'Exam Arena',
                            style: TextStyle(
                              fontSize: 28, fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                        ).animate().fadeIn(delay: 200.ms),

                        const SizedBox(height: 4),
                        Text(
                          'আপনার অ্যাকাউন্টে লগইন করুন 🚀',
                          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13, fontWeight: FontWeight.w600),
                        ).animate().fadeIn(delay: 300.ms),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // 3D Clay Form Card
                  ClayCard(
                    color: const Color(0xFF161f33),
                    borderRadius: 28,
                    depth: 12,
                    padding: const EdgeInsets.all(20),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          if (_error != null) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(AppConfig.accentRed).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(AppConfig.accentRed).withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.error_outline, color: Color(AppConfig.accentRed), size: 18),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(_error!, style: const TextStyle(color: Color(AppConfig.accentRed), fontSize: 13))),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          AppTextField(
                            controller: _emailCtrl,
                            label: 'ইমেইল',
                            hint: 'your@email.com',
                            icon: Icons.email_outlined,
                            keyboardType: TextInputType.emailAddress,
                            validator: (v) => v!.isEmpty ? 'ইমেইল দিন' : null,
                          ),
                          const SizedBox(height: 14),

                          AppTextField(
                            controller: _passCtrl,
                            label: 'পাসওয়ার্ড',
                            hint: '••••••••',
                            icon: Icons.lock_outline,
                            obscureText: !_passVisible,
                            suffix: IconButton(
                              icon: Icon(
                                _passVisible ? Icons.visibility_off : Icons.visibility,
                                color: const Color(AppConfig.textSecondary), size: 20,
                              ),
                              onPressed: () => setState(() => _passVisible = !_passVisible),
                            ),
                            validator: (v) => v!.isEmpty ? 'পাসওয়ার্ড দিন' : null,
                          ),

                          const SizedBox(height: 20),

                          ClayButton(
                            label: 'লগইন করুন 🚀',
                            loading: _loading,
                            onPressed: _login,
                            color: const Color(AppConfig.accentBlue),
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 16),

                  // Divider
                  Row(children: [
                    Expanded(child: Divider(color: Colors.white.withOpacity(0.1))),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text('অথবা', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                    ),
                    Expanded(child: Divider(color: Colors.white.withOpacity(0.1))),
                  ]).animate().fadeIn(delay: 500.ms),

                  const SizedBox(height: 16),

                  // Google login
                  GoogleSignInButton(
                    loading: _googleLoading,
                    onTap: _googleLogin,
                    label: 'Google দিয়ে লগইন করুন',
                  ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 24),

                  // Register link
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('অ্যাকাউন্ট নেই? ', style: TextStyle(color: Colors.white.withOpacity(0.5))),
                        GestureDetector(
                          onTap: () => Navigator.pushReplacementNamed(context, '/register'),
                          child: const Text(
                            'রেজিস্ট্রেশন করুন',
                            style: TextStyle(
                              color: Color(AppConfig.accentBlue),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 700.ms),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}


class _GridBackground extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _GridPainter(),
      size: MediaQuery.of(context).size,
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white.withOpacity(0.025)..strokeWidth = 1;
    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }
  @override bool shouldRepaint(_) => false;
}
