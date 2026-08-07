import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/subject_selector_sheet.dart';
import '../../services/sound_service.dart';
import 'package:fluttertoast/fluttertoast.dart';

class SurvivalScreen extends StatefulWidget {
  final List<String> initialSubjects;
  const SurvivalScreen({super.key, this.initialSubjects = const []});
  @override
  State<SurvivalScreen> createState() => SurvivalScreenState();
}

class SurvivalScreenState extends State<SurvivalScreen> with TickerProviderStateMixin {
  List<Map> _questions = [];
  List<String> _selectedSubjects = [];
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
    _selectedSubjects = List.from(widget.initialSubjects);
    _load();
  }

  /// Called by MainShell after subject selection
  void reloadWithSubjects(List<String> subs) {
    setState(() {
      _selectedSubjects = subs;
      _started = false;
      _gameOver = false;
      _won = false;
      _lives = 3;
      _score = 0;
      _currentQ = 0;
    });
    _load(subjects: subs);
  }


  Future<void> _load({List<String>? subjects}) async {
    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final subQuery = (subjects ?? _selectedSubjects).join(',');
      final res = await dio.get('/survival/questions', queryParameters: subQuery.isNotEmpty ? {'subjects': subQuery} : null);
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

  void _answer(String key, String val) {
    if (_gameOver || _won) return;
    final q = _questions[_currentQ];
    final correct = q['correct_answer']?.toString().toLowerCase().trim();
    final isCorrect = correct == key.toLowerCase().trim() || correct == val.toLowerCase().trim();

    if (isCorrect) {
      SoundService.playCorrect();
      setState(() {
        _score++;
        _feedback = '✅ সঠিক!';
        if (_currentQ == _questions.length - 1) _won = true;
        else _currentQ++;
      });
    } else {
      SoundService.playWrong();
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
        const Text('🔥', style: TextStyle(fontSize: 72)),
        const SizedBox(height: 16),
        const Text('Survival Deathmatch', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
        const SizedBox(height: 8),
        Text('৩টি জীবন নিয়ে শুরু করো। ভুল করলে ১টি জীবন যাবে। সব শেষ হলে ১ টোকেন কাটা যাবে!',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13, height: 1.5)),
        const SizedBox(height: 32),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(3, (i) =>
          const Padding(padding: EdgeInsets.symmetric(horizontal: 6), child: Text('❤️', style: TextStyle(fontSize: 28))))),
        const SizedBox(height: 20),

        GestureDetector(
          onTap: () {
            showModalBottomSheet(
              context: context,
              backgroundColor: Colors.transparent,
              isScrollControlled: true,
              builder: (_) => SubjectSelectorSheet(
                selectedSubjects: _selectedSubjects,
                onConfirm: (subs) {
                  setState(() => _selectedSubjects = subs);
                  _load(subjects: subs);
                },
              ),
            );
          },
          child: GlassCard(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('📚', style: TextStyle(fontSize: 20)),
                const SizedBox(width: 8),
                Text(
                  _selectedSubjects.isEmpty ? 'সকল বিষয় (All Subjects)' : '${_selectedSubjects.length}টি বিষয় সিলেক্ট করা হয়েছে',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                ),
                const SizedBox(width: 6),
                const Icon(Icons.tune_rounded, color: Color(AppConfig.accentRed), size: 18),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              if (_questions.isEmpty) {
                Fluttertoast.showToast(
                  msg: 'প্রশ্ন লোড হচ্ছে... অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
                  backgroundColor: const Color(AppConfig.accentRed),
                  textColor: Colors.white,
                );
                _load();
                return;
              }
              setState(() => _started = true);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(AppConfig.accentRed),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: Text(
              _questions.isEmpty ? 'প্রশ্ন লোড করুন 🔄' : 'শুরু করো 🔥',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
            ),
          ),
        ),
      ]),
    ),
  );

  Widget _buildGame() {
    if (_questions.isEmpty || _currentQ >= _questions.length) {
      return Scaffold(
        backgroundColor: const Color(AppConfig.bgColor),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('😔', style: TextStyle(fontSize: 48)),
              const SizedBox(height: 12),
              const Text('প্রশ্ন পাওয়া যায়নি', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text('অন্য বিষয় বেছে নিন বা আবার চেষ্টা করুন', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _restart,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(AppConfig.accentRed)),
                child: const Text('আবার চেষ্টা করুন 🔄', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }
    final q = _questions[_currentQ];
    final rawOpts = q['options'];
    List<MapEntry<String, String>> options = [];
    if (rawOpts is Map) {
      options = rawOpts.entries.map((e) => MapEntry(e.key.toString(), e.value.toString())).toList();
    } else if (rawOpts is List) {
      final keys = ['a', 'b', 'c', 'd', 'e'];
      options = rawOpts.asMap().entries.map((e) => MapEntry(e.key < keys.length ? keys[e.key] : e.key.toString(), e.value.toString())).toList();
    }

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
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(AppConfig.accentPurple).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(AppConfig.accentPurple).withOpacity(0.4)),
                        ),
                        child: Text(q['subject'] ?? 'সাধারণ জ্ঞান', style: const TextStyle(color: Color(AppConfig.accentPurple), fontSize: 11, fontWeight: FontWeight.w700)),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(AppConfig.accentGold).withOpacity(0.18),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(AppConfig.accentGold).withOpacity(0.4)),
                        ),
                        child: Builder(
                          builder: (context) {
                            final examName = q['exam_name']?.toString();
                            final year = q['year']?.toString() ?? q['exam_year']?.toString();
                            final boardYear = q['board_year']?.toString();
                            final rawTag = q['tag']?.toString() ?? q['exam_tag']?.toString();
                            final tagStr = (examName != null && examName.isNotEmpty)
                                ? ((year != null && year.isNotEmpty && !examName.contains(year)) ? '$examName ($year)' : examName)
                                : (boardYear ?? rawTag ?? (year != null ? 'সাল $year' : '✨ গুরুত্বপূর্ণ প্রশ্ন'));
                            return Text(
                              tagStr,
                              style: const TextStyle(color: Color(AppConfig.accentGold), fontSize: 11, fontWeight: FontWeight.w800),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  GlassCard(
                    child: Text(q['question_text'] ?? '',
                      style: const TextStyle(color: Colors.white, fontSize: 16, height: 1.6, fontWeight: FontWeight.w600)),
                  ).animate().fadeIn(),
                const SizedBox(height: 16),
                ...options.asMap().entries.map((e) {
                  final key = e.value.key;
                  final val = e.value.value;
                  final labelMap = {'a': 'ক', 'b': 'খ', 'c': 'গ', 'd': 'ঘ', '0': 'ক', '1': 'খ', '2': 'গ', '3': 'ঘ'};
                  final label = labelMap[key.toLowerCase()] ?? key.toUpperCase();
                  return GestureDetector(
                    onTap: () => _answer(key, val),
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
                        Expanded(child: Text(val, style: const TextStyle(color: Colors.white, fontSize: 14))),
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
