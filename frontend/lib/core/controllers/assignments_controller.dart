import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api_client.dart';
import '../models/assignment.dart';
import '../providers.dart';

final assignmentsProvider = StateNotifierProvider<AssignmentsController, AsyncValue<List<Assignment>>>((ref) {
  return AssignmentsController(ref.watch(apiClientProvider));
});

class AssignmentsController extends StateNotifier<AsyncValue<List<Assignment>>> {
  AssignmentsController(this._client) : super(const AsyncValue.loading());

  final ApiClient _client;
  String? _jobId;

  Future<void> load({String? jobId}) async {
    _jobId = jobId;
    state = const AsyncValue.loading();
    try {
      final response = await _client.get('/assignments/', query: {
        if (jobId != null && jobId.isNotEmpty) 'job_id': jobId,
      });
      final items = (response['items'] as List<dynamic>? ?? response['assignments'] as List<dynamic>? ?? [])
          .map((e) => Assignment.fromJson(e as Map<String, dynamic>))
          .toList();
      state = AsyncValue.data(items);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }

  Future<void> refresh() => load(jobId: _jobId);

  Future<void> updateStatus(String assignmentId, String status) async {
    try {
      await _client.patch('/assignments/$assignmentId', body: {
        'status': status,
      });
      await refresh();
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }
}
