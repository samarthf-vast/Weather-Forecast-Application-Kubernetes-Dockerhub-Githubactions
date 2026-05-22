FROM node:18-alpine AS build
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
ENV NODE_OPTIONS=--max-old-space-size=512
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
