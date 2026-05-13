# ⚡ Job Finder — Backend API

A role-based job board REST API built with **Express.js**, **PostgreSQL**, **Prisma ORM**, and **Redis/Bull** message queuing. Supports Job Seeker and Recruiter roles with **dual HTTP-only cookie auth** — both the short-lived access token and the long-lived refresh token are set as `HttpOnly; SameSite=Lax` cookies, so no token ever touches JavaScript. High-traffic write operations (apply to job, save job) are handled asynchronously via a Bull queue.

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express.js | HTTP server & routing |
| TypeScript | Type safety |
| Prisma ORM | Database access layer |
| PostgreSQL | Relational database |
| Redis 7 | Message broker for Bull queues |
| Bull | Job queue for async DB write operations |
| JWT | Access & refresh token auth |
| bcrypt | Password hashing |
| Zod | Request validation |
| Docker / Docker Compose | Containerised dev environment |

---

## 🏗 Project Structure

```
src/
├── controllers/     # Route handlers (auth, job, jobseeker, recruiter)
├── services/        # Business logic layer
├── routes/          # Express router definitions (includes queue.route.ts)
├── middleware/      # requireAuth, authorizeRoles, validate
├── validators/      # Zod schemas
├── prisma/          # Prisma client singleton
├── queue/           # Bull queue infrastructure
│   ├── queue.ts     # Shared Bull queue instance (db-write-queue)
│   ├── worker.ts    # Queue processor — dispatches to service layer
│   └── types.ts     # QueuePayload discriminated union
└── utils/           # token.ts, hash.ts, auth.utils.ts, job.utils.ts
prisma/
├── schema.prisma    # Database schema & enums
└── seed.ts          # Dev seed data
```

---

## 🔐 Roles & Permissions

| Role | Description |
|------|-------------|
| `JOB_SEEKER` | Browse jobs, apply, save jobs, manage profile |
| `RECRUITER` | Post/edit/delete jobs, view applicants, manage company profile |
| `ADMIN` | Seed-only; no admin routes exposed yet |

---

## 🚀 Setup & Running Locally

### Prerequisites
- Docker & Docker Compose (recommended)
- Node.js v18+ (only needed if running without Docker)

### 1. Configure environment

```bash
cp .env.sample .env
# Then edit .env with your actual values
```

**Key `.env` variables:**

```env
DATABASE_URL=postgresql://job_finder_user:secure_password_123@db:5432/job_finder
ACCESS_TOKEN_SECRET=<32-char random string>
REFRESH_TOKEN_SECRET=<32-char random string>
PORT=5002
NODE_ENV=development
REDIS_URL=redis://redis:6379
QUEUE_CONCURRENCY=5
```

**Generate secrets:**

```bash
node -e "const c=require('crypto');console.log(c.randomBytes(32).toString('base64').substring(0,32));"
```

### 2. Start with Docker

```bash
docker-compose up --build
```

This starts:
- `job-finder-backend` on **port 5002**
- `job-finder-db` (PostgreSQL) on **port 5432**
- `job-finder-redis` (Redis 7) on **port 6379**
- `pgAdmin4` on **port 5050**

### 3. Initialize the database

Run these three commands in order on a fresh setup:

```bash
# Generate the Prisma client
docker exec job-finder-backend npx prisma generate

# Apply migrations (creates all tables)
docker exec job-finder-backend npx prisma migrate deploy

# Seed the database with demo data
docker exec job-finder-backend npx prisma db seed
```

This creates demo users:
| Email | Password | Role |
|-------|----------|------|
| `admin@example1.com` | `admin` | ADMIN |
| `recruiter@example.com` | `recruiter123` | RECRUITER |
| `seeker@example.com` | `seeker123` | JOB_SEEKER |

---

## 🧪 API Reference

Base URL: `http://localhost:5002/api`

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/signup/jobseeker` | — | Register as Job Seeker |
| `POST` | `/signup/recruiter` | — | Register as Recruiter (includes company fields) |
| `POST` | `/login` | — | Login; sets `accessToken` + `refreshToken` HTTP-only cookies |
| `POST` | `/logout` | — | Clears both `accessToken` and `refreshToken` cookies |
| `POST` | `/refresh` | Cookie | Rotates both tokens; sets fresh cookies |
| `GET`  | `/me` | Cookie (`accessToken`) | Get current authenticated user |
| `POST` | `/upgrade/recruiter` | Cookie (JOB_SEEKER) | Upgrade Job Seeker account to Recruiter |

**Signup — Job Seeker** `POST /api/auth/signup/jobseeker`
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

**Signup — Recruiter** `POST /api/auth/signup/recruiter`
```json
{
  "name": "Jane Smith",
  "email": "jane@corp.com",
  "password": "secret123",
  "companyName": "Acme Corp",
  "companyWebsite": "https://acme.com",
  "industry": "Technology",
  "description": "We build cool stuff."
}
```

**Login** `POST /api/auth/login`
```json
{ "email": "john@example.com", "password": "secret123" }
```
Response: `{ "message": "Logged in successfully" }` + two cookies:
- `Set-Cookie: accessToken=<JWT>; HttpOnly; SameSite=Lax` (15 min)
- `Set-Cookie: refreshToken=<JWT>; HttpOnly; SameSite=Lax` (7 days)

> The `accessToken` is **never returned in the response body** — it is inaccessible to JavaScript, eliminating XSS-based token theft.

**Refresh** `POST /api/auth/refresh` _(requires `refreshToken` HTTP-only cookie)_

Response: `{ "message": "Token refreshed" }` + two refreshed cookies (same options as login).
> Rotates both tokens. Called automatically by the frontend interceptor on `401` responses.

**Get Me** `GET /api/auth/me` _(requires `accessToken` HTTP-only cookie)_
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["JOB_SEEKER"],
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### Jobs — `/api/jobs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/all` | — | List all active jobs (supports `?search=`, `?category=`, `?location=`) |
| `GET` | `/:id` | — | Get a single job by ID |
| `GET` | `/recruiter` | Bearer (RECRUITER) | Get jobs posted by the authenticated recruiter |
| `POST` | `/` | Bearer (RECRUITER) | Create a new job posting |
| `PUT` | `/:id` | Bearer (RECRUITER) | Update a job (owner only) |
| `DELETE` | `/:id` | Bearer (RECRUITER) | Delete a job (owner only) |

**Create / Update Job body:**
```json
{
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "requirements": "5+ years React experience",
  "location": "Remote",
  "salaryRange": "$120,000 – $160,000",
  "category": "Engineering"
}
```

---

### Job Seeker — `/api/jobseeker`

All endpoints require an `accessToken` HTTP-only cookie and role `JOB_SEEKER`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/profile` | Get own Job Seeker profile |
| `PATCH` | `/profile` | Update profile (bio, location, skills, education, experience, resumeUrl) |
| `POST` | `/apply/:jobId` | **Enqueue** an application — returns `202 Accepted` + `jobId` |
| `GET` | `/applications` | List own applications |
| `DELETE` | `/applications/:id` | Withdraw an application |
| `POST` | `/saved/:jobId` | **Enqueue** a save-job write — returns `202 Accepted` + `jobId` |
| `GET` | `/saved` | List saved jobs |
| `DELETE` | `/saved/:jobId` | Remove a saved job |

> **Async writes:** `POST /apply/:jobId` and `POST /saved/:jobId` no longer block on the DB write. They immediately enqueue the work via Bull and return `202 Accepted` with a `{ jobId, status: "queued" }` body. The client must poll `GET /api/queue/job/:jobId` to track completion.

**Apply response (202):**
```json
{ "jobId": "<bull-job-id>", "status": "queued" }
```

---

### Recruiter — `/api/recruiter`

All endpoints require an `accessToken` HTTP-only cookie and role `RECRUITER`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/profile` | Get own Recruiter/company profile |
| `PATCH` | `/profile` | Update company profile (companyName, companyWebsite, description, industry) |
| `GET` | `/jobs/:jobId/applications` | List applicants for a specific job |
| `PATCH` | `/applications/:id/status` | Update application status |

**Application statuses:** `submitted` · `shortlisted` · `under_review` · `rejected`

---

### Queue — `/api/queue`

Public polling endpoint — no auth required.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/job/:jobId` | Poll the status of a queued write operation |

**Response:**
```json
{
  "id": "<bull-job-id>",
  "type": "apply-to-job",
  "status": "completed",
  "attemptsMade": 1,
  "createdAt": "2026-05-11T18:00:00.000Z",
  "result": { /* Application object on completion */ }
}
```

**Possible statuses:** `waiting` · `active` · `completed` · `failed` · `delayed` · `paused`

On `completed`, the `result` field contains the Application (or SavedJob) object.  
On `failed`, the `failedReason` field contains the error message.

---

## 🗄 Database

### Useful psql commands

```bash
# Connect from PowerShell
docker exec -it job-finder-db psql -U job_finder_user -d job_finder -W
# Password: secure_password_123

# Inside the container
psql -U job_finder_user -d job_finder
```

### pgAdmin4

- URL: `http://localhost:5050`
- Login: `admin@example.com` / `admin`

### Check if port 5432 is in use (Windows)

```bash
netstat -ano | findstr :5432

Get-Process -Id (Get-NetTCPConnection -LocalPort 5432).OwningProcess | Stop-Process -Force
```

---

## 🌱 Seeding

```bash
# Inside Docker
docker exec job-finder-backend npx prisma db seed

# Locally (without Docker)
npx prisma db seed
```

---

## 🔗 Frontend

The React frontend lives at [`../job-finder-react-customized`](../job-finder-react-customized) and proxies all `/api` calls to this service on port **5002**.