import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_client.dart';
import '../../core/models/job.dart';
import '../../core/providers.dart';

class JobDetailScreen extends ConsumerStatefulWidget {
  const JobDetailScreen({super.key, required this.jobId});

  final String jobId;

  @override
  ConsumerState<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends ConsumerState<JobDetailScreen> {
  late Future<JobSummary> _jobFuture;
  final _coverLetterController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _jobFuture = _fetchJob();
  }

  Future<JobSummary> _fetchJob() async {
    final client = ref.read(apiClientProvider);
    final response = await client.get('/jobs/${widget.jobId}');
    return JobSummary.fromJson(response);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('案件詳細')),
      body: FutureBuilder<JobSummary>(
        future: _jobFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return Center(child: Text('案件情報の取得に失敗しました: ${snapshot.error}'));
          }
          final job = snapshot.data!;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Hero(
                  tag: 'job-${job.id}',
                  child: Material(
                    color: Colors.transparent,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF00C9D2), Color(0xFF007A7A)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(28),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            job.title,
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(color: Colors.white),
                          ).animate().fadeIn(duration: 300.ms),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              const Icon(Icons.account_balance_wallet_outlined, size: 18, color: Colors.white70),
                              const SizedBox(width: 6),
                              Text(job.currencyFormat, style: const TextStyle(color: Colors.white70)),
                              const SizedBox(width: 16),
                              const Icon(Icons.place_outlined, size: 18, color: Colors.white70),
                              const SizedBox(width: 6),
                              Text(job.location ?? 'リモート可', style: const TextStyle(color: Colors.white70)),
                            ],
                          ).animate().fadeIn(delay: 120.ms),
                          if (job.tags.isNotEmpty) ...[
                            const SizedBox(height: 16),
                            Wrap(
                              spacing: 8,
                              children: job.tags
                                  .map(
                                    (tag) => Chip(
                                      label: Text(tag),
                                      backgroundColor: Colors.white24,
                                      labelStyle: const TextStyle(color: Colors.white),
                                    ),
                                  )
                                  .toList(),
                            ).animate().fadeIn(delay: 180.ms),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(job.description, style: Theme.of(context).textTheme.bodyLarge)
                    .animate()
                    .fadeIn(duration: 250.ms),
                const SizedBox(height: 32),
                TextField(
                  controller: _coverLetterController,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    labelText: '応募メッセージ',
                    border: OutlineInputBorder(),
                  ),
                ).animate().fadeIn(delay: 120.ms),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.send_outlined),
                    label: const Text('応募する'),
                    onPressed: () => _apply(job.id),
                  ),
                ).animate().scale(delay: 180.ms, duration: 200.ms),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _apply(String jobId) async {
    final messenger = ScaffoldMessenger.of(context);
    final client = ref.read(apiClientProvider);
    try {
      await client.post('/applications/', body: {
        'job_id': jobId,
        'cover_letter': _coverLetterController.text,
      });
      messenger.showSnackBar(const SnackBar(content: Text('応募が完了しました。')));
    } catch (error) {
      messenger.showSnackBar(SnackBar(content: Text('応募に失敗しました: $error')));
    }
  }
}
