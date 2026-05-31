FROM node:18-alpine
# Upgrade Alpine packages to fix OS-level CVEs
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit
# Copy application source code
COPY . .
# Set production environment
ENV NODE_ENV=production

# Expose backend port
EXPOSE 5000

# Start application
CMD ["npm", "start"]