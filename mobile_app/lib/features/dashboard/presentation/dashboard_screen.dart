import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_client.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/url_resolver.dart';
import '../../auth/session/app_session_controller.dart';
import '../models/dashboard_models.dart';
import '../services/dashboard_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({
    super.key,
    required this.apiClient,
    required this.sessionController,
  });

  final ApiClient apiClient;
  final AppSessionController sessionController;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late final DashboardService _service;
  late Future<DashboardSnapshot> _future;

  @override
  void initState() {
    super.initState();
    _service = DashboardService(apiClient: widget.apiClient);
    _future = _service.loadDashboard();
  }

  Future<void> _reload() async {
    setState(() => _future = _service.loadDashboard());
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: <Widget>[
          IconButton(
            tooltip: 'Logout',
            onPressed: () async {
              await widget.sessionController.logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: FutureBuilder<DashboardSnapshot>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text('Unable to load your dashboard.', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 12),
                    FilledButton(onPressed: _reload, child: const Text('Try Again')),
                  ],
                ),
              ),
            );
          }

          final data = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _reload,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              children: <Widget>[
                Card(
                  child: ListTile(
                    title: Text('Welcome, ${data.profile.fullName}'),
                    subtitle: Text('${data.profile.mobileNumber}\n${data.profile.email}'),
                    isThreeLine: true,
                  ),
                ),
                const SizedBox(height: 12),
                if (data.unitAssignment != null)
                  _SectionCard(
                    title: 'Assigned Unit',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          '${data.unitAssignment!.projectName} • ${data.unitAssignment!.unitNumber}',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tower ${data.unitAssignment!.tower}, Floor ${data.unitAssignment!.floor}, ${data.unitAssignment!.type}, ${data.unitAssignment!.areaSqFt} sq ft',
                        ),
                        const SizedBox(height: 4),
                        Text('Booking date: ${Formatters.date(data.unitAssignment!.bookingDate)}'),
                        Text('Agreement value: ${Formatters.currency(data.unitAssignment!.agreementValue)}'),
                      ],
                    ),
                  )
                else
                  const _SectionCard(
                    title: 'Assigned Unit',
                    child: Text('No unit has been assigned to this buyer yet.'),
                  ),
                const SizedBox(height: 12),
                _SectionCard(
                  title: 'Payment Summary',
                  child: Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: <Widget>[
                      _MetricChip(label: 'Total', value: Formatters.currency(data.paymentSummary.totalAmount)),
                      _MetricChip(label: 'Paid', value: Formatters.currency(data.paymentSummary.paidAmount)),
                      _MetricChip(label: 'Due', value: Formatters.currency(data.paymentSummary.dueAmount)),
                      _MetricChip(label: 'Overdue', value: Formatters.currency(data.paymentSummary.overdueAmount)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _SectionCard(
                  title: 'Quick Links',
                  child: Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: <Widget>[
                      _QuickLink(label: 'Payments', icon: Icons.account_balance_wallet_outlined, onTap: () => context.go('/payments')),
                      _QuickLink(label: 'Documents', icon: Icons.folder_copy_outlined, onTap: () => context.go('/documents')),
                      _QuickLink(label: 'Progress', icon: Icons.construction_outlined, onTap: () => context.go('/progress')),
                      _QuickLink(label: 'Support', icon: Icons.support_agent_outlined, onTap: () => context.go('/support')),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _SectionCard(
                  title: 'Recent Progress',
                  child: Column(
                    children: data.progress.isEmpty
                        ? const <Widget>[Text('No progress updates available yet.')]
                        : data.progress
                            .map(
                              (item) => Card(
                                margin: const EdgeInsets.only(bottom: 8),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    if (item.imageUrl != null)
                                      ClipRRect(
                                        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                                        child: Image.network(
                                          UrlResolver.resolve(item.imageUrl!),
                                          height: 160,
                                          width: double.infinity,
                                          fit: BoxFit.cover,
                                          errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                                        ),
                                      ),
                                    ListTile(
                                      title: Text(item.title),
                                      subtitle: Text('${item.description}\n${Formatters.dateTime(item.publishedAt)}'),
                                      isThreeLine: true,
                                    ),
                                  ],
                                ),
                              ),
                            )
                            .toList(),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(label, style: Theme.of(context).textTheme.labelMedium),
          const SizedBox(height: 4),
          Text(value, style: Theme.of(context).textTheme.titleSmall),
        ],
      ),
    );
  }
}

class _QuickLink extends StatelessWidget {
  const _QuickLink({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      avatar: Icon(icon, size: 18),
      label: Text(label),
      onPressed: onTap,
    );
  }
}
