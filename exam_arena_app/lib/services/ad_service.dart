import 'dart:async';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_config.dart';

/// Service to display Adsterra Ads via WebView dialogs matching web functionality.
class AdService {
  AdService._();
  static final AdService instance = AdService._();

  static const String adsterraHtml = '''
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 0;
      display: flex; justify-content: center; align-items: center;
      background: #0f172a; height: 100vh; width: 100vw; overflow: hidden;
    }
  </style>
  <script type="text/javascript">
    // Override window.open to avoid Chromium renderer crash in Android WebView
    window.open = function(url) {
      if (url) { window.location.href = url; }
      return null;
    };
  </script>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : 'b7c4685fce9282287defd9cd0dd99097',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highperformanceformat.com/b7c4685fce9282287defd9cd0dd99097/invoke.js"></script>
</body>
</html>
''';

  /// Shows Adsterra Interstitial Modal Dialog with 5-second skip countdown
  Future<void> showInterstitialAd(BuildContext context, {VoidCallback? onDismissed}) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => _AdsterraDialog(onDismissed: onDismissed),
    );
  }

  /// Shows Adsterra Rewarded Modal Dialog for Token reward
  Future<void> showRewardedAd(
    BuildContext context, {
    required VoidCallback onRewarded,
    VoidCallback? onDismissed,
  }) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => _AdsterraDialog(
        isRewarded: true,
        onRewarded: onRewarded,
        onDismissed: onDismissed,
      ),
    );
  }
}

class _AdsterraDialog extends StatefulWidget {
  final bool isRewarded;
  final VoidCallback? onRewarded;
  final VoidCallback? onDismissed;

  const _AdsterraDialog({
    this.isRewarded = false,
    this.onRewarded,
    this.onDismissed,
  });

  @override
  State<_AdsterraDialog> createState() => _AdsterraDialogState();
}

class _AdsterraDialogState extends State<_AdsterraDialog> {
  int _secondsLeft = 5;
  bool _canSkip = false;
  Timer? _timer;
  late final WebViewController _webController;

  @override
  void initState() {
    super.initState();
    _webController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0f172a))
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) {
            final url = request.url;
            if (url.startsWith('https://www.highperformanceformat.com') ||
                url.startsWith('about:blank') ||
                url.startsWith('data:')) {
              return NavigationDecision.navigate;
            }
            // Open external ad links in system browser safely
            try {
              launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
            } catch (_) {}
            return NavigationDecision.prevent;
          },
        ),
      )
      ..loadHtmlString(
        AdService.adsterraHtml,
        baseUrl: 'https://www.highperformanceformat.com',
      );

    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft <= 1) {
        t.cancel();
        if (mounted) {
          setState(() {
            _secondsLeft = 0;
            _canSkip = true;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _secondsLeft--;
          });
        }
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _close() {
    if (widget.isRewarded && _canSkip) {
      widget.onRewarded?.call();
    }
    Navigator.of(context).pop();
    widget.onDismissed?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0f172a),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 20,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text('📢', style: TextStyle(fontSize: 18)),
                    const SizedBox(width: 8),
                    Text(
                      widget.isRewarded ? 'বিজ্ঞাপন দেখুন (টোকেন রিওয়ার্ড)' : 'বিজ্ঞাপন',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ],
                ),
                if (_canSkip)
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white),
                    onPressed: _close,
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(AppConfig.accentBlue).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${_secondsLeft}s',
                      style: const TextStyle(color: Color(AppConfig.accentBlue), fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                height: 260,
                width: 320,
                child: WebViewWidget(controller: _webController),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _canSkip ? _close : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _canSkip ? const Color(AppConfig.accentGreen) : Colors.grey.shade800,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(
                  _canSkip
                      ? (widget.isRewarded ? '🎉 রিওয়ার্ড নিন' : 'স্কিপ করুন ⏩')
                      : 'অপেক্ষা করুন (${_secondsLeft}s)...',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Inline Adsterra Banner Widget for embedding directly in screens like Reel or Practice
class AdsterraBannerWidget extends StatefulWidget {
  final double height;
  final double width;
  const AdsterraBannerWidget({super.key, this.height = 250, this.width = 300});

  @override
  State<AdsterraBannerWidget> createState() => _AdsterraBannerWidgetState();
}

class _AdsterraBannerWidgetState extends State<AdsterraBannerWidget> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0f172a))
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) {
            final url = request.url;
            if (url.startsWith('https://www.highperformanceformat.com') ||
                url.startsWith('about:blank') ||
                url.startsWith('data:')) {
              return NavigationDecision.navigate;
            }
            try {
              launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
            } catch (_) {}
            return NavigationDecision.prevent;
          },
        ),
      )
      ..loadHtmlString(
        AdService.adsterraHtml,
        baseUrl: 'https://www.highperformanceformat.com',
      );
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: SizedBox(
        height: widget.height,
        width: widget.width,
        child: WebViewWidget(controller: _controller),
      ),
    );
  }
}
