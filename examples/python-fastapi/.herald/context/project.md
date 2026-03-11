# Project Context

## Overview
Async REST microservice for handling payment processing. Deployed as a standalone container behind an API gateway.

## Architecture
- **Framework**: FastAPI with async/await throughout
- **Database**: PostgreSQL 16 via SQLAlchemy 2.0 (async) + Alembic migrations
- **Validation**: Pydantic v2 for all request/response models
- **Auth**: API key validation via middleware, no session state
- **Background tasks**: Celery + Redis for async job processing
- **Observability**: structlog for structured logging, Prometheus metrics

## Stack
- Python 3.12
- FastAPI 0.115
- SQLAlchemy 2.0 (async)
- Alembic
- Pydantic v2
- Celery 5 + Redis
- pytest + httpx for testing
- uv for dependency management

## Project structure
```
src/
├── api/
│   ├── routes/           # FastAPI routers, one file per domain
│   └── middleware/       # Auth, logging, error handling
├── core/
│   ├── config.py         # Settings via pydantic-settings
│   └── database.py       # Async engine and session factory
├── models/               # SQLAlchemy ORM models
├── schemas/              # Pydantic request/response schemas
├── services/             # Business logic (never import from routes directly)
└── tasks/                # Celery task definitions
tests/
├── unit/
└── integration/          # Uses test database, real HTTP via httpx
```

## Conventions
- **Type hints everywhere** — no untyped functions, ever
- **Pydantic for all I/O** — request bodies, responses, config
- **Services own business logic** — routes only parse input and call services
- **Async all the way** — no sync database calls, no `time.sleep()`
- **Dependency injection** — use `Depends()` for db sessions, auth, services
- **structlog** — never use `print()` or `logging` directly
- **Alembic only** — never modify database schema outside migrations

## Testing
- `pytest` with `pytest-asyncio`
- Integration tests use a dedicated test database (see `tests/conftest.py`)
- Run: `uv run pytest` (all), `uv run pytest tests/unit` (unit only)
- Coverage target: 80% minimum on `src/services/`

## Do Not Touch
- `alembic/versions/` — never edit migration files manually
- `src/core/config.py` — only add fields, never remove (backwards compatibility)
- `.env.production` — managed by infra team, never committed
