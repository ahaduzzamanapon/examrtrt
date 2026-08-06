import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../config/app_config.dart';

class AuthProvider extends ChangeNotifier {
  final _storage = const FlutterSecureStorage();

  Map<String, dynamic>? _user;
  String? _token;
  bool _loading = true;

  Map<String, dynamic>? get user    => _user;
  String?               get token   => _token;
  bool                  get loading => _loading;
  bool                  get isLoggedIn => _token != null && _user != null;
  bool get needsOnboarding =>
      isLoggedIn && (_user?['exam_goal'] == null || _user?['exam_goal'] == '');

  // ── Init: load stored token ───────────────────────────────────────────────
  Future<void> init() async {
    _token = await _storage.read(key: 'auth_token');
    final userJson = await _storage.read(key: 'user_data');
    if (userJson != null) {
      _user = jsonDecode(userJson);
    }
    _loading = false;
    notifyListeners();

    if (_token != null) {
      await refreshUser();
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> login(String email, String password) async {
    final dio = _dio();
    final res = await dio.post('/login', data: {
      'email': email, 'password': password,
    });
    await _storeAuth(res.data);
    return res.data;
  }

  // ── Register ──────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    final dio = _dio();
    final res = await dio.post('/register', data: {
      'name': name, 'email': email,
      'password': password, 'password_confirmation': password,
      'phone': phone,
    });
    await _storeAuth(res.data);
    return res.data;
  }

  // ── Google Login ──────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> googleLogin(String idToken) async {
    final dio = _dio();
    final res = await dio.post('/google-login', data: {'id_token': idToken});
    await _storeAuth(res.data);
    return res.data;
  }

  // ── Save Onboarding ───────────────────────────────────────────────────────
  Future<void> saveOnboarding(String examGoal, {String? stream}) async {
    final dio = _dioAuth();
    final res = await dio.post('/onboarding', data: {
      'exam_goal': examGoal, 'stream': stream,
    });
    _user = res.data['user'];
    await _storage.write(key: 'user_data', value: jsonEncode(_user));
    notifyListeners();
  }

  // ── Refresh user ──────────────────────────────────────────────────────────
  Future<void> refreshUser() async {
    try {
      final dio = _dioAuth();
      final res = await dio.get('/user');
      _user = res.data['user'];
      await _storage.write(key: 'user_data', value: jsonEncode(_user));
      notifyListeners();
    } catch (_) {}
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  Future<void> logout() async {
    try {
      await _dioAuth().post('/logout');
    } catch (_) {}
    await _storage.deleteAll();
    _token = null;
    _user  = null;
    notifyListeners();
  }

  // ── Update local user fields ──────────────────────────────────────────────
  void updateUser(Map<String, dynamic> data) {
    _user = {...?_user, ...data};
    _storage.write(key: 'user_data', value: jsonEncode(_user));
    notifyListeners();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  Future<void> _storeAuth(Map<String, dynamic> data) async {
    _token = data['token'];
    _user  = data['user'];
    await _storage.write(key: 'auth_token', value: _token);
    await _storage.write(key: 'user_data',  value: jsonEncode(_user));
    notifyListeners();
  }

  Dio _dio() => Dio(BaseOptions(
    baseUrl: AppConfig.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Accept': 'application/json'},
  ));

  Dio _dioAuth() => Dio(BaseOptions(
    baseUrl: AppConfig.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer $_token',
    },
  ));
}
