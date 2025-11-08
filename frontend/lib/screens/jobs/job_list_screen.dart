import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/controllers/jobs_controller.dart';
import '../../widgets/job_card.dart';

class JobListScreen extends ConsumerWidget {
  const JobListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobsState = ref.watch(jobListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('案件一覧')),
      body: RefreshIndicator(
        onRefresh: () => ref.read(jobListProvider.notifier).load(),
        child: jobsState.when(
          data: (jobs) => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: jobs.length,
            itemBuilder: (context, index) {
              final job = jobs[index];
              return JobCard(
                job: job,
                onTap: () => context.go('/jobs/detail/${job.id}'),
              );
            },
          ),
          error: (error, _) => ListView(
            children: [
              Padding(
                padding: const EdgeInsets.all(32),
                child: Text('求人の取得に失敗しました: $error'),
              ),
            ],
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}
