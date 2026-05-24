FROM node:18.20-alpine3.20 AS build
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --chown=appuser:appgroup package*.json ./
ENV GENERATE_SOURCEMAP=false
RUN npm ci
COPY --chown=appuser:appgroup . .
RUN NODE_OPTIONS="--openssl-legacy-provider" npm run build

FROM nginx:1.27-alpine3.20
RUN apk upgrade --no-cache

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
