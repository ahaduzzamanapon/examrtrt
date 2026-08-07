import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class GoogleSignInButton extends StatefulWidget {
  final bool loading;
  final VoidCallback onTap;
  final String label;
  final bool showRecommended;

  const GoogleSignInButton({
    super.key,
    required this.loading,
    required this.onTap,
    this.label = 'Google দিয়ে লগইন করুন',
    this.showRecommended = true,
  });

  @override
  State<GoogleSignInButton> createState() => _GoogleSignInButtonState();
}

class _GoogleSignInButtonState extends State<GoogleSignInButton>
    with SingleTickerProviderStateMixin {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Recommended badge
        if (widget.showRecommended)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF4285F4), Color(0xFF34A853)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.star_rounded, color: Colors.white, size: 12),
                      SizedBox(width: 4),
                      Text(
                        'প্রস্তাবিত',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 500.ms),

        // Button
        GestureDetector(
          onTap: widget.loading ? null : widget.onTap,
          onTapDown: (_) => setState(() => _pressed = true),
          onTapUp: (_) => setState(() => _pressed = false),
          onTapCancel: () => setState(() => _pressed = false),
          child: AnimatedScale(
            scale: _pressed ? 0.97 : 1.0,
            duration: const Duration(milliseconds: 100),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF0f1a2e),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _pressed
                      ? const Color(0xFF4285F4)
                      : const Color(0xFF1e3a5f),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4285F4).withOpacity(_pressed ? 0.35 : 0.15),
                    blurRadius: _pressed ? 20 : 12,
                    spreadRadius: _pressed ? 2 : 0,
                  ),
                ],
              ),
              child: widget.loading
                  ? const Center(
                      child: SizedBox(
                        width: 22, height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor: AlwaysStoppedAnimation(Color(0xFF4285F4)),
                        ),
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const _GoogleColorfulLogo(size: 26),
                        const SizedBox(width: 12),
                        Text(
                          widget.label,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        )
            .animate(onPlay: (c) => c.repeat())
            .shimmer(
              delay: 2000.ms,
              duration: 1500.ms,
              color: const Color(0xFF4285F4).withOpacity(0.1),
            ),
      ],
    );
  }
}

/// Colorful Google G logo — simple and reliable
class _GoogleColorfulLogo extends StatelessWidget {
  final double size;
  const _GoogleColorfulLogo({this.size = 24});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(size * 0.22),
      ),
      child: Center(
        child: ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [
              Color(0xFF4285F4), // blue
              Color(0xFFEA4335), // red
              Color(0xFFFBBC05), // yellow
              Color(0xFF34A853), // green
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ).createShader(bounds),
          child: Text(
            'G',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: size * 0.68,
              height: 1.15,
              fontFamily: 'Arial',
            ),
          ),
        ),
      ),
    );
  }
}


