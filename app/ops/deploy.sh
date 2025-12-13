#!/usr/bin/env bash
set -e

SERVER="morchess"
APP_DIR="/var/www/morchess-api"


echo "▶ Syncing application files..."
rsync -av --delete \
  src/ \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  $SERVER:$APP_DIR/

echo "▶ Installing production dependencies on server..."
ssh $SERVER "cd $APP_DIR && pnpm install --frozen-lockfile --prod"

echo "▶ Restarting service..."
ssh $SERVER "sudo systemctl restart morchess"

echo "✅ Deployment complete"
