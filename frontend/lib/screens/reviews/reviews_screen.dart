import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth_service.dart';
import '../../core/controllers/assignments_controller.dart';
import '../../core/controllers/reviews_controller.dart';
import '../../core/models/assignment.dart';
import '../../core/models/review.dart';

class ReviewsScreen extends ConsumerStatefulWidget {
  const ReviewsScreen({super.key});

  @override
  ConsumerState<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends ConsumerState<ReviewsScreen> {
  String? _selectedAssignmentId;
  bool _initializing = true;

  final _formKey = GlobalKey<FormState>();
  int _rating = 5;
  final _commentController = TextEditingController();
  bool _isPublic = true;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

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
    ref.read(assignmentsProvider.notifier).load();
    ref.read(assignmentsProvider).maybeWhen(
      data: (assignments) {
        if (assignments.isNotEmpty) {
          _selectedAssignmentId ??= assignments.first.id;
        }
        ref.read(reviewsProvider.notifier).load(assignmentId: _selectedAssignmentId, revieweeId: null);
        setState(() => _initializing = false);
      },
      orElse: () {},
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider).valueOrNull;
    final assignmentsState = ref.watch(assignmentsProvider);
    final reviewsState = ref.watch(reviewsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('レビュー'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(reviewsProvider.notifier).refresh(),
          ),
        ],
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: assignmentsState.when(
                    data: (assignments) => DropdownButtonFormField<String>(
                      value: _selectedAssignmentId,
                      decoration: const InputDecoration(
                        labelText: '対象の割当を選択',
                        border: OutlineInputBorder(),
                      ),
                      items: assignments
                          .map((assignment) => DropdownMenuItem(
                                value: assignment.id,
                                child: Text('案件ID: ${assignment.jobId} / ワーカー: ${assignment.workerId}'),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setState(() => _selectedAssignmentId = value);
                        ref.read(reviewsProvider.notifier).load(assignmentId: value, revieweeId: null);
                      },
                    ),
                    error: (error, _) => Text('割当の取得に失敗しました: $error'),
                    loading: () => const LinearProgressIndicator(),
                  ),
                ),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () => ref.read(reviewsProvider.notifier).refresh(),
                    child: reviewsState.when(
                      data: (reviews) => ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          _ReviewForm(
                            formKey: _formKey,
                            rating: _rating,
                            onRatingChanged: (value) => setState(() => _rating = value),
                            commentController: _commentController,
                            isPublic: _isPublic,
                            onPublicChanged: (value) => setState(() => _isPublic = value),
                            onSubmit: () => _handleSubmit(user, _selectedAssignmentId),
                          ),
                          const SizedBox(height: 24),
                          if (reviews.isEmpty)
                            const Card(
                              child: Padding(
                                padding: EdgeInsets.all(16),
                                child: Text('まだレビューはありません。'),
                              ),
                            )
                          else
                            ...reviews.map((review) => _ReviewTile(review: review, currentUserId: user.id)),
                        ],
                      ),
                      error: (error, _) => ListView(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(32),
                            child: Text('レビューの取得に失敗しました: $error'),
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

  Future<void> _handleSubmit(user, String? assignmentId) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    if (assignmentId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('割当を選択してください。')),
      );
      return;
    }
    await ref.read(reviewsProvider.notifier).create(
          assignmentId: assignmentId,
          rating: _rating,
          comment: _commentController.text.isEmpty ? null : _commentController.text,
          isPublic: _isPublic,
        );
    _commentController.clear();
    setState(() => _rating = 5);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('レビューを送信しました。')),
    );
  }
}

class _ReviewForm extends StatelessWidget {
  const _ReviewForm({
    required this.formKey,
    required this.rating,
    required this.onRatingChanged,
    required this.commentController,
    required this.isPublic,
    required this.onPublicChanged,
    required this.onSubmit,
  });

  final GlobalKey<FormState> formKey;
  final int rating;
  final ValueChanged<int> onRatingChanged;
  final TextEditingController commentController;
  final bool isPublic;
  final ValueChanged<bool> onPublicChanged;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('レビューを投稿', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                value: rating,
                decoration: const InputDecoration(
                  labelText: '評価 (1-5)',
                  border: OutlineInputBorder(),
                ),
                items: List.generate(5, (index) => index + 1)
                    .map((value) => DropdownMenuItem(value: value, child: Text('$value')))
                    .toList(),
                onChanged: (value) => onRatingChanged(value ?? 5),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: commentController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'コメント (任意)',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value != null && value.length > 2000) {
                    return '2000文字以内で入力してください。';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                value: isPublic,
                onChanged: onPublicChanged,
                title: const Text('公開レビューとして表示'),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton.icon(
                  onPressed: onSubmit,
                  icon: const Icon(Icons.send_outlined),
                  label: const Text('送信'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReviewTile extends StatelessWidget {
  const _ReviewTile({required this.review, required this.currentUserId});

  final Review review;
  final String currentUserId;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('評価: ${review.rating}/5', style: Theme.of(context).textTheme.titleMedium),
                Chip(
                  label: Text(review.isPublic ? '公開' : '非公開'),
                  backgroundColor: review.isPublic ? Colors.teal.shade50 : Colors.grey.shade200,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('レビュアー: ${review.reviewerId} / 対象: ${review.revieweeId}'),
            if (review.comment != null && review.comment!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(review.comment!),
            ],
          ],
        ),
      ),
    );
  }
}
