import '../models/department.dart';
import '../models/category.dart';
import 'api_service.dart';

class DataService {
  final ApiService _apiService = ApiService();

  // Get all departments
  Future<List<Department>> getDepartments() async {
    final response = await _apiService.get('/departments');
    final List<dynamic> departmentsJson = response as List<dynamic>;
    
    return departmentsJson
        .map((json) => Department.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  // Get categories by department
  Future<List<Category>> getCategories({int? departmentId}) async {
    String endpoint = '/categories';
    if (departmentId != null) {
      endpoint += '?departmentId=$departmentId';
    }

    final response = await _apiService.get(endpoint);
    final List<dynamic> categoriesJson = response as List<dynamic>;
    
    return categoriesJson
        .map((json) => Category.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
