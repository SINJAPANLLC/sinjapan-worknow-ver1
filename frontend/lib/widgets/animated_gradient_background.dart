import 'dart:math' as math;

import 'package:flutter/material.dart';

class AnimatedGradientBackground extends StatefulWidget {
  const AnimatedGradientBackground({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  State<AnimatedGradientBackground> createState() => _AnimatedGradientBackgroundState();
}

class _AnimatedGradientBackgroundState extends State<AnimatedGradientBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value;
        final angle = t * 2 * math.pi;
        final startColor = Color.lerp(const Color(0xFF00C9D2), const Color(0xFF5EE7DF), t)!;
        final endColor = Color.lerp(const Color(0xFF007A7A), const Color(0xFFB490CA), 1 - t)!;
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [startColor, endColor, const Color(0xFFFFF4E9).withOpacity(0.6)],
              stops: const [0, 0.6, 1],
              transform: GradientRotation(angle / 16),
            ),
          ),
          child: child,
        );
      },
      child: widget.child,
    );
  }
}
