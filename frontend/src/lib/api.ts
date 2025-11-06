import axios, { AxiosInstance } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Ticket,
  TicketEvent,
  Department,
  Category,
  SLAPlan,
  AutomationRule,
  DashboardStats,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token from localStorage
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Only redirect to login if not already there
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/api/auth/register', data);
    return response.data;
  }

  // Tickets
  async getTickets(): Promise<Ticket[]> {
    const response = await this.client.get<Ticket[]>('/api/tickets');
    return response.data;
  }

  async getTicket(id: number): Promise<Ticket> {
    const response = await this.client.get<Ticket>(`/api/tickets/${id}`);
    return response.data;
  }

  async createTicket(data: Partial<Ticket>): Promise<Ticket> {
    const response = await this.client.post<Ticket>('/api/tickets', data);
    return response.data;
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<void> {
    await this.client.put(`/api/tickets/${id}`, data);
  }

  async deleteTicket(id: number): Promise<void> {
    await this.client.delete(`/api/tickets/${id}`);
  }

  async transitionTicketStatus(id: number, status: number, note?: string): Promise<TicketEvent> {
    const response = await this.client.post<TicketEvent>(`/api/tickets/${id}/transition`, {
      status,
      note,
    });
    return response.data;
  }

  async assignTicket(id: number, assigneeId: string): Promise<TicketEvent> {
    const response = await this.client.post<TicketEvent>(`/api/tickets/${id}/assign`, {
      assigneeId,
    });
    return response.data;
  }

  async addComment(id: number, text: string, isInternal: boolean = false): Promise<TicketEvent> {
    const response = await this.client.post<TicketEvent>(`/api/tickets/${id}/comments`, {
      text,
      isInternal,
    });
    return response.data;
  }

  async getTicketEvents(id: number): Promise<TicketEvent[]> {
    const response = await this.client.get<TicketEvent[]>(`/api/tickets/${id}/events`);
    return response.data;
  }

  // Categories
  async getCategories(departmentId?: number): Promise<Category[]> {
    const params = departmentId ? { departmentId } : {};
    const response = await this.client.get<Category[]>('/api/categories', { params });
    return response.data;
  }

  async getCategory(id: number): Promise<Category> {
    const response = await this.client.get<Category>(`/api/categories/${id}`);
    return response.data;
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await this.client.post<Category>('/api/categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<void> {
    await this.client.put(`/api/categories/${id}`, data);
  }

  async deleteCategory(id: number): Promise<void> {
    await this.client.delete(`/api/categories/${id}`);
  }

  async getCategoryTree(departmentId?: number): Promise<any> {
    const params = departmentId ? { departmentId } : {};
    const response = await this.client.get('/api/categories/tree', { params });
    return response.data;
  }

  // Admin - Departments
  async getDepartments(): Promise<Department[]> {
    const response = await this.client.get<Department[]>('/api/admin/departments');
    return response.data;
  }

  async createDepartment(data: { name: string; description?: string }): Promise<Department> {
    const response = await this.client.post<Department>('/api/admin/departments', data);
    return response.data;
  }

  async deleteDepartment(id: number): Promise<void> {
    await this.client.delete(`/api/admin/departments/${id}`);
  }

  async getDepartmentMembers(id: number): Promise<any[]> {
    const response = await this.client.get(`/api/admin/departments/${id}/members`);
    return response.data;
  }

  async assignDepartmentRole(
    departmentId: number,
    userId: string,
    role: string
  ): Promise<void> {
    await this.client.post(`/api/admin/departments/${departmentId}/assign`, {
      userId,
      role,
    });
  }

  async assignGlobalRole(userId: string, role: string): Promise<void> {
    await this.client.post('/api/admin/roles/assign-global', {
      userId,
      role,
    });
  }

  // Admin - SLA Plans
  async getSLAPlans(tenantId?: string): Promise<SLAPlan[]> {
    const params = tenantId ? { tenantId } : {};
    const response = await this.client.get<SLAPlan[]>('/api/admin/sla-plans', { params });
    return response.data;
  }

  async getSLAPlan(id: number): Promise<SLAPlan> {
    const response = await this.client.get<SLAPlan>(`/api/admin/sla-plans/${id}`);
    return response.data;
  }

  async createSLAPlan(data: Partial<SLAPlan>): Promise<SLAPlan> {
    const response = await this.client.post<SLAPlan>('/api/admin/sla-plans', data);
    return response.data;
  }

  async updateSLAPlan(id: number, data: Partial<SLAPlan>): Promise<SLAPlan> {
    const response = await this.client.put<SLAPlan>(`/api/admin/sla-plans/${id}`, data);
    return response.data;
  }

  async deleteSLAPlan(id: number): Promise<void> {
    await this.client.delete(`/api/admin/sla-plans/${id}`);
  }

  // Admin - Automation Rules
  async getAutomationRules(tenantId?: string): Promise<AutomationRule[]> {
    const params = tenantId ? { tenantId } : {};
    const response = await this.client.get<AutomationRule[]>('/api/admin/automation-rules', {
      params,
    });
    return response.data;
  }

  async getAutomationRule(id: number): Promise<AutomationRule> {
    const response = await this.client.get<AutomationRule>(`/api/admin/automation-rules/${id}`);
    return response.data;
  }

  async createAutomationRule(data: Partial<AutomationRule>): Promise<AutomationRule> {
    const response = await this.client.post<AutomationRule>('/api/admin/automation-rules', data);
    return response.data;
  }

  async updateAutomationRule(id: number, data: Partial<AutomationRule>): Promise<AutomationRule> {
    const response = await this.client.put<AutomationRule>(
      `/api/admin/automation-rules/${id}`,
      data
    );
    return response.data;
  }

  async deleteAutomationRule(id: number): Promise<void> {
    await this.client.delete(`/api/admin/automation-rules/${id}`);
  }

  // Reports
  async getDashboardStats(tenantId?: string, departmentId?: number): Promise<DashboardStats> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (departmentId) params.departmentId = departmentId;
    const response = await this.client.get<DashboardStats>('/api/reports/dashboard', { params });
    return response.data;
  }

  async getTrends(tenantId?: string, departmentId?: number, days: number = 30): Promise<any> {
    const params: any = { days };
    if (tenantId) params.tenantId = tenantId;
    if (departmentId) params.departmentId = departmentId;
    const response = await this.client.get('/api/reports/trends', { params });
    return response.data;
  }

  async getAgentPerformance(
    tenantId?: string,
    departmentId?: number,
    days: number = 30
  ): Promise<any> {
    const params: any = { days };
    if (tenantId) params.tenantId = tenantId;
    if (departmentId) params.departmentId = departmentId;
    const response = await this.client.get('/api/reports/agent-performance', { params });
    return response.data;
  }

  async getSLACompliance(
    tenantId?: string,
    departmentId?: number,
    days: number = 30
  ): Promise<any> {
    const params: any = { days };
    if (tenantId) params.tenantId = tenantId;
    if (departmentId) params.departmentId = departmentId;
    const response = await this.client.get('/api/reports/sla-compliance', { params });
    return response.data;
  }

  async exportTicketsCSV(
    tenantId?: string,
    departmentId?: number,
    status?: number
  ): Promise<Blob> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (departmentId) params.departmentId = departmentId;
    if (status !== undefined) params.status = status;
    const response = await this.client.get('/api/reports/export/csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Attachments
  async uploadAttachment(ticketId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post(`/api/attachments/upload?ticketId=${ticketId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getAttachment(id: number): Promise<Blob> {
    const response = await this.client.get(`/api/attachments/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

const api = new ApiClient();
export default api;

