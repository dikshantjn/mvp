import '../config/app_config.dart';

class UrlResolver {
  const UrlResolver._();

  static String resolve(String pathOrUrl) {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl;
    }
    return '${AppConfig.apiBaseUrl}$pathOrUrl';
  }
}
