# Real Estate Customer Portal MVP Spec Lock

Status: Final for MVP implementation
Date: 2026-04-11
Owner: Product + Architect

This document is the single source of truth for the MVP. All implementation agents must follow this spec exactly.

## 1. MVP Feature List

### 1.1 Buyer Mobile App

Primary users:
- Property buyers who have already been onboarded by the developer

Core features:
- OTP login using mobile number
- View assigned unit details
- View payment summary and payment history
- View and download project and unit documents
- View construction progress updates
- Create and track support tickets
- View basic profile information

Out of scope for MVP:
- New buyer self-signup
- Payment gateway checkout
- Push notifications
- In-app chat
- Multiple projects per buyer with advanced filtering
- Offline mode
- Role switching

### 1.2 Developer Admin Dashboard

Primary users:
- Developer operations team
- CRM/back-office staff

Core features:
- Admin login with email/password
- Upload buyers via CSV
- View and manage buyers
- Create and update units
- Upload buyer documents
- Upload construction progress updates
- View and update support tickets
- Record payment entries manually

Out of scope for MVP:
- Advanced analytics
- Granular RBAC
- Bulk ticket workflows
- Automated reminders
- Payment reconciliation integrations

### 1.3 Backend + Platform

Core capabilities:
- REST API backend
- OTP-based buyer authentication
- Admin authentication
- PostgreSQL database
- Local file storage for MVP, S3-compatible storage abstraction supported by config
- Token-based auth for buyer and admin sessions
- CSV import processing for buyer creation

Non-functional targets:
- Simple, maintainable architecture
- Production-ready environment configuration
- Input validation on all write APIs
- Role-based access control at route level
- Audit timestamps on core records

## 2. User Flows

### 2.1 Buyer Login Flow
1. Buyer opens app.
2. Buyer enters mobile number.
3. App calls `POST /api/v1/auth/request-otp`.
4. Backend creates or refreshes an OTP request for an existing buyer-linked user.
5. Buyer enters OTP.
6. App calls `POST /api/v1/auth/verify-otp`.
7. Backend verifies OTP and returns access token, refresh token, and buyer profile summary.
8. App stores tokens securely and opens dashboard.

Rule:
- Only users already imported by admin can log in.

### 2.2 Buyer Dashboard Flow
1. App loads `GET /api/v1/me`.
2. App loads `GET /api/v1/me/unit`.
3. App loads `GET /api/v1/me/payments/summary`.
4. App loads `GET /api/v1/me/progress?limit=5`.
5. App renders overview cards.

### 2.3 Buyer Document Flow
1. Buyer opens Documents screen.
2. App calls `GET /api/v1/me/documents`.
3. Buyer taps a document.
4. App opens secure file URL returned by backend metadata endpoint or fetches `GET /api/v1/me/documents/:id/download`.

### 2.4 Buyer Ticket Flow
1. Buyer opens Support screen.
2. App calls `GET /api/v1/me/tickets`.
3. Buyer creates new ticket using `POST /api/v1/me/tickets`.
4. Admin reviews ticket in dashboard.
5. Admin updates status or resolution note via admin API.
6. Buyer sees updated ticket status.

### 2.5 Admin CSV Import Flow
1. Admin logs in.
2. Admin uploads CSV containing buyer and unit assignment data.
3. Dashboard posts file to `POST /api/v1/admin/imports/buyers`.
4. Backend validates rows and upserts buyers, users, and unit assignments.
5. Dashboard displays import summary with success and error counts.

### 2.6 Admin Document Upload Flow
1. Admin selects buyer and document type.
2. Dashboard uploads file to `POST /api/v1/admin/documents`.
3. Backend stores file and document metadata.
4. Buyer document list reflects uploaded document.

### 2.7 Admin Progress Update Flow
1. Admin creates progress update for a project or tower.
2. Dashboard calls `POST /api/v1/admin/progress`.
3. Backend stores update and optional image attachment.
4. Buyer sees update in Construction Progress screen if it matches buyer’s project.

## 3. Domain Model

Key entities:
- AdminUser
- BuyerUser
- BuyerProfile
- Project
- Unit
- BuyerUnitAssignment
- Payment
- Document
- ProgressUpdate
- SupportTicket
- OtpRequest
- FileObject
- CsvImportJob

Single project support is allowed in MVP, but schema supports multiple projects.

## 4. API Contract (STRICT)

Base path:
- `/api/v1`

Authentication:
- Buyer auth uses Bearer JWT access token
- Admin auth uses Bearer JWT access token
- Refresh tokens are opaque random strings stored server-side

Common response envelope:

```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

Common error envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable error",
    "details": {}
  }
}
```

### 4.1 Auth APIs

#### POST `/api/v1/auth/request-otp`
Purpose:
- Request OTP for an existing buyer

Request:

```json
{
  "mobileNumber": "+919999999999"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "requestId": "otp_req_123",
    "expiresInSeconds": 300
  }
}
```

Rules:
- Return 404 if mobile number does not belong to an active buyer user
- OTP is 6 digits
- Resend allowed after 30 seconds

#### POST `/api/v1/auth/verify-otp`
Request:

```json
{
  "requestId": "otp_req_123",
  "mobileNumber": "+919999999999",
  "otpCode": "123456"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "refresh_token",
    "expiresInSeconds": 3600,
    "user": {
      "id": "buyer_user_uuid",
      "fullName": "Aarav Sharma",
      "mobileNumber": "+919999999999",
      "role": "buyer"
    }
  }
}
```

Rule:
- Max 5 OTP attempts per request. After 5 failed attempts, the OTP is invalidated.

#### POST `/api/v1/auth/refresh`
Request:

```json
{
  "refreshToken": "refresh_token"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_refresh_token",
    "expiresInSeconds": 3600
  }
}
```

### 4.2 Buyer APIs

Buyer token required.

#### GET `/api/v1/me`

Success response:

```json
{
  "success": true,
  "data": {
    "id": "buyer_user_uuid",
    "fullName": "Aarav Sharma",
    "email": "aarav@example.com",
    "mobileNumber": "+919999999999",
    "role": "buyer",
    "buyerProfile": {
      "buyerId": "buyer_uuid",
      "status": "active"
    }
  }
}
```

#### GET `/api/v1/me/unit`

Success response:

```json
{
  "success": true,
  "data": {
    "assignmentId": "assignment_uuid",
    "project": {
      "id": "project_uuid",
      "name": "Unitary Residency"
    },
    "unit": {
      "id": "unit_uuid",
      "unitNumber": "A-1204",
      "tower": "A",
      "floor": 12,
      "type": "3BHK",
      "areaSqFt": 1450,
      "status": "booked"
    },
    "purchase": {
      "agreementValue": 12500000,
      "bookingDate": "2026-01-12"
    }
  }
}
```

#### GET `/api/v1/me/payments/summary`

Success response:

```json
{
  "success": true,
  "data": {
    "totalAmount": 12500000,
    "paidAmount": 4500000,
    "dueAmount": 8000000,
    "overdueAmount": 0,
    "lastPaymentDate": "2026-03-10"
  }
}
```

#### GET `/api/v1/me/payments`
Query params:
- `page` default `1`
- `pageSize` default `20`

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "payment_uuid",
        "title": "Slab Payment 1",
        "amount": 1500000,
        "status": "paid",
        "dueDate": "2026-02-15",
        "paidDate": "2026-02-14",
        "referenceNumber": "PAY-1001"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

#### GET `/api/v1/me/payments/schedule`

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "schedule_uuid",
        "title": "Slab Payment 3",
        "amount": 2000000,
        "dueDate": "2026-05-15",
        "status": "due"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

Note:
- This represents future or scheduled payments not yet marked as paid.

#### GET `/api/v1/me/documents`
Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "document_uuid",
        "title": "Agreement Copy",
        "type": "agreement",
        "uploadedAt": "2026-03-01T10:00:00Z",
        "fileName": "agreement.pdf",
        "downloadUrl": "/api/v1/me/documents/document_uuid/download"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

#### GET `/api/v1/me/documents/:documentId/download`
Response:
- Returns file stream if document belongs to authenticated buyer

#### GET `/api/v1/me/progress`
Query params:
- `page` default `1`
- `pageSize` default `20`

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "progress_uuid",
        "title": "Tower A Structure Complete",
        "description": "Structure work completed till roof level.",
        "publishedAt": "2026-03-05T09:00:00Z",
        "imageUrl": "/api/v1/me/progress/progress_uuid/image"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

Note:
- `imageUrl` is null when no image is attached. Backend serves the image file via this endpoint.

#### GET `/api/v1/me/progress/:progressId/image`
Response:
- Returns image file stream if progress update belongs to authenticated buyer’s project.

#### GET `/api/v1/me/tickets`
Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ticket_uuid",
        "subject": "Need payment receipt",
        "category": "payments",
        "status": "open",
        "priority": "medium",
        "createdAt": "2026-03-07T11:30:00Z",
        "updatedAt": "2026-03-08T08:30:00Z"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

#### POST `/api/v1/me/tickets`
Request:

```json
{
  "subject": "Need payment receipt",
  "category": "payments",
  "description": "Please share the receipt for the February payment."
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "id": "ticket_uuid",
    "status": "open"
  }
}
```

#### GET `/api/v1/me/tickets/:ticketId`
Success response:

```json
{
  "success": true,
  "data": {
    "id": "ticket_uuid",
    "subject": "Need payment receipt",
    "category": "payments",
    "description": "Please share the receipt for the February payment.",
    "status": "open",
    "priority": "medium",
    "resolutionNote": null,
    "createdAt": "2026-03-07T11:30:00Z",
    "updatedAt": "2026-03-08T08:30:00Z"
  }
}
```

### 4.3 Admin Auth APIs

#### POST `/api/v1/admin/auth/login`
Request:

```json
{
  "email": "admin@example.com",
  "password": "StrongPassword123"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "refresh_token",
    "expiresInSeconds": 3600,
    "admin": {
      "id": "admin_uuid",
      "fullName": "Ops Admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

#### POST `/api/v1/admin/auth/refresh`
Request:

```json
{
  "refreshToken": "refresh_token"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_refresh_token",
    "expiresInSeconds": 3600
  }
}
```

### 4.4 Admin APIs

Admin token required.

#### POST `/api/v1/admin/imports/buyers`
Content-Type:
- `multipart/form-data`

Form fields:
- `file`: CSV file

CSV columns:
- `full_name`
- `email`
- `mobile_number`
- `project_name`
- `unit_number`
- `tower`
- `floor`
- `unit_type`
- `area_sq_ft`
- `agreement_value`
- `booking_date`

Success response:

```json
{
  "success": true,
  "data": {
    "importId": "import_uuid",
    "totalRows": 25,
    "successRows": 24,
    "failedRows": 1,
    "errors": [
      {
        "rowNumber": 7,
        "message": "Mobile number already assigned to another active buyer."
      }
    ]
  }
}
```

#### GET `/api/v1/admin/buyers`
Query params:
- `search` optional
- `page` default `1`
- `pageSize` default `20`

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "buyerId": "buyer_uuid",
        "fullName": "Aarav Sharma",
        "email": "aarav@example.com",
        "mobileNumber": "+919999999999",
        "projectName": "Unitary Residency",
        "unitNumber": "A-1204",
        "status": "active"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

#### POST `/api/v1/admin/units`
Request:

```json
{
  "projectId": "project_uuid",
  "unitNumber": "A-1205",
  "tower": "A",
  "floor": 12,
  "type": "3BHK",
  "areaSqFt": 1450,
  "status": "available"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "id": "unit_uuid"
  }
}
```

#### PUT `/api/v1/admin/units/:unitId`
Request:

```json
{
  "status": "booked"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "id": "unit_uuid",
    "status": "booked"
  }
}
```

#### POST `/api/v1/admin/payments`
Request:

```json
{
  "buyerId": "buyer_uuid",
  "title": "Slab Payment 2",
  "amount": 2000000,
  "status": "due",
  "dueDate": "2026-04-20",
  "paidDate": null,
  "referenceNumber": null
}
```

Note:
- `buyerId` refers to `buyer_users.id` (UUID primary key).

Success response:

```json
{
  "success": true,
  "data": {
    "id": "payment_uuid"
  }
}
```

#### POST `/api/v1/admin/documents`
Content-Type:
- `multipart/form-data`

Form fields:
- `buyerId`
- `title`
- `type`
- `file`

Note:
- `buyerId` refers to `buyer_users.id` (UUID primary key).

Success response:

```json
{
  "success": true,
  "data": {
    "id": "document_uuid"
  }
}
```

#### POST `/api/v1/admin/progress`
Content-Type:
- `multipart/form-data`

Form fields:
- `projectId`
- `title`
- `description`
- `publishedAt`
- `file` optional image

Success response:

```json
{
  "success": true,
  "data": {
    "id": "progress_uuid"
  }
}
```

#### GET `/api/v1/admin/tickets`
Query params:
- `status` optional
- `page` default `1`
- `pageSize` default `20`

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ticket_uuid",
        "buyerName": "Aarav Sharma",
        "subject": "Need payment receipt",
        "category": "payments",
        "status": "open",
        "priority": "medium",
        "createdAt": "2026-03-07T11:30:00Z"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

#### PUT `/api/v1/admin/tickets/:ticketId`
Request:

```json
{
  "status": "resolved",
  "priority": "medium",
  "resolutionNote": "Receipt has been emailed to the buyer."
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "id": "ticket_uuid",
    "status": "resolved"
  }
}
```

#### GET `/api/v1/admin/buyers/:buyerId`

Response:

```json
{
  "success": true,
  "data": {
    "buyerId": "buyer_uuid",
    "fullName": "string",
    "email": "string",
    "mobileNumber": "string",
    "status": "active",
    "unit": {
      "assignmentId": "assignment_uuid",
      "projectId": "project_uuid",
      "projectName": "string",
      "unitId": "unit_uuid",
      "unitNumber": "string",
      "tower": "string",
      "floor": 0,
      "type": "string",
      "areaSqFt": 0,
      "agreementValue": 0,
      "bookingDate": "YYYY-MM-DD"
    },
    "paymentSummary": {
      "totalAmount": 0,
      "paidAmount": 0,
      "dueAmount": 0,
      "overdueAmount": 0
    }
  }
}
```

#### GET `/api/v1/admin/payments`

Query params:
- `buyerId` required
- `page` default `1`
- `pageSize` default `20`

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "payment_uuid",
        "title": "Slab Payment 1",
        "amount": 1500000,
        "status": "paid",
        "dueDate": "2026-02-15",
        "paidDate": "2026-02-14",
        "referenceNumber": "PAY-1001"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

#### GET `/api/v1/admin/projects`

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "project_uuid",
        "name": "Unitary Residency",
        "code": "UR-01",
        "location": "Pune"
      }
    ]
  }
}
```

## 5. Validation Rules

Mobile number:
- E.164 format

Enums:
- user role: `buyer`, `admin`
- buyer status: `active`, `inactive`
- unit status: `available`, `booked`, `blocked`
- payment status: `due`, `paid`, `overdue`
- document type: `agreement`, `receipt`, `statement`, `invoice`, `other`
- ticket category: `payments`, `documents`, `construction`, `legal`, `other`
- ticket status: `open`, `in_progress`, `resolved`, `closed`
- ticket priority: `low`, `medium`, `high`

File limits:
- Document upload max 15 MB
- Progress image upload max 10 MB

## 6. DB Schema (FINAL)

Database:
- PostgreSQL 15+

All tables use:
- `id UUID PRIMARY KEY`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 6.1 `admin_users`

Columns:
- `id UUID PRIMARY KEY`
- `full_name VARCHAR(150) NOT NULL`
- `email VARCHAR(255) NOT NULL UNIQUE`
- `password_hash VARCHAR(255) NOT NULL`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 6.2 `buyer_users`

Columns:
- `id UUID PRIMARY KEY`
- `full_name VARCHAR(150) NOT NULL`
- `email VARCHAR(255)`
- `mobile_number VARCHAR(20) NOT NULL UNIQUE`
- `status VARCHAR(20) NOT NULL DEFAULT 'active'`
- `last_login_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:
- `status IN ('active', 'inactive')`

### 6.3 `projects`

Columns:
- `id UUID PRIMARY KEY`
- `name VARCHAR(150) NOT NULL UNIQUE`
- `code VARCHAR(50) NOT NULL UNIQUE`
- `location VARCHAR(255)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 6.4 `units`

Columns:
- `id UUID PRIMARY KEY`
- `project_id UUID NOT NULL REFERENCES projects(id)`
- `unit_number VARCHAR(50) NOT NULL`
- `tower VARCHAR(50)`
- `floor INTEGER`
- `type VARCHAR(50) NOT NULL`
- `area_sq_ft NUMERIC(10,2)`
- `status VARCHAR(20) NOT NULL DEFAULT 'available'`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:
- `UNIQUE(project_id, unit_number)`
- `status IN ('available', 'booked', 'blocked')`

### 6.5 `buyer_unit_assignments`

Columns:
- `id UUID PRIMARY KEY`
- `buyer_user_id UUID NOT NULL UNIQUE REFERENCES buyer_users(id)`
- `unit_id UUID NOT NULL UNIQUE REFERENCES units(id)`
- `agreement_value NUMERIC(14,2) NOT NULL`
- `booking_date DATE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Rule:
- One active buyer mapped to one unit in MVP

### 6.6 `payments`

Columns:
- `id UUID PRIMARY KEY`
- `buyer_user_id UUID NOT NULL REFERENCES buyer_users(id)`
- `title VARCHAR(150) NOT NULL`
- `amount NUMERIC(14,2) NOT NULL`
- `status VARCHAR(20) NOT NULL`
- `due_date DATE`
- `paid_date DATE`
- `reference_number VARCHAR(100)`
- `created_by_admin_id UUID REFERENCES admin_users(id)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:
- `status IN ('due', 'paid', 'overdue')`

### 6.7 `file_objects`

Columns:
- `id UUID PRIMARY KEY`
- `storage_provider VARCHAR(20) NOT NULL`
- `storage_path VARCHAR(500) NOT NULL`
- `original_file_name VARCHAR(255) NOT NULL`
- `mime_type VARCHAR(100) NOT NULL`
- `size_bytes BIGINT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:
- `storage_provider IN ('local', 's3')`

### 6.8 `documents`

Columns:
- `id UUID PRIMARY KEY`
- `buyer_user_id UUID NOT NULL REFERENCES buyer_users(id)`
- `title VARCHAR(150) NOT NULL`
- `type VARCHAR(30) NOT NULL`
- `file_object_id UUID NOT NULL REFERENCES file_objects(id)`
- `uploaded_by_admin_id UUID REFERENCES admin_users(id)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:
- `type IN ('agreement', 'receipt', 'statement', 'invoice', 'other')`

### 6.9 `progress_updates`

Columns:
- `id UUID PRIMARY KEY`
- `project_id UUID NOT NULL REFERENCES projects(id)`
- `title VARCHAR(150) NOT NULL`
- `description TEXT NOT NULL`
- `image_file_object_id UUID REFERENCES file_objects(id)`
- `published_at TIMESTAMPTZ NOT NULL`
- `created_by_admin_id UUID REFERENCES admin_users(id)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 6.10 `support_tickets`

Columns:
- `id UUID PRIMARY KEY`
- `buyer_user_id UUID NOT NULL REFERENCES buyer_users(id)`
- `subject VARCHAR(150) NOT NULL`
- `category VARCHAR(30) NOT NULL`
- `description TEXT NOT NULL`
- `status VARCHAR(20) NOT NULL DEFAULT 'open'`
- `priority VARCHAR(20) NOT NULL DEFAULT 'medium'`
- `resolution_note TEXT`
- `resolved_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:
- `category IN ('payments', 'documents', 'construction', 'legal', 'other')`
- `status IN ('open', 'in_progress', 'resolved', 'closed')`
- `priority IN ('low', 'medium', 'high')`

### 6.11 `otp_requests`

Columns:
- `id UUID PRIMARY KEY`
- `buyer_user_id UUID NOT NULL REFERENCES buyer_users(id)`
- `mobile_number VARCHAR(20) NOT NULL`
- `otp_code_hash VARCHAR(255) NOT NULL`
- `expires_at TIMESTAMPTZ NOT NULL`
- `verified_at TIMESTAMPTZ`
- `attempt_count INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 6.12 `refresh_tokens`

Columns:
- `id UUID PRIMARY KEY`
- `user_type VARCHAR(20) NOT NULL`
- `buyer_user_id UUID REFERENCES buyer_users(id)`
- `admin_user_id UUID REFERENCES admin_users(id)`
- `token_hash VARCHAR(255) NOT NULL UNIQUE`
- `expires_at TIMESTAMPTZ NOT NULL`
- `revoked_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:
- `user_type IN ('buyer', 'admin')`

### 6.13 `csv_import_jobs`

Columns:
- `id UUID PRIMARY KEY`
- `status VARCHAR(20) NOT NULL DEFAULT 'done'`
- `uploaded_by_admin_id UUID NOT NULL REFERENCES admin_users(id)`
- `file_object_id UUID REFERENCES file_objects(id)`
- `total_rows INTEGER NOT NULL DEFAULT 0`
- `success_rows INTEGER NOT NULL DEFAULT 0`
- `failed_rows INTEGER NOT NULL DEFAULT 0`
- `error_report JSONB NOT NULL DEFAULT '[]'::jsonb`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:
- `status IN ('pending', 'processing', 'done', 'failed')`

Note:
- Synchronous processing in MVP — status will be `done` or `failed` at response time.

### Indexing Guidance (MVP)

The following indexes should be created to ensure acceptable query performance:

- `buyer_users.mobile_number`
- `payments.buyer_user_id`
- `documents.buyer_user_id`
- `support_tickets.buyer_user_id`
- `progress_updates.project_id`

## 7. Assumptions

- MVP supports one assigned unit per buyer.
- Buyers are pre-created by admin import and cannot self-register.
- OTP delivery service can be mocked in non-production environments by logging the OTP.
- Admin authentication uses email/password instead of OTP.
- Document access is restricted by ownership checks on backend.
- Payment entries are informational records in MVP, not direct payment transactions.
- Construction progress updates are project-level and visible to all buyers under that project.
- Local filesystem storage is default for development; S3-compatible storage is configurable for production.
- Timezone handling is stored in UTC in the database and formatted by clients.
- No in-app comments on tickets in MVP; only latest resolution note is stored.
- If a buyer has no unit assigned, `GET /api/v1/me/unit` returns HTTP 404 with error code `NO_UNIT_ASSIGNED`.

## 8. Build Guidance for Phase 2 Agents

Backend stack lock:
- Node.js
- Express
- PostgreSQL

Mobile stack lock:
- Flutter

Admin stack lock:
- React
- Vite

Infra guidance lock:
- PostgreSQL
- Local storage with S3-compatible abstraction

Agent constraints:
- Do not rename fields defined in the API contract.
- Do not add required request fields.
- Do not remove response fields.
- Do not change database table or column names.
- Prefer simple implementations with clear separation of concerns.
