# FROM node:18-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --omit=dev
# COPY . .
# EXPOSE 5000
# CMD ["npm", "start"]




# Use lightweight Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --no-audit --no-fund

# Copy application source code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose backend port
EXPOSE 5000

# Start application
CMD ["npm", "start"]