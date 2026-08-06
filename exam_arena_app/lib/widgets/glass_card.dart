import 'package:flutter/material.dart';
import '../config/app_config.dart';

/// Reusable glassmorphism card widget
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final Color? borderColor;
  final double radius;

  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderColor,
    this.radius = 20,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding ?? const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(
          color: borderColor ?? const Color(AppConfig.borderColor),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: child,
    );
  }
}
