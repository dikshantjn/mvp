import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';
import '../models/auth_models.dart';

class AuthService {
  const AuthService({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<OtpRequestResult> requestOtp(String mobileNumber) {
    return _apiClient.post<OtpRequestResult>(
      '/auth/request-otp',
      data: <String, dynamic>{'mobileNumber': mobileNumber},
      parser: (raw) => OtpRequestResult.fromJson(raw as Map<String, dynamic>),
    );
  }

  Future<AuthSession> verifyOtp({
    required String requestId,
    required String mobileNumber,
    required String otpCode,
  }) {
    return _apiClient.post<AuthSession>(
      '/auth/verify-otp',
      data: <String, dynamic>{
        'requestId': requestId,
        'mobileNumber': mobileNumber,
        'otpCode': otpCode,
      },
      parser: (raw) => AuthSession.fromJson(raw as Map<String, dynamic>),
    );
  }

  Future<SessionTokens> refreshToken(String refreshToken) {
    return _apiClient.post<SessionTokens>(
      '/auth/refresh',
      data: <String, dynamic>{'refreshToken': refreshToken},
      parser: (raw) {
        final json = raw as Map<String, dynamic>;
        return SessionTokens(
          accessToken: json['accessToken'] as String? ?? '',
          refreshToken: json['refreshToken'] as String? ?? '',
          expiresInSeconds: json['expiresInSeconds'] as int? ?? 0,
        );
      },
    );
  }
}
