class AppConfig {
  const AppConfig._();

  static const String appName = 'Unitary Care';
  static const String apiBaseUrl = 'http://localhost:3000';
  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 20);
  static const int defaultPageSize = 20;
}
