import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/glass_card.dart';

class PracticeScreen extends StatefulWidget {
  const PracticeScreen({super.key});
  @override
  State<PracticeScreen> createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  int _count = 10;
  bool _loading = false;
  List<Map> _questions = [];
  bool _started = false;
  int _currentQ = 0;
  Map<int, String> _answers = {};
  bool _showResult = false;
  String? _aiAnswer;
  bool _askingAi = false;

  final _counts = [5, 10, 15, 20];

  Future<void> _start() async {
    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.post('/practice/start', data: {'count': _count});
      final qs = List<Map>.from(res.data['questions'] ?? []);
      final newBal = res.data['token_balance'];
      if (newBal != null) auth.updateUser({'token_balance': newBal});

      setState(() { _questions = qs; _started = true; _loading = false; _currentQ = 0; _answers = {}; });
    } on DioException catch (e) {
      setState(() => _loading = false);
      Fluttertoast.showToast(
        msg: e.response?.data['message'] ?? 'শুরু করা যায়নি',
        backgroundColor: const Color(AppConfig.accentRed),
        textColor: Colors.white,
      );
    }
  }

  Future<void> _askAi() async {
    if (_questions.isEmpty) return;
    final q = _questions[_currentQ];
    setState(() { _askingAi = true; _aiAnswer = null; });
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.post('/practice/ask-ai', data: {
        'question': q['question_text'],
        'context': 'সঠিক উত্তর: ${q['correct_answer']}',
      });
      setState(() => _aiAnswer = res.data['answer']);
    } catch (_) {
      setState(() => _aiAnswer = 'AI উত্তর দিতে পারেনি।');
    } finally {
      setState(() => _askingAi = false);
    }
  }

  int get _score {
    int s = 0;
    for (var i = 0; i < _questions.length; i++) {
      if (_answers[i] == _questions[i]['correct_answer']) s++;
    }
    return s;
  }

  @override
  Widget build(BuildContext context) {
    if (!_started) return _buildSetup();
    if (_showResult) return _buildResult();
    return _buildQuiz();
  }

  Widget _buildSetup() {
    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      appBar: AppBar(title: const Text('প্র্যাকটিস মোড')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GlassCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('📖', style: TextStyle(fontSize: 36)),
              const SizedBox(height: 12),
              const Text('প্র্যাকটিস মোড', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Text('তোমার goal অনুযায়ী MCQ প্র্যাকটিস করো। ⚡ ২ টোকেন খরচ হবে।',
                style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13, height: 1.5)),
            ])).animate().fadeIn(),

            const SizedBox(height: 24),
            const Text('প্রশ্ন সংখ্যা বেছে নাও',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
            const SizedBox(height: 12),

            Row(children: _counts.map((c) {
              final sel = c == _count;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _count = c),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: sel ? const Color(AppConfig.accentBlue).withOpacity(0.2) : const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: sel ? const Color(AppConfig.accentBlue) : const Color(AppConfig.borderColor)),
                    ),
                    child: Column(children: [
                      Text('$c', style: TextStyle(color: sel ? const Color(AppConfig.accentBlue) : Colors.white, fontWeight: FontWeight.w800, fontSize: 20)),
                      Text('প্রশ্ন', style: TextStyle(color: sel ? const Color(AppConfig.accentBlue) : Colors.white.withOpacity(0.4), fontSize: 10)),
                    ]),
                  ),
                ),
              );
            }).toList()).animate().fadeIn(delay: 200.ms),

            const Spacer(),
            AppButton(
              label: '⚡ ২ টোকেন দিয়ে শুরু করো',
              loading: _loading,
              onPressed: _start,
            ).animate().fadeIn(delay: 300.ms),
          ],
        ),
      ),
    );
  }

  Widget _buildQuiz() {
    if (_questions.isEmpty) return const SizedBox();
    final q = _questions[_currentQ];
    final options = q['options'] is List ? List<String>.from(q['options']) : <String>[];

    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      appBar: AppBar(
        title: Text('প্রশ্ন ${_currentQ + 1}/${_questions.length}'),
        actions: [
          TextButton.icon(
            onPressed: _askAi,
            icon: const Text('🤖', style: TextStyle(fontSize: 16)),
            label: const Text('AI সাহায্য', style: TextStyle(color: Color(AppConfig.accentBlue), fontSize: 12)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Progress bar
          LinearProgressIndicator(
            value: (_currentQ + 1) / _questions.length,
            backgroundColor: const Color(0xFF1e293b),
            valueColor: const AlwaysStoppedAnimation(Color(AppConfig.accentBlue)),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GlassCard(
                    child: Text(q['question_text'] ?? '',
                      style: const TextStyle(color: Colors.white, fontSize: 16, height: 1.6, fontWeight: FontWeight.w600)),
                  ).animate().fadeIn(),

                  const SizedBox(height: 16),

                  ...options.asMap().entries.map((e) {
                    final opt = e.value;
                    final label = ['ক', 'খ', 'গ', 'ঘ'][e.key < 4 ? e.key : 0];
                    final selected = _answers[_currentQ] == opt;

                    return GestureDetector(
                      onTap: () => setState(() => _answers[_currentQ] = opt),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        decoration: BoxDecoration(
                          color: selected ? const Color(AppConfig.accentBlue).withOpacity(0.15) : const Color(0xFF111827),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: selected ? const Color(AppConfig.accentBlue) : const Color(AppConfig.borderColor),
                            width: selected ? 2 : 1,
                          ),
                        ),
                        child: Row(children: [
                          Container(
                            width: 28, height: 28,
                            decoration: BoxDecoration(
                              color: selected ? const Color(AppConfig.accentBlue) : const Color(AppConfig.accentBlue).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Center(child: Text(label, style: TextStyle(
                              color: selected ? Colors.white : const Color(AppConfig.accentBlue),
                              fontWeight: FontWeight.w800, fontSize: 12))),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Text(opt, style: const TextStyle(color: Colors.white, fontSize: 14))),
                          if (selected) const Icon(Icons.check_circle, color: Color(AppConfig.accentBlue), size: 18),
                        ]),
                      ),
                    ).animate(delay: (e.key * 60).ms).fadeIn().slideX(begin: 0.1, end: 0);
                  }),

                  // AI answer
                  if (_askingAi)
                    const Center(child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(color: Color(AppConfig.accentBlue)),
                    )),
                  if (_aiAnswer != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(AppConfig.accentPurple).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(AppConfig.accentPurple).withOpacity(0.3)),
                      ),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Row(children: [
                          Text('🤖', style: TextStyle(fontSize: 16)),
                          SizedBox(width: 6),
                          Text('AI শিক্ষক', style: TextStyle(color: Color(AppConfig.accentPurple), fontWeight: FontWeight.w700)),
                        ]),
                        const SizedBox(height: 8),
                        Text(_aiAnswer!, style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 13, height: 1.5)),
                      ]),
                    ).animate().fadeIn(),
                  ],
                ],
              ),
            ),
          ),

          // Next/Submit button
          Padding(
            padding: const EdgeInsets.all(16),
            child: AppButton(
              label: _currentQ == _questions.length - 1 ? 'ফলাফল দেখো' : 'পরের প্রশ্ন →',
              onPressed: _answers.containsKey(_currentQ) ? () {
                if (_currentQ == _questions.length - 1) {
                  setState(() => _showResult = true);
                } else {
                  setState(() { _currentQ++; _aiAnswer = null; });
                }
              } : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResult() {
    final score = _score;
    final total = _questions.length;
    final percent = total > 0 ? (score / total * 100).round() : 0;
    final color = percent >= 80 ? AppConfig.accentGreen
        : percent >= 50 ? AppConfig.accentGold : AppConfig.accentRed;

    return Scaffold(
      backgroundColor: const Color(AppConfig.bgColor),
      appBar: AppBar(title: const Text('ফলাফল')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(percent >= 80 ? '🎉' : percent >= 50 ? '👍' : '😔',
                style: const TextStyle(fontSize: 64)).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
              const SizedBox(height: 16),
              Text('$score / $total', style: TextStyle(
                color: Color(color), fontSize: 52, fontWeight: FontWeight.w900)),
              Text('$percent% সঠিক', style: TextStyle(color: Colors.white.withOpacity(0.6))),
              const SizedBox(height: 32),
              AppButton(label: 'আবার চেষ্টা করো', onPressed: () {
                setState(() { _started = false; _showResult = false; _questions = []; _answers = {}; _currentQ = 0; _aiAnswer = null; });
              }),
            ].animate(interval: 100.ms).fadeIn().slideY(begin: 0.2, end: 0),
          ),
        ),
      ),
    );
  }
}
