class Ticket {
  final int id;
  final String title;
  final String description;
  final int status; // 0=Open, 1=InProgress, 2=Resolved, 3=Closed
  final int priority; // 0=Low, 1=Medium, 2=High, 3=Critical
  final String creatorId;
  final String? assignedToId;
  final int departmentId;
  final int? categoryId;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? resolvedAt;

  // Additional fields for display
  final String? creatorName;
  final String? assignedToName;
  final String? departmentName;
  final String? categoryName;

  Ticket({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.priority,
    required this.creatorId,
    this.assignedToId,
    required this.departmentId,
    this.categoryId,
    required this.createdAt,
    this.updatedAt,
    this.resolvedAt,
    this.creatorName,
    this.assignedToName,
    this.departmentName,
    this.categoryName,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String,
      status: json['status'] as int,
      priority: json['priority'] as int,
      creatorId: json['creatorId'] as String,
      assignedToId: json['assignedToId'] as String?,
      departmentId: json['departmentId'] as int,
      categoryId: json['categoryId'] as int?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
      resolvedAt: json['resolvedAt'] != null
          ? DateTime.parse(json['resolvedAt'] as String)
          : null,
      creatorName: json['creatorName'] as String?,
      assignedToName: json['assignedToName'] as String?,
      departmentName: json['departmentName'] as String?,
      categoryName: json['categoryName'] as String?,
    );
  }

  String get statusText {
    switch (status) {
      case 0: return 'Açık';
      case 1: return 'Devam Ediyor';
      case 2: return 'Çözüldü';
      case 3: return 'Kapatıldı';
      case 4: return 'İptal';
      default: return 'Bilinmeyen';
    }
  }

  String get priorityText {
    switch (priority) {
      case 0: return 'Düşük';
      case 1: return 'Orta';
      case 2: return 'Yüksek';
      case 3: return 'Kritik';
      default: return 'Bilinmeyen';
    }
  }
}
