import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/ticket_provider.dart';
import '../providers/auth_provider.dart';

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
            icon: const Icon(Icons.dashboard),
            onPressed: () => Navigator.pushNamed(context, '/dashboard'),
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

          final tickets = ticketProvider.tickets;

          if (tickets.isEmpty) {
            return const Center(
              child: Text('Henüz talep bulunmamaktadır.'),
            );
          }

          return RefreshIndicator(
            onRefresh: ticketProvider.loadTickets,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: tickets.length,
              itemBuilder: (context, index) {
                final ticket = tickets[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    onTap: () {
                      Navigator.of(context).pushNamed(
                        '/ticket-detail',
                        arguments: ticket.id,
                      );
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '#${ticket.id}',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              Row(
                                children: [
                                  _buildStatusChip(ticket.status),
                                  const SizedBox(width: 8),
                                  _buildPriorityChip(ticket.priority),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            ticket.title,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          if (ticket.description.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              ticket.description,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              if (ticket.departmentName != null) ...[
                                const Icon(Icons.business, size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  ticket.departmentName!,
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                                const SizedBox(width: 16),
                              ],
                              const Icon(Icons.access_time, size: 14),
                              const SizedBox(width: 4),
                              Text(
                                _formatDate(ticket.createdAt),
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
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

  Widget _buildStatusChip(int status) {
    String text;
    Color color;
    switch (status) {
      case 0:
        text = 'Açık';
        color = Colors.blue;
        break;
      case 1:
        text = 'Devam Ediyor';
        color = Colors.orange;
        break;
      case 2:
        text = 'Beklemede';
        color = Colors.purple;
        break;
      case 3:
        text = 'Çözüldü';
        color = Colors.green;
        break;
      case 4:
        text = 'Kapandı';
        color = Colors.grey;
        break;
      default:
        text = 'Bilinmiyor';
        color = Colors.grey;
    }

    return Chip(
      label: Text(text, style: const TextStyle(fontSize: 11)),
      backgroundColor: color.withOpacity(0.2),
      padding: const EdgeInsets.symmetric(horizontal: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  Widget _buildPriorityChip(int priority) {
    String text;
    Color color;
    switch (priority) {
      case 0:
        text = 'Düşük';
        color = Colors.green;
        break;
      case 1:
        text = 'Normal';
        color = Colors.blue;
        break;
      case 2:
        text = 'Yüksek';
        color = Colors.orange;
        break;
      case 3:
        text = 'Acil';
        color = Colors.red;
        break;
      default:
        text = 'Normal';
        color = Colors.blue;
    }

    return Chip(
      label: Text(text, style: const TextStyle(fontSize: 11)),
      backgroundColor: color.withOpacity(0.2),
      padding: const EdgeInsets.symmetric(horizontal: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}.${date.month}.${date.year}';
  }
}
