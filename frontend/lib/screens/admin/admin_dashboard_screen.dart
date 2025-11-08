import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth_service.dart';
import '../../core/controllers/admin_controller.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.watch(currentUserProvider);
    final user = userState.valueOrNull;

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (user.role != 'admin') {
      return Scaffold(
        appBar: AppBar(title: const Text('管理ダッシュボード')),
        body: const Center(child: Text('管理者のみアクセスできます。')),
      );
    }

    final dashboard = ref.watch(adminDashboardProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('管理ダッシュボード')),
      body: dashboard.when(
        data: (data) {
          final stats = data['stats'] as Map<String, dynamic>? ?? data;
          final recentUsers = data['recent_users'] as List<dynamic>? ?? [];
          final recentJobs = data['recent_jobs'] as List<dynamic>? ?? [];
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    _StatCard(title: 'ユーザー数', value: '${stats['users'] ?? '--'}'),
                    _StatCard(title: '求人数', value: '${stats['jobs'] ?? '--'}'),
                    _StatCard(title: '売上合計', value: '${stats['revenue'] ?? 0} 円'),
                  ],
                ),
                const SizedBox(height: 24),
                Text('直近登録ユーザー', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                _RecentList(items: recentUsers, emptyLabel: '最近のユーザーはいません'),
                const SizedBox(height: 24),
                Text('直近の求人', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                _RecentList(items: recentJobs, emptyLabel: '最近の求人はありません'),
              ],
            ),
          );
        },
        error: (error, _) => Center(child: Text('ダッシュボードの取得に失敗しました: $error')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.labelMedium),
              const SizedBox(height: 12),
              Text(
                value,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RecentList extends StatelessWidget {
  const _RecentList({required this.items, required this.emptyLabel});

  final List<dynamic> items;
  final String emptyLabel;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text(emptyLabel),
        ),
      );
    }
    return Column(
      children: items
          .map(
            (item) => Card(
              child: ListTile(
                title: Text('${item['title'] ?? item['email'] ?? item['id']}'),
                subtitle: Text('${item['created_at'] ?? ''}'),
              ),
            ),
          )
          .toList(),
    );
  }
}
