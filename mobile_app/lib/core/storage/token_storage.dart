import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SessionTokens {
  const SessionTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresInSeconds,
  });

  final String accessToken;
  final String refreshToken;
  final int expiresInSeconds;

  Map<String, String> toStorageMap() {
    return <String, String>{
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'expiresInSeconds': expiresInSeconds.toString(),
    };
  }

  factory SessionTokens.fromStorageMap(Map<String, String> values) {
    return SessionTokens(
      accessToken: values['accessToken'] ?? '',
      refreshToken: values['refreshToken'] ?? '',
      expiresInSeconds: int.tryParse(values['expiresInSeconds'] ?? '') ?? 0,
    );
  }
}

class TokenStorage {
  TokenStorage() : _storage = const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  Future<void> save(SessionTokens tokens) async {
    final values = tokens.toStorageMap();
    for (final entry in values.entries) {
      await _storage.write(key: entry.key, value: entry.value);
    }
  }

  Future<SessionTokens?> read() async {
    final accessToken = await _storage.read(key: 'accessToken');
    final refreshToken = await _storage.read(key: 'refreshToken');
    final expiresInSeconds = await _storage.read(key: 'expiresInSeconds');

    if (accessToken == null || refreshToken == null || expiresInSeconds == null) {
      return null;
    }

    return SessionTokens.fromStorageMap(
      <String, String>{
        'accessToken': accessToken,
        'refreshToken': refreshToken,
        'expiresInSeconds': expiresInSeconds,
      },
    );
  }

  Future<void> clear() async {
    await _storage.deleteAll();
  }
}
