class Assignment {
  const Assignment({
    required this.id,
    required this.jobId,
    required this.workerId,
    required this.status,
    this.notes,
  });

  factory Assignment.fromJson(Map<String, dynamic> json) => Assignment(
        id: json['id'] as String,
        jobId: json['job_id'] as String? ?? '',
        workerId: json['worker_id'] as String? ?? '',
        status: json['status'] as String,
        notes: json['notes'] as String?,
      );

  final String id;
  final String jobId;
  final String workerId;
  final String status;
  final String? notes;
}
