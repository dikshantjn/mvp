import '../../../core/config/app_config.dart';
import '../../../core/models/paginated_response.dart';
import '../../../core/network/api_client.dart';
import '../models/progress_models.dart';

class ProgressService {
  const ProgressService({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<PaginatedResponse<ProgressUpdateItem>> getProgressUpdates({
    int page = 1,
    int pageSize = AppConfig.defaultPageSize,
  }) {
    return _apiClient.get<PaginatedResponse<ProgressUpdateItem>>(
      '/me/progress',
      queryParameters: <String, dynamic>{'page': page, 'pageSize': pageSize},
      parser: (raw) => PaginatedResponse<ProgressUpdateItem>.fromJson(
        raw as Map<String, dynamic>,
        ProgressUpdateItem.fromJson,
      ),
    );
  }
}
