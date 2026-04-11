import 'package:flutter/material.dart';

import '../core/network/api_client.dart';
import '../features/auth/session/app_session_controller.dart';
import 'router.dart';

class UnitaryCareApp extends StatelessWidget {
  const UnitaryCareApp({
    super.key,
    required this.apiClient,
    required this.sessionController,
  });

  final ApiClient apiClient;
  final AppSessionController sessionController;

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Unitary Care',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0D6E6E)),
        scaffoldBackgroundColor: const Color(0xFFF6F7F9),
        useMaterial3: true,
      ),
      routerConfig: buildRouter(
        apiClient: apiClient,
        sessionController: sessionController,
      ),
    );
  }
}
