import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api_client.dart';
import '../models/notification.dart';
import '../providers.dart';

final notificationsProvider = StateNotifierProvider<NotificationController, AsyncValue<List<AppNotification>>>((ref) {
  return NotificationController(ref.watch(apiClientProvider));
});

class NotificationController extends StateNotifier<AsyncValue<List<AppNotification>>> {
  NotificationController(this._client) : super(const AsyncValue.loading()) {
    load();
  }

  final ApiClient _client;

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    await load();
  }

  Future<void> load() async {
    try {
      final response = await _client.get('/notifications/');
      final items = (response['items'] as List<dynamic>? ?? response['notifications'] as List<dynamic>? ?? [])
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList();
      state = AsyncValue.data(items);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _client.patch('/notifications/$id', body: {'read': true});
      await load();
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }
}
