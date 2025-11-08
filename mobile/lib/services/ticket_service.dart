import '../models/ticket.dart';
import '../models/comment.dart';
import 'api_service.dart';

class TicketService {
  final ApiService _apiService = ApiService();

  // Get all tickets
  Future<List<Ticket>> getTickets({
    int? status,
    int? priority,
    int? departmentId,
  }) async {
    String endpoint = '/tickets?';
    
    if (status != null) endpoint += 'status=$status&';
    if (priority != null) endpoint += 'priority=$priority&';
    if (departmentId != null) endpoint += 'departmentId=$departmentId&';

    final response = await _apiService.get(endpoint);
    final List<dynamic> ticketsJson = response as List<dynamic>;
    
    return ticketsJson
        .map((json) => Ticket.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  // Get ticket by ID
  Future<Ticket> getTicket(int id) async {
    final response = await _apiService.get('/tickets/$id');
    return Ticket.fromJson(response as Map<String, dynamic>);
  }

  // Create ticket
  Future<Ticket> createTicket({
    required String title,
    required String description,
    required int departmentId,
    int? categoryId,
    int priority = 1, // Default: Medium
  }) async {
    final response = await _apiService.post('/tickets', {
      'title': title,
      'description': description,
      'departmentId': departmentId,
      'categoryId': categoryId,
      'priority': priority,
    });

    return Ticket.fromJson(response as Map<String, dynamic>);
  }

  // Get ticket comments
  Future<List<TicketComment>> getComments(int ticketId) async {
    final response = await _apiService.get('/tickets/$ticketId');
    final ticket = response as Map<String, dynamic>;
    
    if (ticket['events'] != null) {
      final List<dynamic> events = ticket['events'] as List<dynamic>;
      return events
          .where((e) => e['eventType'] == 0) // 0 = Comment
          .map((json) => TicketComment.fromJson(json as Map<String, dynamic>))
          .toList();
    }
    
    return [];
  }

  // Add comment
  Future<void> addComment(int ticketId, String comment) async {
    await _apiService.post('/tickets/$ticketId/comments', {
      'comment': comment,
    });
  }

  // Update ticket status
  Future<void> updateStatus(int ticketId, int status) async {
    await _apiService.put('/tickets/$ticketId/status', {
      'status': status,
    });
  }

  // Close ticket
  Future<void> closeTicket(int ticketId) async {
    await _apiService.post('/tickets/$ticketId/close', {});
  }
}
