class AppConfig {
  const AppConfig._();

  static const String appName = 'Unitary Care';
  static const String apiBaseUrl = 'https://unitary-backend.onrender.com';
  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 20);
  static const int defaultPageSize = 20;
}
