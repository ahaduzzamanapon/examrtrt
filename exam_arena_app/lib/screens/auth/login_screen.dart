import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/glass_card.dart';

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
      final googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
      final account = await googleSignIn.signIn();
      if (account == null) { setState(() => _googleLoading = false); return; }

      final auth   = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) throw Exception('Google token পাওয়া যায়নি।');

      if (!mounted) return;
      await context.read<AuthProvider>().googleLogin(idToken);

      if (!mounted) return;
      final authProv = context.read<AuthProvider>();
      if (authProv.needsOnboarding) {
        Navigator.pushReplacementNamed(context, '/onboarding');
      } else {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (e) {
      setState(() => _error = 'Google লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
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

                  // Logo + Title
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 72, height: 72,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            gradient: const LinearGradient(
                              colors: [Color(0xFF1a2a6c), Color(AppConfig.accentPurple)],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(AppConfig.accentBlue).withOpacity(0.4),
                                blurRadius: 20, spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Text('🏆', style: TextStyle(fontSize: 36)),
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
                          'আপনার অ্যাকাউন্টে লগইন করুন',
                          style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
                        ).animate().fadeIn(delay: 300.ms),
                      ],
                    ),
                  ),

                  const SizedBox(height: 36),

                  // Form
                  GlassCard(
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

                          AppButton(
                            label: 'লগইন করুন',
                            loading: _loading,
                            onPressed: _login,
                            gradient: const LinearGradient(
                              colors: [Color(AppConfig.accentBlue), Color(AppConfig.accentPurple)],
                            ),
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
                  _GoogleButton(loading: _googleLoading, onTap: _googleLogin)
                      .animate().fadeIn(delay: 600.ms).slideY(begin: 0.2, end: 0),

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

class _GoogleButton extends StatelessWidget {
  final bool loading;
  final VoidCallback onTap;
  const _GoogleButton({required this.loading, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: loading ? null : onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1e293b)),
        ),
        child: loading
            ? const Center(child: SizedBox(
                width: 20, height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              ))
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Google G logo
                  Container(
                    width: 24, height: 24,
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
                    child: const Center(
                      child: Text('G', style: TextStyle(color: Color(0xFF4285F4), fontWeight: FontWeight.w900, fontSize: 14)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Google দিয়ে লগইন করুন',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15),
                  ),
                ],
              ),
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
