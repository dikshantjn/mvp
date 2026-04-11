class SupportTicketSummary {
  const SupportTicketSummary({
    required this.id,
    required this.subject,
    required this.category,
    required this.status,
    required this.priority,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String subject;
  final String category;
  final String status;
  final String priority;
  final String createdAt;
  final String updatedAt;

  factory SupportTicketSummary.fromJson(Map<String, dynamic> json) {
    return SupportTicketSummary(
      id: json['id'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      category: json['category'] as String? ?? '',
      status: json['status'] as String? ?? '',
      priority: json['priority'] as String? ?? '',
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }
}

class SupportTicketDetail {
  const SupportTicketDetail({
    required this.id,
    required this.subject,
    required this.category,
    required this.description,
    required this.status,
    required this.priority,
    required this.resolutionNote,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String subject;
  final String category;
  final String description;
  final String status;
  final String priority;
  final String? resolutionNote;
  final String createdAt;
  final String updatedAt;

  factory SupportTicketDetail.fromJson(Map<String, dynamic> json) {
    return SupportTicketDetail(
      id: json['id'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      category: json['category'] as String? ?? '',
      description: json['description'] as String? ?? '',
      status: json['status'] as String? ?? '',
      priority: json['priority'] as String? ?? '',
      resolutionNote: json['resolutionNote'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }
}

class CreateTicketResult {
  const CreateTicketResult({
    required this.id,
    required this.status,
  });

  final String id;
  final String status;

  factory CreateTicketResult.fromJson(Map<String, dynamic> json) {
    return CreateTicketResult(
      id: json['id'] as String? ?? '',
      status: json['status'] as String? ?? '',
    );
  }
}

const List<String> ticketCategories = <String>[
  'payments',
  'documents',
  'construction',
  'legal',
  'other',
];
