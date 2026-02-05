# Multi-stage Dockerfile for Trauma2 API

# Stage 1: Dependencies
FROM oven/bun:1.1.42-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies (production only)
RUN bun install --frozen-lockfile --production

# Stage 2: Builder
FROM oven/bun:1.1.42-alpine AS builder
WORKDIR /app

# Copy package files and install ALL dependencies (including dev)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Type check
RUN bunx tsc --noEmit

# Build for production
RUN bun build src/index.ts --outdir=dist --target=bun --minify

# Stage 3: Runtime
FROM oven/bun:1.1.42-alpine AS runtime
WORKDIR /app

# Security: create non-root user
RUN addgroup --system --gid 1001 bunuser && \
    adduser --system --uid 1001 bunuser

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Change ownership to non-root user
RUN chown -R bunuser:bunuser /app

# Switch to non-root user
USER bunuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1))" || exit 1

# Start application
CMD ["bun", "dist/index.js"]
