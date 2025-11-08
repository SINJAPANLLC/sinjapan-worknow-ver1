class Payment {
  const Payment({
    required this.id,
    required this.assignmentId,
    required this.amount,
    required this.currency,
    required this.status,
    this.intentId,
  });

  factory Payment.fromJson(Map<String, dynamic> json) => Payment(
        id: json['id'] as String,
        assignmentId: json['assignment_id'] as String? ?? '',
        amount: json['amount'] as int? ?? 0,
        currency: json['currency'] as String? ?? 'JPY',
        status: json['status'] as String? ?? 'requires_payment_method',
        intentId: json['stripe_payment_intent_id'] as String?,
      );

  final String id;
  final String assignmentId;
  final int amount;
  final String currency;
  final String status;
  final String? intentId;
}
