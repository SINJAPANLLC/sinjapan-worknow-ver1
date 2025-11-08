import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'config.dart';

class ApiClient {
  ApiClient(this._config, this._prefs);

  final AppConfig _config;
  final SharedPreferences _prefs;

  static const _tokenKey = 'auth_token';

  String? get token => _prefs.getString(_tokenKey);

  Future<void> setToken(String? value) async {
    if (value == null) {
      await _prefs.remove(_tokenKey);
    } else {
      await _prefs.setString(_tokenKey, value);
    }
  }

  Map<String, String> _headers({Map<String, String>? extra}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    if (extra != null) {
      headers.addAll(extra);
    }
    return headers;
  }

  Uri _uri(String path, [Map<String, dynamic>? query]) {
    final base = Uri.parse(_config.apiBaseUrl);
    return base.replace(
      path: '${base.path}$path',
      queryParameters: query?.map((key, value) => MapEntry(key, '$value')),
    );
  }

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    final response = await http.get(_uri(path, query), headers: _headers());
    return _decode(response);
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Object? body,
    Map<String, dynamic>? query,
  }) async {
    final response = await http.post(
      _uri(path, query),
      headers: _headers(),
      body: body == null ? null : jsonEncode(body),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    Object? body,
    Map<String, dynamic>? query,
  }) async {
    final response = await http.patch(
      _uri(path, query),
      headers: _headers(),
      body: body == null ? null : jsonEncode(body),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    final response = await http.delete(
      _uri(path, query),
      headers: _headers(),
    );
    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    if (kDebugMode) {
      debugPrint('[API] ${response.request?.method} ${response.request?.url} => ${response.statusCode}');
    }
    if (response.body.isEmpty) {
      return {};
    }
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode >= 400) {
      throw ApiException(response.statusCode, data);
    }
    return data is Map<String, dynamic> ? data : {'data': data};
  }
}

class ApiException implements Exception {
  ApiException(this.statusCode, this.body);

  final int statusCode;
  final Object? body;

  @override
  String toString() => 'ApiException(statusCode: $statusCode, body: $body)';
}
