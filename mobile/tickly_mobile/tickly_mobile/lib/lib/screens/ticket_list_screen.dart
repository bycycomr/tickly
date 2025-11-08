import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/ticket_provider.dart';
import '../providers/auth_provider.dart';
import '../models/ticket.dart';

class TicketListScreen extends StatefulWidget {
  const TicketListScreen({super.key});

  @override
  State<TicketListScreen> createState() => _TicketListScreenState();
}

class _TicketListScreenState extends State<TicketListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TicketProvider>(context, listen: false).loadTickets();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Taleplerim'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await Provider.of<AuthProvider>(context, listen: false).logout();
              if (mounted) {
                Navigator.of(context).pushReplacementNamed('/login');
              }
            },
          ),
        ],
      ),
      body: Consumer<TicketProvider>(
        builder: (context, ticketProvider, child) {
          if (ticketProvider.isLoading && ticketProvider.tickets.isEmpty) {
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
                    onPressed: () => ticketProvider.loadTickets(),
                    child: const Text('Tekrar Dene'),
                  ),
                ],
              ),
            );
          }

          if (ticketProvider.tickets.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.inbox_outlined,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Henüz talep yok',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Yeni bir talep oluşturmak için + butonuna tıklayın',
                    style: TextStyle(
                      color: Colors.grey[500],
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => ticketProvider.loadTickets(),
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: ticketProvider.tickets.length,
              itemBuilder: (context, index) {
                final ticket = ticketProvider.tickets[index];
                return _buildTicketCard(context, ticket);
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).pushNamed('/create-ticket');
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildTicketCard(BuildContext context, Ticket ticket) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        title: Text(
          ticket.title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              ticket.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: Colors.grey[700]),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildStatusChip(ticket.status, ticket.statusText),
                const SizedBox(width: 8),
                _buildPriorityChip(ticket.priority, ticket.priorityText),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Oluşturulma: ${_formatDate(ticket.createdAt)}',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {
          Navigator.of(context).pushNamed(
            '/ticket-detail',
            arguments: ticket.id,
          );
        },
      ),
    );
  }

  Widget _buildStatusChip(int status, String text) {
    Color color;
    switch (status) {
      case 0: // Open
        color = Colors.blue;
        break;
      case 1: // InProgress
        color = Colors.orange;
        break;
      case 2: // Resolved
        color = Colors.green;
        break;
      case 3: // Closed
        color = Colors.grey;
        break;
      default:
        color = Colors.grey;
    }

    return Chip(
      label: Text(
        text,
        style: const TextStyle(fontSize: 11),
      ),
      backgroundColor: color.withOpacity(0.2),
      labelStyle: TextStyle(color: color[700]),
      padding: const EdgeInsets.symmetric(horizontal: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  Widget _buildPriorityChip(int priority, String text) {
    Color color;
    switch (priority) {
      case 0: // Low
        color = Colors.green;
        break;
      case 1: // Medium
        color = Colors.blue;
        break;
      case 2: // High
        color = Colors.orange;
        break;
      case 3: // Critical
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

    return Chip(
      label: Text(
        text,
        style: const TextStyle(fontSize: 11),
      ),
      backgroundColor: color.withOpacity(0.2),
      labelStyle: TextStyle(color: color[700]),
      padding: const EdgeInsets.symmetric(horizontal: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}.${date.month}.${date.year}';
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filtrele'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Tüm Talepler'),
              onTap: () {
                Provider.of<TicketProvider>(context, listen: false)
                    .clearFilters();
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('Açık Talepler'),
              onTap: () {
                Provider.of<TicketProvider>(context, listen: false)
                    .setStatusFilter(0);
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('Devam Eden Talepler'),
              onTap: () {
                Provider.of<TicketProvider>(context, listen: false)
                    .setStatusFilter(1);
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('Çözümlenen Talepler'),
              onTap: () {
                Provider.of<TicketProvider>(context, listen: false)
                    .setStatusFilter(2);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}
