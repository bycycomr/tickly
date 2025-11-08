import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/ticket_provider.dart';
import '../models/comment.dart';

class TicketDetailScreen extends StatefulWidget {
  final int ticketId;

  const TicketDetailScreen({
    super.key,
    required this.ticketId,
  });

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TicketProvider>(context, listen: false)
          .loadTicket(widget.ticketId);
    });
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _addComment() async {
    if (_commentController.text.trim().isEmpty) {
      return;
    }

    final ticketProvider = Provider.of<TicketProvider>(context, listen: false);
    final success = await ticketProvider.addComment(
      widget.ticketId,
      _commentController.text.trim(),
    );

    if (success) {
      _commentController.clear();
      FocusScope.of(context).unfocus();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Yorum eklendi'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ticketProvider.error ?? 'Yorum eklenemedi'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Talep Detayı'),
      ),
      body: Consumer<TicketProvider>(
        builder: (context, ticketProvider, child) {
          if (ticketProvider.isLoading && ticketProvider.selectedTicket == null) {
            return const Center(child: CircularProgressIndicator());
          }

          if (ticketProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Hata: ${ticketProvider.error}',
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => ticketProvider.loadTicket(widget.ticketId),
                    child: const Text('Tekrar Dene'),
                  ),
                ],
              ),
            );
          }

          final ticket = ticketProvider.selectedTicket;
          if (ticket == null) {
            return const Center(child: Text('Talep bulunamadı'));
          }

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Title
                    Text(
                      ticket.title,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Status & Priority
                    Row(
                      children: [
                        _buildStatusChip(ticket.status, ticket.statusText),
                        const SizedBox(width: 8),
                        _buildPriorityChip(ticket.priority, ticket.priorityText),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Info card
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildInfoRow('Departman', ticket.departmentName ?? '-'),
                            _buildInfoRow('Kategori', ticket.categoryName ?? '-'),
                            _buildInfoRow('Atanan', ticket.assignedToDisplayName ?? 'Atanmadı'),
                            _buildInfoRow('Oluşturulma', _formatDateTime(ticket.createdAt)),
                            if (ticket.updatedAt != null)
                              _buildInfoRow('Güncelleme', _formatDateTime(ticket.updatedAt!)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Description
                    const Text(
                      'Açıklama',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Text(ticket.description),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Comments
                    const Text(
                      'Yorumlar',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    
                    if (ticketProvider.comments.isEmpty)
                      const Card(
                        child: Padding(
                          padding: EdgeInsets.all(12),
                          child: Text('Henüz yorum yok'),
                        ),
                      )
                    else
                      ...ticketProvider.comments.map((comment) {
                        return _buildCommentCard(comment);
                      }),
                  ],
                ),
              ),

              // Add comment section
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.3),
                      blurRadius: 4,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _commentController,
                        decoration: const InputDecoration(
                          hintText: 'Yorum ekle...',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: null,
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.send),
                      onPressed: _addComment,
                      color: Theme.of(context).primaryColor,
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  Widget _buildCommentCard(TicketComment comment) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  comment.userName ?? 'Bilinmeyen',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Text(
                  _formatDateTime(comment.createdAt),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(comment.comment),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(int status, String text) {
    Color color;
    switch (status) {
      case 0:
        color = Colors.blue;
        break;
      case 1:
        color = Colors.orange;
        break;
      case 2:
        color = Colors.green;
        break;
      case 3:
        color = Colors.grey;
        break;
      default:
        color = Colors.grey;
    }

    return Chip(
      label: Text(text),
      backgroundColor: color.withOpacity(0.2),
      labelStyle: TextStyle(color: color[700]),
    );
  }

  Widget _buildPriorityChip(int priority, String text) {
    Color color;
    switch (priority) {
      case 0:
        color = Colors.green;
        break;
      case 1:
        color = Colors.blue;
        break;
      case 2:
        color = Colors.orange;
        break;
      case 3:
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

    return Chip(
      label: Text(text),
      backgroundColor: color.withOpacity(0.2),
      labelStyle: TextStyle(color: color[700]),
    );
  }

  String _formatDateTime(DateTime date) {
    return '${date.day}.${date.month}.${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
