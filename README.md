# VeilSpeak

VeilSpeak is a production-oriented pseudonymous social media platform built with React, TypeScript, Tailwind CSS, FastAPI, PostgreSQL, Redis, JWT access/refresh authentication, and Docker. The app uses public handles instead of real names, encrypts sensitive identity data, and exposes a modular REST API for feeds, posts, comments, notifications, moderation, settings, and admin workflows.

## Stack

- Frontend: React, TypeScript, React Router, Tailwind CSS, Axios, Context API
- Backend: FastAPI, SQLAlchemy, Alembic, JWT, bcrypt, Redis caching, structured logging
- Data: PostgreSQL, Redis
- Deployment: Docker, Docker Compose, Vite + Nginx frontend image

## Repository Structure

```text
veilspeak/
├── backend/
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── tests/
│   ├── Dockerfile
│   ├── alembic.ini
│   └── requirements.txt
├── docs/
│   └── API.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── .env.example
├── docker-compose.yml
└── README.md
```

## Features

- Pseudonymous signup/login with unique handles
- JWT access tokens plus persistent refresh token sessions
- Encrypted email storage and hashed IP telemetry
- Chronological and trending feeds
- Post creation, deletion, upvotes, and nested comments
- Search across handles and posts
- Notification center
- Settings pages for account, privacy, and safety controls
- Report submission, auto-flagging, admin moderation dashboard, and user ban flows
- Rate limiting, CORS, security headers, input validation, ORM-based query safety, and XSS sanitization

## Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Replace these values before any production deployment:

- `SECRET_KEY`
- `EMAIL_ENCRYPTION_KEY`
- `IP_HASH_PEPPER`
- `DATABASE_URL`
- `REDIS_URL`
- `BACKEND_CORS_ORIGINS`

Generate a valid Fernet key for `EMAIL_ENCRYPTION_KEY` with:

```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## Local Development

### Docker

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

### Without Docker

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## API Summary

Base URL: `/api/v1`

- Auth: `/auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- Feed: `/feed/chronological`, `/feed/trending`
- Posts: `/posts`, `/posts/{id}`, `/posts/{id}/like`, `/posts/{id}/comments`
- Users: `/users/{handle}`
- Search: `/search`
- Notifications: `/notifications`, `/notifications/mark-read`
- Reports: `/reports`, `/reports/mine`
- Settings: `/settings/account`, `/settings/privacy`, `/settings/safety`
- Admin: `/admin/dashboard`, `/admin/reports`, `/admin/users/{id}/ban`, `/admin/users/{id}/unban`

Detailed request and response examples live in [docs/API.md](/Users/sanskarnamdeo/pseudonymous-social-app/docs/API.md).

## Database Design

Core tables:

- `users`
- `posts`
- `comments`
- `likes`
- `notifications`
- `reports`
- `refresh_tokens`

The initial Alembic migration creates indexes for handle uniqueness, feed ranking, moderation lookups, notification retrieval, and refresh token revocation.

## Testing

Backend tests:

```bash
cd backend
pytest
```

Current test coverage includes health, security primitives, and moderation heuristics. Expand this with integration tests against Postgres and Redis before shipping.

## Deployment

### Render

1. Deploy PostgreSQL and Redis instances.
2. Deploy the FastAPI backend as a Docker web service using `backend/Dockerfile`.
3. Run `alembic upgrade head` as the start pre-command.
4. Deploy the frontend as a static site or Docker service from `frontend/Dockerfile`.
5. Set `VITE_API_BASE_URL` to the backend public URL.

### AWS

1. Push the backend and frontend images to ECR.
2. Run backend containers on ECS Fargate behind an ALB.
3. Use RDS PostgreSQL and ElastiCache Redis.
4. Serve the frontend from ECS + Nginx or export static assets to S3 + CloudFront.
5. Store secrets in AWS Secrets Manager or SSM Parameter Store.

### Vercel + Managed Backend

1. Build and deploy the frontend on Vercel using the `frontend/` directory.
2. Host the FastAPI backend separately on Render, Fly.io, Railway, ECS, or another container platform.
3. Point `VITE_API_BASE_URL` to the backend HTTPS endpoint.
4. Keep CORS restricted to the final Vercel domain.

## Security Notes

- Passwords are hashed with bcrypt via Passlib.
- Access and refresh tokens are signed JWTs.
- Refresh token JTIs are hashed and revocable.
- Emails are encrypted with Fernet.
- IP addresses are stored only as keyed hashes.
- Post and comment bodies are sanitized before persistence.
- Rate limiting uses Redis with an in-memory fallback.
- SQLAlchemy parameterizes queries to reduce injection risk.

## Next Production Steps

- Add background jobs for digest notifications and heavier moderation scoring.
- Add OpenTelemetry tracing and centralized log shipping.
- Add object storage if you want media uploads.
- Add full integration and end-to-end test suites.

