import 'package:flutter/material.dart';

class ClayCard extends StatelessWidget {
  final Widget child;
  final Color color;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final double depth;
  final VoidCallback? onTap;

  const ClayCard({
    super.key,
    required this.child,
    this.color = const Color(0xFF1e293b),
    this.borderRadius = 24,
    this.padding = const EdgeInsets.all(16),
    this.margin,
    this.depth = 10,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Generate clay light and dark shadows
    final HSLColor hsl = HSLColor.fromColor(color);
    final Color lighterColor = hsl.withLightness((hsl.lightness + 0.12).clamp(0.0, 1.0)).toColor();
    final Color darkerColor = hsl.withLightness((hsl.lightness - 0.12).clamp(0.0, 1.0)).toColor();
    final Color shadowColor = Colors.black.withOpacity(0.4);

    final widgetChild = Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: [
          // Outer bottom-right dark drop shadow
          BoxShadow(
            color: shadowColor,
            offset: Offset(depth * 0.6, depth * 0.6),
            blurRadius: depth * 1.2,
            spreadRadius: 1,
          ),
          // Outer top-left light highlight shadow
          BoxShadow(
            color: lighterColor.withOpacity(0.3),
            offset: Offset(-depth * 0.4, -depth * 0.4),
            blurRadius: depth * 0.8,
            spreadRadius: 1,
          ),
        ],
      ),
      child: child,
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: widgetChild,
      );
    }
    return widgetChild;
  }
}
