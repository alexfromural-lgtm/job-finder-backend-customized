# 🔐 Job Finder Backend API

A simple authentication backend built with **Express.js**, **PostgreSQL**, and **Prisma ORM**. This service provides signup, login, and user authentication APIs with secure access tokens and refresh tokens via cookies.

---

## 🚀 Features

- User signup & login with JWT authentication
- Access & refresh token management via HTTP-only cookies
- Protected routes using middleware
- PostgreSQL database with Prisma ORM
- Environment-based configuration
- CORS support for frontend communication

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Auth:** JWT, Cookies
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Language:** TypeScript
- **Other:** dotenv, cookie-parser, cors

---

## 🔨 Setup & Running Locally
### Prerequisites
- Node.js (v16+ recommended)
- PostgreSQL (if not using Docker)
- npm or yarn

- Copy `.env.sample` to `.env` to create your local environment configuration:

  ```bash
  cp .env.sample .env

- update `.env` with your actual values

## Run

```bash
docker-compose up --build
```

## 🧪 API Endpoints

Base URL: `http://localhost:5002/api/auth`

| Method | Endpoint  | Description        |
|--------|-----------|--------------------|
| POST   | `/signup` | Register a new user |
| POST   | `/login`  | Authenticate user & return access token |
| GET    | `/me`     | Get current user info (requires auth) |

---

## 📄 Request/Response Example

### 🔐 Signup

**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "accessToken": "JWT_TOKEN"
}
```

### Generate ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET

```bash
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('base64').substring(0, 32));"
```

### pgAdmin4 (already configured in docker-compose.yml)

- Access at: `http://localhost:5050`
- Login: `admin@example.com` / `admin`

### Run psql on the docker container

**From PowerShell:**
```bash
docker exec -it job-finder-db psql -U job_finder_user -d job_finder -W
```

**From inside the PostgreSQL Docker container:**
```bash
psql -U job_finder_user -d job_finder
# Press Enter, then type: secure_password_123
```

### Troubleshooting: Check if port 5432 is in use

```bash
netstat -ano | findstr :5432
```

### Seed DB inside Docker

```bash
docker exec job-finder-backend npx prisma db seed
```