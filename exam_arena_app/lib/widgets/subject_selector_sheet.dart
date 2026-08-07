import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_config.dart';
import '../providers/auth_provider.dart';

class SubjectSelectorSheet extends StatefulWidget {
  final List<String> selectedSubjects;
  final Function(List<String>) onConfirm;

  const SubjectSelectorSheet({
    super.key,
    required this.selectedSubjects,
    required this.onConfirm,
  });

  @override
  State<SubjectSelectorSheet> createState() => _SubjectSelectorSheetState();
}

class _SubjectSelectorSheetState extends State<SubjectSelectorSheet> {
  late List<String> _tempSelected;

  @override
  void initState() {
    super.initState();
    _tempSelected = List.from(widget.selectedSubjects);
  }

  List<Map<String, String>> _getSubjectsForUser(AuthProvider auth) {
    final user = auth.user ?? {};
    final goals = (user['exam_goal']?.toString() ?? 'BCS').split(',');
    final stream = user['stream']?.toString() ?? 'general';

    final Map<String, Map<String, String>> pool = {};

    for (final goal in goals) {
      final g = goal.trim().toUpperCase();

      if (g == 'BCS' || g == 'BANK' || g == 'PRIMARY' || g == 'OTHER' || g == 'GOV_JOB') {
        pool['বাংলা']        = {'id': 'বাংলা',        'name': 'বাংলা ভাষা ও সাহিত্য',              'emoji': '📚'};
        pool['English']      = {'id': 'English',      'name': 'English Language & Literature',    'emoji': '🔤'};
        pool['গণিত']         = {'id': 'গণিত',         'name': 'গণিত ও গাণিতিক যুক্তি',             'emoji': '🔢'};
        pool['বিজ্ঞান']      = {'id': 'বিজ্ঞান',      'name': 'সাধারণ বিজ্ঞান (Physics/Chem/Bio)', 'emoji': '🔬'};
        pool['বাংলাদেশ']     = {'id': 'বাংলাদেশ',     'name': 'বাংলাদেশ বিষয়াবলি',                'emoji': '🇧🇩'};
        pool['আন্তর্জাতিক']  = {'id': 'আন্তর্জাতিক',  'name': 'আন্তর্জাতিক বিষয়াবলি',              'emoji': '🌍'};
        pool['কম্পিউটার']    = {'id': 'কম্পিউটার',    'name': 'কম্পিউটার ও তথ্যপ্রযুক্তি',          'emoji': '💻'};
        pool['মানসিক']       = {'id': 'মানসিক',       'name': 'মানসিক দক্ষতা ও IQ',                'emoji': '🧠'};
        pool['ভূগোল']        = {'id': 'ভূগোল',        'name': 'ভূগোল, পরিবেশ ও দুর্যোগ',           'emoji': '🗺️'};
        pool['নৈতিকতা']      = {'id': 'নৈতিকতা',      'name': 'নৈতিকতা, মূল্যবোধ ও সুশাসন',         'emoji': '⚖️'};
      } else if (g == 'MEDICAL') {
        pool['পদার্থবিজ্ঞান'] = {'id': 'পদার্থবিজ্ঞান', 'name': 'পদার্থবিজ্ঞান (Physics)',           'emoji': '⚡'};
        pool['রসায়ন']        = {'id': 'রসায়ন',        'name': 'রসায়ন (Chemistry)',                'emoji': '🧪'};
        pool['জীববিজ্ঞান']   = {'id': 'জীববিজ্ঞান',   'name': 'জীববিজ্ঞান (Botany & Zoology)',    'emoji': '🧬'};
        pool['English']      = {'id': 'English',      'name': 'English Language',                 'emoji': '🔤'};
        pool['বাংলাদেশ']     = {'id': 'বাংলাদেশ',     'name': 'সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক)', 'emoji': '🌐'};
      } else if (g == 'ENGINEERING') {
        pool['পদার্থবিজ্ঞান']  = {'id': 'পদার্থবিজ্ঞান', 'name': 'পদার্থবিজ্ঞান (Physics)',         'emoji': '⚡'};
        pool['রসায়ন']         = {'id': 'রসায়ন',        'name': 'রসায়ন (Chemistry)',               'emoji': '🧪'};
        pool['উচ্চতর গণিত']   = {'id': 'উচ্চতর গণিত',  'name': 'উচ্চতর গণিত (Higher Math)',       'emoji': '📐'};
        pool['English']       = {'id': 'English',      'name': 'English',                         'emoji': '🔤'};
      } else if (g == 'HSC' || g == 'SSC' || g == 'UNIVERSITY') {
        pool['বাংলা']   = {'id': 'বাংলা',   'name': 'বাংলা (১ম ও ২য় পত্র)',               'emoji': '📚'};
        pool['English'] = {'id': 'English', 'name': 'English (1st & 2nd Paper)',           'emoji': '🔤'};
        pool['কম্পিউটার'] = {'id': 'কম্পিউটার', 'name': 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', 'emoji': '💻'};

        if (stream == 'science') {
          pool['পদার্থবিজ্ঞান'] = {'id': 'পদার্থবিজ্ঞান', 'name': 'পদার্থবিজ্ঞান (Physics)', 'emoji': '⚡'};
          pool['রসায়ন']        = {'id': 'রসায়ন',        'name': 'রসায়ন (Chemistry)',       'emoji': '🧪'};
          pool['জীববিজ্ঞান']   = {'id': 'জীববিজ্ঞান',   'name': 'জীববিজ্ঞান (Biology)',    'emoji': '🧬'};
          pool['উচ্চতর গণিত']  = {'id': 'উচ্চতর গণিত',  'name': 'উচ্চতর গণিত (Higher Math)', 'emoji': '📐'};
        } else if (stream == 'commerce') {
          pool['হিসাববিজ্ঞান'] = {'id': 'হিসাববিজ্ঞান', 'name': 'হিসাববিজ্ঞান (Accounting)',      'emoji': '📊'};
          pool['ব্যবসায়']      = {'id': 'ব্যবসায়',      'name': 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা',   'emoji': '💼'};
          pool['ফিন্যান্স']    = {'id': 'ফিন্যান্স',    'name': 'ফিন্যান্স, ব্যাংকিং ও বিমা',      'emoji': '🏦'};
          pool['উৎপাদন']       = {'id': 'উৎপাদন',       'name': 'উৎপাদন ব্যবস্থাপনা ও বিপণন',     'emoji': '📈'};
        } else if (stream == 'arts') {
          pool['ইতিহাস']    = {'id': 'ইতিহাস',    'name': 'ইতিহাস ও বিশ্বসভ্যতা',   'emoji': '📜'};
          pool['পৌরনীতি']  = {'id': 'পৌরনীতি',  'name': 'পৌরনীতি ও সুশাসন',       'emoji': '🏛️'};
          pool['ভূগোল']    = {'id': 'ভূগোল',    'name': 'ভূগোল ও পরিবেশ',          'emoji': '🗺️'};
          pool['অর্থনীতি'] = {'id': 'অর্থনীতি', 'name': 'অর্থনীতি (Economics)',    'emoji': '💰'};
          pool['যুক্তিবিদ্যা'] = {'id': 'যুক্তিবিদ্যা', 'name': 'যুক্তিবিদ্যা (Logic)', 'emoji': '🧠'};
        } else {
          pool['গণিত']    = {'id': 'গণিত',    'name': 'সাধারণ গণিত',         'emoji': '🔢'};
          pool['বিজ্ঞান'] = {'id': 'বিজ্ঞান', 'name': 'সাধারণ বিজ্ঞান',      'emoji': '🔬'};
          pool['বাংলাদেশ'] = {'id': 'বাংলাদেশ', 'name': 'বাংলাদেশ ও বিশ্বপরিচয়', 'emoji': '🇧🇩'};
        }
      }
    }

    // Fallback: if nothing matched, show generic BCS subjects
    if (pool.isEmpty) {
      pool['বাংলা']        = {'id': 'বাংলা',        'name': 'বাংলা ভাষা ও সাহিত্য',     'emoji': '📚'};
      pool['English']      = {'id': 'English',      'name': 'English Language',          'emoji': '🔤'};
      pool['গণিত']         = {'id': 'গণিত',         'name': 'গণিত ও গাণিতিক যুক্তি',    'emoji': '🔢'};
      pool['বিজ্ঞান']      = {'id': 'বিজ্ঞান',      'name': 'সাধারণ বিজ্ঞান',           'emoji': '🔬'};
      pool['বাংলাদেশ']     = {'id': 'বাংলাদেশ',     'name': 'বাংলাদেশ বিষয়াবলি',       'emoji': '🇧🇩'};
      pool['আন্তর্জাতিক']  = {'id': 'আন্তর্জাতিক',  'name': 'আন্তর্জাতিক বিষয়াবলি',    'emoji': '🌍'};
      pool['কম্পিউটার']    = {'id': 'কম্পিউটার',    'name': 'কম্পিউটার ও তথ্যপ্রযুক্তি', 'emoji': '💻'};
    }

    return pool.values.toList();
  }

  bool _isSelected(String id) => _tempSelected.contains(id);
  bool get _noneSelected => _tempSelected.isEmpty;

  void _toggleSubject(String id) {
    setState(() {
      if (_tempSelected.contains(id)) {
        _tempSelected.remove(id);
      } else {
        _tempSelected.add(id);
      }
    });
  }

  void _selectAll() {
    setState(() => _tempSelected.clear());
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user ?? {};
    final subjects = _getSubjectsForUser(auth);
    final goal = user['exam_goal']?.toString().toUpperCase() ?? 'BCS';

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.92,
      expand: false,
      builder: (_, scrollController) => Container(
        decoration: const BoxDecoration(
          color: Color(0xFF111827),
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 10),
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 16, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '📚 বিষয় পছন্দ করুন',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(AppConfig.accentBlue).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(AppConfig.accentBlue).withOpacity(0.3)),
                          ),
                          child: Text(
                            '🎯 আপনার লক্ষ্য: $goal',
                            style: const TextStyle(color: Color(AppConfig.accentBlue), fontSize: 11, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // "Select All" chip
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: GestureDetector(
                onTap: _selectAll,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: _noneSelected
                        ? const Color(AppConfig.accentBlue).withOpacity(0.2)
                        : const Color(0xFF1e293b),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: _noneSelected
                          ? const Color(AppConfig.accentBlue)
                          : Colors.white.withOpacity(0.1),
                      width: _noneSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      const Text('🌟', style: TextStyle(fontSize: 22)),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text(
                          'সকল বিষয় (All Subjects)',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14),
                        ),
                      ),
                      if (_noneSelected)
                        const Icon(Icons.check_circle_rounded, color: Color(AppConfig.accentBlue), size: 22)
                      else
                        const Icon(Icons.radio_button_unchecked_rounded, color: Colors.white38, size: 22),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 8),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Container(width: 32, height: 1, color: Colors.white12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      'অথবা নির্দিষ্ট বিষয় বেছে নিন',
                      style: TextStyle(color: Colors.white.withOpacity(0.35), fontSize: 11),
                    ),
                  ),
                  Expanded(child: Container(height: 1, color: Colors.white12)),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Subject list
            Expanded(
              child: ListView.builder(
                controller: scrollController,
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                itemCount: subjects.length,
                itemBuilder: (ctx, i) {
                  final sub = subjects[i];
                  final sel = _isSelected(sub['id']!);

                  return GestureDetector(
                    onTap: () => _toggleSubject(sub['id']!),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                      decoration: BoxDecoration(
                        color: sel
                            ? const Color(AppConfig.accentBlue).withOpacity(0.15)
                            : const Color(0xFF1e293b),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: sel
                              ? const Color(AppConfig.accentBlue)
                              : Colors.white.withOpacity(0.08),
                          width: sel ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(sub['emoji']!, style: const TextStyle(fontSize: 22)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              sub['name']!,
                              style: TextStyle(
                                color: sel ? Colors.white : Colors.white70,
                                fontWeight: sel ? FontWeight.w800 : FontWeight.w500,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 180),
                            child: sel
                                ? const Icon(Icons.check_circle_rounded, color: Color(AppConfig.accentBlue), size: 22, key: ValueKey('checked'))
                                : const Icon(Icons.radio_button_unchecked_rounded, color: Colors.white24, size: 22, key: ValueKey('unchecked')),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            // Confirm button (sticky at bottom)
            Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, -4)),
                ],
              ),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(AppConfig.accentBlue),
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                onPressed: () {
                  widget.onConfirm(_noneSelected ? [] : _tempSelected);
                  Navigator.pop(context);
                },
                child: Text(
                  _noneSelected
                      ? 'সকল বিষয় নিয়ে শুরু করুন ✅'
                      : '${_tempSelected.length}টি বিষয় সিলেক্ট করা হয়েছে ✅',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
