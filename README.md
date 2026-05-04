# ⚡ Job Finder — Backend API

A role-based job board REST API built with **Express.js**, **PostgreSQL**, and **Prisma ORM**. Supports Job Seeker and Recruiter roles with JWT access tokens + HTTP-only refresh token cookies.

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express.js | HTTP server & routing |
| TypeScript | Type safety |
| Prisma ORM | Database access layer |
| PostgreSQL | Relational database |
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
├── routes/          # Express router definitions
├── middleware/       # requireAuth, authorizeRoles, validate
├── validators/      # Zod schemas
├── prisma/          # Prisma client singleton
└── utils/           # token.ts, hash.ts
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
| `POST` | `/login` | — | Login; returns `accessToken` + sets `refreshToken` cookie |
| `POST` | `/logout` | — | Clears `refreshToken` cookie |
| `POST` | `/refresh` | Cookie | Issue new access + refresh tokens |
| `GET`  | `/me` | Bearer | Get current authenticated user |
| `POST` | `/upgrade/recruiter` | Bearer (JOB_SEEKER) | Upgrade Job Seeker account to Recruiter |

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
Response: `{ "accessToken": "<JWT>" }` + `Set-Cookie: refreshToken=<JWT>; HttpOnly`

**Get Me** `GET /api/auth/me` _(requires `Authorization: Bearer <accessToken>`)_
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

All endpoints require `Authorization: Bearer <accessToken>` with role `JOB_SEEKER`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/profile` | Get own Job Seeker profile |
| `PATCH` | `/profile` | Update profile (bio, location, skills, education, experience, resumeUrl) |
| `POST` | `/apply/:jobId` | Apply to a job (optional `coverLetter` in body) |
| `GET` | `/applications` | List own applications |
| `DELETE` | `/applications/:id` | Withdraw an application |
| `POST` | `/saved/:jobId` | Save a job |
| `GET` | `/saved` | List saved jobs |
| `DELETE` | `/saved/:jobId` | Remove a saved job |

---

### Recruiter — `/api/recruiter`

All endpoints require `Authorization: Bearer <accessToken>` with role `RECRUITER`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/profile` | Get own Recruiter/company profile |
| `PATCH` | `/profile` | Update company profile (companyName, companyWebsite, description, industry) |
| `GET` | `/jobs/:jobId/applications` | List applicants for a specific job |
| `PATCH` | `/applications/:id/status` | Update application status |

**Application statuses:** `submitted` · `shortlisted` · `under_review` · `rejected`

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