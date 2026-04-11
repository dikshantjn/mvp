import 'package:flutter/foundation.dart';

import '../../../core/storage/token_storage.dart';
import '../models/auth_models.dart';
import '../services/auth_service.dart';

enum AuthStatus {
  unknown,
  unauthenticated,
  authenticated,
}

class AppSessionController extends ChangeNotifier {
  AppSessionController({
    required AuthService authService,
    required TokenStorage tokenStorage,
  })  : _authService = authService,
        _tokenStorage = tokenStorage;

  final AuthService _authService;
  final TokenStorage _tokenStorage;

  AuthStatus _status = AuthStatus.unknown;
  BuyerUserSummary? _user;

  AuthStatus get status => _status;
  BuyerUserSummary? get user => _user;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> bootstrap() async {
    final tokens = await _tokenStorage.read();
    _status = tokens == null ? AuthStatus.unauthenticated : AuthStatus.authenticated;
    notifyListeners();
  }

  Future<OtpRequestResult> requestOtp(String mobileNumber) {
    return _authService.requestOtp(mobileNumber);
  }

  Future<void> verifyOtp({
    required String requestId,
    required String mobileNumber,
    required String otpCode,
  }) async {
    final session = await _authService.verifyOtp(
      requestId: requestId,
      mobileNumber: mobileNumber,
      otpCode: otpCode,
    );

    await _tokenStorage.save(session.tokens);
    _user = session.user;
    _status = AuthStatus.authenticated;
    notifyListeners();
  }

  Future<void> logout() async {
    await _tokenStorage.clear();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
