FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
# Use npm install so build works even without a lockfile
RUN npm install --omit=dev --no-audit --no-fund

FROM node:18-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
CMD ["npm","run","dev"]

# Production image
FROM node:18-alpine AS prod
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node","src/index.js"]
