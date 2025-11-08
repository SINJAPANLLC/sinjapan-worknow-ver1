import 'package:intl/intl.dart';

class JobSummary {
  const JobSummary({
    required this.id,
    required this.title,
    required this.companyId,
    required this.status,
    required this.description,
    this.location,
    this.hourlyRate,
    this.currency = 'JPY',
    this.tags = const [],
  });

  factory JobSummary.fromJson(Map<String, dynamic> json) => JobSummary(
        id: json['id'] as String,
        title: json['title'] as String,
        companyId: json['company_id'] as String? ?? json['companyId'] as String? ?? '',
        status: json['status'] as String,
        description: json['description'] as String? ?? '',
        location: json['location'] as String?,
        hourlyRate: json['hourly_rate'] as int?,
        currency: json['currency'] as String? ?? 'JPY',
        tags: (json['tags'] as List<dynamic>? ?? []).cast<String>(),
      );

  final String id;
  final String title;
  final String companyId;
  final String status;
  final String description;
  final String? location;
  final int? hourlyRate;
  final String currency;
  final List<String> tags;

  String get currencyFormat {
    if (hourlyRate == null) return '応相談';
    final formatter = NumberFormat.simpleCurrency(name: currency.toUpperCase());
    return formatter.format(hourlyRate);
  }
}
