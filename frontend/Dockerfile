# ---------- Build Stage ----------
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./

# Clean and reproducible install
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy application source
COPY . .

# Disable source map generation for smaller production build
ENV GENERATE_SOURCEMAP=false

# Create production build
RUN npm run build


# ---------- Production Stage ----------
FROM nginx:alpine

# Security updates
RUN apk upgrade --no-cache

# Copy React build files
COPY --from=build /app/build /usr/share/nginx/html

# Expose nginx port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]