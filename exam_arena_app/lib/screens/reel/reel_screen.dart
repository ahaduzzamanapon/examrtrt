import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';

class ReelScreen extends StatefulWidget {
  const ReelScreen({super.key});
  @override
  State<ReelScreen> createState() => _ReelScreenState();
}

class _ReelScreenState extends State<ReelScreen> {
  final PageController _controller = PageController();
  List<Map> _questions = [];
  bool _loading = true;
  int _current = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.get('/reel/questions');
      if (mounted) setState(() {
        _questions = List<Map>.from(res.data['questions'] ?? []);
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: Color(AppConfig.bgColor),
        body: Center(child: CircularProgressIndicator(color: Color(AppConfig.accentBlue))),
      );
    }

    if (_questions.isEmpty) {
      return Scaffold(
        backgroundColor: const Color(AppConfig.bgColor),
        body: const Center(
          child: Text('প্রশ্ন পাওয়া যায়নি', style: TextStyle(color: Colors.white)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        controller: _controller,
        scrollDirection: Axis.vertical,
        onPageChanged: (i) => setState(() => _current = i),
        itemCount: _questions.length,
        itemBuilder: (ctx, i) => _QuestionCard(
          q: _questions[i],
          index: i,
          total: _questions.length,
        ),
      ),
    );
  }
}

class _QuestionCard extends StatefulWidget {
  final Map q;
  final int index, total;
  const _QuestionCard({required this.q, required this.index, required this.total});
  @override
  State<_QuestionCard> createState() => _QuestionCardState();
}

class _QuestionCardState extends State<_QuestionCard> {
  String? _selected;
  bool _answered = false;

  List<String> get _options {
    final raw = widget.q['options'];
    if (raw is List) return raw.map((e) => e.toString()).toList();
    return [];
  }

  void _answer(String opt) {
    if (_answered) return;
    setState(() { _selected = opt; _answered = true; });
  }

  bool _isCorrect(String opt) => opt == widget.q['correct_answer'];

  @override
  Widget build(BuildContext context) {
    final subject = widget.q['subject'] ?? 'সাধারণ জ্ঞান';

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter, end: Alignment.bottomCenter,
          colors: [Color(0xFF0a0e23), Color(0xFF111827)],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(AppConfig.accentPurple).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(AppConfig.accentPurple).withOpacity(0.4)),
                  ),
                  child: Text(subject, style: const TextStyle(color: Color(AppConfig.accentPurple), fontSize: 11, fontWeight: FontWeight.w700)),
                ),
                const Spacer(),
                Text('${widget.index + 1}/${widget.total}',
                  style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
              ]),

              const SizedBox(height: 24),

              // Question
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.q['question_text'] ?? '',
                      style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700, height: 1.6)),
                    const SizedBox(height: 24),

                    // Options
                    ..._options.asMap().entries.map((e) {
                      final opt = e.value;
                      final label = ['ক', 'খ', 'গ', 'ঘ'][e.key < 4 ? e.key : 0];
                      Color bg = const Color(0xFF1e293b);
                      Color border = const Color(0xFF334155);

                      if (_answered && _selected == opt) {
                        bg = _isCorrect(opt)
                            ? const Color(AppConfig.accentGreen).withOpacity(0.2)
                            : const Color(AppConfig.accentRed).withOpacity(0.2);
                        border = _isCorrect(opt)
                            ? const Color(AppConfig.accentGreen)
                            : const Color(AppConfig.accentRed);
                      } else if (_answered && _isCorrect(opt)) {
                        bg = const Color(AppConfig.accentGreen).withOpacity(0.12);
                        border = const Color(AppConfig.accentGreen);
                      }

                      return GestureDetector(
                        onTap: () => _answer(opt),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                          decoration: BoxDecoration(
                            color: bg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: border),
                          ),
                          child: Row(children: [
                            Container(
                              width: 28, height: 28,
                              decoration: BoxDecoration(
                                color: const Color(AppConfig.accentBlue).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Center(
                                child: Text(label, style: const TextStyle(color: Color(AppConfig.accentBlue), fontWeight: FontWeight.w800, fontSize: 13)),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Text(opt, style: const TextStyle(color: Colors.white, fontSize: 14))),
                          ]),
                        ),
                      ).animate(delay: (e.key * 80).ms).fadeIn().slideX(begin: 0.1, end: 0);
                    }),

                    // Explanation
                    if (_answered && widget.q['explanation'] != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(AppConfig.accentBlue).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(AppConfig.accentBlue).withOpacity(0.2)),
                        ),
                        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Icon(Icons.lightbulb_outline, color: Color(AppConfig.accentGold), size: 16),
                          const SizedBox(width: 8),
                          Expanded(child: Text(widget.q['explanation'].toString(),
                            style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13, height: 1.5))),
                        ]),
                      ).animate().fadeIn(delay: 200.ms),
                    ],
                  ],
                ),
              ),

              // Swipe hint
              if (!_answered)
                Center(
                  child: Text('👇 সোয়াইপ করো', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 12)),
                ).animate(onPlay: (c) => c.repeat(reverse: true)).fadeIn(duration: 800.ms),
            ],
          ),
        ),
      ),
    );
  }
}
