class ProgressUpdateItem {
  const ProgressUpdateItem({
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

  factory ProgressUpdateItem.fromJson(Map<String, dynamic> json) {
    return ProgressUpdateItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      publishedAt: json['publishedAt'] as String? ?? '',
      imageUrl: json['imageUrl'] as String?,
    );
  }
}
