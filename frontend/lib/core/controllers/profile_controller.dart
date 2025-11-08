import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api_client.dart';
import '../auth_service.dart';
import '../models/user.dart';
import '../providers.dart';

final profileProvider = FutureProvider<User?>((ref) async {
  final client = ref.watch(apiClientProvider);
  try {
    final json = await client.get('/auth/me');
    return User.fromJson(json);
  } catch (_) {
    return null;
  }
});

final logoutProvider = Provider<Future<void> Function()>((ref) {
  final auth = ref.watch(authRepositoryProvider);
  return auth.logout;
});
