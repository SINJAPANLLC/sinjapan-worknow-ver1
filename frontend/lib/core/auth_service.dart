import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'models/user.dart';
import 'providers.dart';

class AuthRepository {
  AuthRepository(this._client, this._prefs);

  final ApiClient _client;
  final SharedPreferences _prefs;

  static const _refreshTokenKey = 'refresh_token';

  Future<User?> login(String email, String password) async {
    final result = await _client.post('/auth/login', body: {
      'email': email,
      'password': password,
    });
    await _persistTokens(result);
    return await fetchCurrentUser();
  }

  Future<User?> register(String email, String password, String fullName, String role) async {
    final result = await _client.post('/auth/register', body: {
      'email': email,
      'password': password,
      'full_name': fullName,
      'role': role,
    });
    await _persistTokens(result);
    return await fetchCurrentUser();
  }

  Future<User?> refresh() async {
    final refreshToken = _prefs.getString(_refreshTokenKey);
    if (refreshToken == null) return null;
    final result = await _client.post('/auth/refresh', body: {
      'refresh_token': refreshToken,
    });
    await _persistTokens(result);
    return await fetchCurrentUser();
  }

  Future<void> logout() async {
    await _client.setToken(null);
    await _prefs.remove(_refreshTokenKey);
  }

  Future<User?> fetchCurrentUser() async {
    try {
      final result = await _client.get('/auth/me');
      return User.fromJson(result);
    } catch (_) {
      return null;
    }
  }

  Future<void> _persistTokens(Map<String, dynamic> response) async {
    final accessToken = response['access_token'] as String?;
    final refreshToken = response['refresh_token'] as String?;
    if (accessToken != null) {
      await _client.setToken(accessToken);
    }
    if (refreshToken != null) {
      await _prefs.setString(_refreshTokenKey, refreshToken);
    }
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  final prefs = ref.watch(sharedPreferencesProvider);
  return AuthRepository(client, prefs);
});

final currentUserProvider = StateNotifierProvider<AuthController, AsyncValue<User?>>((ref) {
  return AuthController(ref.watch(authRepositoryProvider))..load();
});

class AuthController extends StateNotifier<AsyncValue<User?>> {
  AuthController(this._repository) : super(const AsyncValue.loading());

  final AuthRepository _repository;

  Future<void> load() async {
    try {
      final user = await _repository.fetchCurrentUser();
      state = AsyncValue.data(user);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final user = await _repository.login(email, password);
      state = AsyncValue.data(user);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }

  Future<void> register(String email, String password, String fullName, String role) async {
    state = const AsyncValue.loading();
    try {
      final user = await _repository.register(email, password, fullName, role);
      state = AsyncValue.data(user);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AsyncValue.data(null);
  }
}
