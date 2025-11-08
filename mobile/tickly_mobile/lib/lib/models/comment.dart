class TicketComment {
  final int id;
  final int ticketId;
  final String userId;
  final String comment;
  final DateTime createdAt;
  final String? userName;
  final bool isInternal;

  TicketComment({
    required this.id,
    required this.ticketId,
    required this.userId,
    required this.comment,
    required this.createdAt,
    this.userName,
    this.isInternal = false,
  });

  factory TicketComment.fromJson(Map<String, dynamic> json) {
    return TicketComment(
      id: json['id'] as int,
      ticketId: json['ticketId'] as int,
      userId: json['userId'] as String,
      comment: json['comment'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      userName: json['userName'] as String?,
      isInternal: json['isInternal'] as bool? ?? false,
    );
  }
}
