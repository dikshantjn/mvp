class BuyerDocument {
  const BuyerDocument({
    required this.id,
    required this.title,
    required this.type,
    required this.uploadedAt,
    required this.fileName,
    required this.downloadUrl,
  });

  final String id;
  final String title;
  final String type;
  final String uploadedAt;
  final String fileName;
  final String downloadUrl;

  factory BuyerDocument.fromJson(Map<String, dynamic> json) {
    return BuyerDocument(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      type: json['type'] as String? ?? '',
      uploadedAt: json['uploadedAt'] as String? ?? '',
      fileName: json['fileName'] as String? ?? '',
      downloadUrl: json['downloadUrl'] as String? ?? '',
    );
  }
}
