import { ApiClient } from './client';
import type {
  AdminLoginResponse,
  BuyerDetail,
  BuyerImportResult,
  BuyerListItem,
  DocumentUploadInput,
  PaginatedResult,
  PaymentCreateInput,
  PaymentItem,
  ProgressUploadInput,
  Project,
  RefreshResponse,
  TicketListItem,
  TicketUpdateInput,
  UnitCreateInput,
  UnitUpdateInput,
} from '../types/api';

export class AdminApiService {
  constructor(private readonly client: ApiClient) {}

  login(input: { email: string; password: string }) {
    return this.client.post<AdminLoginResponse>('/api/v1/admin/auth/login', input);
  }

  refresh(refreshToken: string) {
    return this.client.post<RefreshResponse>('/api/v1/admin/auth/refresh', { refreshToken });
  }

  uploadBuyersCsv(file: File) {
    const formData = new FormData();
    formData.set('file', file);
    return this.client.postForm<BuyerImportResult>('/api/v1/admin/imports/buyers', formData);
  }

  getBuyers(params: { search?: string; page?: number; pageSize?: number }) {
    return this.client.get<PaginatedResult<BuyerListItem>>('/api/v1/admin/buyers', params);
  }

  getBuyerDetail(buyerId: string) {
    return this.client.get<BuyerDetail>(`/api/v1/admin/buyers/${buyerId}`);
  }

  createUnit(input: UnitCreateInput) {
    return this.client.post<{ id: string }>('/api/v1/admin/units', input);
  }

  updateUnit(unitId: string, input: UnitUpdateInput) {
    return this.client.put<{ id: string; status: UnitUpdateInput['status'] }>(
      `/api/v1/admin/units/${unitId}`,
      input,
    );
  }

  createPayment(input: PaymentCreateInput) {
    return this.client.post<{ id: string }>('/api/v1/admin/payments', input);
  }

  getPayments(params: { buyerId: string; page?: number; pageSize?: number }) {
    return this.client.get<PaginatedResult<PaymentItem>>('/api/v1/admin/payments', params);
  }

  uploadDocument(input: DocumentUploadInput) {
    const formData = new FormData();
    formData.set('buyerId', input.buyerId);
    formData.set('title', input.title);
    formData.set('type', input.type);
    formData.set('file', input.file);
    return this.client.postForm<{ id: string }>('/api/v1/admin/documents', formData);
  }

  uploadProgress(input: ProgressUploadInput) {
    const formData = new FormData();
    formData.set('projectId', input.projectId);
    formData.set('title', input.title);
    formData.set('description', input.description);
    formData.set('publishedAt', input.publishedAt);
    if (input.file) {
      formData.set('file', input.file);
    }
    return this.client.postForm<{ id: string }>('/api/v1/admin/progress', formData);
  }

  getTickets(params: { status?: string; page?: number; pageSize?: number }) {
    return this.client.get<PaginatedResult<TicketListItem>>('/api/v1/admin/tickets', params);
  }

  updateTicket(ticketId: string, input: TicketUpdateInput) {
    return this.client.put<{ id: string; status: TicketUpdateInput['status'] }>(
      `/api/v1/admin/tickets/${ticketId}`,
      input,
    );
  }

  getProjects() {
    return this.client.get<{ items: Project[] }>('/api/v1/admin/projects');
  }
}
