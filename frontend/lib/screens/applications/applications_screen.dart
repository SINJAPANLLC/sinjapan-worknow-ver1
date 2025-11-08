import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth_service.dart';
import '../../core/controllers/applications_controller.dart';
import '../../core/controllers/jobs_controller.dart';
import '../../core/models/application.dart';
import '../../core/models/job.dart';

class ApplicationsScreen extends ConsumerStatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  ConsumerState<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends ConsumerState<ApplicationsScreen> {
  String? _selectedJobId;
  bool _loadingInitial = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _ensureLoaded();
  }

  void _ensureLoaded() {
    final user = ref.read(currentUserProvider).valueOrNull;
    if (user == null) {
      return;
    }
    if (_loadingInitial) {
      if (user.role == 'company') {
        final jobsState = ref.read(jobListProvider);
        jobsState.when(
          data: (jobs) {
            if (jobs.isNotEmpty) {
              _selectedJobId ??= jobs.first.id;
            }
            ref.read(applicationsProvider.notifier).load(jobId: _selectedJobId);
            setState(() => _loadingInitial = false);
          },
          error: (_, __) {
            ref.read(applicationsProvider.notifier).load(jobId: null);
            setState(() => _loadingInitial = false);
          },
          loading: () {},
        );
      } else {
        ref.read(applicationsProvider.notifier).load();
        setState(() => _loadingInitial = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(currentUserProvider);
    final user = userState.valueOrNull;
    final applicationsState = ref.watch(applicationsProvider);
    final jobsState = ref.watch(jobListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('応募状況'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(applicationsProvider.notifier).refresh(),
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
                          ref.read(applicationsProvider.notifier).load(jobId: value);
                        },
                      ),
                      error: (error, _) => Text('求人の取得に失敗しました: $error'),
                      loading: () => const LinearProgressIndicator(),
                    ),
                  ),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () => ref.read(applicationsProvider.notifier).refresh(),
                    child: applicationsState.when(
                      data: (applications) {
                        if (applications.isEmpty) {
                          return ListView(
                            children: const [
                              Padding(
                                padding: EdgeInsets.all(32),
                                child: Center(child: Text('応募はまだありません。')),
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
                          itemCount: applications.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final application = applications[index];
                            final job = jobLookup[application.jobId];
                            return _ApplicationTile(
                              application: application,
                              job: job,
                              isWorker: user.role == 'worker',
                              onWithdraw: user.role == 'worker'
                                  ? () => ref
                                      .read(applicationsProvider.notifier)
                                      .withdraw(application.id)
                                  : null,
                              onUpdateStatus: user.role == 'company'
                                  ? (status) => ref
                                      .read(applicationsProvider.notifier)
                                      .updateStatus(application.id, status)
                                  : null,
                            );
                          },
                        );
                      },
                      error: (error, stack) => ListView(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(32),
                            child: Text('応募情報の取得に失敗しました: $error'),
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

class _ApplicationTile extends StatelessWidget {
  const _ApplicationTile({
    required this.application,
    required this.job,
    required this.isWorker,
    this.onWithdraw,
    this.onUpdateStatus,
  });

  final Application application;
  final JobSummary? job;
  final bool isWorker;
  final VoidCallback? onWithdraw;
  final void Function(String status)? onUpdateStatus;

  static const _companyStatuses = [
    DropdownMenuItem(value: 'pending', child: Text('審査中')),
    DropdownMenuItem(value: 'interview', child: Text('面談中')),
    DropdownMenuItem(value: 'hired', child: Text('採用')),
    DropdownMenuItem(value: 'rejected', child: Text('不採用')),
  ];

  @override
  Widget build(BuildContext context) {
    final title = job?.title ?? '求人ID: ${application.jobId}';
    final subtitle = isWorker
        ? 'ステータス: ${_statusLabel(application.status)}'
        : 'ワーカーID: ${application.workerId} / ${_statusLabel(application.status)}';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(subtitle),
            if (application.coverLetter != null && application.coverLetter!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('メッセージ: ${application.coverLetter!}'),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                if (isWorker)
                  OutlinedButton.icon(
                    onPressed: application.status == 'pending' || application.status == 'interview'
                        ? onWithdraw
                        : null,
                    icon: const Icon(Icons.close),
                    label: const Text('応募を取り下げ'),
                  )
                else
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: application.status,
                      items: _companyStatuses,
                      decoration: const InputDecoration(
                        labelText: 'ステータス更新',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: onUpdateStatus != null 
                          ? (value) { if (value != null) onUpdateStatus?.call(value); }
                          : null,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'pending':
        return '審査中';
      case 'interview':
        return '面談中';
      case 'hired':
        return '採用';
      case 'rejected':
        return '不採用';
      case 'withdrawn':
        return '辞退済み';
      default:
        return status;
    }
  }
}
