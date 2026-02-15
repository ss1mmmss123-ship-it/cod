#!/usr/bin/env bash
set -euo pipefail

cp -n .env.example .env || true
docker compose -f infra/docker-compose.yml up -d postgres redis

echo "Run schema: psql postgresql://durak:durak@localhost:5432/durak -f backend/prisma/schema.sql"
echo "Start backend: (cd backend && npm i && npm run dev)"
echo "Start frontend: (cd frontend && npm i && npm run dev)"
