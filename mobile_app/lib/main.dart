import 'package:flutter/material.dart';

import 'app/app.dart';
import 'core/network/api_client.dart';
import 'core/storage/token_storage.dart';
import 'features/auth/services/auth_service.dart';
import 'features/auth/session/app_session_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final tokenStorage = TokenStorage();
  final apiClient = ApiClient(tokenStorage: tokenStorage);
  final authService = AuthService(apiClient: apiClient);
  final sessionController = AppSessionController(
    authService: authService,
    tokenStorage: tokenStorage,
  );

  await sessionController.bootstrap();

  runApp(
    UnitaryCareApp(
      apiClient: apiClient,
      sessionController: sessionController,
    ),
  );
}
