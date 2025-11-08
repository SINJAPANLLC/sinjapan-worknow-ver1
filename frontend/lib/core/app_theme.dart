import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class WorkNowTheme {
  static const _primary = Color(0xFF00C9D2);
  static const _primaryDark = Color(0xFF007A7A);
  static const _accent = Color(0xFFFF7A90);
  static const _surface = Color(0xFFF7FBFC);

  static ThemeData get light {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: _surface,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _primary,
        brightness: Brightness.light,
        primary: _primary,
        secondary: _accent,
        surface: _surface,
      ),
    );

    final textTheme = GoogleFonts.nunitoTextTheme(base.textTheme).copyWith(
      headlineSmall: GoogleFonts.nunito(
        fontWeight: FontWeight.w700,
        fontSize: 24,
        color: const Color(0xFF1F2933),
      ),
      titleMedium: GoogleFonts.nunito(
        fontWeight: FontWeight.w600,
        color: const Color(0xFF1F2933),
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 16,
        color: const Color(0xFF4B5563),
      ),
    );

    final elevatedButtonStyle = ElevatedButton.styleFrom(
      elevation: 0,
      backgroundColor: _primary,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      textStyle: GoogleFonts.nunito(fontWeight: FontWeight.w600, fontSize: 16),
    );

    final filledButtonStyle = FilledButton.styleFrom(
      backgroundColor: _primary.withOpacity(0.12),
      foregroundColor: _primaryDark,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      textStyle: GoogleFonts.nunito(fontWeight: FontWeight.w600),
    );

    final outlinedButtonStyle = OutlinedButton.styleFrom(
      foregroundColor: _primaryDark,
      side: const BorderSide(width: 1.2, color: _primary),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      textStyle: GoogleFonts.nunito(fontWeight: FontWeight.w600),
    );

    return base.copyWith(
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: Colors.transparent,
        foregroundColor: _primaryDark,
        titleTextStyle: GoogleFonts.nunito(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: _primaryDark,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 6,
        shadowColor: _primary.withOpacity(0.12),
        surfaceTintColor: Colors.white,
        color: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      chipTheme: base.chipTheme.copyWith(
        backgroundColor: _primary.withOpacity(0.1),
        selectedColor: _primary,
        labelStyle: GoogleFonts.nunito(
          color: _primaryDark,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(style: elevatedButtonStyle),
      filledButtonTheme: FilledButtonThemeData(style: filledButtonStyle),
      outlinedButtonTheme: OutlinedButtonThemeData(style: outlinedButtonStyle),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: _primary.withOpacity(0.16),
        labelTextStyle: MaterialStateProperty.all(
          GoogleFonts.nunito(fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.windows: ZoomPageTransitionsBuilder(),
          TargetPlatform.linux: ZoomPageTransitionsBuilder(),
        },
      ),
    );
  }
}
