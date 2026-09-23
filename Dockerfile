# syntax=docker/dockerfile:1

###################################################################################################
# This Dockerfile is designed for production use. For local development, please refer to the
# Makefile which provide a more suitable environment for development with features
###################################################################################################

FROM node:22-bookworm-slim AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY web/package.json web/package-lock.json ./
RUN npm ci

FROM base AS builder

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY web ./

ARG NEXT_PUBLIC_SITE_URL
ARG SITE_FULL_NAME
ARG SITE_SHORT_NAME

# These build-only placeholders satisfy module-level env validation. Dokploy
# runtime env vars will provide the real values when the container starts.
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres" \
	npx prisma generate
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres" \
	NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}" \
	SITE_FULL_NAME="${SITE_FULL_NAME}" \
	SITE_SHORT_NAME="${SITE_SHORT_NAME}" \
	BETTER_AUTH_URL="http://localhost:3000" \
	BETTER_AUTH_SECRET="docker-build-placeholder-secret-at-least-32-characters" \
	GOOGLE_CLIENT_ID="docker-build-placeholder" \
	GOOGLE_CLIENT_SECRET="docker-build-placeholder" \
	RESEND_API_KEY="docker-build-placeholder" \
	RESEND_FROM_EMAIL="docker-build-placeholder" \
	npm run build

FROM base AS migrator

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY web ./
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres" \
	npx prisma generate

CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir .next \
	&& chown node:node .next

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/uploads ./uploads
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
