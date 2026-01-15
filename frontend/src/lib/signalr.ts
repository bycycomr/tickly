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
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 60s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          if (retryContext.previousRetryCount === 3) return 30000;
          return 60000; // Max 60 seconds
        }
      })
      .configureLogging(import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning)
      .build();

    // Reconnection handlers
    this.ticketConnection.onreconnecting((error) => {
      if (import.meta.env.DEV) console.warn('TicketHub reconnecting...', error);
    });

    this.ticketConnection.onreconnected((connectionId) => {
      if (import.meta.env.DEV) console.log('✅ TicketHub reconnected:', connectionId);
    });

    this.ticketConnection.onclose((error) => {
      if (import.meta.env.DEV) console.error('❌ TicketHub connection closed:', error);
    });

    try {
      await this.ticketConnection.start();
      if (import.meta.env.DEV) console.log('✅ TicketHub connected');
    } catch (err) {
      console.error('❌ TicketHub connection failed:', err);
      throw err;
    }
  }

  // Notification Hub
  private async initializeNotificationHub(token: string) {
    this.notificationConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/notification', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 60s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          if (retryContext.previousRetryCount === 3) return 30000;
          return 60000;
        }
      })
      .configureLogging(import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning)
      .build();

    // Reconnection handlers
    this.notificationConnection.onreconnecting((error) => {
      if (import.meta.env.DEV) console.warn('NotificationHub reconnecting...', error);
    });

    this.notificationConnection.onreconnected((connectionId) => {
      if (import.meta.env.DEV) console.log('✅ NotificationHub reconnected:', connectionId);
    });

    this.notificationConnection.onclose((error) => {
      if (import.meta.env.DEV) console.error('❌ NotificationHub connection closed:', error);
    });

    try {
      await this.notificationConnection.start();
      if (import.meta.env.DEV) console.log('✅ NotificationHub connected');
    } catch (err) {
      console.error('❌ NotificationHub connection failed:', err);
      throw err;
    }
  }

  // Ticket Hub Methods
  async joinTicket(ticketId: string) {
    if (this.ticketConnection?.state === signalR.HubConnectionState.Connected) {
      await this.ticketConnection.invoke('JoinTicket', ticketId);
      if (import.meta.env.DEV) console.log(`Joined ticket ${ticketId}`);
    }
  }

  async leaveTicket(ticketId: string) {
    if (this.ticketConnection?.state === signalR.HubConnectionState.Connected) {
      await this.ticketConnection.invoke('LeaveTicket', ticketId);
      if (import.meta.env.DEV) console.log(`Left ticket ${ticketId}`);
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
      if (import.meta.env.DEV) console.log('TicketHub disconnected');
    }
    if (this.notificationConnection) {
      await this.notificationConnection.stop();
      if (import.meta.env.DEV) console.log('NotificationHub disconnected');
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
