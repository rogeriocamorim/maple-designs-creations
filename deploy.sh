#!/usr/bin/env bash
set -e

TARGET="orangepi"
APP_DIR="/opt/mapledesigns"

echo "Uploading compose file to $TARGET..."
ssh "$TARGET" "mkdir -p $APP_DIR"
scp docker-compose.yml "$TARGET:$APP_DIR/"

echo "Pulling latest image and restarting services on $TARGET..."
ssh "$TARGET" "cd $APP_DIR && docker compose pull app && docker compose up -d --force-recreate"

echo "Done. App available at http://192.168.2.13:3002"
