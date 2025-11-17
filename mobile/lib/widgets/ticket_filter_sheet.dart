import 'package:flutter/material.dart';
import '../models/department.dart';

class TicketFilterSheet extends StatefulWidget {
  final int? currentStatus;
  final int? currentPriority;
  final int? currentDepartment;
  final List<Department> departments;
  final Function(int?, int?, int?) onApply;

  const TicketFilterSheet({
    super.key,
    this.currentStatus,
    this.currentPriority,
    this.currentDepartment,
    required this.departments,
    required this.onApply,
  });

  @override
  State<TicketFilterSheet> createState() => _TicketFilterSheetState();
}

class _TicketFilterSheetState extends State<TicketFilterSheet> {
  int? _status;
  int? _priority;
  int? _department;

  @override
  void initState() {
    super.initState();
    _status = widget.currentStatus;
    _priority = widget.currentPriority;
    _department = widget.currentDepartment;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Filtrele',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Status filter
          Text(
            'Durum',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              _buildFilterChip('Tümü', null, _status, (val) => setState(() => _status = val)),
              _buildFilterChip('Açık', 0, _status, (val) => setState(() => _status = val)),
              _buildFilterChip('Devam Ediyor', 1, _status, (val) => setState(() => _status = val)),
              _buildFilterChip('Beklemede', 2, _status, (val) => setState(() => _status = val)),
              _buildFilterChip('Çözüldü', 3, _status, (val) => setState(() => _status = val)),
              _buildFilterChip('Kapandı', 4, _status, (val) => setState(() => _status = val)),
            ],
          ),
          const SizedBox(height: 24),
          
          // Priority filter
          Text(
            'Öncelik',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              _buildFilterChip('Tümü', null, _priority, (val) => setState(() => _priority = val)),
              _buildFilterChip('Düşük', 0, _priority, (val) => setState(() => _priority = val)),
              _buildFilterChip('Normal', 1, _priority, (val) => setState(() => _priority = val)),
              _buildFilterChip('Yüksek', 2, _priority, (val) => setState(() => _priority = val)),
              _buildFilterChip('Acil', 3, _priority, (val) => setState(() => _priority = val)),
            ],
          ),
          const SizedBox(height: 24),
          
          // Department filter
          if (widget.departments.isNotEmpty) ...[
            Text(
              'Departman',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _buildFilterChip('Tümü', null, _department, (val) => setState(() => _department = val)),
                ...widget.departments.map((dept) => 
                  _buildFilterChip(dept.name, dept.id, _department, (val) => setState(() => _department = val))
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
          
          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    setState(() {
                      _status = null;
                      _priority = null;
                      _department = null;
                    });
                    widget.onApply(null, null, null);
                    Navigator.pop(context);
                  },
                  child: const Text('Temizle'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    widget.onApply(_status, _priority, _department);
                    Navigator.pop(context);
                  },
                  child: const Text('Uygula'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, int? value, int? currentValue, Function(int?) onSelected) {
    final isSelected = value == currentValue;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => onSelected(value),
      backgroundColor: isSelected ? Theme.of(context).colorScheme.primaryContainer : null,
      checkmarkColor: Theme.of(context).colorScheme.onPrimaryContainer,
    );
  }
}
