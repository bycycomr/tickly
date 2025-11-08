class Category {
  final int id;
  final String name;
  final String? description;
  final int? departmentId;
  final bool isActive;

  Category({
    required this.id,
    required this.name,
    this.description,
    this.departmentId,
    this.isActive = true,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String?,
      departmentId: json['departmentId'] as int?,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'departmentId': departmentId,
      'isActive': isActive,
    };
  }
}
