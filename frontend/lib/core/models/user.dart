class User {
  const User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String,
        email: json['email'] as String,
        fullName: json['full_name'] as String? ?? json['fullName'] as String? ?? '',
        role: json['role'] as String,
        avatarUrl: json['avatar_url'] as String?,
      );

  final String id;
  final String email;
  final String fullName;
  final String role;
  final String? avatarUrl;
}
