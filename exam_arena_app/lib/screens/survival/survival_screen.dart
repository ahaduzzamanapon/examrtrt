import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';

class SurvivalScreen extends StatefulWidget {
  const SurvivalScreen({super.key});
  @override
  State<SurvivalScreen> createState() => _SurvivalScreenState();
}

class _SurvivalScreenState extends State<SurvivalScreen> with TickerProviderStateMixin {
  List<Map> _questions = [];
  bool _loading = true;
  bool _started = false;
  int _currentQ = 0;
  int _lives = 3;
  int _score = 0;
  bool _gameOver = false;
  bool _won = false;
  String? _feedback;
  late AnimationController _heartAnim;

  @override
  void initState() {
    super.initState();
    _heartAnim = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.get('/survival/questions');
      if (mounted) setState(() {
        _questions = List<Map>.from(res.data['questions'] ?? []);
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _recordLoss() async {
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.post('/survival/loss');
      final newBal = res.data['token_balance'];
      if (newBal != null) auth.updateUser({'token_balance': newBal});
    } catch (_) {}
  }

  void _answer(String opt) {
    if (_gameOver || _won) return;
    final q = _questions[_currentQ];
    final correct = opt == q['correct_answer'];

    if (correct) {
      setState(() {
        _score++;
        _feedback = '✅ সঠিক!';
        if (_currentQ == _questions.length - 1) _won = true;
        else _currentQ++;
      });
    } else {
      setState(() {
        _lives--;
        _feedback = '❌ ভুল! সঠিক: ${q['correct_answer']}';
        _heartAnim.forward().then((_) => _heartAnim.reset());
        if (_lives == 0) {
          _gameOver = true;
          _recordLoss();
        } else {
          _currentQ++;
        }
      });
    }

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted && !_gameOver && !_won) setState(() => _feedback = null);
    });
  }

  void _restart() {
    setState(() {
      _currentQ = 0; _lives = 3; _score = 0;
      _gameOver = false; _won = false; _feedback = null; _started = false;
    });
    _load();
  }

  @override
  void dispose() {
    _heartAnim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(
      backgroundColor: Color(AppConfig.bgColor),
      body: Center(child: CircularProgressIndicator(color: Color(AppConfig.accentRed))));

    if (!_started) return _buildIntro();
    if (_gameOver) return _buildGameOver();
    if (_won) return _buildWin();
    return _buildGame();
  }

  Widget _buildIntro() => Scaffold(
    backgroundColor: const Color(AppConfig.bgColor),
    appBar: AppBar(title: const Text('Survival Deathmatch')),
    body: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Text('🔥', style: TextStyle(fontSize: 72)).animate().scale(curve: Curves.elasticOut),
        const SizedBox(height: 16),
        const Text('Survival Deathmatch', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
        const SizedBox(height: 8),
        Text('৩টি জীবন নিয়ে শুরু করো। ভুল করলে ১টি জীবন যাবে। সব শেষ হলে ১ টোকেন কাটা যাবে!',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13, height: 1.5)),
        const SizedBox(height: 32),
        // Lives display
        Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(3, (i) =>
          const Padding(padding: EdgeInsets.symmetric(horizontal: 6), child: Text('❤️', style: TextStyle(fontSize: 28))))),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => setState(() => _started = true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(AppConfig.accentRed),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: const Text('শুরু করো 🔥', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
          ),
        ),
      ].animate(interval: 100.ms).fadeIn()),
    ),
  );

  Widget _buildGame() {
    if (_questions.isEmpty || _currentQ >= _questions.length) return const SizedBox();
    final q = _questions[_currentQ];
    final options = q['options'] is List ? List<String>.from(q['options']) : <String>[];

    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      appBar: AppBar(
        title: const Text('Survival'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Row(children: List.generate(3, (i) => Text(
              i < _lives ? '❤️' : '🖤',
              style: const TextStyle(fontSize: 18),
            ))),
          ),
        ],
      ),
      body: Column(
        children: [
          // Score + Progress
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(children: [
              Text('স্কোর: $_score', style: const TextStyle(color: Color(AppConfig.accentGold), fontWeight: FontWeight.w800)),
              const Spacer(),
              Text('${_currentQ + 1}/${_questions.length}', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
            ]),
          ),
          LinearProgressIndicator(
            value: (_currentQ + 1) / _questions.length,
            backgroundColor: const Color(0xFF1e293b),
            valueColor: const AlwaysStoppedAnimation(Color(AppConfig.accentRed)),
          ),

          // Feedback banner
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: _feedback != null ? Container(
              key: ValueKey(_feedback),
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              color: _feedback!.startsWith('✅')
                  ? const Color(AppConfig.accentGreen).withOpacity(0.2)
                  : const Color(AppConfig.accentRed).withOpacity(0.2),
              child: Text(_feedback!, textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            ) : const SizedBox.shrink(),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                GlassCard(
                  child: Text(q['question_text'] ?? '',
                    style: const TextStyle(color: Colors.white, fontSize: 16, height: 1.6, fontWeight: FontWeight.w600)),
                ).animate().fadeIn(),
                const SizedBox(height: 16),
                ...options.asMap().entries.map((e) {
                  final opt = e.value;
                  final label = ['ক', 'খ', 'গ', 'ঘ'][e.key < 4 ? e.key : 0];
                  return GestureDetector(
                    onTap: () => _answer(opt),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(AppConfig.borderColor)),
                      ),
                      child: Row(children: [
                        Container(
                          width: 28, height: 28,
                          decoration: BoxDecoration(
                            color: const Color(AppConfig.accentRed).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Center(child: Text(label, style: const TextStyle(color: Color(AppConfig.accentRed), fontWeight: FontWeight.w800, fontSize: 12))),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Text(opt, style: const TextStyle(color: Colors.white, fontSize: 14))),
                      ]),
                    ),
                  ).animate(delay: (e.key * 60).ms).fadeIn().slideX(begin: 0.1, end: 0);
                }),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGameOver() => Scaffold(
    backgroundColor: const Color(AppConfig.bgColor),
    body: Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Text('💀', style: TextStyle(fontSize: 72)).animate().scale(curve: Curves.elasticOut),
          const SizedBox(height: 16),
          const Text('Game Over!', style: TextStyle(color: Color(AppConfig.accentRed), fontSize: 28, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Text('স্কোর: $_score', style: const TextStyle(color: Color(AppConfig.accentGold), fontSize: 22, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(AppConfig.accentRed).withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(AppConfig.accentRed).withOpacity(0.4)),
            ),
            child: const Text('🪙 -১ টোকেন কাটা হয়েছে', style: TextStyle(color: Color(AppConfig.accentRed), fontWeight: FontWeight.w700)),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _restart,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppConfig.accentRed),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('আবার খেলো', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
            ),
          ),
        ].animate(interval: 100.ms).fadeIn()),
      ),
    ),
  );

  Widget _buildWin() => Scaffold(
    backgroundColor: const Color(AppConfig.bgColor),
    body: Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Text('🏆', style: TextStyle(fontSize: 72)).animate().scale(curve: Curves.elasticOut),
          const SizedBox(height: 16),
          const Text('অসাধারণ!', style: TextStyle(color: Color(AppConfig.accentGreen), fontSize: 28, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Text('স্কোর: $_score / ${_questions.length}', style: const TextStyle(color: Color(AppConfig.accentGold), fontSize: 22, fontWeight: FontWeight.w800)),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _restart,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppConfig.accentGreen),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('আবার খেলো', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
            ),
          ),
        ].animate(interval: 100.ms).fadeIn()),
      ),
    ),
  );
}
