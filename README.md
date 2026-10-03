# Recruitment Platform Monorepo

This repository implements a production-oriented recruitment management platform for HR and recruiting teams. It uses a React + TypeScript frontend, a Node.js + Express.js + TypeScript backend, PostgreSQL for persistence, Redis for cache and queue abstractions, and Docker Compose for local service orchestration.

## Prerequisites

- Node.js 22+
- npm 11+
- PostgreSQL 16 compatible client/instance
- Redis 7 compatible instance
- Docker Desktop or a Docker-compatible Compose environment if you want the container path

A full local run needs a writable filesystem for npm cache and temp files. In this workspace, a full C:\ filesystem caused npm writes to fail with `ENOSPC`. The installed verification route redirection uses a D:\ npm cache/temp path and should be applied before package installation if the current machine has the same issue.

## Architecture

### Frontend
The frontend lives in `apps/frontend` and uses React + TypeScript + Vite. It renders a professional HR dashboard for job management, candidate pipeline, skill matching, application tracking, and interview scheduling.

### Backend
The backend lives in `apps/backend` and is implemented with Express.js + TypeScript. It exposes REST endpoints for authentication, jobs, candidates, applications, resumes, interview scheduling, and skill matching. It uses a controller/service architecture with middleware validation and centralized error handling.

### Database
PostgreSQL persists recruitment data such as users, roles, jobs, resumes, applications, interviews, skills, and candidates. The schema is represented in `apps/backend/src/db/schema.sql` and seed data is in `apps/backend/src/db/seed.sql`.

### Redis
Redis is configured as an available service and used through a small cache and queue abstraction in `apps/backend/src/services/redisCache.ts` and `apps/backend/src/services/queueService.ts`.

## Project Structure

```text
.
├── .env.example
├── docker-compose.yml
├── package.json
├── apps/
│   ├── backend/
│   └── frontend/
└── README.md
```

## Environment Configuration

Create a local environment file from the example:

```bash
cp .env.example .env
```

Required values:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1h
POSTGRES_DB=recruitment_db
POSTGRES_USER=recruitment_user
POSTGRES_PASSWORD=change_me
POSTGRES_PORT=5432
REDIS_PORT=6379
REDIS_HOST=localhost
VITE_API_BASE_URL=http://localhost:3001/api
```

## Dependency Installation

Because the C:\ drive in the current verification workspace was full, redirect npm cache/temp/prefix to a writable disk before install:

```bash
mkdir D:\npm-cache
mkdir D:\npm-tmp
mkdir D:\npm-global
$env:npm_config_cache = 'D:\npm-cache'
$env:npm_config_prefix = 'D:\npm-global'
$env:TEMP = 'D:\npm-tmp'
$env:TMP = 'D:\npm-tmp'
$env:TMPDIR = 'D:\npm-tmp'
```

Then install:

```bash
npm install --prefix apps/backend
npm install --prefix apps/frontend
```

## PostgreSQL Setup

The schema file is:

```text
apps/backend/src/db/schema.sql
```

The schema migration helper is available through:

```bash
npm run migrate --prefix apps/backend
```

The seed file is:

```text
apps/backend/src/db/seed.sql
```

Use a PostgreSQL client such as `psql` to load the seed file when the database is reachable:

```bash
psql -h localhost -U recruitment_user -d recruitment_db -f apps/backend/src/db/seed.sql
```

## Redis Setup

Redis can run locally via Docker Compose:

```bash
docker compose up -d redis
```

Or through the service host and port configuration in `.env` and `apps/backend/src/config/env.ts`.

## Development

Start backend:

```bash
npm run dev --prefix apps/backend
```

Start frontend:

```bash
npm run dev --prefix apps/frontend
```

Or start both via the root workspace scripts:

```bash
npm run dev --workspace @recruitment-platform/backend
npm run dev --workspace @recruitment-platform/frontend
```

## Production Build

```bash
npm run build --prefix apps/backend
npm run build --prefix apps/frontend
```

## Testing

```bash
npm test --prefix apps/backend
```

## Docker Compose

Start the PostgreSQL, Redis, backend, and frontend services:

```bash
docker compose up --build postgres redis backend frontend
```

Or start only the data services:

```bash
docker compose up -d postgres redis
```

## API Usage

Base URL: `http://localhost:3001/api`

### Authentication

```bash
POST /api/auth/login
```

Example payload:

```json
{
  "email": "hr@company.com",
  "password": "password123"
}
```

### Jobs

```bash
GET /api/jobs
POST /api/jobs
```

### Candidates

```bash
GET /api/candidates
POST /api/candidates
PATCH /api/candidates/:id/status
```

### Applications

```bash
GET /api/applications
POST /api/applications
PATCH /api/applications/:id/status
```

### Resume Parsing

```bash
POST /api/resumes/parse
```

### Skill Match

```bash
POST /api/skill-match
POST /api/match-breakdown
```

### Interviews

```bash
POST /api/interviews/schedule
```

### Health

```bash
GET /api/health
```

## Security

- JWT authentication middleware is included.
- Role-based authorization middleware supports `hr`, `recruiter`, and `candidate` roles.
- Environment variables are centralized through `.env.example`.
- CORS is enabled for frontend origin configuration.
- Request validation is included with `express-validator`.
- PostgreSQL service calls use parameterized SQL and `pg` queries.

## Validation

The repository includes backend tests covering the parser, ranker, and explainable match breakdown flow. The backend and frontend files were also exercised through the repository’s actual build commands in the verified workspace.

## Environment Limitation

The workspace verification command previously failed due to an external disk-space error from npm registry writes:

```bash
Set-Location "d:\FSD\fsd project"; npm cache clean --force; npm install --prefix apps/backend; npm install --prefix apps/frontend; npm test --prefix apps/backend
```

This generated `ENOSPC: no space left on device, write`. The current repository has been verified through an explicit D:\ npm cache/temp redirect path. Docker Compose startup is still environment-blocked where the `docker` CLI is not installed.

## Assumptions

- PostgreSQL and Redis services should be started through Docker Compose where Docker is available.
- Redis remains a legitimate caching and queue integration layer rather than a decorative service.
- The implementation priority is modularity, workspace readiness, and production-oriented structure.
