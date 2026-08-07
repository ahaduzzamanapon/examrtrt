import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ClayButton extends StatefulWidget {
  final String label;
  final Widget? icon;
  final Color color;
  final Color textColor;
  final double borderRadius;
  final double height;
  final bool loading;
  final VoidCallback? onPressed;

  const ClayButton({
    super.key,
    required this.label,
    this.icon,
    this.color = const Color(0xFF3b82f6),
    this.textColor = Colors.white,
    this.borderRadius = 20,
    this.height = 54,
    this.loading = false,
    this.onPressed,
  });

  @override
  State<ClayButton> createState() => _ClayButtonState();
}

class _ClayButtonState extends State<ClayButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final bool disabled = widget.onPressed == null || widget.loading;
    final double depth = _isPressed ? 3 : 8;

    final HSLColor hsl = HSLColor.fromColor(widget.color);
    final Color topHighlight = hsl.withLightness((hsl.lightness + 0.18).clamp(0.0, 1.0)).toColor();
    final Color bottomShadow = hsl.withLightness((hsl.lightness - 0.20).clamp(0.0, 1.0)).toColor();

    return GestureDetector(
      onTapDown: (_) {
        if (!disabled) {
          setState(() => _isPressed = true);
          HapticFeedback.lightImpact();
        }
      },
      onTapUp: (_) {
        if (!disabled) {
          setState(() => _isPressed = false);
          widget.onPressed?.call();
        }
      },
      onTapCancel: () {
        if (!disabled) setState(() => _isPressed = false);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 80),
        height: widget.height,
        decoration: BoxDecoration(
          color: widget.color,
          borderRadius: BorderRadius.circular(widget.borderRadius),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [topHighlight, widget.color, bottomShadow],
          ),
          boxShadow: [
            // Dark bottom-right shadow
            BoxShadow(
              color: Colors.black.withOpacity(0.45),
              offset: Offset(depth * 0.6, depth * 0.6),
              blurRadius: depth * 1.2,
            ),
            // Light top-left highlight
            BoxShadow(
              color: topHighlight.withOpacity(0.5),
              offset: Offset(-depth * 0.4, -depth * 0.4),
              blurRadius: depth * 0.8,
            ),
          ],
        ),
        child: Center(
          child: widget.loading
              ? SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: widget.textColor,
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (widget.icon != null) ...[
                      widget.icon!,
                      const SizedBox(width: 8),
                    ],
                    Text(
                      widget.label,
                      style: TextStyle(
                        color: widget.textColor,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
