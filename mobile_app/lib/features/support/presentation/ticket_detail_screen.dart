import 'package:flutter/material.dart';

import '../../../core/network/api_client.dart';
import '../../../core/utils/formatters.dart';
import '../models/support_models.dart';
import '../services/support_service.dart';

class TicketDetailScreen extends StatefulWidget {
  const TicketDetailScreen({
    super.key,
    required this.apiClient,
    required this.ticketId,
  });

  final ApiClient apiClient;
  final String ticketId;

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  late final SupportService _service;
  late Future<SupportTicketDetail> _future;

  @override
  void initState() {
    super.initState();
    _service = SupportService(apiClient: widget.apiClient);
    _future = _service.getTicket(widget.ticketId);
  }

  Future<void> _reload() async {
    setState(() => _future = _service.getTicket(widget.ticketId));
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ticket Details')),
      body: FutureBuilder<SupportTicketDetail>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: FilledButton(
                onPressed: _reload,
                child: const Text('Retry'),
              ),
            );
          }

          final ticket = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _reload,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              children: <Widget>[
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(ticket.subject, style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 12),
                        Text('Category: ${ticket.category}'),
                        Text('Status: ${ticket.status}'),
                        Text('Priority: ${ticket.priority}'),
                        Text('Created: ${Formatters.dateTime(ticket.createdAt)}'),
                        Text('Updated: ${Formatters.dateTime(ticket.updatedAt)}'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(ticket.description),
                  ),
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      ticket.resolutionNote == null || ticket.resolutionNote!.isEmpty
                          ? 'No resolution note available yet.'
                          : ticket.resolutionNote!,
                    ),
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
