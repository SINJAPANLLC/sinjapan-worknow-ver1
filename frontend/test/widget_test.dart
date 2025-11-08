import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:work_now/core/providers.dart';
import 'package:work_now/main.dart';

void main() {
  testWidgets('WorkNowApp shows login screen when not authenticated', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
        child: const WorkNowApp(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('ログイン'), findsOneWidget);
    expect(find.byType(TextFormField), findsWidgets);
  });
}
