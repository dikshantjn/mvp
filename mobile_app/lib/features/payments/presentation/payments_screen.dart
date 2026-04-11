import 'package:flutter/material.dart';

import '../../../core/network/api_client.dart';
import '../../../core/utils/formatters.dart';
import '../models/payment_models.dart';
import '../services/payments_service.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key, required this.apiClient});

  final ApiClient apiClient;

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  late final PaymentsService _service;

  bool _isLoading = true;
  bool _isLoadingMoreHistory = false;
  bool _isLoadingMoreSchedule = false;
  String? _errorMessage;

  final List<PaymentHistoryItem> _history = <PaymentHistoryItem>[];
  final List<PaymentScheduleItem> _schedule = <PaymentScheduleItem>[];
  int _historyPage = 1;
  int _schedulePage = 1;
  int _historyTotal = 0;
  int _scheduleTotal = 0;

  bool get _historyHasMore => _history.length < _historyTotal;
  bool get _scheduleHasMore => _schedule.length < _scheduleTotal;

  @override
  void initState() {
    super.initState();
    _service = PaymentsService(apiClient: widget.apiClient);
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _history.clear();
      _schedule.clear();
      _historyPage = 1;
      _schedulePage = 1;
      _historyTotal = 0;
      _scheduleTotal = 0;
    });

    try {
      final history = await _service.getPaymentHistory(page: 1);
      final schedule = await _service.getPaymentSchedule(page: 1);
      setState(() {
        _history.addAll(history.items);
        _historyTotal = history.total;
        _schedule.addAll(schedule.items);
        _scheduleTotal = schedule.total;
      });
    } catch (_) {
      setState(() => _errorMessage = 'Unable to load payments right now.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _loadMoreHistory() async {
    setState(() => _isLoadingMoreHistory = true);
    try {
      final nextPage = _historyPage + 1;
      final response = await _service.getPaymentHistory(page: nextPage);
      setState(() {
        _historyPage = nextPage;
        _history.addAll(response.items);
        _historyTotal = response.total;
      });
    } finally {
      if (mounted) {
        setState(() => _isLoadingMoreHistory = false);
      }
    }
  }

  Future<void> _loadMoreSchedule() async {
    setState(() => _isLoadingMoreSchedule = true);
    try {
      final nextPage = _schedulePage + 1;
      final response = await _service.getPaymentSchedule(page: nextPage);
      setState(() {
        _schedulePage = nextPage;
        _schedule.addAll(response.items);
        _scheduleTotal = response.total;
      });
    } finally {
      if (mounted) {
        setState(() => _isLoadingMoreSchedule = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Payments'),
          bottom: const TabBar(
            tabs: <Widget>[
              Tab(text: 'History'),
              Tab(text: 'Schedule'),
            ],
          ),
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _errorMessage != null
                ? Center(
                    child: FilledButton(
                      onPressed: _loadInitial,
                      child: const Text('Retry'),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _loadInitial,
                    child: TabBarView(
                      children: <Widget>[
                        _PaymentsList<PaymentHistoryItem>(
                          items: _history,
                          emptyText: 'No payment history available.',
                          itemBuilder: (item) => ListTile(
                            title: Text(item.title),
                            subtitle: Text(
                              'Due: ${Formatters.date(item.dueDate)}'
                              '${item.paidDate != null ? '\nPaid: ${Formatters.date(item.paidDate)}' : ''}'
                              '${item.referenceNumber != null ? '\nRef: ${item.referenceNumber}' : ''}',
                            ),
                            isThreeLine: true,
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: <Widget>[
                                Text(Formatters.currency(item.amount)),
                                const SizedBox(height: 4),
                                Text(item.status.toUpperCase()),
                              ],
                            ),
                          ),
                          hasMore: _historyHasMore,
                          onLoadMore: _loadMoreHistory,
                          loadingMore: _isLoadingMoreHistory,
                        ),
                        _PaymentsList<PaymentScheduleItem>(
                          items: _schedule,
                          emptyText: 'No scheduled payments available.',
                          itemBuilder: (item) => ListTile(
                            title: Text(item.title),
                            subtitle: Text('Due: ${Formatters.date(item.dueDate)}'),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: <Widget>[
                                Text(Formatters.currency(item.amount)),
                                const SizedBox(height: 4),
                                Text(item.status.toUpperCase()),
                              ],
                            ),
                          ),
                          hasMore: _scheduleHasMore,
                          onLoadMore: _loadMoreSchedule,
                          loadingMore: _isLoadingMoreSchedule,
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }
}

class _PaymentsList<T> extends StatelessWidget {
  const _PaymentsList({
    required this.items,
    required this.emptyText,
    required this.itemBuilder,
    required this.hasMore,
    required this.onLoadMore,
    required this.loadingMore,
  });

  final List<T> items;
  final String emptyText;
  final Widget Function(T item) itemBuilder;
  final bool hasMore;
  final Future<void> Function() onLoadMore;
  final bool loadingMore;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: <Widget>[
          const SizedBox(height: 120),
          Center(child: Text(emptyText)),
        ],
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length + 1,
      itemBuilder: (context, index) {
        if (index == items.length) {
          return hasMore
              ? Padding(
                  padding: const EdgeInsets.only(top: 12, bottom: 24),
                  child: Center(
                    child: OutlinedButton(
                      onPressed: loadingMore ? null : onLoadMore,
                      child: Text(loadingMore ? 'Loading...' : 'Load More'),
                    ),
                  ),
                )
              : const SizedBox(height: 24);
        }

        return Card(child: itemBuilder(items[index]));
      },
    );
  }
}
