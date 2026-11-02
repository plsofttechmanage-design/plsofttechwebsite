# ==============================================================================
# Website Template Marketplace & Builder - Frontend Production Dockerfile
# Multi-stage build: Node.js build runner + Nginx Alpine static web server
# ==============================================================================

# --- Stage 1: Build static assets with Node.js ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build production distribution
COPY . ./
RUN npm run build

# --- Stage 2: Serve optimized assets with Nginx ---
FROM nginx:alpine

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

