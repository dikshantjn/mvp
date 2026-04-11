export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface AdminLoginResponse extends AuthTokens {
  admin: AdminUser;
}

export interface RefreshResponse extends AuthTokens {}

export interface ImportErrorItem {
  rowNumber: number;
  message: string;
}

export interface BuyerImportResult {
  importId: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: ImportErrorItem[];
}

export interface BuyerListItem {
  buyerId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  projectName: string;
  unitNumber: string;
  status: 'active' | 'inactive';
}

export interface BuyerDetail {
  buyerId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  status: 'active' | 'inactive';
  unit: {
    assignmentId: string;
    projectId: string;
    projectName: string;
    unitId: string;
    unitNumber: string;
    tower: string;
    floor: number;
    type: string;
    areaSqFt: number;
    agreementValue: number;
    bookingDate: string;
  };
  paymentSummary: {
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    overdueAmount: number;
  };
}

export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
}

export interface UnitCreateInput {
  projectId: string;
  unitNumber: string;
  tower: string;
  floor: number;
  type: string;
  areaSqFt: number;
  status: 'available' | 'booked' | 'blocked';
}

export interface UnitUpdateInput {
  status: 'available' | 'booked' | 'blocked';
}

export interface PaymentItem {
  id: string;
  title: string;
  amount: number;
  status: 'due' | 'paid' | 'overdue';
  dueDate: string | null;
  paidDate: string | null;
  referenceNumber: string | null;
}

export interface PaymentCreateInput {
  buyerId: string;
  title: string;
  amount: number;
  status: 'due' | 'paid' | 'overdue';
  dueDate: string | null;
  paidDate: string | null;
  referenceNumber: string | null;
}

export interface DocumentUploadInput {
  buyerId: string;
  title: string;
  type: 'agreement' | 'receipt' | 'statement' | 'invoice' | 'other';
  file: File;
}

export interface ProgressUploadInput {
  projectId: string;
  title: string;
  description: string;
  publishedAt: string;
  file?: File | null;
}

export interface TicketListItem {
  id: string;
  buyerName: string;
  subject: string;
  category: 'payments' | 'documents' | 'construction' | 'legal' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface TicketUpdateInput {
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  resolutionNote: string;
}
