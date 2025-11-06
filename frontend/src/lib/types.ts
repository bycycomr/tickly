// API Types for Tickly

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  tenantId?: string;
  departmentId?: number;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export enum TicketStatus {
  New = 0,
  Assigned = 1,
  InProgress = 2,
  WaitingForInfo = 3,
  Completed = 4,
  Closed = 5,
  Rejected = 6,
  Duplicate = 7,
  Merged = 8,
}

export enum TicketPriority {
  Low = 0,
  Normal = 1,
  High = 2,
  Urgent = 3,
}

export enum TicketChannel {
  WebForm = 0,
  Email = 1,
  Phone = 2,
  InPerson = 3,
}

export interface Ticket {
  id: number;
  tenantId: string;
  departmentId?: number;
  categoryId?: number;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  creatorId: string;
  assignedToUserId?: string;
  slaPlanId?: number;
  estimatedResolutionAt?: string;
  dueAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketEvent {
  id: number;
  ticketId: number;
  type: string;
  actorId: string;
  visibility: 'Public' | 'Internal';
  payloadJson?: string;
  createdAt: string;
}

export interface Department {
  id: number;
  tenantId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Category {
  id: number;
  tenantId: string;
  departmentId?: number;
  parentId?: number;
  name: string;
  formSchemaJson?: string;
  visibility: number;
  sortOrder: number;
  createdAt: string;
}

export interface SLAPlan {
  id: number;
  tenantId: string;
  name: string;
  description?: string;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  calendar: number;
  escalationPolicyJson?: string;
  isActive: boolean;
}

export interface AutomationRule {
  id: number;
  tenantId: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: number;
  conditionJson?: string;
  actionJson?: string;
  priority: number;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  totalTickets: number;
  openTickets: number;
  overdueTickets: number;
  closedTickets?: number;
  slaComplianceRate?: number;
  byStatus: { [status: string]: number };
  byPriority: { [priority: string]: number };
  byChannel?: Array<{ channel: string; count: number }>;
  avgResolutionTime?: number;
  recentActivity?: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    updatedAt: string;
  }>;
}

export interface ApiError {
  error: string;
  details?: string;
}
