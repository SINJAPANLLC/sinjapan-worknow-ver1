import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth_service.dart';
import '../../core/controllers/jobs_controller.dart';
import '../../core/models/job.dart';
import '../../widgets/animated_gradient_background.dart';
import '../../widgets/job_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobsState = ref.watch(jobListProvider);
    final userState = ref.watch(currentUserProvider);
    final user = userState.valueOrNull;

    return Scaffold(
      appBar: AppBar(
        title: const Text('WORK NOW'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.go('/notifications'),
          ),
          PopupMenuButton<String>(
            onSelected: (route) => context.go(route),
            itemBuilder: (context) {
              final items = <PopupMenuEntry<String>>[
                const PopupMenuItem(value: '/profile', child: Text('プロフィール')),
                const PopupMenuItem(value: '/applications', child: Text('応募状況')),
                const PopupMenuItem(value: '/assignments', child: Text('稼働状況')),
                const PopupMenuItem(value: '/wallet', child: Text('ウォレット')),
              ];
              if (user?.role == 'admin') {
                items.add(const PopupMenuItem(value: '/admin/dashboard', child: Text('管理ダッシュボード')));
              }
              return items;
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.read(jobListProvider.notifier).load(),
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          children: [
            AnimatedGradientBackground(
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(28),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user != null ? 'ようこそ、${user.fullName} さん' : '働くに、彩りを。',
                    ).animate().fadeIn().slideY(begin: 0.3, duration: 350.ms),
                    const SizedBox(height: 12),
                    const Text(
                      'リアルタイムで仕事とワーカーを結びつけるプラットフォーム。',
                      style: TextStyle(color: Colors.white70),
                    ).animate().fadeIn(delay: 100.ms),
                    const SizedBox(height: 24),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: [
                        _QuickActionButton(
                          icon: Icons.assignment_outlined,
                          label: user?.role == 'worker' ? '応募を確認' : '応募管理',
                          onTap: () => context.go('/applications'),
                        ),
                        _QuickActionButton(
                          icon: Icons.task_alt_outlined,
                          label: user?.role == 'worker' ? '稼働を確認' : '割当管理',
                          onTap: () => context.go('/assignments'),
                        ),
                        _QuickActionButton(
                          icon: Icons.rate_review_outlined,
                          label: 'レビュー',
                          onTap: () => context.go('/reviews'),
                        ),
                        _QuickActionButton(
                          icon: Icons.account_balance_wallet_outlined,
                          label: 'ウォレット',
                          onTap: () => context.go('/wallet'),
                        ),
                        _QuickActionButton(
                          icon: Icons.account_circle_outlined,
                          label: 'プロフィール',
                          onTap: () => context.go('/profile'),
                        ),
                        if (user?.role == 'admin')
                          _QuickActionButton(
                            icon: Icons.insights_outlined,
                            label: '管理ダッシュボード',
                            onTap: () => context.go('/admin/dashboard'),
                          ),
                      ],
                    ).animate(interval: 60.ms).fadeIn(delay: 200.ms),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '最新の募集',
                  style: Theme.of(context).textTheme.titleLarge,
                ).animate().fadeIn(duration: 250.ms),
                TextButton(
                  onPressed: () => context.go('/jobs'),
                  child: const Text('すべて見る'),
                ).animate().fadeIn(duration: 250.ms),
              ],
            ),
            const SizedBox(height: 12),
            jobsState.when(
              data: (jobs) {
                final items = jobs.take(10).toList();
                return Column(
                  children: [
                    for (var i = 0; i < items.length; i++)
                      JobCard(
                        job: items[i],
                        onTap: () => _openJob(context, items[i]),
                      )
                          .animate()
                          .fadeIn(delay: (100 + i * 60).ms)
                          .slideY(begin: 0.2, duration: 260.ms),
                  ],
                );
              },
              error: (error, _) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 32),
                child: Text('求人の取得に失敗しました: $error'),
              ).animate().fadeIn(),
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: CircularProgressIndicator()),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openJob(BuildContext context, JobSummary job) {
    context.go('/jobs/detail/${job.id}');
  }
}

class _QuickActionButton extends StatelessWidget {
  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 160,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.16),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white24),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
