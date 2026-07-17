# Shared base: node + dependencies (cached as long as the lockfile doesn't change)
FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Dev target: source code is bind-mounted by compose, HMR via port 5173
FROM base AS dev
EXPOSE 5173
CMD ["pnpm", "dev", "--host"]

# Build stage: produce the static bundle
FROM base AS build
COPY . .
RUN pnpm build

# Prod target: nginx serves dist/ - node never ships to production
FROM nginx:alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
