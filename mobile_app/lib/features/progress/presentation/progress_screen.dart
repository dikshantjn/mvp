import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../../core/network/api_client.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/url_resolver.dart';
import '../models/progress_models.dart';
import '../services/progress_service.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key, required this.apiClient});

  final ApiClient apiClient;

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  late final ProgressService _service;
  final List<ProgressUpdateItem> _items = <ProgressUpdateItem>[];

  bool _isLoading = true;
  bool _isLoadingMore = false;
  String? _errorMessage;
  int _page = 1;
  int _total = 0;

  bool get _hasMore => _items.length < _total;

  @override
  void initState() {
    super.initState();
    _service = ProgressService(apiClient: widget.apiClient);
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _items.clear();
      _page = 1;
      _total = 0;
    });

    try {
      final response = await _service.getProgressUpdates(page: 1);
      setState(() {
        _items.addAll(response.items);
        _total = response.total;
      });
    } catch (_) {
      setState(() => _errorMessage = 'Unable to load progress updates right now.');
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
      final response = await _service.getProgressUpdates(page: nextPage);
      setState(() {
        _page = nextPage;
        _items.addAll(response.items);
        _total = response.total;
      });
    } finally {
      if (mounted) {
        setState(() => _isLoadingMore = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Progress Updates')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: FilledButton(onPressed: _loadInitial, child: const Text('Retry')))
              : RefreshIndicator(
                  onRefresh: _loadInitial,
                  child: ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: _items.length + 1,
                    itemBuilder: (context, index) {
                      if (index == _items.length) {
                        if (_items.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.only(top: 120),
                            child: Center(child: Text('No progress updates available.')),
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

                      final item = _items[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        clipBehavior: Clip.antiAlias,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            if (item.imageUrl != null)
                              _AuthenticatedProgressImage(
                                apiClient: widget.apiClient,
                                imageUrl: UrlResolver.resolve(item.imageUrl!),
                                height: 180,
                                width: double.infinity,
                              ),
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  Text(item.title, style: Theme.of(context).textTheme.titleMedium),
                                  const SizedBox(height: 8),
                                  Text(item.description),
                                  const SizedBox(height: 8),
                                  Text(Formatters.dateTime(item.publishedAt)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}

class _AuthenticatedProgressImage extends StatefulWidget {
  const _AuthenticatedProgressImage({
    required this.apiClient,
    required this.imageUrl,
    required this.height,
    required this.width,
  });

  final ApiClient apiClient;
  final String imageUrl;
  final double height;
  final double width;

  @override
  State<_AuthenticatedProgressImage> createState() => _AuthenticatedProgressImageState();
}

class _AuthenticatedProgressImageState extends State<_AuthenticatedProgressImage> {
  late Future<Uint8List> _imageFuture;

  @override
  void initState() {
    super.initState();
    _imageFuture = widget.apiClient.downloadFile(widget.imageUrl);
  }

  @override
  void didUpdateWidget(covariant _AuthenticatedProgressImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.imageUrl != widget.imageUrl) {
      _imageFuture = widget.apiClient.downloadFile(widget.imageUrl);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Uint8List>(
      future: _imageFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return SizedBox(
            height: widget.height,
            width: widget.width,
            child: const Center(child: CircularProgressIndicator()),
          );
        }

        if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return const SizedBox.shrink();
        }

        return Image.memory(
          snapshot.data!,
          height: widget.height,
          width: widget.width,
          fit: BoxFit.cover,
          gaplessPlayback: true,
        );
      },
    );
  }
}
