import '../../../core/config/app_config.dart';
import '../../../core/models/paginated_response.dart';
import '../../../core/network/api_client.dart';
import '../models/document_models.dart';

class DocumentsService {
  const DocumentsService({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<PaginatedResponse<BuyerDocument>> getDocuments({
    int page = 1,
    int pageSize = AppConfig.defaultPageSize,
  }) {
    return _apiClient.get<PaginatedResponse<BuyerDocument>>(
      '/me/documents',
      queryParameters: <String, dynamic>{'page': page, 'pageSize': pageSize},
      parser: (raw) => PaginatedResponse<BuyerDocument>.fromJson(
        raw as Map<String, dynamic>,
        BuyerDocument.fromJson,
      ),
    );
  }
}
