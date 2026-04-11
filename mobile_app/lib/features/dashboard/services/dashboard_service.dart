import '../../../core/models/paginated_response.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../models/dashboard_models.dart';

class DashboardService {
  const DashboardService({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<DashboardSnapshot> loadDashboard() async {
    final profileFuture = _apiClient.get<BuyerProfile>(
      '/me',
      parser: (raw) => BuyerProfile.fromJson(raw as Map<String, dynamic>),
    );

    final paymentSummaryFuture = _apiClient.get<PaymentSummary>(
      '/me/payments/summary',
      parser: (raw) => PaymentSummary.fromJson(raw as Map<String, dynamic>),
    );

    final progressFuture = _apiClient.get<PaginatedResponse<ProgressPreview>>(
      '/me/progress',
      queryParameters: <String, dynamic>{'page': 1, 'pageSize': 5},
      parser: (raw) => PaginatedResponse<ProgressPreview>.fromJson(
        raw as Map<String, dynamic>,
        ProgressPreview.fromJson,
      ),
    );

    final unitAssignment = await _loadUnitAssignment();
    final profile = await profileFuture;
    final paymentSummary = await paymentSummaryFuture;
    final progress = await progressFuture;

    return DashboardSnapshot(
      profile: profile,
      unitAssignment: unitAssignment,
      paymentSummary: paymentSummary,
      progress: progress.items,
    );
  }

  Future<UnitAssignment?> _loadUnitAssignment() async {
    try {
      return await _apiClient.get<UnitAssignment>(
        '/me/unit',
        parser: (raw) => UnitAssignment.fromJson(raw as Map<String, dynamic>),
      );
    } on ApiException catch (error) {
      if (error.code == 'NO_UNIT_ASSIGNED') {
        return null;
      }
      rethrow;
    }
  }
}
