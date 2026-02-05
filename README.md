# Trauma2 API

Meta-schema API for SurrealDB type system management.

## Tech Stack

- **Runtime**: Bun.js v1.1+
- **Framework**: Elysia.js
- **Validation**: TypeBox
- **Database**: SurrealDB v2.3.8+
- **Language**: TypeScript (strict mode)
- **Logging**: Pino
- **Documentation**: Swagger/OpenAPI

## Quick Start

### Prerequisites

- Bun v1.1+ installed ([Download](https://bun.sh))
- Docker & Docker Compose (for database)

### Fastest Start (Development)

```bash
# 1. Install dependencies
bun install

# 2. Copy development config
cp .env.development .env

# 3. Start database
bun run dev:db

# 4. Start API (in new terminal)
bun run dev

# 5. Open http://localhost:3000/docs
```

### Development Setup (Recommended)

Run the API on your host machine with hot-reload, while SurrealDB runs in Docker:

1. **Clone and install dependencies**:
```bash
cd /opt/projects/trauma2
bun install
```

2. **Copy development environment file**:
```bash
cp .env.development .env
# Edit .env if needed
```

3. **Start SurrealDB in Docker**:
```bash
bun run dev:db
# or: docker compose -f docker-compose.dev.yml up -d
```

4. **Run development server** (with hot-reload):
```bash
bun run dev
```

5. **Visit**:
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/docs
- Health Check: http://localhost:3000/api/health

**Development Scripts**:
- `bun run dev:db` - Start only SurrealDB (with persistent data)
- `bun run dev:db:down` - Stop SurrealDB
- `bun run dev:db:logs` - View SurrealDB logs
- `bun run dev` - Run API with hot-reload (--watch)

### Production (Docker Compose)

Run both SurrealDB and API in Docker containers:

```bash
# Start both services
bun run docker:up
# or: docker compose up -d

# View API logs
bun run docker:logs
# or: docker compose logs -f api

# Rebuild after code changes
bun run docker:rebuild
# or: docker compose up -d --build

# Stop all services
bun run docker:down
# or: docker compose down
```

**Production Scripts**:
- `bun run docker:up` - Start full stack (SurrealDB + API)
- `bun run docker:down` - Stop all containers
- `bun run docker:logs` - View logs
- `bun run docker:rebuild` - Rebuild and restart

**Development vs Production**:
| Setup | Command | Use Case |
|-------|---------|----------|
| Development | `bun run dev:db && bun run dev` | Fast iteration, debugging, hot-reload |
| Production | `bun run docker:up` | Full stack testing, deployment preview |

## API Documentation

Full API documentation available at `/docs` (Swagger UI) when running.

### Authentication

Two authentication strategies supported:

#### 1. Basic Auth (for admin operations)
```bash
curl -u admin:changeme http://localhost:3000/api/health
```

#### 2. JWT (for regular users)

**Login** to get token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Use token**:
```bash
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Available Endpoints

- `GET /api/health` - Basic health check
- `GET /api/health/db` - Database health check
- `POST /api/auth/login` - User login (returns JWT tokens)
- `GET /api/meta` - Meta-schema placeholder (coming soon)
- `GET /docs` - Swagger documentation

## Project Structure

```
trauma2/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/                  # Configuration & ENV validation
│   ├── database/                # SurrealDB client & pool
│   ├── middleware/              # Auth, logging, error handling
│   ├── auth/                    # Auth strategies (Basic + JWT)
│   ├── routes/                  # API endpoints
│   ├── services/                # Business logic
│   ├── schemas/                 # TypeBox validation schemas
│   ├── utils/                   # Logger, errors
│   └── swagger/                 # OpenAPI config
├── tests/                       # Tests
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.yml           # SurrealDB + API
└── .env.example                 # Environment template
```

## Scripts

```bash
# Development
bun run dev              # Start with hot reload

# Production
bun run start            # Start production server
bun run build            # Build for production

# Quality
bun run typecheck        # TypeScript type check
bun run lint             # Lint code
bun run format           # Format code with Prettier

# Testing
bun test                 # Run tests
bun test --watch         # Watch mode
bun test --coverage      # With coverage
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port (default: 3000)
- `SURREALDB_URL` - Database connection URL
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `LOG_LEVEL` - Logging level (info/debug/error/etc)
- `SWAGGER_ENABLED` - Enable/disable API docs

## Development

### TypeScript Strict Mode

This project uses strict TypeScript:
- No `any` types (use `unknown`)
- Explicit return types for public functions
- `interface` over `type` for objects
- Full null safety

### Best Practices

- **Config**: All ENV variables validated with TypeBox at startup
- **Database**: Parameterized queries, connection pooling
- **Auth**: Basic Auth + JWT with proper validation
- **Logging**: Structured logging with Pino
- **Errors**: Custom error classes with centralized handling

## Testing

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage

# Specific test file
bun test src/auth/jwt.test.ts
```

## Docker

### Build image
```bash
docker build -t trauma2-api .
```

### Run with Docker Compose
```bash
# Start
docker-compose up

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up --build
```

## Troubleshooting

### Database Connection Errors
```
Failed to connect to SurrealDB
```
**Solution**: Make sure SurrealDB is running on port 8000:
```bash
docker run -p 8000:8000 surrealdb/surrealdb:latest start --user root --pass root
```

### Port Already in Use
```
EADDRINUSE: address already in use
```
**Solution**: Change `PORT` in `.env` or stop other services on port 3000.

### TypeScript Errors
```bash
# Check types
bun run typecheck

# Common issues:
# - Missing path aliases in tsconfig.json
# - Incorrect import paths
# - Missing type definitions
```

## Next Steps

After scaffolding is complete:
1. User provides meta-schema specifications
2. Implement type system logic in `src/services/meta/`
3. Add API endpoints in `src/routes/meta/`
4. Define SurrealDB schema for type definitions
5. Implement document validation against types

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checks
5. Submit a pull request

---

Built with [Bun](https://bun.sh) + [Elysia](https://elysiajs.com) + [SurrealDB](https://surrealdb.com)
