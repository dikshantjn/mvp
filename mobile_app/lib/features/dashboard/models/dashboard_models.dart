class BuyerProfile {
  const BuyerProfile({
    required this.id,
    required this.fullName,
    required this.email,
    required this.mobileNumber,
    required this.role,
    required this.buyerId,
    required this.status,
  });

  final String id;
  final String fullName;
  final String email;
  final String mobileNumber;
  final String role;
  final String buyerId;
  final String status;

  factory BuyerProfile.fromJson(Map<String, dynamic> json) {
    final buyerProfile = json['buyerProfile'] as Map<String, dynamic>? ?? const {};
    return BuyerProfile(
      id: json['id'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      email: json['email'] as String? ?? '',
      mobileNumber: json['mobileNumber'] as String? ?? '',
      role: json['role'] as String? ?? 'buyer',
      buyerId: buyerProfile['buyerId'] as String? ?? '',
      status: buyerProfile['status'] as String? ?? '',
    );
  }
}

class UnitAssignment {
  const UnitAssignment({
    required this.assignmentId,
    required this.projectId,
    required this.projectName,
    required this.unitId,
    required this.unitNumber,
    required this.tower,
    required this.floor,
    required this.type,
    required this.areaSqFt,
    required this.status,
    required this.agreementValue,
    required this.bookingDate,
  });

  final String assignmentId;
  final String projectId;
  final String projectName;
  final String unitId;
  final String unitNumber;
  final String tower;
  final int floor;
  final String type;
  final int areaSqFt;
  final String status;
  final num agreementValue;
  final String bookingDate;

  factory UnitAssignment.fromJson(Map<String, dynamic> json) {
    final project = json['project'] as Map<String, dynamic>? ?? const {};
    final unit = json['unit'] as Map<String, dynamic>? ?? const {};
    final purchase = json['purchase'] as Map<String, dynamic>? ?? const {};

    return UnitAssignment(
      assignmentId: json['assignmentId'] as String? ?? '',
      projectId: project['id'] as String? ?? '',
      projectName: project['name'] as String? ?? '',
      unitId: unit['id'] as String? ?? '',
      unitNumber: unit['unitNumber'] as String? ?? '',
      tower: unit['tower'] as String? ?? '',
      floor: unit['floor'] as int? ?? 0,
      type: unit['type'] as String? ?? '',
      areaSqFt: unit['areaSqFt'] as int? ?? 0,
      status: unit['status'] as String? ?? '',
      agreementValue: purchase['agreementValue'] as num? ?? 0,
      bookingDate: purchase['bookingDate'] as String? ?? '',
    );
  }
}

class PaymentSummary {
  const PaymentSummary({
    required this.totalAmount,
    required this.paidAmount,
    required this.dueAmount,
    required this.overdueAmount,
    required this.lastPaymentDate,
  });

  final num totalAmount;
  final num paidAmount;
  final num dueAmount;
  final num overdueAmount;
  final String? lastPaymentDate;

  factory PaymentSummary.fromJson(Map<String, dynamic> json) {
    return PaymentSummary(
      totalAmount: json['totalAmount'] as num? ?? 0,
      paidAmount: json['paidAmount'] as num? ?? 0,
      dueAmount: json['dueAmount'] as num? ?? 0,
      overdueAmount: json['overdueAmount'] as num? ?? 0,
      lastPaymentDate: json['lastPaymentDate'] as String?,
    );
  }
}

class ProgressPreview {
  const ProgressPreview({
    required this.id,
    required this.title,
    required this.description,
    required this.publishedAt,
    required this.imageUrl,
  });

  final String id;
  final String title;
  final String description;
  final String publishedAt;
  final String? imageUrl;

  factory ProgressPreview.fromJson(Map<String, dynamic> json) {
    return ProgressPreview(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      publishedAt: json['publishedAt'] as String? ?? '',
      imageUrl: json['imageUrl'] as String?,
    );
  }
}

class DashboardSnapshot {
  const DashboardSnapshot({
    required this.profile,
    required this.unitAssignment,
    required this.paymentSummary,
    required this.progress,
  });

  final BuyerProfile profile;
  final UnitAssignment? unitAssignment;
  final PaymentSummary paymentSummary;
  final List<ProgressPreview> progress;
}
