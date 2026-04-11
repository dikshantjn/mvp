import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../models/api_envelope.dart';
import '../storage/token_storage.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({required TokenStorage tokenStorage})
      : _tokenStorage = tokenStorage,
        _dio = Dio(
          BaseOptions(
            baseUrl: '${AppConfig.apiBaseUrl}/api/v1',
            connectTimeout: AppConfig.connectTimeout,
            receiveTimeout: AppConfig.receiveTimeout,
            headers: <String, String>{
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final tokens = await _tokenStorage.read();
          if (tokens != null && tokens.accessToken.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer ${tokens.accessToken}';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (_shouldAttemptRefresh(error)) {
            try {
              final refreshed = await _refreshTokens();
              if (refreshed != null) {
                final request = error.requestOptions;
                request.headers['Authorization'] = 'Bearer ${refreshed.accessToken}';
                final retryResponse = await _dio.fetch<dynamic>(request);
                return handler.resolve(retryResponse);
              }
            } catch (_) {
              await _tokenStorage.clear();
            }
          }
          handler.next(error);
        },
      ),
    );
  }

  final Dio _dio;
  final TokenStorage _tokenStorage;

  bool _isRefreshing = false;

  bool _shouldAttemptRefresh(DioException error) {
    final path = error.requestOptions.path;
    return error.response?.statusCode == 401 &&
        !_isRefreshing &&
        !path.contains('/auth/refresh') &&
        !path.contains('/auth/request-otp') &&
        !path.contains('/auth/verify-otp');
  }

  Future<SessionTokens?> _refreshTokens() async {
    final tokens = await _tokenStorage.read();
    if (tokens == null || tokens.refreshToken.isEmpty) {
      return null;
    }

    _isRefreshing = true;
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/refresh',
        options: Options(headers: <String, String>{'Authorization': ''}),
        data: <String, dynamic>{'refreshToken': tokens.refreshToken},
      );

      final envelope = ApiEnvelope<SessionTokens>.fromJson(
        response.data ?? const <String, dynamic>{},
        (raw) {
          final json = raw as Map<String, dynamic>;
          return SessionTokens(
            accessToken: json['accessToken'] as String? ?? '',
            refreshToken: json['refreshToken'] as String? ?? '',
            expiresInSeconds: json['expiresInSeconds'] as int? ?? 0,
          );
        },
      );

      await _tokenStorage.save(envelope.data);
      return envelope.data;
    } finally {
      _isRefreshing = false;
    }
  }

  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    required T Function(Object? raw) parser,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        path,
        queryParameters: queryParameters,
      );
      return _parseEnvelope(response.data, parser);
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  Future<T> post<T>(
    String path, {
    Object? data,
    required T Function(Object? raw) parser,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(path, data: data);
      return _parseEnvelope(response.data, parser);
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  Future<Uint8List> downloadFile(String url) async {
    try {
      final response = await _dio.get<List<int>>(
        url,
        options: Options(responseType: ResponseType.bytes),
      );

      return Uint8List.fromList(response.data ?? const <int>[]);
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  T _parseEnvelope<T>(
    Map<String, dynamic>? json,
    T Function(Object? raw) parser,
  ) {
    final payload = json ?? const <String, dynamic>{};
    final success = payload['success'] as bool? ?? false;
    if (!success) {
      final error = payload['error'] as Map<String, dynamic>? ?? const {};
      throw ApiException(
        code: error['code'] as String? ?? 'UNKNOWN_ERROR',
        message: error['message'] as String? ?? 'Request failed',
        details: error['details'],
      );
    }

    return ApiEnvelope<T>.fromJson(payload, parser).data;
  }

  ApiException _mapError(DioException error) {
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final payload = data['error'] as Map<String, dynamic>? ?? const {};
      return ApiException(
        code: payload['code'] as String? ?? 'HTTP_ERROR',
        message: payload['message'] as String? ?? error.message ?? 'Request failed',
        details: payload['details'],
        statusCode: error.response?.statusCode,
      );
    }

    return ApiException(
      code: 'NETWORK_ERROR',
      message: error.message ?? 'Network request failed',
      statusCode: error.response?.statusCode,
    );
  }
}
