import '../../../core/config/app_config.dart';
import '../../../core/models/paginated_response.dart';
import '../../../core/network/api_client.dart';
import '../models/support_models.dart';

class SupportService {
  const SupportService({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<PaginatedResponse<SupportTicketSummary>> getTickets({
    int page = 1,
    int pageSize = AppConfig.defaultPageSize,
  }) {
    return _apiClient.get<PaginatedResponse<SupportTicketSummary>>(
      '/me/tickets',
      queryParameters: <String, dynamic>{'page': page, 'pageSize': pageSize},
      parser: (raw) => PaginatedResponse<SupportTicketSummary>.fromJson(
        raw as Map<String, dynamic>,
        SupportTicketSummary.fromJson,
      ),
    );
  }

  Future<SupportTicketDetail> getTicket(String ticketId) {
    return _apiClient.get<SupportTicketDetail>(
      '/me/tickets/$ticketId',
      parser: (raw) => SupportTicketDetail.fromJson(raw as Map<String, dynamic>),
    );
  }

  Future<CreateTicketResult> createTicket({
    required String subject,
    required String category,
    required String description,
  }) {
    return _apiClient.post<CreateTicketResult>(
      '/me/tickets',
      data: <String, dynamic>{
        'subject': subject,
        'category': category,
        'description': description,
      },
      parser: (raw) => CreateTicketResult.fromJson(raw as Map<String, dynamic>),
    );
  }
}
