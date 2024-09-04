FROM node:20-slim AS base

WORKDIR /app

# Copy only the necessary files for pnpm workspace
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/websocket-service ./apps/websocket-service
COPY packages/shared ./packages/shared

RUN npm install -g pnpm

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Build the application
RUN pnpm --filter shared build
RUN pnpm --filter websocket-service build

# Expose port 6005
EXPOSE 8080
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "--filter", "websocket-service", "start"]