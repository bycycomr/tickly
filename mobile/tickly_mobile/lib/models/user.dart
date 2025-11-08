class User {
  final String id;
  final String username;
  final String email;
  final String? displayName;
  final String? jobTitle;
  final bool isActive;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.displayName,
    this.jobTitle,
    this.isActive = true,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      displayName: json['displayName'] as String?,
      jobTitle: json['jobTitle'] as String?,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'displayName': displayName,
      'jobTitle': jobTitle,
      'isActive': isActive,
    };
  }
}
