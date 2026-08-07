import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/subject_selector_sheet.dart';
import '../../widgets/clay_card.dart';
import '../../services/sound_service.dart';
import '../../services/ad_service.dart';

class ReelScreen extends StatefulWidget {
  final List<String> initialSubjects;
  const ReelScreen({super.key, this.initialSubjects = const []});
  @override
  State<ReelScreen> createState() => ReelScreenState();
}

class ReelScreenState extends State<ReelScreen> {
  final PageController _controller = PageController();
  List<Map> _questions = [];
  bool _loading = true;
  bool _isLoadingMore = false;
  int _current = 0;
  List<String> _selectedSubjects = [];
  int _questionsAnswered = 0; // track for interstitial ad every 5

  @override
  void initState() {
    super.initState();
    _selectedSubjects = List.from(widget.initialSubjects);
    _loadQuestions();
  }

  /// Called by MainShell after subject selection in sheet
  void reloadWithSubjects(List<String> subs) {
    setState(() => _selectedSubjects = subs);
    _loadQuestions(subjects: subs);
  }

  Future<void> _loadQuestions({List<String>? subjects}) async {
    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));

      final subQuery = (subjects ?? _selectedSubjects).join(',');
      final queryParams = <String, dynamic>{};
      if (subQuery.isNotEmpty) queryParams['subjects'] = subQuery;

      final res = await dio.get('/reel/questions', queryParameters: queryParams);
      final list = List<Map>.from(res.data['questions'] ?? []);
      if (mounted) {
        setState(() {
          _questions = list;
          _loading = false;
          _current = 0;
        });
        _controller.jumpToPage(0);
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore) return;
    setState(() => _isLoadingMore = true);
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final subQuery = _selectedSubjects.join(',');
      final queryParams = <String, dynamic>{};
      if (subQuery.isNotEmpty) queryParams['subjects'] = subQuery;

      final res = await dio.get('/reel/questions', queryParameters: queryParams);
      final list = List<Map>.from(res.data['questions'] ?? []);
      if (mounted && list.isNotEmpty) {
        setState(() => _questions = [..._questions, ...list]);
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoadingMore = false);
  }

  void _showSubjectSelector() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => SubjectSelectorSheet(
        selectedSubjects: _selectedSubjects,
        onConfirm: (subs) {
          setState(() => _selectedSubjects = subs);
          _loadQuestions(subjects: subs);
        },
      ),
    );
  }

  void _nextPage() {
    if (_current < _questions.length - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutCubic,
      );
    }
  }

  void _prevPage() {
    if (_current > 0) {
      _controller.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: Color(0xFF070a14),
        body: Center(child: CircularProgressIndicator(color: Color(AppConfig.accentBlue))),
      );
    }

    if (_questions.isEmpty) {
      return Scaffold(
        backgroundColor: const Color(0xFF070a14),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('📚', style: TextStyle(fontSize: 48)),
              const SizedBox(height: 12),
              const Text('কোনো প্রশ্ন পাওয়া যায়নি',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('বিষয় নির্বাচন পরিবর্তন করে চেষ্টা করুন',
                  style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _showSubjectSelector,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(AppConfig.accentBlue)),
                child: const Text('বিষয় ফিল্টার করুন 📚', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF070a14),
      body: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            scrollDirection: Axis.vertical,
            physics: const AlwaysScrollableScrollPhysics(),
            onPageChanged: (i) {
              setState(() => _current = i);
              if (i >= _questions.length - 5 && !_isLoadingMore) {
                _loadMore();
              }
            },
            itemCount: _questions.length,
            itemBuilder: (ctx, i) => _QuestionCard(
              q: _questions[i],
              index: i,
              total: _questions.length,
              selectedSubjects: _selectedSubjects,
              onOpenSubjectFilter: _showSubjectSelector,
              onNext: _nextPage,
              onPrev: _prevPage,
              onAnswered: () {
                _questionsAnswered++;
                if (_questionsAnswered % 5 == 0) {
                  // Show interstitial ad every 5 answers
                  AdService.instance.showInterstitialAd(context);
                }
              },
            ),
          ),

          // Floating Side Arrow Navigators for ultra-smooth Reel scrolling
          Positioned(
            right: 12,
            bottom: 85,
            child: Column(
              children: [
                if (_current > 0)
                  GestureDetector(
                    onTap: _prevPage,
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withOpacity(0.2)),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 8),
                        ],
                      ),
                      child: const Icon(Icons.keyboard_arrow_up_rounded, color: Colors.white, size: 24),
                    ),
                  ),
                if (_current < _questions.length - 1)
                  GestureDetector(
                    onTap: _nextPage,
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(AppConfig.accentBlue).withOpacity(0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: const Color(AppConfig.accentBlue).withOpacity(0.5), blurRadius: 10),
                        ],
                      ),
                      child: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 26),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuestionCard extends StatefulWidget {
  final Map q;
  final int index, total;
  final List<String> selectedSubjects;
  final VoidCallback onOpenSubjectFilter;
  final VoidCallback onNext;
  final VoidCallback onPrev;
  final VoidCallback onAnswered;

  const _QuestionCard({
    required this.q,
    required this.index,
    required this.total,
    required this.selectedSubjects,
    required this.onOpenSubjectFilter,
    required this.onNext,
    required this.onPrev,
    required this.onAnswered,
  });

  @override
  State<_QuestionCard> createState() => _QuestionCardState();
}

class _QuestionCardState extends State<_QuestionCard> {
  String? _selected;
  bool _answered = false;

  List<MapEntry<String, String>> get _optionsList {
    final raw = widget.q['options'];
    if (raw is Map) {
      return raw.entries
          .map((e) => MapEntry(e.key.toString(), e.value.toString()))
          .toList();
    }
    if (raw is List) {
      final keys = ['a', 'b', 'c', 'd', 'e'];
      return raw.asMap().entries.map((e) {
        final key = e.key < keys.length ? keys[e.key] : e.key.toString();
        return MapEntry(key, e.value.toString());
      }).toList();
    }
    return [];
  }

  void _answer(String key, String val) {
    if (_answered) return;
    final correctKey = (widget.q['correct_answer'] ?? '').toString().toLowerCase();
    final isCorrect = key.toLowerCase() == correctKey || val.trim().toLowerCase() == (widget.q['options']?[correctKey] ?? '').toString().trim().toLowerCase();

    if (isCorrect) {
      SoundService.playCorrect();
    } else {
      SoundService.playWrong();
    }

    setState(() { _selected = key; _answered = true; });
    widget.onAnswered(); // notify parent for ad tracking
  }

  bool _isCorrectKey(String key, String val) {
    final correct = widget.q['correct_answer']?.toString().toLowerCase().trim();
    final k = key.toLowerCase().trim();
    final v = val.toLowerCase().trim();
    return correct == k || correct == v;
  }

  @override
  Widget build(BuildContext context) {
    final subject = widget.q['subject'] ?? 'সাধারণ জ্ঞান';
    final examName = widget.q['exam_name']?.toString();
    final year = widget.q['year']?.toString() ?? widget.q['exam_year']?.toString();
    final boardYear = widget.q['board_year']?.toString();
    final rawTag = widget.q['tag']?.toString() ?? widget.q['exam_tag']?.toString();
    
    final String tag = (examName != null && examName.isNotEmpty)
        ? ((year != null && year.isNotEmpty && !examName.contains(year)) ? '$examName ($year)' : examName)
        : (boardYear ?? rawTag ?? (year != null ? 'সাল $year' : '✨ গুরুত্বপূর্ণ প্রশ্ন'));
    final opts = _optionsList;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter, end: Alignment.bottomCenter,
          colors: [Color(0xFF070a14), Color(0xFF0f172a)],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Header Row
              Row(
                children: [
                  // 3D Subject Selector Pill Button
                  GestureDetector(
                    onTap: widget.onOpenSubjectFilter,
                    child: ClayCard(
                      color: const Color(0xFF1e293b),
                      borderRadius: 20,
                      depth: 6,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.tune_rounded, color: Color(AppConfig.accentBlue), size: 16),
                          const SizedBox(width: 4),
                          Text(
                            widget.selectedSubjects.isEmpty
                                ? 'বিষয় (সকল)'
                                : '${widget.selectedSubjects.length}টি বিষয়',
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800),
                          ),
                          const Icon(Icons.arrow_drop_down, color: Colors.white70, size: 18),
                        ],
                      ),
                    ),
                  ),

                  const Spacer(),

                  Flexible(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Subject Badge
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(AppConfig.accentPurple).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(AppConfig.accentPurple).withOpacity(0.4)),
                            ),
                            child: Text(subject, style: const TextStyle(color: Color(AppConfig.accentPurple), fontSize: 10, fontWeight: FontWeight.w800)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Question Text inside 3D Clay Card
              Expanded(
                child: NotificationListener<ScrollNotification>(
                  onNotification: (scrollInfo) {
                    if (scrollInfo is ScrollUpdateNotification) {
                      if (scrollInfo.metrics.pixels >= scrollInfo.metrics.maxScrollExtent &&
                          scrollInfo.scrollDelta != null &&
                          scrollInfo.scrollDelta! > 12) {
                        // Automatically slide to next question when scrolling past bottom of explanation!
                        widget.onNext();
                        return true;
                      }
                    }
                    return false;
                  },
                  child: GestureDetector(
                    onVerticalDragEnd: (details) {
                      if (details.primaryVelocity != null) {
                        if (details.primaryVelocity! < -150) {
                          widget.onNext();
                        } else if (details.primaryVelocity! > 150) {
                          widget.onPrev();
                        }
                      }
                    },
                    child: SingleChildScrollView(
                      physics: const ClampingScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClayCard(
                            color: const Color(0xFF161f33),
                            borderRadius: 24,
                            depth: 8,
                            padding: const EdgeInsets.all(18),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Text('❓', style: TextStyle(fontSize: 18)),
                                    const SizedBox(width: 6),
                                    Text(
                                      'প্রশ্ন #${widget.index + 1}',
                                      style: const TextStyle(color: Color(AppConfig.accentBlue), fontSize: 12, fontWeight: FontWeight.w800),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  widget.q['question_text'] ?? '',
                                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700, height: 1.5),
                                ),
                                const SizedBox(height: 12),
                                // Metadata Tag (কোথায় এসেছে / সাল) RIGHT BELOW QUESTION TEXT
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: const Color(AppConfig.accentGold).withOpacity(0.18),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(AppConfig.accentGold).withOpacity(0.4)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Text('🎓 ', style: TextStyle(fontSize: 12)),
                                      Flexible(
                                        child: Text(
                                          tag,
                                          style: const TextStyle(color: Color(AppConfig.accentGold), fontSize: 11, fontWeight: FontWeight.w800),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ).animate().fadeIn().scale(begin: const Offset(0.97, 0.97)),

                          const SizedBox(height: 16),

                          // Options in 3D Clay Cards
                          ...opts.asMap().entries.map((e) {
                            final key = e.value.key;
                            final val = e.value.value;
                            final labelMap = {'a': 'ক', 'b': 'খ', 'c': 'গ', 'd': 'ঘ', '0': 'ক', '1': 'খ', '2': 'গ', '3': 'ঘ'};
                            final label = labelMap[key.toLowerCase()] ?? key.toUpperCase();

                            Color clayColor = const Color(0xFF1e293b);
                            final isThisCorrect = _isCorrectKey(key, val);

                            if (_answered && _selected == key) {
                              clayColor = isThisCorrect ? const Color(0xFF064e3b) : const Color(0xFF7f1d1d);
                            } else if (_answered && isThisCorrect) {
                              clayColor = const Color(0xFF064e3b);
                            }

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: ClayCard(
                                color: clayColor,
                                borderRadius: 18,
                                depth: _answered ? 4 : 8,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                                onTap: () => _answer(key, val),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 30,
                                      height: 30,
                                      decoration: BoxDecoration(
                                        color: const Color(AppConfig.accentBlue).withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Center(
                                        child: Text(
                                          label,
                                          style: const TextStyle(color: Color(AppConfig.accentBlue), fontWeight: FontWeight.w900, fontSize: 13),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        val,
                                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
                                      ),
                                    ),
                                    if (_answered && isThisCorrect)
                                      const Icon(Icons.check_circle_rounded, color: Color(0xFF34d399), size: 20),
                                    if (_answered && _selected == key && !isThisCorrect)
                                      const Icon(Icons.cancel_rounded, color: Color(0xFFf87171), size: 20),
                                  ],
                                ),
                              ),
                            ).animate(delay: (e.key * 60).ms).fadeIn().slideX(begin: 0.1, end: 0);
                          }),

                          if (_answered) ...[
                            const SizedBox(height: 14),
                            ClayCard(
                              color: const Color(0xFF0f2942),
                              borderRadius: 20,
                              depth: 6,
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Row(
                                    children: [
                                      Text('💡', style: TextStyle(fontSize: 20)),
                                      SizedBox(width: 8),
                                      Text(
                                        'সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা:',
                                        style: TextStyle(color: Color(AppConfig.accentGold), fontSize: 13, fontWeight: FontWeight.w900),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    (widget.q['explanation'] != null && widget.q['explanation'].toString().trim().isNotEmpty)
                                        ? widget.q['explanation'].toString()
                                        : 'সঠিক উত্তর নির্বাচন করা হয়েছে। বিস্তারিত তথ্য শীঘ্রই সংকলিত হচ্ছে।',
                                    style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.5, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ).animate().fadeIn().slideY(begin: 0.1, end: 0),
                          ],

                          const SizedBox(height: 30),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
