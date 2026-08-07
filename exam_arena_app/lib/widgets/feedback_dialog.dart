import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../config/app_config.dart';
import '../providers/auth_provider.dart';
import 'app_text_field.dart';

class FeedbackDialog extends StatefulWidget {
  const FeedbackDialog({super.key});

  @override
  State<FeedbackDialog> createState() => _FeedbackDialogState();
}

class _FeedbackDialogState extends State<FeedbackDialog> {
  int _rating = 5;
  String _type = 'GENERAL';
  final _msgCtrl = TextEditingController();
  bool _loading = false;

  final List<Map<String, String>> _types = [
    {'id': 'GENERAL', 'label': '💬 মতামত'},
    {'id': 'SUGGESTION', 'label': '💡 নতুন আইডিয়া'},
    {'id': 'BUG_REPORT', 'label': '🐞 বাগ রিপোর্ট'},
    {'id': 'COMPLAINT', 'label': '⚠️ অভিযোগ'},
  ];

  Future<void> _submit() async {
    if (_msgCtrl.text.trim().isEmpty) {
      Fluttertoast.showToast(msg: 'আপনার মতামত লিখুন');
      return;
    }
    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        headers: {'Authorization': 'Bearer ${auth.token}', 'Accept': 'application/json'},
      ));
      final res = await dio.post('/feedback', data: {
        'type': _type,
        'rating': _rating,
        'message': _msgCtrl.text.trim(),
      });

      if (mounted) Navigator.pop(context);
      Fluttertoast.showToast(
        msg: res.data['message'] ?? 'ধন্যবাদ! আপনার ফিডব্যাক গৃহীত হয়েছে!',
        backgroundColor: const Color(AppConfig.accentGreen),
        textColor: Colors.white,
      );
    } catch (_) {
      Fluttertoast.showToast(msg: 'ফিডব্যাক জমা দেওয়া যায়নি');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF111827),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Row(
        children: [
          Icon(Icons.chat_bubble_outline_rounded, color: Color(AppConfig.accentBlue)),
          SizedBox(width: 10),
          Text('ফিডব্যাক ও মতামত', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('ধরণ পছন্দ করুন:', style: TextStyle(color: Colors.white60, fontSize: 12)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: _types.map((t) {
                final sel = _type == t['id'];
                return ChoiceChip(
                  label: Text(t['label']!, style: TextStyle(
                    color: sel ? Colors.white : Colors.white60,
                    fontSize: 11,
                    fontWeight: sel ? FontWeight.w800 : FontWeight.w500,
                  )),
                  selected: sel,
                  selectedColor: const Color(AppConfig.accentBlue),
                  backgroundColor: const Color(0xFF1e293b),
                  onSelected: (_) => setState(() => _type = t['id']!),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            const Text('আপনার অভিজ্ঞতা (Rating):', style: TextStyle(color: Colors.white60, fontSize: 12)),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) => IconButton(
                icon: Icon(
                  i < _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                  color: const Color(AppConfig.accentGold),
                  size: 30,
                ),
                onPressed: () => setState(() => _rating = i + 1),
              )),
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: _msgCtrl,
              label: 'আপনার বক্তব্য',
              hint: 'কী কী ভালো লেগেছে বা কীভাবে আরও ভালো করা যায়...',
              maxLines: 4,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _loading ? null : () => Navigator.pop(context),
          child: const Text('বাতিল', style: TextStyle(color: Colors.white60)),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(AppConfig.accentBlue),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: _loading ? null : _submit,
          child: _loading
              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Text('জমা দিন 🚀', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
        ),
      ],
    );
  }
}
