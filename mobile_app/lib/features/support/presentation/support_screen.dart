import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_client.dart';
import '../../../core/utils/formatters.dart';
import '../models/support_models.dart';
import '../services/support_service.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key, required this.apiClient});

  final ApiClient apiClient;

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  late final SupportService _service;
  final List<SupportTicketSummary> _tickets = <SupportTicketSummary>[];

  bool _isLoading = true;
  bool _isLoadingMore = false;
  bool _isCreating = false;
  String? _errorMessage;
  int _page = 1;
  int _total = 0;

  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedCategory = ticketCategories.first;

  bool get _hasMore => _tickets.length < _total;

  @override
  void initState() {
    super.initState();
    _service = SupportService(apiClient: widget.apiClient);
    _loadInitial();
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _tickets.clear();
      _page = 1;
      _total = 0;
    });

    try {
      final response = await _service.getTickets(page: 1);
      setState(() {
        _tickets.addAll(response.items);
        _total = response.total;
      });
    } catch (_) {
      setState(() => _errorMessage = 'Unable to load support tickets right now.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _loadMore() async {
    setState(() => _isLoadingMore = true);
    try {
      final nextPage = _page + 1;
      final response = await _service.getTickets(page: nextPage);
      setState(() {
        _page = nextPage;
        _tickets.addAll(response.items);
        _total = response.total;
      });
    } finally {
      if (mounted) {
        setState(() => _isLoadingMore = false);
      }
    }
  }

  Future<void> _showCreateTicketSheet() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: StatefulBuilder(
            builder: (context, setModalState) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  Text('Create Support Ticket', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _subjectController,
                    decoration: const InputDecoration(labelText: 'Subject'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _selectedCategory,
                    items: ticketCategories
                        .map((category) => DropdownMenuItem<String>(
                              value: category,
                              child: Text(category),
                            ))
                        .toList(),
                    onChanged: (value) {
                      if (value != null) {
                        setModalState(() => _selectedCategory = value);
                      }
                    },
                    decoration: const InputDecoration(labelText: 'Category'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _descriptionController,
                    decoration: const InputDecoration(labelText: 'Description'),
                    minLines: 4,
                    maxLines: 6,
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: _isCreating
                        ? null
                        : () async {
                            if (_subjectController.text.trim().isEmpty ||
                                _descriptionController.text.trim().isEmpty) {
                              return;
                            }

                            setState(() => _isCreating = true);
                            try {
                              await _service.createTicket(
                                subject: _subjectController.text.trim(),
                                category: _selectedCategory,
                                description: _descriptionController.text.trim(),
                              );
                              _subjectController.clear();
                              _descriptionController.clear();
                              if (context.mounted) {
                                Navigator.of(context).pop();
                              }
                              await _loadInitial();
                            } finally {
                              if (mounted) {
                                setState(() => _isCreating = false);
                              }
                            }
                          },
                    child: Text(_isCreating ? 'Submitting...' : 'Submit Ticket'),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Support Tickets')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateTicketSheet,
        icon: const Icon(Icons.add),
        label: const Text('New Ticket'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: FilledButton(onPressed: _loadInitial, child: const Text('Retry')))
              : RefreshIndicator(
                  onRefresh: _loadInitial,
                  child: ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: _tickets.length + 1,
                    itemBuilder: (context, index) {
                      if (index == _tickets.length) {
                        if (_tickets.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.only(top: 120),
                            child: Center(child: Text('No support tickets yet.')),
                          );
                        }
                        return _hasMore
                            ? Padding(
                                padding: const EdgeInsets.symmetric(vertical: 24),
                                child: Center(
                                  child: OutlinedButton(
                                    onPressed: _isLoadingMore ? null : _loadMore,
                                    child: Text(_isLoadingMore ? 'Loading...' : 'Load More'),
                                  ),
                                ),
                              )
                            : const SizedBox(height: 24);
                      }

                      final ticket = _tickets[index];
                      return Card(
                        child: ListTile(
                          title: Text(ticket.subject),
                          subtitle: Text(
                            '${ticket.category} • ${ticket.priority}\nCreated ${Formatters.dateTime(ticket.createdAt)}',
                          ),
                          isThreeLine: true,
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: <Widget>[
                              Text(ticket.status.toUpperCase()),
                              const SizedBox(height: 6),
                              const Icon(Icons.chevron_right),
                            ],
                          ),
                          onTap: () => context.push('/support/${ticket.id}'),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
