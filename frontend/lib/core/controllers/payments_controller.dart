import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api_client.dart';
import '../models/payment.dart';
import '../providers.dart';

final paymentHistoryProvider = StateNotifierProvider<PaymentHistoryController, AsyncValue<List<Payment>>>((ref) {
  return PaymentHistoryController(ref.watch(apiClientProvider));
});

class PaymentHistoryController extends StateNotifier<AsyncValue<List<Payment>>> {
  PaymentHistoryController(this._client) : super(const AsyncValue.loading());

  final ApiClient _client;

  Future<void> load({String? assignmentId}) async {
    try {
      final response = await _client.get('/payments/', query: {
        if (assignmentId != null) 'assignment_id': assignmentId,
      });
      final items = (response['items'] as List<dynamic>? ?? response['payments'] as List<dynamic>? ?? [])
          .map((e) => Payment.fromJson(e as Map<String, dynamic>))
          .toList();
      state = AsyncValue.data(items);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }
}
