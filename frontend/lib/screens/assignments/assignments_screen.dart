import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth_service.dart';
import '../../core/controllers/assignments_controller.dart';
import '../../core/controllers/jobs_controller.dart';
import '../../core/models/assignment.dart';
import '../../core/models/job.dart';

class AssignmentsScreen extends ConsumerStatefulWidget {
  const AssignmentsScreen({super.key});

  @override
  ConsumerState<AssignmentsScreen> createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends ConsumerState<AssignmentsScreen> {
  String? _selectedJobId;
  bool _initializing = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _ensureLoaded();
  }

  void _ensureLoaded() {
    final user = ref.read(currentUserProvider).valueOrNull;
    if (user == null || !_initializing) {
      return;
    }
    if (user.role == 'company') {
      final jobsState = ref.read(jobListProvider);
      jobsState.when(
        data: (jobs) {
          if (jobs.isNotEmpty) {
            _selectedJobId ??= jobs.first.id;
          }
          ref.read(assignmentsProvider.notifier).load(jobId: _selectedJobId);
          setState(() => _initializing = false);
        },
        error: (_, __) {
          ref.read(assignmentsProvider.notifier).load();
          setState(() => _initializing = false);
        },
        loading: () {},
      );
    } else {
      ref.read(assignmentsProvider.notifier).load();
      setState(() => _initializing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(currentUserProvider);
    final user = userState.valueOrNull;
    final assignmentsState = ref.watch(assignmentsProvider);
    final jobsState = ref.watch(jobListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('稼働状況'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(assignmentsProvider.notifier).refresh(),
          ),
        ],
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                if (user.role == 'company')
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: jobsState.when(
                      data: (jobs) => DropdownButtonFormField<String>(
                        value: _selectedJobId,
                        decoration: const InputDecoration(
                          labelText: '求人を選択',
                          border: OutlineInputBorder(),
                        ),
                        items: jobs
                            .map((job) => DropdownMenuItem(
                                  value: job.id,
                                  child: Text(job.title),
                                ))
                            .toList(),
                        onChanged: (value) {
                          setState(() => _selectedJobId = value);
                          ref.read(assignmentsProvider.notifier).load(jobId: value);
                        },
                      ),
                      error: (error, _) => Text('求人の取得に失敗しました: $error'),
                      loading: () => const LinearProgressIndicator(),
                    ),
                  ),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () => ref.read(assignmentsProvider.notifier).refresh(),
                    child: assignmentsState.when(
                      data: (assignments) {
                        if (assignments.isEmpty) {
                          return ListView(
                            children: const [
                              Padding(
                                padding: EdgeInsets.all(32),
                                child: Center(child: Text('割り当てられたタスクはありません。')),
                              ),
                            ],
                          );
                        }
                        final jobLookup = jobsState.maybeWhen(
                          data: (jobs) => {for (final job in jobs) job.id: job},
                          orElse: () => <String, JobSummary>{},
                        );
                        return ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: assignments.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final assignment = assignments[index];
                            final job = jobLookup[assignment.jobId];
                            return _AssignmentTile(
                              assignment: assignment,
                              job: job,
                              isWorker: user.role == 'worker',
                              onStatusChanged: user.role == 'company'
                                  ? (status) => ref
                                      .read(assignmentsProvider.notifier)
                                      .updateStatus(assignment.id, status)
                                  : null,
                            );
                          },
                        );
                      },
                      error: (error, _) => ListView(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(32),
                            child: Text('割当の取得に失敗しました: $error'),
                          ),
                        ],
                      ),
                      loading: () => const Center(child: CircularProgressIndicator()),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

class _AssignmentTile extends StatelessWidget {
  const _AssignmentTile({
    required this.assignment,
    this.job,
    required this.isWorker,
    this.onStatusChanged,
  });

  final Assignment assignment;
  final JobSummary? job;
  final bool isWorker;
  final void Function(String status)? onStatusChanged;

  static const _statuses = [
    DropdownMenuItem(value: 'active', child: Text('稼働中')),
    DropdownMenuItem(value: 'completed', child: Text('完了')),
    DropdownMenuItem(value: 'cancelled', child: Text('キャンセル')),
  ];

  @override
  Widget build(BuildContext context) {
    final title = job?.title ?? '求人ID: ${assignment.jobId}';
    final subtitle = isWorker
        ? 'ステータス: ${_statusLabel(assignment.status)}'
        : 'ワーカーID: ${assignment.workerId} / ${_statusLabel(assignment.status)}';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(subtitle),
            if (assignment.notes != null && assignment.notes!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('メモ: ${assignment.notes!}'),
            ],
            const SizedBox(height: 12),
            if (isWorker)
              Chip(
                label: Text(_statusLabel(assignment.status)),
                backgroundColor: _statusColor(assignment.status),
              )
            else
              DropdownButtonFormField<String>(
                value: assignment.status,
                items: _statuses,
                decoration: const InputDecoration(
                  labelText: 'ステータス更新',
                  border: OutlineInputBorder(),
                ),
                onChanged: onStatusChanged != null 
                    ? (value) { if (value != null) onStatusChanged?.call(value); }
                    : null,
              ),
          ],
        ),
      ),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'active':
        return '稼働中';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'completed':
        return Colors.teal.shade100;
      case 'cancelled':
        return Colors.red.shade100;
      default:
        return Colors.blue.shade100;
    }
  }
}
