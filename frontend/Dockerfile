FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
ENV NODE_OPTIONS=--max-old-space-size=1536
ENV GENERATE_SOURCEMAP=false
ENV CI=false
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk upgrade --no-cache
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
