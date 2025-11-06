// API Types for Tickly

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  tenantId?: string;
  departmentId?: number;
  roles?: string[];
  departmentRoles?: Array<{ departmentId: number; role: string }>;
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
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  ticketId: number;
  tenantId: string;
  fileName: string;
  mimeType: string;
  storagePath: string;
  sizeBytes: number;
  checksum?: string;
  uploadedBy?: string;
  scannedAt?: string;
  scanStatus: 'Pending' | 'Clean' | 'Quarantined' | 'Failed';
  createdAt: string;
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
  lastRunAt?: string;
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

export enum ArticleStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export interface Article {
  id: number;
  tenantId: string;
  departmentId?: number;
  categoryId?: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  status: ArticleStatus;
  isFeatured: boolean;
  viewCount: number;
  helpfulCount: number;
  tags?: string;
  authorId?: string;
  departmentName?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CreateArticleDto {
  departmentId?: number;
  categoryId?: number;
  title: string;
  content: string;
  summary?: string;
  status?: ArticleStatus;
  isFeatured: boolean;
  tags?: string;
}
