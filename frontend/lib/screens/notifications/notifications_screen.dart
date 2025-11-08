import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/controllers/notifications_controller.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('通知'),
        actions: [
          IconButton(
            onPressed: () => ref.read(notificationsProvider.notifier).refresh(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: state.when(
        data: (items) => ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final notification = items[index];
            return Card(
              child: ListTile(
                title: Text(notification.title),
                subtitle: Text(notification.body),
                trailing: notification.isRead
                    ? const Icon(Icons.check, color: Colors.teal)
                    : TextButton(
                        onPressed: () => ref
                            .read(notificationsProvider.notifier)
                            .markAsRead(notification.id),
                        child: const Text('既読'),
                      ),
              ),
            );
          },
        ),
        error: (error, _) => Center(child: Text('通知の取得に失敗しました: $error')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}
