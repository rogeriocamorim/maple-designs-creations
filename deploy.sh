#!/usr/bin/env bash
set -e

TARGET="orangepi"
APP_DIR="/opt/mapledesigns"
IMAGE="mapledesigns:latest"

if [ ! -f .env.production ]; then
  echo "Error: .env.production not found. Create it from .env.production.example."
  exit 1
fi

echo "Building Docker image for linux/arm64..."
docker buildx build --platform linux/arm64 -t "$IMAGE" .

echo "Transferring image to $TARGET..."
docker save "$IMAGE" | ssh "$TARGET" "docker load"
ssh "$TARGET" "docker tag localhost/$IMAGE $IMAGE 2>/dev/null || true"

echo "Uploading compose and env files..."
ssh "$TARGET" "mkdir -p $APP_DIR"
scp docker-compose.yml .env.production "$TARGET:$APP_DIR/"
ssh "$TARGET" "mv $APP_DIR/.env.production $APP_DIR/.env"

echo "Starting services on $TARGET..."
ssh "$TARGET" "cd $APP_DIR && docker-compose up -d --force-recreate"

echo "Done. App available at http://192.168.2.13:3002"
