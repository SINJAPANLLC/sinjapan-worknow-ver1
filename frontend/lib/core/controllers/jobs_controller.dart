import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api_client.dart';
import '../models/job.dart';
import '../providers.dart';

final jobListProvider = StateNotifierProvider<JobListController, AsyncValue<List<JobSummary>>>((ref) {
  return JobListController(ref.watch(apiClientProvider));
});

class JobListController extends StateNotifier<AsyncValue<List<JobSummary>>> {
  JobListController(this._client) : super(const AsyncValue.loading()) {
    load();
  }

  final ApiClient _client;

  Future<void> load() async {
    try {
      final response = await _client.get('/jobs/');
      final items = (response['items'] as List<dynamic>? ?? response['jobs'] as List<dynamic>? ?? [])
          .map((e) => JobSummary.fromJson(e as Map<String, dynamic>))
          .toList();
      state = AsyncValue.data(items);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }
}
