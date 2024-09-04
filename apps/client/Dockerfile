FROM node:20-alpine AS build
WORKDIR /app

# Copy only the necessary files for pnpm workspace
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/client ./apps/client
COPY packages ./packages

# Install pnpm
RUN npm install -g pnpm

# Install dependencies and build the application
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter client build

# Stage 2: Set up Nginx to serve the application
FROM nginx:alpine AS runtime

# Remove the default Nginx website
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*.conf

COPY --from=build /app/apps/client/nginx.conf /etc/nginx/conf.d/

# Copy built application from the build stage
COPY --from=build /app/apps/client/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 8080
ENV NODE_ENV=production

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]