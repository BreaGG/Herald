# Project Context

## Overview
High-throughput gRPC microservice for real-time inventory management. Handles 50k+ requests/second. Latency SLA: p99 < 10ms.

## Architecture — Hexagonal

```
cmd/server/        # Entry point only. Wires dependencies.
internal/
├── domain/        # Pure business logic. No imports from infra.
│   ├── entity/    # Domain entities and value objects
│   └── port/      # Interfaces (repository, event publisher)
├── application/   # Use cases. Orchestrates domain, calls ports.
├── adapter/
│   ├── grpc/      # gRPC handler — translates proto <-> domain
│   ├── postgres/  # Repository implementations
│   └── kafka/     # Event publisher implementation
└── config/        # Config loading via envconfig
proto/             # .proto definitions (source of truth for API)
```

## Stack
- Go 1.23
- gRPC + protobuf (google.golang.org/grpc)
- PostgreSQL via pgx v5 (no ORM)
- Kafka via confluent-kafka-go
- Redis for distributed caching
- Prometheus + OpenTelemetry for observability
- golangci-lint for linting
- testify + gomock for testing

## Conventions
- **Dependency rule**: domain imports nothing from adapter or application
- **Interfaces in the consuming package** — define ports in `domain/port/`, not in adapters
- **No `init()`** — all initialization in `main()` or explicit constructors
- **Errors**: wrap with `fmt.Errorf("context: %w", err)` — never discard errors
- **Context everywhere**: first argument of every function that does I/O
- **No global state** — dependency injection via constructors
- **Proto first**: change `.proto` files before changing Go code
- **Table-driven tests**: all unit tests use `t.Run()` subtests

## Performance constraints
- No allocations in hot paths — profile before optimizing
- Use `sync.Pool` for frequently allocated structs
- Prefer `[]byte` over `string` in serialization paths
- Connection pool sizes configured via env, not hardcoded

## Do Not Touch
- `proto/` — generated `.pb.go` files, run `make proto` to regenerate
- `internal/adapter/postgres/migrations/` — use `make migrate-up` only
- `vendor/` — managed by `go mod vendor`, never edit manually
