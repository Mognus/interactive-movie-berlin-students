# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable

# Manifests first: this layer only busts when dependencies change, so source
# edits reuse the cached install.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Vite inlines env vars into the bundle at build time, so the flag has to arrive
# here - setting it on the running container would come far too late. Off unless
# the build is explicitly told otherwise.
ARG VITE_DEV_TOOLS=0
ENV VITE_DEV_TOOLS=$VITE_DEV_TOOLS

RUN pnpm build

# Vite emits plain static files, so the runtime image needs no node and no
# node_modules — just Caddy and dist/.
FROM caddy:2-alpine AS runtime

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

# 443 for the certificate Caddy provisions once SITE_ADDRESS is a real domain.
EXPOSE 80 443

# Probes Caddy's admin API instead of the site itself: with SITE_ADDRESS set to
# a domain, port 80 only serves the HTTPS redirect and answers nothing useful
# for a request to 127.0.0.1.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
	CMD wget -qO- http://127.0.0.1:2019/config/ >/dev/null || exit 1
