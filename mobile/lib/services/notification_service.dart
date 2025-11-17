import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:signalr_netcore/signalr_client.dart';
import 'api_service.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  HubConnection? _ticketHub;
  HubConnection? _notificationHub;
  
  final ApiService _apiService = ApiService();
  bool _isInitialized = false;

  // Notification callbacks
  Function(Map<String, dynamic>)? onTicketUpdated;
  Function(Map<String, dynamic>)? onNewComment;
  Function(Map<String, dynamic>)? onNotificationReceived;

  // Initialize local notifications
  Future<void> initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      settings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        // Handle notification tap
        if (response.payload != null) {
          // Navigate to ticket detail
        }
      },
    );

    _isInitialized = true;
  }

  // Connect to SignalR hubs
  Future<void> connectToHubs() async {
    final token = await _apiService.getToken();
    if (token == null) return;

    final baseUrl = ApiService.baseUrl.replaceAll('/api', '');

    // Ticket Hub
    _ticketHub = HubConnectionBuilder()
        .withUrl('$baseUrl/hubs/ticket', 
          options: HttpConnectionOptions(
            accessTokenFactory: () async => token,
          ),
        )
        .withAutomaticReconnect()
        .build();

    _ticketHub!.on('TicketUpdated', (arguments) {
      final data = arguments?.first as Map<String, dynamic>?;
      if (data != null) {
        _showNotification(
          'Ticket Güncellendi',
          'Ticket #${data['id']} güncellendi',
          payload: 'ticket:${data['id']}',
        );
        onTicketUpdated?.call(data);
      }
    });

    _ticketHub!.on('NewComment', (arguments) {
      final data = arguments?.first as Map<String, dynamic>?;
      if (data != null) {
        _showNotification(
          'Yeni Yorum',
          'Ticket #${data['ticketId']} için yeni yorum',
          payload: 'ticket:${data['ticketId']}',
        );
        onNewComment?.call(data);
      }
    });

    // Notification Hub
    _notificationHub = HubConnectionBuilder()
        .withUrl('$baseUrl/hubs/notification',
          options: HttpConnectionOptions(
            accessTokenFactory: () async => token,
          ),
        )
        .withAutomaticReconnect()
        .build();

    _notificationHub!.on('ReceiveNotification', (arguments) {
      final data = arguments?.first as Map<String, dynamic>?;
      if (data != null) {
        _showNotification(
          data['title'] ?? 'Bildirim',
          data['message'] ?? '',
        );
        onNotificationReceived?.call(data);
      }
    });

    // Start connections
    try {
      await _ticketHub!.start();
      await _notificationHub!.start();
      print('SignalR connections established');
    } catch (e) {
      print('Error connecting to SignalR: $e');
    }
  }

  // Show local notification
  Future<void> _showNotification(String title, String body, {String? payload}) async {
    if (!_isInitialized) return;

    const androidDetails = AndroidNotificationDetails(
      'tickly_channel',
      'Tickly Notifications',
      channelDescription: 'Ticket updates and notifications',
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails();

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      DateTime.now().millisecond,
      title,
      body,
      details,
      payload: payload,
    );
  }

  // Disconnect from hubs
  Future<void> disconnect() async {
    await _ticketHub?.stop();
    await _notificationHub?.stop();
  }

  // Request notification permissions (iOS)
  Future<bool> requestPermissions() async {
    final result = await _notifications
        .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(alert: true, badge: true, sound: true);
    return result ?? false;
  }
}
