FROM node:20-slim AS base

WORKDIR /app

# Copy only the necessary files for pnpm workspace
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api-service ./apps/api-service
COPY packages/shared ./packages/shared
COPY packages/config-ts ./packages/config-ts

RUN apt-get update && apt-get install -y openssl
RUN npm install -g pnpm

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Build the application
RUN pnpm --filter shared build
RUN pnpm --filter api-service prisma:generate
RUN pnpm --filter api-service build


EXPOSE 8080
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV=production

# Use the PORT environment variable in the start command
CMD ["pnpm", "--filter", "api-service", "start"]