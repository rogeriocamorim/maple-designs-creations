#!/usr/bin/env bash
set -e

echo "Starting local PostgreSQL..."
docker compose -f docker-compose.local.yml up -d

echo "Waiting for PostgreSQL to be ready..."
until docker compose -f docker-compose.local.yml exec -T postgres pg_isready -U mapledesigns > /dev/null 2>&1; do
  printf "."
  sleep 1
done
echo " ready!"

echo "Running Prisma migrations..."
npx prisma migrate dev

echo "Starting Next.js dev server..."
npm run dev
