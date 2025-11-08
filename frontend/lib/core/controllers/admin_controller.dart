import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api_client.dart';
import '../providers.dart';

final adminDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final client = ref.watch(apiClientProvider);
  final response = await client.get('/admin/dashboard');
  return response;
});
