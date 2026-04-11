import 'dart:io';

import 'package:flutter/material.dart';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';

import '../../../core/network/api_client.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/url_resolver.dart';
import '../models/document_models.dart';
import '../services/documents_service.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key, required this.apiClient});

  final ApiClient apiClient;

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  late final DocumentsService _service;
  final List<BuyerDocument> _documents = <BuyerDocument>[];

  bool _isLoading = true;
  bool _isLoadingMore = false;
  String? _downloadingDocumentId;
  String? _errorMessage;
  int _page = 1;
  int _total = 0;

  bool get _hasMore => _documents.length < _total;

  @override
  void initState() {
    super.initState();
    _service = DocumentsService(apiClient: widget.apiClient);
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _documents.clear();
      _page = 1;
      _total = 0;
    });

    try {
      final response = await _service.getDocuments(page: 1);
      setState(() {
        _documents.addAll(response.items);
        _total = response.total;
      });
    } catch (_) {
      setState(() => _errorMessage = 'Unable to load documents right now.');
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
      final response = await _service.getDocuments(page: nextPage);
      setState(() {
        _page = nextPage;
        _documents.addAll(response.items);
        _total = response.total;
      });
    } finally {
      if (mounted) {
        setState(() => _isLoadingMore = false);
      }
    }
  }

  Future<void> _openDocument(BuyerDocument document) async {
    if (_downloadingDocumentId != null) {
      return;
    }

    setState(() => _downloadingDocumentId = document.id);

    try {
      final bytes = await widget.apiClient.downloadFile(
        UrlResolver.resolve(document.downloadUrl),
      );
      final directory = await getTemporaryDirectory();
      final file = File('${directory.path}/${_safeFileName(document.fileName)}');
      await file.writeAsBytes(bytes, flush: true);

      final result = await OpenFile.open(file.path);
      if (!mounted) {
        return;
      }

      if (result.type != ResultType.done) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result.message.isNotEmpty ? result.message : 'Unable to open file.')),
        );
      }
    } catch (_) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to download document right now.')),
      );
    } finally {
      if (mounted) {
        setState(() => _downloadingDocumentId = null);
      }
    }
  }

  String _safeFileName(String fileName) {
    final sanitized = fileName.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_').trim();
    if (sanitized.isEmpty) {
      return 'document_${DateTime.now().millisecondsSinceEpoch}';
    }
    return sanitized;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Documents')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: FilledButton(onPressed: _loadInitial, child: const Text('Retry')))
              : RefreshIndicator(
                  onRefresh: _loadInitial,
                  child: ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: _documents.length + 1,
                    itemBuilder: (context, index) {
                      if (index == _documents.length) {
                        if (_documents.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.only(top: 120),
                            child: Center(child: Text('No documents available.')),
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

                      final document = _documents[index];
                      final isDownloading = _downloadingDocumentId == document.id;
                      return Card(
                        child: ListTile(
                          title: Text(document.title),
                          subtitle: Text(
                            '${document.fileName}\n${document.type} • ${Formatters.dateTime(document.uploadedAt)}',
                          ),
                          isThreeLine: true,
                          trailing: isDownloading
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.download_outlined),
                          onTap: isDownloading ? null : () => _openDocument(document),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
