#!/usr/bin/env bash
set -e

SERVER="morchess"
APP_DIR="/var/www/morchess-api"

echo "▶ Building application files.."
pnpm build

echo "▶ Syncing application files..."
rsync -av --delete \
  dist \
  migrations \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  $SERVER:$APP_DIR/

echo "▶ Creating data directory.."
ssh $SERVER "cd $APP_DIR && mkdir -p data"

echo "▶ Installing production dependencies on server..."
ssh $SERVER "cd $APP_DIR && pnpm install --frozen-lockfile --prod"


echo "▶ Restarting service..."
ssh $SERVER "sudo systemctl restart morchess"

echo "✅ Deployment complete"
