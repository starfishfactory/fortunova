FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache libstdc++ docker-cli
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=384"
EXPOSE 3000
CMD ["node", "dist/index.js"]
