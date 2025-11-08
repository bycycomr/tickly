import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _apiService = ApiService();

  // Login
  Future<User> login(String username, String password) async {
    final response = await _apiService.post(
      '/auth/login',
      {
        'username': username,
        'password': password,
      },
      needsAuth: false,
    );

    // Token'ı kaydet
    final token = response['token'] as String;
    await _apiService.saveToken(token);

    // User bilgisini döndür
    return User.fromJson(response['user'] as Map<String, dynamic>);
  }

  // Get current user
  Future<User> getCurrentUser() async {
    final response = await _apiService.get('/auth/me');
    return User.fromJson(response as Map<String, dynamic>);
  }

  // Logout
  Future<void> logout() async {
    await _apiService.clearToken();
  }

  // Check if logged in
  Future<bool> isLoggedIn() async {
    await _apiService.loadToken();
    return _apiService.hasToken;
  }
}
