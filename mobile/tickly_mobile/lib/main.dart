import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/ticket_list_screen.dart';

void main() {
  runApp(const TicklyApp());
}

class TicklyApp extends StatelessWidget {
  const TicklyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tickly',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2563EB)),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/tickets': (context) => const TicketListScreen(),
      },
    );
  }
}