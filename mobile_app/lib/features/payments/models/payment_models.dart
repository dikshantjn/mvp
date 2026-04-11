class PaymentHistoryItem {
  const PaymentHistoryItem({
    required this.id,
    required this.title,
    required this.amount,
    required this.status,
    required this.dueDate,
    required this.paidDate,
    required this.referenceNumber,
  });

  final String id;
  final num amount;
  final String title;
  final String status;
  final String dueDate;
  final String? paidDate;
  final String? referenceNumber;

  factory PaymentHistoryItem.fromJson(Map<String, dynamic> json) {
    return PaymentHistoryItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      amount: json['amount'] as num? ?? 0,
      status: json['status'] as String? ?? '',
      dueDate: json['dueDate'] as String? ?? '',
      paidDate: json['paidDate'] as String?,
      referenceNumber: json['referenceNumber'] as String?,
    );
  }
}

class PaymentScheduleItem {
  const PaymentScheduleItem({
    required this.id,
    required this.title,
    required this.amount,
    required this.dueDate,
    required this.status,
  });

  final String id;
  final String title;
  final num amount;
  final String dueDate;
  final String status;

  factory PaymentScheduleItem.fromJson(Map<String, dynamic> json) {
    return PaymentScheduleItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      amount: json['amount'] as num? ?? 0,
      dueDate: json['dueDate'] as String? ?? '',
      status: json['status'] as String? ?? '',
    );
  }
}
