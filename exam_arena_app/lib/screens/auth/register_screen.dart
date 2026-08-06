import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/glass_card.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey   = GlobalKey<FormState>();
  final _nameCtrl  = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  bool _loading = false;
  bool _passVisible = false;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose(); _emailCtrl.dispose();
    _phoneCtrl.dispose(); _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      await context.read<AuthProvider>().register(
        name: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        password: _passCtrl.text,
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
      );
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/onboarding');
    } on DioException catch (e) {
      final errors = e.response?.data['errors'] as Map?;
      setState(() {
        _error = errors?.values.first?.first ??
            e.response?.data['message'] ?? 'রেজিস্ট্রেশন ব্যর্থ।';
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      body: Stack(
        children: [
          _GridBg(),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                children: [
                  const SizedBox(height: 16),
                  // Header
                  ShaderMask(
                    shaderCallback: (b) => const LinearGradient(
                      colors: [Color(AppConfig.accentGreen), Color(AppConfig.accentBlue)],
                    ).createShader(b),
                    child: const Text('নতুন অ্যাকাউন্ট',
                      style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white)),
                  ).animate().fadeIn(delay: 100.ms),
                  const SizedBox(height: 4),
                  Text('আজই যোগ দিন এবং প্রস্তুতি শুরু করুন',
                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
                  ).animate().fadeIn(delay: 200.ms),
                  const SizedBox(height: 28),

                  GlassCard(
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          if (_error != null) ...[
                            _ErrorBox(message: _error!),
                            const SizedBox(height: 16),
                          ],
                          AppTextField(controller: _nameCtrl, label: 'পুরো নাম', hint: 'আপনার নাম', icon: Icons.person_outline,
                            validator: (v) => v!.isEmpty ? 'নাম দিন' : null),
                          const SizedBox(height: 12),
                          AppTextField(controller: _emailCtrl, label: 'ইমেইল', hint: 'your@email.com',
                            icon: Icons.email_outlined, keyboardType: TextInputType.emailAddress,
                            validator: (v) => v!.isEmpty ? 'ইমেইল দিন' : null),
                          const SizedBox(height: 12),
                          AppTextField(controller: _phoneCtrl, label: 'মোবাইল (ঐচ্ছিক)', hint: '01XXXXXXXXX',
                            icon: Icons.phone_outlined, keyboardType: TextInputType.phone),
                          const SizedBox(height: 12),
                          AppTextField(
                            controller: _passCtrl, label: 'পাসওয়ার্ড', hint: 'কমপক্ষে ৮ অক্ষর',
                            icon: Icons.lock_outline, obscureText: !_passVisible,
                            suffix: IconButton(
                              icon: Icon(_passVisible ? Icons.visibility_off : Icons.visibility,
                                color: const Color(AppConfig.textSecondary), size: 20),
                              onPressed: () => setState(() => _passVisible = !_passVisible),
                            ),
                            validator: (v) => v!.length < 8 ? 'কমপক্ষে ৮ অক্ষর দিন' : null,
                          ),
                          const SizedBox(height: 20),
                          AppButton(label: 'রেজিস্ট্রেশন করুন', loading: _loading, onPressed: _register,
                            gradient: const LinearGradient(
                              colors: [Color(AppConfig.accentGreen), Color(AppConfig.accentBlue)])),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('ইতিমধ্যে অ্যাকাউন্ট আছে? ',
                        style: TextStyle(color: Colors.white.withOpacity(0.5))),
                      GestureDetector(
                        onTap: () => Navigator.pushReplacementNamed(context, '/login'),
                        child: const Text('লগইন করুন',
                          style: TextStyle(color: Color(AppConfig.accentBlue), fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ).animate().fadeIn(delay: 500.ms),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorBox extends StatelessWidget {
  final String message;
  const _ErrorBox({required this.message});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: const Color(AppConfig.accentRed).withOpacity(0.12),
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: const Color(AppConfig.accentRed).withOpacity(0.3)),
    ),
    child: Row(children: [
      const Icon(Icons.error_outline, color: Color(AppConfig.accentRed), size: 18),
      const SizedBox(width: 8),
      Expanded(child: Text(message, style: const TextStyle(color: Color(AppConfig.accentRed), fontSize: 13))),
    ]),
  );
}

class _GridBg extends StatelessWidget {
  @override
  Widget build(BuildContext context) => CustomPaint(
    painter: _GP(), size: MediaQuery.of(context).size);
}
class _GP extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = Colors.white.withOpacity(0.025)..strokeWidth = 1;
    for (double x = 0; x < size.width; x += 40) canvas.drawLine(Offset(x,0), Offset(x,size.height), p);
    for (double y = 0; y < size.height; y += 40) canvas.drawLine(Offset(0,y), Offset(size.width,y), p);
  }
  @override bool shouldRepaint(_) => false;
}
