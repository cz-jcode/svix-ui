# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy build artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html/

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

# Use custom entrypoint to inject env vars at runtime
ENTRYPOINT ["/entrypoint.sh"]
