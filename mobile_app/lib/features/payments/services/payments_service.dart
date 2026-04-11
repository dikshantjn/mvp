import '../../../core/config/app_config.dart';
import '../../../core/models/paginated_response.dart';
import '../../../core/network/api_client.dart';
import '../models/payment_models.dart';

class PaymentsService {
  const PaymentsService({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<PaginatedResponse<PaymentHistoryItem>> getPaymentHistory({
    int page = 1,
    int pageSize = AppConfig.defaultPageSize,
  }) {
    return _apiClient.get<PaginatedResponse<PaymentHistoryItem>>(
      '/me/payments',
      queryParameters: <String, dynamic>{'page': page, 'pageSize': pageSize},
      parser: (raw) => PaginatedResponse<PaymentHistoryItem>.fromJson(
        raw as Map<String, dynamic>,
        PaymentHistoryItem.fromJson,
      ),
    );
  }

  Future<PaginatedResponse<PaymentScheduleItem>> getPaymentSchedule({
    int page = 1,
    int pageSize = AppConfig.defaultPageSize,
  }) {
    return _apiClient.get<PaginatedResponse<PaymentScheduleItem>>(
      '/me/payments/schedule',
      queryParameters: <String, dynamic>{'page': page, 'pageSize': pageSize},
      parser: (raw) => PaginatedResponse<PaymentScheduleItem>.fromJson(
        raw as Map<String, dynamic>,
        PaymentScheduleItem.fromJson,
      ),
    );
  }
}
