import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/app_theme.dart';
import 'core/auth_service.dart';
import 'core/providers.dart';
import 'navigation/app_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();

  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
      child: const WorkNowApp(),
    ),
  );
}

class WorkNowApp extends ConsumerWidget {
  const WorkNowApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'WORK NOW',
      theme: WorkNowTheme.light,
      routerConfig: ref.watch(appShellRouterProvider),
      locale: const Locale('ja'),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('ja'), Locale('en')],
      builder: (context, child) => _AuthInitializer(child: child!),
    );
  }
}

class _AuthInitializer extends ConsumerStatefulWidget {
  const _AuthInitializer({required this.child});

  final Widget child;

  @override
  ConsumerState<_AuthInitializer> createState() => _AuthInitializerState();
}

class _AuthInitializerState extends ConsumerState<_AuthInitializer> {
  @override
  void initState() {
    super.initState();
    ref.read(currentUserProvider.notifier).load();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
