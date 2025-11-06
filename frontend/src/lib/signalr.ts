import * as signalR from '@microsoft/signalr';

class SignalRService {
  private ticketConnection: signalR.HubConnection | null = null;
  private notificationConnection: signalR.HubConnection | null = null;

  // Initialize connections
  async initializeConnections(token: string) {
    await this.initializeTicketHub(token);
    await this.initializeNotificationHub(token);
  }

  // Ticket Hub
  private async initializeTicketHub(token: string) {
    this.ticketConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/ticket', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.ticketConnection.start();
      console.log('✅ TicketHub connected');
    } catch (err) {
      console.error('❌ TicketHub connection failed:', err);
    }
  }

  // Notification Hub
  private async initializeNotificationHub(token: string) {
    this.notificationConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/notification', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.notificationConnection.start();
      console.log('✅ NotificationHub connected');
    } catch (err) {
      console.error('❌ NotificationHub connection failed:', err);
    }
  }

  // Ticket Hub Methods
  async joinTicket(ticketId: string) {
    if (this.ticketConnection?.state === signalR.HubConnectionState.Connected) {
      await this.ticketConnection.invoke('JoinTicket', ticketId);
      console.log(`Joined ticket ${ticketId}`);
    }
  }

  async leaveTicket(ticketId: string) {
    if (this.ticketConnection?.state === signalR.HubConnectionState.Connected) {
      await this.ticketConnection.invoke('LeaveTicket', ticketId);
      console.log(`Left ticket ${ticketId}`);
    }
  }

  async sendComment(ticketId: string, message: string, isInternal: boolean) {
    if (this.ticketConnection?.state === signalR.HubConnectionState.Connected) {
      await this.ticketConnection.invoke('SendComment', ticketId, message, isInternal);
    }
  }

  async userTyping(ticketId: string) {
    if (this.ticketConnection?.state === signalR.HubConnectionState.Connected) {
      await this.ticketConnection.invoke('UserTyping', ticketId);
    }
  }

  // Register handlers
  onReceiveComment(handler: (data: any) => void) {
    this.ticketConnection?.on('ReceiveComment', handler);
  }

  onUserTyping(handler: (data: any) => void) {
    this.ticketConnection?.on('UserTyping', handler);
  }

  onTicketStatusChanged(handler: (data: any) => void) {
    this.notificationConnection?.on('TicketStatusChanged', handler);
  }

  onTicketAssigned(handler: (data: any) => void) {
    this.notificationConnection?.on('TicketAssigned', handler);
  }

  onCommentAdded(handler: (data: any) => void) {
    this.notificationConnection?.on('CommentAdded', handler);
  }

  onSLAViolation(handler: (data: any) => void) {
    this.notificationConnection?.on('SLAViolation', handler);
  }

  // Disconnect
  async disconnect() {
    if (this.ticketConnection) {
      await this.ticketConnection.stop();
      console.log('TicketHub disconnected');
    }
    if (this.notificationConnection) {
      await this.notificationConnection.stop();
      console.log('NotificationHub disconnected');
    }
  }

  // Get connection state
  get isConnected() {
    return (
      this.ticketConnection?.state === signalR.HubConnectionState.Connected &&
      this.notificationConnection?.state === signalR.HubConnectionState.Connected
    );
  }
}

export const signalRService = new SignalRService();
export default signalRService;
