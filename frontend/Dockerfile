FROM node:18
WORKDIR /app
COPY package*.json ./
ENV NODE_OPTIONS=--max-old-space-size=512
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
