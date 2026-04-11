class ApiException implements Exception {
  ApiException({
    required this.code,
    required this.message,
    this.details,
    this.statusCode,
  });

  final String code;
  final String message;
  final Object? details;
  final int? statusCode;

  @override
  String toString() => 'ApiException(code: $code, message: $message)';
}
