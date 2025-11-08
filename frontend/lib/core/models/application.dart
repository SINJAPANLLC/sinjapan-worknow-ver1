class Application {
  const Application({
    required this.id,
    required this.jobId,
    required this.workerId,
    required this.status,
    this.coverLetter,
  });

  factory Application.fromJson(Map<String, dynamic> json) => Application(
        id: json['id'] as String,
        jobId: json['job_id'] as String? ?? json['jobId'] as String? ?? '',
        workerId: json['worker_id'] as String? ?? json['workerId'] as String? ?? '',
        status: json['status'] as String,
        coverLetter: json['cover_letter'] as String?,
      );

  final String id;
  final String jobId;
  final String workerId;
  final String status;
  final String? coverLetter;
}
