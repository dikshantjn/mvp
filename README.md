# Unitary Care

This repository contains the MVP backend API plus the admin dashboard defined in [docs/spec-lock.md](/Users/dikshantjain/Documents/Unitary%20Care/docs/spec-lock.md).

## Local run with Docker Compose

Requirements:

- Docker Desktop or Docker Engine with Compose support

Start PostgreSQL and the backend API:

```bash
docker compose up --build
```

The API will be available at `http://localhost:3000`.

Seed the deterministic QA dataset in a second terminal:

```bash
docker compose exec backend npm run seed
```

This seed creates:

- 1 admin user
- 1 buyer user
- 1 project
- 1 unit
- 1 assignment
- 3 payments
- 2 documents
- 2 progress updates
- 1 support ticket

Seed credentials:

- Admin: `admin@example.com` / `StrongPassword123`
- Buyer mobile: `+919999999999`

## Manual backend setup

If you prefer running without Docker, install Node.js 20+ and PostgreSQL 16+, then create a `.env` file in the repo root with:

```dotenv
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unitary_care
JWT_ACCESS_SECRET=super-secret-access-key
REFRESH_TOKEN_TTL=30d
STORAGE_PROVIDER=local
UPLOAD_DIR=uploads
```

Install dependencies, create the schema, seed data, and start the API:

```bash
npm install
npm run migrate
npm run seed
npm run server
```

## Admin dashboard

The dashboard remains available through the existing Vite flow:

```bash
npm install
npm run dev
```

Optional frontend environment variable:

```bash
VITE_API_BASE_URL=http://localhost:3000
```
