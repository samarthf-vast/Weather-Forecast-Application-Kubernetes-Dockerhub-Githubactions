FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
ENV GENERATE_SOURCEMAP=false
ENV CI=false
RUN npm ci
COPY . .
RUN NODE_OPTIONS="--openssl-legacy-provider" npm run build

FROM nginx:alpine
RUN apk upgrade --no-cache
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
