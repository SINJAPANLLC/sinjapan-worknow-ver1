import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api_client.dart';
import '../models/review.dart';
import '../providers.dart';

final reviewsProvider = StateNotifierProvider<ReviewsController, AsyncValue<List<Review>>>((ref) {
  return ReviewsController(ref.watch(apiClientProvider));
});

class ReviewsController extends StateNotifier<AsyncValue<List<Review>>> {
  ReviewsController(this._client) : super(const AsyncValue.loading());

  final ApiClient _client;
  String? _assignmentId;
  String? _revieweeId;

  Future<void> load({String? assignmentId, String? revieweeId}) async {
    _assignmentId = assignmentId;
    _revieweeId = revieweeId;
    state = const AsyncValue.loading();
    try {
      final response = await _client.get('/reviews/', query: {
        if (assignmentId != null && assignmentId.isNotEmpty) 'assignment_id': assignmentId,
        if (revieweeId != null && revieweeId.isNotEmpty) 'reviewee_id': revieweeId,
      });
      final items = (response['items'] as List<dynamic>? ?? response['reviews'] as List<dynamic>? ?? [])
          .map((e) => Review.fromJson(e as Map<String, dynamic>))
          .toList();
      state = AsyncValue.data(items);
    } catch (error, stack) {
      state = AsyncValue.error(error, stackTrace: stack);
    }
  }

  Future<void> refresh() => load(assignmentId: _assignmentId, revieweeId: _revieweeId);

  Future<void> create({
    required String assignmentId,
    required int rating,
    String? comment,
    bool isPublic = true,
  }) async {
    try {
      await _client.post('/reviews/', body: {
        'assignment_id': assignmentId,
        'rating': rating,
        'comment': comment,
        'is_public': isPublic,
      });
      await refresh();
    } catch (error, stack) {
      state = AsyncValue.error(error, stackTrace: stack);
    }
  }

  Future<void> update(String reviewId, {int? rating, String? comment, bool? isPublic}) async {
    try {
      await _client.patch('/reviews/$reviewId', body: {
        if (rating != null) 'rating': rating,
        if (comment != null) 'comment': comment,
        if (isPublic != null) 'is_public': isPublic,
      });
      await refresh();
    } catch (error, stack) {
      state = AsyncValue.error(error, stackTrace: stack);
    }
  }
}
