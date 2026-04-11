import '../../../core/storage/token_storage.dart';

class BuyerUserSummary {
  const BuyerUserSummary({
    required this.id,
    required this.fullName,
    required this.mobileNumber,
    required this.role,
  });

  final String id;
  final String fullName;
  final String mobileNumber;
  final String role;

  factory BuyerUserSummary.fromJson(Map<String, dynamic> json) {
    return BuyerUserSummary(
      id: json['id'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      mobileNumber: json['mobileNumber'] as String? ?? '',
      role: json['role'] as String? ?? 'buyer',
    );
  }
}

class OtpRequestResult {
  const OtpRequestResult({
    required this.requestId,
    required this.expiresInSeconds,
  });

  final String requestId;
  final int expiresInSeconds;

  factory OtpRequestResult.fromJson(Map<String, dynamic> json) {
    return OtpRequestResult(
      requestId: json['requestId'] as String? ?? '',
      expiresInSeconds: json['expiresInSeconds'] as int? ?? 0,
    );
  }
}

class AuthSession {
  const AuthSession({
    required this.tokens,
    required this.user,
  });

  final SessionTokens tokens;
  final BuyerUserSummary user;

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      tokens: SessionTokens(
        accessToken: json['accessToken'] as String? ?? '',
        refreshToken: json['refreshToken'] as String? ?? '',
        expiresInSeconds: json['expiresInSeconds'] as int? ?? 0,
      ),
      user: BuyerUserSummary.fromJson(json['user'] as Map<String, dynamic>? ?? const {}),
    );
  }
}
