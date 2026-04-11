CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buyer_users (
  id UUID PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  mobile_number VARCHAR(20) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT buyer_users_status_check CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  location VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  unit_number VARCHAR(50) NOT NULL,
  tower VARCHAR(50),
  floor INTEGER,
  type VARCHAR(50) NOT NULL,
  area_sq_ft NUMERIC(10,2),
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT units_project_unit_number_unique UNIQUE (project_id, unit_number),
  CONSTRAINT units_status_check CHECK (status IN ('available', 'booked', 'blocked'))
);

CREATE TABLE IF NOT EXISTS buyer_unit_assignments (
  id UUID PRIMARY KEY,
  buyer_user_id UUID NOT NULL UNIQUE REFERENCES buyer_users(id),
  unit_id UUID NOT NULL UNIQUE REFERENCES units(id),
  agreement_value NUMERIC(14,2) NOT NULL,
  booking_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  buyer_user_id UUID NOT NULL REFERENCES buyer_users(id),
  title VARCHAR(150) NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  due_date DATE,
  paid_date DATE,
  reference_number VARCHAR(100),
  created_by_admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payments_status_check CHECK (status IN ('due', 'paid', 'overdue'))
);

CREATE TABLE IF NOT EXISTS file_objects (
  id UUID PRIMARY KEY,
  storage_provider VARCHAR(20) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT file_objects_storage_provider_check CHECK (storage_provider IN ('local', 's3'))
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  buyer_user_id UUID NOT NULL REFERENCES buyer_users(id),
  title VARCHAR(150) NOT NULL,
  type VARCHAR(30) NOT NULL,
  file_object_id UUID NOT NULL REFERENCES file_objects(id),
  uploaded_by_admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT documents_type_check CHECK (type IN ('agreement', 'receipt', 'statement', 'invoice', 'other'))
);

CREATE TABLE IF NOT EXISTS progress_updates (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  image_file_object_id UUID REFERENCES file_objects(id),
  published_at TIMESTAMPTZ NOT NULL,
  created_by_admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY,
  buyer_user_id UUID NOT NULL REFERENCES buyer_users(id),
  subject VARCHAR(150) NOT NULL,
  category VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  resolution_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT support_tickets_category_check CHECK (category IN ('payments', 'documents', 'construction', 'legal', 'other')),
  CONSTRAINT support_tickets_status_check CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  CONSTRAINT support_tickets_priority_check CHECK (priority IN ('low', 'medium', 'high'))
);

CREATE TABLE IF NOT EXISTS otp_requests (
  id UUID PRIMARY KEY,
  buyer_user_id UUID NOT NULL REFERENCES buyer_users(id),
  mobile_number VARCHAR(20) NOT NULL,
  otp_code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY,
  user_type VARCHAR(20) NOT NULL,
  buyer_user_id UUID REFERENCES buyer_users(id),
  admin_user_id UUID REFERENCES admin_users(id),
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT refresh_tokens_user_type_check CHECK (user_type IN ('buyer', 'admin'))
);

CREATE TABLE IF NOT EXISTS csv_import_jobs (
  id UUID PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'done',
  uploaded_by_admin_id UUID NOT NULL REFERENCES admin_users(id),
  file_object_id UUID REFERENCES file_objects(id),
  total_rows INTEGER NOT NULL DEFAULT 0,
  success_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  error_report JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT csv_import_jobs_status_check CHECK (status IN ('pending', 'processing', 'done', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_buyer_users_mobile_number ON buyer_users (mobile_number);
CREATE INDEX IF NOT EXISTS idx_payments_buyer_user_id ON payments (buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_buyer_user_id ON documents (buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_buyer_user_id ON support_tickets (buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_project_id ON progress_updates (project_id);
