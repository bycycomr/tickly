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
        title: const Text(
          'Taleplerim',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.dashboard_rounded,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            onPressed: () => Navigator.pushNamed(context, '/dashboard'),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.logout_rounded,
                color: Theme.of(context).colorScheme.error,
              ),
            ),
            onPressed: () async {
              await Provider.of<AuthProvider>(context, listen: false).logout();
              if (mounted) {
                Navigator.of(context).pushReplacementNamed('/login');
              }
            },
          ),
          const SizedBox(width: 8),
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
            color: Theme.of(context).colorScheme.primary,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: tickets.length,
              itemBuilder: (context, index) {
                final ticket = tickets[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Theme.of(context).cardTheme.color ?? Colors.white,
                        Theme.of(context).cardTheme.color ?? Colors.white,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: Theme.of(context)
                          .colorScheme
                          .primary
                          .withOpacity(0.1),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Theme.of(context)
                            .colorScheme
                            .primary
                            .withOpacity(0.08),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        Navigator.of(context).pushNamed(
                          '/ticket-detail',
                          arguments: ticket.id,
                        );
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Theme.of(context)
                                        .colorScheme
                                        .primary
                                        .withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '#${ticket.id}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                    ),
                                  ),
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
                            const SizedBox(height: 12),
                            Text(
                              ticket.title,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 16,
                                  ),
                            ),
                            if (ticket.description.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text(
                                ticket.description,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onSurface
                                          .withOpacity(0.6),
                                    ),
                              ),
                            ],
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                if (ticket.departmentName != null) ...[
                                  Icon(
                                    Icons.business_rounded,
                                    size: 16,
                                    color:
                                        Theme.of(context).colorScheme.secondary,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    ticket.departmentName!,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          fontWeight: FontWeight.w500,
                                          color: Theme.of(context)
                                              .colorScheme
                                              .secondary,
                                        ),
                                  ),
                                  const SizedBox(width: 16),
                                ],
                                Icon(
                                  Icons.access_time_rounded,
                                  size: 16,
                                  color: Theme.of(context)
                                      .colorScheme
                                      .onSurface
                                      .withOpacity(0.5),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  _formatDate(ticket.createdAt),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .onSurface
                                            .withOpacity(0.5),
                                      ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).pushNamed('/create-ticket');
        },
        icon: const Icon(Icons.add_rounded),
        label: const Text(
          'Yeni Talep',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  Widget _buildStatusChip(int status) {
    String text;
    Color lightColor;
    Color darkColor;
    IconData icon;

    switch (status) {
      case 0:
        text = 'Açık';
        lightColor = const Color(0xFF3B82F6); // Blue
        darkColor = const Color(0xFF60A5FA);
        icon = Icons.circle_outlined;
        break;
      case 1:
        text = 'Devam Ediyor';
        lightColor = const Color(0xFFF59E0B); // Amber
        darkColor = const Color(0xFFFBBF24);
        icon = Icons.pending_outlined;
        break;
      case 2:
        text = 'Beklemede';
        lightColor = const Color(0xFF8B5CF6); // Purple
        darkColor = const Color(0xFFA78BFA);
        icon = Icons.pause_circle_outline;
        break;
      case 3:
        text = 'Çözüldü';
        lightColor = const Color(0xFF10B981); // Green
        darkColor = const Color(0xFF34D399);
        icon = Icons.check_circle_outline;
        break;
      case 4:
        text = 'Kapandı';
        lightColor = const Color(0xFF6B7280); // Gray
        darkColor = const Color(0xFF9CA3AF);
        icon = Icons.cancel_outlined;
        break;
      default:
        text = 'Bilinmiyor';
        lightColor = const Color(0xFF6B7280);
        darkColor = const Color(0xFF9CA3AF);
        icon = Icons.help_outline;
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = isDark ? darkColor : lightColor;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriorityChip(int priority) {
    String text;
    Color lightColor;
    Color darkColor;
    IconData icon;

    switch (priority) {
      case 0:
        text = 'Düşük';
        lightColor = const Color(0xFF10B981); // Green
        darkColor = const Color(0xFF34D399);
        icon = Icons.arrow_downward_rounded;
        break;
      case 1:
        text = 'Normal';
        lightColor = const Color(0xFF3B82F6); // Blue
        darkColor = const Color(0xFF60A5FA);
        icon = Icons.remove_rounded;
        break;
      case 2:
        text = 'Yüksek';
        lightColor = const Color(0xFFF59E0B); // Amber
        darkColor = const Color(0xFFFBBF24);
        icon = Icons.arrow_upward_rounded;
        break;
      case 3:
        text = 'Acil';
        lightColor = const Color(0xFFEF4444); // Red
        darkColor = const Color(0xFFF87171);
        icon = Icons.priority_high_rounded;
        break;
      default:
        text = 'Normal';
        lightColor = const Color(0xFF3B82F6);
        darkColor = const Color(0xFF60A5FA);
        icon = Icons.remove_rounded;
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = isDark ? darkColor : lightColor;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}.${date.month}.${date.year}';
  }
}
