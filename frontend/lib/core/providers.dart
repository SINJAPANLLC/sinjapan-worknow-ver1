import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'config.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences not initialized');
});

final configProvider = Provider<AppConfig>((ref) => AppConfig.prod);

final apiClientProvider = Provider<ApiClient>((ref) {
  final config = ref.watch(configProvider);
  final prefs = ref.watch(sharedPreferencesProvider);
  return ApiClient(config, prefs);
});
