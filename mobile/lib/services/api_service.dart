import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Backend URL'ini buradan değiştir
  static const String baseUrl = 'http://localhost:5000/api';
  
  // iOS Simulator için:
  // static const String baseUrl = 'http://127.0.0.1:5000/api';
  
  // Gerçek cihaz için (Mac'inin IP adresi):
  // static const String baseUrl = 'http://192.168.1.100:5000/api';

  String? _token;
  
  // Public getter to check if user is logged in
  bool get hasToken => _token != null && _token!.isNotEmpty;

  // Token'ı yükle
  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  // Token'ı kaydet
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    _token = token;
  }

  // Token'ı sil
  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    _token = null;
  }

  // Header'ları hazırla
  Map<String, String> _getHeaders({bool needsAuth = true}) {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (needsAuth && _token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    
    return headers;
  }

  // GET request
  Future<dynamic> get(String endpoint, {bool needsAuth = true}) async {
    await loadToken();
    
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.get(
      url,
      headers: _getHeaders(needsAuth: needsAuth),
    );

    return _handleResponse(response);
  }

  // POST request
  Future<dynamic> post(
    String endpoint,
    Map<String, dynamic> body, {
    bool needsAuth = true,
  }) async {
    await loadToken();
    
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.post(
      url,
      headers: _getHeaders(needsAuth: needsAuth),
      body: jsonEncode(body),
    );

    return _handleResponse(response);
  }

  // PUT request
  Future<dynamic> put(
    String endpoint,
    Map<String, dynamic> body, {
    bool needsAuth = true,
  }) async {
    await loadToken();
    
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.put(
      url,
      headers: _getHeaders(needsAuth: needsAuth),
      body: jsonEncode(body),
    );

    return _handleResponse(response);
  }

  // DELETE request
  Future<dynamic> delete(String endpoint, {bool needsAuth = true}) async {
    await loadToken();
    
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.delete(
      url,
      headers: _getHeaders(needsAuth: needsAuth),
    );

    return _handleResponse(response);
  }

  // Response işle
  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else {
      throw ApiException(
        statusCode: response.statusCode,
        message: response.body.isNotEmpty 
            ? jsonDecode(response.body)['error'] ?? 'Bir hata oluştu'
            : 'Sunucu hatası',
      );
    }
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;

  ApiException({required this.statusCode, required this.message});

  @override
  String toString() => message;
}
