import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/network/api_client.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/auth/session/app_session_controller.dart';
import '../features/dashboard/presentation/dashboard_screen.dart';
import '../features/documents/presentation/documents_screen.dart';
import '../features/payments/presentation/payments_screen.dart';
import '../features/progress/presentation/progress_screen.dart';
import '../features/support/presentation/support_screen.dart';
import '../features/support/presentation/ticket_detail_screen.dart';

GoRouter buildRouter({
  required ApiClient apiClient,
  required AppSessionController sessionController,
}) {
  return GoRouter(
    initialLocation: '/dashboard',
    refreshListenable: sessionController,
    redirect: (context, state) {
      final isLoggingIn = state.matchedLocation == '/login';
      final status = sessionController.status;

      if (status == AuthStatus.unknown) {
        return isLoggingIn ? null : '/login';
      }

      if (status == AuthStatus.unauthenticated) {
        return isLoggingIn ? null : '/login';
      }

      if (status == AuthStatus.authenticated && isLoggingIn) {
        return '/dashboard';
      }

      return null;
    },
    routes: <RouteBase>[
      GoRoute(
        path: '/login',
        builder: (context, state) => LoginScreen(sessionController: sessionController),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => BuyerShellScaffold(
          currentIndex: 0,
          child: DashboardScreen(
            apiClient: apiClient,
            sessionController: sessionController,
          ),
        ),
      ),
      GoRoute(
        path: '/payments',
        builder: (context, state) => BuyerShellScaffold(
          currentIndex: 1,
          child: PaymentsScreen(apiClient: apiClient),
        ),
      ),
      GoRoute(
        path: '/documents',
        builder: (context, state) => BuyerShellScaffold(
          currentIndex: 2,
          child: DocumentsScreen(apiClient: apiClient),
        ),
      ),
      GoRoute(
        path: '/progress',
        builder: (context, state) => BuyerShellScaffold(
          currentIndex: 3,
          child: ProgressScreen(apiClient: apiClient),
        ),
      ),
      GoRoute(
        path: '/support',
        builder: (context, state) => BuyerShellScaffold(
          currentIndex: 4,
          child: SupportScreen(apiClient: apiClient),
        ),
        routes: <RouteBase>[
          GoRoute(
            path: ':ticketId',
            builder: (context, state) => TicketDetailScreen(
              apiClient: apiClient,
              ticketId: state.pathParameters['ticketId'] ?? '',
            ),
          ),
        ],
      ),
    ],
  );
}

class BuyerShellScaffold extends StatelessWidget {
  const BuyerShellScaffold({
    super.key,
    required this.currentIndex,
    required this.child,
  });

  final int currentIndex;
  final Widget child;

  static const List<String> _paths = <String>[
    '/dashboard',
    '/payments',
    '/documents',
    '/progress',
    '/support',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) => context.go(_paths[index]),
        destinations: const <NavigationDestination>[
          NavigationDestination(icon: Icon(Icons.space_dashboard_outlined), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Payments'),
          NavigationDestination(icon: Icon(Icons.folder_copy_outlined), label: 'Documents'),
          NavigationDestination(icon: Icon(Icons.construction_outlined), label: 'Progress'),
          NavigationDestination(icon: Icon(Icons.support_agent_outlined), label: 'Support'),
        ],
      ),
    );
  }
}
