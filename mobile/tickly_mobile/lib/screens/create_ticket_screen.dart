import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/ticket_provider.dart';

class CreateTicketScreen extends StatefulWidget {
  const CreateTicketScreen({super.key});

  @override
  State<CreateTicketScreen> createState() => _CreateTicketScreenState();
}

class _CreateTicketScreenState extends State<CreateTicketScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  int? _selectedDepartmentId;
  int? _selectedCategoryId;
  int _selectedPriority = 1; // Medium

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<TicketProvider>(context, listen: false);
      provider.loadDepartments();
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _handleCreate() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedDepartmentId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Lütfen bir departman seçin'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      final ticketProvider = Provider.of<TicketProvider>(context, listen: false);
      
      final success = await ticketProvider.createTicket(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        departmentId: _selectedDepartmentId!,
        categoryId: _selectedCategoryId,
        priority: _selectedPriority,
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Talep başarıyla oluşturuldu'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(ticketProvider.error ?? 'Talep oluşturulamadı'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Yeni Talep'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Title
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Başlık *',
                border: OutlineInputBorder(),
                helperText: 'Talebinizin kısa bir özeti',
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Başlık gerekli';
                }
                if (value.length < 5) {
                  return 'Başlık en az 5 karakter olmalı';
                }
                return null;
              },
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 16),

            // Description
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Açıklama *',
                border: OutlineInputBorder(),
                helperText: 'Probleminizi detaylı olarak açıklayın',
              ),
              maxLines: 5,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Açıklama gerekli';
                }
                if (value.length < 10) {
                  return 'Açıklama en az 10 karakter olmalı';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Department
            Consumer<TicketProvider>(
              builder: (context, ticketProvider, child) {
                if (ticketProvider.departments.isEmpty) {
                  return const Center(child: CircularProgressIndicator());
                }

                return DropdownButtonFormField<int>(
                  value: _selectedDepartmentId,
                  decoration: const InputDecoration(
                    labelText: 'Departman *',
                    border: OutlineInputBorder(),
                  ),
                  items: ticketProvider.departments.map((dept) {
                    return DropdownMenuItem<int>(
                      value: dept.id,
                      child: Text(dept.name),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedDepartmentId = value;
                      _selectedCategoryId = null;
                    });
                    if (value != null) {
                      ticketProvider.loadCategories(departmentId: value);
                    }
                  },
                  validator: (value) {
                    if (value == null) {
                      return 'Departman seçin';
                    }
                    return null;
                  },
                );
              },
            ),
            const SizedBox(height: 16),

            // Category
            Consumer<TicketProvider>(
              builder: (context, ticketProvider, child) {
                if (_selectedDepartmentId == null) {
                  return const SizedBox.shrink();
                }

                if (ticketProvider.categories.isEmpty) {
                  return const Text('Bu departmanda kategori yok');
                }

                return DropdownButtonFormField<int>(
                  value: _selectedCategoryId,
                  decoration: const InputDecoration(
                    labelText: 'Kategori',
                    border: OutlineInputBorder(),
                  ),
                  items: ticketProvider.categories.map((cat) {
                    return DropdownMenuItem<int>(
                      value: cat.id,
                      child: Text(cat.name),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedCategoryId = value;
                    });
                  },
                );
              },
            ),
            const SizedBox(height: 16),

            // Priority
            DropdownButtonFormField<int>(
              value: _selectedPriority,
              decoration: const InputDecoration(
                labelText: 'Öncelik',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 0, child: Text('Düşük')),
                DropdownMenuItem(value: 1, child: Text('Orta')),
                DropdownMenuItem(value: 2, child: Text('Yüksek')),
                DropdownMenuItem(value: 3, child: Text('Kritik')),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedPriority = value ?? 1;
                });
              },
            ),
            const SizedBox(height: 24),

            // Create button
            Consumer<TicketProvider>(
              builder: (context, ticketProvider, child) {
                return ElevatedButton(
                  onPressed: ticketProvider.isLoading ? null : _handleCreate,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: ticketProvider.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Talep Oluştur',
                          style: TextStyle(fontSize: 16),
                        ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
