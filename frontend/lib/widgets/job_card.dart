import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/models/job.dart';

class JobCard extends StatelessWidget {
  const JobCard({super.key, required this.job, required this.onTap});

  final JobSummary job;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final statusColor =
        job.status == 'published' ? Colors.teal.shade50 : Colors.grey.shade200;

    return Hero(
      tag: 'job-${job.id}',
      child: Material(
        color: Colors.transparent,
        child: Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          job.title,
                          style: Theme.of(context).textTheme.titleMedium,
                        ).animate().fadeIn().slideX(begin: -0.2, duration: 300.ms),
                      ),
                      Chip(
                        label: Text(job.status.toUpperCase()),
                        backgroundColor: statusColor,
                      ).animate().fadeIn().scale(begin: const Offset(0.9, 0.9)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    job.description,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ).animate().fadeIn(delay: 100.ms),
                  if (job.tags.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: job.tags
                          .take(5)
                          .map(
                            (tag) => Chip(
                              label: Text(tag),
                            ).animate().fadeIn(delay: (120 + job.tags.indexOf(tag) * 40).ms),
                          )
                          .toList(),
                    ),
                  ],
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(Icons.place_outlined, size: 18),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(job.location ?? 'リモート可'),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        job.currencyFormat,
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                    ],
                  ).animate().fadeIn(delay: 160.ms),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
