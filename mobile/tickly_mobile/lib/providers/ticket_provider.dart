import 'package:flutter/foundation.dart';
import '../models/ticket.dart';
import '../models/comment.dart';
import '../models/department.dart';
import '../models/category.dart';
import '../services/ticket_service.dart';
import '../services/data_service.dart';

class TicketProvider with ChangeNotifier {
  final TicketService _ticketService = TicketService();
  final DataService _dataService = DataService();

  List<Ticket> _tickets = [];
  Ticket? _selectedTicket;
  List<TicketComment> _comments = [];
  List<Department> _departments = [];
  List<Category> _categories = [];
  
  bool _isLoading = false;
  String? _error;

  // Filters
  int? _statusFilter;
  int? _priorityFilter;
  int? _departmentFilter;

  // Getters
  List<Ticket> get tickets => _tickets;
  Ticket? get selectedTicket => _selectedTicket;
  List<TicketComment> get comments => _comments;
  List<Department> get departments => _departments;
  List<Category> get categories => _categories;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load tickets
  Future<void> loadTickets() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _tickets = await _ticketService.getTickets(
        status: _statusFilter,
        priority: _priorityFilter,
        departmentId: _departmentFilter,
      );

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load ticket detail
  Future<void> loadTicket(int id) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _selectedTicket = await _ticketService.getTicket(id);
      _comments = await _ticketService.getComments(id);

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create ticket
  Future<bool> createTicket({
    required String title,
    required String description,
    required int departmentId,
    int? categoryId,
    int priority = 1,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final newTicket = await _ticketService.createTicket(
        title: title,
        description: description,
        departmentId: departmentId,
        categoryId: categoryId,
        priority: priority,
      );

      _tickets.insert(0, newTicket);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Add comment
  Future<bool> addComment(int ticketId, String comment) async {
    try {
      await _ticketService.addComment(ticketId, comment);
      
      // Reload ticket to get updated comments
      await loadTicket(ticketId);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Close ticket
  Future<bool> closeTicket(int ticketId) async {
    try {
      await _ticketService.closeTicket(ticketId);
      
      // Reload ticket
      await loadTicket(ticketId);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Load departments
  Future<void> loadDepartments() async {
    try {
      _departments = await _dataService.getDepartments();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Load categories
  Future<void> loadCategories({int? departmentId}) async {
    try {
      _categories = await _dataService.getCategories(departmentId: departmentId);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Set filters
  void setStatusFilter(int? status) {
    _statusFilter = status;
    loadTickets();
  }

  void setPriorityFilter(int? priority) {
    _priorityFilter = priority;
    loadTickets();
  }

  void setDepartmentFilter(int? departmentId) {
    _departmentFilter = departmentId;
    loadTickets();
  }

  // Clear filters
  void clearFilters() {
    _statusFilter = null;
    _priorityFilter = null;
    _departmentFilter = null;
    loadTickets();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
