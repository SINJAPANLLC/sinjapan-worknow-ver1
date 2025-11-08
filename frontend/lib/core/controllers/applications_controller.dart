import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api_client.dart';
import '../models/application.dart';
import '../providers.dart';

final applicationsProvider = StateNotifierProvider<ApplicationsController, AsyncValue<List<Application>>>((ref) {
  return ApplicationsController(ref.watch(apiClientProvider));
});

class ApplicationsController extends StateNotifier<AsyncValue<List<Application>>> {
  ApplicationsController(this._client) : super(const AsyncValue.loading());

  final ApiClient _client;
  String? _jobId;

  Future<void> load({String? jobId}) async {
    _jobId = jobId;
    state = const AsyncValue.loading();
    try {
      final response = await _client.get('/applications/', query: {
        if (jobId != null && jobId.isNotEmpty) 'job_id': jobId,
      });
      final items = (response['items'] as List<dynamic>? ?? response['applications'] as List<dynamic>? ?? [])
          .map((e) => Application.fromJson(e as Map<String, dynamic>))
          .toList();
      state = AsyncValue.data(items);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }

  Future<void> refresh() => load(jobId: _jobId);

  Future<void> withdraw(String applicationId) async {
    try {
      await _client.patch('/applications/$applicationId', body: {
        'status': 'withdrawn',
      });
      await refresh();
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }

  Future<void> updateStatus(String applicationId, String status) async {
    try {
      await _client.patch('/applications/$applicationId', body: {
        'status': status,
      });
      await refresh();
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }
}
