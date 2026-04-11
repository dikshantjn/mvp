class ApiEnvelope<T> {
  ApiEnvelope({
    required this.success,
    required this.data,
    this.message,
  });

  final bool success;
  final T data;
  final String? message;

  factory ApiEnvelope.fromJson(
    Map<String, dynamic> json,
    T Function(Object? raw) parser,
  ) {
    return ApiEnvelope<T>(
      success: json['success'] as bool? ?? false,
      data: parser(json['data']),
      message: json['message'] as String?,
    );
  }
}
